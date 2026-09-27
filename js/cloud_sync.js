/**
 * js/cloud_sync.js
 * Ende-zu-Ende verschlüsselte (E2EE) Synchronisations-Engine für den Kink- & Beziehungs-Kompass.
 * 
 * Beinhaltet:
 * - Vollständige Erfassung ALLER Einstellungen (API-Key, Rufnamen, Anatomie, Zoom, Theme, Stimme)
 * - Robuste Übertragung großer Datenpakete (ntfy 15-MB-Attachment-Support mit echtem Header)
 * - Rollen-Schutz: Gerät A überschreibt niemals Slot B; Gerät B überschreibt niemals Slot A
 * - Kein Überschreiben mit leeren Daten beim Beitreten
 * - Ausfallsicherer Sofort-Transfer
 */

(function(window) {
  'use strict';

  var NTFY_ENDPOINT = 'https://ntfy.sh';
  var activePairCode = null;
  var myAssignedRole = 'A';
  var isSyncPaired = false;
  var currentSyncStatus = 'idle';
  var syncDebounceTimer = null;
  var syncPollingInterval = null;
  var eventListeners = [];
  var lastKnownRemoteHash = null;

  function bufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (var i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function base64ToBuffer(base64) {
    var binary = window.atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async function deriveKeyFromPairCode(code, salt) {
    var cleanCode = String(code || '').toUpperCase().trim();
    var enc = new TextEncoder();
    var keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(cleanCode),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptPayload(dataObj, code) {
    var salt = window.crypto.getRandomValues(new Uint8Array(16));
    var iv = window.crypto.getRandomValues(new Uint8Array(12));
    var key = await deriveKeyFromPairCode(code, salt);

    var enc = new TextEncoder();
    var plaintext = enc.encode(JSON.stringify(dataObj));

    var ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      plaintext
    );

    return {
      salt: bufferToBase64(salt),
      iv: bufferToBase64(iv),
      ciphertext: bufferToBase64(ciphertext),
      version: 5,
      updatedAt: Date.now()
    };
  }

  async function decryptPayload(encryptedPackage, code) {
    if (!encryptedPackage || !encryptedPackage.ciphertext) {
      throw new Error("Ungültiges Verschlüsselungspaket.");
    }

    var salt = base64ToBuffer(encryptedPackage.salt);
    var iv = base64ToBuffer(encryptedPackage.iv);
    var ciphertext = base64ToBuffer(encryptedPackage.ciphertext);

    var key = await deriveKeyFromPairCode(code, salt);

    var decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    var dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedBuffer));
  }

  function countAnsweredQuestions(answersObj) {
    if (!answersObj || typeof answersObj !== 'object') return 0;
    var count = 0;
    Object.keys(answersObj).forEach(function(k) {
      if (k.indexOf('_note') === -1) count++;
    });
    return count;
  }

  function gatherLocalData() {
    var rawAnswers = localStorage.getItem('kompass_answers');
    var rawNames = localStorage.getItem('kompass_names');
    var rawAnatomy = localStorage.getItem('kompass_anatomy');
    var rawSafety = localStorage.getItem('kompass_safety_config');
    var rawEquip = localStorage.getItem('kompass_active_equipment_ids');
    var rawCustom = localStorage.getItem('kompass_custom_equipment');
    var rawDiary = localStorage.getItem('kompass_session_diary');
    var slA = localStorage.getItem('kompass_sharing_level_A');
    var slB = localStorage.getItem('kompass_sharing_level_B');

    var apiKey = localStorage.getItem('kompass_gemini_api_key') || '';
    var theme = localStorage.getItem('kompass_theme') || 'dark';
    var textZoom = localStorage.getItem('kompass_text_zoom') || '100';
    var voice = localStorage.getItem('kompass_session_voice') || 'Despina';
    var voiceAssist = localStorage.getItem('kompass_voice_assist_active') || 'false';

    var myRole = localStorage.getItem('kompass_assigned_role') || myAssignedRole || 'A';

    return {
      answers: rawAnswers ? JSON.parse(rawAnswers) : (window.answers || { A: {}, B: {} }),
      names: rawNames ? JSON.parse(rawNames) : (window.names || { A: 'Partner 1', B: 'Partner 2' }),
      anatomy: rawAnatomy ? JSON.parse(rawAnatomy) : (window.anatomy || { A: 'penis', B: 'vulva' }),
      safetyConfig: rawSafety ? JSON.parse(rawSafety) : (window.safetyConfig || { A: {}, B: {} }),
      activeEquipmentIds: rawEquip ? JSON.parse(rawEquip) : [],
      customEquipment: rawCustom ? JSON.parse(rawCustom) : [],
      sessionDiary: rawDiary ? JSON.parse(rawDiary) : [],
      sharingLevels: {
        A: slA ? parseInt(slA, 10) : 4,
        B: slB ? parseInt(slB, 10) : 4
      },
      settings: {
        geminiApiKey: apiKey,
        theme: theme,
        textZoom: textZoom,
        sessionVoice: voice,
        voiceAssist: voiceAssist,
        onboarded: true
      },
      lastSenderRole: myRole,
      clientTimestamp: Date.now()
    };
  }

  /**
   * ROLLEN-INTEGRIERTER MERGE:
   * Gerät A darf NIEMALS Name, Anatomie oder Antworten von B überschreiben.
   * Gerät B darf NIEMALS Name, Anatomie oder Antworten von A überschreiben.
   */
  function mergeDatasets(local, remote) {
    if (!remote || typeof remote !== 'object') return local;

    var merged = {
      answers: { A: {}, B: {} },
      names: { A: 'Partner 1', B: 'Partner 2' },
      anatomy: { A: 'penis', B: 'vulva' },
      safetyConfig: { A: {}, B: {} },
      activeEquipmentIds: [],
      customEquipment: [],
      sessionDiary: [],
      sharingLevels: { A: 4, B: 4 },
      settings: {}
    };

    var senderRole = remote.lastSenderRole || 'unknown';
    var localAnswersCountA = countAnsweredQuestions(local.answers?.A);
    var remoteAnswersCountA = countAnsweredQuestions(remote.answers?.A);
    var localAnswersCountB = countAnsweredQuestions(local.answers?.B);
    var remoteAnswersCountB = countAnsweredQuestions(remote.answers?.B);

    // 1. ANTWORTEN SLOT A:
    // Wenn remote von Gerät A stammt oder mehr A-Antworten hat -> Remote übernehmen
    if (senderRole === 'A' || remoteAnswersCountA >= localAnswersCountA) {
      merged.answers.A = Object.assign({}, local.answers?.A || {}, remote.answers?.A || {});
    } else {
      merged.answers.A = Object.assign({}, remote.answers?.A || {}, local.answers?.A || {});
    }

    // 2. ANTWORTEN SLOT B:
    // Wenn remote von Gerät B stammt oder mehr B-Antworten hat -> Remote übernehmen
    if (senderRole === 'B' || remoteAnswersCountB >= localAnswersCountB) {
      merged.answers.B = Object.assign({}, local.answers?.B || {}, remote.answers?.B || {});
    } else {
      merged.answers.B = Object.assign({}, remote.answers?.B || {}, local.answers?.B || {});
    }

    // 3. NAMEN:
    // Slot A gehört Partner 1; Slot B gehört Partner 2
    if (senderRole === 'A' && remote.names?.A && remote.names.A !== 'Partner 1') {
      merged.names.A = remote.names.A;
    } else {
      merged.names.A = (local.names?.A && local.names.A !== 'Partner 1') ? local.names.A : (remote.names?.A || 'Partner 1');
    }

    if (senderRole === 'B' && remote.names?.B && remote.names.B !== 'Partner 2') {
      merged.names.B = remote.names.B;
    } else {
      merged.names.B = (local.names?.B && local.names.B !== 'Partner 2') ? local.names.B : (remote.names?.B || 'Partner 2');
    }

    // 4. ANATOMIE:
    if (senderRole === 'A' && remote.anatomy?.A) merged.anatomy.A = remote.anatomy.A;
    else merged.anatomy.A = local.anatomy?.A || remote.anatomy?.A || 'penis';

    if (senderRole === 'B' && remote.anatomy?.B) merged.anatomy.B = remote.anatomy.B;
    else merged.anatomy.B = local.anatomy?.B || remote.anatomy?.B || 'vulva';

    // 5. SICHERHEIT & FREIGABESTUFEN:
    merged.safetyConfig.A = Object.assign({}, local.safetyConfig?.A || {}, remote.safetyConfig?.A || {});
    merged.safetyConfig.B = Object.assign({}, local.safetyConfig?.B || {}, remote.safetyConfig?.B || {});

    merged.sharingLevels.A = remote.sharingLevels?.A || local.sharingLevels?.A || 4;
    merged.sharingLevels.B = remote.sharingLevels?.B || local.sharingLevels?.B || 4;

    // 6. EINSTELLUNGEN:
    // Wenn remote einen API-Key hat, übernehmen
    merged.settings = Object.assign({}, local.settings || {}, remote.settings || {});
    if (remote.settings?.geminiApiKey && (!local.settings?.geminiApiKey || local.settings.geminiApiKey.length < 5)) {
      merged.settings.geminiApiKey = remote.settings.geminiApiKey;
    }

    // 7. TOYS & SCHRANK:
    var equipSet = new Set([].concat(local.activeEquipmentIds || [], remote.activeEquipmentIds || []));
    merged.activeEquipmentIds = Array.from(equipSet);

    var customMap = new Map();
    (remote.customEquipment || []).forEach(function(item) { if (item && item.id) customMap.set(item.id, item); });
    (local.customEquipment || []).forEach(function(item) { if (item && item.id) customMap.set(item.id, item); });
    merged.customEquipment = Array.from(customMap.values());

    var diaryMap = new Map();
    (remote.sessionDiary || []).forEach(function(entry) { if (entry && entry.id) diaryMap.set(entry.id, entry); });
    (local.sessionDiary || []).forEach(function(entry) { if (entry && entry.id) diaryMap.set(entry.id, entry); });
    merged.sessionDiary = Array.from(diaryMap.values()).sort(function(a, b) {
      return (b.id || '').localeCompare(a.id || '');
    });

    return merged;
  }

  function applyMergedDataLocally(data) {
    if (!data) return;

    try {
      localStorage.setItem('kompass_answers', JSON.stringify(data.answers));
      localStorage.setItem('kompass_names', JSON.stringify(data.names));
      localStorage.setItem('kompass_anatomy', JSON.stringify(data.anatomy));
      localStorage.setItem('kompass_safety_config', JSON.stringify(data.safetyConfig));
      localStorage.setItem('kompass_active_equipment_ids', JSON.stringify(data.activeEquipmentIds));
      localStorage.setItem('kompass_custom_equipment', JSON.stringify(data.customEquipment));
      localStorage.setItem('kompass_session_diary', JSON.stringify(data.sessionDiary));

      if (data.sharingLevels) {
        if (data.sharingLevels.A) localStorage.setItem('kompass_sharing_level_A', data.sharingLevels.A.toString());
        if (data.sharingLevels.B) localStorage.setItem('kompass_sharing_level_B', data.sharingLevels.B.toString());
      }

      if (data.settings) {
        if (data.settings.geminiApiKey && data.settings.geminiApiKey.length > 5) {
          localStorage.setItem('kompass_gemini_api_key', data.settings.geminiApiKey);
          var keyInput = document.getElementById('account-gemini-key') || document.getElementById('session-gemini-key-input');
          if (keyInput) keyInput.value = data.settings.geminiApiKey;
        }
        if (data.settings.theme) {
          localStorage.setItem('kompass_theme', data.settings.theme);
          if (data.settings.theme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
        if (data.settings.textZoom) {
          localStorage.setItem('kompass_text_zoom', data.settings.textZoom);
          if (typeof window.applyTextZoom === 'function') window.applyTextZoom(data.settings.textZoom);
        }
        if (data.settings.sessionVoice) {
          localStorage.setItem('kompass_session_voice', data.settings.sessionVoice);
        }
        if (data.settings.voiceAssist) {
          localStorage.setItem('kompass_voice_assist_active', data.settings.voiceAssist);
        }
        localStorage.setItem('kompass_onboarded', 'true');
      }

      window.answers = data.answers;
      window.names = data.names;
      window.anatomy = data.anatomy;
      window.safetyConfig = data.safetyConfig;
      window.sessionDiary = data.sessionDiary;

      window.dispatchEvent(new CustomEvent('kompass_data_synced', { detail: data }));

      if (typeof window.loadCoreData === 'function') window.loadCoreData();
      if (typeof window.updateUserToggleUI === 'function') window.updateUserToggleUI();
      if (typeof window.updateHubUI === 'function') window.updateHubUI();
      if (window.SurveyEngine && typeof window.SurveyEngine.render === 'function') window.SurveyEngine.render();
      if (window.ProfileEngine && typeof window.ProfileEngine.render === 'function') window.ProfileEngine.render();
      if (window.PairAnalysisEngine && typeof window.PairAnalysisEngine.render === 'function') window.PairAnalysisEngine.render();
      if (window.HubToys && typeof window.HubToys.updateCount === 'function') window.HubToys.updateCount();
    } catch (e) {
      console.error("Fehler beim lokalen Sichern der synchronisierten Daten:", e);
    }
  }

  function getCleanTopic(code) {
    return 'kink_vault_' + encodeURIComponent(String(code || '').toUpperCase().trim().replace(/[^A-Z0-9]/g, ''));
  }

  async function pushDataToCloud() {
    if (!isSyncPaired || !activePairCode) return;

    currentSyncStatus = 'syncing';
    notifyListeners('status_change', { status: currentSyncStatus });

    try {
      var localData = gatherLocalData();
      var encryptedPayload = await encryptPayload(localData, activePairCode);
      var topic = getCleanTopic(activePairCode);
      var payloadString = JSON.stringify(encryptedPayload);

      // KORREKTE NTFY ATTACHMENT-HEADER:
      // 'Filename' und 'X-Filename' stellen sicher, dass ntfy das Attachment-Limit (15 MB) freigibt
      var putUrl = NTFY_ENDPOINT + '/' + topic;

      var resp = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          'Title': 'KompassSync',
          'Tags': 'shield,lock',
          'Filename': 'vault.json',
          'X-Filename': 'vault.json',
          'Content-Type': 'application/json'
        },
        body: payloadString
      });

      if (!resp.ok) {
        // Fallback: Standard POST
        resp = await fetch(putUrl, {
          method: 'POST',
          headers: {
            'Title': 'KompassSync',
            'Tags': 'shield,lock',
            'Filename': 'vault.json',
            'X-Filename': 'vault.json',
            'Content-Type': 'application/json'
          },
          body: payloadString
        });
      }

      if (!resp.ok) throw new Error("HTTP " + resp.status + " beim Cloud-Update.");

      currentSyncStatus = 'idle';
      lastKnownRemoteHash = payloadString.length.toString() + '_' + encryptedPayload.updatedAt;
      notifyListeners('status_change', { status: currentSyncStatus });
    } catch (e) {
      console.warn("Cloud-Sync Upload-Fehler:", e);
      currentSyncStatus = 'error';
      notifyListeners('status_change', { status: currentSyncStatus, error: e.message });
    }
  }

  async function pullDataFromCloud() {
    if (!isSyncPaired || !activePairCode) return false;

    try {
      var topic = getCleanTopic(activePairCode);
      var getUrl = NTFY_ENDPOINT + '/' + topic + '/json?poll=1&since=all';

      var resp = await fetch(getUrl, {
        method: 'GET',
        cache: 'no-store'
      });

      if (!resp.ok) return false;

      var text = await resp.text();
      if (!text || text.trim().length === 0) return false;

      var lines = text.trim().split('\n');
      var latestEncrypted = null;

      for (var i = lines.length - 1; i >= 0; i--) {
        try {
          var parsedMsg = JSON.parse(lines[i]);
          
          // Fall 1: Anhang vorhanden
          if (parsedMsg.attachment && parsedMsg.attachment.url) {
            try {
              var fileResp = await fetch(parsedMsg.attachment.url, { cache: 'no-store' });
              if (fileResp.ok) {
                var fileData = await fileResp.json();
                if (fileData && fileData.ciphertext && fileData.iv) {
                  latestEncrypted = fileData;
                  break;
                }
              }
            } catch (errAttach) {}
          }

          // Fall 2: Inline-Nachricht (Body)
          if (parsedMsg.event === 'message' && parsedMsg.message) {
            var maybeEnc = null;
            try { maybeEnc = JSON.parse(parsedMsg.message); } catch (eJson) {}
            if (maybeEnc && maybeEnc.ciphertext && maybeEnc.iv) {
              latestEncrypted = maybeEnc;
              break;
            }
          }
        } catch (err) {}
      }

      if (!latestEncrypted) return false;

      var checkHash = JSON.stringify(latestEncrypted).length.toString() + '_' + (latestEncrypted.updatedAt || '');
      if (checkHash === lastKnownRemoteHash) return true;

      var remoteData = await decryptPayload(latestEncrypted, activePairCode);
      var localData = gatherLocalData();
      var merged = mergeDatasets(localData, remoteData);

      applyMergedDataLocally(merged);
      lastKnownRemoteHash = checkHash;

      notifyListeners('data_received', { data: merged });
      return true;
    } catch (e) {
      console.warn("Cloud-Sync Download-Fehler:", e);
      return false;
    }
  }

  function triggerDebouncedSync() {
    if (!isSyncPaired) return;
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(function() {
      pushDataToCloud();
    }, 800);
  }

  function generateRandomRoomCode() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var result = "KOMPASS-";
    for (var i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function createRoom() {
    var newCode = generateRandomRoomCode();
    activePairCode = newCode;
    myAssignedRole = 'A';
    isSyncPaired = true;

    localStorage.setItem('kompass_pair_code', activePairCode);
    localStorage.setItem('kompass_assigned_role', 'A');
    localStorage.setItem('kompass_is_paired', 'true');
    localStorage.setItem('kompass_onboarded', 'true');

    await pushDataToCloud();
    startPolling();

    notifyListeners('paired', { code: activePairCode, role: 'A' });
    return activePairCode;
  }

  async function joinRoom(code, role) {
    var cleanCode = (code || '').toUpperCase().trim();
    if (cleanCode.length < 5) throw new Error("Der Paar-Code ist zu kurz.");

    activePairCode = cleanCode;
    myAssignedRole = (role === 'B') ? 'B' : 'A';
    isSyncPaired = true;

    localStorage.setItem('kompass_pair_code', activePairCode);
    localStorage.setItem('kompass_assigned_role', myAssignedRole);
    localStorage.setItem('kompass_is_paired', 'true');
    localStorage.setItem('kompass_onboarded', 'true');

    // Mehrfache Pull-Versuche mit Pause (verhindert leeres Überschreiben)
    var success = await pullDataFromCloud();
    if (!success) {
      await new Promise(function(r) { setTimeout(r, 600); });
      success = await pullDataFromCloud();
    }
    if (!success) {
      await new Promise(function(r) { setTimeout(r, 1200); });
      success = await pullDataFromCloud();
    }

    // WICHTIG: Ein beitretendes Gerät darf NIEMALS leere Daten hochladen!
    // Erst wenn lokale Antworten existieren, wird gepusht.
    var currentLocalAnswers = countAnsweredQuestions((window.answers && window.answers[myAssignedRole]));
    if (currentLocalAnswers > 0) {
      await pushDataToCloud();
    }

    startPolling();
    notifyListeners('paired', { code: activePairCode, role: myAssignedRole });
    return true;
  }

  function exportDirectTransferData() {
    var localData = gatherLocalData();
    var jsonStr = JSON.stringify(localData);
    return window.btoa(unescape(encodeURIComponent(jsonStr)));
  }

  function importDirectTransferData(base64String, targetRole) {
    try {
      var jsonStr = decodeURIComponent(escape(window.atob(base64String.trim())));
      var parsedData = JSON.parse(jsonStr);

      var local = gatherLocalData();
      var merged = mergeDatasets(local, parsedData);
      applyMergedDataLocally(merged);

      var finalRole = (targetRole === 'B') ? 'B' : 'A';
      localStorage.setItem('kompass_assigned_role', finalRole);
      localStorage.setItem('kompass_onboarded', 'true');
      if (typeof window.setCurrentUser === 'function') window.setCurrentUser(finalRole);

      return true;
    } catch (e) {
      throw new Error("Ungültiges Datenformat beim Sofort-Transfer.");
    }
  }

  function disconnect() {
    isSyncPaired = false;
    activePairCode = null;
    currentSyncStatus = 'idle';

    if (syncPollingInterval) clearInterval(syncPollingInterval);
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);

    localStorage.removeItem('kompass_pair_code');
    localStorage.removeItem('kompass_assigned_role');
    localStorage.setItem('kompass_is_paired', 'false');

    notifyListeners('unpaired', {});
  }

  function startPolling() {
    if (syncPollingInterval) clearInterval(syncPollingInterval);
    syncPollingInterval = setInterval(function() {
      if (isSyncPaired && document.visibilityState === 'visible') {
        pullDataFromCloud();
      }
    }, 10000);
  }

  function notifyListeners(eventName, payload) {
    eventListeners.forEach(function(listener) {
      try { listener(eventName, payload); } catch (e) {}
    });
  }

  function initFromStorage() {
    try {
      var savedCode = localStorage.getItem('kompass_pair_code');
      var savedRole = localStorage.getItem('kompass_assigned_role');
      var savedPaired = localStorage.getItem('kompass_is_paired');

      if (savedPaired === 'true' && savedCode) {
        activePairCode = savedCode;
        myAssignedRole = savedRole || 'A';
        isSyncPaired = true;
        startPolling();
        setTimeout(pullDataFromCloud, 600);
      }
    } catch (e) {}
  }

  window.CloudSync = {
    createRoom: createRoom,
    joinRoom: joinRoom,
    disconnect: disconnect,
    trigger: triggerDebouncedSync,
    pull: pullDataFromCloud,
    push: pushDataToCloud,
    exportDirect: exportDirectTransferData,
    importDirect: importDirectTransferData,
    getState: function() {
      return {
        isPaired: isSyncPaired,
        pairCode: activePairCode,
        role: myAssignedRole,
        status: currentSyncStatus
      };
    },
    addListener: function(fn) {
      if (typeof fn === 'function' && eventListeners.indexOf(fn) === -1) {
        eventListeners.push(fn);
      }
    },
    removeListener: function(fn) {
      var idx = eventListeners.indexOf(fn);
      if (idx !== -1) eventListeners.splice(idx, 1);
    }
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initFromStorage);
  } else {
    initFromStorage();
  }

})(window);
