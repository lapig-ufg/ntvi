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

    Controller.getAllClass = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);
        try {
            const classes = await prisma.useClass.findMany();
            response.json(classes)
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.getClass = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const _class = await prisma.useClass.findUnique({
                where: {
                    id: parseInt(request.params.id),
                }
            })
            response.json(_class)
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.createClass = async function (request, response) {
        const { name, description } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const _class = await prisma.useClass.create({
                data: { name: name, description: description },
            })
            response.status(200).json(_class);
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updateClass = async function (request, response) {
        const { id } = request.params
        const { name, description } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {

            const _class = await prisma.useClass.update({
                where: { id: parseInt(id) },
                data: { name: name, description: description },
            })
            response.status(200).json(_class);

        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.deleteClass = async function (request, response) {
        const { id } = request.params
        let { lang } = request.headers;
        const texts = language.getLang(lang);
        try {

            const _class = await prisma.useClass.delete({
                where: { id: parseInt(id) },
            })

            response.status(200).json(_class);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    return Controller;
}