import widget from "../core/widget"
import "../../sass/_Page.Home.scss"
import templateString from "../../pages/Page.Home.html"

export default xjs.extendView(widget, {
    title: "首页",
    templateString,
    baseClass: "page-home fade in",
    data: {
        items: {
            item1: "123",
            item2: "456",
            item3: 789
        },
        test: "sss",
        // test() {
        //     console.log(arguments);
        //     console.log("congratulations!!!!");
        // }
    },
    startup() {
        setTimeout(() => {
            // this.$set(this.data, "items", {});
            this.data.test = true;
        }, 2000);
    }
});