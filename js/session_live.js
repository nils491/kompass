/**
 * js/session_live.js
 * Modul für das Live-Cockpit, Timer, Edging-Fernbedienung & Aftercare.
 * 
 * Beinhaltet:
 * - Session-Start, Screen Wake Lock & Haupttimer
 * - Safeword-Ampel & Notfall-Schaltungen
 * - Geführte Drehbuch-Schritte & Vorlese-Funktion
 * - Edging-Cockpit mit Erregungs-Schieberegler (1–10) & 10s-Atem-Countdown
 * - Finisher: Freigabe, Ruined Orgasm, Denial & Cooldown
 * - Vagus-Atmung & Trance-Modal
 * - Aftercare-Feedback & Tagebuch-Verwaltung (Session-Diary)
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var currentSessionMode = 'guided';
  var sessionRemainingSeconds = 3600;
  var sessionTotalSeconds = 3600;
  var isSessionPaused = false;
  var sessionTimerInterval = null;
  var screenWakeLock = null;

  var currentSessionLog = [];
  var sessionDiary = [];

  var liveStepIndex = 0;
  var activeArousalLevel = 5;
  var edgingStimulationBy = 'top';
  var edgeCount = 0;
  var lastEdgeTimestamp = null;
  var lastEdgeIntervalTimer = null;
  var cooldownTimerInterval = null;
  var cooldownSecondsRemaining = 45;
  var currentEdgingCountdown = 10;
  var isCountdownActive = false;
  var isEdgingCountdownPaused = false;
  var countdownRunId = 0;

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

  function getFormattedTimeNow() { 
    return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }); 
  }

  function loadLiveStorage() {
    try {
      var dia = localStorage.getItem('kompass_session_diary');
      if (dia && dia !== 'null') sessionDiary = JSON.parse(dia);
    } catch (e) {}
    if (!sessionDiary || !Array.isArray(sessionDiary)) sessionDiary = [];
    window.sessionDiary = sessionDiary;
    window.currentSessionLog = currentSessionLog;
  }

  // --- AUDIO & DISCIPLINE WRAPPER ---
  function toggleAmbientMusicWrapper() { if (window.SessionAudio && window.SessionAudio.toggle) window.SessionAudio.toggle(); }
  function setSoundscapeStyleWrapper(style) { if (window.SessionAudio && window.SessionAudio.setStyle) window.SessionAudio.setStyle(style); }
  function adjustAmbientEnergyWrapper(dir) { if (window.SessionAudio && window.SessionAudio.adjustEnergy) window.SessionAudio.adjustEnergy(dir); }
  function selectMusicSourceWrapper(src) { if (window.SessionAudio && window.SessionAudio.selectSource) window.SessionAudio.selectSource(src); }
  function saveCustomPlaylistLinkWrapper(val) {
    var link = (val || '').trim();
    try {
      localStorage.setItem('kompass_custom_playlist_url', link);
      var btn = document.getElementById('btn-launch-external-music');
      if (btn && link) btn.href = link.startsWith('http') ? link : ('https://' + link);
      showToast("Playlist-Link hinterlegt");
    } catch (e) {}
  }

  function openIncidentDisciplineModalWrapper() { if (window.SessionDiscipline && window.SessionDiscipline.open) window.SessionDiscipline.open(); }
  function closeIncidentDisciplineModalWrapper() { if (window.SessionDiscipline && window.SessionDiscipline.close) window.SessionDiscipline.close(); }
  function selectIncidentCategoryWrapper(cat) { if (window.SessionDiscipline && window.SessionDiscipline.selectCategory) window.SessionDiscipline.selectCategory(cat); }
  function handleReasonLiveInputWrapper(val) { if (window.SessionDiscipline && window.SessionDiscipline.handleReasonInput) window.SessionDiscipline.handleReasonInput(val); }
  function setStageSeverityWrapper(stage, sev) { if (window.SessionDiscipline && window.SessionDiscipline.setSeverity) window.SessionDiscipline.setSeverity(stage, sev); }
  function prevWizardStageWrapper() { if (window.SessionDiscipline && window.SessionDiscipline.prevStage) window.SessionDiscipline.prevStage(); }
  function nextWizardStageWrapper() { if (window.SessionDiscipline && window.SessionDiscipline.nextStage) window.SessionDiscipline.nextStage(); }
  function rerollCurrentWizardStageWrapper() { if (window.SessionDiscipline && window.SessionDiscipline.rerollStage) window.SessionDiscipline.rerollStage(); }
  function applyConfiguredDisciplineWrapper() { if (window.SessionDiscipline && window.SessionDiscipline.apply) window.SessionDiscipline.apply(); }

  // --- SAFEWORD ---
  function triggerSafewordWrapper(color) {
    var ind = document.getElementById('safeword-red-indicator');
    var time = getFormattedTimeNow();

    if (color === 'green') {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword GRÜN: Bestätigung" });
      showToast("GRÜN bestätigt: Alles in bester Ordnung");
      if (window.isTopVoiceAssistActive && window.SessionVoice) window.SessionVoice.play("Grün. Sehr gut.");
    } else if (color === 'yellow') {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword GELB: Tempo drosseln" });
      showToast("⚠️ GELB ausgelöst: Tempo drosseln!");
      if (window.SessionAudio) window.SessionAudio.adjustEnergy('calm');
      if (window.isTopVoiceAssistActive && window.SessionVoice) window.SessionVoice.play("Gelb registriert. Tempo drosseln und durchatmen.");
    } else {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword ROT: Sofort-Abbruch" });
      if (ind) ind.classList.add('animate-ping');
      isSessionPaused = true;
      if (window.SessionAudio && window.SessionAudio.stopAll) window.SessionAudio.stopAll();
      showToast("🛑 ROT AUSGELÖST: Sofortiger Stillstand!");
      if (window.isTopVoiceAssistActive && window.SessionVoice) window.SessionVoice.play("Halt. Sofortiger Stopp aller Handlungen.");
      setTimeout(function() { if (ind) ind.classList.remove('animate-ping'); }, 4000);
    }
  }

  // --- SESSION START & TIMER ---
  function selectSessionMode(mode) {
    currentSessionMode = mode;
    if (mode === 'guided') {
      if (typeof window.goToPortalStepSafe === 'function') window.goToPortalStepSafe(3);
    } else {
      startLiveSessionWrapper();
    }
  }

  function startLiveSessionWrapper() {
    if (window.SessionVoice && window.SessionVoice.unlock) window.SessionVoice.unlock();
    if (window.SessionAudio && window.SessionAudio.ensureGraph) window.SessionAudio.ensureGraph();
    acquireScreenWakeLock();

    var pContainer = document.getElementById('portal-setup-container');
    var cContainer = document.getElementById('cockpit-live-container');
    var badge = document.getElementById('session-active-badge');
    var gContainer = document.getElementById('guided-step-container');

    if (pContainer) pContainer.classList.add('hidden');
    if (cContainer) cContainer.classList.remove('hidden');
    if (badge) badge.classList.remove('hidden');

    if (currentSessionMode === 'free') {
      if (gContainer) gContainer.classList.add('hidden');
    } else {
      if (gContainer) gContainer.classList.remove('hidden');
      renderLiveStep();
    }

    sessionRemainingSeconds = sessionTotalSeconds = 3600;
    isSessionPaused = false;
    startSessionTimer();

    currentSessionLog = [{ type: "system", time: getFormattedTimeNow(), label: "Session gestartet" }];

    if (window.isTopVoiceAssistActive && window.SessionVoice) {
      var topName = (window.names && window.names[window.topPartner]) || 'Top';
      window.SessionVoice.play("Session begonnen. " + topName + " übernimmt ab jetzt die Führung.");
    }
  }

  function startSessionTimer() {
    if (sessionTimerInterval) clearInterval(sessionTimerInterval);
    sessionTimerInterval = setInterval(function() {
      if (!isSessionPaused && sessionRemainingSeconds > 0) {
        sessionRemainingSeconds--;
        updateTimerDisplay();
      } else if (sessionRemainingSeconds <= 0) {
        clearInterval(sessionTimerInterval);
        endSessionToAftercare();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    var disp = document.getElementById('session-timer-display');
    if (!disp) return;
    var m = Math.floor(sessionRemainingSeconds / 60);
    var s = sessionRemainingSeconds % 60;
    disp.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  }

  function togglePauseTimer() {
    isSessionPaused = !isSessionPaused;
    var btn = document.getElementById('btn-pause-timer');
    if (btn) btn.innerText = isSessionPaused ? "Weiter" : "Pause";
    showToast(isSessionPaused ? "Session pausiert" : "Session fortgesetzt");
  }

  function addSessionMinutes(mins) {
    sessionRemainingSeconds += mins * 60;
    sessionTotalSeconds += mins * 60;
    updateTimerDisplay();
    showToast("+" + mins + " Minuten Spielzeit");
  }

  // --- DREHBUCH LIVE SCHRITTE ---
  function renderLiveStep() {
    var playbook = window.currentSelectedPlaybook || [];
    var step = playbook[liveStepIndex];
    if (!step) return;

    var badge = document.getElementById('live-step-badge');
    var title = document.getElementById('live-step-title');
    var phase = document.getElementById('live-step-phase');
    var desc = document.getElementById('live-step-desc');
    var topRole = document.getElementById('live-step-top-role');
    var subRole = document.getElementById('live-step-sub-role');
    var phasePill = document.getElementById('session-phase-pill');

    if (badge) badge.innerText = "Schritt " + (liveStepIndex + 1) + " / " + playbook.length;
    if (title) title.innerText = step.title;
    if (phase) phase.innerText = step.phase.split(':')[0];
    if (desc) desc.innerText = step.desc;
    if (topRole) topRole.innerText = step.top;
    if (subRole) subRole.innerText = step.sub;
    if (phasePill) phasePill.innerText = step.phase.split(':')[0];
  }

  function nextLiveStep() {
    var playbook = window.currentSelectedPlaybook || [];
    if (liveStepIndex < playbook.length - 1) {
      liveStepIndex++;
      renderLiveStep();
    } else {
      endSessionToAftercare();
    }
  }

  function prevLiveStep() {
    if (liveStepIndex > 0) {
      liveStepIndex--;
      renderLiveStep();
    }
  }

  function speakCurrentLiveStep() {
    var playbook = window.currentSelectedPlaybook || [];
    var step = playbook[liveStepIndex];
    if (!step) return;
    if (window.SessionVoice && window.SessionVoice.play) {
      window.SessionVoice.play(step.title + ". " + step.desc);
    }
  }

  // --- EDGING FERNBEDIENUNG ---
  function setEdgingStimulator(stim) {
    edgingStimulationBy = stim;
    var bTop = document.getElementById('btn-stim-top');
    var bBottom = document.getElementById('btn-stim-bottom');

    if (stim === 'top') {
      if (bTop) bTop.className = "px-3 py-1.5 rounded-xl border text-[10.5px] font-bold bg-brand-950 border-brand-500 text-brand-200 touch-btn";
      if (bBottom) bBottom.className = "px-3 py-1.5 rounded-xl border text-[10.5px] font-bold theme-panel text-slate-400 touch-btn";
    } else {
      if (bBottom) bBottom.className = "px-3 py-1.5 rounded-xl border text-[10.5px] font-bold bg-brand-950 border-brand-500 text-brand-200 touch-btn";
      if (bTop) bTop.className = "px-3 py-1.5 rounded-xl border text-[10.5px] font-bold theme-panel text-slate-400 touch-btn";
    }
  }

  function handleArousalSliderTouch(val) {
    activeArousalLevel = parseInt(val, 10);
    var badge = document.getElementById('arousal-level-badge');
    var labels = ["", "Ruhig", "Leicht erregt", "Wärme", "Fokus", "Plateau", "Gesteigert", "Intensiv", "Gefahrenzone", "Vor der Kante", "Kante"];
    if (badge) badge.innerText = "Stufe " + activeArousalLevel + " / 10 (" + (labels[activeArousalLevel] || '') + ")";

    if (activeArousalLevel >= 8 && window.SessionAudio && window.SessionAudio.adjustEnergy) {
      window.SessionAudio.adjustEnergy('energy');
    }

    if (window.isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play && Math.random() < 0.35) {
      var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
      var phrase = "";
      if (activeArousalLevel <= 3) phrase = "Ganz ruhig atmen, " + subName + ". Wir bauen die Spannung langsam auf.";
      else if (activeArousalLevel <= 6) phrase = (edgingStimulationBy === 'bottom_self') ? ("Gleichmäßig weiterberühren, " + subName + ". Halt das Plateau.") : "Spüre meine Berührung. Lass dich ganz darauf ein.";
      else if (activeArousalLevel <= 9) phrase = (edgingStimulationBy === 'bottom_self') ? "Langsamer werden! Hände kurz anhalten, wenn es zu nah wird." : ("Gefahrenzone, " + subName + ". Kein Zucken. Du kommst erst auf mein Zeichen.");
      else phrase = "Stillhalten! Kante erreicht!";
      window.SessionVoice.play(phrase);
    }
  }

  function registerEdgeReachedWrapper() {
    edgeCount++;
    lastEdgeTimestamp = Date.now();
    var hitsEl = document.getElementById('edging-total-hits');
    if (hitsEl) hitsEl.innerText = edgeCount;

    currentSessionLog.push({ type: "action", time: getFormattedTimeNow(), label: "Edge #" + edgeCount + " erreicht (Stufe 10)" });
    showToast("Edge #" + edgeCount + " registriert!");
    startLastEdgeTimer();
    startCooldownBreathingTimer();

    if (window.isTopVoiceAssistActive && window.SessionVoice) {
      window.SessionVoice.play("Kante! Hände sofort weg und stillhalten!");
    }
  }

  function startLastEdgeTimer() {
    if (lastEdgeIntervalTimer) clearInterval(lastEdgeIntervalTimer);
    var disp = document.getElementById('time-since-last-edge');
    lastEdgeIntervalTimer = setInterval(function() {
      if (!lastEdgeTimestamp) return;
      var diff = Math.floor((Date.now() - lastEdgeTimestamp) / 1000);
      var m = Math.floor(diff / 60);
      var s = diff % 60;
      if (disp) disp.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }, 1000);
  }

  function startCooldownBreathingTimer() {
    if (cooldownTimerInterval) clearInterval(cooldownTimerInterval);
    cooldownSecondsRemaining = 45;
    var btn = document.getElementById('btn-cooldown-timer');

    cooldownTimerInterval = setInterval(function() {
      if (cooldownSecondsRemaining > 0) {
        cooldownSecondsRemaining--;
        if (btn) btn.innerText = cooldownSecondsRemaining + "s Abkühlen";
      } else {
        clearInterval(cooldownTimerInterval);
        if (btn) btn.innerText = "Abgekühlt ✓";
        setTimeout(function() { if (btn) btn.innerText = "45s Abkühlen"; }, 2500);
      }
    }, 1000);
  }

  function openReleaseChoiceModal() {
    var panel = document.getElementById('release-choice-subpanel');
    if (panel) panel.classList.toggle('hidden');
  }

  function executeReleaseImmediate() {
    currentSessionLog.push({ type: "action", time: getFormattedTimeNow(), label: "Orgasmus-Freigabe (Sofort)" });
    var panel = document.getElementById('release-choice-subpanel');
    if (panel) panel.classList.add('hidden');
    showToast("Sofortige Freigabe erteilt!");
    if (window.isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play) {
      window.SessionVoice.play("Jetzt! Lass alles los und komm für mich!");
    }
  }

  function executeReleaseWithCountdown() {
    var panel = document.getElementById('release-choice-subpanel');
    var wrap = document.getElementById('countdown-wrapper');
    if (panel) panel.classList.add('hidden');
    if (wrap) wrap.classList.remove('hidden');
    currentEdgingCountdown = 10;
    isCountdownActive = true;
    isEdgingCountdownPaused = false;
    countdownRunId++;
    runBreathPacedCountdownLoop(countdownRunId);
  }

  async function runBreathPacedCountdownLoop(runId) {
    var disp = document.getElementById('countdown-display');
    while (isCountdownActive && currentEdgingCountdown > 0 && runId === countdownRunId) {
      if (isEdgingCountdownPaused) {
        await new Promise(function(r) { setTimeout(r, 400); });
        continue;
      }

      if (disp) disp.innerText = currentEdgingCountdown;
      if (window.isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play) {
        await window.SessionVoice.play(currentEdgingCountdown.toString());
      } else {
        await new Promise(function(r) { setTimeout(r, 1100); });
      }

      await new Promise(function(r) { setTimeout(r, 400); });
      currentEdgingCountdown--;
    }

    if (currentEdgingCountdown <= 0 && runId === countdownRunId) {
      if (disp) disp.innerText = "KOMMEN!";
      currentSessionLog.push({ type: "action", time: getFormattedTimeNow(), label: "Orgasmus-Freigabe (nach Countdown)" });
      if (window.isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play) {
        await window.SessionVoice.play("Jetzt kommen! Lass alles los!");
      }
      setTimeout(function() {
        var wrap = document.getElementById('countdown-wrapper');
        if (wrap) wrap.classList.add('hidden');
      }, 4000);
    }
  }

  function pauseSpeechCountdown() {
    isEdgingCountdownPaused = !isEdgingCountdownPaused;
    var btn = document.getElementById('btn-pause-countdown');
    if (btn) btn.innerText = isEdgingCountdownPaused ? "Weiter" : "Pause";
  }

  function resetSpeechCountdown() {
    isCountdownActive = false;
    countdownRunId++;
    var wrap = document.getElementById('countdown-wrapper');
    if (wrap) wrap.classList.add('hidden');
    currentEdgingCountdown = 10;
  }

  function finalizeEdgingDecision(decision) {
    var time = getFormattedTimeNow();
    if (decision === 'ruined') {
      currentSessionLog.push({ type: "action", time: time, label: "Ruined Orgasm angeordnet" });
      showToast("Ruined Orgasm vollzogen!");
      if (window.isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play) {
        window.SessionVoice.play("Hände weg! Stillhalten und auskrampfen... Vielleicht beim nächsten Mal.");
      }
    } else if (decision === 'denial') {
      currentSessionLog.push({ type: "action", time: time, label: "Lustverweigerung (Denial)" });
      showToast("Orgasmus verweigert!");
      if (window.SessionAudio && window.SessionAudio.adjustEnergy) window.SessionAudio.adjustEnergy('calm');
      if (window.isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play) {
        window.SessionVoice.play("Schluss für heute. Du bleibst ungelöst.");
      }
    }
  }

  // --- ZEN & TRANCE MODAL ---
  function openZenAtemModal() { var m = document.getElementById('modal-session-zen'); if (m) m.classList.remove('hidden'); }
  function closeZenAtemModal() { var m = document.getElementById('modal-session-zen'); if (m) m.classList.add('hidden'); }

  function selectZenMode(mode) {
    var bBreath = document.getElementById('btn-zen-mode-breath');
    var bTrance = document.getElementById('btn-zen-mode-trance');
    var vBreath = document.getElementById('zen-view-breath');
    var vTrance = document.getElementById('zen-view-trance');

    if (mode === 'breath') {
      if (bBreath) bBreath.className = "p-2.5 rounded-xl border bg-teal-950 border-teal-500 text-white font-bold text-center touch-btn";
      if (bTrance) bTrance.className = "p-2.5 rounded-xl border theme-panel text-slate-300 font-bold text-center touch-btn";
      if (vBreath) vBreath.classList.remove('hidden');
      if (vTrance) vTrance.classList.add('hidden');
    } else {
      if (bTrance) bTrance.className = "p-2.5 rounded-xl border bg-purple-950 border-purple-500 text-white font-bold text-center touch-btn";
      if (bBreath) bBreath.className = "p-2.5 rounded-xl border theme-panel text-slate-300 font-bold text-center touch-btn";
      if (vTrance) vTrance.classList.remove('hidden');
      if (vBreath) vBreath.classList.add('hidden');
    }
  }

  function playGuidedTranceInduction() {
    if (window.SessionVoice && window.SessionVoice.unlock) window.SessionVoice.unlock();
    if (window.SessionAudio && window.SessionAudio.ensureGraph) window.SessionAudio.ensureGraph();
    if (window.SessionVoice && window.SessionVoice.play) {
      window.SessionVoice.play("Schließe die Augen. Atme tief in den Bauchraum aus. Lass die Schultern sinken und spüre das feste Gehaltensein.");
    }
  }

  // --- AFTERCARE & LOGBUCH ---
  function endSessionToAftercare() {
    isSessionPaused = true;
    var m = document.getElementById('modal-session-aftercare');
    if (m) m.classList.remove('hidden');
  }

  function closeAftercareModal() { 
    var m = document.getElementById('modal-session-aftercare');
    if (m) m.classList.add('hidden'); 
  }

  function completeSessionAndExit() {
    var topFeedEl = document.getElementById('aftercare-top-feedback');
    var subFeedEl = document.getElementById('aftercare-sub-feedback');
    var topFeed = (topFeedEl ? topFeedEl.value : '') || '';
    var subFeed = (subFeedEl ? subFeedEl.value : '') || '';

    var sessionEntry = {
      id: "sess_" + Date.now(),
      date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: currentSessionMode === 'guided' ? 'Geführt' : 'Freier Flow',
      intensity: window.sessionDepth || 7,
      top: (window.names && window.names[window.topPartner]) || 'Top',
      bottom: (window.names && window.names[window.subPartner]) || 'Bottom',
      durationMinutes: Math.max(1, Math.round((sessionTotalSeconds - sessionRemainingSeconds) / 60)),
      edgeCount: edgeCount,
      topFeedback: topFeed,
      bottomFeedback: subFeed,
      events: currentSessionLog
    };

    sessionDiary.unshift(sessionEntry);
    try { localStorage.setItem('kompass_session_diary', JSON.stringify(sessionDiary)); } catch (e) {}

    if (window.SessionAudio && window.SessionAudio.stopAll) window.SessionAudio.stopAll();
    if (window.SessionVoice && window.SessionVoice.stop) window.SessionVoice.stop();
    releaseScreenWakeLock();
    window.location.href = "analyse.html";
  }

  function openSessionDiaryModal() {
    renderSessionDiaryEntries();
    var m = document.getElementById('modal-session-diary');
    if (m) m.classList.remove('hidden');
  }

  function closeSessionDiaryModal() { 
    var m = document.getElementById('modal-session-diary');
    if (m) m.classList.add('hidden'); 
  }

  function renderSessionDiaryEntries() {
    var c = document.getElementById('session-diary-entries-container');
    if (!c) return;

    if (sessionDiary.length === 0) {
      c.innerHTML = '<p class="text-slate-500 italic text-center py-4">Noch keine Sessions im Logbuch verzeichnet.</p>';
      return;
    }

    c.innerHTML = sessionDiary.map(function(entry) {
      return `
        <div class="p-3.5 rounded-2xl theme-panel border border-slate-800 space-y-2">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span class="font-bold text-white">${escapeHtml(entry.date)} (${escapeHtml(entry.mode)})</span>
            <span class="text-pink-400 font-mono font-bold">Stufe ${entry.intensity}/10</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[10.5px] text-slate-300">
            <div>👑 Top: ${escapeHtml(entry.top)}</div>
            <div>🧎 Bottom: ${escapeHtml(entry.bottom)}</div>
            <div>⏱️ Dauer: ${entry.durationMinutes} Min</div>
            <div>🎢 Edges: ${entry.edgeCount || 0}</div>
          </div>
          ${entry.topFeedback ? `<div class="p-2 rounded-xl bg-slate-900 text-[10.5px]"><strong>Top:</strong> ${escapeHtml(entry.topFeedback)}</div>` : ''}
          ${entry.bottomFeedback ? `<div class="p-2 rounded-xl bg-slate-900 text-[10.5px]"><strong>Bottom:</strong> ${escapeHtml(entry.bottomFeedback)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function checkUnratedSessions() {
    var banner = document.getElementById('unrated-sessions-banner');
    if (!banner) return;
    var unrated = sessionDiary.some(function(s) { return !s.topFeedback || !s.bottomFeedback; });
    if (unrated) banner.classList.remove('hidden');
    else banner.classList.add('hidden');
  }

  function dismissUnratedBanner() { 
    var banner = document.getElementById('unrated-sessions-banner');
    if (banner) banner.classList.add('hidden'); 
  }

  // --- TABU MODAL IN SESSION ---
  function openSessionTabuModal() {
    renderSessionTabuList();
    var m = document.getElementById('modal-session-tabus');
    if (m) m.classList.remove('hidden');
  }

  function closeSessionTabuModal() { 
    var m = document.getElementById('modal-session-tabus');
    if (m) m.classList.add('hidden'); 
  }

  function renderSessionTabuList() {
    var c = document.getElementById('session-tabu-list-container');
    if (!c) return;

    var allChapters = window.surveyChapters || [];
    var uAnswersTop = (window.answers && window.answers[window.topPartner]) || {};
    var uAnswersSub = (window.answers && window.answers[window.subPartner]) || {};

    var topTabus = [];
    var subTabus = [];

    allChapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          if (uAnswersTop['it_' + it.id + '_r1'] === 1) topTabus.push({ item: it, role: it.r1 });
          if (uAnswersSub['it_' + it.id + '_r2'] === 1) subTabus.push({ item: it, role: it.r2 });
        }
      });
    });

    c.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-900 space-y-1.5">
          <strong class="text-indigo-200 block text-xs">Ausführungs-Grenzen (${escapeHtml((window.names && window.names[window.topPartner]) || 'Top')}):</strong>
          ${topTabus.length > 0 ? topTabus.map(function(t) {
            return `
              <div class="p-2 rounded-lg bg-slate-900 text-[10.5px] border border-indigo-950">
                <span class="text-white block font-bold">${escapeHtml(t.item.title)}</span>
                <span class="text-indigo-300 text-[9.5px]">⛔ Ausführung abgelehnt</span>
              </div>
            `;
          }).join('') : '<p class="text-slate-500 italic text-[10.5px]">Keine Ausführungs-Limits hinterlegt.</p>'}
        </div>

        <div class="p-3 rounded-2xl bg-rose-950/30 border border-rose-900 space-y-1.5">
          <strong class="text-rose-200 block text-xs">Schutz-Schranken (${escapeHtml((window.names && window.names[window.subPartner]) || 'Bottom')}):</strong>
          ${subTabus.length > 0 ? subTabus.map(function(t) {
            return `
              <div class="p-2 rounded-lg bg-slate-900 text-[10.5px] border border-rose-950">
                <span class="text-white block font-bold">${escapeHtml(t.item.title)}</span>
                <span class="text-rose-300 text-[9.5px]">🛑 Sofort-ROT bei Empfang</span>
              </div>
            `;
          }).join('') : '<p class="text-slate-500 italic text-[10.5px]">Keine Schutz-Schranken hinterlegt.</p>'}
        </div>
      </div>
    `;
  }

  function updateHeaderTabuCounter() {
    var el = document.getElementById('session-tabu-counter');
    if (!el) return;
    var allChapters = window.surveyChapters || [];
    var uAnswersTop = (window.answers && window.answers[window.topPartner]) || {};
    var uAnswersSub = (window.answers && window.answers[window.subPartner]) || {};
    var count = 0;

    allChapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          if (uAnswersTop['it_' + it.id + '_r1'] === 1) count++;
          if (uAnswersSub['it_' + it.id + '_r2'] === 1) count++;
        }
      });
    });
    el.innerText = count;
  }

  // --- HARDWARE & SETTINGS ---
  async function acquireScreenWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        screenWakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (e) {}
  }

  function releaseScreenWakeLock() {
    if (screenWakeLock) {
      screenWakeLock.release().catch(function() {});
      screenWakeLock = null;
    }
  }

  function triggerAirPlayPicker() {
    var airplayAudio = document.getElementById('ambient-airplay-audio');
    if (airplayAudio && typeof air
