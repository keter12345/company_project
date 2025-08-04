import Vue from 'vue'
import VueRouter from 'vue-router'
import Industry from '../views/front/Industry.vue'
import Stock from '../views/front/Stock.vue'
import Index from '../views/index'
import Field from '../views/admin/Field'
import Concept from '../views/front/Concept'
import History from '../views/front/History'
import StockJS from '../views/front/StockJS'
import Notice from '../views/front/Notice.vue'  // 引入 Notice.vue
import RtStockZy from '../views/front/StockZy.vue'
import StockThread from '../views/front/StockThread.vue'
import EarningsDisclosure from '../views/front/NoticeDisclosure.vue'
import NoticeIncreaseDecreasePlans from '../views/front/NoticeIncreaseDecreasePlans.vue'
import NoticeUnlockPlans from '../views/front/NoticeUnlockPlans.vue'
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
      },
      {
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
        path: '/field',
        component: Field,
        meta: {
          title: '字段管理'
        }
      },
      // 添加公告路由
      {
        path: '/notice',
        component: Notice,
        meta: {
          title: '公告'
        }
      },
      {
        path: '/earnings_disclosure',
        component: EarningsDisclosure,
        meta: {
          title: '业绩披露'
        }
      },
      {
        path: '/increase_decrease_plan',
        component: NoticeIncreaseDecreasePlans,
        meta: {
          title: '增减持计划'
        }
      },
      {
        path: '/unlock_plan',
        component: NoticeUnlockPlans,
        meta: {
          title: '解禁'
        }
      },
      {
        path: '/rt_stock_zy',
        component: RtStockZy,
        meta: {
          title: '重要自选股'
        }
      },
      {
        path: '/task_control',
        component: StockThread,
        meta: {
          title: '公告更新任务控制'
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