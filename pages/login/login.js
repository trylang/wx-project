//获取应用实例
const app = getApp()
import {
  handleRequest,
  giftsEndUrl
} from '../../utils/util_new_gift.js'
const util = require('../../utils/util.js');
import {
  tracking
} from '../../rtmap/coupons/utils/track.js'
import {config} from "../../utils/config.js"
import {
  requestEndPoints,
  httpWithParameter,
  postRequestWithParameter
} from '../../rtmap/coupons/utils/httpUtil.js'
Page({ 
  //页面变量
  data: {
    isShow: false,
    logoIcon: '../../images/logo.png',
    openid: '',
    code: '',
    phone: '',
    time: '',
    timemap: 0,
    loginBtn: true,
    activity_url: 'https://wx-mini.rtmap.com/',
    mobile: '',
    truePwd: false,
    registerSourceId: '',
    registerSource: '',
    lastTime: '',
    yanzhengma: '',
    member: null,
    getChange: true,
    btn_code: '获取验证码',
    projectTitle: app.globalData.projectTitle,
    mobileFlag: true,
    showPhone: false,
    showSetRight: false,
    isMemberRegistTurntable: false
  },

  getPhoneNum(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  handlleInput(e) {
    this.setData({
      code: e.detail.value
    })
  },

  handleSendMessage() {
    let That = this
    let keyAdmin = wx.getStorageSync('keyAdmin')
    handleRequest(giftsEndUrl.sendMessage, {
      mobile: this.data.phone,
      portalId: app.globalData.tenantId
    }, 'post', function (res) {
      if (res.data.code == 200) {
        wx.showModal({
          title: '提示',
          content: '发送验证码成功',
          showCancel: false
        })
        let timemap = new Date().getTime()
        That.setData({
          timemap: timemap + 60000
        })
        That.getInterval()
        That.setData({
          getChange: false,
          yanzhengma: res.data.yanzhengma
        })
      } else {
        // wx.showModal({
        //   title: '提示',
        //   content: res.data.msg,
        //   showCancel: false
        // })
      }
    }, function (res) {
      wx.showToast({
        title: '网络异常，请检查网络',
        icon: 'none',
        duration: 2000
      })
    })
  },

  handleLoginCreate() {
    if (this.data.code) {
      if (this.data.yanzhengma == this.data.code) {
        wx.setStorageSync('mobile', this.data.phone)
        this.handleLogin()
      } else {
        wx.showToast({
          title: '验证码错误',
          icon: 'none',
          duration: 2000
        })
      }
    } else {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 2000
      })
    }

  },

  getActivityCount(id) {
    let That = this;
    let openid = wx.getStorageSync('openid');
    wx.showLoading({
      title: '加载中'
    })
    wx.Request({
      url: config.BaseUrl+'overlord/app/addCard',
      data: {
        activityId: id,
        openid: openid,
        appId: app.globalData.appid
      },
      method: 'Get',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
      },
      fail: function (res) {
      }
    });
  },

  getIndexActivityDetail() {
    let That = this;
    wx.showLoading({
      title: '加载中'
    })
    wx.Request({
        url: config.BaseUrl + 'overlord/app/getActivityByMarketId/' + app.globalData.tenantId,
      data: {},
      method: 'Get',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.code == 200) {
          That.getActivityCount(res.data.data.activityId)
        }

      },
      fail: function (res) {
        console.log(res)
      }
    });
  },

  getInterval() {
    let that = this;
    const timemap = new Date().getTime()
    var n = Math.floor((this.data.timemap - timemap) / 1000);
    if (that.data.getChange) {
      this.setData({
        getChange: false
      })
      this.data.lastTime = setInterval(function () {
        var str = '剩余' + n + '秒'
        that.setData({
          btn_code: str
        })
        if (n <= 0) {
          clearInterval(that.data.lastTime);
          that.setData({
            getChange: true,
            btn_code: '重新获取'
          })
        }
        n--;
      }, 1000);
    }
  },

  getCode() {
    var that = this;
    var phone = this.data.phone;
    if (!(/^1[3|4|5|8|7|6|9|2][0-9]\d{4,8}$/.test(phone))) {
      wx.showModal({
        title: '提示',
        content: '手机号码有误，请仔细核对',
        showCancel: false
      })
    } else {
      clearInterval(this.data.time);
      this.handleSendMessage()

    }
  },

  showDialog() {
    this.setData({
      mobileFlag: false
    })
  },

  handleClose() {
    this.setData({
      mobileFlag: true,

    })
  },

  doLogin: function (e) {
    var that = this
    wx.login({
      success: function (loginRes) {
        if (loginRes.code) {
          httpWithParameter({
            endPoint: requestEndPoints.getSession,
            data: {
              jsCode: loginRes.code,
              appId: app.globalData.appid,
            },
            success: (res) => {
              if (res.data.status === 200) {
                wx.setStorageSync('openid', res.data.data.openid)
                wx.setStorageSync('sessionId', res.data.data.sessionId)
                wx.setStorageSync('unionid', res.data.data.unionid)
              } else {
                wx.showToast({
                  title: '请求登录失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: (res) => {
              console.log('fail', res);
            }
          });
        }
      }
    });
  },

  getPhoneNumber(e) {
    this.getMobile(e);
  },

  getUserInfo(e) {
    if (e.detail.userInfo) {
      app.globalData.WxUserInfo = e.detail.userInfo;
      wx.setStorageSync('userInfo', e.detail.userInfo);
      this.setData({
        showPhone: true
      })
    } else {
      this.setData({
        showSetRight: true
      })
    }
  },
  closePhone() {
    this.setData({
      showPhone: false
    })
  },
  closeSetRight() {
    this.setData({
      showSetRight: false
    })
  },
  getMobile(e) {
    let openid = wx.getStorageSync('openid');
      console.log(openid)
    let That = this;
    postRequestWithParameter({
      endPoint: requestEndPoints.decodeUserInfo,
      data: {
        appId: app.globalData.appid,
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData,
        openid: openid
      },
      success: (res) => {
        if (res.data.status === 200) {

          this.setData({
            mobile: res.data.data.phoneNumber
          })
          wx.setStorageSync('mobile', res.data.data.phoneNumber)
          That.handleLogin()
        } else {
          // wx.showToast({
          //     title: res.data.message,
          //     icon: 'none',
          //     duration: 2000
          // })
        }
      },
      fail: (res) => {
        console.log('fail', res);
      }
    });
  },

  LoginCoupon() {
    let openid = wx.getStorageSync('openid');
    let mobile = wx.getStorageSync('mobile');
    var keyAdmin = wx.getStorageSync('keyAdmin');
    var unionid = wx.getStorageSync('unionid');
    let That = this;
    postRequestWithParameter({
      endPoint: requestEndPoints.login,
      data: {
        portalId: app.globalData.tenantId,
        openId: openid,
        crmId: wx.getStorageSync('member').cid,
        mobile: mobile,
          name: wx.getStorageSync('userInfo')?wx.getStorageSync('userInfo').nickName:'游客',
          faceImage: wx.getStorageSync('userInfo')?wx.getStorageSync('userInfo').avatarUrl:'https://res.rtmap.com/wx/all/head_default.png',
        unionId: unionid
      },
      success: (res) => {
        if (res.data.status === 200) {
          console.log('券平台登录成功')
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function () {
              tracking({
                  event: '07',
                  eventState: '返回上一级'
              })
            wx.navigateBack({ //返回上一级
              delta: 1,
              success: function (res) {
              },
              fail: function (res) {
              }
            })

          }, 500);
          //数据埋点
          
        //没调此接口
        //   wx.Request({
        //     url: 'https://memo.rtmap.com/marketweb/bubugao/crm',
        //     data: {
        //       mobile: mobile,
        //       keyAdmin: keyAdmin,
        //       openid: openid,
        //       unionid: unionid
        //     },
        //     method: 'Get',
        //     header: {
        //       'content-type': 'application/json'
        //     },
        //     success: function (res) { },
        //     fail: function (res) {
        //       console.log(res)
        //     }
        //   });
        }
      },
      fail: (res) => {
        console.log('fail', res);
      }
    });
  },

  handleLogin() {
    let That = this
    let openid = wx.getStorageSync('openid');
    let mobile = wx.getStorageSync('mobile');
    let userInfo = wx.getStorageSync('userInfo');
    let unionid = wx.getStorageSync('unionid');
    That.setData({
      loginBtn: false
    })
    console.log('-----------That.data.registerSource------------->:', That.data.registerSource);
    handleRequest(giftsEndUrl.handleLogin, {
      // mobile: mobile,
      // openId: openid,
      // registerSourceId: That.data.registerSourceId,
      // registerSource: That.data.registerSource,
      // appid: app.globalData.appid,
      // tenantId: app.globalData.tenantId,
      // name: wx.getStorageSync('userInfo').nickName,
      // unionid: unionid,
      // tenantType: 1,
      // headPortrait: '',
      // nickName: ''

      mobile: mobile,
      openId: openid,
      registerSourceId: That.data.registerSourceId,
      registerSource: That.data.registerSource,
      appid: app.globalData.appid,
      tenantId: app.globalData.tenantId,
      unionid: unionid,
      tenantType: 1,
      headPortrait: '',
      nickName: ''
    }, 'post', function (res) {
      if (res.data.code == 200) {
        if (That.data.isMemberRegistTurntable && res.data.isMemberRegist) {
            app.globalData.isMemberRegistTurn = res.data.isMemberRegist
        }
        if (res.data.type == 'register') {
          tracking({
            event: '03',
            eventState: '注册成功'
          })
          That.getIndexActivityDetail() //霸王餐活动
        } else {
          tracking({
            event: '04',
            eventState: '登陆成功'
          })
        }
        That.setData({
          member: JSON.parse(res.data.data),
          mobileFlag: true,
          loginBtn: true
        })
        wx.setStorageSync('isLoginSucc', true)
        //wxopenid 是服务号openid，  openid 是小程序openid
        wx.setStorageSync('wxopenid', res.data.wxopenid || '')//wx.getStorageSync('openid')
        wx.setStorageSync('member', That.data.member)
        That.LoginCoupon()
      } else {
        That.setData({
          loginBtn: true
        })
        // wx.showToast({
        //   title: res.data.message,
        //   icon: 'none',
        //   duration: 2000
        // })
      }
    }, function (res) {
      That.setData({
        loginBtn: true
      })
      wx.showToast({
        title: '网络异常，请检查网络',
        icon: 'none',
        duration: 2000
      })
    })
  },

  onShow() {
    let openid = wx.getStorageSync('openid');
    this.doLogin();
    this.setData({
      showSetRight: false
    })
    // if (openid) {
    //     wx.checkSession({
    //         success: function () {
    //             console.log('有效(未过期)')
    //         },
    //         fail: function () {
    //           console.log('onShow ： 重新登录')
    //             this.doLogin();
    //         }
    //     });
    // }else{
    //   console.log('onShow else： 重新登录')
    //     this.doLogin();
    // }
    if (!app.globalData.WxUserInfo) {
      wx.getUserInfo({
        success: res => {
          //console.log(res,wx.getStorageSync('userInfo'));
          wx.setStorageSync('userInfo', res.userInfo)
          app.globalData.WxUserInfo = res.userInfo
          this.setData({
            hashead: true
          })
        },
        fail: res => {
          //console.log(res);

        }
      })
    }
  },

  onLoad(options) {
    var hashead = !!app.globalData.WxUserInfo
    this.setData({
      registerSourceId: options.sourceid ? options.sourceid : '',
      registerSource: options.from ? options.from : '',
      hashead: hashead,
      isMemberRegistTurntable: options.isMemberRegistTurntable ? options.isMemberRegistTurntable : false
    })
  }
})