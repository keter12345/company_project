// 公告线程相关接口
import { getSchedulerStatus, startScheduler, stopScheduler, runOnceNow } from './stockthread';
import { getAllRtStockZy, addRtStockZy, updateRtStockZy, deleteRtStockZy } from './stockzy';
import { getAllBGList, updateBGLevel, updateItemStatus } from './industry';
import {
  getZbStockInfo,
  getCkStockInfo,
  getAllStockInfo,
  getAllStockHyInfo,
  getAllStockGnInfo,
  getStockReportInfo,
  getStockNoticeInfo
} from './stock';
import { getAllBKGNInfo, updateGNLevel, updateGNItemStatus } from './concept';
import { getHistory } from './history';
import { getStockJS } from './stockjs';
import { getFieldInfoByTablename, updateFieldShow, getAllFieldInfo } from './field';

// 公告部分的 API
import { getAllNoticeInfo, updateNoticeLevel, updateNoticeStatus, addNotice, updateNotice, deleteNotice } from './notice';

export const getAllBGListAPI = getAllBGList;
export const updateBGLevelAPI = updateBGLevel;
export const updateItemStatusAPI = updateItemStatus;

export const getFieldInfoByTablenameAPI = getFieldInfoByTablename;
export const updateFieldShowAPI = updateFieldShow;
export const getAllFieldInfoAPI = getAllFieldInfo;

export const getZbStockInfoAPI = getZbStockInfo;
export const getAllStockHyInfoAPI = getAllStockHyInfo;
export const getAllStockGnInfoAPI = getAllStockGnInfo;
export const getStockReportInfoAPI = getStockReportInfo;
export const getStockNoticeInfoAPI = getStockNoticeInfo;
export const getAllStockInfoAPI = getAllStockInfo;
export const getCkStockInfoAPI = getCkStockInfo;

export const getAllBKGNInfoAPI = getAllBKGNInfo;
export const updateGNLevelAPI = updateGNLevel;
export const updateGNItemStatusAPI = updateGNItemStatus;

export const getHistoryAPI = getHistory;
export const getStockJSAPI = getStockJS;

// 公告部分的 API 导出
export const getAllNoticeInfoAPI = getAllNoticeInfo;
export const updateNoticeLevelAPI = updateNoticeLevel;
export const updateNoticeStatusAPI = updateNoticeStatus;
export const addNoticeAPI = addNotice;
export const updateNoticeAPI = updateNotice;
export const deleteNoticeAPI = deleteNotice;

export const getAllRtStockZyAPI = getAllRtStockZy;
export const addRtStockZyAPI = addRtStockZy;
export const updateRtStockZyAPI = updateRtStockZy;
export const deleteRtStockZyAPI = deleteRtStockZy;

// 公告线程相关接口导出
export const getSchedulerStatusAPI = getSchedulerStatus;
export const startSchedulerAPI = startScheduler;
export const stopSchedulerAPI = stopScheduler;
export const runOnceNowAPI = runOnceNow;
