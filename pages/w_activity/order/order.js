//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {tracking} from '../../../rtmap/coupons/utils/track.js'
import { handleRequest , portsEndUrl } from '../../../utils/util.js'
Page({
	data:{
		tablist:[{
			name:'我的活动',
			id:1
		},{
			name:'我的收藏',
			id:2
		}],
		savelist:[],

		orderList:[],
		isActive:0
	},

    handleLinkOrder(e){
        tracking({
            event: '07',
            eventState: '报名订单'
        })
        wx.navigateTo({
            url:'/pages/w_activity/payOrder/pay?id='+e.currentTarget.dataset.id,
            success: function (res) {
            },
            fail: function (res) {
            }
        })
    },

    handleEnroll(e){
      tracking({
        event: '07',
        eventState: '立即报名'
      })
        wx.navigateTo({
            url:'/pages/w_activity/enroll/enroll?id='+e.currentTarget.dataset.id,
            success: function (res) {
            },
            fail: function (res) {
            }
        })
    },

	handleStoreList(){
		let That = this
        let openid = wx.getStorageSync('openid');
        let buildList = wx.getStorageSync('buildList');
		let keyAdmin = wx.getStorageSync('keyAdmin');
        handleRequest(portsEndUrl.getStoreList,{
            keyAdmin:keyAdmin,
            openid:openid,
            buildId:buildList[0].buildIdStr
        },'post',function(res){
            if(res.data.code==200){
                That.setData({
                	savelist:res.data.actionlist
                })
            }else{
                // wx.showToast({
                //     title: res.data.msg,
                //     icon: 'none',
                //     duration: 2000
                // }) 
            }
        },function(res){
            wx.showToast({
                title: '获取列表失败',
                icon: 'none',
                duration: 2000
            })
        })
	},

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
                // wx.showToast({
                //     title: res.data.msg,
                //     icon: 'none',
                //     duration: 2000
                // }) 
            }
        },function(res){
            wx.showToast({
                title: '获取列表失败',
                icon: 'none',
                duration: 2000
            })
        })
	},

	handleChangeTap(e){
		this.setData({
			isActive:e.currentTarget.dataset.index
		})

	},
	onLoad:function(){
    },
	onShow: function () {
		this.handleStoreList()
		this.handleGetOrderList()
        tracking({
            event: '06',
            eventState: '进入成功'
        })
  	}
})