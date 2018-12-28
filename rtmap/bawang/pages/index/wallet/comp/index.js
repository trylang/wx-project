//获取应用实例
var app = getApp();
Object.assign = function(...rest){
	function _type(value) {
	    return Object.prototype.toString.call(value).slice(8).slice(0, -1).toLowerCase();
	}

	function isArray(value) {
	    return _type(value) == 'array';
	}

	function isObject(value) {
	    return _type(value) == 'object';
	}

	function mergeObject(obj_pre, obj){
		if(isObject(obj_pre) && isObject(obj)){
			for(let i in obj){
				if(isObject(obj[i])){
					obj_pre[i] = obj_pre[i]||{};
					obj_pre[i] = mergeObject(obj_pre[i], obj[i]);
				}else if(isArray(obj[i])){
					obj_pre[i] = obj_pre[i]||[];
					for(let j = 0; j < obj[i].length; j++){
						if(isObject(obj[i][j])){
							obj_pre[i][j] = obj_pre[i][j]||{};
							obj_pre[i][j] = mergeObject(obj_pre[i][j], obj[i][j]);
						}else if(isArray(obj[i][j])){
							obj_pre[i][j] = obj_pre[i][j]||[];
							obj_pre[i][j] = mergeObject(obj_pre[i][j], obj[i][j]);
						}else{
							obj_pre[i][j] = obj[i][j];
						}
					}
				}else{
					obj_pre[i] = obj[i];
				}
			}
		}
		return obj_pre;
	}

	if(rest.length){
		if(rest.length < 1){
			rest.unshift({});
		}
		for(let i = 1; i < rest.length; i++){
			rest[0] = mergeObject(rest[0], rest[i]);
		}
		return rest[0];
	}else{
		return {};
	}
}
module.exports.data = {
	_coupon_:{},
	_dialog_:{
		_dialogVisible: false,
		_dialogTitle: '',
		_dialogContent: '',
		_dialogMode: true,
		_dialogBtnCancel: '',
		_dialogBtnCancelType: '',
		_dialogBtnConfirm: '',
		_dialogBtnConfirmType: '',
		_dialogCancelCallback: null,
		_dialogConfirmCallback: null
	}
}
module.exports.decodeURI = function(str){
	return str.replace(/\+/g, ' ').replace(/\%.{2}/g, (val)=>{
		val = val.substring(1);
		if(parseInt("0x"+val) <= 0x7f){
			return String.fromCharCode(parseInt("0x"+val));
		}
	});
}
module.exports.checkCouponClass = function(coupon){
	switch(coupon.categoryId){
		case 0:
			return 'discount';
		break;
		case 1:
			return 'gift';
		break;
		case 2:
			return 'money';
		break;
		case 6:
			return 'free';
		break;
		case 7:
			return 'single';
		break;
		case 8:
			return 'brand';
		break;
		case 9:
			return 'common';
		break;
		case 101:
			return 'ext1';
		break;
		case 102:
			return 'brand';
		break;
		case 103:
			return 'brand';
		break;
		case 104:
			return 'brand';
		break;
		default:
			return 'money';
		break;
	}
}
module.exports._couponViewHandler = function(evt){
	if(this.couponViewHandler){
		this.couponViewHandler(evt);
	}
}
module.exports.confirm = function({
	title = '',
	content = '',
	mode = true,//true: confirm, false:alert
	cancelText = '取消',
	cancelHandler = null,
	cancelType = '',
	confirmText = '确定',
	confirmHandler = null,
	confirmType = ''
}){
	this.setData({
		_dialog_: {
			_dialogTitle: title,
			_dialogContent: content,
			_dialogMode: mode,
			_dialogBtnCancel: cancelText,
			_dialogBtnCancelType: cancelType,
			_dialogCancelCallback: cancelHandler,
			_dialogBtnConfirm: confirmText,
			_dialogBtnConfirmType: confirmType,
			_dialogConfirmCallback: confirmHandler,
			_dialogVisible: true
		}
	})
}
module.exports._dialogCancelHandler = function(evt){
	if(this.data._dialog_._dialogCancelCallback){
		this.data._dialog_._dialogCancelCallback(evt);
	}
	this.setData({
		'_dialog_._dialogVisible': false
	})
}
module.exports._dialogConfirmHandler = function(evt){
	if(this.data._dialog_._dialogConfirmCallback){
		this.data._dialog_._dialogConfirmCallback(evt);
	}
	this.setData({
		'_dialog_._dialogVisible': false
	})
}
