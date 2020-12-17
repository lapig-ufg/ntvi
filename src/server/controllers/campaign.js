const { PrismaClient } = require('@prisma/client')

module.exports = function (app) {
    var Controller = {}

    let language = app.util.language;

    const prisma = new PrismaClient({
        errorFormat: 'pretty',
        log: ['query'],
    })

    // Controller.getAllOrganizations = async function (request, response) {
    //     const { lang } = request.headers;
    //     const texts = language.getLang(lang);
    //     try {
    //         const organizations = await prisma.organization.findMany();
    //         response.json(organizations)
    //     }catch (e) {
    //         console.error(e)
    //         response.status(500).json({error: true, message: texts.login_msg_erro + e + '.'});
    //     }
    // }

    // Controller.getOrganization = async function (request, response) {
    //     const { lang } = request.headers;
    //     const texts = language.getLang(lang);

    //     try {
    //         const _organization = await prisma.organization.findUnique({
    //             where: {
    //                 id: parseInt(request.params.id),
    //             }
    //         })
    //         response.json(_organization)
    //     } catch (e) {
    //         console.error(e)
    //         response.status(500).json({error: true, message: texts.login_msg_erro + e + '.'});
    //     }
    // }

    Controller.createCampaign = async function (request, response) {
        const { name, description, organization, numInspectors } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const _campaign = await prisma.campaign.create({
                data: { name: name, description: description, organization: organization, numInspectors: numInspectors },
            })
            response.status(200).json(_campaign);
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.createConfigForm = async function (request, response) {
        const { id } = request.params
        const { initialDate, finalDate, compositions, classes } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {

            const _campaign = await prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    initialDate: initialDate, finalDate: finalDate,
                    compositions: { create: compositions }, classes: { create: classes },
                },
            })
            response.status(200).json(_campaign);

        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updateOrganization = async function (request, response) {
        const { id } = request.params
        const { name, description } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {

            const _organization = await prisma.organization.update({
                where: { id: parseInt(id) },
                data: { name: name, description: description },
            })
            response.status(200).json(_organization);

        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.deleteOrganization = async function (request, response) {
        const { id } = request.params
        let { lang } = request.headers;
        const texts = language.getLang(lang);
        try {

            const _organization = await prisma.organization.delete({
                where: { id: parseInt(id) },
            })

            response.status(200).json(_organization);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    return Controller;
}