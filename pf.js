/*jslint node: true, nomen: true */

'use strict';

var dsl = require('./');

var pf = dsl
    .methods(['curry'])
    .call(function (fn) {
        if (!this._fn) {
            return {_fn: fn};
        }
        console.log('rawrrr!', this._actions);
    })
    .done();

pf.curry('foo').curry('bar')('hello');
