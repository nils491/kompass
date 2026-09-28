/**
 * data/chastity_database.js
 * Zentrales relationales Kompendium für Keuschhaltung, Teasing-Rhythmen,
 * Berufs- und Alltagsprofile sowie Tabu-geschützte D/s-Interventionen.
 * 
 * Beinhaltet:
 * 1. Berufs- & Alltags-Profile (Handwerk, Büro, Schichtdienst, Außendienst, Pflege/Körperlich)
 * 2. Teasing-Intervall- und Spannungsphasen (Tag 1 bis Tag 30+)
 * 3. Vollständiger Katalog der 52 Teasing-Methoden mit anatomischen und Schrank-Abhängigkeiten
 * 4. Rationale, Kommandos und Aftercare-Hinweise für jede Maßnahme
 * 5. Schutzmechanismen: Strenger Fragebogen-Abgleich (Note 1 = Tabu, Note >= 3 = Freigabe)
 */

(function(window) {
  'use strict';

  // -------------------------------------------------------------
  // 1. BERUFS- & ALLTAGS-KONTEXTE DES BOTTOMS
  // -------------------------------------------------------------
  var WORKPLACE_PROFILES = {
    desk_office: {
      id: "desk_office",
      label: "Büro / Homeoffice / Schreibtisch",
      desc: "Langes Sitzen, Bildschirmarbeit, Meetings (online oder vor Ort).",
      cageRisks: "Dauerdruck auf Schambein und Hodenansatz im Sitzen; Schwellkörper drückt im 90-Grad-Winkel gegen das Gitter.",
      recommendedGeometries: ["curved", "micro", "flat"],
      teasingOpportunities: [
        "Versteckter Lovense-Vibrator im Dammbereich während Videokonferenzen",
        "Erotische Textnachrichten und Sprachnotizen kurz vor wichtigen Meetings",
        "Befohlene Beckenboden-Kontraktion (Kegels) während Telefonaten",
        "Getragenes Höschen als Taschentuch / diskreter Duftanker in der Aktentasche"
      ]
    },
    craft_physical: {
      id: "craft_physical",
      label: "Handwerk / Baustelle / Körperliche Arbeit",
      desc: "Bücken, schweres Heben, Schwitzen, Leitersteigen, ständige Bewegung.",
      cageRisks: "Starke Schweißbildung, Scheuerstellen an Oberschenkel-Innenseiten; Risiko von Hautquetschungen beim Bücken.",
      recommendedGeometries: ["curved", "micro"],
      forbiddenGeometries: ["flat", "inverted"], // Verhindert Quetschungen im Fettpolster bei schwerem Heben
      hygieneAdvice: "Atmungsaktives SLS-Nylon verwenden; Puder (Talkum/Babypuder) am Basisring; extra Duschpause nach Schichtende.",
      teasingOpportunities: [
        "Gefalteter Slip der Herrin als Schweißband oder Einlage in der Arbeitshose",
        "Diskreter Morgenappell um 05:30 Uhr vor Arbeitsbeginn",
        "Körperliche Erschöpfung nach der Schicht für sofortigen Kniestand nutzen",
        "Belohnung: Kühle Waschpause mit anschließender strenger Inspektion"
      ]
    },
    medical_service: {
      id: "medical_service",
      label: "Pflege / Medizin / Gastronomie / Stehende Berufe",
      desc: "8–12 Stunden ununterbrochenes Stehen und Laufen, enge Schutzkleidung.",
      cageRisks: "Schwerkraftzug an den Hoden; Harndrang-Management unter erschwerten Bedingungen; Reibung an Kasacks.",
      recommendedGeometries: ["curved", "micro"],
      hygieneAdvice: "Käfig mit breitem Urinschild wählen; Zielen im Stehen üben oder Sitzen zur Pflicht machen.",
      teasingOpportunities: [
        "Strenges Toiletten-Protokoll: Nur im Sitzen urinieren, danach trocken tupfen",
        "Überraschende Sprachnachricht mit Schlüsselklimpern während der Kaffeepause",
        "Fußmassage am Abend als formelle Demuts-Pflicht vor der Herrin"
      ]
    },
    driver_field: {
      id: "driver_field",
      label: "Fahrer / Außendienst / Pendler",
      desc: "Stundenlanges Sitzen im Autositz, Vibrationen der Straße, wechselnde Orte.",
      cageRisks: "Sicherheitsgurt presst auf den Unterbauch; Sitzheizung erzeugt Stauungshitze im Käfig.",
      recommendedGeometries: ["curved", "flat"],
      hygieneAdvice: "Sitzheizung auf minimaler Stufe halten, um Überhitzung der Hoden zu vermeiden.",
      teasingOpportunities: [
        "Befehl: Bei jedem roten Ampelhalt den Käfig gedanklich spüren und Hand auf das Lenkrad pressen",
        "Foto-Appell auf Rastplatzparkplatz zur festen Uhrzeit",
        "Schlüssel verbleibt zuhause am Hals der Herrin"
      ]
    },
    shift_variable: {
      id: "shift_variable",
      label: "Schichtdienst (Früh / Spät / Nacht)",
      desc: "Verschobener Biorhythmus, unregelmäßige Schlafzeiten, Schlaferrektionen zu wechselnden Tageszeiten.",
      cageRisks: "Intensive nächtliche Erektionsversuche zu wechselnden Stunden; Müdigkeit erhöht die Reizbarkeit.",
      recommendedGeometries: ["curved", "micro"],
      teasingOpportunities: [
        "Schlafmasken-Protokoll: Vor dem Tagschlaf getragenen Slip über die Nase binden",
        "Gute-Nacht-Befehl per Sprachnachricht exakt vor Schichtantritt",
        "Tagescode-Foto vor dem Zubettgehen"
      ]
    }
  };

  // -------------------------------------------------------------
  // 2. TEASING-PHASEN & FRUSTRATIONS-WÄCHTER
  // -------------------------------------------------------------
  var TENSION_PHASES = {
    phase_entry: {
      daysMin: 1,
      daysMax: 3,
      title: "Phase 1: Das Einrasten & Sensorische Sensibilisierung",
      desc: "Der Schwellkörper gewöhnt sich an die Begrenzung. Frustration ist noch gering, Vorfreude und Nervosität dominieren.",
      danger: "Langeweile oder Vergessen des Status, wenn der Top sich nicht bemerkbar macht.",
      focus: "Häufige kleine sensorische Reize, Berührungsverbot, Schlüssel-Präsenz.",
      recommendedMethods: ["barrier_tease", "acoustic_anchoring", "scent_scenting", "hovering_kiss"]
    },
    phase_climbing: {
      daysMin: 4,
      daysMax: 7,
      title: "Phase 2: Der Erregungsanstieg & Frustrations-Schwelle",
      desc: "Testosteron und Dopamin stauen sich. Der Bottom wird unruhig, anhänglich oder leicht fahrig. Hier droht dumpfer Frust, wenn keine Führung erfolgt.",
      danger: "Kritischer Kipp-Punkt: Ohne erotisches Teasing verliert der Bottom die Lust am Dienen und wird gereizt.",
      focus: "Gezielte Schwellen-Quälerei (Edging im Käfig), Handauflegen, Zucht-Appelle, intensive Fürsorge.",
      recommendedMethods: ["magic_wand_resonance", "hands_off_kegel", "sprotum_weight", "mirror_reflection", "slow_striptease"]
    },
    phase_deep_subspace: {
      daysMin: 8,
      daysMax: 21,
      title: "Phase 3: Der tiefe Keuschheits-Subspace (Transformation)",
      desc: "Der Geist koppelt sich vom täglichen Ejakulationsdrang ab. Der Fokus verschiebt sich voll auf das Wohlbefinden und die Befehle der Herrin.",
      danger: "Vernachlässigung der Hygiene oder Schwellkörper-Dauerdruck.",
      focus: "Ritualisierte Duschpausen, Prostata-Stimulation (Pegging/Aneros), Rollenumkehr, Tease & Relock.",
      recommendedMethods: ["tease_and_relock", "pre_cum_milking", "queening_facesitting", "prostate_tease", "sissy_lingerie"]
    },
    phase_permanent: {
      daysMin: 22,
      daysMax: 999,
      title: "Phase 4: Vollendete Schlüsselgewalt & Hohe Kunst",
      desc: "Keuschheit ist kein Zustand mehr, sondern die feste Basis der Partnerschaft. Höhepunkte sind seltene, zelebrierte Staatsakte.",
      danger: "Gewohnheitstrott ohne neue Impulse.",
      focus: "Schicksals-Würfel, CBT-Kontraste, Ruined-in-Cage Katharsis, öffentliche Stealth-Macht.",
      recommendedMethods: ["ruined_in_chains", "pegging_denial", "dildo_ride_standin", "shrinkage_audit"]
    }
  };

  // -------------------------------------------------------------
  // 3. DAS GESAMT-TEASING-ARSENAL (52 METHODEN IN 8 STUFEN)
  // -------------------------------------------------------------
  var TEASING_CATALOG = [
    // --- STUFE 1: ZART, TAKTIL & PSYCHOLOGISCH ---
    {
      id: "tease_01_barrier",
      number: 1,
      stage: 1,
      stageLabel: "Stufe 1: Zart & Psychologisch",
      title: "The Barrier Tease (Peripheres Streicheln)",
      category: "teasing_tactile",
      requiredEquipment: ["hands", "massage_oil"],
      surveyRequirement: { chapter: 1, minRating: 2 },
      topInstruction: "Streiche mit warmen, eingeölten Händen über die Schenkelinnenseiten, den Damm und den Unterbauch. Spare das Käfiggehäuse konsequent um exakt 2 cm aus.",
      subInstruction: "Auf dem Rücken liegen, Hände hinter dem Kopf verschränkt. Dem Ausbleiben der Berührung reglos standhalten.",
      rationale: "Antizipation reizt die Nervenbahnen im Lendenmark stärker als direkte Berührung. Das Gehirn wartet sekündlich auf den Kontakt.",
      spokenCommand: "Ich berühre dich überall... nur dort nicht, wo du es am meisten willst.",
      durationSeconds: 180,
      aftercareNote: "Am Ende die warme Handfläche 30 Sekunden flach auflegen."
    },
    {
      id: "tease_02_silk_feather",
      number: 2,
      stage: 1,
      stageLabel: "Stufe 1: Zart & Psychologisch",
      title: "Seidenhauch & Federkitzeln (Silk & Feather)",
      category: "teasing_tactile",
      requiredEquipment: ["feather", "silk_scarf"],
      surveyRequirement: { chapter: 1, minRating: 2 },
      topInstruction: "Ziehe einen Seidenschal oder eine Straußenfeder im Zeitlupentempo quer über die Gitteröffnungen der Eichel.",
      subInstruction: "Augen schließen, tief in den Bauch atmen, nicht zucken.",
      rationale: "Flüchtige Mikro-Reize aktivieren die Meissner-Körperchen der Eichel ohne Druckaufbau.",
      spokenCommand: "Spüre, wie empfindlich er hinter den Gittern ist.",
      durationSeconds: 120,
      aftercareNote: "Sanftes Streichen über die Wange."
    },
    {
      id: "tease_03_thermal_breath",
      number: 3,
      stage: 1,
      stageLabel: "Stufe 1: Zart & Psychologisch",
      title: "Thermischer Hauch (Thermal Breath Tease)",
      category: "teasing_tactile",
      requiredEquipment: [],
      surveyRequirement: { chapter: 1, minRating: 2 },
      topInstruction: "Beuge dich 3 cm über den Käfig. Hauche feucht-warmen Atem direkt auf die Öffnung, gefolgt von kühlem Pusten.",
      subInstruction: "Becken vollkommen reglos halten.",
      rationale: "Wechselwirkung der Thermorezeptoren (TRPV1 / TRPM8) stimuliert ohne mechanische Reibung.",
      spokenCommand: "Heiß und kalt... und kein Entkommen.",
      durationSeconds: 90,
      aftercareNote: "Kurz die Handfläche auflegen."
    },
    {
      id: "tease_04_acoustic_anchoring",
      number: 4,
      stage: 1,
      stageLabel: "Stufe 1: Zart & Psychologisch",
      title: "Das Schlüssel-Klimpern (Acoustic Anchoring)",
      category: "teasing_psychological",
      requiredEquipment: ["key_chain"],
      surveyRequirement: { chapter: 7, minRating: 3 },
      topInstruction: "Lass den Schlüssel an der Kette um deinen Hals bei jeder Bewegung metallisch klirren oder schlage ihn leicht gegen deine Fingernägel.",
      subInstruction: "Bei jedem Klirren den Kopf leicht senken und die Demut spüren.",
      rationale: "Klassische Konditionierung (Pawlow): Das Geräusch wird zum direkten Lust- und Demuts-Trigger im Unterbewusstsein.",
      spokenCommand: "Hörst du das? Das ist deine Freiheit... an meinem Hals.",
      durationSeconds: 60,
      aftercareNote: "Keine körperliche Nachbereitung nötig."
    },
    {
      id: "tease_05_scent_scenting",
      number: 5,
      stage: 1,
      stageLabel: "Stufe 1: Zart & Psychologisch",
      title: "Parfüm-Markierung (Scent Scenting)",
      category: "teasing_psychological",
      requiredEquipment: ["perfume"],
      surveyRequirement: { chapter: 1, minRating: 2 },
      topInstruction: "Benetze das Vorhängeschloss oder den Basisring mit einem Tropfen deines Parfüms.",
      subInstruction: "Den Duft bei jedem Schritt im Alltag riechen und an die Herrin denken.",
      rationale: "Olfaktorische Verankerung über das limbische System – Dauerpräsenz im Alltagsbewusstsein.",
      spokenCommand: "Du riechst mich den ganzen Tag. Du gehörst mir.",
      durationSeconds: 30,
      aftercareNote: "Keine Nachbereitung."
    },
    {
      id: "tease_06_hand_heartbeat",
      number: 6,
      stage: 1,
      stageLabel: "Stufe 1: Zart & Psychologisch",
      title: "Handauflegen & Herzschlag-Resonanz",
      category: "teasing_tactile",
      requiredEquipment: ["hands"],
      surveyRequirement: { chapter: 1, minRating: 2 },
      topInstruction: "Lege deine warme Handfläche flach und mit festem Druck auf das Gehäuse und halte sie 60 Sekunden regungslos.",
      subInstruction: "Den Puls gegen die Handfläche schlagen spüren; ruhig ausatmen.",
      rationale: "Parasympathische Beruhigung trifft auf Machtbestätigung; festigt das Sicherheitsgefühl.",
      spokenCommand: "Dein Herz schlägt gegen meine Hand. Ich halte dich.",
      durationSeconds: 60,
      aftercareNote: "Sanftes Streicheln über den Bauch."
    },
    {
      id: "tease_07_hovering_kiss",
      number: 7,
      stage: 1,
      stageLabel: "Stufe 1: Zart & Psychologisch",
      title: "Das Fast-Kuss-Ritual (The Hovering Kiss)",
      category: "teasing_sensual",
      requiredEquipment: [],
      surveyRequirement: { chapter: 2, minRating: 2 },
      topInstruction: "Nähre deine Lippen bis auf 2 mm an die Käfigöffnung, als wolltest du ihn küssen – und ziehe dich lächelnd zurück.",
      subInstruction: "Augen offen halten, Enttäuschung aushalten.",
      rationale: "Maximale psychologische Frustrationsspitze durch Abbruch im letzten Millimeter.",
      spokenCommand: "Fast... aber nicht heute.",
      durationSeconds: 90,
      aftercareNote: "Einen Kuss auf die Stirn geben."
    },
    {
      id: "tease_08_eye_contact_hold",
      number: 8,
      stage: 1,
      stageLabel: "Stufe 1: Zart & Psychologisch",
      title: "Erzwungener Blickkontakt bei Käfig-Umgreifung",
      category: "teasing_psychological",
      requiredEquipment: ["hands"],
      surveyRequirement: { chapter: 21, minRating: 3 },
      topInstruction: "Umfasse den Käfig fest mit einer Hand und fordere ununterbrochenen Blickkontakt in deine Augen.",
      subInstruction: "Den Blick der Herrin halten, nicht blinzeln oder nach unten schauen.",
      rationale: "Schaltet kognitive Fluchtmechanismen aus; erzwingt absolute seelische Gegenwärtigkeit.",
      spokenCommand: "Sieh mich an. Nicht den Käfig. Mich.",
      durationSeconds: 120,
      aftercareNote: "Wange streicheln und loben."
    },

    // --- STUFE 2: PHYSISCHE KÄFIG-QUAL & SENSORISCHE FRIKTION ---
    {
      id: "tease_09_magic_wand_resonance",
      number: 9,
      stage: 2,
      stageLabel: "Stufe 2: Käfig-Qual & Sensorik",
      title: "Magic-Wand-Resonanz (Vibration auf Gitter)",
      category: "teasing_vibration",
      requiredEquipment: ["wand_massager"],
      surveyRequirement: { chapter: 7, minRating: 3, vetoItemIds: [701] },
      topInstruction: "Presse den Stabvibrator von außen direkt auf das Metall- oder Nylongitter. 30s volle Stufe – bei Beckenzuckung: Stopp!",
      subInstruction: "Beine öffnen, Hände auf den Rücken. Dem Vibrationsdruck ohne Beckenstoß standhalten.",
      rationale: "Vibration stimuliert die Vater-Pacini-Körperchen der Eichel massiv, ohne Schwellkörper-Expansion zu erlauben.",
      spokenCommand: "Kein Millimeter Bewegung! Die Vibration gehört mir.",
      durationSeconds: 90,
      aftercareNote: "Handfläche beruhigend aufpressen."
    },
    {
      id: "tease_10_ice_melt_lock",
      number: 10,
      stage: 2,
      stageLabel: "Stufe 2: Käfig-Qual & Sensorik",
      title: "Eisschmelze am Schloss (Ice Dip & Melt)",
      category: "teasing_thermal",
      requiredEquipment: ["ice_cube"],
      surveyRequirement: { chapter: 1, minRating: 2 },
      topInstruction: "Führe einen spitzen Eiswürfel kreisend über das Metall des Gehäuses, bis das Schmelzwasser über Hoden und Damm rinnt.",
      subInstruction: "Ruhig atmen, nicht zusammenzucken.",
      rationale: "Kältereiz kontrahiert den Kremaster-Muskel und die Tunica dartos – das Gehäuse sitzt noch enger.",
      spokenCommand: "Zittere ruhig. Das Eis schmilzt, dein Schloss bleibt.",
      durationSeconds: 120,
      aftercareNote: "Mit weichem Handtuch trocken tupfen."
    },
    {
      id: "tease_11_hands_off_kegel",
      number: 11,
      stage: 2,
      stageLabel: "Stufe 2: Käfig-Qual & Sensorik",
      title: "Hands-Off Kegel-Kommando (Beckenboden-Anspannung)",
      category: "teasing_somatic",
      requiredEquipment: [],
      surveyRequirement: { chapter: 21, minRating: 3 },
      topInstruction: "Befehle dem liegenden Bottom: 'Spann den Schwellkörper im Käfig maximal an und drücke 10s gegen das Gehäuse!'.",
      subInstruction: "Beckenbodenmuskeln (PC-Muskel) mit aller Kraft anspannen und gegen die Wände pressen.",
      rationale: "Isometrische Kontraktion macht die eigene Enge und Ausweglosigkeit somatisch spürbar.",
      spokenCommand: "Drück dagegen. Spüre, wie eng dein Gefängnis ist.",
      durationSeconds: 90,
      aftercareNote: "Entspannungsbefehl geben."
    },
    {
      id: "tease_12_scrotum_weight",
      number: 12,
      stage: 2,
      stageLabel: "Stufe 2: Käfig-Qual & Sensorik",
      title: "Hodenzug & Parachute (Scrotum Weight Tease)",
      category: "teasing_cbt",
      requiredEquipment: ["ball_stretcher", "parachute"],
      surveyRequirement: { chapter: 17, minRating: 3 },
      topInstruction: "Befestige ein Hodengewicht (Ball Stretcher / Fallschirm) unterhalb des Basisrings. Lass ihn 10 tiefe Kniebeugen machen.",
      subInstruction: "Kniebeugen langsam und andächtig ausführen; den Zug an den Hoden wahrnehmen.",
      rationale: "Konstanter Zug an den Samensträngen verstärkt die Demut bei jeder Körperbewegung.",
      spokenCommand: "Jeder Schritt zieht nach unten. Dein Körper dient mir.",
      durationSeconds: 180,
      aftercareNote: "Gewicht abnehmen, Hoden sanft stützen."
    },
    {
      id: "tease_13_wartenberg_wheel",
      number: 13,
      stage: 2,
      stageLabel: "Stufe 2: Käfig-Qual & Sensorik",
      title: "Wartenberg-Rad über Gitter & Skrotum",
      category: "teasing_sensory",
      requiredEquipment: ["wartenberg_wheel"],
      surveyRequirement: { chapter: 16, minRating: 3 },
      topInstruction: "Rolle das spitze Nadelrädchen langsam über die Haut um den Ring und über die Kanten der Stege.",
      subInstruction: "Gänsehaut zulassen, reglos ausharren.",
      rationale: "Prickelnder Schmerz-Lust-Reiz löst lokale Hyperämie und Endorphine aus.",
      spokenCommand: "Jede Nadel erinnert dich daran, wem du gehörst.",
      durationSeconds: 90,
      aftercareNote: "Handfläche glättend auflegen."
    },
    {
      id: "tease_14_ring_tap_metronome",
      number: 14,
      stage: 2,
      stageLabel: "Stufe 2: Käfig-Qual & Sensorik",
      title: "Käfig-Klopfen im Metronom-Takt (The Ring Tap)",
      category: "teasing_acoustic",
      requiredEquipment: ["finger_ring"],
      surveyRequirement: { chapter: 21, minRating: 2 },
      topInstruction: "Klopfe mit einem schweren Fingerring im festen Sekunden-Takt leicht gegen das Metallgehäuse.",
      subInstruction: "Jeden Schlag im Inneren der Eichel spüren und mitzählen.",
      rationale: "Kombination aus Vibration und akustischem Signal erzeugt rhythmische Spannung.",
      spokenCommand: "Tick... Tack... Deine Zeit vergeht nicht.",
      durationSeconds: 60,
      aftercareNote: "Klopfen mit weichem Streichen beenden."
    },
    {
      id: "tease_15_cold_wax_seal",
      number: 15,
      stage: 2,
      stageLabel: "Stufe 2: Käfig-Qual & Sensorik",
      title: "Kaltwachs-Tropfen auf den Basisring",
      category: "teasing_wax",
      requiredEquipment: ["low_temp_candle"],
      surveyRequirement: { chapter: 16, minRating: 3 },
      topInstruction: "Tropfe Niedrigtemperatur-Fetischwachs langsam auf den Übergang zwischen Ring und Haut.",
      subInstruction: "Hitze aushalten, nicht zurückschrecken.",
      rationale: "Kurzer Hitzeschock versiegelt das Schloss symbolisch und visuell.",
      spokenCommand: "Mit meinem Siegel versiegelt. Unantastbar.",
      durationSeconds: 120,
      aftercareNote: "Wachs nach der Session sanft abblättern."
    },
    {
      id: "tease_16_perineum_tickle",
      number: 16,
      stage: 2,
      stageLabel: "Stufe 2: Käfig-Qual & Sensorik",
      title: "Kitzeln am Damm unter Vorbeuge (Perineum Tickle)",
      category: "teasing_tactile",
      requiredEquipment: ["feather", "brush"],
      surveyRequirement: { chapter: 1, minRating: 2 },
      topInstruction: "Lass den Bottom in 90-Grad-Vorbeuge an der Bettkante stehen. Reize den freiliegenden Damm mit Pinselborsten.",
      subInstruction: "Fersen am Boden lassen, Gesäß herausstrecken.",
      rationale: "Hohe Dichte an Nervenfasern am Dammsehnen-Zentrum (Centrum tendineum).",
      spokenCommand: "Halt die Stellung. Nicht nachgeben.",
      durationSeconds: 120,
      aftercareNote: "Aufrichten helfen, Rücken massieren."
    },

    // --- STUFE 3: VISUELLE, VERBALE & MENTALE FOLTER ---
    {
      id: "tease_17_mirror_reflection",
      number: 17,
      stage: 3,
      stageLabel: "Stufe 3: Macht & Zurschaustellung",
      title: "Der Spiegel-Zwang (The Mirror Reflection)",
      category: "teasing_visual",
      requiredEquipment: ["mirror"],
      surveyRequirement: { chapter: 24, minRating: 3 },
      topInstruction: "Lass den Bottom nackt vor einem großen Spiegel knien. Tritt dahinter und zwinge ihn, sein eingesperrtes Glied anzustarren.",
      subInstruction: "Den Blick im Spiegel nicht abwenden; die eigene Winzigkeit betrachten.",
      rationale: "Konfrontation mit der visuellen Machtlosigkeit baut maskulines Ego ab.",
      spokenCommand: "Schau genau hin. Siehst du, wie wehrlos du vor mir bist?",
      durationSeconds: 180,
      aftercareNote: "Hände auf seine Schultern legen."
    },
    {
      id: "tease_18_slow_striptease",
      number: 18,
      stage: 3,
      stageLabel: "Stufe 3: Macht & Zurschaustellung",
      title: "Der Slow Striptease mit Berührungsverbot",
      category: "teasing_visual",
      requiredEquipment: ["lingerie"],
      surveyRequirement: { chapter: 9, minRating: 3 },
      topInstruction: "Entkleide dich langsam vor seinen Augen, berühre dich sinnlich – absolutes Berührungsverbot für den knienden Bottom.",
      subInstruction: "Hände hinter dem Rücken arretiert halten, nur zusehen.",
      rationale: "Visuelle Überstimulation bei totaler motorischer Handlungsunfähigkeit.",
      spokenCommand: "Nur für meine Augen. Du darfst nur betrachten.",
      durationSeconds: 240,
      aftercareNote: "Ihn über den Kopf streicheln."
    },
    {
      id: "tease_19_begging_and_denial",
      number: 19,
      stage: 3,
      stageLabel: "Stufe 3: Macht & Zurschaustellung",
      title: "Schwellen-Betteln & Kalte Abweisung (Begging & Denial)",
      category: "teasing_verbal",
      requiredEquipment: [],
      surveyRequirement: { chapter: 21, minRating: 3 },
      topInstruction: "Befehle: 'Bettle auf Knien um fünf Minuten Freiheit!'. Hör dir sein Flehen an, lächle und verkünde ruhig: 'Abgelehnt.'",
      subInstruction: "Demütig und ehrlich auf Knien um Öffnung flehen.",
      rationale: "Klassische D/s-Ritualdynamik: Bitten dürfen, aber die Hoheit des Tops anerkennen.",
      spokenCommand: "Sehr schön gebettelt, mein Schatz. Aber die Antwort ist Nein.",
      durationSeconds: 120,
      aftercareNote: "Wange tätscheln und loben."
    },
    {
      id: "tease_20_moving_target_promise",
      number: 20,
      stage: 3,
      stageLabel: "Stufe 3: Macht & Zurschaustellung",
      title: "Aufgeschobene Versprechen (The Moving Target)",
      category: "teasing_psychological",
      requiredEquipment: [],
      surveyRequirement: { chapter: 7, minRating: 3 },
      topInstruction: "Stelle eine Öffnung für 21:00 Uhr in Aussicht. Um 20:59 Uhr musterst du ihn: 'Dein Blick war zu gierig. Wir verlängern um 48h.'",
      subInstruction: "Die Verlängerung ohne Murren mit 'Danke, Herrin' annehmen.",
      rationale: "Zerstörung der Erwartungssicherheit lehrt absolute Hingabe an den Augenblick.",
      spokenCommand: "Zu gierig. Zwei weitere Tage für dich.",
      durationSeconds: 60,
      aftercareNote: "Warm umarmen."
    },
    {
      id: "tease_21_top_solo_masturbation",
      number: 21,
      stage: 3,
      stageLabel: "Stufe 3: Macht & Zurschaustellung",
      title: "Live-Selbstbefriedigung des Tops vor dem Käfig",
      category: "teasing_visual",
      requiredEquipment: ["vibrator_top"],
      surveyRequirement: { chapter: 22, minRating: 3 },
      topInstruction: "Masturbiere dich genüsslich auf dem Bett zum Orgasmus, während der eingesperrte Bottom am Fußende kniet und zusehen muss.",
      subInstruction: "Reglos knien, deinen Atem kontrollieren, den Anblick ertragen.",
      rationale: "Demonstration sexueller Autonomie der Herrin – er dient nur als andächtiger Zeuge.",
      spokenCommand: "Schau mir zu, wie ich komme. Du darfst nur zusehen.",
      durationSeconds: 300,
      aftercareNote: "Ihn zu sich ins Bett holen und festhalten."
    },
    {
      id: "tease_22_ksafe_ceremony",
      number: 22,
      stage: 3,
      stageLabel: "Stufe 3: Macht & Zurschaustellung",
      title: "Der Zeittresor-Verschluss (kSafe Ceremony)",
      category: "teasing_ritual",
      requiredEquipment: ["ksafe"],
      surveyRequirement: { chapter: 7, minRating: 3 },
      topInstruction: "Lege den Schlüssel vor seinen Augen in den Kitchen Safe. Stelle 72 Stunden ein und drücke den Knopf.",
      subInstruction: "Dem Surren des Motors lauschen und den Verlust der Verhandlungsmöglichkeit spüren.",
      rationale: "Physische Delegation an die Zeitschaltuhr befreit die Beziehung von zermürbenden Diskussionen.",
      spokenCommand: "Das Schloss entscheidet. Keine Bitten mehr für 72 Stunden.",
      durationSeconds: 90,
      aftercareNote: "Hand reichen zum Aufstehen."
    },
    {
      id: "tease_23_photo_inspection_protocol",
      number: 23,
      stage: 3,
      stageLabel: "Stufe 3: Macht & Zurschaustellung",
      title: "Tägliches Foto-Appell-Protokoll (Verification)",
      category: "teasing_remote",
      requiredEquipment: ["camera_phone"],
      surveyRequirement: { chapter: 7, minRating: 3 },
      topInstruction: "Fordere per Chat ein scharfes Kontrollfoto mit dem aktuellen Tagescode (#B7X) neben dem Vorhängeschloss an.",
      subInstruction: "Foto unverzüglich und perfekt fokussiert übermitteln.",
      rationale: "Verbindlichkeit im Alltag; verhindert Ausbruchsfantasien.",
      spokenCommand: "Siegelprüfung. Foto innerhalb von 10 Minuten.",
      durationSeconds: 60,
      aftercareNote: "Kurze Bestätigung im Chat ('Siegel intakt')."
    },
    {
      id: "tease_24_remote_audio_whisper",
      number: 24,
      stage: 3,
      stageLabel: "Stufe 3: Macht & Zurschaustellung",
      title: "Erotische Sprachnachricht im Arbeitsalltag",
      category: "teasing_remote",
      requiredEquipment: ["phone"],
      surveyRequirement: { chapter: 22, minRating: 2 },
      topInstruction: "Sende ihm während der Arbeitszeit ein kurzes Audio: 'Ich trage heute keine Unterwäsche. Schade um deinen Käfig...'.",
      subInstruction: "Die Sprachnachricht über Kopfhörer anhören, dem plötzlichen Puls standhalten.",
      rationale: "Mentale Intervention bricht die Alltagsroutine und heizt das Kopfkino an.",
      spokenCommand: "Denk an mich. Und daran, wer den Schlüssel hat.",
      durationSeconds: 30,
      aftercareNote: "Keine."
    },

    // --- STUFE 4: EXPLIZIT, HEISS & HOCHEXPLOSIV ---
    {
      id: "tease_25_tease_and_relock",
      number: 25,
      stage: 4,
      stageLabel: "Stufe 4: Explizit & Katharsis",
      title: "Tease & Relock (Die süßeste Schwellenquälerei)",
      category: "teasing_edging",
      requiredEquipment: ["massage_oil", "chastity_cage"],
      surveyRequirement: { chapter: 7, minRating: 4, vetoItemIds: [701] },
      topInstruction: "Schließe den Käfig auf. Masturbiere den befreiten Penis mit warmem Öl bis Stufe 9.5. Stoppe vor dem PONR und sperre ihn sofort wieder ein!",
      subInstruction: "Die Erlösung erwarten – und den Verschluss mit Demut ertragen.",
      rationale: "Höchste Form des Dopamin-Staus: Der Körper glaubt an die Befreiung und wird schlagartig rekonditioniert.",
      spokenCommand: "Fast gekommen... und Klick. Zurück ins Gefängnis!",
      durationSeconds: 300,
      aftercareNote: "Den verriegelten Käfig festhalten und küssen."
    },
    {
      id: "tease_26_precum_milking",
      number: 26,
      stage: 4,
      stageLabel: "Stufe 4: Explizit & Katharsis",
      title: "Pre-Cum Melken durch das Käfiggitter",
      category: "teasing_somatic",
      requiredEquipment: ["hands"],
      surveyRequirement: { chapter: 7, minRating: 3 },
      topInstruction: "Wische den aus den Gittern austretenden Lusttropfen mit dem Zeigefinger ab und führe ihn an seine Lippen.",
      subInstruction: "Die eigene Lust schmecken und reglos verharren.",
      rationale: "Sinnliche Scham-Entlastung: Der Körper reagiert autonom, die Herrin nimmt die Essenz in Empfang.",
      spokenCommand: "Schau, wie sehr du tropfst. Und trotzdem bleibst du keusch.",
      durationSeconds: 120,
      aftercareNote: "Mund abwischen, Stirn streicheln."
    },
    {
      id: "tease_27_facesitting_queening",
      number: 27,
      stage: 4,
      stageLabel: "Stufe 4: Explizit & Katharsis",
      title: "Facesitting auf dem Käfig (Queening)",
      category: "teasing_dominance",
      requiredEquipment: [],
      surveyRequirement: { chapter: 23, minRating: 4, vetoItemIds: [2301] },
      topInstruction: "Setze dich rittlings auf sein Gesicht. Während er dich oral bedient, drückt dein Beckenboden direkt auf seinen Käfig.",
      subInstruction: "Klopf-Signal bereithalten; mit voller Hingabe oral dienen.",
      rationale: "Doppelte Machtwirkung: Atmung und Zunge dienen der Frau, während sein eigenes Glied gequetscht wird.",
      spokenCommand: "Atme mich ein und bediene deine Königin.",
      durationSeconds: 300,
      aftercareNote: "Gewicht sanft anheben, tief durchatmen lassen, Gesicht streicheln."
    },
    {
      id: "tease_28_caged_dry_humping",
      number: 28,
      stage: 4,
      stageLabel: "Stufe 4: Explizit & Katharsis",
      title: "Käfig-Friktion an feuchter Vulva (Dry Humping)",
      category: "teasing_sensual",
      requiredEquipment: [],
      surveyRequirement: { chapter: 2, minRating: 3 },
      topInstruction: "Reibe deine feuchten Schamlippen direkt über das kühle Metall- oder Nylongehäuse seines Käfigs.",
      subInstruction: "Ihre Nässe auf der Haut spüren, ohne eindringen zu können.",
      rationale: "Maximale somatosensorische Nähe bei unüberwindbarer mechanischer Barriere.",
      spokenCommand: "Spürst du, wie nass ich bin? Zu schade, dass du nicht rein darfst.",
      durationSeconds: 180,
      aftercareNote: "Ihn fest an sich drücken."
    },
    {
      id: "tease_29_forced_oral_service",
      number: 29,
      stage: 4,
      stageLabel: "Stufe 4: Explizit & Katharsis",
      title: "Zwang zum Dienen (Forced Cunnilingus)",
      category: "teasing_service",
      requiredEquipment: [],
      surveyRequirement: { chapter: 3, minRating: 3 },
      topInstruction: "Fordere 30–45 Minuten ununterbrochenen Oralservice, bis du mehrere Höhepunkte hattest – während sein Käfig verschlossen bleibt.",
      subInstruction: "Fokus zu 100 % auf die Lust der Partnerin richten.",
      rationale: "Vollständige Entkopplung der Sexualität vom eigenen Genital; Dienst als höchste Befriedigung.",
      spokenCommand: "Deine Zunge gehört mir. Bring mich zum Höhepunkt.",
      durationSeconds: 1200,
      aftercareNote: "Ihn loben, ein Glas Wasser reichen, fest kuscheln."
    },
    {
      id: "tease_30_prostate_pegging_tease",
      number: 30,
      stage: 4,
      stageLabel: "Stufe 4: Explizit & Katharsis",
      title: "Analer Prostata-Tease ohne Genitalkontakt (Pegging/Aneros)",
      category: "teasing_anal",
      requiredEquipment: ["strapon", "aneros", "lube"],
      surveyRequirement: { chapter: 5, minRating: 4, vetoItemIds: [501, 502] },
      topInstruction: "Stimuliere seine Prostata anal mit Umschnalldildo oder Aneros bis kurz vor den freihändigen Orgasmus – dann innehalten!",
      subInstruction: "Auf dem Bauch liegen, Schließmuskel entspannen, innere Schwellung zulassen.",
      rationale: "Umgehung des gesperrten Penis über den parasympathischen Beckennerv (Nervus splanchnicus).",
      spokenCommand: "Deine Lust kommt von innen. Ich bestimme, wann du sie spürst.",
      durationSeconds: 360,
      aftercareNote: "Toy langsam entfernen, warmes Tuch auflegen, Decke überwerfen."
    },
    {
      id: "tease_31_sissy_lingerie",
      number: 31,
      stage: 4,
      stageLabel: "Stufe 4: Explizit & Katharsis",
      title: "Sissy-Feminisierung über dem Käfig (Spitze & Strapse)",
      category: "teasing_sissy",
      requiredEquipment: ["panties", "stockings"],
      surveyRequirement: { chapter: 10, minRating: 4, vetoItemIds: [1001] },
      topInstruction: "Lass den glattrasierten Bottom Spitzenhöschen und Strapsgürtel über dem Käfig tragen. Mustere ihn als dein Zierstück.",
      subInstruction: "Die Spitzenwäsche auf der Haut spüren und die Entmännlichung annehmen.",
      rationale: "Erotische Demut durch bewusste Dekonstruktion traditioneller Rollenmuster.",
      spokenCommand: "Sieh dich an: So hübsch, so wehrlos, so keusch.",
      durationSeconds: 180,
      aftercareNote: "Ihn sanft annehmen und streicheln."
    },
    {
      id: "tease_32_cuckold_headgame",
      number: 32,
      stage: 4,
      stageLabel: "Stufe 4: Explizit & Katharsis",
      title: "Cuckold-Kopfkino & Schlüsselgewalt auf Reisen",
      category: "teasing_cuckold",
      requiredEquipment: ["key_chain"],
      surveyRequirement: { chapter: 25, minRating: 4, vetoItemIds: [2501] },
      topInstruction: "Gehe attraktiv gekleidet aus, trage seinen Schlüssel sichtbar um den Hals und beschreibe ihm vorab die Blicke anderer.",
      subInstruction: "Zuhause keusch warten, ihr Bad vorbereiten, die Fantasie aushalten.",
      rationale: "Transformation von Eifersucht in devote Hingabe und sexuelle Verehrung.",
      spokenCommand: "Ich gehe aus. Dein Schlüssel begleitet mich. Warte brav auf mich.",
      durationSeconds: 120,
      aftercareNote: "Nach der Rückkehr Füße massieren lassen und ihm Nähe schenken."
    },

    // --- STUFE 5: VERDECKTE ALLTAGS- & FERN-MACHT ---
    {
      id: "tease_33_panties_gag_choreplay",
      number: 33,
      stage: 5,
      stageLabel: "Stufe 5: Alltag & Stealth",
      title: "Der Höschen-Knebel bei der Hausarbeit (Choreplay)",
      category: "teasing_chores",
      requiredEquipment: ["panties", "scarf"],
      surveyRequirement: { chapter: 15, minRating: 3 },
      topInstruction: "Stopfe ihm eines deiner getragenen Höschen in den Mund, binde es mit einem Schal fest und schicke ihn zum Staubsaugen.",
      subInstruction: "Ihren Duft inhalieren, schweigend dienen.",
      rationale: "Sensorische Dauerpräsenz während profaner Alltagsarbeiten.",
      spokenCommand: "Kein Wort. Putz die Wohnung und schmeck meine Lust.",
      durationSeconds: 600,
      aftercareNote: "Knebel vorsichtig lösen, Wasser reichen."
    },
    {
      id: "tease_34_under_table_restaurant",
      number: 34,
      stage: 5,
      stageLabel: "Stufe 5: Alltag & Stealth",
      title: "Verdeckte Restaurant-Macht (Under-the-Table Foot Tease)",
      category: "teasing_public",
      requiredEquipment: ["nylons"],
      surveyRequirement: { chapter: 20, minRating: 3 },
      topInstruction: "Streife beim Essen im Restaurant unbemerkt deinen Schuh ab und übe mit der bestrumpften Ferse Druck auf seinen Käfig aus.",
      subInstruction: "Gesichtsausdruck neutral halten, höflich mit der Bedienung sprechen.",
      rationale: "Kitzel des Verbotenen in der Öffentlichkeit bei totaler Fassadenwahrung.",
      spokenCommand: "Lächle und iss weiter. Niemand ahnt, was unter der Tischdecke passiert.",
      durationSeconds: 180,
      aftercareNote: "Unter dem Tisch die Hand auf sein Knie legen."
    },
    {
      id: "tease_35_dice_of_fate_morning",
      number: 35,
      stage: 5,
      stageLabel: "Stufe 5: Alltag & Stealth",
      title: "Das Schicksals-Würfeln (The Dice of Fate)",
      category: "teasing_gamification",
      requiredEquipment: ["dice"],
      surveyRequirement: { chapter: 21, minRating: 2 },
      topInstruction: "Lass ihn morgens im Kniestand würfeln: Pasch = 15m Duschpause; Ungerade = +24h Verlängerung.",
      subInstruction: "Würfel werfen und das Urteil des Schicksals ohne Klage annehmen.",
      rationale: "Delegation an den Zufall entlastet die Partnerin und erzeugt Nervenkitzel.",
      spokenCommand: "Die Würfel sind gefallen. Dein Schicksal steht fest.",
      durationSeconds: 60,
      aftercareNote: "Käfigstatus im Ledger vermerken."
    },
    {
      id: "tease_36_remote_app_buzz",
      number: 36,
      stage: 5,
      stageLabel: "Stufe 5: Alltag & Stealth",
      title: "App-Controlled Remote Buzz im Alltag (Bluetooth)",
      category: "teasing_remote",
      requiredEquipment: ["remote_vibe"],
      surveyRequirement: { chapter: 20, minRating: 3 },
      topInstruction: "Lass ihn einen kompakten Bluetooth-Vibrator am Damm tragen. Aktiviere aus der Ferne überraschende Pulse.",
      subInstruction: "Im Alltag unauffällig bleiben, Zuckungen unterdrücken.",
      rationale: "Unvorhersehbare Reizüberflutung im normalen sozialen Umfeld.",
      spokenCommand: "Ich bin immer bei dir. Egal wo du gerade stehst.",
      durationSeconds: 120,
      aftercareNote: "Vibrator per App ausschalten."
    },
    {
      id: "tease_37_scent_mask_sleeping",
      number: 37,
      stage: 5,
      stageLabel: "Stufe 5: Alltag & Stealth",
      title: "Die Duft-Maskierung zur Nacht (Scent-Mask)",
      category: "teasing_sensory",
      requiredEquipment: ["panties"],
      surveyRequirement: { chapter: 1, minRating: 2 },
      topInstruction: "Binde ihm vor dem Schlafen einen getragenen Slip so über die Nase, dass er die ganze Nacht deinen Duft inhaliert.",
      subInstruction: "Ruhig durch die Nase atmen, auf dem Rücken schlafen.",
      rationale: "Vollständige nächtliche Verknüpfung von Erholung und Bindung an den Top.",
      spokenCommand: "Schlaf mit meinem Duft ein. Du wachst in meinem Besitz auf.",
      durationSeconds: 300,
      aftercareNote: "Morgens sanft abnehmen."
    },

    // --- STUFE 6: SOMATISCHE TIEFENREIZUNG & CBT ---
    {
      id: "tease_38_spiked_cage_pins",
      number: 38,
      stage: 6,
      stageLabel: "Stufe 6: Mechanik & CBT",
      title: "Der Spiked-Cage Warnreiz (Anti-Erection Pins)",
      category: "teasing_cbt",
      requiredEquipment: ["spiked_cage"],
      surveyRequirement: { chapter: 7, minRating: 4 },
      topInstruction: "Setze abgerundete Anti-Erektions-Dornen in das Vorderteil ein. Jedes Anschwellen sticht warnend in die Eichel.",
      subInstruction: "Erotische Gedanken sofort mit Atemübungen beruhigen.",
      rationale: "Negative Biofeedback-Konditionierung: Erektion bestraft sich selbst.",
      spokenCommand: "Wag es nicht, hart zu werden. Der Käfig beißt zurück.",
      durationSeconds: 180,
      aftercareNote: "Dornen nach vereinbarter Zeit entfernen."
    },
    {
      id: "tease_39_estim_cage_tingle",
      number: 39,
      stage: 6,
      stageLabel: "Stufe 6: Mechanik & CBT",
      title: "E-Stim Käfig-Kribbeln (Tens über Basisring & Damm)",
      category: "teasing_estim",
      requiredEquipment: ["estim_device"],
      surveyRequirement: { chapter: 17, minRating: 4, vetoItemIds: [1701] },
      topInstruction: "Verbinde eine Elektrode mit dem Metallring, die zweite als Klebepad am Damm. Aktiviere sanfte Mikrostrom-Wellen (Stufe 2).",
      subInstruction: "Muskelzucken spüren, reglos daliegen.",
      rationale: "Direkte Depolarisation der Nervenfasern ohne physische Bewegung.",
      spokenCommand: "Der Strom fließt durch dein Becken. Ich halte den Regler.",
      durationSeconds: 180,
      aftercareNote: "Gerät sanft auf 0 drehen, Pads vorsichtig lösen."
    },
    {
      id: "tease_40_thermal_shock_flush",
      number: 40,
      stage: 6,
      stageLabel: "Stufe 6: Mechanik & CBT",
      title: "Die Hydro-Thermal-Wechseldusche",
      category: "teasing_thermal",
      requiredEquipment: ["shower"],
      surveyRequirement: { chapter: 1, minRating: 2 },
      topInstruction: "Spüle den Käfig beim Duschen 60s mit 38 °C warmem Wasser ab – gefolgt von einem schlagartigen Wechsel auf eiskaltes Wasser!",
      subInstruction: "Dem Kälteschock standhalten, tief ausatmen.",
      rationale: "Vaskuläre Schockreaktion (Vasodilatation gefolgt von extremer Vasokonstriktion).",
      spokenCommand: "Erst Wärme... und jetzt der Kälteschock!",
      durationSeconds: 120,
      aftercareNote: "Warmes Handtuch umwickeln."
    },
    {
      id: "tease_41_glute_bridge_hold",
      number: 41,
      stage: 6,
      stageLabel: "Stufe 6: Mechanik & CBT",
      title: "Glute Bridge mit Wand-Pressung am Damm",
      category: "teasing_fitness",
      requiredEquipment: ["wand_massager"],
      surveyRequirement: { chapter: 21, minRating: 3 },
      topInstruction: "Lass ihn 3 Minuten in die Beckenbrücke gehen. Presse von unten den Magic Wand direkt gegen die Dammsehne.",
      subInstruction: "Becken oben halten, auch wenn die Oberschenkel brennen.",
      rationale: "Isometrische Muskelerschöpfung trifft auf tiefe Schwingungsresonanz.",
      spokenCommand: "Halt die Brücke oben! Jeder Zentimeter Absinken kostet 10 Schläge.",
      durationSeconds: 180,
      aftercareNote: "Becken absenken lassen, Beine ausschütteln."
    },
    {
      id: "tease_42_stocking_foot_friction",
      number: 42,
      stage: 6,
      stageLabel: "Stufe 6: Mechanik & CBT",
      title: "Käfig-Footjob mit Nylonstrümpfen",
      category: "teasing_foot",
      requiredEquipment: ["nylons"],
      surveyRequirement: { chapter: 12, minRating: 3 },
      topInstruction: "Reibe deine in feine Nylons gehüllten Fußsohlen und Zehen mit leichtem Druck über das Gitter und die Hoden.",
      subInstruction: "Zu ihren Füßen liegen, die feine Fasertextur am Gehäuse spüren.",
      rationale: "Kombination aus Fußfetisch-Unterwerfung und Reibungshitze am Metall.",
      spokenCommand: "Dien meinen Füßen. Du bist ihr Spielzeug.",
      durationSeconds: 180,
      aftercareNote: "Ihn deine Füße massieren lassen."
    },

    // --- STUFE 7: PSYCHOLOGISCHE ERNIEDRIGUNG & ROLLENVERZERRUNG ---
    {
      id: "tease_43_dildo_ride_standin",
      number: 43,
      stage: 7,
      stageLabel: "Stufe 7: Scham-Katharsis",
      title: "Der Dildo-Ersatz auf dem Becken (Stand-In Ride)",
      category: "teasing_dominance",
      requiredEquipment: ["dildo_suction", "harness"],
      surveyRequirement: { chapter: 23, minRating: 4 },
      topInstruction: "Befestige einen Saugnapf-Dildo über seinem eingesperrten Käfig. Setze dich rittlings darauf und reite ihn bis zum Orgasmus.",
      subInstruction: "Unter ihr liegen, ihre Ekstase spüren, während das eigene Glied nutzlos darunter gefangen ist.",
      rationale: "Vollkommene Dekonstruktion des maskulinen Schwellkörper-Egos.",
      spokenCommand: "Ersetzt durch Silikon. Du schaust nur zu, wie ich auf dir komme.",
      durationSeconds: 300,
      aftercareNote: "Ihn fest umarmen, seine Hingabe würdigen."
    },
    {
      id: "tease_44_shrinkage_audit",
      number: 44,
      stage: 7,
      stageLabel: "Stufe 7: Scham-Katharsis",
      title: "Das Mess- & Schwind-Protokoll (Shrinkage Audit)",
      category: "teasing_protocol",
      requiredEquipment: ["measuring_tape", "notebook"],
      surveyRequirement: { chapter: 21, minRating: 3 },
      topInstruction: "Tritt mit einem Schneidermaßband an, miss die schlaffe Länge im Käfig millimetergenau ab und notiere sie laut im Buch.",
      subInstruction: "Reglos im Kniestand verharren, die Vermessung erdulden.",
      rationale: "Psychologische Umdeutung: Kleinheit und Gehorsam werden zur gelobten Tugend.",
      spokenCommand: "Zwei Millimeter kürzer als letzte Woche. Sehr vorbildlich, mein Zwerg.",
      durationSeconds: 120,
      aftercareNote: "Buch schließen, über den Kopf streicheln."
    },
    {
      id: "tease_45_pillow_humping_exile",
      number: 45,
      stage: 7,
      stageLabel: "Stufe 7: Scham-Katharsis",
      title: "Erlaubtes Kissen-Reiben vor der Schlafzimmertür",
      category: "teasing_frustration",
      requiredEquipment: ["pillow"],
      surveyRequirement: { chapter: 22, minRating: 3 },
      topInstruction: "Verbanne ihn mit einem Kissen vor die geschlossene Schlafzimmertür. Erlaube ihm, seinen Käfig am Stoff zu reiben, während du drinnen entspannst.",
      subInstruction: "Vor der Tür auf Knien am Kissen reiben; die Frustration spüren.",
      rationale: "Räumliche Exklusion verstärkt die Sehnsucht nach Wiederaufnahme.",
      spokenCommand: "Reib dich am Kissen. Die Tür bleibt heute zu.",
      durationSeconds: 300,
      aftercareNote: "Tür öffnen, ihn hereinbitten, Decke geben."
    },
    {
      id: "tease_46_marking_caged_pet",
      number: 46,
      stage: 7,
      stageLabel: "Stufe 7: Scham-Katharsis",
      title: "Lackierte Scham & Glitzer (Marking the Pet)",
      category: "teasing_sissy",
      requiredEquipment: ["nail_polish"],
      surveyRequirement: { chapter: 10, minRating: 3 },
      topInstruction: "Lackiere seine Zehennägel in leuchtendem Rosa. Massiere Duftöl um den Basisring.",
      subInstruction: "Füße stillhalten, die optische Markierung betrachten.",
      rationale: "Optisches Brandmarken als Besitztum der Herrin.",
      spokenCommand: "Lackiert und versiegelt. Mein hübsches Eigentum.",
      durationSeconds: 240,
      aftercareNote: "Lack trocknen lassen, Füße wärmen."
    },
    {
      id: "tease_47_service_debt_tax",
      number: 47,
      stage: 7,
      stageLabel: "Stufe 7: Scham-Katharsis",
      title: "Die Orgasmus-Steuer & Tribut-Schulden (Service Debt)",
      category: "teasing_ledger",
      requiredEquipment: ["ledger_app"],
      surveyRequirement: { chapter: 21, minRating: 2 },
      topInstruction: "Eröffne ihm im Ledger eine Schuldenliste für eine eventuelle spätere Freigabe: 5 Massagen, 3x Frühstück, 2 Wochen Null-Widerrede.",
      subInstruction: "Die Tribut-Schulden demütig bestätigen.",
      rationale: "Kopplung von sexueller Erlösung an reale, tagelange Dienstbarkeit.",
      spokenCommand: "Freiheit gibt es nicht umsonst. Arbeite deine Schulden ab.",
      durationSeconds: 120,
      aftercareNote: "Aufgaben im Ledger freischalten."
    },

    // --- STUFE 8: EXPLIZITE GRENZGÄNGE & KATHARSIS ---
    {
      id: "tease_48_pegging_denial_kneeling",
      number: 48,
      stage: 8,
      stageLabel: "Stufe 8: Grenzgänge & Katharsis",
      title: "Anales Melken mit Dildo im Kniestand (Pegging Denial)",
      category: "teasing_anal",
      requiredEquipment: ["strapon", "lube"],
      surveyRequirement: { chapter: 5, minRating: 5, vetoItemIds: [501, 502] },
      topInstruction: "Stoße den Dildo im Nadu-Kniestand rhythmisch in seine Prostata. Beschleunige bis kurz vor den Orgasmus – und ziehe ihn schlagartig heraus!",
      subInstruction: "Kopf auf die Unterarme legen, die innere Überreizung aushalten.",
      rationale: "Maximale Überstimulation des Nervus pudendus ohne finale Ejakulation.",
      spokenCommand: "Gleich... gleich... und STOPP! Herausgezogen.",
      durationSeconds: 300,
      aftercareNote: "Warmes Tuch auflegen, 20 Minuten enges Halten in Decken."
    },
    {
      id: "tease_49_ticking_ksafe_bath",
      number: 49,
      stage: 8,
      stageLabel: "Stufe 8: Grenzgänge & Katharsis",
      title: "Die Zeitbombe im Lavendelbad (Ticking kSafe)",
      category: "teasing_water",
      requiredEquipment: ["bathtub", "ksafe"],
      surveyRequirement: { chapter: 7, minRating: 3 },
      topInstruction: "Lass ihn gefesselt im warmen Badewasser liegen. Platziere den tickenden kSafe mit dem Schlüssel sichtbar auf der Wannenbrücke.",
      subInstruction: "Im warmen Wasser liegen, den Sekunden beim Herablaufen zuschauen.",
      rationale: "Vaskuläre Entspannung im warmen Wasser trifft auf den akustischen Nervenkitzel der Uhr.",
      spokenCommand: "Das Wasser ist warm. Dein Schlüssel ist nah. Und doch unerreichbar.",
      durationSeconds: 600,
      aftercareNote: "Ihn sanft abtrocknen, in dicke Badetücher hüllen."
    },
    {
      id: "tease_50_labia_squeeze_friction",
      number: 50,
      stage: 8,
      stageLabel: "Stufe 8: Grenzgänge & Katharsis",
      title: "Schamlippen-Biss über dem Käfig (Labia Friction)",
      category: "teasing_sensual",
      requiredEquipment: [],
      surveyRequirement: { chapter: 2, minRating: 4 },
      topInstruction: "Spreize deine Schamlippen und presse deine feuchte Klitoris mit vollem Druck kreisend gegen die Gitterstäbe des Käfigs.",
      subInstruction: "Ihre Nässe und ihren Druck reglos aufnehmen.",
      rationale: "Grenzbereich sensorischer Nähe: Sie nutzt sein Gefängnis als ihr Lust-Tool.",
      spokenCommand: "Dein Käfig befriedigt mich. Du selbst bleibst verschlossen.",
      durationSeconds: 180,
      aftercareNote: "Zusammen kuscheln."
    },
    {
      id: "tease_51_cuckold_trophy_guard",
      number: 51,
      stage: 8,
      stageLabel: "Stufe 8: Grenzgänge & Katharsis",
      title: "Die Trophäen-Wache (Cuckold Trophy Guard)",
      category: "teasing_cuckold",
      requiredEquipment: ["panties"],
      surveyRequirement: { chapter: 25, minRating: 5, vetoItemIds: [2501] },
      topInstruction: "Überreiche ihm deine getragene Unterwäsche. Er muss sie ehrerbietig auf einer Schale bis zum nächsten Morgen keusch bewachen.",
      subInstruction: "Die Trophäe auf Knien entgegennehmen, ihren Duft riechen, keusch wachen.",
      rationale: "Höchste Form psychologischer Rollen-Auslieferung im Cuckold-Spektrum.",
      spokenCommand: "Bewache mein Höschen. Du weißt, wem ich heute Nacht gehört habe.",
      durationSeconds: 120,
      aftercareNote: "Morgendliche Begrüßung mit Wärme und Fürsorge."
    },
    {
      id: "tease_52_ruined_in_chains",
      number: 52,
      stage: 8,
      stageLabel: "Stufe 8: Grenzgänge & Katharsis",
      title: "Der „Ruined in Chains“-Orgasmus (Forced Caged Climax)",
      category: "teasing_climax",
      requiredEquipment: ["wand_massager"],
      surveyRequirement: { chapter: 7, minRating: 5, vetoItemIds: [701] },
      topInstruction: "Presse den Magic Wand auf Höchststufe 2 Minuten ununterbrochen auf das Gitter – ungeachtet seines Flehens. Das Sperma läuft kraftlos aus.",
      subInstruction: "Dem Krampf im engen Käfig nicht ausweichen können; die Ausweglosigkeit spüren.",
      rationale: "Die ultimative Demütigung: Der Orgasmus bricht durch, verpufft aber in der Enge des Käfigs ohne Schaftbefriedigung.",
      spokenCommand: "Krampf ruhig aus! Dein Orgasmus gehört ganz mir.",
      durationSeconds: 180,
      aftercareNote: "Gerät sofort abnehmen, Hand auflegen, 25 Minuten Decken-Aftercare und Reinigung."
    }
  ];

  // -------------------------------------------------------------
  // 4. API & ENGINE-METHODEN
  // -------------------------------------------------------------
  function getTeasingMethodsByStage(stageNum) {
    return TEASING_CATALOG.filter(function(m) { return m.stage === stageNum; });
  }

  function getTeasingMethodById(id) {
    return TEASING_CATALOG.find(function(m) { return m.id === id; });
  }

  function filterMethodsForCouple(answersBottom, answersTop, ownedEquipmentIds) {
    var rawOwned = ownedEquipmentIds || [];
    var ansSub = answersBottom || {};
    var ansTop = answersTop || {};

    return TEASING_CATALOG.filter(function(method) {
      // 1. Schrank-Prüfung (nur wenn spezifische Tools nötig sind)
      if (method.requiredEquipment && method.requiredEquipment.length > 0) {
        var hasRequired = method.requiredEquipment.every(function(eq) {
          if (eq === 'hands' || eq === 'shower' || eq === 'bathtub') return true;
          return rawOwned.indexOf(eq) !== -1;
        });
        if (!hasRequired && method.stage >= 6) return false;
      }

      // 2. Tabu-Prüfung aus Fragebogen (VetoItemIds Note 1)
      if (method.surveyRequirement && method.surveyRequirement.vetoItemIds) {
        var hasVeto = method.surveyRequirement.vetoItemIds.some(function(vId) {
          return ansSub['it_' + vId + '_r2'] === 1 || ansTop['it_' + vId + '_r1'] === 1;
        });
        if (hasVeto) return false;
      }

      // 3. Mindest-Rating Prüfung (z. B. Cuckold, Sissy, Anal)
      if (method.surveyRequirement && method.surveyRequirement.chapter) {
        var ch = method.surveyRequirement.chapter;
        var min = method.surveyRequirement.minRating || 2;
        // Wenn Cuckold (25) oder Sissy (10) angefragt wird, MUSS die Note >= 4 sein!
        if (ch === 25 || ch === 10) {
          var valSub = ansSub['it_' + (ch * 100 + 1) + '_r2'] || 0;
          var valTop = ansTop['it_' + (ch * 100 + 1) + '_r1'] || 0;
          if (valSub < 4 || valTop < 3) return false;
        }
      }

      return true;
    });
  }

  function getRecommendedTeasingForDay(dayNumber, answersSub, answersTop, ownedEquip) {
    var phaseKey = "phase_entry";
    if (dayNumber >= 22) phaseKey = "phase_permanent";
    else if (dayNumber >= 8) phaseKey = "phase_deep_subspace";
    else if (dayNumber >= 4) phaseKey = "phase_climbing";

    var phase = TENSION_PHASES[phaseKey];
    var filtered = filterMethodsForCouple(answersSub, answersTop, ownedEquip);

    // Priorisiere Methoden der aktuellen Phase
    var matched = filtered.filter(function(m) {
      if (phaseKey === "phase_entry") return m.stage <= 2;
      if (phaseKey === "phase_climbing") return m.stage >= 2 && m.stage <= 4;
      if (phaseKey === "phase_deep_subspace") return m.stage >= 3 && m.stage <= 6;
      return m.stage >= 5;
    });

    return {
      phase: phase,
      recommendedMethods: matched.length > 0 ? matched : filtered.slice(0, 5)
    };
  }

  window.ChastityDatabase = {
    workplaces: WORKPLACE_PROFILES,
    tensionPhases: TENSION_PHASES,
    catalog: TEASING_CATALOG,
    getByStage: getTeasingMethodsByStage,
    getById: getTeasingMethodById,
    filterForCouple: filterMethodsForCouple,
    getRecommendationForDay: getRecommendedTeasingForDay
  };

})(window);
