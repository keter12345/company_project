<template >
  <div class="body">
    <!-- 头部搜索框 -->
    <div></div>
    <!-- 表格部分 -->
    <el-table
      :data="searchVal != '' ? searchInfo : ConceptInfo"
      stripe
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
              <el-table-column prop="rd_datetime" label="返回时间">
              </el-table-column>
              <el-table-column prop="latest_price" label="最新价（元）">
              </el-table-column>
              <el-table-column sortable prop="changpercent" label="涨跌幅 %">
              </el-table-column>
              <el-table-column prop="tradingamount" label="成交额(元)">
              </el-table-column>
              <el-table-column prop="swing" label="振幅  %"> </el-table-column>
              <el-table-column prop="turnoverrate" label="换手率 %">
              </el-table-column>
              <el-table-column sortable prop="zsz" label="总市值">
              </el-table-column>
              <el-table-column prop="ltsz" label="流通市值"> </el-table-column>
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
                      updateStockStatus(
                        props.$index,
                        props.row.bk_code,
                        0,
                        scope.row
                      )
                    "
                    >普通</el-button
                  >
                  <el-button
                    type="warning"
                    plain
                    size="mini"
                    @click="
                      updateStockStatus(
                        props.$index,
                        props.row.bk_code,
                        1,
                        scope.row
                      )
                    "
                    >重要</el-button
                  >
                  <el-button
                    type="danger"
                    plain
                    size="mini"
                    @click="
                      updateStockStatus(
                        props.$index,
                        props.row.bk_code,
                        2,
                        scope.row
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

      <el-table-column label="概念名称" width="180">
        <template slot-scope="scope">
          <el-link :href="scope.row.bk_www" target="_blank">{{
            scope.row.bk_name
          }}</el-link>
        </template></el-table-column
      >
      <el-table-column
        prop="bk_code"
        label="概念代码"
        width="180"
      ></el-table-column>
      <el-table-column sortable prop="bk_zcjl" label="成交量"></el-table-column>
      <el-table-column
        sortable
        prop="bk_changpercent"
        label="涨跌幅"
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
      <el-table-column label="操作">
        <!-- <template slot="header" slot-scope="scope">
          <div>
            、 -->
        <!-- 搜索框 -->
        <!-- <template>
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
            </template> -->
        <!-- </div>
        </template> -->
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="updateConceptLevel(scope.row.bk_code, '0')"
            >正常</el-button
          >
          <el-button
            size="mini"
            type="warning"
            @click="updateConceptLevel(scope.row.bk_code, '1')"
            >热点</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="updateConceptLevel(scope.row.bk_code, '2')"
            >重要热点</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import {
  getAllBKGNInfoAPI,
  updateGNLevelAPI,
  updateGNItemStatusAPI,
} from "../../api/index.js";
export default {
  name: "Concept",
  components: {},
  data() {
    return {
      ConceptInfo: null, //储存所有数据
      searchInfo: [], //存储搜索结果数据
      importLevel: ["正常", "热点", "重要热点"], //概念重要程度分类
      stockStatus: ["普通", "重要", "龙头"], //股票状态分类
      stockSelection: [], //多选框所选中的股票数据
      options: [
        //选择器选项
        {
          value: "概念",
          label: "概念",
        },
        {
          value: "股票",
          label: "股票",
        },
      ],
      searchSelect: "概念", //选择器选择结果，默认“概念”
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
        this.getAllGN();
        this.searchInfo = [];
        this.searchInfo = this.Search(val, this.ConceptInfo);
      },
    },
  },

  methods: {
    // 方法：搜索功能，val：搜索值、info：搜索对象
    Search(val, info) {
      let res = [];
      if (val) {
        if (this.searchSelect == "概念") {
          // 搜索选项为'概念'进行搜索
          res = info.filter(
            (data) =>
              !val ||
              data.bk_code.toString().includes(val) ||
              data.bk_name.toString().includes(val)
          );
        } else if (this.searchSelect == "股票") {
          console.log("股票");
          // 搜索选项为'股票'进行搜索
          info.forEach((item) => {
            item.values = item.values.filter(
              (data) =>
                !val ||
                data.ts_code.toString().includes(val) ||
                data.ts_name.toString().includes(val)
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
    // 方法：获取所有概念信息
    async getAllGN() {
      let res = await getAllBKGNInfoAPI();
      this.ConceptInfo = JSON.parse(res);
    },

    // 方法：修改概念信息重要程度，bk_code, val：修改值
    async updateConceptLevel(bk_code, val) {
      let res = "";
      try {
        res = await updateGNLevelAPI(bk_code, val);
        this.ConceptInfo = JSON.parse(res);
        // 有搜索值时，展示更新后的搜索结果
        if (this.searchVal != "") {
          this.searchInfo = this.Search(this.searchVal, this.ConceptInfo);
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
    async updateStockStatus(index, bk_code, status, row) {
      let data = [];
      if (row == "" || row == null) {
        data = this.stockSelection.map((item) => {
          return item.ts_code;
        });
        if (data.length < 1) {
          this.$message({
            message: "请选择内容",
            type: "warning",
          });
          return;
        }
      } else {
        data.push(row.ts_code);
      }

      let res = await updateGNItemStatusAPI(bk_code, data, status);
      if (res == 1) {
        let info = JSON.parse(await getAllBKGNInfoAPI());
        // 有搜索值时，展示更新后的搜索结果，否则更新所有结果
        if (this.searchVal != "") {
          info = this.Search(this.searchVal, info);
          this.searchInfo[index].values = info[index].values;
        } else {
          this.ConceptInfo[index].values = info[index].values;
        }
        // 更新成功提示框
        this.$message({
          message: "状态更新成功！",
          type: "success",
        });
      } else {
        this.$message({
          message: "状态更新失败",
          type: "warning",
        });
      }
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
    this.getAllGN();
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
