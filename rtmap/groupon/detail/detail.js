// rtmap/groupon/detail/detail.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../utils/httpUtil.js';
import {
    tracking
} from '../../coupons/utils/track.js'
var app = getApp()
Page({
    /**
     * 页面的初始数据 
     */
    data: {
        modelShow: false,
        couponDetail: {
            data: {}
        },
        shops: [],
        groupbuyList: [],
        isFromShare: 'false',
        isMove: false,
        modalHidden: true,
        type: '',
    },

    modelHandle() {
        tracking({
            activityId: this.data.couponDetail.data.product.activityId,
            coupon: this.data.couponDetail.data.product.couponId,
            event: '14',
            eventState: '查看更多'
        })
        this.setData({
            modelShow: !this.data.modelShow
        })
    },

    grouponRule() {
        tracking({
            activityId: this.data.couponDetail.data.product.activityId,
            coupon: this.data.couponDetail.data.product.couponId,
            event: '14',
            eventState: '查看拼团规则'
        })
        this.setData({
            modalHidden: false
        })
    },

    modalConfirm: function() {
        this.setData({
            modalHidden: true
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        tracking({
            event: '06',
            eventState: '进入拼团券详情成功'
        })
        this.getCouponDetail(options.couponid)
        this.getgroupbuyList(options.couponid);
        options.type && this.setData({
            type: options.type
        })
        this.setData({
            isFromShare: options.isFromShare || 'false'
        })
    },

    getCouponDetail(productId) {
        let that = this
        httpWithParameter({
            endPoint: requestEndPoints.couponDetail,
            data: {
                portalId: app.globalData.tenantId,
                productId
            },
            success(res) {
                if (res.data.status == 200) {

                    let reg = /\n/
                    res.data.data.data.detail.descClause = res.data.data.data.detail.descClause || ''
                    res.data.data.data.detail.descClause = res.data.data.data.detail.descClause.split(reg)
                    try {
                        let rule = JSON.parse(res.data.data.data.detail.imgtxtInfo).map(item => {
                            item.html = item.html.split(reg)
                            return item
                        })
                        res.data.data.data.detail.imgtxtInfo = rule
                    } catch (err) {

                    }
                    that.getShops(res.data.data.data.detail.id)
                    that.setData({
                        couponDetail: res.data.data
                    })
                }
            }
        })
    },
    getShops(id) {
        let that = this
        httpWithParameter({
            endPoint: requestEndPoints.shops,
            data: {
                portalId: app.globalData.tenantId,
                couponId: id
            },
            success(res) {
                if (res.data.status == 200) {
                    that.setData({
                        shops: res.data.data.list
                    })
                }
            }
        })
    },
    getgroupbuyList(id) {
        let that = this
        httpWithParameter({
            endPoint: requestEndPoints.groupbuyList,
            data: {
                portalId: app.globalData.tenantId,
                productId: id,
                state: 0,
                page: 1,
                pageSize: 100
            },
            success(res) {
                if (res.data.status == 200) {
                    that.setData({
                        groupbuyList: res.data.data.list,
                        groupbuyListSlice: res.data.data.list.slice(0, 2)
                    })
                    that.data.groupbuyList.forEach((item, index) => {
                        let Tkey = 'groupbuyList[' + index + '].status'
                        let time = item.allinTime - new Date()
                        if (time > 0) {
                            time = Math.floor(time / 1000)
                            that.resetTime(time, index, 'groupbuyList')
                            that.setData({
                                [Tkey]: false
                            })
                        } else {
                            that.setData({
                                [Tkey]: true
                            })
                        }

                    })
                    that.data.groupbuyListSlice.forEach((item, index) => {
                        let Tkey = 'groupbuyListSlice[' + index + '].status'
                        let time = item.allinTime - new Date()
                        if (time > 0) {
                            time = Math.floor(time / 1000)
                            that.resetTime(time, index, 'groupbuyListSlice')
                            that.setData({
                                [Tkey]: false
                            })
                        } else {
                            that.setData({
                                [Tkey]: true
                            })
                        }

                    })
                }
            }
        })
    },
    couponBuy(e) {
        let that = this
        tracking({
            activityId: that.data.couponDetail.data.product.activityId,
            coupon: that.data.couponDetail.data.product.couponId,
            event: '18',
            eventState: that.data.type + '点击领取'
        })
        const isLogin = wx.getStorageSync("isLoginSucc");
        if (!isLogin) {
            wx.navigateTo({
                url: app.globalData.loginPath,
                success: function(res) {},
                fail: function(res) {}
            });
            return;
        }

        let groupId = ''
        if (e.currentTarget.id == 'normal') {
            tracking({
                activityId: that.data.couponDetail.data.product.activityId,
                coupon: that.data.couponDetail.data.product.couponId,
                event: '12',
                eventState: '单独购买'
            })
            groupId = -1
        } else if (e.currentTarget.id == 'groupon') {
            tracking({
                activityId: that.data.couponDetail.data.product.activityId,
                coupon: that.data.couponDetail.data.product.couponId,
                event: '12',
                eventState: '拼团购买'
            })
            groupId = ''
        } else {
            groupId = e.currentTarget.id
        }
        postRequestWithParameter({
            endPoint: requestEndPoints.couponBuy + '?portalId=' + app.globalData.tenantId,
            data: {
                appId: app.globalData.appId,
                openId: wx.getStorageSync('openid'),
                productId: that.data.couponDetail.id,
                groupId
            },
            success(res) {
                if (res.data.status == 200 && res.data.data.code == 0) {
                    let payInfo = {
                        timeStamp: res.data.data.payInfo.timeStamp + '',
                        nonceStr: res.data.data.payInfo.nonceStr,
                        package: res.data.data.payInfo.package,
                        signType: res.data.data.payInfo.signType,
                        paySign: res.data.data.payInfo.paySign,
                    }
                    let orderNo = res.data.data.orderNo
                    wx.requestPayment({
                        timeStamp: payInfo.timeStamp + '',
                        nonceStr: payInfo.nonceStr,
                        package: payInfo.package,
                        signType: payInfo.signType,
                        paySign: payInfo.paySign,
                        success: function() {
                            wx.navigateTo({
                                url: `../result/result?groupId=${groupId}&productId=${that.data.couponDetail.id}&type=pay&orderNo=${orderNo}`,
                                success: function(res) {
                                    tracking({
                                        activityId: that.data.couponDetail.data.product.activityId,
                                        coupon: that.data.couponDetail.data.product.couponId,
                                        event: '18',
                                        eventState: that.data.type + '跳转领取结果成功'
                                    })
                                },
                                fail: function(res) {
                                    tracking({
                                        activityId: that.data.couponDetail.data.product.activityId,
                                        coupon: that.data.couponDetail.data.product.couponId,
                                        event: '18',
                                        eventState: that.data.type + '跳转领取结果失败'
                                    })
                                },
                            })
                        },
                        fail(res) {
                            wx.hideLoading();
                            wx.navigateTo({
                                url: '/rtmap/coupons/pages/orderDetail/orderDetail?orderNo=' + orderNo + '&isGroup=true',
                                success: function(res) {
                                    tracking({
                                        event: '18',
                                        eventState: that.data.type + '跳转领取结果成功'
                                    })
                                },
                                fail: function(res) {
                                    tracking({
                                        event: '18',
                                        eventState: that.data.type + '跳转领取结果失败'
                                    })
                                }
                            });
                        }
                    })
                } else if (res.data.data.code == 19) {
                    wx.showModal({
                        title: '提示',
                        content: res.data.data.message,
                        confirmText: '去支付',
                        success(data) {
                            if (data.confirm) {
                                wx.navigateTo({
                                    url: '/rtmap/coupons/pages/orderDetail/orderDetail?orderNo=' + res.data.data.orderNo + '&isGroup=true',
                                    success: function(res) {
                                        tracking({
                                            activityId: that.data.couponDetail.data.product.activityId,
                                            coupon: that.data.couponDetail.data.product.couponId,
                                            event: '18',
                                            eventState: that.data.type + '跳转未支付订单成功'
                                        })
                                    },
                                    fail: function(res) {
                                        tracking({
                                            activityId: that.data.couponDetail.data.product.activityId,
                                            coupon: that.data.couponDetail.data.product.couponId,
                                            event: '18',
                                            eventState: that.data.type + '跳转未支付订单失败'
                                        })
                                    },
                                })
                            } else if (res.cancel) {}
                        }
                    })
                } else {
                    wx.showToast({
                        title: res.data.data.message,
                        icon: 'none',
                        duration: 2000,

                    })
                }
            }
        })
    },
    onCallClick() {
        tracking({
            activityId: this.data.couponDetail.data.product.activityId,
            coupon: this.data.couponDetail.data.product.couponId,
            event: '12',
            eventState: '拨打电话'
        })
        if (this.data.shops[0].mobile) {
            wx.makePhoneCall({
                phoneNumber: this.data.shops[0].mobile,
            })
        } else {
            wx.showToast({
                title: '该商家没有电话',
                icon: 'none',
                duration: 2000,
                mask: true,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            })
        }
    },

    navigationToShop: function() {
        let that = this
        const shop = this.data.shops[0];
        console.log(shop)
        if (shop.buildId && shop.floorId && shop.x && shop.y && shop.poiNo) {
            wx.navigateTo({
                url: `/rtmap/coupons/pages/webView/webView?buildBean=${JSON.stringify({ buildId: shop.buildId, floor: shop.floorId, x: shop.x, y: shop.y, pageUrl: getCurrentPages()[getCurrentPages().length - 1].route, poiNo: shop.poiNo })}`,
                success: function(res) {
                    tracking({
                        activityId: that.data.couponDetail.data.product.activityId,
                        coupon: that.data.couponDetail.data.product.couponId,
                        event: '07',
                        eventState: '跳转成功'
                    })
                },
                fail: function(res) {
                    tracking({
                        activityId: that.data.couponDetail.data.product.activityId,
                        coupon: that.data.couponDetail.data.product.couponId,
                        event: '07',
                        eventState: '跳转失败'
                    })
                }
            })
        } else {
            wx.showToast({
                title: '找不到店铺',
                icon: 'none',
                duration: 2000,
                mask: true,
            })
        }
    },

    resetTime(times, index, sub) {
        var timer = null;
        var that = this

        timer = setInterval(function() {
            var day = 0,
                hour = 0,
                minute = 0,
                second = 0; //时间默认值
            if (times > 0) {
                day = Math.floor(times / (60 * 60 * 24));
                hour = Math.floor(times / (60 * 60)) - (day * 24);
                minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
                second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
            }
            if (day <= 9) day = '0' + day;
            if (day <= 0) day = '';
            if (hour <= 9) hour = '0' + hour;
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            //
            let Tkey = sub + '[' + index + '].time'
            that.setData({
                [Tkey]: day + ":" + hour + ":" + minute + ":" + second
            })
            times--;
        }, 1000);
        if (times <= 0) {
            clearInterval(timer);
        }
    },

    //页面滑动监听
    onPageScroll(res) {
        if (this.data.isMove) return;
        this.setData({
            isMove: true
        });
        setTimeout(() => {
            this.setData({
                isMove: false
            });
        }, 800);
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
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        tracking({
            activityId: this.data.couponDetail.data.product.activityId,
            coupon: this.data.couponDetail.data.product.couponId,
            event: '02',
            eventState: '转发'
        })
        return {
            title: this.data.couponDetail ? this.data.couponDetail.data.product.mainInfo : '',
            path: '/rtmap/groupon/detail/detail?couponid=' + this.data.couponDetail.id + '&isFromShare=true'
        }
    }
})