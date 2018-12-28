// rtmap/coupons/pages/credits/credits.js
import {
    tracking
} from '../../utils/track.js'

import {
    requestEndPoints,
    httpWithParameter
} from '../../utils/maHttpUtil.js'

const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        credits: 0,
        records: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.flashRecords()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.flashRecords()
    },

    /**
     * 刷新积分
     */
    flashRecords: function () {
        const userInfo = wx.getStorageSync('member')
        if (userInfo) {
            const cardNo = userInfo.member.cardNo
            const cid = userInfo.cid

            httpWithParameter({
                endPoint: requestEndPoints.membershipCredits,
                data: {
                    tenantType: 1,
                    tenantId: app.globalData.tenantId,
                    cid: cid
                },
                success: (res) => {
                    console.log(res)
                    if (res.data.status === 200) {
                        this.setData({
                            credits: res.data.data.balance
                        })
                    }
                },
                fail: (res) => {
                    console.log('fail', res);
                }
            }); 
            httpWithParameter({
                endPoint: requestEndPoints.membershipCreditsRecords,
                data: {
                    tenantType: 1,
                    tenantId: app.globalData.tenantId,
                    "type": 3,
                    searchText: cardNo,
                    pageNum: 1,
                    pageSize: 200
                },
                success: (res) => {
                    wx.stopPullDownRefresh()
                    console.log(res)
                    if (res.data.status === 200) {
                        res.data.data.list.map(function(value){
                            value.comment = (value.comment == null || value.comment == '' ? '积分变更' : value.comment)
                        })
                        this.setData({
                            records: res.data.data.list
                        })
                    }else{
                        wx.showToast({
                            title: res.data.message,
                            icon: 'none',
                            duration: 2000
                        })
                    }
                },
                fail: (res) => {
                    wx.stopPullDownRefresh()
                    wx.showToast({
                        title: res.errMsg,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        }
    }
})