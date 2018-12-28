//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {
    tracking
} from '../../../rtmap/coupons/utils/track.js';
import {
    handleRequest,
    portsEndUrl
} from '../../../utils/util.js';
import {
    handlePresentRequest,
    giftsUrl,
    giftsEndUrl
} from '../../../utils/util_new_gift.js'
const QR = require('../../../utils/new_gift_code.js');
Page({
    data: {
        id: '',
        actionOrder: null,
        qrcodeBtn: false,
        autoplay: false,
        duration: 1000,
        size: {}
    },

    handleStoreList() {

    },

    setCanvasSize() {
        var size = {};
        try {
            var res = wx.getSystemInfoSync();
            var scale = 750 / 346;
            var width = res.windowWidth / scale;
            var height = width;
            size.w = width;
            size.h = height;
        } catch (e) {
            console.log("获取设备信息失败" + e);
        }
        return size;
    },

    createQrCode(str, canvasId, cavW, cavH) {
        QR.api.draw(str, canvasId, cavW, cavH);
    },

    handleSeeQrcode() {
        let That = this;
        this.setData({
            qrcodeBtn: true
        })
        That.data.size = That.setCanvasSize()
        for (var i = 0; i < That.data.actionOrder.enrolllist.length; i++) {
            That.createQrCode(That.data.actionOrder.enrolllist[i].codes, 'qrcCanvas' + i, this.convert_length(500), this.convert_length(500));
        }
    },

    convert_length(length) {
        return Math.round(wx.getSystemInfoSync().windowWidth * length / 750);
    },

    hiddenModal() {
        this.setData({
            qrcodeBtn: false
        })
    },

    linkToDetail() {
        tracking({
            event: '07',
            eventState: '报名页'
        })
        wx.navigateTo({
            url: '/pages/w_activity/detail/detail?id=' + this.data.actionOrder.actionId,
            success: function(res) {
            },
            fail: function(res) {
            }
        })
    },

    scoreJustify() {
        let That = this
        let openid = wx.getStorageSync('openid');
        let buildList = wx.getStorageSync('buildList');
        let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.payFree, {
            keyAdmin: keyAdmin,
            outtradeno: 'JIFEN',
            orderId: this.data.id,
            paytype: 2
        }, 'post', function(res) {
            if (res.data.code == 200) {
                wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(function() {
                    tracking({
                        event: '07',
                        eventState: '报名订单列表'
                    })
                    wx.navigateTo({
                        url: '/pages/w_activity/order/order',
                        success: function(res) {
                        },
                        fail: function(res) {
                        }
                    })
                }, 1000);
            } else {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                })
            }
        }, function(res) {})

    },

    moneyOrder(outtradeno) {
        let That = this
        let openid = wx.getStorageSync('openid');
        let buildList = wx.getStorageSync('buildList');
        let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.payFree, {
            keyAdmin: keyAdmin,
            outtradeno: outtradeno,
            orderId: this.data.id,
            paytype: 1
        }, 'post', function(res) {
            if (res.data.code == 200) {
                setTimeout(function() {
                    tracking({
                        event: '07',
                        eventState: '报名订单列表'
                    })
                    wx.navigateTo({
                        url: '/pages/w_activity/order/order',
                        success: function(res) {
                        },
                        fail: function(res) {
                        }
                    })
                }, 1000);
            } else {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                })
            }
        }, function(res) {

        })
    },
    // 没调此接口
    // payMoney() {
    //     let That = this
    //     let openid = wx.getStorageSync('openid');
    //     let buildList = wx.getStorageSync('buildList');
    //     let keyAdmin = wx.getStorageSync('keyAdmin');
    //     handleRequest(portsEndUrl.payMoney, {
    //         keyAdmin: keyAdmin,
    //         openid: openid,
    //         orderId: this.data.id,
    //         totalFee: this.data.actionOrder.money * 100
    //     }, 'post', function(res) {
    //         if (res.data.code == 200) {

    //             let result = res.data.data;
    //             console.log(res.data)
    //             wx.requestPayment({
    //                 timeStamp: result.timeStamp,
    //                 nonceStr: result.nonceStr,
    //                 package: result.package,
    //                 signType: 'MD5',
    //                 paySign: result.paySign,
    //                 success: function(res) {
    //                     console.log(res)

    //                     That.moneyOrder(result.outtradeno)
    //                 },
    //                 fail: function(res) {
    //                     wx.showToast({
    //                         title: '支付失败',
    //                         icon: 'success',
    //                         duration: 2000
    //                     })
    //                 }
    //             })
    //         } else {
    //             wx.showToast({
    //                 title: res.data.msg,
    //                 icon: 'none',
    //                 duration: 2000
    //             })
    //         }
    //     }, function(res) {
    //         wx.showToast({
    //             title: '获取列表失败',
    //             icon: 'none',
    //             duration: 2000
    //         })
    //     })
    // },

    payScore() {
        let That = this
        let openid = wx.getStorageSync('openid');
        let buildList = wx.getStorageSync('buildList');
        let keyAdmin = wx.getStorageSync('keyAdmin');
        let member = wx.getStorageSync('member');
        wx.Request({
            url: giftsUrl + giftsEndUrl.justifyScore,
            data: {
                tenantType: 1,
                tenantId: app.globalData.tenantId,
                cid: member.member.cid,
                adjustValue: -this.data.actionOrder.score
            },
            method: 'post',
            header: {
                'content-type': 'application/json'
            },
            success: function(res) {
                if (res.data.code == 200) {
                    That.scoreJustify()
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            },
            fail: function(res) {}
        })
        //  let That = this
        // let mobile = wx.getStorageSync('mobile');
        // let member = wx.getStorageSync('member');
        // const params = {
        //     portalId:app.globalData.tenantId,
        //     mobile:mobile,
        //     cid:member.member.cid,
        //     integralValue:-this.data.actionOrder.score,
        //     tenantType:"1"
        // }

        //  handlePresentRequest(giftsEndUrl.scoreGetCount,params,'post',function(res){
        //     if(res.data.code == 200){


        //     }else{
        //          wx.showToast({
        //             title: res.data.msg,
        //             icon: 'none',
        //             duration: 2000
        //         }) 
        //     }
        // },function(){

        // })

    },

    payFree() {
        let That = this
        let openid = wx.getStorageSync('openid');
        let buildList = wx.getStorageSync('buildList');
        let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.payFree, {
            keyAdmin: keyAdmin,
            outtradeno: 'MIANFEI',
            orderId: this.data.id,
            paytype: 2
        }, 'post', function(res) {
            if (res.data.code == 200) {
                wx.showToast({
                    title: '支付成功',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(function() {
                    tracking({
                        event: '07',
                        eventState: '报名订单列表'
                    })
                    wx.navigateTo({
                        url: '/pages/w_activity/order/order',
                        success: function(res) {
                        },
                        fail: function(res) {
                        }
                    })
                }, 1000);

            } else {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                })
            }
        }, function(res) {
            wx.showToast({
                title: '获取列表失败',
                icon: 'none',
                duration: 2000
            })
        })
    },

    handleGetOrderInfo() {
        let That = this
        let openid = wx.getStorageSync('openid');
        let buildList = wx.getStorageSync('buildList');
        let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.getOrderInfo, {
            keyAdmin: keyAdmin,
            openid: openid,
            orderId: this.data.id
        }, 'post', function(res) {
            if (res.data.code == 200) {
                That.setData({
                    actionOrder: res.data.actionOrder
                })

            } else {
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                })
            }
        }, function(res) {
            wx.showToast({
                title: '获取列表失败',
                icon: 'none',
                duration: 2000
            })
        })
    },

    handleChangeTap(e) {


    },

    onLoad(options) {
        this.setData({
            id: options.id
        })
    },
    onShow: function() {
        this.handleGetOrderInfo()
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    }
})