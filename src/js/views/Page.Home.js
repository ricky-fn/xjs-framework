import widget from "../core/widget"
import "../../sass/_Page.Home.scss"
import template from "../../pages/Page.Home.html"

export default xjs.extendView(widget, {
    template,
    data: {
        array1: {}
    },
    methods: {
        startup() {
            setTimeout(() => {
                this.array1[1] = "222222";
            }, 2000);
            // setTimeout(() => {
            //     this.array1[0].age = 42
            // }, 3000);
        }
    }
});