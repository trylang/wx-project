// import {
//     requestEndPoints,
//     httpWithParameter,
//     postRequestWithParameter
// } from '../../../../rtmap/coupons/utils/httpUtil.js';
import {
    get,
    post,
    paths,
    addnum,
    reducenum
} from '../../http.js';
import {
    tracking
} from '../../../coupons/utils/track.js'
//import util from '../../util.js'
// const statustype={
//     50000:'下单成功',
//     50003:'起售权限不足',
//     50004:'积分不足',
//     50005:'扣积分失败',
//     50006:'预下单失败',
//     50007:'预领券失败',
//     50008:'领券失败',
//     50009:'未知异常',
//     50010:"优惠券过期",
//     200:'完成'
// }
const app = getApp();
const tenantId = app.globalData.tenantId;
//const activityId = app.globalData.seckillActivityId;
const tenantType = app.globalData.tenantType;
var statustime = null;
Page({
    /**
     * 页面的初始数据
     */
    data: {
        isfromshare: false,
        coupon: {},
        showModal: false, //不要通过直接设置来控制modal显示，而是通过showModal方法
        modalType: '',
        distance: -1,
        qrCode: '',
        bbgFloor: '',
        isFromShare: 'false',
        isMove: false,
        countdown: {
            hasstart: 0,
            year: 0,
            month: 0,
            day: 0,
            remainhour: 0,
            remainminute: 0,
            remainsecond: 0,
            status: ""
        },
        now: 0,
        Id: "",
        couponId: "",
        isMove: false,
        startTime: null,
        endTime: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var _self = this;
        if (app.globalData.miaoshafromshare) {
            this.setData({
                isfromshare: true
            })
            app.globalData.miaoshafromshare = false;
        }
        this.getMemberList();
        this.setData({
            couponId: options.couponId,
            Id: options.Id,
            isFromShare: options.isFromShare || 'false',
        })
        get(paths.getActivityId, {}, function(res) {
            if (res.data.data != _self.data.activityId) {
                _self.setData({
                    activityId: res.data.data
                })
                if (_self.data.activityId)
                    tracking({
                        event: '06',
                        eventState: '进入成功 优惠券加载成功',
                        activityId: _self.data.activityId,
                        coupon: _self.data.couponId,
                    })
            }
        })
        // this.getDetail()
        // this.getTime()
    },
    onUnload: function() {

    },
    onPullDownRefresh: function() {
        this.getDetail()
        this.getTime()
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
    getMemberList() {
        var _self = this;
        get(paths.getCardList, {
            tenantType: tenantType
        }, function(res) {
            var list = {}
            if (res.data.data && res.data.data.forEach) {
                res.data.data.forEach(item => {
                    list[item.id] = item.name
                })
                _self.setData({
                    memberlist: list
                })
            }
        }, function() {}, true)
    },
    getDetail() {
        var _self = this;
        wx.showLoading({
            title: '加载中...',
        })
        get(paths.getCouponDetail, {
            id: this.data.Id,
            //activityId:activityId,
            couponId: this.data.couponId
        }, function(res) {
            wx.stopPullDownRefresh()
            if (res.data.status === 200) {
                //res.data.data.descClause = res.data.data.descClause ? res.data.data.descClause.replace(/img/g, 'img class="descClauseImg"') : ''
                var data = res.data.data;
                if (data.imgtxtInfo) {
                    data.imgtxtInfo = JSON.parse(data.imgtxtInfo)
                    data.imgtxtInfo = data.imgtxtInfo.map(function(item) {
                        if (typeof item == "string") {
                            return item.replace(/img/g, 'img class="descClauseImg"');
                        } else {
                            var html = "";
                            if (item.img) {
                                html = `<img class="descClauseImg" src="${item.img}"><div class="message_content">${item.html}</div>`
                            } else {
                                html = item.html;
                            }
                            return html
                        }
                    });
                }
                data.imgUrl = "";
                data.couponImageList.forEach(function(item) {
                    if (item.imgType == 1) {
                        data.imgUrl = item.imgUrl;
                    }
                })
                let startTime = data.effectiveStartTime;
                let endTime = data.effectiveEndTime;
                // let startTime = data.effectiveType == 0 ? data.effectiveStartTime : _self.formatTime(data.getTime, data.activedLimitedStartDay)
                // let endTime = data.effectiveType == 0 ? data.effectiveEndTime : _self.formatTime(data.getTime, data.activedLimitedDays)
                _self.setData({
                    startTime: startTime,
                    endTime: endTime,
                    coupon: data
                    //bbgFloor: res.data.data.shops.length > 0 ? util.formatFloor(res.data.data.shops[0].floorId) : ''
                })
            }
            if (_self.data.activityId)
            tracking({
                event: '06',
                eventState: '进入成功 优惠券加载成功',
                activityId: _self.data.activityId,
                coupon: _self.data.couponId,
            })
            wx.hideLoading()
        }, function() {
            wx.stopPullDownRefresh()
            tracking({
                event: '06',
                eventState: '进入成功 优惠券加载失败',
                activityId: _self.data.activityId,
            })
            console.log('fail', res);
            wx.hideLoading()
        })
    },
    onShow() {
        this.getDetail()
        this.getTime()

        // if (this.data.activityId) {
        //     tracking({
        //         event: '07',
        //         activityId: this.data.activityId,
        //         eventState: '进入秒杀券详情页'
        //     })
        // }
    },
    getTime() {
        var _self = this;
        get(paths.getTime, {}, function(res) {
            _self.setData({
                now: res.data.data
            })
            _self.startcountdown()
        })
    },
    startcountdown: function() {
        if (this.timeline) {
            clearInterval(this.timeline);
        }
        this.countdown(this.data.now);
        this.timeline = setInterval(() => {
            this.countdown(this.data.now + 1000)
        }, 1000);
    },
    countdown(now) {
        var coupon = this.data.coupon;
        if (!coupon || !coupon.startTime) {
            return;
        }
        //var now = this.data.now + 1000;
        // var time = new Date(now);
        // var orgday = this.data.countdown.day;
        // var day = time.getDate();
        // var hour = time.getHours();
        // var year = time.getFullYear();
        // var month = time.getMonth() + 1;
        // var startinfo = new Date();//this.data.coupon.startTime.split("-");
        // var startyear = startinfo[0];
        // var startmonth = startinfo[1];
        // var startday = startinfo[2];
        // var starttime = new Date(`${startyear}/${startmonth}/${startday}`).setHours(11);
        // var endtime = new Date(`${startyear}/${startmonth}/${startday}`).setHours(24);
        // var endhour = 11;
        var remaintime = "";
        var status;
        if (now < coupon.startTime) {
            status = 0;
            remaintime = coupon.startTime - now;
        } else if (now > coupon.startTime && now < coupon.endTime) {
            status = 1;
            remaintime = coupon.endTime - now;
        } else {
            status = 2;
        }
        var remainhour = Math.floor(remaintime / 3600000);
        var remainminute = Math.floor(remaintime % 3600000 / 60000);
        var remainsecond = Math.floor(remaintime % 60000 / 1000);
        this.setData({
            countdown: {
                status: status,
                orgstatus: status,
                // year: year,
                // month: month > 9 ? month : '0' + month,
                // day: day > 9 ? day : '0' + day,
                remainhour: remainhour > 9 ? remainhour : '0' + remainhour,
                remainminute: remainminute > 9 ? remainminute : '0' + remainminute,
                remainsecond: remainsecond > 9 ? remainsecond : '0' + remainsecond,
            },
            now: now,
        })
    },
    // getTimeStatus(now){

    // },
    /**
     * 页面出现
     */
    // onShow: function() {
    //     tracking({
    //         event: '06',
    //         eventState: '进入成功',
    //         activityId: this.data.coupon.activityId,
    //         coupon: this.data.coupon.id,
    //     })
    // },

    /**
     * 预支付处理 获取支付信息
     */
    prePay() {
        tracking({
            activityId: this.data.activityId,
            coupon: this.data.Id,
            event: '18',
            eventState: '点击领取'
        })
        // if (this.data.coupon.batchStatus == 6) {
        //     return
        // }
        // coupon_fail_upper login coupon_success
        //const isLogin = wx.getStorageSync('isLoginSucc')

        const openid = wx.getStorageSync('openid');
        const cid = wx.getStorageSync('member').cid;
        if (!cid) {
            wx.navigateTo({
                url: `${app.globalData.loginPath}?sourceid=${this.data.activityId}&from=秒杀券详情`,
                success:()=>{
                    tracking({
                        event: '07',
                        eventState: '跳转登录成功',
                        activityId: this.data.activityId,
                        coupon: this.data.Id,
                    })
                }
            })
            return;
        }
        var _self = this;

        get(paths.buyCoupon, {
            fieldId: this.data.coupon.fieldId,
            id: this.data.coupon.batchItemId,
            mobile: wx.getStorageSync('mobile')
        }, function(res) {
            if (res.data.status == 200) {
                _self.getBuyStatus()
            }
        })
    },
    getBuyStatus() {
        //var _self=this;
        addnum();
        setTimeout(this.getStatusAsync, 1000);
        // statustime = setInterval(function(){
        //     get(paths.buyCouponStatus,{
        //         id:_self.data.coupon.batchItemId
        //     },function(res){
        //         //console.log(res.data.status)
        //         if(res.data.status&&[50001,50002].indexOf(res.data.status)==-1){
        //             clearInterval(statustime)           //停止轮询
        //             reducenum();
        //             wx.showToast({
        //                 title:statustype[res.data.status],
        //                 icon:"none"
        //             })
        //         }
        //     })
        // },1000)
    },
    getStatusAsync() {
        var _self = this;
        get(paths.buyCouponStatus, {
            id: _self.data.coupon.batchItemId
        }, function(res) {
            //console.log(res.data.status)
            if (res.data.status && [50001, 50002].indexOf(res.data.status) == -1) {
                //clearInterval(statustime)           //停止轮询
                reducenum();
                if (res.data.status == 50000) {
                    _self.pay(res.data.data);
                } else if (res.data.status == 200) {
                    tracking({
                        activityId: _self.data.activityId,
                        coupon: _self.data.couponId,
                        event: '18',
                        eventState: '领取成功'
                    })
                    wx.navigateTo({
                        url: '../orderresult/orderresult?status=1&orderId=' + res.data.data.orderId,
                        success: function(res) {
                            tracking({
                                event: '07',
                                eventState: '跳转购买结果成功',
                                activityId: _self.data.activityId,
                                coupon: _self.data.couponId,
                            })
                        },
                        fail: function(res) {
                            tracking({
                                event: '07',
                                eventState: '跳转购买结果失败',
                                activityId: _self.data.activityId,
                                coupon: _self.data.couponId,
                            })
                        }
                    });
                } else {
                    tracking({
                        activityId: _self.data.activityId,
                        coupon: _self.data.couponId,
                        event: '18',
                        eventState: '领取失败'
                    })
                    setTimeout(function() {
                        wx.showToast({
                            title: res.data.message,
                            duration: 3000,
                            icon: "none"
                        })
                    }, 10)
                }
            } else {
                setTimeout(_self.getStatusAsync, 1000);
            }
        }, function() {}, true)
        //})
    },
    /**
     * 支付处理 调起微信支付
     */
    pay: function(payInfo) {
        var _self = this;
        if (!payInfo) {
            return;
        }

        wx.requestPayment({
            timeStamp: payInfo.timeStamp + '',
            nonceStr: payInfo.nonceStr,
            package: payInfo.package,
            signType: payInfo.signType,
            paySign: payInfo.paySign,
            success: function(res) {
                console.log(res);
                get(paths.payStatus, Object.assign({
                    msg: res.errMsg
                }, payInfo), function(response) {
                    if (response.data.status == 200) {
                        tracking({
                            activityId: _self.data.activityId,
                            coupon: _self.data.couponId,
                            event: '18',
                            eventState: '领取成功'
                        })
                        wx.navigateTo({
                            url: '../orderresult/orderresult?status=1&orderId=' + payInfo.orderId,
                            success: function(res) {
                                tracking({
                                    event: '07',
                                    eventState: '跳转购买结果成功',
                                    activityId: _self.data.activityId,
                                    coupon: _self.data.couponId,
                                })
                            },
                            fail: function(res) {
                                tracking({
                                    event: '07',
                                    eventState: '跳转购买结果失败',
                                    activityId: _self.data.activityId,
                                    coupon: _self.data.couponId,
                                })
                            }
                        });
                    }else{
                        tracking({
                            activityId: _self.data.activityId,
                            coupon: _self.data.couponId,
                            event: '18',
                            eventState: '领取失败'
                        })
                    }
                }, function() {}, true)
            },
            fail: function(res) {
                tracking({
                    activityId: _self.data.activityId,
                    coupon: _self.data.couponId,
                    event: '18',
                    eventState: '领取失败'
                })
                //console.log(error);

                get(paths.payStatus, Object.assign({
                    msg: res.errMsg
                }, payInfo), function(response) {

                }, function() {}, true)
                wx.navigateTo({
                    url: '../orderresult/orderresult?status=0&orderId=' + payInfo.orderId,
                    success: function(res) {
                        tracking({
                            event: '07',
                            eventState: '跳转购买结果成功',
                            activityId: _self.data.activityId,
                            coupon: _self.data.couponId,
                        })
                    },
                    fail: function(res) {
                        tracking({
                            event: '07',
                            eventState: '跳转购买结果失败',
                            activityId: _self.data.activityId,
                            coupon: _self.data.couponId,
                        })
                    }
                });
            }
        });
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage(options) {
        tracking({
            event: '02',
            eventState: '转发',
            activityId: this.data.activityId,
            coupon: this.data.Id,
        })
        return {
            title: this.data.coupon.mainInfo,
            path: '/rtmap/seckill/page/detail/detail?Id=' + this.data.Id + '&couponId=' + this.data.couponId + "&isFromShare=true", //batchId=' + this.data.coupon.batchId + '&activityId=' + this.data.coupon.activityId, //detail/detail?batchId={{coupon.batchId}}&activityId={{coupon.activityId}}
            success: function(res) {
            },
            fail: function(res) {
            }
        }
    },

    /**
     * 分享
     */
    sharePage: function() {
        wx.showShareMenu({
            withShareTicket: false,
            success: function(res) {
                console.log('success', res);
            },
            fail: function(res) {
                console.log('fail', res);
            }
        });
        wx.hideShareMenu();
    },

    /**
     * 登录
     */
    login: function() {
        this.hideModal();
    },

    /**
     * 查看其它优惠券
     */
    showOtherCoupons() {
        var _self=this
        this.hideModal();

        wx.switchTab({
            url: '/pages/index/index',
            success: function(res) {
                tracking({
                    event: '07',
                    eventState: '跳转首页成功',
                    activityId: _self.data.activityId,
                    coupon: _self.data.couponId,
                })
            },
            fail: function(res) {
            }
        });
    },

    /**
     * 使用优惠券
     */
    useCoupon() {
        var _self = this
        this.hideModal();

        wx.navigateTo({
            url: '../../../coupons/pages/couponInfo/couponInfo?qrCode=' + this.data.qrCode,
            success: function(res) {
                tracking({
                    event: '07',
                    eventState: '跳转我的优惠券详情成功',
                    activityId: _self.data.activityId,
                    coupon: _self.data.couponId,
                })
            },
            fail: function(res) {
            }
        })
    },

    /**
     * 查询更多商铺
     */
    queryMoreShops() {
        var _self = this
        wx.navigateTo({
            url: '/rtmap/coupons/pages/shopsList/shopsList?couponId=' + this.data.coupon.id,
            success: function(res) {
                tracking({
                    event: '07',
                    eventState: '跳转店铺列表成功',
                    activityId: _self.data.activityId,
                    coupon: _self.data.couponId,
                })
            },
            fail: function(res) {
                
            }
        })
    },

    /**
     * 导航到店铺
     */
    navigationToShop() {
        
        const shop = this.data.coupon.couponApplyShopList[0];
        console.log(shop)
        if (shop.buildId && shop.floorId && shop.x && shop.y && shop.poiNo) {
            tracking({
                event: '07',
                eventState: '跳转福利地图',
                activityId: this.data.activityId,
                coupon: this.data.Id,
            })
            wx.navigateTo({
                url: `/rtmap/coupons/pages/webView/webView?buildBean=${JSON.stringify({ buildId: shop.buildId, floor: shop.floorId, x: shop.x, y: shop.y, poiNo:shop.poiNo,pageUrl: getCurrentPages()[getCurrentPages().length - 1].route })}`,
                success: function(res) {
                    
                },
                fail: function(res) {
                    
                }
            })
        } else {
            wx.showToast({
                title: '找不到店铺',
                icon: 'none',
                duration: 3000,
                mask: true,
            })
        }
    },

    /**
     * 查看更多优惠券
     */
    showMoreCoupons() {
        tracking({
            event: '07',
            eventState: '跳转首页',
            activityId: this.data.activityId,
            coupon: this.data.Id,
        })
        wx.switchTab({
            url: '/pages/index/index',
            success: function(res) {
                
            },
            fail: function(res) {
                
            }
        })
    },

    /**
     * 弹出modal
     */
    showModal: function(modalType) {
        if (modalType && modalType !== '') {
            this.setData({
                modalType: modalType,
                showModal: true,
            });
        }
    },

    /**
     * 弹出框蒙层截断touchmove事件
     */
    preventTouchMove: function(e) {

    },

    /**
     * 拦截弹窗点击事件
     */
    tapModalContent: function() {

    },

    /**
     * 隐藏模态对话框
     */
    hideModal: function() {
        this.setData({
            showModal: false
        });
    },

    onCallClick() {
        tracking({
            activityId: this.data.activityId,
            coupon: this.data.Id,
            event: '12',
            eventState: '点击拨打电话'
        })
        if (this.data.coupon.couponApplyShopList[0].mobile) {
            wx.makePhoneCall({
                phoneNumber: this.data.coupon.couponApplyShopList[0].mobile,
            })
        } else {
            wx.showToast({
                title: '该商家没有电话',
                icon: 'none',
                duration: 3000,
                mask: true,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            })
        }
    },

    //页面滑动监听
    onPageMoveStart(res) {
        //console.log('onPageMove', res)
        this.setData({
            isMove: true,
        })
    },

    //页面滑动结束监听
    onPageMoveEnd() {
        setTimeout(() => {
            this.setData({
                isMove: false,
            })
        }, 500)
    },
    switchAlert(event) {
        const openid = wx.getStorageSync('openid');
        const cid = wx.getStorageSync('member').cid;
        if (!cid) {
            tracking({
                activityId: this.data.activityId,
                coupon: this.data.Id,
                event: '07',
                eventState: '跳转登录'
            })
            wx.navigateTo({
                url: `${app.globalData.loginPath}?sourceid=${this.data.activityId}&from=秒杀券详情`
            })
            return;
        }
        if (this.data.coupon.startTime - this.data.now < 180000) {
            wx.showToast({
                title: "抢购即将开始",
                duration: 3000,
                icon: "none"
            })
        }
        var _self = this,
            url;
        // var target = event.currentTarget;
        // var index = target.dataset.index;
        // var ind = target.dataset.ind;
        // var killgoods = this.data.killgoods;
        var item = this.data.coupon;
        var formId = event.detail.formId;
        var obj = {
            //activityId:activityId,
            batchItemId: item.batchItemId,
            fieldId: item.fieldId,
            tenantType: tenantType,
            name: item.mainInfo
        }
        if (item.notify) {
            url = paths.notifyCancel
        } else {
            url = paths.notifyAdd
            obj.formId = formId
        }
        get(url, obj, function(res) {
            if (res.data.status == 200) {
                if (item.notify) {
                    wx.showToast({
                        title: "提醒已取消，你可能会错过抢购哦～",
                        duration: 3000,
                        icon: "none"
                    })
                    item.notify = 0;
                } else {
                    wx.showToast({
                        title: "已设置开抢提醒开抢前3分钟自动提醒，请留意微信消息",
                        duration: 3000,
                        icon: "none"
                    })
                    item.notify = 1;
                }
                _self.setData({
                    coupon: item
                })
            }
        })
        //event.stopPro
    }
})