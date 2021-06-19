'use strict';

const path = require('path');
const fs = require('fs');
const ABSINTHE = path.dirname(process.mainModule.filename);

module.exports = function (app) {
    let Files = {};

    Files.read = function(path, encoding = 'utf8')  {
        return new Promise((resolve, reject) => {
            let readStream = fs.createReadStream(ABSINTHE + path, encoding);
            let data = '';

            readStream.on('data', chunk => {
                data += chunk;
            }).on('end', () => {
                resolve(data);
            }).on('error', err => {
                reject(err);
            });
        });
    }

    Files.create = function(path, contents) {
        return new Promise((resolve, reject) => {
            fs.writeFile(ABSINTHE + path, contents, (err, data) => {
                if(!err) {
                    resolve(data);
                } else {
                    reject(err);
                }
            });
        });
    }

    Files.remove = function(path) {
        return new Promise((resolve, reject) => {
            fs.unlink(ABSINTHE + path, err => {
                if(!err) {
                    resolve(path);
                } else {
                    reject(err);
                }
            });
        });
    }

    Files.exists = function(path) {
        return new Promise((resolve, reject) => {
            fs.access(ABSINTHE + path, fs.constants.F_OK, err => {
                if(!err) {
                    resolve(true);
                } else {
                    reject(err);
                }
            });
        });
    }

    return Files;
}