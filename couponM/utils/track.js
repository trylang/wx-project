const url = 'https://event-tracking.rtmap.com/bigdata/v1.0/event-tracking/c/et.gif';

const pageIds = {
  "couponM/pages/couponDist/couponDistShare/couponDistShare": {
    pid: "061",
    name: '专属链接',
      prid: '1011'
  },
  "couponM/pages/couponInfo/couponInfo": {
    pid: "062",
    name: '优惠券详情',
      prid: '1011'
  },
  "couponM/pages/group/couponSubDetail/couponSubDetail": {
    pid: "063",
    name: '商品详情',
      prid: '1011'
  },
  "couponM/pages/groupDetail/groupDetail": {
    pid: "064",
    name: '券详情',
      prid: '1011'
  },
  "couponM/pages/groupbuy/groupbuyDetail/groupbuyDetail": {
    pid: "065",
    name: '拼团结果',
      prid: '1011'
  },
  "couponM/pages/paymentResult/paymentResult": {
    pid: "066",
    name: '支付结果',
      prid: '1011'
  },
  "couponM/pages/shopsList/shopsList": {
    pid: "067",
    name: '商场名称',
      prid: '1011'
  },
  "couponM/pages/webView/webView": {
    pid: "068",
    name: '券商城店铺导航',
      prid: '1011'
  }
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
  tracking: trackingHttpWithParameter
}