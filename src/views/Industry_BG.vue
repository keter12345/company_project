<template>
  <div class="">
    <el-table :data="BGInfo" stripe style="width: 100%">
      <!-- 子模块 -->
      <el-table-column type="expand">
        <template slot-scope="props">
          <div style="margin: 0px 40px">
            <div>
              <el-button
                type="primary"
                plain
                size="mini"
                @click="updateItemStatus(0)"
                >普通</el-button
              >
              <el-button
                type="warning"
                plain
                size="mini"
                @click="updateItemStatus(1)"
                >重要</el-button
              >
              <el-button
                type="danger"
                plain
                size="mini"
                @click="updateStatus(2)"
                >龙头</el-button
              >
              <el-button plain size="mini" @click="clear()">取消选择</el-button>
            </div>
            <el-table
              ref="ItemTable"
              height="550px"
              :data="props.row.ItemInfo"
              tooltip-effect="dark"
              style="width: 100%"
              @selection-change="ItemSelectionChange"
            >
              <el-table-column type="selection" width="45"> </el-table-column>
              <el-table-column
                prop="ts_code"
                label="股票代码"
              ></el-table-column>
              <el-table-column prop="ts_name" label="股票名称">
              </el-table-column>
              <el-table-column
                prop="status"
                label="状态"
                :formatter="statusTag"
                :filters="[
                  { text: '普通', value: 0 },
                  { text: '重要', value: 1 },
                  { text: '龙头', value: 2 },
                ]"
                :filter-method="statusFilterTag"
                filter-placement="bottom-end"
              >
              </el-table-column>
            </el-table>
          </div>
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
        :filter-method="zycdFilterTag"
        filter-placement="bottom-end"
      ></el-table-column>
      <el-table-column align="right">
        <template slot="header" slot-scope="scope">
          <el-input
            v-model="search"
            size="mini"
            placeholder="请输入关键字搜索"
          />
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="updateBGLevel(scope.row.id, 0)"
            >正常</el-button
          >
          <el-button
            size="mini"
            type="warning"
            @click="updateBGLevel(scope.row.id, 1)"
            >热点</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="updateBGLevel(scope.row.id, 2)"
            >重要热点</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getAllBGListAPI, updateBGLevelAPI } from "../api/index.js";
export default {
  name: "Industry_BG",
  components: {},
  data() {
    return {
      BGInfo: null,
      zycdStr: ["正常", "热点", "重要热点"],
      statusStr: ["普通", "重要", "龙头"],
      ItemSelection: [],
      search: null,
    };
  },

  computed: {},

  watch: {},

  methods: {
    // 获取所有行业信息
    async getAllBG() {
      let res = await getAllBGListAPI();
      console.log("行业数据");
      console.log(res);
      this.BGInfo = res;
    },
    // 修改行业信息重要程度
    async updateBGLevel(id, val) {
      let res = await updateBGLevelAPI(id, val);
      console.log("修改后行业数据");
      console.log(res);
      this.BGInfo = res;
    },
    // 修改股票状态
    updateItemStatus() {},
    zycdTag(row, cloumn) {
      return this.zycdStr[row.zycd];
    },
    zycdFilterTag(value, row) {
      return value === row.zycd;
    },
    statusTag(row, cloumn) {
      return this.statusStr[row.status];
    },
    statusFilterTag(value, row) {
      return value === row.status;
    },
    ItemSelectionChange(val) {
      this.ItemSelection = val;
      console.log(this.ItemSelection);
    },
    clear() {
      this.$refs.ItemTable.clearSelection();
    },
    updateStatus(val) {
      let str = this.BKInfo[0].ItemInfo;
      this.ItemSelection.forEach((item) => {
        for (let i = 0; i < str.length; i++) {
          if (item.ts_code === str[i].ts_code) {
            this.BKInfo[0].ItemInfo[i].status = val;
          }
        }
      });
    },
  },
  beforeCreate() {}, //生命周期 - 创建之前
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getAllBG();
  },
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
<style></style>
