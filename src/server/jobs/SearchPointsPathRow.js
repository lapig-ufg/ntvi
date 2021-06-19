import { GoogleEarthEngine } from '../lib/GoogleEarthEngine';
import {mongo} from "../lib/Mongo";
const ee = require('@google/earthengine');

export default {
    key: 'SearchPointsPathRow',
    options: {
        delay: 1000,
    },
    async handle(job, done) {
        const { data } = job
        try {
            await mongo.connect();
            const db = await mongo.db(process.env.MONGO_DATABASE);

            const gee = new GoogleEarthEngine(data);

            job.progress(10);

            let points = await db.collection('points').find( {'campaignId': data.id} ).toArray();
            points = points.map((point) => {
                return { _id: point._id, lat: point.lat, lon: point.lon }
            });

            const promisePoints = new Promise((resolve, reject) => {
                gee.run(function (){
                    let result = gee.pointsPathRow(points)
                    result.getInfo((result, error) => {
                        if(error){
                            reject(new Error(error));
                            ee.reset();
                        } else {
                            job.progress(40);
                            resolve(result);
                            ee.reset();
                        }
                    })

                },  (err) => {
                    reject(new Error(err));
                    ee.reset();
                },  (err) => {
                    reject(new Error(err));
                    ee.reset();
                });
            });

            promisePoints.then( result => {
                if(result.features.length > 0) {
                    let arrayQueries = []
                    result.features.forEach((feature) => {
                        arrayQueries.push({ updateOne : {
                            "filter" : { "_id" : feature.properties._id },
                            "update" : { $set : { "path" : feature.properties.path, "row" : feature.properties.row } }
                        } })
                    });
                    job.progress(70);
                    db.collection('points').bulkWrite(arrayQueries, { ordered : true } ).then(result => {
                        if(result){
                            job.progress(100);
                            done();
                        }
                    }).catch(error => {
                        done(new Error(error));
                    });
                }
            }).catch(error => {
                done(new Error(error));
            });

        } catch (e) {
            done(new Error(e));
        }

    },
};