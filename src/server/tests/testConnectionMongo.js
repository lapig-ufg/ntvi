const  dotenv = require('dotenv');
const path = require('path');
dotenv.config({path:path.join(process.cwd(), '/.env')});
import { mongo }  from '../libs/Mongo'
const moment = require("moment-timezone");

async function run() {
    try {
        await mongo.connect();
        const db = await mongo.db("ntvi")
        console.log(moment().tz(process.env.JOBS_TIME_ZONE).add(15, 'days').format())

    } finally {
        await mongo.close();
    }
}

run().catch(e => console.dir(e,{ depth: Infinity }));