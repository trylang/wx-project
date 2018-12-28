// dialogComponent.js
Component({
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    /**
     * 组件的属性列表
     * 用于组件自定义设置
     */
    properties: {
        payResult: {
            type: Object,
        },
        cardList: {
            type: Array,
        }
    },

    /**
     * 私有数据,组件的初始数据
     * 可用于模版渲染
     */
    data: {
        // 弹窗显示控制
        isShow: false,
        selIndex: -1,
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
                selIndex: -1
            })
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

        onGiveCardClick(e) {
            let index = e.currentTarget.dataset.index
            let card = this.data.cardList[index]
            console.log(card)
            if (card.amount > 0) {
                this.setData({
                    selIndex: index
                })
            }
            this.triggerEvent("selCarClick", {
                cardId: card.id
            });

        },
        /*
         * 内部私有方法建议以下划线开头
         * triggerEvent 用于触发事件
         */
        _cancelEvent() {
            this.hideDialog()
        },
        _confirmEvent() {
            //触发成功回调
            this.triggerEvent("confirmEvent");
        },

        _onUserInfoClick(e){
            console.log(e)
            this.triggerEvent("onUserInfoClick", { res: e.detail.userInfo});
        }
    }
})