define('widget', ['engine', 'underscore', 'zepto'], function (xjs, _, $) {
    var declare = xjs.declare;

    return declare('ui.Widget', {
        init: function (dom) {
            this.domNode = this.domNode || (this.$domNode = $(dom)).get(0);

            this.render();

            $.when(this.syncGetData()).done(function () {
                this.buildRender();
                if (!this.finalStep) {
                    xjs.triggerAnnounceEvent('widgetReady', this.routeEventName);
                } else {
                    xjs.triggerAnnounceEvent('allWidgetReady', this.routeEventName);
                }
                this.startup && this.startup();
            }.bind(this));
            return this;
        },
        render: function () {
            document.title = this.title || document.title;
            this.id = this.domNode.id;
        },
        syncGetData: function () {
            var o = this.request ? this.request() : 0, dtd = $.Deferred();
            if (!o) return dtd.resolve();
            if (o.then) {
                o.done(waitRequest.bind(this));
                return dtd.promise();
            }
            waitRequest.bind(this, o)();
            function waitRequest(param) {
                var param = param instanceof Array ? param : [param], i, name, count = 0;
                this.data = this.data || {};
                for (i = 0; i < param.length; i++) {
                    name = param[i].app;
                    if (!param[i].hasOwnProperty('showShadow')) param[i].showShadow = true;
                    delete param[i].app;
                    xjs.load(param[i]).then(function (reslute, key) {
                        this.data[key] = reslute;
                        count += 1;
                        if (count == param.length) dtd.resolve();
                    }.bind(this, name));
                }
            }

            return dtd.promise();
        },
        buildRender: function () {
            this.$domNode.addClass(this.baseClass);
            if (this.templateString) {
                this.domNode.innerHTML = _.template(this.templateString)(this);
            }
            __createNode.call(this) && __createEvent.call(this);
        },
        onExit: function () {
            this.$domNode.off().remove();
        }
    });
    function __createNode() {
        var doms, dom, parents, n, i;
        doms = this.domNode.querySelectorAll('[data-xjs-element]');
        doms = Array.prototype.slice.call(doms);
        for (i = 0; i < doms.length; i++) {
            dom = $(doms[i]);
            parents = dom.parents('[data-xjs-mixin]');
            if (parents.length && parents[0] != this.domNode) break;
            n = dom.data('xjs-element');
            this[n] = ( this['$' + n] = dom ).get(0);
        }
        return true;
    }

    function __createEvent() {
        var doms, dom, parents, n, i;
        doms = this.domNode.querySelectorAll('[data-xjs-event]');
        doms = Array.prototype.slice.call(doms);
        if (this.$domNode.data('xjs-event')) doms.push(this.domNode);
        for (i = 0; i < doms.length; i++) {
            var fns = {}, f, j;
            dom = $(doms[i]);
            parents = dom.parents('[data-xjs-mixin]');

            if (parents.length && parents[0] != this.domNode)
                break;

            n = dom.data('xjs-event');
            f = n.replace(/\s/g, "").split(';').slice(0, -1);
            for (j = 0; j < f.length; j++) {
                var event = f[j].split(':');
                dom.on(event[0], this[event[1]].bind(this));
            }
        }
        return true;
    }
});