define('router', ['engine', 'route'], function (xjs, Route) {
    /**
     * 路由模块
     * @namespace xjs/router
     * @type {module#router}
     * @see module#router
     */
    xjs.router = new Route();

    /**
     * 路由映射表定义
     * @method setup
     * @memberOf xjs/router
     * @see module:router#setup
     */
    xjs.router.setup({
        '#home/': 'Home'
    }, {
        before: function (hash, params) {},
        fail: function () {}
    });

    /**
     * 路由回调定义
     * @method define
     * @memberOf xjs/router
     * @see module:router#define
     */
    xjs.router.define('Home', function () {
        xjs.createView('Page.Home', {finalStep: true})
    });
});