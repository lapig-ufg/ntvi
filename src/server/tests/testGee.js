import { Landsat } from '../lib/Landsat';
import file from './file';
const path = require('path');
const envs = require('dotenv').config({path:path.join(process.cwd(), '/.env')});
const dotenvExpand = require('dotenv-expand');
dotenvExpand(envs)
const moment  = require('moment');
const EventEmitter = require( 'events' );
EventEmitter.defaultMaxListeners = parseInt(process.env.DEFAULT_MAX_LISTENERS);

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function run(){
  try {
      const campaign = await prisma.campaign.findUnique({
          select: { id: true, name:true, initialDate: true, finalDate:true, compositions: true, country: true, UsersOnCampaigns: { select : {typeUserInCampaign:true, user: {select:{geeKey:true}}}} },
          where: {id: 1},
      });

      const landsat = new Landsat(campaign);

      const initialYear = moment(campaign.initialDate).year();
      const finalYear = moment(campaign.finalDate).year();

      landsat.run(function (){

          landsat.initSatellites();

          landsat.getTiles().then(tiles =>  {
              for (let year = initialYear; year <= finalYear; year++) {
                  landsat.processPeriod(tiles, year)
              }
          }).then(() => {
              Promise.all(landsat.mosaicsPromises).then(mosaics => {
                  mosaics.forEach(mosaic => {
                      console.log(mosaic)
                  })
              })
          }).catch(err => console.error(new Error(err)))

      },  (err) => {
          console.error(new Error(err))
          landsat.ee.reset();
      },  (err) => {
          console.error(new Error(err))
          landsat.ee.reset();
      });

  }  catch (e) {
      console.error(e)
  }
}


run().catch(console.error);