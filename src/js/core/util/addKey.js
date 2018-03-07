function addKey(tree) {
    let keys = [];
    tree.forEach(el => {
        let key, obj;
        do {
            key = createHexRandom();
        } while (keys.indexOf(key) >= 0);

        keys.push(key);

        obj = {key: "data-key", value: key};

        if (el.type == "element" || el.type == "text") {
            if (el.attributes) {
                el.attributes.push(obj);
            } else {
                el.attributes = [obj];
            }
        }

        if (el.children) {
            addKey(el.children);
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