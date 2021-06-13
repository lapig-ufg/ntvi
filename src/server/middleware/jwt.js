const env = process.env;

module.exports = function (app) {
    let JWT = {}

    const jwt = require('jsonwebtoken');

    JWT.verifyJWT = async function (request, response,  next) {

        try {
            const { lang } = request.headers;

            const  { token }  = request.headers;

            if (!token) return response.status(401).json({ auth: false, message: 'No token provided.' });

            jwt.verify(token, env.SECRET, function(err, decoded) {

                if (err) {
                    console.log(err)
                    return response.status(401).json({ auth: false, message: 'Failed to authenticate token.' });
                }

                // se tudo estiver ok, salva no request para uso posterior
                request.user = decoded;
                next();
            });
        }catch (e) {
            console.error(e)
            response.status(401).json({ auth: false, message: 'Failed to authenticate token.' });
        }
    }

    return JWT;
}