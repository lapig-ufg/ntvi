const { PrismaClient } = require('@prisma/client')
import { mongo } from "./Mongo";
import Queue from '../libs/Queue';

export class CacheMaker {
    constructor(campaign) {
        CacheMaker.prototype.campaign = campaign;
        CacheMaker.prototype.prisma = new PrismaClient();
        this.finMosaics();
    }

    async db() {
        await mongo.connect();
        return await mongo.db(process.env.MONGO_DATABASE);
    }

    finMosaics() {
        const promise =  new Promise( async (resolve, reject) => {
            try {
                const db = await this.db();
                db.collection('campaign').findOne({ "_id": this.campaign.id }).then(camp => {
                    if (camp.hasOwnProperty('customURLs')) {
                      if(camp.customURLs.length > 0){
                          resolve(camp.customURLs);
                      }
                    } else {
                        const mosaics = db.collection('mosaics').find({"campaignId": this.campaign.id }).toArray()
                        if(mosaics !== undefined || true) {
                            resolve(mosaics);
                        } else {
                            reject('Mosaic not found')
                        }
                    }
                })
            } catch (e) {
                reject(e);
            }
        })

        promise.then(mosaics => {
            CacheMaker.prototype.mosaics = mosaics;
        }).catch(console.error)

    }

    async run() {
        const db     = await this.db();
        const points = await db.collection('points').find({"campaignId": this.campaign.id, "cached" : false }).limit(1).toArray()
        setTimeout(async () => {
            // await Queue.add('Cache', { point: points[0], mosaics: this.mosaics} )
            for (let point of points) {
                await Queue.add('Cache', { point: point, mosaics: this.mosaics} )
            }
        }, 2000);
    }
}