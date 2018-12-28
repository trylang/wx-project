//获取应用实例
const app = getApp()
const utilRequest = require('../../../utils/util_new_gift.js');
const util = require('../../../utils/util.js');
const QR = require('../../../utils/new_gift_code.js');
import {tracking} from '../../../rtmap/coupons/utils/track.js'
Page({
  //页面变量
  	data: {
    	poiName:'呷哺呷哺',
        maininfo:'5元代金券',
        qrCode:'',
        couponObj:{
          couponApplyShopList:[]
        },
        canvasId:'qrcCanvas',
        useInfo:'',
        size:{},
        info:'满18元可用，每天购买两单即可抽奖'
  	},

  	setCanvasSize(){  
        var size={};  
        try {  
            var res = wx.getSystemInfoSync();  
            var scale = 750/346;
            var width = res.windowWidth/scale;  
            var height = width;
            size.w = width;  
            size.h = height;  
        } catch (e) {  
            console.log("获取设备信息失败"+e);  
        }   
        return size;  
    } ,

    createQrCode(str,canvasId,cavW,cavH){ 
        QR.api.draw(str,canvasId,cavW,cavH);  
    },

    getCouponDetail(){
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
                        couponName:JSON.parse(res.data.receive.couponName)
                    })
                }
            }
        },function(res){
            console.log(res)
        })
    },

  	onLoad: function (options) {
  		this.data.qrCode = this.options.qrCode;
  		this.getCouponDetail()
  		this.data.size = this.setCanvasSize()
      this.createQrCode(this.qrCode, 'qrcCanvas', this.data.size.w, this.data.size.h);  

  
  	},
   onShow: function() {
    tracking({
        event: '06',
        eventState: '进入成功'
    })
  }
})