// pages/couponInfo/couponInfo.js
var QR = require("../../utils/qrcode.js")
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../utils/httpUtil.js'
import util from '../../utils/util.js'
import {
  tracking
} from '../../utils/track.js'
var app = getApp()
var qrCode = 
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
            couponActivityId: '', //券批id
            placeholder: '124245654huhu', //默认二维码生成文本
            canvasHidden: true,
            couponInfo: {
                status: '2'
            },
            qrCode: '',
            extendInfo: '',
            shops: [],
            startTime: null,
            endTime: null,
            bbgFloor: '',
        },

        /**
         * 生命周期函数--监听页面加载
         */
        onLoad: function(options) {
          
            this.setData({
                qrCode: options.qrCode,
                extendInfo: options.extendInfo || ''
            })
            console.log(1111111,options)
            if (options.qrCode == 'refund') {
                console.log(2222)
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
            } else {
                console.log(33333)
                wx.showLoading()
                httpWithParameter({
                    endPoint: requestEndPoints.qrcodeDetail,
                    data: {
                        // openId: wx.getStorageSync('openid'),
                        // tenantId: app.globalData.tenantId,
                        qrCode: options.qrCode
                    },
                    success: (res) => {
                        if (res.data.status === 200) {
                            wx.hideLoading()
                            var validTime = "";
                            res.data.data.descClause = res.data.data.descClause ? res.data.data.descClause.replace(/img/g, 'img class="descClauseImg"') : '';
                            if(res.data.data.effectiveType==0){
                                if(res.data.data.effectiveEndTime&&res.data.data.effectiveStartTime){
                                    let startTime = util.formatTime(new Date(Number(res.data.data.effectiveStartTime)));
                                    let endTime =  util.formatTime(new Date(Number(res.data.data.effectiveEndTime)));
                                    validTime = `${startTime} 至 ${endTime}`
                                }
                            }else{
                                if(res.data.data.activedLimitedDays){
                                    validTime = `领取${res.data.data.activedLimitedStartDay?res.data.data.activedLimitedStartDay+'天后':'后当天'}生效，有效期${res.data.data.activedLimitedDays}天`
                                }
                            }
                            // let startTime = res.data.data.effectiveType == 0 ? res.data.data.effectiveStartTime : util.formatTime(res.data.data.getTime, res.data.data.activedLimitedStartDay)
                            // let endTime = res.data.data.effectiveType == 0 ? res.data.data.effectiveEndTime : util.formatTime(r领取${res.data.data.activedLimitedStartDay?res.data.data.activedLimitedStartDay+'天后'||'后当天'}生效es.data.data.getTime, res.data.data.activedLimitedDays)
                            this.setData({
                                validTime: validTime,
                                couponInfo: res.data.data
                            })
                            this.getShopList(this.data.couponInfo.couponId)
                            var size = this.setCanvasSize(); //动态设置画布大小
                            var initUrl = res.data.data.qrCode;
                            this.createQrCode(initUrl, "mycanvas", size.w, size.h);
                        } else {
                            wx.hideLoading()
                            wx.showToast({
                                title: res.data.message,
                              icon: 'none',
                              duration: 2000
                            });
                            wx.navigateBack({
                                delta: 1
                            })
                        }
                    },
                    fail: (res) => {
                        wx.hideLoading()
                    }
                });
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
            tracking({
                event: '06',
                eventState: '进入成功'
            })
            wx.hideShareMenu()
        },

        

        getShopList(couponId, loading = false) {
            if (loading) {
                wx.showLoading()
            }
            httpWithParameter({
                endPoint: requestEndPoints.shops,
                data: {
                    couponId,
                    portalId: app.globalData.tenantId
                },
                success: (res) => {
                    if (loading) {
                        wx.hideLoading()
                    }
                    if (res.data.status == 200) {
                        this.setData({
                            shops: res.data.data.list,
                            bbgFloor: res.data.data.list.length > 0 ? res.data.data.list[0].floorId : ''
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
            }, 5000);

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
            tracking({
                event: '02',
                eventState: '转发'
            })
            let member = wx.getStorageSync('member');
            if (res.from === 'button') {
                return {
                    title: '优惠券转赠',
                    path: '/pages/present/index/index?qrcode=' + this.data.qrCode + '&cid=' + member.member.cid + '&portalId=' + app.globalData.tenantId,
                    imageUrl: '',
                    success: res => {
                        wx.showToast({
                            title: '分享成功',
                            icon: 'success',
                            duration: 2000
                        })
                        this.onGiveFriendClick()
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
        onGiveFriendClick() {},
        /**
         * 查询更多商铺
         */
        queryMoreShops: function() {
            tracking({
                event: '07',
                eventState: '跳转店铺列表'
            })
            wx.navigateTo({
                url: '/couponM/pages/shopsList/shopsList?couponId=' + this.data.couponInfo.couponId,
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
            if (shop.buildId && shop.floorId && shop.x && shop.y && shop.poiNo) {
                tracking({
                    event: '07',
                    eventState: '跳转福利地图'
                })
                wx.navigateTo({
                    url: '../webView/webView?linkType=map&buildid=' + shop.buildId + '&floor=' + shop.floorId + '&x=' + shop.x + '&y=' + shop.y + '&poiNo=' + shop.poiNo,
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