import tool from "../plugin/tool.js"
import $ from "zepto-modules/"

let instance = null;

/**
 * 路由模块
 * @module route
 */

class Router {
    constructor() {
        this.state = {};
        this.componentSequence = {};
        this.map = [];
        this.history = [];
    }


    /**
     * 定义路由映射表以及路由的回调函数，支持利用正则表达式
     * @method setup
     * @memberOf module:route
     * @param [Object] routemap 路由定义表
     * @param [Object] callbacks 回调组
     * @example
     * var router new Router();
     * router.setup({
     *   '#home': 'Page.Home' //请确保唯一性
     * }，{
     *   before: function(){}, //处理路由切换前触发
     *   fail: function(){} //当路由找不到时的回调
     * })
     * router.define('Page.Home', function() {
     *  //todo something
     * })
     * //同时支持使用正则表达式匹配路由
     * //假设一个新闻业务模块包含bbc、cctv、netflix，那么路由可以这样定义:
     * //#page/bbc/news/
     * //#page/cctv/news/
     * //#page/netflix/news/
     * router.setup({
     *  '#page/(\\w+)/news/': 'Page.News' // 可以匹配到上述三个新闻渠道
     * });
     * router.define('Page.News', function(nId) {
     *   console.log(nid); //bbc
     * });
     */
    setup(routemap, cb) {
        var rule;
        this.callback = cb;
        for (rule in routemap) {
            if (!routemap.hasOwnProperty(rule)) continue;
            this.map.push({
                rule: new RegExp('^' + rule + '$', 'i'),
                quote: routemap[rule]
            });
        }
    }

    /**
     * 定义路由回调
     * @method define
     * @memberOf module:route
     * @param {String} name
     * @param {Boolean}[authorize] 是否需要登录操作
     * @param {Function} callback 回调函数，如果有路由关系链，将会等待关系链的成员准备好后再执行回调
     * @example
     * var router = new Router();
     * //一般定义
     * router.define('Page.Home', function() {
     * //todo something
     * })
     * //需要登陆验证
     * router.define('Page.Home', true, function() {
     * //todo something
     * });
     * //需要路由依赖
     * router.define('Page.Home', ['ui.Nav', 'ui.Header', 'ui.Footer'], function() {
     * //todo something
     * })；
     * //需要路由依赖、登陆验证
     * router.define('Page.Home', ['ui.Nav', 'ui.Header', 'ui.Footer'], true, function() {
     * //todo something
     * })；
     */
    define(config) {
        var authorize = config.authorize || false;
        var path = config.path;
        var page = config.page;

        if (page == undefined)
            throw "please aim to which one page are used to render for this path";

        if (path == undefined)
            throw "path is a necessary argument";

        this.map.forEach(function (map) {
            if (map.quote == path) {
                map.authorize = authorize;
                map.page = page;
                map.events = {
                    beforeEnter: config.beforeEnter
                };
                return true;
            }
        });
    }

    /**
     * 路由导航
     * @method navigator
     * @memberOf xjs/router
     * @see module:route#navigator
     */

    /**
     * 导航到下一个路由地址
     * @method navigator
     * @memberOf module:route
     * @param {String}[hash] 下一个路由的Hash地址，不填写则默认引导到#home
     * @param {Object}[state] 路由的缓存内容，将会存储到history.state对象里
     * @param {Boolean}[replaceHash] 当设置为true时会提换历史记录里最后一条路由信息，当设置为false时则会以新增的方式插入历史纪录
     * @example
     * var router = new Router();
     * //默认情况，引导到#home并在历史记录里插入新的记录
     * router.navigator('#home'）;
     * //追加路由缓存信息
     * router.navigator('#home', {isHomePage: true});
     * console.log(history.state.isHomePage) // true
     * //提换当前路由历史记录
     * router.navigator('#home', {}, true);
     */
    navigator(param) {
        param = param || {};

        let self = this,
            to, from, route;

        route = matchRoute.call(this, param.path);

        if (route == false)
            throw "this path is not exist";

        let fullPath = getFullPath(param);

        to = {
            path: param.path,
            param: param.path.match(route.rule).slice(1),
            query: param.query,
            fullPath: fullPath
        };

        from = this.history[this.history.length];

        if (route.events.beforeEnter) {
            route.events.beforeEnter(to, from, function (next) {
                if (next == to) {
                    end.call(this);
                } else {
                    self.navigator(next);
                }
            });
        } else {
            end.call(this);
        }

        function end() {
            if (param.replaceHash) {
                this.history.pop().push(to);
                history.replaceState(null, null, to.fullPath);
            } else {
                this.history.push(to);
                history.pushState(null, null, to.fullPath);
            }

            xjs.createView(route.page, {
                router: to
            }).then(obj => {
                if (instance) {
                    instance.onExit();
                    instance = null;
                }
                instance = obj;
            }).catch(error => {
                if (this.history.length == 1) {
                    throw error;
                } else {
                    this.back();
                }
            });
        }
    }

    /**
     * 启动路由监听事件，必须在定义路由引射表以及路由回调后再启动。<br>
     * 将会监听路由切换事件，例如浏览器的回退和前进
     * @method start
     * @memberOf module:route
     */
    start() {
        let that = this;

        function onHashChange() {
            let url = tool.url();
            if (url.hash) {
                that.navigator({
                    path: url.hash,
                    query: url.query
                })
            } else {
                that.navigator({
                    path: 'home/'
                });
            }
        }

        window.onhashchange = onHashChange;
        onHashChange();
    }
    go(length) {
        if (length == undefined) {
            throw "length has to be a number";
        }
        this.history = this.history.slice(0, this.history.length + length);
        history.go(length);
    }
    back(length) {
        length = length || -1;
        this.go(length);
    }
}

/**
 * 检查当前路由是否能在路由映射表里找到，如果找不到匹配值就会触发传递给setup里的fail函数
 * @method checkMatchResult
 * @memberOf module:route
 * @param {String} hash
 * @param {Object} router.map
 */
function matchRoute(hash) {
    var map = this.map;
    var path = verify(hash, map);
    var self = this;

    if (!path)
        return false;

    if (path.authorize && !xjs.getUserInfo()) {
        getAuthorization.call(self, hash);
    } else {
        return $.extend({}, path, {
            param: hash.match(path.rule).slice(1)
        })
    }
}

/**
 * 跳转到登陆模块，完成用户身份验证后再进入hash所匹配的路由
 * @method getAuthorization
 * @memberOf module:route
 * @param hash
 */
function getAuthorization(hash) {
    this.navigator('#login/', {backHash: hash}, true);
}

/**
 * 检测hash是否在路由路由映射表内
 * @method verify
 * @memberOf module:route
 * @param hash
 * @return {Boolean} 是否匹配到
 */
function verify(hash, map) {
    var path;
    var hash = hash.indexOf('?') > 0 ? hash.slice(0, hash.indexOf('?')) : hash;
    for (var obj in map) {
        path = map[obj];

        if (hash.match(path.rule))
            return path;
    }
    return false;
}

function getFullPath(param) {
    let query = param.query;
    let queryLength = query ? Object.keys(query).length : 0;

    if (query == undefined || queryLength == 0)
        return '#' + param.path;

    let fullPath = '#' + param.path + '?';
    Object.keys(query).forEach(function (key, index) {
        fullPath += key + '=' + query[key];
        if (index != queryLength - 1)
            fullPath += '&';
    });
    return fullPath;
}

export default Router;