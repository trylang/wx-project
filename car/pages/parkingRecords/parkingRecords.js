var util = require("../../utils/util.js");
const app = getApp();
import {
  tracking
} from '../../utils/track.js'

import {
  requestEndPoints,
  httpWithParameter,
  postRequestWithParameter
} from "../../utils/httpUtil.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    endTime: "",
    records: [],
    timeView: "",
    time: [],
    pageNum: 1
  },

  onShow(){
      tracking({
          event: '06',
          eventState: '进入成功'
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      endTime: util.getNowDate(),
      timeView: util.getYearMonth(),
      time: util.getStartEnd()
    });
    this.getList();
  },

  onDetailClick(e) {
    wx.navigateTo({
      url:
        "../payInfo/payInfo?isSuccess=true&isDetail=true&id=" +
        e.currentTarget.dataset.id
    });
  },

  bindDateChange(data) {
    tracking({
      event: '12',
      eventState: '点击日期选择'
    })
    var selTime = data.detail.value;
    var t = selTime.split("-");
    this.data.time = util.getMonthStartEnd(t[0], t[1]);
    this.setData({
      timeView: t[0] + "年" + t[1] + "月",
      time: this.data.time
    });
    this.getList();
  },

  getList(pageNum = 1, pageSize = 20) {
    let that = this;
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    });

    httpWithParameter({
      endPoint: requestEndPoints.parkFreeList,
      data: {
        wxAppId: app.globalData.appid,
        userId: wx.getStorageSync("member").cid,
        openid: wx.getStorageSync("openid"),
        type: "3",
        pageNum: pageNum,
        pageSize: pageSize,
        startDate: this.data.time[0],
        endDate: this.data.time[1]
      },
      success: res => {
        if (res.data.code == 200) {
          let list = res.data.data.list.map(item => {
            return {
              id: item.id,
              carNo: item.carNumber,
              total: util.formatMoney(item.feeNumber),
              startTime: util.formatTime(item.passTime),
              duration: util.toHourMinute(item.parkingLongTime)
            };
          });

          that.setData({
            total: res.data.data.total,
            records: pageNum == 1 ? list : that.data.records.concat(list)
          });
          wx.hideLoading();
        }
      }
    });
  },

  //下拉更多
  onReachBottom:function() {
    this.getList(++this.data.pageNum);
  },
});
