<template>
  <div class="">
    <!-- text  下拉菜单 显示多选-->
    <div></div>

    <!-- text -->

    <!-- 设置抽屉，用于字段选择 -->
    <div>
      <!-- <i class="el-icon-setting" @click="open()"></i> -->
      <el-link icon="el-icon-setting" @click="open()">显示设置</el-link>
      <el-drawer :with-header="false" :visible.sync="drawer" size="20%">
        <div class="main">
          <div class="header">
            <span class="header_left">显示设置</span>
            <span class="header_right">
              <i class="el-icon-check icon" @click="checked()"></i>
              <i class="el-icon-refresh icon" @click="reset()"></i>
              <i class="el-icon-close icon" @click="cancle()"></i>
            </span>
          </div>
          <!-- 选择框部分 -->
          <!-- <div class="content">
            <el-input
              placeholder="请输入内容"
              prefix-icon="el-icon-search"
              v-model="filedSearch"
              size="small"
            >
            </el-input>
            <el-checkbox
              :indeterminate="isIndeterminate"
              v-model="checkAll"
              @change="handleCheckAllChange"
              >全选</el-checkbox
            >
            <el-checkbox-group
              v-model="filedChecked"
              @change="handleFiledCheckedChange"
            >
              <el-checkbox
                v-for="(filed, index) in filedInfo"
                :label="filed"
                :key="index"
                style="display: block; font-size: 35px"
                >{{ filed.filedname }}</el-checkbox
              >
            </el-checkbox-group>
          </div> -->
          <div>
            <el-table
              ref="filedInfoTable"
              :data="filedInfo"
              tooltip-effect="dark"
              style="width: 100%"
              @selection-change="handleSelectionChange"
              :row-key="getRowKey"
            >
              <el-table-column
                type="selection"
                width="55"
                :reserve-selection="true"
              >
              </el-table-column>
              <el-table-column>
                <template slot="header" slot-scope="scope">
                  <el-input
                    v-model="filedSearch"
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
      <el-table :data="stockInfo" stripe style="width: 100%" height="100vh">
        <el-table-column
          v-for="(item, index) in filedTable"
          :key="index"
          :prop="item.prop"
          :label="item.filedname"
        ></el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { getFileInfoAPI, updateFilInfoAPI } from "../api/index";
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
      checkAll: false,
      filedSearch: "", //字段搜索值
    };
  },

  computed: {},

  watch: {
    // 监听搜索数据
    filedSearch: {
      handler(newVal, oldVal) {
        if (newVal != "") {
          this.Search(newVal);
        } else {
          this.getFileInfo();
          console.log(this.filedChecked);
        }
      },
    },
  },

  methods: {
    // 获取所有-字段相关数据
    async getFileInfo() {
      this.filedInfo = await getFileInfoAPI();
      this.filedChecked = this.filedInfo.filter((data) => {
        return data.is_show === 1;
      });
      this.filedTable = this.filedInfo.filter((data) => {
        return data.is_show === 1;
      });
    },
    // 字段搜索功能
    Search(val) {
      this.filedInfo = this.filedInfo.filter((data) => {
        return data.filedname.includes(val);
      });
    },
    handleSelectionChange(val) {
      this.filedChecked = val;
    },
    getRowKey(row) {
      return row.id;
    },

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
    // ****确认按钮,发送、更新选中数据数据 updata接口！！！！
    async checked() {
      this.drawer = false;
      console.log(this.filedChecked);
      let res = [];
      this.filedChecked.map((item) => res.push({ id: item.id }));
      console.log(res);
      console.log(JSON.stringify(res));
      // await updateFilInfoAPI(JSON.stringify(res));
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
  beforeCreate() {}, //生命周期 - 创建之前
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {
    this.getFileInfo();
    // 每次创建页面自动获取数据
    this.stockInfo = [
      {
        ts_code: "002902",
        ts_name: "铭普光磁",
        rd_datetime: "2023-03-08T11:27:20",
        tradingamount: 384936864.0,
        cjbl: 1.7150280348855573,
        cjbl_one: 0.0,
        cjbl_five: 0.0,
        cjbl_ten: 0.0,
        changpercent: 7.369999885559082,
        chengdu: 0,
        countnum: 901,
        turnoverrate: 15.300000190734863,
        tradingamount_dw: 3.84936864,
        cha_tradingamount: 182560.0,
        one_tradingamount: 1087232.0,
        five_tradingamount: 7296000.0,
        ten_tradingamount: 18064064.0,
        jl_zycd: 6,
        one_tradingamount_p: 431200.0,
        one_tradingamount_s: 686496.0,
        one_tradingamount_b: 5056.0,
        five_tradingamount_p: 4015552.0,
        five_tradingamount_s: 1385760.0,
        five_tradingamount_b: 2783808.0,
        ten_tradingamount_p: 6107584.0,
        ten_tradingamount_s: 7864064.0,
        ten_tradingamount_b: 4068640.0,
        tradingamount_p: 126207425.0,
        tradingamount_s: 93939524.0,
        tradingamount_b: 164789915.0,
        lxztts: 0,
        five_jyl_cjbl_day: 0,
        tam_chengdu: 7,
        year_sfzt: 11,
        year_lxztqk: "3,2,",
        twoyear_sfzt: 18,
        twoyear_lxztqk: "2,3,2,",
      },
    ];
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
// 设置icon
.el-icon-setting {
  font-size: 25px;
  margin: 5px;
}

.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.main {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.content {
  padding: 20px;
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
    }
  }
}
</style>