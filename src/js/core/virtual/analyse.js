import deepClone from "./clone"

const hooks = [
    {
        test: /^v\-if/,
        use: ifOrder,
        level: 0
    },
    {
        test: /^v\-else/,
        use: elseOrder,
        level: 0
    },
    {
        test: /^v\-else\-if/,
        use: elseIfOrder,
        level: 0
    },
    {
        test: /^v\-show/,
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
        test: /^v\-for/,
        use: forOrder,
        level: 2
    }
];

function elseIfOrder(params, go, stop) {
    let {element, domTree, index, properties, attr} = params;
    let content = attr.value;
    let val = evalWithContext(content, properties);

    if (element.hasOwnProperty("_if")) {
        if (!element._if && val) {
            go();
        } else {
            domTree.splice(index(), 1);
            index(index() - 1);
            stop();
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

function elseOrder(params, go, stop) {
    let {element, domTree, index} = params;

    if (element.hasOwnProperty("_if")) {
        if (!element._if) {
            go();
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

    if (val) {
        go();
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
    let {attr, element, properties} = params;
    let attrName = attr.name;
    let attrPlus = attrName.match(/[^v\-bind:]/g).join('');
    let tVal = element.attribs[attrPlus];
    let tVals = tVal ? [tVal] : [];

    let evalue = evalWithContext(attr.value, properties);

    if (typeof evalue == 'object' && evalue.toString() == '[object Object]') {
        Object.keys(evalue).forEach(val => {
            let flag = evalue[val];

            if (flag == true) {
                tVals.push(val);
            }
        });
    } else if (evalue instanceof Array) {
        tVals = tVals.concat(evalue);
    } else {
        tVals.push(evalue);
    }
    element.attribs[attrPlus] = tVals.join(' ');

    go();
}

function eventOrder(params, go, stop) {
    let {attr, element, properties} = params;
    let eventName = attr.name;
    let eventCallName = attr.value;
    eventName = eventName.match(/([^v\-on:].*)/)[0];

    element.event = {
        name: eventName,
        addEventListener: (dom) => {
            dom.addEventListener(eventName, eventCall);
        },
        removeEventListener: (dom) => {
            dom.removeEventListener(eventName, eventCall);
        }
    };

    function eventCall(e) {
        let event, cname;

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
            event();
        }
    }

    go();
}

function showOrder(params, go, stop) {
    let {element, properties, attr} = params;
    let content = attr.value;
    let val;
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

    go();
}

function forOrder(params, go, stop) {
    let {element, domTree, index, properties, attr} = params;
    let sentence = attr.value;
    let mulArg = sentence.match(/^\(.*\)/g);
    let inner, counter;

    let source = sentence.match(/\w+$/g);
    source = properties[source[0]];

    if (mulArg != null && mulArg.length == 1) {
        let args = mulArg[0].match(/[^(\(\)\,\s)][\w+]*/g);
        inner = args[0];
        counter = args[1];
    } else {
        inner = sentence.match(/^\w+/g);
        inner = inner[0];
    }

    let _index = 0;
    domTree.splice(index(), 1);  // delete original element from domTree

    for (let key in source) {
        let d = deepClone(element);
        let newKey = keyPlus(d.attribs["data-key"], _index); // copy key from original element
        d.attribs["data-key"] = newKey;

        let context = inheritProp(properties, inner, source[key]);
        if (mulArg != null && mulArg.length == 1) {
            context[counter] = _index;
        }

        domTree.splice(index(), 0, d); // inserting clone object into domTree

        index(index() + 1); // set a new index of "for" statement, because domTree had been insert clone
        _index += 1;

        go(d.children, context);
    }

    if (_index == 0) {
        stop();
    }
}

function symbol(text, domTree, index, properties) {
    text = Object.assign({}, text);
    let reg = text.data.match(/{{([^}}]*?)}}/g);

    if (reg != null || reg != undefined) {
        reg.forEach(function(match) {
            let val;
            let start = text.data.indexOf(match);
            let content = match.match(/[^{{}}]*/g)[2];
            content = trim(content);
            try {
                val = evalWithContext(content, properties);
            } catch(err) {
                throw err;
            }

            if (val == undefined) {
                val = "";
            }

            text.data = text.data.slice(0, start) + val + text.data.slice(start + match.length, text.data.length);
        });
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


export {
    hooks,
    symbol
}
