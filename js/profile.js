/**
 * js/profile.js
 * Modul für die persönliche Profil-Auswertung ("Mein Profil"):
 * - Erotisches Archetypen-Radar mit Chart.js
 * - Psychologische 5-Säulen-Balance (Macht, Sensorik, Fürsorge, Thrill, Visuell)
 * - 🏆 BDSMTest.org-Top-10-Archetypen-Rangliste mit Prozentbalken
 * - Höchste Leidenschaften (Note 5)
 * - 🙈 Scham- & Hemmschwellen-Liste (mit Klicksprung in den Bogen)
 * - Interaktive Tabu-Liste (Note 1) mit Direktsprung ins Fragebogen-Kapitel
 * - Tiefenpsychologisches Gemini-Einzelgutachten mit gezielter Entlastung der markierten Schamthemen
 * - 🌿 Alltagstransfer & Beziehungs-Integration (Wie lebe ich das im Alltag?)
 */

(function(window) {
  'use strict';

  var singleRadarChartInstance = null;
  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";

  var ARCHETYPE_DEFINITIONS = [
    {
      id: 'dominant',
      title: 'Dominant / Führung (Top)',
      desc: 'Bedürfnis nach Regieführung, Verantwortung und autoritärer Struktur im Spiel.',
      chapters: [21, 22, 23, 29],
      role: 'r1',
      color: 'from-rose-600 to-brand-600'
    },
    {
      id: 'submissive',
      title: 'Devot / Hingabe (Bottom)',
      desc: 'Freude am vertrauensvollen Loslassen der Kontrolle, Dienen und Gehorsam.',
      chapters: [21, 22, 23, 29],
      role: 'r2',
      color: 'from-indigo-600 to-purple-600'
    },
    {
      id: 'switch',
      title: 'Switch / Rollenwechsler',
      desc: 'Lust und Fähigkeit, sowohl die aktive Regie (Top) als auch die vertrauensvolle Hingabe (Bottom) situativ intensiv zu genießen.',
      chapters: [21, 22, 23, 29],
      role: 'switch',
      color: 'from-rose-500 via-purple-500 to-indigo-500'
    },
    {
      id: 'rigger',
      title: 'Rigger / Seilkünstler (Shibari)',
      desc: 'Faszination am Fesseln, Konstruieren von Mustern und Arretieren des Partners.',
      chapters: [13, 14, 15],
      role: 'r1',
      color: 'from-amber-600 to-rose-600'
    },
    {
      id: 'rope_bunny',
      title: 'Rope Bunny / Seil-Empfänger',
      desc: 'Sinnliches Aufgehen in Fesselung, Schwerelosigkeit und physischer Begrenzung.',
      chapters: [13, 14, 15],
      role: 'r2',
      color: 'from-pink-600 to-rose-500'
    },
    {
      id: 'sadist',
      title: 'Sadist / Zuchtmeister (Impact Top)',
      desc: 'Gezieltes Setzen intensiver Reize (Spanking, Flogger, Klemmen) zur Katharsis.',
      chapters: [16, 17, 23],
      role: 'r1',
      color: 'from-red-700 to-rose-700'
    },
    {
      id: 'masochist',
      title: 'Masochist / Reizempfänger',
      desc: 'Transformation von Schmerz- und Druckreizen in Endorphine und Trance.',
      chapters: [16, 17, 23],
      role: 'r2',
      color: 'from-purple-700 to-indigo-700'
    },
    {
      id: 'caregiver',
      title: 'Caregiver / Fürsorglicher Top',
      desc: 'Liebevolle Führung, Behutsamkeit, Kuscheln und starker Aftercare-Fokus.',
      chapters: [19, 30],
      role: 'r1',
      color: 'from-teal-600 to-emerald-600'
    },
    {
      id: 'little_pet',
      title: 'Pet / Schutzbefohlener',
      desc: 'Sehnsucht nach bedingungsloser Geborgenheit, Umsorgtwerden und Unschuld.',
      chapters: [19, 30],
      role: 'r2',
      color: 'from-cyan-600 to-teal-500'
    },
    {
      id: 'primal_hunter',
      title: 'Primal Hunter / Urinstinkt Top',
      desc: 'Jagdinstinkt, raues Raufen, Festhalten, Bisse und ungezähmte Körperlichkeit.',
      chapters: [18],
      role: 'r1',
      color: 'from-amber-700 to-orange-600'
    },
    {
      id: 'primal_prey',
      title: 'Primal Prey / Beute',
      desc: 'Erregung durch spielerische Gegenwehr, Gejagt- und Überwältigtwerden.',
      chapters: [18],
      role: 'r2',
      color: 'from-orange-600 to-amber-500'
    },
    {
      id: 'chastity_master',
      title: 'Keuschheits-Hüter',
      desc: 'Lust an Kontrolle über Erregung, Orgasmusverweigerung und Schlüsselgewalt.',
      chapters: [7, 8],
      role: 'r1',
      color: 'from-blue-700 to-indigo-800'
    },
    {
      id: 'chastity_locked',
      title: 'Keuschling / Denial-Empfänger',
      desc: 'Süße Qual des Aufschubs, Schloss am Genital und Erlaubniserwartung.',
      chapters: [7, 8],
      role: 'r2',
      color: 'from-indigo-800 to-purple-800'
    },
    {
      id: 'voyeur_exhibitionist',
      title: 'Visuell / Ästhet & Schau-Lust',
      desc: 'Lingerie, Masken, Spiegel, Zusehen oder sich in Szene setzen.',
      chapters: [9, 10, 11, 24],
      role: 'both',
      color: 'from-fuchsia-600 to-pink-600'
    },
    {
      id: 'sensory_zen',
      title: 'Sinnlicher Hypnotiseur / Trance',
      desc: 'Atemsynchronisation, Vagusnerv-Entlastung, Kälte/Wärme und Berührungskunst.',
      chapters: [1, 2, 30],
      role: 'both',
      color: 'from-emerald-600 to-teal-500'
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

  function getAnswersFingerprint(userAnswers) {
    if (!userAnswers || typeof userAnswers !== 'object') return '';
    var keys = Object.keys(userAnswers).sort();
    var str = '';
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.indexOf('_note') === -1) {
        str += k + '=' + userAnswers[k] + ';';
      }
    }
    return str;
  }

  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  function calculateArchetypeRankings(answers, chapters) {
    var results = [];

    // Vorab-Ermittlung von Top- und Bottom-Werten für die Switch-Formel
    var powerChapters = [21, 22, 23, 29];
    var domEarned = 0, domPossible = 0;
    var subEarned = 0, subPossible = 0;

    powerChapters.forEach(function(chId) {
      var ch = chapters.find(function(c) { return c.id === chId; });
      if (ch && ch.items) {
        ch.items.forEach(function(it) {
          if (it.type !== 'choice') {
            var s1 = answers['it_' + it.id + '_r1'];
            var s2 = answers['it_' + it.id + '_r2'];
            if (typeof s1 === 'number') { domEarned += s1; domPossible += 5; }
            if (typeof s2 === 'number') { subEarned += s2; subPossible += 5; }
          }
        });
      }
    });

    var pDom = domPossible > 0 ? Math.round((domEarned / domPossible) * 100) : 0;
    var pSub = subPossible > 0 ? Math.round((subEarned / subPossible) * 100) : 0;

    ARCHETYPE_DEFINITIONS.forEach(function(arch) {
      var earned = 0;
      var possible = 0;
      var percentage = 0;

      if (arch.role === 'switch') {
        // Switch-Berechnung nach BDSMTest-Standard: Ausgewogenheit beider Pole
        var minScore = Math.min(pDom, pSub);
        var avgScore = (pDom + pSub) / 2;
        var diff = Math.abs(pDom - pSub);
        var balanceFactor = Math.max(0.4, 1 - (diff / 100) * 0.6);
        var rawSwitch = (minScore * 0.75 + avgScore * 0.25) * (diff <= 25 ? 1.12 : balanceFactor);
        percentage = Math.min(100, Math.max(0, Math.round(rawSwitch)));
        possible = domPossible + subPossible;
      } else {
        arch.chapters.forEach(function(chId) {
          var ch = chapters.find(function(c) { return c.id === chId; });
          if (ch && ch.items) {
            ch.items.forEach(function(it) {
              if (it.type !== 'choice') {
                if (arch.role === 'r1' || arch.role === 'both') {
                  var s1 = answers['it_' + it.id + '_r1'];
                  if (typeof s1 === 'number') {
                    earned += s1;
                    possible += 5;
                  }
                }
                if (arch.role === 'r2' || arch.role === 'both') {
                  var s2 = answers['it_' + it.id + '_r2'];
                  if (typeof s2 === 'number') {
                    earned += s2;
                    possible += 5;
                  }
                }
              }
            });
          }
        });
        percentage = possible > 0 ? Math.round((earned / possible) * 100) : 0;
      }

      results.push({
        id: arch.id,
        title: arch.title,
        desc: arch.desc,
        color: arch.color,
        percentage: percentage,
        possible: possible
      });
    });

    results.sort(function(a, b) {
      return b.percentage - a.percentage;
    });

    return results;
  }

  function renderSingleProfile() {
    var curUser = window.currentUser || 'A';
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var answers = (window.answers && window.answers[curUser]) || {};
    var chapters = window.surveyChapters || [];

    var nameEl = document.getElementById('single-profile-name');
    if (nameEl) nameEl.innerText = names[curUser] || (curUser === 'A' ? 'Partner 1' : 'Partner 2');

    var emptyState = document.getElementById('single-empty-state');
    var contentState = document.getElementById('single-content-state');

    var answeredCount = Object.keys(answers).filter(function(k) { return k.indexOf('_note') === -1; }).length;
    if (answeredCount === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (contentState) contentState.classList.add('hidden');
      return;
    } else {
      if (emptyState) emptyState.classList.add('hidden');
      if (contentState) contentState.classList.remove('hidden');
    }

    var pillars = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };
    var maxPillars = { power: 0, sensation: 0, nurturing: 0, thrill: 0, visual: 0 };

    var highPrioItems = [];
    var tabuItems = [];
    var shameItems = [];

    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        var isShame = !!answers['it_' + it.id + '_shame'];
        if (isShame) {
          shameItems.push({ id: it.id, title: it.title, desc: it.desc || '' });
        }

        if (it.type !== 'choice') {
          var r1 = answers['it_' + it.id + '_r1'];
          var r2 = answers['it_' + it.id + '_r2'];

          function addPoints(val) {
            if (typeof val === 'number' && val > 0) {
              if ([21, 22, 23, 29].indexOf(ch.id) !== -1) pillars.power += val;
              else if ([13, 14, 16, 17, 31].indexOf(ch.id) !== -1) pillars.sensation += val;
              else if ([19, 30].indexOf(ch.id) !== -1) pillars.nurturing += val;
              else if ([18, 20, 24, 25].indexOf(ch.id) !== -1) pillars.thrill += val;
              else if ([9, 10, 11].indexOf(ch.id) !== -1) pillars.visual += val;
            }
          }

          function addMax() {
            if ([21, 22, 23, 29].indexOf(ch.id) !== -1) maxPillars.power += 10;
            else if ([13, 14, 16, 17, 31].indexOf(ch.id) !== -1) maxPillars.sensation += 10;
            else if ([19, 30].indexOf(ch.id) !== -1) maxPillars.nurturing += 10;
            else if ([18, 20, 24, 25].indexOf(ch.id) !== -1) maxPillars.thrill += 10;
            else if ([9, 10, 11].indexOf(ch.id) !== -1) maxPillars.visual += 10;
          }

          addPoints(r1);
          addPoints(r2);
          addMax();

          if (r1 === 5) highPrioItems.push({ id: it.id, title: it.title, role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
          if (r2 === 5) highPrioItems.push({ id: it.id, title: it.title, role: 'Passiv: ' + (it.r2 || 'Empfangen') });
          if (r1 === 1) tabuItems.push({ id: it.id, title: it.title, role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
          if (r2 === 1) tabuItems.push({ id: it.id, title: it.title, role: 'Passiv: ' + (it.r2 || 'Empfangen') });
        }
      });
    });

    ['power', 'sensation', 'nurturing', 'thrill', 'visual'].forEach(function(pKey) {
      var pct = maxPillars[pKey] > 0 ? Math.round((pillars[pKey] / maxPillars[pKey]) * 100) : 0;
      var fillEl = document.getElementById('bar-fill-' + pKey);
      var valEl = document.getElementById('bar-val-' + pKey);
      if (fillEl) fillEl.style.width = pct + '%';
      if (valEl) valEl.innerText = pct + ' %';
    });

    renderBdsmTestRankings(answers, chapters);

    var highListEl = document.getElementById('single-high-prio-list');
    if (highListEl) {
      highListEl.innerHTML = highPrioItems.length > 0 ? highPrioItems.map(function(h) {
        return `
          <button type="button" onclick="goToSurveyItem(${h.id})" class="w-full text-left p-2 rounded-xl bg-brand-950/40 hover:bg-brand-950 border border-brand-900/60 hover:border-brand-500 transition group block touch-btn cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-white block font-bold text-[10.5px] group-hover:text-brand-300">${escapeHtml(h.title)}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-brand-900 text-brand-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition">✏️ Ändern ↗</span>
            </div>
            <span class="text-brand-300 text-[9.5px] block mt-0.5">${escapeHtml(h.role)}</span>
          </button>
        `;
      }).join('') : '<p class="text-slate-500 italic text-[10.5px] text-center py-2">Noch keine 5er-Favoriten vergeben.</p>';
    }

    var tabuListEl = document.getElementById('single-tabus-list');
    if (tabuListEl) {
      tabuListEl.innerHTML = tabuItems.length > 0 ? tabuItems.map(function(t) {
        return `
          <button type="button" onclick="goToSurveyItem(${t.id})" class="w-full text-left p-2 rounded-xl bg-rose-950/30 hover:bg-rose-950 border border-rose-900/60 hover:border-rose-600 transition group block touch-btn cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-white block font-bold text-[10.5px] group-hover:text-rose-200">${escapeHtml(t.title)}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition">✏️ Ändern ↗</span>
            </div>
            <span class="text-rose-300 text-[9.5px] block mt-0.5">${escapeHtml(t.role)}</span>
          </button>
        `;
      }).join('') : '<p class="text-slate-500 italic text-[10.5px] text-center py-2">Keine Tabus hinterlegt.</p>';
    }

    renderSingleShameBox(shameItems);
    renderRadarChart(curUser, answers, chapters);
    loadCachedSingleInterpretation(curUser);
  }

  function renderBdsmTestRankings(answers, chapters) {
    var container = document.getElementById('single-bdsmtest-container');
    if (!container) {
      var radarCard = document.getElementById('singleRadarChart')?.closest('.theme-card');
      if (radarCard && radarCard.parentNode) {
        var card = document.createElement('div');
        card.id = 'single-bdsmtest-container';
        card.className = "theme-card rounded-3xl p-5 border space-y-3.5 shadow-md animate-fade-in";
        radarCard.parentNode.insertBefore(card, radarCard.nextSibling);
        container = card;
      }
    }
    if (!container) return;

    var rankings = calculateArchetypeRankings(answers, chapters);
    var top10 = rankings.slice(0, 10);

    container.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">🏆</span>
          <div>
            <strong class="text-xs sm:text-sm text-white font-extrabold block">Top 10 Archetypen-Rangliste (BDSMTest-Format):</strong>
            <p class="text-[10px] text-slate-400">Deine führenden Ausprägungen und Rollenneigungen im direkten Prozentvergleich.</p>
          </div>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 font-bold">Top 10</span>
      </div>

      <div class="space-y-2.5 pt-1">
        ${top10.map(function(item, idx) {
          return `
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-1.5 truncate pr-2">
                  <span class="text-[10px] font-mono font-bold text-slate-500 w-5 text-left">${idx + 1}.</span>
                  <strong class="text-slate-100 text-[11px] truncate">${escapeHtml(item.title)}</strong>
                </div>
                <span class="font-mono text-xs font-black text-rose-400 flex-shrink-0">${item.percentage} %</span>
              </div>
              <div class="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800/80">
                <div class="h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700 shadow-sm" style="width: ${Math.max(4, item.percentage)}%;"></div>
              </div>
              <p class="text-[9.5px] text-slate-400 leading-tight pl-6">${escapeHtml(item.desc)}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderSingleShameBox(shameItems) {
    var container = document.getElementById('single-shame-box-container');
    if (!container) {
      var gridParent = document.getElementById('single-high-prio-list')?.closest('.grid');
      if (gridParent) {
        var newBox = document.createElement('div');
        newBox.id = 'single-shame-box-container';
        newBox.className = "col-span-full theme-card rounded-3xl p-5 border space-y-2 shadow-md";
        gridParent.parentNode.insertBefore(newBox, gridParent.nextSibling);
        container = newBox;
      }
    }
    if (!container) return;

    if (shameItems.length === 0) {
      container.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <strong class="text-xs text-indigo-300 flex items-center gap-1.5 font-bold">
            <span>🙈</span><span>Scham- & Hemmschwellen-Bereiche (0)</span>
          </strong>
        </div>
        <p class="text-[10.5px] text-slate-400 italic">Du hast bisher keine Praktik mit dem Scham-Faktor markiert. Du kannst Fragen im Fragebogen jederzeit mit „🙈 Scham“ kennzeichnen.</p>
      `;
    } else {
      container.innerHTML = `
        <div class="flex items-center justify-between border-b border-indigo-900/60 pb-2">
          <strong class="text-xs text-indigo-300 flex items-center gap-1.5 font-bold">
            <span>🙈</span><span>Scham- & Hemmschwellen-Bereiche (${shameItems.length})</span>
          </strong>
          <span class="text-[9.5px] text-indigo-300 font-mono">Sensible Themen</span>
        </div>
        <p class="text-[10.5px] text-slate-300 leading-snug">
          Bei diesen Praktiken spürst du Neugier oder Reiz, empfindest jedoch Scham oder eine Hemmschwelle. Das Gutachten widmet sich gezielt der schamfreien Normalisierung dieser Themen:
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
          ${shameItems.map(function(s) {
            return `
              <button type="button" onclick="goToSurveyItem(${s.id})" class="p-2.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-950 border border-indigo-800/80 hover:border-indigo-500 text-left transition group block touch-btn cursor-pointer">
                <div class="flex items-center justify-between">
                  <span class="text-white block font-bold text-[10.5px] group-hover:text-indigo-200 truncate pr-1">${escapeHtml(s.title)}</span>
                  <span class="text-[9px] px-1 py-0.5 rounded bg-indigo-900 text-indigo-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition flex-shrink-0">✏️ ↗</span>
                </div>
                <span class="text-indigo-300 text-[9px] block mt-0.5 truncate">${escapeHtml(s.desc || 'Hemmschwelle')}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }
  }

  function renderRadarChart(user, userAnswers, allChapters) {
    var canvas = document.getElementById('singleRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (singleRadarChartInstance) {
      try { singleRadarChartInstance.destroy(); } catch (e) {}
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

    var scores = dimensions.map(function(dim) {
      var earned = 0, possible = 0;
      dim.chapters.forEach(function(cId) {
        var ch = allChapters.find(function(c) { return c.id === cId; });
        if (ch && ch.items) {
          ch.items.forEach(function(it) {
            if (it.type !== 'choice') {
              var s1 = userAnswers['it_' + it.id + '_r1'];
              var s2 = userAnswers['it_' + it.id + '_r2'];
              if (typeof s1 === 'number' && s1 > 0) { earned += s1; possible += 5; }
              if (typeof s2 === 'number' && s2 > 0) { earned += s2; possible += 5; }
            }
          });
        }
      });
      return possible > 0 ? Math.round((earned / possible) * 100) : 0;
    });

    try {
      singleRadarChartInstance = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: dimensions.map(function(d) { return d.label; }),
          datasets: [{
            label: (window.names && window.names[user]) || 'Dein Profil',
            data: scores,
            backgroundColor: 'rgba(225, 29, 72, 0.25)',
            borderColor: 'rgba(225, 29, 72, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(225, 29, 72, 1)'
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
          plugins: {
            legend: { display: false }
          }
        }
      });
    } catch (e) {
      console.warn("Radar Chart creation error:", e);
    }
  }

  function renderSingleReportHtml(report, isOutdated, generatedAt) {
    var bannerHtml = '';
    if (isOutdated) {
      bannerHtml = `
        <div class="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/80 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-lg animate-pulse mb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl flex-shrink-0">⚠️</span>
            <div>
              <strong class="text-xs text-amber-200 block font-bold">Deine Antworten haben sich verändert</strong>
              <span class="text-[10.5px] text-slate-300 block mt-0.5">Du hast seit der letzten Analyse neue Antworten gegeben oder geändert. Dein Gutachten basiert noch auf dem Stand vom ${escapeHtml(generatedAt || 'gespeicherten Zeitpunkt')}.</span>
            </div>
          </div>
          <button type="button" onclick="ProfileEngine.generateInterpretation()" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-xs touch-btn flex-shrink-0 shadow-md">
            ✨ Jetzt aktualisieren
          </button>
        </div>
      `;
    } else if (generatedAt) {
      bannerHtml = `
        <div class="flex items-center justify-between text-[10.5px] text-slate-400 mb-2 px-1">
          <span class="text-teal-300 font-semibold flex items-center gap-1.5">
            <span>✓</span> Gutachten aktuell (${escapeHtml(generatedAt)})
          </span>
          <span class="text-[9.5px] text-slate-500">Datenbasis synchron</span>
        </div>
      `;
    }

    return `
      <div class="theme-card rounded-3xl p-5 border space-y-3.5 shadow-md animate-fade-in text-xs leading-relaxed">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-base">✨</span>
            <h3 class="text-sm font-extrabold text-white">Tiefenpsychologisches Einzelgutachten & Ratgeber</h3>
          </div>
          <button type="button" onclick="ProfileEngine.generateInterpretation()" class="px-3 py-1 bg-purple-900 hover:bg-purple-800 text-purple-200 font-extrabold rounded-xl text-xs touch-btn shadow-sm">
            Neu berechnen ↺
          </button>
        </div>

        ${bannerHtml}

        <div class="space-y-3 text-[11.5px] text-slate-300 leading-relaxed">
          <div class="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-900/60 space-y-1">
            <strong class="text-indigo-200 block text-xs font-bold">1. Erotischer Kern & Leit-Archetyp:</strong>
            <p>${escapeHtml(report.archetype || '')}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-900/60 space-y-1">
            <strong class="text-purple-200 block text-xs font-bold">2. Psychologische Motivationskräfte:</strong>
            <p>${escapeHtml(report.motivation || '')}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-900/60 space-y-1">
            <strong class="text-teal-200 block text-xs font-bold">3. Scham-Entlastung & Normalisierung:</strong>
            <p>${escapeHtml(report.normalization || '')}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-900/60 space-y-1">
            <strong class="text-amber-200 block text-xs font-bold">4. Alltagstransfer & Beziehungs-Praxis:</strong>
            <p>${escapeHtml(report.everyday_transfer || report.integration || '')}</p>
          </div>
        </div>
      </div>
    `;
  }

  function loadCachedSingleInterpretation(user) {
    var container = document.getElementById('single-interpretation-box');
    if (!container) return;

    try {
      var raw = localStorage.getItem('kompass_cached_single_report_' + user);
      if (raw) {
        var parsed = JSON.parse(raw);
        var reportData = parsed.report || parsed;
        if (reportData && reportData.archetype) {
          var userAnswers = (window.answers && window.answers[user]) || {};
          var curHash = hashString(getAnswersFingerprint(userAnswers));
          var isOutdated = parsed.hash && parsed.hash !== curHash;

          container.innerHTML = renderSingleReportHtml(reportData, isOutdated, parsed.generatedAt);
          return;
        }
      }
    } catch (e) {}

    container.innerHTML = `
      <div class="theme-card rounded-3xl p-5 border text-center space-y-3 shadow-md">
        <span class="text-2xl block">🔮</span>
        <div>
          <strong class="text-xs text-white block font-bold">Tiefenpsychologisches Einzelgutachten & Alltagstransfer:</strong>
          <p class="text-[10.5px] text-slate-400 mt-0.5">Analysiere deine Vorlieben, Schamthemen und erhalte fundierte Ratschläge für den Beziehungsalltag.</p>
        </div>
        <button type="button" onclick="ProfileEngine.generateInterpretation()" class="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-brand-600 hover:from-purple-600 hover:to-brand-500 text-white font-extrabold rounded-xl text-xs touch-btn shadow-lg">
          ✨ Jetzt KI-Einzelgutachten berechnen
        </button>
      </div>
    `;
  }

  function generateClientSideSingleReport(userName, pPower, pSens, pNurt, pThrill, pVis, shameTitles, topArchetype) {
    var shameText = shameTitles.length > 0
      ? `Deine markierten Hemmschwellen (${shameTitles.slice(0, 3).join(', ')}) spiegeln keine Abweichung wider, sondern belegen den gesunden Wunsch nach geschützten Vertrauensgrenzen. Scham ist in der Sexualpsychologie oft der biologische Wächter vor intimen Wachstumszonen: Wo Scham im sicheren Raum behutsam abgelegt wird, entsteht maximale erotische Tiefe.`
      : `Alle deine Wünsche und Vorlieben sind aus sexualpsychologischer Sicht vollkommen gesund, verständlich und wertvoll. Wie die Forschung (u. a. Wismeijer 2013; Canivet 2025) eindeutig belegt, besitzen Menschen mit ausgeprägten erotischen Fantasien oft eine überdurchschnittliche emotionale Differenzierungsfähigkeit.`;

    var everydayAdvice = `Trage deine Neigungen mit Leichtigkeit in den Alltag: Beginne mit subtilem 'Micro-D/s' oder sinnlichen Ankern – etwa einem festen, bedeutungsvollen Blickkontakt beim Abschied, einer sanften Berührung im Nacken oder diskreten Gesten, die nur ihr beide versteht. Wichtig ist die klare Entkopplung: Echte Alltagsverantwortung und Terminstress bleiben partnerschaftlich-demokratisch, während das erotische Spiel ein bewusster, einvernehmlicher Freiraum bleibt.`;

    return {
      archetype: `${userName} besitzt ein facettenreiches erotisches Profil mit starkem Fokus auf '${topArchetype || 'Hingabe und sensorische Intensität'}'. Im Zentrum steht das Bedürfnis nach emotionaler Wahrhaftigkeit, klarer Präsenz und geschützten Freiräumen.`,
      motivation: `Deine stärksten Motivationskräfte speisen sich aus der Balance zwischen somatischer Reizwahrnehmung (${pSens}%) und Machtdynamik (${pPower}%). Für dich bedeutet Erotik, Alltagskontrollen bewusst fallenlassen zu können oder Verantwortung mit Feingefühl zu übernehmen. Die Fürsorge-Säule (${pNurt}%) belegt zudem, dass körperliche Grenzerfahrungen für dich immer in Geborgenheit und verlässliche Nähe eingebettet sein müssen.`,
      normalization: shameText,
      everyday_transfer: everydayAdvice
    };
  }

  async function generateSingleInterpretation() {
    var curUser = window.currentUser || 'A';
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var userName = names[curUser] || (curUser === 'A' ? 'Partner 1' : 'Partner 2');
    var userAnswers = (window.answers && window.answers[curUser]) || {};
    var chapters = window.surveyChapters || [];

    var shameTitles = [];
    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (userAnswers['it_' + it.id + '_shame']) {
          shameTitles.push(it.title);
        }
      });
    });

    var container = document.getElementById('single-interpretation-box');
    if (container) {
      container.innerHTML = `
        <div class="theme-card rounded-3xl p-8 border text-center space-y-3 shadow-md animate-pulse">
          <div class="w-10 h-10 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin mx-auto"></div>
          <strong class="text-xs text-purple-200 block font-bold">Analysiere dein psychologisches Profil & erstelle Alltagstransfer...</strong>
          <p class="text-[10.5px] text-slate-400">Gemini wertet deine Antworten, Schamthemen und BDSMTest-Archetypen aus.</p>
        </div>
      `;
    }

    var rankings = calculateArchetypeRankings(userAnswers, chapters);
    var top3Names = rankings.slice(0, 3).map(function(r) { return r.title + " (" + r.percentage + "%)"; }).join(', ');

    var pPower = document.getElementById('bar-val-power') ? document.getElementById('bar-val-power').innerText.replace('%', '').trim() : '50';
    var pSens = document.getElementById('bar-val-sensation') ? document.getElementById('bar-val-sensation').innerText.replace('%', '').trim() : '50';
    var pNurt = document.getElementById('bar-val-nurturing') ? document.getElementById('bar-val-nurturing').innerText.replace('%', '').trim() : '50';
    var pThrill = document.getElementById('bar-val-thrill') ? document.getElementById('bar-val-thrill').innerText.replace('%', '').trim() : '50';
    var pVis = document.getElementById('bar-val-visual') ? document.getElementById('bar-val-visual').innerText.replace('%', '').trim() : '50';

    var apiKey = localStorage.getItem('kompass_gemini_api_key') || '';

    var prompt = `Du bist eine einfühlsame, moderne und wissenschaftlich fundierte Sexualtherapeutin und Beziehungspsychologin.
Erstelle ein warmherziges, psychologisch tiefes und absolut schamfreies Einzelgutachten sowie konkreten Alltagstransfer für ${userName}.

PROFIL-DATEN:
- Top-Archetypen (BDSMTest-Format): ${top3Names}
- Macht & Hingabe (D/s): ${pPower}%
- Sensorik & Körperreiz (Impact/Seile): ${pSens}%
- Fürsorge & Geborgenheit: ${pNurt}%
- Tabubruch & Thrill: ${pThrill}%
- Visuelle & Fetischreize: ${pVis}%
- Als schambehaftet markierte Praktiken (${shameTitles.length}): ${shameTitles.slice(0, 6).join(', ') || 'Keine spezifischen Scham-Markierungen'}

TONFALL & ANWEISUNGEN:
- Sprich ${userName} direkt mit "Du" an.
- Warmherzig, befreiend, psychologisch fundiert, absolut ohne moralische Wertung.
- In Feld 3 "normalization": Gehe ganz konkret und therapeutisch entlastend auf die markierten Schamthemen ein (Scham als Wächter intimer Vertrauenszonen, Canivet 2025, Wismeijer 2013).
- In Feld 4 "everyday_transfer": Gib praxisnahe, konkrete Ratschläge, wie ${userName} diese Sexualität gesund, stressfrei und bereichernd in den Alltag und die Beziehungs-Kommunikation einweben kann (z. B. Micro-D/s, nonverbale Codes, Entkopplung von Alltagsstress, Nachbereitung).

Antworte AUSSCHLIESSLICH als valides JSON mit genau diesen vier Feldern:
{
  "archetype": "Welcher erotische Leit-Archetyp beschreibt ${userName} am treffendsten? (3 bis 5 Sätze)",
  "motivation": "Was sind die unbewussten psychologischen Motivationskräfte hinter diesen Vorlieben? (3 bis 5 Sätze)",
  "normalization": "Befreiende wissenschaftliche Entlastung von Schamgefühlen und Würdigung der Hemmschwellen (3 bis 5 Sätze)",
  "everyday_transfer": "Konkreter, alltagstauglicher Ratgeber: Wie kann diese Dynamik harmonisch im Beziehungsalltag gelebt werden? (3 bis 5 Sätze)"
}`;

    var candidateModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
    var finalReport = null;

    for (var i = 0; i < candidateModels.length; i++) {
      var targetModel = candidateModels[i];
      try {
        var resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json"
            }
          })
        });

        if (resp.ok) {
          var resData = await resp.json();
          var rawJson = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          var parsedData = null;
          try {
            parsedData = JSON.parse(rawJson);
          } catch (pe) {
            var match = rawJson.match(/\{[\s\S]*\}/);
            parsedData = match ? JSON.parse(match[0]) : null;
          }

          if (parsedData && parsedData.archetype) {
            finalReport = parsedData;
            showToast("✓ Gutachten erfolgreich berechnet (" + targetModel + ")");
            break;
          }
        }
      } catch (e) {}
    }

    if (!finalReport) {
      finalReport = generateClientSideSingleReport(userName, pPower, pSens, pNurt, pThrill, pVis, shameTitles, rankings[0]?.title);
      showToast("✓ Gutachten aus deinen Bogen-Werten berechnet (Offline-Modus)");
    }

    if (finalReport) {
      var nowStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      var curHash = hashString(getAnswersFingerprint(userAnswers));
      var cacheEntry = {
        report: finalReport,
        hash: curHash,
        generatedAt: nowStr
      };

      try {
        localStorage.setItem('kompass_cached_single_report_' + curUser, JSON.stringify(cacheEntry));
      } catch (e) {}

      if (container) {
        container.innerHTML = renderSingleReportHtml(finalReport, false, nowStr);
      }
    }
  }

  window.ProfileEngine = {
    render: renderSingleProfile,
    generateInterpretation: generateSingleInterpretation,
    getRankings: calculateArchetypeRankings
  };

  window.renderSingleProfile = renderSingleProfile;
  window.generateSingleInterpretation = generateSingleInterpretation;

})(window);
