import parse from "./parse"
import render from "./render"
import watch from "../watch"
import compare from "./compare"
import addKey from "./addKey"

const htmlparser = require("htmlparser2");

class proxy {
    constructor(dom, data, template) {
        this.parentDom = dom;
        this.domTree = getTree(template);
        this.updateTree(new parse(this.domTree, data));
        this.domFragment = render(this.getTree());
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
        let newTree = new parse(this.domTree, this.data);
        let oldTree = this.renderTree;
        this.updateTree(newTree);
        compare(oldTree, newTree, this.parentDom);
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