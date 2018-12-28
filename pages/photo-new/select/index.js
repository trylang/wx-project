//index.js
//获取应用实例
const app = getApp()
const util = require('../../../utils/util.js');
import {
    tracking
} from '../../../rtmap/coupons/utils/track.js'
import {
    config
} from '../../../utils/config.js'
Component({
    properties: {},
    data: {
        noItems: 'conHide',
        record: 'conHide'
    },
    attached() {
        var ent = "请输入店铺名字查询";
        this.setData({
            ent: ent
        });
        this.getConAll();
    },
    methods: {
        inputChange: function (e) {
            var that = this;
            that.setData({
                searchCon: "conHide"
            });
            that.setData({
                record: "conHide"
            });
            
            var name = e.detail.value;
            that.filterStores(name);
        },
        filterStores: function (name) {
            let list = this.data.storesArr.filter(item => {
                return item.name.indexOf(name) >= 0;
            })
            this.setData({
                conAll: list
            })

            if (list.length == 0) {
                this.setData({
                    noItems: ''
                })
            } else {
                this.setData({
                    noItems: 'conHide'
                })
            }
        },
        delSearch: function () {
            this.setData({
                delVal: "",
                noItems: "conHide",
                conAll: this.data.storesArr
            });
            this.delVal = "";
        },

        getStore: function (e) {
            var id = e.currentTarget.dataset.id;
            var name = e.currentTarget.dataset.name;
            this.triggerEvent('getStoreItem', {storeId: id, storeName: name}); 
        },

        getConAll: function (a) {
            var that = this;
            wx.Request({
                url: config.BaseUrl + 'wxapp-bill-integral/common/bill/store/list',
                data: {
                    portalId: config.tenantId,
                    keyWords: ''
                },
                method: 'post',
                success: function (res) {
                    if (res.data.status == 200) {
                        that.setData({
                            conAll: res.data.data,
                            storesArr: res.data.data
                        });
                        if (that.data.conAll.length <= 0) {
                            that.setData({
                                noItems: "",
                            });
                            that.setData({
                                record: ""
                            });
                            
                        } else {
                            that.setData({
                                noItems: "conHide"
                            });
                            that.setData({
                                record: "conHide"
                            });
                            
                        }
                    } else {
                        console.log(res);
                    }
                },
                fail: function (res) {
                    console.log(res)
                }
            });

        }
    },
    
})