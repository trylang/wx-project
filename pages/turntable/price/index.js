//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import { handlePresentRequest,giftsEndUrl } from '../../../utils/util_new_gift.js'
Page({
	data:{
		isActive:'2',
		tablist:[
		{
			id:'2',
			name:'未使用'
		},{
			id:'3',
			name:'已使用'
		},{
			id:'4',
			name:'已过期'
		}
		],
		couponList:[]
	},

    onPullDownRefresh() {
        wx.setBackgroundTextStyle({
            textStyle: 'dark'
        })
        this.getPriceList()
        setTimeout(function() {
            wx.stopPullDownRefresh()
        }, 500);

    },

	getPriceList(){
        let mobile = wx.getStorageSync('mobile');
        let That = this;
        const params = {
                portalId:app.globalData.tenantId,
                mobile:mobile,
                status:this.data.isActive
        }
        handlePresentRequest(giftsEndUrl.winnerGetInfo,params,'post',function(res){
            if(res.data.code==200){
            	That.setData({
            		couponList:res.data.list
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
        
    },

    canUseBtn(e){
    	var qrCode = e.currentTarget.dataset.qrcode
        var extendInfo = e.currentTarget.dataset.extendinfo
        wx.navigateTo({
            url:'/rtmap/coupons/pages/couponInfo/couponInfo?qrCode='+qrCode+'&extendInfo='+extendInfo,
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

	getType(e){
		let index = e.currentTarget.dataset.index;
		this.setData({
			isActive:index
		})
        this.getPriceList()
	},

	onLoad(){
		this.getPriceList()
	}
})