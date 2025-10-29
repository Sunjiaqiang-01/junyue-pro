#!/bin/bash
# 君悦SPA应用健康检查脚本
# 每5分钟运行一次，检查应用是否正常响应

LOG_FILE="/var/log/junyue-spa/health-check.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 检查首页
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>&1)

if [ "$response" != "200" ]; then
  echo "[$TIMESTAMP] ❌ 健康检查失败: HTTP $response - 正在重启应用..." >> "$LOG_FILE"
  pm2 restart junyue-spa
  sleep 5
  # 重启后再次检查
  response2=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>&1)
  echo "[$TIMESTAMP] 重启后状态: HTTP $response2" >> "$LOG_FILE"
else
  echo "[$TIMESTAMP] ✅ 健康检查通过: HTTP $response" >> "$LOG_FILE"
fi

