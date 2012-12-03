/*jslint node: true, nomen: true, vars: true, todo: true */

'use strict';

var _ = require('lodash');

var alternates = {
    'break': 'interupt', // breach fault escape
    'case': 'match', // 
    'catch': 'grab', // snatch seize
    'class': 'struct', //
    'continue': 'proceed', // keepOn keepGoing
    'debugger': 'debug',
    'default': 'fallback', // defaults
    'delete': 'remove', // erase
    'do': 'go', // perform act
    'else': '',
    'enum': '',
    'export': '',
    'extends': '',
    'finally': '',
    'for': '',
    'function': '',
    'if': '',
    'implements': '',
    'import': '',
    'in': '',
    'instanceof': '',
    'interface': '',
    'let': '',
    'new': '',
    'package': '',
    'private': '',
    'protected': '',
    'public': '',
    'return': '',
    'static': '',
    'super': '',
    'switch': '',
    'this': '',
    'throw': '',
    'try': '',
    'typeof': '',
    'var': '',
    'void': '',
    'while': '',
    'with': '',
    'yield': ''
};

/**
 * @struct dsl {
 *     {Array} _actions
 *     {Boolean} _prototype
 * }
 */
/*
dsl(lang)
    .action(...)
    .methods
    .delMethods
    .delCallable
    .fakeArray(fn)
    .notArray()
*/

function dsl(actions) {
    var obj = Object.create(dsl.prototype);
    obj._actions = actions || [];
    return obj;
}

['methods', 'call'].forEach(function (key) {
    dsl[key] = function () {
        var inst = dsl();
        return inst[key].apply(inst, arguments);
    };
    dsl.prototype[key] = function () {
        return dsl(this._actions.concat([[key, _.toArray(arguments)]]));
    };
});

dsl.prototype.done = function () {
    /**
     * Methods for DSL
     */
    var methods = this._actions.filter(function (a) {
        return a[0] === 'methods';
    }).reduce(function (a, b) {
        return a.concat(b[1][0]);
    }, []);

    /**
     * Callable methods
     */
    var method_fns = this._actions.filter(function (a) {
        return a[0] === 'call' && typeof a[1][0] !== 'function';
    });

    /**
     * Is this DSL callable?  If it is, it makes our code a less efficient,
     * because we can't do object delegation with functions.
     */
    var callable = _.find(this._actions, function (a) {
        return a[0] === 'call' && typeof a[1][0] === 'function';
    });
    if (callable) {
        callable = callable[1][0];
    }

    var create, prototype = {};

    if (callable) {
        create = function (opts) {
            var obj = function () {
                return callable.apply(obj, arguments);
            };
            _.extend(obj, prototype, opts);
            obj._actions = obj._actions || [];
            // @TODO Gross, replace with dsl(lang).action(...).done();
            obj._addAction = function () {
                return create({
                    _actions: this._actions.concat(_.toArray(arguments))
                });
            };
            // console.log('actions', obj._actions);

            return obj;
        };
    } else {
        throw new Error('@TODO non-callable DSL');
    }

    methods.forEach(function (method) {
        prototype[method] = function () {
            return create({
                _actions: this._actions.concat([[method, _.toArray(arguments)]])
            });
        };
    });

    method_fns.map(function (callable) {
        return callable[1];
    }).forEach(function (callable) {
        var method = callable[0], fn = callable[1];
        prototype[method] = fn;
    });

    // console.log('rwarr!!!', this, prototype);
    return create();
};

module.exports = dsl;
