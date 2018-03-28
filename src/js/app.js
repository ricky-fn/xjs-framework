import "../sass/app.scss"
import turbine from "./core/main"
// import router from "./router"
// import mock from "./api/mock"
import {http, httpConfig} from "./api/http"

httpConfig.successCode = 0;
httpConfig.failCode = -1;

turbine.use({
    install(turbine) {
        let $http = new http();
        turbine.http = turbine._turbine.$http = $http.request.bind($http);
    }
});

let app = turbine({
    el: "#app-view",
    data: {
        array: [1,2,3]
    },
    methods: {
        ready() {
            setTimeout(() => {
                this.array.pop();
            }, 2000);
        }
    }
});
