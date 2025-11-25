#!/bin/bash
# Campus Hub Deploy Script
# Выполните эти команды на сервере root@164.92.104.243

echo "=== Stopping services ==="
sudo systemctl stop campus-hub.service campus-hub-api.service

echo "=== Cleaning build cache ==="
sudo rm -rf /var/www/Campus_Hub/.next

echo "=== Updating code from GitHub ==="
cd /var/www/Campus_Hub
sudo -u campus git pull

echo "=== Fixing permissions ==="
sudo chown -R campus:campus /var/www/Campus_Hub
sudo chmod -R 750 /var/www/Campus_Hub
sudo chmod -R 770 /var/www/Campus_Hub/uploads

echo "=== Rebuilding Next.js ==="
sudo -u campus npm run build

echo "=== Updating systemd services ==="
sudo cp deploy/systemd/campus-hub*.service /etc/systemd/system/
sudo systemctl daemon-reload

echo "=== Starting API service ==="
sudo systemctl start campus-hub-api.service
sleep 3
sudo systemctl status campus-hub-api.service --no-pager

echo "=== Starting Next.js service ==="
sudo systemctl start campus-hub.service
sleep 3
sudo systemctl status campus-hub.service --no-pager

echo "=== Checking ports ==="
sudo ss -tlnp | grep -E ':(3000|4000)'

echo "=== Deployment complete! ==="
echo "API should be running on port 4000"
echo "Next.js should be running on port 3000"
