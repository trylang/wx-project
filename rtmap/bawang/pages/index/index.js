//index.js
//获取应用实例
const app = getApp()
import api from './modules/api';
var burialPoint = require('../../../coupons/utils/track.js')
var textLenth = ''
Page({
    data: {
        id: null,
        activityId: null,
        marketId: null,
        openid: null,
        avatar: null,
        nickname: null,
        mobile: null,
        title: null,
        couponList: [],
        couponDefaultCover: null,
        couponDefaultIndex: 0,
        cardList: [],
        exchangeMax: '-',
        drawMax: '-',
        ifRegist: false,
        ifShareEnabled: false,
        rule: '',
        shareList: [],
        swiperHeight: [390],
        inputPhone: '',
        inputCode: '',
        getCodeAtTime: 0,
        getCodeCountDown: 0,
        getExchangeData: null,
        getDrawData: null,
        ruleHidden: true,
        drawHidden: true,
        exchangeHidden: true,
        registHidden: true,
        getCouponList: [],
        payResult: null,
        cardId: -1,
        key: '',
        cardKey: '',
        shareType: 0,
        isExchange: false,
        isFromShare: 'false',
        isMove: false,
    },

    onShareAppMessage(res) {

        if (this.data.shareType == 1) {
            this.setData({
                shareType: 0
            })
            this.dialog.hideDialog()

            api.giveCard({
                success: res => {
                    console.log('赠送卡片', res)
                },
                complete: res => {
                    this.getMyCard();
                    console.log(res)
                }
            })
            return {
                title: `你有1张卡片可以领取`,
                imageUrl: `${api.share.imgUrl}`,
                path: `${api.share.page}?cardkey=${this.data.cardKey}&from=${this.data.openid}&aid=${this.data.id}` + "&isFromShare=true",
                success: res => {
                    burialPoint.tracking({
                        event: '02',
                        activityId: api.activityId,
                        eventState: '转发成功'
                    })

                },
                error: res => {
                    burialPoint.tracking({
                        event: '02',
                        activityId: api.activityId,
                        eventState: '转发失败'
                    })
                },
            }
        }
        console.log(`${api.share.page}?from= ${this.data.openid} &aid=${this.data.id}` + "&isFromShare=true")
        if (this.data.shareType == 0) {
            api.shareCompletedSelf({
                success: res => {
                    this.getMyCard();
                }
            })
            return {
                title: `${api.share.title}`,
                imageUrl: `${api.share.imgUrl}`,
                path: `${api.share.page}?from=${this.data.openid}&aid=${this.data.id}` + "&isFromShare=true",
                success: res => {
                    burialPoint.tracking({
                        event: '02',
                        activityId: api.activityId,
                        eventState: '转发成功'
                    })
                },
                error: res => {
                    burialPoint.tracking({
                        event: '02',
                        activityId: api.activityId,
                        eventState: '转发失败'
                    })
                },
            }
        }
    },

    onPullDownRefresh() {
        if (this.data.id && this.data.openid) {
            //api.toast.loading();
            this.homeRefreshHandler();
            setTimeout(() => {
                wx.stopPullDownRefresh();
            }, 1500);
        }
    },
    onReachBottom() {
        if (this.data.id && this.data.openid) {
            //api.toast.loading();
            this.homeRefreshHandler();
        }
    },

    onLoad(options) {
        // console.log(options.cardKey)
        this.setData({
            isFromShare: options.isFromShare || 'false',
            isLoginSucc: wx.getStorageSync('isLoginSucc'),
        });

        this.dialog = this.selectComponent('#dialog')
        console.log('入参', options)
        wx.hideShareMenu();
        if (options.from) {
            api.share.openid = options.from;
        }
        if (options.aid) {
            api.share.aid = options.aid;
        }
        api.init(this);
        if (options.from && options.aid) {
            if (options.cardkey) {
                this.setData({
                    key: options.cardkey,
                });
                this.getLogin()
            } else
                this.getUserInfo();
        } else {
            this.getLogin()
        }
        if (options.openid) {
            this.setData({
                openid: options.openid,
            });
            api.init(this);
            this.getLogin()
            //测试分支;
            return;
        }
    },

    onShow() {
        this.getRegistStatus();
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
    getLogin() {
        wx.login({
            success: res => {
                if (res.code) {
                    api.toast.hide();
                    api.getOpenId({
                        code: res.code,
                        success: res => {
                            this.setData({
                                openid: res.data.openid,
                            });
                            this.homeStartHandler();
                        },
                        error: res => {
                            this.getLogin();
                        }
                    });
                } else {
                    //请求失败res.errMsg;
                    api.modal.alert({
                        title: '失败',
                        content: '获取您的个人帐号失败, 请重试!',
                        success: res => {
                            api.toast.loading();
                            setTimeout(this.getLogin, 700);
                        }
                    })
                }
            }
        })
    },

    getUserInfo({
        success
    } = {}) {
        console.log("userInfo", wx.getStorageSync('userInfo'))
        if (wx.getStorageSync('userInfo')) {
            this.setData({
                avatar: wx.getStorageSync('userInfo').avatarUrl,
                nickname: wx.getStorageSync('userInfo').nickName,
            })
            this.getLogin()
            return
        }
        this.setData({
            payResult: {
                content: '报歉, 请授权后使用本页面功能!',
                rightText: '确认授权',
                type: 3,
            },
        })
        this.dialog.showDialog()
    },

    onUserInfoClick(res) {
        console.log(res)
        let userInfo = res.detail.res
        if (userInfo) {
            app.globalData.WxUserInfo = userInfo;
            wx.setStorageSync('userInfo', userInfo);
            this.setData({
                avatar: userInfo.avatarUrl,
                nickname: userInfo.nickName,
            })
        }
        this.getLogin()
        this.dialog.hideDialog()
    },
    walletHandler() {
        if (!this.data.ifRegist) {
            this.registHanler()
            return
        }
        wx.navigateTo({
            url: `./wallet/index`,
            success: function (res) {
                burialPoint.tracking({
                    event: '07',
                    activityId: api.activityId,
                    eventState: '跳转成功'
                })
            },
            fail: (res) => {
                burialPoint.tracking({
                    event: '07',
                    activityId: api.activityId,
                    eventState: '跳转失败'
                })
            }
        })
    },
    ruleHandler() {
        this.setData({
            ruleHidden: !this.data.ruleHidden,
        })
    },
    registHanler() {
        console.log(this.data.ifRegist)
        if (!this.data.ifRegist) {
            wx.navigateTo({
                url: app.globalData.loginPath + '?sourceid=' + api.activityId,
                success: function (res) {
                    burialPoint.tracking({
                        event: '07',
                        activityId: api.activityId,
                        eventState: '跳转成功'
                    })
                },
                fail: function (res) {
                    burialPoint.tracking({
                        event: '07',
                        activityId: api.activityId,
                        eventState: '跳转失败'
                    })
                },
                complete: function (res) { },
            })
        }

        // this.setData({
        // 	inputPhone: '',
        // 	inputCode: '',
        // 	getCodeAtTime: null,
        // 	getCodeCountDown: 0,
        // 	registHidden: !this.data.registHidden,
        // })
    },
    bindPhoneHandler(e) {
        this.setData({
            inputPhone: e.detail.value,
        })
    },
    bindCodeHandler(e) {
        this.setData({
            inputCode: e.detail.value,
        })
    },
    sendCodeHandler() {
        let aTime = new Date().getTime();
        let aMax = 60;
        if (this.data.getCodeAtTime && this.data.getCodeAtTime > 0) {
            let aCount = aMax - Math.round((aTime - this.data.getCodeAtTime) * 0.001);
            if (aCount < 0) {
                this.setData({
                    getCodeAtTime: null,
                    getCodeCountDown: 0,
                })
            } else {
                this.setData({
                    getCodeCountDown: aCount,
                })
                setTimeout(this.sendCodeHandler, 300);
            }
            return;
        }
        // api.sendCode({
        //     success: res => {
        //         this.setData({
        //             getCodeAtTime: aTime,
        //             getCodeCountDown: aMax,
        //         })
        //         setTimeout(this.sendCodeHandler, 300);
        //     }
        // })
    },

    homeRefreshHandler() {
        if (this.data.id) {
            this.getRegistStatus();
            this.getBanner();
            this.getMyCard();
            this.getShareList();
            return;
        }
        api.getHomePage({
            success: res => {
                if (res.code != 200 || !res.data || !res.data.id || !res.data.activityId || !res.data.marketId) {
                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 1000)
                }
                if (!res.data) {
                    api.toast.error('读取活动失败!');
                    return false
                }
                if (!res.data.id) {
                    api.toast.error('找不到活动ID!');
                    return false
                }
                if (!res.data.activityId) {
                    api.toast.error('没有营销活动!');
                    return false
                }
                if (!res.data.marketId) {
                    api.toast.error('没有绑定商场!');
                    return false
                }
                api.activityId = res.data.activityId
                this.setData({
                    id: res.data.id,
                    activityId: res.data.activityId,
                    marketId: res.data.marketId,
                    title: res.data.name,
                    rule: res.data.rule,
                    couponDefaultCover: res.data.indexImg,
                    ifShareEnabled: true,
                })

                wx.showShareMenu();
                wx.setNavigationBarTitle({
                    title: this.data.title,
                })

                this.getRegistStatus();
                this.getBanner();
                this.getMyCard();
                this.getShareList();
            },
            fail: (res) => {
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1,
                    })
                }, 1000)
                api.activityId == ''
            }
        })
    },
    homeStartHandler() {
        api.data = this.data; //建立快捷指向;
        api.getHomePage({
            success: res => {
                if (res.code != 200 || !res.data || !res.data.id || !res.data.activityId || !res.data.marketId) {
                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 1000)
                }
                if (!res.data) {
                    api.toast.error('读取活动失败!');
                    return false;
                }
                if (!res.data.id) {
                    api.toast.error('找不到活动ID!');
                    return false;
                }
                if (!res.data.activityId) {
                    api.toast.error('没有营销活动!');
                    return false;
                }
                if (!res.data.marketId) {
                    api.toast.error('没有绑定商场!');
                    return false;
                }
                api.activityId = res.data.activityId
                burialPoint.tracking({
                    event: '06',
                    activityId: api.activityId,
                    eventState: '进入成功'
                })
                this.setData({
                    id: res.data.id,
                    activityId: res.data.activityId,
                    marketId: res.data.marketId,
                    title: res.data.name,
                    rule: res.data.rule,
                    couponDefaultCover: res.data.indexImg,
                    ifShareEnabled: true,
                })
                if (api.share.openid && api.share.aid) {
                    //给主分享人增加抽卡次数;
                    api.shareCompleted({
                        success: res => {
                            this.getMyCard();
                        }
                    });
                }
                //获得赠送卡片
                if (this.data.key)
                    api.getGiveCard({
                        success: res => {
                            console.log('获取到好友赠送卡片', res)
                            this.setData({
                                payResult: {
                                    content: '恭喜获取好友赠送的卡片',
                                    rightText: '我知道啦',
                                    type: 1,
                                    card: res.data
                                },
                            })
                            this.dialog.showDialog()
                            this.getMyCard()
                        },
                        error: (res) => {
                            console.log('卡片已领取', res)
                            this.setData({
                                payResult: {
                                    content: res.msg,
                                    rightText: '我知道啦',
                                    type: 2,
                                },
                            })
                            this.dialog.showDialog()
                            this.getMyCard()
                        },
                        complete: (res) => {
                            this.setData({
                                key: '',
                            })
                        }
                    })

                wx.showShareMenu();
                wx.setNavigationBarTitle({
                    title: this.data.title,
                })

                api.loginAtFirst({
                    //登录增加抽卡次数后无论成功与否都需要刷新卡片和可抽卡次数;
                    success: res => {
                        this.getMyCard();
                    },
                    error: res => {
                        this.getMyCard();
                    }
                }); //每天首次登录增加抽卡次数;

                this.getRegistStatus();
                this.getBanner();
                this.getMyCard();
                this.getShareList();
                this.getCouponMemList();
                this.getSharePei();
            },
            error: res => {

                api.activityId == ''
                api.toast.error('没有开启活动!')
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1,
                    })
                }, 1000)
            },
        })
    },
    getRegistStatus() {
        if (!wx.getStorageSync('isLoginSucc')) return;
        api.checkIfRegist({
            success: res => {
                this.setData({
                    ifRegist: true,
                })
            },
            error: res => {
                this.setData({
                    ifRegist: false,
                })
            },
            toastError: false,
        })
    },
    getBanner() {
        api.getBannerList({
            success: res => {
                let aList = (res.data || []).map(item => {

                    //获取券批的imgtextInfo中的第一张图片;
                    let aImgTextInfo = null;
                    try {
                        aImgTextInfo = JSON.parse(item.imgtxtInfo || '[]');
                        aImgTextInfo = aImgTextInfo.find(item => !!item.img);
                    } catch (err) { }
                    aImgTextInfo = aImgTextInfo || {};
                    //使用try..catch..作错误处理;

                    return {
                        id: item.id,
                        couponId: item.id || item.couponId,
                        activityId: item.activityId,
                        couponActivityId: item.couponActivityId,
                        cover: aImgTextInfo.img || item.imgUrl || this.data.couponDefaultCover,
                        title: item.mainInfo,
                        quantity: item.quantity
                    }
                })

                // var item = [];
                // for (var i = 0; i < aList.length; i++) {
                //     if (item.length == 0) {
                //         item.push(aList[i])
                //     }
                //     for (var j = 0; j < item.length; j++) {
                //         if (item[j].couponId != aList[i].couponId) {
                //             item.push(aList[i])
                //         }
                //     }
                // }

                let obj = {};

                aList = aList.reduce((cur, next) => {
                    obj[next.couponId] ? "" : obj[next.couponId] = true && cur.push(next);
                    return cur;
                }, []) //设置cur默认类型为数组，并且初始值为空的数组

                // aList = aList.reduce(function(item, next) {
                //     console.log(item)
                //     if (item.length == 0) {
                //         item.push(next)
                //     }
                //     for (var i = 0; i < item.length; i++) {
                //         if (item[i].couponId != next.couponId) {
                //             item.push(next)
                //         }
                //     }
                //     return item;
                // }, [])
                function sortId(a, b) {
                    return a.quantity - b.quantity
                }
                aList.sort(sortId)
                this.setData({
                    couponList: aList.slice(0, 6),
                })
                api.toast.hide();
            },
        })
    },

    getMyCard() {
        if (!wx.getStorageSync('isLoginSucc')) return;
        api.getMyCardList({
            success: res => {
                let aList = (res.data.cardVos || []).map(item => {
                    return {
                        id: item.cardId,
                        name: item.name,
                        cover: item.url,
                        amount: item.num,
                        status: item.status,
                    }
                })
                this.setData({
                    exchangeMax: res.data.exchangeNum,
                    drawMax: res.data.extractNum,
                    cardList: [...aList],
                })
            },
        })
    },
    getShareList() {
        api.shareList({
            success: res => {
                let aList = (res.data || []).map(item => {
                    return {
                        id: item.id,
                        avatar: item.shareHead,
                        name: item.shareNickname,
                        amount: item.num,
                        time: item.createTime,
                    }
                })
                this.setData({
                    shareList: [...aList],
                })
            },
        })
    },
    swiperHandler(e) {
        this.setData({
            couponDefaultIndex: e.detail.current,
        })
    },
    drawHandler() {
        const isLogin = wx.getStorageSync("isLoginSucc");
        if (!isLogin) {
            wx.navigateTo({
                url: app.globalData.loginPath,
                success: function (res) { },
                fail: function (res) { }
            });
            return;
        }
        //控制连续两次点击的问题
        if (this.data.isExchange) {
            return
        }
        this.setData({
            isExchange: true,
        })

        if (!this.data.ifRegist) {
            this.registHanler()
            return
        }
        console.log(this.data.drawMax)
        if (this.data.drawMax > 0) {
            api.draw({
                success: res => {
                    api.toast.success(res.message || res.msg);
                    this.setData({
                        getDrawData: this.data.cardList.find(item => item.id == res.data).cover || '',
                        drawHidden: false,
                    })
                    setTimeout(this.getMyCard, 1500); //刷新卡列表和可抽卡次数;
                },
                error: res => {
                    setTimeout(this.getMyCard, 1500); //刷新卡列表和可抽卡次数;
                },
                complete: (res) => {
                    this.setData({
                        isExchange: false,
                    })
                },
                toastError: true,
            })
        } else {
            this.setData({
                isExchange: false,
            })
            api.toast.error('没有可用次数!')
        }
    },
    drawCloseHandler() {
        this.setData({
            drawHidden: true,
        })
    },
    exchangeHandler() {
        const isLogin = wx.getStorageSync("isLoginSucc");
        if (!isLogin) {
            wx.navigateTo({
                url: app.globalData.loginPath,
                success: function (res) { },
                fail: function (res) { }
            });
            return;
        }
        //控制连续两次点击的问题
        if (this.data.isExchange) {
            return
        }
        this.setData({
            isExchange: true,
        })

        if (!this.data.ifRegist) {
            this.registHanler()
            return
        }
        api.checkIfRegist({
            success: res => {
                if (this.data.exchangeMax > 0) {
                    if (this.data.couponList.length) {
                        api.exchange({
                            success: res => {
                                burialPoint.tracking({
                                    event: '05',
                                    activityId: this.data.couponList[this.data.couponDefaultIndex].couponActivityId,
                                    coupon: this.data.couponList[this.data.couponDefaultIndex].couponId,
                                    eventState: '兑换成功'
                                })
                                api.toast.success(res.message || res.msg);
                                this.setData({
                                    getExchangeData: res.data.mainInfo,
                                    exchangeHidden: false,
                                })
                                setTimeout(this.getMyCard, 1500); //刷新卡列表和可抽卡次数;
                                setTimeout(this.getCouponMemList, 1500);
                            },
                            error: res => {
                                burialPoint.tracking({
                                    event: '05',
                                    eventState: '兑换失败',
                                    activityId: this.data.couponList[this.data.couponDefaultIndex].couponActivityId,
                                    coupon: this.data.couponList[this.data.couponDefaultIndex].couponId
                                })
                                if (res.code == 3007) {
                                    api.toast.error('优惠券已兑完')
                                } else {
                                    api.toast.error(res.message || res.msg);
                                }
                                setTimeout(this.getMyCard, 1500); //刷新卡列表和可抽卡次数;
                            },
                            complete: (res) => {
                                this.setData({
                                    isExchange: false,
                                })
                            },
                        })
                    } else {
                        this.setData({
                            isExchange: false,
                        })
                        burialPoint.tracking({
                            event: '05',
                            eventState: '兑换失败',
                            activityId: this.data.couponList[this.data.couponDefaultIndex].couponActivityId,
                            coupon: this.data.couponList[this.data.couponDefaultIndex].couponId
                        })
                        api.modal.confirm({
                            title: '提示',
                            content: '当前没有可兑换的奖券!',
                            confirmText: '刷新奖券',
                            success: res => {
                                this.getBanner();
                            }
                        })
                    }
                } else {
                    this.setData({
                        isExchange: false,
                    })
                    api.toast.error('卡片未集齐!')
                }
            },
            error: res => {
                this.setData({
                    isExchange: false,
                })
            },
            toastError: false,
        })
    },

    getCouponMemList() {
        api.getCouponMemList({
            success: res => {
                console.log('getCouponMemList', res)
                res.data.map(function (value, index, array) {
                    value.mobile = value.mobile ? value.mobile.substr(0, 3) + '****' + value.mobile.substr(7) : '138****' + parseInt(Math.random() * 10000)

                })
                if (res.code == 200) {
                    this.setData({
                        getCouponList: res.data
                    });

                }
            },
        })
    },
    getSharePei() {
        api.getSharePei({
            success: res => {
                console.log(res)
                if (res.code == 200) {
                    api.share.title = res.data.title
                    api.share.imgUrl = res.data.image
                }
            },
        })
    },

    exchangeCloseHandler() {
        this.setData({
            exchangeHidden: true,
        })
    },

    onGiveClick(e) {
        console.log(this.data.cardList[e.currentTarget.dataset.index])
        if (this.data.cardList[e.currentTarget.dataset.index].amount <= 0) {
            api.toast.error('卡片数量不足')
            return
        }
        this.setData({
            payResult: {
                content: '确定要赠送此卡片?',
                rightText: '赠送',
                type: 0,
                card: this.data.cardList[e.currentTarget.dataset.index],
            },
            shareType: 1,
            cardId: this.data.cardList[e.currentTarget.dataset.index].id
        })
        api.getGiveKey({
            success: (res) => {
                console.log('获取card的key', res)
                this.setData({
                    cardKey: res.data.key
                })
                this.dialog.showDialog()
            }
        })

    },

    onShareClick() {
        this.setData({
            shareType: 0
        })
    },

    onIKnowCLick() {
        this.dialog.hideDialog()
    },

    selCarClick() {

        this.setData({
            cardId: e.detail.cardId
        })
        api.getGiveKey({
            success: (res) => {
                console.log('获取card的key', res)
                this.setData({
                    cardKey: res.data.key
                })
            }
        })
    },

    stopSwiper() {

    },
})