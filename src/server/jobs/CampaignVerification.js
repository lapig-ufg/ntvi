const { PrismaClient } = require('@prisma/client')
import { mongo }  from '../libs/Mongo'

export default {
    key: 'CampaignVerification',
    options: {
        delay: 1000,
        repeat: {
            cron: '*/15 * * * *', // run at every 15th minute.
            tz: process.env.JOBS_TIME_ZONE,
        }
    },
    async handle(job, done) {
        await mongo.connect();
        const { data } = job
        const prisma   = new PrismaClient();
        const db       = await mongo.db(process.env.MONGO_DATABASE);

        try {
            job.progress(10);



        } catch (e) {
            done(new Error(e));
        }

    },
};