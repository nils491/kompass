// js/app.js - Zentrale Anwendungslogik & Datenverwaltung des Kink- & Beziehungs-Kompasses

let currentUser = 'A';
let currentChapterIndex = 0;
let singleRadarInstance = null;
let onboardingStep = 1;
let currentFilter = 'all'; // 'all', 'unanswered', 'high', 'tabu', 'shame'
let searchQuery = '';

let names = { A: 'Partner 1', B: 'Partner 2' };
let anatomy = { A: 'penis', B: 'vulva' }; // 'penis' (Mann) | 'vulva' (Frau)
let answers = { A: {}, B: {} };
let notes = { A: {}, B: {} };
let shameFlags = { A: {}, B: {} }; // Hemmschwellen-Flags { [itemId]: true }
let privacy = {
  A: { mode: 'blind', shareNotes: true, chapters: {} },
  B: { mode: 'blind', shareNotes: true, chapters: {} }
};
let accounts = {
  A: { email: '', partnerEmail: '', setupDone: false },
  B: { email: '', partnerEmail: '', setupDone: false }
};

// Umfassende A-Z BDSM- & Kink-Lexikondaten (immer verfügbar)
const defaultLexikonData = [
  { term: "SSC (Safe, Sane, Consensual)", def: "Grundsatz der Kink-Szene: Alle Handlungen müssen sicher, vernünftig und zu 100 % einvernehmlich sein.", link: "https://de.wikipedia.org/wiki/Safe,_Sane,_Consensual" },
  { term: "RACK (Risk-Aware Consensual Kink)", def: "Erweitertes Konzept: Beide Partner sind sich der realen Risiken bewusst und tragen die Verantwortung gemeinsam.", link: "https://de.wikipedia.org/wiki/RACK" },
  { term: "Safeword & Ampelsystem", def: "Vereinbarte Abbruchworte (Grün = Weiter, Gelb = Tempo drosseln, Rot = Sofort-Stopp), die jederzeit ohne Rechtfertigung gelten.", link: "https://de.wikipedia.org/wiki/Safeword" },
  { term: "Aftercare (Nachsorge)", def: "Liebevolle Fürsorge nach einer Session (Kuscheln, Decken, Tee, De-Briefing) zur seelischen und körperlichen Stabilisierung.", link: "https://de.wikipedia.org/wiki/Aftercare_(BDSM)" },
  { term: "Subdrop / Topdrop", def: "Hormoneller und emotionaler Erschöpfungszustand nach intensiven Sessions durch den abrupten Abfall von Endorphinen und Adrenalin.", link: "https://de.wikipedia.org/wiki/Subdrop" },
  { term: "Subspace", def: "Tranceähnlicher, glückseliger Zustand des passiven Partners durch Reize, Endorphine und vollkommene Hingabe.", link: "https://de.wikipedia.org/wiki/Subspace" },
  { term: "Shibari / Kinbaku", def: "Traditionelle japanische Kunst des Seilbindens mit geölten Naturfasern (Jute/Hanf) zur Erzeugung von Mustern und angenehmem Druck.", link: "https://de.wikipedia.org/wiki/Shibari" },
  { term: "Praise Play", def: "Führung und Bestätigung des Partners durch warmes, echtes Lob und Zärtlichkeit statt strenger Disziplinierung.", link: "https://de.wikipedia.org/wiki/BDSM" },
  { term: "Tease & Denial / Edging", def: "Gezieltes Heranführen an den Orgasmus mit anschließendem abruptem Abbruch der Berührung, um die Erregung zu dehnen.", link: "https://de.wikipedia.org/wiki/Edging" },
  { term: "Keuschhaltung (Chastity)", def: "Freiwillige Abgabe der Orgasmuskontrolle mittels Keuschheitskäfig oder -gürtel; der Schlüssel verbleibt beim dominanten Partner.", link: "https://de.wikipedia.org/wiki/Keuschheitsg%C3%BCrtel" },
  { term: "Bratting & Brat Taming", def: "Spielerisches, freches Provozieren des Partners, um eine liebevoll-strenge Zurechtweisung und Bändigung herauszufordern.", link: "https://de.wikipedia.org/wiki/BDSM" },
  { term: "Primal Play", def: "Instinktgetriebenes, körperbetontes Spiel mit Ringen, Beißen, Jagen und Kräftemessen ganz ohne starre Regeln.", link: "https://de.wikipedia.org/wiki/BDSM" },
  { term: "Caregiver / Little (DDLG / CGL)", def: "Rollenaufteilung zwischen fürsorglicher Beschützer-Autorität (Daddy/Mommy) und unbeschwertem, erotisch oder emotional regrediertem Partner (Little).", link: "https://de.wikipedia.org/wiki/Adult_Baby" },
  { term: "Impact Play & Spanking", def: "Schlagintimität mit Händen, Paddles oder Floggern zur Erwärmung des Gewebes, Katharsis und Luststeigerung.", link: "https://de.wikipedia.org/wiki/Spanking" },
  { term: "Sinnesentzug (Sensory Deprivation)", def: "Ausschalten visueller oder auditiver Reize (Augenbinden, Kopfhörer), um Tastsinn und Hingabe massiv zu intensivieren.", link: "https://de.wikipedia.org/wiki/Reizdeprivation" },
  { term: "CBT (Cock and Ball Torture)", def: "Gezielte Reizung oder Schmerzapplikation an Penis und Hoden (z. B. Abbinden, Ringe, Gewichte, sanfte Klapse).", link: "https://de.wikipedia.org/wiki/Cock_and_Ball_Torture" },
  { term: "Queening / Facesitting", def: "Ein Partner setzt sich rittlings auf das Gesicht des Partners und steuert Atmung und Zungenkontakt.", link: "https://de.wikipedia.org/wiki/Facesitting" },
  { term: "CFNM (Clothed Female, Naked Male)", def: "Visuelles Machtgefälle: Ein Partner bleibt elegant bekleidet, während der andere nackt zur Verfügung steht.", link: "https://de.wikipedia.org/wiki/CFNM" },
  { term: "Nuru-Massage", def: "Traditionelle japanische Gleitmassage mit extrem glattem Algen-Gel auf nackter Haut.", link: "https://de.wikipedia.org/wiki/Nuru" },
  { term: "Pegging", def: "Praktik, bei der eine Frau einen Mann anal mit einem Strap-on Dildo penetriert.", link: "https://de.wikipedia.org/wiki/Pegging" },
  { term: "CNC (Consensual Non-Consent)", def: "Einvernehmlich vereinbartes Spiel mit gespieltem Widerstand und Überwältigungs-Fantasien unter festen Safewords.", link: "https://de.wikipedia.org/wiki/BDSM" },
  { term: "Free-Use", def: "Vereinbarung, bei der ein Partner im Schlafzimmer jederzeit ohne gesonderte Nachfrage intim berührt werden darf.", link: "https://de.wikipedia.org/wiki/BDSM" }
];

// DYNAMISCHE HETERO-ANPASSUNGEN (Anatomie-spezifische Texte)
const dynamicHeteoCatalog = {
  // Kapitel 6: Oralverkehr & Ejakulation
  63: {
    penis: { r1: "Sie ausgiebig mit Lippen & Zunge lecken (Cunnilingus)", r2: "Sie lecken & dabei ihr Tempo / Reiten spüren" },
    vulva: { r1: "Ihn mein Becken lecken lassen & sein Tempo diktieren", r2: "Cunnilingus von ihm empfangen & mich fallenlassen" }
  },
  64: {
    penis: { r1: "Ihren Kopf beim Blowjob sanft führen & Takt vorgeben", r2: "Einen hingebungsvollen Blowjob von ihr empfangen & genießen" },
    vulva: { r1: "Ihm einen hingebungsvollen Blowjob geben", r2: "Ihn oral verwöhnen & mich von ihm führen lassen" }
  },
  66: {
    penis: { r1: "Sie anleiten, meine Hoden in den Mund zu nehmen", r2: "Ihre warmen Lippen & Zunge an meinen Hoden spüren" },
    vulva: { r1: "Seine Hoden behutsam in den Mund nehmen & saugen", r2: "Ihn an den Hoden verwöhnen & seine Reaktionen spüren" }
  },
  67: {
    penis: { r1: "Das Blastraining mit dem Dildo bei ihr anleiten", r2: "Selbst an einem Dildo den Rachen entspannen üben" },
    vulva: { r1: "Ihn beim Blastraining anleiten", r2: "Mit dem Dildo-Toy tiefes Aufnehmen für ihn üben" }
  },
  68: {
    penis: { r1: "Ihren Kopf halten & tief in ihren Rachen gleiten", r2: "Die warme Enge ihres Halses an meinem Glied spüren" },
    vulva: { r1: "Ihn tief in meinen Mund ziehen & seinen Takt steuern", r2: "Seinen Penis ganz tief im Hals aufnehmen (Deepthroat)" }
  },
  69: {
    penis: { r1: "Ihren Kopf festhalten & im Mund fordernd stoßen (Face-Fucking)", r2: "Ihren Mund als warme Hülle für meine Stöße nutzen" },
    vulva: { r1: "Ihn mein Gesicht halten lassen & seine Stöße annehmen", r2: "Ihn fordernd im Mund aufnehmen & den Kopf halten lassen" }
  },
  71: {
    penis: { r1: "Sie im Mund bis zum Orgasmus lecken", r2: "In ihrem Mund zum Samenerguss kommen" },
    vulva: { r1: "Ihn mit Mund & Lippen bis zum Samenerguss bringen", r2: "Beim Lecken durch ihn zum Orgasmus kommen" }
  },
  72: {
    penis: { r1: "In ihrem Mund ejakulieren & sehen, wie sie schluckt", r2: "Ihr den Samenerguss im Mund überlassen" },
    vulva: { r1: "Ihn in meinem Mund kommen lassen & sein Sperma schlucken", r2: "Sein Ejakulat im Mund aufnehmen & herunterschlucken" }
  },
  73: {
    penis: { r1: "Meinen Höhepunkt auf ihrem Gesicht oder Dekolleté platzieren", r2: "Ihr mein Ejakulat auf ihrer Haut präsentieren" },
    vulva: { r1: "Ihn auffordern, auf mein Gesicht oder Dekolleté zu kommen", r2: "Sein warmes Ejakulat auf meinem Gesicht oder Busen empfangen" }
  },
  74: {
    penis: { r1: "Ihren Blick von oben beim Blowjob erwidern", r2: "Ihre Augen mustern, während sie mich im Mund hat" },
    vulva: { r1: "Ihm beim Blasen tief in die Augen blicken", r2: "Seinen fordernden Blick von oben standhalten" }
  },

  // Kapitel 7: Orgasmussteuerung
  91: {
    penis: { r1: "Sie anleiten, meine Prostata sanft von innen zu massieren", r2: "Einen Prostata-Orgasmus von ihr empfangen" },
    vulva: { r1: "Seine Prostata mit Finger oder Toy massieren & zum Kommen bringen", r2: "Ihn bei der inneren Prostata-Massage leiten & begleiten" }
  },

  // Kapitel 8: Keuschhaltung (Mann)
  106: {
    penis: { r1: "Ihr den Schlüssel übergeben & mich verschließen lassen", r2: "Den Keuschheitskäfig an meinem Glied tragen & spüren" },
    vulva: { r1: "Ihn im Keuschheitskäfig verschließen & den Schlüssel hüten", r2: "Ihn keusch halten & seinen Käfig mustern" }
  },
  107: {
    penis: { r1: "Ihr den Schlüssel feierlich als Kette umhängen", r2: "Wissen, dass sie meinen Schlüssel Tag & Nacht an ihrem Körper trägt" },
    vulva: { r1: "Seinen Keuschheitsschlüssel Tag & Nacht an einer Kette tragen", r2: "Ihn spüren lassen, dass ich die alleinige Schlüsselgewalt habe" }
  },
  109: {
    penis: { r1: "Vor ihr zur täglichen Schlosskontrolle & Reinigung antreten", r2: "Von ihr aufgeschlossen, gereinigt & direkt wieder verschlossen werden" },
    vulva: { r1: "Seinen Käfig täglich öffnen, ihn waschen & sofort wieder verriegeln", r2: "Seine Intimhygiene unter meiner strengen Aufsicht kontrollieren" }
  },
  111: {
    penis: { r1: "Ihr den Käfig hinhalten, damit sie dagegen tippt", r2: "Das Klopfen ihrer Finger gegen mein Metallgitter spüren" },
    vulva: { r1: "Im Alltag beiläufig mit den Fingern gegen seinen Käfig klopfen", r2: "Ihn durch leichtes Klopfen an seinen Verschluss erinnern" }
  },
  113: {
    penis: { r1: "Ihr zeigen, wie eng der Käfig bei Erregung drückt", r2: "Die Enge im Käfig spüren, wenn mein Körper wachsen will" },
    vulva: { r1: "Prüfen & sehen, wie sein Glied den Käfig prall ausfüllt", r2: "Ihn heiß machen & zusehen, wie er an die Gitter stößt" }
  },
  114: {
    penis: { r1: "Vor ihr niederknien & ihren Schlüssel andächtig küssen", r2: "Auf Knien um das Aufschließen meines Käfigs bitten" },
    vulva: { r1: "Ihm den Schlüssel auf Knien zum Küssen hinhalten", r2: "Ihn vor mir knien lassen & um das Schloss bitten lassen" }
  },
  117: {
    penis: { r1: "Sie bitten, mich durch die Gitterstäbe zu necken", r2: "Im Käfig von ihr heiß gemacht & gequält werden" },
    vulva: { r1: "Ihn durch die Käfiggitter intensiv heiß machen & necken", r2: "Seine Sehnsucht im Käfig schüren & ihn zappeln lassen" }
  },
  121: {
    penis: { r1: "Sie bitten, mich im Käfig zum Höhepunkt zu treiben", r2: "Den ruinierten Orgasmus im Käfig aushalten müssen" },
    vulva: { r1: "Ihn durch das Käfiggitter zum ruinierten Orgasmus zwingen", r2: "Sein Zucken im verschlossenen Käfig beobachten" }
  },

  // Kapitel 9: Reizwäsche & Garderobe (Frau)
  131: {
    penis: { r1: "Sie in feinen Spitzen-Dessous bewundern & entkleiden", r2: "Ihre Spitzenwäsche auf ihrer Haut berühren & küssen" },
    vulva: { r1: "Ihn in Spitzenwäsche verführen & mich präsentieren", r2: "Feine Spitzen-Dessous tragen & mich begehrt fühlen" }
  },
  133: {
    penis: { r1: "Die Riemchen ihres Strapsgürtels an ihren Beinen einhaken", r2: "Über ihre bestrumpften Oberschenkel streichen" },
    vulva: { r1: "Mich für ihn im Strapsgürtel & Strümpfen in Pose werfen", r2: "Den Strapsgürtel tragen & mich von ihm bewundern lassen" }
  },
  134: {
    penis: { r1: "Direkt durch den offenen Schritt ihres Slips zugreifen & lieben", r2: "Sie im Ouvert-Höschen nehmen" },
    vulva: { r1: "Ihn durch meinen offenen Schritt verführen", r2: "Das Ouvert-Höschen tragen & jederzeit bereit für ihn sein" }
  },
  138: {
    penis: { r1: "Ihr Korsett am Rücken fest schnüren & ihre Taille formen", r2: "Ihre aufrechte Haltung im geschnürten Korsett bewundern" },
    vulva: { r1: "Ihn mein Korsett fest schnüren lassen & Haltung zeigen", r2: "Fest geschnürt werden & seine Hände an meiner Taille spüren" }
  },

  // Kapitel 10: Erotische Kleidung & Fetisch (Mann)
  146: {
    penis: { r1: "Den sportlichen Jockstrap für sie tragen & meinen Po präsentieren", r2: "Mich von ihr im Jockstrap mustern & anfassen lassen" },
    vulva: { r1: "Ihn im Jockstrap mustern & fest in seinen Po greifen", r2: "Seinen durchtrainierten Körper im Jockstrap bewundern" }
  },
  147: {
    penis: { r1: "Das Leder-Brustgeschirr auf nackter Haut tragen & Haltung zeigen", r2: "Mich von ihr am Leder-Harness packen & führen lassen" },
    vulva: { r1: "Das Leder-Geschirr an seiner Brust packen & ihn lenken", r2: "Ihn im maskulinen Leder-Harness bewundern" }
  },
  151: {
    penis: { r1: "Das Hodenband anlegen & ihr die pralle Kontur zeigen", r2: "Das Leder-Hodenband tragen & die stramme Dehnung spüren" },
    vulva: { r1: "Das Lederband um seine Hoden festziehen & ihn begutachten", r2: "Sein Gemächt durch das Hodenband hervorgehoben sehen" }
  },
  153: {
    penis: { r1: "Vollkommen nackt vor der elegant bekleideten Partnerin dienen", r2: "Als nackter Mann vor ihr stehen & ihre Anweisungen ausführen" },
    vulva: { r1: "Vollständig bekleidet den nackten Mann führen & dominieren (CFNM)", r2: "Mich vom nackten Partner bedienen lassen, während ich bekleidet bin" }
  },

  // Kapitel 17: CBT & Hodenreize (Mann)
  287: {
    penis: { r1: "Ihr meine Hoden hinhalten & in ihre Hände legen", r2: "Ihre warmen Hände an meinen Hoden genießen" },
    vulva: { r1: "Seine Hoden in die Hand nehmen, wiegen & leicht kneten", r2: "Seine Hoden sanft umfassen & seine Reaktionen spüren" }
  },
  288: {
    penis: { r1: "Den schweren Edelstahl-Hodenring für sie anlegen", r2: "Den schweren Ring an meinen Hoden tragen & die Dehnung spüren" },
    vulva: { r1: "Den schweren Edelstahlring über seine Hoden streifen", r2: "Sehen & fühlen, wie das Metall seine Hoden nach unten zieht" }
  },
  289: {
    penis: { r1: "Ihr den Riemen reichen, um meine Hoden abzubinden", r2: "Die stramme Trennung meiner Hoden durch den Lederriemen ertragen" },
    vulva: { r1: "Den Lederriemen stramm um seinen Hodensack festziehen", r2: "Seine abgebundenen Hoden mustern & kontrollieren" }
  },
  290: {
    penis: { r1: "Ihr meine Hoden für dosierte Klapse darbieten", r2: "Leichte Klapse mit ihren Fingerkuppen auf meine Hoden aushalten" },
    vulva: { r1: "Mit den Fingerkuppen dosierte Klapse auf seine Hoden setzen", r2: "Seine Reaktionen bei leichten Klapsen auf die Hoden beobachten" }
  },
  296: {
    penis: { r1: "Ihr erlauben, meine Hoden sanft nach unten zu dehnen", r2: "Das wohltuende Ziehen spüren, wenn sie meine Hoden dehnt" },
    vulva: { r1: "Beide Hoden greifen & mit mäßiger Kraft nach unten dehnen", r2: "Seine Hoden in den Händen halten & den Zug dosieren" }
  },

  // Kapitel 27: Analerotik, Prostata & Pegging
  440: {
    penis: { r1: "Sie anleiten, meine Prostata von innen zu massieren", r2: "Ihren Finger an meiner Prostata spüren & loslassen" },
    vulva: { r1: "Seine Prostata vorsichtig mit gekrümmtem Finger massieren", r2: "Ihn bei der inneren Prostata-Massage begleiten & spüren" }
  },
  443: {
    penis: { r1: "Sie bitten, mich mit dem Strap-on zu lieben", r2: "Als Mann von ihr mit dem Strap-on genommen werden (Pegging)" },
    vulva: { r1: "Ihn aktiv mit dem Strap-on anal nehmen & führen (Pegging)", r2: "Den Strap-on umschnallen & die Kontrolle über sein Becken haben" }
  },

  // Kapitel 31 & 35: Spezial-Kinks
  543: {
    penis: { r1: "Unter ihrem Gesäß liegen & sie mit Hingabe lecken", r2: "Ihr Becken auf meinem Gesicht spüren & den Rhythmus annehmen" },
    vulva: { r1: "Mich rittlings auf sein Gesicht setzen & sein Lecken steuern (Queening)", r2: "Sein Gesicht als lebendigen Thron nutzen & mich lecken lassen" }
  },
  545: {
    penis: { r1: "Als nackter Mann vor der bekleideten Partnerin posieren", r2: "Nackt dienen, während sie in feiner Kleidung dominiert" },
    vulva: { r1: "Voll bekleidet den nackten Mann dirigieren (CFNM)", r2: "Die optische Macht über den nackten Partner auskosten" }
  },
  634: {
    penis: { r1: "Sie nach dem Orgasmus sauberlecken & meinen Samen aufsaugen", r2: "Mich von ihr nach dem Kommen sauberlecken lassen" },
    vulva: { r1: "Seinen Samen nach dem Höhepunkt mit den Lippen aufsaugen & schlucken", r2: "Mich von ihm nach dem Sex zärtlich sauberlecken lassen" }
  },
  635: {
    penis: { r1: "Mit meinem erigierten Glied leichte Klapse auf ihre Wange/Po setzen", r2: "Ihr mein Glied für sanfte Klapse anbieten" },
    vulva: { r1: "Ihn bitten, mir sanfte Klapse mit seinem Glied zu geben", r2: "Die sanften Klapse seines Glieds auf Lippen oder Wange empfangen" }
  }
};

// Hilfsfunktion: Liefert dynamisch angepassten Item-Text basierend auf Anatomie
function getDynamicItem(item, userKey) {
  const userAnat = anatomy[userKey] || (userKey === 'A' ? 'penis' : 'vulva');
  const dyn = dynamicHeteoCatalog[item.id];
  if (!dyn || !dyn[userAnat]) {
    return item;
  }
  return {
    ...item,
    r1: dyn[userAnat].r1 || item.r1,
    r2: dyn[userAnat].r2 || item.r2,
    desc: dyn[userAnat].desc || item.desc
  };
}

function getLexikonList() {
  const custom = window.lexikonData || [];
  const merged = [...defaultLexikonData];
  custom.forEach(c => {
    if (!merged.some(m => m.term.toLowerCase() === c.term.toLowerCase())) {
      merged.push(c);
    }
  });
  return merged;
}

function initApp() {
  loadFromLocalStorage();
  checkUrlHashData();
  applySavedTheme();

  const lock = document.getElementById('site-lockscreen');
  if (lock) {
    if (sessionStorage.getItem('kompass_unlocked') === 'true') {
      lock.classList.add('hidden');
      checkOnboardingStatus();
    } else {
      lock.classList.remove('hidden');
    }
  } else {
    checkOnboardingStatus();
  }

  updateCurrentUserUI();
  renderCurrentChapter(false);
  renderQuickGrid();
  updateProgressBar();
  updateTabuBadge();
  checkChapterQuickGridVisibility();
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

function applySavedTheme() {
  const saved = localStorage.getItem('kompass_theme') || 'dark';
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  updateThemeUI(saved);
}

function toggleGlobalTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';

  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
    localStorage.setItem('kompass_theme', 'dark');
    showToast("Nacht-Design aktiviert");
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('kompass_theme', 'light');
    showToast("Helles Design aktiviert");
  }

  updateThemeUI(newTheme);
  if (singleRadarInstance) renderSingleRadar();
}

function updateThemeUI(theme) {
  const icon = document.getElementById('theme-toggle-icon');
  const label = document.getElementById('theme-toggle-label');
  if (icon) icon.innerText = (theme === 'dark') ? '🌙' : '☀️';
  if (label) label.innerText = (theme === 'dark') ? 'Nacht' : 'Tag';
}

function checkOnboardingStatus() {
  const u = currentUser;
  if (!accounts[u] || !accounts[u].setupDone) {
    openOnboardingModal();
  }
}

function openOnboardingModal() {
  onboardingStep = 1;
  const title = document.getElementById('onboarding-user-title');
  if (title) title.innerText = names[currentUser] || 'Partner 1';
  const nameInput = document.getElementById('onboarding-name-input');
  if (nameInput) nameInput.value = names[currentUser] || '';
  
  updateOnboardingAnatomyUI();
  updateOnboardingStepUI();
  const m = document.getElementById('modal-onboarding');
  if (m) m.classList.remove('hidden');
}

function updateOnboardingAnatomyUI() {
  const anat = anatomy[currentUser] || 'penis';
  const btnP = document.getElementById('onboarding-anat-penis');
  const btnV = document.getElementById('onboarding-anat-vulva');
  if (btnP && btnV) {
    if (anat === 'penis') {
      btnP.className = "flex-1 p-3 rounded-2xl border bg-brand-50 border-brand-500 text-brand-950 font-bold shadow-xs text-left touch-pill";
      btnV.className = "flex-1 p-3 rounded-2xl border bg-slate-50 border-slate-200 text-slate-700 text-left touch-pill hover:bg-slate-100";
    } else {
      btnV.className = "flex-1 p-3 rounded-2xl border bg-brand-50 border-brand-500 text-brand-950 font-bold shadow-xs text-left touch-pill";
      btnP.className = "flex-1 p-3 rounded-2xl border bg-slate-50 border-slate-200 text-slate-700 text-left touch-pill hover:bg-slate-100";
    }
  }
}

function selectOnboardingAnatomy(type) {
  setAnatomy(currentUser, type);
  updateOnboardingAnatomyUI();
}

function closeOnboardingModal() {
  const u = currentUser;
  if (!accounts[u]) accounts[u] = { email: '', partnerEmail: '', setupDone: true };
  accounts[u].setupDone = true;
  saveToLocalStorage();
  const m = document.getElementById('modal-onboarding');
  if (m) m.classList.add('hidden');
}

function updateOnboardingStepUI() {
  const s1 = document.getElementById('onboarding-step-1');
  const s2 = document.getElementById('onboarding-step-2');
  const s3 = document.getElementById('onboarding-step-3');
  const prevBtn = document.getElementById('onboarding-btn-prev');
  const nextBtn = document.getElementById('onboarding-btn-next');
  const ind = document.getElementById('onboarding-step-indicator');

  if (ind) ind.innerText = `Schritt ${onboardingStep} von 3`;

  [s1, s2, s3].forEach(s => { if (s) s.classList.add('hidden'); });

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
    if (val) {
      names[u] = val;
    }
    updateCurrentUserUI();
    onboardingStep = 2;
    updateOnboardingStepUI();
  } else if (onboardingStep === 2) {
    const sel = document.querySelector('input[name="onboarding-privacy"]:checked')?.value || 'blind';
    if (!privacy[u]) privacy[u] = { mode: 'blind', shareNotes: true, chapters: {} };
    privacy[u].mode = sel;
    onboardingStep = 3;
    updateOnboardingStepUI();
  } else if (onboardingStep === 3) {
    const email = document.getElementById('onboarding-email-input')?.value.trim() || '';
    if (!accounts[u]) accounts[u] = { email: '', partnerEmail: '', setupDone: true };
    accounts[u].email = email;
    accounts[u].setupDone = true;
    saveToLocalStorage();
    document.getElementById('modal-onboarding')?.classList.add('hidden');
    showToast(`Willkommen, ${names[u]}! Dynamischer Hetero-Fragebogen aktiviert.`);
  }
}

function setAnatomy(userKey, type) {
  anatomy[userKey] = type;
  // Automatische Komplementär-Einstellung für den Partner in einer heterosexuellen Beziehung
  const otherUser = userKey === 'A' ? 'B' : 'A';
  anatomy[otherUser] = type === 'penis' ? 'vulva' : 'penis';
  saveToLocalStorage();
  updateCurrentUserUI();
  renderCurrentChapter(false);
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('kompass_answers', JSON.stringify(answers));
    localStorage.setItem('kompass_notes', JSON.stringify(notes));
    localStorage.setItem('kompass_shame', JSON.stringify(shameFlags));
    localStorage.setItem('kompass_names', JSON.stringify(names));
    localStorage.setItem('kompass_anatomy', JSON.stringify(anatomy));
    localStorage.setItem('kompass_privacy', JSON.stringify(privacy));
    localStorage.setItem('kompass_accounts', JSON.stringify(accounts));
  } catch (e) {
    console.error("Fehler beim Speichern in LocalStorage:", e);
  }
}

function loadFromLocalStorage() {
  try {
    const a = localStorage.getItem('kompass_answers');
    const n = localStorage.getItem('kompass_notes');
    const sh = localStorage.getItem('kompass_shame');
    const nm = localStorage.getItem('kompass_names');
    const an = localStorage.getItem('kompass_anatomy');
    const p = localStorage.getItem('kompass_privacy');
    const ac = localStorage.getItem('kompass_accounts');

    if (a) answers = JSON.parse(a);
    if (n) notes = JSON.parse(n);
    if (sh) shameFlags = JSON.parse(sh);
    if (nm) names = JSON.parse(nm);
    if (an) anatomy = JSON.parse(an);
    if (p) privacy = JSON.parse(p);
    if (ac) accounts = JSON.parse(ac);
  } catch (e) {
    console.error("Fehler beim Laden aus LocalStorage:", e);
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
      saveToLocalStorage();

      currentUser = (payload.sender === 'A') ? 'B' : 'A';
      showToast(`Daten von ${names[payload.sender || 'A']} geladen!`);
    }
  } catch (e) {
    console.error("Fehler beim Dekodieren des Einladungslinks:", e);
  }
}

function switchMainView(viewId) {
  const vSurvey = document.getElementById('view-survey');
  const vSingle = document.getElementById('view-single');

  const uAnswers = answers[currentUser] || {};
  const currentCount = Object.keys(uAnswers).length;

  if (viewId === 'single' && currentCount < 5) {
    const modal = document.getElementById('modal-gating-incomplete');
    const title = document.getElementById('gating-modal-title');
    const desc = document.getElementById('gating-modal-desc');
    if (title) title.innerText = "Persönliches Profil noch gesperrt";
    if (desc) desc.innerText = "Bitte bewerte zuerst die ersten Punkte im Fragebogen, damit dein Profil und deine Archetypen berechnet werden können.";
    if (modal) modal.classList.remove('hidden');
    return;
  }

  if (vSurvey) vSurvey.classList.add('hidden');
  if (vSingle) vSingle.classList.add('hidden');

  const btnS = document.getElementById('nav-btn-survey');
  const btnSi = document.getElementById('nav-btn-single');

  [btnS, btnSi].filter(Boolean).forEach(b => {
    b.className = "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1";
  });

  if (viewId === 'survey') {
    if (vSurvey) vSurvey.classList.remove('hidden');
    if (btnS) btnS.className = "px-3 py-1.5 rounded-lg bg-brand-700 text-white shadow-sm transition";
    renderCurrentChapter(false);
  } else if (viewId === 'single') {
    if (vSingle) vSingle.classList.remove('hidden');
    if (btnSi) btnSi.className = "px-3 py-1.5 rounded-lg bg-brand-700 text-white shadow-sm transition";
    renderSingleAnalysis();
  }
}

function setCurrentUser(user) {
  currentUser = user;
  updateCurrentUserUI();
  renderCurrentChapter(false);
  updateProgressBar();
  updateTabuBadge();
  checkChapterQuickGridVisibility();
  checkOnboardingStatus();
  showToast(`Aktives Profil: ${names[user]}`);
}

function updateCurrentUserUI() {
  const u = currentUser;
  const btnA = document.getElementById('btn-user-A');
  const btnB = document.getElementById('btn-user-B');
  const dispA = document.getElementById('user-display-A');
  const dispB = document.getElementById('user-display-B');

  const anatA = anatomy.A === 'penis' ? '♂️' : '♀️';
  const anatB = anatomy.B === 'penis' ? '♂️' : '♀️';

  if (dispA) dispA.innerText = `${names.A || 'Partner 1'} (${anatA})`;
  if (dispB) dispB.innerText = `${names.B || 'Partner 2'} (${anatB})`;

  if (u === 'A') {
    if (btnA) btnA.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-white text-indigo-700 shadow-xs";
    if (btnB) btnB.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 text-slate-600 hover:text-slate-900";
  } else {
    if (btnB) btnB.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-white text-purple-700 shadow-xs";
    if (btnA) btnA.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 text-slate-600 hover:text-slate-900";
  }

  const emptyName = document.getElementById('empty-state-username');
  if (emptyName) emptyName.innerText = names[u] || 'Partner 1';
  const singleName = document.getElementById('single-profile-name');
  if (singleName) singleName.innerText = `${names[u] || 'Partner 1'} (${anatomy[u] === 'penis' ? '♂️ Mann' : '♀️ Frau'})`;
}

// FILTER-STEUERUNG
function setSurveyFilter(filterType) {
  currentFilter = filterType;
  const filters = ['all', 'unanswered', 'high', 'tabu', 'shame'];
  filters.forEach(f => {
    const btn = document.getElementById(`filter-btn-${f}`);
    if (btn) {
      if (f === filterType) {
        btn.className = "px-2.5 py-1 rounded-lg font-bold bg-brand-700 text-white shadow-xs transition";
      } else {
        btn.className = "px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition";
      }
    }
  });
  renderCurrentChapter(false);
}

function handleSurveySearch(q) {
  searchQuery = (q || '').trim().toLowerCase();
  renderCurrentChapter(false);
}

function renderCurrentChapter(shouldScroll = false) {
  const chapters = window.surveyChapters || [];
  if (chapters.length === 0) return;
  if (currentChapterIndex >= chapters.length) currentChapterIndex = 0;
  const ch = chapters[currentChapterIndex];
  if (!ch) return;

  const badge = document.getElementById('chapter-badge');
  const title = document.getElementById('chapter-title');
  const desc = document.getElementById('chapter-desc');
  const countEl = document.getElementById('chapter-items-count');

  if (badge) badge.innerText = `Kapitel ${currentChapterIndex + 1} / ${chapters.length}`;
  if (title) title.innerText = ch.title;
  if (desc) desc.innerText = ch.desc;
  if (countEl) countEl.innerText = `${ch.items ? ch.items.length : 0} Praktiken`;

  const prevBtn = document.getElementById('btn-prev-chapter');
  if (prevBtn) prevBtn.disabled = (currentChapterIndex === 0);

  const nextBtn = document.getElementById('btn-next-chapter');
  if (nextBtn) {
    nextBtn.innerText = (currentChapterIndex === chapters.length - 1) ? "Zur Analyse →" : "Weiter →";
  }

  const container = document.getElementById('survey-items-container');
  if (!container) return;

  const uAnswers = answers[currentUser] || {};
  const uShame = shameFlags[currentUser] || {};

  // Filtern der Items
  const items = (ch.items || []).filter(rawIt => {
    const it = getDynamicItem(rawIt, currentUser);

    // 1. Textsuche
    if (searchQuery) {
      const matchText = `${it.id} ${it.title} ${it.desc} ${it.r1 || ''} ${it.r2 || ''}`.toLowerCase();
      if (!matchText.includes(searchQuery)) return false;
    }

    // 2. Filter-Status
    if (currentFilter === 'all') return true;

    const r1 = uAnswers[`it_${it.id}_r1`];
    const r2 = uAnswers[`it_${it.id}_r2`];
    const choice = uAnswers[`it_${it.id}_choice`];
    const isAnswered = it.type === 'choice' ? (choice !== undefined) : (r1 !== undefined || r2 !== undefined);

    if (currentFilter === 'unanswered') return !isAnswered;
    if (currentFilter === 'high') return (r1 >= 4 || r2 >= 4);
    if (currentFilter === 'tabu') return (r1 === 1 || r2 === 1);
    if (currentFilter === 'shame') return !!uShame[it.id];

    return true;
  });

  if (items.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
        <span class="text-2xl">🔍</span>
        <p class="text-xs font-bold text-slate-700">Keine Praktiken für diesen Filter in Kapitel ${currentChapterIndex + 1} gefunden.</p>
        <button type="button" onclick="setSurveyFilter('all')" class="text-[11px] text-brand-600 hover:underline font-bold">Filter zurücksetzen (Alle anzeigen)</button>
      </div>
    `;
    return;
  }

  let html = '';
  items.forEach(rawIt => {
    const it = getDynamicItem(rawIt, currentUser);
    const keyR1 = `it_${it.id}_r1`;
    const keyR2 = `it_${it.id}_r2`;
    const keyChoice = `it_${it.id}_choice`;

    const valR1 = answers[currentUser]?.[keyR1];
    const valR2 = answers[currentUser]?.[keyR2];
    const valChoice = answers[currentUser]?.[keyChoice];
    const noteVal = notes[currentUser]?.[it.id] || '';
    const isShame = !!shameFlags[currentUser]?.[it.id];

    const shameBtnHtml = `
      <button type="button" onclick="toggleShameFlag(${it.id}, this)" class="text-[10px] font-bold px-2 py-0.5 rounded-lg border transition ${isShame ? 'bg-purple-100 border-purple-400 text-purple-900 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}" title="Aktivieren, wenn dir dieser Wunsch verletzlich/schambehaftet ist">
        ${isShame ? '❤️‍🔥 Hoher Reiz, aber schambelastet' : '🙈 Hemmschwelle'}
      </button>
    `;

    if (it.type === 'choice') {
      html += `
        <div class="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="font-extrabold text-xs text-slate-900">${it.id}. ${escapeHtml(it.title)}</span>
              <div class="flex items-center gap-1.5">
                ${shameBtnHtml}
                <button type="button" onclick="openLexikonForItem(${it.id})" class="text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800">📖 Lexikon</button>
              </div>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${escapeHtml(it.desc)}</p>
            <span class="block text-xs font-bold text-slate-800 mt-2">${escapeHtml(it.question || 'Deine Haltung:')}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 choice-buttons-group">
            ${(it.options || []).map(opt => {
              const isChecked = (valChoice === opt.val);
              return `
                <button type="button" onclick="recordChoiceAnswer(${it.id}, '${opt.val}', this)" data-val="${opt.val}"
                        class="p-2.5 rounded-xl border text-left text-xs font-semibold transition touch-pill ${isChecked ? 'bg-brand-50 border-brand-500 text-brand-950 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}">
                  ${opt.label}
                </button>
              `;
            }).join('')}
          </div>
          <input type="text" value="${escapeHtml(noteVal)}" onchange="recordNote(${it.id}, this.value)" placeholder="Persönliche Bedingung / Notiz (optional)..." class="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500">
        </div>
      `;
    } else {
      html += `
        <div class="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="font-extrabold text-xs text-slate-900">${it.id}. ${escapeHtml(it.title)}</span>
              <div class="flex items-center gap-1.5">
                ${shameBtnHtml}
                <button type="button" onclick="openLexikonForItem(${it.id})" class="text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800">📖 Lexikon</button>
              </div>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${escapeHtml(it.desc)}</p>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5" data-scale-key="${keyR1}">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-800">${escapeHtml(it.r1)}:</span>
              <span class="text-[10.5px] font-semibold text-slate-500 scale-label">${getPillLabel(valR1)}</span>
            </div>
            <div class="grid grid-cols-6 gap-1 scale-buttons-row">
              ${[0, 1, 2, 3, 4, 5].map(sc => `
                <button type="button" onclick="recordScaleAnswer('${keyR1}', ${sc}, this)" data-score="${sc}" class="py-1.5 rounded-lg border text-center text-xs font-bold transition touch-pill ${valR1 === sc ? getScoreActiveStyle(sc) : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}">
                  ${sc === 1 ? '⛔ 1' : (sc === 5 ? '⭐ 5' : sc)}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5" data-scale-key="${keyR2}">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-800">${escapeHtml(it.r2)}:</span>
              <span class="text-[10.5px] font-semibold text-slate-500 scale-label">${getPillLabel(valR2)}</span>
            </div>
            <div class="grid grid-cols-6 gap-1 scale-buttons-row">
              ${[0, 1, 2, 3, 4, 5].map(sc => `
                <button type="button" onclick="recordScaleAnswer('${keyR2}', ${sc}, this)" data-score="${sc}" class="py-1.5 rounded-lg border text-center text-xs font-bold transition touch-pill ${valR2 === sc ? getScoreActiveStyle(sc) : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}">
                  ${sc === 1 ? '⛔ 1' : (sc === 5 ? '⭐ 5' : sc)}
                </button>
              `).join('')}
            </div>
          </div>

          <input type="text" value="${escapeHtml(noteVal)}" onchange="recordNote(${it.id}, this.value)" placeholder="Bedingung / Notiz (z. B. 'Nur mit Vorwarnung')..." class="w-full text-[11px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500">
        </div>
      `;
    }
  });

  container.innerHTML = html;
  if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function toggleShameFlag(itemId, btnEl) {
  if (!shameFlags[currentUser]) shameFlags[currentUser] = {};
  const current = !shameFlags[currentUser][itemId];
  shameFlags[currentUser][itemId] = current;
  saveToLocalStorage();

  if (btnEl) {
    if (current) {
      btnEl.className = "text-[10px] font-bold px-2 py-0.5 rounded-lg border transition bg-purple-100 border-purple-400 text-purple-900 shadow-xs";
      btnEl.innerText = "❤️‍🔥 Hoher Reiz, aber schambelastet";
      showToast("Als schambelastete Fantasie markiert (Wird in der Analyse behutsam geschützt)");
    } else {
      btnEl.className = "text-[10px] font-bold px-2 py-0.5 rounded-lg border transition bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100";
      btnEl.innerText = "🙈 Hemmschwelle";
    }
  }
}

function getPillLabel(score) {
  if (score === undefined || score === null) return "Nicht bewertet";
  if (score === 0) return "0 (Entfällt / Desinteresse)";
  if (score === 1) return "⛔ 1 (Absolutes Tabu / Grenze)";
  if (score === 2) return "🎁 2 (Dem Partner zuliebe / Strafe)";
  if (score === 3) return "💡 3 (Neugierig / Gesprächsbedarf)";
  if (score === 4) return "✨ 4 (Reizvoll / Schöne Bereicherung)";
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

function recordScaleAnswer(key, score, btnEl) {
  if (!answers[currentUser]) answers[currentUser] = {};
  answers[currentUser][key] = score;
  saveToLocalStorage();

  // In-Place DOM-Aktualisierung
  if (btnEl && btnEl.parentElement) {
    const buttons = btnEl.parentElement.querySelectorAll('button');
    buttons.forEach(b => {
      const sc = parseInt(b.getAttribute('data-score'), 10);
      if (sc === score) {
        b.className = `py-1.5 rounded-lg border text-center text-xs font-bold transition touch-pill ${getScoreActiveStyle(sc)}`;
      } else {
        b.className = 'py-1.5 rounded-lg border text-center text-xs font-bold transition touch-pill bg-white border-slate-200 text-slate-600 hover:bg-slate-100';
      }
    });
    const label = btnEl.closest('[data-scale-key]')?.querySelector('.scale-label');
    if (label) label.innerText = getPillLabel(score);
  } else {
    renderCurrentChapter(false);
  }

  updateProgressBar();
  updateTabuBadge();
  checkChapterQuickGridVisibility();
}

function recordChoiceAnswer(id, val, btnEl) {
  if (!answers[currentUser]) answers[currentUser] = {};
  answers[currentUser][`it_${id}_choice`] = val;
  saveToLocalStorage();

  if (btnEl && btnEl.parentElement) {
    const buttons = btnEl.parentElement.querySelectorAll('button');
    buttons.forEach(b => {
      const isChecked = (b.getAttribute('data-val') === val);
      if (isChecked) {
        b.className = 'p-2.5 rounded-xl border text-left text-xs font-semibold transition touch-pill bg-brand-50 border-brand-500 text-brand-950 font-bold shadow-xs';
      } else {
        b.className = 'p-2.5 rounded-xl border text-left text-xs font-semibold transition touch-pill bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
      }
    });
  } else {
    renderCurrentChapter(false);
  }

  updateProgressBar();
  checkChapterQuickGridVisibility();
}

function recordNote(id, text) {
  if (!notes[currentUser]) notes[currentUser] = {};
  notes[currentUser][id] = (text || '').trim();
  saveToLocalStorage();
}

function prevChapter() {
  if (currentChapterIndex > 0) {
    currentChapterIndex--;
    renderCurrentChapter(true);
  }
}

function nextChapter() {
  const chapters = window.surveyChapters || [];
  if (currentChapterIndex < chapters.length - 1) {
    currentChapterIndex++;
    renderCurrentChapter(true);
  } else {
    switchMainView('single');
  }
}

function jumpToChapter(idx) {
  currentChapterIndex = idx;
  switchMainView('survey');
  renderCurrentChapter(true);
}

function renderQuickGrid() {
  const grid = document.getElementById('quick-grid-buttons');
  const chapters = window.surveyChapters || [];
  if (!grid || chapters.length === 0) return;
  grid.innerHTML = chapters.map((ch, idx) => `
    <button type="button" onclick="jumpToChapter(${idx})" class="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 truncate">
      ${idx + 1}. ${escapeHtml(ch.title)}
    </button>
  `).join('');
}

function checkChapterQuickGridVisibility() {
  const qg = document.getElementById('chapter-quick-grid');
  if (!qg) return;
  const count = Object.keys(answers[currentUser] || {}).length;
  if (count >= 5) {
    qg.classList.remove('hidden');
  } else {
    qg.classList.add('hidden');
  }
}

function updateProgressBar() {
  const chapters = window.surveyChapters || [];
  if (chapters.length === 0) return;

  let totalItems = 0;
  chapters.forEach(c => {
    totalItems += (c.items || []).length;
  });

  const uAnswers = answers[currentUser] || {};
  let answeredItems = 0;

  chapters.forEach(c => {
    (c.items || []).forEach(it => {
      if (it.type === 'choice') {
        if (uAnswers[`it_${it.id}_choice`] !== undefined) answeredItems++;
      } else {
        const v1 = uAnswers[`it_${it.id}_r1`];
        const v2 = uAnswers[`it_${it.id}_r2`];
        if (v1 !== undefined || v2 !== undefined) answeredItems++;
      }
    });
  });

  const pct = totalItems > 0 ? Math.min(100, Math.round((answeredItems / totalItems) * 100)) : 0;
  const fill = document.getElementById('progress-bar-fill');
  const txt = document.getElementById('progress-text');

  if (fill) fill.style.width = `${pct}%`;
  if (txt) txt.innerText = `Fortschritt: ${pct} % (${answeredItems}/${totalItems || 635} Praktiken bewertet)`;
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

function renderSingleAnalysis() {
  const uAnswers = answers[currentUser] || {};
  const count = Object.keys(uAnswers).length;
  const emptyBox = document.getElementById('single-empty-state');
  const contentBox = document.getElementById('single-content-state');

  if (count < 2) {
    if (emptyBox) emptyBox.classList.remove('hidden');
    if (contentBox) contentBox.classList.add('hidden');
    return;
  }

  if (emptyBox) emptyBox.classList.add('hidden');
  if (contentBox) contentBox.classList.remove('hidden');

  let pPower = 0, pSensation = 0, pNurturing = 0, pThrill = 0, pVisual = 0;
  let countPower = 0, countSensation = 0, countNurturing = 0, countThrill = 0, countVisual = 0;

  const allChapters = window.surveyChapters || [];
  allChapters.forEach(ch => {
    (ch.items || []).forEach(it => {
      const v1 = uAnswers[`it_${it.id}_r1`];
      const v2 = uAnswers[`it_${it.id}_r2`];
      const addScore = (val) => {
        if (typeof val === 'number') {
          if ([21, 22, 23].includes(ch.id)) { pPower += val; countPower += 5; }
          else if ([13, 16, 17].includes(ch.id)) { pSensation += val; countSensation += 5; }
          else if ([19, 30].includes(ch.id)) { pNurturing += val; countNurturing += 5; }
          else if ([24, 25, 31].includes(ch.id)) { pThrill += val; countThrill += 5; }
          else if ([9, 10, 11].includes(ch.id)) { pVisual += val; countVisual += 5; }
        }
      };
      addScore(v1);
      addScore(v2);
    });
  });

  setBar('power', countPower > 0 ? Math.round((pPower / countPower) * 100) : 0);
  setBar('sensation', countSensation > 0 ? Math.round((pSensation / countSensation) * 100) : 0);
  setBar('nurturing', countNurturing > 0 ? Math.round((pNurturing / countNurturing) * 100) : 0);
  setBar('thrill', countThrill > 0 ? Math.round((pThrill / countThrill) * 100) : 0);
  setBar('visual', countVisual > 0 ? Math.round((pVisual / countVisual) * 100) : 0);

  let high5 = [];
  let tabus = [];

  allChapters.forEach(ch => {
    (ch.items || []).forEach(rawIt => {
      const it = getDynamicItem(rawIt, currentUser);
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
    h5El.innerHTML = high5.length > 0
      ? high5.map(h => `<div class="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">⭐ ${escapeHtml(h)}</div>`).join('')
      : '<p class="text-slate-400 italic">Noch keine 5er-Punkte.</p>';
  }

  const tbEl = document.getElementById('single-tabus-list');
  if (tbEl) {
    tbEl.innerHTML = tabus.length > 0
      ? tabus.map(t => `<div class="p-2 rounded-lg bg-rose-50 text-rose-900 border border-rose-200">⛔ ${escapeHtml(t)}</div>`).join('')
      : '<p class="text-slate-400 italic">Keine Tabus gesetzt.</p>';
  }

  renderSingleRadar();
}

function setBar(id, pct) {
  const val = document.getElementById(`bar-val-${id}`);
  const fill = document.getElementById(`bar-fill-${id}`);
  if (val) val.innerText = `${pct} %`;
  if (fill) fill.style.width = `${pct}%`;
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
    { label: 'Aftercare', chapters: [30] }
  ];

  const allChapters = window.surveyChapters || [];
  const uAnswers = answers[currentUser] || {};

  const scores = dimensions.map(dim => {
    let earned = 0;
    let possible = 0;
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
        label: `${names[currentUser] || 'Profil'} (${anatomy[currentUser] === 'penis' ? '♂️' : '♀️'})`,
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

// ACCOUNT & RECHTEVERWALTUNG
function openAccountModal() {
  const user = currentUser;
  const nameEl = document.getElementById('account-active-username');
  if (nameEl) nameEl.innerText = `${names[user] || 'Partner 1'} (${anatomy[user] === 'penis' ? '♂️ Mann' : '♀️ Frau'})`;

  const nameInput = document.getElementById('account-name-input');
  if (nameInput) nameInput.value = names[user] || '';

  const emailInput = document.getElementById('account-email-input');
  if (emailInput) emailInput.value = accounts[user]?.email || '';

  // Anatomie Buttons im Account aktualisieren
  updateAccountAnatomyUI();

  // Rechteverwaltung synchronisieren
  const curPrivacy = privacy[user]?.mode || 'blind';
  const rBlind = document.getElementById('account-priv-blind');
  const rOpen = document.getElementById('account-priv-open');
  if (rBlind && rOpen) {
    if (curPrivacy === 'open') rOpen.checked = true;
    else rBlind.checked = true;
  }

  const chkNotes = document.getElementById('account-share-notes');
  if (chkNotes) {
    chkNotes.checked = privacy[user]?.shareNotes !== false;
  }

  const resetUserSpan = document.getElementById('reset-current-username');
  if (resetUserSpan) resetUserSpan.innerText = names[user] || 'Partner 1';
  cancelResetConfirmation();

  const modal = document.getElementById('modal-account');
  if (modal) modal.classList.remove('hidden');
}

function updateAccountAnatomyUI() {
  const user = currentUser;
  const otherUser = user === 'A' ? 'B' : 'A';
  const myAnat = anatomy[user] || 'penis';
  const partnerAnat = anatomy[otherUser] || 'vulva';

  const btnMyP = document.getElementById('acc-anat-my-penis');
  const btnMyV = document.getElementById('acc-anat-my-vulva');
  const btnPartP = document.getElementById('acc-anat-part-penis');
  const btnPartV = document.getElementById('acc-anat-part-vulva');

  if (btnMyP && btnMyV) {
    if (myAnat === 'penis') {
      btnMyP.className = "flex-1 py-2 px-3 rounded-xl border bg-brand-50 border-brand-500 text-brand-950 font-bold text-xs shadow-xs touch-pill";
      btnMyV.className = "flex-1 py-2 px-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 text-xs touch-pill hover:bg-slate-100";
    } else {
      btnMyV.className = "flex-1 py-2 px-3 rounded-xl border bg-brand-50 border-brand-500 text-brand-950 font-bold text-xs shadow-xs touch-pill";
      btnMyP.className = "flex-1 py-2 px-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 text-xs touch-pill hover:bg-slate-100";
    }
  }

  if (btnPartP && btnPartV) {
    if (partnerAnat === 'penis') {
      btnPartP.className = "flex-1 py-2 px-3 rounded-xl border bg-indigo-50 border-indigo-500 text-indigo-950 font-bold text-xs shadow-xs touch-pill";
      btnPartV.className = "flex-1 py-2 px-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 text-xs touch-pill hover:bg-slate-100";
    } else {
      btnPartV.className = "flex-1 py-2 px-3 rounded-xl border bg-indigo-50 border-indigo-500 text-indigo-950 font-bold text-xs shadow-xs touch-pill";
      btnPartP.className = "flex-1 py-2 px-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 text-xs touch-pill hover:bg-slate-100";
    }
  }
}

function selectAccountAnatomy(forWhom, type) {
  if (forWhom === 'me') {
    setAnatomy(currentUser, type);
  } else {
    const otherUser = currentUser === 'A' ? 'B' : 'A';
    setAnatomy(otherUser, type);
  }
  updateAccountAnatomyUI();
  showToast("Anatomie & hetero-dynamische Rollen aktualisiert!");
}

function closeAccountModal() {
  const modal = document.getElementById('modal-account');
  if (modal) modal.classList.add('hidden');
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
  if (!privacy[currentUser]) privacy[currentUser] = { mode: 'blind', shareNotes: true, chapters: {} };
  privacy[currentUser].mode = mode;
  saveToLocalStorage();
  showToast(mode === 'open' ? 'Vollständig offene Einsicht für Partner aktiviert' : 'Selektiver Blind-Match aktiviert');
}

function updateShareNotes(isChecked) {
  if (!privacy[currentUser]) privacy[currentUser] = { mode: 'blind', shareNotes: true, chapters: {} };
  privacy[currentUser].shareNotes = isChecked;
  saveToLocalStorage();
  showToast(isChecked ? 'Notizen werden mit Partner geteilt' : 'Notizen bleiben rein privat');
}

function showResetConfirmation() {
  const trigger = document.getElementById('reset-trigger-area');
  const box = document.getElementById('reset-confirmation-box');
  if (trigger) trigger.classList.add('hidden');
  if (box) box.classList.remove('hidden');
}

function cancelResetConfirmation() {
  const trigger = document.getElementById('reset-trigger-area');
  const box = document.getElementById('reset-confirmation-box');
  if (trigger) trigger.classList.remove('hidden');
  if (box) box.classList.add('hidden');
}

function resetCurrentUserProfile() {
  const u = currentUser;
  answers[u] = {};
  notes[u] = {};
  shameFlags[u] = {};
  names[u] = (u === 'A') ? 'Partner 1' : 'Partner 2';
  if (accounts[u]) accounts[u].setupDone = false;
  
  saveToLocalStorage();
  cancelResetConfirmation();
  closeAccountModal();
  
  updateCurrentUserUI();
  renderCurrentChapter(false);
  updateProgressBar();
  updateTabuBadge();
  checkChapterQuickGridVisibility();
  
  showToast(`Profil ${names[u]} erfolgreich zurückgesetzt.`);
}

function generateRandomTestData() {
  const chapters = window.surveyChapters || [];
  if (chapters.length === 0) {
    showToast("Fragenkatalog noch nicht geladen.");
    return;
  }

  answers = { A: {}, B: {} };
  notes = { A: {}, B: {} };
  shameFlags = { A: {}, B: {} };

  chapters.forEach(ch => {
    (ch.items || []).forEach(it => {
      if (it.type === 'choice') {
        const opts = it.options || [];
        if (opts.length > 0) {
          answers.A[`it_${it.id}_choice`] = opts[Math.floor(Math.random() * opts.length)].val;
          answers.B[`it_${it.id}_choice`] = opts[Math.floor(Math.random() * opts.length)].val;
        }
      } else {
        const weightedScores = [0, 1, 2, 3, 3, 4, 4, 4, 5, 5];
        answers.A[`it_${it.id}_r1`] = weightedScores[Math.floor(Math.random() * weightedScores.length)];
        answers.A[`it_${it.id}_r2`] = weightedScores[Math.floor(Math.random() * weightedScores.length)];
        answers.B[`it_${it.id}_r1`] = weightedScores[Math.floor(Math.random() * weightedScores.length)];
        answers.B[`it_${it.id}_r2`] = weightedScores[Math.floor(Math.random() * weightedScores.length)];
      }

      if (Math.random() < 0.15) {
        shameFlags.A[it.id] = true;
      }
      if (Math.random() < 0.15) {
        shameFlags.B[it.id] = true;
      }
    });
  });

  saveToLocalStorage();
  updateProgressBar();
  updateTabuBadge();
  renderCurrentChapter(false);
  closeAccountModal();
  showToast("🎲 Zufällige Testdaten erfolgreich generiert!");
}

function openTabuModal() {
  const list = document.getElementById('tabu-modal-list');
  if (!list) return;

  let executeTabus = []; // Spalte 1: Was man nicht TUN/AUSFÜHREN will (Top / Aktiv)
  let receiveTabus = []; // Spalte 2: Was man nicht ERTRAGEN/EMPFANGEN will (Bottom / Passiv)

  const chapters = window.surveyChapters || [];
  chapters.forEach(ch => {
    (ch.items || []).forEach(rawIt => {
      const itA = getDynamicItem(rawIt, 'A');
      const itB = getDynamicItem(rawIt, 'B');

      const aR1 = answers.A?.[`it_${rawIt.id}_r1`];
      const aR2 = answers.A?.[`it_${rawIt.id}_r2`];
      const bR1 = answers.B?.[`it_${rawIt.id}_r1`];
      const bR2 = answers.B?.[`it_${rawIt.id}_r2`];

      // 1. Ausführungs-Tabus (Aktiv / Top - Note 1 bei r1)
      if (aR1 === 1 || bR1 === 1) {
        let parties = [];
        if (aR1 === 1) parties.push({ who: names.A || 'Partner 1', anat: anatomy.A === 'penis' ? '♂️' : '♀️', text: itA.r1 });
        if (bR1 === 1) parties.push({ who: names.B || 'Partner 2', anat: anatomy.B === 'penis' ? '♂️' : '♀️', text: itB.r1 });
        executeTabus.push({ it: rawIt, parties });
      }

      // 2. Schutz- & Empfangs-Tabus (Passiv / Bottom - Note 1 bei r2)
      if (aR2 === 1 || bR2 === 1) {
        let parties = [];
        if (aR2 === 1) parties.push({ who: names.A || 'Partner 1', anat: anatomy.A === 'penis' ? '♂️' : '♀️', text: itA.r2 });
        if (bR2 === 1) parties.push({ who: names.B || 'Partner 2', anat: anatomy.B === 'penis' ? '♂️' : '♀️', text: itB.r2 });
        receiveTabus.push({ it: rawIt, parties });
      }
    });
  });

  const totalTabus = executeTabus.length + receiveTabus.length;

  if (totalTabus === 0) {
    list.innerHTML = `
      <div class="text-center py-8 space-y-2">
        <span class="text-3xl">🛡️</span>
        <p class="text-slate-600 dark:text-slate-300 font-bold text-xs">Aktuell sind noch keine Tabus hinterlegt.</p>
        <p class="text-[11px] text-slate-400">Sobald du oder dein Partner eine Praktik mit Note 1 (⛔) bewertet, erscheint sie hier präzise getrennt nach Ausführungs- und Schutzgrenze.</p>
      </div>
    `;
  } else {
    list.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- SPALTE 1: AUSFÜHRUNGS-GRENZEN (AKTIV / TOP) -->
        <div class="space-y-2.5 bg-indigo-950/20 border border-indigo-900/50 p-3.5 rounded-2xl">
          <div class="flex items-center justify-between border-b border-indigo-900/60 pb-2">
            <div>
              <strong class="text-indigo-950 dark:text-indigo-200 font-black text-xs flex items-center gap-1.5">
                <span>✋</span> AUSFÜHRUNGS-GRENZEN (Aktiv / Top)
              </strong>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">„Das möchte ich dir nicht antun / nicht leiten“</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[9.5px] font-extrabold bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">
              ${executeTabus.length} Limits
            </span>
          </div>

          <div class="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            ${executeTabus.length > 0 ? executeTabus.map(t => `
              <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-indigo-200 dark:border-indigo-900/40 space-y-1">
                <strong class="text-slate-900 dark:text-slate-100 font-bold text-xs">${t.it.id}. ${escapeHtml(t.it.title)}</strong>
                <p class="text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug">${escapeHtml(t.it.desc)}</p>
                <div class="pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-0.5">
                  ${t.parties.map(p => `
                    <div class="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                      <span>⛔</span> <strong>${escapeHtml(p.who)} (${p.anat}) als Top:</strong> „${escapeHtml(p.text)}“
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('') : '<p class="text-slate-400 italic text-xs py-4 text-center">Keine Ausführungs-Limits hinterlegt.</p>'}
          </div>
        </div>

        <!-- SPALTE 2: SCHUTZ- & BELASTUNGS-GRENZEN (PASSIV / BOTTOM) -->
        <div class="space-y-2.5 bg-rose-950/20 border border-rose-900/50 p-3.5 rounded-2xl">
          <div class="flex items-center justify-between border-b border-rose-900/60 pb-2">
            <div>
              <strong class="text-rose-950 dark:text-rose-200 font-black text-xs flex items-center gap-1.5">
                <span>🛡️</span> SCHUTZ- & BELASTUNGSGRENZEN (Passiv)
              </strong>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">„Das erträgt mein Körper/Geist nicht“</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[9.5px] font-extrabold bg-rose-900/60 text-rose-300 border border-rose-700/60">
              ${receiveTabus.length} Limits
            </span>
          </div>

          <div class="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
            ${receiveTabus.length > 0 ? receiveTabus.map(t => `
              <div class="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/40 space-y-1">
                <strong class="text-slate-900 dark:text-slate-100 font-bold text-xs">${t.it.id}. ${escapeHtml(t.it.title)}</strong>
                <p class="text-[10.5px] text-slate-500 dark:text-slate-400 leading-snug">${escapeHtml(t.it.desc)}</p>
                <div class="pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-0.5">
                  ${t.parties.map(p => `
                    <div class="text-[10px] font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <span>⛔</span> <strong>${escapeHtml(p.who)} (${p.anat}) als Bottom:</strong> „${escapeHtml(p.text)}“
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('') : '<p class="text-slate-400 italic text-xs py-4 text-center">Keine Schutz-Limits hinterlegt.</p>'}
          </div>
        </div>

      </div>
    `;
  }

  const m = document.getElementById('modal-tabus');
  if (m) m.classList.remove('hidden');
}

function closeTabuModal() {
  const m = document.getElementById('modal-tabus');
  if (m) m.classList.add('hidden');
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
    answers: answers,
    notes: notes,
    shameFlags: shameFlags,
    names: names,
    anatomy: anatomy,
    privacy: privacy,
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
  showToast("Link in die Zwischenablage kopiert!");
}

// Lexikon-Steuerung
function openLexikonModal() {
  const input = document.getElementById('lexikon-search-input');
  if (input) input.value = '';
  filterLexikon('');
  const m = document.getElementById('modal-lexikon');
  if (m) m.classList.remove('hidden');
}

function closeLexikonModal() {
  const m = document.getElementById('modal-lexikon');
  if (m) m.classList.add('hidden');
}

function openLexikonForItem(itemId) {
  const chapters = window.surveyChapters || [];
  let foundItem = null;
  let foundChapter = null;

  for (const ch of chapters) {
    const it = (ch.items || []).find(i => i.id === itemId);
    if (it) {
      foundItem = it;
      foundChapter = ch;
      break;
    }
  }

  openLexikonModal();

  if (!foundItem) return;

  const titleText = (foundItem.title || '').toLowerCase();
  const descText = (foundItem.desc || '').toLowerCase();
  const chText = (foundChapter?.title || '').toLowerCase();
  const fullContext = `${titleText} ${descText} ${chText}`;

  const keywords = [
    { tag: "shibari", term: "Shibari / Kinbaku" },
    { tag: "fessel", term: "Shibari / Kinbaku" },
    { tag: "seil", term: "Shibari / Kinbaku" },
    { tag: "edging", term: "Tease & Denial / Edging" },
    { tag: "tease", term: "Tease & Denial / Edging" },
    { tag: "orgasmus", term: "Tease & Denial / Edging" },
    { tag: "keusch", term: "Keuschhaltung (Chastity)" },
    { tag: "käfig", term: "Keuschhaltung (Chastity)" },
    { tag: "praise", term: "Praise Play" },
    { tag: "lob", term: "Praise Play" },
    { tag: "spanking", term: "Impact Play & Spanking" },
    { tag: "paddle", term: "Impact Play & Spanking" },
    { tag: "schlag", term: "Impact Play & Spanking" },
    { tag: "primal", term: "Primal Play" },
    { tag: "ringen", term: "Primal Play" },
    { tag: "brat", term: "Bratting & Brat Taming" },
    { tag: "caregiver", term: "Caregiver / Little (DDLG / CGL)" },
    { tag: "little", term: "Caregiver / Little (DDLG / CGL)" },
    { tag: "ddlg", term: "Caregiver / Little (DDLG / CGL)" },
    { tag: "aftercare", term: "Aftercare (Nachsorge)" },
    { tag: "subdrop", term: "Subdrop / Topdrop" },
    { tag: "subspace", term: "Subspace" },
    { tag: "cbt", term: "CBT (Cock and Ball Torture)" },
    { tag: "hoden", term: "CBT (Cock and Ball Torture)" },
    { tag: "facesitting", term: "Queening / Facesitting" },
    { tag: "queening", term: "Queening / Facesitting" },
    { tag: "cfnm", term: "CFNM (Clothed Female, Naked Male)" },
    { tag: "nuru", term: "Nuru-Massage" },
    { tag: "pegging", term: "Pegging" },
    { tag: "cnc", term: "CNC (Consensual Non-Consent)" },
    { tag: "free-use", term: "Free-Use" },
    { tag: "augenbinde", term: "Sinnesentzug (Sensory Deprivation)" },
    { tag: "sinnesentzug", term: "Sinnesentzug (Sensory Deprivation)" },
    { tag: "safeword", term: "Safeword & Ampelsystem" },
    { tag: "ampel", term: "Safeword & Ampelsystem" }
  ];

  let matchedTerm = null;
  for (const kw of keywords) {
    if (fullContext.includes(kw.tag)) {
      matchedTerm = kw.term;
      break;
    }
  }

  const input = document.getElementById('lexikon-search-input');
  if (matchedTerm) {
    if (input) input.value = matchedTerm;
    filterLexikon(matchedTerm);
  } else {
    if (input) input.value = '';
    filterLexikon('');
  }
}

function filterLexikon(q) {
  const container = document.getElementById('lexikon-entries-container');
  if (!container) return;

  const allEntries = getLexikonList();
  const query = (q || '').trim().toLowerCase();

  const filtered = query.length === 0
    ? allEntries
    : allEntries.filter(l => l.term.toLowerCase().includes(query) || l.def.toLowerCase().includes(query));

  container.innerHTML = filtered.length > 0
    ? filtered.map(l => `
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1">
          <div class="flex justify-between items-center gap-2">
            <strong class="text-slate-900 dark:text-white font-bold text-xs">${escapeHtml(l.term)}</strong>
            <a href="${l.link}" target="_blank" rel="noopener noreferrer" class="text-[10.5px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Wikipedia ↗</a>
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">${escapeHtml(l.def)}</p>
        </div>
      `).join('')
    : `
        <div class="text-center py-6 space-y-2">
          <p class="text-slate-400 italic text-xs">Kein direkter Treffer für „${escapeHtml(q)}“.</p>
          <button type="button" onclick="openLexikonModal()" class="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-300">
            Alle A–Z Begriffe anzeigen
          </button>
        </div>
      `;
}

function sendBackupEmail() {
  const url = getLiveShareUrl();
  const email = accounts[currentUser]?.email || '';
  const subject = encodeURIComponent("Sicherung: Dein persönlicher Kink-Kompass Zugangs-Link");
  const body = encodeURIComponent(`Hallo ${names[currentUser]},\n\nhier ist dein aktueller, verschlüsselter Zugangs-Link zu deinen Bewertungen:\n\n${url}\n\nBewahre diese E-Mail auf, um deinen Stand jederzeit wieder abrufen zu können.`);
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

function showToast(msg) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const el = document.createElement('div');
  el.className = "bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 transition-all pointer-events-auto transform translate-y-2 opacity-0";
  el.innerText = msg;
  c.appendChild(el);

  setTimeout(() => {
    el.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

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
