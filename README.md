# 算力支撑管理系统

基于 **Vue 3 + TypeScript + Element Plus + Vite** 构建的集群算力资源管理与作业调度支撑平台，为 AI 训练和高性能计算场景提供统一的资源监控、作业调度、用户管理和告警服务。

## 功能模块

### 仪表盘 (Dashboard)
- 集群资源总览：CPU / GPU / 内存 / 存储利用率及趋势
- 作业状态统计：运行中、排队中、已完成、失败数量
- 近 30 天作业提交/完成/失败趋势图
- 实时告警滚动列表，支持确认处理

### 资源管理 (Resources)
- **物理节点**：节点列表、CPU 型号、GPU 类型、健康评分、运行时长
- **GPU 资源池**：GPU 分配/可用数、利用率、温度、功耗
- **CPU/内存资源**：各节点 CPU/内存分配与使用率、运行作业数
- **存储资源**：NFS / Lustre / Ceph 存储卷、IOPS、吞吐量、健康状态
- **网络资源**：InfiniBand / Ethernet 带宽、延迟、丢包率

### 作业调度 (Jobs)
- **作业提交**：选择分区（GPU/CPU/高内存/调试）、配置节点/CPU/GPU/内存/运行时长
- **运行中作业**：实时查看作业状态、已运行时间、剩余时间
- **排队作业**：查看排队原因和预计等待时间
- **历史作业**：按状态/用户筛选已完成、失败、取消的作业
- **队列统计**：各分区队列容量和使用情况

### 用户管理 (Users)
- 用户列表：CRUD 操作，部门、角色（admin/user/viewer）、状态管理
- 配额管理：作业数、CPU、GPU、存储、运行时长上限
- 优先级策略：FairShare / FIFO / Priority / Custom 策略配置

### 监控告警 (Monitor)
- **实时监控**：节点 CPU/内存/GPU 使用率时序图
- **告警规则**：配置指标阈值（CPU > 90%、GPU 温度 > 85°C、磁盘 < 10% 等）
- **告警通知**：告警记录查看、确认处理
- **审计日志**：用户操作记录追踪（登录、提交作业、修改配额等）

### 镜像管理 (Images)
- **系统镜像**：Ubuntu/CentOS/Rocky Linux 基础镜像版本管理
- **AI 框架镜像**：PyTorch / TensorFlow / JAX / PaddlePaddle 预装 CUDA 环境
- **自定义镜像**：用户自定义 Dockerfile 构建的私有镜像

### 个人工作台 (Workspace)
- 我的作业：查看个人提交的所有作业及状态
- 配额概览：当前资源使用量和配额上限
- SSH 公钥：管理免密登录密钥
- 消息通知：系统通知/告警/作业状态变更

### 系统设置 (Settings)
- 认证配置：LDAP / OAuth2 / SAML SSO 对接
- 调度策略：Backfill / Gang / Preemption / Reservation
- 系统公告：发布维护通知、版本更新公告

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Vue 3 (Composition API) |
| 语言 | TypeScript |
| 构建工具 | Vite 5 |
| UI 组件库 | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| HTTP 客户端 | Axios |
| 图表 | ECharts 5 |
| 样式 | SCSS |
| Mock 后端 | Node.js 原生 HTTP（零依赖） |
| Web 服务器 | Nginx |
| 进程管理 | PM2 |

## 项目结构

```
算力支撑管理系统/
├── index.html                      # 应用入口 HTML
├── package.json                    # 依赖与脚本
├── vite.config.ts                  # Vite 配置（代理、别名、SCSS）
├── tsconfig.json                   # TypeScript 配置
├── server/
│   ├── index.cjs                   # Mock 后端服务（端口 8080，33 个路由）
│   └── ecosystem.config.cjs        # PM2 配置
├── src/
│   ├── main.ts                     # 应用入口
│   ├── App.vue                     # 根组件
│   ├── api/                        # API 接口层
│   │   ├── request.ts              # Axios 实例封装（拦截器、统一错误处理）
│   │   └── modules/                # 按模块拆分接口
│   ├── assets/styles/              # 全局样式
│   │   ├── index.scss              # 样式入口
│   │   ├── variables.scss          # SCSS 变量
│   │   ├── mixins.scss             # SCSS Mixin
│   │   └── reset.scss              # 样式重置
│   ├── components/                 # 公共组件
│   │   ├── HeaderBar.vue           # 顶部导航栏
│   │   ├── SidebarMenu.vue         # 侧边栏菜单
│   │   ├── StatusTag.vue           # 状态标签
│   │   └── charts/                 # 图表组件
│   ├── composables/                # 组合式函数
│   │   └── useECharts.ts           # ECharts 封装 Hook
│   ├── layouts/
│   │   └── MainLayout.vue          # 主布局（侧边栏 + 顶栏 + 内容区）
│   ├── mock/                       # 前端 Mock 数据（开发环境）
│   │   └── modules/
│   ├── router/                     # 路由配置
│   │   ├── index.ts                # 路由定义
│   │   ├── guard.ts                # 路由守卫
│   │   └── modules/                # 按模块拆分路由
│   ├── stores/                     # Pinia 状态管理
│   │   ├── index.ts                # Store 入口
│   │   └── modules/                # 按模块拆分 Store
│   ├── types/                      # TypeScript 类型定义
│   ├── utils/                      # 工具函数
│   │   ├── constants.ts            # 常量定义
│   │   └── format.ts               # 格式化工具
│   └── views/                      # 页面视图
│       ├── dashboard/              # 仪表盘
│       ├── resources/              # 资源管理
│       ├── jobs/                   # 作业调度
│       ├── users/                  # 用户管理
│       ├── monitor/                # 监控告警
│       ├── images/                 # 镜像管理
│       ├── workspace/              # 个人工作台
│       ├── settings/               # 系统设置
│       ├── login/                  # 登录页
│       └── error/                  # 404 页面
├── start.sh                        # 生产部署启动脚本
├── stop.sh                         # 停服脚本
└── .gitignore
```

## 部署架构

```
浏览器 ─── :8088 ─── Nginx ───── / ──────────→ dist/ (前端静态文件)
                              │
                              └── /api ──────→ Mock 后端 (:8080)
```

- **Nginx** 在 8088 端口提供前端静态文件服务
- `/api` 路径反向代理到 Mock 后端（端口 8080）
- Mock 后端提供 33 个 RESTful API 路由，返回 `{ code, message, data }` 统一格式

## 快速开始

### 环境要求

| 工具 | 版本要求 |
|------|----------|
| Node.js | >= 18 |
| npm | >= 9 |
| Nginx | 已配置 8088 端口代理 |

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 启动 Mock 后端（端口 8080）
node server/index.cjs

# 3. 启动 Vite 开发服务器（端口 5174）
npm run dev
```

Mock 后端启动后，Vite dev server 会将 `/api` 请求代理到 `localhost:8080`。

### 生产部署

```bash
# 构建前端
npx vite build

# 启动 Mock 后端（使用 PM2 管理）
pm2 start server/ecosystem.config.cjs

# 或使用一键启动脚本
bash start.sh
```

启动后访问 `http://localhost:8088`。

### 停止服务

```bash
bash stop.sh
```

## API 接口规范

所有接口返回统一格式：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

| code | 含义 |
|------|------|
| 0 | 成功 |
| 1 | 业务错误 |
| 其他 | 系统异常 |

分页接口统一参数：`page`（页码）、`pageSize`（每页条数），返回 `{ list, total, page, pageSize }`。

### 核心接口一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dashboard/overview` | 仪表盘概览 |
| GET | `/resources/nodes` | 物理节点列表 |
| GET | `/resources/gpu` | GPU 资源池 |
| GET | `/resources/cpu-memory` | CPU/内存资源 |
| GET | `/resources/storage` | 存储资源 |
| GET | `/resources/network` | 网络资源 |
| GET | `/jobs/queues` | 队列统计 |
| GET | `/jobs/running` | 运行中作业 |
| GET | `/jobs/queued` | 排队作业 |
| GET | `/jobs/history` | 历史作业 |
| POST | `/jobs/submit` | 提交作业 |
| POST | `/jobs/:id/cancel` | 取消作业 |
| GET | `/users` | 用户列表 |
| POST | `/users` | 创建用户 |
| PUT | `/users/:id` | 更新用户 |
| GET | `/users/quotas` | 配额列表 |
| GET | `/users/policies` | 优先级策略 |
| GET | `/monitor/metrics` | 节点监控指标 |
| GET | `/monitor/alert-rules` | 告警规则 |
| GET | `/monitor/alerts` | 告警通知 |
| POST | `/monitor/alerts/:id/acknowledge` | 确认告警 |
| GET | `/monitor/audit-logs` | 审计日志 |
| GET | `/images/system` | 系统镜像 |
| GET | `/images/ai-framework` | AI 框架镜像 |
| GET | `/images/custom` | 自定义镜像 |
| GET | `/workspace/jobs` | 我的作业 |
| GET | `/workspace/quota` | 我的配额 |
| GET | `/workspace/ssh-keys` | SSH 密钥列表 |
| POST | `/workspace/ssh-keys` | 添加 SSH 密钥 |
| GET | `/workspace/notifications` | 消息通知 |
| GET | `/settings/auth` | 认证配置 |
| GET | `/settings/schedule-policies` | 调度策略 |
| GET | `/settings/announcements` | 系统公告 |

## License

Private - 内部使用
