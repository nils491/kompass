/**
 * js/session_live.js
 * TACTUS Schlafzimmer-Live-Regie, Organischer 4-7-8 Vagus-Atemkreis & Session-Tagebuch (V3.0 Haute-Horlogerie)
 * Offizielle Web-Präsenz: tactus.digital
 * 
 * TACTUS FEATURE CONTRACT:
 * [✓] Strikte Terminologie: Ausschließlich "Edge", "Edges", "Edging" (Keine "Kanten" / "Schwellen"!)
 * [✓] Echte Gemini-Stimmführung via SessionVoice.play()
 * [✓] Organisch fließende 4-7-8 Vagus-Atmung mit stetig atmendem Kreis (scale 1.48, Glow & weiche Transition)
 * [✓] Safeword-Ampel: GRÜN, GELB (Audio-Ducking 40% & Tempo drosseln), ROT (Beat-Drop Kaltstopp & Stillstand)
 * [✓] Screen WakeLock (Bildschirm bleibt im Halbdunkel aktiv)
 * [✓] Zwei Spielmodi: Geführtes 4-Phasen-Drehbuch vs. Freier Flow
 * [✓] Guided Edging Callout: Automatisches Hervorheben des Edging-Cockpits bei Schwellenschritten
 * [✓] Aftercare-Modal & Session-Tagebuch mit Top- und Bottom-Feedback
 * [✓] Tabu-Zähler & Tabu-Modal mit klickbaren Fragebogen-Deeplinks
 * [✓] 100 % UTF-8 Integrität, Haute-Horlogerie Design tokens, keine window.alert() Aufrufe
 */

(function(window) {
  'use strict';

  let sessionRemainingSeconds = 3600;
  let sessionTotalSeconds = 3600;
  let isSessionPaused = false;
  let sessionTimerInterval = null;
  let screenWakeLock = null;

  let currentSessionMode = 'guided'; // 'guided' | 'free'
  let liveStepIndex = 0;
  let currentSessionLog = [];

  let breathPhase = 0; // 0: Einatmen (4s), 1: Halten (7s), 2: Ausatmen (8s)
  let breathTimerInterval = null;
  let breathSecondsLeft = 4;

  function showToast(msg) {
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification(msg);
      return;
    }
    const c = document.getElementById('toast-container');
    if (!c) return;
    const el = document.createElement('div');
    el.className = "bg-[#090d14] text-[#f8fafc] font-mono text-xs px-4 py-2.5 rounded-2xl shadow-2xl border border-[#c5a880]/40 transition-all pointer-events-auto transform translate-y-2 opacity-0 flex items-center gap-2.5 backdrop-blur-md z-50";
    el.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-[#c5a880] flex-shrink-0 animate-pulse"></span>
      <span>${escapeHtml(msg)}</span>
    `;
    c.appendChild(el);
    setTimeout(() => el.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
      el.classList.add('opacity-0');
      setTimeout(() => el.remove(), 300);
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

  function updateHeaderTabuCounter() {
    const counterEl = document.getElementById('session-tabu-counter');
    const mobCountEl = document.getElementById('session-tabu-counter-mobile');
    if (!counterEl && !mobCountEl) return;

    const p1 = window.surveyChaptersPart1 || [];
    const p2 = window.surveyChaptersPart2 || [];
    const p3 = window.surveyChaptersPart3 || [];
    const allChapters = p1.concat(p2).concat(p3);

    let answers = { A: {}, B: {} };
    try {
      const stored = localStorage.getItem('kompass_answers');
      if (stored) answers = JSON.parse(stored);
    } catch (e) {}

    const topPartner = window.topPartner || localStorage.getItem('kompass_keyholder_role') || 'B';
    const subPartner = window.subPartner || localStorage.getItem('kompass_caged_role') || (topPartner === 'A' ? 'B' : 'A');

    const uAnswersTop = answers[topPartner] || {};
    const uAnswersSub = answers[subPartner] || {};

    let count = 0;
    allChapters.forEach(ch => {
      (ch.items || []).forEach(it => {
        if (it.type !== 'choice') {
          if (uAnswersTop['it_' + it.id + '_r1'] === 1) count++;
          if (uAnswersSub['it_' + it.id + '_r2'] === 1) count++;
        }
      });
    });

    if (counterEl) counterEl.innerText = count.toString();
    if (mobCountEl) mobCountEl.innerText = count.toString();
  }

  async function acquireScreenWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        screenWakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (e) {
      console.debug("[TACTUS Live] WakeLock nicht verfügbar:", e);
    }
  }

  function releaseScreenWakeLock() {
    if (screenWakeLock) {
      screenWakeLock.release().catch(() => {});
      screenWakeLock = null;
    }
  }

  function startLiveSession() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }
    if (window.SessionAudio && typeof window.SessionAudio.ensureAudioContext === 'function') {
      window.SessionAudio.ensureAudioContext();
    }
    acquireScreenWakeLock();

    const pContainer = document.getElementById('portal-setup-container');
    const cContainer = document.getElementById('cockpit-live-container');
    const badge = document.getElementById('session-active-badge');
    const gContainer = document.getElementById('guided-step-container');
    const freeFlowBanner = document.getElementById('free-flow-info-banner');
    const phasePill = document.getElementById('session-phase-pill');

    if (pContainer) pContainer.classList.add('hidden');
    if (cContainer) cContainer.classList.remove('hidden');
    if (badge) badge.classList.remove('hidden');

    if (currentSessionMode === 'free') {
      if (gContainer) gContainer.classList.add('hidden');
      if (freeFlowBanner) freeFlowBanner.classList.remove('hidden');
      if (phasePill) {
        phasePill.innerText = "Freier Flow";
        phasePill.className = "px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider bg-[#000000] text-[#c5a880] border border-[#c5a880]/60 inline-block";
      }
      showToast("Freier Flow aktiv: Regiepult ohne feste Schritte gestartet 🌊");
    } else {
      if (gContainer) gContainer.classList.remove('hidden');
      if (freeFlowBanner) freeFlowBanner.classList.add('hidden');
      if (phasePill) {
        phasePill.className = "px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase tracking-wider bg-[#450a0a] text-[#f8fafc] border border-[#991b1b] inline-block";
      }
      renderLiveStep();
    }

    sessionRemainingSeconds = sessionTotalSeconds = 3600;
    isSessionPaused = false;
    startSessionTimer();

    currentSessionLog = [
      { type: "system", time: getFormattedTimeNow(), label: "Session gestartet (" + (currentSessionMode === 'free' ? "Freier Flow" : "Geführt") + ")" }
    ];

    const isVoiceAssistActive = localStorage.getItem('kompass_voice_assist_active') !== 'false';
    if (isVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      const topPartner = window.topPartner || localStorage.getItem('kompass_keyholder_role') || 'B';
      const names = window.names || { A: 'Partner 1', B: 'Partner 2' };
      const topName = names[topPartner] || 'Top';

      const introSpeech = (currentSessionMode === 'free')
        ? `Freier Flow begonnen. ${topName} führt nach eigenem Ermessen.`
        : `Session begonnen. ${topName} übernimmt ab jetzt die Führung.`;

      window.SessionVoice.play(introSpeech);
    }

    if (window.SessionEdging && typeof window.SessionEdging.resetState === 'function') {
      window.SessionEdging.resetState();
    }
  }

  function startSessionTimer() {
    if (sessionTimerInterval) clearInterval(sessionTimerInterval);
    sessionTimerInterval = setInterval(() => {
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
    const disp = document.getElementById('session-timer-display');
    if (!disp) return;
    const m = Math.floor(sessionRemainingSeconds / 60);
    const s = sessionRemainingSeconds % 60;
    disp.innerText = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  }

  function togglePauseTimer() {
    isSessionPaused = !isSessionPaused;
    const btn = document.getElementById('btn-pause-timer');
    if (btn) btn.innerText = isSessionPaused ? "Weiter" : "Pause";
    showToast(isSessionPaused ? "Session pausiert ⏸" : "Session fortgesetzt ▶");
  }

  function addSessionMinutes(mins) {
    sessionRemainingSeconds += mins * 60;
    sessionTotalSeconds += mins * 60;
    updateTimerDisplay();
    showToast(`+${mins} Minuten Spielzeit hinzugefügt ⏱`);
  }

  function renderLiveStep() {
    const playbook = window.currentSelectedPlaybook || [];
    const step = playbook[liveStepIndex];
    if (!step) return;

    const badge = document.getElementById('live-step-badge');
    const title = document.getElementById('live-step-title');
    const phase = document.getElementById('live-step-phase');
    const desc = document.getElementById('live-step-desc');
    const topRole = document.getElementById('live-step-top-role');
    const subRole = document.getElementById('live-step-sub-role');
    const phasePill = document.getElementById('session-phase-pill');

    if (badge) badge.innerText = `Schritt ${liveStepIndex + 1} / ${playbook.length}`;
    if (title) title.innerText = step.title;
    if (phase) phase.innerText = step.phase ? step.phase.split(':')[0] : 'Phase';
    if (desc) desc.innerText = step.desc;
    if (topRole) topRole.innerText = step.top;
    if (subRole) subRole.innerText = step.sub;
    if (phasePill && currentSessionMode !== 'free') {
      phasePill.innerText = step.phase ? step.phase.split(':')[0] : 'Phase';
    }

    const lowerTitle = (step.title || '').toLowerCase();
    const isEdgingStep = (lowerTitle.includes('edging') || lowerTitle.includes('edge') || lowerTitle.includes('höhepunkt'));
    
    const edgingBanner = document.getElementById('guided-edging-callout');
    const edgingFocusBadge = document.getElementById('edging-focus-badge');
    const edgingCockpitPanel = document.getElementById('edging-cockpit-panel');

    if (isEdgingStep) {
      if (edgingBanner) edgingBanner.classList.remove('hidden');
      if (edgingFocusBadge) edgingFocusBadge.classList.remove('hidden');
      if (edgingCockpitPanel) {
        edgingCockpitPanel.classList.add('ring-2', 'ring-[#c5a880]', 'border-[#c5a880]');
      }
    } else {
      if (edgingBanner) edgingBanner.classList.add('hidden');
      if (edgingFocusBadge) edgingFocusBadge.classList.add('hidden');
      if (edgingCockpitPanel) {
        edgingCockpitPanel.classList.remove('ring-2', 'ring-[#c5a880]', 'border-[#c5a880]');
      }
    }
  }

  function nextLiveStep() {
    const playbook = window.currentSelectedPlaybook || [];
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
    const playbook = window.currentSelectedPlaybook || [];
    const step = playbook[liveStepIndex];
    if (!step) return;
    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play(`${step.title}. ${step.desc}`);
    }
  }

  function triggerSafeword(color) {
    const ind = document.getElementById('safeword-red-indicator');
    const time = getFormattedTimeNow();
    const isVoiceAssistActive = localStorage.getItem('kompass_voice_assist_active') !== 'false';

    if (color === 'green') {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword GRÜN: Bestätigung" });
      showToast("GRÜN bestätigt: Alles in bester Ordnung ✓");
      if (isVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
        window.SessionVoice.play("Grün. Sehr gut.");
      }
    } else if (color === 'yellow') {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword GELB: Tempo drosseln" });
      showToast("⚠️ GELB ausgelöst: Tempo drosseln!");
      if (window.SessionAudio && typeof window.SessionAudio.duck === 'function') {
        window.SessionAudio.duck(0.40);
        setTimeout(() => {
          if (window.SessionAudio && typeof window.SessionAudio.unduck === 'function') {
            window.SessionAudio.unduck(1.5);
          }
        }, 3500);
      }
      if (isVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
        window.SessionVoice.play("Gelb registriert. Tempo drosseln und durchatmen.");
      }
    } else {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword ROT: Sofort-Abbruch" });
      if (ind) ind.classList.add('animate-ping');
      isSessionPaused = true;
      if (window.SessionAudio && typeof window.SessionAudio.coldStop === 'function') {
        window.SessionAudio.coldStop();
      }
      showToast("🛑 ROT AUSGELÖST: Sofortiger Stillstand!");
      if (isVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
        window.SessionVoice.play("Halt. Sofortiger Stopp aller Handlungen.");
      }
      setTimeout(() => {
        if (ind) ind.classList.remove('animate-ping');
      }, 4000);
    }
  }

  function openZenAtemModal() {
    const m = document.getElementById('modal-session-zen');
    if (m) {
      m.classList.remove('hidden');
      m.style.display = 'flex';
      startVagusBreathingAnimation();
    }
  }

  function closeZenAtemModal() {
    const m = document.getElementById('modal-session-zen');
    if (m) {
      m.classList.add('hidden');
      m.style.display = 'none';
    }
    stopVagusBreathingAnimation();
  }

  function selectZenMode(mode) {
    const bBreath = document.getElementById('btn-zen-mode-breath');
    const bTrance = document.getElementById('btn-zen-mode-trance');
    const vBreath = document.getElementById('zen-view-breath');
    const vTrance = document.getElementById('zen-view-trance');

    if (mode === 'breath') {
      if (bBreath) bBreath.className = "p-2.5 rounded-xl border bg-[#000000] border-[#c5a880] text-[#c5a880] font-bold text-center touch-btn shadow-sm";
      if (bTrance) bTrance.className = "p-2.5 rounded-xl border bg-[#090d14] border-[#2a364f] text-[#94a3b8] font-bold text-center touch-btn";
      if (vBreath) vBreath.classList.remove('hidden');
      if (vTrance) vTrance.classList.add('hidden');
      startVagusBreathingAnimation();
    } else {
      if (bTrance) bTrance.className = "p-2.5 rounded-xl border bg-[#000000] border-[#c5a880] text-[#c5a880] font-bold text-center touch-btn shadow-sm";
      if (bBreath) bBreath.className = "p-2.5 rounded-xl border bg-[#090d14] border-[#2a364f] text-[#94a3b8] font-bold text-center touch-btn";
      if (vTrance) vTrance.classList.remove('hidden');
      if (vBreath) vBreath.classList.add('hidden');
      stopVagusBreathingAnimation();
    }
  }

  function applyBreathingCirclePhase(phase) {
    const circle = document.getElementById('breath-circle');
    if (!circle) return;

    if (phase === 0) {
      // 4s Einatmen
      circle.style.transition = "transform 4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 4s ease, border-color 4s ease";
      circle.style.transform = "scale(1.48)";
      circle.style.boxShadow = "0 0 65px rgba(197, 168, 128, 0.65), inset 0 0 30px rgba(197, 168, 128, 0.35)";
      circle.style.borderColor = "#c5a880";
    } else if (phase === 1) {
      // 7s Halten
      circle.style.transition = "transform 1.5s ease-in-out, box-shadow 1.5s ease-in-out";
      circle.style.transform = "scale(1.50)";
      circle.style.boxShadow = "0 0 75px rgba(223, 202, 169, 0.8), inset 0 0 40px rgba(223, 202, 169, 0.5)";
      circle.style.borderColor = "#dfcaa9";
    } else {
      // 8s Ausatmen
      circle.style.transition = "transform 8s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 8s ease, border-color 8s ease";
      circle.style.transform = "scale(1.0)";
      circle.style.boxShadow = "0 0 15px rgba(197, 168, 128, 0.2)";
      circle.style.borderColor = "rgba(197, 168, 128, 0.4)";
    }
  }

  function updateBreathingText(phase, secondsLeft) {
    const text = document.getElementById('breath-text');
    if (!text) return;

    if (phase === 0) {
      text.innerText = `Einatmen (${secondsLeft}s)`;
      text.className = "absolute text-xs sm:text-sm font-black font-serif text-[#dfcaa9] pointer-events-none drop-shadow-md text-center px-2";
    } else if (phase === 1) {
      text.innerText = `Atem halten (${secondsLeft}s)`;
      text.className = "absolute text-xs sm:text-sm font-black font-serif text-white pointer-events-none drop-shadow-md text-center px-2";
    } else {
      text.innerText = `Langsam ausatmen (${secondsLeft}s)`;
      text.className = "absolute text-xs sm:text-sm font-black font-serif text-[#94a3b8] pointer-events-none drop-shadow-md text-center px-2";
    }
  }

  function startVagusBreathingAnimation() {
    stopVagusBreathingAnimation();
    breathPhase = 0;
    breathSecondsLeft = 4;

    applyBreathingCirclePhase(breathPhase);
    updateBreathingText(breathPhase, breathSecondsLeft);

    breathTimerInterval = setInterval(() => {
      breathSecondsLeft--;
      if (breathSecondsLeft <= 0) {
        breathPhase = (breathPhase + 1) % 3;
        if (breathPhase === 0) breathSecondsLeft = 4;
        else if (breathPhase === 1) breathSecondsLeft = 7;
        else breathSecondsLeft = 8;

        applyBreathingCirclePhase(breathPhase);
      }
      updateBreathingText(breathPhase, breathSecondsLeft);
    }, 1000);
  }

  function stopVagusBreathingAnimation() {
    if (breathTimerInterval) {
      clearInterval(breathTimerInterval);
      breathTimerInterval = null;
    }
    const circle = document.getElementById('breath-circle');
    if (circle) {
      circle.style.transition = "none";
      circle.style.transform = "scale(1.0)";
      circle.style.boxShadow = "none";
    }
  }

  function playGuidedTranceInduction() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }
    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play("Schließe die Augen. Atme tief in den Bauchraum aus. Lass die Schultern sinken und spüre das feste Gehaltensein.");
    }
  }

  function endSessionToAftercare() {
    isSessionPaused = true;
    const m = document.getElementById('modal-session-aftercare');
    if (m) {
      m.classList.remove('hidden');
      m.style.display = 'flex';
    }
  }

  function closeAftercareModal() {
    const m = document.getElementById('modal-session-aftercare');
    if (m) {
      m.classList.add('hidden');
      m.style.display = 'none';
    }
  }

  function completeSessionAndExit() {
    const topFeedEl = document.getElementById('aftercare-top-feedback');
    const subFeedEl = document.getElementById('aftercare-sub-feedback');
    const topFeed = (topFeedEl ? topFeedEl.value : '') || '';
    const subFeed = (subFeedEl ? subFeedEl.value : '') || '';

    const edgeHits = (window.SessionEdging && typeof window.SessionEdging.getEdgeCount === 'function')
      ? window.SessionEdging.getEdgeCount()
      : 0;

    let diary = [];
    try {
      const raw = localStorage.getItem('tactus_session_logbook') || localStorage.getItem('kompass_session_diary');
      if (raw) diary = JSON.parse(raw);
    } catch (e) {}

    const topPartner = window.topPartner || localStorage.getItem('kompass_keyholder_role') || 'B';
    const subPartner = window.subPartner || localStorage.getItem('kompass_caged_role') || (topPartner === 'A' ? 'B' : 'A');
    const names = window.names || { A: 'Partner 1', B: 'Partner 2' };

    const sessionEntry = {
      id: "sess_" + Date.now(),
      date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: currentSessionMode === 'guided' ? 'Geführt' : 'Freier Flow',
      intensity: window.sessionDepth || 7,
      top: names[topPartner] || 'Top',
      bottom: names[subPartner] || 'Bottom',
      durationMinutes: Math.max(1, Math.round((sessionTotalSeconds - sessionRemainingSeconds) / 60)),
      edgeCount: edgeHits,
      topFeedback: topFeed,
      bottomFeedback: subFeed,
      events: currentSessionLog,
      timestamp: Date.now()
    };

    diary.unshift(sessionEntry);
    try {
      localStorage.setItem('tactus_session_logbook', JSON.stringify(diary));
      localStorage.setItem('kompass_session_diary', JSON.stringify(diary));
    } catch (e) {}

    if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }

    if (window.SessionAudio && typeof window.SessionAudio.stopDrone === 'function') {
      window.SessionAudio.stopDrone();
    }
    if (window.SessionVoice && typeof window.SessionVoice.stop === 'function') {
      window.SessionVoice.stop();
    }

    releaseScreenWakeLock();
    window.location.href = "analyse.html";
  }

  function openSessionDiaryModal() {
    renderSessionDiaryEntries();
    const m = document.getElementById('modal-session-diary');
    if (m) {
      m.classList.remove('hidden');
      m.style.display = 'flex';
    }
  }

  function closeSessionDiaryModal() {
    const m = document.getElementById('modal-session-diary');
    if (m) {
      m.classList.add('hidden');
      m.style.display = 'none';
    }
  }

  function renderSessionDiaryEntries() {
    const c = document.getElementById('session-diary-entries-container');
    if (!c) return;

    let diary = [];
    try {
      const raw = localStorage.getItem('tactus_session_logbook') || localStorage.getItem('kompass_session_diary');
      if (raw) diary = JSON.parse(raw);
    } catch (e) {}

    if (diary.length === 0) {
      c.innerHTML = '<p class="text-[#94a3b8] italic text-center py-6 text-xs font-mono">Noch keine Sessions im Logbuch verzeichnet.</p>';
      return;
    }

    c.innerHTML = diary.map(entry => {
      return `
        <div class="p-3.5 rounded-2xl bg-[#090d14] border border-[#2a364f] space-y-2 font-sans">
          <div class="flex items-center justify-between border-b border-[#2a364f] pb-1.5 font-mono text-xs">
            <span class="font-bold text-white text-xs">${escapeHtml(entry.date)} (${escapeHtml(entry.mode || 'Session')})</span>
            <span class="text-[#c5a880] font-bold text-xs">Stufe ${entry.intensity || 7}/10</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[10.5px] text-[#94a3b8] font-mono">
            <div>👑 Top: <strong class="text-white">${escapeHtml(entry.top || 'Top')}</strong></div>
            <div>🧎 Bottom: <strong class="text-[#c5a880]">${escapeHtml(entry.bottom || 'Bottom')}</strong></div>
            <div>⏱️ Dauer: <strong class="text-white">${entry.durationMinutes || 1} Min</strong></div>
            <div>⚡ Edges: <strong class="text-[#c5a880]">${entry.edgeCount || 0}</strong></div>
          </div>
          ${entry.topFeedback ? `<div class="p-2.5 rounded-xl bg-[#000000] border border-[#2a364f] text-[10.5px] text-[#f8fafc]"><strong class="text-[#c5a880] font-mono">Top:</strong> ${escapeHtml(entry.topFeedback)}</div>` : ''}
          ${entry.bottomFeedback ? `<div class="p-2.5 rounded-xl bg-[#000000] border border-[#2a364f] text-[10.5px] text-[#f8fafc]"><strong class="text-[#b3734a] font-mono">Bottom:</strong> ${escapeHtml(entry.bottomFeedback)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function openSessionTabuModal() {
    renderSessionTabuList();
    const m = document.getElementById('modal-session-tabus');
    if (m) {
      m.classList.remove('hidden');
      m.style.display = 'flex';
    }
  }

  function closeSessionTabuModal() {
    const m = document.getElementById('modal-session-tabus');
    if (m) {
      m.classList.add('hidden');
      m.style.display = 'none';
    }
  }

  function renderSessionTabuList() {
    const c = document.getElementById('session-tabu-list-container');
    if (!c) return;

    const p1 = window.surveyChaptersPart1 || [];
    const p2 = window.surveyChaptersPart2 || [];
    const p3 = window.surveyChaptersPart3 || [];
    const allChapters = p1.concat(p2).concat(p3);

    let answers = { A: {}, B: {} };
    try {
      const stored = localStorage.getItem('kompass_answers');
      if (stored) answers = JSON.parse(stored);
    } catch (e) {}

    const topPartner = window.topPartner || localStorage.getItem('kompass_keyholder_role') || 'B';
    const subPartner = window.subPartner || localStorage.getItem('kompass_caged_role') || (topPartner === 'A' ? 'B' : 'A');
    const names = window.names || { A: 'Partner 1', B: 'Partner 2' };

    const uAnswersTop = answers[topPartner] || {};
    const uAnswersSub = answers[subPartner] || {};

    const topTabus = [];
    const subTabus = [];

    allChapters.forEach(ch => {
      (ch.items || []).forEach(it => {
        if (it.type !== 'choice') {
          if (uAnswersTop['it_' + it.id + '_r1'] === 1) topTabus.push({ item: it, role: it.r1Label || 'Führen' });
          if (uAnswersSub['it_' + it.id + '_r2'] === 1) subTabus.push({ item: it, role: it.r2Label || 'Empfangen' });
        }
      });
    });

    c.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
        <div class="p-3.5 rounded-2xl bg-[#090d14] border border-[#2a364f] space-y-2">
          <div class="flex items-center justify-between border-b border-[#2a364f] pb-1.5 font-mono">
            <strong class="text-white block text-xs">Ausführungs-Grenzen (${escapeHtml(names[topPartner] || 'Top')}):</strong>
            <span class="text-[10px] text-[#c5a880] font-bold">${topTabus.length}</span>
          </div>
          <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            ${topTabus.length > 0 ? topTabus.map(t => {
              return `
                <a href="index.html#view=survey&item=${t.item.id}" target="_blank" class="block p-2.5 rounded-xl bg-[#000000] border border-[#2a364f] hover:border-[#c5a880] transition group touch-btn">
                  <div class="flex items-center justify-between">
                    <span class="text-white block font-bold text-[10.5px] group-hover:text-[#c5a880]">${escapeHtml(t.item.title)}</span>
                    <span class="text-[9px] px-2 py-0.5 rounded bg-[#090d14] text-[#c5a880] border border-[#2a364f] font-mono font-bold">Ändern ↗</span>
                  </div>
                  <span class="text-[#991b1b] text-[9.5px] font-mono block mt-0.5">⛔ Ausführung abgelehnt</span>
                </a>
              `;
            }).join('') : '<p class="text-[#94a3b8] italic text-[10.5px] text-center py-3 font-mono">Keine Ausführungs-Limits hinterlegt.</p>'}
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-[#090d14] border border-[#2a364f] space-y-2">
          <div class="flex items-center justify-between border-b border-[#2a364f] pb-1.5 font-mono">
            <strong class="text-white block text-xs">Schutz-Schranken (${escapeHtml(names[subPartner] || 'Bottom')}):</strong>
            <span class="text-[10px] text-[#991b1b] font-bold">${subTabus.length}</span>
          </div>
          <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            ${subTabus.length > 0 ? subTabus.map(t => {
              return `
                <a href="index.html#view=survey&item=${t.item.id}" target="_blank" class="block p-2.5 rounded-xl bg-[#000000] border border-[#2a364f] hover:border-[#991b1b] transition group touch-btn">
                  <div class="flex items-center justify-between">
                    <span class="text-white block font-bold text-[10.5px] group-hover:text-red-300">${escapeHtml(t.item.title)}</span>
                    <span class="text-[9px] px-2 py-0.5 rounded bg-[#090d14] text-[#991b1b] border border-[#2a364f] font-mono font-bold">Ändern ↗</span>
                  </div>
                  <span class="text-[#991b1b] text-[9.5px] font-mono block mt-0.5">🛑 Sofort-ROT bei Empfang</span>
                </a>
              `;
            }).join('') : '<p class="text-[#94a3b8] italic text-[10.5px] text-center py-3 font-mono">Keine Schutz-Schranken hinterlegt.</p>'}
          </div>
        </div>
      </div>
    `;
  }

  const api = {
    startSession: startLiveSession,
    selectMode: (m) => { currentSessionMode = m; },
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
    closeTabus: closeSessionTabuModal,
    updateTabuCounter: updateHeaderTabuCounter
  };

  window.SessionLive = api;

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
  window.updateHeaderTabuCounter = updateHeaderTabuCounter;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', updateHeaderTabuCounter);
    } else {
      setTimeout(updateHeaderTabuCounter, 50);
    }
  }

})(typeof window !== 'undefined' ? window : this);
