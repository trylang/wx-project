// couponM/components/couponNormal/couponNormal.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from "../../utils/httpUtil.js";
import util from '../../utils/util.js';
const app = getApp();
let selOrderNo = "";
import {
    tracking
} from '../../utils/track.js'
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        coupon: {
            type: Object
            // observer: (newVal) => {
            // }
        },
        shopDetail: {
            type: Array,
            value: []
        },
        productId: {
            type: String,
            value: ""
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
        showModal: false, //不要通过直接设置来控制modal显示，而是通过showModal方法
        modalType: "",
        buttonClicked: 'no',
        distance: -1,
        qrCode: "",
        bbgFloor: "",
        isMove: false,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 预支付处理 获取支付信息
         */
        prePay() {
            tracking({
                activityId: this.data.coupon.product.activityId,
                coupon: this.data.coupon.product.couponId,
                event: '18',
                eventState: this.data.type + '点击领取'
            })
            const isLogin = wx.getStorageSync("isLoginSucc");
            if (!isLogin) {
                wx.navigateTo({
                    url: app.globalData.loginPath + '?sourceid=' + this.data.coupon.product.activityId,
                    success: (res) => {
                        tracking({
                            activityId: this.data.coupon.product.activityId,
                            coupon: this.data.coupon.product.couponId,
                            event: '07',
                            eventState: this.data.type + '跳转登录成功'
                        })
                    },
                    fail: (res) => {
                        tracking({
                            activityId: this.data.coupon.product.activityId,
                            coupon: this.data.coupon.product.couponId,
                            event: '07',
                            eventState: this.data.type + '跳转失败'
                        })
                    }
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
                            selOrderNo = data.orderNo;
                            if (data.buyType == 2) {
                                this.pay(data.payInfo, data.orderNo);
                            } else {
                                console.log(data);
                                //免费券 直接领取qr码
                                httpWithParameter({
                                    endPoint: requestEndPoints.orderDetail,
                                    data: {
                                        openId: wx.getStorageSync("openid"),
                                        portalId: app.globalData.tenantId,
                                        orderNo: selOrderNo
                                    },
                                    success: res => {

                                        if (res.data.status == 200) {
                                            tracking({
                                                activityId: this.data.coupon.product.activityId,
                                                coupon: this.data.coupon.product.couponId,
                                                event: '18',
                                                eventState: this.data.type + '领取成功'
                                            })
                                            let data = res.data.data;
                                            this.setData({
                                                qrCode: data.products.length > 0 ? data.products[0].qrCode : 0
                                            });
                                            this.showModal("coupon_success");
                                        } else {
                                            tracking({
                                                activityId: this.data.coupon.product.activityId,
                                                coupon: this.data.coupon.product.couponId,
                                                event: '18',
                                                eventState: this.data.type + '领取失败'
                                            })
                                        }
                                    },
                                    fail: res => {
                                        tracking({
                                            activityId: this.data.coupon.product.activityId,
                                            coupon: this.data.coupon.product.couponId,
                                            event: '18',
                                            eventState: this.data.type + '领取失败'
                                        })
                                        wx.showToast({
                                            title: data.message,
                                            icon: "none",
                                            duration: 2000
                                        });
                                    }
                                });
                            }
                        } else {
                            //错误判断条件
                            if (data.code == 2) {
                                //领取上限
                                this.showModal("coupon_fail_upper");
                            } else if (data.code == 1 || data.code == 13) {
                                //库存不足
                                this.showModal("coupon_fail_understock");
                            } else if (data.code == 19) { // 存在未支付订单，请先进行支付
                                wx.showModal({
                                    title: '提示',
                                    content: data.message,
                                    confirmText: '去支付',
                                    success: (res) => {
                                        if (res.confirm) {
                                            wx.navigateTo({
                                                url: '/rtmap/coupons/pages/orderDetail/orderDetail?orderNo=' + data.orderNo,
                                            })
                                            tracking({
                                                activityId: this.data.coupon.product.activityId,
                                                coupon: this.data.coupon.product.couponId,
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
        pay: function(payInfo, orderNo) {
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
                                openId: wx.getStorageSync("openid"),
                                portalId: app.globalData.tenantId,
                                orderNo: orderNo
                            },
                            success: function(res) {
                                wx.hideLoading();
                                if (res.data.status == 200 && res.data.data) {
                                    that.setData({
                                        qrCode: res.data.data.products.length > 0 ?
                                            res.data.data.products[0].qrCode : ""
                                    });
                                    wx.navigateTo({
                                        url: "../paymentResult/paymentResult?status=success&orderNo=" +
                                            orderNo +
                                            "&qrCode=" +
                                            that.data.qrCode,
                                        success: function(res) {
                                            tracking({
                                                activityId: that.data.coupon.product.activityId,
                                                coupon: that.data.coupon.product.couponId,
                                                event: '07',
                                                eventState: this.data.type + '跳转成功'
                                            })
                                        },
                                        fail: function(res) {
                                            tracking({
                                                activityId: that.data.coupon.product.activityId,
                                                coupon: that.data.coupon.product.couponId,
                                                event: '07',
                                                eventState: this.data.type + '跳转失败'
                                            })
                                        }
                                    });
                                } else {
                                    wx.navigateTo({
                                        url: "../paymentResult/paymentResult?status=fail&orderNo=" +
                                            orderNo,
                                        success: function(res) {
                                            tracking({
                                                activityId: that.data.coupon.product.activityId,
                                                coupon: that.data.coupon.product.couponId,
                                                event: '07',
                                                eventState: this.data.type + '跳转成功'
                                            })
                                        },
                                        fail: function(res) {
                                            tracking({
                                                activityId: that.data.coupon.product.activityId,
                                                coupon: that.data.coupon.product.couponId,
                                                event: '07',
                                                eventState: this.data.type + '跳转失败'
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
                                        tracking({
                                            activityId: that.data.coupon.product.activityId,
                                            coupon: that.data.coupon.product.couponId,
                                            event: '07',
                                            eventState: this.data.type + '跳转成功'
                                        })
                                    },
                                    fail: function(res) {
                                        tracking({
                                            activityId: that.data.coupon.product.activityId,
                                            coupon: that.data.coupon.product.couponId,
                                            event: '07',
                                            eventState: this.data.type + '跳转失败'
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
                            tracking({
                                activityId: that.data.coupon.product.activityId,
                                coupon: that.data.coupon.product.couponId,
                                event: '07',
                                eventState: this.data.type + '跳转成功'
                            })
                        },
                        fail: function(res) {
                            tracking({
                                activityId: that.data.coupon.product.activityId,
                                coupon: that.data.coupon.product.couponId,
                                event: '07',
                                eventState: this.data.type + '跳转失败'
                            })
                        }
                    });
                }
            });
        },
        /**
         * 查看其它优惠券
         */
        showOtherCoupons: function() {
            this.hideModal();
            if (this.data.isFromShare == 'true') {
                wx.switchTab({
                    url: '/pages/index/index'
                });
            } else {
                wx.navigateBack({
                    delta: 1
                });
            }
        },
        /**
         * 使用优惠券
         */
        useCoupon() {
            this.hideModal();
            wx.navigateTo({
                url: "../couponInfo/couponInfo?qrCode=" + this.data.qrCode,
                success: (res) => {
                    tracking({
                        activityId: this.data.coupon.product.activityId,
                        coupon: this.data.coupon.product.couponId,
                        event: '07',
                        eventState: this.data.type + '跳转成功'
                    })
                },
                fail: (res) => {
                    tracking({
                        activityId: this.data.coupon.product.activityId,
                        coupon: this.data.coupon.product.couponId,
                        event: '07',
                        eventState: this.data.type + '跳转失败'
                    })
                }
            });
        },
        /**
         * 查询更多商铺
         */
        queryMoreShops() {
            wx.navigateTo({
                url: "../shopsList/shopsList?couponId=" + this.data.coupon.product.couponId,
                // url:
                //   "../shopsList/shopsList?shops=" +
                //   JSON.stringify(this.data.shopDetail),
                success: (res) => {
                    tracking({
                        activityId: this.data.coupon.product.activityId,
                        coupon: this.data.coupon.product.couponId,
                        event: '07',
                        eventState: this.data.type + '跳转成功'
                    })
                },
                fail: (res) => {
                    tracking({
                        activityId: this.data.coupon.product.activityId,
                        coupon: this.data.coupon.product.couponId,
                        event: '07',
                        eventState: this.data.type + '跳转失败'
                    })
                }
            });
        },

        /**
         * 导航到店铺
         */
        navigationToShop() {
            tracking({
                activityId: this.data.coupon.product.activityId,
                coupon: this.data.coupon.product.couponId,
                event: '07',
                eventState: this.data.type + '跳转福利地图'
            })
            const shop = this.data.shopDetail[0];
            if (shop.buildId && shop.floorId && shop.x && shop.y && shop.poiNo) {
                wx.navigateTo({
                    url: "../webView/webView?linkType=map&buildid=" +
                        shop.buildId +
                        "&floor=" +
                        shop.floorId +
                        "&x=" +
                        shop.x +
                        "&y=" +
                        shop.y +
                        "&poiNo=" +
                        shop.poiNo,
                    success: function(res) {},
                    fail: function(res) {}
                });
            } else {
                wx.showToast({
                    title: "找不到店铺",
                    icon: "none",
                    duration: 2000,
                    mask: true
                });
            }
        },

        /**
         * 查看更多优惠券
         */
        showMoreCoupons() {
            tracking({
                activityId: this.data.coupon.product.activityId,
                coupon: this.data.coupon.product.couponId,
                event: '14',
                eventState: this.data.type + '查询更多优惠券'
            })
            wx.navigateBack({
                delta: 1
            });
        },

        /**
         * 弹出modal
         */
        showModal(modalType) {
            if (modalType && modalType !== "") {
                this.setData({
                    modalType: modalType,
                    showModal: true
                });
            }
        },

        /**
         * 弹出框蒙层截断touchmove事件
         */
        preventTouchMove: function(e) {},

        /**
         * 拦截弹窗点击事件
         */
        tapModalContent: function() {},

        /**
         * 隐藏模态对话框
         */
        hideModal() {
            this.setData({
                showModal: false
            });
        },

        onCallClick() {
            tracking({
                activityId: this.data.coupon.product.activityId,
                coupon: this.data.coupon.product.couponId,
                event: '12',
                eventState: this.data.type + '拨打电话'
            })
            if (this.data.shopDetail[0].mobile) {
                wx.makePhoneCall({
                    phoneNumber: this.data.shopDetail[0].mobile
                });
            } else {
                wx.showToast({
                    title: "该商家没有电话",
                    icon: "none",
                    duration: 2000,
                    mask: true,
                    success: function(res) {},
                    fail: function(res) {},
                    complete: function(res) {}
                });
            }
        },

        //页面滑动监听
        onPageMove(res) {
            console.log("onPageMove", res);
            this.setData({
                isMove: true
            });
        },

        //页面滑动结束监听
        onPageEnd() {
            setTimeout(() => {
                this.setData({
                    isMove: false
                });
            }, 500);
        }
    }
});