// couponM/components/couponGroup/couponGroup.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from "../../utils/httpUtil.js";
import util from '../../utils/util.js';
import {
    tracking
} from '../../utils/track.js'
const app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        product: {
            type: Object
        },
        productId: {
            type: String
        },
        hiddenGroupBuy: {
            type: Boolean
        },
        hideBuy: {
            type: String,
            value: 'false'
        },
        isFromShare: {
            type: String,
            value: 'false'
        },
        type: {
            type: String
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        buttonClicked: 'no',
    },

    /**
     * 组件的方法列表
     */

    methods: {
        selectedCoupon(e) {
            let coupon = this.data.product.list[e.currentTarget.dataset.index];
            wx.navigateTo({
                url: `../../pages/group/couponSubDetail/couponSubDetail?subProductId=${
          coupon.id}`,
                success: () => {
                    let couponIds = []
                    this.data.product.list.map((value)=>{
                        couponIds.push(value.couponId)
                    })
                    tracking({
                        activityId: this.data.product.product.activityId,
                        coupon: couponIds.join(','),
                        event: '07',
                        eventState: this.data.type + '跳转成功'
                    })
                },
                fail: () => {
                    let couponIds = []
                    this.data.product.list.map((value) => {
                        couponIds.push(value.couponId)
                    })
                    tracking({
                        activityId: this.data.product.product.activityId,
                        coupon: couponIds.join(','),
                        event: '07',
                        eventState: this.data.type + '跳转失败'
                    })
                }
            });
        },

        //立即购买
        buyCoupon() {
            let couponIds = []
            this.data.product.list.map((value) => {
                couponIds.push(value.couponId)
            })
            tracking({
                activityId: this.data.product.product.activityId,
                coupon: couponIds.join(','),
                event: '18',
                eventState: this.data.type + '点击领取'
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
            util.buttonClicked(this);
            postRequestWithParameter({
                endPoint: requestEndPoints.buyCoupon + "?portalId=" + app.globalData.tenantId,
                data: {
                    appId: app.globalData.appId,
                    openId: wx.getStorageSync("openid"),
                    productId: this.data.productId
                    // channelId: app.globalData.channelId ? app.globalData.channelId : ''
                },
                success: res => {
                    let data = res.data;
                    //服务器操作成功
                    if (data.status == 200) {
                        data = data.data;
                        //生成订单成功
                        if (data.code == 0) {
                            //付费券 调起微信支付
                            if (data.buyType == 2) {
                                this.pay(data.payInfo, data.orderNo);
                            } else {
                                //免费券 直接领取qr码
                                this.setData({
                                    qrCode: data.qrCode
                                });
                                this.showModal("coupon_success");
                            }
                        } else {
                            //错误判断条件
                            if (data.code == 2) {
                                //领取上限
                                this.showModal("coupon_fail_upper", data.message);
                            } else if (data.code == 1 || data.code == 13) {
                                //库存不足
                                this.showModal("coupon_fail_understock");
                            } else if (data.code == 19) { // 存在未支付订单，请先进行支付
                                wx.showModal({
                                    title: '提示',
                                    content: data.message,
                                    confirmText: '去支付',
                                    success(res) {
                                        if (res.confirm) {
                                            wx.navigateTo({
                                                url: '/rtmap/coupons/pages/orderDetail/orderDetail?orderNo=' + data.orderNo,
                                            })
                                            let couponIds = []
                                            this.data.product.list.map((value) => {
                                                couponIds.push(value.couponId)
                                            })
                                            tracking({
                                                activityId: this.data.product.product.activityId,
                                                coupon: couponIds.join(','),
                                                event: '07',
                                                eventState: this.data.type + '跳转成功'
                                            })
                                        } else if (res.cancel) {}
                                    }
                                })
                            } else {
                                wx.showToast({
                                    title: data.message,
                                    icon: "none",
                                    duration: 2000
                                });
                            }
                        }
                    } else {
                        wx.showToast({
                            title: data.message,
                            icon: "none",
                            duration: 2000
                        });
                    }
                },
                fail: res => {
                    wx.showToast({
                        title: res.errMsg,
                        icon: "none",
                        duration: 2000
                    });
                }
            });
        },

        /**
         * 支付处理 调起微信支付
         */
        pay(payInfo, orderNo) {
            const that = this;
            wx.requestPayment({
                timeStamp: payInfo.timeStamp.toString(),
                nonceStr: payInfo.nonceStr,
                package: payInfo.package,
                signType: payInfo.signType,
                paySign: payInfo.paySign,
                success: function(res) {
                    wx.showLoading({
                        title: "查询订单中...",
                        mask: true
                    });
                    setTimeout(() => {
                        httpWithParameter({
                            endPoint: requestEndPoints.orderDetail,
                            data: {
                                portalId: app.globalData.tenantId,
                                openId: wx.getStorageSync("openid"),
                                orderNo: orderNo
                            },
                            success: function(res) {
                                wx.hideLoading();
                                if (res.data.status == 200 && res.data.data) {
                                    that.setData({
                                        qrCode: res.data.data
                                    });
                                    wx.navigateTo({
                                        url: "../paymentResult/paymentResult?status=success&orderNo=" +
                                            orderNo +
                                            "&qrCode=" +
                                            '212121' + "&group=true" + "&productId=" + that.data.productId,
                                        success: function(res) {
                                            let couponIds = []
                                            that.data.product.list.map((value) => {
                                                couponIds.push(value.couponId)
                                            })
                                            tracking({
                                                activityId: that.data.product.product.activityId,
                                                coupon: couponIds.join(','),
                                                event: '07',
                                                eventState: that.data.type + '跳转成功'
                                            })
                                        },
                                        fail: function(res) {
                                            let couponIds = []
                                            that.data.product.list.map((value) => {
                                                couponIds.push(value.couponId)
                                            })
                                            tracking({
                                                activityId: that.data.product.product.activityId,
                                                coupon: couponIds.join(','),
                                                event: '07',
                                                eventState: that.data.type + '跳转失败'
                                            })
                                        }
                                    });

                                } else {
                                    wx.navigateTo({
                                        url: "../paymentResult/paymentResult?status=fail&orderNo=" +
                                            orderNo,
                                        success: function(res) {
                                            let couponIds = []
                                            that.data.product.list.map((value) => {
                                                couponIds.push(value.couponId)
                                            })
                                            tracking({
                                                activityId: that.data.product.product.activityId,
                                                coupon: couponIds.join(','),
                                                event: '07',
                                                eventState: that.data.type + '跳转成功'
                                            })
                                        },
                                        fail: function(res) {
                                            let couponIds = []
                                            that.data.product.list.map((value) => {
                                                couponIds.push(value.couponId)
                                            })
                                            tracking({
                                                activityId: that.data.product.product.activityId,
                                                coupon: couponIds.join(','),
                                                event: '07',
                                                eventState: that.data.type + '跳转失败'
                                            })
                                        }
                                    });
                                }
                            },
                            fail: function(res) {
                                wx.hideLoading();
                                wx.navigateTo({
                                    url: "../paymentResult/paymentResult?status=fail&orderNo=" +
                                        orderNo,
                                    success: function(res) {
                                        let couponIds = []
                                        that.data.product.list.map((value) => {
                                            couponIds.push(value.couponId)
                                        })
                                        tracking({
                                            activityId: that.data.product.product.activityId,
                                            coupon: couponIds.join(','),
                                            event: '07',
                                            eventState: that.data.type + '跳转成功'
                                        })
                                    },
                                    fail: function(res) {
                                        let couponIds = []
                                        that.data.product.list.map((value) => {
                                            couponIds.push(value.couponId)
                                        })
                                        tracking({
                                            activityId: that.data.product.product.activityId,
                                            coupon: couponIds.join(','),
                                            event: '07',
                                            eventState: that.data.type + '跳转失败'
                                        })
                                    }
                                });
                            }
                        });
                    }, 1000);
                },
                fail: function(error) {
                    wx.hideLoading();
                    wx.navigateTo({
                        url: '/rtmap/coupons/pages/orderDetail/orderDetail?orderNo=' + orderNo,
                        success: function(res) {
                            let couponIds = []
                            that.data.product.list.map((value) => {
                                couponIds.push(value.couponId)
                            })
                            tracking({
                                activityId: that.data.product.product.activityId,
                                coupon: couponIds.join(','),
                                event: '07',
                                eventState: that.data.type + '跳转成功'
                            })
                        },
                        fail: function(res) {
                            let couponIds = []
                            that.data.product.list.map((value) => {
                                couponIds.push(value.couponId)
                            })
                            tracking({
                                activityId: that.data.product.product.activityId,
                                coupon: couponIds.join(','),
                                event: '07',
                                eventState: that.data.type + '跳转失败'
                            })
                        }
                    });
                }
            });
        },

        /**
         * 弹出modal
         */
        showModal: function(modalType, message = "") {
            if (modalType && modalType !== "") {
                this.setData({
                    modalType: modalType,
                    showModal: true,
                    message
                });
            }
        },

        /**
         * 隐藏模态对话框
         */
        hideModal: function() {
            this.setData({
                showModal: false
            });
        },
        /**
         * 拦截弹窗点击事件
         */
        tapModalContent: function() {},
        /**
         * 查看其它优惠券
         */
        showOtherCoupons() {
            let couponIds = []
            this.data.product.list.map((value) => {
                couponIds.push(value.couponId)
            })
            tracking({
                activityId: this.data.product.product.activityId,
                coupon: couponIds.join(','),
                event: '14',
                eventState: this.data.type + '查询更多优惠券'
            })
            this.hideModal();
            if (this.data.isFromShare == 'true') {
                wx.switchTab({
                    url: '/pages/index/index',
                    complete: (res) => {
                        console.log(res)
                    }
                });
            } else {
                wx.navigateBack({
                    delta: 1
                });
            }
        }
    }
});