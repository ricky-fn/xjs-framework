import patch from "./patch"
import render from "./render"
import refs from "./refs"

function compare(oldTree, newTree, parent, data) {
    let patches = patch(oldTree, newTree);
    patches.getPatches().forEach(patch => {
        applyPatch(patch, parent, data);
    });
    patches.getRestEl().forEach(team => {
        let nextOT = team[0].children;
        let nextNT = team[1].children;
        let index = newTree.indexOf(team[1]);
        let nextDom = parent.childNodes[index];
        if (nextOT) {
            compare(nextOT, nextNT, nextDom);
        }
    });
}

function applyPatch(patch, parent, data) {
    let target, child;
    switch (patch.method) {
        case "add":
            child = render(patch.target, data);
            parent.insertBefore(child, parent.childNodes[patch.index + 1]);
            break;
        case "delete":
            target = parent.childNodes[patch.index];
            let gather = target.querySelectorAll("[ref]");

            refs.removeRefs(data, target);
            gather.forEach(target => {
                refs.removeRefs(data, target);
            });

            target.remove();
            break;
        case "replace":
            target = parent.childNodes[patch.index];
            child = render(patch.target, data);
            target.remove();

            parent.insertBefore(child, parent.childNodes[patch.index]);
            break;
        case "attr":
            let obj = parent.childNodes[patch.index];
            let attrs = patch.target.attribs;
            Object.keys(attrs).forEach(name => {
                let nodeValue = obj.attributes[name].nodeValue;
                if (nodeValue == undefined) {
                    obj.setAttribue(name, attrs[name]);
                } else if (nodeValue != attrs[name]) {
                    obj.setAttribute(name, attrs[name]);
                }
            });
            break;
        case "text":
            let text = parent.childNodes[patch.index];
            text.nodeValue = patch.target.data;
            break;
        // case "event":
        //     let {oldEl, newEl} = patch.target;
        //     let dom = parent.childNodes[patch.index];
        //     oldEl.event.removeEventListener(dom);
        //     newEl.event.addEventListener(dom);
        //     break;
    }
}

export default compare;