# Portraify - AI Portrait Generator

Portraify is an AI-powered portrait generator that creates professional-looking portraits for various scenarios, including professional headshots, passport photos, and social media profiles.

## 主要功能

1. 专业形象照片生成
2. 证件照（护照/签证）
3. 商务会议形象照
4. 学术会议演讲照
5. 社交平台头像优化
6. 婚礼请柬形象照
7. 学生证/工作证照片
8. 虚拟形象会议背景

### 场景生成功能（8大核心界面）
| 界面文件          | 功能描述                               | 交互优化策略                  |
|-------------------|----------------------------------------|------------------------------|
| photo-upload.tsx  | 智能照片上传与人脸识别                 | 拖拽+点击双模式上传          |
| scene-select.tsx  | 8种场景磁贴式选择界面                  | 长按触发快捷参数调节         |
| ai-params.tsx     | AI参数调节面板（背景/光影/细节）       | 实时WebGL预览画布            |
| preview-result.tsx| 生成效果对比与下载                     | 对比滑块+多尺寸导出          |
| id-specs.tsx      | 全球证件规格数据库                     | 场景关联动态显示             |
| subscription.tsx  | 订阅方案与会员特权                     | 按需动态加载                 |
| history.tsx       | 生成记录时间轴                         | 瀑布流+智能标签             |
| settings.tsx      | 多语言切换与质量设置                   | 情景模式切换控件            |


### 分层导航架构
```mermaid
graph TD
    A[主流程] --> B(photo-upload)
    A --> C(scene-select)
    A --> D(preview-result)
    E[扩展功能] -->|长按触发| F(ai-params)
    E -->|场景关联| G(id-specs)
    H[辅助功能] --> I(history)
    H --> J(settings)
    H --> K(subscription)
```

## 技术实现要求
### 前端架构
- React 18 + TypeScript
- 路由管理：react-router-dom v6
- 状态管理：Zustand
- 国际化：react-i18next
- UI库：HeadlessUI + @heroicons/react
- 样式方案：Tailwind CSS 3.3+（配置viewport自适应）

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portraify.git
cd portraify
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
portraify/
├── public/
│   └── scenes/       # Scene images
├── src/
│   ├── components/   # Reusable components
│   ├── hooks/        # Custom hooks
│   ├── pages/        # Page components
│   ├── store/        # Zustand store
│   └── styles/       # Global styles
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Features

- **Photo Upload**: Upload your photo with drag-and-drop or file selection
- **Scene Selection**: Choose from 8 different portrait scenarios
- **AI Parameters**: Adjust background, lighting, and detail parameters
- **Preview Results**: Compare original and generated portraits with a slider
- **ID Specifications**: Access global ID photo requirements
- **Subscription Plans**: Choose from Free, Pro, and Unlimited plans
- **History**: View and manage your generated portraits
- **Settings**: Customize language, quality, theme, and other preferences

## License

This project is licensed under the MIT License - see the LICENSE file for details.