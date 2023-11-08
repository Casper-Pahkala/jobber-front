// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: '',
        component: () => import('@/views/Home.vue'),
      },
    ],
  },
  {
    path: '/jobs',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'jobs',
        component: () => import('@/views/Jobs.vue'),
      },
      {
        path: ':id',
        name: 'job',
        component: () => import('@/views/Job.vue'),
      },
    ],
  },
  {
    path: '/workers',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'workers',
        component: () => import('@/views/Workers.vue'),
      },
    ],
  },
  {
    path: '/account',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'account',
        component: () => import('@/views/Account.vue'),
      },
    ],
  },
  {
    path: '/messages',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'messages',
        component: () => import('@/views/Messages.vue'),
      },
    ],
  },
  {
    path: '/my-listings',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'my-listings',
        component: () => import('@/views/MyListings.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
