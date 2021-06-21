const path = require('path');
const fs = require('fs');
const ABSINTHE = path.dirname(process.mainModule.filename);

export default {
    read(path, encoding = 'utf8')  {
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
    },
    create(path, contents) {
        return new Promise((resolve, reject) => {
            fs.writeFile(ABSINTHE + path, contents, (err, data) => {
                if(!err) {
                    resolve(data);
                } else {
                    reject(err);
                }
            });
        });
    },
    remove(path) {
        return new Promise((resolve, reject) => {
            fs.unlink(ABSINTHE + path, err => {
                if(!err) {
                    resolve(path);
                } else {
                    reject(err);
                }
            });
        });
    },
    exists(path) {
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
}