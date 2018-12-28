// pages/mine/mine.js
import {
  httpWithParameter,
  requestEndPoints
} from '../../utils/httpUtil.js'

import maHttpUtil from '../../utils/maHttpUtil.js'
import {
  config
} from '../../../../utils/config.js'
import {
  handleRequest,
  giftsEndUrl
} from '../../../../utils/util_new_gift.js'
import {
  tracking
} from '../../utils/track.js'
const app = getApp();
var avatar = '/images/head_default.png';
var bg_img = '/images/bg_img.png';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    name: '',
    avatar: avatar,
    applications: [{
        icon: '../../static/images/mine_orders.png',
        title: '我的订单',
        url: '../orderlist/orderlist'
      },
      {
        icon: '../../static/images/mine_credits.png',
        title: '拍照积分',
        url: '../../../../pages/photo-new/index/index'
      },
      {
        icon: '../../static/images/mybonus.png',
        title: '我的奖金',
        url: '../mybonus/mybonus'
      },
      {
        icon: '../../static/images/mine_setting.png',
        title: '设置',
        url: '../setting/setting'
      }
    ],
    benefits: [],
    // benefits: [{
    //         icon: '../../static/images/mine_benefits_parking.png',
    //         title: '停车优惠'
    //     },
    //     {
    //         icon: '../../static/images/mine_benefits_discount.png',
    //         title: '会员折扣'
    //     },
    //     {
    //         icon: '../../static/images/mine_benefits_birth.png',
    //         title: '生日特权'
    //     },
    //     {
    //         icon: '../../static/images/mine_benefits_gift.png',
    //         title: '专享好礼'
    //     }
    //],
    credits: 0,
    couponsCount: 0,
    cardName: '',
  },

  /**
   * 加载
   */
  onLoad: function() {

  },

  /**
   * 页面显示
   */
  onShow: function() {
    tracking({
      event: '06',
      eventState: '进入成功'
    })
    if (!app.globalData.memberHandbook) {
      httpWithParameter({
        endPoint: requestEndPoints.memberHandbook + '/' + app.globalData.tenantId,
        data: {
          marketId: app.globalData.tenantId
        },
        success: (res) => {
          if (res.data.code === 200) {
            var obj = {
              memberHandbook: res.data.data
            }
            app.globalData.memberHandbook = res.data.data
            if (!this.data.userInfo && res.data.data.defaultImg) {
              obj.avatar = res.data.data.defaultImg;
              avatar = res.data.data.defaultImg;
            }
            if (!obj.memberHandbook.backgroundImg) {
              obj.memberHandbook.backgroundImg = bg_img;
            }
            this.setData(obj);
          }
        },
        fail: (res) => {
          console.log('fail', res);
        }
      })
    } else {
      var obj = {}
      if (app.globalData.memberHandbook) {
        obj.memberHandbook = app.globalData.memberHandbook;
        if (app.globalData.memberHandbook.defaultImg) {
          avatar = app.globalData.memberHandbook.defaultImg;
          if (!this.data.userInfo) {
            obj.avatar = app.globalData.memberHandbook.defaultImg;
          }
        }
        if (!obj.memberHandbook.backgroundImg) {
          obj.memberHandbook.backgroundImg = bg_img;
        }
        this.setData(obj);
      }
    }
    if (this.checkLogin(false)) {
      this.flashUserInfo()
      const userInfo = wx.getStorageSync('member').member
      const cid = userInfo.cid

      maHttpUtil.httpWithParameter({
        endPoint: maHttpUtil.requestEndPoints.membershipCredits,
        data: {
          tenantType: 1,
          tenantId: app.globalData.tenantId,
          cid: cid
        },
        success: (res) => {
          console.log(res)
          if (res.data.status === 200) {
            this.setData({
              credits: res.data.data.balance
            })
          }
        },
        fail: (res) => {
          console.log('fail', res);
        }
      });
      maHttpUtil.httpWithParameter({
        endPoint: maHttpUtil.requestEndPoints.membershipCredits,
        data: {
          tenantType: 1,
          tenantId: app.globalData.tenantId,
          cid: cid
        },
        success: (res) => {
          console.log(res)
          if (res.data.status === 200) {
            this.setData({
              credits: res.data.data.balance
            })
          }
        },
        fail: (res) => {
          console.log('fail', res);
        }
      });
      httpWithParameter({
        endPoint: requestEndPoints.memberRight,
        data: {
          marketId: app.globalData.tenantId,
          card: userInfo.cardId
        },
        success: (res) => {
          if (res.data.code === 200) {
            this.setData({
              benefits: res.data.data.list
            })
          }
        },
        fail: (res) => {
          console.log('fail', res);
        }
      })
    }
  },

  getCoupons() {
    //重置优惠券数量
    let couponsCounts = 0
    httpWithParameter({
      endPoint: requestEndPoints.getCouponCount,
      data: {
        openId: wx.getStorageSync('openid'),
        portalId: app.globalData.tenantId,
        crmId: wx.getStorageSync('member').cid
      },
      success: (res) => {
        if (res.data.status === 200) {
          couponsCounts += res.data.data
          this.setData({
            couponsCount: couponsCounts
          })
        }
      },
      fail: (res) => {
        console.log('fail', res);
      },
      complete: (res) => {
        console.log('complete')
        // 获取服务号优惠券数量
        if (wx.getStorageSync('wxopenid')) {
          httpWithParameter({
            endPoint: requestEndPoints.getCouponCount,
            data: {
              openId: wx.getStorageSync('wxopenid'),
              portalId: app.globalData.tenantId,
              crmId: wx.getStorageSync('member').cid
            },
            success: (res) => {
              if (res.data.status === 200) {
                couponsCounts += res.data.data
                this.setData({
                  couponsCount: couponsCounts
                })
              }
            },
            fail: (res) => {
              this.setData({
                couponsCount: couponsCounts
              })
            }
          });
        }
      }
    });
  },

  /**
   * 登录
   */
  login: function() {
      tracking({
          event: '07',
          eventState: '跳转登录注册'
      })
    wx.navigateTo({
        url: `${app.globalData.loginPath}?from=我的`,
      success: function(res) {
      },
      fail: function(res) {
      }
    })
  },

  /**
   * 刷新用户信息
   */
  flashUserInfo: function() {
    let That = this
    let openid = wx.getStorageSync('openid');
    let mobile = wx.getStorageSync('mobile');
    let unionid = wx.getStorageSync('unionid');
    this.getCoupons()

    const userInfo = wx.getStorageSync('member').member
    const cid = userInfo.cid
    this.setData({
      cardName: userInfo && userInfo.cardName || {}
    })

    maHttpUtil.httpWithParameter({
      endPoint: maHttpUtil.requestEndPoints.membershipCredits,
      data: {
        tenantType: 1,
        tenantId: app.globalData.tenantId,
        cid: cid
      },
      success: (res) => {
        console.log(res)
        if (res.data.status === 200) {
          this.setData({
            credits: res.data.data.balance
          })
        }
      },
      fail: (res) => {
        console.log('fail', res);
      }
    });
    handleRequest(giftsEndUrl.handleLogin, {
      mobile: mobile,
      openId: openid,
      registerSourceId: '',
      registerSource: '',
      appid: app.globalData.appid,
      tenantId: app.globalData.tenantId,
      unionid: unionid,
      tenantType: 1,
      headPortrait: '',
      nickName: ''
    }, 'post', function(res) {
      wx.stopPullDownRefresh()
      if (res.data.code == 200) {
        const userInfo = JSON.parse(res.data.data)
        if (app.globalData.WxUserInfo) {
          let userName = userInfo.member.name || app.globalData.WxUserInfo.nickName || ''
          That.setData({
            userInfo: userInfo.member,
            avatar: userInfo.member.icon || app.globalData.WxUserInfo.avatarUrl || avatar,
            name: userName ? userName.substr(0, 6) : '游客'
          })
        } else {
          let userName = userInfo.member.name || ''
          That.setData({
            userInfo: userInfo.member,
            avatar: userInfo.member.icon || avatar,
            name: userName ? userName.substr(0, 6) : '游客'
          })
        }

        wx.setStorageSync('isLoginSucc', true)
        wx.setStorageSync('member', userInfo)
      }
    }, function(res) {
      wx.stopPullDownRefresh()
    }, false)
  },

  /**
   * 编辑用户信息
   */
  editInfo: function() {
    if (!this.checkLogin()) return
      tracking({
          event: '07',
          eventState: '跳转我的信息'
      })
    wx.navigateTo({
      url: '../userInfo/userInfo',
      success: function(res) {
      },
      fail: function(res) {
      }
    })
  },

  /**
   * 公用功能列表点击
   */
  onClickApplication: function(e) {
    const index = e.currentTarget.dataset.index;

    //if (index == 0) {
    if (!this.checkLogin()) return
      tracking({
          event: '07',
          eventState: '跳转功能配置'
      })
    wx.navigateTo({
      url: this.data.applications[index].url, //'../orderlist/orderlist',
      success: function(res) {
      },
      fail: function(res) {
      }
    });
  },

  /**
   * 会员权益功能点击
   */
  onClickBenefits: function(e) {
      tracking({
          event: '07',
          eventState: '跳转权益配置'
      })
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: this.data.benefits[index].link,
    })
  },

  /**
   * 点击我要升级
   */
  upgrade: function() {
      tracking({
          event: '07',
          eventState: '跳转我要升级'
      })
    wx.navigateTo({
      url: `/rtmap/coupons/pages/webView/webView?link=membertip`,
      success: function(res) {
      },
      fail: function(res) {
      },
      complete: function(res) {},
    })
  },

  /**
   * 会员二维码弹窗取消
   */
  cancelEvent() {
    const dialog = this.selectComponent("#dialog");
    if (dialog) {
      dialog.hideDialog();
    }
  },

  /**
   * 头像加载失败处理
   */
  headLoadFail: function(e) {
    this.setData({
      avatar: avatar
    });
  },

  /**
   * 展示QR
   */
  displayMembershipQR: function() {
    tracking({
      event: '12',
      eventState: '显示购物电子卡'
    })
    const dialog = this.selectComponent("#dialog");
    if (dialog) {
      dialog.showDialog();
    }
  },

  /**
   * 查看积分
   */
  checkCredits: function() {
    //关闭积分流水
      tracking({
          event: '07',
          eventState: '跳转积分流水'
      })
    wx.navigateTo({
      url: '../credits/credits',
      success: function(res) {
      },
      fail: function(res) {
      }
    })
  },

  /**
   * 查看优惠券
   */
  checkCoupons: function() {
      tracking({
          event: '07',
          eventState: '跳转我的优惠券'
      })
    wx.navigateTo({
      url: '../couponList/couponList',
      success: function(res) {
      },
      fail: function(res) {
      }
    })
  },

  /**
   * 登录判断跳转
   */
  checkLogin: function(t = true) {
    const userInfo = wx.getStorageSync('member')
    console.log(userInfo)
    if (userInfo) {
      if (app.globalData.isUserInfoUpdated) {
        app.globalData.isUserInfoUpdated = false
        wx.startPullDownRefresh()
      } else {
        if (app.globalData.WxUserInfo) {
          this.setData({
            userInfo: userInfo.member,
            avatar: userInfo.member.icon || app.globalData.WxUserInfo.avatarUrl || avatar,
            name: userInfo.member.name || app.globalData.WxUserInfo.nickName || ''
          })
        } else {
          this.setData({
            userInfo: userInfo.member,
            avatar: userInfo.member.icon || avatar,
            name: userInfo.member.name || ''
          })
        }
      }
      return true
    } else {
      if (t) {
        this.login()

        return false
      }

      if (app.globalData.isUserInfoUpdated) {
        app.globalData.isUserInfoUpdated = false

        this.setData({
          userInfo: null,
          avatar: avatar,
        })
      }
      return false
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    if (!this.checkLogin(false)) return
    this.flashUserInfo()
  },

  /**
   * 获取用户信息
   */
  getUserInfo: function(res) {
    console.log('getUserInfo', res)
    app.globalData.WxUserInfo = res.detail.userInfo;
    wx.setStorageSync('userInfo', res.detail.userInfo);
    this.login()
  }
})