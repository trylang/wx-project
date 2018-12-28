// rtmap/bubugao/park.js
Page({

    /**
     * 页面的初始数据
     */
    data: {},

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        wx.navigateToMiniProgram({
            appId: 'wxc94daee5c5b654ad',
            path: 'pages/index/index',
            extraData: {
                source: 'wxProgramZHT', //你们小程序的标记
                openPage: 'parking', //跳转停车缴费页面
                channel: '168001', //固定梅溪新天地id
                mobile: wx.getStorageSync('mobile') //用户手机号
            },
            success: (res) => {
                wx.switchTab({
                    url: '/pages/index/index'
                })
            },
            fail: (res) => {
                wx.switchTab({
                    url: '/pages/index/index'
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        wx.switchTab({
            url: '/pages/index/index'
        })
    },
})
