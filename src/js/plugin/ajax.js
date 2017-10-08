define('ajax', ['zepto'], function ($) {
    var cache = {};
    /**
     * @fileOverview 数据请求模块，用于ajax数据请求，此插件在zepto的ajax函数上封装了一些功能。根据后端返回的code代号或失败，在错误的code代码下将会在后台处理。<br>
     *     注意此模块利用了zepto的deferred对象处理回调信息，请在实例化后利用then方法处理回调函数。<br>
     * @module load
     * @param {Object} config 配置请求参数
     * @example
     * //为了保证前端能正确获取后端给出的请求状态和数据内容，请保持所有接口的返回格式按照以下述为准:
     * {
     *   code: 0 //默认0为成功，不等于0则表明异常
     *   msg: "" //当code不等于0时，请讲具体错误信息放到这里
     *   content: {} //接口所应该提供的数据内容
     * }
     *
     * //config参数的配置列子：
     * //基于$.ajax的参数上新增了以下四个参数
     * {
     *  skipError: false, //可选参数默认为false，处理当请求出错时是否要交给deferred回调处理，当设置为false时交给模块内部处理，当设置为true时交给deferred回调处理
     *  offAnimate: false, //可选参数默认为false，处理是否要打开加载动画
     *  showShadow: false, //可选参数默认为false，处理是否现实遮罩图层
     *  useCache: false, //可选参数默认为false，处理是否要缓存此次请求的结果
     * }
     *
     * //先假设请求一个somehow.do参数返回以下数据：
     * {
     *   code: 0,
     *   data: {
     *     newProject: true
     *   }
     * }
     *
     * xjs.load = new load();
     * //一般情况下：
     * xjs.load({
     *  url: "somehow.do",
     *  type: "GET"
     * }).then(function(result) {
     *   //默认情况下返回response里的content对象
     *   console.log(result); //result == {newProject: true};
     * });
     *
     * //假设code不等于0而是任意数5(这取决于后端对错误code的定义)，默认情况下是不会触发then函数里的回调 而是交给ajax模块内部处理。
     * //设置skipError为true后，将会交给then函数处理错误信息。
     * xjs.load({
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