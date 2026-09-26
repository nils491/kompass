/**
 * js/pair_analysis.js
 * Modul für die Paar-Analyse & Synergie-Auswertung.
 * 
 * Berechnet:
 * - Paar-Harmonie und Schnittmengen aus allen 35 Kapiteln
 * - Deduplizierte Doppel-5er (Höchstlust beider Partner)
 * - Brückenbau-Chancen (Wunsch trifft Note 2/3)
 * - Komplementäre Top/Bottom-Passung (>= 4)
 * - Tabu-Schranken mit präziser Namensnennung
 * - Radar-Chart (Chart.js) und Motivations-Säulen
 * - Konsensabgleich des Sicherheits-Kodex
 * - Tiefenpsychologisches KI-Paargutachten über Google Gemini
 */

(function(window) {
  'use strict';

  var names = { A: 'Partner 1', B: 'Partner 2' };
  var anatomy = { A: 'penis', B: 'vulva' };
  var answers = { A: {}, B: {} };
  var safetyConfig = { A: {}, B: {} };
  var sessionDiary = [];
  var pairRadarChartInstance = null;
  var activeDetailFilter = 'doppel5';
  var cachedAnalysisMetrics = null;

  function loadAnalysisData() {
    try {
      var nm = localStorage.getItem('kompass_names');
      var an = localStorage.getItem('kompass_anatomy');
      var ans = localStorage.getItem('kompass_answers');
      var sc = localStorage.getItem('kompass_safety_config');
      var dia = localStorage.getItem('kompass_session_diary');

      if (nm && nm !== 'null') names = JSON.parse(nm);
      if (an && an !== 'null') anatomy = JSON.parse(an);
      if (ans && ans !== 'null') answers = JSON.parse(ans);
      if (sc && sc !== 'null') safetyConfig = JSON.parse(sc);
      if (dia && dia !== 'null') sessionDiary = JSON.parse(dia);
    } catch (e) {
      console.error("Analysis data load error:", e);
    }

    if (!names || typeof names !== 'object') names = { A: 'Partner 1', B: 'Partner 2' };
    if (!answers || typeof answers !== 'object') answers = { A: {}, B: {} };
    if (!answers.A) answers.A = {};
    if (!answers.B) answers.B = {};

    var pNames = document.getElementById('header-pair-names');
    if (pNames) pNames.innerText = (names.A || 'Partner 1') + ' & ' + (names.B || 'Partner 2');
    var heroTitle = document.getElementById('hero-pair-title');
    if (heroTitle) heroTitle.innerText = 'Synergie-Auswertung für ' + (names.A || 'Partner 1') + ' & ' + (names.B || 'Partner 2');
  }

  function unlockAnalysisGate() {
    var input = document.getElementById('gate-password-input');
    var val = (input ? input.value : '').trim();

    if (val === 'Bommelchen!' || val.toLowerCase() === 'bommelchen') {
      try {
        sessionStorage.setItem('kompass_gate_unlocked', 'true');
      } catch (e) {}

      var gate = document.getElementById('password-gate');
      var content = document.getElementById('analysis-content');
      if (gate) gate.classList.add('hidden');
      if (content) content.classList.remove('hidden');

      computePairMetrics();
      showToast("✓ Paar-Analyse erfolgreich freigeschaltet!");
    } else {
      showToast("⚠️ Ungültiges Passwort. Bitte versucht es erneut.");
    }
  }

  function computePairMetrics() {
    loadAnalysisData();
    var allChapters = window.surveyChapters || [];
    var ansA = answers.A || {};
    var ansB = answers.B || {};

    var totalEvaluated = 0;
    var totalHarmonicPoints = 0;

    var doppel5List = [];
    var bridgesList = [];
    var compList = [];
    var tabuList = [];

    var seenDoppel5 = new Set();
    var seenBridges = new Set();
    var seenComp = new Set();
    var seenTabus = new Set();

    var pillarsA = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };
    var pillarsB = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };
    var maxPillars = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };

    allChapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type === 'choice') return;

        var aR1 = ansA['it_' + it.id + '_r1'];
        var aR2 = ansA['it_' + it.id + '_r2'];
        var bR1 = ansB['it_' + it.id + '_r1'];
        var bR2 = ansB['it_' + it.id + '_r2'];

        function addPillarPoints(cId, val, target) {
          if (typeof val === 'number' && val > 0) {
            if ([21, 22, 23, 29].indexOf(cId) !== -1) target.power += val;
            else if ([13, 14, 16, 17, 31].indexOf(cId) !== -1) target.sensation += val;
            else if ([19, 30].indexOf(cId) !== -1) target.nurturing += val;
            else if ([18, 20, 24, 25].indexOf(cId) !== -1) target.thrill += val;
            else if ([9, 10, 11].indexOf(cId) !== -1) target.visual += val;
          }
        }

        function addPillarMax(cId) {
          if ([21, 22, 23, 29].indexOf(cId) !== -1) maxPillars.power += 10;
          else if ([13, 14, 16, 17, 31].indexOf(cId) !== -1) maxPillars.sensation += 10;
          else if ([19, 30].indexOf(cId) !== -1) maxPillars.nurturing += 10;
          else if ([18, 20, 24, 25].indexOf(cId) !== -1) maxPillars.thrill += 10;
          else if ([9, 10, 11].indexOf(cId) !== -1) maxPillars.visual += 10;
        }

        addPillarPoints(ch.id, aR1, pillarsA);
        addPillarPoints(ch.id, aR2, pillarsA);
        addPillarPoints(ch.id, bR1, pillarsB);
        addPillarPoints(ch.id, bR2, pillarsB);
        addPillarMax(ch.id);

        // 1. Doppel-5er (Dedupliziert)
        var isD5 = (aR1 === 5 && bR2 === 5) || (aR2 === 5 && bR1 === 5) || (aR1 === 5 && bR1 === 5) || (aR2 === 5 && bR2 === 5);
        if (isD5 && !seenDoppel5.has(it.id)) {
          seenDoppel5.add(it.id);
          doppel5List.push({ item: it, chapter: ch });
        }

        // 2. Brückenbau (5 trifft Note 2 oder 3) (Dedupliziert)
        var isBridge = (aR1 === 5 && (bR2 === 2 || bR2 === 3)) || (bR1 === 5 && (aR2 === 2 || aR2 === 3)) ||
                       (aR2 === 5 && (bR1 === 2 || bR1 === 3)) || (bR2 === 5 && (aR1 === 2 || aR1 === 3));
        if (isBridge && !seenBridges.has(it.id)) {
          seenBridges.add(it.id);
          bridgesList.push({ item: it, chapter: ch });
        }

        // 3. Komplementäre Passung (Aktiv trifft Passiv >= 4) (Dedupliziert)
        var isComp = (aR1 >= 4 && bR2 >= 4) || (bR1 >= 4 && aR2 >= 4);
        if (isComp && !seenComp.has(it.id)) {
          seenComp.add(it.id);
          compList.push({ item: it, chapter: ch });
        }

        // 4. Tabus (Note 1) mit genauer Partnernennung
        var whoTabu = [];
        if (aR1 === 1 || aR2 === 1) whoTabu.push(names.A || 'Partner 1');
        if (bR1 === 1 || bR2 === 1) whoTabu.push(names.B || 'Partner 2');
        if (whoTabu.length > 0 && !seenTabus.has(it.id)) {
          seenTabus.add(it.id);
          tabuList.push({ item: it, chapter: ch, who: whoTabu.join(' & ') });
        }

        // Harmonie-Berechnung
        if (typeof aR1 === 'number' && typeof bR2 === 'number') {
          totalEvaluated++;
          totalHarmonicPoints += Math.max(0, 5 - Math.abs(aR1 - bR2));
        }
        if (typeof bR1 === 'number' && typeof aR2 === 'number') {
          totalEvaluated++;
          totalHarmonicPoints += Math.max(0, 5 - Math.abs(bR1 - aR2));
        }
      });
    });

    var harmonyPct = totalEvaluated > 0 ? Math.round((totalHarmonicPoints / (totalEvaluated * 5)) * 100) : 0;

    // Cache für Detail-Filter
    cachedAnalysisMetrics = {
      doppel5List: doppel5List,
      bridgesList: bridgesList,
      compList: compList,
      tabuList: tabuList
    };

    // KPIs ins DOM schreiben
    var kpiHar = document.getElementById('kpi-harmony');
    var kpiD5 = document.getElementById('kpi-doppel5');
    var kpiBri = document.getElementById('kpi-bridges');
    var kpiTab = document.getElementById('kpi-tabus');

    if (kpiHar) kpiHar.innerText = harmonyPct + ' %';
    if (kpiD5) kpiD5.innerText = doppel5List.length;
    if (kpiBri) kpiBri.innerText = bridgesList.length;
    if (kpiTab) kpiTab.innerText = tabuList.length;

    // Filter-Zähler im Header der Detail-Box
    var cD5 = document.getElementById('count-pair-doppel5');
    var cBri = document.getElementById('count-pair-bridges');
    var cComp = document.getElementById('count-pair-comp');
    var cTab = document.getElementById('count-pair-tabus');

    if (cD5) cD5.innerText = doppel5List.length;
    if (cBri) cBri.innerText = bridgesList.length;
    if (cComp) cComp.innerText = compList.length;
    if (cTab) cTab.innerText = tabuList.length;

    renderPillarBars(pillarsA, pillarsB, maxPillars);
    renderPairRadarChart();
    renderPairDetailList(cachedAnalysisMetrics);
    renderSafetyConsensus();
    renderAnalysisSessionDiary();
  }

  function renderPillarBars(pA, pB, max) {
    function setPairBar(id) {
      var valA = max[id] > 0 ? Math.round((pA[id] / max[id]) * 100) : 0;
      var valB = max[id] > 0 ? Math.round((pB[id] / max[id]) * 100) : 0;

      var valEl = document.getElementById('pair-val-' + id);
      var barA = document.getElementById('pair-bar-A-' + id);
      var barB = document.getElementById('pair-bar-B-' + id);

      if (valEl) valEl.innerText = (names.A || 'A') + ': ' + valA + '% | ' + (names.B || 'B') + ': ' + valB + '%';
      if (barA) barA.style.width = (valA / 2) + '%';
      if (barB) barB.style.width = (valB / 2) + '%';
    }

    ['power', 'sensation', 'nurturing', 'thrill', 'visual'].forEach(setPairBar);
  }

  function renderPairRadarChart() {
    var canvas = document.getElementById('pairRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (pairRadarChartInstance) {
      try { pairRadarChartInstance.destroy(); } catch (e) {}
    }

    var dimensions = [
      { label: 'Körperzonen', chapters: [1, 12] },
      { label: 'Romantik', chapters: [2, 3] },
      { label: 'Keuschheit', chapters: [7, 8] },
      { label: 'Shibari', chapters: [13, 14] },
      { label: 'Sinnesentzug', chapters: [15] },
      { label: 'Impact', chapters: [16] },
      { label: 'Primal', chapters: [18] },
      { label: 'Caregiver', chapters: [19] },
      { label: 'Trance', chapters: [30] }
    ];

    var allChapters = window.surveyChapters || [];
    var ansA = answers.A || {};
    var ansB = answers.B || {};

    function calcScores(targetAns) {
      return dimensions.map(function(dim) {
        var earned = 0, possible = 0;
        dim.chapters.forEach(function(cId) {
          var ch = allChapters.find(function(c) { return c.id === cId; });
          if (ch && ch.items) {
            ch.items.forEach(function(it) {
              if (it.type !== 'choice') {
                var s1 = targetAns['it_' + it.id + '_r1'];
                var s2 = targetAns['it_' + it.id + '_r2'];
                if (typeof s1 === 'number' && s1 > 0) { earned += s1; possible += 5; }
                if (typeof s2 === 'number' && s2 > 0) { earned += s2; possible += 5; }
              }
            });
          }
        });
        return possible > 0 ? Math.round((earned / possible) * 100) : 0;
      });
    }

    var dataA = calcScores(ansA);
    var dataB = calcScores(ansB);

    try {
      pairRadarChartInstance = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: dimensions.map(function(d) { return d.label; }),
          datasets: [
            {
              label: names.A || 'Partner 1',
              data: dataA,
              backgroundColor: 'rgba(225, 29, 72, 0.25)',
              borderColor: 'rgba(225, 29, 72, 1)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(225, 29, 72, 1)'
            },
            {
              label: names.B || 'Partner 2',
              data: dataB,
              backgroundColor: 'rgba(147, 51, 234, 0.25)',
              borderColor: 'rgba(147, 51, 234, 1)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(147, 51, 234, 1)'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
              grid: { color: 'rgba(148, 163, 184, 0.2)' },
              pointLabels: { color: '#cbd5e1', font: { size: 10, weight: 'bold' } },
              ticks: { display: false, max: 100, min: 0 }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { color: '#e2e8f0', font: { size: 10, weight: 'bold' } }
            }
          }
        }
      });
    } catch (e) {
      console.warn("Chart creation error:", e);
    }
  }

  function switchPairDetailFilter(filter) {
    activeDetailFilter = filter;
    ['doppel5', 'bridges', 'complementary', 'tabus'].forEach(function(f) {
      var btn = document.getElementById('filter-pair-' + f);
      if (btn) {
        if (f === filter) {
          btn.className = "px-2.5 py-1 rounded-xl text-xs font-bold bg-brand-700 text-white touch-btn whitespace-nowrap";
        } else {
          btn.className = "px-2.5 py-1 rounded-xl text-xs font-bold theme-panel text-slate-300 touch-btn whitespace-nowrap";
        }
      }
    });

    if (cachedAnalysisMetrics) {
      renderPairDetailList(cachedAnalysisMetrics);
    } else {
      computePairMetrics();
    }
  }

  function renderPairDetailList(data) {
    var container = document.getElementById('pair-detail-items-container');
    if (!container || !data) return;

    var list = [];
    var emptyMsg = "Keine Einträge für diesen Filter vorhanden.";

    if (activeDetailFilter === 'doppel5') {
      list = data.doppel5List.map(function(d) {
        return `
          <div class="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-800 text-emerald-200 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-white text-xs">${d.item.id}. ${escapeHtml(d.item.title)}</strong>
              <span class="text-[9.5px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">⭐ Doppel-5er</span>
            </div>
            <p class="text-[11px] text-slate-300">${escapeHtml(d.item.desc || '')}</p>
            <span class="text-[10px] text-slate-400 block">Kapitel ${d.chapter.id}: ${escapeHtml(d.chapter.title)}</span>
          </div>
        `;
      });
    } else if (activeDetailFilter === 'bridges') {
      list = data.bridgesList.map(function(b) {
        return `
          <div class="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-800 text-indigo-200 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-white text-xs">${b.item.id}. ${escapeHtml(b.item.title)}</strong>
              <span class="text-[9.5px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">💡 Brücke (Wunsch trifft 2/3)</span>
            </div>
            <p class="text-[11px] text-slate-300">${escapeHtml(b.item.desc || '')}</p>
            <span class="text-[10px] text-slate-400 block">Kapitel ${b.chapter.id}: ${escapeHtml(b.chapter.title)}</span>
          </div>
        `;
      });
    } else if (activeDetailFilter === 'complementary') {
      list = data.compList.map(function(c) {
        return `
          <div class="p-3 rounded-2xl bg-amber-950/30 border border-amber-800 text-amber-200 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-white text-xs">${c.item.id}. ${escapeHtml(c.item.title)}</strong>
              <span class="text-[9.5px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">⚡ Top/Bottom Match</span>
            </div>
            <p class="text-[11px] text-slate-300">${escapeHtml(c.item.desc || '')}</p>
            <span class="text-[10px] text-slate-400 block">Kapitel ${c.chapter.id}: ${escapeHtml(c.chapter.title)}</span>
          </div>
        `;
      });
    } else {
      list = data.tabuList.map(function(t) {
        return `
          <div class="p-3 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-white text-xs">${t.item.id}. ${escapeHtml(t.item.title)}</strong>
              <span class="text-[9.5px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">⛔ Grenze von ${escapeHtml(t.who)}</span>
            </div>
            <p class="text-[11px] text-slate-300">${escapeHtml(t.item.desc || '')}</p>
            <span class="text-[10px] text-rose-300 font-semibold block">⚠️ Bei Sessions strikt ausschließen</span>
          </div>
        `;
      });
    }

    container.innerHTML = list.join('') || `<p class="text-slate-500 italic text-center py-4">${emptyMsg}</p>`;
  }

  function renderSafetyConsensus() {
    var container = document.getElementById('safety-consensus-list');
    if (!container) return;

    var cfgA = safetyConfig.A || {};
    var cfgB = safetyConfig.B || {};
    var modules = [
      { label: "Sicherheits-Cutter", key: "emergency_tools" },
      { label: "Safeword-System", key: "safeword" },
      { label: "Drop-Tuch / Knebel-Signal", key: "gag_signal" },
      { label: "15-Minuten Vital-Check", key: "vital_checks" },
      { label: "Aftercare-Schwerpunkt", key: "aftercare" },
      { label: "24-Stunden Check-in", key: "checkin_24h" }
    ];

    container.innerHTML = modules.map(function(m) {
      var valA = cfgA[m.key] || 'Nicht gewählt';
      var valB = cfgB[m.key] || 'Nicht gewählt';
      var isMatch = valA === valB && valA !== 'Nicht gewählt';

      return `
        <div class="p-2.5 rounded-xl border flex items-center justify-between ${isMatch ? 'bg-teal-950/30 border-teal-800' : 'theme-panel border-slate-800'}">
          <div>
            <strong class="text-white block text-xs">${m.label}:</strong>
            <span class="text-[10.5px] text-slate-400">${escapeHtml(names.A || 'A')}: ${escapeHtml(valA)} | ${escapeHtml(names.B || 'B')}: ${escapeHtml(valB)}</span>
          </div>
          <span class="text-xs font-bold ${isMatch ? 'text-teal-300' : 'text-amber-400'}">
            ${isMatch ? '✓ Konsens' : '⚠️ Abweichung'}
          </span>
        </div>
      `;
    }).join('');
  }

  function renderAnalysisSessionDiary() {
    var container = document.getElementById('analysis-session-diary-container');
    if (!container) return;

    if (!sessionDiary || sessionDiary.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-slate-400 italic space-y-1.5 theme-panel rounded-2xl border border-slate-800">
          <span class="text-2xl block">🕯️</span>
          <p>Noch keine Sessions im Tagebuch eingetragen.</p>
          <p class="text-[10.5px] text-slate-500">Startet eine Runde in der <a href="session.html" class="text-brand-400 underline font-semibold">Schlafzimmer-Regie</a> – dort könnt ihr im Aftercare euer Feedback direkt für die Paaranalyse speichern.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = sessionDiary.map(function(entry) {
      return `
        <div class="p-3 rounded-2xl theme-panel border border-slate-800 space-y-2">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1">
            <strong class="text-white text-xs">${escapeHtml(entry.date)} (${escapeHtml(entry.mode || 'Session')})</strong>
            <span class="text-pink-400 font-mono font-bold text-[11px]">Stufe ${entry.intensity || 7}/10 · ${entry.edgeCount || 0} Edges</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[10.5px] text-slate-300">
            <div>👑 Top: ${escapeHtml(entry.top || 'Top')}</div>
            <div>🧎 Bottom: ${escapeHtml(entry.bottom || 'Bottom')}</div>
          </div>
          ${entry.topFeedback ? `<div class="p-2 rounded-xl bg-slate-900 text-[10.5px]"><strong class="text-brand-300">Top-Feedback:</strong> ${escapeHtml(entry.topFeedback)}</div>` : ''}
          ${entry.bottomFeedback ? `<div class="p-2 rounded-xl bg-slate-900 text-[10.5px]"><strong class="text-indigo-300">Bottom-Feedback:</strong> ${escapeHtml(entry.bottomFeedback)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  async function generateAiPairReport() {
    var out = document.getElementById('ai-pair-report-output');
    var btn = document.getElementById('btn-generate-ai-pair');
    if (btn) btn.innerText = "⏳ Analysiere...";

    var apiKey = localStorage.getItem('kompass_gemini_api_key') || 'AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw';
    
    var activeModel = localStorage.getItem('kompass_discovered_model');
    if (!activeModel || activeModel.indexOf('2.5') !== -1 || activeModel.indexOf('omni') !== -1) {
      activeModel = 'gemini-3.8-flash';
      try { localStorage.setItem('kompass_discovered_model', activeModel); } catch (e) {}
    }

    var harmony = document.getElementById('kpi-harmony') ? document.getElementById('kpi-harmony').innerText : '0 %';
    var d5 = document.getElementById('kpi-doppel5') ? document.getElementById('kpi-doppel5').innerText : '0';
    var bridges = document.getElementById('kpi-bridges') ? document.getElementById('kpi-bridges').innerText : '0';

    var promptText = `
Du bist eine promovierte Paartherapeutin und evidenzbasierte BDSM-Forscherin. Erstelle ein maßgeschneidertes, tiefenpsychologisches Paargutachten für ${names.A || 'Partner 1'} und ${names.B || 'Partner 2'}:
- Basis-Harmonie: ${harmony}
- Doppel-5er Volltreffer: ${d5}
- Brückenbau-Chancen (Wunsch trifft Note 2/3): ${bridges}
- Orientierung: 50% empirische Wissenschaft (beziehe dich präzise auf Sagarin 2009, Wismeijer 2013, Canivet 2025, van der Kolk 2014) und 50% konkrete Paardynamik.
- Tonfall: Empathisch, respektvoll, normalisierend, wissenschaftlich fundiert, 0% moralisierend.
- Antwortformat: 3 prägnante HTML-Absätze mit Überschriften (1. Neurobiologische Kopplung & Bindung, 2. Somatische Entlastung vs. Führung, 3. Konkrete Empfehlung für die nächste Session in der Regie). Nutze saubere Tailwind-Klassen wie text-slate-300, text-xs, font-bold, space-y-2.`;

    var candidateModels = [];
    if (activeModel && activeModel.indexOf('omni') === -1 && activeModel.indexOf('2.5') === -1) {
      candidateModels.push(activeModel);
    }
    if (candidateModels.indexOf('gemini-3.8-flash') === -1) candidateModels.push('gemini-3.8-flash');
    if (candidateModels.indexOf('gemini-3.8-flash-lite') === -1) candidateModels.push('gemini-3.8-flash-lite');

    var success = false;
    var lastErrorMsg = "Verbindungsfehler";

    for (var i = 0; i < candidateModels.length; i++) {
      var currentModel = candidateModels[i];
      try {
        var resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        if (resp.ok) {
          var data = await resp.json();
          var text = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || '';
          if (out) out.innerHTML = text.replace(/```html/g, '').replace(/```/g, '').trim();
          showToast("✓ Tiefenpsychologisches Gutachten erstellt (" + currentModel + ")");
          try { localStorage.setItem('kompass_discovered_model', currentModel); } catch (e) {}
          success = true;
          break;
        } else {
          var errData = await resp.json().catch(function() { return {}; });
          lastErrorMsg = errData.error?.message || `HTTP ${resp.status}`;
        }
      } catch (e) {
        lastErrorMsg = e.message || "Netzwerkfehler";
      }
    }

    if (!success && out) {
      out.innerHTML = `<div class="p-3 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs space-y-1">
        <strong class="block font-bold">⚠️ Fehler bei der KI-Analyse:</strong>
        <p class="text-[11px]">${escapeHtml(lastErrorMsg)}</p>
      </div>`;
    }

    if (btn) btn.innerText = "✨ Gutachten neu berechnen";
  }

  function showToast(msg) {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var el = document.createElement('div');
    el.className = "bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 transition-all pointer-events-auto transform translate-y-2 opacity-0";
    el.innerText = msg;
    c.appendChild(el);

    setTimeout(function() { el.classList.remove('translate-y-2', 'opacity-0'); }, 10);
    setTimeout(function() {
      el.classList.add('opacity-0');
      setTimeout(function() { el.remove(); }, 300);
    }, 2500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  window.PairAnalysis = {
    loadData: loadAnalysisData,
    unlockGate: unlockAnalysisGate,
    computeMetrics: computePairMetrics,
    switchFilter: switchPairDetailFilter,
    generateReport: generateAiPairReport,
    showToast: showToast
  };

  // Global aliases for inline HTML event handlers
  window.unlockAnalysisGate = unlockAnalysisGate;
  window.switchPairDetailFilter = switchPairDetailFilter;
  window.generateAiPairReport = generateAiPairReport;
  window.showToast = showToast;

  window.addEventListener('DOMContentLoaded', function() {
    loadAnalysisData();
    try {
      if (sessionStorage.getItem('kompass_gate_unlocked') === 'true') {
        var gate = document.getElementById('password-gate');
        var content = document.getElementById('analysis-content');
        if (gate) gate.classList.add('hidden');
        if (content) content.classList.remove('hidden');
        computePairMetrics();
      }
    } catch (e) {}
  });

})(window);
