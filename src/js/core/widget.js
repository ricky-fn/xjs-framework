import proxy from "./virtual/proxy"
import watch from "./watch"
import component from "./component/main"

/**
 * @fileOverview 这是Page的基类，所有Page的默认事件和流程都是在这里被定义<br>
 * 所有Page类通过[xjs.declare]{@link xjs.declare}申明，并将[widget]{@link widget}作为`parents`参数传入，用以继承默认事件流程。<br>
 * 最后使用[xjs.createView]{@link xjs.createView}实例化Page类
 *
 * 所有基类的函数都可以被重写（除了`init`）,重写后的事件可以调用`this.super()`方法执行父类被覆盖的函数<br>
 * widget的流程行顺序按照以下:<br>
 * `init—>render—>request—>syncGetData—>buildRender—>startup—>onExit`
 * @mixin widget
 */

class widget {
    /**
     * Page类的初始化函数，同时控制渲染事件的执行流程，此方法不可以被重写。
     * @memberOf widget
     * @function init
     * @param dom 根Dom节点，用于插入模板
     */
    constructor(dom, params) {

        if (params != undefined) {
            Object.assign(this, params);
        }

        this.El = dom;

        return new Promise((resolve, reject) => {
            try {
                this.buildRender();
            } catch (err) {
                reject(err);
            }

            this.reRender = () => {
                if (this.methods) {
                    this.methods.startup && this.methods.call(this.data);
                }
                this._proxy.render(this.data);
            };

            this.hangUp = () => {
                this.El.innerHTML = "";
                this._proxy.stopRender();
            };

            /**
             * 当模板和数据都被渲染后就会调用startup事件，Page里的Dom节点操作以及业务逻辑都应该在这里实现。
             * @memberOf widget
             * @function startup
             */
            if (this.methods) {
                this.methods.startup && this.methods.startup.call(this._proxy.data);
            }

            resolve(this);
        })
    }
    /**
     * @example
     * //this.divNode 获取原始dom对象
     * //this.$divNode 获取jquery对象
     * @memberOf widget
     * @function buildRender
     * @see {widget#request}
     */
    buildRender() {
        /**
         * 传入模板字符串，基于`underscore`的模板引擎渲染HTML
         *
         * @type {string}
         * @memberOf widget
         * @name templateString
         */

        let _component = new component();

        if (this.component !== undefined) {
            Object.keys(this.component).forEach(el => {
                _component.register(el, this.component[el]);
            });
        }

        let data = Object.assign({
            $set: (obj, prop, value) => {
                let val = value;
                let type = Object.prototype.toString.call(val);

                Object.defineProperty(obj, prop, {
                    enumerable: true,
                    configurable: true,
                    get: () => {
                        return val;
                    },
                    set: (newVal) => {
                        val = newVal;
                        this._proxy.updateView();
                    }
                });

                if (type == '[object Object]' || type == '[object Array]') {
                    new watch(val, () => {
                        this._proxy.updateView.call(this._proxy);
                    });
                }

                this._proxy.updateView();
            },
            $delete: (obj, prop) => {
                let type = Object.prototype.toString.call(obj);

                if (type == '[object Object]') {
                    delete obj[prop];
                    this._proxy.updateView();
                } else if (type == '[object Array]') {
                    obj.splice(obj.indexOf(prop), 1);
                }
            }
        }, this.data, this.methods);

        this._proxy = new proxy(this.El, data, this.template, _component);
    }
}

// function __createNexus(end, currentNexus, reject) {
//     let doms, batch;
//     let map = [];
//
//     if (currentNexus == undefined) {
//         window.nexus = currentNexus = {members: [], call: null, ready: false};
//     }
//
//     doms = this.domNode.querySelectorAll('[data-xjs-nexus]');
//     batch = this.defineNexus ? this.defineNexus() : false;
//
//     if (batch == false) {
//         return end();
//     }
//
//     if (!(batch instanceof Array)) {
//         batch = [batch];
//     }
//
//     doms.forEach(dom => {
//         let name = dom.dataset["xjsNexus"];
//
//         batch.forEach(item => {
//             if (item.name == name) {
//                 item.dom = dom;
//                 map.push(item);
//             }
//         })
//     });
//
//     return new buildNexus(map, currentNexus, end, reject);
// }

export default widget;