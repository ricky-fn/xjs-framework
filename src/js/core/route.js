define('route', function () {
    /**
     * 路由模块
     * @module Router
     */
    function Router() {}

    Router.prototype.definemap = {};
    Router.prototype.state = {};

    /**
     * 定义路由映射表以及路由的回调函数，支持利用正则表达式
     * @method setup
     * @memberOf module:Router
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
    Router.prototype.setup = function (routemap, cb) {
        var rule, func;
        this.routemap = [];
        this.callback = cb;
        for (rule in routemap) {
            if (!routemap.hasOwnProperty(rule)) continue;
            this.routemap.push({
                rule: new RegExp('^' + rule + '$', 'i'),
                quote: routemap[rule]
            });
        }
    };

    /**
     * 定义路由回调
     * @method define
     * @memberOf module:Router
     * @param {String} name
     * @param {Object}[nexus] 此路由所依赖的关系链
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
    Router.prototype.define = function (name, nexus, authorize, cb) {
        var route;
        if (!authorize && !cb) {
            cb = nexus;
            authorize = false;
            nexus = null;
        } else if (nexus instanceof Array && !cb) {
            cb = authorize;
            authorize = false;
        } else if (typeof nexus == 'boolean' && !cb) {
            cb = authorize;
            authorize = nexus;
            nexus = null;
        }

        this.definemap[name] = {
            Func: cb,
            authorize: authorize,
            nexus: nexus
        };

        for (var way in this.routemap) {
            route = this.routemap[way];
            if (route.quote == name)
                return this.definemap[name].rule = route.rule;
        }
    };

    /**
     * 路由导航
     * @method navigator
     * @memberOf xjs/router
     * @see module:Router#navigator
     */

    /**
     * 导航到下一个路由地址
     * @method navigator
     * @memberOf module:Router
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
    Router.prototype.navigator = function (hash, state, replaceHash) {
        var hash = hash || '#home/',
            activeHash = location.hash,
            state = state || {},
            self = this;

        this.checkMatchResult(hash, function (response, result, nexus) {
            history[replaceHash ? 'replaceState' : 'pushState'](state, null, hash);

            xjs.triggerAnnounceEvent('beforePageChange', activeHash, result);

            self.excludeAbandondModules(response, result, nexus, function (renderTeam) {
                var crenderTeam = renderTeam.concat();

                xjs.addAnnounceEvent('widgetReady', function (e, routeResponseName) {
                    if (routeResponseName)
                        crenderTeam.splice(crenderTeam.indexOf(routeResponseName), 1);

                    if (!crenderTeam.length) {
                        xjs.removeAnnounceEvent('widgetReady');
                        response.apply(null, result);
                    }
                });

                if (!renderTeam.length)
                    return xjs.triggerAnnounceEvent('widgetReady');

                $.each(crenderTeam, function (i, name) {
                    setTimeout(function () {
                        self.definemap[name].Func();
                    }, 0);
                });
            });
        });
    };

    /**
     * 启动路由监听事件，必须在定义路由引射表以及路由回调后再启动。<br>
     * 将会监听路由切换事件，例如浏览器的回退和前进
     * @method start
     * @memberOf module:Router
     */
    Router.prototype.start = function () {
        var that = this;

        function onHashChange(e) {
            var param = [];
            if (location.hash) {
                param.push(location.hash);
                if (e && e.isTrusted) {
                    param.push(null, true);
                }
                that.navigator.apply(that, param);
            } else {
                that.navigator('#home/', null, true);
            }
        }

        window.onhashchange = onHashChange;
        onHashChange();
    };

    /**
     * 检测hash是否在路由路由映射表内
     * @method verify
     * @memberOf module:Router
     * @param hash
     * @return {Boolean} 是否匹配到
     */
    Router.prototype.verify = function (hash) {
        var route, matchResult;
        var hash = hash.indexOf('?') > 0 ? hash.slice(0, hash.indexOf('?')) : hash;
        for (var obj in this.definemap) {
            route = this.definemap[obj];

            if (route.rule == undefined)
                continue;

            matchResult = hash.match(route.rule);
            if (matchResult) return {
                route: route,
                matchResult: matchResult
            };
        }
        return false;
    };

    /**
     * 跳转到登陆模块，完成用户身份验证后再进入hash所匹配的路由
     * @method getAuthorization
     * @memberOf module:Router
     * @param hash
     */
    Router.prototype.getAuthorization = function (hash) {
        this.navigator('#login/', {backHash: hash}, true);
    };

    /**
     * 检查当前路由是否能在路由映射表里找到，如果找不到匹配值就会触发传递给setup里的fail函数
     * @method checkMatchResult
     * @memberOf module:Router
     * @param {String} hash
     * @param {Function} callback
     */
    Router.prototype.checkMatchResult = function (hash, cb) {
        var result = this.verify(hash);

        if (!result)
            return this.callback.fail();

        var routeParameters = result.matchResult.slice(1);
        var routeResponse = result.route.Func;
        var nexus = result.route.nexus;

        if (result.route.authorize && !xjs.getUserInfo()) {
            this.getAuthorization(hash);
        } else {
            cb.call(this, routeResponse, routeParameters, nexus);
        }
    };

    /**
     * 对当前路由依赖关系以及下一个路由依赖关系做对比，会保留重复调用的路由关系链成员
     * @method excludeAbandonModules
     * @memberOf module:Router
     */
    Router.prototype.excludeAbandondModules = function (response, result, newNexus, cb) {
        if (!newNexus) {
            xjs.destroyView();
            this._currentNexus = undefined;
            response.apply(null, result);
        } else {
            if (this._currentNexus == undefined) {
                xjs.destroyView();
                this._currentNexus = newNexus;
                cb(newNexus);
            } else {
                var remainTeam = [];
                var exeTeam = [];

                //找出无需更新的组以及需要加载的组
                for (var i = 0; i < newNexus.length; i++) {
                    if (this._currentNexus.indexOf(newNexus[i]) < 0) {
                        exeTeam.push(this._currentNexus[i]);
                    } else {
                        remainTeam.push(this._currentNexus[i]);
                    }
                }

                for (var instance in xjs._instances) {
                    if (remainTeam.indexOf(xjs._instances[instance].routeEventName) < 0)
                        xjs.destroyView(instance);
                }

                cb(exeTeam);
            }
        }
    };

    return Router;
});