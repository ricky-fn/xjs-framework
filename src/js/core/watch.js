/**
 * Created by Ricky on 2017/9/22.
 */

define('watch', function () {
    var watch = function (obj, callback) {
        this.callback = callback;

        this.observe = function (_obj, path) {
            var type = Object.prototype.toString.call(_obj);
            if (type == '[object Object]' || type == '[object Array]') {
                this.observeObj(_obj, path);
                if (type == '[object Array]')
                    this.cloneArray(_obj, path);
            }
        };

        this.observeObj = function (obj, path) {
            var self = this;
            Object.keys(obj).forEach(function (prop) {
                var val = obj[prop];
                var _path = path.slice(0);
                _path.push(prop);
                Object.defineProperty(obj, prop, {
                    get: function () {
                        return val;
                    },
                    set: function (newVal) {
                        val = newVal;
                        self.callback(_path, newVal);
                    }
                });
                self.observe(val, _path);
            });
        };

        this.cloneArray = function (array, path) {
            var ORP = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
            var arrayProto = Array.prototype;
            var newProto = Object.create(arrayProto);
            var self = this;
            ORP.forEach(function (prop) {
                Object.defineProperty(newProto, prop, {
                    value: function (newVal) {
                        path.push(prop);
                        arrayProto[prop].apply(array, arguments);
                        self.callback(path, newVal);
                    },
                    enumerable: false,
                    configurable: true,
                    writable: true
                });
            });
            array.__proto__ = newProto;
        };

        this.observe(obj, []);
    };

    return watch;
});