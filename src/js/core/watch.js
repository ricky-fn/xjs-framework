/**
 * Created by Ricky on 2017/9/22.
 */

class watch {
    constructor(obj, call) {
        this.recall = call;

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
        Object.keys(obj).forEach(function (prop) {
            let val = obj[prop];
            let _path = path.slice(0);
            _path.push(prop);
            Object.defineProperty(obj, prop, {
                get: () => {
                    return val;
                },
                set: (newVal) => {
                    val = newVal;
                    self.recall(_path, newVal);
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
        ORP.forEach(function (prop) {
            Object.defineProperty(newProto, prop, {
                value: function (newVal) {
                    path.push(prop);
                    arrayProto[prop].apply(array, arguments);
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