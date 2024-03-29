import { CacheMaker, Landsat, Sentinel, Planet } from '../libs';
import Queue from "../libs/Queue";
const path = require('path');
const envs = require('dotenv').config({path:path.join(process.cwd(), '/.env')});
const dotenvExpand = require('dotenv-expand');
dotenvExpand(envs)
const EventEmitter = require( 'events' );
EventEmitter.defaultMaxListeners = parseInt(process.env.DEFAULT_MAX_LISTENERS);


const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run(){
  try {

      const campaign = await prisma.campaign.findUnique({
          select: { id: true, name:true, initialDate: true, finalDate:true, compositions: true, country: true, UsersOnCampaigns: { select : {typeUserInCampaign:true, user: {select:{geeKey:true}}}} },
          where: {id: 3},
      });

      const landsat    = new Landsat(campaign);
      const sentinel   = new Sentinel(campaign);
      const planet     = new Planet(campaign);
      // const cacheMaker = new CacheMaker(campaign);
      // await cacheMaker.run();

      const promises = Promise.all([landsat.publishLayers(), sentinel.publishLayers(), planet.publishLayers()]);
      // const promises = Promise.all([planet.publishLayers()])

      promises.then(async result => {
          console.log(result)
          // await Queue.add('SearchMosaicsDates', campaign )
      }).catch(error => {
          console.error(error)
      });

  }  catch (e) {
      console.error(e)
  }
}


run().catch(console.error);