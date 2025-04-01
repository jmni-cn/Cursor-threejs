<template>
  <div class="solar-system" ref="container"></div>
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

// 天体参数
interface CelestialBody {
  mesh: THREE.Mesh
  orbit: THREE.Line
  orbitRadius: number
  orbitSpeed: number
  rotationSpeed: number
  size: number
  color: THREE.Color
}

const celestialBodies: CelestialBody[] = []

// 创建天体
const createCelestialBody = (
  radius: number,
  orbitRadius: number,
  orbitSpeed: number,
  rotationSpeed: number,
  color: THREE.Color,
  segments: number = 32
) => {
  // 创建几何体
  const geometry = new THREE.SphereGeometry(radius, segments, segments)
  
  // 创建材质
  const material = new THREE.MeshPhongMaterial({
    color: color,
    shininess: 30,
    specular: new THREE.Color(0x333333)
  })
  
  // 创建网格
  const mesh = new THREE.Mesh(geometry, material)
  
  // 创建轨道
  const orbitGeometry = new THREE.BufferGeometry()
  const orbitPoints = []
  const orbitSegments = 128
  
  for (let i = 0; i <= orbitSegments; i++) {
    const angle = (i / orbitSegments) * Math.PI * 2
    orbitPoints.push(
      Math.cos(angle) * orbitRadius,
      0,
      Math.sin(angle) * orbitRadius
    )
  }
  
  orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3))
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 })
  const orbit = new THREE.Line(orbitGeometry, orbitMaterial)
  
  return {
    mesh,
    orbit,
    orbitRadius,
    orbitSpeed,
    rotationSpeed,
    size: radius,
    color
  }
}

// 创建太阳
const createSun = () => {
  const sun = createCelestialBody(5, 0, 0, 0.001, new THREE.Color(0xffff00))
  sun.mesh.material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.8
  })
  return sun
}

// 创建行星
const createPlanets = () => {
  const planets = [
    // 水星
    createCelestialBody(0.8, 15, 0.04, 0.02, new THREE.Color(0x8c8c8c)),
    // 金星
    createCelestialBody(1.2, 25, 0.03, 0.015, new THREE.Color(0xe6b800)),
    // 地球
    createCelestialBody(1.5, 35, 0.02, 0.01, new THREE.Color(0x0066cc)),
    // 火星
    createCelestialBody(1.2, 45, 0.015, 0.008, new THREE.Color(0xcc3300))
  ]
  return planets
}

// 创建小行星带
const createAsteroidBelt = () => {
  const asteroidCount = 1000
  const asteroids: THREE.Mesh[] = []
  
  for (let i = 0; i < asteroidCount; i++) {
    const radius = 0.1 + Math.random() * 0.2
    const orbitRadius = 40 + Math.random() * 10
    const orbitAngle = Math.random() * Math.PI * 2
    const orbitSpeed = 0.01 + Math.random() * 0.005
    
    const geometry = new THREE.SphereGeometry(radius, 8, 8)
    const material = new THREE.MeshPhongMaterial({
      color: 0x666666,
      shininess: 10
    })
    
    const asteroid = new THREE.Mesh(geometry, material)
    asteroid.position.x = Math.cos(orbitAngle) * orbitRadius
    asteroid.position.z = Math.sin(orbitAngle) * orbitRadius
    
    asteroids.push(asteroid)
  }
  
  return asteroids
}

// 更新天体位置
const updateCelestialBodies = () => {
  celestialBodies.forEach(body => {
    if (body.orbitRadius > 0) {
      // 更新轨道位置
      const angle = time * body.orbitSpeed
      body.mesh.position.x = Math.cos(angle) * body.orbitRadius
      body.mesh.position.z = Math.sin(angle) * body.orbitRadius
      
      // 自转
      body.mesh.rotation.y += body.rotationSpeed
    }
  })
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
  camera.position.set(0, 50, 100)
  
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
  
  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0x333333)
  scene.add(ambientLight)
  
  // 添加平行光（模拟太阳光）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, 5)
  scene.add(directionalLight)
  
  // 创建太阳
  const sun = createSun()
  celestialBodies.push(sun)
  scene.add(sun.mesh)
  
  // 创建行星
  const planets = createPlanets()
  planets.forEach(planet => {
    celestialBodies.push(planet)
    scene.add(planet.mesh)
    scene.add(planet.orbit)
  })
  
  // 创建小行星带
  const asteroids = createAsteroidBelt()
  asteroids.forEach(asteroid => {
    scene.add(asteroid)
  })
  
  // 开始动画循环
  animate()
}

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  time += 0.01
  updateCelestialBodies()
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
.solar-system {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
}
</style> 