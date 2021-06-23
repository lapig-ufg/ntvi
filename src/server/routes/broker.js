const { createBullBoard } = require('@bull-board/api')
const { BullAdapter } = require('@bull-board/api/bullAdapter')
const { ExpressAdapter } = require('@bull-board/express')
import Queue from '../libs/Queue';

const serverAdapter = new ExpressAdapter();
const queues = Queue.queues.map(queue =>  new BullAdapter(queue.bull))

serverAdapter.setBasePath('/service/broker')

createBullBoard({
    queues: queues,
    serverAdapter:serverAdapter
})

module.exports = function (app) {
    const JWT = app.middleware.jwt;
    app.use('/service/broker', serverAdapter.getRouter());
}