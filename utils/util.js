const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
import {config} from "./config.js"
import Token from "../rtmap/coupons/utils/sign.js";

//小程序算法
let openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
let cid = wx.getStorageSync('member').cid ? wx.getStorageSync('member').cid : '';
let tenantId = config.tenantId;// token里面的tenantId
let token = (new Token(tenantId, cid, openid))

const app = getApp();
let devBaseUrl = 'https://backend.rtmap.com'
// let prdBaseUrl = 'https://memo.rtmap.com'
// let memUrl = 'https://mem.rtmap.com' 
// let memoUrl = 'https://memo.rtmap.com'
let memoUrl = 'https://appsmall.rtmap.com'
// let memoUrl = 'https://wx-mini.rtmap.com/'  
// let couponUrl ='https://coupon.rtmap.com'
let appsmallUrl = 'https://appsmall.rtmap.com'
// let appsmallUrl = 'https://wx-mini.rtmap.com/'
const portsEndUrl = {
    queryPoisForMine:'/wxapp-root/mappoi/queryPoisForMine',//获取店铺
    receiptWechatMiniProgram:'/wxapp-root/IntegralMakeup/receiptWechatMiniProgram',//拍照积分from提交
    brandCoupon:'/wxapp-root/api/developer/coupon/batch/under/shop/activity/list',//品牌导览优惠劵接口
    payFree:'/wxapp-root/actionweb/finishpay',//免费和积分的支付接口
    // payMoney:'/wxapp-root/actionweb/pay',//支付接口 没调此接口
    getOrderInfo:'/wxapp-root/actionweb/selectOrderById',//获取订单详情
    getBuilding:'/wxapp-root/build/querybuilds',//获取keyadmin下面的通用建筑物
    getActivityList:'/wxapp-root/actionweb/queryActions',//活动报名系列之获取活动列表
    getActivityDetail:'/wxapp-root/actionweb/selectById',//获取活动信息
    getActivityAvatar:'/wxapp-root/actionweb/queryordersByAction',//获取订单头像
    getTicketNum:'/wxapp-root/actionweb/queryYpForMa5',//获取活动余票
    userComment:'/wxapp-root/commentweb/saveComment',//用户评论
    getStoreList:'/wxapp-root/actionweb/queryStoreActions',//收藏活动列表
    getOrderList:'/wxapp-root/actionweb/queryorders',//获取活动订单
    getCommentList:'/wxapp-root/commentweb/queryCommentByAction',//获取已通过评论列表
    handleSaveActivity:'/wxapp-root/actionweb/storeaction',//活动收藏
    handleGoodActivity:'/wxapp-root/actionweb/goodaction',//活动点赞
    saveOrder:'/wxapp-root/actionweb/saveOrderForMa5',//活动报名
    getDateyp:'/wxapp-root/actionweb/queryYpForDate',//活动报名
    getActivityId:'/coupon-mall/common/market/activity/list',//获取活动id
    getActivityInfo: '/coupon-mall/cmall/coupon/product/info',//反查productId
    getRecordList:'/wxapp-root/IntegralMakeup/recordList',//老版拍照积分记录
    getQueryActionsByPoiId: '/wxapp-root/actionweb/queryActionsByPoiId',//品牌导览
    getQueryRecPois: '/wxapp-root/mappoiweb/queryRecPois',//品牌导览
    getQueryPois: '/wxapp-root/mappoiweb/queryPois',//品牌导览
    getQueryClass: '/wxapp-root/mappoiweb/queryClass',//获取业态
    getQueryFloors: '/wxapp-root/mappoi/queryFloors',//获取楼层
    getQueryPoi_detail_only: '/wxapp-root/mappoiweb/queryPoi_detail_only',//品牌导览
    getUpload:'wxapp-bill-integral/c/bill/upload',//新版拍照积分
    getList: 'wxapp-bill-integral/common/bill/store/list',//新版拍照积分
    getRule: 'wxapp-bill-integral/c/bill/rule',//新版拍照积分
}
/**
 * 请求封装GET
 */
function handleRequest(url, params, type='post', successFunction, failFunction) {
    wx.showLoading({
      title: '加载中'
    })
    wx.Request({
        url: memoUrl + url,
        data: params,
        method: type,
        header: {
            'content-type': type=='get'?'application/json':'application/x-www-form-urlencoded',
            token: token.getToken()
        },
        success: function (res) {
            wx.hideLoading()
            if (typeof successFunction == "function") {
                successFunction(res);
            }
        },
        fail: function (res) {
            wx.hideLoading()
            if (typeof failFunction == "function") {
                failFunction(res);
            }
        }
    })
}

/**
 * 请求封装GET
 */
function memoRequest(url, params, type='post', successFunction, failFunction,isShow=true) {
    if (isShow)
    wx.showLoading({
      title: '加载中'
    })
    wx.Request({
        url: memoUrl + url,
        data: params,
        method: type,
        header: {
            'content-type': type=='get'?'application/json':'application/x-www-form-urlencoded',
          token: token.getToken()
        },
        success: function (res) {
            if (isShow)
            wx.hideLoading()
            if (typeof successFunction == "function") {
                successFunction(res);
            }
        },
        fail: function (res) {
            if (isShow)
            wx.hideLoading()
            if (typeof failFunction == "function") {
                failFunction(res);
            }
        }
    })
}

/**
 * 请求封装GET
 */
function localityRequest(url, params, type='post', successFunction, failFunction) {
    wx.showLoading({
      title: '加载中'
    })
    wx.Request({
        url: appsmallUrl + url,
        data: params,
        method: type,
        header: {
            'content-type': type=='get'?'application/json':'application/json',
          token: token.getToken()
        },
        success: function (res) {
            wx.hideLoading()
            if (typeof successFunction == "function") {
                successFunction(res);
            }
        },
        fail: function (res) {
            wx.hideLoading()
            if (typeof failFunction == "function") {
                failFunction(res);
            }
        }
    })
}

/*小程序portalId换取 keyAdmin*/
function getKeyAdmin(){
  handleRequest('')
}

module.exports = {
  formatTime: formatTime,
  handleRequest: handleRequest,
  memoRequest: memoRequest,
  portsEndUrl:portsEndUrl,
  localityRequest:localityRequest,
//   memUrl:memUrl,
  memoUrl:memoUrl,
//   couponUrl:couponUrl,
  devBaseUrl:devBaseUrl
}
