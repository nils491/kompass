/**
 * js/session_audio.js
 * Spezialisiertes Ambient- und Klangsynthese-Modul für das Schlafzimmer-Cockpit & die Regie.
 * 
 * Features:
 * - 100% rauschfreie, organische Klangwelten:
 *   1. Cinematic Velvet: 5-stimmige warme Analog-Pads (Dm9, Bbmaj7, Fmaj9, C9, Gm9) & Pianoglocken
 *   2. Klangtempel 432Hz: Reine tibetische Obertonschalen mit warmem 432Hz-Resonanzdrone
 *   3. Sinnliche Nachtbrise: Tief atmende harmonische Meereswellen ohne statisches Rauschen
 *   4. Dark Downtempo: Warmer 56-BPM Slow-Beat mit sanften Rhodes-E-Piano-Akkorden
 * - Echter Lautstärkeregler (0–100%) mit weichen Lautstärke-Rampen
 * - Situative Intensitäts-Modulation (Stufen 1–4)
 * - Sanftes Audio-Ducking (Absenkung auf 20 %) bei Sprachansagen
 */

(function(window) {
  'use strict';

  var audioState = {
    activeSource: 'synth',
    currentStyle: 'velvet',
    energyLevel: 2,
    volume: 0.70,
    isPlaying: false,
    duckingActive: false
  };

  var audioCtx = null;
  var masterGain = null;
  var duckingGainNode = null;
  var filterNode = null;
  var activeNodes = [];
  var generativeIntervals = [];

  function ensureAudioGraph() {
    if (!audioCtx) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function() {});
    }

    if (audioCtx && !masterGain) {
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(audioState.volume, audioCtx.currentTime);

      duckingGainNode = audioCtx.createGain();
      duckingGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);

      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(3200, audioCtx.currentTime);
      filterNode.Q.setValueAtTime(0.7, audioCtx.currentTime);

      masterGain.connect(duckingGainNode);
      duckingGainNode.connect(filterNode);
      filterNode.connect(audioCtx.destination);
    }
  }

  function setMasterVolume(val) {
    var num = parseFloat(val);
    if (isNaN(num)) num = 0.7;
    num = Math.max(0, Math.min(1.0, num));
    audioState.volume = num;

    if (masterGain && audioCtx) {
      var now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.linearRampToValueAtTime(num, now + 0.1);
    }

    var volDisp = document.getElementById('ambient-volume-label');
    if (volDisp) volDisp.innerText = Math.round(num * 100) + "%";
  }

  function applyAudioDucking(duck) {
    if (!duckingGainNode || !audioCtx) return;
    audioState.duckingActive = duck;
    var now = audioCtx.currentTime;

    duckingGainNode.gain.cancelScheduledValues(now);
    if (duck) {
      duckingGainNode.gain.setTargetAtTime(0.20, now, 0.15);
    } else {
      duckingGainNode.gain.setTargetAtTime(1.0, now, 0.50);
    }
  }

  function stopAllGenerators() {
    generativeIntervals.forEach(function(timerId) {
      clearInterval(timerId);
      clearTimeout(timerId);
    });
    generativeIntervals = [];

    activeNodes.forEach(function(item) {
      try {
        if (item.stop) item.stop();
        if (item.disconnect) item.disconnect();
      } catch (e) {}
    });
    activeNodes = [];
  }

  // 1. CINEMATIC VELVET (Warme, atmende Akkorde & delikate Pianoglocken)
  function startVelvetSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // 8 weit gefasste, tief emotionale Akkorde (Grundfrequenzen in Hz)
    var chordPool = [
      [146.83, 220.00, 261.63, 329.63, 440.00], // Dm9
      [116.54, 174.61, 233.08, 293.66, 349.23], // Bbmaj7
      [87.31, 130.81, 174.61, 220.00, 261.63],  // Fmaj9
      [130.81, 164.81, 196.00, 246.94, 293.66], // C add 9
      [98.00, 146.83, 196.00, 246.94, 329.63],  // Gm9
      [110.00, 164.81, 220.00, 261.63, 329.63], // Am9
      [82.41, 123.47, 164.81, 246.94, 329.63],  // Em7/11
      [110.00, 146.83, 220.00, 293.66, 349.23]  // Dm/A
    ];

    var currentChordIdx = 0;
    var padOscs = [];

    // Erzeuge 5 warme Pad-Oszillatoren mit Stereo-Detuning
    for (var i = 0; i < 5; i++) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = (i === 0) ? 'sine' : (i % 2 === 0 ? 'triangle' : 'sine');
      osc.frequency.setValueAtTime(chordPool[0][i], audioCtx.currentTime);

      // Sanfter Chorschwebungs-Detune
      var detuneVal = (i - 2) * 5 + (Math.random() - 0.5) * 3;
      osc.detune.setValueAtTime(detuneVal, audioCtx.currentTime);

      var baseVol = (i === 0) ? 0.22 : 0.16;
      gain.gain.setValueAtTime(baseVol, audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();

      padOscs.push(osc);
      activeNodes.push(osc, gain);
    }

    // Harmonische Akkordfortschreitung alle 8 Sekunden
    function advanceVelvetChord() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'velvet') return;
      currentChordIdx = (currentChordIdx + 1) % chordPool.length;
      var newChord = chordPool[currentChordIdx];
      var now = audioCtx.currentTime;

      padOscs.forEach(function(osc, idx) {
        osc.frequency.setTargetAtTime(newChord[idx], now, 3.5);
      });
    }

    var chordTimer = setInterval(advanceVelvetChord, 8000);
    generativeIntervals.push(chordTimer);

    // Kristallklare Pianoglocken (zufällige, sanfte Melodietupfer)
    function triggerVelvetChime() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'velvet') return;

      var currentChord = chordPool[currentChordIdx];
      var noteFreq = currentChord[Math.floor(Math.random() * currentChord.length)] * 2;
      var now = audioCtx.currentTime;

      var chimeOsc = audioCtx.createOscillator();
      var chimeGain = audioCtx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(noteFreq, now);

      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.18 + (audioState.energyLevel * 0.04), now + 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(masterGain);

      chimeOsc.start(now);
      chimeOsc.stop(now + 3.5);

      var nextDelay = 3500 + Math.random() * 4500;
      var nextTimer = setTimeout(triggerVelvetChime, nextDelay);
      generativeIntervals.push(nextTimer);
    }

    var initialTimer = setTimeout(triggerVelvetChime, 2500);
    generativeIntervals.push(initialTimer);
  }

  // 2. KLANGTEMPEL 432Hz (Tibetische Klangschalen mit Naturton-Harmonien)
  function startBowlsSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // 432Hz Grundschwingung & warmer Om-Resonanzdrone
    var droneFrequencies = [54.00, 108.00, 216.00, 432.00];

    droneFrequencies.forEach(function(freq, idx) {
      var osc = audioCtx.createOscillator();
      var g = audioCtx.createGain();

      osc.type = (idx === 0) ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.detune.setValueAtTime((idx - 1.5) * 2.2, audioCtx.currentTime);

      var vol = (idx === 0) ? 0.28 : (0.15 / idx);
      g.gain.setValueAtTime(vol, audioCtx.currentTime);

      osc.connect(g);
      g.connect(masterGain);
      osc.start();

      activeNodes.push(osc, g);
    });

    // Sanft angeschlagene tibetische Klangschale mit echten Obertönen (1.0x, 2.76x, 5.4x)
    function strikeSingingBowl() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'bowls') return;
      var now = audioCtx.currentTime;
      var harmonics = [432.00, 432 * 2.76, 432 * 5.4];

      harmonics.forEach(function(f, pIdx) {
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        var peak = (0.24 / (pIdx + 1)) * (0.8 + audioState.energyLevel * 0.15);
        var decay = 6.0 - (pIdx * 1.2);

        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(peak, now + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(g);
        g.connect(masterGain);

        osc.start(now);
        osc.stop(now + decay + 0.1);
      });

      var nextTime = 6000 + Math.random() * 4000;
      var timer = setTimeout(strikeSingingBowl, nextTime);
      generativeIntervals.push(timer);
    }

    strikeSingingBowl();
  }

  // 3. SINNLICHE NACHTBEREISE (Atmende warme Harmoniewellen)
  function startOceanSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // Warme, tiefe Akkordwelle (Atmende Sinus-Töne statt statischem Rauschen)
    var oceanChord = [65.41, 98.00, 130.81, 164.81, 196.00]; // Cmaj9 tief
    var waveOscs = [];
    var waveGain = audioCtx.createGain();

    waveGain.gain.setValueAtTime(0.20, audioCtx.currentTime);
    waveGain.connect(masterGain);

    oceanChord.forEach(function(freq, i) {
      var osc = audioCtx.createOscillator();
      osc.type = (i === 0) ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.detune.setValueAtTime((i - 2) * 3, audioCtx.currentTime);
      osc.connect(waveGain);
      osc.start();
      waveOscs.push(osc);
      activeNodes.push(osc);
    });
    activeNodes.push(waveGain);

    // Organischer Wellenzyklus: Harmonisches Anschwellen und Abfließen
    function triggerHarmonicWave() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'ocean') return;
      var now = audioCtx.currentTime;
      var cycleDuration = 8.5 + (Math.random() * 3.5);
      var peakTime = now + (cycleDuration * 0.42);

      waveGain.gain.cancelScheduledValues(now);
      waveGain.gain.setValueAtTime(0.15, now);
      waveGain.gain.linearRampToValueAtTime(0.35 + (audioState.energyLevel * 0.08), peakTime);
      waveGain.gain.linearRampToValueAtTime(0.15, now + cycleDuration);

      var nextTimer = setTimeout(triggerHarmonicWave, (cycleDuration - 0.5) * 1000);
      generativeIntervals.push(nextTimer);
    }

    triggerHarmonicWave();
  }

  // 4. DARK DOWNTEMPO (Erotischer Slow-Beat & Rhodes-Akkorde bei 56 BPM)
  function startBeatsSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // Warmer 55Hz Subbass-Drone
    var subOsc = audioCtx.createOscillator();
    var subGain = audioCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55.00, audioCtx.currentTime);
    subGain.gain.setValueAtTime(0.28, audioCtx.currentTime);

    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    activeNodes.push(subOsc, subGain);

    // Warme Rhodes-Akkorde (Triangle mit sanftem Tremolo)
    var rhodesNotes = [110.00, 164.81, 220.00, 261.63]; // Am7
    rhodesNotes.forEach(function(freq) {
      var osc = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      g.gain.setValueAtTime(0.08, audioCtx.currentTime);

      osc.connect(g);
      g.connect(masterGain);
      osc.start();
      activeNodes.push(osc, g);
    });

    // Sanfter Herzschlag-Puls bei 56 BPM (1.07 Sekunden Intervall)
    var beatInterval = (60 / 56) * 1000;

    function triggerHeartbeatPulse() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'beats') return;
      var now = audioCtx.currentTime;

      var pulseOsc = audioCtx.createOscillator();
      var pulseGain = audioCtx.createGain();

      pulseOsc.frequency.setValueAtTime(80, now);
      pulseOsc.frequency.exponentialRampToValueAtTime(42, now + 0.28);

      pulseGain.gain.setValueAtTime(0.32 + (audioState.energyLevel * 0.05), now);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      pulseOsc.connect(pulseGain);
      pulseGain.connect(masterGain);

      pulseOsc.start(now);
      pulseOsc.stop(now + 0.35);
    }

    triggerHeartbeatPulse();
    var beatTimer = setInterval(triggerHeartbeatPulse, beatInterval);
    generativeIntervals.push(beatTimer);
  }

  function applySoundscapeEnergyModulation() {
    if (!audioCtx || !filterNode) return;
    var now = audioCtx.currentTime;

    var targetCutoff = 2200 + (audioState.energyLevel * 600);
    filterNode.frequency.setTargetAtTime(targetCutoff, now, 0.4);

    var disp = document.getElementById('ambient-intensity-display');
    if (disp) disp.innerText = "(Stufe " + audioState.energyLevel + "/4)";
  }

  function adjustAmbientEnergy(direction) {
    if (direction === 'energy') {
      audioState.energyLevel = Math.min(4, audioState.energyLevel + 1);
    } else {
      audioState.energyLevel = Math.max(1, audioState.energyLevel - 1);
    }

    applySoundscapeEnergyModulation();

    if (typeof window.showToast === 'function') {
      var msg = (direction === 'energy')
        ? "Klangwelt intensiviert (Stufe " + audioState.energyLevel + "/4)"
        : "Klangwelt beruhigt (Stufe " + audioState.energyLevel + "/4)";
      window.showToast(msg);
    }
  }

  function setSoundscapeStyle(style) {
    audioState.currentStyle = style;

    ['velvet', 'bowls', 'ocean', 'beats'].forEach(function(s) {
      var btn = document.getElementById('btn-style-' + s);
      if (btn) {
        if (s === style) btn.className = "p-2.5 rounded-xl border bg-brand-950 border-brand-500 text-brand-100 font-bold text-left touch-btn shadow-md";
        else btn.className = "p-2.5 rounded-xl border theme-panel text-slate-300 font-bold text-left touch-btn";
      }
    });

    var sel = document.getElementById('select-cockpit-soundscape');
    if (sel) sel.value = style;

    var styleNames = {
      velvet: "Cinematic Velvet",
      bowls: "Klangtempel 432Hz",
      ocean: "Sinnliche Nachtbrise",
      beats: "Dark Downtempo"
    };

    var nameEl = document.getElementById('cockpit-ambient-style-name');
    if (nameEl) nameEl.innerText = "Soundscape: " + (styleNames[style] || style);

    // Klick auf Style startet die Musik direkt oder wechselt sie live
    ensureAudioGraph();
    audioState.isPlaying = true;
    updatePlaybackUI();
    startCurrentSoundscapeEngine();

    if (typeof window.showToast === 'function') {
      window.showToast("Klangwelt aktiv: " + (styleNames[style] || style) + " 🎵");
    }
  }

  function startCurrentSoundscapeEngine() {
    if (audioState.currentStyle === 'velvet') startVelvetSoundscape();
    else if (audioState.currentStyle === 'bowls') startBowlsSoundscape();
    else if (audioState.currentStyle === 'ocean') startOceanSoundscape();
    else if (audioState.currentStyle === 'beats') startBeatsSoundscape();
    applySoundscapeEnergyModulation();
  }

  function toggleAmbientMusic() {
    ensureAudioGraph();
    audioState.isPlaying = !audioState.isPlaying;

    updatePlaybackUI();

    if (audioState.isPlaying) {
      startCurrentSoundscapeEngine();
      if (typeof window.showToast === 'function') {
        var styleNames = { velvet: "Cinematic Velvet", bowls: "Klangtempel 432Hz", ocean: "Sinnliche Nachtbrise", beats: "Dark Downtempo" };
        window.showToast("Musik gestartet: " + (styleNames[audioState.currentStyle] || audioState.currentStyle) + " 🎵");
      }
    } else {
      stopAllGenerators();
      if (typeof window.showToast === 'function') {
        window.showToast("Musik pausiert ⏸");
      }
    }
  }

  function selectMusicSource(source) {
    audioState.activeSource = source;
    var bOwn = document.getElementById('btn-music-source-own');
    var bSynth = document.getElementById('btn-music-source-synth');
    var pOwn = document.getElementById('music-panel-own');
    var pSynth = document.getElementById('music-panel-synth');

    if (source === 'own') {
      if (bOwn) bOwn.className = "px-2.5 py-1 rounded-lg border text-[10px] font-bold bg-brand-950 border-brand-500 text-brand-200 touch-btn";
      if (bSynth) bSynth.className = "px-2.5 py-1 rounded-lg border text-[10px] font-bold theme-panel text-slate-400 touch-btn";
      if (pOwn) pOwn.classList.remove('hidden');
      if (pSynth) pSynth.classList.add('hidden');
      stopAllGenerators();
    } else {
      if (bSynth) bSynth.className = "px-2.5 py-1 rounded-lg border text-[10px] font-bold bg-brand-950 border-brand-500 text-brand-200 touch-btn";
      if (bOwn) bOwn.className = "px-2.5 py-1 rounded-lg border text-[10px] font-bold theme-panel text-slate-400 touch-btn";
      if (pSynth) pSynth.classList.remove('hidden');
      if (pOwn) pOwn.classList.add('hidden');
      if (audioState.isPlaying) startCurrentSoundscapeEngine();
    }
  }

  function updatePlaybackUI() {
    var btnH = document.getElementById('btn-ambient-header');
    var iconH = document.getElementById('ambient-status-icon');
    var labelH = document.getElementById('ambient-status-label');
    var btnSetup = document.getElementById('btn-setup-ambient-toggle');
    var btnCockpit = document.getElementById('btn-cockpit-ambient-play');
    var ind = document.getElementById('cockpit-ambient-indicator');

    if (audioState.isPlaying) {
      if (iconH) iconH.innerText = "⏸";
      if (labelH) labelH.innerText = "Pause";
      if (btnH) btnH.className = "px-2.5 py-1.5 bg-brand-900 border border-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition touch-btn";
      if (btnSetup) btnSetup.innerText = "⏸ Audio pausieren";
      if (btnCockpit) btnCockpit.innerText = "⏸ Pause";
      if (ind) ind.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
    } else {
      if (iconH) iconH.innerText = "🎵";
      if (labelH) labelH.innerText = "Musik";
      if (btnH) btnH.className = "px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition touch-btn";
      if (btnSetup) btnSetup.innerText = "▶ Audio starten";
      if (btnCockpit) btnCockpit.innerText = "▶ Play";
      if (ind) ind.className = "w-2 h-2 rounded-full bg-slate-600";
    }
  }

  window.SessionAudio = {
    toggle: toggleAmbientMusic,
    setStyle: setSoundscapeStyle,
    setVolume: setMasterVolume,
    adjustEnergy: adjustAmbientEnergy,
    selectSource: selectMusicSource,
    applyDucking: applyAudioDucking,
    stopAll: stopAllGenerators,
    ensureGraph: ensureAudioGraph
  };

  // Globale Aliase für HTML-Event-Handler
  window.toggleAmbientMusic = toggleAmbientMusic;
  window.toggleAmbientMusicWrapper = toggleAmbientMusic;
  window.setSoundscapeStyle = setSoundscapeStyle;
  window.setSoundscapeStyleWrapper = setSoundscapeStyle;
  window.setMasterAudioVolume = setMasterVolume;
  window.adjustAmbientEnergy = adjustAmbientEnergy;
  window.adjustAmbientEnergyWrapper = adjustAmbientEnergy;
  window.selectMusicSource = selectMusicSource;
  window.selectMusicSourceWrapper = selectMusicSource;
  window.applyAudioDucking = applyAudioDucking;
  window.stopAllSoundscapeNodes = stopAllGenerators;

})(window);
