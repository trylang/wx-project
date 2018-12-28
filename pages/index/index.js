//index.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../rtmap/coupons/utils/httpUtil.js';

import {
    handleRequest,
    portsEndUrl
} from '../../utils/util.js'
import {
    tracking
} from '../../rtmap/coupons/utils/track.js'
import maHttpUtil from '../../rtmap/coupons/utils/maHttpUtil.js'
import {
    giftsUrl,
    giftsEndUrl,
    handleIndexRequest
} from '../../utils/util_new_gift.js'
import util from '../../rtmap/coupons/utils/util.js'

//获取应用实例
const app = getApp()
const tenantId = app.globalData.tenantId;

Page({
    //页面变量
    data: {
        // topImage: '../../images/index/1.jpg',
        hideImg: "hide-img",
        hidePopout: '',
        topImage: [],
        screenImage: [],
        hideTop: '',
        row: 0,
        c_row: 0,
        rowMany: 0,
        time: 5,
        animationData: '',
        shareTitle: '',
        shareImage: '',
        setIntervalTime: '',
        imgheights: [],
        screenImageBtn: false,
        isLogin: false,
        windowHeight: '',
        headImage: '../../images/head_default.png',
        member: null,
        application_list: [],
        guide_list: [],
        userInfo: null,
        userInfoBtn: false,
        businessTypesCurrent: 0,
        businessTypes: [],
        couponsList: [],
        coupons: {
            '-1': {
                list: [],
                page: 1
            }
        },
        countdown: {
            hasstart: 0,
            year: 0,
            month: 0,
            day: 0,
            remainhour: 0,
            remainminute: 0,
            remainsecond: 0
        },
        now: 0,
        seckill: null,
        //小程序跳转参数
        extraData: {
            source: 'wxProgramZHT', //你们小程序的标记
            openPage: 'parking', //跳转停车缴费页面
            channel: '168001', //固定梅溪新天地id
            mobile: wx.getStorageSync('mobile') //用户手机号
        },
        couponsisshow: true
        // limit_list: [{
        //     imgUrl:'../../images/index/1.png',
        //     industryName:'免费射击体验'
        // },{
        //     imgUrl:'../../images/index/2.png',
        //     industryName:'第二杯半价'
        // },{
        //     imgUrl:'../../images/index/3.png',
        //     industryName:'1元特价菜'
        // },{
        //     imgUrl:'../../images/index/3.png',
        //     industryName:'女士福利'
        // }],
    },
    /*下拉刷新*/
    onPullDownRefresh() {
        this.getTopImage('0');
        this.getShareInfo();
        this.getSecKill();

        var couponCollage = this.selectComponent("#coupon-collage");
        if (couponCollage) {
            couponCollage.data.currentPage = 1;
            couponCollage.pullDownRefresh();
        }
        setTimeout(function () {
            wx.stopPullDownRefresh()
        }, 500);
    },

    animate(meunType, btn) {
        var animation = wx.createAnimation({
            duration: 200, //动画时长
            timingFunction: "linear", //线性
            delay: 0 //0则不延迟
        });
        this.animation = animation;
        animation.opacity(0).rotateX(-100).step();
        this.setData({
            animationData: animation.export()
        })
        setTimeout(function () {
            animation.opacity(1).rotateX(0).step();
            this.setData({
                animationData: animation
            })
            if (meunType == 'open') {
                this.setData({
                    btn: true
                })
            }
            if (meunType == 'close') {
                this.setData({
                    btn: false
                })
            }

        }.bind(this), 200)
    },

    hiddenModal() {
    },

    handleGiveNotice() {
        wx.showToast({
            title: '敬请期待',
            icon: 'none',
            duration: 2000
        })
    },
    /*首页分享*/
    onShareAppMessage(res) {
        //埋点数据
        tracking({
            event: '02',
            eventState: '转发'
        })
        return {
            title: this.data.shareTitle,
            path: '/pages/index/index',
            imageUrl: this.data.shareImage,
            success: res => {
                wx.showToast({
                    title: '分享成功',
                    icon: 'success',
                    duration: 2000
                })
            },
            error: res => {
                wx.showToast({
                    title: '分享失败',
                    icon: 'error',
                    duration: 2000
                })
            },
        }
    },

    cancelEvent() {
        const dialog = this.selectComponent("#dialog");
        if (dialog) {
            dialog.hideDialog();
        }
    },

    //登录跳转
    handleLogin() {
        wx.navigateTo({
            url: app.globalData.loginPath,
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

    // 遮罩滚动阻止
    preventScroll() {

    },
    /*获取分享信息*/
    getShareInfo() {
        let That = this;
        let openid = wx.getStorageSync('openid');
        let keyAdmin = wx.getStorageSync('keyAdmin');
        handleIndexRequest(giftsEndUrl.getShareIndex, {
            portalId: tenantId
        }, 'post', function (res) {
            if (res.data.code == 200) {
                That.setData({
                    shareImage: res.data.data.imageUrl,
                    shareTitle: res.data.data.shopTitle,
                })
                That.getFunctionPoint()
                That.getHostPoint()
            } else {

            }
        }, function (res) { })
    },
    /*跳转到积分明细*/
    handleLinkScore() {
        wx.navigateTo({
            url: '/rtmap/coupons/pages/credits/credits',
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
    /*跳转到优惠券列表*/
    handleLinkCoupon() {
        wx.navigateTo({
            url: '/rtmap/coupons/pages/couponList/couponList',
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

    bindSeeCode() {
      tracking({
        event: '12',
        eventState: '电子会员卡'
      })
        const dialog = this.selectComponent("#dialog");
        if (dialog) {
            dialog.showDialog();
        }
    },

    bindLinkMine() {
        wx.switchTab({
            url: '/rtmap/coupons/pages/mine/mine',
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

    handleNormal() {

    },
    /*获取首页快捷功能入口*/
    getFunctionPoint() {
        let That = this
        wx.Request({
            url: giftsUrl + giftsEndUrl.getFunctionPoint,
            data: {
                portalId: app.globalData.tenantId
            },
            method: 'get',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                if (res.data.code == 200) {
                    let row = res.data.data.row
                    console.log(res.data.data.menuFunctionList.length)
                    if (res.data.data.displayWay == 1 || res.data.data.menuFunctionList.length < row) {
                        That.data.row = 1 / res.data.data.menuFunctionList.length * 100
                    } else {
                        That.data.row = 1 / parseInt(row) * 100
                    }
                    That.setData({
                        row: That.data.row,
                        guide_list: res.data.data.menuFunctionList
                    })
                } else {
                }
            },
            fail: function (res) {

            }
        })
    },
    /*获取运营功能入口*/
    getHostPoint() {
        let That = this
        wx.Request({
            url: giftsUrl + giftsEndUrl.getHostPoint,
            data: {
                portalId: app.globalData.tenantId
            },
            method: 'get',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                if (res.data.code == 200) {
                    let row = res.data.data.row
                    if (res.data.data.displayWay == 1 || res.data.data.menuFunctionList.length < row) {
                        That.data.c_row = 1 / res.data.data.menuFunctionList.length * 100
                    } else {
                        That.data.c_row = 1 / parseInt(row) * 100
                    }
                    That.setData({
                        c_row: That.data.c_row,
                        application_list: res.data.data.menuFunctionList
                    })
                } else {
                }
            },
            fail: function (res) {

            }
        })
    },
    handleLinkFastFun(e) {
        let url = e.currentTarget.dataset.url
        if (url == "123456") {
            wx.showToast({
                title: "敬请期待！",
                icon: 'none'
            })
        } else {
            if (url.indexOf('http') > -1) {
                app.globalData.bannerHTTPURL = url;
                url = '../jump/index'
            }
            wx.navigateTo({
                url: url,
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
        }
    },

    handleFunctionLink(e) {
        let name = e.currentTarget.dataset.functionname
        let url = e.currentTarget.dataset.url
        console.log(name)
        if (this.data.isLogin || name == '新人礼' || name == '活动报名' || name == '品牌活动' || name == '幸运转盘') {
            if (url.indexOf('http') > -1) {
                app.globalData.bannerHTTPURL = url;
                url = '../jump/index'
            }
            wx.navigateTo({
                url: url,
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
        } else {
            wx.navigateTo({
                url: app.globalData.loginPath,
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
        }

    },
    /*获取我的优惠券数量*/
    getCoupon() {
        let That = this;
        var count = 0;
        // this.setData({
        //     couponsCount: 0
        // })
        httpWithParameter({
            endPoint: requestEndPoints.getCouponCount,
            data: {
            openId: wx.getStorageSync('openid'),
            portalId: app.globalData.tenantId,
            crmId: wx.getStorageSync('member').cid
            },
            success: (res) => {
                if (res.data.status === 200) {
                    count += res.data.data;
                    this.setData({
                        couponsCount: count
                    })
                
            }
            },
            fail: (res) => {
            console.log('fail', res);
            }
        });
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
                        count += res.data.data;
                        this.setData({
                            couponsCount: count
                        })
                    }
                },
                fail: (res) => {
                    console.log('fail', res);
                }
            });
            
        }
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
                            credits: res.data.data.balance
                        })
                    }
                },
                fail: (res) => {
                    console.log('fail', res);
                }
            });
        }

    },

    doLogin: function () {
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
                                console.log("=======>", res.data.data.openid);
                                wx.setStorageSync('openid', res.data.data.openid)
                                tracking({
                                    event: '06',
                                    eventState: '进入成功'
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

    onShow() {
        const userInfo = wx.getStorageSync('member')
        this.getSecKill()
        if(userInfo){
            this.getCoupon()
            this.getScore()
        }
        this.setData({
            isLogin: wx.getStorageSync('isLoginSucc') ? wx.getStorageSync('isLoginSucc') : false,
            member: wx.getStorageSync('member') || {},
            userInfo: wx.getStorageSync('userInfo') ? wx.getStorageSync('userInfo') : {},
            cardName: wx.getStorageSync('member') && wx.getStorageSync('member').member.cardName || {}
        })
        let openid = wx.getStorageSync('openid');
        if (openid) {
            console.log('有openid')
            tracking({
                event: '06',
                eventState: '进入成功'
            })
        } else {
            this.doLogin()
        }
    },
    /*获取轮播图自适应高度*/
    imageLoad: function (e) { //获取图片真实宽度  
        var imgwidth = e.detail.width,
            imgheight = e.detail.height,
            //宽高比  
            ratio = imgwidth / imgheight;
        //计算的高度值  
        var viewHeight = 550 / ratio;
        var imgheight = viewHeight;
        var imgheights = this.data.imgheights;
        //把每一张图片的对应的高度记录到数组里  
        imgheights[e.target.dataset.id] = imgheight;
        this.setData({
            imgheights: imgheights
        })
    },

    handleCloseModal() {
        this.setData({
            screenImageBtn: false
        })
    },

    setInterval() {
        let that = this;
        var n = 4;
        this.data.setIntervalTime = setInterval(function () {
            var str = n
            that.setData({
                time: str
            })
            if (n <= 0) {
                clearInterval(that.data.setIntervalTime);
                that.setData({
                    screenImageBtn: false
                })
                that.animate('close', that.data.screenImageBtn)
            }
            n--;
        }, 1000);
    },


    onLoad: function () {
        var That = this;
        this.getTopImage('1');
        this.getTopImage('0');
        this.getShareInfo()
        this.getSecKill()
        if (!app.globalData.memberHandbook) {
            httpWithParameter({
                endPoint: requestEndPoints.memberHandbook + '/' + app.globalData.tenantId,
                data: {
                    marketId: app.globalData.tenantId
                },
                success: (res) => {
                    if (res.data.code === 200) {
                        app.globalData.memberHandbook = res.data.data
                        if (res.data.data.defaultImg) {
                            //obj.avatar = res.data.data.defaultImg
                            this.setData({
                                headImage: res.data.data.defaultImg
                            });
                        }
                    }
                },
                fail: (res) => {
                    console.log('fail', res);
                }
            })
        } else {
            this.setData({
                memberHandbook: app.globalData.memberHandbook
            })
        }
    },
    bindGetUserInfo: function (e) {
        wx.setStorageSync('userInfo', e.detail.userInfo)
        app.globalData.WxUserInfo = e.detail.userInfo
        this.setData({
            userInfoBtn: false
        })
    },

    handleRefuse() {
        this.setData({
            userInfoBtn: false
        })
    },

    getJumpUrl: function (e) {
        var Url = e.currentTarget.dataset.text;
        var type = e.currentTarget.dataset.type;
        console.log('Url路径：', Url);
        //跳转其他小程序
        // Url = 'miniProgram {"appId":"wxc94daee5c5b654ad","path":"pages/index/index","extraData":{"source":"wxProgramZHT","openPage":"parking","channel":"168001","mobile":"15210420307"}}'
        if (Url && Url.indexOf('miniProgram') != -1) {
            //解析旧格式
            // let params = Url.match(/([^?=&]+)(=([^&]*))/g)
            //     .reduce((a, v) => (a[v.slice(0, v.indexOf('='))] = v.slice(v.indexOf('=') + 1), a), {})
            let array = Url.split('*')
            let params = array[1] && JSON.parse(array[1].toString())
            wx.navigateToMiniProgram(params)
            return
        }
        if (Url == null || type == 0) {
            return;
        };
        if (type == 2) {
            // if ('rtmap/miaosha/page/list/list' == Url) {
            //     wx.switchTab({
            //         url: "../../" + Url,
            //     })
            // } else {
                wx.navigateTo({
                    url: "../../" + Url
                })
            // }
            return;
        }
        if (type == 1) {
            app.globalData.bannerHTTPURL = Url;
            wx.navigateTo({
                url: '../jump/index'
            })
            return;
        }

    },


    /**
     * 顶部轮播
     */
    getTopImage: function (picType) {
        var That = this;
        wx.Request({
            url: giftsUrl + giftsEndUrl.bannerIndex,
            data: {
                appId: app.globalData.appid,
                picType: picType
            },
            method: 'post',
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                console.log(res.data)
                if (res.data.code == 200) {
                    console.log(res.data.data.list)
                    if (picType == '1') {
                        That.setData({
                            screenImage: res.data.data
                        });
                        if (That.data.screenImage.length) {
                            That.setData({
                                screenImageBtn: true
                            })
                            That.animate('open', That.data.screenImageBtn)
                            clearInterval(That.data.setIntervalTime);
                            That.setInterval()
                        } else {
                            That.setData({
                                screenImageBtn: false
                            })
                        }
                    } else if (picType == '0') {
                        That.setData({
                            topImage: res.data.data
                        });
                    };
                } else {
                    console.log(res);
                }
            },
            fail: function (res) {

            }
        })
    },
    /**
     * 每日签到、积分商城登录
     */
    onActivityClick(data) {
        let item = this.data.guide_list[data.currentTarget.dataset.index]
        if (item.url == '/rtmap/sign/sign' || item.url == '/rtmap/integralMall/integralHome/integralHome') {
            if (!this.data.isLogin) {
                wx.navigateTo({
                    url: app.globalData.loginPath,
                })
                return
            }
        }
        wx.navigateTo({
            url: item.url,
        })
    },
    getSecKill() {
        httpWithParameter({
            endPoint: requestEndPoints.getTime,
            data: {},
            success: (res) => {
              if (res.data && res.data.data) {
                this.setData({
                  now: res.data.data
                })
              }
                
                // this.setData({
                //     now: 1538323200000+11*3600000+86400000*0
                // });
                this.getKillGoods();
                this.startcountdown()
            }
        })
    },
    startcountdown() {
        if (this.timeline) {
            clearInterval(this.timeline);
        }
        this.countdown();
        this.timeline = setInterval(this.countdown, 1000);
    },
    countdown() {
        var now = this.data.now + 1000;
        var seckill = this.data.seckill;
        if (!seckill) {
            return;
        }
        var hastart, endtime;;
        if (now < seckill.startTime) {
            hastart = false;
            endtime = seckill.startTime;
        } else if (now < seckill.endTime) {
            hastart = true;
            endtime = seckill.endTime;
        } else {
            this.getKillGoods();
            return;
        }
        //var time = new Date(now);
        // var orgday = this.data.countdown.day;
        // var day = time.getDate();
        // var hour = time.getHours();
        // var year = time.getFullYear();
        // var month = time.getMonth() + 1;
        // var hastart = hour > 10;
        // var endhour = hastart ? 24 : 11;
        var remaintime = endtime - now;

        var remainhour = Math.floor(remaintime / 3600000);
        var remainminute = Math.floor(remaintime % 3600000 / 60000);
        var remainsecond = Math.floor(remaintime % 60000 / 1000);
        this.setData({
            countdown: {
                hasstart: hastart,
                // year: year,
                // month: month > 9 ? month : '0' + month,
                // day: day > 9 ? day : '0' + day,
                remainhour: remainhour > 9 ? remainhour : '0' + remainhour,
                remainminute: remainminute > 9 ? remainminute : '0' + remainminute,
                remainsecond: remainsecond > 9 ? remainsecond : '0' + remainsecond,
            },
            now: now,
        })
        // if (day != orgday) {
        //     this.getKillGoods();
        // }
    },
    getKillGoods() {
        var countdown = this.data.countdown;

        wx.Request({
            url: app.globalData.BaseUrl + "wxapp-seckill/api/c/coupon/index",
            data: {
                tenantId: tenantId,
                wxAppId: app.globalData.appID,
                openId: wx.getStorageSync('openid'),
                cid: wx.getStorageSync('member').cid
            },
            method: 'GET',
            header: {
                "Content-Type": "application/json"
            },
            success: (res) => {
                if (res.data && res.data.data) {
                    this.setData({
                        seckill: res.data.data
                    })
                } else {
                    this.setData({
                        seckill: null
                    })
                }
            }
        })
    },
    couponsIsShow(result) {
        this.setData({
            couponsisshow: result.detail
        })
    },
    onReachBottom: function () {
        var tdlist = this.selectComponent("#tdlist");
        var couponCollage = this.selectComponent("#coupon-collage");

        if (tdlist) {
            tdlist.onReachBottom()
        }

        if (couponCollage) {
            couponCollage.onScrollListener();
        }

    }
})