/**
 * js/hub_toys.js
 * Modul für die Toy-Verwaltung ("Unser Schrank") im Start-Hub.
 * 
 * Beinhaltet:
 * - Großzügiges, mehrzeiliges Kartendesign (keine abgeschnittenen Titel mehr)
 * - Sicherheitsabfrage vor dem Leeren des Inventars
 * - "+ Neues Toy anlegen" mit Live-Autoabgleich gegen den gesamten Katalog
 * - Automatisches Aktivieren existierender Toys bei Namensübereinstimmung
 * - Papierkorb 🗑️ zum dauerhaften Entfernen selbst angelegter Toys
 * - Automatische Synchronisation und Bereitstellung für die Schlafzimmer-Regie
 */

(function(window) {
  'use strict';

  var currentCategory = 'all';
  var searchQuery = '';
  var isNewToyFormOpen = false;

  var CATEGORY_LABELS = {
    household: '🏠 Haushalt & Improvisation',
    bondage: '⛓️ Fesselung & Seile',
    impact: '✋ Impact & Spanking',
    sensory: '🙈 Sensorik & Masken',
    cbt_clamps: '⚡ CBT & Klammern',
    toys_anal: '🍑 Toys & Anal',
    special: '🕯️ Spezial & Fetisch'
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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

  // Lädt selbst angelegte Toys aus dem Speicher
  function getCustomToys() {
    try {
      var raw = localStorage.getItem('kompass_custom_equipment');
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  }

  function saveCustomToys(list) {
    try {
      localStorage.setItem('kompass_custom_equipment', JSON.stringify(list || []));
      syncCustomToysToGlobalCatalog();
      if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
        window.CloudSync.trigger();
      }
    } catch (e) {}
  }

  // Integriert benutzerdefinierte Toys in den globalen Katalog, damit Regie & Wizard sie sehen
  function syncCustomToysToGlobalCatalog() {
    if (!window.equipmentCatalog) window.equipmentCatalog = [];
    var custom = getCustomToys();
    custom.forEach(function(cItem) {
      var exists = window.equipmentCatalog.some(function(i) { return i.id === cItem.id; });
      if (!exists) {
        window.equipmentCatalog.push(cItem);
      }
    });
  }

  function getCombinedCatalog() {
    syncCustomToysToGlobalCatalog();
    var catalog = window.equipmentCatalog || [];
    var custom = getCustomToys();
    var map = new Map();

    catalog.forEach(function(item) { map.set(item.id, item); });
    custom.forEach(function(item) { map.set(item.id, item); });

    return Array.from(map.values());
  }

  function getOwnedToyIds() {
    try {
      var stored = localStorage.getItem('kompass_active_equipment_ids');
      if (stored && stored !== 'null' && stored !== 'undefined') {
        var parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Fehler beim Lesen des Inventars:", e);
    }
    var catalog = getCombinedCatalog();
    return catalog.filter(function(i) { return i.defaultPresent; }).map(function(i) { return i.id; });
  }

  function saveOwnedToyIds(ids) {
    try {
      var safeIds = Array.isArray(ids) ? ids : [];
      localStorage.setItem('kompass_active_equipment_ids', JSON.stringify(safeIds));
      if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
        window.CloudSync.trigger();
      }
    } catch (e) {
      console.error("Fehler beim Speichern des Inventars:", e);
    }
    updateHubToyCount();
  }

  function updateHubToyCount() {
    var ids = getOwnedToyIds();
    var badge = document.getElementById('hub-toy-count-badge');
    if (badge) badge.innerText = ids.length + " Toys";
  }

  function openToyManagementModal() {
    var modal = document.getElementById('modal-toy-management');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
    cancelClearInventory();
    syncCustomToysToGlobalCatalog();
    renderToyManagementGrid();
  }

  function closeToyManagementModal() {
    var modal = document.getElementById('modal-toy-management');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    if (isNewToyFormOpen) toggleNewToyForm(false);
    updateHubToyCount();
  }

  function filterToyManagementCat(cat) {
    currentCategory = cat;
    ['all', 'household', 'bondage', 'impact', 'sensory', 'cbt_clamps', 'toys_anal', 'special'].forEach(function(c) {
      var btn = document.getElementById('btn-toy-cat-' + c);
      if (btn) {
        if (c === cat) {
          btn.className = "px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-brand-700 text-white touch-btn whitespace-nowrap";
        } else {
          btn.className = "px-2.5 py-1 rounded-lg text-[10.5px] font-bold theme-panel text-slate-300 touch-btn whitespace-nowrap";
        }
      }
    });
    renderToyManagementGrid();
  }

  function handleSearch(query) {
    searchQuery = (query || '').toLowerCase().trim();
    renderToyManagementGrid();
  }

  function toggleToyOwned(id) {
    var ids = getOwnedToyIds();
    var idx = ids.indexOf(id);
    if (idx !== -1) {
      ids.splice(idx, 1);
    } else {
      ids.push(id);
    }
    saveOwnedToyIds(ids);
    renderToyManagementGrid();
  }

  // ==========================================
  // SICHERHEITSABFRAGE VOR DEM LEEREN
  // ==========================================

  function promptClearInventory() {
    var box = document.getElementById('toy-clear-confirm-box');
    if (box) box.classList.remove('hidden');
  }

  function cancelClearInventory() {
    var box = document.getElementById('toy-clear-confirm-box');
    if (box) box.classList.add('hidden');
  }

  function confirmClearInventory() {
    cancelClearInventory();
    saveOwnedToyIds([]);
    renderToyManagementGrid();
    showToast("Inventar geleert: Keine Toys aktiv 🗑️");
  }

  function presetToyManagement(preset) {
    cancelClearInventory();
    var catalog = getCombinedCatalog();
    var ids = [];

    if (preset === 'all') {
      ids = catalog.map(function(i) { return i.id; });
      showToast("Alle Gegenstände im Schrank aktiviert ✓");
    } else if (preset === 'household_only') {
      ids = catalog.filter(function(i) { return i.category === 'household'; }).map(function(i) { return i.id; });
      showToast("Nur Haushaltsgegenstände aktiviert ✓");
    }

    saveOwnedToyIds(ids);
    renderToyManagementGrid();
  }

  // ==========================================
  // NEUES TOY ANLEGEN & AUTOABGLEICH
  // ==========================================

  function toggleNewToyForm(explicitState) {
    isNewToyFormOpen = (typeof explicitState === 'boolean') ? explicitState : !isNewToyFormOpen;
    var panel = document.getElementById('new-toy-form-panel');
    var btn = document.getElementById('btn-toggle-new-toy');

    if (panel) {
      if (isNewToyFormOpen) {
        panel.classList.remove('hidden');
        var input = document.getElementById('input-new-toy-name');
        if (input) {
          input.value = '';
          input.focus();
        }
        checkToyNameMatch('');
      } else {
        panel.classList.add('hidden');
      }
    }
    if (btn) {
      btn.innerHTML = isNewToyFormOpen ? "<span>✕</span><span>Schließen</span>" : "<span>+</span><span>Neues Toy</span>";
    }
  }

  // Prüft in Echtzeit, ob der eingegebene Name bereits im Katalog existiert
  function checkToyNameMatch(enteredName) {
    var box = document.getElementById('toy-match-feedback-box');
    var catRow = document.getElementById('new-toy-category-row');
    if (!box) return;

    var clean = (enteredName || '').toLowerCase().trim();
    if (clean.length < 2) {
      box.classList.add('hidden');
      box.innerHTML = '';
      if (catRow) catRow.classList.remove('opacity-50');
      return;
    }

    var catalog = getCombinedCatalog();
    var owned = getOwnedToyIds();

    // 1. Exakte oder sehr nahe Treffer suchen
    var matches = catalog.filter(function(item) {
      var n = (item.name || '').toLowerCase();
      var d = (item.desc || '').toLowerCase();
      return n.indexOf(clean) !== -1 || clean.indexOf(n) !== -1 || d.indexOf(clean) !== -1;
    });

    if (matches.length > 0) {
      var best = matches[0];
      var isAlreadyActive = owned.indexOf(best.id) !== -1;

      box.className = isAlreadyActive 
        ? "p-3 rounded-xl border bg-emerald-950/40 border-emerald-700 text-emerald-200 text-[11px] space-y-1.5"
        : "p-3 rounded-xl border bg-amber-950/40 border-amber-700 text-amber-200 text-[11px] space-y-1.5";

      box.innerHTML = `
        <div class="flex items-start justify-between gap-2">
          <div>
            <strong class="block text-white text-xs">
              ${isAlreadyActive ? '✓ Bereits in eurem Schrank aktiv:' : '💡 Bereits im Gesamtkatalog vorhanden:'}
            </strong>
            <span class="text-slate-200 font-bold block mt-0.5">„${escapeHtml(best.name)}“</span>
            <span class="text-[10px] text-slate-400 block">${escapeHtml(CATEGORY_LABELS[best.category] || best.category)} · ${escapeHtml(best.desc || '')}</span>
          </div>
          ${!isAlreadyActive ? `
            <button type="button" onclick="HubToys.activateExistingMatch('${best.id}')" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-xs touch-btn flex-shrink-0 shadow-md">
              Diesen aktivieren ✓
            </button>
          ` : `
            <span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px] flex-shrink-0">
              Schon aktiv
            </span>
          `}
        </div>
        <p class="text-[10px] text-slate-400 pt-0.5 border-t border-slate-800">
          Du kannst ihn direkt oben aktivieren, anstatt ihn doppelt als neues Toy anzulegen.
        </p>
      `;
      box.classList.remove('hidden');
    } else {
      box.className = "p-2.5 rounded-xl border bg-purple-950/40 border-purple-800/80 text-purple-200 text-[10.5px] flex items-center justify-between";
      box.innerHTML = `
        <span>✨ <strong>Noch nicht im Katalog:</strong> Wird als brandneues Toy angelegt.</span>
        <span class="text-purple-300 font-mono text-[9.5px]">Neu</span>
      `;
      box.classList.remove('hidden');
    }
  }

  function activateExistingMatch(toyId) {
    var ids = getOwnedToyIds();
    if (ids.indexOf(toyId) === -1) {
      ids.push(toyId);
      saveOwnedToyIds(ids);
    }
    toggleNewToyForm(false);
    renderToyManagementGrid();
    showToast("Gegenstand im Schrank aktiviert ✓");
  }

  function saveNewCustomToy() {
    var nameInput = document.getElementById('input-new-toy-name');
    var catSelect = document.getElementById('select-new-toy-category');
    var descInput = document.getElementById('input-new-toy-desc');

    var name = (nameInput ? nameInput.value : '').trim();
    var category = (catSelect ? catSelect.value : 'special') || 'special';
    var desc = (descInput ? descInput.value : '').trim();

    if (name.length < 2) {
      showToast("⚠️ Bitte gib einen Namen für das neue Toy ein.");
      return;
    }

    var newId = "custom_" + Date.now();
    var newToy = {
      id: newId,
      name: name,
      category: category,
      desc: desc || "Individuell hinzugefügtes Spielzeug.",
      chapters: [13, 16],
      defaultPresent: true,
      isCustom: true
    };

    var customList = getCustomToys();
    customList.push(newToy);
    saveCustomToys(customList);

    // Automatisch direkt im Schrank aktivieren
    var owned = getOwnedToyIds();
    if (owned.indexOf(newId) === -1) {
      owned.push(newId);
      saveOwnedToyIds(owned);
    }

    toggleNewToyForm(false);
    renderToyManagementGrid();
    showToast("✨ „" + name + "“ angelegt & im Schrank aktiviert!");
  }

  function deleteCustomToy(toyId, e) {
    if (e && e.stopPropagation) e.stopPropagation();

    var customList = getCustomToys();
    var found = customList.find(function(i) { return i.id === toyId; });
    var toyName = found ? found.name : "dieses Toy";

    if (!window.confirm("Möchtest du „" + toyName + "“ wirklich dauerhaft aus dem Katalog löschen?")) {
      return;
    }

    customList = customList.filter(function(i) { return i.id !== toyId; });
    saveCustomToys(customList);

    // Aus den aktiven IDs entfernen
    var owned = getOwnedToyIds();
    owned = owned.filter(function(id) { return id !== toyId; });
    saveOwnedToyIds(owned);

    // Aus globalem Katalog entfernen
    if (window.equipmentCatalog) {
      window.equipmentCatalog = window.equipmentCatalog.filter(function(i) { return i.id !== toyId; });
    }

    renderToyManagementGrid();
    showToast("„" + toyName + "“ gelöscht 🗑️");
  }

  // ==========================================
  // RENDER GRID (LESBAR, GROSSZÜGIG, MEHRZEILIG)
  // ==========================================

  function renderToyManagementGrid() {
    var grid = document.getElementById('toy-management-grid');
    var countEl = document.getElementById('toy-management-active-count');
    var catalog = getCombinedCatalog();
    var owned = getOwnedToyIds();
    if (!grid) return;

    if (catalog.length === 0) {
      grid.innerHTML = '<div class="col-span-1 sm:col-span-2 p-6 text-center text-slate-500 italic theme-panel rounded-2xl border">Lade Ausrüstungskatalog...</div>';
      return;
    }

    // 1. Kategoriefilter anwenden
    var filtered = (currentCategory === 'all')
      ? catalog
      : catalog.filter(function(i) { return i.category === currentCategory; });

    // 2. Suchbegriff anwenden
    if (searchQuery) {
      filtered = filtered.filter(function(i) {
        var n = (i.name || '').toLowerCase();
        var d = (i.desc || '').toLowerCase();
        return n.indexOf(searchQuery) !== -1 || d.indexOf(searchQuery) !== -1;
      });
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-1 sm:col-span-2 p-6 text-center text-slate-400 italic theme-panel rounded-2xl border space-y-2">
          <span class="text-2xl block">🔍</span>
          <p>Keine passenden Gegenstände gefunden.</p>
          <button type="button" onclick="HubToys.toggleNewToyForm(true)" class="px-3 py-1.5 rounded-xl bg-purple-900 border border-purple-700 text-purple-200 font-bold text-xs touch-btn">
            + Jetzt als neues Toy anlegen
          </button>
        </div>
      `;
      if (countEl) countEl.innerText = owned.length;
      return;
    }

    // Sortierung: Eigene Toys zuerst, dann aktive, dann alphabetisch
    filtered.sort(function(a, b) {
      var isOwnA = a.isCustom ? 1 : 0;
      var isOwnB = b.isCustom ? 1 : 0;
      if (isOwnA !== isOwnB) return isOwnB - isOwnA;

      var isActA = owned.indexOf(a.id) !== -1 ? 1 : 0;
      var isActB = owned.indexOf(b.id) !== -1 ? 1 : 0;
      if (isActA !== isActB) return isActB - isActA;

      return (a.name || '').localeCompare(b.name || '');
    });

    grid.innerHTML = filtered.map(function(item) {
      var isOwned = owned.indexOf(item.id) !== -1;
      var isCustom = !!item.isCustom;

      var cardBorderClass = isOwned
        ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/50'
        : 'theme-panel border-slate-800 hover:border-slate-700';

      var badgeBg = isCustom
        ? 'bg-amber-950 text-amber-300 border-amber-800'
        : 'bg-slate-900 text-slate-400 border-slate-800';

      return `
        <div onclick="HubToys.toggleOwned('${item.id}')" class="p-3.5 rounded-2xl border flex flex-col justify-between gap-2.5 cursor-pointer touch-btn transition-all ${cardBorderClass}">
          <!-- TITEL & STATUS -->
          <div class="space-y-1">
            <div class="flex items-start justify-between gap-2">
              <strong class="text-xs sm:text-sm font-extrabold text-white leading-snug break-words flex-1">
                ${escapeHtml(item.name)}
              </strong>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                ${isCustom ? `
                  <button type="button" onclick="HubToys.deleteCustom('${item.id}', event)" class="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition touch-btn" title="Dieses eigene Toy dauerhaft löschen">
                    🗑️
                  </button>
                ` : ''}
                <div class="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${isOwned ? 'bg-purple-600 text-white shadow-sm' : 'theme-panel text-slate-600 border border-slate-800'}">
                  ${isOwned ? '✓' : '○'}
                </div>
              </div>
            </div>

            <!-- MEHRZEILIGE BESCHREIBUNG -->
            <p class="text-[11px] text-slate-300 leading-relaxed font-normal pt-0.5">
              ${escapeHtml(item.desc || '')}
            </p>
          </div>

          <!-- KATEGORIE-TAG & STATUS -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
            <span class="px-2 py-0.5 rounded border font-semibold ${badgeBg}">
              ${isCustom ? '⭐ Eigenes Toy' : (CATEGORY_LABELS[item.category] || item.category)}
            </span>
            <span class="font-bold ${isOwned ? 'text-purple-300' : 'text-slate-500'}">
              ${isOwned ? 'Im Schrank bereit ✓' : 'Nicht aktiviert'}
            </span>
          </div>
        </div>
      `;
    }).join('');

    if (countEl) countEl.innerText = owned.length;
  }

  window.HubToys = {
    open: openToyManagementModal,
    close: closeToyManagementModal,
    filterCategory: filterToyManagementCat,
    handleSearch: handleSearch,
    toggleOwned: toggleToyOwned,
    preset: presetToyManagement,
    updateCount: updateHubToyCount,
    getOwnedIds: getOwnedToyIds,
    saveOwnedIds: saveOwnedToyIds,
    promptClearInventory: promptClearInventory,
    cancelClearInventory: cancelClearInventory,
    confirmClearInventory: confirmClearInventory,
    toggleNewToyForm: toggleNewToyForm,
    checkToyNameMatch: checkToyNameMatch,
    activateExistingMatch: activateExistingMatch,
    saveNewCustomToy: saveNewCustomToy,
    deleteCustom: deleteCustomToy
  };

  // Globale Event-Aliase für HTML
  window.openToyManagementModal = openToyManagementModal;
  window.closeToyManagementModal = closeToyManagementModal;
  window.filterToyManagementCat = filterToyManagementCat;
  window.toggleToyOwned = toggleToyOwned;
  window.presetToyManagement = presetToyManagement;
  window.updateHubToyCount = updateHubToyCount;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', function() {
      syncCustomToysToGlobalCatalog();
      updateHubToyCount();
    });
  } else {
    syncCustomToysToGlobalCatalog();
    setTimeout(updateHubToyCount, 50);
  }

})(window);
````
