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
    request() {
        return {
            app: "test",
            url: "test.php",
            method: "post"
        }
    }
    defineNexus() {
        return [
            {
                name: "test",
                prop: TestPage2,
            },
            // {
            //     name: "test2",
            //     prop: TestPage2,
            // }
        ]
    }
    startup() {
        console.log("Second Test Page Was Ready");
    }
}

export default Test;