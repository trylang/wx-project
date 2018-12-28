// rtmap/integralMall/integralHistory/integralHistory.js
var burialPoint = require('../../coupons/utils/track.js')
var contact = require('../contact.js')
var app = getApp()
Page({
    //埋点数据
    title: '兑换记录',

    /**
     * 页面的初始数据
     */
    data: {
        
        list: [{
            title: '兑换七夕小王子水晶球礼盒',
            time: '2018-08-03',
            convert: -16668
        }, {
            title: '兑换七夕小王子水晶球礼盒',
            time: '2018-08-03',
            convert: -16668
        }, {
            title: '兑换七夕小王子水晶球礼盒',
            time: '2018-08-03',
            convert: -16668
        }, {
            title: '兑换七夕小王子水晶球礼盒',
            time: '2018-08-03',
            convert: -16668
        }]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
      
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
        burialPoint.tracking({
            productId: contact.productId,
            event: '06',
            eventState: '兑换记录'
        }) 
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

    }
})