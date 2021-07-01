import { GoogleEarthEngine } from "./GoogleEarthEngine";
import { PythonShell } from 'python-shell';
const moment  = require('moment');
const appRoot = require('app-root-path');
const _ = require('lodash');

export class Sentinel extends GoogleEarthEngine {

    constructor(campaign, job = null) {
        super(campaign);

        this.getCompositions();

        PythonShell.defaultOptions = {
            mode: 'text',
            pythonPath: process.env.PYTHON_PATH,
            pythonOptions: ['-u'],
            scriptPath: appRoot + process.env.SCRIPTS_PY,
        };
        Sentinel.prototype.forest = ['RED', 'GREEN', 'BLUE'];
        Sentinel.prototype.dryRegions = ['NIR','RED', 'GREEN'];
        Sentinel.prototype.agriculturalAreas = ['REDEDGE4','SWIR1','REDEDGE1'];
    }
    getCompositions() {
        const sentinelCompositions = super.campaign.compositions.find(comp => { return parseInt(comp.satelliteId) === 2 });
        Sentinel.prototype.compositions = sentinelCompositions.colors.split(',');
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

                const shell = new PythonShell('publish_layers_sentinel.py', { args: [JSON.stringify(params)]});

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

    /**
     * Function to mask clouds using the Sentinel-2 QA band
     * @param {ee.Image} image Sentinel-2 image
     * @return {ee.Image} cloud masked Sentinel-2 image
     */
    maskS2clouds(image) {
        const qa = image.select('QA60');

        // Bits 10 and 11 are clouds and cirrus, respectively.
        const cloudBitMask = 1 << 10;
        const cirrusBitMask = 1 << 11;

        // Both flags should be set to zero, indicating clear conditions.
        const mask = qa.bitwiseAnd(cloudBitMask).eq(0)
            .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

        return image.updateMask(mask).divide(10000);
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

    getMin(){
        let min = [0.0];
        if(_.isEqual(this.compositions,  this.forest)){
            min = [200,300,700];
        } else if(_.isEqual(this.compositions, this.dryRegions)){
            min = [1100,700,600];
        } else if(_.isEqual(this.compositions,  this.agriculturalAreas)){
            min = [1700,700,600];
        }
        return min; 
    }
    getMax(){
        let max = [2000];
        if(_.isEqual(this.compositions,  this.forest)){
            max = [3000,2500,2300];
        } else if(_.isEqual(this.compositions,  this.dryRegions)){
            max = [4000,2800,2400];
        } else if(_.isEqual(this.compositions,  this.agriculturalAreas)){
            max = [4600,5000,2400];
        }
        return max;
    }
    getGamma(){
        let gamma = [1.35];
        if(_.isEqual(this.compositions,  this.forest)){
            gamma = [1.35];
        } else if(_.isEqual(this.compositions,  this.dryRegions)){
            gamma = [1.1];
        } else if(_.isEqual(this.compositions,  this.agriculturalAreas)){
            gamma = [0.8];
        }
        return gamma;
    }

    getThumbURL() {
        return new Promise((resolve, reject) => {
            try {
                //  SR
                //  'min': 0.0,
                //  'max': 0.2,
                this.getBounds().then(region => {
                    const year = moment().year() - 1;
                    const img = super.ee.ImageCollection('COPERNICUS/S2')
                        .filterDate(year + '-01-01', year + '-12-31')
                        .filterBounds(region)
                        .sort('CLOUDY_PIXEL_PERCENTAGE', false)
                        .mosaic()
                        .select(
                            ['B2','B3','B4','B5','B6','B7','B8','B8A','B11','B12'],
                            ['BLUE','GREEN','RED','REDEDGE1','REDEDGE2','REDEDGE3','NIR','REDEDGE4','SWIR1','SWIR2']
                        );
                    const thumb = super.ee.Image(img).getThumbURL({
                        'min': this.getMin(),
                        'max': this.getMax(),
                        'gamma': this.getGamma(),
                        'bands': this.compositions,
                        'region': region,
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

}