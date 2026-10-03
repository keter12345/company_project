<template>
  <div>
    <el-card class="gpfx-card">
      <div slot="header" class="gpfx-header">
        <div class="gpfx-title">
          <span>gpfx 异动维护</span>
          <el-tag style="margin-left: 10px;" type="info">{{ activeDate || eventDate }} 共 {{ total }} 个</el-tag>
        </div>
        <div class="gpfx-toolbar">
          <el-input
            v-model="keyword"
            clearable
            size="mini"
            placeholder="异动名称"
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
          <el-select v-model="moveType" clearable size="mini" placeholder="异动类型" style="width: 130px;">
            <el-option label="上涨异动" value="上涨异动" />
            <el-option label="下跌异动" value="下跌异动" />
            <el-option label="中性异动" value="中性异动" />
          </el-select>
          <el-checkbox v-model="includeFiltered" size="mini">包含已过滤/通用</el-checkbox>
          <el-button
            size="mini"
            type="success"
            :disabled="selectedRows.length < 2"
            @click="openMergeDialog"
          >合并名称</el-button>
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
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="openStocks"
      >
        <el-table-column type="selection" width="45" />
        <el-table-column prop="yidong_name" label="异动名称" min-width="180" sortable="custom">
          <template slot-scope="{ row }">
            <el-link type="primary" :class="moveTypeClass(row.move_type)" @click.stop="openStocks(row)">{{ row.yidong_name }}</el-link>
            <el-tag v-if="row.is_noise_default" size="mini" type="warning" class="row-tag">通用</el-tag>
            <el-tag v-if="Number(row.merged_alias_count) > 1" size="mini" type="success" class="row-tag">已合并</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="importance" label="重要程度" width="135" align="center" sortable="custom">
          <template slot-scope="{ row }">
            <el-input-number
              v-model="row.importance"
              size="mini"
              :min="0"
              :max="100"
              :step="5"
              controls-position="right"
              style="width: 105px;"
              @change="saveYidong(row)"
              @click.native.stop
            />
          </template>
        </el-table-column>
        <el-table-column prop="filtered" label="人工过滤" width="105" align="center" sortable="custom">
          <template slot-scope="{ row }">
            <el-switch
              v-model="row.filtered_bool"
              active-color="#d9534f"
              @change="saveYidong(row)"
              @click.native.stop
            />
          </template>
        </el-table-column>
        <el-table-column prop="filter_reason" label="过滤原因" min-width="160" sortable="custom">
          <template slot-scope="{ row }">
            <el-input
              v-model="row.filter_reason"
              size="mini"
              clearable
              placeholder="原因"
              @change="saveYidong(row)"
              @click.native.stop
            />
          </template>
        </el-table-column>
        <el-table-column prop="leader_count" label="龙头数" width="90" align="right" sortable="custom" />
        <el-table-column prop="day_stock_count" label="当日股数" width="100" align="right" sortable="custom" />
        <el-table-column prop="related_stock_count" label="关联股数" width="100" align="right" sortable="custom" />
        <el-table-column prop="latest_event_time" label="最近异动" width="135" sortable="custom">
          <template slot-scope="{ row }">{{ row.latest_event_time_label }}</template>
        </el-table-column>
        <el-table-column prop="raw_yidong_names_label" label="合并原词" min-width="220" sortable="custom" show-overflow-tooltip />
        <el-table-column label="操作" width="90" fixed="right">
          <template slot-scope="{ row }">
            <el-button size="mini" type="text" @click.stop="openStocks(row)">股票</el-button>
          </template>
        </el-table-column>
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
      :visible.sync="stockVisible"
      :title="stockTitle"
      width="90%"
      top="4vh"
    >
      <div class="detail-toolbar">
        <el-checkbox v-model="detailIncludeNoise" size="mini" @change="loadStocks">包含通用原因</el-checkbox>
        <el-tag v-if="rawNamesLabel" size="mini" type="info">{{ rawNamesLabel }}</el-tag>
      </div>
      <div v-loading="stockLoading">
        <div class="stock-section-title">当日异动股票 {{ todayStockRows.length }}</div>
        <el-table
          :data="todayStockRows"
          stripe
          size="mini"
          height="260"
          empty-text="当日暂无触发股票"
          :row-class-name="stockRowClassName"
        >
          <el-table-column prop="is_leader_bool" label="龙头" width="80" align="center" sortable>
            <template slot-scope="{ row }">
              <el-switch
                v-model="row.is_leader_bool"
                active-color="#409eff"
                @change="saveStock(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="ts_code" label="代码" width="95" sortable />
          <el-table-column prop="ts_name" label="名称" width="105" sortable>
            <template slot-scope="{ row }">
              <span :class="moveTypeClass(row.latest_relation_move_type)">{{ row.ts_name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="relation_event_count" label="关联次数" width="90" align="right" sortable />
          <el-table-column prop="tradingamount" label="成交额(亿)" width="110" align="right" sortable>
            <template slot-scope="{ row }">{{ row.tradingamount_yi }}</template>
          </el-table-column>
          <el-table-column prop="changpercent" label="涨跌幅(%)" width="100" align="right" sortable>
            <template slot-scope="{ row }">{{ row.changpercent_fmt }}</template>
          </el-table-column>
          <el-table-column prop="swing" label="振幅(%)" width="90" align="right" sortable>
            <template slot-scope="{ row }">{{ row.swing_fmt }}</template>
          </el-table-column>
          <el-table-column prop="turnoverrate" label="换手率(%)" width="100" align="right" sortable>
            <template slot-scope="{ row }">{{ row.turnoverrate_fmt }}</template>
          </el-table-column>
          <el-table-column prop="last_relation_time" label="最近关联" width="135" sortable>
            <template slot-scope="{ row }">{{ row.last_relation_time_label }}</template>
          </el-table-column>
          <el-table-column prop="note" label="备注" min-width="150" sortable>
            <template slot-scope="{ row }">
              <el-input
                v-model="row.note"
                size="mini"
                clearable
                placeholder="备注"
                @change="saveStock(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="latest_relation_title" label="最近关联标题" min-width="320" sortable show-overflow-tooltip />
        </el-table>

        <div class="stock-section-title history-title">历史关联股票（不含当日） {{ historyStockRows.length }}</div>
        <el-table
          :data="historyStockRows"
          stripe
          size="mini"
          height="360"
          empty-text="暂无历史关联股票"
          :row-class-name="stockRowClassName"
        >
          <el-table-column prop="is_leader_bool" label="龙头" width="80" align="center" sortable>
            <template slot-scope="{ row }">
              <el-switch
                v-model="row.is_leader_bool"
                active-color="#409eff"
                @change="saveStock(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="ts_code" label="代码" width="95" sortable />
          <el-table-column prop="ts_name" label="名称" width="105" sortable>
            <template slot-scope="{ row }">
              <span :class="moveTypeClass(row.latest_relation_move_type)">{{ row.ts_name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="relation_event_count" label="关联次数" width="90" align="right" sortable />
          <el-table-column prop="tradingamount" label="成交额(亿)" width="110" align="right" sortable>
            <template slot-scope="{ row }">{{ row.tradingamount_yi }}</template>
          </el-table-column>
          <el-table-column prop="changpercent" label="涨跌幅(%)" width="100" align="right" sortable>
            <template slot-scope="{ row }">{{ row.changpercent_fmt }}</template>
          </el-table-column>
          <el-table-column prop="swing" label="振幅(%)" width="90" align="right" sortable>
            <template slot-scope="{ row }">{{ row.swing_fmt }}</template>
          </el-table-column>
          <el-table-column prop="turnoverrate" label="换手率(%)" width="100" align="right" sortable>
            <template slot-scope="{ row }">{{ row.turnoverrate_fmt }}</template>
          </el-table-column>
          <el-table-column prop="last_relation_time" label="最近关联" width="135" sortable>
            <template slot-scope="{ row }">{{ row.last_relation_time_label }}</template>
          </el-table-column>
          <el-table-column prop="note" label="备注" min-width="150" sortable>
            <template slot-scope="{ row }">
              <el-input
                v-model="row.note"
                size="mini"
                clearable
                placeholder="备注"
                @change="saveStock(row)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="latest_relation_title" label="最近关联标题" min-width="320" sortable show-overflow-tooltip />
        </el-table>
      </div>
    </el-dialog>

    <el-dialog
      :visible.sync="mergeVisible"
      title="合并异动名称"
      width="520px"
    >
      <el-form label-width="90px" size="mini">
        <el-form-item label="主名称">
          <el-select v-model="mergeForm.canonical_name" filterable allow-create default-first-option style="width: 100%;">
            <el-option
              v-for="name in mergeNameOptions"
              :key="name"
              :label="name"
              :value="name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="包含名称">
          <el-input
            v-model="mergeForm.aliases"
            type="textarea"
            :rows="5"
            placeholder="用顿号或逗号分隔"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="mergeForm.note" clearable placeholder="可选" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="mergeVisible = false">取消</el-button>
        <el-button size="mini" type="primary" :loading="mergeSaving" @click="saveMerge">保存合并</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getGpfxYidongManageList,
  updateGpfxYidongManage,
  mergeGpfxYidongManageNames,
  getGpfxYidongManageStocks,
  updateGpfxYidongManageStock,
} from '../../api/stockshow'

export default {
  name: 'GpfxYidongManage',
  data() {
    return {
      keyword: '',
      eventDate: '',
      moveType: '',
      includeFiltered: false,
      activeDate: '',
      page: 1,
      pageSize: 50,
      total: 0,
      sortProp: 'importance',
      sortOrder: 'descending',
      rows: [],
      loading: false,
      stockVisible: false,
      stockLoading: false,
      activeYidong: null,
      detailIncludeNoise: false,
      stockRows: [],
      rawNames: [],
      selectedRows: [],
      mergeVisible: false,
      mergeSaving: false,
      mergeForm: {
        canonical_name: '',
        aliases: '',
        note: '',
      },
    }
  },
  computed: {
    tableHeight() {
      return Math.max(420, window.innerHeight - 220)
    },
    rowsFormatted() {
      return this.rows || []
    },
    stockTitle() {
      const row = this.activeYidong || {}
      return `${row.yidong_name || ''} 关联股票`
    },
    rawNamesLabel() {
      const names = this.rawNames || []
      if (!names.length) return ''
      const label = names.slice(0, 8).join('、')
      return names.length > 8 ? `${label}...` : label
    },
    stockRowsFormatted() {
      return this.stockRows || []
    },
    todayStockRows() {
      return this.stockRowsFormatted.filter(row => Number(row.is_today_alerted) === 1)
    },
    historyStockRows() {
      return this.stockRowsFormatted.filter(row => Number(row.is_today_alerted) !== 1)
    },
    mergeNameOptions() {
      return Array.from(new Set((this.selectedRows || []).map(row => row.yidong_name).filter(Boolean)))
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
    moveTypeClass(moveType) {
      if (moveType === '上涨异动') return 'move-up'
      if (moveType === '下跌异动') return 'move-down'
      return ''
    },
    stockRowClassName({ row }) {
      if (!row) return ''
      if (row.latest_relation_move_type === '上涨异动') return 'stock-row-up'
      if (row.latest_relation_move_type === '下跌异动') return 'stock-row-down'
      return ''
    },
    load() {
      this.loading = true
      const params = {
        keyword: this.keyword,
        event_date: this.eventDate,
        move_type: this.moveType,
        include_filtered: this.includeFiltered ? '1' : '0',
        page: this.page,
        page_size: this.pageSize,
        sort_prop: this.sortProp,
        sort_order: this.sortOrder,
      }
      getGpfxYidongManageList(params).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '加载失败')
          return
        }
        this.rows = (data.rows || []).map(row => ({
          ...row,
          filtered_bool: Number(row.filtered) === 1,
          latest_event_time_label: row.latest_event_time ? String(row.latest_event_time).slice(5, 16) : '',
        }))
        this.total = data.total || 0
        this.page = data.page || this.page
        this.pageSize = data.page_size || this.pageSize
        this.activeDate = data.event_date || this.eventDate
      }).catch(err => {
        console.error(err)
        this.$message.error('请求失败：异动维护接口 /gpfx/yidong-manage/')
      }).finally(() => {
        this.loading = false
      })
    },
    query() {
      this.page = 1
      this.load()
    },
    handleSortChange({ prop, order }) {
      this.sortProp = prop || 'importance'
      this.sortOrder = order || 'descending'
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
    handleSelectionChange(rows) {
      this.selectedRows = rows || []
    },
    openMergeDialog() {
      const names = []
      ;(this.selectedRows || []).forEach(row => {
        if (row.yidong_name) names.push(row.yidong_name)
        ;(row.raw_yidong_names || []).forEach(name => {
          if (name) names.push(name)
        })
      })
      const uniqueNames = Array.from(new Set(names))
      this.mergeForm = {
        canonical_name: this.selectedRows[0] ? this.selectedRows[0].yidong_name : '',
        aliases: uniqueNames.join('、'),
        note: '',
      }
      this.mergeVisible = true
    },
    saveMerge() {
      if (!this.mergeForm.canonical_name || !this.mergeForm.aliases) {
        this.$message.warning('请选择主名称并填写包含名称')
        return
      }
      this.mergeSaving = true
      mergeGpfxYidongManageNames({
        canonical_name: this.mergeForm.canonical_name,
        aliases: this.mergeForm.aliases,
        note: this.mergeForm.note || '',
      }).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '合并失败')
          return
        }
        this.mergeVisible = false
        this.$message.success('已合并')
        this.query()
      }).catch(err => {
        console.error(err)
        this.$message.error('合并失败')
      }).finally(() => {
        this.mergeSaving = false
      })
    },
    saveYidong(row) {
      const params = {
        yidong_name: row.yidong_name,
        importance: row.importance,
        filtered: row.filtered_bool ? '1' : '0',
        filter_reason: row.filter_reason || '',
        note: row.note || '',
      }
      updateGpfxYidongManage(params).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '保存失败')
          return
        }
        row.filtered = row.filtered_bool ? 1 : 0
        this.$message.success('已保存')
      }).catch(err => {
        console.error(err)
        this.$message.error('保存失败')
      })
    },
    openStocks(row) {
      if (!row || !row.yidong_name) return
      this.activeYidong = row
      this.detailIncludeNoise = false
      this.stockVisible = true
      this.loadStocks()
    },
    loadStocks() {
      if (!this.activeYidong) return
      this.stockLoading = true
      getGpfxYidongManageStocks({
        yidong_name: this.activeYidong.yidong_name,
        event_date: this.activeDate || this.eventDate,
        move_type: this.moveType,
        include_noise: this.detailIncludeNoise ? '1' : '0',
      }).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '加载股票失败')
          return
        }
        this.rawNames = data.raw_yidong_names || []
        this.stockRows = (data.rows || []).map(row => ({
          ...row,
          is_leader_bool: Number(row.is_leader) === 1,
          is_today_alerted_label: Number(row.is_today_alerted) === 1 ? '是' : '',
          last_relation_time_label: row.last_relation_time ? String(row.last_relation_time).slice(5, 16) : '',
          tradingamount_yi: this.yi(row.tradingamount),
          changpercent_fmt: this.num(row.changpercent),
          swing_fmt: this.num(row.swing),
          turnoverrate_fmt: this.num(row.turnoverrate),
        }))
      }).catch(err => {
        console.error(err)
        this.$message.error('请求失败：异动关联股票接口')
      }).finally(() => {
        this.stockLoading = false
      })
    },
    saveStock(row) {
      if (!this.activeYidong || !row.ts_code) return
      updateGpfxYidongManageStock({
        yidong_name: this.activeYidong.yidong_name,
        ts_code: row.ts_code,
        ts_name: row.ts_name,
        is_leader: row.is_leader_bool ? '1' : '0',
        relation_level: row.is_leader_bool ? '龙头' : '关联',
        note: row.note || '',
      }).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '保存失败')
          return
        }
        row.is_leader = row.is_leader_bool ? 1 : 0
        this.$message.success('已保存')
        this.load()
      }).catch(err => {
        console.error(err)
        this.$message.error('保存失败')
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
.row-tag {
  margin-left: 6px;
}
.move-up {
  color: #d93026;
  font-weight: 600;
}
.move-down {
  color: #188038;
  font-weight: 600;
}
/deep/ .stock-row-up > td {
  background-color: #fff5f5 !important;
}
/deep/ .stock-row-down > td {
  background-color: #f3fbf5 !important;
}
.detail-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.stock-section-title {
  height: 28px;
  line-height: 28px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.history-title {
  margin-top: 10px;
}
.pager {
  padding-top: 10px;
  text-align: right;
}
</style>
