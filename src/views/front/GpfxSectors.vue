<template>
  <div>
    <el-card class="gpfx-card">
      <div slot="header" class="gpfx-header">
        <div class="gpfx-title">
          <span>gpfx 热点板块</span>
          <el-tag style="margin-left: 10px;" type="info">日期：{{ tradeDate }}</el-tag>
        </div>
        <div class="gpfx-toolbar">
          <el-select v-model="sectorType" placeholder="类型" size="mini" style="width: 120px;">
            <el-option label="行业" value="hy" />
            <el-option label="概念" value="gn" />
          </el-select>
          <el-input v-model="tradeDateInput" size="mini" placeholder="日期(YYYY-MM-DD，可空)" style="width: 200px;" />
          <el-input v-model="limit" size="mini" placeholder="数量" style="width: 100px;" />
          <el-button type="primary" size="mini" @click="load">刷新</el-button>
        </div>
      </div>

      <el-table
        :data="rowsFormatted"
        stripe
        size="mini"
        :height="tableHeight"
        style="width: 100%"
      >
        <el-table-column prop="bk_name" label="板块" min-width="140" />
        <el-table-column prop="members" label="成分数" width="90" />
        <el-table-column prop="amount_sum_yi" label="成交额(亿)" width="120" align="right" />
        <el-table-column prop="median_chg_pct" label="平均涨跌(%)" width="110" align="right" />
        <el-table-column prop="advancers" label="上涨" width="80" align="right" />
        <el-table-column prop="decliners" label="下跌" width="80" align="right" />
        <el-table-column prop="zt_cnt" label="涨停" width="80" align="right" />
        <el-table-column prop="score_hot" label="热度评分" width="120" align="right" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GpfxSectors',
  data() {
    return {
      tradeDate: '',
      tradeDateInput: '',
      sectorType: 'hy',
      limit: 30,
      rows: [],
    }
  },
  computed: {
    tableHeight() {
      // 预留卡片header/toolbar空间
      return Math.max(360, window.innerHeight - 220)
    },
    rowsFormatted() {
      const toYi = (v) => {
        const n = Number(v)
        if (Number.isNaN(n)) return ''
        return (n / 1e8).toFixed(2)
      }
      const toPct = (v) => {
        const n = Number(v)
        if (Number.isNaN(n)) return ''
        return n.toFixed(2)
      }
      return (this.rows || []).map(r => ({
        ...r,
        amount_sum_yi: toYi(r.amount_sum),
        median_chg_pct: toPct(r.median_chg),
      }))
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
      // 触发 computed 重新计算
      this.$forceUpdate()
    },
    load() {
      const params = {
        sector_type: this.sectorType,
        limit: this.limit,
      }
      if (this.tradeDateInput) params.trade_date = this.tradeDateInput

      this.axios.get('/api/gpfx/sectors/', { params }).then(res => {
        const data = res.data
        if (!data.ok) {
          this.$message.error(data.error || '加载失败')
          return
        }
        this.tradeDate = data.trade_date
        this.rows = data.rows || []
      }).catch(err => {
        console.error(err)
        this.$message.error('请求失败：热点板块接口 /gpfx/sectors/')
      })
    }
  }
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
