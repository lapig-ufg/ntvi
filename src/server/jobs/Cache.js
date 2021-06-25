import { mongo }  from '../libs/Mongo';
import proj from '../libs/Proj';
const { spawn } = require('child_process');
const path = require('path');
const moment  = require('moment');
const base = path.dirname(process.mainModule.filename);

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
            const imgDir         = process.env.NODE_ENV === 'dev'? base + process.env.IMG_DIR : process.env.IMG_DIR;
            const imgDownloadCmd = base + process.env.IMG_DOWN_CMD;
            const bufferPoint    = proj.buffer(data.point);
            
            job.progress(10);
            let logs = []
            let erros = [];
            const campaignNormalized = data.point.campaign.replace(/\s+/g, '_').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const mosaicsPromises = Promise.all(data.mosaics.map(mosaic => {
                return new Promise((resolve, reject) => {
                    const imagePath = path.join(imgDir, campaignNormalized, data.point._id, mosaic._id +'.png');
                    // const cmd = imgDownloadCmd + ' "' + mosaic.wms + '" "' + bufferPoint + '" ' + imagePath;
                    const args = ["'"+ mosaic.wms + "'", "'"+ bufferPoint + "'",  imagePath];

                    const child = spawn(imgDownloadCmd, args);

                    child.stdin.on('data', data => {
                        console.log("[ " + moment().format('YYYY-MM-DD HH:mm:ss')  + " ]" + " - " + data)
                    });

                    child.stdout.on('data', data => {
                        logs.push("[ " + moment().format('YYYY-MM-DD HH:mm:ss')  + " ]" + " - " + data);
                        // console.log("[ " + moment().format('YYYY-MM-DD HH:mm:ss')  + " ]" + " - " + data)
                    });

                    child.on('error', (error) => {
                        erros.push("[ " + moment().format('YYYY-MM-DD HH:mm:ss')  + " ]" + " - " + error.message);
                        console.log("[ " + moment().format('YYYY-MM-DD HH:mm:ss')  + " ]" + " - " + error.message)
                    });

                    child.on('close', (code) => {
                        if(code === 0){
                            resolve(logs)
                        }else {
                            reject(erros)
                        }
                    });
                });
            }));
            
            job.progress(40);

            mosaicsPromises.then((result) => {
              db.collection('points').updateOne({"_id": data.point._id }, {$set : { "cached": true }}).then(res => {
                  job.progress(100);
                  done(null, result);
              });
            }).catch(error => {
                console.log(error)
                done(error);
            });

        } catch (e) {
            done(e);
        }

    },
};