# Campus Hub - Инструкция по Развёртыванию на Digital Ocean

## 🚀 Быстрый Старт

### Предварительные Требования

- ✅ Ubuntu 24.04 Droplet (минимум 2GB RAM)
- ✅ Node.js 20 LTS установлен
- ✅ Nginx установлен
- ✅ Git установлен
- ✅ UFW настроен (порты 80, 443, SSH открыты)

### Текущий Статус Сервера

- 🌐 IP: `164.92.104.243`
- 👤 Пользователь: `campus` (создан)
- 📦 Node.js: `v20.19.5` ✅
- 🌍 Nginx: установлен ✅
- 🔥 Firewall: настроен ✅

---

## 📋 Полная Инструкция по Деплою

### Вариант 1: Автоматический (Рекомендуется)

Скопируйте и вставьте весь блок команд в SSH терминал:

```bash
# Остановка сервисов
sudo systemctl stop campus-hub.service campus-hub-api.service 2>/dev/null || true

# Очистка кеша
sudo rm -rf /var/www/Campus_Hub/.next

# Обновление кода
cd /var/www/Campus_Hub
sudo -u campus git pull

# Исправление прав
sudo chown -R campus:campus /var/www/Campus_Hub
sudo chmod -R 750 /var/www/Campus_Hub
sudo chmod -R 770 /var/www/Campus_Hub/uploads

# Сборка проекта
sudo -u campus npm run build

# Обновление systemd
sudo cp /var/www/Campus_Hub/deploy/systemd/campus-hub*.service /etc/systemd/system/
sudo systemctl daemon-reload

# Запуск сервисов
sudo systemctl start campus-hub-api.service
sudo systemctl start campus-hub.service
sudo systemctl enable campus-hub-api.service campus-hub.service

# Настройка Nginx
SERVER_IP=$(curl -s ifconfig.me)
sudo cp /var/www/Campus_Hub/deploy/nginx/campus-hub.conf /etc/nginx/sites-available/campus-hub.conf
sudo sed -i "s/YOUR_DOMAIN/$SERVER_IP/g" /etc/nginx/sites-available/campus-hub.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/campus-hub.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Проверка
echo "✅ Приложение доступно по адресу: http://$SERVER_IP"
```

---

### Вариант 2: Пошаговый

#### Шаг 1: Остановка сервисов

```bash
sudo systemctl stop campus-hub.service campus-hub-api.service
```

#### Шаг 2: Очистка кеша сборки

```bash
sudo rm -rf /var/www/Campus_Hub/.next
```

#### Шаг 3: Обновление кода с GitHub

```bash
cd /var/www/Campus_Hub
sudo -u campus git pull
```

#### Шаг 4: Исправление прав доступа

```bash
sudo chown -R campus:campus /var/www/Campus_Hub
sudo chmod -R 750 /var/www/Campus_Hub
sudo chmod -R 770 /var/www/Campus_Hub/uploads
```

#### Шаг 5: Сборка Next.js приложения

```bash
cd /var/www/Campus_Hub
sudo -u campus npm run build
```

> ⚠️ Если сборка падает с ошибками модулей - проверьте что все файлы на месте:
>
> ```bash
> ls -la src/components/ChatWindow.js
> ls -la src/components/TeacherPanel.js
> ```

#### Шаг 6: Обновление systemd сервисов

```bash
sudo cp /var/www/Campus_Hub/deploy/systemd/campus-hub*.service /etc/systemd/system/
sudo systemctl daemon-reload
```

#### Шаг 7: Запуск сервисов

```bash
sudo systemctl start campus-hub-api.service
sudo systemctl start campus-hub.service
sudo systemctl enable campus-hub-api.service campus-hub.service
```

#### Шаг 8: Проверка статуса

```bash
sudo systemctl status campus-hub-api.service
sudo systemctl status campus-hub.service
sudo ss -tlnp | grep -E ':(3000|4000)'
```

Вы должны увидеть:

- ✅ `campus-hub-api.service` - Active (running) на порту 4000
- ✅ `campus-hub.service` - Active (running) на порту 3000

#### Шаг 9: Настройка Nginx

```bash
# Получить IP сервера
SERVER_IP=$(curl -s ifconfig.me)
echo "Ваш IP: $SERVER_IP"

# Скопировать конфиг
sudo cp /var/www/Campus_Hub/deploy/nginx/campus-hub.conf /etc/nginx/sites-available/campus-hub.conf

# Заменить YOUR_DOMAIN на IP
sudo sed -i "s/YOUR_DOMAIN/$SERVER_IP/g" /etc/nginx/sites-available/campus-hub.conf

# Удалить дефолтный конфиг
sudo rm -f /etc/nginx/sites-enabled/default

# Активировать конфиг
sudo ln -sf /etc/nginx/sites-available/campus-hub.conf /etc/nginx/sites-enabled/

# Проверить и перезапустить
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 Диагностика Проблем

### Проверка логов

```bash
# API логи
sudo journalctl -u campus-hub-api.service -n 50 --no-pager

# Next.js логи
sudo journalctl -u campus-hub.service -n 50 --no-pager

# Nginx логи
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Проверка портов

```bash
sudo ss -tlnp | grep -E ':(3000|4000|80|443)'
```

### Проверка работоспособности

```bash
# API
curl -I http://localhost:4000

# Next.js
curl -I http://localhost:3000

# Через Nginx
curl -I http://164.92.104.243
```

### Частые проблемы

#### 1. Ошибка "Module not found"

```bash
cd /var/www/Campus_Hub
sudo rm -rf .next node_modules package-lock.json
sudo -u campus npm install
sudo -u campus npm run build
```

#### 2. Сервис не запускается (Status 200/CHDIR)

```bash
# Проверить права
ls -la /var/www/Campus_Hub
sudo chown -R campus:campus /var/www/Campus_Hub
```

#### 3. Порт занят

```bash
sudo lsof -i :3000
sudo lsof -i :4000
# Убить процесс если нужно
sudo kill -9 <PID>
```

---

## 🔄 Обновление Приложения

После изменений в коде:

```bash
cd /var/www/Campus_Hub
sudo -u campus git pull
sudo -u campus npm ci
sudo -u campus npm run build
sudo systemctl restart campus-hub-api.service
sudo systemctl restart campus-hub.service
```

---

## 🔒 Настройка HTTPS (SSL)

После привязки домена:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot автоматически:

- Получит SSL сертификат от Let's Encrypt
- Настроит Nginx для HTTPS
- Настроит автообновление сертификата

---

## 🛡️ Безопасность и Резервные Копии

### Установка защиты

```bash
# Fail2ban для защиты от брутфорса
sudo apt install -y fail2ban

# Автоматические обновления безопасности
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### Настройка бэкапов

```bash
sudo mkdir -p /var/backups/campus-hub

# Создать скрипт бэкапа
cat << 'EOF' | sudo tee /usr/local/bin/backup-campus.sh
#!/bin/bash
BACKUP_DIR="/var/backups/campus-hub"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
cd /var/www/Campus_Hub
tar czf "$BACKUP_DIR/campus-$DATE.tar.gz" db.json uploads/
find "$BACKUP_DIR" -name "campus-*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /usr/local/bin/backup-campus.sh

# Добавить в cron (ежедневно в 2:00)
echo "0 2 * * * root /usr/local/bin/backup-campus.sh >> /var/log/campus-backup.log 2>&1" | sudo tee /etc/cron.d/campus-hub-backup

# Проверка работы бэкапа
sudo /usr/local/bin/backup-campus.sh
ls -lh /var/backups/campus-hub/
```

### Восстановление из бэкапа

```bash
cd /var/www/Campus_Hub
sudo tar xzf /var/backups/campus-hub/campus-YYYY-MM-DD_HH-MM-SS.tar.gz
sudo systemctl restart campus-hub-api.service
```

---

## 📊 Мониторинг

### Просмотр использования ресурсов

```bash
# CPU и память
htop

# Дисковое пространство
df -h

# Сетевые соединения
sudo netstat -tulpn
```

### Автоматический перезапуск при падении

Systemd уже настроен на автоматический перезапуск (`Restart=always`).

---

## 🌐 Доступ к Приложению

После успешного деплоя:

- **Основное приложение**: http://164.92.104.243/
- **API**: http://164.92.104.243/api/
- **Загрузки**: http://164.92.104.243/uploads/

### Тестовые endpoints

```bash
# Проверка API
curl http://164.92.104.243/api/users

# Проверка загрузок
curl -I http://164.92.104.243/uploads/
```

---

## 📝 Архитектура

```
Internet (Port 80/443)
    ↓
Nginx (Reverse Proxy)
    ↓
├── / → Next.js (Port 3000)
├── /api/ → API Server (Port 4000)
└── /uploads/ → API Server (Port 4000)
```

### Сервисы

- `campus-hub.service` - Next.js фронтенд
- `campus-hub-api.service` - Express + JSON Server API
- `nginx.service` - Веб-сервер и прокси

---

## 🆘 Поддержка

При проблемах проверьте:

1. Логи сервисов (`journalctl`)
2. Nginx конфигурацию (`nginx -t`)
3. Права доступа к файлам
4. Открытые порты (`ufw status`)

---

## 📚 Дополнительно

### Перезагрузка сервера

```bash
sudo reboot
```

После перезагрузки все сервисы запустятся автоматически (enabled).

### Просмотр всех сервисов

```bash
sudo systemctl list-units --type=service --state=running | grep campus
```

### Удаление приложения

```bash
sudo systemctl stop campus-hub.service campus-hub-api.service
sudo systemctl disable campus-hub.service campus-hub-api.service
sudo rm /etc/systemd/system/campus-hub*.service
sudo rm /etc/nginx/sites-enabled/campus-hub.conf
sudo rm -rf /var/www/Campus_Hub
sudo systemctl daemon-reload
sudo systemctl reload nginx
```

---

**Статус**: ✅ Готово к использованию  
**Последнее обновление**: 25 ноября 2025
