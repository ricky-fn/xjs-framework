import deepClone from "../util/clone"
import watcher from "./watch"
import watch from "../watch"
import evalWithContext from "../util/eval"

const directives = [
    {
        directive: 'if$',
        level: 0,
        use: (params, insertQueue, stop) => {

            let {domTree, index, binding} = params;

            let _index = 0;
            let nextSibling;

            do {
                _index += 1;
                nextSibling = domTree[index() + _index];

                if (
                    nextSibling != undefined &&
                    nextSibling.type == "element" &&
                    (
                        nextSibling.attributes.find(el => el.key == "v-else") ||
                        nextSibling.attributes.find(el => el.key == "v-else-if")
                    )
                ) {
                    nextSibling._if = binding.result;
                }
            } while (nextSibling != undefined && nextSibling.type != "tag");

            if (!binding.result) {
                editTree(domTree, index, 1);
                stop();
            }
        }
    },
    {
        directive: 'else$',
        level: 0,
        use: (params, insertQueue, stop) => {
            let {vNode, domTree, index} = params;

            if (vNode.hasOwnProperty("_if")) {
                if (vNode._if === true) {
                    editTree(domTree, index, 1);
                    stop();
                }
            } else {
                throw "cannot find a flag 'v-if' in previous element";
            }
        }
    },
    {
        directive: 'else\-if$',
        level: 0,
        use: (params, insertQueue, stop) => {
            let {vNode, domTree, index, binding} = params;
            let result = binding.result;

            if (vNode.hasOwnProperty("_if")) {
                if (vNode._if === true) {
                    editTree(domTree, index, 1);
                    stop();
                    result = true;
                } else if (vNode._if === false) {
                    if (!result) {
                        editTree(domTree, index, 1);
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
                    nextSibling.type == "element" &&
                    (
                        nextSibling.attributes.find(el => el.key == "v-else") ||
                        nextSibling.attributes.find(el => el.key == "v-else-if")
                    )
                ) {
                    nextSibling._if = result;
                }
            } while (nextSibling != undefined && nextSibling.type != "tag");
        }
    },
    {
        directive: 'for$',
        level: 0,
        preventDefaultVal: true,
        use: (params, insertQueue, stop) => {
            let {vNode, domTree, index, properties, binding} = params;
            let code = binding.value;
            let inner, counter, evalue, data, copy, key;
            let _index = 0;

            let args = code.split(" in ");
            let mulArg = args[0].match(/^\(.*\)/g);
            let content = trim(args[1]);

            evalue = evalWithContext(content, properties);

            if (mulArg != null && mulArg.length == 1) {
                let params = mulArg[0].match(/[^(\(\)\,\s)][\w+]*/g);
                inner = params[0];
                counter = params[1];
            } else {
                inner = trim(args[0]);
            }

            if (typeof evalue == "number") {
                evalue = ((num) => {
                    let array = [];
                    for (let i = 0; i < num; i++) {
                        array.push(i);
                    }
                    return array;
                })(evalue)
            }

            editTree(domTree, index, 1);

            for (key in evalue) {
                copy = deepClone(vNode);
                resetKey(copy, _index);
                (data = {}) && (data[inner] = Number(key) === NaN ? key : Number(key));
                let context = Object.create(properties);

                (function(index) {
                    let ob = new watch(context, data, null);
                    let _w = new watcher(properties, copy, content, (oldVal, value) => {
                        let key = Object.keys(value)[index];

                        if (key === undefined) {
                            return _w = ob = null;
                        }

                        context[inner] = value instanceof Array ? value[key] : key;
                    });
                })(_index);

                if (mulArg != null && mulArg.length == 1) {
                    context[counter] = _index;
                }

                _index += 1;
                domTree.splice(index() + _index, 0, copy); // inserting clone object into domTree
                insertQueue(copy, domTree, context);
            }

            resetIndex(index, _index); // set a new index of "for" statement, because domTree had been cloned

            if (_index == 0) {
                stop();
            }
        }
    },
    {
        directive: 'show$',
        level: 1,
        update: (el, binding, vNode) => {
            if (binding.result) {
                el.style.display = "block";
            } else {
                el.style.display = "none";
            }
        }
    },
    {
        directive: 'on',
        level: 1,
        preventDefaultVal: true,
        bind: (el, binding, vNode) => {
            let context = Object.create(vNode.context);
            binding.eventCall = (e) => {
                if (/\((.*?)\)/.test(binding.value)) {
                    context['$event'] = e;
                }
                return evalWithContext(binding.value, context);
            };

            el.addEventListener(binding.args, binding.eventCall);
        },
        unbind: (el, binding) => {
            el.removeEventListener(binding.args, binding.eventCall);
        }
    },
    {
        directive: 'bind',
        level: 1,
        update: (el, binding, vNode, oldNode) => {
            let value = binding.result;
            if (value !== null && typeof value == 'object' && value.toString() == '[object Object]') {
                if (binding.args != undefined) {
                    let str = "", val;
                    Object.keys(value).forEach(el => {
                        val = value[el];

                        if (typeof val == "boolean") {
                            str += val ? el + " " : "";
                        } else {
                            str += `${el}: ${value[el]};`;
                        }
                    });
                    setAttribute(vNode, el, binding.args, str);
                } else {
                    Object.keys(value).forEach(key => {
                        setAttribute(vNode, el, key, value[key]);
                    });
                }
            } else if (value instanceof Array) {
                setAttribute(vNode, el, binding.args, value[0]);
            } else {
                setAttribute(vNode, el, binding.args, value);
            }
        }
    },
    {
        directive: 'model$',
        level: 1,
        bind: (el, binding, vNode) => {
            let inputType = vNode.tagName == "textarea" ? "text" : Array.find(vNode.attributes, el => el.key == "type").value;
            let content = binding.value;
            el.addEventListener('input', (binding.inputEvent = (e) => {
                let data = evalWithContext(content, vNode.context);
                if (data != e.target.value) {
                    evalWithContext(content + '= "' + e.target.value + '"', vNode.context);
                }
            }));
            el.addEventListener('change', (binding.changeEvent = (e) => {
                let data = evalWithContext(content, vNode.context);
                if (inputType == "checkbox" && data instanceof Array) {
                    if (el.checked == true) {
                        data.push(el.value);
                    } else {
                        let index = data.indexOf(el.value);
                        data.splice(index, 1);
                    }
                } else if (data != e.target.value) {
                    data = e.target.value;
                }
            }));
        },
        update: (el, binding, vNode) => {
            let inputType = vNode.tagName == "textarea" ? "text" : Array.find(vNode.attributes, el => el.key == "type").value;

            if (inputType == "radio") {
                if (el.value == binding.result) {
                    el.checked = true;
                } else {
                    el.checked = false;
                }
            } else if (inputType == "checkbox") {
                if (binding.result.indexOf(el.value) >= 0) {
                    el.checked = true;
                } else {
                    el.checked = false;
                }
            } else {
                el.value = binding.result;
            }
        },
        unbind: (el, binding) => {
            el.removeEventListener('input', binding.inputEvent);
            el.removeEventListener('change', binding.changeEvent);
        }
    },
    {
        directive: '^ref$',
        level: 3,
        display: true,
        preventDefaultVal: true,
        bind: (el, binding, vNode) => {
            let context = vNode.context;
            let {_refs, $refs} = context;
            let _refObj = _refs[binding.value];
            let $refObj = $refs[binding.value];
            let key = vNode.key;

            if (_refObj == undefined) {
                _refs[binding.value] = [key];
                $refs[binding.value] = el;
            } else {
                _refObj.push(key);
                $refObj.push(el);
            }
        },
        unbind: (el, binding, vNode) => {
            let key = vNode.key,
                name = binding.value,
                {_refs, $refs} = vNode.context,
                _refObj = _refs[name],
                $refObj = $refs[name];

            if ($refObj instanceof Array) {
                $refObj.splice($refObj.indexOf(vNode.el), 1);
                _refObj.splice(_refObj.indexOf(key), 1);
            } else {
                _refs[name] = undefined;
                $refs[name] = undefined;
            }
        }
    }
];

function symbol(vNode, domTree, index, context) {
    let reg = vNode.content.match(/{{([^}}]*?)}}/g);

    if (reg != null || reg != undefined) {
        reg.forEach(function(match) {
            let content = match.match(/[^{{}}]*/g)[2];
            vNode.inserted(node => {
                new watcher(context, vNode, content, (oldVal, newVal) => {
                    let text = vNode.content;
                    let start = text.indexOf(match);
                    text = text.slice(0, start) + newVal + text.slice(start + match.length);
                    node.nodeValue = text;
                });
            });
        });

        domTree[index] = vNode;
    }
}

function editTree(domTree, index, count) {
    domTree.splice(index(), count);
    index(index() - count);
}

function resetKey(vNode, index) {
    let key = vNode.key;
    key = parseInt(key, 16);
    key += index;
    key = key.toString(16);

    vNode.key = key;
    return key;
}

function resetIndex(index, math) {
    return index(index() + math);
}

function setAttribute(vNode, node, key, value) {
    let original = Array.find(vNode.attributes, el => el.key == key);
    let copy = node.attributes[key];

    if (!copy) {
        node.setAttribute(key, value);
    } else {
        copy.nodeValue = (original ? original.value + " " : "") + value;
    }
}

function trim(str) {
    return str.replace(/\s/g, "");
}


export {directives, symbol};
