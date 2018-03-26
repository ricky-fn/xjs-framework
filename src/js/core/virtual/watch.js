import Dep from "./dep"
import evalWithContext from "../util/eval"
import {stringify} from "himalaya"

class watch {
    constructor(vm, vNode, name, recall) {
        Dep.target = this;
        this.name = name;
        this.vm = vm;
        this.node = vNode;
        this.recall = recall;
        this.update();
        Dep.target = null;
    }
    update() {
        let oldVal = this.value;
        let newVal = this.get();
        this.recall(oldVal, newVal);
    }
    get() {
        try {
            this.value = evalWithContext(this.name, this.vm);
        } catch(err) {
            let str = stringify([this.node.reference]);
            console.error(err + '\n\n', 'please check your template: \n' + str);
        }
        return this.value;
    }
}

export default watch;