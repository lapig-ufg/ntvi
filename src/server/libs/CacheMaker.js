const { PrismaClient } = require('@prisma/client')
import { mongo } from "./Mongo";
import file from './File';

export class CacheMaker {
    constructor(campaign) {
        CacheMaker.prototype.campaign = campaign;
        CacheMaker.prototype.prisma = new PrismaClient();
    }

    async db() {
        await mongo.connect();
        return await mongo.db(process.env.MONGO_DATABASE);
    }

}