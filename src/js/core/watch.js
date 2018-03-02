/**
 * Created by Ricky on 2017/9/22.
 */

import Dep from "./virtual/dep"

class watch {
    constructor(obj, prop, val, call) {
        this.Deps = {};
        if (arguments.length == 2) {
            this.recall = prop;
            this.observe(obj, []);
        } else if (arguments.length == 4) {
            this.recall = call;
            this.observeObj(obj, prop, val, []);
        }

    }
    observe(_obj, path) {
        let type = Object.prototype.toString.call(_obj);
        if (type == '[object Object]' || type == '[object Array]') {
            this.loopObj(_obj, path);
            if (type == '[object Array]')
                this.cloneArray(_obj, path);
        }

    }
    loopObj(obj, path) {
        Object.keys(obj).forEach((prop) => {
            let _path = path.slice(0);
            _path.push(prop);
            this.observeObj(obj, prop, _path);
        });
    }
    observeObj(obj, prop, val, path) {
        if (arguments.length == 3) {
            path = val;
            val = obj[prop];
        }

        let dep = this.Deps[path.join("_")] = new Dep();
        Object.defineProperty(obj, prop, {
            get: () => {
                if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set: (newVal) => {
                if (newVal === val) return;
                val = newVal;
                dep.notify();
                this.recall(path, newVal);

                this.observe(val, path);
            },
            enumerable: true
        });
        this.observe(val, path);
    }
    cloneArray(array, path) {
        let ORP = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
        let arrayProto = Array.prototype;
        let newProto = Object.create(arrayProto);
        let self = this;
        let dep = self.Deps[path.join("_")];
        ORP.forEach(function (prop) {
            Object.defineProperty(newProto, prop, {
                value: function (newVal) {
                    // path.push(prop);
                    arrayProto[prop].apply(array, arguments);
                    dep.notify();
                    self.observe(newVal, path);
                    self.recall(path, newVal);
                },
                enumerable: false,
                configurable: true,
                writable: true
            });
        });
        array.__proto__ = newProto;
    }
}

export default watch;