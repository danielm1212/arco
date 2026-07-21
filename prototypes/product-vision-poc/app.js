const state = {
  route: "today",
  previousRoute: "today",
  scenario: "default",
  sheet: null,
  sessionActive: false,
  sessionType: "planned",
  freestyleExerciseAdded: false,
  setValues: { kg: "", reps: "" },
  setCompleted: false,
  workoutCompleted: false,
  firstTip: true,
  restActive: false,
  equipmentOnly: true,
  teamUnread: true,
  toastTimer: null,
};

const phone = document.querySelector("#phone");
const app = document.querySelector("#app");
const chromeRoot = document.querySelector("#chrome-root");
const sheetRoot = document.querySelector("#sheet-root");
const toast = document.querySelector("#toast");

const navRoutes = ["today", "plans", "progress", "body", "history", "team"];

function icon(name, size = 22) {
  const paths = {
    flame: '<path d="M12 22c4.4 0 8-3 8-7.4 0-3.1-1.7-5.8-5-8.3.1 2.5-1.1 4.2-2.5 5.2.2-4-1.9-7.1-5.2-9.5.3 3-1.3 5.4-2.8 7.2C3.1 11 4 14 4 15.2 4 19.2 7.6 22 12 22Z"/><path d="M9 18c0-1.9 1.2-3 3.1-4.6.2 1.5 1.1 2.3 1.7 3 .5.5.8 1.1.8 1.8 0 1.5-1.2 2.8-2.8 2.8S9 19.8 9 18Z"/>',
    dumbbell: '<path d="m6.5 6.5 11 11"/><path d="m5 8-2 2 3 3 2-2"/><path d="m16 13 2-2 3 3-2 2"/><path d="m8 5 2-2 3 3-2 2"/><path d="m13 16-2 2 3 3 2-2"/>',
    trend: '<path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    copy: '<rect width="13" height="13" x="9" y="9" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    filter: '<path d="M4 5h16"/><path d="M7 12h10"/><path d="M10 19h4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.info}</svg>`;
}

function header() {
  return `<header class="app-header">
    <img class="logo" src="../../public/logo.svg" alt="Arco" />
    <div class="header-actions">
      <button class="goal-badge" type="button" data-action="goal" aria-label="Cel tygodniowy: ${state.workoutCompleted ? "1" : "0"} z 2 treningów">
        ${icon("flame", 20)}<span>${state.workoutCompleted ? "1/2" : "0/2"}</span>
      </button>
      <button class="avatar" type="button" data-action="profile" aria-label="Otwórz profil">D</button>
    </div>
  </header>`;
}

function segment(first, second, active) {
  return `<nav class="segment" aria-label="Nawigacja lokalna">
    <button type="button" class="${active === first.route ? "active" : ""}" data-action="route" data-route="${first.route}">${first.label}</button>
    <button type="button" class="${active === second.route ? "active" : ""}" data-action="route" data-route="${second.route}">${second.label}</button>
  </nav>`;
}

function toolbar(title, fallback = "today") {
  return `<header class="topbar">
    <button class="back-button" type="button" data-action="route" data-route="${fallback}" aria-label="Wróć">${icon("back", 25)}</button>
    <h1>${title}</h1><span></span>
  </header>`;
}

function renderToday() {
  if (state.scenario === "noPlan") {
    return `<main class="screen">
      ${header()}
      ${segment({ route: "today", label: "Dziś" }, { route: "plans", label: "Plany" }, "today")}
      <section class="card empty-state">
        <img class="moment-image" src="../../public/icons-3d/icon-3d-notebook-light.png" alt="" />
        <h1>Wybierz pierwszy plan</h1>
        <p>Plan daje Ci kolejność ćwiczeń i prosty następny krok. Możesz też zacząć własny trening.</p>
        <div class="empty-actions">
          <button class="button full" type="button" data-action="route" data-route="plans">Przeglądaj plany</button>
          <button class="button secondary full" type="button" data-action="freestyle">Własny trening</button>
        </div>
      </section>
    </main>`;
  }

  const activeCopy = state.sessionActive
    ? `<section class="card" style="margin-bottom:14px"><p class="eyebrow">Sesja zminimalizowana</p><h2>Trening czeka w mini-barze</h2><p class="secondary-text small" style="margin-bottom:0">Możesz swobodnie przeglądać aplikację. Wyniki i timer pozostają zapisane.</p></section>`
    : "";

  return `<main class="screen">
    ${header()}
    ${segment({ route: "today", label: "Dziś" }, { route: "plans", label: "Plany" }, "today")}
    ${activeCopy}
    <section class="card hero">
      <div class="hero-topline"><p class="eyebrow">Następny trening</p><span class="plan-context">Średniozaawansowany · Siłownia</span></div>
      <h1>Trening B</h1>
      <p class="secondary-text">Następny w rotacji A → B</p>
      <div class="meta-row"><span>7 ćwiczeń</span><span>około 47 min</span></div>
      <button class="button full" type="button" data-action="start" ${state.sessionActive ? "disabled" : ""}>${state.sessionActive ? "Sesja już trwa" : "Zacznij trening"}</button>
      <div class="quick-actions">
        <button type="button" data-action="preview">Podgląd ćwiczeń</button>
        <button type="button" data-action="day-picker">Zmień</button>
        <button class="freestyle-link" type="button" data-action="freestyle">Własny trening</button>
      </div>
    </section>
    <button class="context-row" type="button" data-action="route" data-route="plans">
      <span class="tile-icon">${icon("book")}</span>
      <span class="row-copy"><strong>Plany i biblioteka</strong><span>Aktywny plan, filtry i własne programy</span></span>
      <span class="chevron">${icon("chevron")}</span>
    </button>
  </main>`;
}

function renderPlans() {
  const matchCount = state.equipmentOnly ? 6 : 12;
  return `<main class="screen">
    ${header()}
    ${segment({ route: "today", label: "Dziś" }, { route: "plans", label: "Plany" }, "plans")}
    <section class="card">
      <p class="eyebrow">Aktywny plan</p>
      <h2>Średniozaawansowany · Siłownia</h2>
      <p class="secondary-text small">2 dni w rotacji · cel 2 razy w tygodniu</p>
      <button class="text-button" type="button" data-action="toast" data-message="Otwieramy szczegóły aktywnego planu">Zobacz plan</button>
    </section>
    <div class="section-title"><h2>Biblioteka</h2><button class="text-button" type="button" data-action="filters">Filtry</button></div>
    <button class="context-row filter-summary" type="button" data-action="filters">
      <span class="tile-icon">${icon("filter")}</span>
      <span class="filter-copy"><strong>${matchCount} pasujących planów</strong><span>${state.equipmentOnly ? "Tylko z moim sprzętem" : "Cała biblioteka"}</span></span>
      <span class="pill active">Zmień</span>
    </button>
    <div class="stack" style="margin-top:14px">
      ${planRow("Całe ciało od podstaw", "2 dni · Siłownia · Początkujący")}
      ${planRow("Góra i dół", "3 dni · Siłownia · Średniozaawansowany")}
      ${planRow("Hantle w domu", "3 dni · Hantle · Hipertrofia")}
    </div>
    <button class="button secondary full" style="margin-top:16px" type="button" data-action="toast" data-message="Kreator własnego programu">${icon("plus", 19)} Utwórz własny program</button>
  </main>`;
}

function planRow(name, meta) {
  return `<button class="plan-row" type="button" data-action="toast" data-message="Szczegóły planu: ${name}">
    <span class="row-copy"><strong>${name}</strong><span>${meta}</span></span><span class="chevron">${icon("chevron")}</span>
  </button>`;
}

function renderProgress() {
  return `<main class="screen">
    ${header()}
    ${segment({ route: "progress", label: "Trening" }, { route: "body", label: "Ciało" }, "progress")}
    <div class="section-title"><h2>Ostatnie 8 tygodni</h2><span class="pill">8 tyg.</span></div>
    <div class="metric-grid"><div class="metric"><strong>8</strong><span>treningów</span></div><div class="metric"><strong>+12%</strong><span>objętości</span></div></div>
    <section class="card" style="margin-top:14px"><p class="eyebrow">Kolejny krok</p><h2>Powtórz 17 kg przy 15 powtórzeniach</h2><p class="secondary-text small" style="margin-bottom:0">Na podstawie dwóch ostatnich serii Face Pull.</p></section>
  </main>`;
}

function renderBody() {
  return `<main class="screen">
    ${header()}
    ${segment({ route: "progress", label: "Trening" }, { route: "body", label: "Ciało" }, "body")}
    <section class="card"><p class="eyebrow">Ostatni pomiar</p><div class="number-hero">74,0</div><p class="secondary-text">kg · 14 lipca 2026</p><button class="button full" type="button" data-action="toast" data-message="Otwieramy osobny ekran dodawania pomiaru">Dodaj pomiar</button></section>
    <div class="section-title"><h2>Historia pomiarów</h2></div>
    <section class="card"><div class="history-row"><span class="tile-icon success">${icon("check")}</span><span class="row-copy"><strong>74,0 kg</strong><span>„Super bomba” · 1 zdjęcie</span></span><span class="small secondary-text">14 lip</span></div></section>
  </main>`;
}

function renderHistory() {
  return `<main class="screen">
    ${header()}
    <div class="section-title" style="padding-top:7px"><h1 style="margin:0">Historia</h1></div>
    <button class="button secondary full" type="button" data-action="route" data-route="historyAdd">${icon("plus", 19)} Dodaj trening po fakcie</button>
    <div class="section-title"><h2>Lipiec</h2><button class="text-button" type="button" data-action="toast" data-message="Filtry Historii">Filtry</button></div>
    <section class="card stack">
      ${historyRow("Trening B", "Wczoraj · 47 min", "4 820 kg", false)}
      ${historyRow("Własny trening", "14 lip · 36 min", "3 110 kg", true)}
      ${historyRow("Trening A", "12 lip · 44 min", "4 340 kg", false)}
    </section>
  </main>`;
}

function historyRow(name, meta, value, freestyle) {
  return `<button class="history-row" type="button" data-action="history-detail" data-freestyle="${freestyle}">
    <span class="tile-icon success">${icon("check")}</span><span class="row-copy"><strong>${name}</strong><span>${meta}</span></span><strong>${value}</strong>
  </button>`;
}

function renderHistoryDetail() {
  const freestyle = state.sessionType === "freestyle";
  return `<main class="screen focus">
    ${toolbar("Szczegóły treningu", "history")}
    <section class="card"><p class="eyebrow">14 lipca · 18:10</p><h1>${freestyle ? "Własny trening" : "Trening B"}</h1><div class="meta-row"><span>36 min</span><span>3 110 kg</span><span>8 serii</span></div></section>
    <div class="section-title"><h2>Ćwiczenia</h2><button class="text-button" type="button" data-action="toast" data-message="Edycja nie uruchomi celebracji ani check-inu">Edytuj</button></div>
    <section class="card stack">${planRow("Wyciskanie hantli", "3 serie · 22,5 kg")}${planRow("Wiosłowanie hantlą", "3 serie · 24 kg")}</section>
    ${freestyle ? `<button class="button secondary full" style="margin-top:16px" type="button" data-action="save-template">${icon("book", 19)} Zapisz jako program</button>` : ""}
  </main>`;
}

function renderHistoryAdd() {
  return `<main class="screen focus">
    ${toolbar("Trening po fakcie", "history")}
    <section class="card"><p class="eyebrow">Prawdziwa data</p><h2>Kiedy trenowałeś?</h2><div class="meta-row"><span class="pill active">Wczoraj · 18:00</span><span class="pill">60 minut</span></div></section>
    <div class="section-title"><h2>Co trenowałeś?</h2></div>
    <div class="stack">${planRow("Własny trening", "Dobierz ćwiczenia samodzielnie")}${planRow("Trening A", "Aktywny plan · 7 ćwiczeń")}${planRow("Trening B", "Aktywny plan · 7 ćwiczeń")}</div>
    <p class="secondary-text small" style="margin:15px 2px">Zapis trafia prosto do Historii, bez pełnoekranowej celebracji i check-inu Ekipy.</p>
  </main>`;
}

function renderTeam() {
  state.teamUnread = false;
  return `<main class="screen">
    ${header()}
    <div class="section-title" style="padding-top:7px"><h1 style="margin:0">Ekipa</h1><button class="pill" type="button" data-action="toast" data-message="Przełącznik zapamięta ostatnią Ekipę">Żelazna Trójka ${icon("down", 15)}</button></div>
    <section class="card">
      <p class="eyebrow">Kod zaproszenia</p><h2>Trenujecie bez rankingu</h2><p class="secondary-text small">Ekipa widzi obecność i regularność. Nie widzi ciężarów, notatek ani zdjęć.</p>
      <button class="team-code" type="button" data-action="copy-code"><strong>ARCO7K2P</strong><span>${icon("copy")}</span></button>
    </section>
    <div class="section-title"><h2>3 osoby</h2><span class="small secondary-text">max 6</span></div>
    <section class="card stack">
      ${memberRow("D", "Daniel", "1/2 · trening wczoraj", "")}
      ${memberRow("M", "Marek", "2/3 · trening dziś", "👏")}
      ${memberRow("A", "Ania", "0/2 · ostatnio 4 dni temu", "Wesprzyj")}
    </section>
  </main>`;
}

function memberRow(letter, name, meta, action) {
  return `<div class="member-row"><span class="avatar">${letter}</span><span class="row-copy"><strong>${name}</strong><span>${meta}</span></span>${action ? `<button class="chip" type="button" data-action="toast" data-message="Wsparcie wysłane bez presji">${action}</button>` : ""}</div>`;
}

function renderSession() {
  const freestyle = state.sessionType === "freestyle";
  const valuesReady = state.setValues.kg.trim() && state.setValues.reps.trim();
  const completeClass = state.setCompleted ? "done" : valuesReady ? "ready" : "";
  const completeLabel = state.setCompleted ? `Zaliczono ${icon("check", 16)}` : "Zalicz serię";
  return `<main class="screen session">
    <header class="logger-header">
      <div class="logger-top">
        <button class="back-button" type="button" data-action="minimize" aria-label="Zminimalizuj trening">${icon("down", 25)}</button>
        <div class="logger-title"><strong>${freestyle ? "Własny trening" : "Trening B"}</strong><span>${freestyle ? "Dodawaj ćwiczenia po kolei" : "Średniozaawansowany · Siłownia"}</span></div>
        <button class="finish-top" type="button" data-action="finish">Zakończ</button>
        <button class="back-button" type="button" data-action="toast" data-message="Menu sesji" aria-label="Menu sesji">${icon("dots")}</button>
      </div>
      <div class="session-stats"><span>${icon("clock", 16)} 12:08</span><span>${icon("dumbbell", 16)} ${state.setCompleted ? "225 kg" : "0 kg"}</span><span>${icon("check", 16)} ${state.setCompleted ? "1" : "0"} serii</span></div>
    </header>
    <div class="session-content">
      ${state.firstTip ? `<div class="coach-tip"><span>${icon("info", 20)}</span><span><strong>Pierwszy trening:</strong> wpisz ciężar i powtórzenia. Przycisk „Zalicz serię” podświetli się, gdy wynik będzie gotowy.</span><button type="button" data-action="dismiss-tip" aria-label="Zamknij podpowiedź">${icon("close", 18)}</button></div>` : ""}
      ${freestyle && !state.freestyleExerciseAdded ? `<section class="card" style="margin-bottom:14px"><p class="eyebrow">Własna sesja</p><h2>Zacznij od ćwiczenia</h2><p class="secondary-text small">Dodaj je z biblioteki albo utwórz własne bez opuszczania treningu.</p><button class="button full" type="button" data-action="exercise-picker">${icon("plus", 19)} Dodaj ćwiczenie</button></section>` : exerciseCard("Wyciskanie hantli na skosie", "3 × 8–10", valuesReady, completeClass, completeLabel)}
      ${state.restActive ? `<div class="rest-bar"><span>Przerwa po serii</span><strong>01:28</strong><button type="button" data-action="rest-stop">Pomiń</button></div>` : ""}
      ${!freestyle ? exerciseCard("Wiosłowanie hantlą jednorącz", "3 × 10–12", false, "", "Zalicz serię", true) : ""}
      ${freestyle && !state.freestyleExerciseAdded ? "" : `<button class="button secondary full add-exercise" type="button" data-action="exercise-picker">${icon("plus", 19)} Dodaj ćwiczenie</button>`}
      <button class="button full finish-bottom" type="button" data-action="finish">Zakończ trening</button>
    </div>
  </main>`;
}

function exerciseCard(name, target, valuesReady, completeClass, completeLabel, locked = false) {
  const kg = locked ? "" : state.setValues.kg;
  const reps = locked ? "" : state.setValues.reps;
  return `<section class="exercise-card">
    <div class="exercise-heading"><div><h2>${name}</h2><p>${target}</p></div><button class="back-button" type="button" data-action="toast" data-message="Szczegóły i podmiana ćwiczenia" aria-label="Opcje ćwiczenia">${icon("dots")}</button></div>
    <div class="set-head"><span>#</span><span>kg</span><span>powt.</span><span>akcja</span></div>
    <div class="set-row">
      <span class="set-index">1</span>
      <input class="set-input" data-field="kg" inputmode="decimal" value="${kg}" placeholder="0" ${locked ? "disabled" : ""} aria-label="Ciężar serii pierwszej" />
      <input class="set-input" data-field="reps" inputmode="numeric" value="${reps}" placeholder="0" ${locked ? "disabled" : ""} aria-label="Powtórzenia serii pierwszej" />
      <button class="complete-set ${completeClass}" type="button" data-action="complete-set" ${locked || !valuesReady ? "disabled" : ""}>${completeLabel}</button>
    </div>
  </section>`;
}

function renderDone() {
  const freestyle = state.sessionType === "freestyle";
  return `<main class="screen moment">
    <img class="moment-image" src="../../public/icons-3d/icon-3d-tick-light.png" alt="" />
    <p class="eyebrow">Trening zapisany</p>
    <div class="number-hero">${state.setCompleted ? "1" : "0"}</div>
    <h1>${state.setCompleted ? "zaliczona seria" : "ukończony trening"}</h1>
    <p>${state.setCompleted ? "Pierwszy prawdziwy wynik jest zapisany. Przy kolejnym treningu Arco wykorzysta go jako punkt odniesienia." : "Historia została zaktualizowana."}</p>
    <div class="sheet-actions">
      ${freestyle ? `<button class="button secondary full" type="button" data-action="save-template">${icon("book", 19)} Zapisz jako program</button>` : ""}
      <button class="button full" type="button" data-action="done-home">Wróć na ekran główny</button>
    </div>
  </main>`;
}

function bottomNav() {
  if (!navRoutes.includes(state.route)) return "";
  const active = state.route === "plans" ? "training" : state.route === "body" ? "progress" : state.route;
  return `<nav class="bottom-nav" aria-label="Główna nawigacja">
    ${navItem("training", "today", "dumbbell", "Trening", active)}
    ${navItem("progress", "progress", "trend", "Postępy", active)}
    ${navItem("history", "history", "history", "Historia", active)}
    ${navItem("team", "team", "users", "Ekipa", active, state.teamUnread)}
  </nav>`;
}

function navItem(id, route, iconName, label, active, unread = false) {
  return `<button class="nav-item ${active === id ? "active" : ""}" type="button" data-action="route" data-route="${route}">${unread ? '<span class="unread-dot" aria-label="Nowe zdarzenie"></span>' : ""}${icon(iconName, 22)}<span>${label}</span></button>`;
}

function miniSession() {
  if (!state.sessionActive || state.route === "session" || state.route === "done") return "";
  return `<button class="mini-session" type="button" data-action="resume"><span>${icon("dumbbell", 23)}</span><span class="row-copy"><strong>${state.sessionType === "freestyle" ? "Własny trening" : "Trening B"}</strong><span>${state.setCompleted ? "1 seria · 225 kg" : "Trening w toku · 12:08"}</span></span><span class="pill">Wznów</span></button>`;
}

function sheet(title, description, body, actions = "") {
  return `<div class="overlay" data-action="close-sheet" aria-hidden="true"></div>
    <section class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <button class="sheet-handle" type="button" aria-label="Przeciągnij w dół, aby zamknąć"></button>
      <div class="sheet-header"><div><h2 id="sheet-title">${title}</h2>${description ? `<p class="secondary-text small">${description}</p>` : ""}</div><button class="sheet-close" type="button" data-action="close-sheet" aria-label="Zamknij">${icon("close")}</button></div>
      ${body}${actions ? `<div class="sheet-actions">${actions}</div>` : ""}
    </section>`;
}

function renderSheet() {
  if (!state.sheet) return "";
  if (state.sheet === "goal") {
    return sheet("Twój cel: 2 treningi", "Liczymy ukończone treningi w bieżącym tygodniu.", `<div class="week-grid"><div class="day ${state.workoutCompleted ? "done" : ""}">Pn${state.workoutCompleted ? "<br>✓" : ""}</div><div class="day">Wt</div><div class="day">Śr</div><div class="day">Cz</div><div class="day">Pt</div><div class="day">So</div><div class="day">Nd</div></div><p class="small secondary-text">Cel wynika z aktywnego planu. Możesz zmienić go w zakresie, który plan realnie obsługuje.</p>`, `<button class="button secondary full" type="button" data-action="toast" data-message="Ustawienia celu">Zmień cel</button>`);
  }
  if (state.sheet === "freestyle") {
    return sheet("Zacząć własny trening?", "Sesja nie zmieni aktywnego planu ani jego rotacji.", `<div class="choice-row"><span class="tile-icon">${icon("dumbbell")}</span><span class="row-copy"><strong>Własny trening</strong><span>Sam wybierzesz ćwiczenia i serie</span></span></div>`, `<button class="button full" type="button" data-action="confirm-freestyle">Zacznij własny trening</button><button class="button secondary full" type="button" data-action="close-sheet">Anuluj</button>`);
  }
  if (state.sheet === "filters") {
    return sheet("Filtry programów", `${state.equipmentOnly ? 6 : 12} planów pasuje do wyboru.`, `<div class="switch-row"><span class="row-copy"><strong>Tylko z moim sprzętem</strong><span>Siłownia · zapisane w profilu</span></span><button class="switch ${state.equipmentOnly ? "on" : ""}" type="button" data-action="toggle-equipment" aria-label="Tylko z moim sprzętem"></button></div><div class="section-title"><h3>Poziom</h3></div><div class="sheet-chip-row"><button class="chip active">Każdy</button><button class="chip">Początkujący</button><button class="chip">Średniozaawansowany</button></div><div class="section-title"><h3>Cel</h3></div><div class="sheet-chip-row"><button class="chip active">Każdy</button><button class="chip">Siła</button><button class="chip">Hipertrofia</button></div>`, `<button class="button full" type="button" data-action="apply-filters">Pokaż ${state.equipmentOnly ? 6 : 12} planów</button>`);
  }
  if (state.sheet === "preview") {
    return sheet("Trening B", "7 ćwiczeń · około 47 min", `<div class="sheet-results">${choice("Wykroki chodzone ze sztangą", "3 × 8–10")}${choice("Podciąganie nachwytem", "3 × 6–8")}${choice("Wyciskanie hantli na skosie", "3 × 8–10")}${choice("Face Pull", "3 × 12–15")}</div>`, `<button class="button full" type="button" data-action="start">Zacznij trening</button>`);
  }
  if (state.sheet === "day") {
    return sheet("Wybierz następny trening", "Zmiana nie rusza aktywnego planu.", `<div class="sheet-results">${choice("Trening A", "7 ćwiczeń · około 45 min", "toast")}${choice("Trening B", "Następny w rotacji", "toast")}</div>`);
  }
  if (state.sheet === "exercise") {
    return sheet("Dodaj ćwiczenie", "Wyniki są widoczne przed filtrami.", `<input class="search-field" placeholder="Szukaj po polskiej lub angielskiej nazwie" aria-label="Szukaj ćwiczenia" /><div class="sheet-results">${choice("Wyciskanie hantli na skosie", "Klatka · hantle", "add-picked")}${choice("Wiosłowanie hantlą jednorącz", "Plecy · hantle", "add-picked")}${choice("Face Pull", "Barki · wyciąg", "add-picked")}</div><button class="text-button" style="margin-top:10px" type="button" data-action="toast" data-message="Rozwijamy partie, sprzęt i wzorzec ruchu">Więcej filtrów</button>`, `<button class="button secondary full" type="button" data-action="toast" data-message="Tworzymy ćwiczenie i wracamy do tego miejsca">${icon("plus", 18)} Utwórz własne ćwiczenie</button>`);
  }
  if (state.sheet === "finish-empty") {
    return sheet("Brak zaliczonych serii", "Pusty trening nie trafi do Historii ani celu tygodniowego.", `<div class="choice-row"><span class="tile-icon">${icon("shield")}</span><span class="row-copy"><strong>To mogło być przypadkowe uruchomienie</strong><span>Wróć i dodaj serię albo usuń pustą sesję</span></span></div>`, `<button class="button full" type="button" data-action="close-sheet">Wróć do treningu</button><button class="button secondary full" type="button" data-action="discard-empty">Usuń pusty trening</button>`);
  }
  if (state.sheet === "finish-dirty") {
    return sheet("Seria nie jest zaliczona", "Wpisałeś wynik, ale nie nacisnąłeś „Zalicz serię”.", `<div class="choice-row"><span class="tile-icon">${icon("info")}</span><span class="row-copy"><strong>${state.setValues.kg || "0"} kg × ${state.setValues.reps || "0"}</strong><span>Wynik pozostanie szkicem, dopóki go nie zaliczysz</span></span></div>`, `<button class="button full" type="button" data-action="close-sheet">Wróć i zalicz serię</button><button class="button secondary full" type="button" data-action="finish-confirm">Zakończ bez tej serii</button>`);
  }
  if (state.sheet === "finish-incomplete") {
    return sheet("Zakończyć trening?", "Zaliczono 1 z 6 zaplanowanych serii.", `<div class="choice-row"><span class="tile-icon success">${icon("check")}</span><span class="row-copy"><strong>Twój wynik jest bezpieczny</strong><span>Możesz wrócić albo zakończyć krótszy trening</span></span></div>`, `<button class="button full" type="button" data-action="close-sheet">Wróć do treningu</button><button class="button secondary full" type="button" data-action="finish-confirm">Zakończ trening</button>`);
  }
  if (state.sheet === "template") {
    return sheet("Zapisz jako program", "Ćwiczenia i serie utworzą nieaktywny program. Ciężary pozostaną tylko w Historii.", `<label class="row-copy" for="template-name"><strong>Nazwa programu</strong><span>Możesz zmienić ją później</span></label><input id="template-name" class="search-field" value="Mój trening" />`, `<button class="button full" type="button" data-action="template-saved">Zapisz program</button>`);
  }
  if (state.sheet === "scenario") {
    return sheet("Scenariusze POC", "Szybkie stany do oceny hierarchii i zabezpieczeń.", `<div class="sheet-results">${scenarioChoice("Stan bazowy", "default")}${scenarioChoice("Brak aktywnego planu", "noPlan")}${scenarioChoice("Pierwszy trening w toku", "first")}${scenarioChoice("Własny trening w toku", "freestyle")}</div>`);
  }
  return "";
}

function choice(title, meta, action = "toast") {
  return `<button class="choice-row" type="button" data-action="${action}" data-message="Wybrano: ${title}"><span class="row-copy"><strong>${title}</strong><span>${meta}</span></span><span>${icon("chevron")}</span></button>`;
}

function scenarioChoice(title, value) {
  return `<button class="choice-row" type="button" data-action="set-scenario" data-value="${value}"><span class="row-copy"><strong>${title}</strong><span>Ustaw i przejdź do ekranu Trening</span></span><span>${icon("chevron")}</span></button>`;
}

function render() {
  const renderers = {
    today: renderToday,
    plans: renderPlans,
    progress: renderProgress,
    body: renderBody,
    history: renderHistory,
    historyDetail: renderHistoryDetail,
    historyAdd: renderHistoryAdd,
    team: renderTeam,
    session: renderSession,
    done: renderDone,
  };
  app.innerHTML = (renderers[state.route] || renderToday)();
  chromeRoot.innerHTML = `${bottomNav()}${miniSession()}`;
  sheetRoot.innerHTML = renderSheet();
  phone.classList.toggle("sheet-open", Boolean(state.sheet));
  bindSheetGesture();
}

function navigate(route) {
  if (route === state.route) return;
  state.previousRoute = state.route;
  state.route = route;
  state.sheet = null;
  app.scrollTop = 0;
  render();
}

function openSheet(name) {
  state.sheet = name;
  render();
  requestAnimationFrame(() => sheetRoot.querySelector(".sheet-close")?.focus());
}

function closeSheet() {
  state.sheet = null;
  render();
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  state.toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function startSession(type = "planned") {
  state.sessionType = type;
  state.freestyleExerciseAdded = type === "planned";
  state.sessionActive = true;
  state.setValues = { kg: "", reps: "" };
  state.setCompleted = false;
  state.restActive = false;
  state.firstTip = true;
  navigate("session");
}

function finishSession() {
  const hasDraft = state.setValues.kg.trim() || state.setValues.reps.trim();
  if (!state.setCompleted && !hasDraft) return openSheet("finish-empty");
  if (!state.setCompleted && hasDraft) return openSheet("finish-dirty");
  return openSheet("finish-incomplete");
}

function bindSheetGesture() {
  const handle = sheetRoot.querySelector(".sheet-handle");
  if (!handle) return;
  let startY = 0;
  handle.addEventListener("pointerdown", (event) => {
    startY = event.clientY;
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener("pointerup", (event) => {
    if (event.clientY - startY > 45) closeSheet();
  });
}

document.addEventListener("input", (event) => {
  const field = event.target.closest("[data-field]");
  if (!field) return;
  state.setValues[field.dataset.field] = field.value;
  const button = app.querySelector(".complete-set");
  const ready = state.setValues.kg.trim() && state.setValues.reps.trim();
  if (button && !state.setCompleted) {
    button.disabled = !ready;
    button.classList.toggle("ready", Boolean(ready));
  }
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "route") return navigate(target.dataset.route);
  if (action === "goal") return openSheet("goal");
  if (action === "profile") return showToast("Profil i ustawienia otwierają osobny ekran focus");
  if (action === "start") return startSession("planned");
  if (action === "freestyle") return openSheet("freestyle");
  if (action === "confirm-freestyle") return startSession("freestyle");
  if (action === "preview") return openSheet("preview");
  if (action === "day-picker") return openSheet("day");
  if (action === "filters") return openSheet("filters");
  if (action === "toggle-equipment") {
    state.equipmentOnly = !state.equipmentOnly;
    return render();
  }
  if (action === "apply-filters") {
    closeSheet();
    return showToast(`Pokazujemy ${state.equipmentOnly ? 6 : 12} planów`);
  }
  if (action === "exercise-picker") return openSheet("exercise");
  if (action === "add-picked") {
    state.freestyleExerciseAdded = true;
    closeSheet();
    state.setValues = { kg: "", reps: "" };
    return showToast(target.dataset.message || "Ćwiczenie dodane");
  }
  if (action === "dismiss-tip") {
    state.firstTip = false;
    return render();
  }
  if (action === "complete-set") {
    if (!state.setValues.kg.trim() || !state.setValues.reps.trim()) return;
    state.setCompleted = true;
    state.restActive = true;
    state.firstTip = false;
    render();
    return showToast("Seria zaliczona. Timer wystartował.");
  }
  if (action === "rest-stop") {
    state.restActive = false;
    render();
    return showToast("Przerwa zakończona");
  }
  if (action === "minimize") {
    state.sessionActive = true;
    navigate("today");
    return showToast("Trening zminimalizowany");
  }
  if (action === "resume") return navigate("session");
  if (action === "finish") return finishSession();
  if (action === "finish-confirm") {
    state.sessionActive = false;
    state.workoutCompleted = true;
    state.sheet = null;
    return navigate("done");
  }
  if (action === "discard-empty") {
    state.sessionActive = false;
    state.sheet = null;
    state.setValues = { kg: "", reps: "" };
    navigate("today");
    return showToast("Pusty trening usunięty");
  }
  if (action === "done-home") {
    state.sessionActive = false;
    state.scenario = "default";
    return navigate("today");
  }
  if (action === "history-detail") {
    state.sessionType = target.dataset.freestyle === "true" ? "freestyle" : "planned";
    return navigate("historyDetail");
  }
  if (action === "save-template") return openSheet("template");
  if (action === "template-saved") {
    closeSheet();
    return showToast("Program zapisany. Nie został aktywowany.");
  }
  if (action === "copy-code") return showToast("Kod ARCO7K2P skopiowany");
  if (action === "scenario") return openSheet("scenario");
  if (action === "set-scenario") {
    const value = target.dataset.value;
    state.scenario = value === "noPlan" ? "noPlan" : "default";
    state.sessionActive = value === "first" || value === "freestyle";
    state.sessionType = value === "freestyle" ? "freestyle" : "planned";
    state.freestyleExerciseAdded = value !== "freestyle";
    state.setValues = { kg: "", reps: "" };
    state.setCompleted = false;
    state.firstTip = true;
    state.sheet = null;
    state.route = value === "first" || value === "freestyle" ? "session" : "today";
    return render();
  }
  if (action === "toast") return showToast(target.dataset.message || "To działanie jest poza zakresem POC");
  if (action === "close-sheet") return closeSheet();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.sheet) closeSheet();
});

render();
