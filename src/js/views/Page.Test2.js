import widget from "../core/widget.js";
import "../../sass/_Page.Home.scss";

class Test extends widget {
    get title() {
        return "首页";
    }
    get templateString() {
        return require("../../pages/Page.Test.html")
    }
    get baseClass() {
        return "page-home fade in"
    }
    startup() {
        console.log("Third Test Page Was Ready");
    }
}

export default Test;