import "./style.scss"

const rules = {
    mobile: {
        valid: (e) => {
            return (e = trim(e)) && /^1[356987][0-9]{9}$/.test(e)
        },
        error: "您输入的手机号码有误，请输入11位手机号码"
    },
    password: {
        valid: (e) => {
            return (e = trim(e)) && /^[^\s]{6,20}$/i.test(e)
        },
        error: "您输入的密码有误，请输入6~20位密码"
    },
    smscode: {
        valid: (e) => {
            return (e = trim(e)) && /^\d{4}$/i.test(e)
        },
        error: "您输入的验证码有误，请输入4位验证码"
    },
    cncheck: {
        valid: (e) => {
            return (e = trim(e)) && /.*[\u4e00-\u9fa5]+.*$/.test(e)
        },
        error: "请输入中文"
    },
    idcard: {
        valid: (e) => {
            let n, t;
            return e = trim(e),
                n = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{2}(\d|x)$/i,
                t = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}(\d|x)$/i,
            e && (n.test(e) || t.test(e))
        },
        error: "您输入的身份证号码有误"
    },
    mail: {
        valid: (e) => {
            return (e = trim(e)) && /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(e)
        },
        error: "您输入的邮箱地址有误"
    },
    isNotEmpty: {
        valid: (e) => {
            return null !== e && e !== undefined && "" !== e
        },
        error: "此项为必填，不能留空"
    },
    isNumber: {
        valid: (e) => {
            return !isNaN(e)
        },
        error: "请输入数字"
    }
};

function trim(str) {
    return str.replace(/\s/g, "");
}

function addClass(el, className) {
    let space = el.className.length == 0 ? "" : " ";
    if (el.className.indexOf(className) >= 0) {
        return;
    } else {
        el.className += space + className;
    }
}

function removeClass(el, className) {
    let reg = eval(`/(\\s?)${className}(\\s?)/`);
    let index = el.className.indexOf(className);
    let match = reg.exec(el.className);
    let space;

    if (match != null && match[1].length == 1 && match[2].length == 1) {
        space = " ";
    } else {
        space = "";
    }
    if (index >= 0) {
        el.className = el.className.replace(reg, space);
    }
}

function showError(el, error) {
    let dialog = el.nextElementSibling;

    dialog.innerHTML = error;

    addClass(el, "error");
    removeClass(el, "success");

    addClass(dialog, "error");
    removeClass(dialog, "success");
}

function hideError(el) {
    let dialog = el.nextElementSibling;

    removeClass(el, "error");
    addClass(el, "success");

    removeClass(dialog, "error");
    addClass(dialog, "success");
}

function submit(e) {
    e.preventDefault();
    let target = forms.find(obj => obj.el === e.target);
    let valid = true;
    let {context, binding} = target;

    target.child.forEach(child => {
        if (!child.rule.valid(child.el.value)) {
            valid = false;
            showError(child.el, child.rule.error);
        }
    });

    if (valid) {
        context[binding.value]();
    }
}

const forms = [];

export default {
    install(turbine) {
        turbine.directive('validate', {
            bind: (el, binding, vNode) => {
                if (binding.args === "submit") {
                    forms.push({
                        el,
                        binding,
                        context: vNode.context,
                        child: []
                    });
                    return el.addEventListener('submit', submit);
                }

                let rule = rules[binding.args];

                if (rule == undefined) {
                    return console.warn("validate couldn't find " + binding.args + ", please check if you have ever register it");
                }

                forms.forEach(obj => {
                    obj.el.hasChildNodes(el) && obj.child.push({el, rule})
                });

                el.addEventListener('input', () => {
                    if (!rule.valid(el.value)) {
                        showError(el, rule.error);
                    } else {
                        hideError(el);
                    }
                })
            },
            unbind: (el, binding) => {
                if (binding.args === "submit") {
                    let index = forms.findIndex(obj => obj.el === el);

                    forms[index].el.removeEventListener("submit", submit);
                    forms.splice(index, 1);
                } else {
                    forms.forEach(obj => {
                        obj.child.forEach((child, index) => {
                            if (child.el === el) {
                              obj.child.splice(index, 1);
                            }
                        });
                    });
                }
            }
        });
    }
}