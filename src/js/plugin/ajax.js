define('ajax', ['engine', 'zepto'], function (xjs, $) {
    var cache = {};

    xjs.load = function (data) {
        var param = _.extend({
            skipError: false, //将错误信息交给回调执行
            offAnimate: false, //关闭动画效果
            showShadow: false, //显示动画遮罩层
            useCache: false, //使用缓存数据
            type: 'POST',
            dataType: 'json'
        }, data);

        var skipError = param.skipError;
        var offAnimate = param.offAnimate;
        var showShadow = param.showShadow;
        var useCache = param.useCache;

        delete param.skipError;
        delete param.offAnimate;
        delete param.showShadow;
        delete param.useCache;

        var wait = function () {
            var dtd = $.Deferred();
            if (!useCache || (useCache && !cache[param.url])) {
                $.ajax(param).then(function (result) {
                    if (result.code != '0' && !skipError) return dtd.reject(result.code, result.msg);
                    if (useCache) cache[param.url] = result;
                    dtd.resolve(skipError ? result : result.content);
                }, function (result) {
                    if (confirm('网络异常请稍后重试!<br>(' + param.url + ')')) {
                        location.reload();
                    } else {
                        xjs.router.navigator('#home/');
                    }
                });
            } else {
                var data = cache[param.url];
                dtd.resolve(skipError ? data : data.content);
            }
            return dtd.promise();
        };
        return $.when(wait()).fail(function (code, error) {
            alert(error);
        });
    };
});