const app = getApp()
import {
    tracking
} from '../../../coupons/utils/track.js'
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../../coupons/utils/httpUtil.js';
Page({
    //页面变量
    data: {
        navigatorBrand: "conHide",
        scrollfixed: '',
        navigatorLetter: "conHide",
        typeCtriangleRotate: "rorate-top",
        integralCtriangleRotate: "rorate-top",
        collectCtriangleRotate: "rorate-top",
        typeName: "分类",
        integralName: "积分",
        collectName: "收藏",
        isFromShare: 'false',
        isMove: false,
        typeList: [],
        integralList: [{
            name: '从高到低',
            value: 2
        }, {
            name: '从低到高',
            value: 3
        }],
        collect: [{
            name: '从高到低',
            value: 1
        }, {
            name: '从低到高',
            value: 2
        }],
        keyAdmin: "",
        openid: "",
        buildId: "",
        industryId: "",
        integralType: "",
        collectType: "",
        integralNum: "",
        navigatorId: 1,
        isPush: true,
        couponList: [],
        pageNum: 1,
        pageSize: 10,
    },
    typeHandler: function() {
        tracking({
            event: '12',
            eventState: '分类'
        })
        var that = this;
        if (that.data.navigatorBrand == '') {
            that.navigatorHide();
            return;
        };
        this.setData({
            scrollfixed: "scroll-fixed"
        });
        this.setData({
            navigatorOld: ""
        });
        this.setData({
            navigatorLetter: "conHide"
        });
        this.setData({
            typeC: "navigator-name"
        });
        this.setData({
            integralC: ""
        });
        this.setData({
            collectC: ""
        });
        this.setData({
            typeCtriangleRotate: "rorate-bot"
        });
        this.setData({
            integralCtriangleRotate: "rorate-top"
        });
        this.setData({
            collectCtriangleRotate: "rorate-top"
        });
        this.setData({
            navigatorBrand: ""
        });
        this.setData({
            navigatorName: "全部分类"
        });
        this.setData({
            navigatorId: 1
        });
        this.setData({
            backNavigator: ""
        });
        this.setData({
            navList: that.data.typeList
        });
    },
    integralHandler: function() {
        tracking({
            event: '12',
            eventState: '积分'
        })
        var that = this;
        if (that.data.navigatorBrand == '') {
            that.navigatorHide();
            return;
        };
        this.setData({
            scrollfixed: "scroll-fixed"
        });
        this.setData({
            navigatorOld: ""
        });
        this.setData({
            navigatorLetter: "conHide"
        });
        this.setData({
            navigatorName: "默认"
        });
        this.setData({
            navigatorId: 2
        });
        this.setData({
            typeC: ""
        });
        this.setData({
            integralC: "navigator-name"
        });
        this.setData({
            collectC: ""
        });
        this.setData({
            typeCtriangleRotate: "rorate-top"
        });
        this.setData({
            integralCtriangleRotate: "rorate-bot"
        });
        this.setData({
            collectCtriangleRotate: "rorate-top"
        });
        this.setData({
            navigatorBrand: ""
        });
        this.setData({
            backNavigator: ""
        });
        this.setData({
            navList: that.data.integralList
        });
        this.setData({
            collectName: '收藏'
        });
        this.setData({
            collectType: ''
        });
    },
    collectHandler: function() {
        tracking({
            event: '12',
            eventState: '收藏'
        })
        var that = this;
        if (that.data.navigatorBrand == '') {
            that.navigatorHide();
            return;
        };
        this.setData({
            scrollfixed: "scroll-fixed"
        });
        this.setData({
            integralC: ""
        });
        this.setData({
            typeC: ""
        });
        this.setData({
            navigatorName: "默认"
        });
        this.setData({
            navigatorId: 3
        });
        this.setData({
            collectC: "navigator-name"
        });
        this.setData({
            typeCtriangleRotate: "rorate-top"
        });
        this.setData({
            integralCtriangleRotate: "rorate-top"
        });
        this.setData({
            collectCtriangleRotate: "rorate-bot"
        });
        this.setData({
            navigatorBrand: ""
        });
        this.setData({
            backNavigator: ""
        });
        this.setData({
            navigatorOld: ""
        });
        this.setData({
            navigatorLetter: "conHide"
        });
        this.setData({
            navList: that.data.collect
        });
        this.setData({
            integralName: '积分'
        });
        this.setData({
            integralType: ''
        });
    },
    navigatorHideName: function(e) {
        var that = this;
        that.navigatorHide();
        var name = e.currentTarget.dataset.text;
        var str = name.split('+');
        var val = str[1];
        console.log(555, str)
        if (str[0] == "" || str[0] == "1") {
            console.log(111, str)
            this.setData({
                typeName: val
            });
            that.setData({
                industryId: str[3]
            });
        } else if (str[0] == "" || str[0] == "2") {
            console.log(222, str)
            this.setData({
                integralName: val
            });
            that.setData({
                integralType: str[3]
            });
        } else {
            console.log(333, str)
            this.setData({
                collectName: val
            });
            that.setData({
                collectType: str[3]
            });
        }
        that.setData({
            bindCont: str[3]
        });
        that.setData({
            pageNum: 1
        });
        that.navigatorHide();
        that.getDataList();
    },
    navigatorHide: function() {
        this.setData({
            navigatorBrand: "conHide"
        });
        this.setData({
            scrollfixed: ""
        });
        this.setData({
            typeC: ""
        });
        this.setData({
            integralC: ""
        });
        this.setData({
            collectC: ""
        });
        this.setData({
            typeCtriangleRotate: "rorate-top"
        });
        this.setData({
            integralCtriangleRotate: "rorate-top"
        });
        this.setData({
            collectCtriangleRotate: "rorate-top"
        });
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
            eventState: '返回首页'
        })
        wx.switchTab({
            url: '/pages/index/index',
            success: function (res) {
            },
            fail: function (res) {
            }
        })
    },
    enterDetail: function(e) {
        tracking({
            event: '07',
            eventState: '积分商城详情页'
        })
        var that = this;
        var item = e.currentTarget.dataset.data;
        // var index = e.currentTarget.dataset.index;
        wx.navigateTo({
            url: '../detail/detail?portalId=' + app.globalData.tenantId + '&couponId=' + item.id +'&activityId=' +item.activityId
        });
    },
    enterMyCollect: function() {
        tracking({
            event: '07',
            eventState: '我的收藏'
        })
        wx.navigateTo({
            url: '../collect/collect'
        });
    },
    goHistory: function() {
        wx.navigateTo({
            url: '../history/history'
        });
        tracking({
            event: '12',
            eventState: '历史纪录'
        })
    },
    getItems: function(e) {
        var that = this;
        var name = e.currentTarget.dataset.text;
        var str = name.split('+');
        if (str[0] == "" || str[0] == "2") {
            var val = str[2];
            that.setData({
                integralName: val
            });
            that.setData({
                bindCont: str[3]
            });
            if (val == "默认") {
                val = "";
            }
            that.setData({
                integralType: str[3]
            });
            that.navigatorHide();
            that.setData({
                pageNum: 1
            });
            that.getDataList();
        } else if (str[0] == "" || str[0] == "3") {
            var val = str[2];
            that.setData({
                collectName: val
            });
            that.setData({
                bindCont: str[3]
            });
            if (val == "默认") {
                val = "";
            }
            that.setData({
                collectType: str[3]
            });
            that.navigatorHide();
            that.setData({
                pageNum: 1
            });
            that.getDataList();
        } else {
            var val = str[2];
            that.setData({
                bindCont: str[3]
            });
            this.setData({
                typeName: val
            });
            that.setData({
                pageNum: 1
            });
            that.setData({
                industryId: str[3]
            });
            that.navigatorHide();
            that.getDataList();
        }
    },
    onLoad: function (options) {
        this.setData({
            isFromShare: options.isFromShare || 'false',
        })
    },
    onShow: function() {
        var that = this;
        if (!wx.getStorageSync('member')) {
            wx.navigateTo({
                url: `${app.globalData.loginPath}?from=积分商城`
            })
            return;
        }
        var buildList = wx.getStorageSync('buildList');
        var keyAdmin = wx.getStorageSync('keyAdmin');
        var openId = wx.getStorageSync('openid');
        var buildid = buildList[0].buildIdStr;
        var tenantId = app.globalData.tenantId;
        that.setData({
            keyAdmin: keyAdmin
        });
        that.setData({
            buildId: buildid
        });
        that.setData({
            openid: openId
        });
        this.setData({
            showMyCollect: 'myCollection_center'
        })
        that.getIndustryList();
        that.getIntegralNum();
        if (that.data.isPush) {
            that.setData({
                isPush: false
            })
            that.getDataList();
        }
        wx.getSystemInfo({
            success: function(res) {
                var h = res.windowHeight - 112;
                that.setData({
                    hei: h
                });
                // that.setData({heibody:res.windowHeight});
                that.setData({
                    widthBody: res.windowWidth - 20
                });
            }
        });
        if (!wx.getStorageSync('isLoginSucc')) {
            this.setData({
                chanceNum: '-'
            });
        }
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },
    getIntegralNum: function() {
        var that = this;
        httpWithParameter({
            endPoint: requestEndPoints.integralNum,
            data: {
                portalId: app.globalData.tenantId,
                openId: that.data.openid,
                cid: wx.getStorageSync('member').cid
            },
            success(res) {
                if (res.data.status == 200) {
                    that.setData({
                        integralNum: res.data.data.balance
                    });
                } else {
                    that.setData({
                        integralNum: 0
                    });
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        })
    },
    getDataList: function(a) {
        var that = this;
        wx.showLoading({
            title: '加载中...',
        });
        //获取列表
        httpWithParameter({
            endPoint: requestEndPoints.couponList,
            data: {
                portalId: app.globalData.tenantId,
                openId: that.data.openid,
                industryId: that.data.industryId,
                integralType: that.data.integralType,
                collectionType: that.data.collectType,
                page: that.data.pageNum,
                pageSize: 10,
                cid: wx.getStorageSync('member').cid
            },
            success(res) {
                if (res.data.status == 200) {
                    if (that.data.pageNum == 1) {
                        that.setData({
                            couponList: []
                        })
                    }
                    that.setData({
                        total: res.data.data.total
                    })
                    let couponList = res.data.data.list;
                    if (that.data.couponList.length == that.data.total) {
                        // return;
                    } else {
                        that.setData({
                            couponList: that.data.couponList.concat(couponList)
                        });
                    }
                    wx.hideLoading();
                } else {
                    that.setData({
                        couponList: []
                    });
                    wx.hideLoading();
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        })
    },
    onReachBottom: function() {
        var that = this;
        if (that.data.pageNum >= Math.ceil(that.data.total / 10)) {
            return;
        }
        that.getDataList(++that.data.pageNum);
    },
    getIndustryList: function() {
        var that = this;
        // 获取业态列表
        httpWithParameter({
            endPoint: requestEndPoints.industryList,
            data: {
                portalId: app.globalData.tenantId,
            },
            success(res) {
                if (res.data.status == 200) {
                    let industryList = res.data.data.list.map(item => {
                        return {
                            name: item.name,
                            value: item.id
                        }
                    })
                    that.setData({
                        typeList: industryList
                    });
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    })
                }
            }
        })
    },
    onShareAppMessage(res) {
        tracking({
            event: '02',
            eventState: '转发'
        })
        return {
            title: '积分商城',
            path: '/rtmap/integral_mall/pages/index/index?isFromShare=true',
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

})