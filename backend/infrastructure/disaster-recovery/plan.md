# Disaster Recovery Plan – AI Meta Factory

## 1. Purpose and Scope
This document defines the procedures to recover the AI Meta Factory platform in case of a disaster (e.g., data center outage, major data corruption, security breach). It covers the core services: database, file storage, and application servers.

## 2. Assumptions
- Backups are taken daily and stored off-site (e.g., AWS S3, separate region).
- Infrastructure as code (IaC) and configuration are version‑controlled in GitHub.
- The team has access to the cloud provider consoles (Render, Vercel, Supabase) and emergency credentials.
- At least two team members are familiar with the recovery process.

## 3. Recovery Objectives
| Metric | Target |
|--------|--------|
| **RPO** (Recovery Point Objective) | 24 hours (daily full backup + WAL archiving for point‑in‑time) |
| **RTO** (Recovery Time Objective) | 4 hours for full restoration |

## 4. Disaster Scenarios
| Scenario | Description |
|----------|-------------|
| **A** | Single service failure (e.g., API gateway crashes) |
| **B** | Database corruption or accidental deletion |
| **C** | Entire region outage (cloud provider issue) |
| **D** | Security breach requiring clean rebuild |

## 5. Backup Procedures

### 5.1 Database
- Daily full backup via `pg_dump` (custom format) stored in S3.
- Continuous WAL archiving (if using PostgreSQL with replication) for point‑in‑time recovery.
- Backup script: `backend/infrastructure/backup/backup.sh`

### 5.2 File Storage
- User‑uploaded files (if any) are backed up via the same script (commented out section).
- For MinIO/S3, enable versioning and cross‑region replication.

### 5.3 Configuration
- All configuration (environment variables, secrets) is stored in GitHub Secrets and cloud provider dashboards.
- Manual documentation of required secrets is kept in a secure vault (e.g., 1Password).

## 6. Recovery Procedures

### 6.1 Scenario A – Single Service Failure
1. Check logs in Render dashboard.
2. Restart the service (or rollback to previous version via Render deploy).
3. If persistent, rebuild from latest image.

### 6.2 Scenario B – Database Corruption
**Assuming PostgreSQL with daily dumps:**
1. Stop affected services (to prevent further writes).
2. Identify the point in time to restore to (using WAL if available).
3. Restore from the latest backup:
   ```bash
   pg_restore -d postgresql://user:pass@host/db -Fc latest.dump
pg_restore --dbname=... --clean --if-exists latest.dump
# then apply WAL up to desired time
