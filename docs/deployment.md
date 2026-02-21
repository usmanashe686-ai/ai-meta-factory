# Deployment Guide

## Frontend (Vercel)
1. Connect your GitHub repository to Vercel.
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL` – backend API URL.
   - `NEXT_PUBLIC_SENTRY_DSN` – (optional) for error tracking.
3. Deploy automatically via GitHub Actions (see CI/CD).

## Backend (Render / Kubernetes)

### Using Render (simplest)
1. Create a new Web Service on Render for each microservice.
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables (database URLs, secrets).
5. Deploy.

### Using Kubernetes (advanced)
1. Build Docker images and push to a registry.
2. Apply Kubernetes manifests from `backend/infrastructure/kubernetes/`.
3. Configure ingress and TLS.
4. Set up monitoring (Prometheus, Grafana, Loki, Tempo).

## Database Migrations
Run migrations as part of CI/CD (see `.github/workflows/backend-cd.yml`).
