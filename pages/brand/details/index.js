//index.js
//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {
    tracking
} from '../../../rtmap/coupons/utils/track.js'
var wxParse = require('../../components/wxparse/wxparse.js');
Page({
    //页面变量
    data: {
        activity: [],
        mapPoi: {},
        classList: [],
        id: "",
        keyAdmin: "",
        buildId: "",
        channel: "WXC",
        pageNum: 1,
        poiId: "",
        openid: "",
        poiNo: "",
        floor: "",
        poiNumber: '',
        couponDetails: []
    },
    //事件处理函数
    bindViewTap: function() {
        wx.navigateTo({
            url: '../logs/logs'
        })
    },
    goEnroll: function(e) {
        wx.navigateTo({
            url: '/pages/w_activity/detail/detail?id=' + e.currentTarget.dataset.text
        });
    },
    goPhoto: function() {
      tracking({
        event: '12',
        eventState: '拨打电话'
      })
        var that = this;
        wx.makePhoneCall({
            phoneNumber: that.data.mapPoi.phone ? that.data.mapPoi.phone : that.data.mapPoi.phones //仅为示例，并非真实的电话号码
        });
    },
    onLoad: function(options) {
        var that = this;
        var keyAdmin = wx.getStorageSync('keyAdmin');
        that.setData({
            keyAdmin: keyAdmin
        });
        that.setData({
            buildId: options.buildId
        });
        that.setData({
            openid: options.openid
        });
        that.setData({
            poiNo: options.poiNo
        });
        that.setData({
            poiId: options.poiId
        });
        that.setData({
            floor: options.floor
        });
        that.setData({
            poiNumber: options.poiNumber
        });
        that.getDetails();
        that.getPoid();

    },
    lingqu: function(e) {
        var batchId = e.currentTarget.dataset.batchid;
        var activityId = e.currentTarget.dataset.activityid;
        console.log(batchId + activityId)
        util.localityRequest(util.portsEndUrl.getActivityInfo, {
            portalId: app.globalData.tenantId,
            activityId: activityId,
            activityCouponId: batchId
        }, 'get', (data) => {
            console.log(data)
            if (data.data.status == 200) {
                console.log(data.data.data.id)
                wx.navigateTo({
                    url: `/couponM/pages/groupDetail/groupDetail?productId=${data.data.data.id}`
                })
            } else {
                wx.showToast({
                    title: data.data.message,
                    icon: 'none',
                    duration: 2000,
                    mask: true
                })
            }
        }, (data) => {
            wx.showToast({
                title: data.data.message,
                icon: 'none',
                duration: 2000,
                mask: true
            })
        })
    },
    onShow: function() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },
    getDetails: function() {
        var that = this;
        var openid = that.data.openid == '' ? '123' : that.data.openid;
        util.memoRequest(util.portsEndUrl.getQueryPoi_detail_only, {
                keyAdmin: that.data.keyAdmin,
                buildId: that.data.buildId,
                openid: openid,
                poiNo: that.data.poiNo,
                floor: that.data.floor
            }, 'post', function(res) {
                if (res.data.code == 200) {
                    that.setData({
                        mapPoi: res.data.mapPoi
                    });
                    that.setData({
                        poiNumber: res.data.mapPoi.poiNumber
                    });
                    that.setData({
                        classList: res.data.classList
                    });
                    console.log(res.data.mapPoi.poiNumber);
                    that.getActivityList();
                    var poiDescribe = that.data.mapPoi.poiDescribe;
                    wxParse.wxParse("poiDescribe", "html", poiDescribe, that, 0);
                } else {
                    console.log(res);
                }
            },
            function(res) {
                console.log(res)
            });
    },
    getPoid: function() {
        var that = this;
        util.memoRequest(util.portsEndUrl.getQueryActionsByPoiId, {
                keyAdmin: that.data.keyAdmin,
                buildId: that.data.buildId,
                poiId: that.data.poiId
            }, 'post', function(res) {
                if (res.data.code == 200) {
                    that.setData({
                        activity: res.data.actionlist
                    });
                } else {
                    console.log(res);
                }
            },
            function(res) {
                console.log(res)
            });

    },
    getActivityList: function() {
        let that = this;
        util.localityRequest(util.portsEndUrl.getActivityId, {
            portalId: app.globalData.tenantId
        }, 'get', (data) => {
            if (data.data.status == 200) {
                console.log(data.data.data.list[0].activityId)
                const parame = {
                    shopId: that.data.poiNumber,
                    status: 1,
                    activityId: data.data.data.list[0].activityId
                };
                wx.Request({
                    url: util.memoUrl + util.portsEndUrl.brandCoupon,
                    data: parame,
                    method: 'get',
                    header: {
                        'content-type': 'application/json'
                    },
                    success: function(res) {
                        var num = res.data.data ? res.data.data.length : 0
                        for (var i = 0; i < num; i++) {
                            res.data.data[i].button = true;
                        };
                        that.setData({
                            couponDetails: res.data.data
                        });
                    },
                    fail: function(res) {
                        console.log(res)
                    }
                })
            } else {
                wx.showToast({
                    title: data.data.message,
                    icon: 'none',
                    duration: 2000,
                    mask: true
                })
            }

        }, (data) => {
            wx.showToast({
                title: data.data.message,
                icon: 'none',
                duration: 2000,
                mask: true
            })
        })
    },
    onShareAppMessage(res) {
        let that = this;
        //埋点数据
        tracking({
            event: '02',
            eventState: '转发'
        })
        return {
            title: '品牌导览',
            path: '/pages/brand/details/index?buildId=' + that.data.buildId + '&openid=' + that.data.openid + '&poiNo=' + that.data.poiNo + '&floor=' + that.data.floor + '&poiId=' + that.data.poiId + '&poiNumber=' + that.data.poiNumber,
            success: res => {
                wx.showToast({
                    title: '分享成功',
                    icon: 'success',
                    duration: 2000
                })
            },
            error: res => {
                wx.showToast({
                    title: '分享失败',
                    icon: 'error',
                    duration: 2000
                })
            },
        }
    },
    onMapClick() {
      tracking({
        event: '12',
        eventState: '福利地图'
      })
        wx.navigateTo({
            url: `/rtmap/coupons/pages/webView/webView?buildBean=${JSON.stringify({ buildId: this.data.mapPoi.buildIdStr, floor: this.data.mapPoi.floor, pageUrl: getCurrentPages()[getCurrentPages().length - 1].route, poiNo: this.data.poiNo, keyAdmin: this.data.keyAdmin, poiName: this.data.mapPoi.poiName, name: this.data.mapPoi.poiName})}`,
            success: function (res) {
            },
            fail: function (res) {
            }
        })
    },
})