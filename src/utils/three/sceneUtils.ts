import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

// 创建地形
export const createTerrain = () => {
  const geometry = new THREE.PlaneGeometry(200, 200, 100, 100)
  const material = new THREE.MeshStandardMaterial({
    color: 0x90EE90,
    roughness: 0.8,
    metalness: 0.2,
    wireframe: false,
    flatShading: true
  })
  
  const terrain = new THREE.Mesh(geometry, material)
  terrain.rotation.x = -Math.PI / 2
  terrain.receiveShadow = true
  
  // 添加地形起伏
  const vertices = geometry.attributes.position.array
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i]
    const z = vertices[i + 2]
    vertices[i + 1] = Math.sin(x * 0.1) * 0.5 + Math.cos(z * 0.1) * 0.5
  }
  geometry.computeVertexNormals()
  
  return terrain
}

// 创建麦田
export const createWheatField = (count: number = 2000) => {
  const wheatGeometry = new THREE.CylinderGeometry(0.05, 0.1, 1.2, 8)
  const wheatMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xDAA520,
    roughness: 0.7,
    metalness: 0.3
  })
  
  const instancedMesh = new THREE.InstancedMesh(wheatGeometry, wheatMaterial, count)
  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3()
  const rotation = new THREE.Euler()
  const scale = new THREE.Vector3()
  
  for (let i = 0; i < count; i++) {
    // 随机位置，但保持在特定区域内
    position.x = (Math.random() - 0.5) * 40
    position.z = (Math.random() - 0.5) * 40
    position.y = 0.6
    
    // 随机旋转
    rotation.y = Math.random() * Math.PI
    
    // 随机缩放，使麦子高度略有不同
    const heightScale = 0.8 + Math.random() * 0.4
    scale.set(1, heightScale, 1)
    
    matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale)
    instancedMesh.setMatrixAt(i, matrix)
  }
  
  return instancedMesh
}

// 创建河流
export const createRiver = () => {
  const riverGeometry = new THREE.PlaneGeometry(8, 120, 1, 20)
  const riverMaterial = new THREE.MeshStandardMaterial({
    color: 0x4169E1,
    transparent: true,
    opacity: 0.8,
    roughness: 0.2,
    metalness: 0.8,
    side: THREE.DoubleSide
  })
  
  const river = new THREE.Mesh(riverGeometry, riverMaterial)
  river.rotation.x = -Math.PI / 2
  river.position.y = 0.1
  
  // 添加河流波浪效果
  const vertices = riverGeometry.attributes.position.array
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i]
    vertices[i + 1] = Math.sin(x * 0.2) * 0.1
  }
  riverGeometry.computeVertexNormals()
  
  return river
}

// 创建小桥
export const createBridge = () => {
  const bridgeGroup = new THREE.Group()
  
  // 桥面
  const deckGeometry = new THREE.BoxGeometry(2, 0.5, 12)
  const deckMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.9,
    metalness: 0.1
  })
  const deck = new THREE.Mesh(deckGeometry, deckMaterial)
  deck.position.y = 0.25
  bridgeGroup.add(deck)
  
  // 桥墩
  const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8)
  const pillarMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.9,
    metalness: 0.1
  })
  
  const pillar1 = new THREE.Mesh(pillarGeometry, pillarMaterial)
  pillar1.position.set(0, -0.75, 0)
  bridgeGroup.add(pillar1)
  
  const pillar2 = new THREE.Mesh(pillarGeometry, pillarMaterial)
  pillar2.position.set(0, -0.75, 5)
  bridgeGroup.add(pillar2)
  
  const pillar3 = new THREE.Mesh(pillarGeometry, pillarMaterial)
  pillar3.position.set(0, -0.75, -5)
  bridgeGroup.add(pillar3)
  
  // 桥栏杆
  const railingGeometry = new THREE.BoxGeometry(2.2, 0.8, 0.2)
  const railingMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.9,
    metalness: 0.1
  })
  
  const railing1 = new THREE.Mesh(railingGeometry, railingMaterial)
  railing1.position.set(0, 0.8, 0)
  bridgeGroup.add(railing1)
  
  const railing2 = new THREE.Mesh(railingGeometry, railingMaterial)
  railing2.position.set(0, 0.8, 6)
  bridgeGroup.add(railing2)
  
  const railing3 = new THREE.Mesh(railingGeometry, railingMaterial)
  railing3.position.set(0, 0.8, -6)
  bridgeGroup.add(railing3)
  
  return bridgeGroup
}

// 创建树木
export const createTree = (position: THREE.Vector3) => {
  const treeGroup = new THREE.Group()
  
  // 树干
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2, 8)
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.8,
    metalness: 0.2
  })
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
  treeGroup.add(trunk)
  
  // 树冠（多层树叶）
  const leavesCount = 3
  for (let i = 0; i < leavesCount; i++) {
    const leavesGeometry = new THREE.ConeGeometry(1.2 - i * 0.2, 2 - i * 0.5, 8)
    const leavesMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.7,
      metalness: 0.3
    })
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial)
    leaves.position.y = 1.5 + i * 0.8
    treeGroup.add(leaves)
  }
  
  // 随机旋转和缩放
  treeGroup.rotation.y = Math.random() * Math.PI
  const scale = 0.8 + Math.random() * 0.4
  treeGroup.scale.set(scale, scale, scale)
  
  treeGroup.position.copy(position)
  return treeGroup
}

// 创建树林
export const createForest = (count: number = 30) => {
  const forest = new THREE.Group()
  
  for (let i = 0; i < count; i++) {
    const position = new THREE.Vector3(
      (Math.random() - 0.5) * 80,
      0,
      (Math.random() - 0.5) * 80
    )
    const tree = createTree(position)
    forest.add(tree)
  }
  
  return forest
}

// 创建花草
export const createFlowers = (count: number = 100) => {
  const flowerGroup = new THREE.Group()
  
  for (let i = 0; i < count; i++) {
    const flowerGeometry = new THREE.SphereGeometry(0.1, 8, 8)
    const flowerMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
      roughness: 0.5,
      metalness: 0.5
    })
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial)
    
    flower.position.set(
      (Math.random() - 0.5) * 40,
      0.1,
      (Math.random() - 0.5) * 40
    )
    
    flowerGroup.add(flower)
  }
  
  return flowerGroup
}

// 加载GLTF模型
export const loadGLTFModel = async (url: string) => {
  const loader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('/draco/')
  loader.setDRACOLoader(dracoLoader)
  
  try {
    const gltf = await loader.loadAsync(url)
    return gltf.scene
  } catch (error) {
    console.error('Error loading GLTF model:', error)
    return null
  }
}

// 创建天空盒
export const createSkybox = () => {
  const loader = new THREE.CubeTextureLoader()
  const texture = loader.load([
    '/textures/skybox/px.jpg', // 右
    '/textures/skybox/nx.jpg', // 左
    '/textures/skybox/py.jpg', // 上
    '/textures/skybox/ny.jpg', // 下
    '/textures/skybox/pz.jpg', // 前
    '/textures/skybox/nz.jpg'  // 后
  ])
  
  return texture
} 