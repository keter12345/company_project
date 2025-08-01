<script setup>
import { ref, onMounted } from 'vue'
import { getSchedulerStatusAPI, startSchedulerAPI, stopSchedulerAPI, runOnceNowAPI } from '../../api/index'
import { Message, Loading } from 'element-ui'
import axios from 'axios'

const isRunning = ref(false)
const isBusy = ref(false)
const logList = ref('')

const fetchStatus = async () => {
  try {
    const res = await getSchedulerStatusAPI()
    if (res == null || typeof res.running !== 'boolean') {
      console.warn('fetchStatus: invalid response', res)
      isRunning.value = false
    } else {
      isRunning.value = res.running
    }
    console.log('fetchStatus: success', res)
    await fetchLogs()
  } catch (e) {
    console.error('fetchStatus: error', e)
  }
}

const fetchLogs = async () => {
  try {
    const response = await axios.get('/api/logs/')
    if (response && response.data) {
      logList.value = JSON.stringify(response.data, null, 2)
    } else {
      logList.value = ''
    }
  } catch (e) {
    console.error('fetchLogs: error', e)
    logList.value = ''
  }
}

const startSchedulerHandler = async () => {
  try {
    await startSchedulerAPI();
  } catch (e) {
    // 记录startSchedulerAPI的异常，但不阻断fetchStatus
    console.error('startSchedulerHandler: startSchedulerAPI error', e);
  }
  try {
    await fetchStatus();
  } catch (e) {
    // 记录fetchStatus的异常，但不阻断流程
    console.error('startSchedulerHandler: fetchStatus error', e);
  }
  if (isRunning.value == null) {
    console.warn('startSchedulerHandler: isRunning is null, resetting to false')
    isRunning.value = false
  }
  await fetchLogs()
}

const stopSchedulerHandler = async () => {
  await stopSchedulerAPI()
  await fetchStatus()
  if (isRunning.value == null) {
    console.warn('stopSchedulerHandler: isRunning is null, resetting to false')
    isRunning.value = false
  }
  await fetchLogs()
}

const runNowHandler = async () => {
  isBusy.value = true
  // Removed Loading.service call
  // Removed Message.info('任务开始执行...')
  // Removed logList.value += '\n任务开始执行...'
  try {
    await runOnceNowAPI();
    try {
      await fetchStatus();
    } catch (e) {
      // 记录fetchStatus的异常，但不阻断流程
      console.error('runNowHandler: fetchStatus error', e);
    }
    if (isRunning.value == null) {
      console.warn('runNowHandler: isRunning is null, resetting to false')
      isRunning.value = false
    }
    await fetchLogs()
  } catch (e) {
    console.error('runNowHandler: runOnceNowAPI error', e);
  } finally {
    // Removed static '任务执行完毕' log and success message
    // Removed loading.close()
    isBusy.value = false
  }
}

onMounted(() => {
  fetchStatus()
  fetchLogs()
  setInterval(() => {
    fetchLogs()
  }, 3000)
})
</script>

<template>
  <div class="stock-thread-panel">
    <h2>公告更新任务控制</h2>
    <p>当前状态：<span :style="{ color: isRunning ? 'green' : 'red' }">{{ isRunning ? '运行中' : '已停止' }}</span></p>
    <button @click="startSchedulerHandler" :disabled="isRunning || isBusy">启动调度器</button>
    <button @click="stopSchedulerHandler" :disabled="!isRunning || isBusy">停止调度器</button>
    <button @click="runNowHandler" :disabled="isBusy">立即执行一次</button>
    <div class="log-panel">
      <h3>日志输出</h3>
      <pre>{{ logList }}</pre>
    </div>
  </div>
</template>

<style scoped lang="less">
.stock-thread-panel {
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;

  h2 {
    margin-bottom: 10px;
  }

  button {
    margin-right: 10px;
    padding: 6px 12px;
    cursor: pointer;
  }

  p {
    margin-bottom: 15px;
  }
}

.log-panel {
  margin-top: 20px;
  padding: 10px;
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: monospace;
  font-size: 13px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
}
</style>