# 君悦SPA - API接口文档

> **版本**: v1.0  
> **创建日期**: 2025-10-08  
> **基础URL**: `https://api.junyue-spa.com`  
> **技术栈**: Next.js 14 API Routes  
> **认证方式**: JWT Token

---

## 📋 目录

- [接口规范](#接口规范)
- [认证授权](#认证授权)
- [用户端API](#用户端api)
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
Authorization: Bearer <token>

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
Authorization: Bearer <JWT_TOKEN>  // 登录后必需
Content-Type: application/json     // POST/PUT请求必需
```

### Token获取
登录成功后返回JWT Token，有效期7天

### 权限级别
- **Public**: 无需登录
- **User**: 需要用户登录
- **Therapist**: 需要技师登录
- **Admin**: 需要管理员登录

---

## 👤 用户端API (37个接口)

### 1. 认证相关 (5个)

#### 1.1 用户注册
```typescript
POST /api/user/auth/register
权限: Public

Request:
{
  "phone": "13800138000",
  "password": "password123",
  "inviteCode": "ABC12345" // 可选
}

Response:
{
  "success": true,
  "data": {
    "userId": "clx...",
    "token": "eyJhbGc...",
    "inviteCode": "XYZ78901"
  }
}
```

#### 1.2 用户登录
```typescript
POST /api/user/auth/login
权限: Public

Request:
{
  "phone": "13800138000",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "clx...",
      "phone": "138****8000",
      "nickname": "用户昵称",
      "avatar": "https://...",
      "formalPoints": 100,
      "tempPoints": 50
    }
  }
}
```

#### 1.3 发送验证码
```typescript
POST /api/user/auth/send-code
权限: Public

Request:
{
  "phone": "13800138000",
  "type": "login" | "register" | "reset-password"
}

Response:
{
  "success": true,
  "message": "验证码已发送"
}
```

#### 1.4 验证码登录
```typescript
POST /api/user/auth/login-by-code
权限: Public

Request:
{
  "phone": "13800138000",
  "code": "123456"
}

Response: 同1.2
```

#### 1.5 退出登录
```typescript
POST /api/user/auth/logout
权限: User

Response:
{
  "success": true,
  "message": "已退出登录"
}
```

---

### 2. 技师浏览 (8个)

#### 2.1 技师列表(带筛选和分页)
```typescript
GET /api/user/therapists
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
  sortBy?: 'rating' | 'orders' | 'createdAt' // 排序
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
        "rating": 4.8,
        "reviewCount": 120,
        "totalOrders": 350,
        "isOnline": true,
        "isNew": false,
        "isFeatured": true,
        "tags": ["温柔", "专业"]
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

#### 2.2 技师详情
```typescript
GET /api/user/therapists/:id
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
    "rating": 4.8,
    "reviewCount": 120,
    "totalOrders": 350,
    "completedOrders": 340,
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
    "availableSchedules": [
      {
        "date": "2025-10-10",
        "slots": ["09:00", "10:00", "14:00"]
      }
    ],
    "reviews": [
      {
        "id": "clx...",
        "rating": 5,
        "content": "服务很好",
        "createdAt": "2025-10-01T10:00:00Z",
        "userName": "用户***"
      }
    ],
    "contactUnlocked": false // 当前用户是否已解锁联系方式
  }
}
```

#### 2.3 技师搜索
```typescript
GET /api/user/therapists/search
权限: Public

Query:
{
  keyword: string
  limit?: number = 10
}

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "nickname": "小雅",
      "avatar": "https://...",
      "city": "北京"
    }
  ]
}
```

#### 2.4 热门技师
```typescript
GET /api/user/therapists/popular
权限: Public

Query:
{
  limit?: number = 10
}

Response: 同2.1 items格式
```

#### 2.5 推荐技师
```typescript
GET /api/user/therapists/featured
权限: Public

Response: 同2.1 items格式
```

#### 2.6 新技师
```typescript
GET /api/user/therapists/new
权限: Public

Response: 同2.1 items格式
```

#### 2.7 技师可用时间
```typescript
GET /api/user/therapists/:id/schedules
权限: Public

Query:
{
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
}

Response:
{
  "success": true,
  "data": [
    {
      "date": "2025-10-10",
      "slots": [
        {
          "time": "09:00",
          "available": true
        },
        {
          "time": "09:30",
          "available": false
        }
      ]
    }
  ]
}
```

#### 2.8 技师评价列表
```typescript
GET /api/user/therapists/:id/reviews
权限: Public

Query:
{
  page?: number = 1
  pageSize?: number = 10
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "rating": 5,
        "content": "非常满意",
        "userName": "用户***",
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ],
    "pagination": {...},
    "statistics": {
      "avgRating": 4.8,
      "total": 120,
      "rating5": 100,
      "rating4": 15,
      "rating3": 3,
      "rating2": 1,
      "rating1": 1
    }
  }
}
```

---

### 3. 预约下单 (7个)

#### 3.1 服务项目列表
```typescript
GET /api/user/services
权限: Public

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "基础舒缓SPA",
      "description": "基础舒缓SPA，体推，全身推油...",
      "price": 498,
      "duration": 60,
      "features": ["全身按摩", "精油spa"]
    },
    {
      "id": "clx...",
      "name": "进阶焕活SPA",
      "price": 598,
      "duration": 80,
      "features": ["全身按摩", "头疗", "助浴"]
    },
    {
      "id": "clx...",
      "name": "奢华尊享SPA",
      "price": 698,
      "duration": 90,
      "features": ["全身按摩", "头疗", "花式沐浴", "深度放松"]
    }
  ]
}
```

#### 3.2 创建订单(下单)
```typescript
POST /api/user/orders/create
权限: User

Request:
{
  "therapistId": "clx...",
  "serviceId": "clx...",
  "appointmentDate": "2025-10-10",
  "appointmentTime": "14:00",
  "serviceType": "VISIT_CLIENT",
  "address": "北京市朝阳区xxx",
  "addressLat": 39.9042,
  "addressLng": 116.4074,
  "customerName": "张三",
  "customerPhone": "13800138000",
  "formalPointsUsed": 50,  // 使用正式积分
  "tempPointsUsed": 30,    // 使用临时积分
  "remarks": "请提前电话联系",
  "policyAgreed": true     // 同意"只换不退"政策
}

Response:
{
  "success": true,
  "data": {
    "orderId": "clx...",
    "orderNo": "JY20251008001",
    "totalAmount": 498,
    "depositAmount": 249,
    "pointsDiscount": 80,
    "actualPaid": 169,
    "paymentUrl": "https://semipay.com/pay/..." // 支付链接
  }
}
```

#### 3.3 订单详情
```typescript
GET /api/user/orders/:id
权限: User

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "orderNo": "JY20251008001",
    "status": "PENDING_ACCEPT",
    "statusText": "待接单",
    
    // 服务信息
    "service": {
      "id": "clx...",
      "name": "基础舒缓SPA",
      "price": 498,
      "duration": 60
    },
    
    // 技师信息
    "therapist": {
      "id": "clx...",
      "nickname": "小雅",
      "avatar": "https://...",
      "phone": "138****8000", // 接单后显示
      "wechat": "xiaoya123"   // 接单后显示
    },
    
    // 预约信息
    "appointmentDate": "2025-10-10",
    "appointmentTime": "14:00",
    "serviceType": "VISIT_CLIENT",
    "address": "北京市朝阳区xxx",
    
    // 金额信息
    "totalAmount": 498,
    "depositAmount": 249,
    "balanceAmount": 249,
    "formalPointsUsed": 50,
    "tempPointsUsed": 30,
    "pointsDiscount": 80,
    "actualPaid": 169,
    
    // 时间信息
    "createdAt": "2025-10-08T10:00:00Z",
    "paymentTime": "2025-10-08T10:05:00Z",
    "acceptedAt": "2025-10-08T10:10:00Z",
    
    // 拒单信息(如果被拒)
    "rejectReason": null,
    
    // 评价信息
    "reviewed": false,
    
    // 状态日志
    "statusLogs": [
      {
        "fromStatus": null,
        "toStatus": "PENDING_PAYMENT",
        "operator": "系统",
        "createdAt": "2025-10-08T10:00:00Z"
      }
    ]
  }
}
```

#### 3.4 订单列表
```typescript
GET /api/user/orders
权限: User

Query:
{
  page?: number = 1
  pageSize?: number = 10
  status?: OrderStatus  // 状态筛选
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "orderNo": "JY20251008001",
        "status": "ACCEPTED",
        "statusText": "已接单",
        "therapist": {
          "nickname": "小雅",
          "avatar": "https://..."
        },
        "service": {
          "name": "基础舒缓SPA"
        },
        "appointmentDate": "2025-10-10",
        "appointmentTime": "14:00",
        "totalAmount": 498,
        "createdAt": "2025-10-08T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 3.5 取消订单
```typescript
POST /api/user/orders/:id/cancel
权限: User

Request:
{
  "reason": "时间有冲突"
}

Response:
{
  "success": true,
  "message": "订单已取消，定金已退还为正式积分"
}
```

#### 3.6 支付订单
```typescript
POST /api/user/orders/:id/pay
权限: User

Response:
{
  "success": true,
  "data": {
    "paymentUrl": "https://semipay.com/pay/...",
    "qrCode": "data:image/png;base64,..."
  }
}
```

#### 3.7 投诉申诉
```typescript
POST /api/user/orders/:id/complain
权限: User

Request:
{
  "reason": "服务与描述不符",
  "evidence": ["https://...", "https://..."] // 图片URLs
}

Response:
{
  "success": true,
  "message": "投诉已提交，客服将在24小时内处理"
}
```

---

### 4. 评价系统 (3个)

#### 4.1 提交评价
```typescript
POST /api/user/reviews
权限: User

Request:
{
  "orderId": "clx...",
  "rating": 5,
  "content": "服务非常好，下次还会来"
}

Response:
{
  "success": true,
  "message": "评价提交成功，待管理员审核后显示"
}
```

#### 4.2 我的评价列表
```typescript
GET /api/user/reviews
权限: User

Query:
{
  page?: number = 1
  pageSize?: number = 10
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "order": {
          "orderNo": "JY...",
          "therapist": {
            "nickname": "小雅"
          }
        },
        "rating": 5,
        "content": "很好",
        "isApproved": true,
        "createdAt": "2025-10-08T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 4.3 删除评价
```typescript
DELETE /api/user/reviews/:id
权限: User

Response:
{
  "success": true,
  "message": "评价已删除"
}
```

---

### 5. 积分系统 (5个)

#### 5.1 每日签到
```typescript
POST /api/user/points/sign-in
权限: User

Response:
{
  "success": true,
  "data": {
    "pointsEarned": 4,
    "consecutiveDays": 25,
    "monthlyTotal": 82,
    "monthlyLimit": 90,
    "message": "签到成功，获得4积分！"
  }
}
```

#### 5.2 积分记录
```typescript
GET /api/user/points/records
权限: User

Query:
{
  page?: number = 1
  pageSize?: number = 20
  type?: 'FORMAL' | 'TEMP'
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "type": "TEMP",
        "action": "SIGN_IN",
        "amount": 4,
        "balance": 54,
        "description": "每日签到",
        "createdAt": "2025-10-08T08:00:00Z"
      }
    ],
    "pagination": {...},
    "summary": {
      "formalPoints": 100,
      "tempPoints": 54,
      "tempPointsExpireAt": "2025-12-07T00:00:00Z"
    }
  }
}
```

#### 5.3 积分余额
```typescript
GET /api/user/points/balance
权限: User

Response:
{
  "success": true,
  "data": {
    "formalPoints": 100,
    "tempPoints": 54,
    "tempPointsExpireAt": "2025-12-07T00:00:00Z",
    "total": 154
  }
}
```

#### 5.4 签到日历
```typescript
GET /api/user/points/sign-in-calendar
权限: User

Query:
{
  year: number
  month: number
}

Response:
{
  "success": true,
  "data": {
    "signedDates": [
      "2025-10-01",
      "2025-10-02",
      "2025-10-03"
    ],
    "consecutiveDays": 3,
    "monthlyTotal": 8
  }
}
```

#### 5.5 解锁技师联系方式
```typescript
POST /api/user/therapists/:id/unlock-contact
权限: User

Response:
{
  "success": true,
  "data": {
    "phone": "13800138000",
    "wechat": "xiaoya123",
    "qq": "123456789",
    "pointsUsed": 99,
    "remainingPoints": 1
  }
}
```

---

### 6. 反馈功能 (2个)

#### 6.1 提交反馈
```typescript
POST /api/user/feedbacks
权限: User

Request:
{
  "content": "希望增加更多服务项目"
}

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "message": "反馈已提交，我们会尽快处理"
  }
}
```

#### 6.2 我的反馈
```typescript
GET /api/user/feedbacks/me
权限: User

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "content": "希望增加更多服务项目",
      "reply": "感谢您的建议，我们会考虑",
      "status": "REPLIED",
      "createdAt": "2025-10-08T10:00:00Z",
      "repliedAt": "2025-10-08T14:00:00Z"
    }
  ]
}
```

---

### 7. 收藏功能 (3个)

#### 7.1 收藏技师
```typescript
POST /api/user/favorites
权限: User

Request:
{
  "therapistId": "clx..."
}

Response:
{
  "success": true,
  "message": "收藏成功"
}
```

#### 7.2 取消收藏
```typescript
DELETE /api/user/favorites/:therapistId
权限: User

Response:
{
  "success": true,
  "message": "已取消收藏"
}
```

#### 7.3 我的收藏
```typescript
GET /api/user/favorites
权限: User

Query:
{
  page?: number = 1
  pageSize?: number = 20
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "therapist": {
          "id": "clx...",
          "nickname": "小雅",
          "avatar": "https://...",
          "rating": 4.8,
          "isOnline": true
        },
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 7. 个人中心 (4个)

#### 7.1 个人信息
```typescript
GET /api/user/profile
权限: User

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "phone": "138****8000",
    "nickname": "用户昵称",
    "avatar": "https://...",
    "inviteCode": "ABC12345",
    "formalPoints": 100,
    "tempPoints": 50,
    "totalOrders": 10,
    "totalSpent": 4980,
    "totalEarnings": 249,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### 7.2 更新个人信息
```typescript
PUT /api/user/profile
权限: User

Request:
{
  "nickname": "新昵称",
  "avatar": "https://..."
}

Response:
{
  "success": true,
  "message": "更新成功"
}
```

#### 7.3 修改密码
```typescript
POST /api/user/profile/change-password
权限: User

Request:
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456"
}

Response:
{
  "success": true,
  "message": "密码修改成功"
}
```

#### 7.4 推荐收益
```typescript
GET /api/user/earnings
权限: User

Query:
{
  page?: number = 1
  pageSize?: number = 20
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "fromUser": {
          "nickname": "用户***"
        },
        "order": {
          "orderNo": "JY...",
          "totalAmount": 498
        },
        "amount": 49.8,
        "status": "SETTLED",
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ],
    "pagination": {...},
    "summary": {
      "totalEarnings": 249,
      "pendingAmount": 0,
      "settledAmount": 249
    }
  }
}
```

---

## 🤝 代理端API (10个接口)

### 1. 认证相关 (1个)

#### 1.1 代理登录
```typescript
POST /api/agent/auth/login
权限: Public

Request:
{
  "phone": "15000000000",
  "password": "agent123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "agent": {
      "id": "clx...",
      "name": "张三代理",
      "phone": "150****0000",
      "inviteCode": "AGENT001",
      "commissionRate": 10
    }
  }
}
```

---

### 2. 个人资料 (2个)

#### 2.1 获取个人资料
```typescript
GET /api/agent/profile
权限: Agent

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "张三代理",
    "phone": "150****0000",
    "inviteCode": "AGENT001",
    "commissionRate": 10,
    "totalEarnings": 50000,
    "withdrawableBalance": 20000,
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### 2.2 更新个人资料
```typescript
PUT /api/agent/profile
权限: Agent

Request:
{
  "name": "张三代理",
  "password": "newpassword"
}

Response:
{
  "success": true,
  "message": "资料更新成功"
}
```

---

### 3. 收益管理 (3个)

#### 3.1 收益列表
```typescript
GET /api/agent/earnings
权限: Agent

Query:
{
  page?: number
  status?: EarningStatus
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "order": {
          "orderNo": "JY...",
          "totalAmount": 498
        },
        "amount": 49.8,
        "status": "SETTLED",
        "createdAt": "2025-10-01T10:00:00Z",
        "settledAt": "2025-10-02T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 3.2 收益统计
```typescript
GET /api/agent/statistics
权限: Agent

Response:
{
  "success": true,
  "data": {
    "totalEarnings": 50000,
    "pendingEarnings": 5000,
    "settledEarnings": 45000,
    "totalInvitedUsers": 200,
    "totalInvitedTherapists": 50,
    "totalOrders": 1000,
    "thisMonthEarnings": 8000
  }
}
```

#### 3.3 邀请记录
```typescript
GET /api/agent/invitations
权限: Agent

Query:
{
  type?: 'user' | 'therapist'
  page?: number
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "inviteeType": "user",
        "inviteeId": "clx...",
        "inviteeName": "张三",
        "totalOrders": 10,
        "totalEarnings": 498,
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ],
    "total": 250,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 4. 提现管理 (4个)

#### 4.1 申请提现
```typescript
POST /api/agent/withdrawals
权限: Agent

Request:
{
  "amount": 5000,
  "method": "ALIPAY",
  "account": "13900139000",
  "accountName": "张三"
}

Response:
{
  "success": true,
  "data": {
    "withdrawalId": "clx...",
    "message": "提现申请已提交，1-3个工作日到账"
  }
}
```

#### 4.2 提现记录
```typescript
GET /api/agent/withdrawals
权限: Agent

Query:
{
  page?: number
  status?: WithdrawalStatus
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "amount": 5000,
        "fee": 0,
        "actualAmount": 5000,
        "method": "ALIPAY",
        "account": "139****9000",
        "status": "COMPLETED",
        "appliedAt": "2025-10-01T10:00:00Z",
        "completedAt": "2025-10-02T14:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

#### 4.3 提现详情
```typescript
GET /api/agent/withdrawals/:id
权限: Agent

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "amount": 5000,
    "fee": 0,
    "actualAmount": 5000,
    "method": "ALIPAY",
    "account": "13900139000",
    "accountName": "张三",
    "status": "COMPLETED",
    "appliedAt": "2025-10-01T10:00:00Z",
    "approvedAt": "2025-10-01T14:00:00Z",
    "completedAt": "2025-10-02T14:00:00Z",
    "transactionNo": "TX123456789"
  }
}
```

#### 4.4 提现统计
```typescript
GET /api/agent/withdrawals/statistics
权限: Agent

Response:
{
  "success": true,
  "data": {
    "totalWithdrawn": 30000,
    "pendingAmount": 5000,
    "withdrawableBalance": 20000,
    "totalWithdrawals": 15
  }
}
```

---

## 💆 技师端API (30个接口)

### 1. 认证相关 (5个)

#### 1.1 技师注册
```typescript
POST /api/therapist/auth/register
权限: Public

Request:
{
  "phone": "13900139000",
  "password": "password123",
  "inviteCode": "TECH1234" // 必填
}

Response:
{
  "success": true,
  "data": {
    "therapistId": "clx...",
    "message": "注册成功，请完善资料后等待审核"
  }
}
```

#### 1.2 技师登录
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
      "status": "APPROVED",
      "isOnline": false
    }
  }
}
```

#### 1.3-1.5 同用户端

---

### 2. 资料管理 (6个)

#### 2.1 获取个人资料
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
    "introduction": "个人介绍...",
    "specialties": ["泰式按摩"],
    "serviceTypes": ["VISIT_CLIENT"],
    "wechat": "xiaoya123",
    "qq": "123456",
    "photos": [...],
    "videos": [...],
    "inviteCode": "TECH5678",
    "totalOrders": 350,
    "rating": 4.8,
    "reviewCount": 120
  }
}
```

#### 2.2 更新基本信息
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
  "serviceLat": 39.9042,
  "serviceLng": 116.4074,
  "serviceRadius": 5
}

Response:
{
  "success": true,
  "message": "更新成功"
}
```

#### 2.3 上传照片
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
      "url": "https://...",
      "order": 0
    }
  ]
}
```

#### 2.4 删除照片
```typescript
DELETE /api/therapist/profile/photos/:id
权限: Therapist

Response:
{
  "success": true,
  "message": "删除成功"
}
```

#### 2.5 上传视频
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
    "url": "https://...",
    "coverUrl": "https://...",
    "duration": 30
  }
}
```

#### 2.6 提交审核
```typescript
POST /api/therapist/profile/submit-audit
权限: Therapist

Response:
{
  "success": true,
  "message": "资料已提交，等待审核"
}
```

---

### 3. 订单管理 (10个)

#### 3.1 待响应订单列表
```typescript
GET /api/therapist/orders/pending
权限: Therapist

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "orderNo": "JY...",
      "user": {
        "nickname": "用户***"
      },
      "service": {
        "name": "基础舒缓SPA",
        "duration": 60
      },
      "appointmentDate": "2025-10-10",
      "appointmentTime": "14:00",
      "address": "北京市朝阳区xxx",
      "depositAmount": 249,
      "remainingTime": 540, // 剩余响应秒数
      "createdAt": "2025-10-08T10:00:00Z"
    }
  ]
}
```

#### 3.2 接单
```typescript
POST /api/therapist/orders/:id/accept
权限: Therapist

Response:
{
  "success": true,
  "data": {
    "customer": {
      "name": "张三",
      "phone": "13800138000"
    },
    "message": "接单成功，请及时联系客户"
  }
}
```

#### 3.3 拒单
```typescript
POST /api/therapist/orders/:id/reject
权限: Therapist

Request:
{
  "reason": "时间冲突"
}

Response:
{
  "success": true,
  "message": "已拒单，定金已退还用户为积分"
}

// 后端自动执行逻辑：
// 1. 更新订单状态为REJECTED
// 2. 退还积分规则（"只换不退"政策）：
//    - 用户使用的临时积分 → 退还为临时积分（延续60天有效期）
//    - 用户使用的正式积分 → 退还为正式积分
//    - 现金支付部分 → 退还为正式积分（1元=1积分）
// 3. 创建PointRecord记录（type: REFUND）
// 4. 更新用户积分余额
// 5. 语音/短信通知用户
```

#### 3.4 订单详情
```typescript
GET /api/therapist/orders/:id
权限: Therapist

Response: 同用户端订单详情，但包含客户联系方式
```

#### 3.5 订单列表
```typescript
GET /api/therapist/orders
权限: Therapist

Query:
{
  page?: number = 1
  pageSize?: number = 10
  status?: OrderStatus
}

Response:
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {...}
  }
}
```

#### 3.6 开始服务
```typescript
POST /api/therapist/orders/:id/start
权限: Therapist

Response:
{
  "success": true,
  "message": "服务已开始"
}
```

#### 3.7 完成服务
```typescript
POST /api/therapist/orders/:id/complete
权限: Therapist

Response:
{
  "success": true,
  "message": "服务已完成，尾款已到账"
}

// 后端自动执行逻辑：
// 1. 更新订单状态为COMPLETED
// 2. 技师余额增加尾款金额
// 3. 触发分佣计算：
//    - 检查是否有推荐关系
//    - 创建UserEarning记录（用户推荐佣金10%）
//    - 创建TherapistEarning记录（技师推荐分成5%）
//    - 创建AgentEarning记录（代理佣金，如配置）
// 4. 更新相关统计数据
```

#### 3.8 订单统计
```typescript
GET /api/therapist/orders/statistics
权限: Therapist

Query:
{
  startDate?: string
  endDate?: string
}

Response:
{
  "success": true,
  "data": {
    "totalOrders": 350,
    "acceptedOrders": 340,
    "rejectedOrders": 10,
    "completedOrders": 330,
    "acceptRate": 97.1,
    "completeRate": 97.1,
    "totalEarnings": 82750
  }
}
```

#### 3.9 今日订单
```typescript
GET /api/therapist/orders/today
权限: Therapist

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "appointmentTime": "14:00",
      "status": "ACCEPTED",
      "service": {
        "name": "基础舒缓SPA"
      },
      "customer": {
        "name": "张***",
        "phone": "138****8000"
      }
    }
  ]
}
```

#### 3.10 历史订单
```typescript
GET /api/therapist/orders/history
权限: Therapist

Query:
{
  page?: number = 1
  pageSize?: number = 20
}

Response: 同3.5
```

---

### 4. 时间管理 (5个)

#### 4.1 获取时间表
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
      "date": "2025-10-10",
      "startTime": "09:00",
      "endTime": "23:00",
      "isAvailable": true,
      "isRecurring": true
    }
  ]
}
```

#### 4.2 添加时间段
```typescript
POST /api/therapist/schedules
权限: Therapist

Request:
{
  "date": "2025-10-10",
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

#### 4.3 删除时间段
```typescript
DELETE /api/therapist/schedules/:id
权限: Therapist

Response:
{
  "success": true,
  "message": "时间段已删除"
}
```

#### 4.4 批量设置时间
```typescript
POST /api/therapist/schedules/batch
权限: Therapist

Request:
{
  "schedules": [
    {
      "date": "2025-10-10",
      "startTime": "09:00",
      "endTime": "23:00"
    }
  ]
}

Response:
{
  "success": true,
  "message": "批量设置成功"
}
```

#### 4.5 切换在线状态
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
    "isOnline": true
  }
}
```

---

### 5. 收益管理 (4个)

#### 5.1 收益概览
```typescript
GET /api/therapist/earnings/overview
权限: Therapist

Response:
{
  "success": true,
  "data": {
    "totalEarnings": 82750,      // 累计收益
    "withdrawableBalance": 5000,  // 可提现余额
    "pendingAmount": 750,         // 待结算
    "withdrawnAmount": 77000,     // 已提现
    "referralEarnings": 1250      // 推荐收益
  }
}
```

#### 5.2 收益明细
```typescript
GET /api/therapist/earnings/records
权限: Therapist

Query:
{
  page?: number = 1
  pageSize?: number = 20
  type?: 'order' | 'referral'
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "type": "order",
        "order": {
          "orderNo": "JY...",
          "service": "基础舒缓SPA"
        },
        "amount": 249,
        "status": "SETTLED",
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 5.3 申请提现
```typescript
POST /api/therapist/withdrawals
权限: Therapist

Request:
{
  "amount": 1000,
  "method": "ALIPAY",
  "account": "13900139000",
  "accountName": "张三"
}

Response:
{
  "success": true,
  "data": {
    "withdrawalId": "clx...",
    "message": "提现申请已提交，1-3个工作日到账"
  }
}
```

#### 5.4 提现记录
```typescript
GET /api/therapist/withdrawals
权限: Therapist

Query:
{
  page?: number = 1
  pageSize?: number = 10
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "amount": 1000,
        "fee": 0,
        "actualAmount": 1000,
        "method": "ALIPAY",
        "account": "139****9000",
        "status": "COMPLETED",
        "appliedAt": "2025-10-01T10:00:00Z",
        "completedAt": "2025-10-02T14:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

## 🔧 管理端API (61个接口)

### 1. 认证相关 (3个)

#### 1.1 管理员登录
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
      "realName": "管理员",
      "role": "SUPER_ADMIN",
      "permissions": [...]
    }
  }
}
```

#### 1.2 退出登录
```typescript
POST /api/admin/auth/logout
权限: Admin
```

#### 1.3 修改密码
```typescript
POST /api/admin/auth/change-password
权限: Admin
```

---

### 2. 数据看板 (5个)

#### 2.1 核心指标
```typescript
GET /api/admin/dashboard/metrics
权限: Admin

Query:
{
  period?: '1d' | '7d' | '30d' = '7d'
}

Response:
{
  "success": true,
  "data": {
    "users": {
      "total": 10000,
      "new": 150,
      "active": 3500
    },
    "therapists": {
      "total": 500,
      "new": 10,
      "online": 80
    },
    "orders": {
      "total": 5000,
      "completed": 4500,
      "revenue": 2490000
    },
    "gmv": 2490000,
    "conversion": {
      "register": 15.5,
      "order": 35.2,
      "payment": 92.1
    }
  }
}
```

#### 2.2 趋势图表
```typescript
GET /api/admin/dashboard/trends
权限: Admin

Query:
{
  metric: 'users' | 'orders' | 'revenue'
  period: '7d' | '30d' | '90d'
}

Response:
{
  "success": true,
  "data": [
    {
      "date": "2025-10-01",
      "value": 150
    }
  ]
}
```

#### 2.3 地域分布
```typescript
GET /api/admin/dashboard/geo-distribution
权限: Admin

Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "city": "北京",
        "count": 3000
      }
    ],
    "therapists": [...]
  }
}
```

#### 2.4 热门服务排行
```typescript
GET /api/admin/dashboard/popular-services
权限: Admin

Response:
{
  "success": true,
  "data": [
    {
      "serviceId": "clx...",
      "serviceName": "基础舒缓SPA",
      "orderCount": 3000,
      "revenue": 1494000
    }
  ]
}
```

#### 2.5 技师排行榜
```typescript
GET /api/admin/dashboard/top-therapists
权限: Admin

Query:
{
  sortBy: 'orders' | 'revenue' | 'rating'
  limit?: number = 10
}

Response:
{
  "success": true,
  "data": [
    {
      "therapistId": "clx...",
      "nickname": "小雅",
      "avatar": "https://...",
      "totalOrders": 350,
      "totalRevenue": 87150,
      "rating": 4.8
    }
  ]
}
```

---

### 3. 用户管理 (8个)

#### 3.1 用户列表
```typescript
GET /api/admin/users
权限: Admin

Query:
{
  page?: number = 1
  pageSize?: number = 20
  keyword?: string
  status?: UserStatus
  startDate?: string
  endDate?: string
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "phone": "138****8000",
        "nickname": "用户昵称",
        "formalPoints": 100,
        "tempPoints": 50,
        "totalOrders": 10,
        "totalSpent": 4980,
        "status": "ACTIVE",
        "createdAt": "2025-01-01T00:00:00Z",
        "lastLoginAt": "2025-10-08T08:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 3.2 用户详情
```typescript
GET /api/admin/users/:id
权限: Admin

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "phone": "13800138000",
    "nickname": "用户昵称",
    "avatar": "https://...",
    "formalPoints": 100,
    "tempPoints": 50,
    "inviteCode": "ABC123",
    "inviter": {
      "nickname": "推荐人***"
    },
    "totalOrders": 10,
    "totalSpent": 4980,
    "totalEarnings": 249,
    "status": "ACTIVE",
    "createdAt": "2025-01-01T00:00:00Z",
    "recentOrders": [...],
    "pointRecords": [...]
  }
}
```

#### 3.3 发放积分
```typescript
POST /api/admin/users/:id/grant-points
权限: Admin

Request:
{
  "type": "FORMAL",
  "amount": 100,
  "description": "客服补偿"
}

Response:
{
  "success": true,
  "message": "积分已发放"
}
```

#### 3.4 封禁用户
```typescript
POST /api/admin/users/:id/ban
权限: Admin

Request:
{
  "reason": "违规操作"
}

Response:
{
  "success": true,
  "message": "用户已封禁"
}
```

#### 3.5 解封用户
```typescript
POST /api/admin/users/:id/unban
权限: Admin

Response:
{
  "success": true,
  "message": "用户已解封"
}
```

#### 3.6 用户画像
```typescript
GET /api/admin/users/:id/profile
权限: Admin

Response:
{
  "success": true,
  "data": {
    "consumption": {
      "avgOrderValue": 498,
      "preferredService": "基础舒缓SPA",
      "orderFrequency": "高频"
    },
    "behavior": {
      "signInDays": 25,
      "favorites": 3,
      "reviews": 8
    },
    "activity": {
      "lastOrderAt": "2025-10-05T14:00:00Z",
      "lastLoginAt": "2025-10-08T08:00:00Z"
    }
  }
}
```

#### 3.7 批量操作
```typescript
POST /api/admin/users/batch
权限: Admin

Request:
{
  "userIds": ["clx1", "clx2"],
  "action": "GRANT_POINTS" | "BAN" | "SEND_NOTIFICATION",
  "params": {
    "amount": 100,
    "description": "活动奖励"
  }
}

Response:
{
  "success": true,
  "message": "批量操作成功"
}
```

#### 3.8 用户导出
```typescript
GET /api/admin/users/export
权限: Admin

Query:
{
  format: 'csv' | 'excel'
  filters?: {...}
}

Response: File download
```

---

### 4. 技师管理 (10个)

#### 4.1 技师列表
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
        "totalOrders": 350,
        "acceptRate": 97.1,
        "rating": 4.8,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 4.2 待审核技师
```typescript
GET /api/admin/therapists/pending
权限: Admin

Response: 同4.1格式
```

#### 4.3 技师详情
```typescript
GET /api/admin/therapists/:id
权限: Admin

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "nickname": "小雅",
    "phone": "13900139000",
    "age": 25,
    "height": 168,
    "weight": 50,
    "city": "北京",
    "areas": ["朝阳区"],
    "introduction": "...",
    "specialties": [...],
    "photos": [...],
    "videos": [...],
    "status": "APPROVED",
    "totalOrders": 350,
    "acceptedOrders": 340,
    "rejectedOrders": 10,
    "completedOrders": 330,
    "rating": 4.8,
    "reviewCount": 120,
    "totalEarnings": 82750,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### 4.4 审核通过
```typescript
POST /api/admin/therapists/:id/approve
权限: Admin

Response:
{
  "success": true,
  "message": "审核通过"
}
```

#### 4.5 审核拒绝
```typescript
POST /api/admin/therapists/:id/reject
权限: Admin

Request:
{
  "reason": "照片不清晰"
}

Response:
{
  "success": true,
  "message": "审核已拒绝"
}
```

#### 4.6 封禁技师
```typescript
POST /api/admin/therapists/:id/ban
权限: Admin

Request:
{
  "reason": "多次违规"
}

Response:
{
  "success": true,
  "message": "技师已封禁"
}
```

#### 4.7 设为推荐
```typescript
POST /api/admin/therapists/:id/feature
权限: Admin

Request:
{
  "isFeatured": true
}

Response:
{
  "success": true,
  "message": "已设为推荐技师"
}
```

#### 4.8 技师绩效
```typescript
GET /api/admin/therapists/:id/performance
权限: Admin

Query:
{
  startDate?: string
  endDate?: string
}

Response:
{
  "success": true,
  "data": {
    "orderStats": {
      "total": 350,
      "accepted": 340,
      "rejected": 10,
      "completed": 330,
      "acceptRate": 97.1,
      "completeRate": 97.1
    },
    "earnings": {
      "total": 82750,
      "average": 250
    },
    "rating": {
      "average": 4.8,
      "count": 120,
      "distribution": {
        "5": 100,
        "4": 15,
        "3": 3,
        "2": 1,
        "1": 1
      }
    }
  }
}
```

#### 4.9 技师订单历史
```typescript
GET /api/admin/therapists/:id/orders
权限: Admin

Query:
{
  page?: number
  pageSize?: number
  status?: OrderStatus
}

Response: 同订单列表格式
```

#### 4.10 技师导出
```typescript
GET /api/admin/therapists/export
权限: Admin

Response: File download
```

---

### 5. 订单管理 (8个)

#### 5.1 订单列表
```typescript
GET /api/admin/orders
权限: Admin

Query:
{
  page?: number
  pageSize?: number
  keyword?: string  // 订单号/用户/技师搜索
  status?: OrderStatus
  startDate?: string
  endDate?: string
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "orderNo": "JY...",
        "user": {
          "nickname": "用户***"
        },
        "therapist": {
          "nickname": "小雅"
        },
        "service": {
          "name": "基础舒缓SPA"
        },
        "totalAmount": 498,
        "status": "COMPLETED",
        "createdAt": "2025-10-01T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 5.2 订单详情
```typescript
GET /api/admin/orders/:id
权限: Admin

Response: 完整订单信息(包含所有字段)
```

#### 5.3 异常订单
```typescript
GET /api/admin/orders/abnormal
权限: Admin

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "orderNo": "JY...",
      "issue": "超时未接单",
      "createdAt": "2025-10-08T10:00:00Z"
    }
  ]
}
```

#### 5.4 手动退款
```typescript
POST /api/admin/orders/:id/refund
权限: Admin

Request:
{
  "reason": "特殊情况退款",
  "refundType": "POINTS" | "CASH"
}

Response:
{
  "success": true,
  "message": "退款成功"
}
```

#### 5.5 订单统计
```typescript
GET /api/admin/orders/statistics
权限: Admin

Query:
{
  startDate?: string
  endDate?: string
  groupBy?: 'date' | 'service' | 'therapist'
}

Response:
{
  "success": true,
  "data": {
    "total": 5000,
    "completed": 4500,
    "revenue": 2490000,
    "avgOrderValue": 498,
    "completionRate": 90
  }
}
```

#### 5.6 高峰时段分析
```typescript
GET /api/admin/orders/peak-hours
权限: Admin

Response:
{
  "success": true,
  "data": [
    {
      "hour": 14,
      "orderCount": 350
    }
  ]
}
```

#### 5.7 投诉订单列表
```typescript
GET /api/admin/complaints
权限: Admin

Query:
{
  page?: number
  status?: ComplaintStatus
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "order": {
          "orderNo": "JY..."
        },
        "complainant": "用户***",
        "reason": "服务不满意",
        "status": "PENDING",
        "createdAt": "2025-10-08T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 5.8 处理投诉
```typescript
POST /api/admin/complaints/:id/resolve
权限: Admin

Request:
{
  "result": "经核实，给予用户补偿50积分",
  "actions": ["GRANT_POINTS"]
}

Response:
{
  "success": true,
  "message": "投诉已处理"
}
```

---

### 6. 财务管理 (6个)

#### 6.1 提现列表
```typescript
GET /api/admin/withdrawals
权限: Admin

Query:
{
  page?: number
  status?: WithdrawStatus
  type?: 'therapist' | 'agent'
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "therapist": {
          "nickname": "小雅"
        },
        "amount": 1000,
        "method": "ALIPAY",
        "account": "139****9000",
        "accountName": "张三",
        "status": "PENDING",
        "appliedAt": "2025-10-08T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 6.2 审核提现
```typescript
POST /api/admin/withdrawals/:id/approve
权限: Admin

Response:
{
  "success": true,
  "message": "审核通过，请及时转账"
}
```

#### 6.3 拒绝提现
```typescript
POST /api/admin/withdrawals/:id/reject
权限: Admin

Request:
{
  "reason": "账户信息有误"
}

Response:
{
  "success": true,
  "message": "已拒绝提现申请"
}
```

#### 6.4 确认转账
```typescript
POST /api/admin/withdrawals/:id/complete
权限: Admin

Request:
{
  "transactionNo": "TX123456789"
}

Response:
{
  "success": true,
  "message": "转账已确认"
}
```

#### 6.5 批量导出提现
```typescript
GET /api/admin/withdrawals/export
权限: Admin

Query:
{
  status?: WithdrawStatus
  startDate?: string
  endDate?: string
}

Response: CSV file download
```

#### 6.6 财务报表
```typescript
GET /api/admin/finance/report
权限: Admin

Query:
{
  startDate: string
  endDate: string
}

Response:
{
  "success": true,
  "data": {
    "revenue": {
      "deposit": 1245000,      // 定金收入
      "unlock": 9900,          // 解锁收入
      "total": 1254900         // 总收入
    },
    "expenses": {
      "userReferral": 124500,  // 用户推荐支出
      "therapistReferral": 62250, // 技师推荐支出
      "agentCommission": 62250,   // 代理佣金支出
      "withdrawal": 500000,       // 提现支出
      "total": 749000            // 总支出
    },
    "profit": 505900           // 净利润
  }
}
```

---

### 7. 系统管理 (13个)

#### 7.1 公告列表
```typescript
GET /api/admin/announcements
权限: Admin

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "title": "平台升级通知",
      "content": "...",
      "target": ["user", "therapist"],
      "isActive": true,
      "publishedAt": "2025-10-01T10:00:00Z"
    }
  ]
}
```

#### 7.2 发布公告
```typescript
POST /api/admin/announcements
权限: Admin

Request:
{
  "title": "平台升级通知",
  "content": "...",
  "target": ["user", "therapist", "all"],
  "isActive": true
}

Response:
{
  "success": true,
  "message": "公告已发布"
}
```

#### 7.3 留言列表
```typescript
GET /api/admin/feedbacks
权限: Admin

Query:
{
  page?: number
  status?: FeedbackStatus
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "user": {
          "nickname": "用户***"
        },
        "content": "建议增加xxx功能",
        "status": "PENDING",
        "createdAt": "2025-10-08T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

#### 7.4 回复留言
```typescript
POST /api/admin/feedbacks/:id/reply
权限: Admin

Request:
{
  "reply": "感谢您的建议，我们会考虑"
}

Response:
{
  "success": true,
  "message": "回复成功"
}
```

#### 7.5 评价审核列表
```typescript
GET /api/admin/reviews/pending
权限: Admin

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "order": {
        "orderNo": "JY..."
      },
      "therapist": {
        "nickname": "小雅"
      },
      "user": {
        "nickname": "用户***"
      },
      "rating": 5,
      "content": "很好",
      "createdAt": "2025-10-08T10:00:00Z"
    }
  ]
}
```

#### 7.6 审核评价
```typescript
POST /api/admin/reviews/:id/审核
权限: Admin

Request:
{
  "isApproved": true,
  "isVisible": true
}

Response:
{
  "success": true,
  "message": "评价已审核"
}
```

#### 7.7 代理商列表
```typescript
GET /api/admin/agents
权限: Admin

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "代理A",
      "phone": "150****0000",
      "inviteCode": "AGENT001",
      "commissionRate": 10,
      "totalEarnings": 5000,
      "status": "ACTIVE"
    }
  ]
}
```

#### 7.8 添加代理商
```typescript
POST /api/admin/agents
权限: Admin

Request:
{
  "name": "代理A",
  "phone": "15000000000",
  "password": "agent123",
  "commissionRate": 10
}

Response:
{
  "success": true,
  "data": {
    "agentId": "clx...",
    "inviteCode": "AGENT001"
  }
}
```

#### 7.9 系统配置
```typescript
GET /api/admin/configs
权限: Admin

Response:
{
  "success": true,
  "data": [
    {
      "key": "referral_config",
      "value": {
        "userReferralRate": 10,
        "therapistReferralRate": 5
      },
      "description": "分佣配置"
    }
  ]
}
```

#### 7.10 更新配置
```typescript
PUT /api/admin/configs/:key
权限: Admin

Request:
{
  "value": {
    "userReferralRate": 12
  }
}

Response:
{
  "success": true,
  "message": "配置已更新"
}
```

#### 7.11 管理员列表
```typescript
GET /api/admin/admins
权限: SUPER_ADMIN

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "username": "admin",
      "realName": "管理员",
      "role": "ADMIN",
      "status": true,
      "lastLoginAt": "2025-10-08T08:00:00Z"
    }
  ]
}
```

#### 7.12 添加管理员
```typescript
POST /api/admin/admins
权限: SUPER_ADMIN

Request:
{
  "username": "operator1",
  "password": "pass123",
  "realName": "运营1",
  "role": "OPERATOR",
  "permissions": ["view_users", "view_orders"]
}

Response:
{
  "success": true,
  "message": "管理员已添加"
}
```

#### 7.13 操作日志
```typescript
GET /api/admin/logs
权限: SUPER_ADMIN

Query:
{
  page?: number
  adminId?: string
  action?: string
  startDate?: string
  endDate?: string
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "admin": {
          "username": "admin"
        },
        "action": "APPROVE_THERAPIST",
        "target": "技师小雅",
        "ip": "192.168.1.1",
        "createdAt": "2025-10-08T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

## 🔄 通用API (5个)

### 1. 文件上传
```typescript
POST /api/upload
权限: User/Therapist

Request (multipart/form-data):
{
  file: File
  type: 'avatar' | 'photo' | 'video' | 'evidence'
}

说明:
- 图片自动压缩转WebP格式（最大1200px）
- 视频最大100MB，图片最大5MB
- 文件存储在服务器本地 /uploads/ 目录
- 通过Nginx静态托管，华纳云CN2线路加速

Response:
{
  "success": true,
  "data": {
    "url": "/uploads/photos/abc123.webp",
    "filename": "abc123.webp",
    "size": 45678,
    "originalSize": 204800,  // 原始大小
    "savings": "77.7%"        // 压缩率（仅图片）
  }
}
```

### 2. 城市列表
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
      "province": "北京",
      "areas": [
        {
          "id": "clx...",
          "name": "朝阳区"
        }
      ]
    }
  ]
}
```

### 3. 服务项目
```typescript
GET /api/services
权限: Public

Response: 同用户端3.1
```

### 4. 通知列表
```typescript
GET /api/notifications
权限: User/Therapist

Query:
{
  page?: number
  isRead?: boolean
}

Response:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clx...",
        "type": "ORDER",
        "title": "订单已接单",
        "content": "技师小雅已接单",
        "relatedId": "order_id",
        "isRead": false,
        "createdAt": "2025-10-08T10:00:00Z"
      }
    ],
    "pagination": {...},
    "unreadCount": 5
  }
}
```

### 5. 标记已读
```typescript
POST /api/notifications/:id/read
权限: User/Therapist

Response:
{
  "success": true,
  "message": "已标记为已读"
}
```

---

### 8. 服务项目管理 (5个)

#### 8.1 服务项目列表
```typescript
GET /api/admin/services
权限: Admin

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "基础舒缓SPA",
      "description": "基础舒缓SPA，体推，全身推油...",
      "price": 498,
      "duration": 60,
      "depositRate": 50,
      "features": ["全身按摩", "精油spa"],
      "isActive": true,
      "order": 1,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### 8.2 添加服务项目
```typescript
POST /api/admin/services
权限: Admin

Request:
{
  "name": "基础舒缓SPA",
  "description": "基础舒缓SPA，体推，全身推油...",
  "price": 498,
  "duration": 60,
  "depositRate": 50,
  "features": ["全身按摩", "精油spa"]
}

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "message": "服务项目创建成功"
  }
}
```

#### 8.3 更新服务项目
```typescript
PUT /api/admin/services/:id
权限: Admin

Request:
{
  "name": "基础舒缓SPA",
  "price": 498,
  "isActive": true
}

Response:
{
  "success": true,
  "message": "服务项目更新成功"
}
```

#### 8.4 删除服务项目
```typescript
DELETE /api/admin/services/:id
权限: Admin

Response:
{
  "success": true,
  "message": "服务项目已删除"
}
```

#### 8.5 排序调整
```typescript
PUT /api/admin/services/:id/sort
权限: Admin

Request:
{
  "order": 2
}

Response:
{
  "success": true,
  "message": "排序已更新"
}
```

---

### 9. 城市/区域管理 (6个)

#### 9.1 城市列表
```typescript
GET /api/admin/cities
权限: Admin

Response:
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "北京",
      "province": "北京",
      "isActive": true,
      "areas": [
        {
          "id": "clx...",
          "name": "朝阳区"
        }
      ]
    }
  ]
}
```

#### 9.2 添加城市
```typescript
POST /api/admin/cities
权限: Admin

Request:
{
  "name": "上海",
  "province": "上海"
}

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "message": "城市添加成功"
  }
}
```

#### 9.3 更新城市
```typescript
PUT /api/admin/cities/:id
权限: Admin

Request:
{
  "name": "上海",
  "isActive": true
}

Response:
{
  "success": true,
  "message": "城市更新成功"
}
```

#### 9.4 删除城市
```typescript
DELETE /api/admin/cities/:id
权限: Admin

Response:
{
  "success": true,
  "message": "城市已删除"
}
```

#### 9.5 添加区域
```typescript
POST /api/admin/cities/:id/areas
权限: Admin

Request:
{
  "name": "朝阳区"
}

Response:
{
  "success": true,
  "data": {
    "id": "clx...",
    "message": "区域添加成功"
  }
}
```

#### 9.6 删除区域
```typescript
DELETE /api/admin/areas/:id
权限: Admin

Response:
{
  "success": true,
  "message": "区域已删除"
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
- `409` - 冲突(如重复注册)
- `429` - 请求过于频繁
- `500` - 服务器错误

### 业务错误码
```typescript
{
  // 认证相关 (1xxx)
  "AUTH_001": "用户不存在",
  "AUTH_002": "密码错误",
  "AUTH_003": "验证码错误",
  "AUTH_004": "Token无效",
  "AUTH_005": "Token已过期",
  
  // 用户相关 (2xxx)
  "USER_001": "手机号已注册",
  "USER_002": "积分不足",
  "USER_003": "账号已被封禁",
  
  // 技师相关 (3xxx)
  "THERAPIST_001": "技师不存在",
  "THERAPIST_002": "技师未通过审核",
  "THERAPIST_003": "照片数量不足",
  
  // 订单相关 (4xxx)
  "ORDER_001": "订单不存在",
  "ORDER_002": "订单状态不允许此操作",
  "ORDER_003": "技师时间冲突",
  "ORDER_004": "超出响应时限",
  
  // 支付相关 (5xxx)
  "PAYMENT_001": "支付失败",
  "PAYMENT_002": "积分抵扣超出限额",
  
  // 提现相关 (6xxx)
  "WITHDRAW_001": "提现金额低于最低限额",
  "WITHDRAW_002": "余额不足",
  "WITHDRAW_003": "提现频次超限"
}
```

---

## 📝 版本历史

| 版本 | 日期 | 变更说明 |
|-----|------|---------|
| v1.0 | 2025-10-08 | 初始版本，完整API接口设计 |

---

**总计接口数**:
- 用户端: 37个 (+2 反馈功能)
- 技师端: 30个
- 代理端: 10个 (新增)
- 管理端: 61个 (+11 服务项目、城市管理)
- 通用: 5个
- **合计: 143个接口**

---

**文档结束**

