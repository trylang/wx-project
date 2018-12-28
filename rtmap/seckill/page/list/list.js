//index.js
//获取应用实例
import {
    get,
    post,
    paths
} from '../../http.js';
import {
    tracking
} from '../../../coupons/utils/track.js'

const app = getApp();
const tenantId = app.globalData.tenantId;
//const activityId = app.globalData.seckillActivityId;
const tenantType = app.globalData.tenantType;
const pageSize = 10;
// const openid = wx.getStorageSync('openid');
// const cid = wx.getStorageSync('member').cid;
var timecount = null;
Page({
    data: {
        current: "",
        time: 0,
        acList: [],
        paging: [],
        hour: 0,
        killspecialgoods: [],
        killgoods: [],
        now: ''
    },
    onPullDownRefresh() {
        var _self = this;
        this.setData({
            killspecialgoods: [],
            killgoods: [] //new Array(3)
        })
        this.getTime(function () {
            _self.checkLoadGoods(_self.data.current);
        });
        setTimeout(function () {
            wx.stopPullDownRefresh()
        }, 300);
    },
    onReachBottom() {
        this.loadGoods(this.data.current);
    },
    //事件处理函数
    onLoad: function () {
        var _self = this;
        wx.getSystemInfo({
            success: function (res) {
                _self.setData({
                    windowHeight: res.windowHeight,
                    windowWidth: res.windowWidth
                })
            }
        });
        this.setData({
            current: ""
        })
        this.getMemberList();
        this.getTime();
        get(paths.getActivityId, {
        }, function (res) {
            if (res.data.data != _self.data.activityId) {
                _self.setData({
                    activityId: res.data.data
                })
                tracking({
                    event: '07',
                    activityId: res.data.data,
                    eventState: '进入秒杀列表页'
                })
            }
        })
    },
    getMemberList() {
        var _self = this;
        get(paths.getCardList, {
            tenantType: tenantType
        }, function (res) {
            var list = {}
            if (res.data.data && res.data.data.forEach) {
                res.data.data.forEach(item => {
                    list[item.id] = item.name
                })
                _self.setData({
                    memberlist: list
                })
            }
        }, function () { }, true)
    },
    onShow() {
        var _self = this;
        if (this.data.activityId) {
            tracking({
                event: '07',
                activityId: this.data.activityId,
                eventState: '进入秒杀列表页'
            })
        }
    },
    startTimeCount(time) {
        var _self = this;
        if (timecount) {
            clearInterval(timecount);
        }
        this.setData({
            now: time
        })
        this.checkTime()
        timecount = setInterval(function () {
            var now = _self.data.now + 1000;
            _self.setData({
                now: now
            })
            _self.checkTime()
        }, 1000);
    },
    checkTime() {
        var _self = this;
        var now = new Date(this.data.now);
        var changeday = false;
        var nowmonth = now.getMonth() + 1;
        var nowday = now.getDate();
        var nowh = now.getHours();
        var nowm = now.getMinutes();
        if (nowh == 0 && nowm < 1) {
            changeday = true;
        }
        if (this.data.acList && this.data.acList.length > 0) {
            var haschange = false;              //状态变化
            var nostarthead = false;           //找出疯抢中的活动
            var acList = this.data.acList.slice();
            acList.forEach(function (item, index) {
                var starttime = new Date(item.startTime);
                if (item.startTime > _self.data.now) {              //未开始
                    if (item.hasStart == true) {
                        haschange = true;
                    }
                    item.hasStart = false;
                    if (!nostarthead) {
                        nostarthead = true;
                        var current = "";
                        if (index > 0) {
                            current = index - 1;
                            acList[current].isCrazy = true;
                            if (index > 1 && acList[index - 2] && acList[index - 2].isCrazy) {
                                acList[index - 2].isCrazy = false;
                            }
                        } else {
                            current = 0;
                        }
                        let res = wx.getSystemInfoSync()
                        var scrollleft = (current - 2) * res.windowWidth / 5;
                        if (_self.data.current === "") {
                            _self.setData({
                                current: current,
                                scrollleft: scrollleft > 0 ? scrollleft : 0
                            })
                            _self.checkLoadGoods(current);
                        }
                    } else {

                    }
                } else {
                    if (item.hasStart == false) {
                        haschange = true;
                    }
                    item.hasStart = true;
                }
                if (!item.startmonth && !item.startday && !item.starth && !item.startm) {
                    item.startmonth = starttime.getMonth() + 1;
                    item.startday = starttime.getDate();
                    item.starth = starttime.getHours();
                    item.startm = starttime.getMinutes();
                    item.showtime = (item.starth < 10 ? '0' + item.starth : item.starth) + ':' + (item.startm < 10 ? '0' + item.startm : item.startm);
                    item.showdate = (item.startmonth < 10 ? '0' + item.startmonth : item.startmonth) + '.' + (item.startday < 10 ? '0' + item.startday : item.startday);
                }
                if (changeday || item.istoday === undefined) {
                    item.istoday = item.startday == nowday && item.startmonth == nowmonth;
                    haschange = true;
                }
            })
            if (!nostarthead) {
                var l = acList.length;
                var current = l - 1;
                acList[current].isCrazy = true;
                if (l > 1 && acList[l - 2] && acList[l - 2].isCrazy) {
                    acList[l - 2].isCrazy = false;
                }
                var scrollleft = (current - 2) * 150;
                if (_self.data.current === "") {
                    _self.setData({
                        current: current,
                        scrollleft: scrollleft > 0 ? scrollleft : 0
                    })
                    _self.checkLoadGoods(current);
                }
            }
            if (_self.data.current === "") {
                _self.setData({
                    current: 0
                })
                _self.checkLoadGoods(0);
            }
            if (haschange) {
                this.setData({
                    acList: acList
                })
            }
        }
    },
    getTime: function (callback) {
        var _self = this;
        get(paths.getTime, {}, function (res) {
            _self.startTimeCount(res.data.data);
            get(paths.getFieldList, {
                //activityId:activityId
            }, function (res) {
                var paging = [];
                if (res.data.data && res.data.data.forEach) {
                    res.data.data.forEach(res => {
                        paging.push({
                            page: 0,
                            pageSize: pageSize,
                            hasnext: true
                        })
                    })
                    _self.setData({
                        acList: res.data.data,
                        paging: paging
                    })
                    _self.checkTime();
                    if (typeof callback == "function") {
                        callback();
                    }
                } else {
                    _self.setData({
                        acList: [],
                        paging: paging
                    })
                }
            })
        })
    },
    switchNav: function (e) {
        var _self = this;
        var data = e.currentTarget.dataset;
        //var index = e.currentTarget.dataset.index;
        this.setData({
            current: data.index
        })
        this.checkLoadGoods(data.index);
    },
    checkLoadGoods: function (n) {
        // if(!n){
        //     return;
        // }
        if (!this.data.killgoods[n] || !this.data.killgoods[n].length || this.data.killgoods[n].length == 0) {
            this.loadGoods(n);
        }
        if (!this.data.killspecialgoods[n] || !this.data.killspecialgoods[n].length || this.data.killspecialgoods[n].length == 0) {
            this.loadSpecialGoods(n);
        }
    },
    loadGoods: function (n) {
        var _self = this;
        var paging = _self.data.paging;
        var paginginfo = paging[n];
        if (!paginginfo.hasnext || paginginfo.isloaded) {
            return false;
        }
        paging[n].isloaded = true;
        _self.setData({
            paging: paging
        })
        get(paths.getCouponList, {
            //activityId:activityId,
            fieldId: this.data.acList[n].id,
            page: paginginfo.page + 1,
            pageSize: paginginfo.pageSize
        }, function (res) {
            var killgoods = _self.data.killgoods;
            var paging = _self.data.paging;
            if (res.data && res.data.data) {
                var data = res.data.data;
                if (Object.prototype.toString.call(data.list) !== "[object Array]") {
                    return;
                }
                data.list.forEach(item => {
                    item.sellscale = Math.floor(item.count / item.totalCount * 100);
                })
                if (paginginfo.page == 0) {
                    if (_self.data.killspecialgoods[n] && _self.data.killspecialgoods[n].length > 0) {
                        killgoods[n] = _self.concatgoods(data.list, _self.data.killspecialgoods[n]);
                    } else {
                        killgoods[n] = data.list;
                    }
                } else {
                    killgoods[n] = killgoods[n].concat(data.list);
                }
            } else {
            }
            paging[n].page = data.pageNum;
            if (data.pageNum * data.pageSize >= data.total) {
                paging[n].hasnext = false;
            } else {
                paging[n].hasnext = true;
            }
            paging[n].isloaded = false;
            _self.setData({
                killgoods: killgoods,
                paging: paging
            })
        })
    },
    loadSpecialGoods(n) {
        var _self = this;
        get(paths.getSpecialList, {
            //activityId:activityId,
            fieldId: this.data.acList[n].id
        }, function (res) {
            var killspecialgoods = _self.data.killspecialgoods;
            var killgoods = _self.data.killgoods;
            killspecialgoods[n] = res.data.data;
            var obj = {
                killspecialgoods: killspecialgoods
            };
            if (Object.prototype.toString.call(killgoods[n]) == "[object Array]") { //killgoods[n].length>0
                killgoods[n] = _self.concatgoods(killgoods[n], res.data.data);
            }
            obj.killgoods = killgoods;
            _self.setData(obj);
        })
    },
    concatgoods(killgoods, killspecialgoods) {
        var slength = killspecialgoods.length;
        var length = killgoods.length;
        var space = Math.floor(length / slength) + 1;
        space = space > 4 ? 4 : space;
        var result = killgoods.slice();
        var pc = 0;
        killspecialgoods.forEach(function (item, index) {
            pc = space * index;
            result.splice(pc, 0, killspecialgoods[index]);
        })
        return result;
    },
    // switchTab: function(e) {
    //     this.setData({
    //         current: e.detail.current
    //     })
    //     this.loadGoods(e.detail.current)
    // },
    stopTouchMove: function (e) {
        //console.log("stopTouchMove",e,e.currentTarget.dataset);
        return false;
    },
    onShareAppMessage(res) {
        //埋点数据
        tracking({
            event: '02',
            eventState: '转发'
        })
        return {
            title: "一块钱能买啥？戳进来看看！",
            path: '/rtmap/seckill/page/list/list',
            imageUrl: "../../images/share.jpeg",
            success: res => {
                wx.showToast({
                    title: '分享成功',
                    icon: 'success',
                    duration: 3000
                })
                //埋点数据
                /*tracking({
                    event: '01',
                    eventState: '分享成功'
                })*/
            },
            error: res => {
                wx.showToast({
                    title: '分享失败',
                    icon: 'error',
                    duration: 3000
                })
                /*tracking({
                    event: '01',
                    eventState: '分享失败'
                })*/
            },
        }
    },
    switchAlert(event) {
        const cid = wx.getStorageSync('member').cid;
        if (!cid) {
            wx.navigateTo({
                url: `${app.globalData.loginPath}?sourceid=${this.data.activityId}&from=秒杀券列表`
            })
            return;
        }
        if (this.data.acList[this.data.current].startTime - this.data.now < 180000) {
            wx.showToast({
                title: "抢购即将开始",
                duration: 3000,
                icon: "none"
            })
        }
        var _self = this, url;
        var target = event.currentTarget;
        var index = target.dataset.index;
        var ind = target.dataset.ind;
        var killgoods = this.data.killgoods;
        var item = killgoods[index][ind];
        var fieldId = this.data.acList[index].id;
        var formId = event.detail.formId;
        var obj = {
            //activityId:activityId,
            batchItemId: item.id,
            fieldId: fieldId,
            tenantType: tenantType,
            name: item.mainInfo
        }
        if (item.notify) {
            url = paths.notifyCancel
        } else {
            url = paths.notifyAdd
            obj.formId = formId
        }
        get(url, obj, function (res) {
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
                        title: "已设置开抢提醒\n开抢前3分钟自动提醒，请留意微信消息",
                        duration: 3000,
                        icon: "none"
                    })
                    item.notify = 1;
                }
                _self.setData({
                    killgoods: killgoods
                })
            }
        })
        //event.stopPro
    },
    submitInfo(e) {
        console.log(e);
    },
    empty() {

    }
    // upperHold(){
    //     console.log("e")
    //     wx.startPullDownRefresh({})
    // }
    // stopBindTouchMove:function(e){
    //   console.log("stopBindTouchMove",e,e.currentTarget.dataset);    
    // }
})