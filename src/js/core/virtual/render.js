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
        if (element.type == "tag") {
            let dom = creatByTag(fragment, element, data);
            combine(element.children, dom, data);
        } else if (element.type == "text") {
            creatByText(fragment, element);
        } else if (element.type == "comment") {
            creatByCommon(fragment, element);
        }
    });
}

function creatByCommon(fragment, element) {
    let common = document.createComment(element.data);
    fragment.appendChild(common);
}

function creatByText(fragment, element) {
    let text = document.createTextNode(element.data);
    fragment.appendChild(text);

    if (element.model) {
        element.model(text);
    }
}

function creatByTag(fragment, element, data) {
    let dom = document.createElement(element.name);

    fragment.appendChild(setAttribs(dom, element.attribs));

    if (element.event) {
        element.event.addEventListener(dom);
    }

    if (element.model) {
        element.model(dom);
    }

    if (element.attribs.hasOwnProperty("ref")) {
        refs.insertRefs(data, element, dom);
    }

    return dom;
}

function setAttribs(dom, attribs) {
    Object.keys(attribs).forEach(attr => {
        dom.setAttribute(attr, attribs[attr]);
    });

    return dom;
}

function isArray(o){
    return Object.prototype.toString.call(o)=='[object Array]';
}

export default render;