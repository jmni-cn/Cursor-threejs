<template>
  <div class="density-particles" ref="container"></div>
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

// 创建粒子系统
const createParticleSystem = () => {
  const particleCount = 10000
  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)
  
  // 创建粒子位置和颜色
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3
    
    // 使用改进的分布算法
    const r = Math.random() * 50 // 半径
    const theta = Math.random() * Math.PI * 2 // 水平角度
    const phi = Math.acos(2 * Math.random() - 1) // 垂直角度，使用反余弦函数确保均匀分布
    
    // 使用改进的密度函数
    const densityFactor = Math.exp(-r / 25) // 调整衰减速度
    
    // 根据密度决定是否保留这个粒子
    if (Math.random() < densityFactor) {
      // 使用球坐标系转换为笛卡尔坐标系
      positions[i3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = r * Math.cos(phi)
    } else {
      // 如果密度不够，重新生成一个更靠近中心的粒子
      const newR = Math.random() * 25 // 减小重新生成的范围
      positions[i3] = newR * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = newR * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = newR * Math.cos(phi)
    }
    
    // 根据距离设置颜色渐变
    const distance = Math.sqrt(
      positions[i3] * positions[i3] + 
      positions[i3 + 1] * positions[i3 + 1] + 
      positions[i3 + 2] * positions[i3 + 2]
    )
    const colorIntensity = Math.exp(-distance / 35) // 调整颜色渐变范围
    
    // 设置颜色，从中心向外渐变
    colors[i3] = 0.5 + colorIntensity * 0.5 // 红色分量
    colors[i3 + 1] = 0.3 + colorIntensity * 0.7 // 绿色分量
    colors[i3 + 2] = 0.8 + colorIntensity * 0.2 // 蓝色分量
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
  
  // 计算旋转矩阵，改为绕Y轴旋转
  const rotationSpeed = 0.0002 // 进一步降低旋转速度
  const rotationMatrix = new THREE.Matrix4()
  rotationMatrix.makeRotationY(time * rotationSpeed)
  
  // 更新每个粒子的位置
  for (let i = 0; i < positions.length; i += 3) {
    const vector = new THREE.Vector3(
      positions[i],
      positions[i + 1],
      positions[i + 2]
    )
    
    // 应用旋转
    vector.applyMatrix4(rotationMatrix)
    
    // 更新位置
    positions[i] = vector.x
    positions[i + 1] = vector.y
    positions[i + 2] = vector.z
  }
  
  particles.geometry.attributes.position.needsUpdate = true
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
  
  // 开始动画循环
  animate()
}

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  time += 0.005 // 降低时间增量，使旋转更慢
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
.density-particles {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style> 