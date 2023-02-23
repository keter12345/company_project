<!--  -->
<template>
  <div class="">
    <el-table :data="filinfo" stripe style="width: 100%" height="1000">
      <el-table-column prop="" label="#"></el-table-column>
      <el-table-column prop="" label="股票代码"></el-table-column>
      <el-table-column prop="" label="股票名称"></el-table-column>
      <el-table-column prop="" label="时间"></el-table-column>
      <el-table-column prop="" label="价格"></el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {};
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