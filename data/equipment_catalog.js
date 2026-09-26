/**
 * data/equipment_catalog.js
 * Zentraler Stammkatalog für BDSM-Ausrüstung, Haushaltsgegenstände
 * und die physikalische Verträglichkeits- & Logikmatrix.
 */

// 1. OMNIPRÄSENTE GRUNDKONSTANTEN
// Diese Dinge existieren in jedem Schlafzimmer und werden NIEMALS
// als "fehlendes Spielzeug" gefiltert.
window.universalConstants = [
  { id: "bare_hands", name: "Nackte Hände & Handflächen", type: "body", desc: "Spanking, Halten, Zupacken, Kraulen, Kinnführung, Wangenstreichen" },
  { id: "body_weight", name: "Eigenes Körpergewicht", type: "body", desc: "Niederdrücken, Fixieren durch Drauflegen, Pinnen am Boden" },
  { id: "floor_carpet", name: "Fußboden & Teppich", type: "environment", desc: "Knien (Nadu/Seiza), Niederwerfen, Liegen, Kräftemessen" },
  { id: "bed_mattress", name: "Bett & Matratzenkante", type: "environment", desc: "Vorbeugen, Fixieren, Erhöhtes Becken, Festhalten am Rahmen" },
  { id: "wall_door", name: "Wand & Türrahmen", type: "environment", desc: "Anlehnen, Pranger-Stand, Aufrecht verharren, Fixierung im Durchgang" },
  { id: "chair_sofa", name: "Stabiler Stuhl / Sessel", type: "environment", desc: "Sitzende Führung, Beine auflegen, Vorbeuge über Sessellehne" },
  { id: "pillows_blanket", name: "Kopfkissen & Bettdecke", type: "environment", desc: "Beckenerhöhung, Schalldämpfung, Einkuscheln im Aftercare" },
  { id: "voice_breath", name: "Stimme & Atem", type: "body", desc: "Befehle, Dirty Talk, Mitzählen, Atemsynchronisation, Keuchen" }
];

// 2. VOLLSTÄNDIGER AUSRÜSTUNGS- & TOY-KATALOG
window.equipmentCatalog = [
  // ==========================================
  // KATEGORIE A: HAUSHALT & IMPROVISIERT (Praxiserprobt)
  // ==========================================
  {
    id: "belt_leather",
    name: "Ledergürtel (Gefaltet)",
    category: "household",
    subCategory: "impact",
    intensity: [2, 3],
    desc: "Satter, dumpfer Hautreiz mit deutlichem akustischem Klatschen auf Gesäß oder Oberschenkel.",
    defaultPresent: true,
    aiTag: "Gefalteter schwerer Ledergürtel"
  },
  {
    id: "silk_tie_scarf",
    name: "Seidenkrawatte / Seidenschal",
    category: "household",
    subCategory: "bondage_sensory",
    intensity: [1, 2],
    desc: "Weiches Fesseln der Handgelenke oder blickdichte Augenbinde ohne schmerzhafte Druckstellen.",
    defaultPresent: true,
    aiTag: "Seidenkrawatte oder weicher Seidenschal"
  },
  {
    id: "clothespins_wood",
    name: "Wäscheklammern aus Holz",
    category: "household",
    subCategory: "clamps",
    intensity: [2, 3],
    desc: "Punktueller Klemmreiz an Brustwarzen oder Schamlippen mit spürbarem Zugpotenzial.",
    defaultPresent: true,
    aiTag: "Klassische Holzwäscheklammern"
  },
  {
    id: "clothespins_plastic",
    name: "Wäscheklammern aus Kunststoff",
    category: "household",
    subCategory: "clamps",
    intensity: [1, 2],
    desc: "Leichtere Federung für sanftere Einstiege in den Klemmreiz.",
    defaultPresent: true,
    aiTag: "Kunststoff-Wäscheklammern"
  },
  {
    id: "wooden_spoon",
    name: "Holzkochspachtel / Kochlöffel",
    category: "household",
    subCategory: "impact",
    intensity: [2, 3],
    desc: "Harter, schallender Schlagreiz mit minimalem Kraftaufwand des Tops; knackiger Hautreiz.",
    defaultPresent: true,
    aiTag: "Breiter Holzkochlöffel"
  },
  {
    id: "hairbrush_wood",
    name: "Klassische Haarbürste (Holzrücken)",
    category: "household",
    subCategory: "impact",
    intensity: [2, 3],
    desc: "Breitflächige Hautreizung auf dem Gesäß; ideal für traditionelle Over-the-Knee Zucht.",
    defaultPresent: true,
    aiTag: "Haarbürste mit stabilem Holzrücken"
  },
  {
    id: "ice_cubes",
    name: "Eiswürfel / Kälte-Gelpack",
    category: "household",
    subCategory: "temperature",
    intensity: [1, 2, 3],
    desc: "Sensorischer Kälteschock; Kühlen heißer Schlagstellen oder Reizung der Brustwarzen und Eichel.",
    defaultPresent: true,
    aiTag: "Schmelzende Eiswürfel"
  },
  {
    id: "soft_cloth_towel",
    name: "Weiches Gästehandtuch / Stofftuch",
    category: "household",
    subCategory: "gag_signal",
    intensity: [1, 2],
    desc: "Dient als weicher Tuchknebel zwischen den Zähnen oder als Drop-Tuch in der Hand.",
    defaultPresent: true,
    aiTag: "Gefaltetes weiches Stofftuch"
  },
  {
    id: "body_lotion_oil",
    name: "Mandelöl / Feuchtigkeitscreme",
    category: "household",
    subCategory: "care",
    intensity: [1],
    desc: "Einbalsamieren beanspruchter Hautstellen im Aftercare; Gleitmassagen und Pflege.",
    defaultPresent: true,
    aiTag: "Warmes Körperöl oder Pflegebalsam"
  },
  {
    id: "baking_spatula_silicone",
    name: "Silikon-Teigschaber",
    category: "household",
    subCategory: "impact",
    intensity: [1, 2],
    desc: "Flexibler, klatschender Hautreiz mit scharfem Laut und milder Tiefenwirkung.",
    defaultPresent: true,
    aiTag: "Breiter Silikon-Teigschaber"
  },
  {
    id: "feather_duster",
    name: "Kitzelfeder / Schminkpinsel",
    category: "household",
    subCategory: "sensory",
    intensity: [1],
    desc: "Zarte Berührung über Oberschenkelinnenseiten, Fußsohlen oder Rippen zur Kontrastierung.",
    defaultPresent: true,
    aiTag: "Zarter Pinsel oder Daunenfeder"
  },
  {
    id: "hot_water_bottle",
    name: "Wärmflasche / Warmpack",
    category: "household",
    subCategory: "temperature",
    intensity: [1],
    desc: "Wohltuende Tiefenwärme für den Lendenbereich im Aftercare oder zur Entspannung.",
    defaultPresent: true,
    aiTag: "Warme Bettflasche"
  },
  {
    id: "painter_tape",
    name: "Malerkrepp / Sanftes Tape",
    category: "household",
    subCategory: "bondage",
    intensity: [1, 2],
    desc: "Hinterlässt keine Kleberückstände; fixiert Finger oder verschließt symbolisch Lippen.",
    defaultPresent: true,
    aiTag: "Reißfestes Malerkrepp-Band"
  },

  // ==========================================
  // KATEGORIE B: IMPACT PLAY & DISZIPLINIERUNG
  // ==========================================
  {
    id: "leather_paddle_wide",
    name: "Leder-Paddle (Breitflächig)",
    category: "impact",
    subCategory: "paddle",
    intensity: [2, 3],
    desc: "Thuddy Impact mit tiefem Gewebereiz und geringer Verletzungsgefahr; sattes Geräusch.",
    defaultPresent: false,
    aiTag: "Schweres doppellagiges Leder-Paddle"
  },
  {
    id: "suede_flogger_multi",
    name: "Wildleder-Flogger (Vielriemig)",
    category: "impact",
    subCategory: "flogger",
    intensity: [1, 2],
    desc: "Warmes Prasseln vieler weicher Lederriemen zur Durchwärmung und Trance-Induktion.",
    defaultPresent: false,
    aiTag: "Vielriemiger weicher Wildleder-Flogger"
  },
  {
    id: "leather_flogger_heavy",
    name: "Glattleder-Flogger (Schwere Riemen)",
    category: "impact",
    subCategory: "flogger",
    intensity: [2, 3],
    desc: "Kräftigere Trefferwirkung mit spürbarem Stich bei schnellen Schwüngen.",
    defaultPresent: false,
    aiTag: "Schwerer Glattleder-Flogger"
  },
  {
    id: "riding_crop_standard",
    name: "Reitgerte mit Lederklatsche",
    category: "impact",
    subCategory: "crop",
    intensity: [2, 3],
    desc: "Präzise gesetzte Hiebe mit schallender Klatsche auf Muskelpartien.",
    defaultPresent: false,
    aiTag: "Präzise Leder-Reitgerte"
  },
  {
    id: "riding_crop_slender",
    name: "Dressurgerte (Langer flexibler Stab)",
    category: "impact",
    subCategory: "crop",
    intensity: [2, 3],
    desc: "Schneidender, brennender Reiz mit hoher Reichweite und exakter Linienführung.",
    defaultPresent: false,
    aiTag: "Lange flexible Dressurgerte"
  },
  {
    id: "wooden_spanking_board_perforated",
    name: "Hartholz-Paddle mit Lochung",
    category: "impact",
    subCategory: "paddle",
    intensity: [3],
    desc: "Knackiger, extrem lauter Schmerzreiz mit minimalem Luftwiderstand.",
    defaultPresent: false,
    aiTag: "Gelochtes Hartholz-Paddle"
  },
  {
    id: "bamboo_cane",
    name: "Bambus-Cane / Schlagstock",
    category: "impact",
    subCategory: "cane",
    intensity: [3],
    desc: "Traditionelles Werkzeug für präzise, feurige Striemen auf dem muskulösen Gesäß.",
    defaultPresent: false,
    aiTag: "Flexibler Bambus-Cane"
  },
  {
    id: "rubber_slapper",
    name: "Gummi-Slapper / Neopren-Klatsche",
    category: "impact",
    subCategory: "paddle",
    intensity: [2, 3],
    desc: "Hochelastischer Hautreiz mit lauter akustischer Resonanz ohne Blutergussrisiko.",
    defaultPresent: false,
    aiTag: "Schwarzer Gummi-Slapper"
  },
  {
    id: "leather_strap_tawse",
    name: "Schottische Leder-Tawse (Geschlitzt)",
    category: "impact",
    subCategory: "strap",
    intensity: [3],
    desc: "Mehrfach geschlitzter dicker Lederriemen für formelle Disziplinierungsrituale.",
    defaultPresent: false,
    aiTag: "Geschlitzte Leder-Tawse"
  },

  // ==========================================
  // KATEGORIE C: FESSELUNG & FIXIERUNG
  // ==========================================
  {
    id: "leather_wrist_cuffs",
    name: "Leder-Handgelenksmanschetten",
    category: "bondage",
    subCategory: "cuffs",
    intensity: [1, 2, 3],
    desc: "Gepolsterte Bänder mit D-Ringen und Schnallen für verlässliche Arretierung.",
    defaultPresent: false,
    aiTag: "Gepolsterte Leder-Handmanschetten"
  },
  {
    id: "leather_ankle_cuffs",
    name: "Leder-Fußfesseln mit Verbindungssteg",
    category: "bondage",
    subCategory: "cuffs",
    intensity: [1, 2, 3],
    desc: "Beschränkung der Schrittweite auf Trippelschritte oder feste Arretierung am Bett.",
    defaultPresent: false,
    aiTag: "Leder-Fußfesseln mit Kettenglied"
  },
  {
    id: "velcro_cuffs_quick",
    name: "Klettfesseln mit Schnellabwurf",
    category: "bondage",
    subCategory: "cuffs",
    intensity: [1, 2],
    desc: "Komfortable Fesseln mit sofortiger Notfall-Trennung durch beherzten Zug.",
    defaultPresent: false,
    aiTag: "Klettfesseln mit Schnellöffnung"
  },
  {
    id: "shibari_jute_rope_6mm",
    name: "Juteseile (6mm geölt, 2x 7,5m)",
    category: "bondage",
    subCategory: "rope",
    intensity: [2, 3],
    desc: "Griffige Naturfaserseile für Brustgeschirr (Takate Kote) oder Schenkelführung.",
    defaultPresent: false,
    aiTag: "Geölte Shibari-Juteseile"
  },
  {
    id: "cotton_rope_soft",
    name: "Weiche Baumwollseile (8mm)",
    category: "bondage",
    subCategory: "rope",
    intensity: [1, 2],
    desc: "Sanfte Faser ohne Kratzen; ideal für Einsteiger und einfache Armbindungen.",
    defaultPresent: false,
    aiTag: "Weiche weiße Baumwollseile"
  },
  {
    id: "spread_bar_rigid",
    name: "Edelstahl-Spreizstange (Starre Öffnung)",
    category: "bondage",
    subCategory: "bars",
    intensity: [2, 3],
    desc: "Arretiert die Knöchel in 70-80cm Distanz; Schließen der Beine unmöglich.",
    defaultPresent: false,
    aiTag: "Starre Edelstahl-Spreizstange"
  },
  {
    id: "bed_restraint_straps",
    name: "Untermatratzen-Gurtsystem",
    category: "bondage",
    subCategory: "straps",
    intensity: [2, 3],
    desc: "Kreuzgurte unter der Matratze mit 4 Karabinern an den Bettecken.",
    defaultPresent: false,
    aiTag: "4-Punkt-Bettbegurtung"
  },
  {
    id: "leather_collar_leash",
    name: "Lederhalsband mit D-Ring & Führleine",
    category: "bondage",
    subCategory: "collars",
    intensity: [1, 2, 3],
    desc: "Symbol der Führung und Zugehörigkeit; sicheres Lenken des Partners im Raum.",
    defaultPresent: false,
    aiTag: "Breites Lederhalsband mit stabiler Leine"
  },
  {
    id: "posture_collar_stiff",
    name: "Starrer Haltungskragen (Posture Collar)",
    category: "bondage",
    subCategory: "collars",
    intensity: [2, 3],
    desc: "Hoher, versteifter Kragen; erzwingt erhobenes Kinn und aufrechten Blickkontakt.",
    defaultPresent: false,
    aiTag: "Starrer Haltungskragen"
  },
  {
    id: "leather_armbinder",
    name: "Leder-Armbinder (Monohandschuh)",
    category: "bondage",
    subCategory: "binders",
    intensity: [3],
    desc: "Schnürhülle aus festem Leder; schließt beide Arme starr hinter dem Rücken ein.",
    defaultPresent: false,
    aiTag: "Geschnürter Leder-Armbinder"
  },
  {
    id: "thumb_cuffs",
    name: "Metall-Daumenschellen",
    category: "bondage",
    subCategory: "cuffs",
    intensity: [2, 3],
    desc: "Kompakte Fixierung der Daumen; unterbindet jedes feine Greifen oder Ausweichen.",
    defaultPresent: false,
    aiTag: "Präzise Daumenschellen"
  },
  {
    id: "carabiner_hardware_set",
    name: "Sicherheits-Karabiner & Ringe",
    category: "bondage",
    subCategory: "hardware",
    intensity: [1, 2, 3],
    desc: "Klettertaugliche Schraubkarabiner für rasches Ein- und Ausklinken von Fesseln.",
    defaultPresent: false,
    aiTag: "Schraubkarabiner und O-Ringe"
  },

  // ==========================================
  // KATEGORIE D: SENSORIK, MASKEN & KNEBEL
  // ==========================================
  {
    id: "leather_blindfold_padded",
    name: "Blickdichte Leder-Augenmaske",
    category: "sensory",
    subCategory: "sight",
    intensity: [1, 2, 3],
    desc: "Schaltet den Sehsinn vollständig ab; fokussiert auf Gehör, Geruch und Tastsinn.",
    defaultPresent: false,
    aiTag: "Blickdichte gepolsterte Leder-Augenbinde"
  },
  {
    id: "sleep_mask_silk",
    name: "Sanfte Seiden-Schlafbrille",
    category: "sensory",
    subCategory: "sight",
    intensity: [1],
    desc: "Leichte Verdunklung ohne Druck auf Wimpern oder Schläfen.",
    defaultPresent: false,
    aiTag: "Weiche Seiden-Augenmaske"
  },
  {
    id: "silicone_ball_gag_45mm",
    name: "Silikon-Ballknebel (45mm)",
    category: "sensory",
    subCategory: "gag",
    intensity: [2, 3],
    desc: "Füllt den Mundraum lückenlos aus; erzwingt Nasenatmung (Max. 15 Min. Safety-Check!).",
    defaultPresent: false,
    aiTag: "Silikon-Ballknebel mit Lederriemen"
  },
  {
    id: "open_ring_gag_metal",
    name: "Offener Ringknebel (Speichelfluss)",
    category: "sensory",
    subCategory: "gag",
    intensity: [2, 3],
    desc: "Hält den Mund starr geöffnet; Speichelbildung ungehindert, Sprechen unmöglich.",
    defaultPresent: false,
    aiTag: "Offener Edelstahl-Ringknebel"
  },
  {
    id: "tube_gag_breathing",
    name: "Rohrknebel mit Atemkanal",
    category: "sensory",
    subCategory: "gag",
    intensity: [2, 3],
    desc: "Mundstück mit zentraler Röhre; ermöglicht freie Mundatmung trotz voller Sprechblockade.",
    defaultPresent: false,
    aiTag: "Rohrknebel mit Atemöffnung"
  },
  {
    id: "low_temp_wax_candle",
    name: "Niedrigtemperatur-Tropfkerze (Sojawachs)",
    category: "sensory",
    subCategory: "temperature",
    intensity: [2, 3],
    desc: "Spezielles Sojawachs (Schmelzpunkt ~48°C) für schmerzfreie, wohlige Hitzekicks.",
    defaultPresent: false,
    aiTag: "BDSM-Niedrigtemperaturkerze"
  },
  {
    id: "wartenberg_wheel",
    name: "Wartenberg-Nadelrad",
    category: "sensory",
    subCategory: "pain_sharp",
    intensity: [2, 3],
    desc: "Zahnrad aus Edelstahl für prickelnde Reizlinien über Brustkorb, Rücken und Schenkel.",
    defaultPresent: false,
    aiTag: "Edelstahl-Wartenbergrad"
  },
  {
    id: "tuning_fork_128hz",
    name: "Medizinische Stimmgabel (128Hz)",
    category: "sensory",
    subCategory: "vibration",
    intensity: [1, 2],
    desc: "Tiefe Vibration direkt auf Knochenpunkten (Schlüsselbein, Brustbein, Schläfe).",
    defaultPresent: false,
    aiTag: "Angeschlagene Stimmgabel am Knochen"
  },
  {
    id: "noise_cancelling_headphones",
    name: "Noise-Cancelling-Kopfhörer",
    category: "sensory",
    subCategory: "sound",
    intensity: [1, 2],
    desc: "Blendet alle Außengeräusche aus; erzwingt Fokus auf innere Ruhe oder Trance-Sprache.",
    defaultPresent: false,
    aiTag: "Abschirmende Kapselkopfhörer"
  },
  {
    id: "leather_hood_open_eyes",
    name: "Leder-Haube mit Augen-/Mundöffnung",
    category: "sensory",
    subCategory: "hood",
    intensity: [2, 3],
    desc: "Umschließt den Kopf eng; dämpft Haarbewegungen und verstärkt das Gefühl des Ausgeliefertseins.",
    defaultPresent: false,
    aiTag: "Geschnürte Lederhaube"
  },

  // ==========================================
  // KATEGORIE E: TOYS, ORGASMUSKONTROLLE & STIMULATION
  // ==========================================
  {
    id: "chastity_cage_steel",
    name: "Keuschheitskäfig (Edelstahl)",
    category: "orgasm_control",
    subCategory: "cage",
    intensity: [2, 3],
    desc: "Schwere physische Verriegelung des Glieds mit Vorhängeschloss für den Top.",
    defaultPresent: false,
    aiTag: "Passgenauer Edelstahl-Keuschheitskäfig"
  },
  {
    id: "chastity_cage_resin",
    name: "Keuschheitskäfig (Leichtes Resin/Harz)",
    category: "orgasm_control",
    subCategory: "cage",
    intensity: [2, 3],
    desc: "Atmungsaktiver, leichter Käfig für längeres ununterbrochenes Tragen im Alltag.",
    defaultPresent: false,
    aiTag: "Leichter Harz-Keuschheitskäfig"
  },
  {
    id: "clover_nipple_clamps",
    name: "Kleeblatt-Brustwarzenklemmen mit Schrauben",
    category: "stimulation",
    subCategory: "clamps",
    intensity: [2, 3],
    desc: "Justierbare Rändelschrauben zur stufenlosen Druckregulierung an den Nippeln.",
    defaultPresent: false,
    aiTag: "Einstellbare Kleeblatt-Klemmen"
  },
  {
    id: "tweezer_clamps_chain",
    name: "Pinzettenklemmen mit Verbindungskette",
    category: "stimulation",
    subCategory: "clamps",
    intensity: [2, 3],
    desc: "Gummierte Backen; Kette überträgt Zugkräfte von einer Brustwarze zur anderen.",
    defaultPresent: false,
    aiTag: "Verbundene Klemmen mit Kette"
  },
  {
    id: "remote_vibrator_app",
    name: "App- / Funk-gesteuerter Vibrator",
    category: "stimulation",
    subCategory: "toy",
    intensity: [1, 2, 3],
    desc: "Tragbares Toy für Damm oder Vulva; Intensität durch Top per Smartphone steuerbar.",
    defaultPresent: false,
    aiTag: "Fernbedienter Druckwellen-/Vibro-Stimulator"
  },
  {
    id: "magic_wand_heavy",
    name: "Stab-Vibrator (Magic Wand)",
    category: "stimulation",
    subCategory: "toy",
    intensity: [2, 3],
    desc: "Extrem kraftvolle Tiefenvibration für schnelles, intensives Treiben an die Erregungskante.",
    defaultPresent: false,
    aiTag: "Kraftvoller Stab-Vibrator"
  },
  {
    id: "metal_butt_plug_smooth",
    name: "Edelstahl-Analplug (Glatt)",
    category: "stimulation",
    subCategory: "anal",
    intensity: [1, 2, 3],
    desc: "Kühles Einsetzen, dehnendes Ausfüllen während anderer Bestrafungsmaßnahmen.",
    defaultPresent: false,
    aiTag: "Schwerer Edelstahl-Butt-Plug"
  },
  {
    id: "silicone_butt_plug_flexible",
    name: "Silikon-Analplug (Flexibler Schaft)",
    category: "stimulation",
    subCategory: "anal",
    intensity: [1, 2],
    desc: "Bequemer, anschmiegsamer Sitz für längeres Tragen während Vorbeugen.",
    defaultPresent: false,
    aiTag: "Flexibler Silikon-Plug"
  },
  {
    id: "prostate_massager",
    name: "Prostata-Stimulator (Ergonomisch)",
    category: "stimulation",
    subCategory: "anal",
    intensity: [2, 3],
    desc: "Gezielter Druck auf den männlichen G-Punkt für freihändige Ekstase.",
    defaultPresent: false,
    aiTag: "Ergonomischer Prostata-Stimulator"
  },
  {
    id: "strap_on_harness",
    name: "Strap-on Geschirr & Dildo",
    category: "stimulation",
    subCategory: "pegging",
    intensity: [2, 3],
    desc: "Ermöglicht der Partnerin die aktive Penetration des Mannes (Pegging).",
    defaultPresent: false,
    aiTag: "Strap-on Geschirr mit flexiblem Dildo"
  },
  {
    id: "cock_ring_silicone_stretchy",
    name: "Silikon-Cockring (Strammer Sitz)",
    category: "stimulation",
    subCategory: "ring",
    intensity: [1, 2],
    desc: "Staut das Blut im Schaft für härtere Erektionen und verzögertes Kommen.",
    defaultPresent: false,
    aiTag: "Strammer Silikon-Cockring"
  },
  {
    id: "ball_stretcher_metal",
    name: "Edelstahl-Hodenring / Ball Stretcher",
    category: "stimulation",
    subCategory: "cbt",
    intensity: [2, 3],
    desc: "Schweres Metallteil; zieht die Hoden nach unten und erzeugt anhaltenden Zug.",
    defaultPresent: false,
    aiTag: "Schwerer Edelstahl-Hodenstretcher"
  },

  // ==========================================
  // KATEGORIE F: SCHUHE, STILETTOS & ACCESSORIES
  // ==========================================
  {
    id: "stiletto_heels_pointed",
    name: "Stiletto High Heels (Spitzer Absatz)",
    category: "apparel_shoes",
    subCategory: "footwear",
    intensity: [2, 3],
    desc: "Spitzer Metall- oder Kunststoffabsatz; ideal für gezielten Druck auf Po oder Schenkel.",
    defaultPresent: false,
    aiTag: "Spitze Stiletto High Heels"
  },
  {
    id: "leather_boots_knee",
    name: "Lederstiefel (Kniehoch / Overknee)",
    category: "apparel_shoes",
    subCategory: "footwear",
    intensity: [1, 2, 3],
    desc: "Fester Schaft, griffiges Leder; Geste der Dominanz, Schuh-Worship und Fußdruck.",
    defaultPresent: false,
    aiTag: "Kniehohe Glattleder-Stiefel"
  },
  {
    id: "latex_gloves_long",
    name: "Lange Latex- / Lederhandschuhe",
    category: "apparel_shoes",
    subCategory: "gloves",
    intensity: [1, 2],
    desc: "Kühles, glattes Material; distanzierte Berührung und feines Ertasten.",
    defaultPresent: false,
    aiTag: "Ellbogenlange Latexhandschuhe"
  },
  {
    id: "leather_corset_underbust",
    name: "Leder-Korsett (Echtschnürung)",
    category: "apparel_shoes",
    subCategory: "corset",
    intensity: [2, 3],
    desc: "Erzwingt aufrechte Haltung und markiert die dominante Präsenz der Herrin.",
    defaultPresent: false,
    aiTag: "Straff geschnürtes Lederkorsett"
  }
];

// 3. PHYSIKALISCHE & SEMANTISCHE VERTENSCHLUSS-MATRIX (Anti-Absurditäts-Prüfung)
// Verhindert anatomisch unmögliche Kombinationen
window.physicalConstraintRules = [
  {
    id: "rule_hands_back_cannot_self_spank",
    name: "Kein Selbstvollzug bei hinter dem Rücken fixierten Händen",
    condition: (setup) => {
      const handsBack = setup.bondage && (
        setup.bondage.id === "leather_wrist_cuffs" ||
        setup.bondage.id === "leather_armbinder" ||
        setup.bondage.id === "shibari_jute_rope_6mm" ||
        setup.posture?.id === "hands_behind_back"
      );
      const isSelfSpank = setup.action && (
        setup.action.id === "self_discipline" ||
        setup.action.category === "self_discipline" ||
        setup.action.title?.toLowerCase().includes("selbst") ||
        setup.action.desc?.toLowerCase().includes("selbst züchtig") ||
        setup.action.desc?.toLowerCase().includes("eigenhändig")
      );
      return handsBack && isSelfSpank;
    },
    correction: "Hände sind auf dem Rücken arretiert: Selbstschläge sind anatomisch unmöglich. Der TOP führt die Schläge aus.",
    autoFix: (setup) => {
      if (setup.action) {
        setup.action.category = "top_spank";
        setup.action.title = "Fremdvollzug: Top führt die Zucht aus (Hände des Bottoms bleiben gesichert)";
        if (setup.action.desc) {
          setup.action.desc = setup.action.desc.replace(/selbst/gi, "durch den Top").replace(/eigenhändig/gi, "vom Top geführt");
        }
      }
    }
  },
  {
    id: "rule_gag_cannot_count_aloud",
    name: "Kein lautes Mitzählen unter festem Knebel",
    condition: (setup) => {
      const isGagged = setup.sensory && (
        setup.sensory.id?.includes("gag") ||
        setup.sensory.category === "gag" ||
        setup.sensory.title?.toLowerCase().includes("knebel")
      );
      const mustCount = setup.action && (
        setup.action.title?.toLowerCase().includes("zähl") ||
        setup.action.desc?.toLowerCase().includes("laut mitzählen") ||
        setup.action.desc?.toLowerCase().includes("danke sagen")
      );
      return isGagged && mustCount;
    },
    correction: "Mit eingesetztem Knebel ist lautes Mitzählen anatomisch unmöglich. Wechsel zu taktilem Abklopfen mit der Handfläche.",
    autoFix: (setup) => {
      if (setup.action && setup.action.desc) {
        setup.action.desc = setup.action.desc.replace(/laut mitzählen/gi, "mit der Handfläche stumm auf den Oberschenkel abklopfen");
        setup.action.desc = setup.action.desc.replace(/laut 'Danke' sagen/gi, "mit zustimmendem Kopfnicken quittieren");
      }
    }
  },
  {
    id: "rule_standing_requires_feet_free",
    name: "Kein Gehen oder Stehen in der Ecke bei gespreizten/fixierten Knöcheln",
    condition: (setup) => {
      const feetBound = setup.bondage && (
        setup.bondage.id === "spread_bar_rigid" ||
        setup.bondage.id === "leather_ankle_cuffs" ||
        setup.bondage.id === "bed_restraint_straps"
      );
      const mustStandOrWalk = setup.posture && (
        setup.posture.id === "corner_time" ||
        setup.posture.id === "pacing" ||
        setup.posture.title?.toLowerCase().includes("ecke stehen") ||
        setup.posture.title?.toLowerCase().includes("aufrecht gehen")
      );
      return feetBound && mustStandOrWalk;
    },
    correction: "Mit gespreizten oder eng fixierten Knöcheln kann nicht in der Ecke gestanden werden. Wechsel zu Seiza-Fersensitz oder Vorbeuge an der Bettkante.",
    autoFix: (setup) => {
      if (setup.posture) {
        setup.posture.id = "kneeling_seiza";
        setup.posture.title = "Fersensitz (Seiza) am Boden";
        setup.posture.desc = "Aufrechter Kniestand mit gespreizten Schenkeln; der Unterkörper bleibt stabil arretiert.";
      }
    }
  },
  {
    id: "rule_blindfold_cannot_maintain_eye_contact",
    name: "Kein Blickkontakt unter blickdichter Augenbinde",
    condition: (setup) => {
      const isBlind = setup.sensory && (
        setup.sensory.id?.includes("blindfold") ||
        setup.sensory.id?.includes("hood") ||
        setup.sensory.title?.toLowerCase().includes("augenbinde")
      );
      const eyeContact = setup.posture && (
        setup.posture.title?.toLowerCase().includes("blickkontakt") ||
        setup.posture.desc?.toLowerCase().includes("in die augen blicken")
      );
      return isBlind && eyeContact;
    },
    correction: "Unter der Augenbinde ist Blickkontakt unmöglich. Wechsel zu erhobenem Kinn und Lauschen auf die Stimme des Tops.",
    autoFix: (setup) => {
      if (setup.posture && setup.posture.desc) {
        setup.posture.desc = setup.posture.desc.replace(/tief in die Augen blicken/gi, "den Kopf andächtig zur Stimme des Tops neigen");
      }
    }
  }
];

/**
 * Validiert ein gewähltes Strafritual gegen physische Gesetze
 * @param {Object} ritual { action, posture, bondage, sensory }
 * @returns {Object} { isValid: boolean, conflicts: string[], sanitizedRitual: Object }
 */
window.validateDisciplineSetup = function(ritual) {
  const conflicts = [];
  const sanitized = JSON.parse(JSON.stringify(ritual || {}));

  if (Array.isArray(window.physicalConstraintRules)) {
    window.physicalConstraintRules.forEach(rule => {
      try {
        if (rule.condition(sanitized)) {
          conflicts.push(rule.correction);
          if (typeof rule.autoFix === "function") {
            rule.autoFix(sanitized);
          }
        }
      } catch (e) {
        console.debug("Rule check error", e);
      }
    });
  }

  return {
    isValid: conflicts.length === 0,
    conflicts: conflicts,
    sanitizedRitual: sanitized
  };
};

/**
 * Holt alle verfügbaren Gegenstände (Kombination aus universalen Konstanten + aktivierten Inventar-Items)
 * @param {Array<string>} userActiveIds Optional: Liste aktivierter IDs aus dem Nachttisch-Staging
 * @returns {Array<Object>} Gefilterte Liste nutzbarer Items
 */
window.getActiveSessionEquipment = function(userActiveIds = null) {
  const universals = window.universalConstants || [];
  const fullCatalog = window.equipmentCatalog || [];

  let activeIds = userActiveIds;
  if (!activeIds) {
    try {
      const stored = localStorage.getItem("kompass_active_equipment_ids");
      if (stored) activeIds = JSON.parse(stored);
    } catch (e) {}
  }

  // Fallback: Alle Items mit defaultPresent: true
  if (!activeIds || !Array.isArray(activeIds) || activeIds.length === 0) {
    activeIds = fullCatalog.filter(i => i.defaultPresent).map(i => i.id);
  }

  const userItems = fullCatalog.filter(item => activeIds.includes(item.id));
  return [...universals, ...userItems];
};
