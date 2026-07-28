/* Arco — POC: Home + nowa nawigacja.
   Prototyp bez builda i bez danych: przełącza widoki, motyw, szerokość i stan konta. */

const screen = document.getElementById("screen");
const phone = document.getElementById("phone");

/** Zaznacza dokładnie jeden przycisk w grupie. */
function setActive(buttons, active) {
  buttons.forEach((b) => b.classList.toggle("on", b === active));
}

/* ── Nawigacja główna ──────────────────────────────────────────────────── */
const navButtons = [...document.querySelectorAll("[data-nav]")];
const views = [...document.querySelectorAll("[data-view]")];

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActive(navButtons, button);
    views.forEach((v) => {
      v.hidden = v.dataset.view !== button.dataset.nav;
    });
    screen.querySelectorAll(".content").forEach((c) => (c.scrollTop = 0));
  });
});

/* ── Zakładki w Treningach ─────────────────────────────────────────────── */
const subButtons = [...document.querySelectorAll("[data-sub]")];
const subViews = [...document.querySelectorAll("[data-subview]")];

subButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActive(subButtons, button);
    subViews.forEach((v) => {
      v.hidden = v.dataset.subview !== button.dataset.sub;
    });
  });
});

/* ── Motyw ─────────────────────────────────────────────────────────────── */
const themeButtons = [...document.querySelectorAll("[data-theme]")];
themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActive(themeButtons, button);
    screen.classList.toggle("dark", button.dataset.theme === "dark");
  });
});

/* ── Szerokość — 320 px jest tu najważniejszym testem (4 zakładki) ─────── */
const widthButtons = [...document.querySelectorAll("[data-width]")];
widthButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActive(widthButtons, button);
    phone.style.width = `${Number(button.dataset.width) + 24}px`;
  });
});

/* ── Stan konta ────────────────────────────────────────────────────────── */
const STATES = {
  rich:   { show: "rich",  greeting: "Cześć, Daniel", monogram: "D", goal: "2/3" },
  fresh:  { show: "fresh", greeting: "Cześć, Daniel", monogram: "D", goal: "0/3" },
  noname: { show: "rich",  greeting: null,            monogram: "•", goal: "2/3" },
};

const stateButtons = [...document.querySelectorAll("[data-state]")];
const conditional = [...document.querySelectorAll("[data-when]")];

function applyState(key) {
  const state = STATES[key];

  conditional.forEach((el) => {
    el.hidden = el.dataset.when !== state.show;
  });

  // Brak imienia = wiersz powitania w ogóle nie istnieje, nie pusty placeholder.
  document.querySelectorAll('[data-bind="greeting"]').forEach((el) => {
    el.hidden = state.greeting === null;
    if (state.greeting) el.textContent = state.greeting;
  });
  document.querySelectorAll('[data-bind="monogram"]').forEach((el) => {
    el.textContent = state.monogram;
  });
  document.querySelectorAll('[data-bind="goalText"]').forEach((el) => {
    el.textContent = state.goal;
  });
}

stateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActive(stateButtons, button);
    applyState(button.dataset.state);
  });
});

applyState("rich");

/* ── Drobne interakcje, żeby POC dawał się „poklikać" ──────────────────── */
document.querySelector(".hint-x")?.addEventListener("click", (event) => {
  event.currentTarget.closest(".hint").remove();
});
