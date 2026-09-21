window.surveyChapters = (window.surveyChapters || []).concat([
  {
    id: 1,
    title: "Körperbild, Schamgrenzen & Berührungszonen",
    desc: "Das persönliche Fundament: Zonen der Geborgenheit, Schamgrenzen und Berührungstoleranzen.",
    items: [
      { id: 1, title: "Kopfhaut & Haare kraulen", desc: "Sanftes Durchfahren mit den Fingern oder Kraulen der Kopfhaut zur Entspannung.", r1: "Partner im Haar kraulen", r2: "Im Haar gekrault werden" },
      { id: 2, title: "Nackenzone & Schlüsselbeine", desc: "Zärtliche Küsse und behutsames Berühren an Kehle, Nacken und Schlüsselbein.", r1: "Nacken küssen & liebkosen", r2: "Nackenküsse empfangen" },
      { id: 3, title: "Brüste, Brustwarzen & Dekolleté", desc: "Liebevolles Streicheln, Zupfen, Saugen oder Kitzeln an Brust und Brustwarzen.", r1: "Brüste & Nippel liebkosen", r2: "Berührung an Brüsten genießen" },
      { id: 4, title: "Bauch- & Taillenzone (Sensible Schamzone)", desc: "Sanftes Berühren des Bauches; für manche Geborgenheit, für andere schambelastet.", r1: "Bauch zärtlich streicheln", r2: "Am Bauch berührt werden" },
      { id: 5, title: "Rücken & Wirbelsäulen-Linie", desc: "Fingerspitzen-Streichen oder Massagen entlang der Wirbelsäule.", r1: "Rücken liebkosen & massieren", r2: "Rückenmassagen empfangen" },
      { id: 6, title: "Gesäß & Oberschenkel-Innenseiten", desc: "Flächiges Streicheln, Kneten oder warmes Berühren der Schenkel und des Pos.", r1: "Gesäß & Schenkel liebkosen", r2: "Berührung empfangen" },
      { id: 7, title: "Füße, Fußsohlen & Zehen", desc: "Massieren der Fußsohlen, Fußküsse oder Einbeziehen der Füße in Verwöhnrituale.", r1: "Füße des Partners verwöhnen", r2: "Füße verwöhnen lassen" },
      {
        id: 8, title: "Umgang mit Schamzonen & Körperkomplexen", desc: "Akzeptanz und Schutz sensibler Zonen; kein ungefragtes Entblößen.", type: "choice",
        question: "Wie wünschst du dir den Umgang mit deinen Scham- & Problemzonen?",
        options: [
          { val: "praise", label: "💖 Liebevolles Lob & Bestärkung erwünscht" },
          { val: "cover", label: "🛡️ Bestimmte Zonen bitte zunächst bedeckt lassen" },
          { val: "open", label: "🌟 Völlig unbefangen & frei von Scham" },
          { val: "tabu", label: "⛔ Bestimmte Stellen sind für Berührungen tabu" }
        ]
      },
      {
        id: 9, title: "Beleuchtung im Schlafzimmer", desc: "Wie viel Licht ist dir beim Intimsein am liebsten?", type: "choice",
        question: "Welches Licht bevorzugst du im Raum?",
        options: [
          { val: "dark", label: "🌑 Vollständige Dunkelheit gibt mir die größte Sicherheit" },
          { val: "dim", label: "🕯️ Sanftes, gedimmtes Licht oder Kerzenschein" },
          { val: "bright", label: "💡 Helles Licht – ich möchte alles genau sehen" }
        ]
      },
      { id: 10, title: "Kitzeln an empfindlichen Körperstellen", desc: "Spielerisches Kitzeln an Bauch, Rippen oder Fußsohlen als Auflockerung.", r1: "Den Partner spielerisch kitzeln", r2: "Gekitzelt werden & lachen" },
      { id: 11, title: "Kratzen mit den Fingernägeln (Scratching)", desc: "Sanftes bis leichtes Ziehen der Nägel über Rücken, Schultern oder Gesäß.", r1: "Mit den Nägeln über die Haut streichen", r2: "Das leichte Kratzen auf der Haut spüren" },
      { id: 12, title: "Sanftes Beißen & Knabbern", desc: "Zärtliches Knabbern an Ohrläppchen, Lippen, Nacken oder Schultern.", r1: "Zärtlich knabbern & zubeißen", r2: "Knabbern & kleine Bisse empfangen" },
      {
        id: 13, title: "Körperbehaarung & Rasurvorlieben", desc: "Deine persönliche Haltung zu Intim- und Körperbehaarung.", type: "choice",
        question: "Welche Vorliebe hast du bei der Körperbehaarung?",
        options: [
          { val: "smooth", label: "🪒 Vollständig glattrasiert bevorzugt" },
          { val: "trimmed", label: "✂️ Gepflegt getrimmt reicht völlig aus" },
          { val: "natural", label: "🌿 Ganz natürlich belassen gefällt mir am besten" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Romantik, Küsse & Zärtlichkeit",
    desc: "Liebevolle Verbundenheit: Der Herzschlag der Beziehung und Entschleunigung im Bett.",
    items: [
      { id: 14, title: "Intimer Augenkontakt (Soul Gazing)", desc: "Tiefes In-die-Augen-Schauen beim Streicheln oder Sex zur Verankerung vollen Vertrauens.", r1: "Augenkontakt aktiv halten", r2: "Blickkontakt erwidern" },
      { id: 15, title: "Sanftes Streicheln über die Wangen", desc: "Behutsames Führen der Fingerspitzen über Wangen, Schläfen und Kieferpartie.", r1: "Über die Wangen streichen", r2: "Die Berührung im Gesicht genießen" },
      { id: 16, title: "Stirn-an-Stirn ruhen & gemeinsam atmen", desc: "Die Stirn an die des Partners legen, Augen schließen und den gemeinsamen Atem spüren.", r1: "Die Stirn anlegen & Nähe schenken", r2: "Stirn an Stirn loslassen" },
      { id: 17, title: "Händchenhalten beim Liebesspiel", desc: "Die Finger fest ineinander verschränken, während man sich intim liebt.", r1: "Die Hand des Partners fest greifen", r2: "Die Hand halten & Halt spüren" },
      { id: 18, title: "Zärtlicher Dirty Talk & Flüstern ins Ohr", desc: "Leises Zuhauchen von Kosenamen, Sehnsüchten oder erregenden Worten.", r1: "Ins Ohr flüstern", r2: "Der Stimme im Ohr lauschen" },
      { id: 19, title: "Küsse auf geschlossene Augenlider", desc: "Federleichte Küsse auf die Lider des ruhenden Partners.", r1: "Die Lider küssen", r2: "Die Küsse auf den Augen empfangen" },
      { id: 20, title: "Liebesgeständnisse mitten im Rausch", desc: "Worte wie 'Ich liebe dich' oder tiefe Zuneigung genau im intensivsten Moment aussprechen.", r1: "Liebesworte im Moment sagen", r2: "Die Worte hören & aufnehmen" },
      { id: 21, title: "Umarmer-Sex (Belly-to-Belly)", desc: "Sehr eng umschlungenes Lieben, bei dem Bauch an Bauch liegt.", r1: "Den Partner ganz nah an sich ziehen", r2: "Eng umschlungen lieben" },
      { id: 22, title: "Gegenseitiges Füttern mit Leckereien", desc: "Erdbeeren, Weintrauben oder Schokolade mit den Fingern reichen und genüsslich ablecken.", r1: "Den Partner füttern", r2: "Sich füttern lassen" },
      {
        id: 23, title: "Hintergrundmusik im Schlafzimmer", desc: "Atmosphärische Playlists, sanfte Bässe oder ruhige Klänge beim Liebesspiel.", type: "choice",
        question: "Welche Klangkulisse magst du am liebsten?",
        options: [
          { val: "music", label: "🎵 Sanfte Erotik- oder Chillout-Playlists" },
          { val: "silence", label: "🤫 Reine Stille – ich will nur unseren Atem hören" },
          { val: "sounds", label: "🌊 Naturgeräusche (z. B. Regen oder Meeresrauschen)" }
        ]
      },
      { id: 24, title: "Nasenstubsen (Eskimo-Kuss)", desc: "Verspieltes Reiben der Nasenspitzen aneinander zur Auflockerung.", r1: "Die Nase sanft reiben", r2: "Den Stupser erwidern" },
      { id: 25, title: "Handkuss als Begrüßungsritual", desc: "Die Hand des Partners zum Mund führen und andächtig auf den Handrücken küssen.", r1: "Die Hand küssen", r2: "Die Hand küssen lassen" },
      { id: 26, title: "Kuss auf die Schulter von hinten", desc: "Von hinten an den Partner herantreten und sanft die Schulter küssen.", r1: "Von hinten die Schulter küssen", r2: "Den Schulterkuss spüren" },
      { id: 27, title: "Gemeinsames Anschauen im Spiegel", desc: "Nebeneinander vor dem Spiegel stehen, berühren und den Blick über das Spiegelbild austauschen.", r1: "Den Blick im Spiegel suchen", r2: "Sich gemeinsam im Spiegel betrachten" }
    ]
  },
  {
    id: 3,
    title: "Tantra & Sinnliches Vorspiel",
    desc: "Achtsame Entschleunigung: Die Kunst, Erregung ohne Eile und ohne Leistungsdruck aufzubauen.",
    items: [
      { id: 28, title: "Sinnlicher Lippentanz & Zungenküsse", desc: "Sehr langes, zartes Küssen ohne Hast, bei dem sich Lippen und Zungen umkreisen.", r1: "Küsse aktiv führen", r2: "Hingebungsvoll küssen lassen" },
      { id: 29, title: "Feder- & Seidentuch-Berührungen", desc: "Mit weichen Seidentüchern oder Federn schwerelos über nackte Haut streichen.", r1: "Das Tuch oder die Feder führen", r2: "Die federleichte Berührung spüren" },
      { id: 30, title: "Warmes Aroma-Massageöl auf der Haut", desc: "Erwärmtes Mandel- oder Jojobaöl mit ruhigen Händen langsam einmassieren.", r1: "Den Partner mit warmem Öl massieren", r2: "Die warme Ölmassage genießen" },
      { id: 31, title: "Gemeinsame Atem-Synchronisation", desc: "Brust an Brust liegen und bewusst im selben Takt atmen, bis der Puls eins wird.", r1: "Den Atemrhythmus vorgeben", r2: "Den Takt aufnehmen & mitschwingen" },
      { id: 32, title: "Zonenfokussiertes Streicheln (Genitalien tabu)", desc: "Den gesamten Körper liebkosen, während Intimzonen zunächst strikt unberührt bleiben.", r1: "Den Körper berühren & Intimzone meiden", r2: "Die Spannung aushalten & genießen" },
      { id: 33, title: "Warmer Atem auf feuchter Haut", desc: "Ganz nah an Schläfen, Nacken oder Oberschenkeln sanft warm ausatmen.", r1: "Warmen Atem über die Haut hauchen", r2: "Den warmen Hauch spüren" },
      { id: 34, title: "Yoni- & Lingam-Massage (Achtsamkeit)", desc: "Achtsame, absichtsfreie Berührung des Intimbereichs ohne das Ziel eines schnellen Höhepunkts.", r1: "Die achtsame Intimmassage geben", r2: "Absichtsfrei empfangen & loslassen" },
      { id: 35, title: "Langes Zeitlupen-Entkleiden", desc: "Jedes Kleidungsstück mit Bedacht, Pausen und vielen Küssen ganz langsam ablegen.", r1: "Den Partner langsam ausziehen", r2: "Sich Schicht für Schicht entkleiden lassen" },
      {
        id: 36, title: "Aromatherapie & Duftkerzen im Raum", desc: "Sandelholz, Lavendel oder Vanille als fester Bestandteil des Ambientes.", type: "choice",
        question: "Welche Düfte magst du im Schlafzimmer?",
        options: [
          { val: "woody", label: "🪵 Warme Hölzer (Sandelholz, Zedernholz)" },
          { val: "sweet", label: "🍨 Süße Düfte (Vanille, Mandel, Honig)" },
          { val: "fresh", label: "🌿 Frische Kräuter (Lavendel, Minze, Zitrus)" },
          { val: "none", label: "⛔ Lieber vollkommen geruchsneutral" }
        ]
      },
      { id: 37, title: "Ganztages-Vorspiel über Kurznachrichten", desc: "Über den Tag verteilt kleine Hinweise, Vorfreude oder Fotos senden, die auf den Abend einstimmen.", r1: "Die neckenden Nachrichten schreiben", r2: "Die Nachrichten empfangen & Vorfreude spüren" },
      { id: 38, title: "Kuscheln vor dem Sex ohne Leistungsdruck", desc: "Mindestens 20 Minuten unter der Decke liegen, ohne dass sofort Sex folgen muss.", r1: "Den Partner im Arm halten", r2: "Eingekuschelt zur Ruhe kommen" },
      { id: 39, title: "Streichungen mit den Handrücken", desc: "Mit den kühlen Handrücken sanft über Wangen, Hals und Arme gleiten.", r1: "Den Handrücken führen", r2: "Das kühle Streichen genießen" },
      { id: 40, title: "Sanfte Becken-Kreisungen", desc: "Beim engen Liegen die Hüften ganz langsam und kreisend aneinander reiben.", r1: "Die Kreisbewegung anleiten", r2: "Die Reibung des Beckens spüren" }
    ]
  },
  {
    id: 4,
    title: "Klassische & Erotische Stellungen",
    desc: "Körperhaltungen im Bett: Nähe, Tiefe, Blickkontakt und der Wechsel von Führung und Empfangen.",
    items: [
      { id: 41, title: "Missionar mit intensivem Blickkontakt", desc: "Die klassische Haltung von oben, ganz nah beieinander mit tiefem Blick in die Augen.", r1: "Oben liegen & Blickkontakt halten", r2: "Unten liegen & den Partner empfangen" },
      { id: 42, title: "Löffelchen-Stellung (Geborgen von hinten)", desc: "Seitlich umschlungen liegen; von hinten eindringen, während Hände den Körper erkunden.", r1: "Von hinten umschlingen & lieben", r2: "Im Löffelchen geborgen empfangen" },
      { id: 43, title: "Reiterstellung (Tempo selbst bestimmen)", desc: "Oben auf dem Partner reiten und Rhythmus sowie Tiefe frei steuern.", r1: "Unten liegen & den Anblick genießen", r2: "Oben reiten & den Rhythmus bestimmen" },
      { id: 44, title: "Doggy Style (Fordernd von hinten)", desc: "Auf allen Vieren; der Partner greift die Hüften und bestimmt den gewünschten Takt.", r1: "Die Hüften greifen & von hinten führen", r2: "Auf allen Vieren den Partner aufnehmen" },
      { id: 45, title: "Lotos-Sitz (Herz an Herz umschlungen)", desc: "Aufrecht im Schoß sitzen, Beine um die Hüften geschlungen, ganz nah aneinander.", r1: "Im Schneidersitz halten & führen", r2: "Im Schoß sitzen & eng umarmen" },
      { id: 46, title: "Prone Bone (Flach auf dem Bauch)", desc: "Flach auf dem Bauch mit geschlossenen Beinen liegen, während der Partner von hinten aufsteigt.", r1: "Flach von hinten auflegen & eindringen", r2: "Auf dem Bauch liegen & die Enge spüren" },
      { id: 47, title: "Beine auf den Schultern ablegen", desc: "Die Beine auf die Schultern des Partners legen für maximale Tiefe und Ausdehnung.", r1: "Die Beine auflegen & tief lieben", r2: "Die Beine ablegen & ganz öffnen" },
      { id: 48, title: "Kanten-Sex am Bettrand", desc: "Der empfangende Part liegt am Bettrand, der Partner steht davor und führt die Bewegung.", r1: "Vor dem Bett stehen & führen", r2: "Am Bettrand liegen & empfangen" },
      { id: 49, title: "Stehend an der Zimmerwand", desc: "Den Partner an die Wand drücken, ein Bein anheben und fordernd im Stehen lieben.", r1: "An die Wand heben & im Stehen lieben", r2: "An die Wand gelehnt genießen" },
      {
        id: 50, title: "Stellungswechsel mitten im Akt", desc: "Wie oft magst du Stellungswechsel während einer Runde?", type: "choice",
        question: "Wie oft wechselt ihr gerne die Position?",
        options: [
          { val: "few", label: "🧘 Lieber 1 bis 2 Positionen ganz tief auskosten" },
          { val: "many", label: "🔄 Vielfalt! Mehrmals wechseln für unterschiedliche Reize" },
          { val: "spontaneous", label: "✨ Völlig spontan nach Lust und Laune" }
        ]
      },
      { id: 51, title: "Spiegel-Sex (Sich beim Sex zuschauen)", desc: "Sich direkt vor einem großen Wandspiegel lieben und den Anblick der Körper beobachten.", r1: "Den Blick in den Spiegel lenken", r2: "Den gemeinsamen Anblick im Spiegel genießen" },
      { id: 52, title: "Abruptes Wechseln von langsam zu fordernd", desc: "Mitten im sanften Streicheln plötzlich das Tempo anziehen und fordernd zustoßen.", r1: "Das Tempo überraschend anziehen", r2: "Den plötzlichen Rhythmuswechsel empfangen" }
    ]
  },
  {
    id: 5,
    title: "Spontaneität, Orte & Clothed Sex",
    desc: "Das Brechen der Routine: Sex in Kleidung, schnelle Nummern und besondere Orte.",
    items: [
      { id: 53, title: "Schneller Quickie vor dem Verlassen der Wohnung", desc: "Noch in Jacke und Schuhen im Flur fordernd übereinander herfallen.", r1: "Den schnellen Quickie im Flur einfordern", r2: "Im Flur gepackt & verführt werden" },
      { id: 54, title: "Clothed Sex (Unterwäsche nur zur Seite schieben)", desc: "Die Kleidung anbehalten, Höschen nur beiseiteschieben und direkt lieben.", r1: "Die Unterwäsche zur Seite schieben & zugreifen", r2: "Bekleidet bleiben & Berührung geschehen lassen" },
      { id: 55, title: "Kücheninsel oder Esstisch erobern", desc: "Den Partner auf die Tischkante heben, Teller beiseiteschieben und fordernd lieben.", r1: "Auf die Tischplatte heben & führen", r2: "Auf dem Tisch sitzen & empfangen" },
      { id: 56, title: "Liebesspiel unter der warmen Dusche", desc: "Unter dem prasselnden Wasserstrahl eng umschlungen stehen und sich einschäumen.", r1: "Unter der Dusche packen & einseifen", r2: "Im warmen Wasser empfangen" },
      { id: 57, title: "Sex im geparkten Auto an einsamer Stelle", desc: "Spät abends ins Grüne fahren und auf umgeklappten Sitzen lieben.", r1: "Die Sitze umklappen & im Auto lieben", r2: "Auf dem Autositz verführt werden" },
      { id: 58, title: "Heimliche Berührungen bei Besuch im Nebenzimmer", desc: "Wenn Gäste da sind, im Flur kurz die Hand unter das Kleid oder in die Hose schieben.", r1: "Heimlich zugreifen & still sein gebieten", r2: "Die verbotene Hand spüren & stillhalten" },
      { id: 59, title: "Spontanes Wecken mitten in der Nacht", desc: "Mitten in der Nacht aufwachen und sich schlaftrunken und leidenschaftlich lieben.", r1: "Den Partner nachts wachküssen", r2: "Mitten in der Nacht geweckt werden" },
      { id: 60, title: "Auf dem dicken Teppich vor dem Sofa", desc: "Mit Kissen und Decken direkt auf dem Wohnzimmerboden lieben.", r1: "Auf den Boden ziehen & lieben", r2: "Auf dem Teppich empfangen" },
      { id: 61, title: "Spontane Berührung beim gemeinsamen Kochen", desc: "Beim Gemüseschneiden von hinten herantreten, eng andrücken und Hände wandern lassen.", r1: "Beim Kochen von hinten andrücken", r2: "Am Herd stehen & die Hände empfangen" },
      {
        id: 62, title: "Wie wichtig ist dir Spontaneität im Alltag?", desc: "Brauchst du feste Vorbereitung oder liebst du den spontanen Funken?", type: "choice",
        question: "Welche Art von Sex passt besser zu deinem Alltag?",
        options: [
          { val: "spontaneous", label: "⚡ Spontane Impulse und schnelle Nummern halten uns frisch" },
          { val: "planned", label: "🕯️ Lieber geplante Abende mit viel Ruhe und ohne Hektik" },
          { val: "both", label: "⚖️ Eine gute Mischung aus beidem" }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Oralverkehr & Rachenspiele",
    desc: "Hingebungsvolle Lust mit Mund und Zunge: Cunnilingus, Fellatio und besondere Techniken.",
    items: [
      { id: 63, title: "Hingebungsvoller Cunnilingus (Langes Lecken)", desc: "Vulva und Klitoris mit viel Ruhe, Zungenspitze und Lippen verwöhnen.", r1: "Die Partnerin ausgiebig mit der Zunge verwöhnen", r2: "Cunnilingus genießen & fallenlassen" },
      { id: 64, title: "Fellatio mit voller Aufmerksamkeit (Blowjob)", desc: "Den Penis mit Lippen, Zunge und Speichel verwöhnen und liebkosen.", r1: "Dem Mann einen hingebungsvollen Blowjob schenken", r2: "Oral verwöhnt werden & genießen" },
      { id: 65, title: "69er-Stellung (Gleichzeitig oral lieben)", desc: "Gegengleich liegen und sich zur selben Zeit gegenseitig mit Mund und Zunge verwöhnen.", r1: "Die 69er-Haltung aktiv führen", r2: "In der 69er-Haltung gleichzeitig empfangen" },
      { id: 66, title: "Hoden sanft in den Mund nehmen", desc: "Die Hoden behutsam mit warmen Lippen umschließen und sanft liebkosen.", r1: "Die Hoden in den Mund nehmen", r2: "Die warmen Lippen an den Hoden spüren" },
      { id: 67, title: "Dildo-Blastraining für den Mann", desc: "Gemeinsam mit einem Toy die Rachenmuskulatur dehnen und den Schluckreflex abbauen.", r1: "Das Blastraining geduldig anleiten", r2: "Mit dem Toy den Rachen entspannen üben" },
      { id: 68, title: "Deepthroat (Tiefe Rachenaufnahme)", desc: "Den Penis ganz tief bis in den Rachen gleiten lassen und die feste Enge spüren.", r1: "Tief in den Rachen gleiten", r2: "Den Penis ganz tief aufnehmen" },
      { id: 69, title: "Face-Fucking (Aktives Führen des Beckens)", desc: "Der führende Part hält den Kopf des Partners und bestimmt Rhythmus und Tiefe im Mund.", r1: "Den Kopf halten & im Mund führen", r2: "Den Kopf halten lassen & aufnehmen" },
      { id: 70, title: "Speichel als warmes Gleitmittel nutzen", desc: "Reichlich warmen Speichel beim Oralverkehr fließen lassen.", r1: "Mit viel Speichel benetzen & lieben", r2: "Den nassen Speichelfluss genießen" },
      { id: 71, title: "Oralverkehr bis zum Höhepunkt (Orgasmus im Mund)", desc: "Den Partner ohne Unterbrechung mit dem Mund zum Orgasmus bringen.", r1: "Den Partner mit den Lippen zum Orgasmus führen", r2: "Im Mund des Partners zum Orgasmus kommen" },
      { id: 72, title: "Samen schlucken nach dem Blowjob", desc: "Das Ejakulat nach dem Höhepunkt des Mannes direkt im Mund empfangen und schlucken.", r1: "Im Mund ejakulieren dürfen", r2: "Das Sperma im Mund aufnehmen & schlucken" },
      { id: 73, title: "Ejakulation auf Gesicht oder Brust (Facial)", desc: "Den Höhepunkt des Mannes auf den Lippen, Wangen oder dem Dekolleté platzieren.", r1: "Auf Gesicht oder Brust kommen", r2: "Das Ejakulat auf der Haut empfangen" },
      { id: 74, title: "Augenkontakt beim Blowjob halten", desc: "Beim Oralverkehr ununterbrochen nach oben schauen und tief in die Augen blicken.", r1: "Den Blick von oben erwidern", r2: "Von unten tief in die Augen schauen" },
      {
        id: 75, title: "Deine Haltung zu Sperma im Mund", desc: "Wie stehst du persönlich zum Geschmack und Schlucken von Ejakulat?", type: "choice",
        question: "Wie gehst du am liebsten mit dem Samenerguss um?",
        options: [
          { val: "swallow", label: "😋 Ich schlucke das Ejakulat gerne & vollkommen selbstverständlich" },
          { val: "skin", label: "✨ Lieber auf Bauch, Brust oder im Taschentuch" },
          { val: "spit", label: "💧 Im Mund empfangen ja, aber danach ausspülen" },
          { val: "none", label: "⛔ Sperma im Mund mag ich überhaupt nicht" }
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Orgasmussteuerung, Edging & Tease/Denial",
    desc: "Das Spiel mit der Geduld: Den Höhepunkt hinauszögern, Reize entziehen und Lust steigern.",
    items: [
      { id: 76, title: "Start-Stop-Technik (Edging)", desc: "Heranführen an die Schwelle des Orgasmus, abruptes Stoppen und wieder von vorne beginnen.", r1: "Den Partner an die Kante führen & stoppen", r2: "An der Kante anhalten & abkühlen müssen" },
      { id: 77, title: "Multiples Edging vor der Freigabe", desc: "Mindestens drei- bis fünfmal kurz vor den Höhepunkt gebracht werden vor der Erlaubnis.", r1: "Den Partner mehrfach edgen & zappeln lassen", r2: "Mehrmals kurz vor dem Höhepunkt gestoppt werden" },
      { id: 78, title: "Ruinierter Orgasmus (Ruined Orgasm)", desc: "Im Moment des Beginns der Ejakulation jede Berührung stoppen – Muskeln zucken ohne Druckentlastung.", r1: "Den Höhepunkt gezielt ruinieren & zusehen", r2: "Den ruinierten Orgasmus hinnehmen müssen" },
      { id: 79, title: "Orgasmus-Verbot für mehrere Tage", desc: "Feste Vereinbarung: Für 3, 5 oder 7 Tage weder selbst noch durch Sex erleichtern.", r1: "Das Orgasmus-Verbot fest verhängen", r2: "Das Verbot geduldig einhalten & Sehnsucht spüren" },
      { id: 80, title: "Verbot der Selbstbefriedigung (Solo-Verbot)", desc: "Keine Hand an sich selbst legen; jede Entladung findet ausschließlich durch den Partner statt.", r1: "Die alleinige Kontrolle über die Lust beanspruchen", r2: "Die Hände von sich selbst weglassen" },
      { id: 81, title: "Erlaubnis erbitten vor dem Kommen", desc: "Wenn der Höhepunkt naht, innehalten und fragen: 'Darf ich kommen?' – und aufs Nicken warten.", r1: "Die Erlaubnis einfordern & erteilen", r2: "Artig um Erlaubnis bitten" },
      { id: 82, title: "Weiterstreicheln nach dem Orgasmus (Überreizung)", desc: "Direkt nach dem Höhepunkt weitermachen; die überempfindliche Eichel oder Klitoris weiter berühren.", r1: "Nach dem Höhepunkt weitermachen", r2: "Die intensive Überempfindlichkeit ertragen" },
      { id: 83, title: "Orgasmus auf Zählkommando (Countdown)", desc: "Langsam von 5 rückwärts zählen: Bei 'Eins' muss der Höhepunkt erreicht sein, sonst Stopp.", r1: "Den Countdown laut & fordernd zählen", r2: "Auf den Zähltakt hin zum Orgasmus kommen" },
      { id: 84, title: "Langsame Plateaus statt schneller Entladung", desc: "Über eine Stunde auf mittlerer Erregungsstufe verweilen, ohne an die Kante zu stoßen.", r1: "Das Plateau ruhig & gleichmäßig steuern", r2: "Auf dem Plateau verweilen & genießen" },
      { id: 85, title: "Einen Orgasmus verweigern (Denial)", desc: "Nach langer Session heiß machen, aber am Ende ohne Erleichterung ins Bett schicken.", r1: "Die Erlösung für heute ganz verweigern", r2: "Ungelöst ins Bett gehen & Sehnsucht mitnehmen" },
      { id: 86, title: "Funk-Vibrator beim Kochen oder Fernsehen", desc: "Ein kleines Toy tragen, dessen Fernbedienung der Partner in der Hand hält und steuert.", r1: "Die Fernbedienung beiläufig bedienen", r2: "Das Toy tragen & auf die Knöpfe warten" },
      { id: 87, title: "Gezieltes Weitermachen bei Tränen der Erregung", desc: "Wenn durch langes Aufschieben Tränen fließen, liebevoll und sanft weiterteasen.", r1: "Die Tränen sehen & behutsam weiterführen", r2: "Die Gefühle laufen lassen & weitergeführt werden" },
      { id: 88, title: "Befehl zum Stillhalten beim Orgasmus", desc: "Im Moment des Höhepunkts vollkommen reglos daliegen müssen; kein Strampeln erlaubt.", r1: "Das Stillhalten beim Höhepunkt anordnen", r2: "Reglos daliegen, während der Körper bebt" },
      { id: 89, title: "Hand auf den Mund beim Höhepunkt", desc: "Dem Partner die flache Hand fest auf den Mund legen, sodass der Schrei gedämpft wird.", r1: "Die Hand auf den Mund legen & dämpfen", r2: "In die Handfläche stöhnen müssen" },
      { id: 90, title: "Multipler Orgasmus für die Frau einfordern", desc: "Die Partnerin nach dem ersten Höhepunkt direkt zum zweiten und dritten führen.", r1: "Geduldig bis zum nächsten Orgasmus leiten", r2: "Mehrere Höhepunkte hintereinander empfangen" },
      { id: 91, title: "Prostata-Orgasmus ohne Penis-Berührung", desc: "Den Mann allein durch Druck auf den Damm oder innere Massage zum Höhepunkt bringen.", r1: "Den reinen Prostata-Höhepunkt steuern", r2: "Den tiefen Orgasmus von innen erleben" },
      { id: 92, title: "Aufschreiben der Tage ohne Orgasmus (Tagebuch)", desc: "Festhalten, wann der letzte Orgasmus war und wie lange gewartet wurde.", r1: "Das Lust-Tagebuch prüfen & führen", r2: "Die Tage zählen & im Heft festhalten" },
      {
        id: 93, title: "Umgang mit versehentlichen Höhepunkten", desc: "Was passiert, wenn trotz Stopp versehentlich doch gekommen wurde?", type: "choice",
        question: "Wie geht ihr mit einem versehentlichen Ausrutscher um?",
        options: [
          { val: "hug", label: "🤗 Lachen, in den Arm nehmen – absolut kein Vorwurf" },
          { val: "chores", label: "🧹 Eine kleine spielerische Strafe (z. B. Fußmassage)" },
          { val: "longer_denial", label: "⏳ Die Wartezeit bis zum nächsten Mal verlängert sich" }
        ]
      },
      { id: 94, title: "Einen Orgasmus durch Belohnung verdienen", desc: "Der Höhepunkt wird erst gewährt, wenn eine vereinbarte Aufgabe erledigt wurde.", r1: "Die Belohnung an eine Aufgabe knüpfen", r2: "Sich die Erlösung fleißig verdienen" },
      { id: 95, title: "Sehr langsamer Aufbau über zwei Stunden", desc: "Zwei Stunden Zeit nehmen, um die Erregung wie auf einer feinen Treppe zu heben.", r1: "Die zwei Stunden mit Ruhe dirigieren", r2: "Zwei Stunden lang die Spannung aufbauen lassen" },
      { id: 96, title: "Nippel-Stimulation beim Orgasmus", desc: "Im Moment des Kommens die Brustwarzen fest zwischen den Fingern zwirbeln.", r1: "Im Höhepunkt fest an den Nippeln drehen", r2: "Den doppelten Reiz an Nippeln & Genital spüren" },
      { id: 97, title: "Becken festhalten gegen ungeduldiges Stoßen", desc: "Beide Hände fest auf die Hüften pressen, damit nicht ungeduldig gezuckt werden kann.", r1: "Die Hüfte festhalten & Ruhe fordern", r2: "Fixiert daliegen & nicht zucken dürfen" },
      { id: 98, title: "Sensuelles Tease & Denial", desc: "Zärtliches Streicheln mit den Lippen, aber immer einen Millimeter vor der Berührung abdrehen.", r1: "Ganz nah herangehen & wieder abdrehen", r2: "Die Lippen am Körper spüren & fast verrückt werden" },
      { id: 99, title: "Orgasmus im Stehen an der Wand", desc: "Den Partner an die Wand gedrückt mit Fingern zum Zittern bringen, bis die Knie weich werden.", r1: "Den Partner an der Wand zum Kommen bringen", r2: "An der Wand stehen & weiche Knie bekommen" },
      { id: 100, title: "Kuss auf die Lippen genau beim Kommen", desc: "Im Moment des Höhepunkts tief und innig küssen, um Atem und Geschmack zu teilen.", r1: "Den Kuss im Orgasmus fordern & trinken", r2: "Im Kuss vergehen & loslassen" },
      { id: 101, title: "Kopf nach hinten neigen beim Orgasmus", desc: "Die Haare sanft greifen und den Hals beim Höhepunkt strecken, um die Kehle freizugeben.", r1: "Den Kopf sanft nach hinten führen", r2: "Den Hals freilegen & den Reiz spüren" },
      { id: 102, title: "Leises Stöhnen auf Befehl einstellen", desc: "Mitten im schönsten Stöhnen sagen: 'Ganz leise sein' – und lauschen, wie der Atem stockt.", r1: "Die Stille befehlen & lauschen", r2: "Sofort verstummen & lautlos genießen" },
      { id: 103, title: "Countdown-Orgasmus (Freigabe exakt bei Eins)", desc: "Von 10 rückwärts zählen; der Partner darf sich erst bei der Zahl Eins fallenlassen.", r1: "Den Takt vorgeben & bei Eins erlösen", r2: "Die Sekunden zählen & bei Eins explodieren" },
      { id: 104, title: "Einen Orgasmus im Traum versprechen", desc: "Vor dem Einschlafen flüstern: 'Morgen früh darfst du kommen' – und Vorfreude wecken.", r1: "Das Versprechen für den Morgen geben", r2: "Mit der süßen Verheißung einschlafen" },
      {
        id: 105, title: "Welche Art von Orgasmus-Steuerung reizt dich am meisten?", desc: "Deine persönliche Haltung zu Teasing und Hinauszögern.", type: "choice",
        question: "Was macht dich beim Hinauszögern am heißesten?",
        options: [
          { val: "multiple_edging", label: "🎢 Mehrfaches Edging kurz vor der Kante" },
          { val: "denial", label: "🚫 Mehrtägiges Verbot mit süßer Sehnsucht" },
          { val: "command", label: "👑 Countdown & Erlaubnis erbitten müssen" },
          { val: "none", label: "⛔ Ich mag schnelles, unkompliziertes Kommen ohne Hinauszögern" }
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Keuschhaltung & Lust-Erhaltung (Chastity)",
    desc: "Freiwillige Abgabe der Schlüsselgewalt: Käfige, Zeittresore und Hygiene-Rituale.",
    items: [
      { id: 106, title: "Den richtigen Keuschheitskäfig finden", desc: "Passgenauer Edelstahl- oder Silikonkäfig, der bequem sitzt und nicht drückt.", r1: "Den passenden Käfig aussuchen & anpassen", r2: "Den Käfig probieren & passend sitzen haben" },
      { id: 107, title: "Schlüsselverwaltung am Körper der Partnerin", desc: "Den kleinen Schlüssel an einer Halskette oder am Knöchelband immer bei sich tragen.", r1: "Den Schlüssel stolz am Körper tragen", r2: "Wissen, dass sie den Schlüssel Tag & Nacht hat" },
      { id: 108, title: "Verwahrung im Zeittresor (Kitchen Safe)", desc: "Der Schlüssel liegt in einer Box mit Zeitschloss, die sich erst nach 24, 48 oder 72 Stunden öffnet.", r1: "Die Zeit am Tresor einstellen & verriegeln", r2: "Auf das Ticken des Zeitschlosses vertrauen" },
      { id: 109, title: "Tägliche Hygiene unter Aufsicht", desc: "Einmal am Tag wird der Käfig zum Duschen geöffnet, gereinigt und direkt wieder verschlossen.", r1: "Den Käfig öffnen, waschen & sofort verriegeln", r2: "Dankbar sauber gemacht & wieder verschlossen werden" },
      { id: 110, title: "Keuschheits-Regeln für das Wochenende", desc: "Von Freitagabend bis Montagmorgen bleibt der Käfig ununterbrochen verschlossen.", r1: "Das Wochenende unter Verschluss anordnen", r2: "Das ganze Wochenende eingesperrt verbringen" },
      { id: 111, title: "Spontanes Klopfen an den Käfig im Alltag", desc: "Beim Vorbeigehen kurz mit den Fingerknöcheln gegen das Metall oder Plastik tippen.", r1: "Kurz gegen den Käfig klopfen & lächeln", r2: "Das Klopfen spüren & erröten" },
      { id: 112, title: "Käfig tragen im Beruf & Alltag", desc: "Den Käfig ganz normal unter Jeans oder Anzug bei der Arbeit tragen.", r1: "Wissen, dass er im Büro eingesperrt ist", r2: "Im Büro eingesperrt herumlaufen" },
      { id: 113, title: "Kleine Erektionen im Käfig spüren", desc: "Das Engegefühl spüren, wenn der Körper morgens gegen die Gitter drückt.", r1: "Sehen, wie der Käfig prall ausgefüllt wird", r2: "Die süße Enge spüren & nicht wachsen können" },
      { id: 114, title: "Schlüssel-Worship auf Knien", desc: "Vor dem Öffnen den Schlüssel auf Knien andächtig küssen und um das Aufschließen bitten.", r1: "Den Schlüssel zum Küssen hinhalten", r2: "Auf Knien den Schlüssel küssen & bitten" },
      { id: 115, title: "Keuschheitsgürtel / Käfig tragen", desc: "Abschließen des Genitals zur vollkommenen Orgasmusabgabe.", r1: "Schlüssel verwalten & Käfig prüfen", r2: "Im Käfig eingeschlossen sein" },
      { id: 116, title: "Siegelband oder Minischloss mit Nummer", desc: "Ein nummeriertes Siegel am Verschlussring, das unbefugtes Öffnen sofort zeigt.", r1: "Das Siegel anbringen & Nummer notieren", r2: "Das intakte Siegel morgens vorzeigen" },
      { id: 117, title: "Teasing des Keuschlings (Lust-Erhalt)", desc: "Gezieltes Erregen und Necken durch das Gitter, um hohe Sehnsucht zu erhalten.", r1: "Im Käfig heiß machen & necken", r2: "Im Käfig gequält & erregt werden" },
      { id: 118, title: "Vibrator an die Gitterstäbe halten", desc: "Ein vibrierendes Toy von außen an den Käfig drücken; Vibration überträgt sich.", r1: "Den Vibrator an das Metall halten", r2: "Das Kribbeln durch die Gitterstäbe spüren" },
      { id: 119, title: "Diskreter Schlüssel-Anhänger als Kette", desc: "Den zierlichen Schlüssel als Schmuckanhänger im Alltag um den Hals tragen.", r1: "Den Schlüssel als Schmuckstück tragen", r2: "Ihren Halsschmuck sehen & Bescheid wissen" },
      { id: 120, title: "Lange Keuschheitsphase (Über zwei Wochen)", desc: "Mehrere Wochen am Stück keusch bleiben; der Körper stellt sich ganz auf Führung ein.", r1: "Die mehrwöchige Phase anordnen & begleiten", r2: "Wochenlang keusch leben & Ruhe finden" },
      { id: 121, title: "Spontane Erleichterung ohne Öffnen (Ruiniert)", desc: "Den Partner durch den Käfig zum Höhepunkt bringen, ohne das Schloss abzunehmen.", r1: "Den Orgasmus durch das Gitter erzwingen", r2: "Im Käfig zum Höhepunkt kommen & reinigen" },
      { id: 122, title: "Käfigwechsel zwischen Edelstahl und Plastik", desc: "Je nach Anlass (Sport, Reise, Nacht) zwischen leichtem Harz und schwerem Metall wechseln.", r1: "Das passende Modell für den Tag bestimmen", r2: "Das gewählte Modell anlegen lassen" },
      { id: 123, title: "Nackt vor ihr stehen mit verschlossenem Käfig", desc: "Abends nackt vor der Partnerin stehen und sich mustern lassen.", r1: "Den verschlossenen Partner mustern", r2: "Nackt mit Käfig daliegen oder stehen" },
      { id: 124, title: "Keuschheit als Liebesgeschenk verstehen", desc: "Die Schlüsselabgabe als Vertrauensbeweis und Hingabe erleben.", r1: "Die Hingabe als wertvolles Geschenk annehmen", r2: "Die eigene Lust gerne in ihre Hände legen" },
      { id: 125, title: "Schlüssel an einem geheimen Ort verstecken", desc: "Der Schlüssel liegt in der Wohnung versteckt; nur die Partnerin weiß, wo er ist.", r1: "Das Versteck aussuchen & geheim halten", r2: "Wissen, dass man den Schlüssel nie fände" },
      { id: 126, title: "Öffnen als festliche Zeremonie mit Musik", desc: "Das Aufschließen nach langer Zeit mit Kerzen, Badewanne und Vorfreude zelebrieren.", r1: "Das Aufschließen feierlich inszenieren", r2: "Auf Knien die Erlösung empfangen" },
      { id: 127, title: "Nach dem Aufschließen direkt wieder absperren", desc: "Kurz herauslassen, prüfen, ein paar Minuten streicheln und direkt wieder verriegeln.", r1: "Kurz herauslassen & wieder einsperren", r2: "Die kurze Freiheit spüren & zurück ins Schloss" },
      { id: 128, title: "Spontane Schloss-Inspektion im Alltag", desc: "Unterwegs kurz unter den Stoff greifen und prüfen, ob das Schloss fest sitzt.", r1: "Schloss unterwegs kontrollieren", r2: "Unterwegs geprüft werden" },
      { id: 129, title: "Sicherheit: Der Notfallschlüssel im Umschlag", desc: "Ein Ersatzschlüssel liegt versiegelt bei Freunden oder im Schrank für medizinische Notfälle.", r1: "Den Notfallumschlag sicher verwahren", r2: "Wissen, dass im echten Notfall Hilfe da ist" },
      {
        id: 130, title: "Wie lange Keuschheit kannst du dir vorstellen?", desc: "Deine persönliche zeitliche Wohlfühlgrenze bei Keuschhaltung.", type: "choice",
        question: "Welcher Zeitraum fühlt sich für dich reizvoll an?",
        options: [
          { val: "weekend", label: "🗓️ Nur für ein langes Wochenende (2 bis 3 Tage)" },
          { val: "week", label: "⏳ Ein bis zwei Wochen am Stück" },
          { val: "longterm", label: "🗝️ Langzeit-Keuschheit (Mehrere Wochen bis Monate)" },
          { val: "none", label: "⛔ Käfige oder Keuschheit interessieren mich gar nicht" }
        ]
      }
    ]
  },
  {
    id: 9,
    title: "Garderobe & Lingerie (Frau)",
    desc: "Feine Stoffe, Spitze und Seide: Die visuelle Verführung durch edle Reizwäsche und Korsetts.",
    items: [
      { id: 131, title: "Feine Spitzen-Dessous & Bodys", desc: "Klassische schwarze oder weinrote Spitze, die weibliche Kurven betont.", r1: "Die Spitzenwäsche am Körper bewundern", r2: "Spitzenwäsche tragen & sich begehrt fühlen" },
      { id: 132, title: "Halterlose Strümpfe mit Naht (Stay-Ups)", desc: "Feine Strümpfe mit sichtbarer Rücken-Naht und breitem Spitzenband am Schenkel.", r1: "Über die seidenen Beine streichen", r2: "Die feinen Strümpfe tragen" },
      { id: 133, title: "Klassischer Strapsgürtel mit Metall-Clips", desc: "Ein Strumpfgürtel mit verstellbaren Riemchen, der die Strümpfe straff hält.", r1: "Die Riemchen an den Strümpfen einhaken", r2: "Den Strapsgürtel an der Taille spüren" },
      { id: 134, title: "Ouvert-Höschen (Unten offen)", desc: "Spitzenunterwäsche mit offener Schamzone, die beim Sex anbehalten werden kann.", r1: "Direkt durch den Stoff zugreifen", r2: "Das Ouvert-Höschen tragen & bereit sein" },
      { id: 135, title: "High Heels & Stilettos im Bett", desc: "Hohe Absätze im Bett anbehalten, Beine anwinkeln und Haltung formen.", r1: "Die Beine mit den Absätzen führen", r2: "High Heels im Bett tragen & posieren" },
      { id: 136, title: "Hauchdünnes Seiden-Negligé", desc: "Fließende Maulbeerseide, die sanft über Kurven gleitet und durchscheinend ist.", r1: "Über den fließenden Seidenstoff streicheln", r2: "Im Seidenhemdchen verführt werden" },
      { id: 137, title: "Leder- oder Satin-Harness über der Wäsche", desc: "Feine Riemchen, die Brust und Dekolleté geometrisch einrahmen.", r1: "Das Harness anpassen & bewundern", r2: "Die Riemchen am Oberkörper tragen" },
      { id: 138, title: "Echtschnür-Korsett mit Stahlstäben", desc: "Ein festes Taillenkorsett, das eng geschnürt wird und aufrechte Haltung formt.", r1: "Das Korsett fest am Rücken schnüren", r2: "Geschnürt werden & die feste Haltung spüren" },
      { id: 139, title: "Feinstrumpfhose zerschneiden beim Sex", desc: "Mit einer Schere behutsam den Schritt der Strumpfhose öffnen, während sie getragen wird.", r1: "Den Stoff mit der Schere vorsichtig öffnen", r2: "Stillhalten, während der Stoff geschnitten wird" },
      { id: 140, title: "Gemeinsames Einkaufen von Reizwäsche", desc: "Zusammen ein Wäschegeschäft besuchen und Stücke für den Abend auswählen.", r1: "Die Wäsche mit aussuchen & bezahlen", r2: "Anprobieren & vor dem Spiegel präsentieren" },
      { id: 141, title: "Garderoben-Diktat durch den Partner", desc: "Der Partner wählt morgens aus, welche Unterwäsche heute getragen wird.", r1: "Die Wäsche für den Tag herauslegen", r2: "Die gewählte Wäsche tragen & daran denken" },
      { id: 142, title: "Nass-Optik & Wet-Look Wäsche", desc: "Glänzende schwarze Stoffe, die wie nass auf der Haut wirken.", r1: "Die glänzende Wet-Look-Optik mustern", r2: "Im Wet-Look-Body verführen" },
      { id: 143, title: "Morgenmantel aus reiner Seide", desc: "Ein weiter Kimono oder Seidenmantel, der nur mit einem Gürtel locker gebunden ist.", r1: "Den Gürtel des Mantels langsam lösen", r2: "Den Mantel fallen lassen & nackt sein" },
      { id: 144, title: "Rote Sohlen & Luxus-Schuhe", desc: "Elegante Pumps, die im Schlafzimmer feierlich getragen werden.", r1: "Die Schuhe bewundern & ausziehen", r2: "Die Schuhe andächtig tragen" },
      {
        id: 145, title: "Welcher Wäsche-Stil gefällt dir an ihr am besten?", desc: "Deine persönliche Lieblings-Richtung bei Damen-Dessous.", type: "choice",
        question: "Welche Art von Lingerie findest du am reizvollsten?",
        options: [
          { val: "lace", label: "🌸 Edle, romantische Spitze & Seide" },
          { val: "straps", label: "👠 Feste Strapsen, Ouvert-Slips & High Heels" },
          { val: "corset", label: "⏳ Streng geschnürtes Echtschnür-Korsett" },
          { val: "leather_wet", label: "🖤 Schwarzes Leder, Wet-Look & Riemchen-Harness" }
        ]
      }
    ]
  },
  {
    id: 10,
    title: "Fetischbekleidung & Rollen-Accessoires (Mann)",
    desc: "Maskuline Akzente: Sportliche Jockstraps, feine Maßanzüge und Lederjeans.",
    items: [
      { id: 146, title: "Sportlicher Jockstrap (Po frei)", desc: "Klassischer Sport-Jockstrap, der stützt und das Gesäß komplett freigibt.", r1: "Den Mann im Jockstrap bewundern & Po greifen", r2: "Den Jockstrap tragen & Po präsentieren" },
      { id: 147, title: "Leder-Brustgeschirr (Chest Harness)", desc: "Schwarze Lederriemen über Schultern und Brust, die den Oberkörper betonen.", r1: "Das Geschirr am Mann anpassen & greifen", r2: "Das Ledergeschirr auf nackter Haut tragen" },
      { id: 148, title: "Eleganter Maßanzug mit Krawatte", desc: "Dunkler Anzug, weißes Hemd und Krawatte beim Vorspiel; stilvolle Eleganz.", r1: "Den Mann im Anzug verführen", r2: "Im Maßanzug auftreten & dominieren" },
      { id: 149, title: "Nackt mit Krawatte oder Fliege servieren", desc: "Der Mann serviert Getränke nackt, trägt dabei aber förmlich Kragen und Krawatte.", r1: "Sich vom nackten Mann mit Krawatte bedienen lassen", r2: "Nackt mit Krawatte das Tablett tragen" },
      { id: 150, title: "Breite Leder-Armmanschetten am Handgelenk", desc: "Schwere Lederarmbänder mit Schnallen, die die Handgelenke fest einrahmen.", r1: "Die Armmanschetten am Mann bewundern", r2: "Die schweren Manschetten an den Armen spüren" },
      { id: 151, title: "Enges Leder- oder Silikon-Hodenband", desc: "Ein Riemen, der die Hoden sanft nach unten zieht und das Glied hervorhebt.", r1: "Das Band um die Hoden legen", r2: "Das Hodenband tragen & die Schwere spüren" },
      { id: 152, title: "Schwere Biker-Lederjeans ohne Unterwäsche", desc: "Echte Lederhose auf nackter Haut, die beim Gehen knarzt und griffig sitzt.", r1: "Über das feste Leder der Hose streichen", r2: "Die Lederhose nackt darunter tragen" },
      { id: 153, title: "CFNM (Clothed Female, Naked Male)", desc: "Die Frau bleibt vollständig bekleidet, während der Mann nackt dient oder gehorcht.", r1: "Voll bekleidet den nackten Mann führen", r2: "Als nackter Mann vor der bekleideten Frau stehen" },
      { id: 154, title: "Maskuline Posing Pouch / Tanga", desc: "Knapper Mikrofaser-String, der den Blick direkt auf die Konturen lenkt.", r1: "Den Mann im knappen String mustern", r2: "Den String selbstbewusst vorführen" },
      { id: 155, title: "Schwere Edelstahl-Kette um den Hals", desc: "Eine dicke Gliederkette aus Edelstahl, die kühl auf der Männerbrust liegt.", r1: "An der Kette sanft heranziehen", r2: "Die schwere Metallkette am Hals tragen" },
      { id: 156, title: "Krawatte als provisorische Augenbinde nutzen", desc: "Die Seidenkrawatte des Mannes abnehmen und damit die Augen verbinden.", r1: "Die Krawatte als Bindung nutzen", r2: "Mit der Seidenkrawatte verbunden werden" },
      { id: 157, title: "Hochgerollte Hemdsärmel & Armbanduhr", desc: "Klassischer Look: Ärmel bis zum Ellbogen gekrempelt, markante Uhr am Gelenk.", r1: "Die Unterarme des Mannes ansehen & greifen", r2: "Den maskulinen Look bewusst tragen" },
      { id: 158, title: "Vollständige Körperrasur beim Mann", desc: "Brust, Achseln und Intimbereich vollkommen haarlos für maximalen Hautkontakt.", r1: "Über die glatte, rasierte Männerhaut streichen", r2: "Sich für die Partnerin glattrasieren" },
      { id: 159, title: "Lederstiefel zum nackten Körper", desc: "Der Mann trägt nur schwere Stiefel und ist ansonsten vollständig nackt.", r1: "Den nackten Mann in Stiefeln mustern", r2: "Nackt in Stiefeln im Raum stehen" },
      {
        id: 160, title: "Welcher Stil gefällt dir am Mann am besten?", desc: "Deine persönliche Vorliebe für maskuline Erotikbekleidung.", type: "choice",
        question: "In welchem Outfit findest du den Mann am anziehendsten?",
        options: [
          { val: "suit", label: "👔 Eleganter Maßanzug mit Krawatte (Gentleman / Boss)" },
          { val: "sporty", label: "🩲 Sportlicher Jockstrap & durchtrainierter Körper" },
          { val: "leather", label: "🖤 Biker-Lederjeans, Harness & schwere Stiefel" },
          { val: "cfnm", label: "👑 Vollkommen nackt dienend (während sie bekleidet ist)" }
        ]
      }
    ]
  },
  {
    id: 11,
    title: "Leder, Lack, Latex & Gummi",
    desc: "Glanz, Duft und die zweite Haut: Faszinierende Materialien, die eng anliegen.",
    items: [
      { id: 161, title: "Enge schwarze Lack-Leggings", desc: "Hochglänzende Leggings, die bei jeder Bewegung das Licht reflektieren.", r1: "Über den glatten Lackstoff streichen", r2: "Die glänzende Lackhose tragen" },
      { id: 162, title: "Echter Rindsleder-Duft im Raum", desc: "Der unverwechselbare, herbe Duft von geöltem Echtleder bei Fesseln oder Hosen.", r1: "Den Lederduft am Partner einatmen", r2: "In Leder gehüllt sein & duften" },
      { id: 163, title: "Latex-Catsuit als zweite Haut", desc: "Ein hautenger Ganzkörperanzug, der den Körper wie eine Schicht umschließt.", r1: "Den Latex-Catsuit am Partner bewundern", r2: "Im engen Latex-Catsuit stecken & schwitzen" },
      { id: 164, title: "Lange Latex-Handschuhe bis zum Ellbogen", desc: "Glänzende Gummihandschuhe, mit denen der Körper glatt berührt wird.", r1: "Mit den Latexhandschuhen sanft abtasten", r2: "Das kühle Gummi der Handschuhe auf der Haut spüren" },
      { id: 165, title: "Latex mit Silikonöl auf Hochglanz polieren", desc: "Das gemeinsame Einreiben des Anzugs mit Polieröl für maximalen Spiegeleffekt.", r1: "Den Partner mit Polituröl glänzend einreiben", r2: "Eingerieben werden & spiegelglatt dastehen" },
      { id: 166, title: "Overknee-Stiefel aus glänzendem Lack", desc: "Sehr hohe Stiefel, die über das Knie bis zur Mitte des Oberschenkels reichen.", r1: "Die langen Lackbeine liebkosen", r2: "Die Overknee-Stiefel tragen & Haltung zeigen" },
      { id: 167, title: "Latex-Haube mit Zopföffnung (Hood)", desc: "Eine enge Gummimaske, die Mund und Augen frei lässt.", r1: "Die Latexhaube am Partner anpassen", r2: "In der Haube stecken & Geräusche gedämpft hören" },
      { id: 168, title: "Schwere Lederjacke auf nackter Haut", desc: "Eine weiche, schwere Lederjacke ohne Unterwäsche tragen; kühl und warm zugleich.", r1: "Die Hand unter die Lederjacke schieben", r2: "Die schwere Jacke auf nackter Haut spüren" },
      { id: 169, title: "Neopren-Wäsche (Glatt & isolierend)", desc: "Enges Neopren, das elastisch sitzt und Körperwärme speichert.", r1: "Über das samtige Neopren streichen", r2: "Im warmen Neopren schwitzen & spüren" },
      { id: 170, title: "Enganliegende Lederkleidung im Bett", desc: "In Lederhose oder Leder-Top ins Bett gehen und sich aneinander reiben.", r1: "Das knarzende Leder im Bett umarmen", r2: "In Leder gehüllt im Bett liegen" },
      { id: 171, title: "Latex-Strümpfe mit Strumpfhaltern", desc: "Gummistrümpfe, die mit festen Haltern am Bund befestigt werden.", r1: "Die glänzenden Gummibeine streicheln", r2: "Die Latexstrümpfe tragen" },
      { id: 172, title: "Gummi-Geruch als Erregungs-Trigger", desc: "Der Duft von frischem Latex löst sofort Lust und Kopfkino aus.", r1: "Den Gummigeruch genießen & erregt werden", r2: "Wissen, wie der Duft wirkt" },
      { id: 173, title: "Duschen im vollständigen Latex-Outfit", desc: "Im Latexanzug unter die Dusche steigen; das Wasser perlt glatt am Gummi ab.", r1: "Das Wasser über den Gummi-Körper laufen lassen", r2: "Im Anzug unter dem Wasserstrahl stehen" },
      { id: 174, title: "Materialkontraste: Seide auf rauem Leder", desc: "Ein zartes Seidentuch über eine feste Lederhose gleiten lassen.", r1: "Den Kontrast der Stoffe führen", r2: "Die unterschiedlichen Schichten auf der Haut spüren" },
      { id: 175, title: "Latex-Slip mit aufblasbarem Kissen", desc: "Ein Höschen mit kleiner Handpumpe, das den Schritt sanft ausfüllt.", r1: "Die Pumpe bedienen & Druck dosieren", r2: "Den wachsenden Druck im Schritt spüren" },
      { id: 176, title: "Knisternde Vinyl- & PVC-Röcke", desc: "Kurze Röcke aus PVC, die beim Gehen hörbar rascheln.", r1: "Das Rascheln des Rocks hören & druntergreifen", r2: "Im PVC-Rock herumlaufen" },
      { id: 177, title: "Leder-Korsage mit Metallschnallen", desc: "Festes Leder um die Taille, mit Schnallen verschlossen statt geschnürt.", r1: "Die Schnallen schließen & festziehen", r2: "In der Lederkorsage aufrecht verharren" },
      { id: 178, title: "Gummibandage um Arme oder Beine wickeln", desc: "Elastische Latexbänder fest um Beine wickeln wie eine dichte Hülle.", r1: "Mit dem Gummiband präzise wickeln", r2: "In der Gummibandage eingewickelt daliegen" },
      { id: 179, title: "Latex-Handschuhe beim Oralverkehr", desc: "Mit glatten Gummifingern den Intimbereich berühren, während Lippen lieben.", r1: "Mit den Handschuhen streicheln & lecken", r2: "Das glatte Gummi an den Schamlippen spüren" },
      {
        id: 180, title: "Welches Glanz-Material spricht dich am meisten an?", desc: "Deine persönliche Haltung zu Lack, Leder und Latex.", type: "choice",
        question: "Welches dieser Materialien findest du am erotischsten?",
        options: [
          { val: "leather", label: "🖤 Echtes Rindsleder (Der Duft, die Schwere, die Griffigkeit)" },
          { val: "latex", label: "✨ Glänzendes Latex (Die glatte zweite Haut & das Engegefühl)" },
          { val: "patent", label: "👠 Hochglänzender Lack (Leggings, Overknees, High Heels)" },
          { val: "none", label: "⛔ Ich mag Stoffe wie Baumwolle und Seide viel lieber" }
        ]
      }
    ]
  },
  {
    id: 12,
    title: "Körperfetische, Haare, Füße & Taktilität",
    desc: "Liebe zu bestimmten Körperpartien: Haare bürsten, Fußpflege und Hände verwöhnen.",
    items: [
      { id: 181, title: "Haare bürsten mit Naturborsten", desc: "Den Partner vor sich setzen und die Haare langsam mit langen Strichen bürsten.", r1: "Geduldig & liebevoll die Haare bürsten", r2: "Die Bürste auf der Kopfhaut spüren & entspannen" },
      { id: 182, title: "Bartpflege & Kraulen beim Mann", desc: "Mit Fingerspitzen durch den Bart fahren, Bartöl einmassieren und Wangen halten.", r1: "Den Bart kraulen & pflegen", r2: "Die Hände im Bart genießen" },
      { id: 183, title: "Haare flechten & Zöpfe binden", desc: "Dem Partner die Haare zu Zöpfen flechten oder straff nach hinten binden.", r1: "Die Haare kunstvoll flechten & binden", r2: "Sich die Haare frisieren lassen" },
      { id: 184, title: "Fußmassage mit duftender Creme", desc: "Müde Füße mit den Daumen kneten, Fersen lockern und wärmen.", r1: "Die Füße des Partners kräftig massieren", r2: "Die Fußmassage selig genießen" },
      { id: 185, title: "Zehen ablecken & küssen (Foot Worship)", desc: "Jeden einzelnen Zeh mit Lippen und Zungenspitze andächtig liebkosen.", r1: "Die Zehen des Partners ablecken & küssen", r2: "Die Zunge an den Zehen empfangen" },
      { id: 186, title: "Fuß auf die Brust des Partners legen", desc: "Den nackten Fuß auf die Brust legen als Zeichen der Hingabe.", r1: "Den Fuß auflegen & spüren lassen", r2: "Das angenehme Gewicht des Fußes spüren" },
      { id: 187, title: "Lackierte Fußnägel bewundern", desc: "Frisch rot oder schwarz lackierte Fußnägel betrachten, streicheln und küssen.", r1: "Die lackierten Nägel mustern & liebkosen", r2: "Die lackierten Füße präsentieren" },
      { id: 188, title: "Hand-Worship (Jeden Finger einzeln küssen)", desc: "Die Hand des Partners nehmen und Finger für Finger langsam küssen.", r1: "Die Finger andächtig küssen & saugen", r2: "Die Zärtlichkeit an den Fingern genießen" },
      { id: 189, title: "Sanftes Kitzeln der Fußsohlen mit Federn", desc: "Die Füße fixieren und mit einer Feder behutsam über empfindliche Sohlen streichen.", r1: "Mit der Feder über die Sohlen streichen", r2: "Das Kribbeln an den Sohlen ertragen" },
      { id: 190, title: "Körpergeruch & ehrlicher Schweißduft", desc: "Den natürlichen Duft von Hals, Nacken oder Achseln nach Sport gern einatmen.", r1: "Den natürlichen Körperduft tief einatmen", r2: "Sich unbesorgt beschnuppern lassen" },
      { id: 191, title: "Narben & Dehnungsstreifen liebkosen", desc: "Alte Narben andächtig mit den Lippen nachfahren und annehmen.", r1: "Die Narben des Partners küssen & wertschätzen", r2: "Die Zärtlichkeit an den eigenen Narben spüren" },
      { id: 192, title: "Körperbutter von Kopf bis Fuß einmassieren", desc: "Reichhaltige Sheabutter auf Armen, Beinen und Po verteilen, bis alles seidig glänzt.", r1: "Den Partner andächtig einbalsamieren", r2: "Ganz weich gepflegt daliegen" },
      { id: 193, title: "Schöne, lange Fingernägel am Körper spüren", desc: "Die lackierten Nägel langsam über Rücken oder Brustkorb gleiten lassen.", r1: "Mit den langen Nägeln Reizlinien ziehen", r2: "Die Nägel auf der Haut spüren" },
      { id: 194, title: "Auf die Knie gehen & Schuhe putzen", desc: "Dem Partner auf Knien die Schuhe oder Stiefel polieren als liebevoller Dienst.", r1: "Sich die Schuhe auf Knien putzen lassen", r2: "Die Schuhe andächtig säubern & polieren" },
      { id: 195, title: "Ohrmuscheln ablecken & anknabbern", desc: "Die Zungenspitze ganz sanft in die Ohrmuschel führen und am Läppchen saugen.", r1: "Die Ohren sanft mit der Zunge liebkosen", r2: "Das Kribbeln am Ohr genießen" },
      { id: 196, title: "Augenbrauen streicheln zum Einschlafen", desc: "Gleichmäßig über die Augenbrauen streichen, bis die Lider zufallen.", r1: "Über die Augenbrauen streichen", r2: "Mit den Fingerstrichen friedlich einschlafen" },
      {
        id: 197, title: "Welcher Körperteil fasziniert dich am meisten?", desc: "Deine persönliche Vorliebe abseits der Intimzonen.", type: "choice",
        question: "Welche Körperpartie findest du besonders reizvoll?",
        options: [
          { val: "feet", label: "🦶 Füße, Zehen & Fußsohlen (Massagen, Küsse, Worship)" },
          { val: "hair", label: "💇 Haare & Kopfhaut (Bürsten, Kraulen, Flechten)" },
          { val: "hands", label: "🤲 Hände & Handgelenke (Hand-Worship, zarte Finger)" },
          { val: "neck_back", label: "💆 Nacken, Schultern & Wirbelsäule" }
        ]
      }
    ]
  },
  {
    id: 13,
    title: "Halsbänder, Leinen & Shibari-Seilkunst",
    desc: "Das Symbol der Zusammengehörigkeit und die Ästhetik des Bindens: Weiches Leder und Naturseile.",
    items: [
      { id: 198, title: "Lederhalsband mit D-Ring & Leine", desc: "Tragen eines weichen Lederhalsbands als Symbol; Führen an der Lederleine im Raum.", r1: "Halsband & Leine führen", r2: "Halsband & Leine tragen" },
      { id: 199, title: "Diskretes Tageshalsband (Day-Collar)", desc: "Ein unauffälliges Lederbändchen oder ein Silberring als Kette im Alltag.", r1: "Den Anhänger feierlich anlegen & schenken", r2: "Den Schmuck im Alltag tragen & Bescheid wissen" },
      { id: 200, title: "Führung an der kurzen Leine auf Knien", desc: "Den Partner an der kurzen Lederleine behutsam neben sich durch das Zimmer führen.", r1: "Die Leine ruhig & bestimmt führen", r2: "Auf Knien an der Leine folgen" },
      { id: 201, title: "Halsband mit weicher Fellfütterung", desc: "Ein breites Halsband, das innen mit Lammfell gefüttert ist und nicht scheuert.", r1: "Das bequeme Halsband anlegen", r2: "Die weiche Polsterung am Hals spüren" },
      { id: 202, title: "Leine führen am Gürtel befestigt", desc: "Die Leine des Partners am eigenen Gürtel einklinken; der Partner folgt bei jedem Schritt.", r1: "Die Leine am Gürtel tragen & führen", r2: "Mit der Leine verbunden folgen" },
      { id: 203, title: "Handgelenke vor dem Körper fesseln (Klett/Leder)", desc: "Die Hände vorne mit weichen Klett- oder Lederfesseln zusammenbinden.", r1: "Die Handgelenke vorne sanft fixieren", r2: "Die Hände vorne gebunden daliegen haben" },
      { id: 204, title: "Hände hinter dem Rücken fixieren", desc: "Die Arme hinter den Rücken führen und Manschetten anlegen; die Brust tritt hervor.", r1: "Die Arme hinter dem Rücken schließen", r2: "Wehrlos mit Händen am Rücken verharren" },
      { id: 205, title: "Knöchel aneinander fesseln", desc: "Die Füße zusammenbinden, sodass nur noch kleine Schritte möglich sind.", r1: "Die Knöchel zusammenbinden & führen", r2: "Mit gebundenen Füßen vorsichtig gehen" },
      { id: 206, title: "Vier-Punkt-Fesselung am Bett", desc: "Beide Handgelenke und beide Knöchel mit weichen Bändern an den vier Bettecken befestigen.", r1: "Die vier Punkte am Bett arretieren", r2: "Auf dem Bett ausgebreitet & sicher liegen" },
      { id: 207, title: "Frottier- oder Klettfesseln für den Anfang", desc: "Weiche Textilbänder ohne Schloss, die sich mit einem Zug sofort lösen lassen.", r1: "Die Klettfesseln anbringen & lösen", r2: "Die Sicherheit der Klettfesseln genießen" },
      { id: 208, title: "Echte Jute- oder Hanfseile (Shibari)", desc: "Geölte Naturfaserseile aus Jute, die griffig sitzen und nach Bienenwachs duften.", r1: "Mit den geölten Juteseilen kunstvoll binden", r2: "Das griffige Naturseil auf der Haut spüren" },
      { id: 209, title: "Leder-Armbinder (Monohandschuh)", desc: "Schnüren der Arme hinter dem Rücken in einer Lederhülle zur vollkommenen Starre.", r1: "Armbinder schnüren", r2: "Im Armbinder arretiert sein" },
      { id: 210, title: "Oberkörper-Geschirr knüpfen (Harness)", desc: "Seile kunstvoll über Brust, Schultern und Taille weben, die das Dekolleté betonen.", r1: "Das Seilgeschirr am Körper knüpfen", r2: "Das Geflecht der Seile tragen" },
      { id: 211, title: "Takate Kote (Klassische Armbox)", desc: "Traditionelle Bindung der Oberarme hinter dem Rücken mit Seilführung über die Brust.", r1: "Das Takate Kote ruhig & sicher binden", r2: "Im Takate Kote verharren & in Trance gleiten" },
      { id: 212, title: "Knie-Ellbogen-Fesselung (Frogtie)", desc: "In Bauchlage gebeugte Beine an den Handgelenken befestigen wie ein entspannter Frosch.", r1: "Den Partner im Frogtie binden", r2: "Gekrümmt & unbeweglich daliegen" },
      { id: 213, title: "Aufhängung am Deckenhaken (Suspension)", desc: "Den Körper mit geprüften Seilen und Ringen teilweise oder ganz in die Luft heben.", r1: "Die Aufhängung sicher aufbauen & leiten", r2: "Schwerelos in den Seilen schweben" },
      { id: 214, title: "Bodenfesselung (Floorwork)", desc: "Gefesselt ganz nah am Boden auf weichen Matten liegen; ruhige Bodenarbeit.", r1: "Den Partner am Boden leiten & streicheln", r2: "Ganz flach am Boden im Seil ruhen" },
      { id: 215, title: "Seildruck an sensiblen Akupressurpunkten", desc: "Knoten so platzieren, dass sie wohligen Druck auf Rücken- und Schultermuskeln ausüben.", r1: "Die Knoten auf die Druckpunkte setzen", r2: "Die wohltuende Tiefenentspannung spüren" },
      { id: 216, title: "Kopfbewegung mit Hals-Seil leiten", desc: "Ein dünnes Seil vom Halsband zur Hand führen, um Blickrichtung sanft zu dirigieren.", r1: "Den Kopf mit sanftem Seilzug leiten", r2: "Dem leichten Zug bereitwillig folgen" },
      { id: 217, title: "Shibari (Japanische Seilkunst / Mormai)", desc: "Ästhetisches Knüpfen von Mustern mit geölten Juteseilen für tiefes Abgleiten in den Subspace.", r1: "Als Rigger kunstvoll binden", r2: "Im Seil verharren & Subspace spüren" },
      { id: 218, title: "Seilschneider liegt immer griffbereit", desc: "Ein spezieller Sicherheits-Kappschneider liegt bei jeder Session offen auf dem Nachttisch.", r1: "Den Schneider vorab bereitlegen", r2: "Wissen, dass man in Sekunden frei ist" },
      { id: 219, title: "Finger- & Durchblutungs-Check alle 10 Minuten", desc: "Regelmäßiges Prüfen: Das Blut muss nach Druck sofort zurückkehren, Hände bleiben warm.", r1: "Die Hände geduldig prüfen & fühlen", r2: "Die Hände kontrollieren lassen" },
      { id: 220, title: "Körperliches Loslassen im Seil (Subspace)", desc: "Muskeln fallen lassen, Augen schließen und das Gefühl von vollkommenem Gehaltensein spüren.", r1: "Den Partner im Seil halten & wiegen", r2: "Alle Kontrolle an das Seil abgeben" },
      { id: 221, title: "Gemeinsames Aufwickeln der Seile danach", desc: "Nach dem Entfesseln Seile zusammen aufschießen und den Abend ruhig ausklingen lassen.", r1: "Die Seile ordentlich aufwickeln", r2: "Beim Aufwickeln zuschauen & Tee trinken" },
      { id: 222, title: "Seilmuster mit Smartphone fotografieren", desc: "Die kunstvollen Knoten und das Muster auf der Haut als Foto für das private Album festhalten.", r1: "Das kunstvolle Muster fotografieren", r2: "Im Seil für das Foto posieren" },
      {
        id: 223, title: "Welche Art von Fesseln gefällt dir am besten?", desc: "Deine persönliche Vorliebe bei Bindungen.", type: "choice",
        question: "Welches Material findest du an Händen & Körper am schönsten?",
        options: [
          { val: "shibari", label: "🪢 Natürliche Juteseile & Shibari-Muster (Ästhetik & Trance)" },
          { val: "leather", label: "🖤 Weiche Lederfesseln mit Schnallen & Klett" },
          { val: "chain", label: "⛓️ Kühle Metallhandschellen & Ketten" },
          { val: "none", label: "⛔ Ich mag es überhaupt nicht, festgebunden zu sein" }
        ]
      }
    ]
  },
  {
    id: 14,
    title: "BDSM-Möbel & Fixierungen",
    desc: "Stabile Möbel und Vorrichtungen: Pranger, Andreaskreuz, Kniebänke und bequeme Halterungen.",
    items: [
      { id: 224, title: "Hand-Hals-Pranger (Pillory)", desc: "Kopf und Hände in einen gepolsterten Pranger legen; aufrechte, unbewegliche Haltung.", r1: "Den Pranger schließen & vorführen", r2: "Im Pranger verharren & stillhalten" },
      { id: 225, title: "Bequeme Kniebank mit Kissen", desc: "Eine weich gepolsterte Bank, auf der man ohne Schmerzen lange vor dem Partner knien kann.", r1: "Den Partner auf die Kniebank bitten", r2: "Bequem gepolstert knien & warten" },
      { id: 226, title: "Wandösen mit Schnappkarabinern", desc: "Stabile Haken in der Wand, an denen Fesseln mit einem Klick befestigt werden.", r1: "Die Karabiner an der Wand einklinken", r2: "An der Wand fixiert verharren" },
      { id: 227, title: "Spanking-Bock (Vorbeuge-Bank)", desc: "Eine Lederbank, über die man sich nach vorne beugt; das Becken liegt erhöht.", r1: "Den Partner über den Bock legen", r2: "Über der Bank gebeugt daliegen" },
      { id: 228, title: "Andreaskreuz an der Wand", desc: "Ein X-förmiges Kreuz, an dem Hände und Füße weit geöffnet fixiert werden.", r1: "Am Kreuz fixieren & mustern", r2: "Ausgebreitet am Kreuz stehen" },
      { id: 229, title: "Spreizstangen an den Knöcheln", desc: "Eine feste Stange hält die Beine offen; sie können nicht geschlossen werden.", r1: "Die Spreizstange anbringen", r2: "Mit geöffneten Beinen arretiert sein" },
      { id: 230, title: "BDSM-Liebesschaukel (Sling)", desc: "Eine breite Lederschaukel an der Decke; der Körper schwebt schwerelos.", r1: "Den Partner in die Schaukel betten", r2: "Schwerelos in der Schaukel empfangen" },
      { id: 231, title: "Käfig oder Gitterbox im Raum", desc: "Eine stilvolle Metallbox mit weichen Decken, in die man sich zurückziehen kann.", r1: "Die Gittertür schließen & Schlüssel behalten", r2: "Im Käfig zur Ruhe kommen & warten" },
      { id: 232, title: "Stuhl-Fixierung mit Riemen", desc: "Auf einem Holzstuhl sitzen, Arme und Beine an Lehnen und Beine geschnallt.", r1: "Am Stuhl festschnallen & leiten", r2: "Auf dem Stuhl fixiert zusehen" },
      { id: 233, title: "Keilkissen fürs Becken (Sex-Wedge)", desc: "Ein festes Schaumstoffkissen, das das Becken anhebt für besseren Zugang.", r1: "Das Kissen unterlegen & führen", r2: "Erhöht liegen & entspannen" },
      { id: 234, title: "Bett-Gurt-System unter der Matratze", desc: "Gurte unter der Matratze mit Schlaufen an allen vier Ecken.", r1: "Die Handschellen an den Gurten festklicken", r2: "Am Bett fixiert daliegen" },
      { id: 235, title: "Stabile Griffe am Kopfende des Betts", desc: "Griffe am Bettrahmen, an denen sich der Partner festhalten kann.", r1: "Die Hände an den Griffen fixieren", r2: "Sich an den Griffen festhalten" },
      { id: 236, title: "Polsterung aller Kanten vor der Session", desc: "Feste Regel: Niemals Druckstellen durch harte Kanten – Decken sind Pflicht.", r1: "Kissen und Handtücher sorgsam unterlegen", r2: "Bequem und schmerzfrei gebettet sein" },
      { id: 237, title: "Verstellbare Höhen beim Spanking-Bock", desc: "Die Liegehöhe exakt anpassen, damit beide Partner entspannt agieren können.", r1: "Die Höhe für den perfekten Schlagwinkel einstellen", r2: "Entspannt auf passender Höhe liegen" },
      { id: 238, title: "Aufrechte Haltung am Türrahmen", desc: "Die Hände mit Riemen oben am Türrahmen befestigen; aufrecht stehen und empfangen.", r1: "Am Türrahmen fixieren & herantreten", r2: "Im Durchgang stehend verharren" },
      { id: 239, title: "Gemeinsames Aufbauen & Testen der Möbel", desc: "Vor der Session Schrauben und Haken gemeinsam prüfen auf volle Stabilität.", r1: "Die Stabilität aufmerksam testen", r2: "Sicher sein, dass alles bombenfest hält" },
      {
        id: 240, title: "Welches BDSM-Möbelstück findest du am interessantesten?", desc: "Deine persönliche Haltung zu Vorrichtungen im Zimmer.", type: "choice",
        question: "Welches Möbelstück reizt dich am ehesten?",
        options: [
          { val: "pillory", label: "🪵 Hand-Hals-Pranger (Aufrechte, feste Präsentation)" },
          { val: "bench", label: "🛋️ Bequeme Spanking-Bank mit Beckenerhöhung" },
          { val: "sling", label: "🕊️ Liebesschaukel an der Decke (Schwerelose Leichtigkeit)" },
          { val: "none", label: "⛔ Reines normales Bett reicht mir vollkommen aus" }
        ]
      }
    ]
  },
  {
    id: 15,
    title: "Masken, Augenbinden & Sinnesentzug",
    desc: "Ausschalten visueller oder auditiver Reize: Leder-Augenbinden, Kopfhörer und Stille.",
    items: [
      { id: 241, title: "Leder-Augenbinde (Blinder Gehorsam)", desc: "Blickdichtes Verbinden der Augen, sodass jede Berührung unerwartet erlebt wird.", r1: "Augenbinde anlegen & lenken", r2: "Blind vertrauen & empfangen" },
      { id: 242, title: "Weicher Seidenschal über den Augen", desc: "Ein federleichtes Tuch um den Kopf binden; dunkel, aber sanft und nicht einengend.", r1: "Den Seidenschal sanft knoten", r2: "Unter der weichen Seide abtauchen" },
      { id: 243, title: "Schlafbrille mit weicher Kontur", desc: "Bequeme Schaumstoff-Schlafmaske, die absolut kein Licht durchlässt.", r1: "Die Maske aufsetzen & Dunkelheit schaffen", r2: "In völliger Dunkelheit lauschen" },
      { id: 244, title: "Zenith Hood (Vollmaske ohne Gesichtsöffnung)", desc: "Eine geschlossene Haube ohne Öffnung für Augen oder Mund.", r1: "Die Haube anlegen (Hard-Limit-Test)", r2: "Total isoliert in der Haube stecken (No-Go-Grenze)" },
      { id: 245, title: "Silikon-Ballknebel (Ball Gag)", desc: "Ein weicher Silikonball mit Atemlöchern zwischen den Zähnen, der lautes Sprechen hemmt.", r1: "Den Ballknebel anlegen & festschnallen", r2: "Den Knebel tragen & nur stöhnen können" },
      { id: 246, title: "Offener Ringknebel (Ring Gag)", desc: "Ein Metall- oder Gummiring, der den Mund offen hält für Sichtkontakt.", r1: "Den Ringknebel einsetzen & Mund mustern", r2: "Mit geöffnetem Mund arretiert sein" },
      { id: 247, title: "Tuchknebel (Stofftuch zwischen den Zähnen)", desc: "Ein weiches Baumwolltuch fest zwischen die Zähne binden.", r1: "Das Tuch sanft zwischen die Zähne binden", r2: "In das weiche Tuch beißen" },
      { id: 248, title: "Knebel mit Speichelfaden-Auffangung", desc: "Ein Handtuch unterlegen und Speichel behutsam abtupfen beim Tragen.", r1: "Aufmerksam den Speichel abtupfen", r2: "Wissen, dass man gepflegt wird" },
      { id: 249, title: "Nicht sprechen dürfen vor dem Öffnen", desc: "Nach Abnahme des Knebels noch 5 Minuten stillhalten, bevor geredet werden darf.", r1: "Die Stille nach dem Knebeln einfordern", r2: "Stumm den Kiefer entspannen" },
      { id: 250, title: "Kopfmassage bei verbundenen Augen", desc: "Nichts sehen können, während warme Hände langsam die Kopfhaut massieren.", r1: "Den blinden Partner am Kopf massieren", r2: "Blind die Hände am Kopf spüren" },
      { id: 251, title: "Unerwartete Berührungsorte im Dunkeln", desc: "Plötzlich berührt ein warmer Finger die Kniekehle oder den Nacken.", r1: "Unerwartete Reizpunkte setzen", r2: "Erschauern, wo die nächste Hand landet" },
      { id: 252, title: "Geschmacks-Rätsel mit verbundenen Augen", desc: "Honig, Zitrone oder Schokolade blind mit der Zunge kosten und erraten.", r1: "Leckereien blind anreichen", r2: "Mit geschlossenen Augen schmecken" },
      { id: 253, title: "Geruchs-Rätsel im Dunkeln", desc: "An Kaffee, Leder oder Parfüm riechen lassen, während man blind ist.", r1: "Düfte vor die Nase halten", r2: "Mit verbundenen Augen riechen" },
      { id: 254, title: "Eiswürfel blind auf die Haut setzen", desc: "Überraschend einen schmelzenden Eiswürfel an Bauchnabel oder Schenkel halten.", r1: "Das Eis überraschend auflegen", r2: "Den plötzlichen Kältekick blind spüren" },
      { id: 255, title: "Warmer Föhnwind auf nackter Haut", desc: "Den blinden Partner mit warmer Föhnluft an Bauch und Rücken streicheln.", r1: "Den warmen Föhnwind führen", r2: "Den warmen Luftstrom blind genießen" },
      { id: 256, title: "Flüstern von allen Seiten im Dunkeln", desc: "Um den blinden Partner herumgehen und abwechselnd ins linke und rechte Ohr hauchen.", r1: "Um den Partner herumgehen & flüstern", r2: "Lauschen, von welcher Seite die Stimme kommt" },
      { id: 257, title: "Noise-Cancelling-Kopfhörer (Schallisolierung)", desc: "Ausblenden aller Umgebungsgeräusche; Eintauchen in absolute innere Stille.", r1: "Musik/Stille steuern", r2: "Akustisch isoliert sein" },
      { id: 258, title: "Kopfhörer mit binauralen Beats / Entspannung", desc: "Ruhige Frequenzen auf die Kopfhörer legen, die in tiefe Trance leiten.", r1: "Die Klangreise starten & begleiten", r2: "Mit den Klängen tief abtauchen" },
      { id: 259, title: "Handdrück-Signal bei Knebel oder Kopfhörer", desc: "2x Drücken = Alles super; Hand lässt los = Sofortige Unterbrechung.", r1: "Ständig die Hand des Partners halten", r2: "Mit der Hand das Sicherheitssignal geben" },
      { id: 260, title: "Totaler Sinnesentzug (Blind & Taub)", desc: "Augenbinde, Kopfhörer und fixierte Hände für ultimative sensorische Hingabe.", r1: "Reize dosieren & führen", r2: "Ausgeliefert abtauchen" },
      {
        id: 261, title: "Welche Form von Sinnesentzug gefällt dir am besten?", desc: "Deine persönliche Haltung zu Blindheit und Stille.", type: "choice",
        question: "Was schaltet deinen Kopf am besten ab?",
        options: [
          { val: "blindfold", label: "🙈 Nur eine weiche Leder- oder Seiden-Augenbinde" },
          { val: "headphones", label: "🎧 Kopfhörer mit Stille oder Trance-Klängen" },
          { val: "total", label: "🌌 Totaler Sinnesentzug (Blind, taub & gefesselt)" },
          { val: "none", label: "⛔ Ich möchte immer genau sehen und hören, was geschieht" }
        ]
      }
    ]
  },
  {
    id: 16,
    title: "Impact Play (Schlagintimität & Spanking)",
    desc: "Gezielter Schmerzreiz als emotionales Ventil, Wärmeerzeugung und Katharsis: Hände, Paddles und Flogger.",
    items: [
      { id: 262, title: "Warmes Handspanking auf das nackte Gesäß", desc: "Rhythmische Schläge mit flacher Hand zur Erwärmung des Gewebes.", r1: "Handspanking dosiert anwenden", r2: "Schläge mit Hand empfangen" },
      { id: 263, title: "Spanking über die Knie gelegt (Over the Knee)", desc: "Quer über den Oberschenkeln des Partners liegen; geborgen und ausgeliefert.", r1: "Den Partner über die Knie legen & halten", r2: "Über den Knien liegen & versohlt werden" },
      { id: 264, title: "Leder-Paddle (Flächig & dumpf)", desc: "Breites Lederpaddle für dumpfe, nicht-spitze Reizübertragung ohne Narben.", r1: "Paddle führen", r2: "Hiebe mit Paddle empfangen" },
      { id: 265, title: "Wildleder-Flogger (Viele sanfte Riemen)", desc: "Ein Flogger mit 40 weichen Riemen, der wie ein warmer Schauer auf den Po trifft.", r1: "Den Flogger rhythmisch schwingen", r2: "Das Prasseln der Flogger-Riemen spüren" },
      { id: 266, title: "Langsames Steigern der Schlagintensität", desc: "Sanft beginnen und Kraft kontinuierlich steigern, damit sich die Haut gewöhnt.", r1: "Die Intensität behutsam aufbauen", r2: "Spüren, wie die Haut warm wird" },
      { id: 267, title: "Mitzählen der Schläge durch den Partner", desc: "Nach jedem Hieb laut mitzählen: 'Danke, Nummer Eins', 'Danke, Nummer Zwei'.", r1: "Auf das laute Mitzählen achten", r2: "Die Hiebe laut und andächtig mitzählen" },
      { id: 268, title: "Flache Hand auf den heißen Po legen (Kühlen)", desc: "Nach einer Serie von Schlägen die kühle Handfläche ruhig auf die Haut legen.", r1: "Die Hand ruhig auf die Rötung legen", r2: "Die kühlende Hand auf dem heißen Po spüren" },
      { id: 269, title: "Spanking auf die Oberschenkel", desc: "Gezielte Schläge mit der Hand auf die Außenseite oder Rückseite der Schenkel.", r1: "Die Schenkel mit Schlägen erwärmen", r2: "Die Schläge auf den Oberschenkeln spüren" },
      { id: 270, title: "Leichtes Kläschen auf die Wange (Face Slap)", desc: "Sehr dosierter, flacher Schlag mit Fingern auf die Wange als Dominanzgeste.", r1: "Den kontrollierten Wangenstreich setzen", r2: "Die kleine Ohrfeige annehmen & Haltung wahren" },
      { id: 271, title: "Tränen zulassen beim Schmerz (Katharsis)", desc: "Wenn Tränen der Anspannung fließen, weinen dürfen, während der Partner weitermacht.", r1: "Die Tränen sehen & liebevoll weiterleiten", r2: "Die Tränen laufen lassen & Ballast abwerfen" },
      { id: 272, title: "Schwere Schläge mit festem Lederriemen", desc: "Ein gefalteter Ledergürtel, der mit sattem Klatschen auf Muskeln trifft.", r1: "Den Riemen mit ruhiger Kraft schwingen", r2: "Die Wucht des Lederriemens aushalten" },
      { id: 273, title: "Holz-Paddle mit Atemlöchern", desc: "Ein poliertes Holzbrettchen, das durch Löcher weniger Luftwiderstand hat.", r1: "Das Holzpaddle präzise anwenden", r2: "Den knackigen Holztreffer spüren" },
      { id: 274, title: "Pferdehaar-Peitsche (Sanfter Reiz)", desc: "Feine Rosshaare, die wie ein stechender Windhauch über die Haut streifen.", r1: "Das Pferdehaar über den Rücken ziehen", r2: "Das feine Brennen auf der Haut spüren" },
      { id: 275, title: "Reitgerte / Cane (Spitzer, scharfer Schmerz)", desc: "Präzise gesetzte Hiebe auf Gesäß; fordert Disziplin und Treffsicherheit.", r1: "Gerte/Cane führen", r2: "Scharfen Schmerz aushalten" },
      { id: 276, title: "Schläge auf die Fußsohlen (Bastinado-Leicht)", desc: "Mäßige Schläge mit einem weichen Lederband auf die nackten Fußsohlen.", r1: "Die Fußsohlen behutsam versohlen", r2: "Das Brennen auf den Sohlen ertragen" },
      { id: 277, title: "Eiswürfel auf die geschlagene Haut legen", desc: "Schmelzendes Eis über die glühende Haut streichen; Feuer und Eis vereint.", r1: "Das Eis über den roten Po gleiten lassen", r2: "Die erlösende Kälte auf dem Feuer spüren" },
      { id: 278, title: "Eincremen mit Arnika-Balsam nach dem Spiel", desc: "Die strapazierte Haut nach der Session mit beruhigender Creme einreiben.", r1: "Den Po sanft einbalsamieren & pflegen", r2: "Die sanfte Pflege nach dem Schmerz genießen" },
      { id: 279, title: "Strikte Tabu-Zonen beim Schlagen", desc: "Niemals auf Nieren, Wirbelsäule, Gelenke oder Hals schlagen – nur Fleischpartien.", r1: "Ausschließlich auf Gesäß & Muskeln zielen", r2: "Sicher sein, dass die Knochen geschont werden" },
      { id: 280, title: "Küsse auf jede getroffene Stelle danach", desc: "Jede gerötete Stelle am Ende mit einem andächtigen Kuss segnen.", r1: "Den Po mit liebevollen Küssen bedecken", r2: "Jeden Kuss auf der warmen Haut spüren" },
      { id: 281, title: "Schlagpause bei Erschöpfung", desc: "Beim kleinsten Zögern oder bei Gelb sofort 2 Minuten Pause einlegen.", r1: "Aufmerksam den Atem des Partners prüfen", r2: "Die Pause ohne Rechtfertigung annehmen" },
      { id: 282, title: "Schläge zur sexuellen Erregung nutzen", desc: "Die Durchblutung am Po nutzen, um direkt danach von hinten einzudringen.", r1: "Vom Spanking direkt zum Lieben übergehen", r2: "Mit heißem Po empfangen & lieben" },
      { id: 283, title: "Schlagen nur aus ruhiger Autorität (Keine Wut)", desc: "Niemals aus echtem Zorn schlagen; der aktive Part bleibt gelassen.", r1: "Die absolute innere Ruhe beim Schlag wahren", r2: "Wissen, dass keine böse Absicht im Raum ist" },
      { id: 284, title: "Rötungs-Grenze vorher absprechen", desc: "Vorher vereinbaren, wie rot die Haut werden darf: Rosé oder tiefes Rot.", r1: "Die vereinbarte Farb-Grenze strikt einhalten", r2: "Die Härtegrenze vorher klar abstecken" },
      { id: 285, title: "Die befreiende Umarmung nach dem Spanking", desc: "Sobald der letzte Schlag verklungen ist, sofort fest in den Arm nehmen.", r1: "Den Partner an die Brust ziehen & wiegen", r2: "Erschöpft im Arm versinken & ankommen" },
      { id: 286, title: "Breathplay bis zur Bewusstlosigkeit (Edge-Play Tabu)", desc: "Den Hals zudrücken bis zur Bewusstlosigkeit.", r1: "Hals zudrücken bis Ohnmacht (Tabu-Test)", r2: "Bewusstlos gewürgt werden (Absolutes No-Go)" }
    ]
  },
  {
    id: 17,
    title: "CBT, Hoden- & Genitalreize",
    desc: "Gezielte Reizung von Penis und Hoden: Hodenringe, Gewichte, Klammern und Dehnen.",
    items: [
      { id: 287, title: "Hoden sanft in der Hand wiegen", desc: "Die Hoden mit warmen Händen umfassen, leicht kneten und das Gewicht spüren.", r1: "Die Hoden in der Hand wiegen & liebkosen", r2: "Die warme Hand an den Hoden genießen" },
      { id: 288, title: "Edelstahl-Hodenring (Schwere & Dehnung)", desc: "Ein polierter Metallring, der über die Hoden gestreift wird und nach unten zieht.", r1: "Den Hodenring anlegen & das Gewicht prüfen", r2: "Den schweren Ring tragen & Dehnung spüren" },
      { id: 289, title: "Lederband zum Abbinden der Hoden", desc: "Ein Lederriemen mit Schnalle, der die Hoden von der Peniswurzel trennt.", r1: "Den Riemen um die Hoden festziehen", r2: "Die pralle Ausdehnung der Hoden spüren" },
      { id: 290, title: "Sanfte Klatscher auf die Hoden mit Fingern", desc: "Dosierte Klapser mit den Fingerspitzen auf den Hodensack.", r1: "Mit den Fingern dosiert an die Hoden tippen", r2: "Das Ziehen im Bauchraum spüren & aushalten" },
      { id: 291, title: "Wäscheklammern an den Brustwarzen des Mannes", desc: "Holzklammern an die Nippel setzen und nach 5 Minuten mit einem Ruck abziehen.", r1: "Die Klammern setzen & abziehen", r2: "Den Klammerdruck & den Abreiß-Kick ertragen" },
      { id: 292, title: "Kleeblattklemmen mit kleinen Gewichten", desc: "Verstellbare Klemmen, an die kleine Metallgewichte gehängt werden.", r1: "Die Gewichte anbringen & Zug kontrollieren", r2: "Den kontinuierlichen Zug an den Nippeln spüren" },
      { id: 293, title: "Eiswürfel auf Hoden & Eichel gleiten lassen", desc: "Den schmelzenden Eiswürfel langsam über den Hodensack ziehen.", r1: "Das Eis über Hoden & Glied führen", r2: "Das intensive Zusammenziehen bei Kälte spüren" },
      { id: 294, title: "Tragegeschirr für die Hoden (Ball Harness)", desc: "Ein Ledergeschirr, das die Hoden einzeln einrahmt und an Ort und Stelle hält.", r1: "Das Hoden-Harness anlegen & mustern", r2: "Das Tragegeschirr am Gemächt tragen" },
      { id: 295, title: "Vibrations-Ei am Damm (Perineum)", desc: "Ein kleines Vibro-Toy fest gegen die Brücke zwischen Hoden und After pressen.", r1: "Das Toy am Damm anlegen & steuern", r2: "Die tiefe innere Vibration empfangen" },
      { id: 296, title: "Forderndes Ziehen an den Hoden nach unten", desc: "Mit den Fingern beide Hoden greifen und mit mäßiger Kraft nach unten dehnen.", r1: "Die Hoden greifen & sanft nach unten dehnen", r2: "Das Dehnungsgefühl im Becken aushalten" },
      { id: 297, title: "Penisfesselung am Oberschenkel", desc: "Den Penis mit einem weichen Riemen eng am Oberschenkel festbinden.", r1: "Den Penis am Schenkel festbinden", r2: "Fixiert am Oberschenkel daliegen" },
      { id: 298, title: "Kitzeln der Hoden mit Borstenpinsel", desc: "Nach dem Druck die Haut der Hoden mit einem Rasierpinsel sanft kitzeln.", r1: "Mit dem Pinsel über die Hoden streichen", r2: "Das feine Kitzeln nach dem Druck genießen" },
      { id: 299, title: "Strikte Grenze: Keine Schläge mit harten Gegenständen", desc: "Hoden sind empfindlich – Schläge mit Holzlatten oder Schuhen sind tabu.", r1: "Die absolute Schutzgrenze für Hoden achten", r2: "Sicher sein, dass keine Verletzungen drohen" },
      { id: 300, title: "Handmassage der Hoden nach der Reizung", desc: "Die strapazierten Hoden nach der Session mit warmem Öl beruhigen.", r1: "Die Hoden wärmen & sanft massieren", r2: "Die wohltuende Entlastung spüren" },
      { id: 301, title: "Abbinden der Peniswurzel beim Liebesspiel", desc: "Ein Cockring um den Schaft legen; die Erektion wird härter und praller.", r1: "Den Cockring anlegen & prüfen", r2: "Die stramme Härte im Glied spüren" },
      {
        id: 302, title: "Welche Hoden-Reize findest du vertretbar?", desc: "Deine persönliche Schmerz- und Lustgrenze bei CBT.", type: "choice",
        question: "Wie weit darf die Reizung der Hoden gehen?",
        options: [
          { val: "gentle", label: "🌸 Nur zärtliches Wiegen, Kneten & schwere Edelstahlringe" },
          { val: "clamps", label: "⛓️ Auch Klammern, Gewichte & leichtes Ziehen erwünscht" },
          { val: "none", label: "⛔ An die Hoden lasse ich nur sanfte Hände und den Mund" }
        ]
      }
    ]
  },
  {
    id: 18,
    title: "Primal Play, Ringen & Bratting",
    desc: "Instinkt und Jagdtrieb: Balgen auf der Matte, Kräftemessen und liebevolles Bändigen.",
    items: [
      { id: 303, title: "Primal Wrestling (Matten-Ringen)", desc: "Echtes Ringen auf dem Boden; Kräftemessen ohne Schläge bis zur Kapitulation.", r1: "Partner niederringen & bändigen", r2: "Kämpfen, fliehen & kapitulieren" },
      { id: 304, title: "Die Jagd (Chase Play im Haus)", desc: "Flucht durch die Wohnung; der Partner verfolgt die Beute, stellt und packt sie.", r1: "Beute erjagen & packen", r2: "Fliehen & erbeutet werden" },
      { id: 305, title: "Hände auf die Matte pinnen", desc: "Beide Handgelenke auf den Boden drücken und sich voll auf den Partner legen.", r1: "Die Handgelenke am Boden fixieren", r2: "Am Boden festgehalten daliegen & zappeln" },
      { id: 306, title: "Nackenbisse beim Raufen (Love Bites)", desc: "Mitten im Balgen beherzt, aber ohne Verletzung in Nacken oder Schulter beißen.", r1: "In Nacken & Schulter zubeißen", r2: "Den festen Biss spüren & knurren" },
      { id: 307, title: "Scruffing (Fester Griff in den Nacken)", desc: "Den Partner fest im Nacken greifen wie eine Raubkatze ihr Junges.", r1: "Im Nacken packen & beruhigen", r2: "Den Nackengriff spüren & stillhalten" },
      { id: 308, title: "Kitzeln als Waffe beim Niederringen", desc: "Mit gezieltem Kitzeln an den Rippen zum Lachen und Aufgeben bringen.", r1: "Unerbittlich kitzeln bis zum Abklopfen", r2: "Wehrlos lachen & um Gnade betteln" },
      { id: 309, title: "Abklopfen als Kapitulation (Tap Out)", desc: "Zweimaliges Klopfen beendet den Kampf sofort; der Sieger lässt locker.", r1: "Sofort loslassen beim Abklopfen", r2: "Abklopfen & die erlösende Niederlage spüren" },
      { id: 310, title: "Kräftemessen Hände-in-Hände", desc: "Die Finger verschränken und die Arme des Partners mit reiner Kraft niederdrücken.", r1: "Die Hände mit Kraft zu Boden drücken", r2: "Dagegenhalten bis die Kraft nachlässt" },
      { id: 311, title: "Bratting (Absichtliches Frechsein & Testen)", desc: "Schelmisches Provozieren oder freche Sprüche, um Zurechtweisung herauszufordern.", r1: "Provokationen bändigen & strafen", r2: "Frech provozieren & Grenzen testen" },
      { id: 312, title: "Zunge rausstrecken & wegrennen", desc: "Den Partner schelmisch necken, Zunge rausstrecken und ins Schlafzimmer flitzen.", r1: "Den Frechdachs jagen & schnappen", r2: "Wegflitzen & gefangen werden wollen" },
      { id: 313, title: "Brat Taming (Körperliches Bändigen)", desc: "Den frechen Partner packen, festhalten und bändigen, bis er kichert und nachgibt.", r1: "Den Partner fest in den Arm schließen & zähmen", r2: "Zappeln bis man liebevoll gebändigt ist" },
      { id: 314, title: "Auf den Rücken springen (Piggyback-Attack)", desc: "Den Partner überraschend von hinten anspringen und umwerfen.", r1: "Den Partner abschütteln oder tragen", r2: "Auf den Rücken springen & festhalten" },
      { id: 315, title: "Knurren & Schnauben beim Kampf", desc: "Instinktive Tierlaute beim Balgen austauschen; ganz ohne Worte.", r1: "Den Partner fordernd anknurren", r2: "Knurren, fauchen & sich wehren" },
      { id: 316, title: "Auspowern bis zum Keuchen", desc: "Vollkommen verausgaben, bis beide verschwitzt auf der Matte liegen.", r1: "Den Kampf bis zur Erschöpfung führen", r2: "Vollkommen ausgepowert daliegen" },
      { id: 317, title: "Kuschel-Überfall nach dem Ringen", desc: "Nach dem Kampf sich auf den Partner werfen und mit Küssen eindecken.", r1: "Den Bezwungenen mit Küssen eindecken", r2: "Unter dem Partner liegen & geküsst werden" },
      {
        id: 318, title: "Welche Art von Kräftemessen magst du?", desc: "Deine persönliche Haltung zu Ringen, Jagen und Frechsein.", type: "choice",
        question: "Wie spielerisch darf es zwischen euch zugehen?",
        options: [
          { val: "primal", label: "🐾 Echtes Ringen, Beißen & Balgen auf der Matte" },
          { val: "brat", label: "😜 Freches Necken (Bratting) & liebevolles Bändigen" },
          { val: "calm", label: "🧘 Lieber ruhige, andächtige Erotik ohne Kämpfen" },
          { val: "none", label: "⛔ Ringen oder Raufen empfinde ich eher als Stress" }
        ]
      }
    ]
  }
]);
window.surveyChapters = (window.surveyChapters || []).concat([
  {
    id: 19,
    title: "Caregiver, DDLG & Geborgenheit (Nurturing)",
    desc: "Zur Ruhe kommen und beschützt werden: Einschlafrituale und bedingungslose Zuwendung.",
    items: [
      { id: 319, title: "Heißer Tee oder Milch vor dem Einschlafen", desc: "Ein wärmendes Getränk ans Bett bringen, zudecken und für die Nacht fertig machen.", r1: "Dem Partner ein warmes Getränk bringen & ihn umsorgen", r2: "Im Bett umsorgt werden & das Getränk genießen" },
      { id: 320, title: "Gute-Nacht-Rituale & Vorlesen im Bett", desc: "Den Partner in Kissen betten, Licht dimmen und mit ruhiger Stimme aus einem Buch vorlesen.", r1: "Dem Partner im Bett mit sanfter Stimme vorlesen", r2: "Eingekuschelt der Stimme lauschen & einschlafen" },
      { id: 321, title: "Kopfkraulen bis zum Einschlafen", desc: "Sanftes Streicheln über Schläfen und Haaransatz, bis die Lider zufallen.", r1: "Geduldig den Kopf kraulen, bis der Partner schläft", r2: "Mit Kraulen auf der Kopfhaut geborgen wegdösen" },
      { id: 322, title: "Im Arm wiegen & Trösten (Nurturing)", desc: "Nach harten Tagen fest an die Brust drücken, hin und her wiegen und allen Stress abwaschen.", r1: "Den Partner trösten, fest im Arm halten & wiegen", r2: "Sich im Arm klein machen, festhalten & wiegen lassen" },
      { id: 323, title: "Tränen trocknen & Sorgen abgeben", desc: "Wenn Erschöpfung kommt, ausweinen dürfen, ohne sich erklären zu müssen.", r1: "Liebevoll die Tränen abtupfen & Schutz bieten", r2: "Die Last loslassen & die Tränen laufen lassen" },
      { id: 324, title: "Flauschige Decken & Kuscheltiere", desc: "Im Bett mit Decken ein Kuschelnest bauen, in dem die Welt draußen bleibt.", r1: "Das Kuschelnest für den Partner herrichten", r2: "Im Deckenberg versinken & Geborgenheit spüren" },
      { id: 325, title: "Einschlaf-Umarmung (Große Beschützer-Hülle)", desc: "Den gesamten Körper des Partners von hinten umschließen wie ein wärmender Schutzschild.", r1: "Als schützende Hülle den Partner umschlingen", r2: "Ganz umhüllt werden & das Schutzgefühl spüren" }
    ]
  },
  {
    id: 20,
    title: "Free-Use, Schlaf-Sex & Spontane Verfügbarkeit",
    desc: "Das Vertrauen, jederzeit berührt werden zu dürfen: Ohne langes Fragen, mitten in der Nacht oder beim Dösen.",
    items: [
      { id: 326, title: "Free-Use im Schlafzimmer (Jederzeit zugänglich)", desc: "Wer im Bett liegt, darf jederzeit ohne vorheriges Bitten intim berührt werden.", r1: "Sich den Partner ohne Vorwarnung nehmen dürfen", r2: "Verfügbar daliegen & Berührungen geschehen lassen" },
      { id: 327, title: "Schlaf-Sex (Im Dösen verführt werden)", desc: "Am frühen Morgen durch sanftes Streicheln oder Eindringen geweckt werden.", r1: "Den schlafenden Partner behutsam wecken & verführen", r2: "Im Halbschlaf berührt & langsam wach geküsst werden" },
      { id: 328, title: "Kissen unters Becken schieben beim Dösen", desc: "Der ruhende Partner wird sanft gedreht und das Becken erhöht.", r1: "Das Kissen unterlegen & von hinten ran", r2: "Erhöht liegenbleiben & geduldig empfangen" },
      { id: 329, title: "Kleidung beiseite schieben ohne Aufwachen", desc: "Ganz leise den Schlafanzug beiseiteschieben, ohne den dösenden Partner aufzuregen.", r1: "Ganz vorsichtig die Kleidung zur Seite schieben", r2: "Liegenbleiben & spüren, wie die Haut frei wird" },
      { id: 330, title: "Halbwaches Weiterschlafen während des Sex", desc: "Nicht aktiv bewegen müssen, sondern entspannt daliegen, während der Partner genießt.", r1: "Den entspannten Körper des Partners genießen", r2: "Passiv daliegen, weiterdösen & geschehen lassen" },
      { id: 331, title: "Morgenlatte im Halbschlaf ausnutzen", desc: "Die morgendliche Erektion direkt im Halbschlaf für spontanen Sex nutzen.", r1: "Den Partner morgens direkt im Bett besteigen", r2: "Aufwachen & spüren, dass man bereits benutzt wird" },
      {
        id: 332, title: "Sicherheitssignal bei Free-Use", desc: "Wie signalisiert ihr, wenn Free-Use ausnahmsweise unerwünscht ist?", type: "choice",
        question: "Wie regelt ihr die Grenze, wenn jemand wirklich nur tief schlafen möchte?",
        options: [
          { val: "token", label: "🪨 Kleiner Gegenstand (z. B. rotes Band am Nachttisch) = Heute bitte nicht" },
          { val: "word", label: "💬 Ein kurzes 'Heute nur schlafen' reicht völlig aus" },
          { val: "always_open", label: "🌟 Bei uns gilt: Immer und ohne jede Ausnahme erlaubt" },
          { val: "tabu", label: "⛔ Berührungen im Schlaf sind für mich generell tabu" }
        ]
      },
      { id: 333, title: "Spontaner Zugriff am Schreibtisch", desc: "Während der Partner am PC sitzt, von hinten herantreten und Hände wandern lassen.", r1: "Am Schreibtisch von hinten überraschen & zugreifen", r2: "Am Schreibtisch sitzen & sich anfassen lassen" },
      { id: 334, title: "Auf dem Sofa zum Ausruhen bedienen", desc: "Beim Fernsehen die Hand in die Hose schieben, ohne den Blick vom Film zu nehmen.", r1: "Ganz beiläufig auf dem Sofa berühren & bedienen", r2: "Auf der Couch liegen & die Hände empfangen" },
      { id: 335, title: "Nackt zum Lesen oder Fernsehen bereitliegen", desc: "Nackt auf dem Bett liegen und für jede Berührung zur Verfügung stehen.", r1: "Den Partner bereitliegen lassen & spontan zugreifen", r2: "Nackt daliegen & abwarten, wann die Hand kommt" }
    ]
  },
  {
    id: 21,
    title: "Dominanz, Führung & Praise Play",
    desc: "Führung durch Wärme und Autorität: Sich in starke Hände fallen lassen und echtes Lob empfangen.",
    items: [
      { id: 336, title: "Ruhige, tiefe Anweisungsstimme", desc: "Mit gelassener, unverrückbarer Stimme sagen, was getan werden soll – verbindlich und klar.", r1: "Mit fester, ruhiger Stimme klare Ansagen machen", r2: "Der tiefen Stimme lauschen & ihr bereitwillig folgen" },
      { id: 337, title: "Kinn anheben beim Reden (Augenkontakt einfordern)", desc: "Zwei Finger sanft unter das Kinn legen, Kopf heben und Blickkontakt verlangen.", r1: "Das Kinn anheben & tief in die Augen schauen", r2: "Das Kinn anheben lassen & dem Blick standhalten" },
      { id: 338, title: "Hand auf den Kopf legen (Bestätigung & Ruhe)", desc: "Die Handfläche auf den Scheitel des Partners legen als Geste von Schutz und Halt.", r1: "Die Hand ruhig auf den Kopf des Partners legen", r2: "Die warme Hand auf dem Scheitel spüren & loslassen" },
      { id: 339, title: "Praise Play & Verbale Bestätigung", desc: "Den Partner mit warmen Worten loben ('Gutes Mädchen', 'Braver Junge', 'Wundervoll gemacht').", r1: "Mit warmen, stolzen Worten ehrlich loben", r2: "Das warme Lob hören & tief im Herzen aufblühen" },
      { id: 340, title: "Streicheln über die Wange nach Gehorsam", desc: "Mit dem Handrücken sanft über die Wange streichen als stille Anerkennung.", r1: "Über die Wange streichen & Anerkennung zeigen", r2: "Die Belohnung an der Wange genießen" },
      { id: 341, title: "Vulgäre verbale Demütigung (Herabwürdigung)", desc: "Nutzung beleidigender Schimpfwörter oder bewusste Herabsetzung.", r1: "Harte Schimpfwörter im Bett benutzen", r2: "Mit harten Schimpfwörtern belegt werden" },
      { id: 342, title: "Liebevolle Zurechtweisung mit dem Finger", desc: "Mit dem Zeigefinger leicht gegen die Nasenspitze tippen, wenn der Partner vorlaut war.", r1: "Den Partner mit dem Finger sanft zurechtweisen", r2: "Die kleine Ermahnung mit einem Schmunzeln annehmen" },
      { id: 343, title: "Befehl zum Ausatmen & Entspannen", desc: "Mit der Hand auf der Brust befehlen, tief auszuatmen und Muskeln fallen zu lassen.", r1: "Das Ausatmen und Loslassen bestimmt vorgeben", r2: "Auf das Kommando hin tief ausatmen & entspannen" },
      { id: 344, title: "Hand am Hals als Führungssymbol (Grounding)", desc: "Die Handfläche ganz ruhig flach an den Hals legen – ohne Zudrücken, nur für Halt.", r1: "Die Hand ruhig an den Hals legen & führen", r2: "Die schützende Hand am Hals spüren & ergeben sein" },
      { id: 345, title: "Belohnungs-Kuss auf die Stirn", desc: "Ein andächtiger Kuss auf die Stirn nach intensiver Zeit als Zeichen von Verbundenheit.", r1: "Den Stirnkuss voller Zuneigung schenken", r2: "Den Kuss auf der Stirn empfangen & durchatmen" },
      { id: 346, title: "Entscheidungen im Alltag abgeben", desc: "Der führende Part entscheidet über Essen oder Kleidung, damit der Kopf frei wird.", r1: "Souverän die Entscheidungen für den Abend treffen", r2: "Die Verantwortung abgeben & sich führen lassen" },
      {
        id: 347, title: "Umgang mit Strenge im Alltag", desc: "Wie viel dominante Führung wünschst du dir abseits des Schlafzimmers?", type: "choice",
        question: "In welchem Rahmen wünschst du dir Führung im Alltag?",
        options: [
          { val: "bedroom_only", label: "🛏️ Reine Schlafzimmer-Sache – im Alltag sind wir 100 % gleichberechtigt" },
          { val: "subtle", label: "✨ Kleine geheime Rituale und Blicke im Alltag erwünscht" },
          { val: "protocol", label: "👑 Feste Rollenverteilung auch bei Haushalt und Entscheidungen" }
        ]
      },
      { id: 348, title: "Vorstellung vor Freunden oder Bekannten", desc: "Ganz normale Höflichkeit nach außen; niemand merkt etwas von der Dynamik.", r1: "Den Partner nach außen hin vollkommen beschützen", r2: "Wissen, dass unsere Rollen unser privates Geheimnis bleiben" },
      { id: 349, title: "Demütige Dankbarkeit für Zuwendung", desc: "Ein leises, ehrliches 'Danke' flüstern, wenn man berührt oder erlöst wurde.", r1: "Das leise Danke entgegennehmen & lächeln", r2: "Sich von Herzen für die Berührung bedanken" },
      { id: 350, title: "Gemeinsames Nachgespräch über Führung (De-Briefing)", desc: "Ruhig besprechen, was sich gut angefühlt hat und wo der Ton zu hart war.", r1: "Offen nachfragen, wie die Führung angekommen ist", r2: "Ehrlich Feedback geben, was gutgetan hat" }
    ]
  },
  {
    id: 22,
    title: "Sklavenpositionen, Dienen & Formale Haltung",
    desc: "Körperliche Demut und Dienerschaft: Auf Knien verharren und Getränke servieren.",
    items: [
      { id: 351, title: "Aufrechtes Knien neben dem Sessel (Nadu)", desc: "Auf einer Decke mit geradem Rücken und Händen auf den Schenkeln knien.", r1: "Den Partner neben dem Sessel knien lassen", r2: "Aufrecht knien, zur Ruhe kommen & warten" },
      { id: 352, title: "Servieren auf Knien (Getränke & Speisen)", desc: "Wasser oder Snacks auf einem kleinen Tablett auf Knien herantragen.", r1: "Sich auf Knien bedienen lassen & annehmen", r2: "Auf Knien herantreten & andächtig servieren" },
      { id: 353, title: "Schuhe & Socken ausziehen als Ritual", desc: "Nach der Arbeit dem Partner die Schuhe abstreifen und Füße wärmen.", r1: "Die Füße hinhalten & sich die Schuhe ausziehen lassen", r2: "Dem Partner auf Knien die Schuhe ausziehen" },
      { id: 354, title: "Blick zu Boden senken bei Vorbeigehen", desc: "Wenn der Partner vorbeigeht, den Kopf neigen und erst auf Ansprache hochsehen.", r1: "Den geneigten Kopf wahrnehmen & ansprechen", r2: "Den Blick respektvoll senken, wenn er/sie vorbeigeht" },
      { id: 355, title: "Dienen als Fußbank (Footstool / Human Furniture)", desc: "Auf allen Vieren liegen, während der Partner die Füße sanft auf dem Po ablegt.", r1: "Die Füße auf dem Partner ablegen & ausruhen", r2: "Als bequeme Fußbank reglos am Boden verharren" },
      { id: 356, title: "Kopf auf den Schoß des Partners legen", desc: "Auf den Boden setzen und den Kopf auf die Oberschenkel des sitzenden Partners betten.", r1: "Die Hand im Haar des Partners auf dem Schoß ruhen lassen", r2: "Den Kopf auf seinem/ihrem Schoß ablegen & genießen" },
      { id: 357, title: "Kleidung für den Tag herauslegen", desc: "Der dienende Part bügelt und richtet die Kleidung des Partners für morgen her.", r1: "Die zurechtgelegte Kleidung anziehen & nicken", r2: "Die Kleidung mit Sorgfalt auswählen & bügeln" },
      { id: 358, title: "Formelle Begrüßung an der Wohnungstür", desc: "An der Tür auf Knien warten und dem Partner die Tasche abnehmen.", r1: "An der Tür empfangen werden & Tasche übergeben", r2: "An der Tür warten & den Partner willkommen heißen" },
      { id: 359, title: "Geduldiges Warten im Vorraum", desc: "Ruhig und ohne Smartphone im Nebenzimmer warten, bis man gerufen wird.", r1: "Den Partner warten lassen & dann rufen", r2: "Geduldig verharren & die Vorfreude spüren" },
      { id: 360, title: "Rücken eincremen nach dem Duschen", desc: "Den Partner nach dem Bad mit Lotion langsam von Kopf bis Fuß einreiben.", r1: "Sich andächtig den Rücken eincremen lassen", r2: "Den Partner mit warmen Händen einbalsamieren" },
      { id: 361, title: "Kissen richten & Decke aufschütteln", desc: "Das Bett für die Nacht vorbereiten und Decke einladend aufschlagen.", r1: "In das gemachte Bett steigen & Danke sagen", r2: "Das Bett sorgfältig für den Partner bereiten" },
      { id: 362, title: "Stumme Dienstbereitschaft im Raum", desc: "Ganz leise im Zimmer ein Buch lesen und aufspringen, wenn der Partner etwas braucht.", r1: "Die stille Anwesenheit genießen & Wünsche äußern", r2: "Aufmerksam im Hintergrund bereitstehen" },
      { id: 363, title: "Bequeme Polsterung beim Knien", desc: "Niemand muss auf hartem Boden knien – weiche Kniebank oder Kissen sind Pflicht.", r1: "Darauf achten, dass der Partner immer weich kniet", r2: "Die Knie schonen & auf Kissen knien" },
      { id: 364, title: "Dienst als Liebesbeweis empfinden", desc: "Das Bedienen des Partners als pure, erfüllende Liebesgeste erleben.", r1: "Den Dienst als tiefes Geschenk annehmen", r2: "Mit Freude und Hingabe für den Partner da sein" },
      {
        id: 365, title: "Wie weit darf Dienerschaft für dich gehen?", desc: "Deine persönliche Haltung zu Kniehaltungen und Diensten im Alltag.", type: "choice",
        question: "Welche Art von Dienst bereitet dir die größte Freude?",
        options: [
          { val: "practical", label: "☕ Praktische Verwöhn-Dienste (Getränke bringen, Schuhe ausziehen, Kochen)" },
          { val: "formal", label: "👑 Formale Haltungen (Knien am Sessel, Nadu, Warten auf Kommando)" },
          { val: "playful", label: "✨ Nur ab und zu als kleines Spiel im Schlafzimmer" },
          { val: "none", label: "⛔ Ich möchte weder dienen noch bedient werden" }
        ]
      }
    ]
  },
  {
    id: 23,
    title: "Zucht, Hausregeln & Disziplin-Protokolle",
    desc: "Liebevolle Ordnung: Feste Regeln, kleine Strafen bei Frechheiten und Versöhnung.",
    items: [
      { id: 366, title: "Gemeinsam vereinbarte Hausregeln", desc: "Eine Liste von 3 bis 5 festen Regeln, die beide unterschrieben haben.", r1: "Die Regeln festlegen & auf Einhaltung achten", r2: "Die Regeln kennen & sich gerne daran halten" },
      { id: 367, title: "Regelverstöße ehrlich selbst beichten", desc: "Einen Fehler unaufgefordert eingestehen und zum Partner gehen.", r1: "Die Beichte ruhig anhören & Konsequenz bestimmen", r2: "Den Fehler ehrlich eingestehen & auf Strafe warten" },
      { id: 368, title: "Strafzeilen schreiben mit Füller & Papier", desc: "Einen vorgegebenen Satz 20- oder 50-mal sauber in ein Notizheft schreiben.", r1: "Den Strafsatz vorgeben & die Handschrift prüfen", r2: "Die Zeilen andächtig und konzentriert schreiben" },
      { id: 369, title: "In der Ecke stehen zur Besinnung (Corner Time)", desc: "Für 10 Minuten mit dem Gesicht zur Wand still in der Zimmerecke nachdenken.", r1: "Den Partner zur Besinnung in die Ecke schicken", r2: "In der Ecke stehen, ruhig werden & nachdenken" },
      { id: 370, title: "Smartphone- & Medienverbot für den Abend", desc: "Nach einer Frechheit das Handy abgeben; der Abend gehört Buch und Partner.", r1: "Das Smartphone einkassieren & verwahren", r2: "Das Handy abgeben & die digitale Ruhe spüren" },
      { id: 371, title: "Knien vor dem Partner zur Abbitte", desc: "Sich vor den Partner knien, Hände auf seine Knie legen und um Verzeihung bitten.", r1: "Die Bitte anhören & die Verzeihung gewähren", r2: "Demütig um Entschuldigung bitten" },
      { id: 372, title: "Formeller Hosenboden voll (Versohlen als Strafe)", desc: "Das Gesäß als offizielle Wiedergutmachung über den Knien versohlt bekommen.", r1: "Die Strafe mit ruhiger Konsequenz vollziehen", r2: "Die Schläge annehmen & die Schuld abbüßen" },
      { id: 373, title: "Die befreiende Umarmung nach der Strafe", desc: "Sobald die Strafe vorüber ist, fest in den Arm nehmen: Alles ist vergeben.", r1: "Den Partner sofort liebevoll an die Brust ziehen", r2: "Erleichtert im Arm versinken: Es ist wieder gut" },
      { id: 374, title: "Verbot bestimmter Kosenamen nach Fehlverhalten", desc: "Für einen Tag darf der Partner nur mit Vornamen angesprochen werden.", r1: "Auf die Einhaltung der Anrede achten", r2: "Die Kosenamen vermissen & sich bemühen" },
      { id: 375, title: "Zusätzliche Hausarbeit als Wiedergutmachung", desc: "Als Strafe das Bad putzen oder die Fenster gründlich wischen.", r1: "Die Strafaufgabe zuteilen & abnehmen", r2: "Die Aufgabe fleißig erledigen & Buße tun" },
      { id: 376, title: "Das Straf-Protokollbuch (Discipline Journal)", desc: "Ein Buch, in dem Regelverstöße und erfolgte Strafen festgehalten werden.", r1: "Das Buch führen & Unterschrift fordern", r2: "Den Eintrag lesen & die Verantwortung annehmen" },
      { id: 377, title: "Belohnungssystem mit Sternchen oder Punkten", desc: "Für gute Taten Punkte sammeln und gegen Wünsche einlösen.", r1: "Die Punkte gerecht vergeben & Belohnung schenken", r2: "Fleißig Punkte sammeln & sich auf Belohnung freuen" },
      { id: 378, title: "Keine Bestrafung bei echtem Stress oder Trauer", desc: "Eiserne Regel: Bei Trauer oder echtem Kummer gibt es niemals Zucht, nur Liebe.", r1: "Sofort alle Regeln stoppen & nur noch trösten", r2: "Wissen, dass man bei echtem Schmerz immer geschützt ist" },
      { id: 379, title: "Entschuldigungsbrief mit eigenen Worten", desc: "Nach einem Fehler einen handgeschriebenen Brief verfassen und überreichen.", r1: "Den Brief andächtig lesen & anerkennen", r2: "Die Gedanken zu Papier bringen & überreichen" },
      { id: 380, title: "Gemeinsames Lachen nach der Disziplin", desc: "Gemeinsam darüber schmunzeln können, wie frech die Situation war.", r1: "Gemeinsam lachen & die Nähe genießen", r2: "Lachen, kuscheln & die Leichtigkeit spüren" },
      { id: 381, title: "Strikte Trennung von Schmerz und Zorn", desc: "Niemals aus echtem Zorn strafen; immer vollkommen ruhig und beherrscht bleiben.", r1: "Die absolute innere Ruhe beim Strafen bewahren", r2: "Spüren, dass keine böse Wut im Raum ist" },
      { id: 382, title: "Frühzeitiges Klären vor dem Schlafengehen", desc: "Niemals mit ungeklärten Strafen ins Bett gehen; vor dem Schlafen ist Frieden.", r1: "Vor dem Schlafen den Frieden besiegeln", r2: "Mit reinem Gewissen und reinem Herzen einschlafen" },
      { id: 383, title: "Schulterkuss als Friedenszeichen", desc: "Nach verbüßter Strafe küsst der Partner sanft die Schulter als Versöhnungssiegel.", r1: "Den Friedenskuss auf die Schulter setzen", r2: "Den Kuss empfangen & wissen: Alles ist heil" },
      { id: 384, title: "Rechtzeitiges Pausieren bei Überforderung", desc: "Jederzeit 'Gelb' oder das Stoppwort nutzen, wenn eine Strafe zu nah geht.", r1: "Beim kleinsten Zögern sofort innehalten & nachfragen", r2: "Sicher sein, dass die eigenen Grenzen unantastbar sind" },
      {
        id: 385, title: "Welche Art von Strafen findest du erotisch?", desc: "Deine persönliche Haltung zu Wiedergutmachung und Zucht.", type: "choice",
        question: "Welche Form der Disziplinierung passt zu euch?",
        options: [
          { val: "spanking", label: "✋ Klassisches Handspanking über den Knien bis der Po glüht" },
          { val: "chores", label: "🧹 Praktische Strafen (Strafzeilen, Handyverbot, Hausarbeit)" },
          { val: "nadu", label: "🧘 Formale Besinnung (In der Ecke stehen, Abbitte auf Knien)" },
          { val: "none", label: "⛔ Ich mag Strafen und Zucht in der Beziehung überhaupt nicht" }
        ]
      }
    ]
  },
  {
    id: 24,
    title: "CNC (Consensual Non-Consent) & Überwältigungsspiele",
    desc: "Das Spiel mit der scheinbaren Hilflosigkeit: Gespielter Widerstand und feste Stoppworte.",
    items: [
      { id: 386, title: "Gespielter Widerstand (Play Struggle)", desc: "Sich wehren und strampeln, wohlwissend, dass man gleich überwältigt wird.", r1: "Den zappelnden Partner packen & festnageln", r2: "Kämpfen, strampeln & sich bezwingen lassen" },
      { id: 387, title: "Überraschungs-Angriff beim Nachhausekommen", desc: "Hinter der Tür auflauern, den Partner beim Eintreten packen und küssen.", r1: "Hinter der Tür auflauern & überraschend zupacken", r2: "Erschrecken, gepackt werden & das Herzrasen spüren" },
      { id: 388, title: "Inszenierter Einbruch im eigenen Haus", desc: "Der Partner schleicht sich maskiert ins Schlafzimmer und fesselt überraschend.", r1: "Die nächtliche Überwältigung inszenieren & packen", r2: "Im Bett überrascht & wehrlos gemacht werden" },
      { id: 389, title: "Hände hinter den Kopf drücken beim Kuss", desc: "Beide Handgelenke mit einer Hand fixieren, während die andere erkundet.", r1: "Die Hände mit einer Hand oben festhalten", r2: "Festgehalten daliegen & ausgeliefert küssen" },
      { id: 390, title: "Den Rock oder das Kleid fordernd hochreißen", desc: "Den Stoff mit einem Ruck nach oben raffen und direkt festhalten.", r1: "Den Rock nach oben raffen & direkt zupacken", r2: "Das Raffen des Stoffs spüren & Haltung verlieren" },
      { id: 391, title: "Fordernder Nackengriff an die Wand", desc: "Den Partner an der Wand festhalten; eine Hand fest im Nacken zur Fixierung.", r1: "An die Wand drücken & fest im Nacken halten", r2: "An die Wand gedrückt werden & den Herzschlag spüren" },
      { id: 392, title: "Überfall im Auto auf einsamem Parkplatz", desc: "Anhalten, den Sitz nach hinten kurbeln und fordernd zupacken.", r1: "Die Fahrt stoppen & auf den Sitz werfen", r2: "Auf dem Autositz überwältigt werden" },
      { id: 393, title: "Beine mit den Knien auseinanderdrücken", desc: "Geschlossene Schenkel mit den Knien fordernd auseinanderschieben.", r1: "Mit den Knien die Beine des Partners öffnen", r2: "Den Widerstand der Beine brechen lassen" },
      { id: 394, title: "Knebeln mitten im Streit-Rollenspiel", desc: "Mitten im Wortgefecht dem Partner ein Tuch zwischen die Zähne schieben.", r1: "Das Wortgefecht mit dem Knebel abrupt beenden", r2: "Verstummen müssen & die Augen aufreißen" },
      { id: 395, title: "Räuber- & Beute-Rollenspiel", desc: "Feste Rollen: Einer ist die Beute, der andere der unerbittliche Jäger.", r1: "Als unerbittlicher Jäger die Beute fordern", r2: "Als Beute fliehen & gefangen werden" },
      { id: 396, title: "Chef- & Angestellten-Machtspiel", desc: "Späte Überstunden im Büro, bei denen der Chef seine Macht ausspielt.", r1: "Die Chef-Rolle fordernd und streng spielen", r2: "In der Angestellten-Rolle nachgeben müssen" },
      { id: 397, title: "Arzt- & Patientinnen-Untersuchung", desc: "Formeller medizinischer Check mit Stethoskop und Einweghandschuhen.", r1: "Die Untersuchung kühl und fordernd anleiten", r2: "Auf der Liege liegen & untersucht werden" },
      { id: 398, title: "Polizei-Verhör mit Handschellen", desc: "Wegen einer Verfehlung verhört und an den Stuhl geklickt werden.", r1: "Das strenge Verhör führen & Handschellen anlegen", r2: "Auf dem Stuhl gefesselt sitzen & gestehen" },
      { id: 399, title: "Inszeniertes Fremden-Rollenspiel in der Bar", desc: "In der Bar treffen, als kenne man sich nicht, und verführen lassen.", r1: "Den Unbekannten spielen & fordernd ansprechen", r2: "Sich als Fremde abschleppen & packen lassen" },
      { id: 400, title: "Lehrer- & Schüler-Nachsitzen", desc: "Nachsitzen im leeren Raum wegen schlechter Führung mit Maßregelung.", r1: "Die strenge Lehrkraft spielen & maßregeln", r2: "Nachsitzen müssen & am Schreibtisch stehen" },
      { id: 401, title: "Überwältigung unter der Bettdecke", desc: "Unter der Decke einklemmen, sich drauflegen und langsam entblößen.", r1: "Unter der Decke festhalten & Haut freilegen", r2: "Gefangen unter der Decke daliegen" },
      { id: 402, title: "Augen verbinden vor dem Überfall", desc: "Nichts sehen können, während man ins Zimmer geschoben und festgehalten wird.", r1: "Blind ins Zimmer stoßen & aufs Bett werfen", r2: "Blind taumeln & auf die Matratze fallen" },
      { id: 403, title: "Klamotten fordernd aufknöpfen", desc: "Hemd oder Bluse mit schnellen, fordernden Griffen öffnen.", r1: "Die Knöpfe hastig und fordernd aufreißen", r2: "Spüren, wie die Kleidung gewaltsam geöffnet wird" },
      { id: 404, title: "Festhalten am Handgelenk beim Gehen", desc: "Am Handgelenk packen und ohne Worte ins Schlafzimmer ziehen.", r1: "Am Handgelenk packen & ins Zimmer ziehen", r2: "Gezogen werden & hinterherstolpern" },
      { id: 405, title: "Sicherheit: Das unmissverständliche Safeword", desc: "Echtes Stoppwort (z. B. 'Rot') stoppt alles sofort bedingungslos.", r1: "Sofort loslassen und trösten, wenn das Codewort fällt", r2: "Wissen, dass man mit einem einzigen Wort frei ist" },
      { id: 406, title: "Nonverbales Safeword bei Atemnot / Knebel", desc: "Ein Tuch in der Hand halten; fällt es zu Boden, bricht der Partner ab.", r1: "Aufmerksam auf den Gegenstand in der Hand achten", r2: "Das Tuch in der Hand halten als Notbremse" },
      { id: 407, title: "Licht im Raum bei CNC-Spielen", desc: "Gedimmtes Licht, damit man die Augen des Partners prüfen kann.", r1: "Die Augen des Partners im Halblicht beobachten", r2: "Blickkontakt halten zur Beruhigung" },
      { id: 408, title: "Intensiver Kuss zur Beruhigung zwischendurch", desc: "Mitten im Spiel kurz innehalten und beruhigend tief küssen.", r1: "Kurz innehalten, küssen & den Puls prüfen", r2: "Den beruhigenden Kuss spüren: Wir spielen nur" },
      { id: 409, title: "Ausgiebiger Aftercare nach Überwältigung", desc: "Nach dem Spiel mindestens 20 Minuten eng umschlungen liegen.", r1: "Den Partner warm zudecken & ganz fest halten", r2: "Erschöpft und geborgen im Arm landen" },
      { id: 410, title: "Keine echten blauen Flecken oder Narben", desc: "Festhalten ja, aber niemals so zudrücken, dass Hämatome bleiben.", r1: "Die Kraft so dosieren, dass nichts verletzt wird", r2: "Sich sicher sein, dass der Körper geschont wird" },
      { id: 411, title: "Verbot von CNC an stressigen Tagen", desc: "Wenn einer erschöpft ist, finden Überwältigungsspiele keinesfalls statt.", r1: "Feinfühlig spüren, ob heute der richtige Tag ist", r2: "Nur mitmachen, wenn man sich stark genug fühlt" },
      { id: 412, title: "Festes De-Briefing nach dem Spiel", desc: "Nach dem Duschen Tee trinken und besprechen, was gut war.", r1: "Beim Tee zuhören und das Spiel reflektieren", r2: "Offen sagen, welcher Griff besonders prickelnd war" },
      { id: 413, title: "Tränen nach der Überwältigung auffangen", desc: "Wenn Endorphine abfallen und Tränen kommen, wortlos liebkosen.", r1: "Die Tränen küssen und einfach da sein", r2: "Die Gefühle rauslassen und gehalten werden" },
      { id: 414, title: "Sanfte Worte nach der Härte", desc: "Nach dem Spiel flüstern: 'Ich hab dich, du bist sicher bei mir.'", r1: "Die beruhigenden Schutzworte ins Ohr flüstern", r2: "Die lieben Worte hören und die Anspannung abfallen lassen" },
      {
        id: 415, title: "Wie weit darf gespielte Überwältigung gehen?", desc: "Deine persönliche Haltung zu CNC und Schein-Widerstand.", type: "choice",
        question: "Welche Art von Überwältigungsspiel reizt dich?",
        options: [
          { val: "struggle", label: "🤼 Spielerisches Strampeln & Festhalten der Hände im Bett" },
          { val: "roleplay", label: "🎭 Echte Rollenspiele (Einbrecher, Chef, Arzt oder Unbekannter)" },
          { val: "mild", label: "✨ Nur ganz sanftes Dominieren ohne großes Kampfspiel" },
          { val: "none", label: "⛔ Gespielte Überwältigung (CNC) ist für mich ein absolutes Tabu" }
        ]
      }
    ]
  },
  {
    id: 25,
    title: "Körperflüssigkeiten, Ekel- & Grenztests",
    desc: "Intime Berührung mit Flüssigkeiten: Speichel, Schweiß und der Schutz vor echten No-Gos.",
    items: [
      { id: 416, title: "Cutting & Skalpellspiele (Blood Play)", desc: "Mit Klingen die Haut anritzen, um echtes Blut fließen zu sehen.", r1: "Die Haut anritzen & Blut sehen wollen", r2: "Sich ritzen lassen & das Bluten spüren" },
      { id: 417, title: "Kaviar & Scat (Fäkalien-Spiele)", desc: "Einbeziehen von Kot oder Darmflüssigkeiten in Handlungen.", r1: "Fäkalien im Spiel verwenden", r2: "Mit Fäkalien beschmiert werden" },
      { id: 418, title: "Natursekt unter der warmen Dusche", desc: "Sich gemeinsam unter dem fließenden Wasser der Dusche sanft anpinkeln.", r1: "Den Partner unter der Dusche anpinkeln", r2: "Den warmen Urinstrahl auf der Haut empfangen" },
      { id: 419, title: "Nasses Küssen mit reichlich Speichel", desc: "Beim Küssen Speichel von Mund zu Mund fließen lassen.", r1: "Speichel fließen lassen & Mund benetzen", r2: "Den nassen Speichel empfangen & schlucken" },
      { id: 420, title: "Spucken ins Gesicht als herbe Geste", desc: "Dem Partner als Zeichen von Härte ins Gesicht spucken.", r1: "Den Partner gezielt anspucken", r2: "Angespuckt werden & Haltung wahren" },
      { id: 421, title: "Sauberküssen des Körpers nach dem Sex", desc: "Säfte mit Lippen und Zunge von Bauch oder Schenkeln lecken.", r1: "Den Körper des Partners sauberküssen", r2: "Sich nach dem Sex zärtlich sauberlecken lassen" },
      { id: 422, title: "Schweiß vom Körper kosten", desc: "Den salzigen Schweiß an Hals oder Bauch nach dem Sport kosten.", r1: "Den Schweiß vom Partner lecken", r2: "Den eigenen Schweiß ablecken lassen" },
      { id: 423, title: "Sperma auf der Haut verreiben", desc: "Das Ejakulat nach dem Orgasmus wie eine Lotion auf der Haut verteilen.", r1: "Das Sperma auf der Haut verreiben", r2: "Das warme Ejakulat auf der Haut spüren" },
      { id: 424, title: "Ekel-Grenzen bedingungslos respektieren", desc: "Feste Regel: Ekelgefühle werden niemals überspielt – Stopp gilt sofort.", r1: "Sofort innehalten bei Zeichen von Ekel", r2: "Sicher sein, dass Ekelgrenzen heilig bleiben" },
      {
        id: 425, title: "Welche Körperflüssigkeiten reizen dich?", desc: "Deine persönliche Grenze bei Nässe und Säften.", type: "choice",
        question: "Wie stehst du zu intimen Körperflüssigkeiten im Bett?",
        options: [
          { val: "tender", label: "💦 Zärtlicher Speichelfluss & Sauberküssen nach dem Sex" },
          { val: "shower", label: "🚿 Natursekt nur zusammen unter der laufenden Dusche" },
          { val: "spit", label: "😈 Herbes Anspucken als dominante Machtgeste" },
          { val: "none", label: "⛔ Ich mag außer normalem Küssen keinerlei Flüssigkeiten" }
        ]
      }
    ]
  },
  {
    id: 26,
    title: "Treue, Monogamie & Spiel mit Dritten",
    desc: "Klare Grenzen des Paarraums: Schutz der Exklusivität und Umgang mit Fantasien.",
    items: [
      { id: 426, title: "Partnertausch im Swingerclub", desc: "Partnertausch oder Sex vor den Augen anderer Gäste im Club.", r1: "Mit anderen Partnern schlafen im Club", r2: "Zusehen & sich mit anderen vergnügen" },
      { id: 427, title: "Erotischer Dreier (Zwei Frauen, ein Mann)", desc: "Gemeinsames Liebesspiel mit einer zweiten Frau im Schlafzimmer.", r1: "Eine zweite Frau dazuholen & führen", r2: "Zu dritt im Bett lieben & teilen" },
      { id: 428, title: "Erotischer Dreier (Zwei Männer, eine Frau)", desc: "Gemeinsames Liebesspiel mit einem zweiten Mann im Schlafzimmer.", r1: "Einen zweiten Mann ins Zimmer bitten", r2: "Von zwei Männern gleichzeitig begehrt werden" },
      { id: 429, title: "Anderen Paaren heimlich zusehen (Voyeurismus)", desc: "Anderen Paaren beim Liebesspiel zuschauen oder sich beobachten lassen.", r1: "Andere beobachten oder sich präsentieren", r2: "Beobachtet werden & das Kribbeln spüren" },
      { id: 430, title: "Cuckolding als reine Kopf-Fantasie im Bett", desc: "Im Bett darüber reden, wie es wäre – ohne es jemals real zu tun.", r1: "Die Fantasie im Bett erregend ausschmücken", r2: "Der Fantasie lauschen & Lust daraus schöpfen" },
      { id: 431, title: "Exklusive Zweisamkeit & Schutz der Monogamie", desc: "Unsere Sexualität gehört zu 100 % nur uns beiden – niemand Drittes kommt hinein.", r1: "Die Monogamie zu 100 % schützen & wahren", r2: "Wissen, dass unsere Intimität unantastbar privat bleibt" },
      { id: 432, title: "Erotische Geschichten über Verflossene", desc: "Offen und ohne Groll über heiße Erlebnisse aus der Vergangenheit sprechen.", r1: "Von alten Abenteuern erzählen & heiß machen", r2: "Den Geschichten zuhören & erregt werden" },
      { id: 433, title: "Flirten vor den Augen des Partners auf Partys", desc: "Auf Feiern offen flirten, während der Partner zuschaut, aber zusammen gehen.", r1: "Vor den Augen des Partners flirten", r2: "Zusehen, wie der Partner begehrt wird" },
      { id: 434, title: "Sofortiges Klären bei aufkeimender Eifersucht", desc: "Sobald ein Zweifel entsteht, wird sofort ohne Vorwürfe geredet.", r1: "Eifersucht ernst nehmen & Sicherheit schenken", r2: "Unsicherheiten sofort ansprechen dürfen" },
      {
        id: 435, title: "Wie steht ihr zu anderen Personen in eurer Sexualität?", desc: "Deine persönliche Haltung zu Dritten im Liebesleben.", type: "choice",
        question: "Welchen Platz dürfen Fantasien oder Kontakte mit anderen haben?",
        options: [
          { val: "pure_mono", label: "🔒 100 % Monogamie – weder in echt noch als Kopfkino erwünscht" },
          { val: "fantasy_only", label: "💭 Reine Kopf-Fantasien im Bett sind heiß, aber niemals in echt" },
          { val: "voyeur", label: "👀 Zusehen oder Zeigen ja, aber kein Anfassen fremder Personen" },
          { val: "open", label: "✨ Prinzipielle Offenheit für Dreier oder Swingen vorhanden" }
        ]
      }
    ]
  },
  {
    id: 27,
    title: "Analerotik, Prostata & Pegging",
    desc: "Feinfühlige Hingabe: Sanftes Herantasten, Plugs, Prostata-Lust und No-Pain-Garantie.",
    items: [
      { id: 436, title: "Sanftes Umkreisen des Afters mit Öl", desc: "Behutsames Berühren des Analbereichs mit warmem Öl ohne Eindringen.", r1: "Den After sanft mit warmem Öl umkreisen", r2: "Die Berührung am Po entspannt annehmen" },
      { id: 437, title: "Anallecken (Rimming / Anilingus)", desc: "Zärtliches Verwöhnen des Afters mit Zungenspitze und Lippen nach der Dusche.", r1: "Den Partner hingebungsvoll am Po lecken", r2: "Rimming genießen & vollkommen loslassen" },
      { id: 438, title: "Kleiner Silikon-Butt-Plug zum Aufwärmen", desc: "Einen schmalen Plug mit reichlich Gleitmittel während des Vorspiels tragen.", r1: "Den kleinen Plug behutsam einführen", r2: "Den Plug tragen & das Ausfüllen spüren" },
      { id: 439, title: "Butt-Plug beim normalen Sex tragen", desc: "Den Plug drin behalten, während von vorne vaginal oder oral geliebt wird.", r1: "Den Partner mit Plug im Po lieben", r2: "Mit dem Plug im Po empfangen" },
      { id: 440, title: "Sanfte Prostata-Massage von innen", desc: "Mit gekrümmtem Finger den Lustpunkt des Mannes von innen ertasten.", r1: "Die Prostata vorsichtig massieren & tasten", r2: "Die tiefe innere Lust am Damm spüren" },
      { id: 441, title: "Klassischer Analverkehr (Ganz langsam)", desc: "Behutsames Eindringen des Penis mit viel Zeit, Atem und Gleitgel ohne Hektik.", r1: "Ganz langsam & feinfühlig eindringen", r2: "Den Partner im Po empfangen & entspannen" },
      { id: 442, title: "Fordernder Analverkehr von hinten", desc: "Tiefere Stöße in Knie- oder Bauchlage, wenn der Körper vollkommen entspannt ist.", r1: "Von hinten fordernd zustoßen & halten", r2: "Die Intensität von hinten genießen" },
      { id: 443, title: "Pegging (Sie nimmt ihn mit dem Strap-on)", desc: "Die Frau schnallt sich einen Dildo um und dringt aktiv in den Mann ein.", r1: "Den Mann mit dem Strap-on lieben & führen", r2: "Als Mann von der Partnerin genommen werden" },
      { id: 444, title: "Dildo-Training zur schmerzfreien Entspannung", desc: "Mit verschieden großen Plugs üben, damit Muskeln weich werden und nichts schmerzt.", r1: "Das Entspannen geduldig anleiten", r2: "Mit Zeit & Geduld das Loslassen üben" },
      { id: 445, title: "Sanfter Druck auf den Damm (Perineum)", desc: "Die empfindliche Brücke zwischen Genital und After kreisend massieren.", r1: "Den Damm kreisend massieren", r2: "Den Druck auf den Damm genießen" },
      { id: 446, title: "Großzügiges Nachfetten mit Gleitmittel", desc: "Aufmerksames Nachgeben von Gel, damit niemals Reibung entsteht.", r1: "Aufmerksam nachfetten ohne Unterbrechung", r2: "Spüren, dass alles weich und nass gleitet" },
      { id: 447, title: "Vibrator am Damm beim Analverkehr", desc: "Ein Vibro-Toy zusätzlich an Klitoris oder Hoden halten, während anal geliebt wird.", r1: "Das Toy am Damm anlegen & steuern", r2: "Die doppelte Erregung spüren" },
      { id: 448, title: "Diskreter Höschen-Plug beim Spaziergang", desc: "Einen kleinen Plug unter Alltagskleidung bei einem Ausflug tragen.", r1: "Wissen, dass der Partner den Plug trägt", r2: "Mit dem Plug unterwegs Haltung bewahren" },
      { id: 449, title: "Eiserne Regel: Niemals Schmerz beim Analverkehr", desc: "Wenn es zwickt, wird sofort innegehalten oder abgebrochen – ohne Enttäuschung.", r1: "Sofort innehalten bei der kleinsten Regung", r2: "Sicher sein, dass niemals Schmerz erzwungen wird" },
      {
        id: 450, title: "Wie steht ihr zu Analerotik & Pegging?", desc: "Deine persönliche Haltung zu Berührungen am Po.", type: "choice",
        question: "Welche Rolle spielt der Po in eurem Liebesleben?",
        options: [
          { val: "tender", label: "🌸 Nur zärtliches Streicheln, Rimming & kleine Plugs" },
          { val: "classic", label: "✨ Klassischer Analverkehr ganz ohne Hektik & mit viel Gel" },
          { val: "pegging", label: "👑 Pegging (Sie nimmt ihn mit dem Strap-on)" },
          { val: "none", label: "⛔ Analberührungen sind für mich ein Tabu" }
        ]
      }
    ]
  },
  {
    id: 28,
    title: "Öffentliche Kinks, Spielhotels & geheime Codes",
    desc: "Der Kitzel des Verborgenen: BDSM-Theme-Suiten, Restaurant-Zeichen und Diskretion.",
    items: [
      { id: 456, title: "BDSM-Theme-Suite oder Spielhotel buchen", desc: "Ein Wochenende in einer stilvollen Suite mit Pranger und Andreaskreuz verbringen.", r1: "Die Suite buchen & die Reise leiten", r2: "Die fremde Spielwiese genießen" },
      { id: 457, title: "Geheime Handzeichen unter dem Tisch", desc: "Dreimaliges Antippen am Oberschenkel im Restaurant signalisiert Zugehörigkeit.", r1: "Die geheimen Zeichen im Alltag setzen", r2: "Das Zeichen spüren & innerlich erröten" },
      { id: 458, title: "Ohne Unterwäsche ins Restaurant gehen", desc: "Unter dem Kleid oder der Hose keinen Slip tragen, und nur der Partner weiß es.", r1: "Wissen, dass der Partner nackt darunter ist", r2: "Am Tisch sitzen & das Kribbeln ertragen" },
      { id: 459, title: "Spontanes Küssen & Fummeln im Aufzug", desc: "Die 30 Sekunden zwischen zwei Stockwerken für einen gierigen Griff nutzen.", r1: "Im Aufzug packen & küssen", r2: "An die Wand gedrückt werden & mitmachen" },
      { id: 460, title: "Liebesspiel im tiefen Wald am Baum", desc: "Beim Spaziergang kurz vom Weg abbiegen, an einen dicken Stamm lehnen und lieben.", r1: "In die Bäume ziehen & zugreifen", r2: "An den Baum gelehnt empfangen" },
      { id: 461, title: "Nachtsex auf dem geschützten Balkon", desc: "Spät draußen auf dem Balkon stehen und leise sein müssen im Nachtwind.", r1: "Auf den Balkon bitten & von hinten ran", r2: "Das Stöhnen unterdrücken im Nachtwind" },
      { id: 462, title: "Leise sein müssen bei Besuch im Haus", desc: "Wenn Gäste im Nebenzimmer schlafen, sich lautlos lieben ohne Bettfedern-Quietschen.", r1: "Den Mund mit der Hand bedecken & leiten", r2: "Lautlos ins Kissen kommen müssen" },
      { id: 463, title: "Fordernder Blickkontakt quer durch den Raum", desc: "Auf einer vollen Feier quer über alle Köpfe hinweg einen intensiven Blick austauschen.", r1: "Den fordernden Blick durch den Raum werfen", r2: "Dem Blick standhalten & das Herzrasen spüren" },
      { id: 464, title: "Ein Toy in der Handtasche dabeihaben", desc: "Das Wissen im Alltag, dass Fesseln oder ein Plug im Auto bereitliegen.", r1: "Das Toy einpacken & dabeihaben", r2: "Wissen, was im Auto bereitliegt" },
      { id: 465, title: "Diskretion: Niemals Unbeteiligte belästigen", desc: "Feste Regel: Außenstehende dürfen niemals ungewollt hineingezogen werden.", r1: "Auf absolute Diskretion achten", r2: "Sicher sein, dass niemand belästigt wird" },
      {
        id: 466, title: "Welcher Nervenkitzel unterwegs reizt dich?", desc: "Deine persönliche Haltung zu geheimen Kicks im Alltag.", type: "choice",
        question: "Welche Art von öffentlichem Kitzel passt zu euch?",
        options: [
          { val: "hotel", label: "🏰 Stilvolle Theme-Suiten & Spielhotels mit Vorhängen" },
          { val: "secret", label: "🤫 Unsichtbare Rituale (Ohne Höschen, Kniezeichen unterm Tisch)" },
          { val: "nature", label: "🌲 Einsame Orte in der Natur (Wald, See, Balkon bei Nacht)" },
          { val: "none", label: "⛔ Nur die eigenen vier Wände – unterwegs mag ich reine Ruhe" }
        ]
      }
    ]
  },
  {
    id: 29,
    title: "Sicherheitsarchitektur & Nonverbale Signale",
    desc: "Das Netz unter dem Seil: Handdrück-Codes, Notfall-Gesten bei Knebel und Stopp-Recht.",
    items: [
      { id: 476, title: "Das Handdrück-Signal (2x / 3x / Stillstand)", desc: "2x Drücken = 'Alles super'; 3x Drücken = 'Gelb/Sanfter'; Hand loslassen = Notstopp.", r1: "Aufmerksam die Hand des Partners halten & fühlen", r2: "Mit der Hand den Takt und die Sicherheit steuern" },
      { id: 477, title: "Das fallengelassene Tuch (Drop-Item bei Knebel)", desc: "Ein Tuch in der Faust halten; fällt es zu Boden, bricht der Partner sofort ab.", r1: "Die Hand und das Tuch ständig im Blick haben", r2: "Das Tuch festhalten als absolute Notbremse" },
      { id: 478, title: "Das Ampelsystem (Grün - Gelb - Rot)", desc: "Grün = 'Mehr', Gelb = 'Pause / Tempo raus', Rot = 'Alles sofort fallen lassen'.", r1: "Beim Wort Gelb sofort innehalten & nachfragen", r2: "Die Ampelworte ohne jedes Zögern nutzen" },
      { id: 479, title: "Regelmäßiger Finger- & Puls-Check bei Fesseln", desc: "Prüfen, ob die Finger warm sind und das Blut nach Druck sofort zurückkehrt.", r1: "Die Fingerfarbe und Temperatur geduldig prüfen", r2: "Die Hände abtasten lassen & Feedback geben" },
      { id: 480, title: "Scharfer Seilschneider liegt immer griffbereit", desc: "Ein Sicherheitskappschneider liegt offen auf dem Tisch für klemmende Knoten.", r1: "Den Schneider vor jeder Session bereitlegen", r2: "Wissen, dass man in zwei Sekunden frei ist" },
      { id: 481, title: "Wasserflasche mit Strohhalm am Bett", desc: "Trinkflasche steht bereit, damit der Gefesselte ohne Aufrichten trinken kann.", r1: "Dem Partner regelmäßig Wasser anreichen", r2: "Einen Schluck Wasser im Liegen annehmen" },
      { id: 482, title: "Raumtemperatur & warme Decken im Voraus prüfen", desc: "Sicherstellen, dass geheizt ist; unbewegte Körper kühlen rasch aus.", r1: "Den Raum vorheizen & Decken stapeln", r2: "Nicht frieren müssen beim Stillliegen" },
      { id: 483, title: "Keine Sessions unter Alkohol oder Rauschmitteln", desc: "Bei BDSM, Fesseln oder Schlägen sind beide Partner vollkommen nüchtern.", r1: "Auf absolute Nüchternheit bestehen", r2: "Nur mit klarem Verstand in die Szene gehen" },
      { id: 484, title: "Recht auf Abbruch ohne Schmollen oder Vorwurf", desc: "Wer 'Stopp' sagt, muss sich nicht rechtfertigen und wird sofort in den Arm genommen.", r1: "Einen Abbruch sofort mit Liebe & Nähe auffangen", r2: "Wissen, dass man niemals jemanden enttäuscht" },
      {
        id: 485, title: "Wie verlässlich erlebst du unsere Sicherheitsregeln?", desc: "Deine persönliche Gewissheit über eure Schutzleitplanken.", type: "choice",
        question: "Welches Sicherheitssignal gibt dir das größte Vertrauen?",
        options: [
          { val: "hand", label: "🤝 Das Handdrück-Signal (2x / 3x / Loslassen) bei Berührung" },
          { val: "traffic", label: "🚦 Das klassische Ampelsystem (Grün, Gelb, Rot) mit Worten" },
          { val: "drop", label: "🪨 Ein fallengelassenes Tuch oder Glöckchen in der Hand" },
          { val: "eyes", label: "👁️ Reiner Blickkontakt & intuitive Feinfühligkeit" }
        ]
      }
    ]
  },
  {
    id: 30,
    title: "Aftercare & Nachsorge-Protokolle",
    desc: "Die sanfte Landung nach dem Höhenflug: Stille Ruhezeit, Decken und der 24h-Check-in.",
    items: [
      { id: 526, title: "Absolutes Schweigen & Ruhezeit", desc: "Vereinbarte Phase ohne Worte; stummes Halten, Handkontakt und gleichmäßiger Atem.", r1: "Ruhe wahren & Partner stumm im Arm halten", r2: "Die wortlose Stille genießen & runterkommen" },
      { id: 527, title: "Gemeinsames Entspannungsbad nach der Session", desc: "Warmes Badewasser zum Abwaschen von Schweiß oder Ölen als Liebesdienst.", r1: "Partner behutsam waschen & abtrocknen", r2: "Im warmen Wasser gewaschen werden" },
      { id: 528, title: "Dicke Wärmedecken & Wollsocken bereitstellen", desc: "Den zitternden Körper warm einpacken, um den Hormonabsturz abzufangen.", r1: "Den Partner warm einpacken & wärmen", r2: "Eingekuschelt die Wärme spüren" },
      { id: 529, title: "Heißer Kakao, Tee & kleine Snacks zum Auffüllen", desc: "Zucker und Wärme zuführen, damit der Blutzuckerspiegel rasch steigt.", r1: "Ein warmes Getränk ans Bett bringen", r2: "Tee und Schokolade im Bett genießen" },
      { id: 530, title: "Arnika-Balsam & Kühlpads für rote Hautstellen", desc: "Nach Spanking oder Fesseln die Hautstellen mit Balsam einreiben und kühlen.", r1: "Die Striemen sanft einbalsamieren & pflegen", r2: "Die wohltuende Kühlung auf der Haut spüren" },
      { id: 531, title: "Tränen laufen lassen dürfen ohne Scham", desc: "Wenn Endorphine abfallen und Tränen kommen, einfach weinen dürfen im Arm.", r1: "Die Tränen sanft küssen & da sein", r2: "Alle Gefühle rauslassen & gehalten werden" },
      { id: 532, title: "24-Stunden-Check-in am Folgetag", desc: "Verbindliche Nachricht oder Anruf morgen, um Subdrop abzufangen.", r1: "Den Check-in proaktiv am nächsten Tag senden", r2: "Den Check-in empfangen & ehrlich antworten" },
      { id: 533, title: "Ruhiges De-Briefing bei einer Tasse Kaffee", desc: "Ein entspanntes Gespräch am Tag danach: Was war wundervoll? Was ändern wir?", r1: "Offen zuhören ohne sich verteidigen zu müssen", r2: "Ehrlich sagen, welcher Moment besonders schön war" },
      { id: 534, title: "Sanfte Kopf- & Nackenmassage beim Einschlafen", desc: "Langsames Streichen über die Schläfen, bis der Partner friedlich einschläft.", r1: "Den Partner in den Schlaf kraulen", r2: "Mit sanften Händen am Kopf wegdösen" },
      { id: 535, title: "Kein abrupter Ausstieg aus der Session", desc: "Niemals nach dem Orgasmus sofort an Handy oder PC; das Ausklingen dauert 20 Min.", r1: "Im Bett liegenbleiben & Nähe schenken", r2: "Die gemeinsame Zeit bis zum Schluss genießen" },
      {
        id: 536, title: "Welcher Aftercare tut dir nach intensiven Reizen am besten?", desc: "Deine persönliche Nachsorge-Priorität.", type: "choice",
        question: "Was brauchst du nach einer Session am dringendsten?",
        options: [
          { val: "warmth", label: "🛌 Dicke Decken, heißer Tee & stummes Halten im Arm" },
          { val: "bath", label: "🛁 Ein warmes Bad mit liebevollem Waschen & Abtrocknen" },
          { val: "words", label: "💬 Liebevolle Schutzworte ('Du bist sicher bei mir') & Kraulen" },
          { val: "checkin", label: "📱 Die feste Gewissheit eines 24h-Check-ins am nächsten Tag" }
        ]
      }
    ]
  },
  {
    id: 31,
    title: "Spezial-Kinks, Nischen & Kerker-Spiele (Pos. 537–595)",
    desc: "Ausgefallene Reize: Nuru-Gleitmassage, Teledildonik und Kerker-Geborgenheit.",
    items: [
      { id: 537, title: "Teledildonik & App-gesteuerte Toys im Alltag", desc: "Ein Toy unter Kleidung tragen, das der Partner per Handy aus der Ferne steuert.", r1: "Das Toy aus der Ferne steuern & überraschen", r2: "Das Toy unterwegs tragen & ausgeliefert sein" },
      { id: 538, title: "Elektrostimulation (E-Stim / TENS-Pads)", desc: "Sanfte Reizströme über Klebepads an Po oder Schenkeln zur Muskelkontraktion.", r1: "Reizströme dosiert anlegen & steuern", r2: "Prickelnde Stromreize empfangen & aushalten" },
      { id: 539, title: "Violet Wand (Hochfrequenz-Funken)", desc: "Winzige Funken über die Haut tanzen lassen für heißes Prickeln und Ozonduft.", r1: "Die Elektrode führen & Funken springen lassen", r2: "Das Knistern und heiße Prickeln auf der Haut spüren" },
      { id: 540, title: "Eiswürfel & Temperatur-Schock", desc: "Schmelzendes Eis über Brustwarzen oder Bauchnabel im Wechsel mit heißem Atem.", r1: "Mit dem Eiswürfel Reizlinien ziehen", r2: "Das schmelzende Eis auf heißer Haut ertragen" },
      { id: 541, title: "Niedrigtemperatur-Wachs (Wax Play)", desc: "Spezielles BDSM-Kerzenwachs auf Bauch oder Schenkel tropfen lassen.", r1: "Die Kerze ruhig halten & Wachs tropfen lassen", r2: "Die heißen Wachstropfen auf der Haut empfangen" },
      { id: 542, title: "Nuru-Massage (Algen-Gleitmassage)", desc: "Body-to-Body Gleitmassage mit extrem glitschigem Nuru-Gel aus Braunalgen.", r1: "Den Partner mit vollem Körpereinsatz gleitend massieren", r2: "Den glitschigen Body-to-Body Gleitreiz empfangen" },
      { id: 543, title: "Queening & Facesitting (Dienen mit der Zunge)", desc: "Die Partnerin setzt sich auf das Gesicht des Partners und lässt sich lecken.", r1: "Auf das Gesicht setzen & den Takt bestimmen", r2: "Unter dem Becken liegen & mit Hingabe lecken" },
      { id: 544, title: "Boot Worship & Lederstiefel-Pflege", desc: "Dem Partner auf Knien die Lederstiefel putzen und die Eleganz des Leders verehren.", r1: "Die Stiefel zur andächtigen Pflege hinhalten", r2: "Auf Knien die Stiefel küssen & säubern" },
      { id: 545, title: "CFNM (Clothed Female, Naked Male)", desc: "Sie bleibt voll bekleidet, während er nackt serviert, posiert oder gehorcht.", r1: "Voll bekleidet den nackten Mann führen", r2: "Als einziger Nackter im Raum dienen & stehen" },
      { id: 546, title: "Bettel-Disziplin (Begging Protocol)", desc: "Kein Trinken und kein Orgasmus ohne vorheriges, förmliches Bitten und Flehen.", r1: "Das Bitten einfordern & die Erlaubnis dosieren", r2: "Demütig und ehrlich um Erlaubnis bitten" },
      { id: 547, title: "Schweigegebot & Rederecht im Raum", desc: "Im Raum herrscht Stille; sprechen nur, wenn das Wort ausdrücklich erteilt wird.", r1: "Das Rederecht streng zuteilen & Ruhe wahren", r2: "Stumm verharren & nur auf Befehl sprechen" },
      { id: 548, title: "Goreanische Kniehaltungen (Nadu & Kajira)", desc: "Traditionelle Haltungen auf Knien zur Schau der Ergebenheit.", r1: "Die formale Haltung anordnen & korrigieren", r2: "Aufrecht knien, stillhalten & verharren" },
      { id: 549, title: "Körperliche Beschriftung (Body Writing)", desc: "Mit Lippenstift liebevolle Kosenamen oder Noten auf Bauch oder Po schreiben.", r1: "Die Haut des Partners beschriften & markieren", r2: "Die Schriftzeichen auf der Haut tragen" },
      { id: 550, title: "Tape Bondage (Fixierung mit Klebeband)", desc: "Arme oder Beine eng mit reißfestem Klebeband oder Folie zusammenwickeln.", r1: "Mit dem Tape präzise wickeln & fixieren", r2: "Vollkommen unbeweglich im Klebeband liegen" },
      { id: 551, title: "Kitzelfolter unter Fixierung (Tickling)", desc: "Fixierte Arme; der Partner kitzelt unerbittlich an Rippen und Sohlen.", r1: "Geduldig kitzeln & den Kitzelreiz dosieren", r2: "Wehrlos gekitzelt werden & lachen/bitten" },
      { id: 552, title: "Muskelanbetung (Muscle Worship)", desc: "Trainierte Muskelgruppen des Partners mit Händen massieren, küssen und bewundern.", r1: "Die Muskeln anspannen & bewundern lassen", r2: "Den festen Körper andächtig streicheln & küssen" },
      { id: 553, title: "Nyotaimori (Essen vom nackten Körper)", desc: "Früchte oder Schokolade auf dem reglos liegenden Partner anrichten und naschen.", r1: "Leckereien direkt von der Haut naschen", r2: "Als lebendiges Tablett ganz still daliegen" },
      { id: 554, title: "Mumifizierung (Kokon aus Binden & Tüchern)", desc: "Den Partner eng in elastische Binden hüllen wie in einen unbeweglichen Kokon.", r1: "Den Partner behutsam einwickeln & versiegeln", r2: "Im warmen, unbeweglichen Kokon tief abtauchen" },
      { id: 555, title: "Spreizstangen an Knöcheln & Handgelenken", desc: "Eine starre Stange hält die Beine weit geöffnet, sodass sie nicht schließen können.", r1: "Die Stange anbringen & die Haltung bestimmen", r2: "Mit geöffneten Beinen arretiert verharren" },
      { id: 556, title: "Bastinado (Schläge auf die Fußsohlen)", desc: "Gezielte Hiebe mit einem Holzstab oder Lederband auf die nackten Fußsohlen.", r1: "Die Fußsohlen behutsam versohlen", r2: "Das Brennen auf den Fußsohlen aushalten" },
      { id: 557, title: "Trampling (Vorsichtiges Begehen mit Gewicht)", desc: "Mit nackten Füßen auf dem Rücken des liegenden Partners balancieren.", r1: "Den Partner mit den Füßen vorsichtig begehen", r2: "Das angenehme Gewicht der Füße am Rücken spüren" },
      { id: 558, title: "Verhör- & Inquisitions-Rollenspiel", desc: "Auf einen Stuhl gesetzt, ins Licht gerückt und wegen Streichen ausgefragt werden.", r1: "Das strenge Verhör führen & disziplinieren", r2: "Auf dem Stuhl sitzen & die Wahrheit gestehen" },
      { id: 559, title: "Erotische Trance & Triggerwörter (Hypno-Kink)", desc: "Mit ruhiger Stimme in Entspannung leiten und ein Triggerwort verankern.", r1: "Die Trance ruhig anleiten & Worte verankern", r2: "Der Stimme lauschen & in die Trance gleiten" },
      { id: 560, title: "Spiegel-Sex mit striktem Reflexions-Blick", desc: "Blickkontakt ausschließlich über das Spiegelbild austauschen.", r1: "Den Blickkontakt im Spiegelbild fordern", r2: "Sich selbst und den Partner im Spiegel ansehen" },
      { id: 580, title: "Retentions-Klistiere (Großvolumen-Einläufe)", desc: "Verabreichen großer Wassermengen in den Darm mit Pflicht zum Halten.", r1: "Große Wassermengen verabreichen", r2: "Den Einlauf über lange Zeit halten müssen" },
      { id: 581, title: "Anketten & Kerker-Arretierung im Wachzustand", desc: "Den Partner mit Stahlketten an Wandöse oder Gitterbox für Zeitlang fixieren.", r1: "Den Partner an der Wand oder Gitterbox anketten", r2: "Angekettet verharren & die Auslieferung spüren" },
      { id: 582, title: "Übernachten & Schlafen im Kerker", desc: "Die gesamte Nacht in der sicheren Zelle oder im Käfig geborgen schlafen.", r1: "Die Kerker-Nachtruhe anordnen & Schlüssel hüten", r2: "Im Kerker sicher schlafen & morgens warten" },
      { id: 586, title: "Vorlese- & Waschritual im Kerkerbett", desc: "Den Partner im Kerkerbett waschen, zudecken und eine Geschichte vorlesen.", r1: "Den Partner im Kerkerbett waschen & vorlesen", r2: "Ganz weich gebettet der Stimme lauschen" },
      { id: 589, title: "Urethral-Vibration (Harnröhrensonden)", desc: "Einführen medizinischer Metallstifte direkt in die Harnröhre des Penis.", r1: "Sonden in die Harnröhre einführen", r2: "Harnröhrensonden empfangen & aushalten" },
      {
        id: 595, title: "Welche Nischen- & Kerker-Fantasien reizen dich am meisten?", desc: "Deine persönliche Haltung zu speziellen Praktiken.", type: "choice",
        question: "Welcher dieser besonderen Kinks spricht dich spontan an?",
        options: [
          { val: "nuru", label: "💧 Nuru-Massage (Schwereloses Algen-Gleiten Body-to-Body)" },
          { val: "cell", label: "🏰 Kerker-Nächte (Geborgen & arretiert bis zum Morgen schlafen)" },
          { val: "hypno", label: "🌀 Hypnose, Trance & tiefe Wort-Konditionierung" },
          { val: "none", label: "⛔ Besondere Nischen interessieren mich nicht" }
        ]
      }
    ]
  },
  {
    id: 32,
    title: "Privatsphäre, Familie & Kinderschutz (Pos. 596–603)",
    desc: "Schutzräume und ethische Grenzen: Schutz der Familie und sichere Verwahrung.",
    items: [
      {
        id: 596, title: "Strikte Diskretion im Freundes- & Bekanntenkreis", desc: "Wie geht ihr nach außen hin mit euren Kinks und Rollen um?", type: "choice",
        question: "Welche Geheimhaltung wünschst du dir gegenüber Freunden?",
        options: [
          { val: "secret", label: "🔒 100 % Geheimnis: Niemand im Umfeld erfährt jemals davon" },
          { val: "friends", label: "👥 Ausgewählte enge Szene-Freunde dürfen davon wissen" },
          { val: "open", label: "🌐 Vollkommen offener & entspannter Umgang" }
        ]
      },
      { id: 597, title: "BDSM-Reisen & Spielhotels als Paar", desc: "Wochenenden in stilvollen Suiten mit Vorhängen und Pranger buchen.", r1: "Die Reise planen, Suite buchen & leiten", r2: "Die fremde, geschützte Spielwiese genießen" },
      {
        id: 598, title: "Absolute Trennung von Kink und Kindern (Kinderschutz)", desc: "Wie regelt ihr den Schutz von Kindern im gemeinsamen Haushalt?", type: "choice",
        question: "Welche Schutzregel gilt für Kinder?",
        options: [
          { val: "strict", label: "🛡️ 100 % Pflicht: Toys & Rollen vor Kindern strikt weggeschlossen" },
          { val: "safe", label: "🗝️ Sicher verschlossen im privaten Eltern-Schlafzimmer" },
          { val: "none", label: "🏠 Keine Kinder im Haushalt oder Umfeld vorhanden" }
        ]
      },
      { id: 599, title: "Diskreter Day-Collar / Schmuck-Anhänger", desc: "Ein unauffälliges Lederbändchen oder Ring als Kette im Alltag tragen.", r1: "Den Anhänger feierlich anlegen & als Symbol schenken", r2: "Den Anhänger im Alltag am Hals tragen & Verbundenheit spüren" },
      {
        id: 600, title: "Sicherer Tresor oder Schloss für BDSM-Ausrüstung", desc: "Alle Seile, Fesseln und Käfige lagern in einer abschließbaren Truhe.", type: "choice",
        question: "Wie lagert ihr euer Spiel-Equipment zu Hause?",
        options: [
          { val: "safe_mandatory", label: "🔐 Abschließbare Truhe / Schrank mit Zahlenschloss Pflicht" },
          { val: "closet", label: "🚪 Normaler Kleiderschrank im Schlafzimmer reicht aus" },
          { val: "open", label: "✨ Offen dekorativ im privaten Schlafzimmer platziert" }
        ]
      },
      { id: 601, title: "Umgang mit Geräuschen im Mehrfamilienhaus", desc: "Rücksicht auf Nachbarn: Bei lauten Sessions Mund mit Kissen bedecken oder Musik an.", r1: "Aufmerksam auf die Lautstärke im Raum achten", r2: "Das Stöhnen im Kissen dämpfen & Rücksicht nehmen" },
      {
        id: 602, title: "Digitaler Datenschutz (Handy-PIN, Chat-Sperren & Fotos)", desc: "Wie schützt ihr eure privaten Fotos und Nachrichten vor Blicken?", type: "choice",
        question: "Welcher Schutz gilt für euer Smartphone?",
        options: [
          { val: "pin_mandatory", label: "🔒 PIN-Sperre & getrennter Foto-Tresor zwingend erforderlich" },
          { val: "trust", label: "🤝 Volles Vertrauen ohne spezielle App-Sperren" },
          { val: "no_photos", label: "⛔ Es werden generell keinerlei intime Fotos angefertigt" }
        ]
      },
      {
        id: 603, title: "Trennung von Beziehungskrisen und D/s-Dynamiken", desc: "Was passiert mit Regeln, wenn ihr im echten Alltag Streit oder Sorgen habt?", type: "choice",
        question: "Wie reagiert ihr bei echtem Alltagsstreit?",
        options: [
          { val: "pause", label: "🛑 Sofortiger Stopp aller Spielregeln – reine Fürsorge als Partner" },
          { val: "dialog", label: "💬 Kurzes Gespräch, ob D/s heute beim Druckabbau hilft" }
        ]
      }
    ]
  },
  {
    id: 33,
    title: "Eigene Ergänzungen & Paar-Rituale (Pos. 604–608)",
    desc: "Eure ganz persönlichen Neuentdeckungen: Feste Alltagsgewohnheiten und Liebesbriefe.",
    items: [
      { id: 604, title: "Morgenritual: Stumme Knie-Inspektion", desc: "Vor dem Frühstück für zwei Minuten andächtig auf Knien vor dem Partner verharren.", r1: "Die morgendliche Kniehaltung prüfen & segnen", r2: "Auf Knien verharren & den Tag gesammelt beginnen" },
      { id: 605, title: "Entspannungs-Baden nach Stresstagen", desc: "Den Partner ohne sexuelle Forderung in ein heißes Bad heben und abtrocknen.", r1: "Den erschöpften Partner behutsam waschen & abtrocknen", r2: "Im warmen Wasser gewaschen & ins Bett getragen werden" },
      { id: 606, title: "Seilkorsett unter der normalen Alltagskleidung", desc: "Ein enges Shibari-Harness unter Pullover oder Bluse tragen im Alltag.", r1: "Das Seil am Morgen eng unter die Kleidung knüpfen", r2: "Mit dem geheimen Seildruck durch den Alltag gehen" },
      { id: 607, title: "Handgeschriebener Liebes- & Gehorsamsbrief", desc: "Einmal im Monat einen Brief schreiben, in dem Wünsche und Gefühle festgehalten werden.", r1: "Den Brief andächtig lesen & am Herzen bewahren", r2: "Die eigenen Gefühle ehrlich zu Papier bringen" },
      {
        id: 608, title: "Gemeinsamer Jahresrückblick auf unsere Kinks", desc: "Ein fester Abend im Jahr: Welche Kinks haben uns bereichert?", type: "choice",
        question: "Wie oft möchtet ihr eure Entwicklung gemeinsam reflektieren?",
        options: [
          { val: "annual_review", label: "🍷 1× im Jahr ein fester, schöner Termin nur für uns" },
          { val: "ongoing", label: "💬 Nach jeder größeren Session ganz spontan" },
          { val: "spontaneous", label: "✨ Einfach fließen lassen ohne festen Jahresplan" }
        ]
      }
    ]
  }
]);

window.lexikonData = [
  { term: "SSC (Safe, Sane, Consensual)", def: "Grundsatz der Kink-Szene: Alle Handlungen müssen sicher, vernünftig und zu 100 % einvernehmlich sein.", link: "https://de.wikipedia.org/wiki/Safe,_Sane,_Consensual" },
  { term: "RACK (Risk-Aware Consensual Kink)", def: "Erweitertes Konzept: Beide Partner sind sich der realen Risiken bewusst und tragen die Verantwortung gemeinsam.", link: "https://de.wikipedia.org/wiki/RACK" },
  { term: "Aftercare (Nachsorge)", def: "Liebevolle Fürsorge nach einer Session (Kuscheln, Decken, Tee, De-Briefing) zur seelischen und körperlichen Stabilisierung.", link: "https://de.wikipedia.org/wiki/Aftercare_(BDSM)" },
  { term: "Subdrop / Topdrop", def: "Hormoneller und emotionaler Erschöpfungszustand nach intensiven Sessions durch den abrupten Abfall von Endorphinen und Adrenalin.", link: "https://de.wikipedia.org/wiki/Subdrop" },
  { term: "Subspace", def: "Tranceähnlicher, glückseliger Zustand des passiven Partners durch Reize, Endorphine und vollkommene Hingabe.", link: "https://de.wikipedia.org/wiki/Subspace" },
  { term: "Shibari / Kinbaku", def: "Traditionelle japanische Kunst des Seilbindens mit geölten Naturfasern (Jute/Hanf) zur Erzeugung von Mustern und angenehmem Druck.", link: "https://de.wikipedia.org/wiki/Shibari" },
  { term: "Praise Play", def: "Führung und Bestätigung des Partners durch warmes, echtes Lob und Zärtlichkeit statt strenger Disziplinierung.", link: "https://de.wikipedia.org/wiki/BDSM" },
  { term: "Tease & Denial / Edging", def: "Gezieltes Heranführen an den Orgasmus mit anschließendem abruptem Abbruch der Berührung, um die Erregung zu dehnen.", link: "https://de.wikipedia.org/wiki/Edging" },
  { term: "Bratting & Brat Taming", def: "Spielerisches, freches Provozieren des Partners, um eine liebevoll-strenge Zurechtweisung herauszufordern.", link: "https://de.wikipedia.org/wiki/BDSM" },
  { term: "Primal Play", def: "Instinktgetriebenes, körperbetontes Spiel mit Ringen, Beißen, Jagen und Kräftemessen ganz ohne starre Regeln.", link: "https://de.wikipedia.org/wiki/BDSM" },
  { term: "Caregiver / Little", def: "Rollenaufteilung zwischen fürsorglicher Beschützerfigur und geborgenem Partner zum Stressabbau.", link: "https://de.wikipedia.org/wiki/Adult_Baby" },
  { term: "CBT (Cock and Ball Torture)", def: "Gezielte Reizung oder Schmerzapplikation an Penis und Hoden (z. B. Abbinden, Gewichte, Schläge).", link: "https://de.wikipedia.org/wiki/Cock_and_Ball_Torture" },
  { term: "Queening / Facesitting", def: "Ein Partner setzt sich rittlings auf das Gesicht des Partners und steuert Atmung und Zungenkontakt.", link: "https://de.wikipedia.org/wiki/Facesitting" },
  { term: "CFNM (Clothed Female, Naked Male)", def: "Visuelles Machtgefälle: Ein Partner bleibt elegant bekleidet, während der andere nackt zur Verfügung steht.", link: "https://de.wikipedia.org/wiki/CFNM" },
  { term: "Nuru-Massage", def: "Traditionelle japanische Gleitmassage mit extrem glattem Algen-Gel auf nackter Haut.", link: "https://de.wikipedia.org/wiki/Nuru" }
];
