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
    isSuccess: false,
    carInfo: null
  },

  count_down: function(countDown_time) {
    var that = this;
    var time = countDown_time.split(":");
    var hhh = parseInt(time[0]);
    var mmm = parseInt(time[1]);
    var sss = parseInt(time[2]);
    this.setData({
      sss: sss < 10 ? "0" + sss : sss,
      mmm: mmm < 10 ? "0" + mmm : mmm,
      hhh: hhh < 10 ? "0" + hhh : hhh
    });
    var Interval = setInterval(function() {
      if (sss > 0) {
        sss--;
      } else {
        console.log("时间到");
        clearInterval(Interval);
      }
      if (sss == 0) {
        if (mmm > 0) {
          mmm--;
          sss = 59;
        }
        if (mmm == 0 && hhh > 0) {
          hhh--;
          sss = 59;
          mmm = 59;
        }
      }
      that.setData({
        sss: sss < 10 ? "0" + sss : sss,
        mmm: mmm < 10 ? "0" + mmm : mmm,
        hhh: hhh < 10 ? "0" + hhh : hhh
      });
    }, 1000);
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
  onLoad(options) {
    this.dialog = this.selectComponent("#dialog");
    var countDown_time = "00:29:59";
    this.count_down(countDown_time);
    this.setData({
      isSuccess: options.isSuccess == "true",
      detail: options.detail || "",
      isDetail: options.isDetail == "true"
    });
    if (options.id) {
      this.getCarDetail(options.id);
    }
  },
  getCarDetail(id) {
    httpWithParameter({
      endPoint: requestEndPoints.parkFreeDetail + id,
      success: res => {
        if (res.data.code == 200) {
          let data = res.data.data.parkingFee;
          // 车牌号，入场时间，停车时长，应付金额，积分抵扣，抵扣合计，实付金额，缴费时间
          this.setData({
            carInfo: {
              carNumber: data.carNumber,
              passTime: util.formatTime(data.passTime),
              parkingLongTime: util.toHourMinute(data.parkingLongTime),
              totalLongTime: util.toHourMinute(data.totalLongTime),
              receivable: util.formatMoney(data.receivable),
              scoreDeductible: util.formatMoney(data.scoreDeductible) || 0,
              feeNumber: util.formatMoney(data.feeNumber),
              freeTotal: util.formatMoney(data.receivable - data.feeNumber),
              feeTime: util.formatTime(data.feeTime)
            }
          });
        } else {
          this.dialog.showDialog();
          this.setData({
            payResult: {
              content: res.data.msg || "没有此车信息",
              leftText: "",
              rightText: "确定",
              type: 0
            }
          });
        }
      },
      fail: res => {}
    });
  },
  records() {
    wx.navigateTo({
      url: "/car/pages/parkingRecords/parkingRecords"
    });
  },
  goHome() {
    wx.navigateTo({
      url: '/car/pages/parkingRecords/parkingRecords'
    });
  },
  goInput() {
    wx.navigateBack({
      delta: 2
    });
  },
  onRightClick() {
    wx.navigateBack({
      delta: 1
    });
  }
});
