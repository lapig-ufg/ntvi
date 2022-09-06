const path = require('path');
const appRoot = require('app-root-path');
const envs = require('dotenv').config({path: path.join(appRoot.path, '/.env')});
const dotenvExpand = require('dotenv-expand');

dotenvExpand(envs)

import {mongo} from '../libs/Mongo'

async function run() {
    try {
        await mongo.connect();
        const db = await mongo.db("ntvi")

        // const pontos = db.collection('campaign').aggregate([
        //     {
        //         $lookup: {
        //             from: "points",
        //             localField: "_id",
        //             foreignField: "campaignId",
        //             as: "points"
        //         },
        //     },
        //     {
        //         "$project": {
        //             "_id": 1,
        //             "status": 1,
        //             "noCache": {
        //                 $size: {
        //                     $filter: {
        //                         input: "$points",
        //                         as: "point",
        //                         cond: {$eq: ["$$point.cached", false]}
        //                     }
        //                 }
        //             },
        //             "hasCache": {
        //                 $size: {
        //                     $filter: {
        //                         input: "$points",
        //                         as: "point",
        //                         cond: {$eq: ["$$point.cached", true]}
        //                     }
        //                 }
        //             },
        //             "totalPoints": {$size: "$points"}
        //         }
        //     },
        //     { $sort : { _id : 1 } }
        // ]);
        const pontos = db.collection('points').aggregate(
            [
                { $match: { index: 3, campaignId : 3 } },
                {
                    $lookup: {
                        from: "mosaics",
                        localField: "campaignId",
                        foreignField: "campaignId",
                        as: "mosaics"
                    },
                },
                { $unwind : "$mosaics" },
                {$sort: {index: 1}}
            ]
        );

        await pontos.forEach(pto => {
            console.log(pto)
        })

    } finally {
        await mongo.close();
    }
}

run().catch(e => console.dir(e, {depth: Infinity}));