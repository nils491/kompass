/**
 * data/equipment_catalog.js
 * Zentraler Stammkatalog für BDSM-Ausrüstung, Haushaltsgegenstände
 * und die physikalische Verträglichkeits- & Logikmatrix.
 * 
 * Exakt abgestimmt auf alle 35 Kapitel des Fragenkatalogs (Teil 1 & Teil 2).
 */

// ==========================================
// 1. OMNIPRÄSENTE GRUNDKONSTANTEN
// Diese Dinge existieren in jedem Schlafzimmer und werden NIEMALS
// als "fehlendes Spielzeug" gefiltert oder deaktiviert.
// ==========================================
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

// ==========================================
// 2. VOLLSTÄNDIGER AUSRÜSTUNGS- & TOY-KATALOG
// Exakt gemappt auf alle Kapitel 1–35 des Fragenkatalogs
// ==========================================
window.equipmentCatalog = [
  // ----------------------------------------------------
  // KATEGORIE 1: HAUSHALT & IMPROVISIERT (household)
  // ----------------------------------------------------
  {
    id: "belt_leather",
    name: "Ledergürtel (Gefaltet)",
    category: "household",
    chapters: [16, 23],
    defaultPresent: true,
    aiTag: "Gefalteter schwerer Ledergürtel",
    desc: "Satter, dumpfer Hautreiz mit deutlichem akustischem Klatschen auf Gesäß oder Oberschenkel."
  },
  {
    id: "silk_tie_scarf",
    name: "Seidenkrawatte / Seidenschal",
    category: "household",
    chapters: [3, 10, 13, 15],
    defaultPresent: true,
    aiTag: "Seidenkrawatte oder weicher Seidenschal",
    desc: "Weiches Fesseln der Handgelenke oder sanfte Augenbinde ohne schmerzhafte Druckstellen."
  },
  {
    id: "clothespins_wood",
    name: "Wäscheklammern aus Holz",
    category: "household",
    chapters: [17, 23],
    defaultPresent: true,
    aiTag: "Klassische Holzwäscheklammern",
    desc: "Punktueller Klemmreiz an Brustwarzen oder Schamlippen mit spürbarem Zugpotenzial."
  },
  {
    id: "clothespins_plastic",
    name: "Wäscheklammern aus Kunststoff",
    category: "household",
    chapters: [17],
    defaultPresent: true,
    aiTag: "Kunststoff-Wäscheklammern",
    desc: "Leichtere Federung für sanftere Einstiege in den Klemmreiz."
  },
  {
    id: "wooden_spoon",
    name: "Holzkochspachtel / Kochlöffel",
    category: "household",
    chapters: [16, 23],
    defaultPresent: true,
    aiTag: "Breiter Holzkochlöffel",
    desc: "Harter, schallender Schlagreiz mit minimalem Kraftaufwand des Tops; knackiger Hautreiz."
  },
  {
    id: "hairbrush_wood",
    name: "Klassische Haarbürste (Holzrücken)",
    category: "household",
    chapters: [1, 12, 16, 19],
    defaultPresent: true,
    aiTag: "Haarbürste mit stabilem Holzrücken",
    desc: "Breitflächige Hautreizung auf dem Gesäß; ideal für traditionelle Zucht über dem Knie."
  },
  {
    id: "ice_cubes",
    name: "Eiswürfel / Kältebeutel",
    category: "household",
    chapters: [15, 16, 17, 31],
    defaultPresent: true,
    aiTag: "Schmelzende Eiswürfel",
    desc: "Sensorischer Kälteschock; Kühlen heißer Schlagstellen oder Reizung empfindlicher Zonen."
  },
  {
    id: "soft_cloth_towel",
    name: "Weiches Stofftuch / Gästehandtuch",
    category: "household",
    chapters: [2, 15, 24],
    defaultPresent: true,
    aiTag: "Gefaltetes weiches Stofftuch",
    desc: "Dient als weicher Tuchknebel zwischen den Zähnen oder als Drop-Tuch in der Hand."
  },
  {
    id: "body_lotion_oil",
    name: "Mandelöl / Feuchtigkeitsbalsam",
    category: "household",
    chapters: [3, 12, 16],
    defaultPresent: true,
    aiTag: "Warmes Körperöl oder Pflegebalsam",
    desc: "Einbalsamieren beanspruchter Hautstellen im Aftercare; Gleitmassagen und Pflege."
  },
  {
    id: "lubricant_gel",
    name: "Gleitmittel (Wasser- / Silikonbasis)",
    category: "household",
    chapters: [3, 27],
    defaultPresent: true,
    aiTag: "Reichlich Gleitgel",
    desc: "Essentiell für schmerzfreie reibungslose Stimulation, Dildos und Analerotik."
  },
  {
    id: "aroma_candles_oils",
    name: "Duftkerzen & Aroma-Öle",
    category: "household",
    chapters: [3],
    defaultPresent: true,
    aiTag: "Duftkerzen und sinnliche Aromen",
    desc: "Schafft intime, erotische Schlafzimmer-Atmosphäre (Sandelholz, Vanille, Lavendel)."
  },
  {
    id: "feather_duster",
    name: "Kitzelfeder / Schminkpinsel",
    category: "household",
    chapters: [3, 12],
    defaultPresent: true,
    aiTag: "Zarte Feder oder weicher Pinsel",
    desc: "Federleichte Kontrast-Berührungen über Oberschenkelinnenseiten, Rippen und Bauch."
  },
  {
    id: "hot_water_bottle",
    name: "Wärmflasche / Warmpack",
    category: "household",
    chapters: [3, 16],
    defaultPresent: true,
    aiTag: "Warme Bettflasche",
    desc: "Wohltuende Tiefenwärme für Lenden und Gesäß nach intensiver Zucht oder im Aftercare."
  },
  {
    id: "painter_tape",
    name: "Malerkrepp / Sanftes Papier-Tape",
    category: "household",
    chapters: [32],
    defaultPresent: true,
    aiTag: "Sanftes Malerkrepp-Band",
    desc: "Hinterlässt keine Kleberückstände; fixiert Finger oder verschließt symbolisch Lippen."
  },
  {
    id: "punishment_notebook_pen",
    name: "Notizheft & Füller für Strafzeilen",
    category: "household",
    chapters: [23],
    defaultPresent: true,
    aiTag: "Notizheft und Stift für Strafzeilen",
    desc: "Formale Strafarbeit: Vorgegebene Sätze andächtig 20- oder 50-mal zu Papier bringen."
  },

  // ----------------------------------------------------
  // KATEGORIE 2: FESSELUNG, SEILE & MÖBEL (bondage)
  // ----------------------------------------------------
  {
    id: "leather_wrist_cuffs",
    name: "Leder-Handmanschetten",
    category: "bondage",
    chapters: [10, 13],
    defaultPresent: false,
    aiTag: "Gepolsterte Leder-Handgelenksmanschetten",
    desc: "Gepolsterte Bänder mit D-Ringen und Schnallen für verlässliche Handfixierung."
  },
  {
    id: "leather_ankle_cuffs",
    name: "Leder-Fußfesseln mit Verbindungssteg",
    category: "bondage",
    chapters: [13],
    defaultPresent: false,
    aiTag: "Leder-Fußfesseln mit Kettenglied",
    desc: "Beschränkung der Schrittweite auf Trippelschritte oder feste Arretierung am Bett."
  },
  {
    id: "velcro_cuffs_quick",
    name: "Klettfesseln mit Schnellabwurf",
    category: "bondage",
    chapters: [13],
    defaultPresent: false,
    aiTag: "Klettfesseln mit Schnellöffnung",
    desc: "Komfortable Fesseln mit sofortiger Notfall-Trennung durch beherzten Zug."
  },
  {
    id: "shibari_jute_rope_6mm",
    name: "Juteseile (6mm geölt, 2x 7,5m)",
    category: "bondage",
    chapters: [13],
    defaultPresent: false,
    aiTag: "Geölte Shibari-Juteseile",
    desc: "Griffige Naturfaserseile für Brustgeschirr (Takate Kote) oder Schenkelführung."
  },
  {
    id: "cotton_rope_soft",
    name: "Weiche Baumwollseile (8mm)",
    category: "bondage",
    chapters: [13],
    defaultPresent: false,
    aiTag: "Weiche weiße Baumwollseile",
    desc: "Sanfte Faser ohne Kratzen; ideal für Einsteiger und einfache Armbindungen."
  },
  {
    id: "leather_collar_leash",
    name: "Lederhalsband mit D-Ring & Führleine",
    category: "bondage",
    chapters: [13, 22],
    defaultPresent: false,
    aiTag: "Breites Lederhalsband mit stabiler Leine",
    desc: "Symbol der Führung und Zugehörigkeit; sicheres Lenken des Partners im Raum."
  },
  {
    id: "padded_collar_shearling",
    name: "Gepolstertes Halsband mit Lammfell",
    category: "bondage",
    chapters: [13],
    defaultPresent: false,
    aiTag: "Lammfell-gepolstertes Lederhalsband",
    desc: "Hoher Tragekomfort; weiche Fütterung umschließt die Kehle sanft und wärmend."
  },
  {
    id: "posture_collar_stiff",
    name: "Starrer Haltungskragen (Posture Collar)",
    category: "bondage",
    chapters: [32],
    defaultPresent: false,
    aiTag: "Starrer Haltungskragen",
    desc: "Hoher, versteifter Kragen; erzwingt erhobenes Kinn und aufrechten Blickkontakt."
  },
  {
    id: "leather_armbinder",
    name: "Leder-Armbinder (Monohandschuh)",
    category: "bondage",
    chapters: [13, 32],
    defaultPresent: false,
    aiTag: "Geschnürter Leder-Armbinder",
    desc: "Schnürhülle aus festem Leder; schließt beide Arme starr hinter dem Rücken ein."
  },
  {
    id: "thumb_cuffs",
    name: "Metall-Daumenschellen",
    category: "bondage",
    chapters: [13],
    defaultPresent: false,
    aiTag: "Präzise Daumenschellen",
    desc: "Kompakte Fixierung der Daumen; unterbindet jedes feine Greifen oder Ausweichen."
  },
  {
    id: "spread_bar_rigid",
    name: "Edelstahl-Spreizstange (Starre Öffnung)",
    category: "bondage",
    chapters: [14],
    defaultPresent: false,
    aiTag: "Starre Edelstahl-Spreizstange",
    desc: "Arretiert die Knöchel in 70-80cm Distanz; Schließen der Beine unmöglich."
  },
  {
    id: "bed_restraint_straps",
    name: "Untermatratzen-Gurtsystem",
    category: "bondage",
    chapters: [14],
    defaultPresent: false,
    aiTag: "4-Punkt-Bettbegurtung",
    desc: "Kreuzgurte unter der Matratze mit 4 Karabinern an den Bettecken."
  },
  {
    id: "pillory_pranger",
    name: "Hand-Hals-Pranger (Pillory)",
    category: "bondage",
    chapters: [14],
    defaultPresent: false,
    aiTag: "Gepolsterter Holz- oder Leder-Pranger",
    desc: "Kopf und Handgelenke in waagerechter Ausrichtung arretiert; stolze Pranger-Haltung."
  },
  {
    id: "kneeling_bench_padded",
    name: "Bequeme Kniebank mit Lederpolster",
    category: "bondage",
    chapters: [14, 22],
    defaultPresent: false,
    aiTag: "Gepolsterte BDSM-Kniebank",
    desc: "Erlaubt langes, schmerzfreies Knien in aufrechter Demutshaltung vor dem Top."
  },
  {
    id: "spanking_bench_buck",
    name: "Spanking-Bock / Vorbeuge-Bank",
    category: "bondage",
    chapters: [14],
    defaultPresent: false,
    aiTag: "Stabiler Leder-Spankingbock",
    desc: "Der Oberkörper liegt auf, das Becken ist im 45°-Winkel perfekt exponiert."
  },
  {
    id: "st_andrews_cross",
    name: "Andreaskreuz an der Wand",
    category: "bondage",
    chapters: [14],
    defaultPresent: false,
    aiTag: "Massives Andreaskreuz",
    desc: "X-förmige Arretierung von Armen und Beinen für vollkommene Präsentation."
  },
  {
    id: "bdsm_sling_swing",
    name: "BDSM-Liebesschaukel (Sling)",
    category: "bondage",
    chapters: [14],
    defaultPresent: false,
    aiTag: "Decken-Liebesschaukel / Sling",
    desc: "Schwereloses Schweben im Raum; entlastet Rücken und Becken vollkommen."
  },
  {
    id: "sex_wedge_pillow",
    name: "Keilkissen fürs Becken (Sex-Wedge)",
    category: "bondage",
    chapters: [14, 20],
    defaultPresent: false,
    aiTag: "Festes Becken-Keilkissen",
    desc: "Hebt das Becken des Bottoms an; optimaler Eintrittswinkel und bequeme Vorbeuge."
  },
  {
    id: "wall_anchor_rings",
    name: "Wand- und Deckenösen mit Karabinern",
    category: "bondage",
    chapters: [13, 14],
    defaultPresent: false,
    aiTag: "Schwerlast-Wandösen mit Karabinern",
    desc: "Stabile Befestigungspunkte für Fesselriemen oder Seilführungen im Raum."
  },
  {
    id: "restraint_chair_straps",
    name: "Stuhl-Fesselgurte & Manschetten",
    category: "bondage",
    chapters: [14],
    defaultPresent: false,
    aiTag: "Stuhlbegurtungs-Set",
    desc: "Verwandelt jeden stabilen Stuhl in ein ausbruchssicheres Verhör- oder Sitzmöbel."
  },
  {
    id: "cage_grid_box",
    name: "Gitterbox / Zimmerkäfig",
    category: "bondage",
    chapters: [14],
    defaultPresent: false,
    aiTag: "Abschließbarer Gitterkäfig",
    desc: "Rückzugsort und Begrenzungsraum; Verharren hinter Gittern unter Aufsicht."
  },

  // ----------------------------------------------------
  // KATEGORIE 3: IMPACT, GERTEN & SCHLÄGE (impact)
  // ----------------------------------------------------
  {
    id: "leather_paddle_wide",
    name: "Leder-Paddle (Breitflächig)",
    category: "impact",
    chapters: [16, 23],
    defaultPresent: false,
    aiTag: "Schweres doppellagiges Leder-Paddle",
    desc: "Thuddy Impact mit tiefem Gewebereiz und satter Lautstärke; dumpfer Schmerz."
  },
  {
    id: "suede_flogger_multi",
    name: "Wildleder-Flogger (Vielriemig)",
    category: "impact",
    chapters: [16],
    defaultPresent: false,
    aiTag: "Vielriemiger weicher Wildleder-Flogger",
    desc: "Warmes Prasseln vieler weicher Lederriemen zur Durchwärmung und Trance-Induktion."
  },
  {
    id: "leather_flogger_heavy",
    name: "Glattleder-Flogger (Schwere Riemen)",
    category: "impact",
    chapters: [16],
    defaultPresent: false,
    aiTag: "Schwerer Glattleder-Flogger",
    desc: "Kräftigere Trefferwirkung mit spürbarem Stich bei schnellen Schwüngen."
  },
  {
    id: "riding_crop_standard",
    name: "Reitgerte mit Lederklatsche",
    category: "impact",
    chapters: [16, 33],
    defaultPresent: false,
    aiTag: "Präzise Leder-Reitgerte",
    desc: "Präzise gesetzte Hiebe mit schallender Klatsche auf Gesäß- und Schenkelmuskeln."
  },
  {
    id: "riding_crop_slender",
    name: "Dressurgerte (Langer flexibler Stab)",
    category: "impact",
    chapters: [16],
    defaultPresent: false,
    aiTag: "Lange flexible Dressurgerte",
    desc: "Schneidender, brennender Reiz mit hoher Reichweite und exakter Linienführung."
  },
  {
    id: "wooden_spanking_board_perforated",
    name: "Hartholz-Paddle mit Lochung",
    category: "impact",
    chapters: [16, 23],
    defaultPresent: false,
    aiTag: "Gelochtes Hartholz-Paddle",
    desc: "Knackiger, extrem lauter Schmerzreiz mit minimalem Luftwiderstand."
  },
  {
    id: "bamboo_cane",
    name: "Bambus-Cane / Schlagstock",
    category: "impact",
    chapters: [16],
    defaultPresent: false,
    aiTag: "Flexibler Bambus-Cane",
    desc: "Traditionelles Werkzeug für feurige, schmale Reizstreifen auf der Gesäßmuskulatur."
  },
  {
    id: "horsehair_crop_whip",
    name: "Pferdehaar-Peitsche / Rosshaarrute",
    category: "impact",
    chapters: [16],
    defaultPresent: false,
    aiTag: "Feine Rosshaarrute",
    desc: "Hauchfeine, brennende Hautreize wie feurige Nadelstiche über Rücken und Po."
  },
  {
    id: "rubber_slapper",
    name: "Gummi-Slapper / Neopren-Klatsche",
    category: "impact",
    chapters: [16],
    defaultPresent: false,
    aiTag: "Schwarzer Gummi-Slapper",
    desc: "Hochelastischer Hautreiz mit lauter akustischer Resonanz ohne Blutergussrisiko."
  },
  {
    id: "leather_strap_tawse",
    name: "Schottische Leder-Tawse (Geschlitzt)",
    category: "impact",
    chapters: [16, 23],
    defaultPresent: false,
    aiTag: "Geschlitzte Leder-Tawse",
    desc: "Mehrfach geschlitzter dicker Lederriemen für formelle Disziplinierungsrituale."
  },
  {
    id: "arnica_care_balm",
    name: "Arnika-Balsam / Kühlgel (Aftercare)",
    category: "impact",
    chapters: [16],
    defaultPresent: false,
    aiTag: "Kühlender Arnika-Pflegebalsam",
    desc: "Beruhigt und pflegt gerötete, geschlagene Hautpartien direkt nach der Zucht."
  },

  // ----------------------------------------------------
  // KATEGORIE 4: SENSORIK, MASKEN & KNEBEL (sensory)
  // ----------------------------------------------------
  {
    id: "leather_blindfold_padded",
    name: "Blickdichte Leder-Augenmaske",
    category: "sensory",
    chapters: [15],
    defaultPresent: false,
    aiTag: "Blickdichte gepolsterte Leder-Augenbinde",
    desc: "Schaltet den Sehsinn vollständig ab; fokussiert auf Gehör, Geruch und Tastsinn."
  },
  {
    id: "sleep_mask_silk",
    name: "Sanfte Seiden-Schlafbrille",
    category: "sensory",
    chapters: [15],
    defaultPresent: false,
    aiTag: "Weiche Seiden-Augenmaske",
    desc: "Leichte Verdunklung ohne Druck auf Wimpern oder Schläfen."
  },
  {
    id: "silicone_ball_gag_45mm",
    name: "Silikon-Ballknebel (45mm)",
    category: "sensory",
    chapters: [15],
    defaultPresent: false,
    aiTag: "Silikon-Ballknebel mit Lederriemen",
    desc: "Füllt den Mundraum lückenlos aus; erzwingt Nasenatmung (Max. 15 Min. Safety-Check!)."
  },
  {
    id: "open_ring_gag_metal",
    name: "Offener Ringknebel (Speichelfluss)",
    category: "sensory",
    chapters: [15, 35],
    defaultPresent: false,
    aiTag: "Offener Edelstahl-Ringknebel",
    desc: "Hält den Mund starr geöffnet; Speichelbildung ungehindert, Sprechen unmöglich."
  },
  {
    id: "tube_gag_breathing",
    name: "Rohrknebel mit Atemkanal",
    category: "sensory",
    chapters: [15],
    defaultPresent: false,
    aiTag: "Rohrknebel mit Atemöffnung",
    desc: "Mundstück mit zentraler Röhre; ermöglicht freie Mundatmung trotz voller Sprechblockade."
  },
  {
    id: "zenith_hood_mask",
    name: "Zenith Hood (Vollmaske ohne Augen/Mund)",
    category: "sensory",
    chapters: [15],
    defaultPresent: false,
    aiTag: "Geschlossene Leder-Zenithhaube",
    desc: "Vollständige sensorische Abschirmung des Gesichts; Reizfilterung auf das Gehör."
  },
  {
    id: "tuning_fork_128hz",
    name: "Medizinische Stimmgabel (128Hz)",
    category: "sensory",
    chapters: [15, 34],
    defaultPresent: false,
    aiTag: "Angeschlagene Stimmgabel am Knochen",
    desc: "Tiefe Vibration direkt auf Knochenpunkten (Schlüsselbein, Brustbein, Schläfe)."
  },
  {
    id: "noise_cancelling_headphones",
    name: "Noise-Cancelling-Kopfhörer",
    category: "sensory",
    chapters: [15],
    defaultPresent: false,
    aiTag: "Abschirmende Kapselkopfhörer",
    desc: "Blendet alle Außengeräusche aus; erzwingt Fokus auf innere Ruhe oder Trance-Sprache."
  },
  {
    id: "ear_muffs_isolation",
    name: "Kapselgehörschützer (Reine Stille)",
    category: "sensory",
    chapters: [15],
    defaultPresent: false,
    aiTag: "Industrie-Kapselgehörschützer",
    desc: "Absolute Geräuschstille; der Partner hört nur noch den eigenen Puls und Atem."
  },

  // ----------------------------------------------------
  // KATEGORIE 5: CBT, KLEMMEN & KEUSCHHEIT (cbt_clamps)
  // ----------------------------------------------------
  {
    id: "chastity_cage_steel",
    name: "Keuschheitskäfig (Edelstahl)",
    category: "cbt_clamps",
    chapters: [8],
    defaultPresent: false,
    aiTag: "Passgenauer Edelstahl-Keuschheitskäfig",
    desc: "Schwere physische Verriegelung des Glieds mit Vorhängeschloss für den Top."
  },
  {
    id: "chastity_cage_resin",
    name: "Keuschheitskäfig (Leichtes Resin/Harz)",
    category: "cbt_clamps",
    chapters: [8],
    defaultPresent: false,
    aiTag: "Leichter Harz-Keuschheitskäfig",
    desc: "Atmungsaktiver, leichter Käfig für längeres ununterbrochenes Tragen im Alltag."
  },
  {
    id: "time_safe_box",
    name: "Zeittresor (Kitchen Safe mit Timer)",
    category: "cbt_clamps",
    chapters: [8],
    defaultPresent: false,
    aiTag: "Zeitschloss-Tresor für den Schlüssel",
    desc: "Verwahrt den Schlüssel für 24, 48 oder 72 Stunden unumstößlich unter Verschluss."
  },
  {
    id: "tamper_seals",
    name: "Nummerierte Einweg-Siegel",
    category: "cbt_clamps",
    chapters: [8],
    defaultPresent: false,
    aiTag: "Fortlaufend nummeriertes Sicherheitssiegel",
    desc: "Versiegelt das Schloss; jeder heimliche Öffnungsversuch wird sofort sichtbar."
  },
  {
    id: "emergency_key_envelope",
    name: "Versiegelter Notfallschlüssel-Umschlag",
    category: "cbt_clamps",
    chapters: [8],
    defaultPresent: false,
    aiTag: "Versiegelter Notfallumschlag mit Schlüssel",
    desc: "Sicherheits-Backup für medizinische Zwischenfälle im Schrank verwahrt."
  },
  {
    id: "clover_clamps_weights",
    name: "Kleeblatt-Brustwarzenklemmen mit Gewichten",
    category: "cbt_clamps",
    chapters: [17],
    defaultPresent: false,
    aiTag: "Einstellbare Kleeblatt-Klemmen mit Gewichten",
    desc: "Rändelschrauben zur Druckregulierung plus einhängbare Messinggewichte."
  },
  {
    id: "tweezer_clamps_chain",
    name: "Pinzettenklemmen mit Verbindungskette",
    category: "cbt_clamps",
    chapters: [17],
    defaultPresent: false,
    aiTag: "Verbundene Klemmen mit Kette",
    desc: "Gummierte Backen; Kette überträgt Zugkräfte von einer Brustwarze zur anderen."
  },
  {
    id: "cock_ring_silicone_stretchy",
    name: "Silikon-Cockring (Strammer Sitz)",
    category: "cbt_clamps",
    chapters: [7, 17],
    defaultPresent: false,
    aiTag: "Strammer Silikon-Cockring",
    desc: "Staut das Blut im Schaft für härtere Erektionen und verzögertes Kommen."
  },
  {
    id: "cock_ring_steel",
    name: "Edelstahl-Cockring (Massiv)",
    category: "cbt_clamps",
    chapters: [17],
    defaultPresent: false,
    aiTag: "Massiver Edelstahl-Cockring",
    desc: "Unnachgiebiger Metallring; maximaler Staudruck und kühles Anlegegefühl."
  },
  {
    id: "ball_stretcher_metal",
    name: "Edelstahl-Hodenring / Ball Stretcher",
    category: "cbt_clamps",
    chapters: [17],
    defaultPresent: false,
    aiTag: "Schwerer Edelstahl-Hodenstretcher",
    desc: "Schweres Metallteil; zieht die Hoden nach unten und erzeugt anhaltenden Zug."
  },
  {
    id: "leather_ball_strap",
    name: "Leder-Hodenband mit Schnallen",
    category: "cbt_clamps",
    chapters: [17],
    defaultPresent: false,
    aiTag: "Verstellbares Leder-Hodenband",
    desc: "Trennt die Hoden stramm vom Schaft und fixiert sie straff exponiert."
  },
  {
    id: "ball_harness_leather",
    name: "Leder-Tragegeschirr für die Hoden (Ball Harness)",
    category: "cbt_clamps",
    chapters: [17],
    defaultPresent: false,
    aiTag: "Leder-Hodengeschirr",
    desc: "Umschließt das Skrotum einzeln; dauerhafte Spannung und pralle Präsentation."
  },
  {
    id: "penis_thigh_strap",
    name: "Penisfesselungs-Riemen für Oberschenkel",
    category: "cbt_clamps",
    chapters: [17],
    defaultPresent: false,
    aiTag: "Oberschenkel-Gliedfessel",
    desc: "Arretiert das Glied straff an der Schenkelinnenseite; verhindert Aufrichten."
  },

  // ----------------------------------------------------
  // KATEGORIE 6: TOYS, PLUGS & ORGASMUSKONTROLLE (toys_anal)
  // ----------------------------------------------------
  {
    id: "remote_vibrator_app",
    name: "App- / Funk-gesteuerter Vibrator",
    category: "toys_anal",
    chapters: [7, 28],
    defaultPresent: false,
    aiTag: "Fernbedienter Druckwellen-/Vibro-Stimulator",
    desc: "Tragbares Toy; Intensität durch den Top per Smartphone oder Fernbedienung steuerbar."
  },
  {
    id: "magic_wand_heavy",
    name: "Stab-Vibrator (Magic Wand)",
    category: "toys_anal",
    chapters: [7],
    defaultPresent: false,
    aiTag: "Kraftvoller Netz-Stabvibrator",
    desc: "Extrem kraftvolle Tiefenvibration für schnelles, intensives Treiben an die Erregungskante."
  },
  {
    id: "vibrating_egg_wireless",
    name: "Vibrations-Ei (Kabellos)",
    category: "toys_anal",
    chapters: [17, 28],
    defaultPresent: false,
    aiTag: "Kabelloses Vibrations-Ei",
    desc: "Kompaktes Toy für Damm, Vagina oder Unterwäsche; diskret von Ferne steuerbar."
  },
  {
    id: "dildo_training",
    name: "Dildo für Oral- & Orgasmus-Training",
    category: "toys_anal",
    chapters: [6, 27],
    defaultPresent: false,
    aiTag: "Silikon-Übungsdildo",
    desc: "Dient zur Rachenentspannung beim Blastraining oder manueller Stimulation."
  },
  {
    id: "metal_butt_plug_smooth",
    name: "Edelstahl-Analplug (Glatt & kühl)",
    category: "toys_anal",
    chapters: [27],
    defaultPresent: false,
    aiTag: "Schwerer Edelstahl-Butt-Plug",
    desc: "Kühles Einsetzen, dehnendes Ausfüllen während anderer Bestrafungsmaßnahmen."
  },
  {
    id: "silicone_butt_plug_flexible",
    name: "Silikon-Analplug (Flexibler Schaft)",
    category: "toys_anal",
    chapters: [27, 28],
    defaultPresent: false,
    aiTag: "Flexibler Silikon-Plug",
    desc: "Bequemer Sitz für längeres Tragen beim Spaziergang oder während Vorbeugen."
  },
  {
    id: "prostate_massager",
    name: "Prostata-Stimulator (Ergonomisch)",
    category: "toys_anal",
    chapters: [7, 27],
    defaultPresent: false,
    aiTag: "Ergonomischer Prostata-Stimulator",
    desc: "Gezielter Druck auf den männlichen G-Punkt für freihändige Ekstase."
  },
  {
    id: "anal_remote_vibrator",
    name: "Anal-Vibrator mit Funk-Fernbedienung",
    category: "toys_anal",
    chapters: [27],
    defaultPresent: false,
    aiTag: "Vibrierender Plug mit Handsender",
    desc: "Vibrationen im After stufenlos über die Fernbedienung des Tops regulierbar."
  },
  {
    id: "strap_on_harness",
    name: "Strap-on Geschirr & Dildo (Pegging)",
    category: "toys_anal",
    chapters: [27],
    defaultPresent: false,
    aiTag: "Strap-on Geschirr mit flexiblem Dildo",
    desc: "Ermöglicht der Partnerin die aktive Penetration des Mannes (Pegging)."
  },
  {
    id: "inflatable_plug_brief",
    name: "Aufblasbarer Plug / Latex-Slip",
    category: "toys_anal",
    chapters: [11, 27],
    defaultPresent: false,
    aiTag: "Aufblasbares Dehnungs-Toy mit Handpumpe",
    desc: "Handpumpe dosiert den Fülldruck stufenlos; dehnendes Völlegefühl."
  },

  // ----------------------------------------------------
  // KATEGORIE 7: SPEZIAL, WACHS, MEDICAL & PET PLAY (special)
  // ----------------------------------------------------
  {
    id: "low_temp_wax_candle",
    name: "Niedrigtemperatur-Tropfkerze (Sojawachs)",
    category: "special",
    chapters: [31],
    defaultPresent: false,
    aiTag: "BDSM-Niedrigtemperaturkerze",
    desc: "Spezielles Sojawachs (Schmelzpunkt ~48°C) für schmerzfreie, wohlige Hitzekicks."
  },
  {
    id: "wax_scrape_card",
    name: "Wachs-Schaberkarte (Kunststoff)",
    category: "special",
    chapters: [31],
    defaultPresent: false,
    aiTag: "Plastikkarte zum Wachsabkratzen",
    desc: "Schabt erkaltetes Wachs mit spürbarem Kantenreiz von geröteter Haut ab."
  },
  {
    id: "nuru_massage_gel",
    name: "Nuru-Massage-Gel (Braunalgenextrakt)",
    category: "special",
    chapters: [31],
    defaultPresent: false,
    aiTag: "Original Nuru-Algen-Gleitgel",
    desc: "Extrem glitschiges Gel für schwerelose Ganzkörper-Body-to-Body-Massagen."
  },
  {
    id: "fire_ice_balm",
    name: "Fire & Ice Minz- / Capsaicin-Balsam",
    category: "special",
    chapters: [31],
    defaultPresent: false,
    aiTag: "Wärmender Minzbalsam mit Eis",
    desc: "Verbindet intensive Hitzewirkung mit dem Schock darüberstreichender Eiswürfel."
  },
  {
    id: "glass_toy_smooth",
    name: "Kühles Glas-Dildo / Kälte-Toy",
    category: "special",
    chapters: [31],
    defaultPresent: false,
    aiTag: "Gekühltes Borosilikatglas-Toy",
    desc: "Glattes Glas; im Kühlschrank vorgekühlt für prickelnde Kältereize auf heißer Haut."
  },
  {
    id: "hypno_pendulum_crystal",
    name: "Hypnose-Pendel / Fokus-Kristall",
    category: "special",
    chapters: [30],
    defaultPresent: false,
    aiTag: "Schwingendes Hypnose-Pendel",
    desc: "Fixiert den Blick des Bottoms; ermüdet die Augen für geführte Trance-Induktion."
  },
  {
    id: "vacuum_bed_latex_pump",
    name: "Latex-Vakuumbett mit Atemschlauch",
    category: "special",
    chapters: [32],
    defaultPresent: false,
    aiTag: "Versiegeltes Latex-Vakuumbett",
    desc: "Vollkommene reglose Kompression; Vakuumpumpe saugt jede Luft heraus."
  },
  {
    id: "puppy_hood_leather",
    name: "Puppy-Haube mit Ohren",
    category: "special",
    chapters: [33],
    defaultPresent: false,
    aiTag: "Leder-Puppymaske mit Ohren",
    desc: "Schlüpfen in die unbeschwerte Welpen-Rolle; Dämpfung menschlicher Mimik."
  },
  {
    id: "puppy_fetch_ball",
    name: "Puppy-Apportierball mit Steg",
    category: "special",
    chapters: [33],
    defaultPresent: false,
    aiTag: "Apportierball für den Mund",
    desc: "Mit den Zähnen zu tragen und dem Top apportierend vor die Knie zu legen."
  },
  {
    id: "pony_bridle_bit_gag",
    name: "Pony-Zaumzeug mit Gebissknebel & Zügeln",
    category: "special",
    chapters: [33],
    defaultPresent: false,
    aiTag: "Pony-Trense mit Gebiss und Zügeln",
    desc: "Formelle Dressurführung; Kopf und Gangart werden an den Zügeln gelenkt."
  },
  {
    id: "horsehair_tail_plug",
    name: "Rosshaar-Schweif-Plug (Anal)",
    category: "special",
    chapters: [33],
    defaultPresent: false,
    aiTag: "Pferdeschweif-Plug mit echtem Rosshaar",
    desc: "Analplug mit langem Schweif; schwingt beim Trippeln und Krabbeln im Schritt mit."
  },
  {
    id: "stethoscope_cuff_set",
    name: "Stethoskop & Blutdruckmanschette",
    category: "special",
    chapters: [34],
    defaultPresent: false,
    aiTag: "Medizinisches Untersuchungs-Set",
    desc: "Kühles Stethoskop auf nackter Haut; formelle klinische Untersuchung."
  },
  {
    id: "estim_tens_device_pads",
    name: "E-Stim / TENS-Gerät mit Klebepads",
    category: "special",
    chapters: [34],
    defaultPresent: false,
    aiTag: "TENS-Reizstromgerät mit Elektroden",
    desc: "Reizströme erzeugen pulsierende Muskelkontraktionen an Po, Rücken oder Schenkeln."
  },
  {
    id: "violet_wand_set",
    name: "Violet Wand (Hochfrequenz-Funken)",
    category: "special",
    chapters: [34],
    defaultPresent: false,
    aiTag: "Violet Wand mit Glaselektroden",
    desc: "Winzige lila Funken tanzen knisternd über die Haut; scharfes Nadelstich-Prickeln."
  },
  {
    id: "sterile_needles_set",
    name: "Sterile Akupunkturnadeln / Kanülen",
    category: "special",
    chapters: [34],
    defaultPresent: false,
    aiTag: "Sterile Einweg-Akupunkturnadeln",
    desc: "Oberflächliche Nadelreize in die Haut ohne bleibende Narben; tiefe Katharsis."
  },
  {
    id: "dull_play_knife",
    name: "Stumpfe Klinge (Dull Play Knife)",
    category: "special",
    chapters: [34],
    defaultPresent: false,
    aiTag: "Stumpfe, kühle Metallklinge",
    desc: "Kaltes Metall streicht langsam über Kehle und Bauch; reiner Nervenkitzel ohne Schnittgefahr."
  },
  {
    id: "stiletto_heels_pointed",
    name: "Stiletto High Heels (Spitzer Absatz)",
    category: "special",
    chapters: [9, 35],
    defaultPresent: false,
    aiTag: "Spitze Stiletto High Heels",
    desc: "Gezielter Druck des Absatzes in Gesäß, Schenkel oder Schambein; pure Dominanz."
  },
  {
    id: "leather_boots_knee",
    name: "Kniehohe Lederstiefel (Overknee)",
    category: "special",
    chapters: [9, 11, 35],
    defaultPresent: false,
    aiTag: "Schwere Lederstiefel für Worship",
    desc: "Geste der Unterwerfung: Stiefel auf Knien mit Lippen und Zunge säubern."
  },
  {
    id: "body_writing_lipstick",
    name: "Lippenstift zum Beschriften (Body Writing)",
    category: "special",
    chapters: [35],
    defaultPresent: false,
    aiTag: "Roter Lippenstift für Hautbeschriftung",
    desc: "Markieren des Körpers mit Worten wie 'Besitz', 'Brav' oder 'Meins'."
  }
];

// ==========================================
// 3. PHYSIKALISCHE VERTENSCHLUSS- & LOGIK-MATRIX
// Verhindert anatomisch unmögliche Kombinationen
// ==========================================
window.physicalConstraintRules = [
  {
    id: "rule_hands_back_cannot_self_spank",
    name: "Kein Selbstvollzug bei hinter dem Rücken fixierten Händen",
    condition: function(setup) {
      var handsBack = setup.bondage && (
        setup.bondage.id === "leather_wrist_cuffs" ||
        setup.bondage.id === "leather_armbinder" ||
        setup.bondage.id === "shibari_jute_rope_6mm" ||
        (setup.posture && setup.posture.id === "hands_behind_back")
      );
      var isSelfSpank = setup.action && (
        setup.action.id === "self_discipline" ||
        setup.action.category === "self_discipline" ||
        (setup.action.title && setup.action.title.toLowerCase().indexOf("selbst") !== -1) ||
        (setup.action.desc && setup.action.desc.toLowerCase().indexOf("selbst züchtig") !== -1) ||
        (setup.action.desc && setup.action.desc.toLowerCase().indexOf("eigenhändig") !== -1)
      );
      return handsBack && isSelfSpank;
    },
    correction: "Hände sind auf dem Rücken arretiert: Selbstschläge sind anatomisch unmöglich. Der TOP führt die Schläge aus.",
    autoFix: function(setup) {
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
    condition: function(setup) {
      var isGagged = setup.sensory && (
        (setup.sensory.id && setup.sensory.id.indexOf("gag") !== -1) ||
        setup.sensory.category === "gag" ||
        (setup.sensory.title && setup.sensory.title.toLowerCase().indexOf("knebel") !== -1)
      );
      var mustCount = setup.action && (
        (setup.action.title && setup.action.title.toLowerCase().indexOf("zähl") !== -1) ||
        (setup.action.desc && setup.action.desc.toLowerCase().indexOf("laut mitzählen") !== -1) ||
        (setup.action.desc && setup.action.desc.toLowerCase().indexOf("danke sagen") !== -1)
      );
      return isGagged && mustCount;
    },
    correction: "Mit eingesetztem Knebel ist lautes Mitzählen anatomisch unmöglich. Wechsel zu taktilem Abklopfen mit der Handfläche.",
    autoFix: function(setup) {
      if (setup.action && setup.action.desc) {
        setup.action.desc = setup.action.desc.replace(/laut mitzählen/gi, "mit der Handfläche stumm auf den Oberschenkel abklopfen");
        setup.action.desc = setup.action.desc.replace(/laut 'Danke' sagen/gi, "mit zustimmendem Kopfnicken quittieren");
      }
    }
  },
  {
    id: "rule_standing_requires_feet_free",
    name: "Kein Stehen in der Ecke bei gespreizten/fixierten Knöcheln",
    condition: function(setup) {
      var feetBound = setup.bondage && (
        setup.bondage.id === "spread_bar_rigid" ||
        setup.bondage.id === "leather_ankle_cuffs" ||
        setup.bondage.id === "bed_restraint_straps"
      );
      var mustStandOrWalk = setup.posture && (
        setup.posture.id === "corner_time" ||
        setup.posture.id === "pacing" ||
        (setup.posture.title && setup.posture.title.toLowerCase().indexOf("ecke stehen") !== -1) ||
        (setup.posture.title && setup.posture.title.toLowerCase().indexOf("aufrecht gehen") !== -1)
      );
      return feetBound && mustStandOrWalk;
    },
    correction: "Mit gespreizten oder eng fixierten Knöcheln kann nicht in der Ecke gestanden werden. Wechsel zu Seiza-Fersensitz oder Vorbeuge an der Bettkante.",
    autoFix: function(setup) {
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
    condition: function(setup) {
      var isBlind = setup.sensory && (
        (setup.sensory.id && setup.sensory.id.indexOf("blindfold") !== -1) ||
        (setup.sensory.id && setup.sensory.id.indexOf("hood") !== -1) ||
        (setup.sensory.title && setup.sensory.title.toLowerCase().indexOf("augenbinde") !== -1)
      );
      var eyeContact = setup.posture && (
        (setup.posture.title && setup.posture.title.toLowerCase().indexOf("blickkontakt") !== -1) ||
        (setup.posture.desc && setup.posture.desc.toLowerCase().indexOf("in die augen blicken") !== -1)
      );
      return isBlind && eyeContact;
    },
    correction: "Unter der Augenbinde ist Blickkontakt unmöglich. Wechsel zu erhobenem Kinn und Lauschen auf die Stimme des Tops.",
    autoFix: function(setup) {
      if (setup.posture && setup.posture.desc) {
        setup.posture.desc = setup.posture.desc.replace(/tief in die Augen blicken/gi, "den Kopf andächtig zur Stimme des Tops neigen");
      }
    }
  }
];

/**
 * Validiert ein gewähltes Strafritual gegen physische Gesetze
 */
window.validateDisciplineSetup = function(ritual) {
  var conflicts = [];
  var sanitized = JSON.parse(JSON.stringify(ritual || {}));

  if (Array.isArray(window.physicalConstraintRules)) {
    window.physicalConstraintRules.forEach(function(rule) {
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
 */
window.getActiveSessionEquipment = function(userActiveIds) {
  var universals = window.universalConstants || [];
  var fullCatalog = window.equipmentCatalog || [];

  var activeIds = userActiveIds;
  if (!activeIds) {
    try {
      var stored = localStorage.getItem("kompass_active_equipment_ids");
      if (stored) activeIds = JSON.parse(stored);
    } catch (e) {}
  }

  if (!activeIds || !Array.isArray(activeIds) || activeIds.length === 0) {
    activeIds = fullCatalog.filter(function(i) { return i.defaultPresent; }).map(function(i) { return i.id; });
  }

  var userItems = fullCatalog.filter(function(item) { return activeIds.indexOf(item.id) !== -1; });
  return universals.concat(userItems);
};
