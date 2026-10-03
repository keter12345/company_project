<template>
  <div class="earnings-scheduler">
    <el-card v-if="isExecutionPage" class="scheduler-card">
      <div slot="header" class="scheduler-header">
        <div>
          <span class="title">盘前候选池定时任务</span>
          <el-tag :type="pretradeStatus.running ? 'success' : 'info'" size="mini">
            {{ pretradeStatus.running ? '运行中' : '已停止' }}
          </el-tag>
        </div>
        <div class="actions">
          <el-time-picker
            v-model="pretradeTime"
            size="mini"
            format="HH:mm"
            value-format="HH:mm"
            :clearable="false"
            :disabled="pretradeStatus.running"
            placeholder="执行时间"
            style="width: 120px;"
          />
          <el-button size="mini" type="primary" icon="el-icon-check" :loading="pretradeSaving" :disabled="pretradeStatus.running" @click="savePretradeTime">
            更新时间
          </el-button>
          <el-button size="mini" type="success" icon="el-icon-video-play" :disabled="pretradeStatus.running" @click="startPretradeTask">
            启动
          </el-button>
          <el-button size="mini" type="warning" icon="el-icon-video-pause" :disabled="!pretradeStatus.running" @click="stopPretradeTask">
            停止
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-refresh" :loading="pretradeRunningNow" :disabled="pretradeStatus.running" @click="runPretradeOnce(false)">
            单次生成
          </el-button>
          <el-button size="mini" icon="el-icon-refresh-right" :disabled="pretradeStatus.running" @click="loadPretradeStatus">刷新</el-button>
        </div>
      </div>

      <el-descriptions :column="3" border size="mini">
        <el-descriptions-item label="模块名称">pretrade_watchlist_scheduler</el-descriptions-item>
        <el-descriptions-item label="每日时间">{{ pretradeStatus.time ? `${pretradeStatus.time}:00` : '-' }}</el-descriptions-item>
        <el-descriptions-item label="下次执行">{{ pretradeStatus.next_run_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="交易日判断">每天触发；is_workday=False 时立即跳过</el-descriptions-item>
        <el-descriptions-item label="上次执行">{{ pretradeStatus.last_run || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上次结果">{{ pretradeResultText }}</el-descriptions-item>
        <el-descriptions-item label="任务流程" :span="2">更新无效股票 → 更新提示过滤 → 读取最近20个交易日 → 生成当天候选池</el-descriptions-item>
        <el-descriptions-item label="错误">
          <span class="error-text">{{ pretradeStatus.last_error || '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <div class="actions secondary-actions">
        <el-button size="mini" type="warning" plain icon="el-icon-refresh" :loading="pretradeRunningNow" @click="runPretradeOnce(true)">
          非交易日强制生成
        </el-button>
      </div>

      <div class="log-panel">
        <div class="log-title">最近日志</div>
        <pre>{{ pretradeLogsText }}</pre>
      </div>
    </el-card>

    <el-card v-if="isExecutionPage" class="scheduler-card">
      <div slot="header" class="scheduler-header">
        <div>
          <span class="title">历史测试数据准备</span>
          <el-tag type="warning" size="mini">仅手动执行</el-tag>
        </div>
        <div class="actions">
          <el-date-picker v-model="testPrepareDate" type="date" size="mini" value-format="yyyy-MM-dd"
                          :clearable="false" style="width: 135px;" placeholder="测试日期" />
          <el-button size="mini" icon="el-icon-search" :loading="testPrepareChecking" @click="checkTestPrepare">
            检查数据
          </el-button>
          <el-button size="mini" type="primary" icon="el-icon-magic-stick" :loading="testPrepareRunning" @click="runTestPrepare(false)">
            检查并补齐
          </el-button>
          <el-button size="mini" type="warning" plain icon="el-icon-refresh" :loading="testPrepareRunning" @click="runTestPrepare(true)">
            强制重建
          </el-button>
          <el-button size="mini" icon="el-icon-refresh-right" @click="loadTestPrepareStatus">刷新</el-button>
        </div>
      </div>

      <el-descriptions :column="2" border size="mini">
        <el-descriptions-item label="用途">为指定历史实时回测补齐盘前加载数据</el-descriptions-item>
        <el-descriptions-item label="基准日期">测试日的前一个有收盘数据的交易日</el-descriptions-item>
        <el-descriptions-item label="不会处理" :span="2">不会写 test_ 实时结果；也不会伪造 rt_stock_sscl_history 或 stock_history 原始数据。</el-descriptions-item>
      </el-descriptions>

      <el-table v-if="testPrepareCheck.steps" class="run-table" :data="testPrepareCheck.steps" size="mini" border>
        <el-table-column prop="step_name" label="数据项" min-width="180" />
        <el-table-column prop="table_name" label="数据表" min-width="250" />
        <el-table-column prop="data_date" label="数据日期" width="110" />
        <el-table-column prop="rows" label="现有数量" width="100" />
        <el-table-column label="状态" width="100">
          <template slot-scope="scope"><el-tag size="mini" :type="scope.row.ready ? 'success' : 'danger'">{{ scope.row.ready ? '已准备' : '缺失' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="note" label="说明" min-width="220" show-overflow-tooltip />
      </el-table>

      <div v-if="(testPrepareStatus.recent_runs || []).length" class="prepare-run-list">
        <el-card v-for="run in testPrepareStatus.recent_runs" :key="run.id" shadow="never" class="prepare-run-card">
          <div slot="header" class="scheduler-header">
            <div>
              <span class="title">运行 #{{ run.id }}：{{ run.replay_date }} 回测数据准备</span>
              <el-tag size="mini" :type="prepareStatusTag(run.status)">{{ prepareStatusText(run.status) }}</el-tag>
            </div>
            <span class="run-time">开始：{{ run.started_at }}　结束：{{ run.ended_at || '-' }}</span>
          </div>
          <div v-if="run.error_msg" class="prepare-error">本次运行错误：{{ run.error_msg }}</div>
          <el-descriptions :column="2" border size="mini" class="run-meta">
            <el-descriptions-item label="测试日">{{ run.replay_date }}</el-descriptions-item>
            <el-descriptions-item label="前一交易日">{{ run.context_date }}</el-descriptions-item>
          </el-descriptions>
          <el-table :data="run.steps || []" size="mini" border empty-text="本次尚无步骤记录">
            <el-table-column prop="program_name" label="执行程序" min-width="185" />
            <el-table-column prop="table_display" label="读取 / 写入数据表" min-width="310" show-overflow-tooltip />
            <el-table-column label="结果" width="110">
              <template slot-scope="scope">
                <el-tag size="mini" :type="prepareStatusTag(scope.row.status)">{{ prepareStatusText(scope.row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="rows_written" label="处理行数" width="100" />
            <el-table-column prop="elapsed_ms" label="耗时(ms)" width="105" />
            <el-table-column label="说明 / 错误" min-width="220" show-overflow-tooltip>
              <template slot-scope="scope">{{ scope.row.error_msg || scope.row.reason || '-' }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
      <el-empty v-else description="暂无准备记录" :image-size="60" />
    </el-card>

    <el-card v-if="!isExecutionPage" class="scheduler-card">
      <div slot="header" class="scheduler-header">
        <div>
          <span class="title">业绩预告/正式披露抓取</span>
          <el-tag :type="earningsStatus.running ? 'success' : 'info'" size="mini">
            {{ earningsStatus.running ? '运行中' : '已停止' }}
          </el-tag>
        </div>
        <div class="actions">
          <el-time-picker
            v-model="earningsTime"
            size="mini"
            format="HH:mm"
            value-format="HH:mm"
            :clearable="false"
            :disabled="earningsStatus.running"
            placeholder="抓取时间"
            style="width: 120px;"
          />
          <el-button size="mini" type="primary" icon="el-icon-check" :loading="earningsSaving" :disabled="earningsStatus.running" @click="saveEarningsTime">
            更新时间
          </el-button>
          <el-button size="mini" type="success" icon="el-icon-video-play" :disabled="earningsStatus.running" @click="startEarningsTask">
            启动
          </el-button>
          <el-button size="mini" type="warning" icon="el-icon-video-pause" :disabled="!earningsStatus.running" @click="stopEarningsTask">
            停止
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-refresh" :loading="earningsRunningNow" :disabled="earningsStatus.running" @click="runEarningsOnce">
            立即抓取
          </el-button>
          <el-button size="mini" icon="el-icon-refresh-right" :disabled="earningsStatus.running" @click="loadEarningsStatus">刷新</el-button>
        </div>
      </div>

      <el-descriptions :column="3" border size="mini">
        <el-descriptions-item label="任务名称">业绩预告/正式披露抓取</el-descriptions-item>
        <el-descriptions-item label="每日时间">{{ earningsStatus.time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下次执行">{{ earningsStatus.next_run_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上次执行">{{ earningsStatus.last_run || '-' }}</el-descriptions-item>
        <el-descriptions-item label="预告抓取">{{ resultText('forecast') }}</el-descriptions-item>
        <el-descriptions-item label="正式披露抓取">{{ resultText('disclosure') }}</el-descriptions-item>
        <el-descriptions-item label="错误">
          <span class="error-text">{{ earningsStatus.last_error || '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <div class="log-panel">
        <div class="log-title">最近日志</div>
        <pre>{{ earningsLogsText }}</pre>
      </div>
    </el-card>

    <el-card v-if="!isExecutionPage" class="scheduler-card">
      <div slot="header" class="scheduler-header">
        <div>
          <span class="title">公告获取定时任务</span>
          <el-tag :type="noticeFetchStatus.running ? 'success' : 'info'" size="mini">
            {{ noticeFetchStatus.running ? '运行中' : '已停止' }}
          </el-tag>
        </div>
        <div class="actions">
          <el-time-picker
            v-model="noticeFetchTimes"
            size="mini"
            format="HH:mm"
            value-format="HH:mm"
            :clearable="false"
            :disabled="noticeFetchStatus.running"
            is-range
            range-separator="和"
            start-placeholder="上午时间"
            end-placeholder="晚上时间"
            style="width: 220px;"
          />
          <el-button size="mini" type="primary" icon="el-icon-check" :loading="noticeFetchSaving" :disabled="noticeFetchStatus.running" @click="saveNoticeFetchTime">
            更新时间
          </el-button>
          <el-button size="mini" type="success" icon="el-icon-video-play" :disabled="noticeFetchStatus.running" @click="startNoticeFetchTask">
            启动
          </el-button>
          <el-button size="mini" type="warning" icon="el-icon-video-pause" :disabled="!noticeFetchStatus.running" @click="stopNoticeFetchTask">
            停止
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-refresh" :loading="noticeFetchRunningNow" :disabled="noticeFetchStatus.running" @click="runNoticeFetchOnce(false)">
            立即获取
          </el-button>
          <el-button size="mini" icon="el-icon-refresh-right" :disabled="noticeFetchStatus.running" @click="loadNoticeFetchStatus">刷新</el-button>
        </div>
      </div>

      <el-descriptions :column="3" border size="mini">
        <el-descriptions-item label="模块名称">notice_fetch_scheduler</el-descriptions-item>
        <el-descriptions-item label="每日时间">{{ noticeFetchTimeText }}</el-descriptions-item>
        <el-descriptions-item label="下次执行">{{ noticeFetchStatus.next_run_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上次执行">{{ noticeFetchStatus.last_run || '-' }}</el-descriptions-item>
        <el-descriptions-item label="任务范围">原始公告、正文、分类、重点结构化解析</el-descriptions-item>
        <el-descriptions-item label="错误">
          <span class="error-text">{{ noticeFetchStatus.last_error || '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <el-table class="run-table" :data="noticeFetchStatus.recent_runs || []" size="mini" border empty-text="暂无执行记录">
        <el-table-column prop="run_key" label="执行批次" min-width="150" show-overflow-tooltip />
        <el-table-column prop="trigger_label" label="触发时间" width="90" />
        <el-table-column prop="status" label="状态" width="90" />
        <el-table-column prop="current_step" label="当前步骤" min-width="170" show-overflow-tooltip />
        <el-table-column prop="updated_at" label="更新时间" width="160" />
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table :data="props.row.steps || []" size="mini" border>
              <el-table-column prop="step_key" label="步骤编码" width="190" />
              <el-table-column prop="step_name" label="步骤名称" min-width="230" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="100" />
              <el-table-column prop="rows_written" label="处理行数" width="100" />
              <el-table-column prop="error_msg" label="错误" min-width="180" show-overflow-tooltip />
            </el-table>
          </template>
        </el-table-column>
      </el-table>

      <div class="actions secondary-actions">
        <el-button size="mini" type="warning" plain icon="el-icon-refresh" :loading="noticeFetchRunningNow" @click="runNoticeFetchOnce(true)">
          强制执行一次
        </el-button>
      </div>

      <div class="log-panel">
        <div class="log-title">最近日志</div>
        <pre>{{ noticeFetchLogsText }}</pre>
      </div>
    </el-card>

    <el-card v-if="isExecutionPage" class="scheduler-card">
      <div slot="header" class="scheduler-header">
        <div>
          <span class="title">每日收盘后执行任务</span>
          <el-tag :type="dailyCloseStatus.running ? 'success' : 'info'" size="mini">
            {{ dailyCloseStatus.running ? '运行中' : '已停止' }}
          </el-tag>
        </div>
        <div class="actions">
          <el-time-picker
            v-model="dailyCloseTime"
            size="mini"
            format="HH:mm"
            value-format="HH:mm"
            :clearable="false"
            :disabled="dailyCloseStatus.running"
            placeholder="执行时间"
            style="width: 120px;"
          />
          <el-button size="mini" type="primary" icon="el-icon-check" :loading="dailyCloseSaving" :disabled="dailyCloseStatus.running" @click="saveDailyCloseTime">
            更新时间
          </el-button>
          <el-button size="mini" type="success" icon="el-icon-video-play" :disabled="dailyCloseStatus.running" @click="startDailyCloseTask">
            启动
          </el-button>
          <el-button size="mini" type="warning" icon="el-icon-video-pause" :disabled="!dailyCloseStatus.running" @click="stopDailyCloseTask">
            停止
          </el-button>
          <el-button size="mini" type="danger" icon="el-icon-refresh" :loading="dailyCloseRunningNow" :disabled="dailyCloseStatus.running" @click="runDailyCloseOnce(false)">
            单次执行
          </el-button>
          <el-button size="mini" icon="el-icon-refresh-right" :disabled="dailyCloseStatus.running" @click="loadDailyCloseStatus">刷新</el-button>
        </div>
      </div>

      <el-descriptions :column="3" border size="mini">
        <el-descriptions-item label="模块名称">daily_close_context_scheduler</el-descriptions-item>
        <el-descriptions-item label="每日时间">{{ dailyCloseStatus.time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="下次执行">{{ dailyCloseStatus.next_run_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="执行顺序" :span="3">15:40 开始；先逐表归档，全部成功后才生成股票、行业、概念上下文。任一归档失败即停止。</el-descriptions-item>
        <el-descriptions-item label="最新交易日">{{ dailyCloseStatus.latest_stock_history_date || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上次执行">{{ dailyCloseStatus.last_run || '-' }}</el-descriptions-item>
        <el-descriptions-item label="错误">
          <span class="error-text">{{ dailyCloseStatus.last_error || '-' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <div class="archive-title">本任务归档表（测试表不归档）</div>
      <el-table class="archive-table" :data="(dailyCloseStatus.table_groups || {}).archive || []" size="mini" border>
        <el-table-column prop="title" label="数据内容" width="180" />
        <el-table-column prop="table" label="正式表" min-width="230" />
        <el-table-column prop="history_table" label="历史表" min-width="250" />
        <el-table-column prop="date_column" label="日期字段" width="110" />
      </el-table>
      <div class="archive-note">收盘股票历史 stock_history 由实时主流程在 15:33 写入，本任务不重复处理。</div>

      <el-table class="run-table" :data="dailyCloseStatus.recent_runs || []" size="mini" border empty-text="暂无执行记录">
        <el-table-column prop="trade_date" label="交易日" width="110" />
        <el-table-column prop="status" label="状态" width="90" />
        <el-table-column prop="current_step" label="当前步骤" min-width="180" show-overflow-tooltip />
        <el-table-column prop="updated_at" label="更新时间" width="160" />
        <el-table-column type="expand">
          <template slot-scope="props">
            <el-table :data="props.row.steps || []" size="mini" border>
              <el-table-column prop="step_key" label="步骤编码" width="190" />
              <el-table-column prop="step_name" label="步骤名称" min-width="260" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="100" />
              <el-table-column prop="rows_written" label="写入行数" width="100" />
              <el-table-column prop="elapsed_ms" label="耗时(ms)" width="105" />
              <el-table-column prop="reason" label="说明" min-width="160" show-overflow-tooltip />
              <el-table-column prop="error_msg" label="错误" min-width="180" show-overflow-tooltip />
            </el-table>
          </template>
        </el-table-column>
      </el-table>

      <div class="actions secondary-actions">
        <el-button size="mini" type="warning" plain icon="el-icon-refresh" :loading="dailyCloseRunningNow" @click="runDailyCloseOnce(true)">
          强制重跑当天
        </el-button>
      </div>

      <div class="log-panel">
        <div class="log-title">最近日志</div>
        <pre>{{ dailyCloseLogsText }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  getEarningsSchedulerStatus,
  startEarningsScheduler,
  stopEarningsScheduler,
  updateEarningsSchedulerTime,
  runEarningsSchedulerOnce,
  getNoticeFetchSchedulerStatus,
  startNoticeFetchScheduler,
  stopNoticeFetchScheduler,
  updateNoticeFetchSchedulerTime,
  runNoticeFetchSchedulerOnce,
  getDailyCloseContextSchedulerStatus,
  startDailyCloseContextScheduler,
  stopDailyCloseContextScheduler,
  updateDailyCloseContextSchedulerTime,
  runDailyCloseContextSchedulerOnce,
  getPretradeWatchlistSchedulerStatus,
  startPretradeWatchlistScheduler,
  stopPretradeWatchlistScheduler,
  updatePretradeWatchlistSchedulerTime,
  runPretradeWatchlistSchedulerOnce,
  getHistoricalTestDataPrepareStatus,
  checkHistoricalTestData,
  runHistoricalTestDataPrepare,
} from '../../api/earningsScheduler'

export default {
  name: 'EarningsScheduler',
  data() {
    return {
      earningsStatus: {},
      noticeFetchStatus: {},
      dailyCloseStatus: {},
      pretradeStatus: {},
      testPrepareStatus: {},
      testPrepareCheck: {},
      earningsTime: '20:00',
      noticeFetchTimes: ['06:00', '20:00'],
      dailyCloseTime: '15:40',
      pretradeTime: '08:00',
      testPrepareDate: '',
      earningsSaving: false,
      noticeFetchSaving: false,
      dailyCloseSaving: false,
      pretradeSaving: false,
      earningsRunningNow: false,
      noticeFetchRunningNow: false,
      dailyCloseRunningNow: false,
      pretradeRunningNow: false,
      testPrepareChecking: false,
      testPrepareRunning: false,
      timer: null,
    }
  },
  computed: {
    isExecutionPage() {
      return this.$route.path === '/scheduled_execution_tasks'
    },
    earningsLogsText() {
      return (this.earningsStatus.logs || []).join('\n')
    },
    noticeFetchLogsText() {
      return (this.noticeFetchStatus.logs || []).join('\n')
    },
    noticeFetchTimeText() {
      const times = this.noticeFetchStatus.times || this.noticeFetchTimes || []
      return times.length ? times.join('、') : '-'
    },
    dailyCloseLogsText() {
      return (this.dailyCloseStatus.logs || []).join('\n')
    },
    pretradeLogsText() {
      return (this.pretradeStatus.logs || []).join('\n')
    },
    pretradeResultText() {
      const result = this.pretradeStatus.last_result || {}
      if (result.skipped) return `${result.trade_date || ''} ${result.reason || '已跳过'}`.trim()
      const watchlist = result.watchlist
      if (!watchlist) return '-'
      return `候选${watchlist.watchlist_rows || 0}只，重点${watchlist.focus_rows || 0}只`
    },
  },
  mounted() {
    this.loadStatus()
    this.timer = setInterval(this.loadStatus, 5000)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  watch: {
    '$route.path'() {
      this.loadStatus()
    },
  },
  methods: {
    loadStatus() {
      if (this.isExecutionPage) {
        this.loadDailyCloseStatus()
        this.loadPretradeStatus()
        this.loadTestPrepareStatus()
      } else {
        this.loadEarningsStatus()
        this.loadNoticeFetchStatus()
      }
    },
    loadEarningsStatus() {
      getEarningsSchedulerStatus().then(data => {
        this.earningsStatus = data || {}
        this.earningsTime = this.earningsStatus.time || this.earningsTime || '20:00'
      }).catch(err => {
        console.error(err)
        this.$message.error('获取业绩抓取任务状态失败')
      })
    },
    loadNoticeFetchStatus() {
      getNoticeFetchSchedulerStatus().then(data => {
        this.noticeFetchStatus = data || {}
        this.noticeFetchTimes = this.noticeFetchStatus.times || this.noticeFetchTimes || ['06:00', '20:00']
      }).catch(err => {
        console.error(err)
        this.$message.error('获取公告获取任务状态失败')
      })
    },
    loadDailyCloseStatus() {
      getDailyCloseContextSchedulerStatus().then(data => {
        this.dailyCloseStatus = data || {}
        this.dailyCloseTime = this.dailyCloseStatus.time || this.dailyCloseTime || '15:40'
      }).catch(err => {
        console.error(err)
        this.$message.error('获取收盘后执行任务状态失败')
      })
    },
    loadPretradeStatus() {
      getPretradeWatchlistSchedulerStatus().then(data => {
        this.pretradeStatus = data || {}
        this.pretradeTime = this.pretradeStatus.time || this.pretradeTime || '08:00'
      }).catch(err => {
        console.error(err)
        this.$message.error('获取盘前候选池任务状态失败')
      })
    },
    loadTestPrepareStatus() {
      getHistoricalTestDataPrepareStatus().then(data => {
        this.testPrepareStatus = data || {}
      }).catch(err => {
        console.error(err)
        this.$message.error(`获取历史测试数据准备状态失败：${this.requestErrorText(err)}`)
      })
    },
    checkTestPrepare() {
      if (!this.testPrepareDate) {
        this.$message.warning('请先选择测试日期')
        return
      }
      this.testPrepareChecking = true
      checkHistoricalTestData(this.testPrepareDate).then(data => {
        this.testPrepareCheck = data || {}
        if (data.ok === false) this.$message.error(data.error || '检查失败')
        else this.$message.success(`已检查：基准日 ${data.context_date}`)
      }).catch(err => {
        console.error(err)
        this.$message.error(`检查历史测试数据失败：${this.requestErrorText(err)}`)
      }).finally(() => {
        this.testPrepareChecking = false
      })
    },
    runTestPrepare(force) {
      if (!this.testPrepareDate) {
        this.$message.warning('请先选择测试日期')
        return
      }
      this.testPrepareRunning = true
      runHistoricalTestDataPrepare(this.testPrepareDate, force).then(data => {
        if (data.ok === false) this.$message.error(data.error || '数据准备失败')
        else this.$message.success(force ? '历史测试数据已强制重建' : '历史测试缺失数据已补齐')
        this.loadTestPrepareStatus()
        this.checkTestPrepare()
      }).catch(err => {
        console.error(err)
        this.$message.error(`执行历史测试数据准备失败：${this.requestErrorText(err)}`)
      }).finally(() => {
        this.testPrepareRunning = false
      })
    },
    requestErrorText(err) {
      const responseData = err && err.response && err.response.data
      if (responseData && typeof responseData === 'object') {
        return responseData.error || responseData.msg || JSON.stringify(responseData)
      }
      return (err && err.message) || '未返回具体原因'
    },
    prepareStatusText(status) {
      return ({ success: '成功', skipped: '已存在，跳过', failed: '失败', running: '执行中' })[status] || status || '-'
    },
    prepareStatusTag(status) {
      return ({ success: 'success', skipped: 'info', failed: 'danger', running: 'warning' })[status] || 'info'
    },
    resultText(type) {
      const result = this.earningsStatus.last_result || {}
      const total = result[`${type}_total`]
      if (total === undefined || total === null) return '-'
      return `页面${total}条，新增${result[`${type}_inserted`] || 0}，更新${result[`${type}_updated`] || 0}`
    },
    saveEarningsTime() {
      this.earningsSaving = true
      updateEarningsSchedulerTime(this.earningsTime).then(data => {
        this.earningsStatus = data || {}
        this.$message.success(data.msg || '时间已更新')
      }).catch(err => {
        console.error(err)
        this.$message.error('更新时间失败')
      }).finally(() => {
        this.earningsSaving = false
      })
    },
    saveDailyCloseTime() {
      this.dailyCloseSaving = true
      updateDailyCloseContextSchedulerTime(this.dailyCloseTime).then(data => {
        this.dailyCloseStatus = data || {}
        this.$message.success(data.msg || '时间已更新')
      }).catch(err => {
        console.error(err)
        this.$message.error('更新时间失败')
      }).finally(() => {
        this.dailyCloseSaving = false
      })
    },
    savePretradeTime() {
      this.pretradeSaving = true
      updatePretradeWatchlistSchedulerTime(this.pretradeTime).then(data => {
        this.pretradeStatus = data || {}
        this.$message.success(data.msg || '时间已更新')
      }).catch(err => {
        console.error(err)
        this.$message.error('更新时间失败')
      }).finally(() => {
        this.pretradeSaving = false
      })
    },
    saveNoticeFetchTime() {
      this.noticeFetchSaving = true
      updateNoticeFetchSchedulerTime(this.noticeFetchTimes).then(data => {
        this.noticeFetchStatus = data || {}
        this.$message.success(data.msg || '时间已更新')
      }).catch(err => {
        console.error(err)
        this.$message.error('更新时间失败')
      }).finally(() => {
        this.noticeFetchSaving = false
      })
    },
    startEarningsTask() {
      startEarningsScheduler(this.earningsTime).then(data => {
        this.earningsStatus = data || {}
        this.$message.success(data.msg || '任务已启动')
      }).catch(err => {
        console.error(err)
        this.$message.error('启动任务失败')
      })
    },
    startNoticeFetchTask() {
      startNoticeFetchScheduler(this.noticeFetchTimes).then(data => {
        this.noticeFetchStatus = data || {}
        this.$message.success(data.msg || '任务已启动')
      }).catch(err => {
        console.error(err)
        this.$message.error('启动任务失败')
      })
    },
    startDailyCloseTask() {
      startDailyCloseContextScheduler(this.dailyCloseTime).then(data => {
        this.dailyCloseStatus = data || {}
        this.$message.success(data.msg || '任务已启动')
      }).catch(err => {
        console.error(err)
        this.$message.error('启动任务失败')
      })
    },
    startPretradeTask() {
      startPretradeWatchlistScheduler(this.pretradeTime).then(data => {
        this.pretradeStatus = data || {}
        this.$message.success(data.msg || '盘前候选池任务已启动')
      }).catch(err => {
        console.error(err)
        this.$message.error('启动盘前候选池任务失败')
      })
    },
    stopEarningsTask() {
      stopEarningsScheduler().then(data => {
        this.earningsStatus = data || {}
        this.$message.success(data.msg || '任务已停止')
      }).catch(err => {
        console.error(err)
        this.$message.error('停止任务失败')
      })
    },
    stopNoticeFetchTask() {
      stopNoticeFetchScheduler().then(data => {
        this.noticeFetchStatus = data || {}
        this.$message.success(data.msg || '任务已停止')
      }).catch(err => {
        console.error(err)
        this.$message.error('停止任务失败')
      })
    },
    stopDailyCloseTask() {
      stopDailyCloseContextScheduler().then(data => {
        this.dailyCloseStatus = data || {}
        this.$message.success(data.msg || '任务已停止')
      }).catch(err => {
        console.error(err)
        this.$message.error('停止任务失败')
      })
    },
    stopPretradeTask() {
      stopPretradeWatchlistScheduler().then(data => {
        this.pretradeStatus = data || {}
        this.$message.success(data.msg || '盘前候选池任务已停止')
      }).catch(err => {
        console.error(err)
        this.$message.error('停止盘前候选池任务失败')
      })
    },
    runEarningsOnce() {
      this.earningsRunningNow = true
      runEarningsSchedulerOnce().then(data => {
        this.earningsStatus = data || {}
        if (data.ok === false) {
          this.$message.error(data.error || '抓取失败')
        } else {
          this.$message.success('抓取完成')
        }
      }).catch(err => {
        console.error(err)
        this.$message.error('立即抓取失败')
      }).finally(() => {
        this.earningsRunningNow = false
      })
    },
    runNoticeFetchOnce(force) {
      this.noticeFetchRunningNow = true
      runNoticeFetchSchedulerOnce(force ? { force: 1 } : {}).then(data => {
        this.noticeFetchStatus = data || {}
        if (data.ok === false) {
          this.$message.error(data.error || '公告获取失败')
        } else {
          this.$message.success(force ? '强制重跑完成' : '公告获取完成')
        }
      }).catch(err => {
        console.error(err)
        this.$message.error('执行公告获取任务失败')
      }).finally(() => {
        this.noticeFetchRunningNow = false
      })
    },
    runDailyCloseOnce(force) {
      this.dailyCloseRunningNow = true
      runDailyCloseContextSchedulerOnce(force ? { force: 1 } : {}).then(data => {
        this.dailyCloseStatus = data || {}
        if (data.ok === false) {
          this.$message.error(data.error || '执行失败')
        } else {
          this.$message.success(force ? '强制重跑完成' : '执行完成')
        }
      }).catch(err => {
        console.error(err)
        this.$message.error('执行收盘后任务失败')
      }).finally(() => {
        this.dailyCloseRunningNow = false
      })
    },
    runPretradeOnce(force) {
      this.pretradeRunningNow = true
      runPretradeWatchlistSchedulerOnce(force ? { force: 1 } : {}).then(data => {
        this.pretradeStatus = data || {}
        if (data.ok === false) {
          this.$message.error(data.error || '生成失败')
        } else if (data.skipped) {
          this.$message.info(data.reason || '非交易日，已跳过')
        } else {
          this.$message.success('盘前候选池生成完成')
        }
      }).catch(err => {
        console.error(err)
        this.$message.error('执行盘前候选池任务失败')
      }).finally(() => {
        this.pretradeRunningNow = false
      })
    },
  },
}
</script>

<style scoped>
.earnings-scheduler {
  padding: 10px;
}
.scheduler-card + .scheduler-card {
  margin-top: 14px;
}
.scheduler-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.title {
  margin-right: 10px;
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.log-panel {
  margin-top: 12px;
}
.run-table {
  margin-top: 12px;
}
.prepare-run-list {
  margin-top: 12px;
}
.prepare-run-card + .prepare-run-card {
  margin-top: 12px;
}
.run-time {
  color: #909399;
  font-size: 12px;
}
.run-meta {
  margin-bottom: 10px;
}
.prepare-error {
  margin-bottom: 10px;
  padding: 8px 10px;
  color: #f56c6c;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  font-size: 12px;
}
.archive-table {
  margin-top: 8px;
}
.archive-title {
  margin-top: 14px;
  font-weight: 600;
}
.archive-note {
  margin-top: 7px;
  color: #909399;
  font-size: 12px;
}
.secondary-actions {
  margin-top: 12px;
}
.log-title {
  margin-bottom: 6px;
  font-weight: 600;
}
pre {
  min-height: 180px;
  max-height: 360px;
  overflow: auto;
  padding: 10px;
  margin: 0;
  color: #303133;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  font-size: 12px;
  line-height: 1.5;
}
.error-text {
  color: #f56c6c;
}
</style>
