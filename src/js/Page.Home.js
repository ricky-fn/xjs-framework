define('Page.Home', ['engine', 'widget'], function (xjs, base) {
    var declare = xjs.declare;

    return declare('Page.Home', base, {
        title: '首页',
        templateString: __include('pages/Page.Home.html'),
        baseClass: 'page-home fade in'
    });
});