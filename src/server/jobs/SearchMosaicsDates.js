import { Landsat } from "../libs/Landsat";
import Queue from '../libs/Queue';
import {CacheMaker} from "../libs/CacheMaker";
import { mongo }  from '../libs/Mongo'
export default {
    key: 'SearchMosaicsDates',
    options: {
        delay: 1000,
    },
    async handle(job, done) {
        const { data } = job

        try {
            await mongo.connect();
            job.progress(10);

            const landsat    = new Landsat(data);
            const cacheMaker = new CacheMaker(data);
            const db         = await mongo.db(process.env.MONGO_DATABASE);
            const promise    = landsat.getMosaicsDates();

            job.progress(60);

            promise.then(async result => {
                job.progress(100);

                await Queue.add('PublishLayers', data )
                await cacheMaker.run();
                await db.collection('campaign').updateOne({'_id': data.id}, { $set: {"status": "CACHING"} }, { upsert: true });

                done(null, result);

            }).catch(error => {
                done(new Error(error));
            });

        } catch (e) {
            done(new Error(e));
        }

    },
};