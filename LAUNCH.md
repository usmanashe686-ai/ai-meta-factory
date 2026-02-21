# 🚀 AI Meta Factory Launch Day Checklist

## Pre‑Launch (24h before)
- [ ] Run final security scan (`npm audit`, CodeQL).
- [ ] Run performance test (k6).
- [ ] Verify all environment variables are set in production.
- [ ] Ensure database backups are configured.
- [ ] Check monitoring dashboards (Grafana, Sentry).
- [ ] Alert team members about the launch window.

## Launch
- [ ] Push the final commit tagged `v1.0.0`.
- [ ] Monitor CI/CD pipelines for success.
- [ ] Verify frontend is live on Vercel.
- [ ] Verify backend services are running on Render/Kubernetes.
- [ ] Test critical user flows (signup, create project, export).
- [ ] Check that logs are flowing to Loki and traces to Tempo.

## Post‑Launch (first hour)
- [ ] Monitor error rates in Sentry.
- [ ] Watch server CPU/memory usage.
- [ ] Collect user feedback.
- [ ] Prepare hotfixes if needed.

## Announcement
Share on:
- Twitter / X: `@aimetafactory`
- Product Hunt
- Hacker News
- Discord / Slack communities

**Thank you to everyone who contributed!** 🎉
