import Vue from 'vue'
import VueRouter from 'vue-router'
import Industry from '../views/front/Industry.vue'
import Stock from '../views/front/Stock.vue'
import Index from '../views/index'
import Filed from '../views/admin/filed'
import Concept from '../views/front/Concept'
import History from '../views/front/History'
import StockJS from '../views/front/StockJS'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/industry',
  },


  {
    path: "/path",
    component: Index,
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
          title: '数据展示'
        }
      },
      {
        path: '/concept',
        component: Concept,
        meta: {
          title: '概念详情'
        }
      },
      {
        path: '/history',
        component: History,
        meta: {
          title: '历史数据'
        }
      },
      {
        path: '/stockjs',
        component: StockJS,
        meta: {
          title: '历史数据'
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
