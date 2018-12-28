import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../utils/httpUtil.js'
import {
    tracking
} from '../../utils/track.js'
const app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        couponProduct: {
            type: Object,
            observer: '_onCouponChange'
        },
        shopDetail: {
            type: Array,
            value: [],
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
        modalType: '',
        distance: -1,
        qrCode: '',
        bbgFloor: '',
        isMove: false,
        isFromShare: false,
        collageList: [],
        coupon: {},
    },

    ready() {
        this.dialogMore = this.selectComponent('#dialogMore')
    },

    /**
     * 组件的方法列表
     */
    methods: {
        _onCouponChange(newVal) {
            this.setData({
                coupon: newVal.data,
            })
            console.log('_onCouponChange', newVal)
            httpWithParameter({
                endPoint: requestEndPoints.collageList,
                data: {
                    portalId: app.globalData.tenantId,
                    productId: newVal.id,
                    state: 0,
                    page: 1,
                    pageSize: 3,
                },
                success: (res) => {
                    this.flashList(res.data.data.list)
                },
                fail: (res) => {}
            })
        },

        flashList(list) {
            list.map((value) => {
                value.surplusTime = this.collageSurplusTime(value.createTime, value.expireTime)
            })

            this.setData({
                // collageList: list
                collageList: [{
                        "id": 1,
                        "memberCount": 0,
                        "followMemberCount": 2,
                        "createTime": 1537264482000,
                        "sponsorUser": {
                            "name": "ceshi",
                            "faceLogo": "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_86d58ae1.png"
                        },
                        "expireTime": 1440,
                        "status": null
                    },
                    {
                        "id": 2,
                        "memberCount": 0,
                        "followMemberCount": 1,
                        "createTime": 1537264482000,
                        "sponsorUser": {
                            "name": "lili",
                            "faceLogo": "https://ss0.bdstatic.com/5aV1bjqh_Q23odCf/static/superman/img/logo_top_86d58ae1.png"
                        },
                        "expireTime": 1440,
                        "status": null
                    }
                ]
            })
            setTimeout(() => {
                this.flashList(list)
            }, 1000)
        },

        collageSurplusTime(createTime, expireTime) {
            let date = new Date()
            let nowTime = date.getTime()
            let expire = expireTime * 60 * 1000
            let endTime = createTime + expire
            let surplusTime = endTime - nowTime
            if (surplusTime) {
                let surplusDate = new Date(surplusTime)
                let hour = surplusDate.getHours()
                if (hour > 24) {
                    let day = parseInt(hour / 24)
                    return `${day}天${hour % 24}:${surplusDate.getMinutes()}:${surplusDate.getSeconds()}`
                } else {
                    return `${hour}:${surplusDate.getMinutes()}:${surplusDate.getSeconds()}`
                }

            }
            return ''

        },
        //查看更多拼团
        onMoreCollageClick() {
            this.dialogMore.showDialog()
        },
        //去拼团
        onCollageClick(e) {
            let index = e.currentTarget.dataset.index
            wx.navigateTo({
                url: `../../pages/groupbuy/groupbuyDetail/groupbuyDetail?groupbuyId=${this.data.collageList[index].id}&type=${this.data.type}`,
                success: (res) => {
                    tracking({
                        activityId: this.data.coupon.product.activityId,
                        coupon: this.data.coupon.product.activityCouponId,
                        event: '07',
                        eventState: this.data.type + '跳转成功'
                    })
                },
                fail: (res) => {
                    tracking({
                        activityId: this.data.coupon.product.activityId,
                        coupon: this.data.coupon.product.activityCouponId,
                        event: '07',
                        eventState: this.data.type + '跳转失败'
                    })
                },
                complete: function(res) {},
            })
        },
        /**
         * 预支付处理 获取支付信息
         */
        prePay() {
            if (this.data.coupon.batchStatus == 6) {
                return
            }
            // coupon_fail_upper login coupon_success
            wx.setStorageSync('isCouponLogin', true)

            const isLogin = wx.getStorageSync('isLoginSucc')

            if (isLogin) {
                const that = this;

                wx.showLoading({
                    title: '',
                });

                postRequestWithParameter({
                    endPoint: requestEndPoints.buyCoupon + '?portalId=' + app.globalData.tenantId,
                    data: {
                        appId: app.globalData.appId,
                        openId: wx.getStorageSync('openid'),
                        productId: this.data.productId,
                    },
                    success: function(res) {
                        console.log('requestEndPoints.preOrder', res);
                        wx.hideLoading();
                        let data = res.data;

                        //服务器操作成功
                        if (data.status == 200) {
                            data = data.data;

                            //生成订单成功
                            if (data.code == 0) {
                                //付费券 调起微信支付
                                if (data.buyType == 2) {
                                    that.pay(data.payInfo, data.orderNo);
                                } else {
                                    //免费券 直接领取qr码
                                    that.setData({
                                        qrCode: data.qrCode
                                    });
                                    that.showModal('coupon_success');
                                }
                            } else {
                                //错误判断条件 
                                if (data.code == 2) {
                                    //领取上限
                                    that.showModal('coupon_fail_upper');
                                } else if (data.code == 1 || data.code == 13) {
                                    //库存不足
                                    that.showModal('coupon_fail_understock');
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
                                                tracking({
                                                    activityId: that.data.coupon.product.activityId,
                                                    coupon: that.data.coupon.product.activityCouponId,
                                                    event: '07',
                                                    eventState: that.data.type + '跳转成功'
                                                })
                                            } else if (res.cancel) {}
                                        }
                                    })
                                } else {
                                    wx.showToast({
                                        title: data.message,
                                        icon: 'none',
                                        duration: 2000
                                    });
                                }
                            }
                        } else {
                            wx.showToast({
                                title: data.message,
                                icon: 'none',
                                duration: 2000
                            });
                        }
                    },
                    fail: (res) => {
                        //请求失败
                        wx.hideLoading();

                        wx.showToast({
                            title: res.errMsg,
                            icon: 'none',
                            duration: 2000
                        });
                    }
                });
            } else {
                wx.navigateTo({
                    url: app.globalData.loginPath,
                    success: function(res) {
                        tracking({
                            activityId: that.data.coupon.product.activityId,
                            coupon: that.data.coupon.product.activityCouponId,
                            event: '07',
                            eventState: that.data.type + '跳转成功'
                        })
                    },
                    fail: function(res) {
                        tracking({
                            activityId: that.data.coupon.product.activityId,
                            coupon: that.data.coupon.product.activityCouponId,
                            event: '07',
                            eventState: that.data.type + '跳转失败'
                        })
                    }
                });
            }
        },

        /**
         * 支付处理 调起微信支付
         */
        pay(payInfo, orderNo) {

            const that = this;

            wx.requestPayment({
                timeStamp: payInfo.timeStamp.toString(),
                nonceStr: payInfo.nonceStr,
                package: payInfo.prePackage,
                signType: payInfo.signType,
                paySign: payInfo.paySign,
                success: function(res) {
                    wx.showLoading({
                        title: '查询订单中...',
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
                                        url: '../paymentResult/paymentResult?status=success&orderNo=' + orderNo + '&qrCode=' + res.data.data,
                                        success: function(res) {
                                            tracking({
                                                activityId: that.data.coupon.product.activityId,
                                                coupon: that.data.coupon.product.activityCouponId,
                                                event: '07',
                                                eventState: that.data.type + '跳转成功'
                                            })
                                        },
                                        fail: function(res) {
                                            tracking({
                                                activityId: that.data.coupon.product.activityId,
                                                coupon: that.data.coupon.product.activityCouponId,
                                                event: '07',
                                                eventState: that.data.type + '跳转失败'
                                            })
                                        }
                                    });
                                } else {
                                    wx.navigateTo({
                                        url: '../paymentResult/paymentResult?status=fail&orderNo=' + orderNo,
                                        success: function(res) {
                                            tracking({
                                                activityId: that.data.coupon.product.activityId,
                                                coupon: that.data.coupon.product.activityCouponId,
                                                event: '07',
                                                eventState: that.data.type + '跳转成功'
                                            })
                                        },
                                        fail: function(res) {
                                            tracking({
                                                activityId: that.data.coupon.product.activityId,
                                                coupon: that.data.coupon.product.activityCouponId,
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
                                    url: '../paymentResult/paymentResult?status=fail&orderNo=' + orderNo,
                                    success: function(res) {
                                        tracking({
                                            activityId: that.data.coupon.product.activityId,
                                            coupon: that.data.coupon.product.activityCouponId,
                                            event: '07',
                                            eventState: that.data.type + '跳转成功'
                                        })
                                    },
                                    fail: function(res) {
                                        tracking({
                                            activityId: that.data.coupon.product.activityId,
                                            coupon: that.data.coupon.product.activityCouponId,
                                            event: '07',
                                            eventState: that.data.type + '跳转失败'
                                        })
                                    }
                                });
                            }
                        });
                    }, 1000)
                },
                fail: function(error) {
                    wx.hideLoading();

                    wx.navigateTo({
                        url: '../paymentResult/paymentResult?status=fail&orderNo=' + orderNo,
                        success: function(res) {
                            tracking({
                                activityId: that.data.coupon.product.activityId,
                                coupon: that.data.coupon.product.activityCouponId,
                                event: '07',
                                eventState: that.data.type + '跳转成功'
                            })
                        },
                        fail: function(res) {
                            tracking({
                                activityId: that.data.coupon.product.activityId,
                                coupon: that.data.coupon.product.activityCouponId,
                                event: '07',
                                eventState: that.data.type + '跳转失败'
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

            wx.navigateBack({
                delta: 1,
            })
        },

        /**
         * 使用优惠券
         */
        useCoupon() {
            this.hideModal();
            tracking({
                activityId: this.data.coupon.product.activityId,
                coupon: this.data.coupon.product.activityCouponId,
                event: '07',
                eventState: this.data.type + '跳转使用优惠券'
            })
            wx.navigateTo({
                url: '../couponInfo/couponInfo?qrCode=' + this.data.qrCode
            })
        },
        /**
         * 查询更多商铺
         */
        queryMoreShops() {
            tracking({
                activityId: this.data.coupon.product.activityId,
                coupon: this.data.coupon.product.activityCouponId,
                event: '14',
                eventState: this.data.type + '查询店铺成功'
            })
            wx.navigateTo({
                url: "../shopsList/shopsList?couponId=" + this.data.coupon.product.couponId,
                // url: '../shopsList/shopsList?shops=' + JSON.stringify(this.data.shopDetail),
                success: function(res) {},
                fail: function(res) {}
            })
        },

        /**
         * 导航到店铺
         */
        navigationToShop() {
            let that = this
            tracking({
                activityId: that.data.coupon.product.activityId,
                coupon: that.data.coupon.product.activityCouponId,
                event: '14',
                eventState: that.data.type + '跳转福利地图'
            })
            const shop = this.data.shopDetail[0];
            if (shop.buildId && shop.floorId && shop.x && shop.y && shop.poiNo) {
                wx.navigateTo({
                    url: '../webView/webView?linkType=map&buildid=' + shop.buildId + '&floor=' + shop.floorId + '&x=' + shop.x + '&y=' + shop.y + '&poiNo=' + shop.poiNo,
                    success: function(res) {},
                    fail: function(res) {}
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

        /**
         * 查看更多优惠券
         */
        showMoreCoupons: function() {
            wx.navigateBack({
                delta: 1,
            })
        },

        /**
         * 弹出modal
         */
        showModal: function(modalType) {
            if (modalType && modalType !== '') {
                this.setData({
                    modalType: modalType,
                    showModal: true,
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
                coupon: this.data.coupon.product.activityCouponId,
                event: '12',
                eventState: this.data.type + '拨打电话'
            })
            if (this.data.shopDetail[0].mobile) {
                wx.makePhoneCall({
                    phoneNumber: this.data.shopDetail[0].mobile,
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

        //页面滑动监听
        onPageMove(res) {
            console.log('onPageMove', res)
            this.setData({
                isMove: true,
            })
        },

        //页面滑动结束监听
        onPageEnd() {
            setTimeout(() => {
                this.setData({
                    isMove: false,
                })
            }, 500)
        },
    }
})