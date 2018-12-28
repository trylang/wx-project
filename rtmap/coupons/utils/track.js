const url = 'https://event-tracking.rtmap.com/bigdata/v1.0/event-tracking/c/et.gif';

const pageIds = {
    "pages/index/index": {
        pid: "001",
        name: '首页',
        prid: '1001'
    },
    "pages/brand/index/index": {
        pid: "002",
        name: '品牌导览',
        prid: '1004'
    },
    "pages/login/login": {
        pid: "040",
        name: '登陆注册',
        prid: '1019'
    },
    "pages/brand/search/index": {
        pid: "003",
        name: '品牌导览店铺搜索',
        prid: '1004'
    },
    "pages/brand/details/index": {
        pid: "004",
        name: '品牌导览详情页',
        prid: '1004'
    },
    "pages/photo-new/index/index": {
        pid: "005",
        name: "拍照积分",
        prid: '1043'
    },
    "pages/photo-new/record/index": {
        pid: "006",
        name: "积分记录",
        prid: '1044'
    },
    "rtmap/sign/sign": {
        pid: "007",
        name: "每日签到",
        prid: '1003'
    },
    "rtmap/coupons/pages/couponDetail/couponDetail": {
        pid: "008",
        name: '组合券详情',
        prid: '1011'
    },
    "rtmap/coupons/pages/shopsList/shopsList": {
        pid: "009",
        name: '商铺列表',
        prid: '1011'
    },
    "rtmap/coupons/pages/orderDetail/orderDetail": {
        pid: "010",
        name: '订单详情',
        prid: '1011'
    },
    "rtmap/coupons/pages/couponInfo/couponInfo": {
        pid: "011",
        name: '优惠券详情 核销二维码',
        prid: '1011'
    },
    "rtmap/coupons/pages/mybonus/mybonus": {
        pid: "012",
        name: '我的奖金',
        prid: '1030'
    },
    "rtmap/coupons/pages/webView/webView": {
        pid: "013",
        name: '网页展示',
        prid: '1011'
    },
    "rtmap/coupons/pages/mine/mine": {
        pid: "015",
        name: '个人中心',
        prid: '1014'
    },
    "rtmap/coupons/pages/orderlist/orderlist": {
        pid: "016",
        name: '订单列表',
        prid: '1011'
    },
    "rtmap/coupons/pages/couponList/couponList": {
        pid: "017",
        name: '我的优惠券',
        prid: '1011'
    },
    "rtmap/coupons/pages/userInfo/userInfo": {
        pid: "018",
        name: '编辑个人资料',
        prid: '1014'
    },
    "rtmap/coupons/pages/credits/credits": {
        pid: "019",
        name: '积分流水',
        prid: '1014'
    },
    "pages/new_gift/index/main": {
        pid: "020",
        name: '新人礼',
        prid: '1007'
    },
    "pages/turntable/index/index": {
        pid: "045",
        name: '幸运转盘',
        prid: '1021'
    },
    "pages/new_gift/main/main": {
        pid: "021"
    },
    "pages/new_gift/regiter/main": {
        pid: "022"
    },
    "pages/new_gift/success/main": {
        pid: "023",
        name: '新人礼',
        prid: '1007'
    },
    "pages/new_gift/detail/main": {
        pid: "024",
        name: '新人礼',
        prid: '1007'
    },
    "pages/w_activity/index/index": {
        pid: "025",
        name: '活动报名',
        prid: '1006'
    },
    "pages/w_activity/enroll/enroll": {
        pid: "026",
        name: '活动报名',
        prid: '1006'
    },
    "pages/w_activity/detail/detail": {
        pid: "027",
        name: '活动详情',
        prid: '1006'
    },
    "pages/w_activity/order/order": {
        pid: "028",
        name: '订单详情',
        prid: '1006'
    },
    "pages/w_activity/payOrder/pay": {
        pid: "039",
        name: '订单支付',
        prid: '1006'
    },
    "rtmap/integralMall/integralHome/integralHome": {
        pid: "029",
        name: '积分商城',
        prid: '1005'
    },
    "rtmap/integral_mall/pages/detail/detail": {
        pid: "030",
        name: '商品详情',
        prid: '1005'
    },
    "rtmap/coupons/pages/setting/setting": {
        pid: "032",
        name: '关于我们',
        prid: '1014'
    },
    "rtmap/coupons/pages/feedback/feedback": {
        pid: "033",
        name: '意见反馈',
        prid: '1014'
    },
    "rtmap/integral_mall/pages/history/history": {
        pid: "034",
        name: '兑换记录',
        prid: '1005'
    },
    "rtmap/welfaremap/welfaremap": {
        pid: "035",
        name: '福利地图',
        prid: '1012'
    },
    "rtmap/bawang/pages/index/index": {
        pid: "036",
        name: '霸王餐首页',
        prid: '1008'
    },
    "rtmap/bawang/pages/index/wallet/index": {
        pid: "037",
        name: '霸王餐卡包',
        prid: '1008'
    },
    "rtmap/bawang/pages/index/wallet/info/index": {
        pid: "038",
        name: '霸王餐卡券详情',
        prid: '1008'
    },
    "rtmap/coupons/pages/couponsList/couponsList": {
        pid: "041",
        name: '优惠中心',
        prid: '1011'
    },
    "rtmap/coupons/pages/refund/refund": {
        pid: "042",
        name: '退款填写',
        prid: '1022'
    },
    "rtmap/seckill/page/list/list": {
        pid: "047",
        name: '限时秒杀_列表',
        prid: '1023'
    },
    "rtmap/seckill/page/orderresult/orderresult": {
        pid: "048",
        name: '限时秒杀_结果页',
        prid: '1023'
    },
    "rtmap/seckill/page/detail/detail": {
        pid: "049",
        name: '限时秒杀_券详情页',
        prid: '1023'
    },
    "rtmap/seckill/page/return/return": {
        pid: "050",
        name: '限时秒杀_退款页',
        prid: '1023'
    },
    "rtmap/seckill/page/use/use": {
        pid: "051",
        name: '限时秒杀_使用页',
        prid: '1023'
    },
    "rtmap/seckill/page/order/order": {
        pid: "052",
        name: '限时秒杀_订单页',
        prid: '1023'
    },
    "pages/carindex/index": {
        pid: "053",
        name: '停车缴费_首页',
        prid: '1013'
    },
    "rtmap/integral_mall/pages/index/index": {
        pid: "054",
        name: '积分商城列表',
        prid: '1005'
    },
    "rtmap/groupon/detail/detail": {
        pid: "069",
        name: '拼团详情',
        prid: '1039'
    },
    "rtmap/groupon/result/result": {
        pid: "070",
        name: '拼团页面',
        prid: '1040'
    },
    "pages/tdtt_world/index/index": {
        pid: "071",
        name: '天地头条',
        prid: '1041'
    },
    "pages/jump/index": {
        pid: "072",
        name: '地图',
        prid: '1042'
    },
    "pages/tdtt_world/details/index": {
        pid: "073",
        name: '天地头条详情',
        prid: '1043'
    },
    "pages/dazhongdianping/index":{
        pid: "074",
        name: '大众点评',
        prid: '1044'
    },
    "car/pages/addCar/addCar": {
        pid: "075",
        name: '停车缴费_添加车牌',
        prid: '1013'
    },
    "car/pages/parkConvert/parkConvert": {
        pid: "076",
        name: '停车缴费_选择积分',
        prid: '1013'
    },
    "car/pages/parkingPaly/parkingPaly": {
        pid: "077",
        name: '停车缴费_查询缴费信息',
        prid: '1013'
    },
    "car/pages/parkingRecords/parkingRecords": {
        pid: "078",
        name: '停车缴费_缴费记录',
        prid: '1013'
    },
    "car/pages/payInfo/payInfo": {
        pid: "079",
        name: '停车缴费_缴费信息',
        prid: '1013'
    },
    "car/pages/ruleInfo/ruleInfo": {
        pid: "080",
        name: '停车缴费_缴费说明',
        prid: '1013'
    },
    "car/pages/searchCar/searchCar": {
        pid: "081",
        name: '停车缴费_输入车牌缴费',
        prid: '1013'
    },
}

function trackingHttpWithParameter(requestData) {
    if (requestData == null || requestData == undefined) {
        requestData = {}
    }

    const app = getApp()
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    const pageInfo = pageIds[page.route];

    requestData.pageId = pageInfo ? pageInfo.pid : ''
    if (requestData.pageId == null || requestData.pageId == undefined || requestData.pageId == '') {
        return
    }
    requestData.pageName = requestData.pageName || page.title || pageInfo.name
    requestData.userId = wx.getStorageSync('openid')
    requestData.userType = '02'
    requestData.keyAdmin = app.globalData.tenantId
    requestData.verId = app.globalData.version
    requestData.productId = requestData.productId || page.productId || pageInfo.prid

    if (app.globalData.channel && app.globalData.channel.length > 0) {
        requestData.channel = '0201'
    } else {
        requestData.channel = '02'
    }

    console.log('埋点参数', requestData)

    wx.Request({
        url: url,
        data: requestData,
        method: 'GET',
        header: {
            "Content-Type": "application/json"
        },
        success: requestData.success,
        fail: requestData.fail
    })
}

module.exports = {
    tracking: trackingHttpWithParameter,
    pages: pageIds,
}