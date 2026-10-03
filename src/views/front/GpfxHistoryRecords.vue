<template>
  <div>
    <el-card class="gpfx-card">
      <div slot="header" class="gpfx-header">
        <div class="gpfx-title">
          <span>{{ title }}</span>
          <el-tag style="margin-left: 10px;" type="info">表：{{ tableName || '-' }}</el-tag>
        </div>
        <div class="gpfx-toolbar">
          <el-switch
            v-model="isTest"
            active-text="测试表"
            inactive-text="正式表"
            @change="resetAndLoad"
          />
          <el-date-picker
            v-model="date"
            type="date"
            size="mini"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            placeholder="交易日期"
            clearable
            style="width: 150px;"
          />
          <el-input v-model="keyword" size="mini" placeholder="代码/名称" clearable style="width: 150px;" />
          <el-input v-model="minChangpercent" size="mini" placeholder="最低涨幅%" clearable style="width: 105px;" />
          <el-input v-model="minAmountRatioPrevDay" size="mini" placeholder="较昨放量" clearable style="width: 105px;" />
          <el-input v-model="minAmountRatioMa20" size="mini" placeholder="20日放量" clearable style="width: 105px;" />
          <el-input v-model="limit" size="mini" placeholder="数量" style="width: 80px;" />
          <el-button type="primary" size="mini" @click="load">查询</el-button>
        </div>
      </div>

      <div class="gpfx-filters">
        <template v-if="kind === 'stock'">
          <el-select v-model="stableFirstVolumeFlag" clearable size="mini" placeholder="30日首次" style="width: 120px;">
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
          <el-input v-model="maxStableFirstVolumeDays" size="mini" placeholder="放量后天数<=" clearable style="width: 130px;" />
          <el-input v-model="minStableFirstVolumeReturn" size="mini" placeholder="放量后涨幅>=" clearable style="width: 130px;" />
          <el-input v-model="minTurnoverrate" size="mini" placeholder="最低换手" clearable style="width: 110px;" />
          <el-checkbox v-model="lowPositionFlag">低位</el-checkbox>
          <el-checkbox v-model="amountBreakout20d">20日成交突破</el-checkbox>
          <el-checkbox v-model="limitUp">涨停</el-checkbox>
        </template>
        <template v-else>
          <el-input v-model="minUpRatio" size="mini" placeholder="上涨比例>=" clearable style="width: 120px;" />
          <el-input v-model="minZtCount" size="mini" placeholder="涨停家数>=" clearable style="width: 120px;" />
          <el-input v-model="maxRankChangpercent" size="mini" placeholder="涨幅排名<=" clearable style="width: 120px;" />
          <el-input v-model="maxRankAmountRatio" size="mini" placeholder="放量排名<=" clearable style="width: 120px;" />
          <el-input v-model="maxRankZtCount" size="mini" placeholder="涨停排名<=" clearable style="width: 120px;" />
          <el-input v-model="leaderKeyword" size="mini" placeholder="龙头代码/名称" clearable style="width: 150px;" />
        </template>
      </div>

      <el-table
        :data="rowsFormatted"
        stripe
        size="mini"
        :height="tableHeight"
        style="width: 100%"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
      >
        <template v-if="kind === 'stock'">
          <el-table-column prop="rd_datetime" label="日期" width="100" sortable="custom" />
          <el-table-column prop="ts_code" label="代码" width="95" sortable="custom" />
          <el-table-column prop="ts_name" label="名称" width="110" sortable="custom" />
          <el-table-column prop="industry_name" label="所属行业" width="130" sortable="custom" show-overflow-tooltip />
          <el-table-column prop="changpercent" label="涨幅%" width="80" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.changpercent_fmt }}</template>
          </el-table-column>
          <el-table-column prop="turnoverrate" label="换手" width="80" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.turnoverrate_fmt }}</template>
          </el-table-column>
          <el-table-column prop="tradingamount" label="成交额(亿)" width="95" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.amount_yi }}</template>
          </el-table-column>
          <el-table-column prop="amount_ratio_prev_day" label="交易倍数" width="85" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.amount_ratio_prev_day_fmt }}</template>
          </el-table-column>
          <el-table-column prop="amount_ratio_ma5" label="量比5" width="75" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.amount_ratio_ma5_fmt }}</template>
          </el-table-column>
          <el-table-column prop="amount_ratio_ma10" label="量比10" width="75" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.amount_ratio_ma10_fmt }}</template>
          </el-table-column>
          <el-table-column prop="amount_ratio_ma20" label="量比20" width="80" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.amount_ratio_ma20_fmt }}</template>
          </el-table-column>
          <el-table-column prop="position_label" label="位置" width="90" sortable="custom" />
          <el-table-column prop="setup_label" label="企稳/形态" width="120" sortable="custom" />
          <el-table-column prop="stable_volume_seq_30d" label="30日放量" width="85" sortable="custom">
            <template slot-scope="scope">{{ scope.row.stable_volume_label }}</template>
          </el-table-column>
          <el-table-column prop="stable_first_volume_date" label="首次日期" width="100" sortable="custom" />
          <el-table-column prop="stable_first_volume_days" label="放量后天数" width="95" align="right" sortable="custom" />
          <el-table-column prop="stable_first_volume_return" label="放量后涨幅%" width="105" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.stable_first_volume_return_fmt }}</template>
          </el-table-column>
          <el-table-column prop="limit_display_label" label="涨跌停" width="80" sortable="custom" />
        </template>
        <template v-else>
          <el-table-column prop="rd_datetime" label="日期" width="100" sortable="custom" />
          <el-table-column prop="bk_code" label="代码" width="95" sortable="custom" />
          <el-table-column prop="bk_name" label="名称" width="150" sortable="custom" />
          <el-table-column prop="member_count" label="成分数" width="75" align="right" sortable="custom" />
          <el-table-column prop="avg_changpercent" label="均涨幅%" width="85" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.avg_changpercent_fmt }}</template>
          </el-table-column>
          <el-table-column prop="up_ratio" label="上涨比例%" width="95" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.up_ratio_fmt }}</template>
          </el-table-column>
          <el-table-column prop="zt_count" label="涨停家数" width="85" align="right" sortable="custom" />
          <el-table-column prop="total_tradingamount" label="成交额(亿)" width="95" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.amount_yi }}</template>
          </el-table-column>
          <el-table-column prop="amount_ratio_ma20" label="量比20" width="80" align="right" sortable="custom">
            <template slot-scope="scope">{{ scope.row.amount_ratio_ma20_fmt }}</template>
          </el-table-column>
          <el-table-column prop="rank_changpercent" label="涨幅排名" width="85" align="right" sortable="custom" />
          <el-table-column prop="rank_amount_ratio" label="放量排名" width="85" align="right" sortable="custom" />
          <el-table-column prop="rank_zt_count" label="涨停排名" width="85" align="right" sortable="custom" />
          <el-table-column prop="leader_ts_name" label="龙头" min-width="160" sortable="custom">
            <template slot-scope="scope">{{ scope.row.leader_text }}</template>
          </el-table-column>
          <el-table-column :prop="stateLabelProp" label="状态" width="120" sortable="custom" />
        </template>
      </el-table>
    </el-card>

    <el-dialog
      :title="detailTitle"
      :visible.sync="detailVisible"
      width="1120px"
      top="5vh"
      append-to-body
    >
      <el-tabs v-model="detailTab">
        <el-tab-pane label="概念历史" name="concepts">
          <el-table :data="detailConceptRowsFormatted" stripe size="mini" height="430">
            <el-table-column prop="rd_datetime" label="日期" width="100" />
            <el-table-column prop="bk_code" label="概念代码" width="95" />
            <el-table-column prop="bk_name" label="概念名称" width="150" show-overflow-tooltip />
            <el-table-column prop="avg_changpercent_fmt" label="均涨幅%" width="85" align="right" />
            <el-table-column prop="up_ratio_fmt" label="上涨比例%" width="95" align="right" />
            <el-table-column prop="zt_count" label="涨停家数" width="85" align="right" />
            <el-table-column prop="amount_yi" label="成交额(亿)" width="95" align="right" />
            <el-table-column prop="amount_ratio_ma20_fmt" label="量比20" width="80" align="right" />
            <el-table-column prop="rank_changpercent" label="涨幅排名" width="85" align="right" />
            <el-table-column prop="rank_amount_ratio" label="放量排名" width="85" align="right" />
            <el-table-column prop="leader_text" label="龙头" min-width="150" show-overflow-tooltip />
            <el-table-column prop="concept_state_label" label="状态" width="100" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="历史异动" name="yidong">
          <el-table :data="detailYidongRows" stripe size="mini" height="430">
            <el-table-column prop="event_date" label="日期" width="105" />
            <el-table-column prop="move_type" label="类型" width="85" />
            <el-table-column prop="title" label="异动标题" min-width="360" show-overflow-tooltip />
            <el-table-column prop="title_part1" label="原因1" width="130" show-overflow-tooltip />
            <el-table-column prop="title_part2" label="原因2" width="130" show-overflow-tooltip />
            <el-table-column prop="title_part3" label="原因3" width="130" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import { getGpfxHistoryRecords, getGpfxHistoryStockDetail } from '@/api/stockshow'

export default {
  name: 'GpfxHistoryRecords',
  data() {
    return {
      title: '历史记录',
      tableName: '',
      isTest: true,
      date: '',
      keyword: '',
      minChangpercent: '',
      minAmountRatioPrevDay: '',
      minAmountRatioMa20: '',
      limit: 300,
      stableFirstVolumeFlag: '',
      maxStableFirstVolumeDays: '',
      minStableFirstVolumeReturn: '',
      minTurnoverrate: '',
      lowPositionFlag: false,
      amountBreakout20d: false,
      limitUp: false,
      minUpRatio: '',
      minZtCount: '',
      maxRankChangpercent: '',
      maxRankAmountRatio: '',
      maxRankZtCount: '',
      leaderKeyword: '',
      sortBy: '',
      sortOrder: '',
      rows: [],
      detailVisible: false,
      detailLoading: false,
      detailTab: 'concepts',
      detailStock: null,
      detailConceptRows: [],
      detailYidongRows: [],
    }
  },
  computed: {
    kind() {
      return this.$route.meta.kind || 'stock'
    },
    stateLabelProp() {
      return this.kind === 'industry' ? 'industry_state_label' : 'concept_state_label'
    },
    tableHeight() {
      return Math.max(360, window.innerHeight - 245)
    },
    detailTitle() {
      if (!this.detailStock) return '股票历史详情'
      return `${this.detailStock.ts_code || ''} ${this.detailStock.ts_name || ''}`
    },
    detailConceptRowsFormatted() {
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
      return (this.detailConceptRows || []).map(r => ({
        ...r,
        avg_changpercent_fmt: num(r.avg_changpercent),
        up_ratio_fmt: num(Number(r.up_ratio) * 100),
        amount_ratio_ma20_fmt: num(r.amount_ratio_ma20),
        amount_yi: yi(r.total_tradingamount),
        leader_text: [r.leader_ts_code, r.leader_ts_name].filter(Boolean).join(' '),
      }))
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
      return (this.rows || []).map(r => ({
        ...r,
        changpercent_fmt: num(r.changpercent),
        avg_changpercent_fmt: num(r.avg_changpercent),
        turnoverrate_fmt: num(r.turnoverrate),
        amount_ratio_prev_day_fmt: num(r.amount_ratio_prev_day),
        amount_ratio_ma5_fmt: num(r.amount_ratio_ma5),
        amount_ratio_ma10_fmt: num(r.amount_ratio_ma10),
        amount_ratio_ma20_fmt: num(r.amount_ratio_ma20),
        stable_first_volume_return_fmt: num(r.stable_first_volume_return),
        up_ratio_fmt: num(Number(r.up_ratio) * 100),
        amount_yi: yi(r.tradingamount || r.total_tradingamount),
        stable_first_volume_flag_label: String(r.stable_first_volume_flag) === '1' ? '是' : '',
        stable_volume_label: this.formatStableVolumeLabel(r),
        leader_text: [r.leader_ts_code, r.leader_ts_name].filter(Boolean).join(' '),
      }))
    },
  },
  mounted() {
    this.load()
    window.addEventListener('resize', this._onResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._onResize)
  },
  methods: {
    _onResize() {
      this.$forceUpdate()
    },
    resetAndLoad() {
      this.date = ''
      this.load()
    },
    formatStableVolumeLabel(row) {
      const seq = Number(row.stable_volume_seq_30d)
      if (seq === 1) return '首次'
      if (seq > 1) return `第${seq}次`
      return String(row.stable_first_volume_flag) === '1' ? '跟踪中' : ''
    },
    async load() {
      const params = {
        kind: this.kind,
        scope: this.isTest ? 'test' : 'prod',
        limit: this.limit,
      }
      if (this.sortBy && this.sortOrder) {
        params.sort_by = this.sortBy
        params.sort_order = this.sortOrder
      }
      if (this.date) params.date = this.date
      if (this.keyword) params.keyword = this.keyword
      if (this.minChangpercent) params.min_changpercent = this.minChangpercent
      if (this.minAmountRatioPrevDay) params.min_amount_ratio_prev_day = this.minAmountRatioPrevDay
      if (this.minAmountRatioMa20) params.min_amount_ratio_ma20 = this.minAmountRatioMa20
      if (this.kind === 'stock') {
        if (this.stableFirstVolumeFlag !== '') params.stable_first_volume_flag = this.stableFirstVolumeFlag
        if (this.maxStableFirstVolumeDays) params.max_stable_first_volume_days = this.maxStableFirstVolumeDays
        if (this.minStableFirstVolumeReturn) params.min_stable_first_volume_return = this.minStableFirstVolumeReturn
        if (this.minTurnoverrate) params.min_turnoverrate = this.minTurnoverrate
        if (this.lowPositionFlag) params.low_position_flag = 1
        if (this.amountBreakout20d) params.amount_breakout_20d = 1
        if (this.limitUp) params.limit_up = 1
      } else {
        if (this.minUpRatio) params.min_up_ratio = Number(this.minUpRatio) / 100
        if (this.minZtCount) params.min_zt_count = this.minZtCount
        if (this.maxRankChangpercent) params.max_rank_changpercent = this.maxRankChangpercent
        if (this.maxRankAmountRatio) params.max_rank_amount_ratio = this.maxRankAmountRatio
        if (this.maxRankZtCount) params.max_rank_zt_count = this.maxRankZtCount
        if (this.leaderKeyword) params.leader_keyword = this.leaderKeyword
      }
      let res
      try {
        res = await getGpfxHistoryRecords(params)
      } catch (err) {
        const data = err && err.response && err.response.data
        this.$message.error((data && data.error) || '请求失败')
        this.rows = []
        return
      }
      if (!res.ok) {
        this.$message.error(res.error || '加载失败')
        this.rows = []
        return
      }
      this.title = res.title || '历史记录'
      this.tableName = res.table_name || ''
      this.rows = res.rows || []
    },
    handleSortChange({ prop, order }) {
      if (prop === 'industry_name') {
        this.sortLocalRows(prop, order)
        return
      }
      this.sortBy = prop || ''
      this.sortOrder = order === 'ascending' ? 'asc' : (order === 'descending' ? 'desc' : '')
      this.load()
    },
    sortLocalRows(prop, order) {
      if (!order) {
        this.load()
        return
      }
      const direction = order === 'ascending' ? 1 : -1
      this.rows = (this.rows || []).slice().sort((a, b) => {
        const av = a[prop] || ''
        const bv = b[prop] || ''
        return String(av).localeCompare(String(bv), 'zh-Hans-CN') * direction
      })
    },
    async handleRowClick(row) {
      if (this.kind !== 'stock' || !row || !row.ts_code) return
      this.detailVisible = true
      this.detailTab = 'concepts'
      this.detailStock = row
      this.detailConceptRows = []
      this.detailYidongRows = []
      this.detailLoading = true
      try {
        const res = await getGpfxHistoryStockDetail({
          ts_code: row.ts_code,
          ts_name: row.ts_name,
          scope: this.isTest ? 'test' : 'prod',
        })
        if (!res.ok) {
          this.$message.error(res.error || '加载股票详情失败')
          return
        }
        this.detailConceptRows = res.concept_rows || []
        this.detailYidongRows = res.yidong_rows || []
      } catch (err) {
        const data = err && err.response && err.response.data
        this.$message.error((data && data.error) || '加载股票详情失败')
      } finally {
        this.detailLoading = false
      }
    },
  },
  watch: {
    '$route.meta.kind'() {
      this.title = '历史记录'
      this.tableName = ''
      this.rows = []
      this.load()
    },
  },
}
</script>

<style scoped>
.gpfx-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.gpfx-toolbar,
.gpfx-filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.gpfx-filters {
  margin-bottom: 10px;
}
</style>
