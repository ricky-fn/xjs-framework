define('engine', ['zepto', 'underscore'], function ($, _) {
    /**
     * 框架的方法集合，是全局公用对象
     * @namespace xjs
     */
    window.xjs = xjs = {};

    var containerNode = document.getElementById('appview');
    var _class = {};
    var _instances = xjs._instances = {};

    /**
     * 销毁一个Page类，并触发onExit事件
     * @method destoryView
     * @memberOf xjs
     * @param {string} id 实例化类的id
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

        $.each(obj, function (name, widget) {
            if (widget.keepInside)
                return;

            widget.onExit();
            delete _instances[name];
        });
    };

    /**
     * 实例化一个Page类，请确已使用xjs.declare申明这个类
     * @method createView
     * @memberOf xjs
     * @param {String} name 已申明的Page类名
     * @param {Object}[param] 可选参数，可选此对象将会和Page对象合并
     * @param {Object}[wrapper] 可选参数，传入Dom节点则会以这个节点为父节点，否则就会在#appview下创建一个新的dom节点
     * @param {Boolean}[defaultNode] 可选参数，选择以Wrapper或Wrapper的子节点作为主节点，将会插入模板到此结点
     */
    xjs.createView = function (name, param, wrapper, defaultNode) {
        if (!wrapper) {
            wrapper = document.createElement('div');
            $(containerNode).append(wrapper);
        } else {
            if (!defaultNode) {
                wrapper = $('<div></div>').appendTo(wrapper).get(0);
            } else {
                wrapper = $(wrapper).get(0);
            }
        }
        return xjs.getDeclare(name, param || {}, wrapper);
    };

    xjs.getDeclare = function (name, param, node) {
        return arguments.length > 1 ? (function () {
            var dtd = $.Deferred();

            node.id = (function () {
                var o = 0, taskName = name.replace(/\./, '_') + '_';
                while (_instances[taskName + o]) {
                    o += 1;
                }
                return taskName + o;
            })();

            require([name], function (page) {
                _instances[node.id] = mixinProp(page, param);
                _instances[node.id].init(node);
                dtd.resolve(_instances[node.id]);
            });

            return dtd.promise();
        })() : _class[name];
    };

    /**
     * 申明一个Page类，所有Page类都需要先申明后才可以作为参数被被creatView使用
     * @method declare
     * @memberOf xjs
     * @param {String} classname Page类的名字
     * @param {Object} parents 继承的对象
     * @param {Object} prop Page类的方法集合
     * @see widget
     */
    xjs.declare = function (classname, parents, prop) {
        return _class[classname] = mixinProp(parents, prop);
    };

    /**
     * 获取一个已实例化的Page类，传入Page类的id后获取到对象
     * @method byId
     * @memberOf xjs
     * @param {String} 传入实例化的Page类下的_id
     * @return {Object} 当前id所对应的Page类的this对象
     */
    xjs.byId = function (id) {
        var id = id.indexOf('#') >= 0 ? id.substr(1) : id;
        return _instances[id];
    };

    /**
     * 注册一个全局事件，可以通过xjs.triggerAnnounceEvent触发
     * @method addAnnounceEvent
     * @memberOf xjs
     * @param {String} name 事件名
     * @param {Function} fn 回调函数
     */
    xjs.addAnnounceEvent = function (name, fn) {
        $(document).on(name, fn);
    };

    /**
     * 触发一个全局事件
     * @method triggerAnounceEvent
     * @memberOf xjs
     * @param {String} name 事件名
     */
    xjs.triggerAnnounceEvent = function (name) {
        var parameter = [].slice.apply(arguments, [1, arguments.length]);
        $(document).trigger(name, parameter);
    };

    /**
     * 注销一个全局事件
     * @method removeAnnounceEvent
     * @memberOf xjs
     * @param {String} name 事件名
     */
    xjs.removeAnnounceEvent = function (name) {
        $(document).off(name);
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
        var prototype = _.create(parentClass);

        for (var name in prop) {
            prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }
        return prototype;
    }

    return xjs;
});