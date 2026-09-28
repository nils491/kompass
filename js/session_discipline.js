/**
 * js/session_discipline.js
 * Modul für den 5-Stufen Bestrafungs- & Disziplinar-Wizard in der Schlafzimmer-Regie.
 * 
 * Qualitäts- & Tonfall-Standards:
 * - EMOTIONAL & LEICHT VERSTÄNDLICH: Psychologische Tiefe statt kühler Medizinsprache.
 *   Erklärt klar, wie Rituale den Kopf befreien, Schuld abtragen und Nähe schenken.
 * - GARANTIERTER DATENZUGRIFF: Verlässlicher Abruf von Namen und Anatomie aus localStorage.
 * - STRIKTE ANATOMISCHE KOMPATIBILITÄT:
 *   * Vulva: Womanizer/Sauger für klitorale Schwellen-Zucht und Ruined Orgasm. Niemals Stroker/Käfig.
 *   * Penis: Penile Schwellen-Quälerei, Ruined Orgasm am Schaft, Keuschheits-Denial, Hodengewichte. Niemals Womanizer.
 * - SOUVERÄNER BDSM-TONFALL: Respektvoll, autoritär, erotisch und einvernehmlich (SSC).
 * - VOLLSTÄNDIGE ANWEISUNGEN: Klare Führungshilfen für den Top zu Haltung, Rhythmus und Halt.
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
      {
        id: "action_formal_spank_15",
        cat: ["duty", "mouth"],
        title: "✋ 15 gezielte Schläge mit andächtigem Mitzählen",
        rationale: "15 Treffer zum Loslassen: Die ersten 5 Schläge holen den Geist aus dem Alltagstrott direkt ins Hier und Jetzt. Die weiteren Treffer lösen die innere Anspannung, tilgen das schlechte Gewissen körperlich und schenken die heilsame Erleichterung, sich ganz in die Hände des Tops fallenzulassen.",
        desc: topName + " verabreicht 15 beherzte, gleichmäßige Schläge mit der flachen Hand auf das Gesäß. " + subName + " zählt jeden Treffer andächtig und laut mit.",
        execution: "Finger geschlossen halten, gleichmäßigen Rhythmus aus dem Handgelenk führen. Nach jedem Schlag auf das Mitzählen warten. Bei Zögern den Rhythmus verlangsamen, um die Hingabe zu vertiefen.",
        ratingBadge: "⚖️ 15 Schläge · Befreiende Sühne"
      },
      {
        id: "action_warning_spank_5",
        cat: ["posture", "mouth"],
        title: "✋ 5 trockene Warnschläge zur Zentrierung",
        rationale: "Ein klarer, liebevoller Weckruf: Keine schwere Strafe, sondern eine unmissverständliche Erinnerung daran, wer im Raum führt und Halt gibt. Schüttelt Gedanken ab und schenkt sofortigen Fokus.",
        desc: "Fünf kurze, akzentuierte Treffer auf die Sitzfläche, unmittelbar gefolgt von warmem, festem Handauflegen.",
        execution: "Die Schläge trocken und präzise setzen. Direkt nach dem 5. Schlag die Handfläche 20 Sekunden flach und fest auflegen, bis der Atem von " + subName + " ruhig und synchron wird.",
        ratingBadge: "⚡ 5 Schläge · Schneller Fokus"
      },
      {
        id: "action_belt_ritual_20",
        cat: ["duty", "self_discipline"],
        title: "⚡ 20 Schläge mit gefaltetem Ledergürtel",
        rationale: "Ein formelles Übergangs-Ritual: Der klare Klang und das brennende Leder fordern pure Haltung. Es befreit den Bottom von der Last, perfekt sein zu müssen – der Schmerz begleicht die Verfehlung und stiftet tiefe innere Ruhe.",
        desc: topName + " nutzt den gefalteten Ledergürtel. Die Treffer verteilen sich im 3-Sekunden-Takt gleichmäßig auf beide Pobacken.",
        execution: "Gürtel doppelt nehmen, Schnalle fest in der Hand umschließen. Schläge aus dem Handgelenk führen; Nieren und Steißbein strikt meiden.",
        ratingBadge: "🔥 20 Schläge · Würdevolles Ritual"
      },
      {
        id: "action_flogger_steady",
        cat: ["duty", "orgasm"],
        title: "🪶 2 Minuten kontinuierlicher Flogger-Rhythmus",
        rationale: "Sinnliche Reizüberflutung: Das schwirrende Leder hüllt die Haut in eine wohlige Hitzewelle. Der Kopf schaltet ab, das Gedankenkarussell verstummt und macht Platz für reine Hingabe.",
        desc: "Rhythmisches, schwirrendes Abstreichen und federnde Schläge über Gesäß und Oberschenkelrückseite.",
        execution: "Ein meditatives, konstantes Tempo halten (ca. 60–80 Schläge pro Minute). Den Körper des Partners achtsam beobachten und Kniekehlen frei lassen.",
        ratingBadge: "⏱️ 2 Min · Gedankenstille"
      }
    ];

    if (isVulva) {
      var suctionTool = sem.clitoral_suction[0] || (sem.wand[0] ? sem.wand[0] : null);
      if (suctionTool) {
        list.push({
          id: "action_suction_overstim_punish",
          cat: ["orgasm", "duty"],
          title: "⚡ Klitorale Schwellen-Geduld mit " + suctionTool,
          rationale: "Sinnliche Demut: Zwingt den Körper, einer überwältigenden Welle der Lust standzuhalten, ohne unruhig vorzustoßen. Eine zutiefst erotische Schulung von Vertrauen und Geduld.",
          desc: topName + " setzt den " + suctionTool + " sanft auf die Klitoris. " + subName + " muss 90 Sekunden stillhalten, darf dem Reiz nicht ausweichen und muss den Blick ruhig halten.",
          execution: "Gerät auf mittlerer Stufe aufsetzen. Jedes Ausweichzucken führt zu einer kurzen Pause und neuem Ansetzen. Nach 90 Sekunden abrupt stoppen.",
          ratingBadge: "🎢 90 Sek · Ergebene Geduld"
        });
        list.push({
          id: "action_suction_ruined_punish",
          cat: ["orgasm", "mouth"],
          title: "🥀 Gezielter Orgasmusabbruch (Ruined) mit " + suctionTool,
          rationale: "Hingabe an die Regie: Der Höhepunkt verpufft im entscheidenden Moment. Das entkoppelt den Genuss vom Zwang zur schnellen Erlösung und beweist, wer souverän über die Lust wacht.",
          desc: topName + " treibt " + subName + " mit dem " + suctionTool + " an die Grenze. Beim ersten unwillkürlichen Beckenkrampf wird das Gerät sofort entfernt und jede Berührung untersagt.",
          execution: "Den Schwellenanstieg aufmerksam beobachten. Genau beim ersten echten Krampf das Gerät wegnehmen und sanft, aber unmissverständlich 'Stillhalten!' befehlen.",
          ratingBadge: "🔒 Sanfte Entmachtung"
        });
      }
    } else {
      var strokerTool = sem.male_stroker[0] || (sem.wand[0] ? (sem.wand[0] + " an der Eichel") : "gezielte Handberührungen");
      list.push({
        id: "action_penis_denial_punish",
        cat: ["orgasm", "duty"],
        title: "⚡ Penile Schwellen-Zucht mit " + strokerTool,
        rationale: "Befreiung vom Triebdruck: Bringt den Mann an den Rand des Kontrollverlusts und zwingt ihn innezuhalten. Schult eiserne Selbstbeherrschung und richtet die volle Aufmerksamkeit auf die Partnerin.",
        desc: topName + " stimuliert den Penis von " + subName + " mit " + strokerTool + " bis zur Schwelle. Beim leisesten Vorstoßen stoppt die Hand und verlangt absolute Reglosigkeit.",
        execution: "Den Schaft rhythmisch umschließen. Wenn die Atmung stockt, die Hand sofort abnehmen, den Atem synchronisieren und tiefen Blickkontakt fordern.",
        ratingBadge: "🎢 Schwellen-Hingabe"
      });
      list.push({
        id: "action_penis_ruined_punish",
        cat: ["orgasm", "mouth"],
        title: "🥀 Ruined Orgasm am Schaft (Point of no Return)",
        rationale: "Süße Entmachtung: Das Glied entlädt sich rein muskulär ohne belohnende Reibung. Nimmt dem Mann das fordernde Ego und hinterlässt eine tiefe, intime Ergebenheit.",
        desc: topName + " führt den Penis an den Point of no Return. Beim ersten Krampfen zieht der Top die Hände vollständig zurück: " + subName + " darf nicht nachhelfen.",
        execution: "Genau bei der ersten Beckenbodenkontraktion die Hand wegnehmen und 'Hände flach auf die Oberschenkel!' gebieten.",
        ratingBadge: "🔒 Reine Ergebung"
      });

      if (sem.male_chastity.length > 0) {
        list.push({
          id: "action_cage_confinement",
          cat: ["orgasm", "duty"],
          title: "🔒 Keuschheits-Verwahrung im " + sem.male_chastity[0],
          rationale: "Vollkommene Abgabe der Kontrolle: Der Mann übergibt die Verantwortung über seine Lust vollständig in die Hände der Partnerin. Befreit vom Zwang zur eigenen Befriedigung.",
          desc: topName + " schließt den Penis im " + sem.male_chastity[0] + " ein. Der Schlüssel verbleibt sichtbar beim Top.",
          execution: "Sitz des Käfigs im schlaffen Zustand prüfen, Schloss verriegeln und den Schlüssel demonstrativ an einer Halskette tragen.",
          ratingBadge: "🔒 Volles Vertrauen"
        });
      }
    }

    list.push(
      {
        id: "action_wall_sit_penance",
        cat: ["posture", "duty"],
        title: "🧱 3 Minuten Wandhocke (Wall-Sit) im 90-Grad-Winkel",
        rationale: "Stille innere Disziplin: Eine ehrliche Prüfung der Willenskraft ohne Schläge. Das Brennen in den Oberschenkeln erdet den Geist und lässt allen Stolz und Trotz verfliegen.",
        desc: subName + " lehnt den Rücken flach an die Wand, Oberschenkel waagerecht zum Boden. Die Hände ruhen andächtig auf dem Kopf.",
        execution: "Prüfen, dass die Knie stabil im rechten Winkel stehen. Rutscht das Becken nach unten, erinnert der Top mit ruhiger Stimme an die Haltung.",
        ratingBadge: "⏱️ 3 Min · Reine Willenskraft"
      },
      {
        id: "action_ice_contrast_fire",
        cat: ["posture", "orgasm"],
        title: "🧊 Eisstreichung & warmes Handauflegen",
        rationale: "Sinnlicher Schock zur Erdung: Die prickelnde Kälte holt den Körper sofort aus Gedankenkreisen heraus. Das anschließende warme Handauflegen schenkt Geborgenheit und tiefe Erleichterung.",
        desc: "Ein Eiswürfel wird langsam über die Innenschenkel geführt, unmittelbar gefolgt von festem, wärmendem Handauflegen.",
        execution: "Den Eiswürfel in ständiger sanfter Bewegung halten. Anschließend sofort die warme Handfläche mit liebevollem Druck aufpressen.",
        ratingBadge: "❄️🔥 Sinnliche Erdung"
      },
      {
        id: "action_self_spank_mirror",
        cat: ["self_discipline", "mouth"],
        title: "🪞 20 eigenhändige Schläge vor dem Spiegel",
        rationale: "Ehrliche Selbstbegegnung: Verhindert bequemes Wegdriften. Der Bottom vollzieht die eigene Korrektur aktiv und muss sich dabei selbst mit all seinen Gefühlen im Spiegel annehmen.",
        desc: subName + " kniet vor dem Spiegel, blickt sich aufrichtig in die Augen und verabreicht sich selbst 20 hörbare Schläge auf das Gesäß.",
        execution: topName + " steht würdevoll dahinter, korrigiert die Entschlossenheit der Schläge und zählt laut mit. Zu zögerliche Schläge zählen nicht.",
        ratingBadge: "🪞 20 Schläge · Mutige Selbsterkenntnis"
      }
    );

    return list;
  }

  function getMasterPostures(subName) {
    return [
      {
        id: "posture_kneeling_nadu",
        title: "🧎 Nadu-Kniestand zu Füßen des Tops",
        desc: subName + " kniet aufrecht mit geschlossenen Knien und gestreckter Wirbelsäule direkt vor dem Sessel des Tops. Die Hände ruhen flach auf den Schenkeln.",
        execution: "Der Oberkörper bleibt stolz und aufgerichtet, der Blick ruht respektvoll auf Brusthöhe des Tops. Kein lässiges Absitzen auf den Fersen.",
        badge: "Klassische Demut"
      },
      {
        id: "posture_over_knee",
        title: "🛋️ Über-die-Knie (Over-The-Knee / OTK)",
        desc: subName + " liegt quer über den Oberschenkeln des sitzenden Tops. Das Becken ist leicht angehoben, die Beine ruhen am Boden.",
        execution: "Top legt den linken Arm schützend und fest über den unteren Rücken zur Arretierung. Das Gesäß ist völlig frei und wehrlos exponiert.",
        badge: "Volle Geborgenheit"
      },
      {
        id: "posture_bed_edge_90",
        title: "🛏️ 90-Grad-Vorbeuge über die Bettkante",
        desc: subName + " steht barfuß am Boden, beugt den Oberkörper im rechten Winkel über das Bett und umfasst fest die Bettkante.",
        execution: "Die Knie bleiben gestreckt, die Fersen stehen fest auf dem Boden. Das Gesäß wird dem Top aufrecht und ohne Ausweichen dargeboten.",
        badge: "Vollkommene Exposition"
      },
      {
        id: "posture_hands_behind_head",
        title: "🧍 Standhaltung: Hände im Nacken verschränkt",
        desc: subName + " steht aufrecht und schulterbreit im Raum. Die Finger sind fest im Nacken verschränkt, die Ellenbogen weit nach hinten gezogen.",
        execution: "Der Brustkorb bleibt weit geöffnet. Jedes Vorfallen der Ellenbogen korrigiert der Top mit einer kurzen Berührung.",
        badge: "Spannungshaltung"
      }
    ];
  }

  function getMasterBondages(subName) {
    return [
      {
        id: "bondage_wrists_behind_back",
        title: "⛓️ Hände hinter dem Rücken arretiert",
        desc: "Die Handgelenke von " + subName + " werden hinter dem Rücken mit weichen Manschetten oder einem Tuch sicher zusammengeführt.",
        execution: "Vor und nach dem Schließen den Puls an den Handgelenken prüfen. Immer einen Fingerbreit Spielraum zwischen Band und Haut lassen.",
        badge: "Befreiende Wehrlosigkeit"
      },
      {
        id: "bondage_elbow_straps",
        title: "💪 Ellenbogen-Zusammenführung (Stolze Haltung)",
        desc: "Die Oberarme werden dicht hinter dem Rücken arretiert. Das öffnet den Brustkorb weit und verhindert jedes Schützen des Körpers.",
        execution: "Druckstellen weich polstern. Bei Kribbeln oder Kältegefühl in den Händen die Manschette sofort um einen Zentimeter lockern.",
        badge: "Aufrechte Hingabe"
      },
      {
        id: "bondage_thigh_spreader",
        title: "⚡ Schenkelspreizung mit Spreizband",
        desc: "Die Oberschenkel werden fixiert und auf sicherem Abstand gehalten. Ein Schließen der Beine aus Scham ist unmöglich.",
        execution: "Die Knöchel mit breiten Bändern sichern. Auf eine entspannte Lage des Beckens achten, damit keine Zerrung entsteht.",
        badge: "Verletzliche Offenheit"
      },
      {
        id: "bondage_free_will",
        title: "✋ Reine Willens-Disziplin (Ohne physische Seile)",
        desc: subName + " wird nicht gefesselt. Das Halten der Position basiert allein auf innerer Festigkeit, Gehorsam und Vertrauen.",
        execution: "Jede unwillkürliche Bewegung wird sofort mit einem ruhigen Wort korrigiert. Prüft die mentale Hingabe des Bottoms.",
        badge: "Innerer Gehorsam"
      }
    ];
  }

  function getMasterSensory(subName) {
    return [
      {
        id: "sensory_blindfold_dark",
        title: "🙈 Sanfte Augenbinde (Dunkelheit)",
        desc: subName + " wird die Sicht genommen. Jeder Reiz, jedes Wort und jede Berührung trifft ohne optische Vorwarnung intensiver ein.",
        execution: "Binde lichtdicht und bequem anlegen. Vor der ersten Berührung kurz mit der Handfläche den Rücken streichen, um das Vertrauen zu stärken.",
        badge: "Spannung im Dunkeln"
      },
      {
        id: "sensory_gag_speechless",
        title: "🤐 Knebelung (Ball- oder Tuchknebel)",
        desc: "Verhindert Widersprüche und Ausreden. Lässt nur noch ehrliche Kehlkopflaute und das Atmen zu.",
        execution: "Freie Nasenatmung vorab sicherstellen! Ein eindeutiges nonverbales Signal (zweimaliges Klopfen oder Gegenstand fallenlassen) ist Pflicht.",
        badge: "Stille Ergebung"
      },
      {
        id: "sensory_clamps_nipples",
        title: "🔥 Schmerz-Lust-Klemmen an den Brustwarzen",
        desc: "Sanfte Klemmen setzen einen pulsierenden Druckreiz, der parallel zu den Worten und Schlägen pocht.",
        execution: "Klemmen erst nach einer Minute sanft nachstellen. Nach maximal 15 Minuten abnehmen und die Durchblutung liebevoll ausstreichen.",
        badge: "Dauerspannung"
      },
      {
        id: "sensory_none",
        title: "👁️ Volle Sicht mit festem Blickkontakt-Zwang",
        desc: subName + " behält alle Sinne, muss dem Top aber ununterbrochen fest in die Augen blicken.",
        execution: "Jedes Ausweichen der Augen mit einem ruhigen 'Augen zu mir' unterbinden. Vertieft die emotionale Nähe enorm.",
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
      "Stufe 1 von 5: Maßnahme & Bedeutung",
      "Stufe 2 von 5: Körperhaltung",
      "Stufe 3 von 5: Fesselung & Halt",
      "Stufe 4 von 5: Sensorischer Fokus",
      "Stufe 5 von 5: Vollzugs-Protokoll"
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
          <p class="text-[10.5px] text-amber-200/90 leading-snug"><strong>Bedeutung für euch:</strong> ${escapeHtml(item.rationale)}</p>
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
          <p class="text-[10px] text-slate-400 leading-snug"><strong>Führungshinweis:</strong> ${escapeHtml(item.execution)}</p>
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
          <p class="text-[10px] text-slate-400 leading-snug"><strong>Sicherheit & Halt:</strong> ${escapeHtml(item.execution)}</p>
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
          <p class="text-[10px] text-slate-400 leading-snug"><strong>Führungshinweis:</strong> ${escapeHtml(item.execution)}</p>
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

    var act = wizardSelections.action || { title: "Spanking", rationale: "Zentrierung", execution: "Flach mit der Hand" };
    var pos = wizardSelections.posture || { title: "Kniestand", execution: "Aufrecht" };
    var bon = wizardSelections.bondage || { title: "Keine Fesseln", execution: "Freier Wille" };
    var sen = wizardSelections.sensory || { title: "Blickkontakt", execution: "Augen offen" };

    var reasonText = wizardCustomReason || "Fehlverhalten im Spiel / Unaufmerksamkeit";

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
              <span class="text-[9px] font-mono text-slate-400">Reiz & Klärung</span>
            </div>
            <strong class="text-white block text-xs">${escapeHtml(act.title)}</strong>
            <p class="text-[10.5px] text-slate-300 leading-snug">${escapeHtml(act.rationale || '')}</p>
            <div class="p-2 rounded-lg bg-slate-900/80 border border-brand-900/60 text-[10px] text-slate-300">
              <strong class="text-brand-200">Führungshinweis für ${escapeHtml(topName)}:</strong> ${escapeHtml(act.execution || '')}
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
              <strong class="text-indigo-200">Führungshinweis für ${escapeHtml(topName)}:</strong> ${escapeHtml(pos.execution || '')}
            </div>
          </div>

          <!-- 3. ARRETIERUNG -->
          <div class="p-3 rounded-xl bg-purple-950/40 border border-purple-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-purple-300 text-xs">3. Arretierung & Begrenzung:</strong>
              <span class="text-[9px] font-mono text-slate-400">Halt</span>
            </div>
            <strong class="text-white block text-xs">${escapeHtml(bon.title)}</strong>
            <div class="p-2 rounded-lg bg-slate-900/80 border border-purple-900/60 text-[10px] text-slate-300">
              <strong class="text-purple-200">Sicherheitshinweis für ${escapeHtml(topName)}:</strong> ${escapeHtml(bon.execution || '')}
            </div>
          </div>

          <!-- 4. SENSORIK -->
          <div class="p-3 rounded-xl bg-teal-950/40 border border-teal-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-teal-300 text-xs">4. Sensorischer Fokus:</strong>
              <span class="text-[9px] font-mono text-slate-400">Wahrnehmung</span>
            </div>
            <strong class="text-white block text-xs">${escapeHtml(sen.title)}</strong>
            <div class="p-2 rounded-lg bg-slate-900/80 border border-teal-900/60 text-[10px] text-slate-300">
              <strong class="text-teal-200">Führungshinweis für ${escapeHtml(topName)}:</strong> ${escapeHtml(sen.execution || '')}
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

    var prompt = `Du bist ein erfahrener, psychologisch feinfühliger BDSM-Regisseur für ein einvernehmliches Paar (${topName} als Top, ${subName} als Bottom).
Erstelle für folgendes Vergehen eine sinnliche, tiefgreifende und leicht verständliche Disziplinar-Sequenz.

ANLASS: „${reasonText}“
${briefing}

STRIKTE VORGABEN ZUR SPRACHE & TONFALL (SEHR WICHTIG):
- KEINE KÜHLE MEDIZIN- ODER ANATOMIESPRACHE: Verwende keine distanzierten Fachbegriffe wie „Kapillardurchblutung“, „Laktatschwelle“, „Gluteus maximus“ oder „Vasokonstriktion“.
- EMOTIONAL & LEICHT VERSTÄNDLICH: Erkläre warm, lebendig und psychologisch nachvollziehbar, was die Strafe für beide bedeutet.
  * Warum hilft sie dem Bottom, Schuldgefühle abzutragen, den Kopf frei zu bekommen und sich geborgen fallen zu lassen?
  * Wie schenkt der Top dadurch klare Grenzen, Verlässlichkeit und spürbare Führung?
- ANATOMISCHE REGEL: Ein Womanizer/Klitorissauger darf NIEMALS an einem Penis angewendet werden! Bei Männern nur Penissleeve, Wand auf Eichel, Hodengewicht oder Hand.

Antworte AUSSCHLIESSLICH als valides JSON:
{
  "actionTitle": "Kurzer, packender Titel der Maßnahme mit Icon",
  "actionRationale": "Erotisch-psychologische Bedeutung in 2 leicht verständlichen Sätzen: Warum befreit das den Geist und schenkt dem Bottom Halt?",
  "actionDesc": "Lebendige, bildhafte Beschreibung des Vorgangs",
  "actionExecution": "Einfache, klare Arbeitsanweisung für ${topName} (Handhabung, Haltung, Rhythmus)",
  "postureTitle": "Körperhaltung mit Icon",
  "postureDesc": "Genaue Haltungsanweisung in alltagstauglicher Sprache",
  "postureExecution": "Praktischer Hinweis für ${topName} zur Haltungskontrolle",
  "bondageTitle": "Arretierung mit Icon",
  "bondageDesc": "Genaue Begrenzung",
  "bondageExecution": "Sicherheits- & Wohlfühlhinweis für ${topName}",
  "sensoryTitle": "Sensorischer Fokus mit Icon",
  "sensoryDesc": "Genaue Sinnesbeeinflussung",
  "sensoryExecution": "Praktischer Führungshinweis für ${topName}",
  "spokenCommand": "Ein einziger strenger, souveräner Satz, den ${topName} wörtlich zu ${subName} spricht"
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
            generationConfig: { temperature: 0.35, responseMimeType: "application/json" }
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
