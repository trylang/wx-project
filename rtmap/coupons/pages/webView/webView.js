// pages/webView/webView.js
import {
    tracking
} from '../../utils/track.js'
import {
    config
} from '../../../../utils/config.js'
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        linkAddress: ''
    },

    onShow: function() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

        if (options.buildBean) {
            let buildBean = JSON.parse(options.buildBean)
            console.log(buildBean)
            if (buildBean.name)
                this.setData({
                    linkAddress: encodeURI(`${config.mapUrl}?buildid=${buildBean.buildId}&key=${app.globalData.mapKey}&floor=${buildBean.floor}&openid=${wx.getStorageSync('openid')}&referUrl=${buildBean.pageUrl}&poiNo=${buildBean.poiNo}&key_admin=${buildBean.keyAdmin}&endpoint_name=${buildBean.poiName}&parkstatus=true&labelstyle=circle-point&customization=true&floorlist=true`)
                })
            else {
                this.setData({
                    linkAddress: encodeURI(`https://maps.rtmap.com/welfaremap/?buildid=${buildBean.buildId}&key=${app.globalData.mapKey}&floor=${buildBean.floor}&openid=${wx.getStorageSync('openid')}&point=${buildBean.x},${buildBean.y}&centerpoint=${buildBean.x},${buildBean.y}&referUrl=${buildBean.pageUrl}&poiNo=${buildBean.poiNo}&key_admin=${buildBean.keyAdmin}&endpoint_name=${buildBean.poiName}&parkstatus=true&labelstyle=circle-point&customization=true&floorlist=true`)
                })
            }
        } else if (options.linkType = "membertip") {
            this.setData({
                linkAddress: encodeURI(config.upgradeUrl)
            });
        } else {
            console.log(options.link)
            this.setData({
                linkAddress: encodeURI(options.link)
            });
        }
    },
})