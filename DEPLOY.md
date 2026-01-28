# IPA Mark 项目部署指南

## Docker 镜像构建和部署

### 快速开始

#### 方式一：使用构建脚本（推荐）

```bash
# 构建镜像
./build-docker.sh

# 运行容器
docker run -d -p 3001:3001 --name ipa-mark ipa-mark:latest
```

#### 方式二：使用 Docker Compose

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 方式三：手动构建

```bash
# 构建镜像
docker build -t ipa-mark:latest .

# 运行容器
docker run -d -p 3001:3001 --name ipa-mark ipa-mark:latest
```

### 推送到镜像仓库

#### Docker Hub

```bash
# 登录 Docker Hub
docker login

# 标记镜像
docker tag ipa-mark:latest your-username/ipa-mark:latest

# 推送镜像
docker push your-username/ipa-mark:latest
```

#### 阿里云容器镜像服务

```bash
# 登录阿里云容器镜像服务
docker login --username=your-username registry.cn-hangzhou.aliyuncs.com

# 标记镜像
docker tag ipa-mark:latest registry.cn-hangzhou.aliyuncs.com/your-namespace/ipa-mark:latest

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/ipa-mark:latest
```

#### 腾讯云容器镜像服务

```bash
# 登录腾讯云容器镜像服务
docker login ccr.ccs.tencentyun.com

# 标记镜像
docker tag ipa-mark:latest ccr.ccs.tencentyun.com/your-namespace/ipa-mark:latest

# 推送镜像
docker push ccr.ccs.tencentyun.com/your-namespace/ipa-mark:latest
```

### 云平台部署

#### 阿里云 ECS / 腾讯云 CVM

1. SSH 连接到服务器
2. 安装 Docker（如果未安装）：
   ```bash
   curl -fsSL https://get.docker.com | bash
   ```
3. 从镜像仓库拉取镜像：
   ```bash
   docker pull your-username/ipa-mark:latest
   ```
4. 运行容器：
   ```bash
   docker run -d -p 3001:3001 --name ipa-mark --restart unless-stopped your-username/ipa-mark:latest
   ```

#### 使用 Docker Compose 部署

1. 将 `docker-compose.yml` 上传到服务器
2. 运行：
   ```bash
   docker-compose up -d
   ```

### 环境变量配置

可以通过环境变量自定义配置：

```bash
docker run -d \
  -p 3001:3001 \
  -e PORT=3001 \
  -e NODE_ENV=production \
  --name ipa-mark \
  ipa-mark:latest
```

### 验证部署

部署完成后，访问以下地址验证：

- 健康检查：`http://your-server:3001/api/languages`
- 前端页面：`http://your-server:3001`

### 常见问题

#### 端口被占用

如果 3001 端口被占用，可以修改端口映射：

```bash
docker run -d -p 8080:3001 --name ipa-mark ipa-mark:latest
```

#### 查看容器日志

```bash
docker logs -f ipa-mark
```

#### 进入容器调试

```bash
docker exec -it ipa-mark sh
```

#### 更新镜像

```bash
# 停止并删除旧容器
docker stop ipa-mark
docker rm ipa-mark

# 拉取新镜像
docker pull your-username/ipa-mark:latest

# 运行新容器
docker run -d -p 3001:3001 --name ipa-mark your-username/ipa-mark:latest
```
