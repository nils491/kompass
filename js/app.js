/**
 * js/app.js
 * Zentraler Haupt-Controller des Kink- & Beziehungs-Kompasses.
 * 
 * Beinhaltet:
 * - View-Management (Hub, Survey, Safety, Single-Profile) & Hash-Routing
 * - Partner-Verwaltung (Partner 1 / Partner 2) & Namens-Synchronisation
 * - Fester Manipulationsschutz: Die physische Geräterolle wird beim Betrachten des Partnerprofils nicht überschrieben
 * - Schutz vor Manipulation im 6-Module-Sicherheits-Kodex
 * - Lückenlose Datenpersistenz (LocalStorage + Zero-Conflict Fallback)
 * - Burger-Menü & Desktop-Navigation Synchronisation
 * - Direktsprung-Routing aus Profil & Tabu-Listen
 * - Live-Status-Aktualisierung des D/s-Ledger-Badges auf dem Start-Hub
 * - Dateigrößen-Garantie: Weit unter 500 Zeilen.
 */

(function(window) {
  'use strict';

  var currentView = 'hub';
  var currentUser = 'A';

  var defaultNames = { A: 'Partner 1', B: 'Partner 2' };
  var defaultAnatomy = { A: 'penis', B: 'vulva' };
  var defaultAnswers = { A: {}, B: {} };
  var defaultSafety = { A: {}, B: {} };

  window.currentUser = currentUser;
  window.currentView = currentView;
  window.names = Object.assign({}, defaultNames);
  window.anatomy = Object.assign({}, defaultAnatomy);
  window.answers = { A: {}, B: {} };
  window.safetyConfig = { A: {}, B: {} };

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

  function getMyAssignedDeviceRole() {
    var isPaired = localStorage.getItem('kompass_is_paired') === 'true';
    if (!isPaired) {
      return null; // Lokaler Modus ohne Kopplung
    }
    return localStorage.getItem('kompass_assigned_role') || 'A';
  }

  function canEditCurrentProfile() {
    var myRole = getMyAssignedDeviceRole();
    if (!myRole) return true;
    return currentUser === myRole;
  }

  function loadCoreData() {
    try {
      var rawAnswers = localStorage.getItem('kompass_answers');
      if (rawAnswers) window.answers = JSON.parse(rawAnswers);

      var rawNames = localStorage.getItem('kompass_names');
      if (rawNames) window.names = JSON.parse(rawNames);

      var rawAnatomy = localStorage.getItem('kompass_anatomy');
      if (rawAnatomy) window.anatomy = JSON.parse(rawAnatomy);

      var rawSafety = localStorage.getItem('kompass_safety_config');
      if (rawSafety) window.safetyConfig = JSON.parse(rawSafety);

      var isPaired = localStorage.getItem('kompass_is_paired') === 'true';
      var savedRole = localStorage.getItem('kompass_assigned_role');
      if (isPaired && (savedRole === 'A' || savedRole === 'B')) {
        // Auf gekoppeltem Gerät immer zwingend die eigene zugewiesene Geräterolle aktivieren!
        currentUser = savedRole;
        window.currentUser = savedRole;
      }
    } catch (e) {
      console.warn("Fehler beim Laden lokaler Daten:", e);
    }

    if (!window.answers || typeof window.answers !== 'object') window.answers = { A: {}, B: {} };
    if (!window.answers.A) window.answers.A = {};
    if (!window.answers.B) window.answers.B = {};

    if (!window.names || typeof window.names !== 'object') window.names = Object.assign({}, defaultNames);
    if (!window.names.A) window.names.A = 'Partner 1';
    if (!window.names.B) window.names.B = 'Partner 2';

    if (!window.anatomy || typeof window.anatomy !== 'object') window.anatomy = Object.assign({}, defaultAnatomy);
    if (!window.safetyConfig || typeof window.safetyConfig !== 'object') window.safetyConfig = { A: {}, B: {} };
    if (!window.safetyConfig.A) window.safetyConfig.A = {};
    if (!window.safetyConfig.B) window.safetyConfig.B = {};
  }

  function saveCoreData() {
    try {
      localStorage.setItem('kompass_answers', JSON.stringify(window.answers));
      localStorage.setItem('kompass_names', JSON.stringify(window.names));
      localStorage.setItem('kompass_anatomy', JSON.stringify(window.anatomy));
      localStorage.setItem('kompass_safety_config', JSON.stringify(window.safetyConfig));

      if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
        window.CloudSync.trigger();
      }
    } catch (e) {
      console.error("Fehler beim Speichern der Kerndaten:", e);
    }
  }

  function setCurrentUser(user) {
    if (user !== 'A' && user !== 'B') return;
    loadCoreData();
    currentUser = user;
    window.currentUser = currentUser;

    var isPaired = localStorage.getItem('kompass_is_paired') === 'true';
    if (!isPaired) {
      try {
        localStorage.setItem('kompass_assigned_role', user);
      } catch (e) {}
    }

    saveCoreData();
    updateUserToggleUI();
    updateHubUI();

    if (currentView === 'survey' && window.SurveyEngine) {
      window.SurveyEngine.render();
    } else if (currentView === 'single' && window.ProfileEngine) {
      window.ProfileEngine.render();
    } else if (currentView === 'safety') {
      renderSafetyConfig();
    }

    var userName = (window.names && window.names[currentUser]) || (currentUser === 'A' ? 'Partner 1' : 'Partner 2');
    var myRole = getMyAssignedDeviceRole();

    if (myRole && currentUser !== myRole) {
      showToast("Ansicht: " + userName + " (Schreibgeschützt) 🔒");
    } else {
      showToast("Aktives Profil: " + userName + " ✓");
    }
  }

  function updateUserToggleUI() {
    var nameA = (window.names && window.names.A) || 'Partner 1';
    var nameB = (window.names && window.names.B) || 'Partner 2';

    // Desktop Buttons & Namen
    var btnA = document.getElementById('btn-user-A');
    var btnB = document.getElementById('btn-user-B');
    var dispA = document.getElementById('user-display-A');
    var dispB = document.getElementById('user-display-B');

    if (dispA) dispA.innerText = nameA;
    if (dispB) dispB.innerText = nameB;

    if (currentUser === 'A') {
      if (btnA) btnA.className = "px-2.5 py-1 rounded-lg font-bold bg-brand-700 text-white shadow-xs touch-btn";
      if (btnB) btnB.className = "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white touch-btn";
    } else {
      if (btnB) btnB.className = "px-2.5 py-1 rounded-lg font-bold bg-brand-700 text-white shadow-xs touch-btn";
      if (btnA) btnA.className = "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white touch-btn";
    }

    // Mobil: Header-Anzeigen
    var headerPair = document.getElementById('header-pair-names');
    if (headerPair) headerPair.innerText = nameA + " & " + nameB;

    var mobQuickLabel = document.getElementById('mobile-quick-partner-label');
    if (mobQuickLabel) {
      var shortName = (currentUser === 'A' ? nameA : nameB);
      mobQuickLabel.innerText = shortName.length > 8 ? shortName.substring(0, 7) + '…' : shortName;
    }

    // Mobil: Drawer Menü Umschalter
    var mobDrawerPair = document.getElementById('mobile-drawer-pair-names');
    if (mobDrawerPair) mobDrawerPair.innerText = nameA + " & " + nameB;

    var mobNameA = document.getElementById('mobile-drawer-name-A');
    var mobNameB = document.getElementById('mobile-drawer-name-B');
    if (mobNameA) mobNameA.innerText = nameA;
    if (mobNameB) mobNameB.innerText = nameB;

    var mobBtnA = document.getElementById('mobile-drawer-btn-A');
    var mobBtnB = document.getElementById('mobile-drawer-btn-B');

    if (mobBtnA && mobBtnB) {
      if (currentUser === 'A') {
        mobBtnA.className = "py-2.5 px-3 rounded-xl border text-left touch-btn font-bold transition bg-brand-700 border-brand-500 text-white shadow-md";
        mobBtnB.className = "py-2.5 px-3 rounded-xl border text-left touch-btn font-bold transition theme-panel text-slate-400";
      } else {
        mobBtnB.className = "py-2.5 px-3 rounded-xl border text-left touch-btn font-bold transition bg-brand-700 border-brand-500 text-white shadow-md";
        mobBtnA.className = "py-2.5 px-3 rounded-xl border text-left touch-btn font-bold transition theme-panel text-slate-400";
      }
    }
  }

  function switchMainView(viewName) {
    var validViews = ['hub', 'survey', 'safety', 'single'];
    if (validViews.indexOf(viewName) === -1) viewName = 'hub';

    currentView = viewName;
    window.currentView = viewName;

    validViews.forEach(function(v) {
      var section = document.getElementById('view-' + v);
      var navBtn = document.getElementById('nav-btn-' + v);

      if (section) {
        if (v === viewName) section.classList.remove('hidden');
        else section.classList.add('hidden');
      }

      if (navBtn) {
        if (v === viewName) {
          navBtn.className = "px-3 py-1.5 rounded-xl bg-brand-700 text-white shadow-xs transition flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 touch-btn";
        } else {
          navBtn.className = "px-3 py-1.5 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 touch-btn";
        }
      }
    });

    if (viewName === 'survey' && window.SurveyEngine) {
      window.SurveyEngine.render();
    } else if (viewName === 'single' && window.ProfileEngine) {
      window.ProfileEngine.render();
    } else if (viewName === 'safety') {
      renderSafetyConfig();
    } else if (viewName === 'hub') {
      updateHubUI();
    }

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  function updateHubUI() {
    loadCoreData();
    var chapters = window.surveyChapters || [];
    var uAnswers = (window.answers && window.answers[currentUser]) || {};

    // 1. Fortschritt berechnen
    var totalQuestions = 0;
    var answered = 0;
    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type === 'choice') {
          totalQuestions++;
          if (uAnswers['it_' + it.id + '_choice']) answered++;
        } else {
          totalQuestions += 2;
          if (typeof uAnswers['it_' + it.id + '_r1'] === 'number') answered++;
          if (typeof uAnswers['it_' + it.id + '_r2'] === 'number') answered++;
        }
      });
    });

    var pct = totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0;
    var badge = document.getElementById('hub-survey-pct-badge');
    if (badge) badge.innerText = pct + " %";

    var mobDrawerBadge = document.getElementById('mobile-drawer-prog-badge');
    if (mobDrawerBadge) mobDrawerBadge.innerText = pct + " %";

    // 2. Tabu-Zähler (Gemeinsame Tabus beider Partner)
    var tabuCount = 0;
    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          if (window.answers.A && (window.answers.A['it_' + it.id + '_r1'] === 1 || window.answers.A['it_' + it.id + '_r2'] === 1)) tabuCount++;
          if (window.answers.B && (window.answers.B['it_' + it.id + '_r1'] === 1 || window.answers.B['it_' + it.id + '_r2'] === 1)) tabuCount++;
        }
      });
    });

    var headTabu = document.getElementById('header-tabu-count');
    if (headTabu) headTabu.innerText = tabuCount.toString();

    var mobDrawerTabu = document.getElementById('mobile-drawer-tabu-count');
    if (mobDrawerTabu) mobDrawerTabu.innerText = tabuCount.toString();

    // 3. Toy-Zähler
    if (window.HubToys && typeof window.HubToys.updateCount === 'function') {
      window.HubToys.updateCount();
    }

    // 4. Ledger-Badge im Hub aktualisieren
    try {
      var rawLedger = localStorage.getItem('kompass_ledger_state');
      var ledgerBadge = document.getElementById('hub-ledger-badge');
      if (ledgerBadge) {
        if (rawLedger) {
          var lState = JSON.parse(rawLedger);
          var bal = (lState.balance !== undefined) ? lState.balance : 0;
          var sign = bal >= 0 ? '+' : '';
          ledgerBadge.innerText = (lState.isLocked ? "🔒 " : "🔓 ") + sign + bal + " P";
        } else {
          ledgerBadge.innerText = "Bereit 🗝️";
        }
      }
    } catch (e) {}
  }

  var SAFETY_MODULES = [
    {
      id: "safewords",
      title: "1. Safeword-Ampel & Notruf",
      desc: "Das universelle Ampelsystem für jede Session. Keine Diskussion bei Gelb oder Rot.",
      options: [
        { id: "standard_ampel", label: "🟢 Grün (Weiter / Mehr) · 🟡 Gelb (Tempo drosseln / Halten) · 🔴 Rot (Sofortiger Stillstand)", hint: "Der weltweite BDSM-Standard" },
        { id: "soft_words", label: "Milde Safewords (z. B. Pause / Schoko / Halt)", hint: "Für sanfte Rollenspiele" },
        { id: "strict_safeword", label: "Ein einziges Notfall-Codewort (z. B. 'Rotstift')", hint: "Kompromissloser Not-Aus" }
      ]
    },
    {
      id: "nonverbal",
      title: "2. Knebelsignale & Nonverbale Notrufe",
      desc: "Signale für Situationen, in denen der Bottom durch Knebel, Erregung oder Trance nicht sprechen kann.",
      options: [
        { id: "drop_object", label: "Gegenstand fallen lassen (Tuch, Glöckchen oder Löffel in der Hand)", hint: "Funktioniert auch bei tiefem Subspace" },
        { id: "double_tap", label: "Zweimaliges schnelles Klopfen (Tap-Out mit Finger oder Fuß)", hint: "Wie im Kampfsport" },
        { id: "head_shake", label: "Dreimaliges energisches Kopfschütteln", hint: "Wenn Hände und Füße fixiert sind" }
      ]
    },
    {
      id: "limits_physical",
      title: "3. Körperliche Tabu-Zonen & No-Gos",
      desc: "Körperregionen und Einwirkungen, die aus medizinischen oder persönlichen Gründen strikt tabu sind.",
      options: [
        { id: "no_neck_spine", label: "Keine Schläge auf Nacken, Wirbelsäule, Nieren oder Gelenke", hint: "Medizinische Grundregel" },
        { id: "no_face_strike", label: "Keine Schläge ins Gesicht / Ohrfeigen", hint: "Schutz von Augen und Kiefer" },
        { id: "no_permanent_marks", label: "Keine bleibenden Spuren (maximal Rötungen für 24 Stunden)", hint: "Alltagstauglichkeit" }
      ]
    },
    {
      id: "emergency_tools",
      title: "4. Notfall-Werkzeug & Griffbereitschaft",
      desc: "Werkzeuge zur sofortigen Befreiung bei Seilblockaden oder Atembeschwerden.",
      options: [
        { id: "emt_shears", label: "Verbandsschere (EMT-Shears mit abgerundeter Spitze) liegt sichtbar am Nachttisch", hint: "Pflicht bei jeder Seilsession" },
        { id: "quick_release", label: "Ausschließlich Schnelllöseknoten (Quick-Release) bei Fesselungen", hint: "Sekundenschnelles Lösen mit einem Zug" },
        { id: "keys_nearby", label: "Schlüssel für Handschellen oder Keuschheit hängen am Bettpfosten", hint: "Kein Suchen im Notfall" }
      ]
    },
    {
      id: "drop_prevention",
      title: "5. Subdrop- & Topdrop-Prävention",
      desc: "Vermeidung von emotionalen Tiefs und hormonellen Abstürzen nach intensiven Sessions.",
      options: [
        { id: "sugar_water", label: "Traubenzucker, warmes Wasser oder warmer Tee stehen griffbereit", hint: "Gleicht den Blutzuckerspiegel sofort aus" },
        { id: "warm_blanket", label: "Warme Kuscheldecken für mindestens 15 Minuten Halten nach dem Spiel", hint: "Beugt Kältezittern nach Endorphinabbau vor" },
        { id: "no_immediate_exit", label: "Kein sofortiges Verlassen des Raumes; Top bleibt anwesend", hint: "Seelische Sicherheit" }
      ]
    },
    {
      id: "aftercare_24h",
      title: "6. 24h-Aftercare Vereinbarung",
      desc: "Der emotionale Check-in am Folgetag, um das Erlebte zu integrieren und Nähe zu sichern.",
      options: [
        { id: "morning_checkin", label: "Liebevolle Nachricht oder Anruf am nächsten Morgen ('Wie geht es deinem Körper?')", hint: "Schließt die Session harmonisch ab" },
        { id: "evening_debrief", label: "Kurzes gemeinsames Feedback am nächsten Abend ohne Vorwürfe", hint: "Lernkurve für das nächste Mal" },
        { id: "rest_day", label: "Folgetag bewusst ruhig halten und regenerieren", hint: "Erholung für das Nervensystem" }
      ]
    }
  ];

  function renderSafetyConfig() {
    var container = document.getElementById('safety-configurator-full-container');
    if (!container) return;

    var curUser = currentUser;
    var otherUser = (curUser === 'A' ? 'B' : 'A');
    var isEditable = canEditCurrentProfile();

    var myConfig = (window.safetyConfig && window.safetyConfig[curUser]) || {};
    var otherConfig = (window.safetyConfig && window.safetyConfig[otherUser]) || {};

    var nameMe = (window.names && window.names[curUser]) || (curUser === 'A' ? 'Partner 1' : 'Partner 2');
    var nameOther = (window.names && window.names[otherUser]) || (otherUser === 'A' ? 'Partner 1' : 'Partner 2');

    var html = '';

    if (!isEditable) {
      html += `
        <div class="p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-700/80 text-indigo-200 text-xs flex items-center gap-2.5 shadow-lg mb-3">
          <span class="text-xl flex-shrink-0">🔒</span>
          <div>
            <strong class="text-white block font-bold text-xs">Sicherheits-Kodex von ${escapeHtml(nameMe)} (Schreibgeschützt)</strong>
            <span class="text-[10.5px] text-slate-300 block leading-snug">
              Du siehst die Einstellungen deines Partners. Manipulationen sind gesperrt.
            </span>
          </div>
        </div>
      `;
    }

    SAFETY_MODULES.forEach(function(mod) {
      var myVal = myConfig[mod.id];
      var otherVal = otherConfig[mod.id];

      var isAgreed = (myVal && otherVal && myVal === otherVal);
      var isDivergent = (myVal && otherVal && myVal !== otherVal);

      var statusBadge = '';
      if (isAgreed) {
        statusBadge = '<span class="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">✓ Einig</span>';
      } else if (isDivergent) {
        statusBadge = '<span class="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-950 text-amber-300 border border-amber-800">⚠️ Abweichung</span>';
      }

      html += '<div class="theme-card rounded-2xl p-4 sm:p-5 border space-y-3 shadow-sm">';
      html += '  <div class="flex items-start justify-between gap-2">';
      html += '    <div>';
      html += '      <strong class="text-xs sm:text-sm font-extrabold text-white block">' + escapeHtml(mod.title) + '</strong>';
      html += '      <p class="text-[11px] text-slate-400 mt-0.5 leading-snug">' + escapeHtml(mod.desc) + '</p>';
      html += '    </div>';
      html += '    <div>' + statusBadge + '</div>';
      html += '  </div>';

      html += '  <div class="space-y-1.5 pt-1">';
      mod.options.forEach(function(opt) {
        var isMyChoice = (myVal === opt.id);
        var isOtherChoice = (otherVal === opt.id);

        var btnClass = isMyChoice
          ? 'bg-teal-950/60 border-teal-500 text-white font-bold shadow-md'
          : 'theme-panel border-slate-800 text-slate-300 hover:border-slate-700';

        if (!isEditable) {
          btnClass += ' opacity-80 cursor-not-allowed';
        }

        var clickHandler = isEditable 
          ? ('onclick="selectSafetyOption(\'' + mod.id + '\', \'' + opt.id + '\')"')
          : ('onclick="showToast(\'🔒 Schreibschutz: Du kannst nur dein eigenes Profil bearbeiten.\')"');

        html += '<button type="button" ' + clickHandler + ' class="w-full p-2.5 rounded-xl border text-left transition touch-btn text-xs ' + btnClass + '">';
        html += '  <div class="flex items-center justify-between gap-2">';
        html += '    <span class="block">' + escapeHtml(opt.label) + '</span>';
        html += '    <span class="text-xs font-mono ' + (isMyChoice ? 'text-teal-300 font-bold' : 'text-slate-600') + '">' + (isMyChoice ? '✓' : '○') + '</span>';
        html += '  </div>';
        html += '  <span class="text-[9.5px] text-slate-400 block mt-0.5">' + escapeHtml(opt.hint) + '</span>';

        if (isOtherChoice) {
          html += '  <span class="inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">Wahl von ' + escapeHtml(nameOther) + '</span>';
        }

        html += '</button>';
      });
      html += '  </div>';

      html += '</div>';
    });

    container.innerHTML = html;
  }

  function selectSafetyOption(moduleId, optionId) {
    if (!canEditCurrentProfile()) {
      showToast("🔒 Schreibschutz aktiv: Du kannst nur dein eigenes Profil bearbeiten.");
      return;
    }

    var curUser = currentUser;
    if (!window.safetyConfig) window.safetyConfig = { A: {}, B: {} };
    if (!window.safetyConfig[curUser]) window.safetyConfig[curUser] = {};

    window.safetyConfig[curUser][moduleId] = optionId;
    saveCoreData();
    renderSafetyConfig();
    showToast("Sicherheits-Option gespeichert ✓");
  }

  function goToSurveyItem(itemId) {
    switchMainView('survey');
    setTimeout(function() {
      if (window.SurveyEngine && typeof window.SurveyEngine.jumpToItem === 'function') {
        window.SurveyEngine.jumpToItem(itemId);
      }
    }, 120);
  }

  function handleUrlHashRouting() {
    var hash = window.location.hash || '';
    if (!hash) return;

    var cleanHash = hash.replace(/^#/, '');
    var parts = cleanHash.split('&');
    var params = {};

    parts.forEach(function(p) {
      var kv = p.split('=');
      if (kv[0]) params[kv[0]] = decodeURIComponent(kv[1] || '');
    });

    if (params.user === 'A' || params.user === 'B') {
      setCurrentUser(params.user);
    }

    if (params.view) {
      switchMainView(params.view);
    }

    if (params.jumpItem) {
      goToSurveyItem(params.jumpItem);
    }
  }

  function initApp() {
    loadCoreData();
    updateUserToggleUI();
    updateHubUI();
    renderSafetyConfig();

    handleUrlHashRouting();

    window.addEventListener('hashchange', handleUrlHashRouting);
  }

  window.switchMainView = switchMainView;
  window.setCurrentUser = setCurrentUser;
  window.updateUserToggleUI = updateUserToggleUI;
  window.updateHubUI = updateHubUI;
  window.goToSurveyItem = goToSurveyItem;
  window.selectSafetyOption = selectSafetyOption;
  window.renderSafetyConfig = renderSafetyConfig;
  window.loadCoreData = loadCoreData;
  window.saveCoreData = saveCoreData;
  window.canEditCurrentProfile = canEditCurrentProfile;
  window.getMyAssignedDeviceRole = getMyAssignedDeviceRole;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})(window);
