# NEXIA Deployment Guide

## Overview
This document describes the deployment strategy and integration setup for the **NEXIA platform**.  
The frontend is hosted on **Vercel**, while the backend runs on **AWS EC2** with a PostgreSQL database.  
The CI/CD pipeline ensures automatic deployments and robust testing before production.

---

## Frontend Deployment (Vercel)

- **Production URL**: https://nexia-frontend-phi.vercel.app  
- **Preview URLs**: Automatic for feature branches (`feature/*`) and pull requests  
- **Framework**: React + Vite + TypeScript  
- **CI/CD**: GitHub Actions → Vercel  

### Vercel Configuration (vercel.json)
```json
{
  "version": 22,
  "buildCommand": "pnpm -F shared build && pnpm -F web build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "vite"
}
```

### Branch Strategy
- **develop** → Automatic deployment to **staging**  
- **main** → Automatic deployment to **production**  
- **feature/** → Preview deployments for PR reviews  

### Pipeline Stages
1. **Build and Test** → TypeScript strict check, linting, build verification  
2. **Deploy Staging** → On push to `develop`  
3. **Deploy Production** → On push to `main`  
4. **Preview Deployments** → Feature branches & pull requests  

### Performance Metrics
- **Build time**: ~28 seconds  
- **Bundle size**: 341KB JS + 27KB CSS  
- **Pipeline total time**: ~2-3 minutes  

---

## Backend Deployment (AWS EC2)

- **Production URL**: https://nexiaapp.com/api/v1  
- **Framework**: FastAPI + SQLAlchemy  
- **Database**: PostgreSQL  
- **Deployment**: Manual via EC2 + GitHub  

### Current Backend Status
- ✅ Health checks available at `/health` → 200 OK  
- ✅ Login endpoint working with JWT  
- ❌ Forgot Password endpoint failing with 500 error  
- ❌ API docs not available at `/api/v1/docs`  

---

## Environment Variables

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://nexiaapp.com/api/v1
VITE_ENVIRONMENT=production
FRONTEND_RESET_URL=https://nexia-frontend-phi.vercel.app/auth/reset-password
```

### Backend (AWS EC2)
```env
SMTP_HOST=<AWS SES>
SMTP_PORT=587
```

---

## GitHub Actions Workflow

```yaml
name: Deploy NEXIA Frontend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22.19.0'
      - name: Install pnpm
        run: npm install -g pnpm
      - name: Install dependencies
        run: pnpm install
      - name: Build shared package
        run: pnpm -F shared build
      - name: Build web app
        run: pnpm -F web build
      - name: Run tests
        run: pnpm -F web test
      - name: Deploy to Vercel
        run: pnpm -F web deploy
```

---

## Debugging Process

### Backend Issue (Forgot Password)
- Verified locally: same 500 error  
- Network analysis: headers and payload correct  
- Curl commands confirm backend error  
- Sosina reports endpoint working in test environment → Possible environment mismatch  

### Next Steps
1. Backend logs review by Sosina  
2. Verify payload schema and reset URL config  
3. Consider CORS configuration for Vercel domain  
4. Add error monitoring (Sentry/LogRocket)  

---

## Strategic Architecture

- **Vercel (Frontend)** → optimized for React apps  
- **AWS EC2 (Backend)** → scalable for FastAPI services  
- **PostgreSQL (Database)** → relational data persistence  
- **Separation of Concerns** → clean isolation of frontend and backend responsibilities  

---

## Conclusion

- ✅ Frontend: Fully deployed, CI/CD working correctly  
- ✅ Backend: Operational, except forgot-password bug pending resolution  
- 🚀 Architecture: Correct choice (Vercel + AWS separation)  
- 📌 Next Update: After backend fix deployment by Sosina  

---

**Last Updated**: September 19, 2025  
**Maintainers**: Frontend Lead Developer (Nelson Valero), Backend Developer (Sosina), CTO  
