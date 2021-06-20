const { PrismaClient } = require('@prisma/client');
const CryptoJS = require("crypto-js");

module.exports = function (app) {
    let Controller = {}
    let _language = app.util.language;
    const prisma   = app.repository.prisma;

    Controller.getUserByID = async function (request, response) {

        const { id } = request.params;
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
                    organization: true,
                    theme: true,
                    language: true,
                },
                where: {
                    id: parseInt(id),
                },
            });
            response.json(us)
        } catch (e) {
            console.error(e)
        }
    }

    Controller.getAllUsers = async function (request, response) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    organization: true,
                    theme: true,
                    language: true,
                },
            })
            response.json(users)
        } catch (e) {
            console.error(e)
        }

    }

    Controller.updateUser = async function (request, response) {
        const { id } = request.params
        const { name, email, password, city, state, country, geeKey, organization, language, theme } = request.body
        let { lang } = request.headers;
        const texts = _language.getLang(lang);
        try {
            let arrayQueries = [];

            let data = {
                name: name,
                email: email != null ? email : undefined,
                city: city != null ? city : undefined,
                state: state != null ? state : undefined,
                country: country != null ? country : undefined,
                geeKey: geeKey != null ? geeKey : undefined,
                language: language != null ? language : undefined,
                theme: theme != null ? theme : undefined,
            };

            if (organization.id != null) {
                data['organization'] = { connect: { id: parseInt(organization.id)} };
            }

            if (password) {
                const hash = CryptoJS.MD5(password).toString();
                data['password'] = hash;
                arrayQueries.push(prisma.user.update({
                    where: { id: parseInt(id) },
                    data: data
                }))
            } else {
                arrayQueries.push(prisma.user.update({
                    where: { id: parseInt(id) },
                    data: data
                }))
            }

            const resultQueries = await prisma.$transaction(arrayQueries)

            response.status(200).json(resultQueries);
        } catch (e) {
            console.error(e)
            response.status(500).json({ message: texts.login_msg_erro + e + '.' });
        }
    }

    Controller.deleteUser = async function (request, response) {
        const {
            id
        } = request.params
        let {
            lang
        } = request.headers;
        const texts = _language.getLang(lang);
        try {

            const users = await prisma.user.delete({
                where: {
                    id: parseInt(id)
                },
            })

            response.status(200).json(users);
        } catch (e) {
            console.error(e)
            response.status(500).json({
                message: texts.login_msg_erro + e + '.'
            });
        }
    }

    return Controller;
}