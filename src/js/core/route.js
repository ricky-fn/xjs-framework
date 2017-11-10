define('route', ['engine'], function (xjs) {
    /**
     * 路由模块
     * @module route
     */
    function Router() {
        this.state = {};
        this.componentSequence = {};
        this.map = [];
        this._currentNexus = false;
    }

    // Router.prototype.definemap = {};

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
    Router.prototype.setup = function (routemap, cb) {
        var rule;
        this.callback = cb;
        for (rule in routemap) {
            if (!routemap.hasOwnProperty(rule)) continue;
            this.map.push({
                rule: new RegExp('^' + rule + '$', 'i'),
                quote: routemap[rule]
            });
        }
    };

    /**
     * 定义路由回调
     * @method define
     * @memberOf module:route
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

        var self = this;
        var components = {};

        if (nexus) {
            nexus.forEach(function (name) {
                components[name] = self.componentSequence[name];
            });
        }

        this.map.forEach(function (map) {
            if (map.quote == name) {
                map.authorize = authorize;
                map.nexus = components;
                map.fn = cb;
            }
        });

        // this.definemap[name] = {
        //     Func: cb,
        //     authorize: authorize,
        //     nexus: nexus
        // };

        // for (var way in this.map) {
        //     route = this.map[way];
        //     if (route.quote == name)
        //         return this.definemap[name].rule = route.rule;
        // }
    };

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
    Router.prototype.navigator = function (hash, state, replaceHash) {
        var hash = hash || '#home/',
            state = state || {};

        var route = matchRoute.call(this, hash, this.map);

        if (route == false)
            throw "this route is not existing";

        history[replaceHash ? 'replaceState' : 'pushState'](state, null, hash);

        renderComponents.call(this, route).then(function () {
            route.fn.apply(null, route.params);
        });
    };

    /**
     * 启动路由监听事件，必须在定义路由引射表以及路由回调后再启动。<br>
     * 将会监听路由切换事件，例如浏览器的回退和前进
     * @method start
     * @memberOf module:route
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

    Router.prototype.component = function (array) {
        this.componentSequence = array;
    };

    /**
     * 检查当前路由是否能在路由映射表里找到，如果找不到匹配值就会触发传递给setup里的fail函数
     * @method checkMatchResult
     * @memberOf module:route
     * @param {String} hash
     * @param {Object} router.map
     */
    function matchRoute(hash, map) {
        var path = verify(hash, map);
        var self = this;

        if (!path)
            return false;

        if (path.authorize && !xjs.getUserInfo()) {
            getAuthorization.call(self, hash);
        } else {
            return {
                nexus: path.nexus,
                fn: path.fn,
                param: hash.match(path.rule).slice(1)
            }
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

    /**
     * 对当前路由依赖关系以及下一个路由依赖关系做对比，对不存在于路由关系链里的模块会销毁掉[xjs.destroyView]{@link xjs.destroyView}
     * @method filterComponents
     * @memberOf module:route
     */
    function filterComponents(nexus) {
        var length = Object.keys(nexus);
        var currentNexus = this._currentNexus;
        if (length == 0) {
            xjs.destroyView();
            currentNexus = false;
            return nexus;
        } else {
            if (!currentNexus) {
                xjs.destroyView();
                currentNexus = nexus;
                return nexus;
            } else {
                debugger;
                findAbandonedItem(nexus, currentNexus).forEach(function (key) {
                    xjs.destroyView(currentNexus[key].id);
                    delete currentNexus[key].id;
                });

                findAbandonedInstance(currentNexus).forEach(function (id) {
                    xjs.destroyView(id);
                });

                this._currentNexus = nexus;

                return findAddedItem(nexus, currentNexus);
            }
        }
    }

    function renderComponents(route) {
        var renderTeam = filterComponents.call(this, route.nexus);
        var renderSequence = [];
        var self = this;

        Object.keys(renderTeam).forEach(function (name) {
            var def = $.Deferred();
            renderSequence.push(def);
            setTimeout(function() {
                self.componentSequence[name].render(function (instance) {
                    self.componentSequence[name].id = instance.id;
                    def.resolve();
                });
            }, 0)
        });

        return $.when.apply(null, renderSequence);
    }

    function findAbandonedInstance(oldNexus) {
        var ids = [];
        var mark = false;
        for (var obj in xjs._instances) {
            mark = false;
            for (var item in oldNexus) {
                if (oldNexus[item].id == xjs._instances[obj].id)
                    mark = true;
            }
            if (mark == false)
                ids.push(xjs._instances[obj].id);
        }

        return ids;
    }

    function findAbandonedItem(nexus, oldNexus) {
        var nexusArray = Object.keys(nexus);
        var oldNexusArray = Object.keys(oldNexus);
        var items = [];

        oldNexusArray.forEach(function (key) {
            if (nexusArray.indexOf(key) < 0) {
                items.push(key);
            }
        });

        return items;
    }

    function findAddedItem(nexus, oldNexus) {
        var nexusArray = Object.keys(nexus);
        var oldNexusArray = Object.keys(oldNexus);
        var items = [];

        nexusArray.forEach(function (key) {
            if (oldNexusArray.indexOf(key) < 0) {
                items.push(key);
            }
        });

        return items;
    }

    return Router;
});