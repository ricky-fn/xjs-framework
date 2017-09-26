define('engine', ['zepto', 'underscore'], function ($, _) {
    window.xjs = xjs = {};

    var containerNode = document.getElementById('appview');
    var _class = {};
    var _instances = xjs._instances = {};

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

    xjs.destroyViewByNexus = function (nexus) {
        if (!nexus.length)
            return xjs.destroyView(instance);

        for (var instance in _instances) {
            if (nexus.indexOf(_instances[instance].routeEventName) < 0)
                xjs.destroyView(instance);
        }
    };

    // xjs.checkRoutingInstance = function (name) {
    //     for (var instance in _instances) {
    //         if (_instances[instance].routeEventName == name)
    //             return true;
    //     }
    //     return false;
    // };

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

    xjs.declare = function (classname, parents, prop) {
        return _class[classname] = mixinProp(parents, prop);
    };

    xjs.byId = function (id) {
        var id = id.indexOf('#') >= 0 ? id.substr(1) : id;
        return _instances[id];
    };

    xjs.addAnnounceEvent = function (name, fn) {
        $(document).on(name, fn);
    };

    xjs.triggerAnnounceEvent = function (name) {
        var parameter = [].slice.apply(arguments, [1, arguments.length]);
        $(document).trigger(name, parameter);
    };

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