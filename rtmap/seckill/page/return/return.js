// rtmap/miaosha/page/return/return.js
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
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:290,
    cause:"",
    causeList:{
      0:"计划有变，没时间消费",
      1:"买多了/买错了/重复下单",
      2:"网上评价不好",
      3:"其他"
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _self=this;
    if(!options.orderId){
      return;
    }
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
                  eventState: '进入秒杀退款页'
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
            eventState: '进入秒杀退款页'
        })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  changeSelect(event){
    var target = event.currentTarget;
    this.setData({
      cause:target.dataset.cause
    })
  },
  getPageDetail(){
    get(paths.orderDetail,{
        orderId:this.data.orderId
    },res=>{
        if(res.data.status==200){
          //res.data.data.statusname = statusname[res.data.data.status]
          this.setData({
            order:res.data.data
          })
          // if(res.data.data.status==1){
          //   this.setData({
          //     endtime:res.data.data.orderTime+1800000
          //   })
          //   this.getTime();
          // }else{
          //   if (this.timeline) {
          //     clearInterval(this.timeline);
          //   }
          // }
          // var ordertime = new Date(res.data.data.orderTime);
          // var day = ordertime.getDate();
          // var hour = ordertime.getHours();
          // var year = ordertime.getFullYear();
          // var month = ordertime.getMonth() + 1;
          // var minute = ordertime.getMinutes();
          // var seconds = ordertime.getSeconds();
          // this.setData({
          //   ordertime:`${year}-${month}-${day} ${hour}:${month}:${seconds}`
          // })
        }
    })
  },
  returnOrder(){        
    const openid = wx.getStorageSync('openid');
    const cid = wx.getStorageSync('member').cid;
    if(!cid){
        wx.navigateTo({
            url: `${app.globalData.loginPath}?sourceid=${this.data.activityId}&from=秒杀退款`
        })
        return;
    }
    if(this.data.cause==""){
      wx.showToast({
          title: '请选择退款原因！',
          duration: 3000,
      })
      return;
    }
    get(paths.refundCoupon,{
      cid:cid,
      orderId:this.data.orderId,
      //activityId:activityId,
      refundMsg:this.data.causeList[this.data.cause]
    },respons=>{
      wx.navigateBack()
    })
  }
})