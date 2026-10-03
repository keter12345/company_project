<template>
  <div>
    <el-card class="gpfx-card">
      <div slot="header" class="gpfx-header">
        <div class="gpfx-title">
          <span>gpfx 次日重点监控表</span>
          <el-tag style="margin-left: 10px;" type="info">日期：{{ tradeDate }}</el-tag>
          <el-tag style="margin-left: 8px;" type="warning">时间：{{ asofTimeLabel }}</el-tag>
        </div>
        <div class="gpfx-toolbar">
          <el-switch
            v-model="isTest"
            active-text="测试环境"
            inactive-text="正式环境"
            @change="load"
          />
          <el-select v-model="watchLevel" clearable size="mini" placeholder="监控层级" style="width: 140px;">
            <el-option label="重点监控" value="重点监控" />
            <el-option label="观察池" value="观察池" />
          </el-select>
          <el-select v-model="ruleCode" clearable size="mini" placeholder="规则" style="width: 120px;">
            <el-option v-for="code in ruleCodes" :key="code" :label="code" :value="code" />
          </el-select>
          <el-date-picker
            v-model="tradeDateInput"
            type="date"
            size="mini"
            value-format="yyyy-MM-dd"
            format="yyyy-MM-dd"
            placeholder="选择交易日期"
            clearable
            style="width: 160px;"
          />
          <el-select
            v-model="asofTimeInput"
            clearable
            filterable
            size="mini"
            placeholder="回放时间"
            style="width: 130px;"
          >
            <el-option
              v-for="time in availableTimes"
              :key="time"
              :label="time"
              :value="time"
            />
          </el-select>
          <el-input v-model="limit" size="mini" placeholder="数量" style="width: 90px;" />
          <el-button type="warning" size="mini" :loading="rebuilding" @click="rebuild">重新生成</el-button>
          <el-button type="primary" size="mini" @click="load">刷新</el-button>
        </div>
      </div>

      <el-table :data="rowsFormatted" stripe size="mini" :height="tableHeight" style="width: 100%">
        <el-table-column type="expand" width="42">
          <template slot-scope="scope">
            <el-table :data="scope.row.plate_details_fmt" border stripe size="mini" empty-text="没有关联的受监控板块">
              <el-table-column prop="plate_type_cn" label="类型" width="65" />
              <el-table-column prop="plate_code" label="板块代码" width="90" />
              <el-table-column prop="plate_name" label="板块名称" width="120" />
              <el-table-column prop="state_label" label="前日状态" width="85" />
              <el-table-column prop="avg_chg_fmt" label="前日平均涨幅" width="110" align="right" />
              <el-table-column prop="up_ratio_fmt" label="上涨比例" width="90" align="right" />
              <el-table-column prop="strong_days_fmt" label="近5日强势" width="90" align="center" />
              <el-table-column prop="avg_chg_5d_fmt" label="5日平均涨幅" width="110" align="right" />
              <el-table-column prop="amount_ratio_fmt" label="板块量比5" width="90" align="right" />
              <el-table-column prop="plate_score_fmt" label="板块评分" width="90" align="right" />
              <el-table-column label="是否强势" width="80" align="center">
                <template slot-scope="plateScope">
                  <el-tag :type="plateScope.row.is_strong_plate ? 'success' : 'info'" size="mini">
                    {{ plateScope.row.is_strong_plate ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column prop="monitor_rank" label="排名" width="70" />
        <el-table-column prop="ts_code" label="代码" width="90" />
        <el-table-column prop="ts_name" label="名称" width="120" />
        <el-table-column prop="watch_level" label="层级" width="90" />
        <el-table-column prop="watch_score" label="评分" width="70" />
        <el-table-column prop="main_rule" label="主规则" width="80" />
        <el-table-column prop="sub_rules_text" label="命中规则" min-width="140" />
        <el-table-column prop="industry_names" label="监控行业" width="120" show-overflow-tooltip />
        <el-table-column prop="concept_names" label="监控概念" min-width="220" show-overflow-tooltip />
        <el-table-column prop="strong_plate_names" label="强势关联板块" min-width="180" show-overflow-tooltip />
        <el-table-column prop="strong_plate_count" label="强势板块数" width="95" align="right" />
        <el-table-column prop="plate_strength_fmt" label="板块强度" width="90" align="right" />
        <el-table-column prop="chg_fmt" label="前日涨跌幅" width="90" align="right" />
        <el-table-column prop="amt_ratio20_fmt" label="量比20" width="80" align="right" />
        <el-table-column prop="turn_ratio20_fmt" label="换手比20" width="90" align="right" />
        <el-table-column prop="position20_fmt" label="20日位置" width="90" align="right" />
        <el-table-column prop="amountPrevFmt" label="较前日量" width="90" align="right" />
        <el-table-column prop="amountPrev5Fmt" label="较前5日量" width="100" align="right" />
        <el-table-column prop="observe_reason" label="入池原因" min-width="260" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getGpfxPretradeWatchlist, refreshGpfxPretradeWatchlist } from '@/api/stockshow'

export default {
  name: 'GpfxPretradeWatchlist',
  data() {
    return {
      tradeDate: '',
      tradeDateInput: '',
      asofTime: '',
      asofTimeInput: '',
      availableDates: [],
      availableTimes: [],
      watchLevel: '',
      ruleCode: '',
      limit: 300,
      isTest: false,
      rows: [],
      rebuilding: false,
      ruleCodes: ['P001', 'P003', 'P004', 'R001', 'R004', 'R006', 'R008', 'R011'],
    }
  },
  computed: {
    asofTimeLabel() {
      return this.asofTime ? String(this.asofTime).slice(11, 19) : (this.asofTimeInput || '全部')
    },
    tableHeight() {
      return Math.max(360, window.innerHeight - 220)
    },
    rowsFormatted() {
      const num = (v, digits = 2) => {
        const n = Number(v)
        if (Number.isNaN(n)) return ''
        return n.toFixed(digits)
      }
      return (this.rows || []).map(r => {
        const plateDetails = (r.plate_details || []).map(plate => ({
          ...plate,
          plate_type_cn: plate.plate_type === 'hy' ? '行业' : '概念',
          avg_chg_fmt: plate.avg_changpercent == null ? '' : `${num(plate.avg_changpercent)}%`,
          up_ratio_fmt: plate.up_ratio == null ? '' : `${num(Number(plate.up_ratio) * 100)}%`,
          strong_days_fmt: `${Number(plate.strong_days_5 || 0)}天`,
          avg_chg_5d_fmt: plate.avg_changpercent_5d == null ? '' : `${num(plate.avg_changpercent_5d)}%`,
          amount_ratio_fmt: plate.amount_ratio_ma5 == null ? '' : `${num(plate.amount_ratio_ma5)}倍`,
          plate_score_fmt: num(plate.plate_score),
          is_strong_plate: Number(plate.is_strong_plate || 0),
        }))
        return {
          ...r,
          plate_details_fmt: plateDetails,
          sub_rules_text: Array.isArray(r.sub_rules) ? r.sub_rules.join(',') : (r.sub_rules || ''),
          plate_strength_fmt: num(r.plate_strength),
          chg_fmt: num(r.changpercent),
          amt_ratio20_fmt: num(r.amt_ratio20),
          turn_ratio20_fmt: num(r.turn_ratio20),
          position20_fmt: r.position_20 == null ? '' : `${num(Number(r.position_20) * 100)}%`,
          amountPrevFmt: r.amount_ratio_prev_day == null ? '' : `${num(r.amount_ratio_prev_day)}倍`,
          amountPrev5Fmt: r.amount_ratio_prev5 == null ? '' : `${num(r.amount_ratio_prev5)}倍`,
        }
      })
    }
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
    async load() {
      const params = {
        limit: this.limit,
        is_test: this.isTest ? 'test_' : '',
      }
      if (this.tradeDateInput) params.trade_date = this.tradeDateInput
      if (this.asofTimeInput) params.asof_time = this.asofTimeInput
      if (this.watchLevel) params.watch_level = this.watchLevel
      if (this.ruleCode) params.rule_code = this.ruleCode
      const res = await getGpfxPretradeWatchlist(params)
      if (!res.ok) {
        this.$message.error(res.error || '加载失败')
        return
      }
      this.tradeDate = res.trade_date
      this.tradeDateInput = res.trade_date || this.tradeDateInput
      this.asofTime = res.asof_time || ''
      this.availableDates = res.available_dates || []
      this.availableTimes = res.available_times || []
      if (this.asofTime && !this.asofTimeInput) {
        this.asofTimeInput = String(this.asofTime).slice(11, 19)
      }
      this.rows = res.rows || []
    },
    async rebuild() {
      this.rebuilding = true
      try {
        const params = { is_test: this.isTest ? 'test_' : '' }
        if (this.tradeDateInput) params.trade_date = this.tradeDateInput
        const res = await refreshGpfxPretradeWatchlist(params)
        if (!res.ok) {
          this.$message.error(res.error || '重新生成失败')
          return
        }
        const summary = res.summary || {}
        this.$message.success(`生成完成：${summary.watchlist_rows || 0}只，重点监控${summary.focus_rows || 0}只`)
        await this.load()
      } catch (error) {
        this.$message.error((error && error.message) || '重新生成失败')
      } finally {
        this.rebuilding = false
      }
    },
  },
  watch: {
    tradeDateInput() {
      this.asofTimeInput = ''
      this.asofTime = ''
    },
    isTest() {
      this.tradeDateInput = ''
      this.asofTimeInput = ''
      this.asofTime = ''
      this.availableDates = []
      this.availableTimes = []
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
