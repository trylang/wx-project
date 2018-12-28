// rtmap/integralMall/integralHome/integralHome.js
var burialPoint = require('../../coupons/utils/track.js')
var contact = require('../contact.js')
var app = getApp()
var item1 = 0
var item2 = 0

Page({
    //埋点数据
    title: '积分商城',
    /**
     * 页面的初始数据
     */
    data: {
        convert: 0,
        integralList: [],
        clickIndex: -1,
        selItemIndex: [0, 0, 0],
        oldItemSelList: [],
        itemSelList: [],
        itemIndex: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.inSel = this.selectComponent('#inSel')
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getSlect()
        this.getConvert()
        this.getList(this.data.itemIndex)
        burialPoint.tracking({
            productId: contact.productId,
            event: '06',
            eventState: '进入成功'
        })
    },

    getConvert() {
        contact.getWithParameter({
            data: {},
            success: (data) => {
                if (data.data.status == 200)
                    this.setData({
                        convert: data.data.data.balance
                    })
                else
                    contact.toast({
                        title: '获取积分失败'
                    })
            },
            fail: (data) => {
                contact.toast({
                    title: '获取积分失败'
                })
            }
        })

    },

    getSlect() {
        contact.postWithParameter({
            endPoint: 'type_api',
            data: {},
            success: (data) => {
                let respData = data.data
                if (respData.code == 200) {
                    let itemList = []
                    itemList.push([])
                    itemList[0].push('全部分类')
                    for (let item of respData.data) {
                        itemList[0].push(item.type_name)
                    }
                  itemList.push(['从低到高', '从高到低', '全部分类' ])
                    itemList.push(['全部分类', '可兑换', '不可兑换'])
                    this.setData({
                        oldItemSelList: respData.data,
                        itemSelList: itemList
                    })


                } else {
                    contact.toast({
                        title: respData.msg
                    })
                }
            },
            fail: (data) => {
                contact.toast({
                    title: '获取分类失败'
                })
            }
        })
    },

    onSelClick(data) {
        let index = data.detail.index
        this.setData({
            clickIndex: index
        })
    },

    onSelItemClick(data) {
        let index = data.currentTarget.dataset.index
        this.data.selItemIndex[this.data.clickIndex] = index
        let fenlei = this.data.itemSelList[this.data.clickIndex]
        this.inSel._change(this.data.clickIndex, fenlei[index])
        this.getList(index)
        this.setData({
            selItemIndex: this.data.selItemIndex,
            clickIndex: -1,
            itemIndex: index
        })

        this.inSel.hideSel()
    },

    getList(index) {
        wx.showLoading({
            title: '拉取列表中',
        })
        switch (this.data.clickIndex) {
            case 0:
                item1 = index
                break
            case 1:
                item2 = index
                break
        }

        contact.postWithParameter({
            endPoint: 'curl_api',
            data: {
                type_id: item1 == 0 ? '' : this.data.oldItemSelList.length == 0 ? '' : this.data.oldItemSelList[item1 - 1].id,
                is_pay: '',
              is_integral_sort: item2 == 0 ? 'asc' : item2 == 1 ? 'desc' : ''
            },
            success: (data) => {
                wx.stopPullDownRefresh()
                wx.hideLoading()
                let respData = data.data
                if (respData.code == 200) {
                    if (respData.data) {
                        for (var i = 0, n = 0; i < respData.data.length; i++) {
                            if (respData.data[i].status == 7) {
                                respData.data.splice(i, 1);
                            }
                        }

                        // respData.data.sort(this.compare('des'))

                        this.setData({
                            integralList: respData.data
                        })
                    } else {
                        this.setData({
                            integralList: []
                        })
                    }
                } else {
                    contact.toast({
                        title: respData.msg
                    })
                }
            },
            fail: (data) => {
                wx.stopPullDownRefresh()
                wx.hideLoading()
                contact.toast({
                    title: '获取商品列表失败'
                })
            }
        })
    },

    onMaskClick() {
        this.setData({
            clickIndex: -1,
        })
        this.inSel.hideSel()
    },

    onItemClick(data) {
        let index = data.currentTarget.dataset.index
        wx.navigateTo({
            url: '/rtmap/integralMall/integralDetail/integralDetail?pid=' + this.data.integralList[index].pid + '&activity=' + this.data.integralList[index].activity_id,
            success: function(res) {
                burialPoint.tracking({
                    productId: contact.productId,
                    event: '07',
                    eventState: '跳转成功'
                })
            },
            fail: function(res) {
                burialPoint.tracking({
                    productId: contact.productId,
                    event: '07',
                    eventState: '跳转失败'
                })
            },
            complete: function(res) {},
        })
    },

    onHistoryClick() {

        wx.navigateTo({
            url: '/rtmap/integralMall/integralHistory/integralHistory',
            success: function(res) {
                burialPoint.tracking({
                    productId: contact.productId,
                    event: '07',
                    eventState: '跳转成功'
                })
            },
            fail: function(res) {
                burialPoint.tracking({
                    productId: contact.productId,
                    event: '07',
                    eventState: '跳转失败'
                })
            },
            complete: function(res) {},
        })
    },

    compare(property) {
        return function(a, b) {
            var value1 = a[property];
            var value2 = b[property];
            return value1 - value2;
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
        this.getList(this.data.itemIndex)
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})