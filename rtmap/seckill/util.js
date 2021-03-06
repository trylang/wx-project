const formatTime = (date, sy = '-') => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join(sy)
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

//比对版本号
const compareVersion = (v1, v2) => {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    for (var i = 0; i < len; i++) {
        var num1 = parseInt(v1[i])
        var num2 = parseInt(v2[i])

        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }

    return 0
}

function formatFloor(floor) {
    let floorF = floor
    if (floor == 'F4'){
        floorF = 'L3'
    }
    if (floor == 'F3') {
        floorF = 'L2'
    }
    if (floor == 'F2') {
        floorF = 'L1'
    }
    if (floor == 'F1') {
        floorF = 'G'
    }
    if (floor == 'F1.5') {
        floorF = 'UG'
    }
    if (floor == 'B0.5') {
        floorF = 'B1M'
    }
    return floorF
}

module.exports = {
    formatTime: formatTime,
    compareVersion: compareVersion,
    formatFloor: formatFloor,
}