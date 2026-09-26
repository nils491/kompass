/**
 * js/session_audio.js
 * Spezialisiertes Ambient- und Klangsynthese-Modul für das Schlafzimmer-Cockpit & die Regie.
 * 
 * Features:
 * - Organische, nicht-repetitive Klangwelten:
 *   1. Cinematic Velvet: Mehrschichtiges Analog-Pad, sanfte Bandpass-Wärme, zufällige Pianoglocken
 *   2. Klangtempel 432Hz: Mehrstimmige tibetische Klangschalen mit Naturtonreihe und Om-Drone
 *   3. Ozean-Symphonie: Asymmetrische Brandungswellen mit dynamischem Schaumrauschen
 *   4. Dark Downtempo: Warmer 808-Subbass mit sanfter Sättigung und Rhodes-Tremolo
 * - Situative Modulation des aktuellen Klangs (Stufen 1–4)
 * - Sanftes Audio-Ducking (Absenkung auf 20 %) bei Gemini-Sprachausgabe
 * - Unterstützung externer Playlists (Spotify / Apple Music)
 * - Anti-Klick-Rampen für störungsfreies Hören
 */

(function(window) {
  'use strict';

  var audioState = {
    activeSource: 'synth',
    currentStyle: 'velvet',
    energyLevel: 2,
    isPlaying: false,
    duckingActive: false
  };

  var audioCtx = null;
  var masterGain = null;
  var filterNode = null;
  var duckingGainNode = null;
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
      masterGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

      duckingGainNode = audioCtx.createGain();
      duckingGainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);

      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(650, audioCtx.currentTime);

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
      duckingGainNode.gain.cancelScheduledValues(now);
      duckingGainNode.gain.setTargetAtTime(0.20, now, 0.15);
    } else {
      duckingGainNode.gain.cancelScheduledValues(now);
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

  // Erzeugt weiches Pink-Noise für analoges Rauschen / Brandung
  function createPinkNoiseBuffer(ctx, seconds) {
    var bufferSize = ctx.sampleRate * seconds;
    var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // 1. CINEMATIC VELVET (Warme, atmende Akkorde & delikate Pianoglocken)
  function startVelvetSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // 8 weit gefasste, tief emotionale Akkord-Voicings (Frequenzen in Hz)
    var chordPool = [
      [110.00, 164.81, 220.00, 261.63, 329.63], // Am9
      [116.54, 174.61, 233.08, 293.66, 349.23], // Bbmaj9
      [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9
      [98.00, 146.83, 196.00, 246.94, 293.66],  // Gm9
      [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
      [87.31, 130.81, 174.61, 220.00, 261.63],  // Fmaj7#11
      [123.47, 164.81, 185.00, 246.94, 293.66], // Em11
      [110.00, 146.83, 220.00, 293.66, 329.63]  // Asus4/9
    ];

    var currentChordIdx = 0;
    var padGains = [];
    var padOscs = [];

    // Erzeuge 5 Pad-Oszillatoren
    for (var i = 0; i < 5; i++) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = (i === 0) ? 'sine' : (i % 2 === 0 ? 'triangle' : 'sawtooth');
      osc.frequency.setValueAtTime(chordPool[0][i], audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);

      // Sanfte Detuning-Schwebung
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();

      padOscs.push(osc);
      padGains.push(gain);
      activeNodes.push(osc, gain);
    }

    // Warmer Rausch-Teppich (subtiles Tape-Gefühl)
    var noiseBuf = createPinkNoiseBuffer(audioCtx, 4);
    var noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    noiseSrc.loop = true;

    var noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(220, audioCtx.currentTime);
    noiseFilter.Q.setValueAtTime(1.5, audioCtx.currentTime);

    var noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.025, audioCtx.currentTime);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSrc.start();
    activeNodes.push(noiseSrc, noiseFilter, noiseGain);

    // Sanftes harmonisches Weiterschreiten
    function advanceChord() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'velvet') return;
      currentChordIdx = (currentChordIdx + 1) % chordPool.length;
      var newChord = chordPool[currentChordIdx];
      var now = audioCtx.currentTime;

      padOscs.forEach(function(osc, idx) {
        osc.frequency.setTargetAtTime(newChord[idx], now, 3.2);
      });
    }

    var chordTimer = setInterval(advanceChord, 9500);
    generativeIntervals.push(chordTimer);

    // Ethereale Pianoglocken (zufällige beruhigende Tupfer)
    function triggerRandomChime() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'velvet') return;

      var currentChord = chordPool[currentChordIdx];
      var baseFreq = currentChord[Math.floor(Math.random() * currentChord.length)] * 2;
      var now = audioCtx.currentTime;

      var chimeOsc = audioCtx.createOscillator();
      var chimeGain = audioCtx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(baseFreq, now);

      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.08 + (audioState.energyLevel * 0.02), now + 0.05);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(masterGain);

      chimeOsc.start(now);
      chimeOsc.stop(now + 4.0);

      // Nächste Glocke in unregelmäßigem Abstand (4 bis 9 Sekunden)
      var nextDelay = 4000 + Math.random() * 5000;
      var nextTimer = setTimeout(triggerRandomChime, nextDelay);
      generativeIntervals.push(nextTimer);
    }

    var initialChimeTimer = setTimeout(triggerRandomChime, 3000);
    generativeIntervals.push(initialChimeTimer);
  }

  // 2. KLANGTEMPEL 432Hz (Tibetische Klangschalen mit Naturton-Harmonien)
  function startBowlsSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // Tiefer Om-Sub-Drone (54Hz, 108Hz, 216Hz, 432Hz)
    var droneFreqs = [54.00, 108.00, 216.00, 432.00];

    droneFreqs.forEach(function(freq, idx) {
      var osc = audioCtx.createOscillator();
      var g = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Sanfter Schwebungs-Detune
      osc.detune.setValueAtTime((idx - 1.5) * 1.8, audioCtx.currentTime);

      var baseVol = (idx === 0) ? 0.25 : (0.12 / idx);
      g.gain.setValueAtTime(baseVol, audioCtx.currentTime);

      osc.connect(g);
      g.connect(masterGain);
      osc.start();

      activeNodes.push(osc, g);
    });

    // Anschlag-Schale mit authentischer Obertonreihe (1.0x, 2.76x, 5.4x)
    function strikeSingingBowl() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'bowls') return;
      var now = audioCtx.currentTime;
      var partials = [432.00, 432 * 2.76, 432 * 5.4];

      partials.forEach(function(freq, pIdx) {
        var osc = audioCtx.createOscillator();
        var g = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        var peak = (0.22 / (pIdx + 1)) * (0.8 + audioState.energyLevel * 0.15);
        var decay = 5.5 - (pIdx * 1.1);

        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(peak, now + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(g);
        g.connect(masterGain);

        osc.start(now);
        osc.stop(now + decay + 0.1);
      });

      // Zufälliger nächster Anschlag zwischen 6.5 und 10 Sekunden
      var nextTime = 6500 + Math.random() * 3500;
      var timer = setTimeout(strikeSingingBowl, nextTime);
      generativeIntervals.push(timer);
    }

    strikeSingingBowl();
  }

  // 3. OZEAN-SYMPHONIE (Asymmetrisches Aufbranden & Schaumrauschen)
  function startOceanSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    var noiseBuf = createPinkNoiseBuffer(audioCtx, 6);
    var noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    noiseSrc.loop = true;

    // Resonanter Brandungsfilter
    var oceanFilter = audioCtx.createBiquadFilter();
    oceanFilter.type = 'bandpass';
    oceanFilter.Q.setValueAtTime(2.2, audioCtx.currentTime);
    oceanFilter.frequency.setValueAtTime(250, audioCtx.currentTime);

    var oceanGain = audioCtx.createGain();
    oceanGain.gain.setValueAtTime(0.35, audioCtx.currentTime);

    noiseSrc.connect(oceanFilter);
    oceanFilter.connect(oceanGain);
    oceanGain.connect(masterGain);
    noiseSrc.start();
    activeNodes.push(noiseSrc, oceanFilter, oceanGain);

    // Asymmetrischer Wellenzyklus: Schneller anrollen, langes Abfließen
    function triggerWaveCycle() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'ocean') return;
      var now = audioCtx.currentTime;
      var waveDuration = 9.0 + (Math.random() * 4.0);
      var peakTime = now + (waveDuration * 0.38);

      // Frequenz und Lautstärke schwellen wie echte Brandung an
      var peakFreq = 550 + (audioState.energyLevel * 140) + (Math.random() * 100);
      oceanFilter.frequency.cancelScheduledValues(now);
      oceanFilter.frequency.setValueAtTime(180, now);
      oceanFilter.frequency.exponentialRampToValueAtTime(peakFreq, peakTime);
      oceanFilter.frequency.exponentialRampToValueAtTime(180, now + waveDuration);

      var peakVol = 0.40 + (audioState.energyLevel * 0.08);
      oceanGain.gain.cancelScheduledValues(now);
      oceanGain.gain.setValueAtTime(0.12, now);
      oceanGain.gain.linearRampToValueAtTime(peakVol, peakTime);
      oceanGain.gain.linearRampToValueAtTime(0.12, now + waveDuration);

      var nextWaveTimer = setTimeout(triggerWaveCycle, (waveDuration - 1.0) * 1000);
      generativeIntervals.push(nextWaveTimer);
    }

    triggerWaveCycle();
  }

  // 4. DARK DOWNTEMPO (Warmer 808-Subbass & Rhodes-Tremolo)
  function startBeatsSoundscape() {
    ensureAudioGraph();
    stopAllGenerators();

    // Warmer tiefer Bass Drone (55Hz / A1)
    var subOsc = audioCtx.createOscillator();
    var subGain = audioCtx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(55.00, audioCtx.currentTime);
    subGain.gain.setValueAtTime(0.30, audioCtx.currentTime);

    subOsc.connect(subGain);
    subGain.connect(masterGain);
    subOsc.start();
    activeNodes.push(subOsc, subGain);

    // Erotischer Downbeat (Slow Pulse 56–66 BPM)
    var bpm = 54 + (audioState.energyLevel * 4);
    var beatInterval = (60 / bpm) * 1000;

    function trigger808Pulse() {
      if (!audioState.isPlaying || audioState.currentStyle !== 'beats') return;
      var now = audioCtx.currentTime;

      var kick = audioCtx.createOscillator();
      var kGain = audioCtx.createGain();

      kick.frequency.setValueAtTime(120, now);
      kick.frequency.exponentialRampToValueAtTime(45, now + 0.32);

      kGain.gain.setValueAtTime(0.42 + (audioState.energyLevel * 0.06), now);
      kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.40);

      kick.connect(kGain);
      kGain.connect(masterGain);

      kick.start(now);
      kick.stop(now + 0.42);

      // Subtiler Vintage-HiHat Hauch
      var hat = audioCtx.createOscillator();
      var hGain = audioCtx.createGain();
      hat.type = 'triangle';
      hat.frequency.setValueAtTime(4200, now + (beatInterval / 2000));
      hGain.gain.setValueAtTime(0.0001, now);
      hGain.gain.setValueAtTime(0.03, now + (beatInterval / 2000));
      hGain.gain.exponentialRampToValueAtTime(0.0001, now + (beatInterval / 2000) + 0.08);

      hat.connect(hGain);
      hGain.connect(masterGain);
      hat.start(now + (beatInterval / 2000));
      hat.stop(now + (beatInterval / 2000) + 0.09);
    }

    trigger808Pulse();
    var beatTimer = setInterval(trigger808Pulse, beatInterval);
    generativeIntervals.push(beatTimer);
  }

  function applySoundscapeEnergyModulation() {
    if (!audioCtx || !filterNode || !masterGain) return;
    var now = audioCtx.currentTime;

    var targetCutoff = 380 + (audioState.energyLevel * 320);
    var targetVolume = 0.26 + (audioState.energyLevel * 0.06);

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
      startCurrentSoundscapeEngine();
      if (typeof window.showToast === 'function') {
        var styleName = audioState.currentStyle === 'velvet' ? 'Cinematic Velvet' : audioState.currentStyle;
        window.showToast("Soundscape aktiv: " + styleName + " 🎵");
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
  window.toggleAmbientMusicWrapper = toggleAmbientMusic;
  window.setSoundscapeStyle = setSoundscapeStyle;
  window.setSoundscapeStyleWrapper = setSoundscapeStyle;
  window.adjustAmbientEnergy = adjustAmbientEnergy;
  window.adjustAmbientEnergyWrapper = adjustAmbientEnergy;
  window.selectMusicSource = selectMusicSource;
  window.selectMusicSourceWrapper = selectMusicSource;
  window.applyAudioDucking = applyAudioDucking;
  window.stopAllSoundscapeNodes = stopAllGenerators;

})(window);
