/**
 * js/session_audio.js
 * Fortgeschrittene generative Musik- & Soundscape-Engine für die Schlafzimmer-Regie.
 * 
 * Features:
 * - Echtes 3-Schichten-Musikarrangement:
 *   1. Harmonische Pad- & Rhodes-Flächen (5-stimmige Voicings: Dm9, Bbmaj9, Fmaj9, Gm11)
 *   2. Prozedurale, warme Klavier- & Glockenmelodien mit variabler Rhythmik
 *   3. Sanft gehender, warmer Subbass mit natürlichem Attack & Decay
 * - 4 kuratierte Stilwelten: Cinematic Velvet, Klangtempel 432Hz, Sinnliche Nachtbrise, Dark Downtempo
 * - Weicher Lautstärkeregler (0–100 %) mit linearen Lautstärke-Rampen
 * - Sanftes Audio-Ducking (Absenkung auf 20 %) bei Sprachansagen
 * - 100 % frei von statischem Rauschen oder künstlichen Artefakten
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
  var mainFilterNode = null;
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

      mainFilterNode = audioCtx.createBiquadFilter();
      mainFilterNode.type = 'lowpass';
      mainFilterNode.frequency.setValueAtTime(3600, audioCtx.currentTime);
      mainFilterNode.Q.setValueAtTime(0.7, audioCtx.currentTime);

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

  // 1. CINEMATIC VELVET (Emotionale Neo-Soul Akkorde, Pianolinien & zarter Bass)
  function startVelvetSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // Harmonische Progression mit 6 tiefgreifenden 5-stimmigen Akkorden (Frequenzen in Hz)
    var progression = [
      {
        chord: [146.83, 220.00, 261.63, 329.63, 440.00], // Dm9
        bass: 73.42,                                       // D2
        melodyScale: [293.66, 329.63, 349.23, 440.00, 523.25, 587.33, 659.25]
      },
      {
        chord: [116.54, 174.61, 233.08, 293.66, 349.23], // Bbmaj7
        bass: 58.27,                                       // Bb1
        melodyScale: [233.08, 293.66, 349.23, 440.00, 466.16, 587.33]
      },
      {
        chord: [87.31, 130.81, 174.61, 220.00, 261.63],  // Fmaj9
        bass: 43.65,                                       // F1
        melodyScale: [261.63, 329.63, 349.23, 392.00, 440.00, 523.25]
      },
      {
        chord: [98.00, 146.83, 196.00, 246.94, 329.63],  // Gm9
        bass: 49.00,                                       // G1
        melodyScale: [293.66, 349.23, 392.00, 440.00, 523.25, 587.33]
      },
      {
        chord: [110.00, 164.81, 220.00, 261.63, 329.63], // Am9
        bass: 55.00,                                       // A1
        melodyScale: [261.63, 329.63, 392.00, 440.00, 523.25, 659.25]
      },
      {
        chord: [130.81, 164.81, 196.00, 246.94, 293.66], // C add 9
        bass: 65.41,                                       // C2
        melodyScale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]
      }
    ];

    var currentStep = 0;
    var padOscillators = [];
    var padGains = [];

    // Erzeuge 5 Pad-Oszillatoren für den harmonischen Teppich
    for (var i = 0; i < 5; i++) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = (i % 2 === 0) ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(progression[0].chord[i], audioCtx.currentTime);

      // Leichte Schwebung für seidige Stereobreite
      var detuneVal = (i - 2) * 4.5 + (Math.random() - 0.5) * 2;
      osc.detune.setValueAtTime(detuneVal, audioCtx.currentTime);

      var baseVol = (i === 0) ? 0.18 : 0.12;
      gain.gain.setValueAtTime(baseVol, audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();

      padOscillators.push(osc);
      padGains.push(gain);
      activeNodes.push(osc, gain);
    }

    // Sanfter, gezupfter Bass-Synthesizer
    function playBassNote(freq) {
      if (!audioState.isPlaying || audioState.currentStyle !== 'velvet') return;
      var now = audioCtx.currentTime;

      var bOsc = audioCtx.createOscillator();
      var bGain = audioCtx.createGain();
      var bFilter = audioCtx.createBiquadFilter();

      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(freq, now);

      bFilter.type = 'lowpass';
      bFilter.frequency.setValueAtTime(220, now);
      bFilter.frequency.exponentialRampToValueAtTime(110, now + 1.8);

      bGain.gain.setValueAtTime(0.001, now);
      bGain.gain.linearRampToValueAtTime(0.28, now + 0.15);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 5.5);

      bOsc.connect(bFilter);
      bFilter.connect(bGain);
      bGain.connect(masterGain);

      bOsc.start(now);
      bOsc.stop(now + 6.0);
    }

    // Melodische Pianoglocken (zufallsgesteuerte, harmonisch passende Töne)
    function playMelodicPhrase() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'velvet') return;
      var scale = progression[currentStep].melodyScale;
      var numNotes = 2 + Math.floor(Math.random() * 3);

      for (var n = 0; n < numNotes; n++) {
        (function(noteIndex) {
          var delay = noteIndex * (350 + Math.random() * 250);
          var timer = setTimeout(function() {
            if (!audioState.isPlaying || audioState.currentStyle !== 'velvet') return;
            var now = audioCtx.currentTime;
            var noteFreq = scale[Math.floor(Math.random() * scale.length)];

            var pOsc = audioCtx.createOscillator();
            var pGain = audioCtx.createGain();

            pOsc.type = 'sine';
            pOsc.frequency.setValueAtTime(noteFreq, now);

            var peakVol = 0.14 + (audioState.energyLevel * 0.03);
            pGain.gain.setValueAtTime(0.0001, now);
            pGain.gain.exponentialRampToValueAtTime(peakVol, now + 0.04);
            pGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.4);

            pOsc.connect(pGain);
            pGain.connect(masterGain);

            pOsc.start(now);
            pOsc.stop(now + 3.8);
          }, delay);
          generativeIntervals.push(timer);
        })(n);
      }

      var nextPhraseDelay = 4000 + Math.random() * 4500;
      var phraseTimer = setTimeout(playMelodicPhrase, nextPhraseDelay);
      generativeIntervals.push(phraseTimer);
    }

    // Harmoniewechsel alle 7 Sekunden mit Bass-Impuls
    function advanceProgression() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'velvet') return;
      currentStep = (currentStep + 1) % progression.length;
      var nextHarmonies = progression[currentStep];
      var now = audioCtx.currentTime;

      padOscillators.forEach(function(osc, idx) {
        osc.frequency.setTargetAtTime(nextHarmonies.chord[idx], now, 3.2);
      });

      playBassNote(nextHarmonies.bass);
    }

    playBassNote(progression[0].bass);
    var chordLoop = setInterval(advanceProgression, 7000);
    generativeIntervals.push(chordLoop);

    var startMelodyTimer = setTimeout(playMelodicPhrase, 2000);
    generativeIntervals.push(startMelodyTimer);
  }

  // 2. KLANGTEMPEL 432Hz (Tibetische Schalen, Obertöne & meditativer 432Hz-Resonanzdrone)
  function startBowlsSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    var dronePitches = [54.00, 108.00, 216.00, 432.00];

    dronePitches.forEach(function(freq, idx) {
      var osc = audioCtx.createOscillator();
      var g = audioCtx.createGain();

      osc.type = (idx === 0) ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.detune.setValueAtTime((idx - 1.5) * 2.4, audioCtx.currentTime);

      var vol = (idx === 0) ? 0.24 : (0.12 / idx);
      g.gain.setValueAtTime(vol, audioCtx.currentTime);

      osc.connect(g);
      g.connect(masterGain);
      osc.start();

      activeNodes.push(osc, g);
    });

    function strikeBowl() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'bowls') return;
      var now = audioCtx.currentTime;
      var harmonics = [432.00, 432 * 2.76, 432 * 5.40, 432 * 8.12];

      harmonics.forEach(function(f, pIdx) {
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        var peak = (0.22 / (pIdx + 1)) * (0.8 + audioState.energyLevel * 0.15);
        var decay = 6.5 - (pIdx * 1.1);

        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(peak, now + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(g);
        g.connect(masterGain);

        osc.start(now);
        osc.stop(now + decay + 0.2);
      });

      var nextStrike = 5500 + Math.random() * 4000;
      var timer = setTimeout(strikeBowl, nextStrike);
      generativeIntervals.push(timer);
    }

    strikeBowl();
  }

  // 3. SINNLICHE NACHTBEREISE (Atmende warme Harmoniewellen)
  function startOceanSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    var oceanChords = [
      [65.41, 98.00, 130.81, 164.81, 196.00], // Cmaj9
      [73.42, 110.00, 146.83, 174.61, 220.00], // Dm9
      [82.41, 123.47, 164.81, 196.00, 246.94]  // Em7
    ];
    var cIdx = 0;
    var swellOscs = [];
    var swellGain = audioCtx.createGain();

    swellGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    swellGain.connect(masterGain);
    activeNodes.push(swellGain);

    oceanChords[0].forEach(function(freq, i) {
      var osc = audioCtx.createOscillator();
      osc.type = (i === 0) ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.detune.setValueAtTime((i - 2) * 3, audioCtx.currentTime);
      osc.connect(swellGain);
      osc.start();
      swellOscs.push(osc);
      activeNodes.push(osc);
    });

    function triggerOceanSwell() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'ocean') return;
      var now = audioCtx.currentTime;
      var duration = 9.0 + (Math.random() * 3.5);
      var peakTime = now + (duration * 0.45);

      cIdx = (cIdx + 1) % oceanChords.length;
      swellOscs.forEach(function(osc, idx) {
        osc.frequency.setTargetAtTime(oceanChords[cIdx][idx], now, 3.5);
      });

      swellGain.gain.cancelScheduledValues(now);
      swellGain.gain.setValueAtTime(0.14, now);
      swellGain.gain.linearRampToValueAtTime(0.36 + (audioState.energyLevel * 0.08), peakTime);
      swellGain.gain.linearRampToValueAtTime(0.14, now + duration);

      var nextTimer = setTimeout(triggerOceanSwell, (duration - 0.4) * 1000);
      generativeIntervals.push(nextTimer);
    }

    triggerOceanSwell();
  }

  // 4. DARK DOWNTEMPO (Sinnlicher Slow-Beat & Rhodes-Akkorde bei 56 BPM)
  function startBeatsSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // Tiefer 55Hz Subbass-Grundton
    var subOsc = audioCtx.createOscillator();
    var subGain = audioCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55.00, audioCtx.currentTime);
    subGain.gain.setValueAtTime(0.24, audioCtx.currentTime);

    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    activeNodes.push(subOsc, subGain);

    // Warme Rhodes-Akkorde (Am7 / Fmaj7)
    var rhodesPitches = [110.00, 164.81, 220.00, 261.63];
    rhodesPitches.forEach(function(freq) {
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

    // 56 BPM Herzschlag-Puls (1.071 Sekunden)
    var beatDurationMs = (60 / 56) * 1000;

    function playPulseBeat() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'beats') return;
      var now = audioCtx.currentTime;

      var pulseOsc = audioCtx.createOscillator();
      var pulseGain = audioCtx.createGain();

      pulseOsc.frequency.setValueAtTime(85, now);
      pulseOsc.frequency.exponentialRampToValueAtTime(40, now + 0.26);

      pulseGain.gain.setValueAtTime(0.30 + (audioState.energyLevel * 0.05), now);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);

      pulseOsc.connect(pulseGain);
      pulseGain.connect(masterGain);

      pulseOsc.start(now);
      pulseOsc.stop(now + 0.32);
    }

    playPulseBeat();
    var pulseTimer = setInterval(playPulseBeat, beatDurationMs);
    generativeIntervals.push(pulseTimer);
  }

  function applySoundscapeEnergyModulation() {
    if (!audioCtx || !mainFilterNode) return;
    var now = audioCtx.currentTime;

    var targetCutoff = 2200 + (audioState.energyLevel * 650);
    mainFilterNode.frequency.setTargetAtTime(targetCutoff, now, 0.4);

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
