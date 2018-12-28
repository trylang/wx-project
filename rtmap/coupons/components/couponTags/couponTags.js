// components/coupon-tags/coupon-tags.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //   tags: {
    //       type: Array,
    //       value: [],
    //       observer: '_updateTags'
    //   },
      limitCount: {
          type: Number,
          value: 1,
          observer: '_updateTagsLimit'
      },
      buyType: {
          type: Number,
          value: 1,
          observer: '_updateTagsBuyType'
      },
      refundType: {
          type: Number,
          value: 2,
          observer: '_updateTagsRefundType'
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
      limit: 1,
      buyType: 1,
      refund: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
      _updateTagsLimit: function (newVal, oldVal) {
          this.setData({
              limit: newVal
          })
      },
      _updateTagsBuyType: function (newVal, oldVal) {
          this.setData({
              buyType: newVal,
          });
      },
      _updateTagsRefundType: function (newVal, oldVal) {
          this.setData({
              refund: newVal === 1
          });
      }
  }
})
