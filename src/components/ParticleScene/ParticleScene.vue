<template>
  <div class="particle-scene" ref="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// 组件引用
const container = ref<HTMLElement | null>(null)

// Three.js 相关变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let particles: THREE.Points
let animationFrameId: number
let time = 0

// 场景状态
enum SceneState {
  SCATTERED = 'scattered',    // 散开状态
  SPHERE = 'sphere',         // 球体状态
  TEXT = 'text'              // 文字状态
}

let currentState = SceneState.SCATTERED
let transitionProgress = 0
let targetPositions: Float32Array | null = null

// 创建文字点云
const createTextPositions = () => {
  const positions: number[] = []
  const count = 10000 // 与粒子数量相同
  const text = "你好，世界！"
  
  // 创建文字点云
  for (let i = 0; i < count; i++) {
    const u = Math.random()
    const v = Math.random()
    
    // 使用参数方程创建文字形状
    const radius = 10 // 球体半径
    const angle = v * Math.PI * 2
    
    // 在球体内部创建文字形状
    if (u < 0.4) { // 增加文字部分的比例
      // 文字部分
      const textIndex = Math.floor(u * text.length)
      const charWidth = 3 // 增加文字宽度
      const charHeight = 4 // 增加文字高度
      
      // 计算文字位置
      const x = (u * text.length - textIndex) * charWidth - (text.length * charWidth) / 2
      const y = Math.sin(angle) * 3 // 增加文字高度变化
      
      // 将文字坐标映射到球体内部
      const phi = Math.acos(1 - 2 * u)
      const theta = v * Math.PI * 2
      
      // 添加一些随机偏移使文字更自然
      const offset = 0.5
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta) + x * 0.8 + (Math.random() - 0.5) * offset,
        radius * Math.sin(phi) * Math.sin(theta) + y * 0.8 + (Math.random() - 0.5) * offset,
        radius * Math.cos(phi) + (Math.random() - 0.5) * offset
      )
    } else {
      // 填充球体其他部分
      const phi = Math.acos(1 - 2 * u)
      const theta = v * Math.PI * 2
      
      // 添加一些随机偏移使球体更自然
      const offset = 0.3
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta) + (Math.random() - 0.5) * offset,
        radius * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * offset,
        radius * Math.cos(phi) + (Math.random() - 0.5) * offset
      )
    }
  }
  
  return new Float32Array(positions)
}

// 创建粒子系统
const createParticleSystem = () => {
  const particleCount = 10000
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  // 创建粒子位置和颜色
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    
    // 使用极坐标系统创建密度渐变分布
    const r = Math.random() * 50 // 半径
    const theta = Math.random() * Math.PI * 2 // 水平角度
    const phi = Math.random() * Math.PI // 垂直角度
    
    // 使用指数函数创建密度渐变
    const densityFactor = Math.exp(-r / 20)
    
    // 根据密度决定是否保留这个粒子
    if (Math.random() < densityFactor) {
      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)
    } else {
      // 如果密度不够，重新生成一个更靠近中心的粒子
      const newR = Math.random() * 30
      positions[i3] = newR * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = newR * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = newR * Math.cos(phi)
    }
    
    // 随机颜色
    colors[i3] = Math.random()
    colors[i3 + 1] = Math.random()
    colors[i3 + 2] = Math.random()
  }
  
  // 创建几何体
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  // 创建材质
  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
  
  // 创建粒子系统
  particles = new THREE.Points(geometry, material)
  return particles
}

// 更新粒子位置
const updateParticles = () => {
  const positions = particles.geometry.attributes.position.array as Float32Array
  const colors = particles.geometry.attributes.color.array as Float32Array
  
  // 更新过渡进度，使用缓动函数使过渡更加平滑
  if (transitionProgress < 1) {
    transitionProgress += 0.001 // 降低过渡速度
  }
  
  // 计算球体旋转
  const rotationSpeed = 0.001 // 降低旋转速度
  const rotationMatrix = new THREE.Matrix4()
  rotationMatrix.makeRotationY(time * rotationSpeed)
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    const z = positions[i + 2]
    
    let targetX = x
    let targetY = y
    let targetZ = z
    
    // 根据当前状态计算目标位置
    switch (currentState) {
      case SceneState.SCATTERED:
        // 保持散开状态
        targetX = x
        targetY = y
        targetZ = z
        break
        
      case SceneState.SPHERE:
        // 计算到中心的距离
        const distance = Math.sqrt(x * x + y * y + z * z)
        // 将粒子移动到球体表面，添加离心力效果
        const radius = 10
        const centrifugalForce = Math.min(1, distance / radius)
        const scale = radius / distance * (1 + centrifugalForce * 0.2)
        targetX = x * scale
        targetY = y * scale
        targetZ = z * scale
        break
        
      case SceneState.TEXT:
        // 使用文字点云作为目标位置
        if (targetPositions) {
          targetX = targetPositions[i]
          targetY = targetPositions[i + 1]
          targetZ = targetPositions[i + 2]
        }
        break
    }
    
    // 应用旋转
    const vector = new THREE.Vector3(targetX, targetY, targetZ)
    vector.applyMatrix4(rotationMatrix)
    
    // 平滑过渡到目标位置
    positions[i] = x + (vector.x - x) * transitionProgress
    positions[i + 1] = y + (vector.y - y) * transitionProgress
    positions[i + 2] = z + (vector.z - z) * transitionProgress
    
    // 更新颜色，使用更柔和的颜色变化
    colors[i] = Math.sin(time * 0.5 + i) * 0.3 + 0.7
    colors[i + 1] = Math.cos(time * 0.5 + i) * 0.3 + 0.7
    colors[i + 2] = Math.sin(time * 0.25 + i) * 0.3 + 0.7
  }
  
  particles.geometry.attributes.position.needsUpdate = true
  particles.geometry.attributes.color.needsUpdate = true
}

// 状态转换
const transitionToState = (newState: SceneState) => {
  currentState = newState
  transitionProgress = 0
}

// 场景初始化
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 0, 80)
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.value?.appendChild(renderer.domElement)
  
  // 添加轨道控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 40
  controls.maxDistance = 120
  controls.maxPolarAngle = Math.PI / 2
  
  // 添加粒子系统
  const particleSystem = createParticleSystem()
  scene.add(particleSystem)
  
  // 创建文字点云
  targetPositions = createTextPositions()
  
  // 开始动画循环
  animate()
  
  // 设置状态转换定时器，使用更长的间隔
  setTimeout(() => transitionToState(SceneState.SPHERE), 8000) // 8秒后开始形成球体
  setTimeout(() => transitionToState(SceneState.TEXT), 16000)  // 16秒后开始形成文字
}

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  time += 0.01
  updateParticles()
  controls.update() // 更新控制器
  renderer.render(scene, camera)
}

// 窗口大小调整
const handleResize = () => {
  if (!container.value) return
  
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
}

// 生命周期钩子
onMounted(() => {
  initScene()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationFrameId)
  renderer.dispose()
})
</script>

<style scoped>
.particle-scene {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style> 