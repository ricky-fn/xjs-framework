import refs from "./refs"

function render(domTree, data) {
    let fragment = document.createDocumentFragment();

    if (!isArray(domTree)) {
        domTree = [domTree];
    }

    combine(domTree, fragment, data);

    return fragment;
}

function combine(domTree, fragment, data) {
    domTree.forEach(element => {
        let el;
        if (element.type == "element") {
            let dom = el = creatByTag(fragment, element, data);
            combine(element.children, dom, data);
        } else if (element.type == "text") {
            el = creatByText(fragment, element);
        } else if (element.type == "comment") {
            el = creatByCommon(fragment, element);
        }

        element.ready(el);
    });
}

function creatByCommon(fragment, element) {
    let common = document.createComment(element.content);
    fragment.appendChild(common);

    return common;
}

function creatByText(fragment, element) {
    let text = document.createTextNode(element.content);
    fragment.appendChild(text);

    // if (element.model) {
    //     element.model(text);
    // }

    return text;
}

function creatByTag(fragment, element, data) {
    let dom = document.createElement(element.tagName);

    fragment.appendChild(setAttribs(dom, element.attributes));

    if (Array.find(element.attributes, el => el.key == "ref")) {
        refs.insertRefs(data, element, dom);
    }

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