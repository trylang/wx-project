// rtmap/welfaremap/welfaremap.js
import {
    config
} from "../../utils/config.js"
import {
  tracking
} from '../coupons/utils/track.js'
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        buildid: config.buildid,
        url: ''
    },

    onShow(){
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            url: encodeURI(`https://maps.rtmap.com/welfaremap/?buildid=${config.buildid}&key=${app.globalData.mapKey}&floor=F1&openId=${wx.getStorageSync('openid')}`)
        })
    },
    // onHide(){
    //   tracking({
    //     event: '06',
    //     eventState: '跳转成功'
    //   })
    // }
})