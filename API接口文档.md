# 君悦SPA - API接口文档 v2.0

> **版本**: v2.0  
> **创建日期**: 2025-10-11  
> **业务模式**: 技师展示平台 + 客服中介预约  
> **基础URL**: `https://api.junyue-spa.com`  
> **技术栈**: Next.js 14 API Routes  
> **认证方式**: JWT Token（仅技师端和管理端）

---

## 📋 目录

- [接口规范](#接口规范)
- [认证授权](#认证授权)
- [公开API](#公开api)
- [技师端API](#技师端api)
- [管理端API](#管理端api)
- [通用API](#通用api)
- [错误码说明](#错误码说明)

---

## 📐 接口规范

### 请求格式

```typescript
// GET请求
GET /api/endpoint?param1=value1&param2=value2

// POST/PUT/DELETE请求
POST /api/endpoint
Content-Type: application/json
Authorization: Bearer <token>  // 仅技师端和管理端需要

{
  "param1": "value1",
  "param2": "value2"
}
```

### 响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "message": "操作成功"
}
```

#### 失败响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
```

#### 分页响应
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

---

## 🔐 认证授权

### Headers说明

```typescript
Authorization: Bearer <JWT_TOKEN>  // 技师端和管理端登录后必需
Content-Type: application/json     // POST/PUT请求必需
```

### Token获取
- 技师登录后返回JWT Token，有效期30天
- 管理员登录后返回JWT Token，有效期30天

### 权限级别
- **Public**: 无需登录（用户端）
- **Therapist**: 需要技师登录
- **Admin**: 需要管理员登录

---

## 🌐 公开API (4个接口)

### 1.1 技师列表（带筛选和分页）
```typescript
GET /api/therapists
权限: Public

Query Parameters:
{
  page?: number = 1
  pageSize?: number = 20
  city?: string           // 城市筛选
  area?: string           // 区域筛选
  minHeight?: number      // 最低身高
  maxHeight?: number      // 最高身高
  minAge?: number         // 最低年龄
  maxAge?: number         // 最高年龄
  isOnline?: boolean      // 仅在线
  isNew?: boolean         // 仅新技师
  isFeatured?: boolean    // 仅推荐技师
  sortBy?: 'createdAt' | 'nickname' // 排序
  order?: 'asc' | 'desc'  // 排序方向
  keyword?: string        // 关键词搜索
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "nickname": "小雅",
        "age": 25,
        "height": 168,
        "weight": 50,
        "city": "北京",
        "areas": ["朝阳区", "海淀区"],
        "avatar": "https://...",
        "isOnline": true,
        "isNew": false,
        "isFeatured": true,
        "specialties": ["泰式按摩", "精油spa"]
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 1.2 技师详情
```typescript
GET /api/therapists/:id
权限: Public

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "nickname": "小雅",
    "age": 25,
    "height": 168,
    "weight": 50,
    "city": "北京",
    "areas": ["朝阳区"],
    "introduction": "我是小雅，从事spa行业5年...",
    "specialties": ["泰式按摩", "精油spa"],
    "serviceTypes": ["VISIT_CLIENT", "CLIENT_VISIT"],
    "serviceAddress": "北京市朝阳区xxx",
    "isOnline": true,
    "photos": [
      {
        "id": "clx...",
        "url": "https://...",
        "order": 0
      }
    ],
    "videos": [
      {
        "id": "clx...",
        "url": "https://...",
        "coverUrl": "https://...",
        "duration": 30
      }
    ],
    "schedules": [
      {
        "date": "2025-10-15",
        "startTime": "09:00",
        "endTime": "23:00",
        "isAvailable": true
      }
    ]
    // ❌ 不返回联系方式（wechat, qq, phone）
  }
}
```

### 1.3 城市列表
```typescript
GET /api/cities
权限: Public

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "北京",
      "code": "beijing",
      "areas": [
        {
          "id": "clx...",
          "name": "朝阳区",
          "code": "chaoyang"
        }
      ]
    }
  ]
}
```

### 1.4 客服信息
```typescript
GET /api/customer-services
权限: Public

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "wechatQrCode": "https://.../qrcode.png",
      "wechatId": "junyue_service",
      "phone": "400-xxx-xxxx",
      "workingHours": "9:00-22:00",
      "order": 0
    }
  ]
}
```

---

## 💆 技师端API (12个接口)

### 2. 认证相关 (2个)

#### 2.1 技师注册
```typescript
POST /api/therapist/auth/register
权限: Public

Request:
{
  "phone": "13900139000",
  "password": "password123",
  "nickname": "小雅",
  "age": 25,
  "height": 168,
  "weight": 50,
  "city": "北京",
  "inviteCode": "TECH1234" // 可选
}

Response:
{
  "success": true,
  "data": {
    "therapistId": "clx...",
    "inviteCode": "TECH5678",
    "message": "注册成功，请完善资料后等待审核"
  }
}
```

#### 2.2 技师登录
```typescript
POST /api/therapist/auth/login
权限: Public

Request:
{
  "phone": "13900139000",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "therapist": {
      "id": "clx...",
      "nickname": "小雅",
      "phone": "139****9000",
      "status": "APPROVED",
      "isOnline": false
    }
  }
}
```

---

### 3. 资料管理 (6个)

#### 3.1 获取个人资料
```typescript
GET /api/therapist/profile
权限: Therapist

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "phone": "139****9000",
    "nickname": "小雅",
    "age": 25,
    "height": 168,
    "weight": 50,
    "city": "北京",
    "areas": ["朝阳区"],
    "status": "APPROVED",
    "auditReason": null,
    "introduction": "个人介绍...",
    "specialties": ["泰式按摩"],
    "serviceTypes": ["VISIT_CLIENT"],
    "serviceAddress": "北京市朝阳区xxx",
    "wechat": "xiaoya123",
    "qq": "123456",
    "photos": [...],
    "videos": [...],
    "inviteCode": "TECH5678",
    "isOnline": false,
    "createdAt": "2025-10-01T10:00:00Z"
  }
}
```

#### 3.2 更新基本信息
```typescript
PUT /api/therapist/profile/basic
权限: Therapist

Request:
{
  "nickname": "小雅",
  "age": 25,
  "height": 168,
  "weight": 50,
  "city": "北京",
  "areas": ["朝阳区", "海淀区"],
  "introduction": "我是小雅...",
  "specialties": ["泰式按摩", "精油spa"],
  "serviceTypes": ["VISIT_CLIENT", "CLIENT_VISIT"],
  "serviceAddress": "北京市朝阳区xxx",
  "wechat": "xiaoya123",
  "qq": "123456"
}

Response:
{
  "success": true,
  "message": "更新成功"
}
```

#### 3.3 上传照片
```typescript
POST /api/therapist/profile/photos
权限: Therapist

Request (multipart/form-data):
{
  files: File[]  // 最多10张
}

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "url": "/uploads/therapist-photos/abc123.webp",
      "order": 0
    }
  ]
}
```

#### 3.4 删除照片
```typescript
DELETE /api/therapist/profile/photos/:id
权限: Therapist

Response:
{
  "success": true,
  "message": "删除成功"
}
```

#### 3.5 上传视频
```typescript
POST /api/therapist/profile/videos
权限: Therapist

Request (multipart/form-data):
{
  file: File  // 最大100MB
}

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "url": "/uploads/therapist-videos/video123.mp4",
    "coverUrl": "/uploads/therapist-videos/cover123.webp",
    "duration": 30
  }
}
```

#### 3.6 提交审核
```typescript
POST /api/therapist/profile/submit-audit
权限: Therapist

Response:
{
  "success": true,
  "message": "资料已提交，等待管理员审核（48小时内）"
}
```

---

### 4. 状态和时间管理 (3个)

#### 4.1 切换在线状态
```typescript
POST /api/therapist/status/toggle
权限: Therapist

Request:
{
  "isOnline": true
}

Response:
{
  "success": true,
  "data": {
    "isOnline": true,
    "lastOnlineAt": "2025-10-11T10:00:00Z"
  }
}
```

#### 4.2 获取时间表
```typescript
GET /api/therapist/schedules
权限: Therapist

Query:
{
  startDate: string // YYYY-MM-DD
  endDate: string
}

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "date": "2025-10-15",
      "startTime": "09:00",
      "endTime": "23:00",
      "isAvailable": true,
      "isRecurring": true
    }
  ]
}
```

#### 4.3 添加时间段
```typescript
POST /api/therapist/schedules
权限: Therapist

Request:
{
  "date": "2025-10-15",
  "startTime": "09:00",
  "endTime": "23:00",
  "isRecurring": true // 是否每天重复
}

Response:
{
  "success": true,
  "message": "时间段已添加"
}
```

---

### 5. 通知 (1个)

#### 5.1 通知列表
```typescript
GET /api/therapist/notifications
权限: Therapist

Query:
{
  page?: number = 1
  isRead?: boolean
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "type": "AUDIT",
        "title": "审核通过",
        "content": "您的资料已通过审核",
        "isRead": false,
        "createdAt": "2025-10-11T10:00:00Z"
      }
    ],
    "pagination": {...},
    "unreadCount": 5
  }
}
```

---

## 🔧 管理端API (9个接口)

### 6. 认证相关 (1个)

#### 6.1 管理员登录
```typescript
POST /api/admin/auth/login
权限: Public

Request:
{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "admin": {
      "id": "clx...",
      "username": "admin",
      "name": "管理员",
      "role": "SUPER_ADMIN"
    }
  }
}
```

---

### 7. 数据看板 (2个)

#### 7.1 核心指标
```typescript
GET /api/admin/dashboard/metrics
权限: Admin

Response:
{
  "success": true,
  "data": {
    "therapists": {
      "total": 150,
      "new": 5,
      "online": 45,
      "pending": 8
    },
    "cities": {
      "total": 10,
      "active": 10
    },
    "todayRegistrations": 5
  }
}
```

#### 7.2 趋势数据
```typescript
GET /api/admin/dashboard/trends
权限: Admin

Query:
{
  metric: 'therapists' // 目前只有技师增长
  period: '7d' | '30d' | '90d'
}

Response:
{
  "success": true,
  "data": [
    {
      "date": "2025-10-01",
      "value": 3
    }
  ]
}
```

---

### 8. 技师管理 (4个)

#### 8.1 技师列表
```typescript
GET /api/admin/therapists
权限: Admin

Query:
{
  page?: number
  pageSize?: number
  keyword?: string
  status?: TherapistStatus
  city?: string
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "nickname": "小雅",
        "phone": "139****9000",
        "age": 25,
        "city": "北京",
        "status": "APPROVED",
        "isOnline": true,
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 8.2 技师详情（包含联系方式）
```typescript
GET /api/admin/therapists/:id
权限: Admin

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "nickname": "小雅",
    "phone": "13900139000",  // ✅ 管理端可见
    "age": 25,
    "height": 168,
    "weight": 50,
    "city": "北京",
    "areas": ["朝阳区"],
    "introduction": "...",
    "specialties": [...],
    "serviceTypes": [...],
    "photos": [...],
    "videos": [...],
    "wechat": "xiaoya123",   // ✅ 管理端可见
    "qq": "123456",          // ✅ 管理端可见
    "status": "APPROVED",
    "auditReason": null,
    "isOnline": true,
    "createdAt": "2025-10-01T10:00:00Z"
  }
}
```

#### 8.3 审核通过
```typescript
POST /api/admin/therapists/:id/approve
权限: Admin

Response:
{
  "success": true,
  "message": "审核通过，已通知技师"
}
```

#### 8.4 审核拒绝
```typescript
POST /api/admin/therapists/:id/reject
权限: Admin

Request:
{
  "reason": "照片不清晰，请重新上传"
}

Response:
{
  "success": true,
  "message": "审核已拒绝，已通知技师"
}
```

---

### 9. 系统管理 (2个)

#### 9.1 客服配置列表
```typescript
GET /api/admin/customer-services
权限: Admin

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "wechatQrCode": "/uploads/qrcode.png",
      "wechatId": "junyue_service",
      "phone": "400-xxx-xxxx",
      "workingHours": "9:00-22:00",
      "isActive": true,
      "order": 0
    }
  ]
}
```

#### 9.2 更新客服配置
```typescript
PUT /api/admin/customer-services/:id
权限: Admin

Request:
{
  "wechatQrCode": "/uploads/qrcode.png",
  "wechatId": "junyue_service",
  "phone": "400-xxx-xxxx",
  "workingHours": "9:00-22:00",
  "isActive": true
}

Response:
{
  "success": true,
  "message": "客服配置已更新"
}
```

---

## 🔄 通用API (1个)

### 10.1 文件上传
```typescript
POST /api/upload
权限: Therapist/Admin

Request (multipart/form-data):
{
  file: File
  type: 'therapist-photos' | 'therapist-videos' | 'qrcode'
}

说明:
- 图片自动压缩转WebP格式（最大1200px）
- 视频最大100MB，图片最大5MB
- 文件存储在服务器本地 /uploads/ 目录
- 通过Nginx静态托管

Response:
{
  "success": true,
  "data": {
    "url": "/uploads/therapist-photos/abc123.webp",
    "filename": "abc123.webp",
    "size": 45678,
    "originalSize": 204800,
    "savings": "77.7%"
  }
}
```

---

## ⚠️ 错误码说明

### HTTP状态码
- `200` - 成功
- `400` - 请求参数错误
- `401` - 未认证
- `403` - 无权限
- `404` - 资源不存在
- `409` - 冲突（如重复注册）
- `429` - 请求过于频繁
- `500` - 服务器错误

### 业务错误码
```typescript
{
  // 认证相关 (1xxx)
  "AUTH_001": "用户不存在",
  "AUTH_002": "密码错误",
  "AUTH_003": "Token无效",
  "AUTH_004": "Token已过期",
  
  // 技师相关 (2xxx)
  "THERAPIST_001": "技师不存在",
  "THERAPIST_002": "技师未通过审核",
  "THERAPIST_003": "照片数量不足（至少3张）",
  "THERAPIST_004": "手机号已注册",
  
  // 文件相关 (3xxx)
  "FILE_001": "文件类型不支持",
  "FILE_002": "文件大小超出限制",
  "FILE_003": "文件上传失败"
}
```

---

## 📝 版本历史

| 版本 | 日期 | 变更说明 |
|-----|------|---------|
| v1.0 | 2025-10-08 | 初始版本，完整预约平台设计 |
| v2.0 | 2025-10-11 | 简化版本，删除用户/订单/支付/积分/评价/代理端API |

---

## 📊 接口统计

**v2.0 接口总数**: 26个
- **公开API**: 4个（用户端浏览）
- **技师端API**: 12个（注册、资料管理、状态管理）
- **管理端API**: 9个（审核、管理、配置）
- **通用API**: 1个（文件上传）

**与v1.0对比**:
- 接口数量：146个 → 26个（减少82%）
- 删除模块：用户注册、订单系统、支付系统、积分系统、评价系统、代理端
- 核心变化：用户端无需登录，技师联系方式仅管理端可见

---

**文档版本**: v2.0  
**最后更新**: 2025-10-11  
**文档状态**: 已完成简化调整
