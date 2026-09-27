/**
 * js/app.js
 * Master-App-Engine & Kern-Controller für den Kink- & Beziehungs-Kompass.
 * 
 * Beinhaltet:
 * - Globale Zustandsverwaltung (currentUser 'A'/'B', currentView)
 * - Persistenz (Laden & Speichern von Antworten, Namen, Anatomie, Safety)
 * - View-Routing (Start-Hub, Fragebogen, Sicherheits-Kodex, Mein Profil)
 * - Sofortige Bereitstellung aller Event-Handler auf window-Ebene
 * - Partner-Umschaltung & Namens-Synchronisation im Header
 * - Sicherheits-Kodex-Konfigurator mit Konsensabgleich
 * - Start-Hub KPI-Aktualisierung (Fortschritt, Tabu-Zähler, Toy-Badge)
 * - Deep-Linking zu Fragen im Bogen via goToSurveyItem
 */

(function(window) {
  'use strict';

  var currentUser = 'A';
  var currentView = 'hub';

  var names = { A: 'Partner 1', B: 'Partner 2' };
  var anatomy = { A: 'penis', B: 'vulva' };
  var answers = { A: {}, B: {} };
  var safetyConfig = { A: {}, B: {} };

  var SAFETY_MODULES = [
    {
      id: "emergency_tools",
      title: "1. Notfall-Werkzeug (Sicherheits-Cutter)",
      desc: "Wo liegt der Sicherheits-Cutter oder die Verbandsschere für Seile und Fesseln?",
      options: [
        { val: "bed_table", label: "Auf dem Nachttisch griffbereit", hint: "Höchste Sicherheitsstufe – innerhalb von 2 Sekunden erreichbar." },
        { val: "dresser", label: "Auf der Kommode im Raum", hint: "Im Schlafzimmer sichtbar deponiert." },
        { val: "box", label: "In der BDSM-Equipment-Box", hint: "Zentral bei allen Fesselwerkzeugen." }
      ]
    },
    {
      id: "safeword",
      title: "2. Safeword-Vereinbarung",
      desc: "Welches System signalisiert Grenzen und sofortigen Abbruch?",
      options: [
        { val: "traffic_light", label: "Ampel-System (Grün / Gelb / Rot)", hint: "Standard: Gelb = Tempo drosseln, Rot = Sofortiger Stillstand." },
        { val: "single_word", label: "Ein einzelnes Wort (z. B. 'Brombeere')", hint: "Klares, unverwechselbares Wort, das im Kontext sonst nie fällt." },
        { val: "physical_only", label: "Nonverbal (Gegenstand fallen lassen / 2x Klopfen)", hint: "Pflicht bei Knebeldruck oder reduzierter Sprache." }
      ]
    },
    {
      id: "gag_signal",
      title: "3. Knebel-Signal & Nonverbaler Abbruch",
      desc: "Wie signalisiert der Bottom bei versperrtem Mundraum ein Veto?",
      options: [
        { val: "drop_towel", label: "Drop-Tuch / Glöckchen in der Hand", hint: "Wird der Gegenstand losgelassen, stoppt die Handlung sofort." },
        { val: "tap_twice", label: "Zweimaliges deutliches Klopfen", hint: "Zweimaliges Schlagen mit flacher Hand oder Fuß." },
        { val: "humming", label: "Gutturales Summen (Zweimal laut brummen)", hint: "Akustisches Vibrationssignal aus der Kehle." }
      ]
    },
    {
      id: "vital_checks",
      title: "4. Vital- & Zirkulations-Checks",
      desc: "In welchen Abständen prüft der Top Fingerwärme, Puls und Gelenke?",
      options: [
        { val: "10_min", label: "Alle 10 Minuten", hint: "Sehr engmaschige Kontrolle bei straffen Fesselungen." },
        { val: "15_min", label: "Alle 15 Minuten (Standard)", hint: "Empfohlener Richtwert für Shibari und Suspension." },
        { val: "intuitive", label: "Intuitiv nach Reizintensität", hint: "Kontinuierliche Beobachtung ohne starren Wecker." }
      ]
    },
    {
      id: "aftercare",
      title: "5. Aftercare-Schwerpunkt",
      desc: "Was braucht der Bottom nach der Session am dringendsten?",
      options: [
        { val: "holding", label: "Festes Halten in warmen Decken (Holding)", hint: "Parasympathische Beruhigung durch Körperwärme & Decken." },
        { val: "food_drink", label: "Süße Getränke & Elektrolyte / Snacks", hint: "Stabilisiert den Blutzuckerspiegel nach dem Adrenalinkick." },
        { val: "quiet_space", label: "Ruhe und stilles Liegen ohne Sprechzwang", hint: "Sanftes Zurückkehren in den Körper ohne Reizüberflutung." },
        { val: "verbal_debrief", label: "Ausführliches verbales Feedback & Bestätigung", hint: "Lob, Entlastung und gemeinsame Einordnung des Erlebten." }
      ]
    },
    {
      id: "checkin_24h",
      title: "6. Der 24-Stunden-Check-in (Subdrop-Prophylaxe)",
      desc: "Wie fangen wir ein mögliches emotionales Tief (Subdrop / Topdrop) am Folgetag ab?",
      options: [
        { val: "morning_msg", label: "Liebevolle Nachricht am nächsten Morgen", hint: "Kurzes Signal: 'Ich denke an dich, wie fühlst du dich?'" },
        { val: "evening_talk", label: "Gemeinsamer Abend-Tee mit kurzem Austausch", hint: "10 Minuten Reflexion über das Wohlbefinden am Folgetag." },
        { val: "cuddle_time", label: "Ausgiebige Kuschelzeit am nächsten Tag", hint: "Körperliche Re-Integration durch Oxytocin-Bindung." }
      ]
    }
  ];

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

  function loadCoreData() {
    try {
      var savedUser = localStorage.getItem('kompass_current_user');
      if (savedUser === 'A' || savedUser === 'B') currentUser = savedUser;

      var nm = localStorage.getItem('kompass_names');
      if (nm) names = JSON.parse(nm);

      var an = localStorage.getItem('kompass_anatomy');
      if (an) anatomy = JSON.parse(an);

      var ans = localStorage.getItem('kompass_answers');
      if (ans) answers = JSON.parse(ans);

      var sc = localStorage.getItem('kompass_safety_config');
      if (sc) safetyConfig = JSON.parse(sc);
    } catch (e) {
      console.warn("Fehler beim Laden der Kerndaten:", e);
    }

    if (!names || typeof names !== 'object') names = { A: 'Partner 1', B: 'Partner 2' };
    if (!anatomy || typeof anatomy !== 'object') anatomy = { A: 'penis', B: 'vulva' };
    if (!answers || typeof answers !== 'object') answers = { A: {}, B: {} };
    if (!answers.A) answers.A = {};
    if (!answers.B) answers.B = {};
    if (!safetyConfig || typeof safetyConfig !== 'object') safetyConfig = { A: {}, B: {} };
    if (!safetyConfig.A) safetyConfig.A = {};
    if (!safetyConfig.B) safetyConfig.B = {};

    window.currentUser = currentUser;
    window.names = names;
    window.anatomy = anatomy;
    window.answers = answers;
    window.safetyConfig = safetyConfig;
  }

  function saveCoreData() {
    try {
      // Vor dem Speichern immer sicherstellen, dass keine leeren Variablen globale Daten überschreiben
      if (window.answers && typeof window.answers === 'object') answers = window.answers;
      if (window.names && typeof window.names === 'object') names = window.names;
      if (window.anatomy && typeof window.anatomy === 'object') anatomy = window.anatomy;
      if (window.safetyConfig && typeof window.safetyConfig === 'object') safetyConfig = window.safetyConfig;

      localStorage.setItem('kompass_current_user', currentUser);
      localStorage.setItem('kompass_names', JSON.stringify(names));
      localStorage.setItem('kompass_anatomy', JSON.stringify(anatomy));
      localStorage.setItem('kompass_answers', JSON.stringify(answers));
      localStorage.setItem('kompass_safety_config', JSON.stringify(safetyConfig));

      if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
        window.CloudSync.trigger();
      }
    } catch (e) {
      console.error("Fehler beim Speichern der Kerndaten:", e);
    }
  }

  function setCurrentUser(user) {
    if (user !== 'A' && user !== 'B') return;
    loadCoreData(); // Zuerst frische Daten aus dem Speicher holen
    currentUser = user;
    window.currentUser = currentUser;
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

    var userName = names[currentUser] || (currentUser === 'A' ? 'Partner 1' : 'Partner 2');
    showToast("Aktives Profil: " + userName);
  }

  function updateUserToggleUI() {
    var btnA = document.getElementById('btn-user-A');
    var btnB = document.getElementById('btn-user-B');
    var dispA = document.getElementById('user-display-A');
    var dispB = document.getElementById('user-display-B');
    var headerPair = document.getElementById('header-pair-names');

    var nameA = (names && names.A) ? names.A.trim() : 'Partner 1';
    var nameB = (names && names.B) ? names.B.trim() : 'Partner 2';

    if (dispA) dispA.innerText = nameA || 'Partner 1';
    if (dispB) dispB.innerText = nameB || 'Partner 2';

    if (headerPair) {
      headerPair.innerText = (nameA || 'Partner 1') + " & " + (nameB || 'Partner 2');
    }

    if (currentUser === 'A') {
      if (btnA) btnA.className = "px-2.5 py-1 rounded-lg font-bold bg-brand-700 text-white shadow-xs touch-btn";
      if (btnB) btnB.className = "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white touch-btn";
    } else {
      if (btnB) btnB.className = "px-2.5 py-1 rounded-lg font-bold bg-brand-700 text-white shadow-xs touch-btn";
      if (btnA) btnA.className = "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white touch-btn";
    }
  }

  function switchMainView(viewId) {
    var validViews = ['hub', 'survey', 'safety', 'single'];
    if (validViews.indexOf(viewId) === -1) viewId = 'hub';
    currentView = viewId;

    validViews.forEach(function(v) {
      var section = document.getElementById('view-' + v);
      var navBtn = document.getElementById('nav-btn-' + v);
      if (section) {
        if (v === viewId) section.classList.remove('hidden');
        else section.classList.add('hidden');
      }
      if (navBtn) {
        if (v === viewId) {
          navBtn.className = "px-3 py-1.5 rounded-xl bg-brand-700 text-white shadow-xs transition flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 touch-btn cursor-default";
        } else {
          var colorClass = (v === 'safety') ? 'text-teal-400 hover:text-teal-200' : 'text-slate-400 hover:text-white';
          navBtn.className = "px-3 py-1.5 rounded-xl " + colorClass + " transition flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 touch-btn";
        }
      }
    });

    try {
      window.location.hash = "view=" + viewId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }

    if (viewId === 'survey' && window.SurveyEngine) {
      window.SurveyEngine.render();
    } else if (viewId === 'single' && window.ProfileEngine) {
      window.ProfileEngine.render();
    } else if (viewId === 'safety') {
      renderSafetyConfig();
    } else if (viewId === 'hub') {
      updateHubUI();
    }
  }

  function updateHubUI() {
    updateUserToggleUI();

    var prog = (window.SurveyEngine && typeof window.SurveyEngine.getProgressData === 'function')
      ? window.SurveyEngine.getProgressData(currentUser)
      : { pct: 0 };

    var hubBadge = document.getElementById('hub-survey-pct-badge');
    if (hubBadge) hubBadge.innerText = prog.pct + " %";

    var allChapters = window.surveyChapters || [];
    var tabuCount = 0;
    allChapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          if (answers.A && answers.A['it_' + it.id + '_r1'] === 1) tabuCount++;
          if (answers.A && answers.A['it_' + it.id + '_r2'] === 1) tabuCount++;
          if (answers.B && answers.B['it_' + it.id + '_r1'] === 1) tabuCount++;
          if (answers.B && answers.B['it_' + it.id + '_r2'] === 1) tabuCount++;
        }
      });
    });

    var tabuBadge = document.getElementById('header-tabu-count');
    if (tabuBadge) tabuBadge.innerText = tabuCount;

    var aiActive = (localStorage.getItem('kompass_ai_active') === 'true');
    var hubAiBadge = document.getElementById('hub-ai-badge');
    var hubAiTile = document.getElementById('hub-tile-ai');
    if (hubAiBadge) {
      if (aiActive) hubAiBadge.classList.remove('hidden');
      else hubAiBadge.classList.add('hidden');
    }
    if (hubAiTile) {
      if (aiActive) hubAiTile.classList.remove('hidden');
      else hubAiTile.classList.add('hidden');
    }

    if (window.HubToys && typeof window.HubToys.updateCount === 'function') {
      window.HubToys.updateCount();
    }
  }

  function renderSafetyConfig() {
    var container = document.getElementById('safety-configurator-full-container');
    if (!container) return;

    var myConfig = safetyConfig[currentUser] || {};
    var otherUser = (currentUser === 'A') ? 'B' : 'A';
    var otherConfig = safetyConfig[otherUser] || {};
    var myName = names[currentUser] || (currentUser === 'A' ? 'Partner 1' : 'Partner 2');
    var otherName = names[otherUser] || (otherUser === 'A' ? 'Partner 1' : 'Partner 2');

    var html = '';
    SAFETY_MODULES.forEach(function(mod) {
      var myVal = myConfig[mod.id];
      var otherVal = otherConfig[mod.id];
      var isConsensus = (myVal && otherVal && myVal === otherVal);

      html += '<div class="theme-card rounded-3xl p-5 sm:p-6 border space-y-3 shadow-md">';
      html += '<div class="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">';
      html += '  <div>';
      html += '    <h3 class="text-sm font-extrabold text-white">' + escapeHtml(mod.title) + '</h3>';
      html += '    <p class="text-[11px] text-slate-400 mt-0.5 leading-snug">' + escapeHtml(mod.desc) + '</p>';
      html += '  </div>';

      if (isConsensus) {
        html += '<span class="px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1">';
        html += '<span>✓</span><span>Gemeinsamer Konsens</span></span>';
      } else if (myVal && otherVal) {
        html += '<span class="px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">';
        html += '<span>⚠️</span><span>Abweichung</span></span>';
      }
      html += '</div>';

      html += '<div class="space-y-2">';
      mod.options.forEach(function(opt) {
        var isMyChoice = (myVal === opt.val);
        var isOtherChoice = (otherVal === opt.val);

        var borderClass = isMyChoice 
          ? 'bg-teal-950/40 border-teal-500 shadow-md' 
          : 'theme-panel border-slate-800 hover:border-slate-700';

        html += '<div onclick="saveSafetyOption(\'' + mod.id + '\', \'' + opt.val + '\')" class="p-3 rounded-2xl border cursor-pointer touch-btn transition flex items-start justify-between gap-3 ' + borderClass + '">';
        html += '  <div class="space-y-0.5 flex-1">';
        html += '    <strong class="text-xs text-white block">' + escapeHtml(opt.label) + '</strong>';
        html += '    <span class="text-[10.5px] text-slate-400 block leading-snug">' + escapeHtml(opt.hint) + '</span>';
        html += '  </div>';

        html += '  <div class="flex flex-col items-end gap-1 flex-shrink-0 text-[10px] font-bold">';
        if (isMyChoice) {
          html += '<span class="px-2 py-0.5 rounded-lg bg-teal-900 text-teal-100 border border-teal-600">Deine Wahl: ' + escapeHtml(myName) + '</span>';
        }
        if (isOtherChoice) {
          html += '<span class="px-2 py-0.5 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800">Wahl von ' + escapeHtml(otherName) + '</span>';
        }
        html += '  </div>';

        html += '</div>';
      });
      html += '</div>';

      html += '</div>';
    });

    container.innerHTML = html;
  }

  function saveSafetyOption(key, val) {
    if (!safetyConfig[currentUser]) safetyConfig[currentUser] = {};
    safetyConfig[currentUser][key] = val;
    saveCoreData();
    renderSafetyConfig();
    showToast("Sicherheits-Einstellung gesichert ✓");
  }

  function handleHashNavigation() {
    var hash = window.location.hash || '';
    var match = hash.match(/view=([a-z]+)/);
    var target = match ? match[1] : 'hub';

    var userMatch = hash.match(/user=([AB])/);
    if (userMatch && userMatch[1]) {
      currentUser = userMatch[1];
      window.currentUser = currentUser;
      updateUserToggleUI();
    }

    switchMainView(target);

    var jumpMatch = hash.match(/jumpItem=(\d+)/);
    if (jumpMatch && jumpMatch[1]) {
      var targetId = parseInt(jumpMatch[1], 10);
      setTimeout(function() {
        if (window.SurveyEngine && typeof window.SurveyEngine.jumpToItem === 'function') {
          window.SurveyEngine.jumpToItem(targetId);
        }
      }, 200);
    }
  }

  function goToSurveyItem(itemId) {
    switchMainView('survey');
    setTimeout(function() {
      if (window.SurveyEngine && typeof window.SurveyEngine.jumpToItem === 'function') {
        window.SurveyEngine.jumpToItem(itemId);
      }
    }, 150);
  }

  window.switchMainView = switchMainView;
  window.setCurrentUser = setCurrentUser;
  window.saveSafetyOption = saveSafetyOption;
  window.goToSurveyItem = goToSurveyItem;
  window.saveCoreData = saveCoreData;
  window.loadCoreData = loadCoreData;
  window.updateUserToggleUI = updateUserToggleUI;
  window.updateHubUI = updateHubUI;

  // Hört auf Cloud-Aktualisierungen und rendert sofort die Benutzeroberfläche neu
  window.addEventListener('kompass_data_synced', function() {
    loadCoreData();
    updateUserToggleUI();
    updateHubUI();
    if (currentView === 'survey' && window.SurveyEngine) window.SurveyEngine.render();
    if (currentView === 'single' && window.ProfileEngine) window.ProfileEngine.render();
    if (currentView === 'safety') renderSafetyConfig();
  });

  window.addEventListener('hashchange', handleHashNavigation);

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', function() {
      loadCoreData();
      handleHashNavigation();
      updateHubUI();
    });
  } else {
    loadCoreData();
    handleHashNavigation();
    updateHubUI();
  }

})(window);
