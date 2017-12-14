import base from "../core/widget.js";
import "../../sass/_Page.Home.scss";

let Page = xjs.declare(base, {
    title: '首页1',
    templateString: require("../../pages/Page.Home.html"),
    baseClass: 'page-home fade in'
});

export default Page;