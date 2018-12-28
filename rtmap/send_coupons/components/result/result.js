// rtmap/send_coupons/components/result.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        activityId: {
            type: String,
            value: ''
        },
        recordId: {
            type: String,
            value: ''
        },
        detailBanner: {
            type: String,
            value: ''
        },
        tenantId: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        goList: function () {
            wx.navigateTo({
                url: '../list/list?activityId=' + this.data.activityId + '&recordId=' + this.data.recordId + '&detailBanner=' + this.data.detailBanner + '&tenantId=' + this.data.tenantId,
            })
        },
    }
})
