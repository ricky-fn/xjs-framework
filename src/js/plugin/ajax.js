define('ajax', ['zepto'], function ($) {
    var cache = {};
    /**
     * @fileOverview 数据请求模块，用于ajax数据请求，此插件在zepto的ajax函数上封装了一些功能。根据后端返回的code代号或失败，在错误的code代码下将会在后台处理。<br>
     *     注意此模块利用了zepto的`deferred`对象处理回调信息，请在实例化后利用`then`方法处理回调函数。<br>
     * @module load
     * @param {Object} config 配置请求参数
     * @param {Boolean}[config.skipError] 默认为false，处理当请求出错时是否要交给deferred回调处理，当设置为false时交给模块内部处理，当设置为true时交给deferred回调处理
     * @param {Boolean}[config.offAnimate] 默认为false，处理是否要打开加载动画
     * @param {Boolean}[config.showShadow] 默认为false，处理是否现实遮罩图层
     * @param {Boolean}[config.useCache] 默认为false，处理是否要缓存此次请求的结果
     * @param {url} config.url 请求接口的url
     * @param {type} config.type 设置是`POST`或`GET`方式请求
     * @param {Object} config.data 发送给接口的数据
     * @example 后端ajax接口同一的数据返回格式
     * {
     *   code: 0 //默认0为成功，不等于0则表明异常
     *   msg: "" //当code不等于0时，将错误信息放到这里
     *   content: {} //接口所应该提供的数据内容
     * }
     * @example
     * //先假设请求一个somehow.do参数返回以下数据：
     * {
     *   code: 0,
     *   data: {
     *     newProject: true
     *   }
     * }
     * @example
     * var load = new load();
     * load({
     *  url: "somehow.do",
     *  type: "GET"
     * }).then(function(result) {
     *   //如果后端返回的code等于0那么response里的content对象，否则此回调不会被执行
     *   console.log(result); //result == {newProject: true};
     * });
     * @example 如何处理错误信息
     * //假设code不等于0而是任意数5(这取决于后端对错误code的定义)，默认情况下是不会触发then函数里的回调 而是交给ajax模块内部处理。
     * //设置skipError为true后，将会交给then函数处理错误信息。
     * load({
     *  url: "somehow.do",
     *  type: "GET",
     *  skipeError: true
     * }).then(function(result) {
     *   console.log(result); //result == {code:5, msg: "数据错误", content: {}};
     * });
     */
    var load = function (data) {
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

    return load;
});