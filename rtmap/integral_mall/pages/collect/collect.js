const app = getApp()
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../../coupons/utils/httpUtil.js';
import {
    tracking
} from '../../../coupons/utils/track.js'
Page({
    data: {
        openId: '',
        collectList: [],
        isPush: true,
        isFromSearch: true,   // 用于判断searchSongList数组是不是空数组，默认true，空的数组
        pageNum: 1,   // 设置加载的第几次，默认是第一次
    },
    onLoad: function (options) {
        
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
        this.setData({ openId: wx.getStorageSync('openid') });
        if (that.data.isPush) {
            that.setData({ isPush: false })
            that.getCollectList();
        }
    },
    getCollectList() {
        var that = this;
        wx.showLoading({
            title: '加载中...',
        });
        httpWithParameter({
            endPoint: requestEndPoints.collectionList,
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
                        that.setData({ collectList: [] })
                    }
                    that.setData({ total: res.data.data.total })
                    var list = res.data.data.list.map(item => {
                        return {
                            id: item.id,
                            logoUrl: item.logoUrl,
                            mainInfo: item.mainInfo,
                            minPrice: item.minPrice,
                            collectionNum: item.collectionNum,
                            state: item.state
                        }
                    })
                    if (that.data.collectList.length == that.data.total) {
                        // return;
                    } else {
                        that.setData({ collectList: that.data.collectList.concat(list) });
                    }
                    wx.hideLoading();
                } else {
                    that.setData({ collectList: [] });
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
    enterDetail: function (e) {
        var that = this;
        var item = e.currentTarget.dataset.data;
        // var index = e.currentTarget.dataset.index;
        if (item.state == 0) {
            wx.navigateTo({
                url: '../detail/detail?portalId=' + app.globalData.tenantId + '&couponId=' + item.id
            });
        }

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var that = this;
        if (that.data.pageNum >= Math.ceil(that.data.total / 10)) {
            return;
        }
        that.getCollectList(++that.data.pageNum);
    },
})