import {
    config
} from './config.js'
let url = config.BaseUrl

export function getConfig({ success, fail, myTag = 'wxapp'}) {
    wx.Request({
        url: `${url}wxapp-deployer/api/conf/getByTag`,
        data: {
            tenantId: config.tenantId,
            team: 'wxapp',
            tag: myTag,
        },
        method: 'GET',
        success: function(res) {
            res.data.status == 200 ? success(res.data.data) : fail(res.data)
        },
        fail: function(res) {
            fail(res.data)
        },
        complete: function(res) {},
    })
}