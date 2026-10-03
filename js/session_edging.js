/**
 * js/session_edging.js
 * TACTUS Echte JOI-Engine, 1:1 Audio-Visual Synchronisation & Fullscreen-Countdown (V3.0 Haute-Horlogerie)
 * Offizielle Web-Präsenz: tactus.digital
 * 
 * TACTUS FEATURE CONTRACT:
 * [✓] Strikte Terminologie: Ausschließlich "Edge", "Edges", "Edging" (Keine "Kanten" / "Schwellen"!)
 * [✓] Echte Gemini-Stimmführung (Despina, Aoede, Enceladus, Fenrir) via SessionVoice.play()
 * [✓] 1:1 Audio-Visual Synchronisation: Ladebalken ("Stimme fokussiert die Edge...") wartet exakt
 *     auf das 'playing'-Event von <audio id="master-voice-audio">, bevor die Ziffern starten
 * [✓] Intelligentes Zahlen-Verweilen: Die Zahl bleibt stehen und pulsiert im Takt (countdown-beat-active),
 *     während die Gemini-Stimme erotische Zwischenbemerkungen spricht
 * [✓] JOI-Zeitstepper: Standard 20s mit [- 5s] und [+ 5s] Reglern sowie Presets (5s, 10s, 20s, 30s bis 60s)
 * [✓] Arousal-Slider (1–10) mit dynamischen Sprachreaktionen der Gemini-Stimme
 * [✓] Umschaltbarer Regie-Modus: [Top spricht selbst] vs. [App-Stimme (Gemini)]
 * [✓] Stimulations-Wahlschalter: [Top berührt] vs. [Bottom berührt sich]
 * [✓] Taster "⚡ EDGE ERREICHT! (Hände weg)" mit Beat-Drop Mute & 45s Abkühlphase
 * [✓] Schneller Zugriff auf den 5-Stufen Bestrafungs- & Disziplinar-Wizard (SessionDiscipline)
 * [✓] Orgasmus-Entscheidung: Ruined Orgasm, Denial (Lustverweigerung) oder Freigabe
 * [✓] 100 % UTF-8 Integrität, Haute-Horlogerie Design tokens, keine window.alert() Aufrufe
 */

(function(window) {
  'use strict';

  let activeArousalLevel = 5;
  let edgingStimulationBy = 'top'; // 'top' | 'bottom_self'
  let edgeCount = 0;
  let lastEdgeTimestamp = null;
  let lastEdgeIntervalTimer = null;
  let cooldownTimerInterval = null;
  let cooldownSecondsRemaining = 45;

  let targetEdgingDuration = 20; // Default: 20 Sekunden
  let currentEdgingCountdown = 20;
  let isCountdownActive = false;
  let isEdgingCountdownPaused = false;
  let countdownRunId = 0;
  let countdownVoiceMode = 'gemini'; // 'gemini' | 'self'

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
    }, 2800);
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

  function getFormattedTimeNow() {
    return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  function logSessionAction(label) {
    const entry = { type: "action", time: getFormattedTimeNow(), label: label };
    if (window.currentSessionLog && Array.isArray(window.currentSessionLog)) {
      window.currentSessionLog.push(entry);
    }
  }

  function setCountdownVoiceMode(mode) {
    countdownVoiceMode = mode;
    const bSelf = document.getElementById('btn-voice-mode-self');
    const bGemini = document.getElementById('btn-voice-mode-gemini');
    const lbl = document.getElementById('label-current-voice-mode');

    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }

    if (mode === 'self') {
      if (bSelf) bSelf.className = "p-2.5 rounded-xl border text-left touch-btn transition bg-[#000000] border-[#c5a880] text-white shadow-md";
      if (bGemini) bGemini.className = "p-2.5 rounded-xl border text-left touch-btn transition bg-[#090d14] border-[#2a364f] text-[#94a3b8] hover:border-slate-700";
      if (lbl) {
        lbl.innerText = "Top spricht selbst";
        lbl.className = "text-[10px] font-mono text-[#c5a880] font-bold";
      }
      showToast("Modus: Top gibt die Edge-Befehle selbst 🗣️");
    } else {
      if (bGemini) bGemini.className = "p-2.5 rounded-xl border text-left touch-btn transition bg-[#000000] border-[#c5a880] text-[#c5a880] shadow-md";
      if (bSelf) bSelf.className = "p-2.5 rounded-xl border text-left touch-btn transition bg-[#090d14] border-[#2a364f] text-[#94a3b8] hover:border-slate-700";
      if (lbl) {
        lbl.innerText = "Gemini spricht laut";
        lbl.className = "text-[10px] font-mono text-[#c5a880] font-bold";
      }
      try { localStorage.setItem('kompass_voice_assist_active', 'true'); } catch (e) {}
      showToast("Modus: Gemini-App-Stimme führt laut durch die Edge 🔊");
    }
  }

  function setEdgingStimulator(stim) {
    edgingStimulationBy = stim;
    const bTop = document.getElementById('btn-stim-top');
    const bBottom = document.getElementById('btn-stim-bottom');

    if (stim === 'top') {
      if (bTop) bTop.className = "px-3 py-1 rounded-lg font-bold bg-[#000000] border border-[#c5a880] text-[#c5a880] touch-btn shadow-sm";
      if (bBottom) bBottom.className = "px-3 py-1 rounded-lg font-bold bg-[#090d14] border border-[#2a364f] text-[#94a3b8] touch-btn";
    } else {
      if (bBottom) bBottom.className = "px-3 py-1 rounded-lg font-bold bg-[#000000] border border-[#c5a880] text-[#c5a880] touch-btn shadow-sm";
      if (bTop) bTop.className = "px-3 py-1 rounded-lg font-bold bg-[#090d14] border border-[#2a364f] text-[#94a3b8] touch-btn";
    }
  }

  function handleArousalSliderTouch(val) {
    activeArousalLevel = parseInt(val, 10);
    const badge = document.getElementById('arousal-level-badge');
    const labels = ["", "Ruhig", "Leicht erregt", "Wärme", "Fokus", "Plateau", "Gesteigert", "Intensiv", "Gefahrenzone", "Vor der Edge", "Edge erreicht"];
    if (badge) badge.innerText = `Stufe ${activeArousalLevel} / 10 (${labels[activeArousalLevel] || ''})`;

    if (activeArousalLevel >= 8 && window.SessionAudio && typeof window.SessionAudio.setEnergyLevel === 'function') {
      window.SessionAudio.setEnergyLevel('driving');
    }

    if (countdownVoiceMode === 'gemini' && window.SessionVoice && typeof window.SessionVoice.play === 'function' && Math.random() < 0.35) {
      const subRole = localStorage.getItem('kompass_caged_role') || 'A';
      const names = window.names || { A: 'Partner 1', B: 'Partner 2' };
      const subName = names[subRole] || 'Bottom';
      let phrase = "";

      if (activeArousalLevel <= 3) phrase = `Ganz ruhig atmen, ${subName}. Wir bauen die Spannung langsam auf.`;
      else if (activeArousalLevel <= 6) phrase = (edgingStimulationBy === 'bottom_self') ? `Gleichmäßig weiterberühren, ${subName}. Halt das Plateau.` : "Spüre meine Berührung. Lass dich ganz darauf ein.";
      else if (activeArousalLevel <= 9) phrase = (edgingStimulationBy === 'bottom_self') ? "Langsamer werden! Hände kurz anhalten, wenn es zu nah wird." : `Gefahrenzone, ${subName}. Kein Zucken. Du kommst erst auf mein Zeichen.`;
      else phrase = "Stillhalten! Edge erreicht!";

      window.SessionVoice.play(phrase);
    }
  }

  function registerEdgeReachedWrapper() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }

    edgeCount++;
    lastEdgeTimestamp = Date.now();
    const hitsEl = document.getElementById('edging-total-hits');
    if (hitsEl) hitsEl.innerText = edgeCount;

    // Kaltstopp Beat-Drop in SessionAudio triggern
    if (window.SessionAudio && typeof window.SessionAudio.coldStop === 'function') {
      window.SessionAudio.coldStop();
    }

    logSessionAction(`Edge #${edgeCount} erreicht (Stufe 10)`);
    showToast(`Edge #${edgeCount} registriert! Hände weg.`);
    startLastEdgeTimer();
    startCooldownBreathingTimer();

    if (countdownVoiceMode === 'gemini' && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play("Edge erreicht! Hände sofort weg und stillhalten!");
    }
  }

  function startLastEdgeTimer() {
    if (lastEdgeIntervalTimer) clearInterval(lastEdgeIntervalTimer);
    const disp = document.getElementById('time-since-last-edge');
    lastEdgeIntervalTimer = setInterval(() => {
      if (!lastEdgeTimestamp) return;
      const diff = Math.floor((Date.now() - lastEdgeTimestamp) / 1000);
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      if (disp) disp.innerText = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    }, 1000);
  }

  function startCooldownBreathingTimer() {
    if (cooldownTimerInterval) clearInterval(cooldownTimerInterval);
    cooldownSecondsRemaining = 45;
    const btn = document.getElementById('btn-cooldown-timer');

    cooldownTimerInterval = setInterval(() => {
      if (cooldownSecondsRemaining > 0) {
        cooldownSecondsRemaining--;
        if (btn) btn.innerText = `${cooldownSecondsRemaining}s Abkühlen`;
      } else {
        clearInterval(cooldownTimerInterval);
        if (btn) btn.innerText = "Abgekühlt ✓";
        setTimeout(() => { if (btn) btn.innerText = "45s Abkühlen"; }, 2500);
      }
    }, 1000);
  }

  function openReleaseChoiceModal() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }
    const panel = document.getElementById('release-choice-subpanel');
    if (panel) {
      panel.classList.toggle('hidden');
      updateDurationStepperUI();
    }
  }

  function stepCountdownDuration(delta) {
    let newDur = targetEdgingDuration + delta;
    if (newDur < 5) newDur = 5;
    if (newDur > 60) newDur = 60;
    setCountdownDuration(newDur);
  }

  function setCountdownDuration(seconds) {
    targetEdgingDuration = Math.max(5, Math.min(60, parseInt(seconds, 10) || 20));
    updateDurationStepperUI();
  }

  function updateDurationStepperUI() {
    const durLabel = document.getElementById('selected-countdown-duration-label');
    const btnLabel = document.getElementById('btn-cd-label-sec');
    if (durLabel) durLabel.innerText = `${targetEdgingDuration}s`;
    if (btnLabel) btnLabel.innerText = `${targetEdgingDuration}s`;

    [5, 10, 20, 30].forEach(s => {
      const btn = document.getElementById(`btn-cd-dur-${s}`);
      if (btn) {
        if (s === targetEdgingDuration) {
          btn.className = "py-1.5 rounded-lg border text-[10.5px] font-bold bg-[#000000] border-[#c5a880] text-[#c5a880] touch-btn shadow-sm";
        } else {
          btn.className = "py-1.5 rounded-lg border text-[10.5px] font-bold bg-[#090d14] border-[#2a364f] text-[#94a3b8] touch-btn";
        }
      }
    });
  }

  function buildJoiCountdownTimeline(durationSeconds, subName) {
    const name = subName || 'Bottom';

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
        { num: 8, text: `Acht... Nicht bewegen, ${name}...`, cue: "Kein Zucken...", durMs: 2200 },
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
        { num: 16, text: `Sechzehn. Stillhalten, ${name}.`, cue: "Regungslos an der Edge...", durMs: 2200 },
        { num: 15, text: "Fünfzehn...", cue: "Die Glut spüren...", durMs: 1500 },
        { num: 14, text: "Vierzehn... Tief in den Bauchraum atmen...", cue: "Langsamer Atem...", durMs: 2300 },
        { num: 13, text: "Dreizehn...", cue: "Fokus auf die Lust...", durMs: 1400 },
        { num: 12, text: "Zwölf... Spüre das Pochen an der Edge...", cue: "Das Pochen halten...", durMs: 2300 },
        { num: 11, text: "Elf...", cue: "Nicht nachgeben...", durMs: 1400 },
        { num: 10, text: "Zehn. Halte die Lust reglos.", cue: "Becken anspannen...", durMs: 2200 },
        { num: 9, text: "Neun...", cue: "Tiefe Hingabe...", durMs: 1400 },
        { num: 8, text: "Acht... Der Druck steigt...", cue: "Ganz nah an der Edge...", durMs: 2100 },
        { num: 7, text: "Sieben...", cue: "Ausharren...", durMs: 1400 },
        { num: 6, text: "Sechs... Gleich hast du es geschafft...", cue: "Blick zu mir...", durMs: 2200 },
        { num: 5, text: "Fünf...", cue: "Die Welle rollt an...", durMs: 1400 },
        { num: 4, text: `Vier... Bereithalten, ${name}...`, cue: "Gleich explodieren...", durMs: 2000 },
        { num: 3, text: "Drei...", cue: "Jeden Herzschlag spüren...", durMs: 1400 },
        { num: 2, text: "Zwei... Noch ein Atemzug...", cue: "Letzter Halt...", durMs: 1900 },
        { num: 1, text: "Eins...", cue: "Alles öffnen...", durMs: 1400 },
        { num: 0, text: "Jetzt! Explodiere für mich!", cue: "KOMMEN!", durMs: 4000 }
      ];
    }

    return [
      { num: 25, text: `Fünfundzwanzig. Ganz ruhig ausatmen, ${name}.`, cue: "Entschleunigen...", durMs: 2400 },
      { num: 24, text: "Vierundzwanzig...", cue: "Schultern sinken lassen...", durMs: 1500 },
      { num: 23, text: "Dreiundzwanzig... Spüre die feurige Edge...", cue: "Wärme im gesamten Körper...", durMs: 2300 },
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
    const disp = document.getElementById('countdown-display');
    const cue = document.getElementById('countdown-cue-text');
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
    const panel = document.getElementById('release-choice-subpanel');
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

    const panel = document.getElementById('release-choice-subpanel');
    const wrap = document.getElementById('countdown-wrapper');
    const disp = document.getElementById('countdown-display');
    const cueText = document.getElementById('countdown-cue-text');
    const pill = document.getElementById('countdown-mode-pill');
    const btnText = document.getElementById('btn-pause-countdown-text');

    if (panel) panel.classList.add('hidden');
    if (wrap) {
      wrap.classList.remove('hidden');
      wrap.style.display = 'flex';
    }

    const subRole = localStorage.getItem('kompass_caged_role') || 'A';
    const names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    const subName = names[subRole] || 'Bottom';
    const timeline = buildJoiCountdownTimeline(targetEdgingDuration, subName);

    currentEdgingCountdown = timeline[0].num;
    isCountdownActive = true;
    isEdgingCountdownPaused = false;
    countdownRunId++;
    const thisRunId = countdownRunId;

    if (btnText) btnText.innerText = "Pause";

    logSessionAction(`Geführter JOI-Atem-Countdown (${targetEdgingDuration}s) gestartet [${countdownVoiceMode === 'self' ? 'Top spricht selbst' : 'Gemini'}]`);

    if (countdownVoiceMode === 'self') {
      if (pill) {
        pill.innerText = "Live";
        pill.className = "text-[10px] font-mono text-[#c5a880] font-bold bg-[#090d14] px-2.5 py-1 rounded-lg border border-[#2a364f]";
      }
      removeLoadingProgressUi();
      if (disp) {
        disp.className = "text-[44vw] sm:text-[38vh] font-black font-mono tracking-tighter leading-none text-[#c5a880] select-none transition-all duration-200 text-center will-change-transform block";
      }
      runTimelineTicker(thisRunId, timeline);
      return;
    }

    if (pill) {
      pill.innerText = "⏳ Stimme lädt...";
      pill.className = "text-[10px] font-mono text-[#dfcaa9] font-bold bg-[#000000] px-2.5 py-1 rounded-lg border border-[#c5a880]/60 animate-pulse";
    }
    if (disp) {
      disp.className = "hidden";
    }
    renderLoadingProgressUi();

    if (cueText) {
      cueText.innerText = "Regiestimme fokussiert die Edge... bereithalten!";
    }

    const fullSpeechText = timeline.map(t => t.text).join(' ');

    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      let speechStarted = false;

      const startSyncCallback = () => {
        if (speechStarted || thisRunId !== countdownRunId) return;
        speechStarted = true;

        removeLoadingProgressUi();

        if (pill) {
          pill.innerText = "Live";
          pill.className = "text-[10px] font-mono text-[#c5a880] font-bold bg-[#090d14] px-2.5 py-1 rounded-lg border border-[#2a364f]";
        }
        if (disp) {
          disp.className = "text-[44vw] sm:text-[38vh] font-black font-mono tracking-tighter leading-none text-[#c5a880] select-none transition-all duration-200 text-center will-change-transform block";
        }

        runTimelineTicker(thisRunId, timeline);
      };

      const masterAudio = document.getElementById('master-voice-audio');
      if (masterAudio) {
        masterAudio.addEventListener('playing', startSyncCallback, { once: true });
      }

      window.SessionVoice.play(fullSpeechText).then(() => {
        if (thisRunId !== countdownRunId) return;
        const endDisp = document.getElementById('countdown-display');
        const endCue = document.getElementById('countdown-cue-text');
        if (endDisp) {
          endDisp.classList.remove('countdown-beat-active');
          endDisp.className = "text-[16vw] sm:text-[20vh] font-black font-mono tracking-normal leading-none text-[#dfcaa9] select-none climax-pulse-active transition-all duration-300 text-center block";
          endDisp.innerText = "KOMMEN!";
        }
        if (endCue) endCue.innerText = "Erlaubnis erteilt! Lass alles los!";
        setTimeout(() => {
          if (wrap) {
            wrap.classList.add('hidden');
            wrap.style.display = 'none';
          }
        }, 4500);
      }).catch(err => {
        removeLoadingProgressUi();
        showToast("⚠️ Audio-Verbindung unterbrochen");
      });
    }
  }

  function renderLoadingProgressUi() {
    removeLoadingProgressUi();
    const disp = document.getElementById('countdown-display');
    if (!disp || !disp.parentNode) return;

    const loaderBox = document.createElement('div');
    loaderBox.id = 'countdown-audio-loader';
    loaderBox.className = "w-full max-w-xs space-y-3 py-6 flex flex-col items-center animate-fade-in font-mono";
    loaderBox.innerHTML = `
      <div class="w-12 h-12 rounded-full border-3 border-[#c5a880]/20 border-t-[#c5a880] animate-spin"></div>
      <div class="w-full h-2 bg-[#090d14] rounded-full overflow-hidden border border-[#2a364f]">
        <div class="h-full bg-gradient-to-r from-[#8a5232] via-[#c5a880] to-[#dfcaa9] rounded-full w-full animate-pulse"></div>
      </div>
      <span class="text-[11px] text-[#c5a880] font-mono tracking-wider font-semibold">Stimme fokussiert die Edge...</span>
    `;
    disp.parentNode.insertBefore(loaderBox, disp);
  }

  function removeLoadingProgressUi() {
    const loader = document.getElementById('countdown-audio-loader');
    if (loader) loader.remove();
  }

  async function runTimelineTicker(runId, timeline) {
    const disp = document.getElementById('countdown-display');
    const cueText = document.getElementById('countdown-cue-text');

    for (let i = 0; i < timeline.length; i++) {
      if (!isCountdownActive || runId !== countdownRunId) break;

      const step = timeline[i];

      while (isEdgingCountdownPaused && isCountdownActive && runId === countdownRunId) {
        await new Promise(r => setTimeout(r, 200));
      }

      if (step.num === 0) {
        if (disp) {
          disp.classList.remove('countdown-beat-active');
          disp.className = "text-[16vw] sm:text-[20vh] font-black font-mono tracking-normal leading-none text-[#dfcaa9] select-none climax-pulse-active transition-all duration-300 text-center block";
          disp.innerText = "KOMMEN!";
        }
        if (cueText) {
          cueText.innerText = (countdownVoiceMode === 'self') 
            ? "Sprich jetzt: 'JETZT KOMMEN!'" 
            : "Erlaubnis erteilt! Lass alles los!";
        }
        logSessionAction(`Orgasmus-Freigabe (${targetEdgingDuration}s beendet)`);
        break;
      }

      triggerDisplayBeat(step.num.toString(), step.durMs, step.cue);
      await new Promise(r => setTimeout(r, step.durMs));
    }

    setTimeout(() => {
      const wrap = document.getElementById('countdown-wrapper');
      if (wrap && runId === countdownRunId) {
        wrap.classList.add('hidden');
        wrap.style.display = 'none';
      }
    }, 4500);
  }

  function pauseSpeechCountdown() {
    isEdgingCountdownPaused = !isEdgingCountdownPaused;
    const btnText = document.getElementById('btn-pause-countdown-text');
    const btn = document.getElementById('btn-pause-countdown');
    const pill = document.getElementById('countdown-mode-pill');

    if (btnText) btnText.innerText = isEdgingCountdownPaused ? "Weiter" : "Pause";
    if (btn) {
      if (isEdgingCountdownPaused) {
        btn.className = "flex-1 py-4 px-6 rounded-2xl bg-[#142b24] hover:bg-[#2e5746] border-2 border-[#2e5746] text-white font-black text-sm tracking-wide shadow-2xl touch-btn flex items-center justify-center gap-2";
      } else {
        btn.className = "flex-1 py-4 px-6 rounded-2xl bg-[#000000] hover:bg-[#101622] border-2 border-[#2a364f] text-slate-100 font-black text-sm tracking-wide shadow-2xl touch-btn flex items-center justify-center gap-2";
      }
    }
    if (pill) {
      pill.innerText = isEdgingCountdownPaused ? "Pausiert" : "Live";
      pill.className = isEdgingCountdownPaused 
        ? "text-[10px] font-mono text-[#b3734a] font-bold bg-[#000000] px-2.5 py-1 rounded-lg border border-[#8a5232]" 
        : "text-[10px] font-mono text-[#c5a880] font-bold bg-[#090d14] px-2.5 py-1 rounded-lg border border-[#2a364f]";
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
    const wrap = document.getElementById('countdown-wrapper');
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
      if (window.SessionAudio && typeof window.SessionAudio.setEnergyLevel === 'function') {
        window.SessionAudio.setEnergyLevel('calm');
      }
      if (countdownVoiceMode === 'self') {
        showToast("🗣️ Sprich jetzt: 'Schluss für heute. Du bleibst ungelöst.'");
      } else if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
        window.SessionVoice.play("Schluss für heute. Du bleibst ungelöst.");
      }
    }

    if (window.ProtocolRatio && typeof window.ProtocolRatio.record === 'function') {
      window.ProtocolRatio.record({
        beneficiary: 'sub',
        type: decision,
        note: `Edging-Cockpit Ausgang (${edgeCount} Edges)`,
        source: 'session_edging'
      });
    }
  }

  function scrollToEdgingPanel() {
    const panel = document.getElementById('edging-cockpit-panel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function renderEdgingCockpit(containerId = 'edging-cockpit-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div id="edging-cockpit-panel" class="theme-card rounded-3xl p-5 border border-[#c5a880]/60 shadow-2xl space-y-4 bg-[#090d14] font-sans">
        
        <div class="flex items-center justify-between border-b border-[#2a364f] pb-2.5 flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">⚡</span>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-white font-serif">Edging-Regie (JOI)</h3>
                <span id="edging-focus-badge" class="hidden px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#4a2818] text-[#f8fafc] border border-[#8a5232] animate-pulse">DREHBUCH-FOKUS</span>
              </div>
              <p class="text-[10.5px] text-[#94a3b8]">Erregungskontrolle, synchrone Atem-Countdowns &amp; Orgasmus-Entscheid.</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="flex items-center p-0.5 bg-[#000000] rounded-xl border border-[#2a364f] text-[10.5px] font-mono">
              <button type="button" onclick="SessionEdging.setStimulator('top')" id="btn-stim-top" class="px-3 py-1 rounded-lg font-bold bg-[#000000] border border-[#c5a880] text-[#c5a880] touch-btn shadow-sm">Top berührt</button>
              <button type="button" onclick="SessionEdging.setStimulator('bottom_self')" id="btn-stim-bottom" class="px-3 py-1 rounded-lg font-bold bg-[#090d14] border border-[#2a364f] text-[#94a3b8] touch-btn">Bottom berührt sich</button>
            </div>
            <!-- SCHNELLZUGRIFF AUF 5-STUFEN BESTRAFUNG -->
            <button type="button" onclick="if(window.SessionDiscipline) window.SessionDiscipline.open();" class="px-2.5 py-1 rounded-xl bg-[#450a0a] hover:bg-[#991b1b] border border-[#991b1b] text-white font-mono text-[10.5px] font-bold touch-btn shadow-sm" title="Zucht-Wizard öffnen">
              ⚖️ Zucht-Wizard
            </button>
          </div>
        </div>

        <!-- WER SPRICHT DEN COUNTDOWN -->
        <div class="p-3.5 rounded-2xl bg-[#000000] border border-[#2a364f] space-y-2 text-xs font-sans">
          <div class="flex items-center justify-between">
            <strong class="text-white text-[11px] block font-bold">Wer spricht den Countdown &amp; die Edge-Befehle?</strong>
            <span id="label-current-voice-mode" class="text-[10px] font-mono text-[#c5a880] font-bold">Gemini spricht laut</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button type="button" onclick="SessionEdging.setVoiceMode('self')" id="btn-voice-mode-self" class="p-3 rounded-xl border text-left touch-btn transition bg-[#090d14] border-[#2a364f] text-[#94a3b8] hover:border-slate-700">
              <div class="flex items-center justify-between">
                <strong class="text-xs text-white block">🗣️ Top spricht selbst</strong>
                <span class="text-[10px] text-[#b3734a] font-bold">Präsent</span>
              </div>
              <p class="text-[10px] text-[#94a3b8] mt-0.5 leading-snug">Die App bleibt stumm; Cockpit blendet Textanweisungen &amp; visuellen Atem-Takt ein.</p>
            </button>
            <button type="button" onclick="SessionEdging.setVoiceMode('gemini')" id="btn-voice-mode-gemini" class="p-3 rounded-xl border text-left touch-btn transition bg-[#000000] border-[#c5a880] text-[#c5a880] shadow-md">
              <div class="flex items-center justify-between">
                <strong class="text-xs text-white block">🔊 App-Stimme (Gemini)</strong>
                <span class="text-[10px] text-[#c5a880] font-bold">Automatisch</span>
              </div>
              <p class="text-[10px] text-[#dfcaa9] mt-0.5 leading-snug">Die Gemini-Stimme spricht den gesamten Countdown fordernd laut ins Zimmer.</p>
            </button>
          </div>
        </div>

        <!-- ERREGUNGS-SCHIEBEREGELER -->
        <div class="space-y-1.5 font-sans">
          <div class="flex items-center justify-between text-xs">
            <strong class="text-white text-[11px] font-bold">Aktuelle Erregungsstufe:</strong>
            <span id="arousal-level-badge" class="text-[#c5a880] font-mono font-bold">Stufe 5 / 10 (Plateau)</span>
          </div>
          <input type="range" min="1" max="10" value="5" oninput="SessionEdging.handleArousal(this.value)" class="w-full accent-[#c5a880] cursor-pointer h-2 bg-[#000000] rounded-lg border border-[#2a364f]">
          <div class="flex justify-between text-[9.5px] text-[#94a3b8] font-mono">
            <span>1: Sanft</span><span>5: Plateau</span><span>8: Gefahrenzone</span><span>10: Edge</span>
          </div>
        </div>

        <!-- KANTEN-TELEMETRIE KACHELN -->
        <div class="grid grid-cols-2 gap-2 text-xs font-mono">
          <div class="p-3.5 rounded-2xl bg-[#000000] border border-[#2a364f] space-y-1">
            <span class="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">Bisherige Edges:</span>
            <div class="text-2xl font-black font-mono text-[#c5a880]" id="edging-total-hits">0</div>
          </div>
          <div class="p-3.5 rounded-2xl bg-[#000000] border border-[#2a364f] space-y-1">
            <span class="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">Seit letzter Edge:</span>
            <div class="text-2xl font-black font-mono text-[#f8fafc]" id="time-since-last-edge">00:00</div>
          </div>
        </div>

        <!-- 2 HAUPT-AKTIONEN -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
          <button type="button" onclick="SessionEdging.registerEdge()" class="py-3 px-4 rounded-2xl bg-[#991b1b] hover:bg-red-700 border border-red-700 text-white font-black text-xs touch-btn shadow-lg flex items-center justify-center gap-1.5">
            <span>⚡</span><span>EDGE ERREICHT! (Hände weg)</span>
          </button>
          <button type="button" onclick="SessionEdging.openReleaseChoice()" class="py-3 px-4 rounded-2xl bg-[#142b24] hover:bg-[#2e5746] border border-[#2e5746] text-white font-black text-xs touch-btn shadow-lg flex items-center justify-center gap-1.5">
            <span>✨</span><span>Kommen lassen... (Freigabe)</span>
          </button>
        </div>

        <!-- SUBPANEL FREIGABE-STEPER -->
        <div id="release-choice-subpanel" class="hidden p-4 rounded-3xl bg-[#000000] border border-[#c5a880]/60 space-y-3.5 animate-fade-in text-xs shadow-2xl font-sans">
          <div class="flex items-center justify-between border-b border-[#2a364f] pb-2">
            <div class="flex items-center gap-2">
              <span class="text-[#c5a880] text-base">⏱️</span>
              <div>
                <strong class="text-white text-xs font-bold block font-serif">Höhepunkt-Freigabe &amp; JOI-Dauer:</strong>
                <span class="text-[10px] text-[#94a3b8]">Jerk-Off Instruction Takt &amp; Atemführung anpassen</span>
              </div>
            </div>
            <button type="button" onclick="SessionEdging.openReleaseChoice()" class="text-[#94a3b8] hover:text-white text-xs font-bold px-2 py-1 rounded-lg">✕</button>
          </div>

          <div class="p-3.5 rounded-2xl bg-[#090d14] border border-[#2a364f] space-y-2.5">
            <div class="flex items-center justify-between font-mono">
              <span class="text-[#f8fafc] font-bold text-[11px]">Dauer des Atem-Countdowns:</span>
              <span id="selected-countdown-duration-label" class="text-base font-black font-mono text-[#c5a880] px-3 py-0.5 rounded-xl bg-[#000000] border border-[#c5a880]/50">20s</span>
            </div>

            <div class="flex items-center gap-2 font-mono">
              <button type="button" onclick="SessionEdging.stepDuration(-5)" class="flex-1 py-2 px-3 rounded-xl bg-[#000000] hover:bg-[#101622] border border-[#2a364f] text-[#c5a880] font-bold text-xs flex items-center justify-center gap-1.5 touch-btn shadow-sm">
                <span>− 5s</span>
              </button>
              <button type="button" onclick="SessionEdging.stepDuration(5)" class="flex-1 py-2 px-3 rounded-xl bg-[#000000] hover:bg-[#101622] border border-[#2a364f] text-[#c5a880] font-bold text-xs flex items-center justify-center gap-1.5 touch-btn shadow-sm">
                <span>+ 5s</span>
              </button>
            </div>

            <div class="grid grid-cols-4 gap-1.5 pt-1 font-mono">
              <button type="button" onclick="SessionEdging.setCountdownDuration(5)" id="btn-cd-dur-5" class="py-1.5 rounded-lg border text-[10.5px] font-bold bg-[#090d14] border-[#2a364f] text-[#94a3b8] touch-btn">5s (Not)</button>
              <button type="button" onclick="SessionEdging.setCountdownDuration(10)" id="btn-cd-dur-10" class="py-1.5 rounded-lg border text-[10.5px] font-bold bg-[#090d14] border-[#2a364f] text-[#94a3b8] touch-btn">10s (Schnell)</button>
              <button type="button" onclick="SessionEdging.setCountdownDuration(20)" id="btn-cd-dur-20" class="py-1.5 rounded-lg border text-[10.5px] font-bold bg-[#000000] border-[#c5a880] text-[#c5a880] touch-btn shadow-sm">20s (JOI ★)</button>
              <button type="button" onclick="SessionEdging.setCountdownDuration(30)" id="btn-cd-dur-30" class="py-1.5 rounded-lg border text-[10.5px] font-bold bg-[#090d14] border-[#2a364f] text-[#94a3b8] touch-btn">30s (Trance)</button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1 font-mono">
            <button type="button" onclick="SessionEdging.executeReleaseImmediate()" class="py-2.5 rounded-xl bg-[#090d14] border border-[#2a364f] text-[#f8fafc] font-bold text-xs touch-btn">
              ⚡ Sofortige Freigabe
            </button>
            <button type="button" onclick="SessionEdging.executeReleaseCountdown()" class="py-2.5 rounded-xl bg-[#c5a880] hover:bg-[#dfcaa9] text-black font-bold text-xs touch-btn shadow-md flex items-center justify-center gap-1.5">
              <span>⏳ Start JOI-Countdown (<span id="btn-cd-label-sec">20s</span>)</span>
            </button>
          </div>
        </div>

        <!-- FULLSCREEN OVERLAY COUNTDOWN -->
        <div id="countdown-wrapper" style="display: none;" class="hidden fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex flex-col justify-between items-center p-4 sm:p-8 select-none overflow-hidden animate-fade-in font-sans">
          <div class="w-full max-w-xl flex items-center justify-between pt-2 px-2 text-xs">
            <span class="px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#000000] text-[#c5a880] border border-[#c5a880]/60 flex items-center gap-1.5 shadow-lg font-bold">
              <span class="w-2 h-2 rounded-full bg-[#c5a880] animate-ping"></span>
              Atem-Countdown zum Orgasmus
            </span>
            <span id="countdown-mode-pill" class="text-[10px] font-mono text-[#c5a880] font-bold bg-[#090d14] px-2.5 py-1 rounded-lg border border-[#2a364f]">
              Live
            </span>
          </div>

          <div class="flex-1 w-full flex flex-col items-center justify-center my-auto min-h-[68vh] sm:min-h-[72vh] relative">
            <div id="countdown-display" class="text-[44vw] sm:text-[38vh] font-black font-mono tracking-tighter leading-none text-[#c5a880] select-none transition-all duration-200 text-center will-change-transform">
              20
            </div>
            <p id="countdown-cue-text" class="text-xs sm:text-sm text-[#dfcaa9] font-serif font-semibold tracking-wide text-center mt-2 px-4 max-w-md drop-shadow">
              Regiestimme fokussiert die Edge...
            </p>
          </div>

          <div class="w-full max-w-md flex items-center justify-center gap-4 pb-4 sm:pb-6 z-10 font-mono">
            <button type="button" onclick="SessionEdging.pauseCountdown()" id="btn-pause-countdown" class="flex-1 py-4 px-6 rounded-2xl bg-[#000000] hover:bg-[#101622] border-2 border-[#2a364f] text-white font-bold text-sm tracking-wide shadow-2xl touch-btn flex items-center justify-center gap-2">
              <span>⏸</span><span id="btn-pause-countdown-text">Pause</span>
            </button>
            <button type="button" onclick="SessionEdging.resetCountdown()" id="btn-cancel-countdown" class="flex-1 py-4 px-6 rounded-2xl bg-[#450a0a] hover:bg-[#991b1b] border-2 border-[#991b1b] text-white font-bold text-sm tracking-wide shadow-2xl touch-btn flex items-center justify-center gap-2">
              <span>✕</span><span>Abbrechen</span>
            </button>
          </div>
        </div>

        <!-- FINALE ENTSCHEIDUNGEN -->
        <div class="grid grid-cols-2 gap-2 pt-1 border-t border-[#2a364f] text-xs font-mono">
          <button type="button" onclick="SessionEdging.finalizeDecision('ruined')" class="py-2.5 px-3 rounded-xl bg-[#000000] hover:bg-[#101622] border border-[#2a364f] text-[#b3734a] font-bold touch-btn">
            🥀 Ruined Orgasm anordnen
          </button>
          <button type="button" onclick="SessionEdging.finalizeDecision('denial')" class="py-2.5 px-3 rounded-xl bg-[#000000] hover:bg-[#101622] border border-[#2a364f] text-[#991b1b] font-bold touch-btn">
            🔒 Orgasmus verweigern (Denial)
          </button>
        </div>

      </div>
    `;
  }

  const api = {
    render: renderEdgingCockpit,
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
    getEdgeCount: () => edgeCount,
    resetState: () => {
      edgeCount = 0;
      lastEdgeTimestamp = null;
      const hitsEl = document.getElementById('edging-total-hits');
      if (hitsEl) hitsEl.innerText = "0";
      const disp = document.getElementById('time-since-last-edge');
      if (disp) disp.innerText = "00:00";
    }
  };

  window.SessionEdging = api;

  // Initialisieren / Rendern falls Container bereits im DOM vorhanden
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        const el = document.getElementById('edging-cockpit-container');
        if (el) api.render('edging-cockpit-container');
      });
    } else {
      const el = document.getElementById('edging-cockpit-container');
      if (el) api.render('edging-cockpit-container');
    }
  }

})(typeof window !== 'undefined' ? window : this);
