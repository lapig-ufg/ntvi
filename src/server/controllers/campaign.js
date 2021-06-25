import { Landsat, Sentinel } from "../libs";

import Queue from '../libs/Queue';
const rp = require("request-promise");

module.exports = function (app) {
    let Controller = {}
    let language   = app.util.language;
    const array    = app.util.array;
    const prisma   = app.repository.prisma;

    Controller.createCampaignInfoForm = async function (request, response) {
        const { name, description, organization, numInspectors, country, permission } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        let id = request.body.hasOwnProperty('id') ? request.body.id : null;
        let _campaign = null;
        try {
            if(id){
                _campaign = await prisma.campaign.update({
                    where: { id: parseInt(id) },
                    data: {
                        name: name, description: description, organization: { connect: { id: parseInt(organization) } }, numInspectors: numInspectors, country:country
                    },
                })
            } else {
                _campaign = await prisma.campaign.create({
                    data: {
                        name: name, description: description, organization: { connect: { id: parseInt(organization) } }, numInspectors: numInspectors, country:country,
                        UsersOnCampaigns: { create: { user: { connect: { id: parseInt(permission.userId) } }, typeUserInCampaign: permission.typeUserInCampaign } }
                    },
                })
            }

            response.status(200).json(_campaign);
        } catch (e) {
            console.error(e)
            response.status(500).json({ error: true, message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.updateCampaignInfoForm = async function (request, response) {
        const { id } = request.params
        const { name, description, organization, numInspectors, country, permisson } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            const _campaign = await prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    name: name, description: description, organization: { connect: { id: parseInt(organization) } }, numInspectors: numInspectors, country:country,
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

            arrayQueries.push(prisma.composition.deleteMany({
                where: { campaign: { id: parseInt(id) }},
            }))

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: { classes: { set: [] }},
                include: { classes: true}
            }))

            for (let obj of compositions) {
                arrayQueries.push(prisma.composition.create({
                    data: {
                        colors: obj.colors,
                        satellite: { connect: { id: obj.satellite } },
                        campaign: { connect: { id: parseInt(id) } }
                    }
                }))
            }

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    initialDate: initialDate, finalDate: finalDate,
                    classes: { connect: classes },
                },
                include: { classes: true, compositions: true }
            }))
            const resultQueries = await prisma.$transaction(arrayQueries)
            await Queue.add('UpsertCampaign', resultQueries[resultQueries.length - 1] )
            response.status(200).json({status:200, message: 'success' });
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

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: { classes: { set: [] }},
                include: { classes: true}
            }))

            for (let obj of compositions) {
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
                },
                include: { classes: true, compositions: true }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)
            await Queue.add('UpsertCampaign', resultQueries[resultQueries.length - 1] )
            response.status(200).json({status:200, message: 'success' });
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.pointsWithoutInfo = function (points) {
        let pts = [];
        if (Array.isArray(points)){
            points.forEach(function(pt){
                if (pt.info === '' || pt.info === ' - ' ){
                    pts.push(pt)
                }
            });
        }
        return pts;
    }

    Controller.createPointsForm = async function (request, response) {
        const { id } = request.params
        const { points } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = []

            arrayQueries.push(prisma.point.deleteMany({
                where: { campaignId: parseInt(id) },
            }))

            for (let objPoint of points) {
                delete objPoint.id
                delete objPoint.campaignId
                delete objPoint.updatedAt
                delete objPoint.createdAt
            }

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    points: { createMany: {
                        data: points
                    } },
                },
                select: { id: true, name:true, country: true, points: true, UsersOnCampaigns: { select : {typeUserInCampaign:true, user: {select:{geeKey:true}}}} }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)

            //Create jobs for add points to mongo
            await Queue.add('UpsertPoints',
                {
                    campaign:{ id: resultQueries[1].id, name: resultQueries[1].name,  country: resultQueries[1].country, UsersOnCampaigns: resultQueries[1].UsersOnCampaigns},
                    points: resultQueries[1].points
                }
            )

            //Create jobs for add points serach info of points on Google Earth Engine
            const pointsWithoutInfo =  Controller.pointsWithoutInfo(resultQueries[1].points)
            if(pointsWithoutInfo.length > 0){
                const arraySplited = array.split(pointsWithoutInfo, 100)
                for (let points of arraySplited) {
                    await Queue.add('SearchPointsInformation',
                        {
                            campaign:{ id: resultQueries[1].id, country: resultQueries[1].country, UsersOnCampaigns: resultQueries[1].UsersOnCampaigns },
                            points: points
                        }
                    )
                }
            }
            response.status(200).json({status:200, message: 'success' });
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

            arrayQueries.push(prisma.point.deleteMany({
                where: { campaignId: parseInt(id) }
            }))

            for (let objPoint of points) {
                delete objPoint.id
                delete objPoint.campaignId
                delete objPoint.updatedAt
                delete objPoint.createdAt
            }

            arrayQueries.push(prisma.campaign.update({
                where: { id: parseInt(id) },
                data: {
                    points: { createMany: {
                            data: points
                        } },
                },
                select: { id: true, name:true, country: true, points: true, UsersOnCampaigns: { select : {typeUserInCampaign:true, user: {select:{geeKey:true}}}} }
            }))

            const resultQueries = await prisma.$transaction(arrayQueries)
            const pointsWithoutInfo =  Controller.pointsWithoutInfo(resultQueries[1].points)

            await Queue.add('UpsertPoints',
                {
                    campaign: { id: resultQueries[1].id, name: resultQueries[1].name,  country: resultQueries[1].country, UsersOnCampaigns: resultQueries[1].UsersOnCampaigns },
                    points: resultQueries[1].points
                }
            )

            //Create jobs for add points serach info of points on Google Earth Engine
            if(pointsWithoutInfo.length > 0){
                const arraySplited = array.split(pointsWithoutInfo, 100)
                for (let points of arraySplited) {
                    await Queue.add('SearchPointsInformation',
                        {
                            campaign:{ id: resultQueries[1].id, country: resultQueries[1].country, UsersOnCampaigns: resultQueries[1].UsersOnCampaigns },
                            points: points
                        }
                    )
                }
            }
            response.status(200).json({status:200, message: 'success' });
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
                // delete obj.userId
                obj.campaign = parseInt(id)

                newVet.push({
                    user: {
                        connect: { id: parseInt(obj.userId)  }
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
        const { UsersOnCampaigns } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = []

            let newVet = []

            arrayQueries.push(prisma.campaign.update({
                where: {
                    id: parseInt(id),
                },
                data: {
                    UsersOnCampaigns: {
                        deleteMany: {
                            campaignId: parseInt(id),
                        },
                    },
                },
            }))

            for (let obj of UsersOnCampaigns) {
                obj.user = obj.user.id
                // delete obj.userId
                obj.campaign = parseInt(id)

                newVet.push({
                    user: {
                        connect: { id: parseInt(obj.userId)  }
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
                },
                select: { id: true, name:true, initialDate: true, finalDate:true, compositions: true, country: true, UsersOnCampaigns: { select : {typeUserInCampaign:true, user: {select:{geeKey:true}}}} }
            });

            await Queue.add('InitCache', campaign)

            response.status(200).json({status:200, message: 'success' });
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

    Controller.getThumbsBySatellites = function (campaign) {
        let promises = [];
        campaign.compositions.forEach(comp => {
            if(parseInt(comp.satelliteId) === 1){
                promises.push(new Promise((resolve, reject) => {
                    const landsat = new Landsat(campaign);
                    landsat.run(function (){
                        landsat.getThumbURL().then(thumb => {
                            console.log(comp)
                            resolve({satelliteId: 1, title: comp.satellite.name, url: thumb })
                        })
                    },  (err) => {
                        reject(new Error(err))
                        landsat.ee.reset();
                    },  (err) => {
                        reject(new Error(err))
                        landsat.ee.reset();
                    });
                }));
            } else {
                promises.push(new Promise((resolve, reject) => {
                    const sentinel = new Sentinel(campaign);

                    sentinel.run(function (){

                        sentinel.getThumbURL().then(thumb => {
                            resolve({satelliteId: 2, title: comp.satellite.name, url: thumb })
                        })
                    },  (err) => {
                        reject(new Error(err))
                        sentinel.ee.reset();
                    },  (err) => {
                        reject(new Error(err))
                        sentinel.ee.reset();
                    });
                }));
            }
        })
        return promises;
    }

    Controller.getThumbs = async function (request, response) {
        const {id,  compositions } = request.body
        try {
            prisma.campaign.findUnique({
                select: { id: true, name:true, initialDate: true, finalDate:true, compositions: true, country: true, UsersOnCampaigns: { select : {typeUserInCampaign:true, user: {select:{geeKey:true}}}} },
                where: {id: parseInt(id)},
            }).then(campaign => {

                campaign['compositions'] = compositions;

                let thumbs = Promise.all(Controller.getThumbsBySatellites(campaign));

                thumbs.then(resul => {
                    response.status(200).json(resul);
                })
            });

        } catch (e) {
            console.error(e)
            response.status(500).json({ message: e});
        }
    }

    return Controller;
}