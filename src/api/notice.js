// notice.js

import request from "../utils/request";

// 获取所有公告数据
export const getAllNoticeInfo = (searchParams) => request({
    method: 'GET',
    url: '/getAllNotices/',
    params: {
        ts_code: searchParams.ts_code,
        ts_name: searchParams.ts_name,
        title: searchParams.title,
        start_date: searchParams.date_range ? searchParams.date_range[0] : '',
        end_date: searchParams.date_range ? searchParams.date_range[1] : '',
    }
});
// 添加公告
export const addNotice = (data) => request({
    method: 'GET',
    url: '/addNotice/',
    params: data,  // 传递公告添加的数据
});

// 更新公告
export const updateNotice = (id, data) => request({
    method: 'GET',
    url: `/updateNotice/?id=${id}`,
    params: data,  // 更新公告的数据
});

// 删除公告
export const deleteNotice = (id) => request({
    method: 'GET',
    url: `/deleteNotice/?id=${id}`,  // 传递公告ID进行删除
});

// 更新公告的等级
export const updateNoticeLevel = (id, level) => request({
    method: 'GET',
    url: `/updateNoticeLevel/?id=${id}&level=${level}`,  // 更新公告等级
});

// 更新公告的状态
export const updateNoticeStatus = (id, status) => request({
    method: 'GET',
    url: `/updateNoticeStatus/?id=${id}&status=${status}`,  // 更新公告状态
});