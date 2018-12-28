import {config} from '../../../utils/config.js'
// const productUrl = 'https://appsmall.rtmap.com/';
const productUrl = 'http:// 10.10.10.230:8708/';
const devUrl = 'https://wx-mini.rtmap.com/';
const testUrl = 'http://wx-mini.rtmap.com/';
//devUrl="http://123.57.208.31:8100"
const isDebug = true
import Token from "./sign.js";

//小程序算法
let openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
let cid = wx.getStorageSync('member').cid ? wx.getStorageSync('member').cid : '';
let tenantId = config.tenantId;// token里面的tenantId
let token = (new Token(tenantId, cid, openid))

var url = config.BaseUrl;

//endPoints
const requestEndPoints = {
  industry: 'coupon-mall/common/industry/list', //获取业态列表
  coupons: 'coupon-mall/cmall/product/list', //获取优惠券列表
    // couponDetail: 'mini-apps/front/coupon/detail', //获取优惠券详情
    // 
    // bannerList: 'mini-apps/front/bannerList', //查询banner列表
    // preOrder: 'mini-apps/front/coupon/buy', //预付订单
   
    // getUserInfo: 'mini-apps/front/user', //获取用户信息
    //getQrcode: 'mini-apps/front/coupon/qrcode', //使用订单号查询二维码
    // getOrderList: 'mini-apps/front/order/list', //订单列表
    // refundlist: 'mini-apps/front/order/refund/list', //退款订单列表
    // getTime:'mini-apps/front/coupon/skill/time',//获取服务器时间

    //getKillList:'mini-apps/front/coupon/skill/list',//获取秒杀列表
    //secKill:'mini-apps/front/coupon/skill',//秒杀
    getTime: 'wxapp-seckill/api/c/site/getTime',//获取服务器时间
    getIndexKillList: 'wxapp-seckill/api/c/coupon/index',//获取秒杀列表
    getPreInfo: 'wxapp-seckill/api/c/pay/getPreInfo', //获取预支付信息(秒杀)
    memberHandbook: 'cmp/memberHandbook',//获取会员手册接口
    memberRight: 'cmp/memberRight/app/list',//获取会员权益列表接口
    decodeUserInfo: 'wxapp-root/wxlogin/front/wx_lite/decodeUserInfo', //解密用户信息
    getSession: 'wxapp-root/wxlogin/front/wx_lite/getsession', //获取openid
    //login: 'mini-apps/front/login', //手机号登录
    // getUserInfo: 'mini-apps/front/user', //获取用户信息
    // getCouponList: 'mini-apps/mycardbag/cardbag', //我的卡包
    // getCouponCount: 'mini-apps/mycardbag/couponcount', //获取券数量
    // qrcodedetail: 'mini-apps/mycardbag/qrcodedetail', //券码详情
    // getQrcode: 'mini-apps/front/coupon/qrcode', //使用订单号查询二维码
    // getOrderList: 'mini-apps/front/order/list', //订单列表
    // publicOrderList: 'mini-apps/front/order/public/list', //订单列表（公共）refund
    // publicRefundList: 'mini-apps/front/order/public/refund/list', //订单列表退款（公共）
    // refundlist: 'mini-apps/front/order/refund/list', //退款订单列表
    // payorder: 'mini-apps/front/coupon/repay', //未支付订单支付
    // orderDetail: 'mini-apps/front/order/detail', //订单详情
    // refund: 'mini-apps//font/refund//preorder', //退款
    // orderClose: 'mini-apps/front/order/close', //取消订单
    // uploadFile: 'mini-apps/admin/file/upload', //上传文件
    // feedback: 'mini-apps/front/feedback', //反馈s
    login: 'coupon-mall/cmall/login', //手机号登录
    getCouponList: 'coupon-mall/cmall/cardbag/list', //我的卡包    
    orderDetail: 'coupon-mall/cmall/order/detail', //订单详情
    orderGroupDetail: 'coupon-mall/cmall/product/groupbuying/order/detail', // 拼团订单-团详情
    refund: 'coupon-mall/cmall/coupon/refund', //退款
    orderClose: 'coupon-mall/cmall/order/cancel', //取消订单
    payorder: 'coupon-mall/cmall/coupon/pay', //未支付订单支付
    qrcodedetail: 'coupon-mall/cmall/qrcode/detail', //券码详情
    getCouponCount: 'coupon-mall/cmall/cardbag/count', //获取券数量
    shops: 'coupon-mall/cmall/shop/list', //获取优惠券适用店铺
    publicOrderList: 'coupon-mall/cmall/order/public/list', //订单列表（公共）refund
    publicRefundList: 'coupon-mall/cmall/order/public/refund/list', //订单列表退款（公共）
    groupoOrderList: 'coupon-mall/cmall/order/groupobuying/list', //拼团订单
    bonusAddup: 'coupon-mall/cmall/coupon/cashback/total',//返现金额累计
    returnMoneyList: 'coupon-mall/cmall/coupon/cashback/list',//返现记录
    feedback: 'coupon-mall/cmall/feedback',//反馈
    uploadFile: 'coupon-mall/common/file/upload', //上传文件
    feedback: 'mini-apps/front/feedback', //反馈

    changebirthday:'weimao-new-project/memberApp/birthday/update',

    industryList: 'wxapp-integral/common/industry/list', //积分商城_业态列表
    couponList: 'wxapp-integral/front/index/coupon/list',  //积分商城-券列表
    integralNum: 'wxapp-integral/front/index/userIntegral', //积分商城-用户积分
    historyList: 'wxapp-integral/front/index/user/order/list', //积分商城-兑换记录
    detailInfo: 'wxapp-integral/front/index/coupon/detail', //积分商城-券详情
    collectionList: 'wxapp-integral/front/index/user/collection/list',  //积分商城-收藏列表
    collection: 'wxapp-integral/front/index/collection',    //积分商城-收藏，取消收藏
    isCollection: 'wxapp-integral/front/index/user/isCollection', //积分商城-该用户是否已收藏
    cardInfo: 'wxapp-integral/front/index/user/card/info',  //积分商城-用户卡等级详情
    buyCoupon: 'wxapp-integral/front/index/buy',        //积分商城-购买券
    sealRules: `wxapp-seal/points/getRulesByTenantId/`, //电子章积分规则
    sealShops: `wxapp-seal/points/getStoreByTenantId/`,//电子章积分店铺
    sealChage: 'wxapp-seal/points/exchange', //换积分接口
    writeOffseal: 'wxapp-seal/sealAdmin/selectInfo',//核销接口
    sealDetail: 'wxapp-seal/sealAuth/get', //获取SDK的appid和licenseld
    checkSealInfo: 'wxapp-seal/sealAuth/checkCoupon', //根据券码判断是否可用印章
    scanCoupon: 'wxapp-scan-coupon/front/activity/setting', // 扫码领券获取活动设置
    getCoupon: 'wxapp-scan-coupon/front/coupon/get', // 扫码领券
    getScanCouponList: 'wxapp-scan-coupon/front/coupon/my', // 扫码领券列表
    validateDate: 'wxapp-scan-coupon/front/activity/validate', // 验证扫码变码接口
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
            "Content-Type": "application/json",
          token: token.getToken()
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
          "Content-Type": "application/json",
          token: token.getToken()
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
          "Content-Type": "application/json",
          token: token.getToken()
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
          "Content-Type": "application/json",
          token: token.getToken()
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
