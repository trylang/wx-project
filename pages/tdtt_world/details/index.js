//index.js
//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {
    tracking
} from '../../../rtmap/coupons/utils/track.js'
var wxParse = require('../../components/wxparse/wxparse.js');
Page({
    //页面变量
    data: {
        detailCon: {},
        id: '',
    },

    onLoad: function(options) {
        console.log(options.id)
        this.setData({
            id: options.id
        })
        this.getDetails(options.id)
        this.addTdttBrowse(options.id)
    },
    onShow: function() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },
    getDetails: function(id) {
        var that = this;
        util.localityRequest('/weimao-new-project/world/getDetails', {
            id: id
        }, 'get', function(res) {
            console.log(res)
            if (res.data.code == 200) {
                console.log(res.data.data);
                that.setData({
                    detailCon: res.data.data
                })
                if (that.data.detailCon.isUrl == 2) {
                    var Url = '../../../' + that.data.detailCon.detailUrl;
                    wx.switchTab({
                        url: Url
                    });
                }
                if (that.data.detailCon.detailHtml != null) {
                    var poiDescribe = that.data.detailCon.detailHtml;
                    wxParse.wxParse("poiDescribe", "html", poiDescribe, that, 0);
                }

            } else {
                console.log(res);
            }
        }, function(res) {
            console.log(res)
        });
    },
    addTdttBrowse: function(id) {
        var mobile = wx.getStorageSync('mobile');
        var openid = wx.getStorageSync('openid');
        util.localityRequest('/weimao-new-project/world/addTDTTBrowse', {
                "openId": openid,
                "worldId": id,
                "photo": mobile,
                "portalId": app.globalData.tenantId,
                "pageState": "0",
            }, 'post', function(res) {
                console.log(res)
                if (res.data.code == 200) {} else {
                    console.log(res);
                }
            },
            function(res) {
                console.log(res)
            });
    },
    onShareAppMessage(res) {
        tracking({
            event: '02',
            eventState: '转发'
        })
        return {
            title: '天地头条',
            path: `/pages/tdtt_world/details/index?id=${this.data.id}`,
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