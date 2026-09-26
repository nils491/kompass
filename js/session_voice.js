/**
 * js/session_voice.js
 * Spezialisiertes Sprach- und Audio-Modul für das Schlafzimmer-Cockpit.
 * 
 * Features:
 * - 100% reine Gemini-TTS-Sprachausgabe (Despina, Aoede, Enceladus, Fenrir)
 * - Roboterstimme (Web Speech API) wird standardmäßig unterdrückt
 * - Multi-Format-Audio-Decoder (WAV, MP3, OGG und Raw-PCM)
 * - 0-ms-Pre-Caching für Countdown (1-10) & Sofort-Kommandos im Speicher
 * - Resiliente Gemini-TTS-Kaskade (2.5-flash-preview-tts, 3.8-flash-tts, 3.8-flash-lite-tts)
 * - Sichere Fehleranzeige statt unbemerktem Umschalten auf die Computerstimme
 * - Strenger 5-Sekunden-Autostopp beim Probehören
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var ttsAudioCache = {};
  var isPreloading = false;
  var previewTimeout = null;
  var isVoiceCurrentlyPlaying = false;
  var activeDiscoveredTtsModel = "gemini-2.5-flash-preview-tts";
  var voiceContext = null;

  function getGeminiApiKey() {
    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return DEFAULT_PRESET_GEMINI_KEY;
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
    }, 2800);
  }

  function updatePreviewButtons(state) {
    var b1 = document.getElementById('btn-acc-voice-preview');
    var b2 = document.getElementById('btn-preview-step2');
    
    if (b1) {
      if (state === 'loading') b1.innerText = "⏳ Lädt...";
      else if (state === 'playing') b1.innerText = "⏹ Stopp";
      else b1.innerText = "Probe (5s)";
    }
    if (b2) {
      if (state === 'loading') b2.innerText = "⏳ Lädt...";
      else if (state === 'playing') b2.innerText = "⏹ Stopp (5s)";
      else b2.innerText = "🔊 Probehören (5s)";
    }
  }

  function unlockAudioPlaybackEngine() {
    if (!voiceContext) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) voiceContext = new AudioContextClass();
    }
    if (voiceContext && voiceContext.state === 'suspended') {
      voiceContext.resume().catch(function() {});
    }

    var masterAudio = document.getElementById('master-voice-audio');
    if (!masterAudio) {
      masterAudio = document.createElement('audio');
      masterAudio.id = 'master-voice-audio';
      masterAudio.className = 'hidden';
      document.body.appendChild(masterAudio);
    }

    if (masterAudio && (!masterAudio.src || masterAudio.src.startsWith('data:'))) {
      masterAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      masterAudio.play().catch(function() {});
    }
  }

  function base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function pcmToWav(pcmData, sampleRate) {
    var buffer = new ArrayBuffer(44 + pcmData.length * 2);
    var view = new DataView(buffer);

    function writeString(offset, string) {
      for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcmData.length * 2, true);

    var offset = 44;
    for (var i = 0; i < pcmData.length; i++) {
      view.setInt16(offset, pcmData[i], true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  function decodeAudioPayload(audioBase64, mimeType) {
    var rawBuffer = base64ToArrayBuffer(audioBase64);
    var rawBytes = new Uint8Array(rawBuffer);

    // 1. Bereits fertiger RIFF/WAV-Header
    if (rawBytes[0] === 0x52 && rawBytes[1] === 0x49 && rawBytes[2] === 0x46 && rawBytes[3] === 0x46) {
      return new Blob([rawBytes], { type: 'audio/wav' });
    }

    // 2. MP3 oder OGG Header
    if (mimeType.indexOf('mp3') !== -1 || mimeType.indexOf('mpeg') !== -1) {
      return new Blob([rawBytes], { type: 'audio/mp3' });
    }
    if (mimeType.indexOf('ogg') !== -1) {
      return new Blob([rawBytes], { type: 'audio/ogg' });
    }

    // 3. Raw PCM 16-Bit -> zu WAV verpacken
    var rateMatch = mimeType.match(/rate=(\d+)/);
    var sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
    var pcm16 = new Int16Array(rawBuffer);
    return pcmToWav(pcm16, sampleRate);
  }

  function stopActiveVoicePlayback() {
    isVoiceCurrentlyPlaying = false;
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      previewTimeout = null;
    }
    var audio = document.getElementById('master-voice-audio');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    updatePreviewButtons('idle');
    if (typeof window.applyAudioDucking === 'function') {
      window.applyAudioDucking(false);
    }
  }

  async function playSensualGeminiVoice(text, voiceOverride, isPreview) {
    if (isPreview && isVoiceCurrentlyPlaying) {
      stopActiveVoicePlayback();
      return;
    }

    stopActiveVoicePlayback();

    var savedVoice = localStorage.getItem('kompass_session_voice') || 'Despina';
    var voiceToUse = voiceOverride || savedVoice;
    var cacheKey = voiceToUse + "_" + text.trim();

    if (isPreview) updatePreviewButtons('loading');

    // 1. 0-ms Cache
    if (ttsAudioCache[cacheKey]) {
      return playAudioUrlDirectly(ttsAudioCache[cacheKey], isPreview);
    }

    var apiKey = getGeminiApiKey();
    if (!apiKey || apiKey.length < 10) {
      updatePreviewButtons('idle');
      showToast("⚠️ Kein Gemini API-Key hinterlegt. Bitte in den Einstellungen (⚙️) prüfen.");
      return;
    }

    // 2. Kaskade verlässlicher TTS-Modelle
    var candidateModels = [
      activeDiscoveredTtsModel,
      "gemini-2.5-flash-preview-tts",
      "gemini-3.8-flash-tts",
      "gemini-3.8-flash-lite-tts",
      "gemini-2.5-pro-preview-tts"
    ];

    var success = false;
    var lastError = "Verbindungsfehler";

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      if (!model) continue;

      var payload = {
        contents: [{
          role: "user",
          parts: [{ text: text.trim() }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceToUse
              }
            }
          }
        }
      };

      try {
        var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(apiKey);
        var resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          var data = await resp.json();
          var part = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0];
          var audioBase64 = part && part.inlineData && part.inlineData.data;
          var mimeType = (part && part.inlineData && part.inlineData.mimeType) || "audio/pcm;rate=24000";

          if (audioBase64) {
            var wavBlob = decodeAudioPayload(audioBase64, mimeType);
            var blobUrl = URL.createObjectURL(wavBlob);
            ttsAudioCache[cacheKey] = blobUrl;
            activeDiscoveredTtsModel = model;

            success = true;
            return playAudioUrlDirectly(blobUrl, isPreview);
          }
        } else {
          var errData = await resp.json().catch(function() { return {}; });
          lastError = errData.error?.message || ("HTTP " + resp.status);
          if (resp.status === 429) break;
        }
      } catch (e) {
        lastError = e.message || "Netzwerkfehler";
      }
    }

    updatePreviewButtons('idle');
    if (!success) {
      console.warn("Gemini Voice Fehlgeschlagen:", lastError);
      showToast("⚠️ Gemini Voice: " + lastError);
    }
  }

  function playAudioUrlDirectly(url, isPreview) {
    return new Promise(function(resolve) {
      stopActiveVoicePlayback();

      var audio = document.getElementById('master-voice-audio');
      if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'master-voice-audio';
        audio.className = 'hidden';
        document.body.appendChild(audio);
      }

      isVoiceCurrentlyPlaying = true;
      if (isPreview) updatePreviewButtons('playing');

      audio.src = url;
      audio.currentTime = 0;

      var finished = false;
      function cleanup() {
        if (finished) return;
        finished = true;
        isVoiceCurrentlyPlaying = false;
        if (previewTimeout) {
          clearTimeout(previewTimeout);
          previewTimeout = null;
        }
        audio.onended = null;
        audio.onerror = null;
        if (typeof window.applyAudioDucking === 'function') {
          window.applyAudioDucking(false);
        }
        updatePreviewButtons('idle');
        resolve();
      }

      audio.onended = cleanup;
      audio.onerror = cleanup;

      if (typeof window.applyAudioDucking === 'function') {
        window.applyAudioDucking(true);
      }

      audio.play().then(function() {
        if (isPreview) {
          previewTimeout = setTimeout(function() {
            stopActiveVoicePlayback();
            cleanup();
          }, 5000);
        }
      }).catch(function(err) {
        cleanup();
      });
    });
  }

  async function preloadCountdownSnippets(voiceName) {
    if (isPreloading) return;

    var apiKey = getGeminiApiKey();
    if (!apiKey || apiKey.length < 10 || apiKey.startsWith('AQ.')) return;

    isPreloading = true;
    var activeVoice = voiceName || localStorage.getItem('kompass_session_voice') || 'Despina';
    var numbers = ["10", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
    var commands = ["Kante!", "Stillhalten!", "Jetzt kommen!", "Ruhe!"];

    var queue = numbers.concat(commands);

    for (var i = 0; i < queue.length; i++) {
      var phrase = queue[i];
      var key = activeVoice + "_" + phrase.trim();
      if (!ttsAudioCache[key]) {
        try {
          var success = await generateAndCacheSnippet(phrase, activeVoice, apiKey);
          if (!success) break;
          await new Promise(function(r) { setTimeout(r, 200); });
        } catch (e) { break; }
      }
    }

    isPreloading = false;
  }

  async function generateAndCacheSnippet(text, voiceToUse, apiKey) {
    var candidateModels = [
      activeDiscoveredTtsModel,
      "gemini-2.5-flash-preview-tts",
      "gemini-3.8-flash-tts",
      "gemini-3.8-flash-lite-tts"
    ];

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      if (!model) continue;

      var payload = {
        contents: [{ role: "user", parts: [{ text: text.trim() }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceToUse } } }
        }
      };

      try {
        var url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(apiKey);
        var resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          var data = await resp.json();
          var part = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0];
          var audioBase64 = part && part.inlineData && part.inlineData.data;
          var mimeType = (part && part.inlineData && part.inlineData.mimeType) || "audio/pcm;rate=24000";

          if (audioBase64) {
            var wavBlob = decodeAudioPayload(audioBase64, mimeType);
            var blobUrl = URL.createObjectURL(wavBlob);
            var cacheKey = voiceToUse + "_" + text.trim();
            ttsAudioCache[cacheKey] = blobUrl;
            activeDiscoveredTtsModel = model;
            return true;
          }
        }
      } catch (e) {}
    }
    return false;
  }

  window.SessionVoice = {
    play: playSensualGeminiVoice,
    stop: stopActiveVoicePlayback,
    unlock: unlockAudioPlaybackEngine,
    isPlaying: function() { return isVoiceCurrentlyPlaying; },
    preloadCore: preloadCountdownSnippets,
    preloadSnippet: function(phrase, voiceName) {
      var v = voiceName || localStorage.getItem('kompass_session_voice') || 'Despina';
      return generateAndCacheSnippet(phrase, v, getGeminiApiKey());
    },
    getApiKey: getGeminiApiKey
  };

  window.playSensualGeminiVoice = playSensualGeminiVoice;
  window.stopActiveVoicePlayback = stopActiveVoicePlayback;
  window.unlockAudioEngineOnUserGesture = unlockAudioPlaybackEngine;

})(window);
