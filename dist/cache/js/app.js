"use strict";

var _engine = require("./core/engine.js");

var _engine2 = _interopRequireDefault(_engine);

var _broadcast = require("./core/broadcast.js");

var _broadcast2 = _interopRequireDefault(_broadcast);

var _router = require("./router.js");

var _router2 = _interopRequireDefault(_router);

var _tool = require("./plugin/tool.js");

var _tool2 = _interopRequireDefault(_tool);

var _zeptoModules = require("zepto-modules/");

var _zeptoModules2 = _interopRequireDefault(_zeptoModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 路由模块
 * @namespace xjs/router
 * @type {module#router}
 * @see module#router
 */
_engine2.default.router = _router2.default;

/**
 * 框架内部的工具库
 * @method tool
 * @memberOf xjs
 * @see module:tool
 */
_engine2.default.tool = _tool2.default;

/**
 * 挂载ajax模块
 * @method load
 * @memberOf xjs
 * @see module:load
 */
// xjs.load = ajax;

/**
 * 挂在事件广播模块
 * @method broadcast
 * @memberOf xjs
 * @type {module:broadcast}
 * @see module:broadcast
 */
_engine2.default.broadcast = _broadcast2.default;

(0, _zeptoModules2.default)(function () {
  /**
   * 启动路由
   * @method start
   * @memberOf xjs/router
   */
  _engine2.default.router.start();
});