
//index.js
//获取应用实例
import { tracking } from '../../../rtmap/coupons/utils/track.js'
Page({
  //页面变量
  data: {
  },
  godetail: function (e) {
  },
  onLoad: function () {
    tracking({
      event: '06',
      eventState: '进入成功'
    })
  },
  onShow: function () {
    this.tdlist = this.selectComponent("#tdlist");
  },
  onReachBottom: function () {
    if (this.tdlist) {
      this.tdlist.onReachBottom()
    }
  }
})
