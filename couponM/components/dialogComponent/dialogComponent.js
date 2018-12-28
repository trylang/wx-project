// dialogComponent.js
import {
  tracking
} from '../../utils/track.js'
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     * 用于组件自定义设置
     */
    properties: {
        collageList: {
            type: Array,
        }
    },

    /**
     * 私有数据,组件的初始数据
     * 可用于模版渲染
     */
    data: {
        // 弹窗显示控制
        isShow: false
    },

    /**
     * 组件的方法列表
     * 更新属性和数据的方法与更新页面数据的方法类似
     */
    methods: {
        /*
         * 公有方法
         */

        //隐藏弹框
        hideDialog() {
            this.setData({
                isShow: false
            })
        },
        //展示弹框
        showDialog() {
            this.setData({
                isShow: true
            })
        },
        /*
         * 内部私有方法建议以下划线开头
         * triggerEvent 用于触发事件
         */
        _cancelEvent() {
            //触发取消回调
            this.hideDialog()
        },

//去拼团
        _onGroupClick(e) {
            let index = e.currentTarget.dataset.index
            wx.navigateTo({
                url: `../../pages/groupbuy/groupbuyDetail/groupbuyDetail?groupbuyId=${this.data.collageList[index].id}`,
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
        },

        onScrollListener(){
            console.log('onScrollListener')
        }
    }
})