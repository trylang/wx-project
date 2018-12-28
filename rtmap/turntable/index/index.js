//获取应用实例
const app = getApp()
import { tracking } from '../../coupons/utils/track.js'
import { requestEndPoints, httpWithParameter, postRequestWithParameter } from '../utils/httpUtil.js';
// var wxParse = require('../../../pages/components/wxparse/wxparse.js');
// import '../../../utils/tween.js'

var ctx,ctx2;//创建id为canvasI的绘图，//创建id为bgCanvas的背景绘图
var w1 = '', h1 = '', activityId = '';
Page({
    data: {
        //转盘积分兑换变量
        score: 0,
        score_count: 0,
        pre_score: 10,
        integralSX: 0,//每天最大可兑换次数
        type_icon: 'cancel',
        icon_title: '兑换失败',
        isScoreShow: false,
        changeBtn: false,//积分兑换成功与否的弹框控制

        isGetShow: false,//是否获奖弹窗
        chanceNum: 0,//剩余机会
        //弹框变量
        bgColor: '#fff',
        activityDetail: '',
        modal_title: '',
        modal_content: '',
        backBtn: false,

        activityId: '',
        isLogin: false,
        //分享变量
        shareTitle: '',
        shareImage: '',
        animationData: '',
        homePageImage: '',
        turntableRegionId: 0,//中奖区域
        trunBtn: true,//是否可以点击转
        //转盘样式
        turntableImage: '',
        cryLogo: '../../../images/new_gift/cry.png',
        bg_color: '',
        rule_color: '',
        rule_Bg: '',
        tempFilePath: '',
        couponTitle: '',
        ruleImage: '',
        winningImage: '',
        loginName: '',
        canYuCount: 0,
        modal_logo: '',
        pricelist: [],
        content: '<p>暂无规则</p>',
        itemsNum: 6, //大转盘等分数
        itemsArc: 0, //大转盘每等分角度
        color: ["#ffef8e", "#fffcd1", "#FFD8A7"],//扇形的背景颜色交替；
        coupons: [],//每个扇形中的优惠券
        isRotate: 0,//旋转角度
        isFromShare: 'false',
        isMove: false,
        isShare: false,
        allConfig: {},
        activityDay: '',
        turn_evenColor: '#ff484c',
        turn_oldColor: '#fff',
    },

    onPullDownRefresh() {
        let that = this;
        // wx.setBackgroundTextStyle({
        //     textStyle: 'dark'
        // })
        that.getActivityInfo();
        that.getWinnerList();
        that.getGiftList();
        // wx.hideLoading();
        setTimeout(function () {
            wx.stopPullDownRefresh()
        }, 500);
    },
    //生命周期函数--监听页面加载
    onLoad: function (options) {
        if (options && options.openId) {
            // this.setData({
            //     newActivityId: options.activityId
            // })
            this.recodeShareInfo(options.portalId, options.activityId, options.openId, options.secret)
        };
        this.setData({
            isFromShare: options.isFromShare || 'false',
        })

    },
    onShow() {
        ctx = wx.createCanvasContext("canvasI", this); //创建id为canvasI的绘图
        ctx2 = wx.createCanvasContext("bgCanvas", this);//创建id为bgCanvas的背景绘图
        this.getActivityInfo();
        this.getGiftList();
        if (wx.getStorageSync("isLoginSucc") && app.globalData.isMemberRegistTurn) {//登录并且是小程序新用户
            this.registerHandler();
        }
        this.setData({
            isLogin: wx.getStorageSync('isLoginSucc')
        })
        let isLogin = this.data.isLogin;
        if (isLogin) {
            this.setData({
                loginName: '积分得抽奖机会'
            })
        } else {
            this.setData({
                loginName: '注册得抽奖机会'
            })
        }
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },
    getActivityInfo(){
        let requestData = {
            portalId: app.globalData.tenantId
        },that = this;
        httpWithParameter({
            endPoint: requestEndPoints.basicAllInfo,
            data: requestData,
            success: (res) => {
                if (res.data.status == '200') {
                    if (res.data.data.activityInfo.activityId && res.data.data.activityInfo.activityStatus == 1){
                        activityId = res.data.data.activityInfo.activityId;
                        that.getRaffingTimes(res.data.data.activityInfo.activityId);
                        that.getWinnerList(res.data.data.activityInfo.activityId);
                        this.shareOption(res.data.data.activityInfo.activityId);
                        that.setData({ 
                            allConfig: res.data.data,
                            activityDay: res.data.data.activityInfo.activityType==1?res.data.data.activityInfo.activityStartDay.replace(/-/g, '.') + '-' + res.data.data.activityInfo.activityEndDay.replace(/-/g, '.'):'长期有效',
                            activityId: res.data.data.activityInfo.activityId
                        });
                    }else{
                        wx.showToast({
                            title: '活动未开启',
                            icon: 'none'
                        })
                    }
                } else {
                    wx.showToast({
                        title: '活动未开启',
                        icon: 'none'
                    })
                    setTimeout(function () {
                        wx.switchTab({ url: '/pages/index/index' })
                    },500)
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                })
            }
        })
    },
    getRaffingTimes(activityId) {
        let that = this;
        let requestData = {
            portalId: app.globalData.tenantId,
            activityId: activityId,
            openId: wx.getStorageSync('openid')
        }
        postRequestWithParameter({ //获取多少次机会
            endPoint: requestEndPoints.rafflingTimes,
            data: requestData,
            success: (res) => {
                if(res.data.status == '200') {
                    if (!wx.getStorageSync('isLoginSucc')) {
                        that.setData({ chanceNum: '0' });
                    } else {
                        that.setData({chanceNum: res.data.data.times })
                    }
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                })
            }
        })
        postRequestWithParameter({ //获取多少人参与
            endPoint: requestEndPoints.actorCount,
            data: { portalId: app.globalData.tenantId, activityId: activityId,},
            success: (res) => {
                if (res.data.status == '200') {
                    // if (!wx.getStorageSync('isLoginSucc')) {
                    //     that.setData({ canYuCount: '-' });
                    // } else {
                        that.setData({
                            canYuCount: res.data.data.count

                        })
                    // }
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                })
            }
        })
    },
    registerHandler(){ //新用户注册赠次数
        let params = {
            portalId: app.globalData.tenantId,
            activityId: activityId,
            openId: wx.getStorageSync('openid'),
            crmId: wx.getStorageSync('member').cid,
            mobile: wx.getStorageSync('mobile'),
            nickName: app.globalData.WxUserInfo.nickName,
            headPortrait: app.globalData.WxUserInfo.avatarUrl
        }
        postRequestWithParameter({
            endPoint: requestEndPoints.userRegister,
            data: params,
            success: (res) => {
                if (res.data.status == '200') {
                    this.getRaffingTimes();
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                })
            }
        })
    },
    hiddenModal() {
        this.setData({
            isGetShow: false
        })
    },

    /*跳转奖品页面*/
    handleLinkPrice() {
        if (!wx.getStorageSync("isLoginSucc")) {
            this.handleLinkLogin();
            return;
        }
        wx.navigateTo({
            url: '../prize/prize?activityId=' + activityId,
            success: function (res) {

            },
            fail: function (res) {
            }
        })
        this.setData({
            isGetShow: false
        })
    },
    /*跳转首页*/
    handleLinkIndex() {
        tracking({
            event: '07',
            eventState: '返回首页'
        })
        wx.switchTab({
            url: '/pages/index/index',
            success: function (res) {
            },
            fail: function (res) {
            }
        })
    },
    showShareHandler(){
        if (!wx.getStorageSync("isLoginSucc")) {
            this.handleLinkLogin();
            return;
        }
    },
    /*分享*/
    onShareAppMessage(res) {
        if (!wx.getStorageSync("isLoginSucc")) {
            this.handleLinkLogin();
            return;
        }
        //埋点数据
        tracking({
            event: '02',
            eventState: '转发'
        })
        this.shareOption();
        this.setData({ isGetShow: false })
        let newPath = '/rtmap/turntable/index/index?portalId=' + app.globalData.tenantId + '&openId=' + wx.getStorageSync('openid') + '&activityId=' + this.data.activityId + "&isFromShare=true" + "&secret=" + this.data.secret;
        return {
            title: this.data.shareTitle,
            path: newPath,
            imageUrl: this.data.shareImage,
            success: res => {
                // this.shareInsert();
            },
            error: res => {
                this.setData({
                    isGetShow: false
                })
            }
        }
    },
    shareOption(){
        let that = this;
        postRequestWithParameter({ //获取分享密钥
            endPoint: requestEndPoints.getSecret,
            data: { portalId: app.globalData.tenantId, activityId: activityId, openId: wx.getStorageSync('openid') },
            success: (res) => {
                if (res.data.status == '200') {
                    that.setData({ secret: res.data.data.secret})
                }
            }
        })
    },
    //页面滑动监听
    onPageScroll(res) {
        if (this.data.isMove) return;
        this.setData({
            isMove: true
        });
        setTimeout(() => {
            this.setData({
                isMove: false
            });
        }, 800);
    },
    /*分享后次数增长接口*/
    shareInsert() {
        let that = this;
        let requestData = {
            portalId: app.globalData.tenantId,
            activityId: this.data.activityId,
            openId: wx.getStorageSync('openid')
        }
        postRequestWithParameter({
            endPoint: requestEndPoints.shareBack,
            data: requestData,
            success: (res) => {
                if (res.data.status == '200') {
                    this.getRaffingTimes(activityId);
                }else{
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none'
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.data.message || res.message,
                    icon: 'none'
                })
            }
        })
    },
    /*由分享出去的页面点进来调用此接口*/
    recodeShareInfo(portalId, activityId, openId, secret) {
        let that = this;
        let requestData = {
            portalId: portalId,
            activityId: activityId,
            openId: openId,
            secret: secret
        }
        postRequestWithParameter({
            endPoint: requestEndPoints.shareRead,
            data: requestData,
            success: (res) => {
                if (res.data.status == '200') {
                    
                }
            }
        })
    },
    /*抽奖接口，抽完获取是否中奖 以及中奖区域*/
    handleChoujiang() {
        let userInfo = wx.getStorageSync('userInfo');
        let That = this;
        if (That.data.chanceNum > 0) {
            let requestData = {
                portalId: app.globalData.tenantId,
                activityId: activityId,
                openId: wx.getStorageSync('openid'),
                nickName: userInfo ? userInfo.nickName : '',
                avatarUrl: userInfo ? userInfo.avatarUrl : ''
            }
            postRequestWithParameter({
                endPoint: requestEndPoints.boardPlay,
                data: requestData,
                success: (res) => {
                    if (res.data.status == '200') {
                        if (That.data.itemsNum > 0){
                            var endRotate = That.data.isRotate - That.data.isRotate % 360 + 360*5   - That.data.itemsArc * res.data.data.area;
                            That.setData({ itemsNum: That.data.itemsNum })
                        }else{
                            let arr = []
                            for (let i = 0; i < That.data.coupons.length; i++) {
                                if (That.data.coupons[i].validateStatus === 111) {
                                    arr.push(That.data.coupons[i].boradAreaNumer)
                                }
                            }
                            var n = That.data.itemsNum
                            var endRotate = That.data.isRotate - That.data.isRotate % 360 + 360 * 5 - That.data.itemsArc * res.data.data.area;
                            That.setData({ boradAreaNumer: arr[n]})
                        }
                        That.getRaffingTimes(activityId);
                        Math.animation(That.data.isRotate, endRotate, 3000, 'Quad.easeInOut', function (value, isEnding) {
                            That.setData({ isRotate: value })
                            if (isEnding) {
                                That.setData({
                                    // chanceNum: That.data.chanceNum - 1,
                                    couponTitle: res.data.couponJson ? JSON.parse(res.data.couponJson).mainInfo : ''
                                })
                                if (res.data.data.prize) {
                                    That.getWinnerList(activityId);
                                    That.setData({
                                        isGetShow: true,
                                        modal_title: '恭喜您！中奖啦!',
                                        backBtn: false,
                                        trunBtn: true,
                                        modal_content: res.data.data.prize.mainInfo,
                                        modal_logo: '../../../images/turntable/gift.png',
                                        bgColor: '#FFF6E7'
                                    })
                                } else {
                                    That.setData({
                                        isGetShow: true,
                                        backBtn: false,
                                        trunBtn: true,
                                        modal_title: res.data.message,
                                        modal_content: '',
                                        modal_logo: '../../../images/turntable/empty.png',
                                        bgColor: '#ffffff'
                                    })
                                }
                            }
                        })
                    }else{
                        wx.showToast({
                            title: res.data.message,
                            icon: 'none'
                        })
                        That.setData({
                            trunBtn: true
                        })
                    }
                },
                fail: (res) => {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none'
                    })
                    That.setData({
                        trunBtn: true
                    })
                }
            })
        } else {
            That.setData({
                isGetShow: true,
                modal_title: '抱歉，您的次数已经用光！',
                modal_content: '',
                backBtn: true,
                modal_logo: '../../../images/turntable/empty.png',
                bgColor: '#fff'
            })
            That.setData({
                trunBtn: true
            })
        }
    },
    /*未登录时候的判断，跳入登录页面*/
    handleLinkLogin() {
        tracking({
            event: '07',
            eventState: '登录注册'
        })
        wx.navigateTo({
            url: '/pages/login/login?sourceid=' + this.data.activityId +'&from=幸运转盘' +'&isMemberRegistTurntable=true',
            success: function (res) {
            },
            fail: function (res) {
            }
        })
    },
    /*点击抽奖的判断*/
    getStart() {
        this.setData({
            trunBtn: false
        });
        let openid = wx.getStorageSync('openid');
        let isLogin = wx.getStorageSync('isLoginSucc');
        let mobile = wx.getStorageSync('mobile');
        let member = wx.getStorageSync('member');
        let That = this;
        let that = this;
        if (isLogin) {
            this.handleChoujiang()
        } else {
            That.setData({
                trunBtn: true
            })
            That.handleLinkLogin()
        }
    },
    b64DecodeUnicode(str) {
        if (str) {
            return decodeURIComponent(atob(str).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
        }
    },
    /*中奖信息列表*/
    getWinnerList(activityId) {
        let that = this;
        let requestData = {
            portalId: app.globalData.tenantId,
            activityId: activityId
        }
        postRequestWithParameter({ //获取中奖人列表
            endPoint: requestEndPoints.winnerList,
            data: requestData,
            success: (res) => {
                if (res.data.status == '200') {
                    let result= res.data.data.list;
                    result = result.map(item=>{
                        return {
                            mainInfo: item.mainInfo,
                            avatarUrl: item.avatarUrl,
                            nickName: item.nickName ? item.nickName.substr(0, 1) + '**' + item.nickName.substr(4, item.nickName.length) : '***'
                            // nickName: item.nickName ? that.b64DecodeUnicode(item.nickName).substr(0, 2) + '**' + that.b64DecodeUnicode(item.nickName).substr(4, 7) : '***'
                        }
                    })
                    that.setData({ pricelist: result.length > 4 ? result.slice(0, 4) : result })
                    
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                })
            }
        })
    },
    /*积分兑换弹窗*/
    handleShowScoreModal() {
        if (!wx.getStorageSync("isLoginSucc")) {
            this.handleLinkLogin();
            return;
        }
        tracking({
            event: '12',
            eventState: '积分兑换'
        })
        let that = this;
        let requestData = {
            portalId: app.globalData.tenantId,
            activityId: that.data.activityId,
            openId: wx.getStorageSync('openid')
        }
        postRequestWithParameter({ //积分兑换规则
            endPoint: requestEndPoints.ruleList,
            data: requestData,
            success: (res) => {
                if (res.data.status == '200') {
                    if (res.data.data.times<=0){
                        that.setData({
                            isScoreShow: true,
                            changeBtn: true,
                            isShare: true,
                            type_icon: 'cancel',
                            icon_title: '您的抽奖机会已用完，分享给朋友可获得一次抽奖机会'
                        })
                    }else{
                        that.setData({
                            score: res.data.data.integral,
                            times: res.data.data.times,
                            fee: res.data.data.rule.fee,
                            isScoreShow: true,
                            changeBtn: false
                        })
                    }
                } else {
                    wx.showToast({
                        title: res.data.message,
                        icon: 'none'
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                })
            }
        })
    },
    /*关闭积分兑换弹窗*/
    closeScoreModal() {
        this.setData({
            isScoreShow: false,
            changeBtn: false,
        })
    },
    /*关闭是否分享弹窗*/
    closeShareModal(){
        this.setData({
            // changeBtn: false,
            isScoreShow: false,
            isShare: false
        })
    },
    /*扣减积分兑换次数*/
    handleReduceScore(){
        let that = this;
        let requestData = {
            portalId: app.globalData.tenantId,
            activityId: that.data.activityId,
            openId: wx.getStorageSync('openid')
        }
        postRequestWithParameter({ //积分兑换次数
            endPoint: requestEndPoints.integralChange,
            data: requestData,
            success: (res) => {
                if (res.data.status == '200') {
                    that.getRaffingTimes(that.data.activityId);
                    that.setData({
                        changeBtn: true,
                        isShare: false,
                        type_icon: 'success',
                        icon_title: '兑换成功'
                    })
                } else {
                    that.setData({
                        // changeBtn: true,
                        isShare: false,
                        isScoreShow: false,
                        type_icon: 'cancel',
                        icon_title: res.data.message
                    })
                }
            },
            fail: (res) => {
                that.setData({ isScoreShow: false})
                wx.showToast({
                    title: res.data.message,
                    icon: 'none'
                })
            }
        })
    },
    /*获取获奖信息情况*/
    getGiftList() {
        let openid = wx.getStorageSync('openid');
        let mobile = wx.getStorageSync('mobile');
        let That = this;
        const params = {
            portalId: app.globalData.tenantId,
        }
        httpWithParameter({
            endPoint: requestEndPoints.basicAllInfo,
            data: params,
            success: (res) => {
                if (res.data.status == '200') {
                    let result = res.data.data;
                    That.setData({
                        // activityDetail: result.turntableActivity,
                        homePageImage: result.pageConfig.backgroundImage,   //页面背景图
                        turntableImage: result.pageConfig.boardImage,       //转盘图片
                        bg_color: JSON.parse(result.pageConfig.colors)[0],  //页面背景色
                        left_bg: JSON.parse(result.pageConfig.colors)[1],  //左侧按钮背景色
                        left_color: JSON.parse(result.pageConfig.colors)[2],  //左侧按钮字体色
                        right_bg: JSON.parse(result.pageConfig.colors)[3],  //右侧按钮背景色
                        right_color: JSON.parse(result.pageConfig.colors)[4],  //右侧按钮字体色
                        rule_Bg: JSON.parse(result.pageConfig.colors)[5],   //规则背景色
                        rule_color: JSON.parse(result.pageConfig.colors)[6],//规则字体色
                        turn_evenColor: JSON.parse(result.pageConfig.colors)[7],//转盘基数字体色
                        turn_oldColor: JSON.parse(result.pageConfig.colors)[8],//转盘偶数字体色
                        shareImage: result.pageConfig.shareImage,           //分享图片
                        ruleImage: result.pageConfig.ruleImage,             //活动规则图片
                        winningImage: result.pageConfig.wonImage,           //中奖信息图片
                        //ruleInfo: result.pageConfig.ruleInfo,               //活动规则
                        shareTitle: result.pageConfig.shareTitle,           //分享标题
                        itemsNum: result.areaCount,                         //大转盘等分数
                        activityId: result.pageConfig.activityId            //活动ID
                    })
                    That.setData({ coupons: [] })
                    for (let i = 0; i < That.data.itemsNum; i++) {
                        That.data.coupons.push({
                            validateStatus: 111,
                            boradAreaNumer: i+1
                        })
                        if (result.prize.length) {
                            for (let j = 0; j < result.prize.length; j++) {
                                if (result.prize[j].boradAreaNumer == That.data.coupons[i].boradAreaNumer) {
                                    That.data.coupons[i] = result.prize[j]
                                }
                            }
                        }
                    }
                    let itemsArc = 360 / That.data.itemsNum;
                    That.setData({ coupons: That.data.coupons})
                    let info = result.pageConfig.ruleInfo ? result.pageConfig.ruleInfo : '<p>暂无规则</p>'
                    // wxParse.wxParse("content", "html", info, That, 0);

                    That.setData({
                        itemsArc
                    }, function () {
                        wx.createSelectorQuery().select('#canvas-one').boundingClientRect(function (rect) {
                            w1 = parseInt(rect.width / 2);
                            h1 = parseInt(rect.height / 2);
                            That.Items(itemsArc);//每一份扇形的内部绘制。
                        }).exec()
                    })
                }
            },
            fail: (res) => {
                wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    duration: 2000
                })
                setTimeout(function () {
                    tracking({
                        event: '07',
                        eventState: '返回上一级'
                    })
                    wx.navigateBack({ //返回上一级
                        delta: 1,
                        success: function (res) {
                        },
                        fail: function (res) {
                        }
                    })

                }, 1000);
            }
        })
    },
    /*绘制转盘的每个区域*/
    Items(e) {
        let that = this;
        let itemsArc = e;//每一份扇形的角度
        let Num = that.data.itemsNum;//等分数量
        let text = that.data.coupons;//放文字的数组
        if (text.length > Num) {
            text.slice(0, Num - 1)
        }
        for (let i = 0; i < Num; i++) {
            ctx.fill();
            ctx.save();

            ctx.beginPath();
            ctx.moveTo(w1, h1);
            ctx.arc(w1, h1, w1 - 2, itemsArc * i * Math.PI / 180, (itemsArc + itemsArc * i) * Math.PI / 180);//绘制扇形
            ctx.closePath();
            const colorList = ['#01a1dd', '#fffdec', '#fe5921', '#fffdec', '#fccc00', '#fffdec']
            ctx.setFillStyle(colorList[i % 6]);

            ctx.beginPath();
            ctx.translate(w1, h1);//将原点移至圆形圆心位置
            ctx.rotate((itemsArc * (i + 1)) * Math.PI / 180);//旋转文字
            if (Num >= 6) {
                ctx.setFontSize(18);//设置文字字号大小
            } else {
                ctx.setFontSize(20);//设置文字字号大小
            }
            if (i % 2 == 0) {
                ctx.setFillStyle(that.data.turn_evenColor);//设置文字颜色
            } else {
                ctx.setFillStyle(that.data.turn_oldColor);//设置文字颜色
            }
            ctx.setTextAlign("center");//使文字垂直居中显示
            ctx.setTextBaseline("middle");//使文字水平居中显示
            if (text[i].validateStatus == '5' || text[i].validateStatus == '111') {
                ctx.fillText('谢谢', 0, -(h1 * 0.80));
                ctx.setFontSize(18);//设置文字字号大小
                ctx.fillText('参与', 0, -(h1 * 0.65));
            } else {
                if (text[i].boradAreaTitle.length < 7) {
                    ctx.setFontSize(18);//设置文字字号大小
                    ctx.fillText(text[i].boradAreaTitle, 0, -(h1 * 0.75));
                } else if (text[i].boradAreaTitle.length >= 7 && text[i].boradAreaTitle.length <= 10) {
                    let len = Math.ceil(text[i].boradAreaTitle.length / 2)
                    ctx.fillText(text[i].boradAreaTitle.slice(0, len), 0, -(h1 * 0.80));
                    ctx.fillText(text[i].boradAreaTitle.slice(len), 0, -(h1 * 0.65));
                    ctx.setFontSize(28);//设置文字字号大小
                } else {
                    let boradAreaTitle = text[i].boradAreaTitle.slice(0, 10) + '...'
                    ctx.fillText(boradAreaTitle.slice(0, 6), 0, -(h1 * 0.80));
                    ctx.fillText(boradAreaTitle.slice(6, 13), 0, -(h1 * 0.65));
                    ctx.setFontSize(28);//设置文字字号大小
                }
            }
            ctx.restore();//保存绘图上下文，使上一个绘制的扇形保存住。
        }
        ctx.draw();
        setTimeout(function () {
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: 2 * w1,
                height: 2 * h1,
                destWidth: 8 * w1,
                destHeight: 8 * h1,
                canvasId: 'canvasI',
                success: function (res) {
                    var tempFilePath = res.tempFilePath;
                    that.setData({
                        tempFilePath: res.tempFilePath
                    })
                },
                fail: function (res) {
                    console.log('----------  ', res)
                }
            })
        }, 300);
        ctx.draw(true);//参数为true的时候，保存当前画布的内容，继续绘制
    },
})
