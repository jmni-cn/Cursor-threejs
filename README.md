# 中国乡村3D可视化场景

这是一个基于 Vue 3 + Vite + Three.js 构建的中国乡村风格3D可视化场景项目。项目呈现了一个宁静的夏日午后乡村场景，包含自然环境、人文建筑和互动效果。

## 功能特点

### 自然环境
- 麦田与花田：使用 InstancedMesh 优化的田野场景
- 河流与小桥：带有流动效果的水面和传统木质小桥
- 树林：自然布局的树木，包含光影效果

### 人文环境
- 中式四合院：传统建筑模型
- 农民角色：简单动画效果，分布在场景各处

### 交互功能
- 场景自由浏览：使用 OrbitControls 实现视角控制
- 性能优化：资源压缩、场景管理、渲染效率提升

## 技术栈

- Vue 3
- Vite
- Three.js
- TypeScript
- GLTF 模型格式

## 项目结构

```
src/
├── assets/
│   └── models/         # 3D模型资源
├── components/
│   └── VillageScene/   # 乡村场景组件
├── utils/
│   └── three/         # Three.js 相关工具函数
└── views/             # 页面视图
```

## 开发指南

### 环境要求
- Node.js >= 16
- npm >= 7

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 使用说明

1. 场景组件使用方式：
```vue
<template>
  <VillageScene />
</template>

<script setup lang="ts">
import VillageScene from '@/components/VillageScene/VillageScene.vue'
</script>
```

2. 场景控制：
- 左键拖动：旋转视角
- 右键拖动：平移视角
- 滚轮：缩放场景

## 性能优化

- 使用 InstancedMesh 优化大量重复物体
- 模型资源压缩
- 场景分块加载
- 视锥体剔除

## 资源文件

### 天空盒纹理
项目使用立方体贴图作为天空盒背景。请将天空盒纹理文件放置在以下目录：
```
public/
└── textures/
    └── skybox/
        ├── px.jpg  # 右面
        ├── nx.jpg  # 左面
        ├── py.jpg  # 上面
        ├── ny.jpg  # 下面
        ├── pz.jpg  # 前面
        └── nz.jpg  # 后面
```

您可以使用任何适合的天空盒纹理，建议使用分辨率为 1024x1024 或 2048x2048 的图片，格式为 JPG 或 PNG。

## 注意事项

- 确保模型文件放置在正确的目录下
- 注意控制场景中的物体数量，避免性能问题
- 建议使用现代浏览器以获得最佳体验
- 确保天空盒纹理文件存在且格式正确

## 后续开发计划

- [ ] 添加更多互动效果
- [ ] 优化场景加载性能
- [ ] 添加更多建筑和角色模型
- [ ] 实现昼夜交替效果
- [ ] 添加天气系统
