// Composables
import { createRouter, createWebHistory } from 'vue-router'
import Account from '@/views/Account.vue';
import AddJob from '@/views/AddJob.vue';
import Home from '@/views/Home.vue';
import Job from '@/views/Job.vue';
import Jobs from '@/views/Jobs.vue';
import Workers from '@/views/Workers.vue';

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
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/Account.vue'),
      },
      {
        path: 'messages',
        name: 'messages',
        component: () => import('@/views/Account.vue'),
      },
      {
        path: 'listings',
        name: 'listings',
        component: () => import('@/views/Account.vue'),
      },
    ],
  },
  // {
  //   path: '/messages',
  //   component: () => import('@/layouts/default/Default.vue'),
  //   children: [
  //     {
  //       path: '',
  //       name: 'messages',
  //       component: () => import('@/views/Messages.vue'),
  //     },
  //   ],
  // },
  // {
  //   path: '/my-listings',
  //   component: () => import('@/layouts/default/Default.vue'),
  //   children: [
  //     {
  //       path: '',
  //       name: 'my-listings',
  //       component: () => import('@/views/MyListings.vue'),
  //     },
  //   ],
  // },
  {
    path: '/add-job',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'add-job',
        component: () => import('@/views/AddJob.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
