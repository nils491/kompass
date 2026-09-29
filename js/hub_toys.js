/**
 * js/hub_toys.js
 * PACTUM Spielzeugschrank-, Hardware-Bundle- & Käfig-Verwaltung (Release 3.0 Core Bundle)
 * 
 * Features & Spezifikationen:
 * - Direkte Anbindung an HubPhotos (IndexedDB 1:1 Foto-Tresor mit Kamera-Upload & Thumbnail-Rendering)
 * - Neue Kategorie "chastity" (Keuschheit & Schlösser: Cobra, Viper, HolyTrainer, CherryKeeper, Jailbird, Flat Shield, Belt)
 * - Neue Kategorie "clothing" (Fetisch-Garderobe & Kleidung: Latex Catsuit, High Heels, Korsetts, Lingerie, Halsbänder)
 * - 1-Klick Hardware-Starter-Bundles (Shibari-Basisset, Keuschheits-Einsteiger, BDSM-Lederstarter)
 * - Mengenschalter ('quantity') für gleichartige Ausrüstung (z. B. 8x Juteseil, 5x Siegel)
 * - Volltextsuche und Kategoriefilterung im Noir-Luxury Design-System (1.5px Vektor-Icons, keine Emojis in Buttons)
 * - Strikte Einhaltung: <= 800 Zeilen, keine alert() / confirm() Aufrufe!
 */

(function(window) {
  'use strict';

  let activeCategoryTab = 'all';
  let searchQuery = '';
  let ownedIds = [];
  let itemQuantities = {};

  const STARTER_BUNDLES = [
    {
      id: 'bundle_shibari_starter',
      title: 'Shibari-Basisset',
      desc: '8x Juteseile (6mm geölt), 4x weiche Baumwollseile & EMT-Sicherheitsschere',
      iconSvg: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>`,
      items: [
        { id: 'toy_bundle_jute_rope', name: 'Shibari Juteseil (6mm weichgeölt)', category: 'bondage', quantity: 8, desc: 'Weichgeöltes Naturfaserseil für Takate Kote & Schenkelspreizung' },
        { id: 'toy_bundle_cotton_rope', name: 'Weiche Baumwollseile (Rot)', category: 'bondage', quantity: 4, desc: 'Hautschonende Seile für schnelle Gliedmaßen-Fixierung' },
        { id: 'toy_bundle_shears', name: 'EMT-Sicherheits-Verbandschere', category: 'bondage', quantity: 1, desc: 'Abgerundete Notfallschere zur schnellen Entfesselung' }
      ]
    },
    {
      id: 'bundle_chastity_starter',
      title: 'Keuschheits-Einsteiger',
      desc: 'Cherrykeeper Micro Stub, Cobra 3D-Cage, 5x nummerierte Einweg-Plomben & kSafe',
      iconSvg: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>`,
      items: [
        { id: 'toy_bundle_cherrykeeper', name: 'Cherrykeeper Micro (<= 35mm)', category: 'chastity', quantity: 1, desc: 'Modulares Design, maximale Schaftkompression' },
        { id: 'toy_bundle_cobra_cage', name: 'Kink3D Cobra SLS-Nylon Käfig', category: 'chastity', quantity: 1, desc: 'Atmungsaktiv, hypoallergenes PA12, ergonomischer Dual-Ring' },
        { id: 'toy_bundle_seals', name: 'Nummerierte Sicherheits-Plomben', category: 'chastity', quantity: 5, desc: 'Manipulationssichere Einwegsiegel mit Seriennummer' }
      ]
    },
    {
      id: 'bundle_leather_starter',
      title: 'BDSM-Lederstarter',
      desc: 'Lederflogger, breites Sattelleder-Paddle, weiche Handgelenks-Manschetten & Augenbinde',
      iconSvg: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>`,
      items: [
        { id: 'toy_bundle_leather_flogger', name: 'Schwerer Rindleder-Flogger', category: 'impact', quantity: 1, desc: 'Breite Fransen für dumpfe, wohlige Hitzewellen' },
        { id: 'toy_bundle_leather_cuffs', name: 'Gepolsterte Leder-Handgelenksmanschetten', category: 'bondage', quantity: 1, desc: 'Sichere Arretierung mit weichem Lammfell-Futter' },
        { id: 'toy_bundle_blindfold_silk', name: 'Lichtdichte Seiden-Augenbinde', category: 'sensory', quantity: 1, desc: 'Vollständiger sensorischer Sichtentzug' }
      ]
    }
  ];

  const STANDARD_CHASTITY_ITEMS = [
    { id: 'toy_chastity_cobra', name: 'Kink3D Cobra (SLS-Nylon)', category: 'chastity', desc: 'Offenes Gitter, ultraleicht, ergonomischer Dual-Arc-Ring' },
    { id: 'toy_chastity_viper', name: 'Kink3D Viper (Kompakt)', category: 'chastity', desc: 'Kurzer Zylinder für Träger mit sportlichem Alltag' },
    { id: 'toy_chastity_holytrainer', name: 'HolyTrainer V6 (Bioresin)', category: 'chastity', desc: 'Passt sich bei 36°C Körperwärme seidig der Anatomie an' },
    { id: 'toy_chastity_cherrykeeper', name: 'Cherrykeeper Micro Stub (<= 35mm)', category: 'chastity', desc: 'Minimales Spaltmaß, maximale Erektionsvermeidung' },
    { id: 'toy_chastity_jailbird', name: 'Mature Metal Jailbird (Edelstahl)', category: 'chastity', desc: 'Schwere Metall-Gitterstangen für kompromisslose Hygiene' },
    { id: 'toy_chastity_cb6000', name: 'CB-6000 Polycarbonat', category: 'chastity', desc: 'Robuster Klassiker mit ergonomischen Ring-Segmenten' },
    { id: 'toy_chastity_nun_cage', name: 'Flat Shield (Nun-Cage)', category: 'chastity', desc: 'Flachkäfig ohne Zylinder, 0mm Silhouette unter Kleidung' },
    { id: 'toy_chastity_belt', name: 'Weiblicher Keuschheitsgürtel (Belt)', category: 'chastity', desc: 'Ergonomisches Schutzschild gegen Klitorisstimulation' }
  ];

  const STANDARD_CLOTHING_ITEMS = [
    { id: 'toy_clothing_latex_catsuit', name: 'Latex Catsuit / Ganzanzug', category: 'clothing', desc: 'Zweite Haut mit feinem Silikonglanz und Duftanker' },
    { id: 'toy_clothing_high_heels', name: 'Kniehohe Leder-Plateau-Stiefel', category: 'clothing', desc: 'Machtsymbol: Erhöhter Stand, Fuß-Kuss und Verehrung' },
    { id: 'toy_clothing_corset', name: 'Stahlverstärktes Schnürkorsett', category: 'clothing', desc: 'Aufrechte Haltung und somatische Taillen-Kompression' },
    { id: 'toy_clothing_lingerie', name: 'Hauchdünne Spitzenwäsche / Lingerie', category: 'clothing', desc: 'Zurschaustellung, Scham-Entlastung und visuelle Reize' },
    { id: 'toy_clothing_collar_leash', name: 'Breites Lederhalsband mit Führleine', category: 'clothing', desc: 'Souveränes Eigentums- und Führungszeichen im privaten Raum' }
  ];

  function loadOwnedIds() {
    try {
      const raw = localStorage.getItem('kompass_owned_equipment');
      if (raw) {
        const parsed = JSON.parse(raw);
        ownedIds = Array.isArray(parsed) ? parsed : [];
      } else {
        ownedIds = [];
      }
    } catch (e) {
      console.warn("[PACTUM Toys] Fehler beim Laden von kompass_owned_equipment:", e);
      ownedIds = [];
    }

    try {
      const rawQty = localStorage.getItem('kompass_toy_quantities');
      if (rawQty) {
        itemQuantities = JSON.parse(rawQty) || {};
      } else {
        itemQuantities = {};
      }
    } catch (e) {
      itemQuantities = {};
    }
  }

  function saveState() {
    try {
      localStorage.setItem('kompass_owned_equipment', JSON.stringify(ownedIds));
      localStorage.setItem('kompass_toy_quantities', JSON.stringify(itemQuantities));
    } catch (e) {
      console.warn("[PACTUM Toys] Konnte Ausrüstungsstand nicht sichern:", e);
    }

    if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }
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

  function showToast(message) {
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification(message);
      return;
    }
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = "bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 transition-all pointer-events-auto transform translate-y-2 opacity-0 flex items-center gap-2";
    el.innerHTML = `<span>${escapeHtml(message)}</span>`;
    container.appendChild(el);

    setTimeout(() => el.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
      el.classList.add('opacity-0');
      setTimeout(() => el.remove(), 300);
    }, 2800);
  }

  function getAllCatalogItems() {
    const baseCatalog = (window.equipmentCatalog && Array.isArray(window.equipmentCatalog))
      ? window.equipmentCatalog
      : [];

    let customEquipment = [];
    try {
      const rawCustom = localStorage.getItem('kompass_custom_equipment');
      if (rawCustom) customEquipment = JSON.parse(rawCustom) || [];
    } catch (e) {}

    // Kombinierter Katalog mit Standard-Erweiterungen (Käfige + Garderobe + Custom)
    const combined = [
      ...baseCatalog,
      ...STANDARD_CHASTITY_ITEMS,
      ...STANDARD_CLOTHING_ITEMS,
      ...customEquipment
    ];

    // Deduplizieren anhand der ID
    const seen = new Set();
    const result = [];
    for (const item of combined) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        result.push(item);
      }
    }

    return result;
  }

  function getItemQuantity(id) {
    if (itemQuantities[id] !== undefined && itemQuantities[id] !== null) {
      const q = parseInt(itemQuantities[id], 10);
      return isNaN(q) || q < 1 ? 1 : q;
    }
    return 1;
  }

  function updateQuantity(id, delta) {
    const current = getItemQuantity(id);
    const next = Math.max(1, Math.min(99, current + delta));
    itemQuantities[id] = next;
    saveState();
    renderToysModal();
  }

  function toggleItemOwnership(id) {
    loadOwnedIds();
    const index = ownedIds.indexOf(id);
    if (index !== -1) {
      ownedIds.splice(index, 1);
    } else {
      ownedIds.push(id);
      if (!itemQuantities[id]) {
        itemQuantities[id] = 1;
      }
    }
    saveState();
    renderToysModal();
    if (window.SessionStaging && typeof window.SessionStaging.renderEquipment === 'function') {
      window.SessionStaging.renderEquipment();
    }
  }

  function applyStarterBundle(bundleId) {
    const bundle = STARTER_BUNDLES.find(b => b.id === bundleId);
    if (!bundle) return;

    loadOwnedIds();
    let customEquipment = [];
    try {
      const rawCustom = localStorage.getItem('kompass_custom_equipment');
      if (rawCustom) customEquipment = JSON.parse(rawCustom) || [];
    } catch (e) {}

    for (const item of bundle.items) {
      if (!ownedIds.includes(item.id)) {
        ownedIds.push(item.id);
      }
      itemQuantities[item.id] = item.quantity || 1;

      // Falls noch nicht im Katalog vorhanden, als Custom Item abspeichern
      if (!customEquipment.some(c => c.id === item.id)) {
        customEquipment.push({
          id: item.id,
          name: item.name,
          category: item.category,
          desc: item.desc,
          isBundleItem: true
        });
      }
    }

    try {
      localStorage.setItem('kompass_custom_equipment', JSON.stringify(customEquipment));
    } catch (e) {}

    saveState();
    renderToysModal();
    showToast(`✓ Starter-Bundle „${bundle.title}“ vollständig im Schrank aktiviert`);
  }

  function filterItems(items) {
    return items.filter(item => {
      if (activeCategoryTab !== 'all' && item.category !== activeCategoryTab) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (item.name || '').toLowerCase().includes(query);
        const descMatch = (item.desc || '').toLowerCase().includes(query);
        const catMatch = (item.category || '').toLowerCase().includes(query);
        return nameMatch || descMatch || catMatch;
      }
      return true;
    });
  }

  async function renderPhotoThumbnailForToy(toyId, containerEl) {
    if (!containerEl) return;
    if (!window.HubPhotos || typeof window.HubPhotos.getPhoto !== 'function') {
      containerEl.innerHTML = `<span class="text-slate-600 font-mono text-[10px]">Kein Foto</span>`;
      return;
    }

    try {
      const photoDataUrl = await window.HubPhotos.getPhoto(toyId);
      if (photoDataUrl) {
        containerEl.innerHTML = `
          <div class="relative w-full h-full group/photo rounded-lg overflow-hidden border border-purple-900/50">
            <img src="${photoDataUrl}" alt="Toy Foto" class="w-full h-full object-cover rounded-lg" />
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
              <button type="button" onclick="event.stopPropagation(); HubToys.triggerPhotoCapture('${toyId}')" title="Foto erneuern" class="p-1 rounded bg-slate-800 text-slate-200 hover:text-white text-[10px]">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>
              </button>
              <button type="button" onclick="event.stopPropagation(); HubToys.deleteToyPhoto('${toyId}')" title="Foto löschen" class="p-1 rounded bg-rose-950 text-rose-300 hover:text-rose-100 text-[10px]">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
              </button>
            </div>
          </div>
        `;
      } else {
        containerEl.innerHTML = `
          <button type="button" onclick="event.stopPropagation(); HubToys.triggerPhotoCapture('${toyId}')" title="Foto aufnehmen" class="w-full h-full flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 hover:border-purple-500 bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-purple-300 transition-colors p-1">
            <svg class="w-4 h-4 mb-0.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>
            <span class="text-[9px] font-medium leading-none">Foto</span>
          </button>
        `;
      }
    } catch (err) {
      containerEl.innerHTML = `<span class="text-slate-600 text-[9px]">-</span>`;
    }
  }

  function triggerPhotoCapture(toyId) {
    if (window.HubPhotos && typeof window.HubPhotos.captureForToy === 'function') {
      window.HubPhotos.captureForToy(toyId, () => {
        renderToysModal();
      });
    } else {
      showToast("Foto-Tresor nicht verfügbar.");
    }
  }

  async function deleteToyPhoto(toyId) {
    if (window.HubPhotos && typeof window.HubPhotos.deletePhoto === 'function') {
      await window.HubPhotos.deletePhoto(toyId);
      showToast("Foto gelöscht");
      renderToysModal();
    }
  }

  function renderToysModal() {
    loadOwnedIds();
    const container = document.getElementById('toys-modal-items-container');
    const badgeCount = document.getElementById('toys-modal-active-count');
    const totalCount = document.getElementById('toys-modal-total-count');

    const allItems = getAllCatalogItems();
    const filteredItems = filterItems(allItems);

    if (badgeCount) badgeCount.innerText = ownedIds.length.toString();
    if (totalCount) totalCount.innerText = allItems.length.toString();

    // Render Starter Bundles
    const bundlesContainer = document.getElementById('toys-starter-bundles-container');
    if (bundlesContainer) {
      bundlesContainer.innerHTML = STARTER_BUNDLES.map(bundle => {
        const isFullyOwned = bundle.items.every(it => ownedIds.includes(it.id));
        return `
          <div class="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 flex flex-col justify-between">
            <div class="space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span class="text-purple-400">${bundle.iconSvg}</span>
                  <span>${escapeHtml(bundle.title)}</span>
                </span>
                <span class="text-[9.5px] font-mono px-2 py-0.5 rounded ${isFullyOwned ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'}">
                  ${isFullyOwned ? 'Aktiv ✓' : 'Paket'}
                </span>
              </div>
              <p class="text-[10.5px] text-slate-400 leading-snug">${escapeHtml(bundle.desc)}</p>
            </div>
            <button type="button" onclick="HubToys.applyStarterBundle('${bundle.id}')" class="w-full py-1.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${isFullyOwned ? 'bg-purple-950/60 border-purple-700/60 text-purple-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'}">
              <span>${bundle.iconSvg}</span>
              <span>${isFullyOwned ? 'Bundle neu einstellen' : '1-Klick Bundle aktivieren'}</span>
            </button>
          </div>
        `;
      }).join('');
    }

    if (!container) return;

    if (filteredItems.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-10 text-center space-y-2 text-slate-400">
          <svg class="w-8 h-8 mx-auto text-slate-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
          <strong class="text-xs text-slate-200 block font-bold">Keine Ausrüstung gefunden</strong>
          <p class="text-[11px] text-slate-500">Passe deine Suche an oder wechsle die Kategorie.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredItems.map(item => {
      const isOwned = ownedIds.includes(item.id);
      const qty = getItemQuantity(item.id);

      return `
        <div class="p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${isOwned ? 'bg-purple-950/25 border-purple-700/60 shadow-md' : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'}">
          <div class="flex items-start gap-2.5 min-w-0">
            <!-- 1:1 Foto Thumbnail Container (Aspect Square) -->
            <div id="toy-thumb-${escapeHtml(item.id)}" class="w-14 h-14 aspect-square rounded-xl bg-black/80 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <span class="text-slate-600 text-[10px] animate-pulse">...</span>
            </div>

            <!-- Beschreibung & Titel -->
            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="flex items-center justify-between gap-1">
                <strong class="text-xs text-white block truncate leading-snug">${escapeHtml(item.name)}</strong>
                <button type="button" onclick="HubToys.toggleOwned('${item.id}')" title="Aktivierungs-Status" class="p-1 rounded-lg text-xs font-mono font-bold flex-shrink-0 transition-colors ${isOwned ? 'bg-purple-900/90 text-purple-200 border border-purple-600' : 'bg-slate-800 text-slate-500 border border-slate-700'}">
                  ${isOwned ? '✓ Vorhanden' : '+ Hinzufügen'}
                </button>
              </div>
              <p class="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">${escapeHtml(item.desc || '')}</p>
              <div class="flex items-center gap-1.5 pt-0.5">
                <span class="px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-mono text-[9px] border border-slate-800 uppercase">${escapeHtml(item.category || 'Ausrüstung')}</span>
              </div>
            </div>
          </div>

          <!-- Untere Menüleiste: Mengenschalter & Foto Trigger -->
          <div class="flex items-center justify-between pt-1 border-t border-slate-800/70 text-xs">
            <!-- Mengenschalter -->
            <div class="flex items-center gap-1">
              <span class="text-[10px] text-slate-400 font-mono mr-1">Menge:</span>
              <button type="button" onclick="HubToys.changeQuantity('${item.id}', -1)" ${!isOwned ? 'disabled' : ''} class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-center touch-btn disabled:opacity-40">
                -
              </button>
              <span class="px-2 font-mono text-xs font-bold text-white min-w-[1.5rem] text-center">${qty}</span>
              <button type="button" onclick="HubToys.changeQuantity('${item.id}', 1)" ${!isOwned ? 'disabled' : ''} class="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-center touch-btn disabled:opacity-40">
                +
              </button>
            </div>

            <!-- Kamera Schnellaufruf -->
            <button type="button" onclick="HubToys.triggerPhotoCapture('${item.id}')" class="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-medium text-[10px] flex items-center gap-1 touch-btn shadow-xs">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"/></svg>
              <span>Foto</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    filteredItems.forEach(item => {
      const thumbBox = document.getElementById(`toy-thumb-${item.id}`);
      if (thumbBox) {
        renderPhotoThumbnailForToy(item.id, thumbBox);
      }
    });
  }

  function switchCategoryTab(category) {
    activeCategoryTab = category;
    const tabButtons = document.querySelectorAll('[data-toy-cat-tab]');
    tabButtons.forEach(btn => {
      const cat = btn.getAttribute('data-toy-cat-tab');
      if (cat === category) {
        btn.className = "px-3 py-1.5 rounded-xl font-bold text-xs bg-purple-700 text-white shadow-sm whitespace-nowrap transition-colors";
      } else {
        btn.className = "px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 whitespace-nowrap transition-colors";
      }
    });
    renderToysModal();
  }

  function handleSearchInput(query) {
    searchQuery = query || '';
    renderToysModal();
  }

  function openCustomItemModal() {
    const modal = document.getElementById('modal-add-custom-toy');
    if (modal) modal.style.display = 'flex';
  }

  function closeCustomItemModal() {
    const modal = document.getElementById('modal-add-custom-toy');
    if (modal) modal.style.display = 'none';
  }

  function saveCustomItem() {
    const nameInput = document.getElementById('input-custom-toy-name');
    const catSelect = document.getElementById('select-custom-toy-cat');
    const descInput = document.getElementById('input-custom-toy-desc');

    const name = nameInput ? nameInput.value.trim() : '';
    const cat = catSelect ? catSelect.value : 'household';
    const desc = descInput ? descInput.value.trim() : '';

    if (!name) {
      showToast("Bitte gib dem Gegenstand einen Namen.");
      return;
    }

    const newItem = {
      id: `custom_toy_${Date.now()}`,
      name: name,
      category: cat,
      desc: desc || 'Eigenanschaffung',
      isCustom: true
    };

    let customEquipment = [];
    try {
      const rawCustom = localStorage.getItem('kompass_custom_equipment');
      if (rawCustom) customEquipment = JSON.parse(rawCustom) || [];
    } catch (e) {}

    customEquipment.push(newItem);
    try {
      localStorage.setItem('kompass_custom_equipment', JSON.stringify(customEquipment));
    } catch (e) {}

    // Automatisch in den Besitz aufnehmen
    loadOwnedIds();
    ownedIds.push(newItem.id);
    itemQuantities[newItem.id] = 1;
    saveState();

    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    closeCustomItemModal();
    renderToysModal();
    showToast(`✓ „${newItem.name}“ erfolgreich zum Schrank hinzugefügt`);
  }

  function openToysModal() {
    const modal = document.getElementById('modal-toys-inventory');
    if (modal) {
      modal.style.display = 'flex';
      renderToysModal();
    }
  }

  function closeToysModal() {
    const modal = document.getElementById('modal-toys-inventory');
    if (modal) {
      modal.style.display = 'none';
    }
    if (window.SessionStaging && typeof window.SessionStaging.renderEquipment === 'function') {
      window.SessionStaging.renderEquipment();
    }
  }

  window.HubToys = {
    init: function() {
      loadOwnedIds();
    },
    open: openToysModal,
    close: closeToysModal,
    render: renderToysModal,
    toggleOwned: toggleItemOwnership,
    changeQuantity: updateQuantity,
    applyStarterBundle: applyStarterBundle,
    switchCategoryTab: switchCategoryTab,
    handleSearch: handleSearchInput,
    openCustomModal: openCustomItemModal,
    closeCustomModal: closeCustomItemModal,
    saveCustomItem: saveCustomItem,
    triggerPhotoCapture: triggerPhotoCapture,
    deleteToyPhoto: deleteToyPhoto,
    getOwnedIds: function() {
      loadOwnedIds();
      return ownedIds;
    },
    getItemQuantity: getItemQuantity
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadOwnedIds();
    });
  } else {
    loadOwnedIds();
  }

})(window);
