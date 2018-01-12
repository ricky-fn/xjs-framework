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

                    removeHook(element.attribs, attr.name);

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

    this.push = (member, args) => {
        let use = member.use.bind(null, args);
        let level = member.level;
        if (queue[level] == undefined) {
            queue[level] = [use];
        } else {
            queue[level].push(use);
        }
    };

    this.process = () => {
        if (queue.length != 0) {
            queue.forEach((group, cinx) => {
                if (group === undefined) {
                    return;
                }

                group.forEach((use, rinx) => {
                    if (flag == true) {
                        use((tree, prop) => {
                            if (
                                flag == true &&
                                cinx == queue.length - 1 &&
                                rinx == group.length - 1
                            ) {
                                recall(tree, prop);
                            }
                        }, () => {
                            flag = false;
                        });
                    }
                });
            })
        } else {
            recall();
        }
    };
}

function removeHook(group, name) {
    delete group[name];
}

export default parseTemplate