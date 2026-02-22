# Compliance Guide

## GDPR
- **Right to be forgotten**: Users can delete their account and all personal data via the account deletion endpoint.
- **Data portability**: Users can export all their data (projects, settings) as JSON.
- **Consent management**: We obtain explicit consent for data processing and store consent records.
- **Data minimization**: We only collect necessary data (email, name) and allow users to provide optional info.
- **Breach notification**: We will notify authorities and affected users within 72 hours of a breach.

## SOC2
- **Security**: All data encrypted in transit (TLS) and at rest (AES‑256). Access controls via JWT and API keys.
- **Availability**: Service uptime target 99.9%. Monitoring and alerts configured.
- **Processing integrity**: Data processing is logged and auditable (see AuditService).
- **Confidentiality**: Non‑public information is protected via strict access controls.
- **Privacy**: Follows GDPR principles.

## HIPAA (if applicable)
- **BA agreements**: We sign Business Associate Agreements with customers.
- **Audit controls**: Detailed audit logs of all access to PHI.
- **Access controls**: Role‑based access and multi‑factor authentication.
- **Transmission security**: Encrypted channels only.
- **Emergency access**: Procedure for granting temporary access during support.

## Implementation Checklist
- [ ] Add `auditLog` model to Prisma schema.
- [ ] Run migration.
- [ ] Integrate `AuditService` into all sensitive operations.
- [ ] Document data retention policies.
- [ ] Set up regular backups and test restoration.
- [ ] Review security policies annually.
