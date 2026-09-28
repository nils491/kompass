/**
 * js/session_audio.js
 * Modul für generative Soundscapes, Ambient-Musik und Audio-Ducking in der Schlafzimmer-Regie.
 * 
 * Features & Qualitätsstandards:
 * - 100% autarke Web-Audio-Synthese (keine externen MP3-Abhängigkeiten)
 * - 4 kuratierte Klangstile: Velvet Drone, 432 Hz Klangschalen, Nachtbrise, Dark Downtempo
 * - Sanftes Audio-Ducking bei Regiestimme-Ausgabe
 * - Dynamische Energieanpassung (calm vs. energy)
 * - Zeilenlimit: Kompakt und weit unter 450 Zeilen
 */

(function(window) {
  'use strict';

  var audioCtx = null;
  var masterGain = null;
  var duckingGain = null;
  var isPlaying = false;
  var currentStyle = 'velvet';
  var baseVolume = 0.7;

  var activeNodes = [];
  var lfoInterval = null;

  function ensureAudioContext() {
    if (!audioCtx) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        duckingGain = audioCtx.createGain();

        duckingGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
        masterGain.gain.setValueAtTime(baseVolume, audioCtx.currentTime);

        masterGain.connect(duckingGain);
        duckingGain.connect(audioCtx.destination);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function() {});
    }
  }

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

  function stopCurrentGraph() {
    if (lfoInterval) {
      clearInterval(lfoInterval);
      lfoInterval = null;
    }
    activeNodes.forEach(function(node) {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch (e) {}
    });
    activeNodes = [];
  }

  function createNoiseBuffer() {
    var bufferSize = audioCtx.sampleRate * 2;
    var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function startVelvetDrone() {
    var freqs = [65.41, 130.81, 196.00, 261.63]; // C2, C3, G3, C4
    freqs.forEach(function(f, idx) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      var filter = audioCtx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, audioCtx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280 + idx * 40, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.18 / freqs.length, audioCtx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start();
      activeNodes.push(osc, gain, filter);
    });
  }

  function startSingingBowls() {
    var baseFreq = 432;
    var freqs = [baseFreq / 4, baseFreq / 2, baseFreq * 0.75, baseFreq];
    freqs.forEach(function(f, idx) {
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f + (idx * 0.4), audioCtx.currentTime);

      gain.gain.setValueAtTime(0.15 / freqs.length, audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();
      activeNodes.push(osc, gain);
    });
  }

  function startOceanBreeze() {
    var noise = audioCtx.createBufferSource();
    noise.buffer = createNoiseBuffer();
    noise.loop = true;

    var filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.8, audioCtx.currentTime);

    var gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start();
    activeNodes.push(noise, filter, gain);

    var lfoPhase = 0;
    lfoInterval = setInterval(function() {
      if (!audioCtx) return;
      lfoPhase += 0.08;
      var targetFreq = 250 + Math.sin(lfoPhase) * 180;
      filter.frequency.setTargetAtTime(targetFreq, audioCtx.currentTime, 0.4);
    }, 200);
  }

  function startDarkDowntempo() {
    var rootFreq = 55; // A1
    var osc1 = audioCtx.createOscillator();
    var osc2 = audioCtx.createOscillator();
    var filter = audioCtx.createBiquadFilter();
    var gain = audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(rootFreq, audioCtx.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(rootFreq * 2 + 0.5, audioCtx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.16, audioCtx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc1.start();
    osc2.start();
    activeNodes.push(osc1, osc2, filter, gain);
  }

  function startSoundscape(style) {
    ensureAudioContext();
    stopCurrentGraph();

    currentStyle = style || currentStyle || 'velvet';

    if (currentStyle === 'velvet') startVelvetDrone();
    else if (currentStyle === 'bowls') startSingingBowls();
    else if (currentStyle === 'ocean') startOceanBreeze();
    else if (currentStyle === 'beats') startDarkDowntempo();

    isPlaying = true;
    updateUI();
  }

  function stopSoundscape() {
    stopCurrentGraph();
    isPlaying = false;
    updateUI();
  }

  function toggleSoundscape() {
    if (isPlaying) {
      stopSoundscape();
      showToast("Soundscape pausiert ⏸");
    } else {
      startSoundscape(currentStyle);
      showToast("Soundscape aktiv: " + getStyleLabel(currentStyle) + " 🎵");
    }
  }

  function setSoundStyle(style) {
    currentStyle = style;
    if (isPlaying) {
      startSoundscape(style);
    } else {
      updateUI();
    }
    showToast("Stil gewählt: " + getStyleLabel(style));
  }

  function setMasterVolume(val) {
    baseVolume = Math.max(0, Math.min(1, parseFloat(val) || 0.7));
    if (masterGain && audioCtx) {
      masterGain.gain.setTargetAtTime(baseVolume, audioCtx.currentTime, 0.1);
    }
    var lbl = document.getElementById('ambient-volume-label');
    if (lbl) lbl.innerText = Math.round(baseVolume * 100) + "%";
  }

  function applyDucking(isSpeaking) {
    if (!duckingGain || !audioCtx) return;
    var targetGain = isSpeaking ? 0.18 : 1.0;
    duckingGain.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.3);
  }

  function adjustEnergyLevel(level) {
    if (!activeNodes.length || !audioCtx) return;
    activeNodes.forEach(function(node) {
      if (node instanceof BiquadFilterNode) {
        var currentFreq = node.frequency.value;
        var newFreq = (level === 'energy') ? currentFreq * 1.5 : currentFreq * 0.8;
        node.frequency.setTargetAtTime(Math.min(1800, Math.max(100, newFreq)), audioCtx.currentTime, 0.6);
      }
    });
  }

  function getStyleLabel(style) {
    var map = {
      velvet: 'Cinematic Velvet',
      bowls: 'Klangtempel 432Hz',
      ocean: 'Nachtbrise',
      beats: 'Dark Downtempo'
    };
    return map[style] || 'Ambient';
  }

  function updateUI() {
    var icon = document.getElementById('ambient-status-icon');
    var label = document.getElementById('ambient-status-label');
    var setupBtn = document.getElementById('btn-setup-ambient-toggle');

    if (icon) icon.innerText = isPlaying ? "⏸" : "🎵";
    if (label) label.innerText = isPlaying ? "Läuft..." : "Musik";
    if (setupBtn) setupBtn.innerText = isPlaying ? "⏹ Audio anhalten" : "▶ Audio starten";

    ['velvet', 'bowls', 'ocean', 'beats'].forEach(function(s) {
      var btn = document.getElementById('btn-style-' + s);
      if (btn) {
        if (s === currentStyle) {
          btn.className = "p-2.5 rounded-xl border bg-brand-950 border-brand-500 text-brand-100 font-bold text-left touch-btn shadow-md";
        } else {
          btn.className = "p-2.5 rounded-xl border theme-panel text-slate-300 font-bold text-left touch-btn";
        }
      }
    });
  }

  window.SessionAudio = {
    start: startSoundscape,
    stop: stopSoundscape,
    toggle: toggleSoundscape,
    setStyle: setSoundStyle,
    setVolume: setMasterVolume,
    applyDucking: applyDucking,
    adjustEnergy: adjustEnergyLevel,
    ensureGraph: ensureAudioContext,
    isPlaying: function() { return isPlaying; }
  };

  window.applyAudioDucking = applyDucking;
  window.SessionAudioToggle = toggleSoundscape;

})(window);
