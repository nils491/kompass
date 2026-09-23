// js/app.js - Master-Anwendungslogik für den Kink- & Beziehungs-Kompass

let currentUser = 'A';
let currentChapterIndex = 0;
let activeSurveyFilter = 'all';
let surveySearchQuery = '';
let singleRadarInstance = null;
let onboardingStep = 1;

let names = { A: 'Partner 1', B: 'Partner 2' };
let anatomy = { A: 'penis', B: 'vulva' };
let answers = { A: {}, B: {} };
let notes = { A: {}, B: {} };
let shameFlags = { A: {}, B: {} };
let chapterReflections = { A: {}, B: {} };
let customKinks = [];

let privacy = {
  A: { mode: 'blind', shareNotes: true },
  B: { mode: 'blind', shareNotes: true }
};

let accounts = {
  A: { email: '', partnerEmail: '', setupDone: false },
  B: { email: '', partnerEmail: '', setupDone: false }
};

let safetyConfig = {
  A: {
    emergency_tools: 'cutter_mandatory',
    storage_privacy: 'safe_box',
    digital_privacy: 'pin_vault',
    safeword: 'traffic',
    gag_signal: 'drop_cloth',
    tactile_signal: 'hand_squeeze',
    vital_checks: 'pulse_15min',
    numbness_rule: 'stop_immediate',
    pain_classification: 'tissue_vs_joint',
    substance_rule: 'sober_100',
    bedside_care: 'water_glucose',
    room_climate: 'warm_blankets',
    distraction_block: 'flight_mode',
    disobedience: 'spanking',
    conflict_boundary: 'relationship_first',
    aftercare: 'warmth',
    cooldown_phase: 'offline_20min',
    checkin_24h: 'checkin_mandatory'
  },
  B: {
    emergency_tools: 'cutter_mandatory',
    storage_privacy: 'safe_box',
    digital_privacy: 'pin_vault',
    safeword: 'traffic',
    gag_signal: 'drop_cloth',
    tactile_signal: 'hand_squeeze',
    vital_checks: 'pulse_15min',
    numbness_rule: 'stop_immediate',
    pain_classification: 'tissue_vs_joint',
    substance_rule: 'sober_100',
    bedside_care: 'water_glucose',
    room_climate: 'warm_blankets',
    distraction_block: 'flight_mode',
    disobedience: 'spanking',
    conflict_boundary: 'relationship_first',
    aftercare: 'warmth',
    cooldown_phase: 'offline_20min',
    checkin_24h: 'checkin_mandatory'
  }
};

const safetyModulesData = [
  {
    id: "module_1",
    title: "1. Notfall-Werkzeuge & Ausrüstungs-Standard",
    icon: "✂️",
    desc: "Vorbereitung der physischen Umgebung und sichere Aufbewahrung.",
    items: [
      {
        key: "emergency_tools",
        title: "Sicherheits-Cutter / Bandschneider",
        options: [
          { val: "cutter_mandatory", label: "✂️ Pflicht: Liegt bei jeder Fesselung/Seilsession sichtbar in Griffweite des Tops" },
          { val: "cutter_shibari", label: "🪢 Nur bei komplexem Seil-Shibari zwingend erforderlich" },
          { val: "cutter_velcro_only", label: "🩹 Nicht nötig: Wir nutzen vorerst nur Klettfesseln mit Schnellöffnung" }
        ]
      },
      {
        key: "storage_privacy",
        title: "Aufbewahrung & Kinderschutz",
        options: [
          { val: "safe_box", label: "🔒 Abschließbare Truhe oder Schrankfach mit Zahlencode ist Pflicht" },
          { val: "bedroom_door", label: "🚪 Abgeschlossene Schlafzimmertür reicht uns völlig aus" },
          { val: "no_kids", label: "🏠 Keine Kinder im Haushalt vorhanden" }
        ]
      },
      {
        key: "digital_privacy",
        title: "Digitale Diskretion & Fotos",
        options: [
          { val: "pin_vault", label: "📱 Strikter PIN-geschützter Foto-Tresor (keine Cloud-Synchronisation)" },
          { val: "no_photos", label: "⛔ Grundsatz: Niemals intime Fotos oder Aufnahmen anfertigen" },
          { val: "trusted", label: "🤝 Entspannter, vertrauensbasierter Umgang ohne Spezialsperren" }
        ]
      }
    ]
  },
  {
    id: "module_2",
    title: "2. Not-Signale & Safeword-System",
    icon: "🚦",
    desc: "Verbindliche Signale für Abbruch, Temposenkung und Handlungsfähigkeit.",
    items: [
      {
        key: "safeword",
        title: "Primäres verbales Safeword",
        options: [
          { val: "traffic", label: "🚦 Klassische Ampel (Grün = Weiter, Gelb = Sanfter/Pause, Rot = Sofort-Stopp)" },
          { val: "code_word", label: "🌵 Festes Code-Wort (z. B. 'Kaktus' oder 'Halt')" },
          { val: "intuitive", label: "💬 Rein intuitive Klärung mit normalen Stopp-Worten" }
        ]
      },
      {
        key: "gag_signal",
        title: "Nonverbales Knebel- & Blockade-Signal",
        options: [
          { val: "drop_cloth", label: "🪨 Drop-Tuch: Tuch in der geschlossenen Hand; fällt es zu Boden, stoppt alles sofort" },
          { val: "fist_tap", label: "✊ Feste Faust für 3 Sekunden oder 3x deutliches Abklopfen (Tap-Out)" },
          { val: "bell_rattle", label: "🔔 Akustischer Signalgeber (Glöckchen oder Rassel in der Hand)" }
        ]
      },
      {
        key: "tactile_signal",
        title: "Taktiles Handdrück-Signal",
        options: [
          { val: "hand_squeeze", label: "🤝 2x Drücken = Gut / 3x Drücken = Sanfter / Hand erschlafft = Sofort-Stopp" },
          { val: "no_squeeze", label: "❌ Kein taktiles Handdrücken vereinbart" }
        ]
      }
    ]
  },
  {
    id: "module_3",
    title: "3. Physische Vital-Checks & Nervenschutz",
    icon: "🩺",
    desc: "Körperliche Unversehrtheit und Ausschluss dauerhafter Nervenschäden.",
    items: [
      {
        key: "vital_checks",
        title: "Puls- & Zirkulationsprüfung bei Fixierungen",
        options: [
          { val: "pulse_15min", label: "⏱️ Verbindlicher 15-Minuten-Check: Finger-Temperatur, Hautfarbe & Puls prüfen" },
          { val: "pulse_as_needed", label: "👂 Prüfung nur nach Gefühl und auf Zuruf des Partners" }
        ]
      },
      {
        key: "numbness_rule",
        title: "Umgang mit Kribbeln & Taubheitsgefühl",
        options: [
          { val: "stop_immediate", label: "⚡ Eiserne Regel: Beim ersten Kribbeln oder Kältegefühl sofort Seile lockern" },
          { val: "check_then_loosen", label: "🔍 Kurz beobachten und erst bei Fortbestehen nachlassen" }
        ]
      },
      {
        key: "pain_classification",
        title: "Schmerz-Klassifikation",
        options: [
          { val: "tissue_vs_joint", label: "🎯 Strikte Trennung: Dumpfer Fleischreiz ist erlaubt – Gelenk-/Stechschmerz tabu" },
          { val: "subjective", label: "🎨 Rein subjektives Schmerzempfinden im Moment entscheiden lassen" }
        ]
      }
    ]
  },
  {
    id: "module_4",
    title: "4. Schlafzimmer-Vorbereitung & Rahmen",
    icon: "🛏️",
    desc: "Bedingungen für fokussierte, ungestörte Erotik.",
    items: [
      {
        key: "substance_rule",
        title: "Substanz- & Nüchternheitsregel",
        options: [
          { val: "sober_100", label: "🚫 100 % Nüchternheit: Keinerlei Alkohol oder berauschende Mittel vor Sessions" },
          { val: "wine_allowed", label: "🍷 Ein Glas Wein oder Sekt beim lockeren Vorspiel ist völlig in Ordnung" }
        ]
      },
      {
        key: "bedside_care",
        title: "Notfall-Versorgung am Bett",
        options: [
          { val: "water_glucose", label: "🥤 Wasserflasche mit Strohhalm & Traubenzucker liegen am Bett griffbereit" },
          { val: "on_demand", label: "🏃 Getränke und Snacks werden bei Bedarf aus der Küche geholt" }
        ]
      },
      {
        key: "room_climate",
        title: "Raumklima & Wärmeschutz",
        options: [
          { val: "warm_blankets", label: "🛌 Raum vorheizen & Zusatzdecken bereitlegen (unbewegte Körper kühlen rasch aus)" },
          { val: "standard_room", label: "🌡️ Normale Raumtemperatur ohne besondere Vorbereitung reicht" }
        ]
      },
      {
        key: "distraction_block",
        title: "Ablenkungs-Schutz",
        options: [
          { val: "flight_mode", label: "🔕 Flugmodus / Stummschaltung aller Telefone während der gesamten Session" },
          { val: "normal_phone", label: "📱 Telefone bleiben normal auf Vibration erreichbar" }
        ]
      }
    ]
  },
  {
    id: "module_5",
    title: "5. D/s-Rahmen & Umgang mit Ungehorsam",
    icon: "⚖️",
    desc: "Vereinbarungen für Hierarchie, Machtspiel und Disziplinierung.",
    items: [
      {
        key: "disobedience",
        title: "Umgang mit Regelverstößen / Frechheit",
        options: [
          { val: "spanking", label: "✋ Körperliche Zucht: Handspanking oder Versohlen über den Knien" },
          { val: "formal_corner", label: "🧘 Formale Besinnung: In der Ecke stehen (Corner Time), Knie-Abbitte, Strafzeilen" },
          { val: "chores_ban", label: "🧹 Praktische Wiedergutmachung: Hausarbeit, Smartphone-Verbot für den Abend" },
          { val: "talk_only", label: "💬 Keine Strafen: Reine liebevolle Klärung im Gespräch ohne Disziplinierung" }
        ]
      },
      {
        key: "conflict_boundary",
        title: "Alltagsstreit vs. Erotische Dynamik",
        options: [
          { val: "relationship_first", label: "🛡️ Echter Beziehungsstreit stoppt alle D/s-Rollen sofort; Vorrang hat die Liebe" },
          { val: "d_s_therapeutic", label: "⚡ Wir nutzen D/s manchmal bewusst zur Versöhnung nach Streitigkeiten" }
        ]
      }
    ]
  },
  {
    id: "module_6",
    title: "6. Aftercare-Protokoll & Nachsorge",
    icon: "🍵",
    desc: "Schutz vor dem Hormonabfall (Subdrop) und emotionale Re-Integration.",
    items: [
      {
        key: "aftercare",
        title: "Primärer Aftercare-Schwerpunkt",
        options: [
          { val: "warmth", label: "🛌 Körperwärme & Stille: Dicke Decken, heißer Tee, stummes Halten im Arm" },
          { val: "praise_words", label: "💖 Verbaler Zuspruch & Praise: Warmes Lob ('Braves Mädchen/Guter Junge'), Stolz" },
          { val: "bath_care", label: "🛁 Pflege-Ritual: Warmes Bad, Einbalsamieren der beanspruchten Haut mit Creme" }
        ]
      },
      {
        key: "cooldown_phase",
        title: "Abschalt-Phase nach der Session",
        options: [
          { val: "offline_20min", label: "📵 Mindestens 20 Minuten striktes Smartphone-Verbot nach der Session" },
          { val: "free_flow", label: "✨ Freier Übergang in den normalen Alltag nach Gefühl" }
        ]
      },
      {
        key: "checkin_24h",
        title: "24-Stunden-Nachsorge-Check",
        options: [
          { val: "checkin_mandatory", label: "💬 Verbindliche kurze Rückmeldung am nächsten Tag, um den Subdrop abzufangen" },
          { val: "checkin_optional", label: "🕊️ Rückmeldung nur, wenn sich jemand emotional unwohl fühlt" }
        ]
      }
    ]
  }
];

function initApp() {
  loadFromLocalStorage();
  checkUrlHashData();

  if (sessionStorage.getItem('kompass_unlocked') === 'true') {
    const lock = document.getElementById('site-lockscreen');
    if (lock) lock.classList.add('hidden');
    checkOnboardingStatus();
  }

  updateCurrentUserUI();
  renderCurrentChapter();
  renderQuickGrid();
  updateProgressBar();
  updateTabuBadge();
}

function verifySitePassword() {
  const input = document.getElementById('site-pw-input');
  const err = document.getElementById('pw-error-hint');
  const lock = document.getElementById('site-lockscreen');
  if (!input) return;

  if (input.value.trim() === 'Bommelchen!') {
    sessionStorage.setItem('kompass_unlocked', 'true');
    if (lock) lock.classList.add('hidden');
    if (err) err.classList.add('hidden');
    showToast("Erfolgreich entsperrt!");
    checkOnboardingStatus();
  } else {
    if (err) err.classList.remove('hidden');
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('kompass_answers', JSON.stringify(answers));
    localStorage.setItem('kompass_notes', JSON.stringify(notes));
    localStorage.setItem('kompass_shame', JSON.stringify(shameFlags));
    localStorage.setItem('kompass_reflections', JSON.stringify(chapterReflections));
    localStorage.setItem('kompass_custom_kinks', JSON.stringify(customKinks));
    localStorage.setItem('kompass_names', JSON.stringify(names));
    localStorage.setItem('kompass_anatomy', JSON.stringify(anatomy));
    localStorage.setItem('kompass_privacy', JSON.stringify(privacy));
    localStorage.setItem('kompass_accounts', JSON.stringify(accounts));
    localStorage.setItem('kompass_safety_config', JSON.stringify(safetyConfig));
  } catch (e) {
    console.error("Fehler beim Speichern:", e);
  }
}

function loadFromLocalStorage() {
  try {
    const a = localStorage.getItem('kompass_answers');
    const n = localStorage.getItem('kompass_notes');
    const sh = localStorage.getItem('kompass_shame');
    const cr = localStorage.getItem('kompass_reflections');
    const ck = localStorage.getItem('kompass_custom_kinks');
    const nm = localStorage.getItem('kompass_names');
    const an = localStorage.getItem('kompass_anatomy');
    const p = localStorage.getItem('kompass_privacy');
    const ac = localStorage.getItem('kompass_accounts');
    const sc = localStorage.getItem('kompass_safety_config');

    if (a) answers = JSON.parse(a);
    if (n) notes = JSON.parse(n);
    if (sh) shameFlags = JSON.parse(sh);
    if (cr) chapterReflections = JSON.parse(cr);
    if (ck) customKinks = JSON.parse(ck);
    if (nm) names = JSON.parse(nm);
    if (an) anatomy = JSON.parse(an);
    if (p) privacy = JSON.parse(p);
    if (ac) accounts = JSON.parse(ac);
    if (sc) safetyConfig = JSON.parse(sc);
  } catch (e) {
    console.error("Fehler beim Laden:", e);
  }
}

function checkUrlHashData() {
  if (!window.location.hash.startsWith('#data=')) return;
  try {
    const raw = window.location.hash.replace('#data=', '');
    const json = decodeURIComponent(escape(atob(raw)));
    const payload = JSON.parse(json);

    if (payload.answers) {
      answers = payload.answers;
      if (payload.names) names = payload.names;
      if (payload.anatomy) anatomy = payload.anatomy;
      if (payload.notes) notes = payload.notes;
      if (payload.shameFlags) shameFlags = payload.shameFlags;
      if (payload.privacy) privacy = payload.privacy;
      if (payload.safetyConfig) safetyConfig = payload.safetyConfig;
      if (payload.customKinks) customKinks = payload.customKinks;
      saveToLocalStorage();

      currentUser = (payload.sender === 'A') ? 'B' : 'A';
      showToast(`Daten von ${names[payload.sender || 'A']} geladen!`);
    }
  } catch (e) {
    console.error("Fehler beim Dekodieren:", e);
  }
}

function switchMainView(viewId) {
  const viewSurvey = document.getElementById('view-survey');
  const viewSafety = document.getElementById('view-safety');
  const viewSingle = document.getElementById('view-single');

  const btnSurvey = document.getElementById('nav-btn-survey');
  const btnSafety = document.getElementById('nav-btn-safety');
  const btnSingle = document.getElementById('nav-btn-single');

  if (viewSurvey) viewSurvey.classList.add('hidden');
  if (viewSafety) viewSafety.classList.add('hidden');
  if (viewSingle) viewSingle.classList.add('hidden');

  if (btnSurvey) btnSurvey.className = "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition";
  if (btnSafety) btnSafety.className = "px-3 py-1.5 rounded-lg text-teal-400 hover:text-teal-200 transition font-bold flex items-center gap-1";
  if (btnSingle) btnSingle.className = "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition";

  if (viewId === 'survey') {
    if (viewSurvey) viewSurvey.classList.remove('hidden');
    if (btnSurvey) btnSurvey.className = "px-3 py-1.5 rounded-lg bg-brand-700 text-white shadow-sm transition";
    renderCurrentChapter();
  } else if (viewId === 'safety') {
    if (viewSafety) viewSafety.classList.remove('hidden');
    if (btnSafety) btnSafety.className = "px-3 py-1.5 rounded-lg bg-teal-800 text-white shadow-sm transition font-bold flex items-center gap-1";
    renderSafetyConfiguratorUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (viewId === 'single') {
    if (viewSingle) viewSingle.classList.remove('hidden');
    if (btnSingle) btnSingle.className = "px-3 py-1.5 rounded-lg bg-brand-700 text-white shadow-sm transition";
    renderSingleAnalysis();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function setCurrentUser(user) {
  currentUser = user;
  updateCurrentUserUI();
  renderCurrentChapter();
  updateProgressBar();
  updateTabuBadge();
  checkOnboardingStatus();
  showToast(`Aktives Profil: ${names[user]}`);
}

function updateCurrentUserUI() {
  const u = currentUser;
  const btnA = document.getElementById('btn-user-A');
  const btnB = document.getElementById('btn-user-B');
  const dispA = document.getElementById('user-display-A');
  const dispB = document.getElementById('user-display-B');

  const anatIconA = anatomy.A === 'penis' ? '♂️' : '♀️';
  const anatIconB = anatomy.B === 'penis' ? '♂️' : '♀️';

  if (dispA) dispA.innerText = `${names.A} (${anatIconA})`;
  if (dispB) dispB.innerText = `${names.B} (${anatIconB})`;

  if (u === 'A') {
    if (btnA) btnA.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-white text-indigo-700 shadow-xs";
    if (btnB) btnB.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 text-slate-600 hover:text-slate-900";
  } else {
    if (btnB) btnB.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-white text-purple-700 shadow-xs";
    if (btnA) btnA.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 text-slate-600 hover:text-slate-900";
  }

  const emptyName = document.getElementById('empty-state-username');
  if (emptyName) emptyName.innerText = names[u];
  const singleName = document.getElementById('single-profile-name');
  if (singleName) singleName.innerText = names[u];
}

function checkOnboardingStatus() {
  const u = currentUser;
  if (!accounts[u]?.setupDone) {
    openOnboardingModal();
  }
}

function openOnboardingModal() {
  onboardingStep = 1;
  const title = document.getElementById('onboarding-user-title');
  if (title) title.innerText = names[currentUser];
  const nameInput = document.getElementById('onboarding-name-input');
  if (nameInput) nameInput.value = names[currentUser];
  selectOnboardingAnatomy(anatomy[currentUser] || (currentUser === 'A' ? 'penis' : 'vulva'));
  updateOnboardingStepUI();
  const m = document.getElementById('modal-onboarding');
  if (m) m.classList.remove('hidden');
}

function closeOnboardingModal() {
  const m = document.getElementById('modal-onboarding');
  if (m) m.classList.add('hidden');
}

function selectOnboardingAnatomy(anat) {
  anatomy[currentUser] = anat;
  const pBtn = document.getElementById('onboarding-anat-penis');
  const vBtn = document.getElementById('onboarding-anat-vulva');
  if (!pBtn || !vBtn) return;

  if (anat === 'penis') {
    pBtn.className = "flex-1 p-3 rounded-2xl border bg-brand-50 border-brand-500 text-brand-950 font-bold shadow-xs text-left touch-pill";
    vBtn.className = "flex-1 p-3 rounded-2xl border bg-slate-50 border-slate-200 text-slate-700 text-left touch-pill hover:bg-slate-100";
  } else {
    vBtn.className = "flex-1 p-3 rounded-2xl border bg-brand-50 border-brand-500 text-brand-950 font-bold shadow-xs text-left touch-pill";
    pBtn.className = "flex-1 p-3 rounded-2xl border bg-slate-50 border-slate-200 text-slate-700 text-left touch-pill hover:bg-slate-100";
  }
}

function updateOnboardingStepUI() {
  const s1 = document.getElementById('onboarding-step-1');
  const s2 = document.getElementById('onboarding-step-2');
  const s3 = document.getElementById('onboarding-step-3');
  const s4 = document.getElementById('onboarding-step-4');
  const prevBtn = document.getElementById('onboarding-btn-prev');
  const nextBtn = document.getElementById('onboarding-btn-next');
  const ind = document.getElementById('onboarding-step-indicator');

  if (ind) ind.innerText = `Schritt ${onboardingStep} von 4`;

  [s1, s2, s3, s4].forEach(s => { if (s) s.classList.add('hidden'); });

  if (onboardingStep === 1) {
    if (s1) s1.classList.remove('hidden');
    if (prevBtn) prevBtn.classList.add('hidden');
    if (nextBtn) nextBtn.innerText = "Weiter →";
  } else if (onboardingStep === 2) {
    if (s2) s2.classList.remove('hidden');
    if (prevBtn) prevBtn.classList.remove('hidden');
    if (nextBtn) nextBtn.innerText = "Weiter →";
  } else if (onboardingStep === 3) {
    if (s3) s3.classList.remove('hidden');
    if (prevBtn) prevBtn.classList.remove('hidden');
    if (nextBtn) nextBtn.innerText = "Weiter →";
  } else if (onboardingStep === 4) {
    if (s4) s4.classList.remove('hidden');
    if (prevBtn) prevBtn.classList.remove('hidden');
    if (nextBtn) nextBtn.innerText = "Fertig & Starten ✨";
  }
}

function prevOnboardingStep() {
  if (onboardingStep > 1) {
    onboardingStep--;
    updateOnboardingStepUI();
  }
}

function nextOnboardingStep() {
  const u = currentUser;
  if (onboardingStep === 1) {
    const val = document.getElementById('onboarding-name-input')?.value.trim();
    if (val) names[u] = val;
    updateCurrentUserUI();
    onboardingStep = 2;
    updateOnboardingStepUI();
  } else if (onboardingStep === 2) {
    onboardingStep = 3;
    updateOnboardingStepUI();
  } else if (onboardingStep === 3) {
    const sel = document.querySelector('input[name="onboarding-privacy"]:checked')?.value || 'blind';
    if (!privacy[u]) privacy[u] = { mode: 'blind', shareNotes: true };
    privacy[u].mode = sel;
    onboardingStep = 4;
    updateOnboardingStepUI();
  } else if (onboardingStep === 4) {
    const email = document.getElementById('onboarding-email-input')?.value.trim() || '';
    if (!accounts[u]) accounts[u] = { email: '', partnerEmail: '', setupDone: true };
    accounts[u].email = email;
    accounts[u].setupDone = true;
    saveToLocalStorage();
    closeOnboardingModal();
    showToast(`Willkommen, ${names[u]}!`);
  }
}

function setSurveyFilter(filter) {
  activeSurveyFilter = filter;
  ['all', 'unanswered', 'high', 'tabu', 'shame'].forEach(f => {
    const btn = document.getElementById(`filter-btn-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = "px-2.5 py-1 rounded-lg font-bold bg-brand-700 text-white shadow-xs transition";
      } else {
        btn.className = "px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition";
      }
    }
  });
  renderCurrentChapter();
}

function handleSurveySearch(query) {
  surveySearchQuery = (query || '').toLowerCase().trim();
  renderCurrentChapter();
}

function renderCurrentChapter() {
  if (!window.surveyChapters || window.surveyChapters.length === 0) return;
  const ch = surveyChapters[currentChapterIndex];
  if (!ch) return;

  const badge = document.getElementById('chapter-badge');
  const title = document.getElementById('chapter-title');
  const desc = document.getElementById('chapter-desc');
  const count = document.getElementById('chapter-items-count');

  if (badge) badge.innerText = `Kapitel ${currentChapterIndex + 1} / ${surveyChapters.length}`;
  if (title) title.innerText = ch.title;
  if (desc) desc.innerText = ch.desc;
  if (count) count.innerText = `${(ch.items || []).length} Praktiken`;

  const prevBtn = document.getElementById('btn-prev-chapter');
  if (prevBtn) prevBtn.disabled = (currentChapterIndex === 0);

  const nextBtn = document.getElementById('btn-next-chapter');
  const nextBtnBottom = document.getElementById('btn-next-chapter-bottom');
  const isLast = (currentChapterIndex === surveyChapters.length - 1);
  const nextLabel = isLast ? "Weiter zum Sicherheits-Kodex 🛡️ →" : "Nächstes Kapitel →";

  if (nextBtn) nextBtn.innerText = nextLabel;
  if (nextBtnBottom) nextBtnBottom.innerText = nextLabel;

  const container = document.getElementById('survey-items-container');
  if (!container) return;

  let filteredItems = (ch.items || []).filter(it => {
    const keyR1 = `it_${it.id}_r1`;
    const keyR2 = `it_${it.id}_r2`;
    const keyChoice = `it_${it.id}_choice`;

    const valR1 = answers[currentUser][keyR1];
    const valR2 = answers[currentUser][keyR2];
    const valChoice = answers[currentUser][keyChoice];
    const isShame = shameFlags[currentUser][it.id];

    if (surveySearchQuery) {
      const matchTitle = (it.title || '').toLowerCase().includes(surveySearchQuery);
      const matchDesc = (it.desc || '').toLowerCase().includes(surveySearchQuery);
      if (!matchTitle && !matchDesc) return false;
    }

    if (activeSurveyFilter === 'unanswered') {
      if (it.type === 'choice') return valChoice === undefined;
      return valR1 === undefined || valR2 === undefined;
    }
    if (activeSurveyFilter === 'high') {
      return valR1 >= 4 || valR2 >= 4;
    }
    if (activeSurveyFilter === 'tabu') {
      return valR1 === 1 || valR2 === 1;
    }
    if (activeSurveyFilter === 'shame') {
      return isShame === true;
    }
    return true;
  });

  let html = '';

  if (filteredItems.length === 0) {
    html = `
      <div class="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 space-y-2">
        <p>Keine Praktiken für diesen Filter in diesem Kapitel gefunden.</p>
        <button onclick="setSurveyFilter('all')" class="px-3 py-1.5 bg-brand-600 text-white rounded-xl font-bold">Alle anzeigen</button>
      </div>
    `;
  } else {
    filteredItems.forEach(it => {
      const keyR1 = `it_${it.id}_r1`;
      const keyR2 = `it_${it.id}_r2`;
      const keyChoice = `it_${it.id}_choice`;

      const valR1 = answers[currentUser][keyR1];
      const valR2 = answers[currentUser][keyR2];
      const valChoice = answers[currentUser][keyChoice];
      const noteVal = notes[currentUser][it.id] || '';
      const isShame = shameFlags[currentUser][it.id] || false;

      const adaptedR1 = adaptRoleTextToAnatomy(it.r1, 'active');
      const adaptedR2 = adaptRoleTextToAnatomy(it.r2, 'passive');

      if (it.type === 'choice') {
        html += `
          <div class="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="font-extrabold text-xs text-slate-900">${it.id}. ${escapeHtml(it.title)}</span>
                <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${escapeHtml(it.desc)}</p>
                <span class="block text-xs font-bold text-slate-800 mt-2">${escapeHtml(it.question || 'Deine Haltung:')}</span>
              </div>
              <button type="button" onclick="openLexikonForItem(${it.id})" class="text-[10.5px] text-slate-400 hover:text-brand-600 font-bold whitespace-nowrap p-1">
                📖 Lexikon
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${(it.options || []).map(opt => {
                const isChecked = (valChoice === opt.val);
                return `
                  <button type="button" onclick="recordChoiceAnswer(${it.id}, '${opt.val}')" 
                          class="p-2.5 rounded-xl border text-left text-xs font-semibold transition touch-pill ${isChecked ? 'bg-brand-50 border-brand-500 text-brand-950 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}">
                    ${opt.label}
                  </button>
                `;
              }).join('')}
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input type="text" value="${escapeHtml(noteVal)}" onchange="recordNote(${it.id}, this.value)" placeholder="Persönliche Bedingung / Notiz (optional)..." class="flex-1 text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500">
              <button type="button" onclick="toggleShameFlag(${it.id})" title="Hemmschwelle markieren" class="px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${isShame ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'}">
                🙈 <span class="hidden sm:inline text-[10px]">Hemmschwelle</span>
              </button>
            </div>
          </div>
        `;
      } else {
        html += `
          <div class="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="font-extrabold text-xs text-slate-900">${it.id}. ${escapeHtml(it.title)}</span>
                <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${escapeHtml(it.desc)}</p>
              </div>
              <button type="button" onclick="openLexikonForItem(${it.id})" class="text-[10.5px] text-slate-400 hover:text-brand-600 font-bold whitespace-nowrap p-1">
                📖 Lexikon
              </button>
            </div>

            <!-- Zeile 1: Aktiv -->
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-slate-800">${escapeHtml(adaptedR1)}:</span>
                <span class="text-[10.5px] font-semibold text-slate-500">${getPillLabel(valR1)}</span>
              </div>
              <div class="grid grid-cols-6 gap-1">
                ${[0, 1, 2, 3, 4, 5].map(sc => `
                  <button type="button" onclick="recordScaleAnswer('${keyR1}', ${sc})" class="py-1.5 rounded-lg border text-center text-xs font-bold transition touch-pill ${valR1 === sc ? getScoreActiveStyle(sc) : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}">
                    ${sc === 1 ? '⛔ 1' : (sc === 5 ? '⭐ 5' : sc)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Zeile 2: Passiv -->
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div class="flex justify-between items-center text-xs">
                <span class="font-bold text-slate-800">${escapeHtml(adaptedR2)}:</span>
                <span class="text-[10.5px] font-semibold text-slate-500">${getPillLabel(valR2)}</span>
              </div>
              <div class="grid grid-cols-6 gap-1">
                ${[0, 1, 2, 3, 4, 5].map(sc => `
                  <button type="button" onclick="recordScaleAnswer('${keyR2}', ${sc})" class="py-1.5 rounded-lg border text-center text-xs font-bold transition touch-pill ${valR2 === sc ? getScoreActiveStyle(sc) : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}">
                    ${sc === 1 ? '⛔ 1' : (sc === 5 ? '⭐ 5' : sc)}
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input type="text" value="${escapeHtml(noteVal)}" onchange="recordNote(${it.id}, this.value)" placeholder="Bedingung / Notiz (z. B. 'Nur mit Safeword')..." class="flex-1 text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500">
              <button type="button" onclick="toggleShameFlag(${it.id})" title="Hemmschwelle markieren" class="px-2.5 py-1.5 rounded-xl text-xs font-bold border transition ${isShame ? 'bg-purple-100 border-purple-400 text-purple-800' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'}">
                🙈 <span class="hidden sm:inline text-[10px]">Hemmschwelle</span>
              </button>
            </div>
          </div>
        `;
      }
    });
  }

  // Reflexionsfeld & eigene Kinks am Fuß des Kapitels
  const currentRefl = chapterReflections[currentUser][ch.id] || '';
  html += `
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2 mt-4">
      <div class="flex items-center justify-between">
        <strong class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span>💬</span> Persönliche Reflexion zu Kapitel ${currentChapterIndex + 1}
        </strong>
        <span class="text-[10px] text-slate-400">Optional</span>
      </div>
      <textarea onchange="recordChapterReflection(${ch.id}, this.value)" placeholder="Gibt es zu diesem Kapitel Gedanken, Bedingungen oder Fantasien, die du in eigenen Worten festhalten willst?..." class="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 h-20">${escapeHtml(currentRefl)}</textarea>
    </div>

    <div class="p-3 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2">
        <span class="text-lg">➕</span>
        <span class="text-indigo-950 font-bold">Fehlt dir hier eine bestimmte Praktik?</span>
      </div>
      <button type="button" onclick="openAddCustomKinkModal()" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition touch-pill">
        Eigenen Kink hinzufügen
      </button>
    </div>
  `;

  container.innerHTML = html;
}

function adaptRoleTextToAnatomy(text, roleType) {
  if (!text) return '';
  const myAnat = anatomy[currentUser] || (currentUser === 'A' ? 'penis' : 'vulva');
  const partnerUser = (currentUser === 'A') ? 'B' : 'A';
  const partnerAnat = anatomy[partnerUser] || (partnerUser === 'A' ? 'penis' : 'vulva');

  let res = text;
  if (myAnat === 'penis') {
    res = res.replace(/Schamlippen\/Glied/g, "Glied").replace(/Klitoris\/Eichel/g, "Eichel");
  } else {
    res = res.replace(/Schamlippen\/Glied/g, "Schamlippen").replace(/Klitoris\/Eichel/g, "Klitoris");
  }
  return res;
}

function recordScaleAnswer(key, score) {
  answers[currentUser][key] = score;
  saveToLocalStorage();
  updateProgressBar();
  updateTabuBadge();
  renderCurrentChapter();
}

function recordChoiceAnswer(id, val) {
  answers[currentUser][`it_${id}_choice`] = val;
  saveToLocalStorage();
  updateProgressBar();
  renderCurrentChapter();
}

function recordNote(id, text) {
  notes[currentUser][id] = text.trim();
  saveToLocalStorage();
}

function toggleShameFlag(id) {
  shameFlags[currentUser][id] = !shameFlags[currentUser][id];
  saveToLocalStorage();
  renderCurrentChapter();
  showToast(shameFlags[currentUser][id] ? "🙈 Als Hemmschwelle markiert" : "Hemmschwelle entfernt");
}

function recordChapterReflection(chId, text) {
  if (!chapterReflections[currentUser]) chapterReflections[currentUser] = {};
  chapterReflections[currentUser][chId] = text.trim();
  saveToLocalStorage();
}

function openAddCustomKinkModal() {
  const title = prompt("Titel deines eigenen Kinks:");
  if (!title || !title.trim()) return;
  const desc = prompt("Kurze Beschreibung dieser Praktik:") || "";

  const newId = 1000 + customKinks.length + 1;
  const newKink = {
    id: newId,
    title: title.trim(),
    desc: desc.trim(),
    r1: `Aktiv: ${title.trim()} ausführen`,
    r2: `Passiv: ${title.trim()} empfangen`,
    chapterId: surveyChapters[currentChapterIndex]?.id || 1
  };

  customKinks.push(newKink);
  if (!surveyChapters[currentChapterIndex].items) surveyChapters[currentChapterIndex].items = [];
  surveyChapters[currentChapterIndex].items.push(newKink);

  saveToLocalStorage();
  renderCurrentChapter();
  showToast("✓ Eigener Kink erfolgreich hinzugefügt!");
}

function prevChapter() {
  if (currentChapterIndex > 0) {
    currentChapterIndex--;
    renderCurrentChapter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function nextChapter() {
  if (currentChapterIndex < surveyChapters.length - 1) {
    currentChapterIndex++;
    renderCurrentChapter();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    switchMainView('safety');
    showToast("Fragebogen komplett! Jetzt folgt der Sicherheits-Kodex 🛡️");
  }
}

function jumpToChapter(idx) {
  currentChapterIndex = idx;
  switchMainView('survey');
}

function renderQuickGrid() {
  const grid = document.getElementById('quick-grid-buttons');
  if (!grid || !window.surveyChapters) return;
  grid.innerHTML = surveyChapters.map((ch, idx) => `
    <button onclick="jumpToChapter(${idx})" class="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 truncate">
      ${idx + 1}. ${escapeHtml(ch.title)}
    </button>
  `).join('');
}

function updateProgressBar() {
  if (!window.surveyChapters) return;
  let totalQuestions = 0;
  surveyChapters.forEach(c => {
    (c.items || []).forEach(it => {
      if (it.type === 'choice') totalQuestions += 1;
      else totalQuestions += 2;
    });
  });

  const answered = Object.keys(answers[currentUser] || {}).length;
  const pct = totalQuestions > 0 ? Math.min(100, Math.round((answered / totalQuestions) * 100)) : 0;

  const fill = document.getElementById('progress-bar-fill');
  const txt = document.getElementById('progress-text');
  if (fill) fill.style.width = `${pct}%`;
  if (txt) txt.innerText = `Fortschritt: ${pct} % (${answered}/${totalQuestions})`;
}

function updateTabuBadge() {
  let count = 0;
  const uAnswers = answers[currentUser] || {};
  Object.keys(uAnswers).forEach(k => {
    if (uAnswers[k] === 1) count++;
  });
  const badge = document.getElementById('header-tabu-count');
  if (badge) badge.innerText = count;
}

function renderSafetyConfiguratorUI() {
  const container = document.getElementById('safety-configurator-full-container');
  if (!container) return;

  const cfg = safetyConfig[currentUser] || {};
  let html = '<div class="space-y-4">';

  safetyModulesData.forEach(mod => {
    html += `
      <div class="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div class="flex items-center gap-2 border-b border-teal-100 dark:border-teal-900 pb-2">
          <span class="text-xl">${mod.icon}</span>
          <div>
            <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">${mod.title}</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">${mod.desc}</p>
          </div>
        </div>

        <div class="space-y-3 pt-1">
          ${mod.items.map(it => {
            const currentVal = cfg[it.key];
            return `
              <div class="space-y-1.5">
                <span class="block text-xs font-bold text-slate-800 dark:text-slate-200">${it.title}:</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  ${it.options.map(opt => {
                    const isSelected = (currentVal === opt.val);
                    return `
                      <button type="button" onclick="selectSafetyOption('${it.key}', '${opt.val}')"
                              class="p-2.5 rounded-xl border text-left text-xs font-semibold transition touch-pill ${isSelected ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-teal-950 dark:text-teal-200 font-bold shadow-xs' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'}">
                        ${opt.label}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function selectSafetyOption(key, val) {
  if (!safetyConfig[currentUser]) safetyConfig[currentUser] = {};
  safetyConfig[currentUser][key] = val;
  saveToLocalStorage();
  renderSafetyConfiguratorUI();
  showToast("✓ Vereinbarung gespeichert");
}

function openTabuModal() {
  const container = document.getElementById('tabu-modal-list');
  if (!container) return;

  const allChapters = window.surveyChapters || [];
  let topTabus = [];
  let bottomTabus = [];

  ['A', 'B'].forEach(u => {
    const uAnswers = answers[u] || {};
    const uName = names[u] || (u === 'A' ? 'Partner 1' : 'Partner 2');

    allChapters.forEach(ch => {
      (ch.items || []).forEach(it => {
        if (it.type === 'choice') return;
        const vR1 = uAnswers[`it_${it.id}_r1`];
        const vR2 = uAnswers[`it_${it.id}_r2`];

        if (vR1 === 1) {
          topTabus.push({ item: it, who: uName, text: it.r1 });
        }
        if (vR2 === 1) {
          bottomTabus.push({ item: it, who: uName, text: it.r2 });
        }
      });
    });
  });

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-2xl space-y-2">
        <div class="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-800 pb-2">
          <strong class="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
            <span>✋</span> Ausführungs-Grenzen (Top / Aktiv)
          </strong>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">${topTabus.length}</span>
        </div>
        <p class="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
          Was Partner aktiv moralisch oder emotional nicht tun möchten.
        </p>
        <div class="space-y-1.5 pt-1">
          ${topTabus.length > 0 ? topTabus.map(t => `
            <div class="p-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-[11px] space-y-0.5">
              <strong class="text-slate-900 dark:text-white block">${t.item.id}. ${escapeHtml(t.item.title)}</strong>
              <span class="text-[10px] text-indigo-700 dark:text-indigo-300 block">⛔ ${t.who} will nicht: ${escapeHtml(t.text)}</span>
            </div>
          `).join('') : '<p class="text-slate-400 italic text-center py-2">Keine Top-Ausführungs-Tabus hinterlegt.</p>'}
        </div>
      </div>

      <div class="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl space-y-2">
        <div class="flex items-center justify-between border-b border-rose-200 dark:border-rose-800 pb-2">
          <strong class="text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
            <span>🛡️</span> Schutz- & Belastungsgrenzen (Bottom / Passiv)
          </strong>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200">${bottomTabus.length}</span>
        </div>
        <p class="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight">
          Was Körper und Geist des Partners keinesfalls empfangen wollen (Schutz-Schranken).
        </p>
        <div class="space-y-1.5 pt-1">
          ${bottomTabus.length > 0 ? bottomTabus.map(t => `
            <div class="p-2 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-[11px] space-y-0.5">
              <strong class="text-slate-900 dark:text-white block">${t.item.id}. ${escapeHtml(t.item.title)}</strong>
              <span class="text-[10px] text-rose-700 dark:text-rose-300 block">⛔ ${t.who} erträgt nicht: ${escapeHtml(t.text)}</span>
            </div>
          `).join('') : '<p class="text-slate-400 italic text-center py-2">Keine Bottom-Schutz-Tabus hinterlegt.</p>'}
        </div>
      </div>
    </div>
  `;

  const m = document.getElementById('modal-tabus');
  if (m) m.classList.remove('hidden');
}

function closeTabuModal() {
  const m = document.getElementById('modal-tabus');
  if (m) m.classList.add('hidden');
}

function openLexikonModal() {
  filterLexikon('');
  const m = document.getElementById('modal-lexikon');
  if (m) m.classList.remove('hidden');
}

function closeLexikonModal() {
  const m = document.getElementById('modal-lexikon');
  if (m) m.classList.add('hidden');
}

function openLexikonForItem(itemId) {
  openLexikonModal();
  let found = null;
  (window.surveyChapters || []).forEach(ch => {
    (ch.items || []).forEach(it => {
      if (it.id === itemId) found = it;
    });
  });

  const searchInput = document.getElementById('lexikon-search-input');
  if (searchInput && found) {
    searchInput.value = found.title;
  }

  const container = document.getElementById('lexikon-entries-container');
  if (!container || !found) return;

  container.innerHTML = `
    <div class="p-3.5 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-2xl space-y-2 mb-3">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">Direkte Erklärung der Praxis</span>
        <span class="px-2 py-0.5 rounded text-[9.5px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">Pos. ${found.id}</span>
      </div>
      <h4 class="font-extrabold text-sm text-slate-900 dark:text-white">${escapeHtml(found.title)}</h4>
      <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtml(found.desc)}</p>
      ${found.r1 ? `
        <div class="pt-1.5 border-t border-brand-200/60 dark:border-brand-900 text-[11px] space-y-1">
          <div><strong class="text-brand-950 dark:text-brand-200">Aktiv (Top):</strong> ${escapeHtml(found.r1)}</div>
          <div><strong class="text-brand-950 dark:text-brand-200">Passiv (Bottom):</strong> ${escapeHtml(found.r2)}</div>
        </div>
      ` : ''}
    </div>
  `;

  filterLexikon(found.title, true);
}

function filterLexikon(q, append = false) {
  const container = document.getElementById('lexikon-entries-container');
  if (!container || !window.lexikonData) return;
  const query = (q || '').toLowerCase();
  const filtered = lexikonData.filter(l => l.term.toLowerCase().includes(query) || l.def.toLowerCase().includes(query));

  const listHtml = filtered.map(l => `
    <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
      <div class="flex justify-between items-center">
        <strong class="text-slate-900 dark:text-white font-bold text-xs">${escapeHtml(l.term)}</strong>
        <a href="${l.link}" target="_blank" class="text-[10px] text-brand-600 hover:underline">Info ↗</a>
      </div>
      <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtml(l.def)}</p>
    </div>
  `).join('');

  if (append) {
    container.innerHTML += listHtml;
  } else {
    container.innerHTML = listHtml || '<p class="text-slate-400 italic text-center p-3">Keine passenden Lexikon-Einträge gefunden.</p>';
  }
}

function openShareModal() {
  const url = getLiveShareUrl();
  const input = document.getElementById('share-link-input');
  if (input) input.value = url;
  const m = document.getElementById('modal-share');
  if (m) m.classList.remove('hidden');
}

function closeShareModal() {
  const m = document.getElementById('modal-share');
  if (m) m.classList.add('hidden');
}

function getLiveShareUrl() {
  const payload = {
    sender: currentUser,
    answers,
    notes,
    shameFlags,
    chapterReflections,
    customKinks,
    names,
    anatomy,
    privacy,
    safetyConfig,
    ts: Date.now()
  };
  const json = JSON.stringify(payload);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  const base = window.location.href.split('#')[0];
  return `${base}#data=${encoded}`;
}

function copyShareLinkToClipboard() {
  const input = document.getElementById('share-link-input');
  if (!input) return;
  input.select();
  document.execCommand('copy');
  const btn = document.getElementById('btn-copy-share-link');
  if (btn) {
    const orig = btn.innerText;
    btn.innerText = "✓ Link kopiert!";
    setTimeout(() => { btn.innerText = orig; }, 2000);
  }
  showToast("Link in Zwischenablage kopiert!");
}

function openAccountModal() {
  const u = currentUser;
  const nameEl = document.getElementById('account-active-username');
  if (nameEl) nameEl.innerText = names[u];

  const nameInput = document.getElementById('account-name-input');
  if (nameInput) nameInput.value = names[u] || '';

  const emailInput = document.getElementById('account-email-input');
  if (emailInput) emailInput.value = accounts[u]?.email || '';

  selectAccountAnatomy('me', anatomy[u] || (u === 'A' ? 'penis' : 'vulva'));
  const pUser = (u === 'A') ? 'B' : 'A';
  selectAccountAnatomy('partner', anatomy[pUser] || (pUser === 'A' ? 'penis' : 'vulva'));

  const privBlind = document.getElementById('account-priv-blind');
  const privOpen = document.getElementById('account-priv-open');
  if (privacy[u]?.mode === 'open') {
    if (privOpen) privOpen.checked = true;
  } else {
    if (privBlind) privBlind.checked = true;
  }

  const shareNotesBox = document.getElementById('account-share-notes');
  if (shareNotesBox) shareNotesBox.checked = (privacy[u]?.shareNotes !== false);

  const resetUserSpan = document.getElementById('reset-current-username');
  if (resetUserSpan) resetUserSpan.innerText = names[u];
  cancelResetConfirmation();

  const modal = document.getElementById('modal-account');
  if (modal) modal.classList.remove('hidden');
}

function closeAccountModal() {
  const modal = document.getElementById('modal-account');
  if (modal) modal.classList.add('hidden');
}

function selectAccountAnatomy(target, anat) {
  const u = currentUser;
  const pUser = (u === 'A') ? 'B' : 'A';

  if (target === 'me') {
    anatomy[u] = anat;
    const pBtn = document.getElementById('acc-anat-my-penis');
    const vBtn = document.getElementById('acc-anat-my-vulva');
    if (pBtn && vBtn) {
      if (anat === 'penis') {
        pBtn.className = "flex-1 py-2 px-3 rounded-xl border bg-brand-50 border-brand-500 text-brand-950 font-bold text-xs shadow-xs touch-pill";
        vBtn.className = "flex-1 py-2 px-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 text-xs touch-pill hover:bg-slate-100";
      } else {
        vBtn.className = "flex-1 py-2 px-3 rounded-xl border bg-brand-50 border-brand-500 text-brand-950 font-bold text-xs shadow-xs touch-pill";
        pBtn.className = "flex-1 py-2 px-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 text-xs touch-pill hover:bg-slate-100";
      }
    }
  } else {
    anatomy[pUser] = anat;
    const pBtn = document.getElementById('acc-anat-part-penis');
    const vBtn = document.getElementById('acc-anat-part-vulva');
    if (pBtn && vBtn) {
      if (anat === 'penis') {
        pBtn.className = "flex-1 py-2 px-3 rounded-xl border bg-indigo-50 border-indigo-500 text-indigo-950 font-bold text-xs shadow-xs touch-pill";
        vBtn.className = "flex-1 py-2 px-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 text-xs touch-pill hover:bg-slate-100";
      } else {
        vBtn.className = "flex-1 py-2 px-3 rounded-xl border bg-indigo-50 border-indigo-500 text-indigo-950 font-bold text-xs shadow-xs touch-pill";
        pBtn.className = "flex-1 py-2 px-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 text-xs touch-pill hover:bg-slate-100";
      }
    }
  }

  saveToLocalStorage();
  updateCurrentUserUI();
  renderCurrentChapter();
}

function updateCurrentUserName(val) {
  names[currentUser] = val.trim() || ((currentUser === 'A') ? 'Partner 1' : 'Partner 2');
  saveToLocalStorage();
  updateCurrentUserUI();
  showToast(`Name aktualisiert: ${names[currentUser]}`);
}

function updateCurrentUserEmail(val) {
  if (!accounts[currentUser]) accounts[currentUser] = { email: '', partnerEmail: '', setupDone: true };
  accounts[currentUser].email = val.trim();
  saveToLocalStorage();
}

function updatePrivacyMode(mode) {
  if (!privacy[currentUser]) privacy[currentUser] = { mode: 'blind', shareNotes: true };
  privacy[currentUser].mode = mode;
  saveToLocalStorage();
  showToast(mode === 'open' ? "Vollständige Einsicht aktiv" : "Selektiver Blind-Match aktiv");
}

function updateShareNotes(checked) {
  if (!privacy[currentUser]) privacy[currentUser] = { mode: 'blind', shareNotes: true };
  privacy[currentUser].shareNotes = checked;
  saveToLocalStorage();
}

function showResetConfirmation() {
  document.getElementById('reset-trigger-area')?.classList.add('hidden');
  document.getElementById('reset-confirmation-box')?.classList.remove('hidden');
}

function cancelResetConfirmation() {
  document.getElementById('reset-trigger-area')?.classList.remove('hidden');
  document.getElementById('reset-confirmation-box')?.classList.add('hidden');
}

function resetCurrentUserProfile() {
  const u = currentUser;
  answers[u] = {};
  notes[u] = {};
  shameFlags[u] = {};
  chapterReflections[u] = {};
  names[u] = (u === 'A') ? 'Partner 1' : 'Partner 2';
  if (accounts[u]) accounts[u].setupDone = false;

  saveToLocalStorage();
  cancelResetConfirmation();
  closeAccountModal();

  updateCurrentUserUI();
  renderCurrentChapter();
  updateProgressBar();
  updateTabuBadge();
  showToast(`Profil ${names[u]} zurückgesetzt.`);
}

function generateRandomTestData() {
  const u = currentUser;
  (window.surveyChapters || []).forEach(ch => {
    (ch.items || []).forEach(it => {
      if (it.type === 'choice') {
        const randomOpt = (it.options || [])[Math.floor(Math.random() * (it.options || []).length)];
        if (randomOpt) answers[u][`it_${it.id}_choice`] = randomOpt.val;
      } else {
        const rand1 = Math.floor(Math.random() * 6);
        const rand2 = Math.floor(Math.random() * 6);
        answers[u][`it_${it.id}_r1`] = rand1;
        answers[u][`it_${it.id}_r2`] = rand2;
        if (Math.random() < 0.15) shameFlags[u][it.id] = true;
      }
    });
  });

  saveToLocalStorage();
  updateProgressBar();
  updateTabuBadge();
  renderCurrentChapter();
  closeAccountModal();
  showToast("🎲 Realistische Testdaten für dieses Profil eingespielt!");
}

function sendBackupEmail() {
  const url = getLiveShareUrl();
  const email = accounts[currentUser]?.email || '';
  const subject = encodeURIComponent("Sicherung: Dein persönlicher Kink-Kompass Zugangs-Link");
  const body = encodeURIComponent(`Hallo ${names[currentUser]},\n\nhier ist dein verschlüsselter Zugangs-Link zu deinen Bewertungen:\n\n${url}\n\nBewahre diese E-Mail auf.`);
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

function renderSingleAnalysis() {
  const uAnswers = answers[currentUser] || {};
  const count = Object.keys(uAnswers).length;
  const emptyBox = document.getElementById('single-empty-state');
  const contentBox = document.getElementById('single-content-state');

  if (count < 3) {
    if (emptyBox) emptyBox.classList.remove('hidden');
    if (contentBox) contentBox.classList.add('hidden');
    return;
  }

  if (emptyBox) emptyBox.classList.add('hidden');
  if (contentBox) contentBox.classList.remove('hidden');

  let pPower = 0, pSensation = 0, pNurturing = 0, pThrill = 0, pVisual = 0;
  let countPower = 0, countSensation = 0, countNurturing = 0, countThrill = 0, countVisual = 0;
  let totalTop = 0, totalBottom = 0, cTop = 0, cBottom = 0;

  (window.surveyChapters || []).forEach(ch => {
    (ch.items || []).forEach(it => {
      const v1 = uAnswers[`it_${it.id}_r1`];
      const v2 = uAnswers[`it_${it.id}_r2`];
      if (typeof v1 === 'number') { totalTop += v1; cTop++; }
      if (typeof v2 === 'number') { totalBottom += v2; cBottom++; }

      const addPoints = (val) => {
        if (typeof val === 'number') {
          if ([21, 22, 23, 29].includes(ch.id)) { pPower += val; countPower += 5; }
          else if ([13, 14, 16, 17, 31].includes(ch.id)) { pSensation += val; countSensation += 5; }
          else if ([19, 30].includes(ch.id)) { pNurturing += val; countNurturing += 5; }
          else if ([18, 20, 24, 25].includes(ch.id)) { pThrill += val; countThrill += 5; }
          else if ([9, 10, 11].includes(ch.id)) { pVisual += val; countVisual += 5; }
        }
      };
      addPoints(v1);
      addPoints(v2);
    });
  });

  const setBar = (id, cur, max) => {
    const pct = max > 0 ? Math.round((cur / max) * 100) : 0;
    const vEl = document.getElementById(`bar-val-${id}`);
    const fEl = document.getElementById(`bar-fill-${id}`);
    if (vEl) vEl.innerText = `${pct} %`;
    if (fEl) fEl.style.width = `${pct}%`;
    return pct;
  };

  const pctPower = setBar('power', pPower, countPower);
  const pctSensation = setBar('sensation', pSensation, countSensation);
  const pctNurturing = setBar('nurturing', pNurturing, countNurturing);
  const pctThrill = setBar('thrill', pThrill, countThrill);
  const pctVisual = setBar('visual', pVisual, countVisual);

  renderScientificGutachten({
    pctPower, pctSensation, pctNurturing, pctThrill, pctVisual,
    avgTop: cTop > 0 ? (totalTop / cTop) : 0,
    avgBottom: cBottom > 0 ? (totalBottom / cBottom) : 0,
    shameCount: Object.keys(shameFlags[currentUser] || {}).length
  });

  // Highlights & Tabus
  let high5 = [];
  let tabus = [];
  (window.surveyChapters || []).forEach(ch => {
    (ch.items || []).forEach(it => {
      const r1 = uAnswers[`it_${it.id}_r1`];
      const r2 = uAnswers[`it_${it.id}_r2`];
      if (r1 === 5) high5.push(`${it.title} (Aktiv: ${it.r1})`);
      if (r2 === 5) high5.push(`${it.title} (Passiv: ${it.r2})`);
      if (r1 === 1) tabus.push(`${it.title} (Aktiv abgelehnt)`);
      if (r2 === 1) tabus.push(`${it.title} (Passiv abgelehnt)`);
    });
  });

  const h5El = document.getElementById('single-high-prio-list');
  if (h5El) {
    h5El.innerHTML = high5.map(h => `<div class="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">⭐ ${escapeHtml(h)}</div>`).join('') || '<p class="text-slate-400 italic">Noch keine 5er-Punkte.</p>';
  }

  const tbEl = document.getElementById('single-tabus-list');
  if (tbEl) {
    tbEl.innerHTML = tabus.map(t => `<div class="p-2 rounded-lg bg-rose-50 text-rose-900 border border-rose-200">⛔ ${escapeHtml(t)}</div>`).join('') || '<p class="text-slate-400 italic">Keine Tabus gesetzt.</p>';
  }

  renderSingleRadar();
}

function renderScientificGutachten(metrics) {
  const box = document.getElementById('single-interpretation-box');
  if (!box) return;

  const isSub = metrics.avgBottom > metrics.avgTop;
  const isTop = metrics.avgTop > metrics.avgBottom;

  box.innerHTML = `
    <div class="space-y-2.5">
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <strong class="text-indigo-600 dark:text-indigo-400 block text-xs">1. Neurobiologische Funktionsweise (Gehirn & Hormone):</strong>
        <p class="mt-1">
          ${isSub ? `
            Deine Antworten zeigen eine ausgeprägte Sehnsucht nach Hingabe und Kontrollabgabe. Nach <em>Sagarin et al. (2009, 2015)</em> und <em>Ambler et al. (2017)</em> führt dies zur <strong>transienten Hypofrontalität</strong>: Dein präfrontaler Kortex (der Sitz ständiger Alltagsplanung und Selbstkontrolle) fährt messbar herunter. Der Reizstress setzt Endorphine und körpereigene Cannabinoide frei (<em>Wuyts et al., 2021</em>), die dein Nervensystem in einen Zustand meditativer Gelassenheit (<em>Subspace</em>) versetzen.
          ` : (isTop ? `
            Deine Lust an Führung entspricht einem hochfokussierten <strong>Topspace / Flow-Zustand (Wismeijer & van Assen, 2013)</strong>. Dein Gehirn schöpft Belohnung (Dopamin) aus Empathie-Synchronisation: Dem exakten Lesen der Mikrosignale des Partners und der Verantwortung für dessen emotionalen Zustand.
          ` : `
            Du bist ein ausgewogener <strong>Switch</strong>: Dein Nervensystem kann je nach Tagesform flexibel zwischen fokussierter Verantwortung (Topspace) und kognitiver Entlastung (Subspace) umschalten.
          `)}
        </p>
      </div>

      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <strong class="text-rose-600 dark:text-rose-400 block text-xs">2. Somatisches Stress-Coping (Williams et al., 2014):</strong>
        <p class="mt-1">
          Kink dient bei dir als somatisches Ventil zum Abbau von Alltagsdruck. ${metrics.pctSensation >= 40 ? 'Deine Reizbereitschaft bei Schmerz und Fesseln nutzt die körpereigene Opiat-Kaskade (Klement et al., 2016) zur seelischen Katharsis.' : 'Du bevorzugst dabei sanfte, kontrollierte Reize ohne starke Schmerzerfahrung.'}
        </p>
      </div>

      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <strong class="text-purple-600 dark:text-purple-400 block text-xs">3. Erotische Scham-Resilienz (Canivet et al., 2025; Tangney & Dearing, 2002):</strong>
        <p class="mt-1">
          Du hast <strong>${metrics.shameCount} Praktiken als Hemmschwelle (🙈)</strong> markiert. Nach <em>Dymock (2012)</em> führt das angstfreie Aussprechen schambelasteter Sehnsüchte vor einem verlässlichen Partner zur tiefsten Form emotionaler Verbundenheit.
        </p>
      </div>
    </div>
  `;
}

function renderSingleRadar() {
  const canvas = document.getElementById('singleRadarChart');
  if (!canvas) return;

  if (singleRadarInstance) singleRadarInstance.destroy();

  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(203, 213, 225, 0.6)';
  const labelColor = isDark ? '#cbd5e1' : '#334155';

  const dimensions = [
    { label: 'Körperzonen', chapters: [1, 12] },
    { label: 'Romantik', chapters: [2, 3] },
    { label: 'Keuschheit', chapters: [7, 8] },
    { label: 'Shibari', chapters: [13, 14] },
    { label: 'Sinnesentzug', chapters: [15] },
    { label: 'Impact', chapters: [16] },
    { label: 'Primal', chapters: [18] },
    { label: 'Caregiver', chapters: [19] },
    { label: 'Trance', chapters: [30] }
  ];

  const allChapters = window.surveyChapters || [];
  const uAnswers = answers[currentUser] || {};

  const scores = dimensions.map(dim => {
    let earned = 0, possible = 0;
    dim.chapters.forEach(cId => {
      const ch = allChapters.find(c => c.id === cId);
      if (ch && ch.items) {
        ch.items.forEach(it => {
          if (it.type !== 'choice') {
            const s1 = uAnswers[`it_${it.id}_r1`];
            const s2 = uAnswers[`it_${it.id}_r2`];
            if (typeof s1 === 'number') { earned += s1; possible += 5; }
            if (typeof s2 === 'number') { earned += s2; possible += 5; }
          }
        });
      }
    });
    return possible > 0 ? Math.round((earned / possible) * 100) : 0;
  });

  singleRadarInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: dimensions.map(d => d.label),
      datasets: [{
        label: names[currentUser],
        data: scores,
        backgroundColor: 'rgba(225, 29, 72, 0.25)',
        borderColor: 'rgba(225, 29, 72, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(225, 29, 72, 1)'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: gridColor },
          grid: { color: gridColor },
          pointLabels: { color: labelColor, font: { size: 10, weight: 'bold' } },
          ticks: { display: false, max: 100, min: 0 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function toggleGlobalTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('kompass_theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('kompass_theme', 'light');
  }

  const icon = document.getElementById('theme-toggle-icon');
  const label = document.getElementById('theme-toggle-label');
  if (icon) icon.innerText = (newTheme === 'dark') ? '🌙' : '☀️';
  if (label) label.innerText = (newTheme === 'dark') ? 'Nacht' : 'Tag';

  if (singleRadarInstance) renderSingleRadar();
}

function getPillLabel(score) {
  if (score === undefined || score === null) return "Nicht bewertet";
  if (score === 0) return "0 (Entfällt / Desinteresse)";
  if (score === 1) return "⛔ 1 (Absolutes Tabu / Grenze)";
  if (score === 2) return "🎁 2 (Dem Partner zuliebe / Strafe)";
  if (score === 3) return "💡 3 (Neugierig / Gesprächsbedarf)";
  if (score === 4) return "✨ 4 (Reizvoll / Bereicherung)";
  if (score === 5) return "⭐ 5 (Leidenschaft / Must-Have)";
  return score;
}

function getScoreActiveStyle(sc) {
  if (sc === 1) return 'bg-rose-600 text-white border-rose-700 shadow-xs font-black';
  if (sc === 2) return 'bg-indigo-600 text-white border-indigo-700 shadow-xs font-black';
  if (sc === 3) return 'bg-blue-600 text-white border-blue-700 shadow-xs font-black';
  if (sc === 4) return 'bg-amber-600 text-white border-amber-700 shadow-xs font-black';
  if (sc === 5) return 'bg-emerald-600 text-white border-emerald-700 shadow-xs font-black';
  return 'bg-slate-800 text-white border-slate-900 shadow-xs font-black';
}

function showToast(msg) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const el = document.createElement('div');
  el.className = "bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 transition-all pointer-events-auto transform translate-y-2 opacity-0";
  el.innerText = msg;
  c.appendChild(el);

  setTimeout(() => { el.classList.remove('translate-y-2', 'opacity-0'); }, 10);
  setTimeout(() => {
    el.classList.add('opacity-0');
    setTimeout(() => { el.remove(); }, 300);
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.addEventListener('DOMContentLoaded', () => {
  initApp();
});
