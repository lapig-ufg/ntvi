const env = process.env;
const CryptoJS = require("crypto-js");

module.exports = function (app) {
    let Broker = {}

    Broker.guard = function (request, response,  next) {

        try {
            let  { token }  = request.params;

            if (!token) return response.status(401).json({ auth: false, message: 'No token provided.' });

            const key = CryptoJS.MD5(env.BROKER_KEY).toString();

            const hashToken = CryptoJS.MD5(token).toString();

            if (key === hashToken) {
                next();
            } else {
                return response.status(401).json({ auth: false, message: 'Failed to authenticate token.' });
            }

        } catch (e) {
            console.error(e)
            response.status(401).json({ auth: false, message: 'Failed to authenticate token.' });
        }
    }

    return Broker;
}