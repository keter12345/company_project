<template>
  <div class="alert-exclusion-page">
    <el-alert
      title="这里只过滤股票提示，不删除实时行情，也不影响个股、行业和概念统计。"
      type="info"
      :closable="false"
      show-icon
    />

    <el-card shadow="never" class="section-card">
      <div slot="header" class="section-header">
        <div>
          <div class="title">股票提示过滤规则</div>
          <div class="subtitle">修改规则后，需要重新生成对应日期的过滤股票。</div>
        </div>
      </div>

      <el-table :data="rules" border stripe size="small" v-loading="loading">
        <el-table-column prop="rule_name" label="规则" width="120" />
        <el-table-column label="启用" width="80" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.enabled" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column label="同类只留最新" width="120" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.keep_latest_only" :active-value="1" :inactive-value="0" />
          </template>
        </el-table-column>
        <el-table-column label="提前天数" width="130">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.before_days" :min="0" :max="3650" :step="1" size="mini" controls-position="right" :disabled="isStockStatusRule(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="延后天数" width="130">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.after_days" :min="0" :max="3650" :step="1" size="mini" controls-position="right" :disabled="isStockStatusRule(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="最低比例" width="150">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.min_value"
              :min="0"
              :max="100"
              :precision="2"
              :step="0.1"
              size="mini"
              controls-position="right"
              :disabled="!usesThreshold(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="value_unit" label="比例含义" width="140" />
        <el-table-column label="执行说明" min-width="300" show-overflow-tooltip>
          <template slot-scope="scope">{{ executionText(scope.row) }}</template>
        </el-table-column>
        <el-table-column prop="updated_at" label="最后修改" width="160" />
        <el-table-column label="操作" width="90" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" :loading="saving[scope.row.rule_code]" @click="saveRule(scope.row)">保存</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="rule-help">
        <div><b>立案调查：</b>提前天数通常为0；延后天数从公告日期开始计算。</div>
        <div><b>减持计划：</b>基础范围是计划开始日至结束日；提前、延后天数在基础范围两端扩展。</div>
        <div><b>解禁计划：</b>提前、延后天数都以解禁日期为中心计算。</div>
        <div><b>北交所、ST：</b>每天按股票日上下文中的最新一条记录判断，不使用天数和比例。</div>
        <div><b>重大利空公告：</b>按公告日期及规则天数过滤；重大诉讼门槛单位为亿元，业绩暴雷门槛单位为下降百分比。</div>
      </div>
    </el-card>

    <el-card shadow="never" class="section-card">
      <div slot="header" class="section-header result-header">
        <div>
          <div class="title">每日过滤股票</div>
          <div class="subtitle">08:30由实时程序生成一次；当前可用“重新生成”手工验证。</div>
        </div>
        <div class="toolbar">
          <el-date-picker v-model="snapshotDate" type="date" value-format="yyyy-MM-dd" size="mini" :clearable="false" />
          <el-input v-model="filters.ts_code" placeholder="股票代码" size="mini" clearable @keyup.enter.native="loadOverview" />
          <el-select v-model="filters.rule_code" placeholder="全部规则" size="mini" clearable @change="loadOverview">
            <el-option v-for="rule in rules" :key="rule.rule_code" :label="rule.rule_name" :value="rule.rule_code" />
          </el-select>
          <el-button size="mini" @click="loadOverview">查询</el-button>
          <el-button type="primary" size="mini" :loading="refreshing" @click="refreshSnapshot">重新生成</el-button>
        </div>
      </div>

      <div class="summary-row">
        <el-tag type="primary">日期：{{ snapshotDate }}</el-tag>
        <el-tag type="warning">过滤股票：{{ summary.stock_count || 0 }}只</el-tag>
        <el-tag type="info">规则命中：{{ summary.hit_rows || 0 }}条</el-tag>
      </div>

      <el-table :data="rows" border stripe size="small" v-loading="loading">
        <el-table-column prop="ts_code" label="代码" width="100" />
        <el-table-column prop="ts_name" label="名称" width="120" />
        <el-table-column prop="rule_name" label="命中规则" width="120" />
        <el-table-column prop="event_date" label="事件日期" width="110" />
        <el-table-column prop="effective_start_date" label="过滤开始" width="110" />
        <el-table-column prop="effective_end_date" label="过滤结束" width="110" />
        <el-table-column label="比例" width="100" align="right">
          <template slot-scope="scope">
            {{ formatMetric(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="exclude_reason" label="过滤原因" min-width="340" show-overflow-tooltip />
        <el-table-column prop="source_table" label="来源表" width="230" show-overflow-tooltip />
      </el-table>
      <el-pagination
        class="pagination"
        background
        layout="total, sizes, prev, pager, next"
        :total="summary.hit_rows || 0"
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
  getAlertExclusionOverview,
  refreshAlertExclusionSnapshot,
  updateAlertExclusionRule,
} from '@/api/alertExclusions'

function todayText() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default {
  name: 'GpfxAlertExclusions',
  data() {
    return {
      loading: false,
      refreshing: false,
      saving: {},
      rules: [],
      rows: [],
      summary: { stock_count: 0, hit_rows: 0 },
      page: 1,
      pageSize: 50,
      snapshotDate: todayText(),
      filters: {
        ts_code: '',
        rule_code: '',
      },
    }
  },
  created() {
    this.loadOverview()
  },
  methods: {
    async loadOverview() {
      this.loading = true
      try {
        const data = await getAlertExclusionOverview({
          snapshot_date: this.snapshotDate,
          ts_code: (this.filters.ts_code || '').trim(),
          rule_code: this.filters.rule_code || '',
          page: this.page,
          page_size: this.pageSize,
        })
        if (!data.ok) throw new Error(data.error || '读取失败')
        this.rules = (data.rules || []).map(rule => ({
          ...rule,
          enabled: Number(rule.enabled),
          keep_latest_only: Number(rule.keep_latest_only),
          before_days: Number(rule.before_days),
          after_days: Number(rule.after_days),
          min_value: Number(rule.min_value),
        }))
        this.rows = data.rows || []
        this.summary = data.summary || { stock_count: 0, hit_rows: 0 }
      } catch (error) {
        this.$message.error((error.response && error.response.data && error.response.data.error) || error.message || '读取过滤规则失败')
      } finally {
        this.loading = false
      }
    },
    async saveRule(rule) {
      this.$set(this.saving, rule.rule_code, true)
      try {
        const data = await updateAlertExclusionRule({
          rule_code: rule.rule_code,
          enabled: Number(rule.enabled),
          keep_latest_only: Number(rule.keep_latest_only),
          before_days: Number(rule.before_days),
          after_days: Number(rule.after_days),
          min_value: Number(rule.min_value),
          updated_by: 'ui',
        })
        if (!data.ok) throw new Error(data.error || '保存失败')
        this.$message.success('规则保存成功；请重新生成过滤股票')
        await this.loadOverview()
      } catch (error) {
        this.$message.error((error.response && error.response.data && error.response.data.error) || error.message || '规则保存失败')
      } finally {
        this.$set(this.saving, rule.rule_code, false)
      }
    },
    async refreshSnapshot() {
      this.refreshing = true
      try {
        const data = await refreshAlertExclusionSnapshot({ snapshot_date: this.snapshotDate })
        if (!data.ok) throw new Error(data.error || '生成失败')
        const result = data.result || {}
        this.$message.success(`生成完成：${result.stock_count || 0}只股票，${result.hit_rows || 0}条命中`)
        this.page = 1
        await this.loadOverview()
      } catch (error) {
        this.$message.error((error.response && error.response.data && error.response.data.error) || error.message || '生成过滤股票失败')
      } finally {
        this.refreshing = false
      }
    },
    formatMetric(row) {
      if (!['DECREASE_PLAN', 'UNLOCK_PLAN', 'MAJOR_LAWSUIT', 'EARNINGS_SHOCK'].includes(row.rule_code)) return '-'
      if (row.metric_value === null || row.metric_value === undefined) return '-'
      if (row.rule_code === 'MAJOR_LAWSUIT') return `${Number(row.metric_value).toFixed(2)}亿元`
      return `${Number(row.metric_value || 0).toFixed(2)}%`
    },
    isStockStatusRule(rule) {
      return ['NORTH_EXCHANGE', 'ST_STOCK'].includes(rule.rule_code)
    },
    usesThreshold(rule) {
      return ['DECREASE_PLAN', 'UNLOCK_PLAN', 'MAJOR_LAWSUIT', 'EARNINGS_SHOCK'].includes(rule.rule_code)
    },
    executionText(rule) {
      if (rule.rule_code === 'INVESTIGATION') {
        return `立案公告前${rule.before_days}天至公告后${rule.after_days}天过滤提示。`
      }
      if (rule.rule_code === 'DECREASE_PLAN') {
        return `减持计划开始日前${rule.before_days}天至结束日后${rule.after_days}天过滤，最低减持比例${Number(rule.min_value || 0).toFixed(2)}%。`
      }
      if (rule.rule_code === 'UNLOCK_PLAN') {
        return `解禁日前${rule.before_days}天至解禁后${rule.after_days}天过滤，最低解禁比例${Number(rule.min_value || 0).toFixed(2)}%。`
      }
      if (rule.rule_code === 'NORTH_EXCHANGE') return 'market_bucket=bj时过滤股票提示。'
      if (rule.rule_code === 'ST_STOCK') return 'risk_st_flag=1时过滤ST和*ST股票提示。'
      if (rule.rule_code === 'DELIST_ST_NOTICE') return `退市/ST风险公告当日至公告后${rule.after_days}天过滤提示。`
      if (rule.rule_code === 'ADMIN_PENALTY') return `行政处罚公告当日至公告后${rule.after_days}天过滤提示。`
      if (rule.rule_code === 'REGULATORY_SANCTION') return `监管处分公告当日至公告后${rule.after_days}天过滤提示。`
      if (rule.rule_code === 'NONSTANDARD_AUDIT') return `非标审计意见公告当日至公告后${rule.after_days}天过滤提示。`
      if (rule.rule_code === 'MAJOR_LAWSUIT') return `诉讼金额不低于${Number(rule.min_value || 0).toFixed(2)}亿元，公告后${rule.after_days}天内过滤提示。`
      if (rule.rule_code === 'JUDICIAL_FREEZE') return `司法冻结/执行公告当日至公告后${rule.after_days}天过滤提示。`
      if (rule.rule_code === 'EARNINGS_SHOCK') return `预计亏损或下降不低于${Number(rule.min_value || 0).toFixed(2)}%，公告后${rule.after_days}天内过滤提示。`
      return rule.description || '-'
    },
    handleSizeChange() {
      this.page = 1
      this.loadOverview()
    },
  },
}
</script>

<style scoped>
.alert-exclusion-page {
  padding: 16px;
}
.section-card {
  margin-top: 14px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.title {
  font-size: 16px;
  font-weight: 600;
}
.subtitle {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}
.toolbar,
.summary-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.toolbar .el-input,
.toolbar .el-select {
  width: 140px;
}
.summary-row {
  margin-bottom: 12px;
}
.rule-help {
  margin-top: 12px;
  color: #606266;
  font-size: 13px;
  line-height: 1.8;
}
.pagination {
  margin-top: 14px;
  text-align: right;
}
</style>
