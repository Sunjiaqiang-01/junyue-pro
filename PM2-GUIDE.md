# 君悦SPA PM2进程管理指南

## 快速命令

```bash
# 查看状态
pm2 status

# 查看日志（实时）
pm2 logs junyue-spa

# 查看日志（最近50行）
pm2 logs junyue-spa --lines 50 --nostream

# 重启应用
pm2 restart junyue-spa

# 停止应用
pm2 stop junyue-spa

# 启动应用
pm2 start junyue-spa

# 实时监控
pm2 monit
```

## 管理脚本使用

```bash
# 查看状态
/root/junyue-pro/scripts/pm2-manage.sh status

# 查看日志
/root/junyue-pro/scripts/pm2-manage.sh logs

# 重启服务
/root/junyue-pro/scripts/pm2-manage.sh restart

# 部署新版本（Git pull + Build + Reload）
/root/junyue-pro/scripts/pm2-manage.sh deploy
```

## 配置文件位置

- PM2配置：`/root/junyue-pro/ecosystem.config.js`
- 应用日志：`/var/log/junyue-spa/out.log`
- 错误日志：`/var/log/junyue-spa/error.log`
- 健康检查日志：`/var/log/junyue-spa/health-check.log`
- Systemd服务：`/etc/systemd/system/pm2-root.service`

## 系统服务管理

```bash
# 查看PM2服务状态
systemctl status pm2-root

# 启动/停止/重启PM2服务
systemctl start pm2-root
systemctl stop pm2-root
systemctl restart pm2-root

# 禁用/启用开机自启
systemctl disable pm2-root
systemctl enable pm2-root
```

## 健康检查

- 自动检查：每5分钟检查一次（cron任务）
- 如果HTTP状态非200，自动重启应用
- 查看检查日志：`tail -f /var/log/junyue-spa/health-check.log`

## 日志轮转

- 单个日志文件最大：100MB
- 保留历史文件：10个
- 自动管理：pm2-logrotate模块

## 故障排查

### 应用无法启动

```bash
# 1. 查看错误日志
pm2 logs junyue-spa --err

# 2. 检查端口占用
lsof -i :3000

# 3. 清理旧进程
pkill -9 -f "next-server"
pm2 delete all
pm2 start /root/junyue-pro/ecosystem.config.js
```

### 应用频繁重启

```bash
# 1. 查看内存使用
pm2 status

# 2. 增加内存限制（编辑ecosystem.config.js）
max_memory_restart: "2G"

# 3. 重载配置
pm2 delete all && pm2 start /root/junyue-pro/ecosystem.config.js
```

### 服务器重启后应用未自动启动

```bash
# 检查systemd服务
systemctl status pm2-root

# 如果服务未启动
systemctl start pm2-root

# 如果服务已启动但应用未运行
pm2 resurrect
```

## 性能监控

```bash
# 实时监控CPU/内存
pm2 monit

# 查看详细信息
pm2 show junyue-spa

# 查看进程列表（JSON格式）
pm2 jlist
```

## 重要注意事项

⚠️ **禁止使用以下命令（会导致Cursor断开连接）：**

```bash
pkill -f "node"        # ❌ 会杀死所有Node进程，包括Cursor
killall node           # ❌ 同上
```

✅ **正确的进程清理方式：**

```bash
pm2 stop junyue-spa    # ✅ 只停止应用
pm2 restart junyue-spa # ✅ 重启应用
pm2 reload junyue-spa  # ✅ 零停机重载
pkill -f "next-server" # ✅ 只杀Next.js进程
```

## 部署流程

### 1. 代码更新

```bash
cd /root/junyue-pro
git pull
```

### 2. 依赖安装

```bash
npm install --production
```

### 3. 构建应用

```bash
npm run build
```

### 4. 零停机重启

```bash
pm2 reload junyue-spa
```

### 或使用一键部署脚本

```bash
/root/junyue-pro/scripts/pm2-manage.sh deploy
```

## 配置调整

### 修改端口

编辑 `ecosystem.config.js`:

```javascript
env: {
  NODE_ENV: "production",
  PORT: 3001,  // 修改为新端口
}
```

然后重启：`pm2 restart junyue-spa`

### 修改内存限制

编辑 `ecosystem.config.js`:

```javascript
max_memory_restart: "2G",  // 修改为新限制
```

然后重启：`pm2 restart junyue-spa`

### 启用多实例（集群模式）

编辑 `ecosystem.config.js`:

```javascript
instances: 2,  // 或 "max" 使用所有CPU核心
exec_mode: "cluster",
```

然后重启：`pm2 restart junyue-spa`
