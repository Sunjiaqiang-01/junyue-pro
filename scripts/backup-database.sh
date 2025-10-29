#!/bin/bash
# 君悦SPA - 数据库自动备份脚本
# 每天凌晨3点执行，保留最近7天备份

set -e  # 遇到错误立即退出

# 配置变量
BACKUP_DIR="/root/backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_ONLY=$(date +%Y%m%d)
DB_NAME="junyue_spa"
DB_USER="junyue_user"
DB_PASSWORD="junyue_password_dev"
BACKUP_FILE="${BACKUP_DIR}/junyue_spa_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"
LOG_FILE="/var/log/junyue-spa/backup.log"
RETENTION_DAYS=7

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========== 开始数据库备份 =========="

# 检查Docker容器是否运行
if ! docker ps | grep -q junyue-postgres; then
    log "❌ 错误：PostgreSQL容器未运行"
    exit 1
fi

# 执行备份
log "📦 正在备份数据库 ${DB_NAME}..."
docker exec junyue-postgres pg_dump -U ${DB_USER} ${DB_NAME} > "${BACKUP_FILE}" 2>&1

if [ $? -eq 0 ]; then
    # 压缩备份文件
    log "🗜️  正在压缩备份文件..."
    gzip "${BACKUP_FILE}"
    
    # 获取备份文件大小
    BACKUP_SIZE=$(du -h "${BACKUP_FILE_GZ}" | cut -f1)
    log "✅ 备份成功：${BACKUP_FILE_GZ} (${BACKUP_SIZE})"
    
    # 清理旧备份（保留最近7天）
    log "🧹 清理 ${RETENTION_DAYS} 天前的旧备份..."
    find ${BACKUP_DIR} -name "junyue_spa_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
    
    # 统计当前备份数量和总大小
    BACKUP_COUNT=$(find ${BACKUP_DIR} -name "junyue_spa_*.sql.gz" -type f | wc -l)
    TOTAL_SIZE=$(du -sh ${BACKUP_DIR} | cut -f1)
    log "📊 当前共有 ${BACKUP_COUNT} 个备份文件，总大小：${TOTAL_SIZE}"
    
    log "========== 备份完成 =========="
else
    log "❌ 备份失败！"
    exit 1
fi

# 可选：上传到远程存储（如OSS、S3等）
# 取消注释以下行并配置相应的上传命令
# log "☁️  上传备份到云端..."
# rclone copy "${BACKUP_FILE_GZ}" remote:backups/junyue-spa/

exit 0

