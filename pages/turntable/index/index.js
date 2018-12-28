//获取应用实例

const app = getApp()
const ctx = wx.createCanvasContext("canvasI", this); //创建id为canvasI的绘图
const ctx2 = wx.createCanvasContext("bgCanvas", this);//创建id为bgCanvas的背景绘图
import { handlePresentRequest, giftsEndUrl } from '../../../utils/util_new_gift.js'
var wxParse = require('../../components/wxparse/wxparse.js');
import '../../../utils/tween.js'
import { tracking } from '../../../rtmap/coupons/utils/track.js'
import maHttpUtil from '../../../rtmap/coupons/utils/maHttpUtil.js'
var w1 = '';
var h1 = '';
Page({
  /**
     * 页面的初始数据
     */
  data: {
    //转盘积分兑换变量
    score: 0,
    score_count: 0,
    pre_score: 10,
    integralSX: 0,//每天最大可兑换次数
    type_icon: 'cancel',
    icon_title: '兑换失败',
    isScoreShow: false,
    changeBtn: false,//积分兑换成功与否的弹框控制
    isGetShow: false,//是否获奖弹窗
    chanceNum: 0,//剩余机会
    //弹框变量
    bgColor: '#fff',
    activityDetail: '',
    modal_title: '',
    modal_content: '',
    backBtn: false,
    activityId: '',
    isLogin: false,
    //分享变量
    shareTitle: '',
    shareImage: '',
    animationData: '',
    homePageImage: '',
    turntableRegionId: 0,//中奖区域
    trunBtn: true,//是否可以点击转
    //转盘样式
    turntableImage: '',
    cryLogo: '../../../images/new_gift/cry.png',
    register_color: '#eeeeee',
    share_color: '',
    bg_color: '',
    tempFilePath: '',
    couponTitle: '',
    newActivityId: '',
    ruleImage: '',
    winningImage: '',
    loginName: '',
    canYuCount: 0,
    modal_logo: '',
    pricelist: [],
    content: '<p>暂无规则</p>',
    itemsNum: 6, //大转盘等分数
    itemsArc: 0, //大转盘每等分角度
    color: ["#ffef8e", "#fffcd1", "#FFD8A7"],//扇形的背景颜色交替；
    coupons: [],//每个扇形中的优惠券
    isRotate: 0,//旋转角度
    isFromShare: 'false',
    isMove: false,
  },

  hiddenModal() {
    this.setData({
      isGetShow: false
    })
  },
  /*跳转奖品页面*/
  handleLinkPrice() {
      if (!wx.getStorageSync("isLoginSucc")) {
          this.handleLinkLogin();
          return;
      }
    wx.navigateTo({
      url: '/pages/turntable/price/index',
      success: function (res) {

      },
      fail: function (res) {
      }
    })
    this.setData({
      isGetShow: false
    })
  },

  handleTouchMove() {

  },
  /*跳转首页*/

  handleLinkIndex() {
    wx.switchTab({
      url: '/pages/index/index',
      success: function (res) {
        tracking({
          event: '07',
          eventState: '跳转成功'
        })
      },
      fail: function (res) {
        tracking({
          event: '07',
          eventState: '跳转失败'
        })
      }
    })
  },
  /*分享*/
  onShareAppMessage(res) {
    tracking({
      event: '12',
      eventState: '分享抽奖机会'
    })
    let member = wx.getStorageSync('member');
    this.setData({
      isGetShow: false
    })
    if(member.member){
        this.shareInsert();
    }
      //埋点数据
      tracking({
          event: '02',
          eventState: '转发'
      })
    return {
      title: this.data.shareTitle,
      path: '/pages/turntable/index/index?protalId=' + app.globalData.tenantId + '&activityId=' + this.data.activityId + "&isFromShare=true",
      imageUrl: this.data.shareImage,
      success: res => {
        // wx.showToast({
        //   title: '分享成功',
        //   icon: 'success',
        //   duration: 2000
        // })
      },
      error: res => {
        // wx.showToast({
        //   title: '分享失败',
        //   icon: 'error',
        //   duration: 2000
        // })
        this.setData({
          isGetShow: false
        })
      }
    }

  },
  //页面滑动监听
  onPageScroll(res) {
    if (this.data.isMove) return;
    this.setData({
      isMove: true
    });
    setTimeout(() => {
      this.setData({
        isMove: false
      });
    }, 800);
  },
  /*分享后次数增长接口*/
  shareInsert() {
    let mobile = wx.getStorageSync('mobile');
    let That = this;
    const params = {
      mobile: mobile,
      portalId: app.globalData.tenantId
    }

    handlePresentRequest(giftsEndUrl.shareInsert, params, 'post', function (res) {
      if (res.data.code == 200) {
        That.controlWinnerInfo()
      } else {

      }
    }, function () {

    })
  },
  /*抽奖完调用，传值1为未中奖，2为中奖*/
  handleChance(val) {
    let mobile = wx.getStorageSync('mobile');
    const params = {
      portalId: app.globalData.tenantId,
      mobile: mobile,
      turntableActivityId: this.data.activityId,
      status: val
    }
    handlePresentRequest(giftsEndUrl.changeChace, params, 'post', function (res) {

    }, function () {

    })
  },
  /*抽奖接口，抽完获取是否中奖 以及中奖区域*/
  handleChoujiang() {
    let openid = wx.getStorageSync('openid');
    let isLogin = wx.getStorageSync('isLoginSucc');
    let mobile = wx.getStorageSync('mobile');
    let member = wx.getStorageSync('member');
    let userInfo = wx.getStorageSync('userInfo');
    let That = this;
    let that = this;
    const params = {
      portalId: app.globalData.tenantId,
      subjectType: '1',
      mobile: mobile,
      nickName: userInfo.nickName,
      headimg: userInfo.avatarUrl,
      cid: member.member.cid,
      openId: openid
    }
    if (That.data.chanceNum > 0) {
      handlePresentRequest(giftsEndUrl.choujiangPort, params, 'post', function (res) {
        if (res.data.code == 200) {
          if (res.data.turntableRegionId > 0) {
              var endRotate = That.data.isRotate - That.data.isRotate % 360 + (720 - Number(res.data.turntableRegionId - 1) * That.data.itemsArc - 0.5 * That.data.itemsArc - 90 + 1440);
            That.setData({
            //   isRotate: That.data.isRotate - That.data.isRotate % 360 + (720 - Number(res.data.turntableRegionId - 1) * That.data.itemsArc - 0.5 * That.data.itemsArc - 90),
              turntableRegionId: res.data.turntableRegionId
            })
            That.handleChance(2)
            console.log(That.data.isRotate)
            console.log(res.data.turntableRegionId)
          } else {
            let arr = []
            for (let i = 0; i < That.data.coupons.length; i++) {
              if (That.data.coupons[i].validateStatus === 111) {
                arr.push(That.data.coupons[i].turntableRegionId)
              }
            }
            That.handleChance(1);
            var n = Math.floor(Math.random() * arr.length + 1) - 1
              var endRotate = That.data.isRotate - That.data.isRotate % 360 + (720 - (Number(arr[n]) - 1) * That.data.itemsArc - 0.5 * That.data.itemsArc - 90+1440);
            That.setData({
            //   isRotate: That.data.isRotate - That.data.isRotate % 360 + (720 - (Number(arr[n]) - 1) * That.data.itemsArc - 0.5 * That.data.itemsArc - 90),
              turntableRegionId: arr[n],
            })
            console.log(That.data.isRotate)
            console.log(n)
            console.log(arr[n])
          }
          That.setData({
            chanceNum: That.data.chanceNum - 1,
            couponTitle: res.data.couponJson ? JSON.parse(res.data.couponJson).mainInfo : ''
          })
          //That.controlWinnerInfo()

            Math.animation(That.data.isRotate, endRotate, 3000, 'Quad.easeInOut', function (value, isEnding) {
                That.setData({
                    isRotate: value
                })
                if(isEnding){
                    if (res.data.turntableRegionId > 0) {
                        that.setData({
                        isGetShow: true,
                        modal_title: '恭喜您！中奖啦!',
                        backBtn: false,
                        trunBtn: true,
                        modal_content: that.data.couponTitle,
                        modal_logo: '../../../images/turntable/gift.png',
                        bgColor: '#FFF6E7'
                        })
                    } else {
                        that.setData({
                        isGetShow: true,
                        backBtn: false,
                        trunBtn: true,
                        modal_title: '很遗憾，您未中奖 继续加油吧~',
                        modal_content: '',
                        modal_logo: '../../../images/turntable/empty.png',
                        bgColor: '#ffffff'
                        })
                    }
                }
            })
          //That.start(res.data.turntableRegionId)
        } else {
          that.setData({
            isGetShow: true,
            modal_title: '系统错误，请稍后再试！',
            modal_content: '',
            backBtn: true,
            modal_logo: '../../../images/turntable/empty.png',
            bgColor: '#fff'
          })
          That.setData({
            trunBtn: true
          })
        }
      }, function () {
        That.setData({
          trunBtn: true
        })
      })
    } else {
      that.setData({
        isGetShow: true,
        modal_title: '抱歉，您的次数已经用光！',
        modal_content: '',
        backBtn: true,
        modal_logo: '../../../images/turntable/empty.png',
        bgColor: '#fff'
      })
      That.setData({
        trunBtn: true
      })
    }
  },
  /*未登录时候的判断，跳入登录页面*/
  handleLinkLogin() {
    wx.navigateTo({
        url: `${app.globalData.loginPath}?sourceid=${this.data.activityId}&from=幸运转盘`,
      success: function (res) {
        tracking({
          event: '07',
          eventState: '跳转成功'
        })
      },
      fail: function (res) {
        tracking({
          event: '07',
          eventState: '跳转失败'
        })
      }
    })
  },
  /*点击抽奖的判断*/
  getStart() { 
    this.setData({
      trunBtn: false
    });
    let openid = wx.getStorageSync('openid');
    let isLogin = wx.getStorageSync('isLoginSucc');
    let mobile = wx.getStorageSync('mobile');
    let member = wx.getStorageSync('member');
    let That = this;
    let that = this;
    if (isLogin) {
      this.handleChoujiang()
    } else {
      That.setData({
        trunBtn: true
      })
      That.handleLinkLogin()
    }
  },
  /*中奖信息列表*/
  getWinnerList() {
    let mobile = wx.getStorageSync('mobile');
    let That = this;
    const params = {
      portalId: app.globalData.tenantId,
    }
    handlePresentRequest(giftsEndUrl.selectList, params, 'post', function (res) {
      if (res.data.code == 200) {
        let result = res.data
        for (var i = 0; i < result.winningDetails.length; i++) {
          result.winningDetails[i].mobile = result.winningDetails[i].mobile.substr(0, 3) + '****' + result.winningDetails[i].mobile.substr(7)
          if (result.winningDetails[i].nickName) {
            if (result.winningDetails[i].nickName.length > 3 && result.winningDetails[i].nickName.length < 5) {
              result.winningDetails[i].nickName = result.winningDetails[i].nickName.substr(0, 1) + '**' + result.winningDetails[i].nickName.substr(3)
            }
            if (result.winningDetails[i].nickName.length <= 3) {
              result.winningDetails[i].nickName = result.winningDetails[i].nickName.substr(0, 1) + '**'
            }
            if (result.winningDetails[i].nickName.length >= 5) {
              result.winningDetails[i].nickName = result.winningDetails[i].nickName.substr(0, 2) + '**' + result.winningDetails[i].nickName.substr(4)
            }
          }

        }

        That.setData({
          pricelist: result.winningDetails.length > 4 ? result.winningDetails.slice(0, 4) : result.winningDetails
        })
      } else {

      }
    }, function () {

    })
  },
  /*积分兑换弹窗*/
  handleShowScoreModal() {
    tracking({
      event: '12',
      eventState: '积分兑换'
    })
    this.getScore()
    this.handleReduceInfo()
    this.setData({
      isScoreShow: true,
      changeBtn: false
    })
  },
  /*关闭积分兑换弹窗*/
  closeScoreModal() {
    this.setData({
      isScoreShow: false,
      changeBtn: false
    })
  },
  /*扣减积分兑换次数*/
  handleReduceScore() {
    let mobile = wx.getStorageSync('mobile');
    let member = wx.getStorageSync('member');
    let That = this;
    const params = {
      portalId: app.globalData.tenantId,
      mobile: mobile,
      cid: member.member.cid,
      integralValue: -That.data.pre_score,
      tenantType: "1"
    }
    if (this.data.score >= this.data.pre_score) {
      if (this.data.integralSX - this.data.score_count == 0) {
        That.setData({
          changeBtn: true,
          type_icon: 'cancel',
          icon_title: '今日兑换次数已用完'
        })
      } else {
        handlePresentRequest(giftsEndUrl.scoreGetCount, params, 'post', function (res) {
          if (res.data.code == 200) {
            That.handleReduceInfo()
            That.getScore()
            That.setData({
              changeBtn: true,
              chanceNum: res.data.turntableWinning.luckyDrawTimes,
              type_icon: 'success',
              icon_title: '兑换成功'
            })
          } else {
            That.setData({
              changeBtn: true,
              type_icon: 'cancel',
              icon_title: '兑换失败'
            })
          }
        }, function () {

        })
      }

    } else {
      That.setData({
        changeBtn: true,
        type_icon: 'cancel',
        icon_title: '积分不足'
      })
    }


  },
  /*获取多少积分兑换一次以及每天兑换上限*/
  handleReduceInfo() {
    let mobile = wx.getStorageSync('mobile');
    let That = this;
    const params = {
      portalId: app.globalData.tenantId,
      mobile: mobile
    }
    handlePresentRequest(giftsEndUrl.scoreGetInfo, params, 'post', function (res) {
      if (res.data.code == 200) {
        That.setData({
          score_count: res.data.duihuanNum
        })
      }
    }, function () {

    })
  },

  /*获取我的积分*/
  getScore() {
    const userInfo = wx.getStorageSync('member').member
    if (userInfo) {
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
              score: res.data.data.balance
            })
          }
        },
        fail: (res) => {
          console.log('fail', res);
        }
      });
    }

  },
  /*开始旋转 以及弹窗显示*/
  start(turntableRegionId) {
    let that = this;
    // 指定获奖结果
    let n = that.data.isRotate; //传入指定的旋转角度，内部指定获奖结果。在指定角度上加上旋转基数模拟转盘随机旋转。
    //随机获奖结果
    let rand = Math.random() * 1000;//取一个随机的旋转角度，使获奖结果随机化。

    n = n + 1440; //1440为旋转基数，最低要旋转1440度，即4圈。rand-(rand%60) 这个是让指针永远停在扇形中心的算法。n + 是为了重复点击的时候有足够的旋转角度。
    // that.setData({
    //   isRotate: n,
    // })
    // setTimeout(function () {
    //   if (turntableRegionId > 0) {
    //     that.setData({
    //       isGetShow: true,
    //       modal_title: '恭喜您！中奖啦!',
    //       backBtn: false,
    //       trunBtn: true,
    //       modal_content: that.data.couponTitle,
    //       modal_logo: '../../../images/turntable/gift.png',
    //       bgColor: '#FFF6E7'
    //     })
    //   } else {
    //     that.setData({
    //       isGetShow: true,
    //       backBtn: false,
    //       trunBtn: true,
    //       modal_title: '很遗憾，您未中奖 继续加油吧~',
    //       modal_content: '',
    //       modal_logo: '../../../images/turntable/empty.png',
    //       bgColor: '#ffffff'
    //     })
    //   }
    // }, 3000)

  },
  /*由分享出去的页面点进来调用此接口*/
  recodeShareInfo() {
    const params = {
      portalId: app.globalData.tenantId,
      turntableActivityId: this.data.newActivityId
    }
    handlePresentRequest(giftsEndUrl.shareRecode, params, 'post', function (res) {

    }, function () {

    })
  },
  /*获取获奖信息情况*/
  getGiftList() {
    let openid = wx.getStorageSync('openid');
    let mobile = wx.getStorageSync('mobile');
    let That = this;
    const params = {
      portalId: app.globalData.tenantId,
    }
    handlePresentRequest(giftsEndUrl.getTableTurnInfo, params, 'post', function (res) {
      if (res.data.code == 200) {
        let result = res.data
        That.setData({
          activityDetail: result.turntableActivity,
          homePageImage: result.turntableActivity.homePageImage,
          turntableImage: result.turntableActivity.turntableImage,
          bg_color: result.turntableActivity.customColor,
          canYuCount: result.turntableActivity.canYuCount,
          share_color: result.turntableActivity.customColor,
          register_color: result.turntableActivity.shareImage,
          shareImage: result.turntableActivity.shareSettingImage,
          ruleImage: result.turntableActivity.ruleImage,
          winningImage: result.turntableActivity.winningImage,
          shareTitle: result.turntableActivity.shareTitile,
          pre_score: result.turntableActivity.integral,
          integralSX: result.turntableActivity.integralSX,
          itemsNum: result.turntableActivity.regionCount,
          activityId: result.turntableActivity.turntableActivityId
        })
        That.setData({
          coupons: []
        })
        for (let i = 0; i < That.data.itemsNum; i++) {
          That.data.coupons.push({
            validateStatus: 111,
            turntableRegionId: i + 1
          })

          if (result.turntableCouponResponse.length) {
            for (let j = 0; j < result.turntableCouponResponse.length; j++) {
              if (result.turntableCouponResponse[j].turntableRegionId == That.data.coupons[i].turntableRegionId && result.turntableCouponResponse[j].validateStatus != 5) {
                That.data.coupons[i] = result.turntableCouponResponse[j]
              }
            }
          }

        }
        let itemsArc = 360 / That.data.itemsNum;
        That.setData({
          coupons: That.data.coupons
        })
        console.log(That.data.coupons)
        let info = result.turntableActivity.activityRule ? result.turntableActivity.activityRule : '<p>暂无规则</p>'
        wxParse.wxParse("content", "html", info, That, 0);

        That.setData({
          itemsArc
        }, function () {
          wx.createSelectorQuery().select('#canvas-one').boundingClientRect(function (rect) {
            w1 = parseInt(rect.width / 2);
            h1 = parseInt(rect.height / 2);
            That.Items(itemsArc);//每一份扇形的内部绘制。
          }).exec()
        })

      } else {

        wx.showToast({
          title: res.data.msg,
          icon: 'none',
          duration: 2000
        })
        setTimeout(function () {
          wx.navigateBack({ //返回上一级
            delta: 1,
            success: function (res) {
              tracking({
                event: '07',
                eventState: '跳转成功'
              })
            },
            fail: function (res) {
              tracking({
                event: '07',
                eventState: '跳转失败'
              })
            }
          })

        }, 1000);

      }
    }, function () {

    })
  },
  /*绘制转盘的每个区域*/
  Items(e) {
    let that = this;
    let itemsArc = e;//每一份扇形的角度

    let Num = that.data.itemsNum;//等分数量
    let text = that.data.coupons;//放文字的数组
    if (text.length > Num) {
      text.slice(0, Num - 1)
    }
    for (let i = 0; i < Num; i++) {

      ctx.beginPath();
      ctx.moveTo(w1, h1);
      ctx.arc(w1, h1, w1 - 2, itemsArc * i * Math.PI / 180, (itemsArc + itemsArc * i) * Math.PI / 180);//绘制扇形
      ctx.closePath();
      const colorList = ['#01a1dd', '#fffdec', '#fe5921', '#fffdec', '#fccc00', '#fffdec']
      ctx.setFillStyle(colorList[i % 6]);


      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.translate(w1, h1);//将原点移至圆形圆心位置
      ctx.rotate((itemsArc * (i + 1 + (Num - 2) * 0.25)) * Math.PI / 180);//旋转文字
      if (Num >= 6) {
        ctx.setFontSize(18);//设置文字字号大小
      } else {
        ctx.setFontSize(20);//设置文字字号大小
      }
      if (i % 2 == 0) {
        ctx.setFillStyle("#ffffff");//设置文字颜色
      } else {
        ctx.setFillStyle("#ff484c");//设置文字颜色
      }
      ctx.setTextAlign("center");//使文字垂直居中显示
      ctx.setTextBaseline("middle");//使文字水平居中显示

      if (text[i].validateStatus == '5' || text[i].validateStatus == '111') {
        ctx.fillText('谢谢', 0, -(h1 * 0.80));
        ctx.setFontSize(18);//设置文字字号大小
        ctx.fillText('参与', 0, -(h1 * 0.65));

      } else {

        if (text[i].mainInfo.length < 7) {
          ctx.setFontSize(18);//设置文字字号大小
          ctx.fillText(text[i].mainInfo, 0, -(h1 * 0.75));
        } else if (text[i].mainInfo.length >= 7 && text[i].mainInfo.length <= 10) {
          let len = Math.ceil(text[i].mainInfo.length / 2)
          ctx.fillText(text[i].mainInfo.slice(0, len), 0, -(h1 * 0.80));
          ctx.fillText(text[i].mainInfo.slice(len), 0, -(h1 * 0.65));
          ctx.setFontSize(28);//设置文字字号大小
        } else {
          let mainInfo = text[i].mainInfo.slice(0, 10) + '...'
          ctx.fillText(mainInfo.slice(0, 6), 0, -(h1 * 0.80));
          ctx.fillText(mainInfo.slice(6, 13), 0, -(h1 * 0.65));
          ctx.setFontSize(28);//设置文字字号大小
        }
      }
      ctx.restore();//保存绘图上下文，使上一个绘制的扇形保存住。
    }
    that.Images();
    ctx.draw();
    setTimeout(function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 2 * w1,
        height: 2 * h1,
        destWidth: 8 * w1,
        destHeight: 8 * h1,
        canvasId: 'canvasI',
        success: function (res) {
          var tempFilePath = res.tempFilePath;
          that.setData({
            tempFilePath: res.tempFilePath
          })
          console.log(tempFilePath)

        },
        fail: function (res) {
          console.log('----------  ', res)
        }
      })
    }, 300);
    ctx.draw(true);//参数为true的时候，保存当前画布的内容，继续绘制



  },
  /*中奖控制，优先调用*/
  controlWinnerInfo() {
    let That = this;
    let mobile = wx.getStorageSync('mobile');
    const params = {
      portalId: app.globalData.tenantId,
      mobile: mobile
    }
    handlePresentRequest(giftsEndUrl.controlWinner, params, 'post', function (res) {
      if (res.data.code == 200) {
        let result = res.data;
          if (!wx.getStorageSync('isLoginSucc')) {
              That.setData({ chanceNum: '-' });
          } else {
              That.setData({
                  chanceNum: result.turntableWinning.luckyDrawTimes,
                  // canYuCount:result.turntableWinning.canYuCount

              })
          }
        
      } else {

      }
    }, function () {

    })
  },

  handleShareBtn() {

  },

  Images() {//绘制奖品图片，与绘制文字方法一致。

  },

  onPullDownRefresh() {
    wx.setBackgroundTextStyle({
      textStyle: 'dark'
    })
    this.getWinnerList()
    this.getGiftList()
	this.controlWinnerInfo()
    setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 500);

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (option) {
    if (option.activityId) {
      this.setData({
        newActivityId: option.activityId
      })
      this.recodeShareInfo()
    };
    this.setData({
      isFromShare: option.isFromShare || 'false',
    })
    
  },

  onShow() {
    this.controlWinnerInfo()
    this.getWinnerList()
    this.setData({
      isLogin: wx.getStorageSync('isLoginSucc')
    })
    let isLogin = this.data.isLogin;
    if (isLogin) {
      this.setData({
        loginName: '积分换抽奖机会'
      })
    } else {
      this.setData({
        loginName: '注册送抽奖机会'
      })
    }

    tracking({
      event: '06',
      eventState: '进入成功'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    this.getGiftList()
  },

})
