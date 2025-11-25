#!/bin/bash
# Wrapper для безопасного выполнения через pipe

set -e
SCRIPT_URL="https://raw.githubusercontent.com/Nerdlin/Campus_Hub/main/auto_deploy_full.sh"

echo "Загрузка скрипта деплоя..."
TMP_SCRIPT=$(mktemp)
curl -fsSL "$SCRIPT_URL" -o "$TMP_SCRIPT"
chmod +x "$TMP_SCRIPT"

echo "Запуск деплоя..."
bash "$TMP_SCRIPT"

rm -f "$TMP_SCRIPT"
