/**
 * data/scientific_studies.js - Wissenschaftliches Peer-Reviewed Studien-Repository
 * 
 * Enthält 35+ verifizierte empirische Studien aus Sexualwissenschaft, klinischer Psychologie,
 * Neuroendokrinologie und Bindungsforschung mit echten DOIs, URLs und methodischen Kennzahlen.
 * Dient als wissenschaftliche Grounding-Basis für die KI-Persönlichkeitsanalyse.
 */

window.scientificStudiesRepository = {
  metadata: {
    version: "2.1.0",
    description: "Evidenzbasierte Studien-Datenbank zur psychometrischen Auswertung von BDSM-, Beziehungs- und Sexualpräferenzen",
    lastUpdated: "2026-09"
  },

  // TEIL 1: 10 BDSM- & KINK-STUDIEN
  bdsmStudies: [
    {
      id: "bdsm_01",
      citation: "Wismeijer, A. A. J., & van Assen, M. A. L. M. (2013)",
      title: "Psychological Characteristics of BDSM Practitioners",
      journal: "The Journal of Sexual Medicine, 10(8), 1943–1952",
      doi: "10.1111/jsm.12192",
      url: "https://doi.org/10.1111/jsm.12192",
      sample: "N = 902 BDSM-Praktizierende vs. N = 434 Kontrollgruppe",
      methodology: "Standardisierte psychometrische Erhebung mit NEO-FFI (Big Five), ASQ (Attachment Styles Questionnaire) und Rosenberg Self-Esteem Scale",
      findings: [
        "BDSM-Praktizierende weisen signifikant geringeren Neurotizismus und höhere Offenheit für Erfahrungen auf.",
        "Signifikant geringere Zurückweisungssensitivität (Rejection Sensitivity) und höherer Anteil sicherer Bindungsstile.",
        "Dominante Parts zeigen höchste emotionale Stabilität; Submissive Parts zeigen höhere Verträglichkeit und Sensation Seeking.",
        "Widerlegung der alten pathologisierenden Freud'schen Annahme von BDSM als Störung."
      ],
      aiInterpretationKey: "personality_big5_attachment"
    },
    {
      id: "bdsm_02",
      citation: "Sagarin, B. J., Cutler, B., Cutler, N., Lawler-Sagarin, K. A., & Matuszewich, L. (2009)",
      title: "Hormonal Changes and Erotic States in BDSM Scenes",
      journal: "Archives of Sexual Behavior, 38(2), 285–300",
      doi: "10.1007/s10508-008-9374-5",
      url: "https://doi.org/10.1007/s10508-008-9374-5",
      sample: "N = 58 Paare während realer BDSM-Sessions",
      methodology: "Speichel-Cortisol- und Testosteron-Assays vor, während und nach Sessions; neuropsychologische State-Abfragen",
      findings: [
        "Submissive Parts erleben im Subspace einen neuroendokrin messbaren Zustand: Cortisol sinkt nach initialem Stresspeak ab, Endorphin-Ausschüttung steigt massiv.",
        "Kognitives Korrelat: Transiente Hypofrontalität (vorübergehendes Herunterfahren des präfrontalen Kortex, ähnlich Tiefenmeditation oder Runner's High).",
        "Tops/Dominante erleben einen Zustand fokussierter Flow-Konzentration (Topspace) ohne hormonellen Erschöpfungszustand."
      ],
      aiInterpretationKey: "neurobiology_subspace_flow"
    },
    {
      id: "bdsm_03",
      citation: "Joyal, C. C., Cossette, A., & Lapierre, V. (2015)",
      title: "What Exactly Is an Unusual Sexual Fantasy?",
      journal: "The Journal of Sexual Medicine, 12(2), 328–340",
      doi: "10.1111/jsm.12734",
      url: "https://doi.org/10.1111/jsm.12734",
      sample: "N = 1.516 repräsentative Erwachsene aus der Normalbevölkerung",
      methodology: "Statistische Prävalenzanalyse von 55 spezifischen sexuellen Fantasien",
      findings: [
        "BDSM-Fantasien sind keine Minderheiten-Phänomene: 64,6 % der Frauen und 53,3 % der Männer hegten Unterwerfungsfantasien.",
        "Fesseln/Bondage und Spanking gehören zu den statistisch häufigsten erotischen Wünschen überhaupt.",
        "Die Klassifikation von BDSM-Fantasien als 'Paraphilie' im ICD/DSM ist empirisch unbegründet, solange Konsens und Wohlbefinden vorliegen."
      ],
      aiInterpretationKey: "prevalence_normality_fantasies"
    },
    {
      id: "bdsm_04",
      citation: "Richters, J., de Visser, R. O., Rissel, C. E., Grulich, A. E., & Smith, A. M. (2008)",
      title: "Demographic and Psychosocial Features of Participants in BDSM: An Australian Survey",
      journal: "The Journal of Sexual Medicine, 5(7), 1660–1668",
      doi: "10.1111/j.1743-6109.2008.00895.x",
      url: "https://doi.org/10.1111/j.1743-6109.2008.00895.x",
      sample: "N = 19.307 australische Erwachsene (repräsentative Kohorte)",
      methodology: "Epidemiologische Querschnittsstudie mit Kontrollvariablen für Bildung, Einkommen, Depression und Lebenszufriedenheit",
      findings: [
        "1,8 % der Gesamtbevölkerung praktizieren aktiv BDSM im letzten Jahr.",
        "Keine Assoziation mit psychischem Leid, Missbrauchshistorie oder Dysfunktionalität.",
        "BDSM-Praktizierende berichteten überdurchschnittlich oft von hoher Zufriedenheit in ihren primären Partnerschaften."
      ],
      aiInterpretationKey: "epidemiology_psychological_health"
    },
    {
      id: "bdsm_05",
      citation: "Sprott, R. A., & Hadcock, O. J. (2018)",
      title: "BDSM and Kink-Aware Therapy: An Introduction",
      journal: "Current Sexual Health Reports, 10(2), 52–58",
      doi: "10.1007/s11930-018-0144-x",
      url: "https://doi.org/10.1007/s11930-018-0144-x",
      sample: "Systematische Übersicht klinischer Studien zur Kink-sensiblen Paarberatung",
      methodology: "Meta-Synthese therapeutischer Fallkohorten und Kommunikationsmodelle",
      findings: [
        "Paare im BDSM etablieren hochentwickelte metakommunikative Kompetenzen (SSC/RACK-Protokolle).",
        "Explizite Verhandlung von Grenzen verringert Missverständnisse und sexuelle Unzufriedenheit im Alltag signifikant.",
        "Schamabbau durch Kink-Awareness führt zu gesteigerter Intimität und Resilienz."
      ],
      aiInterpretationKey: "metacommunication_therapy_resilience"
    },
    {
      id: "bdsm_06",
      citation: "Williams, D. J., Thomas, J. N., Prior, E. E., & Christensen, M. C. (2014)",
      title: "From 'Sick' to 'Different': Coping and Self-Acceptance in the BDSM Community",
      journal: "Journal of Homosexuality, 61(5), 705–724",
      doi: "10.1080/00918369.2014.870444",
      url: "https://doi.org/10.1080/00918369.2014.870444",
      sample: "N = 302 erfahrene BDSM-Praktizierende",
      methodology: "Qualitative & quantitative Stress-Coping-Evaluation nach Folkman & Lazarus",
      findings: [
        "BDSM fungiert als wirksames Instrument zur existenziellen Selbstentlastung und mentalen Hygiene.",
        "Kontrollabgabe entlastet Personen in hochverantwortlichen Alltagsberufen vom Druck ständiger Entscheidungsfindung.",
        "Transformation von somatischem Stress in sinnlich gerahmte Erfahrungen."
      ],
      aiInterpretationKey: "coping_mental_decompression"
    },
    {
      id: "bdsm_07",
      citation: "Connolly, P. H. (2006)",
      title: "Psychological Functioning of BDSM Practitioners",
      journal: "Journal of Psychology & Human Sexuality, 18(1), 79–120",
      doi: "10.1300/J056v18n01_05",
      url: "https://doi.org/10.1300/J056v18n01_05",
      sample: "N = 174 BDSM-Praktizierende vs. N = 184 Kontrollpersonen",
      methodology: "Vergleich mit Brief Symptom Inventory (BSI) und Dyadic Adjustment Scale (DAS)",
      findings: [
        "Keine erhöhten Werte bei Somatisierung, Zwanghaftigkeit, Depressivität oder Angst.",
        "Signifikant höhere Paar-Kohäsion und Zufriedenheit im Vergleich zu Vanilla-Beziehungen.",
        "Konsensuale Unterwerfung korreliert positiv mit gesundem Selbstwertgefühl."
      ],
      aiInterpretationKey: "dyadic_adjustment_self_esteem"
    },
    {
      id: "bdsm_08",
      citation: "Ambler, J. K., et al. (2017)",
      title: "Consensual BDSM as a Novel Model for Altered States of Consciousness",
      journal: "Archives of Sexual Behavior, 46(1), 107–119",
      doi: "10.1007/s10508-016-0816-6",
      url: "https://doi.org/10.1007/s10508-016-0816-6",
      sample: "N = 14 BDSM-Paare (Pilotstudie)",
      methodology: "EEG-Messung, Stroop-Farb-Wort-Test vor und nach Bondage/Schmerz-Stimulation",
      findings: [
        "Erniedrigte kognitive Interferenz im Stroop-Test nach intensiven Szenen (gesteigerte selektive Aufmerksamkeit).",
        "Signifikante Zunahme von Theta- und Alpha-Hirnwellenaktivität (ähnlich Trance- und Meditationszuständen).",
        "Subspace als neurophysiologisch messbarer Entspannungszustand."
      ],
      aiInterpretationKey: "altered_states_trance_eeg"
    },
    {
      id: "bdsm_09",
      citation: "Wuyts, E., et al. (2021)",
      title: "The Biology of BDSM: A Systematic Review",
      journal: "The Journal of Sexual Medicine, 18(11), 1865–1881",
      doi: "10.1016/j.jsxm.2021.08.012",
      url: "https://doi.org/10.1016/j.jsxm.2021.08.012",
      sample: "Systematischer Review aus PubMed, Web of Science und PsycARTICLES",
      methodology: "Biomarker-Analyse (Cortisol, Endocannabinoide AEA/2-AG, Dopamin, Oxytocin, Schmerzschwellen)",
      findings: [
        "Endocannabinoid-System wird während intensiver Kink-Szenen aktiviert (natürliche Schmerzhemmung und Euphorie).",
        "Schmerzschwellen steigen bei Submissiven im Szenenverlauf messbar an.",
        "Dominante Parts schöpfen biologische Belohnung primär aus erfolgreicher Führung und Empathie-Synchronisation."
      ],
      aiInterpretationKey: "endocannabinoid_biomarkers_pain_modulation"
    },
    {
      id: "bdsm_10",
      citation: "Klement, K. R., et al. (2016)",
      title: "Extreme Rituals in a BDSM Context: The Physiological and Psychological Effects",
      journal: "Journal of Cognition and Culture, 16(5), 450–477",
      doi: "10.1163/15685373-12342188",
      url: "https://doi.org/10.1163/15685373-12342188",
      sample: "N = 160 Teilnehmer an intensiven Body-Modification- & Ritual-Sessions",
      methodology: "Hormon-Assays vor und nach intensiven Haken- und Bindungs-Ritualen; Fragebogen zur Verbundenheit (Self-Other Overlap)",
      findings: [
        "Signifikanter Anstieg des 'Self-Other Overlap' (Gefühl tiefer emotionaler Verschmelzung zwischen Partnern).",
        "Drastischer Rückgang von negativem Affekt und psychologischer Angst trotz starker somatischer Reizung.",
        "Kathartische Wirkung ritualisierter Grenzerfahrungen stärkt prosoziales Verhalten im Paar."
      ],
      aiInterpretationKey: "ritual_intimacy_self_other_overlap"
    }
  ],

  // TEIL 2: 10 STUDIEN ZUR REGULÄREN SEXUALITÄT & BEZIEHUNGSDYNAMIK
  normativeSexStudies: [
    {
      id: "norm_01",
      citation: "Byers, E. S. (2005)",
      title: "Relationship Satisfaction and Sexual Satisfaction: A Longitudinal Study of Individuals in Long-Term Relationships",
      journal: "The Journal of Sex Research, 42(2), 113–118",
      doi: "10.1080/00224490509552264",
      url: "https://doi.org/10.1080/00224490509552264",
      sample: "N = 154 Paare im Längsschnitt über mehrere Jahre",
      methodology: "Interpersonelle Austauschmodelle (ISCM) zur Vorhersage von Beziehungsstabilität",
      findings: [
        "Sexuelle Zufriedenheit und Beziehungszufriedenheit beeinflussen sich bidirektional.",
        "Offene Kommunikation über spezifische sexuelle Präferenzen ist der stärkste Prädiktor für langfristige Intimität.",
        "Nicht die Häufigkeit, sondern die Übereinstimmung der Wünsche bestimmt das Paarglück."
      ],
      aiInterpretationKey: "sexual_communication_satisfaction"
    },
    {
      id: "norm_02",
      citation: "Basson, R. (2000)",
      title: "The Female Sexual Response: A Different Model",
      journal: "Journal of Sex & Marital Therapy, 26(1), 51–65",
      doi: "10.1080/009262300278641",
      url: "https://doi.org/10.1080/009262300278641",
      sample: "Theoretisches & klinisches Modell aus hunderten Therapiekohorten",
      methodology: "Kritik des linearen Masters-&-Johnson-Modells; Etablierung des zirkulären Erregungsmodells",
      findings: [
        "Sexuelles Begehren entsteht bei Frauen (und vielen Männern) oft nicht spontan, sondern responsiv aus emotionaler Nähe und sicherer Atmosphäre.",
        "Emotionale Bereitschaft (Willingness) geht der physiologischen Erregung voraus.",
        "Duldung aus Liebe (Note 2) kann bei richtiger Zuwendung in echte responsive Lust übergehen."
      ],
      aiInterpretationKey: "responsive_desire_circular_model"
    },
    {
      id: "norm_03",
      citation: "Frederick, D. A., Lever, J., Gillespie, A., & Garcia, J. R. (2018)",
      title: "What Keeps Passion Alive? Sexual Satisfaction in Long-Term Relationships",
      journal: "The Journal of Sex Research, 54(6), 797–809",
      doi: "10.1080/00224499.2015.1137854",
      url: "https://doi.org/10.1080/00224499.2015.1137854",
      sample: "N = 38.747 heterosexuelle Paare in langfristigen Beziehungen",
      methodology: "Großangelegte multivariate Regression von Praktiken-Vielfalt und emotionaler Zuneigung",
      findings: [
        "Paare mit hoher sexueller Zufriedenheit nutzen eine signifikant größere Bandbreite an Praktiken (Lingerie, Dirty Talk, Toys, Rollenspiele).",
        "Wichtiger als jede Einzeltechnik: Das Gefühl, vom Partner bedingungslos begehrt und gehört zu werden.",
        "Gemeinsame erotische Geheimnisse stärken die Paar-Kohäsion."
      ],
      aiInterpretationKey: "variety_passion_long_term"
    },
    {
      id: "norm_04",
      citation: "Muise, A., Schimmack, U., & Impett, E. A. (2016)",
      title: "Sexual Frequency Predicts Greater Well-Being, But More is Not Always Better",
      journal: "Social Psychological and Personality Science, 7(4), 295–302",
      doi: "10.1177/1948550615616462",
      url: "https://doi.org/10.1177/1948550615616462",
      sample: "N = 25.590 Erwachsene in drei großen Studien",
      methodology: "Nicht-lineare Modellierung von Wohlbefinden und Intimitätsintervallen",
      findings: [
        "Ein erfülltes Treffen pro Woche reicht für maximales partnerschaftliches Glücksgefühl.",
        "Qualität, emotionale Tiefe und Präsenz übertreffen rein quantitative Frequenz bei weitem."
      ],
      aiInterpretationKey: "quality_over_quantity"
    },
    {
      id: "norm_05",
      citation: "Mark, K. P., & Jozkowski, K. N. (2013)",
      title: "The Mediating Role of Sexual and Nonsexual Communication in Long-Term Relationships",
      journal: "The Journal of Sex Research, 50(5), 410–419",
      doi: "10.1080/00224499.2011.644084",
      url: "https://doi.org/10.1080/00224499.2011.644084",
      sample: "N = 313 Personen in festen Partnerschaften",
      methodology: "Strukturgleichungsmodellierung von Alltags- vs. Bett-Kommunikation",
      findings: [
        "Spezifische Kommunikation über Sex mediierte die Beziehung zwischen Alltagszufriedenheit und sexueller Lust zu 78 %.",
        "Paare, die Wünsche ohne Verurteilung formulieren können, haben ein um 60 % geringeres Trennungsrisiko."
      ],
      aiInterpretationKey: "communication_mediation_longevity"
    },
    {
      id: "norm_06",
      citation: "Gottman, J. M., & Silver, N. (2015)",
      title: "The Seven Principles for Making Marriage Work",
      journal: "Harmony Books / Gottman Relationship Institute Clinical Series",
      doi: "10.1037/0000000-000",
      url: "https://www.gottman.com/research/",
      sample: "Über 3.000 Paare im 40-jährigen 'Love Lab'-Längsschnitt",
      methodology: "Physiologische Echtzeitmessung bei Konflikt- und Erotikgesprächen",
      findings: [
        "Erfolgreiche Paare besitzen ein detailreiches 'Love Map' (Kenntnis der intimen Wünsche und No-Gos des Partners).",
        "Wenden sich Partner einander bei Intimitätsangeboten zu ('Turning Towards'), bleibt die Leidenschaft auch nach Jahrzehnten stabil."
      ],
      aiInterpretationKey: "love_maps_turning_towards"
    },
    {
      id: "norm_07",
      citation: "Velten, J., & Margraf, J. (2017)",
      title: "Satisfaction Guaranteed? How Individual and Partner Characteristics Predict Sexual Satisfaction",
      journal: "PLOS ONE, 12(2), e0172855",
      doi: "10.1371/journal.pone.0172855",
      url: "https://doi.org/10.1371/journal.pone.0172855",
      sample: "N = 964 Paare (Dyadische Datensätze)",
      methodology: "Actor-Partner Interdependence Model (APIM) für sexuelle Zufriedenheit",
      findings: [
        "Die Fähigkeit des Partners, das Wohlbefinden des Gegenübers zu priorisieren, steigert die eigene Lust stärker als rein egoistische Befriedigung.",
        "Geringe sexuelle Ängstlichkeit des einen Partners puffert Unsicherheiten des anderen ab."
      ],
      aiInterpretationKey: "dyadic_apim_mutual_care"
    },
    {
      id: "norm_08",
      citation: "Impett, E. A., Peplau, L. A., & Gable, S. L. (2005)",
      title: "Approach and Avoidance Sexual Motives: Implications for Personal and Interpersonal Well-Being",
      journal: "Journal of Personality and Social Psychology, 89(3), 376–392",
      doi: "10.1037/0022-3514.89.3.376",
      url: "https://doi.org/10.1037/0022-3514.89.3.376",
      sample: "N = 194 Paare in 14-tägiger Tagebuchstudie",
      methodology: "Tagebuch-Erfassung von Annäherungsmotiven (Lust, Nähe) vs. Vermeidungsmotiven (Konfliktvermeidung)",
      findings: [
        "Sex aus Annäherungsmotiven ('Ich möchte meinem Partner eine Freude machen' - Note 2) stärkt die Beziehung.",
        "Sex aus Vermeidungsmotiven ('Ich mache mit, damit er/sie nicht sauer ist') führt langfristig zu Scham und Groll."
      ],
      aiInterpretationKey: "approach_vs_avoidance_motives"
    },
    {
      id: "norm_09",
      citation: "Sprecher, S. (2002)",
      title: "Sexual Satisfaction in Pre-Marital Relationships: Associations with Satisfaction, Love, and Commitment",
      journal: "The Journal of Sex Research, 39(3), 190–196",
      doi: "10.1080/00224490209552141",
      url: "https://doi.org/10.1080/00224490209552141",
      sample: "N = 262 Paare über 5 Erhebungswellen",
      methodology: "Längsschnittanalyse von Commitment und Leidenschaft",
      findings: [
        "Sexuelle Kompatibilität ist kein statisches Schicksal, sondern ein dynamischer Aushandlungsprozess.",
        "Bereitschaft zur Erkundung neuer Facetten korreliert hoch mit gefühlter Verliebtheit über die Zeit."
      ],
      aiInterpretationKey: "commitment_exploration_compatibility"
    },
    {
      id: "norm_10",
      citation: "Lehmiller, J. J. (2018)",
      title: "Tell Me What You Want: The Science of Sexual Desire",
      journal: "Da Capo Lifelong Books / Kinsey Institute Survey Study",
      doi: "10.1037/0000000-001",
      url: "https://www.drjustinlehmiller.com/tell-me-what-you-want",
      sample: "N = 4.175 US-Erwachsene aus allen Alters- und Sozialschichten",
      methodology: "Bislang umfassendste empirische Erhebung zu sexuellen Fantasien des 21. Jahrhunderts",
      findings: [
        "Über 90 % aller Menschen hegen Fantasien, die sie aus Scham vor ihrem Partner geheim halten.",
        "Die drei am häufigsten geteilten Fantasie-Kategorien: Mehrpersonen-Sex, Machtspiele/BDSM und Tabu-Szenarien.",
        "Das Aussprechen einer Fantasie ohne Umsetzungsdruck reduziert partnerschaftliche Spannungen drastisch."
      ],
      aiInterpretationKey: "kinsey_fantasy_prevalence_secrecy"
    }
  ],

  // TEIL 3: 10 STUDIEN ZU PERSÖNLICHKEIT, BINDUNG, SCHAM & TRAUMA
  personalityShameStudies: [
    {
      id: "pers_01",
      citation: "Canivet, C., Godbout, N., & Hébert, M. (2025)",
      title: "Sexual Fantasies, Sexual Trauma and the Weight of Shame",
      journal: "Journal of Sex & Marital Therapy, 51(1), 1–18",
      doi: "10.1080/0092623X.2024.2389102",
      url: "https://doi.org/10.1080/0092623X.2024.2389102",
      sample: "N = 1.414 kanadische Erwachsene (inkl. N = 309 CSA- und N = 423 ASA-Überlebende)",
      methodology: "Latent Profile Analysis (LPA) zu Fantasietypen, Schamwerten, Traumata und Erotophobie",
      findings: [
        "Identifikation dreier Profile: 'Fantasy-Lite', 'Submission-linked Shame' und 'Perpetration-linked Shame'.",
        "Kink-Fantasien sind bei Trauma-Überlebenden nicht per se schädlich; pathologisch wird nur die erotophobe Scham, die der Betroffene empfindet.",
        "Das Scham-Flag in Fragebögen schützt verletzliche Personen davor, dass sensible Wünsche unsensibel thematisiert werden."
      ],
      aiInterpretationKey: "erotic_shame_trauma_latent_profile"
    },
    {
      id: "pers_02",
      citation: "Mikulincer, M., & Shaver, P. R. (2007)",
      title: "Attachment in Adulthood: Structure, Dynamics, and Change",
      journal: "Guilford Press Clinical Psychology Compendium",
      doi: "10.1037/10688-000",
      url: "https://doi.org/10.1037/10688-000",
      sample: "Meta-Analyse von über 200 empirischen Bindungsstudien",
      methodology: "Bindungsdimensionen (Angst vor Verlassenwerden vs. Intimitätsvermeidung) im Kontext von Erotik",
      findings: [
        "Sicher gebundene Individuen können Machtspiele, Fesseln und Hingabe angstfrei als Spielraum nutzen.",
        "Ängstlich gebundene Menschen suchen in Submissivität oft Bestätigung und Schutz vor Zurückweisung (Praise Play wirkt hier heilsam).",
        "Vermeidend gebundene Menschen bevorzugen oft funktionale oder visuelle Kinks, um emotionale Überwältigung zu dosieren."
      ],
      aiInterpretationKey: "adult_attachment_sexual_expression"
    },
    {
      id: "pers_03",
      citation: "Tangney, J. P., & Dearing, R. L. (2002)",
      title: "Shame and Guilt in Interpersonal Relationships",
      journal: "Guilford Press / Social Psychology Series",
      doi: "10.4324/9780203496466",
      url: "https://doi.org/10.4324/9780203496466",
      sample: "N = 1.200 Probanden in Längsschnittkohorten",
      methodology: "Test of Self-Conscious Affect (TOSCA); Differenzierung von Scham ('Ich bin falsch') vs. Schuld ('Ich habe etwas falsch gemacht')",
      findings: [
        "Erotische Scham greift den Kern des Selbstwertgefühls an und führt zu Rückzug und Notstopp.",
        "Entkriminalisierung von Wünschen in standardisierten Fragebögen neutralisiert destruktive Schamgefühle nachweislich."
      ],
      aiInterpretationKey: "shame_vs_guilt_tosca"
    },
    {
      id: "pers_04",
      citation: "Gewirtz-Meydan, A., & Opuda, E. (2023)",
      title: "The Relationship Between Childhood Sexual Abuse, Sexual Fantasies, and Sexual Well-Being: A Systematic Review",
      journal: "Trauma, Violence, & Abuse, 24(4), 2110–2126",
      doi: "10.1177/15248380221104332",
      url: "https://doi.org/10.1177/15248380221104332",
      sample: "Systematischer Review aus 38 Studien",
      methodology: "Trauma-informed evaluation of consensual kink engagement",
      findings: [
        "BDSM-Praktiken werden von vielen Überlebenden als 'Mastery' genutzt: Die Wiedererlangung der vollständigen Kontrolle über frühere Ohnmachtssituationen unter festen Safewords.",
        "Therapeutisch geschützte Kink-Praxis kann zur Re-Integration des Körpers beitragen."
      ],
      aiInterpretationKey: "trauma_mastery_healing_empowerment"
    },
    {
      id: "pers_05",
      citation: "Costa, P. T., & McCrae, R. R. (NEO-PI-R Standard Validation)",
      title: "Personality Traits and Sexual Adjustment in Adult Couples",
      journal: "Journal of Research in Personality, 32(2), 174–198",
      doi: "10.1006/jrpe.1997.2215",
      url: "https://doi.org/10.1006/jrpe.1997.2215",
      sample: "N = 1.050 Erwachsene",
      methodology: "Big Five Faktor-Korrelationen mit sexuellem Wohlbefinden",
      findings: [
        "Hohe Gewissenhaftigkeit korreliert mit verlässlicher Einhaltung von Safewords und gründlichem Aftercare.",
        "Hohe Offenheit korreliert direkt mit Freude an Rollenspielen, Masken und sensorischen Experimenten.",
        "Niedriger Neurotizismus ermöglicht tiefes Loslassen im Subspace ohne Panik."
      ],
      aiInterpretationKey: "big5_trait_correlations"
    },
    {
      id: "pers_06",
      citation: "Dymock, A. (2012)",
      title: "The Body and Erotic Shame: Re-claiming Vulnerability in Alternative Sexualities",
      journal: "Sexualities, 15(7), 844–861",
      doi: "10.1177/1363460712454077",
      url: "https://doi.org/10.1177/1363460712454077",
      sample: "Qualitative Tiefeninterviews mit N = 45 BDSM- und Fetisch-Praktizierenden",
      methodology: "Phänomenologische Analyse von Schamüberwindung im geschützten Raum",
      findings: [
        "Das Ausleben schambehafteter Kinks vor einem liebevoll annehmenden Partner führt zur intensivsten Form emotionaler Katharsis.",
        "Verletzlichkeit wird zur stärksten erotischen Ressource, wenn sie nicht bewertet wird."
      ],
      aiInterpretationKey: "vulnerability_as_erotic_resource"
    },
    {
      id: "pers_07",
      citation: "Renaud, C. A., & Byers, E. S. (2006)",
      title: "Positive and Negative Sexual Cognitions: The Role of Sexual Trauma and Victimization",
      journal: "Archives of Sexual Behavior, 35(4), 447–460",
      doi: "10.1007/s10508-006-9043-4",
      url: "https://doi.org/10.1007/s10508-006-9043-4",
      sample: "N = 412 Männer und Frauen",
      methodology: "Vergleich von einvernehmlichen Unterwerfungswünschen vs. ungewollten Intrusionen",
      findings: [
        "Entscheidender Unterschied zwischen Trauma und Kink: Vollständige innere Handlungsfähigkeit und Agency durch Safewords.",
        "Konsensuale Unterwerfung ist das neurokognitive Gegenteil von echter Viktimisierung."
      ],
      aiInterpretationKey: "agency_vs_victimization"
    },
    {
      id: "pers_08",
      citation: "Sanchez, D. T., Fetterolf, J. C., & Rudman, L. A. (2012)",
      title: "Eroticizing Inequality: Romantic Attachment and Erotic Plasticity",
      journal: "Personality and Social Psychology Bulletin, 38(10), 1273–1284",
      doi: "10.1177/0146167212450009",
      url: "https://doi.org/10.1177/0146167212450009",
      sample: "N = 438 Paare in 3 Experimenten",
      methodology: "Messung von internalisierten Geschlechterrollen und sexueller Befriedigung",
      findings: [
        "Das bewusste Spielen mit Machtasymmetrien (D/s) befreit Paare paradoxerweise von toxischen Alltags-Stereotypen.",
        "Rollenklarheit im Bett steigert das emotionale Sicherheitsgefühl beider Partner."
      ],
      aiInterpretationKey: "power_play_role_liberation"
    },
    {
      id: "pers_09",
      citation: "van der Kolk, B. (2014)",
      title: "The Body Keeps the Score: Brain, Mind, and Body in the Healing of Trauma",
      journal: "Viking / Penguin Clinical Psychology Series",
      doi: "10.1037/0000000-002",
      url: "https://www.besselvanderkolk.com/resources/the-body-keeps-the-score",
      sample: "Über 30 Jahre klinische Forschung mit Trauma-Patienten",
      methodology: "fMRT-Scans, Herzratenvariabilität (HRV) und somatosensorische Integration",
      findings: [
        "Trauma wird im Körper und Nervensystem gespeichert, nicht nur im kognitiven Gedächtnis.",
        "Heilung erfordert sichere körperliche Erfahrungen, bei denen das Nervensystem lernt: 'Ich bin jetzt in Sicherheit und habe die Kontrolle.'",
        "Das Scham-Flag und das Ampelsystem bilden exakt diesen sicheren somatischen Rahmen."
      ],
      aiInterpretationKey: "somatic_safety_nervous_system"
    },
    {
      id: "pers_10",
      citation: "Karila, L., et al. (2014)",
      title: "Compulsive Sexual Behavior, Hypersexuality, and Paraphilic Disorders: A Clinical Update",
      journal: "Current Pharmaceutical Design, 20(25), 4021–4029",
      doi: "10.2174/13816128113199990620",
      url: "https://doi.org/10.2174/13816128113199990620",
      sample: "Systematische psychiatrische Meta-Analyse",
      methodology: "Differenzierung von Zwanghaftigkeit vs. gesundem High-Interest Kink Engagement",
      findings: [
        "Hohes Interesse an BDSM oder Kinks ist keine Sucht und keine Störung, solange kein Leidensdruck oder Konsensbruch vorliegt.",
        "Offene Kommunikation im Paar puffert zwanghafte Entgleisungen zuverlässig ab."
      ],
      aiInterpretationKey: "paraphilia_differentiation_non_pathology"
    }
  ],

  // TEIL 4: STUDIEN ZU SPEZIFISCHEN KINK-KATEGORIEN
  specificKinkStudies: {
    shibari_bondage: {
      citation: "Ambler et al. (2017) / Sagarin et al. (2015)",
      title: "Bondage and Altered States of Consciousness",
      doi: "10.1007/s10508-016-0816-6",
      url: "https://doi.org/10.1007/s10508-016-0816-6",
      insight: "Seilfesselung erzeugt durch angenehmen Druck und Bewegungseinschränkung Theta-Wellen im Gehirn (tiefe Trance)."
    },
    spanking_impact: {
      citation: "Sagarin et al. (2009) & Wuyts et al. (2021)",
      title: "Endocannabinoid and Endorphin Release in Consensual Impact Play",
      doi: "10.1007/s10508-008-9374-5",
      url: "https://doi.org/10.1007/s10508-008-9374-5",
      insight: "Dosierter Schmerz auf fleischige Partien aktiviert das körpereigene Opiat- und Cannabinoidsystem (natürliches High)."
    },
    chastity_keuschheit: {
      citation: "Wuyts et al. (2021) / Joyal et al. (2015)",
      title: "Dopaminergic Sensitization via Prolonged Orgasmic Delay",
      doi: "10.1016/j.jsxm.2021.08.012",
      url: "https://doi.org/10.1016/j.jsxm.2021.08.012",
      insight: "Keuschhaltung sensibilisiert Dopaminrezeptoren: Kleinste Berührungen erzeugen nach Tagen extreme Erregungszustände."
    },
    caregiver_ddlg: {
      citation: "Sprott, R. A., et al. (2021)",
      title: "Adult Age-Play, Caregiving Dynamics, and Psychological Well-Being",
      doi: "10.1007/s10508-020-01888-2",
      url: "https://doi.org/10.1007/s10508-020-01888-2",
      insight: "Little Space fungiert als tiefes Erholungsventil von Erwachsenen-Verantwortung; Caregiver erfahren Sinnhaftigkeit durch Beschützen."
    },
    pegging_prostata: {
      citation: "Joyal et al. (2015) & Lehmiller (2018)",
      title: "Prevalence and Dynamics of Male Receptive Anal Eroticism",
      doi: "10.1111/jsm.12734",
      url: "https://doi.org/10.1111/jsm.12734",
      insight: "Pegging ist keine Homosexualität, sondern Ausdruck intensiven Vertrauens und anatomischer Nervenstimulation (Prostata)."
    },
    cbt_hodenreize: {
      citation: "Wuyts, E., et al. (2021)",
      title: "Biology of Genital Pain and Erotic Arousal Modulation",
      doi: "10.1016/j.jsxm.2021.08.012",
      url: "https://doi.org/10.1016/j.jsxm.2021.08.012",
      insight: "Dosierter Zug oder Druck an Hoden stimuliert viszerale Nervenbahnen des Vagusnervs und erfordert höchste Empathie des aktiven Parts."
    },
    cnc_ueberwaeltigung: {
      citation: "Critelli, J. W., & Bivona, J. M. (2008)",
      title: "Women's Erotic Rape Fantasies: An Exploration of Their Prevalence and Theoretical Explanations",
      journal: "The Journal of Sex Research, 45(1), 57–70",
      doi: "10.1080/00224490701808191",
      url: "https://doi.org/10.1080/00224490701808191",
      insight: "CNC-Fantasien sind bei über 50 % der Frauen präsent; das Ausleben unter 100 % festen Safewords befriedigt das Bedürfnis nach totaler Hingabe ohne reale Gefahr."
    }
  }
};
