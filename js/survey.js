/**
 * js/survey.js
 * Modul für den dynamischen Fragebogen des Kink- & Beziehungs-Kompasses.
 * 
 * Beinhaltet:
 * - Kapitel-Navigation (Kapitel 0 bis 35) & Direkt-Sprung-Gitter
 * - Filter-Engine (Scope: Kapitel / Global; Filter: Alle, Unbeantwortet, Favoriten, Tabus, Hemmschwelle)
 * - Bewertungsblöcke (Stufen 0 bis 5 inkl. "0: Betrifft mich nicht / Entfällt")
 * - Freitext-Notizfelder für persönliche Bemerkungen und Konditionen
 * - Direkte Anbindung an die Live-KI-Recherche
 */

(function(window) {
  'use strict';

  var currentChapterIndex = 0;
  var activeSurveyFilter = 'all';
  var activeSurveyScope = 'chapter'; // 'chapter' oder 'global'

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

  function getGlobalProgressData(user) {
    var allChapters = window.surveyChapters || [];
    var totalQuestions = 0;
    var answered = 0;
    var uAnswers = (window.answers && window.answers[user]) || {};

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

  function setSurveyScope(scope) {
    activeSurveyScope = scope;
    var btnCh = document.getElementById('scope-btn-chapter');
    var btnGl = document.getElementById('scope-btn-global');

    if (scope === 'global') {
      if (btnGl) btnGl.className = "px-2.5 py-1 rounded-lg font-bold bg-brand-950 text-brand-300 border border-brand-800 touch-btn";
      if (btnCh) btnCh.className = "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white touch-btn";
      showToast("🌍 Global-Modus aktiv: Filter durchsucht alle 36 Kapitel");
    } else {
      if (btnCh) btnCh.className = "px-2.5 py-1 rounded-lg font-bold bg-brand-950 text-brand-300 border border-brand-800 touch-btn";
      if (btnGl) btnGl.className = "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white touch-btn";
    }
    renderSurveyChapter();
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

  function renderSurveyChapter() {
    var chapters = window.surveyChapters || [];
    if (chapters.length === 0) return;

    var chapter = chapters[currentChapterIndex] || chapters[0];
    if (!chapter) return;

    var currentUser = window.currentUser || 'A';
    var uAnswers = (window.answers && window.answers[currentUser]) || {};
    var badge = document.getElementById('chapter-badge');
    var title = document.getElementById('chapter-title');
    var desc = document.getElementById('chapter-desc');
    var container = document.getElementById('survey-items-container');
    var btnPrev = document.getElementById('btn-prev-chapter');
    var btnNext = document.getElementById('btn-next-chapter-bottom');

    var isGlobal = (activeSurveyScope === 'global');

    if (badge) {
      badge.innerText = isGlobal 
        ? "🌍 Alle Kapitel ▾" 
        : "Kapitel " + chapter.id + " / " + (chapters.length - 1) + " ▾";
    }
    if (title) {
      title.innerText = isGlobal 
        ? "Globale Übersicht (Alle 36 Kapitel)" 
        : chapter.title;
    }
    if (desc) {
      desc.innerText = isGlobal 
        ? "Hier siehst du alle Fragen aus dem gesamten Fragebogen, die deinem aktuellen Filter entsprechen. Du kannst Antworten direkt hier vergeben oder ändern." 
        : chapter.desc;
    }

    if (btnPrev) btnPrev.style.visibility = (isGlobal || currentChapterIndex === 0) ? 'hidden' : 'visible';
    if (btnNext) {
      if (isGlobal) {
        btnNext.innerText = "Zum Profil →";
      } else {
        btnNext.innerText = (currentChapterIndex === chapters.length - 1) ? "Zum Profil →" : "Nächstes Kapitel →";
      }
    }

    var prog = getGlobalProgressData(currentUser);
    var pText = document.getElementById('progress-text');
    var pFill = document.getElementById('progress-bar-fill');
    if (pText) pText.innerText = prog.pct + " %";
    if (pFill) pFill.style.width = prog.pct + "%";

    var sourceItemsWithChapter = [];
    if (isGlobal) {
      chapters.forEach(function(ch) {
        (ch.items || []).forEach(function(it) {
          sourceItemsWithChapter.push({ item: it, chapter: ch });
        });
      });
    } else {
      (chapter.items || []).forEach(function(it) {
        sourceItemsWithChapter.push({ item: it, chapter: chapter });
      });
    }

    var filteredList = sourceItemsWithChapter.filter(function(entry) {
      var it = entry.item;
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
    if (countEl) countEl.innerText = filteredList.length + " Praktiken";

    if (!container) return;
    
    if (filteredList.length === 0) {
      var emptyMsg = isGlobal
        ? "Perfekt! Keine offenen Fragen für diesen Filter im gesamten Fragebogen gefunden."
        : "Keine Fragen für diesen Filter in diesem Kapitel vorhanden.";
      container.innerHTML = '<div class="p-6 text-center text-slate-400 italic theme-panel rounded-2xl border">' + escapeHtml(emptyMsg) + '</div>';
      renderQuickGrid();
      return;
    }

    var html = '';
    filteredList.forEach(function(entry) {
      var it = entry.item;
      var ch = entry.chapter;

      html += '<div class="theme-card rounded-2xl p-4 sm:p-5 border shadow-sm space-y-4">';
      html += '<div class="flex items-start justify-between gap-2">';
      html += '  <div class="min-w-0 flex-1">';
      if (isGlobal) {
        html += '    <span class="inline-block px-2 py-0.5 mb-1 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px] font-bold">Kapitel ' + ch.id + ': ' + escapeHtml(ch.title) + '</span>';
      }
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

      var currentNote = uAnswers['it_' + it.id + '_note'] || '';
      html += '<div class="pt-2 border-t border-slate-800/60">';
      html += '  <div class="flex items-center gap-1.5">';
      html += '    <input type="text" value="' + escapeHtml(currentNote) + '" onchange="saveNote(' + it.id + ', this.value)" placeholder="💬 Eigene Notiz / Kondition (z. B. nur sanft, erst später)..." class="w-full text-[11px] px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:bg-slate-900 focus:outline-none transition">';
      html += '  </div>';
      html += '</div>';

      html += '</div>';
    });

    container.innerHTML = html;
    renderQuickGrid();
  }

  function renderRatingBlock(id, role, text, currentVal) {
    if (!text) return '';
    var colors = [
      'bg-slate-800 border-slate-600 text-slate-200',      // 0 Betrifft mich nicht / Entfällt
      'bg-rose-950 border-rose-800 text-rose-300',        // 1 Tabu
      'theme-panel border-slate-700 text-slate-300',      // 2 Eher Nein / Duldung
      'bg-indigo-950 border-indigo-800 text-indigo-300',   // 3 Neugierig
      'bg-brand-900 border-brand-700 text-brand-100',      // 4 Reizvoll
      'bg-brand-600 border-brand-500 text-white'           // 5 Favorit
    ];

    var html = '<div class="space-y-1.5">';
    html += '<span class="text-[11px] font-bold ' + (role === 'r1' ? 'text-brand-300' : 'text-indigo-300') + ' block">';
    html += (role === 'r1' ? 'Aktiv: ' : 'Passiv: ') + escapeHtml(text) + '</span>';
    html += '<div class="flex gap-1">';
    
    for (var i = 0; i <= 5; i++) {
      var isSel = (currentVal === i);
      var cls = isSel ? colors[i] + ' font-bold shadow-md' : 'theme-panel border-slate-800 text-slate-400 opacity-60 hover:opacity-100';
      var tooltip = (i === 0) ? '0: Betrifft mich nicht / Entfällt' : (i === 1 ? '1: Tabu' : (i === 5 ? '5: Favorit' : 'Stufe ' + i));
      html += '<button type="button" title="' + tooltip + '" onclick="saveRating(' + id + ', \'' + role + '\', ' + i + ')" class="flex-1 py-2 rounded-lg border text-[10px] sm:text-xs transition touch-btn ' + cls + '">' + i + '</button>';
    }
    html += '</div>';
    html += '<div class="flex justify-between text-[9px] font-mono text-slate-500 px-1 mt-0.5"><span>⚪ 0: Betrifft nicht</span><span>⛔ 1: Tabu</span><span>⭐ 5: Favorit</span></div>';
    html += '</div>';
    return html;
  }

  function saveRating(id, role, val) {
    var currentUser = window.currentUser || 'A';
    if (!window.answers) window.answers = { A: {}, B: {} };
    if (!window.answers[currentUser]) window.answers[currentUser] = {};
    window.answers[currentUser]['it_' + id + '_' + role] = val;

    if (typeof window.saveCoreData === 'function') window.saveCoreData();
    renderSurveyChapter();
    if (typeof window.updateHubUI === 'function') window.updateHubUI();
  }

  function saveChoice(id, val) {
    var currentUser = window.currentUser || 'A';
    if (!window.answers) window.answers = { A: {}, B: {} };
    if (!window.answers[currentUser]) window.answers[currentUser] = {};
    window.answers[currentUser]['it_' + id + '_choice'] = val;

    if (typeof window.saveCoreData === 'function') window.saveCoreData();
    renderSurveyChapter();
    if (typeof window.updateHubUI === 'function') window.updateHubUI();
  }

  function saveNote(id, val) {
    var currentUser = window.currentUser || 'A';
    if (!window.answers) window.answers = { A: {}, B: {} };
    if (!window.answers[currentUser]) window.answers[currentUser] = {};
    var cleanVal = (val || '').trim();
    if (cleanVal) {
      window.answers[currentUser]['it_' + id + '_note'] = cleanVal;
    } else {
      delete window.answers[currentUser]['it_' + id + '_note'];
    }

    if (typeof window.saveCoreData === 'function') window.saveCoreData();
    showToast("Notiz gespeichert ✓");
  }

  function setSurveyFilter(f) {
    activeSurveyFilter = f;
    ['all', 'unanswered', 'high', 'tabu', 'shame'].forEach(function(id) {
      var btn = document.getElementById('filter-btn-' + id);
      if (btn) {
        if (id === f) btn.className = "px-2.5 py-1 rounded-xl text-xs font-bold bg-brand-700 text-white touch-btn whitespace-nowrap";
        else btn.className = "px-2.5 py-1 rounded-xl text-xs font-bold theme-panel border text-slate-300 touch-btn whitespace-nowrap";
      }
    });
    renderSurveyChapter();
  }

  function prevChapter() {
    if (currentChapterIndex > 0) {
      currentChapterIndex--;
      renderSurveyChapter();
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e) { window.scrollTo(0,0); }
    }
  }

  function nextChapter() {
    var chapters = window.surveyChapters || [];
    if (currentChapterIndex < chapters.length - 1) {
      currentChapterIndex++;
      renderSurveyChapter();
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e) { window.scrollTo(0,0); }
    } else {
      if (typeof window.switchMainView === 'function') {
        window.switchMainView('single');
      }
    }
  }

  function toggleChapterQuickGrid() {
    var grid = document.getElementById('chapter-quick-grid');
    if (grid) grid.classList.toggle('hidden');
  }

  function renderQuickGrid() {
    var container = document.getElementById('quick-grid-buttons');
    var chapters = window.surveyChapters || [];
    var currentUser = window.currentUser || 'A';
    var uAnswers = (window.answers && window.answers[currentUser]) || {};
    if (!container) return;

    container.innerHTML = chapters.map(function(ch, idx) {
      var isCur = (idx === currentChapterIndex && activeSurveyScope === 'chapter');
      var totalInCh = 0;
      var answeredInCh = 0;
      var hasTabuInCh = false;

      (ch.items || []).forEach(function(it) {
        if (it.type === 'choice') {
          totalInCh++;
          if (uAnswers['it_' + it.id + '_choice']) answeredInCh++;
        } else {
          totalInCh += 2;
          var r1 = uAnswers['it_' + it.id + '_r1'];
          var r2 = uAnswers['it_' + it.id + '_r2'];
          if (typeof r1 === 'number') {
            answeredInCh++;
            if (r1 === 1) hasTabuInCh = true;
          }
          if (typeof r2 === 'number') {
            answeredInCh++;
            if (r2 === 1) hasTabuInCh = true;
          }
        }
      });

      var isComplete = (totalInCh > 0 && answeredInCh === totalInCh);
      var pctCh = totalInCh > 0 ? Math.round((answeredInCh / totalInCh) * 100) : 0;

      var cls = isCur 
        ? 'bg-brand-600 text-white font-bold border-brand-500 shadow-md' 
        : 'theme-panel text-slate-300 border-slate-800 hover:border-slate-600';

      return `
        <button type="button" onclick="jumpToChapter(${idx})" class="p-2 rounded-xl border text-left transition touch-btn flex flex-col justify-between ${cls}">
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-[11px]">K. ${ch.id}</span>
            <div class="flex items-center gap-1">
              ${hasTabuInCh ? '<span class="w-1.5 h-1.5 rounded-full bg-rose-500" title="Tabu vorhanden"></span>' : ''}
              ${isComplete ? '<span class="text-emerald-400 font-bold text-[10px]">✓</span>' : ''}
            </div>
          </div>
          <div class="flex items-center justify-between text-[9px] text-slate-400 mt-1">
            <span class="truncate pr-1">${escapeHtml(ch.title)}</span>
            <span class="font-mono flex-shrink-0">${pctCh}%</span>
          </div>
        </button>
      `;
    }).join('');
  }

  function jumpToChapter(idx) {
    activeSurveyScope = 'chapter';
    var btnCh = document.getElementById('scope-btn-chapter');
    var btnGl = document.getElementById('scope-btn-global');
    if (btnCh) btnCh.className = "px-2.5 py-1 rounded-lg font-bold bg-brand-950 text-brand-300 border border-brand-800 touch-btn";
    if (btnGl) btnGl.className = "px-2.5 py-1 rounded-lg font-bold text-slate-400 hover:text-white touch-btn";

    currentChapterIndex = idx;
    var grid = document.getElementById('chapter-quick-grid');
    if (grid) grid.classList.add('hidden');
    renderSurveyChapter();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch(e) { window.scrollTo(0,0); }
  }

  window.SurveyEngine = {
    render: renderSurveyChapter,
    saveRating: saveRating,
    saveChoice: saveChoice,
    saveNote: saveNote,
    setFilter: setSurveyFilter,
    setScope: setSurveyScope,
    prevChapter: prevChapter,
    nextChapter: nextChapter,
    toggleQuickGrid: toggleChapterQuickGrid,
    jumpToChapter: jumpToChapter,
    getProgressData: getGlobalProgressData
  };

  // Globale Registrierungen für direkte HTML Event-Handler
  window.renderSurveyChapter = renderSurveyChapter;
  window.saveRating = saveRating;
  window.saveChoice = saveChoice;
  window.saveNote = saveNote;
  window.setSurveyFilter = setSurveyFilter;
  window.setSurveyScope = setSurveyScope;
  window.prevChapter = prevChapter;
  window.nextChapter = nextChapter;
  window.toggleChapterQuickGrid = toggleChapterQuickGrid;
  window.jumpToChapter = jumpToChapter;
  window.openItemResearch = openItemResearch;
  window.getGlobalProgressData = getGlobalProgressData;

})(window);
