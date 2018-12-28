import {
  tracking
} from '../../utils/track.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ruleInfo: '',
    ruleLink: ''
  },

  onShow(){
      tracking({
          event: '06',
          eventState: '进入成功'
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.ruleLink) {
      this.setData({ruleLink: options.ruleLink});
    } else {
      this.setData({ruleInfo: wx.getStorageSync('carRuleInfo').ruleDesc});
    }
  },

})