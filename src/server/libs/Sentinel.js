import { GoogleEarthEngine } from "./GoogleEarthEngine";
import { PythonShell } from 'python-shell';
import {locationForIndex} from "sucrase/dist/parser/traverser/base";
const moment  = require('moment');
const appRoot = require('app-root-path');

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
    }
    getCompositions() {
        const sentinelCompositions = super.campaign.compositions.find(comp => { return parseInt(comp.satelliteId) === 2 });
        Sentinel.prototype.compositions = sentinelCompositions.colors;
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

    getThumbURL() {
        return new Promise((resolve, reject) => {
            try {
                this.getBounds().then(region => {
                    const year = moment().year() - 1;
                    const img = super.ee.ImageCollection('COPERNICUS/S2_SR').filterDate(year + '-01-01', year + '-12-31')
                        .filterBounds(region)
                        .filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than',20)
                        .map(this.maskS2clouds);

                    const composition = img.median();
                    const imgCom =  super.ee.Image(composition)
                    const thumb = imgCom.getThumbURL({
                        'min': 0.0,
                        'max': 0.2,
                        'bands': this.compositions.split(','),
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