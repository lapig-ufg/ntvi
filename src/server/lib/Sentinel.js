import { GoogleEarthEngine } from "./GoogleEarthEngine";
import { PythonShell } from 'python-shell';
const moment  = require('moment');
const appRoot = require('app-root-path');

export class Sentinel extends GoogleEarthEngine {

    constructor(campaign) {
        super(campaign);

        this.getCompositions();

        PythonShell.defaultOptions = {
            mode: 'text',
            pythonPath: process.env.PYTHON_PATH,
            pythonOptions: ['-u'],
            scriptPath: appRoot + process.env.SCRIPTS_PY,
        };
    }

    runFromPython () {
        return new Promise( (resolve, reject) => {
            try {
                let logs = [];
                const region = Array.isArray(super.campaign.country) ? super.campaign.country : [super.campaign.country];
                let params = super.credentials;

                params['campaign'] = super.campaign.id;
                params['region'] = region;
                params['initialYear'] = moment(super.campaign.initialDate).year();
                params['finalYear'] = moment(super.campaign.finalDate).year();

                const shell = new PythonShell('publish_layers_sentinel.py', { args: [JSON.stringify(params)]});

                shell.on('message', function (message) {
                    logs.push("[ " + moment().format('YYYY-MM-DD HH:mm:ss') + " - " + message + " ]");
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