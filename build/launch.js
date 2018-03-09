const Koa = require('koa');
const server = require("koa-static");
const seoMiddleware = require('koa-seo');
const app = new Koa();

app.use(seoMiddleware({
    render: {
        // use `window.isPageReady=1` to notify chrome-render page has ready
        useReady: true,
    }
}));

app.use(server("./dist"));

app.listen(3000);