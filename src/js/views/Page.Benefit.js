import "../../sass/_Page.Benefit.scss"
import template from "../../pages/Page.Benefit.html"

export default {
    template,
    data: {
        list: [],
    },
    methods: {
        ready() {
            this.$http({
                method: "GET",
                url: "/api/welfarelist"
            }).then(result => {
                this.list = result;
            });
        }
    }
}