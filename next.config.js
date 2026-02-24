/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'export',
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
}

export default config
