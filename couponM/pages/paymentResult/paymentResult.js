// pages/paymentResult/paymentResult.js
import {
  tracking
} from '../../utils/track.js'
Page({
    /**
     * 页面的初始数据
     */
    data: {
        status: '',
        orderNo: '',
        qrCode: '',
        group: false,
        productId: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            status: options.status ? options.status : '',
            orderNo: options.orderNo ? options.orderNo : '',
            qrCode: options.qrCode ? options.qrCode : '',
            group: options.group || false,
            productId: options.productId || '',
        });
        console.log(this.data);
    },

    onShow: function() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    /**
     * 使用优惠券
     */
    useConpon: function() {
      if (this.data.productId) {
          tracking({
              event: '07',
              eventState: '跳转券详情'
          })
        wx.navigateTo({
          url: `/couponM/pages/groupDetail/groupDetail?productId=${this.data.productId}&hideBuy=true`,
          success: function (res) {
           },
          fail: function (res) {
           },
        });
      } else {
          tracking({
              event: '07',
              eventState: '跳转优惠券详情'
          })
        wx.navigateTo({
            url: '../couponInfo/couponInfo?qrCode=' + this.data.qrCode,
            success: function(res) {
            },
            fail: function(res) {
            }
        });
      }
    },

    /**
     * 查看订单
     */
    checkOrder: function() {
        tracking({
            event: '07',
            eventState: '跳转订单详情'
        })
        wx.navigateTo({
          url: `/rtmap/coupons/pages/orderDetail/orderDetail?orderNo=${this.data.orderNo}` + `&group=`,
          success: function (res) {
           },
          fail: function (res) {
          }
        });        
    },

    /**
     * 查看其他优惠券 继续购买
     */
    showMoreCoupons: function() {
        wx.navigateBack({
            delta: 2,
        })
    }
})