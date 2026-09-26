/**
 * js/session_audio.js
 * Prozedurale, dynamische Hintergrundmusik-Engine für die Schlafzimmer-Regie.
 * 
 * Features:
 * - KEINE Dauertöne: Alle Noten, Chords und Bässe werden rhythmisch angeschlagen und klingen natürlich aus.
 * - Echter Noten- & Akkord-Sequenzer mit 4 Stilen (Velvet, Klangtempel 432Hz, Nachtbrise, Downtempo).
 * - "Ruhiger" / "Energetischer" steuert Tempo (BPM), Taktung, Akkorddichte und Hüllkurven sofort hörbar.
 * - Weicher Master-Lautstärkeregler (0–100%) & sanftes Audio-Ducking (Absenkung auf 20%) bei Sprachansagen.
 */

(function(window) {
  'use strict';

  var audioState = {
    activeSource: 'synth',
    currentStyle: 'velvet',
    energyLevel: 2, // 1 (50 BPM) bis 4 (86 BPM)
    volume: 0.70,
    isPlaying: false,
    duckingActive: false
  };

  var audioCtx = null;
  var masterGain = null;
  var duckingGainNode = null;
  var mainFilterNode = null;

  var sequencerTimer = null;
  var activeOscillators = [];

  // Tempo- & Dynamik-Stufen für spürbare Veränderung bei "Ruhiger" / "Energetischer"
  var ENERGY_PROFILES = {
    1: { bpm: 50, barDuration: 9.6, chordDecay: 6.5, noteDensity: 0.25, filterFreq: 1400, label: "Stufe 1/4 (50 BPM – Schwebend)" },
    2: { bpm: 62, barDuration: 7.7, chordDecay: 5.2, noteDensity: 0.50, filterFreq: 2200, label: "Stufe 2/4 (62 BPM – Sanfter Flow)" },
    3: { bpm: 74, barDuration: 6.5, chordDecay: 4.2, noteDensity: 0.75, filterFreq: 3100, label: "Stufe 3/4 (74 BPM – Präsent)" },
    4: { bpm: 86, barDuration: 5.6, chordDecay: 3.5, noteDensity: 1.00, filterFreq: 4200, label: "Stufe 4/4 (86 BPM – Treibend)" }
  };

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

      mainFilterNode = audioCtx.createBiquadFilter();
      mainFilterNode.type = 'lowpass';
      mainFilterNode.frequency.setValueAtTime(ENERGY_PROFILES[audioState.energyLevel].filterFreq, audioCtx.currentTime);
      mainFilterNode.Q.setValueAtTime(0.8, audioCtx.currentTime);

      masterGain.connect(duckingGainNode);
      duckingGainNode.connect(mainFilterNode);
      mainFilterNode.connect(audioCtx.destination);
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
      masterGain.gain.linearRampToValueAtTime(num, now + 0.08);
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
      duckingGainNode.gain.setTargetAtTime(0.20, now, 0.12);
    } else {
      duckingGainNode.gain.setTargetAtTime(1.0, now, 0.45);
    }
  }

  function stopAllGenerators() {
    if (sequencerTimer) {
      clearTimeout(sequencerTimer);
      clearInterval(sequencerTimer);
      sequencerTimer = null;
    }

    activeOscillators.forEach(function(item) {
      try {
        if (item.stop) item.stop();
        if (item.disconnect) item.disconnect();
      } catch (e) {}
    });
    activeOscillators = [];
  }

  // Spielt einen warmen, ausklingenden Rhodes- oder Klavier-Ton (KEIN Dauerton!)
  function playStruckNote(freq, startTime, duration, velocity, waveform, isBass) {
    if (!audioCtx || !masterGain || !audioState.isPlaying) return;

    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    var filter = audioCtx.createBiquadFilter();

    osc.type = waveform || 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Sanfte Filterung für warmen Akustikcharakter
    filter.type = isBass ? 'lowpass' : 'bandpass';
    if (isBass) {
      filter.frequency.setValueAtTime(180, startTime);
      filter.frequency.exponentialRampToValueAtTime(70, startTime + duration);
    } else {
      filter.frequency.setValueAtTime(Math.min(2800, freq * 2.8), startTime);
      filter.Q.setValueAtTime(0.9, startTime);
    }

    // Natürliche ADSR-Hüllkurve: Knackfreier Anschlag & weiches Ausklingen
    var peakVol = (velocity || 0.12) * (isBass ? 0.35 : 0.18);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakVol, startTime + (isBass ? 0.05 : 0.025));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);

    activeOscillators.push(osc);
    setTimeout(function() {
      var idx = activeOscillators.indexOf(osc);
      if (idx !== -1) activeOscillators.splice(idx, 1);
    }, (duration + 0.2) * 1000);
  }

  // Spielt einen warmen, jazzigen Akkord mit leichtem Zeitversatz (Strumming)
  function playStrummedChord(chordFrequencies, startTime, decayTime, velocity, waveform) {
    if (!Array.isArray(chordFrequencies)) return;
    chordFrequencies.forEach(function(freq, idx) {
      // 25ms Strum-Verzögerung pro Note für echten E-Piano-Anschlag
      var noteStart = startTime + (idx * 0.025);
      playStruckNote(freq, noteStart, decayTime, velocity, waveform || 'triangle', false);
    });
  }

  // Spielt einen sanften Herzschlag-Puls (Sub-Kick)
  function playHeartbeatPulse(startTime, strength) {
    if (!audioCtx || !masterGain || !audioState.isPlaying) return;

    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, startTime);
    osc.frequency.exponentialRampToValueAtTime(38, startTime + 0.22);

    var vol = (strength || 0.20);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.25);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.28);
  }

  // 1. CINEMATIC VELVET (Warme Neo-Soul / Lo-Fi Akkordfolge)
  var VELVET_PROGRESSION = [
    {
      chord: [146.83, 220.00, 261.63, 329.63], // Dm9 (D3, A3, C4, E4)
      bass: 73.42,                              // D2
      melody: [349.23, 440.00, 523.25, 587.33]  // F4, A4, C5, D5
    },
    {
      chord: [116.54, 174.61, 233.08, 293.66], // Bbmaj7 (Bb2, F3, Bb3, D4)
      bass: 58.27,                              // Bb1
      melody: [293.66, 349.23, 440.00, 466.16]  // D4, F4, A4, Bb4
    },
    {
      chord: [87.31, 130.81, 174.61, 220.00],  // Fmaj9 (F2, C3, F3, A3)
      bass: 43.65,                              // F1
      melody: [261.63, 329.63, 392.00, 523.25]  // C4, E4, G4, C5
    },
    {
      chord: [98.00, 146.83, 196.00, 246.94],  // Gm9 (G2, D3, G3, B3)
      bass: 49.00,                              // G1
      melody: [293.66, 349.23, 392.00, 440.00]  // D4, F4, G4, A4
    }
  ];

  // 2. KLANGTEMPEL 432Hz (Tibetische Schalen mit Naturton-Harmonien)
  var BOWLS_PROGRESSION = [
    { chord: [108.00, 216.00, 432.00, 648.00], bass: 54.00, melody: [432.00, 540.00, 648.00, 864.00] },
    { chord: [144.00, 288.00, 432.00, 576.00], bass: 72.00, melody: [432.00, 576.00, 720.00, 864.00] },
    { chord: [129.60, 259.20, 388.80, 518.40], bass: 64.80, melody: [388.80, 518.40, 648.00, 777.60] }
  ];

  // 3. SINNLICHE NACHTBEREISE (Atmende Dreiklänge)
  var OCEAN_PROGRESSION = [
    { chord: [130.81, 164.81, 196.00, 246.94], bass: 65.41, melody: [261.63, 329.63, 392.00, 493.88] },
    { chord: [146.83, 174.61, 220.00, 261.63], bass: 73.42, melody: [293.66, 349.23, 440.00, 523.25] },
    { chord: [164.81, 196.00, 246.94, 293.66], bass: 82.41, melody: [329.63, 392.00, 493.88, 587.33] }
  ];

  // 4. DARK DOWNTEMPO (56–86 BPM Slow-Beat mit Rhodes-Akkorden)
  var DOWNTEMPO_PROGRESSION = [
    { chord: [110.00, 164.81, 220.00, 261.63], bass: 55.00, melody: [220.00, 261.63, 329.63, 440.00] },
    { chord: [98.00, 146.83, 196.00, 246.94],  bass: 49.00, melody: [196.00, 246.94, 293.66, 392.00] },
    { chord: [87.31, 130.81, 174.61, 220.00],  bass: 43.65, melody: [174.61, 220.00, 261.63, 349.23] },
    { chord: [123.47, 164.81, 220.00, 293.66], bass: 61.74, melody: [246.94, 293.66, 329.63, 493.88] }
  ];

  var currentStepIndex = 0;

  function scheduleNextMusicalBar() {
    if (!audioState.isPlaying || !audioCtx) return;

    var profile = ENERGY_PROFILES[audioState.energyLevel];
    var now = audioCtx.currentTime;

    var prog = VELVET_PROGRESSION;
    if (audioState.currentStyle === 'bowls') prog = BOWLS_PROGRESSION;
    else if (audioState.currentStyle === 'ocean') prog = OCEAN_PROGRESSION;
    else if (audioState.currentStyle === 'beats') prog = DOWNTEMPO_PROGRESSION;

    var bar = prog[currentStepIndex % prog.length];
    currentStepIndex++;

    // 1. Warmer, angeschlagener Akkord (klingt nach profile.chordDecay Sekunden natürlich aus)
    var chordVelocity = 0.10 + (audioState.energyLevel * 0.025);
    var chordWave = (audioState.currentStyle === 'bowls') ? 'sine' : 'triangle';
    playStrummedChord(bar.chord, now + 0.05, profile.chordDecay, chordVelocity, chordWave);

    // 2. Akustischer Bass-Zupfer auf Beat 1
    playStruckNote(bar.bass, now + 0.05, profile.chordDecay * 0.7, 0.22, 'triangle', true);

    // Bei Stufe 3 und 4: Ein zweiter synkopierter Bass-Ton zur Belebung
    if (audioState.energyLevel >= 3) {
      var syncTime = now + (profile.barDuration * 0.55);
      playStruckNote(bar.bass * 1.5, syncTime, profile.chordDecay * 0.5, 0.16, 'triangle', true);
    }

    // 3. Prozedurale, melodische Pianonoten (keine starren Wiederholungen!)
    var numMelodyNotes = Math.round(1 + (profile.noteDensity * 3));
    for (var m = 0; m < numMelodyNotes; m++) {
      var noteDelay = (profile.barDuration * 0.22) + (m * (profile.barDuration * 0.22)) + (Math.random() * 0.4);
      if (noteDelay < profile.barDuration - 0.5) {
        var noteFreq = bar.melody[Math.floor(Math.random() * bar.melody.length)];
        var noteDuration = 1.8 + Math.random() * 1.5;
        playStruckNote(noteFreq, now + noteDelay, noteDuration, 0.09, 'sine', false);
      }
    }

    // 4. Sanfter Herzschlag-Puls bei Downtempo oder höheren Energiestufen
    if (audioState.currentStyle === 'beats' || audioState.energyLevel >= 2) {
      playHeartbeatPulse(now + 0.05, 0.18 + (audioState.energyLevel * 0.04));
      if (audioState.energyLevel >= 3) {
        playHeartbeatPulse(now + (profile.barDuration * 0.5), 0.14);
      }
    }

    // Den nächsten Takt exakt nach profile.barDuration timen
    var nextDelayMs = profile.barDuration * 1000;
    sequencerTimer = setTimeout(scheduleNextMusicalBar, nextDelayMs);
  }

  function applySoundscapeEnergyModulation() {
    var profile = ENERGY_PROFILES[audioState.energyLevel];

    // Filter-Frequenz anpassen
    if (audioCtx && mainFilterNode) {
      var now = audioCtx.currentTime;
      mainFilterNode.frequency.cancelScheduledValues(now);
      mainFilterNode.frequency.setTargetAtTime(profile.filterFreq, now, 0.25);
    }

    // UI-Anzeige aktualisieren
    var disp = document.getElementById('ambient-intensity-display');
    if (disp) {
      disp.innerText = "(" + profile.label + ")";
    }

    // Wenn Musik gerade läuft: Sequenzer sofort mit neuem Tempo neu einphasen
    if (audioState.isPlaying) {
      if (sequencerTimer) {
        clearTimeout(sequencerTimer);
        sequencerTimer = null;
      }
      scheduleNextMusicalBar();
    }
  }

  function adjustAmbientEnergy(direction) {
    if (direction === 'energy') {
      audioState.energyLevel = Math.min(4, audioState.energyLevel + 1);
    } else {
      audioState.energyLevel = Math.max(1, audioState.energyLevel - 1);
    }

    applySoundscapeEnergyModulation();

    var profile = ENERGY_PROFILES[audioState.energyLevel];
    if (typeof window.showToast === 'function') {
      var msg = (direction === 'energy')
        ? "Tempo & Dynamik erhöht: " + profile.label
        : "Tempo beruhigt: " + profile.label;
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

    ensureAudioGraph();
    audioState.isPlaying = true;
    updatePlaybackUI();

    stopAllGenerators();
    currentStepIndex = 0;
    scheduleNextMusicalBar();
    applySoundscapeEnergyModulation();

    if (typeof window.showToast === 'function') {
      window.showToast("Klangwelt aktiv: " + (styleNames[style] || style) + " 🎵");
    }
  }

  function toggleAmbientMusic() {
    ensureAudioGraph();
    audioState.isPlaying = !audioState.isPlaying;

    updatePlaybackUI();

    if (audioState.isPlaying) {
      stopAllGenerators();
      currentStepIndex = 0;
      scheduleNextMusicalBar();
      applySoundscapeEnergyModulation();

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
      if (audioState.isPlaying) {
        stopAllGenerators();
        scheduleNextMusicalBar();
      }
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

  // Globale Wrapper für alle inline onclick-Attribute
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
