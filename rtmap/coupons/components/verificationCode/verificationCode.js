// components/VerificationCode/VerificationCode.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        residueTime: 60,
        canClick: true,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        _startTimer: function () {
            if (this.data.canClick === true) {
                this.setData({
                    canClick: false
                });
                this._timer();
            }
        },
        _timer: function () {
            if (this.data.residueTime > 0) {
                const currentTime = this.data.residueTime - 1;

                this.setData({
                    residueTime: currentTime,
                });

                setTimeout(() => {
                    this._timer();
                }, 1000);
            } else {
                this.setData({
                    residueTime: 60,
                    canClick: true
                });
            }
        }
    }
})
