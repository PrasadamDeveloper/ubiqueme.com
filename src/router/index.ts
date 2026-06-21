import { useUserStore } from '@/stores/user'
import { watch } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/auth/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/auth/RegisterView.vue'),
    },
    {
      name: 'verify',
      path: '/verify',
      component: () => import('@/views/auth/VerifyView.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/',
      name: 'home',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/public/HomeView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/views/dashboard/DashboardView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      meta: {
        requiresAuth: true,
      },
      component: () => import('@/views/admin/AdminDashboardView.vue'),
    },
    {
      path: '/qr/:qrId?',
      name: 'qr-scanned',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/public/QRScannedView.vue'),
    },
    {
      path: '/checkout/:planId?',
      name: 'checkout',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/public/OrderPlanView.vue'),
    },
    {
      path: '/pricing',
      name: 'pricing',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/public/PricingView.vue'),
    },
    {
      path: '/en-accion',
      name: 'videos',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/public/VideosView.vue'),
    },
    {
      path: '/help',
      name: 'help',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/public/HelpView.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/public/PrivacyView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/public/ContactView.vue'),
    },
    {
      path: '/terms',
      name: 'terms',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/public/TermsView.vue'),
    },
    {
      path: '/delete',
      name: 'delete-data',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/public/DeleteAccountView.vue'),
    },
    {
      path: '/security-test',
      name: 'security-test',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/SecurityTestView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      meta: {
        requiresAuth: false,
      },
      component: () => import('@/views/NotFound.vue'),
    },
  ],

  scrollBehavior(_to, _from, _savedPosition) {
    return { top: 0 }
  },
})

// Helper to wait for Auth to be ready
const waitForAuth = () => {
  const store = useUserStore()
  return new Promise<void>((resolve) => {
    if (store.isAuthReady) return resolve()
    const unwatch = watch(
      () => store.isAuthReady,
      (ready) => {
        if (ready) {
          unwatch()
          resolve()
        }
      },
    )
  })
}

router.beforeEach(async (to) => {
  // Esperar a que Firebase valide el estado inicial
  await waitForAuth()

  const userStore = useUserStore()
  const isAuth = userStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth && !isAuth) {
    return { name: 'home' }
  } else if ((to.name === 'login' || to.name === 'register') && isAuth) {
    return { name: 'dashboard' }
  } else {
    return true
  }
})

export default router
