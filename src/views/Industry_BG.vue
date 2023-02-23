<template>
  <div class="">
    <el-table :data="filinfo" stripe style="width: 100%" height="1000">
      <el-table-column type="expand">
        <template>
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="测试数据1"> <span>test</span> </el-form-item
            ><br />
            <el-form-item label="测试数据2"> <span>test</span> </el-form-item
            ><br />
            <el-form-item label="测试数据3">
              <span>test</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column
        prop="bk_name"
        label="行业名称"
        width="180"
      ></el-table-column>
      <el-table-column
        prop="bk_code"
        label="行业代码"
        width="180"
      ></el-table-column>
      <el-table-column prop="bak" label="备注"></el-table-column>
      <el-table-column
        prop="zycd"
        label="重要程度"
        :formatter="zycdTag"
        :filters="[
          { text: '正常', value: 0 },
          { text: '热点', value: 1 },
          { text: '重要热点', value: 2 },
        ]"
        :filter-method="filterTag"
        filter-placement="bottom-end"
      ></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="updatebk(scope.row.id, '0')"
            >正常</el-button
          >
          <el-button
            size="mini"
            type="warning"
            @click="updata(scope.row.id, '1')"
            >热点</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="updata(scope.row.id, '2')"
            >重要热点</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "Industry_BG",
  components: {},
  data() {
    return {
      info: null,
      filinfo: [],
      zycdStr: ["正常", "热点", "重要热点"],
    };
  },

  computed: {},

  watch: {},

  methods: {
    updata() {},
  },
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