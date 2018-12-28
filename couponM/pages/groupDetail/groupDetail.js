// couponM/pages/groupDetail/groupDetail.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../utils/httpUtil.js';
const util = require('../../utils/util.js')
import {
    tracking
} from '../../utils/track.js'
const app = getApp();
/**
 * 获取scene 中的参数
 * @param   
 *          scene  onLoad.options.scene
 */
function getSceneParams(scene) {
    if (!scene.includes('&')) {
        return false
    }
    let arry = scene.split('&')
    let query = {}
    arry.forEach(item => {
        const temp = item.split('=')
        query[temp[0]] = temp[1] || ''
    })
    return query

}
Page({
    /**
     * 页面的初始数据
     */
    data: {
        productId: null,
        product: {},
        shopDetail: [],
        friendId: '',
        type: '',
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage(options) {
        let couponIds = []
        this.data.product.data.data.list&&this.data.product.data.data.list.map((value) => {
            couponIds.push(value.couponId)
        })
        tracking({
            activityId: this.data.product.data.data.product.activityId,
            coupon: this.data.product.data.data.product.couponId || couponIds.join(','),
            event: '02',
            eventState: '转发'
        })
        let currentPage = getCurrentPages()[getCurrentPages().length - 1].route
        return {
            title: this.data.product ? this.data.product.data.data.product.mainInfo : '',
            path: `${currentPage}?isFromShare=true&productId=${this.data.productId}`
        }
    },

    onShow(){
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        options.type && this.setData({
            type: options.type
        })

        if (options.hiddenGroupBuy) {
            this.setData({
                hiddenGroupBuy: options.hiddenGroupBuy === 'false' ? false : true
            })
        }

        if (options.isFromShare) {
            this.setData({
                isFromShare: options.isFromShare
            })
        }
        if (options.hideBuy) {
            this.setData({
                hideBuy: options.hideBuy
            })
        }

        if (options.scene) {
            const scene = getSceneParams(decodeURIComponent(options.scene));
            this.setData({
                productId: scene.p,
                friendId: scene.u,
                isFromShare: true
            });
        } else {
            this.setData({
                productId: options.productId
            });
        }
        wx.setNavigationBarTitle({
            title: '券详情'
        })
        this.getProductDetail(this.data.productId)
    },

    getProductDetail(id) {
        httpWithParameter({
            endPoint: requestEndPoints.productDetail,
            data: {
                portalId: app.globalData.tenantId,
                productId: id,
            },
            success: (res) => {
                if (res.data.status == 200) {

                    if (!res.data.data) {
                        wx.showToast({
                            title: '该券不存在',
                            icon: 'none',
                            duration: 2000,
                        })
                        return;
                    }

                    if (res.data.data.type == 0) {

                        //普通券
                        let normalCoupon = res.data.data.data.detail
                        if (normalCoupon) {
                            normalCoupon.imgtxtInfo = normalCoupon.imgtxtInfo && util.formatImgTxt(normalCoupon.imgtxtInfo)
                            if (normalCoupon.effectiveType == 0) {
                                normalCoupon.validTime = `${normalCoupon.effectiveStartTime} 至 ${normalCoupon.effectiveEndTime}`
                            } else if (normalCoupon.effectiveType == 1) {
                                normalCoupon.validTime = normalCoupon.activedLimitedStartDay == 0 ? `领取后当天生效,有效期${normalCoupon.activedLimitedDays}天` : `领取${normalCoupon.activedLimitedStartDay}天后生效,有效期${normalCoupon.activedLimitedDays}天`
                            } else {
                                normalCoupon.validTime = ''
                            }
                            //加载适用店铺
                            this.loadShops(normalCoupon.id)
                        }
                    }

                    this.setData({
                        product: res.data
                    })
                }
            },
            fail: (res) => {}
        });
    },

    formatTime(time, days) {
        let date = new Date(time + days * 24 * 60 * 60 * 1000)
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
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
            fail: (res) => {}
        });
    },
})