/**
 * js/session_live.js
 * Zentraler Controller für das Live-Cockpit in der Schlafzimmer-Regie:
 * - Session-Timer (60:00) mit Pause & +10m Verlängerung
 * - Safeword-Ampel (Grün, Gelb, Rot) mit Audio-Ducking & Stopp-Signal
 * - Geführte Drehbuch-Schritte mit automatischer Edging-Callout-Erkennung
 * - Animierte 4-7-8 Vagus-Atmung (Pulsierender Kreis & Phasen-Wechsel)
 * - Session-Tagebuch & Aftercare-Protokoll
 * - Interaktive Tabu-Schranken mit Direktsprung zur Frage im Bogen
 */

(function(window) {
  'use strict';

  var sessionRemainingSeconds = 3600;
  var sessionTotalSeconds = 3600;
  var isSessionPaused = false;
  var sessionTimerInterval = null;
  var screenWakeLock = null;

  var currentSessionMode = 'guided';
  var liveStepIndex = 0;
  var currentSessionLog = [];

  var breathPhase = 0; // 0: Einatmen (4s), 1: Halten (7s), 2: Ausatmen (8s)
  var breathTimerInterval = null;
  var breathSecondsLeft = 4;

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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function acquireScreenWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        screenWakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (e) {
      console.debug("WakeLock nicht verfügbar", e);
    }
  }

  function releaseScreenWakeLock() {
    if (screenWakeLock) {
      screenWakeLock.release().catch(function() {});
      screenWakeLock = null;
    }
  }

  function startLiveSession() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') window.SessionVoice.unlock();
    if (window.SessionAudio && typeof window.SessionAudio.ensureGraph === 'function') window.SessionAudio.ensureGraph();
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

    currentSessionLog = [
      { type: "system", time: getFormattedTimeNow(), label: "Session gestartet" }
    ];

    if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      var topName = (window.names && window.names[window.topPartner]) || 'Top';
      window.SessionVoice.play("Session begonnen. " + topName + " übernimmt ab jetzt die Führung.");
    }

    if (window.SessionEdging && typeof window.SessionEdging.resetState === 'function') {
      window.SessionEdging.resetState();
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
    showToast(isSessionPaused ? "Session pausiert ⏸" : "Session fortgesetzt ▶");
  }

  function addSessionMinutes(mins) {
    sessionRemainingSeconds += mins * 60;
    sessionTotalSeconds += mins * 60;
    updateTimerDisplay();
    showToast("+" + mins + " Minuten Spielzeit hinzugefügt ⏱");
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
    if (phase) phase.innerText = step.phase ? step.phase.split(':')[0] : 'Phase';
    if (desc) desc.innerText = step.desc;
    if (topRole) topRole.innerText = step.top;
    if (subRole) subRole.innerText = step.sub;
    if (phasePill) phasePill.innerText = step.phase ? step.phase.split(':')[0] : 'Phase';

    var isEdgingStep = (step.title && (step.title.toLowerCase().indexOf('edging') !== -1 || step.title.toLowerCase().indexOf('kante') !== -1 || step.title.toLowerCase().indexOf('höhepunkt') !== -1));
    var edgingBanner = document.getElementById('guided-edging-callout');
    var edgingFocusBadge = document.getElementById('edging-focus-badge');
    var edgingCockpitPanel = document.getElementById('edging-cockpit-panel');

    if (isEdgingStep) {
      if (edgingBanner) edgingBanner.classList.remove('hidden');
      if (edgingFocusBadge) edgingFocusBadge.classList.remove('hidden');
      if (edgingCockpitPanel) {
        edgingCockpitPanel.classList.add('ring-2', 'ring-pink-500', 'border-pink-500');
      }
    } else {
      if (edgingBanner) edgingBanner.classList.add('hidden');
      if (edgingFocusBadge) edgingFocusBadge.classList.add('hidden');
      if (edgingCockpitPanel) {
        edgingCockpitPanel.classList.remove('ring-2', 'ring-pink-500', 'border-pink-500');
      }
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

  function triggerSafeword(color) {
    var ind = document.getElementById('safeword-red-indicator');
    var time = getFormattedTimeNow();

    if (color === 'green') {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword GRÜN: Bestätigung" });
      showToast("GRÜN bestätigt: Alles in bester Ordnung ✓");
      if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
        window.SessionVoice.play("Grün. Sehr gut.");
      }
    } else if (color === 'yellow') {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword GELB: Tempo drosseln" });
      showToast("⚠️ GELB ausgelöst: Tempo drosseln!");
      if (window.SessionAudio && typeof window.SessionAudio.adjustEnergy === 'function') {
        window.SessionAudio.adjustEnergy('calm');
      }
      if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
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
      if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
        window.SessionVoice.play("Halt. Sofortiger Stopp aller Handlungen.");
      }
      setTimeout(function() {
        if (ind) ind.classList.remove('animate-ping');
      }, 4000);
    }
  }

  function openZenAtemModal() {
    var m = document.getElementById('modal-session-zen');
    if (m) {
      m.classList.remove('hidden');
      m.style.display = 'flex';
      startVagusBreathingAnimation();
    }
  }

  function closeZenAtemModal() {
    var m = document.getElementById('modal-session-zen');
    if (m) {
      m.classList.add('hidden');
      m.style.display = 'none';
    }
    stopVagusBreathingAnimation();
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
      startVagusBreathingAnimation();
    } else {
      if (bTrance) bTrance.className = "p-2.5 rounded-xl border bg-purple-950 border-purple-500 text-white font-bold text-center touch-btn";
      if (bBreath) bBreath.className = "p-2.5 rounded-xl border theme-panel text-slate-300 font-bold text-center touch-btn";
      if (vTrance) vTrance.classList.remove('hidden');
      if (vBreath) vBreath.classList.add('hidden');
      stopVagusBreathingAnimation();
    }
  }

  function startVagusBreathingAnimation() {
    stopVagusBreathingAnimation();
    breathPhase = 0;
    breathSecondsLeft = 4;
    tickVagusBreathing();

    breathTimerInterval = setInterval(function() {
      breathSecondsLeft--;
      if (breathSecondsLeft <= 0) {
        breathPhase = (breathPhase + 1) % 3;
        if (breathPhase === 0) breathSecondsLeft = 4;
        else if (breathPhase === 1) breathSecondsLeft = 7;
        else breathSecondsLeft = 8;
      }
      tickVagusBreathing();
    }, 1000);
  }

  function tickVagusBreathing() {
    var circle = document.getElementById('breath-circle');
    var text = document.getElementById('breath-text');
    if (!circle || !text) return;

    if (breathPhase === 0) {
      // 4s Einatmen: Sanftes Anschwellen auf 142% mit türkisem Lichtkranz
      circle.style.transition = "transform 4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 4s ease";
      circle.style.transform = "scale(1.42)";
      circle.style.boxShadow = "0 0 45px rgba(45, 212, 191, 0.65)";
      text.innerText = "Einatmen (" + breathSecondsLeft + "s)";
      text.className = "absolute text-xs sm:text-sm font-black text-teal-200 pointer-events-none drop-shadow-md text-center px-2";
    } else if (breathPhase === 1) {
      // 7s Halten: Spannung ruhig halten
      circle.style.transition = "none";
      circle.style.transform = "scale(1.42)";
      circle.style.boxShadow = "0 0 60px rgba(45, 212, 191, 0.85)";
      text.innerText = "Atem halten (" + breathSecondsLeft + "s)";
      text.className = "absolute text-xs sm:text-sm font-black text-white pointer-events-none drop-shadow-md text-center px-2";
    } else {
      // 8s Ausatmen: Gleichmäßiges, tiefes Zurückgleiten in den Ruhezustand
      circle.style.transition = "transform 8s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 8s ease";
      circle.style.transform = "scale(1.0)";
      circle.style.boxShadow = "0 0 15px rgba(45, 212, 191, 0.2)";
      text.innerText = "Langsam ausatmen (" + breathSecondsLeft + "s)";
      text.className = "absolute text-xs sm:text-sm font-black text-slate-300 pointer-events-none drop-shadow-md text-center px-2";
    }
  }

  function stopVagusBreathingAnimation() {
    if (breathTimerInterval) {
      clearInterval(breathTimerInterval);
      breathTimerInterval = null;
    }
    var circle = document.getElementById('breath-circle');
    if (circle) {
      circle.style.transition = "none";
      circle.style.transform = "scale(1.0)";
      circle.style.boxShadow = "none";
    }
  }

  function playGuidedTranceInduction() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') window.SessionVoice.unlock();
    if (window.SessionAudio && typeof window.SessionAudio.ensureGraph === 'function') window.SessionAudio.ensureGraph();
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

    var edgeHits = (window.SessionEdging && typeof window.SessionEdging.getEdgeCount === 'function')
      ? window.SessionEdging.getEdgeCount()
      : 0;

    var diary = [];
    try {
      var raw = localStorage.getItem('kompass_session_diary');
      if (raw) diary = JSON.parse(raw);
    } catch (e) {}

    var sessionEntry = {
      id: "sess_" + Date.now(),
      date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: currentSessionMode === 'guided' ? 'Geführt' : 'Freier Flow',
      intensity: window.sessionDepth || 7,
      top: (window.names && window.names[window.topPartner]) || 'Top',
      bottom: (window.names && window.names[window.subPartner]) || 'Bottom',
      durationMinutes: Math.max(1, Math.round((sessionTotalSeconds - sessionRemainingSeconds) / 60)),
      edgeCount: edgeHits,
      topFeedback: topFeed,
      bottomFeedback: subFeed,
      events: currentSessionLog
    };

    diary.unshift(sessionEntry);
    try {
      localStorage.setItem('kompass_session_diary', JSON.stringify(diary));
    } catch (e) {}

    if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }

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

    var diary = [];
    try {
      var raw = localStorage.getItem('kompass_session_diary');
      if (raw) diary = JSON.parse(raw);
    } catch (e) {}

    if (diary.length === 0) {
      c.innerHTML = '<p class="text-slate-500 italic text-center py-4 text-xs">Noch keine Sessions im Logbuch verzeichnet.</p>';
      return;
    }

    c.innerHTML = diary.map(function(entry) {
      return `
        <div class="p-3.5 rounded-2xl theme-panel border border-slate-800 space-y-2">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span class="font-bold text-white text-xs">${escapeHtml(entry.date)} (${escapeHtml(entry.mode || 'Session')})</span>
            <span class="text-pink-400 font-mono font-bold text-xs">Stufe ${entry.intensity || 7}/10</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[10.5px] text-slate-300">
            <div>👑 Top: ${escapeHtml(entry.top || 'Top')}</div>
            <div>🧎 Bottom: ${escapeHtml(entry.bottom || 'Bottom')}</div>
            <div>⏱️ Dauer: ${entry.durationMinutes || 1} Min</div>
            <div>🎢 Edges: ${entry.edgeCount || 0}</div>
          </div>
          ${entry.topFeedback ? `<div class="p-2 rounded-xl bg-slate-900 text-[10.5px]"><strong class="text-brand-300">Top:</strong> ${escapeHtml(entry.topFeedback)}</div>` : ''}
          ${entry.bottomFeedback ? `<div class="p-2 rounded-xl bg-slate-900 text-[10.5px]"><strong class="text-indigo-300">Bottom:</strong> ${escapeHtml(entry.bottomFeedback)}</div>` : ''}
        </div>
      `;
    }).join('');
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
    var answers = window.answers || { A: {}, B: {} };
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var topPartner = window.topPartner || 'B';
    var subPartner = window.subPartner || 'A';

    var uAnswersTop = answers[topPartner] || {};
    var uAnswersSub = answers[subPartner] || {};

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
        <div class="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-900 space-y-2">
          <div class="flex items-center justify-between border-b border-indigo-900/50 pb-1">
            <strong class="text-indigo-200 block text-xs">Ausführungs-Grenzen (${escapeHtml(names[topPartner] || 'Top')}):</strong>
            <span class="text-[10px] font-mono text-indigo-400">${topTabus.length}</span>
          </div>
          <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            ${topTabus.length > 0 ? topTabus.map(function(t) {
              return `
                <a href="index.html#view=survey&jumpItem=${t.item.id}" class="block p-2 rounded-xl bg-slate-900 hover:bg-indigo-950 border border-indigo-950 hover:border-indigo-700 transition group touch-btn">
                  <div class="flex items-center justify-between">
                    <span class="text-white block font-bold text-[10.5px] group-hover:text-indigo-200">${escapeHtml(t.item.title)}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition">✏️ Ändern ↗</span>
                  </div>
                  <span class="text-indigo-300 text-[9.5px] block mt-0.5">⛔ Ausführung abgelehnt</span>
                </a>
              `;
            }).join('') : '<p class="text-slate-500 italic text-[10.5px] text-center py-2">Keine Ausführungs-Limits hinterlegt.</p>'}
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-rose-950/30 border border-rose-900 space-y-2">
          <div class="flex items-center justify-between border-b border-rose-900/50 pb-1">
            <strong class="text-rose-200 block text-xs">Schutz-Schranken (${escapeHtml(names[subPartner] || 'Bottom')}):</strong>
            <span class="text-[10px] font-mono text-rose-400">${subTabus.length}</span>
          </div>
          <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            ${subTabus.length > 0 ? subTabus.map(function(t) {
              return `
                <a href="index.html#view=survey&jumpItem=${t.item.id}" class="block p-2 rounded-xl bg-slate-900 hover:bg-rose-950 border border-rose-950 hover:border-rose-700 transition group touch-btn">
                  <div class="flex items-center justify-between">
                    <span class="text-white block font-bold text-[10.5px] group-hover:text-rose-200">${escapeHtml(t.item.title)}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition">✏️ Ändern ↗</span>
                  </div>
                  <span class="text-rose-300 text-[9.5px] block mt-0.5">🛑 Sofort-ROT bei Empfang</span>
                </a>
              `;
            }).join('') : '<p class="text-slate-500 italic text-[10.5px] text-center py-2">Keine Schutz-Schranken hinterlegt.</p>'}
          </div>
        </div>
      </div>
    `;
  }

  window.SessionLive = {
    startSession: startLiveSession,
    selectMode: function(m) { currentSessionMode = m; },
    togglePause: togglePauseTimer,
    addMinutes: addSessionMinutes,
    triggerSafeword: triggerSafeword,
    nextStep: nextLiveStep,
    prevStep: prevLiveStep,
    speakStep: speakCurrentLiveStep,
    openZen: openZenAtemModal,
    closeZen: closeZenAtemModal,
    selectZenMode: selectZenMode,
    playTrance: playGuidedTranceInduction,
    endToAftercare: endSessionToAftercare,
    closeAftercare: closeAftercareModal,
    completeExit: completeSessionAndExit,
    openDiary: openSessionDiaryModal,
    closeDiary: closeSessionDiaryModal,
    openTabus: openSessionTabuModal,
    closeTabus: closeSessionTabuModal
  };

  // Globale Registrierungen für inline onclick-Attribute
  window.startLiveSessionWrapper = startLiveSession;
  window.togglePauseTimer = togglePauseTimer;
  window.addSessionMinutes = addSessionMinutes;
  window.triggerSafewordWrapper = triggerSafeword;
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
  window.openSessionTabuModal = openSessionTabuModal;
  window.closeSessionTabuModal = closeSessionTabuModal;

})(window);
