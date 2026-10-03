<template>
  <div class="universe-exclusion-page">
    <el-alert
      title="这里保存不进入实时计算链路的无效股票；这些股票不会出现在股票提示过滤中心。"
      type="warning"
      :closable="false"
      show-icon
    />

    <el-card shadow="never" class="section-card">
      <div slot="header" class="header-row">
        <div>
          <div class="title">实时计算无效股票</div>
          <div class="subtitle">每天08:30由实时程序生成；剔除发生在个股、行业、概念和市场统计之前。</div>
        </div>
        <div class="toolbar">
          <el-date-picker v-model="snapshotDate" type="date" value-format="yyyy-MM-dd" size="mini" :clearable="false" />
          <el-select v-model="filters.exclusion_type" placeholder="全部类型" size="mini" clearable @change="query">
            <el-option label="无交易信息" value="NO_TRADING_DATA" />
            <el-option label="退市股票" value="DELISTED_STOCK" />
          </el-select>
          <el-input v-model="filters.ts_code" placeholder="股票代码" size="mini" clearable @keyup.enter.native="query" />
          <el-button size="mini" @click="query">查询</el-button>
          <el-button type="primary" size="mini" :loading="refreshing" @click="refreshSnapshot">重新生成</el-button>
        </div>
      </div>

      <div class="summary-row">
        <el-tag>日期：{{ snapshotDate }}</el-tag>
        <el-tag type="warning">无效股票：{{ summary.stock_count || 0 }}只</el-tag>
        <el-tag type="danger">无交易信息：{{ summary.no_trading_count || 0 }}只</el-tag>
        <el-tag type="info">退市股票：{{ summary.delisted_count || 0 }}只</el-tag>
      </div>

      <el-table :data="rows" border stripe size="small" v-loading="loading">
        <el-table-column prop="ts_code" label="股票代码" width="120" />
        <el-table-column label="股票名称" width="140">
          <template slot-scope="scope">{{ scope.row.ts_name || '（无名称）' }}</template>
        </el-table-column>
        <el-table-column prop="exclusion_name" label="无效类型" width="140" />
        <el-table-column prop="exclude_reason" label="剔除原因" min-width="360" show-overflow-tooltip />
        <el-table-column prop="source_table" label="判断来源" width="260" show-overflow-tooltip />
        <el-table-column prop="created_at" label="生成时间" width="170" />
      </el-table>

      <el-pagination
        class="pagination"
        background
        layout="total, sizes, prev, pager, next"
        :total="summary.stock_count || 0"
        :current-page.sync="page"
        :page-size.sync="pageSize"
        :page-sizes="[20, 50, 100, 200]"
        @current-change="loadOverview"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<script>
import {
  getUniverseExclusionOverview,
  refreshUniverseExclusionSnapshot,
} from '@/api/universeExclusions'

function todayText() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default {
  name: 'GpfxUniverseExclusions',
  data() {
    return {
      loading: false,
      refreshing: false,
      snapshotDate: todayText(),
      rows: [],
      summary: { stock_count: 0, no_trading_count: 0, delisted_count: 0 },
      page: 1,
      pageSize: 50,
      filters: { ts_code: '', exclusion_type: '' },
    }
  },
  created() {
    this.loadOverview()
  },
  methods: {
    async loadOverview() {
      this.loading = true
      try {
        const data = await getUniverseExclusionOverview({
          snapshot_date: this.snapshotDate,
          ts_code: (this.filters.ts_code || '').trim(),
          exclusion_type: this.filters.exclusion_type || '',
          page: this.page,
          page_size: this.pageSize,
        })
        if (!data.ok) throw new Error(data.error || '读取失败')
        this.rows = data.rows || []
        this.summary = data.summary || { stock_count: 0, no_trading_count: 0, delisted_count: 0 }
      } catch (error) {
        this.$message.error((error.response && error.response.data && error.response.data.error) || error.message || '读取无效股票失败')
      } finally {
        this.loading = false
      }
    },
    query() {
      this.page = 1
      this.loadOverview()
    },
    async refreshSnapshot() {
      this.refreshing = true
      try {
        const data = await refreshUniverseExclusionSnapshot({ snapshot_date: this.snapshotDate })
        if (!data.ok) throw new Error(data.error || '生成失败')
        const result = data.result || {}
        this.$message.success(`生成完成：无交易${result.no_trading_count || 0}只，退市${result.delisted_count || 0}只`)
        this.page = 1
        await this.loadOverview()
      } catch (error) {
        this.$message.error((error.response && error.response.data && error.response.data.error) || error.message || '生成无效股票失败')
      } finally {
        this.refreshing = false
      }
    },
    handleSizeChange() {
      this.page = 1
      this.loadOverview()
    },
  },
}
</script>

<style scoped>
.universe-exclusion-page { padding: 16px; }
.section-card { margin-top: 14px; }
.header-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.title { font-size: 17px; font-weight: 600; }
.subtitle { margin-top: 5px; color: #909399; font-size: 13px; }
.toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.toolbar .el-input { width: 150px; }
.toolbar .el-select { width: 150px; }
.summary-row { display: flex; gap: 10px; margin-bottom: 12px; }
.pagination { margin-top: 14px; text-align: right; }
</style>
