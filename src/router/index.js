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
import RecentEarningsReports from '../views/front/RecentEarningsReports.vue'
import EarningsScheduler from '../views/front/EarningsScheduler.vue'
import RealtimeTaskControl from '../views/front/RealtimeTaskControl.vue'
import NoticeIncreaseDecreasePlans from '../views/front/NoticeIncreaseDecreasePlans.vue'
import NoticeUnlockPlans from '../views/front/NoticeUnlockPlans.vue'
import StockShowNew from '../views/front/Stockshownew.vue'
import StockAnomalyAnalysis from '../views/front/StockAnomalyAnalysis.vue'
import GpfxCandidates from '../views/front/GpfxCandidates.vue'
import GpfxSectors from '../views/front/GpfxSectors.vue'
import GpfxAlertResults from '../views/front/GpfxAlertResults.vue'
import GpfxIncreaseDecreaseWatchlist from '../views/front/GpfxIncreaseDecreaseWatchlist.vue'
import GpfxPositions from '../views/front/GpfxPositions.vue'
import GpfxRuleSwitches from '../views/front/GpfxRuleSwitches.vue'
import GpfxAlertSchedule from '../views/front/GpfxAlertSchedule.vue'
import GpfxPretradeWatchlist from '../views/front/GpfxPretradeWatchlist.vue'
import GpfxExclusions from '../views/front/GpfxExclusions.vue'
import GpfxAlertExclusions from '../views/front/GpfxAlertExclusions.vue'
import GpfxUniverseExclusions from '../views/front/GpfxUniverseExclusions.vue'
import GpfxYidong from '../views/front/GpfxYidong.vue'
import GpfxYidongMonitor from '../views/front/GpfxYidongMonitor.vue'
import GpfxYidongConcepts from '../views/front/GpfxYidongConcepts.vue'
import GpfxYidongManage from '../views/front/GpfxYidongManage.vue'
import GpfxHistoryRecords from '../views/front/GpfxHistoryRecords.vue'
import PriceLimitState from '../views/front/PriceLimitState.vue'
import GpfxStockMonitor from '../views/front/GpfxStockMonitor.vue'
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
        path: '/stockshownew',
        component: StockShowNew,
        meta: {
          title: 'stockshow'
        }
      },
      {
        path: '/stock_anomaly_analysis',
        component: StockAnomalyAnalysis,
        meta: {
          title: '实时异动原因分析'
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
          title: '历史行情分析'
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
        path: '/recent_earnings_reports',
        component: RecentEarningsReports,
        meta: {
          title: '近期业绩报告'
        }
      },
      {
        path: '/earnings_scheduler',
        component: EarningsScheduler,
        meta: {
          title: '定时抓取任务控制'
        }
      },
      {
        path: '/scheduled_execution_tasks',
        component: EarningsScheduler,
        meta: {
          title: '定时执行任务控制'
        }
      },
      {
        path: '/realtime_task_control',
        component: RealtimeTaskControl,
        meta: {
          title: '实时抓取任务控制'
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
      },
      {
        path: '/gpfx_sectors',
        component: GpfxSectors,
        meta: {
          title: 'gpfx 热点板块'
        }
      },
      {
        path: '/gpfx_candidates',
        component: GpfxCandidates,
        meta: {
          title: 'gpfx 候选池'
        }
      },
      {
        path: '/gpfx_alert_results',
        component: GpfxAlertResults,
        meta: {
          title: '股票实时提示（新版）'
        }
      },
      {
        path: '/gpfx_increase_decrease',
        component: GpfxIncreaseDecreaseWatchlist,
        meta: {
          title: 'gpfx 增减持监控'
        }
      },
      {
        path: '/gpfx_yidong',
        component: GpfxYidong,
        meta: {
          title: 'gpfx 股票异动'
        }
      },
      {
        path: '/gpfx_yidong_monitor',
        component: GpfxYidongMonitor,
        meta: {
          title: 'gpfx 实时异动监控'
        }
      },
      {
        path: '/gpfx_yidong_concepts',
        component: GpfxYidongConcepts,
        meta: {
          title: 'gpfx 异动概念'
        }
      },
      {
        path: '/gpfx_yidong_manage',
        component: GpfxYidongManage,
        meta: {
          title: 'gpfx 异动维护'
        }
      },
      {
        path: '/gpfx_pretrade_watchlist',
        component: GpfxPretradeWatchlist,
        meta: {
          title: 'gpfx 次日重点监控表'
        }
      },
      {
        path: '/price_limit_state',
        component: PriceLimitState,
        meta: {
          title: '实时涨跌停'
        }
      },
      {
        path: '/gpfx_stock_monitor',
        component: GpfxStockMonitor,
        meta: {
          title: '股票监控与龙头管理'
        }
      },
      {
        path: '/gpfx_positions',
        component: GpfxPositions,
        meta: {
          title: 'gpfx 持仓与卖出监控'
        }
      },
      {
        path: '/gpfx_rule_switches',
        component: GpfxRuleSwitches,
        meta: {
          title: 'gpfx 监控规则开关'
        }
      },
      {
        path: '/gpfx_alert_schedule',
        component: GpfxAlertSchedule,
        meta: {
          title: '提示时段与规则'
        }
      },
      {
        path: '/gpfx_history_stock',
        component: GpfxHistoryRecords,
        meta: {
          title: '股票历史记录',
          kind: 'stock'
        }
      },
      {
        path: '/gpfx_history_industry',
        component: GpfxHistoryRecords,
        meta: {
          title: '行业历史记录',
          kind: 'industry'
        }
      },
      {
        path: '/gpfx_history_concept',
        component: GpfxHistoryRecords,
        meta: {
          title: '概念历史记录',
          kind: 'concept'
        }
      },
      {
        path: '/gpfx_exclusions',
        component: GpfxExclusions,
        meta: {
          title: 'gpfx 通用排除表'
        }
      },
      {
        path: '/gpfx_alert_exclusions',
        component: GpfxAlertExclusions,
        meta: {
          title: '股票提示过滤中心'
        }
      },
      {
        path: '/gpfx_universe_exclusions',
        component: GpfxUniverseExclusions,
        meta: {
          title: '实时计算无效股票'
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
