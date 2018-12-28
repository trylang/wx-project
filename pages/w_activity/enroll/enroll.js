//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {tracking} from '../../../rtmap/coupons/utils/track.js'
import { handleRequest , portsEndUrl } from '../../../utils/util.js'
Page({
	data:{
		date:'',
		time:'',
        ifclick: true,
		showTime:'00:00',
		id:'',
		ticketlist:[],
		lastX: 0,
    	lastY: 0,
		action:null,
		ticketNum:0,
		startDate:'',
		endDate:'',
		startTime:'00:00',
		endTime:'23:59',
		chargeType:0,
		ticketId:'',
		currentX:0,
		currentY:0,
		yp:'',
		flag:0,
		isLogin:false,
		money:'',
		isTicket:0,
		ypList:[],
		score:'',
		isShowCalendar:false,
		limit:null,
		infolist:[],
		flag:false,
		infolistAll:[],
		ticketListStr:[],

		year1: 0,
        month1: 0,
        date1: ['日', '一', '二', '三', '四', '五', '六'],
        dateArr: [],
        isToday: 0,
        isTodayWeek: false,
        todayIndex: 0
	},

	mytouchstart(event){
		this.setData({
			lastX : event.touches[0].pageX,
			lastY : event.touches[0].pageY,
			flag:true
		})
	},

	hiddenModal(){
		this.setData({
			isShowCalendar:false
		})
	},

	mytouchend(event){
		var tx = this.data.currentX - this.data.lastX;
	   	var ty = this.data.currentY - this.data.lastY;
	   	if(this.data.flag){
	   		if (Math.abs(tx) < Math.abs(ty)) {
		     	if (ty < -40){
		     		this.nextMonth()
		     	}
		     	if (ty > 40){
		     		this.lastMonth()
		     	}
		   	}
	   }else{

	   }
	   	
	   	this.setData({
	   		lastX : 0,
	   		lastY : 0,
	   		flag:false
	   	})
	},

	mytouchmove(event){
		this.data.currentX = event.touches[0].pageX;
	   	this.data.currentY = event.touches[0].pageY;
	   	
	},

	preventScroll(){

	},

	handleGetypList(){
		let That = this;
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
		handleRequest(portsEndUrl.getDateyp,{
            keyAdmin:keyAdmin,
			openid:openid,	
			actionId:this.data.id
        },'post',function(res){
            if(res.data.code==200){
            	That.data.ypList = res.data.list.map((item,index)=>{
            		
            		return {
            			date:item.date.replace(/-/g,''),
            			yp:item.yp
            		}
            	})
            	That.setData({
            		ypList:That.data.ypList
            	})
            	let arr = []
            	That.data.ypList.map((item,index)=>{
            		console.log(item)
            		if(item.yp>0){
            			arr.push(item.date)
            		}
            	})
            	console.log(arr)
            	if(arr.length){
            		That.setData({
            			isToday:arr[0],
            			date:arr[0].slice(0,4)+'-'+arr[0].slice(4,6)+'-'+arr[0].slice(6,8),
            			year1: parseInt(arr[0].slice(0,4)),
		            	month1: parseInt(arr[0].slice(4,6)>9?arr[0].slice(4,6):arr[0].slice(4,6).slice(1,2))
            		})
            	}
            	That.dateInit(That.data.year1,That.data.month1-1)
            }
        },function(res){

        })     	
	},

	handleChooseDate(e){
		let isToday = e.currentTarget.dataset.date
		this.setData({
			isToday:isToday,
			date:isToday.slice(0,4)+'-'+isToday.slice(4,6)+'-'+isToday.slice(6,8)
		})
		this.justifyTime(this.data.isToday)
	},

	/*根据日期匹配当前时间段*/
	justifyTime(date){
		let index = this.data.isTicket;
		this.getTicketNum(this.data.ticketlist[index].id)
		const dateList = this.data.ticketlist[index].datelist
		for (var i = 0; i < dateList.length; i++) {
			if(date>=dateList[i].startDate.replace(/-/g,'')&&date<=dateList[i].endDate.replace(/-/g,'')){
				console.log(''+dateList[i].timelist[0].startTime)
				console.log(''+this.data.time.slice(0,5))
				this.setData({
					time:dateList[i].timelist[0].startTime,
					showTime:dateList[i].timelist[0].startTime.slice(0,5)
				})
			}
		}
	},

	justifyDate(){ 
        let That = this;
        let now = new Date();
        let year =  now.getFullYear();
        let month = now.getMonth();                 //没有+1方便后面计算当月总天数   
        let num = now.getDate()
       	let isToday =  '' + year + (month<9?('0'+(month+1)):(month+1)) + (num<10?('0'+num):num)
       	if(isToday>=That.data.startDate&&isToday<=That.data.endDate){
       		this.justifyTime(isToday)
       		return isToday
       	}else{
       		this.justifyTime(That.data.startDate)
       		return That.data.startDate
       	}
	},

	dateInit(setYear,setMonth){
        //全部时间的月份都是按0~11基准，显示月份才+1
        let dateArr = [];                       //需要遍历的日历数组数据
        let arrLen = 0;                         //dateArr的数组长度
        let That = this;
        let now = setYear ? new Date(setYear,setMonth) : new Date();
        let year = setYear || now.getFullYear();
        let nextYear = 0;
        let month = setMonth || now.getMonth();                 //没有+1方便后面计算当月总天数
        let nextMonth = (month + 1) > 11 ? 1 : (month + 1);     
        let startWeek = new Date( year+'/'+(month + 1)+'/'+1).getDay();                         //目标月1号对应的星期
        let dayNums = new Date(year,nextMonth,0).getDate();             //获取目标月有多少天
        let obj = {};       
        let num = 0;
        if(month + 1 > 11){
            nextYear = year + 1;
            dayNums = new Date(nextYear,nextMonth,0).getDate();
        }
        arrLen = startWeek + dayNums;
        for(let i = 0; i < arrLen; i++){
            if(i >= startWeek){
                num = i - startWeek + 1;
                obj = {
	                    isToday: '' + year + (month<9?('0'+(month+1)):(month+1)) + (num<10?('0'+num):num),
	                    dateNum: num<10?('0'+num):num,
	                    weight: 5,
	                    yp:0
	                }
            }else{
                obj = {};
                
            }
            dateArr[i] = obj
        }
 		dateArr.map((item,index)=>{
 			That.data.ypList.map((yp,yp_index)=>{
 				if(yp.date==item.isToday){
 					item.yp = yp.yp
 				}
 			})
 		})
 		this.setData({
            dateArr: dateArr
        })
        let nowDate = new Date();
        let nowYear = nowDate.getFullYear();
        let nowMonth = nowDate.getMonth() + 1;
        let nowWeek = nowDate.getDay();
        let getYear = setYear || nowYear;
        let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;
 
        if (nowYear == getYear && nowMonth == getMonth){
            this.setData({
                isTodayWeek: true,
                todayIndex: nowWeek
            })
        }else{
            this.setData({
                isTodayWeek: false,
                todayIndex: -1
            })
        }
    },
    lastMonth(){
        //全部时间的月份都是按0~11基准，显示月份才+1
        let year = this.data.month1 - 2 < 0 ? this.data.year1 - 1 : this.data.year1;
        let month = this.data.month1 - 2 < 0 ? 11 : this.data.month1 - 2;
        this.setData({
            year1: year,
            month1: (month + 1)
        })
        this.dateInit(year,month);
    },
    nextMonth(){
        //全部时间的月份都是按0~11基准，显示月份才+1
        let year = this.data.month1 > 11 ? this.data.year1 + 1 : this.data.year1;
        let month = this.data.month1 > 11 ? 0 : this.data.month1;
        this.setData({
            year1: year,
            month1: (month + 1)
        })
        this.dateInit(year, month);
    },

	bindDateChange(e){
		let index = this.data.isTicket;
		this.data.ticketlist[index].number = 0;
		this.setData({
			isShowCalendar:true,
			infolistAll:[],
			ticketlist:this.data.ticketlist
		})
		
		this.getTicketNum(this.data.ticketlist[index].id)
	},

	bindTimeChange(e){
		let index = this.data.isTicket;
		this.data.ticketlist[index].number = 0;
		this.setData({
			time:e.detail.value+':00',
			showTime:e.detail.value,
			infolistAll:[],
			ticketlist:this.data.ticketlist
		})

		this.getTicketNum(this.data.ticketlist[index].id)
	},

	handleGetActiveTicket(e){
		let index = e.currentTarget.dataset.index
		this.setData({
			isTicket:e.currentTarget.dataset.index
		})
		this.getTicketNum(this.data.ticketlist[index].id)
	},

	changeReduceNum(e){
		let index = e.currentTarget.dataset.number
		for (var i = 0; i < this.data.ticketlist.length; i++) {
			if(i==index){
				this.data.ticketlist[index].number = this.data.ticketlist[index].number-1;
				this.data.ticketNum = this.data.ticketlist[index].number;
				for (var i = 0; i < this.data.infolist.length; i++) {
					this.data.infolistAll.pop()
				}
				if(this.data.chargeType==1&&this.data.ticketlist[index].limitlist[0].score){
					this.setData({
						score:this.data.ticketlist[index].limitlist[0].score*this.data.ticketNum
					})
				}
				if(this.data.chargeType==1&&this.data.ticketlist[index].limitlist[0].score){
					this.setData({
						money:this.data.ticketlist[index].limitlist[0].money*this.data.ticketNum
					})
				}
				this.setData({
					infolistAll:this.data.infolistAll
				})
			}else{
				this.data.ticketlist[i].number = 0;
			}	
		}
		this.setData({
			ticketlist:this.data.ticketlist
		})
	},
	changeAddNum(e){
		let index = e.currentTarget.dataset.number
		let mobile = wx.getStorageSync('mobile');
		let That = this;
		if(this.data.ticketlist[index].chargeType==0){
			this.setData({
				chargeType:0
			})
		}else{
			this.setData({
				chargeType:1
			})
		}
		
		for (var i = 0; i < this.data.ticketlist.length; i++) {
			if(i==index){
				if(this.data.flag!=index){
					this.setData({
						infolistAll:[]
					})
				}
				this.setData({
					score:0,
					money:0
				})
				this.data.ticketlist[index].number = this.data.ticketlist[index].number+1;
				this.data.ticketNum = this.data.ticketlist[index].number;
				this.data.ticketId = this.data.ticketlist[index].id
				this.data.infolist.map(function(item){
					item.number=That.data.ticketNum
					if(That.data.infolistAll.length<=2){
						if(item.infoname=='手机号'){
							item.value=mobile
						}else{
							item.value=''
						}
					}else{
						item.value=''
					}
					
					That.data.infolistAll.push(item)
					That.setData({
						infolistAll:That.data.infolistAll
					})
				})
				if(this.data.chargeType==1&&this.data.ticketlist[index].limitlist[0].score){
					this.setData({
						score:this.data.ticketlist[index].limitlist[0].score*this.data.ticketNum
					})
				}
				if(this.data.chargeType==1&&this.data.ticketlist[index].limitlist[0].score){
					this.setData({
						money:this.data.ticketlist[index].limitlist[0].money*this.data.ticketNum
					})
				}
				
			}else{
				this.data.ticketlist[i].number = 0;
			}	
		}
		this.data.flag = index;
		this.setData({
			ticketlist:this.data.ticketlist
		})
	},

	noChooseDate(){
		wx.showToast({
            title: '请在报名时间范围内选择',
            icon: 'none',
            duration: 2000
        })
    },

	getActivityDetail(s){
		let That = this
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.getActivityDetail,{
            keyAdmin:keyAdmin,
			openid:openid,	
			id:this.data.id
        },'post',function(res){
            if(res.data.code==200){
            	let year = res.data.action.startDate.slice(0,4)
            	let month = res.data.action.startDate.slice(5,7)
            	let day = res.data.action.startDate.slice(8,10)
            	That.setData({
            		action:res.data.action,
            		infolist:res.data.action.infolist,
            		ticketlist:res.data.action.ticketlist,
    				list:res.data.action.modellist,
    				startTime:res.data.action.starttime,
    				endTime:res.data.action.endtime,
    				startDate:year+month+day,
    				endDate:res.data.action.endDate.slice(0,4)+res.data.action.endDate.slice(5,7)+res.data.action.endDate.slice(8,10)
            	})
            	let start = That.justifyDate()
            	console.log(That.data.time)
            	That.setData({
					date:start.slice(0,4)+'-'+start.slice(4,6)+'-'+start.slice(6,8),
					startDate:start,
					year1: parseInt(start.slice(0,4)),
		            month1: parseInt(start.slice(4,6)>9?start.slice(4,6):start.slice(4,6).slice(1,2)),
		            isToday: start
				})
				/*判断今天在不在活动区间内*/
				
				That.handleGetypList()
				
				That.getTicketNum(That.data.ticketlist[0].id)
            	const ticketlist = res.data.action.ticketlist;
            	That.data.ticketlist = That.data.ticketlist.map(function(item){
            			item.number = 0;
            			return item
            	})
            	That.data.infolist = That.data.infolist.map(function(item){
            			item.value = '';
            			return item
            	})
            	That.setData({
            		ticketlist:That.data.ticketlist,
            		infolist:That.data.infolist
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

	handleGetInfo(e){
		let inner = e.currentTarget.dataset.index
		this.data.infolistAll[inner].value = e.detail.value;
		this.setData({
			infolistAll:this.data.infolistAll
		})
	},

	handleJoinActivity(){
    tracking({
      event: '12',
      eventState: '报名'
    })
		//报名信息判断
		if(this.data.isLogin){
			let flag = true;
			let That = this;
			let phoneFlag = false;
			let Reg = /^1[3|4|5|8|2|7|6|9][0-9]\d{4,8}$/
			this.data.infolistAll.map(function(key_value){
				if(!key_value.value){
					flag = false;
				}
				return flag
			})
			this.data.infolistAll.map(function(key_value){
				if(key_value.infoname=='手机号'){
					if(!Reg.test(key_value.value)){
						phoneFlag = false;
						return
					}else{
						phoneFlag = true;
					}
				}
				return phoneFlag
			})
        
			if(this.data.date){
				if(this.data.time){
					if(this.data.ticketNum!=0){
						if(flag==true){
							if(phoneFlag){
								this.handleJoinInfo()
							}else{
								wx.showToast({
					                title: '请填写正确手机号',
					                icon: 'none',
					                duration: 2000
					            })
							}
							
						}else{
							wx.showToast({
				                title: '请完善报名人信息',
				                icon: 'none',
				                duration: 2000
				            })
						}
						
					}else{
						wx.showToast({
			                title: '请输入门票数',
			                icon: 'none',
			                duration: 2000
			            })
					}
					
					
				}else{
					wx.showToast({
		                title: '请输入预约时间',
		                icon: 'none',
		                duration: 2000
		            })
				}

			}else{
				wx.showToast({
	                title: '请输入预约日期',
	                icon: 'none',
	                duration: 2000
	            })
			}
		}else{
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
		}
		
	},

	handleJoinInfo(){
		let That = this
		let openid = wx.getStorageSync('openid');
		let mobile = wx.getStorageSync('mobile');
		let keyAdmin = wx.getStorageSync('keyAdmin');
		let userInfo = wx.getStorageSync('userInfo');
		let username= userInfo.nickName;
		let headimg= userInfo.avatarUrl;
		const infoStr = JSON.stringify(this.data.infolistAll);
		const ticketStr = JSON.stringify([{
			ticketId:this.data.ticketId,
			number:this.data.ticketNum
		}]);
        That.setData({ ifclick: false });
        handleRequest(portsEndUrl.saveOrder,{
            keyAdmin:keyAdmin,
			openid:openid,	
			actionId:this.data.id,
			yuyuedate:this.data.date+' '+this.data.time,
			infoStr:infoStr,
			ticketStr:ticketStr,
			mobile:mobile,
			tenantId:app.globalData.tenantId,
			tenantType:1,
			username:username?username:'',
			headimgurl:headimg?headimg:''
        },'post',function(res){
            if(res.data.code==200){
            	wx.showToast({
	                title: '报名成功',
	                icon: 'success',
	                duration: 2000
	            })
	            setTimeout(function(){
                    That.setData({ ifclick: true });
                    tracking({
                        event: '07',
                        eventState: '报名订单'
                    })
	            	wx.redirectTo({
						url:'/pages/w_activity/payOrder/pay?id='+res.data.orderId,
						success: function (res) {
			            },
			            fail: function (res) {
			            }
					})
	            },1000);
            }else{
                That.setData({ ifclick: true });
                wx.showToast({
	                title: res.data.msg,
	                icon: 'none',
	                duration: 2000
	            })
            }
        },function(res){
            That.setData({ ifclick: true });
            wx.showToast({
                title: '报名失败',
                icon: 'none',
                duration: 2000
            })
        })
	},

	getTicketNum(id){
		let That = this
		let openid = wx.getStorageSync('openid');
		let keyAdmin = wx.getStorageSync('keyAdmin');
		let member = wx.getStorageSync('member');
		let LoginType = wx.getStorageSync('LoginType');
        handleRequest(portsEndUrl.getTicketNum,{
            keyAdmin:keyAdmin,
			openid:openid,	
			actionId:this.data.id,
			yuyuedate:this.data.date+' '+this.data.time,
			ticketId:id,
			cardtype:LoginType=='CRM5' ? member.member.cardName:member.member.grade
        },'post',function(res){
            if(res.data.code==200){
            	That.setData({
            		yp:res.data.yp,
            		limit:res.data.limit
            		
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
                title: '获取余票列表失败',
                icon: 'none',
                duration: 2000
            })
        })
	},

	onShow(){
		tracking({
	        event: '06',
	        eventState: '进入成功'
	     })
		this.setData({
            isLogin: wx.getStorageSync('isLoginSucc') ? wx.getStorageSync('isLoginSucc') : false,
        })
        this.getActivityDetail()
	},
	
	onLoad(options) {
		this.data.id = options.id;
		
  	},
  //  onShow: function() {
  
  // }
})