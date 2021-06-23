import { mongo }  from '../libs/Mongo';
import proj from '../libs/Proj';
const { exec } = require('child_process');
const path = require('path');
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
            const imgDir         = base + process.env.IMG_DIR;
            const imgDownloadCmd = base + process.env.IMG_DOWN_CMD;
            const bufferPoint    = proj.buffer(data.point);
            
            job.progress(10);
            
            const mosaicsPromises = data.mosaics.map(mosaic => {
                return new Promise((resolve, reject) => {
                    const imagePath = path.join(imgDir, data.point.campaign, data.point._id, mosaic._id +'.png');
                    const cmd = imgDownloadCmd + ' "' + mosaic.wms + '" "' + bufferPoint + '" ' + imagePath;
                    exec(cmd, (error, stdout, stderr) => {
                        if (error) {
                           reject(stderr)
                        }
                        resolve(stdout)
                    });
                });
            });
            
            job.progress(40);

            mosaicsPromises.then((result) => {
              db.collection('points').updateOne({"_id": data.point._id }, {$set : { "cached": true }}).then(res => {
                  job.progress(100);
                  done(null, result);
              });
            }).catch(error => {
                done(error);
            });

        } catch (e) {
            done(e);
        }

    },
};