const util = require('../../utils/util.js');
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
    myCars: [],
    unbindTitle: '绑定成功！',
    carList: ["京", "津", "冀", "晋", "蒙", "辽", "吉", "黑", "沪", "苏", "浙", "皖", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "川", "贵", "云", "渝", "藏", "陕", "甘", "青", "宁", "ABC", "新", "使", "领", "警", "学", "港", "澳"],

    payResult: {
      content: '绑定成功',
      leftText: '',
      rightText: '确定',
      type: 3
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent('#dialog')
    this.setData({ myCars: JSON.parse(options.myCars) });
  },

  onInputChange(res) {
    this.setData({
      carNumber: res.detail.carNumber,
      isInput: res.detail.isInput,
    })
  },

  onBindClick() {
    if (!this.data.isInput) {
      util.showToa('请输入车牌号')
      return
    }
    let carNumber = this.data.carNumber.join('');
    if (this.data.myCars.some(item => item.label == carNumber)) {
      util.showToa('相同车牌只能绑定一次');
      return
    }
    postRequestWithParameter({
      endPoint: requestEndPoints.addMyCar,
      data: {
        carNumber: carNumber,
        wxAppId: app.globalData.appid,
        userId: wx.getStorageSync('member').cid,
        mobile: wx.getStorageSync('mobile'),
        openid: wx.getStorageSync('openid'),
          memType: wx.getStorageSync('member').member.cardName,
      },
      success: (res) => {
        if (res.data.code == 200) {
          tracking({
            event: '09',
            eventState: '绑定车牌成功'
          })
          this.setData({
            payResult: {
              content: '绑定成功',
              leftText: '',
              rightText: '确定',
              type: 3
            }
          })
        } else {
          tracking({
            event: '09',
              eventState: '绑定车牌失败'
          })
          this.setData({
            payResult: {
              content: res.data.msg || '绑定失败',
              leftText: '',
              rightText: '确定',
              type: 0
            }
          })
        }

        this.dialog.showDialog()
      },
      fail: (res) => { }
    });

  },

  _cancelEvent() {
    this.setData({
      carNumber: [],
    })
  },

  confirmEvent() {
    this.setData({
      carNumber: [],
    })
  },

  onRightClick() {
    var pages = getCurrentPages();
    if (pages.length > 1) {
      var prePage = pages[pages.length - 2];
      prePage.getCarList();

      wx.navigateBack({
        delta: 1,
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      tracking({
          event: '06',
          eventState: '进入成功'
      })
  },
})