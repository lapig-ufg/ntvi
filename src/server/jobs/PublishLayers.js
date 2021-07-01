import { Landsat } from "../libs/Landsat";
import { Sentinel } from "../libs/Sentinel";
const moment = require("moment-timezone");

export default {
    key: 'PublishLayers',
    options: {
        delay: 1000,
        repeat: {
            cron: '10 22 * * *', // run every day at 22:10 until end date.
            tz: process.env.JOBS_TIME_ZONE,
            startDate: moment().tz(process.env.JOBS_TIME_ZONE).format(),
            endDate: moment().tz(process.env.JOBS_TIME_ZONE).add(15, 'days').format()
        }
    },
    async handle(job, done) {
        const { data } = job

        try {
            job.progress(10);

            const landsat = new Landsat(data);
            const sentinel = new Sentinel(data);

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