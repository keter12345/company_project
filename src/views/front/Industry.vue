<template >
  <div class="body">
    <!-- 头部搜索按钮 -->
    <div class="search">
      <div class="search-right">
        <i
          class="el-icon-search icon"
          @click="stockSearchShow = !stockSearchShow"
          title="搜索"
        ></i>
        <i class="el-icon-setting icon" @click="openFiled" title="设置"></i>
      </div>
    </div>
    <!-- 搜索框部分 -->
    <div>
      <transition name="el-zoom-in-top">
        <el-card class="box-card" v-show="stockSearchShow">
          <div slot="header" class="clearfix">
            <span>
              搜索模块:
              <el-radio-group v-model="searchSelect">
                <el-radio-button label="行业"></el-radio-button>
                <el-radio-button
                  label="股票"
                ></el-radio-button> </el-radio-group
            ></span>
            <span style="float: right">
              <i
                class="el-icon-delete icon"
                title="清空条件"
                @click="clareStockSearch"
              ></i>
              <i
                class="el-icon-plus icon"
                @click="addStockSearch"
                title="添加条件"
              ></i>
              <i
                class="el-icon-check icon"
                @click="checkedStockSearch"
                title="搜索"
              ></i
            ></span>
          </div>
          <div
            v-for="(item, index) in searchForm"
            :key="index"
            class="card_item"
          >
            <el-input
              placeholder="请输入内容"
              v-model="item.stockSearchVal"
              size="medium"
            >
              <el-select
                v-model="item.stockSearchSelect"
                slot="prepend"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in selectFiledTable"
                  :key="item.id"
                  :label="item.filedname"
                  :value="item.prop"
                ></el-option>
              </el-select>
            </el-input>
          </div>
        </el-card>
      </transition>
    </div>

    <!-- 字段设置抽屉，用于字段选择 -->
    <div>
      <el-drawer
        :with-header="false"
        :visible.sync="drawer"
        @close="cancle"
        size="25%"
      >
        <div class="main">
          <div class="header">
            <span class="header_left">显示设置</span>
            <span class="header_right">
              <i class="el-icon-check icon" @click="checked()" title="确定"></i>
              <i class="el-icon-refresh icon" @click="reset()" title="刷新"></i>
              <i class="el-icon-close icon" @click="cancle()" title="关闭"></i>
            </span>
          </div>
          <div>
            <el-table
              ref="filedInfoTable"
              :data="filedInfo"
              tooltip-effect="dark"
              style="width: 100%"
              @selection-change="handleSelectionChange"
              :row-key="getRowKey"
            >
              <!-- 多选框 -->
              <el-table-column
                type="selection"
                width="55"
                :reserve-selection="true"
              >
              </el-table-column>
              <!-- 表头搜索框 -->
              <el-table-column>
                <template slot="header" slot-scope="scope">
                  <el-input
                    v-model="filedSearchVal"
                    size="mini"
                    placeholder="输入关键字搜索"
                  />
                </template>
                <template slot-scope="scope">{{
                  scope.row.filedname
                }}</template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-drawer>
    </div>

    <!-- 表格部分 -->

    <el-table
      :data="searchVal != '' ? searchInfo : IndustryInfo"
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

      <el-table-column label="行业名称" width="180">
        <template slot-scope="scope">
          <el-link :href="scope.row.bk_www" target="_blank">{{
            scope.row.bk_name
          }}</el-link>
        </template></el-table-column
      >
      <el-table-column prop="bk_code" label="行业代码"></el-table-column>

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
          <div> -->
        、
        <!-- 搜索框 -->
        <!-- <template>
              <el-input
                placeholder="请输入搜索内容"
                v-model="searchVal"
                class="input-with-select"
              >
                <el-select
                  style="width: 70px"
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
  getFileInfoAPI,
} from "../../api/index.js";
export default {
  name: "Industry",
  components: {},
  data() {
    return {
      IndustryInfo: null, //储存所有数据
      drawer: false, //设置抽屉是否显示
      filedInfo: [
        //字段表数据，用于多选 prop：字段名 filedname：字段备注，isshow：默认显示
      ],
      filedChecked: [], //已选择的字段
      filedTable: [], //显示在表上的字段
      filedSearchVal: "", //字段搜索值
      checkAll: false, //字段是否全选
      sotckTableFiled: [], //股票子模块显示的字段
      industryTableFiled: [], //行业模块显示字段
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
      searchVal: [], //搜索值
      searchForm: [{ stockSearchVal: "", stockSearchSelect: "" }], //表单上的搜索值
      stockSearchShow: false, //数据搜索框是否展示
      selectFiledTable: [], //需要搜索字段数据
      tablename: "stock_show",
    };
  },
  computed: {},
  // 数据监听
  watch: {
    // 搜索模块改变，需要搜索的字段也改变
    searchSelect: {
      handler(newVal, oldVal) {
        if (newVal == "行业") {
          this.selecFiledChose(this.industryTableFiled);
        } else if (newVal == "股票") {
          this.selecFiledChose(this.sotckTableFiled);
        }
      },
    },
  },

  methods: {
    // 方法：搜索功能，info：搜索对象
    Search(info) {
      if (this.searchSelect == "行业") {
        // 搜索选项为'行业'进行搜索
        this.searchVal.forEach((val) => {
          info = info.filter((data) => {
            if (typeof eval(`data.${val.stockSearchSelect}`) == "number") {
              data = eval(`data.${val.stockSearchSelect}.toString()`);
              return (
                data.substr(0, val.stockSearchVal.length) == val.stockSearchVal
              );
            } else {
              return (
                !val ||
                eval(
                  `data.${val.stockSearchSelect}.toString().includes(val.stockSearchVal)`
                )
              );
            }
          });
        });
      } else if (this.searchSelect == "股票") {
        // 搜索选项为'股票'进行搜索
        this.searchVal.forEach((val) => {
          info.forEach((item) => {
            item.values = item.values.filter((res) => {
              if (typeof eval(`res.${val.stockSearchSelect}`) == "number") {
                res = eval(`res.${val.stockSearchSelect}.toString()`);
                return (
                  res.substr(0, val.stockSearchVal.length) == val.stockSearchVal
                );
              } else {
                return (
                  !val ||
                  eval(
                    `res.${val.stockSearchSelect}.toString().includes(val.stockSearchVal)`
                  )
                );
              }
            });
          });
        });
      }
      // 返回结果
      return info;
    },
    // 方法：获取所有行业信息
    async getAllBG() {
      let res = await getAllBGListAPI();
      // return JSON.parse(res);
      this.IndustryInfo = JSON.parse(res);
    },

    // 方法：修改行业信息重要程度，bk_code, val：修改值
    async updateIndustryLevel(bk_code, val) {
      let res = "";
      try {
        res = await updateBGLevelAPI(bk_code, val);
        this.Search("行业", JSON.parse(res));
        // 有搜索值时，展示更新后的搜索结果
        // if (this.searchVal != "") {
        //   this.searchInfo = this.Search(this.searchVal, this.IndustryInfo);
        // }
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
        // 多选修改
        data = this.stockSelection.map((item) => {
          return item.ts_code;
        });
        console.log(data);
        if (data.length < 1) {
          this.$message({
            message: "请选择内容",
            type: "warning",
          });
          return;
        }
      } else {
        // 单独修改
        data.push(row.ts_code);
      }

      let res = await updateItemStatusAPI(bk_code, data, status);
      if (res == 1) {
        let info = JSON.parse(await getAllBGListAPI());
        // 有搜索值时，展示更新后的搜索结果，否则更新所有结果
        // if (this.searchVal != "") {
        //   info = this.Search(this.searchVal, info);
        //   this.searchInfo[index].values = info[index].values;
        // } else {
        //   this.IndustryInfo[index].values = info[index].values;
        // }
        this.Search("股票", JSON.parse(info));
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
    // 添加搜索条件
    addStockSearch() {
      if (this.searchForm.length == this.filedTable.length) {
        this.$message({
          message: "搜索条件上限！",
          type: "warning",
        });
      } else {
        this.searchForm.push({ stockSearchVal: "", stockSearchSelect: "" });
      }
    },
    // 重置搜索条件
    async clareStockSearch() {
      this.searchForm = [{ stockSearchVal: "", stockSearchSelect: "" }];
      this.searchVal = [];
      // 重新查找数据
      // let res = await this.getAllBG();
      // this.Search(this.searchSelect, res);
    },
    // 多条件搜索
    async checkedStockSearch() {
      this.searchVal = [];
      this.searchForm.forEach((val) => {
        if (val.stockSearchVal != "" && val.stockSearchSelect != "") {
          this.searchVal.push({ ...val });
        }
      });
      if (this.searchVal.length > 0) {
        // 进行数据查询
        // let res = await this.getAllBG();
        // this.Search(this.searchSelect, res);
        this.stockSearchShow = false;
      } else {
        this.$message({
          message: "请输入完整的搜索条件！",
          type: "warning",
        });
      }
    },
    // 打开字段抽屉
    openFiled() {
      this.drawer = true;
      this.$nextTick(() => {
        if (this.$refs.filedInfoTable) {
          this.filedChecked.forEach((row) => {
            this.$refs.filedInfoTable.toggleRowSelection(row, true);
          });
        }
      });
    },
    // *****获取需要的字段***
    async getFileInfo() {
      this.filedInfo = await getFileInfoAPI();
      this.filedInfo = this.filedInfo.filter((data) => {
        return data.tablename == this.tablename;
      });
      //抽屉中表格选中的字段
      this.filedChecked = this.filedInfo.filter((data) => {
        return data.is_show === 1;
      });
      // 获取表格显示字段
      this.filedTable = this.filedInfo.filter((data) => {
        return data.is_show === 1;
      });

      // 股票模块显示字段
      this.sotckTableFiled = this.filedTable.filter((data) => {
        return data.tablename == "stock_bk_stock";
      });
      // 行业模块显示字段
      this.industryTableFiled = this.filedTable.filter((data) => {
        return data.tablename == "stock_bk";
      });
      //***以下要删除

      // 需要搜索字段
      this.selecFiledChose();
    },
    // 获取搜索的字段（val值来区分股票和行业）
    selecFiledChose() {
      this.selectFiledTable = [];
      if (this.searchSelect == "行业") {
        this.selectFiledTable = this.industryTableFiled.filter((data) => {
          return data.is_select === 1;
        });
      } else if (this.searchSelect == "股票") {
        this.selectFiledTable = this.sotckTableFiled.filter((data) => {
          return data.is_select === 1;
        });
      }
    },
    // 抽屉多选框选择功能-绑定方法
    handleSelectionChange(val) {
      this.filedChecked = val;
    },
    getRowKey(row) {
      return row.id;
    },
    // 抽屉功能：字段部分增删改查
    // ！！！确认按钮,发送、更新选中数据数据 updata接口！！！！
    async checked() {
      let res;
      let newVal = this.filedChecked.map((item) => item.id);
      let oldVal = this.filedTable.map((item) => item.id);
      // *****获取结果渲染到页面表格
      if (newVal == "") {
        this.$alert("请选择需要显示的内容", "提示", {
          confirmButtonText: "确定",
        });
        return;
      } else if (
        JSON.stringify(oldVal.sort()) != JSON.stringify(newVal.sort())
      ) {
        res = await updateFilInfoAPI(newVal);
        // this.filedTable = this.filedChecked;
        // 更新页面数据
        // await this.getFileInfo();
      }
      this.drawer = false;
    },
    // 重置按钮，重置选择内容
    async reset() {
      // 清空搜索和多选内容
      this.$refs.filedInfoTable.clearSelection();
      this.filedSearch = "";
      // 重新获取渲染数据
      await this.getFileInfo();
      this.$nextTick(() => {
        if (this.$refs.filedInfoTable) {
          0;
          this.filedChecked.forEach((row) => {
            this.$refs.filedInfoTable.toggleRowSelection(row, true);
          });
        }
      });
    },
    // 取消按钮，重新渲染内容并关闭抽屉
    cancle() {
      this.reset();
      this.drawer = false;
    },
  },
  async created() {
    // 获取字段值
    await this.getFileInfo();
    // 获取表数据;
    await this.getAllBG();
  },
};
</script>
<style lang="less" scoped>
.body {
  margin: 0;
  padding: 0;
}
.header {
  padding: 0 20px;
  height: 50px;
  text-align: center;
  line-height: 50px;

  .header_left {
    float: left;
  }

  .header_right {
    float: right;

    .icon {
      font-size: 20px;
      padding: 5px;
    }

    .icon:hover {
      color: #409eff;
      content: attr(title);
    }
  }
}

.search {
  height: 40px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  .search-right {
    .icon {
      padding: 0 10px;
      font-size: 20px;
    }

    .icon:hover {
      color: #409eff;
      content: attr(title);
    }
  }
}
.box-card {
  // text-align: center;
  // display: flex;
  .clearfix {
    .icon {
      font-size: 20px;
      padding: 5px;
    }

    .icon:hover {
      color: #409eff;
      content: attr(title);
    }
  }
  .card_item {
    margin-right: 20px;
    margin-top: 5px;
    max-width: 500px;
    justify-content: space-around;
    display: inline-flex;
  }
}
</style>
