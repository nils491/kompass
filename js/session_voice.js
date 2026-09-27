/**
 * js/session_voice.js
 * Spezialisiertes Sprach- und Audio-Modul für das Schlafzimmer-Cockpit.
 * 
 * Features:
 * - 100% reine Gemini-TTS-Sprachausgabe (Despina, Aoede, Enceladus, Fenrir)
 * - Aktuelle Modellkaskade (gemini-3.8-flash-tts, gemini-3.8-flash-lite-tts, gemini-2.5-flash-preview-tts)
 * - Keine aggressive Vorab-Erschöpfung des 15-RPM-Free-Tier-Kontingents
 * - Echtzeit-Erkennung neu eingegebener Keys direkt aus dem DOM & Speicher
 * - Strikte Trennung von HTTP 402 (Billing) und HTTP 429 (Rate-Limit)
 * - 0-ms-Audio-Cache für bereits generierte Ansagen
 * - Sanftes Audio-Ducking während Sprachausgaben
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var ttsAudioCache = {};
  var previewTimeout = null;
  var isVoiceCurrentlyPlaying = false;
  var activeDiscoveredTtsModel = "gemini-3.8-flash-tts";
  var voiceContext = null;

  function getGeminiApiKey() {
    var liveInput = document.getElementById('session-gemini-key-input') || document.getElementById('account-gemini-key');
    if (liveInput && liveInput.value && liveInput.value.trim().length > 10) {
      var liveVal = liveInput.value.trim();
      if (liveVal !== DEFAULT_PRESET_GEMINI_KEY) {
        try { localStorage.setItem('kompass_gemini_api_key', liveVal); } catch (e) {}
        return liveVal;
      }
    }

    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10 && stored.trim() !== DEFAULT_PRESET_GEMINI_KEY) {
        return stored.trim();
      }
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
    }, 4500);
  }

  function updatePreviewButtons(state) {
    var b1 = document.getElementById('btn-acc-voice-preview');
    var b2 = document.getElementById('btn-preview-step2');
    
    if (b1) {
      if (state === 'loading') b1.innerText = "⏳ Lädt Stimme...";
      else if (state === 'playing') b1.innerText = "⏹ Stopp";
      else b1.innerText = "Probe (5s)";
    }
    if (b2) {
      if (state === 'loading') b2.innerText = "⏳ Lädt Stimme...";
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

    if (rawBytes[0] === 0x52 && rawBytes[1] === 0x49 && rawBytes[2] === 0x46 && rawBytes[3] === 0x46) {
      return new Blob([rawBytes], { type: 'audio/wav' });
    }

    if (mimeType.indexOf('mp3') !== -1 || mimeType.indexOf('mpeg') !== -1) {
      return new Blob([rawBytes], { type: 'audio/mp3' });
    }
    if (mimeType.indexOf('ogg') !== -1) {
      return new Blob([rawBytes], { type: 'audio/ogg' });
    }

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
    unlockAudioPlaybackEngine();

    var savedVoice = localStorage.getItem('kompass_session_voice') || 'Despina';
    var voiceToUse = voiceOverride || savedVoice;
    var cleanText = (text || '').trim();
    if (!cleanText) return;

    var cacheKey = voiceToUse + "_" + cleanText;

    if (isPreview) updatePreviewButtons('loading');

    if (ttsAudioCache[cacheKey]) {
      return playAudioUrlDirectly(ttsAudioCache[cacheKey], isPreview);
    }

    var apiKey = getGeminiApiKey();

    if (!apiKey || apiKey.length < 10) {
      updatePreviewButtons('idle');
      showToast("⚠️ Bitte hinterlege deinen kostenlosen Gemini API-Key in Schritt 2 oder Einstellungen (⚙️).");
      return;
    }

    var candidateModels = [
      activeDiscoveredTtsModel,
      "gemini-3.8-flash-tts",
      "gemini-3.8-flash-lite-tts",
      "gemini-3.1-flash-tts-preview",
      "gemini-2.5-flash-preview-tts"
    ];

    var isPrepaymentDepleted = false;
    var isRateLimited = false;
    var lastErrorMessage = "";

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      if (!model) continue;

      var payload = {
        contents: [{ role: "user", parts: [{ text: cleanText }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceToUse }
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
          var part = data?.candidates?.[0]?.content?.parts?.[0];
          var audioBase64 = part?.inlineData?.data;
          var mimeType = part?.inlineData?.mimeType || "audio/pcm;rate=24000";

          if (audioBase64) {
            var wavBlob = decodeAudioPayload(audioBase64, mimeType);
            var blobUrl = URL.createObjectURL(wavBlob);
            ttsAudioCache[cacheKey] = blobUrl;
            activeDiscoveredTtsModel = model;

            return playAudioUrlDirectly(blobUrl, isPreview);
          }
        } else {
          var errData = await resp.json().catch(function() { return {}; });
          var msg = errData.error?.message || ("HTTP " + resp.status);
          lastErrorMessage = msg;

          if (resp.status === 402 || msg.indexOf('prepayment credits are depleted') !== -1) {
            isPrepaymentDepleted = true;
            break;
          }

          if (resp.status === 429) {
            isRateLimited = true;
            continue;
          }
        }
      } catch (e) {
        lastErrorMessage = e.message || "Netzwerkfehler";
      }
    }

    updatePreviewButtons('idle');
    if (typeof window.applyAudioDucking === 'function') {
      window.applyAudioDucking(false);
    }

    if (isPrepaymentDepleted) {
      if (apiKey === DEFAULT_PRESET_GEMINI_KEY) {
        showToast("💡 Bitte trage deinen eigenen kostenlosen Key in Schritt 2 ein (der Demo-Key ist erschöpft).");
      } else {
        showToast("💡 Google meldet: Projekt verlangt Billing. Erstelle auf aistudio.google.com kostenlos einen Key in einem Projekt OHNE Cloud-Billing.");
      }
    } else if (isRateLimited) {
      showToast("⏳ Google Limit erreicht. Bitte 3–4 Sekunden warten...");
    } else {
      showToast("⚠️ Regiestimme (" + voiceToUse + ") nicht erreichbar: " + lastErrorMessage);
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
      }).catch(function() {
        cleanup();
      });
    });
  }

  window.SessionVoice = {
    play: playSensualGeminiVoice,
    stop: stopActiveVoicePlayback,
    unlock: unlockAudioPlaybackEngine,
    isPlaying: function() { return isVoiceCurrentlyPlaying; },
    preloadCore: function() {},
    getApiKey: getGeminiApiKey
  };

  window.playSensualGeminiVoice = playSensualGeminiVoice;
  window.stopActiveVoicePlayback = stopActiveVoicePlayback;
  window.unlockAudioEngineOnUserGesture = unlockAudioPlaybackEngine;

})(window);
