import widget from "./widget"

class components {
    constructor() {
        this.members = {};
        this.cache = {};
    }
    spreadTagName(name) {
        let upper = name.match(/[A-Z]/g);
        let tName = name.split("");

        upper.forEach(mark => {
            let index = tName.indexOf(mark);
            tName.splice(index, 1, '-', mark.toLowerCase());
        });

        return tName.join("");
    }
    register(name, params) {
        let tagName = this.spreadTagName(name);
        this.members[tagName] = params;
    }
    match(tagName) {
        return this.members[tagName];
    }
    init(member, element) {
        Object.keys(element.attribs).forEach(name => {
            this.cache[name] = element.attribs[name];
        });

        let props = member.props;
        let data = member.data();

        if (props instanceof Array) {
            props.forEach(vName => {
                data[vName] = this.cache[vName];
            });
        } else if (props instanceof Object) {
            Object.keys(props).forEach(vName => {
                let val = context[vName];

                // val.
            });
        }

        // new widget()
    }
}

function validate() {

}

export default components;