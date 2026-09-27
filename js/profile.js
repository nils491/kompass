/**
 * js/profile.js
 * Modul für die persönliche Profil-Auswertung ("Mein Profil"):
 * - Erotisches Archetypen-Radar mit Chart.js
 * - Psychologische 5-Säulen-Balance (Macht, Sensorik, Fürsorge, Thrill, Visuell)
 * - Höchste Leidenschaften (Note 5)
 * - 🙈 Scham- & Hemmschwellen-Liste (mit Klicksprung in den Bogen)
 * - Interaktive Tabu-Liste (Note 1) mit Direktsprung ins Fragebogen-Kapitel
 * - Tiefenpsychologisches Gemini-Einzelgutachten mit gezielter Entlastung der markierten Schamthemen
 */

(function(window) {
  'use strict';

  var singleRadarChartInstance = null;
  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
      return;
    }
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

  function getAnswersFingerprint(userAnswers) {
    if (!userAnswers || typeof userAnswers !== 'object') return '';
    var keys = Object.keys(userAnswers).sort();
    var str = '';
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.indexOf('_note') === -1) {
        str += k + '=' + userAnswers[k] + ';';
      }
    }
    return str;
  }

  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  function renderSingleProfile() {
    var curUser = window.currentUser || 'A';
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var answers = (window.answers && window.answers[curUser]) || {};
    var chapters = window.surveyChapters || [];

    var nameEl = document.getElementById('single-profile-name');
    if (nameEl) nameEl.innerText = names[curUser] || (curUser === 'A' ? 'Partner 1' : 'Partner 2');

    var emptyState = document.getElementById('single-empty-state');
    var contentState = document.getElementById('single-content-state');

    var answeredCount = Object.keys(answers).filter(function(k) { return k.indexOf('_note') === -1; }).length;
    if (answeredCount === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (contentState) contentState.classList.add('hidden');
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
      if (contentState) contentState.classList.remove('hidden');
    }

    var pillars = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };
    var maxPillars = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };

    var highPrioItems = [];
    var tabuItems = [];
    var shameItems = [];

    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        var isShame = !!answers['it_' + it.id + '_shame'];
        if (isShame) {
          shameItems.push({ id: it.id, title: it.title, desc: it.desc || '' });
        }

        if (it.type !== 'choice') {
          var r1 = answers['it_' + it.id + '_r1'];
          var r2 = answers['it_' + it.id + '_r2'];

          function addPoints(val) {
            if (typeof val === 'number' && val > 0) {
              if ([21, 22, 23, 29].indexOf(ch.id) !== -1) pillars.power += val;
              else if ([13, 14, 16, 17, 31].indexOf(ch.id) !== -1) pillars.sensation += val;
              else if ([19, 30].indexOf(ch.id) !== -1) pillars.nurturing += val;
              else if ([18, 20, 24, 25].indexOf(ch.id) !== -1) pillars.thrill += val;
              else if ([9, 10, 11].indexOf(ch.id) !== -1) pillars.visual += val;
            }
          }

          function addMax() {
            if ([21, 22, 23, 29].indexOf(ch.id) !== -1) maxPillars.power += 10;
            else if ([13, 14, 16, 17, 31].indexOf(ch.id) !== -1) maxPillars.sensation += 10;
            else if ([19, 30].indexOf(ch.id) !== -1) maxPillars.nurturing += 10;
            else if ([18, 20, 24, 25].indexOf(ch.id) !== -1) maxPillars.thrill += 10;
            else if ([9, 10, 11].indexOf(ch.id) !== -1) maxPillars.visual += 10;
          }

          addPoints(r1);
          addPoints(r2);
          addMax();

          if (r1 === 5) highPrioItems.push({ id: it.id, title: it.title, role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
          if (r2 === 5) highPrioItems.push({ id: it.id, title: it.title, role: 'Passiv: ' + (it.r2 || 'Empfangen') });
          if (r1 === 1) tabuItems.push({ id: it.id, title: it.title, role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
          if (r2 === 1) tabuItems.push({ id: it.id, title: it.title, role: 'Passiv: ' + (it.r2 || 'Empfangen') });
        }
      });
    });

    ['power', 'sensation', 'nurturing', 'thrill', 'visual'].forEach(function(pKey) {
      var pct = maxPillars[pKey] > 0 ? Math.round((pillars[pKey] / maxPillars[pKey]) * 100) : 0;
      var fillEl = document.getElementById('bar-fill-' + pKey);
      var valEl = document.getElementById('bar-val-' + pKey);
      if (fillEl) fillEl.style.width = pct + '%';
      if (valEl) valEl.innerText = pct + ' %';
    });

    // HIGH-PRIO LISTE
    var highListEl = document.getElementById('single-high-prio-list');
    if (highListEl) {
      highListEl.innerHTML = highPrioItems.length > 0 ? highPrioItems.map(function(h) {
        return `
          <button type="button" onclick="goToSurveyItem(${h.id})" class="w-full text-left p-2 rounded-xl bg-brand-950/40 hover:bg-brand-950 border border-brand-900/60 hover:border-brand-500 transition group block touch-btn cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-white block font-bold text-[10.5px] group-hover:text-brand-300">${escapeHtml(h.title)}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-brand-900 text-brand-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition">✏️ Ändern ↗</span>
            </div>
            <span class="text-brand-300 text-[9.5px] block mt-0.5">${escapeHtml(h.role)}</span>
          </button>
        `;
      }).join('') : '<p class="text-slate-500 italic text-[10.5px] text-center py-2">Noch keine 5er-Favoriten vergeben.</p>';
    }

    // TABUS LISTE
    var tabuListEl = document.getElementById('single-tabus-list');
    if (tabuListEl) {
      tabuListEl.innerHTML = tabuItems.length > 0 ? tabuItems.map(function(t) {
        return `
          <button type="button" onclick="goToSurveyItem(${t.id})" class="w-full text-left p-2 rounded-xl bg-rose-950/30 hover:bg-rose-950 border border-rose-900/60 hover:border-rose-600 transition group block touch-btn cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-white block font-bold text-[10.5px] group-hover:text-rose-200">${escapeHtml(t.title)}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition">✏️ Ändern ↗</span>
            </div>
            <span class="text-rose-300 text-[9.5px] block mt-0.5">${escapeHtml(t.role)}</span>
          </button>
        `;
      }).join('') : '<p class="text-slate-500 italic text-[10.5px] text-center py-2">Keine Tabus hinterlegt.</p>';
    }

    // SCHAM- & HEMMSCHWELLEN CONTAINER (DYNAMISCH EINFÜGEN WENN ELEMENT EXISTIERT ODER ERSTELLEN)
    renderSingleShameBox(shameItems);

    renderRadarChart(curUser, answers, chapters);
    loadCachedSingleInterpretation(curUser);
  }

  function renderSingleShameBox(shameItems) {
    var container = document.getElementById('single-shame-box-container');
    if (!container) {
      var gridParent = document.getElementById('single-high-prio-list')?.closest('.grid');
      if (gridParent) {
        var newBox = document.createElement('div');
        newBox.id = 'single-shame-box-container';
        newBox.className = "col-span-full theme-card rounded-3xl p-5 border space-y-2 shadow-md";
        gridParent.parentNode.insertBefore(newBox, gridParent.nextSibling);
        container = newBox;
      }
    }
    if (!container) return;

    if (shameItems.length === 0) {
      container.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <strong class="text-xs text-indigo-300 flex items-center gap-1.5">
            <span>🙈</span><span>Scham- & Hemmschwellen-Bereiche (0)</span>
          </strong>
        </div>
        <p class="text-[10.5px] text-slate-400 italic">Du hast bisher keine Praktik mit dem Scham-Faktor markiert. Du kannst Fragen im Fragebogen jederzeit mit „🙈 Scham“ kennzeichnen.</p>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center justify-between border-b border-indigo-900/60 pb-2">
          <strong class="text-xs text-indigo-300 flex items-center gap-1.5 font-bold">
            <span>🙈</span><span>Scham- & Hemmschwellen-Bereiche (${shameItems.length})</span>
          </strong>
          <span class="text-[9.5px] text-indigo-300 font-mono">Sensible Themen</span>
        </div>
        <p class="text-[10.5px] text-slate-300 leading-snug">
          Bei diesen Praktiken spürst du Neugier oder Reiz, empfindest jedoch Scham oder eine Hemmschwelle. Das Gutachten widmet sich gezielt der schamfreien Normalisierung dieser Themen:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
          ${shameItems.map(function(s) {
            return `
              <button type="button" onclick="goToSurveyItem(${s.id})" class="p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-950 border border-indigo-800/80 hover:border-indigo-500 text-left transition group block touch-btn cursor-pointer">
                <div class="flex items-center justify-between">
                  <span class="text-white block font-bold text-[10.5px] group-hover:text-indigo-200 truncate pr-1">${escapeHtml(s.title)}</span>
                  <span class="text-[9px] px-1 py-0.5 rounded bg-indigo-900 text-indigo-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition flex-shrink-0">✏️ ↗</span>
                </div>
                <span class="text-indigo-300 text-[9px] block mt-0.5 truncate">${escapeHtml(s.desc || 'Hemmschwelle')}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  function renderRadarChart(user, userAnswers, allChapters) {
    var canvas = document.getElementById('singleRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (singleRadarChartInstance) {
      try { singleRadarChartInstance.destroy(); } catch (e) {}
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

    var scores = dimensions.map(function(dim) {
      var earned = 0, possible = 0;
      dim.chapters.forEach(function(cId) {
        var ch = allChapters.find(function(c) { return c.id === cId; });
        if (ch && ch.items) {
          ch.items.forEach(function(it) {
            if (it.type !== 'choice') {
              var s1 = userAnswers['it_' + it.id + '_r1'];
              var s2 = userAnswers['it_' + it.id + '_r2'];
              if (typeof s1 === 'number' && s1 > 0) { earned += s1; possible += 5; }
              if (typeof s2 === 'number' && s2 > 0) { earned += s2; possible += 5; }
            }
          });
        }
      });
      return possible > 0 ? Math.round((earned / possible) * 100) : 0;
    });

    try {
      singleRadarChartInstance = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: dimensions.map(function(d) { return d.label; }),
          datasets: [{
            label: (window.names && window.names[user]) || 'Dein Profil',
            data: scores,
            backgroundColor: 'rgba(225, 29, 72, 0.25)',
            borderColor: 'rgba(225, 29, 72, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(225, 29, 72, 1)'
          }]
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
            legend: { display: false }
          }
        }
      });
    } catch (e) {
      console.warn("Radar Chart creation error:", e);
    }
  }

  function renderSingleReportHtml(report, isOutdated, generatedAt) {
    var bannerHtml = '';
    if (isOutdated) {
      bannerHtml = `
        <div class="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/80 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-lg animate-pulse mb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl flex-shrink-0">⚠️</span>
            <div>
              <strong class="text-xs text-amber-200 block font-bold">Deine Antworten haben sich verändert</strong>
              <span class="text-[10.5px] text-slate-300 block mt-0.5">Du hast seit der letzten Analyse neue Antworten gegeben oder geändert. Dein Gutachten basiert noch auf dem Stand vom ${escapeHtml(generatedAt || 'gespeicherten Zeitpunkt')}.</span>
            </div>
          </div>
          <button type="button" onclick="ProfileEngine.generateInterpretation()" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-xs touch-btn flex-shrink-0 shadow-md">
            ✨ Jetzt aktualisieren
          </button>
        </div>
      `;
    } else if (generatedAt) {
      bannerHtml = `
        <div class="flex items-center justify-between text-[10.5px] text-slate-400 mb-2 px-1">
          <span class="text-teal-300 font-semibold flex items-center gap-1.5">
            <span>✓</span> Gutachten aktuell (${escapeHtml(generatedAt)})
          </span>
          <span class="text-[9.5px] text-slate-500">Datenbasis synchron</span>
        </div>
      `;
    }

    return `
      <div class="theme-card rounded-3xl p-5 border space-y-3.5 shadow-md animate-fade-in text-xs leading-relaxed">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-base">✨</span>
            <h3 class="text-sm font-extrabold text-white">Tiefenpsychologisches Einzelgutachten</h3>
          </div>
          <button type="button" onclick="ProfileEngine.generateInterpretation()" class="px-3 py-1 bg-purple-900 hover:bg-purple-800 text-purple-200 font-extrabold rounded-xl text-xs touch-btn shadow-sm">
            Neu berechnen ↺
          </button>
        </div>

        ${bannerHtml}

        <div class="space-y-3 text-[11.5px] text-slate-300 leading-relaxed">
          <div class="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-900/60 space-y-1">
            <strong class="text-indigo-200 block text-xs font-bold">1. Erotischer Kern & Leit-Archetyp:</strong>
            <p>${escapeHtml(report.archetype || '')}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-900/60 space-y-1">
            <strong class="text-purple-200 block text-xs font-bold">2. Psychologische Motivationskräfte:</strong>
            <p>${escapeHtml(report.motivation || '')}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-900/60 space-y-1">
            <strong class="text-teal-200 block text-xs font-bold">3. Scham-Entlastung & Normalisierung:</strong>
            <p>${escapeHtml(report.normalization || '')}</p>
          </div>
        </div>
      </div>
    `;
  }

  function loadCachedSingleInterpretation(user) {
    var container = document.getElementById('single-interpretation-box');
    if (!container) return;

    try {
      var raw = localStorage.getItem('kompass_cached_single_report_' + user);
      if (raw) {
        var parsed = JSON.parse(raw);
        var reportData = parsed.report || parsed;
        if (reportData && reportData.archetype) {
          var userAnswers = (window.answers && window.answers[user]) || {};
          var curHash = hashString(getAnswersFingerprint(userAnswers));
          var isOutdated = parsed.hash && parsed.hash !== curHash;

          container.innerHTML = renderSingleReportHtml(reportData, isOutdated, parsed.generatedAt);
          return;
        }
      }
    } catch (e) {}

    container.innerHTML = `
      <div class="theme-card rounded-3xl p-5 border text-center space-y-3 shadow-md">
        <span class="text-2xl block">🔮</span>
        <div>
          <strong class="text-xs text-white block font-bold">Tiefenpsychologisches Einzelgutachten:</strong>
          <p class="text-[10.5px] text-slate-400 mt-0.5">Lass deine Bogen-Antworten und Scham-Themen schamfrei und wissenschaftlich fundiert analysieren.</p>
        </div>
        <button type="button" onclick="ProfileEngine.generateInterpretation()" class="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-brand-600 hover:from-purple-600 hover:to-brand-500 text-white font-extrabold rounded-xl text-xs touch-btn shadow-lg">
          ✨ Jetzt KI-Einzelgutachten berechnen
        </button>
      </div>
    `;
  }

  function generateClientSideSingleReport(userName, pPower, pSens, pNurt, pThrill, pVis, shameTitles) {
    var shameText = shameTitles.length > 0
      ? `Deine markierten Hemmschwellen (${shameTitles.slice(0, 3).join(', ')}) spiegeln keine Abweichung wider, sondern belegen den gesunden Wunsch nach geschützten Vertrauensgrenzen. Scham ist in der Sexualpsychologie oft der biologische Wächter vor intimen Wachstumszonen: Wo Scham im sicheren Raum behutsam abgelegt wird, entsteht maximale erotische Tiefe.`
      : `Alle deine Wünsche und Vorlieben sind aus sexualpsychologischer Sicht vollkommen gesund, verständlich und wertvoll. Wie die Forschung (u. a. Wismeijer 2013; Canivet 2025) eindeutig belegt, besitzen Menschen mit ausgeprägten erotischen Fantasien oft eine überdurchschnittliche emotionale Differenzierungsfähigkeit.`;

    return {
      archetype: `${userName} besitzt ein faszinierendes und vielschichtiges erotisches Profil. Im Zentrum steht das Bedürfnis nach Intensität, emotionaler Echtheit und klarer Präsenz. Deine Antworten spiegeln eine Persönlichkeit wider, die Sexualität nicht oberflächlich lebt, sondern als tiefes Eintauchen in Sinnesräume, Vertrauen und Hingabe versteht.`,
      motivation: `Deine stärksten Motivationskräfte speisen sich aus der Balance zwischen somatischer Reizwahrnehmung (${pSens}%) und Machtdynamik (${pPower}%). Für dich bedeutet Erotik, Alltagskontrollen bewusst fallenlassen zu können oder Verantwortung mit Feingefühl zu übernehmen. Die Fürsorge-Säule (${pNurt}%) belegt zudem, dass körperliche Grenzerfahrungen für dich immer in Geborgenheit und verlässliche Nähe eingebettet sein müssen.`,
      normalization: shameText
    };
  }

  async function generateSingleInterpretation() {
    var curUser = window.currentUser || 'A';
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var userName = names[curUser] || (curUser === 'A' ? 'Partner 1' : 'Partner 2');
    var userAnswers = (window.answers && window.answers[curUser]) || {};
    var chapters = window.surveyChapters || [];

    var shameTitles = [];
    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (userAnswers['it_' + it.id + '_shame']) {
          shameTitles.push(it.title);
        }
      });
    });

    var container = document.getElementById('single-interpretation-box');
    if (container) {
      container.innerHTML = `
        <div class="theme-card rounded-3xl p-8 border text-center space-y-3 shadow-md animate-pulse">
          <div class="w-10 h-10 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin mx-auto"></div>
          <strong class="text-xs text-purple-200 block font-bold">Analysiere dein psychologisches Profil...</strong>
          <p class="text-[10.5px] text-slate-400">Gemini wertet deine Antworten und Schamthemen schamfrei aus.</p>
        </div>
      `;
    }

    var pPower = document.getElementById('bar-val-power') ? document.getElementById('bar-val-power').innerText.replace('%', '').trim() : '50';
    var pSens = document.getElementById('bar-val-sensation') ? document.getElementById('bar-val-sensation').innerText.replace('%', '').trim() : '50';
    var pNurt = document.getElementById('bar-val-nurturing') ? document.getElementById('bar-val-nurturing').innerText.replace('%', '').trim() : '50';
    var pThrill = document.getElementById('bar-val-thrill') ? document.getElementById('bar-val-thrill').innerText.replace('%', '').trim() : '50';
    var pVis = document.getElementById('bar-val-visual') ? document.getElementById('bar-val-visual').innerText.replace('%', '').trim() : '50';

    var apiKey = localStorage.getItem('kompass_gemini_api_key') || DEFAULT_PRESET_GEMINI_KEY;

    var prompt = `Du bist eine einfühlsame, moderne und wissenschaftlich fundierte Sexualtherapeutin und Beziehungspsychologin.
Erstelle ein warmherziges, psychologisch tiefes und absolut schamfreies Einzelgutachten für ${userName}.

PROFIL-DATEN:
- Macht & Hingabe (D/s): ${pPower}%
- Sensorik & Körperreiz (Impact/Seile): ${pSens}%
- Fürsorge & Geborgenheit: ${pNurt}%
- Tabubruch & Thrill: ${pThrill}%
- Visuelle & Fetischreize: ${pVis}%
- Als schambehaftet markierte Praktiken (${shameTitles.length}): ${shameTitles.slice(0, 6).join(', ') || 'Keine spezifischen Scham-Markierungen'}

TONFALL & ANWEISUNGEN:
- Sprich ${userName} direkt mit "Du" an.
- Warmherzig, befreiend, psychologisch fundiert, absolut ohne moralische Wertung.
- In Feld 3 "normalization": Gehe ganz konkret und therapeutisch entlastend auf die markierten Schamthemen ein (Scham als Wächter intimer Vertrauenszonen, Canivet 2025, Wismeijer 2013).

Antworte AUSSCHLIESSLICH als valides JSON mit genau diesen drei Feldern:
{
  "archetype": "Welcher erotische Leit-Archetyp beschreibt ${userName} am treffendsten? (3 bis 5 Sätze)",
  "motivation": "Was sind die unbewussten psychologischen Motivationskräfte hinter diesen Vorlieben? (3 bis 5 Sätze)",
  "normalization": "Befreiende wissenschaftliche Entlastung von Schamgefühlen und Würdigung der Hemmschwellen (3 bis 5 Sätze)"
}`;

    var candidateModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
    var finalReport = null;

    for (var i = 0; i < candidateModels.length; i++) {
      var targetModel = candidateModels[i];
      try {
        var resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json"
            }
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

          if (parsedData && parsedData.archetype) {
            finalReport = parsedData;
            showToast("✓ Gutachten erfolgreich berechnet (" + targetModel + ")");
            break;
          }
        }
      } catch (e) {}
    }

    if (!finalReport) {
      finalReport = generateClientSideSingleReport(userName, pPower, pSens, pNurt, pThrill, pVis, shameTitles);
      showToast("✓ Gutachten aus deinen Bogen-Werten berechnet (Offline-Modus)");
    }

    if (finalReport) {
      var nowStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      var curHash = hashString(getAnswersFingerprint(userAnswers));
      var cacheEntry = {
        report: finalReport,
        hash: curHash,
        generatedAt: nowStr
      };

      try {
        localStorage.setItem('kompass_cached_single_report_' + curUser, JSON.stringify(cacheEntry));
      } catch (e) {}

      if (container) {
        container.innerHTML = renderSingleReportHtml(finalReport, false, nowStr);
      }
    }
  }

  window.ProfileEngine = {
    render: renderSingleProfile,
    generateInterpretation: generateSingleInterpretation
  };

  window.renderSingleProfile = renderSingleProfile;
  window.generateSingleInterpretation = generateSingleInterpretation;

})(window);
