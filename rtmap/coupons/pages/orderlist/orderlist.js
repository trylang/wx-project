// pages/orderlist/orderlist.js
import {
  requestEndPoints,
  httpWithParameter,
  postRequestWithParameter
} from '../../utils/httpUtil.js';
import {
  tracking
} from '../../utils/track.js'
import {
  formatTime
} from '../../../../utils/util.js';
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 0,
    tabs: [{
      label: '全部',
      value: ''
    },
    {
      label: '待付款',
      value: 0
    },
    {
      label: '待成团',
      value: 4
    }, 
    {
      label: '已完成',
      value: 1
    },
    {
      label: '已退款',
      value: 2
    }],
    orderData: {}
  },

  navchange(e) {
    this.setData({
      status: e.detail.value,
      orderData: {}
    });
    this.getOrderList(e.detail.value)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.setData({ status: options.status || 0 })
    // this.getOrderList(this.data.tabs[options.status || 0].value)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrderList(this.data.tabs[this.data.status].value)
    tracking({
      event: '06',
      eventState: '进入成功'
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getOrderList(this.data.status)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (e) {
    let status = '';
    let page = this.data.orderData.page + 1
    this.getOrderList(status, page)
  },


  /**
   * 获取订单列表
   */
  getOrderList(status = '', page = 1, pageSize = 10) {
    if (this.data.orderData.page) {
      if (this.data.orderData.page == this.data.orderData.pages) {
        return
      }
    }
    wx.showLoading({
      title: '加载中'
    })
    let url = this.data.status == 4 ? requestEndPoints.groupoOrderList : requestEndPoints.publicOrderList
    httpWithParameter({
      endPoint: url,
      data: {
        openId: wx.getStorageSync('openid'),
        portalId: app.globalData.tenantId,
        status: status == 4 ? 0 : status,
        page,
        pageSize
      },
      success: (res) => {
        wx.hideLoading()
        wx.stopPullDownRefresh();
        console.log('29349325036===>', res)
        if (res.data.status === 200) {
          if (this.data.status == 4) {
            res.data.data.list = res.data.data.list.map(item => {
              item.order.group = item.group;
              return item.order;
            });
          }
          //判断是否秒杀券（是不显示再次购买）
          if (status == 4) {
            res.data.data.list.map(item => {
              item.productInfo = JSON.parse(item.productInfo).data.detail
              item.name = item.productInfo.mainInfo
              item.url = item.productInfo.couponImageList ? item.productInfo.couponImageList[0] ? item.productInfo.couponImageList[0].imgUrl : item.productInfo.imgLogoUrl : item.productInfo.imgLogoUrl
              item.total = item.totalFee
              item.totalFace = item.productInfo.cost
              item.payType = 2
              item.sourceType = 0
              item.status = 2
              return item
            })
          }
          res.data.data.list.map(item => {
            item.orderTime = formatTime(new Date(item.orderTime)).replace(/\//g,"-");
          })
          // res.data.data.list.map(function(value) {
          //     value.isMiao = value.orderNo.substr(0, 1) == 'N'
          // })
          if (res.data.data.page == 1) {
            this.setData({
              orderData: res.data.data
            })

          } else {
            let orderList = this.data.orderData.list || []
            orderList.push(...res.data.data.list)
            res.data.data.list = orderList

            this.setData({
              orderData: res.data.data
            })
          }
          console.log(this.data.orderData)
        } else {
          this.setData({
            orderData: {}
          })
        }
      },
      fail: (res) => {
        wx.hideLoading()
        wx.stopPullDownRefresh();
        this.setData({
          orderData: {}
        })
        console.log('fail', res);
      }
    });
  },
  toDetail(e) {
    let orderItem = this.data.orderData.list[e.detail.index];
    if (orderItem.sourceType == 1) {
      let orderId = orderItem.orderId
        tracking({
            event: '07',
            eventState: '秒杀订单详情'
        })
      wx.navigateTo({
        url: `/rtmap/seckill/page/order/order?orderId=${orderId}` + `&group=${orderItem.group ? JSON.stringify(orderItem.group) : ''}`,
        success: function (res) {
        },
        fail: function (res) {
        }
      })
    } else if (orderItem.status == 2) { // 支付成功
      let orderNo = orderItem.orderNo;
        tracking({
            event: '07',
            eventState: '订单详情'
        })
      wx.navigateTo({
        url: `../orderDetail/orderDetail?orderNo=${orderNo}` + `&isGroup=true`,
        success: function (res) {
        },
        fail: function (res) {
        }
      })
    } else { // 有group是拼团券
      let orderNo = orderItem.orderNo
        tracking({
            event: '07',
            eventState: '拼团订单详情'
        })
      wx.navigateTo({
        url: `../orderDetail/orderDetail?orderNo=${orderNo}` + `&group=${orderItem.group? JSON.stringify(orderItem.group): ''}`,
        success: function (res) {
        },
        fail: function (res) {
        }
      })
    }
  }
})
