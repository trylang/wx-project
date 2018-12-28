// rtmap/coupons/pages/mybonus/mybonus.js
var util = require("../../utils/util.js");
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../utils/httpUtil.js';
import {
  tracking
} from '../../utils/track.js'
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // total:{},
        records: [],
        page: 1,
        pageSize:20
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      tracking({
        event: '06',
        eventState: '进入成功'
      })
        this.bonusTotal();
        this.returnBonusList();
    },

    bonusTotal() {
        let that = this;
        httpWithParameter({
            endPoint: requestEndPoints.bonusAddup,
            data: {
                openId: wx.getStorageSync('openid'),
                portalId: app.globalData.tenantId
            },
            success: (res) => {
                if (res.data.status == 200) {
                that.setData({
                    total: util.formatMoney(res.data.data.total)
                })
                }
            },
            fail: (err) => {
                console.log("请求失败", err)
            }
        });
    },

    returnBonusList(pull) {
        let that = this;
        // // 显示加载图标
        // wx.showLoading({
        //     title: '玩命加载中',
        // });

        httpWithParameter({
            endPoint: requestEndPoints.returnMoneyList,
            data: {
                openId: wx.getStorageSync('openid'),
                portalId: app.globalData.tenantId,
                page: this.data.page,
                pageSize: this.data.pageSize,
            },
            success: (res) => {
                if (res.data.status == 200) {
                    let list = res.data.data.list.map(item => {
                        return {
                            sellProductId: item.sellProductId,
                            mainInfo: item.mainInfo,
                            cashbackFee: util.formatMoney(item.cashbackFee),
                            createTime: item.createTime

                        };
                    });
                    // that.setData({
                    //     records: that.data.records.concat(list)
                    // });
                    // wx.hideLoading();
                    if (pull == 'pull') {
                        var array = list.concat(that.data.records);
                        that.setData({
                            records: array
                        });

                        if (arr.length <= res.data.data.total) {
                            // wx.showLoading({
                            //     title: '已经到头了哦!',
                            // });
                        };
                    } else {
                        that.setData({
                            records: list
                        });
                    }
                    
                }
            }
        })
    },
    //上拉更多
    onReachBottom: function () {
        // this.returnBonusList(++this.data.page);

        var that = this;
        var num = that.data.page;
        num++;
        that.setData({
            page: num
        });
        // 显示加载图标
        wx.showLoading({
            title: '玩命加载中',
        })
        if ((num - 1) * 10 <= that.data.total) {
            that.returnBonusList('pull');
        }
        wx.hideLoading();
    },
})