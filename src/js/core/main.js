import {parse} from "himalaya"
import addKey from "./util/addKey"
import render from "./virtual/render"
import _parser from "./virtual/parse"
import watch from "./watch"
import watcher from "./virtual/watch"
import compare from "./virtual/compare"
import {directives} from "./virtual/analyse"

const publicDirectives = [];

function checkExistence(target, props, recall) {
    let keys = Object.keys(props);

    keys.forEach(prop => {
        if (target.hasOwnProperty(prop)) {
            recall(prop);
        }
    })
}

function parseHTML(str) {
    let json = parse(str);
    addKey(json);

    return json;
}

function parser(json, vm) {
    return new _parser(json, vm);
}

let turbine = function(props) {
    let {data, methods, watch} = props;
    let vm = new turbine.prototype._init(props);

    if (data != undefined && typeof data == "object") {
        vm._observe(vm, data);
    }
    vm._setMethods(vm, methods);

    if (typeof watch == "object") {
        let keys = Object.keys(watch);

        keys.forEach(key => {
            vm.$watch(key, watch[key]);
        });
    }

    if (vm.$el != undefined && vm.$el != null) {
        vm._render(vm.$el, vm);
    }

    return vm;
};

turbine.prototype = {
    // $el: null, //parent dom node, it could be a string or a dom object
    // _refs: {},
    // $refs: {},
    // _continued: true, // to manage whether dom should be reRendered
    // $jsonTree: null,
    // _vnode: null, // to define JSON type of html tree
    // _components: null,
    // _dir: [],
    _init(props) {
        let {el, template, components, directives} = props;

        this._refs = {};
        this.$refs = {};

        if (el != undefined) {
            if (typeof el == "string") {
                el = document.body.querySelector(el);
            }
            template = el.outerHTML;

            this.$el = el;
            this.$jsonTree = parseHTML(template);
            this._continued = true;
        } else if (template != undefined) {
            this.$jsonTree = parseHTML(template);
            this._continued = false;
        }

        {
            this._dir = [];
            publicDirectives.forEach(directives => {
                this._dir.push(directives);
            });
            if (directives instanceof Object) {
                for (let key in directives) {
                    turbine.directive(this, key, directives[key]);
                }
            }
        }

        if (turbine._components || components) {
            this._components = Object.assign({}, components, turbine._components);
        }

        return this;
    },
    _render(el, vm) {
        let parentNode = el.parentNode;

        this._vnode = parser(this.$jsonTree, vm);

        let domFragment = render(this._vnode);
        this.$el = domFragment.firstChild;

        parentNode.replaceChild(domFragment, el);

        if (typeof vm.ready == "function") {
            vm.ready();
        }
    },
    _observe(vm, key, value) {
        let type = typeof key,
            length = arguments.length,
            data;

        if (length == 2 && type == "object") {
            data = key;
        } else if (length == 3 && type == "string") {
            data = {};
            data[key] = value;
        } else {
            return console.error("arguments error");
        }

        checkExistence(vm, data, (prop) => {
            console.error(prop + " has been used as a basic prototype");
            delete data[prop];
        });

        new watch(
            vm.$data || (function () {
                Object.defineProperty(vm, "$data", {
                    value: {},
                    enumerable: false
                });
                return vm.$data;
            })(), data, vm, () => {
            this._updateView(vm);
        });

        new watch(vm, vm.$data, vm, () => {
            this._updateView(vm);
        });
    },
    _setMethods(vm, methods) {
        if (typeof methods != "object") {
            return;
        }
        let keys = Object.keys(methods);

        keys.forEach(key => {
            if (vm.hasOwnProperty(key)) {
                return console.error(key + "has been used as a data prototype");
            }
            vm[key] = methods[key];
        });
    },
    _updateView(vm) {
        if (!this._continued) {
            return;
        }

        let oldVN = this._vnode;
        let newVN = this._vnode = parser(this.$jsonTree, vm);

        compare(oldVN, newVN, {childNodes: [vm.$el]}, vm);
    }
};

turbine._turbine = turbine.prototype;

turbine._turbine._init.prototype = turbine.prototype;

turbine.use = (obj, options) => {
    if (obj instanceof Object) {
        obj.install(turbine, options);
    }
};

turbine.set = turbine._turbine.$set = function() {
    let length = arguments.length,
        i = 3,
        target, key, value;

    if (length == i) {
        target = arguments[0];
        key = arguments[1];
        value = arguments[2];
    } else {
        target = this;
        key = arguments[0];
        value = arguments[1];
    }

    if (target instanceof Array) {
        return target.forEach(el => {
            if (el instanceof turbine._turbine._init) {
                set(el, key, value);
            } else {
                throw("target must be a instance of turbine");
            }
        });
    } else if (target instanceof turbine.prototype._init) {
        set(target, key, value);
    } else {
        throw("target must be a instance of turbine");
    }

    function set(target, key, value) {
        target._observe(target, key, value);
    }
};

turbine._turbine.$watch = function(exp, call, options) {
    let avoid = true;
    new watcher(this, null, exp, (oldVal, newVal) => {
        if (!avoid) {
            call.call(this, oldVal, newVal);
        }
        avoid = false;
    });
};

turbine.hangup = turbine._turbine.$hangup = function(vm) {
    if (this instanceof turbine._turbine._init) {
        this.beforeHangup && this.beforeHangup();

        // this.$refs = {};
        this._continued = false;
        this._vnode[0].remove();
        this._vnode = null;
    } else if (vm instanceof turbine._turbine._init) {
        vm.$hangup();
    }
};

turbine.restart = turbine._turbine.$restart = function(vm) {
    if (this instanceof turbine._turbine._init) {
        this._continued = true;
        this._render(vm.$el, vm);
    } else if (vm instanceof turbine._turbine._init) {
        vm.$restart(vm);
    }
};

turbine._turbine.$mount = function (el) {
    let element = el;

    if (el instanceof HTMLElement) {
        element = el;
    } else if (typeof el == "string") {
        element = document.body.querySelector(el);
    } else {
        throw "arguments error";
    }

    this._continued = true;
    this._render(this.$el = element, this);

    return this;
};

turbine.component = function (tagName, props) {
    turbine._components = turbine._components || {};

    turbine._components[tagName] = props;
};

turbine.directive = function (_t, name, fn) {
    let config = {};

    if (arguments.length == 2) {
        fn = name;
        name = _t;
        _t = null;
    }

    if (typeof fn == "function") {
        config.bind = config.update = fn;
    } else if (typeof fn === "object") {
        config = fn;
    } else {
        throw("arguments error\n" + fn);
    }

    config.directive = name;

    let _conf = Object.assign({
        level: 4,
        display: false,
        preventDefaultVal: false
    }, config);

    if (_t === null) {
        publicDirectives.push(_conf);
    } else {
        _t._dir.push(_conf);
    }
};

directives.forEach(obj => {
    turbine.directive(obj.directive, obj);
});

export default turbine;