const util = require('../../utils/util.js')
import {
    tracking
} from '../../utils/track.js'
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from "../../utils/httpUtil.js";
const app = getApp();
const everyscoreTomin = 15;
let carRuleInfo = null;
let minInitConv = 0;
let maxInitConv = 0;
let carNumber = 0;

function formatScoreToTime(score) {
    return Number(((score / carRuleInfo.everyScore) * everyscoreTomin).toFixed(0))
}

function LCMEveryScore(maxScore, everyScore) {
    let remainder = maxScore % everyScore;
    if (remainder != 0) return (maxScore - remainder);
    else return maxScore;
}

Page({
    /**
     * 页面的初始数据
     */
    data: {
        inputDisabled: true,
        userScore: 0,
        maxScore: 0,
        maxInitConv: 0,
        maxConv: 0,
        everyScore: 0,
        balance: 0,
        convobj: {
            minConv: 0,
            isSub: true,
            isAdd: true,
        },
    },
    onShow() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getScore(() => {
            carNumber = options.carNumber;
            carRuleInfo = wx.getStorageSync('carRuleInfo');
            let userScore = this.data.balance;
            minInitConv = formatScoreToTime(carRuleInfo.maxScore);
            maxInitConv = options.maxScore > userScore ? userScore : options.maxScore;
            this.setData({
                maxScore: options.maxScore > userScore ? LCMEveryScore(userScore, carRuleInfo.everyScore) : LCMEveryScore(options.maxScore, carRuleInfo.everyScore),
                maxInitConv: options.maxScore > userScore ? userScore : options.maxScore,
                userScore: userScore,
                maxConv: carRuleInfo.maxScore,
                everyScore: carRuleInfo.everyScore,
                ['convobj.isSub']: carRuleInfo.maxScore < carRuleInfo.everyScore ? true : false,
                ['convobj.minConv']: options.scoreMinutes || 0
            })
            if (app.globalData.customerScore >= 0) {
                this.setData({
                    maxScore: LCMEveryScore(app.globalData.customerScore, carRuleInfo.everyScore),
                    ['convobj.minConv']: app.globalData.customerMinConv,
                    ['convobj.isAdd']: app.globalData.customerScore < userScore ? false : true,
                    ['convobj.isSub']: app.globalData.customerScore == 0 ? true : false
                })
                return;
            }
            if (options.maxScore > userScore) {
                this.getScoreDeductible(userScore, res => {
                    this.setData({
                        ['convobj.minConv']: res.scoreMinutes
                    })
                })
            }
        });

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
                    cb();
                } else {
                    _this.data.balance = 0;
                    cb();
                }
            },
            fail: function(res) {
                this.data.balance = 0;
                cb();
            }
        })
    },

    onSubClick() {
        if (this.data.maxScore < carRuleInfo.everyScore) {
            let nowConv = this.data.maxScore;
            this.setData({
                maxScore: nowConv,
                ['convobj.isSub']: true,
                ['convobj.isAdd']: false,
                ['convobj.minConv']: formatScoreToTime(nowConv)
            })
            return;
        }
        if (this.data.maxScore == (0 + carRuleInfo.everyScore)) {
            this.setData({
                convobj: {
                    isSub: true,
                }
            });
        }
        let nowConv = this.data.maxScore - carRuleInfo.everyScore;
        this.setData({
            maxScore: nowConv,
            ['convobj.isAdd']: false,
            ['convobj.minConv']: formatScoreToTime(nowConv)
        })
    },

    onAddClick() {
        if (this.data.maxScore + carRuleInfo.everyScore > maxInitConv) {
            let nowConv = this.data.maxScore;
            this.setData({
                maxScore: nowConv,
                ['convobj.isAdd']: true,
                ['convobj.isSub']: false,
                ['convobj.minConv']: formatScoreToTime(nowConv)
            })
            return;
        }

        if (this.data.maxScore == maxInitConv - carRuleInfo.everyScore) {
            this.setData({
                convobj: {
                    isAdd: true,
                }
            });
        }
        let nowConv = this.data.maxScore + carRuleInfo.everyScore;
        this.setData({
            maxScore: nowConv,
            ['convobj.isSub']: false,
            ['convobj.minConv']: formatScoreToTime(nowConv)
        })
    },

    onOkClick() {
        app.globalData.customerScore = this.data.maxScore;
        app.globalData.customerMinConv = this.data.convobj.minConv;

        wx.navigateBack({
            delta: 1,
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

})