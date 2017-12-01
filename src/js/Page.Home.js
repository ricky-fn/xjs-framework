import base from "./core/widget.js";
import xjs from "./core/engine.js";

let Page = xjs.declare(base, {
    title: '首页',
    templateString: __include("../pages/Page.Home.html"),
    baseClass: 'page-home fade in'
});

export default Page;