# IPA 音标标注

根据用户输入的文章，使用本地 `json/` 音标库标注对应音标，并以日文式 ruby 注音展示。

## 技术栈

- **后端**：Node.js + Express，懒加载词典，空格分词（英/欧等）或最长匹配（中日韩等）
- **前端**：Vite + React，语言选择、文本输入、标注结果 ruby 展示

## 目录结构

```
ipa_mark/
├── json/          # 音标库（各语言 .json）
├── server/        # API 服务
├── client/        # React 前端
├── package.json   # 根脚本
└── README.md
```

## 开发

```bash
# 安装依赖
npm run install:all

# 终端 1：启动 API（默认 http://localhost:3001）
npm run dev:server

# 终端 2：启动前端（Vite 代理 /api -> 后端）
npm run dev:client
```

浏览器访问 Vite 提供的地址（如 http://localhost:5173）。

## 生产构建与运行

```bash
npm run install:all
npm run build:client
npm run start:server
```

若存在 `client/dist`，Express 会顺带托管前端静态资源；否则仅提供 API。前端需将 `VITE_API_URL` 指向同源或后端地址后再构建。

## API

- `GET /api/languages` → `{ "languages": ["en_US", "zh_hans", ...] }`
- `POST /api/annotate`  
  - Body: `{ "lang": "zh_hans", "text": "用户输入..." }`  
  - Response: `{ "spans": [ { "text": "一", "ipa": "/i˥˥/" }, ... ] }`

本地自测（需先 `npm run start:server`）：

```bash
curl -s http://localhost:3001/api/languages
curl -s -X POST http://localhost:3001/api/annotate -H "Content-Type: application/json" -d '{"lang":"zh_hans","text":"一个"}'
```

## 音标库

仅使用项目内 `json/` 下的音标文件，不支持未登录词或外部服务。

