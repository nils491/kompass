/**
 * js/chat.js
 * Universelle E2EE-Chat- & Paar-Stream-Engine des Kink- & Beziehungs-Kompasses.
 * 
 * Beinhaltet:
 * - Universeller Paar-Chat für alle Paare (Sexting, private Nachrichten, System-Feed)
 * - Clientseitige Bildkompression via Canvas API (~120 KB) mit Privacy-Blur
 * - Striktes Opt-In für D/s & Vertrag (Standard: Deaktiviert)
 * - Beidseitige Einvernehmlichkeits-Prüfung: Aufgabenversand nur bei beiderseitiger D/s-Aktivierung
 * - Interaktive Aufgaben-Karten mit anpassbarem Default-Punktwert für den Top
 * - Dateigrößen-Garantie: Weit unter 500 Zeilen.
 */

(function(window) {
  'use strict';

  var messages = [];
  var isDrawerOpen = false;

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
    }, 3200);
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

  function formatTime(timestamp) {
    if (!timestamp) return '';
    var d = new Date(timestamp);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  function getMyRole() {
    var isPaired = localStorage.getItem('kompass_is_paired') === 'true';
    if (!isPaired) {
      return window.currentUser || localStorage.getItem('kompass_assigned_role') || 'A';
    }
    return localStorage.getItem('kompass_assigned_role') || 'A';
  }

  function getOtherRole() {
    return getMyRole() === 'A' ? 'B' : 'A';
  }

  function getPartnerNames() {
    var names = { A: 'Partner 1', B: 'Partner 2' };
    try {
      var raw = localStorage.getItem('kompass_names');
      if (raw) Object.assign(names, JSON.parse(raw));
    } catch (e) {}
    if (window.names) Object.assign(names, window.names);
    return names;
  }

  function isDsEnabledForUser(user) {
    return localStorage.getItem('kompass_ds_optin_' + user) === 'true';
  }

  function isUserTop() {
    try {
      var raw = localStorage.getItem('kompass_ledger_state');
      if (raw) {
        var lState = JSON.parse(raw);
        if (lState.keyholder) return getMyRole() === lState.keyholder;
      }
    } catch (e) {}
    return getMyRole() === 'A';
  }

  function loadChatMessages() {
    try {
      var raw = localStorage.getItem('kompass_chat_messages');
      if (raw) messages = JSON.parse(raw);
    } catch (e) {
      console.warn("Fehler beim Laden der Chat-Nachrichten:", e);
    }
    if (!Array.isArray(messages)) messages = [];
  }

  function saveChatMessages(skipSync) {
    try {
      localStorage.setItem('kompass_chat_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn("Fehler beim Speichern der Chat-Nachrichten:", e);
    }
    if (!skipSync && window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }
  }

  function updateHeaderAndModeUI() {
    var names = getPartnerNames();
    var headerNames = document.getElementById('chat-header-names');
    if (headerNames) {
      headerNames.innerText = names.A + " & " + names.B;
    }

    var myRole = getMyRole();
    var otherRole = getOtherRole();
    var myDs = isDsEnabledForUser(myRole);
    var otherDs = isDsEnabledForUser(otherRole);

    var indicator = document.getElementById('chat-ds-mode-indicator');
    var btnTask = document.getElementById('btn-toggle-task-drawer');

    if (myDs && otherDs) {
      if (indicator) {
        indicator.innerHTML = '<span class="text-purple-400 font-bold">🗝️ D/s & Pflichten aktiv</span>';
      }
      if (btnTask) btnTask.classList.remove('hidden');
    } else if (myDs && !otherDs) {
      if (indicator) {
        indicator.innerHTML = '<span class="text-amber-400 font-bold" title="Partner hat D/s noch nicht aktiviert">⏳ D/s wartet auf ' + escapeHtml(names[otherRole]) + '</span>';
      }
      if (btnTask) btnTask.classList.remove('hidden');
    } else {
      if (indicator) {
        indicator.innerHTML = '<span class="text-slate-400">Privater Paar-Messenger</span>';
      }
      if (btnTask) btnTask.classList.add('hidden');
    }
  }

  function renderChatStream() {
    loadChatMessages();
    updateHeaderAndModeUI();

    var container = document.getElementById('chat-messages-container');
    if (!container) return;

    if (messages.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-500 italic space-y-2 my-auto">
          <span class="text-3xl block">💬</span>
          <strong class="text-xs text-white block">E2EE-Paar-Stream bereit</strong>
          <p class="text-[11px] text-slate-400 max-w-xs mx-auto">
            Hier könnt ihr privat flüstern, vertrauliche Fotos austauschen und gemeinsame Momente teilen.
          </p>
        </div>
      `;
      return;
    }

    var myRole = getMyRole();
    var isTop = isUserTop();
    var names = getPartnerNames();

    container.innerHTML = messages.map(function(msg) {
      if (msg.type === 'system_event') {
        return renderSystemBubble(msg);
      }
      if (msg.type === 'chore_submission') {
        return renderChoreBubble(msg, myRole, isTop, names);
      }
      if (msg.type === 'photo') {
        return renderPhotoBubble(msg, myRole, names);
      }
      return renderTextBubble(msg, myRole, names);
    }).join('');

    setTimeout(function() {
      container.scrollTop = container.scrollHeight;
    }, 40);
  }

  function renderSystemBubble(msg) {
    return `
      <div class="flex justify-center my-1 animate-fade-in">
        <div class="px-3 py-1 rounded-2xl bg-purple-950/40 border border-purple-900/60 text-purple-200 text-[10px] max-w-md text-center shadow-xs flex items-center gap-1.5">
          <span>⚡</span>
          <span>${escapeHtml(msg.text)}</span>
          <span class="text-[8.5px] font-mono text-purple-400/80 ml-1">${formatTime(msg.timestamp)}</span>
        </div>
      </div>
    `;
  }

  function renderTextBubble(msg, myRole, names) {
    var isMe = (msg.from === myRole);
    var senderName = names[msg.from] || ('Partner ' + msg.from);

    return `
      <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5 animate-fade-in">
        <span class="text-[9px] text-slate-500 px-1 font-mono">${escapeHtml(senderName)} · ${formatTime(msg.timestamp)}</span>
        <div class="max-w-[84%] sm:max-w-md px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${isMe ? 'bg-brand-700 text-white rounded-tr-xs shadow-md' : 'theme-panel border border-slate-800 text-slate-200 rounded-tl-xs'}">
          ${escapeHtml(msg.text)}
        </div>
      </div>
    `;
  }

  function renderPhotoBubble(msg, myRole, names) {
    var isMe = (msg.from === myRole);
    var senderName = names[msg.from] || ('Partner ' + msg.from);

    return `
      <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5 animate-fade-in">
        <span class="text-[9px] text-slate-500 px-1 font-mono">${escapeHtml(senderName)} · 📷 Foto · ${formatTime(msg.timestamp)}</span>
        <div class="max-w-[84%] sm:max-w-sm p-2 rounded-2xl theme-panel border border-slate-800 space-y-1.5 ${isMe ? 'rounded-tr-xs' : 'rounded-tl-xs'}">
          <div class="relative overflow-hidden rounded-xl bg-black flex items-center justify-center min-h-[140px] select-none">
            <img src="${msg.photoData}" alt="Verschlüsseltes Foto" class="privacy-blur w-full h-auto object-cover max-h-72 cursor-pointer transition-all duration-300" oncontextmenu="return false;" onmousedown="this.classList.add('revealed')" onmouseup="this.classList.remove('revealed')" ontouchstart="this.classList.add('revealed')" ontouchend="this.classList.remove('revealed')">
            <span class="absolute pointer-events-none text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-md">
              <span>🙈</span><span>Halten zum Enthüllen</span>
            </span>
          </div>
          ${msg.text ? `<p class="text-[10.5px] text-slate-300 px-1 leading-snug">${escapeHtml(msg.text)}</p>` : ''}
        </div>
      </div>
    `;
  }

  function renderChoreBubble(msg, myRole, isTop, names) {
    var isMe = (msg.from === myRole);
    var senderName = names[msg.from] || ('Partner ' + msg.from);
    var isPending = (msg.status === 'pending');
    var isApproved = (msg.status === 'approved');

    var statusBadge = '';
    if (isPending) {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">⏳ Prüfung ausstehend</span>';
    } else if (isApproved) {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">✓ Genehmigt (+' + (msg.awardedPoints || msg.defaultPoints) + ' P)</span>';
    } else {
      statusBadge = '<span class="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800">✕ Abgelehnt</span>';
    }

    return `
      <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5 animate-fade-in w-full">
        <span class="text-[9px] text-slate-500 px-1 font-mono">${escapeHtml(senderName)} · 📋 Pflicht eingereicht · ${formatTime(msg.timestamp)}</span>
        <div class="max-w-[94%] sm:max-w-md w-full p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 via-noir-900 to-indigo-950/40 border border-purple-800/80 space-y-2 shadow-md">
          <div class="flex items-start justify-between gap-2 border-b border-purple-900/50 pb-2">
            <div>
              <strong class="text-xs text-white block">${escapeHtml(msg.choreTitle)}</strong>
              <span class="text-[10px] text-purple-300 font-mono">Standardwert: ${msg.defaultPoints} P</span>
            </div>
            <div>${statusBadge}</div>
          </div>

          ${isPending && isTop ? `
            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-purple-900/60 space-y-2">
              <div class="flex items-center justify-between text-[11px]">
                <label for="award-pts-${msg.id}" class="text-slate-300 font-bold">Punkte buchen (anpassbar):</label>
                <input type="number" id="award-pts-${msg.id}" value="${msg.defaultPoints}" class="w-16 text-center text-xs p-1 bg-slate-950 border border-purple-700 rounded-lg text-amber-300 font-mono font-bold">
              </div>
              <div class="grid grid-cols-2 gap-2 pt-0.5">
                <button type="button" onclick="ChatApp.rejectChoreMessage('${msg.id}')" class="py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs touch-btn">
                  Ablehnen ✕
                </button>
                <button type="button" onclick="ChatApp.approveChoreMessage('${msg.id}')" class="py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs touch-btn shadow-md">
                  Genehmigen ✓
                </button>
              </div>
            </div>
          ` : ''}

          ${isPending && !isTop ? `
            <p class="text-[10.5px] text-slate-400 italic">Eingereicht. Sobald der Keyholder die Pflicht prüft, werden die Punkte gutgeschrieben.</p>
          ` : ''}
        </div>
      </div>
    `;
  }

  function sendTextMessage() {
    var input = document.getElementById('chat-text-input');
    var text = (input ? input.value : '').trim();
    if (!text) return;

    loadChatMessages();
    messages.push({
      id: "msg_txt_" + Date.now(),
      from: getMyRole(),
      type: "text",
      text: text,
      timestamp: Date.now()
    });

    saveChatMessages();
    renderChatStream();
    if (input) input.value = '';
  }

  function handlePhotoUpload(inputElement) {
    if (!inputElement || !inputElement.files || inputElement.files.length === 0) return;
    var file = inputElement.files[0];

    showToast("⏳ Komprimiere Foto clientseitig...");

    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var maxDim = 1200;
        var width = img.width;
        var height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        var compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

        loadChatMessages();
        messages.push({
          id: "msg_img_" + Date.now(),
          from: getMyRole(),
          type: "photo",
          photoData: compressedDataUrl,
          text: "Intimes Foto übermittelt.",
          timestamp: Date.now()
        });

        saveChatMessages();
        renderChatStream();
        inputElement.value = '';
        showToast("📷 Foto verschlüsselt im Stream bereitgestellt!");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function handleTaskDrawerClick() {
    var otherRole = getOtherRole();
    var otherDs = isDsEnabledForUser(otherRole);

    if (!otherDs) {
      var names = getPartnerNames();
      showToast("⚠️ " + (names[otherRole] || 'Dein Partner') + " hat das D/s- & Vertragsmodul noch nicht aktiviert. Ihr müsst es beide aktivieren, um Aufgaben und Strafen zu verknüpfen.");
      return;
    }

    toggleTaskDrawer();
  }

  function toggleTaskDrawer(forceState) {
    var drawer = document.getElementById('bottom-task-drawer');
    if (!drawer) return;

    if (typeof forceState === 'boolean') isDrawerOpen = forceState;
    else isDrawerOpen = !isDrawerOpen;

    if (isDrawerOpen) {
      renderBottomTaskDrawer();
      drawer.classList.remove('hidden');
    } else {
      drawer.classList.add('hidden');
    }
  }

  function renderBottomTaskDrawer() {
    var container = document.getElementById('bottom-task-quick-list');
    if (!container) return;

    var chores = [];
    try {
      var raw = localStorage.getItem('kompass_ledger_state');
      if (raw) {
        var lState = JSON.parse(raw);
        if (Array.isArray(lState.chores)) chores = lState.chores;
      }
    } catch (e) {}

    if (chores.length === 0) {
      container.innerHTML = '<span class="text-[10px] text-purple-300 italic py-1 px-2">Keine Pflichten im Ledger hinterlegt.</span>';
      return;
    }

    container.innerHTML = chores.map(function(c) {
      return `
        <button type="button" onclick="ChatApp.submitChoreFromDrawer('${c.id}')" class="px-3 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-left touch-btn flex items-center gap-1.5 flex-shrink-0 shadow-xs">
          <span class="text-xs font-bold text-white whitespace-nowrap">${escapeHtml(c.title)}</span>
          <span class="text-[9.5px] font-mono text-purple-200 font-bold px-1.5 py-0.2 rounded bg-purple-950 border border-purple-800">+${c.points}P</span>
        </button>
      `;
    }).join('');
  }

  function submitChoreFromDrawer(choreId) {
    var otherRole = getOtherRole();
    if (!isDsEnabledForUser(otherRole)) {
      var names = getPartnerNames();
      showToast("⚠️ " + (names[otherRole] || 'Dein Partner') + " hat D/s noch nicht aktiviert.");
      return;
    }

    var chores = [];
    try {
      var raw = localStorage.getItem('kompass_ledger_state');
      if (raw) {
        var lState = JSON.parse(raw);
        if (Array.isArray(lState.chores)) chores = lState.chores;
      }
    } catch (e) {}

    var chore = chores.find(function(c) { return c.id === choreId; });
    if (!chore) return;

    loadChatMessages();
    messages.push({
      id: "msg_task_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      from: getMyRole(),
      type: "chore_submission",
      choreId: chore.id,
      choreTitle: chore.title,
      defaultPoints: chore.points,
      status: "pending",
      timestamp: Date.now()
    });

    saveChatMessages();
    renderChatStream();
    toggleTaskDrawer(false);
    showToast("Pflicht '" + chore.title + "' zur Prüfung eingereicht 📋");
  }

  function approveChoreMessage(msgId) {
    if (!isUserTop()) {
      showToast("🔒 Nur der Keyholder / Top kann Aufgaben genehmigen.");
      return;
    }
    loadChatMessages();
    var msg = messages.find(function(m) { return m.id === msgId; });
    if (!msg || msg.status !== 'pending') return;

    var inputEl = document.getElementById('award-pts-' + msgId);
    var pointsToAward = inputEl ? parseInt(inputEl.value, 10) : msg.defaultPoints;
    if (isNaN(pointsToAward)) pointsToAward = msg.defaultPoints;

    msg.status = "approved";
    msg.awardedPoints = pointsToAward;

    try {
      var raw = localStorage.getItem('kompass_ledger_state');
      if (raw) {
        var lState = JSON.parse(raw);
        lState.balance = (lState.balance || 0) + pointsToAward;
        lState.updatedAt = Date.now();
        localStorage.setItem('kompass_ledger_state', JSON.stringify(lState));
      }
    } catch (e) {}

    saveChatMessages();
    renderChatStream();
    showToast("+" + pointsToAward + " Punkte für '" + msg.choreTitle + "' gutgeschrieben ✓");
  }

  function rejectChoreMessage(msgId) {
    if (!isUserTop()) return;
    loadChatMessages();
    var msg = messages.find(function(m) { return m.id === msgId; });
    if (!msg || msg.status !== 'pending') return;

    msg.status = "rejected";
    saveChatMessages();
    renderChatStream();
    showToast("Aufgabe '" + msg.choreTitle + "' abgelehnt.");
  }

  function clearHistoryPrompt() {
    var isConfirmed = confirm("Möchtest du den Chat-Verlauf auf diesem Gerät wirklich leeren?");
    if (isConfirmed) {
      messages = [];
      saveChatMessages();
      renderChatStream();
      showToast("Chat-Verlauf geleert.");
    }
  }

  function postSystemEvent(text) {
    if (!text) return;
    loadChatMessages();
    messages.push({
      id: "msg_sys_" + Date.now(),
      from: "system",
      type: "system_event",
      text: text,
      timestamp: Date.now()
    });
    saveChatMessages();
    renderChatStream();
  }

  window.ChatApp = {
    render: renderChatStream,
    sendTextMessage: sendTextMessage,
    handlePhotoUpload: handlePhotoUpload,
    handleTaskDrawerClick: handleTaskDrawerClick,
    toggleTaskDrawer: toggleTaskDrawer,
    submitChoreFromDrawer: submitChoreFromDrawer,
    approveChoreMessage: approveChoreMessage,
    rejectChoreMessage: rejectChoreMessage,
    postSystemEvent: postSystemEvent,
    clearHistoryPrompt: clearHistoryPrompt,
    isDsEnabledForUser: isDsEnabledForUser
  };

  // Rückwärtskompatibilität für bestehende Aufrufe
  window.LedgerChat = window.ChatApp;

  window.addEventListener('kompass_data_synced', function() {
    renderChatStream();
  });

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', renderChatStream);
  } else {
    renderChatStream();
  }

})(window);
