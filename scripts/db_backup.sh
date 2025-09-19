#!/bin/bash

# Database backup script for Supabase
# This script creates nightly backups of the database

set -e

# Configuration
BACKUP_DIR="/Users/nicodelgadob/Desktop/PAPA/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="supabase_backup_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Get Supabase project reference
PROJECT_REF="default"

echo "Starting database backup for project: $PROJECT_REF"
echo "Backup file: $BACKUP_FILE"

# Create backup using supabase CLI
cd /Users/nicodelgadob/Desktop/PAPA
supabase db dump --project-ref "$PROJECT_REF" --file "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Keep only last 7 days of backups
    find "$BACKUP_DIR" -name "supabase_backup_*.sql" -mtime +7 -delete
    echo "Cleaned up backups older than 7 days"
else
    echo "Backup failed!"
    exit 1
fi

echo "Backup process completed"