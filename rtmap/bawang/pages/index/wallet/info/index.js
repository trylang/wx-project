/*
 * @Author: Suoping
 * @Date:   2017-07-20 15:18:17
 * @Last Modified by:   Suoping
 * @Last Modified time: 2018-07-31 15:21:46
 */

var app = getApp();
var qrcode = require('../comp/qrcode.js');
import api from '../../modules/api';
var burialPoint = require('../../../../../coupons/utils/track.js')

Page({
    //埋点数据
    title: '霸王餐卡包详情',
    data: {
        pageStatus: '',
        coupon: {
            type: '',
            logo: '',
            title: '',
            shop: '',
            date: [' ', ' '],
            limit: '',
            desc: '',
            applyshops: [],
            qrcode: '',
            qrFrontColor: '#000000',
            qrBackColor: '#ffffff',
        },
        animationBackend: null,
        animationPage: null,
        animationCoupon: null,
        param: null,

    },
    getCouponHandler: function(evt) {},
    onLoad: function(param) {
        let aQrcode = param.qrcode || param.qrCode || param.qr;
        if (aQrcode) {
            api.getCouponDetail({
                qrCode: aQrcode,
                success: res => {
                    burialPoint.tracking({
                        event: '06',
                        activityId: res.data.activityId,
                        coupon: res.data.couponId,
                        eventState: '进入成功'
                    })
                    let code = res.data.qrCode || res.data.qrcode || res.data.qr;
                    let qrcodeWidth = Math.round(wx.getSystemInfoSync().windowWidth * 260 / 750);
                    qrcode.draw(code, {
                        ctx: wx.createCanvasContext('qrCanvas'),
                        width: qrcodeWidth,
                        height: qrcodeWidth
                    }, this.data.coupon.qrFrontColor, this.data.coupon.qrBackColor);
                    let qrletter = [];
                    for (let i = 0; i < code.length; i += 4) {
                        qrletter.push(code.substring(i, i + 4));
                    }
                    let aShops = [];
                    res.data.couponApplyShopList.forEach((item) => {
                        aShops.push(item.shopName || item);
                    })
                    this.setData({
                        pageStatus: 'final', //添加final样式;
                        coupon: {
                            type: res.data.categoryDesc,
                            logo: res.data.imgLogoUrl || '../../assets/default_logo.jpg',
                            title: res.data.mainInfo,
                            shop: res.data.issuerName || res.data.shopName,
                            date: [res.data.effectiveStartTime, res.data.effectiveEndTime],
                            limit: res.data.conditionType == 1 ? '满' + Math.round(res.data.conditionPrice / 100) + '元可用' : '无限制',
                            desc: (res.data.descClause || '').replace(/(\r|\n)/gi, '\n'),
                            applyshops: aShops,
                            qrcode: qrletter.join(' '),
                            qrFrontColor: '#000000',
                            qrBackColor: '#ffffff',
                        },
                    })
                }
            })
        } else {
            this.confirm({
                title: '提示',
                content: '没有券码编号!',
                confirmText: '我知道了',
                confirmType: 'danger',
                success: res => {
                    wx.navigateBack(); //返回上一页, 上一页可能是店铺详情, 可能是商场卡券列表页;
                }
            });
        }
    },

    onShow() {

    },
})