// memdetail/components/addcard.js
const httpUtil = require('../httpUtil.js')
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        convertData: {
            type: Object,
            value: {
                title: '添加会员卡',
                titleImg: 'http://res.rtmap.com/wx/eseal/icon_alert_normal.png',
                content: '是否将会员卡放入微信卡包!',
                leftText: '不',
                rightText: '放入卡包',
                btnText: '确定',
            }
        },
        isAute: {
            type: Boolean,
            value: false
        },
        isImage: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        isShow: false,
        cardId: null,
    },

    /**
     * 组件的方法列表
     */
    methods: {

        isAddCard() {
            if (wx.getStorageSync('isLoginSucc'))
                httpUtil.getWXCard({
                    success: (res) => {
                        console.log('getWXCard', res)
                        if (!res.data)
                            this.showAlert()
                    },
                    fail: (data) => {
                        console.log(data)
                    }
                })
        },

        onRightClick() {
            
            console.log('member', wx.getStorageSync('member'))
            this.hideAlert()
            console.log(this.data.isAute)
            if (this.data.isAute){
                this.triggerEvent('onOkClick')
                return
            }
            httpUtil.getWXCardId({
                success: (res) => {
                    console.log('getWXCardId', res)
                    if (res.data && res.data.cardId) {
                        this.setData({
                            cardId: res.data.cardId
                        })
                        this.getWxCardSdk();
                    } else {
                        this.showFail()
                    }
                },
                fail: (data) => {
                    this.showFail()
                }
            })
        },

        showFail() {
            wx.showModal({
                title: '添加会员卡',
                content: '服务器未响应, 是否重试',
                showCancel: true,
                cancelText: '否',
                confirmText: '是',
                success: function(res) {
                    if (res.confirm) {
                        this.onRightClick()
                    }
                },
                fail: function(res) {},
                complete: function(res) {},
            })
        },

        showAlert() {
            this.setData({
                isShow: true
            })
        },

        hideAlert() {
            this.setData({
                isShow: false
            })
        },

        _onOkClick() {
            this.triggerEvent('onBottomClick')
            this.hideAlert()
        },

        getWxCardSdk() {
            httpUtil.getWXJsSdk({
                cardId: this.data.cardId,
                success: res => {
                    if (res.data) {
                        let aExt = {
                            code: wx.getStorageSync('member').member.cardNo,
                            openid: wx.getStorageSync('openid'),
                            timestamp: res.data.timestamp,
                            nonce_str: res.data.nonce_str,
                            signature: res.data.signature,
                        }
                        console.log(JSON.stringify(aExt))
                        wx.addCard({
                            cardList: [{
                                'cardId': res.data.card_id,
                                'cardExt': JSON.stringify(aExt)
                            }],
                            success: data => {
                                console.log(data.cardList[0].cardExt) //"{"code":"1000011810700020","openid":"oHeH50NVOBEPzVB41SW1UuwvnzCg","timestamp":"1527690663","nonce_str":"afawjpfcanldfbjldnch","signature":"59708d6ff8718e0e8248829fab04249c45d591d8"}"
                                console.log(data.cardList[0].cardId) //"pq1Gkt0tRD0X34UI1gIC7KXaSEC4"
                                console.log(data.cardList[0].code) //"9uCwWGjQC7WGRxgfM4gFRzmAghIEfPJNFjRUCb/Uyz0="
                                httpUtil.addCardComplete({
                                    cardId: this.data.cardId,
                                    code: data.cardList[0].code,
                                    success: res => {
                                        console.log('addCard success!!')

                                    }
                                })

                                httpUtil.getMobileByCode({
                                    cardId: data.cardList[0].cardId,
                                    encryptCode: data.cardList[0].code,
                                    success: decrypt => {
                                        if (decrypt.data.decryptCode) {
                                            wx.openCard({
                                                cardList: [{
                                                    cardId: data.cardList[0].cardId,
                                                    code: decrypt.data.decryptCode,
                                                }],
                                                success: function (res) { },
                                                fail: function (res) { },
                                                complete: function (res) { },
                                            })
                                        }
                                    }
                                })
                            },
                            complete:(res)=>{
                                console.log(res)
                            }
                        })
                    } else {
                        this.showSDKFail()
                    }
                },
                error: res => {
                    this.showSDKFail()
                }
            })
        },


        showSDKFail() {
            wx.showModal({
                title: '添加会员卡',
                content: '服务器未响应, 是否重试',
                showCancel: true,
                cancelText: '否',
                confirmText: '是',
                success: function(res) {
                    if (res.confirm) {
                        this.getWxCardSdk();
                    }
                },
                fail: function(res) {},
                complete: function(res) {},
            })
        },
    }
})