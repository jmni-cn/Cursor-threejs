<template>
  <div class="particle-scene" ref="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

// 组件引用
const container = ref<HTMLElement | null>(null)

// Three.js 相关变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particles: THREE.Points
let animationFrameId: number
let time = 0

// 场景状态
enum SceneState {
  SCATTERED = 'scattered',    // 散开状态
  SPHERE = 'sphere',         // 球体状态
  HUMAN = 'human'            // 人像状态
}

let currentState = SceneState.SCATTERED
let transitionProgress = 0
let targetPositions: Float32Array | null = null

// 创建人像轮廓点云
const createHumanSilhouette = () => {
  const positions: number[] = []
  const count = 10000 // 与粒子数量相同
  
  // 创建人像轮廓点云
  for (let i = 0; i < count; i++) {
    const u = Math.random()
    const v = Math.random()
    
    // 使用参数方程创建人像形状
    const height = 20
    const width = 8
    
    // 头部
    if (u < 0.2) {
      const radius = 3 * (1 - u)
      const angle = v * Math.PI * 2
      positions.push(
        Math.cos(angle) * radius,
        height - u * 5,
        Math.sin(angle) * radius
      )
    }
    // 身体
    else if (u < 0.6) {
      const t = (u - 0.2) / 0.4
      const radius = width * (1 - t * 0.5)
      const angle = v * Math.PI * 2
      positions.push(
        Math.cos(angle) * radius,
        height - u * 20,
        Math.sin(angle) * radius
      )
    }
    // 腿部
    else {
      const t = (u - 0.6) / 0.4
      const radius = width * 0.5 * (1 - t)
      const angle = v * Math.PI * 2
      positions.push(
        Math.cos(angle) * radius,
        height - u * 20,
        Math.sin(angle) * radius
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
    
    // 随机位置，充满整个屏幕
    positions[i3] = (Math.random() - 0.5) * 100
    positions[i3 + 1] = (Math.random() - 0.5) * 100
    positions[i3 + 2] = (Math.random() - 0.5) * 100
    
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
  
  // 更新过渡进度
  if (transitionProgress < 1) {
    transitionProgress += 0.005
  }
  
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
        // 将粒子移动到球体表面
        const radius = 15
        const scale = radius / distance
        targetX = x * scale
        targetY = y * scale
        targetZ = z * scale
        break
        
      case SceneState.HUMAN:
        // 使用人像轮廓点云作为目标位置
        if (targetPositions) {
          targetX = targetPositions[i]
          targetY = targetPositions[i + 1]
          targetZ = targetPositions[i + 2]
        }
        break
    }
    
    // 平滑过渡到目标位置
    positions[i] = x + (targetX - x) * transitionProgress
    positions[i + 1] = y + (targetY - y) * transitionProgress
    positions[i + 2] = z + (targetZ - z) * transitionProgress
    
    // 更新颜色
    colors[i] = Math.sin(time + i) * 0.5 + 0.5
    colors[i + 1] = Math.cos(time + i) * 0.5 + 0.5
    colors[i + 2] = Math.sin(time * 0.5 + i) * 0.5 + 0.5
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
  
  // 添加粒子系统
  const particleSystem = createParticleSystem()
  scene.add(particleSystem)
  
  // 创建人像轮廓点云
  targetPositions = createHumanSilhouette()
  
  // 开始动画循环
  animate()
  
  // 设置状态转换定时器
  setTimeout(() => transitionToState(SceneState.SPHERE), 3000)
  setTimeout(() => transitionToState(SceneState.HUMAN), 6000)
}

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  time += 0.01
  updateParticles()
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