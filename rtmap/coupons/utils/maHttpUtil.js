import {config} from '../../../utils/config.js';
// const productUrl = 'https://apiscrm.rtmap.com/scrm-web-opr/';
const productUrl = 'https://appsmall.rtmap.com/wxapp-root/';
const devUrl = 'https://wx-mini.rtmap.com/wxapp-root/';
// const devUrl = 'http://211.157.182.226:8888/rtscrm/scrm-web-opr/';
const testUrl = 'http://demo.rtmap.com:38098/rts_pubdata_server/';

const isDebug = true

var url = productUrl.indexOf(config.BaseUrl) >= 0 ? productUrl : devUrl;

//endPoints
const requestEndPoints = {
    queryMembershipInfo: 'api/v1/customer/info',
    updateMembershipInfo: 'api/v1/customer/member/update',
    membershipCreditsRecords: 'api/v1/score/flow/list',
    membershipCredits: 'api/v1/score/account'
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
        fail: requestData.fail
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