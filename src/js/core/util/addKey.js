function addKey(tree) {
    let keys = [];
    tree.forEach(el => {
        let key;
        do {
            key = createHexRandom();
        } while (keys.indexOf(key) >= 0);

        keys.push(key);

        if (el.type == "tag" || el.type == "text") {
            if (el.attribs) {
                el.attribs["data-key"] = key;
            } else {
                el.attribs = {"data-key": key};
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