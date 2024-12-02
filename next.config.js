/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
  // Optional: Add any other Next.js configurations here
  reactStrictMode: true,
};

module.exports = nextConfig;
