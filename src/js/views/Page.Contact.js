import "../../sass/_Page.Contact.scss"
import template from "../../pages/Page.Contact.html"

export default {
    template,
    data: {
        viewHeight: window.innerHeight,
        showPopup: false,
        formData: {
            name: "",
            contact_number: "",
            email: "",
            detail: ""
        },
        posted: false
    },
    methods: {
        postMessage() {
            let data = this.formData;

            if (data.name != "" && data.contact_number != "" && data.email != "" && data.detail != "") {
                this.$http({
                    url: "/api/message",
                    method: "POST",
                    data: this.formData
                }).then(() => {
                    this.posted = true;
                    this.showPopup = false;
                    alert("信息已被发送，感谢您的反馈");
                }).catch(err => {
                    alert(err.message);
                });
            } else {
                alert("请填写所有输入框后再提交");
            }
        }
    }
}