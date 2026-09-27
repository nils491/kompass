/**
 * js/hub_toys.js
 * Modul für die Toy-Verwaltung ("Unser Schrank") im Start-Hub.
 * 
 * UX-Redesign & Performance-Architektur:
 * - Keine überlagernden Texte, keine abgeschnittenen Titel
 * - Klares, responsives Kartendesign mit Checkbox, Kategorie-Badge und Volltext
 * - Live-Autoabgleich: Erkennt beim Tippen, ob der Gegenstand bereits im Gesamtkatalog existiert
 * - Papierkorb 🗑️ für selbst angelegte Toys mit Inline-Sicherheitsabfrage
 * - Sicherheitsabfrage vor dem Leeren des gesamten Schrank-Inventars
 * - Vollständige Synchronisation mit der Cloud & Bereitstellung für die Regie
 */

(function(window) {
  'use strict';

  var currentCategory = 'all';
  var searchQuery = '';
  var isNewToyFormOpen = false;

  var CATEGORY_CONFIG = {
    household: { label: 'Haushalt & Improvisation', icon: '🏠' },
    bondage: { label: 'Fesselung & Seile', icon: '⛓️' },
    impact: { label: 'Impact & Spanking', icon: '✋' },
    sensory: { label: 'Sensorik & Masken', icon: '🙈' },
    cbt_clamps: { label: 'CBT & Klammern', icon: '⚡' },
    toys_anal: { label: 'Toys & Anal', icon: '🍑' },
    special: { label: 'Spezial & Fetisch', icon: '🕯️' }
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

    var countEl = document.getElementById('toy-management-active-count');
    if (countEl) countEl.innerText = ids.length;

    renderCategoryChips();
  }

  function openToyManagementModal() {
    var modal = document.getElementById('modal-toy-management');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
    cancelClearInventory();
    syncCustomToysToGlobalCatalog();
    renderCategoryChips();
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
    renderCategoryChips();
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
      btn.innerHTML = isNewToyFormOpen 
        ? "<span>✕</span><span>Schließen</span>" 
        : "<span>+</span><span>Neues Toy</span>";
    }
  }

  function checkToyNameMatch(enteredName) {
    var box = document.getElementById('toy-match-feedback-box');
    if (!box) return;

    var clean = (enteredName || '').toLowerCase().trim();
    if (clean.length < 2) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }

    var catalog = getCombinedCatalog();
    var owned = getOwnedToyIds();

    var matches = catalog.filter(function(item) {
      var n = (item.name || '').toLowerCase();
      var d = (item.desc || '').toLowerCase();
      return n.indexOf(clean) !== -1 || clean.indexOf(n) !== -1 || d.indexOf(clean) !== -1;
    });

    if (matches.length > 0) {
      var best = matches[0];
      var isAlreadyActive = owned.indexOf(best.id) !== -1;
      var catInfo = CATEGORY_CONFIG[best.category] || { label: best.category, icon: '📦' };

      box.className = isAlreadyActive 
        ? "p-3 rounded-2xl border bg-emerald-950/40 border-emerald-700/80 text-emerald-200 text-xs space-y-1.5"
        : "p-3 rounded-2xl border bg-amber-950/40 border-amber-700/80 text-amber-200 text-xs space-y-1.5";

      box.innerHTML = `
        <div class="flex items-start justify-between gap-2.5">
          <div class="space-y-0.5">
            <strong class="block text-xs font-bold ${isAlreadyActive ? 'text-emerald-300' : 'text-amber-300'}">
              ${isAlreadyActive ? '✓ Bereits in eurem Schrank aktiv:' : '💡 Schon im Gesamtkatalog vorhanden:'}
            </strong>
            <span class="text-white font-extrabold block text-xs">„${escapeHtml(best.name)}“</span>
            <span class="text-[10.5px] text-slate-400 block">${catInfo.icon} ${escapeHtml(catInfo.label)} · ${escapeHtml(best.desc || '')}</span>
          </div>
          ${!isAlreadyActive ? `
            <button type="button" onclick="HubToys.activateExistingMatch('${best.id}')" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs flex-shrink-0 shadow-md transition">
              Diesen aktivieren ✓
            </button>
          ` : `
            <span class="px-2 py-0.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px] flex-shrink-0">
              Bereits aktiv
            </span>
          `}
        </div>
      `;
      box.classList.remove('hidden');
    } else {
      box.className = "p-2.5 rounded-2xl border bg-purple-950/30 border-purple-800/80 text-purple-200 text-xs flex items-center justify-between";
      box.innerHTML = `
        <span>✨ <strong>Noch nicht im Katalog:</strong> Wird als neues Spielzeug angelegt.</span>
        <span class="text-purple-300 font-mono text-[10px] font-bold">Neu</span>
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
      desc: desc || "Individuell hinzugefügter Gegenstand.",
      chapters: [13, 16],
      defaultPresent: true,
      isCustom: true
    };

    var customList = getCustomToys();
    customList.push(newToy);
    saveCustomToys(customList);

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

    customList = customList.filter(function(i) { return i.id !== toyId; });
    saveCustomToys(customList);

    var owned = getOwnedToyIds();
    owned = owned.filter(function(id) { return id !== toyId; });
    saveOwnedToyIds(owned);

    if (window.equipmentCatalog) {
      window.equipmentCatalog = window.equipmentCatalog.filter(function(i) { return i.id !== toyId; });
    }

    renderToyManagementGrid();
    showToast("„" + toyName + "“ gelöscht 🗑️");
  }

  function renderCategoryChips() {
    var container = document.getElementById('toy-category-chips-container');
    if (!container) return;

    var catalog = getCombinedCatalog();
    var owned = getOwnedToyIds();

    var categories = [
      { id: 'all', label: 'Alle', icon: '✨' },
      { id: 'household', label: 'Haushalt', icon: '🏠' },
      { id: 'bondage', label: 'Fesselung', icon: '⛓️' },
      { id: 'impact', label: 'Impact', icon: '✋' },
      { id: 'sensory', label: 'Sensorik', icon: '🙈' },
      { id: 'cbt_clamps', label: 'CBT', icon: '⚡' },
      { id: 'toys_anal', label: 'Toys', icon: '🍑' },
      { id: 'special', label: 'Spezial', icon: '🕯️' }
    ];

    container.innerHTML = categories.map(function(cat) {
      var count = (cat.id === 'all')
        ? catalog.length
        : catalog.filter(function(i) { return i.category === cat.id; }).length;

      var activeInCat = (cat.id === 'all')
        ? owned.length
        : catalog.filter(function(i) { return i.category === cat.id && owned.indexOf(i.id) !== -1; }).length;

      var isSelected = (currentCategory === cat.id);

      var btnClass = isSelected
        ? 'bg-purple-700 text-white font-black shadow-md border-purple-500'
        : 'bg-slate-900/90 text-slate-300 font-semibold border-slate-800 hover:border-slate-700 hover:text-white';

      return `
        <button type="button" onclick="HubToys.filterCategory('${cat.id}')" class="px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 ${btnClass}">
          <span>${cat.icon}</span>
          <span>${cat.label}</span>
          <span class="text-[10px] font-mono px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-purple-900 text-purple-200' : 'bg-slate-800 text-slate-400'}">
            ${activeInCat}/${count}
          </span>
        </button>
      `;
    }).join('');
  }

  function renderToyManagementGrid() {
    var grid = document.getElementById('toy-management-grid');
    var catalog = getCombinedCatalog();
    var owned = getOwnedToyIds();
    if (!grid) return;

    if (catalog.length === 0) {
      grid.innerHTML = '<div class="col-span-full p-8 text-center text-slate-400 italic bg-slate-900/50 rounded-2xl border border-slate-800">Lade Ausrüstungskatalog...</div>';
      return;
    }

    var filtered = (currentCategory === 'all')
      ? catalog
      : catalog.filter(function(i) { return i.category === currentCategory; });

    if (searchQuery) {
      filtered = filtered.filter(function(i) {
        var n = (i.name || '').toLowerCase();
        var d = (i.desc || '').toLowerCase();
        return n.indexOf(searchQuery) !== -1 || d.indexOf(searchQuery) !== -1;
      });
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full p-8 text-center text-slate-400 italic bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
          <span class="text-3xl block">🔍</span>
          <p class="text-xs">Keine passenden Gegenstände gefunden.</p>
          <button type="button" onclick="HubToys.toggleNewToyForm(true)" class="px-4 py-2 rounded-xl bg-purple-900 border border-purple-700 text-purple-200 font-bold text-xs shadow-md">
            + Jetzt als neues Toy anlegen
          </button>
        </div>
      `;
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
      var catInfo = CATEGORY_CONFIG[item.category] || { label: item.category, icon: '📦' };

      var cardBorderClass = isOwned
        ? 'bg-purple-950/30 border-purple-500/70 shadow-lg ring-1 ring-purple-500/40'
        : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700';

      return `
        <div onclick="HubToys.toggleOwned('${item.id}')" class="p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between gap-3 cursor-pointer transition-all hover:scale-[1.005] select-none ${cardBorderClass}">
          <!-- HEADER & TITEL -->
          <div class="space-y-1.5">
            <div class="flex items-start justify-between gap-2.5">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${isCustom ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-800 text-slate-300'}">
                    ${isCustom ? '⭐ Eigenes Toy' : (catInfo.icon + ' ' + catInfo.label)}
                  </span>
                  ${isOwned ? `
                    <span class="text-[10px] font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-800/60">
                      Im Schrank ✓
                    </span>
                  ` : ''}
                </div>
                <h4 class="text-xs sm:text-sm font-extrabold text-white leading-snug break-words">
                  ${escapeHtml(item.name)}
                </h4>
              </div>

              <!-- TOGGLE CHECKBOX & DELETE -->
              <div class="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                ${isCustom ? `
                  <button type="button" onclick="HubToys.deleteCustom('${item.id}', event)" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 flex items-center justify-center transition" title="Dieses Toy dauerhaft löschen">
                    🗑️
                  </button>
                ` : ''}
                <div class="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${isOwned ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 border border-slate-700 text-slate-500'}">
                  ${isOwned ? '✓' : ''}
                </div>
              </div>
            </div>

            <!-- BESCHREIBUNG -->
            <p class="text-[11px] text-slate-300 leading-relaxed font-normal">
              ${escapeHtml(item.desc || '')}
            </p>
          </div>

          <!-- FOOTER STATUS ZEILE -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
            <span class="text-slate-400 font-medium">Antippen zum Umschalten</span>
            <span class="font-extrabold ${isOwned ? 'text-purple-300' : 'text-slate-500'}">
              ${isOwned ? 'Aktiviert für Regie' : 'Deaktiviert'}
            </span>
          </div>
        </div>
      `;
    }).join('');
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
