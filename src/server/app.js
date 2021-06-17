const  dotenv = require('dotenv');
dotenv.config();

const express = require('express')
	, load = require('express-load')
	, path = require('path')
	, util = require('util')
	, compression = require('compression')
	, requestTimeout = require('express-timeout')
	, responseTime = require('response-time')
	, bodyParser = require('body-parser')
	, multer = require('multer')
	, session = require('express-session')
	, parseCookie = require('cookie-parser')
	, cors = require('cors');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const MongoStore = require('connect-mongo')(session);
const cookie = parseCookie(process.env.SECRET)
const mongoAdapter = require('socket.io-adapter-mongo');
const sharedsession = require("express-socket.io-session");

load('config/config.js', { 'cwd': 'config' })
	.then('config')
	.into(app);

load('middleware', { 'verbose': false })
	.then('util')
	.into(app);

app.middleware.repository.init( function () {

	const mongodbUrl = 'mongodb://' + app.config.mongo.host + ':' + app.config.mongo.port + '/' + app.config.mongo.dbname;

	app.repository = app.middleware.repository;
	const store = new MongoStore({ url: mongodbUrl });
	io.adapter(mongoAdapter(mongodbUrl));
	app.use(cookie);

	const middlewareSession = session({
		store: store,
		secret: process.env.SECRET,
		resave: false,
		saveUninitialized: true,
		key: 'sid',
		cookie: {
			httpOnly: false,
			secure: true,
			maxAge: 1000 * 60 * 60 * 24
		}
	})

	app.use(middlewareSession);

	io.use(sharedsession(middlewareSession, {
		autoSave: true
	}));

	app.use(compression());

	app.use(express.static(app.config.clientDir, { redirect: false }));
	app.get('*', function (request, response, next) {
		if (!request.url.includes('api') && !request.url.includes('service')) {
			response.sendFile(path.resolve(app.config.clientDir + '/index.html'));
		} else {
			next();
		}
	});
	app.set('views', __dirname + '/templates');
	app.set('view engine', 'ejs');

	app.use(requestTimeout({
		'timeout': 1000 * 60 * 60 * 24,
		'callback': function (err, options) {
			const response = options.res;
			if (err) {
				util.log('Timeout: ' + err);
			}
			response.end();
		}
	}));

	const corsOptions = {
		origin: 'http://localhost:4200',
		optionsSuccessStatus: 200
	}

	app.use(cors(corsOptions))

	app.use(responseTime());
	app.use(bodyParser.json({
		limit: '50mb'
	}));
	app.use(bodyParser.urlencoded({
		limit: '50mb',
		parameterLimit: 100000,
		extended: true
	}));

	app.use(multer());

	io.on('connection', function (socket) {
		socket.on('disconnect', function () {
			store.get(socket.handshake.sessionID, function (error, session) {
				app.emit('socket-disconnect', session);
			});
		})
	})

	app.use(function (error, request, response, next) {
		console.log('ServerError: ', error.stack);
		next();
	});

	load('models', { 'verbose': false })
		.then('controllers')
		.then('routes')
		.into(app);

	http.listen(app.config.port, function () {
		console.log('NTVI Server @ [port %s] [pid %s]', app.config.port, process.pid.toString());
		if (process.env.PRIMARY_WORKER) {
			app.middleware.jobs.start();
		}
	});

});

