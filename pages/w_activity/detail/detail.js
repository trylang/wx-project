//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {tracking} from '../../../rtmap/coupons/utils/track.js'
import { config } from '../../../utils/config.js'
import { handleRequest , portsEndUrl } from '../../../utils/util.js'
import WxParse  from '../../components/wxparse/wxparse.js';
Page({
	data:{
        isFromShare:'false',
        isMove: false,
		modellist:[],
		activityInfo:{
		},
		commentBtn:false,
		commentValue:'',
		orderList:[],
		commentList:[],
		list:[],
		id:'',
		endDate:'',
		shareImage:'',
		shareTitle:'活动详情',
		shareDesc:'',
		canEnroll:true,
		headDiatance:0,
		isLogin:false,
		userInfo:null,
		projectTitle:app.globalData.projectTitle
	},
	headDiatance(){

	},
	handleSaveActivity(){
    tracking({
      event: '12',
      eventState: '收藏'
    })
		let That = this;
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.handleSaveActivity,{
            keyAdmin: keyAdmin || config.keyAdmin,
            openid: openid || 'noopenid',	
			actionId:this.data.id
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
					That.getActivityDetail()
            	},200);
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

	justifyDate(){ 
        let That = this;
        let now = new Date();
        let year =  now.getFullYear();
        let month = now.getMonth();                 //没有+1方便后面计算当月总天数   
        let num = now.getDate()
       	let isToday =  '' + year + (month<9?('0'+(month+1)):(month+1)) + (num<10?('0'+num):num)
       	if(isToday>That.data.endDate){
       		return false
       	}else{
       		return true
       	}
	},

	handleGoodActivity(){
    tracking({
      event: '12',
      eventState: '点赞'
    })
		let That = this;
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.handleGoodActivity,{
            keyAdmin: keyAdmin || config.keyAdmin,
            openid: openid ||'noopenid',	
			actionId:this.data.id
        },'post',function(res){
            if(res.data.code==200){
            	That.getActivityDetail()
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

	canNotEnroll(){
		if(this.data.isLogin){
			wx.showToast({
                title:'抱歉，报名已结束',
                icon: 'none',
                duration: 2000
            })
		}else{
            this.goLogin()
		}
	},

	handleEnroll(){
    
		if(this.data.isLogin){
            tracking({
                event: '12',
                eventState: '立即报名'
            })
			wx.navigateTo({
				url:'/pages/w_activity/enroll/enroll?id='+this.data.id,
				success: function (res) {
	            },
	            fail: function (res) {
	            }
			})
		}else{
            tracking({
                event: '07',
                eventState: '登录注册'
            })
            this.goLogin()
		}
		
	},

	handleGetComment(e){
		this.setData({
			commentValue:e.detail.value
		})
	},

	hiddenModal(){
		this.setData({
			commentBtn:false
		})
	},

	getCommentList(){
		let That = this
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.getCommentList,{
            keyAdmin: keyAdmin || config.keyAdmin,
			actionId:this.data.id,
        },'post',function(res){
            if(res.data.code==200){
            	if(res.data.commentlist.length>=5){
            		That.data.commentList = res.data.commentlist.slice(0,5)
            		That.setData({
	            		commentList:That.data.commentList
	            	})
            	}else{
            		That.setData({
	            		commentList:res.data.commentlist
	            	})
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
                title: '评论失败',
                icon: 'none',
                duration: 2000
            })
        })
	},

	handleSendMessage(){
		let That = this
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
		let userInfo = wx.getStorageSync('userInfo');
		if(this.data.commentValue.length<140){
			handleRequest(portsEndUrl.userComment,{
                keyAdmin: keyAdmin || config.keyAdmin,
				actionId:this.data.id,
                openid: openid || 'noopenid',
				connect:this.data.commentValue,
				username:userInfo.nickName,
				headimg:userInfo.avatarUrl
	        },'post',function(res){
	            if(res.data.code==200){
	            	wx.showToast({
		                title: '评论成功',
		                icon: 'success',
		                duration: 2000
		            })
		            That.setData({
		            	commentValue:'',
		            	commentBtn:false
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
	                title: '评论失败',
	                icon: 'none',
	                duration: 2000
	            })
	        })
		}else{
			wx.showToast({
                title: '评论字数请少于140个字符',
                icon: 'none',
                duration: 2000
            })
		}
       
	},

	preventScroll(){

	},
	handleTap(){

	},

	getActivityAvatar(){
		let That = this
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.getActivityAvatar,{
            keyAdmin: keyAdmin || config.keyAdmin,
			actionId:this.data.id
        },'post',function(res){
            if(res.data.code==200){
            	if(res.data.orderlist.length>=5){
            		That.setData({
	            		orderList:res.data.orderlist.slice(0,8)
	            	})
	            	That.data.headDiatance = (That.data.orderList.length-1)*20
	            	That.setData({
	            		headDiatance:That.data.headDiatance
	            	})
            	}else{
            		That.setData({
	            		orderList:res.data.orderlist
	            	})
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

	getActivityDetail(){
		let That = this
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.getActivityDetail,{
            keyAdmin: keyAdmin || config.keyAdmin,
            openid: openid || 'noopenid',	
			id:this.data.id
        },'post',function(res){
            if(res.data.code==200){
            	That.setData({
            		action:res.data.action,
            		modellist:res.data.action.modellist,
    				list:res.data.action.modellist,
    				endDate:res.data.action.endDate.slice(0,4)+res.data.action.endDate.slice(5,7)+res.data.action.endDate.slice(8,10)
            	})
            	for (let i = 0; i < That.data.modellist.length; i++) {
				    WxParse.wxParse('connect' + i, 'html', That.data.modellist[i].connect, That);
				    if (i === That.data.modellist.length - 1) {
				        WxParse.wxParseTemArray("list",'connect', That.data.modellist.length, That)
				    }
            	};

            	That.setData({
            		canEnroll:That.justifyDate()
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
                title: '获取活动列表失败',
                icon: 'none',
                duration: 2000
            })
        })
	},

	onShareAppMessage(res) {
    tracking({
      event: '02',
      eventState: '转发'
    })
	    return {
	      	title: this.data.action.asharetitle,
	      	imageUrl: this.data.action.ashareimg,
	      	desc:this.data.action.asharedetail,
            path: '/pages/w_activity/detail/detail?id=' + this.data.id + "&isFromShare=true",
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
	handleShowComment(){
    tracking({
      event: '12',
      eventState: '评论'
    })
		if(this.data.isLogin){
			this.setData({
				commentBtn:true
			})
		}else{
            this.goLogin()
		}
		
	},

	bindGetUserInfo(e){
	},

	onShow(){
		this.getActivityAvatar()
		this.getActivityDetail()
		this.setData({
			isLogin: wx.getStorageSync('isLoginSucc')?wx.getStorageSync('isLoginSucc'):false
		})
		tracking({
		    event: '06',
		    eventState: '进入成功'
	    })
	},
	
	onLoad: function (options) {
		let That = this;
		this.data.id = options.id;
		this.getCommentList()
        this.setData({
            isFromShare: options.isFromShare || 'false',
        })
  	},

      goLogin(){
          tracking({
              event: '07',
              eventState: '登录注册'
          })
          wx.navigateTo({
              url: `${app.globalData.loginPath}?from=会员活动`,
              success: function (res) {
              },
              fail: function (res) {
              }
          })
      },
})