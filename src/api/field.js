import request from "../utils/request";
export const getFieldInfoByTablename = (tablename) => request({
    method: "GET",
    url: `getSysShow/?tablename=${tablename}`
})
export const updateFieldShow = (ids, tablename) => request({
    method: "GET",
    url: `updateSysshow/?ids=${ids}&tablename=${tablename}`
})
export const getAllFieldInfo = () => request({
    method: "GET",
    url: "getAllSysShow/"
})