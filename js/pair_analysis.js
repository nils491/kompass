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
 * - Schnelles, warmherziges KI-Paargutachten (JSON-Modus, <2.5s)
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

    // Gespeichertes Paargutachten sofort laden falls vorhanden
    loadCachedPairReport();
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

  function renderPairReportCards(report, container) {
    if (!container || !report) return;

    container.innerHTML = `
      <div class="space-y-3 animate-fade-in text-xs leading-relaxed">
        <!-- 1. SYNERGIE & GEMEINSAME MAGIE -->
        <div class="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/70 space-y-1.5 shadow-md">
          <div class="flex items-center gap-2 text-indigo-300 font-extrabold text-xs uppercase tracking-wide border-b border-indigo-900/60 pb-1.5">
            <span class="text-base">💫</span>
            <span>1. Eure gemeinsame Magie & Schnittmengen</span>
          </div>
          <p class="text-slate-200 text-[11.5px] leading-relaxed pt-0.5">${escapeHtml(report.synergy || '')}</p>
        </div>

        <!-- 2. ROLLEN & MACHTDYNAMIK -->
        <div class="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/70 space-y-1.5 shadow-md">
          <div class="flex items-center gap-2 text-purple-300 font-extrabold text-xs uppercase tracking-wide border-b border-purple-900/60 pb-1.5">
            <span class="text-base">⚖️</span>
            <span>2. Eure Rollen- & Machtdynamik (Top & Bottom)</span>
          </div>
          <p class="text-slate-200 text-[11.5px] leading-relaxed pt-0.5">${escapeHtml(report.dynamics || '')}</p>
        </div>

        <!-- 3. KONKRETER IMPULS FÜR DIE NÄCHSTE SESSION -->
        <div class="p-4 rounded-2xl bg-brand-950/30 border border-brand-800/70 space-y-1.5 shadow-md">
          <div class="flex items-center gap-2 text-brand-300 font-extrabold text-xs uppercase tracking-wide border-b border-brand-900/60 pb-1.5">
            <span class="text-base">🕯️</span>
            <span>3. Konkrete Idee für eure nächste Session</span>
          </div>
          <p class="text-slate-200 text-[11.5px] leading-relaxed pt-0.5">${escapeHtml(report.action_tip || '')}</p>
        </div>

        <!-- 4. WISSENSCHAFTLICHE NORMALISIERUNG -->
        <div class="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-800/60 text-slate-300 space-y-1">
          <div class="flex items-center gap-1.5 text-teal-300 font-bold text-[11px]">
            <span>🛡️</span>
            <span>Wissenschaftliche Bestärkung & Normalität:</span>
          </div>
          <p class="text-[10.5px] leading-relaxed">${escapeHtml(report.science_insight || '')}</p>
        </div>
      </div>
    `;
  }

  function loadCachedPairReport() {
    var out = document.getElementById('ai-pair-report-output');
    var btn = document.getElementById('btn-generate-ai-pair');
    if (!out) return;

    try {
      var cached = localStorage.getItem('kompass_cached_pair_report');
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && parsed.synergy) {
          renderPairReportCards(parsed, out);
          if (btn) btn.innerHTML = "<span>Neu berechnen ↺</span>";
        }
      }
    } catch (e) {}
  }

  async function generateAiPairReport() {
    var out = document.getElementById('ai-pair-report-output');
    var btn = document.getElementById('btn-generate-ai-pair');
    if (btn) btn.innerHTML = "<span>⏳ Analysiere Paardynamik...</span>";

    var apiKey = localStorage.getItem('kompass_gemini_api_key') || 'AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw';

    var harmony = document.getElementById('kpi-harmony') ? document.getElementById('kpi-harmony').innerText : '0 %';
    var d5 = document.getElementById('kpi-doppel5') ? document.getElementById('kpi-doppel5').innerText : '0';
    var bridges = document.getElementById('kpi-bridges') ? document.getElementById('kpi-bridges').innerText : '0';
    var tabus = document.getElementById('kpi-tabus') ? document.getElementById('kpi-tabus').innerText : '0';

    var pA_Power = document.getElementById('pair-val-power') ? document.getElementById('pair-val-power').innerText : '';
    var pA_Sens = document.getElementById('pair-val-sensation') ? document.getElementById('pair-val-sensation').innerText : '';

    var promptText = `Du bist eine einfühlsame, moderne und wissenschaftlich fundierte Paartherapeutin und Sexualberaterin.
Erstelle ein warmherziges, psychologisch tiefes und absolut schamfreies Paargutachten für ${names.A || 'Partner 1'} und ${names.B || 'Partner 2'}.

DATENBASIS DES PAARES:
- Basisharmonie: ${harmony}
- Gemeinsame Höchstlust (Doppel-5er Matches): ${d5}
- Brückenbau-Chancen (Wunsch trifft Neugier/Duldung): ${bridges}
- Definierte Tabu-Schutzschranken: ${tabus}
- Macht-Verteilung: ${pA_Power}
- Sensorik/Schmerz: ${pA_Sens}

TONFALL & FORMULIERUNG:
- Sprich die beiden direkt, warm und wertschätzend als Paar an ("Ihr beide...", "Zwischen euch...").
- Vermeide kaltes Fachchinesisch oder medizinische Distanz! Übersetze psychologische Erkenntnisse in lebendige, greifbare Sprache, die Lust auf gemeinsame Entdeckungen macht.
- Keine moralischen Bewertungen. Feiere ihre Offenheit und Bestätigung ihrer Grenzen.

Antworte AUSSCHLIESSLICH als valides JSON mit exakt diesen vier Feldern:
{
  "synergy": "Wo liegt die größte emotionale und erotische Kraft der beiden? Welche Leidenschaften verbinden sie am stärksten? (3 bis 5 bildhafte Sätze)",
  "dynamics": "Wie greifen Führung (Top) und Hingabe (Bottom) bei den beiden ineinander? Wie ergänzen sie sich gegenseitig? (3 bis 5 feinfühlige Sätze)",
  "action_tip": "Ein konkreter, spielerischer Vorschlag für ihre nächste gemeinsame Session in der Schlafzimmer-Regie, der ihre Stärken aufgreift. (3 bis 4 inspirierende Sätze)",
  "science_insight": "Eine kurze, befreiende wissenschaftliche Einordnung (z. B. Sagarin 2009 / Wismeijer 2013 / Canivet 2025), warum einvernehmliche Rollenspiele, Kinks und klare Grenzen die Beziehungszufriedenheit und Bindung nachweislich stärken. (2 bis 3 ermutigende Sätze)"
}`;

    var candidateConfigs = [
      {
        model: 'gemini-3.8-flash',
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "minimal" }
        }
      },
      {
        model: 'gemini-3.7-flash',
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "minimal" }
        }
      },
      {
        model: 'gemini-2.5-flash',
        config: {
          temperature: 0.3,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      }
    ];

    var success = false;
    var lastErrorMsg = "Verbindungsfehler";

    for (var i = 0; i < candidateConfigs.length; i++) {
      var item = candidateConfigs[i];
      var targetModel = item.model;

      try {
        var resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: item.config
          })
        });

        if (resp.ok) {
          var resData = await resp.json();
          var rawJson = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          var parsedData = null;

          try {
            parsedData = JSON.parse(rawJson);
          } catch (pe) {
            var match = rawJson.match(/\{[\s\S]*\}/);
            parsedData = match ? JSON.parse(match[0]) : null;
          }

          if (parsedData && parsedData.synergy) {
            try {
              localStorage.setItem('kompass_cached_pair_report', JSON.stringify(parsedData));
            } catch (se) {}

            renderPairReportCards(parsedData, out);
            showToast("✓ Paargutachten erfolgreich berechnet (" + targetModel + ")");
            success = true;
            break;
          }
        } else {
          var errData = await resp.json().catch(function() { return {}; });
          lastErrorMsg = errData.error?.message || `HTTP ${resp.status}`;
          if (resp.status === 429 || (errData.error && errData.error.message && errData.error.message.indexOf('quota') !== -1)) {
            break;
          }
        }
      } catch (e) {
        lastErrorMsg = e.message || "Netzwerkfehler";
      }
    }

    if (!success && out) {
      out.innerHTML = `
        <div class="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs space-y-1.5">
          <div class="flex items-center gap-2 font-bold">
            <span>⚠️</span><span>Analyse momentan nicht möglich:</span>
          </div>
          <p class="text-[11px] leading-relaxed">${escapeHtml(lastErrorMsg)}</p>
          <p class="text-[10px] text-slate-400 pt-0.5">Tipp: Bitte prüfe in den Einstellungen (⚙️) auf der Startseite deinen eigenen Gemini API-Key.</p>
        </div>
      `;
    }

    if (btn) btn.innerHTML = "<span>Neu berechnen ↺</span>";
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

  // Globale Aliase für HTML-Event-Handler
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
