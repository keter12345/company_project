<template>
  <div class="realtime-task-control">
    <el-alert
      class="manual-alert"
      title="实时任务默认不随系统启动，需要在这里手动启动；暂停会停止对应后台进程。"
      type="info"
      :closable="false"
      show-icon
    />

    <el-card v-for="task in tasks" :key="task.id" class="task-card">
      <div slot="header" class="task-header">
        <div>
          <span class="title">{{ task.name || '实时股票程序' }}</span>
          <el-tag :type="task.running ? 'success' : 'info'" size="mini">
            {{ task.running ? '运行中' : '已暂停' }}
          </el-tag>
        </div>
        <div class="actions">
          <el-button size="mini" type="success" icon="el-icon-video-play" :disabled="task.running" @click="startTask(task)">
            {{ task.id === 'gugu_realtime_test' ? '启动 / 继续' : '启动' }}
          </el-button>
          <el-button size="mini" type="warning" icon="el-icon-video-pause" :disabled="!task.running" @click="stopTask(task)">
            暂停
          </el-button>
          <el-button v-if="task.id === 'gugu_realtime_test'" size="mini" type="danger" icon="el-icon-refresh" :disabled="task.running" @click="restartTask(task)">
            重新启动
          </el-button>
          <el-button v-if="!task.requires_replay_date" size="mini" type="danger" icon="el-icon-refresh" :loading="runningOnce[task.id]" :disabled="task.running" @click="runOnce(task)">
            单次抓取
          </el-button>
          <el-button size="mini" icon="el-icon-refresh-right" @click="loadStatus(task)">刷新</el-button>
        </div>
      </div>

      <el-descriptions :column="2" border size="mini">
        <el-descriptions-item label="任务名称">{{ task.name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="进程 PID">{{ task.pid || '-' }}</el-descriptions-item>
        <el-descriptions-item label="服务时间">{{ task.server_time || '-' }}</el-descriptions-item>
        <el-descriptions-item label="启动方式">{{ task.manual_only ? '手动启动' : '后台任务' }}</el-descriptions-item>
        <el-descriptions-item label="说明" :span="2">{{ task.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="锁文件">{{ task.lock_file || '-' }}</el-descriptions-item>
        <el-descriptions-item label="脚本路径" :span="2">{{ task.script || '-' }}</el-descriptions-item>
        <el-descriptions-item label="日志路径" :span="2">{{ task.log_file || '-' }}</el-descriptions-item>
        <el-descriptions-item label="错误日志" :span="2">{{ task.error_log_file || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="task.id === 'gugu_realtime_test'" class="replay-options">
        <span class="replay-label">历史回放日期</span>
        <el-date-picker
          v-model="task.replayDate"
          size="mini"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="继续时自动恢复上次测试日"
          @change="saveReplayDate(task)"
        />
        <span class="replay-tip">“启动 / 继续”从最后完成批次继续；未选日期时自动恢复上次测试日，无进度才取历史表最新日期。</span>
      </div>

      <div class="log-tip">
        日志每 2 秒刷新一次，最新记录显示在最上方；最近成功刷新：{{ lastRefreshAt || '-' }}。
        <span v-if="refreshError" class="refresh-error">刷新失败：{{ refreshError }}</span>
      </div>

      <div class="log-grid">
        <div class="log-panel">
          <div class="log-title">最近日志</div>
          <pre>{{ logText(task) }}</pre>
        </div>
        <div class="log-panel">
          <div class="log-title">错误日志</div>
          <pre>{{ errorLogText(task) }}</pre>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  getRealtimeTaskStatus,
  runRealtimeTaskOnce,
  startRealtimeTask,
  stopRealtimeTask,
} from '../../api/realtimeTasks'

export default {
  name: 'RealtimeTaskControl',
  data() {
    return {
      tasks: [
        { id: 'yidong_realtime', name: '同花顺异动实时抓取', running: false },
        { id: 'gugu_realtime_prod', name: '股票实时程序-正式', running: false },
        { id: 'gugu_realtime_test', name: '股票实时程序-测试', running: false, replayDate: '', requires_replay_date: true },
      ],
      timer: null,
      runningOnce: {},
      polling: false,
      lastRefreshAt: '',
      refreshError: '',
    }
  },
  mounted() {
    const savedReplayDate = window.localStorage.getItem('gugu_realtime_test_replay_date') || ''
    const testTask = this.tasks.find(task => task.id === 'gugu_realtime_test')
    if (testTask) testTask.replayDate = savedReplayDate
    this.loadAllStatus()
    // 日志和运行状态统一每 2 秒刷新，避免刚启动时因状态尚未回写而等待 16 秒。
    // 使用箭头函数保留 Vue 组件的 this；直接传 this.loadAllStatus 会导致
    // 定时器回调丢失组件上下文，表现为首次显示正常、之后不再自动刷新。
    this.timer = setInterval(() => this.loadAllStatus(), 2000)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    loadAllStatus() {
      // 一轮请求尚未结束时不叠加下一轮，避免慢日志接口堆积。
      if (this.polling) return
      this.polling = true
      Promise.all(this.tasks.map(task => this.loadStatus(task, { silent: true })))
        .then(() => {
          this.lastRefreshAt = new Date().toLocaleTimeString('zh-CN', { hour12: false })
          this.refreshError = ''
        })
        .catch(err => {
          this.refreshError = err?.message || '状态接口无法连接'
        })
        .finally(() => { this.polling = false })
    },
    replaceTask(task, payload) {
      // Vue 2 对已有对象“新增属性”不会可靠触发重绘。整体替换数组项，确保
      // logs、error_logs、server_time 每次轮询都立即进入页面。
      const index = this.tasks.findIndex(item => item.id === task.id)
      if (index < 0) return
      this.$set(this.tasks, index, {
        ...task,
        ...(payload || {}),
        replayDate: task.replayDate || payload?.replayDate || '',
      })
    },
    loadStatus(task, { silent = false } = {}) {
      return getRealtimeTaskStatus(task.id).then(data => {
        if (!data.ok) {
          throw new Error(data.error || '获取实时任务状态失败')
        }
        this.replaceTask(task, data.task || {})
      }).catch(err => {
        console.error(err)
        if (!silent) this.$message.error('获取实时任务状态失败')
        throw err
      })
    },
    taskOptions(task) {
      if (task.id === 'gugu_realtime_test' && task.replayDate) {
        return { replay_date: task.replayDate }
      }
      return {}
    },
    saveReplayDate(task) {
      if (task.id === 'gugu_realtime_test') {
        window.localStorage.setItem('gugu_realtime_test_replay_date', task.replayDate || '')
      }
    },
    startTask(task) {
      startRealtimeTask(task.id, this.taskOptions(task)).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '启动失败')
          return
        }
        this.replaceTask(task, data.task || {})
        this.$message.success(data.msg || '实时抓取任务已启动')
      }).catch(err => {
        console.error(err)
        this.$message.error('启动实时抓取任务失败')
      })
    },
    restartTask(task) {
      if (!task.replayDate) {
        this.$message.warning('请先选择历史回放日期')
        return
      }
      this.$confirm(
        `将清空 ${task.replayDate} 的全部测试输出，并从 countnum=0 重新回放。是否继续？`,
        '确认重新启动',
        { confirmButtonText: '确认重新启动', cancelButtonText: '取消', type: 'warning' },
      ).then(() => {
        return startRealtimeTask(task.id, { ...this.taskOptions(task), restart: 1 })
      }).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '重新启动失败')
          return
        }
        this.replaceTask(task, data.task || {})
        this.$message.success(data.msg || '测试程序已从头重新启动')
      }).catch(err => {
        if (err !== 'cancel') {
          console.error(err)
          this.$message.error('重新启动失败')
        }
      })
    },
    stopTask(task) {
      stopRealtimeTask(task.id).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || '停止失败')
          return
        }
        this.replaceTask(task, data.task || {})
        this.$message.success(data.msg || '已发送停止信号')
      }).catch(err => {
        console.error(err)
        this.$message.error('停止实时抓取任务失败')
      })
    },
    runOnce(task) {
      // 单次抓取用于接口和数据库验证，不会改变常驻任务的手动启动状态。
      this.$set(this.runningOnce, task.id, true)
      runRealtimeTaskOnce(task.id, this.taskOptions(task)).then(data => {
        if (!data.ok) {
          this.$message.error(data.error || data.msg || '单次抓取失败')
        } else {
          this.$message.success(data.msg || '单次抓取完成')
        }
        this.replaceTask(task, data.task || {})
      }).catch(err => {
        console.error(err)
        this.$message.error('单次抓取失败')
      }).finally(() => {
        this.$set(this.runningOnce, task.id, false)
      })
    },
    logText(task) {
      // 后端已保证最新记录排在最上方，前端不得再次反转。
      return (task.logs || []).join('\n')
    },
    errorLogText(task) {
      return (task.error_logs || []).join('\n')
    },
  },
}
</script>

<style scoped>
.realtime-task-control {
  padding: 10px;
}
.manual-alert {
  margin-bottom: 12px;
}
.task-card {
  margin-bottom: 12px;
}
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.title {
  margin-right: 10px;
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.log-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  margin-top: 12px;
}
.replay-options {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.replay-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}
.replay-tip {
  font-size: 12px;
  color: #909399;
}
.log-tip {
  margin-top: 12px;
  color: #909399;
  font-size: 12px;
}
.log-title {
  margin-bottom: 6px;
  font-weight: 600;
}
.refresh-error {
  color: #f56c6c;
}
pre {
  min-height: 220px;
  max-height: 420px;
  overflow: auto;
  padding: 10px;
  margin: 0;
  color: #303133;
  background: #f5f7fa;
  border: 1px solid #ebeef5;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}
@media (max-width: 900px) {
  .log-grid {
    grid-template-columns: 1fr;
  }
}
</style>
