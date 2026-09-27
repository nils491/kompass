/**
 * js/session_discipline.js
 * Modul für den 5-Stufen Bestrafungs- & Disziplinar-Wizard in der Schlafzimmer-Regie.
 * 
 * Qualitäts- & Logik-Standards:
 * - GARANTIERTER DATENZUGRIFF: Lädt Namen und Anatomie verlässlich direkt aus localStorage.
 * - STRIKTE ANATOMISCHE KOMPATIBILITÄT:
 *   * Vulva: Womanizer/Sauger für klitorale Schwellen-Zucht und Ruined Orgasm. Niemals Stroker/Käfig.
 *   * Penis: Penile Schwellen-Quälerei, Ruined Orgasm am Schaft, Keuschheits-Denial, Hodengewichte. Niemals Womanizer.
 * - SACHLICHE RATIONALE: Jede Maßnahme und Zahl (5, 15, 20 Schläge, 3 Min Haltedauer) ist somatisch und physiologisch begründet.
 * - ERWACHSENER BDSM-TONFALL: Keine kitschigen Märchenfloskeln; klare, respektvolle und autoritäre Sprache.
 * - VOLLSTÄNDIGE AUSFÜHRUNGS-ANWEISUNGEN: Präzise Vorgaben für den Top zu Haltung, Rhythmus und Handhabung.
 * - ECHTES WÜRFELN: Ausgeschlossene Optionen wandern in den Discard-Pool und werden nicht im Kreis rotiert.
 */

(function(window) {
  'use strict';

  var wizardCurrentStage = 1;
  var wizardSelectedCategory = 'mouth';
  var wizardCustomReason = '';
  var discardedActionIds = [];
  var discardedPostureIds = [];
  var discardedBondageIds = [];
  var discardedSensoryIds = [];

  var wizardSelections = {
    action: null,
    posture: null,
    bondage: null,
    sensory: null
  };

  function ensureNamesAndAnatomyLoaded() {
    if (!window.names || !window.names.A || !window.names.B) {
      try {
        var rawNames = localStorage.getItem('kompass_names');
        if (rawNames) window.names = JSON.parse(rawNames);
      } catch (e) {}
    }
    if (!window.names) window.names = { A: 'Partner 1', B: 'Partner 2' };

    if (!window.anatomy || !window.anatomy.A || !window.anatomy.B) {
      try {
        var rawAnat = localStorage.getItem('kompass_anatomy');
        if (rawAnat) window.anatomy = JSON.parse(rawAnat);
      } catch (e) {}
    }
    if (!window.anatomy) window.anatomy = { A: 'penis', B: 'vulva' };
  }

  ensureNamesAndAnatomyLoaded();

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
    }, 2800);
  }

  function getGeminiApiKey() {
    var liveInput = document.getElementById('session-gemini-key-input') || 
                    document.getElementById('account-gemini-key');
    if (liveInput && liveInput.value && liveInput.value.trim().length > 10) {
      return liveInput.value.trim();
    }
    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return null;
  }

  function getMasterActionPool(subName, topName) {
    ensureNamesAndAnatomyLoaded();
    var subRole = window.subPartner || 'A';
    var subAnat = (window.anatomy && window.anatomy[subRole]) ? window.anatomy[subRole] : 'vulva';
    var isVulva = (subAnat === 'vulva');

    var rawOwned = (window.HubToys && typeof window.HubToys.getOwnedIds === 'function') ? window.HubToys.getOwnedIds() : [];
    var catalog = window.equipmentCatalog || [];
    var ownedToys = [];
    rawOwned.forEach(function(id) {
      var found = catalog.find(function(c) { return c.id === id; });
      if (found) ownedToys.push(found);
    });

    var sem = (window.ToyCombinatorics && typeof window.ToyCombinatorics.buildSummary === 'function')
      ? window.ToyCombinatorics.buildSummary(ownedToys, subAnat)
      : { clitoral_suction: [], male_stroker: [], male_chastity: [], scrotum_cbt: [], wand: [], vibrator: [], impact: [], clamps: [] };

    var list = [
      // KATEGORIE 1: IMPACT MIT KLAREM ZÄHLPROTOKOLL & PHYSIOLOGISCHER RATIONALE
      {
        id: "action_formal_spank_15",
        cat: ["duty", "mouth"],
        title: "✋ 15 gezielte Handtreffer mit Lautzählung",
        rationale: "15 Treffer: Die ersten 5 aktivieren die Kapillaren und erwärmen das Gewebe. Die Treffer 6 bis 15 setzen die Reizschwelle für die Endorphinausschüttung. Das laute Zählen bindet die Aufmerksamkeit und verhindert mentales Wegdriften.",
        desc: topName + " verabreicht 15 Schläge mit der flachen Hand auf das entblößte Gesäß. " + subName + " zählt jeden Treffer mit einer Sekunde Verzögerung laut und deutlich mit.",
        execution: "Schlagzone ausschließlich auf den großen Gesäßmuskel (Gluteus maximus) konzentrieren. Finger geschlossen halten. Nach jedem Schlag auf das laute Zählen warten. Bei Versprechern wird nicht erhöht, sondern der Rhythmus verlangsamt.",
        ratingBadge: "⚖️ 15 Schläge · Endorphin-Fokus"
      },
      {
        id: "action_warning_spank_5",
        cat: ["posture", "mouth"],
        title: "✋ 5 trockene Warnschläge zur Zentrierung",
        rationale: "5 Treffer: Rein sensorische Intervention. Keine Schmerzkatharsis, sondern ein scharfer Weckruf für das vegetative Nervensystem zur sofortigen Wiederherstellung der mentalen Präsenz.",
        desc: "Fünf kurze, akzentuierte Treffer auf die Sitzbeinhöcker, gefolgt von sofortigem Handauflegen zur Beruhigung.",
        execution: "Die Schläge trocken und präzise setzen. Direkt nach dem 5. Schlag die Handfläche 20 Sekunden flach und fest auflegen, bis der Atem synchronisiert ist.",
        ratingBadge: "⚡ 5 Schläge · Nerven-Fokus"
      },
      {
        id: "action_belt_ritual_20",
        cat: ["duty", "self_discipline"],
        title: "⚡ 20 Schläge mit gefaltetem Ledergürtel",
        rationale: "20 Treffer: Ein formal begrenztes Ritual. Leder erzeugt einen schärferen, oberflächlichen Reiz als die Hand. 20 Schläge sind physisch sicher, erfordern aber klare Haltungskontrolle.",
        desc: topName + " nutzt den gefalteten Ledergürtel. Schläge im 3-Sekunden-Takt gleichmäßig auf beide Pobacken verteilt.",
        execution: "Gürtel doppelt legen, Schnalle fest in der Führungshand halten. Ausschwingen nur aus dem Handgelenk, niemals aus der Schulter. Nierengegend strikt meiden.",
        ratingBadge: "🔥 20 Schläge · Formale Korrektur"
      },
      {
        id: "action_flogger_steady",
        cat: ["duty", "orgasm"],
        title: "🪶 2 Minuten kontinuierlicher Flogger-Rhythmus",
        rationale: "Zeitfenster 2 Minuten: Schnelle, leichte Fransenreize erzeugen eine flächige Hyperämie (Rötung) ohne tiefe Hämatombildung. Dient der sensorischen Überflutung vor weiteren Anweisungen.",
        desc: "Gleichmäßiges, schwirrendes Abstreichen und rhythmische Schläge über Gesäß und Oberschenkelrückseite.",
        execution: "Konstantes Tempo halten (ca. 60–80 Schläge pro Minute). Den Körper des Bottoms dabei scharf beobachten; keine Treffer auf die Kniekehlen.",
        ratingBadge: "⏱️ 2 Min · Reizüberflutung"
      }
    ];

    if (isVulva) {
      // VULVA: Womanizer / Klitorissauger / Wand (STRIKT NUR BEI VULVA)
      var suctionTool = sem.clitoral_suction[0] || (sem.wand[0] ? sem.wand[0] : null);
      if (suctionTool) {
        list.push({
          id: "action_suction_overstim_punish",
          cat: ["orgasm", "duty"],
          title: "⚡ Klitorale Reizüberlastung mit " + suctionTool,
          rationale: "Sensorische Disziplin: Zwingt den Körper, einem extrem intensiven Lustreiz standzuhalten, ohne nachzugeben oder das Becken zu bewegen.",
          desc: topName + " platziert den " + suctionTool + " auf der Klitoris. " + subName + " muss 90 Sekunden regungslos verharren, darf nicht vorstoßen und muss den Atem flach halten.",
          execution: "Gerät auf mittlerer Stufe aufsetzen. Jedes Ausweichzucken führt zu einer kurzen Pause und erneutem Ansetzen. Nach 90 Sekunden schlagartig stoppen.",
          ratingBadge: "🎢 90 Sek · Klitoris-Kontrolle (" + suctionTool + ")"
        });
        list.push({
          id: "action_suction_ruined_punish",
          cat: ["orgasm", "mouth"],
          title: "🥀 Gezielter Orgasmusabbruch (Ruined) mit " + suctionTool,
          rationale: "Machtdemonstration über den Reflex: Entkoppelt den körperlichen Muskelkrampf von der Belohnung. Macht deutlich, wer über den Höhepunkt bestimmt.",
          desc: topName + " treibt " + subName + " mit dem " + suctionTool + " gezielt an den Point of no Return. Beim ersten Muskelzucken wird das Gerät abrupt entfernt; jede Berührung wird untersagt.",
          execution: "Den Schwellenanstieg genau beobachten (Atemstillstand, Oberschenkelspannung). Genau beim ersten Beckenkrampf das Gerät wegnehmen und 'Stillhalten!' befehlen.",
          ratingBadge: "🔒 Macht über den Reflex"
        });
      }
    } else {
      // PENIS: Fleshlight / Stroker / Wand am Frenulum / Keuschheits-Denial (NIEMALS Womanizer!)
      var strokerTool = sem.male_stroker[0] || (sem.wand[0] ? (sem.wand[0] + " an der Eichel") : "gezielte Handberührungen");
      list.push({
        id: "action_penis_denial_punish",
        cat: ["orgasm", "duty"],
        title: "⚡ Penile Schwellen-Quälerei mit " + strokerTool,
        rationale: "Reiz-Aufschub: Härtet die Selbstkontrolle des Mannes ab. Zwingt das vegetative Nervensystem, maximale Erregung auszuhalten, ohne den Point of no Return zu überschreiten.",
        desc: topName + " stimuliert den Penis von " + subName + " mit " + strokerTool + " bis Stufe 9. Beim geringsten Vorstoßen oder Lautbefehl stoppt der Top schlagartig und verbietet jedes Bewegen.",
        execution: "Den Schaft rhythmisch stimulieren, Eichel beobachten. Bei Rötung und Atemstillstand die Hand sofort abnehmen und Blickkontakt einfordern.",
        ratingBadge: "🎢 Schwellen-Disziplin (Penis)"
      });
      list.push({
        id: "action_penis_ruined_punish",
        cat: ["orgasm", "mouth"],
        title: "🥀 Ruined Orgasm am Schaft (Point of no Return)",
        rationale: "Muskelentladung ohne Dopamin: Der Samen tritt rein muskulär ohne befriedigende Reibung aus. Entmachtet die männliche Libido vollständig.",
        desc: topName + " treibt den Penis an den Point of no Return. In der Millisekunde des ersten Ejakulationskrampfs wird jede Berührung gestoppt: " + subName + " darf nicht nachhelfen.",
        execution: "Beim Einsetzen der ersten Kontraktion am Damm/Beckenboden die Hand sofort wegziehen und 'Hände auf den Rücken!' befehlen.",
        ratingBadge: "🔒 Orgasmusentmachtung"
      });

      if (sem.male_chastity.length > 0) {
        list.push({
          id: "action_cage_confinement",
          cat: ["orgasm", "duty"],
          title: "🔒 Keuschheits-Arretierung im " + sem.male_chastity[0],
          rationale: "Vollkommener Entzug der körperlichen Souveränität: Der Penis wird mechanisch verriegelt, sodass jede Erektion schmerzhaft unterbunden wird.",
          desc: topName + " schließt den Penis im " + sem.male_chastity[0] + " ein. Schlüsselgewalt verbleibt beim Top.",
          execution: "Sitz des Käfigs im schlaffen Zustand prüfen, Schloss schließen und den Schlüssel demonstrativ an sich nehmen.",
          ratingBadge: "🔒 Totale Keuschheit"
        });
      }
    }

    list.push(
      {
        id: "action_wall_sit_penance",
        cat: ["posture", "duty"],
        title: "🧱 3 Minuten Wandhocke (Wall-Sit) im 90-Grad-Winkel",
        rationale: "3 Minuten Haltedauer: Nach 90 Sekunden setzt die Laktatbildung in den Quadrizepsmuskeln ein. Die physische Belastung ist gelenkschonend, verlangt aber reine Willenskraft zur Disziplinierung.",
        desc: subName + " lehnt den Rücken flach an die Wand, Oberschenkel waagerecht zum Boden. Die Hände ruhen flach auf dem Kopf.",
        execution: "Prüfen, dass die Knie exakt im 90-Grad-Winkel stehen. Rutscht das Becken nach unten oder heben die Hände ab, wird die Restzeit um 30 Sekunden verlängert.",
        ratingBadge: "⏱️ 3 Min · Isometrische Ausdauer"
      },
      {
        id: "action_ice_contrast_fire",
        cat: ["posture", "orgasm"],
        title: "🧊 Thermischer Kontrast: Eisstreichung & Handauflegen",
        rationale: "Thermorezeptoren-Reiz: Kältereiz verengt die Gefäße schlagartig; das anschließende warme Handauflegen erzeugt ein intensives Brennen und schärft die taktile Wahrnehmung.",
        desc: "Ein Eiswürfel wird 60 Sekunden langsam über die Innenschenkel geführt, unmittelbar gefolgt von festem Handauflegen.",
        execution: "Den Eiswürfel in ständiger Bewegung halten, um Kälteverbrennungen zu vermeiden. Danach sofort die warme Handfläche mit Druck aufpressen.",
        ratingBadge: "❄️🔥 Somatischer Schock"
      },
      {
        id: "action_self_spank_mirror",
        cat: ["self_discipline", "mouth"],
        title: "🪞 20 eigenhändige Schläge vor dem Spiegel",
        rationale: "20 Treffer im Selbstvollzug: Verhindert passive Schonung. Der Bottom muss die physische Korrektur selbst dosieren und den visuellen Blickkontakt halten.",
        desc: subName + " kniet vor dem Spiegel, blickt sich in die Augen und verabreicht sich selbst 20 kräftige Schläge auf das Gesäß.",
        execution: topName + " steht dahinter, korrigiert die Schlagkraft, falls der Bottom zögert, und zählt mit. Zu schwache Schläge zählen nicht.",
        ratingBadge: "🪞 20 Schläge · Selbstüberwindung"
      }
    );

    return list;
  }

  function getMasterPostures(subName) {
    return [
      {
        id: "posture_kneeling_nadu",
        title: "🧎 Strenger Nadu-Kniestand zu Füßen des Tops",
        desc: subName + " kniet aufrecht mit geschlossenen Knien und gestrecktem Rumpf direkt vor dem Sessel des Tops. Die Hände liegen flach auf den Oberschenkeln.",
        execution: "Der Rücken muss vollkommen gerade sein. Kein Absitzen auf den Fersen erlaubt; Blick auf die Brusthöhe des Tops fixieren.",
        badge: "Klassische Demut"
      },
      {
        id: "posture_over_knee",
        title: "🛋️ Über-die-Knie (Over-The-Knee / OTK)",
        desc: subName + " liegt quer über den Oberschenkeln des sitzenden Tops. Das Becken ist leicht nach oben gekippt, die Füße berühren den Boden.",
        execution: "Top legt den linken Unterarm fest über den unteren Rücken des Bottoms zur Arretierung. Gesäß frei exponieren.",
        badge: "Volle Auslieferung"
      },
      {
        id: "posture_bed_edge_90",
        title: "🛏️ 90-Grad-Vorbeuge über die Bettkante",
        desc: subName + " steht barfuß am Boden, beugt den Oberkörper im 90-Grad-Winkel über das Bett. Die Hände greifen die Bettkante.",
        execution: "Knie müssen absolut durchgedrückt bleiben. Fersen stehen fest auf dem Boden; Gesäß nach hinten herausstrecken.",
        badge: "Exponierte Glutealzone"
      },
      {
        id: "posture_hands_behind_head",
        title: "🧍 Standhaltung: Hände im Nacken verschränkt",
        desc: subName + " steht mit schulterbreiten Beinen aufrecht im Raum. Die Finger sind fest im Nacken verschränkt, Ellenbogen nach hinten gezogen.",
        execution: "Brustkorb maximal öffnen. Die Ellenbogen dürfen zu keinem Zeitpunkt nach vorne sinken.",
        badge: "Spannungshaltung"
      }
    ];
  }

  function getMasterBondages(subName) {
    return [
      {
        id: "bondage_wrists_behind_back",
        title: "⛓️ Handgelenke fest hinter dem Rücken arretiert",
        desc: "Die Handgelenke von " + subName + " werden hinter dem Rücken mit Manschetten oder Seil eng zusammengeführt.",
        execution: "Puls an den Daumenballen vor und nach dem Fixieren prüfen. Ein Fingerbreit Spielraum zwischen Fessel und Haut lassen.",
        badge: "Aktionsunfähigkeit"
      },
      {
        id: "bondage_elbow_straps",
        title: "💪 Ellenbogen-Zusammenführung (Box Tie Vorstufe)",
        desc: "Die Oberarme werden dicht hinter dem Rücken arretiert, was die Schulterblätter zusammenpresst und den Brustkorb öffnet.",
        execution: "Nervus radialis an der Oberarm-Außenseite polstern. Bei Kribbeln in den Fingern sofort 1 cm lockern.",
        badge: "Stolze Wehrlosigkeit"
      },
      {
        id: "bondage_thigh_spreader",
        title: "⚡ Schenkelspreizung mit Spreizstange / Fixierband",
        desc: "Die Oberschenkel werden fixiert und auf maximalen Abstand gehalten. Jedes Schließen der Beine ist mechanisch unmöglich.",
        execution: "Knöchel mit breiten Manschetten sichern. Auf symmetrischen Sitz und bequeme Beckenlage achten.",
        badge: "Vollkommene Exposition"
      },
      {
        id: "bondage_free_will",
        title: "✋ Reine Willens-Disziplin (Ohne physische Seile)",
        desc: subName + " wird nicht gefesselt. Das Einhalten der Haltung basiert rein auf mentalem Gehorsam und Selbstkontrolle.",
        execution: "Jede unwillkürliche Bewegung wird sofort verbal korrigiert. Prüft die mentale Festigkeit des Bottoms.",
        badge: "Mentaler Gehorsam"
      }
    ];
  }

  function getMasterSensory(subName) {
    return [
      {
        id: "sensory_blindfold_dark",
        title: "🙈 Vollständige visuelle Deprivation (Augenbinde)",
        desc: subName + " wird die Sicht komplett genommen. Jeder Reiz und Schlag trifft ohne optische Vorwarnung ein.",
        execution: "Binde lichtdicht anlegen. Vor dem ersten Schlag kurz mit der Handfläche den Rücken berühren, um das Hören zu schärfen.",
        badge: "Erwartungsspannung"
      },
      {
        id: "sensory_gag_speechless",
        title: "🤐 Knebelung (Ball-, Ring- oder Tuchknebel)",
        desc: "Verhindert Widerworte und Proteste; erlaubt ausschließlich nonverbale Laute und Kehlkopf-Reaktionen.",
        execution: "Nasenatmung vorab prüfen. Ein nonverbales Notfallsignal (Hand fallenlassen / Klopfen) ist zwingende Pflicht.",
        badge: "Verbaler Entzug"
      },
      {
        id: "sensory_clamps_nipples",
        title: "🔥 Schmerz-Lust-Klammern an den Brustwarzen",
        desc: "Krokodil- oder Clover-Klemmen setzen einen permanenten Druckreiz, der parallel zu den Schlägen pulsiert.",
        execution: "Klemmen erst nach 1 Minute anspannen. Nach maximal 15 Minuten abnehmen und die Durchblutung sanft ausstreichen.",
        badge: "Dauerspannung"
      },
      {
        id: "sensory_none",
        title: "👁️ Volle Sinneswahrnehmung mit Zwangsblickkontakt",
        desc: subName + " behält alle Sinne, muss aber ununterbrochenen Blickkontakt mit dem Top halten.",
        execution: "Jedes Senken der Augen wird sofort untersagt. Erfordert maximale psychologische Standhaftigkeit.",
        badge: "Blickkontakt-Zwang"
      }
    ];
  }

  function openDisciplineModal() {
    ensureNamesAndAnatomyLoaded();
    var m = document.getElementById('modal-incident-discipline');
    if (m) {
      m.classList.remove('hidden');
      m.style.display = 'flex';
    }
    wizardCurrentStage = 1;
    discardedActionIds = [];
    discardedPostureIds = [];
    discardedBondageIds = [];
    discardedSensoryIds = [];
    renderWizardStage();
  }

  function closeDisciplineModal() {
    var m = document.getElementById('modal-incident-discipline');
    if (m) {
      m.classList.add('hidden');
      m.style.display = 'none';
    }
  }

  function selectDisciplineCategory(cat) {
    wizardSelectedCategory = cat;
    ['mouth', 'posture', 'orgasm', 'duty', 'self_discipline'].forEach(function(c) {
      var btn = document.getElementById('cat-btn-' + c);
      if (btn) {
        if (c === cat) {
          btn.className = "p-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn shadow-sm";
        } else {
          btn.className = "p-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-300 touch-btn";
        }
      }
    });
    discardedActionIds = [];
    renderWizardStage();
  }

  function handleCustomReasonInput(val) {
    wizardCustomReason = (val || '').trim();
  }

  function renderWizardStage() {
    ensureNamesAndAnatomyLoaded();
    for (var i = 1; i <= 5; i++) {
      var stageEl = document.getElementById('wizard-stage-' + i);
      if (stageEl) {
        if (i === wizardCurrentStage) stageEl.classList.remove('hidden');
        else stageEl.classList.add('hidden');
      }
    }

    var subTitle = document.getElementById('wizard-stage-subtitle');
    var btnPrev = document.getElementById('btn-prev-wizard');
    var btnNext = document.getElementById('btn-next-wizard');

    var stageLabels = [
      "",
      "Stufe 1 von 5: Maßnahme & Rationale",
      "Stufe 2 von 5: Körperhaltung",
      "Stufe 3 von 5: Arretierung & Fesselung",
      "Stufe 4 von 5: Sensorische Kontrolle",
      "Stufe 5 von 5: Vollzugsprotokoll"
    ];

    if (subTitle) subTitle.innerText = stageLabels[wizardCurrentStage];
    if (btnPrev) btnPrev.style.visibility = (wizardCurrentStage === 1) ? 'hidden' : 'visible';
    if (btnNext) btnNext.style.display = (wizardCurrentStage === 5) ? 'none' : 'block';

    var topName = (window.names && window.names[window.topPartner]) || 'Top';
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';

    if (wizardCurrentStage === 1) renderStage1(subName, topName);
    else if (wizardCurrentStage === 2) renderStage2(subName);
    else if (wizardCurrentStage === 3) renderStage3(subName);
    else if (wizardCurrentStage === 4) renderStage4(subName);
    else if (wizardCurrentStage === 5) renderStage5(subName, topName);
  }

  function renderStage1(subName, topName) {
    var c = document.getElementById('stage-1-cards-container');
    if (!c) return;

    var pool = getMasterActionPool(subName, topName);
    var filtered = pool.filter(function(a) {
      return a.cat.indexOf(wizardSelectedCategory) !== -1 && discardedActionIds.indexOf(a.id) === -1;
    });

    if (filtered.length === 0) {
      discardedActionIds = [];
      filtered = pool.filter(function(a) { return a.cat.indexOf(wizardSelectedCategory) !== -1; });
    }

    var displayItems = filtered.slice(0, 3);
    if (!wizardSelections.action && displayItems.length > 0) {
      wizardSelections.action = displayItems[0];
    }

    c.innerHTML = displayItems.map(function(item) {
      var isSel = wizardSelections.action && wizardSelections.action.id === item.id;
      return `
        <div onclick="SessionDiscipline.selectActionItem('${item.id}')" class="p-3.5 rounded-2xl border text-left cursor-pointer transition touch-btn space-y-1.5 ${isSel ? 'bg-brand-950/60 border-brand-500 shadow-md' : 'theme-panel border-slate-800 text-slate-300 hover:border-slate-700'}">
          <div class="flex items-center justify-between">
            <strong class="text-xs text-white block">${escapeHtml(item.title)}</strong>
            <span class="text-[9.5px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-brand-300 font-bold">${item.ratingBadge}</span>
          </div>
          <p class="text-[10.5px] text-amber-200/90 leading-snug"><strong>Rationale:</strong> ${escapeHtml(item.rationale)}</p>
          <p class="text-[11px] text-slate-300 leading-snug">${escapeHtml(item.desc)}</p>
        </div>
      `;
    }).join('');
  }

  function selectActionItem(id) {
    ensureNamesAndAnatomyLoaded();
    var topName = (window.names && window.names[window.topPartner]) || 'Top';
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
    var pool = getMasterActionPool(subName, topName);
    var found = pool.find(function(a) { return a.id === id; });
    if (found) wizardSelections.action = found;
    renderStage1(subName, topName);
  }

  function renderStage2(subName) {
    var c = document.getElementById('stage-2-cards-container');
    if (!c) return;

    var pool = getMasterPostures(subName);
    var filtered = pool.filter(function(p) { return discardedPostureIds.indexOf(p.id) === -1; });
    if (filtered.length === 0) {
      discardedPostureIds = [];
      filtered = pool;
    }

    var displayItems = filtered.slice(0, 3);
    if (!wizardSelections.posture && displayItems.length > 0) {
      wizardSelections.posture = displayItems[0];
    }

    c.innerHTML = displayItems.map(function(item) {
      var isSel = wizardSelections.posture && wizardSelections.posture.id === item.id;
      return `
        <div onclick="SessionDiscipline.selectPostureItem('${item.id}')" class="p-3.5 rounded-2xl border text-left cursor-pointer transition touch-btn space-y-1.5 ${isSel ? 'bg-indigo-950/60 border-indigo-500 shadow-md' : 'theme-panel border-slate-800 text-slate-300 hover:border-slate-700'}">
          <div class="flex items-center justify-between">
            <strong class="text-xs text-white block">${escapeHtml(item.title)}</strong>
            <span class="text-[9.5px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-indigo-300 font-bold">${item.badge}</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-snug">${escapeHtml(item.desc)}</p>
          <p class="text-[10px] text-slate-400 leading-snug"><strong>Ausführung:</strong> ${escapeHtml(item.execution)}</p>
        </div>
      `;
    }).join('');
  }

  function selectPostureItem(id) {
    ensureNamesAndAnatomyLoaded();
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
    var pool = getMasterPostures(subName);
    var found = pool.find(function(p) { return p.id === id; });
    if (found) wizardSelections.posture = found;
    renderStage2(subName);
  }

  function renderStage3(subName) {
    var c = document.getElementById('stage-3-cards-container');
    if (!c) return;

    var pool = getMasterBondages(subName);
    var filtered = pool.filter(function(b) { return discardedBondageIds.indexOf(b.id) === -1; });
    if (filtered.length === 0) {
      discardedBondageIds = [];
      filtered = pool;
    }

    var displayItems = filtered.slice(0, 3);
    if (!wizardSelections.bondage && displayItems.length > 0) {
      wizardSelections.bondage = displayItems[0];
    }

    c.innerHTML = displayItems.map(function(item) {
      var isSel = wizardSelections.bondage && wizardSelections.bondage.id === item.id;
      return `
        <div onclick="SessionDiscipline.selectBondageItem('${item.id}')" class="p-3.5 rounded-2xl border text-left cursor-pointer transition touch-btn space-y-1.5 ${isSel ? 'bg-purple-950/60 border-purple-500 shadow-md' : 'theme-panel border-slate-800 text-slate-300 hover:border-slate-700'}">
          <div class="flex items-center justify-between">
            <strong class="text-xs text-white block">${escapeHtml(item.title)}</strong>
            <span class="text-[9.5px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-purple-300 font-bold">${item.badge}</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-snug">${escapeHtml(item.desc)}</p>
          <p class="text-[10px] text-slate-400 leading-snug"><strong>Ausführung:</strong> ${escapeHtml(item.execution)}</p>
        </div>
      `;
    }).join('');
  }

  function selectBondageItem(id) {
    ensureNamesAndAnatomyLoaded();
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
    var pool = getMasterBondages(subName);
    var found = pool.find(function(b) { return b.id === id; });
    if (found) wizardSelections.bondage = found;
    renderStage3(subName);
  }

  function renderStage4(subName) {
    var c = document.getElementById('stage-4-cards-container');
    if (!c) return;

    var pool = getMasterSensory(subName);
    var filtered = pool.filter(function(s) { return discardedSensoryIds.indexOf(s.id) === -1; });
    if (filtered.length === 0) {
      discardedSensoryIds = [];
      filtered = pool;
    }

    var displayItems = filtered.slice(0, 3);
    if (!wizardSelections.sensory && displayItems.length > 0) {
      wizardSelections.sensory = displayItems[0];
    }

    c.innerHTML = displayItems.map(function(item) {
      var isSel = wizardSelections.sensory && wizardSelections.sensory.id === item.id;
      return `
        <div onclick="SessionDiscipline.selectSensoryItem('${item.id}')" class="p-3.5 rounded-2xl border text-left cursor-pointer transition touch-btn space-y-1.5 ${isSel ? 'bg-teal-950/60 border-teal-500 shadow-md' : 'theme-panel border-slate-800 text-slate-300 hover:border-slate-700'}">
          <div class="flex items-center justify-between">
            <strong class="text-xs text-white block">${escapeHtml(item.title)}</strong>
            <span class="text-[9.5px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-mono text-teal-300 font-bold">${item.badge}</span>
          </div>
          <p class="text-[11px] text-slate-300 leading-snug">${escapeHtml(item.desc)}</p>
          <p class="text-[10px] text-slate-400 leading-snug"><strong>Ausführung:</strong> ${escapeHtml(item.execution)}</p>
        </div>
      `;
    }).join('');
  }

  function selectSensoryItem(id) {
    ensureNamesAndAnatomyLoaded();
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
    var pool = getMasterSensory(subName);
    var found = pool.find(function(s) { return s.id === id; });
    if (found) wizardSelections.sensory = found;
    renderStage4(subName);
  }

  function renderStage5(subName, topName) {
    var c = document.getElementById('summary-discipline-breakdown');
    if (!c) return;

    var act = wizardSelections.action || { title: "Spanking", rationale: "Standard", execution: "Flach mit der Hand" };
    var pos = wizardSelections.posture || { title: "Kniestand", execution: "Aufrecht" };
    var bon = wizardSelections.bondage || { title: "Keine Fesseln", execution: "Freier Wille" };
    var sen = wizardSelections.sensory || { title: "Blickkontakt", execution: "Augen offen" };

    var reasonText = wizardCustomReason || "Fehlverhalten im Spiel / Verletzung der Haltungsregeln";

    c.innerHTML = `
      <div class="space-y-3">
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Festgestellter Anlass:</span>
          <strong class="text-xs text-amber-300 block">„${escapeHtml(reasonText)}“</strong>
        </div>

        <div class="space-y-2 text-xs">
          <!-- 1. MASSNAHME -->
          <div class="p-3 rounded-xl bg-brand-950/40 border border-brand-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-brand-300 text-xs">1. Disziplinarmaßnahme:</strong>
              <span class="text-[9px] font-mono text-slate-400">Gluteus / Physis</span>
            </div>
            <strong class="text-white block text-xs">${escapeHtml(act.title)}</strong>
            <p class="text-[10.5px] text-slate-300 leading-snug">${escapeHtml(act.rationale || '')}</p>
            <div class="p-2 rounded-lg bg-slate-900/80 border border-brand-900/60 text-[10px] text-slate-300">
              <strong class="text-brand-200">Arbeitsanweisung für ${escapeHtml(topName)}:</strong> ${escapeHtml(act.execution || '')}
            </div>
          </div>

          <!-- 2. KÖRPERHALTUNG -->
          <div class="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-indigo-300 text-xs">2. Vorgeschriebene Körperhaltung:</strong>
              <span class="text-[9px] font-mono text-slate-400">Position</span>
            </div>
            <strong class="text-white block text-xs">${escapeHtml(pos.title)}</strong>
            <div class="p-2 rounded-lg bg-slate-900/80 border border-indigo-900/60 text-[10px] text-slate-300">
              <strong class="text-indigo-200">Arbeitsanweisung für ${escapeHtml(topName)}:</strong> ${escapeHtml(pos.execution || '')}
            </div>
          </div>

          <!-- 3. ARRETIERUNG -->
          <div class="p-3 rounded-xl bg-purple-950/40 border border-purple-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-purple-300 text-xs">3. Arretierung & Fesselung:</strong>
              <span class="text-[9px] font-mono text-slate-400">Begrenzung</span>
            </div>
            <strong class="text-white block text-xs">${escapeHtml(bon.title)}</strong>
            <div class="p-2 rounded-lg bg-slate-900/80 border border-purple-900/60 text-[10px] text-slate-300">
              <strong class="text-purple-200">Arbeitsanweisung für ${escapeHtml(topName)}:</strong> ${escapeHtml(bon.execution || '')}
            </div>
          </div>

          <!-- 4. SENSORIK -->
          <div class="p-3 rounded-xl bg-teal-950/40 border border-teal-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-teal-300 text-xs">4. Sensorische Kontrolle:</strong>
              <span class="text-[9px] font-mono text-slate-400">Reizfokus</span>
            </div>
            <strong class="text-white block text-xs">${escapeHtml(sen.title)}</strong>
            <div class="p-2 rounded-lg bg-slate-900/80 border border-teal-900/60 text-[10px] text-slate-300">
              <strong class="text-teal-200">Arbeitsanweisung für ${escapeHtml(topName)}:</strong> ${escapeHtml(sen.execution || '')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function rerollWizardStage() {
    if (wizardCurrentStage === 1) {
      if (wizardSelections.action) discardedActionIds.push(wizardSelections.action.id);
      wizardSelections.action = null;
    } else if (wizardCurrentStage === 2) {
      if (wizardSelections.posture) discardedPostureIds.push(wizardSelections.posture.id);
      wizardSelections.posture = null;
    } else if (wizardCurrentStage === 3) {
      if (wizardSelections.bondage) discardedBondageIds.push(wizardSelections.bondage.id);
      wizardSelections.bondage = null;
    } else if (wizardCurrentStage === 4) {
      if (wizardSelections.sensory) discardedSensoryIds.push(wizardSelections.sensory.id);
      wizardSelections.sensory = null;
    }
    renderWizardStage();
    showToast("Neue Optionen geladen 🎲");
  }

  function nextWizardStage() {
    if (wizardCurrentStage < 5) {
      wizardCurrentStage++;
      renderWizardStage();
    }
  }

  function prevWizardStage() {
    if (wizardCurrentStage > 1) {
      wizardCurrentStage--;
      renderWizardStage();
    }
  }

  function applyDisciplineProtocol() {
    ensureNamesAndAnatomyLoaded();
    var topName = (window.names && window.names[window.topPartner]) || 'Top';
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';

    var act = wizardSelections.action ? wizardSelections.action.title : "Disziplinierung";
    var reason = wizardCustomReason ? ` (${wizardCustomReason})` : "";

    var logEntry = {
      type: "discipline",
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      label: `⚖️ Strafe angeordnet: ${act}${reason}`
    };

    if (window.currentSessionLog && Array.isArray(window.currentSessionLog)) {
      window.currentSessionLog.push(logEntry);
    }

    closeDisciplineModal();
    showToast("Disziplinar-Maßnahme ins Logbuch übernommen ✓");

    if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      var speech = `${subName}. Haltung einnehmen. ${act} wird jetzt vollzogen.`;
      window.SessionVoice.play(speech);
    }
  }

  async function generateAiDisciplineProposal() {
    ensureNamesAndAnatomyLoaded();
    var topName = (window.names && window.names[window.topPartner]) || 'Top';
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
    var subRole = window.subPartner || 'A';
    var subAnat = (window.anatomy && window.anatomy[subRole]) ? window.anatomy[subRole] : 'vulva';

    var apiKey = getGeminiApiKey();
    if (!apiKey) {
      showToast("⚠️ Kein Gemini API-Key hinterlegt. Bitte trage deinen Key in den Einstellungen ein.");
      return;
    }

    var rawOwned = (window.HubToys && typeof window.HubToys.getOwnedIds === 'function') ? window.HubToys.getOwnedIds() : [];
    var catalog = window.equipmentCatalog || [];
    var ownedToys = [];
    rawOwned.forEach(function(id) {
      var found = catalog.find(function(c) { return c.id === id; });
      if (found) ownedToys.push(found);
    });

    var briefing = (window.ToyCombinatorics && typeof window.ToyCombinatorics.generateAiPromptBriefing === 'function')
      ? window.ToyCombinatorics.generateAiPromptBriefing(ownedToys, subAnat)
      : ("Anatomie des Bottoms: " + subAnat);

    var reasonText = wizardCustomReason || "Regelverstoß / Unaufmerksamkeit im Spiel";

    showToast("⏳ Berechne maßgeschneiderten Disziplinar-Vorschlag...");

    var prompt = `Du bist ein erfahrener, psychologisch präziser BDSM-Regisseur für ein einvernehmliches Paar (${topName} als Top, ${subName} als Bottom).
Erstelle für folgendes Vergehen eine ernste, erwachsene und anatomisch fehlerfreie Disziplinar-Sequenz.

ANLASS: „${reasonText}“
${briefing}

STRIKTE QUALITÄTS- & LOGIK-VORGABEN:
- Keine Märchenonkel-Floskeln, kein Kitsch, keine Schwulst.
- Ernsthafter, direkter und moderner BDSM-Kontext zwischen einvernehmlichen Erwachsenen.
- Zahlen (z. B. 15 Schläge oder 3 Minuten) MÜSSEN physiologisch und somatisch begründet sein (Kapillardurchblutung, Endorphinausschüttung, Laktatschwelle).
- STRIKTE ANATOMISCHE REGEL: Ein Womanizer/Klitorissauger darf NIEMALS an einem Penis-Träger angewendet werden! Bei Männern nur Penissleeve, Wand auf Eichel, Hodengewicht oder Hand.

Antworte AUSSCHLIESSLICH als valides JSON:
{
  "actionTitle": "Kurzer Titel der Maßnahme mit Icon",
  "actionRationale": "Somatische Begründung der Wiederholungszahl / Dauer (2 Sätze)",
  "actionDesc": "Genaue Beschreibung des Vorgangs",
  "actionExecution": "Konkrete Arbeitsanweisung für ${topName} (Griff, Schlagzone, Rhythmus)",
  "postureTitle": "Körperhaltung mit Icon",
  "postureDesc": "Genaue Haltungsanweisung",
  "postureExecution": "Arbeitsanweisung für ${topName} zur Haltungskontrolle",
  "bondageTitle": "Fesselung mit Icon",
  "bondageDesc": "Genaue Arretierung",
  "bondageExecution": "Sicherheits- & Arbeitsanweisung für ${topName}",
  "sensoryTitle": "Sensorik / Kontrolle mit Icon",
  "sensoryDesc": "Genaue Sinnesbeeinflussung",
  "sensoryExecution": "Arbeitsanweisung für ${topName}",
  "spokenCommand": "Ein einziger strenger, autoritärer Satz, den ${topName} wörtlich zu ${subName} spricht"
}`;

    var candidateModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
    var resultObj = null;

    for (var i = 0; i < candidateModels.length; i++) {
      var model = candidateModels[i];
      try {
        var resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
          })
        });

        if (resp.ok) {
          var resData = await resp.json();
          var rawJson = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          var parsed = null;
          try {
            parsed = JSON.parse(rawJson);
          } catch (pe) {
            var match = rawJson.match(/\{[\s\S]*\}/);
            parsed = match ? JSON.parse(match[0]) : null;
          }

          if (parsed && parsed.actionTitle && parsed.actionExecution) {
            resultObj = parsed;
            break;
          }
        }
      } catch (e) {}
    }

    if (resultObj) {
      wizardSelections.action = {
        id: "ai_action_" + Date.now(),
        title: resultObj.actionTitle,
        rationale: resultObj.actionRationale,
        desc: resultObj.actionDesc,
        execution: resultObj.actionExecution,
        ratingBadge: "✨ KI-Präzision"
      };

      wizardSelections.posture = {
        id: "ai_posture_" + Date.now(),
        title: resultObj.postureTitle,
        desc: resultObj.postureDesc,
        execution: resultObj.postureExecution,
        badge: "KI-Haltung"
      };

      wizardSelections.bondage = {
        id: "ai_bondage_" + Date.now(),
        title: resultObj.bondageTitle,
        desc: resultObj.bondageDesc,
        execution: resultObj.bondageExecution,
        badge: "KI-Begrenzung"
      };

      wizardSelections.sensory = {
        id: "ai_sensory_" + Date.now(),
        title: resultObj.sensoryTitle,
        desc: resultObj.sensoryDesc,
        execution: resultObj.sensoryExecution,
        badge: "KI-Fokus"
      };

      wizardCurrentStage = 5;
      renderWizardStage();
      showToast("✓ Maßgeschneidertes Disziplinar-Protokoll berechnet!");

      if (resultObj.spokenCommand && window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
        window.SessionVoice.play(resultObj.spokenCommand);
      }
    } else {
      showToast("⚠️ KI-Berechnung nicht möglich. Bitte Fallback-Optionen nutzen.");
    }
  }

  window.SessionDiscipline = {
    open: openDisciplineModal,
    close: closeDisciplineModal,
    selectCategory: selectDisciplineCategory,
    handleReasonInput: handleCustomReasonInput,
    selectActionItem: selectActionItem,
    selectPostureItem: selectPostureItem,
    selectBondageItem: selectBondageItem,
    selectSensoryItem: selectSensoryItem,
    rerollStage: rerollWizardStage,
    nextStage: nextWizardStage,
    prevStage: prevWizardStage,
    apply: applyDisciplineProtocol,
    generateAiProposal: generateAiDisciplineProposal
  };

  window.openDisciplineModal = openDisciplineModal;
  window.closeDisciplineModal = closeDisciplineModal;
  window.selectDisciplineCategory = selectDisciplineCategory;
  window.handleCustomReasonInput = handleCustomReasonInput;
  window.rerollWizardStage = rerollWizardStage;
  window.nextWizardStage = nextWizardStage;
  window.prevWizardStage = prevWizardStage;
  window.applyDisciplineProtocol = applyDisciplineProtocol;
  window.generateAiDisciplineProposal = generateAiDisciplineProposal;

})(window);
