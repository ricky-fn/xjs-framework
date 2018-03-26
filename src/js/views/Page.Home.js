import "../../sass/_Page.Home.scss"
import template from "../../pages/Page.Home.html"

export default {
    template,
    data: {
        timeNodeHeight: false
    },
    methods: {
        ready() {
            setTimeout(() => {
                this.timeNodeHeight = this.$refs.timeNode.offsetHeight + 'px';
            }, 500);
        }
    }
}