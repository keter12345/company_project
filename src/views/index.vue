<template>
  <div style="height: 100%">
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header>
        <el-menu
          :default-active="activeIndex"
          mode="horizontal"
          class="el-menu-demo"
          @select="handleSelect"
        >
          <el-row :gutter="20">
            <el-col :span="3">
              <div>
                <el-menu-item index="1">
                  <i class="el-icon-s-home"></i>
                </el-menu-item>
              </div>
            </el-col>
            <el-col :span="2" :offset="17">
              <el-menu-item index="2">
                <i class="el-icon-bell"></i>
              </el-menu-item>
            </el-col>
            <el-col :span="2">
              <el-submenu index="3">
                <template slot="title"
                  ><i class="el-icon-user-solid"></i>
                </template>
                <el-menu-item index="3-1">退出登录</el-menu-item>
              </el-submenu>
            </el-col>
          </el-row>
        </el-menu>
      </el-header>
      <el-container>
        <!-- 侧边栏 -->
        <el-aside width="200px">
          <el-menu default-active="1" class="el-menu-vertical-demo" router>
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>用户模块</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/industry">
                  <i class="el-icon-s-home"></i>
                  <span slot="title">行业详情</span>
                </el-menu-item>
                <el-menu-item index="/stock">
                  <i class="el-icon-chat-dot-square"></i>
                  <span slot="title">概念详情</span>
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>

            <el-submenu index="2">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>管理模块</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="/filed">
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
      activeIndex: "1",
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
    background: white !important;
  }

  /deep/.el-menu .el-menu-item.is-active {
    color: #409eff !important;
    background: white !important;
  }

  .el-submenu /deep/.el-submenu__title:hover {
    color: #409eff !important;
    background: white !important;
  }
}

.el-menu {
  width: 100%-1px;
  height: 100%-1px;
}

.el-container {
  height: calc(100vh - 60px);
}

.el-aside {
}

.el-main {
  height: calc(100vh - 60px);

  overflow-y: auto;
  // background-color: antiquewhite;
}
</style>