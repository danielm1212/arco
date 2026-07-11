import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // W dev SW potrafi przeszkadzać (cache) — wyłączony lokalnie.
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Obrazki ćwiczeń z free-exercise-db są hotlinkowane (brief sekcja 12).
    remotePatterns: [{ protocol: "https", hostname: "raw.githubusercontent.com" }],
  },
  // Security headers — zestaw bazowy (docs/bezpieczenstwo.md P1, 2026-07-08).
  // HSTS dokłada Vercel.
  async headers() {
    // S10 (2026-07-10): CSP jako REPORT-ONLY — zbieramy naruszenia w konsoli
    // (DevTools) bez ryzyka zepsucia apki; enforce = S11 po przeglądzie raportów.
    // 'unsafe-inline' w script/style: wymóg inline'ów Next 14 (hydration) i
    // styli wstrzykiwanych — zejście na nonce'y to osobna praca przy enforce.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      // obrazki: hotlink free-exercise-db + publiczny bucket exercise-photos
      "img-src 'self' data: blob: https://raw.githubusercontent.com https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co",
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
          { key: "Content-Security-Policy-Report-Only", value: csp },
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
