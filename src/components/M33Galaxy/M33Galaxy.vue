<template>
  <div class="m33-galaxy" ref="container"></div>
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
let galaxy: THREE.Group

// 星系参数
const galaxyParams = {
  radius: 100,
  height: 8,
  arms: 3, // M33是三旋臂星系
  armWidth: 15,
  starCount: 150000,
  hydrogenCloudCount: 2000, // 氢气云团数量
  backgroundStarCount: 30000,
  rotationSpeed: 0.0001
}

// 创建氢气云团
const createHydrogenCloud = (position: THREE.Vector3, size: number) => {
  const cloudGeometry = new THREE.BufferGeometry()
  const cloudPositions: number[] = []
  const cloudColors: number[] = []
  const particleCount = Math.floor(size * 100)
  
  for (let i = 0; i < particleCount; i++) {
    // 在球形范围内创建随机分布的粒子
    const radius = Math.random() * size
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    
    const x = position.x + radius * Math.sin(phi) * Math.cos(theta)
    const y = position.y + radius * Math.sin(phi) * Math.sin(theta)
    const z = position.z + radius * Math.cos(phi)
    
    cloudPositions.push(x, y, z)
    
    // 氢气云的颜色（粉红色到红色）
    const redIntensity = 0.8 + Math.random() * 0.2
    const greenIntensity = 0.2 + Math.random() * 0.3
    const blueIntensity = 0.3 + Math.random() * 0.2
    
    cloudColors.push(redIntensity, greenIntensity, blueIntensity)
  }
  
  cloudGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cloudPositions, 3))
  cloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute(cloudColors, 3))
  
  const cloudMaterial = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
  
  return new THREE.Points(cloudGeometry, cloudMaterial)
}

// 创建星系
const createGalaxy = () => {
  const galaxyGroup = new THREE.Group()
  const positions: number[] = []
  const colors: number[] = []
  
  // 创建恒星
  for (let i = 0; i < galaxyParams.starCount; i++) {
    const radius = Math.random() * galaxyParams.radius
    const armIndex = Math.floor(Math.random() * galaxyParams.arms)
    const armAngle = (armIndex / galaxyParams.arms) * Math.PI * 2
    const spiralFactor = 0.5
    
    // 计算旋臂位置
    const angle = armAngle + (radius * spiralFactor)
    const randomOffset = (Math.random() - 0.5) * galaxyParams.armWidth * (radius / galaxyParams.radius)
    
    const x = Math.cos(angle) * radius + randomOffset
    const y = (Math.random() - 0.5) * galaxyParams.height * (1 - radius / galaxyParams.radius)
    const z = Math.sin(angle) * radius + randomOffset
    
    positions.push(x, y, z)
    
    // 根据位置设置恒星颜色
    const distance = Math.sqrt(x * x + y * y + z * z)
    const colorFactor = Math.exp(-distance / (galaxyParams.radius * 0.5))
    
    // 中心区域偏蓝白色，外围偏黄色
    const blue = 0.8 + colorFactor * 0.2
    const green = 0.6 + colorFactor * 0.4
    const red = 0.5 + colorFactor * 0.5
    
    colors.push(red, green, blue)
  }
  
  // 创建星系主体
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  
  const material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
  
  const stars = new THREE.Points(geometry, material)
  galaxyGroup.add(stars)
  
  // 创建氢气云团
  for (let i = 0; i < galaxyParams.hydrogenCloudCount; i++) {
    const radius = Math.random() * galaxyParams.radius * 0.8 + galaxyParams.radius * 0.2
    const armIndex = Math.floor(Math.random() * galaxyParams.arms)
    const armAngle = (armIndex / galaxyParams.arms) * Math.PI * 2
    const spiralFactor = 0.5
    
    const angle = armAngle + (radius * spiralFactor)
    const randomOffset = (Math.random() - 0.5) * galaxyParams.armWidth * 0.5
    
    const position = new THREE.Vector3(
      Math.cos(angle) * radius + randomOffset,
      (Math.random() - 0.5) * galaxyParams.height * 0.5,
      Math.sin(angle) * radius + randomOffset
    )
    
    const cloudSize = 2 + Math.random() * 4 // 随机云团大小
    const cloud = createHydrogenCloud(position, cloudSize)
    galaxyGroup.add(cloud)
  }
  
  // 创建背景星空
  const backgroundPositions: number[] = []
  const backgroundColors: number[] = []
  
  for (let i = 0; i < galaxyParams.backgroundStarCount; i++) {
    const radius = 200 + Math.random() * 300
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    
    const x = radius * Math.sin(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi) * Math.sin(theta)
    const z = radius * Math.cos(phi)
    
    backgroundPositions.push(x, y, z)
    
    // 随机星星颜色（偏白色和金色）
    const isGolden = Math.random() > 0.7
    if (isGolden) {
      backgroundColors.push(1, 0.8, 0.4) // 金色星星
    } else {
      backgroundColors.push(1, 1, 1) // 白色星星
    }
  }
  
  const backgroundGeometry = new THREE.BufferGeometry()
  backgroundGeometry.setAttribute('position', new THREE.Float32BufferAttribute(backgroundPositions, 3))
  backgroundGeometry.setAttribute('color', new THREE.Float32BufferAttribute(backgroundColors, 3))
  
  const backgroundMaterial = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
  
  const backgroundStars = new THREE.Points(backgroundGeometry, backgroundMaterial)
  galaxyGroup.add(backgroundStars)
  
  return galaxyGroup
}

// 更新星系
const updateGalaxy = () => {
  if (!galaxy) return
  
  // 旋转整个星系
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
  
  // 创建星系
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
.m33-galaxy {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style> 