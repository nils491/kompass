/**
 * js/kink_research.js
 * Spezialisiertes Modul für dynamische KI-Kink- & BDSM-Recherche.
 * 
 * Features:
 * - Dynamische Recherche beliebiger Praktiken & Begriffe über Google Gemini
 * - Lokales Caching im localStorage (0 ms Latenz & 0 Token-Verbrauch bei wiederholter Abfrage)
 * - Traumasensibler, schamfreier und wissenschaftlich fundierter Prompt (3-Säulen-Struktur)
 * - Schnelle Latenz: thinkingBudget: 0 schaltet langes internes Grübeln ab
 * - Direkte Anbindung an den Fragebogen (Klick auf '🔍 KI-Info' bei jeder Frage)
 * - Freie Suche mit Schnellauswahl-Chips im Recherche-Modal
 * - Automatischer Reset des Modals beim Schließen für die nächste Suche
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var memoryCache = {};
  var cachedAvailableModels = null;

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
    return 'kompass_kink_cache_' + (term || '').toLowerCase().trim().replace(/[^a-z0-9äöüß]/gi, '_');
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

  function setCachedResult(term, html) {
    var key = getCacheKey(term);
    var data = { term: term, html: html, timestamp: Date.now() };
    memoryCache[key] = data;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {}
  }

  async function resolveAvailableTextModels(apiKey) {
    if (cachedAvailableModels && cachedAvailableModels.length > 0) {
      return cachedAvailableModels;
    }
    var fallbackList = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    try {
      var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(apiKey));
      if (resp.ok) {
        var data = await resp.json();
        var models = (data.models || []).filter(function(m) {
          return m.supportedGenerationMethods &&
            m.supportedGenerationMethods.indexOf('generateContent') !== -1 &&
            m.name.indexOf('tts') === -1 &&
            m.name.indexOf('omni') === -1 &&
            m.name.indexOf('image') === -1 &&
            m.name.indexOf('video') === -1 &&
            m.name.indexOf('embed') === -1;
        }).map(function(m) {
          return m.name.replace('models/', '');
        });

        if (models.length > 0) {
          models.sort(function(a, b) {
            var aScore = (a.indexOf('flash') !== -1 ? 10 : 0) + (a.indexOf('2.0') !== -1 ? 5 : 0);
            var bScore = (b.indexOf('flash') !== -1 ? 10 : 0) + (b.indexOf('2.0') !== -1 ? 5 : 0);
            return bScore - aScore;
          });
          cachedAvailableModels = models;
          return models;
        }
      }
    } catch (e) {}
    cachedAvailableModels = fallbackList;
    return fallbackList;
  }

  async function performResearch(term, contextDesc) {
    var cleanTerm = (term || '').trim();
    if (!cleanTerm) return;

    var container = document.getElementById('lexikon-entries-container');
    var input = document.getElementById('lexikon-search-input');
    if (input) input.value = cleanTerm;

    // 1. Aus Cache lesen (0 ms Latenz)
    var cached = getCachedResult(cleanTerm);
    if (cached) {
      if (container) {
        container.innerHTML = `
          <div class="space-y-3 animate-fade-in">
            <div class="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5">
              <span class="flex items-center gap-1"><span class="text-amber-400">⚡</span> Sofort aus lokalem Cache geladen (0 ms)</span>
              <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(cleanTerm).replace(/'/g, "\\'")}')" class="text-purple-400 hover:text-purple-200 font-bold hover:underline">Neu recherchieren ↺</button>
            </div>
            ${cached.html}
          </div>
        `;
      }
      return;
    }

    // 2. Schneller Lade-Zustand rendern
    if (container) {
      container.innerHTML = `
        <div class="p-8 text-center space-y-3 theme-panel rounded-3xl border border-purple-800/40 shadow-xl bg-gradient-to-b from-purple-950/20 to-noir-950">
          <div class="relative w-10 h-10 mx-auto">
            <div class="w-10 h-10 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center text-xs">✨</div>
          </div>
          <div class="space-y-1">
            <strong class="text-xs text-white block font-black">Analysiere: "${escapeHtml(cleanTerm)}"</strong>
            <p class="text-[11px] text-purple-300">Wissenschaftliche Einordnung, Reizanalyse & Sicherheitsregeln werden aufbereitet...</p>
          </div>
        </div>
      `;
    }

    var apiKey = getGeminiApiKey();

    var prompt = `
Du bist ein erfahrener, traumasensibler BDSM- und Sexualaufklärer sowie Paartherapeut.
Erkläre den Begriff bzw. die sexuelle/BDSM-Praktik für ein aufgeklärtes Paar auf Deutsch.
Begriff: "${cleanTerm}"
${contextDesc ? `Zusatzkontext aus dem Fragebogen: "${contextDesc}"` : ''}

Erstelle eine ansprechende, grafisch strukturierte Aufklärung genau im folgenden HTML-Format (nur reines HTML, keine Markdown-Backticks):

<div class="space-y-3 text-xs leading-relaxed">
  <!-- SÄULE 1: WAS IST DAS & SICHERHEIT -->
  <div class="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 shadow-md space-y-2.5">
    <div class="flex items-center gap-2 border-b border-indigo-900/60 pb-1.5">
      <span class="text-base">💡</span>
      <h4 class="text-indigo-200 font-extrabold text-xs uppercase tracking-wide">1. Was ist das & Sicherheitsmerkmale</h4>
    </div>
    <div class="space-y-2 text-slate-200 text-[11px] leading-relaxed">
      <p>[Hier in zusammenhängenden 5 bis maximal 15 Sätzen: Präzise, bildhafte und schamfreie Erklärung des Ablaufs und der Durchführung.]</p>
      <div class="p-2.5 rounded-xl bg-slate-900/80 border border-indigo-900/40 flex items-start gap-2">
        <span class="text-indigo-400 text-sm">🛡️</span>
        <div>
          <strong class="text-indigo-300 block text-[10.5px]">Sicherheit & Vorkehrungen:</strong>
          <span class="text-slate-300 text-[10.5px]">[Konkrete physische & psychologische Risikozonen, Nervenverläufe, Durchblutung, Safewords oder der transparente Hinweis, falls die Praktik ohne physische Risiken auskommt.]</span>
        </div>
      </div>
    </div>
  </div>

  <!-- SÄULE 2: SEXUELLER REIZ FÜR TOP & BOTTOM -->
  <div class="p-4 rounded-2xl bg-brand-950/40 border border-brand-900/60 shadow-md space-y-2.5">
    <div class="flex items-center gap-2 border-b border-brand-900/60 pb-1.5">
      <span class="text-base">🧠</span>
      <h4 class="text-brand-300 font-extrabold text-xs uppercase tracking-wide">2. Sexueller Reiz für Top & Bottom (Warum Menschen darauf stehen)</h4>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
      <div class="p-2.5 rounded-xl bg-slate-900/80 border border-rose-900/50 space-y-1">
        <div class="flex items-center gap-1.5 text-rose-300 font-bold">
          <span>👑</span><span>Reiz für den Top (Führung & Macht):</span>
        </div>
        <p class="text-slate-300 text-[10.5px]">[Was macht es für den führenden/aktiven Part erregend (z. B. Kontrolle, Dominanz, Reizmodulation, akustische/visuelle Hingabe des Partners)?]</p>
      </div>
      <div class="p-2.5 rounded-xl bg-slate-900/80 border border-indigo-900/50 space-y-1">
        <div class="flex items-center gap-1.5 text-indigo-300 font-bold">
          <span>🧎</span><span>Reiz für den Bottom (Hingabe & Empfangen):</span>
        </div>
        <p class="text-slate-300 text-[10.5px]">[Was reizt den empfangenden Part (z. B. mentale Entlastung von Alltagsverantwortung, sensorische Überwältigung, Subspace, Schmerzlust)?]</p>
      </div>
    </div>
    <div class="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/40 text-[10.5px] text-slate-300 italic">
      ✨ <strong class="text-purple-300 not-italic">Wissenschaftliche Normalisierung:</strong> [Neurobiologische und psychologische Entlastung von Schamgefühlen.]
    </div>
  </div>

  <!-- SÄULE 3: BEST PRACTICE ANLEITUNG FÜR DEN TOP -->
  <div class="p-4 rounded-2xl bg-teal-950/40 border border-teal-900/60 shadow-md space-y-2.5">
    <div class="flex items-center gap-2 border-b border-teal-900/60 pb-1.5">
      <span class="text-base">📋</span>
      <h4 class="text-teal-300 font-extrabold text-xs uppercase tracking-wide">3. Best Practice: Anleitung für den Top (Schritt-für-Schritt)</h4>
    </div>
    <div class="space-y-1.5 text-[11px] text-slate-300">
      <div class="flex items-start gap-2 p-2 rounded-xl bg-slate-900/70">
        <span class="w-4 h-4 rounded-full bg-teal-950 border border-teal-600 text-teal-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
        <div><strong class="text-teal-200">Vorbereitung & Konsens:</strong> [Equipment bereitlegen, Grenzen und Safewords vorab klären.]</div>
      </div>
      <div class="flex items-start gap-2 p-2 rounded-xl bg-slate-900/70">
        <span class="w-4 h-4 rounded-full bg-teal-950 border border-teal-600 text-teal-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
        <div><strong class="text-teal-200">Einstieg & Steigerung:</strong> [Wie die Intensität behutsam aufgebaut wird, ohne den Partner zu überfordern.]</div>
      </div>
      <div class="flex items-start gap-2 p-2 rounded-xl bg-slate-900/70">
        <span class="w-4 h-4 rounded-full bg-teal-950 border border-teal-600 text-teal-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
        <div><strong class="text-teal-200">Führung & Feedback:</strong> [Worauf der Top kontinuierlich achtet (Atmung, Muskelspannung, Augen, Signale).]</div>
      </div>
      <div class="flex items-start gap-2 p-2 rounded-xl bg-slate-900/70">
        <span class="w-4 h-4 rounded-full bg-teal-950 border border-teal-600 text-teal-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
        <div><strong class="text-teal-200">Ausklang & Aftercare:</strong> [Sicheres Beenden, Decken, Wärme und emotionales Auffangen.]</div>
      </div>
    </div>
  </div>
</div>

Wichtig: Ausschließlich auf Deutsch, wissenschaftlich fundiert, normalisierend, 0% Moralisieren. Gib nur den HTML-Code ohne \`\`\`html oder \`\`\` zurück.
`;

    var candidateModels = await resolveAvailableTextModels(apiKey);
    var success = false;
    var lastError = "Keine Verbindung zum KI-Dienst";

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      try {
        var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(apiKey);
        
        // Schnelligkeit: thinkingBudget: 0 schaltet das zeitfressende interne "Denken" der 2.5/Flash-Modelle ab
        var payload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
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

        // Falls das Modell thinkingConfig nicht unterstützt, einmal ohne senden
        if (!resp.ok && resp.status === 400) {
          delete payload.generationConfig.thinkingConfig;
          resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        if (resp.ok) {
          var data = await resp.json();
          var rawHtml = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          var cleanContent = rawHtml.replace(/```html/gi, '').replace(/```/g, '').trim();

          setCachedResult(cleanTerm, cleanContent);

          if (container) {
            container.innerHTML = `
              <div class="space-y-3">
                <div class="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5">
                  <span class="text-purple-300 font-semibold">✨ Frisch recherchiert & gesichert (${escapeHtml(model)})</span>
                  <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(cleanTerm).replace(/'/g, "\\'")}')" class="text-purple-400 hover:text-purple-200 font-bold hover:underline">Neu recherchieren ↺</button>
                </div>
                ${cleanContent}
              </div>
            `;
          }
          success = true;
          break;
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
          <p class="text-[10px] text-slate-400 mt-2">Prüfe in den Einstellungen (⚙️) deinen Gemini API-Key.</p>
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
