## 📁 目录结构

```text
express/
├── src/
│   ├── config/            # 环境与全局配置 (env.js)
│   ├── controllers/       # 控制器层 (处理 HTTP 请求/响应)
│   │   ├── healthController.js
│   │   └── userController.js
│   ├── middlewares/       # 中间件层
│   │   ├── asyncHandler.js  # 异步函数错误包裹器
│   │   ├── errorHandler.js  # 全局统一异常处理
│   │   └── notFound.js      # 404 路由处理
│   ├── routes/            # 路由定义层
│   │   ├── index.js         # 路由总聚合入口
│   │   ├── healthRoutes.js  # 健康检查路由
│   │   └── userRoutes.js    # 用户业务路由
│   ├── services/          # 业务逻辑层 (纯业务逻辑/数据库操作)
│   │   └── userService.js
│   ├── utils/             # 工具函数 (ApiResponse 响应封装)
│   │   └── apiResponse.js
│   └── app.js             # Express 实例与中间件初始化
├── .env                   # 环境变量配置
├── .env.example
├── .gitignore
├── package.json
└── server.js              # 服务启动入口 (端口监听与优雅退出)
```

---

## 🚀 快速开始

### 1. 安装依赖

进入项目目录并安装依赖包：

```bash
cd D:\zq_workspace_owner\express
npm install
```

### 2. 启动服务

- **开发模式**（使用 `nodemon` 支持热更新）：
  ```bash
  npm run dev
  ```

- **生产模式**：
  ```bash
  npm start
  ```

---

## 📡 API 测试接口

服务默认在 `http://localhost:3000` 启动，可直接测试以下接口：

| HTTP 方法 | 接口路径 | 功能说明 |
| :--- | :--- | :--- |
| `GET` | `/` | 应用运行状态说明 |
| `GET` | `/api/health` | 系统健康检查接口 |
| `GET` | `/api/users` | 获取用户列表 |
| `GET` | `/api/users/:id` | 获取指定用户详情 |
| `POST` | `/api/users` | 创建新用户 (`{ "name": "Bob", "email": "bob@example.com" }`) |
| `DELETE` | `/api/users/:id` | 删除用户 |
| `POST` | `/api/vc-realtime-sales/sync` | 导出并同步指定日期 VC 实时销量；请求体 `{ "date": "2026-08-17" }`，需 `x-internal-token` |

---

## 💡 核心设计亮点

1. **三层解耦架构 (Route - Controller - Service)**
   - 路由文件只负责路径分发。
   - Controller 只负责解析请求与返回 HTTP 结果。
   - Service 纯粹处理数据与业务逻辑，便于后续对接 MySQL/MongoDB/PostgreSQL 或编写单元测试。

2. **免 try-catch 异步包装器 (`asyncHandler`)**
   - 在 Controller 中无需编写繁琐的 `try { ... } catch(e) { next(e) }`，内部未捕获的错误会自动冒泡传输给全局错误处理中间件。

3. **统一 API 响应标准 (`ApiResponse`)**
   所有接口均返回结构化 JSON：
   ```json
   {
     "code": 200,
     "message": "获取成功",
     "data": { ... },
     "timestamp": "2026-08-10T12:00:00.000Z"
   }
   ```

4. **生产安全与防卡死**
   - 集成 `helmet` 防护 HTTP 响应头。
   - 监听 `SIGINT` / `SIGTERM` 信号，在进程终止前完成资源清理和平滑关闭。

## 领星 VC 实时销量任务

任务默认每天北京时间 16:10 执行，处理 `n-1` 日数据：

1. Playwright 登录领星并打开“VC销量统计 / ASIN / 实时销量”。
2. 导出指定日期 Excel，默认关闭“全局聚合”，保留店铺和站点维度。
3. ExcelJS 解析全部数据，完整保留正数、`0` 和负数。
4. 校验“小计”合计与日期列合计一致。
5. 调用 Java 内部接口 `/erp/v1/internal/vc-realtime-sales/import`，由 Java 事务落库。

部署前需按 `.env.example` 配置领星账号、Java 地址及两端一致的内部令牌，并安装 Chromium：

```bash
npx playwright install chromium
```

下载文件和登录状态保存在 `runtime/`，该目录已加入 `.gitignore`。Express 不直接持有数据库账号。
