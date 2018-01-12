import patch from "./patch"
import render from "./render"

function compare(oldTree, newTree, parent) {
    let patches = patch(oldTree, newTree);
    patches.getPatches().forEach(patch => {
        applyPatch(patch, parent);
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

function applyPatch(patch, parent) {
    switch (patch.method) {
        case "add":
            debugger;
            let child = render(patch.target);
            parent.insertBefore(child, parent.childNodes[patch.index + 1]);
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
        case "event":
            let {oldEl, newEl} = patch.target;
            let dom = parent.childNodes[patch.index];
            oldEl.event.removeEventListener(dom);
            newEl.event.addEventListener(dom);
            break;
        case "delete":
            let target = parent.childNodes[patch.index];
            target.remove();
    }
}

export default compare;