import { mongo }  from '../libs/Mongo';
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

            const campaignNameNormalized = data.point.campaign.replace(/\s+/g, '_').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const mosaicsPromises = Promise.all(data.mosaics.map(mosaic => {
                return new Promise((resolve, reject) => {
                    try {
                        const imagePath = path.join(imgDir, campaignNameNormalized, data.point._id, mosaic._id +'.png');
                        const zoom = mosaic._id.includes('COPERNICUS_S2_SR') ? 15 : 12;
                        const child = spawn(imgDownloadCmd, [mosaic.url, data.point.lat + " " +  data.point.lon, zoom, imagePath]);

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
                            console.log(code)
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
              db.collection('points').updateOne({"_id": data.point._id }, {$set : { "cached": true }}).then(res => {
                  job.progress(100);
                  done(null, result + res);
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