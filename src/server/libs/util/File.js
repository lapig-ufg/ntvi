const fs = require('fs');

export default {
    read(path, encoding = 'utf8')  {
        return new Promise((resolve, reject) => {
            let readStream = fs.createReadStream(path, encoding);
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
            fs.writeFile(path, contents, (err, data) => {
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
            fs.unlink(path, err => {
                if(!err) {
                    resolve(path);
                } else {
                    reject(err);
                }
            });
        });
    },
    hasNoImages(dir) {
        let images = [];
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (error, files) => {
                if (error) {
                    reject(error);
                } else {
                    files.forEach(file => {
                        const stats = fs.statSync(dir + "/" + file)
                        if (stats.size <= 1300) {
                           images.push(file.slice(0, -4))
                        }
                    })
                    resolve(images);
                }
            });
        });
    },
    files(dir) {
        return new Promise((resolve, reject) => {
            fs.readdir(dir, (error, files) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(files);
                }
            });
        });
    },
    size(path) {
        return new Promise((resolve, reject) => {
            fs.stat(path, (error, stats) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stats.size);
                }
            });
        });
    },
    exists(path) {
        return new Promise((resolve, reject) => {
            fs.access(path, fs.constants.F_OK, err => {
                if(!err) {
                    resolve(true);
                } else {
                    reject(err);
                }
            });
        });
    }
}