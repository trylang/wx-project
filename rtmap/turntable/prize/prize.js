//获取应用实例
const app = getApp()
// const util = require('../../../utils/util.js');
// import { handlePresentRequest, giftsEndUrl } from '../../../utils/util_new_gift.js'
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../utils/httpUtil.js';
var newisActive = '';
Page({
    data: {
        isActive: '1',
        tablist: [
            {
                id: '1',
                name: '未使用'
            }, {
                id: '2',
                name: '已使用'
            }, {
                id: '3',
                name: '已过期'
            }
        ],
        couponList: [],
        activityId: '',
        isPush: true,
        pageNum: 1,
    },

    onPullDownRefresh() {
        wx.setBackgroundTextStyle({
            textStyle: 'dark'
        })
        this.getPriceList()
        setTimeout(function () {
            wx.stopPullDownRefresh()
        }, 500);

    },

    getPriceList() {
        let that = this;
        let requestData = {
            portalId: app.globalData.tenantId,
            activityId: that.data.activityId,
            openId: wx.getStorageSync('openid'),
            status: this.data.isActive,
            page: that.data.pageNum,
            pageSize: 10
        }
        wx.showLoading({
            title: '加载中...',
        });
        postRequestWithParameter({
            endPoint: requestEndPoints.prizeList,
            data: requestData,
            success: (res) => {
                if (res.data.status == 200) {
                    if (this.data.isActive != newisActive){
                        that.data.pageNum = 1
                    }
                    if (that.data.pageNum == 1) {
                        that.setData({ couponList: [] })
                    }
                    that.setData({ total: res.data.data.total })
                    var list = res.data.data.list.map(item => {
                        return {
                            id: item.id,
                            mainInfo: item.mainInfo,
                            qrCodeStatus: item.qrCodeStatus,
                            couponInfo: JSON.parse(item.couponInfo),
                            qrCode: item.qrCode,
                            wonTime: item.wonTime
                        }
                    })
                    newisActive = this.data.isActive;
                    if (that.data.couponList.length == that.data.total) {
                        // return;
                    } else {
                        that.setData({ couponList: that.data.couponList.concat(list) });
                    }
                    wx.hideLoading();
                } else {
                    that.setData({ couponList: [] });
                    wx.hideLoading();
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            },
            fail: (res) => {
                wx.hideLoading();
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },

    canUseBtn(e) {
        var qrCode = e.currentTarget.dataset.qrcode
        var extendInfo = e.currentTarget.dataset.extendinfo
        wx.navigateTo({
            url: '/rtmap/coupons/pages/couponInfo/couponInfo?qrCode=' + qrCode + '&extendInfo=' + extendInfo,
            success: function (res) {
                // tracking({
                //     event: '07',
                //     eventState: '跳转成功'
                // })
            },
            fail: function (res) {
                // tracking({
                //     event: '07',
                //     eventState: '跳转失败'
                // })
            }
        })
    },

    getType(e) {
        let index = e.currentTarget.dataset.index;
        this.setData({
            isActive: index
        })
        this.getPriceList()
    },
    onShow() {
        let that = this;
        if (that.data.isPush) {
            that.setData({ isPush: false })
            that.getPriceList();
        }
    },
    onLoad(option) {
        if (option && option.activityId){
            this.setData({ activityId : option.activityId})
        }
    },
    onReachBottom() {
        var that = this;
        if (that.data.pageNum >= Math.ceil(that.data.total / 10)) {
            return;
        }
        that.getPriceList(++that.data.pageNum);
    },
})