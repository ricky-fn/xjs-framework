import diff from "./diff"

function patch(oldGroup, newGroup) {
    // let oldKeys = {};
    // let newKeys = {};
    let oldKeys = [];
    let newKeys = [];
    let okeyMap = {};
    let nkeyMap = {};

    oldGroup.forEach(el => {
        let key = el.key;
        if (key !== undefined) {
            okeyMap[key] = el;
            oldKeys.push(key);
        }
    });
    newGroup.forEach(el => {
        let key = el.key;
        if (key !== undefined) {
            nkeyMap[key] = el;
            newKeys.push(key);
        }
    });

    let patches = diff(oldKeys, newKeys); //两个object的顺序不一定是按照真实的顺序排列

    let restKeys = newKeys.concat();

    if (patches.length > 0) {
        patches.forEach(cp => {
            let index = restKeys.indexOf(cp.target),
                oldNode = okeyMap[cp.target],
                newNode = nkeyMap[cp.target];

            if (index >= 0) {
                restKeys.splice(index, 1);
            }

            cp.target = {oldNode, newNode};
        });
    }

    // restKeys.forEach(key => {
    //     let oldNode = okeyMap[key];
    //     let newNode = nkeyMap[key];
    //
    //     newNode.el = oldNode.el;
    // });

    return {
        getPatches: () => {
            return patches;
        },
        getRestEl: () => {
            let array = [];
            restKeys.forEach(key => {
                array.push({
                    oldNode: okeyMap[key],
                    newNode: nkeyMap[key]
                });
            });
            return array;
        }
    };
}

export default patch