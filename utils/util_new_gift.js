import {config} from "../utils/config.js"
/**
 * 请求封装
 */
const app = getApp();
let devBaseUrl = 'https://backend.rtmap.com'
let prdBaseUrl = config.BaseUrl;//'https://appsmall.rtmap.com'
//let prdBaseUrl = 'https://backend.rtmap.com'

const giftsEndUrl = {
    scoreGetCount:'weimao-new-project/turntableCouponApp/integral',//扣减积分兑换次数
    scoreGetInfo:'weimao-new-project/turntableCouponApp/integralValue',//获取初始多少积分兑换一次转盘，以及兑换上限
    shareRecode:'weimao-new-project/turntableCouponApp/shareNumberOpen',//分享记录接口
    changeChace:'weimao-new-project/turntableCouponApp/xiaochengxutj',//抽奖失败或者成功调用接口
    shareInsert:'weimao-new-project/turntableCouponApp/insertShareGiftCount',//分享+1接口
    controlWinner:'weimao-new-project/turntableCouponApp/turntableWinning',//中奖控制接口
    winnerGetInfo:'weimao-new-project/turntableCouponApp/findCardListByStatus',//查询当前用户中奖情况
    shareGetCount:'weimao-new-project/turntableCouponApp/insertShareGiftCount',//分享赠送次数接口
    selectList:'weimao-new-project/turntableCouponApp/winningDetailsByTurntalbeActivityId',//查询中奖列表
    choujiangPort:'weimao-new-project/turntableCouponApp/choujiang',//转盘抽奖
    getTableTurnInfo:'weimao-new-project/turntableCouponApp/startTurntableActivity',//获取转盘活动信息以及券列表
    getPresentCoupon:'weimao-new-project/donation/getCoupon',//领取转赠的券
    getDonationStatus:'weimao-new-project/donation/queryDonationStatus',//查看转赠券状态
    getGiveShare:'weimao-new-project/donation/share',//转赠获取分享时间点
    checkGiveStatus:'weimao-new-project/donation/queryDonationStatus',//查询转赠状态信息
    getKeyAdmin:'weimao-new-project/keyAdmin',//小程序转化keyAdmin
    getGiftDetail:'weimao-new-project/activityApp/findStartActivity',//新人礼获取活动详情
    getShareIndex:'weimao-new-project/menuFunction/queryShopShare',//首页分享配置
    getFunctionPoint:'weimao-new-project/menuFunction/list/2',//快捷功能入口
    bannerIndex:'weimao-new-project/getBanner',
    getHostPoint:'weimao-new-project/menuFunction/list/3',//运营功能入口
    justifyScore:'weimao-new-project/activityApp/saveJiFen',//会员领取积分
    getSuccInfo:'weimao-new-project/memberApp/award',//新人礼成功详情
    justifyGetSuccInfo:'weimao-new-project/memberApp/queryAwardList',//新人礼成功详情
    sendMessage:'weimao-new-project/memberApp/yanzhengma',//发送短信
    handleLogin:'weimao-new-project/memberApp/findMemberByMobile',//会员登录
    openidChangeMobile:'weimao-new-project/memberApp/findMobileByOpenId',//获取openid
    justifyMember:'weimao-new-project/memberApp/findMemberByMobile',//判断是否可以领取新人礼
    findReceiveByMobile:'weimao-new-project/receive/findReceiveByMobile',//判断是否已经领取过新人礼
    getActivityInfo:'weimao-new-project/activityApp/activityStartList',//获取当前开启的活动
    getCoupon:'weimao-new-project/couponApp/acquireCoupon',//会员领券
    getRegiter:'weimao-new-project/activityApp/saveJiFen'//会员注册
}
function handleRequest(url, params, type='post',successFunction, failFunction, isShowLoading = true) {
    if (isShowLoading) {
        wx.showLoading({
            title: '加载中'
        })
    }
    wx.Request({
        url: prdBaseUrl + url,
        data: params,
        method: type,
        header: {
            'content-type': 'application/json'
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

function handleIndexRequest(url, params, type='post', successFunction, failFunction) {
    wx.showLoading({
      title: '加载中'
    })
    wx.Request({
        url: prdBaseUrl + url,
        data: params,
        method: type,
        header: {
            'content-type': type=='get'?'application/json':'application/x-www-form-urlencoded'
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

function handlePresentRequest(url, params, type='post',successFunction, failFunction, isShowLoading = true) {
    if (isShowLoading) {
        wx.showLoading({
            title: '加载中'
        })
    }
    wx.Request({
        url: prdBaseUrl + url,
        data: params,
        method: type,
        header: {
            'content-type': 'application/json'
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


module.exports = {
  handleRequest: handleRequest,
  giftsEndUrl:giftsEndUrl,
  giftsUrl:prdBaseUrl,
  handlePresentRequest:handlePresentRequest,
  handleIndexRequest:handleIndexRequest
}