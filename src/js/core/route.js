define('route', function () {
    function Router() {}

    Router.prototype.definemap = {};
    Router.prototype.state = {};

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
    Router.prototype.navigator = function (hash, state, replaceHash) {
        var hash = hash || '#home/',
            activeHash = location.hash,
            state = state || {},
            self = this;

        this.checkMatchResult(hash, function (response, result, nexus) {
            history[replaceHash ? 'replaceState' : 'pushState'](state, null, hash);

            xjs.triggerAnnounceEvent('beforePageChange', activeHash, result);

            self.excludeAbandonedModules(response, result, nexus, function (renderTeam) {
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
    Router.prototype.getAuthorization = function (hash) {
        this.navigator('#login/', {backHash: hash}, true);
    };
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
    Router.prototype.excludeAbandonedModules = function (response, result, newNexus, cb) {
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