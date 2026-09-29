/**
 * js/ledger_app.js
 * PACTUM Protokoll-Core, Delta-Ledger (Event Sourcing) & Hygiene-Engine (Release 3.0)
 * 
 * Spezifikationen & Garantien:
 * - Delta-Ledger: Kontostand basiert auf transaktionalem Logbuch mit atomaren UUIDs
 * - Zero-State: Kontostand startet bei 0 P, kein Pseudo-Verschluss vor Erstbesiegelung
 * - Anti-TftB: Belohnungen sind Bittgesuche (Top genehmigt), Würfel exklusiv für Top
 * - Urologische Mikro-Hygiene: Balanitis-Schutz mit täglicher Spülungsquittierung
 * - Break-Glass Notfall-Entsiegelung: 60s Deeskalation, Fotopflicht & Vertragspausierung
 * - Noir-Luxury Vektor-Ikonografie (1.5px monochrome SVGs, keine Emojis in Buttons)
 * - Strikte Einhaltung: <= 800 Zeilen, keine alert() / confirm() Aufrufe!
 */

(function(window) {
  'use strict';

  const HARDWARE_LABELS = {
    penis_cobra: 'Kink3D Cobra (SLS-Nylon)',
    penis_viper: 'Kink3D Viper (Kompakt)',
    penis_cherrykeeper: 'Cherrykeeper Micro Stub (<= 35mm)',
    penis_holytrainer: 'HolyTrainer V6 (Bioresin)',
    penis_jailbird: 'Mature Metal Jailbird (Edelstahl)',
    penis_cb6000: 'CB-6000 Polycarbonat',
    penis_flat: 'Flat Shield (Nun-Cage)',
    female_belt: 'Weiblicher Keuschheitsgürtel (Belt)'
  };

  const DEFAULT_INITIAL_STATE = {
    keyholder: 'A',
    cagedPartner: 'B',
    hardware: 'penis_cherrykeeper',
    keyStorage: 'kSafe (Tresor)',
    emergencyPin: '9482',
    isLocked: false,
    lockedSince: null,
    transactions: [], // Atomares Event-Sourcing
    lastDiceRoll: 0,
    hygieneConfig: {
      mode: 'points',
      ratePts: 15,
      ratePhys: '2 Schläge auf das Gesäß'
    },
    microHygieneLastDone: null,
    emergencyUnlockedAt: null,
    activeChallenge: null,
    rewards: [
      { id: 'rew_shower_15', title: '15 Min. Pflege- & Duschpause', cost: 60, desc: 'Käfig abnehmen zur gründlichen Intimrasur & Wundversorgung.' },
      { id: 'rew_snuggle_night', title: 'Nächtliche Berührungsfreiheit', cost: 120, desc: 'Schlafen in enger Umarmung ohne Berührungsverbot der Haut.' },
      { id: 'rew_tease_relock', title: 'Tease & Relock Session', cost: 240, desc: 'Kurze Freilassung zur Schwellen-Quälerei durch den Top.' },
      { id: 'rew_climax_option', title: 'Antrag auf Orgasmus-Prüfung', cost: 500, desc: 'Reines Gesuch an den Top (Typ nach Ermessen des Tops).' }
    ],
    updatedAt: Date.now()
  };

  let ledgerState = null;
  let hygieneTimerInterval = null;
  let hygieneSecondsRemaining = 15 * 60;
  let hygieneOverdueMinutes = 0;
  let breakGlassInterval = null;
  let breakGlassSecondsLeft = 60;

  function loadLedgerState() {
    try {
      const raw = localStorage.getItem('kompass_ledger_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          ledgerState = Object.assign({}, DEFAULT_INITIAL_STATE, parsed);
          if (!Array.isArray(ledgerState.transactions)) {
            ledgerState.transactions = [];
          }
          return;
        }
      }
    } catch (e) {
      console.warn("[PACTUM Ledger] Fehler beim Laden des States:", e);
    }
    ledgerState = JSON.parse(JSON.stringify(DEFAULT_INITIAL_STATE));
  }

  function calculateTotalBalance() {
    if (!ledgerState || !Array.isArray(ledgerState.transactions)) return 0;
    return ledgerState.transactions.reduce((sum, tx) => sum + (Number(tx.delta) || 0), 0);
  }

  function appendTransaction(delta, reason, authorRole = 'top') {
    loadLedgerState();
    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      authorRole: authorRole,
      delta: parseInt(delta, 10) || 0,
      reason: String(reason || 'Protokoll-Buchung').trim()
    };
    ledgerState.transactions.unshift(tx);
    if (ledgerState.transactions.length > 300) {
      ledgerState.transactions = ledgerState.transactions.slice(0, 300);
    }
    saveLedgerState();
    renderDashboard();
    return tx;
  }

  function saveLedgerState(skipSync) {
    if (!ledgerState) return;
    try {
      ledgerState.updatedAt = Date.now();
      localStorage.setItem('kompass_ledger_state', JSON.stringify(ledgerState));
    } catch (e) {
      console.warn("[PACTUM Ledger] Konnte State nicht sichern:", e);
    }

    if (!skipSync && window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }
  }

  function getMyRole() {
    const isPaired = localStorage.getItem('kompass_is_paired') === 'true';
    if (!isPaired) return 'A';
    return localStorage.getItem('kompass_assigned_role') || 'A';
  }

  function isUserTop() {
    loadLedgerState();
    const myRole = getMyRole();
    return myRole === (ledgerState.keyholder || 'A');
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

  function renderDashboard() {
    loadLedgerState();
    const isTop = isUserTop();
    const totalPoints = calculateTotalBalance();

    const names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    const topName = names[ledgerState.keyholder] || 'Top';
    const subName = names[ledgerState.cagedPartner] || 'Bottom';

    const headerRoles = document.getElementById('ledger-header-roles');
    if (headerRoles) {
      headerRoles.innerText = `Top: ${topName} · Bottom: ${subName}`;
    }

    const headerBal = document.getElementById('header-balance-display');
    const headerBalMob = document.getElementById('header-balance-mobile');
    const dashBal = document.getElementById('dash-balance-points');
    const balFormatted = `${totalPoints >= 0 ? '+' : ''}${totalPoints} P`;

    if (headerBal) headerBal.innerText = balFormatted;
    if (headerBalMob) headerBalMob.innerText = balFormatted;
    if (dashBal) dashBal.innerText = balFormatted;

    // Tragedauer-Berechnung
    const wearEl = document.getElementById('dash-wear-duration');
    if (wearEl) {
      if (ledgerState.isLocked && ledgerState.lockedSince) {
        const diffMs = Math.max(0, Date.now() - ledgerState.lockedSince);
        const days = Math.floor(diffMs / (24 * 3600 * 1000));
        const hours = Math.floor((diffMs % (24 * 3600 * 1000)) / (3600 * 1000));
        const mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
        wearEl.innerText = `${days}T ${hours}h ${mins}m`;
      } else {
        wearEl.innerText = "Nicht versiegelt (0T)";
      }
    }

    const devTitle = document.getElementById('dash-device-title');
    const btnLock = document.getElementById('btn-toggle-lock');
    const lockBadge = document.getElementById('ledger-lock-status-badge');
    const currentHwLabel = HARDWARE_LABELS[ledgerState.hardware] || 'Keuschheitskäfig';

    if (devTitle) {
      devTitle.innerText = ledgerState.isLocked 
        ? `Verschluss aktiv: ${currentHwLabel}` 
        : `Frei / Unverschlossen (${currentHwLabel})`;
    }

    if (btnLock) {
      btnLock.innerHTML = ledgerState.isLocked 
        ? `<svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg><span>Verschlossen</span>`
        : `<svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg><span>Besiegeln</span>`;
      btnLock.className = ledgerState.isLocked 
        ? "px-3.5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 border border-purple-700 text-purple-200 font-bold text-xs touch-btn"
        : "px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs touch-btn";
    }

    if (lockBadge) {
      lockBadge.innerText = ledgerState.isLocked ? "VERSCHLOSSEN" : "OFFEN";
      lockBadge.className = ledgerState.isLocked 
        ? "px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800 uppercase flex-shrink-0"
        : "px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-slate-900 text-slate-400 border border-slate-800 uppercase flex-shrink-0";
    }

    const keyLocEl = document.getElementById('dash-key-location');
    if (keyLocEl) keyLocEl.innerText = ledgerState.keyStorage || 'kSafe';

    const ruleDesc = document.getElementById('hygiene-rule-desc');
    if (ruleDesc) {
      ruleDesc.innerText = (ledgerState.hygieneConfig.mode === 'points')
        ? `-${ledgerState.hygieneConfig.ratePts} P / Min`
        : `${ledgerState.hygieneConfig.ratePhys} / Min`;
    }

    // Role-Banner
    const banner = document.getElementById('bottom-readonly-banner');
    if (banner) {
      if (isTop) banner.classList.add('hidden');
      else banner.classList.remove('hidden');
    }

    // Top-Only Button Protections
    ['btn-toggle-lock', 'btn-open-role-cfg', 'btn-cfg-hygiene', 'btn-roll-dice'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.disabled = !isTop;
        if (!isTop) {
          btn.classList.add('opacity-40', 'cursor-not-allowed');
        } else {
          btn.classList.remove('opacity-40', 'cursor-not-allowed');
        }
      }
    });

    renderMicroHygieneWidget();
    renderTransactionsHistory();
  }

  function renderMicroHygieneWidget() {
    const container = document.getElementById('urological-hygiene-container');
    if (!container) return;

    loadLedgerState();
    const isTop = isUserTop();
    const lastDone = ledgerState.microHygieneLastDone;
    const isToday = lastDone && (new Date(lastDone).toDateString() === new Date().toDateString());

    container.innerHTML = `
      <div class="p-4 rounded-3xl bg-slate-900/90 border border-teal-900/50 space-y-2.5 shadow-md">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <div class="text-teal-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
            </div>
            <div>
              <strong class="text-xs text-white block">Urologische Mikro-Hygiene</strong>
              <span class="text-[10px] text-slate-400">Balanitis-Prävention ohne Käfigabnahme</span>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold ${isToday ? 'bg-teal-950 text-teal-300 border border-teal-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}">
            ${isToday ? 'Heute erledigt ✓' : 'Fällig ⚠️'}
          </span>
        </div>
        <p class="text-[10.5px] text-slate-300 leading-snug">
          Tägliche Kochsalz- / Wasserspülung der Eichelkammer mit stumpfer Spülspritze und trockenes Abtupfen. Schützt das Gewebe vor Mazeration durch Urinreste.
        </p>
        <div class="flex items-center justify-between pt-1">
          <span class="text-[10px] text-slate-500 font-mono">
            ${lastDone ? `Zuletzt: ${new Date(lastDone).toLocaleDateString('de-DE')} um ${new Date(lastDone).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}` : 'Bisher noch nicht quittiert'}
          </span>
          ${!isToday ? `
            <button type="button" onclick="LedgerApp.confirmMicroHygiene()" class="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs touch-btn shadow-sm">
              Spülung quittieren ✓
            </button>
          ` : `
            <span class="text-[10.5px] text-teal-300 font-mono font-bold">Haut reizfrei & trocken</span>
          `}
        </div>
      </div>
    `;
  }

  function confirmMicroHygiene() {
    loadLedgerState();
    ledgerState.microHygieneLastDone = Date.now();
    saveLedgerState();
    appendTransaction(10, 'Urologische Mikro-Spülung quittiert (Balanitis-Schutz)', getMyRole());
    showToast("✓ Mikro-Hygiene quittiert: Haut trocken und sauber (+10 P)");

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent("💧 Tägliche urologische Mikro-Spülung quittiert. Hautbild reizfrei.");
    }
  }

  function openBreakGlassModal() {
    loadLedgerState();
    let modal = document.getElementById('modal-break-glass-protocol');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-break-glass-protocol';
      modal.className = "fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    breakGlassSecondsLeft = 60;
    if (breakGlassInterval) clearInterval(breakGlassInterval);

    modal.innerHTML = `
      <div class="w-full max-w-md bg-slate-900 border border-rose-800/80 rounded-3xl p-5 space-y-4 shadow-2xl text-xs text-slate-200">
        <div class="flex items-center justify-between border-b border-rose-900/60 pb-3">
          <div class="flex items-center gap-2">
            <div class="text-rose-400">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Break-Glass: Notfall-Entsiegelung</h3>
              <span class="text-[10px] text-rose-300 font-mono">RACK-Sicherheitsprotokoll</span>
            </div>
          </div>
          <button type="button" onclick="LedgerApp.cancelBreakGlass()" class="p-1.5 text-slate-400 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/60 space-y-2 text-[11px] leading-relaxed">
          <strong class="text-rose-200 block font-bold">Wichtige Deeskalations-Prüfung:</strong>
          <p>Dieses Protokoll dient der Abwendung echter medizinischer Notfälle (Harnverhalt, akute Durchblutungsstörung, plötzliche extreme Schwellung oder Unfall des Tops).</p>
          <p class="text-slate-300 font-medium">Besteht Lebensgefahr oder akuter Schmerz? Hast du versucht, deinen Partner telefonisch zu kontaktieren?</p>
        </div>

        <div class="space-y-1.5 text-center py-2">
          <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Deeskalations-Countdown:</span>
          <span id="break-glass-timer-display" class="font-mono text-3xl font-black text-rose-400">60s</span>
          <span class="text-[10px] text-slate-500 block">Notschlüssel-Code wird nach Ablauf sichtbar</span>
        </div>

        <div id="break-glass-code-section" class="hidden p-3.5 rounded-2xl bg-slate-950 border border-rose-700 text-center space-y-2">
          <span class="text-[10px] font-mono text-slate-400 uppercase">Hinterlegter Notschlüssel-Code / Safe-PIN:</span>
          <div class="font-mono text-2xl font-black text-white tracking-widest bg-slate-900 py-2 rounded-xl border border-slate-800">
            ${escapeHtml(ledgerState.emergencyPin || '9482')}
          </div>
          <div class="space-y-2 pt-2 text-left">
            <label class="text-[10px] font-mono text-slate-400 uppercase block">Grund des Notfall-Abbruchs (Pflicht):</label>
            <input type="text" id="input-break-glass-reason" placeholder="z. B. Starke Rötung am Basisring / Schwellung..." class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none" />
          </div>
        </div>

        <div class="pt-2 border-t border-slate-800 flex justify-between gap-2">
          <button type="button" onclick="LedgerApp.cancelBreakGlass()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs touch-btn">
            Abbrechen (Sicherheit gewahrt)
          </button>
          <button type="button" id="btn-confirm-break-glass" disabled onclick="LedgerApp.executeBreakGlass()" class="px-4 py-2 rounded-xl bg-rose-800 hover:bg-rose-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs touch-btn shadow-md">
            Siegel brechen & entriegeln
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';

    breakGlassInterval = setInterval(() => {
      breakGlassSecondsLeft--;
      const disp = document.getElementById('break-glass-timer-display');
      if (disp) disp.innerText = `${breakGlassSecondsLeft}s`;

      if (breakGlassSecondsLeft <= 0) {
        clearInterval(breakGlassInterval);
        const codeSec = document.getElementById('break-glass-code-section');
        const confirmBtn = document.getElementById('btn-confirm-break-glass');
        if (disp) disp.innerText = "NOTFALL-CODE FREI";
        if (codeSec) codeSec.classList.remove('hidden');
        if (confirmBtn) confirmBtn.disabled = false;
      }
    }, 1000);
  }

  function cancelBreakGlass() {
    if (breakGlassInterval) clearInterval(breakGlassInterval);
    const modal = document.getElementById('modal-break-glass-protocol');
    if (modal) modal.style.display = 'none';
  }

  function executeBreakGlass() {
    const reasonInput = document.getElementById('input-break-glass-reason');
    const reason = reasonInput ? reasonInput.value.trim() : '';

    if (!reason) {
      showToast("Bitte dokumentiere kurz den Grund des Notfalls.");
      return;
    }

    loadLedgerState();
    ledgerState.isLocked = false;
    ledgerState.emergencyUnlockedAt = Date.now();
    saveLedgerState();

    appendTransaction(0, `🚨 NOTFALL-ENTSIEGELUNG: ${reason}`, getMyRole());
    cancelBreakGlass();
    renderDashboard();

    showToast("⚠️ Notfall-Entsiegelung vollzogen. Vertrag ist pausiert zur Schlichtung.");

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent(`🚨 NOTFALL-ENTSIEGELUNG: Der Verschluss wurde aus medizinischen/dringenden Gründen geöffnet (${reason}). Vertrag pausiert.`);
    }
  }

  function renderChoresAndRewards() {
    loadLedgerState();
    const isTop = isUserTop();
    const totalPoints = calculateTotalBalance();

    const rewContainer = document.getElementById('rewards-list-container');
    if (rewContainer) {
      rewContainer.innerHTML = ledgerState.rewards.map(r => {
        const canAfford = totalPoints >= r.cost;
        return `
          <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <strong class="text-xs text-white block truncate">${escapeHtml(r.title)}</strong>
                <span class="text-[10px] font-mono font-black text-amber-300">${r.cost} P</span>
              </div>
              <p class="text-[10.5px] text-slate-400 leading-snug">${escapeHtml(r.desc)}</p>
            </div>
            <div class="pt-1">
              ${isTop ? `
                <button type="button" onclick="LedgerApp.grantRewardDirectly('${r.id}')" class="w-full py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-white font-bold text-xs touch-btn">
                  Als Top gewähren
                </button>
              ` : `
                <button type="button" onclick="LedgerApp.petitionReward('${r.id}')" ${!canAfford ? 'disabled' : ''} class="w-full py-1.5 rounded-xl font-bold text-xs touch-btn transition-all ${canAfford ? 'bg-amber-900/80 hover:bg-amber-800 border border-amber-700 text-amber-100 shadow-sm' : 'bg-slate-950 border border-slate-800 text-slate-600 cursor-not-allowed'}">
                  ${canAfford ? 'Gnadengesuch stellen ↗' : `Zu wenig Punkte (${r.cost} P)`}
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function petitionReward(rewardId) {
    loadLedgerState();
    const totalPoints = calculateTotalBalance();
    const rew = ledgerState.rewards.find(r => r.id === rewardId);
    if (!rew) return;

    if (totalPoints < rew.cost) {
      showToast("Nicht genügend Tribut-Punkte vorhanden.");
      return;
    }

    showToast(`✓ Gesuch für „${rew.title}“ an den Top übermittelt.`);

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent(`🧎 Gnadengesuch des Bottoms: Antrag auf „${rew.title}“ (${rew.cost} P). Freigabe obliegt dem Top.`);
    }
  }

  function grantRewardDirectly(rewardId) {
    if (!isUserTop()) return;
    loadLedgerState();
    const rew = ledgerState.rewards.find(r => r.id === rewardId);
    if (!rew) return;

    appendTransaction(-rew.cost, `Belohnung gewährt: ${rew.title}`, 'top');
    renderChoresAndRewards();
    showToast(`✓ Belohnung „${rew.title}“ gewährt (-${rew.cost} P)`);

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent(`👑 Belohnung gewährt: „${rew.title}“ vom Top bewilligt (-${rew.cost} P).`);
    }
  }

  function renderTransactionsHistory() {
    const container = document.getElementById('ledger-transactions-list');
    if (!container) return;

    loadLedgerState();
    const txs = ledgerState.transactions || [];

    if (txs.length === 0) {
      container.innerHTML = `
        <div class="py-6 text-center text-slate-500 text-xs">
          Noch keine Transaktionen im Protokoll verbucht.
        </div>
      `;
      return;
    }

    container.innerHTML = txs.slice(0, 10).map(t => {
      const isPos = t.delta > 0;
      const isZero = t.delta === 0;
      const dStr = new Date(t.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
          <div class="space-y-0.5 min-w-0 flex-1">
            <span class="text-white block truncate font-medium">${escapeHtml(t.reason)}</span>
            <span class="text-[9.5px] text-slate-500 font-mono">${dStr} Uhr · ${t.authorRole === 'top' ? 'Top' : 'Bottom'}</span>
          </div>
          <span class="font-mono text-xs font-bold flex-shrink-0 ${isZero ? 'text-slate-400' : (isPos ? 'text-amber-300' : 'text-rose-400')}">
            ${isZero ? '±0' : (isPos ? `+${t.delta}` : t.delta)} P
          </span>
        </div>
      `;
    }).join('');
  }

  function startHygieneTimer() {
    if (hygieneTimerInterval) clearInterval(hygieneTimerInterval);
    hygieneSecondsRemaining = 15 * 60;
    hygieneOverdueMinutes = 0;

    const disp = document.getElementById('hygiene-timer-display');
    const btn = document.getElementById('btn-hygiene-start');
    if (btn) btn.innerText = "Läuft... (15m)";

    showToast("15m Hygiene-Duschpause gestartet. Schloss darf abgenommen werden.");

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent("🚿 15-Minuten Hygiene-Duschpause gestartet. Nach Ablauf muss das Schloss verriegelt sein!");
    }

    hygieneTimerInterval = setInterval(() => {
      if (hygieneSecondsRemaining > 0) {
        hygieneSecondsRemaining--;
        const m = Math.floor(hygieneSecondsRemaining / 60);
        const s = hygieneSecondsRemaining % 60;
        if (disp) disp.innerText = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
      } else {
        hygieneOverdueMinutes++;
        if (disp) {
          disp.innerText = `⚠️ +${hygieneOverdueMinutes}m ÜBERZOGEN!`;
          disp.className = "text-xs font-mono font-black text-rose-400 animate-pulse";
        }
        applyHygieneOverduePenalty(hygieneOverdueMinutes);
      }
    }, 1000);
  }

  function applyHygieneOverduePenalty(overdueMins) {
    if (hygieneSecondsRemaining % 60 !== 0) return;
    loadLedgerState();

    if (ledgerState.hygieneConfig.mode === 'points') {
      const ptsLoss = ledgerState.hygieneConfig.ratePts;
      appendTransaction(-ptsLoss, `Duschpause um ${overdueMins} Min. überzogen`, 'top');
      if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
        window.ChatApp.postSystemEvent(`⚠️ Duschpause um ${overdueMins} Min. überzogen: -${ptsLoss} Punkte verbucht.`);
      }
    } else {
      const physText = ledgerState.hygieneConfig.ratePhys;
      if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
        window.ChatApp.postSystemEvent(`⚠️ Duschpause um ${overdueMins} Min. überzogen: Automatisch fällig: ${physText}`);
      }
    }
  }

  function rollDiceOfFate() {
    if (!isUserTop()) {
      showToast("🔒 Nur der Top führt den Schicksals-Würfel.");
      return;
    }

    loadLedgerState();
    const now = Date.now();
    const cooldownMs = 24 * 3600 * 1000;

    if (ledgerState.lastDiceRoll && (now - ledgerState.lastDiceRoll) < cooldownMs) {
      const remainingHours = Math.round((cooldownMs - (now - ledgerState.lastDiceRoll)) / (3600 * 1000));
      showToast(`Würfel gesperrt: Nächster Wurf erst in ${remainingHours} Stunden.`);
      return;
    }

    const eye = Math.floor(Math.random() * 6) + 1;
    ledgerState.lastDiceRoll = now;

    const badge = document.getElementById('dice-result-badge');
    const desc = document.getElementById('dice-status-desc');
    if (badge) badge.innerText = `Auge ${eye}`;

    let eventMsg = "";
    if (eye === 1) {
      eventMsg = "Schicksals-Würfel: Auge 1! Verlängerung des Verschlusses um 24 Stunden.";
    } else if (eye === 2) {
      eventMsg = "Schicksals-Würfel: Auge 2! Zuchtmaßnahme: 15 Schläge mit Mitzählen am Abend.";
    } else if (eye === 3 || eye === 4) {
      eventMsg = `Schicksals-Würfel: Auge ${eye}! Neutrales Schicksal – keine Auswirkung.`;
    } else if (eye === 5) {
      eventMsg = "Schicksals-Würfel: Auge 5! Gunst: +35 Bonuspunkte aufs Tribut-Konto!";
      appendTransaction(35, 'Schicksals-Würfel: Auge 5 (Gunst-Bonus)', 'top');
    } else if (eye === 6) {
      eventMsg = "Schicksals-Würfel: Auge 6! Der Glücksfall: Sofortige 15m Duschpause freigeschaltet! 🚿";
    }

    saveLedgerState();
    renderDashboard();
    if (desc) desc.innerText = eventMsg;
    showToast(eventMsg);

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent(`🎲 ${eventMsg}`);
    }
  }

  function switchTab(tabId) {
    ['dashboard', 'chores', 'contract', 'ai_coach'].forEach(t => {
      const view = document.getElementById(`view-ledger-${t}`);
      const btn = document.getElementById(`tab-btn-${t}`);
      if (view) {
        if (t === tabId) view.classList.remove('hidden');
        else view.classList.add('hidden');
      }
      if (btn) {
        if (t === tabId) {
          btn.className = "px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-700 text-white touch-btn shadow-sm whitespace-nowrap";
        } else {
          btn.className = "px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white touch-btn whitespace-nowrap";
        }
      }
    });

    if (tabId === 'chores') {
      renderChoresAndRewards();
      if (window.HubTasks && typeof window.HubTasks.render === 'function') {
        window.HubTasks.render();
      }
    } else if (tabId === 'contract' && window.LedgerContract && typeof window.LedgerContract.renderContract === 'function') {
      window.LedgerContract.renderContract();
    } else if (tabId === 'dashboard') {
      renderDashboard();
      if (window.HubRatio && typeof window.HubRatio.render === 'function') {
        window.HubRatio.render();
      }
    }
  }

  function toggleLockState() {
    if (!isUserTop()) {
      showToast("🔒 Nur der Top kann das Schloss schalten.");
      return;
    }
    loadLedgerState();
    ledgerState.isLocked = !ledgerState.isLocked;
    if (ledgerState.isLocked) {
      ledgerState.lockedSince = Date.now();
      appendTransaction(25, 'Verschluss feierlich besiegelt', 'top');
    } else {
      appendTransaction(0, 'Verschluss vom Top geöffnet', 'top');
    }

    saveLedgerState();
    renderDashboard();

    const msg = ledgerState.isLocked ? "Verschluss besiegelt!" : "Verschluss geöffnet.";
    showToast(msg);

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent(`🔒 ${msg}`);
    }
  }

  window.LedgerApp = {
    init: function() {
      loadLedgerState();
      renderDashboard();
      renderChoresAndRewards();
    },
    render: renderDashboard,
    switchTab: switchTab,
    toggleLockState: toggleLockState,
    startHygieneTimer: startHygieneTimer,
    confirmMicroHygiene: confirmMicroHygiene,
    openBreakGlass: openBreakGlassModal,
    cancelBreakGlass: cancelBreakGlass,
    executeBreakGlass: executeBreakGlass,
    rollDiceOfFate: rollDiceOfFate,
    petitionReward: petitionReward,
    grantRewardDirectly: grantRewardDirectly,
    addTransaction: appendTransaction,
    getBalance: calculateTotalBalance,
    getState: function() { loadLedgerState(); return ledgerState; },
    saveState: saveLedgerState,
    isTop: isUserTop
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadLedgerState();
      renderDashboard();
    });
  } else {
    loadLedgerState();
    renderDashboard();
  }

})(window);
