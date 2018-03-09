import widget from "../core/widget"
import "../../sass/_Page.Home.scss"
import template from "../../pages/Page.Home.html"

export default xjs.extendView(widget, {
    template,
    data: {
        array1: [1,2,3,5]
    },
    methods: {
        startup() {
            window.useReady = 1;
        }
    }
});