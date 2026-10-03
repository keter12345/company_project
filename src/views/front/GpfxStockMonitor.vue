<template>
  <div class="stock-monitor-page">
    <el-card shadow="never">
      <div slot="header" class="card-header">
        <div>
          <b>股票监控与龙头管理</b>
          <span class="header-note">全局状态只分普通、重要；行业和概念中的身份使用普通、重要、龙头。</span>
        </div>
        <el-button size="mini" icon="el-icon-refresh" :loading="loading" @click="loadRows">刷新全部</el-button>
      </div>

      <div class="filters">
        <el-input v-model.trim="filters.keyword" size="mini" clearable placeholder="代码或名称，例如 600" style="width: 190px" @input="scheduleLoad" @clear="scheduleLoad" />
        <el-input v-model.trim="filters.industryKeyword" size="mini" clearable placeholder="行业" style="width: 130px" @input="scheduleLoad" @clear="scheduleLoad" />
        <el-input v-model.trim="filters.conceptKeyword" size="mini" clearable placeholder="概念" style="width: 130px" @input="scheduleLoad" @clear="scheduleLoad" />
        <el-select v-model="filters.monitorStatus" clearable size="mini" placeholder="股票状态" style="width: 110px" @change="scheduleLoad">
          <el-option label="普通" value="NORMAL" />
          <el-option label="重要" value="IMPORTANT" />
        </el-select>
        <el-select v-model="filters.marketBucket" clearable size="mini" placeholder="市场" style="width: 100px" @change="scheduleLoad">
          <el-option label="主板" value="main" />
          <el-option label="创业板" value="gem" />
          <el-option label="科创板" value="star" />
          <el-option label="北交所" value="bj" />
        </el-select>
      </div>

      <el-table
        ref="stockTable"
        :data="rows"
        row-key="ts_code"
        :expand-row-keys="expandedCodes"
        v-loading="loading"
        stripe
        size="small"
        style="width: 100%"
        @row-click="toggleDetail"
        @expand-change="handleExpandChange"
      >
        <el-table-column type="expand" width="38">
          <template slot-scope="scope">
            <div class="inline-detail" v-loading="detailLoading && expandedCodes[0] === scope.row.ts_code">
              <template v-if="detail.stock && detail.stock.ts_code === scope.row.ts_code">
                <div class="inline-detail-header">
                  <span><b>{{ detail.stock.ts_code }} {{ detail.stock.ts_name }}</b> · {{ marketText(detail.stock.market_bucket) }} · 最近收盘 {{ detail.stock.last_seen_date }}</span>
                  <span class="stock-status-buttons">
                    <el-button size="mini" :type="detail.stock.monitor_status === 'NORMAL' ? 'primary' : 'default'" @click.stop="saveDetailStatus('NORMAL')">普通</el-button>
                    <el-button size="mini" :type="detail.stock.monitor_status === 'IMPORTANT' ? 'danger' : 'default'" @click.stop="saveDetailStatus('IMPORTANT')">重要</el-button>
                  </span>
                </div>
                <el-alert title="已设为“不监控”的行业、概念不会在这里出现，也不能修改其股票身份。" type="info" :closable="false" show-icon />
                <section class="relation-section">
                  <div class="relation-title">受监控行业 <el-tag size="mini" type="info">{{ detail.industries.length }} 个</el-tag></div>
                  <div v-if="detail.industries.length" class="relation-list">
                    <div v-for="industry in detail.industries" :key="`industry-${industry.bk_code}`" class="relation-row">
                      <span class="relation-code">{{ industry.bk_code }}</span><span class="relation-name">{{ industry.bk_name }}</span>
                      <span class="level-buttons">
                        <el-button size="mini" :type="industry.zycd === 0 ? 'primary' : 'default'" @click.stop="saveRelation({ row: industry, value: 0, plateType: 'industry' })">普通</el-button>
                        <el-button size="mini" :type="industry.zycd === 1 ? 'warning' : 'default'" @click.stop="saveRelation({ row: industry, value: 1, plateType: 'industry' })">重要</el-button>
                        <el-button size="mini" :type="industry.zycd === 2 ? 'danger' : 'default'" @click.stop="saveRelation({ row: industry, value: 2, plateType: 'industry' })">龙头</el-button>
                      </span>
                    </div>
                  </div>
                  <div v-else class="relation-empty">没有受监控的关联行业</div>
                </section>
                <section class="relation-section">
                  <div class="relation-title">受监控概念 <el-tag size="mini" type="info">{{ detail.concepts.length }} 个</el-tag></div>
                  <div v-if="detail.concepts.length" class="relation-list">
                    <div v-for="concept in detail.concepts" :key="`concept-${concept.bk_code}`" class="relation-row">
                      <span class="relation-code">{{ concept.bk_code }}</span><span class="relation-name">{{ concept.bk_name }}</span>
                      <span class="level-buttons">
                        <el-button size="mini" :type="concept.zycd === 0 ? 'primary' : 'default'" @click.stop="saveRelation({ row: concept, value: 0, plateType: 'concept' })">普通</el-button>
                        <el-button size="mini" :type="concept.zycd === 1 ? 'warning' : 'default'" @click.stop="saveRelation({ row: concept, value: 1, plateType: 'concept' })">重要</el-button>
                        <el-button size="mini" :type="concept.zycd === 2 ? 'danger' : 'default'" @click.stop="saveRelation({ row: concept, value: 2, plateType: 'concept' })">龙头</el-button>
                      </span>
                    </div>
                  </div>
                  <div v-else class="relation-empty">没有受监控的关联概念</div>
                </section>
              </template>
              <span v-else-if="!detailLoading" class="detail-empty">正在读取关联行业和概念…</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="ts_code" label="代码" width="100" sortable />
        <el-table-column prop="ts_name" label="名称" min-width="120" />
        <el-table-column label="股票状态" width="120">
          <template slot-scope="scope">
            <el-tag :type="scope.row.monitor_status === 'IMPORTANT' ? 'danger' : 'info'" size="mini">{{ scope.row.monitor_status_text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="市场" width="100">
          <template slot-scope="scope">{{ marketText(scope.row.market_bucket) }}</template>
        </el-table-column>
        <el-table-column prop="industry_count" label="受监控行业" width="115" sortable />
        <el-table-column prop="concept_count" label="受监控概念" width="115" sortable />
        <el-table-column prop="last_seen_date" label="最近收盘日" width="125" />
        <el-table-column label="操作" width="220" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click.stop="toggleDetail(scope.row)">行业/概念身份</el-button>
            <el-button v-if="scope.row.monitor_status === 'NORMAL'" type="text" size="mini" @click.stop="saveStatus(scope.row, 'IMPORTANT')">设为重要</el-button>
            <el-button v-else type="text" size="mini" @click.stop="saveStatus(scope.row, 'NORMAL')">改为普通</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="total-row">当前显示 {{ total }} 只有效股票；输入筛选条件后自动更新。</div>
    </el-card>

  </div>
</template>

<script>
import {
  getGpfxStockMonitor,
  getGpfxStockMonitorDetail,
  updateGpfxStockMonitor,
  updateGpfxStockMonitorRelation
} from '../../api/stockshow'

export default {
  name: 'GpfxStockMonitor',
  data () {
    return {
      rows: [], total: 0, loading: false, detailLoading: false, expandedCodes: [], filterTimer: null,
      detail: { stock: null, industries: [], concepts: [] },
      filters: { keyword: '', industryKeyword: '', conceptKeyword: '', monitorStatus: '', marketBucket: '' }
    }
  },
  created () { this.loadRows() },
  methods: {
    marketText (value) { return ({ main: '主板', gem: '创业板', star: '科创板', bj: '北交所' })[value] || '-' },
    params () {
      return { keyword: this.filters.keyword, industry_keyword: this.filters.industryKeyword,
        concept_keyword: this.filters.conceptKeyword, monitor_status: this.filters.monitorStatus,
        market_bucket: this.filters.marketBucket,
      }
    },
    async loadRows () {
      this.collapseDetail()
      this.loading = true
      try {
        const result = await getGpfxStockMonitor(this.params())
        this.rows = result.rows || []; this.total = Number(result.total || 0)
      } catch (error) { this.$message.error((error && error.message) || '股票监控数据读取失败') } finally { this.loading = false }
    },
    scheduleLoad () {
      if (this.filterTimer) window.clearTimeout(this.filterTimer)
      this.filterTimer = window.setTimeout(() => this.loadRows(), 250)
    },
    async saveStatus (row, monitorStatus) {
      try {
        await updateGpfxStockMonitor({ ts_code: row.ts_code, monitor_status: monitorStatus })
        row.monitor_status = monitorStatus; row.monitor_status_text = monitorStatus === 'IMPORTANT' ? '重要' : '普通'
        this.$message.success('股票状态已保存')
      } catch (error) { this.$message.error((error && error.message) || '保存失败') }
    },
    collapseDetail () {
      this.expandedCodes = []
      this.detail = { stock: null, industries: [], concepts: [] }
      this.detailLoading = false
    },
    toggleDetail (row) {
      // 使用 Element 表格原生展开动作；随后由 expand-change 统一读取详情。
      // 这样点击整行和点击左侧箭头的结果完全一致。
      if (this.$refs.stockTable) this.$refs.stockTable.toggleRowExpansion(row)
    },
    async loadDetail (row) {
      this.detailLoading = true
      try { this.detail = await getGpfxStockMonitorDetail({ ts_code: row.ts_code }) }
      catch (error) { this.$message.error((error && error.message) || '详情读取失败'); this.collapseDetail() }
      finally { this.detailLoading = false }
    },
    handleExpandChange (row, expandedRows) {
      const rowIsExpanded = (expandedRows || []).some(item => item.ts_code === row.ts_code)
      if (!rowIsExpanded) {
        this.collapseDetail()
        return
      }
      // 每次只保留当前点击的股票；前一只会立即收缩。
      ;(expandedRows || []).forEach(item => {
        if (item.ts_code !== row.ts_code && this.$refs.stockTable) this.$refs.stockTable.toggleRowExpansion(item, false)
      })
      this.expandedCodes = [row.ts_code]
      this.detail = { stock: null, industries: [], concepts: [] }
      this.loadDetail(row)
    },
    async saveDetailStatus (value) {
      try { await updateGpfxStockMonitor({ ts_code: this.detail.stock.ts_code, monitor_status: value }); this.$message.success('股票状态已保存'); this.loadRows() }
      catch (error) { this.$message.error((error && error.message) || '保存失败') }
    },
    async saveRelation ({ row, value, plateType }) {
      try {
        await updateGpfxStockMonitorRelation({ ts_code: this.detail.stock.ts_code, bk_code: row.bk_code, plate_type: plateType, zycd: value })
        row.zycd = value; row.zycd_text = ({ 0: '普通', 1: '重要', 2: '龙头' })[value]; this.$message.success('板块身份已保存')
      } catch (error) { this.$message.error((error && error.message) || '保存失败') }
    }
  },
  beforeDestroy () { if (this.filterTimer) window.clearTimeout(this.filterTimer) }
}
</script>

<style scoped>
.stock-monitor-page { padding: 14px; }
.card-header, .inline-detail-header { display: flex; justify-content: space-between; align-items: center; }
.header-note { color: #909399; margin-left: 12px; font-size: 12px; }
.filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.total-row { margin-top: 14px; color: #606266; font-size: 13px; }
.inline-detail { padding: 8px 20px 18px; background: #fafcff; }
.inline-detail-header { margin-bottom: 12px; font-size: 14px; }
.stock-status-buttons .el-button + .el-button, .level-buttons .el-button + .el-button { margin-left: 5px; }
.detail-empty { color: #909399; }
.relation-section { margin-top: 22px; }
.relation-title { margin-bottom: 8px; font-weight: 600; }
.relation-title .el-tag { margin-left: 5px; }
.relation-list { max-width: 720px; border: 1px solid #e8edf4; border-radius: 4px; overflow: hidden; }
.relation-row { display: flex; align-items: center; min-height: 38px; padding: 0 10px; border-bottom: 1px solid #edf1f6; }
.relation-row:last-child { border-bottom: 0; }
.relation-code { width: 96px; color: #909399; font-size: 12px; }
.relation-name { width: 180px; color: #303133; }
.level-buttons { white-space: nowrap; }
.relation-empty { color: #909399; font-size: 13px; padding: 9px 0; }
</style>
