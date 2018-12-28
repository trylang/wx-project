const consoleAble = true
const devUrl = 'https://wx-mini.rtmap.com/xidan-app-api/'
const productUrl = 'https://appsmall.rtmap.com/xidan-app-api/'
const url = devUrl
import {config} from "../utils/config.js"
function getWXCard({
    success = null,
    error = null
} = {}) {
    if (consoleAble) console.log('::getWXCard::');
    wx.request({
        url: `${url}wxCard/getCardRecord`,
        method: `GET`,
        /*data: {openid: Store.state.userOpenId, cardId: Store.state.userCardNo},*/
        data: {
            openid: wx.getStorageSync('openid')
        },
        complete(res) {
            if (consoleAble) console.log('::getWXCard result::  ', JSON.stringify(res));
            resProxy({
                res,
                success,
                error
            });
        },
    })
}

function getWXCardId({
    success = null,
    error = null
} = {}) {
    if (consoleAble) console.log('::getWXCardId::', {
        // grade: wx.getStorageSync('member').member.grade,
        // cardNo: wx.getStorageSync('member').member.cardNo
        cid: wx.getStorageSync('member').cid,
        marketId: config.tenantId
    });
    wx.request({
        url: `${url}wxCard/getCardId`,
        method: `GET`,
        data: {
            // grade: wx.getStorageSync('member').member.grade,
            // cardNo: wx.getStorageSync('member').member.cardNo
            cid: wx.getStorageSync('member').cid,
            marketId: config.tenantId
        },
        complete(res) {
            if (consoleAble) console.log('::getWXCardId result::  ', JSON.stringify(res));
            resProxy({
                res,
                success,
                error
            });
        },
    })
}

function getWXJsSdk({
    cardId = null,
    success = null,
    error = null
} = {}) {
    if (consoleAble) console.log('::getWXJsSdk::', {
        openid: wx.getStorageSync('openid'),
        code: wx.getStorageSync('member').member.cardNo,
        cardId: cardId,
        key_admin: config.keyAdmin
    });
    wx.request({
        url: `${url}wxCard/getSignature`,
        method: `POST`,
        header: {
            "Content-Type": "application/json"
        },
        data: {
            openid: wx.getStorageSync('openid'),
            code: wx.getStorageSync('member').member.cardNo,
            cardId: cardId,
            // key_admin: config.keyAdmin
        },
        complete(res) {
            if (consoleAble) console.log('::getWXJsSdk result::  ', JSON.stringify(res));
            resProxy({
                res,
                success,
                error
            });
        },
    })
}

function addCardComplete({
    code,
    cardId = null,
    success = null,
    error = null
} = {}) {
    if (consoleAble) console.log('::addCardComplete::');
    wx.request({
        url: `${url}wxCard/addCardRecord`,
        method: `POST`,
        data: {
            openid: wx.getStorageSync('openid'),
            cardId: cardId
        },
        complete(res) {
            if (consoleAble) console.log('::addCardComplete result::  ', JSON.stringify(res));
            resProxy({
                res,
                success,
                error
            });
        },
    })
}

function getMobileByCode({
    cardId,
    encryptCode,
    success = null,
    error = null
} = {}) {
    if (consoleAble) console.log('::getMobileByCode::  ');
    wx.request({
        url: `${url}wxCard/codeDecrypt`,
        method: `GET`,
        data: {
            cardId: cardId,
            encryptCode: encryptCode
        },
        complete(res) {
            if (consoleAble) console.log('::getMobileByCode result::  ', JSON.stringify(res));
            resProxy({
                res,
                success,
                error
            });
        },
    })
}

function resProxy({
    res,
    success = null,
    error = null
}) {
    // if (consoleAble) console.log('>>' + url + '>>');
    res.data.code = res.data.code || res.data.status;
    res.data.msg = res.data.msg || res.data.message;
    if (res.data.code == 200) {
        success && typeof success == 'function' && success(res.data);
    } else {
        error && typeof error == 'function' && error(res.data);
    }
}



module.exports = {
    getWXCard: getWXCard,
    getWXCardId: getWXCardId,
    getWXJsSdk: getWXJsSdk,
    addCardComplete: addCardComplete,
    getMobileByCode: getMobileByCode,
}