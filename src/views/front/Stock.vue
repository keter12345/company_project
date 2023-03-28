<template>
  <div class="">
    <!-- 滑动搜索框 -->
    <div class="search">
      <div class="search-right">
        <i
          class="el-icon-search icon"
          @click="
            stockSearchShow = !stockSearchShow;
            stockSearchVal = '';
          "
          title="搜索"
        ></i>
        <i class="el-icon-setting icon" @click="open()" title="设置"></i>
      </div>

      <div>
        <transition name="el-zoom-in-top">
          <el-card class="box-card" v-show="stockSearchShow">
            <div slot="header" class="clearfix">
              <span>搜索条件</span>
              <span style="float: right">
                <i
                  class="el-icon-delete icon"
                  title="重置条件"
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
    <!-- 设置抽屉，用于字段选择 -->
    <div>
      <el-drawer
        :with-header="false"
        :visible.sync="drawer"
        @close="cancle"
        size="25%"
      >
        <!-- 内部抽屉 -->
        <div class="inner">
          <el-drawer
            title="新增字段"
            :append-to-body="true"
            :visible.sync="innerDrawer"
            size="20%"
          >
            <div class="innerForm">
              <el-form
                ref="form"
                :model="form"
                label-width="80px"
                label-position="left"
              >
                <el-form-item label="字段">
                  <el-input v-model="form.prop"></el-input>
                </el-form-item>
                <el-form-item label="标题">
                  <el-input v-model="form.filedname"></el-input>
                </el-form-item>
                <el-form-item label="默认展示">
                  <el-radio-group v-model="form.is_show">
                    <el-radio label="是"></el-radio>
                    <el-radio label="否"></el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="控制界面">
                  <el-input v-model="form.tablename"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                  <el-input v-model="form.bak"></el-input>
                </el-form-item>
              </el-form>
            </div>
            <div class="innerBotton">
              <el-button type="primary">确认</el-button>
              <el-button>取消</el-button>
            </div>
          </el-drawer>
        </div>
        <div class="main">
          <div class="header">
            <span class="header_left">显示设置</span>
            <span class="header_right">
              <i class="el-icon-plus icon" @click="add()" title="添加"></i>
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
    <!-- 表格数据展示 -->
    <div>
      <el-table
        :data="
          stockSearchVal != '' && stockSearchSelect != ''
            ? stockSearchInfo
            : stockInfo
        "
        stripe
        style="width: 100%"
        height="100vh"
        :cell-style="returnStyle"
      >
        <template v-for="(item, index) in filedTable">
          <!-- 特殊列 -->
          <el-table-column
            :key="index"
            :prop="item.prop"
            :label="item.filedname"
            v-if="item.prop == 'changpercent'"
          >
            <template slot-scope="scope">
              <span>{{ scope.row.changpercent }}</span>
              <i
                class="el-icon-top"
                style="color: red"
                v-if="upIconShow.includes(scope.row.id)"
              />
              <i
                class="el-icon-bottom"
                style="color: green"
                v-else-if="downIconShow.includes(scope.row.id)"
              />
            </template>
          </el-table-column>
          <!-- 普通数据循环 -->
          <el-table-column
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
import {
  getFileInfoAPI,
  updateFilInfoAPI,
  getStockInfoAPI,
} from "../../api/index";
export default {
  components: {},
  data() {
    return {
      stockInfo: null, //所有股票数据
      filedInfo: [
        //字段表数据，用于多选 prop：字段名 filedname：字段备注，isshow：默认显示
      ],
      filedChecked: [], //已选择的字段
      filedTable: [], //显示在表上的字段
      drawer: false, //设置抽屉是否显示
      isIndeterminate: true,
      checkAll: false, //是否全选
      filedSearchVal: "", //字段搜索值
      upIconShow: [], //红↑显示字段id合集
      downIconShow: [], //绿↓显示字段id合集
      stockSearchSelect: "",
      stockSearchShow: false, //数据搜索框是否展示
      stockSearchVal: "",
      stockSearchInfo: [],
      filedColorSelect: [], //红绿效果切换字段
      innerDrawer: false,
      form: {
        prop: "",
        filedname: "",
        is_show: "",
        bak: "",
        is_czzd: "",
        tablename: "",
      },
      searchForm: [{ stockSearchVal: "", stockSearchSelect: "" }],
    };
  },

  computed: {
    Data() {
      return JSON.parse(JSON.stringify(this.stockInfo));
    },
  },

  watch: {
    // 监听搜索数据
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
    Data: {
      handler(newVal, oldVal) {
        this.upIconShow = [];
        if (oldVal == null) {
          return;
        } else {
          newVal.forEach((item, index) => {
            console.log(item.changpercent);
            console.log(oldVal[index].changpercent);
            if (item.changpercent > oldVal[index].changpercent) {
              this.upIconShow.push(item.id);
            } else if (item.changpercent < oldVal[index].changpercent) {
              this.downIconShow.push(item.id);
            }
          });
        }
      },
      // 深度监听
      deep: true,
    },
    // 监听股票搜索值，实现搜索功能
    stockSearchVal: {
      handler(newVal, oldVal) {
        if (newVal.length > oldVal.length && this.stockSearchSelect == "") {
          this.$message({
            message: "请先选择搜索内容",
            type: "warning",
          });
          return;
        }
        this.stockSearchInfo = [];
        if (this.stockSearchSelect) {
          this.stockSearchInfo = this.stockSearch(newVal, this.stockInfo);
        }
      },
    },
    stockSearchSelect: {
      handler(newVal, oldVal) {
        if (newVal != "") {
          this.stockSearchVal = "";
        }
      },
    },
  },

  methods: {
    // *****获取所有股票信息  待完善
    async getAllStock() {
      let res = await getStockInfoAPI();
      // this.stockInfo = this.stockInfoFormat(JSON.parse(res));
      this.stockInfo = JSON.parse(res);

      console.log(this.stockInfo);
    },
    // 股票信息搜索功能
    stockSearch(val, info) {
      let res = [];
      if (val) {
        console.log(val);
        res = info.filter((data) => {
          if (typeof eval(`data.${this.stockSearchSelect}`) == "number") {
            data = eval(`data.${this.stockSearchSelect}.toString()`);
            return data.substr(0, val.length) == val;
          } else {
            console.log("string");
            return (
              !val ||
              eval(`data.${this.stockSearchSelect}.toString().includes(val)`)
            );
          }
        });
        console.log(res);
      }
      return res;
    },
    // 根据数据，改变单元格样式  测试字段：cjbl
    returnStyle(obj) {
      if (
        this.filedColorSelect.includes(obj.column.property) &&
        eval(`obj.row.${obj.column.property}`) > 0
      ) {
        return {
          color: "red",
        };
      }
      if (
        this.filedColorSelect.includes(obj.column.property) &&
        eval(`obj.row.${obj.column.property}`) < 0
      ) {
        return {
          color: "green",
        };
      }
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
      // 获取需要颜色变化字段
      this.filedTable.forEach((data) => {
        if (data.is_czzd == 1) this.filedColorSelect.push(data.prop);
      });
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
    // 抽屉功能：增删改查
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
        console.log(newVal);
        res = await updateFilInfoAPI(newVal);
        // this.filedTable = this.filedChecked;
        // 更新页面数据
        // await this.getFileInfo();
      }
      this.drawer = false;
    },
    // 重置按钮，重置选择内容s
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
    // 新增字段
    add() {
      this.innerDrawer = true;
    },
    // 股票信息初始化 数值格式化
    stockInfoFormat(info) {
      info.forEach((data) => {
        for (const key in data) {
          if (key != "Id" && typeof data[key] == "number") {
            data[key] = Number(data[key].toFixed(2));
          }
        }
      });
      return info;
    },
    // 添加搜索条件
    addStockSearch() {
      this.searchForm.push({ stockSearchVal: "", stockSearchSelect: "" });
    },
    // 重置搜索条件
    clareStockSearch() {
      this.searchForm = [{ stockSearchVal: "", stockSearchSelect: "" }];
    },
    // 多条件搜索
    checkedStockSearch() {
      this.stockSearchShow = false;
      console.log(this.searchForm);
    },
  },
  beforeCreate() {}, //生命周期 - 创建之前
  //生命周期 - 创建完成（可以访问当前this实例）
  async created() {
    await this.getFileInfo();
    // 每次创建页面自动获取数据
    // await this.getAllStock();
  },
  beforeMount() {},
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style lang="less" scoped>
.main {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
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
  // margin: 10px;
  // display: flex;
  // width: 50%;

  .search-right {
    width: 100%;
    text-align: right;

    line-height: 40px;

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
.innerForm {
  padding: 20px;
}
.innerBotton {
  padding: 0 20px;
  text-align: center;
}
</style>