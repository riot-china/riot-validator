var validators = {};

var buildinValidators = [
    {
        name: "required",
        fn: function(val){
            return val.trim() === ""
        }
    },
    {
        name: 'max',
        fn: function(val, expected){
            return parseInt(val.trim(), 10) > expected;
        }
    },
    {
        name: 'min',
        fn: function(val, expected){
            return parseInt(val.trim(), 10) < expected;
        }
    },
    {
        name: 'maxlength',
        fn: function(val, expected){
            return val.length > expected;
        }
    },
    {
        name: 'minlength',
        fn: function(val, expected){
            return val.length < expected;
        }
    },
    {
        name: 'pattern',
        fn: function(val, expected){
            return !(new RegExp(expected)).test(val.trim());
        }
    }
];

/**
 * register build-in validators
 */
buildinValidators.map(function(validator){
    registerValidators(validator.name, validator.fn);
});

function addForm(f, tag){
    if(!f || !f.attributes || !f.attributes.name || !f.attributes.name.nodeValue){
        throw new Error("form expected a name attribute");
    }
    var formName = f.attributes.name.nodeValue;
    var form = {
        $name: formName,
        $dirty: false,
        $pristine: true,
        $valid: false,
        $invalid: true,
        $submitted: false,
        $error: {
        }
    };
    if(!tag.forms){
        tag.forms = {};
    }
    tag.forms[form.$name] = form;
}

function extractInput(input, tag){
    var rules = Object.keys(input.attributes).map(function(key){
        var ruleName = input.attributes[key].nodeName;
        var validVal = input.attributes[key].nodeValue;
        if(validators[ruleName]){
            return {
                name: ruleName,
                val: validVal
            };
        }
        return false;
    }).filter(function(rule){
        return rule != false;
    });
    if(rules.length){
        rules.forEach(function(rule){
            addFormRule(input, rule, tag);
        });
    }
    var field = tag.forms[input.form.name][input.attributes.name.nodeValue];
    bindEvt(input, field, tag);
}

function addFormRule(input, rule, tag){
    var inputName = input.attributes.name.nodeValue;
    var formField = tag.forms[input.form.name][inputName];
    if(!formField){
        tag.forms[input.form.name][inputName] = {
            $name: inputName,
            $dirty: false,
            $pristine: true,
            $valid: true,
            $invalid: false,
            $error: {},
            $rule: {}
        };
    }
    tag.forms[input.form.name][inputName].$rule[rule.name] = rule.val;
}

function bindEvt(input, field, tag){
    var errorMap = field.$rule;
    input.addEventListener('input', validateHandler);
    function validateHandler(e){
        var val = e.target.value.trim();
        Object.keys(errorMap).forEach(function(eKey){
            var isInvalid = validators[eKey].apply(null, [val, errorMap[eKey]]);
            if(isInvalid){
                setFieldStatusInvalid(field, eKey);
                addClass(input, 'f-invalid-' + eKey);
            }else{
                setFieldStatusValid(field, eKey);
                removeClass(input, 'f-invalid-' + eKey)
            }
        });
        if(Object.keys(field.$error).length > 0){
            removeClass(input, 'f-valid');
            addClass(input, 'f-invalid');
        }else{
            removeClass(input, 'f-invalid');
            addClass(input, 'f-valid');
        }
        tag.update();
    }
    function setFieldStatusInvalid(field, key){
        field.$invalid = true;
        field.$valid = false;
        field.$error[key] = true;
    }
    function setFieldStatusValid(field, key){
        field.$invalid = false;
        field.$valid = true;
        field.$error[key] && delete field.$error[key];
    }
    function hasClass(el, className) {
        if (el.classList)
            return el.classList.contains(className);
        else
            return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
    }

    function addClass(el, className) {
        if (el.classList)
            el.classList.add(className);
        else if (!hasClass(el, className)) el.className += " " + className
    }

    function removeClass(el, className) {
        if (el.classList)
            el.classList.remove(className);
        else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            el.className=el.className.replace(reg, ' ')
        }
    }
}


function initForm(){
    this.on('mount', function(){
        var tag = this;
        walkTheDOM(this.root, function (node) {
            if (node.nodeType === 1) {
                if(node.tagName === 'form'.toUpperCase()){
                    addForm(node, tag);
                }
                if(node.tagName === 'input'.toUpperCase()){
                    extractInput(node, tag);
                }
            }
        });
    })
}

function walkTheDOM(node, func) {
    func(node);
    node = node.firstChild;
    while (node) {
        walkTheDOM(node, func);
        node = node.nextSibling;
    }
}

function registerValidators(name, fn){
    validators[name] = fn;
}

window.form = {
    useForm: initForm
};
