<template>
  <div style="height: 100%">
    <el-container>
      <el-header>
        <el-menu class="el-menu-demo" mode="horizontal">
          <el-menu-item index="1">首页</el-menu-item>
          <el-menu-item index="2">消息中心</el-menu-item>
        </el-menu>
      </el-header>
      <el-container>
        <el-aside :width="isCollapse ? '65px' : '200px'">
          <el-menu
            :default-active="this.$route.path"
            class="el-menu-vertical-demo"
            router
            :collapse="isCollapse"
            @select="handleSelect"
          >
            <div class="Collapse" @click="isCollapse = !isCollapse">
              <i class="el-icon-caret-right" v-if="isCollapse"></i>
              <i class="el-icon-caret-left" v-else></i>
            </div>
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-user"></i>
                <span>用户模块</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/industry">
                  <i class="el-icon-s-home"></i>
                  <span slot="title">行业详情</span>
                </el-menu-item>
                <el-menu-item index="/concept">
                  <i class="el-icon-s-cooperation"></i>
                  <span slot="title">概念详情</span>
                </el-menu-item>
                <el-menu-item index="/stock">
                  <i class="el-icon-s-data"></i>
                  <span slot="title">数据展示</span>
                </el-menu-item>
                <el-menu-item index="/history">
                  <i class="el-icon-time"></i>
                  <span slot="title">历史数据</span>
                </el-menu-item>
                <el-menu-item index="/stockjs">
                  <i class="el-icon-time"></i>
                  <span slot="title">历史JS</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>

            <el-submenu index="/field">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>管理模块</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/field">
                  <i class="el-icon-s-home"></i>
                  <span slot="title">字段管理</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 页面内容 -->
        <el-main class="el-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isCollapse: true,
    };
  },
  methods: {
    handleSelect(key, keyPath) {},
  },
};
</script>

<style lang="less" scoped>
.el-header {
  .el-menu-item,
  .el-submenu {
    text-align: center;
    line-height: 60px;
  }

  /deep/.el-menu .el-menu-item:hover,
  i:hover {
    color: #409eff;
    // background: white !important;
  }

  /deep/.el-menu .el-menu-item.is-active {
    color: #409eff !important;
    // background: white !important;
  }

  .el-submenu /deep/.el-submenu__title:hover {
    color: #409eff !important;
    // background: white !important;
  }
  .el-menu {
    height: 100%-1px;
  }
}

// .el-container {
//   .el-container {
//     height: calc(100vh - 60px);
//   }
// }

.el-aside {
  height: calc(100vh - 60px);
  transition: width 0.25s;
  -webkit-transition: width 0.25s;
  -moz-transition: width 0.25s;
  -webkit-transition: width 0.25s;
  -o-transition: width 0.25s;
  overflow-x: hidden;
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 100% -1px;
    height: calc(100vh - 60px);
  }
  .el-menu {
    transition: all 10ms;
    height: calc(100vh - 60px);
    .Collapse {
      padding-left: 20px;
      // text-align: center;
      height: 35px;
      line-height: 35px;
      font-size: 25px;
      background-color: #b5daff85;
    }
  }
}

.el-main {
  width: 100%;
  height: calc(100vh - 60px);
  overflow-y: auto;
  // background-color: antiquewhite;
}
</style>