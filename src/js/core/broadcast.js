var sequence = {};

var broadcast = function (conf) {
    var self = this;
    if (this instanceof broadcast) {
        if (conf instanceof Array) {
            conf.forEach(function (v) {
                broadcast[v,method].call(self, v.name, v.assignee, v.fn);
            });
        } else {
            broadcast[conf.method].call(this, conf.name, conf.assignee, conf.fn);
        }
    } else {
        return new broadcast(conf);
    }
};

broadcast.add = function(name, assignee, fn) {
    var target = sequence[name];

    if (target !== undefined) {
        target.members.forEach(function (member) {
            if (member.assignee == assignee)
                throw "'" + assignee + "' already existed in '" + name + "' event"
        });
        target.members.push({assignee: assignee, fn: fn});
    } else {
        sequence[name] = {
            members: [{assignee: assignee, fn: fn}]
        };
    }
};

broadcast.trigger = function(name) {
    var params = [].slice.call(arguments, 1, arguments.length);
    var target = sequence[name];

    if (target == undefined) {
        return console.warn(name + " event has not to been addition yet");
    }

    target.members.forEach(function (member) {
        setTimeout(function () {
            member.fn.apply(null, params);
        }, 0);
    });
};

broadcast.remove = function(name, assignee) {
    var target = sequence[name];

    if (target !== undefined) {
        target.members.forEach(function (member, index) {
            if (member.assignee == assignee)
                target.members.splice(index, 1);
        });
    } else {
        target.members = [];
    }
};

broadcast.prototype = broadcast.prototype.constructor;

export default broadcast;
