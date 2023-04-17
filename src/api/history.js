import request from "../utils/request";
export const getHistory = (data, countnum) => request({
    method: "GET",
    url: `stockshow_history/?rd_datetime=${data}&countnum=${countnum}`
})