const  dotenv = require('dotenv');
dotenv.config();

import Queue from './lib/Queue';

Queue.process();