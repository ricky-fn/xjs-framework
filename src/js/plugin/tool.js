define('tool', ['zepto'], function ($) {
    return {
        url: function(url) {
            var dm, hs, qu;
            url = url || location.href;
            dm = url.match(/^[^?#]+/i)[0];
            url = url.slice(dm.length);
            if (url.match(/^\?[^#]+/i)) {
                qu = url.match(/^\?[^#]+/i)[0];
                url = url.slice(qu.length);
                if (url.match(/^#[^?]+/i)) {
                    hs = url.match(/^#[^?]+/i)[0];
                }
            } else if (url.match(/^#[^?]+/i)) {
                hs = url.match(/^#[^?]+/i)[0];
                url = url.slice(hs.length);
                if (url.match(/^\?[^#]+/i)) {
                    qu = url.match(/^\?[^#]+/i)[0];
                }
            }
            url = {
                domain: dm,
                query: (qu || '').slice(1),
                hash: (hs || '').slice(1),
                param: {},
                toString: function() {
                    var key, ref, val;
                    qu = '';
                    ref = this.param;
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
                    return this.domain + qu + hs;
                }
            };
            if (url.query) {
                url.query.replace(/(?:^|&)([^=&]+)(?:=([^&]*))?/gi, function(a, b, d) {
                    return url.param[b] = d;
                });
            }
            return url;
        },
        formToObject: function(form, trim) {
            var data;
            if (!form.serializeArray) {
                form = $(form);
            }
            data = {};
            if (trim === void 0) {
                trim = 1;
            }
            $.each(form.serializeArray(), function(i, field) {
                return data[field.name] = trim ? $.trim(field.value) : field.value;
            });
            return data;
        },
        formatDate: function (date, fmt) {
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
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        },
        userAgent: {
            isAndroid: function() {
                return navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;
            },
            isIOS: function() {
                return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
            },
            isPad: function() {
                var zIndex = $('#appview').css('z-index');
                return zIndex == 2;
            },
            isPhone: function() {
                var zIndex = $('#appview').css('z-index');
                return zIndex == 1;
            }
        }
    };
});
