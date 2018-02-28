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

        this.startObserve(data);
        this.updateVM(dom, template);
        this.render();
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
    updateVM(dom, template) {
        let domTree = getDomTree(template);
        let vm = new parse(domTree, this.data, this.component);
        this.parentDom = dom;
        this.domTree = domTree;
        this.vm = vm;
    }
    getTree() {
        return this.vm;
    }
    updateView() {
        this.data._refs = {};
        let newVM = new parse(this.domTree, this.data, this.component);
        let oldVM = this.vm;
        this.vm = newVM;
        if (this._accpet) {
            compare(oldVM, newVM, this.parentDom, this.data);
        }
    }
}

function getDomTree(template) {
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