// components/couponitem/couponitem.js
var app = getApp()
import {
    tracking
} from '../../utils/track.js'
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        data: {
            type: Object,
            value: {}
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        statusMap: {
            '2': '立即使用',
            '3': '已使用',
            '4': '已过期',
            '7': '已退券',
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        tolink(e) {
            tracking({
                event: '07',
                eventState: '跳转优惠券详情'
            })
            if (this.data.data.status == 7) {
                app.globalData.couponDetail = this.data.data
                wx.navigateTo({
                    url: `../../pages/couponInfo/couponInfo?qrCode=refund&extendInfo=${this.data.data.extendInfo}&couponActivityId=${this.data.data.couponActivityId}`
                })
            } else {
                wx.navigateTo({
                    url: `../../pages/couponInfo/couponInfo?qrCode=${e.currentTarget.id}&extendInfo=${this.data.data.extendInfo}&couponActivityId=${this.data.data.couponActivityId}`
                })
            }
        }
    }
})