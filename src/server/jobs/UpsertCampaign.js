import { mongo }  from '../libs/Mongo'
import string from '../libs/util/String';
export default {
    key: 'UpsertCampaign',
    options: {
        delay: 1000,
    },
    async handle(job, done) {
        const { data } = job

        try {
            await mongo.connect();
            const db = await mongo.db(process.env.MONGO_DATABASE);
            job.progress(10);
            //tratamento da string par remover espaçoes em branco transformar em minúsculo e remover os acentos.
            const name = string.normalize(data.name);

            const campaign = {
                "_id": data.id,
                "name": data.name,
                "country": data.country,
                "bands": data.compositions.map((comp) => { return {'bands': comp.colors, 'satellite': comp.satelliteId } }),
                "initialYear": new Date(data.initialDate).getFullYear(),
                "finalYear": new Date(data.finalDate).getFullYear(),
                "password": name +'_' + 'xpto',
                "status": "INCOMPLETE",
                "landUse": data.classes.map((cls) => { return cls.name }).sort((a, b) => { return a.localeCompare(b) }),
                "numInspec": data.numInspectors
            }

            job.progress(30);

            const upsetCampaign = db.collection('campaign').updateOne({'_id': data.id}, { $set: campaign },{ upsert: true })

            job.progress(40);

            upsetCampaign.then( result => {
                if(result){
                    job.progress(100);
                    done(null, result);
                }
            }).catch(error => {
                done(new Error(error));
            });

        } catch (e) {
            done(new Error(e));
        }

    },
};