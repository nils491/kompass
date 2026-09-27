/**
 * js/pair_analysis.js
 * Modul für die Beziehungs-Synergie und Paar-Analyse ("Paar-Analyse"):
 * - Standard-Freigabestufe: Stufe 4 (Radikale Transparenz / Alles zeigen)
 * - Doppel-5er Matches (Beiderseitige Volltreffer)
 * - Brückenbau-Chancen unter Berücksichtigung der 4 Freigabestufen (Schamschutz)
 * - 🏆 BDSMTest.org-Top-10-Archetypen-Paarvergleich mit Doppel-Prozentbalken (Partner 1 vs. Partner 2)
 * - 🙈 Sensible Scham-Zonen (Praktiken mit Scham-Markierung als achtsame Vertrauenschancen)
 * - Absolute Tabu-Schranken (Note 1 schlägt alles - kompromissloser Veto-Schutz)
 * - Anklickbare Tabus und Praktiken mit partnergenauem Direktsprung in den Fragebogen (&user=A/B)
 * - Dauerhafter Cache für Paargutachten mit Antworten-Fingerprint und personengenauer Änderungs-Erkennung
 * - 🌿 Alltagstransfer & Beziehungs-Rituale: Konkreter Ratgeber zur Integration in den Alltag
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";

  var ARCHETYPE_DEFINITIONS = [
    {
      id: 'dominant',
      title: 'Dominant / Führung (Top)',
      desc: 'Bedürfnis nach Regieführung, Verantwortung und autoritärer Struktur.',
      chapters: [21, 22, 23, 29],
      role: 'r1',
      colorA: 'from-rose-600 to-brand-600',
      colorB: 'from-amber-500 to-orange-600'
    },
    {
      id: 'submissive',
      title: 'Devot / Hingabe (Bottom)',
      desc: 'Freude am vertrauensvollen Loslassen der Kontrolle, Dienen und Gehorsam.',
      chapters: [21, 22, 23, 29],
      role: 'r2',
      colorA: 'from-indigo-600 to-purple-600',
      colorB: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'rigger',
      title: 'Rigger / Seilkünstler (Shibari)',
      desc: 'Faszination am Fesseln, Konstruieren von Mustern und Arretieren.',
      chapters: [13, 14, 15],
      role: 'r1',
      colorA: 'from-amber-600 to-rose-600',
      colorB: 'from-yellow-500 to-amber-600'
    },
    {
      id: 'rope_bunny',
      title: 'Rope Bunny / Seil-Empfänger',
      desc: 'Sinnliches Aufgehen in Fesselung, Begrenzung und Schwerelosigkeit.',
      chapters: [13, 14, 15],
      role: 'r2',
      colorA: 'from-pink-600 to-rose-500',
      colorB: 'from-fuchsia-500 to-pink-600'
    },
    {
      id: 'sadist',
      title: 'Sadist / Zuchtmeister (Impact Top)',
      desc: 'Gezieltes Setzen intensiver Reize (Spanking, Flogger, Klemmen).',
      chapters: [16, 17, 23],
      role: 'r1',
      colorA: 'from-red-700 to-rose-700',
      colorB: 'from-red-500 to-orange-600'
    },
    {
      id: 'masochist',
      title: 'Masochist / Reizempfänger',
      desc: 'Transformation von Schmerz- und Druckreizen in Endorphine und Trance.',
      chapters: [16, 17, 23],
      role: 'r2',
      colorA: 'from-purple-700 to-indigo-700',
      colorB: 'from-violet-500 to-purple-600'
    },
    {
      id: 'caregiver',
      title: 'Caregiver / Fürsorglicher Top',
      desc: 'Liebevolle Führung, Behutsamkeit, Kuscheln und starker Aftercare-Fokus.',
      chapters: [19, 30],
      role: 'r1',
      colorA: 'from-teal-600 to-emerald-600',
      colorB: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'little_pet',
      title: 'Pet / Schutzbefohlener',
      desc: 'Sehnsucht nach bedingungsloser Geborgenheit, Umsorgtwerden und Unschuld.',
      chapters: [19, 30],
      role: 'r2',
      colorA: 'from-cyan-600 to-teal-500',
      colorB: 'from-sky-400 to-cyan-500'
    },
    {
      id: 'primal_hunter',
      title: 'Primal Hunter / Urinstinkt Top',
      desc: 'Jagdinstinkt, raues Raufen, Festhalten, Bisse und ungezähmte Körperlichkeit.',
      chapters: [18],
      role: 'r1',
      colorA: 'from-amber-700 to-orange-600',
      colorB: 'from-orange-500 to-amber-600'
    },
    {
      id: 'primal_prey',
      title: 'Primal Prey / Beute',
      desc: 'Erregung durch spielerische Gegenwehr, Gejagt- und Überwältigtwerden.',
      chapters: [18],
      role: 'r2',
      colorA: 'from-orange-600 to-amber-500',
      colorB: 'from-amber-400 to-orange-500'
    },
    {
      id: 'chastity_master',
      title: 'Keuschheits-Hüter',
      desc: 'Lust an Kontrolle über Erregung, Orgasmusverweigerung und Schlüsselgewalt.',
      chapters: [7, 8],
      role: 'r1',
      colorA: 'from-blue-700 to-indigo-800',
      colorB: 'from-indigo-500 to-blue-600'
    },
    {
      id: 'chastity_locked',
      title: 'Keuschling / Denial-Empfänger',
      desc: 'Süße Qual des Aufschubs, Schloss am Genital und Erlaubniserwartung.',
      chapters: [7, 8],
      role: 'r2',
      colorA: 'from-indigo-800 to-purple-800',
      colorB: 'from-purple-600 to-indigo-600'
    },
    {
      id: 'voyeur_exhibitionist',
      title: 'Visuell / Ästhet & Schau-Lust',
      desc: 'Lingerie, Masken, Spiegel, Zusehen oder sich in Szene setzen.',
      chapters: [9, 10, 11, 24],
      role: 'both',
      colorA: 'from-fuchsia-600 to-pink-600',
      colorB: 'from-pink-500 to-rose-500'
    },
    {
      id: 'sensory_zen',
      title: 'Sinnlicher Hypnotiseur / Trance',
      desc: 'Atemsynchronisation, Vagusnerv-Entlastung, Kälte/Wärme und Berührungskunst.',
      chapters: [1, 2, 30],
      role: 'both',
      colorA: 'from-emerald-600 to-teal-500',
      colorB: 'from-teal-400 to-emerald-500'
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

  function getEffectiveAnswers() {
    var ans = window.answers;
    if (!ans || (!ans.A && !ans.B)) {
      try {
        var stored = localStorage.getItem('kompass_answers');
        if (stored) ans = JSON.parse(stored);
      } catch (e) {}
    }
    return ans || { A: {}, B: {} };
  }

  function getEffectiveNames() {
    var nm = window.names;
    if (!nm || (!nm.A && !nm.B)) {
      try {
        var stored = localStorage.getItem('kompass_names');
        if (stored) nm = JSON.parse(stored);
      } catch (e) {}
    }
    return nm || { A: 'Partner 1', B: 'Partner 2' };
  }

  function calculatePartnerArchetypeRankings(answersUser, chapters) {
    var results = {};
    ARCHETYPE_DEFINITIONS.forEach(function(arch) {
      var earned = 0;
      var possible = 0;

      arch.chapters.forEach(function(chId) {
        var ch = chapters.find(function(c) { return c.id === chId; });
        if (ch && ch.items) {
          ch.items.forEach(function(it) {
            if (it.type !== 'choice') {
              if (arch.role === 'r1' || arch.role === 'both') {
                var s1 = answersUser['it_' + it.id + '_r1'];
                if (typeof s1 === 'number') {
                  earned += s1;
                  possible += 5;
                }
              }
              if (arch.role === 'r2' || arch.role === 'both') {
                var s2 = answersUser['it_' + it.id + '_r2'];
                if (typeof s2 === 'number') {
                  earned += s2;
                  possible += 5;
                }
              }
            }
          });
        }
      });

      var percentage = possible > 0 ? Math.round((earned / possible) * 100) : 0;
      results[arch.id] = {
        id: arch.id,
        title: arch.title,
        desc: arch.desc,
        percentage: percentage,
        possible: possible
      };
    });
    return results;
  }

  function calculatePairSynergy() {
    var chapters = window.surveyChapters || [];
    var answers = getEffectiveAnswers();
    var names = getEffectiveNames();

    var ansA = answers.A || {};
    var ansB = answers.B || {};

    var lvlA = getSharingLevel('A');
    var lvlB = getSharingLevel('B');

    var doubleFives = [];
    var bridges = [];
    var shameBridges = [];
    var tabus = [];

    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type === 'choice') return;

        var aR1 = ansA['it_' + it.id + '_r1'];
        var aR2 = ansA['it_' + it.id + '_r2'];
        var bR1 = ansB['it_' + it.id + '_r1'];
        var bR2 = ansB['it_' + it.id + '_r2'];

        var aShame = !!ansA['it_' + it.id + '_shame'];
        var bShame = !!ansB['it_' + it.id + '_shame'];

        // 1. ABSOLUTES TABU-VETO: Note 1 schlägt alles!
        var tabuInPractice = false;
        if (aR1 === 1) { tabus.push({ item: it, who: 'A', name: names.A, role: 'Aktiv: ' + (it.r1 || 'Ausführen') }); tabuInPractice = true; }
        if (aR2 === 1) { tabus.push({ item: it, who: 'A', name: names.A, role: 'Passiv: ' + (it.r2 || 'Empfangen') }); tabuInPractice = true; }
        if (bR1 === 1) { tabus.push({ item: it, who: 'B', name: names.B, role: 'Aktiv: ' + (it.r1 || 'Ausführen') }); tabuInPractice = true; }
        if (bR2 === 1) { tabus.push({ item: it, who: 'B', name: names.B, role: 'Passiv: ' + (it.r2 || 'Empfangen') }); tabuInPractice = true; }

        if (tabuInPractice) return;

        // 2. SCHAM-ZONEN & SENSIBLE BRÜCKEN ERKENNEN
        if (aShame || bShame) {
          var hasInterestA = (aR1 >= 2 || aR2 >= 2);
          var hasInterestB = (bR1 >= 2 || bR2 >= 2);
          if (hasInterestA && hasInterestB) {
            shameBridges.push({
              item: it,
              shamePartner: aShame && bShame ? 'Beide' : (aShame ? names.A : names.B),
              hint: aShame && bShame ? 'Beiderseitige Hemmschwelle' : ('Hemmschwelle bei ' + (aShame ? names.A : names.B))
            });
          }
        }

        // Konstellation 1: A führt aus (R1), B empfängt (R2)
        if (typeof aR1 === 'number' && typeof bR2 === 'number') {
          if (aR1 === 5 && bR2 === 5) {
            doubleFives.push({
              item: it,
              actor: names.A,
              receiver: names.B,
              actorRole: it.r1 || 'Ausführen',
              receiverRole: it.r2 || 'Empfangen',
              isShame: aShame || bShame
            });
          } else if (aR1 === 5 && (bR2 === 2 || bR2 === 3)) {
            var allowed = (bR2 === 3 && lvlB >= 2) || (bR2 === 2 && lvlB >= 3) || (lvlB === 4);
            if (allowed) {
              bridges.push({
                item: it,
                actor: names.A,
                receiver: names.B,
                actorScore: aR1,
                receiverScore: bR2,
                actorRole: it.r1 || 'Ausführen',
                receiverRole: it.r2 || 'Empfangen',
                type: (bR2 === 3 ? 'Neugier' : 'Duldung / Buße'),
                isShame: aShame || bShame
              });
            }
          } else if (bR2 === 5 && (aR1 === 2 || aR1 === 3)) {
            var allowedA = (aR1 === 3 && lvlA >= 2) || (aR1 === 2 && lvlA >= 3) || (lvlA === 4);
            if (allowedA) {
              bridges.push({
                item: it,
                actor: names.A,
                receiver: names.B,
                actorScore: aR1,
                receiverScore: bR2,
                actorRole: it.r1 || 'Ausführen',
                receiverRole: it.r2 || 'Empfangen',
                type: (aR1 === 3 ? 'Neugier' : 'Duldung / Buße'),
                isShame: aShame || bShame
              });
            }
          }
        }

        // Konstellation 2: B führt aus (R1), A empfängt (R2)
        if (typeof bR1 === 'number' && typeof aR2 === 'number') {
          if (bR1 === 5 && aR2 === 5) {
            doubleFives.push({
              item: it,
              actor: names.B,
              receiver: names.A,
              actorRole: it.r1 || 'Ausführen',
              receiverRole: it.r2 || 'Empfangen',
              isShame: aShame || bShame
            });
          } else if (bR1 === 5 && (aR2 === 2 || aR2 === 3)) {
            var allowedBtoA = (aR2 === 3 && lvlA >= 2) || (aR2 === 2 && lvlA >= 3) || (lvlA === 4);
            if (allowedBtoA) {
              bridges.push({
                item: it,
                actor: names.B,
                receiver: names.A,
                actorScore: bR1,
                receiverScore: aR2,
                actorRole: it.r1 || 'Ausführen',
                receiverRole: it.r2 || 'Empfangen',
                type: (aR2 === 3 ? 'Neugier' : 'Duldung / Buße'),
                isShame: aShame || bShame
              });
            }
          } else if (aR2 === 5 && (bR1 === 2 || bR1 === 3)) {
            var allowedAtoB = (bR1 === 3 && lvlB >= 2) || (bR1 === 2 && lvlB >= 3) || (lvlB === 4);
            if (allowedAtoB) {
              bridges.push({
                item: it,
                actor: names.B,
                receiver: names.A,
                actorScore: bR1,
                receiverScore: aR2,
                actorRole: it.r1 || 'Ausführen',
                receiverRole: it.r2 || 'Empfangen',
                type: (bR1 === 3 ? 'Neugier' : 'Duldung / Buße'),
                isShame: aShame || bShame
              });
            }
          }
        }
      });
    });

    return {
      doubleFives: doubleFives,
      bridges: bridges,
      shameBridges: shameBridges,
      tabus: tabus
    };
  }

  function renderPairAnalysis() {
    var names = getEffectiveNames();
    var synergy = calculatePairSynergy();
    var chapters = window.surveyChapters || [];
    var answers = getEffectiveAnswers();

    var titleA = document.getElementById('pair-names-title');
    if (titleA) titleA.innerText = (names.A || 'Partner 1') + " & " + (names.B || 'Partner 2');

    // Doppel-5er rendern
    var d5Container = document.getElementById('pair-double-fives-container');
    var d5Count = document.getElementById('count-double-fives');
    if (d5Count) d5Count.innerText = synergy.doubleFives.length;

    if (d5Container) {
      if (synergy.doubleFives.length === 0) {
        d5Container.innerHTML = '<p class="text-slate-500 italic text-[11px] text-center py-4">Noch keine beiderseitigen Doppel-5er vergeben. Füllt beide den Bogen weiter aus.</p>';
      } else {
        d5Container.innerHTML = synergy.doubleFives.map(function(m) {
          var targetUrl = "index.html#view=survey&jumpItem=" + m.item.id;
          return `
            <a href="${targetUrl}" class="block p-3 rounded-2xl bg-brand-950/40 hover:bg-brand-950 border border-brand-800/80 hover:border-brand-500 transition-all touch-btn group">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <strong class="text-xs text-white group-hover:text-brand-300 font-extrabold">${escapeHtml(m.item.title)}</strong>
                  ${m.isShame ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">🙈 Scham-Faktor</span>' : ''}
                </div>
                <span class="text-[9px] px-2 py-0.5 rounded-md bg-brand-900 text-brand-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition">⭐ Doppel-5er ↗</span>
              </div>
              <div class="flex items-center gap-3 text-[10.5px] text-slate-300 mt-1.5 flex-wrap">
                <span>👑 <strong>${escapeHtml(m.actor)}:</strong> ${escapeHtml(m.actorRole)}</span>
                <span class="text-slate-500">·</span>
                <span>🧎 <strong>${escapeHtml(m.receiver)}:</strong> ${escapeHtml(m.receiverRole)}</span>
              </div>
            </a>
          `;
        }).join('');
      }
    }

    // Brücken rendern
    var brContainer = document.getElementById('pair-bridges-container');
    var brCount = document.getElementById('count-bridges');
    if (brCount) brCount.innerText = synergy.bridges.length;

    if (brContainer) {
      if (synergy.bridges.length === 0) {
        brContainer.innerHTML = '<p class="text-slate-500 italic text-[11px] text-center py-4">Keine offenen Brücken unter den aktuellen Freigabestufen sichtbar.</p>';
      } else {
        brContainer.innerHTML = synergy.bridges.map(function(b) {
          var targetUrl = "index.html#view=survey&jumpItem=" + b.item.id;
          var isCuriosity = (b.type === 'Neugier');
          var badgeColor = isCuriosity ? 'bg-indigo-950 text-indigo-300 border-indigo-800' : 'bg-amber-950 text-amber-300 border-amber-800';
          return `
            <a href="${targetUrl}" class="block p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all touch-btn group">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <strong class="text-xs text-white group-hover:text-amber-300 font-extrabold">${escapeHtml(b.item.title)}</strong>
                  ${b.isShame ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">🙈 Scham</span>' : ''}
                </div>
                <span class="text-[9px] px-2 py-0.5 rounded-md border font-bold ${badgeColor}">💡 ${escapeHtml(b.type)} ↗</span>
              </div>
              <div class="flex items-center gap-3 text-[10.5px] text-slate-300 mt-1.5 flex-wrap">
                <span>⭐ Note ${b.actorScore} (${escapeHtml(b.actor)})</span>
                <span class="text-slate-500">⇄</span>
                <span>Note ${b.receiverScore} (${escapeHtml(b.receiver)})</span>
              </div>
            </a>
          `;
        }).join('');
      }
    }

    // BDSMTest.org Top 10 Ranglisten-Paarvergleich rendern
    renderPairBdsmTestRankings(answers, chapters, names);

    // Scham-Zonen rendern
    renderShameBridgesContainer(synergy.shameBridges);

    // Tabus rendern mit partnergenauem Direktsprung (&user=A oder &user=B)
    var tabuContainer = document.getElementById('pair-tabus-container');
    var tabuCount = document.getElementById('count-pair-tabus');
    if (tabuCount) tabuCount.innerText = synergy.tabus.length;

    if (tabuContainer) {
      if (synergy.tabus.length === 0) {
        tabuContainer.innerHTML = '<p class="text-slate-500 italic text-[11px] text-center py-4">Keine Tabus (Note 1) hinterlegt.</p>';
      } else {
        tabuContainer.innerHTML = synergy.tabus.map(function(t) {
          var targetUrl = "index.html#view=survey&user=" + encodeURIComponent(t.who) + "&jumpItem=" + t.item.id;
          return `
            <a href="${targetUrl}" class="block p-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-950 border border-rose-900/60 hover:border-rose-600 transition group touch-btn">
              <div class="flex items-center justify-between">
                <strong class="text-white block font-bold text-[11px] group-hover:text-rose-200">${escapeHtml(t.item.title)}</strong>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition">✏️ Bei ${escapeHtml(t.name)} ändern ↗</span>
              </div>
              <div class="flex items-center justify-between text-[10px] text-rose-300 mt-1">
                <span>${escapeHtml(t.role)}</span>
                <span class="font-mono text-slate-400">Gesetzt von: ${escapeHtml(t.name)}</span>
              </div>
            </a>
          `;
        }).join('');
      }
    }

    loadCachedPairReport();
  }

  function renderPairBdsmTestRankings(answers, chapters, names) {
    var container = document.getElementById('pair-bdsmtest-container');
    if (!container) {
      var gridEl = document.getElementById('pair-double-fives-container')?.closest('.grid');
      if (gridEl && gridEl.parentNode) {
        var card = document.createElement('div');
        card.id = 'pair-bdsmtest-container';
        card.className = "theme-card rounded-3xl p-5 border space-y-4 shadow-md animate-fade-in";
        gridEl.parentNode.insertBefore(card, gridEl.nextSibling);
        container = card;
      }
    }
    if (!container) return;

    var rankA = calculatePartnerArchetypeRankings(answers.A || {}, chapters);
    var rankB = calculatePartnerArchetypeRankings(answers.B || {}, chapters);

    var sortedArchetypes = ARCHETYPE_DEFINITIONS.slice().sort(function(x, y) {
      var maxScoreX = Math.max(rankA[x.id]?.percentage || 0, rankB[x.id]?.percentage || 0);
      var maxScoreY = Math.max(rankA[y.id]?.percentage || 0, rankB[y.id]?.percentage || 0);
      return maxScoreY - maxScoreX;
    });

    var topArchetypes = sortedArchetypes.slice(0, 10);
    var nameA = names.A || 'Partner 1';
    var nameB = names.B || 'Partner 2';

    container.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2.5">
          <span class="text-xl">🏆</span>
          <div>
            <strong class="text-xs sm:text-sm text-white font-extrabold block">BDSMTest.org Archetypen-Paarvergleich (Top 10):</strong>
            <p class="text-[10.5px] text-slate-400">Vergleicht eure Neigungen nebeneinander. Erkennbar sind unmittelbare Synergien und gegenseitige Rollenverteilungen.</p>
          </div>
        </div>
        <div class="flex items-center gap-3 text-[10px] font-bold font-mono self-start sm:self-auto">
          <span class="flex items-center gap-1.5 text-rose-300">
            <span class="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-rose-600 to-brand-500 inline-block"></span>
            ${escapeHtml(nameA)}
          </span>
          <span class="flex items-center gap-1.5 text-amber-300">
            <span class="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 inline-block"></span>
            ${escapeHtml(nameB)}
          </span>
        </div>
      </div>

      <div class="space-y-3.5 pt-1">
        ${topArchetypes.map(function(arch, idx) {
          var pctA = rankA[arch.id]?.percentage || 0;
          var pctB = rankB[arch.id]?.percentage || 0;
          var diff = Math.abs(pctA - pctB);
          var isSynergy = (arch.role === 'both' && pctA >= 40 && pctB >= 40) ||
                          (pctA >= 50 && pctB >= 50);

          return `
            <div class="space-y-1.5 p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-1.5 min-w-0 pr-2">
                  <span class="text-[10px] font-mono font-bold text-slate-500 w-5 text-left flex-shrink-0">${idx + 1}.</span>
                  <strong class="text-slate-100 text-[11px] truncate">${escapeHtml(arch.title)}</strong>
                  ${isSynergy ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800 font-bold flex-shrink-0">✨ Hohe Synergie</span>' : ''}
                </div>
                <div class="flex items-center gap-2 font-mono text-[10.5px] font-black flex-shrink-0">
                  <span class="text-rose-400">${pctA}%</span>
                  <span class="text-slate-600">/</span>
                  <span class="text-amber-400">${pctB}%</span>
                </div>
              </div>

              <!-- BALKEN PARTNER 1 -->
              <div class="space-y-0.5">
                <div class="flex items-center justify-between text-[9px] text-slate-400 px-0.5">
                  <span>${escapeHtml(nameA)}</span>
                  <span class="font-mono text-rose-300">${pctA}%</span>
                </div>
                <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800/60">
                  <div class="h-full bg-gradient-to-r ${arch.colorA} rounded-full transition-all duration-700 shadow-sm" style="width: ${Math.max(4, pctA)}%;"></div>
                </div>
              </div>

              <!-- BALKEN PARTNER 2 -->
              <div class="space-y-0.5">
                <div class="flex items-center justify-between text-[9px] text-slate-400 px-0.5">
                  <span>${escapeHtml(nameB)}</span>
                  <span class="font-mono text-amber-300">${pctB}%</span>
                </div>
                <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800/60">
                  <div class="h-full bg-gradient-to-r ${arch.colorB} rounded-full transition-all duration-700 shadow-sm" style="width: ${Math.max(4, pctB)}%;"></div>
                </div>
              </div>

              <p class="text-[9.5px] text-slate-400 leading-tight pl-6">${escapeHtml(arch.desc)}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderShameBridgesContainer(shameBridges) {
    var c = document.getElementById('pair-shame-bridges-container');
    if (!c) {
      var bridgeEl = document.getElementById('pair-bridges-container');
      var bridgeCard = bridgeEl ? bridgeEl.closest('.theme-card') : null;
      if (bridgeCard && bridgeCard.parentNode) {
        var newCard = document.createElement('div');
        newCard.id = 'pair-shame-card';
        newCard.className = "theme-card rounded-3xl p-5 border space-y-3 shadow-md";
        newCard.innerHTML = `
          <div class="flex items-center justify-between border-b border-indigo-900/60 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base">🙈</span>
              <div>
                <strong class="text-xs sm:text-sm text-indigo-200 font-extrabold block">Sensible Scham-Zonen & Vertrauens-Chancen:</strong>
                <p class="text-[10px] text-slate-400">Praktiken mit beiderseitiger Lust/Neugier, aber Schamgefühl bei mindestens einem Partner.</p>
              </div>
            </div>
            <span id="count-pair-shame" class="text-xs font-mono font-bold text-indigo-300 px-2 py-0.5 rounded-lg bg-indigo-950 border border-indigo-800">0</span>
          </div>
          <div id="pair-shame-bridges-container" class="space-y-1.5 max-h-60 overflow-y-auto pr-1"></div>
        `;
        bridgeCard.parentNode.insertBefore(newCard, bridgeCard.nextSibling);
        c = document.getElementById('pair-shame-bridges-container');
      }
    }
    if (!c) return;

    var countBadge = document.getElementById('count-pair-shame');
    if (countBadge) countBadge.innerText = (shameBridges || []).length;

    if (!shameBridges || shameBridges.length === 0) {
      c.innerHTML = '<p class="text-slate-500 italic text-[11px] text-center py-2">Keine geteilten Scham-Themen markiert.</p>';
    } else {
      c.innerHTML = shameBridges.map(function(sb) {
        var targetUrl = "index.html#view=survey&jumpItem=" + sb.item.id;
        return `
          <a href="${targetUrl}" class="block p-2.5 rounded-xl bg-indigo-950/30 hover:bg-indigo-950 border border-indigo-900/60 hover:border-indigo-600 transition group touch-btn">
            <div class="flex items-center justify-between">
              <strong class="text-white block font-bold text-[11px] group-hover:text-indigo-200">${escapeHtml(sb.item.title)}</strong>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition">✏️ Im Bogen öffnen ↗</span>
            </div>
            <span class="text-indigo-300 text-[10px] block mt-0.5">🙈 ${escapeHtml(sb.hint)}</span>
          </a>
        `;
      }).join('');
    }
  }

  function loadCachedPairReport() {
    var container = document.getElementById('pair-report-container');
    if (!container) return;

    var answers = getEffectiveAnswers();
    var names = getEffectiveNames();

    var hashA = hashString(getAnswersFingerprint(answers.A));
    var hashB = hashString(getAnswersFingerprint(answers.B));

    try {
      var raw = localStorage.getItem('kompass_cached_pair_report');
      if (raw) {
        var parsed = JSON.parse(raw);
        var report = parsed.report || parsed;
        if (report && report.synergy) {
          var isChangedA = parsed.hashA && parsed.hashA !== hashA;
          var isChangedB = parsed.hashB && parsed.hashB !== hashB;
          var isOutdated = isChangedA || isChangedB;

          var changerText = "";
          if (isChangedA && isChangedB) changerText = "Beide Partner haben ihre Bewertungen verändert.";
          else if (isChangedA) changerText = (names.A || 'Partner 1') + " hat persönliche Bewertungen angepasst.";
          else if (isChangedB) changerText = (names.B || 'Partner 2') + " hat persönliche Bewertungen angepasst.";

          container.innerHTML = renderPairReportHtml(report, isOutdated, parsed.generatedAt, changerText);
          return;
        }
      }
    } catch (e) {}

    container.innerHTML = `
      <div class="theme-card rounded-3xl p-6 border text-center space-y-3 shadow-md">
        <span class="text-3xl block">💫</span>
        <div>
          <strong class="text-xs text-white block font-bold">Wissenschaftliches KI-Paargutachten & Alltagstransfer:</strong>
          <p class="text-[10.5px] text-slate-400 mt-0.5">Analysiert eure beiderseitigen Schnittmengen, Dynamiken und gibt konkrete Ratschläge für den Beziehungsalltag.</p>
        </div>
        <button type="button" onclick="PairAnalysisEngine.generateReport()" class="px-5 py-2.5 bg-gradient-to-r from-amber-600 via-brand-600 to-purple-700 hover:opacity-90 text-white font-extrabold rounded-xl text-xs touch-btn shadow-lg">
          ✨ Jetzt KI-Paargutachten berechnen
        </button>
      </div>
    `;
  }

  function renderPairReportHtml(report, isOutdated, generatedAt, changerText) {
    var bannerHtml = '';
    if (isOutdated) {
      bannerHtml = `
        <div class="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/80 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-lg animate-pulse mb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl flex-shrink-0">⚠️</span>
            <div>
              <strong class="text-xs text-amber-200 block font-bold">Eure Antworten haben sich verändert</strong>
              <span class="text-[10.5px] text-slate-300 block mt-0.5">${escapeHtml(changerText)} Das Gutachten basiert noch auf dem Stand vom ${escapeHtml(generatedAt || 'gespeicherten Zeitpunkt')}.</span>
            </div>
          </div>
          <button type="button" onclick="PairAnalysisEngine.generateReport()" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-xs touch-btn flex-shrink-0 shadow-md">
            ✨ Jetzt aktualisieren
          </button>
        </div>
      `;
    } else if (generatedAt) {
      bannerHtml = `
        <div class="flex items-center justify-between text-[10.5px] text-slate-400 mb-2 px-1">
          <span class="text-teal-300 font-semibold flex items-center gap-1.5">
            <span>✓</span> Paargutachten aktuell (${escapeHtml(generatedAt)})
          </span>
          <span class="text-[9.5px] text-slate-500">Schnittmengen synchron</span>
        </div>
      `;
    }

    var everydayTransferHtml = (report.everyday_transfer || report.transfer) ? `
      <div class="p-3.5 rounded-2xl bg-teal-950/20 border border-teal-900/60 space-y-1">
        <strong class="text-teal-200 block text-xs font-bold">4. Alltagstransfer & Beziehungs-Rituale:</strong>
        <p>${escapeHtml(report.everyday_transfer || report.transfer || '')}</p>
      </div>
    ` : '';

    return `
      <div class="theme-card rounded-3xl p-5 border space-y-3.5 shadow-md animate-fade-in text-xs leading-relaxed">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-base">✨</span>
            <h3 class="text-sm font-extrabold text-white">Tiefenpsychologisches Paargutachten & Beziehungs-Integration</h3>
          </div>
          <button type="button" onclick="PairAnalysisEngine.generateReport()" class="px-3 py-1 bg-amber-950 hover:bg-amber-900 border border-amber-700 text-amber-300 font-extrabold rounded-xl text-xs touch-btn shadow-sm">
            Neu berechnen ↺
          </button>
        </div>

        ${bannerHtml}

        <div class="space-y-3 text-[11.5px] text-slate-300 leading-relaxed">
          <div class="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-900/60 space-y-1">
            <strong class="text-amber-200 block text-xs font-bold">1. Eure Beziehungs- & Macht-Synergie:</strong>
            <p>${escapeHtml(report.synergy || '')}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-900/60 space-y-1">
            <strong class="text-indigo-200 block text-xs font-bold">2. Schamfreie Brücken & Vertrauens-Chancen:</strong>
            <p>${escapeHtml(report.bridges || '')}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/60 space-y-1">
            <strong class="text-rose-200 block text-xs font-bold">3. Vertrauens-Kodex & Schutz der Grenzen:</strong>
            <p>${escapeHtml(report.safety || '')}</p>
          </div>
          ${everydayTransferHtml}
        </div>
      </div>
    `;
  }

  function generateClientSidePairReport(names, doubleFivesCount, bridgesCount, tabusCount, shameBridgesCount) {
    var shameText = shameBridgesCount > 0
      ? `Mit ${shameBridgesCount} identifizierten Scham-Zonen habt ihr wertvolle intime Wachstumsfelder erschlossen: Wo Lust auf Scham trifft, wird Vertrauen lebendig. Wenn der führende Partner hier entschleunigt, behutsam vorgeht und Sicherheit schenkt, verwandelt sich Scham in tiefste Hingabe und emotionale Erleichterung.`
      : `Besonders wertvoll sind eure ${bridgesCount} identifizierten Brücken. Sie laden ein zu behutsamen Experimenten im geschützten Raum, ohne dass jemals Leistungsdruck oder Erwartungsstress entsteht.`;

    var transferText = `So lasst ihr eure Synergie harmonisch in den Beziehungsalltag einfließen:
1. 'Micro-D/s' und diskrete Signale: Ein bewusst langer Blickkontakt bei der Verabschiedung, eine sanft führende Hand im Nacken oder ein privates Codewort bei gesellschaftlichen Anlässen halten die erotische Verbindung aufrecht, ohne dass Außenstehende etwas bemerken.
2. Saubere Trennung von Alltag & Spiel: Echte Pflichten, Finanzen und Terminstress werden stets partnerschaftlich-demokratisch auf Augenhöhe verhandelt. Die erotische Führung bleibt ein geschützter, einvernehmlicher Spielraum.
3. Check-ins nach intensiven Momenten: Verabredet am Folgetag eines intensiven Spielabends ein kurzes, liebevolles 'Decken-Gespräch' oder eine Tasse Tee, um das Erlebte zu integrieren und einem Subdrop/Topdrop vorzubeugen.`;

    return {
      synergy: `${names.A} und ${names.B} teilen ein kraftvolles, komplementäres erotisches Spannungsfeld. Mit ${doubleFivesCount} beiderseitigen Volltreffern verfügt ihr über eine solide Basis unmittelbarer Lust, die ohne Zögern gelebt werden kann. Eure Antworten spiegeln ein tiefes Bedürfnis nach Authentizität, Loslassen und gegenseitiger Präsenz wider.`,
      bridges: shameText,
      safety: `Mit ${tabusCount} definierten Tabus beweist ihr eine gesunde, reife Grenzziehung. Wahre erotische Hingabe kann nur dort entstehen, wo das 'Nein' absolut heilig ist. Eure Vereinbarungen bieten das perfekte Sicherheitsnetz, in dem beide Partner die Kontrolle vertrauensvoll abgeben dürfen.`,
      everyday_transfer: transferText
    };
  }

  async function generatePairReport() {
    var names = getEffectiveNames();
    var answers = getEffectiveAnswers();
    var synergy = calculatePairSynergy();
    var chapters = window.surveyChapters || [];

    var rankA = calculatePartnerArchetypeRankings(answers.A || {}, chapters);
    var rankB = calculatePartnerArchetypeRankings(answers.B || {}, chapters);

    var sortedA = Object.values(rankA).sort(function(a, b) { return b.percentage - a.percentage; });
    var sortedB = Object.values(rankB).sort(function(a, b) { return b.percentage - a.percentage; });

    var topArchetypesSummaryA = sortedA.slice(0, 3).map(function(r) { return r.title + " (" + r.percentage + "%)"; }).join(', ');
    var topArchetypesSummaryB = sortedB.slice(0, 3).map(function(r) { return r.title + " (" + r.percentage + "%)"; }).join(', ');

    var container = document.getElementById('pair-report-container');
    if (container) {
      container.innerHTML = `
        <div class="theme-card rounded-3xl p-8 border text-center space-y-3 shadow-md animate-pulse">
          <div class="w-10 h-10 border-3 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
          <strong class="text-xs text-amber-200 block font-bold">Erstelle tiefenpsychologisches Paargutachten & Alltagstransfer...</strong>
          <p class="text-[10.5px] text-slate-400">Gemini analysiert eure Doppel-5er, BDSMTest-Archetypen, Scham-Zonen und erarbeitet konkrete Integrationsstrategien für den Alltag.</p>
        </div>
      `;
    }

    var apiKey = localStorage.getItem('kompass_gemini_api_key') || DEFAULT_PRESET_GEMINI_KEY;

    var prompt = `Du bist eine einfühlsame, moderne und wissenschaftlich fundierte Paar- und Sexualtherapeutin.
Erstelle ein warmherziges, inspirierendes und absolut schamfreies Paargutachten sowie konkreten Alltagstransfer für ${names.A} und ${names.B}.

DATEN ZUR PAAR-SYNERGIE:
- Top-Archetypen von ${names.A}: ${topArchetypesSummaryA}
- Top-Archetypen von ${names.B}: ${topArchetypesSummaryB}
- Beiderseitige Doppel-5er Matches: ${synergy.doubleFives.length}
- Brückenbau-Potenziale (5 zu 3 / 2): ${synergy.bridges.length}
- Sensible Scham-Zonen (Lust mit Hemmschwelle): ${synergy.shameBridges.length}
- Definierte Veto-Tabus (Note 1): ${synergy.tabus.length}

TONFALL & ANWEISUNGEN:
- Sprich das Paar warmherzig, befreiend und partnerschaftlich in der "Ihr"-Form an.
- Absolut schamfrei, entlastend und psychologisch fundiert.
- In Feld 2 "bridges": Gehe explizit auf die ${synergy.shameBridges.length} sensiblen Scham-Themen ein. Erkläre, warum Scham der Hüter verletzlicher Sehnsüchte ist und wie durch behutsame Führung tiefe Intimität entsteht (Canivet 2025, Wismeijer 2013).
- In Feld 4 "everyday_transfer": Gib praxisnahe, konkrete Ratschläge für den Beziehungsalltag: Wie kann das Paar diese Erotik stressfrei und bereichernd in den Alltag einweben? (z. B. Micro-D/s, nonverbale Gesten, klare Trennung von Alltagsverantwortung und Spiel, Nachbereitung/Check-ins).

Antworte AUSSCHLIESSLICH als valides JSON mit genau diesen vier Feldern:
{
  "synergy": "Eure Beziehungs- und Machtdynamik im Lichte eurer BDSMTest-Archetypen (3 bis 5 Sätze)",
  "bridges": "Schamfreie Würdigung der Brücken und sensiblen Scham-Zonen (3 bis 5 Sätze)",
  "safety": "Vertrauenskultur, Grenzen und Schutz des Tabu-Vetoraums (3 bis 4 Sätze)",
  "everyday_transfer": "Konkreter Alltagstransfer: Wie lebt ihr diese Erotik harmonisch, diskret und bereichernd im Alltag? (3 bis 5 Sätze)"
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

          if (parsedData && parsedData.synergy) {
            finalReport = parsedData;
            showToast("✓ Paargutachten erfolgreich berechnet (" + targetModel + ")");
            break;
          }
        }
      } catch (e) {}
    }

    if (!finalReport) {
      finalReport = generateClientSidePairReport(names, synergy.doubleFives.length, synergy.bridges.length, synergy.tabus.length, synergy.shameBridges.length);
      showToast("✓ Paargutachten aus Bogenwerten berechnet (Offline-Modus)");
    }

    if (finalReport) {
      var nowStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      var hashA = hashString(getAnswersFingerprint(answers.A));
      var hashB = hashString(getAnswersFingerprint(answers.B));

      var cacheEntry = {
        report: finalReport,
        hashA: hashA,
        hashB: hashB,
        generatedAt: nowStr
      };

      try {
        localStorage.setItem('kompass_cached_pair_report', JSON.stringify(cacheEntry));
      } catch (e) {}

      if (container) {
        container.innerHTML = renderPairReportHtml(finalReport, false, nowStr, "");
      }
    }
  }

  window.PairAnalysisEngine = {
    render: renderPairAnalysis,
    generateReport: generatePairReport,
    getSynergy: calculatePairSynergy
  };

  window.renderPairAnalysis = renderPairAnalysis;
  window.generatePairReport = generatePairReport;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', renderPairAnalysis);
  } else {
    setTimeout(renderPairAnalysis, 100);
  }

})(window);
