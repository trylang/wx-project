// const productUrl = 'https://appsmall.rtmap.com/';
// const devUrl = 'https://wx-mini.rtmap.com/';
// const testUrl = 'https://wx-mini.rtmap.com/';
import {
    config
} from "../../utils/config.js";
const app = getApp();
const isDebug = true

var url = config.BaseUrl;

const requestEndPoints = {
    login: 'mini-apps/front/login', //手机号登录
    myCarList: 'app-park/parkingCar/list', // 我的车辆列表接口
    addMyCar: 'app-park/parkingCar', // 添加我的车辆接口
    deleteMyCar: 'app-park/parkingCar/del', //删除我的车辆接口
    parkingRule: 'app-park/parkingFeeRule/app/', // appId获取停车缴费说明接口
    carDetailByNumber: 'app-park/parkingFee/getDetailByCarNumber', // 根据车牌号查询缴费信息接口
    getScoreDeductible: 'app-park/parkingFeeRule/getScoreDeductible', //获取积分抵扣接口
    parkFreeList: 'app-park/parkingFee/list', // 缴费记录列表接口
    parkFreeDetail: 'app-park/parkingFee/', // 查询缴费记录详情接口
    payParkFree: 'app-park/payParkingFee', // 发起微信支付接口
    getSurplusPark: 'app-park/parkingFee/getSurplusPark', // 查询空余停车位
    getScore: 'wxapp-root/api/v1/score/account',//获取用户积分
};

// { endPoint, success, fail , data}
function logRequest(requestData) {
    if (isDebug) {
        console.log('请求地址', requestData.endPoint, '请求参数', requestData.data)
    }
}

function httpWithParameter(requestData) {
    // logRequest(requestData)
    wx.Request({
        url: url + requestData.endPoint,
        data: requestData.data,
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
            "Content-Type": "application/json"
        }, // 设置请求的 header
        success: requestData.success,
        fail: requestData.fail,
        complete: requestData.complete
    })
}

function postRequestWithParameter(requestData) {
    // logRequest(requestData);
    wx.Request({
        url: url + requestData.endPoint,
        data: requestData.data,
        method: requestData.method || 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {
            "Content-Type": "application/json"
        }, // 设置请求的 header
        success: requestData.success,
        fail: requestData.fail
    })
}

module.exports = {
    httpWithParameter,
    requestEndPoints,
    postRequestWithParameter
}