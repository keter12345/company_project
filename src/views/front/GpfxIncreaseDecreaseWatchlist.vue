<template>
  <div>
    <el-card class="gpfx-card">
      <div slot="header" class="gpfx-header">
        <div class="gpfx-title">
          <span>gpfx 增减持监控</span>
          <el-tag style="margin-left: 10px;" type="info">共 {{ total }} 只</el-tag>
        </div>
        <div class="gpfx-toolbar">
          <el-input
            v-model="keyword"
            clearable
            size="mini"
            placeholder="代码/名称/股东"
            style="width: 170px;"
            @keyup.enter.native="query"
          />
          <el-select v-model="actionType" clearable size="mini" placeholder="类型" style="width: 100px;">
            <el-option label="减持" value="减持" />
            <el-option label="增持" value="增持" />
          </el-select>
          <el-select v-model="status" clearable size="mini" placeholder="状态" style="width: 140px;">
            <el-option label="减持即将结束" value="减持即将结束" />
            <el-option label="刚减持完毕" value="刚减持完毕" />
            <el-option label="正在减持" value="正在减持" />
            <el-option label="正在增持" value="正在增持" />
          </el-select>
          <el-input-number
            v-model="pageSize"
            size="mini"
            :min="1"
            :max="500"
            :step="10"
            controls-position="right"
            style="width: 120px;"
            @change="handlePageSizeInput"
          />
          <el-button type="primary" size="mini" @click="query">查询</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="rowsFormatted"
        stripe
        size="mini"
        :height="tableHeight"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="watch_status" label="状态" width="115" sortable="custom">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="statusTagType(row.watch_status)">{{ row.watch_status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ts_code" label="代码" width="95" sortable="custom" />
        <el-table-column prop="ts_name" label="名称" width="110" sortable="custom" />
        <el-table-column prop="latest_price_fmt" label="最新价" width="90" align="right" />
        <el-table-column prop="changpercent" label="涨跌幅(%)" width="100" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ row.changpercent_fmt }}</template>
        </el-table-column>
        <el-table-column prop="swing" label="振幅(%)" width="90" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ row.swing_fmt }}</template>
        </el-table-column>
        <el-table-column prop="turnoverrate" label="换手率(%)" width="100" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ row.turnoverrate_fmt }}</template>
        </el-table-column>
        <el-table-column prop="tradingamount" label="成交额(亿)" width="110" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ row.tradingamount_yi }}</template>
        </el-table-column>
        <el-table-column prop="action_type" label="类型" width="80" />
        <el-table-column prop="days_to_end" label="距结束" width="85" align="right" sortable="custom">
          <template slot-scope="{ row }">
            <span>{{ daysLabel(row.days_to_end) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="start_date_label" label="开始日" width="100" />
        <el-table-column prop="end_date" label="结束日" width="100" sortable="custom">
          <template slot-scope="{ row }">{{ row.end_date_label }}</template>
        </el-table-column>
        <el-table-column prop="reduction_ratio" label="比例(%)" width="90" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ row.reduction_ratio_fmt }}</template>
        </el-table-column>
        <el-table-column prop="reduction_shares" label="股数(万)" width="100" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ row.reduction_shares_wan }}</template>
        </el-table-column>
        <el-table-column prop="plan_count" label="计划数" width="85" align="right" sortable="custom" />
        <el-table-column prop="active_decrease_count" label="进行减持" width="90" align="right" />
        <el-table-column prop="active_increase_count" label="进行增持" width="90" align="right" />
        <el-table-column prop="holder_identities_label" label="股东类型" min-width="150" show-overflow-tooltip />
        <el-table-column prop="holder_names_label" label="股东" min-width="170" show-overflow-tooltip />
        <el-table-column prop="content" label="计划内容" min-width="360" show-overflow-tooltip />
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="prev, pager, next, jumper, total"
          :current-page="page"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { getGpfxIncreaseDecreaseWatchlist } from '../../api/stockshow'

export default {
  name: 'GpfxIncreaseDecreaseWatchlist',
  data() {
    return {
      keyword: '',
      actionType: '',
      status: '',
      page: 1,
      pageSize: 50,
      total: 0,
      sortProp: 'status_priority',
      sortOrder: 'ascending',
      rows: [],
      loading: false,
    }
  },
  computed: {
    tableHeight() {
      return Math.max(420, window.innerHeight - 220)
    },
    rowsFormatted() {
      return (this.rows || []).map(row => ({
        ...row,
        latest_price_fmt: this.num(row.latest_price),
        changpercent_fmt: this.num(row.changpercent),
        swing_fmt: this.num(row.swing),
        turnoverrate_fmt: this.num(row.turnoverrate),
        tradingamount_yi: this.yi(row.tradingamount),
        reduction_ratio_fmt: this.num(row.reduction_ratio),
        reduction_shares_wan: this.wan(row.reduction_shares),
        start_date_label: row.start_date ? String(row.start_date).slice(0, 10) : '',
        end_date_label: row.end_date ? String(row.end_date).slice(0, 10) : '',
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
    num(v, digits = 2) {
      const n = Number(v)
      if (Number.isNaN(n)) return ''
      return n.toFixed(digits)
    },
    yi(v) {
      const n = Number(v)
      if (Number.isNaN(n)) return ''
      return (n / 1e8).toFixed(2)
    },
    wan(v) {
      const n = Number(v)
      if (Number.isNaN(n)) return ''
      return (n / 10000).toFixed(2)
    },
    daysLabel(v) {
      const n = Number(v)
      if (Number.isNaN(n)) return ''
      if (n > 0) return `${n}天`
      if (n === 0) return '今天'
      return `已过${Math.abs(n)}天`
    },
    statusTagType(status) {
      if (status === '减持即将结束') return 'danger'
      if (status === '刚减持完毕') return 'warning'
      if (status === '正在减持') return 'info'
      if (status === '正在增持') return 'success'
      return ''
    },
    load() {
      this.loading = true
      getGpfxIncreaseDecreaseWatchlist({
        keyword: this.keyword,
        action_type: this.actionType,
        status: this.status,
        page: this.page,
        page_size: this.pageSize,
        sort_prop: this.sortProp,
        sort_order: this.sortOrder,
      }).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '加载失败')
          return
        }
        this.rows = data.rows || []
        this.total = data.total || 0
        this.page = data.page || this.page
        this.pageSize = data.page_size || this.pageSize
      }).catch(err => {
        console.error(err)
        this.$message.error('请求失败：增减持监控接口 /gpfx/increase-decrease-watchlist/')
      }).finally(() => {
        this.loading = false
      })
    },
    query() {
      this.page = 1
      this.load()
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop || 'status_priority'
      this.sortOrder = order || 'ascending'
      this.page = 1
      this.load()
    },
    handlePageChange(page) {
      this.page = page
      this.load()
    },
    handlePageSizeInput() {
      this.page = 1
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
.gpfx-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.pager {
  padding-top: 10px;
  text-align: right;
}
</style>
