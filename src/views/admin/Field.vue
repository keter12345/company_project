
<template>
  <div class="">
    <!-- 数据展示部分 -->
    <el-table :data="fieldInfo" stripe style="width: 100%">
      <el-table-column prop="id" label="ID"> </el-table-column>
      <el-table-column prop="prop" label="字段值"> </el-table-column>
      <el-table-column prop="filedname" label="字段名"> </el-table-column>

      <el-table-column prop="is_show" label="是否展示" :formatter="showTag">
      </el-table-column>
      <el-table-column prop="is_select" label="是否搜索" :formatter="selectTag">
      </el-table-column>

      <el-table-column
        prop="tablename"
        label="控制表"
        :filters="tablenameFilter"
        :filter-method="filterTag"
        filter-placement="bottom-end"
      >
      </el-table-column>
      <el-table-column prop="rd_datetime" label="修改时间"> </el-table-column>
      <el-table-column prop="is_child" label="is_child"> </el-table-column>
      <el-table-column prop="child_msg" label="数据格式"> </el-table-column>
      <el-table-column prop="is_czzd" label="is_czzd"> </el-table-column>
      <el-table-column prop="chengdu" label="chengdu"> </el-table-column>
      <el-table-column prop="cz_ziduan" label="cz_ziduan"> </el-table-column>
      <el-table-column prop="num" label="排序"> </el-table-column>
      <el-table-column prop="danwei" label="单位"> </el-table-column>
      <el-table-column prop="bak" label="备注"> </el-table-column>

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
              @click="deleteField(scope.row)"
            ></i>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 抽屉 -->
    <el-drawer
      :title="fieldItemFrom.id ? '编辑字段' : '添加字段'"
      :visible.sync="drawer"
    >
      <div class="fieldFrom">
        <el-form ref="form" :model="fieldItemFrom" label-width="80px">
          <el-form-item label="字段id">
            <el-input v-model="fieldItemFrom.id"></el-input>
          </el-form-item>
          <el-form-item label="字段值">
            <el-input v-model="fieldItemFrom.prop"></el-input>
          </el-form-item>
          <el-form-item label="字段名">
            <el-input v-model="fieldItemFrom.filedname"></el-input>
          </el-form-item>
          <el-form-item label="控制表">
            <el-select
              v-model="fieldItemFrom.tablename"
              placeholder="请选择表名"
            >
              <el-option label="stock_show" value="stock_show"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="修改时间">
            <el-date-picker
              v-model="fieldItemFrom.rd_datetime"
              type="datetime"
              placeholder="选择日期时间"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="默认展示">
            <el-radio-group v-model="fieldItemFrom.is_show">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="is_child">
            <el-radio-group v-model="fieldItemFrom.is_child">
              <el-radio :label="1">有</el-radio>
              <el-radio :label="0">无</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="数据格式">
            <el-select
              v-model="fieldItemFrom.child_msg"
              placeholder="请选择格式"
            >
              <el-option label="json" value="json"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排序">
            <el-input v-model="fieldItemFrom.num"></el-input>
          </el-form-item>
          <!-- 详细描述 -->
          <el-form-item label="操作">
            <el-select
              v-model="fieldItemFrom.is_czzd"
              placeholder="请选择操作等级"
            >
              <el-option label="0" value="0"></el-option>
              <el-option label="1" value="1"></el-option>
              <el-option label="2" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input type="textarea" v-model="fieldItemFrom.bak"></el-input>
          </el-form-item>
          <el-form-item class="form_button">
            <el-button type="primary" @click="changeField">完成</el-button>
            <el-button>取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import {
  getFileInfoAPI,
  updateFilInfoAPI,
  getAllFieldInfoAPI,
} from "../../api/index";
export default {
  components: {},
  data() {
    return {
      fieldInfo: [
        //字段表数据，用于多选 prop：字段名 filedname：字段备注，isshow：默认显示
      ],
      showStatus: ["否", "是"],
      fieldItemFrom: {},
      drawer: false,
      tablenameFilter: [],
    };
  },

  computed: {},

  watch: {},

  methods: {
    // 获取所有字段相关数据
    async getFileInfo() {
      this.fieldInfo = await getAllFieldInfoAPI();
      this.fieldInfo = this.fieldInfoFormat(this.fieldInfo);
    },
    fieldInfoFormat(info) {
      console.log(info);
      let set = new Set();
      info = info.filter((data) => {
        // data["rd_datetime"] = data["rd_datetime"].substr(data["rd_datetime"].lastIndexOf(" "));
        set.add(data.tablename);
        return data;
      });
      for (let i of set) {
        this.tablenameFilter.push({ text: i, value: i });
      }
      console.log(info);
      return info;
    },
    showTag(row, cloumn) {
      return this.showStatus[row.is_show];
    },
    selectTag(row, cloumn) {
      return this.showStatus[row.is_select];
    },
    // 打开抽屉
    openDrawer(row) {
      this.drawer = true;
      if (row) {
        // 编辑
        this.fieldItemFrom = { ...row };
      } else {
        // 添加
      }
    },
    filterTag(value, row) {
      return row.tag === value;
    },
    // 添加或修改字段
    changeField() {},

    // 删除字段
    deleteField(row) {},
  },
  beforeCreate() {},
  async created() {
    await this.getFileInfo();
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
.fieldFrom {
  margin-right: 20px;
  .el-input {
    min-width: 200px;
  }
}
</style>