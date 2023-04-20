import request from "../utils/request";
export const getStockJS = (satrtDatetime, endDatetime, tablename) => request({
    method: "GET",
    url: `stockJs/?start_timekey=${satrtDatetime}&end_timekey=${endDatetime}&tablename=${tablename}`
})