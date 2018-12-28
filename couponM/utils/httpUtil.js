import {config} from "../../utils/config.js"

const isDebug = true

var url = config.BaseUrl;

//endPoints
const requestEndPoints = {
    industry: 'coupon-mall/common/industry/list', //获取业态列表
    coupons: 'coupon-mall/cmall/product/list', //获取优惠券列表
    couponSubDetail: 'coupon-mall/cmall/product/combined/subproduct/detail', //获取组合券子券详情
    qrcodeDetail: 'coupon-mall/cmall/qrcode/detail', // 券码详情
    orderDetail: 'coupon-mall/cmall/order/detail', // 订单详情
    productDetail: 'coupon-mall/cmall/product/detail',
    shops: 'coupon-mall/cmall/shop/list', //获取优惠券适用店铺
    collageList: 'coupon-mall/cmall/product/groupbuying/list', //拼团列表
    getQR: url + 'coupon-mall/cmall/coupon/cashback/myqrcode', //获取小程序二维码
    cardBag: 'coupon-mall/cmall/cardbag/list', //卡包
    buyCoupon:'coupon-mall/cmall/coupon/buy',//购买券
    loginCoupon:'coupon-mall/cmall/login',
    qrcode:'coupon-mall/cmall/qrcode/detail',//券码详情
};

// { endPoint, success, fail , data}
function logRequest(requestData) {
    if (isDebug) {
        console.log('请求地址', requestData.endPoint, '请求参数', requestData.data)
    }
}

function toastError(msg) {
    wx.showToast({
        title: msg,
        icon: 'none',
        image: '/images/bawang/icon-error.png',
        duration: 2000,
        mask: true
    })
}

function httpWithParameter(requestData) {
    logRequest(requestData)
    wx.showLoading({
        title: '加载中...',
        mask: true,
    })
    wx.Request({
        url: url + requestData.endPoint,
        data: requestData.data,
        method: 'GET',
        header: {
            "Content-Type": "application/json"
        },
        success: (res) => {
          wx.hideLoading();
            res.statusCode != 200 ? toastError('服务器维护中') : res.data.status == 200 ? requestData.success(res) : toastError(res.data.message)
        },
        fail: (res) => {
            if (res.data&&res.data.message){
                toastError(res.data.message)
            }
            requestData.fail(res)
        }
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
        success: (res) => {
          wx.hideLoading();
            res.data.status == 200 ? requestData.success(res) : toastError(res.data.message)
        },
        fail: (res) => {
            requestData.fail(res)
        },
        complete: (res) => {
            res.statusCode != 200 && toastError('服务器维护中')
        }
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
    uploadFile: uploadFile,
    toastError: toastError,
}