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
                    if (camp !== undefined && camp.customURLs !== undefined) {
                        resolve(camp.customURLs);
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
            CacheMaker.prototype.mosaics = mosaics.map(mosaic => {
                return mosaic['wms'] = this.wmsXmlResponse(mosaic)
            });
        }).catch(console.error)

    }

    wmsXmlResponse(mosaic) {
        return "\
            <GDAL_WMS> \n\
                <Service name=\"TMS\"> \n\
                    <ServerUrl>"+mosaic.url+"</ServerUrl> \n\
                </Service> \n\
                <DataWindow> \n\
                    <UpperLeftX>-20037508.34</UpperLeftX> \n\
                    <UpperLeftY>20037508.34</UpperLeftY> \n\
                    <LowerRightX>20037508.34</LowerRightX> \n\
                    <LowerRightY>-20037508.34</LowerRightY> \n\
                    <TileLevel>20</TileLevel> \n\
                    <TileCountX>1</TileCountX> \n\
                    <TileCountY>1</TileCountY> \n\
                    <YOrigin>top</YOrigin> \n\
                </DataWindow> \n\
                <Cache> \n\
                    <Expires>1</Expires> \n\
                    <Path>"+process.env.IMG_GDAL_TMP_DIR+"/"+mosaic._id+"_"+mosaic.campaignId+"</Path> \n\
                </Cache> \n\
                <Projection>EPSG:900913</Projection> \n\
                <BlockSizeX>256</BlockSizeX> \n\
                <BlockSizeY>256</BlockSizeY> \n\
                <BandsCount>3</BandsCount> \n\
                <MaxConnections>10</MaxConnections> \n\
                <Cache /> \n\
            </GDAL_WMS>"
    }

    async run() {
        const db     = await this.db();
        const points = await db.collection('points').find({"campaign": this.campaign.id, "cached" : false }).toArray()

        for (let point of points) {
            await Queue.add('Cache', {point: point, mosaics: this.mosaics} )
        }
    }
}