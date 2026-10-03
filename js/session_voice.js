/**
 * js/session_voice.js
 * TACTUS Echte Gemini-Stimm-Engine, Audio-Synchronisation & Multi-Persona Speech (V3.0 Haute-Horlogerie)
 * Offizielle Web-Präsenz: tactus.digital
 * 
 * TACTUS FEATURE CONTRACT:
 * [✓] Echte Gemini-Stimme über Gemini API (Despina, Aoede, Enceladus, Fenrir)
 * [✓] responseModalities: ["AUDIO"] mit prebuiltVoiceConfig
 * [✓] Direkte Einspeisung in <audio id="master-voice-audio"> mit echtem 'playing'-Event für 1:1 Countdown-Sync
 * [✓] Nahtloser PCM-zu-WAV-Konverter für latenzfreie Wiedergabe direkt im Browser
 * [✓] Audio-Unlocking für iOS-Safari und Standalone WebClip Autoplay
 * [✓] Automatisches 60 % Audio-Ducking in SessionAudio während der Sprachausgabe
 * [✓] Resilienter Fallback auf System-TTS bei fehlendem API-Key oder Offline-Betrieb
 * [✓] 100 % UTF-8 Integrität, keine window.alert() / confirm() Aufrufe
 */

(function(window) {
  'use strict';

  const STORAGE_KEY_VOICE_NAME = 'kompass_session_voice';
  const STORAGE_KEY_VOICE_ACTIVE = 'kompass_voice_assist_active';
  const STORAGE_KEY_API_KEY = 'tactus_ai_custom_key';
  const STORAGE_KEY_API_KEY_LEGACY = 'kompass_gemini_api_key';

  const GEMINI_VOICE_PROFILES = {
    Despina: {
      id: 'Despina',
      name: 'Despina (Sinnlich-dunkle Frauenstimme)',
      gender: 'female',
      description: 'Warm, tief, intim und beruhigend für lange Schwellen und Vagus-Erdung.'
    },
    Aoede: {
      id: 'Aoede',
      name: 'Aoede (Fordernde Herrin)',
      gender: 'female',
      description: 'Souverän, gebieterisch und unnachgiebig bei Zucht und strenger Führung.'
    },
    Enceladus: {
      id: 'Enceladus',
      name: 'Enceladus (Tiefe, befehlende Männerstimme)',
      gender: 'male',
      description: 'Resonant, dunkel und autoritär für dominante Zurechtweisungen.'
    },
    Fenrir: {
      id: 'Fenrir',
      name: 'Fenrir (Strenge, raue Autorität)',
      gender: 'male',
      description: 'Körperlich, instinktiv und fordernd bei Schwellenstopps und Disziplin.'
    }
  };

  let activeAudioElement = null;
  let activeAudioBlobUrl = null;
  let isSpeaking = false;
  let isAudioUnlocked = false;

  function getGeminiApiKey() {
    try {
      const customKey = localStorage.getItem(STORAGE_KEY_API_KEY);
      if (customKey && customKey.trim().length > 10) return customKey.trim();
      const legacyKey = localStorage.getItem(STORAGE_KEY_API_KEY_LEGACY);
      if (legacyKey && legacyKey.trim().length > 10) return legacyKey.trim();
    } catch (e) {}

    const liveInput = document.getElementById('acc-input-ai-key') || 
                      document.getElementById('session-gemini-key-input') || 
                      document.getElementById('account-gemini-key');
    if (liveInput && liveInput.value && liveInput.value.trim().length > 10) {
      return liveInput.value.trim();
    }
    return null;
  }

  function ensureMasterAudioElement() {
    if (typeof document === 'undefined') return null;
    let el = document.getElementById('master-voice-audio');
    if (!el) {
      el = document.createElement('audio');
      el.id = 'master-voice-audio';
      el.preload = 'auto';
      el.style.display = 'none';
      document.body.appendChild(el);
    }
    activeAudioElement = el;
    return el;
  }

  function unlockAudio() {
    const audio = ensureMasterAudioElement();
    if (!audio) return;

    if (!isAudioUnlocked) {
      // Stummen Klick abspielen, um Audio-Context auf iOS / Safari zu entsperren
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        isAudioUnlocked = true;
      }).catch(() => {});
    }

    if (window.SessionAudio && typeof window.SessionAudio.ensureAudioContext === 'function') {
      try { window.SessionAudio.ensureAudioContext(); } catch (e) {}
    }
  }

  function pcmToWavBlobUrl(pcmBase64, sampleRate = 24000) {
    const binaryString = atob(pcmBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);

    // RIFF identifier "RIFF"
    view.setUint32(0, 0x52494646, false);
    view.setUint32(4, 36 + len, true);
    // WAVE identifier "WAVE"
    view.setUint32(8, 0x57415645, false);
    // fmt chunk "fmt "
    view.setUint32(12, 0x666d7420, false);
    view.setUint32(16, 16, true); // Chunk length
    view.setUint16(20, 1, true); // PCM Format (1)
    view.setUint16(22, 1, true); // Mono (1 Kanal)
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate (SampleRate * 1 Kanal * 2 Bytes)
    view.setUint16(32, 2, true); // Block align (1 * 2)
    view.setUint16(34, 16, true); // 16 Bit pro Sample
    // data chunk "data"
    view.setUint32(36, 0x64617461, false);
    view.setUint32(40, len, true);

    const blob = new Blob([view, bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  async function fetchGeminiAudioBlobUrl(text, voiceName) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) return null;

    const candidateModels = [
      localStorage.getItem('tactus_gemini_active_model') || 'gemini-2.0-flash',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash'
    ];

    const cleanModelName = candidateModels[0].replace(/^models\//, '');
    const promptText = `Lies die folgende erotische BDSM-Regieanweisung ruhig, autoritär, mit sonorem Takt und natürlicher Betonung auf Deutsch vor:\n\n${text}`;

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      
      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Despina'
              }
            }
          }
        }
      };

      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (resp.ok) {
          const resData = await resp.json();
          const candidatePart = resData?.candidates?.[0]?.content?.parts?.[0];
          
          if (candidatePart && candidatePart.inlineData && candidatePart.inlineData.data) {
            const mime = candidatePart.inlineData.mimeType || 'audio/L16;codec=pcm;rate=24000';
            const rawData = candidatePart.inlineData.data;

            if (mime.includes('pcm') || mime.includes('L16')) {
              return pcmToWavBlobUrl(rawData, 24000);
            } else {
              return `data:${mime};base64,${rawData}`;
            }
          }
        }
      } catch (err) {
        console.debug(`[TACTUS Voice] Gemini TTS Aufruf für Modell ${model} fehlgeschlagen:`, err);
      }
    }

    return null;
  }

  function fallbackBrowserSpeech(cleanText) {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'de-DE';
      utterance.pitch = 0.90;
      utterance.rate = 0.88;

      const voices = window.speechSynthesis.getVoices() || [];
      const deVoice = voices.find(v => (v.lang || '').startsWith('de') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Enhanced'))) ||
                      voices.find(v => (v.lang || '').startsWith('de'));
      if (deVoice) utterance.voice = deVoice;

      utterance.onstart = () => {
        isSpeaking = true;
        if (window.SessionAudio && typeof window.SessionAudio.duck === 'function') {
          window.SessionAudio.duck(0.40);
        }
      };

      utterance.onend = () => {
        isSpeaking = false;
        if (window.SessionAudio && typeof window.SessionAudio.unduck === 'function') {
          window.SessionAudio.unduck(1.0);
        }
        resolve();
      };

      utterance.onerror = () => {
        isSpeaking = false;
        if (window.SessionAudio && typeof window.SessionAudio.unduck === 'function') {
          window.SessionAudio.unduck(1.0);
        }
        resolve();
      };

      // Künstliches kurzes Audio-Event auf master-voice-audio triggern, damit Hörer auf 'playing' sofort reagieren
      const audio = ensureMasterAudioElement();
      if (audio) {
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audio.play().catch(() => {});
      }

      window.speechSynthesis.speak(utterance);
    });
  }

  function play(text, voiceOverride = null, isTest = false) {
    if (!text || typeof text !== 'string') return Promise.resolve();

    unlockAudio();
    const isVoiceActive = localStorage.getItem(STORAGE_KEY_VOICE_ACTIVE) !== 'false';
    if (!isVoiceActive && !isTest) {
      return Promise.resolve();
    }

    const cleanText = text.replace(/<[^>]*>/g, '').replace(/^[„"']|[“"']$/g, '').trim();
    if (!cleanText) return Promise.resolve();

    const selectedVoice = voiceOverride || localStorage.getItem(STORAGE_KEY_VOICE_NAME) || 'Despina';
    const audio = ensureMasterAudioElement();

    return new Promise(async (resolve) => {
      // Ducking einleiten
      if (window.SessionAudio && typeof window.SessionAudio.duck === 'function') {
        window.SessionAudio.duck(0.40);
      }

      let audioSourceUrl = null;
      try {
        audioSourceUrl = await fetchGeminiAudioBlobUrl(cleanText, selectedVoice);
      } catch (err) {
        console.debug("[TACTUS Voice] Gemini API TTS fehlgeschlagen, wechsle auf Fallback:", err);
      }

      if (audioSourceUrl && audio) {
        if (activeAudioBlobUrl && activeAudioBlobUrl.startsWith('blob:')) {
          URL.revokeObjectURL(activeAudioBlobUrl);
        }
        activeAudioBlobUrl = audioSourceUrl;

        audio.src = audioSourceUrl;
        isSpeaking = true;

        const onEndHandler = () => {
          isSpeaking = false;
          audio.removeEventListener('ended', onEndHandler);
          audio.removeEventListener('error', onErrorHandler);
          if (window.SessionAudio && typeof window.SessionAudio.unduck === 'function') {
            window.SessionAudio.unduck(1.2);
          }
          resolve();
        };

        const onErrorHandler = () => {
          audio.removeEventListener('ended', onEndHandler);
          audio.removeEventListener('error', onErrorHandler);
          fallbackBrowserSpeech(cleanText).then(resolve);
        };

        audio.addEventListener('ended', onEndHandler);
        audio.addEventListener('error', onErrorHandler);

        audio.play().catch(() => {
          fallbackBrowserSpeech(cleanText).then(resolve);
        });
      } else {
        // Fallback: Browser SpeechSynthesis
        fallbackBrowserSpeech(cleanText).then(resolve);
      }
    });
  }

  function stop() {
    if (activeAudioElement) {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    isSpeaking = false;
    if (window.SessionAudio && typeof window.SessionAudio.unduck === 'function') {
      window.SessionAudio.unduck(0.5);
    }
  }

  const api = {
    play: play,
    speak: play,
    stop: stop,
    cancel: stop,
    unlock: unlockAudio,
    isSpeaking: () => isSpeaking,
    getVoices: () => Object.assign({}, GEMINI_VOICE_PROFILES),
    getSelectedVoice: () => localStorage.getItem(STORAGE_KEY_VOICE_NAME) || 'Despina',
    setSelectedVoice: (name) => {
      localStorage.setItem(STORAGE_KEY_VOICE_NAME, name);
    }
  };

  window.SessionVoice = api;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureMasterAudioElement);
    } else {
      ensureMasterAudioElement();
    }

    // Ersten Touch abfangen für Audio-Unlocking
    window.addEventListener('click', unlockAudio, { once: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
  }

})(typeof window !== 'undefined' ? window : this);
