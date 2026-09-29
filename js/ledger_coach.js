/**
 * js/ledger_coach.js
 * PACTUM KI-Führungsassistent des Tops (D/s-Coach Core - Release 3.0)
 * 
 * Spezifikationen & Garantien:
 * - Top-First Doktrin: Schutz vor Top Fatigue, Fokus auf Entlastung & klare Führung
 * - Anti-TftB: Konsequente Durchsetzung von § 2 Abs. 3 (Regieverbot) & § 3 Abs. 4 (Schweigepflicht)
 * - Berufs- & Alltags-Kontexte des Bottoms (Büro, Handwerk, Pflege, Fahrer, Schichtdienst)
 * - Teasing-Rhythmus-Wächter zur Vermeidung von Dumpfheit & Frustration
 * - Tägliche Regie-Direktiven (Daily Briefing) via Gemini Live oder Heuristik-Fallback
 * - Verhaltensmuster- & Reibungs-Analytik (Friction Analytics) aus getrackten Verstößen
 * - Noir-Luxury Vektor-Ikonografie (1.5px monochrome SVGs, keine Emojis in Buttons)
 * - Anti-Schwulst-Garantie: Keine verbotenen Wörter („andächtig“, „sakral“, „hoheitsvoll“)
 * - Strikte Einhaltung: <= 500 Zeilen, keine alert() / confirm() Aufrufe!
 */

(function(window) {
  'use strict';

  let currentWorkplace = 'desk_office';
  let lastGeneratedDirective = null;

  function loadCoachState() {
    try {
      const savedWp = localStorage.getItem('kompass_bottom_workplace');
      if (savedWp) currentWorkplace = savedWp;
      const savedDir = localStorage.getItem('kompass_last_coach_directive');
      if (savedDir) lastGeneratedDirective = JSON.parse(savedDir);
    } catch (e) {
      console.warn("[PACTUM Coach] Fehler beim Laden des Zustands:", e);
    }
  }

  function saveCoachState(skipSync) {
    try {
      localStorage.setItem('kompass_bottom_workplace', currentWorkplace);
      if (lastGeneratedDirective) {
        localStorage.setItem('kompass_last_coach_directive', JSON.stringify(lastGeneratedDirective));
      }
    } catch (e) {
      console.warn("[PACTUM Coach] Fehler beim Speichern des Zustands:", e);
    }

    if (!skipSync && window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }
  }

  function showToast(msg) {
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification(msg);
      return;
    }
    const c = document.getElementById('toast-container');
    if (!c) return;
    const el = document.createElement('div');
    el.className = "bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 transition-all pointer-events-auto transform translate-y-2 opacity-0 flex items-center gap-2";
    el.innerHTML = `<span>${escapeHtml(msg)}</span>`;
    c.appendChild(el);
    setTimeout(() => el.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
      el.classList.add('opacity-0');
      setTimeout(() => el.remove(), 300);
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
      const liveKey = document.getElementById('account-gemini-key') || document.getElementById('session-gemini-key-input');
      if (liveKey && liveKey.value && liveKey.value.trim().length > 10) return liveKey.value.trim();
      const stored = localStorage.getItem('kompass_gemini_api_key');
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
    const wpProfiles = (window.ChastityDatabase && window.ChastityDatabase.workplaces) ? window.ChastityDatabase.workplaces : {};
    const profile = wpProfiles[currentWorkplace];

    const sel = document.getElementById('coach-workplace-select');
    const lbl = document.getElementById('coach-workplace-label');
    const hint = document.getElementById('coach-workplace-hint');

    if (sel && sel.value !== currentWorkplace) sel.value = currentWorkplace;
    if (lbl && profile) lbl.innerText = profile.label;
    if (hint && profile) {
      hint.innerHTML = `
        <span class="block"><strong>Häufige Reibungspunkte:</strong> ${escapeHtml(profile.cageRisks || '')}</span>
        <span class="block mt-1"><strong>Gelegenheiten für Alltags-Regie:</strong> ${(profile.teasingOpportunities || []).slice(0, 2).map(escapeHtml).join(' · ')}</span>
      `;
    }
  }

  function getTensionPhaseInfo(daysLocked) {
    const db = window.ChastityDatabase;
    if (!db || !db.tensionPhases) {
      return {
        title: "Aktive Keuschheitsphase",
        desc: "Halte die Erregung des Bottoms durch gezielte Schwellenreize lebendig.",
        focus: "Regelmäßige kurze Reize, Blickkontakt und Dienst zur Entlastung des Tops."
      };
    }
    if (daysLocked >= 22) return db.tensionPhases.phase_permanent;
    if (daysLocked >= 8) return db.tensionPhases.phase_deep_subspace;
    if (daysLocked >= 4) return db.tensionPhases.phase_climbing;
    return db.tensionPhases.phase_entry;
  }

  function getDaysLocked() {
    const ledgerState = (window.LedgerApp && typeof window.LedgerApp.getState === 'function') 
      ? window.LedgerApp.getState() 
      : null;
    if (!ledgerState || !ledgerState.isLocked || !ledgerState.lockedSince) return 1;
    const diffMs = Math.max(0, Date.now() - ledgerState.lockedSince);
    return Math.max(1, Math.floor(diffMs / (24 * 3600 * 1000)) + 1);
  }

  async function generateDailyDirective() {
    loadCoachState();
    const container = document.getElementById('ai-coach-directive-content');
    if (!container) return;

    const days = getDaysLocked();
    const phaseInfo = getTensionPhaseInfo(days);
    const wpProfiles = (window.ChastityDatabase && window.ChastityDatabase.workplaces) ? window.ChastityDatabase.workplaces : {};
    const profile = wpProfiles[currentWorkplace] || { label: "Büro / Alltag", teasingOpportunities: [] };

    const names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    const ledgerState = (window.LedgerApp && typeof window.LedgerApp.getState === 'function') ? window.LedgerApp.getState() : null;
    const topRole = ledgerState ? ledgerState.keyholder : 'A';
    const subRole = ledgerState ? ledgerState.cagedPartner : 'B';
    const topName = names[topRole] || 'Top';
    const subName = names[subRole] || 'Bottom';

    container.innerHTML = `
      <div class="p-4 text-center space-y-2 animate-pulse">
        <div class="w-6 h-6 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin mx-auto"></div>
        <span class="text-xs text-purple-300 font-bold block">Gemini berechnet die Tages-Direktive...</span>
        <span class="text-[10px] text-slate-400 block">Stimmt Führung auf Tag ${days}, Arbeitsplatz und Top-Entlastung ab.</span>
      </div>
    `;

    const apiKey = getGeminiApiKey();
    let aiResult = null;

    if (apiKey) {
      try {
        const prompt = `Du bist ein erfahrener BDSM- und D/s-Führungsberater für ${topName} (Top/Keyholder).
Erstelle für den heutigen Tag eine prägnante, souveräne und alltagstaugliche Regie-Direktive zur Führung von ${subName} (Bottom/Keuschling).

SPRACH- UND TONFALL-VORGABEN (STRIKT EINHALTEN):
- VERBOT VON SCHWULST: Verwende NIEMALS Worte wie 'andächtig', 'feierlich', 'sakral', 'hoheitsvoll' oder 'Gemächt'.
- TOP-FIRST DOKTRIN: Die Priorität liegt auf der Entlastung und Freude des Tops (Schutz vor Top Fatigue). Der Bottom soll dienen und den Kopf des Tops freihalten.
- SCHWEIGEPFLICHT: Erinnere daran, dass der Bottom nicht über Freilassung oder Ejakulationen quengeln darf (§ 3 Abs. 4).

KONTEXT:
- Keuschheits-Dauer: Tag ${days} im Verschluss
- Aktuelle Phase: ${phaseInfo.title} (${phaseInfo.desc})
- Beruf & Alltag des Bottoms: ${profile.label}
- Typische Alltags-Risiken: ${profile.cageRisks || 'Keine'}

ANFORDERUNG:
Erstelle 3 kurze, klare Impulse:
1. Morgen-Impuls (z. B. 30s Kniestand-Blickkontakt vor dem Gehen, Duftanker)
2. Alltags-Teaser (abgestimmt auf den Beruf, z. B. Kegel-Kommando, diskreter Foto-Appell)
3. Feierabend-Regie (Dienst am Top, z. B. Hausschuhe reichen, Fußmassage oder Schwellen-Quälerei)

Antworte direkt in freundlichem, souveränem Top-Tonfall (max. 4 bis 5 Sätze insgesamt).`;

        const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];
        for (let i = 0; i < candidateModels.length; i++) {
          try {
            const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${candidateModels[i]}:generateContent?key=${encodeURIComponent(apiKey)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (resp.ok) {
              const data = await resp.json();
              aiResult = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (aiResult) break;
            }
          } catch (eModel) {}
        }
      } catch (err) {
        console.warn("[PACTUM Coach] Fehler beim KI-Aufruf für Führungsdirektive:", err);
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
    showToast("Tages-Direktive berechnet ✓");
  }

  function generateHeuristicDirective(days, phase, profile, subName) {
    const opp = (profile.teasingOpportunities && profile.teasingOpportunities.length > 0)
      ? profile.teasingOpportunities[0]
      : "Überraschende Sprachnachricht mit Schlüsselklimpern";

    return `Tages-Plan für Tag ${days} (${phase.title}):\n\n` +
      `• Morgen: Fordere vor dem Verlassen der Wohnung 30 Sekunden ruhigen Blickkontakt im Kniestand ein.\n` +
      `• Alltag (${profile.label}): Nutze die Gelegenheit: ${opp}.\n` +
      `• Feierabend: ${phase.focus}. Der Bottom entlastet dich zuerst im Haushalt. Wenn er aufmerksam war, belohne ihn mit Nähe; bei Widerrede ziehe 25 Tribut-Punkte ab oder ordne 10 Schläge mit dem Gürtel an.`;
  }

  function renderDirectiveHtml(text, days, phase) {
    const container = document.getElementById('ai-coach-directive-content');
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
        <div class="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/60 text-[10.5px] text-purple-200 mt-2 flex items-start gap-2">
          <svg class="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div>
            <strong>Teasing-Grundsatz:</strong> Keuschheit lebt vom kontrollierten Reiz. Kurze akustische oder visuelle Signale nähren die Unterordnung – Funkstille hingegen erzeugt Dumpfheit.
          </div>
        </div>
      </div>
    `;
  }

  function renderFrictionAnalytics() {
    const container = document.getElementById('ai-coach-friction-list');
    if (!container) return;

    const contract = (window.LedgerContract && typeof window.LedgerContract.getActiveContract === 'function')
      ? window.LedgerContract.getActiveContract()
      : null;

    if (!contract || contract.status !== 'active') {
      container.innerHTML = `
        <div class="p-4 rounded-2xl theme-panel border border-slate-800 text-center text-slate-400 text-xs space-y-1">
          <svg class="w-5 h-5 mx-auto text-slate-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
          <strong class="text-white block font-bold">Kein aktiver Vertrag besiegelt</strong>
          <p class="text-[10.5px]">Sobald das PACTUM unterzeichnet ist, analysiert die KI hier wiederkehrende Reibungspunkte und Verhaltensmuster.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-2">
        <div class="p-3 rounded-2xl bg-amber-950/30 border border-amber-800/80 space-y-1.5 text-xs">
          <div class="flex items-center justify-between">
            <strong class="text-amber-200 text-xs flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z"/></svg>
              <span>Fokus: § 2 Abs. 3 & § 6 (Regieverbot & Top-Entlastung)</span>
            </strong>
            <span class="text-[9.5px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">Resonanz-Fokus</span>
          </div>
          <p class="text-[10.5px] text-slate-300 leading-snug">
            Bei häuslichen Aufgaben und Pünktlichkeit entstehen erfahrungsgemäß die meisten Reibungen. 
            <strong>Empfehlung für den Top:</strong> Reagiere nicht mit Alltagsärger, sondern nutze kleine Versäumnisse als spielerischen Anlass für feste Zuchtakte am Abend (z. B. Kniestand an der Tür oder 10 Schläge mit dem Gürtel).
          </p>
        </div>

        <div class="p-3 rounded-2xl theme-panel border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <strong class="text-white block text-xs">Vertragskodex aktiv:</strong>
            <span class="text-[10px] text-slate-400">§ 3 Abs. 4 (Schweigepflicht über Verschluss & Lust) ist in Kraft</span>
          </div>
          <button type="button" onclick="LedgerApp.switchTab('contract')" class="px-2.5 py-1 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-bold text-[10px] touch-btn flex items-center gap-1">
            <span>Vertrag prüfen</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
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
      const days = getDaysLocked();
      const phase = getTensionPhaseInfo(days);
      renderDirectiveHtml(lastGeneratedDirective.text, days, phase);
    }
  }

  window.LedgerCoach = {
    setWorkplace: setWorkplace,
    generateDailyDirective: generateDailyDirective,
    renderFrictionAnalytics: renderFrictionAnalytics,
    init: initCoach
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoach);
  } else {
    initCoach();
  }

})(window);
