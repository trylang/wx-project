// pages/shops/shops.js
import {
    requestEndPoints,
    httpWithParameter
} from '../../utils/httpUtil.js';
import {
  tracking
} from '../../utils/track.js'
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        shops: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.couponId) {
            this.getShopList(options.couponId);
        } else if (options.shops) {
            this.setData({shops: JSON.parse(options.shops)});
        }
    },

    onShow: function() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    getShopList(couponId, loading = false) {
        if (loading) {
            wx.showLoading()
        }
        httpWithParameter({
            endPoint: requestEndPoints.shops,
            data: {
                couponId,
                portalId: app.globalData.tenantId
            },
            success: (res) => {
                if (loading) {
                    wx.hideLoading()
                }
                if (res.data.status == 200) {
                    this.setData({
                        shops: res.data.data.list,
                    });
                }
            },
            fail: (res) => {
                if (loading) {
                    wx.hideLoading()
                }
                console.log('fail', res);
            }
        });
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
        const shop = this.data.shops[e.currentTarget.dataset.index];
        if (shop.buildId && shop.floorId && shop.x && shop.y && shop.poiNo) {
            tracking({
                event: '07',
                eventState: '跳转福利地图'
            })
            wx.navigateTo({
                url: '../webView/webView?linkType=map&buildid=' + shop.buildId + '&floor=' + shop.floorId + '&x=' + shop.x + '&y=' + shop.y + '&poiNo=' + shop.poiNo,
                success: function(res) {
                },
                fail: function(res) {
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
})