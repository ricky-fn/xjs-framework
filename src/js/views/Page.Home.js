import widget from "../core/widget"
import TestPage from "./Page.Test"
import "../../sass/_Page.Home.scss"

class Home extends widget {
    get title() {
        return "首页";
    }
    get templateString() {
        return require("../../pages/Page.Home.html")
    }
    get baseClass() {
        return "page-home fade in"
    }
    defineNexus() {
        return {
            name: "test",
            prop: TestPage,
            params: {
                a: 1,
                b: 2
            }
        }
    }
    onExit() {
        super.onExit();
        console.log("Home Page Has Been Destroyed");
    }
}

export default Home;