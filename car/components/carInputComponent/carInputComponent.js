// component/checkboxComponent/checkboxComponent.js
var isFirst = true
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    carNumber: {            // 属性名
      type: Array,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）    // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: true,
    isIndex: -1,
    carList: [],
    carCityList: ["京", "津", "冀", "晋", "蒙", "辽", "吉", "黑", "沪", "苏", "浙", "皖", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "川", "贵", "云", "渝", "藏", "陕", "甘", "青", "宁", "新", "港", "澳", "台"],
    carNumList: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "", "", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "", "", ""],
  },

  attached() {
    if (!isFirst) {
      this.setData({
        isNavigate: false,
        carList: this.data.carCityList,
        isShow: false,
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _onInputClick(){
      this.triggerEvent('onInputClick')
    },

    _switchCity() {
      console.log(this.data.isNavigate)
      this.triggerEvent('onCityClick')
      if (this.data.isNavigate)
        this.navigate()
    },

    _switchCar() {
      console.log(this.data.isNavigate)
      if (this.data.isNavigate)
        this.navigate()

    },

    _switchIndex(data) {
      var tapIndex = data.currentTarget.dataset.index
      console.log(tapIndex)
      this.setData({
        isIndex: tapIndex
      })


      if (this.data.carNumber.length == 0) {
        var data = (tapIndex == (this.data.carCityList.length - 1)) ? "" : this.data.carCityList[tapIndex]
        console.log('data',data)
        if(data==''){
          return
        }
        this.data.carNumber.push(data)
        this.setData({
          carNumber: this.data.carNumber,
          isIndex: -1,
          carList: this.data.carNumList,
          isShow: false,

        })
      } else if (this.data.carNumber.length < 8) {
        var data = (tapIndex == (this.data.carNumList.length - 1)) ? "" : this.data.carNumList[tapIndex]
        console.log('data', data)
        if (data == '') {
          return
        }
        this.data.carNumber.push(data)
        this.setData({
          carNumber: this.data.carNumber,
          isIndex: -1,
          carList: this.data.carNumList,
          isShow: false,
        })
      }

      console.log(this.data.carNumber)
    },

    onInputDelete() {

      this.data.carNumber.pop()
      console.log(this.data.carNumber)
      this.setData({
        carNumber: this.data.carNumber,
        isIndex: -1,
        carList: this.data.carNumber.length == 0 ? this.data.carCityList : this.data.carNumList,
        isShow: false,
      })

    },

    onCancleClick() {
      wx.navigateBack({
        delta: 1,
      })
    },

    navigate() {
      isFirst = false
      wx.navigateTo({
        url: '/car/pages/parkPage/carInputPage/carInputPage',
        success: (res) => { },
        fail: function (res) { },
        complete: function (res) { },
      })
    }

  }
})
