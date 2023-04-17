<template>
  <div class="main">
    <!-- 头部选择 -->
    <div class="top">
      <i class="el-icon-setting icon" @click="open()" title="设置"></i>
      <!-- 搜索部分 -->

      <!-- 字段选择部分 -->

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
                <i
                  class="el-icon-check icon"
                  @click="checked()"
                  title="确定"
                ></i>
                <i
                  class="el-icon-refresh icon"
                  @click="reset()"
                  title="刷新"
                ></i>
                <i
                  class="el-icon-close icon"
                  @click="cancle()"
                  title="关闭"
                ></i>
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
    </div>
    <!-- 数据表格 -->
    <div class="history_info">
      <el-table
        id="historyTable"
        height="100%"
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
  </div>
</template>

<script>
import { getHistoryAPI, getFileInfoAPI } from "@/api/index";
export default {
  components: {},
  data() {
    return {
      historyInfo: [],
      datetime: null,
      countnum: 0,
      filedInfo: [
        //字段表数据，用于多选 prop：字段名 filedname：字段备注，isshow：默认显示
      ],
      filedChecked: [], //已选择的字段
      filedTable: [], //显示在表上的字段
      drawer: false, //设置抽屉是否显示
      checkAll: false, //字段是否全选
      filedSearchVal: "", //字段搜索值
      filedColorSelect: [], //红绿效果切换字段值合集
      filedZYCD2: [],
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
    };
  },
  computed: {},
  watch: {},
  methods: {
    async getHistory() {
      // let res =await getHistoryAPI(this.datetime,this.countnum)
      // this.historyInfo=JSON.parse(res)
    },
    // 获取所有字段相关数据
    async getFileInfo() {
      this.filedInfo = await getFileInfoAPI();
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
      console.log(this.filedZYCD2);
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
  created() {
    this.getFileInfo();
    // this.datetime=
    // this.getHistory();
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  activated() {},
};
</script>
<style lang="less" scoped>
.main {
  .top {
    .icon {
      font-size: 20px;
      padding: 5px;
    }

    .icon:hover {
      color: #409eff;
      content: attr(title);
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