/**
 * js/session_voice.js
 * Modul für die Regiestimme in der Schlafzimmer-Regie und im Edging-Cockpit.
 * 
 * Qualitäts- & Sicherheitsstandards:
 * - Kein Hardcoded API-Key: Liest dynamisch den Key aus den Einstellungen der Partner aus
 * - Strikte Verbannung der Roboterstimme: WebSpeech komplett deaktiviert
 * - Eindeutige Toast-Meldungen bei fehlendem Key oder Quota-Überschreitung
 * - 0-ms Audio-Blob-Caching für wiederholte Befehle und Countdowns
 * - Exakte Audio-Events ('playing', 'ended') zur Synchronisation mit dem visuellen Ticker
 */

(function(window) {
  'use strict';

  var ttsAudioCache = {};
  var previewTimeout = null;
  var isVoiceCurrentlyPlaying = false;
  var voiceAudioCtx = null;
  var unlockedAudioElement = null;

  function getGeminiApiKey() {
    // 1. Live-Eingabefelder in Regie oder Account
    var liveInput = document.getElementById('session-gemini-key-input') || 
                    document.getElementById('account-gemini-key');
    if (liveInput && liveInput.value && liveInput.value.trim().length > 10) {
      var liveVal = liveInput.value.trim();
      try { localStorage.setItem('kompass_gemini_api_key', liveVal); } catch (e) {}
      return liveVal;
    }

    // 2. Globaler Key im LocalStorage
    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) {
        return stored.trim();
      }
    } catch (e) {}

    // 3. Partner-spezifische Keys (Partner A oder Partner B)
    try {
      var keyA = localStorage.getItem('kompass_gemini_api_key_A');
      if (keyA && keyA.trim().length > 10) return keyA.trim();

      var keyB = localStorage.getItem('kompass_gemini_api_key_B');
      if (keyB && keyB.trim().length > 10) return keyB.trim();
    } catch (e) {}

    // 4. Synchronisierte Einstellungen prüfen
    try {
      var rawAnswers = localStorage.getItem('kompass_answers');
      if (rawAnswers) {
        var parsed = JSON.parse(rawAnswers);
        if (parsed && parsed.settings && parsed.settings.geminiApiKey) {
          return parsed.settings.geminiApiKey.trim();
        }
      }
    } catch (e) {}

    return null;
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
    }, 4000);
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
    try {
      if (!voiceAudioCtx) {
        var AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) voiceAudioCtx = new AudioContextClass();
      }
      if (voiceAudioCtx && voiceAudioCtx.state === 'suspended') {
        voiceAudioCtx.resume().catch(function() {});
      }

      if (!unlockedAudioElement) {
        unlockedAudioElement = document.getElementById('master-voice-audio');
        if (!unlockedAudioElement) {
          unlockedAudioElement = document.createElement('audio');
          unlockedAudioElement.id = 'master-voice-audio';
          unlockedAudioElement.className = 'hidden';
          unlockedAudioElement.setAttribute('playsinline', '');
          unlockedAudioElement.setAttribute('webkit-playsinline', '');
          document.body.appendChild(unlockedAudioElement);
        }
      }

      if (unlockedAudioElement && (!unlockedAudioElement.src || unlockedAudioElement.src.startsWith('data:'))) {
        unlockedAudioElement.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        var playPromise = unlockedAudioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(function() {});
        }
      }
    } catch (e) {
      console.warn("Audio unlock notice:", e);
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

    // Falls WebSpeech jemals aktiv war, sofort abbrechen und stummschalten
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }

    if (unlockedAudioElement) {
      try {
        unlockedAudioElement.pause();
        unlockedAudioElement.currentTime = 0;
      } catch (e) {}
    }

    updatePreviewButtons('idle');
    if (typeof window.applyAudioDucking === 'function') {
      window.applyAudioDucking(false);
    }
  }

  function playAudioUrlDirectly(url, isPreview) {
    return new Promise(function(resolve, reject) {
      stopActiveVoicePlayback();
      unlockAudioPlaybackEngine();

      isVoiceCurrentlyPlaying = true;
      if (isPreview) updatePreviewButtons('playing');

      if (!unlockedAudioElement) {
        unlockedAudioElement = document.getElementById('master-voice-audio');
      }

      unlockedAudioElement.src = url;
      unlockedAudioElement.currentTime = 0;

      var finished = false;
      function cleanup() {
        if (finished) return;
        finished = true;
        isVoiceCurrentlyPlaying = false;
        if (previewTimeout) {
          clearTimeout(previewTimeout);
          previewTimeout = null;
        }
        unlockedAudioElement.onended = null;
        unlockedAudioElement.onerror = null;
        if (typeof window.applyAudioDucking === 'function') {
          window.applyAudioDucking(false);
        }
        updatePreviewButtons('idle');
        resolve();
      }

      unlockedAudioElement.onended = cleanup;
      unlockedAudioElement.onerror = function(err) {
        console.warn("Audio Element Playback Error:", err);
        cleanup();
      };

      if (typeof window.applyAudioDucking === 'function') {
        window.applyAudioDucking(true);
      }

      var p = unlockedAudioElement.play();
      if (p !== undefined) {
        p.then(function() {
          if (isPreview) {
            previewTimeout = setTimeout(function() {
              stopActiveVoicePlayback();
              cleanup();
            }, 5000);
          }
        }).catch(function(err) {
          console.warn("Audio play() blocked:", err);
          cleanup();
        });
      }
    });
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

    // Sofortiger 0-ms Cache Treffer
    if (ttsAudioCache[cacheKey]) {
      return playAudioUrlDirectly(ttsAudioCache[cacheKey], isPreview);
    }

    var apiKey = getGeminiApiKey();

    if (!apiKey) {
      updatePreviewButtons('idle');
      showToast("⚠️ Kein Gemini API-Key hinterlegt. Bitte trage deinen Key in den Einstellungen ein.");
      return;
    }

    // Aktive Gemini-TTS-Modell-Kaskade
    var candidateModels = [
      "gemini-2.5-flash-preview-tts",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite-preview-tts",
      "gemini-2.5-pro-preview-tts"
    ];

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

    var lastErrorMessage = "";

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
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

            return playAudioUrlDirectly(blobUrl, isPreview);
          }
        } else {
          var errData = await resp.json().catch(function() { return {}; });
          var msg = errData?.error?.message || ("HTTP " + resp.status);
          lastErrorMessage = msg;
          console.warn("Gemini TTS Failover: " + model + " (" + resp.status + "): " + msg);
        }
      } catch (e) {
        lastErrorMessage = e.message || "Netzwerkfehler";
        console.warn("Gemini TTS Network Retry for " + model, e);
      }
    }

    // NIEMALS auf WebSpeech-Roboterstimme zurückfallen! Stattdessen saubere Toast-Meldung
    updatePreviewButtons('idle');
    var isQuotaError = lastErrorMessage.indexOf('quota') !== -1 || lastErrorMessage.indexOf('429') !== -1 || lastErrorMessage.indexOf('RESOURCE_EXHAUSTED') !== -1;
    if (isQuotaError) {
      showToast("⚠️ Gemini Sprach-Kontingent erreicht. Bitte kurz warten oder Key prüfen.");
    } else {
      showToast("⚠️ Gemini Sprach-API aktuell nicht erreichbar. Keine Audio-Ausgabe.");
    }
  }

  window.SessionVoice = {
    play: playSensualGeminiVoice,
    stop: stopActiveVoicePlayback,
    unlock: unlockAudioPlaybackEngine,
    isPlaying: function() { return isVoiceCurrentlyPlaying; },
    getApiKey: getGeminiApiKey
  };

  window.playSensualGeminiVoice = playSensualGeminiVoice;
  window.stopActiveVoicePlayback = stopActiveVoicePlayback;
  window.unlockAudioEngineOnUserGesture = unlockAudioPlaybackEngine;

  document.addEventListener('touchstart', unlockAudioPlaybackEngine, { once: true, passive: true });
  document.addEventListener('click', unlockAudioPlaybackEngine, { once: true, passive: true });

})(window);
