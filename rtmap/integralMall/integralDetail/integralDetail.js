// pages/couponDetail/couponDetail.js
var burialPoint = require('../../coupons/utils/track.js')
var contact = require('../contact.js')
const app = getApp();
var shopIndex = -1
var pid = ''
var activity = ''
Page({
    //埋点数据
    title: '商品详情',
    /**
     * 页面的初始数据
     */
    data: {
        goods: {},
        list: [{
            logo: '../images/call.png',
            title: 'COACH三里屯店',
            floor: 'L3-31A',
            phone: '123456'
        }],

        isDialogShow: false,

        payResult: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.dialog = this.selectComponent('#dialog')
        pid = options.pid
        activity = options.activity
    },

    onShow() {
        this.getDetail()
    },

    getDetail() {
        contact.postWithParameter({
            endPoint: 'curl_api_once',
            data: {
                activity: activity,
                pid: pid,
                status: 'ZHT_YX',
            },
            success: (data) => {
                let respData = data.data
                if (respData.code == 200) {
                    burialPoint.tracking({
                        productId: contact.productId,
                        event: '06',
                        activityId: respData.data.activity_id,
                        coupon: pid,
                        eventState: '进入成功'
                    })
                    respData.data.content = respData.data.content ? respData.data.content.replace(/<img/g, '<img class="descClauseImg"') : ''
                    this.setData({
                        goods: respData.data
                    })
                } else {
                    contact.toast({
                        title: respData.msg
                    })
                }
            },
            fail: (data) => {
                contact.toast({
                    title: '获取详情失败'
                })
            }
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage(options) {

        return {
            path: '/rtmap/integralMall/integralDetail/integralDetail?pid=' + this.data.goods.pid + '&activity=' + this.data.goods.activity_id,
            success: (res) => {
                burialPoint.tracking({
                    productId: contact.productId,
                    event: '02',
                    activityId: this.data.goods.activity_id,
                    coupon: pid,
                    eventState: '转发成功'
                })
            },
            fail: (res) => {
                burialPoint.tracking({
                    productId: contact.productId,
                    event: '02',
                    activityId: this.data.goods.activity_id,
                    coupon: pid,
                    eventState: '转发失败'
                })
            }
        }
    },
    //店铺详情
    onShopClick(data) {
        shopIndex = data.currentTarget.dataset.index

    },

    onCallClick(data) {
        wx.makePhoneCall({
            phoneNumber: '1340000' //仅为示例，并非真实的电话号码
        })
    },

    onGoClick(data) {
    },

    //查看所有店铺
    onShowAllClick() {
        if (this.data.list.length == 1)
            this.setData({
                list: this.data.goods.shopList
            })
    },

    onPayClick() {
        this.setData({
            isDialogShow: true
        })
    },

    pay() {
        contact.postWithParameter({
            endPoint: 'integral_delete',
            data: {
                activity: this.data.goods.activity_id,
                main: this.data.goods.main,
                shop_id: this.data.goods.shop_id,
                pid: this.data.goods.pid,
                couponID: this.data.goods.coupon_id,
                status: 'ZHT_YX',
            },
            success: (data) => {
                let respData = data.data
                if (respData.code == 200) {
                    this.setData({
                        isDialogShow: false
                    })
                    burialPoint.tracking({
                        productId: contact.productId,
                        event: '05',
                        eventState: '兑换成功',
                        activityId: this.data.goods.activity_id,
                        coupon: pid
                    })
                    this.setData({
                        payResult: {
                            content: '恭喜，兑换成功',
                            leftText: '查看优惠券',
                            rightText: '继续兑换',
                            type: 1
                        }
                    })
                    this.dialog.showDialog()

                } else {
                    burialPoint.tracking({
                        productId: contact.productId,
                        event: '05',
                        eventState: '兑换失败',
                        activityId: this.data.goods.activity_id,
                        coupon: pid
                    })
                    this.setData({
                        payResult: {
                            content: respData.msg,
                            leftText: '',
                            rightText: '看看其他的',
                            type: 0
                        }
                    })
                    this.dialog.showDialog()
                }
            },
            fail: (data) => {
                burialPoint.tracking({
                    productId: contact.productId,
                    event: '05',
                    eventState: '兑换失败',
                    activityId: this.data.goods.activity_id,
                    coupon: pid
                })
                this.setData({
                    payResult: {
                        content: '兑换失败',
                        leftText: '',
                        rightText: '看看其他的',
                        type: 0
                    }
                })
                this.dialog.showDialog()
            }
        })
    },

    //取消兑换
    onCancleClick() {
        this.setData({
            isDialogShow: false
        })
    },

    //兑换
    onExcellClick() {
        if (!wx.getStorageSync('isLoginSucc')) {
            wx.navigateTo({
                url: app.globalData.loginPath,
                success: function(res) {
                    burialPoint.tracking({
                        activityId: this.data.goods.activity_id ? this.data.goods.activity_id : '',
                        coupon: pid,
                        productId: contact.productId,
                        event: '07',
                        eventState: '跳转成功'
                    })
                },
                fail: function(res) {
                    burialPoint.tracking({
                        activityId: this.data.goods.activity_id ? this.data.goods.activity_id : '',
                        coupon: pid,
                        productId: contact.productId,
                        event: '07',
                        eventState: '跳转失败'
                    })
                },
                complete: function(res) {},
            })
        }
        this.setData({
            isDialogShow: false
        })
        this.pay()
    },

    //弹窗左按钮
    onLeftClick() {
        this.dialog.hideDialog()
        wx.navigateTo({
            url: '/rtmap/coupons/pages/couponList/couponList',
            success: function(res) {
                burialPoint.tracking({
                    activityId: this.data.goods.activity_id ? this.data.goods.activity_id : '',
                    coupon: pid,
                    productId: contact.productId,
                    event: '07',
                    eventState: '跳转成功'
                })
            },
            fail: function(res) {
                burialPoint.tracking({
                    activityId: this.data.goods.activity_id ? this.data.goods.activity_id:'',
                    coupon: pid,
                    productId: contact.productId,
                    event: '07',
                    eventState: '跳转失败'
                })
            }
        })
    },
    //弹窗右按钮
    onRightClick() {
        this.dialog.hideDialog()
        wx.navigateBack({
            delta: 1,
        })
    },
})