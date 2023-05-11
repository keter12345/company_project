import { getAllBGList, updateBGLevel, updateItemStatus } from './industry'
import { getZbStockInfo, getCkStockInfo } from './stock'
import { getAllBKGNInfo, updateGNLevel, updateGNItemStatus } from "./concept"
import { getHistory } from "./history"
import { getStockJS } from './stockjs'
import { getFieldInfoByTablename, updateFieldShow, getAllFieldInfo } from "./field"
export const getAllBGListAPI = getAllBGList

export const updateBGLevelAPI = updateBGLevel

export const updateItemStatusAPI = updateItemStatus

export const getFieldInfoByTablenameAPI = getFieldInfoByTablename
export const updateFieldShowAPI = updateFieldShow
export const getAllFieldInfoAPI = getAllFieldInfo

export const getZbStockInfoAPI = getZbStockInfo

export const getCkStockInfoAPI = getCkStockInfo

export const getAllBKGNInfoAPI = getAllBKGNInfo

export const updateGNLevelAPI = updateGNLevel
export const updateGNItemStatusAPI = updateGNItemStatus

export const getHistoryAPI = getHistory

export const getStockJSAPI = getStockJS