// pages/couponDetail/couponDetail.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter
} from '../../../utils/httpUtil.js'
import {
  tracking
} from '../../../utils/track.js'
const util = require('../../../utils/util.js')
const app = getApp();
Page({
    /**
     * 页面的初始数据
     */
    data: {
        coupon: {
            mainInfo: '【COACH】百搭百变多色的衬衫空调衫',
            user: [{
                img: 'http://res.rtmap.com/sences/images/20180817/1534475906961.png'
            }, {
                img: 'http://res.rtmap.com/sences/images/20180817/1534475906961.png'
            }],
            imgLogoUrl: 'http://res.rtmap.com/sences/images/20180817/1534475906961.png',
        },
        distance: -1,
        qrCode: '',
        isMove: false,
        isFromShare: false,
        shopDetail: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        if (options.isFromShare) {
            this.setData({
                isFromShare: options.isFromShare == 'true'
            })
        }
        this.getGroupbuy(options.groupbuyId)
    },
    /**
     * 获取详情数据
     */

    getGroupbuy(id) {
        // httpWithParameter({
        //     endPoint: requestEndPoints.couponSubDetail,
        //     data: {
        //         portalId: app.globalData.tenantId,
        //         subProductId: id,
        //     },
        //     success: (res) => {
        //         if (res.data.status == 200) {
        //             let detail = res.data.data.data
        //             //加载适用店铺
        //             this.loadShops(detail.id)

        //             detail.imgtxtInfo = util.formatImgTxt(detail.imgtxtInfo)

        //             this.setData({
        //                 coupon: detail,
        //             })
        //         }
        //     },
        //     fail: (res) => {}
        // });
    },

    /**
     * 页面出现
     */
    onShow() {
        tracking({
            event: '06',
            eventState: '进入成功'
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function(options) {
        tracking({
            event: '02',
            eventState: '转发'
        })
        let currentPage = getCurrentPages()[getCurrentPages().length - 1].route
        return {
            title: this.data.coupon ? this.data.coupon.mainInfo : '',
            path: `${currentPage}?isFromShare=true`,
            success: function(res) {
            },
            fail: function(res) {
            }
        }
    },

    //页面滑动监听
    onPageMove(res) {
        this.setData({
            isMove: true,
        })
    },

    //页面滑动结束监听
    onPageEnd() {
        setTimeout(() => {
            this.setData({
                isMove: false,
            })
        }, 500)
    },
})