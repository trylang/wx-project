import { config } from '../../../utils/config.js'
const productUrl = 'https://appsmall.rtmap.com/';
const testUrl = 'http://wx-mini.rtmap.com/';
const isDebug = true

var url = config.BaseUrl;

//endPoints
const requestEndPoints = {
    activityInfo: 'wxapp-turnboard/c/board/activity/info', //获取活动
    rafflingTimes: 'wxapp-turnboard/c/board/raffling/times', //我的抽奖次数
    boardPlay: 'wxapp-turnboard/c/board/play',//转盘抽奖
    basicInfo: 'wxapp-turnboard/c/board/basic/info',//获取配置信息
    basicAllInfo: 'wxapp-turnboard/c/board/all/info',//获取配置信息-产品列表
    actorCount: 'wxapp-turnboard/c/board/actor/count',//参与人数
    winnerList: 'wxapp-turnboard/c/board/winner/list',//中奖人数据
    prizeList: 'wxapp-turnboard/c/board/prize/list',//我的奖品
    shareBack: 'wxapp-turnboard/c/board/share/back',//分享兑换次数
    shareRead: 'wxapp-turnboard/c/board/share/read',//分享打开后获取次数
    integralChange: 'wxapp-turnboard/c/board/integral/exchange',//积分兑换次数
    ruleList: 'wxapp-turnboard/c/board/integral/exchange/info',//积分兑换规则
    getSecret: 'wxapp-turnboard/c/board/share/secret/get',//获取分享密钥
    userRegister: 'wxapp-turnboard/c/board/user/register',//注册赠次数
};

// { endPoint, success, fail , data}
function logRequest(requestData) {
    if (isDebug) {
        console.log('请求地址', requestData.endPoint, '请求参数', requestData.data)
    }
}

function httpWithParameter(requestData) {
    logRequest(requestData)
    wx.Request({
        url: url + requestData.endPoint,
        data: requestData.data,
        method: 'GET',
        header: {
            "Content-Type": "application/json"
        },
        success: requestData.success,
        fail: requestData.fail,
        complete: requestData.complete
    })
}

function postRequestWithParameter(requestData) {
    logRequest(requestData)
    wx.Request({
        url: url + requestData.endPoint,
        data: requestData.data,
        method: 'POST',
        header: {
            "Content-Type": "application/json"
        },
        success: requestData.success,
        fail: requestData.fail
    })
}

function deleteRequestWithParameter(requestData) {
    logRequest(requestData)
    wx.Request({
        url: url + requestData.endPoint,
        data: requestData.data,
        method: 'DELETE',
        header: {
            "Content-Type": "application/json"
        },
        success: requestData.success,
        fail: requestData.fail
    })
}

function putRequestWithParameter(requestData) {
    logRequest(requestData)
    wx.Request({
        url: url + requestData.endPoint,
        data: requestData.data,
        method: 'PUT',
        header: {
            "Content-Type": "application/json"
        },
        success: requestData.success,
        fail: requestData.fail
    })
}

function uploadFile(requestData) {
    wx.uploadFile({
        url: url + requestEndPoints.uploadFile,
        filePath: requestData.filePath,
        name: requestData.fileName,
        success: requestData.success,
        fail: requestData.fail
    })
}

module.exports = {
    httpWithParameter: httpWithParameter,
    postRequestWithParameter: postRequestWithParameter,
    deleteRequestWithParameter: deleteRequestWithParameter,
    requestEndPoints: requestEndPoints,
    uploadFile: uploadFile
}
