/**
 * MadalineEngine — MADALINE (MR-I) untuk Deteksi Flu
 * Arsitektur: 3 Input (Demam,Batuk,Pilek) → 2 ADALINE → 1 Output (AND Gate)
 * Encoding: Bipolar (1 = Ya, -1 = Tidak)
 * Output AND: +1 hanya jika KEDUA ADALINE = +1, selainnya -1
 *
 * === ATURAN UPDATE BOBOT: WIDROW-HOFF ===
 * Δw = α × (t - z_in) × Xi
 * Δb = α × (t - z_in)
 * w_baru = w_lama + Δw
 * b_baru = b_lama + Δb
 *
 * === ALGORITMA TRAINING ===
 * 1. Untuk setiap data, hitung output (feedforward).
 * 2. Jika output == target → lanjut data berikutnya (bobot tetap).
 * 3. Jika output != target:
 *    a. Jika target=+1 tapi output=-1:
 *       → Cari ADALINE yang outputnya -1 (z_in negatif) dengan z_in paling mendekati 0.
 *       → Update bobot ADALINE tersebut dengan Widrow-Hoff (target ADALINE = +1).
 *    b. Jika target=-1 tapi output=+1:
 *       → Cari ADALINE yang outputnya +1 (z_in positif) dengan z_in paling mendekati 0.
 *       → Update bobot ADALINE tersebut dengan Widrow-Hoff (target ADALINE = -1).
 *    c. Hitung ulang data yang sama dengan bobot terbaru.
 *    d. Jika sekarang benar → lanjut data berikutnya.
 *    e. Jika masih salah → coba update ADALINE lainnya juga, lalu lanjut.
 * 4. Setelah semua 20 data diproses = 1 epoch.
 * 5. Epoch berikutnya: ulang dari data ke-1 dengan bobot terakhir.
 * 6. Konvergen jika 1 epoch penuh TANPA error, atau berhenti di max epoch.
 */
class MadalineEngine {
  constructor(config = {}) {
    this.learningRate = config.learningRate ?? 0.5;
    this.maxEpochs = config.maxEpochs ?? 50;
    this.featureNames = ['Demam', 'Batuk', 'Pilek'];

    // 20 data flu (bipolar: 1=Ya, -1=Tidak; Target: 1=Flu, -1=Tidak Flu)
    this.inputs = [
      [1,1,1],[1,1,-1],[1,-1,1],[-1,1,1],[1,-1,-1],
      [-1,1,-1],[-1,-1,1],[-1,-1,-1],
      [1,1,1],[1,1,-1],[1,-1,1],[-1,1,1],[1,-1,-1],
      [-1,1,-1],[-1,-1,1],[-1,-1,-1],
      [1,1,1],[1,-1,1],[-1,1,1],[-1,-1,-1]
    ];
    this.targets = [1,1,1,1,1,-1,-1,-1,1,1,1,1,1,-1,-1,-1,1,1,1,-1];

    this.initialWeights = {
      adaline1: { w: [0.5, 0.3, -0.2], b: 0.1 },
      adaline2: { w: [-0.1, 0.4, 0.2], b: 0.2 }
    };
    this._resetState();
  }

  _resetState() {
    this.adaline1 = this._clone(this.initialWeights.adaline1);
    this.adaline2 = this._clone(this.initialWeights.adaline2);
    this.history = [];
    this.epochErrors = [];
    this.currentEpoch = 0;
    this.currentPatternIndex = 0;
    this.totalSteps = 0;
    this.converged = false;
    this.isTraining = false;
    this.finalWeights = null;
    this._epochErrorCount = 0;
  }

  _clone(ad) { return { w: [...ad.w], b: ad.b }; }
  reset(config = {}) {
    this.learningRate = config.learningRate ?? this.learningRate;
    this.maxEpochs = config.maxEpochs ?? this.maxEpochs;
    this._resetState();
  }
  sign(x) { return x >= 0 ? 1 : -1; }
  netInput(ad, inp) { return ad.b + inp[0]*ad.w[0] + inp[1]*ad.w[1] + inp[2]*ad.w[2]; }
  andGate(y1, y2) { return (y1 === 1 && y2 === 1) ? 1 : -1; }
  fmt(n) { return Number(n.toFixed(4)); }

  /**
   * trainStep — satu langkah training untuk satu pola input.
   */
  trainStep() {
    if (this.converged || this.currentEpoch >= this.maxEpochs) {
      this.converged = this.converged || false;
      this.finalWeights = this.getCurrentWeights();
      return null;
    }

    // Awal epoch baru
    if (this.currentPatternIndex === 0) {
      this.currentEpoch++;
      this._epochErrorCount = 0;
    }

    const inp = this.inputs[this.currentPatternIndex];
    const target = this.targets[this.currentPatternIndex];
    const alpha = this.learningRate;
    const [x1,x2,x3] = inp;

    // --- LANGKAH 1: Hitung output dengan bobot saat ini ---
    const z1 = this.netInput(this.adaline1, inp);
    const z2 = this.netInput(this.adaline2, inp);
    const y1 = this.sign(z1), y2 = this.sign(z2);
    const yOut = this.andGate(y1, y2);
    const hasError = yOut !== target;

    // Format formula untuk trace
    const fmtZ1 = `Z_{1_{in}} = ${this.fmt(this.adaline1.b)} + (${x1})(${this.fmt(this.adaline1.w[0])}) + (${x2})(${this.fmt(this.adaline1.w[1])}) + (${x3})(${this.fmt(this.adaline1.w[2])}) = ${this.fmt(z1)}`;
    const fmtZ2 = `Z_{2_{in}} = ${this.fmt(this.adaline2.b)} + (${x1})(${this.fmt(this.adaline2.w[0])}) + (${x2})(${this.fmt(this.adaline2.w[1])}) + (${x3})(${this.fmt(this.adaline2.w[2])}) = ${this.fmt(z2)}`;
    const fmtY1 = `Y_1 = f(${this.fmt(z1)}) = ${y1}`;
    const fmtY2 = `Y_2 = f(${this.fmt(z2)}) = ${y2}`;
    const fmtAND = `Y_{out} = AND(${y1}, ${y2}) = ${yOut}`;

    // --- LANGKAH 2: Jika ada error, koreksi dengan Widrow-Hoff ---
    let koreksiMRI = null;
    let reVerification = null;

    if (hasError) {
      this._epochErrorCount++;
      koreksiMRI = this._applyWidrowHoff(inp, target, z1, z2, y1, y2, alpha);

      // --- LANGKAH 3: Re-verify setelah update bobot ---
      const z1New = this.netInput(this.adaline1, inp);
      const z2New = this.netInput(this.adaline2, inp);
      const y1New = this.sign(z1New), y2New = this.sign(z2New);
      const yOutNew = this.andGate(y1New, y2New);
      const stillError = yOutNew !== target;

      reVerification = {
        z1: this.fmt(z1New), z2: this.fmt(z2New),
        y1: y1New, y2: y2New, yOut: yOutNew,
        isCorrect: !stillError,
        formula: {
          z1: `Z_{1_{in}}^{new} = ${this.fmt(this.adaline1.b)} + (${x1})(${this.fmt(this.adaline1.w[0])}) + (${x2})(${this.fmt(this.adaline1.w[1])}) + (${x3})(${this.fmt(this.adaline1.w[2])}) = ${this.fmt(z1New)}`,
          z2: `Z_{2_{in}}^{new} = ${this.fmt(this.adaline2.b)} + (${x1})(${this.fmt(this.adaline2.w[0])}) + (${x2})(${this.fmt(this.adaline2.w[1])}) + (${x3})(${this.fmt(this.adaline2.w[2])}) = ${this.fmt(z2New)}`,
          y1: `Y_1^{new} = f(${this.fmt(z1New)}) = ${y1New}`,
          y2: `Y_2^{new} = f(${this.fmt(z2New)}) = ${y2New}`,
          mv: `Y_{out}^{new} = AND(${y1New}, ${y2New}) = ${yOutNew}`
        },
        keterangan: stillError
          ? `Masih SALAH setelah update (T=${target}, Y=${yOutNew})`
          : `BENAR setelah update! (T=${target}=Y=${yOutNew})`
      };

      // Jika masih salah, coba update ADALINE yang kedua juga
      if (stillError) {
        const secondResult = this._applyWidrowHoffSecond(inp, target, koreksiMRI.adalineYangDipilih, alpha);
        if (secondResult) {
          koreksiMRI.secondAttempt = secondResult;

          // Re-verify lagi
          const z1New2 = this.netInput(this.adaline1, inp);
          const z2New2 = this.netInput(this.adaline2, inp);
          const y1New2 = this.sign(z1New2), y2New2 = this.sign(z2New2);
          const yOutNew2 = this.andGate(y1New2, y2New2);
          reVerification.secondVerification = {
            z1: this.fmt(z1New2), z2: this.fmt(z2New2),
            y1: y1New2, y2: y2New2, yOut: yOutNew2,
            isCorrect: yOutNew2 === target,
            keterangan: yOutNew2 === target
              ? `BENAR setelah update kedua! (T=${target}=Y=${yOutNew2})`
              : `Masih SALAH setelah update kedua (T=${target}, Y=${yOutNew2})`
          };
        }
      }
    }

    // --- Buat record step ---
    const rec = {
      epoch: this.currentEpoch,
      stepInEpoch: this.currentPatternIndex + 1,
      totalStep: ++this.totalSteps,
      dataNo: this.currentPatternIndex + 1,
      input: [...inp], target, targetLabel: target===1?'Flu':'Tidak Flu',
      netInputs: { adaline1:{zIn:this.fmt(z1),formula:fmtZ1}, adaline2:{zIn:this.fmt(z2),formula:fmtZ2} },
      outputs: { adaline1:{y:y1,formula:fmtY1}, adaline2:{y:y2,formula:fmtY2} },
      andGate: { result:yOut, formula:fmtAND },
      error: { hasError, target, output:yOut, keterangan: hasError ? `SALAH! T=${target}, Y=${yOut}` : `BENAR! T=${target}=Y` },
      koreksiMRI,
      reVerification,
      weightsAfter: this.getCurrentWeights()
    };
    this.history.push(rec);

    // --- Lanjut ke pola berikutnya ---
    this.currentPatternIndex++;
    if (this.currentPatternIndex >= this.inputs.length) {
      this.epochErrors.push({
        epoch: this.currentEpoch,
        errorCount: this._epochErrorCount,
        errorRate: this._epochErrorCount / this.inputs.length
      });
      if (this._epochErrorCount === 0) {
        this.converged = true;
        this.finalWeights = this.getCurrentWeights();
      }
      this.currentPatternIndex = 0;
    }
    return rec;
  }

  /**
   * Koreksi bobot dengan aturan Widrow-Hoff.
   *
   * Jika target=+1 tapi output=-1:
   *   → Cari ADALINE yang z_in-nya NEGATIF (output -1) dan paling mendekati 0.
   *   → target_adaline = +1
   *
   * Jika target=-1 tapi output=+1:
   *   → Cari ADALINE yang z_in-nya POSITIF (output +1) dan paling mendekati 0.
   *   → target_adaline = -1
   *
   * Update: Δw = α(t_adaline - z_in) × Xi
   *         Δb = α(t_adaline - z_in)
   */
  _applyWidrowHoff(inp, target, z1, z2, y1, y2, alpha) {
    const [x1,x2,x3] = inp;

    let candidates = [];

    if (target === 1) {
      // Target +1, output -1 → setidaknya 1 ADALINE output -1 (z_in negatif)
      // Pilih ADALINE yang z_in negatif dan paling mendekati 0
      if (y1 === -1) candidates.push({ name:'ADALINE 1', ref:'adaline1', z:z1, absZ:Math.abs(z1), wl:['w_{11}','w_{12}','w_{13}','b_1'], tAdaline: 1 });
      if (y2 === -1) candidates.push({ name:'ADALINE 2', ref:'adaline2', z:z2, absZ:Math.abs(z2), wl:['w_{21}','w_{22}','w_{23}','b_2'], tAdaline: 1 });
    } else {
      // Target -1, output +1 → kedua ADALINE output +1 (z_in positif)
      // Pilih ADALINE yang z_in positif dan paling mendekati 0
      if (y1 === 1) candidates.push({ name:'ADALINE 1', ref:'adaline1', z:z1, absZ:Math.abs(z1), wl:['w_{11}','w_{12}','w_{13}','b_1'], tAdaline: -1 });
      if (y2 === 1) candidates.push({ name:'ADALINE 2', ref:'adaline2', z:z2, absZ:Math.abs(z2), wl:['w_{21}','w_{22}','w_{23}','b_2'], tAdaline: -1 });
    }

    // Sort: yang |z_in| paling kecil (paling dekat 0) dipilih duluan
    candidates.sort((a,b) => a.absZ - b.absZ);

    const u = candidates[0];
    const ad = this[u.ref];
    const ow = [...ad.w], ob = ad.b;
    const tAd = u.tAdaline;
    const zIn = u.z;

    // Widrow-Hoff: Δw = α(t - z_in) * Xi,  Δb = α(t - z_in)
    const delta = alpha * (tAd - zIn);
    ad.w[0] = ow[0] + delta * x1;
    ad.w[1] = ow[1] + delta * x2;
    ad.w[2] = ow[2] + delta * x3;
    ad.b = ob + delta;

    return {
      adalineYangDipilih: u.name,
      tAdaline: tAd,
      zIn: this.fmt(zIn),
      delta: this.fmt(delta),
      alasan: `${u.name} dipilih karena Z_in=${this.fmt(zIn)} (|Z_in|=${this.fmt(u.absZ)}) paling mendekati 0. Target ADALINE: ${tAd > 0 ? '+1' : '-1'}`,
      formulaUpdate: [
        `\\Delta w = \\alpha(t - Z_{in}) = ${alpha}(${tAd} - (${this.fmt(zIn)})) = ${this.fmt(delta)}`,
        `${u.wl[0]}^{baru} = ${this.fmt(ow[0])} + (${this.fmt(delta)})(${x1}) = ${this.fmt(ad.w[0])}`,
        `${u.wl[1]}^{baru} = ${this.fmt(ow[1])} + (${this.fmt(delta)})(${x2}) = ${this.fmt(ad.w[1])}`,
        `${u.wl[2]}^{baru} = ${this.fmt(ow[2])} + (${this.fmt(delta)})(${x3}) = ${this.fmt(ad.w[2])}`,
        `${u.wl[3]}^{baru} = ${this.fmt(ob)} + ${this.fmt(delta)} = ${this.fmt(ad.b)}`
      ]
    };
  }

  /**
   * Percobaan kedua: jika setelah update pertama masih salah,
   * coba update ADALINE yang lain juga dengan Widrow-Hoff.
   */
  _applyWidrowHoffSecond(inp, target, firstUnitName, alpha) {
    const [x1,x2,x3] = inp;

    const secondRef = firstUnitName === 'ADALINE 1' ? 'adaline2' : 'adaline1';
    const secondName = firstUnitName === 'ADALINE 1' ? 'ADALINE 2' : 'ADALINE 1';
    const wl = secondRef === 'adaline1' ? ['w_{11}','w_{12}','w_{13}','b_1'] : ['w_{21}','w_{22}','w_{23}','b_2'];

    const ad = this[secondRef];
    const zIn = this.netInput(ad, inp);
    const y = this.sign(zIn);
    const ow = [...ad.w], ob = ad.b;

    // Tentukan target ADALINE
    const tAd = (target === 1) ? 1 : -1;

    // Hanya update jika output unit ini belum sesuai target
    if (y === tAd) return null;

    const delta = alpha * (tAd - zIn);
    ad.w[0] = ow[0] + delta * x1;
    ad.w[1] = ow[1] + delta * x2;
    ad.w[2] = ow[2] + delta * x3;
    ad.b = ob + delta;

    return {
      adalineYangDipilih: secondName,
      zIn: this.fmt(zIn),
      delta: this.fmt(delta),
      alasan: `${secondName} juga di-update karena setelah update pertama masih salah. Z_in=${this.fmt(zIn)}, target=${tAd}`,
      formulaUpdate: [
        `\\Delta w = \\alpha(t - Z_{in}) = ${alpha}(${tAd} - (${this.fmt(zIn)})) = ${this.fmt(delta)}`,
        `${wl[0]}^{baru} = ${this.fmt(ow[0])} + (${this.fmt(delta)})(${x1}) = ${this.fmt(ad.w[0])}`,
        `${wl[1]}^{baru} = ${this.fmt(ow[1])} + (${this.fmt(delta)})(${x2}) = ${this.fmt(ad.w[1])}`,
        `${wl[2]}^{baru} = ${this.fmt(ow[2])} + (${this.fmt(delta)})(${x3}) = ${this.fmt(ad.w[2])}`,
        `${wl[3]}^{baru} = ${this.fmt(ob)} + ${this.fmt(delta)} = ${this.fmt(ad.b)}`
      ]
    };
  }

  trainFull() {
    while (!this.converged && this.currentEpoch < this.maxEpochs) this.trainStep();
    this.finalWeights = this.getCurrentWeights();
    return { history:this.history, epochErrors:this.epochErrors, converged:this.converged, totalEpochs:this.currentEpoch, finalWeights:this.finalWeights };
  }

  getCurrentWeights() { return { adaline1:this._clone(this.adaline1), adaline2:this._clone(this.adaline2) }; }

  predict(inp) {
    const w = this.finalWeights || this.getCurrentWeights();
    const z1 = w.adaline1.b+inp[0]*w.adaline1.w[0]+inp[1]*w.adaline1.w[1]+inp[2]*w.adaline1.w[2];
    const z2 = w.adaline2.b+inp[0]*w.adaline2.w[0]+inp[1]*w.adaline2.w[1]+inp[2]*w.adaline2.w[2];
    return this.andGate(this.sign(z1), this.sign(z2));
  }

  predictWithTrace(inp) {
    const w = this.finalWeights;
    if (!w) return null;
    const [x1,x2,x3] = inp;
    const z1 = w.adaline1.b+x1*w.adaline1.w[0]+x2*w.adaline1.w[1]+x3*w.adaline1.w[2];
    const z2 = w.adaline2.b+x1*w.adaline2.w[0]+x2*w.adaline2.w[1]+x3*w.adaline2.w[2];
    const y1=this.sign(z1), y2=this.sign(z2), yOut=this.andGate(y1,y2);
    return {
      input:[...inp], weightsUsed:w,
      formulas: {
        z1:`Z_{1_{in}} = ${this.fmt(w.adaline1.b)}+(${x1})(${this.fmt(w.adaline1.w[0])})+(${x2})(${this.fmt(w.adaline1.w[1])})+(${x3})(${this.fmt(w.adaline1.w[2])}) = ${this.fmt(z1)}`,
        z2:`Z_{2_{in}} = ${this.fmt(w.adaline2.b)}+(${x1})(${this.fmt(w.adaline2.w[0])})+(${x2})(${this.fmt(w.adaline2.w[1])})+(${x3})(${this.fmt(w.adaline2.w[2])}) = ${this.fmt(z2)}`,
        y1:`Y_1 = sign(${this.fmt(z1)}) = ${y1}`,
        y2:`Y_2 = sign(${this.fmt(z2)}) = ${y2}`,
        mv:`Y_{out} = AND(${y1}, ${y2}) = ${yOut}`
      },
      y1, y2, yOut,
      label: yOut===1?'FLU':'TIDAK FLU'
    };
  }

  getDatasetInfo() {
    const flu = this.targets.filter(t=>t===1).length;
    return { total:this.inputs.length, flu, notFlu:this.inputs.length-flu,
      data: this.inputs.map((inp,i)=>({ no:i+1, demam:inp[0], batuk:inp[1], pilek:inp[2], target:this.targets[i], label:this.targets[i]===1?'Flu':'Tidak Flu' }))
    };
  }
}
