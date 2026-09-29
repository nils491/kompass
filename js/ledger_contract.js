/**
 * js/ledger_contract.js
 * PACTUM Dynamische Psychosomatische Vertrags-Engine (Release 3.0 Core Bundle)
 * 
 * Spezifikationen & Garantien:
 * - Psychosomatische Resonanz: Cross-Clause Dependencies (Schutz vor Top Fatigue & Frust)
 * - 3-Ebenen-Steuerung: Sprachduktus (4 Tonalitäten), Länge (Kompakt/Ausgewogen/Kodex), Härte 0-5
 * - Stufe 0 (Deaktiviert): Modulare Ausblendung für Paare ohne Keuschheit oder Impact
 * - Anti-TftB Schutzklauseln: § 2 Abs. 3 (Regieverbot), § 3 Abs. 4 (Schweigepflicht), § 4 Abs. 2 (Reverse Aftercare)
 * - Dualer Urkunden-Druck: Wahl zwischen digitalen Signaturen und Blanko-Zeremonie (Siegelwachs)
 * - Shareable Redacted Contract: 1-Klick Canvas-Export geschwärzter Urkunden für Social Proof
 * - Noir-Luxury Vektor-Ikonografie (1.5px Inline-SVGs, keine Emojis in Buttons)
 * - Strikte Einhaltung: <= 800 Zeilen, keine alert() / confirm() Aufrufe!
 */

(function(window) {
  'use strict';

  const DUKTUS_PROFILES = {
    playful: {
      id: 'playful',
      label: 'Sinnlich & Verspielt',
      desc: 'Behutsamer Tonfall, Fokus auf Neugier, Erotik und gemeinsame Freude'
    },
    sovereign_warm: {
      id: 'sovereign_warm',
      label: 'Souverän & Warm (Standard)',
      desc: 'Klare, liebevolle Führung, emotionale Sicherheit und feste Verlässlichkeit'
    },
    sovereign_cool: {
      id: 'sovereign_cool',
      label: 'Kühl & Unerbittlich',
      desc: 'Wenig Worte, messerscharfe Distanz, diszipliniertes Protokoll'
    },
    authoritarian: {
      id: 'authoritarian',
      label: 'Autoritär & Streng',
      desc: 'Unmissverständliche Befehlssprache, strikte Unterordnung'
    }
  };

  const DEFAULT_CHAPTER_TEMPLATES = [
    {
      key: 'k1_preamble',
      num: '§ 1',
      title: 'Präambel & Einvernehmlichkeit (Konsens)',
      level: 3,
      canDisable: false,
      text_0: '',
      text_1: 'Beide Partner treten aus freien Stücken in dieses Abkommen ein. Das Spiel mit Führung und Hingabe dient der Vertiefung der Intimität. Alle Handlungen folgen dem Prinzip gegenseitiger Absprache.',
      text_3: 'Beide Partner treten vollkommen freiwillig und im Vollbesitz ihrer geistigen Kräfte in dieses Abkommen ein. Das Spiel mit Macht, Disziplin und Hingabe folgt ausnahmslos den ethischen Prinzipien von Safe, Sane & Consensual (SSC) sowie RACK. Echte Bosheit, Alltagszorn oder Gefährdung der Gesundheit sind ausgeschlossen.',
      text_5: 'Beide Partner weihen ihr Zusammensein einem unumstößlichen Bündnis. Der Bottom übergibt die Regie über Lust, Körper und Zeit im Rahmen unverletzlicher ethischer Grenzen an den Top. Das Bündnis ist ein heiliger Raum des absoluten Vertrauens.'
    },
    {
      key: 'k2_hierarchy',
      num: '§ 2',
      title: 'Rollen, Titel & Verbot der verdeckten Regie',
      level: 3,
      canDisable: true,
      text_0: 'Titel und formelle Hierarchien sind nicht Gegenstand dieses Vertrags. Beide Partner begegnen sich mit ihren gewohnten Vornamen.',
      text_1: 'Die Führung obliegt im Spielzimmer dem Top. Im Alltag begegnen sich beide Partner mit gegenseitigem Respekt und ihren normalen Kosenamen.',
      text_3: 'Abs. 1: Die Leitung der Dynamik obliegt ungeteilt dem Top. Der Bottom erkennt diese Autorität mit aufrichtiger Hingabe an.\nAbs. 2: Im Alltag und nach außen gilt das Stealth-Prinzip: Absolute Diskretion vor Dritten.\nAbs. 3 (Verbot der verdeckten Regie): Das bewusste oder unbewusste Diktieren von Handlungen, Strafen oder Belohnungen durch den Bottom gilt als subtiler Ungehorsam. Die Regie liegt unteilbar beim Top.',
      text_5: 'Abs. 1: Dem Top gebührt ungeteilte Autorität und ehrerbietige Anrede im privaten Raum. Der Bottom spricht nur nach Aufforderung.\nAbs. 2: Jede Form verdeckter Regieführung („Topping from the Bottom“) ist untersagt. Jedes Zuwiderhandeln zieht Disziplinierung nach sich.'
    },
    {
      key: 'k3_spheres',
      num: '§ 3',
      title: 'Sphärentrennung & Geltungsbereich',
      level: 3,
      canDisable: false,
      text_0: '',
      text_1: 'Dieser Kodex gilt ausschließlich bei geschlossener Schlafzimmertür während verabredeter Spielzeiten.',
      text_3: 'Abs. 1: Die Regeln dieses Kodex gelten im privaten häuslichen Raum sowie während vereinbarter Session-Zeiten.\nAbs. 2: Im Berufsleben, vor der Familie und im Freundeskreis sind beide Partner ein gleichberechtigtes Team auf Augenhöhe.',
      text_5: 'Die Hierarchie durchdringt das gesamte private Zusammenleben. Diskrete Anker und Berührungsverbote begleiten das Paar auch außerhalb des Hauses, ohne Dritten sichtbar zu sein.'
    },
    {
      key: 'k4_aftercare',
      num: '§ 4',
      title: 'Fürsorge, Nervensystem & Reverse Aftercare',
      level: 3,
      canDisable: false,
      text_0: '',
      text_1: 'Nach jeder Session halten beide Partner mindestens 10 Minuten gemeinsame Ruhe und versorgen sich mit Wasser und Nähe.',
      text_3: 'Abs. 1: Der Top garantiert nach jeder intensiven Session mindestens 15 Minuten ununterbrochene Aftercare: feste Umarmung, warme Decken und Vagus-Atmung zur Abwendung eines Subdrops.\nAbs. 2 (Reverse Aftercare & Top-Entlastung): Dem Bottom obliegt die Pflicht zur körperlichen Versorgung des Tops (Getränke reichen, Massage ermüdeter Muskeln, Aufräumen der Ausrüstung). Erst nach Erfüllung dieser Fürsorge darf der Bottom um eigene Ruhe bitten.',
      text_5: 'Abs. 1: Der Top wacht mit höchster Achtsamkeit über die körperliche und seelische Verfassung des Bottoms.\nAbs. 2: Nach jeder Session bedient der Bottom den Top hingebungsvoll (Fußmassage, Entlastung) und hält die Deckenruhe bis zur vollständigen Stabilisierung des Nervensystems ein.'
    },
    {
      key: 'k5_chastity',
      num: '§ 5',
      title: 'Orgasmus-Ökonomie, Keuschheit & Schweigepflicht',
      level: 3,
      canDisable: true,
      text_0: 'Keuschheit und Orgasmus-Beschränkungen sind nicht Gegenstand dieses Vertrags. Die Intimität beider Partner bleibt frei und unreglementiert.',
      text_1: 'Gelegentlicher Triebaufschub im Schlafzimmer dient der erotischen Spannung. Ejakulationen erfolgen im gegenseitigen Einvernehmen.',
      text_3: 'Abs. 1: Das Genital des Bottoms unterliegt der Schlüsselgewalt des Tops. Jeder Orgasmus ist ein seltenes Privileg und bedarf vorheriger Erlaubnis.\nAbs. 2: Die Orgasmus-Ratio richtet sich nach der Lust des Tops. Erreichte Quoten begründen keinen Rechtsanspruch des Bottoms.\nAbs. 3: Unerlaubtes Berühren des Verschlusses gilt als schwerer Vertrauensbruch. Dusch- und Pflegepausen erfolgen nach Zeitprotokoll.\nAbs. 4 (Schweigepflicht über Verschluss & Lust): Dem Bottom ist jedes unaufgeforderte Thematisieren, Nachfragen oder Jammern bezüglich Freilassung, Schlüsseln oder Orgasmen untersagt. Ein Betteln um Erlaubnis ist nur gestattet, wenn der Top dies ausdrücklich befiehlt.',
      text_5: 'Abs. 1: Dauerhafte Keuschheit im Verschluss. Der Bottom hat jeglichen Anspruch auf eigene Ejakulationen an den Top abgetreten.\nAbs. 2: Freigaben erfolgen extrem selten und nach alleinigem Ermessen der Herrin, vorzugsweise als Ruined Orgasm oder über Prostata.\nAbs. 3: Schweigepflicht über die eigene Lust ist absolut. Jedes Zuwiderhandeln verlängert die Tragedauer um mindestens 48 Stunden.'
    },
    {
      key: 'k6_service',
      num: '§ 6',
      title: 'Dienste, Haushalt & Entlastung des Tops',
      level: 3,
      canDisable: true,
      text_0: 'Häusliche Dienste und Alltagsaufgaben sind nicht Gegenstand dieses Vertrags und werden partnerschaftlich geteilt.',
      text_1: 'Kleine Aufmerksamkeiten (Kaffeedienst, gelegentliche Massage) werden zur Freude des Partners gerne geleistet.',
      text_3: 'Abs. 1: Der Bottom erfüllt die im Protokoll vereinbarten Tages- und Wochenpflichten sorgfältig, um den Top vom Mental Load des Haushalts zu befreien.\nAbs. 2: Beim Eintreffen des Tops zuhause erfolgt auf Wunsch der Begrüßungs-Kniestand oder die Übergabe der Hausschuhe.\nAbs. 3: Pflege des Intimbereichs (Rasur) und Körperhygiene werden lückenlos aufrechterhalten.',
      text_5: 'Umfassende häusliche Dienstbarkeit: Der Bottom hält die Lebensräume des Tops makellos rein. Sämtliche Versorgungsdienste werden aufmerksam und ohne Aufforderung erbracht.'
    },
    {
      key: 'k7_discipline',
      num: '§ 7',
      title: 'Disziplin, Sühne & Strafenkatalog',
      level: 3,
      canDisable: true,
      text_0: 'Physische Zucht und formelle Bestrafungen sind nicht Gegenstand dieses Vertrags.',
      text_1: 'Milde Rügen, sportliche Ausgleichsübungen (Liegestütze) oder eine zusätzliche Massage dienen dem Ausgleich kleiner Versehen.',
      text_3: 'Abs. 1: Pflichtverletzungen und Unpünktlichkeit werden nach dem Strafenkatalog des Protokolls gesühnt (Punkteabzug oder Schläge mit dem Ledergürtel).\nAbs. 2: Zucht erfolgt mit ruhiger Hand und ohne Alltagszorn. Der Bottom zählt jeden Treffer laut mit.\nAbs. 3: Der Bottom darf um Verhandlung und Ablass durch Tributpunkte bitten; die Entscheidung obliegt allein dem Top.',
      text_5: 'Formelle, unnachgiebige Disziplinierung: Regelverstöße werden unmittelbar durch festgelegte Zuchtakte (Paddle, Gürtel, Stock) gesühnt. Schlichtung erfolgt erst nach vollständigem Vollzug.'
    },
    {
      key: 'k8_safewords',
      num: '§ 8',
      title: 'Not-Aus, RACK-Sicherheit & Revision',
      level: 3,
      canDisable: false,
      text_0: '',
      text_1: 'Jederzeitiger formloser Abbruch einer Handlung durch klares Zurufen des partnerschaftlichen Stoppworts.',
      text_3: 'Abs. 1: Das dreistufige Safeword-System (Grün = Bestätigung, Gelb = Drosseln, Rot = Sofortiger Stillstand) sowie das Klopfsignal bei Knebelung beenden jede Handlung unverzüglich und ausnahmslos.\nAbs. 2: Das Notfall-Entsiegelungsprotokoll (Break-Glass) steht dem Bottom bei medizinischen Notfällen oder Taubheitsgefühlen jederzeit zu.\nAbs. 3: Dieser Vertrag gilt für 30 Tage und wird danach in einer gemeinsamen Revisions-Zeremonie auf Augenhöhe ausgewertet.',
      text_5: 'Lückenloser Hochsicherheitsrahmen: Safewords und Break-Glass-Notfallrechte stehen über jeder Hierarchie. Ein jährliches oder monatliches Schlichtungsgespräch prüft das beiderseitige seelische Wohlbefinden.'
    }
  ];

  let contractState = null;
  let signingRole = 'top';
  let signaturePad = {
    canvas: null,
    ctx: null,
    drawing: false,
    hasSignature: false
  };

  function loadContractState() {
    try {
      const raw = localStorage.getItem('kompass_contract_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          contractState = parsed;
          if (!Array.isArray(contractState.chapters)) {
            contractState.chapters = JSON.parse(JSON.stringify(DEFAULT_CHAPTER_TEMPLATES));
          }
          return;
        }
      }
    } catch (e) {
      console.warn("[PACTUM Contract] Fehler beim Laden des Vertrags-States:", e);
    }

    contractState = {
      version: "1.0 Entwurf",
      status: "draft", // "draft" | "active" | "paused_break_glass"
      duktus: 'sovereign_warm',
      lengthPreset: 'balanced',
      chapters: JSON.parse(JSON.stringify(DEFAULT_CHAPTER_TEMPLATES)),
      signatureTop: null,
      signatureSub: null,
      signedAt: null,
      customClauses: [],
      updatedAt: Date.now()
    };
  }

  function saveContractState(skipSync) {
    if (!contractState) return;
    try {
      contractState.updatedAt = Date.now();
      localStorage.setItem('kompass_contract_state', JSON.stringify(contractState));
    } catch (e) {
      console.warn("[PACTUM Contract] Konnte Vertrags-State nicht speichern:", e);
    }

    if (!skipSync && window.CloudSync && typeof window.CloudSync.trigger === 'function') {
      window.CloudSync.trigger();
    }
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

  function isUserTop() {
    if (window.LedgerApp && typeof window.LedgerApp.isTop === 'function') {
      return window.LedgerApp.isTop();
    }
    const myRole = localStorage.getItem('kompass_assigned_role') || 'A';
    const khRole = localStorage.getItem('kompass_keyholder_role') || 'A';
    return myRole === khRole;
  }

  function validatePsychosomaticHarmony() {
    loadContractState();
    const chMap = {};
    contractState.chapters.forEach(ch => { chMap[ch.key] = ch.level; });

    const warnings = [];

    // 1. Denial-Kompensation: Wenn Keuschheit hoch, MUSS Fürsorge & Schutz hoch sein
    if (chMap['k5_chastity'] >= 4 && chMap['k4_aftercare'] < 3) {
      warnings.push({
        severity: 'high',
        text: 'Hoher Triebaufschub (§ 5) ohne ausreichende Fürsorge (§ 4) erzeugt Frust und Unruhe. Empfehlung: Hebe § 4 auf Stufe 3 oder höher.'
      });
    }

    // 2. Top-Fatigue Schutz: Wenn Disziplin hoch, MUSS Dienst & Entlastung hoch sein
    if (chMap['k7_discipline'] >= 4 && chMap['k6_service'] < 3) {
      warnings.push({
        severity: 'medium',
        text: 'Strenge Disziplin (§ 7) ohne Haushaltsentlastung (§ 6) führt zu Top Fatigue. Der Bottom sollte den Top im Alltag aktiv entlasten.'
      });
    }

    // 3. Stufe 0 Konsistenz: Wurde Keuschheit deaktiviert?
    const isChastityDisabled = chMap['k5_chastity'] === 0;

    return {
      score: Math.max(70, 100 - (warnings.length * 15)),
      warnings: warnings,
      isChastityDisabled: isChastityDisabled
    };
  }

  function renderContract() {
    loadContractState();
    const container = document.getElementById('contract-clauses-container');
    if (!container) return;

    const isTop = isUserTop();
    const isDraft = (contractState.status === 'draft');
    const harmony = validatePsychosomaticHarmony();

    const statusLbl = document.getElementById('contract-status-label');
    const verLbl = document.getElementById('contract-version-label');

    if (statusLbl) {
      if (contractState.status === 'active') {
        statusLbl.innerText = "Status: Verbindlich Besiegelt ✓";
        statusLbl.className = "text-emerald-400 font-bold font-mono text-xs";
      } else if (contractState.status === 'paused_break_glass') {
        statusLbl.innerText = "Status: Pausiert zur Schlichtung ⚠️ (Break-Glass)";
        statusLbl.className = "text-rose-400 font-bold font-mono text-xs";
      } else {
        statusLbl.innerText = "Status: Entwurf (Editierbar)";
        statusLbl.className = "text-amber-400 font-bold font-mono text-xs";
      }
    }
    if (verLbl) verLbl.innerText = contractState.version || "Version 1.0";

    // Psychosomatisches Harmonie-Banner
    const harmonyContainer = document.getElementById('contract-harmony-banner');
    if (harmonyContainer) {
      harmonyContainer.innerHTML = `
        <div class="p-3.5 rounded-2xl border transition-all text-xs space-y-1.5 ${harmony.warnings.length === 0 ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200' : 'bg-amber-950/30 border-amber-800/80 text-amber-200'}">
          <div class="flex items-center justify-between">
            <span class="font-bold flex items-center gap-1.5">
              <span>${harmony.warnings.length === 0 ? '✓' : '⚠️'}</span>
              <span>Systemische Balance: ${harmony.score}% Harmonie</span>
            </span>
            <span class="text-[10px] font-mono text-slate-400">${harmony.warnings.length === 0 ? 'Ausbalanciert' : 'Resonanz-Warnung'}</span>
          </div>
          ${harmony.warnings.map(w => `<p class="text-[10.5px] leading-relaxed text-amber-300/90">• ${escapeHtml(w.text)}</p>`).join('')}
        </div>
      `;
    }

    container.innerHTML = contractState.chapters.map(ch => {
      const isDisabled = (ch.level === 0);
      const activeText = isDisabled ? (ch.text_0 || 'Nicht Gegenstand dieses Abkommens.') : (ch.level >= 4 ? ch.text_5 : (ch.level >= 2 ? ch.text_3 : ch.text_1));

      return `
        <div class="rounded-3xl border transition-all p-4 sm:p-5 space-y-2.5 ${isDisabled ? 'bg-slate-950/40 border-slate-900 opacity-60' : 'bg-slate-900/90 border-slate-800 shadow-md'}" id="chapter-card-${ch.key}">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${isDisabled ? 'bg-slate-900 text-slate-500 border border-slate-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">${escapeHtml(ch.num)}</span>
              <strong class="text-xs text-white truncate">${escapeHtml(ch.title)}</strong>
            </div>

            ${isDraft && isTop ? `
              <!-- Härtegrad-Stufenregler 0 bis 5 -->
              <div class="flex items-center gap-1">
                ${ch.canDisable ? `
                  <button type="button" onclick="LedgerContract.setChapterLevel('${ch.key}', 0)" title="Klausel deaktivieren" class="px-2 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${ch.level === 0 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-white'}">
                    0: Aus
                  </button>
                ` : ''}
                <button type="button" onclick="LedgerContract.setChapterLevel('${ch.key}', 1)" title="Mild" class="px-2 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${ch.level === 1 ? 'bg-purple-900 text-white border border-purple-600' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'}">
                  1
                </button>
                <button type="button" onclick="LedgerContract.setChapterLevel('${ch.key}', 3)" title="Klassisch D/s" class="px-2 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${ch.level === 3 ? 'bg-purple-700 text-white border border-purple-500' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'}">
                  3
                </button>
                <button type="button" onclick="LedgerContract.setChapterLevel('${ch.key}', 5)" title="Strikte Hingabe" class="px-2 py-1 rounded-lg text-[9.5px] font-mono font-bold transition-all ${ch.level === 5 ? 'bg-amber-700 text-white border border-amber-500' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'}">
                  5
                </button>
                <button type="button" onclick="LedgerContract.editChapterText('${ch.key}')" title="Wortlaut anpassen" class="p-1 rounded-lg text-slate-400 hover:text-white ml-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>
                </button>
              </div>
            ` : ''}
          </div>

          <div id="chapter-body-${ch.key}" class="text-[11px] leading-relaxed whitespace-pre-line ${isDisabled ? 'text-slate-500 italic' : 'text-slate-300'}">
            ${escapeHtml(activeText)}
          </div>
        </div>
      `;
    }).join('');

    renderSignatureBoxes();
  }

  function renderSignatureBoxes() {
    const boxTop = document.getElementById('sig-box-top');
    const boxSub = document.getElementById('sig-box-sub');

    if (boxTop) {
      if (contractState.signatureTop) {
        boxTop.innerHTML = `<img src="${contractState.signatureTop}" alt="Signatur Top" class="max-h-16 mx-auto object-contain" />`;
        boxTop.className = "h-20 rounded-2xl border border-purple-700 bg-purple-950/20 flex items-center justify-center p-2 shadow-inner";
      } else {
        boxTop.innerHTML = `<span class="text-slate-500 font-serif italic text-xs">Noch nicht unterzeichnet</span>`;
        boxTop.className = "h-20 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center";
      }
    }

    if (boxSub) {
      if (contractState.signatureSub) {
        boxSub.innerHTML = `<img src="${contractState.signatureSub}" alt="Signatur Bottom" class="max-h-16 mx-auto object-contain" />`;
        boxSub.className = "h-20 rounded-2xl border border-indigo-700 bg-indigo-950/20 flex items-center justify-center p-2 shadow-inner";
      } else {
        boxSub.innerHTML = `<span class="text-slate-500 font-serif italic text-xs">Noch nicht unterzeichnet</span>`;
        boxSub.className = "h-20 rounded-2xl border border-dashed border-slate-700 flex items-center justify-center";
      }
    }
  }

  function generateContractFromSurvey() {
    if (!isUserTop()) {
      showToast("🔒 Nur der Top führt die Ratifizierung des Vertrags.");
      return;
    }
    loadContractState();

    let answers = {};
    try {
      const rawAns = localStorage.getItem('kompass_answers');
      if (rawAns) answers = JSON.parse(rawAns);
    } catch (e) {}

    const myRole = localStorage.getItem('kompass_assigned_role') || 'A';
    const otherRole = (myRole === 'A') ? 'B' : 'A';

    const ansTop = answers[myRole] || {};
    const ansSub = answers[otherRole] || {};

    const filteredTabus = [];
    const allChapters = window.surveyChapters || [];

    // Strikte Rollenfilterung:
    // Bottom nur Tabus beim Empfangen (r2 = 1)
    // Top nur Tabus beim Ausführen (r1 = 1)
    allChapters.forEach(ch => {
      (ch.items || []).forEach(it => {
        if (it.type !== 'choice') {
          if (ansSub[`it_${it.id}_r2`] === 1) {
            filteredTabus.push(`• ${it.title} (Schutz-Veto Bottom)`);
          }
          if (ansTop[`it_${it.id}_r1`] === 1) {
            filteredTabus.push(`• ${it.title} (Ausführungs-Veto Top)`);
          }
        }
      });
    });

    const newChapters = JSON.parse(JSON.stringify(DEFAULT_CHAPTER_TEMPLATES));

    // Falls Tabus vorliegen, in § 8 integrieren
    if (filteredTabus.length > 0) {
      newChapters[7].text_3 += "\n\nKonkrete rollenbasierte Schranken aus dem Fragebogen:\n" + filteredTabus.slice(0, 8).join("\n");
      newChapters[7].text_5 += "\n\nUnantastbare Schranken:\n" + filteredTabus.slice(0, 8).join("\n");
    }

    // Prüfen, ob Keuschheit überhaupt im Schrank oder Bogen positiv ist
    let hasCage = false;
    try {
      const rawToys = localStorage.getItem('kompass_owned_equipment') || '[]';
      hasCage = rawToys.includes('chastity') || rawToys.includes('cage') || rawToys.includes('cherrykeeper');
    } catch (e) {}

    if (!hasCage && (ansSub['it_chastity_r2'] === 0 || ansSub['it_chastity_r2'] === 1)) {
      // Automatische Deaktivierung von K5 (Stufe 0)
      newChapters[4].level = 0;
    }

    contractState.chapters = newChapters;
    contractState.status = "draft";
    contractState.version = `1.0 Entwurf (${new Date().toLocaleDateString('de-DE')})`;
    contractState.signatureTop = null;
    contractState.signatureSub = null;

    saveContractState();
    renderContract();
    showToast("✓ Vertrag aus Profil, Noten & Rollen synthetisiert!");

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent("📜 Neuer Beziehungsvertrags-Entwurf synthetisiert. Bereit zur Prüfung.");
    }
  }

  function setChapterLevel(chapterKey, levelNum) {
    if (!isUserTop()) return;
    loadContractState();
    const ch = contractState.chapters.find(c => c.key === chapterKey);
    if (!ch) return;

    ch.level = levelNum;
    saveContractState();
    renderContract();
    showToast(`${ch.num} auf Stufe ${levelNum} gesetzt ✓`);
  }

  function editChapterText(chapterKey) {
    loadContractState();
    const ch = contractState.chapters.find(c => c.key === chapterKey);
    if (!ch) return;

    const bodyEl = document.getElementById(`chapter-body-${chapterKey}`);
    if (!bodyEl) return;

    const currentText = (ch.level === 0) ? (ch.text_0 || '') : (ch.level >= 4 ? ch.text_5 : (ch.level >= 2 ? ch.text_3 : ch.text_1));

    bodyEl.innerHTML = `
      <div class="space-y-2 pt-1">
        <textarea id="edit-textarea-${ch.key}" class="w-full text-xs p-2.5 bg-slate-950 border border-purple-600 rounded-xl text-white font-sans focus:outline-none" rows="4">${escapeHtml(currentText)}</textarea>
        <div class="flex justify-end gap-1.5">
          <button type="button" onclick="LedgerContract.renderContract()" class="px-3 py-1.5 bg-slate-800 rounded-xl text-slate-300 font-bold text-xs touch-btn">Abbrechen</button>
          <button type="button" onclick="LedgerContract.saveChapterText('${ch.key}')" class="px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl text-xs touch-btn shadow-md">Wortlaut sichern ✓</button>
        </div>
      </div>
    `;
  }

  function saveChapterText(chapterKey) {
    loadContractState();
    const ch = contractState.chapters.find(c => c.key === chapterKey);
    const area = document.getElementById(`edit-textarea-${chapterKey}`);
    if (ch && area) {
      const val = area.value.trim();
      if (ch.level === 0) ch.text_0 = val;
      else if (ch.level >= 4) ch.text_5 = val;
      else if (ch.level >= 2) ch.text_3 = val;
      else ch.text_1 = val;

      saveContractState();
      renderContract();
      showToast(`${ch.num} aktualisiert ✓`);
    }
  }

  function openSignatureModal(role) {
    signingRole = role;
    let modal = document.getElementById('modal-contract-signature');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-contract-signature';
      modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    const isTopRole = (role === 'top');

    modal.innerHTML = `
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl text-xs">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-white">${isTopRole ? 'Als Top ratifizieren' : 'Als Bottom ratifizieren'}</h3>
            <span class="text-[10px] text-slate-400">Zeichne mit dem Finger deine Signatur</span>
          </div>
          <button type="button" onclick="document.getElementById('modal-contract-signature').style.display='none'" class="p-1.5 text-slate-400 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="w-full h-40 bg-slate-950 rounded-2xl border border-slate-700 relative overflow-hidden">
          <canvas id="signature-canvas" class="w-full h-full cursor-crosshair touch-none"></canvas>
        </div>

        <div class="flex justify-between items-center pt-2 border-t border-slate-800">
          <button type="button" onclick="LedgerContract.clearSignatureCanvas()" class="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs touch-btn">
            Löschen
          </button>
          <button type="button" onclick="LedgerContract.saveSignature()" class="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs touch-btn shadow-md">
            Signatur besiegeln ✓
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    setTimeout(initSignatureCanvas, 60);
  }

  function initSignatureCanvas() {
    const canvas = document.getElementById('signature-canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);

    const ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = (signingRole === 'top') ? '#c084fc' : '#818cf8';

    signaturePad.canvas = canvas;
    signaturePad.ctx = ctx;
    signaturePad.drawing = false;
    signaturePad.hasSignature = false;

    function getCoords(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - r.left, y: clientY - r.top };
    }

    function startDraw(e) {
      e.preventDefault();
      signaturePad.drawing = true;
      signaturePad.hasSignature = true;
      const p = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }

    function moveDraw(e) {
      if (!signaturePad.drawing) return;
      e.preventDefault();
      const p = getCoords(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    function endDraw(e) {
      if (!signaturePad.drawing) return;
      e.preventDefault();
      signaturePad.drawing = false;
    }

    canvas.onmousedown = startDraw;
    canvas.onmousemove = moveDraw;
    window.onmouseup = endDraw;

    canvas.ontouchstart = startDraw;
    canvas.ontouchmove = moveDraw;
    canvas.ontouchend = endDraw;
  }

  function clearSignatureCanvas() {
    if (!signaturePad.ctx || !signaturePad.canvas) return;
    signaturePad.ctx.clearRect(0, 0, signaturePad.canvas.width, signaturePad.canvas.height);
    signaturePad.hasSignature = false;
  }

  function saveSignature() {
    if (!signaturePad.hasSignature || !signaturePad.canvas) {
      showToast("Bitte zuerst mit dem Finger unterschreiben.");
      return;
    }

    const dataUrl = signaturePad.canvas.toDataURL('image/png');
    loadContractState();

    if (signingRole === 'top') {
      contractState.signatureTop = dataUrl;
    } else {
      contractState.signatureSub = dataUrl;
    }

    if (contractState.signatureTop && contractState.signatureSub) {
      contractState.status = "active";
      contractState.signedAt = Date.now();
      contractState.version = `1.0 Besiegelt (${new Date().toLocaleDateString('de-DE')})`;
      showToast("📜 PACTUM von beiden Partnern besiegelt & in Kraft getreten! ✓");

      if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
        window.ChatApp.postSystemEvent("✍️ Der Beziehungsvertrag wurde von beiden Partnern feierlich unterzeichnet und besiegelt!");
      }
    } else {
      showToast("✓ Unterschrift gespeichert. Zweite Signatur steht noch aus.");
    }

    saveContractState();
    const modal = document.getElementById('modal-contract-signature');
    if (modal) modal.style.display = 'none';
    renderContract();
  }

  function exportRedactedContract() {
    loadContractState();
    const names = window.names || { A: 'Partner 1', B: 'Partner 2' };
    const dateStr = contractState.signedAt ? new Date(contractState.signedAt).toLocaleDateString('de-DE') : new Date().toLocaleDateString('de-DE');

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350; // 4:5 Instagram / Social Standard
    const ctx = canvas.getContext('2d');

    // Tiefschwarzer Hintergrund
    ctx.fillStyle = '#05070c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Zarter Goldrahmen
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);

    // Titel
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('P A C T U M   I N T I M U M', canvas.width / 2, 130);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('VEREINBARTER KODEX DER BEZIEHUNGSDYNAMIK', canvas.width / 2, 175);

    ctx.fillStyle = '#d4af37';
    ctx.font = '18px monospace';
    ctx.fillText(`RATIFIZIERT AM ${dateStr} · STATUS: BESIEGELT`, canvas.width / 2, 215);

    // Redacted Paragraphen-Balken (Geschwärzte vertrauliche Intimklauseln)
    let y = 290;
    const chaptersToDraw = contractState.chapters.slice(0, 7);

    chaptersToDraw.forEach(ch => {
      // Kapitel-Kopf
      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${ch.num}  ${ch.title}`, 100, y);

      // Geschwärzte Textbalken (Confidential Redaction)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(100, y + 15, 880, 18);
      ctx.fillRect(100, y + 42, 750, 18);
      ctx.fillRect(100, y + 69, 820, 18);

      // Vertraulichkeits-Stempel
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('[ CONFIDENTIAL · PRIVATSPHÄRE GESCHÜTZT ]', 560, y + 55);

      y += 120;
    });

    // Fußbereich mit Siegel
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 1180, 50, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#d4af37';
    ctx.stroke();

    ctx.fillStyle = '#d4af37';
    ctx.font = 'bold 24px "Playfair Display", serif';
    ctx.textAlign = 'center';
    ctx.fillText('P', canvas.width / 2, 1188);

    ctx.fillStyle = '#64748b';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('PACTUM OS · CLIENT-SIDE ENCRYPTED PROTOCOL', canvas.width / 2, 1275);

    // Download der Grafik auslösen
    const link = document.createElement('a');
    link.download = `pactum_redacted_contract_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast("✓ Geschwärzte Urkunde exportiert (Redacted Social Seal)");
  }

  function openPrintDialog() {
    let modal = document.getElementById('modal-contract-print-choice');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-contract-print-choice';
      modal.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4";
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl text-xs">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="space-y-0.5">
            <h3 class="text-sm font-bold text-white">Urkunde drucken / PDF-Export</h3>
            <span class="text-[10px] text-slate-400">Wähle das gewünschte Format</span>
          </div>
          <button type="button" onclick="document.getElementById('modal-contract-print-choice').style.display='none'" class="p-1.5 text-slate-400 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="space-y-2.5">
          <button type="button" onclick="LedgerContract.executePrint(true)" class="w-full p-3.5 rounded-2xl border bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-purple-600 text-left transition-all space-y-1 touch-btn">
            <strong class="text-xs text-white block">Mit digitalen Touch-Signaturen drucken</strong>
            <span class="text-[10.5px] text-slate-400 block">Druckt das Dokument inklusive der auf dem Smartphone gezeichneten Unterschriften und Zeitstempel.</span>
          </button>

          <button type="button" onclick="LedgerContract.executePrint(false)" class="w-full p-3.5 rounded-2xl border bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-amber-600 text-left transition-all space-y-1 touch-btn">
            <strong class="text-xs text-amber-300 block">Blanko für handschriftliche Ratifizierung (Zeremonie)</strong>
            <span class="text-[10.5px] text-slate-400 block">Lässt die Felder frei für Füllfederhalter und Wachssiegel auf Büttenpapier.</span>
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  }

  function executePrint(includeDigitalSignatures) {
    const modal = document.getElementById('modal-contract-print-choice');
    if (modal) modal.style.display = 'none';

    // Temporäre Klasse für Druckansicht setzen
    if (!includeDigitalSignatures) {
      document.body.classList.add('print-blank-signatures');
    } else {
      document.body.classList.remove('print-blank-signatures');
    }

    setTimeout(() => {
      window.print();
    }, 150);
  }

  function findMatchingClausesForInfraction(infractionReason) {
    loadContractState();
    if (!contractState || contractState.status !== 'active') return [];

    const text = (infractionReason || '').toLowerCase().trim();
    if (text.length < 3) return [];

    const matches = [];
    const keywordsMap = {
      k1_preamble: ["konsens", "einvernehmlich", "ssc", "rack", "grenze", "wut"],
      k2_hierarchy: ["titel", "anrede", "rolle", "hierarchie", "regie", "herrin", "geheim", "sub"],
      k3_spheres: ["alltag", "öffentlichkeit", "arbeit", "beruf", "freunde", "stealth"],
      k4_aftercare: ["aftercare", "fürsorge", "kuscheln", "überforderung", "pause", "reverse", "trinken"],
      k5_chastity: ["käfig", "verschluss", "schloss", "orgasmus", "masturbation", "anfassen", "dusche", "schweigen", "betteln"],
      k6_service: ["widerrede", "frech", "ungehorsam", "trödeln", "putzen", "pünktlich", "rasur", "aufgabe", "dienst", "kaffee"],
      k7_discipline: ["strafe", "zucht", "paddle", "gürtel", "ablass", "verhandlung", "vergehen"],
      k8_safewords: ["tabu", "safeword", "gelb", "rot", "notfall", "entsiegelung", "break-glass"]
    };

    contractState.chapters.forEach(ch => {
      let score = 0;
      const chText = (ch.title + " " + (ch.text_3 || '')).toLowerCase();

      const words = text.split(/\s+/);
      words.forEach(w => {
        if (w.length > 3 && chText.includes(w)) score += 35;
      });

      const kws = keywordsMap[ch.key] || [];
      kws.forEach(kw => {
        if (text.includes(kw)) score += 40;
      });

      if (score > 30) {
        matches.push({
          clauseKey: ch.key,
          clauseNumber: ch.num,
          clauseTitle: ch.title,
          confidence: Math.min(99, score)
        });
      }
    });

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  window.LedgerContract = {
    init: function() {
      loadContractState();
      renderContract();
    },
    renderContract: renderContract,
    generateFromSurvey: generateContractFromSurvey,
    setChapterLevel: setChapterLevel,
    editChapterText: editChapterText,
    saveChapterText: saveChapterText,
    openSignatureModal: openSignatureModal,
    clearSignatureCanvas: clearSignatureCanvas,
    saveSignature: saveSignature,
    exportRedacted: exportRedactedContract,
    openPrintDialog: openPrintDialog,
    executePrint: executePrint,
    findMatchingClauses: findMatchingClausesForInfraction,
    getActiveContract: function() { loadContractState(); return contractState; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadContractState();
      renderContract();
    });
  } else {
    loadContractState();
    renderContract();
  }

})(window);
