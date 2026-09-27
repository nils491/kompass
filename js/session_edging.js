/**
 * js/session_edging.js
 * Spezialisiertes Modul für die Edging-Fernbedienung des Tops in der Schlafzimmer-Regie.
 * 
 * Features:
 * - Lückenlose Zahlenfolgen: Jede Zahl des Countdowns wird ausgesprochen (keine Übersprünge).
 * - Einhaltung der Sekundendauer mit sexy Zwischenflüstern.
 * - Startzahl-Staffelung (z.B. bei 20s ab 16, bei 30s ab 22), damit Taktung & Zwischenrufe perfekt harmonieren.
 * - Synchrone visuelle Großanzeige für den Top.
 * - Umschaltung: App-Stimme (Gemini) vs. Selbst sprechen (visuelle Atem-Cues).
 * - Cooldown-Timer (45s), Kanten-Zähler und Zeitstempel.
 * - Höhepunkt-Urteile: Freigabe, Ruined Orgasm, Lustverweigerung (Denial).
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

  var targetEdgingDuration = 10;
  var currentEdgingCountdown = 10;
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

    if (mode === 'self') {
      if (bSelf) bSelf.className = "p-2 rounded-xl border text-left touch-btn transition bg-indigo-950/60 border-indigo-500 shadow-md";
      if (bGemini) bGemini.className = "p-2 rounded-xl border text-left touch-btn transition theme-panel border-slate-800 text-slate-400 hover:border-slate-700";
      if (lbl) { lbl.innerText = "Top spricht selbst"; lbl.className = "text-[10px] font-mono text-indigo-300 font-bold"; }
      showToast("Modus: Top spricht den Countdown selbst 🗣️");
    } else {
      if (bGemini) bGemini.className = "p-2 rounded-xl border text-left touch-btn transition bg-purple-950/60 border-purple-500 shadow-md";
      if (bSelf) bSelf.className = "p-2 rounded-xl border text-left touch-btn transition theme-panel border-slate-800 text-slate-400 hover:border-slate-700";
      if (lbl) { lbl.innerText = "Gemini spricht laut"; lbl.className = "text-[10px] font-mono text-purple-300 font-bold"; }
      showToast("Modus: Gemini-App-Stimme spricht ins Zimmer 🔊");
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

    if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function' && Math.random() < 0.35) {
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

    logSessionAction("Edge #" + edgeCount + " erreicht (Stufe 10)");
    showToast("Edge #" + edgeCount + " registriert!");
    startLastEdgeTimer();
    startCooldownBreathingTimer();

    if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
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

  function setCountdownDuration(seconds) {
    targetEdgingDuration = parseInt(seconds, 10) || 10;
    var durLabel = document.getElementById('selected-countdown-duration-label');
    var btnLabel = document.getElementById('btn-cd-label-sec');
    if (durLabel) durLabel.innerText = targetEdgingDuration + "s";
    if (btnLabel) btnLabel.innerText = targetEdgingDuration + "s";

    [5, 10, 20, 30].forEach(function(s) {
      var btn = document.getElementById('btn-cd-dur-' + s);
      if (btn) {
        if (s === targetEdgingDuration) {
          btn.className = "py-1 rounded-lg border text-[10.5px] font-bold bg-emerald-950 border-emerald-500 text-emerald-300 touch-btn";
        } else {
          btn.className = "py-1 rounded-lg border text-[10.5px] font-bold theme-panel text-slate-400 touch-btn";
        }
      }
    });
  }

  function getCountdownConfig(durationSeconds) {
    // Liefert Startzahl und Schrittzeit, damit ALLE Zahlen aufgesagt werden
    // und die Gesamtdauer exakt der gewählten Sekundenzahl entspricht
    if (durationSeconds === 5) {
      return { startNum: 5, stepMs: 1100 };
    }
    if (durationSeconds === 20) {
      // 16 Zahlen (16 bis 1) + 4 gezielte Zwischenrufe = ~20s Gesamtdauer
      return { startNum: 16, stepMs: 1220 };
    }
    if (durationSeconds === 30) {
      // 22 Zahlen (22 bis 1) + 6 gezielte Zwischenrufe = ~30s Gesamtdauer
      return { startNum: 22, stepMs: 1320 };
    }
    // Standard: 10 Sekunden (10 bis 1 lückenlos)
    return { startNum: 10, stepMs: 1150 };
  }

  function buildDynamicCountdownSpeechText(durationSeconds, subName) {
    var name = subName || 'mein Schatz';

    // 5 Sekunden: 5, 4, 3, 2, 1 (alle Zahlen ausgesprochen)
    if (durationSeconds === 5) {
      return "Fünf... Vier... Blick zu mir... Drei... Zwei... Eins... Jetzt! Lass alles los und komm für mich!";
    }

    // 20 Sekunden: 16 bis 1 (JEDE einzelne Zahl wird ohne Auslassung aufgesagt)
    if (durationSeconds === 20) {
      return "Sechzehn... nicht bewegen, " + name + "... " +
             "Fünfzehn... Vierzehn... tief in den Bauchraum atmen... " +
             "Dreizehn... Zwölf... Elf... spüre das Pochen... " +
             "Zehn... Neun... Acht... halte die Spannung... " +
             "Sieben... Sechs... Fünf... spüre die Glut... " +
             "Vier... Drei... Zwei... Eins... Jetzt! Lass alles los und komm für mich!";
    }

    // 30 Sekunden: 22 bis 1 (JEDE einzelne Zahl wird ohne Auslassung aufgesagt)
    if (durationSeconds === 30) {
      return "Zweiundzwanzig... Einundzwanzig... Zwanzig... ganz ruhig ausatmen, " + name + "... " +
             "Neunzehn... Achtzehn... Siebzehn... Sechzehn... spüre jeden Herzschlag... " +
             "Fünfzehn... Vierzehn... Dreizehn... Zwölf... stillhalten... " +
             "Elf... Zehn... Neun... Acht... halte die Kante... " +
             "Sieben... Sechs... Fünf... Vier... Drei... Zwei... Eins... Jetzt! Explodiere für mich!";
    }

    // 10 Sekunden: 10 bis 1 (JEDE einzelne Zahl wird ohne Auslassung aufgesagt)
    return "Zehn... tief durchatmen... Neun... Acht... stillhalten, " + name + "... " +
           "Sieben... Sechs... spüre die Hitze... " +
           "Fünf... Vier... Drei... Zwei... Eins... Jetzt! Lass alles los und komm für mich!";
  }

  function triggerDisplayBeat(text, stepMs) {
    var disp = document.getElementById('countdown-display');
    if (!disp) return;

    disp.innerText = text;
    if (stepMs) {
      disp.style.setProperty('--beat-duration', (stepMs / 1000) + 's');
    }

    // CSS Reflow erzwingen, damit die Animation exakt mit dem Zahlenwechsel von vorne zündet
    disp.classList.remove('countdown-beat-active', 'climax-pulse-active');
    void disp.offsetWidth;
    disp.classList.add('countdown-beat-active');
  }

  function executeReleaseImmediate() {
    logSessionAction("Orgasmus-Freigabe (Sofort)");
    var panel = document.getElementById('release-choice-subpanel');
    if (panel) panel.classList.add('hidden');
    showToast("Sofortige Freigabe erteilt!");

    if (countdownVoiceMode === 'self') {
      showToast("🗣️ Sprich jetzt: 'Jetzt! Lass alles los und komm für mich!'");
    } else if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play("Jetzt! Lass alles los und komm für mich!");
    }
  }

  function executeReleaseWithCountdown() {
    var panel = document.getElementById('release-choice-subpanel');
    var wrap = document.getElementById('countdown-wrapper');
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

    if (pill) {
      pill.innerText = "Live";
      pill.className = "text-[10px] font-mono text-emerald-400 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800";
    }
    if (btnText) btnText.innerText = "Pause";

    triggerDisplayBeat(config.startNum.toString(), config.stepMs);

    if (cueText) {
      cueText.innerText = (countdownVoiceMode === 'self') 
        ? "Sprich jetzt laut im Takt mit (" + config.startNum + " bis 1)..." 
        : "Gemini zählt von " + config.startNum + " bis 1 herunter...";
    }

    var subName = (window.names && window.names[window.subPartner]) || 'mein Schatz';
    var fullCountdownText = buildDynamicCountdownSpeechText(targetEdgingDuration, subName);

    logSessionAction("Geführter Atem-Countdown (" + targetEdgingDuration + "s ab Zahl " + config.startNum + ") gestartet [" + (countdownVoiceMode === 'self' ? 'Top spricht selbst' : 'Gemini') + "]");

    // Startet die visuelle Großanzeige synchron mit Beat auf jeden Zähler
    runVisualCountdownTicker(countdownRunId, config.startNum, config.stepMs);

    if (countdownVoiceMode === 'gemini' && window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play(fullCountdownText).then(function() {
        var disp = document.getElementById('countdown-display');
        if (disp) {
          disp.classList.remove('countdown-beat-active');
          disp.className = "text-[16vw] sm:text-[20vh] font-black font-mono tracking-normal leading-none text-emerald-300 select-none climax-pulse-active transition-all duration-300 text-center";
          disp.innerText = "KOMMEN!";
        }
        if (cueText) cueText.innerText = "Erlaubnis erteilt!";
        setTimeout(function() {
          if (wrap) {
            wrap.classList.add('hidden');
            wrap.style.display = 'none';
          }
        }, 4000);
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
          : "Erlaubnis erteilt!";
      }
      logSessionAction("Orgasmus-Freigabe (" + targetEdgingDuration + "s beendet)");
      setTimeout(function() {
        var wrap = document.getElementById('countdown-wrapper');
        if (wrap) {
          wrap.classList.add('hidden');
          wrap.style.display = 'none';
        }
      }, 4000);
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
    currentEdgingCountdown = 10;
    if (window.SessionVoice && typeof window.SessionVoice.stop === 'function') {
      window.SessionVoice.stop();
    }
  }

  function finalizeEdgingDecision(decision) {
    if (decision === 'ruined') {
      logSessionAction("Ruined Orgasm angeordnet");
      showToast("Ruined Orgasm vollzogen!");
      if (countdownVoiceMode === 'self') {
        showToast("🗣️ Sprich jetzt: 'Hände weg! Stillhalten und auskrampfen!'");
      } else if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
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
      } else if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
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

  // Direktanbindungen an window für alle inline HTML-Attribute
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
