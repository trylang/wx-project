// rtmap/coupons/components/imagesPicker/imagePicker.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isMultiSelect: {
            type: Boolean,
            value: false,
            observer: '_isMultiSelectChange'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        isMulti: false,
        images: []
    },

    /**
     * 组件的方法列表
     */
    methods: {
        /**
         * 多选参数改变 内部方法
         */
        _isMultiSelectChange: function (newVal, oldVal) {
            if (newVal != oldVal) {
                this.setData({
                    isMulti: newVal
                });
            }
        },

        /**
         * 选择图片
         */
        chooseImage: function () {
            const that = this;
            wx.chooseImage({
                count: this.data.isMulti?9:1,
                success: function(res) {
                    let images = that.data.images.concat(res.tempFilePaths);
                    that.setData({
                        images: images
                    });

                    let myEventDetail = {
                        images: that.isMulti ? images : images[images.length-1]
                    }
                    that.triggerEvent('updateimages', myEventDetail)
                },
                fail: function (res) { 

                },
                complete: function (res) {

                }
            })
        }
    }
})
