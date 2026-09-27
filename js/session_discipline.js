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
    catalogOffsets: { 1: 0, 2: 0, 3: 0, 4: 0 },
    randomSeed: 0
  };

  var INFRACTION_MAP = {
    mouth: { label: "Widerrede & Frechheit", hint: "Fokus auf Dämpfung des Redeflusses, Mund-Knechtung & Demut." },
    posture: { label: "Haltungsfehler & Zappeln", hint: "Fokus auf feste Arretierung, Kniestand & Zucht der Willenskraft." },
    orgasm: { label: "Unerlaubte Lust & Drang", hint: "Fokus auf Kanten-Quälerei, Keuschheit, Kälte & Genital-Impact." },
    duty: { label: "Pflichtversäumnis", hint: "Fokus auf formale Zucht, Gesäß-Spanking & körperliches Dienen." },
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

    // Stets im Haushalt oder Körper vorhanden
    var ALWAYS_ALLOWED = [
      'hand', 'finger', 'körper', 'stimme', 'bett', 'wand', 'boden', 'kniestand', 
      'gürtel', 'krawatte', 'schal', 'tuch', 'handtuch', 'wäscheklammer', 'klammer', 
      'eiswürfel', 'eis', 'kissen', 'kleidung', 'stuhl', 'hocker', 'gesicht'
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

  function isPracticeAllowedByBottom(item) {
    var answers = getBottomAnswers();
    var r2 = answers['it_' + item.id + '_r2'];
    // Note 1 ist absolutes VETO
    if (r2 === 1) return false;
    return true;
  }

  function getStageOptions(stage) {
    var subName = (window.names && window.names[window.subPartner]) || 'Bottom';
    var topName = (window.names && window.names[window.topPartner]) || 'Top';
    var seed = wizardState.randomSeed + wizardState.catalogOffsets[stage];

    // STUFE 1: KREATIVE MASSNAHMEN & STRAFAKTIONEN
    if (stage === 1) {
      var pool = [];

      // 1. KREATIVE KOMBINATION: Facesitting & Orale Unterwerfung + Genital-Impact
      pool.push({
        id: "combo_facesitting_cbt",
        title: "👑 Facesitting-Herrschaft & Genital-Zucht",
        desc: topName + " nimmt auf dem Gesicht von " + subName + " Platz und fordert ununterbrochenes Dienen mit der Zunge, während " + topName + " gleichzeitig gezielte Schläge oder Zupfer mit flacher Hand auf Oberschenkelinnenseiten oder Genitalien setzt.",
        ratingBadge: "🔥 Kreative Macht-Kombination"
      });

      // 2. KREATIVE KOMBINATION: Klammern & Edging-Folter
      pool.push({
        id: "combo_clamps_edging",
        title: "⚡ Klammern-Arretierung & Kanten-Quälerei",
        desc: "Brustwarzen (oder Schamlippen/Hodensack) von " + subName + " werden mit Wäscheklammern belegt. Während der Schmerz pulsiert, berührt " + topName + " fordernd die Genitalien bis kurz vor die Kante – der Orgasmus wird streng verwehrt.",
        ratingBadge: "🎢 Lust-Schmerz-Kontrast"
      });

      // 3. KREATIVE KOMBINATION: Eis-Schock & Spanking-Hitze
      pool.push({
        id: "combo_ice_spank",
        title: "🧊 Eiskontrast & Rhythmisches Versohlen",
        desc: topName + " fährt mit schmelzenden Eiswürfeln langsam über Gesäß und Schenkel von " + subName + ", gefolgt von sofortigen, scharfen Hieben mit Ledergürtel oder flacher Hand zur feurigen Durchblutung.",
        ratingBadge: "❄️ Thermische Sensibilisierung"
      });

      // 4. KREATIVE KOMBINATION: Zähl-Pflicht mit Demuts-Dank
      pool.push({
        id: "combo_spank_counting",
        title: "✋ Formelles Zucht-Versohlen (15 Hiebe)",
        desc: "15 gezielte Treffer über die Knie. " + subName + " muss nach jedem Hieb laut rufen: 'Danke, mein Top, für Schlag Nummer X!' – bei Versprechern beginnt das Zählen von vorn.",
        ratingBadge: "⚖️ Klassische Disziplin & Gehorsam"
      });

      // 5. KREATIVE KOMBINATION: Fuß-Unterwerfung & Schau-Demut
      pool.push({
        id: "combo_foot_worship_chastise",
        title: "🧎 Fuß-Unterwerfung unter strenger Aufsicht",
        desc: subName + " kniet mit gesenktem Kopf zu Füßen des Tops, massiert und küsst dessen Füße/Zehen, während der Top bei der kleinsten Unaufmerksamkeit mit dem Zeigefinger oder Gürtel die Haltung korrigiert.",
        ratingBadge: "👑 Psychologische Unterwerfung"
      });

      // 6. KREATIVE KOMBINATION: Selbst-Zucht unter Aufsicht
      if (wizardState.category === 'self_discipline' || seed % 3 === 0) {
        pool.push({
          id: "combo_self_spank_mirror",
          title: "🪞 Selbstversohlen mit Blickkontakt",
          desc: subName + " muss sich mit eigener Hand kraftvoll auf das Gesäß schlagen, während der Blick unverwandt in den Augen des Tops ruht. Der Top bestimmt Lautstärke und Rhythmus.",
          ratingBadge: "🙈 Scham-Faktor & Selbstüberwindung"
        });
      }

      // 7. Situationeller Freitext-Vorschlag, falls der Top einen Anlass getippt hat
      if (wizardState.reason && wizardState.reason.trim().length > 2) {
        pool.unshift({
          id: "custom_reason_chastisement",
          title: "⚖️ Situative Sühne für: „" + escapeText(wizardState.reason.trim()) + "“",
          desc: "Maßgeschneiderte Buße: 20 Schläge mit flacher Hand auf das Gesäß, gefolgt von 5 Minuten absolutem Kniestand mit gesenktem Kopf zur Besinnung.",
          ratingBadge: "✨ Maßgeschneiderte Einzelfall-Zucht"
        });
      }

      // Shuffeln nach Seed / Offset
      return rotateArray(pool, seed).slice(0, 3);
    }

    // STUFE 2: VORGESCHRIEBENE KÖRPERHALTUNG
    if (stage === 2) {
      var postures = [
        { id: "posture_kneel_nadu", title: "Aufrechter Kniestand (Nadu / Seiza)", desc: "Aufrecht kniend, Fersen unter dem Gesäß, Brust herausgedrückt, Kinn parallel zum Boden." },
        { id: "posture_over_lap", title: "Flach über den Oberschenkeln des Tops (OTK)", desc: "Bauchlage quer über den Beinen des sitzenden Tops. Das Gesäß ist maximal exponiert." },
        { id: "posture_bed_bend", title: "Tiefe Vorbeuge an der Bettkante", desc: "Oberkörper flach auf der Matratze abgelegt, Beine stehen hüftbreit am Boden, Becken hochgestellt." },
        { id: "posture_all_fours_arch", title: "Katzenbuckel im Vierfüßlerstand", desc: "Hände und Knie auf dem Boden, Wirbelsäule durchgedrückt, Blick starr zu den Füßen des Tops." },
        { id: "posture_standing_wall", title: "Wand-Kuss (Stehen mit Stirn an der Wand)", desc: "Füße 50cm von der Wand entfernt, nur die Stirn berührt die Wand, Hände hinter dem Rücken." }
      ];
      return rotateArray(postures, seed).slice(0, 3);
    }

    // STUFE 3: PASSENDE FESSELUNG & ARRETIERUNG
    if (stage === 3) {
      var bondages = [];

      if (isToolAvailableInClosetOrHousehold('cuffs') || isToolAvailableInClosetOrHousehold('manschette')) {
        bondages.push({ id: "bondage_leather_cuffs", title: "Leder-Handfesseln hinter dem Rücken", desc: "Feste Fixierung der Handgelenke hinter der Lendenwirbelsäule für vollkommene Wehrlosigkeit." });
      }

      bondages.push({ id: "bondage_silk_scarf", title: "Seidenschal / Krawatte um die Handgelenke", desc: "Weiche, aber unnachgiebige Schlingenbindung vor dem Körper." });

      if (isToolAvailableInClosetOrHousehold('shibari') || isToolAvailableInClosetOrHousehold('seil')) {
        bondages.push({ id: "bondage_shibari_chest", title: "Shibari-Brustgeschirr (Karada / Takate Kote)", desc: "Feste Seilbindung des Oberkörpers zur automatischen Aufrichtung der Wirbelsäule." });
      }

      bondages.push({ id: "bondage_thigh_spread", title: "Schenkel-Spreizung mit Gürtel oder Band", desc: "Knie werden mit einem Riemen auf Abstand arretiert, Schließen der Beine unmöglich." });
      bondages.push({ id: "bondage_none_pure_will", title: "Keine Fesselung – Disziplin durch reinen Gehorsam", desc: "Die Haltung muss allein durch mentale Selbstbeherrschung reglos gehalten werden." });

      return rotateArray(bondages, seed).slice(0, 3);
    }

    // STUFE 4: SENSORISCHE KONTROLLE & KNEBELUNG
    if (stage === 4) {
      var sensory = [];

      sensory.push({ id: "sensory_cloth_gag", title: "Weicher Tuchknebel (Stofftuch / Seidenschal)", desc: "Sorgt für sanfte Dämpfung von Lauten und signalisiert symbolische Sprachlosigkeit." });

      if (isToolAvailableInClosetOrHousehold('knebel') || isToolAvailableInClosetOrHousehold('gag')) {
        sensory.push({ id: "sensory_ball_gag", title: "Schrank-Knebel (Ball- oder Ringknebel)", desc: "Hält den Kiefer geöffnet und erzwingt vollständiges Verstummen." });
      }

      if (isToolAvailableInClosetOrHousehold('maske') || isToolAvailableInClosetOrHousehold('blindfold')) {
        sensory.push({ id: "sensory_leather_blindfold", title: "Gepolsterte Schlaf- oder Ledermaske", desc: "Schaltet den Sehsinn komplett aus – jeder Reiz trifft unangekündigt ein." });
      } else {
        sensory.push({ id: "sensory_scarf_blindfold", title: "Dunkler Schal als Augenbinde", desc: "Einfache, blickdichte Augenbedeckung für verstärkte sensorische Fokussierung." });
      }

      sensory.push({ id: "sensory_none_eye_contact", title: "Keine Sinnesreduktion – Strenger Blickkontakt", desc: "Volle Sinneswahrnehmung. Der Bottom muss dem Top ununterbrochen in die Augen blicken." });

      return rotateArray(sensory, seed).slice(0, 3);
    }

    return [];
  }

  function rotateArray(arr, count) {
    if (!arr || arr.length === 0) return [];
    var offset = count % arr.length;
    return arr.slice(offset).concat(arr.slice(0, offset));
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

    var isSelfSpank = action && (action.id === 'combo_self_spank_mirror');
    var isHandsBoundBehind = (bondage && bondage.id === 'bondage_leather_cuffs') || (posture && posture.id === 'posture_standing_wall');

    if (isSelfSpank && isHandsBoundBehind) {
      if (warnBanner) warnBanner.classList.remove('hidden');
      if (warnText) warnText.innerText = "Konflikt: Hände sind hinten fixiert – Selbstschläge nicht möglich. Der Top übernimmt die Ausführung.";
      return;
    }

    if (warnBanner) warnBanner.classList.add('hidden');
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

    // Re-Roll Button in den Stufen 2 bis 4 dynamisch sicherstellen
    injectRerollButtonForStage(stage);

    if (stage === 5) renderDisciplineSummary();
    else renderStageCards(stage);
  }

  function injectRerollButtonForStage(stage) {
    if (stage >= 2 && stage <= 4) {
      var stageEl = document.getElementById('wizard-stage-' + stage);
      if (stageEl && !document.getElementById('reroll-btn-stage-' + stage)) {
        var headerDiv = stageEl.querySelector('strong');
        if (headerDiv && !headerDiv.parentElement.classList.contains('flex')) {
          var wrap = document.createElement('div');
          wrap.className = "flex items-center justify-between";
          headerDiv.parentNode.insertBefore(wrap, headerDiv);
          wrap.appendChild(headerDiv);

          var btn = document.createElement('button');
          btn.type = "button";
          btn.id = 'reroll-btn-stage-' + stage;
          btn.className = "text-brand-300 font-bold hover:underline text-xs flex items-center gap-1";
          btn.innerHTML = "<span>Würfeln</span><span>🎲</span>";
          btn.onclick = function() { SessionDiscipline.rerollStage(); };
          wrap.appendChild(btn);
        }
      }
    }
  }

  function renderDisciplineSummary() {
    var container = document.getElementById('summary-discipline-breakdown');
    if (!container) return;

    var act = (wizardState.selectedChoices[1] && wizardState.selectedChoices[1].title) || 'Disziplinierungs-Maßnahme';
    var pos = (wizardState.selectedChoices[2] && wizardState.selectedChoices[2].title) || 'Kniestand';
    var bon = (wizardState.selectedChoices[3] && wizardState.selectedChoices[3].title) || 'Keine Fesselung';
    var sen = (wizardState.selectedChoices[4] && wizardState.selectedChoices[4].title) || 'Keine sensorische Einschränkung';
    var reason = (wizardState.reason && wizardState.reason.trim()) || 'Verstoß gegen Schlafzimmer-Regeln';

    container.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-2">
        <div class="border-b border-slate-800 pb-1.5"><strong class="text-amber-300">Anlass:</strong> <span class="text-white">${escapeText(reason)}</span></div>
        <div><strong class="text-brand-300">1. Maßnahme:</strong> <span class="text-slate-200">${escapeText(act)}</span></div>
        <div><strong class="text-indigo-300">2. Haltung:</strong> <span class="text-slate-200">${escapeText(pos)}</span></div>
        <div><strong class="text-teal-300">3. Fesselung:</strong> <span class="text-slate-200">${escapeText(bon)}</span></div>
        <div><strong class="text-purple-300">4. Sensorik:</strong> <span class="text-slate-200">${escapeText(sen)}</span></div>
      </div>
    `;
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
      window.SessionVoice.play("Urteil gesprochen. " + act + ". Sofortige Hinnahme ohne Widerspruch.");
    }
  }

  function openModal() {
    wizardState.currentStage = 1;
    wizardState.randomSeed = Math.floor(Math.random() * 100);
    wizardState.selectedChoices = { 1: null, 2: null, 3: null, 4: null };
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
    rerollStage: function() {
      wizardState.catalogOffsets[wizardState.currentStage] = (wizardState.catalogOffsets[wizardState.currentStage] + 1);
      wizardState.selectedChoices[wizardState.currentStage] = null;
      renderStageCards(wizardState.currentStage);
      if (typeof window.showToast === 'function') {
        window.showToast("Optionen neu ausgewürfelt 🎲");
      }
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
