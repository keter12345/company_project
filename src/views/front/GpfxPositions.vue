<template>
  <div class="gpfx-position-page">
    <el-card class="gpfx-card">
      <div slot="header" class="gpfx-header">
        <div class="gpfx-title">gpfx 持仓录入与卖出监控</div>
        <div class="gpfx-toolbar">
          <el-switch v-model="isTest" active-text="查看测试数据" inactive-text="正式数据" />
          <el-select v-model="searchStatus" clearable size="mini" placeholder="持仓状态" style="width: 140px;">
            <el-option label="holding" value="holding" />
            <el-option label="partial_sold" value="partial_sold" />
            <el-option label="closed" value="closed" />
          </el-select>
          <el-input v-model="searchCode" size="mini" placeholder="股票代码" style="width: 140px;" />
          <el-input v-model="searchSource" size="mini" placeholder="来源 source" style="width: 140px;" />
          <el-button type="primary" size="mini" @click="loadAll">刷新</el-button>
          <el-button v-if="!isTest" type="success" size="mini" @click="openAddDialog">新增持仓</el-button>
        </div>
      </div>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-card shadow="never" class="inner-card">
            <div slot="header" class="inner-header">
              <span>持仓记录</span>
            </div>
            <el-table :data="positionRowsFormatted" stripe size="mini" :height="tableHeight" style="width: 100%">
              <el-table-column prop="ts_code" label="代码" width="90" />
              <el-table-column prop="ts_name" label="名称" width="100" />
              <el-table-column prop="buy_datetime" label="买入时间" width="160" />
              <el-table-column prop="buy_price_fmt" label="买入价" width="90" align="right" />
              <el-table-column prop="buy_qty_fmt" label="数量" width="90" align="right" />
              <el-table-column label="状态" width="100">
                <template slot-scope="scope">
                  <el-tag size="mini" :type="positionStatusTagType(scope.row.status)">{{ positionStatusText(scope.row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="buy_rule_code" label="买入规则" width="90" />
              <el-table-column v-if="!isTest" label="操作" width="170" fixed="right">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="openEditDialog(scope.row)">编辑</el-button>
                  <el-button type="danger" size="mini" @click="deleteRow(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card shadow="never" class="inner-card">
            <div slot="header" class="inner-header">
              <span>卖出监控</span>
              <el-tag size="mini" type="info" style="margin-left: 8px;">实时输出</el-tag>
            </div>
            <el-table :data="sellSignalRowsFormatted" stripe size="mini" :row-class-name="sellRowClassName" :height="tableHeight" style="width: 100%">
              <el-table-column prop="ts_code" label="代码" width="90" />
              <el-table-column prop="ts_name" label="名称" width="100" />
              <el-table-column label="卖出状态" width="110">
                <template slot-scope="scope">
                  <el-tag size="mini" :type="sellStatusTagType(scope.row.sell_status)">{{ scope.row.sell_status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="sell_rule_code" label="规则" width="80" />
              <el-table-column prop="latest_price_fmt" label="最新价" width="90" align="right" />
              <el-table-column prop="float_pnl_fmt" label="浮盈亏" width="100" align="right" />
              <el-table-column prop="chg_from_buy_pct" label="盈亏比例" width="100" align="right" />
              <el-table-column prop="trailing_stop_price_fmt" label="动态保护位" width="100" align="right" />
              <el-table-column prop="buy_day_high_fmt" label="买入日高点" width="100" align="right" />
              <el-table-column prop="buy_day_low_fmt" label="买入日低点" width="100" align="right" />
              <el-table-column label="板块/龙头预警" width="110">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.sector_warning" size="mini" type="danger">预警</el-tag>
                  <el-tag v-else size="mini" type="info">正常</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="current_net_buy_yi" label="当前净买入(亿)" width="120" align="right" />
              <el-table-column prop="latest_tick_time" label="最新时间" width="150" />
              <el-table-column prop="sell_plan" label="卖出建议" min-width="220" show-overflow-tooltip />
              <el-table-column prop="reason" label="原因" min-width="260" show-overflow-tooltip />
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <el-card shadow="never" class="inner-card" style="margin-top: 16px;">
        <div slot="header" class="inner-header">
          <span>卖出规则说明</span>
        </div>
        <el-table :data="ruleRows" stripe size="mini" style="width: 100%">
          <el-table-column prop="rule_code" label="规则编码" width="120" />
          <el-table-column prop="rule_name" label="规则名称" width="180" />
          <el-table-column prop="meaning" label="说明" min-width="420" />
        </el-table>
      </el-card>
    </el-card>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="620px">
      <el-form :model="editForm" label-width="100px" size="mini">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="股票代码">
              <el-input v-model="editForm.ts_code" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="股票名称">
              <el-input v-model="editForm.ts_name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="买入时间">
              <el-date-picker
                v-model="editForm.buy_datetime"
                type="datetime"
                placeholder="选择买入时间"
                style="width: 100%;"
                value-format="yyyy-MM-dd HH:mm:ss"
                format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="买入价格">
              <el-input v-model="editForm.buy_price" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="买入数量">
              <el-input v-model="editForm.buy_qty" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="买入金额">
              <el-input v-model="editForm.buy_amount" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源">
              <el-input v-model="editForm.source" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="持仓状态">
              <el-select v-model="editForm.status" style="width: 100%;">
                <el-option label="holding" value="holding" />
                <el-option label="partial_sold" value="partial_sold" />
                <el-option label="closed" value="closed" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="买入规则编码">
              <el-input v-model="editForm.buy_rule_code" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="买入规则名称">
              <el-input v-model="editForm.buy_rule_name" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="买入原因">
              <el-input v-model="editForm.buy_reason" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="editForm.remark" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" size="mini" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getGpfxPositions,
  addGpfxPosition,
  updateGpfxPosition,
  deleteGpfxPosition,
  getGpfxPositionSellSignals,
  getGpfxSellRuleSchema,
} from '../../api/stockshow'

export default {
  name: 'GpfxPositions',
  data() {
    return {
      searchStatus: 'holding',
      searchCode: '',
      searchSource: '',
      isTest: false,
      positionRows: [],
      sellSignalRows: [],
      ruleRows: [],
      dialogVisible: false,
      dialogTitle: '新增持仓',
      editForm: this.defaultForm(),
    }
  },
  computed: {
    tableHeight() {
      return Math.max(320, window.innerHeight - 280)
    },
    positionRowsFormatted() {
      return (this.positionRows || []).map(r => ({
        ...r,
        buy_price_fmt: this.formatNum(r.buy_price),
        buy_qty_fmt: this.formatNum(r.buy_qty, 0),
      }))
    },
    sellSignalRowsFormatted() {
      const rows = (this.sellSignalRows || []).map(r => {
        const latestPrice = Number(r.latest_price)
        const buyPrice = Number(r.buy_price)
        const buyQty = Number(r.buy_qty)
        const floatPnl = (!Number.isNaN(latestPrice) && !Number.isNaN(buyPrice) && !Number.isNaN(buyQty))
          ? (latestPrice - buyPrice) * buyQty
          : null
        return {
          ...r,
          latest_price_fmt: this.formatNum(r.latest_price),
          float_pnl: floatPnl,
          float_pnl_fmt: this.formatNum(floatPnl),
          chg_from_buy_pct: this.formatPct(r.chg_from_buy),
          trailing_stop_price_fmt: this.formatNum(r.trailing_stop_price),
          buy_day_high_fmt: this.formatNum(r.buy_day_high),
          buy_day_low_fmt: this.formatNum(r.buy_day_low),
          current_net_buy_yi: this.formatYi(r.current_net_buy),
        }
      })
      const rankMap = {
        '止损卖出': 1,
        '清仓卖出': 2,
        '止盈卖出': 3,
        '减仓观察': 4,
        '风险预警': 5,
        '继续持有': 6,
      }
      return rows.sort((a, b) => {
        const ra = rankMap[a.sell_status] || 99
        const rb = rankMap[b.sell_status] || 99
        if (ra !== rb) return ra - rb
        return (Number(b.float_pnl) || 0) - (Number(a.float_pnl) || 0)
      })
    },
  },
  mounted() {
    this.loadAll()
    this.loadRuleSchema()
    window.addEventListener('resize', this.onResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    defaultForm() {
      return {
        id: null,
        ts_code: '',
        ts_name: '',
        buy_datetime: '',
        buy_price: '',
        buy_qty: '',
        buy_amount: '',
        source: 'manual',
        status: 'holding',
        buy_rule_code: '',
        buy_rule_name: '',
        buy_reason: '',
        remark: '',
      }
    },
    onResize() {
      this.$forceUpdate()
    },
    formatNum(v, digits = 2) {
      const n = Number(v)
      if (Number.isNaN(n)) return ''
      return n.toFixed(digits)
    },
    formatPct(v) {
      const n = Number(v)
      if (Number.isNaN(n)) return ''
      return (n * 100).toFixed(2) + '%'
    },
    formatYi(v) {
      const n = Number(v)
      if (Number.isNaN(n)) return ''
      return (n / 1e8).toFixed(2)
    },
    positionStatusText(v) {
      const mp = {
        holding: '持有中',
        partial_sold: '部分卖出',
        closed: '已清仓',
      }
      return mp[v] || v || ''
    },
    positionStatusTagType(v) {
      const mp = {
        holding: 'success',
        partial_sold: 'warning',
        closed: 'info',
      }
      return mp[v] || 'info'
    },
    sellStatusTagType(v) {
      const mp = {
        '继续持有': 'success',
        '减仓观察': 'warning',
        '止盈卖出': 'success',
        '止损卖出': 'danger',
        '清仓卖出': 'danger',
        '风险预警': 'info',
      }
      return mp[v] || 'info'
    },
    sellRowClassName({ row }) {
      if (row.sell_status === '止损卖出' || row.sell_status === '清仓卖出') return 'row-danger'
      if (row.sell_status === '减仓观察') return 'row-warning'
      if (row.sell_status === '止盈卖出') return 'row-profit'
      return ''
    },
    async loadAll() {
      await Promise.all([this.loadPositions(), this.loadSellSignals()])
    },
    async loadPositions() {
      const params = { is_test: this.isTest ? 'test_' : '' }
      if (this.searchStatus) params.status = this.searchStatus
      if (this.searchCode) params.ts_code = this.searchCode
      if (this.searchSource) params.source = this.searchSource
      try {
        const res = await getGpfxPositions(params)
        if (!res.ok) {
          this.$message.error(res.error || '持仓记录加载失败')
          return
        }
        this.positionRows = res.rows || []
      } catch (err) {
        console.error(err)
        this.$message.error('请求失败：持仓记录接口 /gpfx/positions/')
      }
    },
    async loadSellSignals() {
      try {
        const res = await getGpfxPositionSellSignals({ is_test: this.isTest ? 'test_' : '' })
        if (!res.ok) {
          this.$message.error(res.error || '卖出监控加载失败')
          return
        }
        this.sellSignalRows = res.rows || []
      } catch (err) {
        console.error(err)
        this.$message.error('请求失败：卖出监控接口 /gpfx/positions/sell-signals/')
      }
    },
    async loadRuleSchema() {
      try {
        const res = await getGpfxSellRuleSchema({})
        if (!res.ok) {
          this.$message.error(res.error || '规则说明加载失败')
          return
        }
        this.ruleRows = res.rules || []
      } catch (err) {
        console.error(err)
        this.$message.error('请求失败：规则说明接口 /gpfx/sell-rule-schema/')
      }
    },
    openAddDialog() {
      this.dialogTitle = '新增持仓'
      this.editForm = this.defaultForm()
      this.dialogVisible = true
    },
    openEditDialog(row) {
      this.dialogTitle = '编辑持仓'
      this.editForm = {
        id: row.Id || row.id,
        ts_code: row.ts_code || '',
        ts_name: row.ts_name || '',
        buy_datetime: row.buy_datetime || '',
        buy_price: row.buy_price || '',
        buy_qty: row.buy_qty || '',
        buy_amount: row.buy_amount || '',
        source: row.source || 'manual',
        status: row.status || 'holding',
        buy_rule_code: row.buy_rule_code || '',
        buy_rule_name: row.buy_rule_name || '',
        buy_reason: row.buy_reason || '',
        remark: row.remark || '',
      }
      this.dialogVisible = true
    },
    async submitForm() {
      const params = { ...this.editForm }
      try {
        if (params.id) {
          params.Id = params.id
          const res = await updateGpfxPosition(params)
          if (!res.ok) {
            this.$message.error(res.error || '更新失败')
            return
          }
          this.$message.success(res.message || '更新成功')
        } else {
          const res = await addGpfxPosition(params)
          if (!res.ok) {
            this.$message.error(res.error || '新增失败')
            return
          }
          this.$message.success(res.message || '新增成功')
        }
        this.dialogVisible = false
        this.loadAll()
      } catch (err) {
        console.error(err)
        this.$message.error('保存失败，请检查输入内容')
      }
    },
    async deleteRow(row) {
      try {
        await this.$confirm('此操作将删除该持仓记录，是否继续？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        const res = await deleteGpfxPosition({ Id: row.Id || row.id })
        if (!res.ok) {
          this.$message.error(res.error || '删除失败')
          return
        }
        this.$message.success(res.message || '删除成功')
        this.loadAll()
      } catch (err) {
        if (err !== 'cancel') {
          console.error(err)
          this.$message.error('删除失败')
        }
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
.inner-card {
  margin-bottom: 0;
}
.inner-header {
  display: flex;
  align-items: center;
}

/deep/ .el-table .row-danger {
  background: #fff1f0;
}

/deep/ .el-table .row-warning {
  background: #fff7e6;
}

/deep/ .el-table .row-profit {
  background: #f6ffed;
}
</style>
