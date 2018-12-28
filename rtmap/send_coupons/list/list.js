import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../../rtmap/coupons/utils/httpUtil.js';
import { config } from '../../../utils/config.js';
import { formatTime } from '../../../utils/util.js';

import {
    tracking
} from '../../../rtmap/coupons/utils/track.js'
var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        detailBanner: '',
        showResult: false,
        isMove: false,
    },

    //页面滑动监听
    onPageMove(res) {
        console.log("onPageMove", res);
        this.setData({
            isMove: true
        });
    },

    //页面滑动结束监听
    onPageEnd() {
        setTimeout(() => {
            this.setData({
                isMove: false
            });
        }, 500);
    },

    getList(activityId, recordId, tenantId) {
        postRequestWithParameter({
            endPoint: requestEndPoints.getScanCouponList,
            data: {
                "tenantId": tenantId,
                "activityId": activityId,
                "openId": wx.getStorageSync('openid'),
                "recordId": recordId
            },
            success: (res) => {
                if (res.data.status === 200) {
                    if (res.data.data) {
                        let data = [];
                        data = res.data.data.map(item => {
                            
                            item.effectiveStartTime = formatTime(new Date(Number(item.effectiveStartTime))).split(' ')[0];
                            item.effectiveEndTime = formatTime(new Date(Number(item.effectiveEndTime))).split(' ')[0];
                            return {
                                couponId: item.couponId,
                                qrCode: item.qrCode,
                                extendInfo: item.extendInfo,
                                descClause: item.descClause,
                                mainInfo: item.mainInfo,
                                activityName: item.activityName,
                                effectiveType: item.effectiveType,
                                effectiveStartTime: item.effectiveStartTime,
                                effectiveEndTime: item.effectiveEndTime,
                                activedLimitedStartDay: item.activedLimitedStartDay,
                                activedLimitedDays: item.activedLimitedDays
                            }
                        })
                        this.setData({
                            list: data
                        })
                        
                    }

                } else {
                    let data = [
                        {
                            "couponId": 3674,
                            "activityId": "A05jgPlql",
                            "openId": "oS7sI0XLEVa3J949XcAQTAge4vPg",
                            "openIdName": "oS7sI0XLEVa3J949XcAQTAge4vPg",
                            "getTime": "2018-11-24 15:08:32",
                            "writeoffTime": null,
                            "qrCode": "01972955775579477",
                            "effectiveType": 0,
                            "effectiveStartTime": 1539705600000,
                            "effectiveEndTime": 1546185600000,
                            "activedLimitedStartDay": 0,
                            "activedLimitedDays": 0,
                            "status": 2,
                            "statusDesc": "已领取",
                            "mainInfo": "免费无限购买韩",
                            "extendInfo": "秒杀券",
                            "activityName": "限时秒杀活动",
                            "categoryId": 9,
                            "categoryDesc": "通用券",
                            "writeoffUser": null,
                            "writeoffChannel": null,
                            "templateId": "12345",
                            "writeOffName": null,
                            "descClause": "1、满100元减20元； 2、无使用门槛； 3、解释权归本店所有",
                            "marketId": 290,
                            "couponActivityId": "BWMyXkTo",
                            "cid": "54af9b3403cd4da7aab4feef0728dd04",
                            "cost": 200,
                            "facePrice": 100,
                            "unitPrice": 100,
                            "discount": 10,
                            "conditionType": 0,
                            "conditionPrice": 0,
                            "couponImageList": [
                                {
                                    "id": null,
                                    "couponId": 3674,
                                    "imgType": 0,
                                    "imgUrl": "http://res.rtmap.com/sences/images/20181017/1539762672888.jpg",
                                    "isValidate": null,
                                    "createTime": 1539762675000,
                                    "updateTime": null
                                }
                            ]
                        }
                    ];
                    data = data.map(item => {
                        item.effectiveStartTime = formatTime(new Date(item.effectiveStartTime)).split(' ')[0];
                        item.effectiveEndTime = formatTime(new Date(item.effectiveEndTime)).split(' ')[0];
                        return {
                            couponId: item.couponId,
                            qrCode: item.qrCode,
                            extendInfo: item.extendInfo,
                            descClause: item.descClause,
                            mainInfo: item.mainInfo,
                            activityName: item.activityName,
                            effectiveType: item.effectiveType,
                            effectiveStartTime: item.effectiveStartTime,
                            effectiveEndTime: item.effectiveEndTime,
                            activedLimitedStartDay: item.activedLimitedStartDay,
                            activedLimitedDays: item.activedLimitedDays
                        }
                    })
                    this.setData({
                        list: data
                    })
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none'
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: '获取规则失败',
                    icon: 'none'
                })
            }
        });
    },

    use(e) {
        let qrcode = e.currentTarget.dataset.qrcode;
        let extendinfo = e.currentTarget.dataset.extendinfo;
        wx.navigateTo({
            url: '/rtmap/coupons/pages/couponInfo/couponInfo?qrCode=' + qrcode + '&extendInfo=' + extendinfo,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getList(options.activityId, options.recordId, options.tenantId);
        this.setData({
            detailBanner: options.detailBanner,
        });
    },
})