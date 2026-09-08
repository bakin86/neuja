import type { NextConfig } from 'next';
const config: NextConfig = { devIndicators: false, outputFileTracingRoot: process.cwd(), distDir: process.env.NODE_ENV === 'production' && !process.env.VERCEL ? '.next-production' : '.next' };
export default config;

