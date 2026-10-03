<template>
  <div style="height: 100%">
    <el-container>
      <el-header>
        <el-menu class="el-menu-demo" mode="horizontal">
          <el-menu-item index="1">首页</el-menu-item>
          <el-menu-item index="2">消息中心</el-menu-item>
          <el-menu-item index="3" style="color: red; font-size: 18px;">
  投资有风险，不提供投资建议，数据展示仅做学习和技术交流
</el-menu-item>
        </el-menu>
       
      </el-header>
      <el-container>
        <el-aside :width="isCollapse ? '65px' : '200px'">
          <el-menu
            :default-active="this.$route.path"
            class="el-menu-vertical-demo"
            router
            :collapse="isCollapse"
            @select="handleSelect"
          >
            <div class="Collapse" @click="isCollapse = !isCollapse">
              <i class="el-icon-caret-right" v-if="isCollapse"></i>
              <i class="el-icon-caret-left" v-else></i>
            </div>
            <el-submenu index="base-data">
              <template slot="title">
                <i class="el-icon-s-data"></i>
                <span>基础数据</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/stock">
                  <i class="el-icon-s-data"></i>
                  <span slot="title">数据展示</span>
                </el-menu-item>
                <el-menu-item index="/stockshownew">
                  <i class="el-icon-s-data"></i>
                  <span slot="title">stockshow</span>
                </el-menu-item>
                <el-menu-item index="/stock_anomaly_analysis">
                  <i class="el-icon-view"></i>
                  <span slot="title">实时异动原因分析</span>
                </el-menu-item>
                <el-menu-item index="/stockjs">
                  <i class="el-icon-time"></i>
                  <span slot="title">当日股票数据</span>
                </el-menu-item>
                <el-menu-item index="/rt_stock_zy">
                  <i class="el-icon-time"></i>
                  <span slot="title">重要自选股</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_stock_monitor">
                  <i class="el-icon-s-check"></i>
                  <span slot="title">股票监控与龙头管理</span>
                </el-menu-item>
                <el-menu-item index="/price_limit_state">
                  <i class="el-icon-warning"></i>
                  <span slot="title">实时涨跌停</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>

            <el-submenu index="sector-concept">
              <template slot="title">
                <i class="el-icon-s-cooperation"></i>
                <span>行业概念</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/industry">
                  <i class="el-icon-s-home"></i>
                  <span slot="title">行业详情</span>
                </el-menu-item>
                <el-menu-item index="/concept">
                  <i class="el-icon-s-cooperation"></i>
                  <span slot="title">概念详情</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_sectors">
                  <i class="el-icon-connection"></i>
                  <span slot="title">gpfx 热点板块</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>

            <el-submenu index="notice">
              <template slot="title">
                <i class="el-icon-document"></i>
                <span>公告</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/notice">
                  <i class="el-icon-time"></i>
                  <span slot="title">公告</span>
                </el-menu-item>
                <el-menu-item index="/increase_decrease_plan">
                  <i class="el-icon-s-home"></i>
                  <span slot="title">股票增减持计划</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_increase_decrease">
                  <i class="el-icon-date"></i>
                  <span slot="title">gpfx 增减持监控</span>
                </el-menu-item>
                <el-menu-item index="/earnings_disclosure">
                  <i class="el-icon-s-home"></i>
                  <span slot="title">业绩报告</span>
                </el-menu-item>
                <el-menu-item index="/recent_earnings_reports">
                  <i class="el-icon-date"></i>
                  <span slot="title">近期业绩报告</span>
                </el-menu-item>
                <el-menu-item index="/unlock_plan">
                  <i class="el-icon-s-home"></i>
                  <span slot="title">解禁</span>
                </el-menu-item>
                <el-menu-item index="/task_control">
                  <i class="el-icon-s-home"></i>
                  <span slot="title">公告更新任务控制</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>

            <el-submenu index="yidong">
              <template slot="title">
                <i class="el-icon-search"></i>
                <span>异动</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/gpfx_yidong">
                  <i class="el-icon-search"></i>
                  <span slot="title">gpfx 股票异动</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_yidong_monitor">
                  <i class="el-icon-bell"></i>
                  <span slot="title">gpfx 实时异动监控</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_yidong_concepts">
                  <i class="el-icon-connection"></i>
                  <span slot="title">gpfx 异动概念</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_yidong_manage">
                  <i class="el-icon-edit-outline"></i>
                  <span slot="title">gpfx 异动维护</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>

            <el-submenu index="gpfx-monitor">
              <template slot="title">
                <i class="el-icon-warning-outline"></i>
                <span>gpfx 监控</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/gpfx_alert_results">
                  <i class="el-icon-bell"></i>
                  <span slot="title">股票实时提示（新版）</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_candidates">
                  <i class="el-icon-s-operation"></i>
                  <span slot="title">gpfx 候选池</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_pretrade_watchlist">
                  <i class="el-icon-view"></i>
                  <span slot="title">gpfx 次日重点监控</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>

            <el-submenu index="gpfx-history">
              <template slot="title">
                <i class="el-icon-notebook-2"></i>
                <span>历史记录</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/gpfx_history_stock">
                  <i class="el-icon-document"></i>
                  <span slot="title">股票历史记录</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_history_industry">
                  <i class="el-icon-s-cooperation"></i>
                  <span slot="title">行业历史记录</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_history_concept">
                  <i class="el-icon-connection"></i>
                  <span slot="title">概念历史记录</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>

            <el-submenu index="gpfx-risk">
              <template slot="title">
                <i class="el-icon-s-order"></i>
                <span>持仓风控</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/gpfx_positions">
                  <i class="el-icon-s-order"></i>
                  <span slot="title">gpfx 持仓监控</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_exclusions">
                  <i class="el-icon-document"></i>
                  <span slot="title">gpfx 通用排除表</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_alert_exclusions">
                  <i class="el-icon-circle-close"></i>
                  <span slot="title">股票提示过滤中心</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_universe_exclusions">
                  <i class="el-icon-delete"></i>
                  <span slot="title">实时计算无效股票</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>

            <el-submenu index="system">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>管理模块</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/field">
                  <i class="el-icon-s-home"></i>
                  <span slot="title">字段管理</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_rule_switches">
                  <i class="el-icon-setting"></i>
                  <span slot="title">gpfx 规则开关</span>
                </el-menu-item>
                <el-menu-item index="/gpfx_alert_schedule">
                  <i class="el-icon-time"></i>
                  <span slot="title">提示时段与规则</span>
                </el-menu-item>
                <el-menu-item index="/earnings_scheduler">
                  <i class="el-icon-timer"></i>
                  <span slot="title">定时抓取任务</span>
                </el-menu-item>
                <el-menu-item index="/scheduled_execution_tasks">
                  <i class="el-icon-video-play"></i>
                  <span slot="title">定时执行任务</span>
                </el-menu-item>
                <el-menu-item index="/realtime_task_control">
                  <i class="el-icon-video-play"></i>
                  <span slot="title">实时抓取任务</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 页面内容 -->
        <el-main class="el-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: false,
    };
  },
  methods: {
    handleSelect(key, keyPath) {},
  },
};
</script>

<style lang="less" scoped>
.el-header {
  .el-menu-item,
  .el-submenu {
    text-align: center;
    line-height: 60px;
  }

  /deep/.el-menu .el-menu-item:hover,
  i:hover {
    color: #409eff;
    // background: white !important;
  }

  /deep/.el-menu .el-menu-item.is-active {
    color: #409eff !important;
    // background: white !important;
  }

  .el-submenu /deep/.el-submenu__title:hover {
    color: #409eff !important;
    // background: white !important;
  }
  .el-menu {
    height: 100%-1px;
  }
}

// .el-container {
//   .el-container {
//     height: calc(100vh - 60px);
//   }
// }

.el-aside {
  height: calc(100vh - 60px);
  transition: width 0.25s;
  -webkit-transition: width 0.25s;
  -moz-transition: width 0.25s;
  -webkit-transition: width 0.25s;
  -o-transition: width 0.25s;
  overflow-x: hidden;
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 100%;
    height: calc(100vh - 60px);
  }
  .el-menu {
    transition: all 10ms;
    height: calc(100vh - 60px);
    .Collapse {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 35px;
      font-size: 25px;
      background-color: #b5daff85;
      cursor: pointer;
    }
  }
}

.el-main {
  width: 100%;
  height: calc(100vh - 60px);
  overflow-y: auto;
  // background-color: antiquewhite;
}
</style>
