import type { NextConfig } from 'next';
const config: NextConfig = { devIndicators: false, outputFileTracingRoot: process.cwd(), distDir: process.env.NODE_ENV === 'production' ? '.next-production' : '.next' };
export default config;
