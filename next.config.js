/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/LLM_Ranker',
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
}

export default config
