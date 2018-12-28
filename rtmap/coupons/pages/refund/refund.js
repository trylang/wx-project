// pages/refund/refund.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../utils/httpUtil.js';
import {
    tracking
} from '../../utils/track.js'
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        items: [{
                name: '计划有变，没时间消费',
                value: '计划有变，没时间消费'
            },
            {
                name: '买多了/买错了/重复下单',
                value: '买多了/买错了/重复下单'
            },
            {
                name: '网上评价不好',
                value: '网上评价不好'
            },
            {
                name: '其他',
                value: '其他'
            }
        ],
        orderDetail: {},
        reason: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(app.globalData.orderDetail);
        this.setData({
            orderDetail: app.globalData.orderDetail
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },

    radioChange(e) {
        this.setData({
            reason: e.detail.value
        })
    },
    refund() {
        if (!this.data.reason) {
            wx.showToast({
                title: '请选择退款原因',
                icon: 'none'
            })
            return
        }
        postRequestWithParameter({
            endPoint: requestEndPoints.refund + "?portalId=" + app.globalData.tenantId,
            data: {
                openId: wx.getStorageSync("openid"),
                orderNo: this.data.orderDetail.order.orderNo,
                reason: this.data.reason
            },
            success: (res) => {
                if (res.data.status === 200) {
                    if (res.data.data) {
                        if (res.data.data.code == 6) {
                            wx.showToast({
                                title: res.data.data.message,
                                icon: 'none',
                                duration: 2000
                            });
                        } else {
                            wx.redirectTo({
                                url: `../orderDetail/orderDetail?orderNo=${this.data.orderDetail.order.orderNo}`,
                                success: function(res) {
                                    tracking({
                                        event: '07',
                                        eventState: '跳转成功'
                                    })
                                },
                                fail: function(res) {
                                    tracking({
                                        event: '07',
                                        eventState: '跳转失败'
                                    })
                                }
                            });
                        }
                    } else {
                        wx.showToast({
                            title: '退款失败',
                            icon: 'none'
                        })
                    }
                } else {
                    console.log(res);
                }
            },
            fail: (res) => {
                wx.hideLoading()
                wx.showToast({
                    title: '退款失败',
                    icon: 'none'
                })
            }
        });
    }
})