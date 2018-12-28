const app = getApp()
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../../coupons/utils/httpUtil.js';
import { formatTime } from '../../../coupons/utils/util.js'
import {
  tracking
} from '../../../coupons/utils/track.js'
Page({
    data: {
        openId: '',
        historyList: [],
        // isPush: true,
        isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组
        pageNum: 1,   // 设置加载的第几次，默认是第一次
    },
    onLoad: function (options) {
        this.setData({ openId: wx.getStorageSync('openid')});
        // this.getHistoryList();
    },
    getHistoryList(){
        var that = this;
        wx.showLoading({
            title: '加载中...',
        });
        httpWithParameter({
            endPoint: requestEndPoints.historyList,
            data: {
                portalId: app.globalData.tenantId,
                openId: that.data.openId,
                // openId: 'oS7sI0STlqbAtjxVgwKXQPBwWFBE',
                page: that.data.pageNum,
                pageSize: 10
            },
            success(res) {
                if (res.data.status == 200) {
                    if (that.data.pageNum == 1) {
                        that.setData({ historyList: [] })
                    }
                    that.setData({ total: res.data.data.total })
                    var list = res.data.data.list.map(item=>{
                        return {
                            id: item.id,
                            mainInfo: item.mainInfo,
                            orderTime: item.orderTime?formatTime(item.orderTime).substr(0, 11).replace(/\//g, "-"):'',
                            price: item.price,
                        }
                    })
                    if (that.data.historyList.length == that.data.total) {
                        // return;
                    } else {
                        that.setData({ historyList: that.data.historyList.concat(list) });
                    }
                    wx.hideLoading();
                } else {
                    that.setData({ historyList: [] });
                    wx.hideLoading();
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        })
    },
    
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
        let that = this;
        // if (that.data.isPush) {
        //     that.setData({ isPush: false })
            that.getHistoryList();
        // }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (that.data.pageNum >= Math.ceil(that.data.total / 10)) {
            return;
        }
        that.getHistoryList(++that.data.pageNum);
    },
})