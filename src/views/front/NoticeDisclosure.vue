<template>
  <div class="body">
    <!-- 查询条件部分 -->
    <el-row :gutter="20" class="query-row">
      <el-col :span="6">
        <el-input v-model="searchParams.ts_code" placeholder="股票代码" size="medium" />
      </el-col>
      <el-col :span="6">
        <el-input v-model="searchParams.ts_name" placeholder="股票名称" size="medium" />
      </el-col>
      <el-col :span="6">
        <el-date-picker
          v-model="searchParams.date_range"
          type="daterange"
          size="medium"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="dateRangeOptions"
        />
      </el-col>
      <el-col :span="3">
        <el-input v-model="searchParams.report_year" placeholder="报告年份" size="medium" />
      </el-col>
      <el-col :span="3">
        <el-select v-model="searchParams.report_type" placeholder="报告类型" size="medium">
          <el-option label="年报" value="年报" />
          <el-option label="中报" value="中报" />
          <el-option label="一季报" value="一季报" />
          <el-option label="三季报" value="三季报" />
        </el-select>
      </el-col>
    </el-row>

    <!-- 查询和重置按钮 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-button
          type="primary"
          @click="fetchNotices"
          icon="el-icon-search"
        >
          查询
        </el-button>
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

    <!-- 公告表格部分 -->
    <el-table :data="noticeInfo" stripe style="width: 100%">
      <template v-for="(item, index) in earningsTableField">
        <el-table-column
          sortable
          :key="index"
          :label="item.filedname"
          v-if="item.prop == 'title'"
        >
          <template slot-scope="scope">
            <el-link :href="scope.row.www" target="_blank">{{
              scope.row.title
            }}</el-link>
          </template>
        </el-table-column>

        <el-table-column
          sortable
          :key="index"
          :prop="item.prop"
          :label="item.filedname"
          :min-width="getColumnWidth(item.prop)"
          v-else
        ></el-table-column>
      </template>
    </el-table>

    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next, jumper"
      @current-change="handlePageChange"
      style="margin-top: 20px; text-align: right;"
    />
  </div>
</template>

<script>
import {
  getEarningsDisclosuresAPI,
  getFieldInfoByTablenameAPI,
} from "../../api/index.js";

export default {
  name: "EarningsDisclosure",
  data() {
    return {
      searchParams: {
        ts_code: "",
        ts_name: "",
        date_range: [],
        report_year: "",
        report_type: ""
      },
      noticeInfo: [],
      earningsFieldInfo: [],
      earningsTableField: [],
      dateRangeOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      currentPage: 1,
      pageSize: 10,
      total: 0,
    };
  },
  methods: {
    // 获取公告数据
    async fetchNotices() {
      console.log("请求页码:", this.currentPage);
      // 格式化日期为 YYYY-MM-DD
      const params = {
        ...this.searchParams,
        start_date: this.searchParams.date_range?.[0]
          ? this.searchParams.date_range[0].toISOString().split("T")[0]
          : "",
        end_date: this.searchParams.date_range?.[1]
          ? this.searchParams.date_range[1].toISOString().split("T")[0]
          : "",
        page: String(this.currentPage),
        page_size: String(this.pageSize),
      };

      // 请求公告数据
      const response = await getEarningsDisclosuresAPI(params);
      console.log(response);

      if (response && response.error) {
        this.$message.error(response.error); // 错误提示
      } else {
        this.total = response.count || 0;
        this.noticeInfo = response.results || [];
        if (!this.noticeInfo.length) {
          this.$message.warning("没有符合条件的公告数据！");
        } else {
          this.$message.success("查询成功！");
        }
      }
    },
    // 获取字段信息
    async getFieldInfo() {
      const earningsFieldInfo = await getFieldInfoByTablenameAPI("thx_stock_earnings_disclosure");
      this.earningsFieldInfo = earningsFieldInfo;

      // 格式化公告的日期字段
      this.earningsTableField = earningsFieldInfo.filter((item) => item.is_show === 1);
    },

    // 重置搜索条件
    resetSearch() {
      this.searchParams = {
        ts_code: "",
        ts_name: "",
        date_range: [],
        report_year: "",
        report_type: ""
      };
      this.currentPage = 1;
      this.fetchNotices();
    },
    handlePageChange(page) {
      console.log("翻页到第", page, "页");
      this.currentPage = page;
      this.fetchNotices();
    },
    getColumnWidth(prop) {
      if (!this.noticeInfo || this.noticeInfo.length === 0) return 120;
      let maxLength = this.noticeInfo.reduce((max, row) => {
        const value = row[prop] ? String(row[prop]) : "";
        return Math.max(max, value.length);
      }, 0);
      // 每个字符按 16px 计算，最小宽度 120px，最大 300px
      return Math.min(Math.max(maxLength * 16, 120), 300);
    },
  },
  async created() {
    await this.getFieldInfo();
    await this.fetchNotices();
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