<template>
  <div class="gpfx-rule-page">
    <el-card shadow="never">
      <div slot="header" class="clearfix">
        <span>gpfx 监控规则开关</span>
      </div>

      <div class="toolbar">
        <el-select v-model="filters.rule_layer" clearable placeholder="规则层级" size="small" @change="loadRules">
          <el-option label="前一日观察层" value="pretrade_watch" />
          <el-option label="盘中确认层" value="intraday_confirm" />
          <el-option label="角色辅助层" value="role_assist" />
          <el-option label="卖出监控层" value="sell_monitor" />
        </el-select>
        <el-select v-model="filters.rule_type" clearable placeholder="规则类型" size="small" @change="loadRules">
          <el-option label="买入" value="buy" />
          <el-option label="观察" value="watch" />
          <el-option label="卖出" value="sell" />
        </el-select>
        <el-select v-model="filters.enabled" clearable placeholder="开关状态" size="small" @change="loadRules">
          <el-option label="开启" value="1" />
          <el-option label="关闭" value="0" />
        </el-select>
        <el-switch
          v-model="isTest"
          active-text="测试表"
          inactive-text="正式表"
          @change="loadRules"
        />
        <el-button type="primary" size="small" @click="loadRules">刷新</el-button>
      </div>

      <el-table :data="rows" border stripe v-loading="loading" size="small">
        <el-table-column prop="rule_code" label="规则编码" width="90" />
        <el-table-column prop="rule_name" label="规则名称" min-width="180" />
        <el-table-column prop="rule_type_cn" label="类型" width="80" />
        <el-table-column prop="rule_layer_cn" label="层级" width="120" />
        <el-table-column prop="priority" label="优先级" width="90" />
        <el-table-column prop="signal_status_default" label="默认状态" width="100" />
        <el-table-column prop="handler_name" label="实时处理函数" min-width="140" />
        <el-table-column prop="pretrade_handler" label="前一日处理" min-width="140" />
        <el-table-column prop="enabled_text" label="是否启用" width="90">
          <template slot-scope="scope">
            <el-tag :type="scope.row.enabled ? 'success' : 'info'" size="mini">
              {{ scope.row.enabled ? '开启' : '关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <el-switch
              :value="!!scope.row.enabled"
              active-color="#13ce66"
              inactive-color="#dcdfe6"
              @change="val => onToggle(scope.row, val)"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="tips">
        <p>说明：</p>
        <ul>
          <li>关闭后的规则，在实时数据执行时不应再提示。</li>
          <li>建议一次只打开 1 到 2 条规则，便于人工验证命中质量。</li>
          <li>前一日观察层和盘中确认层可以分开验证。</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getGpfxRules, toggleGpfxRule } from '@/api/stockshow'

export default {
  name: 'GpfxRuleSwitches',
  data() {
    return {
      loading: false,
      isTest: false,
      rows: [],
      filters: {
        rule_layer: '',
        rule_type: '',
        enabled: '',
      },
    }
  },
  created() {
    this.loadRules()
  },
  methods: {
    async loadRules() {
      this.loading = true
      try {
        const res = await getGpfxRules({
          ...this.filters,
          is_test: this.isTest ? 'test_' : '',
        })
        this.rows = (res.rows || []).map(item => ({ ...item, enabled: Number(item.enabled) }))
      } finally {
        this.loading = false
      }
    },
    async onToggle(row, val) {
      try {
        await toggleGpfxRule({
          rule_code: row.rule_code,
          enabled: val ? 1 : 0,
          is_test: this.isTest ? 'test_' : '',
        })
        this.$message.success(`${row.rule_code} 已${val ? '开启' : '关闭'}`)
        this.loadRules()
      } catch (e) {
        this.$message.error('切换失败')
        this.loadRules()
      }
    },
  },
}
</script>

<style scoped>
.gpfx-rule-page {
  padding: 16px;
}
.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.tips {
  margin-top: 16px;
  color: #666;
  font-size: 13px;
}
.tips ul {
  padding-left: 18px;
}
</style>
