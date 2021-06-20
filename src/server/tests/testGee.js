import { Landsat } from '../lib/Landsat';
import moment from "moment";
const  dotenv = require('dotenv');
const path = require('path');
dotenv.config({path:path.join(process.cwd(), '/.env')});
// const ee = require('@google/earthengine');
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run(){
  try {
      const campaign = await prisma.campaign.findUnique({
          select: { id: true, name:true, country: true, UsersOnCampaigns: { select : {typeUserInCampaign:true, user: {select:{geeKey:true}}}} },
          where: {id: 1},
      });

      const landsat = new Landsat(campaign);
      const db = await landsat.db()

      console.log(new Date().getTime())

      // landsat.run(function (){
      //     let result = gee.pointsInfo(us.UsersOnCampaigns[3].campaign)
      //     result = result.getInfo()
      //     result.features.map(feat => console.log(feat.properties.region));
      // },  (err) => {
      //     console.log(err);
      // });

  }  catch (e) {
      console.error(e)
  }
}


run().catch(console.error);