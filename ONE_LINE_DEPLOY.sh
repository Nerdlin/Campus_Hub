#!/bin/bash
# CAMPUS HUB - ПОЛНЫЙ АВТОМАТИЧЕСКИЙ ДЕПЛОЙ
# Скопируйте всю эту команду и вставьте в SSH терминал одной строкой

sudo systemctl stop campus-hub.service campus-hub-api.service 2>/dev/null || true && \
sudo rm -rf /var/www/Campus_Hub/.next && \
cd /var/www/Campus_Hub && \
sudo -u campus git pull && \
sudo chown -R campus:campus /var/www/Campus_Hub && \
sudo chmod -R 750 /var/www/Campus_Hub && \
sudo chmod -R 770 /var/www/Campus_Hub/uploads && \
sudo -u campus npm run build && \
sudo cp /var/www/Campus_Hub/deploy/systemd/campus-hub*.service /etc/systemd/system/ && \
sudo systemctl daemon-reload && \
sudo systemctl enable campus-hub-api.service campus-hub.service && \
sudo systemctl start campus-hub-api.service && \
sleep 3 && \
sudo systemctl start campus-hub.service && \
sleep 3 && \
SERVER_IP=$(curl -s ifconfig.me) && \
sudo cp /var/www/Campus_Hub/deploy/nginx/campus-hub.conf /etc/nginx/sites-available/campus-hub.conf && \
sudo sed -i "s/YOUR_DOMAIN/$SERVER_IP/g" /etc/nginx/sites-available/campus-hub.conf && \
sudo rm -f /etc/nginx/sites-enabled/default && \
sudo ln -sf /etc/nginx/sites-available/campus-hub.conf /etc/nginx/sites-enabled/ && \
sudo nginx -t && \
sudo systemctl reload nginx && \
echo "" && \
echo "==========================================" && \
echo "✅ ДЕПЛОЙ ЗАВЕРШЁН УСПЕШНО!" && \
echo "==========================================" && \
echo "🌐 Ваше приложение доступно по адресу:" && \
echo "   http://$SERVER_IP" && \
echo "" && \
echo "📊 Статус сервисов:" && \
sudo systemctl status campus-hub-api.service --no-pager -l | grep -E "(Active|Main PID)" && \
sudo systemctl status campus-hub.service --no-pager -l | grep -E "(Active|Main PID)" && \
echo "" && \
echo "🔌 Открытые порты:" && \
sudo ss -tlnp | grep -E ':(3000|4000|80)' && \
echo "" && \
echo "🧪 Проверка доступности:" && \
curl -I http://localhost:3000 2>/dev/null | head -1 && \
curl -I http://localhost:4000 2>/dev/null | head -1 && \
echo "==========================================="
