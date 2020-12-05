
const dotenv = require("dotenv-safe");
const result = dotenv.config({
    allowEmptyValues: true,
    example: '.env'
});
if (result.error) {
    throw result.error;
}
const { parsed: env } = result;

module.exports = function (app) {
    let JWT = {}
    const jwt = require('jsonwebtoken');

    JWT.verifyJWT = async function (request, response,  next) {
        try {
            const token = request.headers['x-access-token'];
            if (!token) return response.status(401).json({ auth: false, message: 'No token provided.' });

            jwt.verify(token, env.SECRET, function(err, decoded) {
                if (err) return response.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

                // se tudo estiver ok, salva no request para uso posterior
                request.userId = decoded.id;
                next();
            });
        }catch (e) {
            console.error(e)
            response.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
        }
    }

    return JWT;
}