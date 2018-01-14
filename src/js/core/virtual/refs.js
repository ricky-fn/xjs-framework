function insertRefs (data, element, dom) {
    data.$refs = data.$refs || {};
    let name = element.attribs["ref"];
    let target = data.$refs[name];
    let key = element.attribs["data-key"];

    data.$refs = data.$refs || {};
    if (target == undefined) {
        if (data._refs[name].length == 1) {
            target = dom;
        } else {
            target = [dom];
        }
    } else if (target instanceof Array) {
        // target.push(dom);
        target.splice(data._refs[name].indexOf(key), 0, dom);
    } else {
        target = [target];
        target.splice(data._refs[name].indexOf(key), 0, dom);
    }

    data.$refs[name] = target;
}

function removeRefs(data, dom) {
    let key, name;

    if (dom.attributes.hasOwnProperty("ref")) {
        key = dom.attributes["data-key"];
        name = dom.attributes["ref"].nodeValue;

        if (data._refs[name].indexOf(key) < 0) {
            data.$refs[name].splice(data.$refs[name].indexOf(dom), 1);
        }
    }
}

export default {
    removeRefs,
    insertRefs
};