// components/couponitem/couponitem.js
var app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data:{
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusMap:{
     '2':'立即使用',
     '3':'已使用',
     '4':'已过期',
     '7':'已退券',
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    
  }
})
