#!/bin/bash
set -e

echo "========================================"
echo "🚀 Campus Hub Auto Deploy Script"
echo "========================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

step() {
    echo -e "${BLUE}▶ $1${NC}"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

step "1. Обновление системы..."
apt update && apt upgrade -y || error "Не удалось обновить систему"
success "Система обновлена"

step "2. Установка базовых пакетов..."
apt install -y build-essential git curl nginx ufw || error "Не удалось установить пакеты"
success "Базовые пакеты установлены"

step "3. Установка Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - || error "Не удалось добавить репозиторий Node.js"
apt install -y nodejs || error "Не удалось установить Node.js"
node -v
npm -v
success "Node.js установлен"

step "4. Создание пользователя campus..."
if id "campus" &>/dev/null; then
    echo "Пользователь campus уже существует"
else
    adduser --disabled-password --gecos "" campus
    usermod -aG sudo campus
    success "Пользователь campus создан"
fi

step "5. Настройка firewall (UFW)..."
ufw --force enable
ufw allow OpenSSH
ufw allow http
ufw allow https
ufw status
success "Firewall настроен"

step "6. Клонирование проекта..."
mkdir -p /var/www
chown campus:campus /var/www

if [ -d "/var/www/Campus_Hub" ]; then
    echo "Проект уже существует, обновляем..."
    cd /var/www/Campus_Hub
    sudo -u campus git pull
else
    sudo -u campus git clone https://github.com/Nerdlin/Campus_Hub.git /var/www/Campus_Hub
fi
success "Проект клонирован"

step "7. Установка зависимостей..."
cd /var/www/Campus_Hub
sudo -u campus npm ci || error "Не удалось установить зависимости"
success "Зависимости установлены"

step "8. Создание директорий и настройка прав..."
sudo -u campus mkdir -p /var/www/Campus_Hub/uploads
chown -R campus:campus /var/www/Campus_Hub
chmod -R 750 /var/www/Campus_Hub
chmod -R 770 /var/www/Campus_Hub/uploads
success "Права настроены"

step "9. Сборка Next.js приложения..."
sudo -u campus npm run build || error "Не удалось собрать проект"
success "Проект собран"

step "10. Настройка systemd сервисов..."
cp /var/www/Campus_Hub/deploy/systemd/campus-hub*.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable campus-hub-api.service campus-hub.service
success "Systemd сервисы настроены"

step "11. Запуск API сервиса..."
systemctl start campus-hub-api.service
sleep 3
if systemctl is-active --quiet campus-hub-api.service; then
    success "API сервис запущен"
else
    error "API сервис не запустился"
fi

step "12. Запуск Next.js сервиса..."
systemctl start campus-hub.service
sleep 3
if systemctl is-active --quiet campus-hub.service; then
    success "Next.js сервис запущен"
else
    error "Next.js сервис не запустился"
fi

step "13. Настройка Nginx..."
SERVER_IP=$(curl -s ifconfig.me)
echo "Используем IP: $SERVER_IP"

cp /var/www/Campus_Hub/deploy/nginx/campus-hub.conf /etc/nginx/sites-available/campus-hub.conf
sed -i "s/YOUR_DOMAIN/$SERVER_IP/g" /etc/nginx/sites-available/campus-hub.conf
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/campus-hub.conf /etc/nginx/sites-enabled/

nginx -t || error "Nginx конфигурация невалидна"
systemctl reload nginx
success "Nginx настроен и перезапущен"

step "14. Финальная проверка..."
echo ""
echo "Проверка портов:"
ss -tlnp | grep -E ':(3000|4000|80)' || true
echo ""
echo "Статус сервисов:"
systemctl status campus-hub-api.service --no-pager -l | head -5
systemctl status campus-hub.service --no-pager -l | head -5
echo ""

step "15. Тест доступности..."
sleep 2
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000 || echo "000")
NEXT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")

if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "404" ]; then
    success "API отвечает (код: $API_STATUS)"
else
    echo "⚠ API код: $API_STATUS"
fi

if [ "$NEXT_STATUS" = "200" ] || [ "$NEXT_STATUS" = "404" ]; then
    success "Next.js отвечает (код: $NEXT_STATUS)"
else
    echo "⚠ Next.js код: $NEXT_STATUS"
fi

echo ""
echo "========================================"
echo "✅ ДЕПЛОЙ ЗАВЕРШЁН УСПЕШНО!"
echo "========================================"
echo ""
echo "🌐 Ваше приложение доступно по адресу:"
echo "   👉 http://$SERVER_IP"
echo ""
echo "📊 Команды для управления:"
echo "   sudo systemctl status campus-hub.service"
echo "   sudo systemctl status campus-hub-api.service"
echo "   sudo journalctl -u campus-hub.service -f"
echo ""
echo "🔄 Для обновления в будущем:"
echo "   cd /var/www/Campus_Hub"
echo "   sudo -u campus git pull"
echo "   sudo -u campus npm ci"
echo "   sudo -u campus npm run build"
echo "   sudo systemctl restart campus-hub-api.service campus-hub.service"
echo ""
echo "========================================"
