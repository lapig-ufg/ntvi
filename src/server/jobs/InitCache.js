import Queue from '../libs/Queue';
const { PrismaClient } = require('@prisma/client')
export default {
    key: 'InitCache',
    options: {
        delay: 1000,
    },
    async handle(job, done) {
        const { data } = job

        try {
            job.progress(10);

            const promises   = Promise.all([])

            job.progress(60);

            promises.then(async result => {
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
