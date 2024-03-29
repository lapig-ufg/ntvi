import { Landsat } from '../libs/Landsat';
import { Sentinel } from '../libs/Sentinel';
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

      const landsat = new Landsat(campaign);
      landsat.publishLayers().then(result => {
          console.log(result)
      }).catch(console.error)

      const sentinel = new Sentinel(campaign);
      sentinel.publishLayers().then(result => {
          console.log(result)
      }).catch(console.error)

  }  catch (e) {
      console.error(e)
  }
}

run().catch(console.error);