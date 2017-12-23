import widget from "../core/widget.js";
import "../../sass/_Page.Home.scss";
import TestPage2 from "./Page.Test2"

class Test extends widget {
    get title() {
        return "首页";
    }
    get templateString() {
        return require("../../pages/Page.Test.html")
    }
    get baseClass() {
        return "page-test1 fade in"
    }
    defineNexus() {
        return [
            {
                name: "test",
                prop: TestPage2,
            }
        ]
    }
    startup() {
        console.log("Second Test Page Was Ready");
    }
    onExit() {
        super.onExit();
        console.log("Second Test Page Has Been Destroyed");
    }
}

export default Test;