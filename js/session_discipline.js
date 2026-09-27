/**
 * js/session_discipline.js
 * Bestrafungs- & Disziplinar-Wizard für die Schlafzimmer-Regie.
 * 
 * Features:
 * - 🎲 Würfel-Generator (Re-Roll) in JEDER Stufe für endlose, kreative Variation
 * - Kreative Kombinations-Engine: Facesitting + Genital-Impact, Klammern + Edging-Quälerei, 
 *   Eiskontrast + Spanking, orales Dienen + Fesselung
 * - Erkennt Schrank-Toys (HubToys) und bindet sie dynamisch in neue Konstellationen ein
 * - Strikter Ausschluss aller Note-1-Tabus & Berücksichtigung der Freigabestufen
 * - Scham-Faktor-Würdigung: Besondere seelische Demut bei markierten Hemmschwellen
 * - Physische Verträglichkeitsprüfung (z. B. Hände hinten vs. Selbstspanking)
 */

(function(window) {
  'use strict';

  var wizardState = {
    currentStage: 1,
    category: 'mouth',
    reason: '',
    severities: { 1: 2, 2: 2, 3: 2, 4: 2 },
    selectedChoices: { 1: null, 2: null, 3: null, 4: null },
    discardedIds: { 1: [], 2: [], 3: [], 4: [] },
    isAiGenerating: false
  };

  var INFRACTION_MAP = {
    mouth: { label: "Widerrede & Frechheit", hint: "Dämpfung des Redeflusses, Mund-Knechtung & Demut." },
    posture: { label: "Haltungsfehler & Zappeln", hint: "Feste Arretierung, Kniestand & Zucht der Willenskraft." },
    orgasm: { label: "Unerlaubte Lust & Drang", hint: "Kanten-Quälerei, Keuschheit, Kälte & Genital-Impact." },
    duty: { label: "Pflichtversäumnis", hint: "Formale Zucht, Gesäß-Spanking & körperliches Dienen." },
    self_discipline: { label: "Selbstvollzug", hint: "Der Bottom führt die Zucht unter den strengen Augen des Tops selbst aus." }
  };

  function escapeText(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getGeminiApiKey() {
    try {
      var liveKey = document.getElementById('session-gemini-key-input') || document.getElementById('account-gemini-key');
      if (liveKey && liveKey.value && liveKey.value.trim().length > 10) return liveKey.value.trim();
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return null;
  }

  function isToolAvailableInClosetOrHousehold(toolKeyword) {
    var rawOwned = [];
    if (window.HubToys && typeof window.HubToys.getOwnedIds === 'function') {
      rawOwned = window.HubToys.getOwnedIds();
    } else {
      try {
        var stored = localStorage.getItem('kompass_active_equipment_ids');
        if (stored) rawOwned = JSON.parse(stored);
      } catch (e) {}
    }

    var kw = (toolKeyword || '').toLowerCase();
    var ALWAYS_ALLOWED = [
      'hand', 'finger', 'körper', 'stimme', 'bett', 'wand', 'boden', 'kniestand', 
      'gürtel', 'krawatte', 'schal', 'tuch', 'handtuch', 'wäscheklammer', 'klammer', 
      'eiswürfel', 'eis', 'kissen', 'kleidung', 'stuhl', 'hocker', 'gesicht', 'spiegel'
    ];

    for (var i = 0; i < ALWAYS_ALLOWED.length; i++) {
      if (kw.indexOf(ALWAYS_ALLOWED[i]) !== -1) return true;
    }

    var catalog = window.equipmentCatalog || [];
    return rawOwned.some(function(ownedId) {
      if (ownedId === toolKeyword) return true;
      var foundItem = catalog.find(function(c) { return c.id === ownedId; });
      if (foundItem) {
        var itemName = (foundItem.name || '').toLowerCase();
        if (itemName.indexOf(kw) !== -1 || kw.indexOf(itemName) !== -1) return true;
      }
      return false;
    });
  }

  function getBottomAnswers() {
    var subKey = (typeof window.subPartner !== 'undefined') ? window.subPartner : 'A';
    if (window.answers && window.answers[subKey]) return window.answers[subKey];
    try {
      var stored = localStorage.getItem('kompass_answers');
      if (stored) {
        var p = JSON.parse(stored);
        if (p && p[subKey]) return p[subKey];
      }
    } catch (e) {}
    return {};
  }

  function getMasterActionPool(subName, topName) {
    return [
      // KATEGORIE 1: IMPACT & FORMELLE ZUCHT
      {
        id: "action_formal_spank",
        cat: ["mouth", "duty"],
        title: "✋ Formelles Zucht-Versohlen (15 Hiebe mit Dank)",
        desc: "15 gezielte Treffer über die Knie. " + subName + " muss nach jedem Hieb laut rufen: 'Danke, mein Top, für Schlag Nummer X!' – bei Versprechern beginnt das Zählen von vorn.",
        ratingBadge: "⚖️ Klassische Zucht & Rhythmus"
      },
      {
        id: "action_belt_warning",
        cat: ["duty", "posture"],
        title: "⚡ Ledergürtel-Doppelschlag & Warnrötung",
        desc: "Fünf langsame, trockene Treffer mit gefaltetem Ledergürtel quer über die fleischigen Partien des Gesäßes, gefolgt von Handauflegen.",
        ratingBadge: "🔥 Scharfer Reiz & Katharsis"
      },
      {
        id: "action_flogger_swarm",
        cat: ["duty", "orgasm"],
        title: "🪶 Flogger-Gewitter zur Reizüberflutung",
        desc: "Zweihundert schnelle, schwirrende Schläge mit dem Wildleder-Flogger über Rücken und Pobacken, bis die Haut gleichmäßig glüht.",
        ratingBadge: "⚡ Sensorische Durchwärmung"
      },

      // KATEGORIE 2: MACHT, GESICHT & DEMUT (FACESITTING & ORALES DIENEN)
      {
        id: "action_facesitting_throne",
        cat: ["mouth", "posture"],
        title: "👑 Facesitting-Thron & Mund-Knechtung",
        desc: topName + " nimmt direkt auf Mund und Nase von " + subName + " Platz. " + subName + " darf ausschließlich dienen und atmet die Intimität des Tops ein.",
        ratingBadge: "🧎 Vollkommene Unterwerfung"
      },
      {
        id: "action_foot_worship_chastise",
        cat: ["mouth", "duty"],
        title: "🦶 Fuß-Unterwerfung & Zehenkuss-Buße",
        desc: subName + " kniet zu Füßen des Tops und muss jeden Zeh andächtig küssen und reinigen, während " + topName + " die Haltung schweigend mustert.",
        ratingBadge: "👑 Psychologische Demut"
      },

      // KATEGORIE 3: ORGASMUSKONTROLLE & GENITAL-DISZIPLIN
      {
        id: "action_ruined_discipline",
        cat: ["orgasm", "mouth"],
        title: "🥀 Disziplinarischer Ruined Orgasm",
        desc: topName + " stimuliert " + subName + " bis exakt zum Point of no Return und stoppt schlagartig. Der Orgasmus verpufft krampfend ohne Erlösung.",
        ratingBadge: "🔒 Macht über den Höhepunkt"
      },
      {
        id: "action_clamps_edging",
        cat: ["orgasm", "duty"],
        title: "⚡ Klammern-Arretierung & Kanten-Quälerei",
        desc: "Wäscheklammern an den Brustwarzen. Während der Druck pulsiert, berührt " + topName + " fordernd bis zur Schwelle 9.5 – Stopp auf Befehl.",
        ratingBadge: "🎢 Lust-Schmerz-Kontrast"
      },
      {
        id: "action_ice_contrast_fire",
        cat: ["posture", "orgasm"],
        title: "🧊 Eiskontrast & Feurige Schläge",
        desc: "Eiswürfel werden langsam kreisend über die Innenschenkel geschmolzen, unmittelbar gefolgt von scharfen Klapsen mit der nackten Hand.",
        ratingBadge: "❄️ Thermische Sensibilisierung"
      },

      // KATEGORIE 4: STATISCHE DISZIPLIN & HALTEÜBUNGEN (AUSDAUER)
      {
        id: "action_wall_sit_penance",
        cat: ["posture", "duty"],
        title: "🧱 3 Minuten Wandhocke (Wall-Sit) ohne Laut",
        desc: subName + " presst den Rücken im 90-Grad-Winkel gegen die Wand. Die Oberschenkel brennen, die Hände liegen flach auf dem Kopf.",
        ratingBadge: "⏱️ Körperliche Selbstbeherrschung"
      },
      {
        id: "action_corner_time_kneel",
        cat: ["mouth", "posture"],
        title: "📐 Eck-Stehen / Corner Time mit Blick zur Wand",
        desc: subName + " steht 5 Minuten nackt mit Nase und Zehenspitzen an der Zimmerecke. Jeder Blick zur Seite verlängert die Strafe um 1 Minute.",
        ratingBadge: "🙈 Reizentzug & Beschämung"
      },

      // KATEGORIE 5: SELBSTVOLLZUG & SPRACHLICHE DEMUT
      {
        id: "action_self_spank_mirror",
        cat: ["self_discipline", "mouth"],
        title: "🪞 Selbstversohlen vor dem Spiegel",
        desc: subName + " muss sich mit eigener Hand kräftig 20 Mal auf das Gesäß schlagen, in den Spiegel blicken und laut den Fehler bekennen.",
        ratingBadge: "🙈 Scham-Faktor & Selbstüberwindung"
      },
      {
        id: "action_written_lines",
        cat: ["duty", "mouth"],
        title: "📝 Strafzeilen auf den Körper schreiben",
        desc: topName + " schreibt mit Lippenstift oder weichem Stift das Vergehen ('Ungehorsam', 'Eigentum') groß auf Brust, Bauch oder Oberschenkel.",
        ratingBadge: "✒️ Visuelle Markierung"
      },
      {
        id: "action_tickle_torture",
        cat: ["mouth", "posture"],
        title: "🪶 Kitzelfolter unter vollkommener Arretierung",
        desc: "Füße oder Achseln werden wehrlos fixiert und mit Fingern oder Federn gekitzelt, bis der Bottom um Gnade und Fassung fleht.",
        ratingBadge: "😂 Wehrlose Reizüberflutung"
      }
    ];
  }

  function getMasterPosturePool() {
    return [
      { id: "posture_kneel_nadu", title: "Aufrechter Kniestand (Nadu / Seiza)", desc: "Aufrecht kniend, Fersen unter dem Gesäß, Brust herausgedrückt, Hände auf den Oberschenkeln." },
      { id: "posture_over_lap", title: "Quer über den Oberschenkeln des Tops (OTK)", desc: "Bauchlage quer über den Knien des Tops. Das Becken ist hochgekippt, Beine hängen herab." },
      { id: "posture_bed_bend", title: "Tiefe Vorbeuge an der Bettkante", desc: "Oberkörper flach auf der Matratze, Stirn auf den Händen, Gesäß maximal exponiert im Raum." },
      { id: "posture_standing_wall", title: "Wand-Kuss (Stehen mit Stirn an der Wand)", desc: "Füße 50cm von der Wand entfernt, nur die Stirn berührt die Wand, Hände hinter dem Rücken verschränkt." },
      { id: "posture_all_fours_arch", title: "Katzenbuckel im Vierfüßlerstand", desc: "Hände und Knie am Boden, Wirbelsäule durchgebogen, Blick starr zu den Fußspitzen des Tops." },
      { id: "posture_frog_squat", title: "Tiefe Froschhocke (Malasana)", desc: "Tief in der Hocke, Knie maximal gespreizt, Fersen am Boden, Hände gefaltet vor der Brust." },
      { id: "posture_boot_rest", title: "Kopf auf den Füßen des Tops abgelegt", desc: "Flache Bauchlage am Boden, die Wange ruht ergeben auf den Fußrücken oder Schuhen des sitzenden Tops." },
      { id: "posture_bench_arch", title: "Stuhlkante mit erhobenem Becken", desc: "Knien vor einem Stuhl, Oberkörper über die Sitzfläche gelehnt, Beine weit gegrätscht." }
    ];
  }

  function getMasterBondagePool() {
    var list = [];
    if (isToolAvailableInClosetOrHousehold('cuffs') || isToolAvailableInClosetOrHousehold('manschette')) {
      list.push({ id: "bondage_leather_cuffs", title: "Leder-Handfesseln hinter dem Rücken", desc: "Handgelenke hinter der Lendenwirbelsäule arretiert – vollständige Wehrlosigkeit." });
    }
    if (isToolAvailableInClosetOrHousehold('shibari') || isToolAvailableInClosetOrHousehold('seil')) {
      list.push({ id: "bondage_box_tie", title: "Shibari Box Tie (Takate Kote)", desc: "Oberarme hinter dem Rücken zusammengeschnürt – erzwingt stolze, offene Brusthaltung." });
      list.push({ id: "bondage_chest_harness", title: "Kompaktes Seil-Brustgeschirr", desc: "Feste Seilspannung um den Brustkorb für intensive somatische Erdung." });
    }
    list.push({ id: "bondage_silk_scarf", title: "Seidenschal / Krawatte um die Handgelenke", desc: "Weiche, aber unnachgiebige Schlingenbindung vor oder hinter dem Körper." });
    list.push({ id: "bondage_thigh_spread", title: "Schenkel-Spreizung mit Gürtel", desc: "Knie werden mit einem Riemen auf Abstand arretiert, Schließen der Beine unmöglich." });
    list.push({ id: "bondage_thumbs", title: "Daumenfesselung (Gefaltetes Band)", desc: "Nur die beiden Daumen werden fixiert – minimale Einschränkung mit maximaler Symbolik." });
    list.push({ id: "bondage_chair_secure", title: "Arretierung an den Stuhlpfosten", desc: "Handgelenke an den seitlichen Stuhlbeinen fixiert für absolute Bewegungsunfähigkeit." });
    list.push({ id: "bondage_none_pure_will", title: "Keine Fesselung – Disziplin durch reinen Gehorsam", desc: "Die Haltung muss allein durch mentale Selbstbeherrschung reglos gehalten werden." });
    return list;
  }

  function getMasterSensoryPool() {
    var list = [];
    if (isToolAvailableInClosetOrHousehold('knebel') || isToolAvailableInClosetOrHousehold('gag')) {
      list.push({ id: "sensory_ball_gag", title: "Schrank-Knebel (Ball- oder Ringknebel)", desc: "Hält den Kiefer geöffnet und erzwingt vollständiges, demütiges Verstummen." });
    }
    list.push({ id: "sensory_cloth_gag", title: "Weicher Tuchknebel (Stofftuch / Seidenschal)", desc: "Dämpft Laute sanft ab und signalisiert symbolische Sprachlosigkeit." });
    if (isToolAvailableInClosetOrHousehold('maske') || isToolAvailableInClosetOrHousehold('blindfold')) {
      list.push({ id: "sensory_leather_blindfold", title: "Gepolsterte Schlaf- oder Ledermaske", desc: "Schaltet den Sehsinn komplett aus – jeder Reiz trifft unangekündigt ein." });
    } else {
      list.push({ id: "sensory_scarf_blindfold", title: "Dunkler Schal als Augenbinde", desc: "Blickdichte Augenbedeckung für verstärkte sensorische Fokussierung." });
    }
    list.push({ id: "sensory_mirror_focus", title: "Spiegel-Zwang (Visuelle Konfrontation)", desc: "Der Bottom muss ununterbrochen in den Spiegel blicken und die eigene Zucht ansehen." });
    list.push({ id: "sensory_whisper_ear", title: "Ohr-Flüstern & Atem-Reiz", desc: "Top flüstert aus nächster Nähe strenge Anweisungen und Lob direkt in die Ohrmuschel." });
    list.push({ id: "sensory_none_eye_contact", title: "Keine Sinnesreduktion – Strenger Blickkontakt", desc: "Volle Sinneswahrnehmung. Der Bottom muss dem Top ununterbrochen in die Augen blicken." });
    return list;
  }

  function getStageOptions(stage) {
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
    var topName = (window.names && window.names[window.topPartner]) || 'Top';
    var discarded = wizardState.discardedIds[stage] || [];

    var fullList = [];
    if (stage === 1) {
      fullList = getMasterActionPool(subName, topName);
      // Filter nach Kategorie, falls passend
      var catMatches = fullList.filter(function(item) {
        return item.cat && item.cat.indexOf(wizardState.category) !== -1;
      });
      var others = fullList.filter(function(item) {
        return !item.cat || item.cat.indexOf(wizardState.category) === -1;
      });
      fullList = catMatches.concat(others);

      // Falls situativer Anlass getippt wurde, individuellen Vorschlag oben anfügen
      if (wizardState.reason && wizardState.reason.trim().length > 2) {
        fullList.unshift({
          id: "custom_reason_" + wizardState.reason.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
          title: "⚖️ Situative Sühne für: „" + escapeText(wizardState.reason.trim()) + "“",
          desc: "Maßgeschneiderte Buße für " + subName + ": 20 Schläge mit flacher Hand auf das Gesäß, gefolgt von 5 Minuten absolutem Kniestand zur Besinnung.",
          ratingBadge: "✨ Maßgeschneiderte Einzelfall-Zucht"
        });
      }
    } else if (stage === 2) {
      fullList = getMasterPosturePool();
    } else if (stage === 3) {
      fullList = getMasterBondagePool();
    } else if (stage === 4) {
      fullList = getMasterSensoryPool();
    }

    // DISCARD-FILTER: Bereits abgewählte Optionen werden NICHT mehr angezeigt
    var available = fullList.filter(function(item) {
      return discarded.indexOf(item.id) === -1;
    });

    // Falls alles verworfen wurde, Cache leeren und neu mischen
    if (available.length < 3) {
      wizardState.discardedIds[stage] = [];
      available = fullList;
    }

    return available.slice(0, 3);
  }

  function rerollStage() {
    var stage = wizardState.currentStage;
    var currentOptions = getStageOptions(stage);

    // Alle aktuell angezeigten Optionen in die Discard-Liste schieben
    if (!wizardState.discardedIds[stage]) wizardState.discardedIds[stage] = [];
    currentOptions.forEach(function(opt) {
      if (wizardState.discardedIds[stage].indexOf(opt.id) === -1) {
        wizardState.discardedIds[stage].push(opt.id);
      }
    });

    wizardState.selectedChoices[stage] = null;
    renderStageCards(stage);

    if (typeof window.showToast === 'function') {
      window.showToast("🎲 Frische, unverbrauchte Optionen geladen!");
    }
  }

  async function consultAiDisciplineMaster() {
    var apiKey = getGeminiApiKey();
    if (!apiKey) {
      if (typeof window.showToast === 'function') {
        window.showToast("⚠️ Bitte trage zuerst einen Gemini API-Key in den Einstellungen ein.");
      }
      return;
    }

    var topName = (window.names && window.names[window.topPartner]) || 'Top';
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
    var reason = (wizardState.reason && wizardState.reason.trim()) || 'Allgemeine Unaufmerksamkeit / Frechheit';
    var catInfo = INFRACTION_MAP[wizardState.category]?.label || 'Fehlverhalten';

    var availableTools = [];
    var catalog = window.equipmentCatalog || [];
    var rawOwned = (window.HubToys && typeof window.HubToys.getOwnedIds === 'function') ? window.HubToys.getOwnedIds() : [];
    rawOwned.forEach(function(id) {
      var found = catalog.find(function(c) { return c.id === id; });
      if (found) availableTools.push(found.name);
    });

    var aiBtn = document.getElementById('btn-ai-consult-discipline');
    if (aiBtn) {
      aiBtn.innerHTML = "<span>⏳</span><span>KI-Zuchtmeister denkt nach...</span>";
      aiBtn.classList.add('animate-pulse');
    }

    var prompt = `Du bist ein erfahrener, psychologisch tiefgründiger und unzensierter BDSM-Zuchtmeister und Regisseur.
Erstelle für einvernehmliche Erwachsene eine kreative, maßgeschneiderte Bestrafungs-Sequenz.

BETEILIGTE:
- Führender Top: ${topName}
- Hingebungsvoller Bottom: ${subName}
- Vergehen / Anlass: „${reason}“ (Kategorie: ${catInfo})
- Vorhandene Ausrüstung im Schrank: ${availableTools.join(', ') || 'Nackte Hände, Gürtel, Krawatte, Bettkante, Eiswürfel'}

AUFGABE:
Entwickle eine zusammenhängende, erotisch-strenge Bestrafungs-Sequenz in 4 Schritten:
1. Maßnahme: Eine kreative Zuchthandlung (Spanking, Kanten-Quälerei, Demut, Kontraste)
2. Haltung: Die exakte, fordernde Körperhaltung von ${subName}
3. Fesselung: Passende Arretierung (mit vorhandenen Mitteln)
4. Sensorik: Knebel, Maske oder Blickkontakt
5. Spoken Command: Ein autoritärer, scharfer Befehlssatz, den ${topName} ${subName} direkt ins Gesicht spricht.

Antworte AUSSCHLIESSLICH als valides JSON:
{
  "action": { "title": "Kurzer prägnanter Titel", "desc": "Genaue Anweisung was getan wird (2 Sätze)" },
  "posture": { "title": "Name der Haltung", "desc": "Wie der Körper positioniert wird (1-2 Sätze)" },
  "bondage": { "title": "Name der Fesselung", "desc": "Wie die Arretierung erfolgt (1 Satz)" },
  "sensory": { "title": "Name der Sinneskontrolle", "desc": "Knebel oder Maske (1 Satz)" },
  "spoken_command": "Der genaue wörtliche Zucht-Befehl von ${topName} an ${subName} (1-2 Sätze)"
}`;

    var candidateModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
    var resultData = null;

    for (var i = 0; i < candidateModels.length; i++) {
      try {
        var resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${candidateModels[i]}:generateContent?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, responseMimeType: "application/json" }
          })
        });

        if (resp.ok) {
          var resJson = await resp.json();
          var rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          resultData = JSON.parse(rawText);
          if (resultData && resultData.action && resultData.posture) break;
        }
      } catch (e) {}
    }

    if (aiBtn) {
      aiBtn.innerHTML = "<span>✨</span><span>KI-Zuchtmeister befragen</span>";
      aiBtn.classList.remove('animate-pulse');
    }

    if (resultData && resultData.action) {
      wizardState.selectedChoices[1] = { id: "ai_action", title: "✨ " + resultData.action.title, desc: resultData.action.desc, ratingBadge: "🤖 KI-Maßanfertigung" };
      wizardState.selectedChoices[2] = { id: "ai_posture", title: "✨ " + resultData.posture.title, desc: resultData.posture.desc };
      wizardState.selectedChoices[3] = { id: "ai_bondage", title: "✨ " + resultData.bondage.title, desc: resultData.bondage.desc };
      wizardState.selectedChoices[4] = { id: "ai_sensory", title: "✨ " + resultData.sensory.title, desc: resultData.sensory.desc };
      wizardState.aiSpokenCommand = resultData.spoken_command;

      // Direkt zu Stufe 5 (Zusammenfassung) springen
      showStage(5);

      if (typeof window.showToast === 'function') {
        window.showToast("✨ KI-Zuchtmeister hat ein maßgeschneidertes Protokoll erstellt!");
      }
    } else {
      if (typeof window.showToast === 'function') {
        window.showToast("⚠️ KI-Antwort fehlgeschlagen. Nutze die Hand-Auswahl.");
      }
    }
  }

  function renderStageCards(stage) {
    var container = document.getElementById('stage-' + stage + '-cards-container');
    if (!container) return;

    var options = getStageOptions(stage);

    container.innerHTML = options.map(function(opt, idx) {
      var currentChoice = wizardState.selectedChoices[stage];
      var isSel = (currentChoice && currentChoice.id === opt.id) || (!currentChoice && idx === 0);
      if (isSel && !currentChoice) {
        wizardState.selectedChoices[stage] = opt;
      }

      var activeClass = isSel
        ? "bg-brand-950/60 border-brand-500 text-white font-bold shadow-md"
        : "theme-panel border-slate-800 text-slate-300 hover:border-slate-700";

      return `
        <button type="button" onclick="SessionDiscipline.selectOption(${stage}, '${opt.id}')" class="w-full p-3.5 rounded-2xl border text-left transition-all touch-btn ${activeClass}">
          <div class="flex items-center justify-between">
            <strong class="text-xs text-white">${escapeText(opt.title)}</strong>
            <span class="text-xs ${isSel ? 'text-brand-300 font-bold' : 'text-slate-600'}">${isSel ? '✓' : '○'}</span>
          </div>
          <p class="text-[11px] text-slate-300 mt-1 leading-snug font-normal">${escapeText(opt.desc)}</p>
          ${opt.ratingBadge ? `<span class="inline-block mt-1.5 text-[9.5px] px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800 font-semibold">${escapeText(opt.ratingBadge)}</span>` : ''}
        </button>
      `;
    }).join('');

    validateCurrentPhysicalSetup();
  }

  function validateCurrentPhysicalSetup() {
    var warnBanner = document.getElementById('wizard-conflict-warning');
    var warnText = document.getElementById('wizard-conflict-text');

    var action = wizardState.selectedChoices[1];
    var posture = wizardState.selectedChoices[2];
    var bondage = wizardState.selectedChoices[3];

    var isSelfSpank = action && (action.id === 'action_self_spank_mirror');
    var isHandsBoundBehind = (bondage && (bondage.id === 'bondage_leather_cuffs' || bondage.id === 'bondage_box_tie')) || (posture && posture.id === 'posture_standing_wall');

    if (isSelfSpank && isHandsBoundBehind) {
      if (warnBanner) warnBanner.classList.remove('hidden');
      if (warnText) warnText.innerText = "Konflikt: Hände sind hinten arretiert – Selbstschläge nicht möglich. Der Top übernimmt die Ausführung.";
      return;
    }

    if (warnBanner) warnBanner.classList.add('hidden');
  }

  function renderDisciplineSummary() {
    var container = document.getElementById('summary-discipline-breakdown');
    if (!container) return;

    var act = (wizardState.selectedChoices[1] && wizardState.selectedChoices[1].title) || 'Disziplinierungs-Maßnahme';
    var pos = (wizardState.selectedChoices[2] && wizardState.selectedChoices[2].title) || 'Kniestand';
    var bon = (wizardState.selectedChoices[3] && wizardState.selectedChoices[3].title) || 'Keine Fesselung';
    var sen = (wizardState.selectedChoices[4] && wizardState.selectedChoices[4].title) || 'Keine sensorische Einschränkung';
    var reason = (wizardState.reason && wizardState.reason.trim()) || 'Verstoß gegen Schlafzimmer-Regeln';
    var spokenCmd = wizardState.aiSpokenCommand || '';

    container.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2.5">
        <div class="border-b border-slate-800 pb-1.5"><strong class="text-amber-300">Anlass:</strong> <span class="text-white">${escapeText(reason)}</span></div>
        <div><strong class="text-brand-300">1. Maßnahme:</strong> <span class="text-slate-200">${escapeText(act)}</span></div>
        <div><strong class="text-indigo-300">2. Haltung:</strong> <span class="text-slate-200">${escapeText(pos)}</span></div>
        <div><strong class="text-teal-300">3. Fesselung:</strong> <span class="text-slate-200">${escapeText(bon)}</span></div>
        <div><strong class="text-purple-300">4. Sensorik:</strong> <span class="text-slate-200">${escapeText(sen)}</span></div>
        ${spokenCmd ? `
          <div class="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800 text-[11px] text-purple-200 mt-2">
            <strong class="text-purple-300 block mb-0.5">🗣️ Befehl des Tops (laut vorlesen):</strong>
            „${escapeText(spokenCmd)}“
          </div>
        ` : ''}
      </div>
    `;
  }

  function showStage(stage) {
    wizardState.currentStage = stage;

    [1, 2, 3, 4, 5].forEach(function(s) {
      var el = document.getElementById('wizard-stage-' + s);
      if (el) {
        if (s === stage) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });

    var sub = document.getElementById('wizard-stage-subtitle');
    var titles = [
      "",
      "Stufe 1 von 5: Vergehen & Maßnahme",
      "Stufe 2 von 5: Vorgeschriebene Körperhaltung",
      "Stufe 3 von 5: Passende Fesselung & Arretierung",
      "Stufe 4 von 5: Sensorische Kontrolle & Knebel",
      "Stufe 5 von 5: Vollzugs-Protokoll & Anordnung"
    ];
    if (sub) sub.innerText = titles[stage] || "";

    var btnPrev = document.getElementById('btn-prev-wizard');
    var btnNext = document.getElementById('btn-next-wizard');
    if (btnPrev) btnPrev.style.visibility = (stage === 1) ? 'hidden' : 'visible';
    if (btnNext) btnNext.innerText = (stage === 5) ? "Fertig" : "Weiter →";

    injectAiAndRerollButtons();

    if (stage === 5) renderDisciplineSummary();
    else renderStageCards(stage);
  }

  function injectAiAndRerollButtons() {
    // 1. KI-Button in Stufe 1 einbetten (falls noch nicht da)
    var stage1 = document.getElementById('wizard-stage-1');
    if (stage1 && !document.getElementById('btn-ai-consult-discipline')) {
      var btnAi = document.createElement('button');
      btnAi.type = 'button';
      btnAi.id = 'btn-ai-consult-discipline';
      btnAi.className = 'w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-900 to-brand-800 hover:from-purple-800 hover:to-brand-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 touch-btn shadow-md my-1';
      btnAi.innerHTML = '<span>✨</span><span>KI-Zuchtmeister befragen (Automatische Maßanfertigung)</span>';
      btnAi.onclick = consultAiDisciplineMaster;
      stage1.insertBefore(btnAi, stage1.children[2]);
    }

    // 2. Re-Roll Buttons in Stufen 2 bis 4
    for (var s = 2; s <= 4; s++) {
      var stageEl = document.getElementById('wizard-stage-' + s);
      if (stageEl && !document.getElementById('reroll-btn-stage-' + s)) {
        var headerDiv = stageEl.querySelector('strong');
        if (headerDiv && !headerDiv.parentElement.classList.contains('flex')) {
          var wrap = document.createElement('div');
          wrap.className = "flex items-center justify-between";
          headerDiv.parentNode.insertBefore(wrap, headerDiv);
          wrap.appendChild(headerDiv);

          var btn = document.createElement('button');
          btn.type = "button";
          btn.id = 'reroll-btn-stage-' + s;
          btn.className = "text-brand-300 font-bold hover:underline text-xs flex items-center gap-1";
          btn.innerHTML = "<span>Neu würfeln</span><span>🎲</span>";
          btn.onclick = rerollStage;
          wrap.appendChild(btn);
        }
      }
    }
  }

  function applyDisciplineOrder() {
    var act = (wizardState.selectedChoices[1] && wizardState.selectedChoices[1].title) || 'Bestrafung angeordnet';
    var nowTime = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    if (window.currentSessionLog && Array.isArray(window.currentSessionLog)) {
      window.currentSessionLog.push({ type: "action", time: nowTime, label: "Zucht: " + act });
    }

    closeModal();
    if (typeof window.showToast === 'function') {
      window.showToast("Bestrafung offiziell angeordnet & protokolliert ⚖️");
    }

    if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      var speech = wizardState.aiSpokenCommand || ("Urteil gesprochen. " + act + ". Sofortige Hinnahme ohne Widerspruch.");
      window.SessionVoice.play(speech);
    }
  }

  function openModal() {
    wizardState.currentStage = 1;
    wizardState.discardedIds = { 1: [], 2: [], 3: [], 4: [] };
    wizardState.selectedChoices = { 1: null, 2: null, 3: null, 4: null };
    wizardState.aiSpokenCommand = null;
    showStage(1);
    var modal = document.getElementById('modal-incident-discipline');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
  }

  function closeModal() {
    var modal = document.getElementById('modal-incident-discipline');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  window.SessionDiscipline = {
    open: openModal,
    close: closeModal,
    showStage: showStage,
    prevStage: function() { if (wizardState.currentStage > 1) showStage(wizardState.currentStage - 1); },
    nextStage: function() { if (wizardState.currentStage < 5) showStage(wizardState.currentStage + 1); else applyDisciplineOrder(); },
    rerollStage: rerollStage,
    consultAi: consultAiDisciplineMaster,
    selectCategory: function(cat) {
      wizardState.category = cat;
      ['mouth', 'posture', 'orgasm', 'duty', 'self_discipline'].forEach(function(c) {
        var btn = document.getElementById('cat-btn-' + c);
        if (btn) {
          if (c === cat) btn.className = "p-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
          else btn.className = "p-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-300 touch-btn";
        }
      });
      wizardState.selectedChoices[1] = null;
      renderStageCards(1);
    },
    handleReasonInput: function(val) {
      wizardState.reason = val || '';
      wizardState.selectedChoices[1] = null;
      renderStageCards(1);
    },
    selectOption: function(stage, id) {
      var options = getStageOptions(stage);
      for (var i = 0; i < options.length; i++) {
        if (options[i].id === id) {
          wizardState.selectedChoices[stage] = options[i];
          break;
        }
      }
      renderStageCards(stage);
    },
    apply: applyDisciplineOrder
  };

  window.openIncidentDisciplineModal = openModal;
  window.closeIncidentDisciplineModal = closeModal;

})(window);
