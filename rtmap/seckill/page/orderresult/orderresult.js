import {
    get,
    post,
    paths
} from '../../http.js';
import {
    tracking
} from '../../../coupons/utils/track.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orderId: 260,
        status: 1 //1:成功、0：失败
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var _self = this;
        this.setData({
            orderId: options.orderId,
            status: options.status == 1
        })
        get(paths.getActivityId, {}, function(res) {
            if (res.data.data != _self.data.activityId) {
                _self.setData({
                    activityId: res.data.data
                })
                tracking({
                    event: '07',
                    activityId: res.data.data,
                    eventState: '进入秒杀下单结果页'
                })
            }
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
        if (this.data.activityId) {
            tracking({
                event: '07',
                activityId: this.data.activityId,
                eventState: '进入秒杀下单结果页'
            })
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
    backList() {
        wx.navigateBack({
            delta: 2
        })
    }
})