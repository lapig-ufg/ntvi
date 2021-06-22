import { Landsat } from "../lib/Landsat";
import { Sentinel } from "../lib/Sentinel";

export default {
    key: 'GenerateCache',
    options: {
        delay: 1000,
    },
    async handle(job, done) {
        const { data } = job

        try {
            job.progress(10);

            const landsat = new Landsat(data);
            const sentinel = new Sentinel(data);

            job.progress(30);

            const promises = Promise.all([landsat.publishLayers(), sentinel.publishLayers()])

            job.progress(60);

            promises.then( result => {
                job.progress(100);
                done(null, result);
            }).catch(error => {
                done(new Error(error));
            });

        } catch (e) {
            done(new Error(e));
        }

    },
};