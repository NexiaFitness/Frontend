# NEXIA Deployment Guide

## Overview
This guide describes the deployment process for the NEXIA frontend application.  
The frontend is deployed to **Vercel** for automatic deployments from the main branch.

---

## Deployment Platforms

### Production
- **Platform:** Vercel
- **URL:** https://nexiaapp.com (o URL de producción)
- **Branch:** `main`
- **Auto-deploy:** Enabled (deploys on every push to `main`)

### Staging (if applicable)
- **Platform:** Vercel Preview
- **URL:** Auto-generated preview URLs per PR
- **Branch:** `develop` o PR branches
- **Auto-deploy:** Enabled for PRs

---

## Build Configuration

### Vercel Configuration
The project uses `vercel.json` for deployment settings:

```json
{
  "buildCommand": "pnpm -F web build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "framework": "vite"
}
```

### Environment Variables
Required environment variables in Vercel:
- `VITE_API_BASE_URL` - Backend API URL (https://nexiaapp.com/api/v1)
- `VITE_ENVIRONMENT` - Environment (production/staging)

---

## Build Process

### Local Build
```bash
# Build the web app
pnpm -F web build

# Build shared package (if needed)
pnpm -F shared build
```

### Build Output
- **Location:** `apps/web/dist/`
- **Contents:** Static files (HTML, CSS, JS) ready for deployment

---

## Deployment Steps

### Automatic (Recommended)
1. Push to `main` branch
2. Vercel automatically:
   - Installs dependencies (`pnpm install`)
   - Builds the app (`pnpm -F web build`)
   - Deploys to production

### Manual (if needed)
1. Go to Vercel dashboard
2. Select project
3. Click "Redeploy" → "Redeploy with existing Build Cache"

---

## Pre-Deployment Checklist

Before merging to `main`:
- [ ] All tests pass (`pnpm -F web test:run`)
- [ ] Build succeeds (`pnpm -F web build`)
- [ ] No linting errors (`pnpm -F web lint`)
- [ ] Environment variables configured in Vercel
- [ ] Backend API is accessible from production URL

---

## Troubleshooting

### Build Failures
- Check Vercel build logs
- Verify `package.json` scripts are correct
- Ensure all dependencies are in `package.json`

### Environment Variables
- Verify variables are set in Vercel dashboard
- Check variable names match code (prefixed with `VITE_`)

### API Connection Issues
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings on backend
- Ensure backend is accessible from Vercel's IPs

---

## Monitoring

### Vercel Analytics
- View deployment history
- Monitor build times
- Check error rates

### Application Monitoring
- Use browser DevTools for runtime errors
- Check backend logs for API errors
- Monitor user feedback

---

**Last Updated:** January 2025  
**Maintainer:** Frontend Team  
