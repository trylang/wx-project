/*
 * @Author: Suoping
 * @Date:   2018-04-28 10:56:55
 * @Last Modified by:   Suoping
 * @Last Modified time: 2018-07-31 22:24:06
 */
const app = getApp()

let api = {
    activityId: '',
    data: null,
    url: `https://appsmall.rtmap.com/`,
    share: {
        aid: null,
        openid: null,
        title: '',
        page: '',
        imgUrl: '',
    },
    toast: {
        _toast_show: false,
        _toast_loading: false,
        success(title = '') {
            this.hide();
            this._toast_show = true;
            wx.showToast({
                title: title,
                icon: 'success',
                duration: 2000,
            })
        },
        loading(title = '') {
            this.hide();
            this._toast_loading = true;
            wx.showLoading({
                title: title,
                mask: true,
            })
        },
        error(title = '') {
            this.hide();
            this._toast_show = true;
            wx.showToast({
                title: title,
                image: '/images/bawang/icon-error.png',
                duration: 2000,
            })
        },
        alert(title = '') {
            this.hide();
            this._toast_show = true;
            wx.showToast({
                title: title,
                icon: 'none', //基础库1.9.0+才支持;
                duration: 2000,
            })
        },
        hide() {
            if (this._toast_show) {
                wx.hideToast();
            }
            if (this._toast_loading) {
                wx.hideLoading();
            }
        },
    },
    modal: {
        alert({
            title = '',
            content = '',
            confirmText = '确定',
            confirmColor = '#3CC51F',
            success = null
        }) {
            wx.showModal({
                title,
                content,
                showCancel: false,
                confirmText,
                confirmColor,
                success: res => {
                    if (res.confirm) {
                        success && success()
                    };
                    if (res.cancel) {
                        error && error()
                    };
                }
            });
        },
        confirm({
            title = '',
            content = '',
            cancelText = '取消',
            cancelColor = '#000000',
            confirmText = '确定',
            confirmColor = '#3CC51F',
            success = null,
            error = null
        }) {
            wx.showModal({
                title,
                content,
                cancelText,
                cancelColor,
                confirmText,
                confirmColor,
                success: res => {
                    if (res.confirm) {
                        success && success()
                    };
                    if (res.cancel) {
                        error && error()
                    };
                },
                fail: error
            });
        },
    },
    init(page) {
        this.data = page.data;
        this.share.title = app.globalData.shareTitle;
        this.share.page = app.globalData.sharePage;
    },
    requestConf({
        res,
        success,
        error,
        toastError
    }) {
        this.toast.hide();
        if (res.data.code == 200) {
            console.log(res.data)
            success && success(res.data);
        } else {
            error && error(res.data);
            toastError && this.toast.error(res.data.msg || res.data.message);
        }
    },
    getOpenId({
        code,
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}wxapp-root/wxlogin/front/wx_lite/getsession`,
            method: `GET`,
            data: {
                jsCode: code,
                appId: app.globalData.appID
            },
            complete(res) {
                res.data.status == 200 ? success(res.data) : error()
            },
        })
    },
    getHomePage({
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}overlord/app/getActivityByMarketId/${app.globalData.tenantId}`,
            method: `GET`,
            complete(res) {
                if (res && res.data && res.data.data) {
                    res.data.data.id = res.data.data.id || res.data.data.activityId;
                    res.data.data.marketId = res.data.data.marketId || res.data.data.portalId;
                    res.data.data.rule = res.data.data.rule || res.data.data.remarks;
                }
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    getBannerList({
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}overlord/app/couponList`,
            method: `GET`,
            data: {
                activityId: this.data.activityId,
                validateStatus: '1,5'
            },
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    getMyCardList({
        success,
        error,
        toastError = false
    } = {}) {
        console.log('获取卡列表参数', {
            activityId: this.data.id,
            openid: this.data.openid,
            activityId: this.data.activityId
        })
        wx.Request({
            url: `${api.url}overlord/app/cardList`,
            method: `GET`,
            data: {
                activityId: this.data.id,
                openid: this.data.openid,
                activityId: this.data.activityId
            },
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    loginAtFirst({
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}overlord/app/addNum`,
            method: `GET`,
            data: {
                activityId: this.data.id,
                openid: this.data.openid,
                type: 1,
                activityId: this.data.activityId
            },
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    checkIfRegist({
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}overlord/app/isRegister`,
            method: `GET`,
            data: {
                mobile: wx.getStorageSync('mobile'),
                openid: this.data.openid,
                marketId: this.data.marketId,
                appId: app.globalData.appID
            },
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    //没调此接口
    // sendCode({
    //     success,
    //     error,
    //     toastError = false
    // } = {}) {
    //     success && success();
    //     return false;
    //     wx.Request({
    //         url: `https://mem.rtmap.com/Member/Member/sendmessagepublic`,
    //         method: `POST`,
    //         data: {
    //             mobile: this.data.mobile
    //         },
    //         complete(res) {
    //             api.requestConf({
    //                 res,
    //                 success,
    //                 error,
    //                 toastError
    //             });
    //         },
    //     })
    // },
    registAccount({
        success,
        error,
        toastError = false
    } = {}) {
        this.toast.loading();
        wx.Request({
            url: `${api.url}overlord/app/register`,
            method: `POST`,
            data: {
                openid: this.data.openid,
                marketId: this.data.marketId,
                mobile: this.data.inputPhone,
                appId: app.globalData.appID,
                activityId: this.data.id,
                activityId: this.data.activityId
            },
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    exchange({
        success,
        error,
        complete,
        toastError = false
    } = {}) {
        this.toast.loading();
        wx.Request({
            url: `${api.url}overlord/app/exchange`,
            method: `GET`,
            data: {
                couponId: this.data.couponList[this.data.couponDefaultIndex].couponId,
                couponActivityId: this.data.couponList[this.data.couponDefaultIndex].couponActivityId,
                openid: this.data.openid,
                appId: app.globalData.appID,
                activityId: this.data.activityId,
                marketId: this.data.marketId,
                mobile: wx.getStorageSync('mobile')
            },
            complete(res) {
                complete(res)
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    draw({
        success,
        error,
        complete,
        toastError = false
    } = {}) {
        this.toast.loading();
        wx.Request({
            url: `${api.url}overlord/app/extractCard`,
            method: `GET`,
            data: {
                openid: this.data.openid,
                activityId: this.data.id,
                activityId: this.data.activityId
            },
            complete(res) {
                complete(res)
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    shareList({
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}overlord/app/shareList`,
            method: `GET`,
            data: {
                openid: this.data.openid,
                activityId: this.data.id,
                activityId: this.data.activityId
            },
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    shareCompletedSelf({
        success,
        error,
        toastError = false
    } = {}) {
        this.toast.loading();
        wx.Request({
            url: `${api.url}overlord/app/addShare`,
            method: `POST`,
            data: {
                openid: this.data.openid,
                marketId: this.data.marketId,
                mobile: this.data.mobile,
                activityId: this.data.id,
                activityId: this.data.activityId
            },
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    shareCompleted({
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}overlord/app/addShare`,
            method: `POST`,
            data: {
                openid: this.share.openid,
                marketId: this.data.marketId,
                mobile: this.data.mobile,
                activityId: this.share.aid,
                shareHead: this.data.avatar,
                shareNickname: this.data.nickname,
                shareOpenid: this.data.openid,
                activityId: this.data.activityId
            },
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    getWalletList({
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}overlord/app/cardPage`,
            data: {
                openid: this.data.openid,
                activityId: this.data.activityId,
                appId: app.globalData.appID
            },
            header: {
                'content-type': 'application/json'
            },
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    getCouponDetail({
        qrCode,
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}overlord/app/cardDetail`,
            data: {
                qrCode
            },
            header: {
                'content-type': 'application/json'
            },
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    getCouponMemList({
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}overlord/app/getPrize/${this.data.activityId}`,
            method: `GET`,
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    giveCard({
        success,
        error,
        complete,
        toastError = false
    } = {}) {
        var that = this
        wx.Request({
            url: `${api.url}overlord/app/giveCard`,
            data: {
                openid: this.data.openid,
                activityId: this.data.activityId,
                cardId: this.data.cardId,
                key: this.data.cardKey
            },
            method: `GET`,
            complete: (res) => {
                complete(res)
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    getGiveCard({
        success,
        error,
        complete,
        toastError = false
    } = {}) {
        var that = this
        // console.log("+++++++++++++++++++++++",this.data)
        wx.Request({
            url: `${api.url}overlord/app/getGiveCard`,
            data: {
                key: this.data.key,
                openid: this.data.openid,
            },
            method: `GET`,
            complete: (res) => {
                complete(res)
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },

    getGiveKey({
        success,
        error,
        toastError = false
    } = {}) {
        var that = this
        wx.Request({
            url: `${api.url}overlord/app/giveKey`,
            data: {
                openid: this.data.openid,
            },
            method: `GET`,
            complete: (res) => {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
    getSharePei({
        success,
        error,
        toastError = false
    } = {}) {
        wx.Request({
            url: `${api.url}overlord/shareConf`,
            data: {
                marketId: this.data.marketId,
                activityId: this.data.activityId
            },
            method: `GET`,
            complete(res) {
                api.requestConf({
                    res,
                    success,
                    error,
                    toastError
                });
            },
        })
    },
}

export default api;