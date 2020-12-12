module.exports = function (app) {
    const path = require('path')

    const checkRoute = function (request, response, next) {
        if (!request.url.includes('api') && !request.url.includes('service')) {
            request.sendFile(path.resolve(app.config.clientDir + '/index.html'));
        }
        next();
    }

    app.get('**', checkRoute);
}