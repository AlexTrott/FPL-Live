/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['resources.premierleague.com'],
  },
  env: {
    NEXT_PUBLIC_PROXY_URL: process.env.NEXT_PUBLIC_PROXY_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
}

module.exports = nextConfig