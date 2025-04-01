<template>
  <div class="photon-particles" ref="container"></div>
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
let particleSystem: THREE.Points
let animationFrameId: number
let time = 0

// 粒子系统参数
interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  acceleration: THREE.Vector3
  color: THREE.Color
  life: number // 粒子寿命
  maxLife: number // 最大寿命
}

const particleCount = 10000 // 粒子数量
const particleData: Particle[] = []
const positions: number[] = []
const colors: number[] = []

// 创建随机方向向量
const createRandomDirection = () => {
  const x = (Math.random() - 0.5) * 2
  const y = (Math.random() - 0.5) * 2
  const z = (Math.random() - 0.5) * 2
  const length = Math.sqrt(x * x + y * y + z * z)
  return new THREE.Vector3(x / length, y / length, z / length)
}

// 创建粒子系统
const createParticleSystem = () => {
  // 初始化粒子数组
  for (let i = 0; i < particleCount; i++) {
    const direction = createRandomDirection()
    const speed = 0.1 + Math.random() * 0.2 // 随机初始速度
    const acceleration = 0.0001 + Math.random() * 0.0002 // 随机加速度
    
    particleData.push({
      position: new THREE.Vector3(0, 0, 0),
      velocity: direction.multiplyScalar(speed),
      acceleration: direction.multiplyScalar(acceleration),
      color: new THREE.Color(1, 0.8, 0.2), // 光子颜色（偏黄色）
      life: 0,
      maxLife: 1000 + Math.random() * 500 // 随机寿命
    })
  }
  
  // 创建几何体
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  
  // 创建材质
  const material = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
  
  // 创建粒子系统
  return new THREE.Points(geometry, material)
}

// 更新粒子位置
const updateParticles = () => {
  // 清空位置和颜色数组
  positions.length = 0
  colors.length = 0
  
  // 更新每个粒子
  for (let i = 0; i < particleData.length; i++) {
    const particle = particleData[i]
    
    // 更新粒子寿命
    particle.life++
    
    // 如果粒子寿命超过最大值，重置粒子
    if (particle.life > particle.maxLife) {
      particle.position.set(0, 0, 0)
      const direction = createRandomDirection()
      const speed = 0.1 + Math.random() * 0.2
      const acceleration = 0.0001 + Math.random() * 0.0002
      particle.velocity = direction.multiplyScalar(speed)
      particle.acceleration = direction.multiplyScalar(acceleration)
      particle.life = 0
      particle.maxLife = 1000 + Math.random() * 500
    }
    
    // 更新速度和位置
    particle.velocity.add(particle.acceleration)
    particle.position.add(particle.velocity)
    
    // 计算距离，用于颜色渐变
    const distance = particle.position.length()
    const intensity = Math.exp(-distance / 50) // 距离越远，亮度越低
    
    // 更新颜色
    const color = particle.color.clone()
    color.multiplyScalar(intensity)
    
    // 添加到位置和颜色数组
    positions.push(
      particle.position.x,
      particle.position.y,
      particle.position.z
    )
    colors.push(
      color.r,
      color.g,
      color.b
    )
  }
  
  // 更新几何体属性
  particleSystem.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  particleSystem.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  particleSystem.geometry.attributes.position.needsUpdate = true
  particleSystem.geometry.attributes.color.needsUpdate = true
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
  camera.position.set(0, 0, 100)
  
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
  controls.minDistance = 50
  controls.maxDistance = 200
  controls.maxPolarAngle = Math.PI / 2
  
  // 添加粒子系统
  particleSystem = createParticleSystem()
  scene.add(particleSystem)
  
  // 开始动画循环
  animate()
}

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  time += 0.01
  updateParticles()
  controls.update()
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
.photon-particles {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style> 