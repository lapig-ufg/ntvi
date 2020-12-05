const fs = require('fs');
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
    let Language = {}

    Language.getLang = function (lang) {
        const file = env.LANGUAGE + lang +'.json';
        try {
            let obj = JSON.parse(fs.readFileSync(file, 'utf8'));
            return obj;
        }catch (e) {
            console.error(e)
        }
    }

    return Language;
}