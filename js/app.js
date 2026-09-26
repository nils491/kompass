/**
 * js/app.js
 * Kompass-Logik & Master-App-Engine
 * 
 * Steuert:
 * - Haupt-Dashboard (Hub) & Navigation (Hub, Fragebogen, Sicherheits-Kodex, Mein Profil)
 * - Dynamischen Fragebogen (35 Kapitel, Multi-Choice, Ratings 1-5, Filter, Quick-Grid)
 * - Direkte Anbindung an die dynamische KI-Recherche (KinkResearch.open)
 * - Psychologische 5-Säulen-Berechnung & Erotisches Archetypen-Radar (Chart.js)
 * - Tiefenpsychologisches KI-Einzelgutachten über Google Gemini
 */

(function(window) {
  'use strict';

  var currentUser = 'A';
  var currentChapterIndex = 0;
  var activeSurveyFilter = 'all';
  var singleRadarChartInstance = null;

  var names = { A: 'Partner 1', B: 'Partner 2' };
  var anatomy = { A: 'penis', B: 'vulva' };
  var answers = { A: {}, B: {} };
  var safetyConfig = { A: {}, B: {} };

  // Globale Registrierungen SOFORT durchführen, damit Klicks nie ins Leere laufen
  window.setCurrentUser = setCurrentUser;
  window.switchMainView = switchMainView;
  window.updateHubUI = updateHubUI;
  window.renderSurveyChapter = renderSurveyChapter;
  window.renderSingleProfile = renderSingleProfile;
  window.renderSafetyConfig = renderSafetyConfig;
  window.openItemResearch = openItemResearch;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function openItemResearch(itemId) {
    var chapters = window.surveyChapters || [];
    var foundItem = null;
    for (var c = 0; c < chapters.length; c++) {
      var items = chapters[c].items || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === itemId) {
          foundItem = items[i];
          break;
        }
      }
      if (foundItem) break;
    }
    if (foundItem && window.KinkResearch && typeof window.KinkResearch.open === 'function') {
      window.KinkResearch.open(foundItem.title, foundItem.desc);
    } else if (window.KinkResearch) {
      window.KinkResearch.open();
    }
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

  function loadCoreData() {
    try {
      var nm = localStorage.getItem('kompass_names');
      if (nm && nm !== 'null') names = JSON.parse(nm);

      var an = localStorage.getItem('kompass_anatomy');
      if (an && an !== 'null') anatomy = JSON.parse(an);

      var ans = localStorage.getItem('kompass_answers');
      if (ans && ans !== 'null') answers = JSON.parse(ans);

      var sc = localStorage.getItem('kompass_safety_config');
      if (sc && sc !== 'null') safetyConfig = JSON.parse(sc);
    } catch (e) {
      console.warn("Fehler beim Laden von Kerndaten:", e);
    }
    
    if (!names || typeof names !== 'object') names = { A: 'Partner 1', B: 'Partner 2' };
    if (!anatomy || typeof anatomy !== 'object') anatomy = { A: 'penis', B: 'vulva' };
    if (!answers || typeof answers !== 'object') answers = { A: {}, B: {} };
    if (!answers.A) answers.A = {};
    if (!answers.B) answers.B = {};
    if (!safetyConfig || typeof safetyConfig !== 'object') safetyConfig = { A: {}, B: {} };
    if (!safetyConfig.A) safetyConfig.A = {};
    if (!safetyConfig.B) safetyConfig.B = {};

    window.names = names;
    window.anatomy = anatomy;
    window.answers = answers;
    window.safetyConfig = safetyConfig;
    window.currentUser = currentUser;
  }

  function saveCoreData() {
    try {
      localStorage.setItem('kompass_names', JSON.stringify(names));
      localStorage.setItem('kompass_anatomy', JSON.stringify(anatomy));
      localStorage.setItem('kompass_answers', JSON.stringify(answers));
      localStorage.setItem('kompass_safety_config', JSON.stringify(safetyConfig));
    } catch (e) {
      console.error("Fehler beim Speichern von Kerndaten:", e);
    }
  }

  function getGlobalProgressData(user) {
    var allChapters = window.surveyChapters || [];
    var totalQuestions = 0;
    var answered = 0;
    var uAnswers = answers[user] || {};

    allChapters.forEach(function(ch) {
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
    return { answered: answered, total: totalQuestions, pct: pct };
  }

  function updateHubUI() {
    var prog = getGlobalProgressData(currentUser);
    var badge = document.getElementById('hub-survey-pct-badge');
    if (badge) badge.innerText = prog.pct + " %";

    var aiActive = (localStorage.getItem('kompass_ai_active') === 'true');
    var aiBadge = document.getElementById('hub-ai-badge');
    var aiTile = document.getElementById('hub-tile-ai');
    
    if (aiBadge) {
      if (aiActive) aiBadge.classList.remove('hidden');
      else aiBadge.classList.add('hidden');
    }
    if (aiTile) {
      if (aiActive) aiTile.classList.remove('hidden');
      else aiTile.classList.add('hidden');
    }

    var tabuCountEl = document.getElementById('header-tabu-count');
    if (tabuCountEl) {
      var tc = 0;
      var uAnswers = answers[currentUser] || {};
      (window.surveyChapters || []).forEach(function(ch) {
        (ch.items || []).forEach(function(it) {
          if (it.type !== 'choice') {
            if (uAnswers['it_' + it.id + '_r1'] === 1) tc++;
            if (uAnswers['it_' + it.id + '_r2'] === 1) tc++;
          }
        });
      });
      tabuCountEl.innerText = tc;
    }

    var dispA = document.getElementById('user-display-A');
    var dispB = document.getElementById('user-display-B');
    if (dispA) dispA.innerText = names.A || 'Partner 1';
    if (dispB) dispB.innerText = names.B || 'Partner 2';
  }

  function setCurrentUser(user) {
    currentUser = user;
    window.currentUser = user;

    var btnA = document.getElementById('btn-user-A');
    var btnB = document.getElementById('btn-user-B');
    
    if (user === 'A') {
      if (btnA) btnA.className = "px-2.5 py-1 rounded-lg font-bold bg-brand-950 text-brand-300 border border-brand-800 transition flex items-center gap-1 touch-btn";
      if (btnB) btnB.className = "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white transition flex items-center gap-1 touch-btn";
    } else {
      if (btnB) btnB.className = "px-2.5 py-1 rounded-lg font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 transition flex items-center gap-1 touch-btn";
      if (btnA) btnA.className = "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white transition flex items-center gap-1 touch-btn";
    }

    var curView = (window.location.hash || '').replace('#view=', '') || 'hub';
    if (curView === 'survey') renderSurveyChapter();
    else if (curView === 'single') renderSingleProfile();
    else if (curView === 'safety') renderSafetyConfig();
    
    updateHubUI();
  }

  function switchMainView(viewId) {
    ['hub', 'survey', 'safety', 'single'].forEach(function(v) {
      var el = document.getElementById('view-' + v);
      var btn = document.getElementById('nav-btn-' + v);
      if (el) {
        if (v === viewId) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
      if (btn) {
        if (v === viewId) {
          btn.className = "px-3 py-1.5 rounded-xl bg-brand-700 text-white shadow-xs transition flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 touch-btn cursor-default";
        } else {
          var colorClass = (v === 'safety') ? 'text-teal-400 hover:text-teal-200' : 'text-slate-400 hover:text-white';
          btn.className = "px-3 py-1.5 rounded-xl " + colorClass + " transition flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 touch-btn";
        }
      }
    });

    window.location.hash = '#view=' + viewId;

    if (viewId === 'survey') renderSurveyChapter();
    else if (viewId === 'single') renderSingleProfile();
    else if (viewId === 'safety') renderSafetyConfig();
    else updateHubUI();

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }

  function renderSurveyChapter() {
    var chapters = window.surveyChapters || [];
    if (chapters.length === 0) return;

    var chapter = chapters[currentChapterIndex] || chapters[0];
    if (!chapter) return;

    var uAnswers = answers[currentUser] || {};
    var badge = document.getElementById('chapter-badge');
    var title = document.getElementById('chapter-title');
    var desc = document.getElementById('chapter-desc');
    var container = document.getElementById('survey-items-container');
    var btnPrev = document.getElementById('btn-prev-chapter');
    var btnNext = document.getElementById('btn-next-chapter-bottom');

    if (badge) badge.innerText = "Kapitel " + chapter.id + " / " + (chapters.length - 1) + " ▾";
    if (title) title.innerText = chapter.title;
    if (desc) desc.innerText = chapter.desc;

    if (btnPrev) btnPrev.style.visibility = (currentChapterIndex === 0) ? 'hidden' : 'visible';
    if (btnNext) {
      btnNext.innerText = (currentChapterIndex === chapters.length - 1) ? "Zum Profil →" : "Nächstes Kapitel →";
    }

    var prog = getGlobalProgressData(currentUser);
    var pText = document.getElementById('progress-text');
    var pFill = document.getElementById('progress-bar-fill');
    if (pText) pText.innerText = prog.pct + " %";
    if (pFill) pFill.style.width = prog.pct + "%";

    var filteredItems = (chapter.items || []).filter(function(it) {
      if (activeSurveyFilter === 'all') return true;
      if (it.type === 'choice') {
        var aC = uAnswers['it_' + it.id + '_choice'];
        if (activeSurveyFilter === 'unanswered') return !aC;
        return false;
      }
      var r1 = uAnswers['it_' + it.id + '_r1'];
      var r2 = uAnswers['it_' + it.id + '_r2'];
      if (activeSurveyFilter === 'unanswered') return (typeof r1 !== 'number' || typeof r2 !== 'number');
      if (activeSurveyFilter === 'high') return (r1 >= 4 || r2 >= 4);
      if (activeSurveyFilter === 'tabu') return (r1 === 1 || r2 === 1);
      if (activeSurveyFilter === 'shame') return (r1 === 3 || r2 === 3);
      return true;
    });

    var countEl = document.getElementById('chapter-items-count');
    if (countEl) countEl.innerText = filteredItems.length + " Praktiken";

    if (!container) return;
    
    if (filteredItems.length === 0) {
      container.innerHTML = '<div class="p-6 text-center text-slate-500 italic theme-panel rounded-2xl border">Keine Fragen für diesen Filter in diesem Kapitel vorhanden.</div>';
      return;
    }

    var html = '';
    filteredItems.forEach(function(it) {
      html += '<div class="theme-card rounded-2xl p-4 sm:p-5 border shadow-sm space-y-4">';
      html += '<div class="flex items-start justify-between gap-2">';
      html += '  <div class="min-w-0 flex-1">';
      html += '    <strong class="text-sm font-extrabold text-white block">' + escapeHtml(it.title) + '</strong>';
      html += '    <p class="text-[11px] text-slate-400 mt-1 leading-snug">' + escapeHtml(it.desc || '') + '</p>';
      html += '  </div>';
      html += '  <button type="button" onclick="openItemResearch(' + it.id + ')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 hover:text-white text-[10.5px] font-bold inline-flex items-center gap-1 touch-btn flex-shrink-0 shadow-sm" title="Schamfreie KI-Aufklärung & Sicherheitsregeln zu dieser Praktik anzeigen">';
      html += '    <span>🔍</span><span>KI-Info</span>';
      html += '  </button>';
      html += '</div>';

      if (it.type === 'choice') {
        var curVal = uAnswers['it_' + it.id + '_choice'];
        html += '<div class="space-y-1.5">';
        html += '<strong class="text-xs text-white block mb-2">' + escapeHtml(it.question || 'Wähle eine Option:') + '</strong>';
        (it.options || []).forEach(function(opt) {
          var isSel = (curVal === opt.val);
          var cls = isSel ? 'bg-brand-950/60 border-brand-500 text-white font-bold' : 'theme-panel border-slate-800 text-slate-300 hover:border-slate-700';
          html += '<button type="button" onclick="saveChoice(' + it.id + ', \'' + opt.val + '\')" class="w-full p-2.5 rounded-xl border text-left transition touch-btn text-xs ' + cls + '">';
          html += escapeHtml(opt.label) + '</button>';
        });
        html += '</div>';
      } else {
        html += renderRatingBlock(it.id, 'r1', it.r1, uAnswers['it_' + it.id + '_r1']);
        html += renderRatingBlock(it.id, 'r2', it.r2, uAnswers['it_' + it.id + '_r2']);
      }
      html += '</div>';
    });

    container.innerHTML = html;
    renderQuickGrid();
  }

  function renderRatingBlock(id, role, text, currentVal) {
    if (!text) return '';
    var colors = [
      'bg-rose-950 border-rose-800 text-rose-300',      // 1 Tabu
      'theme-panel border-slate-700 text-slate-300',    // 2 Eher Nein / Duldung
      'bg-indigo-950 border-indigo-800 text-indigo-300', // 3 Neugierig
      'bg-brand-900 border-brand-700 text-brand-100',    // 4 Reizvoll
      'bg-brand-600 border-brand-500 text-white'         // 5 Favorit
    ];

    var html = '<div class="space-y-1.5">';
    html += '<span class="text-[11px] font-bold ' + (role === 'r1' ? 'text-brand-300' : 'text-indigo-300') + ' block">';
    html += (role === 'r1' ? 'Aktiv: ' : 'Passiv: ') + escapeHtml(text) + '</span>';
    html += '<div class="flex gap-1">';
    
    for (var i = 1; i <= 5; i++) {
      var isSel = (currentVal === i);
      var cls = isSel ? colors[i - 1] + ' font-bold shadow-md' : 'theme-panel border-slate-800 text-slate-400 opacity-60';
      html += '<button type="button" onclick="saveRating(' + id + ', \'' + role + '\', ' + i + ')" class="flex-1 py-2 rounded-lg border text-[10px] sm:text-xs transition touch-btn ' + cls + '">' + i + '</button>';
    }
    html += '</div>';
    html += '<div class="flex justify-between text-[9px] font-mono text-slate-500 px-1 mt-0.5"><span>⛔ Tabu (1)</span><span>Favorit (5) ⭐</span></div>';
    html += '</div>';
    return html;
  }

  window.saveRating = function(id, role, val) {
    if (!answers[currentUser]) answers[currentUser] = {};
    answers[currentUser]['it_' + id + '_' + role] = val;
    saveCoreData();
    renderSurveyChapter();
    updateHubUI();
  };

  window.saveChoice = function(id, val) {
    if (!answers[currentUser]) answers[currentUser] = {};
    answers[currentUser]['it_' + id + '_choice'] = val;
    saveCoreData();
    renderSurveyChapter();
    updateHubUI();
  };

  window.setSurveyFilter = function(f) {
    activeSurveyFilter = f;
    ['all', 'unanswered', 'high', 'tabu', 'shame'].forEach(function(id) {
      var btn = document.getElementById('filter-btn-' + id);
      if (btn) {
        if (id === f) btn.className = "px-2.5 py-1 rounded-xl text-xs font-bold bg-brand-700 text-white touch-btn whitespace-nowrap";
        else btn.className = "px-2.5 py-1 rounded-xl text-xs font-bold theme-panel border text-slate-300 touch-btn whitespace-nowrap";
      }
    });
    renderSurveyChapter();
  };

  window.prevChapter = function() {
    if (currentChapterIndex > 0) {
      currentChapterIndex--;
      renderSurveyChapter();
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e) { window.scrollTo(0,0); }
    }
  };

  window.nextChapter = function() {
    var chapters = window.surveyChapters || [];
    if (currentChapterIndex < chapters.length - 1) {
      currentChapterIndex++;
      renderSurveyChapter();
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e) { window.scrollTo(0,0); }
    } else {
      switchMainView('single');
    }
  };

  window.toggleChapterQuickGrid = function() {
    var grid = document.getElementById('chapter-quick-grid');
    if (grid) grid.classList.toggle('hidden');
  };

  function renderQuickGrid() {
    var container = document.getElementById('quick-grid-buttons');
    var chapters = window.surveyChapters || [];
    if (!container) return;

    container.innerHTML = chapters.map(function(ch, idx) {
      var isCur = (idx === currentChapterIndex);
      var cls = isCur ? 'bg-brand-600 text-white font-bold border-brand-500' : 'theme-panel text-slate-300 border-slate-800 hover:border-slate-600';
      return '<button type="button" onclick="window.jumpToChapter(' + idx + ')" class="p-2 rounded-xl border text-center transition touch-btn truncate ' + cls + '">K. ' + ch.id + '</button>';
    }).join('');
  }

  window.jumpToChapter = function(idx) {
    currentChapterIndex = idx;
    var grid = document.getElementById('chapter-quick-grid');
    if (grid) grid.classList.add('hidden');
    renderSurveyChapter();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e) { window.scrollTo(0,0); }
  };

  function renderSafetyConfig() {
    var c = document.getElementById('safety-configurator-full-container');
    if (!c) return;
    
    var uCfg = safetyConfig[currentUser] || {};
    var modules = [
      {
        id: "emergency_tools", title: "Sicherheits-Werkzeug am Bett", desc: "Zwingend erforderlich bei Fesselung (Bondage/Shibari).",
        options: ["Sicherheits-Cutter / Verbandschere griffbereit", "Stumpfes Messer / Tape-Reißer", "Nicht notwendig für unsere Praxis"]
      },
      {
        id: "safeword", title: "Safeword-System (Ampel)", desc: "Wie kommuniziert ihr Grenzen während intensiver Sessions?",
        options: ["Klassisches Ampelsystem (Rot, Gelb, Grün)", "Eigene Codewörter (z.B. Pflaume, Banane)", "Nonverbales System (Klopfen)"]
      },
      {
        id: "gag_signal", title: "Gag-Signal (Knebel-Schutz)", desc: "Wenn ein Knebel (Gag) Sprechen unmöglich macht.",
        options: ["2x festes Abklopfen am Top", "Schlüsselbund fallen lassen (Drop)", "Knurren/Summen in bestimmtem Rhythmus"]
      },
      {
        id: "vital_checks", title: "Vital-Checks & Timer", desc: "Kontrolle bei intensiven Atem- oder Fesselspielen.",
        options: ["Alle 15 Minuten kurzer Check", "Alle 30 Minuten", "Nur bei Bedarf / Auf Zuruf"]
      },
      {
        id: "aftercare", title: "Aftercare-Fokus", desc: "Was braucht dein Körper direkt nach der Session?",
        options: ["Warme Decken & Kuscheln (Körperkontakt)", "Wasser, Zucker & Ruhe", "Sanfte Streicheleinheiten & Lob"]
      },
      {
        id: "checkin_24h", title: "24-Stunden Check-in", desc: "Das emotionale Auffangen am Folgetag (Sub-Drop).",
        options: ["Festes Ritual am nächsten Morgen", "Kurze Messenger-Nachricht tagsüber", "Wir besprechen alles sofort danach"]
      }
    ];

    var html = '';
    modules.forEach(function(m) {
      var currentVal = uCfg[m.id];
      html += '<div class="theme-card rounded-2xl p-4 sm:p-5 border space-y-3">';
      html += '<div><strong class="text-sm font-extrabold text-white block">' + escapeHtml(m.title) + '</strong>';
      html += '<p class="text-[11px] text-slate-400 mt-1">' + escapeHtml(m.desc) + '</p></div>';
      html += '<div class="space-y-1.5">';
      
      m.options.forEach(function(opt) {
        var isSel = (currentVal === opt);
        var cls = isSel ? 'bg-teal-950/40 border-teal-500 text-white font-bold' : 'theme-panel border-slate-800 text-slate-300 hover:border-slate-700';
        html += '<button type="button" onclick="saveSafetyChoice(\'' + m.id + '\', \'' + escapeHtml(opt) + '\')" class="w-full p-2.5 rounded-xl border text-left transition touch-btn text-xs ' + cls + '">';
        html += escapeHtml(opt) + '</button>';
      });
      html += '</div></div>';
    });

    c.innerHTML = html;
  }

  window.saveSafetyChoice = function(key, val) {
    if (!safetyConfig[currentUser]) safetyConfig[currentUser] = {};
    safetyConfig[currentUser][key] = val;
    saveCoreData();
    renderSafetyConfig();
    showToast("Sicherheits-Konfiguration gespeichert ✓");
  };

  function renderSingleProfile() {
    var cEmpty = document.getElementById('single-empty-state');
    var cContent = document.getElementById('single-content-state');
    var uAnswers = answers[currentUser] || {};
    var nameEl = document.getElementById('single-profile-name');

    if (nameEl) nameEl.innerText = names[currentUser] || (currentUser === 'A' ? 'Partner 1' : 'Partner 2');

    var hasData = Object.keys(uAnswers).length > 0;
    if (!hasData) {
      if (cEmpty) cEmpty.classList.remove('hidden');
      if (cContent) cContent.classList.add('hidden');
      return;
    }

    if (cEmpty) cEmpty.classList.add('hidden');
    if (cContent) cContent.classList.remove('hidden');

    calculateAndRenderPillars(uAnswers);
    renderSingleRadarChart(uAnswers);
    renderHighAndTabuLists(uAnswers);
    
    var interpBox = document.getElementById('single-interpretation-box');
    if (interpBox) {
      var html = '<div class="theme-card rounded-3xl p-5 border border-indigo-500/40 shadow-xl space-y-3 bg-indigo-950/10">';
      html += '<div class="flex items-center justify-between border-b border-indigo-900/60 pb-2">';
      html += '<div><h3 class="text-sm font-extrabold text-white">Tiefenpsychologisches KI-Gutachten</h3>';
      html += '<p class="text-[10px] text-indigo-300">Wissenschaftlich fundiert (50% Realdaten / 50% empirische Forschung)</p></div>';
      html += '<button type="button" onclick="generateAiReport()" id="btn-generate-ai" class="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 font-bold rounded-xl text-xs touch-btn flex items-center gap-1.5 shadow-md">✨ Gutachten generieren</button></div>';
      html += '<div id="ai-report-output" class="text-xs text-slate-300 leading-relaxed italic">Klicke auf "Gutachten generieren", um dein psychologisches Profil auf Basis der ausgefüllten Bogen-Daten über Gemini tiefenpsychologisch auswerten zu lassen.</div></div>';
      
      html += '<div class="theme-card rounded-3xl p-6 border border-brand-500/40 bg-gradient-to-br from-brand-950/30 to-noir-900 space-y-2 mt-4 shadow-xl">';
      html += '<strong class="text-brand-300 font-extrabold text-xs uppercase tracking-wider block">Ein Wort zur Normalität & Schamfreiheit (Canivet et al., 2025; Wismeijer, 2013)</strong>';
      html += '<p class="text-xs text-slate-300 leading-relaxed">Du bist vollkommen normal. Fantasien, Sehnsüchte und Kinks – egal wie wild, dunkel, verspielt oder ungewöhnlich sie dir im ersten Moment vorkommen mögen – sind ein vollkommen gesunder, wissenschaftlich belegter Ausdruck menschlicher Vielfalt. Im sicheren Raum eurer Partnerschaft gibt es kein Richtig oder Falsch. Was zählt, sind einzig euer gegenseitiges Einverständnis (Konsens), euer Vertrauen und das Wissen, dass jede persönliche Grenze zu 100 % respektiert und geschützt wird.</p></div>';

      interpBox.innerHTML = html;
    }
  }

  function calculateAndRenderPillars(uAnswers) {
    var pillars = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };
    var max = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };
    
    (window.surveyChapters || []).forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type === 'choice') return;
        var r1 = uAnswers['it_' + it.id + '_r1'];
        var r2 = uAnswers['it_' + it.id + '_r2'];
        
        var cId = ch.id;
        var sum = 0;
        if (typeof r1 === 'number' && r1 > 0) sum += r1;
        if (typeof r2 === 'number' && r2 > 0) sum += r2;

        if ([21, 22, 23, 29].indexOf(cId) !== -1) { pillars.power += sum; max.power += 10; }
        else if ([13, 14, 16, 17, 31].indexOf(cId) !== -1) { pillars.sensation += sum; max.sensation += 10; }
        else if ([19, 30].indexOf(cId) !== -1) { pillars.nurturing += sum; max.nurturing += 10; }
        else if ([18, 20, 24, 25].indexOf(cId) !== -1) { pillars.thrill += sum; max.thrill += 10; }
        else if ([9, 10, 11].indexOf(cId) !== -1) { pillars.visual += sum; max.visual += 10; }
      });
    });

    ['power', 'sensation', 'nurturing', 'thrill', 'visual'].forEach(function(p) {
      var pct = max[p] > 0 ? Math.round((pillars[p] / max[p]) * 100) : 0;
      var elVal = document.getElementById('bar-val-' + p);
      var elFill = document.getElementById('bar-fill-' + p);
      if (elVal) elVal.innerText = pct + ' %';
      if (elFill) elFill.style.width = pct + '%';
    });
  }

  function renderSingleRadarChart(uAnswers) {
    var canvas = document.getElementById('singleRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (singleRadarChartInstance) {
      try { singleRadarChartInstance.destroy(); } catch(e) {}
    }

    var dimensions = [
      { label: 'Körperzonen', chapters: [1, 12] },
      { label: 'Romantik', chapters: [2, 3] },
      { label: 'Keuschheit', chapters: [7, 8] },
      { label: 'Shibari', chapters: [13, 14] },
      { label: 'Sinnesentzug', chapters: [15] },
      { label: 'Impact', chapters: [16] },
      { label: 'Primal', chapters: [18] },
      { label: 'Caregiver', chapters: [19] },
      { label: 'Trance', chapters: [30] }
    ];

    var dataPoints = dimensions.map(function(dim) {
      var earned = 0;
      var possible = 0;
      dim.chapters.forEach(function(cId) {
        var ch = (window.surveyChapters || []).find(function(c) { return c.id === cId; });
        if (ch && ch.items) {
          ch.items.forEach(function(it) {
            if (it.type !== 'choice') {
              var s1 = uAnswers['it_' + it.id + '_r1'];
              var s2 = uAnswers['it_' + it.id + '_r2'];
              if (typeof s1 === 'number' && s1 > 0) { earned += s1; possible += 5; }
              if (typeof s2 === 'number' && s2 > 0) { earned += s2; possible += 5; }
            }
          });
        }
      });
      return possible > 0 ? Math.round((earned / possible) * 100) : 0;
    });

    var cColor = currentUser === 'A' ? '225, 29, 72' : '147, 51, 234';

    try {
      singleRadarChartInstance = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: dimensions.map(function(d) { return d.label; }),
          datasets: [{
            label: names[currentUser] || 'Profil',
            data: dataPoints,
            backgroundColor: 'rgba(' + cColor + ', 0.3)',
            borderColor: 'rgba(' + cColor + ', 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(' + cColor + ', 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: 'rgba(148, 163, 184, 0.2)' },
              grid: { color: 'rgba(148, 163, 184, 0.2)' },
              pointLabels: { color: '#cbd5e1', font: { size: 10, weight: 'bold' } },
              ticks: { display: false, max: 100, min: 0 }
            }
          },
          plugins: { legend: { display: false } }
        }
      });
    } catch(e) {
      console.warn("Radar Chart Fehler:", e);
    }
  }

  function renderHighAndTabuLists(uAnswers) {
    var highList = [];
    var tabuList = [];

    (window.surveyChapters || []).forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          var r1 = uAnswers['it_' + it.id + '_r1'];
          var r2 = uAnswers['it_' + it.id + '_r2'];
          
          if (r1 === 5) highList.push({ t: it.title, role: 'Aktiv' });
          if (r2 === 5) highList.push({ t: it.title, role: 'Passiv' });
          
          if (r1 === 1) tabuList.push({ t: it.title, role: 'Aktiv' });
          if (r2 === 1) tabuList.push({ t: it.title, role: 'Passiv' });
        }
      });
    });

    var hC = document.getElementById('single-high-prio-list');
    var tC = document.getElementById('single-tabus-list');

    if (hC) {
      if (highList.length === 0) hC.innerHTML = '<p class="text-slate-500 italic">Noch keine 5er-Bewertungen.</p>';
      else hC.innerHTML = highList.map(function(i) { return '<div class="p-2 rounded-xl bg-slate-900 border border-emerald-900/40"><strong class="text-emerald-300 block">' + escapeHtml(i.role) + ':</strong> ' + escapeHtml(i.t) + '</div>'; }).join('');
    }
    
    if (tC) {
      if (tabuList.length === 0) tC.innerHTML = '<p class="text-slate-500 italic">Noch keine Tabus definiert.</p>';
      else tC.innerHTML = tabuList.map(function(i) { return '<div class="p-2 rounded-xl bg-slate-900 border border-rose-900/40"><strong class="text-rose-300 block">' + escapeHtml(i.role) + ':</strong> ' + escapeHtml(i.t) + '</div>'; }).join('');
    }
  }

  window.generateAiReport = async function() {
    var out = document.getElementById('ai-report-output');
    var btn = document.getElementById('btn-generate-ai');
    if (btn) btn.innerText = "⏳ Analysiere tiefenpsychologisch...";

    var apiKey = localStorage.getItem('kompass_gemini_api_key');
    if (!apiKey || apiKey.length < 10) apiKey = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";

    var activeModel = localStorage.getItem('kompass_discovered_model');
    if (!activeModel || activeModel.indexOf('2.5') !== -1) {
      activeModel = 'gemini-3.8-flash';
    }

    var powerPct = document.getElementById('bar-val-power') ? document.getElementById('bar-val-power').innerText : '0%';
    var sensPct = document.getElementById('bar-val-sensation') ? document.getElementById('bar-val-sensation').innerText : '0%';
    var nurtPct = document.getElementById('bar-val-nurturing') ? document.getElementById('bar-val-nurturing').innerText : '0%';
    var thrillPct = document.getElementById('bar-val-thrill') ? document.getElementById('bar-val-thrill').innerText : '0%';
    
    var promptText = "Du bist ein erfahrener, einfühlsamer und wissenschaftlich fundierter Paartherapeut und Sexualforscher. Erstelle ein prägnantes, traumasensibles und tiefenpsychologisches Gutachten (genau 3 Absätze) für " + (names[currentUser] || 'den Partner') + ". Säulen-Werte: Macht/Hingabe (" + powerPct + "), Sensorik/Schmerz (" + sensPct + "), Fürsorge (" + nurtPct + "), Tabubruch/Kick (" + thrillPct + "). Beziehe dich auf Sagarin (2009) und Wismeijer (2013). Keine moralischen Bewertungen. Formatiere als HTML mit Klassen text-slate-300 text-xs leading-relaxed space-y-2.";

    try {
      var resp = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + activeModel + ':generateContent?key=' + encodeURIComponent(apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });

      if (resp.ok) {
        var data = await resp.json();
        var text = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) || '';
        if (out) out.innerHTML = text.replace(/```html/g, '').replace(/```/g, '');
        showToast("✓ Gutachten erstellt");
      } else {
        var err = await resp.json().catch(function(){ return {}; });
        if (out) out.innerHTML = '<p class="text-rose-400 font-bold">⚠️ Fehler: ' + (err.error?.message || resp.status) + '</p>';
      }
    } catch (e) {
      if (out) out.innerHTML = '<p class="text-rose-400 font-bold">⚠️ Netzwerkfehler beim Abrufen des Gutachtens.</p>';
    }

    if (btn) btn.innerText = "✨ Gutachten aktualisieren";
  };

  function initApp() {
    loadCoreData();
    var hash = (window.location.hash || '').replace('#view=', '');
    switchMainView(hash || 'hub');
    
    // Hashchange-Listener für flüssige Navigation & Browser-History
    window.addEventListener('hashchange', function() {
      var currentHash = (window.location.hash || '').replace('#view=', '');
      if (currentHash) switchMainView(currentHash);
    });
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})(window);
