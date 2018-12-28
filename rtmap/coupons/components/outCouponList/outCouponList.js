// rtmap/coupons/components/outCouponList/outCouponList.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        
        businessTypes: {
            type: Array,
            value: [],
        },
        coupons: {
            type: Array,
            observer:  (newVal, oldVal, changedPath)=> {
                // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
                // 通常 newVal 就是新设置的数据， oldVal 是旧数据
                console.log(newVal[this.data.businessTypes[this.data.businessTypesCurrent].id].list)
            }
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        businessTypesCurrent: 0,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 切换业态
         */
        _selectedBusinessType(e) {
            let index = e.currentTarget.dataset.index
            this.setData({
                businessTypesCurrent: index
            });
            this.triggerEvent('selectedBusinessType', { index: index})
        },

        /**
         * 选择优惠券
         */
        selectedCoupon: function(e) {
            const industryID = this.data.businessTypes[this.data.businessTypesCurrent].id;
            const coupon = this.data.coupons[industryID].list[e.currentTarget.dataset.index];
            wx.navigateTo({
                url: `../../couponM/pages/couponDetail/couponDetail?batchId=${coupon.batchId}&activityId=${coupon.activityId}`,
            })
        },
    }
})