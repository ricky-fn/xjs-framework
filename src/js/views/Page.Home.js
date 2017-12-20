import widget from "../core/widget.js";
import "../../sass/_Page.Home.scss";

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
        return [
            {
                des: "test1",
                url: "test.php",
                method: "get"
            },
            {
                des: "test2",
                url: "2.php",
                method: "get"
            },
            {
                des: "test3",
                url: "3.php",
                method: "get",
                data: {
                    a: 1
                }
            }
        ]
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