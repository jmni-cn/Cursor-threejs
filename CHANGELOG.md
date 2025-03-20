# 变更日志

## 2024-03-21

### 初始版本
- 创建了基本的粒子系统
- 实现了三种状态：散开、球体、文字
- 添加了基本的动画效果

### 第一次改进
- 改进了初始粒子分布
  - 使用极坐标系统创建密度渐变分布
  - 使用指数函数 `Math.exp(-r / 20)` 创建密度渐变
  - 中心区域密度高，边缘区域密度低
  - 如果粒子位置密度不够，会重新生成更靠近中心的粒子

  代码改动对比：
  ```typescript
  // 旧代码
  positions[i3] = (Math.random() - 0.5) * 100
  positions[i3 + 1] = (Math.random() - 0.5) * 100
  positions[i3 + 2] = (Math.random() - 0.5) * 100

  // 新代码
  const r = Math.random() * 50 // 半径
  const theta = Math.random() * Math.PI * 2 // 水平角度
  const phi = Math.random() * Math.PI // 垂直角度
  
  const densityFactor = Math.exp(-r / 20)
  
  if (Math.random() < densityFactor) {
    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)
  } else {
    const newR = Math.random() * 30
    positions[i3] = newR * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = newR * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = newR * Math.cos(phi)
  }
  ```

- 优化了球体效果
  - 添加离心力效果 `centrifugalForce = Math.min(1, distance / radius)`
  - 根据离心力调整粒子位置 `scale = radius / distance * (1 + centrifugalForce * 0.2)`
  - 边缘粒子会稍微偏离球体表面，形成松散效果

  代码改动对比：
  ```typescript
  // 旧代码
  const scale = radius / distance
  targetX = x * scale
  targetY = y * scale
  targetZ = z * scale

  // 新代码
  const centrifugalForce = Math.min(1, distance / radius)
  const scale = radius / distance * (1 + centrifugalForce * 0.2)
  targetX = x * scale
  targetY = y * scale
  targetZ = z * scale
  ```

- 改进了文字效果
  - 增加文字部分的比例（从30%到40%）
  - 增大文字尺寸（宽度3，高度4）
  - 添加随机偏移使文字更自然
  - 增加文字高度变化
  - 文字和球体都添加了随机偏移，使整体效果更自然

  代码改动对比：
  ```typescript
  // 旧代码
  if (u < 0.3) {
    const charWidth = 2
    const charHeight = 3
    const x = (u * text.length - textIndex) * charWidth - (text.length * charWidth) / 2
    const y = Math.sin(angle) * 2
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta) + x * 0.5,
      radius * Math.sin(phi) * Math.sin(theta) + y * 0.5,
      radius * Math.cos(phi)
    )
  }

  // 新代码
  if (u < 0.4) {
    const charWidth = 3
    const charHeight = 4
    const x = (u * text.length - textIndex) * charWidth - (text.length * charWidth) / 2
    const y = Math.sin(angle) * 3
    const offset = 0.5
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta) + x * 0.8 + (Math.random() - 0.5) * offset,
      radius * Math.sin(phi) * Math.sin(theta) + y * 0.8 + (Math.random() - 0.5) * offset,
      radius * Math.cos(phi) + (Math.random() - 0.5) * offset
    )
  }
  ```

- 添加了鼠标控制
  - 引入 `OrbitControls` 实现鼠标控制
  - 设置阻尼效果使控制更平滑
  - 限制视角范围（最小距离40，最大距离120）
  - 限制垂直旋转角度，防止视角倒置

  代码改动对比：
  ```typescript
  // 新增代码
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
  
  let controls: OrbitControls
  
  // 在 initScene 中添加
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 40
  controls.maxDistance = 120
  controls.maxPolarAngle = Math.PI / 2
  
  // 在 animate 中添加
  controls.update()
  ```

### 第二次改进（2024-03-22）
- 修复了粒子分布问题
  - 解决了中心直线穿过的问题
  - 改为完全三维的随机分布
  - 使用拒绝采样法确保均匀的体积分布
  - 优化了密度梯度算法

  代码改动对比：
  ```typescript
  // 旧代码
  const r = Math.random() * 50 // 半径
  const theta = Math.random() * Math.PI * 2 // 水平角度
  const phi = Math.random() * Math.PI // 垂直角度
  
  const densityFactor = Math.exp(-r / 20)
  
  if (Math.random() < densityFactor) {
    positions[i3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = r * Math.cos(phi)
  } else {
    const newR = Math.random() * 30
    positions[i3] = newR * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = newR * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = newR * Math.cos(phi)
  }

  // 新代码
  let x, y, z
  
  // 使用球体体积内的均匀随机分布
  do {
    x = (Math.random() - 0.5) * 100
    y = (Math.random() - 0.5) * 100
    z = (Math.random() - 0.5) * 100
  } while (x*x + y*y + z*z > 2500) // 拒绝体积外的点
  
  // 应用密度梯度
  const distFromCenter = Math.sqrt(x*x + y*y + z*z)
  const densityFactor = Math.exp(-distFromCenter / 15)
  
  // 将粒子移向或远离中心，以创建密度梯度
  if (Math.random() < densityFactor) {
    // 密度高的区域保持原位置
    positions[i3] = x
    positions[i3 + 1] = y
    positions[i3 + 2] = z
  } else {
    // 密度低的区域，粒子分布更广
    const adjustedDist = distFromCenter + (50 - distFromCenter) * Math.random() * 0.5
    if (distFromCenter > 0) {
      const scale = adjustedDist / distFromCenter
      positions[i3] = x * scale
      positions[i3 + 1] = y * scale
      positions[i3 + 2] = z * scale
    } else {
      // 避免除以零
      positions[i3] = (Math.random() - 0.5) * 80
      positions[i3 + 1] = (Math.random() - 0.5) * 80
      positions[i3 + 2] = (Math.random() - 0.5) * 80
    }
  }
  ```

### 当前存在的问题
1. 文字效果不够明显，需要进一步优化
2. 粒子密度渐变效果可以更加自然
3. 球体旋转时的离心力效果可以更加明显
4. 状态转换的时间间隔可能需要调整

### 下一步计划
1. 优化文字生成算法，使文字更加清晰
2. 调整粒子密度分布参数
3. 增强离心力效果
4. 优化状态转换时间
5. 添加更多交互效果

### 技术参数记录
- 粒子数量：10000
- 初始分布半径：50
- 密度渐变系数：-distFromCenter/15（之前是-r/20）
- 球体半径：10
- 离心力系数：0.2
- 文字宽度：3
- 文字高度：4
- 文字随机偏移：0.5
- 球体随机偏移：0.3
- 状态转换时间：8秒和16秒
- 过渡速度：0.001
- 旋转速度：0.001 