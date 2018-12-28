import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../../rtmap/coupons/utils/httpUtil.js';
import { config } from '../../../utils/config.js'
import {
    tracking
} from '../../../rtmap/coupons/utils/track.js'
var app = getApp();

let getQueryString = function (url, name) {
    var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
    var r = url.substr(1).match(reg)
    if (r != null) {
        return r[2]
    }
    return null;
}

Page({
    /**
     * 页面的初始数据
     */
    data: {
        detail: null,
        recordId: 1,
        tenantId: '',
        activityId: '',
        timestamp: '',
        validate: false,
        showResult: false,
        isLoginSucc: false,
    },

    receive: function() {
        if (!wx.getStorageSync('isLoginSucc')) {
            this.data.isLoginSucc = true;
            wx.navigateTo({
                url: app.globalData.loginPath,
            });
            return;
        }
        let param = {
            "tenantId": this.data.tenantId,
            "activityId": this.data.activityId,
            "openId": wx.getStorageSync('openid'),
            "crmId": wx.getStorageSync('member').member.cid,
        }
        if (wx.getStorageSync('member').member.isCrmRegist) {
            param.isCrmRegist = wx.getStorageSync('member').isCrmRegist;
        }
        if (wx.getStorageSync('member').member.isMemberRegist) {
            param.isMemberRegist = wx.getStorageSync('member').isMemberRegist;
        }
        postRequestWithParameter({
            endPoint: requestEndPoints.getCoupon,
            data: param,
            success: (res) => {
                if (res.data.status === 200) {
                    if (res.data.data) {
                        this.setData({
                            showResult: true,
                            isLoginSucc: false,
                            recordId: res.data.data
                        })
                    }

                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none'
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '获取规则失败',
                    icon: 'none'
                })
            }
        });
    },

    getDetail(tenantId, activityId) {
        postRequestWithParameter({
            endPoint: requestEndPoints.scanCoupon,
            data: {
                tenantId: tenantId,
                activityId: activityId,
                action: 2
            },
            success: (res) => {
                if (res.data.status === 200) {
                    let data = res.data.data;
                    if (data) {
                        data.homeBanner = data.homeBanner || '../imgs/bg.png';
                        data.detailBanner = data.detailBanner || '../imgs/detail.png';
                        this.setData({
                            detail: data
                        })                        
                        if (this.data.timestamp) { // 有变码，是否可调用领取
                            this.validateDate();
                        } else {
                            this.setData({
                                validate: true
                            })
                        }
                    }
                    
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none'
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '获取规则失败',
                    icon: 'none'
                })
            }
        });
    },

    // 验证变码
    validateDate() {
        console.log('shiwoshiwo', this.data.timestamp)
        postRequestWithParameter({
            endPoint: requestEndPoints.validateDate,
            data: {
                "tenantId": this.data.tenantId,
                "activityId": this.data.activityId,
                "timestamp": this.data.timestamp,
            },
            success: (res) => {
                if (res.data.status === 200) {
                    this.setData({
                        validate: true
                    })
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 1500,
                        success:function() {
                           setTimeout(function() {
                               wx.reLaunch({
                                   url: '/pages/index/index',
                               });
                           }, 1500);
                        }
                    });
                    
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '请求验证变码接口失败',
                    icon: 'none'
                })
            }
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //在此函数中获取扫描普通链接二维码参数
        let q = decodeURIComponent(options.q)
        if (q) {
            let tenantId = getQueryString(q, 'tenantId');
            let timestamp = getQueryString(q, 'timestamp');
            let activityId = getQueryString(q, 'activityId');
            this.setData({
                tenantId: tenantId,
                timestamp: timestamp,
                activityId: activityId
            });
            console.log(212121211, this.data.timestamp)
            this.getDetail(this.data.tenantId, this.data.activityId);
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        if (this.data.isLoginSucc) {
            this.receive();
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        if (this.data.showResult) {
            this.setData({
                showResult: false
            })
        }
    },
})

