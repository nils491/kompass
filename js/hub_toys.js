/**
 * js/hub_toys.js
 * Modul für die Toy-Verwaltung ("Unser Schrank") im Start-Hub.
 * 
 * Verwaltet den real vorhandenen Spielzeug- und Ausrüstungsbestand,
 * Kategoriefilter und Schnellwahl-Presets.
 */

(function(window) {
  'use strict';

  var currentCategory = 'all';

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
    var catalog = window.equipmentCatalog || [];
    return catalog.filter(function(i) { return i.defaultPresent; }).map(function(i) { return i.id; });
  }

  function saveOwnedToyIds(ids) {
    try {
      var safeIds = Array.isArray(ids) ? ids : [];
      localStorage.setItem('kompass_active_equipment_ids', JSON.stringify(safeIds));
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
    renderToyManagementGrid();
    var modal = document.getElementById('modal-toy-management');
    if (modal) modal.classList.remove('hidden');
  }

  function closeToyManagementModal() {
    var modal = document.getElementById('modal-toy-management');
    if (modal) modal.classList.add('hidden');
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

  function presetToyManagement(preset) {
    var catalog = window.equipmentCatalog || [];
    var ids = [];

    if (preset === 'all') {
      ids = catalog.map(function(i) { return i.id; });
      showToast("Alle Gegenstände im Schrank aktiviert ✓");
    } else if (preset === 'household_only') {
      ids = catalog.filter(function(i) { return i.category === 'household'; }).map(function(i) { return i.id; });
      showToast("Nur Haushaltsgegenstände aktiviert ✓");
    } else {
      ids = [];
      showToast("Toy-Inventar geleert 🗑️");
    }

    saveOwnedToyIds(ids);
    renderToyManagementGrid();
  }

  function renderToyManagementGrid() {
    var grid = document.getElementById('toy-management-grid');
    var countEl = document.getElementById('toy-management-active-count');
    var catalog = window.equipmentCatalog || [];
    var owned = getOwnedToyIds();
    if (!grid) return;

    if (catalog.length === 0) {
      grid.innerHTML = '<div class="col-span-2 p-6 text-center text-slate-500 italic theme-panel rounded-2xl border">Lade Ausrüstungskatalog...</div>';
      return;
    }

    var filtered = (currentCategory === 'all')
      ? catalog
      : catalog.filter(function(i) { return i.category === currentCategory; });

    grid.innerHTML = filtered.map(function(item) {
      var isOwned = owned.indexOf(item.id) !== -1;
      var activeClass = isOwned
        ? 'bg-purple-950/40 border-purple-500 text-white font-bold'
        : 'theme-panel border-slate-800 text-slate-400 hover:border-slate-700';
      var checkClass = isOwned
        ? 'bg-purple-600 text-white shadow-xs'
        : 'theme-panel text-slate-600 border border-slate-800';

      return `
        <div onclick="HubToys.toggleOwned('${item.id}')" class="p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer touch-btn transition-all ${activeClass}">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="text-xs truncate">${escapeHtml(item.name)}</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 flex-shrink-0">Kap. ${item.chapters ? item.chapters.join(', ') : ''}</span>
            </div>
            <p class="text-[10px] text-slate-400 mt-0.5 truncate font-normal">${escapeHtml(item.desc)}</p>
          </div>
          <div class="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${checkClass}">
            ${isOwned ? '✓' : '○'}
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
    toggleOwned: toggleToyOwned,
    preset: presetToyManagement,
    updateCount: updateHubToyCount,
    getOwnedIds: getOwnedToyIds,
    saveOwnedIds: saveOwnedToyIds
  };

  window.openToyManagementModal = openToyManagementModal;
  window.closeToyManagementModal = closeToyManagementModal;
  window.filterToyManagementCat = filterToyManagementCat;
  window.toggleToyOwned = toggleToyOwned;
  window.presetToyManagement = presetToyManagement;
  window.updateHubToyCount = updateHubToyCount;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', updateHubToyCount);
  } else {
    setTimeout(updateHubToyCount, 50);
  }

})(window);
