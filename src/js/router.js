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
        '#home/': 'Home',
        '#test/': 'Test'
    }, {
        before: function (hash, params) {},
        fail: function () {}
    });

    xjs.router.component({
        "sideBar": {
            render: function (cb) {
                xjs.createView('Page.Home').then(cb);
            }
        },
        "Test": {
            render: function (cb) {
                xjs.createView('Page.Test').then(cb);
            }
        }
    });

    /**
     * 路由回调定义
     * @method define
     * @memberOf xjs/router
     * @see module:router#define
     */
    xjs.router.define('Home', ["sideBar", "Test"], function () {
        xjs.createView('Page.Home', {finalStep: true});
    });

    xjs.router.define('Test', ["sideBar"], function () {
        xjs.createView('Page.Test', {finalStep: true});
    });
});