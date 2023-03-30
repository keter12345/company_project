
<template>
  <div class="">
    <!-- 数据展示部分 -->
    <el-table :data="filedInfo" stripe style="width: 100%">
      <el-table-column prop="id" label="ID"> </el-table-column>
      <el-table-column prop="prop" label="字段值"> </el-table-column>
      <el-table-column prop="filedname" label="字段名"> </el-table-column>

      <el-table-column prop="is_show" label="默认展示" :formatter="showTag">
      </el-table-column>
      <el-table-column prop="tablename" label="控制表"> </el-table-column>
      <el-table-column prop="rd_datetime" label="修改时间"> </el-table-column>
      <el-table-column prop="is_child" label="is_child"> </el-table-column>
      <el-table-column prop="child_msg" label="数据格式"> </el-table-column>
      <el-table-column prop="num" label="排序"> </el-table-column>

      <el-table-column prop="is_czzd" label="字段操作"> </el-table-column>
      <!-- 操作栏部分 -->
      <el-table-column>
        <template slot="header" slot-scope="scope">
          <span>操作</span>
          <i
            class="el-icon-circle-plus-outline"
            title="添加字段"
            @click="openDrawer"
          ></i>
        </template>
        <template slot-scope="scope">
          <div class="active">
            <i
              class="el-icon-edit-outline icon"
              title="编辑"
              @click="openDrawer(scope.row)"
            ></i>
            <i
              class="el-icon-delete icon"
              title="删除"
              @click="deleteFiled(scope.row)"
            ></i>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 抽屉 -->
    <el-drawer
      :title="filedItemFrom.id ? '编辑字段' : '添加字段'"
      :visible.sync="drawer"
    >
      <div class="filedFrom">
        <el-form ref="form" :model="filedItemFrom" label-width="80px">
          <el-form-item label="字段id">
            <el-input v-model="filedItemFrom.id"></el-input>
          </el-form-item>
          <el-form-item label="字段值">
            <el-input v-model="filedItemFrom.prop"></el-input>
          </el-form-item>
          <el-form-item label="字段名">
            <el-input v-model="filedItemFrom.filedname"></el-input>
          </el-form-item>
          <el-form-item label="控制表">
            <el-select
              v-model="filedItemFrom.tablename"
              placeholder="请选择表名"
            >
              <el-option label="stock_show" value="stock_show"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="修改时间">
            <el-date-picker
              v-model="filedItemFrom.rd_datetime"
              type="datetime"
              placeholder="选择日期时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="默认展示">
            <el-radio-group v-model="filedItemFrom.is_show">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="is_child">
            <el-radio-group v-model="filedItemFrom.is_child">
              <el-radio :label="1">有</el-radio>
              <el-radio :label="0">无</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="数据格式">
            <el-select
              v-model="filedItemFrom.child_msg"
              placeholder="请选择格式"
            >
              <el-option label="json" value="json"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input v-model="filedItemFrom.num"></el-input>
          </el-form-item>
          <el-form-item label="操作">
            <el-select
              v-model="filedItemFrom.is_czzd"
              placeholder="请选择操作等级"
            >
              <el-option label="0" value="0"></el-option>
              <el-option label="1" value="1"></el-option>
              <el-option label="2" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" v-model="filedItemFrom.bak"></el-input>
          </el-form-item>
          <el-form-item class="form_button">
            <el-button type="primary" @click="changeFiled">完成</el-button>
            <el-button>取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import { getFileInfoAPI, updateFilInfoAPI } from "../../api/index";
export default {
  components: {},
  data() {
    return {
      filedInfo: [
        //字段表数据，用于多选 prop：字段名 filedname：字段备注，isshow：默认显示
      ],
      showStatus: ["否", "是"],
      filedItemFrom: {},
      drawer: false,
    };
  },

  computed: {},

  watch: {},

  methods: {
    // 获取所有字段相关数据
    async getFileInfo() {
      this.filedInfo = await getFileInfoAPI();
    },
    showTag(row, cloumn) {
      return this.showStatus[row.is_show];
    },
    // 打开抽屉
    openDrawer(row) {
      this.drawer = true;
      if (row) {
        // 编辑
        this.filedItemFrom = { ...row };
      } else {
        // 添加
      }
    },
    // 添加或修改字段
    changeFiled() {},

    // 删除字段
    deleteFiled(row) {},
  },
  beforeCreate() {},
  created() {
    this.getFileInfo();
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
.el-table {
  .el-icon-circle-plus-outline {
    padding-left: 5px;
    font-size: 16px;
  }
  .el-icon-circle-plus-outline:hover {
    color: #409eff;
  }
}
.active {
  line-height: 30px;
  .icon {
    font-size: 20px;
    padding-right: 10px;
  }
  .el-icon-edit-outline:hover {
    color: #409eff;
  }
  .el-icon-delete:hover {
    color: #f56c6c;
  }
}
.filedFrom {
  margin-right: 20px;
  .el-input {
    min-width: 200px;
  }
}
</style>