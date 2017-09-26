define('router', ['engine', 'route'], function (xjs, Route) {
    xjs.router = new Route();

    // 使用正则表达式时类似\w的要改成\\w
    xjs.router.setup({
        '#home/': 'Home'
    }, {
        before: function (hash, params) {},
        fail: function () {}
    });

    xjs.router.define('Home', function () {
        xjs.createView('Page.Home', {finalStep: true})
    });
});