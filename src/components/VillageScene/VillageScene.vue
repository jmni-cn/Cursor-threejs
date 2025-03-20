<template>
  <div class="village-scene" ref="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { 
  createTerrain,
  createWheatField, 
  createRiver, 
  createBridge, 
  createForest,
  createFlowers,
  createSkybox
} from '@/utils/three/sceneUtils'

// 组件引用
const container = ref<HTMLElement | null>(null)

// Three.js 相关变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationFrameId: number

// 场景初始化
const initScene = async () => {
  // 创建场景
  scene = new THREE.Scene()
  
  // 设置天空盒
  scene.background = createSkybox()
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(15, 15, 15)
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2
  container.value?.appendChild(renderer.domElement)
  
  // 创建控制器
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 10
  controls.maxDistance = 200
  controls.maxPolarAngle = Math.PI / 2
  controls.target.set(0, 0, 0)
  
  // 添加环境光和平行光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight.position.set(10, 15, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 500
  directionalLight.shadow.camera.left = -100
  directionalLight.shadow.camera.right = 100
  directionalLight.shadow.camera.top = 100
  directionalLight.shadow.camera.bottom = -100
  scene.add(directionalLight)
  
  // 添加地形
  const terrain = createTerrain()
  scene.add(terrain)
  
  // 添加麦田
  const wheatField = createWheatField(2000)
  wheatField.castShadow = true
  wheatField.receiveShadow = true
  scene.add(wheatField)
  
  // 添加河流
  const river = createRiver()
  river.receiveShadow = true
  scene.add(river)
  
  // 添加小桥
  const bridge = createBridge()
  bridge.castShadow = true
  bridge.receiveShadow = true
  scene.add(bridge)
  
  // 添加树林
  const forest = createForest(30)
  forest.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  scene.add(forest)
  
  // 添加花草
  const flowers = createFlowers(100)
  flowers.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  scene.add(flowers)
  
  // 开始动画循环
  animate()
}

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
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
.village-scene {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style> 