const { PrismaClient } = require('@prisma/client')

module.exports = function (app) {
    var Controller = {}

    const prisma = new PrismaClient()

    Controller.getUserByID = async function (request, response) {

        var id = request.param('id')
        // const { id } = request.params
        try {
            const user = await prisma.user.findUnique({
                select: {
                    id: true,
                    name: true,
                    organization:true
                },
                where: {
                    id: parseInt(id),
                },
            });
            response.json(user)
        }catch (e) {
            console.error(e)
        }
    }

    Controller.getAllUsers = async function (request, response) {
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

    return Controller;
}