import Vue from 'vue'
import VueRouter from 'vue-router'
import Industry from '../views/front/Industry.vue'
import Stock from '../views/front/Stock.vue'
import Front from '../views/index'
import Filed from '../views/admin/filed'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: 'stock',
  },


  {
    path: "/path",
    component: Front,
    children: [
      {
        path: '/industry',
        component: Industry,
        meta: {
          title: '行业详情'
        }
      }, {
        path: '/stock',
        component: Stock,
        meta: {
          title: '概念详情'
        }
      },
      {
        path: '/filed',
        component: Filed,
        meta: {
          title: '字段管理'
        }
      }
    ]
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
