<template>
  <div class="gpfx-excl-page">
    <el-card shadow="never">
      <div slot="header" class="header">
        <div class="title">gpfx 通用排除表（系统 + 手工）</div>
        <div class="toolbar">
          <el-input v-model="filters.ts_code" size="mini" placeholder="股票代码" style="width: 120px;" />
          <el-select v-model="filters.exclude_type" clearable size="mini" placeholder="类型" style="width: 140px;" @change="loadRows">
            <el-option v-for="t in excludeTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
          <el-input v-model="filters.exclude_subtype" size="mini" placeholder="子类(如 unlock/decrease)" style="width: 170px;" @keyup.enter.native="loadRows" />
          <el-select v-model="filters.source" clearable size="mini" placeholder="来源" style="width: 120px;" @change="loadRows">
            <el-option label="系统" value="system" />
            <el-option label="手工" value="manual" />
          </el-select>
          <el-input v-model="filters.source_key" size="mini" placeholder="规则键(如 unlock_plan)" style="width: 170px;" @keyup.enter.native="loadRows" />
          <el-select v-model="filters.enabled" clearable size="mini" placeholder="状态" style="width: 110px;" @change="loadRows">
            <el-option label="启用" value="1" />
            <el-option label="停用" value="0" />
          </el-select>
          <el-button type="primary" size="mini" @click="loadRows">刷新</el-button>
          <el-button type="warning" size="mini" @click="batchDisable">批量停用(按筛选)</el-button>
          <el-button type="success" size="mini" @click="openAdd">新增手工排除</el-button>
        </div>
      </div>

      <el-table :data="rows" border stripe size="small" v-loading="loading">
        <el-table-column prop="ts_code" label="代码" width="100" />
        <el-table-column prop="ts_name" label="名称" width="120" />
        <el-table-column label="类型" width="110">
          <template slot-scope="scope">
            {{ typeLabel(scope.row.exclude_type) }}
          </template>
        </el-table-column>
        <el-table-column label="子类" width="120">
          <template slot-scope="scope">
            {{ subtypeLabel(scope.row.exclude_subtype) }}
          </template>
        </el-table-column>
        <el-table-column prop="source_key" label="规则键" width="140" show-overflow-tooltip />
        <el-table-column label="来源" width="90">
          <template slot-scope="scope">
            {{ scope.row.source === 'system' ? '系统' : '手工' }}
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用" width="90">
          <template slot-scope="scope">
            <el-tag :type="Number(scope.row.enabled) === 1 ? 'success' : 'info'" size="mini">
              {{ Number(scope.row.enabled) === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="start_date" label="开始" width="110" />
        <el-table-column prop="end_date" label="结束" width="110" />
        <el-table-column prop="exclude_reason" label="原因" min-width="260" show-overflow-tooltip />
        <el-table-column label="操作" width="220" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" @click="openEdit(scope.row)">编辑</el-button>
            <el-button size="mini" @click="toggleEnabled(scope.row)">
              {{ Number(scope.row.enabled) === 1 ? '停用' : '启用' }}
            </el-button>
            <el-button size="mini" type="danger" @click="deleteRow(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="620px">
        <el-form :model="form" label-width="100px" size="mini">
          <el-row :gutter="12">
            <el-col :span="12">
              <el-form-item label="股票代码">
                <el-input v-model="form.ts_code" :disabled="isEdit" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="股票名称">
                <el-input v-model="form.ts_name" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="类型">
                <el-select v-model="form.exclude_type" style="width: 100%;" :disabled="isEdit">
                  <el-option v-for="t in excludeTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="子类">
                <el-input v-model="form.exclude_subtype" :disabled="isEdit" placeholder="如 unlock / decrease / inquiry" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="规则键">
                <el-input v-model="form.source_key" :disabled="isEdit" placeholder="如 unlock_plan / near:litigation" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="来源">
                <el-select v-model="form.source" style="width: 100%;" :disabled="forceSystemEditDisabled">
                  <el-option label="手工" value="manual" />
                  <el-option label="系统" value="system" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="启用">
                <el-select v-model="form.enabled" style="width: 100%;">
                  <el-option label="启用" :value="1" />
                  <el-option label="停用" :value="0" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="开始日期">
                <el-date-picker v-model="form.start_date" type="date" value-format="yyyy-MM-dd" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束日期">
                <el-date-picker v-model="form.end_date" type="date" value-format="yyyy-MM-dd" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="原因">
                <el-input v-model="form.exclude_reason" type="textarea" :rows="2" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div slot="footer">
          <el-button size="mini" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" size="mini" @click="submit">确定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import {
  getGpfxExclusions,
  addGpfxExclusion,
  updateGpfxExclusion,
  deleteGpfxExclusion,
  batchToggleGpfxExclusions,
} from '@/api/stockshow'

export default {
  name: 'GpfxExclusions',
  data() {
    return {
      loading: false,
      rows: [],
      filters: {
        ts_code: '',
        exclude_type: '',
        exclude_subtype: '',
        source: '',
        source_key: '',
        enabled: '',
      },
      excludeTypeOptions: [
        { value: 'st', label: 'ST' },
        { value: 'delist_risk', label: '退市风险' },
        { value: 'bj', label: '北交所' },
        { value: 'illiquid', label: '流动性差' },
        { value: 'manual', label: '手工' },
        { value: 'data_issue', label: '数据问题' },
        { value: 'other', label: '其他' },
      ],
      dialogVisible: false,
      dialogTitle: '新增手工排除',
      isEdit: false,
      form: this.defaultForm(),
    }
  },
  computed: {
    forceSystemEditDisabled() {
      // 允许编辑 system 行（比如停用/原因），但新增默认 manual；这里不做额外限制
      return false
    },
  },
  created() {
    this.loadRows()
  },
  methods: {
    defaultForm() {
      return {
        ts_code: '',
        ts_name: '',
        exclude_type: 'manual',
        exclude_subtype: '',
        source_key: '',
        exclude_reason: '',
        source: 'manual',
        enabled: 1,
        start_date: '',
        end_date: '',
      }
    },
    typeLabel(v) {
      const m = {
        st: 'ST',
        delist_risk: '退市风险',
        bj: '北交所',
        illiquid: '流动性差',
        manual: '手工',
        data_issue: '数据问题',
        other: '其他',
      }
      return m[v] || v
    },
    subtypeLabel(v) {
      const m = {
        unlock: '解禁',
        'decrease:controller': '减持(实控人/一致行动人)',
        'decrease:major': '减持(控股/大股东)',
        'decrease:exec': '减持(董监高)',
        'decrease:other': '减持(其他股东)',
        decrease: '减持',
        inquiry: '问询/关注',
        litigation: '诉讼/仲裁',
        penalty: '处罚/处分',
        suspend: '停牌',
        li_an: '立案/调查',
        delist: '退市/风险警示',
      }
      return m[v] || v
    },
    async loadRows() {
      this.loading = true
      try {
        const res = await getGpfxExclusions({
          ...this.filters,
          ts_code: (this.filters.ts_code || '').trim(),
        })
        this.rows = (res.rows || []).map(r => ({ ...r, enabled: Number(r.enabled) }))
      } finally {
        this.loading = false
      }
    },
    openAdd() {
      this.isEdit = false
      this.dialogTitle = '新增手工排除'
      this.form = this.defaultForm()
      this.dialogVisible = true
    },
    openEdit(row) {
      this.isEdit = true
      this.dialogTitle = `编辑排除项 ${row.ts_code} / ${this.typeLabel(row.exclude_type)} / ${row.exclude_subtype || '-'} / ${row.source_key || '-'}`
      this.form = {
        ts_code: row.ts_code,
        ts_name: row.ts_name,
        exclude_type: row.exclude_type,
        exclude_subtype: row.exclude_subtype || '',
        source_key: row.source_key || '',
        exclude_reason: row.exclude_reason,
        source: row.source,
        enabled: Number(row.enabled),
        start_date: row.start_date || '',
        end_date: row.end_date || '',
      }
      this.dialogVisible = true
    },
    async submit() {
      const payload = { ...this.form }
      payload.ts_code = (payload.ts_code || '').trim().toUpperCase()
      if (!payload.ts_code) {
        this.$message.error('缺少股票代码')
        return
      }
      try {
        if (this.isEdit) {
          await updateGpfxExclusion(payload)
          this.$message.success('更新成功')
        } else {
          await addGpfxExclusion(payload)
          this.$message.success('添加成功')
        }
        this.dialogVisible = false
        this.loadRows()
      } catch (e) {
        this.$message.error('提交失败')
      }
    },
    async toggleEnabled(row) {
      try {
        await updateGpfxExclusion({
          ts_code: row.ts_code,
          exclude_type: row.exclude_type,
          exclude_subtype: row.exclude_subtype || '',
          source_key: row.source_key || '',
          enabled: Number(row.enabled) === 1 ? 0 : 1,
          updated_by: 'ui',
        })
        this.loadRows()
      } catch (e) {
        this.$message.error('操作失败')
      }
    },
    async deleteRow(row) {
      try {
        await this.$confirm(
          `确认删除 ${row.ts_code} / ${this.typeLabel(row.exclude_type)} / ${row.exclude_subtype || '-'} / ${row.source_key || '-'} ?`,
          '提示',
          { type: 'warning' }
        )
        await deleteGpfxExclusion({
          ts_code: row.ts_code,
          exclude_type: row.exclude_type,
          exclude_subtype: row.exclude_subtype || '',
          source_key: row.source_key || '',
        })
        this.$message.success('删除成功')
        this.loadRows()
      } catch (e) {
        // cancel or fail
      }
    },
    async batchDisable() {
      try {
        const f = { ...this.filters }
        await this.$confirm('确认按当前筛选条件批量停用？', '提示', { type: 'warning' })
        const res = await batchToggleGpfxExclusions({
          enabled: 0,
          source: f.source || '',
          exclude_type: f.exclude_type || '',
          exclude_subtype: (f.exclude_subtype || '').trim(),
          source_key: (f.source_key || '').trim(),
          updated_by: 'ui:batch_disable',
        })
        this.$message.success(`已停用 ${res.affected || 0} 条`)
        this.loadRows()
      } catch (e) {
        // cancel or fail
      }
    },
  },
}
</script>

<style scoped>
.gpfx-excl-page {
  padding: 16px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.title {
  font-weight: 600;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
