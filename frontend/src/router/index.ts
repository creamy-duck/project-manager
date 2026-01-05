import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/pages/Dashboard.vue'
import Settings from '@/pages/Settings.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
    }
  ],
})

export default router
