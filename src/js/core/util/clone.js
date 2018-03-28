function clone(item) {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ],
        result;
    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });
    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index) {
                result[index] = clone( child );
            });
        } else if (typeof item == "object") {
            result = isNode(item) ? (new vNode(item)) : {};
            for (var i in item) {
                result[i] = clone(item[i]);
            }
        } else {
            result = item;
        }
    }

    return result;
}

function isNode(obj) {
    let has = Object.prototype.hasOwnProperty;
    return (has.call(obj, "content") || has.call(obj, "children"));
}

class vNode {
    constructor(json) {
        this.type = null;
        this.content = null;
        this.attributes = null;
        this.el = null;
        this.oberver = [];
        this.children = [];
        this.key = null;
        this.isComponent = false;
        this.isReady = false;
        this.directives = [];
        this.reference = json;
        this.context = null;
    }
    inserted(fn) {
        this.oberver.push(fn);
    }
    ready(el) {
        this.el = el;
        this.isReady = true;
        this.oberver.forEach(fn => fn(el));

        this.directives.forEach(obj => {
            if (obj.bind) {
                obj.bind(this.el, obj.binding, this);
            } else if (obj.update) {
                obj.update(this.el, obj.binding, this);
            }
        });
    }
    remove() {
        this.children.forEach(vNode => {
            vNode.remove();
        });

        this.directives.forEach(obj => obj.unbind && obj.unbind(this.el, obj.binding, this));

        this.el.parentNode.removeChild(this.el);
        this.oberver = [];
        this.el = null;
        this.reference = null;
        this.context = null;
    }
}

export default clone;