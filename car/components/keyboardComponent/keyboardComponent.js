// components/keyboardComponent/keyboardComponent.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        carList: {
            type: Array,
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        isEng: false,
        isInput: false,
        carNumber: [],
        carCityList: ["京", "津", "冀", "晋", "蒙", "辽", "吉", "黑", "沪", "苏", "浙", "皖", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "川", "贵", "云", "渝", "藏", "陕", "甘", "青", "宁", "ABC", "新", "使", "领", "警", "学", "港", "澳"],
        carNumList: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", '返回', "Z", "X", "C", "V", "B", "N", "M"],
    },

    /**
     * 组件的方法列表
     */
    methods: {
        //选择键盘选项
        switchIndex(data) {
            var tapIndex = data.currentTarget.dataset.index
            console.log(tapIndex)
            if (this.data.carList[tapIndex] == 'ABC') {
                setTimeout(() => {
                    this.setData({
                        isEng: true,
                        carList: this.data.carNumList
                    })
                }, 500)
                return
            } else if (this.data.carList[tapIndex] == '返回') {
                setTimeout(() => {
                    this.setData({
                        isEng: false,
                        carList: this.data.carCityList
                    })
                }, 500)
                return
            }

            if (this.data.carNumber.length == 0) {
                var data = (tapIndex == (this.data.carCityList.length)) ? "" : this.data.carCityList[tapIndex]
                if (data == '' || this.data.isEng) {
                    return
                }
                this.data.carNumber.push(data)
                this.setData({
                    isEng: true,
                    carNumber: this.data.carNumber,
                    carList: this.data.carNumList,

                })
            } else if (this.data.carNumber.length < 8) {
                var data = (tapIndex == (this.data.carNumList.length)) ? "" : this.data.carNumList[tapIndex]
                if (data == '' || !this.data.isEng) {
                    return
                }
                this.data.carNumber.push(data)
                this.setData({
                    carNumber: this.data.carNumber,
                    carList: this.data.carNumList,
                    isShow: false,
                })
            }
            if (this.data.carNumber.length > 6) {
                this.setData({
                    isInput: true,
                })
            }

            this.triggerEvent('onInputChange', {
                carNumber: this.data.carNumber,
                isInput: this.data.isInput
            })
        },

        //删除输入选项
        onInputDelete() {

            this.data.carNumber.pop()
            console.log(this.data.carNumber)
            this.setData({
                carNumber: this.data.carNumber,
                carList: this.data.carNumber.length == 0 ? this.data.carCityList : this.data.carNumList,
            })

            if (this.data.carNumber.length < 7 && this.data.isInput) {
                this.setData({
                    isInput: false,
                })
            }
            if (this.data.carNumber.length <= 0) {
                this.setData({
                    isEng: false,
                })
            }

            this.triggerEvent('onInputChange', {
                carNumber: this.data.carNumber,
                isInput: this.data.isInput
            })
        },
    }
})