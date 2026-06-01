/**
 * ========================================================
 * App.js — Kontroler Utama Presentasi MADALINE
 * ========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===== SLIDE NAVIGATOR =====
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slide-dot');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const progressFill = document.getElementById('progress-fill');
  const slideIndicator = document.getElementById('slide-indicator');
  let currentSlide = 0;

  function goToSlide(index) {
    if (index < 0 || index >= slides.length) return;
    slides.forEach(s => s.classList.remove('active', 'prev'));
    slides[index].classList.add('active');
    currentSlide = index;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === slides.length - 1;
    progressFill.style.width = ((index + 1) / slides.length * 100) + '%';
    slideIndicator.textContent = `${index + 1} / ${slides.length}`;
  }

  btnPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
  btnNext.addEventListener('click', () => goToSlide(currentSlide + 1));
  dots.forEach(d => d.addEventListener('click', () => goToSlide(+d.dataset.slide)));

  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goToSlide(currentSlide + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goToSlide(currentSlide - 1); }
  });

  // ===== RENDER KATEX FORMULAS =====
  function renderKatex(el, latex, displayMode = true) {
    if (!el || typeof katex === 'undefined') return;
    try {
      katex.render(latex, el, { displayMode, throwOnError: false, trust: true });
    } catch (e) { el.textContent = latex; }
  }

  // Tunggu KaTeX dimuat
  function initFormulas() {
    renderKatex(document.getElementById('formula-net'),
      'Z_{in} = b + \\sum_{i=1}^{n} X_i \\cdot W_i');
    renderKatex(document.getElementById('formula-step'),
      'Y = f(Z_{in}) = \\begin{cases} +1 & \\text{jika } Z_{in} \\geq 0 \\\\ -1 & \\text{jika } Z_{in} < 0 \\end{cases}');
    renderKatex(document.getElementById('formula-update'),
      '\\Delta W_i = \\alpha \\cdot (t - Z_{in}) \\cdot X_i \\quad;\\quad W_i^{(baru)} = W_i^{(lama)} + \\Delta W_i');
    renderKatex(document.getElementById('formula-majority'),
      'Y_{out} = AND(Y_1, Y_2) = \\begin{cases} +1 & \\text{jika } Y_1 = +1 \\text{ DAN } Y_2 = +1 \\\\ -1 & \\text{lainnya} \\end{cases}');
  }

  // Retry sampai KaTeX tersedia
  const katexInterval = setInterval(() => {
    if (typeof katex !== 'undefined') { clearInterval(katexInterval); initFormulas(); }
  }, 100);

  // ===== RENDER ARCHITECTURE SVG =====
  function renderArchSVG() {
    const container = document.getElementById('arch-svg-container');
    if (!container) return;
    container.innerHTML = `
    <svg viewBox="0 0 620 380" class="arch-svg" style="width:100%;height:auto;">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#717786"/>
        </marker>
        <linearGradient id="gNode" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d7e2ff"/><stop offset="100%" stop-color="#abc7ff"/>
        </linearGradient>
        <linearGradient id="gHidden" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e1e0ff"/><stop offset="100%" stop-color="#c0c1ff"/>
        </linearGradient>
        <linearGradient id="gOutput" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d1fae5"/><stop offset="100%" stop-color="#6ee7b7"/>
        </linearGradient>
      </defs>
      <!-- Labels -->
      <text x="70" y="20" text-anchor="middle" fill="#717786" font-size="11" font-weight="700" font-family="Inter">INPUT</text>
      <text x="300" y="20" text-anchor="middle" fill="#717786" font-size="11" font-weight="700" font-family="Inter">HIDDEN LAYER</text>
      <text x="520" y="20" text-anchor="middle" fill="#717786" font-size="11" font-weight="700" font-family="Inter">OUTPUT</text>
      <!-- Connections: Input → Hidden -->
      <line x1="110" y1="70" x2="230" y2="120" stroke="#c1c6d7" stroke-width="1.5" marker-end="url(#arrowhead)"/>
      <line x1="110" y1="70" x2="230" y2="260" stroke="#c1c6d7" stroke-width="1.5" marker-end="url(#arrowhead)"/>
      <line x1="110" y1="190" x2="230" y2="120" stroke="#c1c6d7" stroke-width="1.5" marker-end="url(#arrowhead)"/>
      <line x1="110" y1="190" x2="230" y2="260" stroke="#c1c6d7" stroke-width="1.5" marker-end="url(#arrowhead)"/>
      <line x1="110" y1="310" x2="230" y2="120" stroke="#c1c6d7" stroke-width="1.5" marker-end="url(#arrowhead)"/>
      <line x1="110" y1="310" x2="230" y2="260" stroke="#c1c6d7" stroke-width="1.5" marker-end="url(#arrowhead)"/>
      <!-- Hidden → Output -->
      <line x1="370" y1="120" x2="460" y2="190" stroke="#6063ee" stroke-width="2" marker-end="url(#arrowhead)"/>
      <line x1="370" y1="260" x2="460" y2="190" stroke="#6063ee" stroke-width="2" marker-end="url(#arrowhead)"/>
      <!-- Input Nodes -->
      <circle cx="70" cy="70" r="32" fill="url(#gNode)" stroke="#005ab7" stroke-width="2" class="node-circle"/>
      <text x="70" y="64" text-anchor="middle" fill="#001b3f" font-size="13" font-weight="700" font-family="Inter">X₁</text>
      <text x="70" y="80" text-anchor="middle" fill="#414754" font-size="9" font-family="Inter">Demam</text>
      <circle cx="70" cy="190" r="32" fill="url(#gNode)" stroke="#005ab7" stroke-width="2" class="node-circle"/>
      <text x="70" y="184" text-anchor="middle" fill="#001b3f" font-size="13" font-weight="700" font-family="Inter">X₂</text>
      <text x="70" y="200" text-anchor="middle" fill="#414754" font-size="9" font-family="Inter">Batuk</text>
      <circle cx="70" cy="310" r="32" fill="url(#gNode)" stroke="#005ab7" stroke-width="2" class="node-circle"/>
      <text x="70" y="304" text-anchor="middle" fill="#001b3f" font-size="13" font-weight="700" font-family="Inter">X₃</text>
      <text x="70" y="320" text-anchor="middle" fill="#414754" font-size="9" font-family="Inter">Pilek</text>
      <!-- Hidden Nodes -->
      <circle cx="300" cy="120" r="42" fill="url(#gHidden)" stroke="#4648d4" stroke-width="2" class="node-circle"/>
      <text x="300" y="112" text-anchor="middle" fill="#07006c" font-size="11" font-weight="700" font-family="Inter">ADALINE 1</text>
      <text x="300" y="128" text-anchor="middle" fill="#414754" font-size="9">Z₁ → Y₁</text>
      <circle cx="300" cy="260" r="42" fill="url(#gHidden)" stroke="#4648d4" stroke-width="2" class="node-circle"/>
      <text x="300" y="252" text-anchor="middle" fill="#07006c" font-size="11" font-weight="700" font-family="Inter">ADALINE 2</text>
      <text x="300" y="268" text-anchor="middle" fill="#414754" font-size="9">Z₂ → Y₂</text>
      <!-- Output Node -->
      <circle cx="520" cy="190" r="48" fill="url(#gOutput)" stroke="#059669" stroke-width="2.5" class="node-circle"/>
      <text x="520" y="180" text-anchor="middle" fill="#065f46" font-size="11" font-weight="700" font-family="Inter">MADALINE</text>
      <text x="520" y="196" text-anchor="middle" fill="#065f46" font-size="9">AND Gate</text>
      <text x="520" y="210" text-anchor="middle" fill="#414754" font-size="9">Y_out</text>
      <text x="300" y="360" text-anchor="middle" fill="#717786" font-size="10" font-family="Inter" font-style="italic">Setiap ADALINE memiliki bias (b) dan 3 bobot (w₁, w₂, w₃)</text>
    </svg>`;
  }

  renderArchSVG();

  // ===== SIMULATOR CONTROLLER =====
  let engine = new MadalineEngine({ learningRate: 0.5, maxEpochs: 50 });
  let errorChart = null;

  const btnTrain = document.getElementById('btn-train');
  const btnStep = document.getElementById('btn-step');
  const btnReset = document.getElementById('btn-reset');
  const inpLR = document.getElementById('inp-lr');
  const inpEpochs = document.getElementById('inp-epochs');
  const simStatus = document.getElementById('sim-status');
  const traceBody = document.getElementById('trace-body');
  const traceChip = document.getElementById('trace-chip');
  const logTbody = document.getElementById('log-tbody');
  const logCount = document.getElementById('log-count');
  const weightsDisplay = document.getElementById('sim-weights-display');

  function updateWeightsDisplay() {
    const w = engine.getCurrentWeights();
    weightsDisplay.innerHTML = `
      <div><strong style="color:var(--secondary);">ADALINE 1:</strong></div>
      <div>w₁₁=${w.adaline1.w[0].toFixed(4)}, w₁₂=${w.adaline1.w[1].toFixed(4)}, w₁₃=${w.adaline1.w[2].toFixed(4)}</div>
      <div>b₁=${w.adaline1.b.toFixed(4)}</div>
      <hr style="border:0;border-top:1px solid var(--outline-variant);margin:8px 0;">
      <div><strong style="color:var(--secondary);">ADALINE 2:</strong></div>
      <div>w₂₁=${w.adaline2.w[0].toFixed(4)}, w₂₂=${w.adaline2.w[1].toFixed(4)}, w₂₃=${w.adaline2.w[2].toFixed(4)}</div>
      <div>b₂=${w.adaline2.b.toFixed(4)}</div>`;
  }

  function setStatus(text, type) {
    simStatus.innerHTML = `<span class="chip chip-${type}">${text}</span>`;
  }

  function renderTraceStep(step) {
    if (!step) return;

    // Chip status: jika ada error tapi re-verification berhasil, tampilkan "Dikoreksi"
    let chipClass = 'chip-success';
    let chipText = 'Benar';
    if (step.error.hasError) {
      if (step.reVerification && step.reVerification.isCorrect) {
        chipClass = 'chip-processing';
        chipText = 'Dikoreksi ✓';
      } else {
        chipClass = 'chip-error';
        chipText = 'Error';
      }
    }
    traceChip.className = `chip ${chipClass}`;
    traceChip.textContent = chipText;

    let html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div class="trace-value"><span class="trace-value-label">Epoch / Langkah</span>
          <span class="trace-value-data">${step.epoch} / ${step.stepInEpoch}</span></div>
        <div class="trace-value"><span class="trace-value-label">Input (X₁, X₂, X₃)</span>
          <span class="trace-value-data">[${step.input.join(', ')}]</span></div>
        <div class="trace-value"><span class="trace-value-label">Target (T)</span>
          <span class="trace-value-data">${step.target}</span></div>
        <div class="trace-value"><span class="trace-value-label">Output (Y_out)</span>
          <span class="trace-value-data" style="color:${step.error.hasError ? 'var(--error)' : 'var(--success)'}">${step.andGate.result}</span></div>
      </div>`;

    // Net Input formulas
    html += `<div class="trace-formula-block"><div class="formula-label">Perhitungan Net Input ADALINE 1</div>
      <div id="trace-z1-${step.totalStep}" class="formula-highlight"></div></div>`;
    html += `<div class="trace-formula-block"><div class="formula-label">Perhitungan Net Input ADALINE 2</div>
      <div id="trace-z2-${step.totalStep}" class="formula-highlight"></div></div>`;

    // Activation
    html += `<div class="trace-formula-block"><div class="formula-label">Output Aktivasi</div>
      <div id="trace-y1-${step.totalStep}"></div>
      <div id="trace-y2-${step.totalStep}" style="margin-top:4px;"></div></div>`;

    // AND Gate
    html += `<div class="trace-formula-block"><div class="formula-label">AND Gate Output</div>
      <div id="trace-mv-${step.totalStep}"></div></div>`;

    // Error status
    html += `<div style="padding:12px;border-radius:8px;margin:12px 0;background:${step.error.hasError ? 'var(--error-container)' : '#d1fae5'};color:${step.error.hasError ? 'var(--on-error-container)' : '#065f46'};font-size:13px;font-weight:600;">
      ${step.error.keterangan}</div>`;

    // Koreksi MR-I
    if (step.koreksiMRI) {
      html += `<div class="trace-formula-block" style="border-color:var(--secondary);">
        <div class="formula-label" style="color:var(--secondary);">Koreksi MR-I — ${step.koreksiMRI.adalineYangDipilih}</div>
        <p style="font-size:12px;color:var(--on-surface-variant);margin-bottom:8px;">${step.koreksiMRI.alasan}</p>`;
      step.koreksiMRI.formulaUpdate.forEach((f, i) => {
        html += `<div id="trace-upd-${step.totalStep}-${i}" style="margin:4px 0;"></div>`;
      });
      html += `</div>`;

      // Re-verification setelah update
      if (step.reVerification) {
        const rv = step.reVerification;
        html += `<div class="trace-formula-block" style="border-color:${rv.isCorrect ? 'var(--success)' : 'var(--error)'};">
          <div class="formula-label" style="color:${rv.isCorrect ? 'var(--success-dark)' : 'var(--error)'};">🔄 Re-Verifikasi Setelah Update Bobot</div>
          <div id="trace-rv-z1-${step.totalStep}" style="margin:4px 0;"></div>
          <div id="trace-rv-z2-${step.totalStep}" style="margin:4px 0;"></div>
          <div id="trace-rv-y1-${step.totalStep}" style="margin:4px 0;"></div>
          <div id="trace-rv-y2-${step.totalStep}" style="margin:4px 0;"></div>
          <div id="trace-rv-mv-${step.totalStep}" style="margin:4px 0;"></div>
          <div style="padding:8px 12px;border-radius:6px;margin-top:8px;background:${rv.isCorrect ? '#d1fae5' : '#fee2e2'};color:${rv.isCorrect ? '#065f46' : '#991b1b'};font-size:12px;font-weight:600;">
            ${rv.keterangan}</div>
        </div>`;
      }

      // Second attempt jika ada
      if (step.koreksiMRI.secondAttempt) {
        const sa = step.koreksiMRI.secondAttempt;
        html += `<div class="trace-formula-block" style="border-color:#f59e0b;">
          <div class="formula-label" style="color:#d97706;">⚡ Update Kedua — ${sa.adalineYangDipilih}</div>
          <p style="font-size:12px;color:var(--on-surface-variant);margin-bottom:8px;">${sa.alasan}</p>`;
        sa.formulaUpdate.forEach((f, i) => {
          html += `<div id="trace-upd2-${step.totalStep}-${i}" style="margin:4px 0;"></div>`;
        });
        html += `</div>`;
      }
    }

    traceBody.innerHTML = html;

    // Render KaTeX for this step (after DOM update)
    requestAnimationFrame(() => {
      const renderIfExists = (id, latex) => {
        const el = document.getElementById(id);
        if (el && typeof katex !== 'undefined') {
          try { katex.render(latex, el, { displayMode: false, throwOnError: false }); }
          catch(e) { el.textContent = latex; }
        }
      };

      renderIfExists(`trace-z1-${step.totalStep}`, step.netInputs.adaline1.formula);
      renderIfExists(`trace-z2-${step.totalStep}`, step.netInputs.adaline2.formula);
      renderIfExists(`trace-y1-${step.totalStep}`, step.outputs.adaline1.formula);
      renderIfExists(`trace-y2-${step.totalStep}`, step.outputs.adaline2.formula);
      renderIfExists(`trace-mv-${step.totalStep}`, step.andGate.formula);

      if (step.koreksiMRI) {
        step.koreksiMRI.formulaUpdate.forEach((f, i) => {
          renderIfExists(`trace-upd-${step.totalStep}-${i}`, f);
        });
        // Render re-verification KaTeX
        if (step.reVerification) {
          renderIfExists(`trace-rv-z1-${step.totalStep}`, step.reVerification.formula.z1);
          renderIfExists(`trace-rv-z2-${step.totalStep}`, step.reVerification.formula.z2);
          renderIfExists(`trace-rv-y1-${step.totalStep}`, step.reVerification.formula.y1);
          renderIfExists(`trace-rv-y2-${step.totalStep}`, step.reVerification.formula.y2);
          renderIfExists(`trace-rv-mv-${step.totalStep}`, step.reVerification.formula.mv);
        }
        // Render second attempt KaTeX
        if (step.koreksiMRI.secondAttempt) {
          step.koreksiMRI.secondAttempt.formulaUpdate.forEach((f, i) => {
            renderIfExists(`trace-upd2-${step.totalStep}-${i}`, f);
          });
        }
      }
    });
  }

  function addLogRow(step) {
    const tr = document.createElement('tr');
    const statusClass = step.error.hasError ? 'text-error' : 'text-success';
    const statusText = step.error.hasError ? '✗ Error' : '✓ Benar';
    const koreksi = step.koreksiMRI ? step.koreksiMRI.adalineYangDipilih : '—';

    tr.innerHTML = `
      <td class="text-muted">${step.epoch}</td>
      <td class="text-muted">#${step.dataNo}</td>
      <td>[${step.input.join(', ')}]</td>
      <td class="text-center">${step.target}</td>
      <td class="text-right">${step.netInputs.adaline1.zIn}</td>
      <td class="text-right">${step.netInputs.adaline2.zIn}</td>
      <td class="text-center">${step.outputs.adaline1.y}</td>
      <td class="text-center">${step.outputs.adaline2.y}</td>
      <td class="text-center">${step.andGate.result}</td>
      <td class="text-center ${statusClass}" style="font-weight:600;font-size:11px;">${statusText}</td>
      <td style="font-size:11px;">${koreksi}</td>`;
    logTbody.appendChild(tr);
    logCount.textContent = `${engine.history.length} langkah`;

    // Auto scroll
    const container = document.getElementById('log-table-container');
    container.scrollTop = container.scrollHeight;
  }

  function updateResultsSlide() {
    renderErrorChart();
  }

  function renderErrorChart() {
    if (engine.epochErrors.length === 0) return;
    document.getElementById('chart-placeholder').style.display = 'none';

    const ctx = document.getElementById('error-chart');
    if (errorChart) errorChart.destroy();

    if (typeof Chart === 'undefined') return;

    errorChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: engine.epochErrors.map(e => `Epoch ${e.epoch}`),
        datasets: [{
          label: 'Jumlah Error',
          data: engine.epochErrors.map(e => e.errorCount),
          borderColor: '#005ab7',
          backgroundColor: 'rgba(0,90,183,0.08)',
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointBackgroundColor: '#005ab7',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#283044',
            titleFont: { family: 'Inter', weight: '600' },
            bodyFont: { family: 'JetBrains Mono' }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(193,198,215,0.3)' },
            ticks: { font: { family: 'Inter', size: 11 } }
          },
          y: {
            beginAtZero: true,
            max: 4,
            ticks: { stepSize: 1, font: { family: 'JetBrains Mono', size: 11 } },
            grid: { color: 'rgba(193,198,215,0.3)' },
            title: { display: true, text: 'Jumlah Error', font: { family: 'Inter', size: 12 } }
          }
        }
      }
    });
  }

  // === Event Handlers ===
  btnStep.addEventListener('click', () => {
    engine.learningRate = parseFloat(inpLR.value) || 0.5;
    engine.maxEpochs = parseInt(inpEpochs.value) || 50;
    engine.isTraining = true;
    setStatus('Training...', 'processing');

    const step = engine.trainStep();
    if (step) {
      renderTraceStep(step);
      addLogRow(step);
      updateWeightsDisplay();
      updateResultsSlide();
    }

    if (engine.converged) {
      setStatus('Konvergen ✓', 'success');
    }
  });

  btnTrain.addEventListener('click', () => {
    if (engine.isTraining && !engine.converged) {
      // Lanjutkan training sampai selesai
    } else {
      engine.reset({
        learningRate: parseFloat(inpLR.value) || 0.5,
        maxEpochs: parseInt(inpEpochs.value) || 50
      });
      logTbody.innerHTML = '';
    }

    setStatus('Training...', 'processing');

    const result = engine.trainFull();
    result.history.forEach(step => addLogRow(step));

    if (result.history.length > 0) {
      renderTraceStep(result.history[result.history.length - 1]);
    }

    updateWeightsDisplay();
    updateResultsSlide();

    if (engine.converged) {
      setStatus(`Konvergen! (${engine.currentEpoch} epoch)`, 'success');
    } else {
      setStatus(`Tidak konvergen setelah ${engine.currentEpoch} epoch`, 'error');
    }
  });

  btnReset.addEventListener('click', () => {
    engine.reset({
      learningRate: parseFloat(inpLR.value) || 0.5,
      maxEpochs: parseInt(inpEpochs.value) || 50
    });
    logTbody.innerHTML = '';
    logCount.textContent = '0 langkah';
    traceBody.innerHTML = '<p class="font-body-md" style="color:var(--on-surface-variant);text-align:center;padding:32px 0;">Klik <strong>"Mulai Training"</strong> atau <strong>"Langkah Selanjutnya"</strong> untuk memulai simulasi.</p>';
    traceChip.className = 'chip chip-idle';
    traceChip.textContent = 'Belum dimulai';
    setStatus('Menunggu', 'idle');
    updateWeightsDisplay();
    const cp = document.getElementById('chart-placeholder');
    if (cp) cp.style.display = '';
    if (errorChart) { errorChart.destroy(); errorChart = null; }
  });

  // ===== RENDER DATASET TABLE (Slide 4) =====
  function renderDataset() {
    const tbody = document.getElementById('dataset-tbody');
    if (!tbody) return;
    const info = engine.getDatasetInfo();
    let html = '';
    info.data.forEach(d => {
      const cls = d.target === 1 ? 'badge-flu' : 'badge-notflu';
      html += `<tr>
        <td class="text-muted">${d.no}</td>
        <td class="text-center">${d.demam}</td>
        <td class="text-center">${d.batuk}</td>
        <td class="text-center">${d.pilek}</td>
        <td class="text-center"><span class="badge ${cls}">${d.label}</span></td>
      </tr>`;
    });
    tbody.innerHTML = html;
    const sf = document.getElementById('stat-flu');
    const sn = document.getElementById('stat-notflu');
    if (sf) sf.textContent = info.flu;
    if (sn) sn.textContent = info.notFlu;
  }
  renderDataset();

  // ===== RENDER EXAMPLE CALCULATIONS (Slide 5) =====
  function renderExampleCalculations() {
    const container = document.getElementById('example-calculations');
    if (!container) return;
    const w = engine.initialWeights;
    const examples = [
      { idx: 0, type: 'flu' },
      { idx: 7, type: 'notflu' }
    ];
    let html = '';
    examples.forEach(ex => {
      const inp = engine.inputs[ex.idx];
      const tgt = engine.targets[ex.idx];
      const [x1,x2,x3] = inp;
      const z1 = w.adaline1.b + x1*w.adaline1.w[0] + x2*w.adaline1.w[1] + x3*w.adaline1.w[2];
      const z2 = w.adaline2.b + x1*w.adaline2.w[0] + x2*w.adaline2.w[1] + x3*w.adaline2.w[2];
      const y1 = z1 >= 0 ? 1 : -1;
      const y2 = z2 >= 0 ? 1 : -1;
      const yOut = (y1 === 1 && y2 === 1) ? 1 : -1;
      const fmt = n => Number(n.toFixed(4));
      const label = tgt === 1 ? 'Flu' : 'Tidak Flu';
      html += `<div class="card example-card ${ex.type}">
        <div class="example-header">
          <div><strong>Data #${ex.idx+1}</strong> — Input: [${inp.join(', ')}]</div>
          <span class="example-badge ${ex.type}">${label}</span>
        </div>
        <div class="example-step">
          <div class="example-step-label">Net Input ADALINE 1</div>
          <div id="ex-z1-${ex.idx}" class="formula-highlight"></div>
        </div>
        <div class="example-step">
          <div class="example-step-label">Net Input ADALINE 2</div>
          <div id="ex-z2-${ex.idx}" class="formula-highlight"></div>
        </div>
        <div class="example-step">
          <div class="example-step-label">Aktivasi</div>
          <div id="ex-y1-${ex.idx}"></div>
          <div id="ex-y2-${ex.idx}" style="margin-top:4px;"></div>
        </div>
        <div class="example-step">
          <div class="example-step-label">AND Gate</div>
          <div id="ex-mv-${ex.idx}"></div>
        </div>
        <div style="padding:12px 20px;background:${ex.type==='flu'?'#fee2e2':'#d1fae5'};font-size:13px;font-weight:600;color:${ex.type==='flu'?'#991b1b':'#065f46'};">
          Hasil: Y_out = ${yOut} → ${yOut===1?'Flu':'Tidak Flu'} ${yOut===tgt?'(BENAR ✓)':'(SALAH ✗)'}
        </div>
      </div>`;
      // Render KaTeX after DOM update
      requestAnimationFrame(() => {
        const rk = (id, latex) => {
          const el = document.getElementById(id);
          if (el && typeof katex !== 'undefined') {
            try { katex.render(latex, el, { displayMode: false, throwOnError: false }); }
            catch(e) { el.textContent = latex; }
          }
        };
        rk(`ex-z1-${ex.idx}`, `Z_{1_{in}} = ${fmt(w.adaline1.b)}+(${x1})(${fmt(w.adaline1.w[0])})+(${x2})(${fmt(w.adaline1.w[1])})+(${x3})(${fmt(w.adaline1.w[2])}) = ${fmt(z1)}`);
        rk(`ex-z2-${ex.idx}`, `Z_{2_{in}} = ${fmt(w.adaline2.b)}+(${x1})(${fmt(w.adaline2.w[0])})+(${x2})(${fmt(w.adaline2.w[1])})+(${x3})(${fmt(w.adaline2.w[2])}) = ${fmt(z2)}`);
        rk(`ex-y1-${ex.idx}`, `Y_1 = sign(${fmt(z1)}) = ${y1}`);
        rk(`ex-y2-${ex.idx}`, `Y_2 = sign(${fmt(z2)}) = ${y2}`);
        rk(`ex-mv-${ex.idx}`, `Y_{out} = AND(${y1}, ${y2}) = ${yOut}`);
      });
    });
    container.innerHTML = html;
  }
  const exInterval = setInterval(() => {
    if (typeof katex !== 'undefined') { clearInterval(exInterval); renderExampleCalculations(); }
  }, 150);

  // ===== PREDICTION HANDLER (Slide 7) =====
  const btnPredict = document.getElementById('btn-predict');
  if (btnPredict) {
    btnPredict.addEventListener('click', () => {
      if (!engine.finalWeights && !engine.converged) {
        const warn = document.getElementById('predict-warning');
        if (warn) { warn.style.display = ''; setTimeout(() => warn.style.display = 'none', 3000); }
        return;
      }
      if (!engine.finalWeights) engine.finalWeights = engine.getCurrentWeights();
      const d = document.getElementById('input-demam').checked ? 1 : -1;
      const b = document.getElementById('input-batuk').checked ? 1 : -1;
      const p = document.getElementById('input-pilek').checked ? 1 : -1;
      const trace = engine.predictWithTrace([d, b, p]);
      if (!trace) return;

      // Show final weights
      const fwd = document.getElementById('final-weights-display');
      if (fwd) {
        const fw = trace.weightsUsed;
        fwd.innerHTML = `<div><strong>ADALINE 1:</strong></div>
          <div>w₁₁=${fw.adaline1.w[0].toFixed(4)}, w₁₂=${fw.adaline1.w[1].toFixed(4)}, w₁₃=${fw.adaline1.w[2].toFixed(4)}</div>
          <div>b₁=${fw.adaline1.b.toFixed(4)}</div>
          <hr style="border:0;border-top:1px solid var(--outline-variant);margin:8px 0;">
          <div><strong>ADALINE 2:</strong></div>
          <div>w₂₁=${fw.adaline2.w[0].toFixed(4)}, w₂₂=${fw.adaline2.w[1].toFixed(4)}, w₂₃=${fw.adaline2.w[2].toFixed(4)}</div>
          <div>b₂=${fw.adaline2.b.toFixed(4)}</div>`;
      }

      // Show prediction result
      const pr = document.getElementById('prediction-result');
      const isFlu = trace.yOut === 1;
      pr.innerHTML = `<div class="prediction-result-display">
        <div class="result-icon">${isFlu ? '🤒' : '✅'}</div>
        <div class="result-label" style="color:${isFlu ? '#dc2626' : '#059669'};">${trace.label}</div>
        <div class="result-desc">Input: Demam=${d}, Batuk=${b}, Pilek=${p}</div>
      </div>`;

      // Show feedforward trace
      const ttb = document.getElementById('test-trace-body');
      ttb.innerHTML = `
        <div class="trace-formula-block"><div class="formula-label">Net Input ADALINE 1</div><div id="test-z1" class="formula-highlight"></div></div>
        <div class="trace-formula-block"><div class="formula-label">Net Input ADALINE 2</div><div id="test-z2" class="formula-highlight"></div></div>
        <div class="trace-formula-block"><div class="formula-label">Aktivasi</div><div id="test-y1"></div><div id="test-y2" style="margin-top:4px;"></div></div>
        <div class="trace-formula-block"><div class="formula-label">Majority Vote</div><div id="test-mv"></div></div>
        <div style="padding:12px;border-radius:8px;background:${isFlu?'#fee2e2':'#d1fae5'};color:${isFlu?'#991b1b':'#065f46'};font-size:14px;font-weight:700;text-align:center;">
          Hasil Prediksi: ${trace.label}
        </div>`;
      requestAnimationFrame(() => {
        const rk = (id, latex) => { const el = document.getElementById(id); if (el && typeof katex !== 'undefined') { try { katex.render(latex, el, { displayMode: false, throwOnError: false }); } catch(e) { el.textContent = latex; } } };
        rk('test-z1', trace.formulas.z1);
        rk('test-z2', trace.formulas.z2);
        rk('test-y1', trace.formulas.y1);
        rk('test-y2', trace.formulas.y2);
        rk('test-mv', trace.formulas.mv);
      });
    });
  }

  // ===== Q&A FIREBASE CLOUD SYNC (Slide 8) =====
  // Menggunakan Firebase Realtime Database — sinkron otomatis di semua perangkat
  // Audiens TIDAK perlu setup apapun, cukup buka web dan bertanya

  const FIREBASE_DB_URL = 'https://madaline-qa-default-rtdb.asia-southeast1.firebasedatabase.app';
  // === Gemini API Key: Firebase-first, fallback localStorage ===
  let _cachedGeminiKey = localStorage.getItem('madaline_gemini_key') || '';

  async function fetchGeminiKeyFromFirebase() {
    try {
      var resp = await fetch(FIREBASE_DB_URL + '/config/gemini_key.json');
      if (resp.ok) {
        var key = await resp.json();
        if (key && typeof key === 'string') {
          _cachedGeminiKey = key;
          localStorage.setItem('madaline_gemini_key', key);
          return key;
        }
      }
    } catch(e) { console.warn('Firebase key load error:', e); }
    return _cachedGeminiKey;
  }

  function getGeminiKey() { return _cachedGeminiKey; }

  // Pre-fetch key dari Firebase saat halaman dimuat
  fetchGeminiKeyFromFirebase();
  // === Firebase Cloud Sync ===
  async function loadQAFromFirebase() {
    try {
      var resp = await fetch(FIREBASE_DB_URL + '/questions.json');
      if (!resp.ok) { console.warn('Firebase load failed:', resp.status); return []; }
      var data = await resp.json();
      if (!data) return [];
      // Firebase menyimpan sebagai object, convert ke array
      if (Array.isArray(data)) return data.filter(Boolean);
      return Object.values(data);
    } catch (e) { console.warn('Firebase load error:', e); return []; }
  }

  async function saveQAToFirebase(qaData) {
    try {
      var resp = await fetch(FIREBASE_DB_URL + '/questions.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qaData)
      });
      return resp.ok;
    } catch (e) { console.warn('Firebase save error:', e); return false; }
  }

  // Model fallback chain — kalau satu kena rate limit, coba yang lain
  const GEMINI_MODELS = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash'
  ];
  const MAX_QUESTIONS = 5;
  const btnAsk = document.getElementById('btn-ask');
  let qaHistory = [];

  function mdToHtml(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gm, '<h4 style="color:var(--primary);margin:12px 0 6px;">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 style="color:var(--primary);margin:16px 0 8px;">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 style="color:var(--primary);margin:20px 0 10px;">$1</h2>')
      .replace(/^\d+\.\s+(.*$)/gm, '<div style="padding-left:20px;margin:4px 0;">• $1</div>')
      .replace(/^[-*]\s+(.*$)/gm, '<div style="padding-left:20px;margin:4px 0;">• $1</div>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--surface-container);padding:2px 6px;border-radius:4px;font-family:JetBrains Mono,monospace;font-size:13px;">$1</code>')
      .replace(/\n\n/g, '</p><p style="margin-bottom:10px;">')
      .replace(/\n/g, '<br>');
  }

  function delay(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

  async function askGemini(question, systemPrompt) {
    var apiKey = getGeminiKey();
    if (!apiKey) throw new Error('API Key belum diatur. Presenter harus mengatur key di halaman Jawaban.');

    // Coba 2 ronde — ronde kedua dengan delay 3 detik (menunggu rate limit reset)
    for (var round = 0; round < 2; round++) {
      if (round > 0) {
        console.log('Retry round ' + (round+1) + ' setelah delay...');
        await delay(3000);
      }
      for (const model of GEMINI_MODELS) {
        try {
          const resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: [{ parts: [{ text: question }] }]
            })
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              return { answer: data.candidates[0].content.parts[0].text, model: model };
            }
          }
          if (resp.status === 429) {
            console.warn('Model ' + model + ' rate limited, trying next...');
            continue;
          }
          if (!resp.ok) {
            const errData = await resp.json().catch(function() { return {}; });
            console.warn('Gemini model ' + model + ' error:', errData);
            continue;
          }
        } catch (e) {
          console.warn('Gemini model ' + model + ' failed:', e.message);
        }
      }
    }
    throw new Error('Rate limit tercapai. Tunggu 1 menit lalu coba lagi.');
  }

  function updateQuestionSlots() {
    var answerDiv = document.getElementById('qa-answer');
    var counterEl = document.getElementById('qa-counter');
    var slotChip = document.getElementById('qa-slot-chip');
    var remaining = MAX_QUESTIONS - qaHistory.length;

    // Update counter
    if (counterEl) counterEl.textContent = qaHistory.length + ' / ' + MAX_QUESTIONS;

    // Update slot chip
    if (slotChip) {
      slotChip.textContent = 'Slot: ' + remaining + '/' + MAX_QUESTIONS;
      if (remaining <= 0) {
        slotChip.className = 'chip chip-error';
      } else if (remaining === 1) {
        slotChip.className = 'chip chip-processing';
      } else {
        slotChip.className = 'chip chip-success';
      }
    }

    if (qaHistory.length === 0) {
      answerDiv.innerHTML = '<div class="qa-placeholder"><div style="font-size:64px;margin-bottom:16px;">💬</div><h3 style="margin-bottom:8px;color:var(--on-surface);">Sesi Tanya Jawab Interaktif</h3><p style="color:var(--on-surface-variant);max-width:400px;margin:0 auto;">Ajukan pertanyaan seputar algoritma MADALINE. Slot tersedia: <strong>' + remaining + ' pertanyaan</strong>. Jawaban akan disampaikan oleh presenter.</p></div>';
      return;
    }

    var html = '<div style="margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid var(--outline-variant);display:flex;justify-content:space-between;align-items:center;"><div style="font-size:12px;font-weight:700;color:var(--secondary);text-transform:uppercase;letter-spacing:0.06em;">Daftar Pertanyaan (' + qaHistory.length + '/' + MAX_QUESTIONS + ')</div></div>';

    qaHistory.forEach(function(h, i) {
      html += '<div style="padding:16px 18px;background:var(--surface-container-low);border:1px solid var(--outline-variant);border-radius:10px;margin-bottom:12px;">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
        + '<span style="font-weight:700;font-size:13px;color:var(--primary);">' + (i+1) + '. ' + h.nama + ' (' + h.nim + ')</span>'
        + '<span style="font-size:11px;color:var(--on-surface-variant);">' + h.kelas + ' • ' + h.time + '</span>'
        + '</div>'
        + '<div style="font-size:14px;font-weight:500;line-height:1.5;">❓ ' + h.question + '</div>'
        + '<div style="font-size:12px;color:var(--success-dark);margin-top:8px;font-weight:600;display:flex;align-items:center;gap:6px;">✅ Pertanyaan diterima</div>'
        + '</div>';
    });

    if (remaining > 0) {
      html += '<div style="text-align:center;padding:16px;color:var(--on-surface-variant);font-size:13px;">Sisa slot: <strong>' + remaining + '</strong> pertanyaan lagi</div>';
    } else {
      html += '<div style="text-align:center;padding:16px;background:#fef3cd;border-radius:8px;color:#92400e;font-size:13px;font-weight:600;">🔒 Slot pertanyaan sudah penuh (' + MAX_QUESTIONS + '/' + MAX_QUESTIONS + ')</div>';
    }
    answerDiv.innerHTML = html;
  }

  // === Inisialisasi: muat data dari Firebase ===
  async function initQAData() {
    var cloudData = await loadQAFromFirebase();
    if (cloudData && cloudData.length > 0) {
      qaHistory.length = 0;
      cloudData.forEach(function(q) { qaHistory.push(q); });
    }
    updateQuestionSlots();

    // Update button state
    if (btnAsk && qaHistory.length >= MAX_QUESTIONS) {
      btnAsk.disabled = true;
      btnAsk.textContent = '🔒 Slot Penuh';
    }
  }

  // Jalankan inisialisasi
  initQAData();

  // === Auto-refresh: poll Firebase setiap 5 detik agar pertanyaan baru muncul real-time ===
  setInterval(async function() {
    try {
      var cloudData = await loadQAFromFirebase();
      if (cloudData && cloudData.length !== qaHistory.length) {
        qaHistory.length = 0;
        cloudData.forEach(function(q) { qaHistory.push(q); });
        updateQuestionSlots();
        if (btnAsk && qaHistory.length >= MAX_QUESTIONS) {
          btnAsk.disabled = true;
          btnAsk.textContent = '🔒 Slot Penuh';
        }
      }
    } catch(e) {}
  }, 5000);

  if (btnAsk) {
    btnAsk.addEventListener('click', async function() {
      if (qaHistory.length >= MAX_QUESTIONS) {
        alert('Slot pertanyaan sudah penuh! Maksimal ' + MAX_QUESTIONS + ' pertanyaan.');
        return;
      }
      var qEl = document.getElementById('qa-question');
      var nimEl = document.getElementById('qa-nim');
      var namaEl = document.getElementById('qa-nama');
      var kelasEl = document.getElementById('qa-kelas');
      var question = qEl ? qEl.value.trim() : '';
      var nim = nimEl ? nimEl.value.trim() : '';
      var nama = namaEl ? namaEl.value.trim() : '';
      var kelas = kelasEl ? kelasEl.value.trim() : '';
      if (!question) { alert('Masukkan pertanyaan!'); return; }
      if (!nim || !nama || !kelas) { alert('Lengkapi NIM, Nama, dan Kelas!'); return; }

      var loading = document.getElementById('qa-loading');
      loading.style.display = 'flex';
      btnAsk.disabled = true;

      // Selalu catat pertanyaan, terlepas dari berhasil/gagal AI
      var answerHtml = '';
      var aiSuccess = false;

      try {
        var systemPrompt = 'Kamu adalah asisten AI ahli algoritma MADALINE (Many Adaptive Linear Element). ATURAN WAJIB: Jawab MAKSIMAL 2-3 kalimat saja. Langsung ke inti jawaban, tanpa basa-basi, tanpa pendahuluan, tanpa pengulangan pertanyaan. Gunakan Bahasa Indonesia. Fokus: ADALINE, MADALINE, fungsi aktivasi bipolar, MR-I learning rule, deteksi flu. Jangan sebut Gemini/Google. Singkat tapi akurat.';
        var fullQuestion = 'Pertanyaan dari mahasiswa ' + nama + ' (NIM: ' + nim + ', Kelas: ' + kelas + '):\n\n' + question;
        var result = await askGemini(fullQuestion, systemPrompt);
        answerHtml = mdToHtml(result.answer);
        aiSuccess = true;
      } catch (err) {
        console.error('Gemini API Error (hidden from audience):', err);
        answerHtml = '<div style="padding:16px;background:#fef3cd;border-radius:8px;color:#92400e;font-size:14px;"><strong>⚠️ AI tidak dapat memproses jawaban</strong><br>Error: ' + err.message + '<br><br>Presenter harus menjawab pertanyaan ini secara manual.</div>';
        aiSuccess = false;
      }

      // Simpan pertanyaan + jawaban ke history
      qaHistory.push({
        nim: nim, nama: nama, kelas: kelas,
        question: question, answer: answerHtml,
        aiSuccess: aiSuccess,
        time: new Date().toLocaleTimeString('id-ID')
      });

      // Simpan ke Firebase (cloud) — async, tidak blocking
      saveQAToFirebase(qaHistory).then(function(ok) {
        if (ok) console.log('Q&A synced to Firebase');
        else console.warn('Firebase sync failed');
      });

      // Update tampilan slide 8 — hanya pertanyaan, TANPA jawaban, TANPA error
      updateQuestionSlots();

      loading.style.display = 'none';
      qEl.value = '';

      if (qaHistory.length >= MAX_QUESTIONS) {
        btnAsk.disabled = true;
        btnAsk.textContent = '🔒 Slot Penuh';
      } else {
        btnAsk.disabled = false;
      }
    });
  }



  // ===== HERO START BUTTON =====
  const heroBtn = document.getElementById('hero-start-btn');
  if (heroBtn) heroBtn.addEventListener('click', () => goToSlide(1));

});
