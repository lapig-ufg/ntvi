import { mongo }  from '../libs/Mongo';
import { Planet }  from '../libs/Planet';
import file from '../libs/util/File';
import string from '../libs/util/String';
const { spawn } = require('child_process');
const path = require('path');
const moment  = require('moment');
const base = require('app-root-path');

export default {
    key: 'Cache',
    options: {
        delay: 900,
    },
    async handle(job, done) {
        const { data } = job

        try {
            await mongo.connect();
            const db             = await mongo.db(process.env.MONGO_DATABASE);
            const imgDir         = process.env.NODE_ENV === 'dev'? base.path + process.env.IMG_DIR : process.env.IMG_DIR;
            const imgDownloadCmd = base.path + process.env.IMG_DOWN_CMD;
            let logs             = [];
            let errors           = [];

            job.progress(10);

            const campaignNameNormalized = string.normalize(data.point.campaign);
            const pointId                = string.normalize(data.point._id)
            const mosaicsPromises        = Promise.all(data.mosaics.map(mosaic => {
                return new Promise((resolve, reject) => {
                    try {

                        const imagePath = path.join(imgDir, campaignNameNormalized, pointId, mosaic._id +'.png');
                        let zoom = 12;

                        if(mosaic._id.includes('PL')){
                            zoom = 14.6;
                        } else if(mosaic._id.includes('S2')){
                            zoom = 13.6;
                        }

                        const child = spawn(imgDownloadCmd, [mosaic.url, data.point.lat + " " +  data.point.lon, zoom, imagePath, mosaic._id]);

                        child.stdout.on('data', (data) => {
                            logs.push("[ " + moment().format('YYYY-MM-DD HH:mm:ss')  + " ]" + " - " +data);
                        });

                        child.stderr.on('data', (data) => {
                            errors.push("[ " + moment().format('YYYY-MM-DD HH:mm:ss')  + " ]" + " - " + data);
                        });

                        child.on('error', (error) => {
                            errors.push("[ " + moment().format('YYYY-MM-DD HH:mm:ss')  + " ]" + " - " +error.message);
                        });

                        child.on('close', (code) => {
                            if(code === 0) {
                                resolve(logs)
                            } else {
                                reject(errors)
                            }
                        });

                    } catch (e) {
                        reject(e)
                    }
                });
            }));

            job.progress(40);

            mosaicsPromises.then((result) => {
                const imageDir = path.join(imgDir, campaignNameNormalized, pointId);
                const promises = Promise.all([file.hasNoImages(imageDir), Planet.createTimesSeriesImage(imageDir)]);
                job.progress(40);
                promises.then(processResult => {
                    job.progress(50);
                    db.collection('points').updateOne({"_id": data.point._id }, {$set : { "cached": true, "images_not_found": processResult[0]}}).then(res => {
                        job.progress(100);
                        done(null, result + res);
                    });
                });
            }).catch(error => {
                console.log(error)
                done(new Error(error));
            });

        } catch (e) {
            done(new Error(e));
        }
    },
};