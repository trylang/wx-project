// pages/couponInfo/couponInfo.js
var echoss = require('../../../../utils/certificationKit/echoss/echoss-lite-min.js');
var template = require('../../../../utils/certificationKit/template-min.js');

var QR = require("../../utils/qrcode.js");
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../utils/httpUtil.js';
import {
    tracking
} from '../../utils/track.js'
import {
    giftsEndUrl,
    handlePresentRequest
} from '../../../../utils/util_new_gift.js'
import {
    getConfig
} from '../../../../utils/configHttpUtil.js'
import util from '../../utils/util.js'
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        statusMap: {
            '2': {
                en: 'ctive'
            },
            '3': {
                en: 'use',
                tip: '已使用'
            },
            '4': {
                en: 'expired',
                tip: '已过期'
            },
            '7': {
                en: 'retreat',
                tip: '已退券'
            }
        },
        codeImg: '',
        isShow: false,
        couponActivityId: '', //券批id
        placeholder: '124245654huhu', //默认二维码生成文本
        canvasHidden: true,
        couponInfo: {
            status: '2'
        },
        status: 3,
        qrCode: '',
        extendInfo: '',
        shops: [],
        validTime: '',
        bbgFloor: '',
        appId: '',
        licenseId: '',
        showSeal: false,
        showBtn: true,
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
    resetStatus() {
        this.setData({
            isClick: false,
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
    callCkitPage() {
        tracking({
            coupon: this.data.couponInfo.couponId || '',
            activityId: this.data.couponInfo.activityId || '',
            event: '12',
            eventState: '点击券核销'
        })
        this.setData({
            isClick: true,
        })
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
                service: "COUPON",
                price: 0
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
    getDetail() {
        this.setData({
            qrCode: options.qrCode,
            extendInfo: options.extendInfo
        })
        if (options.qrCode == 'refund') {
            if (app.globalData.couponDetail.descClause.indexOf('descClauseImg') == -1) {
                app.globalData.couponDetail.descClause = app.globalData.couponDetail.descClause.replace(/img/g, 'img class="descClauseImg"')
            }
            this.setData({
                couponInfo: app.globalData.couponDetail
            })
            this.getShopList(this.data.couponInfo.couponId || this.data.couponInfo.id, true)
            var size = this.setCanvasSize(); //动态设置画布大小
            var initUrl = this.data.couponInfo.qrCode;
            this.createQrCode(initUrl, "mycanvas", size.w, size.h);
            console.log(111, "成功");
            tracking({
                coupon: app.globalData.couponDetail.couponId || '',
                activityId: app.globalData.couponDetail.activityId || '',
                event: '06',
                eventState: '获取详情成功'
            })
        } else {
            wx.showLoading()
            httpWithParameter({
                endPoint: requestEndPoints.qrcodedetail,
                data: {
                    openId: wx.getStorageSync('openid'),
                    tenantId: app.globalData.tenantId,
                    qrCode: options.qrCode
                },
                success: (res) => {
                    if (res.data.status === 200) {
                        tracking({
                            coupon: res.data.data.couponId || '',
                            activityId: res.data.data.activityId || '',
                            event: '06',
                            eventState: '获取详情成功'
                        })
                        wx.hideLoading()
                        res.data.data.descClause = res.data.data.descClause ? res.data.data.descClause.replace(/img/g, 'img class="descClauseImg"') : ''


                        if (res.data.data.effectiveType == 0) {
                            this.setData({
                                validTime: `${res.data.data.effectiveStartTime} 至 ${res.data.data.effectiveEndTime}`
                            })
                        }
                        if (res.data.data.effectiveType == 1) {
                            this.setData({
                                validTime: res.data.data.activedLimitedStartDay == 0 ? `领取当天生效,${res.data.data.activedLimitedDays}天内可用` : `领取${res.data.data.activedLimitedStartDay}天后生效,${res.data.data.activedLimitedDays}天内可用`
                            })
                        }
                        this.setData({
                            couponInfo: res.data.data
                        })
                        this.getShopList(this.data.couponInfo.couponId)
                        var size = this.setCanvasSize(); //动态设置画布大小
                        var initUrl = res.data.data.qrCode;
                        this.createQrCode(initUrl, "mycanvas", size.w, size.h)
                        console.log(111, "成功");
                    } else {
                        wx.hideLoading()
                        wx.showToast({
                            title: res.data.message,
                            icon: 'none'
                        })
                    }
                },
                fail: (res) => {
                    wx.hideLoading()
                    console.log('fail', res);
                    tracking({
                        coupon: res.data.data.couponId || '',
                        activityId: res.data.data.activityId || '',
                        event: '06',
                        eventState: '获取详情失败'
                    })
                }
            });
        }
    },
    // 判断券码是否可用印章
    checkSeal() {
        var _self = this;
        postRequestWithParameter({
            endPoint: requestEndPoints.checkSealInfo,
            data: {
                tenantId: wx.getStorageSync('member').miniFans.tenantId,
                couponCode: this.data.qrCode
            },
            success(res) {
                console.log(666, res.data);
                if (res.data.data.code == 200) {
                    _self.setData({
                        showSeal: true
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

    getSealConfig(){
        getConfig({
            success: (res) => { 
                console.log(res)
                this.setData({
                    showBtn: res.eseal_status? res.eseal_status=='off' : true
                })
            },
            fail: () => { },
            myTag:'eseal'
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getSealConfig()
        this.setData({
            qrCode: options.qrCode,
            extendInfo: options.extendInfo
        })
        this.checkSeal();
        this.getSeal();
        if (options.qrCode == 'refund') {
            if (app.globalData.couponDetail.descClause.indexOf('descClauseImg') == -1) {
                app.globalData.couponDetail.descClause = app.globalData.couponDetail.descClause.replace(/img/g, 'img class="descClauseImg"')
            }
            this.setData({
                couponInfo: app.globalData.couponDetail
            })
            this.getShopList(this.data.couponInfo.couponId || this.data.couponInfo.id, true)
            var size = this.setCanvasSize(); //动态设置画布大小
            var initUrl = this.data.couponInfo.qrCode;
            this.createQrCode(initUrl, "mycanvas", size.w, size.h);
            // wx.canvasToTempFilePath({
            //   canvasId: 'mycanvas',
            //   success: function(res) {
            //     console.log(1111, res);
            //     this.setData({ codeImg: res.tempFilePath });
            //   }
            // })

            tracking({
                coupon: app.globalData.couponDetail.couponId || '',
                activityId: app.globalData.couponDetail.activityId || '',
                event: '06',
                eventState: '获取详情成功'
            })
        } else {
            wx.showLoading()
            httpWithParameter({
                endPoint: requestEndPoints.qrcodedetail,
                data: {
                    openId: wx.getStorageSync('openid'),
                    tenantId: app.globalData.tenantId,
                    qrCode: options.qrCode
                },
                success: (res) => {
                    if (res.data.status === 200) {
                        var validTime = "";
                        tracking({
                            coupon: res.data.data.couponId || '',
                            activityId: res.data.data.activityId || '',
                            event: '06',
                            eventState: '获取详情成功'
                        })
                        wx.hideLoading();
                        res.data.data.descClause = res.data.data.descClause ? res.data.data.descClause.replace(/img/g, 'img class="descClauseImg"') : ''


                        if (res.data.data.effectiveType == 0) {
                            if (res.data.data.effectiveEndTime && res.data.data.effectiveStartTime) {
                                let startTime = util.formatTime(new Date(Number(res.data.data.effectiveStartTime)), "-").split(" ")[0];
                                let endTime = util.formatTime(new Date(Number(res.data.data.effectiveEndTime)), "-").split(" ")[0];
                                validTime = `${startTime} 至 ${endTime}`
                            }
                        } else {
                            if (res.data.data.activedLimitedDays) {
                                validTime = `领取${res.data.data.activedLimitedStartDay?res.data.data.activedLimitedStartDay+'天后':'后当天'}生效，有效期${res.data.data.activedLimitedDays}天`
                            }
                        }
                        this.setData({
                            validTime: validTime,
                            couponInfo: res.data.data
                        })
                        this.getShopList(this.data.couponInfo.couponId)
                        var size = this.setCanvasSize(); //动态设置画布大小
                        var initUrl = res.data.data.qrCode;
                        this.createQrCode(initUrl, "mycanvas", size.w, size.h)
                    } else {
                        wx.hideLoading()
                        wx.showToast({
                            title: res.data.message,
                            icon: 'none'
                        })
                    }
                },
                fail: (res) => {
                    wx.hideLoading()
                    console.log('fail', res);
                    tracking({
                        coupon: res.data.data.couponId || '',
                        activityId: res.data.data.activityId || '',
                        event: '06',
                        eventState: '获取详情失败'
                    })
                }
            });
        }

        let manager = wx.getBackgroundAudioManager()
        let that = this
        template.initializeSuccess = () => {
            console.log("initialize success");
        }

        template.onBeforeStamp = () => {
            console.log("onBeforeStamp");
            manager.title = '签章'
            manager.src = 'https://web.echoss.cn/platform/ckit/sounds/stamp_sound.mp3'
        }
        template.certSuccess = (result) => {
            console.log(result);
            that.resetStatus()
            wx.showLoading({
                title: '加载中...',
                mask: true
            })
            console.log("test______start", {
                "qrCode": this.data.qrCode,
                "token": result.token,
                "tenantId": wx.getStorageSync('member').miniFans.tenantId
            });
            wx.Request({
                url: 'https://wx-mini.rtmap.com/wxapp-seal/points/cancel',
                data: {
                    "qrCode": this.data.qrCode,
                    "token": result.token,
                    "tenantId": wx.getStorageSync('member').miniFans.tenantId
                    // "cid": wx.getStorageSync('member').cid, //用户id
                    // "appId": "wx169cc199f585334c",
                },
                method: 'POST',
                dataType: 'json',
                success: (res) => {
                    tracking({
                        coupon: this.data.couponInfo.couponId || '',
                        activityId: this.data.couponInfo.activityId || '',
                        event: '21',
                        eventState: '核销成功'
                    })
                    if (res.data.status == 200) {
                        this.setData({
                            convertData: {
                                title: '核销成功',
                                titleImg: 'http://res.rtmap.com/wx/seal/success.png',
                                content: '',
                                convert: "欢迎下次光临"
                            }
                        })
                        this.showALert();
                        console.log('获取详情')
                        //this.getDetail();
                        tracking({
                            coupon: this.data.couponInfo.couponId || '',
                            activityId: this.data.couponInfo.activityId || '',
                            event: '07',
                            eventState: '跳转优惠券列表'
                        })
                        wx.navigateTo({
                            url: '/rtmap/coupons/pages/couponList/couponList?status=' + this.data.status,
                            // url: '/rtmap/coupons/pages/shopsList/shopsList?couponId=' + this.data.couponInfo.couponId,
                            success: function(res) {
                            },
                            fail: function(res) {
                            }
                        })
                    } else {
                        tracking({
                            coupon: this.data.couponInfo.couponId || '',
                            activityId: this.data.couponInfo.activityId || '',
                            event: '21',
                            eventState: '核销失败'
                        })
                        this.setData({
                            convertData: {
                                title: '核销失败',
                                titleImg: 'http://res.rtmap.com/wx/seal/error.png',
                                content: res.data.message
                            }
                        })
                        this.showALert()
                    }
                },
                fail: (res) => {
                    tracking({
                        coupon: this.data.couponInfo.couponId || '',
                        activityId: this.data.couponInfo.activityId || '',
                        event: '21',
                        eventState: '签章失败'
                    })
                    this.setData({
                        convertData: {
                            title: '签章失败',
                            titleImg: 'http://res.rtmap.com/wx/seal/error.png',
                            content: '核销积分失败',
                        }
                    })
                    this.showALert()
                },
                complete: function(res) {
                    wx.hideLoading()
                },
            })
        }
        template.certError = (errorCode, errorMessage) => {
            this.resetStatus()
        }

    },

    formatTime(time, days) {
        let date = new Date(time + days * 24 * 60 * 60 * 1000)
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        wx.hideShareMenu()
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    getShopList(couponId, loading = false) {
        if (loading) {
            wx.showLoading()
        }
        httpWithParameter({
            endPoint: requestEndPoints.shops,
            data: {
                portalId: app.globalData.tenantId,
                couponId
            },
            success: (res) => {
                if (loading) {
                    wx.hideLoading()
                }
                console.log('refresh', res.data)
                if (res.data.status == 200) {
                    this.setData({
                        shops: res.data.data.list,
                        bbgFloor: res.data.data.list.length > 0 ? util.formatFloor(res.data.data.list[0].floorId) : ''
                    });
                }
            },
            fail: (res) => {
                if (loading) {
                    wx.hideLoading()
                }
                console.log('fail', res);
            }
        });
    },
    call(e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.id,
            success() {
                console.log('拨打成功')
            }
        })
    },
    //适配不同屏幕大小的canvas
    setCanvasSize: function() {
        var size = {};
        try {
            var res = wx.getSystemInfoSync();
            var scale = 750 / 400; //不同屏幕下canvas的适配比例；设计稿是750宽
            var width = res.windowWidth / scale;
            var height = width; //canvas画布为正方形
            size.w = width;
            size.h = height;
        } catch (e) {
            // Do something when catch error
            console.log("获取设备信息失败" + e);
        }
        return size;
    },
    createQrCode: function(url, canvasId, cavW, cavH) {
        //调用插件中的draw方法，绘制二维码图片
        QR.api.draw(url, canvasId, cavW, cavH);
        setTimeout(() => {
            this.canvasToTempImage();
        }, 500);

    },
    //获取临时缓存照片路径，存入data中
    canvasToTempImage: function() {
        var that = this;
        wx.canvasToTempFilePath({
            canvasId: 'mycanvas',
            success: function(res) {
                var tempFilePath = res.tempFilePath;
                console.log(tempFilePath);
                that.setData({
                    imagePath: tempFilePath,
                    // canvasHidden:true
                });
            },
            fail: function(res) {
                console.log(res);
            }
        });
    },
    //点击图片进行预览，长按保存分享图片
    previewImg: function(e) {
        var img = this.data.imagePath;
        console.log(img);
        wx.previewImage({
            current: img, // 当前显示图片的http链接
            urls: [img] // 需要预览的图片http链接列表
        })
    },
    formSubmit: function(e) {
        var that = this;
        var url = e.detail.value.url;
        that.setData({
            maskHidden: false,
        });
        wx.showToast({
            title: '生成中...',
            icon: 'loading',
            duration: 2000
        });
        var st = setTimeout(function() {
            wx.hideToast()
            var size = that.setCanvasSize();
            //绘制二维码
            that.createQrCode(url, "mycanvas", size.w, size.h);
            that.setData({
                maskHidden: true
            });
            clearTimeout(st);
        })

    },

    onShareAppMessage(res) {
        //埋点数据
        tracking({
            coupon: this.data.couponInfo.couponId || '',
            activityId: this.data.couponInfo.activityId || '',
            event: '02',
            eventState: '转发'
        })
        
        let member = wx.getStorageSync('member');
        if (res.from === 'button') {
            this.onGiveFriendClick()
            return {
                title: '【可领取】' + this.data.couponInfo.mainInfo,
                path: '/pages/present/index/index?qrcode=' + this.data.qrCode + '&cid=' + member.member.cid + '&portalId=' + app.globalData.tenantId,
                imageUrl: '../../../../images/present/share.jpg',
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
        } else {
            return
        }

    },
    //赠送好友
    onGiveFriendClick() {
        console.log(this.data.couponInfo)
        let member = wx.getStorageSync('member');
        let userInfo = wx.getStorageSync('userInfo');
        const params = {
            appId: app.globalData.tenantId,
            oldCid: member.member.cid,
            headPortrait: userInfo.avatarUrl ? userInfo.avatarUrl : '../../../../images/head_default.png',
            nickName: userInfo.nickName ? userInfo.nickName : '匿名',
            couponActivityId: this.data.couponInfo.couponActivityId,
            couponId: this.data.couponInfo.couponId,
            portalId: app.globalData.tenantId,
            qrCode: this.data.qrCode,
            subjectType: 2
        }
        handlePresentRequest(giftsEndUrl.getGiveShare, params, 'post', function(res) {
            if (res.data.code == 200) {
                wx.showToast({
                    title: '分享成功',
                    icon: 'success',
                    duration: 2000
                })
            } else {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                })
            }
        }, function() {

        })
    },
    /**
     * 查询更多商铺
     */
    queryMoreShops: function() {
        tracking({
            coupon: this.data.couponInfo.couponId || '',
            activityId: this.data.couponInfo.activityId || '',
            event: '07',
            eventState: '跳转店铺列表'
        })
        console.log(this.data.shops[0].couponId)
        wx.navigateTo({
            url: '/rtmap/coupons/pages/shopsList/shopsList?couponId=' + this.data.couponInfo.couponId,
            success: function(res) {
            },
            fail: function(res) {
            }
        })
    },

    /**
     * 导航到店铺
     */
    navigationToShop: function() {
        const shop = this.data.shops[0];
        console.log(shop)
        if (shop.buildId && shop.floorId && shop.x && shop.y && shop.poiNo) {
            tracking({
                coupon: this.data.couponInfo.couponId || '',
                activityId: this.data.couponInfo.activityId || '',
                event: '07',
                eventState: '跳转福利地图'
            })
            wx.navigateTo({
                url: `/rtmap/coupons/pages/webView/webView?buildBean=${JSON.stringify({ buildId: shop.buildId, floor: shop.floorId, x: shop.x, y: shop.y, pageUrl: getCurrentPages()[getCurrentPages().length - 1].route, poiNo: shop.poiNo })}`,
                success: function(res) {
                },
                fail: function(res) {
                }
            })
        } else {
            wx.showToast({
                title: '找不到店铺',
                icon: 'none',
                duration: 2000,
                mask: true,
            })
        }
    },

    /**
     * 拨打商铺电话 第一个商铺
     */
    onCallClick() {
        tracking({
            coupon: this.data.couponInfo.couponId || '',
            activityId: this.data.couponInfo.activityId || '',
            event: '12',
            eventState: '拨打电话'
        })
        if (this.data.shops[0].mobile) {
            wx.makePhoneCall({
                phoneNumber: this.data.shops[0].mobile,
            })
        } else {
            wx.showToast({
                title: '该商家没有电话',
                icon: 'none',
                duration: 2000,
                mask: true,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            })
        }
    },
})