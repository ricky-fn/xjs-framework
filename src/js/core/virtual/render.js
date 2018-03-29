function render(domTree) {
    let fragment = document.createDocumentFragment();

    if (!isArray(domTree)) {
        domTree = [domTree];
    }

    combine(domTree, fragment);

    return fragment;
}

function combine(domTree, fragment) {
    domTree.forEach(vNode => {
        let el;
        if (vNode.type == "element") {
            el = creatByTag(fragment, vNode);
            vNode.ready(el);

            combine(vNode.children, el);
        } else {
            if (vNode.type == "text") {
                el = creatByText(fragment, vNode);
            } else if (vNode.type == "comment") {
                el = creatByCommon(fragment, vNode);
            }
            vNode.ready(el);
        }
    });
}

function creatByCommon(fragment, vNode) {
    let common = document.createComment(vNode.content);
    fragment.appendChild(common);

    return common;
}

function creatByText(fragment, vNode) {
    let text = document.createTextNode(vNode.content);
    fragment.appendChild(text);

    return text;
}

function creatByTag(fragment, vNode) {
    let dom = document.createElement(vNode.tagName);

    fragment.appendChild(setAttribs(dom, vNode.attributes));

    return dom;
}

function setAttribs(dom, attribs) {
    attribs.forEach(attr => {
        dom.setAttribute(attr.key, attr.value);
    });

    return dom;
}

function isArray(o){
    return Object.prototype.toString.call(o)=='[object Array]';
}

export default render;