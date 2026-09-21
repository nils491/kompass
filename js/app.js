let currentUser = 'A';
let currentChapterIndex = 0;
let singleRadarInstance = null;
let pairRadarInstance = null;
let onboardingStep = 1;

let names = { A: 'Partner 1', B: 'Partner 2' };
let answers = { A: {}, B: {} };
let notes = { A: {}, B: {} };
let privacy = {
  A: { mode: 'blind', shareNotes: true, chapters: {} },
  B: { mode: 'blind', shareNotes: true, chapters: {} }
};
let accounts = {
  A: { email: '', partnerEmail: '', setupDone: false },
  B: { email: '', partnerEmail: '', setupDone: false }
};

function initApp() {
  loadFromLocalStorage();
  checkUrlHashData();
  applySavedTheme();

  const lock = document.getElementById('site-lockscreen');
  if (lock) {
    if (sessionStorage.getItem('kompass_unlocked') === 'true') {
      lock.classList.add('hidden');
      checkOnboardingStatus();
    }
  } else {
    checkOnboardingStatus();
  }

  updateCurrentUserUI();
  renderCurrentChapter();
  renderQuickGrid();
  updateProgressBar();
  updateTabuBadge();
  checkChapterQuickGridVisibility();
}

/* THEME MANAGEMENT (Global Dark/Light Sync) */
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

  // Radar-Charts bei Bedarf neu zeichnen
  if (singleRadarInstance) renderSingleRadar();
  if (pairRadarInstance) renderPairRadar();
}

function updateThemeUI(theme) {
  const icon = document.getElementById('theme-toggle-icon');
  const label = document.getElementById('theme-toggle-label');
  if (icon) icon.innerText = (theme === 'dark') ? '🌙' : '☀️';
  if (label) label.innerText = (theme === 'dark') ? 'Nacht' : 'Tag';

  const sessionIcon = document.getElementById('session-theme-icon');
  const sessionText = document.getElementById('session-theme-text');
  if (sessionIcon) sessionIcon.innerText = (theme === 'dark') ? '🌙' : '☀️';
  if (sessionText) sessionText.innerText = (theme === 'dark') ? 'Nacht' : 'Tag';
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
  updateOnboardingStepUI();
  const m = document.getElementById('modal-onboarding');
  if (m) m.classList.remove('hidden');
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
      updateCurrentUserUI();
    }
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
    showToast(`Willkommen, ${names[u]}! Viel Freude beim Ausfüllen.`);
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('kompass_answers', JSON.stringify(answers));
    localStorage.setItem('kompass_notes', JSON.stringify(notes));
    localStorage.setItem('kompass_names', JSON.stringify(names));
    localStorage.setItem('kompass_privacy', JSON.stringify(privacy));
    localStorage.setItem('kompass_accounts', JSON.stringify(accounts));
  } catch (e) {
    console.error("Fehler beim Speichern:", e);
  }
}

function loadFromLocalStorage() {
  try {
    const a = localStorage.getItem('kompass_answers');
    const n = localStorage.getItem('kompass_notes');
    const nm = localStorage.getItem('kompass_names');
    const p = localStorage.getItem('kompass_privacy');
    const ac = localStorage.getItem('kompass_accounts');

    if (a) answers = JSON.parse(a);
    if (n) notes = JSON.parse(n);
    if (nm) names = JSON.parse(nm);
    if (p) privacy = JSON.parse(p);
    if (ac) accounts = JSON.parse(ac);
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
      if (payload.notes) notes = payload.notes;
      if (payload.privacy) privacy = payload.privacy;
      saveToLocalStorage();

      currentUser = (payload.sender === 'A') ? 'B' : 'A';
      showToast(`Daten von ${names[payload.sender || 'A']} erfolgreich geladen!`);
    }
  } catch (e) {
    console.error("Fehler beim Dekodieren des Links:", e);
  }
}

function switchMainView(viewId) {
  document.getElementById('view-survey').classList.add('hidden');
  document.getElementById('view-single').classList.add('hidden');
  document.getElementById('view-pair').classList.add('hidden');

  const btnS = document.getElementById('nav-btn-survey');
  const btnSi = document.getElementById('nav-btn-single');
  const btnP = document.getElementById('nav-btn-pair');

  [btnS, btnSi, btnP].forEach(b => {
    b.className = "px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition flex items-center gap-1";
  });

  if (viewId === 'survey') {
    document.getElementById('view-survey').classList.remove('hidden');
    btnS.className = "px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-xs transition";
    renderCurrentChapter();
  } else if (viewId === 'single') {
    document.getElementById('view-single').classList.remove('hidden');
    btnSi.className = "px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-xs transition";
    renderSingleAnalysis();
  } else if (viewId === 'pair') {
    document.getElementById('view-pair').classList.remove('hidden');
    btnP.className = "px-3 py-1.5 rounded-lg bg-white text-slate-900 shadow-xs transition flex items-center gap-1";
    renderPairAnalysis();
  }
}

function setCurrentUser(user) {
  currentUser = user;
  updateCurrentUserUI();
  renderCurrentChapter();
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

  if (dispA) dispA.innerText = names.A;
  if (dispB) dispB.innerText = names.B;

  if (u === 'A') {
    btnA.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-white text-indigo-700 shadow-xs";
    btnB.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 text-slate-600 hover:text-slate-900";
  } else {
    btnB.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 bg-white text-purple-700 shadow-xs";
    btnA.className = "px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 text-slate-600 hover:text-slate-900";
  }

  const emptyName = document.getElementById('empty-state-username');
  if (emptyName) emptyName.innerText = names[u];
  const singleName = document.getElementById('single-profile-name');
  if (singleName) singleName.innerText = names[u];
}

function renderCurrentChapter() {
  const chapters = window.surveyChapters || [];
  if (chapters.length === 0) return;
  const ch = chapters[currentChapterIndex];
  if (!ch) return;

  document.getElementById('chapter-badge').innerText = `Kapitel ${currentChapterIndex + 1} / ${chapters.length}`;
  document.getElementById('chapter-title').innerText = ch.title;
  document.getElementById('chapter-desc').innerText = ch.desc;
  document.getElementById('chapter-items-count').innerText = `${ch.items.length} Punkte`;

  const prevBtn = document.getElementById('btn-prev-chapter');
  if (prevBtn) prevBtn.disabled = (currentChapterIndex === 0);

  const nextBtn = document.getElementById('btn-next-chapter');
  if (nextBtn) {
    nextBtn.innerText = (currentChapterIndex === chapters.length - 1) ? "Zur Analyse →" : "Weiter →";
  }

  const container = document.getElementById('survey-items-container');
  let html = '';

  ch.items.forEach(it => {
    const keyR1 = `it_${it.id}_r1`;
    const keyR2 = `it_${it.id}_r2`;
    const keyChoice = `it_${it.id}_choice`;

    const valR1 = answers[currentUser][keyR1];
    const valR2 = answers[currentUser][keyR2];
    const valChoice = answers[currentUser][keyChoice];
    const noteVal = notes[currentUser][it.id] || '';

    if (it.type === 'choice') {
      html += `
        <div class="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div>
            <div class="flex items-center justify-between gap-2">
              <span class="font-extrabold text-xs text-slate-900">${it.id}. ${escapeHtml(it.title)}</span>
              <button onclick="searchInLexikon('${escapeHtml(it.title)}')" class="text-[10px] text-slate-400 hover:text-slate-600">📖 Lexikon</button>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${escapeHtml(it.desc)}</p>
            <span class="block text-xs font-bold text-slate-800 mt-2">${escapeHtml(it.question || 'Deine Haltung:')}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${it.options.map(opt => {
              const isChecked = (valChoice === opt.val);
              return `
                <button onclick="recordChoiceAnswer(${it.id}, '${opt.val}')" 
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
              <button onclick="searchInLexikon('${escapeHtml(it.title)}')" class="text-[10px] text-slate-400 hover:text-slate-600">📖 Lexikon</button>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">${escapeHtml(it.desc)}</p>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-800">${escapeHtml(it.r1)}:</span>
              <span class="text-[10.5px] font-semibold text-slate-500">${getPillLabel(valR1)}</span>
            </div>
            <div class="grid grid-cols-6 gap-1">
              ${[0, 1, 2, 3, 4, 5].map(sc => `
                <button onclick="recordScaleAnswer('${keyR1}',${sc})" class="py-1.5 rounded-lg border text-center text-xs font-bold transition touch-pill ${valR1 === sc ? getScoreActiveStyle(sc) : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}">
                  ${sc === 1 ? '⛔ 1' : (sc === 5 ? '⭐ 5' : sc)}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-800">${escapeHtml(it.r2)}:</span>
              <span class="text-[10.5px] font-semibold text-slate-500">${getPillLabel(valR2)}</span>
            </div>
            <div class="grid grid-cols-6 gap-1">
              ${[0, 1, 2, 3, 4, 5].map(sc => `
                <button onclick="recordScaleAnswer('${keyR2}',${sc})" class="py-1.5 rounded-lg border text-center text-xs font-bold transition touch-pill ${valR2 === sc ? getScoreActiveStyle(sc) : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}">
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

function recordScaleAnswer(key, score) {
  answers[currentUser][key] = score;
  saveToLocalStorage();
  renderCurrentChapter();
  updateProgressBar();
  updateTabuBadge();
  checkChapterQuickGridVisibility();
}

function recordChoiceAnswer(id, val) {
  answers[currentUser][`it_${id}_choice`] = val;
  saveToLocalStorage();
  renderCurrentChapter();
  updateProgressBar();
  checkChapterQuickGridVisibility();
}

function recordNote(id, text) {
  notes[currentUser][id] = text.trim();
  saveToLocalStorage();
}

function prevChapter() {
  if (currentChapterIndex > 0) {
    currentChapterIndex--;
    renderCurrentChapter();
  }
}

function nextChapter() {
  const chapters = window.surveyChapters || [];
  if (currentChapterIndex < chapters.length - 1) {
    currentChapterIndex++;
    renderCurrentChapter();
  } else {
    switchMainView('single');
  }
}

function jumpToChapter(idx) {
  currentChapterIndex = idx;
  switchMainView('survey');
}

function renderQuickGrid() {
  const grid = document.getElementById('quick-grid-buttons');
  const chapters = window.surveyChapters || [];
  if (!grid || chapters.length === 0) return;
  grid.innerHTML = chapters.map((ch, idx) => `
    <button onclick="jumpToChapter(${idx})" class="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-slate-700 truncate">
      ${idx + 1}. ${escapeHtml(ch.title)}
    </button>
  `).join('');
}

function checkChapterQuickGridVisibility() {
  const qg = document.getElementById('chapter-quick-grid');
  if (!qg) return;
  const count = Object.keys(answers[currentUser]).length;
  if (count >= 15) {
    qg.classList.remove('hidden');
  } else {
    qg.classList.add('hidden');
  }
}

function updateProgressBar() {
  const chapters = window.surveyChapters || [];
  if (chapters.length === 0) return;
  let totalQuestions = 0;
  chapters.forEach(c => {
    c.items.forEach(it => {
      if (it.type === 'choice') totalQuestions += 1;
      else totalQuestions += 2;
    });
  });

  const answered = Object.keys(answers[currentUser]).length;
  const pct = totalQuestions > 0 ? Math.min(100, Math.round((answered / totalQuestions) * 100)) : 0;

  const fill = document.getElementById('progress-bar-fill');
  const txt = document.getElementById('progress-text');
  if (fill) fill.style.width = `${pct}%`;
  if (txt) txt.innerText = `Fortschritt: ${pct} % (${answered}/${totalQuestions})`;
}

function updateTabuBadge() {
  let count = 0;
  const uAnswers = answers[currentUser];
  Object.keys(uAnswers).forEach(k => {
    if (uAnswers[k] === 1) count++;
  });
  const badge = document.getElementById('header-tabu-count');
  if (badge) badge.innerText = count;
}

function renderSingleAnalysis() {
  const uAnswers = answers[currentUser];
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
  let totalPoints = 0;

  Object.keys(uAnswers).forEach(k => {
    const v = uAnswers[k];
    if (typeof v === 'number' && v > 0) {
      totalPoints += v;
      if (k.includes('115') || k.includes('117') || k.includes('198')) pPower += v;
      else if (k.includes('217') || k.includes('262') || k.includes('264')) pSensation += v;
      else if (k.includes('320') || k.includes('322') || k.includes('526')) pNurturing += v;
      else if (k.includes('303') || k.includes('304') || k.includes('581')) pThrill += v;
      else pVisual += v;
    }
  });

  const maxP = Math.max(1, totalPoints);
  setBar('power', Math.min(100, Math.round((pPower / maxP) * 220)));
  setBar('sensation', Math.min(100, Math.round((pSensation / maxP) * 220)));
  setBar('nurturing', Math.min(100, Math.round((pNurturing / maxP) * 220)));
  setBar('thrill', Math.min(100, Math.round((pThrill / maxP) * 220)));
  setBar('visual', Math.min(100, Math.round((pVisual / maxP) * 220)));

  let high5 = [];
  let tabus = [];

  const chapters = window.surveyChapters || [];
  chapters.forEach(ch => {
    ch.items.forEach(it => {
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

  singleRadarInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: ['Körperzonen', 'Romantik', 'Keuschheit', 'Shibari', 'Sinnesentzug', 'Impact', 'Primal', 'Caregiver', 'Aftercare'],
      datasets: [{
        label: names[currentUser],
        data: [80, 85, 90, 75, 85, 60, 70, 95, 90],
        backgroundColor: 'rgba(225, 29, 72, 0.2)',
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

function renderPairAnalysis() {
  const hasBoth = (Object.keys(answers.A).length > 0) && (Object.keys(answers.B).length > 0);
  const lockedBanner = document.getElementById('pair-locked-banner');
  const unlockedContent = document.getElementById('pair-unlocked-content');
  const lockIcon = document.getElementById('nav-pair-lock');

  if (!hasBoth) {
    if (lockedBanner) lockedBanner.classList.remove('hidden');
    if (unlockedContent) unlockedContent.classList.add('hidden');
    if (lockIcon) lockIcon.innerText = '🔒';
    return;
  }

  if (lockedBanner) lockedBanner.classList.add('hidden');
  if (unlockedContent) unlockedContent.classList.remove('hidden');
  if (lockIcon) lockIcon.innerText = '🔓';

  document.getElementById('pair-name-1').innerText = names.A;
  document.getElementById('pair-name-2').innerText = names.B;

  let matchesCount = 0;
  let positiveMatches = 0;
  let doppel5 = [];
  let bridges = [];
  let tabus = [];
  let compromises = [];
  let visibleDetailItems = [];

  const modeA = privacy.A?.mode || 'blind';
  const modeB = privacy.B?.mode || 'blind';
  const shareNotesA = privacy.A?.shareNotes !== false;
  const shareNotesB = privacy.B?.shareNotes !== false;

  const chapters = window.surveyChapters || [];
  chapters.forEach(ch => {
    ch.items.forEach(it => {
      const aR1 = answers.A[`it_${it.id}_r1`];
      const aR2 = answers.A[`it_${it.id}_r2`];
      const bR1 = answers.B[`it_${it.id}_r1`];
      const bR2 = answers.B[`it_${it.id}_r2`];
      const noteA = shareNotesA ? (notes.A[it.id] || '') : '';
      const noteB = shareNotesB ? (notes.B[it.id] || '') : '';

      const isTabu = (aR1 === 1 || aR2 === 1 || bR1 === 1 || bR2 === 1);
      if (isTabu) {
        tabus.push({ item: it, aR1, aR2, bR1, bR2 });
      } else {
        if (aR1 === 5 && bR2 === 5) doppel5.push({ item: it, text: `${names.A} will führen (5) & ${names.B} will empfangen (5)` });
        if (bR1 === 5 && aR2 === 5) doppel5.push({ item: it, text: `${names.B} will führen (5) & ${names.A} will empfangen (5)` });

        if (aR1 >= 4 && (bR2 === 2 || bR2 === 3)) bridges.push({ item: it, text: `${names.A} Wunsch (${aR1}) trifft ${names.B} Bereitschaft (${bR2})` });
        if (bR1 >= 4 && (aR2 === 2 || aR2 === 3)) bridges.push({ item: it, text: `${names.B} Wunsch (${bR1}) trifft ${names.A} Bereitschaft (${aR2})` });

        if (bR2 === 2 && aR1 >= 3) compromises.push({ from: names.B, to: names.A, role: it.r2, item: it, wishScore: aR1 });
        if (aR2 === 2 && bR1 >= 3) compromises.push({ from: names.A, to: names.B, role: it.r2, item: it, wishScore: bR1 });

        if (aR1 !== undefined && bR2 !== undefined) {
          matchesCount++;
          if (aR1 >= 3 && bR2 >= 3) positiveMatches++;
        }
      }

      const isMatch = (aR1 >= 3 && bR2 >= 3) || (bR1 >= 3 && aR2 >= 3);
      const isOpenMode = (modeA === 'open' && modeB === 'open');
      
      if (isTabu || isMatch || isOpenMode || (aR1 >= 3) || (bR1 >= 3)) {
        visibleDetailItems.push({
          item: it,
          isTabu,
          isMatch,
          aR1, aR2, bR1, bR2,
          noteA, noteB
        });
      }
    });
  });

  const harmonyPct = matchesCount > 0 ? Math.round((positiveMatches / matchesCount) * 100) : 0;
  document.getElementById('kpi-harmony').innerText = `${harmonyPct} %`;
  document.getElementById('kpi-doppel5').innerText = doppel5.length;
  document.getElementById('kpi-bridges').innerText = bridges.length;
  document.getElementById('kpi-tabus').innerText = tabus.length;

  const compEl = document.getElementById('pair-compromises-list');
  if (compEl) {
    compEl.innerHTML = compromises.slice(0, 10).map(c => `
      <div class="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-start justify-between gap-2">
        <div>
          <strong class="text-indigo-950 block">${escapeHtml(c.item.title)}</strong>
          <span class="text-[11px] text-indigo-900">${c.from} würde ${c.to} zuliebe: <em>"${escapeHtml(c.role)}"</em> (Wunsch von ${c.to}: Note ${c.wishScore})</span>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-indigo-700 border border-indigo-200">Note 2</span>
      </div>
    `).join('') || '<p class="text-slate-400 italic">Keine offenen 2er-Kompromisse erfasst.</p>';
  }

  const d5El = document.getElementById('pair-doppel5-list');
  if (d5El) {
    d5El.innerHTML = doppel5.slice(0, 8).map(d => `
      <div class="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
        <strong class="text-emerald-950 block">${escapeHtml(d.item.title)}</strong>
        <span class="text-[10.5px] text-emerald-800">${escapeHtml(d.text)}</span>
      </div>
    `).join('') || '<p class="text-slate-400 italic">Noch keine beidseitigen 5er-Matches.</p>';
  }

  const brEl = document.getElementById('pair-bridges-list');
  if (brEl) {
    brEl.innerHTML = bridges.slice(0, 8).map(b => `
      <div class="p-2 rounded-lg bg-amber-50 border border-amber-200">
        <strong class="text-amber-950 block">${escapeHtml(b.item.title)}</strong>
        <span class="text-[10.5px] text-amber-800">${escapeHtml(b.text)}</span>
      </div>
    `).join('') || '<p class="text-slate-400 italic">Keine offenen Brückenpunkte.</p>';
  }

  const badgeEl = document.getElementById('pair-transparency-badge');
  const hintEl = document.getElementById('pair-transparency-hint');
  const detailEl = document.getElementById('pair-detailed-breakdown');

  if (badgeEl && hintEl && detailEl) {
    if (modeA === 'open' && modeB === 'open') {
      badgeEl.innerHTML = `<span class="px-2 py-0.5 rounded font-bold bg-indigo-100 text-indigo-800">100 % Offene Einsicht</span>`;
      hintEl.innerText = "Beide Partner haben die vollständige Einsicht aktiviert: Alle vergebenen Noten und freigegebenen Notizen sind für euch beide sichtbar.";
    } else {
      badgeEl.innerHTML = `<span class="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">Selektiver Abgleich aktiv</span>`;
      hintEl.innerText = "Selektiver Blind-Match: Sichtbar sind gemeinsame Schnittmengen (Noten 3–5) sowie alle Tabus (Note 1). Einseitig niedrige Bewertungen bleiben verborgen.";
    }

    detailEl.innerHTML = visibleDetailItems.map(d => {
      let tag = '';
      if (d.isTabu) {
        tag = `<span class="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-rose-100 text-rose-800">⛔ Tabu</span>`;
      } else if (d.isMatch) {
        tag = `<span class="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-800">✓ Schnittmenge</span>`;
      } else {
        tag = `<span class="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-700">Offene Bewertung</span>`;
      }

      const valTextA = (d.aR1 !== undefined || d.aR2 !== undefined) 
        ? `${names.A}: Aktiv ${d.aR1 ?? '-'} | Passiv ${d.aR2 ?? '-'}` 
        : `${names.A}: Noch nicht bewertet`;

      const valTextB = (d.bR1 !== undefined || d.bR2 !== undefined) 
        ? `${names.B}: Aktiv ${d.bR1 ?? '-'} | Passiv ${d.bR2 ?? '-'}` 
        : `${names.B}: Noch nicht bewertet`;

      const notesHtml = (d.noteA || d.noteB) 
        ? `<div class="pt-1 text-[10.5px] text-slate-500 space-y-0.5">
            ${d.noteA ? `<p><strong>Notiz ${names.A}:</strong> ${escapeHtml(d.noteA)}</p>` : ''}
            ${d.noteB ? `<p><strong>Notiz ${names.B}:</strong> ${escapeHtml(d.noteB)}</p>` : ''}
           </div>`
        : '';

      return `
        <div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
          <div class="flex items-center justify-between gap-2">
            <strong class="text-slate-900 text-xs">${d.item.id}. ${escapeHtml(d.item.title)}</strong>
            ${tag}
          </div>
          <div class="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-0.5 gap-2">
            <span class="bg-white px-2 py-0.5 rounded border border-slate-200">${valTextA}</span>
            <span class="bg-white px-2 py-0.5 rounded border border-slate-200">${valTextB}</span>
          </div>
          ${notesHtml}
        </div>
      `;
    }).join('') || '<p class="text-slate-400 italic p-2 text-center">Keine passenden Übereinstimmungen gefunden.</p>';
  }

  renderPairRadar();
  rollDailyKinkDice();
}

function renderPairRadar() {
  const canvas = document.getElementById('pairRadarChart');
  if (!canvas) return;

  if (pairRadarInstance) pairRadarInstance.destroy();
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(203, 213, 225, 0.6)';
  const labelColor = isDark ? '#cbd5e1' : '#334155';

  pairRadarInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: ['Körperzonen', 'Romantik', 'Keuschheit', 'Shibari', 'Sinnesentzug', 'Impact', 'Primal', 'Caregiver', 'Aftercare'],
      datasets: [
        {
          label: names.A,
          data: [85, 90, 95, 80, 85, 65, 75, 90, 95],
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2
        },
        {
          label: names.B,
          data: [90, 95, 85, 85, 90, 55, 80, 100, 100],
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2
        }
      ]
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

function rollDailyKinkDice() {
  const positiveItems = [];
  const chapters = window.surveyChapters || [];
  chapters.forEach(c => {
    c.items.forEach(it => {
      const a = answers.A[`it_${it.id}_r1`];
      const b = answers.B[`it_${it.id}_r2`];
      if (a >= 3 && b >= 3) positiveItems.push(it);
    });
  });

  const cardTitle = document.getElementById('dice-title');
  const cardDesc = document.getElementById('dice-desc');
  if (!cardTitle || !cardDesc) return;

  if (positiveItems.length === 0) {
    cardTitle.innerText = "Sinnlicher Lippentanz & 5-Sekunden Blickkontakt";
    cardDesc.innerText = "Nehmt euch heute 5 Minuten Zeit, euch schweigend in die Augen zu schauen und zärtlich zu küssen.";
    return;
  }

  const randomIt = positiveItems[Math.floor(Math.random() * positiveItems.length)];
  cardTitle.innerText = `🎲 Heute: ${randomIt.title}`;
  cardDesc.innerText = randomIt.desc;
}

function openAccountModal() {
  const user = currentUser;
  const nameEl = document.getElementById('account-active-username');
  if (nameEl) nameEl.innerText = names[user];

  const nameInput = document.getElementById('account-name-input');
  if (nameInput) nameInput.value = names[user] || '';

  const emailInput = document.getElementById('account-email-input');
  if (emailInput) emailInput.value = accounts[user]?.email || '';

  const partnerEmailInput = document.getElementById('account-partner-email-input');
  if (partnerEmailInput) partnerEmailInput.value = accounts[user]?.partnerEmail || '';

  const resetUserSpan = document.getElementById('reset-current-username');
  if (resetUserSpan) resetUserSpan.innerText = names[user];
  cancelResetConfirmation();

  const modal = document.getElementById('modal-account');
  if (modal) modal.classList.remove('hidden');
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

function updatePartnerAccountEmail(val) {
  if (!accounts[currentUser]) accounts[currentUser] = { email: '', partnerEmail: '', setupDone: true };
  accounts[currentUser].partnerEmail = val.trim();
  saveToLocalStorage();
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
  names[u] = (u === 'A') ? 'Partner 1' : 'Partner 2';
  if (accounts[u]) accounts[u].setupDone = false;
  
  saveToLocalStorage();
  cancelResetConfirmation();
  closeAccountModal();
  
  updateCurrentUserUI();
  renderCurrentChapter();
  updateProgressBar();
  updateTabuBadge();
  checkChapterQuickGridVisibility();
  
  showToast(`Profil ${names[u]} erfolgreich zurückgesetzt.`);
}

function resetAllAppData() {
  try {
    localStorage.removeItem('kompass_answers');
    localStorage.removeItem('kompass_notes');
    localStorage.removeItem('kompass_names');
    localStorage.removeItem('kompass_privacy');
    localStorage.removeItem('kompass_accounts');
    sessionStorage.removeItem('session_snapshot');
  } catch (e) {
    console.error(e);
  }
  
  answers = { A: {}, B: {} };
  notes = { A: {}, B: {} };
  names = { A: 'Partner 1', B: 'Partner 2' };
  privacy = {
    A: { mode: 'blind', shareNotes: true, chapters: {} },
    B: { mode: 'blind', shareNotes: true, chapters: {} }
  };
  accounts = {
    A: { email: '', partnerEmail: '', setupDone: false },
    B: { email: '', partnerEmail: '', setupDone: false }
  };

  cancelResetConfirmation();
  closeAccountModal();
  
  currentUser = 'A';
  updateCurrentUserUI();
  renderCurrentChapter();
  updateProgressBar();
  updateTabuBadge();
  checkChapterQuickGridVisibility();
  
  showToast("Alle Daten & Profile wurden vollständig gelöscht.");
  setTimeout(() => { window.location.reload(); }, 600);
}

/* ZUFALLS-TESTDATEN ZUM DEBUGGEN GENERIEREN */
function generateRandomTestData() {
  const chapters = window.surveyChapters || [];
  if (chapters.length === 0) {
    showToast("Fragenkatalog noch nicht geladen.");
    return;
  }

  answers = { A: {}, B: {} };
  notes = { A: {}, B: {} };

  chapters.forEach(ch => {
    ch.items.forEach(it => {
      if (it.type === 'choice') {
        const opts = it.options || [];
        if (opts.length > 0) {
          answers.A[`it_${it.id}_choice`] = opts[Math.floor(Math.random() * opts.length)].val;
          answers.B[`it_${it.id}_choice`] = opts[Math.floor(Math.random() * opts.length)].val;
        }
      } else {
        // Realistische Verteilung: Überwiegend 3, 4, 5, gelegentlich 1 (Tabu) oder 2 (Duldung)
        const weightedScores = [0, 1, 2, 3, 3, 4, 4, 4, 5, 5];
        answers.A[`it_${it.id}_r1`] = weightedScores[Math.floor(Math.random() * weightedScores.length)];
        answers.A[`it_${it.id}_r2`] = weightedScores[Math.floor(Math.random() * weightedScores.length)];
        answers.B[`it_${it.id}_r1`] = weightedScores[Math.floor(Math.random() * weightedScores.length)];
        answers.B[`it_${it.id}_r2`] = weightedScores[Math.floor(Math.random() * weightedScores.length)];
      }
    });
  });

  saveToLocalStorage();
  updateProgressBar();
  updateTabuBadge();
  renderCurrentChapter();
  closeAccountModal();
  showToast("🎲 Zufällige Testdaten für beide Partner erfolgreich generiert!");
  setTimeout(() => { window.location.reload(); }, 500);
}

function openTabuModal() {
  const list = document.getElementById('tabu-modal-list');
  if (!list) return;

  let tabuItems = [];
  const chapters = window.surveyChapters || [];
  chapters.forEach(ch => {
    ch.items.forEach(it => {
      const aR1 = answers.A[`it_${it.id}_r1`];
      const aR2 = answers.A[`it_${it.id}_r2`];
      const bR1 = answers.B[`it_${it.id}_r1`];
      const bR2 = answers.B[`it_${it.id}_r2`];

      if (aR1 === 1 || aR2 === 1 || bR1 === 1 || bR2 === 1) {
        let who = [];
        if (aR1 === 1 || aR2 === 1) who.push(names.A);
        if (bR1 === 1 || bR2 === 1) who.push(names.B);
        tabuItems.push({ it, who: who.join(' & ') });
      }
    });
  });

  list.innerHTML = tabuItems.map(t => `
    <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
      <div class="flex justify-between items-start">
        <strong class="text-rose-950 font-bold">${t.it.id}. ${escapeHtml(t.it.title)}</strong>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">Limit von ${t.who}</span>
      </div>
      <p class="text-[11px] text-rose-800 mt-0.5">${escapeHtml(t.it.desc)}</p>
    </div>
  `).join('') || '<p class="text-slate-400 italic p-3 text-center">Aktuell sind keine Tabus (Note 1) hinterlegt.</p>';

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
    names: names,
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

function openLexikonModal() {
  filterLexikon('');
  const m = document.getElementById('modal-lexikon');
  if (m) m.classList.remove('hidden');
}

function closeLexikonModal() {
  const m = document.getElementById('modal-lexikon');
  if (m) m.classList.add('hidden');
}

function filterLexikon(q) {
  const container = document.getElementById('lexikon-entries-container');
  if (!container || !window.lexikonData) return;
  const query = (q || '').toLowerCase();
  const filtered = lexikonData.filter(l => l.term.toLowerCase().includes(query) || l.def.toLowerCase().includes(query));

  container.innerHTML = filtered.map(l => `
    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
      <div class="flex justify-between items-center">
        <strong class="text-slate-900 font-bold text-xs">${escapeHtml(l.term)}</strong>
        <a href="${l.link}" target="_blank" class="text-[10px] text-indigo-600 hover:underline">Wikipedia ↗</a>
      </div>
      <p class="text-[11px] text-slate-600 leading-relaxed">${escapeHtml(l.def)}</p>
    </div>
  `).join('') || '<p class="text-slate-400 italic text-center p-2">Kein Begriff gefunden.</p>';
}

function searchInLexikon(term) {
  openLexikonModal();
  const input = document.getElementById('lexikon-search-input');
  if (input) {
    input.value = term;
    filterLexikon(term);
  }
}

function sendBackupEmail() {
  const url = getLiveShareUrl();
  const email = accounts[currentUser]?.email || '';
  const subject = encodeURIComponent("Sicherung: Dein persönlicher Kink-Kompass Zugangs-Link");
  const body = encodeURIComponent(`Hallo ${names[currentUser]},\n\nhier ist dein aktueller, verschlüsselter Zugangs-Link zu deinen Bewertungen:\n\n${url}\n\nBewahre diese E-Mail auf, um deinen Stand jederzeit wieder abrufen zu können.`);
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

function sendPartnerEmailNotification() {
  const url = getLiveShareUrl();
  const email = accounts[currentUser]?.partnerEmail || '';
  const subject = encodeURIComponent(`${names[currentUser]} hat den Kink-Kompass ausgefüllt`);
  const body = encodeURIComponent(`Hallo,\n\n${names[currentUser]} hat den Beziehungs- und Kink-Kompass ausgefüllt und lädt dich zum unbeeinflussten Blind-Abgleich ein.\n\nHier geht es direkt zu deinem Fragebogen:\n${url}\n\nViel Spaß beim Entdecken eurer gemeinsamen Fantasien!`);
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
