/*
 * @Author: Suoping
 * @Date:   2017-07-21 15:58:46
 * @Last Modified by:   Suoping
 * @Last Modified time: 2018-04-28 11:25:35
 */

//获取应用实例
var app = getApp();
import api from '../modules/api';
var burialPoint = require('../../../../coupons/utils/track.js')

Page({
    //埋点数据
    title: '霸王餐卡包',
    data:{
        cateState: 'unuse',
        countOfUnuse: 0,
        countOfUsed: 0,
        countOfInvalid: 0,
        couponSummary: [],
    },
    _couponUnuse: [],
    _couponUsed: [],
    _couponInvalid: [],
    onShow() {
        burialPoint.tracking({
            event: '06',
            activityId: api.activityId,
            eventState: '进入成功'
        })
    },
    onLoad: function() {
        wx.setNavigationBarTitle({
            title: '我的卡包'
        })
        this.headerHandler({
            currentTarget: {
                dataset: {
                    type: this.data.cateState
                }
            }
        })
        api.getWalletList({
            success: res => {
                console.log(res)
                res.data = res.data || [];
                res.data.forEach((item) => {
                    console.log(item.activityId, api.data.activityId)

                    switch (item.status) {
                        case 2:
                            if (item.activityId == api.data.activityId)
                                this._couponUnuse.push(item);
                            break;
                        case 3:
                            if (item.activityId == api.data.activityId)
                                this._couponUsed.push(item);
                            break;
                        default:
                            if (item.activityId == api.data.activityId)
                                this._couponInvalid.push(item);
                            break;
                    }
                })
                this.setData({
                    countOfUnuse: this._couponUnuse.length,
                    countOfUsed: this._couponUsed.length,
                    countOfInvalid: this._couponInvalid.length,
                    couponSummary: [...this._couponUnuse]
                })
            }
        })
    },
    headerHandler: function(evt) {
        if (evt && evt.currentTarget && evt.currentTarget.dataset && evt.currentTarget.dataset.type != undefined) {
            let currState = String(evt.currentTarget.dataset.type).toLowerCase();
            switch (currState) {
                case 'unuse':
                    this.setData({
                        cateState: currState,
                        couponSummary: [...this._couponUnuse]
                    })
                    break;
                case 'used':
                    this.setData({
                        cateState: currState,
                        couponSummary: [...this._couponUsed]
                    })
                    break;
                case 'invalid':
                    this.setData({
                        cateState: currState,
                        couponSummary: [...this._couponInvalid]
                    })
                    break;
            }
        }
    },
    couponViewHandler: function(evt) {
        console.log('卡券详情')
        let target = evt && (evt.currentTarget || evt.target);
        let qrcode = target && (target.dataset.qrcode || target.dataset.qrCode);

        wx.navigateTo({
            url: './info/index?qrCode=' + qrcode,
            success: (res) => {
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
})