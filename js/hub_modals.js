/**
 * js/hub_modals.js
 * Vollständiger Controller für alle Modals und Einstellungen im Start-Hub:
 * - Profil & Account-Einstellungen (Name, E-Mail, Anatomie, Gemini-Key, Stimme)
 * - Cloud-Synchronisations- & Multi-Device-Kopplungs-Steuerung
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

  // ==========================================
  // 1. CLOUD-SYNCHRONISATIONS-CONTROLLER
  // ==========================================

  function updateCloudSyncUI() {
    if (!window.CloudSync) return;
    var state = window.CloudSync.getState();

    var dot = document.getElementById('cloud-sync-status-dot');
    var txt = document.getElementById('cloud-sync-status-text');
    var badgeHeader = document.getElementById('cloud-sync-badge');
    var hubBadge = document.getElementById('hub-sync-status-badge');
    var stateLabel = document.getElementById('cloud-sync-state-label');
    var setupPanel = document.getElementById('cloud-sync-setup-panel');
    var activePanel = document.getElementById('cloud-sync-active-panel');
    var codeDisplay = document.getElementById('active-pair-code-display');

    if (state.isPaired) {
      if (dot) dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
      if (txt) {
        txt.innerText = state.status === 'syncing' ? "Synchronisiere..." : "Gekoppelt";
        txt.className = "hidden sm:inline text-[10.5px] text-emerald-300 font-bold";
      }
      if (hubBadge) {
        hubBadge.innerText = "Verbunden (" + state.pairCode + ")";
        hubBadge.className = "text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800";
      }
      if (badgeHeader) {
        badgeHeader.innerText = state.status === 'syncing' ? "Sync..." : "Live";
        badgeHeader.className = "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800";
      }
      if (stateLabel) {
        stateLabel.innerText = "Gekoppelt mit Code: " + state.pairCode;
      }
      if (codeDisplay) {
        codeDisplay.innerText = state.pairCode;
      }
      if (setupPanel) setupPanel.classList.add('hidden');
      if (activePanel) activePanel.classList.remove('hidden');
    } else {
      if (dot) dot.className = "w-2 h-2 rounded-full bg-slate-500";
      if (txt) {
        txt.innerText = "Lokal";
        txt.className = "hidden sm:inline text-[10.5px] text-slate-400";
      }
      if (hubBadge) {
        hubBadge.innerText = "Lokal";
        hubBadge.className = "text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800";
      }
      if (badgeHeader) {
        badgeHeader.innerText = "Offline";
        badgeHeader.className = "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400";
      }
      if (stateLabel) {
        stateLabel.innerText = "Nicht gekoppelt (Nur lokaler Speicher)";
      }
      if (setupPanel) setupPanel.classList.remove('hidden');
      if (activePanel) activePanel.classList.add('hidden');
    }
  }

  function getInviteUrlForPartner() {
    var state = window.CloudSync ? window.CloudSync.getState() : {};
    var code = state.pairCode || '';
    if (!code) return window.location.href;

    // Zielrolle für die Partnerin ist immer das Gegenüber (meist Partner B)
    var targetRole = (state.role === 'A') ? 'B' : 'A';
    var baseUrl = window.location.origin + window.location.pathname;
    return baseUrl + '?pair=' + encodeURIComponent(code) + '&role=' + targetRole + '#view=hub';
  }

  async function handleShareInviteLink() {
    var state = window.CloudSync ? window.CloudSync.getState() : {};
    if (!state.pairCode) {
      showToast("⚠️ Bitte erstelle zuerst einen Paar-Code.");
      return;
    }

    var inviteUrl = getInviteUrlForPartner();
    var shareData = {
      title: "Unser Kink- & Beziehungs-Kompass",
      text: "Hier ist unser sicherer Paar-Zugang für den Kink-Kompass. Tippe einfach auf den Link, um dich direkt mit mir zu verbinden:",
      url: inviteUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        showToast("Einladung geteilt ✓");
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyInviteLink();
        }
      }
    } else {
      handleCopyInviteLink();
    }
  }

  function handleCopyInviteLink() {
    var inviteUrl = getInviteUrlForPartner();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteUrl).then(function() {
        showToast("📋 Einladungslink in Zwischenablage kopiert! Jetzt in WhatsApp einfügen.");
      }).catch(function() {
        promptInviteLinkFallback(inviteUrl);
      });
    } else {
      promptInviteLinkFallback(inviteUrl);
    }
  }

  function promptInviteLinkFallback(url) {
    window.prompt("Kopiere diesen Einladungslink für deine Partnerin:", url);
  }

  async function checkUrlForAutoPairing() {
    try {
      var params = new URLSearchParams(window.location.search);
      var pairCode = params.get('pair');
      var role = params.get('role') || 'B';

      if (pairCode && pairCode.trim().length >= 5) {
        var cleanCode = pairCode.trim().toUpperCase();
        showToast("⏳ Einladungslink erkannt: Verbinde automatisch mit " + cleanCode + "...");

        if (window.CloudSync) {
          try {
            await window.CloudSync.joinRoom(cleanCode, role);
            if (typeof window.setCurrentUser === 'function') {
              window.setCurrentUser(role);
            }
            updateCloudSyncUI();
            showToast("✓ Erfolgreich als " + (role === 'A' ? 'Partner 1' : 'Partner 2') + " gekoppelt!");

            // Saubere URL ohne störende Query-Parameter wiederherstellen
            var cleanUrl = window.location.origin + window.location.pathname + (window.location.hash || '#view=hub');
            window.history.replaceState({}, document.title, cleanUrl);
          } catch (e) {
            showToast("⚠️ Automatische Kopplung fehlgeschlagen: " + (e.message || "Code abgelaufen"));
          }
        }
      }
    } catch (e) {
      console.warn("Fehler beim Prüfen von Auto-Pairing Parametern:", e);
    }
  }

  function openCloudSyncModal() {
    var modal = document.getElementById('modal-cloud-sync');
    if (!modal) return;
    updateCloudSyncUI();
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  function closeCloudSyncModal() {
    var modal = document.getElementById('modal-cloud-sync');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    updateCloudSyncUI();
  }

  async function handleCreatePairRoom() {
    var btn = document.getElementById('btn-create-pair-room');
    if (btn) btn.innerText = "⏳ Erstelle sicheren Paar-Raum...";

    try {
      if (!window.CloudSync) throw new Error("Cloud-Engine nicht geladen.");
      var newCode = await window.CloudSync.createRoom();
      showToast("✨ Paar-Code erstellt: " + newCode);
      updateCloudSyncUI();
    } catch (e) {
      showToast("⚠️ Fehler beim Erstellen: " + (e.message || "Netzwerkfehler"));
    } finally {
      if (btn) btn.innerText = "✨ Paar-Code jetzt erstellen";
    }
  }

  async function handleJoinPairRoom(role) {
    var input = document.getElementById('input-pair-code');
    var code = (input ? input.value : '').trim().toUpperCase();

    if (!code) {
      showToast("Bitte gib den Paar-Code deines Partners ein.");
      return;
    }

    showToast("⏳ Verbinde und entschlüssele Daten...");
    try {
      if (!window.CloudSync) throw new Error("Cloud-Engine nicht geladen.");
      await window.CloudSync.joinRoom(code, role);

      if (typeof window.setCurrentUser === 'function') {
        window.setCurrentUser(role);
      }

      showToast("✓ Erfolgreich mit " + code + " gekoppelt!");
      updateCloudSyncUI();
    } catch (e) {
      showToast("⚠️ Kopplung fehlgeschlagen: " + (e.message || "Code ungültig"));
    }
  }

  async function handleManualSyncNow() {
    showToast("🔄 Gleiche Daten mit der Cloud ab...");
    try {
      if (!window.CloudSync) return;
      var success = await window.CloudSync.pull();
      if (success) {
        showToast("✓ Daten erfolgreich synchronisiert!");
      } else {
        showToast("✓ Lokale Daten aktuell!");
      }
      updateCloudSyncUI();
    } catch (e) {
      showToast("⚠️ Synchronisation fehlgeschlagen.");
    }
  }

  function handleDisconnectPairing() {
    if (window.CloudSync) {
      window.CloudSync.disconnect();
    }
    showToast("Kopplung getrennt. Lokale Daten bleiben erhalten.");
    updateCloudSyncUI();
  }

  // ==========================================
  // 2. ACCOUNT & EINSTELLUNGEN
  // ==========================================

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
    if (window.CloudSync) window.CloudSync.trigger();
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
    var myAnat = (anatomy && anatomy[curUser]) || 'penis';

    var btnMyPenis = document.getElementById('acc-anat-my-penis');
    var btnMyVulva = document.getElementById('acc-anat-my-vulva');

    if (btnMyPenis && btnMyVulva) {
      if (myAnat === 'penis') {
        btnMyPenis.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
        btnMyVulva.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
      } else {
        btnMyVulva.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
        btnMyPenis.className = "flex-1 py-1.5 px-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
      }
    }
  }

  function selectAccountAnatomy(who, type) {
    var curUser = window.currentUser || 'A';

    if (!window.anatomy) window.anatomy = { A: 'penis', B: 'vulva' };
    window.anatomy[curUser] = type;

    try {
      localStorage.setItem('kompass_anatomy', JSON.stringify(window.anatomy));
    } catch (e) {}

    updateAccountAnatomyUI(curUser, window.anatomy);
    if (window.CloudSync) window.CloudSync.trigger();
    showToast("Deine Anatomie aktualisiert: " + (type === 'penis' ? 'Penis' : 'Vulva'));
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
    var userName = (window.names && window.names[curUser]) || (curUser === 'A' ? 'Partner 1' : 'Partner 2');

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
    if (window.CloudSync) window.CloudSync.trigger();

    showToast("Profil von " + userName + " vollständig gelöscht 🗑️");
  }

  // ==========================================
  // 3. TABU-CHARTA & TOY-MANAGEMENT
  // ==========================================

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

  // ==========================================
  // 4. ONBOARDING
  // ==========================================

  function setOnboardingAnatomy(who, type) {
    onboardAnatState[who] = type;
    var btnPenis = document.getElementById('onboard-anat-' + who + '-penis');
    var btnVulva = document.getElementById('onboard-anat-' + who + '-vulva');

    if (btnPenis && btnVulva) {
      if (type === 'penis') {
        btnPenis.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
        btnVulva.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
      } else {
        btnVulva.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
        btnPenis.className = "flex-1 py-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-400 touch-btn";
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
    var curUser = window.currentUser || 'A';
    var nameInput = document.getElementById('onboard-name-A');
    var chosenName = (nameInput && nameInput.value.trim()) || (curUser === 'A' ? 'Partner 1' : 'Partner 2');

    if (!window.names) window.names = { A: 'Partner 1', B: 'Partner 2' };
    window.names[curUser] = chosenName;

    if (!window.anatomy) window.anatomy = { A: 'penis', B: 'vulva' };
    window.anatomy[curUser] = onboardAnatState.A || 'penis';

    try {
      localStorage.setItem('kompass_names', JSON.stringify(window.names));
      localStorage.setItem('kompass_anatomy', JSON.stringify(window.anatomy));
      localStorage.setItem('kompass_onboarding_done', 'true');
    } catch (e) {}

    closeOnboardingModal();

    var disp = document.getElementById('user-display-' + curUser);
    if (disp) disp.innerText = chosenName;

    if (typeof window.updateHubUI === 'function') window.updateHubUI();
    if (window.CloudSync) window.CloudSync.trigger();
    showToast("Willkommen " + chosenName + "! Dein Profil ist eingerichtet ✓");
  }

  // ==========================================
  // INITIALISIERUNG & LISTENER
  // ==========================================

  function initHubModals() {
    var isDone = localStorage.getItem('kompass_onboarding_done');
    var hasNames = localStorage.getItem('kompass_names');
    var hasAnswers = localStorage.getItem('kompass_answers');

    if (!isDone && !hasNames && !hasAnswers) {
      var modal = document.getElementById('modal-onboarding');
      if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
      }
    } else if (!isDone) {
      try { localStorage.setItem('kompass_onboarding_done', 'true'); } catch (e) {}
    }

    if (window.CloudSync) {
      window.CloudSync.addListener(function(evt, data) {
        updateCloudSyncUI();
      });
      setTimeout(updateCloudSyncUI, 150);
    }

    // Beim Laden prüfen, ob der Aufruf über einen Partner-Einladungslink kam
    setTimeout(checkUrlForAutoPairing, 250);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initHubModals);
  } else {
    initHubModals();
  }

  // Globale Registrierungen für inline onclick-Attribute
  window.openCloudSyncModal = openCloudSyncModal;
  window.closeCloudSyncModal = closeCloudSyncModal;
  window.handleCreatePairRoom = handleCreatePairRoom;
  window.handleJoinPairRoom = handleJoinPairRoom;
  window.handleManualSyncNow = handleManualSyncNow;
  window.handleDisconnectPairing = handleDisconnectPairing;
  window.handleShareInviteLink = handleShareInviteLink;
  window.handleCopyInviteLink = handleCopyInviteLink;
  window.updateCloudSyncUI = updateCloudSyncUI;

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
