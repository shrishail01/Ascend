#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="ascend_backup_$TIMESTAMP"
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/ascend"}

echo "=== STARTING DATABASE BACKUP ==="
echo "Target Database: $MONGODB_URI"
echo "Timestamp: $TIMESTAMP"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Execute mongodump
mongodump --uri="$MONGODB_URI" --archive="$BACKUP_DIR/$BACKUP_NAME.gz" --gzip

if [ $? -eq 0 ]; then
  echo "✓ Backup completed successfully: $BACKUP_DIR/$BACKUP_NAME.gz"
  # Clean backups older than 7 days
  find "$BACKUP_DIR" -name "ascend_backup_*.gz" -type f -mtime +7 -delete
  echo "🧹 Cleaned old backups older than 7 days."
else
  echo "❌ Database backup failed."
  exit 1
fi
