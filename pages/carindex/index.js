const app = getApp();
let ruleLink = '';
var burialPoint = require('../../rtmap/coupons/utils/track.js');
import {
  requestEndPoints,
  httpWithParameter,
  postRequestWithParameter
} from "../../car/utils/httpUtil.js";
var avatar = '/images/head_default.png'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    isLogin: false,
    avatar: avatar,
    unbindTitle: '',
    myCars: [],
    surplusCarNum: 0,
    surplusParkInfo: {},
    selCarItem: '',
    carsInfo: {
      surplus: 0,
      total: 0,
      list: []
    },
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
  onLoad: function() {
    this.setData({
      avatar: wx.getStorageSync('userInfo').avatar || avatar
    })
    this.dialogAct = this.selectComponent('#dialogAct')
    this.dialog = this.selectComponent('#dialog');

  },

  // 登录判断跳转
  checkLogin(t = true) {
    const userInfo = wx.getStorageSync('member');
    if (userInfo) {
      if (app.globalData.isUserInfoUpdated) {
        app.globalData.isUserInfoUpdated = false
        wx.startPullDownRefresh();
      } else {
        this.setData({
          userInfo: userInfo.member,
          // avatar: userInfo.member.icon || app.globalData.WxUserInfo.avatarUrl || 'http://res.rtmap.com/wx/car/mine_head_placeholder.png',
              avatar: userInfo.member.icon || "http://res.rtmap.com/wx/parking/mine_head_placeholder.png",
          name: userInfo.member.name || ''
        })
      }
    } else {
      // this.login();
      return false;
    }
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function(res) {
    app.globalData.WxUserInfo = res.detail.userInfo
    this.login()
  },
  // 登录
  login() {
    wx.navigateTo({
        url: app.globalData.loginPath,
      success: function(res) {
        // success
      },
      fail: function(res) {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },

  getCarList(openid) {
    httpWithParameter({
      endPoint: requestEndPoints.myCarList,
      data: {
          wxAppId: app.globalData.appid,
          openid: openid || wx.getStorageSync('openid'),
          userId: wx.getStorageSync('member').member.cid,
          mobile: wx.getStorageSync('mobile')
      },
      success: res => {
        if (res.data.code == 200) {
          this.setData({
              myCars: res.data.data.myCarList ? res.data.data.myCarList.map(item => {
                  return {
                      label: item.carNumber,
                      id: item.id
                  }
              }) : []
          });
        }
      },
      fail: res => {
        console.log(res);
      }
    });
  },

  getSurplusPark(openid) {
    httpWithParameter({
      endPoint: requestEndPoints.getSurplusPark,
      data: {
        wxAppId: app.globalData.appid,
      },
      success: res => {
        if (res.data.code == 200) {
          let data = res.data.data;
          let total = 0;
          let surplus = 0;
          data.forEach(item => {
            total += item.totalNum;
            surplus += item.surplusNum;
          });
          this.setData({
            carsInfo: {
              surplus,
              total,
              list: data
            }
          });
        }
      },
      fail: res => {
        console.log(res);
      }
    });
  },

  getCarRuleInfo() {
    httpWithParameter({
      endPoint: requestEndPoints.parkingRule + app.globalData.appid,
      data: {
        memType: wx.getStorageSync('member') ? wx.getStorageSync('member').member.cardName : '',
      },
      success: res => {
        if (res.data.code == 200) {
          ruleLink = res.data.data.ruleDescLink;
          wx.setStorageSync('carRuleInfo', res.data.data);
          this.setData({
            surplusCarNum: res.data.data.carNum
          });
        }
      },
      fail: res => {
        console.log(res);
      }
    });
  },

  onUnbindClick(e) {
    burialPoint.tracking({
      event: '12',
      eventState: '点击解绑车牌'
    })
    this.dialogAct.showDialog()
    this.selCarItem = e.currentTarget.dataset.item;
    this.setData({
      unbindTitle: `您要解绑 ${this.selCarItem.label} 吗？`
    });
  },

  onAddCarClick() {
      burialPoint.tracking({
          event: '07',
          eventState: '跳转添加车牌'
      })
    wx.navigateTo({
      url: '/car/pages/addCar/addCar?myCars=' + JSON.stringify(this.data.myCars),
      success: function(res) {
      },
      fail: function(res) {
      },
      complete: function(res) {},
    })
  },

  onInputCarClick() {
      burialPoint.tracking({
          event: '07',
          eventState: '点击输入车牌缴费'
      })
    wx.navigateTo({
      url: '/car/pages/searchCar/searchCar',
      success: function(res) {
      },
      fail: function(res) {
      },
      complete: function(res) {},
    })
  },

  onSearchCarClick(e) {
        if (app.globalData.customerScore >= 0) {
            app.globalData.customerScore = undefined;
        }
      burialPoint.tracking({
          event: '07',
          eventState: '跳转缴费详情'
      })
    wx.navigateTo({
      url: '/car/pages/parkingPaly/parkingPaly?carNumber=' + e.currentTarget.dataset.item.label,
      success: function (e) {
      },
      fail: function (res) {
      },
      complete: function (res) { },
    })
  },

  toParkingRecords: function() {
      burialPoint.tracking({
          event: '07',
          eventState: '跳转缴费记录'
      })
    wx.navigateTo({
      url: '/car/pages/parkingRecords/parkingRecords',
      success: function () {
      },
      fail: function (res) {
      },
      complete: function (res) { },
    })
  },

  toParkingRules() {
      burialPoint.tracking({
          event: '07',
          eventState: '跳转缴费规则'
      })
    wx.navigateTo({
      url: '/car/pages/ruleInfo/ruleInfo?ruleLink=' + ruleLink,
      success: function () {
      },
      fail: function (res) {
      },
      complete: function (res) { },
    })
  },

  onRightClick() {
    wx.navigateBack({
      delta: 1,
    })
  },

  //确定解绑
  confirmEvent() {
    postRequestWithParameter({
        endPoint: requestEndPoints.deleteMyCar,
        data: {
            carNumber: this.selCarItem.label,
            wxAppId: app.globalData.appid,
            openid: wx.getStorageSync('openid'),
            userId: wx.getStorageSync('member').member.cid,
            mobile: wx.getStorageSync('mobile')
        },
      method: 'DELETE',
      success: res => {
        if (res.data.code == 200) {
          burialPoint.tracking({
            event: '10',
            eventState: '解绑车牌成功'
          })
          this.setData({
            payResult: {
              content: '解绑成功',
              leftText: '',
              rightText: '确定',
              type: 3
            }
          })
          this.getCarList();
        } else {
          burialPoint.tracking({
            event: '10',
            eventState: '解绑车牌失败'
          })
          this.setData({
            payResult: {
              content: res.data.msg || '解绑失败',
              leftText: '',
              rightText: '确定',
              type: 0
            }
          })
        }

      },
      fail: res => {}
    })
  },

  // 取消解绑
  cancelEvent() {
    burialPoint.tracking({
      event: '10',
      eventState: '取消解绑'
    })
    this.dialog.hideDialog()
  },

  onShow: function() {
      burialPoint.tracking({
          event: '06',
          eventState: '进入成功'
      });
    this.setData({
      isLogin: wx.getStorageSync('isLoginSucc')
    })

    this.getSurplusPark();
    this.getCarRuleInfo();
    // this.checkLogin();
    let openid = wx.getStorageSync('openid');
    if (openid) {
      // 展示列表
      this.getCarList(openid);
      this.getCarRuleInfo();
    }
  },

  onLoginClick(){
      burialPoint.tracking({
          event: '07',
          eventState: '跳转登录注册'
      })
      wx.navigateTo({
          url: `${app.globalData.loginPath}?from=停车缴费`,
          success: function(res) {},
          fail: function(res) {},
          complete: function(res) {},
      })
  }
})