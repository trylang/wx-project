import {
    get,
    post,
    paths
} from '../../http.js';
import {
    tracking
} from '../../../coupons/utils/track.js'
const app = getApp();
//const activityId = app.globalData.seckillActivityId;
const statusname = {
  1:{
    title:'等待付款',
    desc:''
  },
  2:{
    title:'交易完成',                         //支付成功
    desc:'您已领取成功，请尽快到门店使用'
  }, 
  3:{                                         //交易成功
    title:'交易完成',
    desc:'您已领取成功，请尽快到门店使用'
  }, 
  4:{
    title:'交易完成',
    desc:'退款受理中，请耐心等候'        //申请退款
  }, 
  5:{
    title:'交易完成',
    desc:'退款成功'
  },
  6:{
    title:'交易关闭',     //'退款失败',
    desc:'已取消，期待您的再次购买'
  },
  7:{
    title:'交易关闭',
    desc:'已取消，期待您的再次购买'
  }
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    countdown:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _self=this;
    this.setData({ 
      orderId:options.orderId
    })  
    get(paths.getActivityId,{
      },function(res){
          if(res.data.data!=_self.data.activityId){
              _self.setData({
                  activityId:res.data.data
              })
              tracking({
                  event: '07',
                  activityId:res.data.data,
                  eventState: '进入秒杀订单详情页'
              })
          }
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getPageDetail();
    if(this.data.activityId){
        tracking({
            event: '07',
            activityId:this.data.activityId,
            eventState: '进入秒杀订单详情页'
        })
    }
  },

  getPageDetail(){
    get(paths.orderDetail,{
        orderId:this.data.orderId
    },res=>{
        if(res.data.status==200){
          res.data.data.statusname = statusname[res.data.data.status]
          this.setData({
            order:res.data.data
          })
          if(res.data.data.status==1){
            this.setData({
              endtime:res.data.data.orderTime+1800000
            })
            this.getTime();
          }else{
            if (this.timeline) {
              clearInterval(this.timeline);
            }
          }
          var ordertime = new Date(res.data.data.orderTime);
          var day = ordertime.getDate();
          var hour = ordertime.getHours();
          var year = ordertime.getFullYear();
          var month = ordertime.getMonth() + 1;
          var minute = ordertime.getMinutes();
          var seconds = ordertime.getSeconds();
          this.setData({
            ordertime:`${year}-${month}-${day} ${hour}:${month}:${seconds}`
          })
        }
    })
  },
  getTime(){
    var _self=this;
    get(paths.getTime,{},function(res){            
        _self.setData({
            now: res.data.data
        })
        _self.startcountdown()
    })
  },
  startcountdown: function() {
      if (this.timeline) {
          clearInterval(this.timeline);
      }
      this.countdown(this.data.now);
      this.timeline = setInterval(()=>{
        this.countdown(this.data.now+1000);
      }, 1000);
  },
  countdown(now){
    var remaintime = this.data.endtime-now;
    if(remaintime<0){
      //setTimeout(this.getPageDetail,1500);
      var order=this.data.order;
      order.status=7;
      order.statusname = statusname[7];
      this.setData({
        order:order
      })
    }else{
      var remainhour = Math.floor(remaintime / 3600000);
      var remainminute = Math.floor(remaintime % 3600000 / 60000);
      var remainsecond = Math.floor(remaintime % 60000 / 1000);
      this.setData({
          countdown: {
              remainhour: remainhour > 9 ? remainhour : '0' + remainhour,
              remainminute: remainminute > 9 ? remainminute : '0' + remainminute,
              remainsecond: remainsecond > 9 ? remainsecond : '0' + remainsecond,
          },
          now: now,
      })
    }
  },
  cancelOrder(){
      tracking({
          event: '12',
          eventState: '点击取消订单',
      })
    get(paths.orderCancel,{
      orderId:this.data.orderId
    },response=>{
      this.getPageDetail()
    })
  },
  returnOrder(){        
    const openid = wx.getStorageSync('openid');
    const cid = wx.getStorageSync('member').cid;
    if(!cid){
        wx.navigateTo({
            url: `${app.globalData.loginPath}?sourceid=${this.data.activityId}&from=秒杀订单`
        })
        return;
    }
    get(paths.refundCoupon,{
      cid:cid,
      orderId:this.data.orderId,
      //activityId:activityId
    },respons=>{
      this.getPageDetail()
    })
  },
  payOrder(){
      tracking({
          event: '12',
          eventState: '点击立即支付',
      })
    var payInfo = JSON.parse(this.data.order.payPreInfo);
    payInfo.orderId = this.data.orderId;    
    this.pay(payInfo);
  },
  pay: function(payInfo) {
    var _self=this;
    wx.requestPayment({
        timeStamp: payInfo.timeStamp+'',
        nonceStr: payInfo.nonceStr,
        package: payInfo.package,
        signType: payInfo.signType,
        paySign: payInfo.paySign,
        success: function(res) {
            get(paths.payStatus,Object.assign({msg:res.errMsg},payInfo),function(response){
              if(response.data.status==200){
                //_self.getPageDetail()
                wx.reLaunch({
                    url: '../orderresult/orderresult?status=1&orderId=' + payInfo.orderId,
                    success: function(res) {
                        tracking({
                            event: '07',
                            eventState: '跳转成功'
                        })
                    },
                    fail: function(res) {
                        tracking({
                            event: '07',
                            eventState: '跳转失败'
                        })
                    }
                });
              }
            },function(){},true)
        },
        fail: function(res) {
            get(paths.payStatus,Object.assign({msg:res.errMsg},payInfo),function(response){
                // if(res.errMsg!="requestPayment:fail cancel"&&response.data.message){
                //   wx.showToast({
                //     title:response.data.message,
                //     duration: 3000,
                //     icon:"none"
                //   })
                // }
            },function(){},true)
        }
    });
  },
})