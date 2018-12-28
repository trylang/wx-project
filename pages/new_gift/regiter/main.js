
//获取应用实例
const app = getApp()
const utilRequest = require('../../../utils/util_new_gift.js');
let hasLogo = '../../../images/new_gift/Group 5@2x.png'
let happyLogo = '../../../images/new_gift/success.png'
let cryLogo = '../../../images/new_gift/Group 3@2x.png'
Page({
  //页面变量
  	data: {
    	sex:'',
		date:'',
		name:'',
		sexArr:['男','女'],
		isShow:false,
		modal_logo:'',
		couponStr:'',
		coupon:[],
		modal_title:'注册成功',
		modal_content:'恭喜您获得一份新人礼',
  	},

  	bindNameChange(e){
  		this.setData({
  			name:e.detail.value
  		}) 
  		this.name = e.detail.value
	},

  	bindDateChange(e){
  		this.setData({
  			date:e.detail.value
  		}) 
  		this.date = e.detail.value
	},

	bindSexChange(e){
		this.setData({
  			sex:e.detail.value==0?'男':'女'
  		}) 
  		this.sex = e.detail.value
	},

	handleCloseModal(){
		this.setData({
  			isShow:false
  		}) 
	},

	handleSeeGift(){
		wx.navigateTo({
			url:'/pages/new_gift/success/main'
		})
		this.setData({
  			isShow:false
  		}) 
	},

	handleCreateMember(){
		if(this.name.length>=2&&this.name.length<=10){
			if(this.sex){
				if(this.date){
					this.handleCreate()
				}else{
					wx.showToast({
						title: '请输入您的出生日期',
						icon: 'none',
						duration: 2000
					})
				}
			}else{
				wx.showToast({
					title: '请输入您的性别',
					icon: 'none',
					duration: 2000
				})
			}
		}else{
			wx.showToast({
                title: '输入名称在2到10个字符之间',
                icon: 'none',
                duration: 2000
            })
		}
	},

	createdRecode(){
		for(let i=0;i<this.coupon.length;i++){
			this.couponStr = this.coupon[i].couponName+','
		}
		let That = this;
  		utilRequest.handleRequest('/recordApp/saveRecord',{
  			phone:app.globalData.phone,
			openid:app.globalData.openId,
			integralReward:app.globalData.score,
			coupon:this.couponStr.slice(0,-1),
			channel:app.globalData.sceneValue=='04'?app.globalData.channel:'',
			sceneValue:app.globalData.sceneValue,
			activityId:app.globalData.activityId
  		},'post',function(res){
			if(res.data.code==200){

			}else{
				wx.showToast({
					title: res.data.message,
					icon: 'none',
					duration: 2000
				})
			}
  		},function(res){
  			console.log(res)
  		})
	},

	handleCreate(){
		var sex=''
		if(this.sex=='男'){
			sex = 'M'
		}else if(this.sex=='女'){
			sex = 'F'
		}
		let That = this;
  		utilRequest.handleRequest('/app/memberRegister/register',{
  			mobile:app.globalData.phone,
			sex:sex,
			name:this.name,
			birthday:this.date,
			sourceType:4,
			marketId:app.globalData.marketId
  		},'post',function(res){
  			if(res.data.code==200){
  				That.setData({
		  			isShow:true,
		  			Logo:happyLogo
		  		}) 	
				if(app.globalData.coupon==1){
					That.getCoupon()
				}
				if(app.globalData.score>0){
					That.createScore()
				}
			}else{
				That.setData({
		  			isShow:true,
		  			Logo:cryLogo,
		  			title:'注册失败',
		  			content:res.data.message
		  		})
			}
  		},function(res){
  			That.setData({
	  			isShow:true,
	  			Logo:cryLogo,
	  			title:'注册失败',
	  			content:'请稍后再试'
	  		})
  		})

	},

	getCoupon(){
		let That = this;
  		utilRequest.handleRequest('/couponApp/getCouponLaunch',{
  			couponLdentification:app.globalData.couponType
  		},'post',function(res){
			if(res.data.code==200){
				const conpons = res.data.coupons
				That.setData({
					coupon:conpons,
					isShow:true,
					Logo: happyLogo
				})
				That.createdRecode()
				if(app.globalData.couponType==0){
					That.getMyCoupon(conpons.id,conpons.couponActivityId,conpons.activityId)
				}else{
					for (var i = 0; i < conpons.length; i++) {
						(function(i) {
						That.getMyCoupon(conpons[i].id,conpons[i].couponActivityId,conpons[i].activityId)
						})(i)
					}
				}
			}else{

			}
  		},function(res){
  			console.log(res)
  		})
	},

	getMyCoupon(id,couponActivityId,activityId){
		let That = this;
  		utilRequest.handleRequest('/couponApp/get',{
  			openId:app.globalData.openId,
			id:id,        //卷ID
			couponActivityId:couponActivityId,  //卷批ID
			activityId:activityId,   //活动编号
			type:2,   //领取方式,
			mobile:app.globalData.phone,
			channelId:app.globalData.channel  //渠道ID
  		},'post',function(res){
			if(res.data.code==200){
	          	
	        }else{

	        }
  		},function(res){
  			console.log(res)
  		})
	},

	createScore(){
		if(app.globalData.score){
			let That = this;
	  		utilRequest.handleRequest('/integral/integralCreate',{
				mobile:app.globalData.phone,
				score:app.globalData.score,
				marketId:app.globalData.marketId,
				channelId:app.globalData.channel  //渠道ID
	  		},'post',function(res){
				if(res.data.code==200){

				}else{
					wx.showToast({
						title: res.data.message,
						icon: 'none',
						duration: 2000
					})
				}
	  		},function(res){
	  			console.log(res)
	  		})
		}
	},

  	onLoad: function () {
  	}
})
