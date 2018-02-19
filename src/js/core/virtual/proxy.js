import parse from "./parse"
import render from "./render"
import watch from "../watch"
import compare from "./compare"
import addKey from "../util/addKey"

const htmlparser = require("htmlparser2");

class proxy {
    constructor(dom, data, template, component) {
        Object.defineProperty(data, "$refs", {
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(data, "_refs", {
            configurable: true,
            writable: true,
            value: {}
        });

        this._accpet = true;
        this.data = data;
        this.component = component;

        this.updateTree(dom, template);
        this.render();
        this.startObserve(data);
    }
    render() {
        this._accpet = true;
        let domFragment = render(this.getTree(), this.data);
        this.parentDom.appendChild(domFragment);
    }
    stopRender() {
        this._accpet = false;
    }
    startObserve(data) {
        new watch(data, this.updateView.bind(this));
    }
    updateTree(dom, template) {
        let domTree = getTree(template);
        let renderTree = new parse(domTree, this.data, this.component);
        this.parentDom = dom;
        this.domTree = domTree;
        this.renderTree = renderTree;
    }
    getTree() {
        return this.renderTree;
    }
    updateView() {
        this.data._refs = {};
        let newTree = new parse(this.domTree, this.data, this.component);
        let oldTree = this.renderTree;
        this.renderTree = newTree;
        if (this._accpet) {
            compare(oldTree, newTree, this.parentDom, this.data);
        }
    }
}

function getTree(template) {
    let tree;
    let handler = new htmlparser.DomHandler((error, dom) => {
        if (error) {
            throw error;
        } else {
            tree = addKey(dom);
        }
    });
    let parser = new htmlparser.Parser(handler);
    parser.write(template);
    parser.end();

    return tree;
}

export default proxy;