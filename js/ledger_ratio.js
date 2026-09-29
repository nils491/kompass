/**
 * js/ledger_ratio.js
 * PACTUM Orgasmus-Ratio & Lust-Regie Engine (Release 3.0 Core Bundle)
 * 
 * Features & Spezifikationen:
 * - Führt das Verhältnis von Top- zu Bottom-Orgasmen (Ratio = N_Top : N_Sub)
 * - Präzise Typisierung von Höhepunkten: 'full' (Vollwertig), 'ruined' (Ruined Orgasm),
 *   'prostate' (Anal/Prostata), 'denial' (Lustverweigerung)
 * - Konfigurierbare Ziel-Ratio des Tops (z. B. 2:1, 4:1, 6:1, 8:1, 15:1 oder Zeit)
 * - Bereitstellung für 2 Erfassungsorte:
 *   1. Schlafzimmer-Regie (Aftercare-Modal in session.html via 1-Tap)
 *   2. Protokoll-Dashboard (ledger.html via Schnellverbuchung)
 * - Anti-TftB-Schutz: Rechnerische Zielerreichung ist kein einklagbarer Anspruch des Bottoms
 * - Noir-Luxury Vektor-Ikonografie (1.5px SVGs, keine Emojis in Buttons)
 * - Strikte Einhaltung: <= 800 Zeilen, keine alert() / confirm() Aufrufe!
 */

(function(window) {
  'use strict';

  const CLIMAX_TYPES = {
    full: {
      id: 'full',
      label: 'Vollwertige Freigabe',
      shortLabel: 'Vollwertig',
      desc: 'Erlaubter, vollständiger Orgasmus mit freier Entladung',
      badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-800'
    },
    ruined: {
      id: 'ruined',
      label: 'Ruined Orgasm',
      shortLabel: 'Ruined',
      desc: 'Am Point of no Return schlagartig abgebrochene Reizung',
      badgeClass: 'bg-rose-950 text-rose-300 border-rose-800'
    },
    prostate: {
      id: 'prostate',
      label: 'Anal / Prostata',
      shortLabel: 'Prostata',
      desc: 'Orgasmus ohne manuelle/direkte Reizung der Genitalvorderseite',
      badgeClass: 'bg-purple-950 text-purple-300 border-purple-800'
    },
    denial: {
      id: 'denial',
      label: 'Lustverweigerung (Denial)',
      shortLabel: 'Denial',
      desc: 'Schwellen-Heranführung mit anschließendem kaltem Stopp ohne Ejakulation',
      badgeClass: 'bg-slate-900 text-slate-300 border-slate-700'
    }
  };

  const DEFAULT_RATIO_PRESETS = [
    { target: 2, label: 'Milde Führung (2:1)', desc: 'Für Genuss-D/s & behutsamen Einstieg' },
    { target: 4, label: 'Klassische D/s (4:1)', desc: 'Fokus auf Antizipation & Hingabe' },
    { target: 6, label: 'Klassische FLR (6:1)', desc: 'Standard der Orgasmus-Ökonomie' },
    { target: 8, label: 'Strikte Disziplin (8:1)', desc: 'Wochenlange Enthaltsamkeit des Bottoms' },
    { target: 15, label: 'Langzeit-Keuschheit (15:1)', desc: 'Extremer Triebaufschub & Monats-Challenges' }
  ];

  let ratioState = {
    targetRatio: 6, // Top:Sub = 6:1 Standard
    topClimaxCount: 0,
    subClimaxCount: 0,
    history: [],
    updatedAt: Date.now()
  };

  function loadRatioState() {
    try {
      const raw = localStorage.getItem('kompass_climax_ratio_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          ratioState = {
            targetRatio: typeof parsed.targetRatio === 'number' ? parsed.targetRatio : 6,
            topClimaxCount: typeof parsed.topClimaxCount === 'number' ? Math.max(0, parsed.topClimaxCount) : 0,
            subClimaxCount: typeof parsed.subClimaxCount === 'number' ? Math.max(0, parsed.subClimaxCount) : 0,
            history: Array.isArray(parsed.history) ? parsed.history : [],
            updatedAt: parsed.updatedAt || Date.now()
          };
          return;
        }
      }
    } catch (e) {
      console.warn("[PACTUM Ratio] Fehler beim Laden von kompass_climax_ratio_state:", e);
    }

    ratioState = {
      targetRatio: 6,
      topClimaxCount: 0,
      subClimaxCount: 0,
      history: [],
      updatedAt: Date.now()
    };
  }

  function saveRatioState() {
    try {
      ratioState.updatedAt = Date.now();
      localStorage.setItem('kompass_climax_ratio_state', JSON.stringify(ratioState));
    } catch (e) {
      console.warn("[PACTUM Ratio] Konnte State nicht sichern:", e);
    }

    if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }
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

  function showToast(message) {
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification(message);
      return;
    }
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = "bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 transition-all pointer-events-auto transform translate-y-2 opacity-0 flex items-center gap-2";
    el.innerHTML = `<span>${escapeHtml(message)}</span>`;
    container.appendChild(el);

    setTimeout(() => el.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
      el.classList.add('opacity-0');
      setTimeout(() => el.remove(), 300);
    }, 2800);
  }

  function recordClimax({ beneficiary = 'top', type = 'full', note = '', source = 'manual' }) {
    loadRatioState();

    const verifiedType = CLIMAX_TYPES[type] ? type : 'full';
    const timestamp = Date.now();

    const entry = {
      id: `clx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      beneficiary: beneficiary === 'sub' ? 'sub' : 'top',
      type: verifiedType,
      note: note.trim(),
      source: source,
      timestamp: timestamp
    };

    if (entry.beneficiary === 'top') {
      ratioState.topClimaxCount++;
    } else {
      ratioState.subClimaxCount++;
    }

    ratioState.history.unshift(entry);
    if (ratioState.history.length > 100) {
      ratioState.history = ratioState.history.slice(0, 100);
    }

    saveRatioState();
    renderRatioDashboardWidgets();

    const roleName = entry.beneficiary === 'top' ? 'Top' : 'Bottom';
    const typeLabel = CLIMAX_TYPES[verifiedType].label;
    showToast(`✓ Höhepunkt für ${roleName} gebucht: ${typeLabel}`);

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent(`⚖️ Orgasmus-Ökonomie: Höhepunkt für ${roleName} (${typeLabel}) verbucht. Saldo: ${ratioState.topClimaxCount} : ${ratioState.subClimaxCount}`);
    }

    return entry;
  }

  function setTargetRatio(targetNumber) {
    loadRatioState();
    const num = parseInt(targetNumber, 10);
    if (!isNaN(num) && num >= 1 && num <= 50) {
      ratioState.targetRatio = num;
      saveRatioState();
      renderRatioDashboardWidgets();
      showToast(`Ziel-Ratio auf ${num} : 1 festgelegt ✓`);
    }
  }

  function calculateRatioProgress() {
    loadRatioState();
    const target = Math.max(1, ratioState.targetRatio);
    const topCount = ratioState.topClimaxCount;
    const subCount = ratioState.subClimaxCount;

    // Wie viele Top-Höhepunkte seit dem letzten Sub-Höhepunkt
    const requiredTopTotal = (subCount + 1) * target;
    const currentInCycle = topCount - (subCount * target);
    const progressInCycle = Math.max(0, currentInCycle);
    const percentage = Math.min(100, Math.round((progressInCycle / target) * 100));
    const isTargetMet = progressInCycle >= target;

    return {
      topCount,
      subCount,
      target,
      currentInCycle: Math.max(0, currentInCycle),
      percentage,
      isTargetMet,
      remainingInCycle: Math.max(0, target - progressInCycle)
    };
  }

  function renderRatioDashboardWidgets() {
    const container = document.getElementById('ledger-ratio-widget-container');
    const calc = calculateRatioProgress();

    if (container) {
      container.innerHTML = `
        <div class="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="space-y-0.5">
              <span class="text-[9.5px] font-mono uppercase tracking-wider text-purple-400 font-bold block">Orgasmus-Ökonomie</span>
              <h3 class="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Top-Verhältnis:</span>
                <span class="font-mono text-purple-300 text-sm sm:text-base">${calc.topCount} : ${calc.subCount}</span>
                <span class="text-[10px] text-slate-500 font-mono font-normal">(Ziel: ${calc.target} : 1)</span>
              </h3>
            </div>
            <div class="flex items-center gap-1.5">
              <button type="button" onclick="HubRatio.openConfigModal()" title="Ziel-Verhältnis anpassen" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white touch-btn">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"/></svg>
              </button>
              <button type="button" onclick="HubRatio.openLogClimaxModal('top')" class="px-3 py-1.5 rounded-xl bg-purple-900/90 hover:bg-purple-800 border border-purple-700 text-white font-bold text-xs flex items-center gap-1.5 touch-btn shadow-sm">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                <span>Top +1</span>
              </button>
            </div>
          </div>

          <!-- Fortschrittsbalken zum aktuellen Zyklus -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-400 font-medium text-[11px]">Zyklus-Quote: ${calc.currentInCycle} von ${calc.target} Top-Höhepunkten</span>
              <span class="font-mono text-xs font-bold ${calc.isTargetMet ? 'text-emerald-400' : 'text-purple-300'}">${calc.percentage}%</span>
            </div>
            <div class="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div class="h-full rounded-full transition-all duration-500 ${calc.isTargetMet ? 'bg-gradient-to-r from-emerald-600 to-teal-400' : 'bg-gradient-to-r from-purple-700 to-brand-500'}" style="width: ${Math.max(4, calc.percentage)}%;"></div>
            </div>
          </div>

          <!-- Status-Hinweis mit Anti-TftB Schutzklausel -->
          <div class="p-3 rounded-2xl border text-[11px] leading-relaxed flex items-start gap-2.5 ${calc.isTargetMet ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-slate-950/60 border-slate-800/80 text-slate-400'}">
            <div class="mt-0.5 flex-shrink-0 text-purple-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/></svg>
            </div>
            <div class="space-y-0.5">
              ${calc.isTargetMet 
                ? `<strong>Zielquote erreicht:</strong> Der Top darf nach freiem Ermessen über eine Freigabe für den Bottom entscheiden (kein Rechtsanspruch des Bottoms, § 3 Abs. 4).`
                : `Noch <strong>${calc.remainingInCycle} Höhepunkte für den Top</strong> bis zur rechnerischen Freigabe-Option.`}
            </div>
          </div>

          <!-- Schnellerfassung für Bottom-Höhepunkt -->
          <div class="flex items-center justify-between pt-1 text-xs">
            <span class="text-[10.5px] text-slate-500 font-mono">Bottom-Protokoll:</span>
            <button type="button" onclick="HubRatio.openLogClimaxModal('sub')" class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-medium text-[11px] flex items-center gap-1 touch-btn">
              <span>+ Bottom-Höhepunkt erfassen</span>
            </button>
          </div>
        </div>
      `;
    }
  }

  function openConfigModal() {
    loadRatioState();
    let modal = document.getElementById('modal-ratio-config');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-ratio-config';
      modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl text-xs">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="space-y-0.5">
            <h3 class="text-sm font-bold text-white">Ziel-Ratio konfigurieren</h3>
            <span class="text-[10px] text-slate-400">Wie viele Höhepunkte genießt der Top pro Bottom-Freigabe?</span>
          </div>
          <button type="button" onclick="document.getElementById('modal-ratio-config').style.display='none'" class="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="space-y-2">
          ${DEFAULT_RATIO_PRESETS.map(preset => `
            <button type="button" onclick="HubRatio.selectPreset(${preset.target})" class="w-full p-3 rounded-2xl border text-left transition-all touch-btn flex items-center justify-between ${ratioState.targetRatio === preset.target ? 'bg-purple-950/60 border-purple-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'}">
              <div class="space-y-0.5">
                <strong class="text-xs text-white block">${escapeHtml(preset.label)}</strong>
                <span class="text-[10px] text-slate-400">${escapeHtml(preset.desc)}</span>
              </div>
              <span class="text-xs font-mono font-bold ${ratioState.targetRatio === preset.target ? 'text-purple-300' : 'text-slate-600'}">
                ${ratioState.targetRatio === preset.target ? '✓' : '○'}
              </span>
            </button>
          `).join('')}
        </div>

        <div class="pt-2 border-t border-slate-800 flex justify-end">
          <button type="button" onclick="document.getElementById('modal-ratio-config').style.display='none'" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs touch-btn">
            Fertig
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  function openLogClimaxModal(role = 'top') {
    let modal = document.getElementById('modal-log-climax');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-log-climax';
      modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    const isTop = (role === 'top');

    modal.innerHTML = `
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl text-xs">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="space-y-0.5">
            <h3 class="text-sm font-bold text-white">Höhepunkt erfassen (${isTop ? 'Top' : 'Bottom'})</h3>
            <span class="text-[10px] text-slate-400">Wähle Typisierung und Kontext</span>
          </div>
          <button type="button" onclick="document.getElementById('modal-log-climax').style.display='none'" class="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="space-y-2">
          <label class="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block">Typ des Höhepunkts:</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${Object.values(CLIMAX_TYPES).map(t => `
              <button type="button" id="btn-clx-type-${t.id}" onclick="HubRatio.selectModalType('${t.id}')" class="p-2.5 rounded-xl border text-left transition-all ${t.id === 'full' ? 'bg-purple-950/60 border-purple-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'}">
                <strong class="text-xs block text-white">${escapeHtml(t.shortLabel)}</strong>
                <span class="text-[9.5px] text-slate-400 leading-tight block mt-0.5">${escapeHtml(t.desc)}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-[10.5px] font-mono text-slate-400 uppercase tracking-wider block">Notiz (optional):</label>
          <input type="text" id="input-clx-note" placeholder="z. B. Nach Cunnilingus-Dienst / Schwellen-Quälerei..." class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-purple-600 focus:outline-none" />
        </div>

        <input type="hidden" id="input-clx-selected-type" value="full" />
        <input type="hidden" id="input-clx-selected-role" value="${isTop ? 'top' : 'sub'}" />

        <div class="pt-2 border-t border-slate-800 flex justify-end gap-2">
          <button type="button" onclick="document.getElementById('modal-log-climax').style.display='none'" class="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs touch-btn">
            Abbrechen
          </button>
          <button type="button" onclick="HubRatio.submitModalClimax()" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs touch-btn shadow-md">
            Höhepunkt buchen ✓
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  function selectModalType(typeId) {
    const input = document.getElementById('input-clx-selected-type');
    if (input) input.value = typeId;

    Object.keys(CLIMAX_TYPES).forEach(id => {
      const btn = document.getElementById(`btn-clx-type-${id}`);
      if (btn) {
        if (id === typeId) {
          btn.className = "p-2.5 rounded-xl border text-left transition-all bg-purple-950/60 border-purple-600 text-white shadow-sm";
        } else {
          btn.className = "p-2.5 rounded-xl border text-left transition-all bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700";
        }
      }
    });
  }

  function submitModalClimax() {
    const typeInput = document.getElementById('input-clx-selected-type');
    const roleInput = document.getElementById('input-clx-selected-role');
    const noteInput = document.getElementById('input-clx-note');

    const type = typeInput ? typeInput.value : 'full';
    const role = roleInput ? roleInput.value : 'top';
    const note = noteInput ? noteInput.value : '';

    recordClimax({ beneficiary: role, type: type, note: note, source: 'dashboard' });

    const modal = document.getElementById('modal-log-climax');
    if (modal) modal.style.display = 'none';
  }

  function selectPreset(targetNumber) {
    setTargetRatio(targetNumber);
    const modal = document.getElementById('modal-ratio-config');
    if (modal) modal.style.display = 'none';
  }

  window.HubRatio = {
    init: function() {
      loadRatioState();
      renderRatioDashboardWidgets();
    },
    record: recordClimax,
    setTarget: setTargetRatio,
    getProgress: calculateRatioProgress,
    render: renderRatioDashboardWidgets,
    openConfigModal: openConfigModal,
    openLogClimaxModal: openLogClimaxModal,
    selectModalType: selectModalType,
    submitModalClimax: submitModalClimax,
    selectPreset: selectPreset,
    getTypes: function() { return CLIMAX_TYPES; },
    getHistory: function() { loadRatioState(); return ratioState.history; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadRatioState();
      renderRatioDashboardWidgets();
    });
  } else {
    loadRatioState();
    renderRatioDashboardWidgets();
  }

})(window);
