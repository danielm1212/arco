const state = {
  route: "today",
  scenario: "default",
  sessionActive: false,
  sessionMode: "live",
  teamActive: false,
  historyChoice: null,
  backfillJustSaved: false,
};

const scenarioLabels = {
  default: "Stan podstawowy",
  noPlan: "Brak aktywnego planu",
  active: "Aktywna sesja",
  offline: "Tryb offline",
  error: "Błąd danych",
  long: "Długie nazwy",
};

const routeConfig = {
  today: { tab: "training", nav: true },
  plans: { tab: "training", nav: true },
  planDetail: { tab: "training", nav: true },
  progress: { tab: "progress", nav: true },
  body: { tab: "progress", nav: true },
  bodyAdd: { tab: "progress", nav: false },
  history: { tab: "history", nav: true },
  historyAdd: { tab: "history", nav: false },
  team: { tab: "team", nav: true },
  session: { tab: "training", nav: false },
  settings: { tab: null, nav: false },
};

const app = document.querySelector("#app");
const sheetRoot = document.querySelector("#sheet-root");
const toast = document.querySelector("#toast");
let toastTimer;

function header() {
  return `
    <header class="app-header">
      <div class="brand" aria-label="Arco">arco</div>
      <div class="header-actions">
        <button class="goal-badge" type="button" data-action="goal" aria-label="Cel tygodniowy: 1 z 2 treningów">● <span>1/2</span></button>
        <button class="avatar" type="button" data-action="settings" aria-label="Otwórz profil">DK</button>
      </div>
    </header>`;
}

function toolbar(title, back = "back") {
  const icon = back === "minimize" ? "⌄" : "‹";
  const label = back === "minimize" ? "Zminimalizuj trening" : "Wróć";
  return `
    <header class="toolbar">
      <button class="back-button" type="button" data-action="${back}" aria-label="${label}">${icon}</button>
      <h1>${title}</h1>
      <span aria-hidden="true"></span>
    </header>`;
}

function trainingSegment(active) {
  return `
    <nav class="segment" aria-label="Sekcja Trening">
      <button class="${active === "today" ? "active" : ""}" type="button" data-action="today">Dziś</button>
      <button class="${active === "plans" ? "active" : ""}" type="button" data-action="plans">Plany</button>
    </nav>`;
}

function progressSegment(active) {
  return `
    <nav class="segment" aria-label="Sekcja Postępy">
      <button class="${active === "progress" ? "active" : ""}" type="button" data-action="progress">Trening</button>
      <button class="${active === "body" ? "active" : ""}" type="button" data-action="body">Ciało</button>
    </nav>`;
}

function scenarioBanner() {
  if (state.scenario === "offline") {
    return `<div class="banner offline"><span aria-hidden="true">↯</span><span>Jesteś offline. Pokazujemy zapisane dane, a trening zsynchronizuje się później.</span></div>`;
  }
  if (state.scenario === "error") {
    return `<div class="banner error"><span aria-hidden="true">!</span><span>Nie udało się pobrać części danych. Możesz spróbować ponownie.</span></div>`;
  }
  return "";
}

function renderToday() {
  if (state.scenario === "noPlan") {
    return `
      <main class="screen">
        ${header()}
        ${trainingSegment("today")}
        <section class="card empty">
          <div class="empty-illustration" aria-hidden="true">◎</div>
          <h2>Wybierz swój pierwszy plan</h2>
          <p>Dopasujemy następny trening do miejsca, poziomu i liczby dni w tygodniu.</p>
          <div class="empty-actions">
            <button class="button full" type="button" data-action="plans">Przeglądaj plany</button>
            <button class="button ghost full" type="button" data-action="start-custom">Zacznij bez planu</button>
          </div>
        </section>
      </main>`;
  }

  const active = state.sessionActive || state.scenario === "active";
  const title = state.scenario === "long"
    ? "Dół B: pośladki, tył uda i stabilizacja jednostronna"
    : "Trening B";
  const plan = state.scenario === "long"
    ? "Początkujący i średniozaawansowany · Dom z hantlami · Pośladki i nogi"
    : "Intermediate · Siłownia · FBW";

  if (state.scenario === "error") {
    return `
      <main class="screen">
        ${header()}
        ${trainingSegment("today")}
        ${scenarioBanner()}
        <section class="card empty">
          <div class="empty-illustration" aria-hidden="true">↻</div>
          <h2>Nie możemy pokazać treningu</h2>
          <p>Twoje dane są bezpieczne. Sprawdź połączenie i spróbuj ponownie.</p>
          <div class="empty-actions">
            <button class="button full" type="button" data-action="retry">Spróbuj ponownie</button>
            <button class="button ghost full" type="button" data-action="history">Przejdź do historii</button>
          </div>
        </section>
      </main>`;
  }

  return `
    <main class="screen">
      ${header()}
      ${trainingSegment("today")}
      ${scenarioBanner()}
      <section class="card hero">
        <div class="hero-content">
          <p class="eyebrow">${active ? "Trening w toku" : "Następny trening"}</p>
          <h1 class="hero-title">${title}</h1>
          <button class="text-button" type="button" data-action="plan-detail">${plan}</button>
          <div class="meta-row"><span>7 ćwiczeń</span><span>około 47 min</span></div>
        </div>
        <div class="hero-actions">
          <button class="button" type="button" data-action="${active ? "resume" : "start"}">${active ? "Wznów trening" : "Zacznij trening"}</button>
          <button class="button secondary" type="button" data-action="preview">Podgląd</button>
        </div>
      </section>

      <button class="context-row" type="button" data-action="plans">
        <span class="icon-tile" aria-hidden="true">▥</span>
        <span class="row-copy"><strong>Zmień następny trening</strong><span>Wybierz inny dzień lub plan</span></span>
        <span class="chevron" aria-hidden="true">›</span>
      </button>

      <div class="insight"><span aria-hidden="true">↗</span><span><strong>Dobra regularność.</strong> Jeszcze jeden trening i zamkniesz cel na ten tydzień.</span></div>
    </main>`;
}

function renderPlans() {
  const title = state.scenario === "long"
    ? "Początkujący i średniozaawansowany · Dom z hantlami · Pośladki i nogi"
    : "Intermediate · Siłownia · FBW";
  return `
    <main class="screen">
      ${header()}
      ${trainingSegment("plans")}
      ${scenarioBanner()}
      <section class="page-heading compact"><p class="eyebrow">Twój plan</p><h1>Plany</h1><p class="muted">Zobacz aktywny plan albo wybierz nowy.</p></section>
      <button class="card plan-card" type="button" data-action="plan-detail">
        <span class="plan-label">Aktywny</span>
        <h2>${title}</h2>
        <p class="muted small">2 treningi w rotacji · 2 razy w tygodniu</p>
        <div class="meta-row"><span>Siłownia</span><span>Całe ciało</span></div>
      </button>
      <div class="section-title"><h2>Biblioteka</h2><button class="text-button" type="button" data-action="filters">Filtry</button></div>
      <div class="filter-row" aria-label="Aktywne filtry"><button class="chip active">Wszystkie</button><button class="chip">Dom</button><button class="chip">Siłownia</button><button class="chip">Masa ciała</button></div>
      ${planCard("Pośladki i nogi", "3 dni · Dom z hantlami", "plan-detail")}
      ${planCard("Góra i dół ciała", "4 dni · Siłownia", "plan-detail")}
      ${planCard("Całe ciało od podstaw", "2 dni · Masa ciała", "plan-detail")}
    </main>`;
}

function planCard(name, meta, action) {
  return `<button class="card plan-card" type="button" data-action="${action}"><h3>${name}</h3><p class="muted small">${meta}</p><div class="meta-row"><span>Zobacz szczegóły</span><span aria-hidden="true">›</span></div></button>`;
}

function renderPlanDetail() {
  const title = state.scenario === "long"
    ? "Początkujący i średniozaawansowany · Dom z hantlami · Pośladki i nogi"
    : "Intermediate · Siłownia · FBW";
  return `
    <main class="screen">
      ${toolbar("Szczegóły planu")}
      <section class="card detail-hero">
        <p class="eyebrow">2 treningi w rotacji</p>
        <h1>${title}</h1>
        <p class="muted">Dwa zbalansowane treningi całego ciała.</p>
      </section>
      <div class="section-title"><h2>W planie</h2></div>
      <section class="card exercise-list">
        ${exerciseRow(1, "Trening A", "7 ćwiczeń · około 45 min")}
        ${exerciseRow(2, "Trening B", "7 ćwiczeń · około 47 min")}
      </section>
      <button class="button full" type="button" data-action="activate-plan">Ustaw jako aktywny</button>
    </main>`;
}

function exerciseRow(index, title, meta) {
  return `<div class="list-row"><span class="exercise-index">${index}</span><span class="row-copy"><strong>${title}</strong><span>${meta}</span></span><span class="chevron">›</span></div>`;
}

function renderProgress() {
  return `
    <main class="screen">
      ${header()}
      ${progressSegment("progress")}
      ${scenarioBanner()}
      <section class="page-heading compact"><p class="eyebrow">Ostatnie 8 tygodni</p><h1>Postępy</h1><p class="muted">Regularność i siła idą w dobrym kierunku.</p></section>
      <section class="card">
        <div class="section-title" style="margin-top:0"><h2>Objętość treningowa</h2><span class="small muted">+12%</span></div>
        <div class="chart" aria-label="Wykres objętości"><div class="chart-bar" style="height:38%"></div><div class="chart-bar" style="height:52%"></div><div class="chart-bar" style="height:46%"></div><div class="chart-bar" style="height:67%"></div><div class="chart-bar" style="height:61%"></div><div class="chart-bar current" style="height:86%"></div></div>
      </section>
      <div class="metric-grid"><div class="metric"><strong>8</strong><span>treningów</span></div><div class="metric"><strong>3</strong><span>nowe rekordy</span></div></div>
      <div class="section-title"><h2>Ćwiczenia</h2><button class="text-button">Zobacz wszystkie</button></div>
      <section class="card">
        ${exerciseRow("01", "Wyciskanie sztangi", "+5 kg w 6 tygodni")}
        ${exerciseRow("02", "Przysiad ze sztangą", "+7,5 kg w 6 tygodni")}
      </section>
    </main>`;
}

function renderBody() {
  return `
    <main class="screen">
      ${header()}
      ${progressSegment("body")}
      <section class="page-heading compact"><p class="eyebrow">Ostatni pomiar</p><h1>74,0 kg</h1><p class="muted">Spokojny trend z ostatnich 8 tygodni.</p></section>
      <section class="card"><div class="chart" aria-label="Wykres masy ciała"><div class="chart-bar" style="height:80%"></div><div class="chart-bar" style="height:72%"></div><div class="chart-bar" style="height:69%"></div><div class="chart-bar" style="height:62%"></div><div class="chart-bar" style="height:58%"></div><div class="chart-bar current" style="height:53%"></div></div></section>
      <button class="button full" type="button" data-action="body-add">Dodaj pomiar</button>
      <div class="section-title"><h2>Historia pomiarów</h2></div>
      <section class="card">
        <div class="history-row"><span class="icon-tile">74</span><span class="row-copy"><strong>74,0 kg</strong><span>Super forma. Zdjęcie przód.</span></span><time>14 lip</time></div>
        <div class="history-row"><span class="icon-tile">75</span><span class="row-copy"><strong>74,8 kg</strong><span>Bez notatki</span></span><time>1 lip</time></div>
      </section>
    </main>`;
}

function renderBodyAdd() {
  return `
    <main class="screen no-nav">
      ${toolbar("Dodaj pomiar")}
      <section class="page-heading"><h1>Zapisz dzisiejszy pomiar</h1><p class="muted">Waga jest wymagana. Resztę możesz uzupełnić później.</p></section>
      <section class="card form-card">
        <div class="field-row"><div class="field"><label for="weight">Waga (kg)</label><input id="weight" inputmode="decimal" placeholder="np. 74,0" /></div><div class="field"><label for="fat">Tkanka tłuszczowa</label><input id="fat" inputmode="decimal" placeholder="Opcjonalnie" /></div></div>
        <div class="field"><label for="note">Notatka</label><input id="note" placeholder="Jak się dziś czujesz?" /></div>
        <button class="choice" type="button" data-action="photos"><strong>Dodaj zdjęcia</strong><span>Maksymalnie 2 · 0/2</span></button>
        <button class="button full" type="button" data-action="save-measurement">Zapisz pomiar</button>
      </section>
      <p class="small muted" style="margin:14px 4px">Szkic zapisuje się automatycznie na tym urządzeniu.</p>
    </main>`;
}

function renderHistory() {
  return `
    <main class="screen">
      ${header()}
      <section class="page-heading compact"><p class="eyebrow">Twoja praca</p><h1>Historia</h1><p class="muted">Wróć do treningu albo popraw wcześniejsze dane.</p></section>
      ${state.backfillJustSaved ? `<section class="history-confirmation" role="status"><span class="confirmation-mark" aria-hidden="true">✓</span><span class="row-copy"><strong>Trening dodany do historii</strong><span>15 lip · 60 min · 7 ćwiczeń</span><span class="record-note">Nowy rekord: wyciskanie hantli 32,5 kg</span></span></section>` : ""}
      <button class="button full" type="button" data-action="history-add">Dodaj trening po fakcie</button>
      <div class="section-title"><h2>Lipiec</h2><button class="text-button">Filtry</button></div>
      <section class="card">
        ${historyRow("Trening B", "Wczoraj · 47 min", "4 820 kg")}
        ${historyRow("Trening A", "12 lip · 44 min", "4 340 kg")}
        ${historyRow("Własny trening", "9 lip · 36 min", "3 110 kg")}
      </section>
    </main>`;
}

function historyRow(title, date, volume) {
  return `<button class="history-row" type="button" data-action="history-detail"><span class="icon-tile" aria-hidden="true">✓</span><span class="row-copy"><strong>${title}</strong><span>${date}</span></span><span><strong>${volume}</strong></span></button>`;
}

function renderHistoryAdd() {
  return `
    <main class="screen no-nav">
      ${toolbar("Trening po fakcie")}
      <section class="page-heading"><h1>Kiedy trenowałeś?</h1><p class="muted">Ustaw prawdziwą datę. Potem wybierz, co trenowałeś.</p></section>
      <section class="card form-card">
        <div class="field-row"><div class="field"><label for="date">Data</label><input id="date" type="date" value="2026-07-15" /></div><div class="field"><label for="time">Godzina</label><input id="time" type="time" value="18:00" /></div></div>
        <div class="field"><label for="duration">Czas treningu</label><input id="duration" inputmode="numeric" value="60 min" /></div>
      </section>
      <div class="section-title"><h2>Co trenowałeś?</h2></div>
      <button class="choice ${state.historyChoice === "custom" ? "selected" : ""}" type="button" data-action="history-choice" data-value="custom"><strong>Własny trening</strong><span>Dobierz ćwiczenia samodzielnie</span></button>
      <button class="choice ${state.historyChoice === "a" ? "selected" : ""}" type="button" data-action="history-choice" data-value="a"><strong>Trening A</strong><span>Aktywny plan · 7 ćwiczeń</span></button>
      <button class="choice ${state.historyChoice === "b" ? "selected" : ""}" type="button" data-action="history-choice" data-value="b"><strong>Trening B</strong><span>Aktywny plan · 7 ćwiczeń</span></button>
      <button class="choice" type="button" data-action="other-plan"><strong>Wybierz inny plan</strong><span>Ostatnie, własne i biblioteka</span></button>
      <button class="button full" style="margin-top:16px" type="button" data-action="create-history" ${state.historyChoice ? "" : "disabled"}>Przejdź do serii</button>
      <p class="small muted" style="margin:14px 4px">Szkic zapisuje się automatycznie.</p>
    </main>`;
}

function renderTeam() {
  if (!state.teamActive) {
    return `
      <main class="screen">
        ${header()}
        <section class="page-heading compact"><p class="eyebrow">Razem łatwiej</p><h1>Ekipa</h1><p class="muted">Prywatne wsparcie od osób, które znasz.</p></section>
        <section class="card empty">
          <div class="empty-illustration" aria-hidden="true">●●</div>
          <h2>Trenujcie razem</h2>
          <p>Ekipa widzi ukończone treningi i regularność. Nie widzi ćwiczeń, ciężarów ani notatek.</p>
          <div class="empty-actions"><button class="button full" type="button" data-action="create-team">Utwórz ekipę</button><button class="button secondary full" type="button" data-action="join-team">Dołącz kodem</button></div>
        </section>
      </main>`;
  }
  return `
    <main class="screen">
      ${header()}
      <section class="page-heading compact"><p class="eyebrow">Twoja ekipa</p><h1>Weekend Warriors</h1><p class="muted">3 z 6 miejsc zajętych</p></section>
      <section class="card">
        <div class="member-row"><span class="avatar">DK</span><span class="row-copy"><strong>Daniel</strong><span>Trening wczoraj · seria 2 tyg.</span></span><span aria-hidden="true">🔥</span></div>
        <div class="member-row"><span class="avatar" style="background:#705e50">MK</span><span class="row-copy"><strong>Marek</strong><span>Trening dziś · seria 4 tyg.</span></span><button class="chip">👏</button></div>
        <div class="member-row"><span class="avatar" style="background:#48624f">AS</span><span class="row-copy"><strong>Ania</strong><span>Ostatnio 4 dni temu</span></span><button class="chip">Nudge</button></div>
      </section>
      <div class="section-title"><h2>Aktywność</h2></div>
      <section class="card"><div class="list-row"><span class="icon-tile">✓</span><span class="row-copy"><strong>Marek ukończył trening</strong><span>Trening A · 52 min</span></span><span class="small muted">2 h</span></div></section>
    </main>`;
}

function renderSession() {
  const backfill = state.sessionMode === "backfill";
  return `
    <main class="screen no-nav session-screen">
      ${toolbar(backfill ? "Trening po fakcie" : "Trening B", backfill ? "back" : "minimize")}
      <div class="session-summary">${backfill ? "<span>15 lip · 18:00</span><span>60 min</span>" : "<span>● 12:08</span><span>0 kg</span>"}<span>0 serii</span></div>
      ${sessionExercise("Wyciskanie hantli na skosie", "3 × 8–10")}
      ${sessionExercise("Wiosłowanie hantlą jednorącz", "3 × 10–12")}
      <button class="button full" type="button" data-action="finish">${backfill ? "Zapisz trening" : "Zakończ trening"}</button>
    </main>`;
}

function sessionExercise(name, target) {
  return `<section class="card" style="margin-bottom:14px"><h2>${name}</h2><p class="muted small">${target}</p><div class="set-grid header"><span>#</span><span>KG</span><span>POWT.</span><span></span></div>${[1,2,3].map(i => `<div class="set-grid"><span class="set-number">${i}</span><input class="set-input" inputmode="decimal" aria-label="Ciężar serii ${i}" /><input class="set-input" inputmode="numeric" aria-label="Powtórzenia serii ${i}" /><button class="set-check" type="button" aria-label="Zapisz serię ${i}">✓</button></div>`).join("")}</section>`;
}

function renderSettings() {
  return `<main class="screen no-nav">${toolbar("Profil")}<section class="page-heading"><h1>Daniel</h1><p class="muted">Profil i ustawienia aplikacji.</p></section><section class="card">${exerciseRow("", "Cel tygodniowy", "2 treningi")}${exerciseRow("", "Miejsce treningu", "Siłownia")}${exerciseRow("", "Wygląd", "Jasny")}</section></main>`;
}

function renderBottomNav(activeTab) {
  const tabs = [
    ["training", "Trening", "◫", "today"],
    ["progress", "Postępy", "↗", "progress"],
    ["history", "Historia", "◴", "history"],
    ["team", "Ekipa", "●●", "team"],
  ];
  return `<nav class="bottom-nav" aria-label="Główna nawigacja">${tabs.map(([tab, label, symbol, action]) => `<button class="${activeTab === tab ? "active" : ""}" type="button" data-action="${action}" aria-current="${activeTab === tab ? "page" : "false"}"><span class="nav-icon" aria-hidden="true">${symbol}</span><span>${label}</span>${tab === "team" && state.teamActive ? '<span class="nav-dot" aria-hidden="true"></span>' : ""}</button>`).join("")}</nav>`;
}

function renderMiniBar() {
  return `<button class="mini-bar" type="button" data-action="resume"><span class="icon-tile" style="background:#4b4540;color:#f6dcd1">◫</span><span class="row-copy"><strong>Trening B</strong><span>12:08 · dotknij, aby wrócić</span></span><span aria-hidden="true">›</span></button>`;
}

function render() {
  const renderers = {
    today: renderToday,
    plans: renderPlans,
    planDetail: renderPlanDetail,
    progress: renderProgress,
    body: renderBody,
    bodyAdd: renderBodyAdd,
    history: renderHistory,
    historyAdd: renderHistoryAdd,
    team: renderTeam,
    session: renderSession,
    settings: renderSettings,
  };
  const config = routeConfig[state.route];
  app.innerHTML = renderers[state.route]();
  if (config.nav) {
    app.insertAdjacentHTML("beforeend", renderBottomNav(config.tab));
  }
  const active = state.sessionActive || state.scenario === "active";
  if (active && config.nav && state.route !== "today") {
    app.insertAdjacentHTML("beforeend", renderMiniBar());
    app.querySelector(".screen")?.classList.add("has-mini");
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function hideToast() {
  clearTimeout(toastTimer);
  toast.classList.remove("show");
  toast.textContent = "";
}

function openScenarioSheet() {
  const options = [
    ["default", "Podstawowy", "Plan, dane i połączenie działają"],
    ["noPlan", "Brak planu", "Pierwsze wejście bez aktywnego planu"],
    ["active", "Aktywna sesja", "Wznawianie i mini-bar"],
    ["offline", "Offline", "Dane z cache i późniejsza synchronizacja"],
    ["error", "Błąd danych", "Jawny błąd zamiast pustego ekranu"],
    ["long", "Długie nazwy", "Próba odporności układu"],
  ];
  sheetRoot.innerHTML = `<div class="overlay" data-action="close-sheet"><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="scenario-title" data-sheet><div class="sheet-handle"></div><div class="sheet-header"><div><p class="eyebrow">Prototyp R0.5</p><h2 id="scenario-title">Wybierz stan</h2></div><button class="sheet-close" type="button" data-action="close-sheet" aria-label="Zamknij">×</button></div><div class="scenario-list">${options.map(([value, label, description]) => `<button class="scenario-option ${state.scenario === value ? "active" : ""}" type="button" data-action="scenario" data-value="${value}"><span class="icon-tile" aria-hidden="true">${value === "error" ? "!" : value === "offline" ? "↯" : "◇"}</span><span><strong>${label}</strong><span>${description}</span></span></button>`).join("")}</div></section></div>`;
}

function openInfoSheet(title, body, actionLabel = "Rozumiem") {
  sheetRoot.innerHTML = `<div class="overlay" data-action="close-sheet"><section class="sheet" role="dialog" aria-modal="true" aria-labelledby="info-title" data-sheet><div class="sheet-handle"></div><div class="sheet-header"><div><p class="eyebrow">Informacja</p><h2 id="info-title">${title}</h2></div><button class="sheet-close" type="button" data-action="close-sheet" aria-label="Zamknij">×</button></div><p class="muted" style="line-height:1.55">${body}</p><button class="button full" type="button" data-action="close-sheet">${actionLabel}</button></section></div>`;
}

function navigate(route) {
  state.route = route;
  sheetRoot.innerHTML = "";
  render();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (target.closest("[data-sheet]") && action === "close-sheet" && target === target.closest("[data-sheet]")) return;

  const routes = { today: "today", plans: "plans", progress: "progress", body: "body", history: "history", team: "team", settings: "settings", "body-add": "bodyAdd", "history-add": "historyAdd", "plan-detail": "planDetail", resume: "session" };
  if (routes[action]) return navigate(routes[action]);

  switch (action) {
    case "open-scenarios":
      openScenarioSheet();
      break;
    case "close-sheet":
      sheetRoot.innerHTML = "";
      break;
    case "scenario":
      state.scenario = target.dataset.value;
      state.sessionActive = state.scenario === "active";
      state.route = "today";
      sheetRoot.innerHTML = "";
      render();
      showToast(scenarioLabels[state.scenario]);
      break;
    case "start":
    case "start-custom":
      state.sessionActive = true;
      state.sessionMode = "live";
      navigate("session");
      break;
    case "minimize":
      navigate("today");
      showToast("Trening działa w tle");
      break;
    case "finish":
      const wasBackfill = state.sessionMode === "backfill";
      if (wasBackfill) hideToast();
      state.sessionActive = false;
      state.sessionMode = "live";
      state.scenario = "default";
      state.backfillJustSaved = wasBackfill;
      navigate(wasBackfill ? "history" : "today");
      if (!wasBackfill) showToast("Trening zapisany. Dobra robota!");
      break;
    case "back":
      if (state.route === "planDetail") navigate("plans");
      else if (state.route === "bodyAdd") navigate("body");
      else if (state.route === "historyAdd") navigate("history");
      else if (state.route === "session" && state.sessionMode === "backfill") navigate("history");
      else navigate("today");
      break;
    case "activate-plan":
      state.scenario = "default";
      navigate("today");
      showToast("Plan aktywny. Następny trening jest gotowy.");
      break;
    case "retry":
      state.scenario = "default";
      render();
      showToast("Dane odświeżone");
      break;
    case "preview":
      openInfoSheet("Trening B", "7 ćwiczeń: przysiad, wyciskanie, wiosłowanie, martwy ciąg rumuński, face pull, uginanie i brzuch.");
      break;
    case "goal":
      openInfoSheet("Cel tygodniowy: 1/2", "Masz za sobą jeden z dwóch zaplanowanych treningów. Jeszcze jeden zamknie cel na ten tydzień.");
      break;
    case "filters":
      openInfoSheet("Filtry planów", "Miejsce, poziom i cel zostaną pokazane w bottom sheecie. Zmiana filtrów nie zaśmieca historii Back.");
      break;
    case "photos":
      showToast("Możesz dodać maksymalnie 2 zdjęcia");
      break;
    case "save-measurement":
      if (!document.querySelector("#weight")?.value.trim()) {
        showToast("Podaj wagę, aby zapisać pomiar");
      } else {
        navigate("body");
        showToast("Pomiar zapisany");
      }
      break;
    case "history-choice":
      state.historyChoice = target.dataset.value;
      render();
      break;
    case "other-plan":
      openInfoSheet("Wybierz inny plan", "Najpierw pokażemy ostatnio używane i własne plany. Dalej będzie biblioteka z wyszukiwaniem.");
      break;
    case "create-history":
      state.sessionActive = false;
      state.sessionMode = "backfill";
      navigate("session");
      showToast("Wpisz serie z tamtego treningu");
      break;
    case "create-team":
      state.teamActive = true;
      render();
      showToast("Ekipa testowa utworzona");
      break;
    case "join-team":
      openInfoSheet("Dołącz kodem", "Przed dołączeniem pokażemy, że Ekipa widzi nazwę, awatar, ukończone treningi i regularność. Nigdy nie widzi ciężarów ani notatek.", "Przejdź dalej");
      break;
    case "history-detail":
      openInfoSheet("Trening B", "Szczegół zachowa filtr i pozycję listy. Edycja wróci tutaj bez ponownej celebracji i check-inu.");
      break;
    default:
      showToast("Element zaznaczony w prototypie");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sheetRoot.innerHTML) {
    sheetRoot.innerHTML = "";
  }
});

render();
