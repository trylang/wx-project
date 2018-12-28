// rtmap/coupons/pages/userInfo/userInfo.js
import {
    tracking
} from '../../utils/track.js'
import {
    requestEndPoints,
    postRequestWithParameter
} from '../../utils/maHttpUtil.js'
import * as http from '../../utils/httpUtil.js'
import {
    handleRequest,
    giftsEndUrl
} from '../../../../utils/util_new_gift.js'

const app = getApp();
var day = new Date()
var year = day.getFullYear();
var month = day.getMonth() + 1;
var date = day.getDate();
var endtime = year + '-' + month + '-' + date;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        endtime: endtime,
        name: '',
        birthday: '',
        gender: 'M',
        address: '',
        phone: '',
        cid: '',
        isIos: false,
        birthdayChangedTimes: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            isIos: wx.getSystemInfoSync().platform == 'ios'
        })
        const userInfo = wx.getStorageSync('member').member

        if (userInfo) {
            const name = userInfo.name
            const phone = wx.getStorageSync('mobile')
            const birthday = userInfo.birthday || userInfo.birthdayVo
            const address = userInfo.address
            const gender = userInfo.sex || 'M'
            var reg = /(\d{3})\d{4}(\d{4})/;
            const cid = userInfo.cid
            const encodePhone = phone.replace(reg, "$1****$2");
            this.setData({
                phone: encodePhone || '',
                name: name || '',
                orgbirthday: birthday || '1990-01-01',
                birthday: birthday || '1990-01-01',
                gender: gender,
                address: address || '',
                cid: cid
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
        this.flashUserInfo();
    },

    /**
     * 名字录入
     */
    nameInput: function (e) {
        this.setData({
            name: e.detail.value
        });
    },

    /**
     * 地址录入
     */
    addressInput: function (e) {
        this.setData({
            address: e.detail.value
        })
    },

    /**
     * 更新会员信息
     */
    updateInfo: function(e) {
      tracking({
        event: '12',
        eventState: '更新会员资料'
      })
        var _self=this;

        if (!this.data.name){
            wx.showToast({
                title: '请输入姓名',
                icon: 'none',
                duration: 1000,
                mask: true
            })
            return
        }
        const userInfo = wx.getStorageSync('member').member
        var para = {
            cid: this.data.cid,
            cType: 1,
            tenantType: 1,
            tenantId: getApp().globalData.tenantId,
            mobile: wx.getStorageSync('mobile') || '',
            sex: this.data.gender || 'M',
            address: this.data.address || '',
            name: this.data.name
        }
        if (this.data.birthday != this.data.orgbirthday) {
            para.birthday = userInfo.birthday || ''
        }
        postRequestWithParameter({
            endPoint: requestEndPoints.updateMembershipInfo,
            data: para,
            success: (res) => {
                console.log(res.data);
                if (res.data.status === 200) {
                    app.globalData.isUserInfoUpdated = true
                    wx.showToast({
                        title: '更新成功',
                    })
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none'
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.errMsg,
                    icon: 'none'
                })
            }
        })
        if (this.data.birthday != this.data.orgbirthday) {
            http.postRequestWithParameter({
                endPoint: http.requestEndPoints.changebirthday,
                data: {
                    "openId": wx.getStorageSync('openid'),
                    "tenantId": getApp().globalData.tenantId,
                    "birthday": this.data.birthday,
                    "mobile": wx.getStorageSync('mobile') || '',
                },
                success: (res) => {
                    _self.flashUserInfo()
                },
                fail: (res) => {
                    _self.flashUserInfo()
                }
            })
        }
    },

    /**
     * 修改性别
     */
    changeGender: function () {
        let that = this
        wx.showActionSheet({
            itemList: ['男', '女'],
            success: function (res) {
                that.setData({
                    gender: res.tapIndex == 0 ? 'M' : 'F'
                })
            },
        })
    },
    bindDateChange: function (e) {
        this.setData({
            birthday: e.detail.value
        })
    },
    /**
    * 刷新用户信息
    */
    flashUserInfo: function () {
        let That = this
        let openid = wx.getStorageSync('openid');
        let mobile = wx.getStorageSync('mobile');
        let unionid = wx.getStorageSync('unionid');
        const userInfo = wx.getStorageSync('member').member
        handleRequest(giftsEndUrl.handleLogin, {
            mobile: mobile,
            openId: openid,
            registerSourceId: '',
            registerSource: '',
            appid: app.globalData.appid,
            tenantId: app.globalData.tenantId,
            unionid: unionid,
            tenantType: 1,
            headPortrait: '',
            nickName: ''
        }, 'post', function (res) {
            wx.stopPullDownRefresh()
            if (res.data.code == 200) {
                const userInfo = JSON.parse(res.data.data)
                userInfo.member.birthdayChangedTimes = res.data.member.birthdayChangedTimes;
                if (app.globalData.WxUserInfo) {
                    let userName = userInfo.member.name || app.globalData.WxUserInfo.nickName || ''
                    That.setData({
                        userInfo: userInfo.member,
                        avatar: userInfo.member.icon || app.globalData.WxUserInfo.avatarUrl || avatar,
                        name: userName ? userName.substr(0, 6) : '', birthdayChangedTimes: res.data.member.birthdayChangedTimes
                    })
                } else {
                    let userName = userInfo.member.name || ''
                    That.setData({
                        userInfo: userInfo.member,
                        avatar: userInfo.member.icon || avatar,
                        name: userName ? userName.substr(0, 6) : '', birthdayChangedTimes: res.data.member.birthdayChangedTimes
                    })
                }

                wx.setStorageSync('isLoginSucc', true)
                wx.setStorageSync('member', userInfo)
            }
        }, function (res) {
            //wx.stopPullDownRefresh()
        }, false)
    },
})