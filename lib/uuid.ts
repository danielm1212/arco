/**
 * UUID v4 odporny na brak secure context.
 * crypto.randomUUID() wymaga HTTPS/localhost — na http LAN (telefon) jest undefined.
 * Fallback przez crypto.getRandomValues (dostępny też po http), ostatecznie Math.random.
 */
export function uuid(): string {
  const c = typeof crypto !== "undefined" ? crypto : undefined;

  if (c && typeof c.randomUUID === "function") {
    try {
      return c.randomUUID();
    } catch {
      /* poniżej fallback */
    }
  }

  if (c && typeof c.getRandomValues === "function") {
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; // wersja 4
    b[8] = (b[8] & 0x3f) | 0x80; // wariant
    const h = Array.from(b, (x) => x.toString(16).padStart(2, "0"));
    return `${h[0]}${h[1]}${h[2]}${h[3]}-${h[4]}${h[5]}-${h[6]}${h[7]}-${h[8]}${h[9]}-${h[10]}${h[11]}${h[12]}${h[13]}${h[14]}${h[15]}`;
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
