/**
 * js/ledger_app.js
 * Kern-Engine für das D/s- & Keuschheits-Dashboard des Kink- & Beziehungs-Kompasses.
 * 
 * Beinhaltet:
 * - Zentrale Top-Steuerung, Switch-Pausierung & schreibgeschützter Einblick für Bottom
 * - Tragedauer-Zähler (Tage, Stunden, Minuten) & Schloss-Status
 * - Hygiene-Duschpause (15m) mit konfigurierbarer Überziehungs-Matrix (Punkte/Schläge je Min)
 * - Schicksals-Würfel (24h-Intervall) mit automatischer Chat-Benachrichtigung
 * - Aufgaben-, Vergehen- & Belohnungs-Shop Verwaltung
 * - Strafen-Verhandlung & Ablass-Buchung mit Paar-Logbuch-Export
 * - Dateigrößen-Garantie: Weit unter 500 Zeilen.
 */

(function(window) {
  'use strict';

  var DEFAULT_LEDGER_STATE = {
    keyholder: 'A',
    cagedPartner: 'B',
    hardware: 'penis_micro',
    keyStorage: 'kSafe (72h)',
    isLocked: true,
    lockedSince: Date.now() - (3 * 24 * 3600 * 1000), // 3 Tage Default
    balance: 120,
    lastDiceRoll: 0,
    hygieneConfig: {
      mode: 'points', // 'points' oder 'physical'
      ratePts: 15,
      ratePhys: '2 Schläge auf das Gesäß'
    },
    activeChallenge: {
      title: 'Locktober Strict (Herbst-Disziplin)',
      hoursTotal: 72,
      endsAt: Date.now() + (48 * 3600 * 1000)
    },
    lastClimax: {
      timestamp: Date.now() - (5 * 24 * 3600 * 1000),
      type: 'ruined',
      note: 'In Session #12 mit Magic Wand am Point of no Return abgebrochen.'
    },
    chores: [
      { id: 'c1', title: 'Küche & Bad gründlich reinigen', points: 30, cat: 'household' },
      { id: 'c2', title: '20 Min. Fußmassage für den Top', points: 25, cat: 'service' },
      { id: 'c3', title: 'Morgenappell pünktlich um 07:00 (Kniestand)', points: 15, cat: 'discipline' },
      { id: 'c4', title: '50 Liegestütze oder 5 km Joggen', points: 20, cat: 'fitness' }
    ],
    infractions: [
      { id: 'i1', title: 'Widerrede / Freche Antwort', points: -25, penalty: '15 Schläge', clause: '§ 3 Abs. 1' },
      { id: 'i2', title: 'Unpünktlichkeit / Trödeln', points: -20, penalty: '10 Schläge', clause: '§ 3 Abs. 3' },
      { id: 'i3', title: 'Unerlaubtes Berühren des Verschlusses', points: -50, penalty: '+24h Käfig', clause: '§ 6 Abs. 2' }
    ],
    rewards: [
      { id: 'r1', title: '15 Min. Pflege- & Duschpause', cost: 60, desc: 'Käfig abnehmen zur Intimrasur' },
      { id: 'r2', title: 'Kuscheln im Bett ohne Berührungsverbot', cost: 120, desc: 'Eine Nacht ganz nah' },
      { id: 'r3', title: 'Tease & Relock Session in der Regie', cost: 250, desc: 'Süße Schwellenquälerei' },
      { id: 'r4', title: 'Erlaubte Höhepunkt-Freigabe', cost: 600, desc: 'Nach Wahl des Tops' }
    ]
  };

  var state = null;
  var hygieneTimerInterval = null;
  var hygieneSecondsRemaining = 15 * 60;
  var hygieneOverdueMinutes = 0;
  var activeNegotiatingInfraction = null;

  function loadLedgerState() {
    try {
      var raw = localStorage.getItem('kompass_ledger_state');
      if (raw) state = JSON.parse(raw);
    } catch (e) {}

    if (!state || typeof state !== 'object') {
      state = JSON.parse(JSON.stringify(DEFAULT_LEDGER_STATE));
    }
    // Sicherstellen, dass alle Unterstrukturen vorhanden sind
    if (!state.hygieneConfig) state.hygieneConfig = { mode: 'points', ratePts: 15, ratePhys: '2 Schläge auf das Gesäß' };
    if (!state.chores) state.chores = DEFAULT_LEDGER_STATE.chores;
    if (!state.infractions) state.infractions = DEFAULT_LEDGER_STATE.infractions;
    if (!state.rewards) state.rewards = DEFAULT_LEDGER_STATE.rewards;
  }

  function saveLedgerState(skipSync) {
    if (!state) return;
    state.updatedAt = Date.now();
    try {
      localStorage.setItem('kompass_ledger_state', JSON.stringify(state));
    } catch (e) {}

    if (!skipSync && window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }
  }

  function getMyRole() {
    var isPaired = localStorage.getItem('kompass_is_paired') === 'true';
    if (!isPaired) return 'A'; // Ungekoppelt: Standard Top A
    return localStorage.getItem('kompass_assigned_role') || 'A';
  }

  function isUserTop() {
    loadLedgerState();
    return getMyRole() === state.keyholder;
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
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderDashboard() {
    loadLedgerState();
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var topName = names[state.keyholder] || 'Partner ' + state.keyholder;
    var subName = names[state.cagedPartner] || 'Partner ' + state.cagedPartner;

    // Header Rollen & Balance
    var headerRoles = document.getElementById('ledger-header-roles');
    if (headerRoles) headerRoles.innerText = "Keyholder: " + topName + " · Keuschling: " + subName;

    var headerBal = document.getElementById('header-balance-display');
    var headerBalMob = document.getElementById('header-balance-mobile');
    var dashBal = document.getElementById('dash-balance-points');
    var balText = (state.balance >= 0 ? '+' : '') + state.balance + ' P';

    if (headerBal) headerBal.innerText = balText;
    if (headerBalMob) headerBalMob.innerText = balText;
    if (dashBal) dashBal.innerText = balText;

    // Tragedauer-Berechnung
    var wearEl = document.getElementById('dash-wear-duration');
    if (wearEl) {
      if (state.isLocked && state.lockedSince) {
        var diffMs = Math.max(0, Date.now() - state.lockedSince);
        var days = Math.floor(diffMs / (24 * 3600 * 1000));
        var hours = Math.floor((diffMs % (24 * 3600 * 1000)) / (3600 * 1000));
        var mins = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
        wearEl.innerText = days + "T " + hours + "h " + mins + "m";
      } else {
        wearEl.innerText = "Frei (0T)";
      }
    }

    // Schloss-Titel & Button
    var devTitle = document.getElementById('dash-device-title');
    var btnLock = document.getElementById('btn-toggle-lock');
    var lockBadge = document.getElementById('ledger-lock-status-badge');

    var hwLabels = {
      penis_curved: 'Ergonomic Curved Peniskäfig',
      penis_micro: 'Cherrykeeper Micro Stub (<= 35mm)',
      penis_flat: 'Flat Shield Keuschheitsschild',
      penis_inverted: 'Inverted Negativ-Käfig',
      female_belt: 'Weiblicher Keuschheitsgürtel'
    };
    var currentHwLabel = hwLabels[state.hardware] || 'Keuschheitskäfig';

    if (devTitle) {
      devTitle.innerText = state.isLocked ? ("Verschluss aktiv: " + currentHwLabel) : ("Aktuell entsperrt: " + currentHwLabel);
    }
    if (btnLock) {
      btnLock.innerText = state.isLocked ? "🔒 Verschlossen" : "🔓 Entriegelt";
      btnLock.className = state.isLocked 
        ? "px-3.5 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-700 text-rose-200 font-extrabold text-xs touch-btn"
        : "px-3.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 font-extrabold text-xs touch-btn";
    }
    if (lockBadge) {
      lockBadge.innerText = state.isLocked ? "🔒 AKTIV" : "🔓 FREI";
      lockBadge.className = state.isLocked 
        ? "px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-950 text-purple-300 border border-purple-800 uppercase flex-shrink-0"
        : "px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase flex-shrink-0";
    }

    // Key Location & Challenge
    var keyLocEl = document.getElementById('dash-key-location');
    if (keyLocEl) keyLocEl.innerText = state.keyStorage || 'kSafe (72h)';

    var chalEl = document.getElementById('dash-challenge-title');
    var chalBox = document.getElementById('active-challenge-box');
    if (state.activeChallenge && state.activeChallenge.title) {
      if (chalEl) chalEl.innerText = state.activeChallenge.title;
      if (chalBox) {
        var remainingHrs = Math.max(0, Math.round((state.activeChallenge.endsAt - Date.now()) / (3600 * 1000)));
        chalBox.className = "p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/80 space-y-1";
        chalBox.innerHTML = `
          <div class="flex items-center justify-between">
            <strong class="text-xs text-purple-200 block">${escapeHtml(state.activeChallenge.title)}</strong>
            <span class="text-[10px] font-mono text-purple-300 font-bold">Noch ${remainingHrs}h</span>
          </div>
          <span class="text-[10.5px] text-slate-300 block">Strafen und Verlängerungen werden in Echtzeit addiert.</span>
        `;
      }
    }

    // Orgasmus-Chronik
    var clDate = document.getElementById('dash-climax-date');
    var clDesc = document.getElementById('dash-climax-details');
    if (state.lastClimax && state.lastClimax.timestamp) {
      var dStr = new Date(state.lastClimax.timestamp).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      var tLabels = { ruined: '🥀 Ruined Orgasm', full: '✨ Volle Freigabe', prostate: '🍑 Anal / Prostata', denial: '🔒 Denial' };
      if (clDate) clDate.innerText = (tLabels[state.lastClimax.type] || 'Höhepunkt') + " (" + dStr + ")";
      if (clDesc) clDesc.innerText = state.lastClimax.note || 'Im Logbuch archiviert.';
    }

    // Hygiene Matrix Label
    var ruleDesc = document.getElementById('hygiene-rule-desc');
    if (ruleDesc) {
      ruleDesc.innerText = (state.hygieneConfig.mode === 'points')
        ? ("-" + state.hygieneConfig.ratePts + " P / Min")
        : (state.hygieneConfig.ratePhys + " / Min");
    }

    // Schreibschutz-Banner prüfen
    applyRoleAccessControl();
  }

  function applyRoleAccessControl() {
    var isTop = isUserTop();
    var banner = document.getElementById('bottom-readonly-banner');
    if (banner) {
      if (isTop) banner.classList.add('hidden');
      else banner.classList.remove('hidden');
    }

    // Top-spezifische Buttons sperren / ausgrauen falls Bottom
    var topOnlyButtons = [
      'btn-toggle-lock', 'btn-open-role-cfg', 'btn-cfg-hygiene',
      'btn-new-challenge', 'btn-new-chore', 'btn-new-infraction',
      'btn-new-reward', 'btn-sign-top'
    ];
    topOnlyButtons.forEach(function(btnId) {
      var btn = document.getElementById(btnId);
      if (btn) {
        btn.disabled = !isTop;
        if (!isTop) {
          btn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
          btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
      }
    });
  }

  function renderChoresAndRewards() {
    loadLedgerState();
    var isTop = isUserTop();

    // 1. Chores Liste
    var choresContainer = document.getElementById('chores-list-container');
    if (choresContainer) {
      if (state.chores.length === 0) {
        choresContainer.innerHTML = '<p class="text-slate-500 italic text-center py-2">Keine Pflichten hinterlegt.</p>';
      } else {
        choresContainer.innerHTML = state.chores.map(function(c) {
          return `
            <div class="p-3 rounded-2xl theme-panel border border-slate-800 flex items-center justify-between gap-2">
              <div class="min-w-0 flex-1">
                <strong class="text-xs text-white block truncate">${escapeHtml(c.title)}</strong>
                <span class="text-[10px] text-purple-300 font-mono font-bold">+${c.points} Punkte</span>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                ${isTop ? `<button type="button" onclick="LedgerApp.deleteChore('${c.id}')" class="text-slate-500 hover:text-rose-400 text-xs px-2 py-1">✕</button>` : ''}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 2. Infractions Liste
    var infraContainer = document.getElementById('infractions-list-container');
    if (infraContainer) {
      if (state.infractions.length === 0) {
        infraContainer.innerHTML = '<p class="text-slate-500 italic text-center py-2">Keine Vergehen im Katalog.</p>';
      } else {
        infraContainer.innerHTML = state.infractions.map(function(inf) {
          return `
            <div class="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/60 flex items-center justify-between gap-2">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <strong class="text-xs text-white block truncate">${escapeHtml(inf.title)}</strong>
                  ${inf.clause ? `<span class="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 text-[9px] font-mono">${escapeHtml(inf.clause)}</span>` : ''}
                </div>
                <div class="flex items-center gap-2 text-[10px] text-rose-300 font-mono mt-0.5">
                  <span>${inf.points} P</span>
                  <span>·</span>
                  <span>${escapeHtml(inf.penalty)}</span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                ${isTop ? `
                  <button type="button" onclick="LedgerApp.openNegotiatePenaltyModal('${inf.id}')" class="px-2.5 py-1 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-200 font-bold text-[10px] touch-btn">
                    Verhandeln ⚖️
                  </button>
                  <button type="button" onclick="LedgerApp.executeInfractionDirectly('${inf.id}')" class="px-2.5 py-1 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-[10px] touch-btn">
                    Vollziehen ✓
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 3. Rewards Shop
    var rewContainer = document.getElementById('rewards-list-container');
    if (rewContainer) {
      rewContainer.innerHTML = state.rewards.map(function(r) {
        var canAfford = state.balance >= r.cost;
        return `
          <div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/80 space-y-2 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between">
                <strong class="text-xs text-amber-200 block truncate">${escapeHtml(r.title)}</strong>
                <span class="text-[10px] font-mono font-black text-amber-400">${r.cost} P</span>
              </div>
              <p class="text-[10.5px] text-slate-300 mt-1 leading-snug">${escapeHtml(r.desc || '')}</p>
            </div>
            <button type="button" onclick="LedgerApp.redeemReward('${r.id}')" ${!canAfford ? 'disabled' : ''} class="w-full py-1.5 rounded-xl font-bold text-xs touch-btn ${canAfford ? 'bg-amber-700 hover:bg-amber-600 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'}">
              ${canAfford ? 'Einlösen 🎁' : 'Zu wenig Punkte (' + r.cost + ' P)'}
            </button>
          </div>
        `;
      }).join('');
    }
  }

  function startHygieneTimer() {
    if (hygieneTimerInterval) clearInterval(hygieneTimerInterval);
    hygieneSecondsRemaining = 15 * 60;
    hygieneOverdueMinutes = 0;

    var disp = document.getElementById('hygiene-timer-display');
    var btn = document.getElementById('btn-hygiene-start');
    if (btn) btn.innerText = "Läuft... 🚿";

    showToast("15m Hygiene-Duschpause gestartet! Schloss darf abgenommen werden.");

    // Event im Chat posten
    if (window.LedgerChat && typeof window.LedgerChat.postSystemEvent === 'function') {
      window.LedgerChat.postSystemEvent("🚿 15-Minuten Hygiene-Duschpause gestartet. Nach Ablauf muss das Schloss verriegelt sein!");
    }

    hygieneTimerInterval = setInterval(function() {
      if (hygieneSecondsRemaining > 0) {
        hygieneSecondsRemaining--;
        var m = Math.floor(hygieneSecondsRemaining / 60);
        var s = hygieneSecondsRemaining % 60;
        if (disp) disp.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
      } else {
        // Überziehung!
        hygieneOverdueMinutes++;
        if (disp) {
          disp.innerText = "⚠️ +" + hygieneOverdueMinutes + "m ÜBERZOGEN!";
          disp.className = "text-xs font-mono font-black text-rose-400 animate-pulse";
        }
        applyHygieneOverduePenalty(hygieneOverdueMinutes);
      }
    }, 1000);
  }

  function applyHygieneOverduePenalty(overdueMins) {
    // Nur 1x je volle Minute buchen
    if (hygieneSecondsRemaining % 60 !== 0) return;
    loadLedgerState();

    if (state.hygieneConfig.mode === 'points') {
      var ptsLoss = state.hygieneConfig.ratePts;
      state.balance -= ptsLoss;
      saveLedgerState();
      renderDashboard();
      if (window.LedgerChat && typeof window.LedgerChat.postSystemEvent === 'function') {
        window.LedgerChat.postSystemEvent("⚠️ Duschpause um " + overdueMins + " Min. überzogen: -" + ptsLoss + " Punkte verbucht!");
      }
    } else {
      var physText = state.hygieneConfig.ratePhys;
      if (window.LedgerChat && typeof window.LedgerChat.postSystemEvent === 'function') {
        window.LedgerChat.postSystemEvent("⚠️ Duschpause um " + overdueMins + " Min. überzogen: Automatisch fällig: " + physText);
      }
    }
  }

  function rollDiceOfFate() {
    loadLedgerState();
    var now = Date.now();
    var cooldownMs = 24 * 3600 * 1000;

    if (state.lastDiceRoll && (now - state.lastDiceRoll) < cooldownMs) {
      var remainingHours = Math.round((cooldownMs - (now - state.lastDiceRoll)) / (3600 * 1000));
      showToast("🎲 Würfel gesperrt: Nächster Wurf erst in " + remainingHours + " Stunden möglich.");
      return;
    }

    var eye = Math.floor(Math.random() * 6) + 1;
    state.lastDiceRoll = now;

    var badge = document.getElementById('dice-result-badge');
    var desc = document.getElementById('dice-status-desc');
    var diceIcons = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    if (badge) badge.innerText = "🎲 " + eye + " (" + diceIcons[eye] + ")";

    var eventMsg = "";
    if (eye === 1) {
      eventMsg = "🎲 Schicksals-Würfel: Auge 1! +24h Verlängerung der Käfigzeit.";
      if (state.activeChallenge) state.activeChallenge.endsAt += (24 * 3600 * 1000);
    } else if (eye === 2) {
      eventMsg = "🎲 Schicksals-Würfel: Auge 2! Zuchtmaßnahme: 15 gezielte Schläge am Abend.";
    } else if (eye === 3 || eye === 4) {
      eventMsg = "🎲 Schicksals-Würfel: Auge " + eye + "! Neutrales Schicksal – keine Zeitänderung.";
    } else if (eye === 5) {
      eventMsg = "🎲 Schicksals-Würfel: Auge 5! Gunst: +35 Bonuspunkte aufs Tribut-Konto!";
      state.balance += 35;
    } else if (eye === 6) {
      eventMsg = "🎲 Schicksals-Würfel: Auge 6! Der Glücksfall: Sofortige 15m Duschpause freigeschaltet! 🚿";
    }

    saveLedgerState();
    renderDashboard();
    if (desc) desc.innerText = eventMsg;
    showToast(eventMsg);

    if (window.LedgerChat && typeof window.LedgerChat.postSystemEvent === 'function') {
      window.LedgerChat.postSystemEvent(eventMsg);
    }
  }

  function openNegotiatePenaltyModal(infractionId) {
    if (!isUserTop()) {
      showToast("🔒 Nur der Top kann Strafen anpassen.");
      return;
    }
    loadLedgerState();
    var inf = state.infractions.find(function(i) { return i.id === infractionId; });
    if (!inf) return;
    activeNegotiatingInfraction = inf;

    var origTitle = document.getElementById('nego-orig-title');
    var inAct = document.getElementById('nego-input-actual-punishment');
    var inPts = document.getElementById('nego-input-points-deducted');
    var inChore = document.getElementById('nego-input-special-chore');

    if (origTitle) origTitle.innerText = inf.title + " (" + inf.penalty + " & " + inf.points + " P)";
    if (inAct) inAct.value = "10 Schläge vollzogen (abgemildert)";
    if (inPts) inPts.value = Math.abs(inf.points) * 2; // Punkte-Ablass verdoppelt
    if (inChore) inChore.value = "";

    openModal('modal-negotiate-penalty');
  }

  function saveNegotiatedPenalty() {
    if (!activeNegotiatingInfraction) return;
    loadLedgerState();

    var inAct = document.getElementById('nego-input-actual-punishment');
    var inPts = document.getElementById('nego-input-points-deducted');
    var inChore = document.getElementById('nego-input-special-chore');

    var actualAct = inAct ? inAct.value : 'Vollzogen';
    var ptsDeducted = inPts ? parseInt(inPts.value, 10) : 50;
    var specialChore = inChore ? inChore.value.trim() : '';

    state.balance -= ptsDeducted;
    saveLedgerState();
    renderDashboard();
    closeModal('modal-negotiate-penalty');

    var logText = "⚖️ Verhandlungsergebnis für '" + activeNegotiatingInfraction.title + "': " + actualAct + ", -" + ptsDeducted + " Punkte verbucht.";
    if (specialChore) logText += " Sonderaufgabe: " + specialChore;

    showToast("Urteil im Ledger verbucht ✓");
    if (window.LedgerChat && typeof window.LedgerChat.postSystemEvent === 'function') {
      window.LedgerChat.postSystemEvent(logText);
    }
  }

  function executeInfractionDirectly(infractionId) {
    if (!isUserTop()) return;
    loadLedgerState();
    var inf = state.infractions.find(function(i) { return i.id === infractionId; });
    if (!inf) return;

    state.balance += inf.points; // points ist negativ
    saveLedgerState();
    renderDashboard();

    var logText = "⚖️ Strafe vollzogen: " + inf.title + " (" + inf.penalty + ", " + inf.points + " P).";
    showToast("Strafe vollzogen & Punkte abgezogen ✓");

    if (window.LedgerChat && typeof window.LedgerChat.postSystemEvent === 'function') {
      window.LedgerChat.postSystemEvent(logText);
    }
  }

  function redeemReward(rewardId) {
    loadLedgerState();
    var rew = state.rewards.find(function(r) { return r.id === rewardId; });
    if (!rew) return;

    if (state.balance < rew.cost) {
      showToast("Nicht genügend Punkte vorhanden.");
      return;
    }

    state.balance -= rew.cost;
    saveLedgerState();
    renderDashboard();
    renderChoresAndRewards();

    var msg = "🎁 Belohnung eingelöst: '" + rew.title + "' für " + rew.cost + " Punkte!";
    showToast(msg);

    if (window.LedgerChat && typeof window.LedgerChat.postSystemEvent === 'function') {
      window.LedgerChat.postSystemEvent(msg);
    }
  }

  function switchTab(tabId) {
    ['dashboard', 'chat', 'chores', 'contract', 'ai_coach'].forEach(function(t) {
      var view = document.getElementById('view-ledger-' + t);
      var btn = document.getElementById('tab-btn-' + t);
      if (view) {
        if (t === tabId) view.classList.remove('hidden');
        else view.classList.add('hidden');
      }
      if (btn) {
        if (t === tabId) {
          btn.className = "px-3.5 py-2 rounded-xl text-xs font-extrabold bg-purple-700 text-white touch-btn shadow-sm whitespace-nowrap";
        } else {
          btn.className = "px-3.5 py-2 rounded-xl text-xs font-bold theme-panel text-slate-300 touch-btn whitespace-nowrap";
        }
      }
    });

    if (tabId === 'chat' && window.LedgerChat && typeof window.LedgerChat.renderChatStream === 'function') {
      window.LedgerChat.renderChatStream();
    } else if (tabId === 'chores') {
      renderChoresAndRewards();
    } else if (tabId === 'contract' && window.LedgerContract && typeof window.LedgerContract.renderContract === 'function') {
      window.LedgerContract.renderContract();
    } else if (tabId === 'dashboard') {
      renderDashboard();
    }
  }

  function openStealthMode() {
    var overlay = document.getElementById('stealth-mode-overlay');
    if (overlay) overlay.style.display = 'flex';
  }

  function closeStealthMode() {
    var overlay = document.getElementById('stealth-mode-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function openModal(id) {
    var m = document.getElementById(id);
    if (m) m.style.display = 'flex';
  }

  function closeModal(id) {
    var m = document.getElementById(id);
    if (m) m.style.display = 'none';
  }

  function toggleMobileDrawer(open) {
    var drawer = document.getElementById('mobile-menu-drawer');
    if (!drawer) return;
    drawer.style.display = open ? 'flex' : 'none';
  }

  function toggleLockState() {
    if (!isUserTop()) {
      showToast("🔒 Schreibschutz: Nur der Keyholder kann das Schloss schalten.");
      return;
    }
    loadLedgerState();
    state.isLocked = !state.isLocked;
    if (state.isLocked) state.lockedSince = Date.now();
    saveLedgerState();
    renderDashboard();

    var msg = state.isLocked ? "🔒 Verschluss verriegelt!" : "🔓 Verschluss abgenommen!";
    showToast(msg);
    if (window.LedgerChat && typeof window.LedgerChat.postSystemEvent === 'function') {
      window.LedgerChat.postSystemEvent(msg);
    }
  }

  function openRoleConfigModal() {
    if (!isUserTop()) {
      showToast("🔒 Nur der Keyholder kann Rollen und Hardware konfigurieren.");
      return;
    }
    loadLedgerState();
    var selKh = document.getElementById('cfg-select-keyholder');
    var selHw = document.getElementById('cfg-select-hardware');
    var inKey = document.getElementById('cfg-input-key-storage');

    if (selKh) selKh.value = state.keyholder;
    if (selHw) selHw.value = state.hardware;
    if (inKey) inKey.value = state.keyStorage || '';

    openModal('modal-ledger-role-config');
  }

  function saveRoleConfig() {
    loadLedgerState();
    var selKh = document.getElementById('cfg-select-keyholder');
    var selHw = document.getElementById('cfg-select-hardware');
    var inKey = document.getElementById('cfg-input-key-storage');

    var newKh = selKh ? selKh.value : 'A';
    state.hardware = selHw ? selHw.value : 'penis_micro';
    state.keyStorage = inKey ? inKey.value.trim() : 'kSafe';

    if (newKh !== state.keyholder) {
      // Rollenwechsel! Bisheriges Regime wird pausiert
      state.keyholder = newKh;
      state.cagedPartner = (newKh === 'A') ? 'B' : 'A';
      showToast("⚡ Rollen gewechselt! Bisheriger Vertrag pausiert.");
    }

    saveLedgerState();
    closeModal('modal-ledger-role-config');
    renderDashboard();
    showToast("Konfiguration gespeichert ✓");
  }

  window.LedgerApp = {
    renderAll: function() {
      renderDashboard();
      renderChoresAndRewards();
    },
    switchTab: switchTab,
    toggleLockState: toggleLockState,
    openRoleConfigModal: openRoleConfigModal,
    saveRoleConfig: saveRoleConfig,
    openHygienePenaltyModal: function() { openModal('modal-hygiene-penalty-config'); },
    saveHygienePenaltyConfig: function() {
      loadLedgerState();
      var m = document.getElementById('cfg-hygiene-mode');
      var p = document.getElementById('cfg-hygiene-rate-pts');
      var f = document.getElementById('cfg-hygiene-rate-phys');
      state.hygieneConfig.mode = m ? m.value : 'points';
      state.hygieneConfig.ratePts = p ? parseInt(p.value, 10) : 15;
      state.hygieneConfig.ratePhys = f ? f.value : '2 Schläge';
      saveLedgerState();
      closeModal('modal-hygiene-penalty-config');
      renderDashboard();
      showToast("Hygiene-Matrix gespeichert ✓");
    },
    updateHygienePenaltyModeUI: function(mode) {
      var ptsBox = document.getElementById('hygiene-pts-setting');
      var physBox = document.getElementById('hygiene-phys-setting');
      if (mode === 'points') {
        if (ptsBox) ptsBox.classList.remove('hidden');
        if (physBox) physBox.classList.add('hidden');
      } else {
        if (physBox) physBox.classList.remove('hidden');
        if (ptsBox) ptsBox.classList.add('hidden');
      }
    },
    startHygieneTimer: startHygieneTimer,
    rollDiceOfFate: rollDiceOfFate,
    openNegotiatePenaltyModal: openNegotiatePenaltyModal,
    saveNegotiatedPenalty: saveNegotiatedPenalty,
    executeInfractionDirectly: executeInfractionDirectly,
    redeemReward: redeemReward,
    openClimaxLoggerModal: function() { openModal('modal-ledger-climax'); },
    saveClimaxEntry: function() {
      loadLedgerState();
      var sel = document.getElementById('climax-select-type');
      var note = document.getElementById('climax-input-note');
      state.lastClimax = {
        timestamp: Date.now(),
        type: sel ? sel.value : 'ruined',
        note: note ? note.value.trim() : 'Manuell erfasst.'
      };
      saveLedgerState();
      closeModal('modal-ledger-climax');
      renderDashboard();
      showToast("Höhepunkt dokumentiert ✓");
    },
    openStealthMode: openStealthMode,
    closeStealthMode: closeStealthMode,
    openModal: openModal,
    closeModal: closeModal,
    toggleMobileDrawer: toggleMobileDrawer,
    getState: function() { loadLedgerState(); return state; },
    isTop: isUserTop
  };

  document.addEventListener('DOMContentLoaded', function() {
    renderDashboard();
    renderChoresAndRewards();
  });

})(window);
