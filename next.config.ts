import type { NextConfig } from 'next';

const securityHeaders = [
  // HIGH: Forces HTTPS; prevents downgrade attacks
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // NOTE: CSP omitted — Webflow Cloud serves Next.js chunks from a dynamic subdomain
  // that 'self' doesn't cover, so any CSP would block the app's own assets.
  // MEDIUM: Prevents clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // LOW: Stops MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // LOW: Controls referrer info
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // LOW: Restricts browser feature access
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
  // LOW: Legacy XSS filter for older browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // LOW: Protects against cross-origin attacks
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  // LOW: Controls cross-origin resource sharing
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

const nextConfig: NextConfig = {
  basePath: '/business-advanced-checkout',

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  
  // Production optimizations
  compress: true, // Enable gzip/brotli compression
  poweredByHeader: false, // Remove X-Powered-By header for security
  reactStrictMode: true, // Enable React strict mode for better error detection
  
  // Performance optimizations
  experimental: {
    optimizeCss: true, // Optimize CSS
    optimizePackageImports: ['react', 'react-dom'], // Tree shaking
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();


