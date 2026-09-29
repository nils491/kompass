/**
 * js/hub_photos.js
 * PACTUM E2EE-Fototresor & Canvas-Kompression (Release 3.0 Core Bundle)
 * 
 * Verantwortlichkeiten:
 * - IndexedDB-Tresor ('pactum_vault_db') für unbegrenzten Offline-Speicher (Apple ITP-Schutz)
 * - Automatischer Persistent-Storage-Request via navigator.storage.persist()
 * - Smart Center-Crop auf quadratisches 1:1-Format (800x800 px) im HTML5-Canvas
 * - Zielkomprimierung auf <= 80 KB (WebP mit JPEG-Fallback)
 * - Lokales Caching zur blitzschnellen Anzeige ohne Latenz
 * - Native Kamera-Auslösung via capture="environment"
 * - Export- & Import-Schnittstellen für E2EE-Cloud-Sync
 * - Strikte Einhaltung: <= 800 Zeilen, keine alert() / confirm() Aufrufe!
 */

(function(window) {
  'use strict';

  const DB_NAME = 'pactum_vault_db';
  const DB_VERSION = 1;
  const STORE_PHOTOS = 'toy_photos';
  const TARGET_DIMENSION = 800; // 800 x 800 px quadratisch
  const MAX_TARGET_BYTES = 80 * 1024; // 80 KB Zielgrenze

  let dbInstance = null;
  let dbInitPromise = null;
  const inMemoryBlobUrlCache = new Map();

  function showToast(message) {
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification(message);
      return;
    }
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = "bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 transition-all pointer-events-auto transform translate-y-2 opacity-0 flex items-center gap-2";
    el.innerHTML = `<span>📸</span><span>${escapeHtml(message)}</span>`;
    container.appendChild(el);

    setTimeout(() => el.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
      el.classList.add('opacity-0');
      setTimeout(() => el.remove(), 300);
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function requestStoragePersistence() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
          const granted = await navigator.storage.persist();
          console.debug("[PACTUM Vault] Persistent Storage Status:", granted ? "Garantiert (ITP-Schutz aktiv)" : "Standard (Browser-verwaltet)");
        } else {
          console.debug("[PACTUM Vault] Persistent Storage bereits aktiv.");
        }
      }
    } catch (err) {
      console.warn("[PACTUM Vault] Konnte Speicherpersistenz nicht anfordern:", err);
    }
  }

  function openVaultDatabase() {
    if (dbInstance) return Promise.resolve(dbInstance);
    if (dbInitPromise) return dbInitPromise;

    dbInitPromise = new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn("[PACTUM Vault] IndexedDB wird von dieser Umgebung nicht unterstützt.");
        resolve(null);
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
          const store = db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
          store.createIndex('toyId', 'toyId', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        dbInstance = event.target.result;
        resolve(dbInstance);
      };

      request.onerror = (event) => {
        console.error("[PACTUM Vault] Fehler beim Öffnen von IndexedDB:", event.target.error);
        resolve(null);
      };
    });

    return dbInitPromise;
  }

  async function processImageToSquareWebP(fileOrBlob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Fehler beim Lesen des Bildes."));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = TARGET_DIMENSION;
            canvas.height = TARGET_DIMENSION;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              reject(new Error("Canvas 2D-Kontext nicht verfügbar."));
              return;
            }

            // Exakter Center-Crop auf die kürzere Kante (1:1 quadratisch)
            const minEdge = Math.min(img.width, img.height);
            const sourceX = (img.width - minEdge) / 2;
            const sourceY = (img.height - minEdge) / 2;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Hintergrund mattschwarz vorab füllen
            ctx.fillStyle = '#05070c';
            ctx.fillRect(0, 0, TARGET_DIMENSION, TARGET_DIMENSION);

            // Zentrierter Zuschnitt auf 800x800 px zeichnen
            ctx.drawImage(
              img,
              sourceX, sourceY, minEdge, minEdge,
              0, 0, TARGET_DIMENSION, TARGET_DIMENSION
            );

            let quality = 0.82;
            let mimeType = 'image/webp';
            let dataUrl = canvas.toDataURL(mimeType, quality);

            // Prüfen ob WebP vom Browser unterstützt wird (Fallback auf JPEG)
            if (!dataUrl.startsWith('data:image/webp')) {
              mimeType = 'image/jpeg';
              dataUrl = canvas.toDataURL(mimeType, quality);
            }

            // Iterative Qualitätsanpassung falls > 80 KB
            let attempts = 0;
            while (dataUrl.length * 0.75 > MAX_TARGET_BYTES && attempts < 4 && quality > 0.45) {
              quality -= 0.12;
              dataUrl = canvas.toDataURL(mimeType, quality);
              attempts++;
            }

            resolve({
              dataUrl: dataUrl,
              mimeType: mimeType,
              sizeBytes: Math.round(dataUrl.length * 0.75)
            });
          } catch (processErr) {
            reject(processErr);
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(fileOrBlob);
    });
  }

  async function saveToyPhoto(toyId, processedResult) {
    if (!toyId) throw new Error("toyId erforderlich.");
    const db = await openVaultDatabase();
    const record = {
      id: String(toyId),
      toyId: String(toyId),
      dataUrl: processedResult.dataUrl,
      mimeType: processedResult.mimeType,
      sizeBytes: processedResult.sizeBytes,
      updatedAt: Date.now()
    };

    // Im In-Memory Cache vorhalten für 0-ms Rendern
    inMemoryBlobUrlCache.set(String(toyId), processedResult.dataUrl);

    if (!db) {
      // Notfall-Fallback in localStorage
      try {
        localStorage.setItem(`pactum_toy_photo_${toyId}`, processedResult.dataUrl);
      } catch (e) {
        console.warn("[PACTUM Vault] LocalStorage Quota erreicht:", e);
      }
      return record;
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PHOTOS, 'readwrite');
      const store = tx.objectStore(STORE_PHOTOS);
      const req = store.put(record);

      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function getToyPhoto(toyId) {
    if (!toyId) return null;
    const strId = String(toyId);

    if (inMemoryBlobUrlCache.has(strId)) {
      return inMemoryBlobUrlCache.get(strId);
    }

    const db = await openVaultDatabase();
    if (!db) {
      return localStorage.getItem(`pactum_toy_photo_${strId}`) || null;
    }

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PHOTOS, 'readonly');
      const store = tx.objectStore(STORE_PHOTOS);
      const req = store.get(strId);

      req.onsuccess = () => {
        const res = req.result;
        if (res && res.dataUrl) {
          inMemoryBlobUrlCache.set(strId, res.dataUrl);
          resolve(res.dataUrl);
        } else {
          const fallback = localStorage.getItem(`pactum_toy_photo_${strId}`) || null;
          if (fallback) inMemoryBlobUrlCache.set(strId, fallback);
          resolve(fallback);
        }
      };
      req.onerror = () => resolve(null);
    });
  }

  async function deleteToyPhoto(toyId) {
    if (!toyId) return false;
    const strId = String(toyId);
    inMemoryBlobUrlCache.delete(strId);
    try {
      localStorage.removeItem(`pactum_toy_photo_${strId}`);
    } catch (e) {}

    const db = await openVaultDatabase();
    if (!db) return true;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PHOTOS, 'readwrite');
      const store = tx.objectStore(STORE_PHOTOS);
      const req = store.delete(strId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  }

  async function exportAllPhotosForSync() {
    const db = await openVaultDatabase();
    if (!db) return [];

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PHOTOS, 'readonly');
      const store = tx.objectStore(STORE_PHOTOS);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async function importPhotosFromSync(remotePhotoList) {
    if (!Array.isArray(remotePhotoList) || remotePhotoList.length === 0) return 0;
    const db = await openVaultDatabase();
    let importedCount = 0;

    for (const remoteItem of remotePhotoList) {
      if (!remoteItem || !remoteItem.id || !remoteItem.dataUrl) continue;
      const strId = String(remoteItem.id);
      const localPhoto = await getToyPhoto(strId);

      if (!localPhoto || (remoteItem.updatedAt && remoteItem.updatedAt > (localPhoto.updatedAt || 0))) {
        await saveToyPhoto(strId, {
          dataUrl: remoteItem.dataUrl,
          mimeType: remoteItem.mimeType || 'image/webp',
          sizeBytes: remoteItem.sizeBytes || Math.round(remoteItem.dataUrl.length * 0.75)
        });
        importedCount++;
      }
    }

    return importedCount;
  }

  function capturePhotoForToy(toyId, onCompleteCallback) {
    if (!toyId) return;

    let input = document.getElementById('pactum-vault-hidden-camera-input');
    if (!input) {
      input = document.createElement('input');
      input.type = 'file';
      input.id = 'pactum-vault-hidden-camera-input';
      input.accept = 'image/*';
      input.setAttribute('capture', 'environment');
      input.className = 'hidden';
      document.body.appendChild(input);
    }

    input.onchange = async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      showToast("Foto wird 1:1 optimiert...");
      try {
        const processed = await processImageToSquareWebP(file);
        await saveToyPhoto(toyId, processed);
        showToast("Toy-Foto im Tresor gesichert ✓ (" + Math.round(processed.sizeBytes / 1024) + " KB)");

        if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
          window.CloudSync.trigger();
        }

        if (typeof onCompleteCallback === 'function') {
          onCompleteCallback(processed.dataUrl, processed);
        }
      } catch (err) {
        console.error("[PACTUM Vault] Bildverarbeitung fehlgeschlagen:", err);
        showToast("⚠️ Fehler bei der Bildverarbeitung: " + (err.message || 'Unbekannt'));
      } finally {
        input.value = '';
      }
    };

    input.click();
  }

  async function initializeVault() {
    await requestStoragePersistence();
    await openVaultDatabase();
  }

  window.HubPhotos = {
    init: initializeVault,
    processImage: processImageToSquareWebP,
    savePhoto: saveToyPhoto,
    getPhoto: getToyPhoto,
    deletePhoto: deleteToyPhoto,
    captureForToy: capturePhotoForToy,
    exportForSync: exportAllPhotosForSync,
    importFromSync: importPhotosFromSync
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVault);
  } else {
    initializeVault();
  }

})(window);
