/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module; keep it out of the webpack bundle.
  experimental: { serverComponentsExternalPackages: ["better-sqlite3"] },
  // The assignment names the endpoints GET /feed, POST /swipe, GET /matches.
  // They live under /api/* and these rewrites make the short paths work too.
  async rewrites() {
    return [
      { source: "/feed", destination: "/api/feed" },
      { source: "/swipe", destination: "/api/swipe" },
      { source: "/matches", destination: "/api/matches" },
    ];
  },
};
export default nextConfig;
