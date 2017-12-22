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
    request() {
        return {
            app: "test",
            url: "test.php",
            method: "post"
        }
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
    startup() {
        console.log(this.data)
        // axios.all([axios.get('test.php'), axios.get('1.php')])
        //     .then(function() {
        //         console.log(arguments);
        //     })
        // xjs.$http({
        //     method: "GET",
        //     url: "test.php"
        // }).then(result => {
        //     console.log(result);
        // })
    }
}

export default Home;