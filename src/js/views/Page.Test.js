import widget from "../core/widget"
import "../../sass/_Page.Home.scss"
import TestPage from "./Page.Test1"

class Test extends widget {
    get title() {
        return "首页";
    }
    get templateString() {
        return require("../../pages/Page.Test2.html")
    }
    get baseClass() {
        return "page-test fade in"
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
                prop: TestPage,
            },
            // {
            //     name: "test2",
            //     prop: TestPage2,
            // }
        ]
    }
    startup() {
        console.log("First Test Page Was Ready");
    }
    onExit() {
        super.onExit();
        console.log("First Test Page Has Been Destroyed");
    }
}

export default Test;