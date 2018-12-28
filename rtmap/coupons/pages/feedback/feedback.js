// rtmap/coupons/pages/feedback/feedback.js

import { requestEndPoints, postRequestWithParameter, uploadFile } from '../../utils/httpUtil.js';
import {
    tracking
} from '../../utils/track.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        contentInputCount: 0,
        title: '',
        content: '',
        imagePath: '',
        submitResult: {},
        isIos: false,
        isShowTextarea: true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var phone = wx.getSystemInfoSync();  //调用方法获取机型
        var that = this;
        if (phone.platform == 'ios') {
            that.setData({
                isIos: true
            });
        } else if (phone.platform == 'android') {
            that.setData({
                isIos: false
            });
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    /**
     * 内容输入绑定
     */
    contentInput: function (e) {
        const length = e.detail.value.length;
        this.setData({
            contentInputCount: length
        });
    },

    /**
     * 内容输入完成
     */
    contentInputEnd: function (e) {
        this.setData({
            content: e.detail.value
        })
    },

    /**
     * 标题输入完成
     */
    titleInputEnd: function (e) {
        this.setData({
            title: e.detail.value
        })
    },

    /**
     * 选取图片更新
     */
    updatePickerImages: function (e) {
        const imagePath = e.detail.images
        this.setData({
            imagePath: imagePath ? imagePath : ''
        })
    },

    /**
     * 提交
     */
    submit: function () {
        tracking({
            event: '12',
            eventState: '提交反馈'
        })
        let requestData = {}
        if (this.data.title && this.data.title.length > 0) {
            requestData.title = this.data.title
        } else {
            wx.showToast({
                title: '请填写标题',
                icon: 'none'
            })

            return
        }

        if (this.data.content && this.data.content.length > 0) {
            requestData.content = this.data.content
        } else {
            wx.showToast({
                title: '请填写内容',
                icon: 'none'
            })
            return
        }

        wx.showLoading({
            title: '提交中...',
        })

        const app = getApp()
        requestData.tenantId = app.globalData.tenantId
        requestData.openid = wx.getStorageSync('openid')
        requestData.appId = app.globalData.appId
        const that = this

        if (this.data.imagePath && this.data.imagePath.length > 0) {
            uploadFile({
                filePath: that.data.imagePath,
                fileName: 'file',
                success: function (res) {
                    const data = JSON.parse(res.data)
                    if (data.status == '200') {
                        requestData.image = data.data.path
                        postRequestWithParameter({
                            endPoint: requestEndPoints.feedback,
                            data: requestData,
                            success: (res) => {
                                wx.hideLoading()
                                if (res.data.status == '200') {
                                    const dialog = that.selectComponent('#dialog')
                                    that.setData({
                                        submitResult: {
                                            content: '感谢您的反馈',
                                            leftText: '',
                                            rightText: '看看其他的',
                                            type: 1
                                        },
                                        isShowTextarea: false
                                    })

                                    dialog.showDialog()
                                } else {
                                    wx.showToast({
                                        title: res.data.message,
                                        icon: 'none'
                                    })
                                }
                            },
                            fail: (res) => {
                                wx.hideLoading()

                                wx.showToast({
                                    title: res.errMsg,
                                    icon: 'none'
                                })
                            }
                        })
                    }
                },
                fail: function (res) {
                    wx.hideLoading()

                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            })
        } else {
            postRequestWithParameter({
                endPoint: requestEndPoints.feedback,
                data: requestData,
                success: (res) => {
                    wx.hideLoading()

                    if (res.data.status == '200') {
                        const dialog = that.selectComponent('#dialog')
                        that.setData({
                            submitResult: {
                                content: '感谢您的反馈',
                                leftText: '',
                                rightText: '看看其他的',
                                type: 1
                            },
                            isShowTextarea: false
                        })
                        dialog.showDialog()
                    } else {
                        wx.showToast({
                            title: res.data.message,
                            icon: 'none'
                        })
                    }
                },
                fail: (res) => {
                    wx.hideLoading()

                    wx.showToast({
                        title: res.errMsg,
                        icon: 'none'
                    })
                }
            })
        }
    },

    /**
     *  弹窗左按钮
     */
    onLeftClick() {
        const dialog = this.selectComponent('#dialog')
        this.setData({
            isShowTextarea: true
        })
        dialog.hideDialog()
    },

    /**
     * 弹窗右按钮
     */
    onRightClick() {
        const dialog = this.selectComponent('#dialog')
        dialog.hideDialog()

        this.setData({
            isShowTextarea: true
        })
        
        wx.navigateBack()
    },
})