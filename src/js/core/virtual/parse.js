import deepClone from "../util/clone"
import {hooks, symbol} from "./analyse"
import turbine from "../main"
import {stringify} from "himalaya"

class parseTemplate {
    constructor(domTree, context) {
        let vm = this.parse(deepClone(domTree), context);

        return vm;
    }
    parse(domTree, context) {
        let components = context._components;

        for (let index = 0; index < domTree.length; index++) {
            let vNode = domTree[index];
            if (vNode.type == "text") {
                symbol(vNode, domTree, index, context);
            } else if (vNode.type == "element") {

                if (components != null && components.hasOwnProperty(vNode.tagName)) {
                    vNode.isComponent = true;
                    vNode.addSubs(node => {
                        turbine(Object.assign({
                            el: node
                        }, components[vNode.tagName]));
                    });
                }

                try {
                    this.analyseHook(
                        (add) => {
                            index = add != undefined ? add : index;
                            return index;
                        },
                        vNode,
                        domTree,
                        context
                    );
                } catch(e) {
                    console.error(e + '\n\n', 'please check your template: \n' + stringify([vNode.reference]));
                }
            }
        }

        return domTree;
    }
    analyseHook(index, vNode, domTree, properties) {
        let recall = (domTree, prop) => {
            if (vNode.isComponent != true) {
                this.parse(domTree || vNode.children, prop || properties);
            }
        };

        let queue = new makeSequence(recall);

        vNode.attributes.forEach(member => {
            matchHook(member, (match) => {
                let attr = member,
                    key = member.key,
                    argIndex = key.indexOf(":");

                if (argIndex >= 0) {
                    member.args = key.slice(argIndex + 1);
                }

                queue.push(match, {
                    vNode,
                    domTree,
                    index,
                    properties,
                    attr
                });
            })
        });

        queue.process();
    }
}

function matchHook(attr, call) {
    hooks.forEach(match => {
        if (match.test.test(attr.key)) {
            call(match);
        }
    });
}

// function getComponent(element, priCnt, comCnt) {
//     let cntControl, component;
//     if (priCnt.match(element.name)) {
//         component = priCnt.match(element.name);
//         cntControl = priCnt;
//     } else if (comCnt.match(element.name)) {
//         component = comCnt.match(element.name);
//         cntControl = comCnt;
//     }
//
//     return {cntControl, component};
// }

class makeSequence {
    constructor(recall) {
        this.queue = [];
        this.presentQueue = [];
        this._flag = true;
        this._rinx = 0;
        this._cinx = 0;
        this.copy = [];
        this.recall = recall;
    }
    push(member, args) {
        let level = member.level;
        if (this.queue[level] == undefined) {
            this.queue[level] = [{
                handler: member.use,
                args
            }];
        } else {
            this.queue[level].push({
                handler: member.use,
                args
            });
        }
    }
    process() {
        let redirect = [null];
        let length = this.queue.length;

        if (length === 0) {
            return this.recall();
        }
        this.queue.forEach((group, cinx) => {
            this._cinx = cinx;
            this._rinx = group.length - 1;
            this.presentQueue = group;

            if (group === undefined) {
                return;
            }

            this.presentQueue.forEach((target) => {
                if (this._flag != true) {
                    return;
                }
                redirect.forEach(args => {
                    let params = Object.assign(target.args, args);
                    this.callHandler(target, params);
                });

                redirect = this.copy;
                this.copy = [];
            });
        });
    }
    callHandler(target, params) {
        target.handler(
            params,
            this.go.bind(this),
            this.stop.bind(this)
        );
    }
    go(vNode, domTree, properties) {
        this._flag = true;
        this.copy.push({
            vNode,
            properties,
            domTree
        });
        if (
            // this._flag == true &&
            this._cinx == this.queue.length - 1 &&
            this._rinx == this.presentQueue.length - 1
        ) {
            this.recall(vNode.children, properties);
        }
    }
    stop() {
        this._flag = false;
    }
}

export default parseTemplate