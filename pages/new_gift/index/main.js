//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {
    handleRequest,
    giftsEndUrl
} from '../../../utils/util_new_gift.js'
import {
    tracking
} from '../../../rtmap/coupons/utils/track.js'
import wxParse from '../../components/wxparse/wxparse.js'
Page({
    //页面变量
    data: {
        bannerUrl: '',
        logoIcon: '../../../images/new_gift/1.png',
        modal_title: '抱歉',
        hasLogo: '../../../images/new_gift/Group.png',
        cryLogo: '../../../images/new_gift/cry.png',
        success: '../../../images/new_gift/success.png',
        isShow: false,
        activity_color: '',
        openid: '',
        modal_logo: '',
        activityRule: '',
        shareTitle: '新人礼',
        isFromShare: 'false',
        isMove: false,
        activityId: '',
        shareImage: '',
        showBackBtn: false,
        logoImage: '',
        code: '',
        containerBtn: true,
        memberInfo: null,
        activityInfo: null,
        modal_content: '您已经领取过',
        content1: '新人礼包仅限新用户领取使用，新用户是指未在本平台有过支付行为的用户，每个新用户只能领取一次。',
        content2: '新人礼包使用方式详见券面具体描述，部分特殊商品不参与该优惠。',
        content3: '通过不正当手段（包括但不限于侵犯第三人合法权益、作弊、扰乱系统、实施网络攻击、批量注册、用机器注册账户、用机器模拟客户端）获得现金券，本平台有权撤销现金券及相关交易订单。',
        content4: '活动中有任何疑问，可进入我的-客户服务-智能客服、电话客服、在线客服咨询反馈'
    },

    handleTouchMove() {

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
    handleLinkIndex() {
        tracking({
            event: '07',
            eventState: '跳转首页'
        })
        wx.switchTab({
            url: '/pages/index/index',
            success: function(res) {
            },
            fail: function(res) {
            }
        })
    },

    //事件处理函数
    handleRegiter: function() {
        let That = this;
        let isLogin = wx.getStorageSync('isLoginSucc');
        if (isLogin) {
            let mobile = wx.getStorageSync('mobile');
            let openid = wx.getStorageSync('openid');
            let member = wx.getStorageSync('member');
            handleRequest(giftsEndUrl.justifyGetSuccInfo, {
                mobile: mobile,
                tenantId: app.globalData.tenantId
            }, 'post', function(res) {
                if (res.data.code == 200) {
                    if (res.data.type == 0) {
                        That.handleGetCoupon()
                    } else {
                        That.setData({
                            isShow: true,
                            modal_logo: That.data.hasLogo,
                            modal_title: '已领取',
                            modal_content: '不要重复领取礼包哦'
                        })
                    }
                }
            }, function(res) {
                console.log(res)
            })
        } else {
            tracking({
                event: '07',
                eventState: '跳转登录注册'
            })
            wx.navigateTo({
                url: `${app.globalData.loginPath}?sourceid=${this.data.activityId}&from=新人礼`,
                success: function(res) {
                },
                fail: function(res) {
                }
            })
        }

    },

    getActivityInfo() {
        let tenantId = app.globalData.tenantId;
        let That = this;
        handleRequest(giftsEndUrl.getGiftDetail, {
            portalId: app.globalData.tenantId
        }, 'post', function(res) {
            if (res.data.code == 200) {
                let bannerUrl = 'http://p2zm517rr.bkt.clouddn.com/srpoicode%2F20180913%2F40288a8165d0afd50165d0afd5200000.png'
                let activity_color = '#ff6559'
                let shareTitle = That.data.shareTitle
                let logoImage = 'http://p2zm517rr.bkt.clouddn.com/srpoicode%2F20180913%2F40288a8165d0afd50165d0afd80e0001.png'
                let activityRule = '<p>暂无规则</p>'
                let result = res.data.activity
                That.setData({
                    bannerUrl: result.backGroundImage ? result.backGroundImage : bannerUrl,
                    activity_color: result.themeColor ? result.themeColor : activity_color,
                    shareImage: result.shareImage,
                    shareTitle: result.shareTile ? result.shareTile : shareTitle,
                    activityRule: result.activityRule ? result.activityRule : activityRule,
                    logoImage: result.logoImage ? result.logoImage : logoImage,
                    containerBtn: false,
                    activityId: result.activityId
                })
                wxParse.wxParse("activityRule", "html", That.data.activityRule, That, 0);
                wx.setStorageSync('logoImage', That.data.logoImage)
                wx.setStorageSync('activity_gift_color', That.data.activity_color)
                wx.setStorageSync('shareTitle', That.data.shareTitle)
                wx.setStorageSync('shareImage', That.data.shareImage)
            } else {
                That.setData({
                    isShow: true,
                    modal_logo: That.data.cryLogo,
                    modal_title: '抱歉',
                    modal_content: res.data.msg ? res.data.msg : '请求失败'
                })
            }
        }, function(res) {
            console.log(res)
        })
    },

    onShareAppMessage(res) {
        tracking({
            event: '02',
            eventState: '转发'
        })
        return {
            title: this.data.shareTitle,
            path: '/pages/new_gift/index/main?type=share' + "&isFromShare=true",
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

    handleGetGift() {
        tracking({
            event: '07',
            eventState: '跳转新人礼领取'
        })
        wx.navigateTo({
            url: '/pages/new_gift/success/main',
            success: function(res) {
            },
            fail: function(res) {
            }
        })
        this.setData({
            isShow: false
        })
    },

    handleGetCoupon() {
        let That = this;
        let mobile = wx.getStorageSync('mobile');
        let openid = wx.getStorageSync('openid');
        let member = wx.getStorageSync('member');
        handleRequest(giftsEndUrl.getSuccInfo, {
            mobile: mobile,
            searchType: 1,
            tenantId: app.globalData.tenantId,
            tenantType: 1,
            cid: member.member.cid,
            openId: openid,
            portalId: app.globalData.tenantId
        }, 'post', function(res) {
            if (res.data.code == 200) {
                That.setData({
                    isShow: true,
                    modal_logo: That.data.success,
                    modal_title: '恭喜',
                    modal_content: '获取一份新人礼'
                })

            } else if (res.data.code == 1003) {
                That.setData({
                    isShow: true,
                    modal_logo: That.data.hasLogo,
                    modal_title: '抱歉',
                    modal_content: '该活动只适用于新会员'
                })
            } else {
                That.setData({
                    isShow: true,
                    modal_logo: That.data.cryLogo,
                    modal_title: '抱歉',
                    modal_content: res.data.msg ? res.data.msg : '请求失败'
                })
            }
        }, function(res) {
            console.log(res)
        })
    },
    handleConfirm() {
        this.setData({
            isShow: false
        })
        setTimeout(function() {
            tracking({
                event: '07',
                eventState: '返回上一级'
            })
            wx.navigateBack({ //返回上一级
                delta: 1,
                success: function(res) {
                },
                fail: function(res) {
                }
            })

        }, 100);
    },

    handleSeeGift() {
        tracking({
            event: '07',
            eventState: '跳转新人礼领取'
        })
        wx.navigateTo({
            url: '/pages/new_gift/success/main',
            success: function(res) {
            },
            fail: function(res) {
            }
        })
        this.setData({
            isShow: false
        })
    },

    handleCloseModal() {
        this.setData({
            isShow: false
        })
    },

    onShow: function() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    onLoad(options) {
        console.log(options)
        this.setData({
            isFromShare: options.isFromShare || 'false',
        })
        if (options.type) {
            this.setData({
                showBackBtn: true,
            })
        }
        this.getActivityInfo()
        var openId = wx.getStorageSync('openid');
        var keyAdmin = wx.getStorageSync('keyAdmin');
        var tenantId = app.globalData.tenantId;
    }
})