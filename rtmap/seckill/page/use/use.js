// rtmap/seckill/page/use/use.js
import {
    get,
    post,
    paths
} from '../../http.js';
import {
    tracking
} from '../../../coupons/utils/track.js'
import QR from '../../qrcode.js';
const app = getApp();
//const activityId = app.globalData.seckillActivityId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:230
  },
  writeOff() {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _self=this;
    if(options.orderId){
      this.setData({
        orderId:options.orderId
      })
    }
    get(paths.qrcodeDetail,{
        orderId:this.data.orderId
    },res=>{
        if(res.data.data.status==4){
          res.data.data.qrCode="no:0000000"
        }
        this.setData({
          info:res.data.data
        })
        var size = this.setCanvasSize();
        QR.api.draw(res.data.data.qrCode,"code_icon",size.w,size.h);
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
                eventState: '进入秒杀使用券页'
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
    if(this.data.activityId){
      tracking({
          event: '07',
          activityId:this.data.activityId,
          eventState: '进入秒杀使用券页'
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
  setCanvasSize:function(){
    var size={};
    try {
        var res = wx.getSystemInfoSync();
        var scale = 750/420;//不同屏幕下canvas的适配比例；设计稿是750宽
        var width = res.windowWidth/scale;
        var height = width;//canvas画布为正方形
        size.w = width;
        size.h = height;
      } catch (e) {
        // Do something when catch error
        console.log("获取设备信息失败"+e);
      } 
    return size;
  },
  onCallClick() {
      if (this.data.info.coupon.couponApplyShopList[0].mobile) {
          wx.makePhoneCall({
              phoneNumber: this.data.info.coupon.couponApplyShopList[0].mobile,
          })
      } else {
          wx.showToast({
              title: '该商家没有电话',
              icon: 'none',
              duration: 3000,
              mask: true,
              success: function(res) {},
              fail: function(res) {},
              complete: function(res) {},
          })
      }
  },
  navigationToShop() {
      const shop = this.data.info.coupon.couponApplyShopList[0];
      console.log(shop)
      if (shop.buildId && shop.floorId && shop.x && shop.y && shop.poiNo) {
          wx.navigateTo({
              url: `/rtmap/coupons/pages/webView/webView?buildBean=${JSON.stringify({ buildId: shop.buildId, floor: shop.floorId, x: shop.x, y: shop.y, poiNo:shop.poiNo, pageUrl: getCurrentPages()[getCurrentPages().length - 1].route})}`,
              success: (res) => {
                  tracking({
                      //activityId: activityId,
                      coupon: this.data.coupon.id,
                      event: '07',
                      eventState: '跳转成功'
                  })
              },
              fail: (res) => {
                  tracking({
                      //activityId: activityId,
                      coupon: this.data.coupon.id,
                      event: '07',
                      eventState: '跳转失败'
                  })
              }
          })
      } else {
          wx.showToast({
              title: '找不到店铺',
              icon: 'none',
              duration: 3000,
              mask: true,
          })
      }
  }
})