/**
 * js/pair_analysis.js
 * Modul für die Beziehungs-Synergie & Paar-Analyse ("analyse.html"):
 * - Robuste, direkte Datenbeschaffung aus localStorage und Sync-Cache
 * - Verfeinerte BDSMTest-Orientierungs-Formel (Top / Bottom / True-Switch / Dom-leaning / Sub-leaning)
 * - Umfassender Handlungsleitfaden für ALLE 4 Paarkonstellationen (Switch/Switch, Top/Top, Bottom/Bottom, Top/Bottom)
 * - BDSMTest.org-Top-10-Archetypen-Paarvergleich mit vergleichenden Prozentbalken
 * - Doppel-5er-Volltreffer (Sofort auslebbar)
 * - Vollständige Brückenbau-Chancen (Top-geführt & Bottom-initiiert, 5 trifft auf 3/4)
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

  function getLoadedPairAnswers() {
    var result = { A: {}, B: {} };
    try {
      var raw = localStorage.getItem('kompass_answers');
      if (raw && raw !== 'null') {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (parsed.A && typeof parsed.A === 'object') result.A = parsed.A;
          if (parsed.B && typeof parsed.B === 'object') result.B = parsed.B;
        }
      }
    } catch (e) {
      console.warn("Fehler beim Laden von kompass_answers aus localStorage:", e);
    }

    if (window.answers && typeof window.answers === 'object') {
      if (window.answers.A && Object.keys(window.answers.A).length > 0) {
        result.A = Object.assign({}, result.A, window.answers.A);
      }
      if (window.answers.B && Object.keys(window.answers.B).length > 0) {
        result.B = Object.assign({}, result.B, window.answers.B);
      }
    }

    window.answers = result;
    return result;
  }

  function getLoadedPairNames() {
    var result = { A: 'Partner 1', B: 'Partner 2' };
    try {
      var raw = localStorage.getItem('kompass_names');
      if (raw && raw !== 'null') {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          if (parsed.A && String(parsed.A).trim().length > 0) result.A = String(parsed.A).trim();
          if (parsed.B && String(parsed.B).trim().length > 0) result.B = String(parsed.B).trim();
        }
      }
    } catch (e) {}

    if (window.names && typeof window.names === 'object') {
      if (window.names.A && String(window.names.A).trim().length > 0) result.A = String(window.names.A).trim();
      if (window.names.B && String(window.names.B).trim().length > 0) result.B = String(window.names.B).trim();
    }

    window.names = result;
    return result;
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

  function calculateIndividualRatingMean(answersUser) {
    if (!answersUser || typeof answersUser !== 'object') return 3.0;
    var sum = 0, count = 0;
    Object.keys(answersUser).forEach(function(k) {
      if (k.indexOf('_note') === -1 && k.indexOf('_shame') === -1 && k.indexOf('_choice') === -1) {
        var rawVal = answersUser[k];
        var val = Number(rawVal);
        if (!isNaN(val) && val > 0) {
          sum += val;
          count++;
        }
      }
    });
    return count > 0 ? (sum / count) : 3.0;
  }

  function getItemDiagnosticWeight(it, chId) {
    var titleLower = (it.title || '').toLowerCase();
    var descLower = (it.desc || '').toLowerCase();
    var textCombined = titleLower + ' ' + descLower;

    if (textCombined.indexOf('pegging') !== -1 ||
        textCombined.indexOf('strap-on') !== -1 ||
        textCombined.indexOf('ruined') !== -1 ||
        textCombined.indexOf('keuschheit') !== -1 ||
        textCombined.indexOf('käfig') !== -1 ||
        textCombined.indexOf('denial') !== -1 ||
        textCombined.indexOf('facesitting') !== -1 ||
        textCombined.indexOf('queening') !== -1 ||
        textCombined.indexOf('cbt') !== -1 ||
        textCombined.indexOf('nadel') !== -1 ||
        textCombined.indexOf('atemkontrolle') !== -1 ||
        textCombined.indexOf('breath') !== -1) {
      return 2.4;
    }

    var numCh = Number(chId);
    if ([21, 22, 23, 29, 7, 8, 13, 14, 16, 17].indexOf(numCh) !== -1 ||
        textCombined.indexOf('zucht') !== -1 ||
        textCombined.indexOf('kniestand') !== -1 ||
        textCombined.indexOf('gehorsam') !== -1 ||
        textCombined.indexOf('strafe') !== -1 ||
        textCombined.indexOf('spanking') !== -1 ||
        textCombined.indexOf('fessel') !== -1 ||
        textCombined.indexOf('shibari') !== -1 ||
        textCombined.indexOf('flogger') !== -1 ||
        textCombined.indexOf('paddle') !== -1 ||
        textCombined.indexOf('knebel') !== -1 ||
        textCombined.indexOf('peitsche') !== -1) {
      return 1.8;
    }

    if ([9, 10, 11, 15, 18, 20, 24, 25].indexOf(numCh) !== -1 ||
        textCombined.indexOf('maske') !== -1 ||
        textCombined.indexOf('augenbinde') !== -1 ||
        textCombined.indexOf('raufen') !== -1 ||
        textCombined.indexOf('wachs') !== -1 ||
        textCombined.indexOf('lingerie') !== -1 ||
        textCombined.indexOf('spiegel') !== -1) {
      return 1.3;
    }

    return 0.9;
  }

  function transformPsychometricRating(rawScore, isShame, userMean) {
    var score = Number(rawScore);
    if (isNaN(score) || score <= 0) return 0;

    var calibrationOffset = (3.0 - userMean) * 0.35;
    var calibratedScore = Math.max(1.0, Math.min(5.0, score + calibrationOffset));

    if (isShame && score >= 3) {
      calibratedScore = Math.min(5.0, calibratedScore * 1.25);
    }

    return calibratedScore;
  }

  function calculatePartnerArchetypeRankings(answersUser, chapters) {
    var results = {};
    if (!answersUser || typeof answersUser !== 'object') answersUser = {};
    if (!chapters || !Array.isArray(chapters)) chapters = window.surveyChapters || [];
    var userMean = calculateIndividualRatingMean(answersUser);

    var powerChapters = [21, 22, 23, 29];
    var domEarned = 0, domPossible = 0;
    var subEarned = 0, subPossible = 0;

    powerChapters.forEach(function(chId) {
      var ch = chapters.find(function(c) { return Number(c.id) === Number(chId); });
      if (ch && ch.items) {
        ch.items.forEach(function(it) {
          if (it.type !== 'choice') {
            var raw1 = answersUser['it_' + it.id + '_r1'];
            var raw2 = answersUser['it_' + it.id + '_r2'];
            var s1 = (raw1 !== undefined && raw1 !== null && raw1 !== '') ? Number(raw1) : NaN;
            var s2 = (raw2 !== undefined && raw2 !== null && raw2 !== '') ? Number(raw2) : NaN;
            var isShame = !!answersUser['it_' + it.id + '_shame'];
            var weight = getItemDiagnosticWeight(it, chId);

            if (!isNaN(s1) && s1 > 0) {
              var t1 = transformPsychometricRating(s1, isShame, userMean);
              domEarned += (t1 * weight);
              domPossible += (5 * weight);
            }
            if (!isNaN(s2) && s2 > 0) {
              var t2 = transformPsychometricRating(s2, isShame, userMean);
              subEarned += (t2 * weight);
              subPossible += (5 * weight);
            }
          }
        });
      }
    });

    if (domPossible === 0 && subPossible === 0) {
      chapters.forEach(function(ch) {
        (ch.items || []).forEach(function(it) {
          if (it.type !== 'choice') {
            var raw1 = answersUser['it_' + it.id + '_r1'];
            var raw2 = answersUser['it_' + it.id + '_r2'];
            var s1 = (raw1 !== undefined && raw1 !== null && raw1 !== '') ? Number(raw1) : NaN;
            var s2 = (raw2 !== undefined && raw2 !== null && raw2 !== '') ? Number(raw2) : NaN;
            var isShame = !!answersUser['it_' + it.id + '_shame'];
            var weight = getItemDiagnosticWeight(it, ch.id);

            if (!isNaN(s1) && s1 > 0) {
              domEarned += (transformPsychometricRating(s1, isShame, userMean) * weight);
              domPossible += (5 * weight);
            }
            if (!isNaN(s2) && s2 > 0) {
              subEarned += (transformPsychometricRating(s2, isShame, userMean) * weight);
              subPossible += (5 * weight);
            }
          }
        });
      });
    }

    var pDom = domPossible > 0 ? Math.min(100, Math.round((domEarned / domPossible) * 100)) : 0;
    var pSub = subPossible > 0 ? Math.min(100, Math.round((subEarned / subPossible) * 100)) : 0;

    ARCHETYPE_DEFINITIONS.forEach(function(arch) {
      var earned = 0;
      var possible = 0;
      var percentage = 0;

      if (arch.role === 'switch') {
        var avg = (pDom + pSub) / 2;
        var diff = Math.abs(pDom - pSub);
        var balancePenalty = 1 - (diff / 100) * 0.45;
        var dualDriveBoost = (pDom >= 30 && pSub >= 30) ? 1.08 : 0.92;
        
        var calculatedSwitch = Math.round(avg * balancePenalty * dualDriveBoost);
        percentage = Math.min(100, Math.max(0, calculatedSwitch));
        possible = domPossible + subPossible;
      } else {
        arch.chapters.forEach(function(chId) {
          var ch = chapters.find(function(c) { return Number(c.id) === Number(chId); });
          if (ch && ch.items) {
            ch.items.forEach(function(it) {
              if (it.type !== 'choice') {
                var weight = getItemDiagnosticWeight(it, chId);
                var isShame = !!answersUser['it_' + it.id + '_shame'];

                var raw1 = answersUser['it_' + it.id + '_r1'];
                var raw2 = answersUser['it_' + it.id + '_r2'];
                var s1 = (raw1 !== undefined && raw1 !== null && raw1 !== '') ? Number(raw1) : NaN;
                var s2 = (raw2 !== undefined && raw2 !== null && raw2 !== '') ? Number(raw2) : NaN;

                if (arch.role === 'r1' || arch.role === 'both') {
                  if (!isNaN(s1) && s1 > 0) {
                    earned += (transformPsychometricRating(s1, isShame, userMean) * weight);
                    possible += (5 * weight);
                  }
                }
                if (arch.role === 'r2' || arch.role === 'both') {
                  if (!isNaN(s2) && s2 > 0) {
                    earned += (transformPsychometricRating(s2, isShame, userMean) * weight);
                    possible += (5 * weight);
                  }
                }
              }
            });
          }
        });
        percentage = possible > 0 ? Math.min(100, Math.round((earned / possible) * 100)) : 0;
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
    var diff = Math.abs(pDom - pSub);

    if (pDom >= 35 && pSub >= 35 && diff <= 18) {
      return {
        type: 'switch_true',
        label: "Ausgeprägter Switch (Beidseitig)",
        badge: "🔄 True Switch",
        desc: "Lust an aktiver Regie und Führung ebenso intensiv vorhanden wie am vertrauensvollen Loslassen und Dienen.",
        color: "text-purple-300 bg-purple-950/80 border-purple-600",
        scores: "Top: " + pDom + "% · Bottom: " + pSub + "% · Switch: " + pSwitch + "%"
      };
    }

    if (pDom > pSub && pSub >= 30 && diff <= 40) {
      return {
        type: 'switch_dom',
        label: "Dom-Leaning Switch (Führend mit Switch-Ader)",
        badge: "👑🔄 Dom-Switch",
        desc: "Nimmt bevorzugt die Regie und Verantwortung in die Hand, genießt es aber zutiefst, bei absolutem Vertrauen die Kontrolle abzugeben.",
        color: "text-rose-300 bg-rose-950/80 border-rose-600",
        scores: "Top: " + pDom + "% · Bottom: " + pSub + "% (Switch: " + pSwitch + "%)"
      };
    }

    if (pSub > pDom && pDom >= 30 && diff <= 40) {
      return {
        type: 'switch_sub',
        label: "Sub-Leaning Switch (Hingebungsvoll mit Führungs-Potenzial)",
        badge: "🧎🔄 Sub-Switch",
        desc: "Sucht primär das Loslassen und Dienen, spürt jedoch situativ den Drang, den Partner zu fordern, zu necken oder zu erziehen.",
        color: "text-indigo-300 bg-indigo-950/80 border-indigo-600",
        scores: "Bottom: " + pSub + "% · Top: " + pDom + "% (Switch: " + pSwitch + "%)"
      };
    }

    if (pDom >= pSub) {
      var isStrong = (diff >= 35);
      return {
        type: 'top',
        label: isStrong ? "Klarer Top (Dominant)" : "Führende Orientierung (Top)",
        badge: "👑 Top",
        desc: "Fokus auf Führung, Struktur, Verantwortung und achtsame Regieführung im erotischen Machtspiel.",
        color: "text-rose-400 bg-rose-950/90 border-rose-700",
        scores: "Top: " + pDom + "% · Bottom: " + pSub + "%"
      };
    }

    var isStrongSub = (diff >= 35);
    return {
      type: 'bottom',
      label: isStrongSub ? "Klarer Bottom (Devot)" : "Hingebungsvolle Orientierung (Bottom)",
      badge: "🧎 Bottom",
      desc: "Fokus auf vertrauensvolle Selbstaufgabe, Empfangen und die heilsame Katharsis des Dienens.",
      color: "text-cyan-300 bg-indigo-950/90 border-cyan-700",
      scores: "Bottom: " + pSub + "% · Top: " + pDom + "%"
    };
  }

  function buildDynamicGuidance(typeA, typeB, nameA, nameB) {
    var isSwitchA = (typeA.indexOf('switch') !== -1);
    var isSwitchB = (typeB.indexOf('switch') !== -1);
    var isTopA = (typeA === 'top' || typeA === 'switch_dom');
    var isTopB = (typeB === 'top' || typeB === 'switch_dom');
    var isSubA = (typeA === 'bottom' || typeA === 'switch_sub');
    var isSubB = (typeB === 'bottom' || typeB === 'switch_sub');

    if (isSwitchA && isSwitchB) {
      return {
        constellationTitle: "🔄 Die Chamäleon-Dynamik (Switch / Switch)",
        summary: `Sowohl ${nameA} als auch ${nameB} besitzen die Gabe und Neigung, beide Seiten der Macht zu empfinden. Das ist die vielseitigste aller Konstellationen – verlangt jedoch ein klares System.`,
        pitfall: "<strong>Die Höflichkeits-Falle:</strong> Ohne Absprache fragt jeder: <em>„Was möchtest du heute?“</em>, worauf der andere antwortet: <em>„Egal, mach du!“</em>. Das erotische Momentum verpufft in Unentschlossenheit.",
        actionGuide: [
          "<strong>1. Das Token-Prinzip:</strong> Nutzt einen symbolischen Gegenstand (z. B. einen Ring oder einen Stein auf dem Nachttisch). Wer den Gegenstand auf seine Seite legt, hat heute bedingungslos die Regie – der andere lässt sich führen.",
          "<strong>2. Kalender-Schichten:</strong> Vereinbart Tage: <em>„Freitag ist deine Nacht (du führst mich) – Sonntag gehört mir (ich führe dich).“</em>",
          "<strong>3. Szenen-Inversion:</strong> Fortgeschrittene Switches wechseln innerhalb einer Session: Ein Part beginnt zart und dienend, bevor er durch ein codiertes Signal den Raum dreht und den Partner überraschend überwältigt."
        ],
        badgeColor: "border-purple-600 bg-purple-950/40 text-purple-200"
      };
    }

    if (isTopA && isTopB && !isSubA && !isSubB) {
      return {
        constellationTitle: "⚡ Die Duell-Dynamik (Top / Top)",
        summary: `Bei ${nameA} und ${nameB} treffen zwei starke Führungsnaturen aufeinander. Keiner von beiden möchte gerne die Kontrolle an die Bettkante abtreten.`,
        pitfall: "<strong>Realer Machtkampf:</strong> Wenn beide gleichzeitig die Führung erzwingen wollen, schlägt das Spiel schnell in Frust oder Gereiztheit um.",
        actionGuide: [
          "<strong>1. Primal Raufen & Kräftemessen:</strong> Nutzt spielerisches Raufen auf der Matratze: Wer zuerst abklopft (Tap-Out), ist für den restlichen Abend der Bottom.",
          "<strong>2. Domänen-Aufteilung:</strong> Teilt eure Vorlieben auf: Ein Partner führt bei Fesselungen; der andere führt bei Spanking oder Orgasmuskontrolle.",
          "<strong>3. Co-Dominanz:</strong> Konzentriert eure dominante Energie gemeinsam auf sensorische Rituale oder Ästhetik."
        ],
        badgeColor: "border-rose-600 bg-rose-950/40 text-rose-200"
      };
    }

    if (isSubA && isSubB && !isTopA && !isTopB) {
      return {
        constellationTitle: "🧎 Das Sehnsuchts-Paar (Bottom / Bottom)",
        summary: `Sowohl ${nameA} als auch ${nameB} sehnen sich vor allem nach dem Loslassen, Verwöhntwerden und der süßen Befreiung von Alltagsverantwortung.`,
        pitfall: "<strong>Die Hemmung zur Härte:</strong> Beide möchten geführt werden, doch keiner traut sich, aktiv Kommandos zu erteilen oder Schläge zu setzen.",
        actionGuide: [
          "<strong>1. Service-Dominanz (Führen durch Dienen):</strong> Dominanz muss nicht böse sein! Ein Partner übernimmt die Führung mit dem Motiv, den anderen maximal zu verwöhnen (*„Ich befehle dir, jetzt die Augen zu schließen und dich von mir massieren zu lassen“*).",
          "<strong>2. Die App als neutraler 'Dritter Top':</strong> Nutzt das <em>Geführte Drehbuch</em> in der Schlafzimmer-Regie. Da die App die Anweisungen vorgibt, folgt ihr beide einfach der Regie.",
          "<strong>3. Reihum-Verwöhnrituale:</strong> Jeder Partner erhält 30 Minuten reine Empfängerzeit mit Augenbinde, während der andere liebevoll aktiv agiert."
        ],
        badgeColor: "border-cyan-600 bg-indigo-950/40 text-cyan-200"
      };
    }

    var topName = isTopA ? nameA : nameB;
    var subName = isTopA ? nameB : nameA;
    return {
      constellationTitle: "👑 Klassische Komplementarität (Top & Bottom)",
      summary: `Mit ${topName} als Führendem und ${subName} als Hingebungsvollem habt ihr eine organisch ineinandergreifende Grundenergie. Hier herrscht sofortige Stabilität.`,
      pitfall: "<strong>Alltags-Verschleppung:</strong> Die Gefahr besteht darin, die erotische D/s-Rolle in die Partnerschaft zu übertragen – oder den Bottom mit der Zeit als selbstverständlich anzusehen.",
      actionGuide: [
        "<strong>1. Saubere Trennung von Alltag und Spiel:</strong> Am Frühstückstisch und bei Entscheidungen seid ihr gleichberechtigte Partner auf Augenhöhe. Erst nach vereinbartem Startsignal gilt die Hierarchie.",
        "<strong>2. Tiefe Aftercare als Pflicht:</strong> Nach intensiver Führung braucht der Bottom Decken, Wasser und körperliches Halten, um den Hormonabfall (Subdrop) aufzufangen.",
        "<strong>3. Regelmäßige Check-ins:</strong> Führt einmal im Monat ein ruhiges Gespräch: <em>„Passt das Maß an Strenge noch? Gibt es neue Wünsche oder Schamthemen?“</em>"
      ],
      badgeColor: "border-amber-600 bg-amber-950/40 text-amber-200"
    };
  }

  function renderPairRoleOrientationCard(rankA, rankB, names) {
    var container = document.getElementById('pair-core-orientation-card');
    if (!container) {
      var gridEl = document.getElementById('pair-double-fives-container')?.closest('.grid');
      if (gridEl && gridEl.parentNode) {
        var card = document.createElement('div');
        card.id = 'pair-core-orientation-card';
        card.className = "theme-card rounded-3xl p-5 border border-amber-900/60 space-y-4 shadow-lg bg-gradient-to-br from-amber-950/20 via-noir-900 to-purple-950/20";
        gridEl.parentNode.insertBefore(card, gridEl);
        container = card;
      }
    }
    if (!container) return;

    var orientA = determineCoreOrientation(rankA);
    var orientB = determineCoreOrientation(rankB);
    var nameA = names.A || 'Partner 1';
    var nameB = names.B || 'Partner 2';

    var guide = buildDynamicGuidance(orientA.type, orientB.type, nameA, nameB);

    container.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="text-xl">⚖️</span>
          <div>
            <strong class="text-xs sm:text-sm text-white font-extrabold block">Grundlegende Rollen-Orientierung (Top / Bottom / Switch):</strong>
            <p class="text-[10.5px] text-slate-400">Verfeinerte BDSMTest-Berechnung eurer Macht- & Hingabe-Neigungen.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-white">${escapeHtml(nameA)}</span>
            <span class="text-[10px] font-black px-2.5 py-0.5 rounded-lg border ${orientA.color}">${orientA.badge}</span>
          </div>
          <strong class="text-xs text-slate-100 block">${orientA.label}</strong>
          <p class="text-[10.5px] text-slate-400 leading-snug">${orientA.desc}</p>
          <div class="text-[9.5px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">${orientA.scores}</div>
        </div>

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

      <div class="p-4 rounded-2xl border ${guide.badgeColor} space-y-2.5 text-xs">
        <div class="flex items-center justify-between border-b border-white/10 pb-1.5">
          <strong class="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
            <span>✨</span><span>Euer Paarleitfaden: ${guide.constellationTitle}</span>
          </strong>
        </div>
        
        <p class="text-[11px] text-slate-200 leading-relaxed">${guide.summary}</p>
        
        <div class="p-2.5 rounded-xl bg-slate-950/80 border border-white/10 text-[10.5px] text-amber-200">
          ⚠️ ${guide.pitfall}
        </div>

        <div class="space-y-1.5 pt-1">
          <strong class="text-[11px] text-white block">Konkrete Empfehlungen für euer Zusammenspiel:</strong>
          <ul class="space-y-1 text-[10.5px] text-slate-300">
            ${guide.actionGuide.map(function(item) {
              return `<li class="flex items-start gap-1.5"><span class="text-amber-400 font-bold">▸</span><span>${item}</span></li>`;
            }).join('')}
          </ul>
        </div>
      </div>

      <p class="text-[10px] text-slate-400 italic leading-snug border-t border-slate-800/60 pt-2 px-1">
        💡 <strong>Wichtiger Paar-Grundsatz:</strong> Diese Rollenneigungen sind keine starren Schubladen. Ob man führen oder sich fallenlassen möchte, hängt ganz natürlich von Tagesform, Zyklus, Alltagsstress und der Chemie zwischen euch ab.
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
          var r1_A = Number(answers.A?.['it_' + it.id + '_r1']);
          var r2_A = Number(answers.A?.['it_' + it.id + '_r2']);
          var r1_B = Number(answers.B?.['it_' + it.id + '_r1']);
          var r2_B = Number(answers.B?.['it_' + it.id + '_r2']);

          var maxA = Math.max(isNaN(r1_A) ? 0 : r1_A, isNaN(r2_A) ? 0 : r2_A);
          var maxB = Math.max(isNaN(r1_B) ? 0 : r1_B, isNaN(r2_B) ? 0 : r2_B);

          var hasPositiveInterest = (maxA >= 3 || maxB >= 3);
          var isFullTabu = (r1_A === 1 && r2_A === 1) || (r1_B === 1 && r2_B === 1);

          if (hasPositiveInterest && !isFullTabu) {
            var whoShame = [];
            if (isShameA) whoShame.push(nameA);
            if (isShameB) whoShame.push(nameB);

            shameList.push({
              item: it,
              chapter: ch,
              whoShame: whoShame.join(' & '),
              scores: `${nameA}: ${maxA}/5 · ${nameB}: ${maxB}/5`
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
    var names = getLoadedPairNames();
    var nameA = names.A || 'Partner 1';
    var nameB = names.B || 'Partner 2';

    var headerTitle = document.getElementById('pair-names-title');
    if (headerTitle) headerTitle.innerText = nameA + " & " + nameB;

    var chapters = window.surveyChapters || [];
    var answers = getLoadedPairAnswers();

    var sharingA = getSharingLevel('A');
    var sharingB = getSharingLevel('B');

    var doubleFives = [];
    var bridges = [];
    var tabus = [];

    var minAllowedA = (sharingA === 1) ? 4 : (sharingA === 2 ? 3 : 2);
    var minAllowedB = (sharingB === 1) ? 4 : (sharingB === 2 ? 3 : 2);

    chapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type === 'choice') return;

        var raw1_A = answers.A ? answers.A['it_' + it.id + '_r1'] : undefined;
        var raw2_A = answers.A ? answers.A['it_' + it.id + '_r2'] : undefined;
        var raw1_B = answers.B ? answers.B['it_' + it.id + '_r1'] : undefined;
        var raw2_B = answers.B ? answers.B['it_' + it.id + '_r2'] : undefined;

        var r1_A = (raw1_A !== undefined && raw1_A !== null && raw1_A !== '') ? Number(raw1_A) : NaN;
        var r2_A = (raw2_A !== undefined && raw2_A !== null && raw2_A !== '') ? Number(raw2_A) : NaN;
        var r1_B = (raw1_B !== undefined && raw1_B !== null && raw1_B !== '') ? Number(raw1_B) : NaN;
        var r2_B = (raw2_B !== undefined && raw2_B !== null && raw2_B !== '') ? Number(raw2_B) : NaN;

        if (r1_A === 1) tabus.push({ item: it, who: nameA, role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
        if (r2_A === 1) tabus.push({ item: it, who: nameA, role: 'Passiv: ' + (it.r2 || 'Empfangen') });
        if (r1_B === 1) tabus.push({ item: it, who: nameB, role: 'Aktiv: ' + (it.r1 || 'Ausführen') });
        if (r2_B === 1) tabus.push({ item: it, who: nameB, role: 'Passiv: ' + (it.r2 || 'Empfangen') });

        if (r1_A === 5 && r2_B === 5 && r1_A !== 1 && r2_B !== 1) {
          doubleFives.push({
            item: it,
            roles: `${nameA} führt (Aktiv) & ${nameB} empfängt (Passiv)`,
            desc: it.desc || ''
          });
        }
        if (r1_B === 5 && r2_A === 5 && r1_B !== 1 && r2_A !== 1) {
          doubleFives.push({
            item: it,
            roles: `${nameB} führt (Aktiv) & ${nameA} empfängt (Passiv)`,
            desc: it.desc || ''
          });
        }
        if (r1_A === 5 && r1_B === 5 && r1_A !== 1 && r1_B !== 1 && it.r1 && it.r2 && it.r1 === it.r2) {
          doubleFives.push({
            item: it,
            roles: `Beide brennen dafür (${nameA} & ${nameB})`,
            desc: it.desc || ''
          });
        }

        if (r1_A === 5 && (r2_B === 3 || r2_B === 4) && r1_A !== 1 && r2_B !== 1 && r2_B >= minAllowedB) {
          bridges.push({
            item: it,
            initiator: nameA,
            receiver: nameB,
            roleDesc: `${nameA} will führen (5) · ${nameB} ist offen (${r2_B})`,
            action: `Aktiv: ${it.r1 || 'Ausführen'}`
          });
        }
        if (r1_B === 5 && (r2_A === 3 || r2_A === 4) && r1_B !== 1 && r2_A !== 1 && r2_A >= minAllowedA) {
          bridges.push({
            item: it,
            initiator: nameB,
            receiver: nameA,
            roleDesc: `${nameB} will führen (5) · ${nameA} ist offen (${r2_A})`,
            action: `Aktiv: ${it.r1 || 'Ausführen'}`
          });
        }
        if (r2_A === 5 && (r1_B === 3 || r1_B === 4) && r2_A !== 1 && r1_B !== 1 && r1_B >= minAllowedB) {
          bridges.push({
            item: it,
            initiator: nameA,
            receiver: nameB,
            roleDesc: `${nameA} sehnt sich nach Hingabe (5) · ${nameB} führt offen (${r1_B})`,
            action: `Passiv: ${it.r2 || 'Empfangen'}`
          });
        }
        if (r2_B === 5 && (r1_A === 3 || r1_A === 4) && r2_B !== 1 && r1_A !== 1 && r1_A >= minAllowedA) {
          bridges.push({
            item: it,
            initiator: nameB,
            receiver: nameA,
            roleDesc: `${nameB} sehnt sich nach Hingabe (5) · ${nameA} führt offen (${r1_A})`,
            action: `Passiv: ${it.r2 || 'Empfangen'}`
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

    var rankA = calculatePartnerArchetypeRankings(answers.A || {}, chapters);
    var rankB = calculatePartnerArchetypeRankings(answers.B || {}, chapters);
    renderPairRoleOrientationCard(rankA, rankB, names);
    renderPairBdsmTestRankings(answers, chapters, names);
    renderPairShameBridges(answers, chapters, names);
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
          var answers = getLoadedPairAnswers();
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
          <p class="text-[10.5px] text-slate-400 mt-0.5">Gemeinsame Synergien, Schamentlastung und konkrete Ritual-Impulse für euren Beziehungsalltag.</p>
        </div>
        <button type="button" onclick="PairAnalysisEngine.generateInterpretation()" class="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-brand-600 hover:from-purple-600 hover:to-brand-500 text-white font-extrabold rounded-xl text-xs touch-btn shadow-lg">
          ✨ Jetzt Paargutachten berechnen
        </button>
      </div>
    `;
  }

  function generateClientSidePairReport(nameA, nameB, orientA, orientB, topSynergies) {
    var synergyText = `Zwischen ${nameA} (${orientA.badge}) und ${nameB} (${orientB.badge}) besteht ein vielschichtiges erotisches Macht- und Hingabefeld. ${orientA.badge.indexOf("Switch") !== -1 || orientB.badge.indexOf("Switch") !== -1 ? "Durch die vorhandenen Switch-Neigungen besitzt ihr die Fähigkeit, das Zepter dynamisch zu übergeben und flexibel auf unterschiedliche Alltagsphasen zu reagieren." : "Die klare komplementäre Rollenverteilung gibt beiden Partnern sofortige Orientierung, Halt und emotionale Verlässlichkeit."}`;

    var growthText = topSynergies.length > 0
      ? `Eure intensivsten gemeinsamen Schnittmengen liegen in Bereichen wie ${topSynergies.slice(0, 3).join(', ')}. Hier könnt ihr ohne Hemmungen ansetzen, da beide Partner von derselben somatischen und psychologischen Neugier getragen werden.`
      : `Euer Profil zeichnet sich durch reizvolle Kontraste aus. Nutzt Brückenbau-Themen, um spielerisch und ohne Leistungsdruck herauszufinden, wie weit ihr euch gegenseitig in neue Erfahrungsräume führen möchtet.`;

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
    var names = getLoadedPairNames();
    var nameA = names.A || 'Partner 1';
    var nameB = names.B || 'Partner 2';
    var answers = getLoadedPairAnswers();
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
        var r1_A = Number(answers.A ? answers.A['it_' + it.id + '_r1'] : NaN);
        var r2_A = Number(answers.A ? answers.A['it_' + it.id + '_r2'] : NaN);
        var r1_B = Number(answers.B ? answers.B['it_' + it.id + '_r1'] : NaN);
        var r2_B = Number(answers.B ? answers.B['it_' + it.id + '_r2'] : NaN);

        if (r1_A === 5 && r2_B === 5) topMatches.push(it.title);
        if (r1_B === 5 && r2_A === 5) topMatches.push(it.title);
      });
    });

    var apiKey = localStorage.getItem('kompass_gemini_api_key') || '';
    var meanA = calculateIndividualRatingMean(answers.A).toFixed(1);
    var meanB = calculateIndividualRatingMean(answers.B).toFixed(1);

    var prompt = `Du bist eine renommierte, einfühlsame und wissenschaftlich fundierte Paar- und Sexualtherapeutin.
Erstelle ein warmherziges, inspirierendes und schamfreies Paargutachten für ${nameA} und ${nameB}.

PSYCHOMETRISCH KALIBRIERTE DATEN:
- ${nameA}: Orientierung '${orientA.label}' (${orientA.scores}) · Notenschnitt (Antwortstil): Ø ${meanA} / 5
- ${nameB}: Orientierung '${orientB.label}' (${orientB.scores}) · Notenschnitt (Antwortstil): Ø ${meanB} / 5
- Beiderseitige Doppel-5er Leidenschaften (${topMatches.length}): ${topMatches.slice(0, 6).join(', ') || 'Ausgeprägte komplementäre Synergien'}

METHODISCHER HINWEIS ZUR INTERPRETATION:
- Die Daten wurden psychometrisch kalibriert: Kernanker (Zucht, Fesselung, Keuschheit) wurden gewichtet, irrelevante Fragen (Note 0) herausgerechnet und Scham-Markierungen als latente Wünsche interpretiert.
- Wenn ein Partner einen niedrigeren Notenschnitt hat, wertet er selektiver – seine hohen Noten wiegen emotional noch schwerer.

TONFALL & ANWEISUNGEN:
- Sprich ${nameA} und ${nameB} als Paar liebevoll, modern und therapeutisch entlastend an ("Ihr").
- Keine moralische Bewertung, volle Würdigung von Macht- und Hingabe-Bedürfnissen.
- Gehe explizit auf die Konstellation ein (Top/Bottom, Switch/Switch, Top/Top oder Bottom/Bottom).
- In Feld 3 "safety": Betone, wie wichtig strikte Tabus sind, um Schamgefühle behutsam auflösen zu können.
- In Feld 4 "everyday_transfer": Gib alltagstaugliche Ratschläge für Rituale, Micro-D/s, nonverbale Signale und saubere Trennung von Alltagsverantwortung und Schlafzimmerspiel.

Antworte AUSSCHLIESSLICH als valides JSON mit genau diesen vier Feldern:
{
  "synergy": "Eure erotische Grunddynamik & Zusammenspiel von ${nameA} und ${nameB} unter Einbezug der psychometrischen Kalibrierung (3 bis 5 Sätze)",
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

  window.addEventListener('kompass_data_synced', function() {
    renderPairAnalysis();
  });

  window.PairAnalysisEngine = {
    render: renderPairAnalysis,
    generateInterpretation: generatePairInterpretation,
    calculateRankings: calculatePartnerArchetypeRankings,
    determineOrientation: determineCoreOrientation,
    buildGuidance: buildDynamicGuidance,
    loadData: getLoadedPairAnswers
  };

  window.renderPairAnalysis = renderPairAnalysis;
  window.generatePairInterpretation = generatePairInterpretation;

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', renderPairAnalysis);
  } else {
    renderPairAnalysis();
  }

})(window);
