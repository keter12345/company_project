import request from "../utils/request";

// ==================== 公告任务线程接口封装 ====================

// 获取公告任务线程状态
export const getSchedulerStatus = () => request({
    method: 'GET',
    url: '/api/scheduler_status/'
});

// 启动公告任务线程
export const startScheduler = () => request({
    method: 'POST',
    url: '/api/start_scheduler/'
});

// 停止公告任务线程
export const stopScheduler = () => request({
    method: 'POST',
    url: '/api/stop_scheduler/'
});

// 立即执行一次公告任务
export const runOnceNow = () => request({
    method: 'POST',
    url: '/api/run_once/'
});