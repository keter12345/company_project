import request from "../utils/request";

export const getRealtimeTaskStatus = (taskId = "yidong_realtime") => request({
  method: "GET",
  url: "realtime_tasks/status/",
  // 每次状态查询附带时间戳，并明确禁止 axios/浏览器复用缓存响应。
  params: { task_id: taskId, _: Date.now() },
  headers: { "Cache-Control": "no-cache" },
});

export const startRealtimeTask = (taskId = "yidong_realtime", options = {}) => request({
  method: "POST",
  url: "realtime_tasks/start/",
  params: { task_id: taskId, ...options },
  data: {},
});

export const stopRealtimeTask = (taskId = "yidong_realtime") => request({
  method: "POST",
  url: "realtime_tasks/stop/",
  params: { task_id: taskId },
  data: {},
});

export const runRealtimeTaskOnce = (taskId = "yidong_realtime", options = {}) => request({
  method: "POST",
  url: "realtime_tasks/run_once/",
  params: { task_id: taskId, ...options },
  data: {},
});
