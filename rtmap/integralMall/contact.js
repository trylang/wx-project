//埋点参数
const productId = '1005'
//服务器地址
const testUrl = 'https://backend.rtmap.com/Integral/SpIntegral/'
const contantUrl = 'https://mem.rtmap.com/Integral/SpIntegral/'
// const devUrl = 'http://211.157.182.226:8888/rtscrm/scrm-web-opr/'
const devUrl = 'https://appsmall.rtmap.com/wxapp-root/'
var url = testUrl
var app = getApp()

function postWithParameter(requestData) {
  requestData.data.key_admin = app.globalData.keyAdmin
  requestData.data.buildid = app.globalData.buildid
    requestData.data.cardno = wx.getStorageSync('member') ? wx.getStorageSync('member').member.cardNo : ''
    requestData.data.openid = wx.getStorageSync('openid')

    //  requestData.data.key_admin = '202cb962ac59075b964b07152d234b70'
    //  requestData.data.buildid = '860100010040500017'
    // requestData.data.cardno = wx.getStorageSync('member') ? wx.getStorageSync('member').member.cardNo : ''
    //  requestData.data.openid = wx.getStorageSync('openid')
    console.log('积分商城请求参数', requestData.data)
    wx.Request({
        url: url + requestData.endPoint,
        data: requestData.data,
        method: 'GET',
        header: {
            "Content-Type": "application/json"
        },
        success: (data) => {
            console.log('积分商城', data.data)
            requestData.success(data)
        },
        fail: requestData.fail,
        complete: (res) => {}
    })
}

function getWithParameter(requestData) {
    console.log(wx.getStorageSync('member'))
    requestData.data.tenantType = 1
    requestData.data.tenantId = app.globalData.tenantId
    requestData.data.cid = wx.getStorageSync('member') ? wx.getStorageSync('member').cid : ''
    wx.Request({
        url: devUrl + 'api/v1/score/account',
        data: requestData.data,
        method: 'GET',
        header: {
            "Content-Type": "application/json"
        },
        success: requestData.success,
        fail: requestData.fail,
        complete: (res) => {}
    })
}

function toast(res) {
    wx.showToast({
        title: res.title,
        icon: 'none',
        duration: 1000,
        mask: true,
    })
}

module.exports = {
    productId: productId,
    postWithParameter: postWithParameter,
    getWithParameter: getWithParameter,
    toast: toast
}