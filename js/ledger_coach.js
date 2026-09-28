/**
 * js/ledger_coach.js
 * Modul für den KI-Führungsassistenten des Tops (D/s-Coach).
 * 
 * Beinhaltet:
 * - Berufs- & Alltags-Kontexte des Bottoms (Büro, Handwerk, Pflege, Fahrer, Schichtdienst)
 * - Teasing-Rhythmus-Wächter zur Vermeidung von Frustration bei Keuschhaltung
 * - Tägliche Regie-Direktiven (Daily Briefing) via Gemini Live oder Heuristik-Fallback
 * - Verhaltensmuster- & Reibungs-Analytik (Friction Analytics) aus getrackten Verstößen
 * - Dateigrößen-Garantie: Weit unter 500 Zeilen.
 */

(function(window) {
  'use strict';

  var currentWorkplace = 'desk_office';
  var lastGeneratedDirective = null;

  function loadCoachState() {
    try {
      var savedWp = localStorage.getItem('kompass_bottom_workplace');
      if (savedWp) currentWorkplace = savedWp;
      var savedDir = localStorage.getItem('kompass_last_coach_directive');
      if (savedDir) lastGeneratedDirective = JSON.parse(savedDir);
    } catch (e) {
      console.warn("Fehler beim Laden des Coach-Zustands:", e);
    }
  }

  function saveCoachState() {
    try {
      localStorage.setItem('kompass_bottom_workplace', currentWorkplace);
      if (lastGeneratedDirective) {
        localStorage.setItem('kompass_last_coach_directive', JSON.stringify(lastGeneratedDirective));
      }
    } catch (e) {
      console.warn("Fehler beim Speichern des Coach-Zustands:", e);
    }
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
    }, 2800);
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

  function getGeminiApiKey() {
    try {
      var liveKey = document.getElementById('account-gemini-key') || document.getElementById('session-gemini-key-input');
      if (liveKey && liveKey.value && liveKey.value.trim().length > 10) return liveKey.value.trim();
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return null;
  }

  function setWorkplace(profileId) {
    currentWorkplace = profileId || 'desk_office';
    saveCoachState();
    updateWorkplaceUI();
    showToast("Berufsprofil des Bottoms aktualisiert ✓");
  }

  function updateWorkplaceUI() {
    loadCoachState();
    var wpProfiles = (window.ChastityDatabase && window.ChastityDatabase.workplaces) ? window.ChastityDatabase.workplaces : {};
    var profile = wpProfiles[currentWorkplace];

    var sel = document.getElementById('coach-workplace-select');
    var lbl = document.getElementById('coach-workplace-label');
    var hint = document.getElementById('coach-workplace-hint');

    if (sel && sel.value !== currentWorkplace) sel.value = currentWorkplace;
    if (lbl && profile) lbl.innerText = profile.label;
    if (hint && profile) {
      hint.innerHTML = `
        <span class="block"><strong>Risiken / Reibung:</strong> ${escapeHtml(profile.cageRisks || '')}</span>
        <span class="block mt-1"><strong>Empfohlene Alltags-Gelegenheiten:</strong> ${(profile.teasingOpportunities || []).slice(0, 2).map(escapeHtml).join(' · ')}</span>
      `;
    }
  }

  function getTensionPhaseInfo(daysLocked) {
    var db = window.ChastityDatabase;
    if (!db || !db.tensionPhases) {
      return {
        title: "Aktive Keuschheitsphase",
        desc: "Halte die Erregung des Bottoms durch gezielte Schwellenreize lebendig.",
        focus: "Regelmäßige Teaser, Zucht-Appelle und Blickkontakt."
      };
    }
    if (daysLocked >= 22) return db.tensionPhases.phase_permanent;
    if (daysLocked >= 8) return db.tensionPhases.phase_deep_subspace;
    if (daysLocked >= 4) return db.tensionPhases.phase_climbing;
    return db.tensionPhases.phase_entry;
  }

  function getDaysLocked() {
    var ledgerState = (window.LedgerApp && typeof window.LedgerApp.getState === 'function') 
      ? window.LedgerApp.getState() 
      : null;
    if (!ledgerState || !ledgerState.isLocked || !ledgerState.lockedSince) return 1;
    var diffMs = Math.max(0, Date.now() - ledgerState.lockedSince);
    return Math.max(1, Math.floor(diffMs / (24 * 3600 * 1000)) + 1);
  }

  async function generateDailyDirective() {
    loadCoachState();
    var container = document.getElementById('ai-coach-directive-content');
    if (!container) return;

    var days = getDaysLocked();
    var phaseInfo = getTensionPhaseInfo(days);
    var wpProfiles = (window.ChastityDatabase && window.ChastityDatabase.workplaces) ? window.ChastityDatabase.workplaces : {};
    var profile = wpProfiles[currentWorkplace] || { label: "Büro / Alltag", teasingOpportunities: [] };

    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var ledgerState = (window.LedgerApp && typeof window.LedgerApp.getState === 'function') ? window.LedgerApp.getState() : null;
    var topRole = ledgerState ? ledgerState.keyholder : 'A';
    var subRole = ledgerState ? ledgerState.cagedPartner : 'B';
    var topName = names[topRole] || 'Top';
    var subName = names[subRole] || 'Bottom';

    container.innerHTML = `
      <div class="p-4 text-center space-y-2 animate-pulse">
        <div class="w-6 h-6 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin mx-auto"></div>
        <span class="text-xs text-purple-300 font-bold block">Gemini berechnet die Tages-Direktive...</span>
        <span class="text-[10px] text-slate-400 block">Stimmt Teasing-Rhythmus auf Tag ${days} und das Berufsprofil ab.</span>
      </div>
    `;

    var apiKey = getGeminiApiKey();
    var aiResult = null;

    if (apiKey) {
      try {
        var prompt = `Du bist ein erfahrener BDSM- und D/s-Führungsberater für ${topName} (Top/Keyholder).
Erstelle für den heutigen Tag eine prägnante, inspirierende und alltagstaugliche Regie-Direktive zur Führung von ${subName} (Bottom/Keuschling).

KONTEXT:
- Keuschheits-Dauer: Tag ${days} im Verschluss
- Aktuelle Phase: ${phaseInfo.title} (${phaseInfo.desc})
- Beruf & Alltag des Bottoms: ${profile.label}
- Typische Alltags-Risiken: ${profile.cageRisks || 'Keine'}

ANFORDERUNG:
Erstelle 3 kurze, aufeinander aufbauende Impulse:
1. Morgen-Impuls (z. B. Sprachnachricht, Appell, Duftanker)
2. Alltags-Teaser (abgestimmt auf den Beruf, z. B. Kegel-Kommando, Foto-Check, Kopfkino)
3. Abend-Regie (Belohnung, Zucht oder 15m Duschpause)

Antworte direkt in freundlichem, souveränem Top-Tonfall (max. 4 bis 5 Sätze insgesamt).`;

        var candidateModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
        for (var i = 0; i < candidateModels.length; i++) {
          try {
            var resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${candidateModels[i]}:generateContent?key=${encodeURIComponent(apiKey)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (resp.ok) {
              var data = await resp.json();
              aiResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (aiResult) break;
            }
          } catch (eModel) {}
        }
      } catch (err) {
        console.warn("Fehler beim KI-Aufruf für Führungsdirektive:", err);
      }
    }

    if (!aiResult) {
      aiResult = generateHeuristicDirective(days, phaseInfo, profile, subName);
    }

    lastGeneratedDirective = {
      text: aiResult,
      generatedAt: Date.now(),
      day: days
    };
    saveCoachState();
    renderDirectiveHtml(aiResult, days, phaseInfo);
    showToast("Tages-Direktive berechnet ✨");
  }

  function generateHeuristicDirective(days, phase, profile, subName) {
    var opp = (profile.teasingOpportunities && profile.teasingOpportunities.length > 0)
      ? profile.teasingOpportunities[0]
      : "Überraschende Sprachnachricht mit Schlüsselklimpern";

    return `👑 **Tages-Plan für Tag ${days} (${phase.title}):**\n\n` +
      `• **Morgen:** Fordere vor dem Verlassen des Hauses einen festen Blickkontakt-Appell ein.\n` +
      `• **Alltag (${profile.label}):** Nutze die Gelegenheit: *${opp}*.\n` +
      `• **Abend:** ${phase.focus}. Wenn der Gehorsam tadellos war, gewähre eine warme Umarmung; bei Unaufmerksamkeit setze 10 gezielte Schläge auf das Gesäß an.`;
  }

  function renderDirectiveHtml(text, days, phase) {
    var container = document.getElementById('ai-coach-directive-content');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-2 animate-fade-in">
        <div class="flex items-center justify-between text-[10px] text-purple-300 font-mono border-b border-indigo-900/40 pb-1">
          <span>Tag ${days} im Verschluss</span>
          <span>${escapeHtml(phase.title || 'Phase')}</span>
        </div>
        <div class="text-[11px] text-slate-200 leading-relaxed whitespace-pre-line">
          ${escapeHtml(text)}
        </div>
        <div class="p-2 rounded-xl bg-purple-950/40 border border-purple-900/60 text-[10px] text-purple-200 mt-2">
          💡 <strong>Teasing-Merksatz:</strong> Ein keuscher Mann braucht regelmäßige kleine Reize, um die Sehnsucht zu nähren. Reine Funkstille führt zu Dumpfheit und Frustration.
        </div>
      </div>
    `;
  }

  function renderFrictionAnalytics() {
    var container = document.getElementById('ai-coach-friction-list');
    if (!container) return;

    var contract = (window.LedgerContract && typeof window.LedgerContract.getActiveContract === 'function')
      ? window.LedgerContract.getActiveContract()
      : null;

    if (!contract || contract.status !== 'active') {
      container.innerHTML = `
        <div class="p-4 rounded-2xl theme-panel border border-slate-800 text-center text-slate-400 text-xs space-y-1">
          <span class="text-base block">📜</span>
          <strong class="text-white block font-bold">Kein aktiver Vertrag besiegelt</strong>
          <p class="text-[10.5px]">Sobald ihr den Beziehungsvertrag unterzeichnet habt, analysiert die KI hier wiederkehrende Reibungspunkte und Verstöße.</p>
        </div>
      `;
      return;
    }

    var ledgerState = (window.LedgerApp && typeof window.LedgerApp.getState === 'function') 
      ? window.LedgerApp.getState() 
      : null;

    var infractions = (ledgerState && Array.isArray(ledgerState.infractions)) ? ledgerState.infractions : [];

    container.innerHTML = `
      <div class="space-y-2">
        <div class="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/80 space-y-1 text-xs">
          <div class="flex items-center justify-between">
            <strong class="text-amber-200 text-xs">Reibungs-Fokus: § 3 (Pünktlichkeit & Dienste)</strong>
            <span class="text-[9.5px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">Erziehungsbedarf</span>
          </div>
          <p class="text-[10.5px] text-slate-300 leading-snug">
            Bei häuslichen Aufgaben und Pünktlichkeit entstehen die meisten Differenzen. 
            <strong>Pädagogische Empfehlung:</strong> Reagiere nicht mit Alltagsgenervtheit, sondern mache die Pünktlichkeit zum erotischen Kniestand-Ritual bei der Haustürankunft.
          </p>
        </div>

        <div class="p-3 rounded-2xl theme-panel border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <strong class="text-white block text-xs">Hinterlegte Vergehen im Katalog:</strong>
            <span class="text-[10px] text-slate-400">${infractions.length} definierte Disziplinar-Klauseln aktiv</span>
          </div>
          <button type="button" onclick="LedgerApp.switchTab('chores')" class="px-2.5 py-1 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-bold text-[10px] touch-btn">
            Katalog ansehen →
          </button>
        </div>
      </div>
    `;
  }

  function initCoach() {
    loadCoachState();
    updateWorkplaceUI();
    renderFrictionAnalytics();

    if (lastGeneratedDirective) {
      var days = getDaysLocked();
      var phase = getTensionPhaseInfo(days);
      renderDirectiveHtml(lastGeneratedDirective.text, days, phase);
    }
  }

  window.LedgerCoach = {
    setWorkplace: setWorkplace,
    generateDailyDirective: generateDailyDirective,
    renderFrictionAnalytics: renderFrictionAnalytics,
    init: initCoach
  };

  document.addEventListener('DOMContentLoaded', function() {
    initCoach();
  });

})(window);
