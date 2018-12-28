import { config } from "../../../utils/config.js"
const app = getApp();
const isDebug = true

var url = config.BaseUrl;

//endPoints
const requestEndPoints = {
  industry: 'coupon-mall/common/industry/list', //获取业态列表
  coupons: 'coupon-mall/cmall/product/list', //获取优惠券列表
  couponDetail: 'coupon-mall/cmall/product/detail', //获取优惠券详情
  shops: 'coupon-mall/cmall/shop/list', //获取优惠券适用店铺
  groupbuyList: 'coupon-mall/cmall/product/groupbuying/list', //拼团列表
  couponBuy: 'coupon-mall/cmall/coupon/buy', //拼团下单
  groupDetail: 'coupon-mall/cmall/product/groupbuying/detail',//拼团详情
  myGroupDetail: 'coupon-mall/cmall/product/groupbuying/mygroup/detail',//我的拼团详情
  bannerList: 'mini-apps/front/bannerList', //查询banner列表
  preOrder: 'mini-apps/front/coupon/buy', //预付订单
  getPreInfo: 'wxapp-seckill/api/c/pay/getPreInfo', //获取预支付信息(秒杀)
  login: 'mini-apps/front/login', //手机号登录
  getUserInfo: 'mini-apps/front/user', //获取用户信息
  getCouponList: 'mini-apps/mycardbag/cardbag', //我的卡包
  getCouponCount: 'mini-apps/mycardbag/couponcount', //获取券数量
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