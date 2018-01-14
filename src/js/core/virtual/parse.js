import {hooks, symbol} from "./analyse"
import deepClone from "./clone"

class parseTemplate {
    constructor(domTree, context) {
        let clone = this.parse(deepClone(domTree), context);

        return clone;
    }
    parse(domTree, context) {
        for (let index = 0; index < domTree.length; index++) {
            let element = domTree[index];
            if (element.type == "text") {
                symbol(element, domTree, index, context);
            } else if (element.type == "tag") {
                this.analyseHook(element, domTree, (add) => {
                    index = add || index;
                    return index;
                }, context);
            }
        }

        return domTree;
    }
    analyseHook(element, domTree, index, properties) {
        let recall = (domTree, prop) => {
            this.parse(domTree || element.children, prop || properties);
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
                        attr
                    });
                }
            });
        });

        queue.process();
    }
}

function makeSequence(recall) {
    let queue = [];
    let flag = true;
    let redirect = [null];

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
                                redirect.push({
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
                        redirect.splice(0, 1);
                    }
                });
            })
        } else {
            recall();
        }
    };
}

export default parseTemplate