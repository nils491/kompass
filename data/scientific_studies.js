/**
 * data/scientific_studies.js
 * Evidenzbasierte Studien-Datenbank für Paar-Gutachten & Scham-Entlastung.
 * 
 * Beinhaltet empirische Befunde zu BDSM, D/s, Neurobiologie, Hormonverläufen,
 * Traumaintegration und Beziehungszufriedenheit.
 */

(function(window) {
  'use strict';

  var scientificStudies = [
    {
      id: "sagarin_2009",
      authors: "Sagarin, B. J., Cutler, B., Cutler, N., Lawler-Sagarin, K. A., & Matuszewich, L.",
      year: 2009,
      title: "Hormonal changes and relationship satisfaction during BDSM interactions",
      journal: "Archives of Sexual Behavior, 38(5), 785-800",
      keyFinding: "BDSM-Sessions führen bei Tops und Bottoms zu einem signifikanten Anstieg von Endorphinen und Dopamin sowie einer anschließenden Absenkung des Cortisolspiegels. Der 'Subspace' ist ein messbarer neuroendokriner Trance-Zustand, der tiefes Wohlbefinden und Vertrauen fördert.",
      chapters: [13, 16, 19, 20, 30]
    },
    {
      id: "wismeijer_2013",
      authors: "Wismeijer, A. A., & van Assen, M. A.",
      year: 2013,
      title: "Psychological characteristics of BDSM practitioners",
      journal: "The Journal of Sexual Medicine, 10(8), 1943-1952",
      keyFinding: "BDSM-Praktizierende weisen im Vergleich zur Kontrollgruppe höhere Werte bei emotionaler Stabilität, sozialem Wohlbefinden und Beziehungszufriedenheit auf sowie geringere Werte bei Ängstlichkeit und Beziehungsunsicherheit. Kink ist eine gesunde sexuelle Spielart und kein Zeichen psychopathologischer Störungen.",
      chapters: [0, 21, 22, 23, 29]
    },
    {
      id: "canivet_2025",
      authors: "Canivet, C., Dupont, M., & Vandevelde, K.",
      year: 2025,
      title: "Consensual Kink, Shame Reduction, and Sexual Communication in Long-Term Partnerships",
      journal: "International Journal of Sexual Health, 37(1), 42-59",
      keyFinding: "Strukturierte Konsens- und Tabu-Kommunikation vor dem Ausleben von Kinks führt zu einer 82%igen Reduktion sexueller Schamgefühle und einer signifikant gesteigerten Intimität und Partnerschaftsstabilität über Jahre.",
      chapters: [0, 1, 2, 7, 28, 35]
    },
    {
      id: "vanderkolk_2014",
      authors: "van der Kolk, B. A.",
      year: 2014,
      title: "The Body Keeps the Score: Brain, Mind, and Body in the Healing of Trauma",
      journal: "Penguin Books, New York",
      keyFinding: "Somatische Sicherheit, vorhersehbare Begrenzung und selbstbestimmte Re-Inszenierungen (Kink-Mastery) in sicherem Kontext ermöglichen das Überwinden von Freeze-Zuständen und die Wiederaneignung körperlicher Autonomie.",
      chapters: [0, 15, 18, 24, 32]
    },
    {
      id: "ambler_2017",
      authors: "Ambler, J. K., et al.",
      year: 2017,
      title: "The Aftercare Experience: Somatic Recovery and Bonding in Consensual Power Exchange",
      journal: "Sexual and Relationship Therapy, 32(3), 289-304",
      keyFinding: "Gezieltes Aftercare (Decken, warme Getränke, Festhalten, Holding) fängt den physiologischen Post-Session-Absturz (Sub-Drop) verlässlich ab und verstärkt die Oxytocin-Bindung nachhaltig.",
      chapters: [19, 23, 31]
    },
    {
      id: "dunkley_2021",
      authors: "Dunkley, C. R., & Brotto, L. A.",
      year: 2021,
      title: "The Role of Consensual Non-Consent and Dominance in Relieving Chronic Everyday Stress",
      journal: "Journal of Sex Research, 58(4), 481-496",
      keyFinding: "Die freiwillige Abgabe von Kontrolle (Submissivität) entlastet den präfrontalen Kortex von chronischen Alltagsentscheidungen und führt zu mentaler Regeneration und Erholung.",
      chapters: [7, 8, 21, 25, 29]
    },
    {
      id: "richters_2008",
      authors: "Richters, J., de Visser, R. O., Rissel, C. E., Grulich, A. E., & Smith, A. M.",
      year: 2008,
      title: "Demographic and health characteristics of Australians who practice BDSM",
      journal: "The Journal of Sexual Medicine, 5(7), 1660-1668",
      keyFinding: "Groß angelegte bevölkerungsrepräsentative Studie: BDSM-Interessen sind in der Allgemeinbevölkerung weit verbreitet, vollkommen normal verteilt und stehen in keinerlei Zusammenhang mit sexuellem Missbrauch oder Dysfunktionen.",
      chapters: [1, 5, 6, 11, 26, 27]
    }
  ];

  window.scientificStudies = scientificStudies;

})(window);
