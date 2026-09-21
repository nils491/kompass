// js/app.js - Zentrale Anwendungslogik & Datenverwaltung des Kink- & Beziehungs-Kompasses

let currentUser = 'A';
let currentChapterIndex = 0;
let singleRadarInstance = null;
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
    } else {
      lock.classList.remove('hidden');
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
    console.error("Fehler beim Speichern in LocalStorage:", e);
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
      if (payload.notes) notes = payload.notes;
      if (payload.privacy) privacy = payload.privacy;
      saveToLocalStorage();

      currentUser = (payload.sender === 'A') ? 'B' : 'A';
      showToast(`Daten von ${names[payload.sender || 'A']} erfolgreich geladen!`);
    }
  } catch (e) {
    console.error("Fehler beim Dekodieren des Einladungslinks:", e);
  }
}

function switchMainView(viewId) {
  const vSurvey = document.getElementById('view-survey');
  const vSingle = document.getElementById('view-single');
  const vPair = document.getElementById('view-pair');

  if (vSurvey) vSurvey.classList.add('hidden');
  if (vSingle) vSingle.classList.add('hidden');
  if (vPair) vPair.classList.add('hidden');

  const btnS = document.getElementById('nav-btn-survey');
  const btnSi = document.getElementById('nav-btn-single');
  const btnP = document.getElementById('nav-btn-pair');

  [btnS, btnSi, btnP].filter(Boolean).forEach(b => {
    b.className = "px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1";
  });

  if (viewId === 'survey') {
    if (vSurvey) vSurvey.classList.remove('hidden');
    if (btnS) btnS.className = "px-3 py-1.5 rounded-lg bg-brand-700 text-white shadow-sm transition";
    renderCurrentChapter();
  } else if (viewId === 'single') {
    if (vSingle) vSingle.classList.remove('hidden');
    if (btnSi) btnSi.className = "px-3 py-1.5 rounded-lg bg-brand-700 text-white shadow-sm transition";
    renderSingleAnalysis();
  } else if (viewId === 'pair') {
    if (vPair) {
      vPair.classList.remove('hidden');
      if (btnP) btnP.className = "px-3 py-1.5 rounded-lg bg-brand-700 text-white shadow-sm transition flex items-center gap-1";
    } else {
      window.location.href = 'analyse.html';
    }
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

  if (dispA) dispA.innerText = names.A || 'Partner 1';
  if (dispB) dispB.innerText = names.B || 'Partner 2';

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
  if (singleName) singleName.innerText = names[u] || 'Partner 1';
}

function renderCurrentChapter() {
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
  if (countEl) countEl.innerText = `${ch.items ? ch.items.length : 0} Punkte`;

  const prevBtn = document.getElementById('btn-prev-chapter');
  if (prevBtn) prevBtn.disabled = (currentChapterIndex === 0);

  const nextBtn = document.getElementById('btn-next-chapter');
  if (nextBtn) {
    nextBtn.innerText = (currentChapterIndex === chapters.length - 1) ? "Zur Analyse →" : "Weiter →";
  }

  const container = document.getElementById('survey-items-container');
  if (!container) return;

  let html = '';
  if (ch.items) {
    ch.items.forEach(it => {
      const keyR1 = `it_${it.id}_r1`;
      const keyR2 = `it_${it.id}_r2`;
      const keyChoice = `it_${it.id}_choice`;

      const valR1 = answers[currentUser]?.[keyR1];
      const valR2 = answers[currentUser]?.[keyR2];
      const valChoice = answers[currentUser]?.[keyChoice];
      const noteVal = notes[currentUser]?.[it.id] || '';

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
              ${(it.options || []).map(opt => {
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
  }

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
  if (!answers[currentUser]) answers[currentUser] = {};
  answers[currentUser][key] = score;
  saveToLocalStorage();
  renderCurrentChapter();
  updateProgressBar();
  updateTabuBadge();
  checkChapterQuickGridVisibility();
}

function recordChoiceAnswer(id, val) {
  if (!answers[currentUser]) answers[currentUser] = {};
  answers[currentUser][`it_${id}_choice`] = val;
  saveToLocalStorage();
  renderCurrentChapter();
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
  let totalQuestions = 0;
  chapters.forEach(c => {
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
  let totalPoints = 0;

  Object.keys(uAnswers).forEach(k => {
    const v = uAnswers[k];
    if (typeof v === 'number' && v > 0) {
      totalPoints += v;
      if (k.includes('115') || k.includes('117') || k.includes('198') || k.includes('336')) pPower += v;
      else if (k.includes('217') || k.includes('262') || k.includes('264') || k.includes('287')) pSensation += v;
      else if (k.includes('319') || k.includes('320') || k.includes('322') || k.includes('526')) pNurturing += v;
      else if (k.includes('303') || k.includes('304') || k.includes('386') || k.includes('581')) pThrill += v;
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
    return possible > 0 ? Math.round((earned / possible) * 100) : 50;
  });

  singleRadarInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: dimensions.map(d => d.label),
      datasets: [{
        label: names[currentUser] || 'Profil',
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

function openAccountModal() {
  const user = currentUser;
  const nameEl = document.getElementById('account-active-username');
  if (nameEl) nameEl.innerText = names[user] || 'Partner 1';

  const nameInput = document.getElementById('account-name-input');
  if (nameInput) nameInput.value = names[user] || '';

  const emailInput = document.getElementById('account-email-input');
  if (emailInput) emailInput.value = accounts[user]?.email || '';

  const resetUserSpan = document.getElementById('reset-current-username');
  if (resetUserSpan) resetUserSpan.innerText = names[user] || 'Partner 1';
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

function generateRandomTestData() {
  const chapters = window.surveyChapters || [];
  if (chapters.length === 0) {
    showToast("Fragenkatalog noch nicht geladen.");
    return;
  }

  answers = { A: {}, B: {} };
  notes = { A: {}, B: {} };

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
    });
  });

  saveToLocalStorage();
  updateProgressBar();
  updateTabuBadge();
  renderCurrentChapter();
  closeAccountModal();
  showToast("🎲 Zufällige Testdaten erfolgreich generiert!");
}

function openTabuModal() {
  const list = document.getElementById('tabu-modal-list');
  if (!list) return;

  let tabuItems = [];
  const chapters = window.surveyChapters || [];
  chapters.forEach(ch => {
    (ch.items || []).forEach(it => {
      const aR1 = answers.A?.[`it_${it.id}_r1`];
      const aR2 = answers.A?.[`it_${it.id}_r2`];
      const bR1 = answers.B?.[`it_${it.id}_r1`];
      const bR2 = answers.B?.[`it_${it.id}_r2`];

      if (aR1 === 1 || aR2 === 1 || bR1 === 1 || bR2 === 1) {
        let who = [];
        if (aR1 === 1 || aR2 === 1) who.push(names.A || 'Partner 1');
        if (bR1 === 1 || bR2 === 1) who.push(names.B || 'Partner 2');
        tabuItems.push({ it, who: who.join(' & ') });
      }
    });
  });

  list.innerHTML = tabuItems.length > 0
    ? tabuItems.map(t => `
        <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
          <div class="flex justify-between items-start">
            <strong class="text-rose-950 font-bold">${t.it.id}. ${escapeHtml(t.it.title)}</strong>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900">Limit von ${escapeHtml(t.who)}</span>
          </div>
          <p class="text-[11px] text-rose-800 mt-0.5">${escapeHtml(t.it.desc)}</p>
        </div>
      `).join('')
    : '<p class="text-slate-400 italic p-3 text-center">Aktuell sind keine Tabus (Note 1) hinterlegt.</p>';

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
  const filtered = window.lexikonData.filter(l => l.term.toLowerCase().includes(query) || l.def.toLowerCase().includes(query));

  container.innerHTML = filtered.length > 0
    ? filtered.map(l => `
        <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <div class="flex justify-between items-center">
            <strong class="text-slate-900 font-bold text-xs">${escapeHtml(l.term)}</strong>
            <a href="${l.link}" target="_blank" rel="noopener noreferrer" class="text-[10px] text-indigo-600 hover:underline">Wikipedia ↗</a>
          </div>
          <p class="text-[11px] text-slate-600 leading-relaxed">${escapeHtml(l.def)}</p>
        </div>
      `).join('')
    : '<p class="text-slate-400 italic text-center p-2">Kein Begriff gefunden.</p>';
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
