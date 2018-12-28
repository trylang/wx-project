const app = getApp()
const util = require('../../../utils/util.js');
// const WxParse = require('../wxParse/wxParse.js');
// const calendar = require('../../components/calendar/index.js');
import {
    config
} from '../../../utils/config.js'
import {
    tracking
} from '../../../rtmap/coupons/utils/track.js'
const date = new Date()
const years = []
const months = []
const days = []
const times = [];

for (let i = 1990; i <= date.getFullYear(); i++) {
    years.push(i)
}

for (let i = 1; i <= 12; i++) {
    months.push(i)
}

for (let i = 1; i <= 31; i++) {
    days.push(i)
}
for (let i = 0; i < 60; i++) {
    if (i < 10) {
        times.push(`0${i}`);
    } else {
        times.push(i)
    }
}
Page({
    //页面变量
    data: {
        uploadImg: false,
        upHide: "up-hide",
        photoImg: "up-hide",
        calendar: 0,
        num: 100,
        tempFilePaths: [],
        imgUrl: [],
        threePhoto: "",
        panthsArr: [],
        ruleText: ["积分规则：",
            // "1、单张消费小票仅限上传一次，如果小票过长可分段上传，最多可上传3张，在多张上传时，须确保出自同一张小票，否则将作废本次申请。",
            // "2、拍照上传消费小票时，请务必保持照片清晰完整（如订单编号、订单时间、消费店铺、消费金额）。",
            // "3、当日消费小票48小时内拍照上传有效。",
            // "4、您的消费小票上传完成后，我们会尽快受理积分，在此期间请您保留小票以便核对，如有疑问，可拨打"+config.phone+"咨询。"
        ],
        foolrArray: [],
        foolr: '',
        foolrId: '',
        storeName: '',
        storeArry: [],
        stores: [],
        store: '',
        storeId: '',
        years: years,
        year: date.getFullYear(),
        months: months,
        month: date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1,
        days: days,
        day: date.getDate() < 10 ? `0${date.getDate()}` : date.getDate(),
        times: times,
        hour: '00',
        min: '00',
        second: '00',
        sum: '',
        value: [9999, date.getMonth() + 1, date.getDate()-1, '00', '00', '00'],
        handleclick: '',
        buttonClicked: false
    },
    //事件处理函数
    bindChange: function(e) {
        const val = e.detail.value
        this.setData({
            year: this.data.years[val[0]],
            month: this.data.months[val[1]] < 10 ? `0${this.data.months[val[1]]}` : this.data.months[val[1]],
            day: this.data.days[val[2]] < 10 ? `0${this.data.days[val[2]]}` : this.data.days[val[2]]
        })
    },
    getStore: function(e) {
        console.log(e)
    },
    getStoreItemInfo: function(e) {
        this.setData({
            storeId: e.detail.storeId,
            storeName: e.detail.storeName,
            calendar: ''
        })
    },
    formSubmit: function(e) {
        tracking({
            event: '12',
            eventState: '立即提交'
        })
        var form = e.detail.value;
        let that = this;
        var isLoginSucc = wx.getStorageSync("isLoginSucc");
        if (!isLoginSucc) {
            wx.navigateTo({
                url: "../../../pages/login/login"
            })
            return;
        }
        // var panthsArr=wx.getStorageSync('panthsArr');
        var tempFilePaths = that.data.tempFilePaths.length > 0 ? that.data.tempFilePaths : [];
        if (tempFilePaths.length <= 0) {
            wx.showToast({
                title: '请选择图片',
                icon: 'none',
                duration: 2000
            });
            return;
        };
        if (that.data.photoIndex == '' || that.data.tempFilePaths.length <= 0) {
            return;
        };
        if (form.receiptNumber == '') {
            wx.showToast({
                title: '请输入小票单号',
                icon: 'none',
                duration: 2000
            });
            return;
        };
        if (form.store == '') {
            wx.showToast({
                title: '请输入店铺名称',
                icon: 'none',
                duration: 2000
            });
            return;
        };
        if (form.sum == '') {
            wx.showToast({
                title: '请输入金额',
                icon: 'none',
                duration: 2000
            });
            return;
        };
        that.setData({
            buttonClicked: true
        })
        var mobile = wx.getStorageSync('mobile');
        var member = wx.getStorageSync('member');
        wx.Request({
            url: config.BaseUrl + util.portsEndUrl.getUpload,
            data: {
                images: tempFilePaths,
                portalId: config.tenantId,
                receiptNumber: form.receiptNumber || '', // 小票单号
                shoppingTime: form.times,
                shoppingFee: form.sum * 100 || 100,
                storeId: that.data.storeId,
                storeName: that.data.storeName,
                mobile: mobile,
                //    cardno:member.member.cardNo,
                //    store:that.data.foolrId+'-'+that.data.store,
                //    floor:that.data.foolr,
                //    buildId:that.data.buildId
            },
            method: 'post',
            success: function(res) {
                if (res.data.status != 200) {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none',
                        duration: 2000
                    });
                    that.setData({
                        buttonClicked: false
                    })
                } else {
                    that.setData({
                        photoIndex: ""
                    });
                    that.setData({
                        photoImg: "up-hide"
                    });
                    that.setData({
                        tempFilePaths: [],
                        upHide: '',
                        buttonClicked: false
                    });
                }
                
            },
            fail: function(res) {
                that.setData({
                    buttonClicked: false
                });
            }
        });
    },

    formReset: function(e) {
        console.log(e);
    },
    getStores: function() {
        let that = this;
        var store = [];
        wx.Request({
            url: config.BaseUrl + util.portsEndUrl.getList,
            data: {
                portalId: config.tenantId,
                keyWords: ''
            },
            method: 'post',
            success: function(res) {
                that.setData({
                    storeArry: res.data.data,
                    stores: res.data.data
                })
                
            },
            fail: function(res) {
                console.log(res)
            }
        });
    },
    getRules: function() {
        let that = this;
        var store = [];
        wx.Request({
            url: config.BaseUrl + util.portsEndUrl.getRule,
            data: {
                portalId: config.tenantId,
            },
            method: 'post',
            success: function(res) {
                if (!res.data.data) return '';
                let rule = res.data.data.rule;
                // let ruleText = WxParse.wxParse('rule', 'html', rule, that, 5);
                that.setData({
                    ['ruleText[1]']: res.data.data.rule
                })
            },
            fail: function(res) {
                console.log(res)
            }
        });
    },
    bindStore: function(e) {
        let that = this;
        var index = e.detail.value[0];
        var i = e.detail.value[1];
        var store = that.data.storeArry[index];
        that.setData({
            num: index,
            storeId: store.id,
            storeName: store.name
        });
    },
    hideUp: function() {
        var that = this;
        that.setData({
            upHide: "up-hide"
        });
        this.setData({
            tempFilePaths: []
        });
    },
    goRecord: function() {

        // this.setData({tempFilePaths:[]});
        var isLoginSucc = wx.getStorageSync("isLoginSucc");
        if (!isLoginSucc) {
            wx.navigateTo({
                url: `${app.globalData.loginPath}?from=拍照积分`
            })
            return;
        }
        tracking({
            event: '12',
            eventState: '查看积分记录'
        })
        this.data.uploadImg = false;
        wx.navigateTo({
            url: "../record/index"
        })
    },
    showCalendar: function(e) {
        this.setData({
            calendar: ""
        });
    },
    hideCalendar: function(e) {
        var isLoginSucc = wx.getStorageSync("isLoginSucc");
        var num = e.currentTarget.dataset.show;
        this.setData({
            handleclick: ''
        });
        if (num != 0) {
            this.setData({
                handleclick: 'handleclick'
            });
            if (!isLoginSucc) {
                wx.navigateTo({
                    url: `${app.globalData.loginPath}?from=拍照积分`
                })
                return;
            }
            if (num == 1) {
                if (this.data.storeArry.length === 0) {
                    this.setData({
                        record: ""
                    });
                }
            }
            if (num == 2) {
                let month = this.data.month < 10 ? this.data.month.slice(1) : this.data.month;
                let day = this.data.day < 10 ? this.data.day.slice(1) : this.data.day;
                let hour = this.data.hour;
                let min = this.data.min;
                let second = this.data.second;
                this.setData({
                    value: [this.data.year, month, day-1, hour, min, second]
                })
            }
        };
        this.setData({
            calendar: num
        });
    },
    bindcalendar: function(e) {
        const val = e.detail.value       
        this.setData({
            year: this.data.years[val[0]],
            month: this.data.months[val[1]] < 10 ? `0${this.data.months[val[1]]}` : this.data.months[val[1]],
            day: this.data.days[val[2]] < 10 ? `0${this.data.days[val[2]]}` : this.data.days[val[2]],
            hour:  this.data.times[val[3]],
            min: this.data.times[val[4]],
            second: this.data.times[val[5]],
        })
    },
    photoDel: function(e) {
        var that = this;
        var num = e.currentTarget.dataset.num;
        that.data.tempFilePaths.splice(num, 1);
        that.setData({
            tempFilePaths: that.data.tempFilePaths
        });
        that.setData({
            num: num
        });
        that.setData({
            threePhoto: ""
        });
        if (that.data.tempFilePaths <= 0) {
            that.setData({
                photoImg: 'up-hide'
            });
            that.setData({
                photoIndex: ''
            });
        };
    },
    getPhoto: function() {
        var isLoginSucc = wx.getStorageSync("isLoginSucc");
        if (!isLoginSucc) {
            wx.navigateTo({
                url: `${app.globalData.loginPath}?from=拍照积分`
            })
            return;
        }
        var that = this;
        that.setData({
            hideImg: '',
            uploadImg: true
        });
        wx.chooseImage({
            count: 3, // 默认9
            success: function(res) {
                var panths = res.tempFilePaths;
                console.log("----------------getPhoto")
                that.setData({
                    ['photoImg']: ""
                });
                that.setData({
                    ['photoIndex']: "up-hide"
                });
                that.setData({
                    ['panthsArr']: panths
                });
                console.log(that.data.panthsArr)
                if (that.data.panthsArr.length > 0) {
                    that.dualImg(0);
                }
            }
        });
    },
    dualImg: function(index) {
        console.log("------------------dualImg")
        if (this.data.panthsArr.length > 0 && index < this.data.panthsArr.length) {
            var that = this
            wx.uploadFile({
                url: config.BaseUrl + 'weimao-new-project/weiXin/savePhone', 
                //   url: config.BaseUrl +'coupon-mall/common/file/upload',
                filePath: this.data.panthsArr[index],
                name: 'file',
                header: {
                    'content-type': 'multipart/form-data'
                },
                success: function(res) {
                    if (res.statusCode == 200) {
                        var data = JSON.parse(res.data);
                        var imgs = that.data.tempFilePaths.length == 0 ? [] : that.data.tempFilePaths;
                        imgs.push(data.resultMapList[0].finalUrl);
                        if (imgs.length > 3) {
                            imgs.splice(0, 1);
                        };
                        that.setData({
                            tempFilePaths: imgs
                        });
                        that.dualImg(index + 1);
                    } else {
                        wx.showToast({
                            title: '上传图片失败，请稍后再试',
                            icon: 'none',
                            duration: 2000,
                            mask: true
                        })
                    }

                }
            });

        } else {
            if (this.data.tempFilePaths.length >= 3) {
                this.setData({
                    threePhoto: "up-hide"
                });
            };
        }
    },
    submitImg: function() {
        var that = this;
        that.setData({
            upHide: "up-hide"
        });
    },
    onLoad: function() {
        var openId = wx.getStorageSync('openid');
        var keyAdmin = wx.getStorageSync('keyAdmin');
        var buildList = wx.getStorageSync('buildList');
        var that = this;
        that.setData({
            buildId: buildList[0].buildIdStr
        });
        that.setData({
            openId: openId
        });
        that.setData({
            keyAdmin: keyAdmin
        });
        that.getRules();
        that.getStores();
    },
    onShow: function() {
        this.formReset();
        var that = this;
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },
    onHide() {
        if (!this.data.uploadImg) {
            this.setData({
                upHide: "up-hide",
                storeName: '',
                receiptNumber: '',
                year: date.getFullYear(),
                month: date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1,
                day: date.getDate() < 10 ? `0${date.getDate()}` : date.getDate(),
                hour: '00',
                min: '00',
                second: '00',
                sum: ''
            });
        }

    },
    handleclick() {},
    getUserInfo: function(e) {

    },

})