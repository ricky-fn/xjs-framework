import "../sass/app.scss"
import turbine from "./core/main"
import router from "./router"
// import mock from "./api/mock"
import {http, httpConfig} from "./api/http"
import "../images/favicon.ico"

httpConfig.successCode = 0;
httpConfig.failCode = -1;

turbine.use({
    install(turbine) {
        let $http = new http();
        turbine.http = turbine._turbine.$http = $http.request.bind($http);
    }
});

let presentPage;
let app = turbine({
    el: "#app-view",
    data: {
        slide: false,
        currentHash: window.location.hash
    },
    methods: {
        ready() {
            this.matchRoute();
            // document.body.addEventListener("touchmove", e => {
            //     if (this.slide) {
            //         e.stopPropagation();
            //     }
            // })
        },
        matchRoute() {
            let match = router[this.currentHash];
            let div = document.createElement("div");
            document.body.appendChild(div);

            if (match == undefined) {
                match = router["#home/"];
            }

            if (presentPage == match) {
                return;
            } else if (presentPage) {
                presentPage.$hangup();
            }

            if (match instanceof turbine.prototype._init) {
                match.$mount(div);
            } else {
                match = router[this.currentHash] = turbine(match).$mount(div);
            }

            presentPage = match;
        }
    },
    watch: {
        currentHash: function() {
            this.matchRoute();
            this.slide = false;
        }
    }
});

window.onhashchange = function() {
    app.currentHash = window.location.hash;
};
