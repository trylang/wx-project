const url = 'https://event-tracking.rtmap.com/bigdata/v1.0/event-tracking/c/et.gif';

const pageIds = {
  "car/pages/addCar/addCar": {
    pid: "054",
    name: '绑定车牌',
    prid: '1023'
  },
  "car/pages/searchCar/searchCar": {
    pid: "055",
    name: '输入车牌缴费',
    prid: '1024'
  },
  "car/pages/parkingPaly/parkingPaly": {
    pid: "056",
    name: '查询缴费',
    prid: '1025'
  },
  "car/pages/ruleInfo/ruleInfo": {
    pid: "057",
    name: '收费说明',
    prid: '1026'
  },
  "car/pages/parkingRecords/parkingRecords": {
    pid: "058",
    name: '缴费记录',
    prid: '1027'
  },
  "car/pages/payInfo/payInfo": {
    pid: "059",
    name: '缴费详情',
    prid: '1028'
  },
  "car/pages/parkConvert/parkConvert": {
    pid: "060",
    name: '选择积分',
    prid: '1029'
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