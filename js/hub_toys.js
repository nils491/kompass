/**
 * js/hub_toys.js
 * Modul für die Verwaltung des gemeinsamen Spielzeugschranks im Kink- & Beziehungs-Kompass.
 * 
 * Features:
 * - Vollständige Inventarisierung aus Katalog und eigenen Anschaffungen
 * - Schnelle Kategoriefilterung & Echtzeit-Volltextsuche
 * - 1-Tap Aktivierung/Deaktivierung für das Nachttisch-Staging
 * - Automatische Synchronisation mit der Cloud & Session-Regie
 * - Zeilenlimit: Kompakt und weit unter 450 Zeilen
 */

(function(window) {
  'use strict';

  var activeCategoryTab = 'all';
  var searchQuery = '';
  var ownedIds = [];

  function loadOwnedIds() {
    try {
      var raw = localStorage.getItem('kompass_active_equipment_ids');
      if (raw) {
        ownedIds = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Fehler beim Laden von kompass_active_equipment_ids:", e);
    }
    if (!Array.isArray(ownedIds)) ownedIds = [];
    return ownedIds;
  }

  function saveOwnedIds() {
    try {
      localStorage.setItem('kompass_active_equipment_ids', JSON.stringify(ownedIds));
    } catch (e) {
      console.warn("Fehler beim Speichern von kompass_active_equipment_ids:", e);
    }
    if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }
    updateClosetBadgeCount();
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

  function showToast(msg) {
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification(msg);
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

  function getAllEquipmentItems() {
    var base = window.equipmentCatalog || [];
    var custom = [];
    try {
      var raw = localStorage.getItem('kompass_custom_equipment');
      if (raw) custom = JSON.parse(raw);
    } catch (e) {}
    if (!Array.isArray(custom)) custom = [];
    return base.concat(custom);
  }

  function updateClosetBadgeCount() {
    loadOwnedIds();
    var all = getAllEquipmentItems();
    var count = ownedIds.length;

    var badge = document.getElementById('hub-equipment-count-badge');
    if (badge) badge.innerText = count + " / " + all.length;

    var modalCount = document.getElementById('modal-closet-active-count');
    if (modalCount) modalCount.innerText = count.toString();
  }

  function renderEquipmentModal() {
    loadOwnedIds();
    var container = document.getElementById('hub-equipment-grid-container');
    if (!container) return;

    var all = getAllEquipmentItems();

    // Zähler je Kategorie aktualisieren
    var counts = {
      all: all.length,
      household: 0,
      bondage: 0,
      impact: 0,
      sensory: 0,
      cbt_clamps: 0,
      toys_anal: 0,
      special: 0
    };

    all.forEach(function(item) {
      if (counts[item.category] !== undefined) counts[item.category]++;
    });

    for (var cat in counts) {
      var countEl = document.getElementById('closet-count-' + cat);
      if (countEl) countEl.innerText = counts[cat].toString();
    }

    var cleanQuery = (searchQuery || '').toLowerCase().trim();

    var filtered = all.filter(function(item) {
      if (activeCategoryTab !== 'all' && item.category !== activeCategoryTab) {
        return false;
      }
      if (cleanQuery) {
        var nameMatch = (item.name || '').toLowerCase().indexOf(cleanQuery) !== -1;
        var descMatch = (item.desc || '').toLowerCase().indexOf(cleanQuery) !== -1;
        if (!nameMatch && !descMatch) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-6 text-center text-slate-400 theme-panel rounded-2xl border border-slate-800 text-xs space-y-1.5">
          <span class="text-xl block">🔍</span>
          <strong class="text-white block">Keine Gegenstände gefunden</strong>
          <span class="text-[11px] text-slate-500">Passe deine Suche an oder lege oben eine Neuanschaffung an.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(function(item) {
      var isOwned = ownedIds.indexOf(item.id) !== -1;
      return `
        <div onclick="HubToys.toggleOwned('${item.id}')" class="p-3 rounded-2xl border text-left cursor-pointer transition touch-btn flex items-center justify-between gap-2.5 ${isOwned ? 'bg-purple-950/60 border-purple-500 shadow-md' : 'theme-panel border-slate-800 text-slate-400 hover:border-slate-700'}">
          <div class="truncate min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <strong class="text-xs text-white block truncate">${escapeHtml(item.name)}</strong>
              ${item.isCustom ? '<span class="text-[9px] px-1 rounded bg-purple-900 text-purple-200 font-bold flex-shrink-0">Eigener</span>' : ''}
            </div>
            <span class="text-[10px] text-slate-400 block truncate mt-0.5">${escapeHtml(item.desc || '')}</span>
          </div>
          <span class="text-sm font-mono font-black flex-shrink-0 ${isOwned ? 'text-purple-300' : 'text-slate-600'}">
            ${isOwned ? '✓' : '○'}
          </span>
        </div>
      `;
    }).join('');
  }

  function toggleToyOwnership(toyId) {
    loadOwnedIds();
    var idx = ownedIds.indexOf(toyId);
    if (idx !== -1) {
      ownedIds.splice(idx, 1);
      showToast("Aus unserem Schrank entfernt");
    } else {
      ownedIds.push(toyId);
      showToast("Im Schrank aktiviert ✓");
    }
    saveOwnedIds();
    renderEquipmentModal();

    if (window.SessionStaging && typeof window.SessionStaging.renderEquipment === 'function') {
      window.SessionStaging.renderEquipment();
    }
  }

  function switchCategoryTab(tabName) {
    activeCategoryTab = tabName;
    ['all', 'household', 'bondage', 'impact', 'sensory', 'cbt_clamps', 'toys_anal', 'special'].forEach(function(t) {
      var btn = document.getElementById('btn-closet-tab-' + t);
      if (btn) {
        if (t === tabName) {
          btn.className = "px-3 py-1.5 rounded-xl text-[10.5px] font-bold bg-brand-700 text-white touch-btn whitespace-nowrap shadow-sm";
        } else {
          btn.className = "px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold theme-panel text-slate-300 touch-btn whitespace-nowrap";
        }
      }
    });
    renderEquipmentModal();
  }

  function handleSearchInput(val) {
    searchQuery = (val || '').trim();
    renderEquipmentModal();
  }

  function openAddCustomItem() {
    var p = document.getElementById('closet-custom-item-panel');
    if (p) p.classList.remove('hidden');
  }

  function closeAddCustomItem() {
    var p = document.getElementById('closet-custom-item-panel');
    if (p) p.classList.add('hidden');
  }

  function saveCustomItem() {
    var nameInput = document.getElementById('closet-custom-name');
    var catSelect = document.getElementById('closet-custom-cat');
    var descInput = document.getElementById('closet-custom-desc');

    var nameVal = (nameInput ? nameInput.value : '').trim();
    var catVal = (catSelect ? catSelect.value : 'household');
    var descVal = (descInput ? descInput.value : '').trim();

    if (!nameVal) {
      showToast("Bitte gib dem Gegenstand einen Namen.");
      return;
    }

    var newItem = {
      id: "toy_custom_" + Date.now(),
      name: nameVal,
      category: catVal,
      desc: descVal || "Individuelle Anschaffung",
      isCustom: true
    };

    var custom = [];
    try {
      var raw = localStorage.getItem('kompass_custom_equipment');
      if (raw) custom = JSON.parse(raw);
    } catch (e) {}
    if (!Array.isArray(custom)) custom = [];

    custom.push(newItem);
    localStorage.setItem('kompass_custom_equipment', JSON.stringify(custom));

    loadOwnedIds();
    ownedIds.push(newItem.id);
    saveOwnedIds();

    closeAddCustomItem();
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';

    renderEquipmentModal();
    showToast("✓ Neuanschaffung '" + nameVal + "' im Schrank angelegt!");

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent("🧰 Neues Toy im Schrank angelegt: „" + nameVal + "“");
    }
  }

  function openModal() {
    var m = document.getElementById('modal-equipment');
    if (m) {
      m.style.display = 'flex';
      m.classList.remove('hidden');
    }
    renderEquipmentModal();
    updateClosetBadgeCount();
  }

  function closeModal() {
    var m = document.getElementById('modal-equipment');
    if (m) {
      m.style.display = 'none';
      m.classList.add('hidden');
    }
  }

  function selectPreset(preset) {
    var all = getAllEquipmentItems();
    if (preset === 'all') {
      ownedIds = all.map(function(item) { return item.id; });
      showToast("Alle Gegenstände im Schrank aktiviert ✨");
    } else if (preset === 'none') {
      ownedIds = [];
      showToast("Alle Gegenstände deaktiviert");
    } else if (preset === 'essentials') {
      // Haushaltsmittel + Hände
      var essentials = all.filter(function(i) {
        return i.category === 'household' || (i.name && (i.name.indexOf('Hand') !== -1 || i.name.indexOf('Gürtel') !== -1));
      });
      ownedIds = essentials.map(function(i) { return i.id; });
      showToast("Basis-Ausstattung aktiviert 🏠");
    }
    saveOwnedIds();
    renderEquipmentModal();
  }

  window.HubToys = {
    open: openModal,
    close: closeModal,
    render: renderEquipmentModal,
    toggleOwned: toggleToyOwnership,
    switchTab: switchCategoryTab,
    handleSearch: handleSearchInput,
    openAddCustom: openAddCustomItem,
    closeAddCustom: closeAddCustomItem,
    saveCustom: saveCustomItem,
    selectPreset: selectPreset,
    updateCount: updateClosetBadgeCount,
    getOwnedIds: loadOwnedIds
  };

  window.openEquipmentModal = openModal;
  window.closeEquipmentModal = closeModal;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', updateClosetBadgeCount);
  } else {
    updateClosetBadgeCount();
  }

})(window);
