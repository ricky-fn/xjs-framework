import diff from "./diff"

function patch(oldGroup, newGroup) {
    // let oldKeys = {};
    // let newKeys = {};
    let oldKeys = [];
    let newKeys = [];
    let okeyMap = {};
    let nkeyMap = {};

    oldGroup.forEach(el => {
        let key = el.attributes ? Array.find(el.attributes, el => el.key == "data-key").value : undefined;
        if (key !== undefined) {
            okeyMap[key] = el;
            oldKeys.push(key);
        }
    });
    newGroup.forEach(el => {
        let key = el.attributes ? Array.find(el.attributes, el => el.key == "data-key").value : undefined;
        if (key !== undefined) {
            nkeyMap[key] = el;
            newKeys.push(key);
        }
    });

    let patches = diff(oldKeys, newKeys); //两个object的顺序不一定是按照真实的顺序排列

    let restKeys = newKeys.concat();

    if (patches.length > 0) {
        patches.forEach(cp => {
            let index = restKeys.indexOf(cp.target);
            if (index >= 0) {
                restKeys.splice(index, 1);
            }
            cp.target = okeyMap[cp.target] || nkeyMap[cp.target];
        });
    }

    // restKeys.forEach(key => {
    //     let oldEl = okeyMap[key];
    //     let newEl = nkeyMap[key];
    //
    //     if (oldEl == undefined || newEl == undefined) {
    //         return;
    //     }
    //
    //     let oldArStr = JSON.stringify(oldEl.attributes);
    //     let newArStr = JSON.stringify(newEl.attributes);
    //
    //     if (oldArStr != newArStr) {
    //         patches.splice(0, 0, {
    //             method: "attr",
    //             target: newEl,
    //             index: oldGroup.indexOf(oldEl)
    //         });
    //     }
    // });

    return {
        getPatches: () => {
            return patches;
        },
        getRestEl: () => {
            let array = [];
            restKeys.forEach(key => {
                array.push([okeyMap[key], nkeyMap[key]]);
            });
            return array;
        }
    };
}

export default patch