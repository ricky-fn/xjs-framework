import widget from "../core/widget"
import "../../sass/_Page.Home.scss"
import template from "../../pages/Page.Test.html"

export default xjs.extendView(widget, {
    title: "测试",
    template,
    data: {
        a: 1
    }
});