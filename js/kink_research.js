/**
 * js/kink_research.js
 * Spezialisiertes Modul für dynamische KI-Kink- & BDSM-Recherche.
 * 
 * Features:
 * - Dynamische Recherche beliebiger Praktiken & Begriffe über Google Gemini
 * - Lokales Caching im localStorage (0 ms Latenz & 0 Token-Verbrauch bei wiederholter Abfrage)
 * - Traumasensibler, schamfreier und wissenschaftlich fundierter Prompt (3-Säulen-Struktur)
 * - Direkte Anbindung an den Fragebogen (Klick auf '🔍 KI-Info' bei jeder Frage)
 * - Freie Suche mit Schnellauswahl-Chips im Recherche-Modal
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
          <div class="space-y-3">
            <div class="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
              <span>⚡ Aus lokalem Cache geladen (0 ms Latenz)</span>
              <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(cleanTerm).replace(/'/g, "\\'")}')" class="text-purple-400 hover:text-white font-bold">Neu recherchieren ↺</button>
            </div>
            ${cached.html}
          </div>
        `;
      }
      return;
    }

    // 2. Lade-Zustand rendern
    if (container) {
      container.innerHTML = `
        <div class="p-6 text-center space-y-3 theme-panel rounded-2xl border border-purple-900/50">
          <div class="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <strong class="text-xs text-white block">KI recherchiert zu: "${escapeHtml(cleanTerm)}"</strong>
            <p class="text-[10.5px] text-purple-300 mt-0.5">Analysiert Ablauf, psychologischen Reiz und Sicherheitsregeln...</p>
          </div>
        </div>
      `;
    }

    var apiKey = getGeminiApiKey();

    var prompt = `
Du bist ein erfahrener, traumasensibler BDSM- und Sexualaufklärer sowie Paartherapeut.
Erkläre den folgenden Begriff bzw. die sexuelle/BDSM-Praktik für ein aufgeklärtes Paar auf Deutsch:
Begriff: "${cleanTerm}"
${contextDesc ? `Zusatzkontext aus dem Fragebogen: "${contextDesc}"` : ''}

Erstelle eine strukturierte, schamfreie, fundierte und bildhafte Aufklärung (genau formatiert mit Tailwind-Klassen als reines HTML, keine Markdown-Fences):

1. <div class="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-900/60 space-y-2">
     <strong class="text-indigo-300 text-xs block font-extrabold">💡 1. Was ist das & Sicherheitsmerkmale (5–15 Sätze)</strong>
     <p class="text-slate-300 text-[11px] leading-relaxed">
       [Hier in zusammenhängenden 5 bis maximal 15 Sätzen: Präzise, bildhafte und schamfreie Erklärung der Praktik sowie aller dazugehörigen physischen & psychologischen Sicherheitsmerkmale, Risikozonen, Safeword-Regeln und Notfallvorkehrungen – oder der transparente Hinweis, falls die Praktik ohne physische Risiken auskommt.]
     </p>
   </div>

2. <div class="p-3.5 rounded-2xl bg-brand-950/30 border border-brand-900/60 space-y-2 mt-2.5">
     <strong class="text-brand-300 text-xs block font-extrabold">🧠 2. Sexueller Reiz für Top & Bottom (Warum Menschen darauf stehen)</strong>
     <div class="space-y-2 text-[11px] text-slate-300 leading-relaxed">
       <div class="p-2 rounded-xl bg-slate-900/70 border border-brand-950">
         <strong class="text-rose-300 block mb-0.5">👑 Reiz für den Top (Führung & Macht):</strong>
         [Was macht diese Praktik für den aktiven/führenden Part sexuell und psychologisch erregend (z. B. Dominanz, Kontrolle, akustische Reize, Hingabe des Partners sehen)?]
       </div>
       <div class="p-2 rounded-xl bg-slate-900/70 border border-indigo-950">
         <strong class="text-indigo-300 block mb-0.5">🧎 Reiz für den Bottom (Hingabe & Empfangen):</strong>
         [Was reizt den empfangenden/sich hingebenden Part daran (z. B. Loslassen von Alltagsverantwortung, sensorische Überwältigung, Schmerzlust, Unterwerfung)?]
       </div>
       <div class="text-slate-400 text-[10.5px] italic pt-1 border-t border-brand-900/40">
         ✨ <strong>Warum Menschen darauf stehen:</strong> [Wissenschaftliche, psychologische & neurobiologische Normalisierung (Scham-Entlastung).]
       </div>
     </div>
   </div>

3. <div class="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-900/60 space-y-2 mt-2.5">
     <strong class="text-teal-300 text-xs block font-extrabold">📋 3. Best Practice: Anleitung für den Top (Schritt-für-Schritt)</strong>
     <ul class="space-y-1.5 text-[11px] text-slate-300 leading-relaxed list-disc list-inside">
       <li><strong class="text-teal-200">1. Vorbereitung & Konsens:</strong> [Was klärt und bereitet der Top vorab vor (Equipment, Tabus, Safewords)?]</li>
       <li><strong class="text-teal-200">2. Einstieg & Steigerung:</strong> [Wie baut der Top die Intensität behutsam und kontrolliert auf, ohne zu überfordern?]</li>
       <li><strong class="text-teal-200">3. Führung & Feedback:</strong> [Worauf achtet der Top währenddessen kontinuierlich (Atmung, Vitalität, nonverbale Signale)?]</li>
       <li><strong class="text-teal-200">4. Ausklang & Aftercare:</strong> [Wie wird die Praktik sicher beendet und der Partner emotional & körperlich aufgefangen?]</li>
     </ul>
   </div>

Wichtig: Ausschließlich auf Deutsch, wissenschaftlich fundiert, normalisierend, 0% Moralisieren oder Abwerten. Gib nur den HTML-Code zurück.
`;

    var candidateModels = await resolveAvailableTextModels(apiKey);

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      try {
        var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + encodeURIComponent(apiKey);
        var resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (resp.ok) {
          var data = await resp.json();
          var rawHtml = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          var cleanContent = rawHtml.replace(/```html/g, '').replace(/```/g, '').trim();

          setCachedResult(cleanTerm, cleanContent);

          if (container) {
            container.innerHTML = `
              <div class="space-y-3">
                <div class="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                  <span>✨ Frisch recherchiert & im Cache gesichert (${escapeHtml(model)})</span>
                  <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(cleanTerm).replace(/'/g, "\\'")}')" class="text-purple-400 hover:text-white font-bold">Neu recherchieren ↺</button>
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
  }

  function renderDefaultWelcome(container) {
    container.innerHTML = `
      <div class="p-5 text-center space-y-2.5 theme-panel rounded-2xl border border-slate-800">
        <span class="text-2xl block">🔍</span>
        <strong class="text-xs text-white block">Gib oben einen Begriff ein oder wähle ein Thema:</strong>
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
