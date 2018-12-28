// components/couponMode.js
import {
    requestEndPoints,
    httpWithParameter,
    postRequestWithParameter,
    toastError
} from '../../utils/httpUtil.js';
const util = require('../../utils/util.js')
import {
    tracking
} from '../../utils/track.js'
var app = getApp()
const pagesize = 15
var groupIndex = -1
Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {
        businessTypesCurrent: 0,
        businessTypes: [],
        indexList: [],
        currentPage: 1,
        maxPage: 1,
        couponsList: [],
        windowH: 1000,
        currentIndex: 0,
    },

    attached() {
        let res = wx.getSystemInfoSync()
        this.setData({
            windowH: res.windowHeight - res.windowWidth / 750 * 100,
        })
        this._getType()
    },

    /**
     * 组件的方法列表
     */
    methods: {
        _getType() {
            /**
             * 获取业态
             */
            httpWithParameter({
                endPoint: requestEndPoints.industry,
                data: {
                    portalId: app.globalData.tenantId
                },
                success: (res) => {
                    if (res.data.status == 200) {
                        if (res.data.data.list) {
                            if (res.data.data.list.length > 0) {
                                res.data.data.list.unshift({
                                    id: 0,
                                    name: '全部'
                                })
                                this.setData({
                                    businessTypes: res.data.data.list,
                                });
                                this.getGroupList(this.data.currentIndex)
                                this.triggerEvent('isShow', true);
                            } else {
                                this.triggerEvent('isShow', false);
                            }
                        }
                    }
                },
                fail: (res) => {
                    console.log('fail', res);
                }
            });
        },

        /**
         * 切换业态
         */
        _changeNav(e) {
            // const query = wx.createSelectorQuery()
            // query.select('#list').boundingClientRect()
            // query.selectViewport().scrollOffset()
            // query.exec(function(res) {
            //     console.log(res)
            //     res[0] && res[0].top // #list节点的上边界坐标
            //     res[1] && res[1].scrollTop // 显示区域的竖直滚动位置
            // })
            this.setData({
                currentPage: 1,
                couponsList: [],
            })

            const index = e.currentTarget.dataset.index;
            this.setData({
                businessTypesCurrent: index,
            })
            this.getGroupList(index);
            // //判断是否加载过当前标签
            // if (this.data.businessTypes.length) {
            //   let typeId = this.data.businessTypes[index].id
            //   if (!this.data.indexList[typeId]) {
            //     this.getGroupList(index)
            //   } else {
            //     this.setData({
            //       couponsList: this.data.indexList[typeId],
            //     })
            //   }
            // }
        },

        /**
         * 获取业态下的列表
         */
        getGroupList(index = 0) {
            if (this.data.businessTypes.length <= 0) {
                return
            }

            let businessId = this.data.businessTypes[index].id;
            this.data.businessTypesCurrent = index;
            let param = {
                portalId: app.globalData.tenantId,
                industryId: businessId,
                page: this.data.currentPage,
                pageSize: pagesize,
            };
            if (businessId == 0) delete param.industryId;
            httpWithParameter({
                endPoint: requestEndPoints.coupons,
                data: param,
                success: (res) => {
                    if (res.data.status == 200) {
                        res.data.data.list.map((value) => {
                            if (value.data.shop)
                                value.data.shop.floorId = util.formatFloor(value.data.shop.floorId)
                        })
                        this.data.indexList[businessId] = res.data.data.list
                        this.setData({
                            maxPage: res.data.data.pages,
                            couponsList: this.data.couponsList.concat(res.data.data.list),
                        })
                    }
                },
                fail: (res) => {
                    console.log('fail', res);
                }
            });
        },

        onItemClick(e) {
            const index = e.currentTarget.dataset.index;
            if (groupIndex == -1) {
                let purl = `/couponM/pages/groupDetail/groupDetail?hiddenGroupBuy=false&productId=${this.data.couponsList[index].id}&title=${this.data.businessTypes[this.data.businessTypesCurrent].name}`;
                if (this.data.couponsList[index].type === 0) {
                    if (this.data.couponsList[index].data.type == 1) {
                        purl = `/rtmap/groupon/detail/detail?couponid=${this.data.couponsList[index].id}`;
                    }
                }
                wx.navigateTo({
                    url: purl,
                    success: function(res) {
                        tracking({
                            event: '07',
                            eventState: '跳转成功'
                        })
                    },
                    fail: function(res) {
                        tracking({
                            event: '07',
                            eventState: '跳转失败'
                        })
                    },
                    complete: function(res) {},
                })
            } else {
                wx.navigateTo({
                    url: `/couponM/pages/groupDetail/groupDetail?productId=${this.data.couponsList[index].id}`,
                    success: function(res) {
                        tracking({
                            event: '07',
                            eventState: '跳转成功'
                        })
                    },
                    fail: function(res) {
                        tracking({
                            event: '07',
                            eventState: '跳转失败'
                        })
                    },
                    complete: function(res) {},
                })
                groupIndex = -1
            }
        },

        onSubGroupClick(e) {
            groupIndex = e.currentTarget.dataset.index
        },

        pullDownRefresh() {
            this._getType();
            this.setData({
                couponsList: [],
                businessTypesCurrent: 0
            });
        },
        onScrollListener() {
            if (this.data.currentPage >= this.data.maxPage) {
                // toastError('已经到达最底部')
                return
            }
            this.setData({
                currentPage: this.data.currentPage + 1
            })

            this.getGroupList(this.data.businessTypesCurrent)
        },

    }
})