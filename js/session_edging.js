/**
 * js/session_edging.js
 * Modul für die Edging-Fernbedienung des Tops in der Schlafzimmer-Regie.
 * 
 * Features & Perfektionierungen:
 * - 🎯 Exakte Audio-Visual-Synchronisation: Zahlen laufen erst los, wenn die Stimme WIRKLICH ertönt
 * - ⏳ Eleganter Vorbereitungs-/Lade-Puls ("Stimme fokussiert...") während Gemini generiert
 * - ⏱️ JOI-Zeitstepper: Default 20s mit flexiblen [- 5s] und [+ 5s] Reglern (5s bis 60s)
 * - 🎙️ Vertiefte JOI-Sprachführung (Jerk-Off Instruction): Rhythmus, Atem-Takt, Kanten-Qual
 * - 🛡️ Sofortige AudioContext-Entriegelung bei allen Klicks
 */

(function(window) {
  'use strict';

  var activeArousalLevel = 5;
  var edgingStimulationBy = 'top';
  var edgeCount = 0;
  var lastEdgeTimestamp = null;
  var lastEdgeIntervalTimer = null;
  var cooldownTimerInterval = null;
  var cooldownSecondsRemaining = 45;

  var targetEdgingDuration = 20; // Default: 20 Sekunden
  var currentEdgingCountdown = 20;
  var isCountdownActive = false;
  var isEdgingCountdownPaused = false;
  var countdownRunId = 0;
  var countdownVoiceMode = 'gemini'; // 'gemini' oder 'self'

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

  function logSessionAction(label) {
    var entry = { type: "action", time: getFormattedTimeNow(), label: label };
    if (window.currentSessionLog && Array.isArray(window.currentSessionLog)) {
      window.currentSessionLog.push(entry);
    }
  }

  function setCountdownVoiceMode(mode) {
    countdownVoiceMode = mode;
    var bSelf = document.getElementById('btn-voice-mode-self');
    var bGemini = document.getElementById('btn-voice-mode-gemini');
    var lbl = document.getElementById('label-current-voice-mode');

    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }

    if (mode === 'self') {
      if (bSelf) bSelf.className = "p-2 rounded-xl border text-left touch-btn transition bg-indigo-950/60 border-indigo-500 shadow-md";
      if (bGemini) bGemini.className = "p-2 rounded-xl border text-left touch-btn transition theme-panel border-slate-800 text-slate-400 hover:border-slate-700";
      if (lbl) { lbl.innerText = "Top spricht selbst"; lbl.className = "text-[10px] font-mono text-indigo-300 font-bold"; }
      showToast("Modus: Top gibt die Kanten-Befehle selbst 🗣️");
    } else {
      if (bGemini) bGemini.className = "p-2 rounded-xl border text-left touch-btn transition bg-purple-950/60 border-purple-500 shadow-md";
      if (bSelf) bSelf.className = "p-2 rounded-xl border text-left touch-btn transition theme-panel border-slate-800 text-slate-400 hover:border-slate-700";
      if (lbl) { lbl.innerText = "Gemini spricht laut"; lbl.className = "text-[10px] font-mono text-purple-300 font-bold"; }
      
      window.isTopVoiceAssistActive = true;
      try { localStorage.setItem('kompass_voice_assist_active', 'true'); } catch (e) {}
      showToast("Modus: Gemini-App-Stimme führt laut durch die Kante 🔊");
    }
  }

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

    if (activeArousalLevel >= 8 && window.SessionAudio && typeof window.SessionAudio.adjustEnergy === 'function') {
      window.SessionAudio.adjustEnergy('energy');
    }

    if (countdownVoiceMode === 'gemini' && window.SessionVoice && typeof window.SessionVoice.play === 'function' && Math.random() < 0.35) {
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
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }

    edgeCount++;
    lastEdgeTimestamp = Date.now();
    var hitsEl = document.getElementById('edging-total-hits');
    if (hitsEl) hitsEl.innerText = edgeCount;

    logSessionAction("Edge #" + edgeCount + " erreicht (Stufe 10)");
    showToast("Edge #" + edgeCount + " registriert!");
    startLastEdgeTimer();
    startCooldownBreathingTimer();

    if (countdownVoiceMode === 'gemini' && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
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
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }
    var panel = document.getElementById('release-choice-subpanel');
    if (panel) {
      panel.classList.toggle('hidden');
      updateDurationStepperUI();
    }
  }

  function stepCountdownDuration(delta) {
    var newDur = targetEdgingDuration + delta;
    if (newDur < 5) newDur = 5;
    if (newDur > 60) newDur = 60;
    setCountdownDuration(newDur);
  }

  function setCountdownDuration(seconds) {
    targetEdgingDuration = Math.max(5, Math.min(60, parseInt(seconds, 10) || 20));
    updateDurationStepperUI();
  }

  function updateDurationStepperUI() {
    var durLabel = document.getElementById('selected-countdown-duration-label');
    var btnLabel = document.getElementById('btn-cd-label-sec');
    if (durLabel) durLabel.innerText = targetEdgingDuration + "s";
    if (btnLabel) btnLabel.innerText = targetEdgingDuration + "s";

    [5, 10, 20, 30].forEach(function(s) {
      var btn = document.getElementById('btn-cd-dur-' + s);
      if (btn) {
        if (s === targetEdgingDuration) {
          btn.className = "py-1.5 rounded-lg border text-[10.5px] font-bold bg-emerald-950 border-emerald-500 text-emerald-300 touch-btn shadow-sm";
        } else {
          btn.className = "py-1.5 rounded-lg border text-[10.5px] font-bold theme-panel text-slate-400 touch-btn";
        }
      }
    });
  }

  function getCountdownConfig(durationSeconds) {
    if (durationSeconds <= 7) return { startNum: 5, stepMs: 1150 };
    if (durationSeconds <= 12) return { startNum: 10, stepMs: 1150 };
    if (durationSeconds <= 22) return { startNum: 16, stepMs: 1250 };
    if (durationSeconds <= 35) return { startNum: 25, stepMs: 1300 };
    return { startNum: 30, stepMs: 1350 };
  }

  function buildDynamicCountdownSpeechText(durationSeconds, subName) {
    var name = subName || 'mein Schatz';

    if (durationSeconds <= 7) {
      return "Fünf... Vier... Blick fest zu mir... Drei... Zwei... Eins... Jetzt! Lass alles los und komm für mich!";
    }

    if (durationSeconds <= 12) {
      return "Zehn... tief durchatmen... Neun... Acht... nicht bewegen, " + name + "... " +
             "Sieben... Sechs... spüre die Glut... " +
             "Fünf... Vier... Drei... Zwei... Eins... Jetzt! Lass alles los und komm für mich!";
    }

    if (durationSeconds <= 22) {
      return "Sechzehn... nicht bewegen, " + name + "... " +
             "Fünfzehn... Vierzehn... tief in den Bauchraum atmen... " +
             "Dreizehn... Zwölf... Elf... spüre das Pochen an der Kante... " +
             "Zehn... Neun... Acht... halte die Spannung reglos... " +
             "Sieben... Sechs... Fünf... gleich hast du es... " +
             "Vier... Drei... Zwei... Eins... Jetzt! Explodiere für mich!";
    }

    // 25-60 Sekunden: Intensive JOI (Jerk-Off Instruction) Führung
    return "Fünfundzwanzig... Vierundzwanzig... ganz ruhig ausatmen, " + name + "... " +
           "Dreiundzwanzig... Zweiundzwanzig... Einundzwanzig... Zwanzig... spüre jeden Herzschlag... " +
           "Neunzehn... Achtzehn... Siebzehn... Sechzehn... bleib reglos an der Kante... " +
           "Fünfzehn... Vierzehn... Dreizehn... Zwölf... die Lust halten... " +
           "Elf... Zehn... Neun... Acht... der Druck steigt... " +
           "Sieben... Sechs... Fünf... Vier... Drei... Zwei... Eins... Jetzt! Lass alles fließen und komm!";
  }

  function triggerDisplayBeat(text, stepMs) {
    var disp = document.getElementById('countdown-display');
    if (!disp) return;

    disp.innerText = text;
    if (stepMs) {
      disp.style.setProperty('--beat-duration', (stepMs / 1000) + 's');
    }

    disp.classList.remove('countdown-beat-active', 'climax-pulse-active');
    void disp.offsetWidth;
    disp.classList.add('countdown-beat-active');
  }

  function executeReleaseImmediate() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }

    logSessionAction("Orgasmus-Freigabe (Sofort)");
    var panel = document.getElementById('release-choice-subpanel');
    if (panel) panel.classList.add('hidden');
    showToast("Sofortige Freigabe erteilt!");

    if (countdownVoiceMode === 'self') {
      showToast("🗣️ Sprich jetzt: 'Jetzt! Lass alles los und komm für mich!'");
    } else if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play("Jetzt! Lass alles los und komm für mich!");
    }
  }

  async function executeReleaseWithCountdown() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }

    var panel = document.getElementById('release-choice-subpanel');
    var wrap = document.getElementById('countdown-wrapper');
    var disp = document.getElementById('countdown-display');
    var cueText = document.getElementById('countdown-cue-text');
    var pill = document.getElementById('countdown-mode-pill');
    var btnText = document.getElementById('btn-pause-countdown-text');

    if (panel) panel.classList.add('hidden');
    if (wrap) {
      wrap.classList.remove('hidden');
      wrap.style.display = 'flex';
    }

    var config = getCountdownConfig(targetEdgingDuration);
    currentEdgingCountdown = config.startNum;
    isCountdownActive = true;
    isEdgingCountdownPaused = false;
    countdownRunId++;
    var thisRunId = countdownRunId;

    if (btnText) btnText.innerText = "Pause";

    var subName = (window.names && window.names[window.subPartner]) || 'mein Schatz';
    var fullCountdownText = buildDynamicCountdownSpeechText(targetEdgingDuration, subName);

    logSessionAction("Geführter JOI-Atem-Countdown (" + targetEdgingDuration + "s) gestartet [" + (countdownVoiceMode === 'self' ? 'Top spricht selbst' : 'Gemini') + "]");

    // Wenn der Top selbst spricht: Sofortiger Ticker-Start
    if (countdownVoiceMode === 'self') {
      if (pill) {
        pill.innerText = "Live";
        pill.className = "text-[10px] font-mono text-indigo-400 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800";
      }
      if (cueText) {
        cueText.innerText = "Sprich jetzt laut im Takt mit (" + config.startNum + " bis 1)...";
      }
      triggerDisplayBeat(config.startNum.toString(), config.stepMs);
      runVisualCountdownTicker(thisRunId, config.startNum, config.stepMs);
      return;
    }

    // Wenn Gemini spricht: ZUERST Ladezustand anzeigen, bis Audio WIRKLICH decodiert und gestartet ist
    if (pill) {
      pill.innerText = "⏳ Stimme lädt...";
      pill.className = "text-[10px] font-mono text-purple-300 font-bold bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800 animate-pulse";
    }
    if (disp) {
      disp.className = "text-[14vw] sm:text-[18vh] font-black font-mono tracking-tight leading-none text-purple-400 select-none animate-pulse transition-all duration-200 text-center";
      disp.innerText = "...";
    }
    if (cueText) {
      cueText.innerText = "Regiestimme fokussiert die Kante... bereithalten!";
    }

    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      var speechStarted = false;

      // Event-Hook: Sobald Audio abgespielt wird, startet der Zähler synchron
      var startSyncCallback = function() {
        if (speechStarted || thisRunId !== countdownRunId) return;
        speechStarted = true;

        if (pill) {
          pill.innerText = "Live";
          pill.className = "text-[10px] font-mono text-emerald-400 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800";
        }
        if (disp) {
          disp.className = "text-[44vw] sm:text-[38vh] font-black font-mono tracking-tighter leading-none text-emerald-400 select-none transition-all duration-200 text-center will-change-transform";
        }
        if (cueText) {
          cueText.innerText = "Gemini zählt von " + config.startNum + " herunter... Kante halten!";
        }

        triggerDisplayBeat(config.startNum.toString(), config.stepMs);
        runVisualCountdownTicker(thisRunId, config.startNum, config.stepMs);
      };

      // Listener auf das Audio-Element legen
      var masterAudio = document.getElementById('master-voice-audio');
      if (masterAudio) {
        masterAudio.addEventListener('playing', startSyncCallback, { once: true });
      }

      // Sicherheits-Timeout (spätestens nach 2.8s loslegen, falls Event verzögert)
      setTimeout(function() {
        startSyncCallback();
      }, 2800);

      window.SessionVoice.play(fullCountdownText).then(function() {
        if (thisRunId !== countdownRunId) return;
        var endDisp = document.getElementById('countdown-display');
        if (endDisp) {
          endDisp.classList.remove('countdown-beat-active');
          endDisp.className = "text-[16vw] sm:text-[20vh] font-black font-mono tracking-normal leading-none text-emerald-300 select-none climax-pulse-active transition-all duration-300 text-center";
          endDisp.innerText = "KOMMEN!";
        }
        if (cueText) cueText.innerText = "Erlaubnis erteilt! Lass alles los!";
        setTimeout(function() {
          if (wrap) {
            wrap.classList.add('hidden');
            wrap.style.display = 'none';
          }
        }, 4500);
      });
    }
  }

  async function runVisualCountdownTicker(runId, startNumber, stepDurationMs) {
    var disp = document.getElementById('countdown-display');
    var cueText = document.getElementById('countdown-cue-text');
    var ticker = startNumber;

    while (isCountdownActive && ticker > 0 && runId === countdownRunId) {
      if (isEdgingCountdownPaused) {
        await new Promise(function(r) { setTimeout(r, 300); });
        continue;
      }
      triggerDisplayBeat(ticker.toString(), stepDurationMs);
      await new Promise(function(r) { setTimeout(r, stepDurationMs); });
      ticker--;
    }

    if (ticker <= 0 && runId === countdownRunId) {
      if (disp) {
        disp.classList.remove('countdown-beat-active');
        disp.className = "text-[16vw] sm:text-[20vh] font-black font-mono tracking-normal leading-none text-emerald-300 select-none climax-pulse-active transition-all duration-300 text-center";
        disp.innerText = "KOMMEN!";
      }
      if (cueText) {
        cueText.innerText = (countdownVoiceMode === 'self') 
          ? "Sprich jetzt: 'JETZT KOMMEN!'" 
          : "Erlaubnis erteilt! Lass alles los!";
      }
      logSessionAction("Orgasmus-Freigabe (" + targetEdgingDuration + "s beendet)");
      setTimeout(function() {
        var wrap = document.getElementById('countdown-wrapper');
        if (wrap) {
          wrap.classList.add('hidden');
          wrap.style.display = 'none';
        }
      }, 4500);
    }
  }

  function pauseSpeechCountdown() {
    isEdgingCountdownPaused = !isEdgingCountdownPaused;
    var btnText = document.getElementById('btn-pause-countdown-text');
    var btn = document.getElementById('btn-pause-countdown');
    var pill = document.getElementById('countdown-mode-pill');

    if (btnText) btnText.innerText = isEdgingCountdownPaused ? "Weiter" : "Pause";
    if (btn) {
      if (isEdgingCountdownPaused) {
        btn.className = "flex-1 py-4 px-6 rounded-2xl bg-emerald-900/90 hover:bg-emerald-800 border-2 border-emerald-500 text-white font-black text-sm tracking-wide shadow-2xl touch-btn flex items-center justify-center gap-2";
      } else {
        btn.className = "flex-1 py-4 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700 text-slate-100 font-black text-sm tracking-wide shadow-2xl touch-btn flex items-center justify-center gap-2";
      }
    }
    if (pill) {
      pill.innerText = isEdgingCountdownPaused ? "Pausiert" : "Live";
      pill.className = isEdgingCountdownPaused 
        ? "text-[10px] font-mono text-amber-300 font-bold bg-amber-950/80 px-2.5 py-1 rounded-lg border border-amber-700" 
        : "text-[10px] font-mono text-emerald-400 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800";
    }

    if (isEdgingCountdownPaused) {
      if (window.SessionVoice && typeof window.SessionVoice.stop === 'function') {
        window.SessionVoice.stop();
      }
    }
  }

  function resetSpeechCountdown() {
    isCountdownActive = false;
    countdownRunId++;
    var wrap = document.getElementById('countdown-wrapper');
    if (wrap) {
      wrap.classList.add('hidden');
      wrap.style.display = 'none';
    }
    currentEdgingCountdown = targetEdgingDuration;
    if (window.SessionVoice && typeof window.SessionVoice.stop === 'function') {
      window.SessionVoice.stop();
    }
  }

  function finalizeEdgingDecision(decision) {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }

    if (decision === 'ruined') {
      logSessionAction("Ruined Orgasm angeordnet");
      showToast("Ruined Orgasm vollzogen!");
      if (countdownVoiceMode === 'self') {
        showToast("🗣️ Sprich jetzt: 'Hände weg! Stillhalten und auskrampfen!'");
      } else if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
        window.SessionVoice.play("Hände weg! Stillhalten und auskrampfen... Vielleicht beim nächsten Mal.");
      }
    } else if (decision === 'denial') {
      logSessionAction("Lustverweigerung (Denial)");
      showToast("Orgasmus verweigert!");
      if (window.SessionAudio && typeof window.SessionAudio.adjustEnergy === 'function') {
        window.SessionAudio.adjustEnergy('calm');
      }
      if (countdownVoiceMode === 'self') {
        showToast("🗣️ Sprich jetzt: 'Schluss für heute. Du bleibst ungelöst.'");
      } else if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
        window.SessionVoice.play("Schluss für heute. Du bleibst ungelöst.");
      }
    }
  }

  function scrollToEdgingPanel() {
    var panel = document.getElementById('edging-cockpit-panel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  window.SessionEdging = {
    setVoiceMode: setCountdownVoiceMode,
    setStimulator: setEdgingStimulator,
    handleArousal: handleArousalSliderTouch,
    registerEdge: registerEdgeReachedWrapper,
    startCooldown: startCooldownBreathingTimer,
    openReleaseChoice: openReleaseChoiceModal,
    executeReleaseImmediate: executeReleaseImmediate,
    executeReleaseCountdown: executeReleaseWithCountdown,
    setCountdownDuration: setCountdownDuration,
    stepDuration: stepCountdownDuration,
    pauseCountdown: pauseSpeechCountdown,
    resetCountdown: resetSpeechCountdown,
    finalizeDecision: finalizeEdgingDecision,
    scrollToEdging: scrollToEdgingPanel,
    getEdgeCount: function() { return edgeCount; },
    resetState: function() {
      edgeCount = 0;
      lastEdgeTimestamp = null;
      var hitsEl = document.getElementById('edging-total-hits');
      if (hitsEl) hitsEl.innerText = "0";
      var disp = document.getElementById('time-since-last-edge');
      if (disp) disp.innerText = "00:00";
    }
  };

  window.setCountdownVoiceMode = setCountdownVoiceMode;
  window.setEdgingStimulator = setEdgingStimulator;
  window.handleArousalSliderTouch = handleArousalSliderTouch;
  window.registerEdgeReachedWrapper = registerEdgeReachedWrapper;
  window.startCooldownBreathingTimer = startCooldownBreathingTimer;
  window.openReleaseChoiceModal = openReleaseChoiceModal;
  window.setCountdownDuration = setCountdownDuration;
  window.executeReleaseImmediate = executeReleaseImmediate;
  window.executeReleaseWithCountdown = executeReleaseWithCountdown;
  window.pauseSpeechCountdown = pauseSpeechCountdown;
  window.resetSpeechCountdown = resetSpeechCountdown;
  window.finalizeEdgingDecision = finalizeEdgingDecision;
  window.scrollToEdgingPanel = scrollToEdgingPanel;

})(window);
