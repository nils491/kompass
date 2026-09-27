/**
 * js/hub_modals.js
 * Modal-, Account-, Onboarding-, Text-Zoom- & Kopplungs-Controller für den Kink- & Beziehungs-Kompass.
 */

(function(window) {
  'use strict';

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

  function applyTextZoom(level) {
    var zoomVal = String(level || localStorage.getItem('kompass_text_zoom') || '100');
    var zoomPct = '100%';
    if (zoomVal === '115') zoomPct = '115%';
    else if (zoomVal === '130') zoomPct = '130%';

    document.documentElement.style.fontSize = zoomPct;
    localStorage.setItem('kompass_text_zoom', zoomVal);
    updateTextZoomUI(zoomVal);
  }

  function setTextZoom(level) {
    applyTextZoom(level);
    var labels = { '100': 'Normal (100%)', '115': 'Mittel (115%)', '130': 'Groß (130%)' };
    showToast("Schriftgröße angepasst: " + (labels[level] || level + "%") + " 🔍");
  }

  function updateTextZoomUI(currentLevel) {
    var cur = String(currentLevel || localStorage.getItem('kompass_text_zoom') || '100');
    ['100', '115', '130'].forEach(function(lvl) {
      var btn = document.getElementById('btn-zoom-' + lvl);
      if (btn) {
        if (lvl === cur) {
          btn.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn shadow-md";
        } else {
          btn.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn hover:text-white";
        }
      }
    });
  }

  function openAccountModal() {
    var m = document.getElementById('modal-account');
    if (m) {
      m.style.display = 'flex';
      m.classList.remove('hidden');
    }

    var curUser = window.currentUser || 'A';
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var anatomy = window.anatomy || { A: 'penis', B: 'vulva' };

    var activeNameDisplay = document.getElementById('account-active-username');
    if (activeNameDisplay) {
      activeNameDisplay.innerText = names[curUser] || (curUser === 'A' ? 'Partner 1' : 'Partner 2');
    }

    var nameInput = document.getElementById('account-name-input');
    if (nameInput) {
      nameInput.value = names[curUser] || '';
    }

    var emailInput = document.getElementById('account-email-input');
    if (emailInput) {
      emailInput.value = localStorage.getItem('kompass_email_' + curUser) || '';
    }

    var currentAnat = anatomy[curUser] || (curUser === 'A' ? 'penis' : 'vulva');
    updateAccountAnatomyUI(currentAnat);

    var currentLvl = getSharingLevel(curUser);
    updateAccountSharingUI(currentLvl);
    updateTextZoomUI();

    var aiToggle = document.getElementById('account-ai-toggle');
    if (aiToggle) {
      aiToggle.checked = (localStorage.getItem('kompass_ai_active') === 'true');
    }

    var keyInput = document.getElementById('account-gemini-key');
    if (keyInput) {
      keyInput.value = localStorage.getItem('kompass_gemini_api_key') || '';
    }

    var voiceSelect = document.getElementById('account-voice-select');
    if (voiceSelect) {
      voiceSelect.value = localStorage.getItem('kompass_session_voice') || 'Despina';
    }

    cancelResetConfirmation();
  }

  function closeAccountModal() {
    var m = document.getElementById('modal-account');
    if (m) {
      m.style.display = 'none';
      m.classList.add('hidden');
    }
  }

  function updateCurrentUserName(val) {
    var cleanVal = (val || '').trim();
    var curUser = window.currentUser || 'A';
    if (!window.names) window.names = { A: 'Partner 1', B: 'Partner 2' };

    window.names[curUser] = cleanVal || (curUser === 'A' ? 'Partner 1' : 'Partner 2');

    if (typeof window.saveCoreData === 'function') {
      window.saveCoreData();
    }
    if (typeof window.updateUserToggleUI === 'function') {
      window.updateUserToggleUI();
    }
    if (typeof window.updateHubUI === 'function') {
      window.updateHubUI();
    }

    var activeNameDisplay = document.getElementById('account-active-username');
    if (activeNameDisplay) {
      activeNameDisplay.innerText = window.names[curUser];
    }

    showToast("Rufname gespeichert: " + window.names[curUser]);
  }

  function updateCurrentUserEmail(val) {
    var curUser = window.currentUser || 'A';
    localStorage.setItem('kompass_email_' + curUser, (val || '').trim());
    showToast("E-Mail für Backups hinterlegt ✓");
  }

  function selectAccountAnatomy(who, anat) {
    var curUser = window.currentUser || 'A';
    if (!window.anatomy) window.anatomy = { A: 'penis', B: 'vulva' };
    window.anatomy[curUser] = anat;

    updateAccountAnatomyUI(anat);
    if (typeof window.saveCoreData === 'function') window.saveCoreData();
    showToast("Anatomie aktualisiert: " + (anat === 'penis' ? '🍆 Penis' : '🌸 Vulva'));
  }

  function updateAccountAnatomyUI(anat) {
    var bPen = document.getElementById('acc-anat-my-penis');
    var bVul = document.getElementById('acc-anat-my-vulva');

    if (anat === 'penis') {
      if (bPen) bPen.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
      if (bVul) bVul.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
    } else {
      if (bVul) bVul.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
      if (bPen) bPen.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
    }
  }

  function getSharingLevel(user) {
    try {
      var stored = localStorage.getItem('kompass_sharing_level_' + user);
      if (stored) {
        var num = parseInt(stored, 10);
        if (num >= 1 && num <= 4) return num;
      }
    } catch (e) {}
    return 4; // Standard: Stufe 4 (Radikale Transparenz)
  }

  function selectAccountSharingLevel(lvl) {
    var curUser = window.currentUser || 'A';
    localStorage.setItem('kompass_sharing_level_' + curUser, lvl.toString());
    updateAccountSharingUI(lvl);

    if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }
    showToast("Freigabestufe " + lvl + " gesichert ✓");
  }

  function updateAccountSharingUI(lvl) {
    var badge = document.getElementById('account-sharing-badge');
    var labels = [
      "",
      "Stufe 1 (Strict Double-Opt-In)",
      "Stufe 2 (Bis Neugier)",
      "Stufe 3 (Duldung & Buße)",
      "Stufe 4 (Radikale Transparenz – Empfohlen)"
    ];
    if (badge) badge.innerText = labels[lvl] || ("Stufe " + lvl);

    for (var i = 1; i <= 4; i++) {
      var btn = document.getElementById('btn-share-level-' + i);
      if (btn) {
        if (i === lvl) {
          btn.className = "w-full p-2.5 rounded-xl border text-left touch-btn transition bg-brand-950/60 border-brand-500 shadow-md";
        } else {
          btn.className = "w-full p-2.5 rounded-xl border text-left touch-btn transition theme-panel border-slate-800 text-slate-400 hover:border-slate-700";
        }
      }
    }
  }

  function toggleAccountAiActive(checked) {
    localStorage.setItem('kompass_ai_active', checked ? 'true' : 'false');
    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    showToast(checked ? "KI-Funktionen aktiviert ✨" : "KI-Funktionen deaktiviert");
  }

  function saveGeminiKeyInAccount(key) {
    var cleanKey = (key || '').trim();
    localStorage.setItem('kompass_gemini_api_key', cleanKey);
    showToast("Gemini API-Key gespeichert ✓");
  }

  async function testGeminiKeyInAccount() {
    var keyInput = document.getElementById('account-gemini-key');
    var key = (keyInput ? keyInput.value : '').trim() || localStorage.getItem('kompass_gemini_api_key');

    if (!key) {
      showToast("Bitte gib zuerst einen Gemini API-Key ein.");
      return;
    }

    showToast("⏳ Prüfe API-Key bei Google...");
    try {
      var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key));
      if (resp.ok) {
        showToast("✓ Verbindung erfolgreich! Key ist gültig.");
      } else {
        var err = await resp.json().catch(function() { return {}; });
        var msg = (err && err.error && err.error.message) ? err.error.message : "Ungültiger Key";
        showToast("⚠️ Fehler: " + msg);
      }
    } catch (e) {
      showToast("⚠️ Netzwerkfehler beim Verbindungstest");
    }
  }

  function saveVoiceInAccount(voice) {
    localStorage.setItem('kompass_session_voice', voice);
    showToast("Regiestimme gewählt: " + voice);
  }

  function playVoicePreviewInAccount() {
    var sel = document.getElementById('account-voice-select');
    var voice = (sel ? sel.value : '') || localStorage.getItem('kompass_session_voice') || 'Despina';

    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play("Atme tief in den Bauchraum aus und überlass mir die Führung.", voice, true);
    } else {
      showToast("Stimmprobe für: " + voice);
    }
  }

  function toggleThemeInAccount() {
    var isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kompass_theme', 'light');
      showToast("Helles Farbschema aktiviert ☀️");
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kompass_theme', 'dark');
      showToast("Dunkles Farbschema aktiviert 🌙");
    }
  }

  function sendBackupEmail() {
    var curUser = window.currentUser || 'A';
    var mail = localStorage.getItem('kompass_email_' + curUser);
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var userName = names[curUser] || 'Partner';

    var dump = {
      user: curUser,
      name: userName,
      answers: (window.answers && window.answers[curUser]) || {},
      safety: (window.safetyConfig && window.safetyConfig[curUser]) || {},
      date: new Date().toISOString()
    };

    var subject = encodeURIComponent("Kink-Kompass Backup (" + userName + ")");
    var body = encodeURIComponent("Hallo " + userName + ",\n\nhier ist dein persönliches Daten-Backup:\n\n" + JSON.stringify(dump, null, 2));

    var mailtoUrl = "mailto:" + (mail || '') + "?subject=" + subject + "&body=" + body;
    window.location.href = mailtoUrl;
  }

  function showResetConfirmation() {
    var box = document.getElementById('reset-confirmation-box');
    var triggerArea = document.getElementById('reset-trigger-area');
    var nameSpan = document.getElementById('reset-current-username');

    var curUser = window.currentUser || 'A';
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };

    if (nameSpan) nameSpan.innerText = names[curUser] || (curUser === 'A' ? 'Partner 1' : 'Partner 2');
    if (box) box.classList.remove('hidden');
    if (triggerArea) triggerArea.classList.add('hidden');
  }

  function cancelResetConfirmation() {
    var box = document.getElementById('reset-confirmation-box');
    var triggerArea = document.getElementById('reset-trigger-area');
    if (box) box.classList.add('hidden');
    if (triggerArea) triggerArea.classList.remove('hidden');
  }

  function resetCurrentUserProfile() {
    var curUser = window.currentUser || 'A';

    if (window.answers && window.answers[curUser]) window.answers[curUser] = {};
    if (window.safetyConfig && window.safetyConfig[curUser]) window.safetyConfig[curUser] = {};

    localStorage.removeItem('kompass_cached_single_report_' + curUser);
    localStorage.removeItem('kompass_sharing_level_' + curUser);

    if (typeof window.saveCoreData === 'function') window.saveCoreData();
    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    if (window.SurveyEngine) window.SurveyEngine.render();
    if (window.ProfileEngine) window.ProfileEngine.render();

    cancelResetConfirmation();
    closeAccountModal();
    showToast("Profil-Daten erfolgreich zurückgesetzt.");
  }

  function openOnboardingModal() {
    var m = document.getElementById('modal-onboarding');
    if (m) {
      m.style.display = 'flex';
      m.classList.remove('hidden');
    }
    goToOnboardStep(1);

    var codeDisp = document.getElementById('onboard-code-display');
    var existingCode = localStorage.getItem('kompass_pair_code');
    if (codeDisp) {
      codeDisp.innerText = existingCode || "KOMPASS-" + Math.floor(100 + Math.random() * 900);
    }
  }

  function closeOnboardingModal() {
    var m = document.getElementById('modal-onboarding');
    if (m) {
      m.style.display = 'none';
      m.classList.add('hidden');
    }
  }

  function goToOnboardStep(step) {
    [1, 2, 3].forEach(function(s) {
      var el = document.getElementById('onboard-step-' + s);
      var dot = document.getElementById('dot-step-' + s);
      if (el) {
        if (s === step) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
      if (dot) {
        if (s === step) dot.className = "w-2 h-2 rounded-full bg-brand-500";
        else dot.className = "w-2 h-2 rounded-full bg-slate-700";
      }
    });

    var badge = document.getElementById('onboard-step-badge');
    if (badge) badge.innerText = "Schritt " + step + " von 3";
  }

  function setOnboardingAnatomy(role, anat) {
    if (!window.anatomy) window.anatomy = { A: 'penis', B: 'vulva' };
    window.anatomy[role] = anat;

    var bPen = document.getElementById('onboard-anat-A-penis');
    var bVul = document.getElementById('onboard-anat-A-vulva');

    if (anat === 'penis') {
      if (bPen) bPen.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
      if (bVul) bVul.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
    } else {
      if (bVul) bVul.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
      if (bPen) bPen.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
    }
  }

  function setOnboardingSharingLevel(lvl) {
    localStorage.setItem('kompass_sharing_level_A', lvl.toString());
    var label = document.getElementById('onboard-sharing-label');
    var labels = [
      "",
      "1. Streng (Doppel-Opt-In)",
      "2. Bis Neugier (Note 3–5)",
      "3. Bis Buße (Note 2–5)",
      "4. Radikale Transparenz (Empfohlen)"
    ];
    if (label) label.innerText = labels[lvl] || ("Stufe " + lvl);

    for (var i = 1; i <= 4; i++) {
      var btn = document.getElementById('onboard-share-' + i);
      if (btn) {
        if (i === lvl) {
          btn.className = "py-1.5 rounded-lg border text-[10px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
        } else {
          btn.className = "py-1.5 rounded-lg border text-[10px] font-bold theme-panel text-slate-400 touch-btn";
        }
      }
    }
  }

  function copyOnboardCode() {
    var codeDisp = document.getElementById('onboard-code-display');
    var code = codeDisp ? codeDisp.innerText : '';
    if (code) {
      var temp = document.createElement('input');
      temp.value = code;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      showToast("Paar-Code kopiert: " + code + " ✓");
    }
  }

  function completeOnboarding() {
    var nameInput = document.getElementById('onboard-name-A');
    var name = (nameInput ? nameInput.value : '').trim();

    if (!window.names) window.names = { A: 'Partner 1', B: 'Partner 2' };
    if (name) window.names.A = name;

    localStorage.setItem('kompass_onboarded', 'true');
    if (typeof window.saveCoreData === 'function') window.saveCoreData();
    if (typeof window.updateUserToggleUI === 'function') window.updateUserToggleUI();
    if (typeof window.updateHubUI === 'function') window.updateHubUI();

    closeOnboardingModal();
    showToast("Willkommen im Kompass, " + (name || 'Partner 1') + "!");
  }

  function openCloudSyncModal() {
    var m = document.getElementById('modal-cloud-sync');
    if (m) {
      m.style.display = 'flex';
      m.classList.remove('hidden');
    }
    updateCloudSyncUI();
  }

  function closeCloudSyncModal() {
    var m = document.getElementById('modal-cloud-sync');
    if (m) {
      m.style.display = 'none';
      m.classList.add('hidden');
    }
  }

  function updateCloudSyncUI() {
    var state = (window.CloudSync && typeof window.CloudSync.getState === 'function')
      ? window.CloudSync.getState()
      : { isPaired: false };

    var setupPanel = document.getElementById('cloud-sync-setup-panel');
    var activePanel = document.getElementById('cloud-sync-active-panel');
    var codeDisp = document.getElementById('active-pair-code-display');
    var headerDot = document.getElementById('cloud-sync-status-dot');
    var headerText = document.getElementById('cloud-sync-status-text');
    var hubBadge = document.getElementById('hub-sync-status-badge');
    var hubDesc = document.getElementById('hub-sync-card-desc');

    if (state.isPaired && state.pairCode) {
      if (setupPanel) setupPanel.classList.add('hidden');
      if (activePanel) activePanel.classList.remove('hidden');
      if (codeDisp) codeDisp.innerText = state.pairCode;

      if (headerDot) headerDot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
      if (headerText) headerText.innerText = state.pairCode;
      if (hubBadge) {
        hubBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800";
        hubBadge.innerText = "Gekoppelt: " + state.pairCode;
      }
      if (hubDesc) {
        hubDesc.innerText = "Verschlüsselter Raum aktiv (" + state.pairCode + "). Daten werden automatisch synchronisiert.";
      }
    } else {
      if (setupPanel) setupPanel.classList.remove('hidden');
      if (activePanel) activePanel.classList.add('hidden');

      if (headerDot) headerDot.className = "w-2 h-2 rounded-full bg-slate-500";
      if (headerText) headerText.innerText = "Lokal";
      if (hubBadge) {
        hubBadge.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800";
        hubBadge.innerText = "Lokal";
      }
      if (hubDesc) {
        hubDesc.innerText = "Zwei Smartphones sicher koppeln, um den Fragebogen gemeinsam auszufüllen.";
      }
    }
  }

  async function handleCreatePairRoom() {
    if (window.CloudSync && typeof window.CloudSync.createRoom === 'function') {
      showToast("⏳ Erstelle verschlüsselten Paar-Raum...");
      var code = await window.CloudSync.createRoom();
      updateCloudSyncUI();
      showToast("Paar-Raum aktiv: " + code + " ✨");
    }
  }

  async function handleJoinPairRoom(role) {
    var input = document.getElementById('input-pair-code');
    var rawInput = (input ? input.value : '').trim();
    if (!rawInput) {
      showToast("Bitte gib den Paar-Code oder Einladungs-Link ein.");
      return;
    }

    // ⚡ Sofort-Transfer Auto-Erkennung: Falls der verschlüsselte Text-Schlüssel direkt ins Feld eingefügt wurde
    if (rawInput.length > 50 && rawInput.indexOf(' ') === -1 && rawInput.indexOf('?') === -1 && rawInput.indexOf('/') === -1) {
      if (window.CloudSync && typeof window.CloudSync.importDirect === 'function') {
        try {
          window.CloudSync.importDirect(rawInput, role);
          if (typeof window.loadCoreData === 'function') window.loadCoreData();
          if (typeof window.setCurrentUser === 'function') window.setCurrentUser(role);
          updateCloudSyncUI();
          if (typeof window.updateHubUI === 'function') window.updateHubUI();
          closeCloudSyncModal();

          var ansCount = (window.answers && window.answers[role]) 
            ? Object.keys(window.answers[role]).filter(function(k){ return k.indexOf('_note') === -1; }).length 
            : 0;
          showToast("✓ Sofort-Transfer erfolgreich! " + ansCount + " Antworten für " + (role === 'A' ? 'Partner 1' : 'Partner 2') + " aktiviert ✨");
          return;
        } catch (err) {
          // Falls kein Sofort-Transfer, normal mit Cloud-Sync fortfahren
        }
      }
    }

    var cleanCode = '';
    var directId = null;

    // Erkennt vollautomatisch kopierte WhatsApp-Links oder komplexe URLs
    if (rawInput.indexOf('?') !== -1 || rawInput.indexOf('pair=') !== -1) {
      try {
        var urlStr = rawInput.startsWith('http') ? rawInput : ('https://kink.local/' + rawInput);
        var urlObj = new URL(urlStr);
        cleanCode = urlObj.searchParams.get('pair') || '';
        directId = urlObj.searchParams.get('id') || null;
      } catch (e) {
        var mCode = rawInput.match(/pair=([^&]+)/);
        var mId = rawInput.match(/id=([^&]+)/);
        if (mCode) cleanCode = decodeURIComponent(mCode[1]);
        if (mId) directId = decodeURIComponent(mId[1]);
      }
    } else if (rawInput.indexOf('#') !== -1) {
      var parts = rawInput.split('#');
      cleanCode = parts[0].trim();
      directId = parts[1].trim();
    } else if (rawInput.length > 24 && rawInput.indexOf('-') === -1) {
      // Direkte Objekt-ID
      directId = rawInput;
      cleanCode = localStorage.getItem('kompass_pair_code') || 'KOMPASS-SYNC';
    } else {
      cleanCode = rawInput.toUpperCase().trim();
    }

    if (!cleanCode) cleanCode = rawInput.toUpperCase().trim();

    if (window.CloudSync && typeof window.CloudSync.joinRoom === 'function') {
      showToast("⏳ Lade verschlüsselte Paar-Daten aus der Cloud...");
      try {
        await window.CloudSync.joinRoom(cleanCode, role, directId);
        if (typeof window.loadCoreData === 'function') window.loadCoreData();
        if (typeof window.setCurrentUser === 'function') window.setCurrentUser(role);
        updateCloudSyncUI();
        if (typeof window.updateHubUI === 'function') window.updateHubUI();
        closeCloudSyncModal();

        var ansA = (window.answers && window.answers.A) ? Object.keys(window.answers.A).filter(function(k){return k.indexOf('_note')===-1;}).length : 0;
        var ansB = (window.answers && window.answers.B) ? Object.keys(window.answers.B).filter(function(k){return k.indexOf('_note')===-1;}).length : 0;
        var partnerName = (window.names && window.names[role]) ? window.names[role] : ('Partner ' + role);

        showToast("✓ Verbunden! Profil " + partnerName + " aktiv (" + ansA + " Antworten bei P1, " + ansB + " bei P2).");
      } catch (e) {
        showToast("⚠️ " + e.message);
      }
    }
  }

  function handleExportDirectTransfer() {
    if (!window.CloudSync || typeof window.CloudSync.exportDirect !== 'function') {
      showToast("Sofort-Transfer nicht verfügbar.");
      return;
    }
    try {
      var transferString = window.CloudSync.exportDirect();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(transferString).then(function() {
          showToast("📋 Sofort-Transfer kopiert! Am Handy einfach im Feld einfügen.");
        }).catch(function() {
          copyViaTempInput(transferString);
        });
      } else {
        copyViaTempInput(transferString);
      }
    } catch (e) {
      showToast("Fehler beim Erstellen des Transfer-Schlüssels.");
    }
  }

  function copyViaTempInput(text) {
    var temp = document.createElement('textarea');
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showToast("📋 Sofort-Transfer kopiert! Am Handy einfach im Feld einfügen.");
  }

  function handleImportDirectTransfer(role) {
    var input = document.getElementById('input-pair-code');
    var raw = (input ? input.value : '').trim();
    if (!raw) {
      showToast("Bitte füge zuerst den Transfer-Schlüssel in das Feld ein.");
      return;
    }
    if (window.CloudSync && typeof window.CloudSync.importDirect === 'function') {
      try {
        window.CloudSync.importDirect(raw, role);
        if (typeof window.loadCoreData === 'function') window.loadCoreData();
        if (typeof window.setCurrentUser === 'function') window.setCurrentUser(role);
        updateCloudSyncUI();
        if (typeof window.updateHubUI === 'function') window.updateHubUI();
        closeCloudSyncModal();
        showToast("✓ Daten erfolgreich übertragen!");
    } catch (e) {
      showToast("⚠️ Ungültiger Transfer-Schlüssel.");
    }
  }

  function buildPairUrl(targetRole) {
    var state = (window.CloudSync && typeof window.CloudSync.getState === 'function')
      ? window.CloudSync.getState()
      : {};
    var code = state.pairCode || localStorage.getItem('kompass_pair_code') || '';
    var objId = state.objectId || localStorage.getItem('kompass_sync_remote_id') || '';
    if (!code) return null;

    var role = targetRole || 'B';
    var base = window.location.href.split('?')[0].split('#')[0];
    return base + "?pair=" + encodeURIComponent(code) + (objId ? ("&id=" + encodeURIComponent(objId)) : "") + "&role=" + encodeURIComponent(role);
  }

  function handleCopySelfLink() {
    var selfUrl = buildPairUrl('A');
    if (!selfUrl) {
      showToast("Erstelle zuerst einen Paar-Code.");
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(selfUrl).then(function() {
        showToast("📱 Link für dein iPhone kopiert! In Safari auf dem iPhone öffnen 📋");
      }).catch(function() {
        copyViaTempInput(selfUrl);
        showToast("📱 Link für dein iPhone kopiert! In Safari auf dem iPhone öffnen 📋");
      });
    } else {
      copyViaTempInput(selfUrl);
      showToast("📱 Link für dein iPhone kopiert! In Safari auf dem iPhone öffnen 📋");
    }
  }

  function handleCopyPartnerLink() {
    var partnerUrl = buildPairUrl('B');
    if (!partnerUrl) {
      showToast("Erstelle zuerst einen Paar-Code.");
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(partnerUrl).then(function() {
        showToast("Partner-Link kopiert (Partner 2) 📋");
      }).catch(function() {
        copyViaTempInput(partnerUrl);
        showToast("Partner-Link kopiert (Partner 2) 📋");
      });
    } else {
      copyViaTempInput(partnerUrl);
      showToast("Partner-Link kopiert (Partner 2) 📋");
    }
  }

  function handleShareInviteLink(roleOverride) {
    var targetRole = roleOverride || 'B';
    var inviteUrl = buildPairUrl(targetRole);
    if (!inviteUrl) {
      showToast("Erstelle zuerst einen Paar-Code.");
      return;
    }

    var text = "Hier ist unser sicherer Schlüssel für den Kink- & Beziehungs-Kompass:\n" + inviteUrl;

    if (navigator.share) {
      navigator.share({
        title: "Kink- & Beziehungs-Kompass Kopplung",
        text: text,
        url: inviteUrl
      }).catch(function() {});
    } else {
      if (targetRole === 'A') handleCopySelfLink();
      else handleCopyPartnerLink();
    }
  }

  function handleCopyInviteLink() {
    handleCopyPartnerLink();
  }

  function handleManualSyncNow() {
    if (window.CloudSync && typeof window.CloudSync.pull === 'function') {
      showToast("⏳ Synchronisiere mit Cloud...");
      window.CloudSync.pull().then(function(success) {
        if (success) {
          if (typeof window.loadCoreData === 'function') window.loadCoreData();
          if (typeof window.updateHubUI === 'function') window.updateHubUI();
          
          var ansA = (window.answers && window.answers.A) ? Object.keys(window.answers.A).filter(function(k){return k.indexOf('_note')===-1;}).length : 0;
          var ansB = (window.answers && window.answers.B) ? Object.keys(window.answers.B).filter(function(k){return k.indexOf('_note')===-1;}).length : 0;
          showToast("✓ Daten synchron! P1: " + ansA + " Antworten · P2: " + ansB + " Antworten");
        } else {
          showToast("Aktuell keine neuen Änderungen auf dem Server.");
        }
      });
    }
  }

  function handleDisconnectPairing() {
    if (window.CloudSync && typeof window.CloudSync.disconnect === 'function') {
      window.CloudSync.disconnect();
      updateCloudSyncUI();
      showToast("Kopplung getrennt. App arbeitet wieder lokal.");
    }
  }

  function checkUrlForAutoPairing() {
    try {
      var params = new URLSearchParams(window.location.search);
      var pairCode = params.get('pair');
      var objId = params.get('id');
      var role = params.get('role') || 'B';

      if (pairCode && window.CloudSync && typeof window.CloudSync.joinRoom === 'function') {
        window.CloudSync.joinRoom(pairCode, role, objId).then(function() {
          if (typeof window.loadCoreData === 'function') window.loadCoreData();
          if (typeof window.setCurrentUser === 'function') window.setCurrentUser(role);
          updateCloudSyncUI();
          if (typeof window.updateHubUI === 'function') window.updateHubUI();
          showToast("Automatisch gekoppelt mit Paar-Code: " + pairCode);
        }).catch(function(e) {
          showToast("⚠️ " + e.message);
        });
      }
    } catch (e) {}
  }

  function openTabuModal() {
    var m = document.getElementById('modal-tabus');
    if (m) {
      m.style.display = 'flex';
      m.classList.remove('hidden');
    }
    renderTabuModalList();
  }

  function closeTabuModal() {
    var m = document.getElementById('modal-tabus');
    if (m) {
      m.style.display = 'none';
      m.classList.add('hidden');
    }
  }

  function renderTabuModalList() {
    var c = document.getElementById('tabu-modal-list');
    if (!c) return;

    var chapters = window.surveyChapters || [];
    var answers = window.answers || { A: {}, B: {} };
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };

    var list = [];
    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          if (answers.A && answers.A['it_' + it.id + '_r1'] === 1) {
            list.push({ item: it, who: 'A', name: names.A || 'Partner 1', role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
          }
          if (answers.A && answers.A['it_' + it.id + '_r2'] === 1) {
            list.push({ item: it, who: 'A', name: names.A || 'Partner 1', role: 'Passiv: ' + (it.r2 || 'Empfangen') });
          }
          if (answers.B && answers.B['it_' + it.id + '_r1'] === 1) {
            list.push({ item: it, who: 'B', name: names.B || 'Partner 2', role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
          }
          if (answers.B && answers.B['it_' + it.id + '_r2'] === 1) {
            list.push({ item: it, who: 'B', name: names.B || 'Partner 2', role: 'Passiv: ' + (it.r2 || 'Empfangen') });
          }
        }
      });
    });

    if (list.length === 0) {
      c.innerHTML = '<p class="text-slate-500 italic text-center py-6 text-xs">Aktuell sind keine Tabus (Note 1) gesetzt.</p>';
      return;
    }

    c.innerHTML = list.map(function(t) {
      return `
        <div onclick="handleTabuItemClick('${t.who}', ${t.item.id})" class="p-3 rounded-2xl bg-rose-950/30 hover:bg-rose-950/70 border border-rose-900/60 hover:border-rose-600 transition cursor-pointer touch-btn flex items-center justify-between gap-2">
          <div class="space-y-0.5 flex-1 min-w-0">
            <strong class="text-white text-xs block truncate">${escapeHtml(t.item.title)}</strong>
            <span class="text-rose-300 text-[10.5px] block truncate">${escapeHtml(t.role)}</span>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900 text-rose-200 border border-rose-700">${escapeHtml(t.name)}</span>
            <span class="text-xs text-rose-400">✏️ ↗</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function handleTabuItemClick(user, itemId) {
    closeTabuModal();
    if (typeof window.setCurrentUser === 'function') window.setCurrentUser(user);
    if (typeof window.goToSurveyItem === 'function') {
      window.goToSurveyItem(itemId);
    } else if (typeof window.switchMainView === 'function') {
      window.switchMainView('survey');
      setTimeout(function() {
        if (window.SurveyEngine && typeof window.SurveyEngine.jumpToItem === 'function') {
          window.SurveyEngine.jumpToItem(itemId);
        }
      }, 150);
    }
  }

  function initModals() {
    applyTextZoom();
    checkUrlForAutoPairing();
    updateCloudSyncUI();

    var onboarded = localStorage.getItem('kompass_onboarded');
    if (onboarded !== 'true') {
      setTimeout(openOnboardingModal, 400);
    }
  }

  window.setTextZoom = setTextZoom;
  window.applyTextZoom = applyTextZoom;
  window.updateTextZoomUI = updateTextZoomUI;

  window.openAccountModal = openAccountModal;
  window.closeAccountModal = closeAccountModal;
  window.updateCurrentUserName = updateCurrentUserName;
  window.updateCurrentUserEmail = updateCurrentUserEmail;
  window.selectAccountAnatomy = selectAccountAnatomy;
  window.selectAccountSharingLevel = selectAccountSharingLevel;
  window.toggleAccountAiActive = toggleAccountAiActive;
  window.saveGeminiKeyInAccount = saveGeminiKeyInAccount;
  window.testGeminiKeyInAccount = testGeminiKeyInAccount;
  window.saveVoiceInAccount = saveVoiceInAccount;
  window.playVoicePreviewInAccount = playVoicePreviewInAccount;
  window.toggleThemeInAccount = toggleThemeInAccount;
  window.sendBackupEmail = sendBackupEmail;
  window.showResetConfirmation = showResetConfirmation;
  window.cancelResetConfirmation = cancelResetConfirmation;
  window.resetCurrentUserProfile = resetCurrentUserProfile;

  window.openOnboardingModal = openOnboardingModal;
  window.closeOnboardingModal = closeOnboardingModal;
  window.goToOnboardStep = goToOnboardStep;
  window.setOnboardingAnatomy = setOnboardingAnatomy;
  window.setOnboardingSharingLevel = setOnboardingSharingLevel;
  window.copyOnboardCode = copyOnboardCode;
  window.completeOnboarding = completeOnboarding;

  window.openCloudSyncModal = openCloudSyncModal;
  window.closeCloudSyncModal = closeCloudSyncModal;
  window.updateCloudSyncUI = updateCloudSyncUI;
  window.handleCreatePairRoom = handleCreatePairRoom;
  window.handleJoinPairRoom = handleJoinPairRoom;
  window.handleExportDirectTransfer = handleExportDirectTransfer;
  window.handleImportDirectTransfer = handleImportDirectTransfer;
  window.handleCopySelfLink = handleCopySelfLink;
  window.handleCopyPartnerLink = handleCopyPartnerLink;
  window.handleShareInviteLink = handleShareInviteLink;
  window.handleCopyInviteLink = handleCopyInviteLink;
  window.handleManualSyncNow = handleManualSyncNow;
  window.handleDisconnectPairing = handleDisconnectPairing;

  window.openTabuModal = openTabuModal;
  window.closeTabuModal = closeTabuModal;
  window.renderTabuModalList = renderTabuModalList;
  window.handleTabuItemClick = handleTabuItemClick;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initModals);
  } else {
    initModals();
  }

})(window);
