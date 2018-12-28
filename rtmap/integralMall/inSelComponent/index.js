// components/VerificationCode/VerificationCode.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {},

    /**
     * 组件的初始数据
     */
    data: {
        titleList: ['分类', '积分'],
        clickIndex: -1,
    },

    /**
     * 组件的方法列表
     */
    methods: {

        hideSel() {
            this.setData({
                clickIndex: -1
            })
        },

        _change(clickIndex, title) {
            switch (clickIndex) {
                case 0:
                    if (title == '全部分类') {
                        title = '分类'
                    }
                    this.data.titleList[0] = title
                    break
                case 1:
                    if (title == '全部分类') {
                        title = '积分'
                    }
                    this.data.titleList[1] = title
                    break
            }

            this.setData({
                titleList: this.data.titleList
            })
        },

        _onSelClick(data) {
            let index = data.currentTarget.dataset.index
            if (this.data.clickIndex == index) {
                this.setData({
                    clickIndex: -1
                })
            } else {
                this.setData({
                    clickIndex: index
                })
            }

            this.triggerEvent('onSelClick', {
                'index': this.data.clickIndex
            })
        }
    }
})