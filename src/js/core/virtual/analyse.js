import deepClone from "../util/clone"
import watch from "./watch"
import Dep from "./dep"

const hooks = [
    {
        test: /^v\-if$/,
        use: ifOrder,
        level: 0
    },
    {
        test: /^v\-else$/,
        use: elseOrder,
        level: 0
    },
    {
        test: /^v\-else\-if$/,
        use: elseIfOrder,
        level: 0
    },
    {
        test: /^v\-for$/,
        use: forOrder,
        level: 0
    },
    {
        test: /^v\-show$/,
        use: showOrder,
        level: 1
    },
    {
        test: /^v\-on/,
        use: eventOrder,
        level: 1
    },
    {
        test: /^v\-bind/,
        use: bindOrder,
        level: 1
    },
    {
        test: /^v\-model$/,
        use: modelOrder,
        level: 1
    },
    {
        test: /^ref$/,
        use: refOrder,
        level: 3
    }
];

function modelOrder(params, go) {
    let {element, domTree, properties, attr} = params;
    let content = attr.value;
    let inputType = element.attribs.type;

    removeHook(element.attribs, attr.name);
    element.model = (dom) => {
        new watch(properties, dom, content, (node, newVal) => {
            if (inputType == "radio") {
                if (node.value == newVal) {
                    node.checked = true;
                } else {
                    node.checked = false;
                }
            } else if (inputType == "checkbox") {
                if (newVal.indexOf(node.value) >= 0) {
                    node.checked = true;
                } else {
                    node.checked = false;
                }
            } else {
                setTimeout(() => { // set a Timeout to avoid cannot set a value when child elements of select haven't been rendered.
                    node.value = newVal;
                }, 1);
            }
        });

        dom.addEventListener('input', (e) => {
            let data = evalWithContext(content, properties);
            if (data != e.target.value) {
                evalWithContext(content + '= "' + e.target.value + '"', properties);
            }
        });
        dom.addEventListener('change', (e) => {
            let data = evalWithContext(content, properties);
            if (inputType == "checkbox" && data instanceof Array) {
                if (dom.checked == true) {
                    data.push(dom.value);
                } else {
                    let index = data.indexOf(dom.value);
                    data.splice(index, 1);
                }
            } else if (data != e.target.value) {
                data = e.target.value;
            }
        });
    };

    go(element, domTree, properties);
}

function refOrder(params, go) {
    let {element, domTree, attr, properties} = params;
    let refs = properties._refs[attr.value];
    let key = element.attribs["data-key"];
    if (refs == undefined) {
        properties._refs[attr.value] = [key];
    } else {
        if (refs.indexOf(key) < 0) {
            refs.push(key);
        }
    }
    go(element, domTree, properties);
}

function elseIfOrder(params, go, stop) {
    let {element, domTree, index, properties, attr} = params;
    let content = attr.value;
    let result = evalWithContext(content, properties);

    removeHook(element.attribs, attr.name);

    if (element.hasOwnProperty("_if")) {
        if (element._if) {
            domTree.splice(index(), 1);
            index(index() - 1);
            stop();
            result = true;
        } else {
            if (result) {
                go(element, domTree, properties);
            } else {
                domTree.splice(index(), 1);
                index(index() - 1);
                stop();
            }
        }
    } else {
        throw "cannot find a flag 'v-if' or 'v-else-if' in previous element";
    }

    let _index = 0;
    let nextSibling;

    do {
        _index += 1;
        nextSibling = domTree[index() + _index];

        if (
            nextSibling != undefined &&
            nextSibling.type == "tag" &&
            (
                nextSibling.attribs.hasOwnProperty("v-else") ||
                nextSibling.attribs.hasOwnProperty("v-else-if")
            )
        ) {
            nextSibling._if = result;
        }
    } while (nextSibling != undefined && nextSibling.type != "tag");
}

function elseOrder(params, go, stop) {
    let {element, domTree, index, properties, attr} = params;

    removeHook(element.attribs, attr.name);

    if (element.hasOwnProperty("_if")) {
        if (!element._if) {
            go(element, domTree, properties);
        } else {
            domTree.splice(index(), 1);
            stop();
        }
    } else {
        throw "cannot find a flag 'v-if' in previous element";
    }
}

function ifOrder(params, go, stop) {
    let {element, domTree, index, properties, attr} = params;
    let content = attr.value;
    let val = evalWithContext(content, properties);

    removeHook(element.attribs, attr.name);
    if (val) {
        go(element, domTree, properties);
    } else {
        domTree.splice(index(), 1);
        index(index() - 1);
        stop();
    }

    let _index = 0;
    let nextSibling;

    do {
        _index += 1;
        nextSibling = domTree[index() + _index];

        if (
            nextSibling != undefined &&
            nextSibling.type == "tag" &&
            (
                nextSibling.attribs.hasOwnProperty("v-else") ||
                nextSibling.attribs.hasOwnProperty("v-else-if")
            )
        ) {
            nextSibling._if = val;
        }
    } while (nextSibling != undefined && nextSibling.type != "tag");
}

function bindOrder(params, go, stop) {
    let {attr, element, properties, domTree, cntControl} = params;
    let evalue = evalWithContext(attr.value, properties);
    let name = getSuffix() || attr.value;
    let tVal = element.attribs[name];

    removeHook(element.attribs, attr.name);

    function getSuffix() {
        let name, index;
        index = attr.name.indexOf(":") + 1;
        if (index >= 0) {
            name = attr.name.slice(index);
        }

        return name;
    }
    if (cntControl != undefined) {
        cntControl.cache[tVal] = evalue;
    } else {
        let tVals = tVal ? [tVal] : [];

        if (typeof evalue == 'object' && evalue.toString() == '[object Object]') {
            Object.keys(evalue).forEach(val => {
                let flag = evalue[val];
                name = val;
                if (element.attribs[val] != undefined) {
                    tVals = [element.attribs[val]];
                    tVals.push(flag);
                } else {
                    tVals = [flag];
                }

            });
        } else if (evalue instanceof Array) {
            tVals = tVals.concat(evalue);
        } else {
            tVals.push(evalue);
        }
        element.attribs[name] = tVals.join(' ');
    }

    go(element, domTree, properties);
}

function eventOrder(params, go, stop) {
    let {attr, element, properties, domTree} = params;
    let eventName = attr.name;
    let eventCallName = attr.value;

    removeHook(element.attribs, attr.name);

    eventName = eventName.match(/([^v\-on:].*)/)[0];

    element.model = dom => {
        dom.addEventListener(eventName, eventCall);
    };

    function eventCall(e) {
        let event, cname;
        // if it called with arguments
        if (/\((.*?)\)/.test(eventCallName)) {
            properties['$event'] = e;
            return evalWithContext(eventCallName, properties);
        } else {
            cname = eventCallName;
        }

        event = properties[cname];

        if (event == undefined || typeof event !== "function") {
            throw eventCallName + " event has not defined yet!";
        } else {
            event.call(properties);
        }
    }

    go(element, domTree, properties);
}

function showOrder(params, go, stop) {
    let {element, properties, domTree, attr} = params;
    let content = attr.value;
    let val;

    removeHook(element.attribs, attr.name);
    try {
        val = evalWithContext(content, properties);
    } catch(err) {
        throw err;
    }

    element.attribs.style = element.attribs.style ? element.attribs.style : "";
    if (val) {
        element.attribs.style += "display: block;";
    } else {
        element.attribs.style += "display: none;";
    }

    go(element, domTree, properties);
}

function forOrder(params, go, stop) {
    let {element, domTree, index, properties, attr} = params;
    let code = attr.value;
    let inner, counter;

    let args = code.split(" in ");
    let mulArg = args[0].match(/^\(.*\)/g);
    let source = trim(args[1]);

    source = evalWithContext(source, properties);

    removeHook(element.attribs, attr.name);
    if (mulArg != null && mulArg.length == 1) {
        let params = mulArg[0].match(/[^(\(\)\,\s)][\w+]*/g);
        inner = params[0];
        counter = params[1];
    } else {
        inner = trim(args[0]);
    }

    let _index = 0;
    domTree.splice(index(), 1);  // delete original element from domTree

    for (let key in source) {
        let d = deepClone(element);
        let newKey = keyPlus(d.attribs["data-key"], _index); // copy key from original element
        d.attribs["data-key"] = newKey;

        // let context = inheritProp(properties, inner, source[key]);
        let context = inheritProp(properties, inner, source instanceof Array ? source[key] : key);
        if (mulArg != null && mulArg.length == 1) {
            context[counter] = _index;
        }

        domTree.splice(index(), 0, d); // inserting clone object into domTree

        index(index() + 1); // set a new index of "for" statement, because domTree had been cloned
        _index += 1;

        go(d, domTree, context);
    }

    if (_index == 0) {
        stop();
    }
}

function symbol(text, domTree, index, properties) {
    let reg = text.data.match(/{{([^}}]*?)}}/g);
    let watchers = [];

    if (reg != null || reg != undefined) {
        reg.forEach(function(match) {
            let content = match.match(/[^{{}}]*/g)[2];
            content = trim(content);
            watchers.push({
                match,
                content,
                recall(node, newVal) {
                    let data = text.data;

                    watchers.forEach(obj => {
                        let start = data.indexOf(obj.match);
                        data = data.slice(0, start) + evalWithContext(obj.content, properties) + data.slice(start + obj.match.length);
                    });
                    node.nodeValue = data;
                }
            });
        });
        text.model = node => {
          watchers.forEach(args => {
              new watch(properties, node, args.content, args.recall)
          });
        };
        domTree[index] = text;
    }
}

function inheritProp(prop, key, val) {
    let f = Object.create(prop);
    f[key] = val;
    return f;
}

function trim(str) {
    return str.replace(/\s/g, "");
}

function evalWithContext(content, context) {
    return (new Function('with(this){return ' + content + '}')).call(context);
}

function keyPlus(val, add) {
    val = parseInt(val, 16);
    val += add;
    val = val.toString(16);

    return val;
}

function removeHook(group, name) {
    delete group[name];
}


export {
    hooks,
    symbol
}
