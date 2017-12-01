'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _default = require('zepto-modules/_default');

var _default2 = _interopRequireDefault(_default);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tool = {
    url: function url(_url) {
        var dm, hs, qu;
        _url = _url || location.href;
        dm = _url.match(/^[^?#]+/i)[0];
        _url = _url.slice(dm.length);
        if (_url.match(/^\?[^#]+/i)) {
            qu = _url.match(/^\?[^#]+/i)[0];
            _url = _url.slice(qu.length);
            if (_url.match(/^#[^?]+/i)) {
                hs = _url.match(/^#[^?]+/i)[0];
            }
        } else if (_url.match(/^#[^?]+/i)) {
            hs = _url.match(/^#[^?]+/i)[0];
            _url = _url.slice(hs.length);
            if (_url.match(/^\?[^#]+/i)) {
                qu = _url.match(/^\?[^#]+/i)[0];
            }
        }
        var param = (qu || '').slice(1);
        _url = {
            domain: dm,
            // query: (qu || '').slice(1),
            hash: (hs || '').slice(1),
            query: {},
            toString: function toString() {
                var key, ref, val;
                qu = '';
                ref = this.query;
                for (key in ref) {
                    val = ref[key];
                    qu += key;
                    if (val !== void 0 && val !== null) {
                        qu += '=' + val;
                    }
                }
                if (qu) {
                    qu = '?' + qu;
                }
                hs = this.hash ? '#' + this.hash : '';
                return hs + qu;
            }
        };
        if (param) {
            param.replace(/(?:^|&)([^=&]+)(?:=([^&]*))?/gi, function (a, b, d) {
                return _url.query[b] = d;
            });
        }
        return _url;
    },
    formToObject: function formToObject(form, trim) {
        var data;
        if (!form.serializeArray) {
            form = (0, _default2.default)(form);
        }
        data = {};
        if (trim === void 0) {
            trim = 1;
        }
        _default2.default.each(form.serializeArray(), function (i, field) {
            return data[field.name] = trim ? _default2.default.trim(field.value) : field.value;
        });
        return data;
    },
    formatDate: function formatDate(date, fmt) {
        if (!fmt) {
            fmt = date;
            date = new Date();
        }
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }return fmt;
    },
    userAgent: {
        isAndroid: function isAndroid() {
            return navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;
        },
        isIOS: function isIOS() {
            return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        },
        isPad: function isPad() {
            var zIndex = (0, _default2.default)('#appview').css('z-index');
            return zIndex == 2;
        },
        isPhone: function isPhone() {
            var zIndex = (0, _default2.default)('#appview').css('z-index');
            return zIndex == 1;
        }
    }
};

exports.default = tool;