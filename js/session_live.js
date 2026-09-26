/**
 * js/session_live.js
 * Modul für das Live-Cockpit: Timer, Drehbuch-Navigation, Safewords, Vagus-Atmung & Aftercare.
 */

(function(window) {
  'use strict';

  var currentSessionMode = 'guided';
  var sessionRemainingSeconds = 3600;
  var sessionTotalSeconds = 3600;
  var isSessionPaused = false;
  var sessionTimerInterval = null;
  var screenWakeLock = null;

  var currentSessionLog = [];
  var sessionDiary = [];
  var liveStepIndex = 0;

  // Zen & Vagus-Atmung
  var zenBreathInterval = null;
  var zenBreathPhase = 0; // 0: Einatmen (4s), 1: Halten (7s), 2: Ausatmen (8s)

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
      if (window.SessionAudio && typeof window.SessionAudio.adjustEnergy === 'function') {
        window.SessionAudio.adjustEnergy('calm');
      }
      if (window.isTopVoiceAssistActive && window.SessionVoice) {
        window.SessionVoice.play("Gelb registriert. Tempo drosseln und durchatmen.");
      }
    } else {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword ROT: Sofort-Abbruch" });
      if (ind) ind.classList.add('animate-ping');
      isSessionPaused = true;
      if (window.SessionAudio && typeof window.SessionAudio.stopAll === 'function') {
        window.SessionAudio.stopAll();
      }
      showToast("🛑 ROT AUSGELÖST: Sofortiger Stillstand!");
      if (window.isTopVoiceAssistActive && window.SessionVoice) {
        window.SessionVoice.play("Halt. Sofortiger Stopp aller Handlungen.");
      }
      setTimeout(function() { if (ind) ind.classList.remove('animate-ping'); }, 4000);
    }
  }

  function selectSessionMode(mode) {
    currentSessionMode = mode;
    if (mode === 'guided') {
      if (typeof window.goToPortalStepSafe === 'function') {
        window.goToPortalStepSafe(3);
      }
    } else {
      startLiveSessionWrapper();
    }
  }

  function startLiveSessionWrapper() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }
    if (window.SessionAudio && typeof window.SessionAudio.ensureGraph === 'function') {
      window.SessionAudio.ensureGraph();
    }
    acquireScreenWakeLock();

    var pContainer = document.getElementById('portal-setup-container');
    var cContainer = document.getElementById('cockpit-live-container');
    var badge = document.getElementById('session-active-badge');
    var gContainer = document.getElementById('guided-step-container');

    if (pContainer) {
      pContainer.classList.add('hidden');
      pContainer.style.display = 'none';
    }
    if (cContainer) {
      cContainer.classList.remove('hidden');
      cContainer.style.display = 'block';
    }
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

    currentSessionLog = [{ 
      type: "system", 
      time: getFormattedTimeNow(), 
      label: "Session gestartet (" + (currentSessionMode === 'free' ? 'Freier Flow' : 'Geführt') + ")" 
    }];

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }

    showToast("Live-Cockpit: " + (currentSessionMode === 'free' ? 'Freier Flow' : 'Geführtes Drehbuch') + " gestartet ✓");

    if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
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

    // AUTOMATISCHE EDGING-ERKENNUNG IM DREHBUCH
    var isEdgingStep = step.title.toLowerCase().indexOf('edging') !== -1 || 
                       step.title.toLowerCase().indexOf('höhepunkt') !== -1 ||
                       step.desc.toLowerCase().indexOf('kante') !== -1;

    var callout = document.getElementById('guided-edging-callout');
    var panel = document.getElementById('edging-cockpit-panel');
    var focusBadge = document.getElementById('edging-focus-badge');

    if (isEdgingStep) {
      if (callout) callout.classList.remove('hidden');
      if (panel) {
        panel.classList.add('ring-2', 'ring-pink-500', 'border-pink-500');
      }
      if (focusBadge) focusBadge.classList.remove('hidden');
    } else {
      if (callout) callout.classList.add('hidden');
      if (panel) {
        panel.classList.remove('ring-2', 'ring-pink-500', 'border-pink-500');
      }
      if (focusBadge) focusBadge.classList.add('hidden');
    }
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
    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play(step.title + ". " + step.desc);
    }
  }

  function openZenAtemModal() { 
    var m = document.getElementById('modal-session-zen'); 
    if (m) { 
      m.classList.remove('hidden'); 
      m.style.display = 'flex'; 
    } 
    startZenBreathCycle();
  }

  function closeZenAtemModal() { 
    var m = document.getElementById('modal-session-zen'); 
    if (m) { 
      m.classList.add('hidden'); 
      m.style.display = 'none'; 
    } 
    stopZenBreathCycle();
  }

  function startZenBreathCycle() {
    stopZenBreathCycle();
    zenBreathPhase = 0;
    runZenBreathStep();
  }

  function stopZenBreathCycle() {
    if (zenBreathInterval) {
      clearTimeout(zenBreathInterval);
      zenBreathInterval = null;
    }
    var circle = document.getElementById('breath-circle');
    var txt = document.getElementById('breath-text');
    if (circle) circle.style.transform = 'scale(1)';
    if (txt) txt.innerText = "Einatmen (4s)";
  }

  function runZenBreathStep() {
    var circle = document.getElementById('breath-circle');
    var txt = document.getElementById('breath-text');

    if (zenBreathPhase === 0) {
      if (circle) {
        circle.style.transition = 'transform 4s cubic-bezier(0.4, 0, 0.2, 1)';
        circle.style.transform = 'scale(1.35)';
      }
      if (txt) txt.innerText = "Einatmen (4s)";
      zenBreathInterval = setTimeout(function() {
        zenBreathPhase = 1;
        runZenBreathStep();
      }, 4000);
    } else if (zenBreathPhase === 1) {
      if (txt) txt.innerText = "Atem halten (7s)";
      zenBreathInterval = setTimeout(function() {
        zenBreathPhase = 2;
        runZenBreathStep();
      }, 7000);
    } else {
      if (circle) {
        circle.style.transition = 'transform 8s cubic-bezier(0.4, 0, 0.2, 1)';
        circle.style.transform = 'scale(1)';
      }
      if (txt) txt.innerText = "Langsam ausatmen (8s)";
      zenBreathInterval = setTimeout(function() {
        zenBreathPhase = 0;
        runZenBreathStep();
      }, 8000);
    }
  }

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
      startZenBreathCycle();
    } else {
      if (bTrance) bTrance.className = "p-2.5 rounded-xl border bg-purple-950 border-purple-500 text-white font-bold text-center touch-btn";
      if (bBreath) bBreath.className = "p-2.5 rounded-xl border theme-panel text-slate-300 font-bold text-center touch-btn";
      if (vTrance) vTrance.classList.remove('hidden');
      if (vBreath) vBreath.classList.add('hidden');
      stopZenBreathCycle();
    }
  }

  function playGuidedTranceInduction() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }
    if (window.SessionAudio && typeof window.SessionAudio.ensureGraph === 'function') {
      window.SessionAudio.ensureGraph();
    }
    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play("Schließe die Augen. Atme tief in den Bauchraum aus. Lass die Schultern sinken und spüre das feste Gehaltensein.");
    }
  }

  function endSessionToAftercare() {
    isSessionPaused = true;
    var m = document.getElementById('modal-session-aftercare');
    if (m) { 
      m.classList.remove('hidden'); 
      m.style.display = 'flex'; 
    }
  }

  function closeAftercareModal() { 
    var m = document.getElementById('modal-session-aftercare'); 
    if (m) { 
      m.classList.add('hidden'); 
      m.style.display = 'none'; 
    } 
  }

  function completeSessionAndExit() {
    var topFeedEl = document.getElementById('aftercare-top-feedback');
    var subFeedEl = document.getElementById('aftercare-sub-feedback');
    var topFeed = (topFeedEl ? topFeedEl.value : '') || '';
    var subFeed = (subFeedEl ? subFeedEl.value : '') || '';

    var totalEdges = (window.SessionEdging && typeof window.SessionEdging.getEdgeCount === 'function')
      ? window.SessionEdging.getEdgeCount()
      : 0;

    var sessionEntry = {
      id: "sess_" + Date.now(),
      date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: currentSessionMode === 'guided' ? 'Geführt' : 'Freier Flow',
      intensity: window.sessionDepth || 7,
      top: (window.names && window.names[window.topPartner]) || 'Top',
      bottom: (window.names && window.names[window.subPartner]) || 'Bottom',
      durationMinutes: Math.max(1, Math.round((sessionTotalSeconds - sessionRemainingSeconds) / 60)),
      edgeCount: totalEdges,
      topFeedback: topFeed,
      bottomFeedback: subFeed,
      events: currentSessionLog
    };

    sessionDiary.unshift(sessionEntry);
    try { localStorage.setItem('kompass_session_diary', JSON.stringify(sessionDiary)); } catch (e) {}

    if (window.SessionAudio && typeof window.SessionAudio.stopAll === 'function') {
      window.SessionAudio.stopAll();
    }
    if (window.SessionVoice && typeof window.SessionVoice.stop === 'function') {
      window.SessionVoice.stop();
    }
    releaseScreenWakeLock();
    window.location.href = "analyse.html";
  }

  function openSessionDiaryModal() {
    renderSessionDiaryEntries();
    var m = document.getElementById('modal-session-diary');
    if (m) { 
      m.classList.remove('hidden'); 
      m.style.display = 'flex'; 
    }
  }

  function closeSessionDiaryModal() { 
    var m = document.getElementById('modal-session-diary'); 
    if (m) { 
      m.classList.add('hidden'); 
      m.style.display = 'none'; 
    } 
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

  function openSessionTabuModal() {
    renderSessionTabuList();
    var m = document.getElementById('modal-session-tabus');
    if (m) { 
      m.classList.remove('hidden'); 
      m.style.display = 'flex'; 
    }
  }

  function closeSessionTabuModal() { 
    var m = document.getElementById('modal-session-tabus'); 
    if (m) { 
      m.classList.add('hidden'); 
      m.style.display = 'none'; 
    } 
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
    if (airplayAudio && typeof airplayAudio.webkitShowPlaybackTargetPicker === 'function') {
      airplayAudio.webkitShowPlaybackTargetPicker();
    } else {
      showToast("AirPlay über das Kontrollzentrum steuern");
    }
  }

  function initLiveCockpit() {
    loadLiveStorage();
    checkUnratedSessions();
    updateHeaderTabuCounter();
  }

  window.SessionLive = {
    init: initLiveCockpit,
    selectMode: selectSessionMode,
    startSession: startLiveSessionWrapper,
    addMinutes: addSessionMinutes,
    togglePause: togglePauseTimer,
    endToAftercare: endSessionToAftercare,
    triggerSafeword: triggerSafewordWrapper,
    speakStep: speakCurrentLiveStep,
    nextStep: nextLiveStep,
    prevStep: prevLiveStep,
    openZen: openZenAtemModal,
    closeZen: closeZenAtemModal,
    selectZenMode: selectZenMode,
    playTrance: playGuidedTranceInduction,
    closeAftercare: closeAftercareModal,
    completeExit: completeSessionAndExit,
    openDiary: openSessionDiaryModal,
    closeDiary: closeSessionDiaryModal,
    dismissUnrated: dismissUnratedBanner,
    openTabus: openSessionTabuModal,
    closeTabus: closeSessionTabuModal,
    triggerAirPlay: triggerAirPlayPicker
  };

  // Direktanbindungen an window für alle inline onclick-Attribute
  window.triggerSafewordWrapper = triggerSafewordWrapper;
  window.selectSessionMode = selectSessionMode;
  window.startLiveSessionWrapper = startLiveSessionWrapper;
  window.togglePauseTimer = togglePauseTimer;
  window.addSessionMinutes = addSessionMinutes;
  window.renderLiveStep = renderLiveStep;
  window.nextLiveStep = nextLiveStep;
  window.prevLiveStep = prevLiveStep;
  window.speakCurrentLiveStep = speakCurrentLiveStep;
  window.openZenAtemModal = openZenAtemModal;
  window.closeZenAtemModal = closeZenAtemModal;
  window.selectZenMode = selectZenMode;
  window.playGuidedTranceInduction = playGuidedTranceInduction;
  window.endSessionToAftercare = endSessionToAftercare;
  window.closeAftercareModal = closeAftercareModal;
  window.completeSessionAndExit = completeSessionAndExit;
  window.openSessionDiaryModal = openSessionDiaryModal;
  window.closeSessionDiaryModal = closeSessionDiaryModal;
  window.dismissUnratedBanner = dismissUnratedBanner;
  window.openSessionTabuModal = openSessionTabuModal;
  window.closeSessionTabuModal = closeSessionTabuModal;
  window.updateHeaderTabuCounter = updateHeaderTabuCounter;
  window.triggerAirPlayPicker = triggerAirPlayPicker;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initLiveCockpit);
  } else {
    initLiveCockpit();
  }

})(window);
