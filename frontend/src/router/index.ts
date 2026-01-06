import { createRouter, createWebHistory } from 'vue-router'

import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

import LoginView from "@/views/AuthLayout/LoginView.vue";
import SignupView from "@/views/AuthLayout/SignupView.vue";
import DashboardView from '@/views/MainLayout/DashboardView.vue'
import SettingsView from '@/views/MainLayout/SettingsView.vue'
import {useAuthStore} from "@/stores/auth.ts";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: LoginView
        },
        {
          path: 'signup',
          name: 'signup',
          component: SignupView
        },
      ]
    },
    {
      path: '/',
      name: 'main',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView
        },
        {
          path: 'settings',
          name: 'settings',
          component: SettingsView
        },
      ]
    }
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = !!authStore.token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth/login')
  }

  if (to.path === '/auth' && isAuthenticated) {
    next('/')
  }

  next()
})

export default router
