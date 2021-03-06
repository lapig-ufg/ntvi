const { PrismaClient } = require('@prisma/client')
const rp = require("request-promise");

module.exports = function (app) {
    var Controller = {}

    let language = app.util.language;

    const config = app.config;

    const prisma = new PrismaClient({
        errorFormat: 'pretty',
        log: ['query'],
    })


    Controller.createCampaignInfoForm = async function (request, response) {
        const { name, description, organization, numInspectors, permisson } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const _campaign = await prisma.campaign.create({
                data: {
                    name: name, description: description, organization: { connect: { id: parseInt(organization) } }, numInspectors: numInspectors,
                    UsersOnCampaigns: { create: { user: { connect: { id: parseInt(permisson.userId) } }, typeUserInCampaign: permisson.typeUserInCampaign } }
                },
            })
            response.status(200).json(_campaign);
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updateCampaignInfoForm = async function (request, response) {
        const { id } = request.params
        const { name, description, organization, numInspectors, permisson } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const _campaign = await prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    name: name, description: description, organization: { connect: { id: parseInt(organization) } }, numInspectors: numInspectors,
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
        const { UsersOnCampaigns } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = []

            let newVet = []

            for (let obj of UsersOnCampaigns) {
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
                    images: true,
                    classes: true,
                    compositions: true,
                    organization: true,
                    UsersOnCampaigns: true,
                }

            });
            response.json(campaigns)
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }
    Controller.getPublicCampaigns = async function (request, response) {
        const { lang } = request.headers;
        const texts = language.getLang(lang);
        try {
            const campaigns = await prisma.campaign.findMany({
                where: {
                    publish: true
                },
                include: {
                    points: true,
                    images: true,
                    classes: true,
                    compositions: true,
                    organization: true,
                    UsersOnCampaigns: true,
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
                    UsersOnCampaigns: {
                        include: {
                            user: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    },
                    classes: true,
                    compositions: {
                        include: {
                            satellite: true,
                        }
                    },
                    organization: true
                }
            })
            response.json(_campaign)
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }

        // try {
        //     const campaigns = await prisma.campaign.findMany({
        //         where: {
        //             UsersOnCampaigns: {
        //                 some: {
        //                     user: { id: parseInt(id) }
        //                 }
        //             }
        //         },
        //         include: {
        //             points: true,
        //             images: true
        //         }
        //
        //     });
        //     response.json(campaigns)
        // } catch (e) {
        //     console.error(e)
        //     response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        // }
    }

    Controller.starCampaignCache = async function (request, response) {
        const { id } = request.params
        const { status } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const campaign = await prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    status: status
                }
            });

            response.status(200).json(campaign);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.publishCampaign = async function (request, response) {
        const { id } = request.params
        const { publish } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const campaign = await prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    publish: publish
                }
            });

            response.status(200).json(campaign);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.deleteCampaign = async function (request, response) {
        const { id } = request.params
        let { lang } = request.headers;
        const texts = language.getLang(lang);
        try {

            const _campaign = await prisma.campaign.delete({
                where: { id: parseInt(id) },
            })

            response.status(200).json(_campaign);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.getMODIS = async function (request, response) {
        // const { long, lat } = request.params

        const { lang } = request.headers;
        const texts = language.getLang(lang);
        let returnObject = [];

        var lat = request.param('lat');
        var long = request.param('long');

        let url = config.ndvi_domain + "/service/deforestation/modist?id=MOD13Q1_NDVI" + "&longitude=" + Number(long) + "&latitude=" + Number(lat) + "&mode=series";

        try {
            let responseReq = await rp({ url: url });

            let bd = JSON.parse(responseReq);

            for (let index = 0; index < bd.values.length; index++) {
                returnObject.push({
                    date: bd.values[index][0],
                    ndvi_original: bd.values[index][1],
                    ndvi_wiener: bd.values[index][2],
                    ndvi_golay: bd.values[index][3]
                })
            }

            response.send(returnObject)
            response.end();
        } catch (e) {
            console.log(e)
        }
    }

    return Controller;
}