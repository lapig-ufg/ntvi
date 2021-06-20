const  dotenv = require('dotenv');
const path = require('path');
dotenv.config({path:path.join(process.cwd(), '/.env')});
import { mongo }  from '../lib/Mongo'

async function run() {
    try {
        await mongo.connect();
        const db = await mongo.db("ntvi")

    } finally {
        await mongo.close();
    }
}

run().catch(e => console.dir(e,{ depth: Infinity }));