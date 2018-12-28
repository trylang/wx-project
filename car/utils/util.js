const formatTime = date => {
    var date = new Date(date);
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

function formatCar(carNumber) {
    if (carNumber.length > 2) {
        var subCar = carNumber.substring(0, 2)
        var subCarMax = carNumber.substring(2, carNumber.length)
        return subCar + '·' + subCarMax
    }
    return carNumber
}

function getMonthStartEnd(year, month) {
    var d = new Date();
    var now = new Date(year, month, 0);
    return [year + '-' + month + '-01', year + '-' + month + '-' + formatDate(now.getDate())]
}

function getYearMonth() {
    var date = new Date();
    const year = date.getFullYear()
    const month = date.getMonth() + 1;
    return year + '年' + month + '月'
}

function getStartEnd() {
    var d = new Date();
    var now = new Date(d.getFullYear(), getMonth(), 0);
    return [d.getFullYear() + '-' + formatDate(getMonth()) + '-01', d.getFullYear() + '-' + formatDate(getMonth()) + '-' + formatDate(now.getDate())]
}

function getNowDate() {
    var date = new Date();
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
}

function getMonth() {
    return new Date().getMonth() + 1
}

function formatDate(time) {
    return time >= 10 ? time : '0' + time
}
function showToa(msg){
    wx.showToast({
        title: msg,
        icon: 'none',
        duration: 2000,
        mask: true
    })
}

// 分转元
function formatMoney (money) {
    if (!money) {return money};
    return  (money * 0.01).toFixed(2); 
}

// 将分钟数量转换为小时和分钟字符串
function toHourMinute(minutes) {
  return (Math.floor(minutes / 60) + "小时" + (minutes % 60) + "分");
}

module.exports = {
    formatTime: formatTime,
    formatCar: formatCar,
    getMonthStartEnd: getMonthStartEnd,
    getYearMonth: getYearMonth,
    getStartEnd: getStartEnd,
    getNowDate: getNowDate,
    showToa: showToa,
    formatMoney: formatMoney,
    toHourMinute: toHourMinute
}