/**
 * js/session_staging.js
 * Modul für die Vorbereitungsphase der Schlafzimmer-Regie (Schritte 1 bis 3).
 * 
 * Beinhaltet:
 * - Schritt 1: Rollenverteilung (Standard Top/Bottom vs. Rollenwechsel)
 * - Schritt 2: Tagesform-Check-in (Energie Top / Hingabe Bottom / Härtegrad 1–10)
 * - Schritt 2: Nachttisch-Staging (Equipment-Filter, Schrank-Kategorien, Presets)
 * - Schritt 2: Musik- & Audio-Konfiguration (Eigene Playlists / Ambient-Soundscapes)
 * - Schritt 2: Top-Sprachassistenz-Setup (Gemini 3.8 Modell-Erkennung, Stimme & Probehören)
 * - Schritt 3: Dynamischer 4-Phasen-Drehbuch-Generator mit Würfel-Funktion & Vorschau
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var portalSelectedRoleSetup = 'default';
  var topPartner = 'B';
  var subPartner = 'A';
  var currentStagingCategory = 'household';
  var activeEquipmentIds = [];
  var currentSelectedPlaybook = [];
  var sessionDepth = 7;

  var names = { A: 'Partner 1', B: 'Partner 2' };
  var anatomy = { A: 'penis', B: 'vulva' };
  var answers = { A: {}, B: {} };
  var isTopVoiceAssistActive = false;
  var activeSessionVoice = 'Despina';
  var activeDiscoveredModel = "gemini-3.8-flash";

  function loadStagingData() {
    try {
      var nm = localStorage.getItem('kompass_names');
      if (nm && nm !== 'null') names = JSON.parse(nm);

      var an = localStorage.getItem('kompass_anatomy');
      if (an && an !== 'null') anatomy = JSON.parse(an);

      var ans = localStorage.getItem('kompass_answers');
      if (ans && ans !== 'null') answers = JSON.parse(ans);

      var eq = localStorage.getItem('kompass_active_equipment_ids');
      if (eq && eq !== 'null') activeEquipmentIds = JSON.parse(eq);

      var v = localStorage.getItem('kompass_session_voice');
      if (v) activeSessionVoice = v;

      var va = localStorage.getItem('kompass_voice_assist_active');
      if (va) isTopVoiceAssistActive = (va === 'true');

      var dm = localStorage.getItem('kompass_discovered_model');
      if (dm && dm.indexOf('2.5') === -1 && dm.indexOf('omni') === -1 && dm.indexOf('image') === -1 && dm.indexOf('video') === -1) {
        activeDiscoveredModel = dm;
      } else {
        activeDiscoveredModel = "gemini-3.8-flash";
        try { localStorage.setItem('kompass_discovered_model', activeDiscoveredModel); } catch (e) {}
      }

      var pl = localStorage.getItem('kompass_custom_playlist_url');
      var plInput = document.getElementById('custom-playlist-link-input');
      if (plInput && pl) plInput.value = pl;
      var plBtn = document.getElementById('btn-launch-external-music');
      if (plBtn && pl) plBtn.href = pl.startsWith('http') ? pl : ('https://' + pl);
    } catch (e) {
      console.error("Staging Data Load Error:", e);
    }

    if (!names || typeof names !== 'object') names = { A: 'Partner 1', B: 'Partner 2' };
    if (!anatomy || typeof anatomy !== 'object') anatomy = { A: 'penis', B: 'vulva' };
    if (!answers || typeof answers !== 'object') answers = { A: {}, B: {} };
    if (!answers.A) answers.A = {};
    if (!answers.B) answers.B = {};
    if (!activeEquipmentIds || !Array.isArray(activeEquipmentIds) || activeEquipmentIds.length === 0) {
      var catalog = window.equipmentCatalog || [];
      activeEquipmentIds = catalog.filter(function(i) { return i.defaultPresent; }).map(function(i) { return i.id; });
    }

    window.names = names;
    window.answers = answers;
    window.topPartner = topPartner;
    window.subPartner = subPartner;
    window.sessionDepth = sessionDepth;
    window.isTopVoiceAssistActive = isTopVoiceAssistActive;
  }

  function selectPortalRoleSetup(setup) {
    portalSelectedRoleSetup = setup;
    if (setup === 'default') {
      topPartner = 'B';
      subPartner = 'A';
    } else {
      topPartner = 'A';
      subPartner = 'B';
    }
    window.topPartner = topPartner;
    window.subPartner = subPartner;
    updatePortalRoleCards();
    setupInitialPlaybook();
    if (typeof window.updateHeaderTabuCounter === 'function') {
      window.updateHeaderTabuCounter();
    }
  }

  function updatePortalRoleCards() {
    var bDef = document.getElementById('btn-role-setup-default');
    var bRev = document.getElementById('btn-role-setup-reversed');
    var badgeDef = document.getElementById('badge-role-default');
    var badgeRev = document.getElementById('badge-role-reversed');

    var nameTopDef = document.getElementById('portal-name-top-def');
    var nameSubDef = document.getElementById('portal-name-sub-def');
    var nameTopRev = document.getElementById('portal-name-top-rev');
    var nameSubRev = document.getElementById('portal-name-sub-rev');

    if (nameTopDef) nameTopDef.innerText = names.B || 'Partner 2';
    if (nameSubDef) nameSubDef.innerText = names.A || 'Partner 1';
    if (nameTopRev) nameTopRev.innerText = names.A || 'Partner 1';
    if (nameSubRev) nameSubRev.innerText = names.B || 'Partner 2';

    if (portalSelectedRoleSetup === 'default') {
      if (bDef) bDef.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-brand-950/30 border-brand-500 shadow-md block w-full";
      if (bRev) bRev.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn theme-panel border-slate-800 hover:border-slate-700 block w-full";
      if (badgeDef) { badgeDef.innerText = "✓ Aktiv"; badgeDef.className = "text-sm font-bold text-brand-300"; }
      if (badgeRev) { badgeRev.innerText = "○"; badgeRev.className = "text-sm font-bold text-slate-500"; }
    } else {
      if (bRev) bRev.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn bg-brand-950/30 border-brand-500 shadow-md block w-full";
      if (bDef) bDef.className = "p-4 rounded-2xl border text-left space-y-2 transition-all touch-btn theme-panel border-slate-800 hover:border-slate-700 block w-full";
      if (badgeRev) { badgeRev.innerText = "✓ Aktiv"; badgeRev.className = "text-sm font-bold text-brand-300"; }
      if (badgeDef) { badgeDef.innerText = "○"; badgeDef.className = "text-sm font-bold text-slate-500"; }
    }

    var sub = document.getElementById('session-roles-subtitle');
    if (sub) {
      sub.innerText = "Top: " + (names[topPartner] || 'Top') + " · Bottom: " + (names[subPartner] || 'Bottom');
    }
  }

  function goToPortalStepSafe(step) {
    [1, 2, 3].forEach(function(s) {
      var el = document.getElementById('portal-step-' + s);
      if (el) {
        if (s === step) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  function switchStagingTab(cat) {
    currentStagingCategory = cat;
    ['household', 'bondage', 'impact', 'sensory', 'cbt_clamps', 'toys_anal', 'special'].forEach(function(c) {
      var btn = document.getElementById('btn-stag-tab-' + c);
      if (btn) {
        if (c === cat) {
          btn.className = "px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold bg-brand-700 text-white touch-btn whitespace-nowrap";
        } else {
          btn.className = "px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold theme-panel text-slate-300 touch-btn whitespace-nowrap";
        }
      }
    });
    renderEquipmentStagingGrid();
  }

  function updateStagingTabCounters() {
    var catalog = window.equipmentCatalog || [];
    ['household', 'bondage', 'impact', 'sensory', 'cbt_clamps', 'toys_anal', 'special'].forEach(function(c) {
      var count = catalog.filter(function(i) { return i.category === c && activeEquipmentIds.indexOf(i.id) !== -1; }).length;
      var el = document.getElementById('stag-count-' + c);
      if (el) el.innerText = count;
    });
  }

  function renderEquipmentStagingGrid() {
    var grid = document.getElementById('session-staging-equipment-grid');
    var countEl = document.getElementById('staging-active-count');
    var catalog = window.equipmentCatalog || [];
    if (!grid) return;

    var filtered = catalog.filter(function(i) { return i.category === currentStagingCategory; });

    grid.innerHTML = filtered.map(function(item) {
      var isChecked = activeEquipmentIds.indexOf(item.id) !== -1;
      return `
        <button type="button" onclick="toggleStagingEquipment('${item.id}')" class="p-2.5 rounded-xl border text-left transition-all touch-btn block ${isChecked ? 'bg-brand-950/60 border-brand-500 text-white font-bold' : 'theme-panel border-slate-800 text-slate-400 hover:border-slate-700'}">
          <div class="flex items-center justify-between">
            <span class="truncate text-[10.5px]">${escapeHtml(item.name)}</span>
            <span class="text-[9.5px] ml-1 flex-shrink-0 ${isChecked ? 'text-brand-300' : 'text-slate-600'}">${isChecked ? '✓' : '○'}</span>
          </div>
          <p class="text-[9.5px] text-slate-500 font-normal truncate mt-0.5">${escapeHtml(item.desc)}</p>
        </button>
      `;
    }).join('');

    if (countEl) countEl.innerText = activeEquipmentIds.length;
    updateStagingTabCounters();
    try {
      localStorage.setItem('kompass_active_equipment_ids', JSON.stringify(activeEquipmentIds));
    } catch (e) {}
  }

  function toggleStagingEquipment(id) {
    var idx = activeEquipmentIds.indexOf(id);
    if (idx !== -1) {
      activeEquipmentIds.splice(idx, 1);
    } else {
      activeEquipmentIds.push(id);
    }
    renderEquipmentStagingGrid();
    setupInitialPlaybook();
  }

  function selectEquipmentPreset(preset) {
    var catalog = window.equipmentCatalog || [];
    if (preset === 'bare') {
      activeEquipmentIds = [];
      showToast("Bereitgelegt: Nur nackte Hände & Bett");
    } else if (preset === 'household') {
      activeEquipmentIds = catalog.filter(function(i) { return i.category === 'household'; }).map(function(i) { return i.id; });
      showToast("Bereitgelegt: Alle Haushaltsgegenstände");
    } else {
      activeEquipmentIds = catalog.map(function(i) { return i.id; });
      showToast("Bereitgelegt: Gesamte Ausrüstung");
    }
    renderEquipmentStagingGrid();
    setupInitialPlaybook();
  }

  function updateCheckinEnergy(userRole, val) {
    var num = parseInt(val, 10);
    var topDesc = ["", "Erschöpft & ruhig", "Ausgeglichen", "Präsent & fokussiert", "Kraftvoll & dominant", "Voller Tatendrang"];
    var subDesc = ["", "Vorsichtig & sensibel", "Ruhig empfangend", "Offen & empfänglich", "Tief hingebungsvoll", "Hungrig nach Führung"];

    if (userRole === 'top') {
      var lTop = document.getElementById('label-energy-top');
      var dTop = document.getElementById('desc-energy-top');
      if (lTop) lTop.innerText = num + " / 5";
      if (dTop) dTop.innerText = topDesc[num];
    } else {
      var lSub = document.getElementById('label-energy-sub');
      var dSub = document.getElementById('desc-energy-sub');
      if (lSub) lSub.innerText = num + " / 5";
      if (dSub) dSub.innerText = subDesc[num];
    }
    setupInitialPlaybook();
  }

  function updateSessionDepth(val) {
    sessionDepth = parseInt(val, 10);
    window.sessionDepth = sessionDepth;

    var badge = document.getElementById('label-session-depth');
    var desc = document.getElementById('desc-session-depth');
    var labels = ["", "Sanftes Vorspiel", "Zarte Führung", "Sinnlicher Einstieg", "Spürbare Macht", "Klare Unterwerfung", "Fordernde Disziplin", "Intensive Führung", "Strenge Zucht", "Tiefe Hingabe", "Grenzerfahrung"];

    if (badge) badge.innerText = "Stufe " + sessionDepth + " / 10 (" + (labels[sessionDepth] || '') + ")";
    if (desc) {
      if (sessionDepth <= 3) desc.innerText = "Fokus auf Entschleunigung, Berührungsqualität und sanftem Halten.";
      else if (sessionDepth <= 7) desc.innerText = "Feste Führung mit spürbaren Reizen, Fesselung und klarer Disziplinierung.";
      else desc.innerText = "Strikte Hierarchie, intensive Impact-Reize und lückenlose Kontrolle.";
    }
    setupInitialPlaybook();
  }

  function getGeminiApiKey() {
    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return DEFAULT_PRESET_GEMINI_KEY;
  }

  function saveSessionGeminiKey(val) {
    var trimmed = (val || '').trim();
    try {
      localStorage.setItem('kompass_gemini_api_key', trimmed);
      showToast("Gemini Key gespeichert");
      testGeminiConnectionInSession(false);
      if (window.SessionVoice && typeof window.SessionVoice.preloadCore === 'function') {
        window.SessionVoice.preloadCore(activeSessionVoice);
      }
    } catch (e) {}
  }

  async function testGeminiConnectionInSession(silent) {
    var key = getGeminiApiKey();
    if (!silent) showToast("⏳ Ermittle unterstützte Gemini-Modelle...");
    var badge = document.getElementById('gemini-active-model-badge');

    try {
      var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key));
      if (resp.ok) {
        var data = await resp.json();
        var modelsList = data.models || [];

        var contentModels = modelsList.filter(function(m) { 
          return m.supportedGenerationMethods && 
            m.supportedGenerationMethods.indexOf('generateContent') !== -1 &&
            m.name.indexOf('flash') !== -1 &&
            m.name.indexOf('tts') === -1 &&
            m.name.indexOf('2.5') === -1 &&
            m.name.indexOf('omni') === -1 &&
            m.name.indexOf('image') === -1 &&
            m.name.indexOf('video') === -1;
        });

        if (contentModels.length > 0) {
          var preferred = contentModels.find(function(m) { return m.name.indexOf('3.8-flash') !== -1 && m.name.indexOf('lite') === -1; });
          activeDiscoveredModel = preferred ? preferred.name.replace('models/', '') : contentModels[0].name.replace('models/', '');
          localStorage.setItem('kompass_discovered_model', activeDiscoveredModel);
        } else {
          activeDiscoveredModel = "gemini-3.8-flash";
          localStorage.setItem('kompass_discovered_model', activeDiscoveredModel);
        }

        if (badge) badge.innerText = "Modell: " + activeDiscoveredModel;
        if (!silent) showToast("✓ Verbunden! Modell: " + activeDiscoveredModel + " aktiv.");
        return true;
      } else {
        var errData = await resp.json().catch(function() { return {}; });
        var errMsg = errData.error?.message || ("Status " + resp.status);
        if (!silent) showToast("⚠️ Verbindungsfehler: " + errMsg);
      }
    } catch (e) {
      if (!silent) showToast("⚠️ Netzwerkfehler beim Verbindungstest");
    }

    if (badge) badge.innerText = "Modell: " + activeDiscoveredModel;
    return false;
  }

  function changeSessionVoice(val) {
    activeSessionVoice = val;
    localStorage.setItem('kompass_session_voice', val);
    showToast("Stimme gewechselt: " + val);
    if (window.SessionVoice && typeof window.SessionVoice.preloadCore === 'function') {
      window.SessionVoice.preloadCore(val);
    }
  }

  function toggleTopVoiceAssistance(checked) {
    isTopVoiceAssistActive = checked;
    window.isTopVoiceAssistActive = checked;
    localStorage.setItem('kompass_voice_assist_active', checked ? 'true' : 'false');
    var ind = document.getElementById('cockpit-voice-active-indicator');
    if (ind) {
      if (checked) ind.classList.remove('hidden');
      else ind.classList.add('hidden');
    }
    showToast(checked ? "Akustische Führung aktiviert" : "Akustische Führung stummgeschaltet");
  }

  function applyPunishmentVoicePreset() {
    activeSessionVoice = 'Enceladus';
    var sel = document.getElementById('session-voice-select');
    if (sel) sel.value = 'Enceladus';
    isTopVoiceAssistActive = true;
    window.isTopVoiceAssistActive = true;
    var tog = document.getElementById('session-voice-assist-toggle');
    if (tog) tog.checked = true;
    localStorage.setItem('kompass_session_voice', 'Enceladus');
    localStorage.setItem('kompass_voice_assist_active', 'true');
    showToast("Straf-Preset aktiv: Tiefe Männerstimme (Enceladus)");
    testGeminiVoiceSample();
  }

  function testGeminiVoiceSample() {
    if (window.SessionVoice) {
      if (typeof window.SessionVoice.isPlaying === 'function' && window.SessionVoice.isPlaying()) {
        window.SessionVoice.stop();
        return;
      }
      if (typeof window.SessionVoice.unlock === 'function') {
        window.SessionVoice.unlock();
      }
    }

    var isMale = (activeSessionVoice === 'Enceladus' || activeSessionVoice === 'Fenrir');
    var sampleText = isMale
      ? "Aufrecht stehen, Hände hinter den Rücken und stillhalten."
      : "Atme tief in den Bauchraum aus und überlass mir die Kontrolle.";

    if (window.SessionVoice && window.SessionVoice.play) {
      window.SessionVoice.play(sampleText, activeSessionVoice, true);
    }
  }

  function shuffleArray(array) {
    var currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      var tmp = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = tmp;
    }
    return array;
  }

  function setupInitialPlaybook() {
    var topName = (names && names[topPartner]) || 'Top';
    var subName = (names && names[subPartner]) || 'Bottom';

    var activeTools = (typeof window.getActiveSessionEquipment === "function") 
      ? window.getActiveSessionEquipment(activeEquipmentIds).map(function(t) { return t.name; })
      : ["Nackte Hände", "Ledergürtel", "Krawatte", "Bettkante", "Fußboden"];

    activeTools = shuffleArray(activeTools.slice());

    var tool1 = activeTools[0] || "Nackte Hände";
    var tool2 = activeTools[1] || "Krawatte oder Seidenschal";
    var tool3 = activeTools[2] || "Ledergürtel oder Holzspachtel";

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
        title: "Fixierung & Arretierung",
        desc: topName + " fixiert die Hände von " + subName + " mit " + tool2 + " vor oder hinter dem Körper.",
        top: "Schließe " + tool2 + " sicher um die Handgelenke und prüfe den festen Sitz.",
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
        title: "Fordernde Reizsetzung & Spanking",
        desc: "Gezielte, rhythmische Reize mit " + tool3 + " auf das entblößte Gesäß zur Durchwärmung.",
        top: "Setze dosierte Treffer mit " + tool3 + " und achte auf das Mitzählen.",
        sub: "Zähle jeden Treffer laut und andächtig mit."
      },
      {
        phase: "Phase 3: Katharsis & Zucht",
        title: "Edging & Erregungskontrolle",
        desc: topName + " treibt " + subName + " gezielt an die Kante des Höhepunkts und befiehlt Stillstand.",
        top: "Führe die Erregung präzise an die Kante und fordere Reglosigkeit.",
        sub: "Spüre das Pochen an der Kante und gehorche dem Stopp-Befehl."
      },
      {
        phase: "Phase 4: Katharsis & Aftercare",
        title: "Höhepunkt-Entscheidung des Tops",
        desc: topName + " entscheidet souverän über Freigabe, Ruined Orgasm oder Denial.",
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

  function renderPlaybookPreview() {
    var c = document.getElementById('playbook-preview-container');
    if (!c) return;

    c.innerHTML = currentSelectedPlaybook.map(function(step, idx) {
      return `
        <div class="p-3 rounded-2xl theme-panel border border-slate-800 space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[9.5px] font-bold text-brand-300 uppercase tracking-wider">${escapeHtml(step.phase)}</span>
            <span class="text-[10px] text-slate-500 font-mono">Schritt ${idx + 1}</span>
          </div>
          <strong class="text-xs text-white block">${escapeHtml(step.title)}</strong>
          <p class="text-[11px] text-slate-300 leading-snug">${escapeHtml(step.desc)}</p>
        </div>
      `;
    }).join('');
  }

  function rerollPlaybook() {
    setupInitialPlaybook();
    showToast("Drehbuch frisch zusammengestellt");
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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initStaging() {
    loadStagingData();
    updatePortalRoleCards();
    setupInitialPlaybook();
    updateStagingTabCounters();
    renderEquipmentStagingGrid();

    var vSelect = document.getElementById('session-voice-select');
    var vToggle = document.getElementById('session-voice-assist-toggle');
    var keyInput = document.getElementById('session-gemini-key-input');
    var badge = document.getElementById('gemini-active-model-badge');

    if (vSelect) vSelect.value = activeSessionVoice;
    if (vToggle) vToggle.checked = isTopVoiceAssistActive;
    if (keyInput) keyInput.value = getGeminiApiKey();
    if (badge && activeDiscoveredModel) badge.innerText = "Modell: " + activeDiscoveredModel;

    testGeminiConnectionInSession(true);

    if (window.SessionVoice && typeof window.SessionVoice.preloadCore === 'function') {
      window.SessionVoice.preloadCore(activeSessionVoice);
    }
  }

  window.SessionStaging = {
    init: initStaging,
    selectRoleSetup: selectPortalRoleSetup,
    goToStep: goToPortalStepSafe,
    switchStagingTab: switchStagingTab,
    toggleEquipment: toggleStagingEquipment,
    selectPreset: selectEquipmentPreset,
    updateEnergy: updateCheckinEnergy,
    updateDepth: updateSessionDepth,
    saveGeminiKey: saveSessionGeminiKey,
    testGeminiConnection: testGeminiConnectionInSession,
    changeVoice: changeSessionVoice,
    toggleVoiceAssist: toggleTopVoiceAssistance,
    applyPunishmentVoicePreset: applyPunishmentVoicePreset,
    testVoiceSample: testGeminiVoiceSample,
    rerollPlaybook: rerollPlaybook
  };

  // Globale Aliase für Inline-HTML-Event-Handler
  window.selectPortalRoleSetup = selectPortalRoleSetup;
  window.goToPortalStepSafe = goToPortalStepSafe;
  window.switchStagingTab = switchStagingTab;
  window.toggleStagingEquipment = toggleStagingEquipment;
  window.selectEquipmentPreset = selectEquipmentPreset;
  window.updateCheckinEnergy = updateCheckinEnergy;
  window.updateSessionDepth = updateSessionDepth;
  window.saveSessionGeminiKey = saveSessionGeminiKey;
  window.testGeminiConnectionInSession = testGeminiConnectionInSession;
  window.changeSessionVoice = changeSessionVoice;
  window.toggleTopVoiceAssistance = toggleTopVoiceAssistance;
  window.applyPunishmentVoicePreset = applyPunishmentVoicePreset;
  window.testGeminiVoiceSample = testGeminiVoiceSample;
  window.rerollPlaybook = rerollPlaybook;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initStaging);
  } else {
    initStaging();
  }

})(window);
