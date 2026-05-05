/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The outline route reads markdown from data/trips/*.md at runtime via
  // fs.readFile with a path computed from JSON, which Next's static tracer
  // can't follow. Include those files explicitly in the function bundle so
  // they're present in production.
  experimental: {
    outputFileTracingIncludes: {
      '/trips/[slug]/outline': ['./data/trips/*.md'],
    },
  },
};

module.exports = nextConfig;
