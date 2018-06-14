define('Page.Test', ['engine', 'widget'], function (xjs, base) {
    var declare = xjs.declare;

    return declare('Page.Test', base, {
        title: '首页111',
        templateString: '测试数据',
        baseClass: 'page-home fade in'
    });
});