const app = getApp()
import {
    tracking
} from '../../rtmap/coupons/utils/track.js'
Page({
    data: {
        url: '',
        keyAdmin: ''
    },
    onLoad: function(options) {
        // var keyAdmin=wx.getStorageSync('keyAdmin');
        this.setData({
            url: app.globalData.bannerHTTPURL
        });
    },
    onShow(){
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },
})