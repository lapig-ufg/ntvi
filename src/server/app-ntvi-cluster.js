const envs = require('dotenv').config();
const dotenvExpand = require('dotenv-expand');
dotenvExpand(envs)

const cluster = require('cluster');
let numCPUs = require('os').cpus().length;

if (cluster.isMaster) {

  if(process.env.NODE_ENV == 'dev') {
    numCPUs = 4
  }

  for (let i = 0; i < numCPUs; i++) {
    let ENV_VAR = {}
    if(i == 0) {
    	ENV_VAR = { 'PRIMARY_WORKER': 1 }
    }
    cluster.fork(ENV_VAR);
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died');
  });

} else {
  require('./app.js');
}