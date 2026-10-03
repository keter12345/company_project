<template>
  <div>
    <el-card class="gpfx-card">
      <div slot="header" class="gpfx-header">
        <div class="gpfx-title">
          <span>gpfx 异动概念查询</span>
          <el-tag style="margin-left: 10px;" type="info">{{ eventDate || activeDate }} 共 {{ total }} 个</el-tag>
        </div>
        <div class="gpfx-toolbar">
          <el-input
            v-model="keyword"
            clearable
            size="mini"
            placeholder="异动名称"
            style="width: 180px;"
            @keyup.enter.native="query"
          />
          <el-date-picker
            v-model="eventDate"
            type="date"
            size="mini"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            placeholder="异动日期"
            clearable
            style="width: 150px;"
          />
          <el-select v-model="moveType" clearable size="mini" placeholder="异动类型" style="width: 130px;">
            <el-option label="上涨异动" value="上涨异动" />
            <el-option label="下跌异动" value="下跌异动" />
            <el-option label="中性异动" value="中性异动" />
          </el-select>
          <el-checkbox v-model="includeNoise" size="mini">包含通用原因</el-checkbox>
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
        :data="rowsFormatted"
        stripe
        size="mini"
        :height="tableHeight"
        :default-sort="{ prop: 'yidong_time_label', order: 'descending' }"
        style="width: 100%"
        @sort-change="handleSortChange"
        @row-click="openDetail"
      >
        <el-table-column prop="yidong_name" label="异动名称" min-width="220" sortable="custom">
          <template slot-scope="{ row }">
            <el-link type="primary" @click.stop="openDetail(row)">{{ row.yidong_name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="raw_yidong_names_label" label="合并原词" min-width="220" show-overflow-tooltip />
        <el-table-column prop="yidong_time_label" label="异动时间" width="145" sortable="custom" />
        <el-table-column prop="yidong_stock_count" label="当天异动股" width="120" align="right" sortable="custom" />
        <el-table-column prop="related_stock_count" label="概念关联股" width="120" align="right" sortable="custom" />
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

    <el-dialog
      :visible.sync="detailVisible"
      :title="detailTitle"
      width="88%"
      top="4vh"
    >
      <div class="detail-toolbar">
        <el-checkbox
          v-model="detailIncludeNoise"
          size="mini"
          @change="reloadDetail"
        >包含通用原因</el-checkbox>
        <el-tag v-if="detailRawNamesLabel" size="mini" type="info">{{ detailRawNamesLabel }}</el-tag>
      </div>
      <div class="section-title">当天已提示异动股票</div>
      <el-table :data="alertedRowsFormatted" stripe size="mini" height="300">
        <el-table-column prop="ts_code" label="代码" width="95" />
        <el-table-column prop="ts_name" label="名称" width="105" />
        <el-table-column prop="yidong_time_label" label="异动时间" width="135" />
        <el-table-column prop="tradingamount_yi" label="成交额(亿)" width="110" align="right" />
        <el-table-column prop="changpercent_fmt" label="涨跌幅(%)" width="100" align="right" />
        <el-table-column prop="turnoverrate_fmt" label="换手率(%)" width="100" align="right" />
        <el-table-column prop="latest_title" label="最新异动标题" min-width="360" show-overflow-tooltip />
      </el-table>

      <el-divider />

      <div class="section-title">历史关联但今天暂未提示异动股票</div>
      <el-table :data="relatedRowsFormatted" stripe size="mini" height="300">
        <el-table-column prop="ts_code" label="代码" width="95" />
        <el-table-column prop="ts_name" label="名称" width="105" />
        <el-table-column prop="last_relation_time_label" label="最近关联" width="135" />
        <el-table-column prop="relation_event_count" label="关联次数" width="90" align="right" />
        <el-table-column prop="tradingamount_yi" label="成交额(亿)" width="110" align="right" />
        <el-table-column prop="changpercent_fmt" label="涨跌幅(%)" width="100" align="right" />
        <el-table-column prop="turnoverrate_fmt" label="换手率(%)" width="100" align="right" />
        <el-table-column prop="latest_relation_title" label="最近关联标题" min-width="360" show-overflow-tooltip />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { getGpfxYidongConcepts, getGpfxYidongConceptDetail } from '../../api/stockshow'

export default {
  name: 'GpfxYidongConcepts',
  data() {
    return {
      keyword: '',
      eventDate: '',
      moveType: '',
      includeNoise: false,
      activeDate: '',
      page: 1,
      pageSize: 50,
      total: 0,
      sortProp: 'yidong_time_label',
      sortOrder: 'descending',
      rows: [],
      detailVisible: false,
      detailConcept: {},
      detailIncludeNoise: false,
      detailRawNames: [],
      alertedRows: [],
      relatedRows: [],
    }
  },
  computed: {
    tableHeight() {
      return Math.max(420, window.innerHeight - 220)
    },
    detailTitle() {
      const concept = this.detailConcept || {}
      const name = concept.yidong_name || ''
      const date = this.activeDate || this.eventDate || ''
      return `${name} ${date}`
    },
    rowsFormatted() {
      return (this.rows || []).map(row => ({
        ...row,
        yidong_time_label: row.yidong_time ? String(row.yidong_time).slice(5, 16) : '',
      }))
    },
    alertedRowsFormatted() {
      return this.formatStockRows(this.alertedRows, 'yidong_time')
    },
    relatedRowsFormatted() {
      return this.formatStockRows(this.relatedRows, 'last_relation_time')
    },
    detailRawNamesLabel() {
      const names = this.detailRawNames || []
      if (!names.length) return ''
      const label = names.slice(0, 8).join('、')
      return names.length > 8 ? `${label}...` : label
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
    formatStockRows(rows, timeField) {
      return (rows || []).map(row => ({
        ...row,
        [`${timeField}_label`]: row[timeField] ? String(row[timeField]).slice(5, 16) : '',
        tradingamount_yi: this.yi(row.tradingamount),
        changpercent_fmt: this.num(row.changpercent),
        turnoverrate_fmt: this.num(row.turnoverrate),
      }))
    },
    load() {
      const params = {
        keyword: this.keyword,
        event_date: this.eventDate,
        move_type: this.moveType,
        include_noise: this.includeNoise ? '1' : '0',
        page: this.page,
        page_size: this.pageSize,
        sort_prop: this.sortProp,
        sort_order: this.sortOrder,
      }
      getGpfxYidongConcepts(params).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '加载失败')
          return
        }
        this.rows = data.rows || []
        this.total = data.total || 0
        this.page = data.page || this.page
        this.pageSize = data.page_size || this.pageSize
        this.activeDate = data.event_date || this.eventDate
      }).catch(err => {
        console.error(err)
        this.$message.error('请求失败：异动概念接口 /gpfx/yidong-concepts/')
      })
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop || 'yidong_time_label'
      this.sortOrder = order || 'descending'
      this.page = 1
      this.load()
    },
    query() {
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
    openDetail(row) {
      if (!row || !row.yidong_name) return
      this.detailConcept = row
      this.detailIncludeNoise = false
      this.detailVisible = true
      this.loadDetail(row)
    },
    reloadDetail() {
      if (this.detailConcept && this.detailConcept.yidong_name) {
        this.loadDetail(this.detailConcept)
      }
    },
    loadDetail(row) {
      const params = {
        yidong_name: row.yidong_name,
        raw_yidong_names: this.detailIncludeNoise ? '' : (row.raw_yidong_names || []).join('、'),
        event_date: this.activeDate || this.eventDate,
        move_type: this.moveType,
        include_noise: this.detailIncludeNoise ? '1' : '0',
      }
      getGpfxYidongConceptDetail(params).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '加载明细失败')
          return
        }
        this.detailRawNames = data.raw_yidong_names || row.raw_yidong_names || []
        this.alertedRows = data.alerted_rows || []
        this.relatedRows = data.related_rows || []
      }).catch(err => {
        console.error(err)
        this.$message.error('请求失败：异动概念明细接口 /gpfx/yidong-concept-detail/')
      })
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
.section-title {
  font-weight: 600;
  margin: 0 0 8px;
}
.detail-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.pager {
  padding-top: 10px;
  text-align: right;
}
</style>
