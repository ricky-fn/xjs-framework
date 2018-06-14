define('engine', ['zepto', 'underscore'], function ($, _) {
    /**
     * 框架的方法集合，是全局公用对象
     * @namespace xjs
     */
    xjs = {};

    var containerNode = document.getElementById('appview');
    var _class = {};
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

        $.each(obj, function (name, widget) {
            if (widget.keepInside)
                return;

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
    xjs.createView = function (name, param, node, defaultNode) {
        if (!node) {
            node = document.createElement('div');
            $(containerNode).append(node);
        } else {
            if (!defaultNode) {
                node = $('<div></div>').appendTo(node).get(0);
            } else {
                node = $(node).get(0);
            }
        }

        var def = $.Deferred();
        var prop = this.getDeclare(name);

        node.id = (function () {
            var o = 0, taskName = name.replace(/\./, '_') + '_';
            while (_instances[taskName + o]) {
                o += 1;
            }
            return taskName + o;
        })();

        if (prop == undefined) {
            require([name], function (prop) {
                try {
                    var instance = _instances[node.id] = mixinProp(prop, param);
                    instance.init(node);
                } catch (err) {
                    throw err;
                }
                def.resolve(instance);
            });
        } else {
            try {
                var instance = _instances[node.id] = mixinProp(prop, param);
                instance.init(node, function () {
                    def.resolve(instance);
                });
            } catch (err) {
                def.reject(err);
            }
        }

        return def.promise();
    };

    xjs.getDeclare = function (name) {
        return _class[name];
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
    xjs.declare = function (className, parents, prop) {
       if (xjs.getDeclare(className) !== undefined)
           throw "this className has been declared already";

        return _class[className] = mixinProp(parents, prop);
    };

    /**
     * 获取一个已实例化的Page类，传入Page类的id后获取到对象
     * @method byId
     * @memberOf xjs
     * @param {String} id 传入实例化的Page类的`id`
     * @return {Object} 当前id所对应的Page类的this对象
     */
    xjs.byId = function (id) {
        var id = id.indexOf('#') >= 0 ? id.substr(1) : id;
        return _instances[id];
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