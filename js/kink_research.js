/**
 *  
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
    return 'kompass_kink_cache_' + term.toLowerCase().trim().replace(/[^a-z0-9äöüß]/gi, '_');
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

  /**
   * Führt die Gemini-Recherche durch
   */
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
              <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(cleanTerm)}')" class="text-purple-400 hover:text-white font-bold">Neu recherchieren ↺</button>
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
          <div class="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>
            <strong class="text-xs text-white block">KI recherchiert zu: "${escapeHtml(cleanTerm)}"</strong>
            <p class="text-[10.5px] text-purple-300 mt-0.5">Analysiert Ablauf, psychologischen Reiz und Sicherheitsregeln...</p>
          </div>
        </div>
      `;
    }

    var apiKey = getGeminiApiKey();
    var activeModel = localStorage.getItem('kompass_discovered_model') || 'gemini-2.5-flash';

    var prompt = `
Du bist ein erfahrener, einfühlsamer und traumasensibler BDSM- und Sexualaufklärer.
Erkläre den folgenden Begriff bzw. die sexuelle/BDSM-Praktik für ein aufgeklärtes Paar:
Begriff: "${cleanTerm}"
${contextDesc ? `Zusatzkontext aus dem Fragebogen: "${contextDesc}"` : ''}

Erstelle eine strukturierte, schamfreie und bildhafte Aufklärung in genau 3 Absätzen (formatiert mit sauberen Tailwind-Klassen):

1. <div class="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-900/60 space-y-1">
     <strong class="text-indigo-300 text-xs block">💡 1. Was ist das genau? (Ablauf & Bild)</strong>
     <p class="text-slate-300 text-[11px] leading-relaxed">...</p>
   </div>

2. <div class="p-3 rounded-2xl bg-brand-950/30 border border-brand-900/60 space-y-1">
     <strong class="text-brand-300 text-xs block">🧠 2. Psychologischer Reiz & Scham-Entlastung (Warum erregt das?)</strong>
     <p class="text-slate-300 text-[11px] leading-relaxed">...</p>
   </div>

3. <div class="p-3 rounded-2xl bg-teal-950/30 border border-teal-900/60 space-y-1">
     <strong class="text-teal-300 text-xs block">🛡️ 3. Sicherheit, Risiken & Spielregeln (Dos & Don'ts)</strong>
     <p class="text-slate-300 text-[11px] leading-relaxed">...</p>
   </div>

Wichtig: Wissenschaftlich fundiert, normalisierend, 0% Moralisieren oder Abwerten. Gib nur den HTML-Code zurück.
`;

    try {
      var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + activeModel + ':generateContent?key=' + encodeURIComponent(apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
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
                <span>✨ Frisch recherchiert & im Cache gesichert</span>
                <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(cleanTerm)}')" class="text-purple-400 hover:text-white font-bold">Neu recherchieren ↺</button>
              </div>
              ${cleanContent}
            </div>
          `;
        }
      } else {
        var errData = await resp.json().catch(function() { return {}; });
        var errMsg = errData.error?.message || ('HTTP ' + resp.status);
        if (container) {
          container.innerHTML = `
            <div class="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs space-y-1">
              <strong class="block font-bold">⚠️ Fehler bei der Recherche:</strong>
              <p class="text-[11px]">${escapeHtml(errMsg)}</p>
              <p class="text-[10px] text-slate-400 mt-2">Prüfe in den Einstellungen (⚙️) deinen Gemini API-Key.</p>
            </div>
          `;
        }
      }
    } catch (e) {
      if (container) {
        container.innerHTML = `
          <div class="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs">
            <strong>⚠️ Netzwerkfehler:</strong> Bitte Internetverbindung prüfen.
          </div>
        `;
      }
    }
  }

  function openModal(term, contextDesc) {
    var modal = document.getElementById('modal-lexikon');
    if (modal) modal.classList.remove('hidden');

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
    if (modal) modal.classList.add('hidden');
  }

  function renderDefaultWelcome(container) {
    container.innerHTML = `
      <div class="p-5 text-center space-y-2.5 theme-panel rounded-2xl border border-slate-800">
        <span class="text-2xl block">🔍</span>
        <strong class="text-xs text-white block">Gib oben einen beliebigen Begriff ein oder klicke auf ein Thema:</strong>
        <div class="flex flex-wrap gap-1.5 justify-center pt-1">
          <button type="button" onclick="KinkResearch.open('Breast-Smothering')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Breast-Smothering</button>
          <button type="button" onclick="KinkResearch.open('Takate Kote (Armbox)')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Takate Kote</button>
          <button type="button" onclick="KinkResearch.open('Ruined Orgasm')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Ruined Orgasm</button>
          <button type="button" onclick="KinkResearch.open('CBT (Ball Stretcher)')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">CBT</button>
          <button type="button" onclick="KinkResearch.open('Bratting & Bändigen')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Bratting</button>
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
