/**
 * js/hub_modals.js
 * Vollständiger Controller für alle Modals und Einstellungen im Start-Hub:
 * - Profil & Account-Einstellungen (Name, E-Mail, Anatomie, Gemini-Key, Stimme)
 * - Testdaten-Generator (Zufallsdaten für beide Partner zum sofortigen Testen)
 * - Profil-Reset mit Sicherheitsabfrage
 * - Tabu-Charta (Übersicht aller Note-1-Praktiken beider Partner)
 * - Toy-Management (Weiterleitung an HubToys)
 * - Erst-Onboarding (Profileinrichtung)
 */

(function(window) {
  'use strict';

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

  function openAccountModal() {
    var modal = document.getElementById('modal-account');
    if (!modal) return;

    var curUser = window.currentUser || 'A';
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var anatomy = window.anatomy || { A: 'penis', B: 'vulva' };

    var activeNameEl = document.getElementById('account-active-username');
    if (activeNameEl) activeNameEl.innerText = names[curUser] || (curUser === 'A' ? 'Partner 1' : 'Partner 2');

    var nameInput = document.getElementById('account-name-input');
    if (nameInput) nameInput.value = names[curUser] || '';

    var emailInput = document.getElementById('account-email-input');
    if (emailInput) {
      var savedEmail = localStorage.getItem('kompass_email_' + curUser) || '';
      emailInput.value = savedEmail;
    }

    updateAccountAnatomyUI(curUser, anatomy);

    var aiToggle = document.getElementById('account-ai-toggle');
    if (aiToggle) {
      aiToggle.checked = (localStorage.getItem('kompass_ai_active') === 'true');
    }

    var keyInput = document.getElementById('account-gemini-key');
    if (keyInput) {
      var k = localStorage.getItem('kompass_gemini_api_key') || '';
      keyInput.value = k;
    }

    var voiceSelect = document.getElementById('account-voice-select');
    if (voiceSelect) {
      var v = localStorage.getItem('kompass_session_voice') || 'Despina';
      voiceSelect.value = v;
    }

    cancelResetConfirmation();

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  function closeAccountModal() {
    var modal = document.getElementById('modal-account');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  function updateCurrentUserName(val) {
    var curUser = window.currentUser || 'A';
    var cleanVal = (val || '').trim() || (curUser === 'A' ? 'Partner 1' : 'Partner 2');

    if (!window.names) window.names = { A: 'Partner 1', B: 'Partner 2' };
    window.names[curUser] = cleanVal;

    try {
      localStorage.setItem('kompass_names', JSON.stringify(window.names));
    } catch (e) {}

    var activeNameEl = document.getElementById('account-active-username');
    if (activeNameEl) activeNameEl.innerText = cleanVal;

    var dispA = document.getElementById('user-display-A');
    var dispB = document.getElementById('user-display-B');
    if (dispA && curUser === 'A') dispA.innerText = cleanVal;
    if (dispB && curUser === 'B') dispB.innerText = cleanVal;

    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    showToast("Name gespeichert: " + cleanVal);
  }

  function updateCurrentUserEmail(val) {
    var curUser = window.currentUser || 'A';
    var cleanVal = (val || '').trim();
    try {
      localStorage.setItem('kompass_email_' + curUser, cleanVal);
      showToast("E-Mail gespeichert ✓");
    } catch (e) {}
  }

  function updateAccountAnatomyUI(curUser, anatomy) {
    var otherUser = (curUser === 'A') ? 'B' : 'A';
    var myAnat = (anatomy && anatomy[curUser]) || 'penis';
    var partAnat = (anatomy && anatomy[otherUser]) || 'vulva';

    var btnMyPenis = document.getElementById('acc-anat-my-penis');
    var btnMyVulva = document.getElementById('acc-anat-my-vulva');
    var btnPartPenis = document.getElementById('acc-anat-part-penis');
    var btnPartVulva = document.getElementById('acc-anat-part-vulva');

    if (btnMyPenis && btnMyVulva) {
      if (myAnat === 'penis') {
        btnMyPenis.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
        btnMyVulva.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
      } else {
        btnMyVulva.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
        btnMyPenis.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
      }
    }

    if (btnPartPenis && btnPartVulva) {
      if (partAnat === 'penis') {
        btnPartPenis.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold bg-indigo-950 border-indigo-500 text-white touch-btn";
        btnPartVulva.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
      } else {
        btnPartVulva.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold bg-indigo-950 border-indigo-500 text-white touch-btn";
        btnPartPenis.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
      }
    }
  }

  function selectAccountAnatomy(who, type) {
    var curUser = window.currentUser || 'A';
    var otherUser = (curUser === 'A') ? 'B' : 'A';
    var targetKey = (who === 'me') ? curUser : otherUser;

    if (!window.anatomy) window.anatomy = { A: 'penis', B: 'vulva' };
    window.anatomy[targetKey] = type;

    try {
      localStorage.setItem('kompass_anatomy', JSON.stringify(window.anatomy));
    } catch (e) {}

    updateAccountAnatomyUI(curUser, window.anatomy);
    showToast("Anatomie aktualisiert: " + (type === 'penis' ? 'Penis' : 'Vulva'));
  }

  function toggleAccountAiActive(active) {
    try {
      localStorage.setItem('kompass_ai_active', active ? 'true' : 'false');
    } catch (e) {}
    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    showToast(active ? "Google Gemini KI aktiviert ✨" : "KI-Funktionen deaktiviert");
  }

  function toggleThemeInAccount() {
    var isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kompass_theme', 'light');
      showToast("Helles Design aktiviert ☀️");
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kompass_theme', 'dark');
      showToast("Dunkles Noir-Design aktiviert 🌙");
    }
  }

  function saveGeminiKeyInAccount(val) {
    var key = (val || '').trim();
    try {
      localStorage.setItem('kompass_gemini_api_key', key);
      showToast("API-Key gesichert ✓");
    } catch (e) {}
  }

  async function testGeminiKeyInAccount() {
    var key = (document.getElementById('account-gemini-key')?.value || '').trim() || localStorage.getItem('kompass_gemini_api_key');
    if (!key || key.length < 10) {
      showToast("⚠️ Bitte gib zuerst einen gültigen API-Key ein.");
      return;
    }
    showToast("⏳ Prüfe Gemini-Verbindung...");
    try {
      var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key));
      if (resp.ok) {
        showToast("✓ Verbindung erfolgreich! Key ist aktiv.");
      } else {
        var err = await resp.json().catch(function() { return {}; });
        showToast("⚠️ Fehler: " + (err.error?.message || ("HTTP " + resp.status)));
      }
    } catch (e) {
      showToast("⚠️ Netzwerkfehler beim Verbindungstest");
    }
  }

  function saveVoiceInAccount(voice) {
    try {
      localStorage.setItem('kompass_session_voice', voice);
      showToast("Stimme gesetzt: " + voice);
      if (window.SessionVoice && typeof window.SessionVoice.preloadCore === 'function') {
        window.SessionVoice.preloadCore(voice);
      }
    } catch (e) {}
  }

  function playVoicePreviewInAccount() {
    var select = document.getElementById('account-voice-select');
    var voice = (select ? select.value : '') || localStorage.getItem('kompass_session_voice') || 'Despina';
    var isMale = (voice === 'Enceladus' || voice === 'Fenrir');
    var sample = isMale
      ? "Aufrecht stehen, Hände hinter den Rücken und stillhalten."
      : "Atme tief in den Bauchraum aus und überlass mir die Kontrolle.";

    if (window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play(sample, voice, true);
    } else {
      showToast("🔊 Probehören: " + voice);
    }
  }

  function sendBackupEmail() {
    var curUser = window.currentUser || 'A';
    var email = localStorage.getItem('kompass_email_' + curUser) || '';
    var data = {
      names: window.names,
      anatomy: window.anatomy,
      answers: window.answers,
      safety: window.safetyConfig,
      diary: window.sessionDiary
    };
    var jsonStr = JSON.stringify(data, null, 2);
    var subject = encodeURIComponent("Kink-Kompass Datensicherung (" + (window.names?.[curUser] || 'Partner') + ")");
    var body = encodeURIComponent("Hier ist die Datensicherung eures Kink- & Beziehungs-Kompasses:\n\n" + jsonStr);
    window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
    showToast("E-Mail-Programm für Backup geöffnet 📤");
  }

  function generateRandomTestData() {
    var chapters = window.surveyChapters || [];
    if (chapters.length === 0) {
      showToast("⚠️ Kapitel noch nicht geladen");
      return;
    }

    if (!window.answers) window.answers = { A: {}, B: {} };
    if (!window.answers.A) window.answers.A = {};
    if (!window.answers.B) window.answers.B = {};

    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type === 'choice') {
          if (it.options && it.options.length > 0) {
            var randOptA = it.options[Math.floor(Math.random() * it.options.length)].val;
            var randOptB = it.options[Math.floor(Math.random() * it.options.length)].val;
            window.answers.A['it_' + it.id + '_choice'] = randOptA;
            window.answers.B['it_' + it.id + '_choice'] = randOptB;
          }
        } else {
          // Realistische Zufallswerte (Gewichtung zu 3, 4, 5, gelegentlich 1 oder 2)
          var weights = [1, 2, 3, 3, 4, 4, 5, 5];
          window.answers.A['it_' + it.id + '_r1'] = weights[Math.floor(Math.random() * weights.length)];
          window.answers.A['it_' + it.id + '_r2'] = weights[Math.floor(Math.random() * weights.length)];
          window.answers.B['it_' + it.id + '_r1'] = weights[Math.floor(Math.random() * weights.length)];
          window.answers.B['it_' + it.id + '_r2'] = weights[Math.floor(Math.random() * weights.length)];
        }
      });
    });

    try {
      localStorage.setItem('kompass_answers', JSON.stringify(window.answers));
    } catch (e) {}

    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    if (typeof window.renderSurveyChapter === 'function') window.renderSurveyChapter();
    if (typeof window.renderSingleProfile === 'function') window.renderSingleProfile();

    closeAccountModal();
    showToast("🎲 Zufällige Testdaten für beide Partner generiert!");
  }

  function showResetConfirmation() {
    var curUser = window.currentUser || 'A';
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var resetTrigger = document.getElementById('reset-trigger-area');
    var resetBox = document.getElementById('reset-confirmation-box');
    var resetName = document.getElementById('reset-current-username');

    if (resetTrigger) resetTrigger.classList.add('hidden');
    if (resetBox) resetBox.classList.remove('hidden');
    if (resetName) resetName.innerText = names[curUser] || (curUser === 'A' ? 'Partner 1' : 'Partner 2');
  }

  function cancelResetConfirmation() {
    var resetTrigger = document.getElementById('reset-trigger-area');
    var resetBox = document.getElementById('reset-confirmation-box');
    if (resetTrigger) resetTrigger.classList.remove('hidden');
    if (resetBox) resetBox.classList.add('hidden');
  }

  function resetCurrentUserProfile() {
    var curUser = window.currentUser || 'A';
    if (!window.answers) window.answers = { A: {}, B: {} };
    window.answers[curUser] = {};

    try {
      localStorage.setItem('kompass_answers', JSON.stringify(window.answers));
    } catch (e) {}

    cancelResetConfirmation();
    closeAccountModal();

    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    if (typeof window.renderSurveyChapter === 'function') window.renderSurveyChapter();
    if (typeof window.renderSingleProfile === 'function') window.renderSingleProfile();

    showToast("Profil von " + (window.names?.[curUser] || 'Partner') + " zurückgesetzt");
  }

  function openTabuModal() {
    var modal = document.getElementById('modal-tabus');
    var container = document.getElementById('tabu-modal-list');
    if (!modal) return;

    var chapters = window.surveyChapters || [];
    var ans = window.answers || { A: {}, B: {} };
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };

    var tabusA = [];
    var tabusB = [];

    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          var aR1 = ans.A?.['it_' + it.id + '_r1'];
          var aR2 = ans.A?.['it_' + it.id + '_r2'];
          var bR1 = ans.B?.['it_' + it.id + '_r1'];
          var bR2 = ans.B?.['it_' + it.id + '_r2'];

          if (aR1 === 1) tabusA.push({ title: it.title, role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
          if (aR2 === 1) tabusA.push({ title: it.title, role: 'Passiv: ' + (it.r2 || 'Empfangen') });
          if (bR1 === 1) tabusB.push({ title: it.title, role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
          if (bR2 === 1) tabusB.push({ title: it.title, role: 'Passiv: ' + (it.r2 || 'Empfangen') });
        }
      });
    });

    if (container) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/60 space-y-2">
            <div class="flex items-center justify-between border-b border-rose-900/40 pb-1">
              <strong class="text-rose-200">${escapeHtml(names.A || 'Partner 1')}</strong>
              <span class="text-[10px] font-mono text-rose-400">${tabusA.length} Tabus</span>
            </div>
            <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              ${tabusA.length > 0 ? tabusA.map(function(t) {
                return `
                  <div class="p-2 rounded-xl bg-slate-900/80 border border-rose-950 text-[10.5px]">
                    <span class="text-white block font-bold">${escapeHtml(t.title)}</span>
                    <span class="text-rose-300 text-[9.5px]">${escapeHtml(t.role)}</span>
                  </div>
                `;
              }).join('') : '<p class="text-slate-500 italic text-[10.5px] text-center py-2">Keine Tabus hinterlegt.</p>'}
            </div>
          </div>

          <div class="p-3 rounded-2xl bg-rose-950/30 border border-rose-900/60 space-y-2">
            <div class="flex items-center justify-between border-b border-rose-900/40 pb-1">
              <strong class="text-rose-200">${escapeHtml(names.B || 'Partner 2')}</strong>
              <span class="text-[10px] font-mono text-rose-400">${tabusB.length} Tabus</span>
            </div>
            <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              ${tabusB.length > 0 ? tabusB.map(function(t) {
                return `
                  <div class="p-2 rounded-xl bg-slate-900/80 border border-rose-950 text-[10.5px]">
                    <span class="text-white block font-bold">${escapeHtml(t.title)}</span>
                    <span class="text-rose-300 text-[9.5px]">${escapeHtml(t.role)}</span>
                  </div>
                `;
              }).join('') : '<p class="text-slate-500 italic text-[10.5px] text-center py-2">Keine Tabus hinterlegt.</p>'}
            </div>
          </div>
        </div>
      `;
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  function closeTabuModal() {
    var modal = document.getElementById('modal-tabus');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  function openToyManagementModal() {
    if (window.HubToys && typeof window.HubToys.open === 'function') {
      window.HubToys.open();
      return;
    }
    var modal = document.getElementById('modal-toy-management');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
  }

  function closeToyManagementModal() {
    if (window.HubToys && typeof window.HubToys.close === 'function') {
      window.HubToys.close();
      return;
    }
    var modal = document.getElementById('modal-toy-management');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  function setOnboardingAnatomy(who, type) {
    onboardAnatState[who] = type;
    var btnPenis = document.getElementById('onboard-anat-' + who + '-penis');
    var btnVulva = document.getElementById('onboard-anat-' + who + '-vulva');

    if (btnPenis && btnVulva) {
      if (type === 'penis') {
        btnPenis.className = "flex-1 py-1.5 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
        btnVulva.className = "flex-1 py-1.5 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
      } else {
        btnVulva.className = "flex-1 py-1.5 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
        btnPenis.className = "flex-1 py-1.5 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
      }
    }
  }

  function closeOnboardingModal() {
    var modal = document.getElementById('modal-onboarding');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
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

    closeOnboardingModal();

    var dispA = document.getElementById('user-display-A');
    var dispB = document.getElementById('user-display-B');
    if (dispA) dispA.innerText = nameA;
    if (dispB) dispB.innerText = nameB;

    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    showToast("Willkommen! Profile eingerichtet ✓");
  }

  window.addEventListener('DOMContentLoaded', function() {
    var isDone = localStorage.getItem('kompass_onboarding_done');
    var hasNames = localStorage.getItem('kompass_names');
    var hasAnswers = localStorage.getItem('kompass_answers');

    // Onboarding nur anzeigen, wenn der Nutzer wirklich völlig neu ist
    if (!isDone && !hasNames && !hasAnswers) {
      var modal = document.getElementById('modal-onboarding');
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
    } else if (!isDone) {
      try { localStorage.setItem('kompass_onboarding_done', 'true'); } catch (e) {}
    }
  });

  // Globale Registrierungen für inline onclick-Attribute
  window.openAccountModal = openAccountModal;
  window.closeAccountModal = closeAccountModal;
  window.updateCurrentUserName = updateCurrentUserName;
  window.updateCurrentUserEmail = updateCurrentUserEmail;
  window.selectAccountAnatomy = selectAccountAnatomy;
  window.toggleAccountAiActive = toggleAccountAiActive;
  window.toggleThemeInAccount = toggleThemeInAccount;
  window.saveGeminiKeyInAccount = saveGeminiKeyInAccount;
  window.testGeminiKeyInAccount = testGeminiKeyInAccount;
  window.saveVoiceInAccount = saveVoiceInAccount;
  window.playVoicePreviewInAccount = playVoicePreviewInAccount;
  window.sendBackupEmail = sendBackupEmail;
  window.generateRandomTestData = generateRandomTestData;
  window.showResetConfirmation = showResetConfirmation;
  window.cancelResetConfirmation = cancelResetConfirmation;
  window.resetCurrentUserProfile = resetCurrentUserProfile;
  window.openTabuModal = openTabuModal;
  window.closeTabuModal = closeTabuModal;
  window.openToyManagementModal = openToyManagementModal;
  window.closeToyManagementModal = closeToyManagementModal;
  window.setOnboardingAnatomy = setOnboardingAnatomy;
  window.closeOnboardingModal = closeOnboardingModal;
  window.completeOnboarding = completeOnboarding;

})(window);
