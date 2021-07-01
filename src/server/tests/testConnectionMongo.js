const  dotenv = require('dotenv');
const path = require('path');
dotenv.config({path:path.join(process.cwd(), '/.env')});
import { mongo }  from '../libs/Mongo'

async function run() {
    try {
        await mongo.connect();
        const db = await mongo.db("ntvi")

       const pontos = db.collection('campaign').aggregate([
            {
                $lookup: {
                    from: "points",
                    localField: "_id",
                    foreignField: "campaignId",
                    as: "points"
                },
            },
           { "$unwind": "$points" }
       ]);+

       await pontos.forEach(pto => {
            console.log(pto)
       })

    } finally {
        await mongo.close();
    }
}

run().catch(e => console.dir(e,{ depth: Infinity }));