// rtmap/coupons/pages/setting/setting.js
import {
    httpWithParameter,
    requestEndPoints
} from '../../utils/httpUtil.js'
import {
    tracking
} from '../../utils/track.js'
import {
    config
} from '../../../../utils/config.js'
let app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        phone: app.globalData.phone,
        version: '1.0',
        isLogin: true,
        projectMinTitle: app.globalData.projectMinTitle
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            version: app.globalData.version,
            isLogin: wx.getStorageSync('isLoginSucc') && wx.getStorageSync('member')
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
        // if (!app.globalData.memberHandbook) {
        //   httpWithParameter({
        //     endPoint: requestEndPoints.memberHandbook + '/' + app.globalData.tenantId,
        //     data: {
        //       marketId: app.globalData.tenantId
        //     },
        //     success: (res) => {
        //       if (res.data.code === 200) {
        //         var obj = {
        //           memberHandbook: res.data.data
        //         }
        //         app.globalData.memberHandbook = res.data.data
        //         this.setData(obj);
        //       }
        //     },
        //     fail: (res) => {
        //       console.log('fail', res);
        //     }
        //   })
        // } else {
        //   var obj = {}
        //   if (app.globalData.memberHandbook) {
        //     obj.memberHandbook = app.globalData.memberHandbook;
        //     this.setData(obj);
        //   }
        // }
    },

    /**
     * 跳转反馈页面
     */
    feedback: function() {
        tracking({
            event: '07',
            eventState: '问题反馈'
        })
        wx.navigateTo({
            url: '../feedback/feedback',
            success: function(res) {
            },
            fail: function(res) {
            }
        })
    },

    /**
     * 联系我们
     */
    contactUs: function() {
        tracking({
            event: '12',
            eventState: '拨打电话'
        })
        wx.makePhoneCall({
            phoneNumber: this.data.phone,
        })
    },

    onExitClick() {
        tracking({
            event: '12',
            eventState: '退出登录'
        })
        wx.showModal({
            title: '提示',
            content: '是否退出登录?',
            showCancel: true,
            success: (res) => {
                if (res.confirm) {
                    wx.setStorageSync('isLoginSucc', false)
                    wx.setStorageSync('member', '')
                    this.setData({
                        isLogin: false
                    })
                    app.globalData.isUserInfoUpdated = true
                    wx.navigateBack({
                        delta: 1,
                    })
                }
            },
            fail: function(res) {
                wx.showToast({
                    title: '退出登录失败',
                    icon: 'none',
                    duration: 2000,
                    mask: true
                })
            },
            complete: function(res) {},
        })
    }
})