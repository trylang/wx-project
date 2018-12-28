
var echoss = require('../../../utils/certificationKit/echoss/echoss-lite-min.js');
var template = require('../../../utils/certificationKit/template-min.js');

const app = getApp()
import {
  requestEndPoints,
  httpWithParameter,
  postRequestWithParameter
} from '../../../rtmap/coupons/utils/httpUtil.js';

Page({
  data: {
    visibleRule: false,
    visibleShops: false,
    inputMoney: null,
    isShow: false,
    isClick: false,
    sealRules: '',
    appId: '',
    licenseId: '',
    sealShopsList: [],
    convertData: {
      title: '积分失败',
      titleImg: 'http://res.rtmap.com/wx/seal/error.png',
      content: '请输入金额',
    }
  },
  inputMoneyHandler(e) {
    this.setData({
      inputMoney: e.detail.value
    })
  },

  echossTouchStart: template.onHandleTouchEvent,
  echossTouchMove: template.echossTouchMove,
  echossTouchEnd: template.echossTouchEnd,
  echossTouchCancel: template.echossTouchCancel,
  echossCkitEvent: template.echossCkitEvent,
  echossIconEvent: template.echossIconEvent,
  echossIconInputEvent: template.echossIconInputEvent,
  echossAuthEvent: echoss.Common.onDetectEvent,
  echossGetUserInfo: echoss.Common.onDetectUserEvent,

  callCkitPage() {
    if (this.data.inputMoney <= 0) {
      wx.showToast({
        title: '请输入正整数',
        icon: 'none'
      })
      return;
    }
    if (!this.data.appId && !this.data.licenseId) {
      wx.showToast({
        title: '没有印章权限',
        icon: 'none'
      })
      return;
    }
    var reg = /^\d+(\.\d{1,2})?$/;
    if (this.data.inputMoney > 999999.99 || !reg.test(this.data.inputMoney)) {
      wx.showToast({
        title: '最多输入999999.99',
        icon: 'none'
      })
      return;
    }
    template.setBackgroundColor("#000000");
    template.setBackgroundOpacity("0.4");
    template.setDescription("Please take a stamp on screen.");
    template.setLoadingYn("Y");
    template.setIconYn("Y");

    template.showEchossCertificationPage({
      app: this,
      appId: this.data.appId,
      licenseId: this.data.licenseId,
      regionCode: template.REGION_CODE_TYPE.CHINA,
      languageCode: template.LANGUAGE_CODE_TYPE.CHINESE,
      userCode: wx.getStorageSync('openid') || "U0001",
      extData: {
        type: "SPM",
        service: "POINT",
        price: this.data.inputMoney
      }
      //merchantCode  : "V00A001B001M00001",
      //authKey: ""
    }, (errorCode, errorMessage) => {
      console.log("initError: " + errorMessage + "(" + errorCode + ")");
      this.resetStatus()
      this.setData({
        convertData: {
          title: '签章失败',
          titleImg: 'http://res.rtmap.com/wx/seal/error.png',
          content: errorMessage,
        }
      })
      this.showALert()
    });
  },

  // 获取电子章积分规则
  getsealRule() {
    var _self = this;
    httpWithParameter({
      endPoint: requestEndPoints.sealRules + wx.getStorageSync('member').miniFans.tenantId,
      // data: {
      //   // tenantId: app.globalData.tenantId
      // },
      success(res) {
        if (res.data.status == 200) {
          _self.setData({
            sealRules: res.data.data.rules
          })
        }
      }
    })
  },
  // 获取SDK的appis和licenseld接口
  getSeal() {
    var _self = this;
    httpWithParameter({
      endPoint: requestEndPoints.sealDetail,
      data: {
        tenantId: wx.getStorageSync('member').miniFans.tenantId
      },
      success(res) {
        if (res.data.data.code == 200) {
          _self.setData({
            appId: res.data.data.appId,
            licenseId: res.data.data.licenseId,
          })
        }
      }
    })
  },
  getsealStore() {
    var _self = this;
    httpWithParameter({
      endPoint: requestEndPoints.sealShops + wx.getStorageSync('member').miniFans.tenantId,
      // data: {
      //   // tenantId: app.globalData.tenantId,
      //   tenantId: 290,
      // },
      success(res) {
        if (res.data.status == 200) {
          _self.setData({
            sealShopsList: res.data.data.list
          })
        }
      }
    })
  },
  showRuleHandler() {
    this.setData({
      visibleRule: true
    })
    this.getsealRule();
  },
  closeRuleHandler() {
    this.setData({
      visibleRule: false
    })
  },
  showShopsHandler() {
    this.setData({
      visibleShops: true
    })
    this.getsealStore();
  },
  closeShopsHandler() {
    this.setData({
      visibleShops: false
    })
  },
  showALert() {
    wx.hideLoading()
    this.setData({
      isShow: true
    })
  },
  hideALert() {
    this.setData({
      isShow: false
    })
  },
  resetStatus() {
    this.setData({
      isClick: false,
    })
  },
  onLoad() {
    let manager = wx.getBackgroundAudioManager()
    let that = this
    that.getSeal();
    template.initializeSuccess = () => {
      console.log("initialize success");
      //console.log("onBeforeStamp");
      this.setData({
        isClick: true,
      })
    }

    template.onBeforeStamp = () => {
      // console.log("onBeforeStamp");
      // manager.title = '签章'
      // manager.src = 'https://web.echoss.cn/platform/ckit/sounds/stamp_sound.mp3'
    }
    template.certSuccess = (result) => {
      console.log(result);
      if(!that.data.isClick) {
        return
      }
      manager.title = '签章'
      manager.src = 'https://web.echoss.cn/platform/ckit/sounds/stamp_sound.mp3'
      that.resetStatus()
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      console.log("test______start", {
          "adjustValue": that.data.inputMoney, //交易金额
          "cid": wx.getStorageSync('member').cid, //用户id
          "appId": "wx169cc199f585334c",
          "token": result.token,
          "tenantId": wx.getStorageSync('member').miniFans.tenantId
      });
      wx.Request({
        url: 'https://wx-mini.rtmap.com/wxapp-seal/points/exchange',
        data: {
          "adjustValue": that.data.inputMoney, //交易金额
          "cid": wx.getStorageSync('member').cid, //用户id
          "appId": this.data.appId,
          "cardId": wx.getStorageSync('member').member.cardId, //会员卡号
          "token": result.token,
          "tenantId": wx.getStorageSync('member').miniFans.tenantId
        },
        method: 'POST',
        dataType: 'json',
        success: (res) => {
          console.log("test______start",res);
          if (res.data.status == 200) {
            this.setData({
              convertData: {
                title: '积分成功',
                titleImg: 'http://res.rtmap.com/wx/seal/success.png',
                content: '',
                convert: res.data.data
              },
              inputMoney: ''
            })
            this.showALert()
          } else {
            this.setData({
              convertData: {
                title: '签章失败',
                titleImg: 'http://res.rtmap.com/wx/seal/error.png',
                content: res.data.message
              }
            })
            this.showALert()
          }
        },
        fail: (res) => {
          this.setData({
            convertData: {
              title: '签章失败',
              titleImg: 'http://res.rtmap.com/wx/seal/error.png',
              content: '签章积分失败',
            }
          })
          this.showALert()
        },
        complete: function (res) {
          wx.hideLoading()
        },
      })
    }
    template.certError = (errorCode, errorMessage) => {
      this.resetStatus()
    }
  },
})
