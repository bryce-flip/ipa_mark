#!/bin/bash

# IPA Mark 项目 Docker 构建脚本

set -e

echo "🚀 开始构建 IPA Mark Docker 镜像..."

# 镜像名称和标签
IMAGE_NAME=${IMAGE_NAME:-"ipa-mark"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

# 构建 Docker 镜像
echo "📦 构建镜像: ${IMAGE_NAME}:${IMAGE_TAG}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

echo "✅ 构建完成！"
echo ""
echo "📝 使用以下命令运行容器："
echo "   docker run -d -p 3001:3001 --name ipa-mark ${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "📝 或者使用 docker-compose："
echo "   docker-compose up -d"
echo ""
echo "📝 推送到镜像仓库（例如 Docker Hub）："
echo "   docker tag ${IMAGE_NAME}:${IMAGE_TAG} your-username/${IMAGE_NAME}:${IMAGE_TAG}"
echo "   docker push your-username/${IMAGE_NAME}:${IMAGE_TAG}"
