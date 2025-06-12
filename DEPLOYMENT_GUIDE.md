# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

### ✅ Core Requirements
- [x] ✅ Production build compiles successfully (`npm run build`)
- [x] ✅ No security vulnerabilities (`npm audit`)
- [x] ✅ PWA manifest configured
- [x] ✅ Service worker implemented
- [x] ✅ Error boundaries in place
- [x] ✅ Security headers configured
- [x] ✅ Mobile-first responsive design
- [x] ✅ SEO optimization

### 🔧 Environment Setup

1. **Create `.env.local` for production:**
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=GA_MEASUREMENT_ID
NEXT_PUBLIC_HOTJAR_ID=HOTJAR_SITE_ID

# Optional: Error Monitoring
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

2. **Update `robots.txt` with your domain:**
```
User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
```

3. **Update `manifest.json` start_url if deploying to subdirectory**

## 🌐 Deployment Platforms

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

**Vercel Configuration (`vercel.json`):**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "functions": {
    "app/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

**Netlify Configuration (`netlify.toml`):**
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### AWS Amplify
1. Connect your GitHub repository
2. Set build settings:
   - Build command: `npm run build`
   - Base directory: `lineup-poc`
   - Output directory: `.next`
3. Add environment variables in Amplify console

### Docker Deployment
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

## 🔧 Performance Optimization

### Image Optimization
- Replace SVG icons with optimized PNG/WebP versions for better compatibility
- Use Next.js Image component for all images
- Enable image optimization in your deployment platform

### Bundle Analysis
```bash
npm run build:analyze
```

### Performance Monitoring
1. **Google PageSpeed Insights**: Test your deployed URL
2. **Lighthouse**: Run audits for Performance, Accessibility, Best Practices, SEO
3. **Web Vitals**: Monitor Core Web Vitals in production

## 📱 PWA Testing

### Installation Testing
1. **Chrome DevTools**:
   - Application tab → Manifest
   - Application tab → Service Workers
   - Lighthouse → PWA audit

2. **Mobile Testing**:
   - Open on mobile browser
   - Add to Home Screen option should appear
   - Test offline functionality
   - Test push notifications (if implemented)

### PWA Store Submission
1. **Google Play Store** (via Trusted Web Activity)
2. **Microsoft Store** (via PWABuilder)
3. **iOS App Store** (via wrapper apps)

## 🛡️ Security Checklist

- [x] Security headers implemented
- [x] HTTPS enabled (handled by deployment platform)
- [x] Content Security Policy configured
- [x] No sensitive data in client-side code
- [x] Input validation and sanitization
- [x] Error messages don't expose sensitive information

## 📊 Monitoring & Analytics

### Error Monitoring
1. **Sentry Integration:**
```bash
npm install @sentry/nextjs
```

2. **Configure Sentry:**
```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Analytics
1. **Google Analytics 4:**
```javascript
// Add to app/layout.tsx
{process.env.NEXT_PUBLIC_GA_ID && (
  <Script
    src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
    strategy="afterInteractive"
  />
)}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm audit --audit-level=high
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🎯 Post-Deployment Checklist

### Immediate Testing
- [ ] App loads correctly on production URL
- [ ] All routes work (/, /lineup, /artist, /events/create)
- [ ] PWA installation works on mobile
- [ ] Service worker caches resources
- [ ] Drag and drop functionality works
- [ ] Mobile responsiveness verified
- [ ] SEO meta tags display correctly

### Performance Verification
- [ ] Lighthouse score > 90 for all categories
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] Bundle size optimized (First Load JS < 150KB per page)

### Security Testing
- [ ] Security headers present in response
- [ ] HTTPS redirect working
- [ ] No console errors on production
- [ ] Error boundaries catch errors gracefully

### Analytics Setup
- [ ] Google Analytics tracking working
- [ ] Error monitoring receiving events
- [ ] Performance metrics being collected

## 🔗 Useful Links

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Web Performance Guidelines](https://web.dev/performance/)
- [Security Headers Guide](https://securityheaders.com/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)

## 🆘 Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version (18+), clear `.next` and `node_modules`
2. **PWA Not Installing**: Verify manifest.json and HTTPS
3. **Service Worker Issues**: Check browser devtools → Application tab
4. **Performance Issues**: Run bundle analyzer, optimize images
5. **Mobile Issues**: Test on actual devices, not just browser devtools

### Support
- Check deployment platform documentation
- Review Next.js deployment guide
- Test locally with `npm run preview`

---

✨ **Your Primordial Groove Lineup Planner is now production-ready!** 