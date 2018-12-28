// pages/webView/webView.js

import {
    config
} from '../../../utils/config.js'
import {
    tracking
} from '../../utils/track.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        linkAddress: ''
    },

    onShow: function() {
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        if (options.linkType === 'map') {
            tracking({
                event: '06',
                eventState: '打开福利地图'
            })

            const app = getApp()
            const link = `${config.mapUrl}?buildid=${options.buildid}&key=${app.globalData.mapKey}&floor=${options.floor}&labelstyle=circle-point&customization=true&floorlist=true&openid=${wx.getStorageSync('openid')}&point=${options.x},${options.y}&centerpoint=${options.x},${options.y}&poiNo=${options.poiNo}`;
            console.log(link)
            this.setData({
                linkAddress: encodeURI(link)
            });
        } else if (options.linkType === 'memberLink') {
            const link = 'https://h5.rtmap.com/resconf/?sid=193&key_admin=b4d949d71e097162097ef6e9a3de2eeb&impower=a'
            tracking({
                event: '06',
                eventState: '打开会员权益'
            })
            this.setData({
                linkAddress: encodeURI(link)
            });
        } else {
            tracking({
                event: '06',
                eventState: '打开H5外链'
            })
            this.setData({
                linkAddress: encodeURI(options.link)
            });
        }
    },
})