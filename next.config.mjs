import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // W dev SW potrafi przeszkadzać (cache) — wyłączony lokalnie.
  disable: process.env.NODE_ENV === "development",
});

const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin;
  } catch {
    return "https://*.supabase.co";
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Obrazy ćwiczeń idą wyłącznie z własnego Supabase Storage/CDN (zwykłe <img>);
  // next/image używają tylko lokalne ikony 3D. Zaszłość hotlinku
  // raw.githubusercontent.com wycięta (audyt 2026-07).
  // Security headers — zestaw bazowy (docs/bezpieczenstwo.md P1, 2026-07-08).
  // HSTS dokłada Vercel.
  async headers() {
    // S11 (2026-07-13): CSP egzekwowane po czystym teście wersji produkcyjnej.
    // 'unsafe-inline' w script/style: wymóg inline'ów Next (hydration) i
    // styli wstrzykiwanych — zejście na nonce'y to osobna praca przy enforce.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // obrazki: publiczny bucket exercise-photos na własnym Supabase
      `img-src 'self' data: blob: ${supabaseOrigin}`,
      `connect-src 'self' ${supabaseOrigin}`,
      "font-src 'self' data:",
      "worker-src 'self'",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // wake lock/wibracje zostają nasze; reszta sensorów wyłączona
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
  webpack: (config, { dev }) => {
    // Dev: persistent cache potrafi się sypać ("Cannot find module ./vendor-chunks/*.js").
    // Wyłączamy go w dev — odrobinę wolniejszy cold start, ale zero korupcji chunków.
    if (dev) config.cache = false;
    return config;
  },
};

export default withSerwist(nextConfig);
