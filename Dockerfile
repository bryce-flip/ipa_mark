# 多阶段构建 Dockerfile
# 阶段1: 构建前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# 复制前端依赖文件
COPY client/package.json client/package-lock.json* ./


# 安装前端依赖（包括 devDependencies，构建时需要）
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 复制前端源代码（包括所有源文件）
COPY client/ ./

# 构建前端生产版本
RUN npm run build

# 验证构建产物是否存在
RUN ls -la dist/ || (echo "前端构建失败：dist 目录不存在" && exit 1)

# 阶段2: 运行后端（包含前端静态文件）
FROM node:20-alpine AS runner

WORKDIR /app

# 复制后端依赖文件
COPY server/package.json server/package-lock.json* ./server/

# 安装后端依赖
WORKDIR /app/server
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# 复制后端源代码
COPY server/ ./

# 从构建阶段复制前端构建产物
COPY --from=frontend-builder /app/client/dist ./../client/dist

# 复制 JSON 字典文件
COPY json/ ./../json/

# 设置工作目录回到根目录
WORKDIR /app

# 暴露端口（后端端口，同时服务前端静态文件和 API）
# 前端构建后是静态文件，由后端 Express 服务器提供服务
EXPOSE 3001

# 设置环境变量
ENV PORT=3001
ENV NODE_ENV=production

# 启动后端服务器（同时服务前端静态文件和 API）
CMD ["node", "server/index.js"]
