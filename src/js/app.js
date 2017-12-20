import xjs from "./core/engine.js"
import broadcast from "./core/broadcast.js"
import router from "./router.js"
import tool from "./plugin/tool.js"
import {http, httpConfig} from "./api/http.js"
import "../sass/app.scss"
import mock from "./api/mock.js"

/**
 * 路由模块
 * @namespace xjs/router
 * @type {module#router}
 * @see module#router
 */
xjs.router = router;

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
const ajax = new http();

xjs.$http = ajax.request.bind(ajax);

/**
 * 挂在事件广播模块
 * @method broadcast
 * @memberOf xjs
 * @type {module:broadcast}
 * @see module:broadcast
 */
xjs.broadcast = broadcast;

$(() => {
    /**
     * 启动路由
     * @method start
     * @memberOf xjs/router
     */
    xjs.router.start();
});