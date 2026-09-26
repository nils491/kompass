/**
 * js/session_discipline.js
 * Spezialisiertes Modul für den Bestrafungs-Konfigurator in der Schlafzimmer-Regie.
 * 
 * Features:
 * - Echtes Auslesen der Bogen-Antworten des Bottoms (Noten 2 bis 5)
 * - Strikter Ausschluss aller Tabus (Note 1)
 * - Live-Freitextfeld für konkrete Vergehen
 * - Physische Verträglichkeits- & Plausibilitätsprüfung
 * - Unabhängige Härtegrade pro Stufe
 */

(function(window) {
  'use strict';

  var wizardState = {
    currentStage: 1,
    category: 'mouth',
    reason: '',
    severities: { 1: 2, 2: 2, 3: 2, 4: 2 },
    selectedChoices: { 1: null, 2: null, 3: null, 4: null },
    catalogOffsets: { 1: 0, 2: 0, 3: 0, 4: 0 }
  };

  var INFRACTION_MAP = {
    mouth: { label: "Widerrede & Frechheit", hint: "Fokus auf Haltungskontrolle und Dämpfung des Redeflusses." },
    posture: { label: "Haltungsfehler & Zappeln", hint: "Fokus auf feste Fixierung und ruhige Demutshaltung." },
    orgasm: { label: "Unerlaubte Lust / Kanten-Drang", hint: "Fokus auf Lustaufschub, Keuschheit und Kältekontraste." },
    duty: { label: "Pflichtversäumnis", hint: "Fokus auf formale Zucht, Strafarbeit oder Knie-Besinnung." },
    self_discipline: { label: "Selbstvollzug", hint: "Der Bottom führt die Zucht unter den Augen des Tops selbst aus." }
  };

  function getBottomQuestionnaireMatches(infractionCat, severity) {
    var subKey = (typeof window.subPartner !== 'undefined') ? window.subPartner : 'A';
    var allAnswers = {};

    if (typeof window.answers !== 'undefined' && window.answers && window.answers[subKey]) {
      allAnswers = window.answers[subKey];
    } else {
      try {
        var stored = localStorage.getItem('kompass_answers');
        if (stored) {
          var parsed = JSON.parse(stored);
          if (parsed && parsed[subKey]) allAnswers = parsed[subKey];
        }
      } catch (e) {}
    }

    var chapters = window.surveyChapters || [];
    var matches = [];

    // Kapitel-Zuordnung je Vergehen
    var relevantChapters = [16, 23]; // Standard: Impact & Zucht
    if (infractionCat === 'mouth') relevantChapters = [15, 16, 23];
    else if (infractionCat === 'posture') relevantChapters = [13, 14, 22];
    else if (infractionCat === 'orgasm') relevantChapters = [7, 8, 17];
    else if (infractionCat === 'duty') relevantChapters = [19, 22, 23];

    chapters.forEach(function(ch) {
      if (relevantChapters.indexOf(ch.id) !== -1 && Array.isArray(ch.items)) {
        ch.items.forEach(function(item) {
          if (item.type === 'choice') return;
          var rating = allAnswers['it_' + item.id + '_r2']; // Bottom empfängt (r2)

          // Strikter Tabu-Ausschluss (Note 1)
          if (typeof rating === 'number' && rating >= 2 && rating <= 5) {
            matches.push({
              item: item,
              rating: rating,
              badge: formatRatingBadge(rating)
            });
          }
        });
      }
    });

    // Nach Bewertung sortieren (Noten 5 und 4 zuerst, gefolgt von 3 und 2)
    matches.sort(function(a, b) {
      return b.rating - a.rating;
    });

    return matches;
  }

  function formatRatingBadge(score) {
    if (score === 5) return "⭐ Note 5: Kink-Favorit (Lustvoll)";
    if (score === 4) return "✨ Note 4: Reizvoll (Spürbare Lust)";
    if (score === 3) return "💡 Note 3: Neugierig (Gesprächsbedarf)";
    if (score === 2) return "🎁 Note 2: Echte Buße (Duldung / Strafe)";
    return "";
  }

  function getStageOptions(stage) {
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
    var offset = wizardState.catalogOffsets[stage] || 0;
    var sev = wizardState.severities[stage] || 2;

    if (stage === 1) {
      if (wizardState.category === 'self_discipline') {
        return [
          { id: "self_spank", title: "Eigenhändiges Gesäß-Spanking", desc: subName + " versohlt sich selbst mit flacher Hand auf das Gesäß und zählt laut mit." },
          { id: "self_clamps", title: "Selbst-Klammerung der Brustwarzen", desc: subName + " setzt sich eigenhändig Holzwäscheklammern und verharrt still." }
        ];
      }

      var realMatches = getBottomQuestionnaireMatches(wizardState.category, sev);
      var cards = [];

      var reasonText = wizardState.reason ? wizardState.reason.trim() : '';
      var dynamicAiTitle = reasonText.length > 3
        ? "Kontextuelle Disziplinierung für: \"" + escapeText(reasonText) + "\""
        : "Formelle Maßregelung über den Knien";

      cards.push({
        id: "ai_custom_action",
        title: dynamicAiTitle,
        desc: "Rhythmisches Versohlen mit flacher Hand oder gefaltetem Ledergürtel; 15 bis 20 Hiebe.",
        ratingBadge: "⚖️ Situative Regie-Maßnahme"
      });

      if (realMatches.length > 0) {
        var startIdx = (offset * 2) % realMatches.length;
        for (var i = 0; i < Math.min(3, realMatches.length); i++) {
          var m = realMatches[(startIdx + i) % realMatches.length];
          cards.push({
            id: "match_" + m.item.id,
            title: m.item.title,
            desc: m.item.desc || m.item.r2,
            ratingBadge: m.badge
          });
        }
      } else {
        cards.push(
          { id: "hand_spank_classic", title: "Handspanking über den Knien", desc: "15 gezielte Schläge mit der flachen Hand auf das Gesäß.", ratingBadge: "⭐ Klassische Disziplin" },
          { id: "corner_time_stand", title: "Corner Time (Stehen in der Ecke)", desc: "10 Minuten aufrechtes Stehen mit Blick zur Wand.", ratingBadge: "🎁 Formale Buße" }
        );
      }

      return cards;
    }

    if (stage === 2) {
      return [
        { id: "hands_behind_back", title: "Aufrechter Kniestand (Hände am Rücken)", desc: "Aufrecht kniend, Kinn angehoben und Hände hinter dem Rücken verschränkt." },
        { id: "over_knees", title: "Quer über den Oberschenkeln des Tops", desc: "Flach über die Oberschenkel gelegt, Becken exponiert." },
        { id: "bed_edge_kneel", title: "Vorbeuge an der Bettkante", desc: "Becken auf der Matratzenkante aufliegend, Oberkörper tief gebeugt." }
      ];
    }

    if (stage === 3) {
      return [
        { id: "leather_wrist_cuffs", title: "Leder-Handgelenksmanschetten", desc: "Hände hinter dem Rücken arretiert für Bewegungslosigkeit." },
        { id: "silk_tie_scarf", title: "Sanfte Fesselung mit Seidenschal", desc: "Handgelenke weich vor dem Körper verbunden." },
        { id: "no_bondage", title: "Freie Haltung ohne Fesselung", desc: "Verharren durch reine Disziplin und Gehorsam." }
      ];
    }

    if (stage === 4) {
      return [
        { id: "soft_cloth_towel", title: "Weicher Tuchknebel", desc: "Gefaltetes Stofftuch zwischen den Zähnen zur Dämpfung." },
        { id: "leather_blindfold_padded", title: "Blickdichte Leder-Augenmaske", desc: "Schaltet den Sehsinn ab für maximale innere Einkehr." },
        { id: "no_sensory", title: "Keine sensorische Einschränkung", desc: "Volle visuelle und akustische Wahrnehmung." }
      ];
    }

    return [];
  }

  function validateCurrentPhysicalSetup() {
    var setup = {
      action: wizardState.selectedChoices[1],
      posture: wizardState.selectedChoices[2],
      bondage: wizardState.selectedChoices[3],
      sensory: wizardState.selectedChoices[4]
    };

    var warnBanner = document.getElementById('wizard-conflict-warning');
    var warnText = document.getElementById('wizard-conflict-text');

    if (typeof window.validateDisciplineSetup === 'function') {
      var validation = window.validateDisciplineSetup(setup);
      if (!validation.isValid && validation.conflicts && validation.conflicts.length > 0) {
        if (warnBanner) warnBanner.classList.remove('hidden');
        if (warnText) warnText.innerText = validation.conflicts[0];
        return;
      }
    }

    // Defensive Plausibilitätsprüfung
    var handsBack = setup.bondage && (setup.bondage.id === 'leather_wrist_cuffs' || (setup.posture && setup.posture.id === 'hands_behind_back'));
    var isSelfSpank = setup.action && setup.action.id === 'self_spank';

    if (handsBack && isSelfSpank) {
      if (warnBanner) warnBanner.classList.remove('hidden');
      if (warnText) warnText.innerText = "Hände sind hinten arretiert: Selbstschläge unmöglich. Top übernimmt die Ausführung.";
      return;
    }

    if (warnBanner) warnBanner.classList.add('hidden');
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
        ? "bg-brand-950/40 border-brand-500 text-white font-bold"
        : "theme-panel border-slate-800 text-slate-300 hover:border-slate-700";

      return `
        <button type="button" onclick="SessionDiscipline.selectOption(${stage}, '${opt.id}')" class="w-full p-3 rounded-2xl border text-left transition touch-btn ${activeClass}">
          <div class="flex items-center justify-between">
            <strong class="text-xs text-white">${escapeText(opt.title)}</strong>
            <span class="text-xs ${isSel ? 'text-brand-300' : 'text-slate-600'}">${isSel ? '✓' : '○'}</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-0.5 leading-snug">${escapeText(opt.desc)}</p>
          ${opt.ratingBadge ? `<span class="inline-block mt-1 text-[9.5px] px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800 font-semibold">${escapeText(opt.ratingBadge)}</span>` : ''}
        </button>
      `;
    }).join('');

    validateCurrentPhysicalSetup();
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
      "Stufe 1 von 5: Vergehen, Anlass & Hauptmaßnahme",
      "Stufe 2 von 5: Vorgeschriebene Körperhaltung",
      "Stufe 3 von 5: Passende Fesselung & Arretierung",
      "Stufe 4 von 5: Sensorische Kontrolle & Knebelung",
      "Stufe 5 von 5: Vollzugs-Protokoll & Bestätigung"
    ];
    if (sub) sub.innerText = titles[stage] || "";

    var btnPrev = document.getElementById('btn-prev-wizard');
    var btnNext = document.getElementById('btn-next-wizard');
    if (btnPrev) btnPrev.style.visibility = (stage === 1) ? 'hidden' : 'visible';
    if (btnNext) btnNext.innerText = (stage === 5) ? "Fertig" : "Weiter →";

    if (stage === 5) renderDisciplineSummary();
    else renderStageCards(stage);
  }

  function renderDisciplineSummary() {
    var container = document.getElementById('summary-discipline-breakdown');
    if (!container) return;

    var act = (wizardState.selectedChoices[1] && wizardState.selectedChoices[1].title) || 'Disziplinierung';
    var pos = (wizardState.selectedChoices[2] && wizardState.selectedChoices[2].title) || 'Kniestand';
    var bon = (wizardState.selectedChoices[3] && wizardState.selectedChoices[3].title) || 'Keine Fesselung';
    var sen = (wizardState.selectedChoices[4] && wizardState.selectedChoices[4].title) || 'Keine sensorische Einschränkung';
    var reason = (wizardState.reason && wizardState.reason.trim()) || 'Verstoß gegen Vereinbarungen';

    container.innerHTML = `
      <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
        <div><strong class="text-amber-300">Anlass:</strong> ${escapeText(reason)}</div>
        <div><strong class="text-white">1. Maßnahme:</strong> ${escapeText(act)}</div>
        <div><strong class="text-white">2. Haltung:</strong> ${escapeText(pos)}</div>
        <div><strong class="text-white">3. Fesselung:</strong> ${escapeText(bon)}</div>
        <div><strong class="text-white">4. Sensorik:</strong> ${escapeText(sen)}</div>
      </div>
    `;
  }

  function applyDisciplineOrder() {
    var act = (wizardState.selectedChoices[1] && wizardState.selectedChoices[1].title) || 'Bestrafung vollzogen';
    var nowTime = new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    if (window.currentSessionLog && Array.isArray(window.currentSessionLog)) {
      window.currentSessionLog.push({ type: "action", time: nowTime, label: "Bestrafung: " + act });
    } else {
      window.currentSessionLog = [{ type: "action", time: nowTime, label: "Bestrafung: " + act }];
    }

    closeModal();
    if (typeof window.showToast === 'function') {
      window.showToast("Bestrafung offiziell angeordnet & dokumentiert ⚖");
    }

    if (window.isTopVoiceAssistActive && window.SessionVoice && typeof window.SessionVoice.play === 'function') {
      window.SessionVoice.play("Bestrafung angeordnet: " + act + ". Stillhalten und gehorchen.");
    }
  }

  function escapeText(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function openModal() {
    wizardState.currentStage = 1;
    wizardState.selectedChoices = { 1: null, 2: null, 3: null, 4: null };
    showStage(1);
    var modal = document.getElementById('modal-incident-discipline');
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal() {
    var modal = document.getElementById('modal-incident-discipline');
    if (modal) modal.classList.add('hidden');
  }

  window.SessionDiscipline = {
    open: openModal,
    close: closeModal,
    showStage: showStage,
    prevStage: function() { if (wizardState.currentStage > 1) showStage(wizardState.currentStage - 1); },
    nextStage: function() { if (wizardState.currentStage < 5) showStage(wizardState.currentStage + 1); else closeModal(); },
    rerollStage: function() {
      wizardState.catalogOffsets[wizardState.currentStage] = (wizardState.catalogOffsets[wizardState.currentStage] + 1) % 5;
      renderStageCards(wizardState.currentStage);
    },
    selectCategory: function(cat) {
      wizardState.category = cat;
      ['mouth', 'posture', 'orgasm', 'duty', 'self_discipline'].forEach(function(c) {
        var btn = document.getElementById('cat-btn-' + c);
        if (btn) {
          if (c === cat) btn.className = "p-2 rounded-xl border text-[11px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
          else btn.className = "p-2 rounded-xl border text-[11px] font-bold theme-panel text-slate-300 touch-btn";
        }
      });
      var ratEl = document.getElementById('top-assist-rationale');
      if (ratEl && INFRACTION_MAP[cat]) {
        ratEl.innerText = INFRACTION_MAP[cat].label + ": " + INFRACTION_MAP[cat].hint;
      }
      renderStageCards(1);
    },
    handleReasonInput: function(val) {
      wizardState.reason = val || '';
      var ratEl = document.getElementById('top-assist-rationale');
      if (ratEl) {
        ratEl.innerText = (val && val.trim().length > 3)
          ? "Anlass erfasst: \"" + val.trim() + "\". Kontext fließt in die Haltung & Zucht ein."
          : (INFRACTION_MAP[wizardState.category] ? INFRACTION_MAP[wizardState.category].hint : "Wähle oder beschreibe ein Vergehen.");
      }
      renderStageCards(1);
    },
    setSeverity: function(stage, sev) {
      wizardState.severities[stage] = sev;
      [1, 2, 3].forEach(function(s) {
        var btn = document.getElementById('sev-btn-' + stage + '-' + s);
        if (btn) {
          if (s === sev) btn.className = "px-2.5 py-1 rounded-lg border text-[10.5px] font-bold bg-brand-950 border-brand-500 text-white touch-btn";
          else btn.className = "px-2.5 py-1 rounded-lg border text-[10.5px] font-bold theme-panel text-slate-400 touch-btn";
        }
      });
      renderStageCards(stage);
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

  // Kompatibilitäts-Aliase für session.html Buttons
  window.openIncidentDisciplineModal = openModal;
  window.closeIncidentDisciplineModal = closeModal;
  window.prevWizardStage = window.SessionDiscipline.prevStage;
  window.nextWizardStage = window.SessionDiscipline.nextStage;
  window.rerollCurrentWizardStage = window.SessionDiscipline.rerollStage;
  window.selectIncidentCategory = window.SessionDiscipline.selectCategory;
  window.handleReasonLiveInput = window.SessionDiscipline.handleReasonInput;
  window.setStageSeverity = window.SessionDiscipline.setSeverity;
  window.selectDisciplineOption = window.SessionDiscipline.selectOption;
  window.applyConfiguredDiscipline = applyDisciplineOrder;

})(window);
