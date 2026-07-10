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
  // HSTS dokłada Vercel; CSP wejdzie osobno jako Report-Only przy S10 (wymaga testów z inline Nexta).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // wake lock/wibracje zostają nasze; reszta sensorów wyłączona
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
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
