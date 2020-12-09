const { PrismaClient } = require('@prisma/client')
const dotenv = require("dotenv-safe");
const CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');

const result = dotenv.config({
    allowEmptyValues: true,
    example: '.env'
});
if (result.error) {
    throw result.error;
}
const { parsed: env } = result;

module.exports = function (app) {
    let Controller = {}

    let language = app.util.language;

    const prisma = new PrismaClient({
        errorFormat: 'pretty',
        log: ['query', 'info', 'warn'],
    })

    Controller.login    = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const { email, password } = request.body
            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                },
            })

            const hash = CryptoJS.MD5(password).toString();

            if(user.email === email && user.password === hash){
                const payload = {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };
                const token = jwt.sign(payload, env.SECRET, {
                    expiresIn: '24h'
                });
                return response.json({
                    token: token,
                });
            }
            response.status(500).json({message: texts.login_msg_invalid});
        }catch (e) {
            console.error(e)
            response.status(500).json({message: texts.login_msg_erro + e + '.'});
        }
    }

    Controller.register = async function (request, response) {

        const {fullName, confirmPassword, email, terms } = request.body;
        const hash = CryptoJS.MD5(confirmPassword).toString();
        try {
            const user = await prisma.user.create({
                data:{
                    name: fullName,
                    email: email,
                    password: hash,
                    terms: terms
                },
            });
            const payload = {
                id: user.id,
                name: user.name,
                email: user.email
            };
            const token = jwt.sign(payload, env.SECRET, {
                expiresIn: '24h'
            });
            return response.json({
                token: token,
            });
        } catch (e) {
            console.error(e)
            response.status(500).json({message: 'Erro ao consultar o usuário: ' + e + '.'});
        }
    }

    Controller.oauth    = async function (request, response) {
        // const { lang } = request.headers;
        // const texts = language.getLang(lang);
        const {headers, params} = request
        console.log(request)
        try {
            // const { email, password } = request.body
            // const user = await prisma.user.findUnique({
            //     where: {
            //         email: email,
            //     },
            // })

            // const hash = CryptoJS.MD5(password).toString();
            //
            // if(user.email === email && user.password === hash){
            //     const payload = {
            //         id: user.id,
            //         name: user.name,
            //         email: user.email
            //     };
            //     const token = jwt.sign(payload, env.SECRET, {
            //         expiresIn: '24h'
            //     });
            //     return response.json({
            //         token: token,
            //     });
            // }
            //
            return response.json({ 'headers': headers, 'params': params });
            // response.status(500).json({message: texts.login_msg_invalid});
        }catch (e) {
            console.error(e)
            response.status(500).json({message: texts.login_msg_erro + e + '.'});
        }
    }

    Controller.logout   = async function (request, response) {
        response.json({ auth: false, token: null });
    }

    return Controller;
}