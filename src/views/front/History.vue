<template>
  <div class="main">
    <!-- 头部选择 -->
    <div class="top">
      <div class="search">
        <div class="time_input">
          <span class="item">
            日期：
            <el-date-picker
              v-model="datetime"
              align="right"
              type="date"
              placeholder="选择日期"
              :picker-options="pickerOptions"
              size="medium"
              style="width: 150px"
            >
            </el-date-picker>
          </span>
          <span class="item">
            <span>序号：</span>

            <el-input
              v-model="countnum"
              placeholder="请输序号"
              style="width: 50px"
              :min="0"
              size="medium"
            ></el-input>
          </span>
          <span class="item">
            <span>刷新时间（s）：</span>
            <el-input-number
              style="width: 100px"
              v-model="refreshTime"
              controls-position="right"
              @change="timeChange"
              :min="1"
              size="medium"
            ></el-input-number>
          </span>
          <span class="item">
            <el-button
              @click="start"
              v-if="!isStartTimer"
              type="primary"
              size="small"
              plain
              >启动
            </el-button>
            <el-button v-else type="danger" @click="stop" size="small" plain>
              停止
            </el-button>
          </span>
        </div>

        <div class="search-right">
          <i
            class="el-icon-search icon"
            @click="stockSearchShow = !stockSearchShow"
            title="搜索"
          ></i>

          <i class="el-icon-setting icon" @click="open()" title="设置"></i>
        </div>
      </div>
      <!-- 滑动搜索框 -->
      <div>
        <transition name="el-zoom-in-top">
          <el-card class="box-card" v-show="stockSearchShow">
            <div slot="header" class="clearfix">
              <span>搜索</span>
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
                    v-for="item in filedTable"
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
    </div>
    <!-- 字段设置抽屉，用于字段选择 -->
    <div>
      <el-drawer
        :with-header="false"
        :visible.sync="drawer"
        @close="cancle"
        size="25%"
      >
        <div class="drawer">
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

    <!-- 数据表格 -->
    <div class="history_info">
      <div
        @mouseenter="enter('#historyTable')"
        @mouseleave="leave('#historyTable')"
      >
        <el-table
          id="historyTable"
          height="calc(100vh - 140px)"
          :data="historyInfo"
          stripe
          :cell-style="returnStyle"
          :header-cell-style="{ background: '#EBEEF5' }"
          class="commonScrollbarTable"
        >
          <!-- id字段 -->
          <template v-for="(item, index) in filedTable">
            <el-table-column
              :key="index"
              :prop="item.prop"
              :label="item.filedname"
              fixed="left"
              v-if="item.prop == 'ts_code'"
            >
              <template slot-scope="scope">
                <el-link target="_blank" @click="openDetail">{{
                  scope.row.ts_code
                }}</el-link>
              </template>
            </el-table-column>
            <!-- 概念详情字段 -->
            <el-table-column
              :key="index"
              :prop="item.prop"
              :label="item.filedname"
              v-else-if="item.prop == 'detail'"
              fixed="right"
            >
              <template v-for="item in testData">
                <div :key="item.bk_code">
                  <el-link target="_blank" @click="openDetail">{{
                    item.bk_name_x
                  }}</el-link>
                  <span> {{ item.bk_changpercent }}</span
                  ><br />
                </div>
              </template>
            </el-table-column>
            <!-- 特殊列:颜色变化  -->
            <el-table-column
              :key="index"
              :prop="item.prop"
              :label="item.filedname"
              sortable
              v-else-if="filedColorSelect.includes(item.prop)"
            >
              <template slot-scope="scope">
                <span>
                  {{ scope.row[item.prop] }}
                </span>
                <i
                  class="el-icon-top"
                  style="color: red"
                  v-if="UpIconShow.includes(scope.row.Id)"
                />
                <i
                  class="el-icon-bottom"
                  style="color: green"
                  v-else-if="DownIconShow.includes(scope.row.Id)"
                />
              </template>
            </el-table-column>
            <!-- 普通数据循环 -->
            <el-table-column
              sortable
              :key="index"
              :prop="item.prop"
              :label="item.filedname"
              v-else
            ></el-table-column>
          </template>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { getHistoryAPI, getFileInfoAPI, getZbStockInfoAPI } from "@/api/index";
export default {
  components: {},
  data() {
    return {
      // 获取日期
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      historyInfo: [],
      datetime: null,
      countnum: 0,
      refreshTime: 0,
      tablename: "stock_show_history",
      filedInfo: [
        //字段表数据，用于多选 prop：字段名 filedname：字段备注，isshow：默认显示
      ],
      filedChecked: [], //已选择的字段
      filedTable: [], //显示在表上的字段
      drawer: false, //设置抽屉是否显示
      checkAll: false, //字段是否全选
      filedSearchVal: "", //字段搜索值
      filedColorSelect: [], //红绿效果切换字段值合集
      UpIconShow: [],
      DownIconShow: [],
      filedZYCD2: [],
      searchForm: [{ stockSearchVal: "", stockSearchSelect: "" }], //表单上的搜索值
      searchVal: [], //最终搜索值
      isStartTimer: false,
      testData: [
        {
          bk_code: "308855",
          bk_name_x: "跨境支付（CIPS）",
          bk_changpercent: 2.69,
        },
        {
          bk_code: "301715",
          bk_name_x: "证金持股",
          bk_changpercent: 0.59,
        },
      ],
      stockSearchShow: false,
      timer: null,
    };
  },
  computed: {
    historyData() {
      // 深拷贝
      return JSON.parse(JSON.stringify(this.historyInfo));
    },
  },
  watch: {
    // 监听股票数据，根据新旧数据实现表格箭头显示
    historyData: {
      handler(newVal, oldVal) {
        let index = -1;
        this.UpIconShow = [];
        this.DownIconShow = [];
        if (oldVal != null) {
          newVal.forEach((item) => {
            index = oldVal.findIndex((n) => n.Id == item.Id);
            if (index >= 0) {
              this.filedColorSelect.forEach((val) => {
                if (
                  eval(
                    `parseFloat(item.${val})> parseFloat(oldVal[index].${val})`
                  )
                ) {
                  this.zbUpIconShow.push(item.Id);
                } else if (
                  eval(
                    `parseFloat(item.${val})> parseFloat(oldVal[index].${val})`
                  )
                ) {
                  this.zbDownIconShow.push(item.Id);
                }
              });
            }
            index = -1;
          });
        }
      },
      // 深度监听
      deep: true,
    },
  },
  methods: {
    // 获取表数据
    async getHistory() {
      let res = await getHistoryAPI(this.datetime, this.countnum);
      this.historyInfo = JSON.parse(res);
      // 测试用 后续删 改为history接口
      // getZbStockInfoAPI(this.tablename).then((data) => {
      //   let res = this.stockInfoFormat(JSON.parse(data));
      //   // 搜索功能
      //   if (this.searchVal != []) {
      //     this.searchVal.forEach((val) => {
      //       res = res.filter((data) => {
      //         if (typeof eval(`data.${val.stockSearchSelect}`) == "number") {
      //           data = eval(`data.${val.stockSearchSelect}.toString()`);
      //           return (
      //             data.substr(0, val.stockSearchVal.length) ==
      //             val.stockSearchVal
      //           );
      //         } else {
      //           return (
      //             !val ||
      //             eval(
      //               `data.${val.stockSearchSelect}.toString().includes(val.stockSearchVal)`
      //             )
      //           );
      //         }
      //       });
      //     });
      //   }
      //   this.historyInfo = res;
      // });
    },
    // 股票数值格式化保留两位小数 时间显示时刻部分
    stockInfoFormat(info) {
      info.forEach((data) => {
        for (const key in data) {
          if (key != "Id" && typeof data[key] == "number") {
            data[key] = Number(data[key].toFixed(2));
          } else if (key == "rd_datetime") {
            data[key] = data[key].substr(data[key].lastIndexOf(" "));
          }
        }
      });
      return info;
    },
    // 计时器获取表数据
    // 计时器防抖 fun执行函数 dely延迟时间
    setTimer(fun, dely) {
      clearInterval(this.timer);
      fun();
      this.timer = window.setInterval(() => {
        setTimeout(() => {
          fun();
          this.countnum = this.countnum + 1;
        }, 0);
      }, dely * 1000);
    },
    // 计时器开始
    start() {
      this.setTimer(this.getHistory, this.refreshTime);
      this.isStartTimer = true;
    },
    // 计时器停止
    stop() {
      clearInterval(this.timer);
      this.isStartTimer = false;
    },
    // *******字段相关处理*******
    // 获取所有字段相关数据
    async getFileInfo() {
      this.filedInfo = await getFileInfoAPI();
      console.log(this.filedInfo);
      this.filedInfo = this.filedInfo.filter((data) => {
        return data.tablename == this.tablename;
      });
      console.log(this.filedInfo);
      // 获取已选显示字段
      this.filedChecked = this.filedInfo.filter((data) => {
        return data.is_show === 1;
      });
      // 获取表格显示字段
      this.filedTable = this.filedInfo.filter((data) => {
        return data.is_show === 1;
      });

      this.filedTable.forEach((data) => {
        // 获取需要颜色变化字段
        if (data.is_czzd == 1) {
          this.filedColorSelect.push(data.prop);
        }
      });

      // 获取需要特殊颜色变化的字段;
      this.filedZYCD2 = this.filedInfo.filter((data) => {
        return data.is_show == 0 && data.is_czzd == 2 && data.cz_ziduan != null;
      });
    },
    // 刷新时间输入框 值改变
    timeChange() {},
    // **抽屉模块功能**
    // 设置按钮，打开抽屉，显示默认选择
    open() {
      this.drawer = true;
      this.$nextTick(() => {
        if (this.$refs.filedInfoTable) {
          this.filedChecked.forEach((row) => {
            this.$refs.filedInfoTable.toggleRowSelection(row, true);
          });
        }
      });
    },
    // 抽屉功能：字段部分增删改查
    // ！！！确认按钮,发送、更新选中数据数据 updata接口！！！！
    checked() {},
    // 取消按钮，重新渲染内容并关闭抽屉
    cancle() {
      this.reset();
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
    handleSelectionChange(val) {
      this.filedChecked = val;
    },
    getRowKey(row) {
      return row.id;
    },
    // ******表数据搜索模块
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
    clareStockSearch() {
      this.searchForm = [{ stockSearchVal: "", stockSearchSelect: "" }];
      this.searchVal = [];
      this.getHistory();
    },
    // *******多条件搜索
    checkedStockSearch() {
      this.searchVal = [];
      this.searchForm.forEach((val) => {
        if (val.stockSearchVal != "" && val.stockSearchSelect != "") {
          this.searchVal.push({ ...val });
        }
      });
      if (this.searchVal.length > 0) {
        if (this.isStartTimer == true) {
          this.setTimer(this.getHistory(), this.refreshTime);
        } else {
          this.getHistory();
        }

        this.stockSearchShow = false;
      } else {
        this.$message({
          message: "请输入完整的搜索条件！",
          type: "warning",
        });
      }
    },
    // 根据数据，改变单元格颜色
    returnStyle(obj) {
      let filed = this.filedInfo.filter((item) => {
        return item.prop === obj.column.property;
      });
      //  大于chengdu值红色
      if (
        this.filedColorSelect.includes(obj.column.property) &&
        eval(`parseFloat(obj.row.${obj.column.property})`) >
          parseFloat(filed[0].chengdu)
      ) {
        return {
          color: "red",
        };
      }
      // 小于chengdu值绿色
      if (
        this.filedColorSelect.includes(obj.column.property) &&
        eval(`parseFloat(obj.row.${obj.column.property})`) <
          parseFloat(filed[0].chengdu)
      ) {
        return {
          color: "green",
        };
      }
      // 特殊颜色变化
      this.filedZYCD2.forEach((item) => {
        if (
          item.cz_ziduan == obj.column.property &&
          eval(`parseFloat(obj.row.${item.prop})`) > 8
        ) {
          return {
            color: "red",
          };
        } else if (
          item.cz_ziduan == obj.column.property &&
          eval(`parseFloat(obj.row.${item.prop})`) > 6
        ) {
          return {
            color: "yellow",
          };
        } else if (
          item.cz_ziduan == obj.column.property &&
          eval(`parseFloat(obj.row.${item.prop})`) > 3
        ) {
          return {
            color: "blue",
          };
        }
      });
    },
    // 滚动条样式
    enter(id) {
      this.$(id).addClass("scrollbarShow");
    },
    leave(id) {
      this.$(id).removeClass("scrollbarShow");
    },
    // 打开板块详情页面
    openDetail() {
      this.detailVisible = true;
    },
  },
  beforeCreate() {},
  async created() {
    await this.getFileInfo();
    let data = new Date();
    this.datetime =
      data.getFullYear() + "-" + (data.getMonth() + 1) + "-" + data.getDate();
    await this.getHistory();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {
    clearInterval(this.timer);
  },
  destroyed() {},
  activated() {},
};
</script>
<style lang="less" scoped>
.main {
  .top {
    .search {
      height: 40px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      .time_input {
        color: #909399;
        .item {
          margin-left: 10px;
        }
        .icon {
          padding: 0 10px;
          font-size: 25px;
        }

        .icon:hover {
          color: #409eff;
          content: attr(title);
        }
      }

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
  }
  .drawer {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
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
  }
  .history_info {
    .commonScrollbarTable /deep/ .el-table__body-wrapper::-webkit-scrollbar {
      width: 6px;
      height: 10px;
      display: none;
    }

    //滚动条的滑块
    .commonScrollbarTable
      /deep/
      .el-table__body-wrapper::-webkit-scrollbar-thumb {
      background-color: rgb(211, 213, 217);
      border-radius: 15px;
    }
    .scrollbarShow /deep/ .el-table__body-wrapper::-webkit-scrollbar {
      display: block;
    }
  }
}
</style>