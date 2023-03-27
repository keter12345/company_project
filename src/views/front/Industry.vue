<template >
  <div class="body">
    <!-- 表格部分 -->
    <el-table
      :data="searchVal != '' ? searchInfo : IndustryInfo"
      stripe
      height="100vh"
      style="width: 100%"
    >
      <!-- 子模块 -->
      <el-table-column type="expand">
        <template slot-scope="props">
          <div style="margin: 0px 40px">
            <div>
              <el-button plain size="mini" @click="clear()">取消选择</el-button>
              <el-button
                type="primary"
                plain
                size="mini"
                @click="updateStockStatus(props.$index, props.row.bk_code, 0)"
                >普通</el-button
              >
              <el-button
                type="warning"
                plain
                size="mini"
                @click="updateStockStatus(props.$index, props.row.bk_code, 1)"
                >重要</el-button
              >
              <el-button
                type="danger"
                plain
                size="mini"
                @click="updateStockStatus(props.$index, props.row.bk_code, 2)"
                >龙头</el-button
              >
            </div>
            <!-- 股票部分表格 start-->
            <el-table
              ref="stockTable"
              max-height="550px"
              :data="props.row.values"
              tooltip-effect="dark"
              style="width: 100%"
              @selection-change="StockSelectionChange"
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
              <el-table-column align="right">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    plain
                    size="mini"
                    @click="
                      updateStockStatusSingly(
                        scope.row,
                        props.$index,
                        props.row.bk_code,
                        0
                      )
                    "
                    >普通</el-button
                  >
                  <el-button
                    type="warning"
                    plain
                    size="mini"
                    @click="
                      updateStockStatusSingly(
                        scope.row,
                        props.$index,
                        props.row.bk_code,
                        1
                      )
                    "
                    >重要</el-button
                  >
                  <el-button
                    type="danger"
                    plain
                    size="mini"
                    @click="
                      updateStockStatusSingly(
                        scope.row,
                        props.$index,
                        props.row.bk_code,
                        2
                      )
                    "
                    >龙头</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <!-- 股票部分表格 end-->
          </div>
        </template>
      </el-table-column>

      <el-table-column label="行业名称" width="180">
        <template slot-scope="scope">
          <el-link :href="scope.row.bk_www" target="_blank">{{
            scope.row.bk_name
          }}</el-link>
        </template></el-table-column
      >
      <el-table-column
        prop="bk_code"
        label="行业代码"
        width="180"
      ></el-table-column>
      <el-table-column label="备注"> </el-table-column>
      <el-table-column
        prop="zycd"
        label="重要程度"
        :formatter="zycdTag"
        :filters="[
          { text: '正常', value: '0' },
          { text: '热点', value: '1' },
          { text: '重要热点', value: '2' },
        ]"
        :filter-method="zycdFilterTag"
        filter-placement="bottom-end"
      ></el-table-column>
      <el-table-column align="right">
        <template slot="header" slot-scope="scope">
          <div>
            、
            <!-- 搜索框 -->
            <template>
              <el-input
                placeholder="请输入搜索内容"
                v-model="searchVal"
                class="input-with-select"
              >
                <el-select
                  v-model="searchSelect"
                  slot="prepend"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-input>
            </template>
          </div>
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="updateIndustryLevel(scope.row.bk_code, '0')"
            >正常</el-button
          >
          <el-button
            size="mini"
            type="warning"
            @click="updateIndustryLevel(scope.row.bk_code, '1')"
            >热点</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="updateIndustryLevel(scope.row.bk_code, '2')"
            >重要热点</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {
  getAllBGListAPI,
  updateBGLevelAPI,
  updateItemStatusAPI,
} from "../../api/index.js";
export default {
  name: "Industry",
  components: {},
  data() {
    return {
      IndustryInfo: null, //储存所有数据
      searchInfo: [], //存储搜索结果数据
      importLevel: ["正常", "热点", "重要热点"], //行业重要程度分类
      stockStatus: ["普通", "重要", "龙头"], //股票状态分类
      stockSelection: [], //多选框所选中的股票数据
      options: [
        //选择器选项
        {
          value: "行业",
          label: "行业",
        },
        {
          value: "股票",
          label: "股票",
        },
      ],
      searchSelect: "行业", //选择器选择结果，默认“行业”
      searchVal: "", //搜索值
    };
  },
  computed: {},
  // 数据监听
  watch: {
    // 搜索值改变时自动返回搜索结果
    searchVal: {
      handler(val, oldVal) {
        // 搜索前数据刷新
        this.getAllBG();
        this.searchInfo = [];
        this.searchInfo = this.Search(val, this.IndustryInfo);
      },
    },
  },

  methods: {
    // 方法：搜索功能，val：搜索值、info：搜索对象
    Search(val, info) {
      let res = [];
      if (val) {
        if (this.searchSelect == "行业") {
          // 搜索选项为'行业'进行搜索
          res = info.filter(
            (data) =>
              !val || data.bk_code.includes(val) || data.bk_name.includes(val)
          );
        } else if (this.searchSelect == "股票") {
          // 搜索选项为'股票'进行搜索
          info.forEach((item) => {
            item.values = item.values.filter(
              (data) =>
                !val || data.ts_code.includes(val) || data.ts_name.includes(val)
            );
            if (item.values.length > 0) {
              // 搜索结果赋值
              res.push(item);
            }
          });
        }
      }
      // 返回结果
      return res;
    },
    // 方法：获取所有行业信息
    async getAllBG() {
      let res = await getAllBGListAPI();
      this.IndustryInfo = JSON.parse(res);
    },

    // 方法：修改行业信息重要程度，bk_code, val：修改值
    async updateIndustryLevel(bk_code, val) {
      let res = "";
      try {
        res = await updateBGLevelAPI(bk_code, val);
        this.IndustryInfo = JSON.parse(res);
        // 有搜索值时，展示更新后的搜索结果
        if (this.searchVal != "") {
          this.searchInfo = this.Search(this.searchVal, this.IndustryInfo);
        }
        // 更新成功提示框
        this.$message({
          message: "重要程度更新成功！",
          type: "success",
        });
      } catch (error) {
        // 更新失败提示框
        this.$message({
          message: "重要程度更新失败",
          type: "warning",
        });
      }
    },
    // 方法：修改股票状态
    async updateStockStatus(index, bk_code, status) {
      let res = "";
      try {
        // 立即执行函数解决for循环异步问题
        (async () => {
          for (let i = 0; i < this.stockSelection.length; i++) {
            res = JSON.parse(
              await updateItemStatusAPI(
                bk_code,
                this.stockSelection[i].ts_code,
                status
              )
            );
          }
          // 有搜索值时，展示更新后的搜索结果，否则更新所有结果
          if (this.searchVal != "") {
            res = this.Search(this.searchVal, res);
            this.searchInfo[index].values = res[index].values;
          } else {
            this.IndustryInfo[index].values = res[index].values;
          }
        })();
        // 更新成功提示框
        this.$message({
          message: "状态更新成功！",
          type: "success",
        });
      } catch (error) {
        // 更新失败提示框
        this.$message({
          message: "状态更新失败",
          type: "warning",
        });
      }
    },
    // 方法：单独修改股票方法
    updateStockStatusSingly(row, index, bk_code, status) {
      this.stockSelection = [row];
      this.updateStockStatus(index, bk_code, status);
    },
    // 根据重要程度展示对应文字
    zycdTag(row, cloumn) {
      return this.importLevel[row.zycd];
    },
    // 根据重要程度实现筛选
    zycdFilterTag(value, row) {
      return value === row.zycd;
    },
    statusTag(row, cloumn) {
      return this.stockStatus[row.status];
    },
    statusFilterTag(value, row) {
      return value === row.status;
    },
    StockSelectionChange(val) {
      this.stockSelection = val;
    },
    // 取消多选框选择
    clear() {
      this.$refs.stockTable.clearSelection();
    },
  },
  created() {
    console.log("create");
    this.getAllBG();
  },
};
</script>
<style>
.body {
  margin: 0;
  padding: 0;
}
.el-select .el-input {
  width: 130px;
}
</style>
