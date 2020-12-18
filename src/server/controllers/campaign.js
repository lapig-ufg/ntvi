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

    Controller.createCampaignInfoForm = async function (request, response) {
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

    Controller.updateCampaignInfoForm = async function (request, response) {
        const { id } = request.params
        const { name, description, organization, numInspectors } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const _campaign = await prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    name: name, description: description, organization: organization, numInspectors: numInspectors,
                }
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
            let arrayQueries = []

            for (obj of compositions) {
                arrayQueries.push(prisma.composition.create({
                    data: {
                        colors: obj.colors,
                        satellite: { connect: { id: obj.satellite } },
                        campaign: { connect: { id: parseInt(id) } }
                    }
                })
                )
            }

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    initialDate: initialDate, finalDate: finalDate,
                    classes: { connect: classes },
                }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)

            response.status(200).json(resultQueries);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updateConfigForm = async function (request, response) {
        const { id } = request.params
        const { initialDate, finalDate, compositions, classes } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = []

            arrayQueries.push(prisma.composition.deleteMany({
                where: { campaignId: parseInt(id) },
            }))

            for (obj of compositions) {
                arrayQueries.push(prisma.composition.create({
                    data: {
                        colors: obj.colors,
                        satellite: { connect: { id: obj.satellite } },
                        campaign: { connect: { id: parseInt(id) } }
                    }
                })
                )
            }

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    initialDate: initialDate, finalDate: finalDate,
                    classes: { connect: classes },
                }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)

            response.status(200).json(resultQueries);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.createPointsForm = async function (request, response) {
        const { id } = request.params
        const { points } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = []

            for (let objPoint of points) {
                delete objPoint.id
            }

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    points: { create: points },
                }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)

            response.status(200).json(resultQueries);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updatePointsForm = async function (request, response) {
        const { id } = request.params
        const { points } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = []

            arrayQueries.push(prisma.points.deleteMany({
                where: { campaignId: parseInt(id) },
            }))

            for (let objPoint of points) {
                delete objPoint.id
            }

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    points: { create: points },
                }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)

            response.status(200).json(resultQueries);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.createUserCampaignForm = async function (request, response) {
        const { id } = request.params
        const { usersOnCampaign } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = []

            let newVet = []

            for (let obj of usersOnCampaign) {
                obj.user = obj.user.id
                delete obj.userId
                obj.campaign = parseInt(id)

                newVet.push({
                    user: {
                        connect: { id: obj.user }
                    },
                    typeUserInCampaign: obj.typeUserInCampaign
                })

            }

            console.log(newVet)

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    UsersOnCampaigns: { create: newVet }
                }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)

            response.status(200).json(resultQueries);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updateUserCampaignForm = async function (request, response) {
        const { id } = request.params
        const { points } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = []

            arrayQueries.push(prisma.points.deleteMany({
                where: { campaignId: parseInt(id) },
            }))

            for (let objPoint of points) {
                delete objPoint.id
            }

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    points: { create: points },
                }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)

            response.status(200).json(resultQueries);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.createImagesForm = async function (request, response) {
        const { id } = request.params
        const { images } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = []

            let newVet = []

            for (let obj of images) {
                delete obj.id
                delete obj.satelliteId
                delete obj.satellite.name
                delete obj.satellite.description
                delete obj.satellite.createdAt
                delete obj.satellite.updatedAt

                newVet.push({
                    satellite: {
                        connect: { id: obj.satellite.id }
                    },
                    date: obj.date,
                    url: obj.url
                })
            }

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    images: { create: newVet },
                }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)

            response.status(200).json(resultQueries);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updateImagesForm = async function (request, response) {
        const { id } = request.params
        const { images } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = []

            arrayQueries.push(prisma.images.deleteMany({
                where: { campaignId: parseInt(id) },
            }))

            for (let obj of images) {
                delete obj.id
            }

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    images: { create: images },
                }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)

            response.status(200).json(resultQueries);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.getCampaignsByUser = async function (request, response) {
        const { id } = request.params
        const { lang } = request.headers;
        const texts = language.getLang(lang);
        try {
            const campaigns = await prisma.campaign.findMany({
                where: {
                    UsersOnCampaigns: {
                        some: {
                            user: { id: parseInt(id) }
                        }
                    }
                },
                include: {
                    points: true,
                    images: true
                }

            });
            response.json(campaigns)
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.getCampaignInfo = async function (request, response) {
        const { id } = request.params
        const { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const _campaign = await prisma.campaign.findUnique({
                where: {
                    id: parseInt(id),
                },
                include: {
                    points: true,
                    images: true,
                    UsersOnCampaigns: true,
                    classes: true,
                    compositions: true,
                    organization: true
                }
            })
            response.json(_campaign)
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }

        try {
            const campaigns = await prisma.campaign.findMany({
                where: {
                    UsersOnCampaigns: {
                        some: {
                            user: { id: parseInt(id) }
                        }
                    }
                },
                include: {
                    points: true,
                    images: true
                }

            });
            response.json(campaigns)
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }


    // Controller.deleteOrganization = async function (request, response) {
    //     const { id } = request.params
    //     let { lang } = request.headers;
    //     const texts = language.getLang(lang);
    //     try {

    //         const _organization = await prisma.organization.delete({
    //             where: { id: parseInt(id) },
    //         })

    //         response.status(200).json(_organization);
    //     } catch (e) {
    //         console.error(e)
    //         response.status(500).json({ message: texts.login_msg_erro + e + '.' });
    //     }
    // }

    return Controller;
}