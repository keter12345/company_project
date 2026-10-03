<template>
  <div class="schedule-page">
    <el-card shadow="never">
      <div slot="header" class="page-header">
        <div>
          <div class="page-title">提示时段与规则</div>
          <div class="page-subtitle">设置每个交易时段的执行时间、计算频率，以及该时段启用的规则。</div>
        </div>
        <div class="header-actions">
          <el-switch v-model="isTest" active-text="测试配置" inactive-text="正式配置" @change="reload" />
          <el-button type="primary" size="small" icon="el-icon-refresh" @click="reload">刷新</el-button>
        </div>
      </div>

      <el-alert
        title="本页面目前负责保存配置；新的实时程序接入后，将严格按照这里的时间和规则执行。"
        type="info"
        :closable="false"
        show-icon
      />

      <div class="section-title">一、选择提示时段</div>
      <div class="slot-grid" v-loading="loading">
        <div
          v-for="slot in slots"
          :key="slot.slot_code"
          class="slot-card"
          :class="{ active: selectedSlotCode === slot.slot_code, disabled: !slot.enabled }"
          @click="selectSlot(slot.slot_code)"
        >
          <div class="slot-top">
            <span class="slot-name">{{ slot.slot_name }}</span>
            <el-tag :type="slot.enabled ? 'success' : 'info'" size="mini">
              {{ slot.enabled ? '启用' : '停用' }}
            </el-tag>
          </div>
          <div class="slot-time">
            {{ slot.start_time }}<span v-if="slot.start_time !== slot.end_time"> — {{ slot.end_time }}</span>
          </div>
          <div class="slot-meta">
            {{ slot.run_mode === 'once' ? '执行一次' : `每 ${slot.interval_seconds} 秒计算` }}
            · {{ slot.send_alert ? '发送提示' : '只生成数据' }}
          </div>
          <div class="slot-bottom">
            <span>已配置 {{ slot.configured_rule_count }} 条 · 实际生效 {{ slot.enabled_rule_count }} 条</span>
            <el-button type="text" size="mini" @click.stop="openSlotDialog(slot)">编辑时段</el-button>
          </div>
        </div>
      </div>

      <div class="section-title rule-title">
        <span>二、设置“{{ selectedSlot ? selectedSlot.slot_name : '-' }}”使用的规则</span>
        <span v-if="selectedSlot" class="default-note">
          默认冷却 {{ selectedSlot.default_cooldown_seconds }} 秒；单条规则留空时使用默认值
        </span>
      </div>

      <el-table :data="rules" border stripe size="small" v-loading="loading" row-key="rule_code">
        <el-table-column type="expand" width="46">
          <template slot-scope="scope">
            <div class="rule-detail">
              <div class="detail-block">
                <div class="detail-label">规则适用场景、具体判断与案例说明</div>
                <div class="detail-text">{{ scope.row.detailed_description || '尚未整理' }}</div>
              </div>
              <div class="detail-block issue-block">
                <div class="detail-label">复核发现 / 待处理问题</div>
                <div class="detail-text">{{ scope.row.known_issues || '暂无' }}</div>
              </div>
              <div v-if="scope.row.examples && scope.row.examples.length" class="detail-block">
                <div class="detail-label">对应股票、时间与板块概念</div>
                <div v-for="(example, index) in scope.row.examples" :key="index" class="example-row">
                  <el-tag size="mini" type="info">{{ example.stock || '未指定股票' }}</el-tag>
                  <span>{{ example.date || '未指定日期' }}</span>
                  <span>{{ example.sector || '未指定板块' }}</span>
                  <span>{{ example.note }}</span>
                </div>
              </div>
              <div v-if="scope.row.params" class="detail-block">
                <div class="detail-label">数据库参数</div>
                <pre class="params-box">{{ formatParams(scope.row.params) }}</pre>
              </div>
              <div v-if="scope.row.rule_remark" class="detail-block">
                <div class="detail-label">原规则备注</div>
                <div class="detail-text">{{ scope.row.rule_remark }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="rule_code" label="编码" width="78" />
        <el-table-column prop="rule_name" label="规则名称" min-width="170" />
        <el-table-column label="来源" width="90">
          <template slot-scope="scope">
            <el-tag :type="originTagType(scope.row.rule_origin)" size="mini">{{ scope.row.rule_origin }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="复核状态" width="125">
          <template slot-scope="scope">
            <el-tag :type="reviewTagType(scope.row.review_status)" size="mini">{{ scope.row.review_status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="implementation_status" label="程序状态" min-width="160" />
        <el-table-column label="规则总开关" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.rule_enabled ? 'success' : 'danger'" size="mini">
              {{ scope.row.rule_enabled ? '已开启' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="本时段启用" width="105">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.binding_enabled"
              :active-value="1"
              :inactive-value="0"
              :disabled="!scope.row.rule_enabled"
              @change="saveBinding(scope.row, true)"
            />
          </template>
        </el-table-column>
        <el-table-column label="执行优先级" width="145">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.binding_priority" :min="1" :max="9999" size="mini" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="冷却秒数" width="145">
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.cooldown_seconds"
              :min="0"
              :max="86400"
              size="mini"
              controls-position="right"
              placeholder="使用时段默认值"
            />
          </template>
        </el-table-column>
        <el-table-column label="每日最多提示" width="150">
          <template slot-scope="scope">
            <el-input-number v-model="scope.row.max_alerts_per_day" :min="1" :max="100" size="mini" controls-position="right" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="85" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="saveBinding(scope.row, false)">保存</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="rules-note">
        生效条件：时间段启用、本时段规则启用、规则总开关启用，三项必须同时满足。
      </div>
    </el-card>

    <el-dialog title="编辑提示时段" :visible.sync="slotDialogVisible" width="620px">
      <el-form :model="slotForm" label-width="130px" size="small">
        <el-form-item label="时段编码">
          <el-input v-model="slotForm.slot_code" disabled />
        </el-form-item>
        <el-form-item label="时段名称">
          <el-input v-model="slotForm.slot_name" maxlength="64" />
        </el-form-item>
        <el-form-item label="执行时间">
          <el-time-picker v-model="slotForm.start_time" value-format="HH:mm:ss" placeholder="开始时间" />
          <span class="time-separator">至</span>
          <el-time-picker v-model="slotForm.end_time" value-format="HH:mm:ss" placeholder="结束时间" />
        </el-form-item>
        <el-form-item label="执行方式">
          <el-radio-group v-model="slotForm.run_mode" @change="onRunModeChange">
            <el-radio label="once">指定时间执行一次</el-radio>
            <el-radio label="interval">时间段内循环执行</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="计算间隔（秒）">
          <el-input-number v-model="slotForm.interval_seconds" :min="slotForm.run_mode === 'once' ? 0 : 1" :max="3600" :disabled="slotForm.run_mode === 'once'" />
        </el-form-item>
        <el-form-item label="默认冷却（秒）">
          <el-input-number v-model="slotForm.default_cooldown_seconds" :min="0" :max="86400" />
        </el-form-item>
        <el-form-item label="是否发送提示">
          <el-switch v-model="slotForm.send_alert" :active-value="1" :inactive-value="0" />
          <span class="field-tip">关闭后只计算和保存结果</span>
        </el-form-item>
        <el-form-item label="是否启用时段">
          <el-switch v-model="slotForm.enabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="时段顺序">
          <el-input-number v-model="slotForm.priority" :min="1" :max="9999" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="slotForm.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="slotDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveSlot">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getGpfxAlertSchedule,
  updateGpfxAlertTimeSlot,
  updateGpfxAlertRuleBinding,
} from '@/api/stockshow'

export default {
  name: 'GpfxAlertSchedule',
  data() {
    return {
      loading: false,
      saving: false,
      isTest: false,
      slots: [],
      rules: [],
      selectedSlotCode: '',
      slotDialogVisible: false,
      slotForm: {},
    }
  },
  computed: {
    selectedSlot() {
      return this.slots.find(item => item.slot_code === this.selectedSlotCode)
    },
  },
  created() {
    this.reload()
  },
  methods: {
    envParams() {
      return { is_test: this.isTest ? 'test_' : '' }
    },
    async reload() {
      this.loading = true
      try {
        const res = await getGpfxAlertSchedule({
          ...this.envParams(),
          slot_code: this.selectedSlotCode,
        })
        this.slots = res.slots || []
        this.selectedSlotCode = res.selected_slot || ''
        this.rules = (res.rules || []).map(row => ({ ...row }))
      } catch (error) {
        this.$message.error((error.response && error.response.data && error.response.data.error) || '读取提示时段失败')
      } finally {
        this.loading = false
      }
    },
    async selectSlot(slotCode) {
      if (this.selectedSlotCode === slotCode) return
      this.selectedSlotCode = slotCode
      await this.reload()
    },
    openSlotDialog(slot) {
      this.slotForm = { ...slot }
      this.slotDialogVisible = true
    },
    onRunModeChange(mode) {
      if (mode === 'once') {
        this.slotForm.end_time = this.slotForm.start_time
        this.slotForm.interval_seconds = 0
      } else if (!this.slotForm.interval_seconds) {
        this.slotForm.interval_seconds = 5
      }
    },
    async saveSlot() {
      if (this.slotForm.run_mode === 'once') {
        this.slotForm.end_time = this.slotForm.start_time
        this.slotForm.interval_seconds = 0
      }
      this.saving = true
      try {
        await updateGpfxAlertTimeSlot({ ...this.slotForm, ...this.envParams() })
        this.$message.success('时间段保存成功')
        this.slotDialogVisible = false
        await this.reload()
      } catch (error) {
        this.$message.error((error.response && error.response.data && error.response.data.error) || '保存时间段失败')
      } finally {
        this.saving = false
      }
    },
    async saveBinding(row, fromSwitch) {
      try {
        await updateGpfxAlertRuleBinding({
          ...this.envParams(),
          slot_code: this.selectedSlotCode,
          rule_code: row.rule_code,
          enabled: row.binding_enabled,
          priority: row.binding_priority,
          cooldown_seconds: row.cooldown_seconds,
          max_alerts_per_day: row.max_alerts_per_day,
          remark: row.binding_remark || '',
        })
        this.$message.success(`${row.rule_code} 配置已保存`)
        await this.reload()
      } catch (error) {
        this.$message.error((error.response && error.response.data && error.response.data.error) || '保存规则配置失败')
        if (fromSwitch) await this.reload()
      }
    },
    originTagType(origin) {
      if (origin === '本轮新增') return 'warning'
      if (origin === '周二起新增') return 'success'
      if (origin === '前期新增') return 'primary'
      return 'info'
    },
    reviewTagType(status) {
      if (status === '数字已确认') return 'success'
      if ((status || '').includes('等待') || (status || '').includes('待修复') || (status || '').includes('待重构')) return 'danger'
      return 'warning'
    },
    formatParams(params) {
      if (!params) return ''
      if (typeof params === 'string') return params
      return JSON.stringify(params, null, 2)
    },
  },
}
</script>

<style scoped>
.schedule-page {
  padding: 16px;
}
.page-header,
.header-actions,
.slot-top,
.slot-bottom,
.rule-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.page-subtitle {
  margin-top: 5px;
  color: #909399;
  font-size: 13px;
}
.header-actions {
  gap: 14px;
}
.section-title {
  margin: 22px 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(245px, 1fr));
  gap: 12px;
}
.slot-card {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 14px;
  cursor: pointer;
  background: #fff;
  transition: all 0.2s;
}
.slot-card:hover,
.slot-card.active {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.18);
}
.slot-card.active {
  background: #f5f9ff;
}
.slot-card.disabled {
  opacity: 0.62;
}
.slot-name {
  font-weight: 600;
  color: #303133;
}
.slot-time {
  margin-top: 12px;
  font-size: 19px;
  font-variant-numeric: tabular-nums;
  color: #409eff;
}
.slot-meta,
.slot-bottom,
.default-note,
.rules-note,
.field-tip {
  color: #909399;
  font-size: 12px;
}
.slot-meta {
  margin-top: 7px;
}
.slot-bottom {
  margin-top: 10px;
  border-top: 1px solid #ebeef5;
  padding-top: 7px;
}
.rule-title {
  gap: 15px;
}
.default-note {
  font-weight: normal;
}
.rules-note {
  margin-top: 12px;
}

.rule-detail {
  padding: 4px 24px 14px 68px;
  line-height: 1.75;
}

.detail-block + .detail-block {
  margin-top: 14px;
}

.detail-label {
  margin-bottom: 4px;
  color: #303133;
  font-weight: 600;
}

.detail-text {
  color: #606266;
  white-space: pre-wrap;
}

.issue-block {
  padding: 10px 12px;
  border-left: 3px solid #e6a23c;
  background: #fdf6ec;
}

.example-row {
  display: grid;
  grid-template-columns: 210px 170px minmax(180px, 260px) 1fr;
  gap: 10px;
  align-items: start;
  padding: 7px 0;
  border-bottom: 1px dashed #ebeef5;
  color: #606266;
}

.params-box {
  max-height: 260px;
  margin: 0;
  padding: 10px 12px;
  overflow: auto;
  border-radius: 4px;
  background: #f5f7fa;
  color: #606266;
  font-size: 12px;
}
.time-separator {
  margin: 0 10px;
  color: #909399;
}
.field-tip {
  margin-left: 10px;
}
</style>
