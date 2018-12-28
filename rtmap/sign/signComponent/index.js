/*
 * @Author: Suoping
 * @Date:   2018-06-20 16:51:28
 * @Last Modified by:   Suoping
 * @Last Modified time: 2018-06-25 10:50:48
 */

/**
 * 使用说明:
 * 1: 在父页面的json配置文件中使用
 * "usingComponents": {
		"sign-in": "../../comp/signIn/index"
	}
	标签来启用本组件;
	2: 在父页面的wxml中使用<sign-in id="sign" />标签来加载组件; 其中标签支持banner/continuity/buttonNormal/buttonDisabled/rules属性以及bindsign事件;
	3: 在父页面js中使用this.selectComponent('#sign')方法选中组件,调用组件的draw([日期], [签到日期])方法初始化日历, 例如:draw('2018-06-20'), 注意月份必须为双位数,不足两位需要补0,否则IOS端创建日期会出错;
	4: 如果调用draw只传入日期参数, 则后面可以使用sign(签到日期[数组])来批量签到(bindsign事件触发后请在父级使用sign方法来签到当前日期, 组件本身不会自动签到当前日期);
 */
import { config } from "../../../utils/config.js"
var burialPoint = require('../../coupons/utils/track.js')
var url = config.BaseUrl;
var app = getApp()
var isAddShow = false
Component({
    properties: {
        // banner: {
        // 	type: String,
        // 	value: '/images/banner.jpg',
        // },
        // continuity: {
        // 	type: Number,
        // 	value: 0,
        // },
        // buttonNormal: {
        // 	type: String,
        // 	value: '签到领积分',
        // },
        // buttonDisabled: {
        // 	type: String,
        // 	value: '今日已签到',
        // },
        // rules: {
        // 	type: Array,
        // 	value: [],
        // },
        // detail: {            
        //   type: Object,
        // },
    },
    data: {
        today: null,
        weekDays: [],
        todayMonth: '',
        todayDate: '',
        todaySignIn: '',
        banner: '/rtmap/sign/images/banner.jpg',
        continuity: 0,
        buttonNormal: '签到领积分',
        buttonDisabled: '今日已签到',
        rules: '',
        detail: {},
        isShow: false,
        signContent: '',
        isSignIn: true,
    },
    attached() {
        Date.prototype.getDays = function() {
            return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
        }
        Date.prototype.getFirstWeekDay = function() {
            return new Date(this.getFullYear(), this.getMonth(), 1).getDay();
        }
        this.draw(this.formatTime())
        this.signHistory()
        this.getRule()
    },
    methods: {
        draw(date, actives) {
            if (date) {
                date = String(date).match(/\d+/gi).map(item => (item > 9 ? item : '0' + item)).join('-');
                this.setData({
                    today: new Date(date)
                })
                if (isNaN(this.data.today.getFullYear())) {
                    this.setData({
                        today: new Date()
                    })
                }
            } else {
                this.setData({
                    today: new Date()
                })
            }
            if (this.data.today) {
                this.setData({
                    todayMonth: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'][this.data.today.getMonth()] + '月',
                    todayDate: this.data.today.getDate(),
                })
            }

            let aPrevDate = new Date(this.data.today.getFullYear(), this.data.today.getMonth() - 1);
            let aNextDate = new Date(this.data.today.getFullYear(), this.data.today.getMonth() + 1);
            let aFirstDay = this.data.today.getFirstWeekDay();
            let aMaxDays = this.data.today.getDays();
            let aMax = Math.ceil((aMaxDays + aFirstDay) / 7) * 7; //动态根据日期显示4行或5行;
            let aDay = []; //预处理数组, 后面再解构到data中的变量以节省界面刷新次数;
            for (let i = 0; i < aMax; i++) {
                let aItem = {
                    date: 0,
                    month: 0,
                    year: 0,
                    signIn: false,
                    disabled: true,
                }
                if (i < aFirstDay) {
                    //上一个月份
                    aItem.date = aPrevDate.getDays() - aFirstDay + i + 1;
                    aItem.month = aPrevDate.getMonth();
                    aItem.year = aPrevDate.getFullYear();
                } else if (i >= aFirstDay && i < Number(aFirstDay + aMaxDays)) {
                    //当前月份的天数正常添加;
                    aItem.date = i - aFirstDay + 1;
                    aItem.month = this.data.today.getMonth();
                    aItem.year = this.data.today.getFullYear();
                    aItem.disabled = false;
                } else {
                    //下一个月份;
                    aItem.date = i - Number(aFirstDay + aMaxDays) + 1;
                    aItem.month = aNextDate.getMonth();
                    aItem.year = aNextDate.getFullYear();
                }
                aDay.push(aItem);
            }
            let aWeekDays = [];
            while (aDay.length) {
                aWeekDays.push(aDay.splice(0, 7));
            }
            this.setData({
                weekDays: aWeekDays,
            })
            if (actives) {
                let aType = Object.prototype.toString.call(actives);
                let aActives = aType.indexOf('Array') >= 0 ? actives : [actives];
                this.sign(...aActives);
            }
        },
        sign(...dates) {
            let aType = Object.prototype.toString.call(dates);

            let aDates = [];
            let aDays = this.data.weekDays;
            if (aType.indexOf('Array') >= 0) {

                function flattenMd(arr) {
                    var result = []

                    function flatten(arr) {
                        for (var i = 0; i < arr.length; i++) {
                            if (Array.isArray(arr[i])) {
                                flatten(arr[i]);
                            } else {
                                result.push(arr[i]);
                            }
                        }
                    }
                    flatten(arr);
                    return result;
                }
                aDates = flattenMd(dates);
            } else {
                aDates = [dates];
            }

            let aActive = function() {
                let bDate = aDates.shift();
                let bDay = null;
                if (bDate) {
                    try {
                        bDate = String(bDate).match(/\d+/gi).map(item => (Number(item) > 9 ? item : '0' + Number(item))).join('-');
                        bDate = new Date(bDate); //转换为时间;
                        for (let i = 0; i < aDays.length; i++) {
                            let findDay = false;
                            for (let j = 0; j < aDays[i].length; j++) {
                                let item = aDays[i][j];
                                if (item.year == bDate.getFullYear() && item.month == bDate.getMonth() && item.date == bDate.getDate()) {
                                    this.setData({
                                        ['weekDays[' + i + '][' + j + '].signIn']: true,
                                    })
                                    findDay = true;
                                    break;
                                }
                            }
                            if (findDay) break;
                        }
                        this._updateTodaySign();
                    } catch (err) {}
                };
                if (aDates.length) {
                    setTimeout(aActive.bind(this), 300);
                }
            }
            aActive.call(this);
        },
        _updateTodaySign() {
            if (this.data.today) {
                let aSign = false;
                for (let si = 0; si < this.data.weekDays.length; si++) {
                    if (this.data.weekDays[si].find(item => item.year == this.data.today.getFullYear() && item.month == this.data.today.getMonth() && item.date == this.data.today.getDate() && item.signIn)) {
                        aSign = true;
                        break;
                    }
                }
                this.setData({
                    todaySignIn: aSign,
                })
            }
        },
        // signInHandler(){
        //   if (this.todaySignIn) return;
        // 	this.triggerEvent('sign');
        // },

        formatTime() {
            var da = new Date();
            var year = da.getFullYear();
            var month = da.getMonth() + 1;
            var date = da.getDate();
            return [year, month, date].map((n) => {
                n = n.toString()
                return n[1] ? n : '0' + n
            }).join('-')
        },

        signIn() {
            if (this.data.todaySignIn) return;
            if (!this.data.isSignIn) {
                return
            }
            this.setData({
                isSignIn: false,
            })
            wx.showLoading({
                title: '正在签到...',
                mask: true
            })
            var parameter = {
                'openid': wx.getStorageSync('openid'),
                'marketId': app.globalData.tenantId,
                'cardNo': wx.getStorageSync('member') ? wx.getStorageSync('member').cid : '',
                mobile: wx.getStorageSync('mobile'),
            };
            console.log(parameter)
            wx.Request({
              url: url + 'cmp/signRecord',
                data: parameter,
                method: 'POST',
                header: {
                    "Content-Type": "application/json"
                },
                success: (data) => {
                  burialPoint.tracking({
                    event: '12',
                    eventState: '签到成功'
                  })
                    wx.hideLoading()
                    let dataDetail = data.data.data
                    this.setData({
                        isSignIn: true,
                    })
                    if (data.data.code == 200) {
                        this.setData({
                            isShow: true,
                            detail: dataDetail,
                            signContent: dataDetail.today,
                        })
                        this.draw(this.formatTime(), this.formatTime())
                        this.signHistory()
                    } else {
                        wx.showToast({
                            title: data.data.msg,
                            icon: 'none',
                            duration: 1000,
                            mask: true,
                            success: function(res) {},
                            fail: function(res) {},
                            complete: function(res) {},
                        })
                    }
                },
                fail: function(error) {
                  burialPoint.tracking({
                    event: '12',
                    eventState: '签到失败'
                  })
                    this.setData({
                        isSignIn: true,
                    })
                    wx.hideLoading()
                },
            })
        },

        signHistory() {
            var parameter = {
                'openid': wx.getStorageSync('openid'),
                'marketId': app.globalData.tenantId,
            };
            wx.Request({
              url: url + 'cmp/signRecord/get',
                data: parameter,
                method: 'GET',
                header: {
                    "Content-Type": "application/json"
                },
                success: (data) => {
                    let dataHistory = data.data.data
                    if (data.data.code == 200) {
                        if (dataHistory.addSignDays)
                            this.setData({
                                continuity: dataHistory.addSignDays
                            })
                        this.sign(dataHistory.days)
                    }
                },
                fail: function(error) {
                    console.log(error)
                },
            })
        },


        getRule() {
            var parameter = {
                'marketId': app.globalData.tenantId,
            };
            wx.Request({
              url: url + 'cmp/signRecord/getRule',
                data: parameter,
                method: 'GET',
                header: {
                    "Content-Type": "application/json"
                },
                success: (data) => {
                    let dataRule = data.data.data

                    if (data.data.code == 200) {
                        if (dataRule.ruleDesc)
                            this.setData({
                                rules: dataRule.ruleDesc,
                            })
                    }
                },
                fail: function(error) {
                    console.log(error)
                },
            })
        },

        _cancelEvent() {
            if (isAddShow) {
                this.setData({
                    isShow: false,
                })
                isAddShow = false
            } else if (this.data.detail.today == this.data.signContent && this.data.detail.serialSignDays != '' && this.data.signContent != this.data.detail.serialSignDays) {
                this.setData({
                    isShow: false,
                })
                setTimeout(() => {
                    this.setData({
                        isShow: true,
                        signContent: this.data.detail.serialSignDays,
                    })
                }, 200)
            } else if ((this.data.detail.today == this.data.signContent || this.data.detail.serialSignDays == this.data.signContent) && this.data.detail.addSignDays != '' && this.data.signContent != this.data.detail.addSignDays) {
                isAddShow = true
                this.setData({
                    isShow: false,
                })
                setTimeout(() => {
                    this.setData({
                        isShow: true,
                        signContent: this.data.detail.addSignDays,
                    })
                }, 200)
            } else {
                isAddShow = true
            }
        }
    }
})