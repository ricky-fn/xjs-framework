import parse from "./parse"
import render from "./render"
import watch from "../watch"
import compare from "./compare"
import addKey from "./addKey"

const htmlparser = require("htmlparser2");

class proxy {
    constructor(dom, data, template) {
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

        let domTree = getTree(template);
        let renderTree = new parse(domTree, data);
        this.parentDom = dom;
        this.domTree = domTree;
        this.updateTree(renderTree);
        this.domFragment = render(this.getTree(), data);
        this.data = data;

        this.insertRealDom();
        this.startObserve(data);
    }
    insertRealDom() {
        this.parentDom.appendChild(this.domFragment);
    }
    startObserve(data) {
        new watch(data, this.updateView.bind(this));
    }
    updateTree(tree) {
        this.renderTree = tree;
    }
    getTree() {
        return this.renderTree;
    }
    updateView() {
        this.data._refs = {};
        let newTree = new parse(this.domTree, this.data);
        let oldTree = this.renderTree;
        this.updateTree(newTree);
        compare(oldTree, newTree, this.parentDom, this.data);
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