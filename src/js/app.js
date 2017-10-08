requirejs.config({
    urlArgs: "v=" + (new Date().getTime() / 60000).toFixed(),
    paths: {
        'zepto': 'lib/zepto',
        'underscore': 'lib/underscore',

        'engine': 'core/engine',
        'route': 'core/route',
        'widget': 'core/widget',
        'watch': 'core/watch',

        'deferred': 'plugin/deferred',
        'ajax': 'plugin/ajax',
        'tool': 'plugin/tool',

        'router': 'router'
    },
    shim: {
        'zepto': {
            exports: '$'
        },
        'deferred': {
            deps: ['zepto']
        }
    }
});

require(['zepto', 'underscore', 'engine', 'widget', 'router', 'ajax', 'deferred', 'tool','watch'], function ($, _, xjs, widget, router, ajax, deferred, tool, watch) {
    var user;
    /**
     * 获取用户数据
     * @memberOf xjs
     * @return {Object} 用户数据
     */
    xjs.getUserInfo = function () {
        return user;
    };

    /**
     * 更新用户数据
     * @memberOf xjs
     * @param {Object} data 用户数据
     */
    xjs.setUserInfo = function (data) {
        user = data;
    };

    /**
     * 框架内部的工具库
     * @method tool
     * @memberOf xjs
     * @see module:tool
     */
    xjs.tool = tool;

    /**
     * 挂载ajax模块
     * @method load
     * @memberOf xjs
     * @see module:load
     */
    xjs.load = ajax;

    $(function () {
        /**
         * 启动路由
         * @method start
         * @memberOf xjs/router
         */
        xjs.router.start();
    });
});