Page({
    /**
     * 页面的初始数据
     */
    data: {
        isShow: false,
        modal_title:'',
        modal_content:'',
        modal_logo:''
    },

    handleTouchMove(){

    },

    handleConfirm(){
        this.setData({
            isShow : false
        })
    },

    handleSeeGift(){
        wx.navigateTo({
			url:'/pages/new_gift/success/main'
		})
		this.setData({
            isShow : true
        })
    },

    handleCloseModal(){
        this.setData({
            isShow : false
        })
    }
})