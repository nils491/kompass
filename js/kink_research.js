/**
 * js/kink_research.js
 * High-Speed KI-Kink- & BDSM-Recherche Engine.
 * 
 * Performance-Optimierungen:
 * - Direkter Fast-Path auf gemini-2.0-flash / gemini-1.5-flash ohne vorgeschaltetes GET /models
 * - JSON-Modus (responseMimeType: application/json): Nur ~180 Tokens statt 800+ Tokens HTML
 * - thinkingBudget: 0 schaltet das interne Grübeln komplett ab
 * - Lokales Client-Side-Rendering des aufwendigen 3-Säulen-Designs in 0 ms
 * - Persistentes localStorage-Caching für 0 ms Antwortzeit bei wiederholten Begriffen
 * - Automatischer Reset beim Schließen des Modals
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var memoryCache = {};

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
    return 'kompass_kink_cache_v2_' + (term || '').toLowerCase().trim().replace(/[^a-z0-9äöüß]/gi, '_');
  }

  function getCachedResult(term) {
    var key = getCacheKey(term);
    if (memoryCache[key]) return memoryCache[key];
    try {
      var stored = localStorage.getItem(key);
      if (stored) {
        var parsed = JSON.parse(stored);
        memoryCache[key] = parsed;
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  function setCachedResult(term, data) {
    var key = getCacheKey(term);
    var entry = { term: term, data: data, timestamp: Date.now() };
    memoryCache[key] = entry;
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {}
  }

  function renderResearchUI(term, data, fromCache, modelName) {
    var steps = Array.isArray(data.steps) ? data.steps : [
      { title: "Vorbereitung & Konsens", desc: "Materialien bereitlegen, Grenzen klären." },
      { title: "Einstieg & Steigerung", desc: "Behutsamer Beginn und langsame Reizsteigerung." },
      { title: "Führung & Feedback", desc: "Atmung, Signale und Muskelspannung beobachten." },
      { title: "Ausklang & Aftercare", desc: "Warmes Halten, Decken und Trinken reichen." }
    ];

    var statusHtml = fromCache
      ? `<span class="flex items-center gap-1 text-amber-400 font-semibold">⚡ Sofort aus lokalem Cache (0 ms)</span>`
      : `<span class="text-purple-300 font-semibold">✨ Frisch recherchiert (${escapeHtml(modelName || 'Gemini Turbo')})</span>`;

    return `
      <div class="space-y-3.5 animate-fade-in text-xs leading-relaxed">
        <div class="flex items-center justify-between text-[10.5px] text-slate-400 border-b border-slate-800 pb-1.5">
          ${statusHtml}
          <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(term).replace(/'/g, "\\'")}')" class="text-purple-400 hover:text-purple-200 font-bold hover:underline">Neu recherchieren ↺</button>
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

  async function performResearch(term, contextDesc) {
    var cleanTerm = (term || '').trim();
    if (!cleanTerm) return;

    var container = document.getElementById('lexikon-entries-container');
    var input = document.getElementById('lexikon-search-input');
    if (input) input.value = cleanTerm;

    // 1. Sofort aus Cache (0 ms)
    var cached = getCachedResult(cleanTerm);
    if (cached && cached.data) {
      if (container) {
        container.innerHTML = renderResearchUI(cleanTerm, cached.data, true);
      }
      return;
    }

    // 2. High-Tech Lade-Zustand rendern
    if (container) {
      container.innerHTML = `
        <div class="p-8 text-center space-y-4 theme-panel rounded-3xl border border-purple-800/40 shadow-xl bg-gradient-to-b from-purple-950/20 to-noir-950">
          <div class="relative w-12 h-12 mx-auto">
            <div class="w-12 h-12 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center text-sm">⚡</div>
          </div>
          <div class="space-y-1.5">
            <strong class="text-xs text-white block font-black">Analysiere: "${escapeHtml(cleanTerm)}"</strong>
            <p class="text-[11px] text-purple-300">Wissenschaftliche Einordnung, Reizanalyse & Sicherheitsregeln werden aufbereitet...</p>
          </div>
        </div>
      `;
    }

    var apiKey = getGeminiApiKey();

    // Ultraschlanker Prompt: Nur die reinen Text-Daten als JSON verlangen!
    var prompt = `Du bist ein erfahrener, traumasensibler BDSM- und Sexualaufklärer sowie Paartherapeut.
Erkläre die Praktik "${cleanTerm}" ${contextDesc ? `(Kontext: "${contextDesc}")` : ''} für ein aufgeklärtes Paar auf Deutsch.

Antworte ausschließlich als valides JSON mit exakt dieser Struktur:
{
  "definition": "Hier in zusammenhängenden 5 bis 15 Sätzen die präzise, bildhafte und schamfreie Erklärung des Ablaufs und der Durchführung.",
  "safety": "Konkrete physische/psychologische Risikozonen, Nerven, Durchblutung oder ausdrücklich der Hinweis, dass keine physischen Risiken bestehen.",
  "top_appeal": "Was macht es für den führenden/aktiven Part erregend (z. B. Kontrolle, Reizmodulation, Hingabe des Partners)?",
  "bottom_appeal": "Was reizt den empfangenden Part (z. B. mentale Entlastung von Alltagsverantwortung, Subspace, sensorische Überwältigung)?",
  "science": "Kurze neurobiologische oder psychologische Entlastung von Schamgefühlen (warum Menschen darauf stehen).",
  "steps": [
    {"title": "Vorbereitung & Konsens", "desc": "Equipment bereitlegen, Grenzen und Safewords vorab klären."},
    {"title": "Einstieg & Steigerung", "desc": "Wie die Intensität behutsam aufgebaut wird, ohne zu überfordern."},
    {"title": "Führung & Feedback", "desc": "Worauf der Top kontinuierlich achtet (Atmung, Signale, Körperspannung)."},
    {"title": "Ausklang & Aftercare", "desc": "Sicheres Beenden, Decken, Wärme und emotionales Auffangen."}
  ]
}`;

    // Direkte Fast-Path-Kandidaten (kein langsames GET /models vorab!)
    var fastModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    var success = false;
    var lastError = "Keine Verbindung zum KI-Dienst";

    for (var i = 0; i < fastModels.length; i++) {
      var model = fastModels[i];
      try {
        var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(apiKey);

        var payload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            thinkingConfig: {
              thinkingBudget: 0
            }
          }
        };

        var resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        // Falls Modell thinkingConfig nicht unterstützt, sofort ohne wiederholen
        if (!resp.ok && resp.status === 400) {
          delete payload.generationConfig.thinkingConfig;
          resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        if (resp.ok) {
          var resData = await resp.json();
          var rawJson = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          var parsedData;
          try {
            parsedData = JSON.parse(rawJson);
          } catch (pe) {
            var match = rawJson.match(/\{[\s\S]*\}/);
            parsedData = match ? JSON.parse(match[0]) : null;
          }

          if (parsedData && parsedData.definition) {
            setCachedResult(cleanTerm, parsedData);
            if (container) {
              container.innerHTML = renderResearchUI(cleanTerm, parsedData, false, model);
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
        lastError = e.message || "Netzwerkfehler";
      }
    }

    if (!success && container) {
      container.innerHTML = `
        <div class="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs space-y-1">
          <strong class="block font-bold">⚠️ Fehler bei der Recherche:</strong>
          <p class="text-[11px]">${escapeHtml(lastError)}</p>
          <div class="pt-2 flex items-center justify-between">
            <span class="text-[10px] text-slate-400">Prüfe in den Einstellungen (⚙️) deinen Gemini API-Key.</span>
            <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(cleanTerm).replace(/'/g, "\\'")}')" class="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 border border-rose-700 text-white rounded-lg text-[10.5px] font-bold touch-btn">Erneut versuchen ↺</button>
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
      performResearch(term, contextDesc);
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
    // Automatischer Reset für die nächste Suche
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

  function handleSearchSubmit() {
    var input = document.getElementById('lexikon-search-input');
    var val = input ? input.value.trim() : '';
    if (val) {
      performResearch(val);
    } else {
      showToast("Bitte gib einen Suchbegriff ein");
    }
  }

  function forceRefresh(term) {
    var key = getCacheKey(term);
    delete memoryCache[key];
    try { localStorage.removeItem(key); } catch (e) {}
    performResearch(term);
  }

  window.KinkResearch = {
    open: openModal,
    close: closeModal,
    search: handleSearchSubmit,
    explain: performResearch,
    forceRefresh: forceRefresh
  };

  window.openLexikonModal = openModal;
  window.closeLexikonModal = closeModal;
  window.searchKinkResearch = handleSearchSubmit;

})(window);
