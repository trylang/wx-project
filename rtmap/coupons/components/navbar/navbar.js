// components/navbar/navbar.js
const delay = (function () {
  let timer = 0;
  return function (callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    index: {
      type: Number,
      value: 0
    },
    init: {
      type: Number,
      value: 0
    },
    tabs: {
      type: Array,
      value: [
        {
          label: '选项一',
          value: 1
        },
        {
          label: '选项一',
          value: 2
        }
      ],
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    activeIndex: 0
  },

  /**
   * 组件的方法列表
   */
  ready () {
    this.setData({
      activeIndex: this.properties.index
    })
   },
  methods: {
    tabClick (e) {
      console.log(this)
      let eventDetail = {
        index: e.currentTarget.id,
        value: e.currentTarget.dataset.value
      }
    //   if (this.data.activeIndex == e.currentTarget.id){
    //     return false
    //   }
      this.setData({
        activeIndex: e.currentTarget.id
      });
      let that = this;
      delay(() => {
        that.triggerEvent('change', eventDetail)
      }, 500)
    }
  }
})
