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

