import patch from "./patch"
import render from "./render"

function compare(oldVM, newVM, parent, context) {
    let patches = patch(oldVM, newVM);
    patches.getPatches().forEach(patch => {
        applyPatch(patch, parent, context);
    });
    patches.getRestEl().forEach(nodes => {
        let {oldNode, newNode} = nodes;
        let oldChild = oldNode.children;
        let newChild = newNode.children;
        let index = newVM.indexOf(newNode);
        let nextDom = parent.childNodes[index];

        newNode.el = oldNode.el;
        // newNode.isReady = oldNode.isReady;

        newNode.directives.forEach(obj => {
            obj.update && obj.update(newNode.el, obj.binding, newNode, oldNode);
        });

        if (oldChild) {
            compare(oldChild, newChild, nextDom, context);
        }
    });
}

function applyPatch(patch, parent, context) {
    let target, child;
    let {oldNode, newNode} = patch.target;
    switch (patch.method) {
        case "add":
            child = render(newNode, context);
            parent.insertBefore(child, parent.childNodes[patch.index + 1]);

            break;
        case "delete":
            // target = parent.childNodes[patch.index];
            // let gather = target.querySelectorAll("[ref]");
            //
            // refs.removeRefs(context, target);
            // Array.forEach(gather, target => {
            //     refs.removeRefs(context, target);
            // });

            oldNode.remove();
            break;
        case "replace":
            console.warn("need to test");
            target = parent.childNodes[patch.index];
            child = render(patch.target.newNode, context);
            target.remove();

            parent.insertBefore(child, parent.childNodes[patch.index]);
            break;
    }
}

export default compare;