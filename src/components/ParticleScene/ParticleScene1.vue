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

// 创建粒子系统
const createParticleSystem = () => {
  const particleCount = 10000 // 粒子数量
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  // 创建粒子位置和颜色
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    
    // 随机位置，缩小分布范围
    positions[i3] = (Math.random() - 0.5) * 40
    positions[i3 + 1] = (Math.random() - 0.5) * 40
    positions[i3 + 2] = (Math.random() - 0.5) * 40
    
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
    size: 0.15, // 稍微增大粒子大小
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
  
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    const z = positions[i + 2]
    
    // 计算到中心的距离
    const distance = Math.sqrt(x * x + y * y + z * z)
    
    // 根据距离计算旋转速度
    const speed = 0.08 + (distance / 40) * 0.04 // 降低旋转速度
    
    // 更新位置
    positions[i] = x * Math.cos(time * speed) - z * Math.sin(time * speed)
    positions[i + 2] = x * Math.sin(time * speed) + z * Math.cos(time * speed)
    
    // 添加波浪运动
    positions[i + 1] = y + Math.sin(time + distance) * 0.3 // 减小波浪幅度
    
    // 更新颜色
    colors[i] = Math.sin(time + distance) * 0.5 + 0.5
    colors[i + 1] = Math.cos(time + distance) * 0.5 + 0.5
    colors[i + 2] = Math.sin(time * 0.5 + distance) * 0.5 + 0.5
  }
  
  particles.geometry.attributes.position.needsUpdate = true
  particles.geometry.attributes.color.needsUpdate = true
}

// 场景初始化
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    60, // 减小视场角
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 0, 80) // 调整相机位置，拉远距离
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.value?.appendChild(renderer.domElement)
  
  // 添加粒子系统
  const particleSystem = createParticleSystem()
  scene.add(particleSystem)
  
  // 开始动画循环
  animate()
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