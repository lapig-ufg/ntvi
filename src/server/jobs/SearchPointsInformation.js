import { GoogleEarthEngine } from '../libs/GoogleEarthEngine';
const { PrismaClient } = require('@prisma/client')

export default {
    key: 'SearchPointsInformation',
    options: {
        delay: 1000,
    },
    async handle(job, done) {
        const { data } = job

        try {
            const prisma = new PrismaClient()
            const engine = new GoogleEarthEngine(data.campaign);

            job.progress(10);

            const promisePoints = new Promise((resolve, reject) => {
                engine.run(function (){
                    let result = engine.pointsInfo(data.points)
                    result.getInfo((result, error) => {
                        if(error){
                            reject(new Error(error));
                            engine.ee.reset();
                        } else {
                            job.progress(40);
                            resolve(result);
                            engine.ee.reset();
                        }
                    })

                },  (err) => {
                    reject(new Error(err));
                    engine.ee.reset();
                },  (err) => {
                    reject(new Error(err));
                    engine.ee.reset();
                });
            });

            promisePoints.then( result => {
                if(result.features.length > 0) {
                    let arrayQueries = []
                    result.features.forEach((feature) => {
                        let id, region = null;
                        id = feature.properties.point_id
                        if(feature.region !== null){
                            region = feature.region.properties.ADM2_NAME + ' - ' + feature.region.properties.ADM1_NAME + ' - ' + feature.region.properties.ADM0_NAME;
                        } else{
                            region = ' - ';
                        }
                        arrayQueries.push(prisma.point.update({
                            where: { id: id },
                            data: { info: region },
                        }))

                    });
                    job.progress(70);
                    prisma.$transaction(arrayQueries).then(result => {
                        if(result){
                            job.progress(100);
                            done();
                        }
                    }).catch(error => {
                        done(new Error(error));
                    })
                }
            }).catch(error => {
                done(new Error(error));
            });

        } catch (e) {
            done(new Error(e));
        }

    },
};