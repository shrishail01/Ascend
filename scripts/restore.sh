#!/bin/bash

# Configuration
MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/ascend"}
BACKUP_FILE=$1

echo "=== STARTING DATABASE RESTORATION ==="
echo "Target Database: $MONGODB_URI"

if [ -z "$BACKUP_FILE" ]; then
  echo "❌ Error: Please specify the path of the gzip backup file to restore."
  echo "Usage: ./restore.sh <path_to_backup_file.gz>"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring from: $BACKUP_FILE"

# Execute mongorestore
mongorestore --uri="$MONGODB_URI" --archive="$BACKUP_FILE" --gzip --nsInclude="ascend.*"

if [ $? -eq 0 ]; then
  echo "✓ Database restoration completed successfully!"
else
  echo "❌ Database restoration failed."
  exit 1
fi
