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
        <el-date-picker
          v-model="searchParams.rd_datetime"
          type="daterange"
          size="medium"
          placeholder="选择日期范围"
          :picker-options="dateRangeOptions"
        />
      </el-col>
      <el-col :span="6">
        <el-input
          v-model="searchParams.type"
          placeholder="类型"
          size="medium"
        />
      </el-col>
    </el-row>

    <!-- 查询和新增按钮 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="6">
        <el-button
          type="primary"
          @click="fetchRecords"
          icon="el-icon-search"
        >
          查询
        </el-button>
      </el-col>
      <el-col :span="6">
        <el-button
          type="success"
          @click="openAddDialog"
          icon="el-icon-plus"
        >
          新增
        </el-button>
      </el-col>
    </el-row>

    <!-- 公告表格部分 -->
    <el-table :data="records" stripe style="width: 100%; margin-top: 20px;">
      <el-table-column prop="ts_code" label="股票代码" sortable />
      <el-table-column prop="ts_name" label="股票名称" sortable />
      <el-table-column prop="rd_datetime" label="日期" sortable />
      <el-table-column prop="type" label="类型" sortable />
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button type="primary" size="mini" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="deleteRecord(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑/新增弹窗 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px">
      <el-form :model="editForm" ref="editForm" label-width="100px">
        <el-form-item label="股票代码" :rules="[{ required: true, message: '请输入股票代码', trigger: 'blur' }]">
          <el-input v-model="editForm.ts_code" autocomplete="off" />
        </el-form-item>

        <el-form-item label="类型" :rules="[{ required: true, message: '请输入类型', trigger: 'blur' }]">
          <el-input v-model="editForm.type" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAllRtStockZyAPI,
  addRtStockZyAPI,
  updateRtStockZyAPI,
  deleteRtStockZyAPI
} from "../../api/index.js";

export default {
  name: "StockZy",
  data() {
    return {
      searchParams: {
        ts_code: "",
        ts_name: "",
        rd_datetime: [],
        type: "",
      },
      records: [],
      dialogVisible: false,
      dialogTitle: "新增记录",
      editForm: {
        id: null,
        ts_code: "",
        ts_name: "",
        rd_datetime: "",
        type: "",
      },
      dateRangeOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
    };
  },
  methods: {
    async fetchRecords() {
      try {
        const params = {
          ts_code: this.searchParams.ts_code,
          ts_name: this.searchParams.ts_name,
          type: this.searchParams.type,
          start_date: this.searchParams.rd_datetime.length ? this.searchParams.rd_datetime[0].toISOString().split("T")[0] : "",
          end_date: this.searchParams.rd_datetime.length ? this.searchParams.rd_datetime[1].toISOString().split("T")[0] : "",
        };
        const response = await getAllRtStockZyAPI(params);
        this.records = response || [];
        if (!this.records.length) {
          this.$message.warning("没有符合条件的记录！");
        } else {
          this.$message.success("查询成功！");
        }
      } catch (error) {
        this.$message.error("查询失败：" + (error.response?.data?.message || error.message));
      }
    },
    openAddDialog() {
      this.dialogTitle = "新增记录";
      this.editForm = {
        id: null,
        ts_code: "",
        ts_name: "",
        rd_datetime: "",
        type: "",
      };
      this.dialogVisible = true;
    },
    openEditDialog(row) {
      this.dialogTitle = "编辑记录";
      this.editForm = {
        id: row.id,
        ts_code: row.ts_code,
        ts_name: row.ts_name,
        rd_datetime: row.rd_datetime,
        type: row.type,
      };
      this.dialogVisible = true;
    },
    async submitForm() {
      try {
        this.$refs.editForm.validate(async (valid) => {
          if (!valid) return;
          if (this.editForm.id) {
            await updateRtStockZyAPI(this.editForm);
            this.$message.success("更新成功！");
          } else {
            await addRtStockZyAPI(this.editForm);
            this.$message.success("新增成功！");
          }
          this.dialogVisible = false;
          this.fetchRecords();
        });
      } catch (error) {
        this.$message.error("操作失败：" + (error.response?.data?.message || error.message));
      }
    },
    async deleteRecord(id) {
      try {
        await this.$confirm("此操作将永久删除该记录，是否继续？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        await deleteRtStockZyAPI(id);
        this.$message.success("删除成功！");
        this.fetchRecords();
      } catch (error) {
        if (error !== "cancel") {
          this.$message.error("删除失败：" + (error.response?.data?.message || error.message));
        }
      }
    },
  },
  mounted() {
    this.fetchRecords();
  },
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