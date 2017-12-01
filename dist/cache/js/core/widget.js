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