<template>
  <div class="body">
    <!-- 查询条件部分 -->
    <el-row :gutter="20" class="query-row">
      <el-col :span="6">
        <el-input
          v-model="searchParams.ts_code"
          placeholder="股票代码"
          size="medium"
        />
      </el-col>
      <el-col :span="6">
        <el-input
          v-model="searchParams.ts_name"
          placeholder="股票名称"
          size="medium"
        />
      </el-col>
    </el-row>

    <!-- 查询和重置按钮 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-button
          type="primary"
          @click="fetchStockData"
          icon="el-icon-search"
        >
          查询
        </el-button>
        <el-button @click="showFilterPanel = true" icon="el-icon-setting">板块筛选</el-button>
      </el-col>
      <el-col :span="6">
        <el-button
          @click="resetSearch"
          icon="el-icon-refresh"
        >
          重置
        </el-button>
      </el-col>
    </el-row>

    <el-dialog title="板块筛选" :visible.sync="showFilterPanel" width="600px">
      <el-radio-group v-model="bkType" style="margin-bottom: 20px;">
        <el-radio-button label="hy">行业板块</el-radio-button>
        <el-radio-button label="gn">概念板块</el-radio-button>
      </el-radio-group>

      <div v-if="bkType === 'hy'" style="margin-bottom: 10px;">
        <el-button size="mini" @click="selectAllBkhy">全选</el-button>
        <el-button size="mini" @click="reverseSelectBkhy">反选</el-button>
        <el-button size="mini" @click="clearSelectBkhy">取消</el-button>
      </div>
      <el-checkbox-group v-if="bkType === 'hy'" v-model="selectedBkhy">
        <el-checkbox
          v-for="item in bkhyOptions"
          :label="item.bk_code"
          :key="item.bk_code"
        >
          <span :style="{ color: item.zycd === 2 ? 'red' : item.zycd === 1 ? 'blue' : 'inherit' }">{{ item.bk_name }}</span>
        </el-checkbox>
      </el-checkbox-group>
      <div v-if="bkType === 'gn'" style="margin-bottom: 10px;">
        <el-button size="mini" @click="selectAllBkgn">全选</el-button>
        <el-button size="mini" @click="reverseSelectBkgn">反选</el-button>
        <el-button size="mini" @click="clearSelectBkgn">取消</el-button>
      </div>
      <el-checkbox-group v-if="bkType === 'gn'" v-model="selectedBkgn">
        <el-checkbox
          v-for="item in bkgnOptions"
          :label="item.bk_code"
          :key="item.bk_code"
        >
          <span :style="{ color: item.zycd === 2 ? 'red' : item.zycd === 1 ? 'blue' : 'inherit' }">{{ item.bk_name }}</span>
        </el-checkbox>
      </el-checkbox-group>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showFilterPanel = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmFilter">确认</el-button>
      </span>
    </el-dialog>

    <!-- 行情数据表格部分 -->
    <el-table :data="stockData" stripe style="width: 100%">
      <el-table-column
        v-for="(item, index) in tableFields"
        :key="item.prop"
        :prop="item.prop"
        :label="item.prop === 'tradingamount' ? item.filedname + '(亿元)' : item.filedname"
        :min-width="getColumnWidth(item.prop)"
        :formatter="formatColumn"
        sortable
      />
    </el-table>
  </div>
</template>

<script>
import {
  getStockJSAPI,
  getFieldInfoByTablenameAPI,
  getAllBkgnListAPI,
  getAllBkhyListAPI
} from "../../api/index.js";

export default {
  name: "StockJS",
  data() {
    return {
      searchParams: {
        ts_code: "",
        ts_name: "",
      },
      stockData: [],
      tableFields: [],
      total: 0,
      showFilterPanel: false,
      bkgnOptions: [],
      bkhyOptions: [],
      selectedBkgn: [],
      selectedBkhy: [],
      bkType: "hy", // hy 表示行业，gn 表示概念
    };
  },
  methods: {
    // 获取字段信息
    async getFieldInfo() {
      const fieldInfo = await getFieldInfoByTablenameAPI("stock_history_js");
      this.tableFields = fieldInfo.filter((item) => item.is_show === 1);
      console.log("Filtered table fields:", this.tableFields);
    },
    // 保留两位小数
    formatNumber(value) {
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toFixed(2);
    },
    // 格式化列显示
    formatColumn(row, column, cellValue) {
      if (typeof cellValue === "number") {
        const prop = column.property;
        if (prop === "tradingamount") {
          return this.formatNumber(cellValue);
        }
        return this.formatNumber(cellValue);
      }
      return cellValue;
    },
    // 获取数据
    async fetchStockData() {
      if (this.bkType === "hy" && this.selectedBkhy.length > 0) {
        this.searchParams.hy_bk_codes = this.selectedBkhy.join(",");
        delete this.searchParams.gn_bk_codes; // 强制清除概念筛选条件
      } else if (this.bkType === "gn" && this.selectedBkgn.length > 0) {
        this.searchParams.gn_bk_codes = this.selectedBkgn.join(",");
        delete this.searchParams.hy_bk_codes; // 强制清除行业筛选条件
      } else {
        delete this.searchParams.hy_bk_codes;
        delete this.searchParams.gn_bk_codes;
      }
      const response = await getStockJSAPI(this.searchParams);
      console.log("API response:", response);
      if (response && response.error) {
        this.$message.error(response.error);
      } else {
        this.total = response.total || 0;
        this.stockData = (response.data || response || []).map(item => {
          const formattedItem = {};
          for (const key in item) {
            const val = item[key];
            formattedItem[key] =
              typeof val === "number"
                ? (key === "tradingamount" ? val / 100000000 : val)
                : val;
          }
          return formattedItem;
        });
        if (!this.stockData.length) {
          this.$message.warning("没有符合条件的行情数据！");
        } else {
          this.$message.success("行情数据加载成功！");
        }
      }
    },
    // 重置搜索
    resetSearch() {
      this.searchParams = {
        ts_code: "",
        ts_name: "",
      };
      this.fetchStockData();
    },
    getColumnWidth(prop) {
      if (!this.stockData || this.stockData.length === 0) return 120;
      let maxLength = this.stockData.reduce((max, row) => {
        const value = row[prop] !== undefined ? String(this.formatNumber(row[prop])) : "";
        return Math.max(max, value.length);
      }, 0);
      return Math.min(Math.max(maxLength * 14 + 40, 120), 500);
    },
    async fetchBkgnOptions() {
      const response = await getAllBkgnListAPI();
      this.bkgnOptions = response || [];
      this.selectedBkgn = (response || []).filter(item => item.zycd === 2).map(item => item.bk_code);
    },
    async fetchBkhyOptions() {
      const response = await getAllBkhyListAPI();
      this.bkhyOptions = response || [];
      this.selectedBkhy = (response || []).filter(item => item.zycd === 2).map(item => item.bk_code);
    },
    handleConfirmFilter() {
      this.showFilterPanel = false;
      this.fetchStockData();
    },
    selectAllBkgn() {
      this.selectedBkgn = this.bkgnOptions.map(item => item.bk_code);
    },
    reverseSelectBkgn() {
      this.selectedBkgn = this.bkgnOptions
        .filter(item => !this.selectedBkgn.includes(item.bk_code))
        .map(item => item.bk_code);
    },
    clearSelectBkgn() {
      this.selectedBkgn = [];
    },
    selectAllBkhy() {
      this.selectedBkhy = this.bkhyOptions.map(item => item.bk_code);
    },
    reverseSelectBkhy() {
      this.selectedBkhy = this.bkhyOptions
        .filter(item => !this.selectedBkhy.includes(item.bk_code))
        .map(item => item.bk_code);
    },
    clearSelectBkhy() {
      this.selectedBkhy = [];
    }
  },
  async created() {
    await this.getFieldInfo();
    this.fetchBkgnOptions();
    this.fetchBkhyOptions();
    // await this.fetchStockData(); // 页面加载不自动请求，等待用户查询
  }
};
</script>

<style scoped>
.query-row {
  margin-bottom: 20px;
}
.el-row {
  margin-top: 20px;
}
</style>