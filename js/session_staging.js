/**
 * js/session_staging.js
 * Modul für das Nachttisch-Staging, Rollen-Setup und die Drehbuch-Generierung in der Schlafzimmer-Regie.
 * 
 * Qualitäts- & Logik-Standards:
 * - GARANTIERTER DATENZUGRIFF: Lädt Namen und Anatomie verlässlich direkt aus localStorage.
 * - PERSISTENTES STAGING: Speichert bereitgelegte Toys im localStorage, damit sie beim Neuladen erhalten bleiben.
 * - STRIKTE ANATOMISCHE KOMPATIBILITÄT:
 *   * Vulva: Womanizer/Sauger/Wand auf Klitoris. Niemals Stroker/Käfig.
 *   * Penis: Penissleeve/Stroker, Wand am Frenulum/Eichel, Handgriffe. Niemals Womanizer.
 * - SEMANTISCHE TOY-INTEGRATION:
 *   * Bondage-Werkzeuge werden ausschließlich für Arretierungen gewählt.
 *   * Impact-Werkzeuge ausschließlich für Gesäßschläge.
 *   * Womanizer/Vibratoren exklusiv für Erregungs- und Schwellen-Quälerei.
 * - NATÜRLICHE DEUTSCHE FACHSPRACHE: Konsequent „Schwelle“ und „Höhepunkt-Schwelle“ statt falscher Übersetzungen.
 * - ECHTE SCHRANK-FILTERUNG: Im Nachttisch-Staging stehen ausschließlich Toys zur Verfügung, die im Schrank aktiviert sind.
 */

(function(window) {
  'use strict';

  function ensureNamesAndAnatomyLoaded() {
    if (!window.names || !window.names.A || !window.names.B) {
      try {
        var rawNames = localStorage.getItem('kompass_names');
        if (rawNames) window.names = JSON.parse(rawNames);
      } catch (e) {}
    }
    if (!window.names) window.names = { A: 'Partner 1', B: 'Partner 2' };

    if (!window.anatomy || !window.anatomy.A || !window.anatomy.B) {
      try {
        var rawAnat = localStorage.getItem('kompass_anatomy');
        if (rawAnat) window.anatomy = JSON.parse(rawAnat);
      } catch (e) {}
    }
    if (!window.anatomy) window.anatomy = { A: 'penis', B: 'vulva' };
  }

  ensureNamesAndAnatomyLoaded();

  var topPartner = 'B';
  var subPartner = 'A';
  var energyTop = 4;
  var energySub = 4;
  var sessionDepth = 7;
  var currentSelectedMode = 'guided'; // 'guided' oder 'free'
  var activeStagingTab = 'all';

  var stagedTonightIds = [];
  try {
    var rawStaged = localStorage.getItem('kompass_staged_tonight_ids');
    if (rawStaged) stagedTonightIds = JSON.parse(rawStaged) || [];
  } catch (e) {}

  var currentSelectedPlaybook = [];

  window.topPartner = topPartner;
  window.subPartner = subPartner;
  window.sessionDepth = sessionDepth;
  window.currentSelectedPlaybook = currentSelectedPlaybook;

  function saveStagedToys() {
    try {
      localStorage.setItem('kompass_staged_tonight_ids', JSON.stringify(stagedTonightIds));
    } catch (e) {}
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
    }, 2800);
  }

  function getGeminiApiKey() {
    var liveInput = document.getElementById('session-gemini-key-input') || 
                    document.getElementById('account-gemini-key');
    if (liveInput && liveInput.value && liveInput.value.trim().length > 10) {
      return liveInput.value.trim();
    }
    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return null;
  }

  function getClosetCatalog() {
    var baseCatalog = window.equipmentCatalog || [];
    var custom = [];
    try {
      var raw = localStorage.getItem('kompass_custom_equipment');
      if (raw) custom = JSON.parse(raw);
    } catch (e) {}
    var combined = baseCatalog.concat(custom);

    // Strenger Schrank-Filter: Nur aktivierte Gegenstände zulassen!
    var ownedIds = (window.HubToys && typeof window.HubToys.getOwnedIds === 'function')
      ? window.HubToys.getOwnedIds()
      : null;

    if (ownedIds && Array.isArray(ownedIds)) {
      return combined.filter(function(item) {
        return ownedIds.indexOf(item.id) !== -1;
      });
    }
    return combined;
  }

  function setupInitialPlaybook() {
    ensureNamesAndAnatomyLoaded();
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var anatomy = window.anatomy || { A: 'penis', B: 'vulva' };

    var topName = (names && names[topPartner]) || 'Top';
    var subName = (names && names[subPartner]) || 'Bottom';
    var subAnat = (anatomy && anatomy[subPartner]) ? anatomy[subPartner] : 'vulva';
    var isVulva = (subAnat === 'vulva');

    var closet = getClosetCatalog();
    var availableToys = closet.filter(function(i) {
      return stagedTonightIds.indexOf(i.id) !== -1;
    });

    var sem = (window.ToyCombinatorics && typeof window.ToyCombinatorics.buildSummary === 'function')
      ? window.ToyCombinatorics.buildSummary(availableToys, subAnat)
      : { impact: [], bondage: [], clitoral_suction: [], male_stroker: [], wand: [], vibrator: [], clamps: [] };

    var bondageTool = sem.bondage.length > 0 ? sem.bondage[0] : "Krawatte oder Seidenschal";
    var impactTool = sem.impact.length > 0 ? sem.impact[0] : "die flache Hand oder ein Ledergürtel";

    // ANATOMISCH KORREKTE ZUORDNUNG FÜR PHASE 3 (SCHWELLENKONTROLLE)
    var arousalTool = "";
    if (isVulva) {
      // VULVA: Womanizer / Sauger / Wand
      arousalTool = sem.clitoral_suction.length > 0 
        ? sem.clitoral_suction[0] 
        : (sem.wand.length > 0 ? sem.wand[0] : (sem.vibrator.length > 0 ? sem.vibrator[0] : "gezielte Handberührungen an der Klitoris"));
    } else {
      // PENIS: Fleshlight / Stroker / Wand an Eichel (NIEMALS Womanizer!)
      arousalTool = sem.male_stroker.length > 0
        ? sem.male_stroker[0]
        : (sem.wand.length > 0 ? (sem.wand[0] + " an der Eichel") : "gezielte Griffe am Schaft");
    }

    var tool1 = availableToys.length > 0 ? availableToys[0].name : "Nackte Hände";

    currentSelectedPlaybook = [
      {
        phase: "Phase 1: Warm-up & Zentrierung",
        title: "Ankommen & Blickkontakt-Führung",
        desc: topName + " nimmt " + subName + " an den Schultern und fordert ununterbrochenen Blickkontakt bei ruhiger Atemsynchronisation.",
        top: "Lege deine Hände ruhig auf die Schultern und gib den Atemrhythmus vor.",
        sub: "Lass die Schultern sinken, blicke tief in die Augen und atme synchron aus."
      },
      {
        phase: "Phase 1: Warm-up & Zentrierung",
        title: "Hauterwärmung & Streichreize",
        desc: "Mit " + tool1 + " werden Reizlinien über Nacken, Rücken und Schenkelinnenseiten gezogen.",
        top: "Streiche mit " + tool1 + " fordernd über die Haut und beobachte die Reaktionen.",
        sub: "Halte vollkommen still und spüre die wachsende Hitze auf der Haut."
      },
      {
        phase: "Phase 2: Machtaufbau & Begrenzung",
        title: "Fixierung mit " + bondageTool,
        desc: topName + " fixiert die Hände von " + subName + " mit " + bondageTool + " sicher vor oder hinter dem Körper.",
        top: "Schließe " + bondageTool + " sicher um die Handgelenke und prüfe den festen Sitz.",
        sub: "Gib deine Hände bereitwillig ab und spüre das Loslassen der Verantwortung."
      },
      {
        phase: "Phase 2: Machtaufbau & Begrenzung",
        title: "Demutshaltung am Boden",
        desc: subName + " begibt sich aufrecht in den Kniestand (Nadu/Seiza) zu Füßen des Tops.",
        top: "Nimm auf dem Sessel Platz und mustere die Haltung deines Partners.",
        sub: "Knie mit aufrechter Wirbelsäule und geneigtem Kopf vor dem Top."
      },
      {
        phase: "Phase 3: Katharsis & Zucht",
        title: "Fordernde Reizsetzung mit " + impactTool,
        desc: "Gezielte, rhythmische Reize mit " + impactTool + " auf das entblößte Gesäß zur Durchwärmung.",
        top: "Setze dosierte Treffer mit " + impactTool + " und achte auf das Mitzählen.",
        sub: "Zähle jeden Treffer laut und andächtig mit."
      },
      {
        phase: "Phase 3: Katharsis & Zucht",
        title: "Schwellen-Quälerei mit " + arousalTool,
        desc: topName + " nutzt " + arousalTool + ", um " + subName + " gezielt an die Höhepunkt-Schwelle zu treiben – und befiehlt schlagartigen Stillstand.",
        top: "Führe die Erregung mit " + arousalTool + " an die Schwelle und fordere absolute Reglosigkeit.",
        sub: "Spüre das Pochen an der Schwelle und gehorche dem Stopp-Befehl."
      },
      {
        phase: "Phase 4: Katharsis & Aftercare",
        title: "Höhepunkt-Entscheidung des Tops",
        desc: topName + " entscheidet souverän am Edging-Cockpit über Freigabe, Ruined Orgasm oder Denial.",
        top: "Triff deine Entscheidung am Edging-Cockpit und verkünde das Urteil.",
        sub: "Harre reglos aus und nimm das Urteil deines Tops an."
      },
      {
        phase: "Phase 4: Katharsis & Aftercare",
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
  }

  function updateRoleSelectionUI() {
    ensureNamesAndAnatomyLoaded();
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var nameA = names.A || 'Partner 1';
    var nameB = names.B || 'Partner 2';

    var elDefTop = document.getElementById('portal-name-top-def');
    var elDefTopSub = document.getElementById('portal-name-top-def-sub');
    var elDefSub = document.getElementById('portal-name-sub-def');

    var elRevTop = document.getElementById('portal-name-top-rev');
    var elRevTopSub = document.getElementById('portal-name-top-rev-sub');
    var elRevSub = document.getElementById('portal-name-sub-rev');

    if (elDefTop) elDefTop.innerText = nameB;
    if (elDefTopSub) elDefTopSub.innerText = nameB;
    if (elDefSub) elDefSub.innerText = nameA;

    if (elRevTop) elRevTop.innerText = nameA;
    if (elRevTopSub) elRevTopSub.innerText = nameA;
    if (elRevSub) elRevSub.innerText = nameB;

    var btnDef = document.getElementById('btn-role-setup-default');
    var btnRev = document.getElementById('btn-role-setup-reversed');
    var badgeDef = document.getElementById('badge-role-default');
    var badgeRev = document.getElementById('badge-role-reversed');

    if (topPartner === 'B') {
      if (btnDef) btnDef.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-brand-950/30 border-brand-500 shadow-md block w-full";
      if (btnRev) btnRev.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn theme-panel border-slate-800 hover:border-slate-700 block w-full";
      if (badgeDef) { badgeDef.innerText = "✓ Aktiv"; badgeDef.className = "text-sm font-bold text-brand-300"; }
      if (badgeRev) { badgeRev.innerText = "○"; badgeRev.className = "text-sm font-bold text-slate-500"; }
    } else {
      if (btnRev) btnRev.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-brand-950/30 border-brand-500 shadow-md block w-full";
      if (btnDef) btnDef.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn theme-panel border-slate-800 hover:border-slate-700 block w-full";
      if (badgeRev) { badgeRev.innerText = "✓ Aktiv"; badgeRev.className = "text-sm font-bold text-brand-300"; }
      if (badgeDef) { badgeDef.innerText = "○"; badgeDef.className = "text-sm font-bold text-slate-500"; }
    }

    var rolesSubtitle = document.getElementById('session-roles-subtitle');
    if (rolesSubtitle) {
      rolesSubtitle.innerText = `Top: ${names[topPartner]} · Bottom: ${names[subPartner]}`;
    }
  }

  function goToStep(stepNumber) {
    [1, 2, 3].forEach(function(s) {
      var section = document.getElementById('portal-step-' + s);
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
    var v = parseInt(val, 10);
    var labels = ["", "Erschöpft / Zerstreut", "Ruhig / Sanft", "Aufmerksam", "Präsent & Fokussiert", "Volle Hingabe & Kraft"];
    if (who === 'top') {
      energyTop = v;
      var lblTop = document.getElementById('label-energy-top');
      var descTop = document.getElementById('desc-energy-top');
      if (lblTop) lblTop.innerText = v + " / 5";
      if (descTop) descTop.innerText = labels[v] || "";
    } else {
      energySub = v;
      var lblSub = document.getElementById('label-energy-sub');
      var descSub = document.getElementById('desc-energy-sub');
      if (lblSub) lblSub.innerText = v + " / 5";
      if (descSub) descSub.innerText = labels[v] || "";
    }
  }

  function updateDepth(val) {
    sessionDepth = parseInt(val, 10);
    window.sessionDepth = sessionDepth;

    var lbl = document.getElementById('label-session-depth');
    var desc = document.getElementById('desc-session-depth');

    var descs = [
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
    var container = document.getElementById('session-staging-equipment-grid');
    if (!container) return;

    var items = getClosetCatalog();

    var counts = {
      all: items.length,
      household: 0,
      bondage: 0,
      impact: 0,
      sensory: 0,
      cbt_clamps: 0,
      toys_anal: 0,
      special: 0
    };

    items.forEach(function(i) {
      if (counts[i.category] !== undefined) counts[i.category]++;
    });

    for (var cat in counts) {
      var countSpan = document.getElementById('stag-count-' + cat);
      if (countSpan) countSpan.innerText = counts[cat].toString();
    }

    var filtered = items.filter(function(i) {
      if (activeStagingTab === 'all') return true;
      return i.category === activeStagingTab;
    });

    var closetTotalCount = document.getElementById('staging-closet-total-count');
    var stagingActiveCount = document.getElementById('staging-active-count');
    if (closetTotalCount) closetTotalCount.innerText = items.length.toString();
    if (stagingActiveCount) stagingActiveCount.innerText = stagedTonightIds.length.toString();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-4 text-center text-slate-400 theme-panel rounded-xl text-xs space-y-1">
          <span>In dieser Kategorie sind aktuell keine Toys im Schrank aktiviert.</span>
          <button type="button" onclick="if(typeof openToyManagementModal==='function') openToyManagementModal(); else if(window.HubToys && typeof window.HubToys.open==='function') window.HubToys.open();" class="text-purple-300 font-bold hover:underline block mx-auto">
            Im Schrank aktivieren ↗
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(function(item) {
      var isStaged = stagedTonightIds.indexOf(item.id) !== -1;
      return `
        <div onclick="SessionStaging.toggleToy('${item.id}')" class="p-2.5 rounded-xl border text-left cursor-pointer transition touch-btn flex items-center justify-between gap-2 ${isStaged ? 'bg-purple-950/60 border-purple-500 shadow-sm' : 'theme-panel border-slate-800 text-slate-400 hover:border-slate-700'}">
          <div class="truncate min-w-0">
            <strong class="text-xs text-white block truncate">${escapeHtml(item.name)}</strong>
            <span class="text-[9.5px] text-slate-400 block truncate">${escapeHtml(item.desc || '')}</span>
          </div>
          <span class="text-xs font-mono font-black ${isStaged ? 'text-purple-300' : 'text-slate-600'}">${isStaged ? '✓' : '○'}</span>
        </div>
      `;
    }).join('');
  }

  function toggleToyStaged(toyId) {
    var idx = stagedTonightIds.indexOf(toyId);
    if (idx !== -1) {
      stagedTonightIds.splice(idx, 1);
    } else {
      stagedTonightIds.push(toyId);
    }
    saveStagedToys();
    renderEquipmentGrid();
  }

  function selectEquipmentPreset(preset) {
    var all = getClosetCatalog();
    if (preset === 'all') {
      stagedTonightIds = all.map(function(i) { return i.id; });
      showToast("Alle Schrank-Gegenstände für heute bereitgelegt ✨");
    } else if (preset === 'bare') {
      stagedTonightIds = [];
      showToast("Nachttisch abgeräumt: Nur Hände, Bett & Stimme aktiv 🛏️");
    } else if (preset === 'random3') {
      var shuffled = all.slice().sort(function() { return 0.5 - Math.random(); });
      stagedTonightIds = shuffled.slice(0, 3).map(function(i) { return i.id; });
      showToast("3 Gegenstände als Inspiration ausgewählt 🎲");
    }
    saveStagedToys();
    renderEquipmentGrid();
  }

  function switchStagingTab(tabName) {
    activeStagingTab = tabName;
    ['all', 'household', 'bondage', 'impact', 'sensory', 'cbt_clamps', 'toys_anal', 'special'].forEach(function(t) {
      var btn = document.getElementById('btn-stag-tab-' + t);
      if (btn) {
        if (t === tabName) {
          btn.className = "px-3 py-1.5 rounded-xl text-[10.5px] font-bold bg-brand-700 text-white touch-btn whitespace-nowrap shadow-sm";
        } else {
          btn.className = "px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold theme-panel text-slate-300 touch-btn whitespace-nowrap";
        }
      }
    });
    renderEquipmentGrid();
  }

  function openNewToyQuickAdd() {
    var p = document.getElementById('staging-quick-add-panel');
    if (p) p.classList.remove('hidden');
  }

  function closeNewToyQuickAdd() {
    var p = document.getElementById('staging-quick-add-panel');
    if (p) p.classList.add('hidden');
  }

  function saveNewToyFromStaging() {
    var inputName = document.getElementById('staging-quick-toy-name');
    var selectCat = document.getElementById('staging-quick-toy-cat');

    var nameVal = (inputName ? inputName.value : '').trim();
    var catVal = (selectCat ? selectCat.value : 'household');

    if (!nameVal) {
      showToast("Bitte gib dem Gegenstand einen Namen.");
      return;
    }

    var newToy = {
      id: "toy_custom_" + Date.now(),
      name: nameVal,
      category: catVal,
      desc: "Eigenanschaffung für heute",
      isCustom: true
    };

    var customList = [];
    try {
      var raw = localStorage.getItem('kompass_custom_equipment');
      if (raw) customList = JSON.parse(raw);
    } catch (e) {}
    customList.push(newToy);
    localStorage.setItem('kompass_custom_equipment', JSON.stringify(customList));

    if (window.HubToys && typeof window.HubToys.toggleOwned === 'function') {
      window.HubToys.toggleOwned(newToy.id);
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
    var btnGuided = document.getElementById('btn-mode-guided');
    var btnFree = document.getElementById('btn-mode-free');
    var badgeGuided = document.getElementById('badge-mode-guided');
    var badgeFree = document.getElementById('badge-mode-free');
    var previewWrap = document.getElementById('playbook-preview-wrap');

    if (mode === 'guided') {
      if (btnGuided) btnGuided.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-brand-950/50 border-brand-500 shadow-md block w-full";
      if (btnFree) btnFree.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn theme-panel border-slate-800 hover:border-slate-700 block w-full";
      if (badgeGuided) { badgeGuided.innerText = "✓ Gewählt"; badgeGuided.className = "text-brand-300 font-bold text-xs"; }
      if (badgeFree) { badgeFree.innerText = "○"; badgeFree.className = "text-slate-500 font-bold text-xs"; }
      if (previewWrap) previewWrap.classList.remove('opacity-40', 'pointer-events-none');
    } else {
      if (btnFree) btnFree.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-indigo-950/50 border-indigo-500 shadow-md block w-full";
      if (btnGuided) btnGuided.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn theme-panel border-slate-800 hover:border-slate-700 block w-full";
      if (badgeFree) { badgeFree.innerText = "✓ Gewählt"; badgeFree.className = "text-indigo-300 font-bold text-xs"; }
      if (badgeGuided) { badgeGuided.innerText = "○"; badgeGuided.className = "text-slate-500 font-bold text-xs"; }
      if (previewWrap) previewWrap.classList.add('opacity-40', 'pointer-events-none');
    }

    if (window.SessionLive && typeof window.SessionLive.selectMode === 'function') {
      window.SessionLive.selectMode(mode);
    }
  }

  function renderPlaybookPreview() {
    var c = document.getElementById('playbook-preview-container');
    if (!c) return;

    if (currentSelectedPlaybook.length === 0) {
      c.innerHTML = '<p class="text-slate-500 italic text-center py-4 text-xs">Keine Drehbuchschritte geladen.</p>';
      return;
    }

    c.innerHTML = currentSelectedPlaybook.map(function(step, idx) {
      return `
        <div class="p-3.5 rounded-2xl theme-panel border border-slate-800 space-y-1.5 text-xs">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1">
            <div class="flex items-center gap-1.5">
              <span class="text-brand-400 font-mono font-black">${idx + 1}.</span>
              <strong class="text-white text-xs">${escapeHtml(step.title)}</strong>
            </div>
            <span class="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">${escapeHtml(step.phase || '')}</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-snug">${escapeHtml(step.desc)}</p>
          <div class="grid grid-cols-2 gap-2 pt-1 text-[10px]">
            <div class="p-1.5 rounded-lg bg-slate-900 text-brand-200">👑 <strong>Top:</strong> ${escapeHtml(step.top || '')}</div>
            <div class="p-1.5 rounded-lg bg-slate-900 text-indigo-200">🧎 <strong>Bottom:</strong> ${escapeHtml(step.sub || '')}</div>
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
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var anatomy = window.anatomy || { A: 'penis', B: 'vulva' };

    var topName = (names && names[topPartner]) || 'Top';
    var subName = (names && names[subPartner]) || 'Bottom';
    var subAnat = (anatomy && anatomy[subPartner]) ? anatomy[subPartner] : 'vulva';

    var apiKey = getGeminiApiKey();
    if (!apiKey) {
      showToast("⚠️ Kein Gemini API-Key hinterlegt. Bitte trage deinen Key in den Einstellungen ein.");
      return;
    }

    var closet = getClosetCatalog();
    var availableToys = closet.filter(function(i) {
      return stagedTonightIds.indexOf(i.id) !== -1;
    });

    var briefing = (window.ToyCombinatorics && typeof window.ToyCombinatorics.generateAiPromptBriefing === 'function')
      ? window.ToyCombinatorics.generateAiPromptBriefing(availableToys, subAnat)
      : ("Anatomie: " + subAnat);

    showToast("⏳ Gemini schneidet das Drehbuch auf eure Schrank-Toys zu...");

    var prompt = `Du bist eine erfahrene, psychologisch feinfühlige BDSM-Regisseurin für das Paar ${topName} (Top) und ${subName} (Bottom).
Erstelle ein zusammenhängendes, hochintensives 4-Phasen-Drehbuch (genau 8 Schritte) für den heutigen Abend.

${briefing}
INTENSITÄTS-STUFE: ${sessionDepth} / 10
ENERGIELEVEL: Top: ${energyTop}/5 · Bottom: ${energySub}/5

STRIKTE REGELN:
- Verwende ausschließlich reale Gegenstände aus der Liste oder Hände/Bett/Wand.
- Ein Womanizer/Sauger darf NIEMALS am Penis angewendet werden!
- Phase 1: Warm-up & Zentrierung (Schritt 1 & 2)
- Phase 2: Machtaufbau & Begrenzung (Schritt 3 & 4)
- Phase 3: Katharsis, Zucht & Schwellen-Quälerei (Schritt 5 & 6)
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

    var candidateModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
    var parsedSteps = null;

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      try {
        var resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
          })
        });

        if (resp.ok) {
          var resData = await resp.json();
          var rawJson = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
          try {
            parsedSteps = JSON.parse(rawJson);
          } catch (pe) {
            var match = rawJson.match(/\[[\s\S]*\]/);
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
    window.isTopVoiceAssistActive = active;
    try {
      localStorage.setItem('kompass_voice_assist_active', active ? 'true' : 'false');
    } catch (e) {}

    var indicator = document.getElementById('cockpit-voice-active-indicator');
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
      localStorage.setItem('kompass_session_voice', voiceName);
    } catch (e) {}
    showToast("Stimme ausgewählt: " + voiceName);
  }

  function testVoiceSample() {
    ensureNamesAndAnatomyLoaded();
    var sel = document.getElementById('session-voice-select');
    var voiceName = sel ? sel.value : 'Despina';
    var topName = (window.names && window.names[window.topPartner]) || 'Top';
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';

    var sampleText = `Blickkontakt halten, ${subName}. ${topName} führt ab jetzt jeden deiner Atemzüge.`;

    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play(sampleText, voiceName, true);
    }
  }

  function applyPunishmentVoicePreset() {
    var sel = document.getElementById('session-voice-select');
    if (sel) sel.value = "Enceladus";
    changeVoice("Enceladus");
    toggleVoiceAssist(true);
    var toggleBox = document.getElementById('session-voice-assist-toggle');
    if (toggleBox) toggleBox.checked = true;
    showToast("⚡ Zucht-Preset aktiv: Enceladus (Autoritäre Männerstimme)");
  }

  window.SessionStaging = {
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

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', function() {
      updateRoleSelectionUI();
    });
  } else {
    updateRoleSelectionUI();
  }

})(window);
