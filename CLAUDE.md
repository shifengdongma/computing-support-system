# 算力支撑管理系统 - 开发规则

## 构建与部署

本项目通过 **nginx** 提供前端服务，**不要使用 Vite dev server (5174) 来预览页面**。

### 构建命令

```bash
npx vite build
```

构建产物输出到 `dist/` 目录。

### 查看效果

nginx 已在 **8088 端口** 运行，`root` 指向 `/www/算力支撑管理系统/dist/`。

```
http://localhost:8088/
```

任何前端代码修改后，只需执行 `npx vite build` 重新构建，刷新浏览器即可看到效果。无需重启 nginx。
