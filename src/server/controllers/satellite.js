const { PrismaClient } = require('@prisma/client')

module.exports = function (app) {
    var Controller = {}

    let language = app.util.language;

    const prisma = new PrismaClient({
        errorFormat: 'pretty',
        log: ['query', 'info', 'warn'],
    })

    Controller.getAllSatellites = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);
        try {
            const satellites = await prisma.satellite.findMany();
            response.json(satellites)
        }catch (e) {
            console.error(e)
            response.status(500).json({error: true, message: texts.login_msg_erro + e + '.'});
        }
    }

    Controller.getSatellite = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const satellite = await prisma.satellite.findUnique({
                where: {
                    id: parseInt(request.params.id),
                }
            })
            response.json(satellite)
        } catch (e) {
            console.error(e)
            response.status(500).json({error: true, message: texts.login_msg_erro + e + '.'});
        }
    }

    Controller.createSatellite = async function (request, response) {
        const { name, description} = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const satellite = await prisma.satellite.create({
                data: { name: name, description: description },
            })
            response.status(200).json(satellite);
        }catch (e) {
            console.error(e)
            response.status(500).json({error: true,message: texts.login_msg_erro + e + '.'});
        }
    }

    Controller.updateSatellite = async function (request, response) {
        const {id} = request.params
        const {name, description} = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {

            const satellite = await prisma.satellite.update({
                where: { id: parseInt(id) },
                data: { name: name, description: description },
            })
            response.status(200).json(satellite);

        }catch (e) {
            console.error(e)
            response.status(500).json({message: texts.login_msg_erro + e + '.'});
        }
    }

    Controller.deleteSatellite = async function (request, response) {
        const { id } = request.params
        let { lang } = request.headers;
        const texts = language.getLang(lang);
        try {

            const satellite = await prisma.satellite.delete({
                where: { id: parseInt(id)},
            })

            response.status(200).json(satellite);
        }catch (e) {
            console.error(e)
            response.status(500).json({message: texts.login_msg_erro + e + '.'});
        }
    }

    return Controller;
}