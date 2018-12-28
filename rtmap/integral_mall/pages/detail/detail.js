const app = getApp()
const cid = wx.getStorageSync('member').cid;
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../../coupons/utils/httpUtil.js';
import {
  tracking
} from '../../../coupons/utils/track.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        detailInfo: {},
        couponId: '',
        newCardId: '',
        isDialogShow: false,
        isDialogSucess: false,
        showText: '恭喜您，兑换成功',
        lookList: false,
        collected: false,
        QrCode: '',
        activityId:'',
        isFromShare: 'false',
        isMove: false,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            isFromShare: options.isFromShare || 'false',
        })
        this.setData({ couponId: options.couponId,activityId: options.activityId})
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
        if (!wx.getStorageSync('member')) {
            wx.navigateTo({
                url: `${app.globalData.loginPath}?sourceid=${this.data.activityId}&from=积分商城`
            })
            return;
        }
        this.getCardId();

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
    handleLinkIndex() {
        tracking({
            event: '07',
            eventState: '返回首页'
        })
        wx.switchTab({
            url: '/pages/index/index',
            success: function (res) {
            },
            fail: function (res) {
            }
        })
    },
    getIsCollect: function () {
        var that = this;
        httpWithParameter({
            endPoint: requestEndPoints.isCollection,
            data: {
                portalId: app.globalData.tenantId,
                openId: wx.getStorageSync('openid'),
                productId: that.data.detailInfo.id
            },
            success(res) {
                if (res.data.status == 200) {
                    that.setData({ collected: res.data.data.isCollection });
                }
            }
        })
    },
    collectHandler: function () {//收藏
        tracking({
            activityId: this.data.detailInfo && this.data.detailInfo.activityId,
            coupon: this.data.detailInfo && this.data.detailInfo.couponId,
            event: '12',
            eventState: '点击收藏'
        })
        var that = this;
        if (that.data.collected == false) {
            that.setData({ collected: true });
        } else {
            that.setData({ collected: false });
        }
        let requestData = {
            portalId: app.globalData.tenantId,
            openId: wx.getStorageSync('openid'),
            productId: that.data.detailInfo.id,
            action: that.data.collected == false ? 2 : 1
        }
        postRequestWithParameter({
            endPoint: requestEndPoints.collection,
            data: requestData,
            success: (res) => {
                tracking({
                    activityId: this.data.detailInfo && this.data.detailInfo.activityId,
                    coupon: this.data.detailInfo && this.data.detailInfo.couponId,
                    event: '12',
                    eventState: requestData.action == 1 ? '收藏成功' : '取消收藏'
                })
                if (res.data.status == 200) {
                    wx.showToast({
                        title: requestData.action == 1 ? '收藏成功' : '已取消收藏',
                        icon: 'none'
                    })

                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                })
            }
        })
    },
    getCardId: function () {
        var that = this;
        httpWithParameter({
            endPoint: requestEndPoints.cardInfo,
            data: {
                portalId: app.globalData.tenantId,
                openId: wx.getStorageSync('openid'),
                cid: cid
            },
            success(res) {
                if (res.data.status == 200) {
                    that.setData({ newCardId: res.data.data.cardId });
                }
                that.getDetailInfo();
            }
        })
    },
    getDetailInfo: function () {
        var that = this, info = {}, newPrice = '', isGray = false, originalPrice = '';
        httpWithParameter({
            endPoint: requestEndPoints.detailInfo,
            data: {
                portalId: app.globalData.tenantId,
                couponId: that.data.couponId
            },
            success(res) {
                if (res.data.status == 200) {
                    let item = res.data.data;
                    if (item.product.gradePrice && item.product.gradePrice.length > 0) {
                        item.product.gradePrice.map(items => {
                            if (items.cardId == that.data.newCardId) {
                                newPrice = items.price;
                                isGray = false;
                            }
                        })
                        if (!newPrice) {
                            newPrice = item.product.gradePrice[0].price;
                            isGray = true;
                        }else{
                            isGray = false;
                        }
                    }
                    if (item.batch.categoryId == 1 || item.batch.categoryId == 6 || item.batch.categoryId == 7) {
                        //礼品券 免费试吃试用 单品优惠
                        originalPrice = item.batch.unitPrice;
                    } else if (item.batch.categoryId == 2 || item.batch.categoryId == 9) {
                        //代金券 通用券
                        originalPrice = item.batch.facePrice;
                    } else {
                        originalPrice = 0;
                    }
                    if (item.batch.imgtxtInfo) {
                        item.batch.imgtxtInfo = JSON.parse(item.batch.imgtxtInfo);
                        if (Array.isArray(item.batch.imgtxtInfo)){
                            item.batch.imgtxtInfo = item.batch.imgtxtInfo.map(function (item) {
                                if (typeof item == "string") {
                                    return item.replace(/img/g, 'img class="descClauseImg"').replace(/<font/g, '<span').replace(/<\/font>/g, '</span>');
                                } else {
                                    var html = "";
                                    if (item.img) {
                                        html = `<img class="descClauseImg" src="${item.img}"><div class="message_content">${item.html.replace(/<font/g, '<span').replace(/<\/font>/g, '</span>')}</div>`
                                    } else {
                                        html = item.html.replace(/<font/g, '<span').replace(/<\/font>/g, '</span>');
                                    }
                                    return html
                                }
                            });
                        }
                    }
                    info = {
                        activityId: item.product.activityId,
                        couponId: item.product.couponId,
                        id: item.product.id,
                        imgLogoUrl: item.batch.couponImageList.length > 0 ? item.batch.couponImageList[0].imgUrl : item.batch.imgLogoUrl,
                        mainInfo: item.batch.mainInfo,
                        extendInfo: item.batch.extendInfo,
                        getLimit: item.product.getLimit,
                        type: item.product.type,
                        gradePrice: item.product.gradePrice,
                        descClause: item.batch.descClause ? item.batch.descClause : '无',
                        imgtxtInfo: item.batch.imgtxtInfo,
                        validateStatus: item.batch.validateStatus,
                        categoryId: item.batch.categoryId,
                        categoryDesc: item.batch.categoryDesc,
                        isGray: isGray,
                        price: item.product.type == 1 ? item.product.price : newPrice,
                        originalPrice: originalPrice ? originalPrice / 100 : 0
                    }
                    that.setData({ detailInfo: info });
                    that.getIsCollect();
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        })
    },
    showPayDialog: function () {
        this.setData({
            isDialogShow: true
        })
    },
    //兑换
    onExcellClick: function () {
        var that = this;
        tracking({
            activityId: that.data.detailInfo&&that.data.detailInfo.activityId,
            coupon: that.data.detailInfo &&that.data.detailInfo.couponId,
            event: '12',
            eventState: '点击兑换'
        })
        let requestData = {
            portalId: app.globalData.tenantId,
            openId: wx.getStorageSync('openid'),
            appId: app.globalData.appID,
            productId: that.data.detailInfo.id,
            channelId: -1,
            cid: cid
        }
        postRequestWithParameter({
            endPoint: requestEndPoints.buyCoupon,
            data: requestData,
            success: (res) => {
                if (res.data.status == '200') {
                    tracking({
                        activityId: that.data.detailInfo && that.data.detailInfo.activityId,
                        coupon: that.data.detailInfo && that.data.detailInfo.couponId,
                        event: '18',
                        eventState: '兑换成功'
                    })
                    this.setData({ isDialogShow: false })
                    this.setData({ showText: '恭喜您，兑换成功' })
                    this.setData({ lookList: false })
                    this.setData({ isDialogSucess: true })
                    this.setData({ QrCode: res.data.data.QrCode })
                } else if (res.data.status == '-1') {
                    tracking({
                        activityId: that.data.detailInfo && that.data.detailInfo.activityId,
                        coupon: that.data.detailInfo && that.data.detailInfo.couponId,
                        event: '18',
                        eventState: '兑换失败'
                    })
                    this.setData({ lookList: true })
                    this.setData({ showText: '您的积分不足' })
                    this.setData({ isDialogSucess: true })
                } else {
                    tracking({
                        activityId: that.data.detailInfo && that.data.detailInfo.activityId,
                        coupon: that.data.detailInfo && that.data.detailInfo.couponId,
                        event: '18',
                        eventState: '兑换失败'
                    })
                    this.setData({ lookList: true })
                    this.setData({ showText: res.data.message })
                    this.setData({ isDialogSucess: true })
                }
            },
            fail: (res) => {
                this.setData({ isDialogShow: false })
                wx.showToast({
                    title: res.errMsg,
                    icon: 'none'
                })
            }
        })
    },
    enterListHandler () {//跳转到列表页
      tracking({
          activityId: this.data.detailInfo && this.data.detailInfo.activityId,
          coupon: this.data.detailInfo && this.data.detailInfo.couponId,
        event: '07',
        eventState: '跳转列表页'
      })
        wx.navigateBack({
            url: '../index/index'
        });
    },
    enterUseHandler () {//去使用券
      tracking({
          activityId: this.data.detailInfo && this.data.detailInfo.activityId,
          coupon: this.data.detailInfo && this.data.detailInfo.couponId,
        event: '07',
        eventState: '跳转优惠券信息'
      })
        wx.navigateTo({
            url: "../../../../couponM/pages/couponInfo/couponInfo?qrCode=" + this.data.QrCode,
            success: function success(res) { },
            fail: function fail(res) { }

        });
    },
    onCancleClick () {//取消兑换
      tracking({
          activityId: this.data.detailInfo && this.data.detailInfo.activityId,
          coupon: this.data.detailInfo && this.data.detailInfo.couponId,
        event: '12',
        eventState: '点击取消兑换'
      })
        this.setData({
            isDialogShow: false
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage () {
      tracking({
          activityId: this.data.detailInfo && this.data.detailInfo.activityId,
          coupon: this.data.detailInfo && this.data.detailInfo.couponId,
        event: '02',
        eventState: '转发'
      })
        return {
            path: '/rtmap/integral_mall/pages/detail/detail?couponId=' + this.data.couponId + "&isFromShare=true"
        }
    }
})