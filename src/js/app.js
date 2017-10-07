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
    xjs.getUserInfo = function () {
        return user;
    };

    /**
     * [setUserInfo description]
     * @param {Object} data [设置用户数据]
     */
    xjs.setUserInfo = function (data) {
        user = data;
    };

    // todo 挂载工具库
    xjs.tool = tool;
    // todo 挂载ajax模块
    xjs.load = ajax;

    $(function () {
        xjs.router.start();
    });
});