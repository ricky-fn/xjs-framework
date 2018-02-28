import {hooks, symbol} from "./analyse"
import deepClone from "../util/clone"
import comCnt from "../component/common"

class parseTemplate {
    constructor(domTree, context, component) {
        let vm = this.parse(deepClone(domTree), context, component);

        return vm;
    }
    parse(domTree, context, component) {
        for (let index = 0; index < domTree.length; index++) {
            let element = domTree[index];

            if (element.type == "text") {
                symbol(element, domTree, index, context);
            } else if (element.type == "tag") {
                this.analyseHook(
                    (add) => {
                        index = add || index;
                        return index;
                    },
                    element,
                    domTree,
                    context,
                    component
                );
            }
        }

        return domTree;
    }
    analyseHook(index, element, domTree, properties, priCnt) {
        let {cntControl, component} = getComponent(element, priCnt, comCnt());
        let recall = (domTree, prop) => {
            if (component == undefined) {
                this.parse(domTree || element.children, prop || properties, priCnt);
            } else {
                cntControl.init(component, prop, element);
            }
        };

        let queue = new makeSequence(recall);

        Object.keys(element.attribs).forEach(member => {
            hooks.forEach(match => {
                if (match.test.test(member)) {
                    let attr = {
                        name: member,
                        value : element.attribs[member]
                    };

                    queue.push(match, {
                        element,
                        domTree,
                        index,
                        properties,
                        cntControl,
                        attr
                    });
                }
            });
        });

        queue.process();
    }
}

function getComponent(element, priCnt, comCnt) {
    let cntControl, component;
    if (priCnt.match(element.name)) {
        component = priCnt.match(element.name);
        cntControl = priCnt;
    } else if (comCnt.match(element.name)) {
        component = comCnt.match(element.name);
        cntControl = comCnt;
    }

    return {cntControl, component};
}

function makeSequence(recall) {
    let queue = [];
    let flag = true;
    let redirect = [null];
    let copy = [];

    this.push = (member, args) => {
        let level = member.level;
        if (queue[level] == undefined) {
            queue[level] = [{
                handler: member.use,
                args
            }];
        } else {
            queue[level].push({
                handler: member.use,
                args
            });
        }
    };

    this.process = () => {
        if (queue.length != 0) {
            queue.forEach((group, cinx) => {
                if (group === undefined) {
                    return;
                }

                group.forEach((target, rinx) => {
                    if (flag == true) {
                        redirect.forEach(args => {
                            let params = Object.assign(target.args, args);

                            target.handler(params, (element, domTree, properties) => {
                                copy.push({
                                    element,
                                    properties,
                                    domTree
                                });
                                if (
                                    flag == true &&
                                    cinx == queue.length - 1 &&
                                    rinx == group.length - 1
                                ) {
                                    recall(element.children, properties);
                                }
                            }, () => {
                                flag = false;
                            });
                        });
                        redirect = copy;
                        copy = [];
                    }
                });
            })
        } else {
            recall();
        }
    };
}

export default parseTemplate