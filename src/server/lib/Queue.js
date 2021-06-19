import Queue from 'bull';
import redisCredencials from '../config/redis';
import * as jobs from '../jobs';
import Redis from 'ioredis';
const EventEmitter = require( 'events' );
EventEmitter.defaultMaxListeners = 20;

const client = new Redis(redisCredencials);
const subscriber = new Redis(redisCredencials);

const opts = {
    createClient: function (type) {
        switch (type) {
            case 'client':
                return client;
            case 'subscriber':
                return subscriber;
            case 'bclient':
                return new Redis(redisCredencials);
            default:
                throw new Error('Unexpected connection type: ', type);
        }
    }
}

const queues = Object.values(jobs).map(job => ({
    bull: new Queue(job.key, opts),
    name: job.key,
    handle: job.handle,
    options: job.options,
}))

export default {
    queues,
    add(name, data) {
        const queue = this.queues.find(queue => queue.name === name);
        return queue.bull.add(data, queue.options, queue.name);
    },
    process() {
        return this.queues.forEach(queue => {
            queue.bull.process(queue.handle);

            queue.bull.on('completed', (job) => {
                console.log(`Job ${job.id} completed`);
            });

            queue.bull.on('error', (err) => {
                console.log('Jobs errors', err);
            });

            queue.bull.on('failed', (job, err) => {
                console.log(`Job ${job.id} failed => `, err);
            });
        })
    }
};