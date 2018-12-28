// pages/orderDetail/orderDetail.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../utils/httpUtil.js';
import {
    tracking
} from '../../utils/track.js'
import {
    formatTime
} from '../../utils/util.js';
var app = getApp();
let isGroup = false;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        mapStatus: {
            '1': {
                text: '等待付款',
                btncontent: '去支付',
                tip: '',
                en: 'waitPay'
            },
            '2': {
                text: '支付成功',
                btncontent: '',
                tip: '您已领取成功，请尽快到门店使用',
                en: 'payment'
            },
            '3': {
                text: '交易完成',
                btncontent: '交易成功',
                tip: '您的交易已成功',
                en: 'close'
            },
            '4': {
                text: '交易完成',
                btncontent: '退款成功',
                tip: '正在退款中，请您稍后等待',
                en: 'refunding'
            },
            '5': {
                text: '交易完成',
                btncontent: '退款成功',
                tip: '退款已成功',
                en: 'close'
            },
            '6': {
                text: '交易完成',
                btncontent: '退款失败',
                tip: '退款已失败',
                en: 'close'
            },
            '7': {
                text: '交易关闭',
                btncontent: '再次购买',
                tip: '交易已取消，期待您的再次购买',
                en: 'close'
            }
        },
        group: null,
        orderNo: '',
        orderDetail: {},
        time: '',
        couponStatus: 0,
        isMiao: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let group = options.group ? JSON.parse(options.group) : '';
        if (group) {
            let time = Math.floor((group.allinTime - new Date().valueOf()) / 1000);
            this.setData({
                orderNo: options.orderNo,
                group: group,
                ["mapStatus.group"]: {
                    text: group.state == 0 ? '拼团中' : (group.state == 1 ? '已成团' : '拼团失败'),
                    btncontent: group.state == 0 ? '拼团中' : (group.state == 1 ? '已成团' : '拼团失败'),
                    tip: group.state == 0 ? this.formatTime(time) : (group.state == 1 ? '您已拼团成功，请尽快到门店使用' : ''),
                    en: 'close'
                }
            });
            ;
        } else {
            if (options.isGroup == 'true') {
                isGroup = options.isGroup;
            }
            this.setData({
                orderNo: options.orderNo,
            })
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (this.data.orderNo == 'refund') {
            let detail = app.globalData.orderDetail;
            detail.order.orderTime = formatTime(detail.order.orderTime);
            detail.order.createTime = formatTime(detail.order.createTime);
            this.setData({
                orderDetail: app.globalData.orderDetail
            })
            console.log('res.data.data', app.globalData.orderDetail)
        } else(
            this.getOrderDetail(this.data.orderNo)
        )
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    getOrderDetail(orderNo) {
        wx.showLoading({
            title: ''
        })
        httpWithParameter({
            endPoint: requestEndPoints.orderDetail,
            data: {
                orderNo,
                openId: wx.getStorageSync("openid"),
                portalId: app.globalData.tenantId
            },
            success: (res) => {
                wx.hideLoading()
                if (res.data.status === 200) {
                    if (!res.data.data) return;
                    console.log('res.data.data', res.data.data)
                    if (isGroup) {
                        this.getGroupDetail(res.data.data.order);
                    }
                    /*    if (res.data.data.coupon.effectiveType == 1) {
                            if (res.data.data.order.paymentTime) {
                                let coupon = res.data.data.coupon
                                let start = new Date(res.data.data.order.paymentTime.replace(/-/g, '/'))
                                start.setDate(start.getDate() + coupon.activedLimitedStartDay)
                                let end = new Date(res.data.data.order.paymentTime.replace(/-/g, '/'))
                                end.setDate(end.getDate() + coupon.activedLimitedDays)
                                res.data.data.coupon.effectiveStartTime = formatTime(start)
                                res.data.data.coupon.effectiveEndTime = formatTime(end)
                            }
                        } else {
                            res.data.data.coupon.effectiveStartTime = res.data.data.coupon.effectiveStartTime.slice(0, 10)
                            res.data.data.coupon.effectiveEndTime = res.data.data.coupon.effectiveEndTime.slice(0, 10)
                        }*/
                    this.getcouponDetail(res.data.data.products[0].qrCode)
                    res.data.data.products = res.data.data.products.map(item => {
                        item.couponInfo = JSON.parse(item.couponInfo)
                        if (item.couponInfo.effectiveType == 1) {
                            let gettime = item.getTime;
                            let start = gettime + item.couponInfo.activedLimitedStartDay * 24 * 60 * 60 * 1000;
                            let stop = gettime + item.couponInfo.activedLimitedStartDay * 24 * 60 * 60 * 1000 + item.couponInfo.activedLimitedDays * 24 * 60 * 60 * 1000;
                            item.epTime = formatTime(new Date(start)) + ' 至 ' + formatTime(new Date(stop));
                        } else {
                            item.epTime = item.couponInfo.effectiveStartTime + ' 至 ' + item.couponInfo.effectiveEndTime;
                        }

                        return item
                    });
                    res.data.data.order.orderTime = formatTime(res.data.data.order.orderTime);
                    res.data.data.order.createTime = formatTime(res.data.data.order.createTime);
                    this.setData({
                        orderDetail: res.data.data,
                        //判断是否秒杀券
                        isMiao: res.data.data ? res.data.data.order.orderNo.substr(0, 1) == 'S' : true
                    })
                    let time = new Date() - new Date(res.data.data.order.orderTime)
                    time = Math.floor((1800000 - time) / 1000)
                    this.resetTime(time)
                } else {}
            },
            fail: (res) => {
                wx.hideLoading()
                console.log('fail', res);
            }
        });
    },
    getGroupDetail(order) {
        httpWithParameter({
            endPoint: requestEndPoints.orderGroupDetail,
            data: {
                orderNo: order.orderNo,
                productId: order.sellProductId,
                // openId: wx.getStorageSync("openid"),
                portalId: app.globalData.tenantId
            },
            success: (res) => {
                if (res.data.status === 200) {
                    let group = res.data.data.data;
                    console.log(group)
                    if (!group) return;
                    let time = Math.floor((group.allinTime - new Date().valueOf()) / 1000);
                    this.setData({
                        group: group,
                        ["mapStatus.group"]: {
                            text: group.state == 0 ? '拼团中' : (group.state == 1 ? '已成团' : '拼团失败'),
                            btncontent: group.state == 0 ? '拼团中' : (group.state == 1 ? '已成团' : '拼团失败'),
                            tip: group.state == 0 ? this.formatTime(time) : (group.state == 1 ? '您已拼团成功，请尽快到门店使用' : ''),
                            en: 'close'
                        }
                    });
                   
                }
            },
            fail: (res) => {}
        })
    },
    addDate(date, days) {
        var d = new Date(date);
        d.setDate(d.getDate() + days);
        var m = d.getMonth() + 1;
        return d.getFullYear() + '-' + m + '-' + d.getDate();
    },
    getcouponDetail(qrCode) {
        httpWithParameter({
            endPoint: requestEndPoints.qrcodedetail,
            data: {
                openId: wx.getStorageSync('openid'),
                tenantId: app.globalData.tenantId,
                qrCode
            },
            success: (res) => {
                console.log('this', this);
                if (res.data.status === 200) {
                    this.setData({
                        couponStatus: res.data.data.status
                    })
                } else {}
            },
            fail: (res) => {
                wx.hideLoading()
                console.log('fail', res);
            }
        });
    },
    payment() {
      tracking({
        event: '12',
        eventState: '立即支付'
      })
        let that = this
        wx.showLoading({
            title: ''
        })
        httpWithParameter({
            endPoint: requestEndPoints.payorder,
            data: {
                portalId: app.globalData.tenantId,
                appId: app.globalData.appId,
                openId: wx.getStorageSync('openid'),
                orderNo: this.data.orderDetail.order.orderNo
            },
            success: (res) => {
                if (res.data.status === 200) {
                    wx.hideLoading()
                    wx.requestPayment({
                        timeStamp: res.data.data.payInfo.timeStamp + '',
                        nonceStr: res.data.data.payInfo.nonceStr,
                        package: res.data.data.payInfo.package,
                        signType: res.data.data.payInfo.signType,
                        paySign: res.data.data.payInfo.paySign,
                        success() {
                            that.getOrderDetail(that.data.orderNo)
                            // wx.navigateTo({
                            //   url: `../paymentResult/paymentResult?orderNo=${that.data.orderNo}&qrCode=${}&status=success`,
                            // });
                        },
                        fail(res) {
                            // wx.navigateTo({
                            //   url: `../paymentResult/paymentResult?orderNo=${that.data.orderNo}`,
                            // });
                        }
                    })
                } else {
                    wx.hideLoading()
                }
            },
            fail: (res) => {
                wx.hideLoading()
                // wx.navigateTo({
                //   url: '../paymentResult/paymentResult?status=fail',
                // });
            }
        });
    },
    refund() {
        app.globalData.orderDetail = this.data.orderDetail
        tracking({
            event: '07',
            eventState: '退款'
        })
        wx.redirectTo({
            url: '../refund/refund',
            success: function(res) {
            },
            fail: function(res) {
            }
        });
    },
    cancel() {
      tracking({
        event: '12',
        eventState: '取消订单支付'
      })
        wx.showLoading({
            title: ''
        })
        httpWithParameter({
            endPoint: requestEndPoints.orderClose,
            data: {
                openId: wx.getStorageSync('openid'),
                orderNo: this.data.orderNo,
                portalId: app.globalData.tenantId
            },
            success: (res) => {

                if (res.data.status === 200) {
                    console.log(res);
                    this.getOrderDetail(this.data.orderNo)
                } else {
                    wx.hideLoading()
                }
            },
            fail: (res) => {
                wx.hideLoading()
                console.log('fail', res);
            }
        });
    },
    
    shop(e) {
        let index = e.currentTarget.dataset.index;
        let info = this.data.orderDetail.products[index].couponInfo;
        let couponId = info.id;
        tracking({
            event: '07',
            eventState: '店铺列表'
        })
        wx.navigateTo({
            url: '/couponM/pages/shopsList/shopsList?couponId=' + couponId,
            success: function(res) {
            },
            fail: function(res) {
            }
        });
    },
    toDetail(e) {
        console.log(e)
        tracking({
            event: '07',
            eventState: '优惠券详情'
        })
        if (this.data.orderDetail.order.state == 5 || this.data.orderDetail.order.state == 4) {
            app.globalData.couponDetail = this.data.orderDetail.coupon
            app.globalData.couponDetail.status = '7'
            app.globalData.couponDetail.qrCode = this.data.orderDetail.order.couponCode
            wx.navigateTo({
                url: `../couponInfo/couponInfo?qrCode=refund&extendInfo=${this.data.orderDetail.coupon.extendInfo}`,
                success: function(res) {
                },
                fail: function(res) {
                }
            })
        } else {
            wx.navigateTo({
                url: `../couponInfo/couponInfo?qrCode=${e.currentTarget.id}&extendInfo=${e.currentTarget.dataset.extendInfo}`,
                success: function(res) {
                },
                fail: function(res) {
                }
            })
        }
    },

    resetTime(time) {
        console.log('time', time);
        // clearInterval(timer);
        var that = this
        var timer = null;
        var t = time;
        var m = 0;
        var s = 0;
        m = Math.floor(t / 60 % 60);
        m < 10 && (m = '0' + m);
        s = Math.floor(t % 60);

        function countDown() {
            if (s > 0) {
                s--
            }
            s < 10 && (s = '0' + s);
            if (s.length >= 3) {
                s = 59;
                m = m < 10 ? "0" + (Number(m) - 1) : Number(m) - 1;
            }
            if (m.length >= 3) {
                m = '00';
                s = '00';
                clearInterval(timer);
            }
            that.setData({
                'mapStatus.1.tip': '请在 00:' + m + ':' + s + '内付款，逾期自动关闭',
            });

        }
        timer = setInterval(countDown, 1000);
    },

    formatTime(times) {

        if (times <= 0) return;
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
                that.setData({
                    'mapStatus.group.tip': '还剩' + day + ":" + hour + ":" + minute + ":" + second
                });
            times--;
        }, 1000);
        if (times <= 0) {
            clearInterval(timer);
        }
    },

    showOhter() {
        tracking({
            event: '07',
            eventState: '返回首页'
        })
        wx.switchTab({
            url: '/pages/index/index'
        })
    }
})