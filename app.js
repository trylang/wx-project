//app.js
import {
    config
} from "./utils/config.js"
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from './rtmap/coupons/utils/httpUtil.js'
import {
    handleRequest,
    portsEndUrl
} from './utils/util.js'
import {
    giftsUrl,
    giftsEndUrl,
    handleIndexRequest
} from './utils/util_new_gift.js'

import Token from './rtmap/coupons/utils/sign.js'
console.log('tenantId', config.tenantId)

//console.log(222, Token());
let openid = wx.getStorageSync('openid') ? wx.getStorageSync('openid') : '';
let cid = wx.getStorageSync('member').cid ? wx.getStorageSync('member').cid : '';
let tenantId = config.tenantId; // token里面的tenantId
let token = (new Token(tenantId, cid, openid))
let requestObj = null;
wx.Request = function(data = {}) {
    if (data.method === 'GET') {
        function objKeySort(obj) {
            var newkey = Object.keys(obj).sort();
            var newObj = {};
            for (var i = 0; i < newkey.length; i++) {
                newObj[newkey[i]] = obj[newkey[i]];
            }
            return newObj;
        }

        function serialize(obj) {
            var str = [];
            for (var p in obj)
                if (obj.hasOwnProperty(p)) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
            return str.join("&");
        }
        if (data.data) {
            requestObj = serialize(objKeySort(data.data));
        } else {
            requestObj = '';
        }
    } else {
        requestObj = JSON.stringify(data.data)
    }
    //console.log('jijiji',data.data)
    data.header = Object.assign({
        "Content-Type": "application/json",
        token: token.getToken(requestObj)
    }, data.header);

    // 请求响应的参数 
    //console.log('请求参数', data.data, data.url)
    var success = data.success;
    data.success = function(res) {
      console.log(data.method, data.url, '请求', JSON.stringify(data.data), '成功响应', JSON.stringify(res))
        if (typeof success == 'function') {
            success(res);
        }

    }

    var fail = data.fail;

    data.fail = function(err) {
      console.log(data.method, data.url, '请求', JSON.stringify(data.data), '成功响应', JSON.stringify(err))
        if (typeof fail == 'function') {
            fail(err)
        }
    }
    wx.request(data)
}




const ald = require('./rtmap/ald/ald-stat.js')
var configHttpUtil = require('./utils/configHttpUtil.js')
App({
    onShow: function(options) {
        //console.log("options",options)
        if (options.scene == 1007 || options.scene == 1008) {
            if (/miaosha\/page\/detail\/detail/.test(options.path)) {
                this.globalData.miaoshafromshare = true;
                console.log("miaoshafromshare:true")
            }
        }
    },
    onLaunch: function(options) {
        this.globalData.scene = options.scene;
        this.globalData.channel = options.query.channel
        this.getKeyAdmin() //portalId换取 keyAdmin
        //登录
        let that = this
        let loginFlag = wx.getStorageSync('openid');
        let isLogin = wx.getStorageSync('userInfo');
        wx.getUserInfo({
            success: res => {
                //console.log(res,wx.getStorageSync('userInfo'));
                wx.setStorageSync('userInfo', res.userInfo)
                this.globalData.WxUserInfo = res.userInfo
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.WxUserInfoReadyCallback) {
                    this.WxUserInfoReadyCallback(res)
                }
            },
            fail: res => {
                //console.log(res);

            }
        })
        /* 检查当前版本是否为最新，若非则主动更新 */
        const updateManager = wx.getUpdateManager()
        updateManager.onCheckForUpdate(function(res) {
            // 请求完新版本信息的回调
            if (res.hasUpdate) {
                updateManager.onUpdateReady(function() {
                    wx.showModal({
                        title: '更新提示',
                        content: '新版本已经准备好，是否重启应用？',
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                updateManager.applyUpdate()
                            }
                        }
                    })
                })
            } else {
                console.log('最新版本');
            }
        })
        updateManager.onUpdateFailed(function() {
            // 新的版本下载失败
            wx.showModal({
                title: '更新提示',
                content: '版本更新失败，请删除小程序后再次进入。',
                showCancel: false,
            })
        })
        if (loginFlag) {
            // 检查 session_key 是否过期
            wx.checkSession({
                // session_key 有效(未过期)
                success: function() {
                    console.log('有效(未过期)')
                    // 业务逻辑处理
                },

                // session_key 过期
                fail: function() {
                    // session_key过期，重新登录
                    console.log('session_key过期，重新登录')
                    that.doLogin();
                }
            });
        } else {
            // 无skey，作为首次登录
            this.doLogin();
        }
    },

    doLogin: function() {
        var that = this
        wx.login({
            success: function(loginRes) {
                if (loginRes.code) {
                    httpWithParameter({
                        endPoint: requestEndPoints.getSession,
                        data: {
                            jsCode: loginRes.code,
                            appId: that.globalData.appid,
                        },
                        success: (res) => {
                            console.log('getSession ===>', res)
                            if (res.data.status === 200) {
                                wx.setStorageSync('openid', res.data.data.openid)
                                wx.setStorageSync('sessionId', res.data.data.sessionId)
                                wx.setStorageSync('unionid', res.data.data.unionid)
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

    //将小程序的portalId换取 keyAdmin
    getKeyAdmin() {
        let That = this
        handleIndexRequest(giftsEndUrl.getKeyAdmin, {
            portalId: That.globalData.tenantId
        }, 'post', function(res) {
            if (res.data.code == 200) {
                wx.setStorageSync('keyAdmin', res.data.data.keyAdmin)
                That.getBuilding(res.data.data.keyAdmin)
            } else {
                wx.showToast({
                    title: res.errMsg,
                    icon: 'none',
                    duration: 2000
                })
            }
        }, function(res) {
            wx.showToast({
                title: '获取keyAdmin失败',
                icon: 'none',
                duration: 2000
            })
        })
    },

    //获取keyAdmin下面的通用建筑物
    getBuilding(keyadmin) {
        let That = this
        handleRequest(portsEndUrl.getBuilding, {
            keyAdmin: keyadmin
        }, 'post', function(res) {
            if (res.data.code == 200) {
                wx.setStorageSync('buildList', res.data.buildList)
            } else {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                })
            }
        }, function(res) {
            wx.showToast({
                title: '获取建筑物列表失败',
                icon: 'none',
                duration: 2000
            })
        })
    },


    globalData: {
        appID: config.appid, //'wx0d3eadec7399907a',//'wx0d3eadec7399907a',//'wxbcf7a3474c5b35d2',
        appId: config.appid, //'wx0d3eadec7399907a',
        appid: config.appid, //'wx0d3eadec7399907a',
        shareTitle: '',
        sharePage: '/rtmap/bawang/pages/index/index',
        bannerHTTPURL: '',
        /**
         *  填写注册页面地址
         */
        loginPath: '/pages/login/login',
        /*
            新人礼部分变量
        */
        phone: '',
        coupon: 0,
        couponType: 0,
        growthValue: '',
        activityId: '',
        score: '',
        /**
         * 签到积分部分变量
         */

        keyAdmin: config.keyAdmin, // "8999aaee9e6a09acdf330e32bb651029",
        buildid: config.buildid, // "862500010030300016",

        /*场景值和渠道*/
        channel: '',
        scenel: '1001',

        sessionId: undefined,
        isUserInfoUpdated: false,
        userInfo: null,
        convertPrice: 0,
        couponPrice: 0,
        WxUserInfo: null,
        orderDetail: null,
        couponDetail: null,
        phone: config.phone, //'0731-88369000',
        tenantId: config.tenantId, //'12656',
        projectTitle: config.projectTitle, //"智慧图demo",
        projectMinTitle: config.projectMinTitle, //"智慧图",
        //BaseUrl: 'https://wx-mini.rtmap.com/',
        BaseUrl: config.BaseUrl, //'https://appsmall.rtmap.com/',
        //seckillBaseUrl: '',
        tenantType: 1, //秒杀新增
        mapKey: 'I3yKcZTOmD',
        version: config.version,
        isMemberRegistTurn: false
    }
})