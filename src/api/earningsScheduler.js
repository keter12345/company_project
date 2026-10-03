import request from "../utils/request";

export const getEarningsSchedulerStatus = () => request({
  method: "GET",
  url: "/earnings_scheduler/status/",
});

export const startEarningsScheduler = (time) => request({
  method: "POST",
  url: "/earnings_scheduler/start/",
  params: { time },
  data: {},
});

export const stopEarningsScheduler = () => request({
  method: "POST",
  url: "/earnings_scheduler/stop/",
  data: {},
});

export const updateEarningsSchedulerTime = (time) => request({
  method: "POST",
  url: "/earnings_scheduler/update_time/",
  params: { time },
  data: {},
});

export const runEarningsSchedulerOnce = () => request({
  method: "POST",
  url: "/earnings_scheduler/run_once/",
  data: {},
});

export const getNoticeFetchSchedulerStatus = () => request({
  method: "GET",
  url: "/notice_fetch_scheduler/status/",
});

export const startNoticeFetchScheduler = (times) => request({
  method: "POST",
  url: "/notice_fetch_scheduler/start/",
  params: { times: Array.isArray(times) ? times.join(",") : times },
  data: {},
});

export const stopNoticeFetchScheduler = () => request({
  method: "POST",
  url: "/notice_fetch_scheduler/stop/",
  data: {},
});

export const updateNoticeFetchSchedulerTime = (times) => request({
  method: "POST",
  url: "/notice_fetch_scheduler/update_time/",
  params: { times: Array.isArray(times) ? times.join(",") : times },
  data: {},
});

export const runNoticeFetchSchedulerOnce = (params = {}) => request({
  method: "POST",
  url: "/notice_fetch_scheduler/run_once/",
  params,
  data: {},
});

export const getDailyCloseContextSchedulerStatus = () => request({
  method: "GET",
  url: "/daily_close_context_scheduler/status/",
});

export const startDailyCloseContextScheduler = (time) => request({
  method: "POST",
  url: "/daily_close_context_scheduler/start/",
  params: { time },
  data: {},
});

export const stopDailyCloseContextScheduler = () => request({
  method: "POST",
  url: "/daily_close_context_scheduler/stop/",
  data: {},
});

export const updateDailyCloseContextSchedulerTime = (time) => request({
  method: "POST",
  url: "/daily_close_context_scheduler/update_time/",
  params: { time },
  data: {},
});

export const runDailyCloseContextSchedulerOnce = (params = {}) => request({
  method: "POST",
  url: "/daily_close_context_scheduler/run_once/",
  params,
  data: {},
});

export const getPretradeWatchlistSchedulerStatus = () => request({
  method: "GET",
  url: "/pretrade_watchlist_scheduler/status/",
});

export const startPretradeWatchlistScheduler = (time) => request({
  method: "POST",
  url: "/pretrade_watchlist_scheduler/start/",
  params: { time },
  data: {},
});

export const stopPretradeWatchlistScheduler = () => request({
  method: "POST",
  url: "/pretrade_watchlist_scheduler/stop/",
  data: {},
});

export const updatePretradeWatchlistSchedulerTime = (time) => request({
  method: "POST",
  url: "/pretrade_watchlist_scheduler/update_time/",
  params: { time },
  data: {},
});

export const runPretradeWatchlistSchedulerOnce = (params = {}) => request({
  method: "POST",
  url: "/pretrade_watchlist_scheduler/run_once/",
  params,
  data: {},
});

export const getHistoricalTestDataPrepareStatus = () => request({
  method: "GET",
  url: "/api/historical_test_data_prepare/status/",
});

export const checkHistoricalTestData = (replayDate) => request({
  method: "GET",
  url: "/api/historical_test_data_prepare/check/",
  params: { replay_date: replayDate },
});

export const runHistoricalTestDataPrepare = (replayDate, force = false) => request({
  method: "POST",
  url: "/api/historical_test_data_prepare/run/",
  params: { replay_date: replayDate, force: force ? 1 : 0 },
  data: {},
  // 首次补齐需要生成上下文和候选池，实测可超过 3 分钟；不能使用全局 10 秒超时。
  timeout: 600000,
});
