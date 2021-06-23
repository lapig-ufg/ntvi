const envs = require('dotenv').config();
const dotenvExpand = require('dotenv-expand');
dotenvExpand(envs)

import Queue from './libs/Queue';

Queue.process();