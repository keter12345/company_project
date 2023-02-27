import Vue from 'vue'
import VueRouter from 'vue-router'
import Industry_BG from '../views/Industry_BG.vue'
import Main from '../views/Main.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/background',
  },
  {
    path: '/main',
    component: Main,
  },
  {
    path: '/background',
    component: Industry_BG,
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
