/**
 * Aktualny priorytet użytkownika. To nie jest cel programu: plan dalej dobieramy
 * po poziomie, sprzęcie i częstotliwości. Priorytet zmienia tylko prowadzenie
 * progresji i regeneracji, więc nie mnożymy identycznych wersji planów.
 */
export const TRAINING_PRIORITIES = [
  { id: "general_fitness", label: "Ogólna sprawność", hint: "Chcę czuć się silniej i zdrowiej na co dzień.", loggerHint: "Skup się na technice i regularności. Zostaw sobie około 2 powtórzeń w zapasie." },
  { id: "strength", label: "Siła", hint: "Chcę stopniowo podnosić większe ciężary.", loggerHint: "Przy głównych ćwiczeniach odpocznij 2–4 minuty. Jakość serii jest ważniejsza niż tempo." },
  { id: "muscle_gain", label: "Budowanie mięśni", hint: "Chcę rozwijać masę i sylwetkę.", loggerHint: "Dokładaj powtórzenia w zakresie planu; gdy wszystkie serie osiągną jego górę, zwiększ ciężar." },
  { id: "fat_loss", label: "Redukcja / utrzymanie", hint: "Chcę utrzymać siłę i mięśnie, gdy schudam albo trzymam wagę.", loggerHint: "Utrzymuj jakość i ciężar. Przy wyraźnie słabszej regeneracji odejmij serię dodatkową, nie obciążenie od razu." },
] as const;

export type TrainingPriority = (typeof TRAINING_PRIORITIES)[number]["id"];
export const DEFAULT_TRAINING_PRIORITY: TrainingPriority = "general_fitness";

export function trainingPriorityMeta(priority: TrainingPriority) {
  return TRAINING_PRIORITIES.find((item) => item.id === priority) ?? TRAINING_PRIORITIES[0];
}
