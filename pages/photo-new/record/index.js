//index.js
//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {
    config
} from '../../../utils/config.js'
import {
    tracking
} from '../../../rtmap/coupons/utils/track.js'
Page({
    //页面变量
    data: {
        upHide: "up-hide",
        center: 'center',
        conRecord: [],
        reason: '',
        pageNum: 1,
        total: 0,
    },
    lookReason: function(e) {
        tracking({
            event: '12',
            eventState: '查看原因'
        })
        var that = this;
        var rea = e.currentTarget.dataset.reason;
        console.log(rea);
        that.setData({
            reason: rea
        });
        that.setData({
            upHide: ""
        });
    },
    hideUp: function() {
        var that = this;
        that.setData({
            upHide: "up-hide"
        });
    },
    onLoad: function() {
      tracking({
        event: '06',
        eventState: '进入成功'
      })
        var openId = wx.getStorageSync('openid');
        var keyAdmin = wx.getStorageSync('keyAdmin');
        var that = this;
        that.setData({
            openId: openId
        });
        that.setData({
            keyAdmin: keyAdmin
        });
        that.getRecord();
    },
    handleclick() {

    },
    onReachBottom: function() {
        var that = this;
        var num = that.data.pageNum;
        num++;
        that.setData({
            pageNum: num
        });
        // 显示加载图标
        wx.showLoading({
            title: '玩命加载中',
        })
        if ((num-1) * 10 <= that.data.total) {
            that.getRecord('pull');
        }
        wx.hideLoading();
    },
    onShow: function() {},
    getRecord: function(pull) {
        var that = this;
        var mobile = wx.getStorageSync('mobile');
        var member = wx.getStorageSync('member');
        wx.Request({
            url: config.BaseUrl + 'wxapp-bill-integral/c/bill/history/list',
            data: {
                portalId: config.tenantId,
                page: that.data.pageNum || 1,
                pageSize: 10,
                mobile: mobile,
            },
            method: 'post',
            success: function(res) {
                if (res.data.status == 200) {
                    var arr = res.data.data.list;
                    that.data.total = res.data.data.total;
                    for (var i = 0; i < arr.length; i++) {
                        arr[i].createTime = util.formatTime(new Date(arr[i].createTime));
                        if (arr[i].state == 1) {
                            arr[i].state = "";
                        } else if (arr[i].state == 2) {
                            arr[i].state = "not";
                        } else {
                            arr[i].state = "center";
                        }
                    };
                    if (pull == 'pull') {
                        var array = that.data.conRecord.concat(arr);
                        that.setData({
                            conRecord: array
                        });
                        
                        if (arr.length <= res.data.data.total) {
                            // wx.showLoading({
                            //     title: '已经到头了哦!',
                            // });
                        };
                    } else {
                        that.setData({
                            conRecord: arr
                        });
                    }
                } else {
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'none',
                        duration: 2000
                    })
                }
            },
            fail: function(res) {
                console.log(res)
            }
        });
    },
})