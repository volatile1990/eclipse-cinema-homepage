const tour = document.querySelector("[data-tour]");

if (tour) {
  const infoKicker = tour.querySelector("[data-info-kicker]");
  const infoTitle = tour.querySelector("[data-info-title]");
  const infoText = tour.querySelector("[data-info-text]");
  const infoSpecs = tour.querySelector("[data-info-specs]");
  const infoHint = tour.querySelector("[data-info-hint]");
  const viewButtons = tour.querySelectorAll(".tour-views [data-view]");
  const layerButtons = tour.querySelectorAll(".tour-layers [data-layer]");
  const plans = tour.querySelectorAll(".plan");
  const hits = tour.querySelectorAll(".hit");

  const defaults = {
    top: {
      kicker: "Draufsicht",
      title: "Der Raum als Kinosaal",
      text: "Sitze, Lautsprecher, Bassarrays und Akustikelemente sind einzeln markiert. Tippe ein Element an, um Details und Maße zu sehen — Layer lassen sich oben einzeln ein- und ausblenden.",
      specs: {
        "Freier Innenraum": "4,8 × 3,9 × 2,1 m",
        "Erste Reihe": "3,0 m zur Leinwand",
        "Zweite Reihe": "4,8 m, auf Podest",
      },
    },
    front: {
      kicker: "Frontwand",
      title: "Was hinter der Leinwand steckt",
      text: "Eine 50 cm tiefe Ständerwand. Hinter der mikroperforierten Leinwand sitzen Center, L/R, acht Subwoofer des vorderen DBA und die umliegende Dämmung. Tippe Elemente an, um Details zu sehen.",
      specs: {
        "Wandtiefe": "50 cm",
        "Höhe": "2,35 m",
        "Leinwand": "332 × 139 cm (21:9)",
        "Subwoofer": "8× Scan-Speak 30W/4558T00",
        "Dämmung": "bis zur Decke, um Center und Subwoofer herum",
      },
    },
    rear: {
      kicker: "Rückwand",
      title: "DBA, Back Surrounds und Diffusion hinten",
      text: "Die 30 cm tiefe hintere Ständerwand spiegelt das Bassarray der Front. Die Back Surrounds sitzen außen zwischen den Subwoofer-Reihen; direkt daneben schließen die 1D-Diffusoren an. Der Projektor-Durchbruch bleibt mittig.",
      specs: {
        "Wandtiefe": "30 cm",
        "Höhe": "2,35 m",
        "Subwoofer": "8× Scan-Speak 30W/4558T00",
        "Sub-Gehäuse": "70 × 50 cm, waagrecht",
        "Diffusion": "2× 100 × 50 × 10 cm",
      },
    },
    "side-left": {
      kicker: "Linke Wand",
      title: "Akustik-Reihenfolge auf der linken Wand",
      text: "Von vorne nach hinten: Erstreflektions-Absorber (120×120), Front Wide, 100×100 Absorber, Surround, Slat-Element und Manhattan-Diffusor. Im unteren 60 cm-Bereich sitzt der Heizkörper hinter einer Binary-Diffusor-Verkleidung.",
      specs: {
        "Wandlänge frei": "4,8 m",
        "Wandhöhe": "2,47 m roh / 2,1 m frei",
        "Besonderheit": "Heizkörperverkleidung 200×57 cm",
      },
    },
    "side-right": {
      kicker: "Rechte Wand",
      title: "Spiegelbild der linken Wand — mit Tür",
      text: "Erstreflektions-Absorber, Front Wide, 100×100, Surround und Slat-Element wie links. Statt Manhattan-Diffusor sitzt im hinteren Bereich die Tür ins Kino — sie übernimmt dort den Wandabschnitt.",
      specs: {
        "Wandlänge frei": "4,8 m",
        "Wandhöhe": "2,47 m roh / 2,1 m frei",
        "Besonderheit": "Tür im hinteren Wanddrittel",
      },
    },
    ceiling: {
      kicker: "Decke",
      title: "Drei Zonen von vorne nach hinten",
      text: "Direkt nach der Front sitzen 100 cm angewinkelte 10 cm-Absorber, dann 120 cm Erstreflexionsabsorber 20 cm dick (6.000 Pa·s/m²) über die ganze Raumbreite, dann ein 5,76 m² großes Feld aus 16 × 60×60 cm 2D-Diffusoren über Hörplatz und Rückbereich.",
      specs: {
        "Behandlungstiefe": "37 cm gegenüber Rohdecke",
        "Diffusor-Fläche": "16 × 60×60 cm = 5,76 m²",
        "Deckenlautsprecher": "8 Stück nuLine WS-14",
      },
    },
  };

  const info = {
    screen: {
      kicker: "Leinwand",
      title: "332 cm Cinemascope-Front",
      text: "Mikroperforierte 21:9-Leinwand. Center, L und R spielen direkt durch die Bildfläche, ohne sichtbar zu sein. Der Center sitzt nur 2–3 cm hinter dem Stoff.",
      specs: {
        "Breite": "332 cm",
        "Format": "21:9 (2,39:1)",
        "Material": "Opera Weiß 2.2 Micro",
        "Projektor": "JVC NZ7",
      },
    },
    row1: {
      kicker: "Erste Reihe",
      title: "Stressless Reno L",
      text: "Zwei Lounge-Sessel, symmetrisch links und rechts der Mittelachse. Kein Sitz liegt exakt auf der Achse — das hält den Sweet Spot frei von symmetrischen Auslöschungen.",
      specs: {
        "Modell": "2× Stressless Reno L",
        "Abstand zur Leinwand": "3,0 m (Hörposition)",
        "Priorität": "primärer Hörbereich",
      },
    },
    row2: {
      kicker: "Zweite Reihe",
      title: "Pasadena auf Podest",
      text: "Vier Heimkinositze stehen erhöht auf dem Podest, damit Gäste über die vordere Reihe hinweg schauen können. Diese Reihe ist für Besucher und fast nie besetzt.",
      specs: {
        "Modell": "4× Hollywood Zuhause Pasadena",
        "Abstand zur Leinwand": "4,8 m",
        "Anordnung": "vier Plätze nebeneinander",
      },
    },
    podium: {
      kicker: "Podest",
      title: "Erhöhte zweite Sitzebene",
      text: "Das Podest hebt Reihe 2 auf Sichtebene über die erste Reihe und schafft Volumen für die akustische Behandlung der hinteren Wand und Decke.",
      specs: {
        "Breite": "267 cm",
        "Tiefe": "168 cm",
        "Höhe": "45 cm",
      },
    },
    lcr: {
      kicker: "Front L / C / R",
      title: "Hauptlautsprecher in der Frontkonstruktion",
      text: "Left und Right stehen seitlich neben der Leinwand, leicht zum Hörplatz angewinkelt — verdeckt durch die akustisch transparente Stoffverblendung. Der Center sitzt mittig hinter der mikroperforierten Leinwand und spielt 2–3 cm hinter dem Stoff direkt durch sie hindurch.",
      specs: {
        "L / R": "Nubert nuVero 110, seitlich der Leinwand",
        "Center": "Nubert nuVero Nova 12, hinter Leinwand",
        "Endstufen": "Apollon 1ET400A (Class D, Purifi)",
      },
    },
    "front-wide": {
      kicker: "Front Wide",
      title: "Erweiterte Frontbühne",
      text: "Sitzen seitlich nach den Erstreflektions-Absorbern und erweitern die L/R-Bühne nach außen — der Übergang zwischen Front und Surround wird damit lückenlos.",
      specs: {
        "Modell": "2× Nubert nuVero 50",
        "Position": "links und rechts vor den Surrounds",
        "Endstufen": "Apollon 1ET400A",
      },
    },
    surround: {
      kicker: "Surround L / R",
      title: "Seitliche Hülle",
      text: "Direkt seitlich des Hörplatzes. Schließen den Raum klanglich um den Hörer — die Schaltstelle zwischen vorderer Bühne und hinteren Effekten.",
      specs: {
        "Modell": "2× Nubert nuVero 70",
        "Position": "Seitenwand auf Hörhöhe",
        "Endstufen": "Apollon 1ET400A",
      },
    },
    "back-surround": {
      kicker: "Back Surround",
      title: "Hintere Surrounds",
      text: "Schließen das Surroundfeld nach hinten und sind für Effekte hinter dem Hörplatz zuständig.",
      specs: {
        "Modell": "2× Nubert nuLine WS-14",
        "Position": "Rückwand",
        "Endstufen": "IOTAVX 7-230",
      },
    },
    "height-front": {
      kicker: "Front Heights",
      title: "Vordere Höhenebene",
      text: "Front Height Left, Center Height und Front Height Right ergänzen die vertikale Bühne über dem Bildbereich.",
      specs: {
        "Modell": "3× Nubert nuLine WS-14",
        "Position": "Decke vor dem Hörplatz",
        "Endstufen": "IOTAVX 7-230",
      },
    },
    "height-side": {
      kicker: "Top Side",
      title: "Seitliche Decken-Höhe",
      text: "Top Side Left und Top Side Right sitzen seitlich oben über dem Hörplatz und erweitern die Höhenebene zur Seite.",
      specs: {
        "Modell": "2× Nubert nuLine WS-14",
        "Position": "Decke seitlich über Hörplatz",
        "Endstufen": "IOTAVX 7-230",
      },
    },
    vog: {
      kicker: "Voice of God",
      title: "Senkrecht über dem Hörplatz",
      text: "Direkt über dem Sweet Spot. Sorgt für Effekte, die wirklich von oben kommen — Regen, Hubschrauber, Stimmen aus der Höhe.",
      specs: {
        "Modell": "Nubert nuLine WS-14",
        "Position": "Decke mittig über Reihe 1",
        "Endstufen": "IOTAVX AVXP1",
      },
    },
    "height-rear": {
      kicker: "Top Surround Back",
      title: "Hintere Höhenebene",
      text: "Schließen die Höhenebene zur Rückwand und arbeiten zusammen mit den Back Surrounds für hintere Effekte über Kopfhöhe.",
      specs: {
        "Modell": "2× Nubert nuLine WS-14",
        "Position": "Decke hinten",
        "Endstufen": "IOTAVX AVXP1",
      },
    },
    "bass-front": {
      kicker: "Front-DBA",
      title: "Acht Subwoofer in 50×70-cm-Gehäusen",
      text: "Acht Scan-Speak-Chassis bilden das vordere Array des Double Bass Array. Jedes Chassis sitzt in einem 50×70 cm großen, hochkant stehenden Gehäuse; in diesem vorderen Gehäusebereich ist keine Dämmung eingezeichnet. Die Dämmung läuft um diese Kästen herum.",
      specs: {
        "Chassis": "8× Scan-Speak 30W/4558T00",
        "Gehäuse": "50 × 70 cm, hochkant",
        "Wandtiefe": "50 cm",
        "Endstufen": "Thomann TSA 4-700",
        "Verarbeitung": "Dirac ART",
      },
    },
    "bass-rear": {
      kicker: "Rück-DBA",
      title: "Acht Subwoofer in 70×50-cm-Gehäusen",
      text: "Spiegelung der Front, aber mit waagrecht ausgerichteten Gehäusen: jedes Subwoofer-Gehäuse ist 70 cm breit und 50 cm hoch. Das Rück-DBA spielt zeitversetzt und phaseninvertiert, damit die Reflexion an der Rückwand ausgelöscht wird.",
      specs: {
        "Chassis": "8× Scan-Speak 30W/4558T00",
        "Gehäuse": "70 × 50 cm, waagrecht",
        "Wandtiefe": "30 cm",
        "Endstufen": "Thomann TSA 4-700",
      },
    },
    "front-wall-insulation": {
      kicker: "Frontwand-Dämmung",
      title: "Gefüllte 50-cm-Ständerwand",
      text: "Die Frontständerwand ist nicht geschlossen beplankt, aber bis nach vorne um Center und alle Subwoofer-Gehäuse herum mit Dämmmaterial gefüllt. Die Dämmung endet an den 50×70-cm-Gehäusekanten; in den vorderen Gehäuseflächen ist keine Dämmung eingezeichnet. Dazwischen liegt 3.000 Pa·s/m², zur Betonwand bleiben 20 cm mit 10.000 Pa·s/m² Material.",
      specs: {
        "Wandtiefe": "50 cm",
        "Höhe": "2,35 m",
        "Sub-Gehäuse": "50 × 70 cm, hochkant",
        "Zwischen Subs": "3.000 Pa·s/m²",
        "Zur Betonwand": "20 cm mit 10.000 Pa·s/m²",
      },
    },
    "early-reflection": {
      kicker: "Erstreflektions-Absorber",
      title: "Frühe Seitenreflexionen schlucken",
      text: "Direkt seitlich nach der Front. Verhindert, dass frühe Reflexionen aus L/R den Direktklang verfälschen oder Lokalisation verwischen.",
      specs: {
        "Größe": "120 × 120 × 20 cm",
        "Füllung": "Ursa Glaswolle",
        "Hülle": "Unkrautvlies",
      },
    },
    "side-absorbers": {
      kicker: "Seitliche Absorber",
      title: "Zweite Reflexionsstufe",
      text: "Hinter den Front Wide Lautsprechern setzen weitere Glaswolle-Elemente die Absorption auf den Seiten fort, bevor die Surrounds beginnen.",
      specs: {
        "Größe": "100 × 100 × 20 cm",
        "Füllung": "Ursa Glaswolle",
      },
    },
    slats: {
      kicker: "Slat-Elemente",
      title: "Reflektierend mit aufgebrochener Phase",
      text: "Hinter den Surrounds. 32–58 mm breite Vollholz-Slats auf 18 mm Grundplatte. Sie reflektieren, brechen aber die Phase auf und halten Energie im hinteren Halbraum, ohne ihn zu dämpfen.",
      specs: {
        "Breite": "60 cm",
        "Tiefe maximal": "45 mm",
        "Oberfläche": "ca. 70 % Latte, 30 % Schlitz",
        "Davor": "60 × 60 cm t.akustik Highline A1",
      },
    },
    manhattan: {
      kicker: "Manhattan-Diffusoren",
      title: "2D-Diffusion auf Höhe Reihe 2",
      text: "Streuen den Schall horizontal und vertikal. Halten den Klang räumlich groß, ohne den Raum zu dämpfen oder steril wirken zu lassen.",
      specs: {
        "Größe": "60 × 180 cm",
        "Material": "EPS",
        "Position": "Seitenwand auf Höhe Reihe 2",
      },
    },
    "rear-diffusers": {
      kicker: "1D-Diffusoren Rückwand",
      title: "Diffusion zwischen den Subs",
      text: "Zwei 1D-Diffusoren schließen direkt an die äußeren Back-Surround-Lautsprecher an. Sie streuen verbleibende Reflexionen, ohne die Rückwand vollflächig zu dämpfen.",
      specs: {
        "Anzahl": "2 Stück",
        "Größe": "100 × 50 × 10 cm",
        "Position": "Mitte der Rückwand",
      },
    },
    "floor-absorbers": {
      kicker: "Bodenabsorber",
      title: "Bodenreflexion zwischen Front und Hörer",
      text: "Beginnt 10 cm hinter der Front. Erst 60 cm direkt aufliegend, dann 60 cm mit 10 cm Luftspalt — schluckt die Bodenreflexion zwischen Leinwand und Sweet Spot.",
      specs: {
        "Länge": "120 cm",
        "Breite": "360 cm",
        "Material": "6.000 Pa·s/m²",
        "Bespannung": "Adamantium Dark Reference",
      },
    },
    heater: {
      kicker: "Heizkörperverkleidung",
      title: "Akustik im unteren 60 cm-Bereich",
      text: "Auf der linken Wand sitzt unter den seitlichen Glaswolle-Elementen der Heizkörper. Die Verkleidung gleicht die Seite akustisch an: 6 cm Lüftungsschlitze oben und unten für die Heizungs-Konvektion, 10 cm Absorbermaterial in der Mitte und Binary Diffusor-Platten an der Front.",
      specs: {
        "Größe": "200 × 57 cm",
        "Lüftung": "je 6 cm Schlitz oben und unten",
        "Kern": "10 cm Absorber",
        "Front": "Binary Diffusor",
      },
    },
    door: {
      kicker: "Tür",
      title: "Eingang im hinteren Wanddrittel",
      text: "Die Tür liegt auf der rechten Wand im hinteren Bereich — sie ersetzt dort den Wandabschnitt, den auf der linken Seite der Manhattan-Diffusor einnimmt. Damit ist die rechte Wand akustisch nicht spiegelsymmetrisch zur linken.",
      specs: {
        "Position": "rechte Wand, hinten",
        "Asymmetrie": "links Manhattan, rechts Tür",
      },
    },
    "rear-wall-absorbers": {
      kicker: "Rückwand-Absorber",
      title: "Durchgehende Dämmung mit Ausschnitten",
      text: "Die Rückwand-Dämmung füllt die Fläche zwischen allen Einbauten vollständig aus. Ausgeschnitten sind nur die waagrechten Subwoofer-Gehäuse, die beiden 1D-Diffusoren, Back Surrounds und der Projektor-Durchbruch. Ab dem hinteren Bereich ist sie mit akustisch transparentem Stoff bespannt.",
      specs: {
        "Wandtiefe": "30 cm",
        "Höhe": "2,35 m",
        "Ausschnitte": "Subs, Diffusoren, Back Surrounds, Projektor",
        "Zwischen Subs": "3.000 Pa·s/m²",
        "Bespannung": "Adamantium Audio invisible",
      },
    },
    "projector-port": {
      kicker: "Projektor-Durchbruch",
      title: "Durchbruch mittig über der Rückwand",
      text: "Der Projektor-Durchbruch sitzt mittig zwischen den seitlich angeordneten Diffusor- und Back-Surround-Feldern.",
      specs: {
        "Position": "zentral in der Rückwand",
        "Bezug": "laut PDF über der mittleren Absorberzone",
      },
    },
    "ceiling-front": {
      kicker: "Front-Absorber Decke",
      title: "Angewinkelter 100 cm-Absorber direkt über der Front",
      text: "Die ersten 100 cm der Decke ab der Front sind mit 10 cm dicken Absorbern belegt, leicht zur Front hin angewinkelt. Dahinter bleibt bis zu 10 cm Luft. Bespannung mit Adamantium Audio Dark Reference reduziert zugleich Streulicht.",
      specs: {
        "Länge": "100 cm ab Front",
        "Stärke": "10 cm + bis 10 cm Luft",
        "Bespannung": "Adamantium Dark Reference",
      },
    },
    "ceiling-reflection": {
      kicker: "Decken-Erstreflexion",
      title: "120 cm-Erstreflexionsabsorber über die ganze Raumbreite",
      text: "Direkt im Anschluss an den Front-Absorber liegt der Hauptabsorber für die Decken-Erstreflexion zwischen Front und Hörplatz: 120 cm lang über die ganze Raumbreite, 20 cm dick, 6.000 Pa·s/m². Bespannung wechselt hier zu akustisch transparentem Stoff von Heimkinobau.",
      specs: {
        "Länge": "120 cm",
        "Stärke": "20 cm",
        "Material": "6.000 Pa·s/m²",
        "Breite": "ganze Raumbreite",
      },
    },
    "ceiling-diffuser": {
      kicker: "2D-Diffusor an der Decke",
      title: "16 Module über Hörplatz und hinterem Raum",
      text: "Über dem Hörplatz und der gesamten hinteren Raumhälfte hängen 16 Module 2D-Diffusoren à 60×60 cm — eine durchgehende, lebendige Streufläche von 5,76 m².",
      specs: {
        "Module": "16 × 60 × 60 cm",
        "Fläche gesamt": "5,76 m²",
        "Anordnung": "4 × 4-Raster zentriert",
      },
    },
  };

  const updateInfo = (key) => {
    const data = info[key] || defaults[tour.dataset.view] || defaults.top;
    infoKicker.textContent = data.kicker;
    infoTitle.textContent = data.title;
    infoText.textContent = data.text;

    infoSpecs.replaceChildren();
    if (data.specs) {
      Object.entries(data.specs).forEach(([k, v]) => {
        const dt = document.createElement("dt");
        dt.textContent = k;
        const dd = document.createElement("dd");
        dd.textContent = v;
        infoSpecs.append(dt, dd);
      });
    }
  };

  const viewLabels = {
    top: "Draufsicht",
    front: "Frontwand",
    rear: "Rückwand",
    "side-left": "Linke Wand",
    "side-right": "Rechte Wand",
    ceiling: "Decke",
  };

  const updateHint = () => {
    if (!infoHint) return;
    const view = viewLabels[tour.dataset.view] || "Draufsicht";
    const layersOn = [...layerButtons].filter(
      (b) => b.getAttribute("aria-pressed") === "true",
    ).length;
    const layerSummary = layersOn
      ? `${layersOn} Layer aktiv`
      : "alle Layer ausgeblendet";
    infoHint.innerHTML = `Aktuelle Ansicht: <strong>${view}</strong> · ${layerSummary}`;
  };

  const setView = (view) => {
    tour.dataset.view = view;
    plans.forEach((p) => p.classList.toggle("is-visible", p.dataset.plan === view));
    viewButtons.forEach((b) => {
      const isActive = b.dataset.view === view;
      b.classList.toggle("is-active", isActive);
      b.setAttribute("aria-selected", String(isActive));
    });
    hits.forEach((h) => h.classList.remove("is-active"));
    updateInfo(null);
    updateHint();
  };

  const toggleLayer = (layer) => {
    const btn = tour.querySelector(`.tour-layers [data-layer="${layer}"]`);
    const wasOn = btn.getAttribute("aria-pressed") === "true";
    const newState = !wasOn;
    btn.setAttribute("aria-pressed", String(newState));
    tour
      .querySelectorAll(`.plan-layer[data-layer="${layer}"]`)
      .forEach((g) => g.classList.toggle("is-off", !newState));
    updateHint();
  };

  const activateHit = (el) => {
    hits.forEach((h) => h.classList.toggle("is-active", h === el));
    updateInfo(el.dataset.info);
  };

  viewButtons.forEach((b) =>
    b.addEventListener("click", () => setView(b.dataset.view)),
  );

  layerButtons.forEach((b) =>
    b.addEventListener("click", () => toggleLayer(b.dataset.layer)),
  );

  hits.forEach((el) => {
    el.addEventListener("click", () => activateHit(el));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateHit(el);
      }
    });
  });

  setView(tour.dataset.view || "top");
}

const header = document.querySelector(".site-header");
if (header) {
  const updateScrolled = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 80);
  };
  window.addEventListener("scroll", updateScrolled, { passive: true });
  updateScrolled();
}

const reveals = document.querySelectorAll("[data-reveal]");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (prefersReducedMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
  );
  reveals.forEach((el) => observer.observe(el));
}
