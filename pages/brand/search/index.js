//index.js
//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {tracking} from '../../../rtmap/coupons/utils/track.js'
Page({
  //页面变量
  data: {
    ent:"",
    delVal:"",
    think:"conHide",
    record:"conHide",
    noItems:"conHide",
    listHistory:[],
    conAll:[],
    keyAdmin:"",
    openid:"",
    buildId:"",
    channel:"WXC",
    openid:"",
    pageNum:1,
    floor:"",
    classId:"",
    poiName:"",
    letters:""
  },
  inputChange:function(e){
    var that=this;
    that.setData({searchCon:"conHide"});
    that.setData({record:"conHide"});
    that.setData({think:""});
    var name=e.detail.value;
    that.setData({poiName:name});
    that.getConAll();
    that.setData({storeName:name});
  }, 
  delSearch:function(){
    this.setData({delVal:""});
    this.delVal="";
  },

  dedupe(arr){
    var res=[];
    for(var i=0,len=arr.length;i<len;i++){
        var obj = arr[i];
        for(var j=0,jlen = res.length;j<jlen;j++){
            if(res[j]===obj) break;            
        }
        if(jlen===j)res.push(obj);
    }
    return res;
  },
  getThink:function(e){
    var that=this;
    var name =e.currentTarget.dataset.text;
    var poiName=e.currentTarget.dataset.name;
    var list=that.data.listHistory?that.data.listHistory:[];
    if(list.length>=10){
      list.pop(10);
      list.unshift(poiName);
    }else{
      list.unshift(poiName);
    }
    var setArr =  this.dedupe(list)
    
    wx.setStorageSync('listHistory',setArr);
    that.setData({listHistory:setArr});
    console.log(e)
     var floor=e.currentTarget.dataset.floor;
    var poiNo=e.currentTarget.dataset.poino;
    var poiId=e.currentTarget.dataset.text;
    var poiNumber=e.currentTarget.dataset.poinumber;
      tracking({
          event: '07',
          eventState: '品牌导览详情'
      })
    wx.navigateTo({
      url: '../details/index?buildId='+that.data.buildId+'&openid='+that.data.openid+'&poiNo='+poiNo+'&floor='+floor+'&poiId='+poiId+'&poiNumber='+poiNumber,
      success: function (res) {
          that.setData({
            delVal:''
          })
      },
      fail: function (res) {
      }
    });
  },
  conHistory:function(e){
    var that=this;
    var textHistory=e.currentTarget.dataset.text;
     that.setData({searchCon:"conHide"});
    that.setData({think:""})
    this.setData({ent:textHistory});
    this.setData({delVal:textHistory});
    that.setData({poiName:textHistory});
    that.getConAll();
    that.setData({storeName:textHistory});
  },
  delHistory:function(){
    var list =[];
    var that=this;
    wx.setStorageSync("listHistory",list);
    that.setData({listHistory:list});
  },
  onLoad: function (options) {
    var list = wx.getStorageSync('listHistory')
    if (list.length) {var ent=list[0];}else{var ent="请输入店铺名字查询"}
    this.setData({ent:ent});
    this.setData({listHistory:list});
    var that =this;
    var openId=wx.getStorageSync('openid');
    var buildList=wx.getStorageSync('buildList');
    var buildid=buildList[0].buildIdStr;
    var keyAdmin=wx.getStorageSync('keyAdmin');
    var tenantId=app.globalData.tenantId;

    that.setData({keyAdmin:keyAdmin});
    that.setData({buildId:buildid});
    that.setData({openid:openId});
    if(list.length<=0){
      that.setData({record:""});
      that.setData({searchCon:"conHide"});
      that.setData({noItems:"conHide"});
    }

  },
  onShow: function () {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },
  getUserInfo: function(e) {

  },

  getConAll:function(a){
    var that=this;
     //获取列表
      util.memoRequest(util.portsEndUrl.getQueryPois,{
        keyAdmin:that.data.keyAdmin,
        buildId:that.data.buildId ,
        pageNum:that.data.pageNum,
        pageSize:5,
        poiName:that.data.poiName,
        classId:that.data.classId,
        floor:that.data.floor,
        channel:that.data.channel
      },'post',function(res){
        if(res.data.code==200){
          console.log(res.data);
          if(a=="pull"){
            var con=that.data.conAll;
            con=that.data.conAll.concat(res.data.poilist);
            that.setData({conAll:con});
            if(that.data.conAll.length<=0){
               wx.showLoading({
                title: '已经到头了哦!',
              })
            }
          }else{
            that.setData({conAll:res.data.poilist});
             if(that.data.conAll.length<=0){
              that.setData({noItems:""});
              that.setData({think:"conHide"});
            }else{
              that.setData({noItems:"conHide"});
              that.setData({think:""});
            }
          }
      }else{
        console.log(res);
      }},
      function(res){console.log(res)});

  }
})
