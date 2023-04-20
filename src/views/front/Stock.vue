<template>
  <div class="">
    <!-- 滑动搜索框 -->
    <div class="search">
      <div class="time_input">
        <span style="color: #909399">刷新时间：</span>
        <el-input-number
          style="width: 100px"
          v-model="refreshTime"
          controls-position="right"
          @change="timeChange"
          :min="1"
          size="medium"
        ></el-input-number>
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
    <div>
      <transition name="el-zoom-in-top">
        <el-card class="box-card" v-show="stockSearchShow">
          <div slot="header" class="clearfix">
            <span>
              搜索表:
              <el-radio-group v-model="searchTableSelect">
                <el-radio-button label="zb"></el-radio-button>
                <el-radio-button label="ck"></el-radio-button> </el-radio-group
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
    <!-- 表格数据位置 -->
    <div class="out" ref="out">
      <splitpanes
        @resize="(paneSize = $event[0].size), resize()"
        horizontal
        class="default-theme"
      >
        <pane :size="paneSize">
          <!-- <template slot="paneL"> -->
          <div
            class="zbPane"
            ref="zbPane"
            @mouseenter="enter('#zbTable')"
            @mouseleave="leave('#zbTable')"
          >
            <el-table
              id="zbTable"
              :height="zbHeight"
              :data="zbStockInfo"
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
                      v-if="zbUpIconShow.includes(scope.row.Id)"
                    />
                    <i
                      class="el-icon-bottom"
                      style="color: green"
                      v-else-if="zbDownIconShow.includes(scope.row.Id)"
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
        </pane>
        <!-- </template> -->
        <!-- <template slot="paneR"> -->
        <pane :size="100 - paneSize">
          <div
            class="ckPane"
            ref="ckPane"
            @mouseenter="enter('#ckTable')"
            @mouseleave="leave('#ckTable')"
          >
            <el-table
              id="ckTable"
              :height="ckHeight"
              :data="ckStockInfo"
              stripe
              :cell-style="returnStyle"
              :header-cell-style="{ background: '#EBEEF5' }"
              class="commonScrollbarTable"
            >
              <template v-for="(item, index) in filedTable">
                <el-table-column
                  :key="index"
                  :prop="item.prop"
                  :label="item.filedname"
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
                  class="detail"
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
                      v-if="ckUpIconShow.includes(scope.row.Id)"
                    />
                    <i
                      class="el-icon-bottom"
                      style="color: green"
                      v-else-if="ckDownIconShow.includes(scope.row.Id)"
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
        </pane>
        <!-- </template> -->
      </splitpanes>
    </div>
    <el-dialog title="标题" :visible.sync="detailVisible"> test </el-dialog>
  </div>
</template>

<script>
import $ from "jquery";
import {
  getFileInfoAPI,
  updateFilInfoAPI,
  getZbStockInfoAPI,
  getCkStockInfoAPI,
} from "../../api/index";
import { Splitpanes, Pane } from "splitpanes";

import "splitpanes/dist/splitpanes.css";
export default {
  components: { Splitpanes, Pane },
  data() {
    return {
      tablename: "stock_show",
      paneSize: 50, //上 zb表模块高度百分比
      zbStockInfo: null, //所有zb表股票数据
      ckStockInfo: null,
      filedInfo: [
        //字段表数据，用于多选 prop：字段名 filedname：字段备注，isshow：默认显示
      ],
      filedChecked: [], //已选择的字段
      filedTable: [], //显示在表上的字段
      drawer: false, //设置抽屉是否显示
      checkAll: false, //字段是否全选
      filedSearchVal: "", //字段搜索值
      zbUpIconShow: [], //红↑显示字段id合集
      zbDownIconShow: [], //绿↓显示字段id合集
      ckUpIconShow: [], //红↑显示字段id合集
      ckDownIconShow: [], //绿↓显示字段id合集
      stockSearchShow: false, //数据搜索框是否展示
      filedColorSelect: [], //红绿效果切换字段值合集
      filedZYCD2: [],
      searchForm: [{ stockSearchVal: "", stockSearchSelect: "" }], //表单上的搜索值
      searchVal: [], //最终搜索值
      searchTableSelect: "zb", //选择需要搜索的表
      timer: null, //每5秒执行一次的计时器
      refreshTime: 5, //刷新时间 默认五秒
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
      zbHeight: "100%", //zb表高度
      ckHeight: "100%", //ck表高度
      detailVisible: false, //板块详情展示页面
    };
  },

  computed: {
    zbData() {
      // 深拷贝
      return JSON.parse(JSON.stringify(this.zbStockInfo));
    },
    ckDate() {
      return JSON.parse(JSON.stringify(this.ckStockInfo));
    },
  },

  watch: {
    // 监听字段搜索数据
    filedSearchVal: {
      handler(newVal, oldVal) {
        if (newVal != "") {
          this.filedInfo = this.filedInfo.filter((data) => {
            return data.filedname.includes(newVal);
          });
        } else {
          this.getFileInfo();
        }
      },
    },

    // 监听股票数据，根据新旧数据实现表格箭头显示
    zbData: {
      handler(newVal, oldVal) {
        let index = -1;
        this.zbUpIconShow = [];
        this.zbDownIconShow = [];
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
    ckData: {
      handler(newVal, oldVal) {
        let index = -1;
        this.ckUpIconShow = [];
        this.ckDownIconShow = [];
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
                  this.ckUpIconShow.push(item.Id);
                } else if (
                  eval(
                    `parseFloat(item.${val})> parseFloat(oldVal[index].${val})`
                  )
                ) {
                  this.ckDownIconShow.push(item.Id);
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
    // 获取所有股票信息  接口待完善 计时器每五秒刷新一次功能
    getAllStock() {
      getZbStockInfoAPI(this.tablename).then((data) => {
        let res = this.stockInfoFormat(JSON.parse(data));
        // 搜索功能
        if (this.searchVal != "" && this.searchTableSelect == "zb") {
          this.searchVal.forEach((val) => {
            res = res.filter((data) => {
              if (typeof eval(`data.${val.stockSearchSelect}`) == "number") {
                data = eval(`data.${val.stockSearchSelect}.toString()`);
                return (
                  data.substr(0, val.stockSearchVal.length) ==
                  val.stockSearchVal
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
        }
        this.zbStockInfo = res;
      });
      getCkStockInfoAPI(this.tablename).then((data) => {
        let res = this.stockInfoFormat(JSON.parse(data));
        // 搜索功能
        if (this.searchVal != "" && this.searchTableSelect == "ck") {
          this.searchVal.forEach((val) => {
            res = res.filter((data) => {
              if (typeof eval(`data.${val.stockSearchSelect}`) == "number") {
                data = eval(`data.${val.stockSearchSelect}.toString()`);
                return (
                  data.substr(0, val.stockSearchVal.length) ==
                  val.stockSearchVal
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
        }
        this.ckStockInfo = res;
      });
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
        // console.log(item);
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
    // 获取所有字段相关数据
    async getFileInfo() {
      this.filedInfo = await getFileInfoAPI();
      this.filedInfo = this.filedInfo.filter((data) => {
        return data.tablename == this.tablename;
      });
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
      console.log(this.filedInfo);
      //获取需要特殊颜色变化的字段
      this.filedZYCD2 = this.filedInfo.filter((data) => {
        return data.is_show == 0 && data.is_czzd == 2 && data.cz_ziduan != null;
      });
      // console.log(this.filedZYCD2);
    },

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
    // 多选框选择功能-绑定方法
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
      this.setTimer(this.getAllStock, this.refreshTime);
    },
    // 多条件搜索
    checkedStockSearch() {
      this.searchVal = [];
      this.searchForm.forEach((val) => {
        if (val.stockSearchVal != "" && val.stockSearchSelect != "") {
          this.searchVal.push({ ...val });
        }
      });
      if (this.searchVal.length > 0) {
        this.setTimer(this.getAllStock, this.refreshTime);
        this.stockSearchShow = false;
      } else {
        this.$message({
          message: "请输入完整的搜索条件！",
          type: "warning",
        });
      }
    },
    // 计时器防抖 fun执行函数 dely延迟时间
    setTimer(fun, dely) {
      clearInterval(this.timer);
      fun();
      this.timer = window.setInterval(() => {
        setTimeout(fun(), 0);
      }, dely * 1000);
    },
    timeChange(val) {
      this.setTimer(this.getAllStock, val);
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
    // 表格高度自适应
    autoHeight() {
      this.$nextTick(() => {
        this.zbHeight = window.getComputedStyle(this.$refs.zbPane).height;
        this.ckHeight = window.getComputedStyle(this.$refs.ckPane).height;
      });
    },
    resize() {
      // this.paneSize = $event[0].size;
      this.autoHeight();
    },
  },
  beforeCreate() {}, //生命周期 - 创建之前
  //生命周期 - 创建完成（可以访问当前this实例）
  async created() {
    // 每次创建页面自动获取数据
    await this.getFileInfo();
    this.setTimer(this.getAllStock, this.refreshTime);
  },
  beforeMount() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  }, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
.main {
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

.search {
  height: 40px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .time_input {
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

.out {
  height: calc(100vh - 140px) !important;
  // overflow: hidden;
  width: 100%;
  // /deep/.el-table__body-wrapper::-webkit-scrollbar {
  //   width: 0;
  // }
  .splitpanes {
    height: calc(100vh- 60px);
  }
  .zbPane,
  .ckPane {
    height: 100%;
  }
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
  .detail {
    font-size: 10px;
  }
}
</style>