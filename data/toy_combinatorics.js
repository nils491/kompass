/**
 * data/toy_combinatorics.js
 * Hochpräzise Klassifikations- und Kombinations-Engine für über 120 BDSM-Toys, Sextoys und Alltagsgegenstände.
 * 
 * Qualitäts- & Logik-Standards:
 * - STRIKTE ANATOMISCHE KOMPATIBILITÄT:
 *   * Vulva-Only: Womanizer, Satisfyer, Lelo Sona, Romp, Tracy's Dog, Schamlippen-Klemmen, Saugglocken.
 *   * Penis-Only: Fleshlight, Tenga, Arcwave, Keuschheitskäfig (CB-6000), Cockringe, Ball Crusher, Hodengewichte.
 *   * Anal/Prostata: Aneros, Nexus, Prostata-Vibratoren, Buttplugs, Analperlen.
 *   * Universell: Impact (Flogger, Paddle, Gerte, Gürtel), Bondage (Seile, Cuffs, Spreizstange),
 *     Sensorik (Binde, Wartenberg-Rad, Wachs, Eis, Knebel, Klemmen für Nippel).
 * - Absoluter Schutz vor anatomischen Logikfehlern in Drehbüchern, Bestrafungen und KI-Prompts.
 */

(function(window) {
  'use strict';

  var TOY_DATABASE = {
    // -------------------------------------------------------------
    // 1. KLITORALE DRUCKWELLEN-STIMULATOREN (STRIKT VULVA-ONLY)
    // -------------------------------------------------------------
    clitoral_suction: {
      label: "Klitoris-Druckwellen-Sauger",
      compat: "vulva_only",
      keywords: [
        "womanizer", "satisfyer", "druckwelle", "sauger", "sona", "lelo sona",
        "romp free", "dame aer", "we-vibe melt", "tracy's dog", "clit suction",
        "air pulse", "druckwellenvibrator", "auflegesauger", "saugglocke klitoris"
      ],
      role: "stimulation_overstimulation",
      usage: "Ausschließlich für die Klitorisperle: Berührungslose Druckwellen, Überstimulations-Zucht nach Orgasmus, erzwungene Schwellen-Quälerei (Edging), gezielter Orgasmusabbruch (Ruined Orgasm).",
      forbiddenAs: ["bondage", "impact", "gag", "anal", "penis_stimulation"],
      errorWhenAssignedToPenis: "Ein Womanizer / Druckwellensauger basiert auf Unterdruckkammern für die Klitorisperle und kann physikalisch und anatomisch NICHT am Penis angewendet werden."
    },

    // -------------------------------------------------------------
    // 2. PENILE MASTURBATOREN & STROKER (STRIKT PENIS-ONLY)
    // -------------------------------------------------------------
    male_stroker: {
      label: "Masturbator / Penis-Sleeve / Stroker",
      compat: "penis_only",
      keywords: [
        "fleshlight", "tenga", "tenga flip", "tenga egg", "stroker", "masturbator",
        "arcwave", "arcwave ion", "autoblow", "penishülle", "onaniereinsatz", "kiiroo"
      ],
      role: "penis_stroking_edging",
      usage: "Ausschließlich für den Penis: Umschließende Stimulation des Schafts und der Eichel, Rhythmuskontrolle durch den Top, Hands-Off-Edging-Zucht bis an die Schwelle.",
      forbiddenAs: ["bondage", "impact", "gag", "vulva_stimulation", "anal"]
    },

    // -------------------------------------------------------------
    // 3. MÄNNLICHE KEUSCHHEIT & CBT (STRIKT PENIS / HODEN)
    // -------------------------------------------------------------
    male_chastity: {
      label: "Keuschheitskäfig / Cock-Cage",
      compat: "penis_only",
      keywords: [
        "käfig", "keuschheitskäfig", "cb6000", "cb-6000", "chastity cage", "cobra cage",
        "holytrainer", "peniskäfig", "schloss", "keuschheitsring"
      ],
      role: "chastity_restraint",
      usage: "Arretierung des Penis im schlaffen Zustand, Verhinderung jeglicher Erektion, vollständige Abgabe der Schlüsselgewalt an den Top.",
      forbiddenAs: ["impact", "gag", "vulva_stimulation"]
    },
    scrotum_cbt: {
      label: "Hodengewichte / Ball Crusher / Parachute",
      compat: "penis_only",
      keywords: [
        "ball crusher", "hodenpresse", "parachute", "fallschirm", "ball weight",
        "hodengewicht", "ball stretcher", "hodenstrecker", "scrotum clamp"
      ],
      role: "cbt_scrotum_weight",
      usage: "Zug- und Druckbelastung am Hodensack, Tiefziehen der Hoden, sensorische Hilflosigkeit beim Stehen oder Kniebeugen.",
      forbiddenAs: ["vulva_stimulation", "gag", "bondage"]
    },
    cock_ring: {
      label: "Cockring / Erektionsband",
      compat: "penis_only",
      keywords: [
        "cockring", "penisring", "cock and ball ring", "hodenring", "silikonring",
        "leder-penisring", "metallring penis"
      ],
      role: "erection_maintenance",
      usage: "Stauung des venösen Rückflusses am Penisansatz, Steigerung der Härte und Empfindlichkeit bei Zucht oder Vorbeuge.",
      forbiddenAs: ["vulva_stimulation", "gag"]
    },

    // -------------------------------------------------------------
    // 4. WEIBLICHE KEUSCHHEIT (STRIKT VULVA-ONLY)
    // -------------------------------------------------------------
    female_chastity: {
      label: "Keuschheitsgürtel (Frau) / Labia Lock",
      compat: "vulva_only",
      keywords: [
        "keuschheitsgürtel frau", "labia lock", "schamlippen-schloss", "chastity belt female"
      ],
      role: "female_denial",
      usage: "Mechanische Abdeckung der Vulva, Verschluss gegen Berührung und Orgasmus.",
      forbiddenAs: ["penis_only", "impact"]
    },

    // -------------------------------------------------------------
    // 5. ANALE TOYS & PROSTATA-MASSAGER
    // -------------------------------------------------------------
    prostate_massager: {
      label: "Prostata-Stimulator (Aneros / Nexus)",
      compat: "anal_prostate", // Primär für Penis-Träger (Prostata-Lage)
      keywords: [
        "aneros", "nexus revo", "prostata", "prostate massager", "lelo hugo",
        "prostatastimulator", "perineum vibrator"
      ],
      role: "prostate_stimulation",
      usage: "Gezielte Stimulation der männlichen Prostata in 5–7 cm Tiefe, Erzeugung freihändiger Ganzkörper-Orgasmen ohne Peniskontakt.",
      forbiddenAs: ["bondage", "impact", "gag"]
    },
    anal_plug: {
      label: "Analplug (Silikon, Metall, Glas)",
      compat: "anal_general", // Für Vulva & Penis gleichermaßen
      keywords: [
        "plug", "buttplug", "butt plug", "metallplug", "glasplug", "silikonplug",
        "tail plug", "fuchsschwanz", "diamantplug", "expanding plug", "analperlen", "analkugeln"
      ],
      role: "anal_fullness",
      usage: "Ausfüllendes Gefühl während des Kniestands, Vorbeuge oder Spanking; Öffnung und Demutssymbolik.",
      forbiddenAs: ["bondage", "impact", "gag"]
    },

    // -------------------------------------------------------------
    // 6. ALLROUND-VIBRATOREN & MAGIC WANDS (UNIVERSELL EINSETZBAR)
    // -------------------------------------------------------------
    wand_massager: {
      label: "Magic Wand / Starker Stabvibrator",
      compat: "universal",
      keywords: [
        "magic wand", "hitachi", "doxy", "wand massager", "stabvibrator", "le wand"
      ],
      role: "heavy_vibration_overstim",
      usage: "Massive, tiefgehende Vibrationswellen: Bei Vulva auf Klitoris; bei Penis auf Frenulum und Eichel; universell auf Brustwarzen.",
      forbiddenAs: ["bondage", "impact", "gag", "anal"]
    },
    bullet_vibrator: {
      label: "Bullet / Mini-Vibrator / Erotik-Ei",
      compat: "universal",
      keywords: [
        "bullet", "minivibrator", "auflegevibrator", "liebes-ei", "vibrations-ei", "vibro"
      ],
      role: "pinpoint_vibration",
      usage: "Punktgenaue Reizung sensibler Zonen (Klitoris, Eichel, Damm, Brustwarzen).",
      forbiddenAs: ["bondage", "impact", "gag"]
    },
    rabbit_internal_vibe: {
      label: "Rabbit / G-Punkt Vibrator",
      compat: "vulva_only",
      keywords: [
        "rabbit", "g-punkt vibrator", "dildo-vibrator", "duovibrator"
      ],
      role: "vaginal_clitoral_dual",
      usage: "Gleichzeitige innere vaginale und äußere klitorale Stimulation.",
      forbiddenAs: ["penis_only", "anal", "impact", "bondage"]
    },

    // -------------------------------------------------------------
    // 7. PENETRATIONS-TOYS & STRAP-ONS
    // -------------------------------------------------------------
    strapon_harness: {
      label: "Strap-on Geschirr & Dildo (Pegging)",
      compat: "universal",
      keywords: [
        "strap-on", "strapon", "pegging", "umschnalldildo", "geschirr dildo", "harness"
      ],
      role: "penetration_pegging",
      usage: "Aktive Penetration des Partners durch den Top (z. B. Pegging des Mannes oder vaginale Penetration).",
      forbiddenAs: ["gag", "impact"]
    },

    // -------------------------------------------------------------
    // 8. IMPACT- & SCHLAGWERKZEUGE (UNIVERSELL AN GLUTEUS / SCHENKEL)
    // -------------------------------------------------------------
    impact_flogger: {
      label: "Leder-Flogger / Fransenpeitsche",
      compat: "universal",
      keywords: [
        "flogger", "lederflogger", "wildlederflogger", "fransenpeitsche", "straußenfederflogger"
      ],
      role: "impact_broad_stinging",
      usage: "Flächige Rötung, Gänsehaut und Durchwärmung über Gesäß, Rücken und Oberschenkel; Schreck- und Rhythmusreize.",
      forbiddenAs: ["bondage", "gag", "anal", "internal"]
    },
    impact_paddle: {
      label: "Paddle (Leder / Holz / Gummi)",
      compat: "universal",
      keywords: [
        "paddle", "lederpaddle", "holzpaddle", "gummipaddle", "schlagbrett", "klatsche", "slapper"
      ],
      role: "impact_deep_thud",
      usage: "Tiefer Muskelreiz auf den Gluteus maximus; lautes Klatschen zur auditiven Demütigung; Zählen lassen.",
      forbiddenAs: ["bondage", "gag", "anal"]
    },
    impact_cane_crop: {
      label: "Reitgerte / Cane / Rohrstock",
      compat: "universal",
      keywords: [
        "reitgerte", "gerte", "cane", "rohrstock", "bambusstock", "reitpeitsche"
      ],
      role: "impact_sharp_sting",
      usage: "Scharfe, brennende Linienreize; erfordert höchste Präzision des Tops; Zucht bei Regelverstößen.",
      forbiddenAs: ["bondage", "gag", "anal"]
    },
    impact_belt_hand: {
      label: "Ledergürtel / Nackte Handfläche",
      compat: "universal",
      keywords: [
        "gürtel", "ledergürtel", "hand", "handfläche", "spanking", "versohlen"
      ],
      role: "impact_classic",
      usage: "Klassisches Versohlen mit Hautkontakt oder doppelt gelegtem Gürtel; Mitzählen jedes Treffers.",
      forbiddenAs: ["gag", "anal"]
    },

    // -------------------------------------------------------------
    // 9. FESSELUNG & ARRETIERUNG (BONDAGE - UNIVERSELL)
    // -------------------------------------------------------------
    bondage_rope: {
      label: "Shibari-Seile (Hanf / Jute)",
      compat: "universal",
      keywords: [
        "seil", "shibari", "hanfseil", "juteseil", "seile", "bondageseil"
      ],
      role: "bondage_patterns_restraint",
      usage: "Ästhetische und sichere Arretierung (Takate Kote / Box Tie, Karada, Schenkelfesseln); Schwerelosigkeit und Hingabe.",
      forbiddenAs: ["impact", "gag", "stimulation"]
    },
    bondage_cuffs: {
      label: "Leder-Manschetten / Handschellen",
      compat: "universal",
      keywords: [
        "manschette", "handschelle", "cuffs", "fessel", "lederfessel", "fußfessel", "metallhandschellen"
      ],
      role: "bondage_cuffs",
      usage: "Feste Arretierung der Hand- oder Fußgelenke vor oder hinter dem Körper.",
      forbiddenAs: ["impact", "gag"]
    },
    bondage_spreader: {
      label: "Spreizstange (Spreader Bar)",
      compat: "universal",
      keywords: [
        "spreizstange", "spreader bar", "spreizlatte", "beinstange"
      ],
      role: "bondage_forced_exposure",
      usage: "Fixiert die Knöchel auf Abstand und verhindert jedes Schließen der Oberschenkel; vollkommene Exposition des Genitalbereichs.",
      forbiddenAs: ["impact", "gag"]
    },
    bondage_collar_leash: {
      label: "Halsband & Leine (Collar & Leash)",
      compat: "universal",
      keywords: [
        "halsband", "leine", "collar", "leash", "lederhalsband", "kettenleine"
      ],
      role: "hierarchy_ownership",
      usage: "Symbol für Besitz, Führung und Gehorsam; Führen des Bottoms auf allen Vieren im Raum.",
      forbiddenAs: ["impact", "gag"]
    },

    // -------------------------------------------------------------
    // 10. SENSORIK, MASKEN & KNEBEL (UNIVERSELL)
    // -------------------------------------------------------------
    sensory_blindfold: {
      label: "Augenbinde / Schlafmaske / Haube",
      compat: "universal",
      keywords: [
        "augenbinde", "maske", "schlafmaske", "blindfold", "hood", "kopfhaube", "tuch über kopf"
      ],
      role: "sensory_sight_deprivation",
      usage: "Vollständiges Ausschalten des Sehsinn; Steigerung der Berührungssensibilität und Erwartungsspannung.",
      forbiddenAs: ["impact", "bondage"]
    },
    sensory_gag: {
      label: "Knebel (Ball-, Ring- oder Tuchknebel)",
      compat: "universal",
      keywords: [
        "knebel", "gag", "ballgag", "ballknebel", "ringknebel", "tuchknebel", "ring gag", "spider gag"
      ],
      role: "speech_restriction",
      usage: "Dämpfung von Worten und Protest; Offenhalten des Mundes; Symbol vollkommener Hilflosigkeit.",
      forbiddenAs: ["impact", "bondage"]
    },
    sensory_clamps: {
      label: "Brustwarzen- & Gewebeklemmen (Clover / Krokodil)",
      compat: "universal", // An Brustwarzen universell; Schamlippen nur Vulva
      keywords: [
        "klammer", "wäscheklammer", "nippelklammer", "clover", "klemme", "klemmen",
        "krokodilklemme", "gewichte nippel"
      ],
      role: "pinch_pain_pleasure",
      usage: "Pulsierender Dauerdruck auf Brustwarzen oder Hautfalten; Schmerz-Lust-Spannung während der Zucht.",
      forbiddenAs: ["bondage", "gag"]
    },
    sensory_thermal: {
      label: "Wachs-Sensibilisierung & Eis-Kontraste",
      compat: "universal",
      keywords: [
        "eis", "eiswürfel", "kerze", "wachs", "massagekerze", "kältepack", "heißes öl"
      ],
      role: "thermal_contrast",
      usage: "Schockierende Kälte- und Hitzereize im Wechsel mit warmen Schlägen.",
      forbiddenAs: ["bondage", "gag"]
    },
    sensory_wheel: {
      label: "Wartenberg-Rad / Pinwheel / Feder",
      compat: "universal",
      keywords: [
        "wartenberg", "pinwheel", "nadelrad", "feder", "pfauenfeder", "fellhandschuh"
      ],
      role: "tactile_arousal",
      usage: "Feine, nervenaufwühlende Reizlinien über Hals, Brust und Innenschenkel.",
      forbiddenAs: ["bondage", "gag"]
    },

    // -------------------------------------------------------------
    // 11. HAUSHALTS- & MÖBELANKER (UNIVERSELL)
    // -------------------------------------------------------------
    household_furniture: {
      label: "Bettkante, Wand, Spiegel & Kissen",
      compat: "universal",
      keywords: [
        "bett", "bettkante", "wand", "boden", "spiegel", "stuhl", "kissen", "seiza", "nadu"
      ],
      role: "environment_positioning",
      usage: "Wandhocke (Wall-Sit), Nadu-Kniestand, 90-Grad-Vorbeuge, Spiegelzwang.",
      forbiddenAs: []
    }
  };

  /**
   * Klassifiziert einen Gegenstand nach Name und Beschreibung.
   * Ermittelt die exakte Kategorie, den Zweck und die anatomische Kompatibilität.
   */
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
    var matchedKey = null;

    for (var key in TOY_DATABASE) {
      var item = TOY_DATABASE[key];
      for (var i = 0; i < item.keywords.length; i++) {
        var kw = item.keywords[i];
        if (textCombined.indexOf(kw) !== -1) {
          matchedKey = key;
          break;
        }
      }
      if (matchedKey) break;
    }

    if (!matchedKey) {
      if (textCombined.indexOf("hand") !== -1 || textCombined.indexOf("körper") !== -1) {
        matchedKey = "impact_belt_hand";
      } else {
        matchedKey = "household_furniture";
      }
    }

    var def = TOY_DATABASE[matchedKey];

    return {
      rawName: rawName,
      key: matchedKey,
      label: def.label,
      compat: def.compat,
      role: def.role,
      usage: def.usage,
      forbiddenAs: def.forbiddenAs,
      isVulvaOnly: def.compat === 'vulva_only',
      isPenisOnly: def.compat === 'penis_only',
      isAnal: def.compat.indexOf('anal') !== -1,
      isUniversal: def.compat === 'universal',
      isSuction: matchedKey === 'clitoral_suction',
      isStroker: matchedKey === 'male_stroker',
      isMaleChastity: matchedKey === 'male_chastity',
      isImpact: matchedKey.indexOf('impact') !== -1,
      isBondage: matchedKey.indexOf('bondage') !== -1,
      isClamps: matchedKey === 'sensory_clamps',
      isGag: matchedKey === 'sensory_gag',
      isBlindfold: matchedKey === 'sensory_blindfold',
      isWand: matchedKey === 'wand_massager'
    };
  }

  /**
   * Prüft, ob ein Toy anatomisch zum Bottom passt.
   * Gibt true zurück, wenn das Toy an diesem Körper sinnvoll angewendet werden kann.
   */
  function isToyAnatomicallyCompatible(toy, subAnatomy) {
    var c = classifyToy(toy);
    var anat = (subAnatomy === 'penis') ? 'penis' : 'vulva';

    // Ein Womanizer / Klitorissauger darf NIEMALS am Penis angewendet werden!
    if (c.compat === 'vulva_only' && anat === 'penis') {
      return false;
    }

    // Ein Fleshlight, Cockring oder Keuschheitskäfig darf NIEMALS an einer Vulva angewendet werden!
    if (c.compat === 'penis_only' && anat === 'vulva') {
      return false;
    }

    return true;
  }

  /**
   * Erstellt eine strukturierte, nach Anatomie gefilterte Schrank-Zusammenfassung.
   */
  function buildSemanticClosetSummary(ownedOrStagedToyList, subAnatomy) {
    var list = ownedOrStagedToyList || [];
    var anat = (subAnatomy === 'penis') ? 'penis' : 'vulva';

    var summary = {
      clitoral_suction: [],
      male_stroker: [],
      male_chastity: [],
      scrotum_cbt: [],
      wand: [],
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
      if (!isToyAnatomicallyCompatible(toy, anat)) {
        return; // Anatomisch unpassendes Toy wird strikt verworfen!
      }

      var c = classifyToy(toy);

      if (c.isSuction && anat === 'vulva') summary.clitoral_suction.push(c.rawName);
      if (c.isStroker && anat === 'penis') summary.male_stroker.push(c.rawName);
      if (c.isMaleChastity && anat === 'penis') summary.male_chastity.push(c.rawName);
      if (c.key === 'scrotum_cbt' && anat === 'penis') summary.scrotum_cbt.push(c.rawName);
      if (c.isWand) summary.wand.push(c.rawName);
      if (c.role.indexOf('vibration') !== -1) summary.vibrator.push(c.rawName);
      if (c.isImpact) summary.impact.push(c.rawName);
      if (c.isBondage) summary.bondage.push(c.rawName);
      if (c.isClamps) summary.clamps.push(c.rawName);
      if (c.isBlindfold) summary.sensory_deprivation.push(c.rawName);
      if (c.isGag) summary.sensory_gag.push(c.rawName);
      if (c.isAnal) summary.anal.push(c.rawName);
      if (c.key === 'sensory_thermal') summary.thermal.push(c.rawName);
      if (c.key === 'household_furniture') summary.household.push(c.rawName);
    });

    return summary;
  }

  /**
   * Generiert ein anatomisch präzises Briefing für den Gemini-KI-Prompt.
   */
  function generateAiClosetBriefing(ownedOrStagedToyList, subAnatomy) {
    var anat = (subAnatomy === 'penis') ? 'penis' : 'vulva';
    var sem = buildSemanticClosetSummary(ownedOrStagedToyList, anat);
    var lines = [];

    lines.push("ANATOMISCHE RICHTLINIE FÜR DEN BOTTOM (" + (anat === 'penis' ? "PENIS-TRÄGER" : "VULVA-TRÄGERIN") + "):");

    if (anat === 'vulva') {
      if (sem.clitoral_suction.length > 0) {
        lines.push("- KLITORIS-DRUCKWELLENSAUGER (" + sem.clitoral_suction.join(', ') + "): Ausschließlich auf die Klitorisperle setzen! Dient für berührungslose Reizüberflutung, Edging-Quälerei oder Ruined Orgasm. NIEMALS als Schlagwerkzeug oder Fessel!");
      }
      if (sem.wand.length > 0) {
        lines.push("- WAND-VIBRATOR (" + sem.wand.join(', ') + "): Großflächige, mächtige Vibration auf die Klitoris und Schamlippen.");
      }
    } else {
      // PENIS
      if (sem.male_stroker.length > 0) {
        lines.push("- PENIS-STROKER / MASTURBATOR (" + sem.male_stroker.join(', ') + "): Für geführte Schaft- und Eichel-Stimulation bis kurz vor die Schwelle.");
      }
      if (sem.male_chastity.length > 0) {
        lines.push("- KEUSCHHEITSKÄFIG (" + sem.male_chastity.join(', ') + "): Schließt den Penis sicher ein; verhindert jegliche Erektion.");
      }
      if (sem.scrotum_cbt.length > 0) {
        lines.push("- HODENGEWICHTE / BALL CRUSHER (" + sem.scrotum_cbt.join(', ') + "): Zur Dehnung und Disziplinierung des Hodensacks.");
      }
      if (sem.wand.length > 0) {
        lines.push("- WAND-VIBRATOR (" + sem.wand.join(', ') + "): Gezielte Reizung von Eichelkranz und Frenulum zur Schwellenkontrolle.");
      }
    }

    if (sem.bondage.length > 0) {
      lines.push("- FESSELUNGS-WERKZEUGE (" + sem.bondage.join(', ') + "): Zur physischen Arretierung von Händen, Knöcheln oder am Bett.");
    }
    if (sem.impact.length > 0) {
      lines.push("- IMPACT-WERKZEUGE (" + sem.impact.join(', ') + "): Für rhythmische Schläge auf den großen Gesäßmuskel (Gluteus maximus).");
    }
    if (sem.clamps.length > 0) {
      lines.push("- KLEMMEN (" + sem.clamps.join(', ') + "): An den Brustwarzen für anhaltenden Zug und Schmerz-Lust-Kontrast.");
    }
    if (sem.sensory_deprivation.length > 0) {
      lines.push("- AUGENBINDE: Schaltet das Sehen aus; steigert die Erwartung.");
    }
    if (sem.sensory_gag.length > 0) {
      lines.push("- KNEBEL: Schaltet Proteste stumm; erzwingt Hingabe.");
    }
    if (sem.anal.length > 0) {
      lines.push("- ANALE TOYS (" + sem.anal.join(', ') + "): " + (anat === 'penis' ? "Prostata-Druck oder Dehnungsgefühl beim Spanking." : "Ausfüllendes Gefühl während der Zucht."));
    }

    if (lines.length === 1) {
      lines.push("- Nackte Hände, Körpergewicht, Bettkante, Fußboden und Stimme.");
    }

    return lines.join("\n");
  }

  /**
   * Generiert anatomisch geprüfte Kombinationen für Drehbuch und Cockpit.
   */
  function getSmartCombinations(stagedToyList, topName, subName, subAnatomy) {
    var anat = (subAnatomy === 'penis') ? 'penis' : 'vulva';
    var sem = buildSemanticClosetSummary(stagedToyList, anat);
    var combos = [];

    var hasBondage = sem.bondage.length > 0;
    var hasImpact = sem.impact.length > 0;
    var hasClamps = sem.clamps.length > 0;
    var hasBlindfold = sem.sensory_deprivation.length > 0;
    var hasAnal = sem.anal.length > 0;

    var bondageTool = hasBondage ? sem.bondage[0] : "Krawatte oder Seidenschal";
    var impactTool = hasImpact ? sem.impact[0] : "die flache Hand oder ein Ledergürtel";

    // VULVA-KOMBINATIONEN
    if (anat === 'vulva') {
      var hasSuction = sem.clitoral_suction.length > 0;
      var hasWand = sem.wand.length > 0;
      var clitTool = hasSuction ? sem.clitoral_suction[0] : (hasWand ? sem.wand[0] : null);

      if (clitTool) {
        combos.push({
          id: "combo_clit_restraint",
          title: "⚡ Wehrlose Klitoris-Reizung (" + clitTool + " & " + bondageTool + ")",
          desc: subName + " wird mit " + bondageTool + " fixiert. " + topName + " führt mit dem " + clitTool + " gezielte Reize an der Klitoris durch – " + subName + " darf sich nicht entziehen.",
          ratingBadge: "🎢 Klitorale Reizüberflutung (" + clitTool + ")",
          requiredTypes: ["clitoral_suction", "bondage"]
        });

        combos.push({
          id: "combo_clit_ruined",
          title: "🥀 Disziplinarischer Ruined Orgasm (" + clitTool + ")",
          desc: topName + " treibt die Klitoris mit " + clitTool + " an die Schwelle. Genau beim ersten Beckenkrampf zieht " + topName + " das Gerät weg: Der Orgasmus verpufft ergebnislos.",
          ratingBadge: "🔒 Totale Orgasmuskontrolle",
          requiredTypes: ["clitoral_suction"]
        });
      }
    }

    // PENIS-KOMBINATIONEN
    if (anat === 'penis') {
      var hasStroker = sem.male_stroker.length > 0;
      var hasWandPenis = sem.wand.length > 0;
      var penisTool = hasStroker ? sem.male_stroker[0] : (hasWandPenis ? sem.wand[0] : "die führende Hand");

      combos.push({
        id: "combo_penis_edging_restraint",
        title: "⚡ Gefesselte Schwellen-Quälerei (" + penisTool + " & " + bondageTool + ")",
        desc: subName + " wird mit " + bondageTool + " fixiert. " + topName + " führt den Penis mit " + penisTool + " exakt bis zur Höhepunkt-Schwelle – und befiehlt schlagartigen Stillstand.",
        ratingBadge: "🎢 Schwellenkontrolle am Schaft",
        requiredTypes: ["male_stroker", "bondage"]
      });

      if (sem.male_chastity.length > 0) {
        combos.push({
          id: "combo_cage_discipline",
          title: "🔒 Keuschheits-Verwahrung (" + sem.male_chastity[0] + ")",
          desc: topName + " verschließt den Penis von " + subName + " im " + sem.male_chastity[0] + ". Sämtliche Erektionen werden unterbunden.",
          ratingBadge: "🔒 Volle Keuschheitsgewalt",
          requiredTypes: ["male_chastity"]
        });
      }
    }

    // UNIVERSELLE KOMBINATIONEN
    if (hasClamps) {
      combos.push({
        id: "combo_clamps_spank",
        title: "🔥 Brustwarzen-Klemmen & " + impactTool,
        desc: "Klammern an den Brustwarzen erzeugen dauerhaften Zug. Zeitgleich setzt " + topName + " gezielte Treffer mit " + impactTool + " auf das Gesäß.",
        ratingBadge: "⚖️ Dualer Reizfokus",
        requiredTypes: ["clamps", "impact"]
      });
    }

    if (hasBlindfold) {
      combos.push({
        id: "combo_blindfold_impact",
        title: "🙈 Blindes Ausgeliefertsein & " + impactTool,
        desc: subName + " trägt eine Augenbinde. Ohne Vorwarnung treffen gezielte Schläge mit " + impactTool + " auf das Gesäß.",
        ratingBadge: "🙈 Sensorische Disziplin",
        requiredTypes: ["sensory_deprivation", "impact"]
      });
    }

    return combos;
  }

  window.ToyCombinatorics = {
    database: TOY_DATABASE,
    classifyToy: classifyToy,
    isCompatible: isToyAnatomicallyCompatible,
    buildSummary: buildSemanticClosetSummary,
    generateAiPromptBriefing: generateAiClosetBriefing,
    getCombinations: getSmartCombinations
  };

})(window);
```
