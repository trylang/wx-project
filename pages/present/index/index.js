const app = getApp()
import { handlePresentRequest,giftsEndUrl } from '../../../utils/util_new_gift.js'
import {tracking} from '../../../rtmap/coupons/utils/track.js'
Page({
  data: {
    header:'../../../images/head_default.png',
    nickName:'',
    status:3,
    isShow:false,
    sytime:0,
    createdTime:0,
    modal_title:'',
    modal_logo:'',
    cid_old:'',
    qrCode:'',
    portalId:'',
    couponDetail:null,
    hours:'00',
    minutes:'00',
    seconds:'00',
    couponStatus:0,
    endTime:0,
    activity_color:'#F21B7B',
    couponList:[{
     	title:'iphone x手机专用50元抵扣券',
     	mainInfo:'满100减20',
     	extendInfo:'满18元可用，每天2单可抽奖',
     	type:'苹果',
     	effectiveStartTime:'2018-10-10',
     	effectiveEndTime:'2018-10-15',
     	imgUrl:'../../../images/index/1.png'
    }]
  },

  handleclick(){
    
  },

  handleTouchMove(){

  },

  handleLinkIndex(){
  		 wx.switchTab({
            url:'/pages/index/index',
            success: function (res) {
                // tracking({
                //     event: '07',
                //     eventState: '跳转成功'
                // })
            },
            fail: function (res) {
                // tracking({
                //     event: '07',
                //     eventState: '跳转失败'
                // })
            }
        })
  },

  handleSeeCoupon(){
    let That = this;
    That.setData({
        isShow:false
    })
    if(this.data.couponDetail.status==7){
        wx.navigateTo({
            url: `/rtmap/coupons/pages/couponInfo/couponInfo?qrCode=refund&extendInfo=${this.data.couponDetail.extendInfo}&couponActivityId=${this.data.couponDetail.couponActivityId}`,
            success(){
                That.setData({
                    isShow:false
                })
            }
        })
      }else {
        wx.navigateTo({
            url: `/rtmap/coupons/pages/couponInfo/couponInfo?qrCode=${this.data.qrCode}&extendInfo=${this.data.couponDetail.extendInfo}&couponActivityId=${this.data.couponDetail.couponActivityId}`,
            success(){
                That.setData({
                    isShow:false
                })
            }
        })
      }
  },

    getShareCoupon(){
        let member = wx.getStorageSync('member');
        let That = this;
        const params = {
            cid:this.data.cid_old,         
            portalId: app.globalData.tenantId, 
            qrCode: this.data.qrCode
        }

        handlePresentRequest(giftsEndUrl.getDonationStatus,params,'get',function(res){
             if(res.data.code==200){
                let result = res.data.data
                That.setData({
                    couponDetail:result.couponDetail,
                    endTime:result.expireDate,
                    couponStatus:result.couponStatus,
                    header:result.headPortrait,
                    nickName:result.nickName,
                })
                That.countTime()
            }else{
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                })
            }
        },function(){

        })
    },

    countTime() {
        var date = new Date();
        var now = date.getTime();
        //时间差
        var leftTime = this.data.endTime-now;
        //定义变量 d,h,m,s保存倒计时的时间
        var h,m,s;
        if (leftTime>=0) {
            h = Math.floor(leftTime/1000/60/60)>9? Math.floor(leftTime/1000/60/60):'0'+Math.floor(leftTime/1000/60/60);
            m = Math.floor(leftTime/1000/60%60)>9?Math.floor(leftTime/1000/60%60):'0'+Math.floor(leftTime/1000/60%60);
            s = Math.floor(leftTime/1000%60)>9?Math.floor(leftTime/1000%60):'0'+Math.floor(leftTime/1000%60);                   
        }
        this.setData({
            hours:h,
            minutes:m,
            seconds:s
        })
        //递归每秒调用countTime方法，显示动态时间效果
        setTimeout(this.countTime,1000);

    },

    handleShowBtn(){
        let member = wx.getStorageSync('member');
        let That = this;
        let userInfo = wx.getStorageSync('userInfo');
        const params = {
            appId: app.globalData.tenantId,
            oldCid: this.data.cid_old, 
            headPortrait:userInfo.avatarUrl?userInfo.avatarUrl:That.data.header,
            nickName:userInfo.nickName?userInfo.nickName:'匿名',
            couponActivityId: this.data.couponDetail.couponActivityId, 
            couponId: this.data.couponDetail.couponId, 
            portalId: app.globalData.tenantId, 
            qrCode: this.data.qrCode, 
            subjectType: 1 ,
            giveCid: member.member.cid 
        }
       
        if(member.member.cid!=this.data.cid_old){
            handlePresentRequest(giftsEndUrl.getPresentCoupon,params,'post',function(res){
                 if(res.data.code==200){
                    let result = res.data.data
                    That.setData({
                        isShow:true,
                        modal_title:'领取成功',
                        modal_logo:'../../../images/photo/smile.png'
                    })
                }else{
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'none',
                        duration: 2000
                    })
                }
            },function(){

            })
        }else{
            wx.showToast({
                title: '转赠优惠券仅限他人领取',
                icon: 'none',
                duration: 2000
            })
        }
    },

  onShow(){
    let isLoginSucc = wx.getStorageSync('isLoginSucc')
    if(!isLoginSucc){
        wx.navigateTo({
            url:app.globalData.loginPath,
            success: function (res) {
                // tracking({
                //     event: '07',
                //     eventState: '跳转成功'
                // })
            },
            fail: function (res) {
                // tracking({
                //     event: '07',
                //     eventState: '跳转失败'
                // })
            }
        })
    }else{
        this.getShareCoupon()
    }
  },

  onLoad: function (options) {
    this.setData({
        cid_old:options.cid,
        qrCode:options.qrcode
    })

  }

})
