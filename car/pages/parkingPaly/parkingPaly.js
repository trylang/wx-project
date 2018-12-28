const app = getApp()
let carNumber = '';
let scoreMinutes = 0;
let carFeeDetail = null;
const carRuleInfo = wx.getStorageSync('carRuleInfo') || {};
import util from '../../utils/util'
import {
  tracking
} from '../../utils/track.js'
import {
  requestEndPoints,
  httpWithParameter,
  postRequestWithParameter
} from "../../utils/httpUtil.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    convertScore: '',
    convertPrice: '',
    selCarNumber: '',
    scoreMinutes: 0,
    preferenceTotal: '', // 优惠合计
        actualPrice: '', // 实际支付,
        balance: 0, // 积分
        carInfo: null,
        options: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  tracking({
      event: '06',
      eventState: '进入成功'
    })
        let _this = this;
        this.data.options = options;
        this.dialog = this.selectComponent('#dialog');
        this.dialogPay = this.selectComponent('#dialogPay');
        this.selCarNumber = options.carNumber;
        // this.getCarDetail(options.carNumber);
        this.getScore(function() {
            _this.getCarDetail(options.carNumber);
        });
        carNumber = options.carNumber;
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
        if (app.globalData.customerScore != undefined || app.globalData.customerScore != null) {
            let customerScore = app.globalData.customerScore;
            let carRuleScore = carRuleInfo.maxScore;
            let score = carRuleScore < customerScore ? carRuleScore : customerScore;
            this.getScoreDeductible(score, data => {
                let preferenceTotal = Number(this.data.carInfo.memberDeductible) + Number(this.data.carInfo.fullDeductible) + Number(data.scoreDeductible);
                scoreMinutes = data.scoreMinutes;
                let actualPrice = this.data.carInfo.receivableMoney - preferenceTotal;
                this.setData({
                    convertScore: score,
                    scoreMinutes: data.scoreMinutes,
                    convertPrice: util.formatMoney(data.scoreDeductible),
                    preferenceTotal: util.formatMoney(preferenceTotal),
                    actualPrice: util.formatMoney(actualPrice)
                })
            })
        }
    },

    // 查询积分
    getScore(cb) {
        let _this = this;
        httpWithParameter({
            endPoint: requestEndPoints.getScore,
            data: {
                tenantType: 1,
                tenantId: app.globalData.tenantId,
                cid: wx.getStorageSync('member').cid
            },
            success: function(res) {
                if (res.data.status === 200) {
                    let balance = res.data.data.balance;
                    _this.data.balance = balance;
                    // _this.getCarDetail(_this.data.options.carNumber);
                    cb();
                } else {
                    _this.data.balance = 0;
                    // _this.getCarDetail(_this.data.options.carNumber);
                    cb();
                }
            },
            fail: function(res) {
                _this.data.balance = 0;
                // _this.getCarDetail(_this.data.options.carNumber);
                cb();
            }
        })
    },

    getCarDetail(carNumber) {
        httpWithParameter({
            endPoint: requestEndPoints.carDetailByNumber,
            data: {
                wxAppId: app.globalData.appid,
                openid: wx.getStorageSync('openid'),
                carNumber,
                userId: wx.getStorageSync('member').cid,
                memType: wx.getStorageSync('member').member ? wx.getStorageSync('member').member.cardName : '',
            },
            success: res => {
                if (res.data.code == 200) {
                    let data = res.data.data.parkingFee;
                    let maxScore = res.data.data.maxScore;
                    carFeeDetail = res.data.data.parkingFee;
                    let carInfo = {
                        carNumber: data.carNumber,
                        passTime: util.formatTime(data.passTime),
                        receivable: util.formatMoney(data.receivable),
                        receivableMoney: data.receivable,
                        parkingLongTime: util.toHourMinute(data.parkingLongTime),
                        totalLongTime: util.toHourMinute(data.totalLongTime),
                        maxScore: res.data.data.maxScore,
                        memberDeductible: data.memberDeductible, // 会员抵扣金额
                        fullDeductible: data.fullDeductible, // 全场抵扣金额
                        formatMemberDeductible: util.formatMoney(data.memberDeductible),
                        formatFullDeductible: util.formatMoney(data.fullDeductible),
                    };
                    // 积分抵扣，优惠合计  
                    if (maxScore) {
                        // let userScore = (wx.getStorageSync('member').member && wx.getStorageSync('member').member.balance);
                        let userScore = this.data.balance;
                        let convertScore = maxScore > userScore ? userScore : maxScore
                        this.getScoreDeductible(convertScore, (score) => {
                            carInfo.maxMoney = util.formatMoney(score.scoreDeductible);
                            scoreMinutes = score.scoreMinutes;
                            this.setData({
                                carInfo
                            });
                            let preferenceTotal =
                                Number(data.memberDeductible) +
                                Number(data.fullDeductible) + Number(score.scoreDeductible);
                            let actualPrice = data.receivable - preferenceTotal;
                            this.setData({
                                convertScore: convertScore,
                                convertPrice: carInfo.maxMoney,
                                preferenceTotal: util.formatMoney(preferenceTotal),
                                actualPrice: util.formatMoney(actualPrice),
                                scoreMinutes: score.scoreMinutes,
                            });
                        });
                    } else {
                        carInfo.maxMoney = 0;
                        this.setData({
                            carInfo
                        });
                        let preferenceTotal = Number(data.memberDeductible) + Number(data.fullDeductible);
                        let actualPrice = data.receivable - preferenceTotal;
                        this.setData({
                            convertScore: 0,
                            convertPrice: carInfo.maxMoney,
                            preferenceTotal: util.formatMoney(preferenceTotal),
                            actualPrice: util.formatMoney(actualPrice),
                        });
                    }
                } else {
                    this.dialog.showDialog();
                    this.setData({
                        payResult: {
                            content: res.data.msg || '没有此车信息',
                            leftText: '',
                            rightText: '确定',
                            type: 0
                        }
                    });
                }
            },
            fail: res => {}
        })
    },

    getScoreDeductible(score, callback) {
        httpWithParameter({
            endPoint: requestEndPoints.getScoreDeductible,
            data: {
                wxAppId: app.globalData.appid,
                // openid: wx.getStorageSync('openid'),
                carNumber,
                score
            },
            success: res => {
                if (res.data.code == 200) {
                    callback(res.data.data);
                }
            },
            fail: res => {}
        })

    },

    onRightClick() {
        wx.navigateBack({
            delta: 1,
        })
    },

    onPayClick() {
        this.dialogPay.hideDialog();
    },
    pay() {
        tracking({
            event: '12',
            eventState: '点击支付'
        })
        let _this = this;
        let feeNumber = this.data.actualPrice > 0 ? Number((this.data.actualPrice * 100).toFixed(2)) : 0;
        if (feeNumber == 0) {
            wx.showModal({
                title: '提示',
                content: `确认使用${this.data.convertScore}积分抵扣停车费用${this.data.carInfo.receivable}元吗？`,
                success(res) {
                    if (res.confirm) {
                        _this.payItem(feeNumber);
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            })
        } else {
            this.payItem(feeNumber);
        }
    },

    payItem(feeNumber) {
        postRequestWithParameter({
            endPoint: requestEndPoints.payParkFree,
            data: {
                wxAppId: app.globalData.appid,
                openid: wx.getStorageSync('openid'),
                carNumber,
                userId: wx.getStorageSync('member').cid,
                marketOrderNumber: carFeeDetail.marketOrderNumber,
                mobile: wx.getStorageSync('mobile') || carFeeDetail.mobile,
                receivable: carFeeDetail.receivable,
                score: this.data.convertScore,
                scoreDeductible: this.data.convertPrice * 100,
                receiptVolume: carFeeDetail.receiptVolume,
                receiptDeductible: carFeeDetail.receiptDeductible || 0,
                memberDeductible: carFeeDetail.memberDeductible || 0,
                fullDeductible: carFeeDetail.fullDeductible || 0,
                feeNumber
            },
            success: res => {
                if (res.data.code == 200) {
                    let data = res.data.data;
                    if (feeNumber > 0) {
                        wx.requestPayment({
                            appId: app.globalData.appid,
                            timeStamp: data.timeStamp,
                            nonceStr: data.nonceStr,
                            package: data.package,
                            paySign: data.paySign,
                            signType: data.signType,
                            success: res => {
                                tracking({
                                    event: '20',
                                    eventState: '支付成功'
                                })
                                this.dialogPay.showDialog();
                                this.setData({
                                    payResult: {
                                        content: '支付成功',
                                        leftText: '',
                                        rightText: '确定',
                                        type: 3
                                    }
                                });
                                tracking({
                                    event: '07',
                                    eventState: '跳转支付结果'
                                })
                                wx.navigateTo({
                                    url: '../payInfo/payInfo?isSuccess=true&isDetail=false&id=' + data.id,
                                })
                            },
                            fail: err => {},
                        });
                    }
                } else if (res.data.code == 401) { // 积分支付
                    tracking({
                        event: '20',
                        eventState: '支付成功'
                    })
                    this.dialogPay.showDialog();
                    this.setData({
                        payResult: {
                            content: '支付成功',
                            leftText: '',
                            rightText: '确定',
                            type: 3
                        }
                    });
                    tracking({
                        event: '07',
                        eventState: '跳转支付结果'
                    })
                    wx.navigateTo({
                        url: '../payInfo/payInfo?isSuccess=true&isDetail=false&id=' + res.data.data.id,
                    })
                } else {
                    tracking({
                        event: '20',
                        eventState: '支付失败'
                    })
                    this.dialogPay.showDialog();
                    this.setData({
                        payResult: {
                            content: res.data.msg || '支付失败',
                            leftText: '',
                            rightText: '确定',
                            type: 0
                        }
                    });
                }
            },
            fail: res => {}
        });
    },

    onConvertClick() {
        tracking({
            event: '07',
            eventState: '跳转积分抵扣'
        })
        wx.navigateTo({
            url: '../parkConvert/parkConvert?maxScore=' + this.data.carInfo.maxScore + '&scoreMinutes=' + scoreMinutes + '&carNumber=' + carNumber,
        })
    },

    onCouponClick() {
        wx.navigateTo({
            url: '../parkCoupon/parkCoupon',
        })
    },
})