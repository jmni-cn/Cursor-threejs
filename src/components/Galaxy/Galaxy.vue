<template>
  <div class="galaxy" ref="container"></div>
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
let animationFrameId: number
let time = 0
let galaxy: THREE.Points

// 银河系参数
const galaxyParams = {
  radius: 100, // 银河系半径
  height: 5, // 银河系高度
  arms: 4, // 旋臂数量
  armSpacing: Math.PI * 1.5, // 旋臂间距
  armOffset: 0.5, // 旋臂偏移
  starCount: 100000, // 恒星数量
  backgroundStarCount: 50000, // 背景星星数量
  rotationSpeed: 0.0001, // 旋转速度
}

// 创建银河系
const createGalaxy = () => {
  const positions: number[] = []
  const colors: number[] = []
  
  // 创建银河系主体
  for (let i = 0; i < galaxyParams.starCount; i++) {
    const i3 = i * 3
    
    // 计算到中心的距离
    const radius = Math.random() * galaxyParams.radius
    
    // 计算旋臂位置
    const armAngle = (i % galaxyParams.arms) * galaxyParams.armSpacing
    const randomAngle = Math.random() * Math.PI * 2
    const angle = armAngle + randomAngle * galaxyParams.armOffset
    
    // 添加随机偏移
    const offset = radius * 0.1
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * offset,
      (Math.random() - 0.5) * offset,
      (Math.random() - 0.5) * offset
    )
    
    // 计算位置
    const x = Math.cos(angle) * radius + randomOffset.x
    const y = (Math.random() - 0.5) * galaxyParams.height + randomOffset.y
    const z = Math.sin(angle) * radius + randomOffset.z
    
    positions[i3] = x
    positions[i3 + 1] = y
    positions[i3 + 2] = z
    
    // 根据距离设置颜色
    const distance = Math.sqrt(x * x + y * y + z * z)
    const colorIntensity = Math.exp(-distance / galaxyParams.radius)
    
    // 设置颜色（从中心向外渐变）
    colors[i3] = 0.5 + colorIntensity * 0.5 // 红色
    colors[i3 + 1] = 0.5 + colorIntensity * 0.5 // 绿色
    colors[i3 + 2] = 0.8 + colorIntensity * 0.2 // 蓝色
  }
  
  // 创建背景星空
  for (let i = 0; i < galaxyParams.backgroundStarCount; i++) {
    // 在更大的范围内随机分布
    const radius = 200 + Math.random() * 300
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    
    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)
    
    positions.push(x, y, z)
    
    // 背景星星使用白色
    colors.push(1, 1, 1)
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

// 更新银河系旋转
const updateGalaxy = () => {
  if (!galaxy) return
  
  // 旋转整个银河系
  galaxy.rotation.y += galaxyParams.rotationSpeed
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
  camera.position.set(0, 50, 200)
  
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
  controls.minDistance = 100
  controls.maxDistance = 500
  controls.maxPolarAngle = Math.PI / 2
  
  // 创建银河系
  galaxy = createGalaxy()
  scene.add(galaxy)
  
  // 开始动画循环
  animate()
}

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  time += 0.01
  updateGalaxy()
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
.galaxy {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style> 