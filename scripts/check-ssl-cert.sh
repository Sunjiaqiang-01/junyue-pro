#!/bin/bash
# SSL证书有效期检查脚本

DOMAIN="junyue.org"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
WARN_DAYS=30

# 检查证书到期时间
if [ ! -f "$CERT_PATH" ]; then
    echo "⚠️  证书文件不存在: $CERT_PATH"
    exit 1
fi

EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

echo "[$(date '+%Y-%m-%d %H:%M:%S')] SSL证书检查"
echo "域名: $DOMAIN"
echo "到期时间: $EXPIRY_DATE"
echo "剩余天数: $DAYS_LEFT 天"

if [ $DAYS_LEFT -lt $WARN_DAYS ]; then
    echo "⚠️  警告: 证书将在 $DAYS_LEFT 天后过期，建议续期！"
    # 可以在这里添加邮件通知或其他告警
else
    echo "✅ 证书有效期正常"
fi
