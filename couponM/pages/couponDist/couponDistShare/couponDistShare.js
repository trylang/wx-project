// couponM/pages/couponDist/couponDistShare/couponDistShare.js
import {
  requestEndPoints,
  httpWithParameter,
  postRequestWithParameter
} from '../../../utils/httpUtil.js'
import {
  tracking
} from '../../../utils/track.js'
const util = require('../../../utils/util.js')
var app = getApp()
var width = 750
var maxWidth = 400
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    productId: '',
    coupon: null,
    windowW: 750,
    windowH: 1334,
    shareImg: '',
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage(options) {
    let currentPage = getCurrentPages()[getCurrentPages().length - 1].route
    return {
      title: this.data.coupon.product.mainInfo,
      imageUrl: this.data.shareImg,
      path: `${currentPage}?productId=${this.data.productId}&user=${JSON.stringify(this.data.userInfo)}`,
      success: function (res) { },
      fail: function (res) { }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.context = wx.createCanvasContext('share')
    this.getProductDetail(options.productId, (coupon) => {
      this.setData({
        productId: options.productId || '',
        userInfo: options.user ? JSON.parse(options.user) : '',
        coupon: coupon || {}
      });
      //px转rpx
      let res = wx.getSystemInfoSync()
      this.setData({
        windowW: res.windowWidth,
        windowH: res.windowHeight,
      })
      this.context.setFillStyle('#fff');
      this.context.fillRect(0, 0, 750, 960)
      this.context.draw();
      wx.downloadFile({
        url: 'https://res.rtmap.com/wx/couponM/collage_share_bg.png',
        success: res => {
          if (res.statusCode == 200) {
            this.context.drawImage(
              res.tempFilePath, 0, 0, this.formatRPX(width), this.formatRPX(960));
            /**
            * 绘制文字
            */
            this.drawText();
            /**绘制券图片*/
            this.drawCouponImg();
            /**绘制头像*/
            this.drawUserFace();
            /**绘制二维码*/
            this.drawQrCode();
          }
        }
      })
    });
  },

  drawText() {
    let str = ''
    str = this.formatText(this.data.userInfo.nickName)
    this.context.setFontSize(this.formatRPX(25))
    this.context.setFillStyle('#000000')
    this.context.fillText(str, (this.formatRPX(width) - this.context.measureText(str).width) / 2, this.formatRPX(156), this.formatRPX(maxWidth))

    str = this.formatText(this.data.coupon.detail.extendInfo)
    this.context.setFontSize(this.formatRPX(21))
    this.context.setFillStyle('#DD3A7B')
    this.context.fillText(str, (this.formatRPX(width) - this.context.measureText(str).width) / 2, this.formatRPX(189), this.formatRPX(maxWidth))

    str = this.formatText(this.data.coupon.detail.mainInfo)
    this.context.setFontSize(this.formatRPX(24))
    this.context.setFillStyle('#000000')
    this.context.fillText(str, this.formatRPX(170), this.formatRPX(660), this.formatRPX(maxWidth))

    this.drawLineText(this.data.coupon.detail.descClause)

    str = this.formatText(`特惠价：`)
    this.context.setFontSize(this.formatRPX(24))
    this.context.setFillStyle('#E8356E')
    this.context.fillText(str, this.formatRPX(170), this.formatRPX(780), this.formatRPX(maxWidth))

    str = this.formatText(`￥${this.data.coupon.product.price * 0.01}`)
    this.context.setFontSize(this.formatRPX(32))
    this.context.setFillStyle('#E8356E')
    this.context.fillText(str, this.formatRPX(210) + this.context.measureText(str).width, this.formatRPX(780), this.formatRPX(maxWidth))

      str = this.formatText(`门店价：${this.data.coupon.detail.cost * 0.01}`)
    this.context.setFontSize(this.formatRPX(22))
    this.context.setFillStyle('#C8C6C6')
    this.context.fillText(str, this.formatRPX(170), this.formatRPX(820), this.formatRPX(maxWidth))

    this.context.setStrokeStyle('#C8C6C6')
    this.context.moveTo(this.formatRPX(170), this.formatRPX(812))
    this.context.lineTo(this.formatRPX(170) + this.context.measureText(str).width, this.formatRPX(812))
    this.context.stroke()

    str = this.formatText('长按识别小程序二维码')
    this.context.setFontSize(this.formatRPX(12))
    this.context.setFillStyle('#000')
    this.context.fillText(str, this.formatRPX(450), this.formatRPX(860), this.formatRPX(maxWidth))
  },

  drawLineText(text) {
    if (!text) return;
    var chr = text.split(""); //这个方法是将一个字符串分割成字符串数组
    var temp = "";
    var row = [];
    this.context.setFontSize(this.formatRPX(20))
    this.context.setFillStyle('#000000')
    for (var a = 0; a < chr.length; a++) {
      if (this.context.measureText(temp).width < this.formatRPX(maxWidth)) {
        temp += chr[a];
      } else {
        a--; //这里添加了a-- 是为了防止字符丢失，效果图中有对比
        row.push(temp);
        temp = "";
      }
    }
    row.push(temp);

    //如果数组长度大于2 则截取前两个
    if (row.length > 2) {
      var rowCut = row.slice(0, 2);
      var rowPart = rowCut[1];
      var test = "";
      var empty = [];
      for (var a = 0; a < rowPart.length; a++) {
        if (this.context.measureText(test).width < (this.formatRPX(maxWidth) - 30)) {
          test += rowPart[a];
        } else {
          break;
        }
      }
      empty.push(test);
      var group = empty[0] + "..." //这里只显示两行，超出的用...表示
      rowCut.splice(1, 1, group);
      row = rowCut;
    }
    for (var b = 0; b < row.length; b++) {
      this.context.fillText(row[b], this.formatRPX(170), this.formatRPX(690) + b * 12, 300)
    }
  },
  /**
    * 绘制券图片
    */
  drawCouponImg() {
    let couponImage = this.data.coupon.detail.couponImageList ?
      this.data.coupon.detail.couponImageList[0] ?
        this.data.coupon.detail.couponImageList[0].imgUrl :
        this.data.coupon.detail.imgLogoUrl :
      this.data.coupon.detail.imgLogoUrl;
    couponImage = couponImage.replace("http://", "https://");
    if (couponImage) {
      wx.downloadFile({
        url: couponImage,
        success: res => {
          if (res.statusCode == 200) {
            wx.getImageInfo({
              src: res.tempFilePath,
              success: img => {
                var w = img.width
                var h = img.height
                var x = this.formatRPX(394);
                var dw = x / w          //canvas与图片的宽高比
                var dh = x / h
                if (dw > dh) {
                  this.context.drawImage(img.path, 0, (h - x / dw) / 2, w, x / dw, this.formatRPX(177), this.formatRPX(233), x, x)
                } else {
                  this.context.drawImage(img.path, (w - x / dh) / 2, 0, x / dh, h, this.formatRPX(177), this.formatRPX(233), x, x)
                }
              },
            });
            // this.context.drawImage(res.tempFilePath, this.formatRPX(177), this.formatRPX(233), this.formatRPX(394), this.formatRPX(394));
          }
        },
        fail: res => {
          console.log(res);
        }
      })
    }
  },
  /**
   * 最后绘制头像
   */
  drawUserFace() {
    wx.downloadFile({
      url: this.data.userInfo.avatarUrl,
      success: res => {
        if (res.statusCode == 200) {
          this.context.save();
          this.context.arc(this.formatRPX(376), this.formatRPX(80), this.formatRPX(46), 0, Math.PI * 2, false);
          this.context.clip();
          this.context.drawImage(
            res.tempFilePath,
            this.formatRPX(330),
            this.formatRPX(30),
            this.formatRPX(92),
            this.formatRPX(92));
          this.context.restore()
        }
      },
      fail: res => {
        console.log(res);
      }
    })
  },
  /**
   * 绘制二维码
   */
  drawQrCode() {
    wx.getImageInfo({
      // src: `${requestEndPoints.getQR}?appId=${app.globalData.appId}&openId=${wx.getStorageSync('openid')}&productId=${this.data.productId}&width=${Math.floor(this.formatRPX(120))}&page=` + `couponM/pages/groupDetail/groupDetail?productId=${this.data.productId}`,
        src: `${requestEndPoints.getQR}?appId=${app.globalData.appId}&openId=${wx.getStorageSync('openid')}&productId=${this.data.productId}&width=${Math.floor(this.formatRPX(120))}&page=` + `couponM/pages/groupDetail/groupDetail`,
      success: (sharebg) => {
        sharebg.path && this.context.drawImage(sharebg.path, this.formatRPX(450), this.formatRPX(720), this.formatRPX(120), this.formatRPX(120)); //二维码
        this.context.draw(true)
      },
      fail: (res) => {
        console.log('fail', res);
      },
      complete: (res) => {
        console.log('complate', res);
      }
    });

  },

  formatRPX(px) {
    return this.data.windowW / width * px
  },

  formatText(str) {
    let strWidth = this.context.measureText(str).width
    if (strWidth > maxWidth) {
      var temp = "";
      let textArea = str.split('')
      for (var a = 0; a < textArea.length; a++) {
        if (this.context.measureText(temp).width < (maxWidth - 20)) {
          temp += textArea[a];
        } else {
          a--;
          break;
        }
      }

      return temp + '...'
    }
    return str
  },

  saveImg() {
      tracking({
          event: '12',
          eventState: '分销返现-点击保存图片'
      })
    wx.getSetting({
      success: function (res) {
        console.log(res.authSetting)
        if (res.authSetting['scope.writePhotosAlbum']) {
          wx.canvasToTempFilePath({
            canvasId: 'share',
            success: function (res) {
              console.log(res.tempFilePath)
              wx.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: res => {
                  wx.showToast({
                    title: '图片保存成功',
                    icon: 'success',
                    duration: 2000,
                    mask: true
                  })
                }
              })
            }
          })
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: function (res) {
              wx.canvasToTempFilePath({
                canvasId: 'share',
                success: function (res) {
                  console.log(res.tempFilePath)
                  wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function (res) { },
                    fail: function (res) { },
                    complete: function (res) { },
                  })
                }
              })
            },
            fail: () => {
              wx.openSetting()
            }
          })
        }
      }
    })
  },

  getProductDetail(id, callback) {
    httpWithParameter({
      endPoint: requestEndPoints.productDetail,
      data: {
        portalId: app.globalData.tenantId,
        productId: id,
      },
      success: (res) => {
        if (res.data.status == 200) {
          if (res.data.data.type == 0) {
            //普通券
            let normalCoupon = res.data.data.data.detail
            if (normalCoupon) {
              normalCoupon.imgtxtInfo = normalCoupon.imgtxtInfo && util.formatImgTxt(normalCoupon.imgtxtInfo)
              if (normalCoupon.effectiveType == 0) {
                normalCoupon.validTime = `${normalCoupon.effectiveStartTime} 至 ${normalCoupon.effectiveEndTime}`
              } else if (normalCoupon.effectiveType == 1) {
                normalCoupon.validTime = normalCoupon.activedLimitedStartDay == 0 ? `领取后当天生效,有效期${normalCoupon.activedLimitedDays}天` : `领取${normalCoupon.activedLimitedStartDay}天后生效,有效期${normalCoupon.activedLimitedDays}天`
              } else {
                normalCoupon.validTime = ''
              }
              
            }
          }
          callback(res.data.data.data);
        }
      },
      fail: (res) => { }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
      tracking({
          event: '06',
          eventState: '进入成功'
      })
  },
})