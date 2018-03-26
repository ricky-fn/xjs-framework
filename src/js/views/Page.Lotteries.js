import "../../sass/_Page.Lotteries.scss"
import template from "../../pages/Page.Lotteries.html"

export default {
    template,
    data: {
        lotterylist: [],
        activeIndex: 0,
        presentItems: {},
    },
    methods: {
        ready() {
            this.$http({
                methods: "GET",
                url: "/api/lotterylist"
            }).then(result => {
                this.lotterylist = result;
                this.presentItems = this.lotterylist[this.activeIndex].data;
            });
        },
        switch_cat(index) {
            this.presentItems = this.lotterylist[this.activeIndex = index].data
        }
    }
}