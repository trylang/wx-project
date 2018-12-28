
//获取应用实例
const app = getApp()
import { handleRequest,giftsEndUrl } from '../../../utils/util_new_gift.js'
let hasLogo = '../../../images/new_gift/Group 5@2x.png'
Page({
  //页面变量
  	data: {
      	logoImg:'../../../images/new_gift/Group6@2x.png',
     	  isShow:false,
      	modal_logo:'',
      	memberInfo:{},
      	activityInfo:{},
      	modal_title:'抱歉',
      	modal_content:'您已经领取过',
  	},

  	handleCloseModal(){
  		this.setData({
  			isShow:false
  		})
    },

    getPhoneNumber(e){
    	let That = this;
  		handleRequest('/weixin/phoneDecrypt',{
  			encryptedData:e.detail.encryptedData,
	        iv:e.detail.iv,
	        sessionKey:app.globalData.session_key,
	        openId:app.globalData.openId
  		},'post',function(res){
			if(res.data.code==200){
	          	app.globalData.phone = JSON.parse(res.data.userInfo).phoneNumber;
	          	this.handleJusttifyMember()
	        }else{

	        }
  		},function(res){
  			console.log(res)
  		})
    },

    handleJusttifyCRMMember(){
    	let That = this;
  		handleRequest('/app/memberRegister/getMemberInfo',{
  			mobile: app.globalData.phone,
  		},'post',function(res){
			if(res.data.code==200){
				That.setData({
            		isShow:true,
            		modal_logo:hasLogo,
            		modal_title:'抱歉',
            		modal_content:'该活动只适用于新会员'
            	})
	        }else{
	            wx.navigateTo({
	              url:'/pages/new_gift/regiter/main'
	            })
	        }
  		},function(res){
  			wx.showToast({
	          title: '请求失败',
	          icon: 'none',
	          duration: 2000
	        })
  		})
    },

    handleSeeGift(){
        wx.navigateTo({
          url:'/pages/new_gift/success/main'
        })
        That.setData({
      		isShow:false
      	})
    },

    handleJusttifyMember(){
    	handleRequest('/app/memberRegister/findMember',{
  			mobile: app.globalData.phone,
  		},'post',function(res){
			if(res.data.code==200){
				That.setData({
					memberInfo : res.data.member,
			        isShow : true,
			        Logo : hasLogo,
			        title : '抱歉',
			        content : '该活动只适用于新会员'
            	})
	        }else{
	            this.handleJusttifyCRMMember()
	        }
  		},function(res){
  			wx.showToast({
	          title: '请求失败',
	          icon: 'none',
	          duration: 2000
	        })
  		})
    },

  	onLoad: function () {
  	}
})

