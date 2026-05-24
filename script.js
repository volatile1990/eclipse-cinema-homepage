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
      text: "Sitze, Lautsprecher, Bassarrays und Akustikelemente sind einzeln markiert. Elemente öffnen Details; Layer lassen sich separat ein- und ausblenden.",
      specs: {
        "Freier Innenraum": "4,8 × 3,9 × 2,1 m",
        "Erste Reihe": "3,0 m zur Leinwand",
        "Zweite Reihe": "4,8 m, auf Podest",
      },
    },
    front: {
      kicker: "Frontwand",
      title: "Was hinter der Leinwand steckt",
      text: "In der 50 cm tiefen Frontwand sitzen Center, L/R, acht Subwoofer des vorderen DBA und die umliegende Dämmung.",
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
      text: "Die linke Wand wechselt von Absorption im vorderen Bereich zu Diffusion im hinteren Drittel. Der Heizkörper sitzt unten hinter einer akustisch angepassten Verkleidung.",
      specs: {
        "Wandlänge frei": "4,8 m",
        "Wandhöhe": "2,35 m",
        "Besonderheit": "Heizkörperverkleidung 200×57 cm",
      },
    },
    "side-right": {
      kicker: "Rechte Wand",
      title: "Spiegelbild der linken Wand — mit Tür",
      text: "Die rechte Wand folgt dem Aufbau der linken Seite. Im hinteren Drittel ersetzt die Tür einen Wandabschnitt; drei HOFA-Diffusoren auf der Tür führen die Diffusionsfläche weiter.",
      specs: {
        "Wandlänge frei": "4,8 m",
        "Wandhöhe": "2,35 m",
        "Besonderheit": "Tür im hinteren Wanddrittel mit HOFA-Feld",
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
      text: "Zwei Lounge-Sessel flankieren die Mittelachse. Kein Sitz liegt exakt auf der Achse; die Abstimmung bleibt auf die Hörposition zwischen beiden Plätzen ausgerichtet.",
      specs: {
        "Modell": "2× Stressless Reno L",
        "Abstand zur Leinwand": "3,0 m (Hörposition)",
        "Priorität": "primärer Hörbereich",
      },
    },
    row2: {
      kicker: "Zweite Reihe",
      title: "Pasadena auf Podest",
      text: "Vier zusätzliche Plätze stehen erhöht auf dem Podest. Die Sicht läuft über die vordere Reihe hinweg; die akustische Hauptabstimmung bleibt auf Reihe 1.",
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
      text: "Links und rechts stehen die Hauptlautsprecher neben der Leinwand, leicht zum Hörplatz angewinkelt. Der Center sitzt mittig wenige Zentimeter hinter der mikroperforierten Fläche.",
      specs: {
        "L / R": "Nubert nuVero 110, seitlich der Leinwand",
        "Center": "Nubert nuVero Nova 12, hinter Leinwand",
        "Endstufen": "Apollon 1ET400A (Class D, Purifi)",
      },
    },
    "front-wide": {
      kicker: "Front Wide",
      title: "Erweiterte Frontbühne",
      text: "Sitzen seitlich nach den Erstreflexions-Absorbern und erweitern die L/R-Bühne nach außen. Der Übergang zwischen Front und Surround wird dadurch geschlossener.",
      specs: {
        "Modell": "2× Nubert nuVero 50",
        "Position": "links und rechts vor den Surrounds",
        "Endstufen": "Apollon 1ET400A",
      },
    },
    surround: {
      kicker: "Surround L / R",
      title: "Seitliche Hülle",
      text: "Direkt seitlich des Hörplatzes. Sie verbinden die vordere Bühne mit den hinteren Effekten.",
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
      text: "Direkt über dem Sweet Spot. Deckt die senkrechte Höhenposition über dem Hörplatz ab.",
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
      text: "Acht Scan-Speak-Chassis bilden das vordere Array des Double Bass Array. Die hochkant stehenden Gehäuse sitzen in der Frontwand; die Dämmung läuft um sie herum.",
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
      text: "Die Frontständerwand bleibt hinter der Leinwand offen und ist um Center und Subwoofer-Gehäuse herum gedämmt. Unterschiedliche Materialien übernehmen die Absorption vor und nahe der Betonwand.",
      specs: {
        "Wandtiefe": "50 cm",
        "Höhe": "2,35 m",
        "Sub-Gehäuse": "50 × 70 cm, hochkant",
        "Zwischen Subs": "3.000 Pa·s/m²",
        "Zur Betonwand": "20 cm mit 10.000 Pa·s/m²",
      },
    },
    "early-reflection": {
      kicker: "Erstreflexions-Absorber",
      title: "Frühe Seitenreflexionen kontrollieren",
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
      text: "Hinter den Front-Wide-Lautsprechern setzen weitere Glaswolle-Elemente die Absorption auf den Seiten fort, bevor die Surrounds beginnen.",
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
      title: "2D-Diffusion über den seitlichen Absorbern",
      text: "Pro Seite zwei 60 × 60 cm Manhattan-Diffusoren direkt über den 100 × 100 Absorbern. Sie streuen die ankommende Energie horizontal und vertikal und halten den Klang räumlich groß, ohne den Raum zu dämpfen.",
      specs: {
        "Größe pro Modul": "60 × 60 cm",
        "Anzahl pro Seite": "2 Stück nebeneinander",
        "Gesamt pro Seite": "120 × 60 cm",
        "Material": "EPS",
        "Position": "über den 100 × 100 Absorbern",
      },
    },
    "qrd-rear": {
      kicker: "HOFA 2D-QRD",
      title: "QRD-Diffusoren im hinteren Wandbereich",
      text: "Im hinteren Wanddrittel sitzen je drei HOFA 2D-QRD-Diffusoren à 50 × 50 cm übereinander — links direkt an der Wand, rechts auf der Tür. Pro Seite ergibt das ein 50 × 150 cm hohes Diffusionsfeld.",
      specs: {
        "Größe pro Modul": "50 × 50 cm",
        "Anzahl pro Seite": "3 Stück gestapelt",
        "Gesamt pro Seite": "50 × 150 cm",
        "Position": "links hinten / rechts auf der Tür",
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
        "Bezug": "über der mittleren Absorberzone",
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
  header.classList.add("has-scroll-state");
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
    { threshold: 0.04, rootMargin: "0px 0px -60px 0px" },
  );
  reveals.forEach((el) => observer.observe(el));
}

const navLinks = document.querySelectorAll(".main-nav a[href^='#']");
if (navLinks.length && "IntersectionObserver" in window) {
  const linksByHash = new Map();
  const sections = [];
  navLinks.forEach((link) => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#" || hash === "#top") return;
    const target = document.querySelector(hash);
    if (!target) return;
    linksByHash.set(hash.slice(1), link);
    sections.push(target);
  });

  let activeId = null;
  const setActive = (id) => {
    if (id === activeId) return;
    activeId = id;
    linksByHash.forEach((link, key) => {
      link.classList.toggle("is-active", key === id);
    });
  };

  const spy = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  sections.forEach((s) => spy.observe(s));
}

const catalogRoot = document.querySelector("[data-catalog]");
if (catalogRoot) {
  const resultsEl = catalogRoot.querySelector("[data-catalog-results]");
  const searchInput = catalogRoot.querySelector("[data-catalog-search]");
  const filterButtons = catalogRoot.querySelectorAll("[data-catalog-filter]");
  const sortSelect = catalogRoot.querySelector("[data-catalog-sort]");
  const statusEl = catalogRoot.querySelector("[data-catalog-status]");
  const updatedEl = catalogRoot.querySelector("[data-catalog-updated]");
  const paginationEl = catalogRoot.querySelector("[data-catalog-pagination]");
  const prevButton = catalogRoot.querySelector("[data-catalog-prev]");
  const nextButton = catalogRoot.querySelector("[data-catalog-next]");
  const pagesEl = catalogRoot.querySelector("[data-catalog-pages]");
  const statEls = {
    total: catalogRoot.querySelector('[data-catalog-stat="total"]'),
    movie: catalogRoot.querySelector('[data-catalog-stat="movie"]'),
    demo: catalogRoot.querySelector('[data-catalog-stat="demo"]'),
    tv: catalogRoot.querySelector('[data-catalog-stat="tv"]'),
  };

  const source = catalogRoot.dataset.catalogSrc;
  const pageSize = 10;
  const numberFormat = new Intl.NumberFormat("de-DE");
  const dateFormat = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const collator = new Intl.Collator("de-DE", {
    numeric: true,
    sensitivity: "base",
  });
  const kindLabels = {
    movie: "Film",
    demo: "Demo",
    tv: "Serie",
  };
  const codecLabels = {
    ac3: "Dolby Digital",
    aac: "AAC",
    dts: "DTS",
    eac3: "Dolby Digital Plus",
    h264: "H.264",
    h265: "HEVC",
    hevc: "HEVC",
    truehd: "TrueHD",
  };
  const audioPriority = {
    "Dolby Atmos": 0,
    truehd: 1,
    dts: 2,
    eac3: 3,
    ac3: 4,
    aac: 5,
  };
  const state = {
    entries: [],
    filter: "all",
    query: "",
    sort: "title",
    page: 1,
    pageJumpGap: null,
  };

  const normalizeText = (value) =>
    String(value || "")
      .toLocaleLowerCase("de-DE")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const unique = (values) =>
    [...new Set(values.filter((value) => value !== null && value !== undefined && value !== ""))];

  const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const fileTitle = (item) => {
    const file = item.file_name || item.relative_path?.split(/[\\/]/).pop() || "";
    return file
      .replace(/\.[^.]+$/, "")
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const titleFor = (item) =>
    [item.title, item.parsed?.title, item.parsed?.alternative_title, fileTitle(item)]
      .map((value) => String(value || "").trim())
      .find(Boolean) || "Unbekannter Titel";

  const labelCodec = (codec) => codecLabels[String(codec || "").toLowerCase()] || String(codec || "").toUpperCase();

  const channelLabel = (channels) => {
    if (!channels) return "";
    if (channels === 8) return "7.1";
    if (channels === 6) return "5.1";
    if (channels === 2) return "2.0";
    return `${channels} ch`;
  };

  const audioLabel = (items) => {
    const candidates = [];

    items.forEach((item) => {
      if (item.audio_codec) {
        candidates.push({
          label: item.audio_codec,
          priority: audioPriority[item.audio_codec] ?? 10,
        });
      }

      (item.media_info?.audio || []).forEach((stream) => {
        const codec = String(stream.codec || "").toLowerCase();
        if (!codec) return;
        const channels = channelLabel(stream.channels);
        candidates.push({
          label: [labelCodec(codec), channels].filter(Boolean).join(" "),
          priority: audioPriority[codec] ?? 20,
        });
      });
    });

    candidates.sort((a, b) => a.priority - b.priority || collator.compare(a.label, b.label));
    return candidates[0]?.label || "";
  };

  const resolutionLabel = (width, height) => {
    if (height >= 4320 || width >= 7680) return "8K";
    if (height >= 2160 || width >= 3840) return "4K";
    if (height >= 1080 || width >= 1920) return "Full HD";
    if (height) return `${height}p`;
    return "";
  };

  const durationLabel = (seconds) => {
    const totalSeconds = Number(seconds) || 0;
    if (!totalSeconds) return "";
    if (totalSeconds < 600) {
      const minutes = Math.floor(totalSeconds / 60);
      const rest = String(Math.round(totalSeconds % 60)).padStart(2, "0");
      return `${minutes}:${rest} min`;
    }
    return `${Math.round(totalSeconds / 60)} min`;
  };

  const padEpisodeNumber = (value) => String(value).padStart(2, "0");

  const episodeNumberFor = (item, key) => {
    const value = item[key] ?? item.parsed?.[key];
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
  };

  const episodeLabel = (item) => {
    const season = episodeNumberFor(item, "season");
    const episode = episodeNumberFor(item, "episode");
    if (season && episode) return `S${padEpisodeNumber(season)}E${padEpisodeNumber(episode)}`;
    if (episode) return `Folge ${episode}`;
    return fileTitle(item);
  };

  const episodeName = (item, seriesTitle) => {
    const season = episodeNumberFor(item, "season");
    const episode = episodeNumberFor(item, "episode");
    const code = season && episode ? `S${padEpisodeNumber(season)}E${padEpisodeNumber(episode)}` : "";
    const candidates = [
      item.episode_title,
      item.parsed?.episode_title,
      item.parsed?.episodeName,
      item.parsed?.name,
      fileTitle(item),
    ];

    for (const candidate of candidates) {
      let name = String(candidate || "").trim();
      if (!name) continue;

      if (seriesTitle) {
        name = name.replace(new RegExp(`^${escapeRegex(seriesTitle)}\\s*[-_.: ]*`, "i"), "").trim();
      }
      if (code) {
        name = name.replace(new RegExp(`^${escapeRegex(code)}\\s*[-_.: ]*`, "i"), "").trim();
      }
      if (episode) {
        name = name.replace(new RegExp(`^Folge\\s*${episode}\\s*[-_.: ]*`, "i"), "").trim();
      }

      name = name.replace(/\s+/g, " ").trim();
      if (name && normalizeText(name) !== normalizeText(seriesTitle)) return name;
    }

    return episode ? `Folge ${episode}` : "Episode";
  };

  const episodeDetails = (items, seriesTitle) =>
    items
      .map((item) => ({
        episode: episodeNumberFor(item, "episode"),
        label: episodeLabel(item),
        name: episodeName(item, seriesTitle),
        runtime: durationLabel(item.media_info?.duration_seconds),
        season: episodeNumberFor(item, "season"),
        sortTitle: fileTitle(item),
      }))
      .sort(
        (a, b) =>
          (a.season || 999) - (b.season || 999) ||
          (a.episode || 999) - (b.episode || 999) ||
          collator.compare(a.sortTitle, b.sortTitle),
      );

  const makeEntry = (items, forcedKind, forcedTitle) => {
    const primary = items[0] || {};
    const kind = forcedKind || primary.kind || "movie";
    const title = forcedTitle || titleFor(primary);
    const years = unique(items.map((item) => item.year));
    const episodes = kind === "tv" ? episodeDetails(items, title) : [];
    const videos = items.map((item) => item.media_info?.video).filter(Boolean);
    const bestVideo = videos
      .slice()
      .sort((a, b) => (Number(b.height) || 0) - (Number(a.height) || 0))[0] || {};
    const width = Number(bestVideo.width) || 0;
    const height = Number(bestVideo.height) || 0;
    const modifiedMs = Math.max(...items.map((item) => Date.parse(item.modified_at) || 0));
    const mediaCount = items.length;
    const resolution = resolutionLabel(width, height);
    const videoCodec = labelCodec(bestVideo.codec);
    const audio = audioLabel(items);
    const tags = unique([resolution, videoCodec, audio]);
    const subtitleParts = [];

    if (kind === "tv") {
      subtitleParts.push(`${mediaCount} ${mediaCount === 1 ? "Folge" : "Folgen"}`);
      const seasonCount = unique(episodes.map((episode) => episode.season)).length;
      if (seasonCount) subtitleParts.push(`${seasonCount} ${seasonCount === 1 ? "Staffel" : "Staffeln"}`);
    } else {
      if (years.length === 1) subtitleParts.push(String(years[0]));
      const runtime = durationLabel(primary.media_info?.duration_seconds);
      if (runtime) subtitleParts.push(runtime);
    }

    return {
      kind,
      title,
      episodes,
      subtitle: subtitleParts.join(" · "),
      tags,
      height,
      modifiedMs,
      searchIndex: normalizeText(
        [
          title,
          ...years,
          ...tags,
          ...episodes.flatMap((episode) => [episode.label, episode.name]),
          ...items.flatMap((item) => [
            item.file_name,
            item.parsed?.alternative_title,
          ]),
        ].join(" "),
      ),
    };
  };

  const prepareEntries = (items) => {
    const entries = [];
    const seriesGroups = new Map();

    items.forEach((item) => {
      if (item.kind !== "tv") {
        entries.push(makeEntry([item]));
        return;
      }

      const title = titleFor(item);
      const key = normalizeText(title);
      if (!seriesGroups.has(key)) {
        seriesGroups.set(key, { title, items: [] });
      }
      seriesGroups.get(key).items.push(item);
    });

    seriesGroups.forEach((group) => {
      entries.push(makeEntry(group.items, "tv", group.title));
    });

    return entries;
  };

  const updateStats = (data) => {
    const byKind = data.stats?.by_kind || {};
    const total = data.stats?.total ?? data.items?.length ?? 0;
    if (statEls.total) statEls.total.textContent = numberFormat.format(total);
    if (statEls.movie) statEls.movie.textContent = numberFormat.format(byKind.movie || 0);
    if (statEls.demo) statEls.demo.textContent = numberFormat.format(byKind.demo || 0);
    if (statEls.tv) statEls.tv.textContent = numberFormat.format(byKind.tv || 0);

    if (updatedEl && data.generated_at) {
      updatedEl.textContent = `Stand: ${dateFormat.format(new Date(data.generated_at))}`;
    }
  };

  const sortEntries = (entries) =>
    entries.slice().sort((a, b) => {
      if (state.sort === "recent") {
        return b.modifiedMs - a.modifiedMs || collator.compare(a.title, b.title);
      }
      if (state.sort === "resolution") {
        return b.height - a.height || collator.compare(a.title, b.title);
      }
      return collator.compare(a.title, b.title);
    });

  const filteredEntries = () => {
    const terms = normalizeText(state.query).split(/\s+/).filter(Boolean);
    const entries = state.entries.filter((entry) => {
      const matchesKind = state.filter === "all" || entry.kind === state.filter;
      const matchesQuery = terms.every((term) => entry.searchIndex.includes(term));
      return matchesKind && matchesQuery;
    });

    return sortEntries(entries);
  };

  const createEntryElement = (entry) => {
    const article = document.createElement("article");
    article.className = "catalog-item";

    const main = document.createElement("div");
    main.className = "catalog-item-main";

    const heading = document.createElement("div");
    heading.className = "catalog-item-heading";

    const kind = document.createElement("span");
    kind.className = `catalog-kind ${entry.kind}`;
    kind.textContent = kindLabels[entry.kind] || entry.kind;

    const title = document.createElement("h3");
    title.textContent = entry.title;

    heading.append(kind, title);
    main.append(heading);

    if (entry.subtitle) {
      const subtitle = document.createElement("p");
      subtitle.textContent = entry.subtitle;
      main.append(subtitle);
    }

    const tags = document.createElement("div");
    tags.className = "catalog-tags";
    entry.tags.forEach((tagText) => {
      const tag = document.createElement("span");
      tag.className = "catalog-tag";
      tag.textContent = tagText;
      tags.append(tag);
    });

    article.append(main, tags);

    if (entry.episodes?.length) {
      article.classList.add("has-episodes");

      const episodes = document.createElement("details");
      episodes.className = "catalog-episodes";

      const summary = document.createElement("summary");
      summary.textContent = "Folgen anzeigen";

      const episodePanel = document.createElement("div");
      episodePanel.className = "catalog-episode-panel";

      const seasonGroups = new Map();
      entry.episodes.forEach((episode) => {
        const key = episode.season || "unknown";
        if (!seasonGroups.has(key)) seasonGroups.set(key, []);
        seasonGroups.get(key).push(episode);
      });

      seasonGroups.forEach((seasonEpisodes, season) => {
        const group = document.createElement("div");
        group.className = "catalog-episode-season";

        if (seasonGroups.size > 1 || season !== "unknown") {
          const seasonTitle = document.createElement("h4");
          seasonTitle.textContent = season === "unknown" ? "Ohne Staffel" : `Staffel ${season}`;
          group.append(seasonTitle);
        }

        seasonEpisodes.forEach((episode) => {
          const item = document.createElement("div");
          item.className = "catalog-episode";

          const label = document.createElement("strong");
          label.textContent = episode.label;

          const detail = document.createElement("div");
          detail.className = "catalog-episode-detail";

          const name = document.createElement("span");
          name.className = "catalog-episode-name";
          name.textContent = episode.name;
          detail.append(name);

          if (episode.runtime) {
            const runtime = document.createElement("span");
            runtime.className = "catalog-episode-runtime";
            runtime.textContent = episode.runtime;
            detail.append(runtime);
          }

          item.append(label, detail);
          group.append(item);
        });

        episodePanel.append(group);
      });

      episodes.append(summary, episodePanel);
      article.append(episodes);
    }

    return article;
  };

  const paginationItems = (current, total) => {
    const pages = new Set([1, total, current, current - 1, current + 1]);
    if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
    if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));

    const sortedPages = [...pages]
      .filter((page) => page >= 1 && page <= total)
      .sort((a, b) => a - b);

    return sortedPages.flatMap((page, index) => {
      const previous = sortedPages[index - 1];
      if (previous && page - previous > 1) {
        return [{ type: "ellipsis", id: `${previous}-${page}` }, page];
      }
      return [page];
    });
  };

  const setPage = (page, shouldScroll = false) => {
    state.page = page;
    state.pageJumpGap = null;
    renderCatalog();
    if (shouldScroll) {
      catalogRoot.scrollIntoView({
        block: "start",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  };

  const renderPagination = (pageCount, totalEntries) => {
    if (!paginationEl || !prevButton || !nextButton || !pagesEl) return;

    const isNeeded = totalEntries > pageSize;
    paginationEl.hidden = !isNeeded;
    pagesEl.replaceChildren();
    if (!isNeeded) return;

    prevButton.disabled = state.page === 1;
    nextButton.disabled = state.page === pageCount;
    prevButton.onclick = () => setPage(Math.max(1, state.page - 1), true);
    nextButton.onclick = () => setPage(Math.min(pageCount, state.page + 1), true);

    paginationItems(state.page, pageCount).forEach((item) => {
      if (typeof item === "object") {
        if (state.pageJumpGap === item.id) {
          const select = document.createElement("select");
          select.className = "catalog-page-select";
          select.dataset.catalogPageSelect = "";
          select.setAttribute("aria-label", "Direkt zu Seite");

          for (let page = 1; page <= pageCount; page += 1) {
            const option = document.createElement("option");
            option.value = String(page);
            option.textContent = `Seite ${page}`;
            select.append(option);
          }

          select.value = String(state.page);
          select.addEventListener("change", () => setPage(Number(select.value), true));
          select.addEventListener("blur", () => {
            if (state.pageJumpGap === item.id) {
              state.pageJumpGap = null;
              renderPagination(pageCount, totalEntries);
            }
          });
          pagesEl.append(select);
          requestAnimationFrame(() => select.focus());
          return;
        }

        const ellipsis = document.createElement("button");
        ellipsis.type = "button";
        ellipsis.className = "catalog-page-ellipsis";
        ellipsis.textContent = "...";
        ellipsis.setAttribute("aria-label", "Seite direkt auswählen");
        ellipsis.addEventListener("click", () => {
          state.pageJumpGap = item.id;
          renderPagination(pageCount, totalEntries);
        });
        pagesEl.append(ellipsis);
        return;
      }

      const pageButton = document.createElement("button");
      pageButton.type = "button";
      pageButton.className = "catalog-page";
      pageButton.textContent = String(item);
      pageButton.setAttribute("aria-label", `Seite ${item}`);
      if (item === state.page) {
        pageButton.classList.add("is-active");
        pageButton.setAttribute("aria-current", "page");
      }
      pageButton.addEventListener("click", () => setPage(item, true));
      pagesEl.append(pageButton);
    });
  };

  const renderCatalog = () => {
    const entries = filteredEntries();
    const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));

    if (state.page > pageCount) state.page = pageCount;

    const start = entries.length ? (state.page - 1) * pageSize : 0;
    const end = Math.min(start + pageSize, entries.length);
    const visibleEntries = entries.slice(start, end);

    resultsEl.replaceChildren();

    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "catalog-empty";
      empty.textContent = "Keine passenden Titel im Katalog gefunden.";
      resultsEl.append(empty);
    } else {
      const fragment = document.createDocumentFragment();
      visibleEntries.forEach((entry) => fragment.append(createEntryElement(entry)));
      resultsEl.append(fragment);
    }

    if (statusEl) {
      const label = state.query ? "Treffern" : "Programmpunkten";
      statusEl.textContent = entries.length
        ? `${numberFormat.format(start + 1)}-${numberFormat.format(end)} von ${numberFormat.format(entries.length)} ${label}`
        : "Keine Treffer";
    }

    renderPagination(pageCount, entries.length);
  };

  const setFilter = (filter) => {
    state.filter = filter;
    state.page = 1;
    filterButtons.forEach((button) => {
      const isActive = button.dataset.catalogFilter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    renderCatalog();
  };

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.query = searchInput.value;
      state.page = 1;
      renderCatalog();
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setFilter(button.dataset.catalogFilter || "all"));
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      state.sort = sortSelect.value;
      state.page = 1;
      renderCatalog();
    });
  }

  fetch(source)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const items = Array.isArray(data.items) ? data.items : [];
      state.entries = prepareEntries(items);
      updateStats(data);
      renderCatalog();
    })
    .catch(() => {
      if (statusEl) statusEl.textContent = "Katalog konnte nicht geladen werden.";
      if (resultsEl) {
        resultsEl.replaceChildren();
        const empty = document.createElement("p");
        empty.className = "catalog-empty";
        empty.textContent = "Die Zappiti-Daten sind erst verfügbar, wenn die Seite über einen Webserver geladen wird.";
        resultsEl.append(empty);
      }
      if (paginationEl) paginationEl.hidden = true;
    });
}

const lightbox = document.querySelector("[data-lightbox]");
const galleryFigures = Array.from(document.querySelectorAll(".gallery-grid figure"));
if (lightbox && galleryFigures.length && typeof lightbox.showModal === "function") {
  const lbImg = lightbox.querySelector("[data-lightbox-img]");
  const lbCaption = lightbox.querySelector("[data-lightbox-caption]");
  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");

  let currentIndex = -1;

  const showAt = (index) => {
    if (index < 0 || index >= galleryFigures.length) return;
    const figure = galleryFigures[index];
    const img = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    if (!img) return;
    lbImg.src = img.dataset.full || img.currentSrc || img.src;
    lbImg.alt = img.alt || "";
    lbCaption.textContent = caption ? caption.textContent.trim() : "";
    currentIndex = index;
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === galleryFigures.length - 1;
  };

  const openAt = (index) => {
    showAt(index);
    if (!lightbox.open) lightbox.showModal();
  };

  galleryFigures.forEach((figure, index) => {
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    const label = figure.querySelector("figcaption");
    if (label) figure.setAttribute("aria-label", `${label.textContent.trim()} vergrößern`);
    figure.addEventListener("click", () => openAt(index));
    figure.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAt(index);
      }
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showAt(currentIndex - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showAt(currentIndex + 1);
    });
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.close();
  });
  lightbox.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      showAt(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      showAt(currentIndex + 1);
    }
  });
  lightbox.addEventListener("close", () => {
    lbImg.removeAttribute("src");
    lbImg.alt = "";
    lbCaption.textContent = "";
    currentIndex = -1;
  });
}
