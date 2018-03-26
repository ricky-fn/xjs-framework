function addKey(tree) {
    let keys = [];
    tree.forEach(vNode => {
        let key, obj;
        do {
            key = createHexRandom();
        } while (keys.indexOf(key) >= 0);

        keys.push(key);

        obj = {key: "data-key", value: key};

        if (vNode.type == "element" || vNode.type == "text") {
            if (vNode.attributes) {
                vNode.attributes.push(obj);
            } else {
                vNode.attributes = [obj];
            }
        } else if (el.type == "comment") {
            vNode.attributes = [obj];
        }

        if (vNode.children) {
            addKey(vNode.children);
        }
    });

    return tree;
}

function createHexRandom(){
    let num = Math.floor(Math.random() * 1000000);
    num = num.toString(16);
    return num;
}

export default addKey;