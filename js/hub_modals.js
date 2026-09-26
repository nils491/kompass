/**
 * js/hub_modals.js
 * Zentraler Controller für alle Dialoge und Einstellungen in index.html:
 * - Profil- & Account-Einstellungen (Rufname, Anatomie, Gemini-Key, Theme, Backup, Reset)
 * - BDSM- & Kink-Lexikon (Volltextsuche & Anbindung an KinkResearch)
 * - Tabu-Charta (Note-1-Schutzschranken beider Partner)
 * - Erst-Onboarding für neue Paare
 * - Probehören der bevorzugten TTS-Stimme über SessionVoice mit 5s-Autostopp
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var onboardAnatState = { A: 'penis', B: 'vulva' };

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

  function getGeminiApiKey() {
    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return DEFAULT_PRESET_GEMINI_KEY;
  }

  // ==========================================
  // 1. ACCOUNT- & PROFIL-MODAL
  // ==========================================
  function openAccountModal() {
    var cur = window.currentUser || 'A';
    var curNames = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var curAnat = window.anatomy || { A: 'penis', B: 'vulva' };

    var nameInput = document.getElementById('account-name-input');
    var emailInput = document.getElementById('account-email-input');
    var curUserText = document.getElementById('account-active-username');
    var resetUserText = document.getElementById('reset-current-username');

    if (nameInput) nameInput.value = curNames[cur] || '';
    if (emailInput) emailInput.value = localStorage.getItem('kompass_backup_email_' + cur) || '';
    if (curUserText) curUserText.innerText = curNames[cur] || (cur === 'A' ? 'Partner 1' : 'Partner 2');
    if (resetUserText) resetUserText.innerText = curNames[cur] || (cur === 'A' ? 'Partner 1' : 'Partner 2');

    var geminiInput = document.getElementById('account-gemini-key');
    if (geminiInput) geminiInput.value = localStorage.getItem('kompass_gemini_api_key') || getGeminiApiKey();

    var aiToggle = document.getElementById('account-ai-toggle');
    if (aiToggle) aiToggle.checked = (localStorage.getItem('kompass_ai_active') === 'true');

    var voiceSelect = document.getElementById('account-voice-select');
    if (voiceSelect) voiceSelect.value = localStorage.getItem('kompass_session_voice') || 'Despina';

    updateAccountAnatomyButtons(curAnat);

    var resetConfirm = document.getElementById('reset-confirmation-box');
    var resetTrigger = document.getElementById('reset-trigger-area');
    if (resetConfirm) resetConfirm.classList.add('hidden');
    if (resetTrigger) resetTrigger.classList.remove('hidden');

    var modal = document.getElementById('modal-account');
    if (modal) modal.classList.remove('hidden');
  }

  function closeAccountModal() {
    var modal = document.getElementById('modal-account');
    if (modal) modal.classList.add('hidden');
    if (typeof window.updateHubUI === 'function') window.updateHubUI();
  }

  function updateAccountAnatomyButtons(anat) {
    var cur = window.currentUser || 'A';
    var other = cur === 'A' ? 'B' : 'A';

    var myP = document.getElementById('acc-anat-my-penis');
    var myV = document.getElementById('acc-anat-my-vulva');
    var partP = document.getElementById('acc-anat-part-penis');
    var partV = document.getElementById('acc-anat-part-vulva');

    if (anat[cur] === 'penis') {
      if (myP) myP.className = "flex-1 py-1.5 px-2 rounded-xl border bg-brand-950 border-brand-500 text-white text-[11px] font-bold touch-btn";
      if (myV) myV.className = "flex-1 py-1.5 px-2 rounded-xl border theme-panel text-slate-400 text-[11px] font-bold touch-btn";
    } else {
      if (myV) myV.className = "flex-1 py-1.5 px-2 rounded-xl border bg-brand-950 border-brand-500 text-white text-[11px] font-bold touch-btn";
      if (myP) myP.className = "flex-1 py-1.5 px-2 rounded-xl border theme-panel text-slate-400 text-[11px] font-bold touch-btn";
    }

    if (anat[other] === 'penis') {
      if (partP) partP.className = "flex-1 py-1.5 px-2 rounded-xl border bg-brand-950 border-brand-500 text-white text-[11px] font-bold touch-btn";
      if (partV) partV.className = "flex-1 py-1.5 px-2 rounded-xl border theme-panel text-slate-400 text-[11px] font-bold touch-btn";
    } else {
      if (partV) partV.className = "flex-1 py-1.5 px-2 rounded-xl border bg-brand-950 border-brand-500 text-white text-[11px] font-bold touch-btn";
      if (partP) partP.className = "flex-1 py-1.5 px-2 rounded-xl border theme-panel text-slate-400 text-[11px] font-bold touch-btn";
    }
  }

  function updateCurrentUserName(val) {
    var cur = window.currentUser || 'A';
    if (!window.names) window.names = { A: 'Partner 1', B: 'Partner 2' };
    window.names[cur] = val.trim() || (cur === 'A' ? 'Partner 1' : 'Partner 2');
    try {
      localStorage.setItem('kompass_names', JSON.stringify(window.names));
    } catch (e) {}

    var disp = document.getElementById('user-display-' + cur);
    if (disp) disp.innerText = window.names[cur];
    var curUserText = document.getElementById('account-active-username');
    if (curUserText) curUserText.innerText = window.names[cur];
    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    showToast("Rufname gespeichert ✓");
  }

  function updateCurrentUserEmail(val) {
    var cur = window.currentUser || 'A';
    try {
      localStorage.setItem('kompass_backup_email_' + cur, val.trim());
    } catch (e) {}
    showToast("E-Mail für Backup hinterlegt ✓");
  }

  function selectAccountAnatomy(who, type) {
    var cur = window.currentUser || 'A';
    var other = cur === 'A' ? 'B' : 'A';
    if (!window.anatomy) window.anatomy = { A: 'penis', B: 'vulva' };

    if (who === 'me') {
      window.anatomy[cur] = type;
    } else {
      window.anatomy[other] = type;
    }
    try {
      localStorage.setItem('kompass_anatomy', JSON.stringify(window.anatomy));
    } catch (e) {}
    updateAccountAnatomyButtons(window.anatomy);
    showToast("Anatomie aktualisiert ✓");
  }

  function toggleAccountAiActive(checked) {
    try {
      localStorage.setItem('kompass_ai_active', checked ? 'true' : 'false');
    } catch (e) {}
    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    showToast(checked ? "KI-Zentrale aktiviert ✓" : "KI-Zentrale deaktiviert");
  }

  function toggleThemeInAccount() {
    var isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('kompass_theme', 'light'); } catch (e) {}
      showToast("Helles Design aktiviert ☀️");
    } else {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('kompass_theme', 'dark'); } catch (e) {}
      showToast("Dunkles Design aktiviert 🌙");
    }
  }

  async function testGeminiKeyInAccount() {
    var keyInput = document.getElementById('account-gemini-key');
    var key = (keyInput && keyInput.value.trim().length > 5) ? keyInput.value.trim() : getGeminiApiKey();
    showToast("⏳ Prüfe API-Key bei Google...");
    try {
      var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key));
      if (resp.ok) {
        showToast("✓ Verbindung erfolgreich! Key ist aktiv.");
      } else {
        var data = await resp.json().catch(function() { return {}; });
        showToast("⚠️ Fehler: " + (data.error?.message || resp.status));
      }
    } catch (e) {
      showToast("⚠️ Netzwerkfehler beim Key-Test");
    }
  }

  function saveGeminiKeyInAccount(val) {
    var clean = (val || '').trim();
    try {
      localStorage.setItem('kompass_gemini_api_key', clean);
    } catch (e) {}
    showToast("API-Key gespeichert ✓");
  }

  function saveVoiceInAccount(val) {
    try {
      localStorage.setItem('kompass_session_voice', val);
    } catch (e) {}
    showToast("Stimme gespeichert: " + val);
  }

  async function playVoicePreviewInAccount() {
    if (window.SessionVoice && typeof window.SessionVoice.unlock === 'function') {
      window.SessionVoice.unlock();
    }
    var sel = document.getElementById('account-voice-select');
    var voice = sel ? sel.value : 'Despina';
    var previewText = "Ich bin deine ausgewählte Stimme für unsere gemeinsamen Sessions.";

    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      var btn = document.getElementById('btn-acc-voice-preview');
      if (btn) btn.innerText = "⏳ Lädt...";
      await window.SessionVoice.play(previewText, voice, true);
    } else {
      showToast("⚠️ Audio-Engine nicht geladen.");
    }
  }

  function sendBackupEmail() {
    var cur = window.currentUser || 'A';
    var email = localStorage.getItem('kompass_backup_email_' + cur) || '';
    var backupData = {
      names: window.names || {},
      anatomy: window.anatomy || {},
      answers: window.answers || {},
      safetyConfig: window.safetyConfig || {},
      activeToys: localStorage.getItem('kompass_active_equipment_ids') || '[]',
      date: new Date().toISOString()
    };

    var jsonStr = JSON.stringify(backupData, null, 2);
    var subject = encodeURIComponent("Kink-Kompass Datensicherung");
    var body = encodeURIComponent("Hallo,\n\nhier ist deine Datensicherung des Kink-Kompass vom " + new Date().toLocaleDateString('de-DE') + ":\n\n" + jsonStr);

    if (email) {
      window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
      showToast("E-Mail-Programm aufgerufen ✉️");
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonStr).then(function() {
          showToast("Backup-Daten in Zwischenablage kopiert! 📋");
        }).catch(function() {
          showToast("Keine Backup-E-Mail hinterlegt.");
        });
      } else {
        showToast("Keine Backup-E-Mail hinterlegt.");
      }
    }
  }

  function generateRandomTestData() {
    var allChapters = window.surveyChapters || [];
    if (!window.answers) window.answers = { A: {}, B: {} };
    if (!window.answers.A) window.answers.A = {};
    if (!window.answers.B) window.answers.B = {};

    allChapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type === 'choice') {
          var opts = it.options || [];
          if (opts.length > 0) {
            var randA = opts[Math.floor(Math.random() * opts.length)].val;
            var randB = opts[Math.floor(Math.random() * opts.length)].val;
            window.answers.A['it_' + it.id + '_choice'] = randA;
            window.answers.B['it_' + it.id + '_choice'] = randB;
          }
        } else {
          var genScore = function() {
            var r = Math.random();
            if (r < 0.20) return 5;
            if (r < 0.35) return 4;
            if (r < 0.65) return 3;
            if (r < 0.85) return 2;
            return 1;
          };
          window.answers.A['it_' + it.id + '_r1'] = genScore();
          window.answers.A['it_' + it.id + '_r2'] = genScore();
          window.answers.B['it_' + it.id + '_r1'] = genScore();
          window.answers.B['it_' + it.id + '_r2'] = genScore();
        }
      });
    });

    try {
      localStorage.setItem('kompass_answers', JSON.stringify(window.answers));
    } catch (e) {}

    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    if (typeof window.renderSurveyChapter === 'function') window.renderSurveyChapter();
    showToast("🎲 Zufällige Testdaten für beide Partner befüllt!");
  }

  function showResetConfirmation() {
    var triggerArea = document.getElementById('reset-trigger-area');
    var confirmBox = document.getElementById('reset-confirmation-box');
    if (triggerArea) triggerArea.classList.add('hidden');
    if (confirmBox) confirmBox.classList.remove('hidden');
  }

  function cancelResetConfirmation() {
    var confirmBox = document.getElementById('reset-confirmation-box');
    var triggerArea = document.getElementById('reset-trigger-area');
    if (confirmBox) confirmBox.classList.add('hidden');
    if (triggerArea) triggerArea.classList.remove('hidden');
  }

  function resetCurrentUserProfile() {
    var cur = window.currentUser || 'A';
    if (!window.answers) window.answers = { A: {}, B: {} };
    window.answers[cur] = {};
    try {
      localStorage.setItem('kompass_answers', JSON.stringify(window.answers));
    } catch (e) {}

    cancelResetConfirmation();
    closeAccountModal();
    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    if (typeof window.switchMainView === 'function') window.switchMainView('hub');
    showToast("Profil geleert 🗑️");
  }

  // ==========================================
  // 2. TABU-CHARTA MODAL
  // ==========================================
  function openTabuModal() {
    var container = document.getElementById('tabu-modal-list');
    var allChapters = window.surveyChapters || [];
    var curNames = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var ansA = (window.answers && window.answers.A) ? window.answers.A : {};
    var ansB = (window.answers && window.answers.B) ? window.answers.B : {};

    var tabusA = [];
    var tabusB = [];

    allChapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          if (ansA['it_' + it.id + '_r1'] === 1) tabusA.push({ item: it, role: 'Top (Aktiv)' });
          if (ansA['it_' + it.id + '_r2'] === 1) tabusA.push({ item: it, role: 'Bottom (Passiv)' });
          if (ansB['it_' + it.id + '_r1'] === 1) tabusB.push({ item: it, role: 'Top (Aktiv)' });
          if (ansB['it_' + it.id + '_r2'] === 1) tabusB.push({ item: it, role: 'Bottom (Passiv)' });
        }
      });
    });

    if (container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-2xl bg-rose-950/20 border border-rose-900/60 space-y-2">
            <strong class="text-rose-300 block text-xs">⛔ Grenzen von ${escapeHtml(curNames.A)}:</strong>
            ${tabusA.length > 0 ? tabusA.map(function(t) { return `
              <div class="p-2 rounded-xl bg-slate-900 border border-rose-950 text-[10.5px]">
                <strong class="text-white block">${escapeHtml(t.item.title)}</strong>
                <span class="text-rose-400 font-bold">${escapeHtml(t.role)}</span>
              </div>
            `; }).join('') : '<p class="text-slate-500 italic text-[11px]">Keine Tabus definiert.</p>'}
          </div>

          <div class="p-3 rounded-2xl bg-rose-950/20 border border-rose-900/60 space-y-2">
            <strong class="text-rose-300 block text-xs">⛔ Grenzen von ${escapeHtml(curNames.B)}:</strong>
            ${tabusB.length > 0 ? tabusB.map(function(t) { return `
              <div class="p-2 rounded-xl bg-slate-900 border border-rose-950 text-[10.5px]">
                <strong class="text-white block">${escapeHtml(t.item.title)}</strong>
                <span class="text-rose-400 font-bold">${escapeHtml(t.role)}</span>
              </div>
            `; }).join('') : '<p class="text-slate-500 italic text-[11px]">Keine Tabus definiert.</p>'}
          </div>
        </div>
      `;
    }

    var modal = document.getElementById('modal-tabus');
    if (modal) modal.classList.remove('hidden');
  }

  function closeTabuModal() {
    var modal = document.getElementById('modal-tabus');
    if (modal) modal.classList.add('hidden');
  }

  // ==========================================
  // 3. LEXIKON & KI-KINK-RECHERCHE MODAL
  // ==========================================
  function openLexikonModal(initialTerm) {
    if (window.KinkResearch && typeof window.KinkResearch.open === 'function') {
      window.KinkResearch.open(initialTerm);
    } else {
      var modal = document.getElementById('modal-lexikon');
      if (modal) modal.classList.remove('hidden');
    }
  }

  function closeLexikonModal() {
    if (window.KinkResearch && typeof window.KinkResearch.close === 'function') {
      window.KinkResearch.close();
    } else {
      var modal = document.getElementById('modal-lexikon');
      if (modal) modal.classList.add('hidden');
    }
  }

  // ==========================================
  // 4. ERST-ONBOARDING MODAL
  // ==========================================
  function setOnboardingAnatomy(user, anat) {
    onboardAnatState[user] = anat;
    var btnP = document.getElementById('onboard-anat-' + user + '-penis');
    var btnV = document.getElementById('onboard-anat-' + user + '-vulva');
    if (anat === 'penis') {
      if (btnP) btnP.className = "flex-1 py-1.5 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
      if (btnV) btnV.className = "flex-1 py-1.5 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
    } else {
      if (btnV) btnV.className = "flex-1 py-1.5 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
      if (btnP) btnP.className = "flex-1 py-1.5 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
    }
  }

  function completeOnboarding() {
    var nameAInput = document.getElementById('onboard-name-A');
    var nameBInput = document.getElementById('onboard-name-B');

    var nameA = (nameAInput && nameAInput.value.trim()) || 'Partner 1';
    var nameB = (nameBInput && nameBInput.value.trim()) || 'Partner 2';

    window.names = { A: nameA, B: nameB };
    window.anatomy = { A: onboardAnatState.A, B: onboardAnatState.B };

    try {
      localStorage.setItem('kompass_names', JSON.stringify(window.names));
      localStorage.setItem('kompass_anatomy', JSON.stringify(window.anatomy));
      localStorage.setItem('kompass_onboarding_done', 'true');
    } catch (e) {}

    var modal = document.getElementById('modal-onboarding');
    if (modal) modal.classList.add('hidden');

    var dispA = document.getElementById('user-display-A');
    var dispB = document.getElementById('user-display-B');
    if (dispA) dispA.innerText = nameA;
    if (dispB) dispB.innerText = nameB;

    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    showToast("Willkommen! Profile eingerichtet ✓");
  }

  window.addEventListener('DOMContentLoaded', function() {
    var isConfigured = localStorage.getItem('kompass_onboarding_done');
    if (!isConfigured) {
      var modal = document.getElementById('modal-onboarding');
      if (modal) modal.classList.remove('hidden');
    }
  });

  // Globale Registrierung aller Modal-Methoden
  window.openAccountModal = openAccountModal;
  window.closeAccountModal = closeAccountModal;
  window.updateCurrentUserName = updateCurrentUserName;
  window.updateCurrentUserEmail = updateCurrentUserEmail;
  window.selectAccountAnatomy = selectAccountAnatomy;
  window.toggleAccountAiActive = toggleAccountAiActive;
  window.toggleThemeInAccount = toggleThemeInAccount;
  window.testGeminiKeyInAccount = testGeminiKeyInAccount;
  window.saveGeminiKeyInAccount = saveGeminiKeyInAccount;
  window.saveVoiceInAccount = saveVoiceInAccount;
  window.playVoicePreviewInAccount = playVoicePreviewInAccount;
  window.sendBackupEmail = sendBackupEmail;
  window.generateRandomTestData = generateRandomTestData;
  window.showResetConfirmation = showResetConfirmation;
  window.cancelResetConfirmation = cancelResetConfirmation;
  window.resetCurrentUserProfile = resetCurrentUserProfile;
  window.openTabuModal = openTabuModal;
  window.closeTabuModal = closeTabuModal;
  window.openLexikonModal = openLexikonModal;
  window.closeLexikonModal = closeLexikonModal;
  window.setOnboardingAnatomy = setOnboardingAnatomy;
  window.completeOnboarding = completeOnboarding;

})(window);
