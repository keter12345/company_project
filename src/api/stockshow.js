import request from "../utils/request";

// 获取主板展示数据
export const getStockShownewZb = (params) =>
  request.get("stockShowZb/", { params });

// 获取创业板展示数据
export const getStockShownewCk = (params) =>
  request.get("stockShowCk/", { params });

// 获取新版 gugudate 股票提示结果（正式或测试）
export const getGpfxAlertResults = (params) =>
  request.get("gpfx/alert-results/", { params });

// 鼠标停在提示列表的股票代码或名称上时才按需读取详情，不参与列表每两秒刷新。
export const getGpfxAlertStockHover = (params) =>
  request.get("gpfx/alert-results/stock-hover/", { params });

// 股票监控主档：全局普通/重要状态，以及行业、概念中的普通/重要/龙头等级。
export const getGpfxStockMonitor = (params) =>
  request.get("gpfx/stock-monitor/", { params });

export const getGpfxStockMonitorDetail = (params) =>
  request.get("gpfx/stock-monitor/detail/", { params });

export const updateGpfxStockMonitor = (params) =>
  request.post("gpfx/stock-monitor/update/", params);

export const updateGpfxStockMonitorRelation = (params) =>
  request.post("gpfx/stock-monitor/relation/update/", params);

// 获取 gpfx 增减持监控列表
export const getGpfxIncreaseDecreaseWatchlist = (params) =>
  request.get("gpfx/increase-decrease-watchlist/", { params });

// 获取 gpfx 股票异动列表
export const getGpfxYidongStocks = (params) =>
  request.get("gpfx/yidong-stocks/", { params });

// 获取 gpfx 单股 6 个月异动明细
export const getGpfxYidongDetail = (params) =>
  request.get("gpfx/yidong-detail/", { params });

// 获取 gpfx 实时异动监控
export const getGpfxYidongMonitor = (params) =>
  request.get("gpfx/yidong-monitor/", { params });

// 获取 gpfx 异动概念列表
export const getGpfxYidongConcepts = (params) =>
  request.get("gpfx/yidong-concepts/", { params });

// 获取 gpfx 异动概念下股票明细
export const getGpfxYidongConceptDetail = (params) =>
  request.get("gpfx/yidong-concept-detail/", { params });

// 获取 gpfx 异动人工维护列表
export const getGpfxYidongManageList = (params) =>
  request.get("gpfx/yidong-manage/", { params });

// 保存 gpfx 异动人工配置
export const updateGpfxYidongManage = (params) =>
  request.get("gpfx/yidong-manage/update/", { params });

// 合并 gpfx 异动名称
export const mergeGpfxYidongManageNames = (params) =>
  request.get("gpfx/yidong-manage/merge/", { params });

// 获取 gpfx 异动关联股票维护列表
export const getGpfxYidongManageStocks = (params) =>
  request.get("gpfx/yidong-manage/stocks/", { params });

// 保存 gpfx 异动关联股票龙头配置
export const updateGpfxYidongManageStock = (params) =>
  request.get("gpfx/yidong-manage/stocks/update/", { params });

// 获取 gpfx 前一日晚重点监控表
export const getGpfxPretradeWatchlist = (params) =>
  request.get("gpfx/pretrade-watchlist/", { params });

// 手工重建 gpfx 前一日晚重点监控表
export const refreshGpfxPretradeWatchlist = (params) =>
  request.get("gpfx/pretrade-watchlist/refresh/", { params });

// 获取 gpfx 历史记录上下文
export const getGpfxHistoryRecords = (params) =>
  request.get("gpfx/history/records/data/", { params });

// 获取 gpfx 股票历史详情：关联概念历史和异动信息
export const getGpfxHistoryStockDetail = (params) =>
  request.get("gpfx/history/stock-detail/", { params });

// 获取 gpfx 持仓记录
export const getGpfxPositions = (params) =>
  request.get("gpfx/positions/", { params });

// 新增 gpfx 持仓记录
export const addGpfxPosition = (params) =>
  request.get("gpfx/positions/add/", { params });

// 更新 gpfx 持仓记录
export const updateGpfxPosition = (params) =>
  request.get("gpfx/positions/update/", { params });

// 删除 gpfx 持仓记录
export const deleteGpfxPosition = (params) =>
  request.get("gpfx/positions/delete/", { params });

// 获取 gpfx 持仓卖出监控
export const getGpfxPositionSellSignals = (params) =>
  request.get("gpfx/positions/sell-signals/", { params });

// 获取 gpfx 卖出规则说明
export const getGpfxSellRuleSchema = (params) =>
  request.get("gpfx/sell-rule-schema/", { params });

// 获取 gpfx 规则开关列表
export const getGpfxRules = (params) =>
  request.get("gpfx/rules/", { params });

// 开关 gpfx 规则
export const toggleGpfxRule = (params) =>
  request.get("gpfx/rules/toggle/", { params });

// 更新 gpfx 规则
export const updateGpfxRule = (params) =>
  request.get("gpfx/rules/update/", { params });

// 获取提示时段和时段下的规则配置
export const getGpfxAlertSchedule = (params) =>
  request.get("gpfx/alert-schedule/", { params });

// 保存提示时段
export const updateGpfxAlertTimeSlot = (params) =>
  request.get("gpfx/alert-schedule/slots/update/", { params });

// 保存规则在指定提示时段中的配置
export const updateGpfxAlertRuleBinding = (params) =>
  request.get("gpfx/alert-schedule/bindings/update/", { params });

// 获取实时涨跌停状态
export const getPriceLimitState = (params) =>
  request.get("price-limit/state/", { params });

// 获取实时异动原因分析
export const getStockAnomalyAnalysis = (params) =>
  request.get("stock/anomaly-analysis/", { params });

// 获取实时异动分析页的行业/概念筛选项
export const getStockAnomalySectorFilters = () =>
  request.get("stock/anomaly-analysis/sector-filters/");

// 归档实时涨跌停状态
export const archivePriceLimitState = (params) =>
  request.get("price-limit/archive/", { params });


// 获取 gpfx 通用排除表
export const getGpfxExclusions = (params) =>
  request.get("gpfx/exclusions/", { params });

// 新增/覆盖 gpfx 排除项
export const addGpfxExclusion = (params) =>
  request.get("gpfx/exclusions/add/", { params });

// 更新 gpfx 排除项
export const updateGpfxExclusion = (params) =>
  request.get("gpfx/exclusions/update/", { params });

// 删除 gpfx 排除项
export const deleteGpfxExclusion = (params) =>
  request.get("gpfx/exclusions/delete/", { params });

// 批量启用/停用 gpfx 排除项
export const batchToggleGpfxExclusions = (params) =>
  request.get("gpfx/exclusions/batch_toggle/", { params });
