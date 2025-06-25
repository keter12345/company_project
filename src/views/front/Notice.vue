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
      <el-col :span="6">
        <el-input
          v-model="searchParams.title"
          placeholder="公告标题"
          size="medium"
        />
      </el-col>
      <el-col :span="6">
        <el-date-picker
          v-model="searchParams.date_range"
          type="daterange"
          size="medium"
          placeholder="选择日期范围"
          :picker-options="dateRangeOptions"
        />
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
      <template v-for="(item, index) in conceptTableField">
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
          v-else
        ></el-table-column>
      </template>
    </el-table>
  </div>
</template>

<script>
import {
  getAllNoticeInfoAPI,
  getFieldInfoByTablenameAPI,
} from "../../api/index.js";

export default {
  name: "Notice",
  data() {
    return {
      searchParams: {
        ts_code: "",
        ts_name: "",
        title: "",
        date_range: [
          new Date(new Date().setDate(new Date().getDate() - 5)),
          new Date()
        ]
      },
      noticeInfo: [],
      conceptFieldInfo: [],
      conceptTableField: [],
      dateRangeOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      }
    };
  },
  methods: {
    // 获取公告数据
    async fetchNotices() {
      // 格式化日期为 YYYY-MM-DD
      const formattedStartDate = this.searchParams.date_range
        ? this.searchParams.date_range[0].toISOString().split('T')[0]
        : '';
      const formattedEndDate = this.searchParams.date_range
        ? this.searchParams.date_range[1].toISOString().split('T')[0]
        : '';

      // 更新searchParams
      const params = {
        ...this.searchParams,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      };

      // 请求公告数据
      const response = await getAllNoticeInfoAPI(params);
      
      if (response && response.error) {
        this.$message.error(response.error); // 错误提示
      } else {
        this.noticeInfo = response || [];
        if (!this.noticeInfo.length) {
          this.$message.warning("没有符合条件的公告数据！");
        } else {
          this.$message.success("查询成功！");
        }
      }
    },
    // 获取字段信息
    async getFieldInfo() {
      const conceptFieldInfo = await getFieldInfoByTablenameAPI("thx_stock_near_notice");
      this.conceptFieldInfo = conceptFieldInfo;

      // 格式化公告的日期字段
      this.conceptTableField = conceptFieldInfo.filter((item) => item.is_show === 1);
      this.noticeInfo = this.noticeInfo.map(item => {
        if (item.execution_date) {
          item.execution_date = item.execution_date.split('T')[0]; // 格式化为 YYYY-MM-DD
        }
        return item;
      });
    },
    
    // 重置搜索条件
    resetSearch() {
      this.searchParams = {
        ts_code: "",
        ts_name: "",
        title: "",
        date_range: [
          new Date(new Date().setDate(new Date().getDate() - 5)),
          new Date()
        ]
      };
      this.fetchNotices();
    }
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