/**
 * js/session_edging.js
 * Modul für die Edging-Fernbedienung des Tops in der Schlafzimmer-Regie.
 * 
 * Features & Perfektionierungen:
 * - 🎯 Exakte Audio-Visual-Synchronisation: Ladebalken bleibt so lange aktiv, bis das Audio WIRKLICH ertönt (kein vorzeitiger Timeout)
 * - ⏸️ Intelligentes Zahlen-Verweilen: Die Zahl bleibt stehen und pulsiert, während die Stimme erotische Zwischenbemerkungen macht
 * - 💬 Natürliche deutsche Sprache: Konsequent "Schwelle", "Plateau", "Höhepunkt-Schwelle"
 * - ⏱️ JOI-Zeitstepper: Standard 20s mit flexiblen [- 5s] und [+ 5s] Reglern (5s bis 60s)
 * - 🎙️ Erotisch-psychologische JOI-Sprachführung: Atmung, Schwellen-Spannung und finale Freigabe
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
      showToast("Modus: Top gibt die Schwellen-Befehle selbst 🗣️");
    } else {
      if (bGemini) bGemini.className = "p-2 rounded-xl border text-left touch-btn transition bg-purple-950/60 border-purple-500 shadow-md";
      if (bSelf) bSelf.className = "p-2 rounded-xl border text-left touch-btn transition theme-panel border-slate-800 text-slate-400 hover:border-slate-700";
      if (lbl) { lbl.innerText = "Gemini spricht laut"; lbl.className = "text-[10px] font-mono text-purple-300 font-bold"; }
      
      window.isTopVoiceAssistActive = true;
      try { localStorage.setItem('kompass_voice_assist_active', 'true'); } catch (e) {}
      showToast("Modus: Gemini-App-Stimme führt laut durch die Schwelle 🔊");
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
    var labels = ["", "Ruhig", "Leicht erregt", "Wärme", "Fokus", "Plateau", "Gesteigert", "Intensiv", "Gefahrenzone", "Vor der Schwelle", "Schwelle erreicht"];
    if (badge) badge.innerText = "Stufe " + activeArousalLevel + " / 10 (" + (labels[activeArousalLevel] || '') + ")";

    if (activeArousalLevel >= 8 && window.SessionAudio && typeof window.SessionAudio.adjustEnergy === 'function') {
      window.SessionAudio.adjustEnergy('energy');
    }

    if (countdownVoiceMode === 'gemini' && window.SessionVoice && typeof window.SessionVoice.play === 'function' && Math.random() < 0.35) {
      var subName = (window.names && window.names[window.subPartner]) || 'mein Schatz';
      var phrase = "";
      if (activeArousalLevel <= 3) phrase = "Ganz ruhig atmen, " + subName + ". Wir bauen die Spannung langsam auf.";
      else if (activeArousalLevel <= 6) phrase = (edgingStimulationBy === 'bottom_self') ? ("Gleichmäßig weiterberühren, " + subName + ". Halt das Plateau.") : "Spüre meine Berührung. Lass dich ganz darauf ein.";
      else if (activeArousalLevel <= 9) phrase = (edgingStimulationBy === 'bottom_self') ? "Langsamer werden! Hände kurz anhalten, wenn es zu nah wird." : ("Gefahrenzone, " + subName + ". Kein Zucken. Du kommst erst auf mein Zeichen.");
      else phrase = "Stillhalten! Schwelle erreicht!";
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

    logSessionAction("Höhepunkt-Schwelle #" + edgeCount + " erreicht (Stufe 10)");
    showToast("Schwelle #" + edgeCount + " registriert!");
    startLastEdgeTimer();
    startCooldownBreathingTimer();

    if (countdownVoiceMode === 'gemini' && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play("Schwelle erreicht! Hände sofort weg und stillhalten!");
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

  /**
   * Erstellt strukturierte Beat-Segmente für die genaue Synchronisation:
   * Jedes Element hat:
   * - num: Die angezeigte Zahl (bleibt stehen!)
   * - text: Der gesprochene Text
   * - cue: Der subtile Hinweis auf dem Display
   * - durMs: Die geschätzte Sprech- und Haltezeit
   */
  function buildJoiCountdownTimeline(durationSeconds, subName) {
    var name = subName || 'mein Schatz';

    if (durationSeconds <= 7) {
      return [
        { num: 5, text: "Fünf.", cue: "Spannung halten...", durMs: 1400 },
        { num: 4, text: "Vier... Blick fest zu mir...", cue: "Nicht wegschauen...", durMs: 2000 },
        { num: 3, text: "Drei... spüre die Hitze...", cue: "Gleich hast du es...", durMs: 1900 },
        { num: 2, text: "Zwei...", cue: "Bereithalten...", durMs: 1400 },
        { num: 1, text: "Eins...", cue: "Jetzt...", durMs: 1400 },
        { num: 0, text: "Jetzt! Lass alles los und komm für mich!", cue: "KOMMEN!", durMs: 4000 }
      ];
    }

    if (durationSeconds <= 12) {
      return [
        { num: 10, text: "Zehn. Tief durchatmen.", cue: "Ausatmen und spüren...", durMs: 2000 },
        { num: 9, text: "Neun.", cue: "Reglos bleiben...", durMs: 1400 },
        { num: 8, text: "Acht... Nicht bewegen, " + name + "...", cue: "Kein Zucken...", durMs: 2200 },
        { num: 7, text: "Sieben...", cue: "Die Lust stauen...", durMs: 1500 },
        { num: 6, text: "Sechs... Spüre die Glut im Becken...", cue: "Das Pochen halten...", durMs: 2300 },
        { num: 5, text: "Fünf...", cue: "Fast an der Grenze...", durMs: 1500 },
        { num: 4, text: "Vier... Halt die Spannung...", cue: "Bleib bei mir...", durMs: 2000 },
        { num: 3, text: "Drei...", cue: "Gleich darfst du...", durMs: 1500 },
        { num: 2, text: "Zwei... Bereithalten...", cue: "Kurz vor der Erlösung...", durMs: 1800 },
        { num: 1, text: "Eins...", cue: "Loslassen...", durMs: 1400 },
        { num: 0, text: "Jetzt! Lass alles los und komm für mich!", cue: "KOMMEN!", durMs: 4000 }
      ];
    }

    if (durationSeconds <= 22) {
      return [
        { num: 16, text: "Sechzehn. Stillhalten, " + name + ".", cue: "Regungslos an der Schwelle...", durMs: 2200 },
        { num: 15, text: "Fünfzehn...", cue: "Die Glut spüren...", durMs: 1500 },
        { num: 14, text: "Vierzehn... Tief in den Bauchraum atmen...", cue: "Langsamer Atem...", durMs: 2300 },
        { num: 13, text: "Dreizehn...", cue: "Fokus auf die Lust...", durMs: 1400 },
        { num: 12, text: "Zwölf... Spüre das Pochen an der Schwelle...", cue: "Das Pochen halten...", durMs: 2300 },
        { num: 11, text: "Elf...", cue: "Nicht nachgeben...", durMs: 1400 },
        { num: 10, text: "Zehn. Halte die Lust reglos.", cue: "Becken anspannen...", durMs: 2200 },
        { num: 9, text: "Neun...", cue: "Tiefe Hingabe...", durMs: 1400 },
        { num: 8, text: "Acht... Der Druck steigt...", cue: "Ganz nah an der Kante...", durMs: 2100 },
        { num: 7, text: "Sieben...", cue: "Ausharren...", durMs: 1400 },
        { num: 6, text: "Sechs... Gleich hast du es geschafft...", cue: "Blick zu mir...", durMs: 2200 },
        { num: 5, text: "Fünf...", cue: "Die Welle rollt an...", durMs: 1400 },
        { num: 4, text: "Vier... Bereithalten, " + name + "...", cue: "Gleich explodieren...", durMs: 2000 },
        { num: 3, text: "Drei...", cue: "Jeden Herzschlag spüren...", durMs: 1400 },
        { num: 2, text: "Zwei... Noch ein Atemzug...", cue: "Letzter Halt...", durMs: 1900 },
        { num: 1, text: "Eins...", cue: "Alles öffnen...", durMs: 1400 },
        { num: 0, text: "Jetzt! Explodiere für mich!", cue: "KOMMEN!", durMs: 4000 }
      ];
    }

    // 25 bis 60 Sekunden: Tiefe, intensive JOI-Trance
    return [
      { num: 25, text: "Fünfundzwanzig. Ganz ruhig ausatmen, " + name + ".", cue: "Entschleunigen...", durMs: 2400 },
      { num: 24, text: "Vierundzwanzig...", cue: "Schultern sinken lassen...", durMs: 1500 },
      { num: 23, text: "Dreiundzwanzig... Spüre die feurige Schwelle...", cue: "Wärme im gesamten Körper...", durMs: 2300 },
      { num: 22, text: "Zweiundzwanzig...", cue: "Reglos bleiben...", durMs: 1500 },
      { num: 21, text: "Einundzwanzig... Nicht bewegen...", cue: "Kein Millimeter Bewegung...", durMs: 2000 },
      { num: 20, text: "Zwanzig. Spüre jeden einzelnen Herzschlag.", cue: "Im Takt des Herzens...", durMs: 2400 },
      { num: 19, text: "Neunzehn...", cue: "Die Lust anstauen...", durMs: 1500 },
      { num: 18, text: "Achtzehn... Bleib reglos an der Grenze...", cue: "Gefahrenzone halten...", durMs: 2200 },
      { num: 17, text: "Siebzehn...", cue: "Ausatmen...", durMs: 1500 },
      { num: 16, text: "Sechzehn... Deine Hingabe gehört ganz mir...", cue: "Vollkommene Ergebung...", durMs: 2400 },
      { num: 15, text: "Fünfzehn...", cue: "Die Hitze brennt...", durMs: 1500 },
      { num: 14, text: "Vierzehn... Halte die Spannung...", cue: "Süße Qual...", durMs: 2000 },
      { num: 13, text: "Dreizehn...", cue: "Becken öffnen...", durMs: 1500 },
      { num: 12, text: "Zwölf... Der Druck steigt unaufhaltsam...", cue: "Kurz vor dem Überlaufen...", durMs: 2400 },
      { num: 11, text: "Elf...", cue: "Blick fest zu mir...", durMs: 1500 },
      { num: 10, text: "Zehn. Gleich erlöse ich dich.", cue: "Die letzten zehn Sekunden...", durMs: 2300 },
      { num: 9, text: "Neun...", cue: "Atem anhalten...", durMs: 1500 },
      { num: 8, text: "Acht... Spüre die Erlösung nahen...", cue: "Alles pulsiert...", durMs: 2200 },
      { num: 7, text: "Sieben...", cue: "Fast am Ziel...", durMs: 1500 },
      { num: 6, text: "Sechs... Noch ein kurzes Ausharren...", cue: "Reglos bleiben...", durMs: 2100 },
      { num: 5, text: "Fünf...", cue: "Welle bereitstellen...", durMs: 1500 },
      { num: 4, text: "Vier... Bereithalten...", cue: "Körper ganz spüren...", durMs: 2000 },
      { num: 3, text: "Drei...", cue: "Zwei Atemzüge...", durMs: 1500 },
      { num: 2, text: "Zwei... Gleich darfst du...", cue: "Jetzt bereitmachen...", durMs: 1800 },
      { num: 1, text: "Eins...", cue: "Loslassen...", durMs: 1400 },
      { num: 0, text: "Jetzt! Lass alles fließen und komm für mich!", cue: "KOMMEN!", durMs: 4000 }
    ];
  }

  function triggerDisplayBeat(text, durMs, cueText) {
    var disp = document.getElementById('countdown-display');
    var cue = document.getElementById('countdown-cue-text');
    if (!disp) return;

    disp.innerText = text;
    if (durMs) {
      disp.style.setProperty('--beat-duration', (durMs / 1000) + 's');
    }

    if (cue && cueText) {
      cue.innerText = cueText;
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

    var subName = (window.names && window.names[window.subPartner]) || 'mein Schatz';
    var timeline = buildJoiCountdownTimeline(targetEdgingDuration, subName);

    currentEdgingCountdown = timeline[0].num;
    isCountdownActive = true;
    isEdgingCountdownPaused = false;
    countdownRunId++;
    var thisRunId = countdownRunId;

    if (btnText) btnText.innerText = "Pause";

    logSessionAction("Geführter JOI-Atem-Countdown (" + targetEdgingDuration + "s) gestartet [" + (countdownVoiceMode === 'self' ? 'Top spricht selbst' : 'Gemini') + "]");

    // WENN DER TOP SELBST SPRICHT: Sofortiger Ticker-Start
    if (countdownVoiceMode === 'self') {
      if (pill) {
        pill.innerText = "Live";
        pill.className = "text-[10px] font-mono text-indigo-400 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800";
      }
      removeLoadingProgressUi();
      if (disp) {
        disp.className = "text-[44vw] sm:text-[38vh] font-black font-mono tracking-tighter leading-none text-emerald-400 select-none transition-all duration-200 text-center will-change-transform block";
      }
      runTimelineTicker(thisRunId, timeline);
      return;
    }

    // WENN GEMINI SPRICHT: LADEBALKEN ANZEIGEN BIS ZUM ERSTEN ECHTEN TON
    if (pill) {
      pill.innerText = "⏳ Stimme lädt...";
      pill.className = "text-[10px] font-mono text-purple-300 font-bold bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-800 animate-pulse";
    }
    if (disp) {
      disp.className = "hidden"; // Versteckt, bis die Stimme WIRKLICH abspielt
    }
    renderLoadingProgressUi();

    if (cueText) {
      cueText.innerText = "Regiestimme fokussiert die Schwelle... bereithalten!";
    }

    var fullSpeechText = timeline.map(function(t) { return t.text; }).join(' ');

    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      var speechStarted = false;

      // Event-Hook: Sobald Audio TATSÄCHLICH abgespielt wird, schaltet die UI auf synchrone Riesenzahlen um
      var startSyncCallback = function() {
        if (speechStarted || thisRunId !== countdownRunId) return;
        speechStarted = true;

        removeLoadingProgressUi();

        if (pill) {
          pill.innerText = "Live";
          pill.className = "text-[10px] font-mono text-emerald-400 font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800";
        }
        if (disp) {
          disp.className = "text-[44vw] sm:text-[38vh] font-black font-mono tracking-tighter leading-none text-emerald-400 select-none transition-all duration-200 text-center will-change-transform block";
        }

        // Ticker startet erst HIER – exakt synchron mit dem ersten Ton!
        runTimelineTicker(thisRunId, timeline);
      };

      // Listener auf das Master-Audioelement legen
      var masterAudio = document.getElementById('master-voice-audio');
      if (masterAudio) {
        masterAudio.addEventListener('playing', startSyncCallback, { once: true });
      }

      window.SessionVoice.play(fullSpeechText).then(function() {
        if (thisRunId !== countdownRunId) return;
        var endDisp = document.getElementById('countdown-display');
        var endCue = document.getElementById('countdown-cue-text');
        if (endDisp) {
          endDisp.classList.remove('countdown-beat-active');
          endDisp.className = "text-[16vw] sm:text-[20vh] font-black font-mono tracking-normal leading-none text-emerald-300 select-none climax-pulse-active transition-all duration-300 text-center block";
          endDisp.innerText = "KOMMEN!";
        }
        if (endCue) endCue.innerText = "Erlaubnis erteilt! Lass alles los!";
        setTimeout(function() {
          if (wrap) {
            wrap.classList.add('hidden');
            wrap.style.display = 'none';
          }
        }, 4500);
      }).catch(function(err) {
        removeLoadingProgressUi();
        showToast("⚠️ Audio-Verbindung unterbrochen");
      });
    }
  }

  function renderLoadingProgressUi() {
    removeLoadingProgressUi();
    var disp = document.getElementById('countdown-display');
    if (!disp || !disp.parentNode) return;

    var loaderBox = document.createElement('div');
    loaderBox.id = 'countdown-audio-loader';
    loaderBox.className = "w-full max-w-xs space-y-3 py-6 flex flex-col items-center animate-fade-in";
    loaderBox.innerHTML = `
      <div class="w-12 h-12 rounded-full border-3 border-purple-500/20 border-t-purple-400 animate-spin"></div>
      <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-purple-900/60">
        <div class="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-emerald-400 rounded-full w-full animate-pulse"></div>
      </div>
      <span class="text-[11px] text-purple-300 font-mono tracking-wider font-semibold">Stimme fokussiert die Schwelle...</span>
    `;
    disp.parentNode.insertBefore(loaderBox, disp);
  }

  function removeLoadingProgressUi() {
    var loader = document.getElementById('countdown-audio-loader');
    if (loader) loader.remove();
  }

  /**
   * Läuft die Timeline segmentweise ab:
   * Wenn die Stimme eine Zwischenbemerkung macht, BLEIBT DIE ZAHL STEHEN und pulsiert im Takt!
   */
  async function runTimelineTicker(runId, timeline) {
    var disp = document.getElementById('countdown-display');
    var cueText = document.getElementById('countdown-cue-text');

    for (var i = 0; i < timeline.length; i++) {
      if (!isCountdownActive || runId !== countdownRunId) break;

      var step = timeline[i];

      while (isEdgingCountdownPaused && isCountdownActive && runId === countdownRunId) {
        await new Promise(function(r) { setTimeout(r, 200); });
      }

      if (step.num === 0) {
        // Finale Freigabe
        if (disp) {
          disp.classList.remove('countdown-beat-active');
          disp.className = "text-[16vw] sm:text-[20vh] font-black font-mono tracking-normal leading-none text-emerald-300 select-none climax-pulse-active transition-all duration-300 text-center block";
          disp.innerText = "KOMMEN!";
        }
        if (cueText) {
          cueText.innerText = (countdownVoiceMode === 'self') 
            ? "Sprich jetzt: 'JETZT KOMMEN!'" 
            : "Erlaubnis erteilt! Lass alles los!";
        }
        logSessionAction("Orgasmus-Freigabe (" + targetEdgingDuration + "s beendet)");
        break;
      }

      // Zahl schlagen lassen; Text und Hinweis aktualisieren
      triggerDisplayBeat(step.num.toString(), step.durMs, step.cue);

      // Exakt die Dauer des Segments abwarten (die Zahl bleibt stehen, während gesprochen wird!)
      await new Promise(function(r) { setTimeout(r, step.durMs); });
    }

    setTimeout(function() {
      var wrap = document.getElementById('countdown-wrapper');
      if (wrap && runId === countdownRunId) {
        wrap.classList.add('hidden');
        wrap.style.display = 'none';
      }
    }, 4500);
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
    removeLoadingProgressUi();
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
