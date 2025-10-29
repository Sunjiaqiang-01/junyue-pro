#!/bin/bash
# 君悦SPA PM2管理脚本

case "$1" in
  start)
    cd /root/junyue-pro && pm2 start ecosystem.config.js
    ;;
  stop)
    pm2 stop junyue-spa
    ;;
  restart)
    pm2 restart junyue-spa
    ;;
  reload)
    pm2 reload junyue-spa
    ;;
  status)
    pm2 status
    ;;
  logs)
    pm2 logs junyue-spa --lines ${2:-50}
    ;;
  monit)
    pm2 monit
    ;;
  deploy)
    echo "部署新版本..."
    cd /root/junyue-pro
    git pull
    npm install --production
    npm run build
    pm2 reload junyue-spa
    echo "部署完成！"
    ;;
  *)
    echo "用法: $0 {start|stop|restart|reload|status|logs|monit|deploy}"
    exit 1
    ;;
esac

