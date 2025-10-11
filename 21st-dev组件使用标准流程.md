# 21st.dev组件使用标准流程

## 📋 核心原则

> **21st.dev组件 = 完整复制 + 数据替换，绝不重写或简化！**

**工具用途：**
- ✅ 21st.dev MCP工具用于**搜索现有组件**
- ❌ 不是用来获取"灵感"或"参考"
- ❌ 不是用来"创建"新组件

---

## 🔄 标准操作流程

### 步骤1：搜索组件
```typescript
使用工具：mcp_21st-devmagic_21st_magic_component_inspiration
参数：
- message: 描述需要的组件功能
- searchQuery: 2-4个关键词（如 "responsive navbar"）
```

**注意事项：**
- 明确描述组件需求
- 使用英文关键词搜索
- 查看多个搜索结果，选择最合适的

---

### 步骤2：阅读完整代码
```markdown
必须阅读：
1. componentCode（组件主代码）
2. registryDependencies（依赖的子组件）
3. npmDependencies（需要安装的包）
4. demoCode（使用示例）
```

**注意事项：**
- 不要跳过任何部分
- 理解组件的完整结构
- 记录所有依赖项

---

### 步骤3：创建文件并粘贴完整代码

```bash
# 创建主组件文件
src/components/[ComponentName].tsx

# 创建依赖组件文件（如果有）
src/components/ui/[dependency].tsx
```

**关键要求：**
- ✅ **完整粘贴** componentCode，一个字符都不能少
- ✅ 保留所有 className
- ✅ 保留所有状态管理逻辑
- ✅ 保留所有动画效果
- ✅ 保留所有事件处理函数
- ❌ **禁止**删除任何代码
- ❌ **禁止**"优化"或"简化"
- ❌ **禁止**用"更简单"的方式替代

---

### 步骤4：只修改数据部分

**允许修改的内容：**
```typescript
// ✅ 允许：修改文本内容
const menuItems = [
  { name: '首页', href: '/home' },  // 改成中文
  { name: '技师', href: '/therapists' },
]

// ✅ 允许：修改颜色值（但要在tailwind.config.ts中定义）
className="text-primary-gold"  // 使用项目主题色

// ✅ 允许：修改链接地址
href="/home"  // 改成项目路由

// ✅ 允许：修改Logo/图片
<Image src="/logo.png" />  // 使用项目Logo
```

**禁止修改的内容：**
```typescript
// ❌ 禁止：删除或修改状态管理
const [isOpen, setIsOpen] = useState(false)  // 必须保留

// ❌ 禁止：删除或修改className
className="in-data-[state=active]:rotate-180"  // 必须保留

// ❌ 禁止：删除或修改动画逻辑
transition-all duration-300  // 必须保留

// ❌ 禁止：用span替代图标组件
<Equal /> 不能改成 <span>  // 必须保留原组件
```

---

### 步骤5：安装所有依赖

```bash
# 安装npm依赖
npm install [package-name]

# 创建依赖组件文件
# 从 registryDependencies 中复制代码
```

**检查清单：**
- [ ] 所有 npmDependencies 已安装
- [ ] 所有 registryDependencies 文件已创建
- [ ] 所有导入语句无报错

---

### 步骤6：检查颜色定义

```typescript
// 检查组件中使用的颜色类
grep -r "text-primary" src/components/[ComponentName].tsx

// 确保在 tailwind.config.ts 中有定义
colors: {
  'primary-gold': '#D4AF37',
  // ...
}
```

**注意事项：**
- 所有自定义颜色必须在配置文件中定义
- 使用项目已有的颜色变量
- 不要使用未定义的颜色类名

---

### 步骤7：测试所有功能

```markdown
必须测试：
- [ ] 组件正常渲染
- [ ] 所有交互效果正常（点击、悬停、滚动等）
- [ ] 响应式布局正常（桌面端、移动端）
- [ ] 动画效果流畅
- [ ] 无控制台报错
- [ ] 无linter错误
```

---

### 步骤8：通过完整检查清单

## ✅ 组件复刻完整检查清单

### 代码完整性
- [ ] 是否完整复制了 componentCode？
- [ ] 是否保留了所有 className？
- [ ] 是否保留了所有状态管理逻辑（useState, useEffect等）？
- [ ] 是否保留了所有动画效果？
- [ ] 是否保留了所有事件处理函数？

### 依赖完整性
- [ ] 是否安装了所有 npmDependencies？
- [ ] 是否创建了所有 registryDependencies 文件？
- [ ] 是否保留了所有导入语句？

### 修改合规性
- [ ] 是否只修改了数据部分（text, links, colors）？
- [ ] 是否没有删除任何原有功能？
- [ ] 是否没有"优化"或"简化"原代码？
- [ ] 是否没有用其他方式"替代"原实现？

### 样式完整性
- [ ] 所有颜色类名是否在 tailwind.config.ts 中定义？
- [ ] 是否保留了所有原有的CSS类？
- [ ] 是否没有修改动画相关的类名？

### 功能测试
- [ ] 组件是否正常渲染？
- [ ] 所有交互效果是否正常工作？
- [ ] 响应式布局是否正常？
- [ ] 是否无控制台报错？
- [ ] 是否无linter错误？

---

## 🚫 常见错误及规避

### 错误1：过度优化
```typescript
// ❌ 错误示例
// 原代码：
<Equal className="..." />
<X className="..." />

// 我的"优化"：
<span className="..." />  // 用span替代图标

// ✅ 正确做法：完整保留原代码
<Equal className="..." />
<X className="..." />
```

### 错误2：删除"不需要"的功能
```typescript
// ❌ 错误示例
// 原代码有4个菜单项，我只需要2个，所以删除了相关逻辑

// ✅ 正确做法：保留所有逻辑，只修改数据
const menuItems = [
  { name: '首页', href: '/home' },
  { name: '技师', href: '/therapists' },
  // 只改这里，不改组件逻辑
]
```

### 错误3：简化状态管理
```typescript
// ❌ 错误示例
// 原代码：
const [menuState, setMenuState] = useState(false)
data-state={menuState && 'active'}

// 我的"简化"：
const [isOpen, setIsOpen] = useState(false)
className={isOpen ? 'active' : ''}  // 丢失了data-state逻辑

// ✅ 正确做法：完整保留原逻辑
const [menuState, setMenuState] = useState(false)
data-state={menuState && 'active'}
```

### 错误4：修改CSS动画类
```typescript
// ❌ 错误示例
// 原代码：
className="in-data-[state=active]:rotate-180"

// 我的"改进"：
className={cn(isOpen && 'rotate-180')}  // 丢失了特殊的CSS选择器

// ✅ 正确做法：完整保留原类名
className="in-data-[state=active]:rotate-180"
```

---

## 💡 心态调整

### 错误心态 ❌
- "我是AI，我能优化这个组件"
- "这个太复杂了，我简化一下"
- "用这个方式更简单"
- "这个功能不需要，删掉"

### 正确心态 ✅
- "21st.dev的组件是专业设计的，我应该尊重并完整使用"
- "复杂性往往是必要的，我应该保留所有细节"
- "简化 = 功能缺失"
- "我的任务是复制，不是创造"

---

## 📝 每次使用前的自我提醒

```
在使用21st.dev组件前，我必须提醒自己：

1. 我是在【搜索】组件，不是在【创建】组件
2. 我应该【完整复制】，不是【参考实现】
3. 我只能【修改数据】，不能【重写逻辑】
4. 【简化】= 【功能缺失】
5. 【优化】= 【破坏完整性】
6. 保持【敬畏之心】，尊重原组件设计

核心原则：1:1完整复刻 + 数据替换，绝不重写或简化！
```

---

## 🔧 故障排查

### 问题：组件不显示
```bash
检查步骤：
1. 是否安装了所有npm依赖？
2. 是否创建了所有子组件文件？
3. 是否有导入错误？
4. 是否有TypeScript类型错误？
```

### 问题：动画不工作
```bash
检查步骤：
1. 是否保留了所有className？
2. 是否保留了data-state等属性？
3. 是否保留了状态管理逻辑？
4. 是否修改了CSS动画类？
```

### 问题：交互不正常
```bash
检查步骤：
1. 是否保留了所有事件处理函数？
2. 是否保留了所有状态变量？
3. 是否修改了组件逻辑？
4. 是否删除了某些功能？
```

---

## 📚 参考资源

- 21st.dev官网：https://21st.dev
- 项目设计方案：`君悦SPA-高级设计方案.md`
- Tailwind配置：`tailwind.config.ts`
- 组件规范：`.cursorrules`

---

**最后提醒：如果你发现自己在"优化"或"简化"组件，立即停止，重新阅读本文档！**

