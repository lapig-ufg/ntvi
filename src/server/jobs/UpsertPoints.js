import { mongo }  from '../lib/Mongo'

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
            let counter = 0;
            const points = data.points.map((point) => {
                return {
                    "pgId": point.id,
                    "campaignId": data.campaign.id,
                    "campaign": data.campaign.name,
                    "lon": point.longitude,
                    "lat": point.latitude,
                    "dateImport": new Date(),
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

            allOperations.then( result => {
                if(result){
                    job.progress(100);
                    done();
                }
            }).catch(error => {
                done(new Error(error));
            });

        } catch (e) {
            done(new Error(e));
        }

    },
};