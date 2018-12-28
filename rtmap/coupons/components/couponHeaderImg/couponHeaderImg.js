// components/couponitem/couponitem.js
var app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    "img":{
      value:"",
      type:String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height:750
  },

  /**
   * 组件的方法列表
   */
  methods: {
    scroll:function(e){
      var top = 750-e.detail.scrollTop*2;
      this.setData({
        height:top>0?top:0
      })
      // if(this.data.upper){
      //   if(e.detail.scrollTop>this.data["upper-threshold"]){
      //     this.setData({
      //       upper:false,
      //       height:0
      //     })
      //   }
      // }else{
      //   if(e.detail.scrollTop<this.data["upper-threshold"]){
      //     this.setData({
      //       upper:true
      //     })
      //   }
      // }
      // this.triggerEvent("scroll",{scrollTop:e.detail.scrollTop,isuper:this.data.upper});
    }
  }
})
