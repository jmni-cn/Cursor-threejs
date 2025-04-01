import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'index',
    meta: {
      title: 'index',
    },
    component: () => import('@/views/index.vue'),
  },
  {
    path: '/village',
    name: 'village',
    meta: {
      title: '中国乡村3D场景',
    },
    component: () => import('@/views/VillageView.vue'),
  },
  {
    path: '/particles',
    name: 'particles',
    meta: {
      title: '绚丽粒子动画',
    },
    component: () => import('@/views/ParticleView.vue'),
  },
  {
    path: '/density-particles',
    name: 'density-particles',
    meta: {
      title: '密度分布粒子',
    },
    component: () => import('@/views/DensityParticlesView.vue'),
  },
  {
    path: '/photon-particles',
    name: 'photon-particles',
    meta: {
      title: '光子发射效果',
    },
    component: () => import('@/views/PhotonParticlesView.vue'),
  },
  {
    path: '/solar-system',
    name: 'solar-system',
    meta: {
      title: '太阳系模拟',
    },
    component: () => import('@/views/SolarSystemView.vue'),
  },
  {
    path: '/galaxy',
    name: 'galaxy',
    meta: {
      title: '银河系模拟',
    },
    component: () => import('@/views/GalaxyView.vue'),
  },
  {
    path: '/m33-galaxy',
    name: 'm33-galaxy',
    meta: {
      title: 'M33三角座星系',
    },
    component: () => import('@/views/M33GalaxyView.vue'),
  },
  {
    name: '404',
    path: '/:pathMatch(.*)*',
    meta: {
      title: '404',
    },
    component: () => import('@/views/Error/404.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});
router.beforeEach((_to, _from, next) => {
  next()
})
router.afterEach(() => {
})

export default router;

