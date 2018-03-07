import parser from "./parse"
import render from "./render"
import watch from "../watch"
import compare from "./compare"
import addKey from "../util/addKey"
import {parse} from "himalaya"

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
        Object.defineProperty(data, "$set", {
            value: (obj, prop, value) => {
                new watch(obj, prop, value, this.updateView.bind(this));
                this.updateView();
            }
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
        this.data.$refs = {};
        // this.data._refs = {};
    }
    startObserve(data) {
        new watch(data, this.updateView.bind(this));
    }
    updateVM(dom, template) {
        let domTree = getDomTree(template);
        let vm = new parser(domTree, this.data, this.component);
        this.parentDom = dom;
        this.domTree = domTree;
        this.vm = vm;
    }
    getTree() {
        return this.vm;
    }
    updateView() {
        if (this._accpet) {
            this.data._refs = {};
            let newVM = new parser(this.domTree, this.data, this.component);
            let oldVM = this.vm;
            this.vm = newVM;
            compare(oldVM, newVM, this.parentDom, this.data);
        }
    }
}

function getDomTree(template) {
    let json = parse(template);
    addKey(json);

    return json;
}

export default proxy;