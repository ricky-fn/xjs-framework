import widget from "../core/widget"
import "../../sass/_Page.Home.scss"
import template from "../../pages/Page.Home.html"

export default xjs.extendView(widget, {
    template,
    data: {
        array: [1,2,3,4,5,6],
        timer: 0,
        status: 'continued'
    },
    methods: {
        startup() {
            let counter = 0;
            let limit = 20;
            setTimeout(() => {
                this.array = [1];
                limit = 30;
            }, 2000);
            setTimeout(() => {
                this.array.push(2);
                this.status = 'paused';
                clearInterval(lock);
            }, 3000);
            let lock = setInterval(() => {
                counter += 1;
                this.timer = limit - counter;
            }, 100);
        },
        restart() {
            this.array = [1,2,3,4,5,6];
            this.timer = 0;
            this.status = "continued";
            this.startup();
        }
    }
});