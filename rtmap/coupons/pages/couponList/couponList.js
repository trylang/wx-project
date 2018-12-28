// pages/couponList/couponList.js

import {
  requestEndPoints,
  httpWithParameter,
  postRequestWithParameter
} from '../../utils/httpUtil.js';
import {
  formatTime
} from '../../utils/util.js';
import {
  tracking
} from '../../utils/track.js'
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{
        label: '未使用',
        value: 2
      },
      {
        label: '已使用',
        value: 3
      },
      {
        label: '已过期',
        value: 4
      },
      {
        label: '已退券',
        value: 7
      },
    ],
    couponList: [],
    tabValue: 2,
    statusIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options && options.status) {
      this.setData({
        tabValue: options.status,
        statusIndex: 1,
      });
    }
    this.getCouponList(this.data.tabValue);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {
    //this.navchange();
      tracking({
          event: '06',
          eventState: '进入成功'
      })
  },

  getCouponList(status = this.data.tabValue) {
    this.setData({
      couponList: []
    })
    wx.showLoading({
      title: '加载中'
    })
    var requestlength;

    var wxopenid = wx.getStorageSync('wxopenid');
    if (wxopenid) {
      requestlength = 2;
    } else {
      requestlength = 1;
    }
    httpWithParameter({
      endPoint: requestEndPoints.getCouponList,
      data: {
        openId: wx.getStorageSync('openid'),
        portalId: app.globalData.tenantId,
        crmId: wx.getStorageSync('member').cid,
        status: status
      },
      success: (res) => {
        requestlength--;
        if (!requestlength) {
          wx.hideLoading()
        }
        if (res.data.status == 200 && this.data.tabValue == status) {
          let data = res.data.data.list.map(item => {
            if (status == 7) {
              let start = new Date(item.getTime.replace(/-/g, '/').slice(0, 10))
              start.setDate(start.getDate() + item.activedLimitedStartDay)
              let end = new Date(item.getTime.replace(/-/g, '/').slice(0, 10))
              end.setDate(end.getDate() + item.activedLimitedDays)
              item.effectiveStartTime = formatTime(start, '.')
              item.effectiveEndTime = formatTime(end, '.')
              return item
            } else {
              item.effectiveStartTime = item.effectiveStartTime.replace(/-/g, ".")
              item.effectiveEndTime = item.effectiveEndTime.replace(/-/g, ".")
              return item
            }
          })
          this.setData({
            couponList: this.data.couponList.concat(data)
          })
        } else {
          this.setData({
            couponList: []
          })
        }

        tracking({
          event: '06',
          eventState: '进入成功 加载小程序券列表成功'
        })
      },
      fail: (res) => {

        tracking({
          event: '06',
          eventState: '进入成功 加载小程序券列表失败'
        })
        requestlength--;
        if (!requestlength) {
          wx.hideLoading()
        }
      }
    })
    if (wxopenid) {
      httpWithParameter({
        endPoint: requestEndPoints.getCouponList,
        data: {
          openId: wxopenid,
          portalId: app.globalData.tenantId,
          crmId: wx.getStorageSync('member').cid,
          status
        },
        success: (res) => {
          requestlength--;
          if (!requestlength) {
            wx.hideLoading()
          }
          if (res.data.status === 200) {
            wx.hideLoading();
            let data = res.data.data.list.map(item => {
              if (status == 7) {
                let start = new Date(item.getTime.replace(/-/g, '/').slice(0, 10))
                start.setDate(start.getDate() + item.activedLimitedStartDay)
                let end = new Date(item.getTime.replace(/-/g, '/').slice(0, 10))
                end.setDate(end.getDate() + item.activedLimitedDays)
                item.effectiveStartTime = formatTime(start, '.')
                item.effectiveEndTime = formatTime(end, '.')
                return item
              } else {
                item.effectiveStartTime = item.effectiveStartTime.replace(/-/g, ".")
                item.effectiveEndTime = item.effectiveEndTime.replace(/-/g, ".")
                return item
              }
            })
            this.setData({
              couponList: this.data.couponList.concat(data)
            })
          } else {
            this.setData({
              couponList: []
            })
          }
          tracking({
            event: '06',
            eventState: '进入成功 加载服务号券列表成功'
          })
        },
        fail: (res) => {
          tracking({
            event: '06',
            eventState: '进入成功 加载服务号券列表失败'
          })
          requestlength--;
          if (!requestlength) {
            wx.hideLoading()
          }
          console.log('fail', res);
          // this.setData({
          //   couponList: []
          // })
        }
      });
    }
  },
  navchange(e) {
    this.setData({
      tabValue: e.detail.value
    });
    this.getCouponList(e.detail.value);
  },
})