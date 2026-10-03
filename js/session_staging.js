/**
 * js/session_staging.js
 * TACTUS Schlafzimmer-Staging Cockpit, 3-Schritte-Vorbereitung & KI-Playbook (V3.0 Haute-Horlogerie)
 * Offizielle Web-Präsenz: tactus.digital
 * 
 * TACTUS FEATURE CONTRACT:
 * [✓] Strikte Terminologie: Ausschließlich "Edge", "Edges", "Edging" (Keine "Kanten" / "Schwellen"!)
 * [✓] Echte Gemini-Stimmführung via SessionVoice.play()
 * [✓] 3-Schritte-Vorbereitung (Rollen-Setup -> Nachttisch-Staging -> Modus & Drehbuch)
 * [✓] Top-Energie (1–5) & Bottom-Hingabe (1–5) Slider mit somatischen Beschreibungen
 * [✓] Schrank-Filterung & Quick-Add für Neuanschaffungen direkt auf den Nachttisch
 * [✓] Stimmen-Probehören (5s Live-Sample) & Zucht-Preset (Enceladus)
 * [✓] 4-Phasen-Drehbuch mit 8 Schritten & generativem Gemini KI-Zuschnitt auf Schrank-Toys
 * [✓] Strikte anatomische Kompatibilität (Vulva vs. Penis)
 * [✓] 100 % UTF-8 Integrität, Haute-Horlogerie Design tokens, keine window.alert() Aufrufe
 */

(function(window) {
  'use strict';

  const STORAGE_KEY_NAMES = 'kompass_names';
  const STORAGE_KEY_ANATOMY = 'kompass_anatomy';
  const STORAGE_KEY_STAGED_IDS = 'kompass_staged_tonight_ids';
  const STORAGE_KEY_STAGING_BUNDLE = 'tactus_staging_bundle';
  const STORAGE_KEY_CUSTOM_EQUIPMENT = 'kompass_custom_equipment';
  const STORAGE_KEY_API_KEY = 'tactus_ai_custom_key';
  const STORAGE_KEY_API_KEY_LEGACY = 'kompass_gemini_api_key';
  const STORAGE_KEY_GEMINI_MODEL = 'tactus_gemini_active_model';
  const STORAGE_KEY_VOICE_ACTIVE = 'kompass_voice_assist_active';
  const STORAGE_KEY_VOICE_NAME = 'kompass_session_voice';

  let topPartner = 'B';
  let subPartner = 'A';
  let energyTop = 4;
  let energySub = 4;
  let sessionDepth = 7;
  let currentSelectedMode = 'guided'; // 'guided' | 'free'
  let activeStagingTab = 'all';

  let stagedTonightIds = [];
  try {
    const rawStaged = localStorage.getItem(STORAGE_KEY_STAGED_IDS);
    if (rawStaged) stagedTonightIds = JSON.parse(rawStaged) || [];
  } catch (e) {}

  let currentSelectedPlaybook = [];

  window.topPartner = topPartner;
  window.subPartner = subPartner;
  window.sessionDepth = sessionDepth;
  window.currentSelectedPlaybook = currentSelectedPlaybook;

  function ensureNamesAndAnatomyLoaded() {
    if (!window.names || !window.names.A || !window.names.B) {
      try {
        const rawNames = localStorage.getItem(STORAGE_KEY_NAMES);
        if (rawNames) window.names = JSON.parse(rawNames);
      } catch (e) {}
    }
    if (!window.names) window.names = { A: 'Partner 1', B: 'Partner 2' };

    if (!window.anatomy || !window.anatomy.A || !window.anatomy.B) {
      try {
        const rawAnat = localStorage.getItem(STORAGE_KEY_ANATOMY);
        if (rawAnat) window.anatomy = JSON.parse(rawAnat);
      } catch (e) {}
    }
    if (!window.anatomy) window.anatomy = { A: 'penis', B: 'vulva' };
  }

  ensureNamesAndAnatomyLoaded();

  function saveStagedToys() {
    try {
      localStorage.setItem(STORAGE_KEY_STAGED_IDS, JSON.stringify(stagedTonightIds));
    } catch (e) {}
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

  function showToast(msg) {
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification(msg);
      return;
    }
    const c = document.getElementById('toast-container');
    if (!c) return;
    const el = document.createElement('div');
    el.className = "bg-[#090d14] text-[#f8fafc] font-mono text-xs px-4 py-2.5 rounded-2xl shadow-2xl border border-[#c5a880]/40 transition-all pointer-events-auto transform translate-y-2 opacity-0 flex items-center gap-2.5 backdrop-blur-md z-50";
    el.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-[#c5a880] flex-shrink-0 animate-pulse"></span>
      <span>${escapeHtml(msg)}</span>
    `;
    c.appendChild(el);
    setTimeout(() => el.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
      el.classList.add('opacity-0');
      setTimeout(() => el.remove(), 300);
    }, 2800);
  }

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

  function getClosetCatalog() {
    let baseCatalog = [];
    if (window.EquipmentCatalog && typeof window.EquipmentCatalog.getAll === 'function') {
      baseCatalog = window.EquipmentCatalog.getAll();
    } else if (Array.isArray(window.equipmentCatalog)) {
      baseCatalog = window.equipmentCatalog;
    }

    let custom = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_EQUIPMENT) || localStorage.getItem('tactus_custom_equipment');
      if (raw) custom = JSON.parse(raw);
    } catch (e) {}

    const combined = baseCatalog.concat(custom);

    let ownedIds = null;
    if (window.HubToys && typeof window.HubToys.getOwned === 'function') {
      ownedIds = window.HubToys.getOwned();
    } else {
      try {
        const rawOwned = localStorage.getItem('tactus_owned_equipment') || localStorage.getItem('kompass_owned_equipment');
        if (rawOwned) ownedIds = JSON.parse(rawOwned);
      } catch (e) {}
    }

    if (ownedIds && Array.isArray(ownedIds)) {
      return combined.filter(item => ownedIds.includes(item.id));
    }
    return combined;
  }

  function setupInitialPlaybook() {
    ensureNamesAndAnatomyLoaded();
    const names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    const anatomy = window.anatomy || { A: 'penis', B: 'vulva' };

    const topName = names[topPartner] || 'Top';
    const subName = names[subPartner] || 'Bottom';
    const subAnat = anatomy[subPartner] || 'vulva';
    const isVulva = (subAnat === 'vulva');

    const closet = getClosetCatalog();
    const availableToys = closet.filter(i => stagedTonightIds.includes(i.id));

    const sem = (window.ToyCombinatorics && typeof window.ToyCombinatorics.buildSummary === 'function')
      ? window.ToyCombinatorics.buildSummary(availableToys, subAnat)
      : { impact: [], bondage: [], clitoral_suction: [], male_stroker: [], wand: [], vibrator: [], clamps: [] };

    const bondageTool = (sem.bondage && sem.bondage.length > 0) ? sem.bondage[0] : "Krawatte oder Seidenschal";
    const impactTool = (sem.impact && sem.impact.length > 0) ? sem.impact[0] : "die flache Hand oder ein Ledergürtel";

    // Strikte anatomische Zuordnung für Phase 3 (Edging)
    let arousalTool = "";
    if (isVulva) {
      arousalTool = (sem.clitoral_suction && sem.clitoral_suction.length > 0)
        ? sem.clitoral_suction[0]
        : ((sem.wand && sem.wand.length > 0) ? sem.wand[0] : ((sem.vibrator && sem.vibrator.length > 0) ? sem.vibrator[0] : "gezielte Handberührungen an der Klitoris"));
    } else {
      arousalTool = (sem.male_stroker && sem.male_stroker.length > 0)
        ? sem.male_stroker[0]
        : ((sem.wand && sem.wand.length > 0) ? `${sem.wand[0]} an der Eichel` : "gezielte Griffe am Schaft");
    }

    const tool1 = availableToys.length > 0 ? availableToys[0].name : "Nackte Hände";

    currentSelectedPlaybook = [
      {
        phase: "Phase 1: Warm-up & Zentrierung",
        title: "Ankommen & Blickkontakt-Führung",
        desc: `${topName} nimmt ${subName} an den Schultern und fordert ununterbrochenen Blickkontakt bei ruhiger Atemsynchronisation.`,
        top: "Lege deine Hände ruhig auf die Schultern und gib den Atemrhythmus vor.",
        sub: "Lass die Schultern sinken, blicke tief in die Augen und atme synchron aus."
      },
      {
        phase: "Phase 1: Warm-up & Zentrierung",
        title: "Hauterwärmung & Streichreize",
        desc: `Mit ${tool1} werden Reizlinien über Nacken, Rücken und Schenkelinnenseiten gezogen.`,
        top: `Streiche mit ${tool1} fordernd über die Haut und beobachte die Reaktionen.`,
        sub: "Halte vollkommen still und spüre die wachsende Hitze auf der Haut."
      },
      {
        phase: "Phase 2: Machtaufbau & Begrenzung",
        title: `Fixierung mit ${bondageTool}`,
        desc: `${topName} fixiert die Hände von ${subName} mit ${bondageTool} sicher vor oder hinter dem Körper.`,
        top: `Schließe ${bondageTool} sicher um die Handgelenke und prüfe den festen Sitz.`,
        sub: "Gib deine Hände bereitwillig ab und spüre das Loslassen der Verantwortung."
      },
      {
        phase: "Phase 2: Machtaufbau & Begrenzung",
        title: "Demutshaltung am Boden",
        desc: `${subName} begibt sich aufrecht in den Kniestand (Nadu/Seiza) zu Füßen des Tops.`,
        top: "Nimm auf dem Sessel Platz und mustere die Haltung deines Partners.",
        sub: "Knie mit aufrechter Wirbelsäule und geneigtem Kopf vor dem Top."
      },
      {
        phase: "Phase 3: Katharsis & Zucht",
        title: `Fordernde Reizsetzung mit ${impactTool}`,
        desc: `Gezielte, rhythmische Reize mit ${impactTool} auf das entblößte Gesäß zur Durchwärmung.`,
        top: `Setze dosierte Treffer mit ${impactTool} und achte auf das Mitzählen.`,
        sub: "Zähle jeden Treffer laut und andächtig mit."
      },
      {
        phase: "Phase 3: Katharsis & Zucht",
        title: `Edging-Führung mit ${arousalTool}`,
        desc: `${topName} nutzt ${arousalTool}, um ${subName} gezielt an die Edge zu treiben – und befiehlt schlagartigen Stillstand.`,
        top: `Führe die Erregung mit ${arousalTool} an die Edge und fordere absolute Reglosigkeit.`,
        sub: "Spüre das Pochen an der Edge und gehorche dem Stopp-Befehl."
      },
      {
        phase: "Phase 4: Urteil & Aftercare",
        title: "Höhepunkt-Entscheidung des Tops",
        desc: `${topName} entscheidet souverän am Edging-Cockpit über Freigabe, Ruined Orgasm oder Denial.`,
        top: "Triff deine Entscheidung am Edging-Cockpit und verkünde das Urteil.",
        sub: "Harre reglos aus und nimm das Urteil deines Tops an."
      },
      {
        phase: "Phase 4: Urteil & Aftercare",
        title: "Aftercare & Decken-Geborgenheit",
        desc: "Lösen aller Fesseln. Festes Halten in dicken Decken mit Wasser und Wärme.",
        top: "Nimm deinen Partner fest in den Arm, hülle ihn in Decken und schenke Ruhe.",
        sub: "Lass alle Muskeln los, versinke im Arm des Tops und trinke warmes Wasser."
      }
    ];

    window.currentSelectedPlaybook = currentSelectedPlaybook;
    renderPlaybookPreview();
  }

  function selectRoleSetup(choice) {
    if (choice === 'reversed') {
      topPartner = 'A';
      subPartner = 'B';
    } else {
      topPartner = 'B';
      subPartner = 'A';
    }
    window.topPartner = topPartner;
    window.subPartner = subPartner;
    updateRoleSelectionUI();
    setupInitialPlaybook();
    if (typeof window.updateHeaderTabuCounter === 'function') {
      window.updateHeaderTabuCounter();
    }
  }

  function updateRoleSelectionUI() {
    ensureNamesAndAnatomyLoaded();
    const names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    const nameA = names.A || 'Partner 1';
    const nameB = names.B || 'Partner 2';

    const elDefTop = document.getElementById('portal-name-top-def');
    const elDefTopSub = document.getElementById('portal-name-top-def-sub');
    const elDefSub = document.getElementById('portal-name-sub-def');

    const elRevTop = document.getElementById('portal-name-top-rev');
    const elRevTopSub = document.getElementById('portal-name-top-rev-sub');
    const elRevSub = document.getElementById('portal-name-sub-rev');

    if (elDefTop) elDefTop.innerText = nameB;
    if (elDefTopSub) elDefTopSub.innerText = nameB;
    if (elDefSub) elDefSub.innerText = nameA;

    if (elRevTop) elRevTop.innerText = nameA;
    if (elRevTopSub) elRevTopSub.innerText = nameA;
    if (elRevSub) elRevSub.innerText = nameB;

    const btnDef = document.getElementById('btn-role-setup-default');
    const btnRev = document.getElementById('btn-role-setup-reversed');
    const badgeDef = document.getElementById('badge-role-default');
    const badgeRev = document.getElementById('badge-role-reversed');

    if (topPartner === 'B') {
      if (btnDef) btnDef.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-[#000000] border-[#c5a880] shadow-md block w-full";
      if (btnRev) btnRev.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-[#090d14] border-[#2a364f] hover:border-slate-700 block w-full";
      if (badgeDef) { badgeDef.innerText = "✓ Aktiv"; badgeDef.className = "text-xs font-mono font-bold text-[#c5a880]"; }
      if (badgeRev) { badgeRev.innerText = "○"; badgeRev.className = "text-xs font-mono font-bold text-[#94a3b8]"; }
    } else {
      if (btnRev) btnRev.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-[#000000] border-[#c5a880] shadow-md block w-full";
      if (btnDef) btnDef.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-[#090d14] border-[#2a364f] hover:border-slate-700 block w-full";
      if (badgeRev) { badgeRev.innerText = "✓ Aktiv"; badgeRev.className = "text-xs font-mono font-bold text-[#c5a880]"; }
      if (badgeDef) { badgeDef.innerText = "○"; badgeDef.className = "text-xs font-mono font-bold text-[#94a3b8]"; }
    }

    const rolesSubtitle = document.getElementById('session-roles-subtitle');
    if (rolesSubtitle) {
      rolesSubtitle.innerText = `Top: ${names[topPartner]} · Bottom: ${names[subPartner]}`;
    }
  }

  function goToStep(stepNumber) {
    [1, 2, 3].forEach(s => {
      const section = document.getElementById('portal-step-' + s);
      if (section) {
        if (s === stepNumber) section.classList.remove('hidden');
        else section.classList.add('hidden');
      }
    });

    if (stepNumber === 2) {
      renderEquipmentGrid();
    } else if (stepNumber === 3) {
      setupInitialPlaybook();
    }

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  function updateEnergy(who, val) {
    const v = parseInt(val, 10);
    const labels = ["", "Erschöpft / Zerstreut", "Ruhig / Sanft", "Aufmerksam", "Präsent & Fokussiert", "Volle Hingabe & Kraft"];
    if (who === 'top') {
      energyTop = v;
      const lblTop = document.getElementById('label-energy-top');
      const descTop = document.getElementById('desc-energy-top');
      if (lblTop) lblTop.innerText = `${v} / 5`;
      if (descTop) descTop.innerText = labels[v] || "";
    } else {
      energySub = v;
      const lblSub = document.getElementById('label-energy-sub');
      const descSub = document.getElementById('desc-energy-sub');
      if (lblSub) lblSub.innerText = `${v} / 5`;
      if (descSub) descSub.innerText = labels[v] || "";
    }
  }

  function updateDepth(val) {
    sessionDepth = parseInt(val, 10);
    window.sessionDepth = sessionDepth;

    const lbl = document.getElementById('label-session-depth');
    const desc = document.getElementById('desc-session-depth');

    const descs = [
      "",
      "Stufe 1 / 10: Sanftes Kennenlernen & Kuschel-Setting",
      "Stufe 2 / 10: Zarte Sinnesreduktion & Streichreize",
      "Stufe 3 / 10: Erste Fesselung mit Tuch oder Schal",
      "Stufe 4 / 10: Mäßiges Versohlen mit der Handfläche",
      "Stufe 5 / 10: Feste Führung & Kniestand (Nadu)",
      "Stufe 6 / 10: Spanking mit Mitzählen & Augenbinde",
      "Stufe 7 / 10: Intensive Führung mit Fesselung & Disziplin",
      "Stufe 8 / 10: Scharfer Reiz (Lederflogger / Gerte) & Edging",
      "Stufe 9 / 10: Tiefe Katharsis & erzwungener Kontrollverlust",
      "Stufe 10 / 10: Grenzbereich & absolute Hingabe"
    ];

    if (lbl) lbl.innerText = descs[sessionDepth] || `Stufe ${sessionDepth} / 10`;
    if (desc) desc.innerText = "Abgestimmte Intensität für das Drehbuch und die Disziplinierung.";
  }

  function renderEquipmentGrid() {
    const container = document.getElementById('session-staging-equipment-grid');
    if (!container) return;

    // Bundle-Übernahme aus dem Schrank falls vorhanden
    try {
      const rawBundle = localStorage.getItem(STORAGE_KEY_STAGING_BUNDLE);
      if (rawBundle) {
        const bundleIds = JSON.parse(rawBundle);
        if (Array.isArray(bundleIds) && bundleIds.length > 0) {
          stagedTonightIds = bundleIds;
          saveStagedToys();
          localStorage.removeItem(STORAGE_KEY_STAGING_BUNDLE);
        }
      }
    } catch (e) {}

    const items = getClosetCatalog();

    const counts = {
      all: items.length,
      household: 0,
      bondage: 0,
      impact: 0,
      sensory: 0,
      chastity: 0,
      furniture: 0,
      care: 0
    };

    items.forEach(i => {
      const cat = i.category;
      if (counts[cat] !== undefined) counts[cat]++;
    });

    for (const cat in counts) {
      const countSpan = document.getElementById('stag-count-' + cat);
      if (countSpan) countSpan.innerText = counts[cat].toString();
    }

    const filtered = items.filter(i => {
      if (activeStagingTab === 'all') return true;
      return i.category === activeStagingTab;
    });

    const closetTotalCount = document.getElementById('staging-closet-total-count');
    const stagingActiveCount = document.getElementById('staging-active-count');
    if (closetTotalCount) closetTotalCount.innerText = items.length.toString();
    if (stagingActiveCount) stagingActiveCount.innerText = stagedTonightIds.length.toString();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-4 text-center text-[#94a3b8] bg-[#000000] border border-[#2a364f] rounded-2xl text-xs space-y-1 font-mono">
          <span>In dieser Kategorie sind aktuell keine Toys im Schrank aktiviert.</span>
          <button type="button" onclick="if(window.HubToys && typeof window.HubToys.open==='function') window.HubToys.open();" class="text-[#c5a880] font-bold hover:underline block mx-auto">
            Im Schrank aktivieren ↗
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const isStaged = stagedTonightIds.includes(item.id);
      return `
        <div onclick="SessionStaging.toggleToy('${item.id}')" class="p-2.5 rounded-xl border text-left cursor-pointer transition touch-btn flex items-center justify-between gap-2 ${isStaged ? 'bg-[#000000] border-[#c5a880] text-white shadow-sm' : 'bg-[#090d14] border-[#2a364f] text-[#94a3b8] hover:border-slate-700'}">
          <div class="truncate min-w-0">
            <strong class="text-xs text-white block truncate font-sans">${escapeHtml(item.name)}</strong>
            <span class="text-[9.5px] text-[#94a3b8] block truncate font-mono">${escapeHtml(item.somaticEffect || item.desc || '')}</span>
          </div>
          <span class="text-xs font-mono font-bold ${isStaged ? 'text-[#c5a880]' : 'text-[#2a364f]'}">${isStaged ? '✓' : '○'}</span>
        </div>
      `;
    }).join('');
  }

  function toggleToyStaged(toyId) {
    const idx = stagedTonightIds.indexOf(toyId);
    if (idx !== -1) {
      stagedTonightIds.splice(idx, 1);
    } else {
      stagedTonightIds.push(toyId);
    }
    saveStagedToys();
    renderEquipmentGrid();
  }

  function selectEquipmentPreset(preset) {
    const all = getClosetCatalog();
    if (preset === 'all') {
      stagedTonightIds = all.map(i => i.id);
      showToast("Alle Schrank-Gegenstände für heute bereitgelegt ✨");
    } else if (preset === 'bare') {
      stagedTonightIds = [];
      showToast("Nachttisch abgeräumt: Nur Hände, Bett & Stimme aktiv 🛏️");
    } else if (preset === 'random3') {
      const shuffled = all.slice().sort(() => 0.5 - Math.random());
      stagedTonightIds = shuffled.slice(0, 3).map(i => i.id);
      showToast("3 Gegenstände als Inspiration ausgewählt 🎲");
    }
    saveStagedToys();
    renderEquipmentGrid();
  }

  function switchStagingTab(tabName) {
    activeStagingTab = tabName;
    ['all', 'bondage', 'impact', 'chastity', 'sensory', 'furniture', 'care'].forEach(t => {
      const btn = document.getElementById('btn-stag-tab-' + t);
      if (btn) {
        if (t === tabName) {
          btn.className = "px-3 py-1.5 rounded-xl text-[10.5px] font-bold bg-[#000000] border border-[#c5a880] text-[#c5a880] touch-btn whitespace-nowrap shadow-sm";
        } else {
          btn.className = "px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold bg-[#090d14] border border-[#2a364f] text-[#94a3b8] touch-btn whitespace-nowrap";
        }
      }
    });
    renderEquipmentGrid();
  }

  function openNewToyQuickAdd() {
    const p = document.getElementById('staging-quick-add-panel');
    if (p) p.classList.remove('hidden');
  }

  function closeNewToyQuickAdd() {
    const p = document.getElementById('staging-quick-add-panel');
    if (p) p.classList.add('hidden');
  }

  function saveNewToyFromStaging() {
    const inputName = document.getElementById('staging-quick-toy-name');
    const selectCat = document.getElementById('staging-quick-toy-cat');

    const nameVal = (inputName ? inputName.value : '').trim();
    const catVal = (selectCat ? selectCat.value : 'bondage');

    if (!nameVal) {
      showToast("Bitte gib dem Gegenstand einen Namen.");
      return;
    }

    const newToy = {
      id: "toy_custom_" + Date.now(),
      name: nameVal,
      category: catVal,
      somaticEffect: "Neuanschaffung für heute",
      isCustom: true
    };

    let customList = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_EQUIPMENT) || localStorage.getItem('tactus_custom_equipment');
      if (raw) customList = JSON.parse(raw);
    } catch (e) {}
    customList.push(newToy);
    localStorage.setItem(STORAGE_KEY_CUSTOM_EQUIPMENT, JSON.stringify(customList));
    localStorage.setItem('tactus_custom_equipment', JSON.stringify(customList));

    if (window.HubToys && typeof window.HubToys.toggleOwned === 'function') {
      window.HubToys.toggleOwned(newToy.id);
    } else {
      let ownedIds = [];
      try {
        const rawO = localStorage.getItem('tactus_owned_equipment') || localStorage.getItem('kompass_owned_equipment');
        if (rawO) ownedIds = JSON.parse(rawO);
      } catch (e) {}
      if (!ownedIds.includes(newToy.id)) ownedIds.push(newToy.id);
      localStorage.setItem('tactus_owned_equipment', JSON.stringify(ownedIds));
    }

    stagedTonightIds.push(newToy.id);
    saveStagedToys();
    closeNewToyQuickAdd();
    if (inputName) inputName.value = '';
    renderEquipmentGrid();
    showToast("✓ Im Schrank inventarisiert und auf den Nachttisch gelegt!");
  }

  function selectMode(mode) {
    currentSelectedMode = mode;
    const btnGuided = document.getElementById('btn-mode-guided');
    const btnFree = document.getElementById('btn-mode-free');
    const badgeGuided = document.getElementById('badge-mode-guided');
    const badgeFree = document.getElementById('badge-mode-free');
    const previewWrap = document.getElementById('playbook-preview-wrap');

    if (mode === 'guided') {
      if (btnGuided) btnGuided.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-[#000000] border-[#c5a880] shadow-md block w-full";
      if (btnFree) btnFree.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-[#090d14] border-[#2a364f] hover:border-slate-700 block w-full";
      if (badgeGuided) { badgeGuided.innerText = "✓ Gewählt"; badgeGuided.className = "text-[#c5a880] font-mono font-bold text-xs"; }
      if (badgeFree) { badgeFree.innerText = "○"; badgeFree.className = "text-[#94a3b8] font-mono font-bold text-xs"; }
      if (previewWrap) previewWrap.classList.remove('opacity-40', 'pointer-events-none');
    } else {
      if (btnFree) btnFree.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-[#000000] border-[#c5a880] shadow-md block w-full";
      if (btnGuided) btnGuided.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-[#090d14] border-[#2a364f] hover:border-slate-700 block w-full";
      if (badgeFree) { badgeFree.innerText = "✓ Gewählt"; badgeFree.className = "text-[#c5a880] font-mono font-bold text-xs"; }
      if (badgeGuided) { badgeGuided.innerText = "○"; badgeGuided.className = "text-[#94a3b8] font-mono font-bold text-xs"; }
      if (previewWrap) previewWrap.classList.add('opacity-40', 'pointer-events-none');
    }

    if (window.SessionLive && typeof window.SessionLive.selectMode === 'function') {
      window.SessionLive.selectMode(mode);
    }
  }

  function renderPlaybookPreview() {
    const c = document.getElementById('playbook-preview-container');
    if (!c) return;

    if (currentSelectedPlaybook.length === 0) {
      c.innerHTML = '<p class="text-[#94a3b8] italic text-center py-4 text-xs font-mono">Keine Drehbuchschritte geladen.</p>';
      return;
    }

    c.innerHTML = currentSelectedPlaybook.map((step, idx) => {
      return `
        <div class="p-3.5 rounded-2xl bg-[#090d14] border border-[#2a364f] space-y-1.5 text-xs font-sans">
          <div class="flex items-center justify-between border-b border-[#2a364f] pb-1">
            <div class="flex items-center gap-1.5">
              <span class="text-[#c5a880] font-mono font-bold">${idx + 1}.</span>
              <strong class="text-white text-xs">${escapeHtml(step.title)}</strong>
            </div>
            <span class="text-[9.5px] px-2 py-0.5 rounded bg-[#000000] border border-[#2a364f] text-[#c5a880] font-mono">${escapeHtml(step.phase || '')}</span>
          </div>
          <p class="text-[11px] text-[#f8fafc] leading-snug">${escapeHtml(step.desc)}</p>
          <div class="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono">
            <div class="p-2 rounded-xl bg-[#000000] border border-[#2a364f] text-[#f8fafc]"><strong class="text-[#c5a880]">👑 Top:</strong> ${escapeHtml(step.top || '')}</div>
            <div class="p-2 rounded-xl bg-[#000000] border border-[#2a364f] text-[#f8fafc]"><strong class="text-[#b3734a]">🧎 Bottom:</strong> ${escapeHtml(step.sub || '')}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function rerollPlaybook() {
    setupInitialPlaybook();
    showToast("Drehbuch neu gewürfelt 🎲");
  }

  async function generateAiPlaybook() {
    ensureNamesAndAnatomyLoaded();
    const names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    const anatomy = window.anatomy || { A: 'penis', B: 'vulva' };

    const topName = names[topPartner] || 'Top';
    const subName = names[subPartner] || 'Bottom';
    const subAnat = anatomy[subPartner] || 'vulva';

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      showToast("⚠️ Kein Gemini API-Key hinterlegt. Bitte trage deinen Key in den Einstellungen ein.");
      return;
    }

    const closet = getClosetCatalog();
    const availableToys = closet.filter(i => stagedTonightIds.includes(i.id));

    const briefing = (window.ToyCombinatorics && typeof window.ToyCombinatorics.generateAiPromptBriefing === 'function')
      ? window.ToyCombinatorics.generateAiPromptBriefing(availableToys, subAnat)
      : (`Anatomie: ${subAnat}`);

    showToast("⏳ Gemini schneidet das Drehbuch auf eure Schrank-Toys zu...");

    const prompt = `Du bist eine erfahrene, psychologisch feinfühlige BDSM-Regisseurin für das Paar ${topName} (Top) und ${subName} (Bottom).
Erstelle ein zusammenhängendes, hochintensives 4-Phasen-Drehbuch (genau 8 Schritte) für den heutigen Abend.

${briefing}
INTENSITÄTS-STUFE: ${sessionDepth} / 10
ENERGIELEVEL: Top: ${energyTop}/5 · Bottom: ${energySub}/5

STRIKTE REGELN ZUR SPRACHE & TERMINOLOGIE:
- Verwende AUSSCHLIESSLICH die Begriffe "Edge", "Edges" und "Edging". Niemals "Kanten" oder "Schwellen"!
- Verwende ausschließlich reale Gegenstände aus der Liste oder Hände/Bett/Wand.
- Ein Womanizer/Sauger darf NIEMALS am Penis angewendet werden!
- Phase 1: Warm-up & Zentrierung (Schritt 1 & 2)
- Phase 2: Machtaufbau & Begrenzung (Schritt 3 & 4)
- Phase 3: Katharsis, Zucht & Edging (Schritt 5 & 6)
- Phase 4: Urteilsspruch & Aftercare (Schritt 7 & 8)

Antworte AUSSCHLIESSLICH als valides JSON:
[
  {
    "phase": "Phase 1: Warm-up & Zentrierung",
    "title": "Titel des Schritts",
    "desc": "Handlungsszene in 2 Sätzen",
    "top": "Konkrete Führungsanweisung für ${topName}",
    "sub": "Hingabe- und Körperhaltung für ${subName}"
  }
]`;

    const candidateModels = [
      localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) || 'gemini-2.0-flash',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash'
    ];
    let parsedSteps = null;

    for (const model of candidateModels) {
      try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
          })
        });

        if (resp.ok) {
          const resData = await resp.json();
          const rawJson = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
          try {
            parsedSteps = JSON.parse(rawJson);
          } catch (pe) {
            const match = rawJson.match(/\[[\s\S]*\]/);
            parsedSteps = match ? JSON.parse(match[0]) : null;
          }

          if (parsedSteps && Array.isArray(parsedSteps) && parsedSteps.length >= 4) {
            break;
          }
        }
      } catch (e) {}
    }

    if (parsedSteps && Array.isArray(parsedSteps)) {
      currentSelectedPlaybook = parsedSteps;
      window.currentSelectedPlaybook = currentSelectedPlaybook;
      renderPlaybookPreview();
      showToast("✓ Drehbuch erfolgreich per KI auf eure Toys zugeschnitten!");
    } else {
      showToast("⚠️ KI-Drehbuch nicht erreichbar. Standard-Drehbuch geladen.");
      setupInitialPlaybook();
    }
  }

  function toggleVoiceAssist(active) {
    try {
      localStorage.setItem(STORAGE_KEY_VOICE_ACTIVE, active ? 'true' : 'false');
    } catch (e) {}

    const indicator = document.getElementById('cockpit-voice-active-indicator');
    if (indicator) {
      indicator.innerText = active ? "🔊 Stimme aktiv" : "Stumm";
    }

    if (active) {
      if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
        window.SessionVoice.unlock();
      }
      showToast("Akustische Regiestimme aktiviert 🔊");
    } else {
      if (window.SessionVoice && typeof window.SessionVoice.stop === 'function') {
        window.SessionVoice.stop();
      }
      showToast("Regiestimme stummgeschaltet 🔇");
    }
  }

  function changeVoice(voiceName) {
    try {
      localStorage.setItem(STORAGE_KEY_VOICE_NAME, voiceName);
    } catch (e) {}
    showToast("Stimme ausgewählt: " + voiceName);
  }

  function testVoiceSample() {
    ensureNamesAndAnatomyLoaded();
    const sel = document.getElementById('session-voice-select');
    const voiceName = sel ? sel.value : (localStorage.getItem(STORAGE_KEY_VOICE_NAME) || 'Despina');
    const names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    const topName = names[topPartner] || 'Top';
    const subName = names[subPartner] || 'Bottom';

    const sampleText = `Blickkontakt halten, ${subName}. ${topName} führt ab jetzt jeden deiner Atemzüge an der Edge.`;

    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      showToast(`🔊 Spiele 5s Probehör-Sample (${voiceName})...`);
      window.SessionVoice.play(sampleText, voiceName, true);
    } else {
      showToast("⚠️ SessionVoice Engine nicht verfügbar.");
    }
  }

  function applyPunishmentVoicePreset() {
    const sel = document.getElementById('session-voice-select');
    if (sel) sel.value = "Enceladus";
    changeVoice("Enceladus");
    toggleVoiceAssist(true);
    const toggleBox = document.getElementById('session-voice-assist-toggle');
    if (toggleBox) toggleBox.checked = true;
    showToast("⚡ Zucht-Preset aktiv: Enceladus (Autoritäre Männerstimme)");
  }

  const api = {
    selectRoleSetup: selectRoleSetup,
    goToStep: goToStep,
    updateEnergy: updateEnergy,
    updateDepth: updateDepth,
    renderEquipment: renderEquipmentGrid,
    toggleToy: toggleToyStaged,
    selectPreset: selectEquipmentPreset,
    switchTab: switchStagingTab,
    openNewToyQuickAdd: openNewToyQuickAdd,
    closeNewToyQuickAdd: closeNewToyQuickAdd,
    saveNewToyFromStaging: saveNewToyFromStaging,
    selectMode: selectMode,
    rerollPlaybook: rerollPlaybook,
    generateAiPlaybook: generateAiPlaybook,
    toggleVoiceAssist: toggleVoiceAssist,
    changeVoice: changeVoice,
    testVoiceSample: testVoiceSample,
    applyPunishmentVoicePreset: applyPunishmentVoicePreset
  };

  window.SessionStaging = api;

  window.selectRoleSetup = selectRoleSetup;
  window.goToStagingStep = goToStep;
  window.updateEnergy = updateEnergy;
  window.updateDepth = updateDepth;
  window.renderEquipmentGrid = renderEquipmentGrid;
  window.toggleToyStaged = toggleToyStaged;
  window.selectEquipmentPreset = selectEquipmentPreset;
  window.switchStagingTab = switchStagingTab;
  window.selectMode = selectMode;
  window.rerollPlaybook = rerollPlaybook;
  window.generateAiPlaybook = generateAiPlaybook;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', updateRoleSelectionUI);
    } else {
      updateRoleSelectionUI();
    }
  }

})(typeof window !== 'undefined' ? window : this);
