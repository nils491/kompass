/**
 * js/session_voice.js
 * Spezialisiertes Sprach- und Audio-Modul für das Schlafzimmer-Cockpit.
 * 
 * Features:
 * - 0-ms-Pre-Caching für Countdown (1-10) & Sofort-Kommandos im Speicher
 * - Intelligente Payload-Weiche (verhindert HTTP 400 bei TTS-Modellen)
 * - Dynamische Gemini-TTS-Modellkaskade mit automatischer RIFF-WAV-Erkennung
 * - Strenger 5-Sekunden-Autostopp beim Probehören
 * - Fallback-Sicherheit ohne Stummschaltung
 */

(function(window) {
  'use strict';

  // Privater Voice-State
  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var ttsAudioCache = {};
  var isPreloading = false;
  var previewTimeout = null;
  var activeDiscoveredTtsModel = "gemini-3.8-flash-tts";
  var voiceContext = null;

  function getGeminiApiKey() {
    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return DEFAULT_PRESET_GEMINI_KEY;
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
    if (masterAudio && masterAudio.paused && !masterAudio.src) {
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

  function stopActiveVoicePlayback() {
    if (previewTimeout) {
      clearTimeout(previewTimeout);
      previewTimeout = null;
    }
    var audio = document.getElementById('master-voice-audio');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
    }
  }

  /**
   * Spielt einen Text mit der Gemini-Stimme ab.
   * Nutzt intelligente Payload-Erstellung abhängig vom Modell.
   */
  async function playSensualGeminiVoice(text, voiceOverride, isPreview) {
    stopActiveVoicePlayback();

    var savedVoice = localStorage.getItem('kompass_session_voice') || 'Despina';
    var voiceToUse = voiceOverride || savedVoice;
    var cacheKey = voiceToUse + "_" + text.trim();

    // 1. Instant Playback aus dem Memory-Cache (0 ms Latenz)
    if (ttsAudioCache[cacheKey]) {
      return playAudioUrlDirectly(ttsAudioCache[cacheKey], isPreview);
    }

    var apiKey = getGeminiApiKey();
    if (!apiKey || apiKey.length < 10) {
      if (typeof window.showToast === 'function') {
        window.showToast("Kein gültiger Gemini API-Key hinterlegt");
      }
      return Promise.resolve();
    }

    // 2. Kandidaten-Liste aktueller Google-Modelle
    var candidateModels = [
      activeDiscoveredTtsModel,
      "gemini-3.8-flash-tts", 
      "gemini-1.5-flash"
    ];

    var lastErrorMessage = "Unbekannter API-Fehler";

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      if (!model) continue;

      // STRIKTER PAYLOAD-AUFBAU:
      // Dedizierte TTS-Modelle dürfen KEINE systemInstruction erhalten (HTTP 400)
      var payload = {
        contents: [{
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

      if (model.indexOf('-tts') === -1) {
        // Fallback für reine LLM-Modelle (wie gemini-1.5-flash):
        // Hier BRAUCHEN wir die systemInstruction, damit es nicht monologisiert.
        payload.systemInstruction = {
          parts: [{
            text: "Du bist eine reine Text-to-Speech-Stimme für eine private Paar-Session. Deine EINZIGE Aufgabe ist es, den vorgegebenen Text exakt, sinnlich und mit natürlicher Betonung auf Deutsch vorzulesen. Antworte NIEMALS auf den Text, stelle keine Fragen und füge kein Wort hinzu."
          }]
        };
        payload.contents[0].parts[0].text = "Lies exakt diesen Text vor: \"" + text.trim() + "\"";
      }

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
          var mimeType = (part && part.inlineData && part.inlineData.mimeType) || "";

          if (audioBase64) {
            var rawBuffer = base64ToArrayBuffer(audioBase64);
            var rawBytes = new Uint8Array(rawBuffer);
            var wavBlob;

            // Auto-Erkennung: Sendet Gemini bereits RIFF-WAV?
            if (rawBytes[0] === 0x52 && rawBytes[1] === 0x49 && rawBytes[2] === 0x46 && rawBytes[3] === 0x46) {
              wavBlob = new Blob([rawBytes], { type: 'audio/wav' });
            } else {
              var sampleRate = parseInt(mimeType.match(/rate=(\d+)/)?.[1] || "24000", 10);
              var pcm16 = new Int16Array(rawBuffer);
              wavBlob = pcmToWav(pcm16, sampleRate);
            }

            var blobUrl = URL.createObjectURL(wavBlob);
            ttsAudioCache[cacheKey] = blobUrl;
            activeDiscoveredTtsModel = model; // Erfolgreiches Modell merken

            return playAudioUrlDirectly(blobUrl, isPreview);
          }
        } else {
          var errData = await resp.json().catch(function(){ return {}; });
          lastErrorMessage = errData.error?.message || "HTTP " + resp.status;
          console.debug("Voice model (" + model + ") failed:", lastErrorMessage);
        }
      } catch (e) {
        lastErrorMessage = e.message || "Netzwerkfehler";
        console.debug("Network error for voice model:", model, e);
      }
    }

    if (typeof window.showToast === 'function') {
      window.showToast("⚠️ Sprachausgabe Fehler: " + lastErrorMessage);
    }
    
    // Fallback UI-Reset für Probehören
    var btn = document.getElementById('btn-acc-voice-preview');
    if (btn) btn.innerText = "Probe (5s)";
    
    return Promise.resolve();
  }

  function playAudioUrlDirectly(url, isPreview) {
    return new Promise(function(resolve) {
      stopActiveVoicePlayback();

      var audio = document.getElementById('master-voice-audio');
      if (!audio) {
        resolve();
        return;
      }

      audio.src = url;
      audio.currentTime = 0;

      var finished = false;
      function cleanup() {
        if (finished) return;
        finished = true;
        if (previewTimeout) {
          clearTimeout(previewTimeout);
          previewTimeout = null;
        }
        audio.onended = null;
        audio.onerror = null;
        resolve();
      }

      audio.onended = cleanup;
      audio.onerror = cleanup;

      // Audio-Ducking: Wenn externe Musik läuft, dämpfen
      if (typeof window.applyAudioDucking === 'function') {
        window.applyAudioDucking(true);
      }

      audio.play().then(function() {
        // UI Update für Probehören
        var btn = document.getElementById('btn-acc-voice-preview');
        if (btn && isPreview) btn.innerText = "⏹ Stopp";

        // Bei erfolgreichem Start: 5s Hard-Stop für Probehören
        if (isPreview) {
          previewTimeout = setTimeout(function() {
            stopActiveVoicePlayback();
            if (btn) btn.innerText = "Probe (5s)";
            cleanup();
          }, 5000);
        }
      }).catch(function(err) {
        console.debug("Audio play blocked by browser:", err);
        if (typeof window.showToast === 'function') window.showToast("Bitte klicke auf die Seite, um Audio freizugeben.");
        cleanup();
      });

      // Nach Ende des Audios Ducking aufheben
      audio.addEventListener('ended', function() {
        if (typeof window.applyAudioDucking === 'function') {
          window.applyAudioDucking(false);
        }
        var btn = document.getElementById('btn-acc-voice-preview');
        if (btn && isPreview) btn.innerText = "Probe (5s)";
      }, { once: true });
    });
  }

  /**
   * Lädt die Zahlen 1 bis 10 und Standard-Kommandos im Hintergrund vor.
   * Dadurch gibt es beim Edging-Countdown und Kanten-Befehlen 0 ms Verzögerung.
   */
  async function preloadCountdownSnippets(voiceName) {
    if (isPreloading) return;

    var apiKey = getGeminiApiKey();
    if (!apiKey || apiKey.length < 20 || apiKey.startsWith('AQ.')) {
      return;
    }

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
          var success = await generateAndCacheSnippet(phrase, activeVoice);
          if (!success) {
            break;
          }
          await new Promise(function(r) { setTimeout(r, 300); });
        } catch (e) {
          break;
        }
      }
    }

    isPreloading = false;
  }

  async function generateAndCacheSnippet(text, voiceToUse) {
    var apiKey = getGeminiApiKey();
    if (!apiKey || apiKey.length < 20 || apiKey.startsWith('AQ.')) return false;

    var candidateModels = [
      activeDiscoveredTtsModel,
      "gemini-3.8-flash-tts",
      "gemini-1.5-flash"
    ];

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      if (!model) continue;

      var payload = {
        contents: [{
          parts: [{ text: text.trim() }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceToUse } }
          }
        }
      };

      if (model.indexOf('-tts') === -1) {
        payload.systemInstruction = {
          parts: [{ text: "Du bist eine reine Text-to-Speech-Stimme. Deine EINZIGE Aufgabe ist es, das vorgegebene Wort kurz, trocken und präzise auf Deutsch vorzulesen." }]
        };
      }

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
          var mimeType = (part && part.inlineData && part.inlineData.mimeType) || "";

          if (audioBase64) {
            var rawBuffer = base64ToArrayBuffer(audioBase64);
            var rawBytes = new Uint8Array(rawBuffer);
            var wavBlob;

            if (rawBytes[0] === 0x52 && rawBytes[1] === 0x49 && rawBytes[2] === 0x46 && rawBytes[3] === 0x46) {
              wavBlob = new Blob([rawBytes], { type: 'audio/wav' });
            } else {
              var sampleRate = parseInt(mimeType.match(/rate=(\d+)/)?.[1] || "24000", 10);
              var pcm16 = new Int16Array(rawBuffer);
              wavBlob = pcmToWav(pcm16, sampleRate);
            }

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
    preloadCore: preloadCountdownSnippets,
    getApiKey: getGeminiApiKey
  };

  // Kompatibilitäts-Aliase für bestehenden Code
  window.playSensualGeminiVoice = playSensualGeminiVoice;
  window.stopActiveVoicePlayback = stopActiveVoicePlayback;
  window.unlockAudioEngineOnUserGesture = unlockAudioPlaybackEngine;

})(window);
