import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/documents/:id',
      name: 'document',
      component: () => import('../views/DocumentView.vue'),
      props: true,
    },
  ],
});

export default router;
