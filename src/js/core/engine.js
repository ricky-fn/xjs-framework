import component from "./component/common"

/**
 * 框架的方法集合，是全局公用对象
 * @namespace xjs
 */

const xjs = window.xjs = {};

const _instances = xjs._instances = {};

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
xjs.createView = function (prop, param, node, defaultNode) {
    let containerNode = document.getElementById('appview');

    if (!node) {
        node = containerNode;
        // $(containerNode).append(node);
    } else {
        if (!defaultNode) {
            // node = $('<div></div>').appendTo(node).get(0);
            node = containerNode.insertBefore(node);
        }
    }
    return new prop(node, param);
};

xjs.extendView = function (prop, extend) {
    return function () {
        let params = {};
        let args = [params, extend];
        args = args.concat([].slice.call(arguments));
        Object.assign.apply(null, args);

        return xjs.createView(prop, params);
    }
};

xjs.component = component().register;

export default xjs;