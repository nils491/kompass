/**
 * js/profile.js
 * Modul für die persönliche Profil-Auswertung ("Mein Profil").
 * 
 * Beinhaltet:
 * - Psychologische 5-Säulen-Berechnung (Macht, Sensorik, Fürsorge, Tabubruch, Visuell)
 * - Erotisches Archetypen-Radar (Chart.js)
 * - Höchste Leidenschaften (Note 5) und persönliche Grenzen (Note 1)
 * - Schamfreie wissenschaftliche Einordnung
 * - Tiefenpsychologisches Einzelgutachten über Google Gemini (schneller JSON-Modus)
 */

(function(window) {
  'use strict';

  var singleRadarChartInstance = null;

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

  function renderSingleProfile() {
    var cEmpty = document.getElementById('single-empty-state');
    var cContent = document.getElementById('single-content-state');
    var currentUser = window.currentUser || 'A';
    var uAnswers = (window.answers && window.answers[currentUser]) || {};
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var nameEl = document.getElementById('single-profile-name');

    if (nameEl) nameEl.innerText = names[currentUser] || (currentUser === 'A' ? 'Partner 1' : 'Partner 2');

    var hasData = Object.keys(uAnswers).length > 0;
    if (!hasData) {
      if (cEmpty) cEmpty.classList.remove('hidden');
      if (cContent) cContent.classList.add('hidden');
      return;
    }

    if (cEmpty) cEmpty.classList.add('hidden');
    if (cContent) cContent.classList.remove('hidden');

    calculateAndRenderPillars(uAnswers);
    renderSingleRadarChart(uAnswers);
    renderHighAndTabuLists(uAnswers);
    
    var interpBox = document.getElementById('single-interpretation-box');
    if (interpBox) {
      var html = '<div class="theme-card rounded-3xl p-5 border border-indigo-500/40 shadow-xl space-y-3 bg-indigo-950/10">';
      html += '<div class="flex items-center justify-between border-b border-indigo-900/60 pb-2">';
      html += '<div><h3 class="text-sm font-extrabold text-white">Tiefenpsychologisches Einzelgutachten</h3>';
      html += '<p class="text-[10px] text-indigo-300">Wissenschaftlich fundiert (Sagarin, Wismeijer, Canivet)</p></div>';
      html += '<button type="button" onclick="generateAiReport()" id="btn-generate-ai" class="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 font-bold rounded-xl text-xs touch-btn flex items-center gap-1.5 shadow-md">✨ Gutachten berechnen</button></div>';
      html += '<div id="ai-report-output" class="text-xs text-slate-300 leading-relaxed italic">Klicke auf "Gutachten berechnen", um dein psychologisches Profil auf Basis deiner Antworten auswerten zu lassen.</div></div>';
      
      html += '<div class="theme-card rounded-3xl p-6 border border-brand-500/40 bg-gradient-to-br from-brand-950/30 to-noir-900 space-y-2 mt-4 shadow-xl">';
      html += '<strong class="text-brand-300 font-extrabold text-xs uppercase tracking-wider block">Ein Wort zur Normalität & Schamfreiheit (Canivet et al., 2025; Wismeijer, 2013)</strong>';
      html += '<p class="text-xs text-slate-300 leading-relaxed">Du bist vollkommen normal. Fantasien, Sehnsüchte und Kinks – egal wie wild, dunkel, verspielt oder ungewöhnlich sie dir im ersten Moment vorkommen mögen – sind ein vollkommen gesunder, wissenschaftlich belegter Ausdruck menschlicher Vielfalt. Im sicheren Raum eurer Partnerschaft gibt es kein Richtig oder Falsch. Was zählt, sind einzig euer gegenseitiges Einverständnis (Konsens), euer Vertrauen und das Wissen, dass jede persönliche Grenze zu 100 % respektiert und geschützt wird.</p></div>';

      interpBox.innerHTML = html;
    }

    loadCachedSingleReport();
  }

  function renderSingleReportCards(report, container) {
    if (!container || !report) return;
    container.innerHTML = `
      <div class="space-y-3 animate-fade-in text-xs leading-relaxed">
        <div class="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/70 space-y-1.5 shadow-md">
          <div class="flex items-center gap-2 text-indigo-300 font-extrabold text-xs uppercase tracking-wide border-b border-indigo-900/60 pb-1.5">
            <span class="text-base">🌟</span>
            <span>1. Deine erotische Kern-Motivation</span>
          </div>
          <p class="text-slate-200 text-[11.5px] leading-relaxed pt-0.5">${escapeHtml(report.core_motivation || '')}</p>
        </div>

        <div class="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/70 space-y-1.5 shadow-md">
          <div class="flex items-center gap-2 text-purple-300 font-extrabold text-xs uppercase tracking-wide border-b border-purple-900/60 pb-1.5">
            <span class="text-base">🛡️</span>
            <span>2. Dein Schlüssel zum Loslassen & Vertrauen</span>
          </div>
          <p class="text-slate-200 text-[11.5px] leading-relaxed pt-0.5">${escapeHtml(report.letting_go || '')}</p>
        </div>

        <div class="p-4 rounded-2xl bg-brand-950/30 border border-brand-800/70 space-y-1.5 shadow-md">
          <div class="flex items-center gap-2 text-brand-300 font-extrabold text-xs uppercase tracking-wide border-b border-brand-900/60 pb-1.5">
            <span class="text-base">💡</span>
            <span>3. Konkreter Impuls für eure Sessions</span>
          </div>
          <p class="text-slate-200 text-[11.5px] leading-relaxed pt-0.5">${escapeHtml(report.action_tip || '')}</p>
        </div>

        <div class="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-800/60 text-slate-300 space-y-1">
          <div class="flex items-center gap-1.5 text-teal-300 font-bold text-[11px]">
            <span>✨</span>
            <span>Wissenschaftliche Einordnung (Scham-Entlastung):</span>
          </div>
          <p class="text-[10.5px] leading-relaxed">${escapeHtml(report.science_insight || '')}</p>
        </div>
      </div>
    `;
  }

  function loadCachedSingleReport() {
    var out = document.getElementById('ai-report-output');
    var btn = document.getElementById('btn-generate-ai');
    var currentUser = window.currentUser || 'A';
    if (!out) return;
    try {
      var cached = localStorage.getItem('kompass_cached_single_report_' + currentUser);
      if (cached) {
        var parsed = JSON.parse(cached);
        if (parsed && parsed.core_motivation) {
          renderSingleReportCards(parsed, out);
          if (btn) btn.innerHTML = "<span>Neu berechnen ↺</span>";
        }
      }
    } catch (e) {}
  }

  function generateClientSideSingleReport(userName, pPower, pSens, pNurt, pThrill) {
    var powerNum = parseInt(pPower, 10) || 0;
    var sensNum = parseInt(pSens, 10) || 0;
    var nurtNum = parseInt(pNurt, 10) || 0;

    var coreMotivation = "";
    if (powerNum >= 50 && sensNum >= 40) {
      coreMotivation = `${userName}, deine stärkste erotische Energie entspringt dem bewussten Spiel mit Macht, Hingabe und körperlich spürbarer Reizintensität. Du schätzt es, wenn Vereinbarungen greifbar sind und wenn Berührungen eine klare Absicht transportieren. Für dich ist Sexualität kein beiläufiger Akt, sondern ein intensiver Raum, in dem Kontrolle und Begrenzung zu tiefer Befreiung führen.`;
    } else if (nurtNum >= 45) {
      coreMotivation = `${userName}, dein erotischer Kern schlägt vor allem im Rhythmus von Geborgenheit, emotionaler Sicherheit und fürsorglicher Nähe. Macht und Reize entfalten bei dir nur dann ihre volle Wirkung, wenn das Fundament aus unerschütterlichem Vertrauen und achtsamem Gehaltenwerden besteht.`;
    } else {
      coreMotivation = `${userName}, du bringst eine faszinierende, vielschichtige Balance zwischen Neugier, Sinnlichkeit und dem Wunsch nach klarer Verbundenheit mit. Deine Lust speist sich aus dem Wechselspiel von visuellen Reizen, spielerischem Ausprobieren und der Gewissheit, jederzeit vollkommen sicher zu sein.`;
    }

    var lettingGo = "";
    if (powerNum > 45) {
      lettingGo = `Um dich wirklich fallen zu lassen, brauchst du ein klares Gegenüber. Entweder verlangt dein Geist danach, Verantwortung für eine Weile vollständig abgeben zu dürfen (Subspace), oder du ziehst deine Kraft daraus, den Rahmen souverän und beschützend zu gestalten. Klare Safewords und vorhersehbare Rituale entlasten deinen Kopf nachhaltig von Alltagsstress.`;
    } else {
      lettingGo = `Dein Schlüssel zur vollen Hingabe liegt in der Entschleunigung. Wenn der Raum frei von Leistungsdruck ist und sanfte Berührungen den Körper schrittweise durchwärmen, schaltet dein Nervensystem zuverlässig vom Denken ins reine Spüren um.`;
    }

    var actionTip = `Plant für eure nächste gemeinsame Session eine bewusste 20-minütige Einstiegsphase in der Schlafzimmer-Regie: Beginnt mit synchroner Vagus-Atmung und sanften Streichreizen, bevor ihr die Intensität steigert. Schließt nach dem Höhepunkt mit mindestens 15 Minuten warmem Decken-Kuscheln (Holding) ab, um das physiologische Wohlbefinden nachhaltig zu verankern.`;

    var scienceInsight = `Wissenschaftliche Studien (Wismeijer & van Assen, 2013; Sagarin et al., 2009) belegen eindeutig: Das einvernehmliche Ausleben persönlicher Kinks und klarer Grenzen führt zu höherer Beziehungszufriedenheit, stärkt die Oxytocin-Bindung und senkt chronischen Alltagsstress messbar. Du bist vollkommen gesund und normal.`;

    return {
      core_motivation: coreMotivation,
      letting_go: lettingGo,
      action_tip: actionTip,
      science_insight: scienceInsight
    };
  }

  function calculateAndRenderPillars(uAnswers) {
    var pillars = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };
    var max = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };
    
    (window.surveyChapters || []).forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type === 'choice') return;
        var r1 = uAnswers['it_' + it.id + '_r1'];
        var r2 = uAnswers['it_' + it.id + '_r2'];
        
        var cId = ch.id;
        var sum = 0;
        if (typeof r1 === 'number' && r1 > 0) sum += r1;
        if (typeof r2 === 'number' && r2 > 0) sum += r2;

        if ([21, 22, 23, 29].indexOf(cId) !== -1) { pillars.power += sum; max.power += 10; }
        else if ([13, 14, 16, 17, 31].indexOf(cId) !== -1) { pillars.sensation += sum; max.sensation += 10; }
        else if ([19, 30].indexOf(cId) !== -1) { pillars.nurturing += sum; max.nurturing += 10; }
        else if ([18, 20, 24, 25].indexOf(cId) !== -1) { pillars.thrill += sum; max.thrill += 10; }
        else if ([9, 10, 11].indexOf(cId) !== -1) { pillars.visual += sum; max.visual += 10; }
      });
    });

    ['power', 'sensation', 'nurturing', 'thrill', 'visual'].forEach(function(p) {
      var pct = max[p] > 0 ? Math.round((pillars[p] / max[p]) * 100) : 0;
      var elVal = document.getElementById('bar-val-' + p);
      var elFill = document.getElementById('bar-fill-' + p);
      if (elVal) elVal.innerText = pct + ' %';
      if (elFill) elFill.style.width = pct + '%';
    });
  }

  function renderSingleRadarChart(uAnswers) {
    var canvas = document.getElementById('singleRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (singleRadarChartInstance) {
      try { singleRadarChartInstance.destroy(); } catch(e) {}
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

    var dataPoints = dimensions.map(function(dim) {
      var earned = 0;
      var possible = 0;
      dim.chapters.forEach(function(cId) {
        var ch = (window.surveyChapters || []).find(function(c) { return c.id === cId; });
        if (ch && ch.items) {
          ch.items.forEach(function(it) {
            if (it.type !== 'choice') {
              var s1 = uAnswers['it_' + it.id + '_r1'];
              var s2 = uAnswers['it_' + it.id + '_r2'];
              if (typeof s1 === 'number' && s1 > 0) { earned += s1; possible += 5; }
              if (typeof s2 === 'number' && s2 > 0) { earned += s2; possible += 5; }
            }
          });
        }
      });
      return possible > 0 ? Math.round((earned / possible) * 100) : 0;
    });

    var currentUser = window.currentUser || 'A';
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var cColor = currentUser === 'A' ? '225, 29, 72' : '147, 51, 234';

    try {
      singleRadarChartInstance = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: dimensions.map(function(d) { return d.label; }),
          datasets: [{
            label: names[currentUser] || 'Profil',
            data: dataPoints,
            backgroundColor: 'rgba(' + cColor + ', 0.3)',
            borderColor: 'rgba(' + cColor + ', 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(' + cColor + ', 1)'
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
          plugins: { legend: { display: false } }
        }
      });
    } catch(e) {
      console.warn("Radar Chart Fehler:", e);
    }
  }

  function renderHighAndTabuLists(uAnswers) {
    var highList = [];
    var tabuList = [];

    (window.surveyChapters || []).forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          var r1 = uAnswers['it_' + it.id + '_r1'];
          var r2 = uAnswers['it_' + it.id + '_r2'];
          
          if (r1 === 5) highList.push({ t: it.title, role: 'Aktiv' });
          if (r2 === 5) highList.push({ t: it.title, role: 'Passiv' });
          
          if (r1 === 1) tabuList.push({ t: it.title, role: 'Aktiv' });
          if (r2 === 1) tabuList.push({ t: it.title, role: 'Passiv' });
        }
      });
    });

    var hC = document.getElementById('single-high-prio-list');
    var tC = document.getElementById('single-tabus-list');

    if (hC) {
      if (highList.length === 0) hC.innerHTML = '<p class="text-slate-500 italic">Noch keine 5er-Bewertungen.</p>';
      else hC.innerHTML = highList.map(function(i) { return '<div class="p-2 rounded-xl bg-slate-900 border border-emerald-900/40"><strong class="text-emerald-300 block">' + escapeHtml(i.role) + ':</strong> ' + escapeHtml(i.t) + '</div>'; }).join('');
    }
    
    if (tC) {
      if (tabuList.length === 0) tC.innerHTML = '<p class="text-slate-500 italic">Noch keine Tabus definiert.</p>';
      else tC.innerHTML = tabuList.map(function(i) { return '<div class="p-2 rounded-xl bg-slate-900 border border-rose-900/40"><strong class="text-rose-300 block">' + escapeHtml(i.role) + ':</strong> ' + escapeHtml(i.t) + '</div>'; }).join('');
    }
  }

  async function generateAiReport() {
    var out = document.getElementById('ai-report-output');
    var btn = document.getElementById('btn-generate-ai');
    if (btn) btn.innerHTML = "<span>⏳ Berechne Gutachten...</span>";

    var apiKey = localStorage.getItem('kompass_gemini_api_key') || 'AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw';
    var currentUser = window.currentUser || 'A';
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var userName = names[currentUser] || 'Partner';

    var powerPct = document.getElementById('bar-val-power') ? document.getElementById('bar-val-power').innerText : '0%';
    var sensPct = document.getElementById('bar-val-sensation') ? document.getElementById('bar-val-sensation').innerText : '0%';
    var nurtPct = document.getElementById('bar-val-nurturing') ? document.getElementById('bar-val-nurturing').innerText : '0%';
    var thrillPct = document.getElementById('bar-val-thrill') ? document.getElementById('bar-val-thrill').innerText : '0%';

    var promptText = `Du bist ein einfühlsamer, moderner Paarberater und Sexualpsychologe.
Erstelle ein warmherziges, psychologisch fundiertes und absolut schamfreies Einzelgutachten für ${userName}.

DATENBASIS DES PROFILS:
- Macht & Hingabe: ${powerPct}
- Sensorik & Schmerz (Impact/Fesselung): ${sensPct}
- Fürsorge & Geborgenheit: ${nurtPct}
- Tabubruch & mentaler Kick: ${thrillPct}

TONFALL & STIL:
- Sprich ${userName} direkt und wertschätzend mit "Du" an.
- Vermeide kaltes Fachchinesisch! Übersetze psychologische Erkenntnisse in lebendige, greifbare Sprache, die Lust auf gemeinsame Entdeckungen macht.
- Feiere die Offenheit und bestärke das Vertrauen in die eigenen Wünsche und Grenzen.

Antworte AUSSCHLIESSLICH als valides JSON mit exakt diesen vier Feldern:
{
  "core_motivation": "Was treibt ${userName} im Innersten an? Welche Sehnsüchte und erotischen Motive stehen im Vordergrund? (3 bis 4 bildhafte Sätze)",
  "letting_go": "Was braucht ${userName}, um sich im Bett vollkommen fallen zu lassen und Vertrauen zu fassen? (3 bis 4 feinfühlige Sätze)",
  "action_tip": "Ein konkreter, spielerischer Vorschlag für die nächste Session in der Schlafzimmer-Regie. (3 bis 4 Sätze)",
  "science_insight": "Eine kurze, befreiende wissenschaftliche Einordnung (z.B. Sagarin 2009 / Wismeijer 2013 / Canivet 2025), warum diese Wünsche vollkommen gesund und normal sind. (2 bis 3 Sätze)"
}`;

    var candidateModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
    var success = false;

    for (var i = 0; i < candidateModels.length; i++) {
      var currentModel = candidateModels[i];
      try {
        var resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
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

          if (parsedData && parsedData.core_motivation) {
            try {
              localStorage.setItem('kompass_cached_single_report_' + currentUser, JSON.stringify(parsedData));
            } catch (se) {}

            renderSingleReportCards(parsedData, out);
            showToast("✓ Gutachten berechnet (" + currentModel + ")");
            success = true;
            break;
          }
        }
      } catch (e) {
        // Netzwerk- oder Quota-Fehler
      }
    }

    if (!success && out) {
      var fallbackReport = generateClientSideSingleReport(userName, powerPct, sensPct, nurtPct, thrillPct);
      try {
        localStorage.setItem('kompass_cached_single_report_' + currentUser, JSON.stringify(fallbackReport));
      } catch (se) {}

      renderSingleReportCards(fallbackReport, out);
      showToast("✓ Gutachten erfolgreich aus Bogen-Scores berechnet (Kostenlos)");
    }

    if (btn) btn.innerHTML = "<span>Neu berechnen ↺</span>";
  }

  window.ProfileEngine = {
    render: renderSingleProfile,
    generateReport: generateAiReport,
    calculatePillars: calculateAndRenderPillars,
    renderRadar: renderSingleRadarChart
  };

  window.renderSingleProfile = renderSingleProfile;
  window.generateAiReport = generateAiReport;

})(window);
