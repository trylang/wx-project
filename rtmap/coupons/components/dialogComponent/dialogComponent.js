var code = require('../../utils/code.js')
var config = require('../../../../utils/config.js')
var screeBrige = 0
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     * 用于组件自定义设置
     */
    properties: {
        // 弹窗标题
        cardDetail: { // 属性名
            type: String, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
            observer: function(newVal, oldVal) {
                code.barcode('barcode', newVal, 398, 84, this);
                code.qrcode('qrcode', newVal, 400, 400, this);
            }
        },
        cardName: {
            type: String,
            observer: '_onCardNameChange'
        }
    },

    /**
     * 私有数据,组件的初始数据
     * 可用于模版渲染
     */
    data: {
        // 弹窗显示控制
        isShow: false,
        cardImage: '',
    },

    /**
     * 组件的方法列表
     * 更新属性和数据的方法与更新页面数据的方法类似
     */
    methods: {

        _onCardNameChange(newVal) {
            config.config.cardNameList.map((value, index) => {
                console.log('_onCardNameChange', value)
                if (value == newVal) {
                    this.setData({
                        cardImage: config.config.cardList[index]
                    })
                    console.log('_onCardNameChange', this.data.cardImage)
                }
            })
        },
        /*
         * 公有方法
         */
        start(res) {
            console.log(res)
        },

        getHide() {
            return this.data.isShow
        },

        //隐藏弹框
        hideDialog() {
            wx.setScreenBrightness({
                value: screeBrige,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            })
            this.setData({
                isShow: false
            })
        },
        //展示弹框
        showDialog() {
            wx.getScreenBrightness({
                success: function(res) {
                    screeBrige = res.value
                },
                fail: function(res) {},
                complete: function(res) {},
            })

            this.setData({
                isShow: true
            })

            wx.setScreenBrightness({
                value: 1,
                success: function(res) {},
                fail: function(res) {},
                complete: function(res) {},
            })
        },
        /*
         * 内部私有方法建议以下划线开头
         * triggerEvent 用于触发事件
         */
        _cancelEvent() {
            //触发取消回调
            this.triggerEvent("cancelEvent")
        },

    }
})