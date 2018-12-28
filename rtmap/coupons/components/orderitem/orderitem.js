// components/orderitem/orderitem.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../utils/httpUtil.js';
import {
    tracking
} from '../../utils/track.js'
var app = getApp()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        data: {
            type: Object,
            value: {}
        },
        index: String,
    },

    /**
     * 组件的初始数据
     */
    data: {
        mapStatus: {
            '1': {
                text: '等待付款',
                btncontent: '去支付',
                en: 'waitPay'
            },
            '2': {
                text: '支付成功',
                btncontent: '',
                en: 'payMent'
            },
            '3': {
                text: '交易完成',
                btncontent: '',
                en: 'payMent'
            },
            '4': {
                text: '退款中',
                btncontent: '查看退款进度',
                en: 'refunding'
            },
            '5': {
                text: '退款完成',
                btncontent: '再次购买',
                en: 'close'
            },
            '6': {
                text: '退款失败',
                btncontent: '再次购买',
                en: 'close'
            },
            '7': {
                text: '交易关闭',
                btncontent: '再次购买',
                en: 'close'
            }
        },
        isMiao: true,
    },
    /**
     * 组件的方法列表
     */
    methods: {
        
        tolink(e) {
            let eventDetail = {
                index: e.currentTarget.id,
            }
            this.triggerEvent('detail', eventDetail)
        },
        toDetail() {
            tracking({
                event: '07',
                eventState: '跳转优惠券详情'
            })
            wx.navigateTo({
                url: `/rtmap/coupons/pages/couponInfo/couponInfo?qrCode=${this.data.data.couponCode}`
            })
        },
        _payment() {
            let that = this
            let preInfo = {}
            if (this.data.data.sourceType == 0) {
                preInfo = {
                    portalId: app.globalData.tenantId,
                    appId: app.globalData.appId,
                    openId: wx.getStorageSync('openid'),
                    orderNo: this.data.data.orderNo
                }
            } else {
                preInfo = {
                    id: this.data.data.orderId
                }
            }
            httpWithParameter({
                endPoint: this.data.data.sourceType == 0 ? requestEndPoints.payorder : requestEndPoints.getPreInfo,
                data: preInfo,
                success: (res) => {
                    if (res.data.status === 200) {
                        console.log(res.data.data.timeStamp);
                        let payInfo = null
                        if (res.data.data.payInfo) {
                            payInfo = {
                                timeStamp: res.data.data.payInfo.timeStamp + '',
                                nonceStr: res.data.data.payInfo.nonceStr,
                                package: res.data.data.payInfo.package,
                                signType: res.data.data.payInfo.signType,
                                paySign: res.data.data.payInfo.paySign,
                            }
                        } else {
                            payInfo = {
                                timeStamp: res.data.data.timeStamp + '',
                                nonceStr: res.data.data.nonceStr,
                                package: res.data.data.package,
                                signType: res.data.data.signType,
                                paySign: res.data.data.paySign,
                            }
                        }
                        wx.requestPayment({
                            timeStamp: payInfo.timeStamp + '',
                            nonceStr: payInfo.nonceStr,
                            package: payInfo.package,
                            signType: payInfo.signType,
                            paySign: payInfo.paySign,
                            success: function() {
                                if (that.data.data.sourceType == 0) {
                                    tracking({
                                        event: '07',
                                        eventState: '跳转订单详情'
                                    })
                                    wx.navigateTo({
                                        url: `/rtmap/coupons/pages/orderDetail/orderDetail?orderNo=${that.data.data.orderNo}`
                                    })
                                } else {
                                    tracking({
                                        event: '07',
                                        eventState: '跳转秒杀订单详情'
                                    })
                                    wx.navigateTo({
                                        url: `/rtmap/seckill/page/order/order?orderId=${that.data.data.orderId}`
                                    })
                                }

                            },
                            fail(res) {
                                console.log(res);
                            }
                        })
                    } else {}
                },
                fail: (res) => {
                    console.log('fail', res);
                }
            });
        },
        invite() {
            tracking({
                event: '07',
                eventState: '跳转拼团结果'
            })
            let group = this.data.data.group;
            wx.navigateTo({
                url: `/rtmap/groupon/result/result?groupId=${group.groupId}&productId=${group.productId}&type=pay&orderNo=${this.data.data.orderNo}`
            })
        }
    },

})