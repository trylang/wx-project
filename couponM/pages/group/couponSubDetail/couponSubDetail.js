// pages/couponDetail/couponDetail.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../../utils/httpUtil.js'
import {
  tracking
} from '../../../utils/track.js'
const util = require('../../../utils/util.js')
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        coupon: {},
        distance: -1,
        qrCode: '',
        isMove: false,
        isFromShare: false,
        shopDetail: [],
        subProId:0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        if (options.isFromShare) {
            this.setData({
                isFromShare: options.isFromShare == 'true',
            })
        }
        this.setData({
            subProId: options.subProductId
        })
        this.getDetail(options.subProductId)
    },
    /**
     * 获取详情数据
     */

    getDetail(id) {
        httpWithParameter({
            endPoint: requestEndPoints.couponSubDetail,
            data: {
                portalId: app.globalData.tenantId,
                subProductId: id,
            },
            success: (res) => {
                if (res.data.status == 200) {
                    let detail = res.data.data.data
                    //加载适用店铺
                    this.loadShops(detail.id)

                    detail.imgtxtInfo = util.formatImgTxt(detail.imgtxtInfo)
                    if (detail.effectiveType == 0) {
                        detail.validTime = `${detail.effectiveStartTime} 至 ${detail.effectiveEndTime}`
                    } else if (detail.effectiveType == 1) {
                        detail.validTime = detail.activedLimitedStartDay == 0 ? `领取后当天生效,有效期${detail.activedLimitedDays}天` : `领取${detail.activedLimitedStartDay}天后生效,有效期${detail.activedLimitedDays}天`
                    } else {
                        detail.validTime = ''
                    }
                    this.setData({
                        coupon: detail,
                    })
                }
            },
            fail: (res) => {
            }
        });
    },
    /**
     * 加载商铺列表
     */
    loadShops(id) {
        httpWithParameter({
            endPoint: requestEndPoints.shops,
            data: {
                portalId: app.globalData.tenantId,
                couponId: id,
            },
            success: (res) => {
                this.setData({
                    shopDetail: res.data.status == 200 ? res.data.data.list : []
                })
            },
            fail: (res) => {
            }
        });
    },

    /**
     * 页面出现
     */
    onShow() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(options) {
      tracking({
          activityId: this.data.coupon.activityId,
          coupon: this.data.coupon.id,
        event: '02',
        eventState: '转发'
      })
        let currentPage = getCurrentPages()[getCurrentPages().length - 1].route
        return {
            title: this.data.coupon ? this.data.coupon.mainInfo : '',
            path: `${currentPage}?isFromShare=true&subProductId=${this.data.subProId}`,
            success: function(res) { },
            fail: function(res) { }
        }
    },

    /**
     * 查询更多商铺
     */
    queryMoreShops: function() {
        tracking({
            activityId: this.data.coupon.activityId,
            coupon: this.data.coupon.id,
            event: '07',
            eventState: '跳转店铺列表'
        })
        wx.navigateTo({
            // url: "../shopsList/shopsList?couponId=" + this.data.coupon.product.couponId,
            url: '../../shopsList/shopsList?shops=' + JSON.stringify(this.data.shopDetail),
            success: function(res) {
            },
            fail: function(res) {
            }
        })
    },

    /**
     * 导航到店铺
     */
    navigationToShop: function() {
        const shop = this.data.shopDetail[0];
        if (shop.buildId && shop.floorId && shop.x && shop.y && shop.poiNo) {
            tracking({
                activityId: this.data.coupon.activityId,
                coupon: this.data.coupon.id,
                event: '07',
                eventState: '跳转福利地图'
            })
            wx.navigateTo({
                url: '../../webView/webView?linkType=map&buildid=' + shop.buildId + '&floor=' + shop.floorId + '&x=' + shop.x + '&y=' + shop.y + '&poiNo=' + shop.poiNo,
                success: function(res) {
                },
                fail: function(res) {
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

    onCallClick() {
      tracking({
          activityId: this.data.coupon.activityId,
          coupon: this.data.coupon.id,
        event: '12',
        eventState: '拨打电话'
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

    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove: function(e) {},

    /**
     * 拦截弹窗点击事件
     */
    tapModalContent: function() {},

    //页面滑动监听
    onPageMove(res) {
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
})