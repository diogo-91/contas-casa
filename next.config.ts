/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  distDir: '.next',
  trailingSlash: true
};

module.exports = nextConfig;
