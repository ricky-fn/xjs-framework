import patch from "./patch"
import render from "./render"
import refs from "./refs"

function compare(oldVM, newVm, parent, data) {
    let patches = patch(oldVM, newVm);
    patches.getPatches().forEach(patch => {
        applyPatch(patch, parent, data);
    });
    patches.getRestEl().forEach(team => {
        let nextOT = team[0].children;
        let nextNT = team[1].children;
        let index = newVm.indexOf(team[1]);
        let nextDom = parent.childNodes[index];
        if (nextOT) {
            compare(nextOT, nextNT, nextDom, data);
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
            Array.forEach(gather, target => {
                refs.removeRefs(data, target);
            });

            target.parentNode.removeChild(target);
            break;
        case "replace":
            target = parent.childNodes[patch.index];
            child = render(patch.target, data);
            target.remove();

            parent.insertBefore(child, parent.childNodes[patch.index]);
            break;
        case "attr":
            target = parent.childNodes[patch.index];
            let attrs = patch.target.attributes;
            attrs.forEach(attr => {
                let prop = target.attributes[attr.key];
                let nodeValue = prop ? prop.nodeValue : undefined;

                if (nodeValue != attrs[name]) {
                    target.setAttribute(attr.key, attr.value);
                }
            });

            // if attribute has been removed from vm, it should be deleted from dom in here
            for (let i = 0; i < target.attributes.length; i++) {
                let name = target.attributes[i].name;
                if (attrs.find(el => el.key == name) == undefined) {
                    target.removeAttribute(name);
                }
            }
            break;
        case "text":
            target = parent.childNodes[patch.index];
            target.nodeValue = patch.target.data;
            break;
        case "model":
            target = parent.childNodes[patch.index];
            patch.target.model.update(target);
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