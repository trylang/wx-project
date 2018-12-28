// pages/components/tdlist/tdlist.js

const app = getApp()
const util = require('../../../utils/util.js');
import { tracking } from '../../../rtmap/coupons/utils/track.js'
Component({
  //页面变量
  data: {
    tdttContent: [],
    pageNum: 1,
    pages: 10000
  },
  ready: function () {
    var That = this;
    // That.getCSetPage();
    That.getWorld(1, 10);
    That.addTdttBrowse();
  },
  /*getCSetPage:function(){
   console.log(app.globalData.tenantId)
     util.localityRequest('/weimao-new-project/world/cSetPage',{
       portalId:app.globalData.tenantId
     },'get',function(res){
       if (res.data.code==200){
         if (res.data.data!=0) {
           console.log(res.data.data)
         }
       }else{console.log(res);}},
     function(res){console.log(res)});
  },*/

  methods: {
    godetail: function (e) {
      tracking({
        event: '07',
        eventState: '天地头条详情'
      })
      var id = e.currentTarget.dataset.id
      var That = this;
      That.addBrowse(id);
    },
    onReachBottom: function () {
      var that = this;
      var num = that.data.pageNum;
      num++;
      that.setData({ pageNum: num });
      // 显示加载图标
      wx.showLoading({
        title: '玩命加载中',
      })
      if (num <= that.data.pages) {
        that.getWorld('pull');
      }

      wx.hideLoading();
    },
    getWorld: function (pull) {
      var That = this;
      util.localityRequest('/weimao-new-project/world/getWorld', {
        portalId: app.globalData.tenantId,
        pageNum: That.data.pageNum,
        pageSize: 10
      }, 'post', function (res) {
        if (res.data.code == 200) {
          console.log(res.data.data)
          That.setData({ pages: res.data.data.pages });
          var data = res.data.data.list.length <= 0 ? [] : res.data.data.list;
          for (var i = 0; i < data.length; i++) {
            data[i].sort = i + 1;
          };
          if (pull == 'pull') {
            if (data.length <= 0) {
              wx.showLoading({
                title: '已经到头了哦!',
              });
              return;
            }

            data = That.data.tdttContent.concat(data);
          }

          That.setData({ tdttContent: data });
          That.duallist();
          console.log(That.data.tdttContent)
        } else { console.log(res); }
      },
        function (res) { console.log(res) });
    },
    duallist: function () {
      var That = this;
      var left = 0;
      var right = 0;
      var rightheight = 0;
      var query = wx.createSelectorQuery().in(this);
      query.selectAll('.outer_sphere').boundingClientRect(function (rect) {
        left = rect[0].bottom
        right = rect[1].bottom
        if (right > left) {
          query.selectAll('.rightclass').boundingClientRect(function (rect1) {
            var height = rect1[rect1.length - 1].height;
            if (height < right - left) {
              var index = rect1[rect1.length - 1].dataset.index
              var data = That.data.tdttContent
              data[index].sort = rect1[rect1.length - 1].dataset.sort + 1
              That.setData({ tdttContent: data });
              That.duallist();
            }
          }).exec()
        }
      }).exec()

    },
    addBrowse: function (id) {
      let that = this;
      util.localityRequest('/weimao-new-project/world/addBrowse', {
        id: id
      }, 'get', function (res) {
        if (res.data.code == 200) {
          /*   for (var i = 0; i < that.data.tdttContent.length; i++) {
               if (that.data.tdttContent[i].id==id) {
                 if (that.data.tdttContent[i].isUrl==2) {
                   console.log("that.data.tdttContent[i].detailUrl++++++++++")
                   console.log(that.data.tdttContent[i].detailUrl)
                   wx.navigateTo({
                    url:'../../../'+that.data.tdttContent[i].detailUrl
                   });
                 }
               }
             };*/
          // if (that.data.tdttContent) {};
          wx.navigateTo({
            url: '/pages/tdtt_world/details/index?id=' + id
          });
        } else { console.log(res); }
      },
        function (res) { console.log(res) });
    },
    addTdttBrowse: function () {
      var mobile = wx.getStorageSync('mobile');
      var openid = wx.getStorageSync('openid');
      util.localityRequest('/weimao-new-project/world/addTDTTBrowse', {
        "openId": openid,
        "worldId": "0",
        "photo": mobile,
        "portalId": app.globalData.tenantId,
        "pageState": "0",
      }, 'post', function (res) {
        if (res.data.code == 200) {
        } else { console.log(res); }
      },
        function (res) { console.log(res) });
    }
  }
})
