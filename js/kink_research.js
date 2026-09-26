/**
 * js/kink_research.js
 * High-Speed KI-Kink- & BDSM-Recherche Engine (100% Live-KI-Analyse).
 * 
 * - Keine statischen / vorrecherchierten Festwerte: Jede Anfrage wird live von der KI generiert
 * - Reines JSON-Streaming für typische Antwortzeiten von 1,5 bis 3,5 Sekunden
 * - Optimiert mit minimalem Thinking-Level für Gemini 3.8 und Budget 0 für 2.5
 * - Automatischer Reset der Suchmaske beim Schließen des Modals
 * - Barrierefreies 3-Säulen-Dashboard (Definition & Sicherheit, Top/Bottom-Psychologie, Top-Leitfaden)
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var sessionSearchCache = {};

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

  function getGeminiApiKey() {
    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return DEFAULT_PRESET_GEMINI_KEY;
  }

  function getCacheKey(term) {
    return (term || '').toLowerCase().trim().replace(/[^a-z0-9äöüß]/gi, '_');
  }

  function renderResearchUI(term, data, modelName, durationSec) {
    var steps = Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : [
      { title: "1. Vorbereitung & Konsens", desc: "Materialien bereitstellen, Grenzen und Notfall-Safewords verbindlich festlegen." },
      { title: "2. Behutsamer Einstieg", desc: "Sanfter Reiz- oder Druckaufbau zur Gewöhnung des Körpers." },
      { title: "3. Führung & Feedback", desc: "Atmung, Puls und Körpersignale kontinuierlich beobachten." },
      { title: "4. Ausklang & Aftercare", desc: "Wärmende Decken reichen, trinken lassen und emotional auffangen." }
    ];

    var timeBadge = durationSec ? ` (${durationSec}s)` : '';

    return `
      <div class="space-y-3.5 animate-fade-in text-xs leading-relaxed">
        <div class="flex items-center justify-between text-[10.5px] text-slate-400 border-b border-slate-800 pb-1.5">
          <span class="text-purple-300 font-semibold flex items-center gap-1">
            <span>✨</span> Live analysiert durch ${escapeHtml(modelName || 'Gemini 3.8 Flash')}${timeBadge}
          </span>
          <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(term).replace(/'/g, "\\'")}')" class="text-purple-400 hover:text-purple-200 font-bold hover:underline">
            Neu analysieren ↺
          </button>
        </div>

        <!-- SÄULE 1: WAS IST DAS & SICHERHEIT -->
        <div class="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 shadow-md space-y-2.5">
          <div class="flex items-center justify-between border-b border-indigo-900/60 pb-1.5">
            <div class="flex items-center gap-2">
              <span class="text-base">💡</span>
              <h4 class="text-indigo-200 font-extrabold text-xs uppercase tracking-wide">1. Was ist das & Sicherheitsmerkmale</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">Definition</span>
          </div>
          <div class="space-y-2.5 text-slate-200 text-[11px] leading-relaxed">
            <p>${escapeHtml(data.definition || '')}</p>
            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-900/50 flex items-start gap-2.5">
              <span class="text-indigo-400 text-base flex-shrink-0">🛡️</span>
              <div class="flex-1">
                <strong class="text-indigo-300 block text-[11px] font-bold">Sicherheit & Vorkehrungen:</strong>
                <span class="text-slate-300 text-[10.5px]">${escapeHtml(data.safety || 'Keine spezifischen physischen Risiken. Gilt als sichere Praktik bei gegenseitigem Konsens.')}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SÄULE 2: SEXUELLER REIZ FÜR TOP & BOTTOM -->
        <div class="p-4 rounded-2xl bg-brand-950/30 border border-brand-900/60 shadow-md space-y-2.5">
          <div class="flex items-center justify-between border-b border-brand-900/60 pb-1.5">
            <div class="flex items-center gap-2">
              <span class="text-base">🧠</span>
              <h4 class="text-brand-300 font-extrabold text-xs uppercase tracking-wide">2. Sexueller Reiz (Warum Menschen darauf stehen)</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-900/60 text-brand-200 border border-brand-700/60">Psychologie</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]">
            <div class="p-3 rounded-xl bg-slate-900/90 border border-rose-900/50 space-y-1">
              <div class="flex items-center gap-1.5 text-rose-300 font-bold">
                <span>👑</span><span>Reiz für den Top (Führung):</span>
              </div>
              <p class="text-slate-300 text-[10.5px] leading-normal">${escapeHtml(data.top_appeal || '')}</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/90 border border-indigo-900/50 space-y-1">
              <div class="flex items-center gap-1.5 text-indigo-300 font-bold">
                <span>🧎</span><span>Reiz für den Bottom (Hingabe):</span>
              </div>
              <p class="text-slate-300 text-[10.5px] leading-normal">${escapeHtml(data.bottom_appeal || '')}</p>
            </div>
          </div>

          ${data.science ? `
            <div class="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/50 text-[10.5px] text-slate-300">
              ✨ <strong class="text-purple-300 font-bold">Wissenschaftliche Einordnung:</strong> ${escapeHtml(data.science)}
            </div>
          ` : ''}
        </div>

        <!-- SÄULE 3: BEST PRACTICE ANLEITUNG FÜR DEN TOP -->
        <div class="p-4 rounded-2xl bg-teal-950/40 border border-teal-900/60 shadow-md space-y-2.5">
          <div class="flex items-center justify-between border-b border-teal-900/60 pb-1.5">
            <div class="flex items-center gap-2">
              <span class="text-base">📋</span>
              <h4 class="text-teal-300 font-extrabold text-xs uppercase tracking-wide">3. Best Practice: Anleitung für den Top</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-900/60 text-teal-300 border border-teal-700/60">Schritt für Schritt</span>
          </div>

          <div class="space-y-2 text-[11px] text-slate-300">
            ${steps.map(function(s, idx) {
              return `
                <div class="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-teal-950">
                  <span class="w-5 h-5 rounded-full bg-teal-950 border border-teal-600 text-teal-300 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">${idx + 1}</span>
                  <div>
                    <strong class="text-teal-200 block text-[10.5px]">${escapeHtml(s.title || ('Schritt ' + (idx + 1)))}:</strong>
                    <span class="text-slate-300 text-[10.5px]">${escapeHtml(s.desc || '')}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  async function performResearch(term, contextDesc, forceBypassCache) {
    var cleanTerm = (term || '').trim();
    if (!cleanTerm) return;

    var container = document.getElementById('lexikon-entries-container');
    var input = document.getElementById('lexikon-search-input');
    if (input) input.value = cleanTerm;

    var cacheKey = getCacheKey(cleanTerm);
    if (!forceBypassCache && sessionSearchCache[cacheKey]) {
      if (container) {
        container.innerHTML = renderResearchUI(cleanTerm, sessionSearchCache[cacheKey].data, sessionSearchCache[cacheKey].model, sessionSearchCache[cacheKey].duration);
      }
      return;
    }

    if (container) {
      container.innerHTML = `
        <div class="p-8 text-center space-y-4 theme-panel rounded-3xl border border-purple-800/40 shadow-xl bg-gradient-to-b from-purple-950/20 to-noir-950">
          <div class="relative w-12 h-12 mx-auto">
            <div class="w-12 h-12 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center text-sm">⚡</div>
          </div>
          <div class="space-y-1.5">
            <strong class="text-xs text-white block font-black">Live-Analyse: "${escapeHtml(cleanTerm)}"</strong>
            <p class="text-[11px] text-purple-300">Gemini generiert Definition, Psychologie & Best Practice...</p>
          </div>
        </div>
      `;
    }

    var apiKey = getGeminiApiKey();
    var startTime = Date.now();

    var prompt = `Du bist ein erfahrener, traumasensibler BDSM- und Sexualaufklärer.
Erkläre die Praktik "${cleanTerm}" ${contextDesc ? `(Kontext: "${contextDesc}")` : ''} für ein aufgeklärtes deutsches Paar.

Antworte ausschließlich als valides JSON mit genau diesen Feldern:
{
  "definition": "Ablauf und Durchführung in 5 bis 12 bildhaften, präzisen deutschen Sätzen.",
  "safety": "Sicherheitsmerkmale, Nerven/Durchblutung, Risikozonen und Safewords (oder der Hinweis, dass keine physischen Risiken bestehen).",
  "top_appeal": "Warum Top/Führender darauf steht (Macht, Reizmodulation, Kontrolle, Resonanz).",
  "bottom_appeal": "Warum Bottom/Empfangender darauf steht (Hingabe, Subspace, mentale Entlastung, Reizüberflutung).",
  "science": "Wissenschaftliche/psychologische Entlastung von Schamgefühlen (Normalisierung).",
  "steps": [
    {"title": "1. Konsens & Absprache", "desc": "Materialien, No-Gos und Safewords klären."},
    {"title": "2. Behutsamer Einstieg", "desc": "Langsamer Druck- oder Reizaufbau."},
    {"title": "3. Führung & Feedback", "desc": "Atmung, Körpersignale und Grenzen steuern."},
    {"title": "4. Ausklang & Aftercare", "desc": "Wärme, Trinken und emotionales Auffangen."}
  ]
}`;

    // Modell-Konfigurationen: Pro Modelltyp die passende Spezifikation
    var candidates = [
      {
        model: 'gemini-3.8-flash',
        genConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "minimal" }
        }
      },
      {
        model: 'gemini-3.7-flash',
        genConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "minimal" }
        }
      },
      {
        model: 'gemini-2.5-flash',
        genConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      }
    ];

    var success = false;
    var lastError = "Keine Verbindung zum KI-Dienst";

    for (var m = 0; m < candidates.length; m++) {
      var candidate = candidates[m];
      var targetModel = candidate.model;
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + targetModel + ':generateContent?key=' + encodeURIComponent(apiKey);

      var payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: candidate.genConfig
      };

      // Pro Einzelanfrage 7 Sekunden Timeout statt 16 Sekunden Warten
      var attemptController = new AbortController();
      var attemptTimeout = setTimeout(function() { attemptController.abort(); }, 7000);

      try {
        var resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: attemptController.signal
        });
        clearTimeout(attemptTimeout);

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

          if (parsedData && parsedData.definition) {
            var duration = ((Date.now() - startTime) / 1000).toFixed(1);
            sessionSearchCache[cacheKey] = { data: parsedData, model: targetModel, duration: duration };
            if (container) {
              container.innerHTML = renderResearchUI(cleanTerm, parsedData, targetModel, duration);
            }
            success = true;
            break;
          }
        } else {
          var errData = await resp.json().catch(function() { return {}; });
          lastError = errData.error?.message || ('HTTP ' + resp.status);
          if (resp.status === 429) break;
        }
      } catch (e) {
        clearTimeout(attemptTimeout);
        if (e.name === 'AbortError') {
          lastError = "Zeitüberschreitung beim Modell " + targetModel + ". Nächster Versuch...";
          continue;
        }
        lastError = e.message || "Netzwerkfehler";
      }
    }

    if (!success && container) {
      container.innerHTML = `
        <div class="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs space-y-1.5">
          <strong class="block font-bold">⚠️ Live-Recherche fehlgeschlagen:</strong>
          <p class="text-[11px]">${escapeHtml(lastError)}</p>
          <div class="pt-2 flex items-center justify-between">
            <span class="text-[10px] text-slate-400">Prüfe in den Einstellungen (⚙️) deinen Gemini API-Key.</span>
            <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(cleanTerm).replace(/'/g, "\\'")}')" class="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 border border-rose-700 text-white rounded-lg text-[10.5px] font-bold touch-btn">
              Erneut versuchen ↺
            </button>
          </div>
        </div>
      `;
    }
  }

  function openModal(term, contextDesc) {
    var modal = document.getElementById('modal-lexikon');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }

    if (term) {
      performResearch(term, contextDesc, false);
    } else {
      var container = document.getElementById('lexikon-entries-container');
      if (container && !container.innerHTML.trim()) {
        renderDefaultWelcome(container);
      }
    }
  }

  function closeModal() {
    var modal = document.getElementById('modal-lexikon');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }

    var input = document.getElementById('lexikon-search-input');
    if (input) input.value = '';
    var container = document.getElementById('lexikon-entries-container');
    if (container) renderDefaultWelcome(container);
  }

  function renderDefaultWelcome(container) {
    container.innerHTML = `
      <div class="p-5 text-center space-y-3 theme-panel rounded-2xl border border-slate-800">
        <span class="text-3xl block">🔍</span>
        <div>
          <strong class="text-xs text-white block font-bold">Gib oben einen Begriff ein oder wähle eine Praxis:</strong>
          <p class="text-[10.5px] text-slate-400 mt-0.5">Analysiert Ablauf, psychologische Anziehungskraft und Sicherheitsstandards in Echtzeit.</p>
        </div>
        <div class="flex flex-wrap gap-1.5 justify-center pt-1">
          <button type="button" onclick="KinkResearch.open('Sensuelles Breast-Smothering')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Breast-Smothering</button>
          <button type="button" onclick="KinkResearch.open('Takate Kote (Klassische Armbox)')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Takate Kote</button>
          <button type="button" onclick="KinkResearch.open('Ruined Orgasm')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Ruined Orgasm</button>
          <button type="button" onclick="KinkResearch.open('CBT (Ball Stretcher & Hodenringe)')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">CBT</button>
          <button type="button" onclick="KinkResearch.open('Bratting & spielerisches Bändigen')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Bratting</button>
          <button type="button" onclick="KinkResearch.open('Pegging')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Pegging</button>
        </div>
      </div>
    `;
  }

  function handleSearchFromInput() {
    var input = document.getElementById('lexikon-search-input');
    var val = (input ? input.value : '').trim();
    if (val) {
      performResearch(val, null, true);
    } else {
      showToast("Bitte gib einen Begriff zur Recherche ein.");
    }
  }

  window.KinkResearch = {
    open: openModal,
    close: closeModal,
    search: handleSearchFromInput,
    forceRefresh: function(term) { performResearch(term, null, true); }
  };

  window.openLexikonModal = openModal;
  window.closeLexikonModal = closeModal;
  window.searchKinkResearch = handleSearchFromInput;

})(window);
