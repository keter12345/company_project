<template>
  <div>
    <el-card class="gpfx-card">
      <div slot="header" class="gpfx-header">
        <div class="gpfx-title">
          <span>gpfx 候选股票池</span>
          <el-tag style="margin-left: 10px;" type="info">日期：{{ tradeDate }}</el-tag>
        </div>
        <div class="gpfx-toolbar">
          <el-switch
            v-model="isTest"
            active-text="查看测试数据"
            inactive-text="正式数据"
            @change="load"
          />
          <el-select v-model="bucket" placeholder="类型" clearable size="mini" style="width: 140px;">
            <el-option label="龙头" value="leader" />
            <el-option label="跟随" value="follower" />
            <el-option label="妖股" value="monster" />
            <el-option label="观察" value="watch" />
          </el-select>
          <el-input v-model="tradeDateInput" size="mini" placeholder="日期(YYYY-MM-DD，可空)" style="width: 200px;" />
          <el-input v-model="limit" size="mini" placeholder="数量" style="width: 100px;" />
          <el-button type="primary" size="mini" @click="load">刷新</el-button>
        </div>
      </div>

      <el-table
        :data="rows"
        stripe
        size="mini"
        :height="tableHeight"
        style="width: 100%"
      >
        <el-table-column prop="bucketCn" label="类型" width="90" />
        <el-table-column prop="ts_code" label="代码" width="100" />
        <el-table-column prop="ts_name" label="名称" width="140" />
        <el-table-column prop="bk_name" label="板块" min-width="140" />
        <el-table-column prop="rank_in_sector" label="板块排名" width="90" align="right" />
        <el-table-column prop="score" label="成交额(评分)" width="140" align="right" />
        <el-table-column prop="reason" label="入选原因" min-width="260" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GpfxCandidates',
  data() {
    return {
      tradeDate: '',
      tradeDateInput: '',
      bucket: '',
      limit: 200,
      isTest: false,
      rows: [],
    }
  },
  computed: {
    tableHeight() {
      return Math.max(360, window.innerHeight - 220)
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
    load() {
      const params = {
        limit: this.limit,
        is_test: this.isTest ? 'test_' : '',
      }
      if (this.bucket) params.bucket = this.bucket
      if (this.tradeDateInput) params.trade_date = this.tradeDateInput

      // 使用项目统一的 /api/ 代理（utils/request.js baseURL=/api/）
      this.axios.get('/api/gpfx/candidates/', { params }).then(res => {
        const data = res.data
        if (!data.ok) {
          this.$message.error(data.error || '加载失败')
          return
        }
        this.tradeDate = data.trade_date
        const rows = data.rows || []
        const bucketMap = { leader: '龙头', follower: '跟随', monster: '妖股', watch: '观察' }
        this.rows = rows.map(r => ({ ...r, bucketCn: bucketMap[r.bucket] || r.bucket }))
      }).catch(err => {
        console.error(err)
        this.$message.error('请求失败：候选池接口 /gpfx/candidates/')
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
