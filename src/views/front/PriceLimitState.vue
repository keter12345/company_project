<template>
  <div class="price-limit-page">
    <el-card class="price-limit-card">
      <div slot="header" class="price-limit-header">
        <div class="price-limit-title">
          <span>实时涨跌停</span>
          <el-tag type="info">日期：{{ tradeDate || '无数据' }}</el-tag>
          <el-tag type="primary">轮次：{{ summary.latest_countnum || '-' }}</el-tag>
          <el-tag type="success">封涨停：{{ summary.sealed_up_count || 0 }}</el-tag>
          <el-tag type="danger">封跌停：{{ summary.sealed_down_count || 0 }}</el-tag>
          <el-tag type="warning">炸板：{{ summary.opened_up_count || 0 }}</el-tag>
          <el-tag type="warning">跌停打开：{{ summary.opened_down_count || 0 }}</el-tag>
        </div>
        <div class="price-limit-toolbar">
          <el-switch v-model="isTest" active-text="测试环境" inactive-text="正式环境" @change="resetAndLoad" />
          <el-date-picker
            v-model="tradeDateInput"
            type="date"
            size="mini"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            placeholder="交易日期"
            clearable
            style="width: 150px;"
          />
          <el-select v-model="direction" size="mini" style="width: 100px;">
            <el-option label="全部" value="all" />
            <el-option label="涨停" value="up" />
            <el-option label="跌停" value="down" />
          </el-select>
          <el-select v-model="status" size="mini" style="width: 130px;">
            <el-option label="全部状态" value="all" />
            <el-option label="封涨停" value="sealed_up" />
            <el-option label="炸板" value="opened_up" />
            <el-option label="涨停回封" value="resealed_up" />
            <el-option label="封跌停" value="sealed_down" />
            <el-option label="跌停打开" value="opened_down" />
            <el-option label="跌停回封" value="resealed_down" />
          </el-select>
          <el-input v-model="keyword" size="mini" clearable placeholder="代码/名称" style="width: 150px;" />
          <el-input v-model="limit" size="mini" placeholder="数量" style="width: 80px;" />
          <el-button type="primary" size="mini" @click="load">刷新</el-button>
          <el-button size="mini" @click="archiveToday">归档</el-button>
        </div>
      </div>

      <el-table :data="rowsFormatted" stripe size="mini" v-loading="loading" :height="tableHeight" style="width: 100%">
        <el-table-column prop="last_time_hm" label="更新时间" width="85" />
        <el-table-column prop="ts_code" label="代码" width="100" />
        <el-table-column prop="ts_name" label="名称" width="110" />
        <el-table-column prop="price_fmt" label="现价" width="80" align="right" />
        <el-table-column prop="chg_fmt" label="涨跌幅(%)" width="95" align="right" />
        <el-table-column prop="amount_yi" label="成交额(亿)" width="105" align="right" />
        <el-table-column prop="limit_state_text" label="状态" width="150" />
        <el-table-column prop="limit_display_label" label="连板形态" width="100" />
        <el-table-column prop="limit_up_seq" label="涨停序列" width="95" />
        <el-table-column prop="zt_price_fmt" label="涨停价" width="85" align="right" />
        <el-table-column prop="dt_price_fmt" label="跌停价" width="85" align="right" />
        <el-table-column prop="first_up_hm" label="首次涨停" width="90" />
        <el-table-column prop="open_limit_up_count" label="炸板次数" width="80" align="right" />
        <el-table-column prop="up_amount_yi" label="涨停价成交(亿)" width="125" align="right" />
        <el-table-column prop="first_down_hm" label="首次跌停" width="90" />
        <el-table-column prop="open_limit_down_count" label="打开次数" width="80" align="right" />
        <el-table-column prop="down_amount_yi" label="跌停价成交(亿)" width="125" align="right" />
        <el-table-column prop="limit_form" label="形态" min-width="180" show-overflow-tooltip />
        <el-table-column prop="risk_flags" label="风险" min-width="160" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { archivePriceLimitState, getPriceLimitState } from '@/api/stockshow'

export default {
  name: 'PriceLimitState',
  data() {
    return {
      loading: false,
      isTest: false,
      tradeDate: '',
      tradeDateInput: '',
      direction: 'all',
      status: 'all',
      keyword: '',
      limit: 500,
      summary: {},
      rows: [],
      refreshTimer: null,
    }
  },
  computed: {
    tableHeight() {
      return Math.max(380, window.innerHeight - 220)
    },
    rowsFormatted() {
      const num = (v, digits = 2) => {
        const n = Number(v)
        if (Number.isNaN(n)) return ''
        return n.toFixed(digits)
      }
      const yi = (v) => {
        const n = Number(v)
        if (Number.isNaN(n)) return ''
        return (n / 1e8).toFixed(2)
      }
      return (this.rows || []).map(row => {
        const states = []
        if (Number(row.is_sealed_limit_up) === 1) states.push('封涨停')
        else if (Number(row.is_touch_limit_up) === 1) states.push('触及涨停')
        if (Number(row.is_opened_limit_up) === 1) states.push('炸板')
        if (Number(row.is_resealed_limit_up) === 1) states.push('回封')
        if (Number(row.is_sealed_limit_down) === 1) states.push('封跌停')
        else if (Number(row.is_touch_limit_down) === 1) states.push('触及跌停')
        if (Number(row.is_opened_limit_down) === 1) states.push('跌停打开')
        if (Number(row.is_resealed_limit_down) === 1) states.push('跌停回封')
        return {
          ...row,
          last_time_hm: row.last_update_time ? String(row.last_update_time).slice(11, 19) : '',
          first_up_hm: row.first_limit_up_time ? String(row.first_limit_up_time).slice(11, 19) : '',
          first_down_hm: row.first_limit_down_time ? String(row.first_limit_down_time).slice(11, 19) : '',
          price_fmt: num(row.latest_price),
          zt_price_fmt: num(row.zt_price),
          dt_price_fmt: num(row.dt_price),
          chg_fmt: num(row.changpercent),
          amount_yi: yi(row.tradingamount),
          up_amount_yi: yi(row.limit_up_price_trade_amount),
          down_amount_yi: yi(row.limit_down_price_trade_amount),
          limit_state_text: states.join(' / '),
        }
      })
    },
  },
  mounted() {
    this.load()
    this.refreshTimer = window.setInterval(() => this.load(), 5000)
    window.addEventListener('resize', this._onResize)
  },
  beforeDestroy() {
    if (this.refreshTimer) window.clearInterval(this.refreshTimer)
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    _onResize() {
      this.$forceUpdate()
    },
    params() {
      const params = {
        is_test: this.isTest ? 'test_' : '',
        direction: this.direction,
        status: this.status,
        limit: this.limit,
      }
      if (this.tradeDateInput) params.trade_date = this.tradeDateInput
      if (this.keyword) params.keyword = this.keyword
      return params
    },
    async load() {
      if (this.loading) return
      this.loading = true
      try {
        const data = await getPriceLimitState(this.params())
        if (!data.ok) {
          this.$message.error(data.error || '加载失败')
          return
        }
        this.tradeDate = data.trade_date || ''
        this.summary = data.summary || {}
        this.rows = data.rows || []
      } catch (err) {
        console.error(err)
        this.$message.error('请求失败：涨跌停接口 /price-limit/state/')
      } finally {
        this.loading = false
      }
    },
    resetAndLoad() {
      this.tradeDate = ''
      this.tradeDateInput = ''
      this.load()
    },
    async archiveToday() {
      try {
        const data = await archivePriceLimitState({
          is_test: this.isTest ? 'test_' : '',
          trade_date: this.tradeDateInput || this.tradeDate,
        })
        if (!data.ok) {
          this.$message.error(data.error || '归档失败')
          return
        }
        this.$message.success(`已归档 ${data.trade_date}，影响行数 ${data.archived}`)
      } catch (err) {
        console.error(err)
        this.$message.error('归档请求失败')
      }
    },
  },
  watch: {
    direction() {
      this.load()
    },
    status() {
      this.load()
    },
  },
}
</script>

<style scoped>
.price-limit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.price-limit-title,
.price-limit-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
