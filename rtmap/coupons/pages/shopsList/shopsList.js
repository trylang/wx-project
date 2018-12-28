// pages/shops/shops.js
import {
    requestEndPoints,
    httpWithParameter
} from '../../utils/httpUtil.js';
import {
    tracking
} from '../../utils/track.js'
import util from '../../utils/util.js'
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        shops: [],
        page: 1,
        maxPage: 1,
        couponId: '',
        oldShops: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            couponId: options.couponId
        });
        this.loadShops(options.couponId);
    },

    onShow: function() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },


    //拨打商铺电话 第一个商铺
    onCallClick(e) {
      tracking({
        event: '12',
        eventState: '拨打电话'
      })
        wx.makePhoneCall({
          phoneNumber: this.data.shops[e.currentTarget.dataset.index].mobile,
        });
    },

    //导航到店铺
    navigationToShop(e) {
        const shop = this.data.oldShops[e.currentTarget.dataset.index];
        if (shop.buildId && shop.floorId && shop.x && shop.y && shop.poiNo) {
            tracking({
                event: '07',
                eventState: '福利地图'
            })
            wx.navigateTo({
                url: `/rtmap/coupons/pages/webView/webView?buildBean=${JSON.stringify({ buildId: shop.buildId, floor: shop.floorId, x: shop.x, y: shop.y, pageUrl: getCurrentPages()[getCurrentPages().length - 1].route, poiNo: shop.poiNo })}`,
                success: function(res) {
                    tracking({
                        event: '07',
                        eventState: '跳转成功'
                    })
                },
                fail: function(res) {
                    tracking({
                        event: '07',
                        eventState: '跳转失败'
                    })
                }
            })
        } else {
            wx.showToast({
                title: '找不到店铺',
                icon: 'none',
                duration: 2000,
                mask: true,
            })
        }
    },

    /**
     * 加载商铺列表
     */
    loadShops: function(couponId, page = 1, pageSize = 1000, showLoading = true) {
        if (page > this.data.maxPage) {
            return;
        }

        if (showLoading) {
            wx.showLoading({
                title: '加载中...',
            });
        }

        httpWithParameter({
            endPoint: requestEndPoints.shops,
            data: {
                portalId: app.globalData.tenantId,
                couponId: couponId,
                page: page,
                pageSize: pageSize
            },
            success: (res) => {
                wx.hideLoading();

                wx.stopPullDownRefresh();

                if (res.data.status === 200) {
                    let shops = this.data.shops;
                    let oldShops = this.data.oldShops;


                    if (res.data.data.page > 1) {
                        shops = shops.concat(res.data.data.list);
                        oldShops = oldShops.concat(res.data.data.list);
                    } else {
                        shops = res.data.data.list;
                        oldShops = res.data.data.list;
                    }
                    console.log(shops)
                    shops.map(function(value) {
                        value.floorId = util.formatFloor(value.floorId)
                    })
                    console.log(shops)
                    this.setData({
                        oldShops: oldShops,
                        shops: shops,
                        page: res.data.data.page,
                        maxPage: res.data.data.pages
                    });
                }
            },
            fail: (res) => {
                wx.hideLoading();

                wx.stopPullDownRefresh();

                console.log('fail', res);
            }
        });
    },

    /**
     * 上拉加载商铺
     */
    onReachBottom: function() {
        if (this.data.page < this.data.maxPage)
            this.loadShops(this.data.couponId, this.data.page ? this.data.page + 1 : 1);
        else
            wx.showToast({
                title: '已经到最底部了',
                icon: 'none',
                duration: 2000,
                mask: true,
            })
    },

    /**
     * 下拉刷新
     */
    onPullDownRefresh: function() {
        this.setData({
            shops: [],
            page: 1,
            maxPage: 1,
        });

        this.loadShops(this.data.couponId, 1, 15, false);
    }
})