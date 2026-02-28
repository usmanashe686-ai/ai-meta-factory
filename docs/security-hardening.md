# Security Hardening Guide

## 1. Penetration Testing Checklist

### Infrastructure
- [ ] **Network scanning**: Ensure no unnecessary open ports. (Use `nmap` externally.)
- [ ] **SSL/TLS configuration**: Use SSL Labs to grade your certificate (aim for A+).
- [ ] **Dependency scanning**: Run `npm audit` and `snyk test` regularly (already in CI).
- [ ] **Container scanning**: If using Docker, scan images with Trivy or Clair.

### Application
- [ ] **Authentication**: Test for JWT weaknesses, token leakage, session fixation.
- [ ] **Authorization**: Ensure role-based access controls are enforced (e.g., admin endpoints).
- [ ] **Input validation**: Test for XSS, SQL injection, command injection. (Use OWASP ZAP or Burp Suite.)
- [ ] **File uploads**: Ensure uploaded files are scanned and stored securely.
- [ ] **API security**: Rate limiting, proper error messages (no stack traces).

### Data Protection
- [ ] **Encryption at rest**: Database encrypted (AES-256).
- [ ] **Encryption in transit**: TLS 1.2+ enforced.
- [ ] **Backup security**: Backups encrypted and stored separately.

## 2. Automated Security Updates

We use Dependabot (configured in `.github/dependabot.yml`) to automatically create PRs for security updates. Merge these promptly.

For critical updates, consider enabling auto-merge (with branch protection).

## 3. Runtime Hardening

- Enable Content Security Policy (CSP) headers in Next.js (`next.config.js`):
  ```js
  headers: [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" }
      ],
    },
  ]
