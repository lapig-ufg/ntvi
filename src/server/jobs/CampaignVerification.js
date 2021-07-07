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

            const pontos = db.collection('campaign').aggregate([
                {
                    $lookup: {
                        from: "points",
                        localField: "_id",
                        foreignField: "campaignId",
                        as: "points"
                    },
                },
                {
                    "$project": {
                        "_id": 1,
                        "status": 1,
                        "noCache": {
                            $size: {
                                $filter: {
                                    input: "$points",
                                    as: "point",
                                    cond: {$eq: ["$$point.cached", false]}
                                }
                            }
                        },
                        "hasCache": {
                            $size: {
                                $filter: {
                                    input: "$points",
                                    as: "point",
                                    cond: {$eq: ["$$point.cached", true]}
                                }
                            }
                        },
                        "totalPoints": {$size: "$points"}
                    }
                },
                { $sort : { _id : 1 } }
            ]);
            const promises = [];

            await pontos.forEach( pto =>  {
               if(pto.status === 'INCOMPLETE' && pto.hasCache === pto.totalPoints){
                   promises.push(prisma.campaign.update({
                       where: { id: parseInt(pto._id) },
                       data: {
                           status: 'READY',
                       }
                   }));
                   promises.push(db.collection('campaign').updateOne({_id: pto._id}, {$set: {status: 'READY'}}))
               }
            })
            const allPromises = Promise.all(promises);

            allPromises.then(re =>{
                if(re) {
                    done(re);
                }else {
                    done(new Error('error on campaign verification'));
                }
            }).catch(e => {
                done(new Error(e));
            })

        } catch (e) {
            done(new Error(e));
        }

    },
};