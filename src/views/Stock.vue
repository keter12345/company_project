<template>
  <div class="">
    <div>
      <el-table :data="stockInfo" stripe style="width: 100%" height="1000">
        <el-table-column prop="" label="股票代码"></el-table-column>
        <el-table-column prop="" label="股票名称"></el-table-column>
        <el-table-column prop="" label="更新时间"></el-table-column>
        <el-table-column prop="" label="成交额程度"></el-table-column>
        <el-table-column prop="" label="买入金额"></el-table-column>
        <el-table-column prop="" label="涨跌幅"></el-table-column>
        <el-table-column prop="" label="倍数"></el-table-column>
        <el-table-column prop="" label="1年涨停数"></el-table-column>
        <el-table-column prop="" label="1年连续涨停"></el-table-column>
        <el-table-column prop="" label="1分买入金额"></el-table-column>
        <el-table-column prop="" label="1分钟倍数"></el-table-column>
        <el-table-column prop="" label="5分买入金额"></el-table-column>
        <el-table-column prop="" label="5分钟倍数"></el-table-column>
        <el-table-column prop="" label="10分买入金额"></el-table-column>
        <el-table-column prop="" label="10分钟倍数"></el-table-column>
        <el-table-column prop="" label="程度"></el-table-column>
        <el-table-column prop="" label="换手率"></el-table-column>
        <el-table-column prop="" label="5分钟倍数"></el-table-column>
        <el-table-column prop="" label="行业"></el-table-column>
        <el-table-column prop="" label="概念"></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      stockInfo: null,
    };
  },

  computed: {},

  watch: {},

  methods: {},
  beforeCreate() {}, //生命周期 - 创建之前
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  beforeMount() {}, //生命周期 - 挂载之前
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style>
</style>