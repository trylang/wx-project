
//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {tracking} from '../../../rtmap/coupons/utils/track.js';
import { handleRequest,giftsEndUrl } from '../../../utils/util_new_gift.js';
Page({
  //页面变量
  	data: {
    	bannerUrl:'' ,
      	score_icon:'../../../images/new_gift/Group8@3x.png',
      	grow:'',
      	coupon:0,
        logoImage:'',
      	dott:'../../../images/new_gift/Oval2@3x.png',
        coupon_isopen:0,
      	couponList:[],
        activity_color:'#ff6559',
      	integralReward:'',
        receive:null,
        couponName:[],
        shareTitle:'新人礼',
        shareImage:'',
      	lineUrl:'../../../images/new_gift/Rectangle3Copy@2x.png',
      	logoIcon:'../../../images/new_gift/Group10@2x.png',
      	grow_icon:'../../../images/new_gift/Group9@2x.png'
  	},

  	onShareAppMessage(res){
            //埋点数据
            tracking({
                event: '02',
                eventState: '转发'
            })
        return {
            title: this.data.shareTitle,
            imageUrl:this.data.shareImage,
            path: '/pages/new_gift/index/main?type=share' + "&isFromShare=true",
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

    handleGetCoupon(){
        let That = this;
        let mobile = wx.getStorageSync('mobile');
        let openid = wx.getStorageSync('openid');
        let member = wx.getStorageSync('member');
        handleRequest(giftsEndUrl.getSuccInfo,{
            mobile:mobile,
            searchType:1,
            tenantId:app.globalData.tenantId,
            tenantType:1,
            cid:member.member.cid,
            openId:openid,
            portalId:app.globalData.tenantId
        },'post',function(res){
            if(res.data.code==200){
                   console.log(res)
            }else{ 
            }
        },function(res){
            console.log(res)
        })
    },

    handleLinkDetail(e){
        
        var qrCode = e.currentTarget.dataset.qrcode
        var extendInfo = e.currentTarget.dataset.extendinfo
        var couponActivityId = e.currentTarget.dataset.couponActivityId
        tracking({
            event: '07',
            eventState: '跳转优惠券详情'
        })
        wx.navigateTo({
            url:'/rtmap/coupons/pages/couponInfo/couponInfo?qrCode='+qrCode+'&extendInfo='+extendInfo+'&couponActivityId='+couponActivityId,
            success: function (res) {
            },
            fail: function (res) {
            }
        })
    },

    getActivityInfo(){
        let mobile = wx.getStorageSync('mobile');
        let That = this;
        handleRequest(giftsEndUrl.justifyGetSuccInfo,{
            mobile:mobile,
            tenantId:app.globalData.tenantId
        },'post',function(res){
            if(res.data.code==200){
                if(res.data.type==0){
                    That.handleGetCoupon()
                }else{
                    That.setData({
                        receive:res.data.receive,
                        couponName:JSON.parse(res.data.receive.couponName)
                    })
                    console.log(That.data.couponName)
                }
            }
        },function(res){
            console.log(res)
        })
    },

  	onLoad: function () {
        this.setData({
            logoImage:wx.getStorageSync('logoImage'),
            activity_color:wx.getStorageSync('activity_gift_color'),
            shareImage:wx.getStorageSync('shareImage'),
            shareTitle:wx.getStorageSync('shareTitle')
        })
        
        this.getActivityInfo()
     
  	},
   onShow: function() {
    tracking({
        event: '06',
        eventState: '进入成功'
    })
  }
})
