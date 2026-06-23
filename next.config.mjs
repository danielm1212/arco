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
  webpack: (config, { dev }) => {
    // Dev: persistent cache potrafi się sypać ("Cannot find module ./vendor-chunks/*.js").
    // Wyłączamy go w dev — odrobinę wolniejszy cold start, ale zero korupcji chunków.
    if (dev) config.cache = false;
    return config;
  },
};

export default withSerwist(nextConfig);
