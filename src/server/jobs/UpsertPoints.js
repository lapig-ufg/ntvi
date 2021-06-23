import { mongo }  from '../libs/Mongo'
import Queue from '../libs/Queue';
import moment from "moment";


export default {
    key: 'UpsertPoints',
    options: {
        delay: 1000,
    },
    async handle(job, done) {
        const { data } = job

        try {
            await mongo.connect();
            const db = await mongo.db(process.env.MONGO_DATABASE);

            job.progress(10);

            let counter = 1;
            const name = data.campaign.name.replace(/\s+/g, '_').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const points = data.points.map((point) => {
                return {
                    "_id": counter + '_' +  name,
                    "pgId": point.id,
                    "campaignId": data.campaign.id,
                    "campaign": data.campaign.name,
                    "lon": point.longitude,
                    "lat": point.latitude,
                    "dateImport": moment().toISOString(true),
                    "biome": '',
                    "uf": '',
                    "county": point.info,
                    "countyCode": '',
                    "path": '',
                    "row": '',
                    "userName": [],
                    "inspection" : [],
                    "underInspection": 0,
                    "index": counter++,
                    "cached": false,
                    "enhance_in_cache": 1
                }
            });

            job.progress(40);

            const deletePoints = db.collection('points').deleteMany( {'campaignId': data.campaign.id} );
            const upsertPoints = db.collection('points').insertMany(points)
            const allOperations = Promise.all([deletePoints, upsertPoints])

            job.progress(60);

            allOperations.then( async (result) => {
                if(result[1].insertedCount === points.length){
                    await Queue.add('SearchPointsPathRow', data.campaign )
                    job.progress(100);
                    done();
                } else{
                    done(new Error('Can not insert all documents: ' + result[1]));
                }
            }).catch(error => {
                done(new Error(error));
            });

        } catch (e) {
            done(new Error(e));
        }

    },
};