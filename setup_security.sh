#!/bin/bash
# Security and Backup Setup for Campus Hub

echo "=== Installing fail2ban ==="
sudo apt install -y fail2ban

echo "=== Configuring automatic updates ==="
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades

echo "=== Setting up backup cron job ==="
sudo mkdir -p /var/backups/campus-hub

# Создаем скрипт бэкапа
cat << 'EOF' | sudo tee /usr/local/bin/backup-campus.sh
#!/bin/bash
BACKUP_DIR="/var/backups/campus-hub"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
cd /var/www/Campus_Hub
tar czf "$BACKUP_DIR/campus-$DATE.tar.gz" db.json uploads/
# Удаляем бэкапы старше 7 дней
find "$BACKUP_DIR" -name "campus-*.tar.gz" -mtime +7 -delete
echo "Backup created: campus-$DATE.tar.gz"
EOF

sudo chmod +x /usr/local/bin/backup-campus.sh

# Добавляем в cron (каждый день в 2 часа ночи)
echo "0 2 * * * root /usr/local/bin/backup-campus.sh >> /var/log/campus-backup.log 2>&1" | sudo tee /etc/cron.d/campus-hub-backup

echo "=== Security setup complete! ==="
echo "Backups will be stored in: /var/backups/campus-hub"
echo "Backup log: /var/log/campus-backup.log"
