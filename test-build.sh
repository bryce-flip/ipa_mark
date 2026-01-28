#!/bin/bash

# Docker 构建测试脚本

set -e

echo "🔍 检查项目结构..."

# 检查必要文件
echo "检查前端文件..."
[ -f "client/package.json" ] || { echo "❌ 缺少 client/package.json"; exit 1; }
[ -d "client/src" ] || { echo "❌ 缺少 client/src 目录"; exit 1; }

echo "检查后端文件..."
[ -f "server/package.json" ] || { echo "❌ 缺少 server/package.json"; exit 1; }
[ -f "server/index.js" ] || { echo "❌ 缺少 server/index.js"; exit 1; }

echo "检查 JSON 字典文件..."
[ -d "json" ] || { echo "❌ 缺少 json 目录"; exit 1; }

echo "✅ 项目结构检查通过"
echo ""

echo "🐳 开始构建 Docker 镜像..."
echo "如果遇到网络问题，请检查："
echo "1. Docker 是否能连接到 registry-1.docker.io"
echo "2. 是否需要配置镜像加速器（如阿里云、腾讯云）"
echo ""

docker-compose -f docker-compose.yml build --progress=plain

echo ""
echo "✅ 构建完成！"
echo "运行以下命令启动容器："
echo "  docker-compose up -d"
