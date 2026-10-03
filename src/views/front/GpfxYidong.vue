<template>
  <div>
    <el-card class="gpfx-card">
      <div slot="header" class="gpfx-header">
        <div class="gpfx-title">
          <span>gpfx 股票异动查询</span>
          <el-tag style="margin-left: 10px;" type="info">共 {{ total }} 只</el-tag>
        </div>
        <div class="gpfx-toolbar">
          <el-input
            v-model="keyword"
            clearable
            size="mini"
            placeholder="股票名称/代码"
            style="width: 170px;"
            @keyup.enter.native="query"
          />
          <el-select v-model="moveType" clearable size="mini" placeholder="异动类型" style="width: 130px;">
            <el-option label="上涨异动" value="上涨异动" />
            <el-option label="下跌异动" value="下跌异动" />
            <el-option label="中性异动" value="中性异动" />
          </el-select>
          <el-input
            v-model="eventKeyword"
            clearable
            size="mini"
            placeholder="异动关键词"
            style="width: 170px;"
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
        :default-sort="{ prop: 'latest_yidong_time_label', order: 'descending' }"
        style="width: 100%"
        @sort-change="handleSortChange"
        @row-click="openDetail"
      >
        <el-table-column prop="ts_code" label="代码" width="95" sortable="custom" />
        <el-table-column prop="ts_name" label="名称" width="110" sortable="custom">
          <template slot-scope="{ row }">
            <el-link type="primary" @click.stop="openDetail(row)">{{ row.ts_name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="rd_datetime_label" label="交易时间" width="135" sortable="custom" />
        <el-table-column prop="tradingamount_yi" label="成交额(亿)" width="110" align="right" sortable="custom" />
        <el-table-column prop="changpercent_fmt" label="涨跌幅(%)" width="105" align="right" sortable="custom" />
        <el-table-column prop="swing_fmt" label="振幅(%)" width="95" align="right" sortable="custom" />
        <el-table-column prop="turnoverrate_fmt" label="换手率(%)" width="105" align="right" sortable="custom" />
        <el-table-column prop="latest_yidong_time_label" label="最新异动" width="135" sortable="custom" />
        <el-table-column prop="today_yidong_count" :label="eventDate ? '当日异动' : '今日异动'" width="95" align="right" sortable="custom" />
        <el-table-column prop="up_count_6m" label="6月上涨" width="95" align="right" sortable="custom" />
        <el-table-column prop="down_count_6m" label="6月下跌" width="95" align="right" sortable="custom" />
        <el-table-column prop="latest_up_time_label" label="上涨时间" width="125" sortable="custom" />
        <el-table-column prop="latest_up_title" label="上涨标题" min-width="260" sortable="custom" show-overflow-tooltip />
        <el-table-column prop="latest_up_part1" label="上涨原因1" min-width="120" sortable="custom" show-overflow-tooltip />
        <el-table-column prop="latest_up_part2" label="上涨原因2" min-width="120" sortable="custom" show-overflow-tooltip />
        <el-table-column prop="latest_up_part3" label="上涨原因3" min-width="120" sortable="custom" show-overflow-tooltip />
        <el-table-column prop="latest_down_time_label" label="下跌时间" width="125" sortable="custom" />
        <el-table-column prop="latest_down_title" label="下跌标题" min-width="260" sortable="custom" show-overflow-tooltip />
        <el-table-column prop="latest_down_part1" label="下跌原因1" min-width="120" sortable="custom" show-overflow-tooltip />
        <el-table-column prop="latest_down_part2" label="下跌原因2" min-width="120" sortable="custom" show-overflow-tooltip />
        <el-table-column prop="latest_down_part3" label="下跌原因3" min-width="120" sortable="custom" show-overflow-tooltip />
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
      width="80%"
      top="5vh"
    >
      <el-table :data="detailRowsFormatted" stripe size="mini" height="560">
        <el-table-column prop="event_date" label="日期" width="100" />
        <el-table-column prop="created_at_label" label="时间" width="145" />
        <el-table-column prop="move_type" label="类型" width="95">
          <template slot-scope="{ row }">
            <el-tag
              size="mini"
              :type="row.move_type === '上涨异动' ? 'danger' : (row.move_type === '下跌异动' ? 'success' : 'info')"
            >
              {{ row.move_type || '异动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="420" />
        <el-table-column prop="title_part4" label="要点" min-width="220" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { getGpfxYidongStocks, getGpfxYidongDetail } from '../../api/stockshow'

export default {
  name: 'GpfxYidong',
  data() {
    return {
      keyword: '',
      moveType: '',
      eventKeyword: '',
      eventDate: '',
      page: 1,
      pageSize: 50,
      total: 0,
      sortProp: 'latest_yidong_time_label',
      sortOrder: 'descending',
      rows: [],
      detailVisible: false,
      detailStock: {},
      detailRows: [],
    }
  },
  computed: {
    tableHeight() {
      return Math.max(420, window.innerHeight - 220)
    },
    detailTitle() {
      const stock = this.detailStock || {}
      return `${stock.ts_name || ''} ${stock.ts_code || ''} 近 6 个月异动`
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
      return (this.rows || []).map(row => ({
        ...row,
        rd_datetime_label: row.rd_datetime ? String(row.rd_datetime).slice(5, 16) : '',
        latest_yidong_time_label: row.latest_yidong_time ? String(row.latest_yidong_time).slice(5, 16) : '',
        latest_up_time_label: row.latest_up_time ? String(row.latest_up_time).slice(5, 16) : '',
        latest_down_time_label: row.latest_down_time ? String(row.latest_down_time).slice(5, 16) : '',
        tradingamount_yi: yi(row.tradingamount),
        changpercent_fmt: num(row.changpercent),
        swing_fmt: num(row.swing),
        turnoverrate_fmt: num(row.turnoverrate),
      }))
    },
    detailRowsFormatted() {
      return (this.detailRows || []).map(row => ({
        ...row,
        created_at_label: row.created_at ? String(row.created_at).slice(5, 16) : '',
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
    load() {
      const params = {
        keyword: this.keyword,
        move_type: this.moveType,
        event_keyword: this.eventKeyword,
        event_date: this.eventDate,
        page: this.page,
        page_size: this.pageSize,
        sort_prop: this.sortProp,
        sort_order: this.sortOrder,
      }
      getGpfxYidongStocks(params).then(data => {
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
        this.$message.error('请求失败：股票异动接口 /gpfx/yidong-stocks/')
      })
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop || 'latest_yidong_time'
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
      if (!row || !row.ts_code) return
      getGpfxYidongDetail({ ts_code: row.ts_code }).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '加载明细失败')
          return
        }
        this.detailStock = data.stock || row
        this.detailRows = data.rows || []
        this.detailVisible = true
      }).catch(err => {
        console.error(err)
        this.$message.error('请求失败：单股异动接口 /gpfx/yidong-detail/')
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
.event-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 4px 0;
}
.event-item {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 18px;
}
.event-time {
  color: #909399;
  width: 76px;
  flex: 0 0 76px;
}
.event-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
