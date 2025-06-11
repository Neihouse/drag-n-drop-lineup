# 🚀 **Deployment Guide - Vercel + Supabase**

## **Recommended Production Stack**

```
Frontend: Next.js 15 → Vercel
Database: PostgreSQL → Supabase  
Auth: Clerk → JWT Integration
Email: Resend or SendGrid
Storage: Supabase Storage (flyers, avatars)
Monitoring: Vercel Analytics + Sentry
```

---

## **Supabase Setup**

### **1. Create Project**
```bash
# Visit https://supabase.com/dashboard
# Create new project
# Note down:
# - Project URL
# - Anon/Public Key  
# - Service Role Key (keep secret)
```

### **2. Run Schema Migration**
```sql
-- Copy schema from docs/05-schema-supabase.md
-- Run in Supabase SQL Editor
-- Tables: venues, artists, events, event_roles, lineup_slots, artist_profiles
-- RLS policies: All permission rules
-- Triggers: Timestamp updates, role creation
```

### **3. Configure Auth Integration**
```sql
-- Enable Clerk JWT authentication
-- Supabase → Authentication → Settings → JWT Settings
-- JWT Secret: Copy from Clerk JWT template
-- Custom Claims: Map Clerk user.id to auth.uid()
```

### **4. Upload Sample Data**
```sql
-- Run sample data migration from schema doc
-- Insert venues, artists, sample event
-- Test RLS policies with different user contexts
```

---

## **Clerk Setup**

### **1. Create Application**
```bash
# Visit https://clerk.com/dashboard  
# Create new application
# Enable Email + Social providers
# Configure domains and redirects
```

### **2. JWT Template Configuration**
```json
// Clerk → JWT Templates → Create "supabase" template
{
  "aud": "authenticated",
  "exp": {{ user.primary_email_address.verification.expire_at | date: "%s" }},
  "iat": {{ date.now | date: "%s" }},
  "iss": "https://your-app.clerk.accounts.dev",
  "sub": "{{ user.id }}",
  "email": "{{ user.primary_email_address.email_address }}",
  "app_metadata": {
    "provider": "clerk"
  },
  "user_metadata": {
    "full_name": "{{ user.first_name }} {{ user.last_name }}"
  }
}
```

### **3. Webhook Endpoints**
```bash
# Clerk → Webhooks → Add endpoint
# URL: https://your-app.vercel.app/api/webhooks/clerk
# Events: user.created, user.updated, user.deleted
# Secret: Save for webhook verification
```

---

## **Vercel Deployment**

### **1. Repository Setup**
```bash
# Connect GitHub repository to Vercel
# Auto-deploy from main branch
# Build command: npm run build
# Install command: npm install
# Output directory: .next
```

### **2. Environment Variables**
```bash
# Vercel → Project → Settings → Environment Variables

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase Database  
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Email Notifications
EMAIL_SERVICE_API_KEY=re_...
EMAIL_FROM_ADDRESS=notifications@primordialgroove.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### **3. Domain Configuration**
```bash
# Vercel → Domains → Add custom domain
# DNS: Point domain to Vercel nameservers
# SSL: Automatically provisioned
# Clerk: Update allowed domains list
```

---

## **CI/CD Pipeline**

### **1. GitHub Actions** (Optional - Vercel handles deployment)
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - run: echo "Deployed to Vercel automatically"
```

### **2. Database Migrations**
```bash
# Future: Supabase CLI integration
# For now: Manual SQL execution via dashboard
# Consider: Prisma migrations or similar tool
```

---

## **Environment Secrets Checklist**

### **Required Secrets**
- [x] `CLERK_SECRET_KEY` - Clerk server-side API key
- [x] `CLERK_WEBHOOK_SECRET` - Webhook signature verification  
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Admin database access
- [x] `EMAIL_SERVICE_API_KEY` - Notification sending

### **Public Environment Variables**
- [x] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk client auth
- [x] `NEXT_PUBLIC_SUPABASE_URL` - Database connection
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public database access
- [x] `NEXT_PUBLIC_APP_URL` - Base application URL

### **Optional Configuration**
- [ ] `SENTRY_DSN` - Error monitoring
- [ ] `ANALYTICS_ID` - Usage tracking
- [ ] `FEATURE_FLAGS` - Toggle experimental features

---

## **Monitoring & Observability**

### **1. Error Tracking**
```typescript
// Install Sentry for error monitoring
npm install @sentry/nextjs

// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### **2. Performance Monitoring**
```typescript
// Vercel Analytics (built-in)
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### **3. Database Monitoring**
```sql
-- Supabase built-in monitoring
-- Monitor: API requests, database queries, auth events
-- Alerts: Set up for high error rates, slow queries
-- Logs: Enable detailed logging for debugging
```

---

## **Security Configuration**

### **1. Content Security Policy**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.clerk.accounts.dev",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' *.supabase.co *.clerk.accounts.dev",
    ].join('; ')
  }
];
```

### **2. CORS Configuration**
```typescript
// Supabase → Settings → API → CORS
// Allowed origins: https://your-app.vercel.app
// Development: http://localhost:3000
```

### **3. Rate Limiting**
```typescript
// Consider: Vercel Edge Functions for rate limiting
// Or: Supabase edge functions for API protection
// Monitor: API usage patterns and abuse
```

---

## **Backup & Recovery**

### **1. Database Backups**
```bash
# Supabase automatically backs up data
# Manual backups: Database → Settings → Backups
# Point-in-time recovery available
# Export: SQL dumps for migration
```

### **2. Code Repository**
```bash
# GitHub repository serves as source backup
# Vercel deployment history for rollbacks
# Environment variables backed up separately
```

---

## **Scaling Considerations**

### **1. Database Scaling**
```sql
-- Supabase handles connection pooling
-- Monitor: Query performance via dashboard
-- Optimize: Add indexes for slow queries
-- Scale: Upgrade plan for higher limits
```

### **2. Frontend Scaling**
```bash
# Vercel automatically scales frontend
# CDN: Global edge cache distribution
# SSR: Server-side rendering for performance
# ISR: Incremental static regeneration
```

### **3. Real-time Features**
```typescript
// Supabase Realtime for live collaboration
// WebSocket connections auto-scale
// Monitor: Connection limits and costs
```

---

## **Deployment Checklist**

### **Pre-Deployment**
- [ ] Environment variables configured
- [ ] Database schema deployed  
- [ ] RLS policies tested
- [ ] Clerk integration working
- [ ] Email templates created
- [ ] Domain DNS configured

### **Post-Deployment**
- [ ] Test all user flows in production
- [ ] Verify email notifications work
- [ ] Check analytics integration
- [ ] Monitor error rates
- [ ] Test mobile responsiveness
- [ ] Verify public embed functionality

### **Go-Live**
- [ ] Switch DNS to production
- [ ] Update Clerk allowed origins
- [ ] Enable production email sending
- [ ] Monitor initial user registrations
- [ ] Test artist invitation flow
- [ ] Validate export functionality

---

## **Cost Estimation**

### **Monthly Costs (Estimated)**
```
Vercel Pro: $20/month (team collaboration, analytics)
Supabase Pro: $25/month (higher limits, daily backups)
Clerk Production: $25/month (10k MAU included)
Resend Email: $20/month (50k emails)
Custom Domain: $10/year

Total: ~$90/month for production-ready platform
```

### **Scaling Costs**
- Additional MAU on Clerk: $0.02/user/month
- Database storage: $0.125/GB/month  
- Email overage: $0.40/1k emails
- Vercel bandwidth: $40/100GB

This deployment configuration provides a robust, scalable foundation for the lineup management platform with room for growth. 