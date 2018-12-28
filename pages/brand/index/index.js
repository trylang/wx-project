//index.js
//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {tracking} from '../../../rtmap/coupons/utils/track.js'
Page({
  //页面变量
  data: {
    navigatorBrand:"conHide",
    handleclick:'',
    hiddenBody:"hidden",
    noItems:"conHide",
    scrollfixed:'',
    navigatorLetter:"conHide",
    levelCtriangleRotate:"rorate-top",
    businessCtriangleRotate:"rorate-top",
    discountsCtriangleRotate:"rorate-top",
    levelName:"全部楼层",
    businessName:"全部业态",
    discountsName:"全部",
    conAll:[],
    poilist:[],
    activity:[],
    level:[],
    business:[],
    discounts:[
    {name:"",vlaue:"全部"},{name:"A,B,C",vlaue:"A-C"},{name:"D,E,F",vlaue:"D-F"},
    {name:"G,H,I",vlaue:"G-I"},{name:"J,k,L",vlaue:"J-L"},{name:"M,N,O",vlaue:"M-O"},
    {name:"P,Q,R",vlaue:"P-R"},{name:"S,T,U",vlaue:"S-U"},{name:"V,W,X",vlaue:"V-X"},
    {name:"Y,Z",vlaue:"Y-Z"}],
    keyAdmin:"",
    openid:"",
    buildId:"",
    channel:"WXC",
    openid:"",
    pageNum:1,
    floor:"",
    classId:"",
    poiName:"",
    letters:"",
    poiId:[]
  },
  //事件处理函数
  inputbind:function(){
    let that=this;
      tracking({
          event: '07',
          eventState: '检索店铺'
      })
      wx.navigateTo({ 
         url:'../search/index?buildId='+that.data.buildId+'&openid='+that.data.openid+'&poiNo='+that.data.poiNo+'&floor='+that.data.floor+'&poiId='+that.data.poiId+'&poiNumber='+that.data.poiNumber
    });
  },
  handleclick(){
    
  },
  level: function() {
    var that=this;
    if (that.data.navigatorBrand=='') {
      that.navigatorHide();
      return;
    };
    this.setData({scrollfixed:"scroll-fixed"});
    this.setData({navigatorOld:""});
    this.setData({navigatorLetter:"conHide"});
    this.setData({levelC:"navigator-name"});
    this.setData({businessC:""});
    this.setData({navigatorLetter:"conHide"});
    this.setData({discountsC:""});
    this.setData({levelCtriangleRotate:"rorate-bot"});
    this.setData({businessCtriangleRotate:"rorate-top"});
    this.setData({discountsCtriangleRotate:"rorate-top"});
    this.setData({navigatorBrand:""});
    this.setData({navigatorName:"全部楼层"});
    this.setData({backNavigator:""});
    this.setData({navigatorContent:that.data.level});
  },
  business: function() {
    var that=this;
    if (that.data.navigatorBrand=='') {
      that.navigatorHide();
      return;
    };
    this.setData({scrollfixed:"scroll-fixed"});
    this.setData({navigatorOld:""});
    this.setData({navigatorLetter:"conHide"});
    this.setData({navigatorName:""});
    this.setData({levelC:""});
    this.setData({navigatorLetter:"conHide"});
    this.setData({businessC:"navigator-name"});
    this.setData({discountsC:""});
    this.setData({levelCtriangleRotate:"rorate-top"});
    this.setData({businessCtriangleRotate:"rorate-bot"});
    this.setData({discountsCtriangleRotate:"rorate-top"});
    this.setData({navigatorBrand:""});
    this.setData({backNavigator:""});
    this.setData({navigatorContent:that.data.business});
  },
  discounts: function() {
     var that=this;
    if (that.data.navigatorBrand=='') {
      that.navigatorHide();
      return;
    };
    this.setData({scrollfixed:""});
    this.setData({businessC:""});
    this.setData({levelC:""});
    this.setData({discountsC:"navigator-name"});
    this.setData({businessCtriangleRotate:"rorate-top"});
    this.setData({levelCtriangleRotate:"rorate-top"});
    this.setData({discountsCtriangleRotate:"rorate-bot"});
    this.setData({navigatorBrand:""});
    this.setData({backNavigator:""});
    this.setData({navigatorOld:"conHide"});
    this.setData({navigatorLetter:""});
    this.setData({navigatordiscounts:that.data.discounts});
  },
  navigatorHideName:function(e){
    var that=this;
    that.navigatorHide();
    that.setData({levelName:"全部楼层"});
    var name=e.currentTarget.dataset.text;
    var str = name.split('+');
    if(str[0]==""||str[0]=="全部楼层"){
      var val=str[2];
      that.setData({bindCont:val});  
      this.setData({levelName:val});
      that.setData({pageNum:1});
      val=str[1];
      that.setData({floor:val});
      // this.setData({businessName:"全部业态"});
      // this.setData({discountsName:"全部"});
      that.setData({levelName:"全部楼层"});
      that.navigatorHide();
      that.getConAll();
    }
  },
  navigatorHide:function(){
    this.setData({navigatorBrand:"conHide"});
    this.setData({scrollfixed:""});
    this.setData({levelC:""});
    this.setData({businessC:""});
    this.setData({discountsC:""});
    this.setData({levelCtriangleRotate:"rorate-top"});
    this.setData({businessCtriangleRotate:"rorate-top"});
    this.setData({discountsCtriangleRotate:"rorate-top"});
  },
  goDetails:function(e){
    var that =this;
    var floor=e.currentTarget.dataset.floor;
    var poiNo=e.currentTarget.dataset.poino;
    var poiId=e.currentTarget.dataset.text;
    var poiNumber=e.currentTarget.dataset.poinumber;
    wx.navigateTo({
      url: '../details/index?buildId='+that.data.buildId+'&openid='+that.data.openid+'&poiNo='+poiNo+'&floor='+floor+'&poiId='+poiId+'&poiNumber='+poiNumber
    });
  },
  getItemsDiscounts:function(e){
    var that=this;
    var name=e.currentTarget.dataset.text;
    var str = name.split('+');
    var val=str[0];
    that.setData({bindCont:val});  
    this.setData({discountsName:val});
    that.navigatorHide();
    val=str[1];
    that.setData({pageNum:1});
    this.setData({letters:val});
    console.log(that.data.letters);
    that.getConAll();
  },
  getItems:function(e){
    var that=this;
    var name=e.currentTarget.dataset.text;
    var str = name.split('+');
    if(str[0]==""||str[0]=="全部业态"){
      var val=str[2];
      that.setData({businessName:val});
      that.setData({bindCont:val});  
      if(val=="全部"){val="";}
      val=str[1];
      that.setData({classId:val});
      that.navigatorHide();
      that.setData({pageNum:1});
      that.getConAll();
    }else{
      var val=str[2];
      that.setData({bindCont:val});  
      this.setData({levelName:val});
      that.setData({pageNum:1});
      val=str[1];
      that.setData({floor:val});
      that.navigatorHide();
      that.getConAll();
    }
  },
  myTouchmove(){

  },
  onReachBottom: function () {
    var that = this;
    var num=that.data.pageNum;
    num++;
    that.setData({pageNum:num});
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    that.getConAll('pull');
    wx.hideLoading();
  },
  onLoad: function () {
    var that =this;
    var buildList=wx.getStorageSync('buildList');
    var keyAdmin=wx.getStorageSync('keyAdmin');
    var openId=wx.getStorageSync('openid');
    var buildid=buildList[0].buildIdStr;
    var tenantId=app.globalData.tenantId;
    that.setData({keyAdmin:keyAdmin});
    that.setData({buildId:buildid});
    that.setData({openid:openId});
    that.getClassName();
    that.getFloor();
    that.getConAll();
    that.getPoilist();
    wx.getSystemInfo({
      success: function(res) {  
        var h=res.windowHeight-112;
        that.setData({hei:h});
        // that.setData({heibody:res.windowHeight});
        that.setData({widthBody:res.windowWidth-20});
    }});
    if (!wx.getStorageSync('isLoginSucc')) {
        this.setData({ chanceNum: '-'});
    }
  },
  onShow: function () {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
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
        letters:that.data.letters,
        channel:that.data.channel
      },'post',function(res){
        if(res.data.code==200){
          console.log(res);
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
            }else{
              that.setData({noItems:"conHide"});
            }
          }
          for (let i = 0; i <that.data.conAll.length; i++) {
            that.getPoid(i,that.data.conAll[i].id);
          };
        
      }else{ console.log(res);}},
      function(res){console.log(res)});

  },
  getPoilist:function(){
    var that =this;
      util.memoRequest(util.portsEndUrl.getQueryRecPois,{
        keyAdmin:that.data.keyAdmin,
        buildId:that.data.buildId,
      },'post',function(res){
        if(res.data.code==200){
         that.setData({poilist:res.data.poilist});
         console.log(that.data.poilist)
         console.log(res)
      }else{console.log(res);}},
      function(res){console.log(res)});
  },
  getPoid:function(i,id){
    var that =this;
      util.memoRequest(util.portsEndUrl.getQueryActionsByPoiId,{
        keyAdmin:that.data.keyAdmin,
        buildId:that.data.buildId,
        openid:that.data.openid,
        poiId:id
      },'post',function(res){
        if(res.data.code==200){
          var str=''
          if(res.data.actionlist.length){
            str = res.data.actionlist[0].title
          }else{
            str = ''
          }
          // that.data.activity.push(str)
          that.data.activity[i]=str;
          that.setData({activity:that.data.activity});
      }else{console.log(res);}},
      function(res){console.log(res)},false);

  },
  getClassName:function(){
    var that=this;
    //获取业态
      util.memoRequest(util.portsEndUrl.getQueryClass,{
        keyAdmin:that.data.keyAdmin,
        buildId:that.data.buildId,
      },'post',function(res){
        if(res.data.code==200){
          var bus=res.data.classlist;
          var business=[];
          for (var i = bus.length - 1; i >= 0; i--) {
            business.unshift({name:bus[i].id,vlaue:bus[i].className});
          };
          that.setData({business:business});
      }else{console.log(res);}},
      function(res){console.log(res)});
  },
  getFloor:function(){
    var that =this;
     //获取楼层
      util.memoRequest(util.portsEndUrl.getQueryFloors,{
        keyAdmin:that.data.keyAdmin,
        buildId:that.data.buildId ,
      },'post',function(res){
        if(res.data.code==200){
          var bus=res.data.floorlist;
          var level=[];
          for (var i = bus.length - 1; i >= 0; i--) {
            if (bus[i].floorview&&bus[i].floorview!=null&&bus[i].floorview!='') {
              level.unshift({name:bus[i].floor,vlaue:bus[i].floorview});
            }else{
              level.unshift({name:bus[i].floor,vlaue:bus[i].floor});
            }
          };
          console.log(bus)
          that.setData({level:level});       
      }else{console.log(res);}},
      function(res){console.log(res)});
  },
  getUserInfo: function(e) {

  },
  onShareAppMessage(res) {
      //埋点数据
      tracking({
          event: '02',
          eventState: '转发'
      })
      return {
          title: '品牌导览',
          path: '/pages/brand/index/index',
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

})
