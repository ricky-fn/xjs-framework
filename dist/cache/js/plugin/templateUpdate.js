'use strict';

/**
 * Created by Ricky on 2017/9/22.
 */

define('templateUpdate', ['underscore', 'watch'], function (_, watch) {
    var fn = function fn(obj, section, dom) {
        if (!(obj instanceof Object)) throw "parameter's data type was wrong";

        var tpl = _.template(section);
        new watch(obj, function () {
            dom.innerHTML = tpl(obj);
        });
    };

    return fn;
});