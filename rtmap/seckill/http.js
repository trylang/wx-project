var app = getApp();
const tenantId = app.globalData.tenantId;
const appID = app.globalData.appID;
const baseurl = app.globalData.BaseUrl+'wxapp-seckill';
var requestnum = 0;
export const addnum = function(){
  if (requestnum==0){
    wx.showLoading({
      title:"加载中...",
      mask:true
    })
  }
  requestnum++;
}
export const reducenum = function(){
  setTimeout(function(){
    requestnum--;
    if (requestnum==0){
      wx.hideLoading();
    }
  },1)
}
export const get=(url,data,callback,failback,noalert)=>{
  addnum();
  var openid = wx.getStorageSync('openid');
  var cid = wx.getStorageSync('member').cid;
  var obj = {
    tenantId:tenantId,
    wxAppId:appID
  };
  if(openid){
    obj.openId=openid
  }
  if(cid){
    obj.cid=cid
  }
  //var authorization = wx.getStorageSync("authorization");
  wx.Request({
    url: baseurl+url,
    method: "GET",
    header: {
      "Content-Type": "application/json",
      //"Authorization":authorization,      
      "Accept": "application/vnd.vpgame.v1+json"
    },
    data:Object.assign(obj,data),
    success: function (res){
      if(res.statusCode!=200){
        if(res.data.message){
          setTimeout(()=>{
            wx.showToast({
              title:res.data.message,
              duration: 3000,
              icon:"none"
            })
          },5)
          //return;
        }
      }else{
        if(res.data.status!=200&&!noalert){
          setTimeout(()=>{
            wx.showToast({
              title:res.data.message,
              duration: 3000,
              icon:"none"
            })
          },5)
        }
      } 
      setTimeout(function(){
        callback && callback(res);
      },10);
    },
    fail: function (error){
      failback && failback(error);
    },
    complete: function () {
      reducenum();
    }
  })
} 

export const post=(url,data,header,callback,failback,noalert)=>{
  //var authorization = wx.getStorageSync("authorization")
  if(typeof header=="function"){
    noalert = failback;
    failback = callback;
    callback = header;
    header = {};
  }
  //if(authorization){
  addnum();
  var openid = wx.getStorageSync('openid');
  var cid = wx.getStorageSync('member').cid;
  var obj = {
    tenantId:tenantId,
    wxAppId:appID
  };
  if(openid){
    obj.openId=openid
  }
  if(cid){
    obj.cid=cid
  }
  wx.Request({
    url: baseurl+url,
    method: "POST",
    header: Object.assign({
      "Content-Type": "application/json",
      //"Authorization":authorization,
      //"Accept": "application/vnd.vpgame.v1+json"
    },header),
    data:Object.assign(obj,data),
    success: function (res){
      if(res.statusCode!=200){
        if(res.data.message){
          setTimeout(()=>{
            wx.showToast({
              title:res.data.message,
              duration: 3000,
              icon:"none"
            })
          },5);
          //return;
        }
      }else{
        if(res.data.status!=200&&!noalert){
          setTimeout(()=>{
            wx.showToast({
              title:res.data.message,
              duration: 3000,
              icon:"none"
            })
          },5);
        }
      }        
      setTimeout(function(){
        callback && callback(res);
      },10);
    },
    fail: function (error){
      failback && failback(error);
    },
    complete: function () {
      reducenum();
    }
  })
  // }else{
  //   if(typeof noauth=="function"){
  //     noauth();
  //   }
  // }
} 

export const paths= {
  //获取普通场优惠券列表
  getCouponList:'/api/c/coupon/getList',
  //获取专场优惠券列表
  getSpecialList:'/api/c/coupon/special/getList',
  //获取券详情
  getCouponDetail:'/api/c/coupon/detail',
  //优惠券购买
  buyCoupon:'/api/c/coupon/buy',
  //优惠券下单状态
  buyCouponStatus:'/api/c/coupon/buy/status',
  //购买状态
  payStatus:'/api/c/pay/status',
  //优惠券退款
  refundCoupon:'/api/c/coupon/refund',
  //获取场次列表
  getFieldList:'/api/c/field/getList',
  //获取券批适用店铺
  getShopList:'/api/c/shop/getList',
  //获取服务器时间
  getTime:'/api/c/site/getTime',
  //获取会员类型
  getCardList:'/api/dropdown/getCardList',
  //开售提醒添加
  notifyAdd:'/api/c/notify/add',
  //开售提醒取消
  notifyCancel:'/api/c/notify/cancel',
  //券码详情
  qrcodeDetail:'/api/c/qrcode/detail',
  //订单详情
  orderDetail:'/api/c/order/detail',
  //订单取消
  orderCancel:'/api/c/order/cancel',
  //获取活动id
  getActivityId:'/api/c/activity/getId'
}