define('router', ['engine', 'route'], function (xjs, Route) {
    /**
     * 路由模块
     * @namespace xjs/router
     * @type {module#Router}
     * @see module#Router
     */
    xjs.router = new Route();

    /**
     * 路由映射表定义
     * @method setup
     * @memberOf xjs/router
     * @see module:Router#setup
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
     * @see module:Router#define
     */
    xjs.router.define('Home', function () {
        xjs.createView('Page.Home', {finalStep: true})
    });
});