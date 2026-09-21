const surveyChapters = [
  {
    id: 1,
    title: "Körperbild, Schamgrenzen & Berührungszonen",
    desc: "Das persönliche Fundament: Zonen der Geborgenheit, Schamgrenzen und Berührungstoleranzen.",
    items: [
      {
        id: 1,
        title: "Berührungen an den Haaren & Kopfhautmassage",
        desc: "Sanftes Durchfahren mit den Fingern, Bürsten der Haare oder gezieltes Kraulen der Kopfhaut zur Entspannung.",
        r1: "Partner im Haar streicheln",
        r2: "Im Haar berührt werden"
      },
      {
        id: 2,
        title: "Nackenzone & Schlüsselbeine",
        desc: "Zärtliche Küsse und behutsames Berühren an Kehle, Nacken und Schlüsselbein für Gänsehaut-Kicks.",
        r1: "Nacken küssen & liebkosen",
        r2: "Nackenküsse empfangen"
      },
      {
        id: 3,
        title: "Brüste, Brustwarzen & Dekolleté",
        desc: "Liebevolles Streicheln, Zupfen, Saugen oder Kitzeln an Brust und Brustwarzen beider Partner.",
        r1: "Brüste/Nippel liebkosen",
        r2: "Berührung an Brüsten genießen"
      },
      {
        id: 4,
        title: "Bauch- & Taillenzone (Sensible Schamzone)",
        desc: "Sanftes Berühren des Bauches; für manche eine Zone größter Geborgenheit, für andere schambelastet.",
        r1: "Bauch zärtlich streicheln",
        r2: "Am Bauch berührt werden"
      },
      {
        id: 5,
        title: "Rücken & Wirbelsäulen-Linie",
        desc: "Fingerspitzen-Streichen oder Massagen entlang der Wirbelsäule vom Steißbein bis zum Nacken.",
        r1: "Rücken liebkosen & massieren",
        r2: "Rückenmassagen empfangen"
      },
      {
        id: 6,
        title: "Gesäß & Oberschenkel-Innenseiten",
        desc: "Flächiges Streicheln, Kneten oder warmes Berühren der Schenkel und des Pos vor der Intimzone.",
        r1: "Gesäß & Schenkel liebkosen",
        r2: "Berührung empfangen"
      },
      {
        id: 7,
        title: "Füße, Fußsohlen & Zehen (Foot Worship)",
        desc: "Massieren der Fußsohlen, Fußküsse oder Einbeziehen der Füße in erotische Knet- und Pflegerituale.",
        r1: "Füße des Partners verwöhnen",
        r2: "Füße verwöhnen lassen"
      },
      {
        id: 8,
        title: "Umgang mit Schamzonen & Körperkomplexen",
        desc: "Akzeptanz und achtsamer Schutz sensibler Zonen; kein ungefragtes Entblößen oder Kritisieren von Körperstellen.",
        type: "choice",
        question: "Wie wünschst du dir den Umgang mit deinen Scham- & Problemzonen?",
        options: [
          { val: "praise", label: "💖 Liebevolles Praise & Bestärkung erwünscht" },
          { val: "cover", label: "🛡️ Bestimmte Zonen bitte zunächst bedeckt lassen" },
          { val: "open", label: "🌟 Völlig unbefangen & frei von Scham" },
          { val: "tabu", label: "⛔ Bestimmte Stellen sind für Berührungen tabu" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Romantik, Küsse & Zärtlichkeit",
    desc: "Liebevolle Verbundenheit: Der Herzschlag der Beziehung und Entschleunigung im Bett.",
    items: [
      {
        id: 14,
        title: "Intimer Augenkontakt (Soul Gazing)",
        desc: "Ununterbrochenes, tiefes In-die-Augen-Schauen beim Streicheln oder Sex zur Verankerung vollkommenen Vertrauens.",
        r1: "Augenkontakt aktiv halten",
        r2: "Blickkontakt erwidern"
      },
      {
        id: 18,
        title: "Zärtlicher Dirty Talk & Flüstern ins Ohr",
        desc: "Leises Zuhauchen von Kosenamen, Sehnsüchten oder erregenden Formulierungen direkt an der Ohrmuschel.",
        r1: "Ins Ohr flüstern",
        r2: "Stimme im Ohr lauschen"
      },
      {
        id: 28,
        title: "Sinnlicher Lippentanz & Zungenküsse",
        desc: "Sehr langes, zartes Küssen ohne Hast, bei dem sich Lippen und Zungenspitzen spielerisch umkreisen.",
        r1: "Küsse aktiv führen",
        r2: "Hingebungsvoll küssen lassen"
      }
    ]
  },
  {
    id: 3,
    title: "Keuschhaltung & Lust-Erhaltung (Chastity)",
    desc: "Erotische Machtabgabe über das Genital: Käfige, Schlüsselverwaltung und gesteigertes Teasing.",
    items: [
      {
        id: 115,
        title: "Keuschheitsgürtel / Käfig tragen",
        desc: "Abschließen des Genitals in einen festen Edelstahl- oder Silikonkäfig zur vollkommenen Orgasmusabgabe.",
        r1: "Schlüssel verwalten & Käfig prüfen",
        r2: "Im Käfig eingeschlossen sein"
      },
      {
        id: 117,
        title: "Teasing des Keuschlings (Lust-Erhalt)",
        desc: "Gezieltes Erregen und Necken durch das Gitter des Käfigs, um den Sub auf hoher Sehnsucht zu halten.",
        r1: "Im Käfig heiß machen & necken",
        r2: "Im Käfig gequält & erregt werden"
      },
      {
        id: 128,
        title: "Spontane Schloss-Inspektion im Alltag",
        desc: "Unerwartetes Abtasten des Schlosses unter der Kleidung bei Besuchen oder unterwegs als geheimer Machtimpuls.",
        r1: "Schloss unterwegs kontrollieren",
        r2: "Unterwegs geprüft werden"
      }
    ]
  },
  {
    id: 4,
    title: "Fesselungen, Shibari & Restriktionen",
    desc: "Körperliche Starre und ästhetische Seilkunst: Machtabgabe durch Unbeweglichkeit.",
    items: [
      {
        id: 198,
        title: "Lederhalsband mit D-Ring & Leine",
        desc: "Tragen eines weichen Lederhalsbands als Symbol der Zugehörigkeit; Führen an der Lederleine im Raum.",
        r1: "Halsband & Leine führen",
        r2: "Halsband & Leine tragen"
      },
      {
        id: 209,
        title: "Leder-Armbinder (Monohandschuh)",
        desc: "Schnüren der Arme hinter dem Rücken in einer unbeweglichen Lederhülle zur vollkommenen Starre.",
        r1: "Armbinder schnüren",
        r2: "Im Armbinder arretiert sein"
      },
      {
        id: 217,
        title: "Shibari (Japanische Seilkunst / Mormai)",
        desc: "Ästhetisches Knüpfen von Brust- und Torsomustern mit geölten Juteseilen für tiefes Abgleiten in den Subspace.",
        r1: "Als Rigger kunstvoll binden",
        r2: "Im Seil verharren & Subspace spüren"
      }
    ]
  },
  {
    id: 5,
    title: "Masken, Augenbinden & Sinnesentzug",
    desc: "Ausschalten visueller oder auditiver Reize für maximale Konzentration auf Berührungen.",
    items: [
      {
        id: 241,
        title: "Leder-Augenbinde (Blinder Gehorsam)",
        desc: "Blickdichtes Verbinden der Augen, sodass jede Berührung unerwartet und intensiver erlebt wird.",
        r1: "Augenbinde anlegen & lenken",
        r2: "Blind vertrauen & empfangen"
      },
      {
        id: 257,
        title: "Noise-Cancelling-Kopfhörer (Schallisolierung)",
        desc: "Vollständiges Ausblenden aller Umgebungsgeräusche durch Kopfhörer; Eintauchen in absolute innere Stille.",
        r1: "Musik/Stille steuern",
        r2: "Akustisch isoliert sein"
      },
      {
        id: 260,
        title: "Totaler Sinnesentzug (Blind & Taub)",
        desc: "Kombination aus Augenbinde, Kopfhörern und fixierten Händen für die ultimative sensorische Schutzlosigkeit.",
        r1: "Reize dosieren & führen",
        r2: "Ausgeliefert abtauchen"
      }
    ]
  },
  {
    id: 6,
    title: "Impact Play (Schlagintimität & Spanking)",
    desc: "Gezielter Schmerzreiz als emotionales Ventil, Wärmeerzeugung und Katharsis.",
    items: [
      {
        id: 262,
        title: "Warmes Handspanking auf das nackte Gesäß",
        desc: "Rhythmische Schläge mit der flachen Hand zur sanften Erwärmung des Gewebes und emotionalen Entladung.",
        r1: "Handspanking dosiert anwenden",
        r2: "Schläge mit Hand empfangen"
      },
      {
        id: 264,
        title: "Leder-Paddle (Flächig & dumpf)",
        desc: "Einsatz eines breiten Lederpaddles für dumpfe, nicht-spitze Reizübertragung ohne bleibende Narben.",
        r1: "Paddle führen",
        r2: "Hiebe mit Paddle empfangen"
      },
      {
        id: 275,
        title: "Reitgerte / Cane (Spitzer, scharfer Schmerz)",
        desc: "Präzise gesetzte, scharfe Hiebe auf Gesäß oder Oberschenkel; fordert höchste Disziplin und Treffsicherheit.",
        r1: "Gerte/Cane führen",
        r2: "Scharfen Schmerz aushalten"
      }
    ]
  },
  {
    id: 7,
    title: "Primal Play, Ringen & Bratting",
    desc: "Körperliches Kräftemessen, Jagdtrieb und befreiendes Kräftemessen.",
    items: [
      {
        id: 303,
        title: "Primal Wrestling (Matten-Ringen)",
        desc: "Echtes, leidenschaftliches Ringen auf dem Boden; Kräftemessen ohne Schläge bis zur Kapitulation.",
        r1: "Partner niederringen & bändigen",
        r2: "Kämpfen, fliehen & kapitulieren"
      },
      {
        id: 304,
        title: "Die Jagd (Chase Play im Haus)",
        desc: "Flucht durch die Wohnung; der dominante Part verfolgt die Beute, stellt sie und packt sie am Körper.",
        r1: "Beute erjagen & packen",
        r2: "Fliehen & erbeutet werden"
      },
      {
        id: 311,
        title: "Bratting (Absichtliches Frechsein & Testen)",
        desc: "Schelmisches Provozieren, Augenrollen oder freche Sprüche, um eine liebevolle Zurechtweisung herauszufordern.",
        r1: "Provokationen bändigen & strafen",
        r2: "Frech provozieren & Grenzen testen"
      }
    ]
  },
  {
    id: 8,
    title: "Caregiver, DDLG & Regression (Geborgenheit)",
    desc: "Rückzug aus der Erwachsenenwelt in kindliche Geborgenheit und fürsorgliche Pflege.",
    items: [
      {
        id: 320,
        title: "Gute-Nacht-Rituale & Vorlesen im Bett",
        desc: "Den erschöpften Partner in Kuscheldecken hüllen, heißen Tee servieren und aus Büchern vorlesen.",
        r1: "Partner einkuscheln & vorlesen",
        r2: "Eingekuschelt zuhören & einschlafen"
      },
      {
        id: 322,
        title: "Im Arm wiegen & Trösten (Nurturing)",
        desc: "Stummes, wiegendes Halten des Partners nach harten Arbeitstagen zur vollkommenen seelischen Entlastung.",
        r1: "Partner im Arm sanft wiegen",
        r2: "Gewiegt werden & Schutz spüren"
      }
    ]
  },
  {
    id: 9,
    title: "Aftercare & Nachsorge (Pos. 526–536)",
    desc: "Achtsame Landung nach der Session: Wärme, Decken, Tränen auffangen und Befindlichkeitsprüfung.",
    items: [
      {
        id: 526,
        title: "Absolutes Schweigen & Ruhezeit",
        desc: "Vereinbarte Phase ohne Worte; nur stummes Halten, Handkontakt und gleichmäßiger Atem.",
        r1: "Ruhe wahren & schützen",
        r2: "Wortlose Stille genießen"
      },
      {
        id: 527,
        title: "Gemeinsames Entspannungsbad nach der Session",
        desc: "Warmes Badewasser zum behutsamen Abwaschen von Schweiß, Ölen oder Wachs als Liebesdienst.",
        r1: "Partner waschen & pflegen",
        r2: "Behutsam gewaschen werden"
      },
      {
        id: 532,
        title: "24-Stunden-Check-in am Folgetag",
        desc: "Verbindliche Nachricht oder Anruf am Tag danach, um emotionalen Subdrop oder Muskelkater abzufangen.",
        r1: "Check-in proaktiv senden",
        r2: "Check-in empfangen & reflektieren"
      }
    ]
  },
  {
    id: 10,
    title: "Spezial-Kinks, Nischen & Demut (Pos. 537–595)",
    desc: "Fortgeschrittene Praktiken: Nuru, Kerker, Queening, CFNM und intensive Sensationen.",
    items: [
      {
        id: 542,
        title: "Nuru-Massage (Algen-Gleitmassage)",
        desc: "Body-to-Body Gleitmassage mit extrem glitschigem Nuru-Gel; beide Körper gleiten schwerelos aneinander ab.",
        r1: "Partner gleitend massieren",
        r2: "Glitschigen Gleitreiz empfangen"
      },
      {
        id: 581,
        title: "Anketten & Kerker-Arretierung im Wachzustand",
        desc: "Einsperren in eine Gitterzelle, Pranger oder Anketten an die Wand als fokussiertes Spiel mit Machtlosigkeit.",
        r1: "Partner anketten / einsperren",
        r2: "Angekettet verharren"
      },
      {
        id: 582,
        title: "Übernachten & Schlafen im Kerker",
        desc: "Die gesamte Nacht in der Zelle, im Käfig oder angekettet verbringen und erst morgens befreit werden.",
        r1: "Kerker-Nachtruhe anordnen",
        r2: "Im Kerker schlafen & aushalten"
      }
    ]
  },
  {
    id: 11,
    title: "Privatsphäre, Familie & Kinderschutz (Pos. 596–603)",
    desc: "Klare ethische Leitplanken: Schutz der Kinder, Diskretion und Trennung von Alltagskrisen.",
    items: [
      {
        id: 596,
        title: "Strikte Geheimhaltung im Freundeskreis",
        desc: "Unsere Praktiken bleiben ein absolutes Geheimnis; niemand im Umfeld erfährt davon.",
        type: "choice",
        question: "Welche Diskretion forderst du gegenüber Freunden & Bekannten?",
        options: [
          { val: "secret", label: "🔒 Absolutes Geheimnis zu 100 % Pflicht" },
          { val: "friends", label: "👥 Ausgewählte enge Szene-Freunde einweihen erlaubt" },
          { val: "open", label: "🌐 Vollkommen offener & entspannter Umgang" }
        ]
      },
      {
        id: 598,
        title: "Absolute Trennung von Kink und Kindern (Kinderschutz)",
        desc: "Striktes Verbot aller D/s-Rollen vor Kindern; alle Toys, Möbel und Käfige bleiben unzugänglich verschlossen.",
        type: "choice",
        question: "Welche Schutzregel gilt für Kinder im Haushalt / Umfeld?",
        options: [
          { val: "strict", label: "🛡️ 100 % Pflicht: Strikt weggeschlossen & unsichtbar" },
          { val: "safe", label: "🗝️ Sicher verschlossen im privaten Schlafzimmer" },
          { val: "none", label: "🏠 Keine Kinder im Haushalt vorhanden" }
        ]
      },
      {
        id: 602,
        title: "Digitaler Datenschutz (Handy-PIN & Fotos)",
        desc: "Sicherung intimer Chats, Fotos und Apps durch PIN-Sperren gegen zufällige Blicke Dritter.",
        type: "choice",
        question: "Wie regelt ihr Smartphone-Fotos und intime Chats?",
        options: [
          { val: "pin", label: "🔒 Verschlüsselter PIN-Ordner zwingend erforderlich" },
          { val: "trust", label: "🤝 Volles Vertrauen ohne spezielle Ordnersperre" },
          { val: "no_photos", label: "⛔ Keine intimen Fotos / Videos erlaubt" }
        ]
      },
      {
        id: 603,
        title: "Trennung von Beziehungskrisen und D/s-Dynamiken",
        desc: "Bei echtem Alltagsstress oder Streit pausieren alle dominanten Regeln sofort für reine partnerschaftliche Fürsorge.",
        type: "choice",
        question: "Was geschieht bei echtem Stress oder Streit?",
        options: [
          { val: "pause", label: "🛑 Sofortiger Stopp aller Spielregeln (Reine Fürsorge)" },
          { val: "dialog", label: "💬 Kurzes De-Briefing vor Fortführung" }
        ]
      }
    ]
  }
];

const lexikonData = [
  { term: "SSC (Safe, Sane, Consensual)", def: "Grundsatz der Kink-Szene: Alle Handlungen müssen sicher, vernünftig und zu 100 % einvernehmlich sein.", link: "https://de.wikipedia.org/wiki/Safe,_Sane,_Consensual" },
  { term: "RACK (Risk-Aware Consensual Kink)", def: "Erweitertes Konzept: Beide Partner sind sich der realen Risiken bewusst und tragen die Verantwortung gemeinsam.", link: "https://de.wikipedia.org/wiki/RACK" },
  { term: "Aftercare (Nachsorge)", def: "Liebevolle Fürsorge nach einer Session (Kuscheln, Wärmedecken, Trinken, De-Briefing) zur seelischen und körperlichen Stabilisierung.", link: "https://de.wikipedia.org/wiki/Aftercare_(BDSM)" },
  { term: "Subdrop / Topdrop", def: "Hormoneller und emotionaler Erschöpfungszustand nach intensiven Sessions durch Abfall von Endorphinen und Adrenalin.", link: "https://de.wikipedia.org/wiki/Subdrop" },
  { term: "Subspace", def: "Tranceähnlicher, glückseliger Flow-Zustand des submissiven Parts durch Schmerzreize, Endorphine und Hingabe.", link: "https://de.wikipedia.org/wiki/Subspace" },
  { term: "Shibari / Kinbaku", def: "Traditionelle japanische Kunst des Seilbindens mit geölten Naturfasern (Jute/Hanf) zur Erzeugung von Druckpunkten und Mustern.", link: "https://de.wikipedia.org/wiki/Shibari" },
  { term: "Praise Play", def: "Führung und Bestätigung des submissiven Partners durch warmes, echtes Lob und Zärtlichkeit statt Bestrafung.", link: "https://de.wikipedia.org/wiki/BDSM" },
  { term: "Tease & Denial / Edging", def: "Gezieltes Hochtreiben der Erregung bis kurz vor den Orgasmus mit anschließendem abruptem Abbruch der Stimulation.", link: "https://de.wikipedia.org/wiki/Edging" },
  { term: "Bratting & Brat Taming", def: "Spielerisches, freches Provozieren des Dominanten zur Herausforderung einer liebevoll-strengen Zurechtweisung.", link: "https://de.wikipedia.org/wiki/BDSM" },
  { term: "Primal Play", def: "Instinktgetriebenes, körperbetontes Spiel mit Ringen, Beißen, Jagen und Kräftemessen ohne formelle Regeln.", link: "https://de.wikipedia.org/wiki/BDSM" },
  { term: "Caregiver / Little", def: "Rollenverteilung zwischen fürsorglicher Elternfigur und beschütztem Partner zur seelischen Entlastung.", link: "https://de.wikipedia.org/wiki/Adult_Baby" },
  { term: "CBT (Cock and Ball Torture)", def: "Gezielte Reizung oder Schmerzapplikation an Penis und Hoden (z. B. Abbinden, Gewichte, Schläge).", link: "https://de.wikipedia.org/wiki/Cock_and_Ball_Torture" }
];
