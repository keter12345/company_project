<template>
  <div class="">
    <el-table :data="BKInfo" stripe style="width: 100%" height="1000">
      <!-- 子模块 -->
      <el-table-column type="expand">
        <template slot-scope="props">
          <div style="margin-top: 10px">
            <el-button type="primary" plain size="mini" @click="updateStatus(0)"
              >普通</el-button
            >
            <el-button type="warning" plain size="mini" @click="updateStatus(1)"
              >重要</el-button
            >
            <el-button type="danger" plain size="mini" @click="updateStatus(2)"
              >龙头</el-button
            >
            <el-button plain size="mini" @click="clear()">取消选择</el-button>
          </div>
          <el-table
            ref="ItemTable"
            :data="props.row.ItemInfo"
            tooltip-effect="dark"
            style="width: 100%"
            @selection-change="ItemSelectionChange"
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column
              prop="ts_code"
              label="股票代码"
              width="120"
            ></el-table-column>
            <el-table-column prop="ts_name" label="股票名称" width="120">
            </el-table-column>
            <el-table-column
              prop="status"
              label="状态"
              width="120"
              :formatter="statusTag"
              :filters="[
                { text: '普通', value: 0 },
                { text: '重要', value: 1 },
                { text: '龙头', value: 2 },
              ]"
              :filter-method="statusFilterTag"
              filter-placement="bottom-end"
            >
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>

      <el-table-column prop="bk_name" label="行业名称" width="180"></el-table-column>
      <el-table-column prop="bk_code" label="行业代码" width="180"></el-table-column>
      <el-table-column prop="bak" label="备注"></el-table-column>
      <el-table-column
        prop="zycd"
        label="重要程度"
        :formatter="zycdTag"
        :filters="[
          { text: '正常', value: 0 },
          { text: '热点', value: 1 },
          { text: '重要热点', value: 2 },
        ]"
        :filter-method="zycdFilterTag"
        filter-placement="bottom-end"
      ></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="updateBK(scope.row.id, '0')"
            >正常</el-button
          >
          <el-button size="mini" type="warning" @click="updateBK(scope.row.id, '1')"
            >热点</el-button
          >
          <el-button size="mini" type="danger" @click="updateBK(scope.row.id, '2')"
            >重要热点</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "Industry_BG",
  components: {},
  data() {
    return {
      BKInfo: [
        {
          Id: 944,
          bk_code: "881121",
          bk_name: "半导体及元件",
          bk_www: "http://q.10jqka.com.cn/thshy/detail/code/881121/",
          bak: null,
          zycd: 1,
          ItemInfo: [
            {
              ts_code: "688221",
              ts_name: "翱捷科技1",
              bk_code: "881121",
              bk_name: "半导体及元件",
              status: 0,
            },
            {
              ts_code: "688222",
              ts_name: "翱捷科技2",
              bk_code: "881121",
              bk_name: "半导体及元件",
              status: 0,
            },
            {
              ts_code: "688223",
              ts_name: "翱捷科技3",
              bk_code: "881121",
              bk_name: "半导体及元件",
              status: 0,
            },
          ],
        },
        {
          Id: 945,
          bk_code: "881131",
          bk_name: "白色家电",
          bk_www: "http://q.10jqka.com.cn/thshy/detail/code/881131/",
          bak: null,
          zycd: 2,
          ItemInfo: [],
        },
      ],
      zycdStr: ["正常", "热点", "重要热点"],
      statusStr: ["普通", "重要", "龙头"],
      ItemSelection: [],
    };
  },

  computed: {},

  watch: {},

  methods: {
    updataBK(id, str) {},
    updataItem() {},
    zycdTag(row, cloumn) {
      return this.zycdStr[row.zycd];
    },
    zycdFilterTag(value, row) {
      return value === row.zycd;
    },
    statusTag(row, cloumn) {
      return this.statusStr[row.status];
    },
    statusFilterTag(value, row) {
      return value === row.status;
    },
    ItemSelectionChange(val) {
      this.ItemSelection = val;
      console.log(this.ItemSelection);
    },
    clear() {
      this.$refs.ItemTable.clearSelection();
    },
    updateStatus(val) {
      let str = this.BKInfo[0].ItemInfo;
      this.ItemSelection.forEach((item) => {
        for (let i = 0; i < str.length; i++) {
          if (item.ts_code === str[i].ts_code) {
            this.BKInfo[0].ItemInfo[i].status = val;
          }
        }
      });
    },
  },
  beforeCreate() {}, //生命周期 - 创建之前
  //生命周期 - 创建完成（可以访问当前this实例）
  created() {},
  beforeMount() {}, //生命周期 - 挂载之前
  //生命周期 - 挂载完成（可以访问DOM元素）
  mounted() {},
  beforeUpdate() {}, //生命周期 - 更新之前
  updated() {}, //生命周期 - 更新之后
  beforeDestroy() {}, //生命周期 - 销毁之前
  destroyed() {}, //生命周期 - 销毁完成
  activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
};
</script>
<style></style>
