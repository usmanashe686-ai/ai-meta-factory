#!/bin/bash
# Automated backup script for AI Meta Factory
# Supports full database backups and file backups.
# Designed to be run daily/weekly via cron.

set -e

# Configuration - adjust these
BACKUP_DIR="/var/backups/ai-meta-factory"
DATABASE_URL="${DATABASE_URL:-postgresql://postgres:password@localhost:5432/aimetafactory}"
PGDUMP_OPTIONS="-Fc"  # custom format (compressed)
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

echo "[$(date)] Starting backup: $BACKUP_NAME"

# Database backup using pg_dump (custom format, enables point-in-time recovery with WAL)
echo "Backing up database..."
pg_dump "$DATABASE_URL" $PGDUMP_OPTIONS > "$BACKUP_NAME.dump"
echo "Database backup saved: $BACKUP_NAME.dump"

# Optional: backup important files (e.g., uploaded files, configs)
# Uncomment and adjust as needed
# echo "Backing up file storage..."
# tar -czf "$BACKUP_NAME.files.tar.gz" /path/to/uploads

# Create a manifest
cat > "$BACKUP_NAME.manifest" << MANIFEST
Backup Date: $(date -R)
Database Dump: $BACKUP_NAME.dump
Files Archive: $BACKUP_NAME.files.tar.gz (if any)
MANIFEST

# Compress everything into a single archive (optional)
# tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME.dump" "$BACKUP_NAME.manifest"

# Clean up old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "backup_*" -type f -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Backup completed successfully."

# For point-in-time recovery, you also need WAL archiving.
# Set up PostgreSQL's archive_mode and archive_command to copy WAL files to a safe location.
# Example: archive_command = 'test ! -f /var/lib/postgresql/wal_archive/%f && cp %p /var/lib/postgresql/wal_archive/%f'
# Then you can perform point-in-time recovery using the base backup and WAL files.
