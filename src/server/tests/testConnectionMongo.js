const  dotenv = require('dotenv');
dotenv.config({path:'/home/tharles/projects/ntvi/src/server/.env'});
import { mongo }  from '../lib/Mongo'

async function run() {
    try {
        await mongo.connect();
        const db = await mongo.db("ntvi")
        const collections = await db.listCollections().toArray();

        collections.forEach(collection => {
            console.log(collection)
        });

    } finally {
        await mongo.close();
        // Ensures that the client will close when you finish/error
    }
}

run().catch(console.dir);