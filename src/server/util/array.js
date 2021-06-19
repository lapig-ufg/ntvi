'use strict';
module.exports = function (app) {
    let array = {};
    array.split = function(array, numElements = 100)  {
        return new Array(Math.ceil(array.length / numElements)).fill().map(_ => array.splice(0, numElements))
    }
    return array;
}