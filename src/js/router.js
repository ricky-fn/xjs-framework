import Route from "./core/route.js"
import Home from "./views/Page.Home.js"

const Router = new Route();
/**
 * 路由映射表定义
 * @method setup
 * @memberOf xjs/router
 * @see module:router#setup
 */
Router.setup({
    'home/': 'Home',
    'test/': 'Test'
});

// xjs.router.component({
//     "sideBar": {
//         render: function (cb) {
//             xjs.createView('Page.Home').then(cb);
//         }
//     },
//     "Test": {
//         render: function (cb) {
//             xjs.createView('Page.Test').then(cb);
//         }
//     }
// });

/**
 * 路由回调定义
 * @method define
 * @memberOf xjs/router
 * @see module:router#define
 */
Router.define({
    path: 'Home',
    page: Home
});

const path = require('path');
const context = require.context("./views", false, /\.js$/);
const modules = {};
context.keys().forEach(key => {
    var module = context(key);
    modules[key] = module;
});

export default Router;