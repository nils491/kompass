/**
 * js/ledger_tasks.js
 * PACTUM Aufgaben-, Intervall- & Micro-D/s-Engine (Release 3.0 Core Bundle)
 * 
 * Features & Spezifikationen:
 * - Zentrale Intervall-Engine mit Fälligkeitsprüfung: täglich, wöchentlich, monatlich mit Uhrzeit
 * - Kuratierter Micro-D/s- & Entlastungskatalog (Kniestand-Appell, Duftanker, Haushaltsentlastung)
 * - 1-Tap Einreichung für den Bottom direkt im Protokoll
 * - Anti-TftB-Workflow: Bottom reicht Pflichten als "submitted" ein; Punkte werden
 *   AUSSCHLIESSLICH nach Prüfung und Freigabe durch den Top verbucht
 * - Fälligkeitsprüfung beim App-Start und bei Synchronisation
 * - Noir-Luxury Design-System (1.5px Inline-SVGs, keine Emojis in Buttons)
 * - Strikte Einhaltung: <= 800 Zeilen, keine alert() / confirm() Aufrufe!
 */

(function(window) {
  'use strict';

  const DEFAULT_TASKS = [
    {
      id: 'task_daily_morning_kneel',
      title: 'Morgenappell im Kniestand',
      category: 'micro_ds',
      interval: 'daily',
      dueTime: '07:30',
      dayOfWeek: null,
      points: 20,
      desc: '30 Sekunden schweigender Kniestand (Nadu) mit aufrechtem Blickkontakt vor der ersten Alltagsinteraktion.',
      status: 'pending',
      lastSubmittedAt: null,
      lastApprovedAt: null
    },
    {
      id: 'task_daily_kitchen_clean',
      title: 'Küche & Arbeitsflächen tiefenrein',
      category: 'household',
      interval: 'daily',
      dueTime: '20:00',
      dayOfWeek: null,
      points: 30,
      desc: 'Küche makellos hinterlassen: Geschirrspüler ausgeräumt, Spüle poliert, Müll geleert zur Entlastung des Tops.',
      status: 'pending',
      lastSubmittedAt: null,
      lastApprovedAt: null
    },
    {
      id: 'task_daily_scent_anchor',
      title: 'Duftanker & Haltungspflege',
      category: 'micro_ds',
      interval: 'daily',
      dueTime: '08:00',
      dayOfWeek: null,
      points: 15,
      desc: 'Auflegen des vom Top ausgewählten Parfüms und bewusste Atemzentrierung vor Verlassen des Hauses.',
      status: 'pending',
      lastSubmittedAt: null,
      lastApprovedAt: null
    },
    {
      id: 'task_weekly_massage_service',
      title: '25 Min. Entlastungsmassage für den Top',
      category: 'service',
      interval: 'weekly',
      dueTime: '21:00',
      dayOfWeek: 0, // Sonntag
      points: 40,
      desc: 'Hingebungsvolle Nacken- und Fußmassage im Halbdunkel ohne jede Gegenforderung.',
      status: 'pending',
      lastSubmittedAt: null,
      lastApprovedAt: null
    },
    {
      id: 'task_weekly_grooming_inspection',
      title: 'Intimrasur & Körperpflege-Appell',
      category: 'discipline',
      interval: 'weekly',
      dueTime: '18:00',
      dayOfWeek: 5, // Freitag
      points: 25,
      desc: 'Vollständige Glattrasur des Intimbereichs und Vorzeigen zur Inspektion vor dem Wochenende.',
      status: 'pending',
      lastSubmittedAt: null,
      lastApprovedAt: null
    }
  ];

  let tasksState = {
    tasks: [],
    filterTab: 'all',
    updatedAt: Date.now()
  };

  function loadTasksState() {
    try {
      const raw = localStorage.getItem('pactum_tasks_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
          tasksState = {
            tasks: parsed.tasks,
            filterTab: parsed.filterTab || 'all',
            updatedAt: parsed.updatedAt || Date.now()
          };
          checkAllDueDates();
          return;
        }
      }
    } catch (e) {
      console.warn("[PACTUM Tasks] Fehler beim Laden:", e);
    }

    tasksState = {
      tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
      filterTab: 'all',
      updatedAt: Date.now()
    };
    checkAllDueDates();
  }

  function saveTasksState() {
    try {
      tasksState.updatedAt = Date.now();
      localStorage.setItem('pactum_tasks_state', JSON.stringify(tasksState));
    } catch (e) {
      console.warn("[PACTUM Tasks] Fehler beim Speichern:", e);
    }

    if (window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }
  }

  function isUserTop() {
    if (window.LedgerApp && typeof window.LedgerApp.isTop === 'function') {
      return window.LedgerApp.isTop();
    }
    const isPaired = localStorage.getItem('kompass_is_paired') === 'true';
    if (!isPaired) return true;
    const myRole = localStorage.getItem('kompass_assigned_role') || 'A';
    const kh = localStorage.getItem('kompass_keyholder_role') || 'A';
    return myRole === kh;
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

  function showToast(message) {
    if (typeof window.showToastNotification === 'function') {
      window.showToastNotification(message);
      return;
    }
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = "bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 transition-all pointer-events-auto transform translate-y-2 opacity-0 flex items-center gap-2";
    el.innerHTML = `<span>${escapeHtml(message)}</span>`;
    container.appendChild(el);

    setTimeout(() => el.classList.remove('translate-y-2', 'opacity-0'), 10);
    setTimeout(() => {
      el.classList.add('opacity-0');
      setTimeout(() => el.remove(), 300);
    }, 2800);
  }

  function checkAllDueDates() {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMins).padStart(2, '0')}`;
    const currentDayOfWeek = now.getDay();
    let hasChanged = false;

    tasksState.tasks.forEach(task => {
      if (task.status === 'submitted') return; // Wartet auf Top-Prüfung

      // Reset täglicher Aufgaben am Folgetag
      if (task.interval === 'daily' && task.lastApprovedAt) {
        const lastApp = new Date(task.lastApprovedAt);
        const isSameDay = lastApp.getDate() === now.getDate() &&
                          lastApp.getMonth() === now.getMonth() &&
                          lastApp.getFullYear() === now.getFullYear();
        if (!isSameDay) {
          task.status = 'pending';
          hasChanged = true;
        }
      }

      // Reset wöchentlicher Aufgaben bei neuem Wochenzyklus
      if (task.interval === 'weekly' && task.lastApprovedAt) {
        const diffMs = now.getTime() - task.lastApprovedAt;
        if (diffMs > 5 * 24 * 3600 * 1000) {
          task.status = 'pending';
          hasChanged = true;
        }
      }

      // Fälligkeits-Erkennung
      if (task.status === 'pending') {
        if (task.interval === 'daily') {
          task.isDueNow = (currentTimeStr >= (task.dueTime || '20:00'));
        } else if (task.interval === 'weekly') {
          const targetDay = task.dayOfWeek !== null ? task.dayOfWeek : 0;
          task.isDueNow = (currentDayOfWeek === targetDay && currentTimeStr >= (task.dueTime || '20:00'));
        } else {
          task.isDueNow = true;
        }
      } else {
        task.isDueNow = false;
      }
    });

    if (hasChanged) {
      saveTasksState();
    }
  }

  function submitTaskByBottom(taskId, note = '') {
    loadTasksState();
    const task = tasksState.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'submitted') {
      showToast("Pflicht wurde bereits zur Prüfung eingereicht.");
      return;
    }

    task.status = 'submitted';
    task.lastSubmittedAt = Date.now();
    task.submissionNote = note.trim();

    saveTasksState();
    renderTasksDashboard();

    showToast(`✓ „${task.title}“ eingereicht. Wartet auf Prüfung durch den Top.`);

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      const noteSuffix = task.submissionNote ? ` („${task.submissionNote}“)` : '';
      window.ChatApp.postSystemEvent(`🧎 Pflicht zur Prüfung eingereicht: ${task.title}${noteSuffix}. Freigabe durch den Top ausstehend.`);
    }
  }

  function approveTaskByTop(taskId) {
    if (!isUserTop()) {
      showToast("🔒 Nur der Top kann eingereichte Pflichten quittieren.");
      return;
    }

    loadTasksState();
    const task = tasksState.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = 'approved';
    task.lastApprovedAt = Date.now();
    task.isDueNow = false;

    // Punkte im Ledger gutschreiben
    if (window.LedgerApp && typeof window.LedgerApp.getState === 'function') {
      const lState = window.LedgerApp.getState();
      if (lState && typeof lState.balance === 'number') {
        lState.balance += (task.points || 15);
        if (typeof window.LedgerApp.saveState === 'function') {
          window.LedgerApp.saveState();
        }
      }
    }

    saveTasksState();
    renderTasksDashboard();

    showToast(`✓ Pflicht bestätigt: +${task.points} Tribut-Punkte gutgeschrieben`);

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent(`👑 Pflicht anerkannt: „${task.title}“ vom Top quittiert (+${task.points} P).`);
    }
  }

  function rejectTaskByTop(taskId, rejectionReason = '') {
    if (!isUserTop()) {
      showToast("🔒 Nur der Top kann Pflichten ablehnen.");
      return;
    }

    loadTasksState();
    const task = tasksState.tasks.find(t => t.id === taskId);
    if (!task) return;

    task.status = 'pending';
    task.lastSubmittedAt = null;

    saveTasksState();
    renderTasksDashboard();

    const reason = rejectionReason ? ` Grund: ${rejectionReason}` : ' Bitte gründlich nachbessern.';
    showToast(`Pflicht abgewiesen.${reason}`);

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent(`⚠️ Pflicht abgewiesen: „${task.title}“ wurde vom Top nicht anerkannt.${reason}`);
    }
  }

  function getFilteredTasks() {
    checkAllDueDates();
    const tab = tasksState.filterTab;

    return tasksState.tasks.filter(t => {
      if (tab === 'due') return t.isDueNow && t.status === 'pending';
      if (tab === 'submitted') return t.status === 'submitted';
      if (tab === 'micro_ds') return t.category === 'micro_ds';
      if (tab === 'household') return t.category === 'household';
      return true;
    });
  }

  function setFilterTab(tabName) {
    tasksState.filterTab = tabName;
    renderTasksDashboard();
  }

  function renderTasksDashboard() {
    const container = document.getElementById('tasks-manager-container');
    if (!container) return;

    const isTop = isUserTop();
    const filtered = getFilteredTasks();
    const pendingCount = tasksState.tasks.filter(t => t.status === 'pending' && t.isDueNow).length;
    const submittedCount = tasksState.tasks.filter(t => t.status === 'submitted').length;

    container.innerHTML = `
      <div class="space-y-4">
        <!-- Filter Tabs -->
        <div class="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar pb-1 border-b border-slate-800 text-xs">
          <div class="flex items-center gap-1.5 flex-1 min-w-0">
            <button type="button" onclick="HubTasks.setTab('all')" class="px-3 py-1.5 rounded-xl font-bold transition-all ${tasksState.filterTab === 'all' ? 'bg-purple-700 text-white shadow-sm' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}">
              Alle (${tasksState.tasks.length})
            </button>
            <button type="button" onclick="HubTasks.setTab('submitted')" class="px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${tasksState.filterTab === 'submitted' ? 'bg-amber-700 text-white shadow-sm' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}">
              <span>Prüfung</span>
              ${submittedCount > 0 ? `<span class="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-400 text-black font-black">${submittedCount}</span>` : ''}
            </button>
            <button type="button" onclick="HubTasks.setTab('due')" class="px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${tasksState.filterTab === 'due' ? 'bg-rose-700 text-white shadow-sm' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}">
              <span>Fällig</span>
              ${pendingCount > 0 ? `<span class="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-400 text-black font-black">${pendingCount}</span>` : ''}
            </button>
            <button type="button" onclick="HubTasks.setTab('micro_ds')" class="px-3 py-1.5 rounded-xl font-bold transition-all ${tasksState.filterTab === 'micro_ds' ? 'bg-purple-900 border border-purple-600 text-purple-200' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}">
              Micro-D/s
            </button>
          </div>
          ${isTop ? `
            <button type="button" onclick="HubTasks.openCreateModal()" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 touch-btn flex-shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
              <span>+ Pflicht</span>
            </button>
          ` : ''}
        </div>

        <!-- Task Cards List -->
        <div class="space-y-2.5">
          ${filtered.length === 0 ? `
            <div class="py-8 text-center text-slate-500 text-xs">
              Keine Pflichten in dieser Kategorie vorhanden.
            </div>
          ` : filtered.map(task => {
            const isSubmitted = task.status === 'submitted';
            const isApproved = task.status === 'approved';
            const isDue = task.isDueNow && task.status === 'pending';

            return `
              <div class="p-3.5 sm:p-4 rounded-2xl border transition-all space-y-2 ${isSubmitted ? 'bg-amber-950/20 border-amber-700/60 shadow-md' : (isDue ? 'bg-rose-950/20 border-rose-800/80 shadow-sm' : 'bg-slate-900/60 border-slate-800/80')}">
                <div class="flex items-start justify-between gap-2">
                  <div class="space-y-0.5 min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <strong class="text-xs text-white block truncate font-bold">${escapeHtml(task.title)}</strong>
                      <span class="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold ${isSubmitted ? 'bg-amber-950 text-amber-300 border border-amber-800' : (isApproved ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : (isDue ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-400'))}">
                        ${isSubmitted ? 'In Prüfung ⏳' : (isApproved ? 'Anerkannt ✓' : (isDue ? 'Fällig ⚠️' : 'Offen'))}
                      </span>
                    </div>
                    <p class="text-[10.5px] text-slate-400 leading-snug line-clamp-2">${escapeHtml(task.desc)}</p>
                  </div>
                  <span class="font-mono text-xs font-black text-amber-300 flex-shrink-0">+${task.points} P</span>
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                  <div class="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>${task.interval === 'daily' ? `Täglich bis ${task.dueTime || '20:00'}` : (task.interval === 'weekly' ? `Wöchentlich um ${task.dueTime || '20:00'}` : 'Einmalig')}</span>
                    ${task.category === 'micro_ds' ? '<span class="text-purple-400 font-bold">· Micro-D/s</span>' : ''}
                  </div>

                  <div class="flex items-center gap-1.5">
                    ${!isTop && task.status === 'pending' ? `
                      <button type="button" onclick="HubTasks.openSubmitModal('${task.id}')" class="px-3 py-1.5 rounded-xl bg-purple-900/90 hover:bg-purple-800 border border-purple-700 text-white font-bold text-xs flex items-center gap-1 touch-btn shadow-sm">
                        <span>Erledigt melden ↗</span>
                      </button>
                    ` : ''}

                    ${isTop && isSubmitted ? `
                      <button type="button" onclick="HubTasks.approve('${task.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs touch-btn shadow-sm">
                        Anerkennen (+${task.points})
                      </button>
                      <button type="button" onclick="HubTasks.reject('${task.id}')" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 border border-slate-700 font-bold text-xs touch-btn">
                        Abweisen
                      </button>
                    ` : ''}

                    ${isTop && !isSubmitted ? `
                      <button type="button" onclick="HubTasks.deleteTask('${task.id}')" title="Pflicht löschen" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 touch-btn">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function openCreateModal() {
    let modal = document.getElementById('modal-create-task');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-create-task';
      modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl text-xs">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-white">Neue Pflicht anordnen</h3>
            <span class="text-[10px] text-slate-400">Intervall, Uhrzeit und Tribut festlegen</span>
          </div>
          <button type="button" onclick="document.getElementById('modal-create-task').style.display='none'" class="p-1.5 text-slate-400 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-[10.5px] font-mono text-slate-400 uppercase block mb-1">Titel der Pflicht:</label>
            <input type="text" id="input-task-title" placeholder="z. B. Schuhe putzen & auf Knien servieren" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-600 focus:outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[10.5px] font-mono text-slate-400 uppercase block mb-1">Kategorie:</label>
              <select id="select-task-cat" class="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs">
                <option value="micro_ds">Micro-D/s & Geste</option>
                <option value="household">Haushalt & Ordnung</option>
                <option value="service">Dienst am Top</option>
                <option value="discipline">Disziplin & Körper</option>
              </select>
            </div>
            <div>
              <label class="text-[10.5px] font-mono text-slate-400 uppercase block mb-1">Tribut-Punkte:</label>
              <input type="number" id="input-task-points" value="20" min="5" max="200" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[10.5px] font-mono text-slate-400 uppercase block mb-1">Intervall:</label>
              <select id="select-task-interval" class="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs">
                <option value="daily">Täglich</option>
                <option value="weekly">Wöchentlich</option>
                <option value="once">Einmalig</option>
              </select>
            </div>
            <div>
              <label class="text-[10.5px] font-mono text-slate-400 uppercase block mb-1">Fällig bis (Uhrzeit):</label>
              <input type="time" id="input-task-duetime" value="20:00" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono" />
            </div>
          </div>

          <div>
            <label class="text-[10.5px] font-mono text-slate-400 uppercase block mb-1">Genaue Ausführungs-Anweisung:</label>
            <textarea id="input-task-desc" rows="2" placeholder="Haltung, Rhythmus und genaue Bedingungen..." class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-600 focus:outline-none"></textarea>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-800 flex justify-end gap-2">
          <button type="button" onclick="document.getElementById('modal-create-task').style.display='none'" class="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs touch-btn">Abbrechen</button>
          <button type="button" onclick="HubTasks.saveNewTask()" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs touch-btn shadow-md">Pflicht anordnen ✓</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  function saveNewTask() {
    const titleInput = document.getElementById('input-task-title');
    const catSelect = document.getElementById('select-task-cat');
    const ptsInput = document.getElementById('input-task-points');
    const intSelect = document.getElementById('select-task-interval');
    const dueInput = document.getElementById('input-task-duetime');
    const descInput = document.getElementById('input-task-desc');

    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      showToast("Bitte gib der Pflicht einen Titel.");
      return;
    }

    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title,
      category: catSelect ? catSelect.value : 'household',
      points: ptsInput ? parseInt(ptsInput.value, 10) || 20 : 20,
      interval: intSelect ? intSelect.value : 'daily',
      dueTime: dueInput ? dueInput.value : '20:00',
      dayOfWeek: 0,
      desc: descInput ? descInput.value.trim() : '',
      status: 'pending',
      lastSubmittedAt: null,
      lastApprovedAt: null
    };

    loadTasksState();
    tasksState.tasks.unshift(newTask);
    saveTasksState();

    const modal = document.getElementById('modal-create-task');
    if (modal) modal.style.display = 'none';

    renderTasksDashboard();
    showToast(`✓ Pflicht „${newTask.title}“ angeordnet`);
  }

  function deleteTask(taskId) {
    if (!isUserTop()) return;
    loadTasksState();
    tasksState.tasks = tasksState.tasks.filter(t => t.id !== taskId);
    saveTasksState();
    renderTasksDashboard();
    showToast("Pflicht entfernt.");
  }

  function openSubmitModal(taskId) {
    let modal = document.getElementById('modal-submit-task');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-submit-task';
      modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    loadTasksState();
    const task = tasksState.tasks.find(t => t.id === taskId);
    if (!task) return;

    modal.innerHTML = `
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl text-xs">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-white">Pflicht als erledigt melden</h3>
            <span class="text-[10px] text-slate-400">Reiche deinen Vollzug zur Prüfung beim Top ein</span>
          </div>
          <button type="button" onclick="document.getElementById('modal-submit-task').style.display='none'" class="p-1.5 text-slate-400 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
          <strong class="text-xs text-white block">${escapeHtml(task.title)}</strong>
          <p class="text-[10.5px] text-slate-400">${escapeHtml(task.desc)}</p>
        </div>

        <div class="space-y-1.5">
          <label class="text-[10.5px] font-mono text-slate-400 uppercase block">Notiz an den Top (optional):</label>
          <input type="text" id="input-submit-task-note" placeholder="z. B. Küche gründlich gewischt / Pünktlich vollzogen..." class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-600 focus:outline-none" />
        </div>

        <div class="pt-2 border-t border-slate-800 flex justify-end gap-2">
          <button type="button" onclick="document.getElementById('modal-submit-task').style.display='none'" class="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs touch-btn">Abbrechen</button>
          <button type="button" onclick="HubTasks.confirmSubmit('${task.id}')" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs touch-btn shadow-md">Zur Prüfung einreichen ↗</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  function confirmSubmit(taskId) {
    const noteInput = document.getElementById('input-submit-task-note');
    const note = noteInput ? noteInput.value : '';
    submitTaskByBottom(taskId, note);

    const modal = document.getElementById('modal-submit-task');
    if (modal) modal.style.display = 'none';
  }

  window.HubTasks = {
    init: function() {
      loadTasksState();
      renderTasksDashboard();
    },
    render: renderTasksDashboard,
    setTab: setFilterTab,
    submit: submitTaskByBottom,
    openSubmitModal: openSubmitModal,
    confirmSubmit: confirmSubmit,
    approve: approveTaskByTop,
    reject: rejectTaskByTop,
    openCreateModal: openCreateModal,
    saveNewTask: saveNewTask,
    deleteTask: deleteTask,
    checkDueDates: checkAllDueDates,
    getTasks: function() { loadTasksState(); return tasksState.tasks; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadTasksState();
      renderTasksDashboard();
    });
  } else {
    loadTasksState();
    renderTasksDashboard();
  }

})(window);
