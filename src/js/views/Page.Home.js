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
        array: [1,2,3,4,5,6],
        test: true,
        // test() {
        //     console.log(arguments);
        //     console.log("congratulations!!!!");
        // }
    },
    startup() {
        console.log(this.data);
        setTimeout(() => {
            console.log(this.data);
            this.data.array = [1];
        }, 2000);
        setTimeout(() => {
            this.data.array.push(2);
        }, 3000);
    }
});