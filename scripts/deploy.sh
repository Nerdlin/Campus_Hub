#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/Campus_Hub
DOMAIN=${DOMAIN:-YOUR_DOMAIN}

echo "[1/4] Pull latest code"
cd "$APP_DIR"
sudo -u www-data git pull --ff-only

echo "[2/4] Install deps and build"
sudo -u www-data npm ci
sudo -u www-data npm run build

echo "[3/4] Restart services"
sudo systemctl restart campus-hub-api.service
sudo systemctl restart campus-hub.service

echo "[4/4] Reload nginx"
sudo nginx -t && sudo systemctl reload nginx

echo "Deployed. Visit: https://$DOMAIN"


