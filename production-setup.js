#!/usr/bin/env node

/**
 * Production Setup Script for Lineup Planner
 * Generates PWA icons and sets up production environment
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG template
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00FFCC;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0099FF;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.16}" fill="#0C0C0D"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.31}" fill="url(#gradient)" opacity="0.8"/>
  <path d="M${size/2} ${size * 0.29} L${size * 0.71} ${size/2} L${size/2} ${size * 0.71} L${size * 0.29} ${size/2} Z" fill="#FFFFFF" opacity="0.9"/>
  ${size >= 128 ? `<text x="${size/2}" y="${size * 0.78}" text-anchor="middle" fill="#00FFCC" font-family="Arial, sans-serif" font-size="${size * 0.083}" font-weight="bold">LINEUP</text>` : ''}
</svg>`;
}

// Create maskable SVG
function createMaskableSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00FFCC;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0099FF;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#gradient)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.25}" fill="#0C0C0D" opacity="0.8"/>
  <path d="M${size/2} ${size * 0.35} L${size * 0.65} ${size/2} L${size/2} ${size * 0.65} L${size * 0.35} ${size/2} Z" fill="#FFFFFF"/>
</svg>`;
}

// Ensure icons directory exists
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating PWA icons...');

// Generate regular icons
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svgContent);
  console.log(`✅ Generated icon-${size}x${size}.svg`);
});

// Generate maskable icons
[192, 512].forEach(size => {
  const svgContent = createMaskableSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon-maskable-${size}x${size}.svg`), svgContent);
  console.log(`✅ Generated icon-maskable-${size}x${size}.svg`);
});

// Create favicon.ico placeholder
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSVG);
console.log('✅ Generated favicon.svg');

// Create robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml`;
fs.writeFileSync(path.join(__dirname, 'public', 'robots.txt'), robotsTxt);
console.log('✅ Generated robots.txt');

// Create .env.example
const envExample = `# Production Environment Variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Analytics (optional)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_HOTJAR_ID=

# Error Monitoring (optional)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Database (if needed)
DATABASE_URL=
`;
fs.writeFileSync(path.join(__dirname, '.env.example'), envExample);
console.log('✅ Generated .env.example');

console.log('\n🚀 Production setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Replace SVG icons with PNG/WebP versions for better compatibility');
console.log('2. Set up your environment variables in .env.local');
console.log('3. Configure your domain in robots.txt and manifest.json');
console.log('4. Set up error monitoring and analytics');
console.log('5. Test the PWA installation on mobile devices');
console.log('6. Run `npm run build` to verify production build');
console.log('\n✨ Your app is now production-ready!'); 