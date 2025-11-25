#!/bin/bash
# Nginx Setup Script for Campus Hub
# Выполните после успешного деплоя приложения

echo "=== Configuring Nginx ==="

# Копируем конфиг
sudo cp /var/www/Campus_Hub/deploy/nginx/campus-hub.conf /etc/nginx/sites-available/campus-hub.conf

# Получаем IP адрес сервера
SERVER_IP=$(curl -s ifconfig.me)
echo "Your server IP: $SERVER_IP"

# Замена YOUR_DOMAIN на IP (можно потом поменять на домен)
sudo sed -i "s/YOUR_DOMAIN/$SERVER_IP/g" /etc/nginx/sites-available/campus-hub.conf

# Удаляем дефолтный конфиг если есть
sudo rm -f /etc/nginx/sites-enabled/default

# Создаем симлинк
sudo ln -sf /etc/nginx/sites-available/campus-hub.conf /etc/nginx/sites-enabled/

# Проверяем конфиг nginx
echo "=== Testing Nginx config ==="
sudo nginx -t

# Перезапускаем nginx
if [ $? -eq 0 ]; then
    echo "=== Reloading Nginx ==="
    sudo systemctl reload nginx
    sudo systemctl status nginx --no-pager
    echo ""
    echo "=== Setup Complete! ==="
    echo "Your app should be accessible at: http://$SERVER_IP"
    echo ""
    echo "To add HTTPS later, run:"
    echo "sudo apt install -y certbot python3-certbot-nginx"
    echo "sudo certbot --nginx -d your-domain.com"
else
    echo "ERROR: Nginx config test failed!"
    exit 1
fi
