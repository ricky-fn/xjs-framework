(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./core/engine.js":4,"./core/widget.js":6}],2:[function(require,module,exports){
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
},{"./core/broadcast.js":3,"./core/engine.js":4,"./plugin/tool.js":7,"./router.js":8,"zepto-modules/":9}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var sequence = {};

var broadcast = function broadcast(conf) {
    var self = this;
    if (this instanceof broadcast) {
        if (conf instanceof Array) {
            conf.forEach(function (v) {
                broadcast[(v, method)].call(self, v.name, v.assignee, v.fn);
            });
        } else {
            broadcast[conf.method].call(this, conf.name, conf.assignee, conf.fn);
        }
    } else {
        return new broadcast(conf);
    }
};

broadcast.add = function (name, assignee, fn) {
    var target = sequence[name];

    if (target !== undefined) {
        target.members.forEach(function (member) {
            if (member.assignee == assignee) throw "'" + assignee + "' already existed in '" + name + "' event";
        });
        target.members.push({ assignee: assignee, fn: fn });
    } else {
        sequence[name] = {
            members: [{ assignee: assignee, fn: fn }]
        };
    }
};

broadcast.trigger = function (name) {
    var params = [].slice.call(arguments, 1, arguments.length);
    var target = sequence[name];

    if (target == undefined) {
        return console.warn(name + " event has not to been addition yet");
    }

    target.members.forEach(function (member) {
        setTimeout(function () {
            member.fn.apply(null, params);
        }, 0);
    });
};

broadcast.remove = function (name, assignee) {
    var target = sequence[name];

    if (target !== undefined) {
        target.members.forEach(function (member, index) {
            if (member.assignee == assignee) target.members.splice(index, 1);
        });
    } else {
        target.members = [];
    }
};

broadcast.prototype = broadcast.prototype.constructor;

exports.default = broadcast;
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _default = require('zepto-modules/_default');

var _default2 = _interopRequireDefault(_default);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 框架的方法集合，是全局公用对象
 * @namespace xjs
 */
var xjs = window.xjs = {};

var _instances = xjs._instances = {};

/**
 * 销毁一个Page类，并触发onExit事件
 * @method destroyView
 * @memberOf xjs
 * @param {string} id 实例化后的Page类的`id`
 * @see widget
 */
xjs.destroyView = function (id) {
    if (!Object.getOwnPropertyNames(_instances).length) return;

    var obj = {};
    if (id) {
        obj[id] = _instances[id];
    } else {
        obj = _instances;
    }

    _default2.default.each(obj, function (name, widget) {
        if (widget.keepInside) return;

        widget.onExit();
        delete _instances[name];
    });
};

/**
 * 实例化一个Page类，请确已申明这个类。[xjs.declare]{@link xjs.declare}
 * @method createView
 * @memberOf xjs
 * @param {String} name 已申明的Page类名
 * @param {Object} param 可选此对象将会和Page对象合并
 * @param {Object} node 传入Dom节点则会以这个节点为父节点，否则就会在`#appview`下创建一个新的dom节点
 * @param {Boolean} defaultNode 选择以Wrapper或Wrapper的子节点作为主节点，将会插入模板到此结点
 * @return {Deferred} 返回一个Promise对象
 * @see xjs.declare
 */
xjs.createView = function (prop, param, node, defaultNode) {
    var containerNode = document.getElementById('appview');

    if (!node) {
        node = document.createElement('div');
        (0, _default2.default)(containerNode).append(node);
    } else {
        if (!defaultNode) {
            node = (0, _default2.default)('<div></div>').appendTo(node).get(0);
        } else {
            node = (0, _default2.default)(node).get(0);
        }
    }

    return new Promise(function (resolve, reject) {
        try {
            var instance = mixinProp(prop, param);
            instance.init(node, function () {
                resolve(instance);
            });
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * 申明一个Page类，所有Page类都需要先申明后才可以作为参数被被creatView使用
 * @method declare
 * @memberOf xjs
 * @param {String} classname Page类的名字
 * @param {Object} parents 此Page类的父类继承对象，通常使用[widget]{@link widget}作为父类
 * @param {Object} prop Page类的方法
 * @see widget
 */
xjs.declare = function (parents, prop) {
    return mixinProp(parents, prop);
};

function mixinProp(parentClass, prop) {
    if (!prop) {
        prop = parentClass;
        parentClass = {};
    }
    var fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;
    var _super = parentClass;
    var prototype = Object.create(parentClass);

    for (var name in prop) {
        prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? function (name, fn) {
            return function () {
                var tmp = this._super;
                this._super = _super[name];
                var ret = fn.apply(this, arguments);
                this._super = tmp;
                return ret;
            };
        }(name, prop[name]) : prop[name];
    }
    return prototype;
}

exports.default = xjs;
},{"zepto-modules/_default":9}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _tool = require("../plugin/tool.js");

var _tool2 = _interopRequireDefault(_tool);

var _zeptoModules = require("zepto-modules/");

var _zeptoModules2 = _interopRequireDefault(_zeptoModules);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 路由模块
 * @module route
 */
function Router() {
    this.state = {};
    this.componentSequence = {};
    this.map = [];
    this._currentNexus = false;
    this.history = [];
}

/**
 * 定义路由映射表以及路由的回调函数，支持利用正则表达式
 * @method setup
 * @memberOf module:route
 * @param [Object] routemap 路由定义表
 * @param [Object] callbacks 回调组
 * @example
 * var router new Router();
 * router.setup({
 *   '#home': 'Page.Home' //请确保唯一性
 * }，{
 *   before: function(){}, //处理路由切换前触发
 *   fail: function(){} //当路由找不到时的回调
 * })
 * router.define('Page.Home', function() {
 *  //todo something
 * })
 * //同时支持使用正则表达式匹配路由
 * //假设一个新闻业务模块包含bbc、cctv、netflix，那么路由可以这样定义:
 * //#page/bbc/news/
 * //#page/cctv/news/
 * //#page/netflix/news/
 * router.setup({
 *  '#page/(\\w+)/news/': 'Page.News' // 可以匹配到上述三个新闻渠道
 * });
 * router.define('Page.News', function(nId) {
 *   console.log(nid); //bbc
 * });
 */
Router.prototype.setup = function (routemap, cb) {
    var rule;
    this.callback = cb;
    for (rule in routemap) {
        if (!routemap.hasOwnProperty(rule)) continue;
        this.map.push({
            rule: new RegExp('^' + rule + '$', 'i'),
            quote: routemap[rule]
        });
    }
};

/**
 * 定义路由回调
 * @method define
 * @memberOf module:route
 * @param {String} name
 * @param {Object}[nexus] 此路由所依赖的关系链
 * @param {Boolean}[authorize] 是否需要登录操作
 * @param {Function} callback 回调函数，如果有路由关系链，将会等待关系链的成员准备好后再执行回调
 * @example
 * var router = new Router();
 * //一般定义
 * router.define('Page.Home', function() {
 * //todo something
 * })
 * //需要登陆验证
 * router.define('Page.Home', true, function() {
 * //todo something
 * });
 * //需要路由依赖
 * router.define('Page.Home', ['ui.Nav', 'ui.Header', 'ui.Footer'], function() {
 * //todo something
 * })；
 * //需要路由依赖、登陆验证
 * router.define('Page.Home', ['ui.Nav', 'ui.Header', 'ui.Footer'], true, function() {
 * //todo something
 * })；
 */
// Router.prototype.define = function (name, nexus, authorize, cb) {
Router.prototype.define = function (config) {
    var authorize = config.authorize || false;
    var path = config.path;
    var nexus = config.nexus;
    var page = config.page;

    if (page == undefined) throw "please aim which one page are used to render for this path";

    if (path == undefined) throw "path is a necessary argument";

    var self = this;
    var components = {};

    if (nexus) {
        nexus.forEach(function (name) {
            components[name] = self.componentSequence[name];
        });
    }

    this.map.forEach(function (map) {
        if (map.quote == path) {
            map.authorize = authorize;
            map.nexus = components;
            map.page = page;
            map.events = {
                beforeEnter: config.beforeEnter
            };
            return true;
        }
    });
};

/**
 * 路由导航
 * @method navigator
 * @memberOf xjs/router
 * @see module:route#navigator
 */

/**
 * 导航到下一个路由地址
 * @method navigator
 * @memberOf module:route
 * @param {String}[hash] 下一个路由的Hash地址，不填写则默认引导到#home
 * @param {Object}[state] 路由的缓存内容，将会存储到history.state对象里
 * @param {Boolean}[replaceHash] 当设置为true时会提换历史记录里最后一条路由信息，当设置为false时则会以新增的方式插入历史纪录
 * @example
 * var router = new Router();
 * //默认情况，引导到#home并在历史记录里插入新的记录
 * router.navigator('#home'）;
 * //追加路由缓存信息
 * router.navigator('#home', {isHomePage: true});
 * console.log(history.state.isHomePage) // true
 * //提换当前路由历史记录
 * router.navigator('#home', {}, true);
 */
// Router.prototype.navigator = function (hash, state, replaceHash) {
Router.prototype.navigator = function (param) {
    param = param || {};

    var self = this,
        to,
        from,
        route;

    route = matchRoute.call(this, param.path);

    if (route == false) throw "this path is not exist";

    var fullPath = getFullPath(param);

    to = {
        path: param.path,
        param: param.path.match(route.rule).slice(1),
        query: param.query,
        fullPath: fullPath
    };

    from = this.history[this.history.length];

    if (route.events.beforeEnter) {
        route.events.beforeEnter(to, from, function (next) {
            if (next == to) {
                end.call(this);
            } else {
                self.navigator(next);
            }
        });
    } else {
        end.call(this);
    }

    function end() {
        if (param.replaceHash) {
            this.history.pop().push(to);
            history.replaceState(null, null, to.fullPath);
        } else {
            this.history.push(to);
            history.pushState(null, null, to.fullPath);
        }

        renderComponents.call(self, route).then(function () {
            xjs.createView(route.page, {
                router: to
            });
        });
    };
};

/**
 * 启动路由监听事件，必须在定义路由引射表以及路由回调后再启动。<br>
 * 将会监听路由切换事件，例如浏览器的回退和前进
 * @method start
 * @memberOf module:route
 */
Router.prototype.start = function () {
    var that = this;

    function onHashChange(e) {
        // var param = [];
        var url = _tool2.default.url();
        if (url.hash) {
            // param.push(location.hash);
            // if (e && e.isTrusted) {
            //     param.push(null, true);
            // }
            // that.navigator.apply(that, param);
            that.navigator({
                path: url.hash,
                query: url.query,
                fullPath: url.toString()
            });
        } else {
            that.navigator({
                path: 'home/'
            });
        }
    }

    window.onhashchange = onHashChange;
    onHashChange();
};

Router.prototype.component = function (array) {
    this.componentSequence = array;
};

/**
 * 检查当前路由是否能在路由映射表里找到，如果找不到匹配值就会触发传递给setup里的fail函数
 * @method checkMatchResult
 * @memberOf module:route
 * @param {String} hash
 * @param {Object} router.map
 */
function matchRoute(hash) {
    var map = this.map;
    var path = verify(hash, map);
    var self = this;

    if (!path) return false;

    if (path.authorize && !xjs.getUserInfo()) {
        getAuthorization.call(self, hash);
    } else {
        return _zeptoModules2.default.extend({}, path, {
            param: hash.match(path.rule).slice(1)
        });
    }
}

/**
 * 跳转到登陆模块，完成用户身份验证后再进入hash所匹配的路由
 * @method getAuthorization
 * @memberOf module:route
 * @param hash
 */
function getAuthorization(hash) {
    this.navigator('#login/', { backHash: hash }, true);
}

/**
 * 检测hash是否在路由路由映射表内
 * @method verify
 * @memberOf module:route
 * @param hash
 * @return {Boolean} 是否匹配到
 */
function verify(hash, map) {
    var path;
    var hash = hash.indexOf('?') > 0 ? hash.slice(0, hash.indexOf('?')) : hash;
    for (var obj in map) {
        path = map[obj];

        if (hash.match(path.rule)) return path;
    }
    return false;
}

/**
 * 对当前路由依赖关系以及下一个路由依赖关系做对比，对不存在于路由关系链里的模块会销毁掉[xjs.destroyView]{@link xjs.destroyView}
 * @method filterComponents
 * @memberOf module:route
 */
function filterComponents(nexus) {
    var length = Object.keys(nexus);
    var currentNexus = this._currentNexus;

    if (length == 0) {
        xjs.destroyView();
        this._currentNexus = false;
        return nexus;
    } else {
        if (!currentNexus) {
            xjs.destroyView();
            this._currentNexus = nexus;
            return nexus;
        } else {
            findAbandonedItem(nexus, currentNexus).forEach(function (key) {
                xjs.destroyView(currentNexus[key].id);
                delete currentNexus[key].id;
            });

            findAbandonedInstance(currentNexus).forEach(function (id) {
                xjs.destroyView(id);
            });

            this._currentNexus = nexus;

            return findAddedItem(nexus, currentNexus);
        }
    }
}

function renderComponents(route) {
    var renderTeam = filterComponents.call(this, route.nexus);
    var renderSequence = [];
    var self = this;

    Object.keys(renderTeam).forEach(function (name) {
        var def = new Promise(function (resolve) {
            setTimeout(function () {
                self.componentSequence[name].render(function (instance) {
                    self.componentSequence[name].id = instance.id;
                    resolve();
                });
            }, 0);
        });
        renderSequence.push(def);
    });

    return Promise.all(renderSequence);
}

function findAbandonedInstance(oldNexus) {
    var ids = [];
    var mark = false;
    for (var obj in xjs._instances) {
        mark = false;
        for (var item in oldNexus) {
            if (oldNexus[item].id == xjs._instances[obj].id) mark = true;
        }
        if (mark == false) ids.push(xjs._instances[obj].id);
    }

    return ids;
}

function findAbandonedItem(nexus, oldNexus) {
    var nexusArray = Object.keys(nexus);
    var oldNexusArray = Object.keys(oldNexus);
    var items = [];

    oldNexusArray.forEach(function (key) {
        if (nexusArray.indexOf(key) < 0) {
            items.push(key);
        }
    });

    return items;
}

function findAddedItem(nexus, oldNexus) {
    var nexusArray = Object.keys(nexus);
    var oldNexusArray = Object.keys(oldNexus);
    var items = [];

    nexusArray.forEach(function (key) {
        if (oldNexusArray.indexOf(key) < 0) {
            items.push(key);
        }
    });

    return items;
}

function getFullPath(param) {
    if (param.query == undefined) return '';

    var fullPath = '#' + param.path + '?';
    Object.keys(param.query).forEach(function (key, index) {
        fullPath += key + '=' + param.query[key];
        if (index != Object.keys(param.query).length - 1) fullPath += '&';
    });
    return fullPath;
}

exports.default = Router;
},{"../plugin/tool.js":7,"zepto-modules/":9}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _engine = require("./engine");

var _engine2 = _interopRequireDefault(_engine);

var _default = require("zepto-modules/_default");

var _default2 = _interopRequireDefault(_default);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @fileOverview 这是Page的基类，所有Page的默认事件和流程都是在这里被定义<br>
 * 所有Page类通过[xjs.declare]{@link xjs.declare}申明，并将[widget]{@link widget}作为`parents`参数传入，用以继承默认事件流程。<br>
 * 最后使用[xjs.createView]{@link xjs.createView}实例化Page类
 *
 * 所有基类的函数都可以被重写（除了`init`）,重写后的事件可以调用`this.super()`方法执行父类被覆盖的函数<br>
 * widget的流程行顺序按照以下:<br>
 * `init—>render—>request—>syncGetData—>buildRender—>startup—>onExit`
 * @mixin widget
 */
var widget = _engine2.default.declare({
    /**
     * Page类的初始化函数，同时控制渲染事件的执行流程，此方法不可以被重写。
     * @memberOf widget
     * @function init
     * @param dom 根Dom节点，用于插入模板
     */
    init: function init(dom, callback) {
        var _this = this;

        this.domNode = this.domNode || (this.$domNode = (0, _default2.default)(dom)).get(0);

        this.render();

        this.syncGetData().then(function () {
            _this.buildRender();
            // if (!this.finalStep) {
            //     xjs.broadcast.trigger('widgetReady', this.routeEventName);
            // } else {
            //     xjs.broadcast.trigger('allWidgetReady', this.routeEventName);
            // }
            /**
             * 当模板和数据都被渲染后就会调用startup事件，Page里的Dom节点操作以及业务逻辑都应该在这里实现。
             * @memberOf widget
             * @function startup
             */
            _this.startup && _this.startup();
            callback && callback();
        });
        return this;
    },
    render: function render() {
        /**
         * 定义Page的标题
         *
         * @type {string}
         * @memberOf widget
         * @name title
         */
        document.title = this.title || document.title;
        /**
         * 实例化后的Page类id，此id是唯一的，可以用于`xjs.byId`获取到`This`对象
         *
         * @type {string}
         * @memberOf widget
         * @name id
         */
        this.id = this.domNode.id;
    },
    syncGetData: function syncGetData() {
        var _this2 = this;

        /**
         * request函数用于设置需要预先请求的数据队列，所有队列请求成功后才会执行后面的流程。
         * 对zepto的ajax模块进行了二次封装，所有参数和$.ajax一致。ajax返回的数据将会根据app的名字挂载到this.data下
         * @memberOf widget
         * @function request
         * @example
         * request: function() {
         *     return {
         *         app: 'name', //在request之后的函数中可以用this.data.name获取到数据
         *         url: 'example.do',
         *         data: {}
         *     }
         * }
         * //或者
         * request: function() {
         *     return [{
         *         app: 'app1', //在request之后的函数中可以用this.data.app1获取到数据
         *         url: 'example.do',
         *         data: {}
         *     }, {
         *         app: 'app2',
         *         url: 'test.do'
         *     }]
         * }
         */
        var sequence = this.request ? this.request() : false;
        var dtd = new Promise(function (resolve) {
            if (!sequence) return resolve();

            processSequence.call(_this2, resolve, sequence);
        });

        return dtd;
    },
    /**
     * 模板渲染流程，将会把this对象作为数据采集对象传入模板。并扫描模板里的自定义锚点后映射到this对象上<br>
     * [data-xjs-element] 将挂载到this对象上，并通过$ + name 用以区分普通dom对象和jquery对象
     * @example
     * <div data-xjs-element="divNode"></div>
     * //this.divNode 获取原始dom对象
     * //this.$divNode 获取jquery对象
     * @memberOf widget
     * @function buildRender
     * @see {widget#request}
     */
    buildRender: function buildRender() {
        /**
         * Page类的CSS Class Name
         *
         * @type {string}
         * @memberOf widget
         * @name baseClass
         */
        this.$domNode.addClass(this.baseClass);
        /**
         * 传入模板字符串，基于`underscore`的模板引擎渲染HTML
         *
         * @type {string}
         * @memberOf widget
         * @name templateString
         */
        if (this.templateString) {
            this.domNode.innerHTML = this.templateString;
        }
        __createNode.call(this) && __createEvent.call(this);
    },
    /**
     * Page的退出事件，在路由切换被触发时调用，如果有添加事件监听需要自行注销，应该写在这个事件里，
     * 如果你复写了这个函数，别忘了在function末尾调用this._super()
     * @memberOf widget
     * @function onExit
     */
    onExit: function onExit() {
        this.$domNode.off().remove();
    }
});

function __createNode() {
    var doms, dom, parents, n, i;
    doms = this.domNode.querySelectorAll('[data-xjs-element]');
    doms = Array.prototype.slice.call(doms);
    for (i = 0; i < doms.length; i++) {
        dom = (0, _default2.default)(doms[i]);
        parents = dom.parents('[data-xjs-mixin]');
        if (parents.length && parents[0] != this.domNode) break;
        n = dom.data('xjs-element');
        this[n] = (this['$' + n] = dom).get(0);
    }
    return true;
}

function __createEvent() {
    var doms, dom, parents, n, i;
    doms = this.domNode.querySelectorAll('[data-xjs-event]');
    doms = Array.prototype.slice.call(doms);
    if (this.$domNode.data('xjs-event')) doms.push(this.domNode);
    for (i = 0; i < doms.length; i++) {
        var f, j;
        dom = (0, _default2.default)(doms[i]);
        parents = dom.parents('[data-xjs-mixin]');

        if (parents.length && parents[0] != this.domNode) break;

        n = dom.data('xjs-event');
        f = n.replace(/\s/g, "").split(';').slice(0, -1);
        for (j = 0; j < f.length; j++) {
            var event = f[j].split(':');
            var ename = event[0];
            var efn = this[event[1]];
            if (efn == undefined) {
                console.warn(event[1] + ' event is not exist on this page');
            } else {
                dom.on(ename, efn.bind(this));
            }
        }
    }
    return true;
}

function processSequence(resolve, param) {
    var param = param instanceof Array ? param : [param],
        i,
        name,
        count = 0;
    this.data = this.data || {};
    for (i = 0; i < param.length; i++) {
        name = param[i].app;
        if (!param[i].hasOwnProperty('showShadow')) param[i].showShadow = true;
        delete param[i].app;

        _engine2.default.load(param[i]).then(function (key, result) {
            this.data[key] = result;
            count += 1;
            if (count == param.length) resolve();
        }.bind(this, name));
    }
}

exports.default = widget;
},{"./engine":4,"zepto-modules/_default":9}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _default = require('zepto-modules/_default');

var _default2 = _interopRequireDefault(_default);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tool = {
    url: function url(_url) {
        var dm, hs, qu;
        _url = _url || location.href;
        dm = _url.match(/^[^?#]+/i)[0];
        _url = _url.slice(dm.length);
        if (_url.match(/^\?[^#]+/i)) {
            qu = _url.match(/^\?[^#]+/i)[0];
            _url = _url.slice(qu.length);
            if (_url.match(/^#[^?]+/i)) {
                hs = _url.match(/^#[^?]+/i)[0];
            }
        } else if (_url.match(/^#[^?]+/i)) {
            hs = _url.match(/^#[^?]+/i)[0];
            _url = _url.slice(hs.length);
            if (_url.match(/^\?[^#]+/i)) {
                qu = _url.match(/^\?[^#]+/i)[0];
            }
        }
        var param = (qu || '').slice(1);
        _url = {
            domain: dm,
            // query: (qu || '').slice(1),
            hash: (hs || '').slice(1),
            query: {},
            toString: function toString() {
                var key, ref, val;
                qu = '';
                ref = this.query;
                for (key in ref) {
                    val = ref[key];
                    qu += key;
                    if (val !== void 0 && val !== null) {
                        qu += '=' + val;
                    }
                }
                if (qu) {
                    qu = '?' + qu;
                }
                hs = this.hash ? '#' + this.hash : '';
                return hs + qu;
            }
        };
        if (param) {
            param.replace(/(?:^|&)([^=&]+)(?:=([^&]*))?/gi, function (a, b, d) {
                return _url.query[b] = d;
            });
        }
        return _url;
    },
    formToObject: function formToObject(form, trim) {
        var data;
        if (!form.serializeArray) {
            form = (0, _default2.default)(form);
        }
        data = {};
        if (trim === void 0) {
            trim = 1;
        }
        _default2.default.each(form.serializeArray(), function (i, field) {
            return data[field.name] = trim ? _default2.default.trim(field.value) : field.value;
        });
        return data;
    },
    formatDate: function formatDate(date, fmt) {
        if (!fmt) {
            fmt = date;
            date = new Date();
        }
        var o = {
            "M+": date.getMonth() + 1, //月份
            "d+": date.getDate(), //日
            "h+": date.getHours(), //小时
            "m+": date.getMinutes(), //分
            "s+": date.getSeconds(), //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }return fmt;
    },
    userAgent: {
        isAndroid: function isAndroid() {
            return navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;
        },
        isIOS: function isIOS() {
            return !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        },
        isPad: function isPad() {
            var zIndex = (0, _default2.default)('#appview').css('z-index');
            return zIndex == 2;
        },
        isPhone: function isPhone() {
            var zIndex = (0, _default2.default)('#appview').css('z-index');
            return zIndex == 1;
        }
    }
};

exports.default = tool;
},{"zepto-modules/_default":9}],8:[function(require,module,exports){
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
},{"./Page.Home.js":1,"./core/route.js":5}],9:[function(require,module,exports){
var $ = require('./zepto');

require('./event');
require('./ajax');
require('./form');
require('./ie');

module.exports = $;

},{"./ajax":10,"./event":11,"./form":12,"./ie":13,"./zepto":14}],10:[function(require,module,exports){
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = require('./zepto');

;(function($){
  var jsonpID = +new Date(),
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  function ajaxDataFilter(data, type, settings) {
    if (settings.dataFilter == empty) return data
    var context = settings.context
    return settings.dataFilter.call(context, data, type)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('Zepto' + (jsonpID++)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true,
    //Used to handle the raw response data of XMLHttpRequest.
    //This is a pre-filtering function to sanitize the response.
    //The sanitized response should be returned
    dataFilter: empty
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET' || 'jsonp' == options.dataType))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor, hashIndex
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      // cleans up URL for .href (IE only), see https://github.com/madrobby/zepto/pull/1049
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    if ((hashIndex = settings.url.indexOf('#')) > -1) settings.url = settings.url.slice(0, hashIndex)
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))

          if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
            result = xhr.response
          else {
            result = xhr.responseText

            try {
              // http://perfectionkills.com/global-eval-what-are-the-options/
              // sanitize response accordingly if data filter callback provided
              result = ajaxDataFilter(result, dataType, settings)
              if (dataType == 'script')    (1,eval)(result)
              else if (dataType == 'xml')  result = xhr.responseXML
              else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
            } catch (e) { error = e }

            if (error) return ajaxError(error, 'parsererror', xhr, settings, deferred)
          }

          ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

},{"./zepto":14}],11:[function(require,module,exports){
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = require('./zepto');

;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }

  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'

  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||
      !!captureSetting
  }

  function realEvent(type) {
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))
    events.split(/\s/).forEach(function(event){
      if (event == 'ready') return $(document).ready(fn)
      var handler   = parse(event)
      handler.fn    = fn
      handler.sel   = selector
      // emulate mouseenter, mouseleave
      if (handler.e in hover) fn = function(e){
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
          return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return
        e.data = data
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }

  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      try {
        event.timeStamp || (event.timeStamp = Date.now())
      } catch (ignored) { }

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }

  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (callback === undefined || data === false)
      callback = data, data = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){
        remove(element, e.type, callback)
        return callback.apply(this, arguments)
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0)
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse

    return $this.each(function(){
      remove(this, event, callback, selector)
    })
  }

  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?
        this.bind(event, callback) :
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    if (!isString(type)) props = type, type = props.type
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

},{"./zepto":14}],12:[function(require,module,exports){
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = require('./zepto');

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

},{"./zepto":14}],13:[function(require,module,exports){
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

;(function(){
  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle
    window.getComputedStyle = function(element, pseudoElement){
      try {
        return nativeGetComputedStyle(element, pseudoElement)
      } catch(e) {
        return null
      }
    }
  }
})()

},{}],14:[function(require,module,exports){
//     Zepto.js
//     (c) 2010-2016 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.matches || element.webkitMatchesSelector ||
                          element.mozMatchesSelector || element.oMatchesSelector ||
                          element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }

  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }

  function likeArray(obj) {
    var length = !!obj && 'length' in obj && obj.length,
      type = $.type(obj)

    return 'function' != type && !isWindow(obj) && (
      'array' == type || length === 0 ||
        (typeof length == 'number' && length > 0 && (length - 1) in obj)
    )
  }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
  }
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    var element, display
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  function Z(dom, selector) {
    var i, len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overridden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. This method can be overridden in plugins.
  zepto.Z = function(dom, selector) {
    return new Z(dom, selector)
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overridden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overridden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' && fragmentRE.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overridden in plugins.
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (element.getElementById && isSimple && maybeID) ? // Safari DocumentFragment doesn't have getElementById
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ? [] :
      slice.call(
        isSimple && !maybeID && element.getElementsByClassName ? // DocumentFragment doesn't have getElementsByClassName/TagName
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.isNumeric = function(val) {
    var num = Number(val), type = typeof val
    return val != null && type != 'boolean' &&
      (type != 'string' || val.length) &&
      !isNaN(num) && isFinite(num) || false
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }
  $.noop = function() {}

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }

  $.each = function(elements, callback){
    var i, key
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections
  $.fn = {
    constructor: zepto.Z,
    length: 0,

    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    indexOf: emptyArray.indexOf,
    concat: function(){
      var i, value, args = []
      for (i = 0; i < arguments.length; i++) {
        value = arguments[i]
        args[i] = zepto.isZ(value) ? value.toArray() : value
      }
      return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
    },

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false)
      return this
    },
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    toArray: function(){ return this.get() },
    size: function(){
      return this.length
    },
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },
    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },
    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },
    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },
    closest: function(selector, context){
      var nodes = [], collection = typeof selector == 'object' && $(selector)
      this.each(function(_, node){
        while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
          node = node !== context && !isDocument(node) && node.parentNode
        if (node && nodes.indexOf(node) < 0) nodes.push(node)
      })
      return $(nodes)
    },
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      return filtered(ancestors, selector)
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
    contents: function() {
      return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },
    empty: function(){
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){
      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
    replaceWith: function(newContent){
      return this.before(newContent).remove()
    },
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },
    clone: function(){
      return this.map(function(){ return this.cloneNode(true) })
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },
    html: function(html){
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this.pluck('textContent').join("") : null)
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
        (0 in this && this[0].nodeType == 1 && (result = this[0].getAttribute(name)) != null ? result : undefined) :
        this.each(function(idx){
          if (this.nodeType !== 1) return
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        (this[0] && this[0][name])
    },
    removeProp: function(name){
      name = propMap[name] || name
      return this.each(function(){ delete this[name] })
    },
    data: function(name, value){
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?
        this.attr(attrName, value) :
        this.attr(attrName)

      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      if (0 in arguments) {
        if (value == null) value = ""
        return this.each(function(idx){
          this.value = funcArg(this, value, idx, this.value)
        })
      } else {
        return this[0] && (this[0].multiple ?
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
           this[0].value)
      }
    },
    offset: function(coordinates){
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {
              top:  coords.top  - parentOffset.top,
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        $this.css(props)
      })
      if (!this.length) return null
      if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
        return {top: 0, left: 0}
      var obj = this[0].getBoundingClientRect()
      return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },
    css: function(property, value){
      if (arguments.length < 2) {
        var element = this[0]
        if (typeof property == 'string') {
          if (!element) return
          return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property)
        } else if (isArray(property)) {
          if (!element) return
          var props = {}
          var computedStyle = getComputedStyle(element, '')
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        for (key in property)
          if (!property[key] && property[key] !== 0)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }

      return this.each(function(){ this.style.cssText += ';' + css })
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    hasClass: function(name){
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          classList = classList.replace(classRE(klass), " ")
        })
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      var hasScrollTop = 'scrollTop' in this[0]
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :
        function(){ this.scrollTo(this.scrollX, value) })
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
        (offset = this.offset()) && offset[dimension]
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            var arr = []
            argType = type(arg)
            if (argType == "array") {
              arg.forEach(function(el) {
                if (el.nodeType !== undefined) return arr.push(el)
                else if ($.zepto.isZ(el)) return arr = arr.concat(el.get())
                arr = arr.concat(zepto.fragment(el))
              })
              return arr
            }
            return argType == "object" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src){
              var target = el.ownerDocument ? el.ownerDocument.defaultView : window
              target['eval'].call(target, el.innerHTML)
            }
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

  zepto.Z.prototype = Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

module.exports = Zepto;

},{}]},{},[2]);
