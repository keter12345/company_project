<template>
  <div>
    <el-card class="earnings-card">
      <div slot="header" class="earnings-header">
        <div class="earnings-title">
          <span>近期业绩报告</span>
          <el-tag style="margin-left: 10px;" type="info">共 {{ total }} 条</el-tag>
          <el-tag style="margin-left: 8px;" type="warning">{{ startDate }} 至 {{ endDate }}</el-tag>
          <el-tag v-if="currentReportPeriod" style="margin-left: 8px;" type="success">当前主线：{{ currentReportPeriod }}</el-tag>
        </div>
        <div class="earnings-toolbar">
          <el-input
            v-model="keyword"
            clearable
            size="mini"
            placeholder="代码/名称/标题"
            style="width: 170px;"
            @keyup.enter.native="query"
          />
          <el-select v-model="scope" clearable size="mini" placeholder="时间范围" style="width: 120px;" @change="query">
            <el-option label="前后7天" value="all" />
            <el-option label="近7天" value="past" />
            <el-option label="未来7天" value="future" />
          </el-select>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            size="mini"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
            style="width: 240px;"
          />
          <el-select v-model="reportType" clearable size="mini" placeholder="报告类型" style="width: 115px;" @change="query">
            <el-option label="中报" value="中报" />
            <el-option label="年报" value="年报" />
            <el-option label="一季报" value="一季报" />
            <el-option label="三季报" value="三季报" />
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
        :default-sort="{ prop: 'timekey', order: 'descending' }"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="date_scope" label="影响" width="90">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="scopeTagType(row.date_scope)">{{ row.date_scope }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timekey" label="公告日" width="100" sortable="custom">
          <template slot-scope="{ row }">{{ row.timekey_label }}</template>
        </el-table-column>
        <el-table-column prop="ts_code" label="代码" width="95" />
        <el-table-column prop="ts_name" label="名称" width="105" />
        <el-table-column prop="report_type" label="报告类型" width="90" />
        <el-table-column prop="report_period" label="报告期" width="120" show-overflow-tooltip />
        <el-table-column prop="source_status" label="状态" width="90">
          <template slot-scope="{ row }">
            <el-tag size="mini" :type="row.source_kind === 'disclosure' ? 'success' : 'warning'">
              {{ row.source_status || row.source }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="display_note" label="提示" width="175" show-overflow-tooltip>
          <template slot-scope="{ row }">
            <span :class="{ 'report-note': row.display_note }">{{ row.display_note }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="eps" label="EPS" width="80" align="right">
          <template slot-scope="{ row }">
            <span :class="valueClass(row.eps)">{{ num(row.eps, 4) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="净利润(万)" width="110" align="right">
          <template slot-scope="{ row }">
            <span :class="valueClass(row.profit)">{{ num(row.profit) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="forecast_range" label="预告区间" width="220" show-overflow-tooltip>
          <template slot-scope="{ row }">{{ row.forecast_range }}</template>
        </el-table-column>
        <el-table-column prop="yoy_growth" label="同比(%)" width="90" align="right">
          <template slot-scope="{ row }">
            <span :class="valueClass(row.yoy_growth)">{{ num(row.yoy_growth) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="latest_price" label="最新价" width="90" align="right">
          <template slot-scope="{ row }">{{ num(row.latest_price) }}</template>
        </el-table-column>
        <el-table-column prop="changpercent" label="涨跌幅(%)" width="100" align="right">
          <template slot-scope="{ row }">
            <span :class="valueClass(row.changpercent)">{{ num(row.changpercent) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="tradingamount" label="成交额(亿)" width="105" align="right">
          <template slot-scope="{ row }">{{ yi(row.tradingamount) }}</template>
        </el-table-column>
        <el-table-column prop="swing" label="振幅(%)" width="90" align="right">
          <template slot-scope="{ row }">{{ num(row.swing) }}</template>
        </el-table-column>
        <el-table-column prop="turnoverrate" label="换手率(%)" width="100" align="right">
          <template slot-scope="{ row }">{{ num(row.turnoverrate) }}</template>
        </el-table-column>
        <el-table-column prop="title" label="公告标题" min-width="260" sortable="custom" show-overflow-tooltip>
          <template slot="header">
            <span class="sortable-header" @click.stop="toggleTitleSort">
              公告标题
              <i :class="titleSortIconClass"></i>
            </span>
          </template>
          <template slot-scope="{ row }">
            <el-link v-if="isRealLink(row.www)" type="primary" :href="row.www" target="_blank">{{ row.title }}</el-link>
            <span v-else>{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="notice_summary" label="公告摘要" min-width="240" show-overflow-tooltip />
        <el-table-column prop="content" label="业绩内容" min-width="260" show-overflow-tooltip />
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
import { getRecentEarningsReports } from '../../api/notice'

export default {
  name: 'RecentEarningsReports',
  data() {
    return {
      keyword: '',
      scope: 'all',
      dateRange: [],
      reportType: '',
      page: 1,
      pageSize: 50,
      total: 0,
      startDate: '',
      endDate: '',
      rows: [],
      loading: false,
      sortProp: 'timekey',
      sortOrder: 'descending',
      currentReportPeriod: '',
    }
  },
  computed: {
    tableHeight() {
      return Math.max(420, window.innerHeight - 220)
    },
    rowsFormatted() {
      return (this.rows || []).map(row => ({
        ...row,
        timekey_label: row.timekey ? String(row.timekey).slice(0, 10) : '',
      }))
    },
    titleSortIconClass() {
      if (this.sortProp !== 'title') return 'el-icon-d-caret'
      return this.sortOrder === 'ascending' ? 'el-icon-caret-top' : 'el-icon-caret-bottom'
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
    scopeTagType(scope) {
      if (scope === '明日开盘') return 'danger'
      if (scope === '未来影响') return 'warning'
      if (scope === '今日影响') return 'success'
      return 'info'
    },
    valueClass(value) {
      const n = Number(value)
      if (Number.isNaN(n) || n === 0) return ''
      return n > 0 ? 'num-up' : 'num-down'
    },
    isRealLink(url) {
      return url && !String(url).startsWith('javascript:')
    },
    load() {
      this.loading = true
      const params = {
        keyword: this.keyword,
        scope: this.scope || 'all',
        report_type: this.reportType,
        page: this.page,
        page_size: this.pageSize,
        sort_prop: this.sortProp,
        sort_order: this.sortOrder,
      }
      if (this.dateRange && this.dateRange.length === 2) {
        params.start_date = this.dateRange[0]
        params.end_date = this.dateRange[1]
      }
      getRecentEarningsReports(params).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '加载失败')
          return
        }
        this.rows = data.rows || []
        this.total = data.total || 0
        this.page = data.page || this.page
        this.pageSize = data.page_size || this.pageSize
        this.startDate = data.start_date || ''
        this.endDate = data.end_date || ''
        this.currentReportPeriod = data.current_report_period || ''
      }).catch(err => {
        console.error(err)
        this.$message.error('请求失败：近期业绩报告接口 /getRecentEarningsReports/')
      }).finally(() => {
        this.loading = false
      })
    },
    query() {
      this.page = 1
      this.load()
    },
    handlePageChange(page) {
      this.page = page
      this.load()
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop || 'timekey'
      this.sortOrder = order || 'descending'
      this.page = 1
      this.load()
    },
    toggleTitleSort() {
      this.sortProp = 'title'
      this.sortOrder = this.sortOrder === 'ascending' ? 'descending' : 'ascending'
      this.page = 1
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
.earnings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.earnings-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.pager {
  padding-top: 10px;
  text-align: right;
}
.sortable-header {
  cursor: pointer;
  user-select: none;
}
.sortable-header i {
  margin-left: 4px;
  color: #909399;
}
.num-up {
  color: #f56c6c;
  font-weight: 600;
}
.num-down {
  color: #67c23a;
  font-weight: 600;
}
.report-note {
  color: #e6a23c;
}
</style>
