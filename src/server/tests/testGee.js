import { GoogleEarthEngine } from '../lib/GoogleEarthEngine.js';
const  dotenv = require('dotenv');
dotenv.config({path:'/home/tharles/projects/ntvi/src/server/.env'});
const ee = require('@google/earthengine');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

prisma.user.findUnique({
    select: { geeKey: true, UsersOnCampaigns: {select: { campaign: { select: { points: true, country: true}} }} },
    where: {id: 1},
}).then(function (us) {
    const gee = new GoogleEarthEngine(us.geeKey);
    gee.run(function (){
        let result = gee.pointsInfo(us.UsersOnCampaigns[3].campaign)
        result = result.getInfo()
        result.features.map(feat => console.log(feat.properties.region));
        // result.features.map(feat => console.log(feat));
    },  (err) => {
        console.log(err);
    });

}).catch(console.error);
