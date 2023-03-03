import Vue from 'vue'
import VueRouter from 'vue-router'
import Industry from '../views/Industry.vue'
import Stock from '../views/Stock.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/industry',
  },
  {
    path: '/stock',
    component: Stock,
    meta: {
      title: '概念详情'
    }
  },
  {
    path: '/industry',
    component: Industry,
    meta: {
      title: '行业详情'
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.afterEach(to => {
  document.title = to.meta.title
})

export default router
