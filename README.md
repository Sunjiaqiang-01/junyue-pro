# 君悦SPA - 技师预约服务平台

> 基于 Next.js 15 + Tailwind CSS 3 + Prisma + PostgreSQL 的全栈SPA预约平台

---

## 📚 项目文档

- [项目需求文档](./项目需求文档.md)
- [数据库设计文档](./数据库设计文档.md)
- [API接口文档](./API接口文档.md)
- [开发计划](./开发计划.md)
- [UI设计方案](./君悦SPA-高级设计方案.md)

---

## 🚀 快速开始

### 环境要求

- Node.js 20+
- PostgreSQL 16+
- npm 10+

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 🛠️ 技术栈

### 核心框架
- **Next.js 15.5.4** - React全栈框架（App Router）
- **React 19.1.0** - UI框架
- **TypeScript 5** - 类型安全

### 样式系统
- **Tailwind CSS 3.4.17** ⚠️ 锁定v3版本，不兼容v4
- **tailwindcss-animate** - 动画工具
- **Framer Motion** - 高级动画库

### UI组件
- **shadcn/ui** - 基础组件库
- **21st.dev组件** - 35个精选UI组件
- **Radix UI** - 无障碍组件基础
- **Lucide React** - 图标库

### 数据库
- **PostgreSQL** - 主数据库
- **Prisma** - ORM框架

### 认证
- **NextAuth.js v5** - 身份认证

---

## ⚠️ 重要注意事项

### Tailwind CSS版本锁定

**项目必须使用 Tailwind CSS v3.x，禁止升级到v4！**

**原因：**
- 21st.dev的UI组件基于Tailwind v3开发
- v4的配置语法与v3不兼容
- v4的自定义颜色扩展机制改变

**当前版本：**
```json
{
  "tailwindcss": "3.4.17",
  "postcss": "8.4.49",
  "autoprefixer": "10.4.20"
}
```

**正确的配置文件：**

`postcss.config.mjs`:
```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
export default config;
```

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ❌ 禁止使用v4语法：
@plugin "xxx"
@custom-variant
@theme inline
*/
```

---

## 🐛 常见问题排查

### 问题1: UI组件渐变效果不显示

**症状：**
- 按钮应该有金色→紫色渐变，但只显示单色
- 自定义颜色类名（如 `from-primary-purple`）不生效

**原因：**
- Tailwind配置修改后未重启服务器
- 或者错误升级到了v4

**解决方案：**
```bash
# 1. 停止开发服务器（Ctrl+C）
# 2. 清除缓存
Remove-Item -Path .next -Recurse -Force
# 3. 重启服务器
npm run dev
```

### 问题2: 编译错误 `Cannot find module '@tailwindcss/postcss'`

**症状：**
```
Error: Cannot find module '@tailwindcss/postcss'
```

**原因：**
- `postcss.config.mjs` 使用了v4语法
- 或者 `globals.css` 包含v4特有指令

**解决方案：**
```bash
# 1. 检查并修复 postcss.config.mjs
# 2. 检查并清理 globals.css 中的 @plugin, @theme inline 等v4语法
# 3. 清除缓存并重启
```

### 问题3: MCP工具返回的组件无法使用

**症状：**
- 从21st.dev复制的组件代码无法正常显示

**解决方案：**
1. 检查组件代码中的颜色类名
2. 在 `tailwind.config.ts` 中添加颜色定义
3. 检查并安装组件依赖的npm包
4. 重启开发服务器

---

## 📁 项目结构

```
junyue-spa/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (user)/            # 用户端路由组
│   │   ├── (therapist)/       # 技师端路由组
│   │   ├── (admin)/           # 管理端路由组
│   │   └── api/               # API路由
│   ├── components/            # 组件
│   │   ├── ui/                # shadcn/ui组件
│   │   ├── user/              # 用户端组件
│   │   ├── therapist/         # 技师端组件
│   │   └── admin/             # 管理端组件
│   ├── lib/                   # 工具函数
│   └── types/                 # TypeScript类型
├── prisma/                    # 数据库Schema
├── public/                    # 静态资源
├── .cursorrules               # Cursor AI开发规范
├── tailwind.config.ts         # Tailwind配置 ⚠️ v3语法
└── package.json               # 依赖管理
```

---

## 🔧 开发规范

### UI组件开发

1. **优先使用设计方案中的35个组件**
2. **使用21st.dev MCP工具获取新组件**
3. **禁止手动编写UI组件**
4. **添加组件后检查清单：**
   - [ ] 颜色类名已在 `tailwind.config.ts` 中定义
   - [ ] npm依赖已安装
   - [ ] 开发服务器已重启
   - [ ] UI效果正常显示

---

## 📦 可用脚本

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 数据库迁移
npm run db:migrate

# 数据库种子数据
npm run db:seed
```

---

## 🤝 开发者

- 开发模式：单人全栈开发
- AI辅助：Cursor + Claude 4.0

---

## 📝 License

MIT
