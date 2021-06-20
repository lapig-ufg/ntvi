const envs = require('dotenv').config();
const dotenvExpand = require('dotenv-expand');
dotenvExpand(envs)

import Queue from './lib/Queue';

Queue.process();