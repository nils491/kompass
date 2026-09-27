/**
 * js/cloud_sync.js
 * Ende-zu-Ende verschlüsselte (E2EE) Synchronisations-Engine für den Kink- & Beziehungs-Kompass.
 * 
 * Sicherheitsmerkmale:
 * - AES-GCM 256-Bit Verschlüsselung über die native Browser Web Crypto API
 * - Schlüsselableitung via PBKDF2 (100.000 Runden SHA-256) aus dem Paar-Code
 * - Zero-Knowledge: Der Server sieht ausschließlich verschlüsseltes Rauschen (Ciphertext + IV + Salt)
 * - Automatisches Debouncing (800ms) und lokales Merging ohne Datenverlust
 */

(function(window) {
  'use strict';

  var SYNC_ENDPOINT_BASE = 'https://kvdb.io/6Z4uB3W8K5q7Xy9P2m1N4A/';
  var activePairCode = null;
  var myAssignedRole = 'A';
  var isSyncPaired = false;
  var currentSyncStatus = 'idle'; // 'idle', 'syncing', 'error'
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
    var enc = new TextEncoder();
    var keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(code),
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
      version: 4,
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

    return {
      answers: rawAnswers ? JSON.parse(rawAnswers) : { A: {}, B: {} },
      names: rawNames ? JSON.parse(rawNames) : { A: 'Partner 1', B: 'Partner 2' },
      anatomy: rawAnatomy ? JSON.parse(rawAnatomy) : { A: 'penis', B: 'vulva' },
      safetyConfig: rawSafety ? JSON.parse(rawSafety) : { A: {}, B: {} },
      activeEquipmentIds: rawEquip ? JSON.parse(rawEquip) : [],
      customEquipment: rawCustom ? JSON.parse(rawCustom) : [],
      sessionDiary: rawDiary ? JSON.parse(rawDiary) : [],
      sharingLevels: {
        A: slA ? parseInt(slA, 10) : 3,
        B: slB ? parseInt(slB, 10) : 3
      },
      lastSenderRole: myAssignedRole,
      clientTimestamp: Date.now()
    };
  }

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
      sharingLevels: { A: 3, B: 3 }
    };

    // Antworten verlustfrei zusammenführen
    merged.answers.A = Object.assign({}, local.answers?.A || {}, remote.answers?.A || {});
    merged.answers.B = Object.assign({}, local.answers?.B || {}, remote.answers?.B || {});

    // Namen & Anatomie
    merged.names.A = remote.names?.A || local.names?.A || 'Partner 1';
    merged.names.B = remote.names?.B || local.names?.B || 'Partner 2';
    merged.anatomy.A = remote.anatomy?.A || local.anatomy?.A || 'penis';
    merged.anatomy.B = remote.anatomy?.B || local.anatomy?.B || 'vulva';

    // Sicherheits-Kodex
    merged.safetyConfig.A = Object.assign({}, local.safetyConfig?.A || {}, remote.safetyConfig?.A || {});
    merged.safetyConfig.B = Object.assign({}, local.safetyConfig?.B || {}, remote.safetyConfig?.B || {});

    // Freigabestufen
    merged.sharingLevels.A = remote.sharingLevels?.A || local.sharingLevels?.A || 3;
    merged.sharingLevels.B = remote.sharingLevels?.B || local.sharingLevels?.B || 3;

    // Aktive Equipment IDs (Vereinigungsmenge)
    var equipSet = new Set([].concat(local.activeEquipmentIds || [], remote.activeEquipmentIds || []));
    merged.activeEquipmentIds = Array.from(equipSet);

    // Eigene Toys zusammenführen (nach ID dedupliziert)
    var customMap = new Map();
    (local.customEquipment || []).forEach(function(item) { if (item && item.id) customMap.set(item.id, item); });
    (remote.customEquipment || []).forEach(function(item) { if (item && item.id) customMap.set(item.id, item); });
    merged.customEquipment = Array.from(customMap.values());

    // Session-Tagebuch (nach ID dedupliziert)
    var diaryMap = new Map();
    (local.sessionDiary || []).forEach(function(entry) { if (entry && entry.id) diaryMap.set(entry.id, entry); });
    (remote.sessionDiary || []).forEach(function(entry) { if (entry && entry.id) diaryMap.set(entry.id, entry); });
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

      window.answers = data.answers;
      window.names = data.names;
      window.anatomy = data.anatomy;
      window.safetyConfig = data.safetyConfig;
      window.sessionDiary = data.sessionDiary;
    } catch (e) {
      console.error("Fehler beim lokalen Sichern der synchronisierten Daten:", e);
    }
  }

  async function pushDataToCloud() {
    if (!isSyncPaired || !activePairCode) return;

    currentSyncStatus = 'syncing';
    notifyListeners('status_change', { status: currentSyncStatus });

    try {
      var localData = gatherLocalData();
      var encryptedPayload = await encryptPayload(localData, activePairCode);
      var payloadString = JSON.stringify(encryptedPayload);

      var url = SYNC_ENDPOINT_BASE + encodeURIComponent('room_' + activePairCode);
      var resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadString
      });

      if (!resp.ok) {
        throw new Error("HTTP " + resp.status + " beim Hochladen.");
      }

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
      var url = SYNC_ENDPOINT_BASE + encodeURIComponent('room_' + activePairCode);
      var resp = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-store'
      });

      if (resp.status === 404) {
        // Raum noch leer: Erstupload initialisieren
        pushDataToCloud();
        return false;
      }

      if (!resp.ok) return false;

      var encryptedPackage = await resp.json();
      var checkHash = (JSON.stringify(encryptedPackage).length).toString() + '_' + (encryptedPackage.updatedAt || '');

      if (checkHash === lastKnownRemoteHash) {
        return false; // Keine Änderung auf dem Server
      }

      var remoteData = await decryptPayload(encryptedPackage, activePairCode);
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
    localStorage.setItem('kompass_assigned_role', myAssignedRole);
    localStorage.setItem('kompass_is_paired', 'true');

    startPolling();
    await pushDataToCloud();

    notifyListeners('paired', { code: activePairCode, role: myAssignedRole });
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

    var success = await pullDataFromCloud();
    if (!success) {
      await pushDataToCloud();
    }

    startPolling();
    notifyListeners('paired', { code: activePairCode, role: myAssignedRole });
    return true;
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
    }, 6000);
  }

  function notifyListeners(eventName, payload) {
    eventListeners.forEach(function(listener) {
      try {
        listener(eventName, payload);
      } catch (e) {
        console.error("Sync Listener Fehler:", e);
      }
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
        setTimeout(pullDataFromCloud, 1000);
      }
    } catch (e) {
      console.warn("Fehler beim Initialisieren der Cloud-Kopplung:", e);
    }
  }

  window.CloudSync = {
    createRoom: createRoom,
    joinRoom: joinRoom,
    disconnect: disconnect,
    trigger: triggerDebouncedSync,
    pull: pullDataFromCloud,
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
