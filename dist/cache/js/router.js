"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _route = require("./core/route.js");

var _route2 = _interopRequireDefault(_route);

var _PageHome = require("./Page.Home.js");

var _PageHome2 = _interopRequireDefault(_PageHome);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Router = new _route2.default();

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
  page: _PageHome2.default
});

exports.default = Router;