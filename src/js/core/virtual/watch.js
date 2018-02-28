import Dep from "./dep"

function evalWithContext(content, context) {
    return (new Function('with(this){return ' + content + '}')).call(context);
}

class watch {
    constructor(vm, node, name, recall) {
        Dep.target = this;
        this.name = name;
        this.node = node;
        this.vm = vm;
        this.recall = recall;
        this.update();
        Dep.target = null;
    }
    update() {
        this.get();
        this.recall(this.node, this.value);
    }
    get() {
        this.value = evalWithContext(this.name, this.vm);
    }
}

export default watch;