# Docker开发环境使用说明

## 🚀 快速开始

### 1. 首次启动

```bash
# 启动所有服务
docker-compose up -d

# 等待数据库就绪后，运行数据库迁移
docker-compose exec app npx prisma migrate dev --name init

# 生成Prisma Client
docker-compose exec app npx prisma generate

# 运行种子数据（可选）
docker-compose exec app npx prisma db seed
```

### 2. 访问服务

- **Next.js应用**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (需要启动工具服务)
- **PostgreSQL**: localhost:5432
  - 用户名: `junyue_user`
  - 密码: `junyue_password_dev`
  - 数据库: `junyue_spa`
- **Redis**: localhost:6379

### 3. 启动Prisma Studio（可选）

```bash
docker-compose --profile tools up prisma-studio -d
```

## 📝 常用命令

### 容器管理

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f app

# 停止所有服务
docker-compose down

# 停止并删除数据卷（⚠️ 会删除所有数据）
docker-compose down -v
```

### 数据库操作

```bash
# 创建新的迁移
docker-compose exec app npx prisma migrate dev --name migration_name

# 应用迁移
docker-compose exec app npx prisma migrate deploy

# 重置数据库（⚠️ 会删除所有数据）
docker-compose exec app npx prisma migrate reset

# 查看数据库
docker-compose exec app npx prisma studio

# 直接连接PostgreSQL
docker-compose exec postgres psql -U junyue_user -d junyue_spa
```

### 应用操作

```bash
# 进入应用容器
docker-compose exec app sh

# 安装新依赖
docker-compose exec app npm install package-name

# 运行测试
docker-compose exec app npm test

# 构建生产版本
docker-compose exec app npm run build
```

### 清理和重建

```bash
# 重新构建镜像
docker-compose build --no-cache

# 清理未使用的镜像和容器
docker system prune -a

# 完全重置环境
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 配置说明

### 环境变量

开发环境的环境变量在 `docker-compose.yml` 中配置，包括：

- `DATABASE_URL`: PostgreSQL连接字符串
- `REDIS_URL`: Redis连接字符串
- `NEXTAUTH_SECRET`: NextAuth密钥（开发环境）
- `NEXT_PUBLIC_TENCENT_MAP_KEY`: 腾讯地图API Key

⚠️ **生产环境请使用独立的`.env.production`文件，不要提交到Git！**

### 数据持久化

以下数据通过Docker Volume持久化：

- `postgres-data`: PostgreSQL数据
- `redis-data`: Redis数据
- `uploads-data`: 用户上传的文件

即使删除容器，这些数据也会保留。

### 热重载

代码修改会自动触发热重载，无需重启容器。

## 📦 与本地开发的差异

### Docker开发（推荐）

**优势**：
- ✅ 环境一致，避免"在我机器上可以运行"问题
- ✅ PostgreSQL、Redis等服务自动配置
- ✅ 团队成员环境统一
- ✅ 接近生产环境

**使用场景**：
- 团队协作开发
- 需要PostgreSQL和Redis
- 接近生产环境测试

### 本地开发

**优势**：
- ✅ 启动更快
- ✅ IDE调试更方便
- ✅ 不占用Docker资源

**要求**：
- 需要本地安装Node.js 20+
- 需要本地安装PostgreSQL 16
- 需要本地安装Redis（可选）

**使用场景**：
- 个人独立开发
- 快速原型验证
- 前端开发（使用SQLite）

## 🐛 常见问题

### 1. 端口被占用

```bash
# 检查端口占用
# Windows PowerShell
netstat -ano | findstr :3000

# 修改docker-compose.yml中的端口映射
ports:
  - "3001:3000"  # 改为3001
```

### 2. 数据库连接失败

```bash
# 检查PostgreSQL是否就绪
docker-compose logs postgres

# 重启数据库服务
docker-compose restart postgres

# 等待健康检查通过
docker-compose ps
```

### 3. 热重载不工作

```bash
# Windows下可能需要启用轮询
# 在package.json中修改dev脚本
"dev": "next dev --experimental-https"

# 或者设置环境变量
CHOKIDAR_USEPOLLING=true
```

### 4. 磁盘空间不足

```bash
# 清理Docker缓存
docker system prune -a --volumes

# 查看磁盘使用
docker system df
```

## 🔄 与开发计划的一致性

本Docker配置与 `开发计划.md` 完全一致：

- ✅ PostgreSQL 16
- ✅ Redis 7
- ✅ Node.js 20
- ✅ Next.js 14
- ✅ Prisma ORM
- ✅ 本地文件存储

**差异说明**：

开发计划中的环境搭建步骤是基于**本地安装**的方式，但使用Docker是**更推荐的方式**：

| 方面 | 本地安装（开发计划） | Docker（本配置） |
|------|-------------------|-----------------|
| PostgreSQL | 手动安装 | 自动容器化 ✅ |
| Redis | 手动安装 | 自动容器化 ✅ |
| 环境一致性 | 依赖本地环境 | 完全一致 ✅ |
| 启动速度 | 较快 | 稍慢 |
| 团队协作 | 可能有差异 | 完全一致 ✅ |

## 📌 建议

1. **开发环境**: 使用Docker（当前配置）
2. **生产环境**: 按照开发计划的Day 60-61步骤部署到服务器
3. **数据备份**: 定期备份Docker Volume数据

---

**开发愉快！** 🎉

