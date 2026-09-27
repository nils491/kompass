/**
 * data/toy_combinatorics.js
 * Semantische Klassifikations- und Kombinations-Engine für Spielzeuge, Haushaltsmittel und BDSM-Praktiken.
 * 
 * Verhindert Verwechslungen (z. B. Womanizer/Vibrator als Fessel oder Schlagwerkzeug)
 * und liefert präzise funktionale Rollen (Überstimulation, Edging, Arretierung,
 * Impact, Klammern, Sinnesentzug, anale Dehnung, thermische Kontraste).
 */

(function(window) {
  'use strict';

  var TOY_TAXONOMY = {
    clitoral_suction: {
      label: "Klitoris-Druckwellen / Sauger",
      keywords: ["womanizer", "satisfyer", "druckwelle", "sauger", "air", "romp", "clit suction"],
      role: "stimulation_overstimulation",
      usage: "Punktgenaue Klitoris-Reizung, erzwungenes Edging, Überstimulations-Zucht nach Orgasmus, Orgasmusabbruch (Ruined Orgasm).",
      forbiddenAs: ["bondage", "impact", "gag", "anal"]
    },
    vibrator: {
      label: "Vibrator / Magic Wand / Bullet",
      keywords: ["vibrator", "wand", "magic wand", "bullet", "vibro", "auflegevibrator", "dildo-vibrator", "rabbit"],
      role: "stimulation_vibration",
      usage: "Flächige oder punktuelle Vibration, Reizüberflutung an Klitoris, Penis oder Brustwarzen, Qual des Aufschubs.",
      forbiddenAs: ["bondage", "impact", "gag"]
    },
    impact: {
      label: "Impact- & Schlagwerkzeuge",
      keywords: ["flogger", "paddle", "gerte", "reitgerte", "peitsche", "gürtel", "hand", "rohrstock", "spanking", "klatsche", "strap"],
      role: "impact_spanking",
      usage: "Rhythmische Treffer auf fleischige Partien (Gesäß, Oberschenkel), Zucht mit Mitzählen, Hauterwärmung.",
      forbiddenAs: ["bondage", "gag", "stimulation_clitoral", "anal"]
    },
    bondage: {
      label: "Fesselung & Arretierung",
      keywords: ["seil", "shibari", "hanfseil", "juteseil", "manschette", "handschelle", "fessel", "cuffs", "krawatte", "schal", "spreizstange"],
      role: "bondage_restriction",
      usage: "Fixierung der Hände hinter dem Rücken, Box Tie (Takate Kote), Schenkelspreizung, Arretierung an Möbeln.",
      forbiddenAs: ["impact", "stimulation_clitoral", "gag", "anal"]
    },
    clamps: {
      label: "Klammern & Kneifen",
      keywords: ["klammer", "wäscheklammer", "nippelklammer", "clover", "klemme", "klemmen", "gewichte"],
      role: "pinch_clamps",
      usage: "Dauerhafter Druck an Brustwarzen oder Schamlippen, Schmerz-Lust-Kontrast, Schwellenquälerei.",
      forbiddenAs: ["bondage", "gag", "impact"]
    },
    sensory_deprivation: {
      label: "Sinnesentzug (Sehen)",
      keywords: ["augenbinde", "maske", "schlafmaske", "blindfold", "tuch über kopf", "brille"],
      role: "sensory_sight",
      usage: "Vollständiges Ausschalten des Sehsinn, Steigerung der Erwartungsangst und Berührungssensibilität.",
      forbiddenAs: ["bondage", "impact", "gag"]
    },
    sensory_gag: {
      label: "Knebel & Stummschaltung",
      keywords: ["knebel", "gag", "ballgag", "ringknebel", "tuchknebel", "knebelband"],
      role: "sensory_speech",
      usage: "Offenhalten des Kiefers, Stummschaltung, symbolische Hilflosigkeit, Dämpfung von Protest.",
      forbiddenAs: ["bondage", "impact", "stimulation_clitoral"]
    },
    anal: {
      label: "Anale Toys & Plugs",
      keywords: ["plug", "buttplug", "analkugeln", "analplug", "glasplug", "dildo"],
      role: "anal_filling",
      usage: "Ausfüllendes Gefühl während Zucht oder Kniestand, Schließmuskel-Fokus, Demutshaltung.",
      forbiddenAs: ["bondage", "gag", "impact"]
    },
    thermal: {
      label: "Thermische Reize (Kälte / Wärme)",
      keywords: ["eis", "eiswürfel", "kerze", "wachs", "massagekerze", "wärme", "kältepack"],
      role: "sensory_thermal",
      usage: "Kontrastreize zu warmen Schlägen, Gänsehaut über empfindliche Körperzonen, Wachs-Sensibilisierung.",
      forbiddenAs: ["bondage", "gag"]
    },
    household: {
      label: "Haushaltsanker & Möbel",
      keywords: ["bett", "bettkante", "wand", "boden", "spiegel", "stuhl", "hocker", "kissen", "lippenstift"],
      role: "posture_environment",
      usage: "Positionierung für Vorbeuge, Wandhocke (Wall-Sit), Spiegelzwang, Nadu-Kniestand.",
      forbiddenAs: []
    }
  };

  function classifyToy(toyOrName) {
    var rawName = "";
    var rawDesc = "";
    if (typeof toyOrName === 'string') {
      rawName = toyOrName;
    } else if (toyOrName && typeof toyOrName === 'object') {
      rawName = toyOrName.name || toyOrName.title || toyOrName.id || "";
      rawDesc = toyOrName.desc || "";
    }

    var textCombined = (rawName + " " + rawDesc).toLowerCase();
    var detectedTypes = [];

    for (var key in TOY_TAXONOMY) {
      var item = TOY_TAXONOMY[key];
      for (var i = 0; i < item.keywords.length; i++) {
        var kw = item.keywords[i];
        if (textCombined.indexOf(kw) !== -1) {
          detectedTypes.push(key);
          break;
        }
      }
    }

    if (detectedTypes.length === 0) {
      if (textCombined.indexOf("hand") !== -1 || textCombined.indexOf("körper") !== -1) {
        detectedTypes.push("impact");
        detectedTypes.push("household");
      } else {
        detectedTypes.push("household");
      }
    }

    var primaryType = detectedTypes[0];
    return {
      rawName: rawName,
      primaryType: primaryType,
      allTypes: detectedTypes,
      info: TOY_TAXONOMY[primaryType] || TOY_TAXONOMY.household,
      isSuction: detectedTypes.indexOf('clitoral_suction') !== -1,
      isVibrator: detectedTypes.indexOf('vibrator') !== -1 || detectedTypes.indexOf('clitoral_suction') !== -1,
      isImpact: detectedTypes.indexOf('impact') !== -1,
      isBondage: detectedTypes.indexOf('bondage') !== -1,
      isClamps: detectedTypes.indexOf('clamps') !== -1,
      isSensoryDeprivation: detectedTypes.indexOf('sensory_deprivation') !== -1,
      isGag: detectedTypes.indexOf('sensory_gag') !== -1,
      isAnal: detectedTypes.indexOf('anal') !== -1,
      isThermal: detectedTypes.indexOf('thermal') !== -1
    };
  }

  function buildSemanticClosetSummary(ownedOrStagedToyList) {
    var list = ownedOrStagedToyList || [];
    var categories = {
      clitoral_suction: [],
      vibrator: [],
      impact: [],
      bondage: [],
      clamps: [],
      sensory_deprivation: [],
      sensory_gag: [],
      anal: [],
      thermal: [],
      household: []
    };

    list.forEach(function(toy) {
      var c = classifyToy(toy);
      c.allTypes.forEach(function(t) {
        if (categories[t] && categories[t].indexOf(c.rawName) === -1) {
          categories[t].push(c.rawName);
        }
      });
    });

    return categories;
  }

  function generateAiClosetBriefing(ownedOrStagedToyList) {
    var sem = buildSemanticClosetSummary(ownedOrStagedToyList);
    var lines = [];

    if (sem.clitoral_suction.length > 0) {
      lines.push("- DRUCKWELLEN-STIMULATOREN (z. B. " + sem.clitoral_suction.join(', ') + "): Ausschließlich zur punktgenauen Klitoris-Stimulation, Überstimulations-Zucht, erzwungenem Edging oder Ruined Orgasm. NIEMALS als Fessel oder Schlagwerkzeug!");
    }
    if (sem.vibrator.length > 0) {
      lines.push("- VIBRATOREN (z. B. " + sem.vibrator.join(', ') + "): Für erotische Reizüberflutung an Genitalien oder Brustwarzen, Lustquälerei während der Bottom stillhalten muss.");
    }
    if (sem.bondage.length > 0) {
      lines.push("- FESSELUNGS-WERKZEUGE (z. B. " + sem.bondage.join(', ') + "): Zur physischen Arretierung von Händen, Schenkeln oder am Mobiliar.");
    }
    if (sem.impact.length > 0) {
      lines.push("- IMPACT-WERKZEUGE (z. B. " + sem.impact.join(', ') + "): Ausschließlich für Schläge/Spanking auf Gesäß und Oberschenkel.");
    }
    if (sem.clamps.length > 0) {
      lines.push("- KLAMMERN (z. B. " + sem.clamps.join(', ') + "): An Brustwarzen oder Schamlippen zur Steigerung der Schmerz-Lust-Spannung.");
    }
    if (sem.sensory_deprivation.length > 0) {
      lines.push("- AUGENBINDEN / MASKEN: Schaltet den Sehsinn aus für maximale Erwartungshaltung.");
    }
    if (sem.sensory_gag.length > 0) {
      lines.push("- KNEBEL: Erzwingt Demut und Stummschaltung.");
    }
    if (sem.anal.length > 0) {
      lines.push("- ANALE TOYS (z. B. " + sem.anal.join(', ') + "): Für ausfüllenden Druck während Haltungsübungen oder Spanking.");
    }
    if (sem.thermal.length > 0) {
      lines.push("- THERMISCHE ELEMENTE (z. B. " + sem.thermal.join(', ') + "): Für Kälte-Hitze-Kontraste auf geröteter Haut.");
    }

    if (lines.length === 0) {
      lines.push("- Nackte Hände, Körpergewicht, Bettkante, Fußboden, Krawatte/Gürtel als Alltags-Improvisation.");
    }

    return lines.join("\n");
  }

  function getSmartCombinations(stagedToyList, topName, subName, subAnatomy) {
    var sem = buildSemanticClosetSummary(stagedToyList);
    var combos = [];
    var isVulva = (subAnatomy === 'vulva');

    var hasSuction = sem.clitoral_suction.length > 0;
    var hasVibro = sem.vibrator.length > 0 || hasSuction;
    var hasBondage = sem.bondage.length > 0;
    var hasImpact = sem.impact.length > 0;
    var hasClamps = sem.clamps.length > 0;
    var hasBlindfold = sem.sensory_deprivation.length > 0;
    var hasGag = sem.sensory_gag.length > 0;
    var hasThermal = sem.thermal.length > 0;

    var suctionName = hasSuction ? sem.clitoral_suction[0] : (hasVibro ? sem.vibrator[0] : "Reizquelle");
    var bondageName = hasBondage ? sem.bondage[0] : "Krawatte oder Seidenschal";
    var impactName = hasImpact ? sem.impact[0] : "die flache Hand oder ein Ledergürtel";

    // KOMBINATION 1: WOMANIZER / VIBRATOR + WEHRLOSE FESSELUNG (Überstimulation)
    if (hasVibro) {
      var vibDesc = isVulva
        ? subName + " wird mit " + bondageName + " wehrlos fixiert. " + topName + " setzt den " + suctionName + " auf die empfindliche Klitoris. Bei beginnenden Zuckungen stoppt " + topName + " oder dreht die Stufe hoch – " + subName + " darf sich nicht entziehen."
        : subName + " wird arretiert. " + topName + " führt mit dem " + suctionName + " eine fordernde Reizung bis knapp vor den Höhepunkt durch und verbietet jedes Vorstoßen.";

      combos.push({
        id: "combo_vibration_restraint",
        title: "⚡ Wehrlose Überstimulation (" + suctionName + " & " + bondageName + ")",
        desc: vibDesc,
        ratingBadge: "🎢 Somatische Reizüberflutung",
        requiredTypes: ["vibrator", "bondage"]
      });
    }

    // KOMBINATION 2: IMPACT + KLAMMERN (Schmerz-Lust-Fokus)
    if (hasClamps) {
      combos.push({
        id: "combo_clamps_spank",
        title: "🔥 Klammern-Arretierung & " + impactName,
        desc: "Klammern an den Brustwarzen setzen dauerhaften pulsierenden Zug. Währenddessen verabreicht " + topName + " 15 gezielte Treffer mit " + impactName + " auf das Gesäß.",
        ratingBadge: "⚖️ Dualer Reizfokus",
        requiredTypes: ["clamps", "impact"]
      });
    }

    // KOMBINATION 3: BLINDFOLD + THERMAL / IMPACT
    if (hasBlindfold) {
      combos.push({
        id: "combo_sensory_contrast",
        title: "🙈 Blindes Ausgeliefertsein & Sensorische Kontraste",
        desc: subName + " trägt eine Augenbinde. Ohne Vorwarnung wechseln eiskalte Streichungen und scharfe Schläge mit " + impactName + ". Jeder Reiz trifft unangekündigt.",
        ratingBadge: "❄️🔥 Sensorische Disziplin",
        requiredTypes: ["sensory_deprivation", "impact"]
      });
    }

    // KOMBINATION 4: RUINED ORGASM MIT VIBRATION / WOMANIZER
    if (hasVibro) {
      combos.push({
        id: "combo_suction_ruined",
        title: "🥀 Disziplinarischer Ruined Orgasm (" + suctionName + ")",
        desc: topName + " treibt " + subName + " mit dem " + suctionName + " präzise an den Point of no Return. Beim ersten Krampfen zieht " + topName + " das Toy weg: Der Höhepunkt verpufft ergebnislos.",
        ratingBadge: "🔒 Totale Orgasmuskontrolle",
        requiredTypes: ["vibrator"]
      });
    }

    return combos;
  }

  window.ToyCombinatorics = {
    taxonomy: TOY_TAXONOMY,
    classifyToy: classifyToy,
    buildSummary: buildSemanticClosetSummary,
    generateAiPromptBriefing: generateAiClosetBriefing,
    getCombinations: getSmartCombinations
  };

})(window);
