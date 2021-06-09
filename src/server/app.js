var express = require('express')
	, cluster = require('cluster')
	, load = require('express-load')
	, path = require('path')
	, util = require('util')
	, compression = require('compression')
	, requestTimeout = require('express-timeout')
	, responseTime = require('response-time')
	, buffer = require('buffer')
	, events = require('events')
	, archiver = require('archiver')
	, fs = require('fs')
	, mime = require('mime')
	, async = require('async')
	, timeout = require('connect-timeout')
	, bodyParser = require('body-parser')
	, multer = require('multer')
	, session = require('express-session')
	, parseCookie = require('cookie-parser')
	, cors = require('cors');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoStore = require('connect-mongo')(session);
var cookie = parseCookie('LAPIG')
var mongoAdapter = require('socket.io-adapter-mongo');
var sharedsession = require("express-socket.io-session");


load('config.js', { 'verbose': false })
	.then('libs')
	.then('middleware')
	.then('util')
	.into(app);

app.middleware.repository.init(function () {

	var mongodbUrl = 'mongodb://' + app.config.mongo.host + ':' + app.config.mongo.port + '/' + app.config.mongo.dbname;

	app.repository = app.middleware.repository;
	var store = new MongoStore({ url: mongodbUrl });
	io.adapter(mongoAdapter(mongodbUrl));

	app.use(cookie);

	var middlewareSession = session({
		store: store,
		secret: 'LAPIG',
		resave: false,
		saveUninitialized: true,
		key: 'sid',
		cookie: {
			httpOnly: false,
			secure: false,
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

	var publicDir = path.join(__dirname, '');

	app.use(requestTimeout({
		'timeout': 1000 * 60 * 30,
		'callback': function (err, options) {
			var response = options.res;
			if (err) {
				util.log('Timeout: ' + err);
			}
			response.end();
		}
	}));

	var corsOptions = {
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

process.on('uncaughtException', function (err) {
	console.error(err.stack);
});
