/**
 * Created by Ricky on 2017/9/22.
 */

import Dep from "./virtual/dep"

class watch {
    constructor(target, resource, thisArg, call) {
        let length = arguments.length;
        this._thisArg = thisArg;
        // if (typeof target != "array") {
        //     target = [target];
        // }
        if (length == 4 || length == 3) {
            this.recall = call;
            this.observe(target, resource, []);
        } else if (length == 2) {
            this.recall = resource;
        }

        return target;

    }
    observe(_obj, _res, path) {
        let type = Object.prototype.toString.call(_res);

        if (type == '[object Object]' || type == '[object Array]') {

            let ob = _res.__ob__ || _obj.__ob__ || (new observer(_obj, _res, this));

            this.loopObj(_obj, ob, path);
            if (type == '[object Array]') {
                this.cloneArray(_obj, ob, path);
            }
        }

    }
    loopObj(obj, observer, path) {
        Object.keys(observer.value).forEach((prop) => {
            let _path = path.slice(0);
            _path.push(prop);
            this.observeObj(obj, prop, observer, _path);
        });
    }
    observeObj(obj, prop, observer, path) {
        let dep = new Dep();
        let val = observer.value[prop];
        if (observer.value instanceof Array &&
            !(observer.value[prop] instanceof Object)) {
            return;
        }
        Object.defineProperty(obj, prop, {
            get: () => {
                if (observer.value instanceof Array && Dep.target) {
                    observer.dep.addSub(Dep.target);
                } else if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set: (newVal) => {
                let old = val;
                if (newVal === old) {
                    return;
                }

                val = newVal;

                if (observer.value instanceof Array) {
                    observer.update(prop, newVal);
                } else {
                    observer.value[prop] = val;
                    dep.notify(old, val);
                }
                // observer.value[prop] = newVal;

                this.recall && this.recall(path, newVal);

                // this.observe(observer.value[prop], newVal, path);
            },
            enumerable: true
        });

        this.observe(obj[prop], observer.value[prop], path);
    }
    cloneArray(array, observer, path) {
        let ORP = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
        let arrayProto = Array.prototype;
        let newProto = Object.create(arrayProto);
        let self = this;

        ORP.forEach(function (prop) {
            Object.defineProperty(newProto, prop, {
                value: function (newVal) {
                    // let val = observer.value;
                    debugger;
                    arrayProto[prop].apply(observer.value, arguments);

                    observer.update();
                    self.recall && self.recall(path, newVal);

                    // observer.dep.notify(this._thisArg, null, newVal);
                    // this.observe(array, observer.value, path);
                },
                enumerable: false,
                configurable: true,
                writable: true
            });
        });
        array.__proto__ = newProto;
    }
}

class observer {
    constructor (target, value) {
        this.dep = new Dep();
        this.value = value;

        Object.defineProperty(target, "__ob__", {
            enumerable: false,
            value: this
        });
    }
    update(key, newVal) {
        let val = this.value[key];
        let type = Object.prototype.toString.call(newVal);
        let ob, subs;

        if (type == '[object Object]' || type == '[object Array]') {

            if (this.hasOb(val)) {
                ob = val.__ob__;
                subs = ob.dep.subs;

                // Object.keys(val).forEach(v => {
                //     let _ob = val[v].hasOwnProperty("__ob__") ? val[v].__ob__ : null;
                //     if (newVal.hasOwnProperty(v) && _ob) {
                //         _ob.update(v, newVal[v]);
                //     }
                // });

                if (this.hasOb(newVal)) {
                    ob = newVal.__ob__.dep.subs;
                    ob = ob.concat(subs);
                } else {
                    Object.defineProperty(newVal, "__ob__", {
                        value: ob,
                        enumerable: false
                    });
                    ob.value = newVal;
                }
                this.value[key] = newVal;
            } else {
                new watch(this.initType(key, newVal), newVal, null);
            }

        } else if (arguments.length != 0) {
            this.value[key] = newVal;
        }

        this.dep.notify(val, newVal);

    }
    hasOb(val) {
        try {
            return val.__ob__ != undefined ? true : false;
        } catch(err) {
            debugger;
        }
    }
    initType(key, type) {
        let init;
        if (typeof type != "string") {
            type = Object.prototype.toString.call(type);
        }
        if (type == "[object Object]") {
            init = {};
        } else if (type == "[object Array]") {
            init = [];
        }
        this.value[key] = init;

        return init;
    }
}

export default watch;