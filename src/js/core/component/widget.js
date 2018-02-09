import widget from "../widget"

class component extends widget {
    constructor(context) {
        let parentDom = document.createDocumentFragment();
        super(parentDom, context);
    }
}

export default component