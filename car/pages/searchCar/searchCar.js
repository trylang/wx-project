var num = ''
const util = require('../../utils/util.js')
import {
  tracking
} from '../../utils/track.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // show: false,//控制下拉列表的显示隐藏，false隐藏、true显示
    // selectData: ['1', '2', '3', '4', '5', '6'],//下拉列表的数据
    // index: 0,//选择的下拉列表下标
    isFirst: true,
    carNum: '请输入车牌号' || '浙A55555',
    carList: ["京", "津", "冀", "晋", "蒙", "辽", "吉", "黑", "沪", "苏", "浙", "皖", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "川", "贵", "云", "渝", "藏", "陕", "甘", "青", "宁", "ABC", "新", "使", "领", "警", "学", "港", "澳"],
    historyList: ['京N·53218', '京A·79165', '京N·16545'],
    payResult: {
      content: '未查到车牌停车信息',
      leftText: '',
      rightText: '确定',
      type: 2,
      extend: '请至缴费口人工缴费',
    }
  },
  // 点击下拉显示框
  // selectTap() {
  //     this.setData({
  //         show: !this.data.show
  //     });
  // },
  // 点击下拉列表
  // optionTap(e) {
  //     let Index = e.currentTarget.dataset.index;//获取点击的下拉列表的下标
  //     this.setData({
  //         index: Index,
  //         show: !this.data.show
  //     });
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.dialog = this.selectComponent('#dialog')
  },

  pay() {
      tracking({
          event: '12',
          eventState: '点击查询车牌'
      })
    // test start
    this.data.isInput = true;
    // test end

        // this.dialog.showDialog()
        if (!this.data.isInput) {
            util.showToa('请输入车牌号')
            return
        }
        let carNumber = this.data.carNumber;
        carNumber = carNumber instanceof Array ? carNumber.join('') : this.data.carNum;
        wx.navigateTo({
            url: '../parkingPaly/parkingPaly?carNumber=' + carNumber,
        })
    },
    onInputChange(res) {
        this.setData({
            isFirst: res.detail.carNumber.length == 0,
            carNum: res.detail.carNumber.length == 0 ? '请输入车牌号' : util.formatCar(res.detail.carNumber.join('')),
            carNumber: res.detail.carNumber,
            isInput: res.detail.isInput,
        })
    },

  onRightClick() {
    this.dialog.hideDialog()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

      tracking({
          event: '06',
          eventState: '进入成功'
      })
  },
})