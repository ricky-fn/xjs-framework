import diff from "./diff"

function patch(oldGroup, newGroup) {
    let oldKeys = {};
    let newKeys = {};

    oldGroup.forEach(el => {
        let key = el.attribs ? el.attribs["data-key"] : undefined;
        if (key !== undefined) {
            oldKeys[key] = el;
        }
    });
    newGroup.forEach(el => {
        let key = el.attribs ? el.attribs["data-key"] : undefined;
        if (key !== undefined) {
            newKeys[key] = el;
        }
    });

    let patches = diff(Object.keys(oldKeys), Object.keys(newKeys)); //两个object的顺序不一定是按照真实的顺序排列

    let restKeys = Object.keys(oldKeys);

    if (patches.length > 0) {
        patches.forEach(cp => {
            restKeys.splice(restKeys.indexOf(cp.target), 1);
            cp.target = oldKeys[cp.target] || newKeys[cp.target];
        });
    }

    restKeys.forEach(key => {
        let oldEl = oldKeys[key];
        let newEl = newKeys[key];

        if (oldEl == undefined || newEl == undefined) {
            return;
        }

        let oldArStr = JSON.stringify(oldEl.attribs);
        let newArStr = JSON.stringify(newEl.attribs);
        if (oldEl.event) {
            patches.push({
                method: "event",
                target: {oldEl, newEl},
                index: oldGroup.indexOf(oldEl)
            });
        }

        if (oldArStr != newArStr) {
            patches.push({
                method: "attr",
                target: newEl,
                index: oldGroup.indexOf(oldEl)
            });
        } else if (oldEl.type == "text" && (oldEl.data != newEl.data)) {
            patches.push({
                method: "text",
                target: newEl,
                index: oldGroup.indexOf(oldEl)
            });
        }
    });

    return {
        getPatches: () => {
            return patches;
        },
        getRestEl: () => {
            let array = [];
            restKeys.forEach(key => {
                array.push([oldKeys[key], newKeys[key]]);
            });
            return array;
        }
    };
}

export default patch