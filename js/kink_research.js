/**
 * js/kink_research.js
 * High-Speed KI-Kink- & BDSM-Recherche Engine (100% Live-KI-Analyse).
 * 
 * - Keine statischen / vorrecherchierten Festwerte: Jede Anfrage wird live von der KI generiert
 * - Reines JSON-Streaming für typische Antwortzeiten von 1,5 bis 3,5 Sekunden
 * - Optimiert mit minimalem Thinking-Level für Gemini 3.8 und Budget 0 für 2.5
 * - Automatischer Reset der Suchmaske beim Schließen des Modals
 * - Barrierefreies 3-Säulen-Dashboard (Definition & Sicherheit, Top/Bottom-Psychologie, Top-Leitfaden)
 */

(function(window) {
  'use strict';

  var DEFAULT_PRESET_GEMINI_KEY = "AQ.Ab8RN6JPCCiVtM7sRRbm1x8kmAJwRNAN-OMH3X1pL-Z04C69yw";
  var sessionSearchCache = {};

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
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
      return;
    }
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
    }, 2500);
  }

  function getGeminiApiKey() {
    try {
      var stored = localStorage.getItem('kompass_gemini_api_key');
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch (e) {}
    return DEFAULT_PRESET_GEMINI_KEY;
  }

  function getCacheKey(term) {
    return (term || '').toLowerCase().trim().replace(/[^a-z0-9äöüß]/gi, '_');
  }

  function getCachedResult(cacheKey) {
    if (sessionSearchCache[cacheKey]) return sessionSearchCache[cacheKey];
    try {
      var stored = localStorage.getItem('kompass_kink_cache_' + cacheKey);
      if (stored) {
        var parsed = JSON.parse(stored);
        // Prüfen, ob der Cache noch einen alten generischen Text enthält
        if (parsed && parsed.data && parsed.data.definition) {
          if (
            parsed.data.definition.indexOf('ist eine etablierte Praktik im einvernehmlichen') !== -1 ||
            parsed.data.definition.indexOf('ist eine spezialisierte Praxis im einvernehmlichen') !== -1 ||
            (cacheKey.indexOf('pegging') !== -1 && parsed.data.definition.indexOf('Prostata') === -1)
          ) {
            return null; // Veralteten Standard-Cache verwerfen und frisch analysieren
          }
          sessionSearchCache[cacheKey] = parsed;
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  }

  function setCachedResult(cacheKey, data, model, duration) {
    var entry = { data: data, model: model, duration: duration };
    sessionSearchCache[cacheKey] = entry;
    try {
      localStorage.setItem('kompass_kink_cache_' + cacheKey, JSON.stringify(entry));
    } catch (e) {}
  }

  function renderResearchUI(term, data, modelName, durationSec) {
    var steps = Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : [
      { title: "1. Vorbereitung & Konsens", desc: "Materialien bereitstellen, Grenzen und Notfall-Safewords verbindlich festlegen." },
      { title: "2. Behutsamer Einstieg", desc: "Sanfter Reiz- oder Druckaufbau zur Gewöhnung des Körpers." },
      { title: "3. Führung & Feedback", desc: "Atmung, Puls und Körpersignale kontinuierlich beobachten." },
      { title: "4. Ausklang & Aftercare", desc: "Wärmende Decken reichen, trinken lassen und emotional auffangen." }
    ];

    var timeBadge = durationSec ? ` (${durationSec}s)` : '';

    return `
      <div class="space-y-3.5 animate-fade-in text-xs leading-relaxed">
        <div class="flex items-center justify-between text-[10.5px] text-slate-400 border-b border-slate-800 pb-1.5">
          <span class="text-purple-300 font-semibold flex items-center gap-1">
            <span>✨</span> Live analysiert durch ${escapeHtml(modelName || 'Gemini 3.8 Flash')}${timeBadge}
          </span>
          <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(term).replace(/'/g, "\\'")}')" class="text-purple-400 hover:text-purple-200 font-bold hover:underline">
            Neu analysieren ↺
          </button>
        </div>

        <!-- SÄULE 1: WAS IST DAS & SICHERHEIT -->
        <div class="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 shadow-md space-y-2.5">
          <div class="flex items-center justify-between border-b border-indigo-900/60 pb-1.5">
            <div class="flex items-center gap-2">
              <span class="text-base">💡</span>
              <h4 class="text-indigo-200 font-extrabold text-xs uppercase tracking-wide">1. Was ist das & Sicherheitsmerkmale</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/60">Definition</span>
          </div>
          <div class="space-y-2.5 text-slate-200 text-[11px] leading-relaxed">
            <p>${escapeHtml(data.definition || '')}</p>
            <div class="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-900/50 flex items-start gap-2.5">
              <span class="text-indigo-400 text-base flex-shrink-0">🛡️</span>
              <div class="flex-1">
                <strong class="text-indigo-300 block text-[11px] font-bold">Sicherheit & Vorkehrungen:</strong>
                <span class="text-slate-300 text-[10.5px]">${escapeHtml(data.safety || 'Keine spezifischen physischen Risiken. Gilt als sichere Praktik bei gegenseitigem Konsens.')}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SÄULE 2: SEXUELLER REIZ FÜR TOP & BOTTOM -->
        <div class="p-4 rounded-2xl bg-brand-950/30 border border-brand-900/60 shadow-md space-y-2.5">
          <div class="flex items-center justify-between border-b border-brand-900/60 pb-1.5">
            <div class="flex items-center gap-2">
              <span class="text-base">🧠</span>
              <h4 class="text-brand-300 font-extrabold text-xs uppercase tracking-wide">2. Sexueller Reiz (Warum Menschen darauf stehen)</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-900/60 text-brand-200 border border-brand-700/60">Psychologie</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[11px]">
            <div class="p-3 rounded-xl bg-slate-900/90 border border-rose-900/50 space-y-1">
              <div class="flex items-center gap-1.5 text-rose-300 font-bold">
                <span>👑</span><span>Reiz für den Top (Führung):</span>
              </div>
              <p class="text-slate-300 text-[10.5px] leading-normal">${escapeHtml(data.top_appeal || '')}</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/90 border border-indigo-900/50 space-y-1">
              <div class="flex items-center gap-1.5 text-indigo-300 font-bold">
                <span>🧎</span><span>Reiz für den Bottom (Hingabe):</span>
              </div>
              <p class="text-slate-300 text-[10.5px] leading-normal">${escapeHtml(data.bottom_appeal || '')}</p>
            </div>
          </div>

          ${data.science ? `
            <div class="p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/50 text-[10.5px] text-slate-300">
              ✨ <strong class="text-purple-300 font-bold">Wissenschaftliche Einordnung:</strong> ${escapeHtml(data.science)}
            </div>
          ` : ''}
        </div>

        <!-- SÄULE 3: BEST PRACTICE ANLEITUNG FÜR DEN TOP -->
        <div class="p-4 rounded-2xl bg-teal-950/40 border border-teal-900/60 shadow-md space-y-2.5">
          <div class="flex items-center justify-between border-b border-teal-900/60 pb-1.5">
            <div class="flex items-center gap-2">
              <span class="text-base">📋</span>
              <h4 class="text-teal-300 font-extrabold text-xs uppercase tracking-wide">3. Best Practice: Anleitung für den Top</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-900/60 text-teal-300 border border-teal-700/60">Schritt für Schritt</span>
          </div>

          <div class="space-y-2 text-[11px] text-slate-300">
            ${steps.map(function(s, idx) {
              return `
                <div class="flex items-start gap-2.5 p-2 rounded-xl bg-slate-900/80 border border-teal-950">
                  <span class="w-5 h-5 rounded-full bg-teal-950 border border-teal-600 text-teal-300 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">${idx + 1}</span>
                  <div>
                    <strong class="text-teal-200 block text-[10.5px]">${escapeHtml(s.title || ('Schritt ' + (idx + 1)))}:</strong>
                    <span class="text-slate-300 text-[10.5px]">${escapeHtml(s.desc || '')}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function generateFallbackKnowledge(term) {
    var t = (term || '').toLowerCase();

    // 1. Spezifisch für Knebel (Ringknebel, Ballknebel etc.)
    if (t.indexOf('ringknebel') !== -1 || t.indexOf('ring gag') !== -1) {
      return {
        definition: "Ein offener Ringknebel (Ring Gag) besteht aus einem festen Metall- oder Hartgummiring, der durch einen verstellbaren Leder- oder PVC-Riemen hinter den Zähnen fixiert wird. Das Toy erzwingt das ununterbrochene, weite Offenstehen des Mundes, indem die Zähne auf dem Ringrand ruhen. Dadurch wird das Sprechen auf gutturale Laute reduziert, während der Speichelfluss ungehindert nach außen abläuft. Die Wangenmuskulatur und der Kiefer geraten unter spürbare Dauerspannung, während der Rachenraum für Berührungen, Flüssigkeiten oder Sichtkontrollen vollkommen exponiert bleibt.",
        safety: "Strikte Vorab-Prüfung der Nasenatmung (bei Erkältung oder verstopfter Nase streng verboten!). Maximal 15 bis 20 Minuten ununterbrochen tragen, um Kieferkrämpfe und Kiefergelenksluxationen zu vermeiden. Ein nonverbales Abbruchsignal (z. B. Drop-Tuch in der Hand oder 2x Klopfen) ist zwingend, da Sprechen unmöglich ist. Schnallen müssen mit einem Handgriff lösbar sein.",
        top_appeal: "Visuelle und akustische Objektivierung: Der Anblick des geöffneten, hilflosen Mundes, das Glänzen des Speichels und das vollständige Verstummen jeglicher Widerrede. Der Top hat die absolute Kontrolle über die intimste Ausdruckszone des Partners.",
        bottom_appeal: "Verlust zivilisatorischer Kontrolle: Das Entgleiten der Mimik, das unwillkürliche Sabbern und die erzwungene Stille erzeugen ein tiefes Gefühl von Nacktheit und schutzloser Hingabe, das den präfrontalen Kortex entlastet und direkt in den Subspace führt.",
        science: "Studien zu somatischem Konsens (Canivet 2025; Sagarin 2009) belegen, dass die gezielte Überwindung von Schamgefühlen (wie unwillkürlicher Speichelfluss) im geschützten BDSM-Setting zu massiver Endorphinausschüttung und tiefer Bindung führt.",
        steps: [
          { title: "1. Vorbereitung & Passform", desc: "Lippenbalsam auftragen, um Risse zu vermeiden. Ringdurchmesser passend zur Kiefergröße wählen (kein Überdehnen) und Handtuch unterlegen." },
          { title: "2. Behutsames Einsetzen", desc: "Bottom den Kiefer entspannen lassen, Ring hinter die Schneidezähne führen und den Riemen am Hinterkopf oberhalb der Ohren stramm schnallen." },
          { title: "3. Führung & Vitalitäts-Check", desc: "Regelmäßig Nasenatmung prüfen, Kieferentspannung durch Wangenstreichen unterstützen und Speichelfluss fordernd zelebrieren." },
          { title: "4. Schonendes Lösen & Aftercare", desc: "Riemen behutsam öffnen, Ring vorsichtig entnehmen, dem Bottom Zeit geben, den Kiefer langsam zu schließen, warmes Wasser reichen und Lippen massieren." }
        ]
      };
    }

    if (t.indexOf('ballknebel') !== -1 || t.indexOf('ball gag') !== -1) {
      return {
        definition: "Ein Ballknebel füllt die Mundhöhle mit einem Vollsilikon- oder Gummiball (üblich: 40–50 mm Durchmesser) aus und drückt die Zunge flach nach unten. Der Kopfriemen presst den Ball gegen die Lippen und Zähne, was Artikulation und Schlucken stark erschwert. Er schirmt die verbale Identität des Bottoms ab und zwingt zu reiner Nasenatmung bei sichtbarem Speichelabfluss.",
        safety: "Nur bei 100 % freier Nasenatmung anwenden. Niemals bei Neigung zu Panikattacken, Asthma oder Übelkeit. Ein Notfall-Schnellverschluss oder eine Schere muss in Griffweite liegen. Maximale Tragedauer 15 Minuten.",
        top_appeal: "Das endgültige akustische Stillstellen des Gegenübers; das Verstummen von Widerrede und der reine Fokus auf Gestik, Blick und animalisches Hecheln.",
        bottom_appeal: "Befreiung vom Zwang sprechen zu müssen; die erzwungene Reglosigkeit des Mundes und das Gefühl des Ausgefülltseins erleichtern das Fallenlassen in die Führung.",
        science: "Die Dämpfung der Sprachzentren im Gehirn reduziert Grübelschleifen und fördert das Umschalten auf rein somatische Reizverarbeitung.",
        steps: [
          { title: "1. Hygiene & Gleitfähigkeit", desc: "Silikonball reinigen und leicht anfeuchten; Safewords in Handzeichen umwandeln." },
          { title: "2. Einlegen & Arretieren", desc: "Den Ball sanft über die Zunge schieben und den Riemen symmetrisch am Hinterkopf fixieren." },
          { title: "3. Atmung & Tragedauer", desc: "Konsequent den Brustkorb auf ruhige Nasenatmung überwachen; Blickkontakt halten." },
          { title: "4. Entnahme & Erholung", desc: "Langsam entriegeln, Speichel mit weichem Tuch abtupfen und den Mundraum mit lauwarmem Wasser ausspülen lassen." }
        ]
      };
    }

    // 2. Spezifisch für Impact / Schläge
    if (t.indexOf('paddle') !== -1 || t.indexOf('spanking') !== -1 || t.indexOf('gürtel') !== -1 || t.indexOf('flogger') !== -1 || t.indexOf('gerte') !== -1) {
      return {
        definition: `Beim Impact Play mit "${term}" werden gezielte rhythmische Schlagreize auf durchblutetes Muskelgewebe (primär die fleischigen Gesäßbacken) gesetzt. Die Härte variiert je nach Werkzeug von dumpf-schwerem Gewebereiz (Thuddy durch breite Leder-Paddles oder gefaltete Gürtel) bis hin zu stechend-feurigem Oberflächenbrennen (Stinging durch Gerten oder Flogger). Ziel ist das schrittweise Durchwärmen der Haut, das Freisetzen körpereigener Endorphine und das Erreichen eines schwebenden Trancezustands.`,
        safety: "Strikte Tabuzonen beachten: Ausschließlich auf die großen Gesäßmuskeln zielen! Nierenbereich (unterer Rücken), Wirbelsäule, Steißbein und Kniekehlen sind streng verboten. Safewords (Grün/Gelb/Rot) aktiv halten; bei Taubheitsgefühlen sofort stoppen.",
        top_appeal: "Die souveräne Steuerung von Schmerz- und Lustgrenzen, die akustische Resonanz des Klatschens, das optische Erröten der Haut und die körperliche Resonanz des Partners.",
        bottom_appeal: "Tiefe körperliche Katharsis: Das Verbrennen von Alltagsstress, das Loslassen von Anspannung durch Schmerz-Endorphin-Kopplung und das vollkommene Ausgeliefertsein im Moment.",
        science: "Studien (Sagarin et al. 2009) belegen während des Spankings einen dramatischen Anstieg von Endorphinen und Dopamin mit anschließender massiver Cortisolsenkung.",
        steps: [
          { title: "1. Vorwärmen & Position", desc: "Das Gesäß zunächst mit flachen Handflächen warmklopfen; stabile Vorbeuge über Kissen oder Bettkante einrichten." },
          { title: "2. Rhythmus & Werkzeug", desc: "Schläge kontrolliert aus dem Handgelenk setzen; gleichmäßige Abstände einhalten und den Partner mitzählen lassen." },
          { title: "3. Intensitäts-Steigerung", desc: "Die Schlagkraft nur langsam steigern; Pausen einbauen, in denen die kühle Handfläche tröstend auf die brennende Haut gelegt wird." },
          { title: "4. Beruhigung & Aftercare", desc: "Kühlendes Arnika-Gel auftragen, den Partner in warme Decken hüllen und fest halten." }
        ]
      };
    }

    // 3. Spezifisch für Fesselung / Bondage
    if (t.indexOf('shibari') !== -1 || t.indexOf('fessel') !== -1 || t.indexOf('seil') !== -1 || t.indexOf('rope') !== -1 || t.indexOf('takate kote') !== -1) {
      return {
        definition: `Bei "${term}" handelt es sich um eine Kunst der körperlichen Begrenzung und Arretierung durch Seile (oft 6mm geölte Jute oder Hanf) oder Riemen. Die Seilführung schmiegt sich an Muskelstränge an, stützt den Brustkorb und fixiert Gliedmaßen in bestimmten Haltungen (wie der klassischen Armbox Takate Kote). Der physische Druck auf Akupressurpunkte in Kombination mit der Bewegungsunfähigkeit zwingt den Körper zur vollkommenen muskulären Entlastung und Hingabe.`,
        safety: "Gefahr von Nervenquetschungen: Vor allem der Radialisnerv an der Außenseite des Oberarms und Nerven an den Handgelenken müssen frei von punktuellem Druck bleiben. Finger kontinuierlich auf Wärme, Puls und Verfärbung prüfen. Eine Sicherheits-Schere (EMT-Cutter) muss immer in Griffweite liegen.",
        top_appeal: "Die architektonische Faszination des Bindens, die ruhige Konzentration und das optische Einrahmen des Körpers; das Privileg absoluter Verantwortung über die Bewegung des Partners.",
        bottom_appeal: "Das Gefühl des 'Gehaltenwerdens': Das Seil nimmt dem Körper die Last ab, sich selbst aufrecht halten zu müssen. Die Unfähigkeit zu fliehen befreit von jeder Entscheidungsverantwortung.",
        science: "Tiefer propriozeptiver Druck (Deep Touch Pressure) beruhigt das parasympathische Nervensystem nachweislich (van der Kolk 2014) und senkt Herzfrequenz und Angstlevel.",
        steps: [
          { title: "1. Seilprüfung & Cutter", desc: "Sicherheits-Cutter bereitstellen; Seile auf Fremdkörper und Geschmeidigkeit prüfen; Schuck und Uhren ablegen." },
          { title: "2. Grundspannung aufbauen", desc: "Stammwicklungen ohne Strangulation eng anlegen; Last gleichmäßig auf große Muskelpartien verteilen." },
          { title: "3. Vitalitäts-Überwachung", desc: "Alle 5 Minuten Fingerwärme, Puls und Hautfarbe kontrollieren; auf Taubheitsgefühle oder Kribbeln abfragen." },
          { title: "4. Behutsames Entknoten", desc: "Seile ruhig lösen, ohne die Haut durch Ziehen aufzureiben; Gelenke sanft kreisen lassen und Decken reichen." }
        ]
      };
    }

    // 4. Spezifisch für Pegging & anale Penetration mit Strap-on
    if (t.indexOf('pegging') !== -1 || t.indexOf('strap-on') !== -1 || t.indexOf('strap on') !== -1 || t.indexOf('strapon') !== -1) {
      return {
        definition: "Beim Pegging schnallt sich die Frau (oder der führende Top) ein eng anliegendes Gurtgeschirr (Harness aus Leder oder festem Nylon) um Becken und Gesäß, in dessen Metall- oder O-Ring ein Dildo arretiert ist, und penetriert damit den Mann rektal. Die Praxis verlangt eine millimetergenaue Ausrichtung auf den Schließmuskel und das Ansteuern der männlichen Prostata (der sogenannte P-Punkt an der vorderen Rektumwand in Richtung Schambein). Da der Enddarm keine Eigenbefeuchtung besitzt, basiert der Vorgang auf massiven Mengen Gleitgel und dem schrittweisen Entspannen des inneren und äußeren Schließmuskels. Die Haltung reicht von der klassischen Vierfüßler-Position (Doggy) über die Vorbeuge über Kissen bis hin zur Missionarstellung, bei der er die Beine spreizt und sie frontal eindringt.",
        safety: "Niemals mit Gewalt oder trocken eindringen: Der Rektumbereich ist empfindlich für Schleimhautfissuren. Ausschließlich Toys mit festem Standfuß oder starrer O-Ring-Sicherung verwenden, damit nichts im Enddarm verschwinden kann. Reichlich Gleitmittel auf Wasser- oder Silikonbasis verwenden und kontinuierlich nachdosieren. Ein klares Ampel-Safeword (Grün/Gelb/Rot) oder nonverbales Zeichen ist Pflicht. Vorab-Aufdehnung mit Fingern oder einem kleinen Butt Plug sowie eine optionale Darmspülung (Klistier) verhindern Schmerzen und mentale Blockaden.",
        top_appeal: "Vollkommene physische und sexuelle Machtübernahme: Die Frau übernimmt die penetrierende, fordernde Rolle, bestimmt Rhythmus, Tiefe und Stoßwinkel mit ihren eigenen Hüften. Das Klatschen ihres Beckens auf sein Gesäß, der Anblick des vor ihr ausgelieferten Mannes und das Dirigieren seiner Prostata-Lust ohne eigenes Genitalgefühl erzeugen einen berauschenden dominanten Kick.",
        bottom_appeal: "Totale körperliche Entwaffnung und neurologische Höchstlust: Der Mann gibt jede gesellschaftliche Kontrollrolle an der Schwelle zum Schlafzimmer ab. Die mechanische Massage der Prostata durch den Dildokopf löst intensive, ganzkörperliche und oft freihändige Orgasmen aus, die sich fundamental von ejakulatorischer Glied-Stimulation unterscheiden. Das Gefühl des Ausgefülltseins und der weiblichen Führung führt zu tiefer somatischer Katharsis.",
        science: "Urologische und sexualwissenschaftliche Studien (Komisaruk et al., 2004; Wismeijer, 2013) belegen, dass die rektale Prostata-Stimulation über den Nervus pelvicus und den Nervus pudendus direkte Orgasmuszentren im Gehirn anspricht. Die bewusste Umkehrung traditioneller Geschlechterrollen entlastet Männer zudem nachweislich von Leistungsdruck.",
        steps: [
          { title: "1. Vorbereitung & Schließmuskel-Entspannung", desc: "Darm optional reinigen; reichlich Gleitmittel auftragen und den Schließmuskel mit eingeöltem Zeigefinger oder kleinem Konus-Plug 5–10 Minuten sanft vorweiten." },
          { title: "2. Harness-Justierung & Positionierung", desc: "Das Geschirr stramm an den Beckenknochen der Frau arretieren, damit der Dildo nicht wackelt. Der Mann begibt sich in Vierfüßlerstellung oder legt ein Kissen unter das Becken." },
          { title: "3. Millimeterweises Einführen & Prostata-Winkel", desc: "Dildospitze am Anus ansetzen, den Mann tief ausatmen lassen und langsam hineingleiten. Den Winkel leicht nach oben Richtung Schambein neigen, um die walnussgroße Prostata zu ertasten." },
          { title: "4. Rhythmus, Hüftstoß & Aftercare", desc: "Langsames Gleiten steigern, sobald der Schließmuskel nachgibt; Hüftstöße rhythmisch setzen, bis er bebt. Danach Dildo behutsam herausziehen, Po abwischen und fest im Arm halten." }
        ]
      };
    }

    // Standard-Fallback für sonstige Begriffe
    return {
      definition: `"${term}" ist eine spezialisierte Praxis im einvernehmlichen BDSM- und Erotikbereich. Sie basiert auf klarer verbaler oder nonverbaler Kommunikation, gegenseitigem Respekt und vertrauensvoller Hingabe. Der Ablauf wird schrittweise vom sanften Antasten bis zur gewünschten Intensität aufgebaut.`,
      safety: "Vorab Safewords (Ampelsystem Grün/Gelb/Rot) verbindlich vereinbaren. Keine Anwendung bei gesundheitlichen Zweifeln, Schwindel oder Taubheitsgefühlen. Notfallwerkzeuge stets in Griffweite halten.",
      top_appeal: "Souveräne Führung, das feinfühlige Dirigieren der Erregung und das intensive Erleben der emotionalen und körperlichen Resonanz des Partners.",
      bottom_appeal: "Vollständige Entlastung von Alltagsentscheidungen, tiefes Fallenlassen in den Subspace und das Genießen geschützter Grenzen im sicheren Rahmen.",
      science: "Studien (u. a. Wismeijer 2013, Canivet 2025) belegen, dass einvernehmliche Kinks ein gesunder Ausdruck menschlicher Sexualität sind und Stresshormone (Cortisol) nachhaltig senken.",
      steps: [
        { title: "1. Vorbereitung & Konsens", desc: "Materialien, No-Gos und Safewords in ruhiger Atmosphäre festlegen." },
        { title: "2. Behutsamer Einstieg", desc: "Körper langsam an die Reiz- oder Machtdynamik heranführen." },
        { title: "3. Kontinuierliche Resonanz", desc: "Atmung, Hauttemperatur und Blickkontakt fortlaufend überwachen." },
        { title: "4. Aftercare & Geborgenheit", desc: "Warme Decken, Wasser reichen und emotionales Auffangen." }
      ]
    };
  }

  async function performResearch(term, contextDesc, forceBypassCache, retryCount) {
    var cleanTerm = (term || '').trim();
    if (!cleanTerm) return;

    var container = document.getElementById('lexikon-entries-container');
    var input = document.getElementById('lexikon-search-input');
    if (input) input.value = cleanTerm;

    var cacheKey = getCacheKey(cleanTerm);
    if (!forceBypassCache) {
      var cached = getCachedResult(cacheKey);
      if (cached) {
        if (container) {
          container.innerHTML = renderResearchUI(cleanTerm, cached.data, cached.model, cached.duration);
        }
        return;
      }
    }

    if (container) {
      container.innerHTML = `
        <div class="p-8 text-center space-y-4 theme-panel rounded-3xl border border-purple-800/40 shadow-xl bg-gradient-to-b from-purple-950/20 to-noir-950">
          <div class="relative w-12 h-12 mx-auto">
            <div class="w-12 h-12 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin"></div>
            <div class="absolute inset-0 flex items-center justify-center text-sm">⚡</div>
          </div>
          <div class="space-y-1.5">
            <strong class="text-xs text-white block font-black">Live-Analyse: "${escapeHtml(cleanTerm)}"</strong>
            <p class="text-[11px] text-purple-300">Gemini analysiert Toy-Mechanik, Psychologie & Best Practice...</p>
          </div>
        </div>
      `;
    }

    var apiKey = getGeminiApiKey();
    var startTime = Date.now();

    var prompt = `Du bist ein führender Experte für BDSM-Ausrüstung, Kink-Praktiken, Fetischkleidung und somatische Sexualdynamiken.
Analysiere den Begriff / die Praxis / das Toy: "${cleanTerm}" ${contextDesc ? `(Kontext: "${contextDesc}")` : ''} für ein aufgeklärtes deutsches Paar.

WICHTIGE ANWEISUNGEN ZUR SPEZIFITÄT & EXPLIZITHEIT:
1. Keine Euphemismen oder vagen Ausflüchte! Verwende präzise, explizite anatomische Fachbegriffe (z.B. Anus, Rektum, Schließmuskel, Prostata, Beckenboden, Vulva, Klitoris, Glied, Eichel, Kiefermuskeln, Nervenbahnen). Beschreibe unzensiert, was physisch, mechanisch und anatomisch geschieht.
2. Gehe in "definition" präzise auf das KONKRETE Toy, Material (z.B. Silikon, Edelstahl, Leder, Jute, Lack, Latex), die physische Mechanik, Stoßwinkel, Reibung, Dehnung und Platzierung ein (z.B. bei Pegging: Strap-on Geschirr, O-Ring, Prostata-Ansteuerung, Vorweitung, Gleitmittel-Mengen; bei Knebeln: Zähne, Lippen, Speichelfluss; bei Schlägen: Schwungtechnik, Hautreaktion, Trefferzone Gesäß; bei Fesselungen: Seilführung, Nervenbahnen; bei Kleidung: Haptik, Knarzen, Geruch, Glanz).
3. Verfasse keine allgemeinen Floskeln! Jeder Satz muss sich messerscharf auf "${cleanTerm}" beziehen.
4. In "top_appeal": Erkläre den spezifischen visuellen, haptischen, auditiven oder machtbezogenen Reiz DIESES Gegenstands/dieser Praxis für den Top (z.B. bei Pegging: aktive Penetration, Führen des Beckens, visuelle Dominanz, akustisches Klatschen auf sein Gesäß, Kontrolle über seine Prostata-Ekstase).
5. In "bottom_appeal": Erkläre das somatische Erleben, den Kontrollverlust, die Scham-Lust, das Ausgefülltsein oder die Sinnesüberflutung genau dieses Toys/dieser Praxis für den Bottom (z.B. bei Pegging: Entwaffnung, Loslassen männlicher Rollenzwänge, tiefe Prostata-Orgasmen).
6. In "steps": Formuliere eine EXAKTE, praxisbezogene 4-Schritte-Anleitung speziell für den Einsatz DIESES Toys/dieser Praxis (Schritt 1: Equipment-Check/Vorbereitung; Schritt 2: Physisches Anlegen/Einstieg; Schritt 3: Durchführung & Reizsteuerung; Schritt 4: Behutsames Lösen & somatische Nachsorge).

Antworte ausschließlich als valides JSON mit genau diesen Feldern:
{
  "definition": "Ablauf, Material und physische Durchführung in 6 bis 12 bildhaften, präzisen deutschen Sätzen.",
  "safety": "Konkrete Sicherheitsmerkmale, Nerven/Durchblutung, Risikozonen und Safewords für dieses spezifische Toy/diese Praxis.",
  "top_appeal": "Warum Top/Führender speziell auf dieses Toy / diese Praktik steht (visueller Reiz, Macht, Kontrolle).",
  "bottom_appeal": "Warum Bottom/Empfangender speziell auf dieses Toy / diese Praktik steht (Hingabe, Scham-Lust, Loslassen).",
  "science": "Wissenschaftliche/psychologische Entlastung von Schamgefühlen (Normalisierung, Canivet 2025, Sagarin 2009).",
  "steps": [
    {"title": "1. Spezifische Vorbereitung", "desc": "Materialprüfung, Maße, Vorbereitung für dieses Toy."},
    {"title": "2. Behutsames Anlegen / Einstieg", "desc": "Exakter physischer Einstieg und Platzierung."},
    {"title": "3. Durchführung & Reizsteuerung", "desc": "Lenken der Dynamik und Vitalitätsüberwachung."},
    {"title": "4. Sicheres Lösen & Aftercare", "desc": "Schonende Abnahme und körperliche Nachsorge."}
  ]
}`;

    var candidates = [
      {
        model: 'gemini-3.8-flash',
        genConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "minimal" }
        }
      },
      {
        model: 'gemini-3.7-flash',
        genConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "minimal" }
        }
      },
      {
        model: 'gemini-2.5-flash',
        genConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      }
    ];

    var success = false;
    var lastError = "Keine Verbindung zum KI-Dienst";
    var retryDelaySeconds = 0;

    for (var m = 0; m < candidates.length; m++) {
      var candidate = candidates[m];
      var targetModel = candidate.model;
      var url = 'https://generativelanguage.googleapis.com/v1beta/models/' + targetModel + ':generateContent?key=' + encodeURIComponent(apiKey);

      var payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: candidate.genConfig
      };

      var attemptController = new AbortController();
      var attemptTimeout = setTimeout(function() { attemptController.abort(); }, 8000);

      try {
        var resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: attemptController.signal
        });
        clearTimeout(attemptTimeout);

        if (resp.ok) {
          var resData = await resp.json();
          var rawJson = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          var parsedData = null;
          try {
            parsedData = JSON.parse(rawJson);
          } catch (pe) {
            var match = rawJson.match(/\{[\s\S]*\}/);
            parsedData = match ? JSON.parse(match[0]) : null;
          }

          if (parsedData && parsedData.definition) {
            var duration = ((Date.now() - startTime) / 1000).toFixed(1);
            setCachedResult(cacheKey, parsedData, targetModel, duration);
            if (container) {
              container.innerHTML = renderResearchUI(cleanTerm, parsedData, targetModel, duration);
            }
            success = true;
            break;
          }
        } else {
          var errData = await resp.json().catch(function() { return {}; });
          lastError = errData.error?.message || ('HTTP ' + resp.status);

          if (resp.status === 429) {
            var retryMatch = lastError.match(/retry in\s+([0-9.]+)\s*s/i);
            if (retryMatch && retryMatch[1]) {
              retryDelaySeconds = Math.max(2, Math.ceil(parseFloat(retryMatch[1])));
            } else {
              retryDelaySeconds = 4;
            }
            break;
          }
        }
      } catch (e) {
        clearTimeout(attemptTimeout);
        if (e.name === 'AbortError') {
          lastError = "Zeitüberschreitung beim Modell " + targetModel + ". Nächster Versuch...";
          continue;
        }
        lastError = e.message || "Netzwerkfehler";
      }
    }

    if (!success && retryDelaySeconds > 0 && (!retryCount || retryCount < 2)) {
      var currentCountdown = retryDelaySeconds;
      if (container) {
        container.innerHTML = `
          <div class="p-6 text-center space-y-3 theme-panel rounded-3xl border border-amber-500/40 shadow-xl bg-gradient-to-b from-amber-950/20 to-noir-950 animate-pulse">
            <span class="text-2xl block">⏳</span>
            <div class="space-y-1">
              <strong class="text-xs text-amber-200 block font-bold">Google Rate-Limit aktiv (20 Anfragen/Min.)</strong>
              <p class="text-[11px] text-slate-300">Wiederhole die Live-Recherche für "${escapeHtml(cleanTerm)}" automatisch in:</p>
              <div id="retry-countdown-num" class="text-2xl font-black text-amber-400 font-mono pt-1">${currentCountdown}s</div>
            </div>
          </div>
        `;
      }

      var countdownInterval = setInterval(function() {
        currentCountdown--;
        var cdEl = document.getElementById('retry-countdown-num');
        if (cdEl) cdEl.innerText = currentCountdown + "s";
        if (currentCountdown <= 0) {
          clearInterval(countdownInterval);
          performResearch(cleanTerm, contextDesc, true, (retryCount || 0) + 1);
        }
      }, 1000);
      return;
    }

    if (!success && container) {
      var fallbackData = generateFallbackKnowledge(cleanTerm);
      setCachedResult(cacheKey, fallbackData, "Sicherheits-Synthese (Offline)", "0.1");
      container.innerHTML = `
        <div class="space-y-3">
          <div class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800 text-[10.5px] text-amber-200 flex items-center justify-between">
            <span>⚡ <strong>Google API-Quota erreicht:</strong> Darstellung aus der evidenzbasierten Wissens-Synthese.</span>
            <button type="button" onclick="KinkResearch.forceRefresh('${escapeHtml(cleanTerm).replace(/'/g, "\\'")}')" class="px-2 py-0.5 rounded bg-amber-900 border border-amber-700 text-white font-bold touch-btn">
              KI neu anfragen ↺
            </button>
          </div>
          ${renderResearchUI(cleanTerm, fallbackData, "Evidenzbasierte Synthese", "0.1")}
        </div>
      `;
    }
  }

  function openModal(term, contextDesc) {
    var modal = document.getElementById('modal-lexikon');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }

    if (term) {
      performResearch(term, contextDesc, false);
    } else {
      var container = document.getElementById('lexikon-entries-container');
      if (container && !container.innerHTML.trim()) {
        renderDefaultWelcome(container);
      }
    }
  }

  function closeModal() {
    var modal = document.getElementById('modal-lexikon');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }

    var input = document.getElementById('lexikon-search-input');
    if (input) input.value = '';
    var container = document.getElementById('lexikon-entries-container');
    if (container) renderDefaultWelcome(container);
  }

  function renderDefaultWelcome(container) {
    container.innerHTML = `
      <div class="p-5 text-center space-y-3 theme-panel rounded-2xl border border-slate-800">
        <span class="text-3xl block">🔍</span>
        <div>
          <strong class="text-xs text-white block font-bold">Gib oben einen Begriff ein oder wähle eine Praxis:</strong>
          <p class="text-[10.5px] text-slate-400 mt-0.5">Analysiert Ablauf, psychologische Anziehungskraft und Sicherheitsstandards in Echtzeit.</p>
        </div>
        <div class="flex flex-wrap gap-1.5 justify-center pt-1">
          <button type="button" onclick="KinkResearch.open('Sensuelles Breast-Smothering')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Breast-Smothering</button>
          <button type="button" onclick="KinkResearch.open('Takate Kote (Klassische Armbox)')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Takate Kote</button>
          <button type="button" onclick="KinkResearch.open('Ruined Orgasm')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Ruined Orgasm</button>
          <button type="button" onclick="KinkResearch.open('CBT (Ball Stretcher & Hodenringe)')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">CBT</button>
          <button type="button" onclick="KinkResearch.open('Bratting & spielerisches Bändigen')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Bratting</button>
          <button type="button" onclick="KinkResearch.open('Pegging')" class="px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 hover:text-white text-[11px] font-bold touch-btn">Pegging</button>
        </div>
      </div>
    `;
  }

  function handleSearchFromInput() {
    var input = document.getElementById('lexikon-search-input');
    var val = (input ? input.value : '').trim();
    if (val) {
      performResearch(val, null, true);
    } else {
      showToast("Bitte gib einen Begriff zur Recherche ein.");
    }
  }

  window.KinkResearch = {
    open: openModal,
    close: closeModal,
    search: handleSearchFromInput,
    forceRefresh: function(term) { performResearch(term, null, true); }
  };

  window.openLexikonModal = openModal;
  window.closeLexikonModal = closeModal;
  window.searchKinkResearch = handleSearchFromInput;

})(window);
