const moment  = require('moment');
import { PythonShell } from 'python-shell';
import axios from 'axios';
const { PrismaClient } = require('@prisma/client')
import { mongo } from "./Mongo";
const appRoot = require('app-root-path');

export class Planet  {

    constructor(campaign = null) {
        Planet.prototype.campaign = campaign;
        Planet.prototype.prisma   = new PrismaClient();
        Planet.prototype.http     = axios;
    }

    async db() {
        await mongo.connect();
        return await mongo.db(process.env.MONGO_DATABASE);
    }
    async next(url){
        const response = await this.http.get(url);
        return response.data.mosaics;
    }

    async getMosaics () {
        let allMosaics = null;
        const response = await this.http.get(`https://api.planet.com/basemaps/v1/mosaics?api_key=${process.env.PL_API_KEY}`);
        const data     = response.data;
        let mosaics    = data.mosaics;

        if (response.data._links.hasOwnProperty('_next')) {
            let _mosaics = await this.next(data._links._next)
            for (let [index] of _mosaics.entries()) {
                if(_mosaics[index].name.includes('hancock') || _mosaics[index].name.includes('global_quarterly')){
                    //continua
                }else{
                    mosaics.push(_mosaics[index]);
                }
            }
            allMosaics = mosaics
        } else {
            allMosaics = mosaics
        }

        return allMosaics
    }

    publishLayers() {
        return new Promise( (resolve, reject) => {
            this.getMosaics().then( async mosaics => {
                let layers = [];
                mosaics.forEach((mosaic, index) => {
                    // let counter = index < 9 ? '0' + (index + 1): (index + 1);

                    const date = moment(mosaic.first_acquired)
                    mosaic['_id'] = this.campaign.id + "_PL_" + date.format('MM') + "_" + date.format('YYYY') ;
                    console.log(mosaic['_id'])
                    mosaic['campaignId'] = this.campaign.id;
                    mosaic['url'] = mosaic._links.tiles;

                    layers.push(mosaic);
                });

                const db = await this.db();

                db.collection('mosaics').insertMany(layers).then(result => {
                    resolve(result)
                }).catch(e => {
                    reject(e)
                });

            }).catch(e => {
                reject(e)
            })
        });
    }
    static timelapse(pointDir) {
        PythonShell.defaultOptions = {
            mode: 'text',
            pythonPath: process.env.PYTHON_PATH,
            pythonOptions: ['-u'],
            scriptPath: appRoot + process.env.SCRIPTS_PY,
        };
        return new Promise( (resolve, reject) => {
            try {
                let logs = [];

                const shell = new PythonShell('timelapse.py', { args: [pointDir]});

                shell.on('message', function (message) {
                    console.log(message)
                    logs.push("[ " + moment().format('YYYY-MM-DD HH:mm:ss')  + " ]" + " - " + message);
                });

                shell.end(function (err,code,signal) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(logs)
                    }
                });
            } catch (e) {
                reject(e);
            }
        })
    }
}
