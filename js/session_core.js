/**
 * js/session_core.js
 * Zentrales Steuerungs- und Regie-Modul für das Schlafzimmer-Cockpit.
 * 
 * Beinhaltet:
 * - Setup- & Rollenverteilung (Top/Bottom)
 * - Nachttisch-Staging & Equipment-Auswahl
 * - Dynamischer 4-Phasen-Drehbuch-Generator
 * - Cockpit-Timer, Pausenfunktion & Screen Wake Lock
 * - Edging-Fernbedienung mit Erregungs-Schieberegler (1–10)
 * - Safeword-Ampel & Notfall-Schaltungen
 * - Aftercare-Protokoll & Tagebuch-Speicherung
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var portalSelectedRoleSetup = 'default';
  var topPartner = 'B';
  var subPartner = 'A';
  var currentSessionMode = 'guided';
  var sessionRemainingSeconds = 3600;
  var sessionTotalSeconds = 3600;
  var isSessionPaused = false;
  var sessionTimerInterval = null;
  var screenWakeLock = null;

  var names = { A: 'Partner 1', B: 'Partner 2' };
  var anatomy = { A: 'penis', B: 'vulva' };
  var answers = { A: {}, B: {} };
  var sessionDiary = [];
  var currentSessionLog = [];

  var isTopVoiceAssistActive = false;
  var activeSessionVoice = 'Despina';
  var activeDiscoveredModel = "gemini-2.5-flash"; 

  var currentStagingCategory = 'household';
  var activeEquipmentIds = [];

  var activeArousalLevel = 5;
  var edgingStimulationBy = 'top';
  var edgeCount = 0;
  var lastEdgeTimestamp = null;
  var lastEdgeIntervalTimer = null;
  var cooldownTimerInterval = null;
  var cooldownSecondsRemaining = 45;
  var currentEdgingCountdown = 10;
  var isCountdownActive = false;
  var isEdgingCountdownPaused = false;
  var countdownRunId = 0;

  var currentSelectedPlaybook = [];
  var liveStepIndex = 0;
  var sessionDepth = 7;

  function ensureSessionDataIntegrity() {
    if (!names || typeof names !== 'object') names = { A: 'Partner 1', B: 'Partner 2' };
    if (!anatomy || typeof anatomy !== 'object') anatomy = { A: 'penis', B: 'vulva' };
    if (!answers || typeof answers !== 'object') answers = { A: {}, B: {} };
    if (!answers.A) answers.A = {};
    if (!answers.B) answers.B = {};
    if (!sessionDiary || !Array.isArray(sessionDiary)) sessionDiary = [];
    if (!activeEquipmentIds || !Array.isArray(activeEquipmentIds)) activeEquipmentIds = [];
  }

  function toggleAmbientMusicWrapper() { 
    if (window.SessionAudio && window.SessionAudio.toggle) window.SessionAudio.toggle(); 
  }
  
  function setSoundscapeStyleWrapper(style) { 
    if (window.SessionAudio && window.SessionAudio.setStyle) window.SessionAudio.setStyle(style); 
  }
  
  function adjustAmbientEnergyWrapper(dir) { 
    if (window.SessionAudio && window.SessionAudio.adjustEnergy) window.SessionAudio.adjustEnergy(dir); 
  }
  
  function selectMusicSourceWrapper(src) { 
    if (window.SessionAudio && window.SessionAudio.selectSource) window.SessionAudio.selectSource(src); 
  }
  
  function saveCustomPlaylistLinkWrapper(val) {
    var link = (val || '').trim();
    try {
      localStorage.setItem('kompass_custom_playlist_url', link);
      var btn = document.getElementById('btn-launch-external-music');
      if (btn && link) btn.href = link.startsWith('http') ? link : ('https://' + link);
      showToast("Playlist-Link hinterlegt");
    } catch (e) {}
  }

  function openIncidentDisciplineModalWrapper() { 
    if (window.SessionDiscipline && window.SessionDiscipline.open) window.SessionDiscipline.open(); 
  }
  
  function closeIncidentDisciplineModalWrapper() { 
    if (window.SessionDiscipline && window.SessionDiscipline.close) window.SessionDiscipline.close(); 
  }
  
  function selectIncidentCategoryWrapper(cat) { 
    if (window.SessionDiscipline && window.SessionDiscipline.selectCategory) window.SessionDiscipline.selectCategory(cat); 
  }
  
  function handleReasonLiveInputWrapper(val) { 
    if (window.SessionDiscipline && window.SessionDiscipline.handleReasonInput) window.SessionDiscipline.handleReasonInput(val); 
  }
  
  function setStageSeverityWrapper(stage, sev) { 
    if (window.SessionDiscipline && window.SessionDiscipline.setSeverity) window.SessionDiscipline.setSeverity(stage, sev); 
  }
  
  function prevWizardStageWrapper() { 
    if (window.SessionDiscipline && window.SessionDiscipline.prevStage) window.SessionDiscipline.prevStage(); 
  }
  
  function nextWizardStageWrapper() { 
    if (window.SessionDiscipline && window.SessionDiscipline.nextStage) window.SessionDiscipline.nextStage(); 
  }
  
  function rerollCurrentWizardStageWrapper() { 
    if (window.SessionDiscipline && window.SessionDiscipline.rerollStage) window.SessionDiscipline.rerollStage(); 
  }
  
  function applyConfiguredDisciplineWrapper() { 
    if (window.SessionDiscipline && window.SessionDiscipline.apply) window.SessionDiscipline.apply(); 
  }

  function triggerSafewordWrapper(color) {
    var ind = document.getElementById('safeword-red-indicator');
    var time = getFormattedTimeNow();

    if (color === 'green') {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword GRÜN: Bestätigung" });
      showToast("GRÜN bestätigt: Alles in bester Ordnung");
      if (isTopVoiceAssistActive && window.SessionVoice) window.SessionVoice.play("Grün. Sehr gut.");
    } else if (color === 'yellow') {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword GELB: Tempo drosseln" });
      showToast("⚠️ GELB ausgelöst: Tempo drosseln!");
      if (window.SessionAudio) window.SessionAudio.adjustEnergy('calm');
      if (isTopVoiceAssistActive && window.SessionVoice) window.SessionVoice.play("Gelb registriert. Tempo drosseln und durchatmen.");
    } else {
      currentSessionLog.push({ type: "safeword", time: time, label: "Safeword ROT: Sofort-Abbruch" });
      if (ind) ind.classList.add('animate-ping');
      isSessionPaused = true;
      if (window.SessionAudio && window.SessionAudio.stopAll) window.SessionAudio.stopAll();
      showToast("🛑 ROT AUSGELÖST: Sofortiger Stillstand!");
      if (isTopVoiceAssistActive && window.SessionVoice) window.SessionVoice.play("Halt. Sofortiger Stopp aller Handlungen.");
      setTimeout(function() { 
        if (ind) ind.classList.remove('animate-ping'); 
      }, 4000);
    }
  }

  function registerEdgeReachedWrapper() {
    edgeCount++;
    lastEdgeTimestamp = Date.now();
    var hitsEl = document.getElementById('edging-total-hits');
    if (hitsEl) hitsEl.innerText = edgeCount;

    currentSessionLog.push({ type: "action", time: getFormattedTimeNow(), label: "Edge #" + edgeCount + " erreicht (Stufe 10)" });
    showToast("Edge #" + edgeCount + " registriert!");
    startLastEdgeTimer();
    startCooldownBreathingTimer();

    if (isTopVoiceAssistActive && window.SessionVoice) {
      window.SessionVoice.play("Kante! Hände sofort weg und stillhalten!");
    }
  }

  function startLiveSessionWrapper() {
    if (window.SessionVoice && window.SessionVoice.unlock) window.SessionVoice.unlock();
    if (window.SessionAudio && window.SessionAudio.ensureGraph) window.SessionAudio.ensureGraph();
    acquireScreenWakeLock();

    var pContainer = document.getElementById('portal-setup-container');
    var cContainer = document.getElementById('cockpit-live-container');
    var badge = document.getElementById('session-active-badge');
    var gContainer = document.getElementById('guided-step-container');

    if (pContainer) pContainer.classList.add('hidden');
    if (cContainer) cContainer.classList.remove('hidden');
    if (badge) badge.classList.remove('hidden');

    if (currentSessionMode === 'free') {
      if (gContainer) gContainer.classList.add('hidden');
    } else {
      if (gContainer) gContainer.classList.remove('hidden');
      renderLiveStep();
    }

    sessionRemainingSeconds = sessionTotalSeconds = 3600;
    isSessionPaused = false;
    startSessionTimer();

    currentSessionLog = [
      { type: "system", time: getFormattedTimeNow(), label: "Session gestartet" }
    ];

    if (isTopVoiceAssistActive && window.SessionVoice) {
      var topName = names[topPartner] || 'Top';
      window.SessionVoice.play("Session begonnen. " + topName + " übernimmt ab jetzt die Führung.");
    }
  }

  function initSessionPortal() {
    loadSessionStorageData();
    updatePortalRoleCards();
    setupInitialPlaybook();
    initEquipmentStaging();
    checkUnratedSessions();
    updateHeaderTabuCounter();

    if (window.SessionVoice && typeof window.SessionVoice.preloadCore === 'function') {
      window.SessionVoice.preloadCore(activeSessionVoice);
    }
  }

  function loadSessionStorageData() {
    try {
      var nm = localStorage.getItem('kompass_names');
      if (nm && nm !== 'null') names = JSON.parse(nm);

      var an = localStorage.getItem('kompass_anatomy');
      if (an && an !== 'null') anatomy = JSON.parse(an);

      var ans = localStorage.getItem('kompass_answers');
      if (ans && ans !== 'null') answers = JSON.parse(ans);

      var dia = localStorage.getItem('kompass_session_diary');
      if (dia && dia !== 'null') sessionDiary = JSON.parse(dia);

      var eq = localStorage.getItem('kompass_active_equipment_ids');
      if (eq && eq !== 'null') activeEquipmentIds = JSON.parse(eq);

      var v = localStorage.getItem('kompass_session_voice');
      if (v) activeSessionVoice = v;

      var va = localStorage.getItem('kompass_voice_assist_active');
      if (va) isTopVoiceAssistActive = (va === 'true');

      var dm = localStorage.getItem('kompass_discovered_model');
      if (dm) activeDiscoveredModel = dm;

      var pl = localStorage.getItem('kompass_custom_playlist_url');
      var plInput = document.getElementById('custom-playlist-link-input');
      if (plInput && pl) plInput.value = pl;
      var plBtn = document.getElementById('btn-launch-external-music');
      if (plBtn && pl) plBtn.href = pl.startsWith('http') ? pl : ('https://' + pl);
    } catch (e) {
      console.error("Data load error", e);
    }

    ensureSessionDataIntegrity();

    if (activeEquipmentIds.length === 0) {
      var catalog = window.equipmentCatalog || [];
      activeEquipmentIds = catalog.filter(function(i) { return i.defaultPresent; }).map(function(i) { return i.id; });
    }

    window.subPartner = subPartner;
    window.topPartner = topPartner;
    window.names = names;
    window.answers = answers;
    window.currentSessionLog = currentSessionLog;
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
    window.subPartner = subPartner;
    window.topPartner = topPartner;
    updatePortalRoleCards();
    setupInitialPlaybook();
    updateHeaderTabuCounter();
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
    try {
      [1, 2, 3].forEach(function(s) {
        var el = document.getElementById('portal-step-' + s);
        if (el) {
          if (s === step) el.classList.remove('hidden');
          else el.classList.add('hidden');
        }
      });
      
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (scrollEx) {
        window.scrollTo(0, 0);
      }
    } catch (e) {
      console.error("Step Nav Error:", e);
    }
  }

  function switchStagingTab(cat) {
    currentStagingCategory = cat;
    var cats = ['household', 'bondage', 'impact', 'sensory', 'cbt_clamps', 'toys_anal', 'special'];
    cats.forEach(function(c) {
      var btn = document.getElementById('btn-stag-tab-' + c);
      if (btn) {
        if (c === cat) btn.className = "px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold bg-brand-700 text-white touch-btn whitespace-nowrap";
        else btn.className = "px-2.5 py-1.5 rounded-xl text-[10.5px] font-bold theme-panel text-slate-300 touch-btn whitespace-nowrap";
      }
    });
    renderEquipmentStagingGrid();
  }

  function initEquipmentStaging() {
    updateStagingTabCounters();
    renderEquipmentStagingGrid();
  }

  function updateStagingTabCounters() {
    var catalog = window.equipmentCatalog || [];
    var cats = ['household', 'bondage', 'impact', 'sensory', 'cbt_clamps', 'toys_anal', 'special'];
    cats.forEach(function(c) {
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
    if (activeEquipmentIds.indexOf(id) !== -1) {
      activeEquipmentIds = activeEquipmentIds.filter(function(i) { return i !== id; });
    } else {
      activeEquipmentIds.push(id);
    }
    renderEquipmentStagingGrid();
  }

  function selectEquipmentPreset(preset) {
    var catalog = window.equipmentCatalog || [];
    if (preset === 'bare') {
      activeEquipmentIds = [];
      showToast("Bereitgelegt: Nur nackte Hände & Schlafzimmer");
    } else if (preset === 'household') {
      activeEquipmentIds = catalog.filter(function(i) { return i.category === 'household'; }).map(function(i) { return i.id; });
      showToast("Bereitgelegt: Alle Haushaltsgegenstände");
    } else {
      activeEquipmentIds = catalog.map(function(i) { return i.id; });
      showToast("Bereitgelegt: Gesamte Ausrüstung");
    }
    renderEquipmentStagingGrid();
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
      testGeminiConnectionInSession();
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
            m.name.indexOf('tts') === -1;
        });
        if (contentModels.length > 0) {
          contentModels.sort(function(a, b) { return b.name.localeCompare(a.name); });
          activeDiscoveredModel = contentModels[0].name.replace('models/', '');
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

  function initVoiceSettings() {
    var vSelect = document.getElementById('session-voice-select');
    var vToggle = document.getElementById('session-voice-assist-toggle');
    var keyInput = document.getElementById('session-gemini-key-input');
    var badge = document.getElementById('gemini-active-model-badge');

    if (vSelect) vSelect.value = activeSessionVoice;
    if (vToggle) vToggle.checked = isTopVoiceAssistActive;
    if (keyInput) keyInput.value = getGeminiApiKey();
    if (badge && activeDiscoveredModel) badge.innerText = "Modell: " + activeDiscoveredModel;

    testGeminiConnectionInSession(true);
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
    if (window.SessionVoice && window.SessionVoice.unlock) window.SessionVoice.unlock();
    var isMale = (activeSessionVoice === 'Enceladus' || activeSessionVoice === 'Fenrir');
    var sampleText = isMale
      ? "Aufrecht stehen, Hände hinter den Rücken und stillhalten."
      : "Atme tief in den Bauchraum aus und überlass mir die Kontrolle.";
    if (window.SessionVoice && window.SessionVoice.play) {
      window.SessionVoice.play(sampleText, activeSessionVoice, true);
    }
  }

  function triggerAirPlayPicker() {
    var airplayAudio = document.getElementById('ambient-airplay-audio');
    if (airplayAudio && typeof airplayAudio.webkitShowPlaybackTargetPicker === 'function') {
      airplayAudio.webkitShowPlaybackTargetPicker();
    } else {
      showToast("AirPlay über Kontrollzentrum des Geräts steuern");
    }
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

  function selectSessionMode(mode) {
    currentSessionMode = mode;
    if (mode === 'guided') {
      goToPortalStepSafe(3);
    } else {
      startLiveSessionWrapper();
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
    var topName = names[topPartner] || 'Top';
    var subName = names[subPartner] || 'Bottom';

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

  function startSessionTimer() {
    if (sessionTimerInterval) clearInterval(sessionTimerInterval);
    sessionTimerInterval = setInterval(function() {
      if (!isSessionPaused && sessionRemainingSeconds > 0) {
        sessionRemainingSeconds--;
        updateTimerDisplay();
      } else if (sessionRemainingSeconds <= 0) {
        clearInterval(sessionTimerInterval);
        endSessionToAftercare();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    var disp = document.getElementById('session-timer-display');
    if (!disp) return;
    var m = Math.floor(sessionRemainingSeconds / 60);
    var s = sessionRemainingSeconds % 60;
    disp.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  }

  function togglePauseTimer() {
    isSessionPaused = !isSessionPaused;
    var btn = document.getElementById('btn-pause-timer');
    if (btn) btn.innerText = isSessionPaused ? "Weiter" : "Pause";
    showToast(isSessionPaused ? "Session pausiert" : "Session fortgesetzt");
  }

  function addSessionMinutes(mins) {
    sessionRemainingSeconds += mins * 60;
    sessionTotalSeconds += mins * 60;
    updateTimerDisplay();
    showToast("+" + mins + " Minuten Spielzeit");
  }

  function renderLiveStep() {
    var step = currentSelectedPlaybook[liveStepIndex];
    if (!step) return;

    var badge = document.getElementById('live-step-badge');
    var title = document.getElementById('live-step-title');
    var phase = document.getElementById('live-step-phase');
    var desc = document.getElementById('live-step-desc');
    var topRole = document.getElementById('live-step-top-role');
    var subRole = document.getElementById('live-step-sub-role');
    var phasePill = document.getElementById('session-phase-pill');

    if (badge) badge.innerText = "Schritt " + (liveStepIndex + 1) + " / " + currentSelectedPlaybook.length;
    if (title) title.innerText = step.title;
    if (phase) phase.innerText = step.phase.split(':')[0];
    if (desc) desc.innerText = step.desc;
    if (topRole) topRole.innerText = step.top;
    if (subRole) subRole.innerText = step.sub;
    if (phasePill) phasePill.innerText = step.phase.split(':')[0];
  }

  function nextLiveStep() {
    if (liveStepIndex < currentSelectedPlaybook.length - 1) {
      liveStepIndex++;
      renderLiveStep();
    } else {
      endSessionToAftercare();
    }
  }

  function prevLiveStep() {
    if (liveStepIndex > 0) {
      liveStepIndex--;
      renderLiveStep();
    }
  }

  function speakCurrentLiveStep() {
    var step = currentSelectedPlaybook[liveStepIndex];
    if (!step) return;
    if (window.SessionVoice && window.SessionVoice.play) {
      window.SessionVoice.play(step.title + ". " + step.desc);
    }
  }

  function setEdgingStimulator(stim) {
    edgingStimulationBy = stim;
    var bTop = document.getElementById('btn-stim-top');
    var bBottom = document.getElementById('btn-stim-bottom');

    if (stim === 'top') {
      if (bTop) bTop.className = "px-3 py-1.5 rounded-xl border text-[10.5px] font-bold bg-brand-950 border-brand-500 text-brand-200 touch-btn";
      if (bBottom) bBottom.className = "px-3 py-1.5 rounded-xl border text-[10.5px] font-bold theme-panel text-slate-400 touch-btn";
    } else {
      if (bBottom) bBottom.className = "px-3 py-1.5 rounded-xl border text-[10.5px] font-bold bg-brand-950 border-brand-500 text-brand-200 touch-btn";
      if (bTop) bTop.className = "px-3 py-1.5 rounded-xl border text-[10.5px] font-bold theme-panel text-slate-400 touch-btn";
    }
  }

  function handleArousalSliderTouch(val) {
    activeArousalLevel = parseInt(val, 10);
    var badge = document.getElementById('arousal-level-badge');
    var labels = ["", "Ruhig", "Leicht erregt", "Wärme", "Fokus", "Plateau", "Gesteigert", "Intensiv", "Gefahrenzone", "Vor der Kante", "Kante"];
    if (badge) badge.innerText = "Stufe " + activeArousalLevel + " / 10 (" + (labels[activeArousalLevel] || '') + ")";

    if (activeArousalLevel >= 8 && window.SessionAudio && window.SessionAudio.adjustEnergy) {
      window.SessionAudio.adjustEnergy('energy');
    }

    if (isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play && Math.random() < 0.35) {
      var subName = names[subPartner] || 'Bottom';
      var phrase = "";
      if (activeArousalLevel <= 3) phrase = "Ganz ruhig atmen, " + subName + ". Wir bauen die Spannung langsam auf.";
      else if (activeArousalLevel <= 6) phrase = (edgingStimulationBy === 'bottom_self') ? ("Gleichmäßig weiterberühren, " + subName + ". Halt das Plateau.") : "Spüre meine Berührung. Lass dich ganz darauf ein.";
      else if (activeArousalLevel <= 9) phrase = (edgingStimulationBy === 'bottom_self') ? "Langsamer werden! Hände kurz anhalten, wenn es zu nah wird." : ("Gefahrenzone, " + subName + ". Kein Zucken. Du kommst erst auf mein Zeichen.");
      else phrase = "Stillhalten! Kante erreicht!";
      window.SessionVoice.play(phrase);
    }
  }

  function startLastEdgeTimer() {
    if (lastEdgeIntervalTimer) clearInterval(lastEdgeIntervalTimer);
    var disp = document.getElementById('time-since-last-edge');
    lastEdgeIntervalTimer = setInterval(function() {
      if (!lastEdgeTimestamp) return;
      var diff = Math.floor((Date.now() - lastEdgeTimestamp) / 1000);
      var m = Math.floor(diff / 60);
      var s = diff % 60;
      if (disp) disp.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }, 1000);
  }

  function startCooldownBreathingTimer() {
    if (cooldownTimerInterval) clearInterval(cooldownTimerInterval);
    cooldownSecondsRemaining = 45;
    var btn = document.getElementById('btn-cooldown-timer');

    cooldownTimerInterval = setInterval(function() {
      if (cooldownSecondsRemaining > 0) {
        cooldownSecondsRemaining--;
        if (btn) btn.innerText = cooldownSecondsRemaining + "s Abkühlen";
      } else {
        clearInterval(cooldownTimerInterval);
        if (btn) btn.innerText = "Abgekühlt ✓";
        setTimeout(function() { if (btn) btn.innerText = "45s Abkühlen"; }, 2500);
      }
    }, 1000);
  }

  function openReleaseChoiceModal() {
    var panel = document.getElementById('release-choice-subpanel');
    if (panel) panel.classList.toggle('hidden');
  }

  function executeReleaseImmediate() {
    currentSessionLog.push({ type: "action", time: getFormattedTimeNow(), label: "Orgasmus-Freigabe (Sofort)" });
    var panel = document.getElementById('release-choice-subpanel');
    if (panel) panel.classList.add('hidden');
    showToast("Sofortige Freigabe erteilt!");
    if (isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play) {
      window.SessionVoice.play("Jetzt! Lass alles los und komm für mich!");
    }
  }

  function executeReleaseWithCountdown() {
    var panel = document.getElementById('release-choice-subpanel');
    var wrap = document.getElementById('countdown-wrapper');
    if (panel) panel.classList.add('hidden');
    if (wrap) wrap.classList.remove('hidden');
    currentEdgingCountdown = 10;
    isCountdownActive = true;
    isEdgingCountdownPaused = false;
    countdownRunId++;
    runBreathPacedCountdownLoop(countdownRunId);
  }

  async function runBreathPacedCountdownLoop(runId) {
    var disp = document.getElementById('countdown-display');
    while (isCountdownActive && currentEdgingCountdown > 0 && runId === countdownRunId) {
      if (isEdgingCountdownPaused) {
        await new Promise(function(r) { setTimeout(r, 400); });
        continue;
      }

      if (disp) disp.innerText = currentEdgingCountdown;
      if (isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play) {
        await window.SessionVoice.play(currentEdgingCountdown.toString());
      } else {
        await new Promise(function(r) { setTimeout(r, 1100); });
      }

      await new Promise(function(r) { setTimeout(r, 400); });
      currentEdgingCountdown--;
    }

    if (currentEdgingCountdown <= 0 && runId === countdownRunId) {
      if (disp) disp.innerText = "KOMMEN!";
      currentSessionLog.push({ type: "action", time: getFormattedTimeNow(), label: "Orgasmus-Freigabe (nach Countdown)" });
      if (isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play) {
        await window.SessionVoice.play("Jetzt kommen! Lass alles los!");
      }
      setTimeout(function() {
        var wrap = document.getElementById('countdown-wrapper');
        if (wrap) wrap.classList.add('hidden');
      }, 4000);
    }
  }

  function pauseSpeechCountdown() {
    isEdgingCountdownPaused = !isEdgingCountdownPaused;
    var btn = document.getElementById('btn-pause-countdown');
    if (btn) btn.innerText = isEdgingCountdownPaused ? "Weiter" : "Pause";
  }

  function resetSpeechCountdown() {
    isCountdownActive = false;
    countdownRunId++;
    var wrap = document.getElementById('countdown-wrapper');
    if (wrap) wrap.classList.add('hidden');
    currentEdgingCountdown = 10;
  }

  function finalizeEdgingDecision(decision) {
    var time = getFormattedTimeNow();
    if (decision === 'ruined') {
      currentSessionLog.push({ type: "action", time: time, label: "Ruined Orgasm angeordnet" });
      showToast("Ruined Orgasm vollzogen!");
      if (isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play) {
        window.SessionVoice.play("Hände weg! Stillhalten und auskrampfen... Vielleicht beim nächsten Mal.");
      }
    } else if (decision === 'denial') {
      currentSessionLog.push({ type: "action", time: time, label: "Lustverweigerung (Denial)" });
      showToast("Orgasmus verweigert!");
      if (window.SessionAudio && window.SessionAudio.adjustEnergy) window.SessionAudio.adjustEnergy('calm');
      if (isTopVoiceAssistActive && window.SessionVoice && window.SessionVoice.play) {
        window.SessionVoice.play("Schluss für heute. Du bleibst ungelöst.");
      }
    }
  }

  function openZenAtemModal() { 
    var m = document.getElementById('modal-session-zen');
    if (m) m.classList.remove('hidden'); 
  }
  
  function closeZenAtemModal() { 
    var m = document.getElementById('modal-session-zen');
    if (m) m.classList.add('hidden'); 
  }

  function selectZenMode(mode) {
    var bBreath = document.getElementById('btn-zen-mode-breath');
    var bTrance = document.getElementById('btn-zen-mode-trance');
    var vBreath = document.getElementById('zen-view-breath');
    var vTrance = document.getElementById('zen-view-trance');

    if (mode === 'breath') {
      if (bBreath) bBreath.className = "p-2.5 rounded-xl border bg-teal-950 border-teal-500 text-white font-bold text-center touch-btn";
      if (bTrance) bTrance.className = "p-2.5 rounded-xl border theme-panel text-slate-300 font-bold text-center touch-btn";
      if (vBreath) vBreath.classList.remove('hidden');
      if (vTrance) vTrance.classList.add('hidden');
    } else {
      if (bTrance) bTrance.className = "p-2.5 rounded-xl border bg-purple-950 border-purple-500 text-white font-bold text-center touch-btn";
      if (bBreath) bBreath.className = "p-2.5 rounded-xl border theme-panel text-slate-300 font-bold text-center touch-btn";
      if (vTrance) vTrance.classList.remove('hidden');
      if (vBreath) vBreath.classList.add('hidden');
    }
  }

  function playGuidedTranceInduction() {
    if (window.SessionVoice && window.SessionVoice.unlock) window.SessionVoice.unlock();
    if (window.SessionAudio && window.SessionAudio.ensureGraph) window.SessionAudio.ensureGraph();
    if (window.SessionVoice && window.SessionVoice.play) {
      window.SessionVoice.play("Schließe die Augen. Atme tief in den Bauchraum aus. Lass die Schultern sinken und spüre das feste Gehaltensein.");
    }
  }

  function endSessionToAftercare() {
    isSessionPaused = true;
    var m = document.getElementById('modal-session-aftercare');
    if (m) m.classList.remove('hidden');
  }

  function closeAftercareModal() { 
    var m = document.getElementById('modal-session-aftercare');
    if (m) m.classList.add('hidden'); 
  }

  function completeSessionAndExit() {
    var topFeedEl = document.getElementById('aftercare-top-feedback');
    var subFeedEl = document.getElementById('aftercare-sub-feedback');
    var topFeed = (topFeedEl ? topFeedEl.value : '') || '';
    var subFeed = (subFeedEl ? subFeedEl.value : '') || '';

    var sessionEntry = {
      id: "sess_" + Date.now(),
      date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: currentSessionMode === 'guided' ? 'Geführt' : 'Freier Flow',
      intensity: sessionDepth,
      top: names[topPartner] || 'Top',
      bottom: names[subPartner] || 'Bottom',
      durationMinutes: Math.max(1, Math.round((sessionTotalSeconds - sessionRemainingSeconds) / 60)),
      edgeCount: edgeCount,
      topFeedback: topFeed,
      bottomFeedback: subFeed,
      events: currentSessionLog
    };

    sessionDiary.unshift(sessionEntry);
    try { 
      localStorage.setItem('kompass_session_diary', JSON.stringify(sessionDiary)); 
    } catch (e) {}

    if (window.SessionAudio && window.SessionAudio.stopAll) window.SessionAudio.stopAll();
    if (window.SessionVoice && window.SessionVoice.stop) window.SessionVoice.stop();
    releaseScreenWakeLock();
    window.location.href = "analyse.html";
  }

  function openSessionDiaryModal() {
    renderSessionDiaryEntries();
    var m = document.getElementById('modal-session-diary');
    if (m) m.classList.remove('hidden');
  }

  function closeSessionDiaryModal() { 
    var m = document.getElementById('modal-session-diary');
    if (m) m.classList.add('hidden'); 
  }

  function renderSessionDiaryEntries() {
    var c = document.getElementById('session-diary-entries-container');
    if (!c) return;

    if (sessionDiary.length === 0) {
      c.innerHTML = '<p class="text-slate-500 italic text-center py-4">Noch keine Sessions im Logbuch verzeichnet.</p>';
      return;
    }

    c.innerHTML = sessionDiary.map(function(entry) {
      return `
        <div class="p-3.5 rounded-2xl theme-panel border border-slate-800 space-y-2">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span class="font-bold text-white">${escapeHtml(entry.date)} (${escapeHtml(entry.mode)})</span>
            <span class="text-pink-400 font-mono font-bold">Stufe ${entry.intensity}/10</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[10.5px] text-slate-300">
            <div>👑 Top: ${escapeHtml(entry.top)}</div>
            <div>🧎 Bottom: ${escapeHtml(entry.bottom)}</div>
            <div>⏱️ Dauer: ${entry.durationMinutes} Min</div>
            <div>🎢 Edges: ${entry.edgeCount || 0}</div>
          </div>
          ${entry.topFeedback ? `<div class="p-2 rounded-xl bg-slate-900 text-[10.5px]"><strong>Top:</strong> ${escapeHtml(entry.topFeedback)}</div>` : ''}
          ${entry.bottomFeedback ? `<div class="p-2 rounded-xl bg-slate-900 text-[10.5px]"><strong>Bottom:</strong> ${escapeHtml(entry.bottomFeedback)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function openSessionTabuModal() {
    renderSessionTabuList();
    var m = document.getElementById('modal-session-tabus');
    if (m) m.classList.remove('hidden');
  }

  function closeSessionTabuModal() { 
    var m = document.getElementById('modal-session-tabus');
    if (m) m.classList.add('hidden'); 
  }

  function renderSessionTabuList() {
    var c = document.getElementById('session-tabu-list-container');
    if (!c) return;

    var allChapters = window.surveyChapters || [];
    var uAnswersTop = answers[topPartner] || {};
    var uAnswersSub = answers[subPartner] || {};

    var topTabus = [];
    var subTabus = [];

    allChapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          if (uAnswersTop['it_' + it.id + '_r1'] === 1) topTabus.push({ item: it, role: it.r1 });
          if (uAnswersSub['it_' + it.id + '_r2'] === 1) subTabus.push({ item: it, role: it.r2 });
        }
      });
    });

    c.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-900 space-y-1.5">
          <strong class="text-indigo-200 block text-xs">Ausführungs-Grenzen (${escapeHtml(names[topPartner] || 'Top')}):</strong>
          ${topTabus.length > 0 ? topTabus.map(function(t) {
            return `
              <div class="p-2 rounded-lg bg-slate-900 text-[10.5px] border border-indigo-950">
                <span class="text-white block font-bold">${escapeHtml(t.item.title)}</span>
                <span class="text-indigo-300 text-[9.5px]">⛔ Ausführung abgelehnt</span>
              </div>
            `;
          }).join('') : '<p class="text-slate-500 italic text-[10.5px]">Keine Ausführungs-Limits hinterlegt.</p>'}
        </div>

        <div class="p-3 rounded-2xl bg-rose-950/30 border border-rose-900 space-y-1.5">
          <strong class="text-rose-200 block text-xs">Schutz-Schranken (${escapeHtml(names[subPartner] || 'Bottom')}):</strong>
          ${subTabus.length > 0 ? subTabus.map(function(t) {
            return `
              <div class="p-2 rounded-lg bg-slate-900 text-[10.5px] border border-rose-950">
                <span class="text-white block font-bold">${escapeHtml(t.item.title)}</span>
                <span class="text-rose-300 text-[9.5px]">🛑 Sofort-ROT bei Empfang</span>
              </div>
            `;
          }).join('') : '<p class="text-slate-500 italic text-[10.5px]">Keine Schutz-Schranken hinterlegt.</p>'}
        </div>
      </div>
    `;
  }

  function checkUnratedSessions() {
    var banner = document.getElementById('unrated-sessions-banner');
    if (!banner) return;
    var unrated = sessionDiary.some(function(s) { return !s.topFeedback || !s.bottomFeedback; });
    if (unrated) banner.classList.remove('hidden');
    else banner.classList.add('hidden');
  }

  function dismissUnratedBanner() { 
    var banner = document.getElementById('unrated-sessions-banner');
    if (banner) banner.classList.add('hidden'); 
  }

  function updateHeaderTabuCounter() {
    var el = document.getElementById('session-tabu-counter');
    if (!el) return;
    var allChapters = window.surveyChapters || [];
    var uAnswersTop = answers[topPartner] || {};
    var uAnswersSub = answers[subPartner] || {};
    var count = 0;

    allChapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          if (uAnswersTop['it_' + it.id + '_r1'] === 1) count++;
          if (uAnswersSub['it_' + it.id + '_r2'] === 1) count++;
        }
      });
    });
    el.innerText = count;
  }

  async function acquireScreenWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        screenWakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (e) { 
      console.debug("WakeLock nicht verfügbar", e); 
    }
  }

  function releaseScreenWakeLock() {
    if (screenWakeLock) {
      screenWakeLock.release().catch(function() {});
      screenWakeLock = null;
    }
  }

  function getFormattedTimeNow() { 
    return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }); 
  }

  function showToast(msg) {
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

  function bootstrapSessionPortal() {
    initSessionPortal();
    setTimeout(initVoiceSettings, 150);
    setTimeout(initEquipmentStaging, 250);
  }

  window.SessionCore = {
    init: initSessionPortal,
    selectRoleSetup: selectPortalRoleSetup,
    goToStep: goToPortalStepSafe,
    switchStagingTab: switchStagingTab,
    toggleEquipment: toggleStagingEquipment,
    selectPreset: selectEquipmentPreset,
    saveGeminiKey: saveSessionGeminiKey,
    testGeminiKey: testGeminiConnectionInSession,
    changeVoice: changeSessionVoice,
    toggleVoiceAssist: toggleTopVoiceAssistance,
    applyPunishmentVoice: applyPunishmentVoicePreset,
    testVoiceSample: testGeminiVoiceSample,
    triggerAirPlay: triggerAirPlayPicker,
    updateEnergy: updateCheckinEnergy,
    updateDepth: updateSessionDepth,
    selectMode: selectSessionMode,
    rerollPlaybook: rerollPlaybook,
    startLiveSession: startLiveSessionWrapper,
    addMinutes: addSessionMinutes,
    togglePauseTimer: togglePauseTimer,
    endToAftercare: endSessionToAftercare,
    triggerSafeword: triggerSafewordWrapper,
    speakStep: speakCurrentLiveStep,
    nextStep: nextLiveStep,
    prevStep: prevLiveStep,
    setStimulator: setEdgingStimulator,
    handleArousal: handleArousalSliderTouch,
    registerEdge: registerEdgeReachedWrapper,
    startCooldown: startCooldownBreathingTimer,
    openReleaseChoice: openReleaseChoiceModal,
    executeReleaseImmediate: executeReleaseImmediate,
    executeReleaseCountdown: executeReleaseWithCountdown,
    pauseCountdown: pauseSpeechCountdown,
    resetCountdown: resetSpeechCountdown,
    finalizeDecision: finalizeEdgingDecision,
    openZen: openZenAtemModal,
    closeZen: closeZenAtemModal,
    selectZenMode: selectZenMode,
    playTrance: playGuidedTranceInduction,
    closeAftercare: closeAftercareModal,
    completeExit: completeSessionAndExit,
    openDiary: openSessionDiaryModal,
    closeDiary: closeSessionDiaryModal,
    dismissUnrated: dismissUnratedBanner,
    openTabus: openSessionTabuModal,
    closeTabus: closeSessionTabuModal
  };

  // Globale Registrierung aller Direktaufrufe für HTML-Attribute
  window.toggleAmbientMusicWrapper = toggleAmbientMusicWrapper;
  window.setSoundscapeStyleWrapper = setSoundscapeStyleWrapper;
  window.adjustAmbientEnergyWrapper = adjustAmbientEnergyWrapper;
  window.selectMusicSourceWrapper = selectMusicSourceWrapper;
  window.saveCustomPlaylistLinkWrapper = saveCustomPlaylistLinkWrapper;
  window.openIncidentDisciplineModalWrapper = openIncidentDisciplineModalWrapper;
  window.closeIncidentDisciplineModalWrapper = closeIncidentDisciplineModalWrapper;
  window.selectIncidentCategoryWrapper = selectIncidentCategoryWrapper;
  window.handleReasonLiveInputWrapper = handleReasonLiveInputWrapper;
  window.setStageSeverityWrapper = setStageSeverityWrapper;
  window.prevWizardStageWrapper = prevWizardStageWrapper;
  window.nextWizardStageWrapper = nextWizardStageWrapper;
  window.rerollCurrentWizardStageWrapper = rerollCurrentWizardStageWrapper;
  window.applyConfiguredDisciplineWrapper = applyConfiguredDisciplineWrapper;
  window.triggerSafewordWrapper = triggerSafewordWrapper;
  window.registerEdgeReachedWrapper = registerEdgeReachedWrapper;
  window.startLiveSessionWrapper = startLiveSessionWrapper;
  window.selectPortalRoleSetup = selectPortalRoleSetup;
  window.goToPortalStepSafe = goToPortalStepSafe;
  window.switchStagingTab = switchStagingTab;
  window.toggleStagingEquipment = toggleStagingEquipment;
  window.selectEquipmentPreset = selectEquipmentPreset;
  window.saveSessionGeminiKey = saveSessionGeminiKey;
  window.testGeminiConnectionInSession = testGeminiConnectionInSession;
  window.changeSessionVoice = changeSessionVoice;
  window.toggleTopVoiceAssistance = toggleTopVoiceAssistance;
  window.applyPunishmentVoicePreset = applyPunishmentVoicePreset;
  window.testGeminiVoiceSample = testGeminiVoiceSample;
  window.triggerAirPlayPicker = triggerAirPlayPicker;
  window.updateCheckinEnergy = updateCheckinEnergy;
  window.updateSessionDepth = updateSessionDepth;
  window.selectSessionMode = selectSessionMode;
  window.rerollPlaybook = rerollPlaybook;
  window.addSessionMinutes = addSessionMinutes;
  window.togglePauseTimer = togglePauseTimer;
  window.endSessionToAftercare = endSessionToAftercare;
  window.speakCurrentLiveStep = speakCurrentLiveStep;
  window.nextLiveStep = nextLiveStep;
  window.prevLiveStep = prevLiveStep;
  window.setEdgingStimulator = setEdgingStimulator;
  window.handleArousalSliderTouch = handleArousalSliderTouch;
  window.startCooldownBreathingTimer = startCooldownBreathingTimer;
  window.openReleaseChoiceModal = openReleaseChoiceModal;
  window.executeReleaseImmediate = executeReleaseImmediate;
  window.executeReleaseWithCountdown = executeReleaseWithCountdown;
  window.pauseSpeechCountdown = pauseSpeechCountdown;
  window.resetSpeechCountdown = resetSpeechCountdown;
  window.finalizeEdgingDecision = finalizeEdgingDecision;
  window.openZenAtemModal = openZenAtemModal;
  window.closeZenAtemModal = closeZenAtemModal;
  window.selectZenMode = selectZenMode;
  window.playGuidedTranceInduction = playGuidedTranceInduction;
  window.closeAftercareModal = closeAftercareModal;
  window.completeSessionAndExit = completeSessionAndExit;
  window.openSessionDiaryModal = openSessionDiaryModal;
  window.closeSessionDiaryModal = closeSessionDiaryModal;
  window.dismissUnratedBanner = dismissUnratedBanner;
  window.openSessionTabuModal = openSessionTabuModal;
  window.closeSessionTabuModal = closeSessionTabuModal;
  window.showToast = showToast;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootstrapSessionPortal);
  } else {
    bootstrapSessionPortal();
  }

})(window);
