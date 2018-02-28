/**
 * Created by Ricky on 2017/9/22.
 */

import Dep from "./virtual/dep"

class watch {
    constructor(obj, call) {
        this.recall = call;
        this.Deps = {};
        this.observe(obj, []);
    }
    observe(_obj, path) {
        let type = Object.prototype.toString.call(_obj);
        if (type == '[object Object]' || type == '[object Array]') {
            this.observeObj(_obj, path);
            if (type == '[object Array]')
                this.cloneArray(_obj, path);
        }
    }
    observeObj(obj, path) {
        let self = this;
        Object.keys(obj).forEach((prop) => {
            let val = obj[prop];
            let _path = path.slice(0);
            _path.push(prop);
            let dep = this.Deps[_path.join("_")] = new Dep();
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
                    self.recall(_path, newVal);

                    self.observe(val, _path);
                }
            });
            self.observe(val, _path);
        });
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