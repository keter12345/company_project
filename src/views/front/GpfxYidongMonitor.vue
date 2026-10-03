<template>
  <div>
    <el-card class="gpfx-card">
      <div slot="header" class="gpfx-header">
        <div class="gpfx-title">
          <span>gpfx 实时异动股票监控</span>
          <el-tag style="margin-left: 10px;" type="info">日期：{{ eventDate || '最新交易日' }}</el-tag>
          <el-tag style="margin-left: 8px;" :type="monitoring ? 'success' : 'warning'">
            {{ monitoring ? '5秒监控中' : '已暂停' }}
          </el-tag>
          <el-tag v-if="serverTime" style="margin-left: 8px;" type="info">{{ serverTime.slice(11, 19) }}</el-tag>
        </div>
        <div class="gpfx-toolbar">
          <el-input
            v-model="keyword"
            clearable
            size="mini"
            placeholder="股票/countnum"
            style="width: 170px;"
            @keyup.enter.native="resetAndLoad"
          />
          <el-select v-model="moveType" clearable size="mini" placeholder="异动类型" style="width: 130px;" @change="resetAndLoad">
            <el-option label="上涨异动" value="上涨异动" />
            <el-option label="下跌异动" value="下跌异动" />
            <el-option label="中性异动" value="中性异动" />
          </el-select>
          <el-date-picker
            v-model="eventDateInput"
            type="date"
            size="mini"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            placeholder="异动日期"
            clearable
            style="width: 150px;"
            @change="resetAndLoad"
          />
          <el-input-number
            v-model="limit"
            size="mini"
            :min="20"
            :max="10000"
            :step="100"
            controls-position="right"
            style="width: 120px;"
            @change="resetAndLoad"
          />
          <el-button :type="monitoring ? 'warning' : 'success'" size="mini" @click="toggleMonitor">
            {{ monitoring ? '暂停' : '开始' }}
          </el-button>
          <el-button size="mini" @click="resetAndLoad">刷新</el-button>
          <el-button size="mini" @click="requestDesktopNotify">桌面通知</el-button>
        </div>
      </div>

      <el-table
        :data="rowsFormatted"
        stripe
        size="mini"
        :height="tableHeight"
        :default-sort="{ prop: 'yidong_time', order: 'descending' }"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />
        <el-table-column prop="yidong_time" label="异动时间" width="135" sortable="custom">
          <template slot-scope="{ row }">{{ row.yidong_time_label }}</template>
        </el-table-column>
        <el-table-column prop="ts_code" label="代码" width="95" sortable="custom" />
        <el-table-column prop="ts_name" label="名称" width="105" sortable="custom" />
        <el-table-column prop="move_type" label="类型" width="95" sortable="custom">
          <template slot-scope="{ row }">
            <el-tag
              size="mini"
              :type="row.move_type === '上涨异动' ? 'danger' : (row.move_type === '下跌异动' ? 'success' : 'info')"
            >
              {{ row.move_type || '异动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="latest_price" label="最新价" width="90" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ row.latest_price_fmt }}</template>
        </el-table-column>
        <el-table-column prop="changpercent" label="涨跌幅(%)" width="100" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ row.changpercent_fmt }}</template>
        </el-table-column>
        <el-table-column prop="tradingamount" label="成交额(亿)" width="110" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ row.tradingamount_yi }}</template>
        </el-table-column>
        <el-table-column prop="turnoverrate" label="换手率(%)" width="100" align="right" sortable="custom">
          <template slot-scope="{ row }">{{ row.turnoverrate_fmt }}</template>
        </el-table-column>
        <el-table-column prop="title" label="异动信息" min-width="420" sortable="custom" show-overflow-tooltip />
        <el-table-column prop="parts_label" label="关键词" min-width="240" sortable="custom" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getGpfxYidongMonitor } from '../../api/stockshow'

export default {
  name: 'GpfxYidongMonitor',
  data() {
    return {
      keyword: '',
      moveType: '',
      eventDateInput: '',
      eventDate: '',
      serverTime: '',
      limit: 5000,
      rows: [],
      latestId: 0,
      timer: null,
      loading: false,
      monitoring: true,
      sortProp: 'yidong_time',
      sortOrder: 'descending',
    }
  },
  computed: {
    tableHeight() {
      return Math.max(420, window.innerHeight - 220)
    },
    rowsFormatted() {
      return (this.rows || []).map(row => ({
        ...row,
        yidong_time_label: row.yidong_time ? String(row.yidong_time).slice(5, 16) : '',
        latest_price_fmt: this.num(row.latest_price),
        changpercent_fmt: this.num(row.changpercent),
        tradingamount_yi: this.yi(row.tradingamount),
        turnoverrate_fmt: this.num(row.turnoverrate),
        parts_label: [row.title_part1, row.title_part2, row.title_part3, row.title_part4].filter(Boolean).join('、'),
      }))
    },
  },
  mounted() {
    this.resetAndLoad()
    window.addEventListener('resize', this._onResize)
  },
  beforeDestroy() {
    this.stopTimer()
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
    buildParams(afterId) {
      return {
        after_id: afterId || 0,
        limit: this.limit,
        keyword: this.keyword,
        move_type: this.moveType,
        event_date: this.eventDateInput,
        sort_prop: this.sortProp,
        sort_order: this.sortOrder,
      }
    },
    resetAndLoad() {
      this.latestId = 0
      this.rows = []
      this.load(false)
      this.startTimer()
    },
    load(notifyNew = true) {
      if (this.loading) return
      this.loading = true
      const afterId = notifyNew ? this.latestId : 0
      getGpfxYidongMonitor(this.buildParams(afterId)).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '加载失败')
          return
        }
        this.eventDate = data.event_date || this.eventDateInput
        this.serverTime = data.server_time || ''
        this.latestId = Math.max(this.latestId, data.latest_id || 0)
        const incoming = notifyNew ? (data.new_rows || []) : (data.rows || [])
        if (incoming.length) {
          this.mergeRows(incoming)
          if (notifyNew) this.notifyRows(incoming)
        }
      }).catch(err => {
        console.error(err)
        this.$message.error('请求失败：实时异动监控接口 /gpfx/yidong-monitor/')
      }).finally(() => {
        this.loading = false
      })
    },
    mergeRows(incoming) {
      const byId = new Map()
      ;[...(incoming || []), ...(this.rows || [])].forEach(row => {
        if (row && row.id) byId.set(row.id, row)
      })
      this.rows = this.sortRows(Array.from(byId.values()))
        .slice(0, Math.max(this.limit, 200))
    },
    sortRows(rows) {
      const prop = this.sortProp || 'yidong_time'
      const direction = this.sortOrder === 'ascending' ? 1 : -1
      return (rows || []).sort((a, b) => {
        const left = this.sortValue(a, prop)
        const right = this.sortValue(b, prop)
        if (left > right) return direction
        if (left < right) return -direction
        return Number(b.id || 0) - Number(a.id || 0)
      })
    },
    sortValue(row, prop) {
      if (!row) return ''
      if (['id', 'latest_price', 'changpercent', 'tradingamount', 'turnoverrate', 'countnum'].includes(prop)) {
        const n = Number(row[prop])
        return Number.isNaN(n) ? -Infinity : n
      }
      if (prop === 'yidong_time') {
        return row.yidong_time ? new Date(row.yidong_time).getTime() : 0
      }
      return String(row[prop] || '')
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop || 'yidong_time'
      this.sortOrder = order || 'descending'
      this.rows = this.sortRows(this.rows)
      this.resetAndLoad()
    },
    notifyRows(rows) {
      rows.slice(-8).forEach(row => {
        const title = `${row.ts_name || row.stock_name || ''} ${row.ts_code || ''} ${row.move_type || '异动'}`
        const message = row.title || [row.title_part1, row.title_part2, row.title_part3].filter(Boolean).join('、')
        this.$notify({
          title,
          message,
          type: row.move_type === '上涨异动' ? 'warning' : 'info',
          duration: 0,
        })
        this.sendDesktopNotify(title, message)
      })
    },
    requestDesktopNotify() {
      if (!('Notification' in window)) {
        this.$message.warning('当前浏览器不支持桌面通知')
        return
      }
      Notification.requestPermission().then(permission => {
        this.$message[permission === 'granted' ? 'success' : 'warning'](
          permission === 'granted' ? '桌面通知已开启' : '桌面通知未授权'
        )
      })
    },
    sendDesktopNotify(title, body) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body })
      }
    },
    startTimer() {
      this.stopTimer()
      if (!this.monitoring) return
      this.timer = setInterval(() => this.load(true), 5000)
    },
    stopTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    toggleMonitor() {
      this.monitoring = !this.monitoring
      if (this.monitoring) {
        this.load(true)
        this.startTimer()
      } else {
        this.stopTimer()
      }
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
</style>
