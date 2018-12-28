// rtmap/groupon/result/result.js 

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
        groupDetail: {},
        type: '',
        time: '',
        name: '',
        options: {},
        isFromShare: 'false',
        isMove: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */

    getGroupDetail(groupId, productId) {
        let that = this
        httpWithParameter({
            endPoint: requestEndPoints.groupDetail,
            data: {
                portalId: app.globalData.tenantId,
                productId,
                groupId
            },
            success(res) {
                if (res.data.status == 200) {
                    let groupDetail = res.data.data.data;
                    groupDetail.peopleList = that.formatGroupImg(groupDetail);
                    that.setData({
                        groupDetail: groupDetail
                    });
                    let time = res.data.data.data.allinTime - new Date()
                    if (time > 0 && res.data.data.data.state != 1) {
                        time = Math.floor(time / 1000)
                        that.resetTime(time)
                        that.setData({
                            time: '拼团中'
                        })
                    } else if (res.data.data.data.state == 1) {
                        that.setData({
                            time: '已拼成'
                        })
                    } else {
                        that.setData({
                            time: '已结束'
                        })
                    }

                }
            }
        })
    },
    myGroupDetail(orderNo, productId) {
        let that = this;
        httpWithParameter({
            endPoint: requestEndPoints.myGroupDetail,
            data: {
                portalId: app.globalData.tenantId,
                orderNo,
                productId,
                openId: wx.getStorageSync('openid')
            },
            success(res) {
                if (res.data.status == 200) {
                    let groupDetail = res.data.data.data;
                    groupDetail.peopleList = that.formatGroupImg(groupDetail);
                    that.setData({
                        groupDetail: groupDetail
                    });
                    let time = res.data.data.data.allinTime - new Date()
                    if (time > 0 && res.data.data.data.state != 1) {
                        time = Math.floor(time / 1000)
                        that.resetTime(time)
                        that.setData({
                            time: '拼团中'
                        })
                    } else if (res.data.data.data.state == 1) {
                        that.setData({
                            time: '已拼成'
                        })
                    } else {
                        that.setData({
                            time: '已结束'
                        })
                    }

                }
            }
        })
    },
    formatGroupImg(groupDetail) {
        let arr = [];
        groupDetail.members.forEach(item => {
            arr.push({
                isSponsor: item.isSponsor,
                img: item.avatarUrl
            })
        });
        groupDetail.members.sort((a, b) => {
            if (a.isSponsor < b.isSponsor) {
                return -1;
            } else {
                return 1;
            }
        });
        let number = groupDetail.memberCount - groupDetail.followMemberCount;
        if (number > 0) {
            for (let i = 0; i < number; i++) {
                arr.push({
                    isSponsor: 1,
                    img: '../images/userImg.png'
                });
            };
        };
        return arr;
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
                    that.setData({
                        couponDetail: res.data.data
                    })
                }
            }
        })
    },
    initiator() {
        tracking({
            activityId: this.data.couponDetail.data.product.activityId,
            coupon: this.data.couponDetail.data.product.couponId,
            event: '12',
            eventState: '返回首页'
        })
        wx.switchTab({
            url: '/pages/index/index'
        })
    },
    join() {
        if (!wx.getStorageSync('isLoginSucc')) {
            wx.navigateTo({
                url: `${app.globalData.loginPath}?from=拼团结果`,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            })
            return
        }
        let that = this

        tracking({
            activityId: this.data.couponDetail.data.product.activityId,
            coupon: this.data.couponDetail.data.product.couponId,
            event: '12',
            eventState: '参与拼团'
        })
        let groupId = this.data.groupDetail.id
        postRequestWithParameter({
            endPoint: requestEndPoints.couponBuy + '?portalId=' + app.globalData.tenantId,
            data: {
                appId: app.globalData.appId,
                openId: wx.getStorageSync('openid'),
                productId: this.data.couponDetail.id,
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
                            let options = that.data.options;
                            that.getCouponDetail(options.productId)
                            if (options.groupId) {
                                that.getGroupDetail(options.groupId, options.productId)
                            } else {
                                that.myGroupDetail(options.orderNo, options.productId)
                            }
                        },
                        fail(res) {
                            console.log(res);
                        }
                    })
                } else {
                    wx.showToast({
                        title: res.data.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        })
    },
    check() {
        tracking({
            activityId: this.data.couponDetail.data.product.activityId,
            coupon: this.data.couponDetail.data.product.couponId,
            event: '07',
            eventState: '拼团详情'
        })
        wx.navigateTo({
            url: '../detail/detail?couponid=' + this.data.couponDetail.id,
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
        })
    },
    onLoad: function(options) {
        this.setData({
            type: options.type,
            name: options.name || '',
            isFromShare: options.isFromShare || 'false',
            options
        })

        this.getCouponDetail(options.productId)
        if (options.groupId) {
            this.getGroupDetail(options.groupId, options.productId)
        } else {
            this.myGroupDetail(options.orderNo, options.productId)
        }
    },

    resetTime(times) {
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
            that.setData({
                day,
                hour,
                minute,
                second
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        console.log(this.data.couponDetail)
        tracking({
            activityId: this.data.couponDetail.data.product.activityId,
            coupon: this.data.couponDetail.data.product.couponId,
            event: '02',
            eventState: '转发'
        })
        console.log(this.data.groupDetail);
        let path = '/rtmap/groupon/result/result?type=share&name=' + wx.getStorageSync('userInfo').nickName + '&groupId=' + this.data.groupDetail.id + '&productId=' + this.options.productId + "&isFromShare=true";
        return {
            path: path
        }
    },

    onPullDownRefresh() {
        let options = this.data.options;
        this.getCouponDetail(options.productId)
        if (options.groupId) {
            this.getGroupDetail(options.groupId, options.productId)
        } else {
            this.myGroupDetail(options.orderNo, options.productId)
        }
    }
})