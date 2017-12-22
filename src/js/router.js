import Route from "./core/route.js"
import Home from "./views/Page.Home.js"
import Test from "./views/Page.Test.js"

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

export default Router;