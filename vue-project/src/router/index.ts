import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/incomes',
  },
  {
    path: '/incomes',
    name: 'Incomes',
    component: () => import('../pages/IncomesPage.vue'),
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../pages/OrdersPage.vue'),
  },
  {
    path: '/sales',
    name: 'Sales',
    component: () => import('../pages/SalesPage.vue'),
  },
  {
    path: '/stocks',
    name: 'Stocks',
    component: () => import('../pages/StocksPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
