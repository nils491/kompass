/**
 * js/session_discipline.js
 * Bestrafungs- & Disziplinar-Wizard für die Schlafzimmer-Regie.
 * 
 * Qualitäts-Standards:
 * - Ernsthafter, erwachsener BDSM-Kontext ohne schwülstige Märchenonkel-Floskeln
 * - Begründete Rationale für Schlagzahlen und Haltedauern (Somatik, Laktat, Endorphine)
 * - Vollständige Ausführungserklärungen aller 4 Elemente in der Zusammenfassung
 * - Echtes Würfeln (Re-Roll) mit Ausschluss bereits gesehener Treffer
 * - Semantische Schrank-Einbindung (ToyCombinatorics)
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
    catalogOffsets: { 1: 0, 2: 0, 3: 0, 4: 0 },
    isAiGenerating: false,
    aiSpokenCommand: null
  };

  var INFRACTION_MAP = {
    mouth: { label: "Widerrede & Grenztestung", hint: "Fokus auf Stille, Atemdisziplin und verbale Klarheit." },
    posture: { label: "Haltungsfehler & Unruhe", hint: "Statische Arretierung, Kniestand und Muskelkontrolle." },
    orgasm: { label: "Unerlaubte Eigenlust & Vorprellen", hint: "Schwellenkontrolle, Reizaufschub und sensorische Kälte." },
    duty: { label: "Regel- & Pflichtversäumnis", hint: "Rhythmisches Spanking mit formalem Zählprotokoll." },
    self_discipline: { label: "Selbstvollzug", hint: "Der Bottom führt die Korrektur unter direkter Aufsicht des Tops eigenhändig aus." }
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
      var rawAnswers = localStorage.getItem('kompass_answers');
      if (rawAnswers) {
        var p = JSON.parse(rawAnswers);
        if (p?.settings?.geminiApiKey) return p.settings.geminiApiKey.trim();
      }
    } catch (e) {}
    return null;
  }

  function getMasterActionPool(subName, topName) {
    var rawOwned = (window.HubToys && typeof window.HubToys.getOwnedIds === 'function') ? window.HubToys.getOwnedIds() : [];
    var catalog = window.equipmentCatalog || [];
    var ownedToys = [];
    rawOwned.forEach(function(id) {
      var found = catalog.find(function(c) { return c.id === id; });
      if (found) ownedToys.push(found);
    });

    var sem = (window.ToyCombinatorics && typeof window.ToyCombinatorics.buildSummary === 'function')
      ? window.ToyCombinatorics.buildSummary(ownedToys)
      : { clitoral_suction: [], vibrator: [], impact: [], clamps: [] };

    var suctionTool = sem.clitoral_suction[0] || sem.vibrator[0];

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

    if (suctionTool) {
      list.push({
        id: "action_suction_overstim_punish",
        cat: ["orgasm", "duty"],
        title: "⚡ Klitorale Reizüberlastung mit " + suctionTool,
        rationale: "Sensorische Disziplin: Zwingt den Körper, einem extrem intensiven Lustreiz standzuhalten, ohne nachzugeben oder das Becken zu bewegen.",
        desc: topName + " platziert den " + suctionTool + " auf der Klitoris. " + subName + " muss 90 Sekunden regungslos verharren, darf nicht vorstoßen und muss den Atem flach halten.",
        execution: "Gerät auf mittlerer Stufe aufsetzen. Jedes Ausweichzucken führt zu einer kurzen Pause und erneutem Ansetzen. Nach 90 Sekunden schlagartig stoppen.",
        ratingBadge: "🎢 90 Sek · Reizkontrolle (" + suctionTool + ")"
      });
      list.push({
        id: "action_suction_ruined_punish",
        cat: ["orgasm", "mouth"],
        title: "🥀 Gezielter Orgasmusabbruch (Ruined) mit " + suctionTool,
        rationale: "Machtdemonstration über den Reflex: Entkoppelt den körperlichen Muskelkrampf von der Belohnung. Macht deutlich, wer über den Höhepunkt bestimmt.",
        desc: topName + " treibt " + subName + " gezielt an den Point of no Return. Beim ersten Muskelzucken wird das Gerät abrupt entfernt; jede Berührung wird untersagt.",
        execution: "Den Schwellenanstieg genau beobachten (Atemstillstand, Oberschenkelspannung). Genau beim ersten Beckenkrampf das Gerät wegnehmen und 'Stillhalten!' befehlen.",
        ratingBadge: "🔒 Macht über den Reflex"
      });
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

  function getPosturePool() {
    return [
      {
        id: "posture_kneel_nadu",
        title: "🧎 Strenger Kniestand (Nadu / Seiza)",
        desc: "Aufrechter Kniestand, Gesäß ruht auf den Fersen, Wirbelsäule gestreckt, Blick 45 Grad nach unten gerichtet.",
        execution: "Knie schulterbreit, Hände liegen mit den Handflächen nach oben auf den Oberschenkeln. Kein Anlehnen, keine Gewichtsverlagerung."
      },
      {
        id: "posture_otk",
        title: "🛋️ Über die Knie gelegt (Over the Knee / OTK)",
        desc: "Der Bottom liegt quer über den Oberschenkeln des sitzenden Tops, das Becken ist leicht nach oben gewinkelt.",
        execution: "Die Beine des Bottoms hängen frei herab. Der Top fixiert bei Bedarf mit einem Unterarm den unteren Rücken, um Stabilität zu gewährleisten."
      },
      {
        id: "posture_standing_bend",
        title: "📐 90-Grad-Vorbeuge an der Bettkante",
        desc: "Die Beine stehen gestreckt, der Oberkörper liegt im rechten Winkel auf der Matratze auf.",
        execution: "Füße stehen parallel, Knie durchgedrückt. Die Hände greifen die Bettkante, um das Gesäß optimal zu präsentieren."
      },
      {
        id: "posture_quadruped",
        title: "🐾 Vierfüßlerstand mit abgesenktem Brustkorb",
        desc: "Knie am Boden, die Stirn berührt die Matratze, das Becken bleibt maximal angehoben.",
        execution: "Hohlkreuz vermeiden; das Becken muss stabil senkrecht über den Knien stehen, um Trefferflächen sauber freizugeben."
      }
    ];
  }

  function getBondagePool() {
    var rawOwned = (window.HubToys && typeof window.HubToys.getOwnedIds === 'function') ? window.HubToys.getOwnedIds() : [];
    var catalog = window.equipmentCatalog || [];
    var ownedToys = [];
    rawOwned.forEach(function(id) {
      var found = catalog.find(function(c) { return c.id === id; });
      if (found) ownedToys.push(found);
    });

    var sem = (window.ToyCombinatorics && typeof window.ToyCombinatorics.buildSummary === 'function')
      ? window.ToyCombinatorics.buildSummary(ownedToys)
      : { bondage: [] };

    var bondageTool = sem.bondage[0] || "Leder-Handgelenksmanschetten oder Seidenschal";

    return [
      {
        id: "bondage_cuffs_back",
        title: "⛓️ Handgelenke hinter dem Rücken arretiert (" + bondageTool + ")",
        desc: "Die Handgelenke werden hinter dem Kreuzbein zusammengeführt und sicher fixiert.",
        execution: "Zwischen Fesselung und Haut muss ein Zeigefinger passen. Finger nach 2 Minuten auf Wärme und Durchblutung prüfen (Zupftest)."
      },
      {
        id: "bondage_elbows_aligned",
        title: "🥋 Ellenbogen-Fixierung (Box Tie / Takate Kote)",
        desc: "Die Oberarme werden hinter dem Rücken zusammengeführt, die Hände bleiben frei beweglich.",
        execution: "Keine Seile über die Beugeseite des Ellenbogens führen (Nervenschutz). Öffnet die Brust und verhindert jedes Vorbeugen."
      },
      {
        id: "bondage_unrestrained_will",
        title: "🧎 Reine Gehorsams-Arretierung ohne Seile",
        desc: "Keine physischen Fesseln. Die Hände bleiben auf den Kopf verschränkt; jede Regung gilt als Regelbruch.",
        execution: "Der Top kontrolliert die Disziplin über den Raum. Bewegt der Bottom eine Hand, wird die Einheit sofort pausiert und korrigiert."
      }
    ];
  }

  function getSensoryPool() {
    return [
      {
        id: "sensory_blindfold",
        title: "🙈 Vollständiger Sehentzug (Augenbinde)",
        desc: "Die Augen werden lichtdicht verbunden. Steigert die Erwartungsspannung und die Fokussierung auf akustische Signale.",
        execution: "Sitz der Binde prüfen. Vor jedem Reiz bewusst kurze akustische Signale setzen (z. B. Ledergeräusch, kurzes Wort), um Schreckreflexe zu dosieren."
      },
      {
        id: "sensory_cloth_gag",
        title: "🤐 Tuchknebel zur Sprechdämpfung",
        desc: "Ein gefaltetes Baumwolltuch wird zwischen die Zahnreihen gelegt und am Hinterkopf locker verknotet.",
        execution: "Nase muss vollständig frei sein. Nonverbales Notsignal (z. B. Gegenstand fallen lassen oder Doppelklopfen mit Fuß) vorab testen."
      },
      {
        id: "sensory_forced_eye_contact",
        title: "👁️ Ununterbrochener Blickkontakt zum Top",
        desc: "Keine Maske. Der Bottom muss während der gesamten Durchführung den Blick fest in den Augen des Tops halten.",
        execution: "Wegschauen oder Augen schließen gilt als Ausweichversuch. Bei Blickkontaktverlust wird der Rhythmus sofort angehalten."
      }
    ];
  }

  function getStageOptions(stage) {
    var topName = (window.names && window.names[window.topPartner]) || 'Top';
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';

    var pool = [];
    if (stage === 1) pool = getMasterActionPool(subName, topName);
    else if (stage === 2) pool = getPosturePool();
    else if (stage === 3) pool = getBondagePool();
    else if (stage === 4) pool = getSensoryPool();

    var discarded = wizardState.discardedIds[stage] || [];
    var filtered = pool.filter(function(item) {
      return discarded.indexOf(item.id) === -1;
    });

    if (filtered.length === 0) {
      wizardState.discardedIds[stage] = [];
      filtered = pool;
    }

    return filtered.slice(0, 3);
  }

  function rerollStage() {
    var stage = wizardState.currentStage;
    var currentOptions = getStageOptions(stage);

    currentOptions.forEach(function(opt) {
      if (wizardState.discardedIds[stage].indexOf(opt.id) === -1) {
        wizardState.discardedIds[stage].push(opt.id);
      }
    });

    wizardState.selectedChoices[stage] = null;
    renderStageCards(stage);
    validateCurrentPhysicalSetup();
    showToast("Neu gewürfelt 🎲");
  }

  async function generateAiDisciplineSequence() {
    var apiKey = getGeminiApiKey();
    if (!apiKey) {
      showToast("⚠️ Bitte trage zuerst einen Gemini API-Key in den Einstellungen ein.");
      return;
    }

    var topName = (window.names && window.names[window.topPartner]) || 'Top';
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
    var reason = (wizardState.reason && wizardState.reason.trim()) || 'Allgemeine Unaufmerksamkeit / Regelgrenze getestet';
    var catInfo = INFRACTION_MAP[wizardState.category]?.label || 'Fehlverhalten';

    var rawOwned = (window.HubToys && typeof window.HubToys.getOwnedIds === 'function') ? window.HubToys.getOwnedIds() : [];
    var catalog = window.equipmentCatalog || [];
    var availableTools = [];
    rawOwned.forEach(function(id) {
      var found = catalog.find(function(c) { return c.id === id; });
      if (found) availableTools.push(found);
    });

    var semanticBriefing = (window.ToyCombinatorics && typeof window.ToyCombinatorics.generateAiPromptBriefing === 'function')
      ? window.ToyCombinatorics.generateAiPromptBriefing(availableTools)
      : "Ausrüstung: Flache Hand, Ledergürtel, Bettkante, Kissen";

    var aiBtn = document.getElementById('btn-ai-consult-discipline');
    if (aiBtn) {
      aiBtn.innerHTML = "<span>⏳</span><span>Berechne Disziplinar-Sequenz...</span>";
      aiBtn.classList.add('animate-pulse');
    }

    var prompt = `Du bist ein erfahrener, psychologisch fundierter BDSM-Regisseur und Szenenanalytiker.
Erstelle für zwei einvernehmliche Erwachsene eine ernsthafte, fokussierte und maßgeschneiderte Disziplinar-Sequenz.

BETEILIGTE:
- Führender Top: ${topName}
- Empfangender Bottom: ${subName}
- Anlass / Regelverstoß: „${reason}“ (Bereich: ${catInfo})

VORHANDENES SCHRANK-INVENTAR:
${semanticBriefing}

WICHTIGE ANWEISUNGEN ZUM TONFALL & ZUR LOGIK:
- Kein Kitsch, keine schwülstigen Märchenonkel-Floskeln ("Holdes Fräulein", "Zucht-Meister", "demütige Magd").
- Ernsthafter, direkter und moderner BDSM-Kontext zwischen erwachsenen Partnern.
- Für jede Zahl (Schläge, Wiederholungen, Minuten) MUSS eine sinnvolle somatische oder psychologische Rationale angegeben werden (z. B. warum 15 Schläge und nicht 3 oder 87? Laktatschwelle, Kapillardurchblutung, Aufmerksamkeitsfokus).
- Liefere für jedes Element eine konkrete Arbeitsanweisung für den Top ("execution"), damit der Top exakt weiß, wie er körperlich vorgehen muss.

Antworte AUSSCHLIESSLICH als valides JSON:
{
  "action": {
    "title": "Präziser Titel der Maßnahme (inkl. Stückzahl/Dauer)",
    "rationale": "Sinnvolle Begründung der Zahl/Dauer (z. B. Kapillardurchblutung, Endorphinschwelle, Laktat) in 1-2 Sätzen",
    "desc": "Was getan wird in 1-2 klaren Sätzen",
    "execution": "Genaue Arbeitsanweisung für den Top (Trefferzone, Rhythmus, Sicherheitskontrolle)"
  },
  "posture": {
    "title": "Name der Haltung",
    "desc": "Positionierung des Körpers",
    "execution": "Worauf der Top bei der Haltung achten und was er korrigieren muss"
  },
  "bondage": {
    "title": "Art der Begrenzung/Fesselung",
    "desc": "Wie die Arretierung erfolgt",
    "execution": "Sicherheits- und Nervenschutz-Hinweis für den Top"
  },
  "sensory": {
    "title": "Sensorische Kontrolle",
    "desc": "Blick, Maske oder Knebel",
    "execution": "Arbeitsanweisung für den Top zur Sinnesführung"
  },
  "spoken_command": "Ein autoritärer, klarer Satz von ${topName} an ${subName} (direkt, fokussiert, ohne Kitsch)"
}`;

    var candidateModels = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-2.5-flash'];
    var resultData = null;

    for (var i = 0; i < candidateModels.length; i++) {
      try {
        var resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + candidateModels[i] + ":generateContent?key=" + encodeURIComponent(apiKey), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
          })
        });

        if (resp.ok) {
          var resJson = await resp.json();
          var rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          resultData = JSON.parse(rawText);
          if (resultData?.action?.title && resultData?.posture?.title) break;
        }
      } catch (e) {}
    }

    if (aiBtn) {
      aiBtn.innerHTML = "<span>✨</span><span>KI-Disziplinar-Vorschlag berechnen</span>";
      aiBtn.classList.remove('animate-pulse');
    }

    if (resultData && resultData.action) {
      wizardState.selectedChoices[1] = {
        id: "ai_action",
        title: resultData.action.title,
        rationale: resultData.action.rationale,
        desc: resultData.action.desc,
        execution: resultData.action.execution,
        ratingBadge: "✨ KI-Maßanfertigung"
      };
      wizardState.selectedChoices[2] = {
        id: "ai_posture",
        title: resultData.posture.title,
        desc: resultData.posture.desc,
        execution: resultData.posture.execution
      };
      wizardState.selectedChoices[3] = {
        id: "ai_bondage",
        title: resultData.bondage.title,
        desc: resultData.bondage.desc,
        execution: resultData.bondage.execution
      };
      wizardState.selectedChoices[4] = {
        id: "ai_sensory",
        title: resultData.sensory.title,
        desc: resultData.sensory.desc,
        execution: resultData.sensory.execution
      };
      wizardState.aiSpokenCommand = resultData.spoken_command;

      showStage(5);
      showToast("✨ Disziplinar-Sequenz mit Arbeitsanweisungen erstellt!");
    } else {
      showToast("⚠️ Verbindung fehlgeschlagen. Bitte Auswahl manuell treffen.");
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
          ${opt.rationale ? `<p class="text-[10px] text-amber-300/90 mt-1 italic font-normal">Begründung: ${escapeText(opt.rationale)}</p>` : ''}
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
    var isHandsBoundBehind = (bondage && (bondage.id === 'bondage_cuffs_back' || bondage.id === 'bondage_elbows_aligned'));

    if (isSelfSpank && isHandsBoundBehind) {
      if (warnBanner) warnBanner.classList.remove('hidden');
      if (warnText) warnText.innerText = "Konflikt: Hände sind hinten arretiert – Selbstschläge unmöglich. Wähle eine andere Fesselung oder lass den Top schlagen.";
      return;
    }

    if (warnBanner) warnBanner.classList.add('hidden');
  }

  function renderDisciplineSummary() {
    var container = document.getElementById('summary-discipline-breakdown');
    if (!container) return;

    var c1 = wizardState.selectedChoices[1] || {};
    var c2 = wizardState.selectedChoices[2] || {};
    var c3 = wizardState.selectedChoices[3] || {};
    var c4 = wizardState.selectedChoices[4] || {};

    var reason = (wizardState.reason && wizardState.reason.trim()) || 'Verstoß gegen Schlafzimmer-Regeln';
    var spokenCmd = wizardState.aiSpokenCommand || '';

    container.innerHTML = `
      <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-3.5">
        <div class="border-b border-slate-800 pb-2">
          <strong class="text-amber-300">Anlass & Rahmen:</strong>
          <span class="text-white block mt-0.5">${escapeText(reason)}</span>
        </div>

        <!-- 1. MASSNAHME -->
        <div class="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-brand-900/40">
          <strong class="text-brand-300 block text-xs">1. Maßnahme: ${escapeText(c1.title || 'Maßnahme')}</strong>
          <p class="text-slate-300 text-[11px] leading-snug">${escapeText(c1.desc || '')}</p>
          ${c1.rationale ? `<p class="text-[10.5px] text-amber-300/90 leading-tight"><strong>Rationale:</strong> ${escapeText(c1.rationale)}</p>` : ''}
          ${c1.execution ? `<p class="text-[10.5px] text-slate-400 border-t border-slate-800/80 pt-1 mt-1 leading-snug"><strong class="text-slate-300">Arbeitsanweisung für den Top:</strong> ${escapeText(c1.execution)}</p>` : ''}
        </div>

        <!-- 2. HALTUNG -->
        <div class="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-indigo-900/40">
          <strong class="text-indigo-300 block text-xs">2. Haltung: ${escapeText(c2.title || 'Haltung')}</strong>
          <p class="text-slate-300 text-[11px] leading-snug">${escapeText(c2.desc || '')}</p>
          ${c2.execution ? `<p class="text-[10.5px] text-slate-400 border-t border-slate-800/80 pt-1 mt-1 leading-snug"><strong class="text-slate-300">Ausführung:</strong> ${escapeText(c2.execution)}</p>` : ''}
        </div>

        <!-- 3. FESSELUNG -->
        <div class="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-teal-900/40">
          <strong class="text-teal-300 block text-xs">3. Fesselung & Arretierung: ${escapeText(c3.title || 'Fesselung')}</strong>
          <p class="text-slate-300 text-[11px] leading-snug">${escapeText(c3.desc || '')}</p>
          ${c3.execution ? `<p class="text-[10.5px] text-slate-400 border-t border-slate-800/80 pt-1 mt-1 leading-snug"><strong class="text-slate-300">Sicherheitskontrolle:</strong> ${escapeText(c3.execution)}</p>` : ''}
        </div>

        <!-- 4. SENSORIK -->
        <div class="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-purple-900/40">
          <strong class="text-purple-300 block text-xs">4. Sensorik: ${escapeText(c4.title || 'Sensorik')}</strong>
          <p class="text-slate-300 text-[11px] leading-snug">${escapeText(c4.desc || '')}</p>
          ${c4.execution ? `<p class="text-[10.5px] text-slate-400 border-t border-slate-800/80 pt-1 mt-1 leading-snug"><strong class="text-slate-300">Führung:</strong> ${escapeText(c4.execution)}</p>` : ''}
        </div>

        ${spokenCmd ? `
          <div class="p-3 rounded-xl bg-purple-950/40 border border-purple-800 text-[11px] text-purple-200 mt-2">
            <strong class="text-purple-300 block mb-0.5">🗣️ Anweisung des Tops an den Bottom:</strong>
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
    if (btnNext) btnNext.innerText = (stage === 5) ? "Protokoll übernehmen ✓" : "Weiter →";

    injectAiAndRerollButtons();

    if (stage === 5) renderDisciplineSummary();
    else renderStageCards(stage);
  }

  function injectAiAndRerollButtons() {
    var stage1 = document.getElementById('wizard-stage-1');
    if (stage1 && !document.getElementById('btn-ai-consult-discipline')) {
      var btnAi = document.createElement('button');
      btnAi.type = 'button';
      btnAi.id = 'btn-ai-consult-discipline';
      btnAi.className = 'w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-900 to-brand-800 hover:from-purple-800 hover:to-brand-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 touch-btn shadow-md my-1';
      btnAi.innerHTML = '<span>✨</span><span>KI-Disziplinar-Vorschlag berechnen</span>';
      btnAi.onclick = generateAiDisciplineSequence;
      stage1.insertBefore(btnAi, stage1.children[2]);
    }

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
    var act = (wizardState.selectedChoices[1] && wizardState.selectedChoices[1].title) || 'Disziplinierungsmaßnahme angeordnet';
    var nowTime = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    if (window.currentSessionLog && Array.isArray(window.currentSessionLog)) {
      window.currentSessionLog.push({ type: "action", time: nowTime, label: "Disziplin: " + act });
    }

    closeModal();
    showToast("Disziplinierungsmaßnahme protokolliert ⚖️");

    if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      var speech = wizardState.aiSpokenCommand || ("Anordnung erteilt. " + act + ". Sofort einnehmen und stillhalten.");
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
    consultAi: generateAiDisciplineSequence,
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
