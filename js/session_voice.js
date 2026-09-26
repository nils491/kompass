/**
 * js/session_voice.js
 * Spezialisiertes Sprach- und Audio-Modul für das Schlafzimmer-Cockpit.
 * 
 * Features:
 * - 0-ms-Pre-Caching für Countdown (1-10) & Sofort-Kommandos im Speicher
 * - Resiliente Gemini-3.8-TTS-Kaskade mit schnellem Fallback
 * - Zuverlässige native Sprachausgabe (Web Speech API) bei Server-Überlastung oder ungültigem Key
 * - Universelle Button-Synchronisation (Start-Hub & Schlafzimmer-Regie)
 * - Autoplay-Unlocker mit sicherem Puffer für iOS Safari & Chrome
 * - Strenger 5-Sekunden-Autostopp beim Probehören
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var ttsAudioCache = {};
  var isPreloading = false;
  var previewTimeout = null;
  var isVoiceCurrentlyPlaying = false;
  var activeDiscoveredTtsModel = "gemini-3.8-flash-tts";
  var voiceContext = null;

  function getGeminiApiKey() {
    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return DEFAULT_PRESET_GEMINI_KEY;
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

    // 1-Millisekunde unhörbares Audio für die Autoplay-Aktivierung im Browser
    if (masterAudio && (!masterAudio.src || masterAudio.src.startsWith('data:'))) {
      masterAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
      masterAudio.play().catch(function() {});
    }

    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
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
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    updatePreviewButtons('idle');
    if (typeof window.applyAudioDucking === 'function') {
      window.applyAudioDucking(false);
    }
  }

  function speakNativeBrowserVoice(text, voiceToUse, isPreview) {
    return new Promise(function(resolve) {
      if (!('speechSynthesis' in window)) {
        updatePreviewButtons('idle');
        resolve();
        return;
      }

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      isVoiceCurrentlyPlaying = true;
      if (isPreview) updatePreviewButtons('playing');

      if (typeof window.applyAudioDucking === 'function') {
        window.applyAudioDucking(true);
      }

      var utterance = new SpeechSynthesisUtterance(text.trim());
      utterance.lang = 'de-DE';

      var isMale = (voiceToUse === 'Enceladus' || voiceToUse === 'Fenrir');
      utterance.pitch = isMale ? 0.75 : 1.05;
      utterance.rate = 0.92;

      // 40ms Verzögerung, um den Chrome cancel()-Bug zu umgehen
      setTimeout(function() {
        try {
          var voices = window.speechSynthesis.getVoices() || [];
          var deVoices = voices.filter(function(v) { return v.lang && v.lang.toLowerCase().startsWith('de'); });
          if (deVoices.length > 0) {
            if (isMale) {
              var mVoice = deVoices.find(function(v) {
                var n = v.name.toLowerCase();
                return n.includes('male') || n.includes('stefan') || n.includes('martin') || n.includes('markus') || n.includes('jannik');
              });
              utterance.voice = mVoice || deVoices[0];
            } else {
              var fVoice = deVoices.find(function(v) {
                var n = v.name.toLowerCase();
                return n.includes('female') || n.includes('anna') || n.includes('katja') || n.includes('marlene') || n.includes('hedda');
              });
              utterance.voice = fVoice || deVoices[0];
            }
          }
        } catch (e) {}

        var finished = false;
        function done() {
          if (finished) return;
          finished = true;
          isVoiceCurrentlyPlaying = false;
          if (previewTimeout) {
            clearTimeout(previewTimeout);
            previewTimeout = null;
          }
          if (typeof window.applyAudioDucking === 'function') {
            window.applyAudioDucking(false);
          }
          updatePreviewButtons('idle');
          resolve();
        }

        utterance.onend = done;
        utterance.onerror = done;

        if (isPreview) {
          previewTimeout = setTimeout(function() {
            stopActiveVoicePlayback();
            done();
          }, 5000);
        }

        window.speechSynthesis.speak(utterance);
      }, 40);
    });
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

    // 1. Instant Playback aus dem Memory-Cache (0 ms Latenz)
    if (ttsAudioCache[cacheKey]) {
      return playAudioUrlDirectly(ttsAudioCache[cacheKey], isPreview);
    }

    var apiKey = getGeminiApiKey();
    // Wenn kein Key oder Preset-Dummy-Key vorhanden ist: sofort nahtlos nativer Fallback!
    if (!apiKey || apiKey.length < 10 || apiKey.startsWith('AQ.')) {
      return speakNativeBrowserVoice(text, voiceToUse, isPreview);
    }

    // 2. Kaskade moderner TTS-Modelle
    var candidateModels = [
      activeDiscoveredTtsModel,
      "gemini-3.8-flash-tts",
      "gemini-3.8-flash-lite-tts",
      "gemini-3.8-flash"
    ];

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      if (!model) continue;

      var payload;
      var isDedicatedTts = (model.indexOf('-tts') !== -1);

      if (isDedicatedTts) {
        payload = {
          contents: [{
            role: "user",
            parts: [{ text: text.trim() }]
          }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                voice: voiceToUse
              }
            }
          }
        };
      } else {
        payload = {
          contents: [{
            role: "user",
            parts: [{ text: "Lies exakt diesen Text vor: \"" + text.trim() + "\"" }]
          }],
          systemInstruction: {
            parts: [{
              text: "Du bist eine reine Text-to-Speech-Stimme für eine private Paar-Session. Deine EINZIGE Aufgabe ist es, den vorgegebenen Text exakt, sinnlich und mit natürlicher Betonung auf Deutsch vorzulesen. Antworte NIEMALS auf den Text, stelle keine Fragen und füge kein Wort hinzu."
            }]
          },
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
            ttsAudioCache[cacheKey] = blobUrl;
            activeDiscoveredTtsModel = model;

            return playAudioUrlDirectly(blobUrl, isPreview);
          }
        } else if (resp.status === 400 || resp.status === 403) {
          // Ungültiger API-Key oder fehlende Berechtigung: sofort abbrechen und Fallback nutzen
          break;
        }
      } catch (e) {
        break;
      }
    }

    // 3. Nahtloser Fallback auf die native Stimme bei Google-High-Demand / Offline
    return speakNativeBrowserVoice(text, voiceToUse, isPreview);
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
          await new Promise(function(r) { setTimeout(r, 250); });
        } catch (e) { break; }
      }
    }

    isPreloading = false;
  }

  async function generateAndCacheSnippet(text, voiceToUse, apiKey) {
    var candidateModels = [
      activeDiscoveredTtsModel,
      "gemini-3.8-flash-tts",
      "gemini-3.8-flash-lite-tts",
      "gemini-3.8-flash"
    ];

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      if (!model) continue;

      var payload;
      var isDedicatedTts = (model.indexOf('-tts') !== -1);

      if (isDedicatedTts) {
        payload = {
          contents: [{ parts: [{ text: text.trim() }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { voice: voiceToUse } }
          }
        };
      } else {
        payload = {
          contents: [{ parts: [{ text: "Lies exakt: \"" + text.trim() + "\"" }] }],
          systemInstruction: {
            parts: [{ text: "Du bist eine reine Text-to-Speech-Stimme. Lies das Wort kurz vor." }]
          },
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceToUse } } }
          }
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

  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function() {
      try { window.speechSynthesis.getVoices(); } catch (e) {}
    };
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
