import { Landsat } from "../libs/Landsat";
import { Sentinel } from "../libs/Sentinel";

import Queue from '../libs/Queue';
import {CacheMaker} from "../libs/CacheMaker";
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
            const sentinel   = new Sentinel(data);
            const cacheMaker = new CacheMaker(data);

            const promises = Promise.all([landsat.publishLayers(), sentinel.publishLayers()])

            job.progress(60);

            promises.then(async result => {
                job.progress(100);

                await Queue.add('PublishLayers', data )
                await cacheMaker.run();

                done(null, result);

            }).catch(error => {
                done(new Error(error));
            });

        } catch (e) {
            done(new Error(e));
        }

    },
};