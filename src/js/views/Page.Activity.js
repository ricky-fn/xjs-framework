import "../../sass/_Page.Activity.scss"
import template from "../../pages/Page.Activity.html"

export default {
    template,
    data: {
        viewHeight: window.innerHeight,
        list: []
    },
    methods: {
        ready() {
            this.$http({
                method: "GET",
                url: "/api/activitylist"
            }).then(result => {
                this.list = result;
            });
        }
    }
}