"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _widget = require("./core/widget.js");

var _widget2 = _interopRequireDefault(_widget);

var _engine = require("./core/engine.js");

var _engine2 = _interopRequireDefault(_engine);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Page = _engine2.default.declare(_widget2.default, {
    title: '首页',
    templateString: "这里是首页",
    baseClass: 'page-home fade in'
});

exports.default = Page;