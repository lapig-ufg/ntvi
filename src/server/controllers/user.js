const { PrismaClient } = require('@prisma/client');
const CryptoJS = require("crypto-js");

module.exports = function (app) {
    var Controller = {}
    let language = app.util.language;
    const prisma = new PrismaClient()

    Controller.getUserByID = async function (request, response) {

        const {id} = request.params;
        // const { id } = request.params
        try {
            const us = await prisma.user.findUnique({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    city: true,
                    state: true,
                    country: true,
                    geeKey: true,
                    typeUser: true,
                    picture: true,
                    organization:true,
                },
                where: {
                    id: parseInt(id),
                },
            });
            response.json(us)
        }catch (e) {
            console.error(e)
        }
    }

    Controller.getAllUsers = async function (request, response) {
        console.log('passei')
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    organization:true
                },
            })
            response.json(users)
        }catch (e) {
            console.error(e)
        }

    }

    Controller.updateUser = async function (request, response) {
        const { id } = request.params
        const { name, email, password, city, state, country, geeKey, organization } = request.body
        let { lang } = request.headers;
        const texts = language.getLang(lang);

        try {
            let arrayQueries = [];

            if(password){
                const hash = CryptoJS.MD5(password).toString();

                arrayQueries.push(prisma.user.update({
                    where: { id: parseInt(id) },
                    data: {
                        name: name,
                        email: email != null ? email : undefined,
                        password: hash,
                        city: city != null ? email : undefined,
                        state: state != null ? state : undefined,
                        country: country != null ? country : undefined,
                        geeKey: geeKey != null ? geeKey : undefined,
                        organization: { connect: {id: parseInt(organization)} },
                    }
                }))
            }else{
                arrayQueries.push(prisma.user.update({
                    where: { id: parseInt(id) },
                    data: {
                        name: name,
                        email: email != null ? email : undefined,
                        city: city != null ? email : undefined,
                        state: state != null ? state : undefined,
                        country: country != null ? country : undefined,
                        geeKey: geeKey != null ? geeKey : undefined,
                        organization: { connect: {id: parseInt(organization)} },
                    }
                }))
            }

            const resultQueries = await prisma.$transaction(arrayQueries)

            response.status(200).json(resultQueries);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    return Controller;
}