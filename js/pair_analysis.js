/**
 * js/pair_analysis.js
 * Modul für die Beziehungs-Synergie & Paar-Analyse ("analyse.html"):
 * - Grundlegende Rollen-Orientierung (Top / Bottom / Switcher) mit situativem Flexibilitäts-Hinweis
 * - BDSMTest.org-Top-10-Archetypen-Paarvergleich mit vergleichenden Prozentbalken
 * - Doppel-5er-Volltreffer (Sofort auslebbar)
 * - Brückenbau-Chancen (5er trifft auf 3er/4er unter Berücksichtigung der 4 Freigabestufen)
 * - Sensible Scham-Zonen & Vertrauens-Chancen
 * - Gemeinsame Tabu-Charta (Note 1 Vetos)
 * - Wissenschaftlich fundiertes Gemini-Paargutachten mit Beziehungs-Alltagstransfer
 */

(function(window) {
  'use strict';

  var ARCHETYPE_DEFINITIONS = [
    {
      id: 'dominant',
      title: 'Dominant / Führung (Top)',
      desc: 'Bedürfnis nach Regieführung, Verantwortung und autoritärer Struktur im Spiel.',
      chapters: [21, 22, 23, 29],
      role: 'r1',
      colorA: 'from-rose-600 to-brand-600',
      colorB: 'from-rose-500 to-amber-600'
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
      id: 'switch',
      title: 'Switch / Rollenwechsler',
      desc: 'Lust und Fähigkeit, sowohl die aktive Regie (Top) als auch die Hingabe (Bottom) situativ zu genießen.',
      chapters: [21, 22, 23, 29],
      role: 'switch',
      colorA: 'from-rose-500 via-purple-500 to-indigo-600',
      colorB: 'from-amber-500 via-pink-500 to-blue-600'
    },
    {
      id: 'rigger',
      title: 'Rigger / Seilkünstler (Shibari)',
      desc: 'Faszination am Fesseln, Konstruieren von Mustern und Arretieren des Partners.',
      chapters: [13, 14, 15],
      role: 'r1',
      colorA: 'from-amber-600 to-rose-600',
      colorB: 'from-orange-500 to-amber-600'
    },
    {
      id: 'rope_bunny',
      title: 'Rope Bunny / Seil-Empfänger',
      desc: 'Sinnliches Aufgehen in Fesselung, Schwerelosigkeit und physischer Begrenzung.',
      chapters: [13, 14, 15],
      role: 'r2',
      colorA: 'from-pink-600 to-rose-500',
      colorB: 'from-fuchsia-500 to-pink-600'
    },
    {
      id: 'sadist',
      title: 'Sadist / Zuchtmeister (Impact Top)',
      desc: 'Gezieltes Setzen intensiver Reize (Spanking, Flogger, Klemmen) zur Katharsis.',
      chapters: [16, 17, 23],
      role: 'r1',
      colorA: 'from-red-700 to-rose-700',
      colorB: 'from-red-600 to-orange-600'
    },
    {
      id: 'masochist',
      title: 'Masochist / Reizempfänger',
      desc: 'Transformation von Schmerz- und Druckreizen in Endorphine und Trance.',
      chapters: [16, 17, 23],
      role: 'r2',
      colorA: 'from-purple-700 to-indigo-700',
      colorB: 'from-indigo-600 to-violet-700'
    },
    {
      id: 'caregiver',
      title: 'Caregiver / Fürsorglicher Top',
      desc: 'Liebevolle Führung, Behutsamkeit, Kuscheln und starker Aftercare-Fokus.',
      chapters: [19, 30],
      role: 'r1',
      colorA: 'from-teal-600 to-emerald-600',
      colorB: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'little_pet',
      title: 'Pet / Schutzbefohlener',
      desc: 'Sehnsucht nach bedingungsloser Geborgenheit, Umsorgtwerden und Unschuld.',
      chapters: [19, 30],
      role: 'r2',
      colorA: 'from-cyan-600 to-teal-500',
      colorB: 'from-teal-400 to-cyan-500'
    },
    {
      id: 'primal_hunter',
      title: 'Primal Hunter / Urinstinkt Top',
      desc: 'Jagdinstinkt, raues Raufen, Festhalten, Bisse und ungezähmte Körperlichkeit.',
      chapters: [18],
      role: 'r1',
      colorA: 'from-amber-700 to-orange-600',
      colorB: 'from-orange-600 to-amber-700'
    },
    {
      id: 'primal_prey',
      title: 'Primal Prey / Beute',
      desc: 'Erregung durch spielerische Gegenwehr, Gejagt- und Überwältigtwerden.',
      chapters: [18],
      role: 'r2',
      colorA: 'from-orange-600 to-amber-500',
      colorB: 'from-amber-500 to-orange-600'
    },
    {
      id: 'chastity_master',
      title: 'Keuschheits-Hüter',
      desc: 'Lust an Kontrolle über Erregung, Orgasmusverweigerung und Schlüsselgewalt.',
      chapters: [7, 8],
      role: 'r1',
      colorA: 'from-blue-700 to-indigo-800',
      colorB: 'from-sky-600 to-indigo-700'
    },
    {
      id: 'chastity_locked',
      title: 'Keuschling / Denial-Empfänger',
      desc: 'Süße Qual des Aufschubs, Schloss am Genital und Erlaubniserwartung.',
      chapters: [7, 8],
      role: 'r2',
      colorA: 'from-indigo-800 to-purple-800',
      colorB: 'from-blue-800 to-purple-700'
    },
    {
      id: 'voyeur_exhibitionist',
      title: 'Visuell / Ästhet & Schau-Lust',
      desc: 'Lingerie, Masken, Spiegel, Zusehen oder sich in Szene setzen.',
      chapters: [9, 10, 11, 24],
      role: 'both',
      colorA: 'from-fuchsia-600 to-pink-600',
      colorB: 'from-pink-500 to-rose-600'
    },
    {
      id: 'sensory_zen',
      title: 'Sinnlicher Hypnotiseur / Trance',
      desc: 'Atemsynchronisation, Vagusnerv-Entlastung, Kälte/Wärme und Berührungskunst.',
      chapters: [1, 2, 30],
      role: 'both',
      colorA: 'from-emerald-600 to-teal-500',
      colorB: 'from-teal-500 to-emerald-600'
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

  function getAnswersFingerprint(answers) {
    if (!answers || typeof answers !== 'object') return '';
    var keys = Object.keys(answers).sort();
    var str = '';
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.indexOf('_note') === -1) {
        str += k + '=' + answers[k] + ';';
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
    return 4;
  }

  function calculatePartnerArchetypeRankings(answersUser, chapters) {
    var results = {};

    var powerChapters = [21, 22, 23, 29];
    var domEarned = 0, domPossible = 0;
    var subEarned = 0, subPossible = 0;

    powerChapters.forEach(function(chId) {
      var ch = chapters.find(function(c) { return c.id === chId; });
      if (ch && ch.items) {
        ch.items.forEach(function(it) {
          if (it.type !== 'choice') {
            var s1 = answersUser['it_' + it.id + '_r1'];
            var s2 = answersUser['it_' + it.id + '_r2'];
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
        percentage = possible > 0 ? Math.round((earned / possible) * 100) : 0;
      }

      results[arch.id] = {
        id: arch.id,
        title: arch.title,
        desc: arch.desc,
        percentage: percentage,
        possible: possible,
        pDom: pDom,
        pSub: pSub
      };
    });
    return results;
  }

  function determineCoreOrientation(rankings) {
    var pDom = (rankings.dominant && rankings.dominant.percentage) || 0;
    var pSub = (rankings.submissive && rankings.submissive.percentage) || 0;
    var pSwitch = (rankings.switch && rankings.switch.percentage) || 0;

    if (pSwitch >= 55 || (pDom >= 45 && pSub >= 45 && Math.abs(pDom - pSub) <= 25)) {
      return {
        label: "Ausgeprägter Switch (Rollenwechsler)",
        badge: "🔄 Switch",
        desc: "Beide Pole sind lebendig: Lust an Regie & Führung ebenso wie am Loslassen und Dienen.",
        color: "text-purple-300 bg-purple-950/80 border-purple-700",
        scores: "Top: " + pDom + "% · Bottom: " + pSub + "% · Switch: " + pSwitch + "%"
      };
    } else if (pDom > pSub) {
      var isStrong = (pDom - pSub >= 30);
      return {
        label: isStrong ? "Klarer Top (Dominant)" : "Tendenz zum Top (Führend)",
        badge: "👑 Top",
        desc: "Fokus auf Führung, Verantwortung, Struktur und achtsame Regie im erotischen Raum.",
        color: "text-rose-300 bg-rose-950/80 border-rose-700",
        scores: "Top: " + pDom + "% · Bottom: " + pSub + "%"
      };
    } else {
      var isStrongSub = (pSub - pDom >= 30);
      return {
        label: isStrongSub ? "Klarer Bottom (Devot)" : "Tendenz zum Bottom (Hingabe)",
        badge: "🧎 Bottom",
        desc: "Fokus auf vertrauensvolles Loslassen der Kontrolle, Empfangen und Genuss des Dienens.",
        color: "text-indigo-300 bg-indigo-950/80 border-indigo-700",
        scores: "Bottom: " + pSub + "% · Top: " + pDom + "%"
      };
    }
  }

  function renderPairRoleOrientationCard(rankA, rankB, names) {
    var container = document.getElementById('pair-core-orientation-card');
    if (!container) {
      var gridEl = document.getElementById('pair-double-fives-container')?.closest('.grid');
      if (gridEl && gridEl.parentNode) {
        var card = document.createElement('div');
        card.id = 'pair-core-orientation-card';
        card.className = "theme-card rounded-3xl p-5 border border-amber-900/60 space-y-3.5 shadow-lg bg-gradient-to-br from-amber-950/20 via-noir-900 to-purple-950/20";
        gridEl.parentNode.insertBefore(card, gridEl);
        container = card;
      }
    }
    if (!container) return;

    var orientA = determineCoreOrientation(rankA);
    var orientB = determineCoreOrientation(rankB);
    var nameA = names.A || 'Partner 1';
    var nameB = names.B || 'Partner 2';

    var matchNotice = "";
    if (orientA.badge.indexOf("Switch") !== -1 && orientB.badge.indexOf("Switch") !== -1) {
      matchNotice = "✨ <strong>Switch-Match:</strong> Beide Partner besitzen Lust an beiden Rollen – maximale Abwechslung und wechselseitiges Führen sind möglich!";
    } else if (orientA.badge.indexOf("Top") !== -1 && orientB.badge.indexOf("Bottom") !== -1) {
      matchNotice = "👑 <strong>Klassische Komplementarität:</strong> Klare Verteilung zwischen Regie und Hingabe schafft sofortige Stabilität.";
    } else if (orientA.badge.indexOf("Bottom") !== -1 && orientB.badge.indexOf("Top") !== -1) {
      matchNotice = "👑 <strong>Klassische Komplementarität:</strong> Klare Verteilung zwischen Regie und Hingabe schafft sofortige Stabilität.";
    } else {
      matchNotice = "💡 <strong>Vielseitige Synergie:</strong> Feste Neigungen treffen auf flexible Spielräume.";
    }

    container.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚖️</span>
          <div>
            <strong class="text-xs sm:text-sm text-white font-extrabold block">Grundlegende Rollen-Orientierung (Top / Bottom / Switch):</strong>
            <p class="text-[10.5px] text-slate-400">Auf einen Blick: Zu welcher Grundenergie neigt ihr im erotischen Machtspiel?</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <!-- PARTNER 1 -->
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-white">${escapeHtml(nameA)}</span>
            <span class="text-[10px] font-black px-2.5 py-0.5 rounded-lg border ${orientA.color}">${orientA.badge}</span>
          </div>
          <strong class="text-xs text-slate-100 block">${orientA.label}</strong>
          <p class="text-[10.5px] text-slate-400 leading-snug">${orientA.desc}</p>
          <div class="text-[9.5px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">${orientA.scores}</div>
        </div>

        <!-- PARTNER 2 -->
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-white">${escapeHtml(nameB)}</span>
            <span class="text-[10px] font-black px-2.5 py-0.5 rounded-lg border ${orientB.color}">${orientB.badge}</span>
          </div>
          <strong class="text-xs text-slate-100 block">${orientB.label}</strong>
          <p class="text-[10.5px] text-slate-400 leading-snug">${orientB.desc}</p>
          <div class="text-[9.5px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">${orientB.scores}</div>
        </div>
      </div>

      <div class="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[10.5px] text-slate-300">
        ${matchNotice}
      </div>

      <p class="text-[10.5px] text-slate-400 italic leading-snug border-t border-slate-800/60 pt-2 px-1">
        💡 <strong>Wichtiger Hinweis:</strong> Diese Rollenneigungen sind keine starren Schubladen. Ob man führen oder loslassen möchte, hängt ganz natürlich von Tagesform, Alltagsstress, Stimmung und der jeweiligen Dynamik zwischen euch ab.
      </p>
    `;
  }

  function renderPairBdsmTestRankings(answers, chapters, names) {
    var container = document.getElementById('pair-bdsmtest-container');
    if (!container) return;

    var rankA = calculatePartnerArchetypeRankings(answers.A || {}, chapters);
    var rankB = calculatePartnerArchetypeRankings(answers.B || {}, chapters);

    var nameA = names.A || 'Partner 1';
    var nameB = names.B || 'Partner 2';

    var sortedArchetypes = ARCHETYPE_DEFINITIONS.slice().sort(function(a, b) {
      var maxA = Math.max(rankA[a.id]?.percentage || 0, rankB[a.id]?.percentage || 0);
      var maxB = Math.max(rankA[b.id]?.percentage || 0, rankB[b.id]?.percentage || 0);
      return maxB - maxA;
    }).slice(0, 10);

    container.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">🏆</span>
          <div>
            <strong class="text-xs sm:text-sm text-white font-extrabold block">Top 10 Archetypen-Paarvergleich (BDSMTest-Format):</strong>
            <p class="text-[10px] text-slate-400">Direkter Prozentvergleich eurer Archetypen im BDSMTest.org-Format.</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-[10px] font-bold">
          <span class="flex items-center gap-1 text-rose-400"><span class="w-2 h-2 rounded-full bg-rose-500"></span>${escapeHtml(nameA)}</span>
          <span class="flex items-center gap-1 text-cyan-400"><span class="w-2 h-2 rounded-full bg-cyan-500"></span>${escapeHtml(nameB)}</span>
        </div>
      </div>

      <div class="space-y-3 pt-1">
        ${sortedArchetypes.map(function(arch, idx) {
          var pctA = rankA[arch.id]?.percentage || 0;
          var pctB = rankB[arch.id]?.percentage || 0;
          var isHighMatch = (pctA >= 60 && pctB >= 60);

          return `
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-1.5 truncate pr-2">
                  <span class="text-[10px] font-mono font-bold text-slate-500 w-5 text-left">${idx + 1}.</span>
                  <strong class="text-slate-100 text-[11px] truncate">${escapeHtml(arch.title)}</strong>
                  ${isHighMatch ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold ml-1">Synergie ✨</span>' : ''}
                </div>
                <div class="flex items-center gap-2 font-mono text-xs flex-shrink-0">
                  <span class="text-rose-400 font-black">${pctA}%</span>
                  <span class="text-slate-600 font-light">/</span>
                  <span class="text-cyan-400 font-black">${pctB}%</span>
                </div>
              </div>

              <!-- DOPPEL-BALKEN -->
              <div class="space-y-1">
                <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div class="h-full bg-gradient-to-r ${arch.colorA} rounded-full transition-all duration-500" style="width: ${Math.max(3, pctA)}%;"></div>
                </div>
                <div class="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div class="h-full bg-gradient-to-r ${arch.colorB} rounded-full transition-all duration-500" style="width: ${Math.max(3, pctB)}%;"></div>
                </div>
              </div>
              <p class="text-[9.5px] text-slate-400 leading-tight pl-6">${escapeHtml(arch.desc)}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderPairShameBridges(answers, chapters, names) {
    var container = document.getElementById('pair-shame-bridges-container');
    var countEl = document.getElementById('count-pair-shame');
    if (!container) return;

    var nameA = names.A || 'Partner 1';
    var nameB = names.B || 'Partner 2';

    var shameList = [];

    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        var isShameA = !!answers.A?.['it_' + it.id + '_shame'];
        var isShameB = !!answers.B?.['it_' + it.id + '_shame'];

        if (isShameA || isShameB) {
          var r1_A = answers.A?.['it_' + it.id + '_r1'];
          var r2_A = answers.A?.['it_' + it.id + '_r2'];
          var r1_B = answers.B?.['it_' + it.id + '_r1'];
          var r2_B = answers.B?.['it_' + it.id + '_r2'];

          var hasPositiveInterest = (r1_A >= 3 || r2_A >= 3 || r1_B >= 3 || r2_B >= 3);
          var isTabu = (r1_A === 1 || r2_A === 1 || r1_B === 1 || r2_B === 1);

          if (hasPositiveInterest && !isTabu) {
            var whoShame = [];
            if (isShameA) whoShame.push(nameA);
            if (isShameB) whoShame.push(nameB);

            shameList.push({
              item: it,
              chapter: ch,
              whoShame: whoShame.join(' & '),
              scores: `${nameA}: ${Math.max(r1_A || 0, r2_A || 0)}/5 · ${nameB}: ${Math.max(r1_B || 0, r2_B || 0)}/5`
            });
          }
        }
      });
    });

    if (countEl) countEl.innerText = shameList.length.toString();

    if (shameList.length === 0) {
      container.innerHTML = '<p class="text-slate-500 italic text-[11px] text-center py-3">Keine Praktiken mit Scham-Markierung bei beiderseitigem Interesse hinterlegt.</p>';
      return;
    }

    container.innerHTML = shameList.map(function(s) {
      return `
        <a href="index.html#view=survey&jumpItem=${s.item.id}" class="block p-3 rounded-2xl bg-indigo-950/30 hover:bg-indigo-950/70 border border-indigo-900/60 hover:border-indigo-600 transition group touch-btn">
          <div class="flex items-center justify-between">
            <span class="text-white block font-bold text-xs group-hover:text-indigo-200 truncate pr-2">${escapeHtml(s.item.title)}</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition flex-shrink-0">✏️ Ändern ↗</span>
          </div>
          <div class="flex items-center justify-between text-[10px] text-indigo-300 mt-1">
            <span class="truncate">🙈 Hemmschwelle bei: <strong>${escapeHtml(s.whoShame)}</strong></span>
            <span class="font-mono text-slate-400 flex-shrink-0 ml-2">${s.scores}</span>
          </div>
        </a>
      `;
    }).join('');
  }

  function renderPairAnalysis() {
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var nameA = names.A || 'Partner 1';
    var nameB = names.B || 'Partner 2';

    var headerTitle = document.getElementById('pair-names-title');
    if (headerTitle) headerTitle.innerText = nameA + " & " + nameB;

    var chapters = window.surveyChapters || [];
    var answers = window.answers || { A: {}, B: {} };
    if (!answers.A && !answers.B) {
      try {
        var stored = localStorage.getItem('kompass_answers');
        if (stored) answers = JSON.parse(stored);
      } catch (e) {}
    }

    var sharingA = getSharingLevel('A');
    var sharingB = getSharingLevel('B');

    var doubleFives = [];
    var bridges = [];
    var tabus = [];

    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type === 'choice') return;

        var r1_A = answers.A?.['it_' + it.id + '_r1'];
        var r2_A = answers.A?.['it_' + it.id + '_r2'];
        var r1_B = answers.B?.['it_' + it.id + '_r1'];
        var r2_B = answers.B?.['it_' + it.id + '_r2'];

        // TABU-PRÜFUNG (Note 1)
        if (r1_A === 1) tabus.push({ item: it, who: nameA, role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
        if (r2_A === 1) tabus.push({ item: it, who: nameA, role: 'Passiv: ' + (it.r2 || 'Empfangen') });
        if (r1_B === 1) tabus.push({ item: it, who: nameB, role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
        if (r2_B === 1) tabus.push({ item: it, who: nameB, role: 'Passiv: ' + (it.r2 || 'Empfangen') });

        // Wenn ein Partner Note 1 vergeben hat, wird es niemals als Match/Brücke gelistet
        if (r1_A === 1 || r2_A === 1 || r1_B === 1 || r2_B === 1) return;

        // DOPPEL-5ER: Konstellation 1 (A führt als r1, B empfängt als r2)
        if (r1_A === 5 && r2_B === 5) {
          doubleFives.push({
            item: it,
            roles: `${nameA} (Aktiv) & ${nameB} (Passiv)`,
            desc: it.desc || ''
          });
        }
        // DOPPEL-5ER: Konstellation 2 (B führt als r1, A empfängt als r2)
        if (r1_B === 5 && r2_A === 5) {
          doubleFives.push({
            item: it,
            roles: `${nameB} (Aktiv) & ${nameA} (Passiv)`,
            desc: it.desc || ''
          });
        }

        // BRÜCKENBAU-CHANCEN (5er trifft auf 3er oder 4er)
        // Unter Berücksichtigung der Freigabestufen (Stufe 1 = nur 4/5, Stufe 2 = ab 3, Stufe 3/4 = ab 2)
        var minAllowedA = (sharingA === 1) ? 4 : (sharingA === 2 ? 3 : 2);
        var minAllowedB = (sharingB === 1) ? 4 : (sharingB === 2 ? 3 : 2);

        // A will 5, B hat Interesse (3 oder 4)
        if (r1_A === 5 && (r2_B === 3 || r2_B === 4) && r2_B >= minAllowedB) {
          bridges.push({
            item: it,
            initiator: nameA,
            receiver: nameB,
            roleDesc: `${nameA} brennt dafür (5) · ${nameB} ist offen/neugierig (${r2_B})`,
            action: `Aktiv: ${it.r1 || 'Ausführen'}`
          });
        }
        // B will 5, A hat Interesse (3 oder 4)
        if (r1_B === 5 && (r2_A === 3 || r2_A === 4) && r2_A >= minAllowedA) {
          bridges.push({
            item: it,
            initiator: nameB,
            receiver: nameA,
            roleDesc: `${nameB} brennt dafür (5) · ${nameA} ist offen/neugierig (${r2_A})`,
            action: `Aktiv: ${it.r1 || 'Ausführen'}`
          });
        }
      });
    });

    var cDoubleFives = document.getElementById('count-double-fives');
    var cBridges = document.getElementById('count-bridges');
    var cTabus = document.getElementById('count-pair-tabus');

    if (cDoubleFives) cDoubleFives.innerText = doubleFives.length.toString();
    if (cBridges) cBridges.innerText = bridges.length.toString();
    if (cTabus) cTabus.innerText = tabus.length.toString();

    var listDoubleFives = document.getElementById('pair-double-fives-container');
    if (listDoubleFives) {
      listDoubleFives.innerHTML = doubleFives.length > 0 ? doubleFives.map(function(df) {
        return `
          <a href="index.html#view=survey&jumpItem=${df.item.id}" class="block p-3 rounded-2xl bg-brand-950/30 hover:bg-brand-950/70 border border-brand-900/60 hover:border-brand-500 transition group touch-btn">
            <div class="flex items-center justify-between">
              <strong class="text-white text-xs block group-hover:text-brand-300 truncate pr-2">${escapeHtml(df.item.title)}</strong>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-brand-900 text-brand-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition flex-shrink-0">✏️ Ändern ↗</span>
            </div>
            <span class="text-brand-300 text-[10px] block mt-0.5 truncate">${escapeHtml(df.roles)}</span>
            <p class="text-[9.5px] text-slate-400 font-normal line-clamp-1 mt-0.5">${escapeHtml(df.desc)}</p>
          </a>
        `;
      }).join('') : '<p class="text-slate-500 italic text-[11px] text-center py-4">Noch keine beiderseitigen 5er-Matches gefunden.</p>';
    }

    var listBridges = document.getElementById('pair-bridges-container');
    if (listBridges) {
      listBridges.innerHTML = bridges.length > 0 ? bridges.map(function(b) {
        return `
          <a href="index.html#view=survey&jumpItem=${b.item.id}" class="block p-3 rounded-2xl bg-amber-950/30 hover:bg-amber-950/70 border border-amber-900/60 hover:border-amber-500 transition group touch-btn">
            <div class="flex items-center justify-between">
              <strong class="text-white text-xs block group-hover:text-amber-200 truncate pr-2">${escapeHtml(b.item.title)}</strong>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-900 text-amber-200 font-bold group-hover:bg-brand-600 group-hover:text-white transition flex-shrink-0">✏️ Ändern ↗</span>
            </div>
            <span class="text-amber-300 text-[10px] block mt-0.5 truncate">${escapeHtml(b.roleDesc)}</span>
            <span class="text-slate-400 text-[9.5px] block">${escapeHtml(b.action)}</span>
          </a>
        `;
      }).join('') : '<p class="text-slate-500 italic text-[11px] text-center py-4">Keine Brückenbau-Potenziale ermittelt.</p>';
    }

    var listTabus = document.getElementById('pair-tabus-container');
    if (listTabus) {
      listTabus.innerHTML = tabus.length > 0 ? tabus.map(function(t) {
        return `
          <a href="index.html#view=survey&jumpItem=${t.item.id}" class="block p-3 rounded-2xl bg-rose-950/30 hover:bg-rose-950/70 border border-rose-900/60 hover:border-rose-600 transition group touch-btn">
            <div class="flex items-center justify-between">
              <strong class="text-white text-xs block group-hover:text-rose-200 truncate pr-2">${escapeHtml(t.item.title)}</strong>
              <div class="flex items-center gap-1 flex-shrink-0">
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-rose-900 text-rose-200 font-bold">${escapeHtml(t.who)}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-bold group-hover:bg-brand-600 group-hover:text-white transition">✏️ ↗</span>
              </div>
            </div>
            <span class="text-rose-300 text-[10px] block mt-0.5 truncate">${escapeHtml(t.role)}</span>
          </a>
        `;
      }).join('') : '<p class="text-slate-500 italic text-[11px] text-center py-4">Keine Veto-Grenzen (Note 1) hinterlegt.</p>';
    }

    // BDSMTest.org Top 10 Ranglisten-Paarvergleich rendern
    renderPairBdsmTestRankings(answers, chapters, names);

    // Grundlegende Rollen-Orientierung (Top / Bottom / Switch) rendern
    var rankA = calculatePartnerArchetypeRankings(answers.A || {}, chapters);
    var rankB = calculatePartnerArchetypeRankings(answers.B || {}, chapters);
    renderPairRoleOrientationCard(rankA, rankB, names);

    // Scham-Zonen rendern
    renderPairShameBridges(answers, chapters, names);

    // KI-Gutachten laden
    loadCachedPairInterpretation();
  }

  function renderPairReportHtml(report, isOutdated, generatedAt) {
    var bannerHtml = '';
    if (isOutdated) {
      bannerHtml = `
        <div class="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/80 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-lg animate-pulse mb-3">
          <div class="flex items-center gap-2.5">
            <span class="text-xl flex-shrink-0">⚠️</span>
            <div>
              <strong class="text-xs text-amber-200 block font-bold">Die Antworten wurden verändert</strong>
              <span class="text-[10.5px] text-slate-300 block mt-0.5">Mindestens ein Partner hat Antworten angepasst. Das Gutachten basiert noch auf dem Stand vom ${escapeHtml(generatedAt || 'gespeicherten Zeitpunkt')}.</span>
            </div>
          </div>
          <button type="button" onclick="PairAnalysisEngine.generateInterpretation()" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-xs touch-btn flex-shrink-0 shadow-md">
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
          <span class="text-[9.5px] text-slate-500">Datenbasis synchron</span>
        </div>
      `;
    }

    return `
      <div class="theme-card rounded-3xl p-5 border border-purple-500/40 space-y-3.5 shadow-lg animate-fade-in text-xs leading-relaxed">
        <div class="flex items-center justify-between border-b border-purple-900/60 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-base">✨</span>
            <h3 class="text-sm font-extrabold text-white">Tiefenpsychologisches KI-Paargutachten</h3>
          </div>
          <button type="button" onclick="PairAnalysisEngine.generateInterpretation()" class="px-3 py-1 bg-purple-900 hover:bg-purple-800 text-purple-200 font-extrabold rounded-xl text-xs touch-btn shadow-sm">
            Neu berechnen ↺
          </button>
        </div>

        ${bannerHtml}

        <div class="space-y-3 text-[11.5px] text-slate-300 leading-relaxed">
          <div class="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-900/60 space-y-1">
            <strong class="text-indigo-200 block text-xs font-bold">1. Erotisches Fundament & Synergie:</strong>
            <p>${escapeHtml(report.synergy || '')}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-900/60 space-y-1">
            <strong class="text-amber-200 block text-xs font-bold">2. Brückenbau & Wachstumspotenziale:</strong>
            <p>${escapeHtml(report.growth || '')}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-900/60 space-y-1">
            <strong class="text-teal-200 block text-xs font-bold">3. Scham-Entlastung & Vertrauensschutz:</strong>
            <p>${escapeHtml(report.safety || '')}</p>
          </div>
          <div class="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/60 space-y-1">
            <strong class="text-rose-200 block text-xs font-bold">4. Alltagstransfer & Ritual-Praxis:</strong>
            <p>${escapeHtml(report.everyday_transfer || report.integration || '')}</p>
          </div>
        </div>
      </div>
    `;
  }

  function loadCachedPairInterpretation() {
    var container = document.getElementById('pair-report-container');
    if (!container) return;

    try {
      var raw = localStorage.getItem('kompass_cached_pair_report');
      if (raw) {
        var parsed = JSON.parse(raw);
        var reportData = parsed.report || parsed;
        if (reportData && reportData.synergy) {
          var answers = window.answers || { A: {}, B: {} };
          var curHashA = hashString(getAnswersFingerprint(answers.A));
          var curHashB = hashString(getAnswersFingerprint(answers.B));
          var curCombinedHash = curHashA + '_' + curHashB;

          var isOutdated = parsed.hash && parsed.hash !== curCombinedHash;

          container.innerHTML = renderPairReportHtml(reportData, isOutdated, parsed.generatedAt);
          return;
        }
      }
    } catch (e) {}

    container.innerHTML = `
      <div class="theme-card rounded-3xl p-5 border text-center space-y-3 shadow-md">
        <span class="text-2xl block">🔮</span>
        <div>
          <strong class="text-xs text-white block font-bold">Tiefenpsychologisches KI-Paargutachten:</strong>
          <p class="text-[10.5px] text-slate-400 mt-0.5">Gemeinsame Synergien, Schamentlastung und konkrete Ritual-Impulse für euren Alltag.</p>
        </div>
        <button type="button" onclick="PairAnalysisEngine.generateInterpretation()" class="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-brand-600 hover:from-purple-600 hover:to-brand-500 text-white font-extrabold rounded-xl text-xs touch-btn shadow-lg">
          ✨ Jetzt Paargutachten berechnen
        </button>
      </div>
    `;
  }

  function generateClientSidePairReport(nameA, nameB, orientA, orientB, topSynergies) {
    var synergyText = `Zwischen ${nameA} (${orientA.badge}) und ${nameB} (${orientB.badge}) besteht ein facettenreiches erotisches Spannungsfeld. ${orientA.badge.indexOf("Switch") !== -1 || orientB.badge.indexOf("Switch") !== -1 ? "Durch die vorhandene Switch-Fähigkeit bleibt eure Dynamik außergewöhnlich beweglich und anpassungsfähig an wechselnde Alltagsphasen." : "Die klare Rollenverteilung bietet ein sofortiges Gefühl von Halt und verlässlicher Sicherheit."}`;

    var growthText = topSynergies.length > 0
      ? `Eure stärksten gemeinsamen Schnittmengen liegen in Bereichen wie ${topSynergies.slice(0, 3).join(', ')}. Hier könnt ihr ohne Hemmungen ansetzen, da beide Partner von derselben somatischen und psychologischen Neugier getragen werden.`
      : `Euer Profil zeichnet sich durch spannende Kontraste aus. Nutzt Brückenbau-Themen, um spielerisch und ohne Leistungsdruck herauszufinden, wie weit ihr euch gegenseitig in neue Zonen führen möchtet.`;

    var safetyText = `Schamgefühle und Hemmschwellen sind in der Paar-Sexualität vollkommen normal. Wie die moderne Paar- und Kink-Forschung belegt, sind Paare mit ausgeprägter erotischer Differenzierung besonders beziehungsstabil. Wo Tabus (Note 1) absolut unangetastet bleiben, entsteht erst der sichere Raum, in dem Schamgefühle liebevoll abgelegt werden können.`;

    var transferText = `Übertragt eure Dynamik mit kleinen Ritualen in den Alltag: Ein geheimer Blickcode vor Freunden, ein bewusster Kuss auf die Stirn beim Nachhausekommen oder ein vereinbartes Ruheritual nach stressigen Arbeitstagen. Haltet die Alltagsentscheidungen partnerschaftlich auf Augenhöhe und nutzt erotische Rollen als bewussten Spielraum.`;

    return {
      synergy: synergyText,
      growth: growthText,
      safety: safetyText,
      everyday_transfer: transferText
    };
  }

  async function generatePairInterpretation() {
    var names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    var nameA = names.A || 'Partner 1';
    var nameB = names.B || 'Partner 2';
    var answers = window.answers || { A: {}, B: {} };
    var chapters = window.surveyChapters || [];

    var container = document.getElementById('pair-report-container');
    if (container) {
      container.innerHTML = `
        <div class="theme-card rounded-3xl p-8 border text-center space-y-3 shadow-md animate-pulse">
          <div class="w-10 h-10 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin mx-auto"></div>
          <strong class="text-xs text-purple-200 block font-bold">Erstelle tiefenpsychologisches Paargutachten & Alltagstransfer...</strong>
          <p class="text-[10.5px] text-slate-400">Gemini analysiert eure Antworten, Archetypen, Schamthemen und Synergien.</p>
        </div>
      `;
    }

    var rankA = calculatePartnerArchetypeRankings(answers.A || {}, chapters);
    var rankB = calculatePartnerArchetypeRankings(answers.B || {}, chapters);
    var orientA = determineCoreOrientation(rankA);
    var orientB = determineCoreOrientation(rankB);

    var topMatches = [];
    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (answers.A?.['it_' + it.id + '_r1'] === 5 && answers.B?.['it_' + it.id + '_r2'] === 5) topMatches.push(it.title);
        if (answers.B?.['it_' + it.id + '_r1'] === 5 && answers.A?.['it_' + it.id + '_r2'] === 5) topMatches.push(it.title);
      });
    });

    var apiKey = localStorage.getItem('kompass_gemini_api_key') || '';

    var prompt = `Du bist eine renommierte, einfühlsame und wissenschaftlich fundierte Paar- und Sexualtherapeutin.
Erstelle ein warmherziges, inspirierendes und schamfreies Paargutachten für ${nameA} und ${nameB}.

PAAR-PROFIL:
- ${nameA}: Orientierung '${orientA.label}' (${orientA.scores})
- ${nameB}: Orientierung '${orientB.label}' (${orientB.scores})
- Beiderseitige Doppel-5er Leidenschaften (${topMatches.length}): ${topMatches.slice(0, 6).join(', ') || 'Ausgeprägte komplementäre Synergien'}

TONFALL & ANWEISUNGEN:
- Sprich ${nameA} und ${nameB} als Paar liebevoll, modern und therapeutisch entlastend an ("Ihr").
- Keine moralische Bewertung, volle Würdigung von Macht- und Hingabe-Bedürfnissen.
- In Feld 3 "safety": Betone, wie wichtig strikte Tabus sind, um Schamgefühle behutsam auflösen zu können.
- In Feld 4 "everyday_transfer": Gib alltagstaugliche Ratschläge für Rituale, Micro-D/s, nonverbale Signale und saubere Trennung von Alltagsverantwortung und Schlafzimmerspiel.

Antworte AUSSCHLIESSLICH als valides JSON mit genau diesen vier Feldern:
{
  "synergy": "Eure erotische Grunddynamik & Zusammenspiel von ${nameA} und ${nameB} (3 bis 5 Sätze)",
  "growth": "Wo liegen eure stärksten Brücken und Wachstumschancen? (3 bis 5 Sätze)",
  "safety": "Scham-Entlastung, Vertrauensgrenzen & Wertschätzung von Tabus (3 bis 5 Sätze)",
  "everyday_transfer": "Konkreter, praxisnaher Ratgeber: Wie ihr diese Dynamik harmonisch in den Beziehungsalltag einwebt (3 bis 5 Sätze)"
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
      finalReport = generateClientSidePairReport(nameA, nameB, orientA, orientB, topMatches);
      showToast("✓ Paargutachten aus euren Bogen-Werten berechnet (Offline-Modus)");
    }

    if (finalReport) {
      var nowStr = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      var curHashA = hashString(getAnswersFingerprint(answers.A));
      var curHashB = hashString(getAnswersFingerprint(answers.B));
      var cacheEntry = {
        report: finalReport,
        hash: curHashA + '_' + curHashB,
        generatedAt: nowStr
      };

      try {
        localStorage.setItem('kompass_cached_pair_report', JSON.stringify(cacheEntry));
      } catch (e) {}

      if (container) {
        container.innerHTML = renderPairReportHtml(finalReport, false, nowStr);
      }
    }
  }

  window.PairAnalysisEngine = {
    render: renderPairAnalysis,
    generateInterpretation: generatePairInterpretation,
    calculateRankings: calculatePartnerArchetypeRankings,
    determineOrientation: determineCoreOrientation
  };

  window.renderPairAnalysis = renderPairAnalysis;
  window.generatePairInterpretation = generatePairInterpretation;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', renderPairAnalysis);
  } else {
    renderPairAnalysis();
  }

})(window);
