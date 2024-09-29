import { Landsat, Planet, Sentinel } from "../libs";
import Queue from '../libs/Queue';

export default {
    key: 'InitCache',
    options: {
        delay: 1000,
    },
    async handle(job, done) {
        const { data } = job

        try {
            job.progress(10);

            const landsat    = new Landsat(data);
            const planet     = new Planet(data);
            const sentinel   = new Sentinel(data);
            const promises   = Promise.all([landsat.publishLayers(), planet.publishLayers(), sentinel.publishLayers()])

            job.progress(60);

            promises.then(async result => {
                job.progress(100);
                await Queue.add('SearchMosaicsDates', data )
                done(null, result);
            }).catch(error => {
                done(new Error(error));
            });

        } catch (e) {
            done(new Error(e));
        }

    },
};
