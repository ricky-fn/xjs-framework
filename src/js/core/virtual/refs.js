function insertRefs (vm, element, dom) {
    vm.$refs = vm.$refs || {};
    let name = Array.find(element.attributes, el => el.key == "ref").value;
    let target = vm.$refs[name];
    let key = Array.find(element.attributes, el => el.key == "data-key");

    vm.$refs = vm.$refs || {};
    if (target == undefined) {
        if (vm._refs[name].length == 1) {
            target = dom;
        } else {
            target = [dom];
        }
    } else if (target instanceof Array) {
        // target.push(dom);
        target.splice(vm._refs[name].indexOf(key.value), 0, dom);
    } else {
        target = [target];
        target.splice(vm._refs[name].indexOf(key.value), 0, dom);
    }

    vm.$refs[name] = target;
}

function removeRefs(vm, dom) {
    let key, name;

    if (dom.attributes.hasOwnProperty("ref")) {
        key = dom.attributes["data-key"].nodeValue;
        name = dom.attributes["ref"].nodeValue;

        if (vm._refs[name].indexOf(key) < 0) {
            vm.$refs[name].splice(vm.$refs[name].indexOf(dom), 1);
        }
    }
}

export default {
    removeRefs,
    insertRefs
};