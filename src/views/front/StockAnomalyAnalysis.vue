<template>
  <div class="anomaly-page">
    <el-card class="filter-card">
      <div slot="header" class="header">
        <div>
          <span class="title">实时异动原因分析</span>
          <el-tag size="mini" type="info">日期 {{ tradeDate || '-' }}</el-tag>
          <el-tag size="mini" type="success">countnum {{ countnum || '-' }}</el-tag>
        </div>
        <div class="actions">
          <el-switch v-model="filters.isTest" active-text="测试" inactive-text="正式" active-value="test_" inactive-value="" @change="loadRows" />
          <el-button size="mini" type="primary" icon="el-icon-refresh" :loading="loading" @click="loadRows">刷新</el-button>
          <el-button size="mini" :type="autoRefresh ? 'warning' : 'success'" @click="toggleAutoRefresh">
            {{ autoRefresh ? '停止刷新' : '自动刷新' }}
          </el-button>
        </div>
      </div>

      <el-form :inline="true" size="mini" class="filters" @submit.native.prevent>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" clearable placeholder="代码/名称/板块/原因" style="width: 180px" @keyup.enter.native="loadRows" />
        </el-form-item>
        <el-form-item label="行业/概念">
          <el-popover placement="bottom-start" width="340" trigger="click">
            <div class="sector-filter-popover">
              <div class="sector-filter-head">
                <strong>行业</strong>
                <span>{{ selectedHyCodes.length }}/{{ industryOptions.length }}</span>
              </div>
              <el-input v-model="sectorSearch.hy" size="mini" clearable placeholder="搜索行业" />
              <div class="sector-filter-actions">
                <el-button size="mini" @click="selectMonitoredSectors('hy')">默认</el-button>
                <el-button size="mini" @click="clearSectors('hy')">清空</el-button>
              </div>
              <el-checkbox-group v-model="selectedHyCodes" class="sector-check-list" @change="loadRows">
                <el-checkbox v-for="item in filteredIndustries" :key="item.bk_code" :label="item.bk_code">
                  <span class="sector-name">{{ item.bk_name }}</span>
                  <span :class="['sector-state', Number(item.zycd) === -1 ? 'off' : '']">{{ item.monitor_label }}</span>
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <el-button slot="reference" size="mini">行业 {{ selectedHyCodes.length }}/{{ industryOptions.length }}</el-button>
          </el-popover>
          <el-popover placement="bottom-start" width="340" trigger="click">
            <div class="sector-filter-popover">
              <div class="sector-filter-head">
                <strong>概念</strong>
                <span>{{ selectedGnCodes.length }}/{{ conceptOptions.length }}</span>
              </div>
              <el-input v-model="sectorSearch.gn" size="mini" clearable placeholder="搜索概念" />
              <div class="sector-filter-actions">
                <el-button size="mini" @click="selectMonitoredSectors('gn')">默认</el-button>
                <el-button size="mini" @click="clearSectors('gn')">清空</el-button>
              </div>
              <el-checkbox-group v-model="selectedGnCodes" class="sector-check-list" @change="loadRows">
                <el-checkbox v-for="item in filteredConcepts" :key="item.bk_code" :label="item.bk_code">
                  <span class="sector-name">{{ item.bk_name }}</span>
                  <span :class="['sector-state', Number(item.zycd) === -1 ? 'off' : '']">{{ item.monitor_label }}</span>
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <el-button slot="reference" size="mini">概念 {{ selectedGnCodes.length }}/{{ conceptOptions.length }}</el-button>
          </el-popover>
        </el-form-item>
        <el-form-item label="综合分">
          <el-input-number v-model="filters.minScore" :min="0" :max="300" :step="10" controls-position="right" />
        </el-form-item>
        <el-form-item label="成交额(亿)">
          <el-input-number v-model="filters.minAmountYi" :min="0" :max="1000" :step="1" controls-position="right" />
        </el-form-item>
        <el-form-item label="1分钟额(万)">
          <el-input-number v-model="filters.minOneAmountWan" :min="0" :max="100000" :step="500" controls-position="right" />
        </el-form-item>
        <el-form-item label="净买(亿)">
          <el-input-number v-model="filters.minNetBuyYi" :min="-100" :max="1000" :step="0.5" controls-position="right" />
        </el-form-item>
        <el-form-item label="1分净买(万)">
          <el-input-number v-model="filters.minOneNetBuyWan" :min="-100000" :max="100000" :step="500" controls-position="right" />
        </el-form-item>
        <el-form-item label="买卖比">
          <el-input-number v-model="filters.minBuySellRatio" :min="0" :max="20" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item label="1分买卖比">
          <el-input-number v-model="filters.minOneBuySellRatio" :min="0" :max="20" :step="0.1" controls-position="right" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="filters.netBuyPositive">买盘占优</el-checkbox>
          <el-checkbox v-model="filters.limitUp">涨停/触板</el-checkbox>
          <el-checkbox v-model="filters.sectorLeader">板块领涨</el-checkbox>
          <el-checkbox v-model="filters.notice">公告</el-checkbox>
          <el-checkbox v-model="filters.signal">提醒信号</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="loadRows">查询</el-button>
          <el-button icon="el-icon-refresh-left" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="summary-row">
        <div class="summary-item"><strong>{{ summary.total || 0 }}</strong><span>股票</span></div>
        <div class="summary-item buy"><strong>{{ summary.net_buy_positive || 0 }}</strong><span>买盘占优</span></div>
        <div class="summary-item limit"><strong>{{ summary.limit_up || 0 }}</strong><span>涨停/触板</span></div>
        <div class="summary-item notice"><strong>{{ summary.notice || 0 }}</strong><span>公告</span></div>
        <div class="summary-item signal"><strong>{{ summary.signal || 0 }}</strong><span>提醒信号</span></div>
      </div>
    </el-card>

    <el-table
      :data="rows"
      v-loading="loading"
      size="mini"
      border
      stripe
      class="analysis-table"
      :row-class-name="rowClassName"
      :default-sort="{ prop: 'reason_score', order: 'descending' }"
    >
      <el-table-column prop="reason_score" label="分" width="70" sortable align="right" />
      <el-table-column label="股票" width="150" fixed>
        <template slot-scope="{ row }">
          <div class="stock-name">{{ row.ts_name }}</div>
          <div class="muted">{{ row.ts_code }}</div>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="130" align="right">
        <template slot-scope="{ row }">
          <div>{{ fmt(row.latest_price, 2) }}</div>
          <div :class="Number(row.changpercent || 0) >= 0 ? 'red' : 'green'">{{ fmt(row.changpercent, 2) }}%</div>
        </template>
      </el-table-column>
      <el-table-column label="成交" width="150" align="right">
        <template slot-scope="{ row }">
          <div>{{ fmt(row.tradingamount_yi, 2) }} 亿</div>
          <div class="muted">1分 {{ fmt(Number(row.one_tradingamount || 0) / 10000, 0) }} 万</div>
        </template>
      </el-table-column>
      <el-table-column label="买卖资金" width="180" align="right">
        <template slot-scope="{ row }">
          <div>
            买 {{ fmt(row.buy_amount_yi, 2) }} / 卖 {{ fmt(row.sell_amount_yi, 2) }} 亿
          </div>
          <div :class="Number(row.net_buy_yi || 0) >= 0 ? 'red' : 'green'">
            净 {{ fmt(row.net_buy_yi, 2) }} 亿 比 {{ fmt(row.buy_sell_ratio, 2) }}
          </div>
          <div class="muted">
            1分净 {{ fmt(Number(row.one_net_buy || 0) / 10000, 0) }} 万 比 {{ fmt(row.one_buy_sell_ratio, 2) }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="异动原因" min-width="360">
        <template slot-scope="{ row }">
          <div class="tag-row">
            <el-tag v-for="tag in row.reason_tags || []" :key="tag" size="mini" :type="tagType(tag)">{{ tag }}</el-tag>
          </div>
          <div class="reason-text">{{ row.reason_text || row.volume_reason || '-' }}</div>
          <div class="metric-line">
            <span>节奏 {{ fmt(row.amount_pace_ratio, 2) }}</span>
            <span>昨 {{ fmt(row.amount_ratio_yesterday, 2) }}</span>
            <span>20日 {{ fmt(row.amount_ratio_avg20, 2) }}</span>
            <span>净买 {{ fmt(row.net_buy_yi, 2) }}亿</span>
            <span>买卖比 {{ fmt(row.buy_sell_ratio, 2) }}</span>
            <span>规则 {{ row.rule_names || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="涨停" width="150">
        <template slot-scope="{ row }">
          <el-tag v-if="Number(row.is_sealed_limit_up || 0)" size="mini" type="danger">{{ row.limit_display_label || '封板' }}</el-tag>
          <el-tag v-else-if="Number(row.is_opened_limit_up || 0)" size="mini" type="warning">炸板</el-tag>
          <el-tag v-else-if="Number(row.is_touch_limit_up || 0)" size="mini" type="danger">触板</el-tag>
          <span v-else class="muted">-</span>
          <div v-if="row.risk_flags" class="muted">{{ row.risk_flags }}</div>
        </template>
      </el-table-column>
      <el-table-column label="板块" min-width="220">
        <template slot-scope="{ row }">
          <div class="sector-line">
            <span class="sector-prefix">行业</span>
            <span v-if="sectorItems(row, 'hy').length">
              <el-tag v-for="item in sectorItems(row, 'hy')" :key="item.bk_code || item.bk_name" size="mini" class="sector-tag">
                {{ item.bk_name }}
              </el-tag>
            </span>
            <span v-else class="muted">-</span>
          </div>
          <div class="sector-line">
            <span class="sector-prefix">概念</span>
            <span v-if="sectorItems(row, 'gn').length">
              <el-tag
                v-for="item in sectorItems(row, 'gn')"
                :key="item.bk_code || item.bk_name"
                size="mini"
                :type="Number(item.zycd || 0) > 0 ? 'danger' : 'info'"
                :class="['sector-tag', Number(item.zycd || 0) > 0 ? 'focus-concept' : '']"
              >
                {{ item.bk_name }}
              </el-tag>
            </span>
            <span v-else class="muted">-</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="公告/资讯" min-width="230">
        <template slot-scope="{ row }">
          <el-tag v-if="Number(row.notice_count || 0)" size="mini" type="warning">{{ row.notice_count }}条公告</el-tag>
          <span v-else class="muted">无近14天公告</span>
          <div class="notice-title">{{ row.latest_notice_title || '' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="提醒" min-width="220">
        <template slot-scope="{ row }">
          <el-tag v-if="Number(row.signal_count || 0)" size="mini" type="success">{{ row.signal_count }}个信号</el-tag>
          <span v-else class="muted">-</span>
          <div class="muted">{{ row.signal_names || '' }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="rd_datetime" label="时间" width="150" />
    </el-table>
  </div>
</template>

<script>
import { getStockAnomalyAnalysis, getStockAnomalySectorFilters } from '../../api/stockshow'

export default {
  name: 'StockAnomalyAnalysis',
  data() {
    return {
      loading: false,
      autoRefresh: false,
      timer: null,
      tradeDate: '',
      countnum: null,
      summary: {},
      rows: [],
      industryOptions: [],
      conceptOptions: [],
      selectedHyCodes: [],
      selectedGnCodes: [],
      sectorSearch: {
        hy: '',
        gn: '',
      },
      filters: {
        isTest: '',
        keyword: '',
        minScore: 40,
        minAmountYi: 0,
        minOneAmountWan: 0,
        minNetBuyYi: null,
        minOneNetBuyWan: null,
        minBuySellRatio: null,
        minOneBuySellRatio: null,
        netBuyPositive: false,
        limitUp: false,
        sectorLeader: false,
        notice: false,
        signal: false,
      },
    }
  },
  computed: {
    filteredIndustries() {
      return this.filterSectors(this.industryOptions, this.sectorSearch.hy)
    },
    filteredConcepts() {
      return this.filterSectors(this.conceptOptions, this.sectorSearch.gn)
    },
  },
  mounted() {
    this.loadSectorFilters().finally(() => {
      this.loadRows()
    })
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    params() {
      const hySectorParams = this.sectorParams(this.industryOptions, this.selectedHyCodes)
      const gnSectorParams = this.sectorParams(this.conceptOptions, this.selectedGnCodes)
      return {
        is_test: this.filters.isTest,
        keyword: this.filters.keyword,
        min_score: this.filters.minScore,
        min_amount_yi: this.filters.minAmountYi,
        min_one_amount_wan: this.filters.minOneAmountWan,
        min_net_buy_yi: this.filters.minNetBuyYi,
        min_one_net_buy_wan: this.filters.minOneNetBuyWan,
        min_buy_sell_ratio: this.filters.minBuySellRatio,
        min_one_buy_sell_ratio: this.filters.minOneBuySellRatio,
        net_buy_positive: this.filters.netBuyPositive ? '1' : '',
        limit_up: this.filters.limitUp ? '1' : '',
        sector_leader: this.filters.sectorLeader ? '1' : '',
        notice: this.filters.notice ? '1' : '',
        signal: this.filters.signal ? '1' : '',
        sector_filter: '1',
        excluded_hy_codes: hySectorParams.excluded.join(','),
        included_unmonitored_hy_codes: hySectorParams.includedUnmonitored.join(','),
        excluded_gn_codes: gnSectorParams.excluded.join(','),
        included_unmonitored_gn_codes: gnSectorParams.includedUnmonitored.join(','),
        limit: 500,
      }
    },
    loadSectorFilters() {
      return getStockAnomalySectorFilters().then(data => {
        if (!data.ok) return
        this.industryOptions = data.industries || []
        this.conceptOptions = data.concepts || []
        this.selectedHyCodes = this.industryOptions.filter(item => item.checked).map(item => item.bk_code)
        this.selectedGnCodes = this.conceptOptions.filter(item => item.checked).map(item => item.bk_code)
      }).catch(err => {
        console.error(err)
        this.$message.warning('行业/概念筛选项加载失败')
      })
    },
    loadRows() {
      this.loading = true
      getStockAnomalyAnalysis(this.params()).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '获取异动分析失败')
          return
        }
        this.tradeDate = data.trade_date
        this.countnum = data.countnum
        this.summary = data.summary || {}
        this.rows = data.rows || []
      }).catch(err => {
        console.error(err)
        this.$message.error('获取异动分析失败')
      }).finally(() => {
        this.loading = false
      })
    },
    resetFilters() {
      this.filters.keyword = ''
      this.filters.minScore = 40
      this.filters.minAmountYi = 0
      this.filters.minOneAmountWan = 0
      this.filters.minNetBuyYi = null
      this.filters.minOneNetBuyWan = null
      this.filters.minBuySellRatio = null
      this.filters.minOneBuySellRatio = null
      this.filters.amountAnomaly = true
      this.filters.netBuyPositive = false
      this.filters.limitUp = false
      this.filters.sectorLeader = false
      this.filters.notice = false
      this.filters.signal = false
      this.selectMonitoredSectors('hy', false)
      this.selectMonitoredSectors('gn', false)
      this.loadRows()
    },
    filterSectors(options, keyword) {
      const kw = String(keyword || '').trim().toLowerCase()
      if (!kw) return options
      return options.filter(item => {
        return String(item.bk_code || '').toLowerCase().indexOf(kw) >= 0 ||
          String(item.bk_name || '').toLowerCase().indexOf(kw) >= 0
      })
    },
    sectorParams(options, selectedCodes) {
      const selected = new Set(selectedCodes || [])
      const excluded = []
      const includedUnmonitored = []
      options.forEach(item => {
        const code = item.bk_code
        const isMonitored = Number(item.zycd || 0) !== -1
        if (isMonitored && !selected.has(code)) excluded.push(code)
        if (!isMonitored && selected.has(code)) includedUnmonitored.push(code)
      })
      return { excluded, includedUnmonitored }
    },
    selectMonitoredSectors(kind, reload = true) {
      if (kind === 'hy') {
        this.selectedHyCodes = this.industryOptions.filter(item => Number(item.zycd || 0) !== -1).map(item => item.bk_code)
      } else {
        this.selectedGnCodes = this.conceptOptions.filter(item => Number(item.zycd || 0) !== -1).map(item => item.bk_code)
      }
      if (reload) this.loadRows()
    },
    clearSectors(kind) {
      if (kind === 'hy') {
        this.selectedHyCodes = []
      } else {
        this.selectedGnCodes = []
      }
      this.loadRows()
    },
    toggleAutoRefresh() {
      this.autoRefresh = !this.autoRefresh
      if (this.timer) clearInterval(this.timer)
      if (this.autoRefresh) {
        this.timer = setInterval(this.loadRows, 10000)
      }
    },
    fmt(value, digits) {
      const num = Number(value)
      if (!Number.isFinite(num)) return '-'
      return num.toFixed(digits)
    },
    tagType(tag) {
      if (tag === '成交额异动') return 'danger'
      if (tag === '买盘占优') return 'success'
      if (tag === '封涨停' || tag === '触板') return 'danger'
      if (tag === '炸板') return 'warning'
      if (tag === '板块领涨') return 'success'
      if (tag === '公告') return 'warning'
      if (tag === '提醒信号') return 'primary'
      return 'info'
    },
    sectorItems(row, kind) {
      const items = row[`${kind}_items`]
      if (Array.isArray(items)) {
        return items.filter(item => kind !== 'gn' || Number(item.zycd || 0) !== -1)
      }
      const names = String(row[`${kind}_name`] || '').split(',').map(name => name.trim()).filter(Boolean)
      return names.map(name => ({ bk_name: name, zycd: 0 }))
    },
    rowClassName({ row }) {
      if (Number(row.is_sealed_limit_up || 0)) return 'limit-row'
      if ((row.reason_tags || []).includes('成交额异动')) return 'amount-row'
      return ''
    },
  },
}
</script>

<style scoped>
.anomaly-page {
  padding: 10px;
}
.filter-card {
  margin-bottom: 10px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.title {
  margin-right: 10px;
  font-weight: 700;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.filters {
  margin-bottom: 8px;
}
.sector-filter-popover {
  max-height: 520px;
}
.sector-filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #303133;
}
.sector-filter-head span {
  color: #909399;
  font-size: 12px;
}
.sector-filter-actions {
  display: flex;
  gap: 6px;
  margin: 8px 0;
}
.sector-check-list {
  display: flex;
  flex-direction: column;
  max-height: 320px;
  overflow: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 6px 8px;
}
.sector-check-list .el-checkbox {
  display: flex;
  align-items: center;
  height: 26px;
  margin-right: 0;
}
.sector-name {
  display: inline-block;
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
}
.sector-state {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
.sector-state.off {
  color: #c0392b;
}
.summary-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.summary-item {
  min-width: 110px;
  padding: 8px 10px;
  border: 1px solid #ebeef5;
  background: #f8fafc;
}
.summary-item strong {
  display: block;
  font-size: 18px;
}
.summary-item span {
  color: #606266;
  font-size: 12px;
}
.summary-item.hot {
  border-color: #fbc4c4;
  background: #fef0f0;
}
.summary-item.buy {
  border-color: #b7eb8f;
  background: #f6ffed;
}
.summary-item.limit {
  border-color: #f5dab1;
  background: #fdf6ec;
}
.summary-item.notice {
  border-color: #faecd8;
  background: #fdf6ec;
}
.summary-item.signal {
  border-color: #c2e7b0;
  background: #f0f9eb;
}
.analysis-table {
  width: 100%;
}
.stock-name {
  font-weight: 700;
}
.muted {
  color: #909399;
  font-size: 12px;
}
.red {
  color: #d93026;
}
.green {
  color: #0f9d58;
}
.tag-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}
.reason-text {
  color: #303133;
  line-height: 1.35;
}
.metric-line {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 3px;
  color: #909399;
  font-size: 12px;
}
.sector-line {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-bottom: 4px;
}
.sector-prefix {
  flex: 0 0 auto;
  color: #909399;
  font-size: 12px;
  line-height: 22px;
}
.sector-tag {
  margin: 0 4px 4px 0;
}
::v-deep .focus-concept {
  border-color: #f56c6c;
  background: #fef0f0;
  color: #d93026;
}
.notice-title {
  margin-top: 4px;
  color: #606266;
  line-height: 1.35;
}
::v-deep .amount-row td {
  background: #fff7ed !important;
}
::v-deep .limit-row td {
  background: #fef0f0 !important;
}
</style>
