import { GoogleEarthEngine } from "./GoogleEarthEngine";
import { PythonShell } from 'python-shell';
const moment  = require('moment');
const appRoot = require('app-root-path');

export class Landsat extends GoogleEarthEngine {

    constructor(campaign, job = null) {
        super(campaign);
        Landsat.prototype.periods = [
            {
                "name": 'WET',
                "dtStart": '-01-01',
                "dtEnd": '-04-30'
            },
            {
                "name": 'DRY',
                "dtStart": '-06-01',
                "dtEnd": '-10-30'
            }
        ];
        Landsat.prototype.mosaicsPromises = [];
        this.getCompositions();

        PythonShell.defaultOptions = {
            mode: 'text',
            pythonPath: process.env.PYTHON_PATH,
            pythonOptions: ['-u'],
            scriptPath: appRoot + process.env.SCRIPTS_PY,
        };
    }

    initSatellites() {

        Landsat.prototype.landsat_5 = super.ee.ImageCollection("LANDSAT/LT05/C01/T1_TOA");
        Landsat.prototype.landsat_7 = super.ee.ImageCollection("LANDSAT/LE07/C01/T1_TOA");
        Landsat.prototype.landsat_8 = super.ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA");
    }

    getCompositions() {
        const landsatCompositions = super.campaign.compositions.find(comp => { return parseInt(comp.satelliteId) === 1 });
        Landsat.prototype.compositions = landsatCompositions.colors;
    }

    getWRS(feature){
        return super.ee.Feature(feature).get('PR')
    }

    getTiles() {
        return new Promise((resolve, reject) => {
            try {
                const countries = super.ee.FeatureCollection("users/lapig/countries")
                const wrs = super.ee.FeatureCollection("users/lapig/WRS2")

                const selectedCountry = super.ee.Feature(countries.filter(super.ee.Filter.eq('ISO', super.campaign.country)).first())

                const wrs_filtered = wrs.filterBounds(selectedCountry.geometry())

                const wrs_list = wrs_filtered.toList(wrs_filtered.size())

                wrs_list.map(this.getWRS).getInfo(tiles => resolve(tiles))
            } catch (e) {
                reject(e);
            }
        });
    }

    getBounds() {
        return new Promise((resolve, reject) => {
            try {
                const countries = super.ee.FeatureCollection("users/lapig/countries")

                const selectedCountry = super.ee.Feature(countries.filter(super.ee.Filter.eq('ISO', super.campaign.country)).first())
                const center = selectedCountry.geometry().centroid().buffer(2e4)
               resolve(center)
            } catch (e) {
                reject(e);
            }
        });
    }

    getThumbURL() {
        return new Promise((resolve, reject) => {
            try {
                this.getBounds().then(ob => {
                    const year = moment().year() - 1;
                    const bands = ['B5','B6','B4']
                    const img = super.ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA").filterDate(year + '-01-01', year + '-12-31')
                        .sort("CLOUD_COVER")
                        .filterBounds(ob)
                        .select(bands, ['NIR','SWIR','RED'])
                        .first();

                    const thumb = img.getThumbURL({
                        "bands": this.compositions,
                        'region': ob,
                        'dimensions': 180,
                        'format': 'png'
                    });

                    resolve(thumb)
                })
            } catch (e) {
                reject(e);
            }
        });
    }

    getBestImg(satellite, year, mDaysStart, mDaysEnd, path, row) {
        let collection = null;
        let bands      = null;
        const dtStart  = year + mDaysStart;
        const dtEnd    = year + mDaysEnd

        switch (satellite) {
            case 'L8':
                collection = this.landsat_8;
                bands = ['B5','B6','B4']
                break;
            case 'L5':
                collection = this.landsat_5;
                bands = ['B4','B5','B3']
                break;
            case 'L7':
                collection = this.landsat_7
                bands = ['B4','B5','B3']
                break;
        }

        const img = collection.filterDate(dtStart, dtEnd)
            .filterMetadata('WRS_PATH','equals', path)
            .filterMetadata('WRS_ROW','equals', row)
            .sort("CLOUD_COVER")
            .select(bands, ['NIR','SWIR','RED'])
            .first();

        return super.ee.Image(img)
   }

    getBestMosaic(tiles, satellite, year, dtStart, dtEnd) {
        let images = []
        tiles.forEach(tile => {
            const path = tile.slice(0, 3);
            const row = tile.slice(3, 6);
            const img = this.getBestImg(satellite, year, dtStart, dtEnd, path, row);
            images.push(img)
        });
        return super.ee.ImageCollection.fromImages(images)
    }

    getSatellite(year) {
        let satellite = null;

        switch (true) {
            case year >= 2013 :
                satellite = 'L8';
                break;
            case year >= 2000 && year < 2013:
                satellite = 'L7';
                break;
            case year > 1984 && year < 2000:
                satellite = 'L5';
                break;
        }
        return  satellite;
    }

    getExpirationDate() {
        const now = moment();
        return now.add(22, 'hours').toISOString(true);
    }

    publishImg(image) {
       // return image.getMap({ "bands": this.compositions});
       return image.getInfo();
    }

    processPeriod(tiles, year, suffix = '') {
        const self = this;
        this.periods.forEach(per => {
           this.mosaicsPromises.push(new Promise(async (resolve, reject) => {
                try {
                    const db = await this.db();
                    const period = per['name'];
                    const dtStart = per['dtStart'];
                    const dtEnd = per['dtEnd'];
                    const satellite = self.getSatellite(year);
                    const mosaicId = satellite + "_" + year + "_" + period + suffix;
                    const mosaic = await db.collection('mosaics').findOne({ "_id": mosaicId, campaignId: super.campaign.id });

                    if(mosaic !== null) {
                        if(moment().isAfter(mosaic['expiration_date'])){
                            reject(mosaicId + ' exists and is valid.');
                        } else {
                            const bestMosaic = self.getBestMosaic(tiles, satellite, year, dtStart, dtEnd)
                            const map = self.publishImg(bestMosaic);
                            const expirationDate = self.getExpirationDate()
                            let ob = {
                                campaignId: super.campaign.id,
                                expiration_date: expirationDate,
                                mosaicId: mosaicId,
                                map: map
                            };
                            resolve(ob)
                        }
                    } else {
                        const bestMosaic = self.getBestMosaic(tiles, satellite, year, dtStart, dtEnd)
                        const map = self.publishImg(bestMosaic);
                        const expirationDate = self.getExpirationDate()
                        let ob = {
                            campaignId: super.campaign.id,
                            expiration_date: expirationDate,
                            mosaicId: mosaicId,
                            map: map
                        };
                        resolve(ob)
                    }

                } catch (e) {
                    reject(e);
                }
            }));
        });
    }

    publishLayers () {
        return new Promise( (resolve, reject) => {
            try {
                let logs = [];
                const region = Array.isArray(super.campaign.country) ? super.campaign.country : [super.campaign.country];
                let params = super.credentials;

                params['campaign'] = super.campaign.id;
                params['region'] = region;
                params['compositions'] = this.compositions;
                params['initialYear'] = moment(super.campaign.initialDate).year();
                params['finalYear'] = moment(super.campaign.finalDate).year();

                const shell = new PythonShell('publish_layers_landsat.py', { args: [JSON.stringify(params)]});

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

    getMosaicsDates() {
        return new Promise( (resolve, reject) => {
            try {
                let logs = [];
                const region = Array.isArray(super.campaign.country) ? super.campaign.country : [super.campaign.country];
                let params = super.credentials;

                params['campaign'] = super.campaign.id;
                params['region'] = region;
                params['compositions'] = this.compositions;
                params['initialYear'] = moment(super.campaign.initialDate).year();
                params['finalYear'] = moment(super.campaign.finalDate).year();

                const shell = new PythonShell('update_mosaic_date.py', { args: [JSON.stringify(params)]});

                shell.on('message', function (message) {
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