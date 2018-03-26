class Dep {
    constructor() {
        this.subs = [];
    }
    addSub(sub) {
        this.subs.push(sub);
    }
    notify() {
        let args = Array.prototype.slice.call(arguments, 1);
        this.subs.forEach(sub => {
            if (sub != undefined) {
                // sub.update.apply(sub, args);
                sub.update(args[0], args[1]);
            }
        });
    }
}

export default Dep;