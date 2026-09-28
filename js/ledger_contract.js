/**
 * js/ledger_contract.js
 * Modul für den Dynamischen Beziehungs- & Sklavenvertrag, rollenabhängigen Tabuschutz,
 * digitale Touchscreen-Signaturen und den Paragraphen-Assistenten.
 * 
 * Beinhaltet:
 * - Automatische Generierung aus Fragebogen-Noten & Synergien
 * - Rollenabhängige Tabu-Filterung (§ 5: Bottom nur r2=1, Top nur r1=1)
 * - Editierbarer Draft-Modus mit Klausel-Verwaltung (§ 1 bis § 7)
 * - Touch-Signatur-Canvas für beide Partner
 * - Paragraphen-Suchassistent für Bestrafungen
 * - Keine Verwendung von alert() oder confirm()
 */

(function(window) {
  'use strict';

  var DEFAULT_CLAUSES = [
    {
      id: "sec_1",
      number: "§ 1",
      title: "Präambel & Einvernehmlichkeit (Konsens)",
      content: "Beide Partner treten vollkommen freiwillig und im Vollbesitz ihrer geistigen Kräfte in dieses Abkommen ein. Das Spiel mit Macht, Disziplin und Hingabe dient der Vertiefung der Intimität und folgt ausnahmslos den ethischen Prinzipien von Safe, Sane & Consensual (SSC) sowie RACK. Echte Bosheit, Alltagszorn oder Gefährdung der Gesundheit sind ausgeschlossen."
    },
    {
      id: "sec_2",
      number: "§ 2",
      title: "Rollen, Titel & Hierarchie",
      content: "Die Leitung und Regie der Dynamik obliegt dem Top. Der Bottom erkennt diese Autorität mit aufrichtiger Hingabe an. Im privaten Raum und während verabredeter Spielzeiten gilt die vereinbarte Hierarchie. Im Berufs- und Alltagsleben nach außen wird absolute Diskretion gewahrt (Stealth-Prinzip)."
    },
    {
      id: "sec_3",
      number: "§ 3",
      title: "Pflichten & Dienstbarkeit des Bottoms",
      content: "Abs. 1: Anweisungen und Direktiven des Tops sind ohne Widerrede und pünktlich zu befolgen.\nAbs. 2: Der Bottom hält Körper und Intimbereich stets gepflegt und sauber rasiert.\nAbs. 3: Häusliche Dienste, Massagen und Pflichten aus dem D/s-Ledger werden sorgfältig und andächtig erfüllt."
    },
    {
      id: "sec_4",
      number: "§ 4",
      title: "Fürsorge, Schutz & Aftercare-Garantie",
      content: "Der Top verpflichtet sich zu aufmerksamer Führung und empathischer Beobachtung von Atmung, Durchblutung und Belastungsgrenzen. Nach jeder intensiven Session oder Disziplinierung garantiert der Top mindestens 15 Minuten ununterbrochene Aftercare: feste Umarmung, warme Decken, Flüssigkeitszufuhr und emotionale Geborgenheit zur Abwendung eines Subdrops."
    },
    {
      id: "sec_5",
      number: "§ 5",
      title: "Unverletzliche Tabus & Veto-Schranken",
      content: "Die im Fragebogen festgelegten Grenzen sind absolut unverletzlich. Das Safeword-Ampelsystem (Grün = Weiter, Gelb = Drosseln, Rot = Sofortiger Stillstand) sowie das Klopfsignal bei Knebelung beenden jede Handlung augenblicklich und ausnahmslos."
    },
    {
      id: "sec_6",
      number: "§ 6",
      title: "Keuschheit, Orgasmen & Schlüsselgewalt",
      content: "Abs. 1: Das Genital des Bottoms unterliegt der Schlüsselgewalt des Tops. Jeder Orgasmus ist ein seltenes Privileg und bedarf der vorherigen Erlaubnis.\nAbs. 2: Das unerlaubte Berühren, Manipulieren oder eigenständige Abnehmen des Verschlusses gilt als schwerer Vertrauensbruch.\nAbs. 3: Pflege- und Duschpausen erfolgen nach dem festgelegten Zeitprotokoll."
    },
    {
      id: "sec_7",
      number: "§ 7",
      title: "Disziplinierung, Verhandlung & Gültigkeit",
      content: "Regelverstöße werden fair nach dem Strafenkatalog des Ledgers gesühnt. Der Bottom darf demütig um Verhandlung und Ablass durch Punkteopfer bitten. Dieser Vertrag gilt für 30 Tage und wird danach gemeinsam ausgewertet."
    }
  ];

  var contractState = null;
  var signingRole = 'top';
  var signaturePad = {
    canvas: null,
    ctx: null,
    drawing: false,
    hasSignature: false
  };

  function loadContractState() {
    try {
      var raw = localStorage.getItem('kompass_contract_state');
      if (raw) contractState = JSON.parse(raw);
    } catch (e) {}

    if (!contractState || typeof contractState !== 'object') {
      contractState = {
        version: "1.0 Draft",
        status: "draft",
        clauses: JSON.parse(JSON.stringify(DEFAULT_CLAUSES)),
        signatureTop: null,
        signatureSub: null,
        signedAt: null
      };
    }
    if (!Array.isArray(contractState.clauses)) {
      contractState.clauses = JSON.parse(JSON.stringify(DEFAULT_CLAUSES));
    }
  }

  function saveContractState(skipSync) {
    if (!contractState) return;
    try {
      localStorage.setItem('kompass_contract_state', JSON.stringify(contractState));
    } catch (e) {}
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

  function showToast(msg) {
    var c = document.getElementById('toast-container');
    if (!c) return;
    var el = document.createElement('div');
    el.className = "bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 transition-all pointer-events-auto transform translate-y-2 opacity-0";
    el.innerText = msg;
    c.appendChild(el);
    setTimeout(function() { el.classList.remove('translate-y-2', 'opacity-0'); }, 10);
    setTimeout(function() {
      el.classList.add('opacity-0');
      setTimeout(function() { el.remove(); }, 300);
    }, 2800);
  }

  function isUserTop() {
    if (window.LedgerApp && typeof window.LedgerApp.isTop === 'function') {
      return window.LedgerApp.isTop();
    }
    return true;
  }

  function renderContract() {
    loadContractState();
    var container = document.getElementById('contract-clauses-container');
    if (!container) return;

    var isTop = isUserTop();
    var isDraft = (contractState.status === 'draft');

    var statusLbl = document.getElementById('contract-status-label');
    var verLbl = document.getElementById('contract-version-label');
    if (statusLbl) {
      statusLbl.innerText = isDraft ? "Status: Entwurf (Editierbar)" : "Status: Verbindlich Besiegelt ✓";
      statusLbl.className = isDraft ? "text-amber-400 font-bold" : "text-emerald-400 font-bold";
    }
    if (verLbl) verLbl.innerText = contractState.version || "Version 1.0";

    container.innerHTML = contractState.clauses.map(function(cl) {
      return `
        <div class="theme-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2 shadow-xs" id="clause-card-${cl.id}">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono font-bold text-xs border border-amber-800">${escapeHtml(cl.number)}</span>
              <strong class="text-xs text-white">${escapeHtml(cl.title)}</strong>
            </div>
            ${isDraft && isTop ? `
              <div class="flex items-center gap-1">
                <button type="button" onclick="LedgerContract.editClause('${cl.id}')" class="px-2 py-1 rounded-lg theme-panel border text-slate-300 hover:text-white text-[10px] font-bold touch-btn">✏️ Text</button>
                <button type="button" onclick="LedgerContract.deleteClause('${cl.id}')" class="px-2 py-1 rounded-lg text-slate-500 hover:text-rose-400 text-[10px] font-bold touch-btn">✕</button>
              </div>
            ` : ''}
          </div>
          <div id="clause-body-${cl.id}" class="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line">
            ${escapeHtml(cl.content)}
          </div>
        </div>
      `;
    }).join('');

    renderSignatureBoxes();
  }

  function renderSignatureBoxes() {
    var boxTop = document.getElementById('sig-box-top');
    var boxSub = document.getElementById('sig-box-sub');

    if (boxTop) {
      if (contractState.signatureTop) {
        boxTop.innerHTML = `<img src="${contractState.signatureTop}" alt="Signatur Top" class="max-h-16 mx-auto object-contain">`;
        boxTop.className = "h-20 rounded-xl border border-brand-700 bg-brand-950/20 flex items-center justify-center p-1 shadow-inner";
      } else {
        boxTop.innerHTML = `<span class="text-slate-500 font-serif italic text-xs">Noch nicht unterzeichnet</span>`;
        boxTop.className = "h-20 rounded-xl border border-dashed border-slate-700 flex items-center justify-center";
      }
    }

    if (boxSub) {
      if (contractState.signatureSub) {
        boxSub.innerHTML = `<img src="${contractState.signatureSub}" alt="Signatur Bottom" class="max-h-16 mx-auto object-contain">`;
        boxSub.className = "h-20 rounded-xl border border-indigo-700 bg-indigo-950/20 flex items-center justify-center p-1 shadow-inner";
      } else {
        boxSub.innerHTML = `<span class="text-slate-500 font-serif italic text-xs">Noch nicht unterzeichnet</span>`;
        boxSub.className = "h-20 rounded-xl border border-dashed border-slate-700 flex items-center justify-center";
      }
    }
  }

  function generateContractFromSurvey() {
    if (!isUserTop()) {
      showToast("🔒 Nur der Keyholder kann den Vertrag generieren.");
      return;
    }
    loadContractState();

    var rawAnswers = localStorage.getItem('kompass_answers');
    var rawLedger = localStorage.getItem('kompass_ledger_state');
    var answers = rawAnswers ? JSON.parse(rawAnswers) : (window.answers || { A: {}, B: {} });
    var ledgerState = rawLedger ? JSON.parse(rawLedger) : { keyholder: 'A', cagedPartner: 'B' };

    var topRole = ledgerState.keyholder || 'A';
    var subRole = ledgerState.cagedPartner || 'B';

    var ansTop = answers[topRole] || {};
    var ansSub = answers[subRole] || {};

    var allChapters = window.surveyChapters || [];
    var filteredTabus = [];

    // Strikte Rollenfilterung:
    // 1. Beim Bottom NUR Tabus beim Empfangen (r2 = 1)
    // 2. Beim Top NUR Tabus beim Ausführen (r1 = 1)
    allChapters.forEach(function(ch) {
      (ch.items || []).forEach(function(it) {
        if (it.type !== 'choice') {
          if (ansSub['it_' + it.id + '_r2'] === 1) {
            filteredTabus.push("• " + it.title + " (Schutz-Veto Keuschling)");
          }
          if (ansTop['it_' + it.id + '_r1'] === 1) {
            filteredTabus.push("• " + it.title + " (Ausführungs-Limit Keyholder)");
          }
        }
      });
    });

    var tabuClauseContent = DEFAULT_CLAUSES[4].content;
    if (filteredTabus.length > 0) {
      tabuClauseContent += "\n\nKonkrete rollenbasierte Schranken aus dem Bogen:\n" + filteredTabus.slice(0, 10).join("\n");
    }

    var newClauses = JSON.parse(JSON.stringify(DEFAULT_CLAUSES));
    newClauses[4].content = tabuClauseContent;

    var hw = ledgerState.hardware || 'penis_micro';
    var hwLabels = {
      penis_curved: 'Ergonomic Curved Peniskäfig',
      penis_micro: 'Cherrykeeper Micro Stub (<= 35mm)',
      penis_flat: 'Flat Shield Keuschheitsschild',
      penis_inverted: 'Inverted Negativ-Käfig',
      female_belt: 'Weiblicher Keuschheitsgürtel'
    };
    newClauses[5].content = newClauses[5].content.replace('des Verschlusses', 'des Verschlusses (' + (hwLabels[hw] || 'Keuschheitskäfig') + ')');

    contractState.clauses = newClauses;
    contractState.status = "draft";
    contractState.version = "1.0 Draft (" + new Date().toLocaleDateString('de-DE') + ")";
    contractState.signatureTop = null;
    contractState.signatureSub = null;

    saveContractState();
    renderContract();
    showToast("✨ Vertrag aus Bogen & Rollen generiert!");

    if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
      window.ChatApp.postSystemEvent("📜 Neuer D/s-Vertragsentwurf aus Fragebogen-Noten generiert. Bereit zur Prüfung.");
    }
  }

  function openSignatureModal(role) {
    signingRole = role;
    var titleEl = document.getElementById('sig-modal-title');
    if (titleEl) {
      titleEl.innerText = (role === 'top') ? "Als Keyholder / Top signieren" : "Als Keuschling / Bottom signieren";
    }

    var modal = document.getElementById('modal-contract-signature');
    if (modal) modal.style.display = 'flex';

    setTimeout(initSignatureCanvas, 100);
  }

  function initSignatureCanvas() {
    var canvas = document.getElementById('signature-canvas');
    if (!canvas) return;

    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);

    var ctx = canvas.getContext('2d');
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = (signingRole === 'top') ? '#f43f5e' : '#6366f1';

    signaturePad.canvas = canvas;
    signaturePad.ctx = ctx;
    signaturePad.drawing = false;
    signaturePad.hasSignature = false;

    function getCoords(e) {
      var r = canvas.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - r.left, y: clientY - r.top };
    }

    function startDraw(e) {
      e.preventDefault();
      signaturePad.drawing = true;
      signaturePad.hasSignature = true;
      var p = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }

    function moveDraw(e) {
      if (!signaturePad.drawing) return;
      e.preventDefault();
      var p = getCoords(e);
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

    var dataUrl = signaturePad.canvas.toDataURL('image/png');
    loadContractState();

    if (signingRole === 'top') {
      contractState.signatureTop = dataUrl;
    } else {
      contractState.signatureSub = dataUrl;
    }

    if (contractState.signatureTop && contractState.signatureSub) {
      contractState.status = "active";
      contractState.signedAt = Date.now();
      contractState.version = "1.0 Besiegelt (" + new Date().toLocaleDateString('de-DE') + ")";
      showToast("📜 Vertrag von beiden Partnern besiegelt & in Kraft getreten! ✓");

      if (window.ChatApp && typeof window.ChatApp.postSystemEvent === 'function') {
        window.ChatApp.postSystemEvent("✍️ Der D/s-Beziehungsvertrag wurde von beiden Partnern feierlich unterzeichnet und besiegelt!");
      }
    } else {
      showToast("Unterschrift gespeichert. Zweite Signatur steht noch aus.");
    }

    saveContractState();
    closeModal('modal-contract-signature');
    renderContract();
  }

  function findMatchingClausesForInfraction(infractionReason) {
    loadContractState();
    if (!contractState || contractState.status !== 'active') {
      return [];
    }

    var text = (infractionReason || '').toLowerCase().trim();
    if (text.length < 3) return [];

    var matches = [];
    var keywordsMap = {
      "sec_1": ["konsens", "einvernehmlich", "ssc", "grenze", "wut"],
      "sec_2": ["titel", "anrede", "rolle", "hierarchie", "herrin", "geheim"],
      "sec_3": ["widerrede", "frech", "ungehorsam", "trödeln", "putzen", "pünktlich", "rasur", "aufgabe", "dienst"],
      "sec_4": ["aftercare", "fürsorge", "kuscheln", "überforderung", "pause"],
      "sec_5": ["tabu", "safeword", "gelb", "rot", "grenzüberschreitung"],
      "sec_6": ["käfig", "verschluss", "schloss", "orgasmus", "masturbation", "anfassen", "dusche", "pause"],
      "sec_7": ["ablass", "verhandlung", "streit", "strafe"]
    };

    contractState.clauses.forEach(function(cl) {
      var score = 0;
      var clText = (cl.title + " " + cl.content).toLowerCase();

      var words = text.split(/\s+/);
      words.forEach(function(w) {
        if (w.length > 3 && clText.indexOf(w) !== -1) score += 35;
      });

      var kws = keywordsMap[cl.id] || [];
      kws.forEach(function(kw) {
        if (text.indexOf(kw) !== -1) score += 40;
      });

      if (score > 30) {
        matches.push({
          clauseId: cl.id,
          clauseNumber: cl.number,
          clauseTitle: cl.title,
          confidence: Math.min(99, score)
        });
      }
    });

    return matches.sort(function(a, b) { return b.confidence - a.confidence; });
  }

  function editClause(clauseId) {
    loadContractState();
    var cl = contractState.clauses.find(function(c) { return c.id === clauseId; });
    if (!cl) return;

    var bodyEl = document.getElementById('clause-body-' + clauseId);
    if (!bodyEl) return;

    bodyEl.innerHTML = `
      <div class="space-y-2 pt-1">
        <textarea id="edit-content-${cl.id}" class="w-full text-xs p-2 bg-slate-900 border border-amber-600 rounded-xl text-white font-mono" rows="4">${escapeHtml(cl.content)}</textarea>
        <div class="flex justify-end gap-1.5">
          <button type="button" onclick="LedgerContract.renderContract()" class="px-2.5 py-1 theme-panel border rounded-lg text-slate-400 text-xs">Abbrechen</button>
          <button type="button" onclick="LedgerContract.saveEditedClause('${cl.id}')" class="px-3 py-1 bg-amber-700 text-white font-bold rounded-lg text-xs shadow-xs">Speichern ✓</button>
        </div>
      </div>
    `;
  }

  function saveEditedClause(clauseId) {
    loadContractState();
    var cl = contractState.clauses.find(function(c) { return c.id === clauseId; });
    var area = document.getElementById('edit-content-' + clauseId);
    if (cl && area) {
      cl.content = area.value.trim();
      saveContractState();
      renderContract();
      showToast("Klausel " + cl.number + " aktualisiert ✓");
    }
  }

  function deleteClause(clauseId) {
    loadContractState();
    contractState.clauses = contractState.clauses.filter(function(c) { return c.id !== clauseId; });
    saveContractState();
    renderContract();
    showToast("Klausel entfernt.");
  }

  function closeModal(id) {
    var m = document.getElementById(id);
    if (m) m.style.display = 'none';
  }

  window.LedgerContract = {
    renderContract: renderContract,
    generateFromSurvey: generateContractFromSurvey,
    openSignatureModal: openSignatureModal,
    clearSignatureCanvas: clearSignatureCanvas,
    saveSignature: saveSignature,
    findMatchingClauses: findMatchingClausesForInfraction,
    editClause: editClause,
    saveEditedClause: saveEditedClause,
    deleteClause: deleteClause,
    getActiveContract: function() { loadContractState(); return contractState; }
  };

  document.addEventListener('DOMContentLoaded', function() {
    renderContract();
  });

})(window);
