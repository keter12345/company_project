import request from "../utils/request";

/**
 * 获取历史行情数据计算结果（支持股票代码、股票名称、概念板块、行业板块查询）
 * @param {Object} searchParams - 查询参数对象
 * @param {String} searchParams.ts_code - 股票代码
 * @param {String} searchParams.ts_name - 股票名称
 * @param {Array} searchParams.gn_bk_codes - 概念板块编码数组
 * @param {Array} searchParams.hy_bk_codes - 行业板块编码数组
 * @param {Number} searchParams.page - 当前页码
 * @param {Number} searchParams.page_size - 每页记录数
 * @returns {Promise} 返回Promise对象，包含符合条件的行情计算数据
 */
export const getStockJS = (searchParams) => request({
    method: 'GET',
    url: 'stockJs/',
    params: {
        ts_code: searchParams.ts_code,
        ts_name: searchParams.ts_name,
        gn_bk_codes: searchParams.gn_bk_codes,
        hy_bk_codes: searchParams.hy_bk_codes,
        page: searchParams.page,
        page_size: searchParams.page_size
    }
});

/**
 * 获取所有概念板块列表
 * @returns {Promise} 返回概念板块列表
 */
export const getAllBkgnList = () => request({
    method: 'GET',
    url: 'getAllBkgnList/'
});

/**
 * 获取所有行业板块列表
 * @returns {Promise} 返回行业板块列表
 */
export const getAllBkhyList = () => request({
    method: 'GET',
    url: 'getAllBkhyList/'
});