/**
 * js/session_audio.js
 * Spezialisiertes Ambient- und Klangsynthese-Modul für das Schlafzimmer-Cockpit & die Regie.
 * 
 * Features:
 * - Dynamische Klangwelten: Cinematic Velvet, Klangtempel 432Hz, Ozean-Brandung (LFO), Dark Downtempo
 * - Situative Modulation des aktuellen Klangs (Stufen 1–4)
 * - Sanftes Audio-Ducking (Absenkung auf 20 %) bei Gemini-Sprachausgabe
 * - Unterstützung externer Playlists (Spotify / Apple Music)
 * - Sichere Audio-Deallokation gegen Knacken und Speicherlecks
 */

(function(window) {
  'use strict';

  var audioState = {
    activeSource: 'own', // 'own' (externe Playlist) oder 'synth' (generative Soundscape)
    currentStyle: 'velvet', // 'velvet', 'bowls', 'ocean', 'beats'
    energyLevel: 2, // 1 (Sanft), 2 (Moderat), 3 (Intensiv), 4 (Ekstatisch)
    isPlaying: false,
    duckingActive: false
  };

  var audioCtx = null;
  var masterGain = null;
  var filterNode = null;
  var duckingGainNode = null;
  var activeOscillators = [];
  var rhythmTimers = [];
  var lfoNodes = [];

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
      masterGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

      duckingGainNode = audioCtx.createGain();
      duckingGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);

      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(500, audioCtx.currentTime);

      // Routing: Sound -> MasterGain -> DuckingGain -> Filter -> Lautsprecher
      masterGain.connect(duckingGainNode);
      duckingGainNode.connect(filterNode);
      filterNode.connect(audioCtx.destination);
    }
  }

  function applyAudioDucking(duck) {
    if (!duckingGainNode || !audioCtx) return;
    audioState.duckingActive = duck;
    var now = audioCtx.currentTime;

    if (duck) {
      // Sanft absenken auf 20 % Lautstärke innerhalb von 350 ms
      duckingGainNode.gain.cancelScheduledValues(now);
      duckingGainNode.gain.setTargetAtTime(0.20, now, 0.12);
    } else {
      // Geschmeidig zurückblenden auf 100 % Lautstärke
      duckingGainNode.gain.cancelScheduledValues(now);
      duckingGainNode.gain.setTargetAtTime(1.0, now, 0.40);
    }
  }

  function stopActiveOscillators() {
    activeOscillators.forEach(function(item) {
      try {
        if (item.osc) {
          item.osc.stop();
          item.osc.disconnect();
        }
        if (item.gain) {
          item.gain.disconnect();
        }
      } catch (e) {}
    });
    activeOscillators = [];

    lfoNodes.forEach(function(lfo) {
      try {
        lfo.stop();
        lfo.disconnect();
      } catch (e) {}
    });
    lfoNodes = [];
  }

  function stopAllGenerators() {
    stopActiveOscillators();

    rhythmTimers.forEach(function(t) {
      clearInterval(t);
      clearTimeout(t);
    });
    rhythmTimers = [];
  }

  function startVelvetSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // D-Moll9 -> Bb-Maj7 -> G-Moll7 -> A7-Sus4
    var baseChords = [
      [146.83, 174.61, 220.00, 261.63], // Dm9
      [116.54, 174.61, 233.08, 293.66], // Bb-Maj7
      [98.00, 146.83, 196.00, 246.94],  // Gm7
      [110.00, 164.81, 220.00, 293.66]  // A7sus4
    ];

    var chordIdx = 0;

    function applyChord(chordFreqs) {
      // Wichtig: Nur Oszillatoren stoppen, NICHT die Taktung des Timers!
      stopActiveOscillators();
      var energyBoost = audioState.energyLevel * 0.04;

      chordFreqs.forEach(function(freq, i) {
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();

        osc.type = (i === 0) ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        var individualVol = ((0.28 / chordFreqs.length) + energyBoost) * (i === 0 ? 1.4 : 0.85);
        g.gain.setValueAtTime(individualVol, audioCtx.currentTime);

        osc.connect(g);
        g.connect(masterGain);
        osc.start();

        activeOscillators.push({ osc: osc, gain: g });
      });

      // Zarter Stereo-Chorus über feines Pitch-Wobbeln
      var lfo = audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.18 + (audioState.energyLevel * 0.05), audioCtx.currentTime);
      var lfoGain = audioCtx.createGain();
      lfoGain.gain.setValueAtTime(1.8, audioCtx.currentTime);
      lfo.connect(lfoGain);

      activeOscillators.forEach(function(item) {
        lfoGain.connect(item.osc.detune);
      });
      lfo.start();
      lfoNodes.push(lfo);
    }

    applyChord(baseChords[0]);

    // Akkordwechsel alle 7 bis 12 Sekunden (abhängig von Energie)
    var stepInterval = Math.max(5000, 12000 - (audioState.energyLevel * 1800));
    var timer = setInterval(function() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'velvet') return;
      chordIdx = (chordIdx + 1) % baseChords.length;
      applyChord(baseChords[chordIdx]);
    }, stepInterval);

    rhythmTimers.push(timer);
  }

  function startBowlsSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // 432Hz Basiston und natürliche Obertonreihe
    var bowlFreqs = [108.00, 216.00, 432.00, 864.00];

    bowlFreqs.forEach(function(freq, idx) {
      var osc = audioCtx.createOscillator();
      var g = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      var baseVol = (idx === 0) ? 0.22 : 0.08;
      g.gain.setValueAtTime(baseVol, audioCtx.currentTime);

      osc.connect(g);
      g.connect(masterGain);
      osc.start();

      activeOscillators.push({ osc: osc, gain: g });
    });

    // Periodischer sanfter Gong-Anschlag (alle 6-8 Sekunden)
    function triggerStrike() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'bowls') return;
      var strikeOsc = audioCtx.createOscillator();
      var strikeGain = audioCtx.createGain();

      strikeOsc.type = 'sine';
      strikeOsc.frequency.setValueAtTime(432.00, audioCtx.currentTime);

      var now = audioCtx.currentTime;
      strikeGain.gain.setValueAtTime(0.001, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.35 + (audioState.energyLevel * 0.05), now + 0.06);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 4.8);

      strikeOsc.connect(strikeGain);
      strikeGain.connect(masterGain);

      strikeOsc.start(now);
      strikeOsc.stop(now + 5.0);
    }

    triggerStrike();
    var strikeTimer = setInterval(triggerStrike, 6500);
    rhythmTimers.push(strikeTimer);
  }

  function startOceanSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // Rauschgenerator für Meeresbrandung
    var bufferSize = audioCtx.sampleRate * 2;
    var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    var whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Spezieller Brandungsfilter mit dynamischem LFO (Ebbe & Flut)
    var oceanFilter = audioCtx.createBiquadFilter();
    oceanFilter.type = 'bandpass';
    oceanFilter.Q.setValueAtTime(1.2, audioCtx.currentTime);

    var oceanGain = audioCtx.createGain();
    oceanGain.gain.setValueAtTime(0.40, audioCtx.currentTime);

    // LFO für Wellenbewegung: ca. 12 Sekunden pro Welle
    var waveLfo = audioCtx.createOscillator();
    waveLfo.type = 'sine';
    var waveSpeed = 0.06 + (audioState.energyLevel * 0.02);
    waveLfo.frequency.setValueAtTime(waveSpeed, audioCtx.currentTime);

    var waveLfoGain = audioCtx.createGain();
    var waveDepth = 250 + (audioState.energyLevel * 120);
    waveLfoGain.gain.setValueAtTime(waveDepth, audioCtx.currentTime);

    waveLfo.connect(waveLfoGain);
    waveLfoGain.connect(oceanFilter.frequency);
    oceanFilter.frequency.setValueAtTime(400, audioCtx.currentTime);

    whiteNoise.connect(oceanFilter);
    oceanFilter.connect(oceanGain);
    oceanGain.connect(masterGain);

    whiteNoise.start();
    waveLfo.start();

    activeOscillators.push({ osc: whiteNoise, gain: oceanGain });
    lfoNodes.push(waveLfo);
  }

  function startBeatsSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // Tiefer Sub-Bass Drone (55Hz / A1)
    var subOsc = audioCtx.createOscillator();
    var subGain = audioCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55.00, audioCtx.currentTime);
    subGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    activeOscillators.push({ osc: subOsc, gain: subGain });

    // 808-Kick-Puls im Erotik-Slow-Tempo (60 bis 75 BPM)
    var bpm = 58 + (audioState.energyLevel * 5);
    var beatInterval = (60 / bpm) * 1000;

    function trigger808Kick() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'beats') return;
      var kick = audioCtx.createOscillator();
      var kGain = audioCtx.createGain();
      var now = audioCtx.currentTime;

      kick.frequency.setValueAtTime(110, now);
      kick.frequency.exponentialRampToValueAtTime(42, now + 0.28);

      kGain.gain.setValueAtTime(0.45 + (audioState.energyLevel * 0.05), now);
      kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      kick.connect(kGain);
      kGain.connect(masterGain);

      kick.start(now);
      kick.stop(now + 0.38);
    }

    trigger808Kick();
    var beatTimer = setInterval(trigger808Kick, beatInterval);
    rhythmTimers.push(beatTimer);
  }

  function applySoundscapeEnergyModulation() {
    if (!audioCtx || !filterNode || !masterGain) return;
    var now = audioCtx.currentTime;

    var targetCutoff = 280 + (audioState.energyLevel * 320);
    var targetVolume = 0.22 + (audioState.energyLevel * 0.07);

    filterNode.frequency.setTargetAtTime(targetCutoff, now, 0.6);
    masterGain.gain.setTargetAtTime(targetVolume, now, 0.4);

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
        if (s === style) btn.className = "p-2 rounded-xl border bg-brand-950 border-brand-500 text-brand-100 font-bold text-left touch-btn";
        else btn.className = "p-2 rounded-xl border theme-panel text-slate-300 font-bold text-left touch-btn";
      }
    });

    var sel = document.getElementById('select-cockpit-soundscape');
    if (sel) sel.value = style;

    var styleNames = {
      velvet: "Cinematic Velvet",
      bowls: "Klangtempel 432Hz",
      ocean: "Ozean-Symphonie",
      beats: "Dark Downtempo"
    };

    var nameEl = document.getElementById('cockpit-ambient-style-name');
    if (nameEl) nameEl.innerText = "Soundscape: " + (styleNames[style] || style);

    if (audioState.isPlaying && audioState.activeSource === 'synth') {
      startCurrentSoundscapeEngine();
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
      if (audioState.activeSource === 'synth') {
        startCurrentSoundscapeEngine();
      } else {
        if (typeof window.showToast === 'function') {
          window.showToast("Eigene Playlist aktiv (Audio-Ducking bereit)");
        }
      }
    } else {
      stopAllGenerators();
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
    adjustEnergy: adjustAmbientEnergy,
    selectSource: selectMusicSource,
    applyDucking: applyAudioDucking,
    stopAll: stopAllGenerators,
    ensureGraph: ensureAudioGraph
  };

  window.toggleAmbientMusic = toggleAmbientMusic;
  window.setSoundscapeStyle = setSoundscapeStyle;
  window.adjustAmbientEnergy = adjustAmbientEnergy;
  window.selectMusicSource = selectMusicSource;
  window.applyAudioDucking = applyAudioDucking;
  window.stopAllSoundscapeNodes = stopAllGenerators;

})(window);
