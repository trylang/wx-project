//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {tracking} from '../../../rtmap/coupons/utils/track.js'
import { handleRequest , portsEndUrl } from '../../../utils/util.js'
Page({
	data:{
		isActive:'99',
		author:'全部发布者',
		sort:'默认排序',
		showSelect:false,
		showSelectBtn:false,
		selectClass:'',
		className:'全部',
		activity_title:'',
		activitylist:[],
		authorList:[],
		orderList:[],
		flag:0,
		headImgList:[],
		type:'',
		goodFlag:false,
		sortId:0,
		classList:[{
			name:'全部',
			id:''
		},{
			name:'普通活动',
			id:0
		},{
			name:'会员活动',
			id:1
		}],
		defaultList:[{
			name:'默认排序',
			id:0
		},{
			name:'浏览数从高到低',
			id:3
		},{
			name:'收藏数从高到低',
			id:2
		},{
			name:'点赞数从高到低',
			id:1
		},{
			name:'评论数从高到低',
			id:4
		}],

	},

	handleClickType(e){
		if(this.data.isActive==e.currentTarget.dataset.index){
			this.setData({
				showSelectBtn:!this.data.showSelectBtn
			})
		}else{
			this.setData({
				showSelectBtn:true
			})
		}
		this.setData({
			isActive:e.currentTarget.dataset.index,
			selectClass:e.currentTarget.dataset.index
		})
	},

	handleLinkMineAct(){
		let isLoginSucc = wx.getStorageSync('isLoginSucc');
		if(isLoginSucc){
            tracking({
                event: '07',
                eventState: '报名订单列表'
            })
			wx.navigateTo({
				url:'/pages/w_activity/order/order',
				success: function (res) {
	            },
	            fail: function (res) {
	            }
			})
		}else{
            tracking({
                event: '14',
                eventState: '登录注册'
            })
			wx.navigateTo({
                url: `${app.globalData.loginPath}?from=会员活动`,
				success: function (res) {
	            },
	            fail: function (res) {
	            }
			})
		}
		
	},

	handleSaveActivity(e){
		let That = this;
		let activityId = e.currentTarget.dataset.save;
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.handleSaveActivity,{
            keyAdmin:keyAdmin,
			openid:openid,	
			actionId:activityId
        },'post',function(res){
            if(res.data.code==200){
            	if(res.data.flag==0){
            		wx.showToast({
	                    title: '已取消收藏',
	                    icon: 'none',
	                    duration: 2000
	                }) 
            	}else{
            		wx.showToast({
	                    title: '已收藏',
	                    icon: 'none',
	                    duration: 2000
	                })
            	}
            	setTimeout(function(){
            		That.getActivityList()
            	},1000)
            }else{
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                }) 
            }
        },function(res){
            wx.showToast({
                title: '获取活动列表失败',
                icon: 'none',
                duration: 2000
            })
        })
	},

	handleGoodActivity(e){
		let That = this;
		let activityId = e.currentTarget.dataset.good;
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.handleGoodActivity,{
            keyAdmin:keyAdmin,
			openid:openid,	
			actionId:activityId
        },'post',function(res){
            if(res.data.code==200){
            	That.getActivityList()
            }else{
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                }) 
            }
        },function(res){
            wx.showToast({
                title: '获取活动列表失败',
                icon: 'none',
                duration: 2000
            })
        })
	},

	handleSearchTitle(e){
		this.setData({
			activity_title:e.detail.value
		})
	},

	handleConfirm(){
		this.getActivityList()
	},

	preventScroll(){

	},

	handleEnroll(e){
        tracking({
            event: '07',
            eventState: '报名页'
        })
		wx.navigateTo({
			url:'/pages/w_activity/enroll/enroll?id='+e.currentTarget.dataset.id,
			success: function (res) {
            },
            fail: function (res) {
            }
		})
	},

	handleSelectAuthor(e){
		this.setData({
			author:e.currentTarget.dataset.name,
			showSelectBtn:false
		})
		this.author = e.currentTarget.dataset.name
		this.getActivityList()
	},

	handleSelectClass(e){
		this.setData({
			className:e.currentTarget.dataset.name,
			type:e.currentTarget.dataset.id,
			showSelectBtn:false
		})
		this.getActivityList()
	},

	handleSelectSort(e){
		this.setData({
			sort:e.currentTarget.dataset.name,
			sortId:e.currentTarget.dataset.id,
			showSelectBtn:false
		})
		this.getActivityList()
	},

	handleSlect(){
		let That = this;
		this.setData({
			showSelect:!That.data.showSelect,
			isActive:99
		})
		this.showSelect = That.data.showSelect;
	},

	hiddenModal(){
		this.setData({
			showSelectBtn:false
		})
	},

	handleSearch(){
		this.getActivityList()
	},
	/*查看已有订单*/
	handleGetOrderList(){
		let That = this
        let openid = wx.getStorageSync('openid');
        let buildList = wx.getStorageSync('buildList');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.getOrderList,{
            keyAdmin:keyAdmin,
            openid:openid,
            status:'0,1,2,3,4,5'
        },'post',function(res){
            if(res.data.code==200){
                That.setData({
                    orderList:res.data.orderlist
                })
            }else{
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                }) 
            }
        },function(res){
            wx.showToast({
                title: '获取列表失败',
                icon: 'none',
                duration: 2000
            })
        })
	},

	getActivityAvatar(id){
		let That = this
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.getActivityAvatar,{
            keyAdmin:keyAdmin,
			actionId:id
        },'post',function(res){
            if(res.data.code==200){
            	for (let i = 0; i < That.data.activitylist.length; i++) {
            		if(That.data.activitylist[i].id==id){
            			That.data.activitylist[i].headImgList=res.data.orderlist
            		}
            	}
            	
            	That.setData({
            		activitylist:That.data.activitylist
            	})
            }else{
            	return []
            }
        },function(res){
            return []
        })
	},

	getActivityList(){
		let That = this
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.getActivityList,{
            keyAdmin:keyAdmin,
			openid:openid,	
			title:That.data.activity_title,
			type:That.data.type,
			sort:That.data.sortId
        },'post',function(res){
            if(res.data.code==200){
            	That.setData({
            		activitylist:res.data.actionlist
            	})
            	for (let i = 0; i < That.data.activitylist.length; i++) {
            		That.getActivityAvatar(That.data.activitylist[i].id)
            	}
	           
            }else{
                wx.showToast({
                    title: res.data.msg,
                    icon: 'none',
                    duration: 2000
                }) 
            }
        },function(res){
            wx.showToast({
                title: '获取活动列表失败',
                icon: 'none',
                duration: 2000
            })
        })
	},

	onShow(){
		this.getActivityList()
		this.handleGetOrderList()
	    tracking({
	        event: '06',
	        eventState: '进入成功'
	    })
	},

	onLoad: function () {
		this.setData({
			authorList:wx.getStorageSync('buildList')
		})
	
	  
  	}
})